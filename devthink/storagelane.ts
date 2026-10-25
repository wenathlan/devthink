/**
 * storagelane.ts — the storage lane the platform stores everything through.
 *
 * The owner's law: the platform never stores in the visitor browser — the
 * storage lives in the family infrastructure, and the vault is the storage
 * engine of the family (the concurrent of the hosted databases and the
 * object buckets). This module is the honest seam of that law: the record
 * contract is vault shaped (owner, key, content, bytes, updated), the store
 * is the node native sqlite the workbench mirror already rides, the database
 * file sits in the devthink data home outside every served root, and the
 * quota answers the plan the owner of the account set — with the generous
 * default floor of 900 megabytes and never a hardcoded two gigabyte cap.
 * When the vault service deploys with its own host, this module is the only
 * file that swaps: the routes above it never learn the difference.
 *
 * @section store — the database file and the lazy schema
 * @section keys — the owner and key validation
 * @section objects — the put, get, delete, list and usage surface
 */

import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { resolvePaths } from "./config.js";
import { sharedatabasedriver } from "./storage.js";

/** @section store */

/** The generous default floor of the quota: the owner asked for at least 900. */
export const DEFAULTQUOTAMB = 900;

type Statement = { run: (...values: unknown[]) => unknown; all: (...values: unknown[]) => unknown[] };
type Database = { prepare: (sql: string) => Statement };

/** The database path sits beside the workbench store in the data home, never under a served root. */
function storagedatabasepath(): string {
  return join(dirname(resolvePaths().database), "devthink-storage.sqlite");
}

let cacheddatabase: Database | undefined;

/** The schema statements the storage store lays down once per fresh file. */
const SCHEMASTATEMENTS = [
  "CREATE TABLE IF NOT EXISTS storageobjects (owner TEXT NOT NULL, key TEXT NOT NULL, content BLOB NOT NULL, bytes INTEGER NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (owner, key))",
  "CREATE INDEX IF NOT EXISTS storageobjects_owner ON storageobjects(owner, updated_at DESC)",
];

/** Opens the storage database once per process and lays the vault-shaped schema down. */
function storagedatabase(): Database {
  if (cacheddatabase !== undefined) return cacheddatabase;
  const DatabaseConstructor = sharedatabasedriver() as unknown as new (path: string) => Database;
  const database = new DatabaseConstructor(storagedatabasepath());
  for (const statement of SCHEMASTATEMENTS) database.prepare(statement).run();
  cacheddatabase = database;
  return cacheddatabase;
}

/** The reason a storage request was refused. */
export class StorageError extends Error {}

/** @section keys */

/** The owner shape: the same compact identifier the plan lane validates. */
const OWNERPATTERN = /^[a-z0-9][a-z0-9-]{5,63}$/i;

/** The key shape: relative, dot-free segments only, bounded length. */
const KEYPATTERN = /^[a-z0-9][a-z0-9-]{0,63}(?:\/[a-z0-9][a-z0-9-]{0,63})*$/i;

/** Validates an owner identifier, refusing anything outside the shape. */
export function ownervalid(owner: string): boolean {
  return OWNERPATTERN.test(owner);
}

/** Validates a storage key: relative, no dot segments, no leading or trailing slash. */
export function keyvalid(key: string): boolean {
  if (!KEYPATTERN.test(key)) return false;
  for (const segment of key.split("/")) {
    if (segment === "." || segment === "..") return false;
  }
  return true;
}

/** @section objects */

/** One stored object as the read surface answers it. */
export type StorageObject = { owner: string; key: string; content: string; bytes: number; updatedAt: string };

/** The usage answer of an owner: bytes, objects and the quota that bounds them. */
export type StorageUsage = { bytes: number; objects: number; quotamb: number };

/** Counts the bytes an owner already stores. */
function usedbytes(database: Database, owner: string): number {
  const row = database
    .prepare("SELECT COALESCE(SUM(bytes), 0) AS total FROM storageobjects WHERE owner = ?")
    .all(owner) as Array<{ total: number }>;
  return Number(row[0]?.total ?? 0);
}

/**
 * Stores one object for an owner. The write is bounded by the quota in
 * megabytes the caller composed from the owner plan: over the quota the
 * write refuses with the quota error and nothing is stored.
 */
export function putobject(owner: string, key: string, content: string, quotamb: number): StorageObject {
  if (!ownervalid(owner)) throw new StorageError("invalid owner");
  if (!keyvalid(key)) throw new StorageError("invalid key");
  const bytes = Buffer.byteLength(content, "utf8");
  const quotabytes = quotamb * 1024 * 1024;
  if (bytes > quotabytes) throw new StorageError("the object exceeds the whole quota");
  const database = storagedatabase();
  const remaining = quotabytes - usedbytes(database, owner);
  if (bytes > remaining) throw new StorageError("the write exceeds the remaining quota");
  const updatedAt = new Date().toISOString();
  database
    .prepare(
      "INSERT INTO storageobjects (owner, key, content, bytes, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(owner, key) DO UPDATE SET content = excluded.content, bytes = excluded.bytes, updated_at = excluded.updated_at",
    )
    .run(owner, key, content, bytes, updatedAt);
  return { owner, key, content, bytes, updatedAt };
}

/** Reads one object of an owner, answering null when the key holds nothing. */
export function getobject(owner: string, key: string): StorageObject | null {
  if (!ownervalid(owner)) throw new StorageError("invalid owner");
  if (!keyvalid(key)) throw new StorageError("invalid key");
  const database = storagedatabase();
  const rows = database
    .prepare("SELECT owner, key, content, bytes, updated_at FROM storageobjects WHERE owner = ? AND key = ?")
    .all(owner, key) as Array<{ owner: string; key: string; content: string; bytes: number; updated_at: string }>;
  const row = rows[0];
  if (!row) return null;
  return { owner: row.owner, key: row.key, content: row.content, bytes: Number(row.bytes), updatedAt: row.updated_at };
}

/** Removes one object of an owner, answering whether something was removed. */
export function deleteobject(owner: string, key: string): boolean {
  if (!ownervalid(owner)) throw new StorageError("invalid owner");
  if (!keyvalid(key)) throw new StorageError("invalid key");
  const database = storagedatabase();
  const answer = database.prepare("DELETE FROM storageobjects WHERE owner = ? AND key = ?").run(owner, key) as {
    changes?: number;
  };
  return Number(answer.changes ?? 0) > 0;
}

/** Answers the usage of an owner against the quota the caller composed. */
export function usagefor(owner: string, quotamb: number): StorageUsage {
  if (!ownervalid(owner)) throw new StorageError("invalid owner");
  const database = storagedatabase();
  const count = database
    .prepare("SELECT COUNT(*) AS total FROM storageobjects WHERE owner = ?")
    .all(owner) as Array<{ total: number }>;
  return { bytes: usedbytes(database, owner), objects: Number(count[0]?.total ?? 0), quotamb };
}

/** Lists the keys of an owner, newest first, bounded to five hundred rows. */
export function listobjects(owner: string): Array<{ key: string; bytes: number; updatedAt: string }> {
  if (!ownervalid(owner)) throw new StorageError("invalid owner");
  const database = storagedatabase();
  const rows = database
    .prepare("SELECT key, bytes, updated_at FROM storageobjects WHERE owner = ? ORDER BY updated_at DESC LIMIT 500")
    .all(owner) as Array<{ key: string; bytes: number; updated_at: string }>;
  return rows.map((row) => ({ key: row.key, bytes: Number(row.bytes), updatedAt: row.updated_at }));
}

/** Ensures the storage database exists before the first route touches it. */
export async function preparestorage(): Promise<void> {
  await mkdir(dirname(storagedatabasepath()), { recursive: true });
  storagedatabase();
}
