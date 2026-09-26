import { describe, expect, it } from "vitest";
import {
  appendvisit,
  auditeventof,
  buckettimeline,
  finalurlof,
  lockblocks,
  lockwindowof,
  releasesessionlock,
  acquiresessionlock,
  runtimelineof,
  runwithvisits,
  sessionwithlock,
  stepeventof,
  stalelocks,
  tabisolate,
  tabkey,
  tabnamespace,
  visitof,
  visitsummary,
} from "../run.js";
import {
  lockwindowvalid,
  sessionlockgate,
  tabisolategate,
  urlhistorygate,
  urlhistoryscopegate,
  timelinereadonlygate,
} from "../policy.js";
import { memoryitemframe, parseproposal, requestbody, runtimelinereport, urlvisitscheck } from "../protocol.js";
import { sessionmemory } from "../memory.js";
import {
  protocolversion,
  type agentplan,
  type agentsession,
  type auditevent,
  type lockrecord,
  type runrecord,
  type toolstep,
  type urlvisit,
} from "../types.js";

const now = 1_800_000_000_000;
const session: agentsession = {
  id: "session",
  tabid: 4,
  origin: "https://example.com",
  startedat: now,
  expiresat: now + 1_000_000,
};
const clickstep: toolstep = {
  id: "s1",
  kind: "click",
  target: "#submit",
  summary: "Click the reviewed submit control.",
  risk: "sensitive",
};
const plan: agentplan = {
  id: "plan",
  objective: "Submit once",
  origin: "https://example.com",
  steps: [clickstep, { id: "s2", kind: "observe", summary: "Read the page.", risk: "read" }],
  createdat: now,
  expiresat: now + 1_000_000,
  state: "approved",
};

function runof(runid: string): runrecord {
  return { runid, planid: "plan", sessionid: "session", state: "running", createdat: now, updatedat: now };
}

class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> {
    return this.data.get(key) as T | undefined;
  }
  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
  }
}

describe("urlhistory", () => {
  it("appends one urlvisit per navigation, folds consecutive duplicates and stays scoped per run", () => {
    const first = visitof({ url: "https://example.com/start", title: "Start", runid: "run1", now });
    expect(first).toEqual({ url: "https://example.com/start", title: "Start", at: now, runid: "run1" });
    expect(() => visitof({ url: " ", runid: "run1", now })).toThrow(/url/i);
    expect(() => visitof({ url: "https://example.com", runid: " ", now })).toThrow(/run id/i);
    const second = visitof({ url: "https://example.com/start", runid: "run1", now: now + 500 });
    const folded = appendvisit([first], second);
    expect(folded).toHaveLength(1);
    expect(folded[0]?.at).toBe(now + 500);
    const other = visitof({ url: "https://example.com/next", runid: "run1", now: now + 900 });
    expect(appendvisit(folded, other)).toHaveLength(2);
    const foreignrun = visitof({ url: "https://example.com/start", runid: "run2", now: now + 901 });
    expect(appendvisit(folded, foreignrun)).toHaveLength(2);
    expect(urlhistoryscopegate({ visits: [first, foreignrun], runid: "run1" }).allowed).toBe(false);
    expect(urlhistoryscopegate({ visits: [first], runid: "run1" }).allowed).toBe(true);
    expect(
      urlhistorygate({ visit: { url: "https://example.com/page", runid: "run1" }, origin: "https://example.com" })
        .allowed,
    ).toBe(true);
    expect(
      urlhistorygate({ visit: { url: "https://evil.example/page", runid: "run1" }, origin: "https://example.com" })
        .allowed,
    ).toBe(false);
    expect(
      urlhistorygate({
        visit: { url: "https://other.example/page", runid: "run1" },
        origin: "https://example.com",
        grants: ["https://other.example"],
      }).allowed,
    ).toBe(true);
    expect(
      urlvisitscheck({
        visits: [first, visitof({ url: "https://evil.example/x", runid: "run1", now })],
        origin: "https://example.com",
      }),
    ).toEqual({ ok: false, refused: ["https://evil.example/x"] });
    const summary = visitsummary([first, other]);
    expect(summary).toEqual({ count: 2, origins: ["https://example.com"], first: now, last: now + 900 });
    const carried = runwithvisits(runof("run1"), [first, other, foreignrun]);
    expect(carried.visits).toHaveLength(2);
    expect(finalurlof({ plannedurl: "https://example.com/a" })).toBe("https://example.com/a");
    expect(finalurlof({ plannedurl: "https://example.com/a", finalurl: "https://example.com/b" })).toBe(
      "https://example.com/b",
    );
  });
});

describe("runtimeline", () => {
  it("merges step results, audit events and url visits into one ordered stream and buckets the phases", () => {
    const steps = [stepeventof({ runid: "run1", stepid: "s1", summary: "clicked", ok: true, now: now + 100 })];
    const audits: auditevent[] = [
      {
        id: "a1",
        kind: "approval",
        at: now + 50,
        summary: "The user approved the plan.",
        sessionid: "session",
        planid: "plan",
      },
      {
        id: "a2",
        kind: "visit",
        at: now + 150,
        summary: "The run visited the page.",
        sessionid: "session",
        planid: "plan",
      },
    ];
    const visits: urlvisit[] = [visitof({ url: "https://example.com/start", runid: "run1", now: now + 75 })];
    const merged = runtimelineof({ steps, audits: audits.map(auditeventof), visits, runid: "run1" });
    expect(merged.map((event) => event.at)).toEqual([now + 50, now + 75, now + 100, now + 150]);
    expect(merged.map((event) => event.source)).toEqual(["audit", "visit", "step", "audit"]);
    const buckets = buckettimeline(merged);
    expect(buckets.map((bucket) => bucket.phase).sort()).toEqual(["audit", "route", "steps"]);
    expect(buckets.find((bucket) => bucket.phase === "route")?.events).toHaveLength(1);
    const failed = stepeventof({ runid: "run1", stepid: "s2", summary: "broke", ok: false, now: now + 200 });
    expect(buckettimeline([failed]).map((bucket) => bucket.phase)).toEqual(["failures"]);
    const report = runtimelinereport({ runid: "run1", events: merged, buckets });
    expect(report.version).toBe(protocolversion);
    expect(report.buckets.find((bucket) => bucket.phase === "steps")?.count).toBe(1);
    expect(timelinereadonlygate({ operation: "view" }).allowed).toBe(true);
    expect(timelinereadonlygate({ operation: "execute the step" }).allowed).toBe(false);
  });

  it("persists the urlhistory and the runtimeline per run through the memory accessors", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setrunrecord(runof("run1"));
    const visit = visitof({ url: "https://example.com/start", title: "Start", runid: "run1", now });
    await store.setvisits("run1", appendvisit([], visit));
    expect(await store.getvisits("run1")).toEqual([visit]);
    expect(await store.getvisits("run2")).toEqual([]);
    const event = stepeventof({ runid: "run1", stepid: "s1", summary: "clicked", ok: true, now });
    await store.appendtimelineevent(event);
    await store.appendtimelineevent(
      stepeventof({ runid: "run1", stepid: "s2", summary: "read", ok: true, now: now + 10 }),
    );
    expect((await store.getruntimeline("run1")).map((entry) => entry.stepid)).toEqual(["s1", "s2"]);
    const record = await store.getexport(now);
    expect(record.timeline).toHaveLength(2);
    expect(record.expiryrules).toEqual([]);
  });
});

describe("sessionlock", () => {
  it("acquires, blocks the concurrent run by naming the holder, releases and expires with the user window", () => {
    const lock = acquiresessionlock({ runid: "run1", sessionid: "session", window: 120_000, now });
    expect(lock).toEqual({
      holder: "run1",
      runid: "run1",
      sessionid: "session",
      acquiredat: now,
      expiresat: now + 120_000,
    });
    expect(() => acquiresessionlock({ runid: " ", sessionid: "session", window: 1, now })).toThrow(/run id/i);
    expect(lockblocks(lock, "run1", now + 1).blocked).toBe(false);
    const blocked = lockblocks(lock, "run2", now + 1);
    expect(blocked.blocked).toBe(true);
    expect(blocked.reason).toContain("run1");
    expect(lockblocks(lock, "run2", now + 121_000).blocked).toBe(false);
    expect(lockblocks(undefined, "run2", now).blocked).toBe(false);
    expect(releasesessionlock(lock, "run1")).toBe(true);
    expect(releasesessionlock(lock, "run2")).toBe(false);
    expect(releasesessionlock(undefined, "run1")).toBe(false);
    expect(
      stalelocks([lock, { ...lock, runid: "run2", holder: "run2", expiresat: now + 999_999 }], now + 121_000).map(
        (entry) => entry.runid,
      ),
    ).toEqual(["run1"]);
    expect(lockwindowof(undefined)).toBe(120_000);
    expect(lockwindowof({ lockwindow: 300_000 })).toBe(300_000);
    expect(lockwindowvalid({ window: 300_000 }).allowed).toBe(true);
    expect(lockwindowvalid({ window: 0 }).allowed).toBe(false);
    expect(sessionlockgate({ lock, runid: "run2", now: now + 1 }).allowed).toBe(false);
    expect(sessionlockgate({ lock, runid: "run1", now: now + 1 }).allowed).toBe(true);
    expect(sessionlockgate({ lock, runid: "run2", now: now + 121_000 }).allowed).toBe(true);
    const locked = sessionwithlock(session, lock.runid);
    expect(locked.lockid).toBe("run1");
    expect(sessionwithlock(session, undefined).lockid).toBeUndefined();
    const lock2: lockrecord = { ...lock, holder: "run1", runid: "run1" };
    expect(lock2.holder).toBe("run1");
  });

  it("isolates the memory keys per tabid through the tabisolate namespace", () => {
    expect(tabnamespace(4)).toBe("tab:4");
    expect(tabkey(4, "plan")).toBe("tab:4:plan");
    expect(() => tabkey(4, " ")).toThrow(/key/i);
    const state = tabisolate({ tabid: 4, config: { planid: "plan" }, runid: "run1", now });
    expect(state.namespace).toBe("tab:4");
    expect(state.config).toEqual({ planid: "plan" });
    expect(state.runid).toBe("run1");
    expect(() => tabisolate({ tabid: Number.NaN, config: {}, now })).toThrow(/tab id/i);
    expect(tabisolategate({ namespace: "tab:4", tabid: 4, runid: "run1" }).allowed).toBe(true);
    expect(tabisolategate({ namespace: "tab:4", tabid: 5, runid: "run1" }).allowed).toBe(false);
    expect(tabisolategate({ namespace: " ", tabid: 5 }).allowed).toBe(true);
  });

  it("persists the lockrecord and the tabstate through the memory accessors", async () => {
    const store = new sessionmemory(new fakeadapter());
    const lock = acquiresessionlock({ runid: "run1", sessionid: "session", window: 120_000, now });
    await store.setlock(lock);
    expect(await store.getlock("session")).toEqual(lock);
    await store.setlock({ ...lock, runid: "run2", holder: "run2" });
    expect((await store.listlocks()).map((entry) => entry.runid)).toEqual(["run2"]);
    await store.clearlock("session");
    expect(await store.getlock("session")).toBeUndefined();
    await store.settabstate(tabisolate({ tabid: 4, config: { planid: "plan" }, runid: "run1", now }));
    expect((await store.gettabstate(4))?.namespace).toBe("tab:4");
    expect(await store.gettabstate(5)).toBeUndefined();
  });

  it("preserves the lockid across proposal replays and carries the tab namespace with the observation provenance", () => {
    const proposal = {
      version: protocolversion,
      plan: {
        id: "plan",
        objective: "Submit once",
        origin: "https://example.com",
        steps: [{ id: "s1", kind: "observe", summary: "Read the page." }],
      },
      lockid: "run1",
    };
    const parsed = parseproposal(proposal, "https://example.com");
    expect(parsed.lockid).toBe("run1");
    expect(
      parseproposal({ version: protocolversion, plan: proposal.plan }, "https://example.com").lockid,
    ).toBeUndefined();
    const body = JSON.parse(
      requestbody({
        objective: "o",
        session,
        observation: {
          schemaversion: 1,
          url: "https://example.com",
          title: "t",
          textpreview: "",
          textlength: 0,
          forms: [],
          interactive: [],
          capturedat: now,
        },
        capabilities: { tabs: false, downloads: false, clipboardread: false, clipboardwrite: false, reportedat: now },
        runstate: "running",
        tabnamespace: "tab:4",
        provenance: [{ origin: "https://example.com", runid: "run1", stepid: "s1", capturedat: now }],
      }),
    );
    expect(body.tabnamespace).toBe("tab:4");
    expect(body.provenance).toEqual([{ origin: "https://example.com", runid: "run1", stepid: "s1", capturedat: now }]);
    expect(() =>
      memoryitemframe({
        key: "k",
        value: 1,
        provenance: { origin: "https://example.com", runid: "run1", capturedat: now },
      }),
    ).toThrow(/provenance/i);
  });
});
