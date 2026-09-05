import { describe, expect, it } from "vitest";
import { assigntasktab, callentries, captureentries, channelentries, controlentries, downloadentries, downloadshare, emptyprogress, environmentof, evententries, exchangeentries, extractionentries, extractionshare, fetchretryentries, iscomplete, mediaentries, naventries, pairentries, pollentries, recordcapture, recordcall, recordchannel, recorddownload, recordevent, recordenvironment, recordexchange, recordextraction, recordfetchretry, recordmedia, recordnaventry, recordoutcome, recordpair, recordpoll, recordcdp, recordcontrol, recordstep, recordtimeline, recordturnaround, recordupload, recordwatchcompletion, recordwizardstep, releasetasktab, resetforplan, tasktabs, timelineevidences, turnaroundof, uploadentries, watchclosed, wizardcompletion, cdpevidences , profileevidences, recordprofile, emulationevidences, recordemulation, recordtoolcall, toolcallevidences, recorddenied, deniedevidences, recordrevocation, revocationevidences } from "../progress.js";
import type { agentplan, shotpair, shotrecord } from "../types.js";

const now = 1_800_000_000_000;
const plan: agentplan = { id: "plan", objective: "Finish the review", origin: "https://example.com", steps: [
  { id: "one", kind: "observe", summary: "Observe the page.", risk: "read" },
  { id: "two", kind: "click", target: "#submit", summary: "Click submit.", risk: "sensitive" },
], createdat: now, expiresat: now + 1000, state: "approved" };

describe("plan progress", () => {
  it("starts empty and records reviewed steps without duplication", () => {
    const empty = emptyprogress("plan", now);
    expect(empty.completedsteps).toEqual([]);
    const first = recordstep(empty, "plan", "one", now);
    expect(first.completedsteps).toEqual(["one"]);
    const repeated = recordstep(first, "plan", "one", now + 5);
    expect(repeated.completedsteps).toEqual(["one"]);
    expect(repeated.updatedat).toBe(now + 5);
  });

  it("starts fresh tracking when recorded progress belongs to a different plan", () => {
    const foreign = { planid: "other", completedsteps: ["one", "two"], updatedat: now };
    const fresh = recordstep(foreign, "plan", "one", now);
    expect(fresh.planid).toBe("plan");
    expect(fresh.completedsteps).toEqual(["one"]);
    expect(iscomplete(foreign, plan)).toBe(false);
  });

  it("marks completion only after every reviewed step executed", () => {
    const partial = recordstep(emptyprogress("plan", now), "plan", "one", now);
    expect(iscomplete(partial, plan)).toBe(false);
    const complete = recordstep(partial, "plan", "two", now + 10);
    expect(iscomplete(complete, plan)).toBe(true);
    expect(iscomplete(undefined, plan)).toBe(false);
  });

  it("records structured outcomes beside completions without truncation", () => {
    let progress = recordstep(emptyprogress("plan", now), "plan", "one", now);
    progress = recordoutcome(progress, "plan", { stepid: "one", ok: true, summary: "Observe completed.", details: { textlength: 42 }, at: now + 1 }, now + 1);
    progress = recordoutcome(progress, "plan", { stepid: "one", ok: false, summary: "Second attempt failed.", at: now + 2 }, now + 2);
    expect(progress.outcomes).toHaveLength(2);
    expect(progress.outcomes?.[0]?.details?.textlength).toBe(42);
    expect(progress.completedsteps).toEqual(["one"]);
  });

  it("records verifyvisible and verifyenabled outcomes as step evidence", () => {
    let progress = recordstep(emptyprogress("plan", now), "plan", "one", now);
    progress = recordoutcome(progress, "plan", { stepid: "one", ok: true, summary: "Target is rendered at 10,20 with size 300x40.", details: { visible: true, geometry: { x: 10, y: 20, width: 300, height: 40 } }, at: now + 1 }, now + 1);
    progress = recordoutcome(progress, "plan", { stepid: "two", ok: false, summary: "Target is disabled.", details: { enabled: false, disabled: true, readonly: false }, at: now + 2 }, now + 2);
    expect(progress.outcomes).toHaveLength(2);
    expect(progress.outcomes?.[0]?.details?.visible).toBe(true);
    expect(progress.outcomes?.[1]?.details?.disabled).toBe(true);
    const failed = progress.outcomes?.find(outcome => !outcome.ok);
    expect(failed?.summary).toBe("Target is disabled.");
  });

  it("resets tracked progress when a new plan replaces the tracked one and preserves history", () => {
    const previous = recordoutcome(recordstep(emptyprogress("old", now), "old", "one", now), "old", { stepid: "one", ok: true, summary: "Old step done.", at: now }, now);
    const reset = resetforplan(previous, plan, now);
    expect(reset.planid).toBe("plan");
    expect(reset.completedsteps).toEqual([]);
    expect(reset.prior?.[0]?.planid).toBe("old");
    expect(reset.prior?.[0]?.completedsteps).toEqual(["one"]);
    const kept = resetforplan(recordstep(emptyprogress("plan", now), "plan", "one", now), plan, now);
    expect(kept.completedsteps).toEqual(["one"]);
    expect(kept.prior).toBeUndefined();
  });

  it("counts watch steps as completed only when their reviewed lifetime window closes", () => {
    expect(watchclosed(1000, 2500, 3499)).toBe(false);
    expect(watchclosed(1000, 2500, 3500)).toBe(true);
    expect(watchclosed(1000, 2500, 9000)).toBe(true);
    let progress = recordwatchcompletion(emptyprogress("plan", now), "plan", "two", 1000, 2500, 2000);
    expect(progress.completedsteps).toEqual([]);
    progress = recordwatchcompletion(progress, "plan", "two", 1000, 2500, 3500);
    expect(progress.completedsteps).toEqual(["two"]);
    const repeated = recordwatchcompletion(progress, "plan", "two", 1000, 2500, 9000);
    expect(repeated.completedsteps).toEqual(["two"]);
    expect(recordwatchcompletion(undefined, "plan", "two", 1000, 2500, 3500).completedsteps).toEqual(["two"]);
  });

  it("records each navlist entry as it completes and reads the entries back", () => {
    let progress = emptyprogress("plan", now);
    progress = recordnaventry(progress, "plan", "list", { index: 0, url: "https://example.com/a", ok: true }, now + 100);
    progress = recordnaventry(progress, "plan", "list", { index: 1, url: "https://example.com/b", ok: true }, now + 200);
    progress = recordnaventry(progress, "plan", "list", { index: 2, url: "https://stranger.example/c", ok: false }, now + 300);
    expect(progress.outcomes).toHaveLength(3);
    expect(progress.completedsteps).toEqual([]);
    const entries = naventries(progress, "plan", "list");
    expect(entries).toHaveLength(3);
    expect(entries[0]).toMatchObject({ index: 0, url: "https://example.com/a", ok: true });
    expect(entries[2]).toMatchObject({ index: 2, url: "https://stranger.example/c", ok: false });
    expect(naventries(progress, "plan", "other")).toEqual([]);
    expect(naventries(undefined, "plan", "list")).toEqual([]);
    expect(naventries(recordstep(progress, "plan", "one", now), "plan", "one")).toEqual([]);
  });
});

describe("plan progress task tabs", () => {
  it("assigns and releases task tabs so progress tracks work across its tabs", () => {
    const first = assigntasktab(undefined, "plan", 4, now);
    expect(first.tasktabs).toEqual([4]);
    const second = assigntasktab(first, "plan", 5, now + 1);
    expect(second.tasktabs).toEqual([4, 5]);
    expect(assigntasktab(second, "plan", 4, now + 2).tasktabs).toEqual([4, 5]);
    const released = releasetasktab(second, "plan", 4, now + 3);
    expect(released.tasktabs).toEqual([5]);
    expect(releasetasktab(released, "plan", 5, now + 4).tasktabs).toBeUndefined();
    expect(tasktabs(released, "plan")).toEqual([5]);
    expect(tasktabs(released, "other")).toEqual([]);
    expect(tasktabs(undefined, "plan")).toEqual([]);
  });

  it("keeps task tabs tracked only for the running plan", () => {
    const tracked = assigntasktab({ planid: "other", completedsteps: ["one"], tasktabs: [9], updatedat: now }, "plan", 4, now);
    expect(tracked.planid).toBe("plan");
    expect(tracked.tasktabs).toEqual([4]);
    expect(tracked.completedsteps).toEqual([]);
  });

  it("tracks extraction progress as rows collected over the estimated total and records page outcomes", () => {
    expect(extractionshare(50, 200)).toBeCloseTo(0.25);
    expect(extractionshare(400, 200)).toBe(1);
    expect(extractionshare(-5, 200)).toBe(0);
    expect(extractionshare(50, 0)).toBe(0);
    let tracked = recordextraction(emptyprogress("plan", now), "plan", "extract", { page: 1, rows: 10, cursor: 1 }, now);
    tracked = recordextraction(tracked, "plan", "extract", { page: 2, rows: 15, cursor: 2 }, now + 1);
    expect(extractionentries(tracked, "plan", "extract")).toEqual([{ page: 1, rows: 10, cursor: 1 }, { page: 2, rows: 15, cursor: 2 }]);
    expect(extractionentries(tracked, "other", "extract")).toEqual([]);
    expect(tracked.outcomes?.[0]).toMatchObject({ stepid: "extract", ok: true, details: { extraction: { page: 1, rows: 10 } } });
  });

  it("tracks wizard completion as executed steps over total steps", () => {
    const state = { index: 2, steps: 3, completed: [true, true, false], at: now };
    expect(wizardcompletion(state)).toBeCloseTo(2 / 3);
    expect(wizardcompletion({ index: 3, steps: 3, completed: [true, true, true], at: now })).toBe(1);
    expect(wizardcompletion({ index: 0, steps: 0, completed: [], at: now })).toBe(0);
    const tracked = recordwizardstep(emptyprogress("plan", now), "plan", "wizard", state, now);
    expect(tracked.outcomes?.[0]).toMatchObject({ stepid: "wizard", ok: false, details: { wizard: { index: 2, steps: 3 } } });
    const finished = recordwizardstep(tracked, "plan", "wizard", { index: 3, steps: 3, completed: [true, true, true], at: now + 1 }, now + 1);
    expect(finished.outcomes?.[1]).toMatchObject({ stepid: "wizard", ok: true });
  });
});

describe("batch download progress", () => {
  it("tracks batch downloads as files completed over total and records per file outcomes", () => {
    expect(downloadshare(3, 10)).toBeCloseTo(0.3);
    expect(downloadshare(10, 10)).toBe(1);
    expect(downloadshare(12, 10)).toBe(1);
    expect(downloadshare(-1, 10)).toBe(0);
    expect(downloadshare(5, 0)).toBe(0);
    let tracked = recorddownload(emptyprogress("plan", now), "plan", "batch", { index: 0, url: "https://example.com/a.pdf", state: "complete" }, now);
    tracked = recorddownload(tracked, "plan", "batch", { index: 1, url: "https://example.com/b.zip", state: "failed" }, now + 1);
    expect(downloadentries(tracked, "plan", "batch")).toEqual([
      { index: 0, url: "https://example.com/a.pdf", state: "complete" },
      { index: 1, url: "https://example.com/b.zip", state: "failed" },
    ]);
    expect(downloadentries(tracked, "plan", "other")).toEqual([]);
    expect(downloadentries(tracked, "other", "batch")).toEqual([]);
    expect(tracked.outcomes?.[0]).toMatchObject({ stepid: "batch", ok: true, details: { download: { index: 0, state: "complete" } } });
    expect(tracked.outcomes?.[1]).toMatchObject({ stepid: "batch", ok: false, details: { download: { index: 1, state: "failed" } } });
  });
});

describe("capture progress", () => {
  const now = 1_800_000_000_000;

  it("records capture completions and shotpair ids as reviewable evidence", () => {
    const capture: shotrecord = { id: "cap-1", runid: "plan", stepid: "shot", kind: "shotview", format: "png", width: 1280, height: 800, capturedat: now, bytes: "data:image/png;base64,xyz" };
    let tracked = recordcapture(emptyprogress("plan", now), "plan", "shot", capture, now);
    tracked = recordcapture(tracked, "plan", "shot", { ...capture, id: "cap-2", kind: "shotfullpage", width: 1280, height: 3200 }, now + 1);
    expect(captureentries(tracked, "plan", "shot")).toEqual([
      { id: "cap-1", kind: "shotview", format: "png", width: 1280, height: 800, bytes: 25 },
      { id: "cap-2", kind: "shotfullpage", format: "png", width: 1280, height: 3200, bytes: 25 },
    ]);
    expect(captureentries(tracked, "plan", "other")).toEqual([]);
    expect(captureentries(tracked, "other", "shot")).toEqual([]);
    expect(tracked.outcomes?.[0]).toMatchObject({ stepid: "shot", ok: true, details: { capture: { id: "cap-1", bytes: 25 } } });
    const pair: shotpair = { id: "pair-1", beforeid: "cap-1", afterid: "cap-2", actionkind: "click", target: "#submit", domsnapshotid: "7", at: now + 2 };
    tracked = recordpair(tracked, "plan", "click", pair, now + 2);
    expect(pairentries(tracked, "plan", "click")).toEqual([{ id: "pair-1", beforeid: "cap-1", afterid: "cap-2", actionkind: "click", target: "#submit", domsnapshotid: "7" }]);
    expect(pairentries(tracked, "plan", "shot")).toEqual([]);
    expect(tracked.outcomes?.[2]).toMatchObject({ stepid: "click", ok: true, details: { shotpair: { beforeid: "cap-1", afterid: "cap-2" } } });
  });
});

describe("media progress", () => {
  const now = 1_800_000_000_000;

  it("records media capture completions with kind, scope and byte size as reviewable evidence", () => {
    let tracked = recordmedia(emptyprogress("plan", now), "plan", "pdf-1", { id: "pdf-1", kind: "pdf", scope: "tab", bytes: 4200 }, now);
    tracked = recordmedia(tracked, "plan", "rec-1", { id: "rec-1", kind: "recording", scope: "run", bytes: 300 }, now + 1);
    tracked = recordmedia(tracked, "plan", "img-1", { id: "batch-1", kind: "images", scope: "main img", bytes: 1200 }, now + 2);
    expect(mediaentries(tracked, "plan", "pdf-1")).toEqual([{ id: "pdf-1", kind: "pdf", scope: "tab", bytes: 4200 }]);
    expect(mediaentries(tracked, "plan", "rec-1")).toEqual([{ id: "rec-1", kind: "recording", scope: "run", bytes: 300 }]);
    expect(mediaentries(tracked, "plan", "img-1")).toEqual([{ id: "batch-1", kind: "images", scope: "main img", bytes: 1200 }]);
    expect(mediaentries(tracked, "plan", "other")).toEqual([]);
    expect(mediaentries(tracked, "other", "pdf-1")).toEqual([]);
    expect(tracked.outcomes?.[0]).toMatchObject({ stepid: "pdf-1", ok: true, details: { media: { kind: "pdf", bytes: 4200 } } });
    expect(tracked.outcomes?.[1]?.summary).toContain("recording media record of run scope");
  });
});

describe("network observation progress", () => {
  it("records outbound call completions with transport facts as reviewable evidence", () => {
    let progress = emptyprogress("plan-1", 1);
    progress = recordcall(progress, "plan-1", "f1", { id: "c1", kind: "rest", origin: "https://api.example", method: "POST", status: 201, statusclass: "success", duration: 340, retries: 1, bytes: 512 }, 2);
    progress = recordcall(progress, "plan-1", "f1", { id: "c2", kind: "fetch", origin: "https://api.example", method: "GET", status: 503, statusclass: "servererror", duration: 40, retries: 0, bytes: 0 }, 3);
    const entries = callentries(progress, "plan-1", "f1");
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ id: "c1", statusclass: "success", retries: 1 });
    expect(entries[1]).toMatchObject({ id: "c2", statusclass: "servererror" });
    expect(callentries(progress, "plan-1", "other")).toHaveLength(0);
    expect(callentries(progress, "plan-2", "f1")).toHaveLength(0);
  });

  it("records fetch retries as progress so the panel reports fetch progress on each retry", () => {
    let progress = emptyprogress("plan-1", 1);
    progress = recordfetchretry(progress, "plan-1", "f1", { attempt: 1, url: "https://api.example/data", wait: 100, reason: "network down" }, 2);
    progress = recordfetchretry(progress, "plan-1", "f1", { attempt: 2, url: "https://api.example/data", wait: 200, reason: "timed out" }, 3);
    const retries = fetchretryentries(progress, "plan-1", "f1");
    expect(retries).toHaveLength(2);
    expect(retries[0]).toMatchObject({ attempt: 1, wait: 100, reason: "network down" });
    expect(retries[1]).toMatchObject({ attempt: 2, wait: 200 });
    expect(fetchretryentries(progress, "plan-1", "missing")).toHaveLength(0);
  });
});

describe("network observation part two progress", () => {
  const now = 1_800_000_000_000;

  it("records channel lifecycle transitions with message counters", () => {
    let progress = emptyprogress("plan1", now);
    progress = recordchannel(progress, "plan1", "s1", { id: "ch1", kind: "websocket", state: "open", url: "wss://api.example/live", sent: 2, received: 5 }, now + 10);
    progress = recordchannel(progress, "plan1", "s1", { id: "ch1", kind: "websocket", state: "closed", url: "wss://api.example/live", sent: 2, received: 7 }, now + 20);
    const entries = channelentries(progress, "plan1", "s1");
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ id: "ch1", state: "open", sent: 2, received: 5 });
    expect(entries[1]?.state).toBe("closed");
    expect((progress.outcomes ?? [])[0]?.ok).toBe(true);
    expect(channelentries(progress, "other", "s1")).toHaveLength(0);
  });

  it("records observed exchanges with correlation ids and error classes", () => {
    let progress = emptyprogress("plan1", now);
    progress = recordexchange(progress, "plan1", "s1", { id: "e1", correlationid: "run-1", method: "GET", origin: "https://api.example", url: "https://api.example/items", status: 200, statusclass: "success", duration: 42, bytes: 128 }, now);
    progress = recordexchange(progress, "plan1", "s1", { id: "e2", correlationid: "run-2", method: "GET", origin: "https://api.example", url: "https://api.example/gone", status: 0, statusclass: "unknown", duration: 30, bytes: 0, errorclass: "networkerror" }, now);
    const entries = exchangeentries(progress, "plan1", "s1");
    expect(entries).toHaveLength(2);
    expect(entries[0]?.correlationid).toBe("run-1");
    expect((progress.outcomes ?? [])[0]?.ok).toBe(true);
    expect((progress.outcomes ?? [])[1]?.ok).toBe(false);
    expect((progress.outcomes ?? [])[1]?.summary).toContain("networkerror");
  });

  it("records event stream observations and long poll iterations", () => {
    let progress = emptyprogress("plan1", now);
    progress = recordevent(progress, "plan1", "s1", { url: "https://api.example/stream", name: "userjoin", events: 9, lasteventid: "41" }, now);
    expect(evententries(progress, "plan1", "s1")[0]).toMatchObject({ name: "userjoin", events: 9, lasteventid: "41" });
    progress = recordpoll(progress, "plan1", "s2", { poll: 1, cursor: "7", status: 200, stopped: false, reason: "The long poll loop continues." }, now);
    progress = recordpoll(progress, "plan1", "s2", { poll: 2, status: 200, stopped: true, reason: "The stop condition matched done yes." }, now + 100);
    const polls = pollentries(progress, "plan1", "s2");
    expect(polls).toHaveLength(2);
    expect(polls[0]).toMatchObject({ poll: 1, cursor: "7", stopped: false });
    expect(polls[1]?.stopped).toBe(true);
    expect(polls[1]?.reason).toContain("stop condition");
    expect(pollentries(progress, "plan1", "s1")).toHaveLength(0);
  });
});

describe("network control progress", () => {
  const now = 1_800_000_000_000;

  it("records traffic control evidence with applied, blocked, mocked and reverted counts", () => {
    let progress = emptyprogress("plan1", now);
    progress = recordcontrol(progress, "plan1", "s1", { applied: 2, blocked: 3, mocked: 1, reverts: 0, reason: "The block rules registered" }, now + 10);
    progress = recordcontrol(progress, "plan1", "s1", { applied: 0, blocked: 3, mocked: 1, reverts: 2, reason: "The traffic rules reverted at run end" }, now + 20);
    const entries = controlentries(progress, "plan1", "s1");
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ applied: 2, blocked: 3 });
    expect(entries[1]?.reverts).toBe(2);
    expect((progress.outcomes ?? [])[1]?.summary).toContain("reverted");
    expect(controlentries(progress, "other", "s1")).toHaveLength(0);
  });

  it("records multipart upload progress chunk by chunk", () => {
    let progress = emptyprogress("plan1", now);
    progress = recordupload(progress, "plan1", "s2", { chunk: 1, chunks: 3, uploaded: 40, bytes: 120 }, now);
    progress = recordupload(progress, "plan1", "s2", { chunk: 3, chunks: 3, uploaded: 120, bytes: 120 }, now + 5);
    const entries = uploadentries(progress, "plan1", "s2");
    expect(entries).toHaveLength(2);
    expect(entries[1]).toMatchObject({ chunk: 3, chunks: 3, uploaded: 120 });
    expect((progress.outcomes ?? [])[0]?.ok).toBe(true);
  });
});

describe("run timeline progress", () => {
  it("records timeline capture evidence with entry, error, rejection and long task counts", () => {
    const now = 1_800_000_000_000;
    let progress = recordtimeline(undefined, "plan1", "s1", { entries: 12, collapsed: 4, errors: 2, rejections: 1, longtasks: 3 }, now);
    progress = recordtimeline(progress, "plan1", "s1", { entries: 5, collapsed: 0, errors: 1, rejections: 0, longtasks: 1 }, now + 5);
    const entries = timelineevidences(progress, "plan1", "s1");
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ entries: 12, collapsed: 4, errors: 2, rejections: 1, longtasks: 3 });
    expect(entries[1]).toMatchObject({ entries: 5, errors: 1 });
    expect((progress.outcomes ?? [])[0]?.ok).toBe(true);
    expect(timelineevidences(progress, "plan1", "s2")).toEqual([]);
  });
});

describe("devtools protocol progress", () => {
  it("records cdp evidence with the family, method, domain, duration and error class", () => {
    const now = 1_800_000_000_000;
    let progress = recordcdp(undefined, "plan1", "a1", { family: "attach", domains: 2 }, now);
    progress = recordcdp(progress, "plan1", "c1", { family: "command", method: "Runtime.evaluate", domain: "Runtime", duration: 12 }, now + 1);
    progress = recordcdp(progress, "plan1", "c2", { family: "command", method: "DOM.getSnapshot", domain: "DOM", duration: 4, errorclass: "uninstrumented" }, now + 2);
    progress = recordcdp(progress, "plan1", "w1", { family: "watch", events: 5, domain: "Log" }, now + 3);
    progress = recordcdp(progress, "plan1", "s1", { family: "step", frames: 3 }, now + 4);
    const attachentries = cdpevidences(progress, "plan1", "a1");
    expect(attachentries).toHaveLength(1);
    expect(attachentries[0]).toMatchObject({ family: "attach", domains: 2 });
    const commands = cdpevidences(progress, "plan1", "c1");
    expect(commands[0]).toMatchObject({ family: "command", method: "Runtime.evaluate", duration: 12 });
    const failed = cdpevidences(progress, "plan1", "c2");
    expect(failed[0]?.errorclass).toBe("uninstrumented");
    expect((progress.outcomes ?? []).find(outcome => outcome.stepid === "c2")?.ok).toBe(false);
    expect((progress.outcomes ?? []).find(outcome => outcome.stepid === "c1")?.ok).toBe(true);
    expect(cdpevidences(progress, "plan1", "w1")[0]).toMatchObject({ family: "watch", events: 5 });
    expect(cdpevidences(progress, "plan1", "s1")[0]).toMatchObject({ family: "step", frames: 3 });
    expect(cdpevidences(progress, "plan1", "missing")).toEqual([]);
    expect(cdpevidences(progress, "other", "c1")).toEqual([]);
  });
});

describe("profiling progress", () => {
  const now = 1_800_000_000_000;

  it("records profiling evidence with the instrument family, the counts and the record ids", () => {
    let progress = recordprofile(undefined, "plan", "m1", { family: "flow", metrics: 4, recordids: ["f1", "f2", "f3", "f4"] }, now);
    progress = recordprofile(progress, "plan", "hs", { family: "heap", nodes: 1450, bytes: 12_000_000, recordids: ["h1"] }, now + 1);
    progress = recordprofile(progress, "plan", "tm", { family: "memory", samples: 3, flagged: 1 }, now + 2);
    const flow = profileevidences(progress, "plan", "m1");
    expect(flow).toEqual([{ family: "flow", metrics: 4, recordids: ["f1", "f2", "f3", "f4"] }]);
    const heap = profileevidences(progress, "plan", "hs");
    expect(heap[0]).toMatchObject({ family: "heap", nodes: 1450, bytes: 12_000_000 });
    expect((progress.outcomes ?? [])[2]?.summary).toContain("3 samples, 1 flagged step");
    expect(profileevidences(progress, "plan", "missing")).toEqual([]);
    expect(profileevidences(progress, "other", "m1")).toEqual([]);
  });
});

describe("emulation progress", () => {
  it("records the applied and reverted layer names of every emulation step", () => {
    let progress = recordemulation(undefined, "plan", "s1", { applied: ["phone"], reverted: [], reason: "Emulation layer applied" }, 1);
    progress = recordemulation(progress, "plan", "s2", { applied: [], reverted: ["phone", "slow3g"], reason: "Emulation reverted on run cancel" }, 2);
    expect(emulationevidences(progress, "plan", "s1")[0]?.applied).toEqual(["phone"]);
    expect(emulationevidences(progress, "plan", "s2")[0]?.reverted).toEqual(["phone", "slow3g"]);
    expect((progress.outcomes ?? [])[1]?.summary).toContain("2 reverted layers (phone, slow3g)");
    expect(emulationevidences(progress, "plan", "missing")).toEqual([]);
    expect(emulationevidences(undefined, "plan", "s1")).toEqual([]);
  });
});

describe("agent protocol progress", () => {
  it("records tool call evidence with the client, tool and outcome", () => {
    const started = emptyprogress("plan", now);
    const ran = recordtoolcall(started, "plan", "two", { clientid: "client1", tool: "browser.click", ok: true }, now + 10);
    const refused = recordtoolcall(ran, "plan", "two", { clientid: "client1", tool: "browser.readtext", ok: false, code: "consentrefused" }, now + 20);
    const entries = toolcallevidences(refused, "plan", "two");
    expect(entries).toHaveLength(2);
    expect(entries[0]?.tool).toBe("browser.click");
    expect(entries[1]?.code).toBe("consentrefused");
    const outcome = refused.outcomes?.[0];
    expect(outcome?.summary).toContain("ran behind the consent gates");
    expect(refused.outcomes?.[1]?.summary).toContain("refused");
    expect(toolcallevidences(refused, "plan", "one")).toEqual([]);
    expect(toolcallevidences(started, "otherplan", "two")).toEqual([]);
  });
});

describe("execution environment progress evidence", () => {
  it("records the environment of each completed step and the worker turnaround for later profiling", () => {
    let progress = emptyprogress("plan1", 1);
    progress = recordenvironment(progress, "plan1", "s1", "pagecontext", 2);
    progress = recordenvironment(progress, "plan1", "s2", "offscreenworker", 3);
    progress = recordturnaround(progress, "plan1", "s2", 42, 4);
    expect(environmentof(progress, "plan1", "s1")).toBe("pagecontext");
    expect(environmentof(progress, "plan1", "s2")).toBe("offscreenworker");
    expect(environmentof(progress, "plan1", "missing")).toBeUndefined();
    expect(environmentof(progress, "other", "s1")).toBeUndefined();
    expect(turnaroundof(progress, "plan1", "s2")).toBe(42);
    expect(turnaroundof(progress, "plan1", "s1")).toBeUndefined();
    const latest = recordenvironment(progress, "plan1", "s2", "pagecontext", 5);
    expect(environmentof(latest, "plan1", "s2")).toBe("pagecontext");
    expect(latest.environments?.s1).toBe("pagecontext");
  });
});

describe("security evidence", () => {
  it("records denied steps with their deny reason", () => {
    let progress = recorddenied(undefined, "plan", "two", { origin: "https://other.example", kind: "submitform", reason: "The denydefault posture refuses the origin." }, now);
    progress = recorddenied(progress, "plan", "two", { origin: "https://other.example", kind: "submitform", reason: "The fresh class consent is missing." }, now + 1);
    const denied = deniedevidences(progress, "plan", "two");
    expect(denied).toHaveLength(2);
    expect(denied[0]?.origin).toBe("https://other.example");
    expect(denied[1]?.reason).toMatch(/fresh class consent/i);
    expect((progress.outcomes ?? []).every(outcome => outcome.ok === false)).toBe(true);
    expect(deniedevidences(progress, "plan", "one")).toEqual([]);
  });

  it("records revoked runs as halted with the revoked step", () => {
    const progress = recordrevocation(undefined, "plan", "two", { haltedstepids: ["two", "three"], revokedstepid: "two", reason: "The user revoked the consent mid run." }, now);
    const revoked = revocationevidences(progress, "plan", "two");
    expect(revoked).toHaveLength(1);
    expect(revoked[0]?.haltedstepids).toEqual(["two", "three"]);
    expect(revoked[0]?.revokedstepid).toBe("two");
    expect((progress.outcomes ?? [])[0]?.summary).toMatch(/halted at the step two/i);
    expect(revocationevidences(progress, "plan", "one")).toEqual([]);
  });
});

import { gatewaitof, recordgatewait } from "../progress.js";

describe("progress gate waits", () => {
  it("records the gate wait of one gated step beside its step durations", () => {
    const wait = { gateid: "gate", kind: "confirmpay", openedat: now, resolvedat: now + 1500, waitedms: 1500 };
    const progress = recordgatewait(undefined, "plan", "paystep", wait, now + 1500);
    expect(gatewaitof(progress, "plan", "paystep")).toEqual(wait);
    expect(gatewaitof(progress, "plan", "other")).toBeUndefined();
    expect(gatewaitof(progress, "otherplan", "paystep")).toBeUndefined();
    const updated = recordgatewait(progress, "plan", "paystep", { gateid: "gate2", kind: "confirmpay", openedat: now, resolvedat: now + 2000, waitedms: 2000 }, now + 2000);
    expect(gatewaitof(updated, "plan", "paystep")?.gateid).toBe("gate2");
  });
});

/* ── The 1.1.96 multi agent certification: the interleaved timeline ordering of the fleet. ── */
import { interleave, interleavetimeline } from "../agent.js";
import type { swarmaction } from "../types.js";

describe("interleaved timeline progress", () => {
  it("orders the concurrent actions of every agent into one time ordered timeline", () => {
    const events = [
      { agentid: "w2", kind: "readtext", summary: "The background agent read the table.", at: now + 300 },
      { agentid: "w1", kind: "click", summary: "The interactive agent opened the pricing page.", at: now + 100 },
      { agentid: "w2", kind: "observe", summary: "The background agent observed the hero.", at: now + 200 },
      { agentid: "w1", kind: "readtext", summary: "The interactive agent read the footer.", at: now + 400 },
    ];
    const timeline = interleavetimeline(events.map(event => ({ id: `x-${event.at - now}`, kind: event.kind, summary: event.summary, at: event.at, agentid: event.agentid })));
    expect(timeline.map(event => event.kind)).toEqual(["click", "observe", "readtext", "readtext"]);
    expect(timeline.every((event, index) => index === 0 || timeline[index - 1]!.at <= event.at)).toBe(true);
    expect(interleavetimeline([])).toEqual([]);
  });

  it("interleaves the lane events with the lane attribution the dashboard timeline reads", () => {
    const lanes = [
      { name: "interactive", priority: 10, interactive: true, agentids: ["w1"] },
      { name: "background", priority: 1, agentids: ["w2"] },
    ];
    const events = [
      { agentid: "w2", kind: "readtext", summary: "The background agent read the table.", at: now + 300 },
      { agentid: "w1", kind: "click", summary: "The interactive agent opened the pricing page.", at: now + 100 },
      { agentid: "w2", kind: "observe", summary: "The background agent observed the hero.", at: now + 200 },
    ];
    const merged = interleave({ events, lanes });
    expect(merged.map(event => event.kind)).toEqual(["click", "observe", "readtext"]);
    expect(merged[0]?.lane).toBe("interactive");
    expect(merged[1]?.lane).toBe("background");
    expect(merged[2]?.lane).toBe("background");
    /* the fleet view never interleaves an empty stream */
    expect(() => interleave({ events: [], lanes })).toThrow(/empty/i);
  });

  it("breaks the time ties deterministically by the event id", () => {
    const actions: swarmaction[] = [
      { id: "x-b", kind: "click", summary: "The later id.", at: now + 100 },
      { id: "x-a", kind: "readtext", summary: "The earlier id.", at: now + 100 },
    ];
    expect(interleavetimeline(actions).map(action => action.id)).toEqual(["x-a", "x-b"]);
  });
});

/* ── The 2.0.0 release candidate provenance stamps of the audit trail (roadmap rc.2 items 54 and 87): every progress record and step stamp carries the release that produced it, and the progress replay path replays the stamps. ── */
import { emptyprogress as freshprogress, provenancestampof, recordoutcome as stampoutcome, recordstep as stampstep, recordnaventry as stampnaventry, replayprogress, resetforplan as stampreset } from "../progress.js";
import { packageversion, protocolmajor } from "../version.js";

describe("release candidate provenance stamps", () => {
  const stamp = { release: packageversion, protocolmajor };

  it("stamps every fresh progress record with the release that created it", () => {
    expect(freshprogress("plan", now).provenance).toEqual(stamp);
    expect(stampstep(undefined, "plan", "one", now).provenance).toEqual(stamp);
    const foreign = stampstep({ planid: "other", completedsteps: ["gone"], updatedat: now }, "plan", "one", now);
    expect(foreign.provenance).toEqual(stamp);
    expect(foreign.completedsteps).toEqual(["one"]);
    expect(provenancestampof()).toEqual({ release: packageversion, protocolmajor: protocolmajor });
    expect(provenancestampof().release).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("stamps every recorded outcome while the prior fields stay untouched", () => {
    let progress = stampstep(freshprogress("plan", now), "plan", "one", now);
    progress = stampoutcome(progress, "plan", { stepid: "one", ok: true, summary: "Observe completed.", details: { textlength: 42 }, at: now + 1 }, now + 1);
    const outcome = progress.outcomes?.[0];
    expect(outcome).toMatchObject({ stepid: "one", ok: true, summary: "Observe completed.", details: { textlength: 42 }, at: now + 1 });
    expect(outcome?.provenance).toEqual(stamp);
    const replayed = stampnaventry(progress, "plan", "list", { index: 0, url: "https://example.com/a", ok: true }, now + 2);
    expect(replayed.outcomes?.[1]?.provenance).toEqual(stamp);
    expect(replayed.outcomes?.[1]?.summary).toContain("Navigation list entry 1");
  });

  it("stamps the reset record while the preserved prior snapshot keeps its own stamp", () => {
    const previous = stampoutcome(stampstep(freshprogress("old", now), "old", "one", now), "old", { stepid: "one", ok: true, summary: "Old step done.", at: now }, now);
    const reset = stampreset(previous, plan, now);
    expect(reset.provenance).toEqual(stamp);
    expect(reset.prior?.[0]?.outcomes?.[0]?.provenance).toEqual(stamp);
    const repeated = stampstep(stampstep(freshprogress("plan", now), "plan", "one", now), "plan", "one", now + 5);
    expect(repeated.completedsteps).toEqual(["one"]);
    expect(repeated.provenance).toEqual(stamp);
  });
});

describe("progress replay provenance stamps", () => {
  const stamp = { release: packageversion, protocolmajor };

  it("replays the recorded step stamps with their provenance beside the record level stamp", () => {
    let progress = stampstep(undefined, "plan", "one", now);
    progress = stampoutcome(progress, "plan", { stepid: "one", ok: true, summary: "The observe step completed.", at: now + 1 }, now + 1);
    progress = stampoutcome(progress, "plan", { stepid: "two", ok: false, summary: "The click step failed.", at: now + 2 }, now + 2);
    const replayed = replayprogress(progress, "plan");
    expect(replayed.planid).toBe("plan");
    expect(replayed.provenance).toEqual(stamp);
    expect(replayed.entries).toHaveLength(2);
    expect(replayed.entries[0]).toMatchObject({ index: 0, stepid: "one", ok: true, summary: "The observe step completed.", at: now + 1 });
    expect(replayed.entries[0]?.provenance).toEqual(stamp);
    expect(replayed.entries[1]).toMatchObject({ index: 1, stepid: "two", ok: false });
    expect(replayed.entries[1]?.provenance).toEqual(stamp);
    expect(replayed.entries.map(entry => entry.provenance?.release)).toEqual([packageversion, packageversion]);
    expect(replayed.entries.map(entry => entry.provenance?.protocolmajor)).toEqual([protocolmajor, protocolmajor]);
  });

  it("replays a foreign or empty progress record as an empty entry list without a stamp", () => {
    expect(replayprogress(undefined, "plan")).toEqual({ planid: "plan", entries: [] });
    const foreign = stampstep(freshprogress("other", now), "other", "gone", now);
    expect(replayprogress(foreign, "plan")).toEqual({ planid: "plan", entries: [] });
    expect(replayprogress({ planid: "plan", completedsteps: [], updatedat: now }, "plan").provenance).toBeUndefined();
  });
});
