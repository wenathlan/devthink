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
import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

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
};

/** the open storage lane: the one connection and the doors every family
 * app already exports — the parameterized helpers, the exec seat the
 * schema bootstrap rides, the cached prepare, the transaction wrap and
 * the close of the runtime. */
export type StorageLane = {
  /** the one sqlite connection of the lane (WAL, foreign keys, patient locks). */
  readonly db: Database.Database;
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
  const rawUrl = options.url ?? process.env[envName] ?? `file:${options.defaultFile ?? "./local.db"}`;
  return rawUrl.startsWith("file:") ? rawUrl.slice("file:".length) : rawUrl;
}

/**
 * Opens the storage lane of one app: the parent directory is created, the
 * connection opens, the pragma ladder walks (busy_timeout before WAL,
 * foreign keys armed) and the helpers bind through the statement cache.
 *
 * @param options the lane options (url, envName, defaultFile).
 * @returns the open lane (the connection, the helpers, the seats).
 */
export function openStorageLane(options: StorageLaneOptions = {}): StorageLane {
  const file = resolveStorageUrl(options);
  mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const db = new Database(file);
  for (const pragma of PRAGMA_BOOTSTRAP) {
    db.pragma(pragma);
  }
  const cache = new Map<string, Database.Statement>();
  const prepare = (sql: string): Database.Statement => {
    const cached = cache.get(sql);
    if (cached) return cached;
    const statement = db.prepare(sql);
    cache.set(sql, statement);
    return statement;
  };
  return {
    db,
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
      return db.transaction(body)();
    },
    close(): void {
      cache.clear();
      db.close();
    },
  };
}
