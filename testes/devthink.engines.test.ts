// # engines.test — the catalog contract of the fifteen engine law: the
// count the owner charged (node the maestro conducting fifteen honest
// engines), every record complete and honestly stated, the priority
// order the law pins (node first, the natives before the rest), the
// ready, planned and declared sets exactly as the lanes wire them, the
// root manifest counting them all, and the honest dispatch (in-process
// for the maestro, spawn with the flag mapping for the wired engines,
// the resolution path for the rungs that do not answer yet). runnable
// with vitest: pnpm vitest run ../testes/devthink.engines.test.ts
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "vitest";

import {
  ENGINES,
  ENGINEPLANCOUNT,
  dispatchengine,
  dispatchtable,
  enginesreport,
  getengine,
} from "../devthink/engines.ts";

/** the engines the maestro wires today — the honest ready set (node the
 * maestro, the bun lane the root scripts boot, the typescript-only law
 * through tsx, the node-distribution pair corepack and npm, and the
 * python lane the pythonscripts module drives) */
const READYSET = ["node", "bun", "typescript", "corepack", "npm", "python"] as const;

/** the engines the tree declares with a resolution path — no lane wires
 * them yet (the deno entry, the pnpm locks, the java artifacts, the
 * dotnet projects) */
const PLANNEDSET = ["deno", "pnpm", "java", "dotnet"] as const;

/** the manifest promises — only the engines field answers (yarn, go,
 * rust, cargo, v), each carrying the documented walk */
const DECLAREDSET = ["yarn", "go", "rust", "cargo", "v"] as const;

describe("the engine registry", () => {
  it("answers the fifteen engine law the owner charged", () => {
    assert.equal(ENGINEPLANCOUNT, 15);
    assert.equal(ENGINES.length, ENGINEPLANCOUNT, `the catalog holds ${ENGINES.length}`);
    const report = enginesreport();
    assert.equal(report.plananswered, true);
    assert.equal(report.plancount, 15);
    assert.equal(report.catalogcount, ENGINES.length);
    assert.equal(report.ready + report.planned + report.declared, ENGINES.length);
  });

  it("carries a complete honest record for every engine", () => {
    for (const engine of ENGINES) {
      assert.ok(engine.id.length > 0);
      assert.ok(engine.name.length > 0);
      assert.ok(["native", "scripted", "external"].includes(engine.kind), `${engine.id} carries no family kind`);
      assert.ok(["ready", "planned", "declared"].includes(engine.state), `${engine.id} carries no honest state`);
      const runners: readonly string[] = ["in-process", "child_process", "napi", "ffi"];
      assert.ok(runners.includes(engine.runner), `${engine.id} carries no runner`);
      assert.ok(engine.command.length > 0);
      // the note tells what wires today and every non-ready engine documents its walk
      assert.ok(engine.note.length > 0);
      if (engine.state === "ready") assert.equal(engine.resolution, "");
      else assert.ok(engine.resolution.length > 0, `${engine.id} declares ${engine.state} without a resolution path`);
    }
  });

  it("keeps ids unique and pins the priority law — the maestro first, the natives before the rest", () => {
    const ids = new Set(ENGINES.map((engine) => engine.id));
    assert.equal(ids.size, ENGINES.length);
    // the maestro sits at the head of the table and conducts in-process
    assert.equal(ENGINES[0]?.id, "node");
    assert.equal(ENGINES[0]?.runner, "in-process");
    // the native family occupies the head block, then the scripted lane, then the externals
    const firstnonnative = ENGINES.findIndex((engine) => engine.kind !== "native");
    const nativecount = ENGINES.filter((engine) => engine.kind === "native").length;
    assert.equal(firstnonnative, nativecount, "the natives must occupy the head of the table");
    const firstexternal = ENGINES.findIndex((engine) => engine.kind === "external");
    const scriptedcount = ENGINES.filter((engine) => engine.kind === "scripted").length;
    assert.equal(firstexternal, nativecount + scriptedcount, "the scripted lane rides before the externals");
    // only the maestro answers the in-process rung today
    const inprocess = ENGINES.filter((engine) => engine.runner === "in-process");
    assert.deepEqual(inprocess.map((engine) => engine.id), ["node"]);
  });

  it("declares the ready, planned and declared sets exactly as the lanes wire them", () => {
    const ready = ENGINES.filter((engine) => engine.state === "ready").map((engine) => engine.id).sort();
    assert.deepEqual(ready, [...READYSET].sort());
    const planned = ENGINES.filter((engine) => engine.state === "planned").map((engine) => engine.id).sort();
    assert.deepEqual(planned, [...PLANNEDSET].sort());
    const declared = ENGINES.filter((engine) => engine.state === "declared").map((engine) => engine.id).sort();
    assert.deepEqual(declared, [...DECLAREDSET].sort());
    // the report counts the same sets — it cannot drift from the catalog
    const report = enginesreport();
    assert.equal(report.ready, READYSET.length);
    assert.equal(report.planned, PLANNEDSET.length);
    assert.equal(report.declared, DECLAREDSET.length);
    assert.equal(report.native, 8);
  });

  it("counts them all in the root manifest — every id answers and the field grows without limit", async () => {
    const url = new URL("../package.json", import.meta.url);
    const manifest = JSON.parse(await readFile(url, "utf8")) as { engines?: Record<string, string> };
    assert.ok(manifest.engines, "the root manifest carries no engines field");
    const keys = Object.keys(manifest.engines);
    assert.ok(keys.length >= ENGINEPLANCOUNT, `the manifest counts ${keys.length} engines`);
    for (const engine of ENGINES) {
      assert.ok(engine.id in manifest.engines, `${engine.id} misses from the root manifest`);
      assert.ok(manifest.engines[engine.id].length > 0, `${engine.id} carries no version range`);
    }
  });

  it("dispatches honestly — the maestro in-process, the wired engines spawned, the rest refuse", () => {
    const maestro = dispatchengine("node");
    assert.ok(maestro);
    assert.equal(maestro.mode, "in-process");
    assert.equal(maestro.executable, true);
    for (const engine of ENGINES) {
      if (engine.id === "node") continue;
      const row = dispatchengine(engine.id);
      assert.ok(row, `${engine.id} answers no dispatch`);
      assert.equal(row.mode, "spawn");
      assert.equal(row.command, engine.command);
      assert.deepEqual([...row.flags], [...engine.flags]);
      if (engine.state === "ready") {
        assert.equal(row.executable, true);
        assert.equal(row.resolution, "");
        assert.ok(row.flags.length >= 1, `${engine.id} documents no flag mapping`);
      } else {
        assert.equal(row.executable, false, `${engine.id} must refuse until its rung answers`);
        assert.ok(row.resolution.length > 0, `${engine.id} refuses without the resolution path`);
      }
    }
    assert.equal(dispatchengine("no-such-engine"), undefined);
  });

  it("answers the full dispatch table with the fifteen rows in table order", () => {
    const table = dispatchtable();
    assert.equal(table.length, ENGINES.length);
    assert.deepEqual(table.map((row) => row.id), ENGINES.map((engine) => engine.id));
    assert.equal(table[0]?.id, "node");
  });

  it("answers engines by id", () => {
    assert.equal(getengine("python")?.kind, "scripted");
    assert.equal(getengine("go")?.state, "declared");
    assert.equal(getengine("no-such-engine"), undefined);
  });
});
