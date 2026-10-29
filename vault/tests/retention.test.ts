// # retention.test — the clock engine of the vault, runnable with the
// house vitest suite:
//   bunx vitest run tests/retention.test.ts
// The clock is rehearsal time: one tick is one day, the sweep is a PLAN
// (pure — nothing is deleted), and the same ledger, rules and tick always
// answer the same verdicts.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { seedRules } from "../buckets.ts";
import { sealObject, seedVault } from "../objects.ts";
import {
  ROLL_STEP,
  firstDueTick,
  horizonTick,
  retentionVerdicts,
  sweepPlan,
  tickLabel,
  verdictOf,
} from "../retention.ts";

const rules = seedRules(912731);
const vault = seedVault(20260314);

describe("verdicts", () => {
  it("answers protected for the forever policy, whatever the age", () => {
    const familyRow = vault.find((object) => object.bucket === "family-state");
    assert.ok(familyRow, "the rehearsal rides the family-state bucket");
    const verdict = verdictOf(familyRow, rules, 10_000);
    assert.equal(verdict.state, "protected");
    assert.match(verdict.why, /keeps forever/);
  });

  it("answers sealed inside the window and due past it", () => {
    const object = sealObject("backups", "/backups/ledger.tzst", "application/x-tzst", 220_118_016, 0).object;
    const backupRule = rules.find((rule) => rule.bucket === "backups")!;
    assert.ok(backupRule.days > 0, "the backups window is finite in this rehearsal");
    assert.equal(verdictOf(object, rules, backupRule.days).state, "sealed", "the last day is still sealed");
    assert.equal(verdictOf(object, rules, backupRule.days + 1).state, "due", "one day past the window, the row is due");
    assert.equal(verdictOf(object, rules, 0).state, "sealed");
  });

  it("keeps the age non-negative and the why honest", () => {
    const object = vault[0];
    for (const now of [0, object.sealedAt, object.sealedAt + 100]) {
      const verdict = verdictOf(object, rules, now);
      assert.ok(verdict.ageDays >= 0);
      assert.ok(verdict.why.length > 0);
    }
  });

  it("answers every row of the ledger, in ledger order", () => {
    const verdicts = retentionVerdicts(vault, rules, 0);
    assert.equal(verdicts.length, vault.length);
    for (let index = 0; index < verdicts.length; index++) {
      assert.equal(verdicts[index].object.id, vault[index].id);
    }
  });

  it("is pure: the same inputs answer the same verdicts", () => {
    const once = retentionVerdicts(vault, rules, 400);
    const twice = retentionVerdicts(vault, rules, 400);
    assert.deepEqual(twice, once);
  });
});

describe("sweep plan", () => {
  it("collects only due rows and never mutates the ledger", () => {
    const before = JSON.stringify(vault);
    const plan = sweepPlan(vault, rules, 400);
    assert.equal(JSON.stringify(vault), before, "the plan is pure");
    for (const verdict of plan.due) {
      assert.equal(verdict.state, "due");
    }
    const planBytes = plan.due.reduce((total, verdict) => total + verdict.object.size, 0);
    assert.equal(plan.bytes, planBytes);
  });

  it("accounts the plan bytes per bucket", () => {
    const plan = sweepPlan(vault, rules, 400);
    let bucketTotal = 0;
    for (const bytes of Object.values(plan.byBucket)) bucketTotal += bytes;
    assert.equal(bucketTotal, plan.bytes);
    const buckets = new Set(plan.due.map((verdict) => verdict.object.bucket));
    assert.deepEqual(Object.keys(plan.byBucket).sort(), [...buckets].sort());
  });

  it("answers an empty plan before any window can expire", () => {
    const plan = sweepPlan(vault, rules, 0);
    assert.equal(plan.due.length, 0);
    assert.equal(plan.bytes, 0);
    assert.deepEqual(plan.byBucket, {});
  });
});

describe("the clock", () => {
  it("binds the first due tick to the earliest seal plus window", () => {
    const first = firstDueTick(vault, rules);
    assert.ok(Number.isFinite(first));
    let expected = Number.POSITIVE_INFINITY;
    for (const object of vault) {
      const rule = rules.find((entry) => entry.bucket === object.bucket);
      if (!rule || rule.days === 0) continue;
      expected = Math.min(expected, object.sealedAt + rule.days);
    }
    assert.equal(first, expected);
  });

  it("binds the horizon to the far end of the finite windows", () => {
    const horizon = horizonTick(vault, rules);
    let expected = 0;
    for (const object of vault) {
      const rule = rules.find((entry) => entry.bucket === object.bucket);
      if (!rule || rule.days === 0) continue;
      expected = Math.max(expected, object.sealedAt + rule.days);
    }
    assert.equal(horizon, expected);
    assert.ok(horizon >= firstDueTick(vault, rules));
  });

  it("answers never for a shelf that only keeps forever", () => {
    const foreverVault = vault.filter((object) => object.bucket === "family-state");
    assert.ok(foreverVault.length > 0);
    assert.equal(firstDueTick(foreverVault, rules), Number.POSITIVE_INFINITY);
    assert.equal(horizonTick(foreverVault, rules), 0);
  });

  it("rolls in deterministic steps and labels the days", () => {
    assert.equal(ROLL_STEP, 7);
    assert.equal(tickLabel(0), "day 0");
    assert.equal(tickLabel(1), "day 1");
    assert.equal(tickLabel(28), "day 28");
  });
});
