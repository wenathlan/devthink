// # pillars.test — the storage pillars catalog of the vault, runnable with
// the house vitest suite:
//   bunx vitest run test/pillars.test.ts
// The pillar's laws: the catalog carries exactly the eight storage pillars
// of the stack (LibGit2, MySQL2, the prisma schema, drizzle, git lfs,
// blobs, bigint, pointers), every owner module lands beside the catalog on
// disk (no pillar is a wish — the row names the module that implements it
// today), the seam says seam loudly (the mysql2 rung the engine guards),
// and the static-safe route lane resolves every key under the prefix
// through the one read-only handler while an unknown scheme or a nested
// path refuses honestly (undefined, the caller's own 404) — the route
// prefix matching the shared routes catalog the family sites re-export.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { afterAll, describe, it } from "vitest";
import "./doorisolation.ts";
import {
  livePillars,
  pillarOf,
  pillarRoute,
  pillarsByGroup,
  PILLAR_COUNT,
  PILLAR_GROUPS,
  PILLAR_KEYS,
  PILLARS,
  pillarRouteOf,
  PILLAR_ROUTE_COUNT,
  PILLAR_ROUTE_PREFIX,
  type PillarRow,
} from "../pillars.ts";
import { routes } from "../routes.ts";

/** the vault root (the owner modules land beside the catalog). */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** the real server of the vault, imported after the door isolation seeds
 * the throwaway roots (the signup battery precedent — the engine chain
 * opens its stores on the isolated lanes, never the working tree). */
const { createVaultServer, listenVault } = await import("../api.ts");

describe("the catalog counts (the pillar's own numbers)", () => {
  it("carries exactly the eight storage pillars of the stack", () => {
    assert.equal(PILLAR_COUNT, 8);
    assert.equal(PILLARS.length, 8);
    assert.deepEqual(
      [...PILLAR_KEYS].sort(),
      ["bigint", "blobs", "drizzle", "gitlfs", "libgit2", "mysql2", "pointers", "prisma"],
      "the catalog names LibGit2, MySQL2, the prisma schema, drizzle, git lfs, blobs, bigint and pointers",
    );
  });

  it("serves one static-safe route per row plus the list route", () => {
    assert.equal(PILLAR_ROUTE_COUNT, PILLAR_COUNT + 1);
    assert.equal(routes.pillars, PILLAR_ROUTE_PREFIX, "the route prefix rides the shared routes catalog");
  });

  it("keeps the catalog honest: no duplicate key, every row lowercase and complete", () => {
    const seen = new Set<string>();
    for (const row of PILLARS) {
      assert.equal(row.key, row.key.toLowerCase(), `${row.key} stays lowercase`);
      assert.ok(!seen.has(row.key), `the key ${row.key} answers once`);
      seen.add(row.key);
      assert.ok(row.name.length > 0, `${row.key} carries a name`);
      assert.ok(row.law.length > 0, `${row.key} carries its law`);
      assert.ok(row.owner.length > 0, `${row.key} names its owner module`);
      assert.ok(row.spec.length > 0, `${row.key} carries a governing spec`);
      assert.ok(PILLAR_GROUPS.includes(row.group), `${row.key} rides a real group`);
    }
  });

  it("pins every owner module on disk — no pillar is a wish", () => {
    for (const row of PILLARS) {
      const owner = path.resolve(root, row.owner);
      assert.ok(existsSync(owner), `the pillar ${row.key} owns ${row.owner} and the file lands beside the catalog`);
    }
  });

  it("says the seam honestly: the mysql2 rung is guarded, the rest run live", () => {
    const seam = PILLARS.filter((row) => row.status === "seam");
    assert.deepEqual(seam.map((row) => row.key), ["mysql2"], "the mysql2 network rung is the one seam");
    const live = livePillars();
    assert.equal(live.length, 7);
    assert.ok(live.every((row) => row.status === "live"));
  });
});

describe("the lookups and the route lane", () => {
  it("resolves every key through the index (case and whitespace tolerant)", () => {
    const row = pillarOf(" GitLFS ");
    assert.ok(row !== undefined);
    assert.equal(row.key, "gitlfs");
    assert.equal(pillarOf("nosuchpillar"), undefined);
  });

  it("groups the catalog into the four families", () => {
    assert.deepEqual(PILLAR_GROUPS, ["git", "network", "schema", "bytes"]);
    assert.deepEqual(
      pillarsByGroup("git").map((row: PillarRow) => row.key),
      ["libgit2", "gitlfs"],
    );
    assert.equal(pillarsByGroup("schema").length, 2);
  });

  it("resolves every pillar route and refuses the unknown or nested path", () => {
    for (const row of PILLARS) {
      const route = pillarRoute(row.key);
      assert.ok(route.startsWith(`${PILLAR_ROUTE_PREFIX}/`));
      assert.equal(pillarRouteOf(route)?.key, row.key, `${route} answers its row`);
    }
    assert.equal(pillarRouteOf(PILLAR_ROUTE_PREFIX), undefined, "the bare prefix rides no row route");
    assert.equal(pillarRouteOf(`${PILLAR_ROUTE_PREFIX}/`), undefined, "the empty key refuses");
    assert.equal(pillarRouteOf(`${PILLAR_ROUTE_PREFIX}/gitlfs/extra`), undefined, "the nested path refuses");
    assert.equal(pillarRouteOf(`${PILLAR_ROUTE_PREFIX}/nosuchpillar`), undefined, "the unknown key refuses");
    assert.equal(pillarRouteOf("/api/v1/storage/objects"), undefined, "the foreign lane refuses");
  });

  it("answers rows the json lane can carry (plain strings, no bigint)", () => {
    for (const row of PILLARS) {
      const encoded = JSON.stringify(row);
      const parsed = JSON.parse(encoded) as PillarRow;
      assert.equal(parsed.key, row.key);
      assert.equal(parsed.status, row.status);
    }
  });
});

describe("the pillar routes over the real server (with the faun seal)", () => {
  /** the booted base url of the server. */
  let base = "";

  afterAll(async () => {
    const { closeQueryLanes } = await import("../querylane.ts");
    closeQueryLanes();
  });

  /** one json get against the booted server. */
  async function get(pathname: string): Promise<{ status: number; body: any }> {
    const answer = await fetch(`${base}${pathname}`);
    return { status: answer.status, body: await answer.json().catch(() => null) };
  }

  it("serves the catalog list and every pillar row open (the rows carry no secret)", async () => {
    const server = createVaultServer();
    const port = await listenVault(server, { port: 0 });
    base = `http://127.0.0.1:${port}`;
    try {
      const list = await get(`${routes.pillars}`);
      assert.equal(list.status, 200);
      assert.equal(list.body.count, 8);
      assert.equal(list.body.pillars.length, 8);
      for (const row of list.body.pillars) {
        assert.ok(typeof row.key === "string" && row.key.length > 0);
        assert.ok(typeof row.law === "string" && row.law.length > 0);
        assert.ok(typeof row.owner === "string" && row.owner.length > 0);
        assert.equal(row.route, `${routes.pillars}/${row.key}`);
      }
      const one = await get(`${routes.pillars}/gitlfs`);
      assert.equal(one.status, 200);
      assert.equal(one.body.key, "gitlfs");
      assert.equal(one.body.status, "live");
      const seam = await get(`${routes.pillars}/mysql2`);
      assert.equal(seam.status, 200);
      assert.equal(seam.body.status, "seam");
    } finally {
      server.close();
    }
  });

  it("refuses the unknown pillar route honestly (404, the standardized shape)", async () => {
    const server = createVaultServer();
    const port = await listenVault(server, { port: 0 });
    base = `http://127.0.0.1:${port}`;
    try {
      const unknown = await get(`${routes.pillars}/nosuchpillar`);
      assert.equal(unknown.status, 404);
      assert.equal(unknown.body.error.code, "VAULT_PILLAR");
      const nested = await get(`${routes.pillars}/gitlfs/extra`);
      assert.equal(nested.status, 404);
      assert.equal(nested.body.error.code, "VAULT_PILLAR");
    } finally {
      server.close();
    }
  });

  it("holds the faun seal beside the catalog lane — the raw database file never rides any static face", async () => {
    const server = createVaultServer();
    const port = await listenVault(server, { port: 0 });
    base = `http://127.0.0.1:${port}`;
    try {
      for (const pathname of ["/faun.db", "/vault-storage.db", "/data/app.db"]) {
        const answer = await get(pathname);
        assert.equal(answer.status, 403, `${pathname} answers the refusal`);
        assert.equal(answer.body.error.code, "VAULT_DBFILE", `${pathname} answers the faun law`);
      }
    } finally {
      server.close();
    }
  });
});
