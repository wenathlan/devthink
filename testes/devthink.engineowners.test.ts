// # engineowners.test — the ownership law under gate (pr16: one engine, one
// owner, the family consumes). Every test watches one promise the manifest
// makes: every official app declares its engine exactly once, no engine ever
// carries two owners, every consumer is an official app that is not the
// owner, the dedup contract of the 7-level thinking ladder holds (the os
// derives its budgets from the getry owner, never from a local copy), and
// the package.json engine manifest agrees with the manifest of record.
// Dependency-free by design: the gate answers in any runner that can read
// the repository tree, before any install.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import {
  consumerpairs,
  engineof,
  ENGINEOWNERS,
  OFFICIALAPPS,
  ownersbyengine,
} from "../devthink/engineowners.ts";
import { THINKINGLEVELS } from "../getry/thinking.ts";

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

  it("carries the explicit debt entries with their honest migration paths", () => {
    // the getry debt is the one known duplication: streamfallback.ts
    // reimplements the devthink retry backoff discipline instead of
    // consuming the published queue family
    const getry = engineof("getry");
    assert.ok(getry?.debt, "the getry row must carry its documented debt");
    assert.match(getry.debt, /streamfallback\.ts/);
    assert.match(getry.debt, /migration path/i);
    // every other row is debt-free: an undocumented duplication is the lie
    for (const row of ENGINEOWNERS) {
      if (row.owner !== "getry") {
        assert.equal(row.debt, undefined, `${row.owner} carries an undocumented debt entry`);
      }
    }
  });
});

describe("the dedup contract — the 7-level thinking ladder", () => {
  const enginesource = readFileSync(new URL("../devthink/engine.ts", import.meta.url), "utf8");
  const typessource = readFileSync(new URL("../devthink/types.ts", import.meta.url), "utf8");
  const utilsource = readFileSync(new URL("../devthink/utils.ts", import.meta.url), "utf8");
  const viewconfigsource = readFileSync(new URL("../devthink/gatewayviewconfig.ts", import.meta.url), "utf8");
  const osgatewaysource = readFileSync(new URL("../devthink/osgateway.ts", import.meta.url), "utf8");

  it("keeps the ladder in one place: getry owns the canonical rungs", () => {
    assert.equal(THINKINGLEVELS.length, 7);
    const budgets = THINKINGLEVELS.map((rung) => rung.budget);
    assert.deepEqual(budgets, [0, 1400, 5500, 17000, 68000, 68000, 68000]);
    const names = THINKINGLEVELS.map((rung) => rung.level);
    assert.deepEqual(names, ["none", "minimal", "low", "medium", "high", "xhigh", "max"]);
  });

  it("makes the os consume the ladder through the library specifier, never a local copy", () => {
    // the engine derives its budget map from the owner's THINKINGLEVELS
    assert.match(
      enginesource,
      /from "@wenathlan\/getry\/thinking"/,
      "engine.ts must import the ladder from the getry owner through the published library specifier",
    );
    assert.match(enginesource, /THINKINGLEVELS\.map/, "engine.ts must derive its budgets from THINKINGLEVELS");
    // the hardcoded ladder literals are gone — a second copy is the duplication
    assert.doesNotMatch(
      enginesource,
      /minimal:\s*1400/,
      "engine.ts must not carry a hardcoded rung budget — the ladder lives in getry",
    );
    // the type union answers the owner too: one vocabulary, one place
    assert.match(
      typessource,
      /import type \{ ThinkingLevelName \} from "@wenathlan\/getry\/thinking"/,
      "types.ts must consume the level union from the getry owner",
    );
    assert.doesNotMatch(
      typessource,
      /"none" \| "minimal" \| "low" \| "medium" \| "high" \| "xhigh" \| "max"/,
      "types.ts must not redeclare the seven rung names — the union lives in getry",
    );
  });

  it("retires every other ladder copy the os carried: utils, view config, os gateway", () => {
    // utils.ts — the helper family derives from the owner
    assert.match(utilsource, /from "@wenathlan\/getry\/thinking"/);
    assert.match(utilsource, /THINKINGLEVELS\.map/);
    assert.doesNotMatch(utilsource, /minimal:\s*1400/, "utils.ts must not carry a hardcoded rung budget");
    assert.doesNotMatch(utilsource, /"none" \| "minimal" \| "low"/, "utils.ts must not redeclare the rung union");
    // gatewayviewconfig.ts — the shipped example config derives its budgets
    assert.match(viewconfigsource, /from "@wenathlan\/getry\/thinking"/);
    assert.match(viewconfigsource, /THINKINGLEVELS\.map/);
    assert.doesNotMatch(viewconfigsource, /minimal:\s*1400/, "the view config must not carry a hardcoded budget map");
    // osgateway.ts — the client speaks the owner's union
    assert.match(osgatewaysource, /import type \{ ThinkingLevelName \} from "@wenathlan\/getry\/thinking"/);
    assert.doesNotMatch(osgatewaysource, /"none" \| "minimal" \| "low"/, "the os gateway must not redeclare the union");
  });
});

describe("the package.json engine manifest agrees with the manifest of record", () => {
  const packagejson = JSON.parse(readFileSync(new URL("../devthink/package.json", import.meta.url), "utf8"));
  const manifest = packagejson.devthink?.engines ?? [];

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
        const declared = byengine.get(entry.name);
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
