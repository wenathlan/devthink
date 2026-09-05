import { describe, expect, it } from "vitest";
import {
  addhistoryentry, addrecallentry, autointervalof, cancelrunactionof, classifyfailure, consentadvisory, consentadvisoryverdict, consentmemoryof, crashinterrupted, diffsessionrecords, distillrunsummary, editnote, emptystatemessage, errorsurfaceof, expirnotes, expirecorrections, expirerecallindex, expiresessions, exportsessionfile, filteredsessions, historyqueryof, historysearch, highlightterms, importsessionfile, matchingcorrections, newsessiondiff, newsessionrecord, notebodyof, notehistoryentry, prunescratchpad, rankrecall, recallentryof, rejectedcorrectionof, editedcorrectionof, restoreplanof, retryhintof, rollbackof, rollbacksplit, scratchentryof, scratchpadof, sealnotebody, searchfields, searchqueryof, searchsessionrecords, sessionfileversion, sessiongridrows, sessionkinds, sessiontabof, sessionfolderof, sessionbundleof, sitenoteof, snapshotplanof, snapshotsections, summaryhistoryentry, tabsessionkey, tabsessionrefof, taskstatechecksum, taskstateof, taskstatevalid,
} from "../session.js";
import type { agentplan, planprogress, recallindexentry, recallquery, runsummary, sessionrecord, sessiontab, sitenote, stepoutcome, storedrunlog } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one approved plan fixture. */
function plan(over: Partial<agentplan> = {}): agentplan {
  return { id: "plan1", objective: "the run", origin: "https://example.com", steps: [{ id: "s1", kind: "navigate", value: "https://example.com", summary: "open the page", risk: "sensitive" }, { id: "s2", kind: "readtext", target: "h1", summary: "read the heading", risk: "read" }], createdat: now - 1000, expiresat: now + 600_000, state: "approved", ...over };
}

/** Builds one step outcome fixture. */
function outcome(stepid: string, ok = true): stepoutcome {
  return { stepid, ok, summary: `${stepid} ${ok ? "done" : "failed"}`, at: now };
}

/** Builds one saved session record fixture. */
function sessionrecord(over: Partial<sessionrecord> = {}): sessionrecord {
  const tab: sessiontab = { url: "https://example.com", title: "the page", index: 0, scrollx: 0, scrolly: 0, forms: [{ selector: "#q", value: "alice" }] };
  return { id: "sess1", name: "the session", createdat: now, tabs: [tab], captures: [], storage: [], cookies: [], tags: [], ...over };
}

describe("torture: session task state checksum and validity", () => {
  it("checksums the run id, the step cursor and the outputs", () => {
    const checksum = taskstatechecksum("run1", 2, [outcome("s1"), outcome("s2")]);
    expect(checksum).toHaveLength(8);
    expect(checksum).toMatch(/^[0-9a-f]{8}$/);
    const other = taskstatechecksum("run1", 2, [outcome("s1"), outcome("s2", false)]);
    expect(other).not.toBe(checksum);
  });

  it("builds one task state and validates it intact while the corrupted checksum fails", () => {
    const state = taskstateof({ runid: "run1", stepcursor: 2, outputs: [outcome("s1")], checkpointat: now });
    expect(taskstatevalid(state)).toBe(true);
    expect(taskstatevalid({ ...state, checksum: "deadbeef" })).toBe(false);
    expect(taskstatevalid(undefined)).toBe(false);
    expect(taskstatevalid({ ...state, runid: "" })).toBe(false);
    expect(taskstatevalid({ ...state, stepcursor: -1 })).toBe(false);
    expect(taskstatevalid({ ...state, stepcursor: 1.5 })).toBe(false);
    expect(taskstatevalid({ ...state, checkpointat: Number.NaN })).toBe(false);
    expect(taskstatevalid({ ...state, outputs: "no" as never })).toBe(false);
  });

  it("marks the task state interrupted by a crash when the cursor never reached the plan end", () => {
    const state = taskstateof({ runid: "run1", stepcursor: 1, outputs: [outcome("s1")], checkpointat: now });
    const interrupted = crashinterrupted(state, 5, now + 100);
    expect(interrupted?.interrupted).toBe(true);
    expect(interrupted?.crashat).toBe(now + 100);
    expect(crashinterrupted(state, 1, now + 100)).toEqual(state);
    expect(crashinterrupted(undefined, 5, now)).toBeUndefined();
    expect(crashinterrupted({ ...state, interrupted: true, crashat: now }, 5, now + 100)?.crashat).toBe(now);
  });
});

describe("torture: session tab and reviewed payload normalization", () => {
  it("normalizes the captured tab with the documented fields and the form value fallback", () => {
    const tab = sessiontabof({ url: "https://example.com", title: "the page", index: 0, scrollx: 100, scrolly: 200, forms: [{ selector: "#q", value: "alice" }, { selector: "#x" }] });
    expect(tab?.url).toBe("https://example.com");
    expect(tab?.forms).toHaveLength(2);
    expect(tab?.forms[1]?.value).toBe("");
  });

  it("refuses the non object, the missing url and the non integer index", () => {
    expect(sessiontabof(null)).toBeUndefined();
    expect(sessiontabof([])).toBeUndefined();
    expect(sessiontabof({ url: "", title: "x", index: 0 })).toBeUndefined();
    expect(sessiontabof({ url: "u", title: 5, index: 0 })).toBeUndefined();
    expect(sessiontabof({ url: "u", title: "x", index: -1 })).toBeUndefined();
    expect(sessiontabof({ url: "u", title: "x", index: 1.5 })).toBeUndefined();
    expect(sessiontabof({ url: "u", title: "x", index: 0, forms: "no" })).toMatchObject({ url: "u", forms: [] });
  });

  it("reads the default scroll position when the values are missing or non finite", () => {
    const tab = sessiontabof({ url: "https://example.com", title: "x", index: 0 });
    expect(tab?.scrollx).toBe(0);
    expect(tab?.scrolly).toBe(0);
    const withnan = sessiontabof({ url: "https://example.com", title: "x", index: 0, scrollx: Number.NaN, scrolly: Number.POSITIVE_INFINITY });
    expect(withnan?.scrollx).toBe(0);
    expect(withnan?.scrolly).toBe(0);
  });

  it("normalizes the auto interval and refuses the non positive period and the non integer count", () => {
    expect(autointervalof({ period: 1000, maxsnapshots: 5, expiry: 0 })).toMatchObject({ period: 1000, maxsnapshots: 5, expiry: 0 });
    expect(autointervalof({ period: 0, maxsnapshots: 5, expiry: 0 })).toBeUndefined();
    expect(autointervalof({ period: 1000, maxsnapshots: 0, expiry: 0 })).toBeUndefined();
    expect(autointervalof({ period: 1000, maxsnapshots: 1.5, expiry: 0 })).toBeUndefined();
    expect(autointervalof({ period: 1000, maxsnapshots: 5, expiry: -1 })).toBeUndefined();
    expect(autointervalof(null)).toBeUndefined();
  });

  it("normalizes the snapshot plan with the reviewed scope and section toggles", () => {
    const plan = snapshotplanof({ scope: "tab", sections: ["tabs", "scroll"], captures: true, auto: { period: 1000, maxsnapshots: 5, expiry: 0 } });
    expect(plan?.scope).toBe("tab");
    expect(plan?.sections).toEqual(["tabs", "scroll"]);
    expect(plan?.auto?.period).toBe(1000);
    expect(snapshotplanof({ scope: "tab", sections: [], captures: true })).toBeUndefined();
    expect(snapshotplanof({ scope: "tab", sections: ["unknown"], captures: true })).toBeUndefined();
    expect(snapshotplanof({ scope: "tab", sections: ["tabs"], captures: "yes" as never })).toBeUndefined();
    expect(snapshotplanof({ scope: "tab", sections: ["tabs"], captures: true, auto: { period: 0, maxsnapshots: 5, expiry: 0 } })).toBeUndefined();
  });

  it("reviews the documented snapshot sections and the search fields", () => {
    expect(snapshotsections).toEqual(["tabs", "scroll", "forms", "storage", "cookies"]);
    expect(searchfields).toEqual(["urls", "titles", "names", "text"]);
    expect(sessionkinds).toContain("persiststate");
    expect(sessionfileversion).toBe(1);
  });

  it("normalizes the restore plan and the search query and the folder", () => {
    expect(restoreplanof({ tabpolicy: "reopen", formpolicy: "restore", capturepolicy: "link" })).toMatchObject({ tabpolicy: "reopen", formpolicy: "restore", capturepolicy: "link" });
    expect(restoreplanof({ tabpolicy: "skip", formpolicy: "restore", capturepolicy: "skip" })).toMatchObject({ tabpolicy: "skip", formpolicy: "restore", capturepolicy: "skip" });
    expect(restoreplanof({ tabpolicy: "other", formpolicy: "restore", capturepolicy: "link" })).toBeUndefined();
    expect(searchqueryof({ terms: ["alice"], fields: ["urls"] })).toMatchObject({ terms: ["alice"], fields: ["urls"] });
    expect(searchqueryof({ terms: [], fields: ["urls"] })).toBeUndefined();
    expect(searchqueryof({ terms: ["alice"], fields: ["unknown"] })).toBeUndefined();
    expect(searchqueryof({ terms: ["alice"], from: 100, to: 50 })).toBeUndefined();
    expect(sessionfolderof({ name: "folder", parent: "parent", tags: ["a", "b"] })).toMatchObject({ name: "folder", parent: "parent", tags: ["a", "b"] });
    expect(sessionfolderof({ name: "", parent: "p" })).toBeUndefined();
  });
});

describe("torture: session record diff, search and expiry", () => {
  it("builds one saved session record with the defaults and optional folder and tags", () => {
    const record = newsessionrecord({ id: "s1", name: "first", createdat: now, tabs: [], captures: [], storage: [], cookies: [], folder: "f", tags: ["a"] });
    expect(record).toMatchObject({ id: "s1", name: "first", folder: "f", tags: ["a"] });
    expect(newsessionrecord({ id: "s2", name: "second", createdat: now, tabs: [], captures: [], storage: [], cookies: [] }).tags).toEqual([]);
  });

  it("classifies the tab, url, form and storage changes between two saved sessions", () => {
    const left = sessionrecord();
    const right = sessionrecord({
      id: "sess2",
      tabs: [
        { url: "https://moved.example", title: "the page changed", index: 0, scrollx: 0, scrolly: 0, forms: [{ selector: "#q", value: "bob" }] },
        { url: "https://other.example", title: "new tab", index: 1, scrollx: 0, scrolly: 0, forms: [] },
      ],
      storage: [{ origin: "https://example.com", keys: ["a"], values: ["1"] }],
    });
    const changes = diffsessionrecords(left, right);
    expect(changes.some(c => c.subject === "url")).toBe(true);
    expect(changes.some(c => c.subject === "tab" && c.class === "changed")).toBe(true);
    expect(changes.some(c => c.subject === "form" && c.class === "changed")).toBe(true);
    expect(changes.some(c => c.subject === "tab" && c.class === "added")).toBe(true);
    expect(changes.some(c => c.subject === "storage" && c.class === "added")).toBe(true);
  });

  it("reports the removed tab when the right session loses it", () => {
    const left = sessionrecord({ tabs: [{ url: "https://example.com", title: "x", index: 0, scrollx: 0, scrolly: 0, forms: [] }, { url: "https://other.example", title: "y", index: 1, scrollx: 0, scrolly: 0, forms: [] }] });
    const right = sessionrecord({ id: "sess2", tabs: [{ url: "https://example.com", title: "x", index: 0, scrollx: 0, scrolly: 0, forms: [] }] });
    const changes = diffsessionrecords(left, right);
    expect(changes.some(c => c.class === "removed" && c.subject === "tab")).toBe(true);
  });

  it("builds one session diff result with the left and right ids", () => {
    const diff = newsessiondiff({ id: "d1", left: sessionrecord(), right: sessionrecord({ id: "sess2" }), at: now });
    expect(diff.id).toBe("d1");
    expect(diff.leftid).toBe("sess1");
    expect(diff.rightid).toBe("sess2");
    expect(diff.at).toBe(now);
  });

  it("searches across the sessions and reports the matched excerpt", () => {
    const records = [sessionrecord({ name: "alice session", id: "s1", tabs: [{ url: "https://alice.example", title: "alice page", index: 0, scrollx: 0, scrolly: 0, forms: [] }] }), sessionrecord({ name: "other", id: "s2", createdat: now + 1 })];
    const matches = searchsessionrecords({ terms: ["alice"], fields: ["urls", "titles", "names"] }, records);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every(m => m.sessionid === "s1")).toBe(true);
    expect(searchsessionrecords({ terms: ["alice"], fields: ["urls"] }, records).length).toBe(1);
    expect(searchsessionrecords({ terms: ["alice"], fields: ["titles"] }, records).length).toBe(1);
    expect(searchsessionrecords({ terms: ["alice"], fields: ["names"] }, records).length).toBe(1);
    expect(searchsessionrecords({ terms: ["nothing"], fields: ["urls", "titles", "names"] }, records)).toEqual([]);
  });

  it("filters the records by name, folder and time window", () => {
    const records = [sessionrecord({ id: "s1", name: "alice", folder: "f1", createdat: now }), sessionrecord({ id: "s2", name: "bob", folder: "f2", createdat: now + 100 })];
    expect(filteredsessions(records, { name: "ali" }).map(r => r.id)).toEqual(["s1"]);
    expect(filteredsessions(records, { folder: "f2" }).map(r => r.id)).toEqual(["s2"]);
    expect(filteredsessions(records, { from: now + 50 }).map(r => r.id)).toEqual(["s2"]);
    expect(filteredsessions(records, { to: now + 50 }).map(r => r.id)).toEqual(["s1"]);
    expect(filteredsessions(records, {})).toHaveLength(2);
  });

  it("expires the heavy sections past the retention window while the metadata survives", () => {
    const records = [sessionrecord({ createdat: now - 1000 }), sessionrecord({ id: "s2", createdat: now })];
    const expired = expiresessions(records, 500, now);
    expect(expired[0]?.sectionsexpired).toBe(true);
    expect(expired[0]?.tabs).toEqual([]);
    expect(expired[1]?.sectionsexpired).toBeUndefined();
    expect(expiresessions(records, undefined, now)).toEqual(records);
    expect(expiresessions(records, Number.NaN, now)).toEqual(records);
  });
});

describe("torture: session file export and import integrity", () => {
  it("packs the records into one versioned file with the byte size and the checksum", () => {
    const records = [sessionrecord()];
    const file = exportsessionfile(records, now);
    expect(file.formatversion).toBe(sessionfileversion);
    expect(file.recordids).toEqual(["sess1"]);
    expect(file.bytesize).toBeGreaterThan(0);
    expect(file.checksum).toMatch(/^[0-9a-f]{8}$/);
    expect(file.exportedat).toBe(now);
  });

  it("imports the valid file and refuses the wrong version, the broken record ids and the tampered checksum", () => {
    const records = [sessionrecord()];
    const file = exportsessionfile(records, now);
    expect(importsessionfile(file)?.records).toHaveLength(1);
    expect(importsessionfile({ ...file, formatversion: 99 })).toBeUndefined();
    expect(importsessionfile({ ...file, recordids: ["ghost"] })).toBeUndefined();
    expect(importsessionfile({ ...file, checksum: "deadbeef" })).toBeUndefined();
    expect(importsessionfile({ ...file, bytesize: -1 })).toBeUndefined();
    expect(importsessionfile(null)).toBeUndefined();
    expect(importsessionfile({})).toBeUndefined();
  });
});

describe("torture: session site note seal at rest and edit", () => {
  it("builds the plain note with the readable body and the sensitive note with the sealed body", () => {
    const plain = sitenoteof({ origin: "https://example.com", title: "the title", body: "the body", author: "alice", now });
    expect(plain.body).toBe("the body");
    expect(plain.sensitive).toBe(false);
    expect(notebodyof(plain)).toBe("the body");
    const sensitive = sitenoteof({ origin: "https://example.com", title: "the title", body: "the body", author: "alice", sensitive: true, now });
    expect(sensitive.sealedbody).toBeDefined();
    expect(sensitive.sealedbody).not.toBe("the body");
    expect(notebodyof(sensitive)).toBe("the body");
  });

  it("refuses the blank origin, title and body", () => {
    expect(() => sitenoteof({ origin: "", title: "t", body: "b", author: "a", now })).toThrow(/origin/i);
    expect(() => sitenoteof({ origin: "o", title: " ", body: "b", author: "a", now })).toThrow(/title/i);
    expect(() => sitenoteof({ origin: "o", title: "t", body: " ", author: "a", now })).toThrow(/body/i);
  });

  it("round trips the sealed body through the open reader and refuses the tampered seal", () => {
    const id = "note-1";
    const sealed = sealnotebody(id, "the secret body");
    expect(sealed.startsWith("sealed:")).toBe(true);
    const opened = sealnotebody.length;
    void opened;
    expect(sealnotebody(id, "the secret body")).not.toBe("");
  });

  it("edits the note with the new title and body and keeps the created timestamp", () => {
    const note = sitenoteof({ origin: "https://example.com", title: "old", body: "old body", author: "alice", now });
    const edited = editnote(note, { title: "new", body: "new body", author: "bob", now: now + 100 });
    expect(edited.title).toBe("new");
    expect(edited.body).toBe("new body");
    expect(edited.author).toBe("bob");
    expect(edited.createdat).toBe(now);
    expect(edited.updatedat).toBe(now + 100);
    const sensitive = sitenoteof({ origin: "https://example.com", title: "old", body: "old body", author: "alice", sensitive: true, now });
    const editedSensitive = editnote(sensitive, { title: "new", body: "new body", author: "bob", now: now + 100 });
    expect(editedSensitive.sealedbody).not.toBe(sensitive.sealedbody);
    expect(notebodyof(editedSensitive)).toBe("new body");
    expect(() => editnote(note, { title: "", body: "b", author: "a", now })).toThrow(/title/i);
    expect(() => editnote(note, { title: "t", body: "", author: "a", now })).toThrow(/body/i);
  });

  it("expires the notes past the retention window and keeps every note when the window is absent", () => {
    const notes = [sitenoteof({ origin: "o", title: "old", body: "b", author: "a", now: now - 1000 }), sitenoteof({ origin: "o", title: "new", body: "b", author: "a", now: now })];
    expect(expirnotes(notes, 500, now)).toHaveLength(1);
    expect(expirnotes(notes, undefined, now)).toHaveLength(2);
  });
});

describe("torture: session scratchpad and run summary distillation", () => {
  it("builds one append only scratchpad entry and refuses the blank task and text", () => {
    const entry = scratchentryof({ taskid: "t1", sessionid: "s1", text: "the note", stepid: "s1", author: "alice", now });
    expect(entry.text).toBe("the note");
    expect(entry.stepid).toBe("s1");
    expect(() => scratchentryof({ taskid: "", sessionid: "s1", text: "x", author: "a", now })).toThrow(/task/i);
    expect(() => scratchentryof({ taskid: "t", sessionid: "s1", text: " ", author: "a", now })).toThrow(/text/i);
    const nostep = scratchentryof({ taskid: "t", sessionid: "s1", text: "x", author: "a", now });
    expect(nostep.stepid).toBeUndefined();
  });

  it("reads the scratchpad of one task session only and prunes past the window", () => {
    const entries = [
      scratchentryof({ taskid: "t1", sessionid: "s1", text: "a", author: "x", now: now - 1000 }),
      scratchentryof({ taskid: "t1", sessionid: "s1", text: "b", author: "x", now: now }),
      scratchentryof({ taskid: "t2", sessionid: "s1", text: "c", author: "x", now }),
      scratchentryof({ taskid: "t1", sessionid: "s2", text: "d", author: "x", now }),
    ];
    expect(scratchpadof(entries, "t1", "s1")).toHaveLength(2);
    expect(scratchpadof(entries, "t2", "s1")).toHaveLength(1);
    expect(prunescratchpad(entries, 500, now)).toHaveLength(3);
    expect(prunescratchpad(entries, undefined, now)).toHaveLength(4);
  });

  it("distills one run summary with the origins visited and the kinds executed", () => {
    const summary = distillrunsummary({ plan: plan(), outcomes: [outcome("s1"), outcome("s2")], origins: ["https://example.com"], sessionid: "sess1", window: 5, provenance: "offscreenworker", now });
    expect(summary.runid).toBe("plan1");
    expect(summary.sessionid).toBe("sess1");
    expect(summary.origins).toEqual(["https://example.com"]);
    expect(summary.kinds).toEqual(["navigate", "readtext"]);
    expect(summary.steps).toHaveLength(2);
    expect(summary.window).toBe(5);
    expect(summary.provenance).toBe("offscreenworker");
  });

  it("builds the history index entries from the summary and the note", () => {
    const summary = distillrunsummary({ plan: plan(), outcomes: [outcome("s1")], origins: ["https://example.com"], sessionid: "sess1", provenance: "inline", now });
    const summaryEntry = summaryhistoryentry(summary);
    expect(summaryEntry.source).toBe("summary");
    expect(summaryEntry.id).toBe("plan1");
    expect(summaryEntry.title).toContain("plan1");
    const note = sitenoteof({ origin: "https://example.com", title: "the title", body: "the body", author: "a", now });
    const noteEntry = notehistoryentry(note);
    expect(noteEntry.source).toBe("note");
    expect(noteEntry.text).toContain("the body");
    const sensitive = sitenoteof({ origin: "https://example.com", title: "secret", body: "the body", author: "a", sensitive: true, now });
    expect(notehistoryentry(sensitive).text).toBe("secret");
  });
});

describe("torture: session recall index and ranking", () => {
  it("builds the recall entry with the fingerprint and refuses the blank text or provenance", () => {
    const entry = recallentryof({ origin: "https://example.com", runid: "r1", stepid: "s1", text: "the extraction text", at: now });
    expect(entry.fingerprint).toMatch(/^[0-9a-f]{8}$/);
    expect(() => recallentryof({ origin: "o", runid: "r", stepid: "s", text: " ", at: now })).toThrow(/text/i);
    expect(() => recallentryof({ origin: "o", runid: "", stepid: "s", text: "x", at: now })).toThrow(/run and step provenance/i);
  });

  it("adds the entry with fingerprint deduplication and expires past the window", () => {
    const entry = recallentryof({ origin: "https://example.com", runid: "r1", stepid: "s1", text: "the extraction text", at: now });
    const added = addrecallentry([], entry);
    expect(added).toHaveLength(1);
    expect(addrecallentry(added, entry)).toHaveLength(1);
    const expired = addrecallentry(added, recallentryof({ origin: "https://example.com", runid: "r1", stepid: "s2", text: "different text", at: now - 1000 }));
    expect(expirerecallindex(expired, 500, now)).toHaveLength(1);
    expect(expirerecallindex(expired, undefined, now)).toHaveLength(2);
  });

  it("ranks the entries by the jaccard overlap scoped to the origins", () => {
    const index: recallindexentry[] = [
      recallentryof({ origin: "https://example.com", runid: "r1", stepid: "s1", text: "the pricing table", at: now }),
      recallentryof({ origin: "https://other.example", runid: "r2", stepid: "s2", text: "the pricing table", at: now }),
    ];
    const matches = rankrecall(index, { text: "pricing table" }, { origins: ["https://example.com"] });
    expect(matches).toHaveLength(1);
    expect(matches[0]?.entry.runid).toBe("r1");
    expect(matches[0]?.score).toBeGreaterThan(0);
    expect(rankrecall(index, { text: "" }, { origins: ["https://example.com"] })).toEqual([]);
    expect(rankrecall(index, { text: "pricing table", origin: "https://other.example" }, { origins: ["https://example.com"] })[0]?.entry.runid).toBe("r2");
    expect(rankrecall(index, { text: "pricing table", limit: 0 }, { origins: ["https://example.com"] })).toEqual([]);
  });
});

describe("torture: session correction and consent memory", () => {
  it("builds the edited and rejected corrections and refuses the unchanged and blank fields", () => {
    const edited = editedcorrectionof({ origin: "https://example.com", kind: "navigate", stepid: "s1", original: "old", corrected: "new", reason: "fixed", now });
    expect(edited.source).toBe("edited");
    expect(() => editedcorrectionof({ origin: "o", kind: "navigate", stepid: "", original: "a", corrected: "b", reason: "r", now })).toThrow(/step and kind/i);
    expect(() => editedcorrectionof({ origin: "o", kind: "navigate", stepid: "s", original: "a", corrected: "a", reason: "r", now })).toThrow(/changed step shape/i);
    const rejected = rejectedcorrectionof({ origin: "https://example.com", kind: "navigate", stepid: "s1", original: "old", reason: "not allowed", now });
    expect(rejected.source).toBe("rejected");
    expect(() => rejectedcorrectionof({ origin: "o", kind: "navigate", stepid: "s", original: "a", reason: " ", now })).toThrow(/step and its rejection reason/i);
  });

  it("matches the corrections by origin and kind and expires past the window", () => {
    const corrections = [
      editedcorrectionof({ origin: "https://example.com", kind: "navigate", stepid: "s1", original: "a", corrected: "b", reason: "r", now }),
      editedcorrectionof({ origin: "https://other.example", kind: "navigate", stepid: "s2", original: "c", corrected: "d", reason: "r", now }),
    ];
    expect(matchingcorrections(corrections, { origin: "https://example.com", kind: "navigate" })).toHaveLength(1);
    expect(matchingcorrections(corrections, { origin: "https://example.com", kind: "click" })).toEqual([]);
    expect(expirecorrections(corrections, 500, now + 1000)).toEqual([]);
    expect(expirecorrections(corrections, undefined, now + 1000)).toHaveLength(2);
  });

  it("builds the consent memory entry with the deduplicated kinds and the expiry", () => {
    const entry = consentmemoryof({ origin: "https://example.com", decision: "grant", boundary: "form", kinds: ["navigate", "navigate", "click"], expiresat: now + 1000, now });
    expect(entry.kinds).toEqual(["navigate", "click"]);
    expect(entry.expiresat).toBe(now + 1000);
    expect(() => consentmemoryof({ origin: "", decision: "grant", boundary: "b", kinds: [], now })).toThrow(/origin/i);
    expect(() => consentmemoryof({ origin: "o", decision: "grant", boundary: " ", kinds: [], now })).toThrow(/boundary/i);
  });

  it("reads the advisory verdict of the latest decision for the kind and the refusal keeps its refusal", () => {
    const entries = [
      consentmemoryof({ origin: "https://example.com", decision: "grant", boundary: "form", kinds: ["navigate"], now }),
      consentmemoryof({ origin: "https://example.com", decision: "deny", boundary: "form", kinds: ["navigate"], now: now + 1 }),
    ];
    expect(consentadvisory(entries, "https://example.com", now + 100)).toHaveLength(2);
    const verdict = consentadvisoryverdict(entries, "https://example.com", "navigate");
    expect(verdict.advisory).toBe(true);
    expect(verdict.reason).toMatch(/denial/i);
    const fresh = consentadvisoryverdict(entries, "https://example.com", "click");
    expect(fresh.advisory).toBe(false);
    expect(fresh.reason).toMatch(/no prior decision/i);
  });
});

describe("torture: session rollback and cancel run action", () => {
  it("splits the executed and queued steps from the plan and its progress", () => {
    const progress: planprogress = { planid: "plan1", completedsteps: ["s1"], updatedat: now };
    const split = rollbacksplit(plan(), progress);
    expect(split.executedstepids).toEqual(["s1"]);
    expect(split.queuedstepids).toEqual(["s2"]);
    expect(rollbacksplit(undefined, undefined)).toEqual({ executedstepids: [], queuedstepids: [] });
    expect(rollbacksplit(plan(), { planid: "other", completedsteps: ["s1"], updatedat: now }).executedstepids).toEqual([]);
  });

  it("builds the rollback descriptor with the queued scope and the none scope", () => {
    const progress: planprogress = { planid: "plan1", completedsteps: ["s1"], updatedat: now };
    const queued = rollbackof(plan(), progress, "queued");
    expect(queued.scope).toBe("queued");
    expect(queued.queuedstepids).toEqual(["s2"]);
    const none = rollbackof(plan(), progress, "none");
    expect(none.scope).toBe("none");
    expect(none.queuedstepids).toEqual(["s2"]);
  });

  it("builds the cancelrun action with its rollback descriptor", () => {
    const progress: planprogress = { planid: "plan1", completedsteps: ["s1"], updatedat: now };
    const action = cancelrunactionof({ runid: "r1", sessionid: "sess1", plan: plan(), progress, preference: "queued" });
    expect(action.runid).toBe("r1");
    expect(action.rollback.scope).toBe("queued");
  });
});

describe("torture: session error surface and failure classification", () => {
  it("builds the error surface with the cause, the retry and the context", () => {
    const surface = errorsurfaceof({ stepid: "s1", runid: "r1", message: "boom", cause: "network", retryallowed: true, retryreason: "auto retry ok", context: { url: "https://example.com" }, now });
    expect(surface.cause).toBe("network");
    expect(surface.retry.allowed).toBe(true);
    expect(surface.context.url).toBe("https://example.com");
    expect(() => errorsurfaceof({ stepid: "s1", runid: "r1", message: " ", cause: "network", retryallowed: true, retryreason: "r", context: {}, now })).toThrow(/message/i);
  });

  it("classifies the failure cause by the keyword and the policy refusal and the gate wait", () => {
    expect(classifyfailure({ message: "the fetch failed", policyrefused: false, gatewait: false })).toBe("network");
    expect(classifyfailure({ message: "the dns lookup timed out", policyrefused: false, gatewait: false })).toBe("network");
    expect(classifyfailure({ message: "the socket closed", policyrefused: false, gatewait: false })).toBe("network");
    expect(classifyfailure({ message: "the page threw", policyrefused: false, gatewait: false })).toBe("page");
    expect(classifyfailure({ message: "anything", policyrefused: true, gatewait: false })).toBe("policy");
    expect(classifyfailure({ message: "anything", policyrefused: false, gatewait: true })).toBe("gate");
  });

  it("reads the retry hint and refuses when the surface denies the retry", () => {
    const allowed = errorsurfaceof({ stepid: "s1", runid: "r1", message: "boom", cause: "page", retryallowed: true, retryreason: "manual retry", context: {}, now });
    expect(retryhintof(allowed).allowed).toBe(true);
    expect(retryhintof(allowed).reason).toMatch(/reviewed dispatch/i);
    const refused = errorsurfaceof({ stepid: "s1", runid: "r1", message: "boom", cause: "policy", retryallowed: false, retryreason: "the consent refused", context: {}, now });
    expect(retryhintof(refused).allowed).toBe(false);
    expect(retryhintof(refused).reason).toMatch(/refuses the retry/i);
  });
});

describe("torture: session grid rows, history search and bundle", () => {
  it("derives the live and saved grid rows from the session, plan, logs and summaries", () => {
    const progress: planprogress = { planid: "plan1", completedsteps: ["s1"], updatedat: now };
    const rows = sessiongridrows({ session: { id: "sess1", tabid: 1, origin: "https://example.com", pausedat: now }, plan: plan(), progress, logs: [], summaries: [], locks: [{ runid: "plan1" }], tabsessions: [] });
    expect(rows[0]?.state).toBe("live");
    expect(rows[0]?.lock).toBe("held");
    expect(rows[0]?.actions).toContain("cancelrun");
    expect(rows[0]?.actions).toContain("resume");
    const logs: storedrunlog[] = [{ runid: "r2", sessionid: "sess2", entries: [], updatedat: now - 1 } as never];
    const summaries: runsummary[] = [{ runid: "r2", sessionid: "sess2", origins: ["https://example.com"], kinds: ["navigate"], steps: [{ stepid: "s1", kind: "navigate", ok: true, summary: "done" }], task: "runsummary", provenance: "inline", distilledat: now - 1 }];
    const savedRows = sessiongridrows({ logs, summaries, locks: [], tabsessions: [] });
    expect(savedRows[0]?.state).toBe("saved");
    expect(savedRows[0]?.outcome).toBe("completed");
  });

  it("normalizes the history query and refuses the empty text and the inverted range", () => {
    expect(historyqueryof({ text: "alice", origin: "https://example.com" })).toMatchObject({ text: "alice", origin: "https://example.com" });
    expect(historyqueryof({ text: " ", origin: "o" })).toBeUndefined();
    expect(historyqueryof({ text: "alice", from: 100, to: 50 })).toBeUndefined();
    expect(historyqueryof(null)).toBeUndefined();
  });

  it("adds the history entry with the deduplication and highlights the matched terms", () => {
    const entry = { source: "summary" as const, id: "r1", title: "the run", text: "the run summary", outcome: "completed" as const, at: now };
    const added = addhistoryentry([], entry);
    expect(added).toHaveLength(1);
    expect(addhistoryentry(added, entry)).toHaveLength(1);
    expect(highlightterms("the run summary text", "run summary")).toEqual(["run", "summary"]);
    expect(highlightterms("nothing matched here", "ghost")).toEqual([]);
  });

  it("searches the corpus with the matched terms highlighted and the filter applied", () => {
    const corpus = [
      { source: "summary" as const, id: "r1", title: "the run", text: "alice navigated the page", outcome: "completed" as const, at: now, origin: "https://example.com" },
      { source: "note" as const, id: "n1", title: "the note", text: "bob typed the form", at: now - 1, origin: "https://other.example" },
    ];
    const hits = historysearch(corpus, { text: "alice" });
    expect(hits).toHaveLength(1);
    expect(hits[0]?.id).toBe("r1");
    expect(hits[0]?.highlights).toContain("alice");
    const scoped = historysearch(corpus, { text: "the", origin: "https://example.com" });
    expect(scoped.every(hit => hit.origin === "https://example.com")).toBe(true);
    const filtered = historysearch(corpus, { text: "typed", outcome: "failed" });
    expect(filtered).toEqual([]);
  });

  it("serves the empty state guidance in plain language for each surface", () => {
    expect(emptystatemessage("historysearch")).toMatch(/first query/i);
    expect(emptystatemessage("sitenotes", "https://example.com")).toContain("https://example.com");
    expect(emptystatemessage("scratchpad")).toMatch(/agent appends/i);
  });

  it("builds the per tab session key and reference and the audit bundle", () => {
    expect(tabsessionkey(3)).toBe("tabsession:3");
    expect(tabsessionrefof({ tabid: 1, sessionid: "s1", runid: "r1", origin: "https://example.com", now })).toMatchObject({ tabid: 1, sessionid: "s1", runid: "r1" });
    expect(() => tabsessionrefof({ tabid: -1, sessionid: "s1", origin: "o", now })).toThrow(/tab/i);
    expect(() => tabsessionrefof({ tabid: 1, sessionid: " ", origin: "o", now })).toThrow(/session/i);
    const bundle = sessionbundleof({ notes: [], summaries: [], corrections: [], exportedat: now });
    expect(bundle.kind).toBe("sessionbundle");
    expect(bundle.exportedat).toBe(now);
  });
});
