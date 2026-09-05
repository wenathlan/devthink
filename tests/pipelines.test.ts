import { describe, expect, it } from "vitest";
import { deduperows, extractbatchof, pipelinegridpreview, pipelinestate, provlog, provlogquery, resumeextract, samplerows, sourcestamp, streamdisk, transformvalues } from "../data.js";
import { dedupeconfiggate, gridexportconfirmgate, pipelinetargetgate, provgate, provlogappendonlygate, resumegate, rowstampgate, samplegate, streamchunkgate, streamgate, streamnamespacegate, transformgate } from "../policy.js";
import type { extractpipeline, extractrow, provlogentry, streamcursor, transformrule } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one reviewed pipeline fixture of the pricing extraction. */
function pipeline(over: Partial<extractpipeline> = {}): extractpipeline {
  return { id: "p1", runid: "run1", name: "Pricing rows", source: "table.pricing", steps: ["s1", "s2"], transforms: [], sink: "csv", state: "running", origin: "https://example.com", createdat: now, updatedat: now, ...over };
}

/** Builds one extracted row fixture with its key and values. */
function row(key: string, values: Record<string, string>, over: Partial<extractrow> = {}): extractrow {
  return { key, values, stamps: [], provenance: [], ...over };
}

describe("pipeline streaming to disk with cursor checkpoints", () => {
  it("streams the rows chunk by chunk with only the active chunk riding the write while the cursor checkpoints after every chunk and the namespace stays bound to the run", () => {
    const rows = [row("r1", { price: "10" }), row("r2", { price: "20" }), row("r3", { price: "30" }), row("r4", { price: "40" }), row("r5", { price: "50" })];
    const writes: number[][] = [];
    const checkpoints: streamcursor[] = [];
    const result = streamdisk({
      pipeline: pipeline(),
      rows,
      chunk: 2,
      write: chunk => { writes.push(chunk.map(entry => Number(entry.values.price))); return chunk.map(entry => JSON.stringify(entry.values)).length; },
      checkpoint: cursor => { checkpoints.push({ ...cursor }); },
      now,
    });
    expect(writes).toEqual([[10, 20], [30, 40], [50]]);
    expect(result.rowswritten).toBe(5);
    expect(result.chunks).toBe(3);
    expect(result.byteswritten).toBeGreaterThan(0);
    expect(result.cursor).toEqual({ pipelineid: "p1", offset: 5, chunk: 3, updatedat: now });
    expect(checkpoints).toEqual([
      { pipelineid: "p1", offset: 2, chunk: 1, updatedat: now },
      { pipelineid: "p1", offset: 4, chunk: 2, updatedat: now },
      { pipelineid: "p1", offset: 5, chunk: 3, updatedat: now },
    ]);
    const continued: number[] = [];
    const resumed = streamdisk({ pipeline: pipeline(), rows, cursor: { pipelineid: "p1", offset: 4, chunk: 2, updatedat: now }, chunk: 2, write: chunk => { continued.push(...chunk.map(entry => Number(entry.values.price))); return 1; }, now });
    expect(continued).toEqual([50]);
    expect(resumed.cursor.offset).toBe(5);
    expect(resumed.cursor.chunk).toBe(3);
    const foreign = streamdisk({ pipeline: pipeline(), rows, cursor: { pipelineid: "other", offset: 4, chunk: 2, updatedat: now }, chunk: 10, write: () => 1, now });
    expect(foreign.rowswritten).toBe(5);
    expect(() => streamdisk({ pipeline: pipeline(), rows, chunk: 0, write: () => 1, now })).toThrow(/positive whole number/);
    expect(streamgate({ revieweddownload: true, sink: "csv" }).allowed).toBe(true);
    expect(streamgate({ revieweddownload: false, sink: "/tmp/bare-path.csv" }).allowed).toBe(false);
    expect(streamchunkgate({ chunk: 2, limit: 2 }).allowed).toBe(true);
    expect(streamchunkgate({ chunk: 2, limit: 1 }).allowed).toBe(false);
    expect(streamchunkgate({ chunk: 2 }).allowed).toBe(true);
    expect(streamnamespacegate({ filename: "run1-p1.csv", runid: "run1" }).allowed).toBe(true);
    expect(streamnamespacegate({ filename: "other-p1.csv", runid: "run1" }).allowed).toBe(false);
  });
});

describe("pipeline resume from an interrupted cursor", () => {
  it("skips the rows the cursor offset and the persisted keys already cover while the resume refuses a finished pipeline, a foreign cursor and a moved origin", () => {
    const rows = [row("r1", { price: "10" }), row("r2", { price: "20" }), row("r3", { price: "30" }), row("r4", { price: "40" })];
    const interrupted = pipeline({ state: "paused" });
    const result = resumeextract({ pipeline: interrupted, rows, cursor: { pipelineid: "p1", offset: 2, chunk: 1, updatedat: now }, persistedkeys: ["r3"], now });
    expect(result.rows.map(entry => entry.key)).toEqual(["r4"]);
    expect(result.skipped).toBe(3);
    expect(result.pipeline.state).toBe("running");
    expect(result.entry.operation).toBe("resume");
    expect(result.entry.rowkeys).toEqual(["r4"]);
    expect(result.entry.pipelineid).toBe("p1");
    const fresh = resumeextract({ pipeline: interrupted, rows, now });
    expect(fresh.rows.map(entry => entry.key)).toEqual(["r1", "r2", "r3", "r4"]);
    expect(fresh.skipped).toBe(0);
    expect(() => resumeextract({ pipeline: pipeline({ state: "finished" }), rows, now })).toThrow(/already finished/);
    expect(() => resumeextract({ pipeline: interrupted, rows, cursor: { pipelineid: "other", offset: 0, chunk: 0, updatedat: now }, now })).toThrow(/another pipeline/);
    expect(resumegate({ pipeline: interrupted, planid: "plan1", origin: "https://example.com" }).allowed).toBe(true);
    expect(resumegate({ pipeline: interrupted, planid: "plan1", origin: "https://outside.example" }).allowed).toBe(false);
    expect(resumegate({ pipeline: pipeline({ planid: "plan1" }), planid: "plan2", origin: "https://example.com" }).allowed).toBe(false);
    const state = pipelinestate({ pipelines: [result.pipeline, pipeline({ id: "p2", state: "paused" }), pipeline({ id: "p3", state: "finished" })] });
    expect(state).toEqual({ running: 1, paused: 1, finished: 1, perrun: [{ runid: "run1", running: 1, paused: 1, finished: 1 }] });
    const batch = extractbatchof({ id: "b1", pipeline: result.pipeline, rows: result.rows, cursor: result.cursor, now });
    expect(batch.pipelineid).toBe("p1");
    expect(batch.rows.map(entry => entry.key)).toEqual(["r4"]);
    expect(() => extractbatchof({ id: " ", pipeline: result.pipeline, rows: [], cursor: result.cursor, now })).toThrow(/needs its id/);
  });
});

describe("pipeline transform rules with raw retention", () => {
  it("reshapes one field at a time through the reviewed operations while the raw value stays beside the transformed one and an unknown operation refuses without dropping a row", () => {
    const rows = [
      row("r1", { name: "  Devthink  2.0 ", price: "$ 1,299.50", seen: "March 3, 2026", flag: "x" }),
      row("r2", { name: "plain", price: "42", seen: "not a date", flag: "y" }),
    ];
    const rules: transformrule[] = [
      { expression: "", sources: [], target: "name", field: "name", operation: "trim" },
      { expression: "", sources: [], target: "price", field: "price", operation: "number" },
      { expression: "", sources: [], target: "seen", field: "seen", operation: "date" },
      { expression: "", sources: [], target: "flag", field: "flag", operation: "case" },
      { expression: "", sources: [], target: "name", field: "name", operation: "mystery" } as unknown as transformrule,
    ];
    const result = transformvalues({ rows, rules });
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]?.values.name).toBe("Devthink 2.0");
    expect(result.rows[0]?.rawvalues?.name).toBe("  Devthink  2.0 ");
    expect(result.rows[0]?.values.price).toBe("1299.50");
    expect(result.rows[0]?.rawvalues?.price).toBe("$ 1,299.50");
    expect(result.rows[0]?.values.seen).toBe(new Date(Date.parse("March 3, 2026")).toISOString());
    expect(result.rows[0]?.values.flag).toBe("X");
    expect(result.rows[0]?.rawvalues?.flag).toBe("x");
    expect(result.rows[1]?.values.seen).toBe("not a date");
    expect(result.rows[1]?.rawvalues?.seen).toBeUndefined();
    expect(result.refusals.join(" ")).toContain("not a reviewed transform");
    expect(result.refusals.join(" ")).toContain("parses as no date");
    expect(result.rows.map(entry => entry.key)).toEqual(["r1", "r2"]);
    const reviewed: transformrule[] = [{ expression: "", sources: [], target: "name", field: "name", operation: "trim" }];
    expect(transformgate({ rule: rules[0]!, reviewed }).allowed).toBe(true);
    expect(transformgate({ rule: { expression: "", sources: [], target: "name", field: "name", operation: "case" }, reviewed }).allowed).toBe(false);
  });
});

describe("pipeline dedupe over the configured key", () => {
  it("normalizes the key values before comparing while the first occurrence stays, the dropped rows report by count and by key, and an unconfigured key refuses", () => {
    const rows = [
      row("r1", { name: "Devthink", sku: "A1" }),
      row("r2", { name: " devthink ", sku: "A1" }),
      row("r3", { name: "DEVTHINK", sku: "a2" }),
      row("r4", { name: "Other", sku: "B1" }),
    ];
    const folded = deduperows({ rows, key: { columns: ["name"], normalization: "whitespace and case" } });
    expect(folded.kept.map(entry => entry.key)).toEqual(["r1", "r4"]);
    expect(folded.dropped).toBe(2);
    expect(folded.droppedkeys).toEqual(["r2", "r3"]);
    const caseonly = deduperows({ rows, key: { columns: ["name"], normalization: "case" } });
    expect(caseonly.kept.map(entry => entry.key)).toEqual(["r1", "r2", "r4"]);
    expect(caseonly.droppedkeys).toEqual(["r3"]);
    const strict = deduperows({ rows, key: { columns: ["name"], normalization: "none" } });
    expect(strict.kept).toHaveLength(4);
    const joined = deduperows({ rows, key: { columns: ["name", "sku"], normalization: "whitespace and case" } });
    expect(joined.kept.map(entry => entry.key)).toEqual(["r1", "r3", "r4"]);
    expect(joined.droppedkeys).toEqual(["r2"]);
    expect(() => deduperows({ rows, key: { columns: ["  "], normalization: "none" } })).toThrow(/names its columns/);
    expect(dedupeconfiggate({ key: { columns: ["name"], normalization: "case" }, pipelineid: "p1" }).allowed).toBe(true);
    expect(dedupeconfiggate({ pipelineid: "p1" }).allowed).toBe(false);
  });
});

describe("pipeline sampling strategies without mutation", () => {
  it("selects the preview subset by the first, stratified and seeded random strategies while the full extract never mutates", () => {
    const rows = Array.from({ length: 10 }, (_, index) => row(`r${index + 1}`, { price: String((index + 1) * 10) }));
    const first = samplerows({ rows, policy: { rows: 3, strategy: "first" } });
    expect(first.rows.map(entry => entry.key)).toEqual(["r1", "r2", "r3"]);
    const stratified = samplerows({ rows, policy: { rows: 5, strategy: "stratified" } });
    expect(stratified.rows.map(entry => entry.key)).toEqual(["r1", "r3", "r5", "r7", "r9"]);
    const randomone = samplerows({ rows, policy: { rows: 4, strategy: "random" }, seed: 42 });
    const randomtwo = samplerows({ rows, policy: { rows: 4, strategy: "random" }, seed: 42 });
    expect(randomone.rows.map(entry => entry.key)).toEqual(randomtwo.rows.map(entry => entry.key));
    expect(new Set(randomone.rows.map(entry => entry.key)).size).toBe(4);
    expect(samplerows({ rows: [rows[0]!], policy: { rows: 5, strategy: "first" } }).rows).toHaveLength(1);
    expect(() => samplerows({ rows, policy: { rows: 0, strategy: "first" } })).toThrow(/positive whole number/);
    const preview = samplerows({ rows, policy: { rows: 2, strategy: "first" } });
    preview.rows[0]!.values.price = "999";
    expect(rows[0]!.values.price).toBe("10");
    expect(rows.map(entry => entry.key)).toEqual(["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10"]);
    expect(samplegate("samplerows").allowed).toBe(true);
    expect(samplegate("deduperows").allowed).toBe(false);
  });
});

describe("pipeline source stamps, grid preview and provenance queries", () => {
  it("stamps every row and cell with its source while the grid preview infers the column kinds and sorts without touching the extract and the provlog answers by row key with the secrets redacted", () => {
    const rows = [
      row("r1", { name: "Devthink", price: "1299.50", seen: "2026-03-03", active: "true" }),
      row("r2", { name: "Other", price: "42", seen: "2026-03-04", active: "false" }),
    ];
    const stamped = sourcestamp({ rows, stampid: "st1", url: "https://example.com/pricing", stepid: "s1", now });
    expect(stamped.stamp).toEqual({ id: "st1", url: "https://example.com/pricing", stepid: "s1", capturedat: now });
    expect(stamped.rows.every(entry => entry.stamps.some(stamp => stamp.id === "st1"))).toBe(true);
    expect(stamped.rows[0]?.cellstamps?.name).toBe("st1");
    expect(stamped.rows[0]?.cellstamps?.price).toBe("st1");
    const restamped = sourcestamp({ rows: stamped.rows, stampid: "st1", url: "https://example.com/pricing", stepid: "s1", now: now + 5000 });
    expect(restamped.rows[0]?.stamps).toHaveLength(1);
    expect(restamped.rows[0]?.stamps[0]?.capturedat).toBe(now);
    expect(rowstampgate({ stored: [{ key: "r1", capturedat: now }], row: { key: "r1", capturedat: now } }).allowed).toBe(true);
    expect(rowstampgate({ stored: [{ key: "r1", capturedat: now }], row: { key: "r1", capturedat: now + 1 } }).allowed).toBe(false);
    const grid = pipelinegridpreview({ rows: stamped.rows });
    const kinds = Object.fromEntries(grid.columns.map(column => [column.name, column.kind]));
    expect(kinds.name).toBe("text");
    expect(kinds.price).toBe("number");
    expect(kinds.seen).toBe("date");
    expect(kinds.active).toBe("boolean");
    const sorted = pipelinegridpreview({ rows: stamped.rows, sort: { column: "price", direction: "ascending" } });
    expect(sorted.rows.map(entry => entry.key)).toEqual(["r2", "r1"]);
    const filtered = pipelinegridpreview({ rows: stamped.rows, filter: "other" });
    expect(filtered.rows.map(entry => entry.key)).toEqual(["r2"]);
    expect(filtered.total).toBe(2);
    const marked = pipelinegridpreview({ rows: stamped.rows, dedupekeys: ["r1"] });
    expect(marked.rows.find(entry => entry.key === "r1")?.deduplicated).toBe(true);
    expect(marked.rows.find(entry => entry.key === "r2")?.deduplicated).toBe(false);
    expect(() => pipelinegridpreview({ rows: stamped.rows, sort: { column: "ghost", direction: "ascending" } })).toThrow(/knows no ghost/);
    const transformed = transformvalues({ rows: stamped.rows, rules: [{ expression: "", sources: [], target: "name", field: "name", operation: "case" }] }).rows;
    const markedgrid = pipelinegridpreview({ rows: transformed });
    expect(markedgrid.rows.every(entry => entry.stamped)).toBe(true);
    expect(markedgrid.rows[0]?.transformed).toContain("name");
    expect(pipelinetargetgate({ fields: ["name", "price"], target: ["name", "price", "sku"], pipelineid: "p1" }).allowed).toBe(true);
    expect(pipelinetargetgate({ fields: ["secret"], target: ["name"], pipelineid: "p1" }).allowed).toBe(false);
    const streamlog = provlog({ entries: [], id: "log1", pipelineid: "p1", runid: "run1", operation: "stream", rowkeys: ["r1", "r2"], summary: "Streamed 2 rows of the pricing pipeline with token=ghp_abcdefghijklmnopqrstuvwx to the sink.", now });
    expect(streamlog.entry.summary).toContain("[redacted]");
    expect(streamlog.entry.summary).not.toContain("ghp_");
    const transformlog = provlog({ entries: streamlog.entries, id: "log2", pipelineid: "p1", runid: "run1", operation: "transform", rowkeys: ["r1"], summary: "Upper cased the name field.", now: now + 1000 });
    expect(() => provlog({ entries: transformlog.entries, id: "log1", pipelineid: "p1", runid: "run1", operation: "stream", rowkeys: [], summary: "again", now: now + 2000 })).toThrow(/append only/);
    expect(provlogappendonlygate({ entries: transformlog.entries, entryid: "log1" }).allowed).toBe(false);
    expect(provlogappendonlygate({ entries: transformlog.entries, entryid: "log3" }).allowed).toBe(true);
    const history: provlogentry[] = provlogquery(transformlog.entries, "r1");
    expect(history.map(entry => entry.id)).toEqual(["log1", "log2"]);
    expect(provlogquery(transformlog.entries, "r2").map(entry => entry.id)).toEqual(["log1"]);
    const withprovenance = stamped.rows.map(entry => ({ ...entry, provenance: ["log1"] }));
    expect(provgate({ rows: withprovenance, entries: transformlog.entries }).allowed).toBe(true);
    expect(provgate({ rows: stamped.rows, entries: transformlog.entries }).allowed).toBe(false);
    expect(gridexportconfirmgate({ confirmed: false, rows: 2 }).allowed).toBe(false);
    expect(gridexportconfirmgate({ confirmed: true, rows: 2 }).allowed).toBe(true);
  });
});
