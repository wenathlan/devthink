import { describe, expect, it } from "vitest";
import {
  audiotabs, advancedownload, badgefromprogress, batchopenlinks, buildlayout, checksafeurl, capturefilename, capturenames, capturesteps, clipentryof, cliphash, clonetabs, closeselection, concurrentwindow, conflictfree, deeplinkapp, discardcandidates, downloadfilename, layoutrestoreplan, mimeallowed, navintent, navratelimit, netlogentry, netlogforstep, newquarantine, normalizedtaburl, openclipboardurl, parsetabquery, pausenavconsent, prefetchpage, preconnectorigin, quarantinedpath, querymatches, redactheaders, reopentab, resumenavconsent, restoretrail, referencedartifacts, regroupaftermoves, renamegroup, restorediscarded, released, scanresult, scanverdictof, searchtabmatches, sweepplan, switcherlist, switchtarget, tabpatternmatches, tasktabsinwindow, tasktabgauge, transitionallowed, verifybytes, watchtabdispatch, windowprofilegrants, zoomstep,
} from "../commands.js";
import type { closedtabrecord, ratelimitwindow, tabgrouprecord, toolstep, urlvisit, artifactinventoryentry, cleanuprule } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one live tab shape fixture. */
function tab(over: Partial<{ tabid: number; url: string; title: string; index: number; windowid: number; active: boolean; pinned: boolean; audible: boolean; muted: boolean; discarded: boolean }> = {}) {
  return { tabid: 1, url: "https://example.com/page", title: "Example", index: 0, windowid: 1, active: true, pinned: false, audible: false, muted: false, discarded: false, ...over };
}

/** Builds one toolstep fixture. */
function step(kind: toolstep["kind"], over: Partial<toolstep> = {}): toolstep {
  return { id: "s1", kind, summary: "", risk: "interaction", ...over };
}

describe("torture: tab queries, patterns and the star storm", () => {
  it("parses reviewed tab queries from step options and refuses malformed carriers", () => {
    expect(parsetabquery(step("querytabs", { options: JSON.stringify({ tabquery: { url: "https://example.com", title: "Example", id: 3, pattern: "https://example.com/*" } }) }))).toEqual({ url: "https://example.com", title: "Example", id: 3, pattern: "https://example.com/*" });
    expect(parsetabquery(step("querytabs", { options: JSON.stringify({ tabquery: { id: -1, url: "", title: 5 } }) }))).toEqual({});
    expect(parsetabquery(step("querytabs", { options: JSON.stringify({ tabquery: "nope" }) }))).toBeNull();
    expect(parsetabquery(step("querytabs", { options: JSON.stringify({ tabquery: ["nope"] }) }))).toBeNull();
    expect(parsetabquery(step("querytabs", { options: "not json" }))).toBeNull();
    expect(parsetabquery(step("querytabs", {}))).toBeNull();
  });

  it("matches wildcard patterns with segment and subtree spans, regex metacharacters and empties", () => {
    expect(tabpatternmatches("*", "anything")).toBe(true);
    expect(tabpatternmatches("*", "a/b")).toBe(false);
    expect(tabpatternmatches("**", "a/b/c")).toBe(true);
    expect(tabpatternmatches("https://example.com/*", "https://example.com/pricing")).toBe(true);
    expect(tabpatternmatches("https://example.com/*", "https://example.com/a/b")).toBe(false);
    expect(tabpatternmatches("https://example.com/**", "https://example.com/a/b")).toBe(true);
    expect(tabpatternmatches("https://example.com/**", "https://other.example/a")).toBe(false);
    expect(tabpatternmatches("https://example.com/?q=1", "https://example.com/?q=1")).toBe(true);
    expect(tabpatternmatches("https://example.com/?q=1", "https://example.com/xq=1")).toBe(false);
    expect(tabpatternmatches("a.b", "axb")).toBe(false);
    expect(tabpatternmatches("a*b*c", "a-b-c")).toBe(true);
    expect(tabpatternmatches("", "")).toBe(true);
    expect(tabpatternmatches("", "x")).toBe(false);
    expect(tabpatternmatches("****", "a/b/c")).toBe(true);
  });

  it("stays linear on adversarial star storms instead of backtracking catastrophically", () => {
    const started = Date.now();
    expect(tabpatternmatches("*a".repeat(1500), "b".repeat(2000))).toBe(false);
    expect(tabpatternmatches("a*".repeat(1500), "a".repeat(2000) + "/")).toBe(false);
    expect(tabpatternmatches("*".repeat(3000), "https://example.com/" + "a/".repeat(1500))).toBe(true);
    expect(tabpatternmatches(("ab*" + "a".repeat(20)).repeat(500), "ab" + "a".repeat(30))).toBe(false);
    /* the linearity budget stays one second on native runners and scales with the same env the emulated arm64 container leg sets, because a qemu-interpreted second is not a native second while the linearity it proves is the same */
    expect(Date.now() - started).toBeLessThan(Number(process.env.DEVTHINK_TEST_BUDGET_MS ?? 1000));
  });

  it("resolves tab queries where every matcher that exists must hold", () => {
    const tabs = [tab({ tabid: 1, url: "https://example.com/a", title: "Alpha" }), tab({ tabid: 2, url: "https://example.com/b", title: "beta" }), tab({ tabid: 3, url: "https://other.example/c", title: "Gamma" })];
    expect(querymatches({ url: "https://example.com/a" }, tabs)).toHaveLength(1);
    expect(querymatches({ title: "ALPHA" }, tabs)).toHaveLength(1);
    expect(querymatches({ id: 2 }, tabs).map(entry => entry.tabid)).toEqual([2]);
    expect(querymatches({ pattern: "https://example.com/*" }, tabs)).toHaveLength(2);
    expect(querymatches({}, tabs)).toHaveLength(3);
    expect(querymatches({ url: "https://example.com/a", title: "beta" }, tabs)).toHaveLength(0);
  });

  it("normalizes urls for clone comparison by dropping fragments and trailing slashes", () => {
    expect(normalizedtaburl("https://example.com/page/")).toBe("https://example.com/page");
    expect(normalizedtaburl("https://example.com/page///")).toBe("https://example.com/page");
    expect(normalizedtaburl("https://example.com/page#frag")).toBe("https://example.com/page");
    expect(normalizedtaburl("https://example.com/page#frag/more")).toBe("https://example.com/page");
    expect(normalizedtaburl("/")).toBe("/");
    expect(normalizedtaburl("")).toBe("");
    const tabs = [tab({ tabid: 1, url: "https://example.com/p" }), tab({ tabid: 2, url: "https://example.com/p/" }), tab({ tabid: 3, url: "https://example.com/p#x" }), tab({ tabid: 4, url: "https://other.example" })];
    expect(clonetabs(tabs)).toEqual([{ url: "https://example.com/p", tabids: [1, 2, 3] }]);
    expect(clonetabs([tab({ tabid: 9, url: "" }), tab({ tabid: 10, url: "" })])).toEqual([]);
  });

  it("searches, audio lists, discard candidates and restores across the live tab set", () => {
    const tabs = [tab({ tabid: 1, title: "Pricing table", url: "https://example.com/pricing" }), tab({ tabid: 2, title: "Docs", url: "https://docs.example.org/guide", audible: true, active: false }), tab({ tabid: 3, title: "Music", muted: true, audible: true, discarded: true, active: false })];
    expect(searchtabmatches(tabs, "  pricing ")).toHaveLength(1);
    expect(searchtabmatches(tabs, "DOCS")).toHaveLength(1);
    expect(searchtabmatches(tabs, " ")).toEqual([]);
    expect(audiotabs(tabs).map(entry => entry.tabid)).toEqual([2, 3]);
    expect(discardcandidates(tabs).map(entry => entry.tabid)).toEqual([2]);
    expect(restorediscarded(tabs)).toEqual([{ tabid: 3, url: tabs[2]!.url }]);
  });

  it("captures layouts, restores only the closed urls and regroups membership through moves", () => {
    const tabs = [tab({ tabid: 1, index: 0, pinned: true }), tab({ tabid: 2, index: 1 }), tab({ tabid: 3, index: 2, windowid: 7 })];
    const windows = [{ windowid: 1, left: 0, top: 0, width: 800, height: 600, state: "normal" as const, incognito: false, focused: true }, { windowid: 7, left: 10, top: 10, width: 400, height: 300, state: "maximized" as const, incognito: false, focused: false }];
    const groups: tabgrouprecord[] = [{ groupid: "g1", name: "Research", color: "blue", tabids: [3, 2, 99], collapsed: false, savedat: now - 10 }];
    const layout = buildlayout("daily", tabs, windows, groups, [7], now);
    expect(layout.name).toBe("daily");
    expect(layout.tabs).toHaveLength(3);
    expect(layout.groups[0]?.tabids).toEqual([3, 2]);
    expect(layout.windows[1]?.state).toEqual({ bounds: { left: 10, top: 10, width: 400, height: 300 }, maximized: true, profile: "scratch" });
    expect(layoutrestoreplan(layout, ["https://example.com/page/"])).toEqual([]);
    expect(layoutrestoreplan(layout, ["https://other.example/x"])).toEqual(["https://example.com/page", "https://example.com/page", "https://example.com/page"]);
    const moved = regroupaftermoves(groups, [tab({ tabid: 2, index: 0 }), tab({ tabid: 3, index: 1 })], now);
    expect(moved[0]?.tabids).toEqual([2, 3]);
    expect(moved[0]?.savedat).toBe(now);
    expect(renamegroup(groups, "Research", "Study", now)[0]?.name).toBe("Study");
    expect(regroupaftermoves(groups, [], now)[0]?.tabids).toEqual([3, 2, 99]);
  });

  it("protects the session tab from closepattern selections and counts task tabs per window", () => {
    const tabs = [tab({ tabid: 1 }), tab({ tabid: 2 }), tab({ tabid: 3 })];
    const selection = closeselection({ pattern: "https://example.com/*" }, tabs, 2);
    expect(selection.targets.map(entry => entry.tabid)).toEqual([1, 3]);
    expect(selection.refused.map(entry => entry.tabid)).toEqual([2]);
    expect(closeselection({ id: 9 }, tabs, 2).targets).toEqual([]);
    expect(tasktabsinwindow(tabs, 1, [1, 3, 99])).toBe(2);
    expect(tasktabsinwindow(tabs, 5, [1])).toBe(0);
  });

  it("zooms without crossing zero, switches with wraparound and orders the switcher by recency", () => {
    expect(zoomstep(1, "in", 0.25)).toBe(1.25);
    expect(zoomstep(0.1, "out", 0.2)).toBe(0.1);
    expect(zoomstep(0.5, "in", 0)).toBe(0.5);
    const tabs = [tab({ tabid: 1, index: 0, title: "Alpha" }), tab({ tabid: 2, index: 1, title: "Beta tab 2" }), tab({ tabid: 3, index: 2, title: "Gamma" })];
    expect(switchtarget(tabs, "next", 2)).toBe(0);
    expect(switchtarget(tabs, "previous", 0)).toBe(2);
    expect(switchtarget([], "next", 0)).toBeUndefined();
    const recency = [{ tabid: 3, at: now }, { tabid: 1, at: now - 100 }];
    expect(switcherlist(tabs, recency, "").map(entry => entry.tabid)).toEqual([3, 1, 2]);
    expect(switcherlist(tabs, recency, "tab 2").map(entry => entry.tabid)).toEqual([2]);
    expect(switcherlist(tabs, recency, "nomatch")).toEqual([]);
  });

  it("dispatches watched tab events through filters and derives badges and tab budgets", () => {
    const events = [{ watchid: "w1", event: "title" as const, tabid: 1, at: now }, { watchid: "w1", event: "closed" as const, tabid: 2, at: now + 1 }, { watchid: "w2", event: "title" as const, tabid: 3, at: now + 2 }];
    expect(watchtabdispatch(events, "w1", ["title"])).toHaveLength(1);
    expect(watchtabdispatch(events, "w1", [])).toHaveLength(2);
    expect(watchtabdispatch(events, "w9", [])).toEqual([]);
    expect(badgefromprogress(3, 0)).toEqual({ label: "idle", done: false });
    expect(badgefromprogress(5, 5)).toEqual({ label: "done", done: true });
    expect(badgefromprogress(2, 5)).toEqual({ label: "2/5", done: false });
    expect(tasktabgauge(3, undefined)).toEqual({ used: 3, ceiling: undefined, over: false });
    expect(tasktabgauge(3, 2)).toEqual({ used: 3, ceiling: 2, over: true });
    expect(tasktabgauge(2, 2).over).toBe(false);
    expect(windowprofilegrants("normal")).toBe(true);
    expect(windowprofilegrants("scratch")).toBe(true);
    expect(windowprofilegrants("incognito")).toBe(false);
  });
});

describe("torture: download states, filenames, mime filters and quarantine routing", () => {
  const record = { id: "d1", url: "https://example.com/file.bin", filename: "file.bin", state: "queued" as const, at: now, updatedat: now };

  it("walks only the legal batch queue transitions and merges evidence", () => {
    expect(transitionallowed("queued", "running")).toBe(true);
    expect(transitionallowed("queued", "paused")).toBe(false);
    expect(transitionallowed("complete", "failed")).toBe(false);
    expect(transitionallowed("failed", "queued")).toBe(false);
    const impossible = advancedownload({ ...record, state: "complete" }, "running", now + 1);
    expect(impossible.state).toBe("complete");
    expect(impossible.updatedat).toBe(now);
    const running = advancedownload(record, "running", now + 1, { bytes: 42, checksum: "sha", downloadid: 7, path: "/tmp/file.bin" });
    expect(running).toMatchObject({ state: "running", bytes: 42, checksum: "sha", downloadid: 7, path: "/tmp/file.bin" });
    const kept = advancedownload(record, "running", now + 2);
    expect(kept.path).toBeUndefined();
    expect(concurrentwindow(3, undefined)).toBe(true);
    expect(concurrentwindow(3, 3)).toBe(false);
    expect(concurrentwindow(2, 3)).toBe(true);
  });

  it("resolves filename conflicts with sequence suffixes and keeps extensions", () => {
    expect(conflictfree("report.pdf", ["other.pdf"])).toBe("report.pdf");
    expect(conflictfree("report.pdf", ["report.pdf"])).toBe("report-2.pdf");
    expect(conflictfree("report.pdf", ["report.pdf", "report-2.pdf"])).toBe("report-3.pdf");
    expect(conflictfree("noext", ["noext"])).toBe("noext-2");
    expect(conflictfree(".gitignore", [".gitignore"])).toBe(".gitignore-2");
    expect(conflictfree("archive.tar.gz", ["archive.tar.gz", "archive.tar-2.gz"])).toBe("archive.tar-3.gz");
  });

  it("derives download filenames from urls with decoding, hostnames and reviewed rules", () => {
    expect(downloadfilename("https://example.com/files/report.pdf", undefined)).toBe("report.pdf");
    expect(downloadfilename("https://example.com/files/my%20file.txt", undefined)).toBe("my file.txt");
    expect(downloadfilename("https://example.com/", undefined)).toBe("example.com");
    expect(downloadfilename("https://example.com", undefined)).toBe("example.com");
    expect(downloadfilename("not a url", undefined)).toBe("not a url");
    expect(downloadfilename("https://example.com/x.bin", "  reviewed.bin  ")).toBe("reviewed.bin");
    expect(downloadfilename("https://example.com/a/b/", undefined)).toBe("b");
  });

  it("verifies completed downloads against size and checksum expectations", () => {
    const complete = { ...record, state: "complete" as const, bytes: 100, checksum: "sha-1" };
    expect(verifybytes(complete, { bytes: 100, checksum: "sha-1" }).ok).toBe(true);
    expect(verifybytes(complete, { bytes: 101 }).ok).toBe(false);
    expect(verifybytes(complete, { checksum: "sha-2" }).ok).toBe(false);
    expect(verifybytes(record, {}).ok).toBe(false);
    expect(verifybytes(complete, {}).matches).toEqual({ state: true, size: true, checksum: true });
    const { bytes: _bytes, ...unknownsize } = complete;
    expect(verifybytes(unknownsize, { bytes: 5 }).summary).toContain("unknown");
  });

  it("filters mime types where exclude wins, then include, then the default", () => {
    const filter = { include: ["image/*"], exclude: ["image/svg+xml"], default: "allow" as const };
    expect(mimeallowed(filter, "image/png")).toBe(true);
    expect(mimeallowed(filter, "image/svg+xml")).toBe(false);
    expect(mimeallowed(filter, "text/html")).toBe(true);
    expect(mimeallowed({ include: ["text/plain"], exclude: [], default: "deny" as const }, "text/html")).toBe(false);
    expect(mimeallowed({ include: [], exclude: [], default: "deny" as const }, "text/html")).toBe(false);
    expect(mimeallowed({ include: ["application/json"], exclude: [], default: "deny" as const }, "application/json")).toBe(true);
    expect(mimeallowed({ include: ["exact"], exclude: [], default: "allow" as const }, "exact")).toBe(true);
    expect(mimeallowed({ include: ["exact"], exclude: [], default: "allow" as const }, "exactly")).toBe(true);
  });

  it("redacts every header value, correlates netlog rows and hashes clipboard payloads", () => {
    expect(redactheaders({ Authorization: "Bearer abc", "X-Safe": "1" })).toEqual({ Authorization: "[redacted]", "X-Safe": "[redacted]" });
    const entries = [netlogentry({ url: "https://example.com/a", method: "GET", status: 200, timing: 12, requestid: "r1", stepid: "s1", at: now }), netlogentry({ url: "https://example.com/b", method: "POST", status: 500, timing: 30, requestid: "r2", stepid: "s2", at: now + 1 })];
    expect(netlogforstep(entries, "s1")).toHaveLength(1);
    expect(netlogforstep(entries, "s9")).toEqual([]);
    expect(clipentryof("read", { hash: cliphash("payload"), length: 7 }, "https://example.com", "s1", now)).toEqual({ kind: "read", hash: cliphash("payload"), length: 7, origin: "https://example.com", stepid: "s1", at: now });
    expect(cliphash("a")).not.toBe(cliphash("b"));
    expect(JSON.stringify(clipentryof("write", { hash: "h", length: 2 }, "https://example.com", "s", now))).not.toContain("payload");
  });

  it("routes quarantined paths that no traversal, backslash or absolute prefix escapes", () => {
    expect(quarantinedpath("invoice.pdf")).toBe("devthink-quarantine/invoice.pdf");
    expect(quarantinedpath("/absolute/path.bin")).toBe("devthink-quarantine/absolute/path.bin");
    expect(quarantinedpath("../../etc/passwd")).toBe("devthink-quarantine/etc/passwd");
    expect(quarantinedpath("..\\..\\windows\\evil.exe")).toBe("devthink-quarantine/windows/evil.exe");
    expect(quarantinedpath("nested/../inner/./file.bin")).toBe("devthink-quarantine/nested/inner/file.bin");
    expect(quarantinedpath("..")).toBe("devthink-quarantine/");
    expect(quarantinedpath("")).toBe("devthink-quarantine/");
    expect(newquarantine("q1", "../../etc/passwd", "reviewed quarantine", now).path).toBe("devthink-quarantine/etc/passwd");
  });

  it("maps scan hook verdicts onto quarantine entries and release refs", () => {
    const entry = newquarantine("q1", "invoice.pdf", "reviewed quarantine", now);
    expect(entry).toMatchObject({ id: "q1", path: "devthink-quarantine/invoice.pdf", scan: "pending", at: now, updatedat: now });
    expect(scanresult(entry, "clean", now + 1)).toMatchObject({ scan: "clean", updatedat: now + 1 });
    expect(scanresult(entry, "error", now + 1).scan).toBe("error");
    expect(scanverdictof({ verdict: "clean" })).toBe("clean");
    expect(scanverdictof({ verdict: "flagged" })).toBe("flagged");
    expect(scanverdictof({ verdict: "error" })).toBe("error");
    expect(scanverdictof({ verdict: "weird" })).toBe("pending");
    expect(scanverdictof(null)).toBe("pending");
    expect(scanverdictof("clean")).toBe("pending");
    expect(scanverdictof({})).toBe("pending");
    expect(released(entry, "user-9", now + 2)).toMatchObject({ release: "user-9", updatedat: now + 2 });
  });

  it("stamps capture filenames that slugs hostile task and step names into safe parts", () => {
    expect(capturefilename({ task: "Order Run", step: "Snap Shot", sequence: 4 }, ".PNG")).toBe("order-run-snap-shot-4.png");
    expect(capturefilename({ task: "../evil", step: "sh/../ot", sequence: 1 }, "png")).toBe("evil-sh-ot-1.png");
    expect(capturefilename({ task: "TÄSK é", step: "!", sequence: 2 }, "png")).toBe("t-sk-capture-2.png");
    expect(capturefilename({ task: "", step: "", sequence: 1 }, "")).toBe("capture-capture-1.png");
    expect(capturefilename({ task: "a", step: "b", sequence: 0 }, "png")).toBe("a-b-0.png");
    const stamped = capturenames({}, "task-1", ["snap", "peek", "snap"], "png");
    expect(stamped.names).toEqual(["task-1-snap-1.png", "task-1-peek-1.png", "task-1-snap-2.png"]);
    expect(stamped.counters).toEqual({ snap: 2, peek: 1 });
  });

  it("reads namecaptures step lists from options or the plan and sweeps cleanup rules", () => {
    expect(capturesteps({ steps: ["a", " ", 5] }, { steps: [] } as unknown as { steps: toolstep[] })).toEqual(["a"]);
    expect(capturesteps({}, { steps: [step("observe", { id: "one", risk: "read" }), step("click", { id: "two" })] })).toEqual(["one", "two"]);
    expect(referencedartifacts(undefined, [])).toEqual([]);
    const plan = { steps: [step("attachfile", { id: "af1", value: "invoice.pdf" }), step("attachfile", { id: "af2", value: "gone.pdf" }), step("attachfile", { id: "af3", value: " " }), step("observe", { id: "o1" })] };
    expect(referencedartifacts(plan, ["af1"])).toEqual(["gone.pdf"]);
    const entries: artifactinventoryentry[] = [
      { id: "a0", kind: "export-csv", name: "ancient.csv", size: 100, at: now - 9999 },
      { id: "a1", kind: "export-csv", name: "old.csv", size: 100, at: now - 5000 },
      { id: "a2", kind: "export-csv", name: "new.csv", size: 100, at: now - 1000 },
      { id: "a3", kind: "screenshot", name: "shot.png", size: 100, at: now - 9999 },
    ];
    const rules: cleanuprule[] = [{ age: 2000, kind: "export-csv", keep: "latest" }];
    expect(sweepplan(entries, rules, now, ["a0"]).remove).toEqual([]);
    expect(sweepplan(entries, rules, now, []).remove).toEqual(["a0"]);
    expect(sweepplan(entries, [{ age: 2000, kind: "any", keep: "all" }], now, []).remove).toEqual([]);
    expect(sweepplan(entries, [{ age: 0, kind: "any", keep: "none" }], now, ["shot.png"]).keep).toContain("a3");
    expect(sweepplan([], [{ age: 0, kind: "any", keep: "none" }], now, [])).toEqual({ remove: [], keep: [] });
  });
});

describe("torture: navigation intent, prefetch and deep links", () => {
  it("predicts nav intent from https step values with dedupe and history weighting", () => {
    const steps = [step("navigate", { value: "https://example.com/one" }), step("navigate", { value: "https://example.com/one" }), step("navigate", { value: "https://example.com/two" }), step("navigate", { value: "http://insecure.example" }), step("navigate", { value: "  " })];
    const visits: urlvisit[] = [{ url: "https://example.com/two", at: now - 100, runid: "run1" }, { url: "https://example.com/two", at: now - 50, runid: "run1" }];
    const plan = navintent({ id: "pf1", steps, visits, now });
    expect(plan.predictedurls.map(entry => entry.url)).toEqual(["https://example.com/two", "https://example.com/one"]);
    expect(plan.predictedurls[0]?.confidence).toBeGreaterThan(plan.predictedurls[1]?.confidence ?? 0);
    expect(navintent({ id: "pf1", steps: [], now }).predictedurls).toEqual([]);
    expect(() => navintent({ id: " ", steps, now })).toThrow(/needs its id/);
    const bare = navintent({ id: "pf2", steps: [step("navigate", { value: "https://example.com/x" })], now });
    expect(bare.predictedurls[0]?.confidence).toBeGreaterThan(0);
    expect(bare.predictedurls[0]?.confidence).toBeLessThanOrEqual(1);
  });

  it("warms only the granted origins while a stale plan drops every prediction", () => {
    const warmed = prefetchpage({ id: "w1", planid: "plan1", urls: ["https://example.com/a", "https://example.com/a", "https://other.example/b", "not a url"], grants: ["https://example.com"], now });
    expect(warmed.allowed).toEqual(["https://example.com/a"]);
    expect(warmed.refused).toEqual(["https://other.example/b", "not a url"]);
    expect(warmed.plan.predictedurls).toHaveLength(1);
    const stale = prefetchpage({ id: "w2", planid: "plan2", urls: ["https://example.com/a"], grants: ["https://example.com"], stored: { id: "w1", planid: "plan1", predictedurls: [{ url: "https://example.com/old", confidence: 0.9 }], createdat: now }, now });
    expect(stale.dropped).toEqual(["https://example.com/old"]);
    expect(() => prefetchpage({ id: " ", planid: "p", urls: [], grants: [], now })).toThrow(/needs its id/);
    expect(() => prefetchpage({ id: "w", planid: " ", urls: [], grants: [], now })).toThrow(/names the plan/i);
    expect(prefetchpage({ id: "w", planid: "p", urls: [], grants: [], now }).allowed).toEqual([]);
  });

  it("preconnects only granted, deduped, non empty origins", () => {
    const result = preconnectorigin({ origins: ["https://example.com", "https://example.com", " ", "https://other.example"], grants: ["https://example.com"], now });
    expect(result.targets).toEqual([{ origin: "https://example.com", expectedat: now, connected: true }]);
    expect(result.refused).toEqual(["https://other.example"]);
    expect(preconnectorigin({ origins: [], grants: [], now })).toEqual({ targets: [], refused: [] });
  });

  it("builds deep links with encoded parameters and refuses unknown apps and half parameters", () => {
    expect(deeplinkapp({ app: "github", params: { owner: "wenathlan", repo: "extension" } }).url).toBe("https://github.com/wenathlan/extension");
    expect(deeplinkapp({ app: "github", params: { owner: "wenathlan" } }).url).toBe("https://github.com/wenathlan");
    expect(deeplinkapp({ app: "youtube", params: { id: "dQw4w9WgXcQ" } }).url).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(deeplinkapp({ app: "youtube", params: { search: "dev think" } }).url).toBe("https://www.youtube.com/results?search_query=dev%20think");
    expect(deeplinkapp({ app: "wikipedia", params: { title: "Ünicode" } }).url).toBe("https://en.wikipedia.org/wiki/%C3%9Cnicode");
    expect(deeplinkapp({ app: "maps", params: { query: "a b&c" } }).url).toBe("https://www.google.com/maps/search/a%20b%26c");
    expect(deeplinkapp({ app: "custom", params: { p: "v" }, patterns: [{ app: "custom", origin: "https://custom.example", route: "/{p}", params: ["p"] }] }).url).toBe("https://custom.example/v");
    expect(() => deeplinkapp({ app: "custom", params: {}, patterns: [{ app: "custom", origin: "https://custom.example", route: "/{p}", params: ["p"] }] })).toThrow(/needs its reviewed parameters/);
    expect(deeplinkapp({ app: "github", params: { owner: "wenathlan" }, patterns: [{ app: "github", origin: "https://evil.example", route: "/{owner}/{repo}", params: ["owner", "repo"] }] }).url).toBe("https://github.com/wenathlan");
    expect(() => deeplinkapp({ app: "", params: {} })).toThrow(/names its web app/);
    expect(() => deeplinkapp({ app: "nope", params: {} })).toThrow(/not a known web app/);
  });
});

describe("torture: reopening, trails and consent pauses", () => {
  const records: closedtabrecord[] = [
    { id: "c1", url: "https://example.com/a", title: "A", tabid: 1, windowid: 1, closedat: now },
    { id: "c2", url: "https://example.com/b", title: "B", tabid: 2, windowid: 1, closedat: now - 100 },
    { id: "c3", url: "https://other.example/c", title: "C", tabid: 3, windowid: 1, closedat: now - 50 },
  ];

  it("reopens the most recent fresh record under a grant recheck and refuses replayed records", () => {
    const reopened = reopentab({ records, grants: ["https://example.com"], now: now + 10 });
    expect(reopened.id).toBe("c1");
    expect(reopened.reopenedat).toBe(now + 10);
    const nextfresh = reopentab({ records: [{ ...records[0]!, reopenedat: now - 5 }, records[1]!, { ...records[2]!, reopenedat: now - 4 }], grants: ["https://example.com"], now: now + 10 });
    expect(nextfresh.id).toBe("c2");
    expect(nextfresh.reopenedat).toBe(now + 10);
    expect(() => reopentab({ records: [{ ...records[0]!, reopenedat: now - 5 }], grants: ["https://example.com"], url: "https://example.com/a", now })).toThrow(/already reopened/);
    expect(() => reopentab({ records: [{ ...records[2]! }], grants: ["https://example.com"], now })).toThrow(/lost its grant/);
    expect(() => reopentab({ records: [], grants: [], now })).toThrow(/remembers none/);
    const explicit = reopentab({ records, grants: ["https://other.example"], url: "https://other.example/c", now });
    expect(explicit.id).toBe("c3");
    expect(() => reopentab({ records, grants: [], url: "https://example.com/a", now })).toThrow(/lost its grant/);
    expect(() => reopentab({ records, grants: [], url: "https://missing.example/z", now })).toThrow(/No closed tab record/);
  });

  it("restores the navigation trail in visit order folding consecutive duplicates per run", () => {
    const visits: urlvisit[] = [
      { url: "https://example.com/a", at: now + 10, runid: "run1" },
      { url: "https://example.com/b", at: now + 20, runid: "run1" },
      { url: "https://example.com/b", at: now + 30, runid: "run1" },
      { url: "https://example.com/c", at: now + 5, runid: "run2" },
      { url: "https://example.com/a", at: now + 40, runid: "run2" },
    ];
    expect(restoretrail({ visits, runid: "run1" }).map(entry => entry.url)).toEqual(["https://example.com/a", "https://example.com/b"]);
    expect(restoretrail({ visits, runid: "run2" }).map(entry => entry.url)).toEqual(["https://example.com/c", "https://example.com/a"]);
    expect(restoretrail({ visits }).map(entry => entry.runid)).toEqual([undefined, undefined, undefined, undefined]);
    expect(restoretrail({ visits: [], runid: "run1" })).toEqual([]);
    const ties: urlvisit[] = [{ url: "https://b.example", at: now, runid: "r" }, { url: "https://a.example", at: now, runid: "r" }];
    expect(restoretrail({ visits: ties }).map(entry => entry.url)).toEqual(["https://a.example", "https://b.example"]);
  });

  it("freezes navigation behind a consent prompt and hands the queued navigation back on resume", () => {
    const paused = pausenavconsent({ reason: "a payment consent is open", url: "https://example.com/pay", stepid: "s9", now });
    expect(paused).toMatchObject({ pausedat: now, reason: "a payment consent is open", pendingurl: "https://example.com/pay", pendingstepid: "s9" });
    const queued = pausenavconsent({ url: "https://example.com/next", stored: paused, now: now + 100 });
    expect(queued.pausedat).toBe(now);
    expect(queued.pendingurl).toBe("https://example.com/next");
    const resumed = resumenavconsent({ stored: queued, now: now + 200 });
    expect(resumed).toEqual({ resumed: true, queued });
    expect(resumenavconsent({ now }).resumed).toBe(false);
    expect(pausenavconsent({ now }).reason).toMatch(/consent prompt is open/);
  });
});

describe("torture: navigation rate windows at their exact boundaries", () => {
  it("counts with no configured window and ceiling while the sliding window ages hits exactly at the boundary", () => {
    const manual = navratelimit({ url: "https://example.com/a", now });
    expect(manual.allowed).toBe(true);
    expect(manual.window.count).toBe(1);
    expect(manual.window.window).toBeUndefined();
    const boundary = navratelimit({ stored: { domain: "example.com", count: 2, resetat: now, hits: [now - 1000], window: 1000, ceiling: 2 }, url: "https://example.com/a", now });
    expect(boundary.allowed).toBe(true);
    expect(boundary.window.count).toBe(1);
    const onebefore = navratelimit({ stored: { domain: "example.com", count: 2, resetat: now, hits: [now - 1, now - 1], window: 1000, ceiling: 2 }, url: "https://example.com/a", now });
    expect(onebefore.allowed).toBe(false);
    expect(onebefore.waitms).toBe(999);
    expect(onebefore.reason).toMatch(/waits 999 milliseconds/);
    const blocked = navratelimit({ stored: { domain: "example.com", count: 2, resetat: now, hits: [now - 500, now - 250], window: 1000, ceiling: 2 }, url: "https://example.com/a", now });
    expect(blocked.allowed).toBe(false);
    expect(blocked.waitms).toBe(500);
    expect(blocked.window.count).toBe(2);
    const single = navratelimit({ stored: { domain: "example.com", count: 1, resetat: now, hits: [now - 250], window: 1000, ceiling: 1 }, url: "https://example.com/a", now });
    expect(single.allowed).toBe(false);
    expect(single.reason).toMatch(/1 navigation/);
    expect(() => navratelimit({ url: "not a url", now })).toThrow(/needs its url/);
    expect(navratelimit({ url: "https://EXAMPLE.com/a", now }).window.domain).toBe("example.com");
  });

  it("opens clipboard urls only when https, parseable and granted", () => {
    expect(openclipboardurl({ text: "https://example.com/notes", grants: ["https://example.com"] }).url).toBe("https://example.com/notes");
    expect(() => openclipboardurl({ text: "  not a url  ", grants: [] })).toThrow(/no valid url/);
    expect(() => openclipboardurl({ text: "http://example.com/notes", grants: ["http://example.com"] })).toThrow(/HTTPS/);
    expect(() => openclipboardurl({ text: "ftp://example.com/f", grants: [] })).toThrow(/HTTPS/);
    expect(() => openclipboardurl({ text: "https://other.example/x", grants: ["https://example.com"] })).toThrow(/outside the session grants/);
  });
});

describe("torture: url safety with lookalikes, homographs and scheme tricks", () => {
  it("refuses lookalike hosts that imitate granted origins", () => {
    const granted = ["https://example.com"];
    expect(checksafeurl({ url: "https://sub.example.com/x", granted, now }).safe).toBe(true);
    expect(checksafeurl({ url: "https://example.com.evil.com/", granted, now }).safe).toBe(false);
    expect(checksafeurl({ url: "https://example.com.evil.com/", granted, now }).reasons.join(" ")).toContain("imitates the granted origin");
    expect(checksafeurl({ url: "https://evil-example.com/", granted, now }).safe).toBe(false);
    expect(checksafeurl({ url: "https://notexample.com/", granted, now }).safe).toBe(false);
    expect(checksafeurl({ url: "https://example.com/", granted, now }).safe).toBe(true);
    expect(checksafeurl({ url: "https://example.com/", granted: ["https://sub.example.com"], now }).safe).toBe(true);
  });

  it("refuses punycode and unicode homograph hosts", () => {
    expect(checksafeurl({ url: "https://xn--80ak6aa92e.com/", granted: [], now }).reasons.join(" ")).toContain("punycode");
    expect(checksafeurl({ url: "https://аpple.com/", granted: ["https://apple.com"], now }).safe).toBe(false);
    expect(checksafeurl({ url: "https://аpple.com/", granted: ["https://apple.com"], now }).reasons.join(" ")).toContain("punycode");
  });

  it("refuses weak schemes, embedded credentials, private and raw hosts, and unparseable urls", () => {
    expect(checksafeurl({ url: "http://example.com/", granted: [], now }).reasons).toContain("the url must use HTTPS");
    expect(checksafeurl({ url: "data:text/html;base64,PHNjcmlwdD4=", granted: [], now }).safe).toBe(false);
    expect(checksafeurl({ url: "blob:https://example.com/x", granted: [], now }).safe).toBe(false);
    expect(checksafeurl({ url: "file:///etc/passwd", granted: [], now }).safe).toBe(false);
    expect(checksafeurl({ url: "https://user:pass@example.com/", granted: [], now }).reasons.join(" ")).toContain("embedded credentials");
    expect(checksafeurl({ url: "https://localhost/app", granted: [], now }).reasons.join(" ")).toContain("private network");
    expect(checksafeurl({ url: "https://127.0.0.1/app", granted: [], now }).reasons.join(" ")).toContain("private network");
    expect(checksafeurl({ url: "https://10.1.2.3/", granted: [], now }).reasons.join(" ")).toContain("private network");
    expect(checksafeurl({ url: "https://192.168.0.9/", granted: [], now }).reasons.join(" ")).toContain("private network");
    expect(checksafeurl({ url: "https://172.16.0.1/", granted: [], now }).reasons.join(" ")).toContain("private network");
    expect(checksafeurl({ url: "https://172.99.0.1/", granted: [], now }).reasons.join(" ")).toContain("raw address");
    expect(checksafeurl({ url: "https://[::1]/", granted: [], now }).reasons.join(" ")).toContain("private network");
    expect(checksafeurl({ url: "https://8.8.8.8/", granted: [], now }).reasons.join(" ")).toContain("raw address");
    expect(checksafeurl({ url: "not a url at all", granted: [], now })).toMatchObject({ safe: false, reasons: ["the url does not parse"] });
    expect(checksafeurl({ url: "https://example.com/", granted: ["not a url"], now }).safe).toBe(true);
  });
});

describe("torture: curated batch opening with size bounds and full rate windows", () => {
  it("refuses the whole batch when one url is unsafe and never opens a tab", () => {
    const batch = batchopenlinks({ id: "b1", urls: ["https://example.com/a", "https://example.com.evil.com/"], grants: ["https://example.com"], windows: [], now });
    expect(batch.open).toEqual([]);
    expect(batch.ordered).toEqual([]);
    expect(batch.waits).toEqual([]);
    expect(batch.refused).toHaveLength(1);
    expect(batch.refused[0]?.reasons.join(" ")).toContain("imitates");
    expect(batch.reason).toMatch(/refuses as a whole/);
    expect(batch.batch.reviewedat).toBeUndefined();
    expect(() => batchopenlinks({ id: " ", urls: [], grants: [], windows: [], now })).toThrow(/needs its id/);
  });

  it("refuses a batch that passes the user ceiling without a code cap", () => {
    expect(() => batchopenlinks({ id: "b2", urls: ["https://example.com/a", "https://example.com/b"], grants: ["https://example.com"], windows: [], now, sizelimit: 1 })).toThrow(/passes the user configured ceiling/);
    expect(batchopenlinks({ id: "b3", urls: ["https://example.com/a", "https://example.com/b"], grants: ["https://example.com"], windows: [], now, sizelimit: 2 }).open).toHaveLength(2);
    expect(batchopenlinks({ id: "b4", urls: [], grants: [], windows: [], now, sizelimit: 1 }).open).toEqual([]);
  });

  it("moves urls onto waits when the per domain window is full instead of dropping them", () => {
    const full: ratelimitwindow = { domain: "example.com", count: 2, resetat: now + 500, hits: [now - 400, now - 300], window: 1000, ceiling: 2 };
    const batch = batchopenlinks({ id: "b5", urls: ["https://example.com/a", "https://example.com/b", "https://other.example/c"], grants: ["https://example.com", "https://other.example"], windows: [full], now, window: 1000 });
    expect(batch.open.map(entry => entry.url)).toEqual(["https://other.example/c"]);
    expect(batch.waits).toEqual([{ url: "https://example.com/a", waitms: 600 }, { url: "https://example.com/b", waitms: 600 }]);
    expect(batch.reason).toMatch(/never drops silently/);
    expect(batch.windows.find(window => window.domain === "example.com")?.count).toBe(2);
  });

  it("opens a thousand curated links with one tab per link under no ceiling", () => {
    const urls = Array.from({ length: 1000 }, (_, index) => `https://example.com/item/${index}`);
    const started = Date.now();
    const batch = batchopenlinks({ id: "b6", urls, grants: ["https://example.com"], windows: [], now });
    expect(batch.open).toHaveLength(1000);
    expect(batch.ordered).toHaveLength(1000);
    expect(batch.waits).toEqual([]);
    expect(new Set(batch.windows.map(window => window.domain))).toEqual(new Set(["example.com"]));
    expect(Date.now() - started).toBeLessThan(2000);
  });
});
