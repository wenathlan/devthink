// # engineowners.test — the ownership law under gate (pr16: one engine, one
// owner, the family consumes). Every test watches one promise the manifest
// makes: every official app declares its engine exactly once, no engine ever
// carries two owners, every consumer is an official app that is not the
// owner, the ownership wave is written into the rows (the universal gateway
// domain answers from getry, the os keeps the graph runner, the queue family
// and the mcp registry), the dedup contract of the 7-level thinking ladder
// holds (the os derives its budgets from the getry owner, never from a local
// copy), and the package.json engine manifest agrees with the manifest of
// record. Dependency-free by design: the gate answers in any runner that can
// read the repository tree, before any install.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import {
  consumerpairs,
  engineof,
  ENGINEOWNERS,
  OFFICIALAPPS,
  ownersbyengine,
} from "../engineowners.ts";
import { THINKINGLEVELS } from "../../getry/thinking.ts";

describe("the ownership manifest", () => {
  it("declares exactly one owner row per official app — all eleven, no stranger", () => {
    assert.equal(ENGINEOWNERS.length, OFFICIALAPPS.length);
    assert.equal(ENGINEOWNERS.length, 11);
    const owners = ENGINEOWNERS.map((row) => row.owner);
    assert.deepEqual([...owners].sort(), [...OFFICIALAPPS].sort());
    // one row per app — an app owning two engines would smuggle a second truth
    assert.equal(new Set(owners).size, owners.length);
  });

  it("never lets one engine carry two owners — the no-duplication law itself", () => {
    const byengine = ownersbyengine();
    assert.equal(byengine.size, ENGINEOWNERS.length);
    for (const row of ENGINEOWNERS) {
      assert.equal(
        byengine.get(row.engine),
        row.owner,
        `the engine ${row.engine} must answer to ${row.owner} and only ${row.owner}`,
      );
    }
  });

  it("points every engine at the real module of its owner app", () => {
    for (const row of ENGINEOWNERS) {
      assert.ok(row.module.length > 0, `${row.owner} must name its engine module`);
      assert.ok(!row.module.includes("/"), `${row.owner} engine module rides the app root, not a nested folder`);
      assert.ok(row.role.length > 0, `${row.owner} must say what its engine owns`);
    }
  });

  it("lists only official apps as consumers, never the owner itself", () => {
    const official = new Set(OFFICIALAPPS);
    for (const { engine, owner, consumer } of consumerpairs()) {
      assert.ok(official.has(consumer), `${consumer} consumes ${engine} but is not an official app`);
      assert.notEqual(consumer, owner, `the owner ${owner} never lists itself as a consumer of ${engine}`);
    }
  });

  it("answers an engine lookup for every official app", () => {
    for (const app of OFFICIALAPPS) {
      const row = engineof(app);
      assert.ok(row, `${app} declares no engine — the law refuses an ownerless app`);
    }
  });

  it("writes the ownership wave into the rows: the gateway domain answers from getry, never from the os", () => {
    const os = engineof("devthink");
    const gateway = engineof("getry");
    assert.ok(os, "the devthink row must exist");
    assert.ok(gateway, "the getry row must exist");
    // the os envelope points at its own root engine (the graph runner) and
    // names the queue family and the mcp registry — never the moved pipeline
    assert.equal(os.module, "graphrunner.ts", "the os engine module is the graph runner, not the moved pipeline");
    assert.match(os.role, /graph runner \(graphrunner\.ts\)/);
    assert.match(os.role, /queue family \(queue\.ts\)/);
    assert.match(os.role, /mcp registry \(mcpregistry\.ts, the os protocol serving its own tools\)/);
    // the old claim — the pipeline as the os own engine — is the inversion the wave retires
    assert.doesNotMatch(os.role, /universal gateway pipeline \(engine\.ts\)/, "the os no longer claims the gateway pipeline as its own engine");
    assert.match(os.role, /answer from the getry owner as imported libraries/, "the os consumes the pipeline as the getry library");
    // the getry owner declares the whole universal gateway domain it now carries
    assert.equal(gateway.module, "engine.ts", "the gateway engine module is the universal pipeline at the getry root");
    assert.match(gateway.role, /the whole gateway pipeline/);
    assert.match(gateway.role, /the engine \(engine\.ts\)/);
    assert.match(gateway.role, /the llm family/);
    assert.match(gateway.role, /the streaming parser/);
    assert.match(gateway.role, /the model catalog/);
    assert.match(gateway.role, /the provider surface/);
    assert.match(gateway.role, /the auth family \(oauth, accounts\)/);
    assert.match(gateway.role, /the json family \(json, jsonpolicy, jsonschema\)/);
    assert.match(gateway.role, /the intelligence store/);
    assert.match(gateway.role, /@wenathlan\/getry\/engine/, "the library specifiers the os imports through");
  });

    it("carries zero debt entries — every documented duplication has been paid", () => {
    // the streamfallback.ts debt was the last one: the file now rides the
    // published @wenathlan/devthink/queue export (the request queue family
    // owns the retry backoff) and keeps only the omniroute verdict
    // vocabulary local, exactly the migration path the manifest recorded
    for (const row of ENGINEOWNERS) {
      assert.equal(row.debt, undefined, `${row.owner} carries a debt entry — every documented duplication must be paid before the wave lands`);
    }
  });
});

describe("the dedup contract — the 7-level thinking ladder", () => {
  // the ownership wave moved engine.ts, utils.ts, gatewayviewconfig.ts and
  // the shared type contracts to the getry root (two hops up from the tests
  // village) — the ladder checks read them from the gateway owner now
  const enginesource = readFileSync(new URL("../../getry/engine.ts", import.meta.url), "utf8");
  const gatewaytypessource = readFileSync(new URL("../../getry/types.ts", import.meta.url), "utf8");
  const ostypessource = readFileSync(new URL("../types.ts", import.meta.url), "utf8");
  const utilsource = readFileSync(new URL("../../getry/utils.ts", import.meta.url), "utf8");
  const viewconfigsource = readFileSync(new URL("../../getry/gatewayviewconfig.ts", import.meta.url), "utf8");
  const osgatewaysource = readFileSync(new URL("../osgateway.ts", import.meta.url), "utf8");

  it("keeps the ladder in one place: getry owns the canonical rungs", () => {
    assert.equal(THINKINGLEVELS.length, 7);
    const budgets = THINKINGLEVELS.map((rung) => rung.budget);
    assert.deepEqual(budgets, [0, 1400, 5500, 17000, 68000, 68000, 68000]);
    const names = THINKINGLEVELS.map((rung) => rung.level);
    assert.deepEqual(names, ["none", "minimal", "low", "medium", "high", "xhigh", "max"]);
  });

  it("makes the os consume the ladder through the library specifier, never a local copy", () => {
    // the engine derives its budget map from the owner's THINKINGLEVELS (the
    // specifier inside the getry root may ride the published self-package form
    // or the relative form — the ladder lives in one place either way)
    assert.match(
      enginesource,
      /from "(?:@wenathlan\/getry\/thinking|\.\/thinking\.(?:js|ts))"/,
      "engine.ts must import the ladder from the getry owner, never from a second copy",
    );
    assert.match(enginesource, /THINKINGLEVELS\.map/, "engine.ts must derive its budgets from THINKINGLEVELS");
    // the hardcoded ladder literals are gone — a second copy is the duplication
    assert.doesNotMatch(
      enginesource,
      /minimal:\s*1400/,
      "engine.ts must not carry a hardcoded rung budget — the ladder lives in getry",
    );
    // the type union answers the owner too: one vocabulary, one place — the
    // shared type contracts moved to the gateway owner with the wave, so the
    // owner's types surface consumes the union through the published
    // specifier and the os surface never redeclares the rungs
    assert.match(
      gatewaytypessource,
      /import type \{ ThinkingLevelName \} from "@wenathlan\/getry\/thinking"/,
      "getry/types.ts must consume the level union from the getry owner",
    );
    assert.doesNotMatch(
      gatewaytypessource,
      /"none" \| "minimal" \| "low" \| "medium" \| "high" \| "xhigh" \| "max"/,
      "getry/types.ts must not redeclare the seven rung names — the union lives in the thinking owner",
    );
    assert.doesNotMatch(
      ostypessource,
      /"none" \| "minimal" \| "low" \| "medium" \| "high" \| "xhigh" \| "max"/,
      "types.ts must not redeclare the seven rung names — the union lives in getry",
    );
  });

  it("retires every other ladder copy the family carried: utils, view config, os gateway", () => {
    // utils.ts — the helper family derives from the owner
    assert.match(utilsource, /from "(?:@wenathlan\/getry\/thinking|\.\/thinking\.(?:js|ts))"/);
    assert.match(utilsource, /THINKINGLEVELS\.map/);
    assert.doesNotMatch(utilsource, /minimal:\s*1400/, "utils.ts must not carry a hardcoded rung budget");
    assert.doesNotMatch(utilsource, /"none" \| "minimal" \| "low"/, "utils.ts must not redeclare the rung union");
    // gatewayviewconfig.ts — the shipped example config derives its budgets
    assert.match(viewconfigsource, /from "(?:@wenathlan\/getry\/thinking|\.\/thinking\.(?:js|ts))"/);
    assert.match(viewconfigsource, /THINKINGLEVELS\.map/);
    assert.doesNotMatch(viewconfigsource, /minimal:\s*1400/, "the view config must not carry a hardcoded budget map");
    // osgateway.ts — the client speaks the owner's union
    assert.match(osgatewaysource, /import type \{ ThinkingLevelName \} from "@wenathlan\/getry\/thinking"/);
    assert.doesNotMatch(osgatewaysource, /"none" \| "minimal" \| "low"/, "the os gateway must not redeclare the union");
  });
});

describe("the package.json engine manifest agrees with the manifest of record", () => {
  const packagejson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const manifest: Array<{ name?: string; owner?: string; source?: string }> = packagejson.devthink?.engines ?? [];

  it("declares an owner on every engine row", () => {
    assert.ok(manifest.length > 0, "the devthink.engines manifest must exist");
    for (const entry of manifest) {
      assert.ok(entry.owner, `the engine ${entry.name} must declare its owner`);
      assert.ok(OFFICIALAPPS.includes(entry.owner), `${entry.owner} is not an official app`);
    }
  });

  it("assigns each family engine to the one owner the manifest of record declares", () => {
    const byengine = ownersbyengine();
    for (const entry of manifest) {
      if (entry.source === "library") {
        const declared = byengine.get(entry.name ?? "");
        assert.equal(
          entry.owner,
          declared,
          `the engine ${entry.name} answers to ${declared} in the manifest of record`,
        );
      }
    }
    // the seven family engines of the ownership law all ride the manifest
    for (const engine of ["versawaze", "kathesis", "saddle", "getry", "argan", "vault", "cobaia"]) {
      const entry = manifest.find((row) => row.name === engine);
      assert.ok(entry, `the family engine ${engine} must ride the package.json manifest`);
      assert.equal(entry.owner, byengine.get(engine));
    }
  });
});
