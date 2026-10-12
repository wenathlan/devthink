// # retention — the retention engine of the vault (root layer, pure logic).
// The clock of the safe: every object carries the tick it was sealed at,
// every bucket carries a retention window (0 = sealed forever) and the
// engine answers the honest plan — what the sweep would collect today, what
// it frees and what stays sealed. The clock is REHEARSAL time: one tick of
// the vault equals one day, the page rolls it forward deterministically,
// and the sweep is a PLAN (pure — the rehearsal never deletes). No wall
// clock, no network: the same ledger, rules and tick always answer the
// same plan. This module is the testable core of the /retention page.

import { ruleFor, retentionLabel, type BucketRule } from "./buckets.ts";
import type { VaultObject } from "./objects.ts";

/** the retention state of one object at the current tick of the vault. */
export type RetentionState = "sealed" | "due" | "protected";

/** one retention answer: the object, its age in days, its state and the
 * honest why the state holds. */
export interface RetentionVerdict {
  object: VaultObject;
  /** the object age in vault days (ticks since the seal) */
  ageDays: number;
  state: RetentionState;
  why: string;
}

/**
 * The retention verdict of one object: protected rides a forever policy,
 * sealed is inside its window, due passed it. Pure — the same inputs always
 * answer the same state.
 */
export function verdictOf(object: VaultObject, rules: readonly BucketRule[], now: number): RetentionVerdict {
  const rule = ruleFor(rules, object.bucket);
  const days = rule?.days ?? 0;
  const ageDays = Math.max(0, now - object.sealedAt);
  if (days === 0) {
    return { object, ageDays, state: "protected", why: "the bucket keeps forever — nothing sweeps out of it" };
  }
  if (ageDays <= days) {
    const left = days - ageDays;
    return {
      object,
      ageDays,
      state: "sealed",
      why: left === 0 ? "rides the last day of its window" : `${left} ${left === 1 ? "day" : "days"} left in the window`,
    };
  }
  return {
    object,
    ageDays,
    state: "due",
    why: `${ageDays - days} ${ageDays - days === 1 ? "day" : "days"} past the ${retentionLabel(days)}`,
  };
}

/** the whole ledger under the clock, in ledger order. */
export function retentionVerdicts(
  objects: readonly VaultObject[],
  rules: readonly BucketRule[],
  now: number,
): RetentionVerdict[] {
  return objects.map((object) => verdictOf(object, rules, now));
}

/** the sweep plan: what the vault would collect at the current tick, the
 * bytes it frees and the buckets they ride. Pure — nothing is deleted. */
export interface SweepPlan {
  due: RetentionVerdict[];
  bytes: number;
  byBucket: Readonly<Record<string, number>>;
}

/** builds the sweep plan of the vault at the current tick. */
export function sweepPlan(objects: readonly VaultObject[], rules: readonly BucketRule[], now: number): SweepPlan {
  const due = retentionVerdicts(objects, rules, now).filter((verdict) => verdict.state === "due");
  const byBucket: Record<string, number> = {};
  let bytes = 0;
  for (const verdict of due) {
    bytes += verdict.object.size;
    byBucket[verdict.object.bucket] = (byBucket[verdict.object.bucket] ?? 0) + verdict.object.size;
  }
  return { due, bytes, byBucket };
}

/** the first tick any object of the ledger turns due (the horizon of the
 * timeline; Infinity when nothing ever turns due). */
export function firstDueTick(objects: readonly VaultObject[], rules: readonly BucketRule[]): number {
  let first = Number.POSITIVE_INFINITY;
  for (const object of objects) {
    const rule = ruleFor(rules, object.bucket);
    const days = rule?.days ?? 0;
    if (days === 0) continue;
    const due = object.sealedAt + days;
    if (due < first) first = due;
  }
  return first;
}

/** the last tick any finite window of the shelf expires (the far end of
 * the timeline; 0 when the shelf keeps forever). */
export function horizonTick(objects: readonly VaultObject[], rules: readonly BucketRule[]): number {
  let horizon = 0;
  for (const object of objects) {
    const rule = ruleFor(rules, object.bucket);
    const days = rule?.days ?? 0;
    if (days === 0) continue;
    horizon = Math.max(horizon, object.sealedAt + days);
  }
  return horizon;
}

/** the ticks the /retention page rolls the clock per press (deterministic —
 * never random): a quarter month of vault time. */
export const ROLL_STEP = 7;

/** the honest label of a vault tick (days since the rehearsal seal of the
 * first row — the clock the page shows). */
export function tickLabel(now: number): string {
  if (now === 1) return "day 1";
  return `day ${now}`;
}
