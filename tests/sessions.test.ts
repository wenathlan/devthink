import { describe, expect, it } from "vitest";
import { crashinterrupted, diffsessionrecords, expiresessions, exportsessionfile, filteredsessions, importsessionfile, newsessiondiff, newsessionrecord, restoreplanof, searchqueryof, searchsessionrecords, sessionfileversion, sessionfolderof, sessionkinds, sessiontabof, snapshotplanof, taskstateof, taskstatevalid } from "../session.js";
import { issessionkind, restorereviewgranted, restoreoriginsgranted, sessionfolderunique, sessionnameunique, sessionrestoregate, snapshotretentionwindow, validatestep } from "../policy.js";
import { outcomeresponse, parseproposal, sessionreport } from "../protocol.js";
import { recordsession, sessionevidences } from "../progress.js";
import { sessionmemory } from "../memory.js";
import { protocolversion } from "../types.js";
import type { agentplan, agentsession, sessionrecord, sessiontab, taskstate, toolstep } from "../types.js";

const now = 1_800_000_000_000;
const session: agentsession = { id: "sess", tabid: 4, origin: "https://example.com", startedat: now - 1000, expiresat: now + 600_000, grants: ["https://example.com"] };
const plan: agentplan = { id: "run", objective: "Persist the run", origin: "https://example.com", steps: [], createdat: now - 2000, expiresat: now + 600_000, state: "approved" };

function tab(index: number, url: string, forms: Array<{ selector: string; value: string }> = []): sessiontab {
  return { url, title: `Tab ${index}`, index, scrollx: index * 10, scrolly: index * 100, forms };
}

function record(id: string, overrides: Partial<sessionrecord> = {}): sessionrecord {
  return newsessionrecord({ id, name: `session ${id}`, createdat: now, tabs: [tab(0, "https://example.com/a"), tab(1, "https://example.com/b")], captures: ["cap1"], storage: [{ origin: "https://example.com", keys: ["theme"], values: ["dark"] }], cookies: [{ origin: "https://example.com", names: ["sid"] }], ...overrides });
}

function step(kind: toolstep["kind"], options?: Record<string, unknown>, risk: toolstep["risk"] = "read"): toolstep {
  return { id: "s1", kind, summary: "Reviewed session memory step", risk, ...(options !== undefined ? { options: JSON.stringify(options) } : {}) };
}

describe("task state persistence", () => {
  it("checkpoints the run with a checksum that detects corruption before any resume", () => {
    const state = taskstateof({ runid: "run", stepcursor: 2, outputs: [{ stepid: "s1", ok: true, summary: "done", at: now }], checkpointat: now });
    expect(taskstatevalid(state)).toBe(true);
    expect(taskstatevalid({ ...state, stepcursor: 5 } as taskstate)).toBe(false);
    expect(taskstatevalid({ ...state, outputs: [...state.outputs, { stepid: "s2", ok: true, summary: "injected", at: now }] })).toBe(false);
    expect(taskstatevalid(undefined)).toBe(false);
    expect(taskstatevalid({ ...state, runid: "" })).toBe(false);
  });

  it("marks runs interrupted by a browser restart and leaves complete runs untouched", () => {
    const interrupted = crashinterrupted(taskstateof({ runid: "run", stepcursor: 1, outputs: [], checkpointat: now }), 4, now + 5000);
    expect(interrupted?.interrupted).toBe(true);
    expect(interrupted?.crashat).toBe(now + 5000);
    const complete = taskstateof({ runid: "run", stepcursor: 4, outputs: [], checkpointat: now });
    expect(crashinterrupted(complete, 4, now + 5000)).toBe(complete);
    expect(crashinterrupted(undefined, 4, now)).toBeUndefined();
  });
});

describe("session grammars", () => {
  it("normalizes the snapshot plan, the restore plan, the auto interval, the search query and the folder", () => {
    const snapshot = snapshotplanof({ scope: "run", sections: ["tabs", "scroll", "forms", "storage", "cookies"], captures: true, auto: { period: 60_000, maxsnapshots: 5, expiry: 3_600_000 } });
    expect(snapshot?.scope).toBe("run");
    expect(snapshot?.sections).toHaveLength(5);
    expect(snapshot?.auto?.maxsnapshots).toBe(5);
    expect(snapshotplanof({ scope: "everywhere", sections: ["tabs"], captures: true })).toBeUndefined();
    expect(snapshotplanof({ scope: "run", sections: [], captures: true })).toBeUndefined();
    expect(snapshotplanof({ scope: "run", sections: ["tabs", "nope"], captures: true })?.sections).toEqual(["tabs"]);
    expect(snapshotplanof({ scope: "run", sections: ["tabs"], captures: true, auto: { period: 0, maxsnapshots: 1, expiry: 0 } })).toBeUndefined();
    expect(restoreplanof({ tabpolicy: "reopen", formpolicy: "restore", capturepolicy: "link" })).toEqual({ tabpolicy: "reopen", formpolicy: "restore", capturepolicy: "link" });
    expect(restoreplanof({ tabpolicy: "replace", formpolicy: "restore", capturepolicy: "link" })).toBeUndefined();
    expect(searchqueryof({ terms: ["login"], fields: ["urls", "names"] })?.fields).toEqual(["urls", "names"]);
    expect(searchqueryof({ terms: ["login"] })?.fields).toHaveLength(4);
    expect(searchqueryof({ terms: [] })).toBeUndefined();
    expect(searchqueryof({ terms: ["x"], fields: ["nope"] })).toBeUndefined();
    expect(searchqueryof({ terms: ["x"], from: now, to: now - 1 })).toBeUndefined();
    expect(sessionfolderof({ name: "work", tags: ["daily"] })?.tags).toEqual(["daily"]);
    expect(sessionfolderof({ name: " " })).toBeUndefined();
    expect(sessionkinds).toHaveLength(8);
    expect(issessionkind("capturesession")).toBe(true);
    expect(issessionkind("observe")).toBe(false);
  });

  it("normalizes captured tabs and drops broken form entries", () => {
    expect(sessiontabof({ url: "https://example.com", title: "Home", index: 2, scrollx: 5, scrolly: 9, forms: [{ selector: "#q", value: "devthink" }, { selector: "", value: "x" }] })).toEqual({ url: "https://example.com", title: "Home", index: 2, scrollx: 5, scrolly: 9, forms: [{ selector: "#q", value: "devthink" }] });
    expect(sessiontabof({ url: "https://example.com", title: "Home", index: -1 })).toBeUndefined();
    expect(sessiontabof({ url: "", title: "Home", index: 0 })).toBeUndefined();
    const minimal = sessiontabof({ url: "https://example.com", title: "Home", index: 0 });
    if (!minimal) throw new Error("The minimal tab fixture must parse.");
    expect(minimal.forms).toEqual([]);
  });
});

describe("session diff and search", () => {
  it("classifies tab, url, form and storage changes between two saved sessions", () => {
    const left = record("left", { tabs: [tab(0, "https://example.com/a", [{ selector: "#q", value: "old" }]), tab(1, "https://example.com/b")], storage: [{ origin: "https://example.com", keys: ["theme"], values: ["dark"] }] });
    const right = record("right", { tabs: [tab(0, "https://example.com/a2", [{ selector: "#q", value: "new" }, { selector: "#email", value: "a@b.c" }]), tab(2, "https://example.com/c")], storage: [{ origin: "https://example.com", keys: ["theme"], values: ["light"] }] });
    const changes = diffsessionrecords(left, right);
    const classes = changes.map(change => `${change.class}:${change.subject}`);
    expect(classes).toContain("added:tab");
    expect(classes).toContain("removed:tab");
    expect(classes).toContain("changed:url");
    expect(classes).toContain("changed:form");
    expect(classes).toContain("added:form");
    expect(classes).toContain("changed:storage");
    const diff = newsessiondiff({ id: "d1", left, right, at: now });
    expect(diff.leftid).toBe("left");
    expect(diff.changes).toHaveLength(changes.length);
  });

  it("matches urls, titles, names and captured text inside the reviewed time window", () => {
    const login = record("login", { name: "login session", createdat: now - 500, tabs: [tab(0, "https://example.com/signin", [{ selector: "#email", value: "user@example.com" }])] });
    const shop = record("shop", { name: "shopping session", createdat: now - 10_000, tabs: [tab(0, "https://example.com/cart")] });
    const urlquery = searchqueryof({ terms: ["signin"], fields: ["urls"] });
    if (!urlquery) throw new Error("The url query fixture must parse.");
    expect(searchsessionrecords(urlquery, [login, shop]).map(match => match.sessionid)).toEqual(["login"]);
    const namequery = searchqueryof({ terms: ["shopping"], fields: ["names"] });
    if (!namequery) throw new Error("The name query fixture must parse.");
    expect(searchsessionrecords(namequery, [login, shop])[0]?.excerpt).toContain("shopping session");
    const textquery = searchqueryof({ terms: ["user@example.com"], fields: ["text"] });
    if (!textquery) throw new Error("The text query fixture must parse.");
    expect(searchsessionrecords(textquery, [login, shop]).map(match => match.field)).toEqual(["text"]);
    const everyquery = searchqueryof({ terms: ["example"] });
    if (!everyquery) throw new Error("The default query fixture must parse.");
    expect(searchsessionrecords(everyquery, [login, shop])).toHaveLength(3);
    const windowed = searchqueryof({ terms: ["signin"], fields: ["urls"], from: now - 1000, to: now });
    if (!windowed) throw new Error("The windowed query fixture must parse.");
    expect(searchsessionrecords(windowed, [login, shop])).toHaveLength(1);
    const outside = searchqueryof({ terms: ["signin"], fields: ["urls"], from: now + 1 });
    if (!outside) throw new Error("The outside query fixture must parse.");
    expect(searchsessionrecords(outside, [login, shop])).toHaveLength(0);
  });
});

describe("session files and expiry", () => {
  it("round trips exported session files with the format version and checksum", () => {
    const file = exportsessionfile([record("one"), record("two")], now);
    expect(file.formatversion).toBe(sessionfileversion);
    expect(file.recordids).toEqual(["one", "two"]);
    expect(file.bytesize).toBeGreaterThan(0);
    const parsed = importsessionfile(JSON.parse(JSON.stringify(file)));
    expect(parsed?.records.map(entry => entry.id)).toEqual(["one", "two"]);
    expect(importsessionfile({ ...file, formatversion: 99 })).toBeUndefined();
    expect(importsessionfile({ ...file, checksum: "deadbeef" })).toBeUndefined();
    expect(importsessionfile({ ...file, recordids: ["two", "one"] })).toBeUndefined();
    expect(importsessionfile("nope")).toBeUndefined();
  });

  it("expires the heavy sections after the retention window while the metadata survives with no code ceiling", () => {
    const fresh = record("fresh");
    const old = record("old", { createdat: now - 10_000 });
    const expired = expiresessions([fresh, old], 5000, now);
    expect(expired[0]?.tabs).toHaveLength(2);
    expect(expired[1]?.tabs).toEqual([]);
    expect(expired[1]?.sectionsexpired).toBe(true);
    expect(expired[1]?.name).toBe("session old");
    expect(expired[1]?.storage).toEqual([]);
    expect(expiresessions([old], undefined, now)[0]?.tabs).toHaveLength(2);
    const auto = expiresessions([record("auto", { auto: true, createdat: now - 10_000 })], 5000, now)[0];
    expect(auto?.auto).toBe(true);
  });

  it("filters sessions by name substring, folder and time window", () => {
    const a = record("a", { name: "login run", createdat: now - 100, folder: "work" });
    const b = record("b", { name: "shopping run", createdat: now - 10_000 });
    expect(filteredsessions([a, b], { name: "login" }).map(entry => entry.id)).toEqual(["a"]);
    expect(filteredsessions([a, b], { folder: "work" }).map(entry => entry.id)).toEqual(["a"]);
    expect(filteredsessions([a, b], { from: now - 1000 }).map(entry => entry.id)).toEqual(["a"]);
    expect(filteredsessions([a, b], { to: now - 1000 }).map(entry => entry.id)).toEqual(["b"]);
  });
});

describe("session consent gates", () => {
  it("requires review of every restore plan behind the session consent gate", () => {
    const restorestep = step("restoresession", { sessionid: "one", restore: { tabpolicy: "reopen", formpolicy: "restore", capturepolicy: "link" }, reviewed: true, origins: ["https://example.com"] }, "sensitive");
    expect(sessionrestoregate({ session, plan, step: restorestep, tabid: 4, origin: "https://example.com", now }).allowed).toBe(true);
    expect(sessionrestoregate({ session: undefined, plan, step: restorestep, tabid: 4, origin: "https://example.com", now }).allowed).toBe(false);
    const paused: agentsession = { ...session, pausedat: now };
    expect(sessionrestoregate({ session: paused, plan, step: restorestep, tabid: 4, origin: "https://example.com", now }).allowed).toBe(false);
    expect(sessionrestoregate({ session, plan: { ...plan, state: "pending" }, step: restorestep, tabid: 4, origin: "https://example.com", now }).allowed).toBe(false);
    expect(sessionrestoregate({ session, plan, step: restorestep, tabid: 9, origin: "https://example.com", now }).allowed).toBe(false);
    expect(restorereviewgranted(step("restoresession", { sessionid: "one", restore: { tabpolicy: "reopen", formpolicy: "restore", capturepolicy: "link" } }, "sensitive")).allowed).toBe(false);
    expect(restorereviewgranted(restorestep).allowed).toBe(true);
  });

  it("skips and reports the origins a restore reopens outside the grants", () => {
    const outcome = restoreoriginsgranted(["https://example.com/a", "https://elsewhere.example/b", "https://other.example/c"], ["https://example.com"]);
    expect(outcome.allowed).toBe(false);
    expect(outcome.skippedorigins).toEqual(["https://elsewhere.example", "https://other.example"]);
    expect(restoreoriginsgranted(["https://example.com/a"], ["https://example.com"]).allowed).toBe(true);
  });

  it("requires unique session names and folder names", () => {
    const records = [{ id: "one", name: "login run" }];
    expect(sessionnameunique("login run", records).allowed).toBe(false);
    expect(sessionnameunique("login run", records, "one").allowed).toBe(true);
    expect(sessionnameunique("shopping run", records).allowed).toBe(true);
    expect(sessionfolderunique("work", [{ name: "work" }]).allowed).toBe(false);
    expect(sessionfolderunique("work", [{ name: "home" }]).allowed).toBe(true);
    expect(snapshotretentionwindow({ sessionretention: 5000 })).toBe(5000);
    expect(snapshotretentionwindow(undefined)).toBeUndefined();
  });

  it("validates the options payload of every session kind", () => {
    expect(validatestep(step("persiststate"), "https://example.com").allowed).toBe(true);
    expect(validatestep(step("persiststate", { resume: "yes" }), "https://example.com").allowed).toBe(false);
    expect(validatestep(step("capturesession", { snapshot: { scope: "run", sections: ["tabs"], captures: true } }), "https://example.com").allowed).toBe(true);
    expect(validatestep(step("capturesession"), "https://example.com").allowed).toBe(false);
    expect(validatestep(step("capturesession", { snapshot: { scope: "run", sections: ["tabs"], captures: true, auto: { period: -1, maxsnapshots: 2, expiry: 0 } } }), "https://example.com").allowed).toBe(false);
    expect(validatestep(step("restoresession", { sessionid: "one", restore: { tabpolicy: "reopen", formpolicy: "restore", capturepolicy: "link" }, reviewed: true }, "sensitive"), "https://example.com").allowed).toBe(true);
    expect(validateStepRefusal("restoresession", { sessionid: "one", restore: { tabpolicy: "reopen", formpolicy: "restore", capturepolicy: "link" } })).toContain("restore review");
    expect(validateStepRefusal("namedsessions", { sessionid: "one" })).toContain("name");
    expect(validateStepRefusal("diffsessions", {})).toContain("ids of both saved sessions");
    expect(validateStepRefusal("searchsessions", { query: { terms: [] } })).toContain("query");
    expect(validateStepRefusal("exportsessions", { ids: ["one"] })).toContain("export review");
    const file = exportsessionfile([record("one")], now);
    expect(validateStepRefusal("importsessions", { file })).toContain("full record review");
    expect(validatestep(step("importsessions", { reviewed: true, file }, "sensitive"), "https://example.com").allowed).toBe(true);
  });

  function validateStepRefusal(kind: toolstep["kind"], options: Record<string, unknown>): string {
    const evaluation = validatestep(step(kind, options, "sensitive"), "https://example.com");
    if (evaluation.allowed) throw new Error(`The ${kind} grammar must refuse the fixture.`);
    if (!evaluation.reason) throw new Error("The refusal must carry a reason.");
    return evaluation.reason;
  }

  it("refuses restores that reopen ungranted origins and import files of unknown versions in the proposal parser", () => {
    const file = exportsessionfile([record("one")], now);
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Restore a session", steps: [{ id: "s1", kind: "restoresession", summary: "Restore the saved session", options: JSON.stringify({ sessionid: "one", restore: { tabpolicy: "reopen", formpolicy: "restore", capturepolicy: "link" }, reviewed: true, origins: ["https://elsewhere.example"] }) }] } }, "https://example.com")).toThrow("outside the grants");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Import a session file", steps: [{ id: "s1", kind: "importsessions", summary: "Import the reviewed session file", options: JSON.stringify({ reviewed: true, file: { ...file, formatversion: 99 } }) }] } }, "https://example.com")).toThrow("unknown format versions");
    const accepted = parseproposal({ version: protocolversion, plan: { objective: "Restore a session", steps: [{ id: "s1", kind: "restoresession", summary: "Restore the saved session", options: JSON.stringify({ sessionid: "one", restore: { tabpolicy: "reopen", formpolicy: "restore", capturepolicy: "link" }, reviewed: true, origins: ["https://example.com/a"] }) }] } }, "https://example.com");
    expect(accepted.plan.steps[0]?.kind).toBe("restoresession");
  });
});

describe("session envelopes and evidence", () => {
  it("carries the session block with the record id and section counts in the outcome envelope", () => {
    const envelope = JSON.parse(outcomeresponse({ outcome: { stepid: "s1", ok: true, summary: "Captured 2 tabs.", at: now }, plan, session: { recordid: "one", sections: 5, matches: 3, restored: 2, skipped: 1, cursor: 4, bytes: 900 } }));
    expect(envelope.session.recordid).toBe("one");
    expect(envelope.session.sections).toBe(5);
    expect(envelope.session.matches).toBe(3);
    expect(envelope.session.restored).toBe(2);
    expect(envelope.session.skipped).toBe(1);
    expect(envelope.session.cursor).toBe(4);
    expect(envelope.session.bytes).toBe(900);
  });

  it("builds the session report envelope with records, events, folders, diffs and the auto interval", () => {
    const report = sessionreport({ records: [record("one")], events: [{ id: "e1", kind: "capture", at: now, detail: "Captured 2 tabs." }], folders: [{ name: "work", tags: [] }], diffs: [newsessiondiff({ id: "d1", left: record("one"), right: record("two"), at: now })], auto: { period: 60_000, maxsnapshots: 5, expiry: 3_600_000 }, crashed: true });
    expect(report.version).toBe(protocolversion);
    expect(report.records[0]?.id).toBe("one");
    expect(report.events[0]?.kind).toBe("capture");
    expect(report.folders[0]?.name).toBe("work");
    expect(report.diffs[0]?.leftid).toBe("one");
    expect(report.auto?.period).toBe(60_000);
    expect(report.crashed).toBe(true);
  });

  it("records session evidence in the plan progress outcome log", () => {
    let progress = recordsession(undefined, "run", "s1", { family: "capture", detail: "Captured the session record one", recordid: "one", sections: 5 }, now);
    progress = recordsession(progress, "run", "s2", { family: "restore", detail: "Restored the session record one", restored: 2, skipped: 1 }, now + 1);
    expect(sessionevidences(progress, "run", "s1")[0]?.recordid).toBe("one");
    expect(sessionevidences(progress, "run", "s2")[0]?.restored).toBe(2);
    expect((progress.outcomes ?? [])[1]?.summary).toContain("2 restored tabs");
    expect(sessionevidences(progress, "run", "missing")).toEqual([]);
  });
});

describe("session memory store", () => {
  class fakeadapter {
    private readonly data = new Map<string, unknown>();
    async get<T>(key: string): Promise<T | undefined> { return this.data.get(key) as T | undefined; }
    async set<T>(key: string, value: T): Promise<void> { this.data.set(key, value); }
  }

  it("stores task state checkpoints per run, session events, records, folders, diffs, the auto interval and the crash marker", async () => {
    const store = new sessionmemory(new fakeadapter());
    const state = taskstateof({ runid: "run", stepcursor: 1, outputs: [], checkpointat: now });
    await store.settaskstate(state);
    expect((await store.gettaskstate("run"))?.stepcursor).toBe(1);
    await store.addsessionevent({ id: "e1", kind: "capture", at: now, detail: "Captured 2 tabs." });
    expect((await store.getsessionevents())[0]?.kind).toBe("capture");
    await store.addsessionrecord(record("one"));
    await store.addsessionrecord(record("two", { name: "login run" }));
    expect((await store.getsessionrecords()).map(entry => entry.id)).toEqual(["two", "one"]);
    expect((await store.listsessions({ name: "login" })).map(entry => entry.id)).toEqual(["two"]);
    expect((await store.getsessionrecord("one"))?.tabs).toHaveLength(2);
    await store.updatesessionrecord({ ...record("one"), restoredat: now });
    expect((await store.getsessionrecord("one"))?.restoredat).toBe(now);
    await store.setsessionfolders([{ name: "work", tags: ["daily"] }]);
    expect((await store.getsessionfolders())[0]?.name).toBe("work");
    await store.addsessiondiff(newsessiondiff({ id: "d1", left: record("one"), right: record("two"), at: now }));
    expect((await store.getsessiondiffs())[0]?.leftid).toBe("one");
    await store.setautosnapshot({ interval: { period: 60_000, maxsnapshots: 5, expiry: 3_600_000 }, lastat: now, count: 1 });
    expect((await store.getautosnapshot())?.count).toBe(1);
    await store.clearautosnapshot();
    expect(await store.getautosnapshot()).toBeUndefined();
    await store.setcrashflag(true);
    expect(await store.getcrashflag()).toBe(true);
    const query = searchqueryof({ terms: ["login"], fields: ["names"] });
    if (!query) throw new Error("The search query fixture must parse.");
    expect((await store.searchmemory(query)).map(match => match.sessionid)).toEqual(["two"]);
    const expired = await store.applysessionexpiry(1, now + 10_000);
    expect(expired.every(entry => entry.sectionsexpired === true)).toBe(true);
  });
});
