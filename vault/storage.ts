/**
 * storage — consolidated storage engine logics of the vault family.
 * @module storage
 * @family wave/logicfold2
 * @layer blob — the base of the storage stack: bucket → object → chunk → blob;
 *  the storage lane (better-sqlite3 first) is the mechanism every layer rides.
 * One keyed file per family: the former variant arms (storagelane)
 * retired into this seat with every export preserved under the same name.
 */

import Database from "better-sqlite3";
import { chmodSync, mkdirSync } from "node:fs";
import path from "node:path";

/* the render-leaf law (the debonair precedent): the pure contract face
 * answers in its own leaf (storageface.ts — the record types, the pointer
 * document, the digest discipline, the channel verdict, zero database
 * imports) so the browser graph of the family pages reaches the contract
 * without the native binding; this seat re-exports the leaf whole so every
 * published export keeps answering under the same name. */
export * from "./storageface.ts";

/* ===== block: storagelane ===== */
/**
 * storagelane.ts — the shared sqlite mechanism of the family: the
 * better-sqlite3 bootstrap, the parameterized helpers and the statement
 * cache every family app rides. the vault owns the storage lane (the
 * storage law of the family): each app keeps its schema, its tables and
 * its seeds — app data, never duplicated logic — and opens this lane with
 * its own file; the pragma ladder always walks the same order
 * (busy_timeout before WAL — the SQLITE_BUSY flake law), foreign keys
 * always arm, and every statement is prepared and bound — no sql is ever
 * assembled by string concatenation.
 *
 * the module is a factory with zero import-time side effects: the db file
 * resolves once per lane at open (the tests inject :memory: or a temp file
 * by setting the environment before the call, never by importing first),
 * the parent directory is created inside open, and the connection stays
 * reachable for the close the runtime wants. the node-only doctrine rides
 * the import: better-sqlite3 is a native binding, the browser graph never
 * reaches this file (the browser accessors stay in their own modules).
 */




/** the parameter types the helpers bind (sqlite stores them narrow). */
export type SqlParam = string | number | bigint | boolean | null;

/** the pragma ladder every lane walks, in order — busy_timeout BEFORE WAL
 * (the pragma itself waits when the file is contended, the boot never
 * races) and foreign keys always armed (the family schemas declare them).
 * the timeout rides at thirty seconds: a vitest isolate fleet (sixty
 * workers importing the same runtime module in the same breath) can
 * stampede the WAL handshake for longer than five seconds ever covered —
 * the lock the debonair family suite answered on the #281 merge ref
 * taught the ladder the wider window. */
export const PRAGMA_BOOTSTRAP = ["busy_timeout = 30000", "journal_mode = WAL", "foreign_keys = ON"] as const;

/** the driver names the lane knows: the family seat (better-sqlite3), the
 * node builtin the engines without dependencies ride (node:sqlite) and the
 * bun runtime the os workbench resolves (bun:sqlite). */
export type StorageDriverName = "better-sqlite3" | "node:sqlite" | "bun:sqlite";

/** the structural statement every driver answers (run, all, get — the
 * parameterized seats the helpers ride, whichever driver carries them). */
type SqliteStatement = {
  run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  all(...params: unknown[]): unknown[];
  get(...params: unknown[]): unknown;
};

/** the structural database every driver answers (prepare, exec, close —
 * the pragma ladder walks through the exec seat on the builtin faces). */
type SqliteDatabase = {
  prepare(sql: string): SqliteStatement;
  exec(sql: string): unknown;
  close(): unknown;
  pragma?(value: string): unknown;
};

/** the structural constructor the driver seat answers. */
type SqliteDatabaseConstructor = new (file: string) => SqliteDatabase;

/** the lane options: the url wins over the environment, the environment
 * name defaults to the family DATABASE_URL, and the default file answers
 * when neither is set (each app names its own — app data, never logic). */
export type StorageLaneOptions = {
  /** an explicit database url (a file: path or a bare path); wins over the environment. */
  url?: string;
  /** the environment variable the lane reads (default "DATABASE_URL"). */
  envName?: string;
  /** the file the lane opens when nothing else answers (default "./local.db"). */
  defaultFile?: string;
  /** the driver the lane opens (default "better-sqlite3", the family seat;
   * "node:sqlite" answers the engines that run on the node builtin alone,
   * "bun:sqlite" the bun runtime the os workbench rides). */
  driver?: StorageDriverName;
  /** an injectable constructor seat (tests and the os workbench driver
   * resolution carry their own — the seat wins over every named driver). */
  driverSeat?: () => SqliteDatabaseConstructor;
  /** the file mode the lane stamps on the database file after the open
   * (the security seats that demand 0o600 pass it here; best effort,
   * never applies to a :memory: lane). */
  fileMode?: number;
};

/** the open storage lane: the one connection and the doors every family
 * app already exports — the parameterized helpers, the exec seat the
 * schema bootstrap rides, the cached prepare, the transaction wrap and
 * the close of the runtime. */
export type StorageLane = {
  /** the one sqlite connection of the lane (WAL, foreign keys, patient locks). */
  readonly db: Database.Database;
  /** the driver name the lane opened (the reporting seats read it). */
  readonly driver: string;
  /** runs a parameterized statement and returns the change counters. */
  execute(sql: string, params?: readonly SqlParam[]): { changes: number; lastInsertRowid: number | bigint };
  /** runs a parameterized query and returns every row. */
  queryAll<T>(sql: string, params?: readonly SqlParam[]): T[];
  /** runs a parameterized query and returns the first row. */
  queryOne<T>(sql: string, params?: readonly SqlParam[]): T | undefined;
  /** runs raw sql (the schema DDL seat — idempotent CREATE TABLE blocks). */
  exec(ddl: string): void;
  /** prepares one statement through the lane cache (same sql, same object). */
  prepare(sql: string): Database.Statement;
  /** wraps a body in one transaction (the seed seats ride this). */
  transaction<T>(body: () => T): T;
  /** closes the connection (the runtime shutdown seat). */
  close(): void;
};

/**
 * Resolves the database url of one lane: the explicit url wins, the
 * environment answers next, the default file answers last. the file:
 * prefix strips the way the family always read it.
 *
 * @param options the lane options (url, envName, defaultFile).
 * @returns the bare filesystem path the connection opens.
 */
function resolveStorageUrl(options: StorageLaneOptions = {}): string {
  const envName = options.envName ?? "DATABASE_URL";
  const fromEnv = process.env[envName];
  const rawUrl = options.url ?? fromEnv ?? `file:${options.defaultFile ?? "./local.db"}`;
  const resolved = rawUrl.startsWith("file:") ? rawUrl.slice("file:".length) : rawUrl;
  /* the worker isolation seat: a vitest isolate fleet imports the same
   * runtime module in the same breath (sixty workers, one shared default
   * file, one working directory) and the WAL handshake answers the
   * stampede with a locked database no busy window ever covers — the
   * deadlock is structural (every process holds a read while the journal
   * flip wants the exclusive write), never a matter of patience. under
   * the vitest banner (and only there — the env the runner sets on every
   * worker), a lane that answered no explicit url and no environment
   * seed opens its own file per worker instead: the default name carries
   * the pid, the fleet stops sharing, and the lock dies at the root. */
  if (resolved === (options.defaultFile ?? "./local.db") && !options.url && !fromEnv &&
      typeof process !== "undefined" && typeof (process as { env?: Record<string, string | undefined> }).env?.VITEST === "string" && process.pid) {
    const marker = resolved.lastIndexOf(".");
    const stem = marker > 0 ? resolved.slice(0, marker) : resolved;
    const ext = marker > 0 ? resolved.slice(marker) : "";
    return `${stem}-${process.pid}${ext}`;
  }
  return resolved;
}

/** the busy codes the stampede answers — the retry law covers them all
 * (the plain lock, the snapshot deadlock and the recovery branch). */
const BUSYCODES: ReadonlySet<string> = new Set(["SQLITE_BUSY", "SQLITE_BUSY_SNAPSHOT", "SQLITE_BUSY_RECOVERY"]);

/** the bounded attempts the open walks before the honest throw (eight
 * jittered waves drain a sixty-worker fleet — the stampede empties in
 * the first three on every lane the suite pinned). */
const OPENATTEMPTS = 8;

/** sleeps the current thread synchronously (the lane opens on the module
 * load of the node side — no event loop to await on). */
const sleepsync = (ms: number): void => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
};

/**
 * Opens one connection and walks the pragma ladder under the stampede
 * law: a busy answer closes the connection, waits one jittered backoff
 * wave and opens again — the deadlock branches that never invoke the
 * busy handler drain across the waves instead of failing the boot.
 *
 * @param file the database file the lane owns.
 * @returns the open connection with the ladder walked.
 */
/** resolves the constructor of the named driver: the seat wins (tests and
 * the os workbench inject their own resolution), the family seat answers
 * the static import, the node builtin resolves through the builtin module
 * loader (no static import — the graph the browser bundles carry stays
 * clean) and bun answers the computed require the runtime alone reads. */
const driverConstructor = (options: StorageLaneOptions): { name: string; open: SqliteDatabaseConstructor } => {
  if (options.driverSeat) return { name: "seat", open: options.driverSeat() };
  const driver = options.driver ?? "better-sqlite3";
  if (driver === "better-sqlite3") return { name: driver, open: Database as unknown as SqliteDatabaseConstructor };
  if (driver === "node:sqlite") {
    const builtin = (process as unknown as { getBuiltinModule?: (id: string) => unknown }).getBuiltinModule?.("node:sqlite") as
      | { DatabaseSync?: SqliteDatabaseConstructor }
      | undefined;
    if (!builtin?.DatabaseSync) throw new Error("the node:sqlite driver is absent on this runtime");
    return { name: driver, open: builtin.DatabaseSync };
  }
  /* bun:sqlite — the computed specifier the bundlers never follow. */
  const requirefn = (globalThis as { require?: unknown }).require as ((id: string) => unknown) | undefined;
  const bunsqlite = requirefn?.(["bun", "sqlite"].join(":")) as { Database?: SqliteDatabaseConstructor } | undefined;
  if (!bunsqlite?.Database) throw new Error("the bun:sqlite driver is absent on this runtime");
  return { name: driver, open: bunsqlite.Database };
};

/** walks the pragma ladder once on the open connection: the better-sqlite3
 * face carries the pragma method, the builtin faces answer through exec. */
const walkPragmas = (db: SqliteDatabase): void => {
  for (const pragma of PRAGMA_BOOTSTRAP) {
    if (typeof db.pragma === "function") db.pragma(pragma);
    else db.exec(`PRAGMA ${pragma};`);
  }
};

const openWithLadder = (file: string, options: StorageLaneOptions): { db: SqliteDatabase; name: string } => {
  const seat = driverConstructor(options);
  let lastError: unknown = null;
  for (let attempt = 0; attempt < OPENATTEMPTS; attempt += 1) {
    const db = new seat.open(file);
    try {
      walkPragmas(db);
      if (options.fileMode !== undefined && !file.includes(":memory:")) {
        try {
          chmodSync(file, options.fileMode);
        } catch {
          /* the file mode is best effort — a read-only seat or an absent
           * file never fails the boot the pragmas already greened. */
        }
      }
      return { db, name: seat.name };
    } catch (error) {
      db.close();
      const code = (error as { code?: string }).code ?? "";
      if (!BUSYCODES.has(code)) throw error;
      lastError = error;
      sleepsync(25 * (attempt + 1) + Math.floor(Math.random() * 40));
    }
  }
  throw lastError ?? new Error("the storage lane open exhausted its attempts");
};

/**
 * Opens the storage lane of one app: the parent directory is created, the
 * connection opens, the pragma ladder walks (busy_timeout before WAL,
 * foreign keys armed) and the helpers bind through the statement cache.
 * the open walks the stampede law: a vitest isolate fleet imports the
 * same runtime module in the same breath and the wal handshake of the
 * fleet can answer SQLITE_BUSY past the busy timeout (the immediate
 * deadlock branches never invoke the busy handler) — a bounded retry
 * with jittered backoff drains the stampede and the ladder lands.
 *
 * @param options the lane options (url, envName, defaultFile).
 * @returns the open lane (the connection, the helpers, the seats).
 */
export function openStorageLane(options: StorageLaneOptions = {}): StorageLane {
  const file = resolveStorageUrl(options);
  mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const opened = openWithLadder(file, options);
  const db = opened.db;
  /* the transaction seat: the better-sqlite3 face carries the transaction
   * wrapper; the builtin faces answer the explicit begin/commit ladder the
   * same bodies always demanded. */
  const transactionOf = (body: () => unknown): unknown => {
    const holder = db as unknown as { transaction?: (this: unknown, body: () => unknown) => () => unknown };
    if (typeof holder.transaction === "function") return holder.transaction(body)();
    db.exec("BEGIN IMMEDIATE");
    try {
      const answer = body();
      db.exec("COMMIT");
      return answer;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  };
  const cache = new Map<string, SqliteStatement>();
  const prepare = (sql: string): Database.Statement => {
    const cached = cache.get(sql);
    if (cached) return cached as Database.Statement;
    const statement = db.prepare(sql);
    cache.set(sql, statement);
    return statement as Database.Statement;
  };
  return {
    db: db as unknown as Database.Database,
    driver: opened.name,
    execute(sql: string, params: readonly SqlParam[] = []): { changes: number; lastInsertRowid: number | bigint } {
      return prepare(sql).run(...(params as never[])) as { changes: number; lastInsertRowid: number | bigint };
    },
    queryAll<T>(sql: string, params: readonly SqlParam[] = []): T[] {
      return prepare(sql).all(...(params as never[])) as T[];
    },
    queryOne<T>(sql: string, params: readonly SqlParam[] = []): T | undefined {
      return prepare(sql).get(...(params as never[])) as T | undefined;
    },
    exec(ddl: string): void {
      db.exec(ddl);
    },
    prepare,
    transaction<T>(body: () => T): T {
      return transactionOf(body) as T;
    },
    close(): void {
      cache.clear();
      db.close();
    },
  };
}
