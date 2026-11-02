// # querylane — the /v2/query lane of the vault storage engine (the wave D
// rewire, the helix-style api over the better-sqlite3 core): the simple
// architecture the competitor pattern pins — an auth header, a query body,
// a json response. Bearer token plus database-id headers: the bearer is
// either the operator's pinned VAULT_TOKEN (the master door, compared
// timing-safe against the boot digest — the faun lesson law) or one of the
// issued api keys (compared as sha-256 digests against the stored key
// hashes — the security law: no plaintext key ever lands on the store),
// and the x-database-id header routes the query onto that database's own
// sqlite file (real per-database routing: one file, one lane, one ladder —
// busy_timeout before WAL, foreign keys armed, the #282 lock law).
//
// The execution is real: one statement per call rides the per-database
// lane's prepared statement (readers answer their rows, writers answer
// their change counters), the per-bucket quota gates every write (the
// coarse gate: the file's own bytes against the database's quota row —
// the 2GB-lock removal the wave answers, the quota configurable per
// bucket with the generous floor), and bigint pointers travel as decimal
// strings the way every vault lane answers.
//
// @section lanes — the per-database sqlite lanes
// @section auth — the bearer verdict (operator or issued key)
// @section run — the one-statement execution lane

import { statSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import type { IncomingMessage } from "node:http";
import { createHash, timingSafeEqual } from "node:crypto";
import { databaseIdValid, databaseOf, apiKeyLookup } from "./signup.ts";
import { openStorageLane, type SqlParam, type StorageLane } from "./storagelane.ts";

/** @section lanes */

/** The directory the per-database sqlite files live under: VAULT_DATABASES_DIR
 * when the operator pinned one, ./vault-databases beside the working
 * directory otherwise (pid-suffixed under the vitest banner — the worker
 * isolation law: a lane with no explicit directory never shares a fleet's
 * default). */
export function databasesDir(): string {
  const pinned = process.env.VAULT_DATABASES_DIR;
  if (typeof pinned === "string" && pinned.length > 0) {
    return path.resolve(pinned);
  }
  const base = "./vault-databases";
  if (typeof process.env.VITEST === "string" && typeof process.pid === "number") {
    return path.resolve(`${base}-${process.pid}`);
  }
  return path.resolve(base);
}

/**
 * The sqlite file one database answers on (the per-database routing the
 * lane rides — the validated id keeps the path inside the directory).
 *
 * @param databaseId the validated database id.
 * @returns the absolute file path of the database.
 */
export function databaseFileOf(databaseId: string): string {
  return path.join(databasesDir(), `${databaseId}.db`);
}

/** the open lanes of the process — one lane per database, one ladder each. */
const lanes = new Map<string, StorageLane>();

/**
 * Opens (or answers) the lane of one database — the #282 ladder law rides
 * the shared factory: busy_timeout 30s before WAL, foreign keys armed,
 * the statement cache warm.
 *
 * @param databaseId the validated database id.
 * @returns the open lane of the database.
 */
export function laneOf(databaseId: string): StorageLane {
  let lane = lanes.get(databaseId);
  if (lane === undefined) {
    lane = openStorageLane({ url: databaseFileOf(databaseId) });
    lanes.set(databaseId, lane);
  }
  return lane;
}

/**
 * Closes every open database lane (the test harness and graceful shutdowns
 * call it — the WAL checkpoints on close).
 */
export function closeQueryLanes(): void {
  for (const lane of lanes.values()) {
    lane.close();
  }
  lanes.clear();
}

/**
 * The honest byte usage of one database — the file, its wal and its shm,
 * the coarse measure the quota gate reads.
 *
 * @param databaseId the validated database id.
 * @returns the byte usage of the database files.
 */
export function databaseUsageOf(databaseId: string): bigint {
  const file = databaseFileOf(databaseId);
  let total = 0n;
  for (const suffix of ["", "-wal", "-shm"]) {
    try {
      total += BigInt(statSync(`${file}${suffix}`).size);
    } catch {
      /* an absent side file answers zero */
    }
  }
  return total;
}

/** @section auth */

/** the operator digest the bearer compares against (resolved once at import,
 * the same seat the api's token gate rides — fail closed when unpinned). */
const operatorDigest: Buffer | undefined = (() => {
  const token = process.env.VAULT_TOKEN;
  if (typeof token !== "string" || token.length === 0) {
    return undefined;
  }
  return createHash("sha256").update(token, "utf8").digest();
})();

/** the verdict of the /v2/query gate: the operator's master door, an issued
 * key's own database, or the honest refusal. */
export type QueryLaneVerdict =
  | { kind: "operator"; databaseId: string }
  | { kind: "key"; databaseId: string; keyId: string }
  | { kind: "refused"; why: string }
  | { kind: "scope"; why: string }
  | { kind: "absent"; why: string };

/**
 * Reads the presented bearer of one request — Authorization: Bearer first,
 * then the x-vault-token header the platform gateway rides (the same seat
 * the api's token gate reads).
 *
 * @param req the incoming request.
 * @returns the raw presented bearer, or the empty string.
 */
function presentedBearer(req: IncomingMessage): string {
  const value = req.headers.authorization;
  const authorization = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  if (authorization.toLowerCase().startsWith("bearer ")) {
    const bearer = authorization.slice("bearer ".length).trim();
    if (bearer.length > 0) {
      return bearer;
    }
  }
  const header = req.headers["x-vault-token"];
  const token = Array.isArray(header) ? (header[0] ?? "") : (header ?? "");
  return token.trim();
}

/**
 * The /v2/query gate — the helix-style auth: the bearer answers either the
 * operator's pinned token (timing-safe against the boot digest, any
 * registered database rides) or an issued api key (sha-256 digest against
 * the stored key hashes, the key's own database answers and the
 * x-database-id header must agree with it). No bearer, a wrong bearer or a
 * revoked key answers the refusal; an unknown database answers absent.
 *
 * @param req the incoming request.
 * @param headerDatabaseId the x-database-id the caller routed ("" when absent).
 * @returns the verdict the query route answers.
 */
export function queryVerdict(req: IncomingMessage, headerDatabaseId: string): QueryLaneVerdict {
  const bearer = presentedBearer(req);
  if (bearer.length === 0) {
    return { kind: "refused", why: "the query lane demands the bearer (Authorization: Bearer <api key>)" };
  }
  const digest = createHash("sha256").update(bearer, "utf8").digest();
  const isOperator =
    operatorDigest !== undefined &&
    digest.length === operatorDigest.length &&
    timingSafeEqual(digest, operatorDigest);
  if (isOperator) {
    if (!databaseIdValid(headerDatabaseId)) {
      return { kind: "absent", why: "the operator door needs the x-database-id header of a registered database" };
    }
    if (databaseOf(headerDatabaseId) === undefined) {
      return { kind: "absent", why: `the database ${headerDatabaseId} never registered — register it first` };
    }
    return { kind: "operator", databaseId: headerDatabaseId };
  }
  const lookup = apiKeyLookup(bearer);
  if ("refusal" in lookup) {
    return { kind: "refused", why: lookup.refusal.why };
  }
  if (headerDatabaseId.length > 0 && headerDatabaseId !== lookup.database.id) {
    return {
      kind: "scope",
      why: `the key answers the database ${lookup.database.id}, not ${headerDatabaseId}`,
    };
  }
  return { kind: "key", databaseId: lookup.database.id, keyId: lookup.key.id };
}

/** @section run */

/** the sql byte ceiling one query body rides (the honest bound — the body
 * refuses past it, never a silent truncation). */
export const QUERY_SQL_LIMIT = 65_536;

/** the parameter bound one query rides. */
export const QUERY_PARAM_LIMIT = 512;

/** the refusal the run lane answers: an invalid shape, an absent database,
 * a quota gate or an sql fault. */
export type QueryRefusal =
  | { kind: "invalid"; why: string }
  | { kind: "absent"; why: string }
  | { kind: "quota"; why: string; quotaBytes: bigint | null; usageBytes: bigint }
  | { kind: "sql"; why: string };

/** the run answer: a read with its rows, or a write with its counters. */
export type QueryAnswer =
  | { kind: "read"; databaseId: string; columns: string[]; rows: unknown[][]; elapsedMs: number }
  | {
      kind: "write";
      databaseId: string;
      changes: number;
      lastInsertRowid: string;
      elapsedMs: number;
    }
  | { refusal: QueryRefusal };

/** the one query the /v2/query lane runs. */
export interface QueryInput {
  /** the validated database id (the routing) */
  databaseId: string;
  /** the single sql statement */
  sql: string;
  /** the bound parameters, positional */
  params?: readonly unknown[];
}

/**
 * Runs one statement on the database's own lane — the real execution over
 * the better-sqlite3 core: readers answer their columns and rows, writers
 * answer their change counters, and every write passes the coarse quota
 * gate first (the database's own file bytes against its quota row — the
 * generous configurable floor, never a fixed cap; a database at its limit
 * refuses the write before it runs). Bigint pointers answer as decimal
 * strings and stored bytes answer as base64 — the json-safe shapes every
 * vault lane speaks.
 *
 * @param input the query input (database id, sql, params).
 * @returns the read or write answer, or the refusal.
 */
export function runQuery(input: QueryInput): QueryAnswer {
  if (!databaseIdValid(input.databaseId)) {
    return { refusal: { kind: "invalid", why: "the database id does not answer the routing shape" } };
  }
  const database = databaseOf(input.databaseId);
  if (database === undefined) {
    return { refusal: { kind: "absent", why: `the database ${input.databaseId} never registered — register it first` } };
  }
  if (input.sql.length === 0) {
    return { refusal: { kind: "invalid", why: "the query body carries no statement" } };
  }
  if (Buffer.byteLength(input.sql, "utf8") > QUERY_SQL_LIMIT) {
    return { refusal: { kind: "invalid", why: `the statement rides past the ${QUERY_SQL_LIMIT} byte ceiling` } };
  }
  const params = input.params ?? [];
  if (params.length > QUERY_PARAM_LIMIT) {
    return { refusal: { kind: "invalid", why: `the parameters ride past the ${QUERY_PARAM_LIMIT} bound` } };
  }
  for (const param of params) {
    if (typeof param !== "string" && typeof param !== "number" && typeof param !== "bigint" && typeof param !== "boolean" && param !== null) {
      return { refusal: { kind: "invalid", why: "the parameters answer strings, numbers, bigints, booleans or null" } };
    }
  }
  const lane = laneOf(input.databaseId);
  let statement;
  try {
    statement = lane.prepare(input.sql);
  } catch (error) {
    return {
      refusal: {
        kind: "sql",
        why: error instanceof Error ? error.message : "the statement does not prepare",
      },
    };
  }
  if (!statement.reader) {
    const usage = databaseUsageOf(input.databaseId);
    if (database.quotaBytes !== null && usage >= database.quotaBytes) {
      return {
        refusal: {
          kind: "quota",
          why: `the database sits at its ${database.quotaBytes} byte quota — raise it or sweep`,
          quotaBytes: database.quotaBytes,
          usageBytes: usage,
        },
      };
    }
  }
  const started = Date.now();
  try {
    if (statement.reader) {
      const rows = statement.all(...(params as never[])) as unknown[][];
      return {
        kind: "read",
        databaseId: input.databaseId,
        columns: statement.columns().map((column) => column.name),
        rows: rows.map((row) => (Array.isArray(row) ? row.map(jsonSafe) : row)),
        elapsedMs: Date.now() - started,
      };
    }
    const run = statement.run(...(params as never[])) as {
      changes: number;
      lastInsertRowid: number | bigint;
    };
    return {
      kind: "write",
      databaseId: input.databaseId,
      changes: run.changes,
      lastInsertRowid: run.lastInsertRowid.toString(),
      elapsedMs: Date.now() - started,
    };
  } catch (error) {
    return {
      refusal: {
        kind: "sql",
        why: error instanceof Error ? error.message : "the statement faulted",
      },
    };
  }
}

/** renders one cell json-safe: bigint pointers as decimal strings, stored
 * bytes as base64 — the wire shapes the vault lanes answer. */
function jsonSafe(value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (value instanceof Uint8Array) {
    return Buffer.from(value).toString("base64");
  }
  return value;
}
