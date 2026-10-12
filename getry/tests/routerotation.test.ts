/**
 * routerotation.test.ts — honest unit tests for the weighted rotation,
 * runnable with the vitest runner:
 *   pnpm test
 */
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  healthyroutes,
  type ModelRoute,
  newledger,
  notefailure,
  notesuccess,
  pickroute,
  ROTATIONDEFAULTS,
  remainingcooldown,
} from "../routerotation.ts";

/** the three-route pool the tests rotate over. */
const POOL: ModelRoute[] = [
  { id: "r1", provider: "zai", model: "glm-5.3-flash", weight: 2 },
  { id: "r2", provider: "nvidia", model: "deepseek-v4", weight: 1 },
  { id: "r3", provider: "openrouter", model: "free-tag", weight: 1 },
];

describe("routerotation weighted pick", () => {
  it("never answers a cooled-down or zero-weight route", () => {
    const ledger = newledger();
    const routes = [...POOL, { id: "r0", provider: "babeltown", model: "paused", weight: 0 }];
    notefailure(ledger, "r1", { allowedFails: 0 }, 1000);
    const picks = new Set(Array.from({ length: 200 }, () => pickroute(routes, ledger, Math.random, 1000)?.id));
    assert.ok(!picks.has("r1"), "cooled route must not be picked");
    assert.ok(!picks.has("r0"), "zero-weight route must not be picked");
    assert.ok(picks.has("r2") && picks.has("r3"));
  });

  it("distributes the draws proportionally to the weights", () => {
    const ledger = newledger();
    const draws = Array.from({ length: 6000 }, () => pickroute(POOL, ledger, Math.random)?.id);
    const r1 = draws.filter((id) => id === "r1").length;
    const r2 = draws.filter((id) => id === "r2").length;
    assert.ok(Math.abs(r1 / r2 - 2) < 0.2, `expected r1 ≈ 2×r2, got ${r1} vs ${r2}`);
  });

  it("answers null when every route is cooling down", () => {
    const ledger = newledger();
    for (const route of POOL) notefailure(ledger, route.id, { allowedFails: 0 }, 1000);
    assert.equal(pickroute(POOL, ledger, Math.random, 1000), null);
    assert.equal(pickroute(POOL, ledger, () => 0, 1_000 + ROTATIONDEFAULTS.cooldownMs + 1)?.id, "r1");
  });

  it("skips the ledger route through the weighted walk without a draw on it", () => {
    const ledger = newledger();
    notefailure(ledger, "r1", { allowedFails: 0 }, 1000);
    // rand() = 0 always lands on the first healthy route: r2
    assert.equal(pickroute(POOL, ledger, () => 0, 1000)?.id, "r2");
    // rand() just below 1 always lands on the last healthy route: r3
    assert.equal(pickroute(POOL, ledger, () => 0.9999, 1000)?.id, "r3");
  });
});

describe("routerotation cooldown ledger", () => {
  it("tolerates allowedFails failures before cooling down", () => {
    const ledger = newledger();
    notefailure(ledger, "r1", {}, 1000);
    notefailure(ledger, "r1", {}, 1000);
    notefailure(ledger, "r1", {}, 1000);
    assert.deepEqual(ledger.get("r1"), { until: 0, failures: 3 });
    assert.equal(remainingcooldown(ledger.get("r1"), 1000), 0);
  });

  it("buys the cooldown after the budget and escalates per further failure", () => {
    const ledger = newledger();
    for (let index = 0; index < 3; index++) notefailure(ledger, "r1", {}, 1000);
    notefailure(ledger, "r1", {}, 1000);
    assert.equal(remainingcooldown(ledger.get("r1"), 1000), ROTATIONDEFAULTS.cooldownMs);
    notefailure(ledger, "r1", {}, 1000);
    assert.equal(
      remainingcooldown(ledger.get("r1"), 1000),
      ROTATIONDEFAULTS.cooldownMs + ROTATIONDEFAULTS.cooldownStepMs,
    );
  });

  it("clamps the escalation at maxCooldownMs", () => {
    const ledger = newledger();
    for (let index = 0; index < 20; index++) notefailure(ledger, "r1", {}, 1000);
    assert.equal(remainingcooldown(ledger.get("r1"), 1000), ROTATIONDEFAULTS.maxCooldownMs);
  });

  it("clears the ledger on success", () => {
    const ledger = newledger();
    notefailure(ledger, "r1", { allowedFails: 0 }, 1000);
    notesuccess(ledger, "r1");
    assert.equal(ledger.size, 0);
    assert.equal(healthyroutes(POOL, ledger, 1000).length, 3);
  });
});
