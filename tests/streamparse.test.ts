import { describe, expect, it } from "vitest";
import { chunkextractprogress, chunkextracttaskof, chunkextractwindow, mergechunkwindows, openchunkextractcursor, resumechunkextract, streamparsechunkof, streamparseobservations, streamparsewindows, validatesetreamparsechunk } from "../data.js";
import { chunkextractgate, streamparsegate } from "../policy.js";

describe("streamparse progressive observations", () => {
  it("splits a large page into chunk windows without ever holding the full text", () => {
    const windows = streamparsewindows({ bytes: 2500, chunkbytes: 1000 });
    expect(windows.chunks).toBe(3);
    expect(windows.windows).toEqual([{ index: 0, start: 0, end: 1000 }, { index: 1, start: 1000, end: 2000 }, { index: 2, start: 2000, end: 2500 }]);
    expect(() => streamparsewindows({ bytes: 10, chunkbytes: 0 })).toThrow(/positive number of bytes/i);
  });

  it("tokenizes one chunk into text, element and attribute tokens and refuses chunks over the byte bound", () => {
    const chunk = streamparsechunkof({ index: 0, text: "<h1 class=\"title\">Hello</h1> world", chunkbytes: 100, last: true });
    expect(chunk.index).toBe(0);
    expect(chunk.complete).toBe(true);
    expect(chunk.tokens.map(token => token.kind)).toContain("element");
    expect(chunk.tokens.map(token => token.kind)).toContain("attribute");
    expect(chunk.observations.join(" ")).toMatch(/Hello/i);
    expect(() => streamparsechunkof({ index: 0, text: "a".repeat(50), chunkbytes: 10, last: true })).toThrow(/byte bound/i);
  });

  it("validates every chunk through the same schemastrict shape before any observation yields", () => {
    const chunk = streamparsechunkof({ index: 1, text: "plain text", chunkbytes: 100, last: false });
    expect(validatesetreamparsechunk(chunk, 1).valid).toBe(true);
    expect(validatesetreamparsechunk(chunk, 0).valid).toBe(false);
    expect(validatesetreamparsechunk({}, 0).valid).toBe(false);
    expect(validatesetreamparsechunk({ index: 0, tokens: [], bytes: 0, complete: true }, 0).valid).toBe(true);
    expect(streamparsegate({ chunk, expectedindex: 1 }).allowed).toBe(true);
    expect(streamparsegate({ chunk, expectedindex: 2 }).allowed).toBe(false);
    expect(streamparsegate({ chunk, expectedindex: 2 }).reason).toMatch(/out of order/i);
  });

  it("yields observations progressively as chunks complete", () => {
    const chunks = [
      streamparsechunkof({ index: 0, text: "first part", chunkbytes: 100, last: false }),
      streamparsechunkof({ index: 1, text: "second part", chunkbytes: 100, last: true }),
    ];
    const yield1 = streamparseobservations([chunks[0] as never]);
    const yield2 = streamparseobservations(chunks);
    expect(yield1.progressive).toHaveLength(1);
    expect(yield2.total).toBeGreaterThan(yield1.total);
    expect(yield2.progressive[0]).toEqual(yield1.progressive[0]);
  });
});

describe("chunkextract windowing, resume and merge", () => {
  const rows = Array.from({ length: 25 }, (_, index) => ({ id: String(index), name: `row${index}` }));

  it("opens a cursor with its table fingerprint and slices the table into row windows", () => {
    const cursor = openchunkextractcursor({ tableid: "table1", fingerprint: "abc12345", rows: rows.length, window: 10 });
    expect(cursor.rowindex).toBe(0);
    expect(cursor.window).toBe(10);
    expect(cursor.complete).toBe(false);
    const first = chunkextractwindow({ cursor, rows });
    expect(first.rows).toHaveLength(10);
    expect(first.cursor.rowindex).toBe(10);
    expect(first.complete).toBe(false);
    const second = chunkextractwindow({ cursor: first.cursor, rows });
    expect(second.rows).toHaveLength(10);
    const third = chunkextractwindow({ cursor: second.cursor, rows });
    expect(third.rows).toHaveLength(5);
    expect(third.cursor.complete).toBe(true);
    expect(third.complete).toBe(true);
    expect(() => openchunkextractcursor({ tableid: " ", fingerprint: "f", rows: 5 })).toThrow(/table id/i);
    expect(() => openchunkextractcursor({ tableid: "t", fingerprint: " ", rows: 5 })).toThrow(/fingerprint/i);
    expect(() => openchunkextractcursor({ tableid: "t", fingerprint: "f", rows: 5, window: 0 })).toThrow(/positive row count/i);
  });

  it("resumes from its cursor after an interruption and refuses changed fingerprints", () => {
    const cursor = openchunkextractcursor({ tableid: "table1", fingerprint: "abc12345", rows: 25, window: 10 });
    const advanced = chunkextractwindow({ cursor, rows }).cursor;
    expect(resumechunkextract({ cursor: advanced, tableid: "table1", fingerprint: "abc12345" }).resumed).toBe(true);
    const wrongtable = resumechunkextract({ cursor: advanced, tableid: "table2", fingerprint: "abc12345" });
    expect(wrongtable.resumed).toBe(false);
    expect(wrongtable.reason).toMatch(/belongs to the table table1/i);
    const changed = resumechunkextract({ cursor: advanced, tableid: "table1", fingerprint: "changed" });
    expect(changed.resumed).toBe(false);
    expect(changed.reason).toMatch(/fingerprint changed/i);
    const completed = resumechunkextract({ cursor: { ...advanced, complete: true }, tableid: "table1", fingerprint: "abc12345" });
    expect(completed.resumed).toBe(false);
    expect(chunkextractgate({ cursor: advanced, tableid: "table1", fingerprint: "abc12345" }).allowed).toBe(true);
    expect(chunkextractgate({ cursor: advanced, tableid: "table1", fingerprint: "nope" }).allowed).toBe(false);
  });

  it("merges the windows into the datagrid incrementally without duplicating rows", () => {
    const cursor = openchunkextractcursor({ tableid: "table1", fingerprint: "abc12345", rows: rows.length, window: 10 });
    const first = chunkextractwindow({ cursor, rows });
    const second = chunkextractwindow({ cursor: first.cursor, rows });
    const third = chunkextractwindow({ cursor: second.cursor, rows });
    const merged = mergechunkwindows([first, second, third]);
    expect(merged.rows).toHaveLength(25);
    expect(merged.duplicates).toBe(0);
    const repeated = mergechunkwindows([first, first]);
    expect(repeated.duplicates).toBe(10);
    expect(repeated.rows).toHaveLength(10);
  });

  it("reads the cursor progress line and shapes the worker task payloads", () => {
    const cursor = openchunkextractcursor({ tableid: "table1", fingerprint: "abc12345", rows: 25, window: 10 });
    const advanced = chunkextractwindow({ cursor, rows }).cursor;
    const progress = chunkextractprogress(advanced, 25);
    expect(progress).toEqual({ extracted: 10, total: 25, share: 0.4, complete: false });
    const task = chunkextracttaskof({ runid: "run1", stepid: "s1", tableid: "table1", fingerprint: "abc12345", rowindex: 10, window: 10 });
    expect(task).toEqual({ task: "chunkextract", runid: "run1", stepid: "s1", tableid: "table1", fingerprint: "abc12345", rowindex: 10, window: 10 });
    expect(() => chunkextracttaskof({ runid: "run1", stepid: "s1", tableid: "t", fingerprint: "f", rowindex: 0, window: 0 })).toThrow(/positive row window/i);
  });
});
