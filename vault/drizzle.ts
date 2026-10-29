// # drizzle — the executing schema of the vault storage engine (drizzle
// executes, prisma only declares). The tables live here as drizzle
// declarations over the node-native sqlite driver (better-sqlite3 — WAL,
// foreign keys, patient locks, the same discipline db.ts rides), and the
// boot DDL lays them down idempotently on first open: no .sql files in the
// repo, migrations stay CI-only. The family sync law holds on every table:
// identity pointers are text, counts are 32-bit ints, time is datetime, and
// byte-scale pointers (sizes, limits, chunk ids) are 64-bit bigint — the
// sqlite cells are integer (64-bit), the drizzle mapping widens them to
// real bigint values. The mysql2 driver is the env-switchable seam behind
// the same declarations — when MYSQL_URL answers, the engine refuses loudly
// until that rung lands (see storageDriverKind).
//
// @section tables — the drizzle declarations
// @section boot — the idempotent DDL and the connection
// @section seam — the mysql2 rung

import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { blob, index, integer, numeric, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { ObjectManifest } from "./chunks.ts";

/** @section tables */

/** the projects table — the owner scope every object and quota hangs from. */
export const projects = sqliteTable("projects", {
  /** the project identity (text pointer, the owner names it) */
  id: text("id").primaryKey(),
  /** the human name of the project */
  name: text("name").notNull(),
  /** the region the project serves from */
  region: text("region").notNull().default("local"),
  /** the creation datetime of the row */
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

/** the storage_objects table — the ledger: one row per stored object, soft-deleted by deleted_at. */
export const storageObjects = sqliteTable("storage_objects", {
  /** the object identity (text pointer, ledger-issued) */
  id: text("id").primaryKey(),
  /** the owning project (text pointer) */
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  /** the repository-relative absolute path the object answers at */
  path: text("path").notNull(),
  /** the content type the object serves as */
  mime: text("mime").notNull(),
  /** the whole-object byte size — a 64-bit bigint pointer */
  size: numeric("size", { mode: "bigint" }).notNull(),
  /** the real sha-256 of the whole object bytes */
  digest: text("digest").notNull(),
  /** the json manifest — the ordered chunk truth (json=manifest law) */
  manifest: text("manifest", { mode: "json" }).$type<ObjectManifest>().notNull(),
  /** the channel the object rode — blob or lfs, the storage.ts contract answer */
  channel: text("channel").notNull(),
  /** the creation datetime of the row */
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  /** the soft-delete datetime — null while the object lives */
  deletedAt: text("deleted_at"),
});

/** the chunks table — the content-addressed catalog: one row per unique 256KB window, refcounted. */
export const chunks = sqliteTable("chunks", {
  /** the chunk identity — the sqlite rowid over a 64-bit integer cell; the byte-scale pointers of the table (size, stored) are real bigint */
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** the real sha-256 of the raw window — the reuse key (unique) */
  digest: text("digest").notNull().unique(),
  /** the raw window size in bytes — a 64-bit bigint pointer */
  size: numeric("size", { mode: "bigint" }).notNull(),
  /** the stored size in bytes (packed when brotli won) — a 64-bit bigint pointer */
  stored: numeric("stored", { mode: "bigint" }).notNull(),
  /** the encoding the stored bytes ride — raw or brotli */
  encoding: text("encoding").notNull(),
  /** the refcount — how many live object positions point at this chunk (int32 count) */
  refs: integer("refs").notNull().default(0),
  /** the chunk bytes as stored — bytea=chunk, never the raw object */
  bytes: blob("bytes", { mode: "buffer" }).notNull(),
  /** the first-seen datetime of the window */
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

/** the chunk_refs table — the ordered edge between an object and its chunks. */
export const chunkRefs = sqliteTable(
  "chunk_refs",
  {
    /** the pointing object (text pointer) */
    objectId: text("object_id")
      .notNull()
      .references(() => storageObjects.id),
    /** the position of the chunk inside the object (int32 count, the reassembly order) */
    position: integer("position").notNull(),
    /** the pointed chunk — the rowid edge, a 64-bit integer cell */
    chunkId: integer("chunk_id")
      .notNull()
      .references(() => chunks.id),
  },
  (table) => [primaryKey({ columns: [table.objectId, table.position] }), index("chunk_refs_chunk").on(table.chunkId)],
);

/** the quotas table — the user-defined limit of one project: null means unlimited, no ceiling exists. */
export const quotas = sqliteTable("quotas", {
  /** the project the quota bounds (text pointer, primary key) */
  projectId: text("project_id")
    .primaryKey()
    .references(() => projects.id),
  /** the limit in bytes — a 64-bit bigint pointer, null when unlimited */
  limitBytes: numeric("limit_bytes", { mode: "bigint" }),
  /** the last edit datetime of the row */
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

/** the storage tables the boot DDL lays down (the runtime catalog of the engine). */
export const storageTables = ["projects", "storage_objects", "chunks", "chunk_refs", "quotas"] as const;

/** @section boot */

/** The schema statements the boot lays down once per fresh file — idempotent, no .sql anywhere. */
const BOOT_DDL: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS projects (
     id         TEXT PRIMARY KEY,
     name       TEXT NOT NULL,
     region     TEXT NOT NULL DEFAULT 'local',
     created_at TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE TABLE IF NOT EXISTS storage_objects (
     id         TEXT PRIMARY KEY,
     project_id TEXT NOT NULL REFERENCES projects(id),
     path       TEXT NOT NULL,
     mime       TEXT NOT NULL,
     size       INTEGER NOT NULL,
     digest     TEXT NOT NULL,
     manifest   TEXT NOT NULL,
     channel    TEXT NOT NULL,
     created_at TEXT NOT NULL DEFAULT (datetime('now')),
     deleted_at TEXT
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS storage_objects_live_path
     ON storage_objects(project_id, path) WHERE deleted_at IS NULL`,
  `CREATE INDEX IF NOT EXISTS storage_objects_project
     ON storage_objects(project_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS chunks (
     id         INTEGER PRIMARY KEY AUTOINCREMENT,
     digest     TEXT NOT NULL UNIQUE,
     size       INTEGER NOT NULL,
     stored     INTEGER NOT NULL,
     encoding   TEXT NOT NULL,
     refs       INTEGER NOT NULL DEFAULT 0,
     bytes      BLOB NOT NULL,
     created_at TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE TABLE IF NOT EXISTS chunk_refs (
     object_id  TEXT NOT NULL REFERENCES storage_objects(id),
     position   INTEGER NOT NULL,
     chunk_id   INTEGER NOT NULL REFERENCES chunks(id),
     PRIMARY KEY (object_id, position)
   )`,
  `CREATE INDEX IF NOT EXISTS chunk_refs_chunk ON chunk_refs(chunk_id)`,
  `CREATE TABLE IF NOT EXISTS quotas (
     project_id  TEXT PRIMARY KEY REFERENCES projects(id),
     limit_bytes INTEGER,
     updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
];

/** The executing storage connection: drizzle over better-sqlite3, the raw client reachable through $client. */
export type StorageDatabase = ReturnType<typeof drizzle>;

/** The executor every storage helper runs on — the connection itself or one of its transactions. */
export type StorageExecutor = StorageDatabase | Parameters<Parameters<StorageDatabase["transaction"]>[0]>[0];

/**
 * Lays the storage schema down when it does not exist — the idempotent boot
 * DDL (CREATE IF NOT EXISTS only, mirroring the drizzle declarations and the
 * prisma mirror). Drizzle executes; nothing assembles sql from input.
 *
 * @param database the executing connection.
 */
export function ensureStorageSchema(database: StorageDatabase): void {
  for (const statement of BOOT_DDL) {
    database.run(sql.raw(statement));
  }
}

/**
 * The error the driver seam answers when the mysql rung is requested before
 * it is wired — a loud, typed refusal, never a silent fallback.
 */
export class StorageDriverError extends Error {}

/**
 * Opens the storage engine over the node-native sqlite driver: the file is
 * created on first open (its directory too), the pragmas mirror db.ts
 * (WAL, foreign keys, patient locks), and the boot DDL lands idempotently.
 * The url rides VAULT_STORAGE_URL (file: prefix optional, default
 * file:./vault-storage.db) so the engine keeps its own self-hosted database
 * beside the app store of db.ts.
 *
 * @param url the database url (defaults to VAULT_STORAGE_URL, then file:./vault-storage.db).
 * @returns the executing drizzle connection.
 * @throws StorageDriverError when MYSQL_URL answers — the mysql2 rung of the same declarations is not wired yet.
 */
export function openStorage(url = process.env.VAULT_STORAGE_URL ?? "file:./vault-storage.db"): StorageDatabase {
  if (storageDriverKind() === "mysql") {
    throw new StorageDriverError(
      "MYSQL_URL answers, but the mysql2 driver rung is not wired yet — clear MYSQL_URL and ride the sqlite path today",
    );
  }
  const file = url.startsWith("file:") ? url.slice("file:".length) : url;
  mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const client = new Database(file);
  client.pragma("journal_mode = WAL");
  client.pragma("foreign_keys = ON");
  client.pragma("busy_timeout = 5000");
  const database = drizzle(client);
  ensureStorageSchema(database);
  return database;
}

/** The one storage connection of the process — opened at import from VAULT_STORAGE_URL. */
export const storage: StorageDatabase = openStorage();

/**
 * Closes the storage connection (the WAL checkpoints on close) — the test
 * harness and graceful shutdowns call it; the process exit closes it anyway.
 */
export function closeStorage(): void {
  storage.$client.close();
}

/** @section seam */

/**
 * The driver kind the storage engine rides: mysql answers when MYSQL_URL is
 * set and non-empty, sqlite otherwise. This is the env-switchable seam the
 * mysql2 rung lands behind — the same declarations, the same boot DDL law,
 * executed by the mysql driver when that rung is wired.
 *
 * @returns the driver kind the environment selected.
 */
export function storageDriverKind(): "mysql" | "sqlite" {
  const mysqlUrl = process.env.MYSQL_URL;
  return mysqlUrl !== undefined && mysqlUrl !== "" ? "mysql" : "sqlite";
}
