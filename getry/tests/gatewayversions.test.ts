/**
 * gatewayversions.test.ts — the data-driven route table of the gateway: the
 * family seed counts (5 providers, 7 route kinds, 35 routes), the sqlite
 * mirror rows the node runtime serves (seed-on-first-run, registration-safe
 * upsert) and the thinking chain the gateway wires over the catalog rows
 * through the thinking seat. the suite pins its own DATABASE_URL before the
 * db import so the mirror opens its own seat (one writer per wal file — the
 * SQLITE_BUSY lesson). runnable with vitest:
 *   pnpm vitest run tests/gatewayversions.test.ts
 */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, it } from "vitest";

/* the db seat isolation law: DATABASE_URL is read at the db module eval, so
 * the seat lands before the dynamic import below opens the mirror. */
process.env.DATABASE_URL = `file:${join(mkdtempSync(join(tmpdir(), "gateway-versions-")), "route-table.test.db")}`;

const db = await import("../db.ts");
const { GATEWAYROUTES, GATEWAYVERSIONS, thinkingchain, totalroutes } = await import("../gateway.ts");

afterAll(() => {
  rmSync(join(process.env.DATABASE_URL!.slice("file:".length), ".."), { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// the family seed counts — the pr19 by-example law: 5 providers, 35 routes
// ---------------------------------------------------------------------------

describe("the family seed route table (5 providers, 35 routes)", () => {
  it("carries the five provider gateways", () => {
    assert.equal(GATEWAYVERSIONS.length, 5);
    assert.deepEqual(
      GATEWAYVERSIONS.map((version) => version.provider),
      ["zai", "babel town", "nvidia nim", "opencode zen plus kilo", "openrouter"],
    );
  });

  it("serves the seven OpenAI-compatible route kinds per gateway", () => {
    assert.equal(GATEWAYROUTES.length, 7);
    for (const version of GATEWAYVERSIONS) {
      assert.deepEqual(version.routes, [...GATEWAYROUTES], `${version.v} carries the seven route kinds`);
    }
  });

  it("totals the thirty-five routes the gateway serves", () => {
    assert.equal(totalroutes(), 35);
  });
});

// ---------------------------------------------------------------------------
// the sqlite mirror rows — instance rows live in the database
// ---------------------------------------------------------------------------

describe("the gateway_versions mirror (the data-driven route table)", () => {
  it("seeds the five family rows on first use and answers them in version order", async () => {
    const rows = await db.readgatewayversionrows();
    assert.equal(rows.length, 5);
    assert.deepEqual(
      rows.map((row) => row.v),
      ["v1", "v2", "v3", "v4", "v5"],
    );
    assert.equal(rows.reduce((sum, row) => sum + row.routes.length, 0), 35);
    // the routes ride the json cell and parse back to the route kinds
    assert.deepEqual(rows[0].routes, [...GATEWAYROUTES]);
  });

  it("keeps the seeding idempotent — a second pass lands nothing", async () => {
    const seeded = await db.seedGatewayVersionRows();
    assert.equal(seeded, 0);
    assert.equal((await db.readgatewayversionrows()).length, 5);
  });

  it("writes and answers a registered row a later seed never overwrites", async () => {
    const written = await db.savegatewayversion({
      v: "v6",
      provider: "a person registered gateway",
      pattern: "registered through the internal api",
      badge: "live",
      models: "registered-model",
      note: "the route table answers the registration, never a hardcoded row",
      routes: ["chat/completions", "models"],
    });
    assert.equal(written?.provider, "a person registered gateway");
    const rows = await db.readgatewayversionrows();
    assert.equal(rows.length, 6);
    const registered = rows.find((row) => row.v === "v6");
    assert.deepEqual(registered?.routes, ["chat/completions", "models"]);
    // the seed re-run respects the registration: v6 stays, nothing resets
    assert.equal(await db.seedGatewayVersionRows(), 0);
    assert.equal((await db.readgatewayversionrows()).find((row) => row.v === "v6")?.provider, "a person registered gateway");
  });

  it("falls back to the canonical route kinds when a routes cell arrives broken", async () => {
    await db.savegatewayversion({
      v: "v7",
      provider: "broken cell gateway",
      pattern: "a bad write never loses the routes",
      badge: "paused",
      models: "any",
      note: "the projection keeps the family route kinds",
      routes: [],
    });
    const rows = await db.readgatewayversionrows();
    const broken = rows.find((row) => row.v === "v7");
    assert.deepEqual(broken?.routes, [...GATEWAYROUTES]);
    assert.equal(broken?.badge, "paused");
  });
});

// ---------------------------------------------------------------------------
// the thinking chain over the catalog — the level routes the provider rows
// ---------------------------------------------------------------------------

describe("thinkingchain — the level-routed cross-provider chain over the catalog", () => {
  it("orders the live providers first and the paused provider last", () => {
    const chain = thinkingchain("max");
    const order: string[] = [];
    for (const candidate of chain) {
      if (order[order.length - 1] !== candidate.provider) order.push(candidate.provider);
    }
    assert.deepEqual(order, ["zai", "nvidia nim", "opencode zen plus kilo", "openrouter", "babel town"]);
  });

  it("leads with the flagship tier for the maximum level and never serves a reasoning-false model", () => {
    const chain = thinkingchain("max");
    assert.equal(chain[0].provider, "zai");
    assert.equal(chain[0].model.id, "glm-5.3");
    for (const candidate of chain) {
      assert.notEqual(candidate.model.reasoning, false, `${candidate.provider}/${candidate.model.id} never carries a thinking level`);
    }
    // the first nvidia candidate is the tier-1 rotation backend the v3 lane rides
    const firstnvidia = chain.find((candidate) => candidate.provider === "nvidia nim");
    assert.equal(firstnvidia?.model.id, "moonshotai/kimi-k3");
  });

  it("walks the strong tier first for the default high level", () => {
    const chain = thinkingchain("high");
    assert.equal(chain[0].model.id, "glm-5.1");
    const ids = chain.slice(0, 4).map((candidate) => candidate.model.id);
    assert.deepEqual(ids, ["glm-5.1", "glm-5v", "glm-5.3", "glm-5.3-flash"]);
  });
});
