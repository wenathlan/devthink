// # buckets.test — the bucket shelf engine of the vault, runnable with the
// house vitest suite:
//   bunx vitest run tests/buckets.test.ts
// The shelf rolls the rehearsal ledger up per bucket: policy, rows, bytes,
// lfs share — deterministic from the seed, honest about unknowns.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  type BucketRule,
  bucketShelf,
  bucketsInUse,
  objectsOf,
  retentionLabel,
  ruleFor,
  seedRules,
  shelfBytes,
  shelfOf,
} from "../buckets.ts";
import { seedVault, VAULT_BUCKETS } from "../objects.ts";

describe("policies", () => {
  const rules = seedRules(912731);

  it("musters one policy per named bucket, in shelf order", () => {
    assert.deepEqual(
      rules.map((rule) => rule.bucket),
      [...VAULT_BUCKETS],
    );
    for (const rule of rules) {
      assert.ok(rule.days >= 0, "a policy never goes negative");
      assert.ok(rule.note.length > 0, "every policy carries its honest why");
    }
  });

  it("keeps the forever policy at zero and the finite ones positive", () => {
    const forever = rules.find((rule) => rule.bucket === "family-state");
    assert.ok(forever, "the family state bucket exists");
    assert.equal(forever.days, 0, "the family state keeps forever");
    for (const rule of rules) {
      if (rule.bucket !== "family-state") assert.ok(rule.days > 0, `${rule.bucket} rides a finite window`);
    }
  });

  it("answers the same shelf for the same seed", () => {
    assert.deepEqual(seedRules(912731), rules);
    assert.notDeepEqual(seedRules(912732), rules);
  });

  it("answers ruleFor and refuses unknown buckets", () => {
    assert.equal(ruleFor(rules, "family-state")?.days, 0);
    assert.equal(ruleFor(rules, "no-such-bucket"), undefined);
  });
});

describe("shelf", () => {
  const vault = seedVault(20260314);
  const rules = seedRules(912731);
  const shelf = shelfOf(vault, rules);

  it("rolls every named bucket up, even empty ones", () => {
    assert.equal(shelf.length, VAULT_BUCKETS.length);
    for (const entry of shelf) {
      assert.ok(entry.objects >= 0);
      assert.ok(entry.bytes >= 0);
      assert.ok(entry.lfsShare >= 0 && entry.lfsShare <= 1);
    }
  });

  it("accounts every row and byte on the shelf", () => {
    const rows = shelf.reduce((total, entry) => total + entry.objects, 0);
    assert.equal(rows, vault.length, "no row is lost between the ledger and the shelf");
    const bytes = shelfBytes(shelf);
    const ledgerBytes = vault.reduce((total, object) => total + object.size, 0);
    assert.equal(bytes, ledgerBytes, "the shelf byte total equals the ledger byte total");
  });

  it("keeps the lfs share honest per bucket", () => {
    for (const entry of shelf) {
      const mine = objectsOf(vault, entry.rule.bucket);
      const lfsBytes = mine.filter((object) => object.lfs).reduce((total, object) => total + object.size, 0);
      const expected = entry.bytes === 0 ? 0 : lfsBytes / entry.bytes;
      assert.ok(Math.abs(entry.lfsShare - expected) < 1e-9);
      assert.equal(entry.blobRows, mine.length - entry.lfsRows);
    }
  });

  it("answers the biggest row of the shelf", () => {
    for (const entry of shelf) {
      const mine = objectsOf(vault, entry.rule.bucket);
      if (mine.length === 0) {
        assert.equal(entry.biggest, undefined);
        continue;
      }
      const max = Math.max(...mine.map((object) => object.size));
      assert.equal(entry.biggest?.size, max);
    }
  });

  it("lists only the buckets the ledger actually touches", () => {
    const inUse = bucketsInUse(vault);
    assert.ok(inUse.length > 0);
    assert.ok(inUse.length <= VAULT_BUCKETS.length);
    for (const bucket of inUse) assert.ok(VAULT_BUCKETS.includes(bucket as (typeof VAULT_BUCKETS)[number]));
    assert.deepEqual(bucketsInUse([]), []);
  });

  it("shelves a bucket the ledger never touches as an honest empty row", () => {
    const rules2: BucketRule[] = [...rules, { bucket: "ghost-bucket", days: 12, note: "a policy without rows" }];
    const entry = bucketShelf(vault, rules2, "ghost-bucket");
    assert.equal(entry.objects, 0);
    assert.equal(entry.bytes, 0);
    assert.equal(entry.lfsShare, 0);
    assert.equal(entry.biggest, undefined);
  });
});

describe("retention labels", () => {
  it("renders the honest human label of a window", () => {
    assert.equal(retentionLabel(0), "sealed forever");
    assert.equal(retentionLabel(1), "1 day");
    assert.equal(retentionLabel(30), "1 month");
    assert.equal(retentionLabel(60), "2 months");
    assert.equal(retentionLabel(365), "1 year");
    assert.equal(retentionLabel(730), "2 years");
    assert.equal(retentionLabel(45), "45 days");
  });
});
