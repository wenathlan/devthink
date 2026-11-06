/**
 * keyrotation.test.ts — the provider key rotation over the ApiKeyRow pool:
 * the health-aware round-robin of nextkeyrow (the pr19 key rotation law —
 * never expose keys, rotation periods, per-provider health) beside the
 * masking discipline the render paths owe. runnable with vitest:
 *   pnpm vitest run test/keyrotation.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { type ApiKeyRow, maskkey, nextkeyrow, rotationsummary } from "../db.ts";

/** the reference clock of the fixtures (a fixed epoch, no wall time). */
const NOW = 1_800_000_000_000;

/** Builds one key row fixture with every value the rotation reads. */
function key(over: Partial<ApiKeyRow> & { id: string }): ApiKeyRow {
  return {
    provider: "nvidia",
    key: `nvapi-fixed-${over.id.padStart(4, "0")}-credential-shape`,
    label: `nim rotation ${over.id}`,
    active: true,
    status: "active",
    useCount: 0,
    rotationCount: 0,
    errorCount: 0,
    rateLimitHit: false,
    createdAt: "2026-09-12T10:00:00.000Z",
    expiresAt: null,
    ...over,
  };
}

describe("nextkeyrow — the health-aware round-robin of the key pool", () => {
  it("walks the pool in stable order and wraps the cursor", () => {
    const pool = [key({ id: "k1" }), key({ id: "k2" }), key({ id: "k3" })];
    const walk: string[] = [];
    let cursor = 0;
    for (let step = 0; step < 5; step++) {
      const pick = nextkeyrow(pool, cursor, NOW);
      assert.ok(pick, "an eligible pool always answers");
      walk.push(pick.row.id);
      cursor = pick.cursor;
    }
    assert.deepEqual(walk, ["k1", "k2", "k3", "k1", "k2"]);
  });

  it("never answers a revoked, inactive or expired key", () => {
    const pool = [
      key({ id: "revoked", status: "revoked" }),
      key({ id: "inactive", active: false }),
      key({ id: "expired", expiresAt: "2026-01-01T00:00:00.000Z" }),
      key({ id: "live" }),
    ];
    for (let cursor = 0; cursor < 4; cursor++) {
      const pick = nextkeyrow(pool, cursor, NOW);
      assert.ok(pick);
      assert.equal(pick.row.id, "live");
    }
    assert.equal(nextkeyrow(pool.slice(0, 3), 0, NOW), null);
  });

  it("keeps an unparseable expiry honest — only a real parse retires a key", () => {
    const pool = [key({ id: "odd", expiresAt: "not-a-date" }), key({ id: "live" })];
    const walk: string[] = [];
    let cursor = 0;
    for (let step = 0; step < 4; step++) {
      const pick = nextkeyrow(pool, cursor, NOW);
      assert.ok(pick);
      walk.push(pick.row.id);
      cursor = pick.cursor;
    }
    assert.deepEqual(walk, ["odd", "live", "odd", "live"]);
  });

  it("leads with the healthy seats — an erroring or rate-limited key rides only when nothing healthy remains", () => {
    const pool = [
      key({ id: "healthy-a" }),
      key({ id: "erroring", errorCount: 3 }),
      key({ id: "ratelimited", rateLimitHit: true }),
      key({ id: "healthy-b" }),
    ];
    const walk: string[] = [];
    let cursor = 0;
    for (let step = 0; step < 4; step++) {
      const pick = nextkeyrow(pool, cursor, NOW);
      assert.ok(pick);
      walk.push(pick.row.id);
      cursor = pick.cursor;
    }
    assert.deepEqual(walk, ["healthy-a", "healthy-b", "healthy-a", "healthy-b"]);
    // every healthy seat out of the pool: the erroring seats take the walk
    const degraded = [key({ id: "erroring", errorCount: 3 }), key({ id: "ratelimited", rateLimitHit: true })];
    const fallback = nextkeyrow(degraded, 0, NOW);
    assert.ok(fallback);
    assert.equal(fallback.row.id, "erroring");
    assert.equal(fallback.cursor, 1);
  });

  it("normalizes any cursor the caller persisted", () => {
    const pool = [key({ id: "k1" }), key({ id: "k2" }), key({ id: "k3" })];
    assert.equal(nextkeyrow(pool, -1, NOW)?.row.id, "k3");
    assert.equal(nextkeyrow(pool, 7, NOW)?.row.id, "k2");
  });

  it("answers an empty pool with null, never a thrown rotation", () => {
    assert.equal(nextkeyrow([], 0, NOW), null);
  });
});

describe("the key render discipline — selection answers rows, rendering masks", () => {
  it("masks every key shape the routes answer", () => {
    const short = "nvapi-short";
    assert.equal(maskkey(short), "nvap****");
    const long = "nvapi-1234567890abcdef-ijklmnop";
    assert.equal(maskkey(long), "nvapi-12****mnop");
    const masked = maskkey(key({ id: "k9" }).key);
    assert.ok(!masked.includes("credential-shape"), "the mask never carries the key body");
  });

  it("summarizes the per-provider rotation health the rail renders", () => {
    const pool = [
      key({ id: "k1" }),
      key({ id: "k2", rotationCount: 18 }),
      key({ id: "k3", errorCount: 2 }),
      key({ id: "k4", status: "revoked" }),
    ];
    assert.deepEqual(rotationsummary(pool), { active: 3, rotating: 1, erroring: 1 });
  });
});
