// # buckets — the bucket ledger engine of the vault (root layer, pure logic).
// The retention groups of the safe: every object rides one bucket, every
// bucket carries a retention policy (keep-forever or a day count) and the
// ledger answers the per-bucket census — rows, bytes, the lfs share and the
// policy. Deterministic: the rehearsal buckets are rolled up from the
// sealed objects (seedVault in objects.ts), the policies ride one seed —
// the same seed always musters the same shelf. No clocks, no network.
// This module is the testable core of the /buckets page.

import { VAULT_BUCKETS, type VaultObject, mulberry32 } from "./objects.ts";

/** the retention policy of one bucket: 0 days = sealed forever. */
export interface BucketRule {
  bucket: string;
  /** the retention window in days; 0 keeps the bucket sealed forever */
  days: number;
  /** the honest why the policy holds */
  note: string;
}

/** one bucket of the shelf: the policy plus its rollup. */
export interface BucketShelf {
  rule: BucketRule;
  objects: number;
  bytes: number;
  lfsRows: number;
  blobRows: number;
  /** the share of bytes riding lfs, 0..1 */
  lfsShare: number;
  biggest: VaultObject | undefined;
}

/** the rehearsal policies, deterministic from the seed — the same seed
 * always answers the same shelf (the surface says so). */
export function seedRules(seed: number): BucketRule[] {
  const rand = mulberry32(seed);
  const policies: readonly { days: number; note: string }[] = [
    { days: 0, note: "the family state keeps forever — the safe never forgets a source of truth" },
    { days: 365, note: "site assets ride a year — the deploy regenerates what the shelf drops" },
    { days: 90, note: "run evidence cools in ninety days — the runners re-report on demand" },
    { days: 30, note: "backups ride thirty days — the next backup supersedes the last" },
  ];
  return VAULT_BUCKETS.map((bucket, index) => {
    const policy = policies[index % policies.length];
    // the rehearsal drift: the seed nudges every finite policy, never below one day
    const days = policy.days === 0 ? 0 : Math.max(1, Math.round(policy.days * (0.85 + rand() * 0.3)));
    return { bucket, days, note: policy.note };
  });
}

/** the rule of one bucket (undefined when the bucket is unknown — the
 * shelf refuses unknowns honestly). */
export function ruleFor(rules: readonly BucketRule[], bucket: string): BucketRule | undefined {
  return rules.find((rule) => rule.bucket === bucket);
}

/** the objects of one bucket (the shelf's own view of the ledger). */
export function objectsOf(objects: readonly VaultObject[], bucket: string): VaultObject[] {
  return objects.filter((object) => object.bucket === bucket);
}

/** rolls one bucket up into its shelf row. */
export function bucketShelf(objects: readonly VaultObject[], rules: readonly BucketRule[], bucket: string): BucketShelf {
  const rule = ruleFor(rules, bucket);
  const mine = objectsOf(objects, bucket);
  let bytes = 0;
  let lfsRows = 0;
  let lfsBytes = 0;
  let biggest: VaultObject | undefined;
  for (const object of mine) {
    bytes += object.size;
    if (object.lfs) {
      lfsRows += 1;
      lfsBytes += object.size;
    }
    if (!biggest || object.size > biggest.size) biggest = object;
  }
  return {
    rule: rule ?? { bucket, days: 0, note: "no policy on the shelf — the bucket rides the forever default" },
    objects: mine.length,
    bytes,
    lfsRows,
    blobRows: mine.length - lfsRows,
    lfsShare: bytes === 0 ? 0 : lfsBytes / bytes,
    biggest,
  };
}

/** the whole shelf, in the vault bucket order (never a surprise order). */
export function shelfOf(objects: readonly VaultObject[], rules: readonly BucketRule[]): BucketShelf[] {
  return VAULT_BUCKETS.map((bucket) => bucketShelf(objects, rules, bucket));
}

/** the buckets an object ledger actually touches, ledger order (the honest
 * answer for the empty shelf: only real buckets appear). */
export function bucketsInUse(objects: readonly VaultObject[]): string[] {
  const seen: string[] = [];
  for (const object of objects) {
    if (!seen.includes(object.bucket)) seen.push(object.bucket);
  }
  return seen;
}

/** the human retention label of a policy (the shelf renders it verbatim). */
export function retentionLabel(days: number): string {
  if (days === 0) return "sealed forever";
  if (days === 1) return "1 day";
  if (days % 365 === 0) return `${days / 365} ${days === 365 ? "year" : "years"}`;
  if (days % 30 === 0) return `${days / 30} ${days === 30 ? "month" : "months"}`;
  return `${days} days`;
}

/** the total bytes of the shelf (the one number the vault watches). */
export function shelfBytes(shelf: readonly BucketShelf[]): number {
  return shelf.reduce((total, row) => total + row.bytes, 0);
}
