// # generation.test — the storage seam of the generation pipeline, runnable with
// the node built-in runner (no dependencies, no install):
//   node --test tests/generation.test.ts
// Two documented patterns live in the prologue below: (1) the TEMP database is
// chosen by setting process.env.DATABASE_URL to file:./.tmp/generation.test.db
// BEFORE the dynamic import of the db modules — db.ts resolves the url once at
// module load, so static imports would hoist past it — and .tmp is wiped before
// and after the run; (2) db.ts imports './seed' extensionless (vite-style), so
// a resolve fallback hook (specifier + '.ts' on ERR_MODULE_NOT_FOUND) must be
// registered before the import. The suites watch: idempotent schema boot, the
// save/get round trip (deep-equal minus nothing), newest-first listing with the
// 1–200 limit clamp, delete truthiness, the analysis side of the seam, the
// 512 KiB JSON cap, id validation, bpm clamping, determinism of read after
// write, and isolation between the two tables.
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { registerHooks } from "node:module";
import { after, describe, it } from "node:test";
import type { AnalysisRecord, GenerationRecord } from "../generation.ts";

const TMP_DIR = ".tmp";
rmSync(TMP_DIR, { recursive: true, force: true });

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (error) {
      const code = (error as { code?: string }).code;
      const relative = specifier.startsWith("./") || specifier.startsWith("../");
      const last = specifier.split("/").pop() ?? "";
      if (code === "ERR_MODULE_NOT_FOUND" && relative && !last.includes(".")) {
        return next(`${specifier}.ts`, context);
      }
      throw error;
    }
  },
});

process.env.DATABASE_URL = `file:./${TMP_DIR}/generation.test.db`;
const { ensureGenerationSchema, generationStore } = await import("../generation.ts");
const { db } = await import("../db.ts");

const store = generationStore();
const MAX_JSON = 512 * 1024;

after(() => {
  db.close();
  rmSync(TMP_DIR, { recursive: true, force: true });
});

// one monotonic iso clock for every save, so newest-first stays exact even when
// several suites share the temp database (node --test runs the its in order).
const BASE = 1_700_000_000_000;
let step = 0;
function stamp(): string {
  step += 1;
  return new Date(BASE + step * 1_000).toISOString();
}

function generation(id: string, overrides: Partial<GenerationRecord> = {}): GenerationRecord {
  return {
    id,
    seed: "9a7c1e2b44d0f836",
    style: "opaline",
    bpm: 124,
    keyTonic: 9,
    keyMode: "minor",
    durationMs: 96000,
    descriptorJson: JSON.stringify({ version: 1, seed: id }),
    projectJson: JSON.stringify({ version: 1, width: 1080, height: 1080 }),
    svgDigest: "d41d8cd98f00b204e9800998ecf8427e",
    createdAt: stamp(),
    ...overrides,
  };
}

function analysis(id: string, overrides: Partial<AnalysisRecord> = {}): AnalysisRecord {
  return {
    id,
    sourceKind: "file",
    sampleRate: 44100,
    durationMs: 96000,
    bpm: 98,
    keyName: "A minor",
    reportJson: JSON.stringify({ version: 1, bpm: 98, tonic: 9, minor: 1 }),
    createdAt: stamp(),
    ...overrides,
  };
}

function ids(records: { id: string }[]): string[] {
  return records.map((record) => record.id);
}

describe("generation schema boot", () => {
  it("is idempotent across two boots (no throw, tables intact)", () => {
    assert.doesNotThrow(() => {
      ensureGenerationSchema();
      ensureGenerationSchema();
    });
    assert.ok(store.listGenerations(1).length <= 1);
  });
});

describe("generation records", () => {
  it("saves and reads a generation back as a deep-equal round trip", () => {
    const record = generation("trip-a");
    assert.deepEqual(store.saveGeneration(record), { ok: true });
    assert.deepEqual(store.getGeneration("trip-a"), record);
  });

  it("answers null for a missing generation id", () => {
    assert.equal(store.getGeneration("trip-nope"), null);
  });

  it("lists generations newest-first", () => {
    for (const id of ["order-a", "order-b", "order-c"]) store.saveGeneration(generation(id));
    assert.deepEqual(ids(store.listGenerations(3)), ["order-c", "order-b", "order-a"]);
  });

  it("honours a positive limit over the newest-first order", () => {
    assert.deepEqual(ids(store.listGenerations(2)), ["order-c", "order-b"]);
  });

  it("clamps a limit below 1 up to one row", () => {
    assert.equal(store.listGenerations(0).length, 1);
    assert.equal(store.listGenerations(-10).length, 1);
  });

  it("caps the limit at 200 rows", () => {
    for (let i = 0; i < 205; i += 1) store.saveGeneration(generation(`bulk-${i}`));
    const page = store.listGenerations(Number.MAX_SAFE_INTEGER);
    assert.equal(page.length, 200);
    assert.equal(page[0].id, "bulk-204");
  });

  it("deletes an existing id (true) then reports the miss (false)", () => {
    store.saveGeneration(generation("del-a"));
    assert.equal(store.deleteGeneration("del-a"), true);
    assert.equal(store.getGeneration("del-a"), null);
    assert.equal(store.deleteGeneration("del-a"), false);
    assert.equal(store.deleteGeneration("del-nope"), false);
  });

  it("rejects oversized JSON payloads with ok:false and writes nothing", () => {
    const fat = "x".repeat(MAX_JSON + 1);
    const fatDescriptor = store.saveGeneration(generation("fat-descriptor", { descriptorJson: fat }));
    assert.equal(fatDescriptor.ok, false);
    if (!fatDescriptor.ok) assert.match(fatDescriptor.error, /descriptorJson/);
    const fatProject = store.saveGeneration(generation("fat-project", { projectJson: fat }));
    assert.equal(fatProject.ok, false);
    assert.equal(store.getGeneration("fat-descriptor"), null);
    assert.equal(store.getGeneration("fat-project"), null);
    const thin = store.saveGeneration(generation("fat-edge", { descriptorJson: "x".repeat(MAX_JSON) }));
    assert.deepEqual(thin, { ok: true });
  });

  it("rejects invalid ids on every accessor", () => {
    assert.equal(store.saveGeneration(generation("")).ok, false);
    assert.equal(store.saveGeneration(generation("x".repeat(129))).ok, false);
    assert.equal(store.getGeneration(""), null);
    assert.equal(store.getGeneration("x".repeat(129)), null);
    assert.equal(store.deleteGeneration(""), false);
    assert.equal(store.deleteGeneration("x".repeat(129)), false);
  });

  it("clamps bpm into 20–300 and refuses non-finite values", () => {
    store.saveGeneration(generation("bpm-hi", { bpm: 999 }));
    assert.equal(store.getGeneration("bpm-hi")?.bpm, 300);
    store.saveGeneration(generation("bpm-lo", { bpm: 5 }));
    assert.equal(store.getGeneration("bpm-lo")?.bpm, 20);
    store.saveGeneration(generation("bpm-frac", { bpm: 123.6 }));
    assert.equal(store.getGeneration("bpm-frac")?.bpm, 124);
    const nan = store.saveGeneration(generation("bpm-nan", { bpm: Number.NaN }));
    assert.equal(nan.ok, false);
    const inf = store.saveGeneration(generation("bpm-inf", { bpm: Number.POSITIVE_INFINITY }));
    assert.equal(inf.ok, false);
    assert.equal(store.getGeneration("bpm-nan"), null);
  });

  it("reads back deterministically after write", () => {
    const record = generation("det-a", { descriptorJson: JSON.stringify({ deep: { nested: [1, 2, 3] } }) });
    store.saveGeneration(record);
    const first = store.getGeneration("det-a");
    const second = store.getGeneration("det-a");
    assert.deepEqual(first, second);
    assert.deepEqual(first, record);
    assert.equal(typeof first?.createdAt, "string");
  });
});

describe("analysis records", () => {
  it("saves and reads an analysis back as a deep-equal round trip", () => {
    const record = analysis("an-trip");
    assert.deepEqual(store.saveAnalysis(record), { ok: true });
    assert.deepEqual(store.getAnalysis("an-trip"), record);
  });

  it("lists analyses newest-first with the limit applied", () => {
    for (const id of ["an-a", "an-b", "an-c"]) store.saveAnalysis(analysis(id));
    assert.deepEqual(ids(store.listAnalyses(200)), ["an-c", "an-b", "an-a", "an-trip"]);
    assert.deepEqual(ids(store.listAnalyses(2)), ["an-c", "an-b"]);
    assert.equal(store.listAnalyses(0).length, 1);
  });

  it("rejects an oversized reportJson with ok:false", () => {
    const result = store.saveAnalysis(analysis("an-fat", { reportJson: "y".repeat(MAX_JSON + 1) }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /reportJson/);
    assert.equal(store.getAnalysis("an-fat"), null);
  });
});

describe("isolation", () => {
  it("keeps generations and analyses in separate tables", () => {
    store.saveGeneration(generation("shared"));
    store.saveAnalysis(analysis("shared"));
    const gen = store.getGeneration("shared");
    const an = store.getAnalysis("shared");
    assert.ok(gen && "svgDigest" in gen);
    assert.ok(an && "keyName" in an);
    assert.equal(store.deleteGeneration("shared"), true);
    assert.equal(store.getGeneration("shared"), null);
    assert.equal(store.getAnalysis("shared")?.id, "shared");
    assert.equal(store.deleteGeneration("shared"), false);
  });
});
