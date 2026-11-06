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
  pickroundrobin,
  ROTATIONDEFAULTS,
  remainingcooldown,
  rotatepool,
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

// ---------------------------------------------------------------------------
// round robin + the unified rotation entry (pr19: round-robin + weighted +
// health-aware in one rotation math)
// ---------------------------------------------------------------------------

describe("routerotation round robin", () => {
  it("walks the healthy pool in stable order and wraps the cursor", () => {
    const ledger = newledger();
    const walk: string[] = [];
    let cursor = 0;
    for (let step = 0; step < 7; step++) {
      const pick = pickroundrobin(POOL, ledger, cursor, 1000);
      assert.ok(pick, "a healthy pool always answers");
      walk.push(pick.route.id);
      cursor = pick.cursor;
    }
    assert.deepEqual(walk, ["r1", "r2", "r3", "r1", "r2", "r3", "r1"]);
  });

  it("gives every healthy route an equal share over a full cycle", () => {
    const ledger = newledger();
    const shares = new Map<string, number>([["r1", 0], ["r2", 0], ["r3", 0]]);
    let cursor = 0;
    for (let step = 0; step < 300; step++) {
      const pick = pickroundrobin(POOL, ledger, cursor, 1000);
      assert.ok(pick);
      shares.set(pick.route.id, (shares.get(pick.route.id) ?? 0) + 1);
      cursor = pick.cursor;
    }
    assert.equal(shares.get("r1"), 100);
    assert.equal(shares.get("r2"), 100);
    assert.equal(shares.get("r3"), 100);
  });

  it("stays health-aware: cooling and zero-weight routes leave the walk", () => {
    const ledger = newledger();
    notefailure(ledger, "r2", { allowedFails: 0 }, 1000);
    const routes = [...POOL, { id: "r0", provider: "babeltown", model: "paused", weight: 0 }];
    const walk: string[] = [];
    let cursor = 0;
    for (let step = 0; step < 4; step++) {
      const pick = pickroundrobin(routes, ledger, cursor, 1000);
      assert.ok(pick);
      walk.push(pick.route.id);
      cursor = pick.cursor;
    }
    assert.deepEqual(walk, ["r1", "r3", "r1", "r3"]);
    // the cooldown expiry walks r2 back in: the cursor resumes over the
    // restored three-route pool (0 → r1) and the very next pick reaches r2
    const back = pickroundrobin(routes, ledger, cursor, 1000 + ROTATIONDEFAULTS.cooldownMs + 1);
    assert.ok(back);
    assert.equal(back.route.id, "r1");
    const then = pickroundrobin(routes, ledger, back.cursor, 1000 + ROTATIONDEFAULTS.cooldownMs + 1);
    assert.equal(then?.route.id, "r2");
  });

  it("answers null when every route cools down, whatever the cursor", () => {
    const ledger = newledger();
    for (const route of POOL) notefailure(ledger, route.id, { allowedFails: 0 }, 1000);
    assert.equal(pickroundrobin(POOL, ledger, 0, 1000), null);
    assert.equal(pickroundrobin(POOL, ledger, 41, 1000), null);
  });

  it("normalizes any cursor the caller persisted onto the healthy pool", () => {
    const ledger = newledger();
    assert.equal(pickroundrobin(POOL, ledger, -1, 1000)?.route.id, "r3");
    assert.equal(pickroundrobin(POOL, ledger, 7, 1000)?.route.id, "r2");
    assert.equal(pickroundrobin(POOL, ledger, 8, 1000)?.route.id, "r3");
  });
});

describe("rotatepool — the unified rotation entry", () => {
  it("defaults to the round-robin walk", () => {
    const ledger = newledger();
    const first = rotatepool({ routes: POOL, ledger, cursor: 0, now: 1000 });
    const second = rotatepool({ routes: POOL, ledger, cursor: first?.cursor, now: 1000 });
    assert.equal(first?.route.id, "r1");
    assert.equal(second?.route.id, "r2");
  });

  it("answers the weighted draw under the weighted strategy (cursor untouched)", () => {
    const ledger = newledger();
    const pick = rotatepool({ routes: POOL, ledger, strategy: "weighted", cursor: 9, rand: () => 0, now: 1000 });
    assert.equal(pick?.route.id, "r1");
    assert.equal(pick?.cursor, 9);
    // rand just below 1 lands on the last healthy route
    const tail = rotatepool({ routes: POOL, ledger, strategy: "weighted", rand: () => 0.9999, now: 1000 });
    assert.equal(tail?.route.id, "r3");
  });

  it("answers null under both strategies when nothing is healthy", () => {
    const ledger = newledger();
    for (const route of POOL) notefailure(ledger, route.id, { allowedFails: 0 }, 1000);
    assert.equal(rotatepool({ routes: POOL, ledger, strategy: "round-robin", now: 1000 }), null);
    assert.equal(rotatepool({ routes: POOL, ledger, strategy: "weighted", rand: () => 0, now: 1000 }), null);
  });
});
