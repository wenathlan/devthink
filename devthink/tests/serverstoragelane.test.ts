/**
 * The storage lane tests: every check rides the real functions against the
 * real sqlite file in the devthink data home — no mocks, no fixtures, no
 * images. Owners are unique per test so the shared store stays isolated.
 * The plan quota composition rides the pure planquota law (the tier table,
 * the custom definition under the terabyte ceiling, the 900 floor) and the
 * plan store round-trips against an isolated temp database the boot ensure
 * lays — the same law the server boot carries.
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  DEFAULTQUOTAMB,
  deleteobject,
  ensureplanstore,
  getobject,
  getplan,
  keyvalid,
  listobjects,
  planquota,
  planquotamb,
  putobject,
  QUOTACEILMB,
  setplan,
  StorageError,
  TIERQUOTAMB,
  usagefor,
  type planrow,
} from "../storage.js";

/** the isolated plan store of this suite: the boot ensure lays the table on
 * a temp database before the first prisma touch, so the plan round-trips
 * never touch the shared workbench file */
const plandir = mkdtempSync(join(tmpdir(), "storage-plan-"));
process.env.DEVTHINK_DATABASE_URL = `file:${join(plandir, "plan.db")}`;

afterAll(() => {
  rmSync(plandir, { recursive: true, force: true });
});

/** one plan row of the composition tests (the shape getplan answers). */
function planrowof(tier: string, storagemb: number | null): planrow {
  return { tier, storagemb: storagemb === null ? null : BigInt(storagemb), rammib: null, since: new Date() };
}

let sequence = 0;
function newowner(): string {
  sequence += 1;
  return ["owner", String(Date.now()), String(sequence)].join("-");
}

describe("the storage lane", () => {
  it("stores, reads and rounds a real object through the vault-shaped record", () => {
    const owner = newowner();
    const stored = putobject(owner, "docs/readme", "the storage lane keeps everything in the family infrastructure", 900);
    expect(stored.bytes).toBeGreaterThan(0);
    const found = getobject(owner, "docs/readme");
    expect(found).not.toBeNull();
    expect(found?.content).toBe("the storage lane keeps everything in the family infrastructure");
    expect(found?.updatedAt).toBe(stored.updatedAt);
    const listing = listobjects(owner);
    expect(listing).toHaveLength(1);
    expect(listing[0].key).toBe("docs/readme");
  });

  it("replaces an object under the same key and keeps one record", () => {
    const owner = newowner();
    putobject(owner, "notes/first", "the first version", 900);
    putobject(owner, "notes/first", "the second version", 900);
    const found = getobject(owner, "notes/first");
    expect(found?.content).toBe("the second version");
    expect(listobjects(owner)).toHaveLength(1);
    const usage = usagefor(owner, 900);
    expect(usage.objects).toBe(1);
    expect(usage.quotamb).toBe(900);
  });

  it("refuses a write past the remaining quota and stores nothing", () => {
    const owner = newowner();
    const big = "x".repeat(2 * 1024 * 1024);
    expect(() => putobject(owner, "big/blob", big, 1)).toThrow(StorageError);
    expect(getobject(owner, "big/blob")).toBeNull();
    expect(usagefor(owner, 1).bytes).toBe(0);
  });

  it("removes an object and answers the removal honestly", () => {
    const owner = newowner();
    putobject(owner, "temp/gone", "nothing here stays", 900);
    expect(deleteobject(owner, "temp/gone")).toBe(true);
    expect(deleteobject(owner, "temp/gone")).toBe(false);
    expect(getobject(owner, "temp/gone")).toBeNull();
  });

  it("refuses keys that escape or break the shape", () => {
    const owner = newowner();
    expect(keyvalid("../../escape")).toBe(false);
    expect(keyvalid("/absolute")).toBe(false);
    expect(keyvalid("trailing/")).toBe(false);
    expect(keyvalid("docs/readme")).toBe(true);
    expect(() => putobject(owner, "../escape", "nope", 900)).toThrow(StorageError);
  });

  it("answers the default quota floor the owner asked for", () => {
    expect(DEFAULTQUOTAMB).toBe(900);
  });
});

describe("the plan quota composition (the quota answers by plan)", () => {
  it("answers the floor when no plan row answers", () => {
    expect(planquotamb(null)).toBe(900);
    const answer = planquota(null);
    expect(answer.source).toBe("floor");
    expect(answer.tier).toBeNull();
  });

  it("answers each tier through the declared quota table", () => {
    expect(TIERQUOTAMB.free).toBe(900);
    expect(TIERQUOTAMB.pro).toBe(10_240);
    expect(TIERQUOTAMB.enterprise).toBe(QUOTACEILMB);
    expect(planquota(planrowof("free", null))).toEqual({ quotamb: 900, tier: "free", source: "tier" });
    expect(planquota(planrowof("pro", null))).toEqual({ quotamb: 10_240, tier: "pro", source: "tier" });
    // the enterprise tier without a custom definition answers the ceiling
    expect(planquota(planrowof("enterprise", null))).toEqual({
      quotamb: QUOTACEILMB,
      tier: "enterprise",
      source: "tier",
    });
  });

  it("honors the enterprise custom definition bounded to the floor and the ceiling", () => {
    expect(planquota(planrowof("enterprise", 5_000))).toEqual({
      quotamb: 5_000,
      tier: "enterprise",
      source: "custom",
    });
    // below the floor the floor answers (the platform never gives less)
    expect(planquota(planrowof("enterprise", 100))).toEqual({
      quotamb: 900,
      tier: "enterprise",
      source: "custom",
    });
    // above the ceiling the terabyte answers (the technology bound)
    expect(planquota(planrowof("enterprise", 9_000_000))).toEqual({
      quotamb: QUOTACEILMB,
      tier: "enterprise",
      source: "custom",
    });
    // the custom definition rides the enterprise tier only
    expect(planquota(planrowof("pro", 5_000)).quotamb).toBe(10_240);
  });

  it("answers the floor for a tier the table never declared", () => {
    expect(planquota(planrowof("unknown", null))).toEqual({
      quotamb: 900,
      tier: "unknown",
      source: "floor",
    });
  });
});

describe("the plan store boots with its table", () => {
  it("lays the plan table through the boot ensure (the account lane law)", () => {
    expect(ensureplanstore()).toBe(true);
    // the idempotent second call answers the same law
    expect(ensureplanstore()).toBe(true);
  });

  it("stamps and reads a real plan row through the prisma lane — the unavailable refusal dies", async () => {
    const visitor = "planstore-probe";
    const stamped = await setplan(visitor, "pro");
    expect(stamped).not.toBeNull();
    expect(stamped?.tier).toBe("pro");
    const row = await getplan(visitor);
    expect(row?.tier).toBe("pro");
    expect(planquotamb(row)).toBe(10_240);
  });

  it("stamps the enterprise custom definition and composes the bounded quota", async () => {
    const visitor = "planstore-enterprise";
    const stamped = await setplan(visitor, "enterprise", { storagemb: 500_000 });
    expect(stamped?.storagemb).toBe(500_000n);
    const row = await getplan(visitor);
    expect(planquota(row)).toEqual({ quotamb: 500_000, tier: "enterprise", source: "custom" });
  });
});
