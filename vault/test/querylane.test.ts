// # querylane.test — the /v2/query lane of the vault (the helix-style
// supabase door), runnable with the house vitest suite:
//   bunx vitest run test/querylane.test.ts
// The defining route of the person's database, end to end: the per-database
// sqlite routing (one registered database, one file, one lane — the bytes
// never bleed between databases), the digest gate (the operator token
// timing-safe against the boot digest, the issued vault_ keys as sha-256
// digests — a wrong bearer answers the 401 refusal, a key asked for a
// foreign database answers the 403 scope refusal, a revoked key answers
// nothing), the run lane (readers answer their columns and rows, writers
// answer their change counters, the sql faults answer honestly), the quota
// gate (a write at the database's quota row refuses before it runs — the
// route answers 413 — while reads never meet the gate), and the full
// round-trip over the real http surface (create table, insert, select).
import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import type { IncomingMessage } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, it } from "vitest";
import "./doorisolation.ts";
import {
  API_KEY_PREFIX,
  issueApiKey,
  registerDatabase,
  revokeApiKey,
  setDatabaseQuota,
  signupAccount,
} from "../accounts.ts";
import { closeQueryLanes, databaseFileOf, databasesDir, queryVerdict, runQuery } from "../querylane.ts";

/** the real server of the vault (the query route rides its own handler). */
const { createVaultServer, listenVault } = await import("../api.ts");

const server = createVaultServer();
const port = await listenVault(server, { port: 0 });
const base = `http://127.0.0.1:${port}`;
const OPERATOR = "the door battery operator word";

/** the throwaway root doorisolation pinned (the per-database files live
 * under its databases seat — the battery cleans it at the end). */
const root = join(tmpdir(), `vault-door-${process.pid}.test`);

afterAll(() => {
  server.close();
  closeQueryLanes();
  rmSync(root, { recursive: true, force: true });
});

/* the fixture person: the signup lands once at module scope (the account
 * row every later verified-credential door reads); each database below
 * registers under it. */
if (!("account" in signupAccount("querylane@example.org", "honest words"))) {
  throw new Error("the fixture person did not land");
}

/** registers one fresh app database for the fixture person. */
function freshDatabase(name: string): { id: string; key: string; keyId: string } {
  const answer = registerDatabase("querylane@example.org", "honest words", name);
  if (answer.answer === undefined) {
    throw new Error(answer.refusal?.why ?? "the registration refused");
  }
  return { id: answer.answer.database.id, key: answer.answer.key, keyId: answer.answer.keyId };
}

/** one fake request carrying only headers (the verdict lane the gate reads). */
function requestOf(headers: Record<string, string>): IncomingMessage {
  return { headers } as IncomingMessage;
}

/** one query call against the live server. */
function query(
  body: { query: string; params?: unknown[]; databaseId?: string },
  headers: Record<string, string> = {},
  method = "POST",
): Promise<Response> {
  return fetch(`${base}/api/v1/query`, {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: method === "GET" ? undefined : JSON.stringify(body),
  });
}

/** the standardized error body a refusal answers. */
async function refusalOf(response: Response): Promise<{ code: string; message: string }> {
  const body = (await response.json()) as { error: { code: string; message: string } };
  return body.error;
}

describe("the per-database routing (one database, one file, one lane)", () => {
  const first = freshDatabase("the routing app one");
  const second = freshDatabase("the routing app two");

  it("routes every registered id onto its own file under the pinned directory", () => {
    assert.equal(databasesDir(), join(root, "databases"));
    assert.equal(databaseFileOf(first.id), join(root, "databases", `${first.id}.db`));
    assert.notEqual(databaseFileOf(first.id), databaseFileOf(second.id), "two databases never share a file");
  });

  it("keeps the bytes of one database out of the other (real isolation)", () => {
    const create = runQuery({
      databaseId: first.id,
      sql: "CREATE TABLE IF NOT EXISTS lane_probe (id INTEGER PRIMARY KEY, note TEXT)",
    });
    assert.equal("refusal" in create && create.refusal.kind, false, "the table lands on the first lane");
    const insert = runQuery({
      databaseId: first.id,
      sql: "INSERT INTO lane_probe (note) VALUES (?)",
      params: ["first"],
    });
    assert.ok(!("refusal" in insert), "the row lands on the first lane");
    assert.equal(existsSync(databaseFileOf(first.id)), true, "the file of the first lane exists");

    const own = runQuery({ databaseId: first.id, sql: "SELECT note FROM lane_probe" });
    assert.ok(!("refusal" in own) && own.kind === "read", "the first lane answers its row");
    if (!("refusal" in own) && own.kind === "read") {
      assert.deepEqual(own.rows, [{ note: "first" }]);
    }
    /* the second database never sees the table: its own file answers the
     * honest sql refusal, never the first database's rows. */
    const foreign = runQuery({ databaseId: second.id, sql: "SELECT note FROM lane_probe" });
    assert.ok("refusal" in foreign && foreign.refusal.kind === "sql", "the second lane owns no such table");
  });
});

describe("the digest gate (the bearer verdict)", () => {
  const app = freshDatabase("the gate app");

  it("refuses the missing and the wrong bearers identically", () => {
    for (const headers of [{}, { authorization: "Bearer vault_not-a-key" }, { "x-vault-token": "vault_wrong" }]) {
      const verdict = queryVerdict(requestOf(headers), "");
      assert.equal(verdict.kind, "refused", "the dishonest bearer answers the refusal");
    }
  });

  it("opens the operator door for the pinned token and demands a registered database", () => {
    const verdict = queryVerdict(requestOf({ authorization: `Bearer ${OPERATOR}` }), app.id);
    assert.equal(verdict.kind, "operator", "the operator token opens the door");
    const unknown = queryVerdict(requestOf({ authorization: `Bearer ${OPERATOR}` }), "db-000000000000");
    assert.equal(unknown.kind, "absent", "an unknown database answers absent");
    const malformed = queryVerdict(requestOf({ authorization: `Bearer ${OPERATOR}` }), "../escape");
    assert.equal(malformed.kind, "absent", "a malformed routing id never rides the door");
  });

  it("routes an issued key to its own database and refuses the foreign scope", () => {
    const own = queryVerdict(requestOf({ authorization: `Bearer ${app.key}` }), "");
    assert.equal(own.kind, "key", "the issued key opens the lane");
    if (own.kind === "key") {
      assert.equal(own.databaseId, app.id, "the key's own database answers");
      assert.equal(own.keyId, app.keyId);
    }
    const other = freshDatabase("the other app");
    const scope = queryVerdict(requestOf({ authorization: `Bearer ${app.key}` }), other.id);
    assert.equal(scope.kind, "scope", "a key asked for a foreign database answers the scope refusal");
  });

  it("refuses the revoked key (the digest never answers again)", () => {
    const issued = issueApiKey(app.id, "the doomed key");
    assert.ok(issued, "the key issues");
    const before = queryVerdict(requestOf({ authorization: `Bearer ${issued.key}` }), app.id);
    assert.equal(before.kind, "key", "the fresh key opens");
    assert.equal(revokeApiKey(issued.keyId), true, "the revocation lands");
    const after = queryVerdict(requestOf({ authorization: `Bearer ${issued.key}` }), app.id);
    assert.equal(after.kind, "refused", "the revoked key answers the refusal");
  });

  it("stamps the last use of an issued key on the ride", () => {
    const lookup = queryVerdict(requestOf({ authorization: `Bearer ${app.key}` }), app.id);
    assert.equal(lookup.kind, "key");
    const again = queryVerdict(requestOf({ authorization: `Bearer ${app.key}` }), app.id);
    assert.equal(again.kind, "key", "the digest keeps answering while the key lives");
  });
});

describe("the run lane (one statement, one answer)", () => {
  const app = freshDatabase("the run app");

  it("answers the read lane with its columns and rows, the write lane with its counters", () => {
    const write = runQuery({
      databaseId: app.id,
      sql: "CREATE TABLE IF NOT EXISTS run_probe (id INTEGER PRIMARY KEY, note TEXT)",
    });
    assert.ok(!("refusal" in write), "the table lands");
    const insert = runQuery({ databaseId: app.id, sql: "INSERT INTO run_probe (note) VALUES (?)", params: ["a note"] });
    assert.ok(!("refusal" in insert) && insert.kind === "write", "the insert answers the write lane");
    if (!("refusal" in insert) && insert.kind === "write") {
      assert.equal(insert.changes, 1);
      assert.equal(insert.lastInsertRowid, "1", "the bigint pointer answers as a decimal string");
      assert.equal(typeof insert.elapsedMs, "number");
    }
    const read = runQuery({
      databaseId: app.id,
      sql: "SELECT id, note FROM run_probe WHERE note = ?",
      params: ["a note"],
    });
    assert.ok(!("refusal" in read) && read.kind === "read", "the select answers the read lane");
    if (!("refusal" in read) && read.kind === "read") {
      assert.deepEqual(read.columns, ["id", "note"]);
      assert.deepEqual(read.rows, [{ id: 1, note: "a note" }]);
    }
  });

  it("refuses the dishonest shapes honestly", () => {
    const invalidId = runQuery({ databaseId: "../escape", sql: "SELECT 1" });
    assert.ok("refusal" in invalidId && invalidId.refusal.kind === "invalid", "a malformed routing id refuses");
    const absent = runQuery({ databaseId: "db-000000000000", sql: "SELECT 1" });
    assert.ok("refusal" in absent && absent.refusal.kind === "absent", "an unregistered database refuses");
    const empty = runQuery({ databaseId: app.id, sql: "" });
    assert.ok("refusal" in empty && empty.refusal.kind === "invalid", "an empty statement refuses");
    const ceiling = runQuery({ databaseId: app.id, sql: `SELECT ${"x".repeat(70_000)}` });
    assert.ok(
      "refusal" in ceiling && ceiling.refusal.kind === "invalid",
      "a statement past the byte ceiling refuses before it prepares",
    );
    const bound = runQuery({ databaseId: app.id, sql: "SELECT 1", params: new Array(600).fill(null) });
    assert.ok("refusal" in bound && bound.refusal.kind === "invalid", "a parameter set past the bound refuses");
    const shape = runQuery({ databaseId: app.id, sql: "SELECT 1", params: [{ not: "a scalar" } as unknown as null] });
    assert.ok("refusal" in shape && shape.refusal.kind === "invalid", "a non-scalar parameter refuses");
  });

  it("answers the sql fault as the sql refusal, never a crash", () => {
    const fault = runQuery({ databaseId: app.id, sql: "SELECT * FROM no_such_table" });
    assert.ok("refusal" in fault && fault.refusal.kind === "sql", "the fault answers the sql refusal");
    if ("refusal" in fault && fault.refusal.kind === "sql") {
      assert.match(fault.refusal.why, /no such table/i);
    }
  });
});

describe("the quota gate (the write lane only)", () => {
  const app = freshDatabase("the quota app");

  it("refuses the write at the quota row before it runs — and never gates a read", () => {
    assert.equal(setDatabaseQuota(app.id, 1n)?.quotaBytes, 1n, "the owner pinned a one-byte quota");
    const write = runQuery({ databaseId: app.id, sql: "CREATE TABLE IF NOT EXISTS quota_probe (id INTEGER)" });
    assert.ok("refusal" in write && write.refusal.kind === "quota", "the write meets the quota gate");
    if ("refusal" in write && write.refusal.kind === "quota") {
      assert.equal(write.refusal.quotaBytes, 1n);
      assert.ok(write.refusal.usageBytes >= 1n, "the honest file usage answers the gate");
      assert.match(write.refusal.why, /quota/);
    }
    const read = runQuery({ databaseId: app.id, sql: "SELECT 1 AS still" });
    assert.ok(!("refusal" in read) && read.kind === "read", "the read lane never meets the gate");
    if (!("refusal" in read) && read.kind === "read") {
      assert.deepEqual(read.rows, [{ still: 1 }]);
    }
  });
});

describe("the route (POST /api/v1/query over the real server)", () => {
  const app = freshDatabase("the route app");
  const other = freshDatabase("the route other app");

  it("refuses the dishonest bearers with the honest statuses", async () => {
    const none = await query({ query: "SELECT 1" });
    assert.equal(none.status, 401);
    assert.equal((await refusalOf(none)).code, "VAULT_QUERY_AUTH");
    const wrong = await query({ query: "SELECT 1" }, { authorization: `Bearer ${API_KEY_PREFIX}wrong` });
    assert.equal(wrong.status, 401);
    assert.equal((await refusalOf(wrong)).code, "VAULT_QUERY_AUTH");
    const scope = await query({ query: "SELECT 1", databaseId: app.id }, { authorization: `Bearer ${other.key}` });
    assert.equal(scope.status, 403);
    assert.equal((await refusalOf(scope)).code, "VAULT_QUERY_SCOPE");
    const absent = await query(
      { query: "SELECT 1" },
      {
        authorization: `Bearer ${OPERATOR}`,
        "x-database-id": "db-000000000000",
      },
    );
    assert.equal(absent.status, 404);
    assert.equal((await refusalOf(absent)).code, "VAULT_DATABASE");
  });

  it("answers the full round-trip: create table, insert, select", async () => {
    const create = await query(
      { query: "CREATE TABLE IF NOT EXISTS route_probe (id INTEGER PRIMARY KEY, note TEXT)" },
      {
        authorization: `Bearer ${app.key}`,
        "x-database-id": app.id,
      },
    );
    assert.equal(create.status, 200);
    const created = (await create.json()) as { kind: string; changes: number };
    assert.equal(created.kind, "write", "the create answers the write lane");
    assert.ok(created.changes >= 0);

    const insert = await query(
      { query: "INSERT INTO route_probe (note) VALUES (?)", params: ["the route note"] },
      {
        authorization: `Bearer ${app.key}`,
        "x-database-id": app.id,
      },
    );
    assert.equal(insert.status, 200);
    const written = (await insert.json()) as { kind: string; changes: number; lastInsertRowid: string };
    assert.equal(written.kind, "write");
    assert.equal(written.changes, 1);
    assert.match(written.lastInsertRowid, /^\d+$/, "the rowid pointer answers as a decimal string");

    const select = await query(
      { query: "SELECT id, note FROM route_probe WHERE note = ?", params: ["the route note"] },
      {
        authorization: `Bearer ${app.key}`,
        "x-database-id": app.id,
      },
    );
    assert.equal(select.status, 200);
    const read = (await select.json()) as { kind: string; columns: string[]; rows: Record<string, unknown>[] };
    assert.equal(read.kind, "read", "the select answers the read lane");
    assert.deepEqual(read.columns, ["id", "note"]);
    assert.deepEqual(read.rows, [{ id: 1, note: "the route note" }]);
  });

  it("routes the body database id when the header never rides, and the method lane refuses the GET", async () => {
    const byBody = await query(
      { query: "SELECT COUNT(*) AS rows FROM route_probe", databaseId: app.id },
      {
        authorization: `Bearer ${app.key}`,
      },
    );
    assert.equal(byBody.status, 200, "the body id answers the routing");
    const counted = (await byBody.json()) as { kind: string; rows: Record<string, unknown>[] };
    assert.equal(counted.kind, "read");
    assert.deepEqual(counted.rows, [{ rows: 1 }]);
    const get = await query(
      { query: "SELECT 1" },
      { authorization: `Bearer ${app.key}`, "x-database-id": app.id },
      "GET",
    );
    assert.equal(get.status, 405);
    assert.equal((await refusalOf(get)).code, "VAULT_METHOD");
  });

  it("answers the quota refusal with the 413 the engine pins", async () => {
    assert.equal(setDatabaseQuota(other.id, 1n)?.quotaBytes, 1n);
    const over = await query(
      { query: "CREATE TABLE IF NOT EXISTS over_quota (id INTEGER)" },
      {
        authorization: `Bearer ${other.key}`,
        "x-database-id": other.id,
      },
    );
    assert.equal(over.status, 413);
    const body = (await over.json()) as { error: { code: string; quota: string; usage: string } };
    assert.equal(body.error.code, "VAULT_QUOTA");
    assert.equal(body.error.quota, "1", "the quota pointer answers as a decimal string");
    assert.ok(BigInt(body.error.usage) >= 1n, "the usage pointer answers honestly");
  });

  it("answers the sql fault with the 400 the engine pins", async () => {
    const fault = await query(
      { query: "SELECT * FROM no_such_table" },
      {
        authorization: `Bearer ${app.key}`,
        "x-database-id": app.id,
      },
    );
    assert.equal(fault.status, 400);
    assert.equal((await refusalOf(fault)).code, "VAULT_SQL");
  });
});
