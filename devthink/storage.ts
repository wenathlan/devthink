/**
 * storage.ts — the ONE keyed file of the storage family (root layer).
 *
 * The owner's law: every family of correlated logic lives in one keyed file
 * with a name that says the family. This file carries the whole storage
 * family of the platform — the node sqlite mirror of the workbench records,
 * the vault-shaped storage lane, the lazy prisma persistence surface, the
 * browser IndexedDB store (the os HD with its credential vault), the drive
 * registry of the os, the workbench chat sessions, the layered workbench
 * memory and the sync snapshot surface — merged from eight root modules
 * (storage.ts, storagelane.ts, database.ts, db.ts, harddrives.ts,
 * workbenchsession.ts, workbenchmemory.ts, sync.ts) with every export
 * preserved under the same name and signature and the duplicated helpers
 * deduped to one survivor each:
 *
 *   - The sqlite driver types: storage.ts and storagelane.ts each declared
 *     a private `Statement` (byte-identical) and a `Database` (the mirror's
 *     exec/prepare/close shape, the lane's prepare-only subset of the same
 *     driver). ONE pair survives in §1; the lane (§2) rides it and touches
 *     prepare only — the driver object carries all three members at runtime.
 *   - The near-twins `compactToken()` (§4 db) and `midentity()` (§5
 *     harddrives) are DELIBERATE twins kept verbatim, not a dedupe miss:
 *     they share the 32-letter alphabet but answer the crypto-unavailable
 *     machine differently (compactToken falls back per byte through
 *     Date.now, midentity falls back for the whole token through
 *     Math.random), so converging them would change the fallback path.
 *
 * The cross-family seams this file owns (both one-directional at the call
 * level and both lazy — every cross-family reference sits inside a function
 * body, so the module graph evaluates without an import-time touch):
 *   - account.ts imports `sharedatabasedriver` (§1, the account lane's
 *     sqlite) and the browser credential-vault fns of §4 — the merged file
 *     exports both exactly as the members did.
 *   - §8 (sync) keeps importing `getIdentity` from account and
 *     `isSecureRemoteEndpoint` from gateway, as sync.ts did after
 *     wave 5 repointed it.
 *
 * @section 1  storage — the local sqlite mirror of the workbench records
 * @section 2  storagelane — the vault-shaped storage lane of the platform
 * @section 3  database — the lazy prisma persistence surface
 * @section 4  db — the browser-local IndexedDB store (the os HD)
 * @section 5  harddrives — the drive registry of the os (root logic layer)
 * @section 6  workbenchsession — the workbench chat session files (node)
 * @section 7  workbenchmemory — the layered workbench memory store (node)
 * @section 8  sync — the local snapshot export and remote sync status
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import type { PrismaClient } from "@prisma/client";
import { ensurePaths, resolvePaths, type DevThinkConfig, type DevThinkPaths } from "./config.js";
import { createCompactId } from "./ids.js";
import type { ChatMessage } from "./providers.js";
import { getIdentity } from "./account.js";
import { isSecureRemoteEndpoint } from "./gateway.js";

/* ============================================================================
 * @section 1 — storage: the local sqlite mirror of the workbench records.
 * ========================================================================== */

/** DevThink local store: mirrors credential-free workbench records into a physical SQLite database. */

/** The ONE prepared-statement type of the family sqlite driver (the §1 mirror and the §2 lane ride it). */
type Statement = { run: (...values: unknown[]) => unknown; all: (...values: unknown[]) => unknown[] };
/** The ONE sqlite database type of the family: the mirror (§1) uses exec, prepare and close; the lane (§2) touches prepare only — the driver object carries all three at runtime. */
type Database = { exec: (sql: string) => unknown; prepare: (sql: string) => Statement; close: () => void };
type DatabaseConstructor = new (path: string) => Database;

/** The sqlite driver resolves lazily and synchronously at first use: the grand merge folded this store into the shared core graph, so the module must stay loadable inside the platform-portable bundles (the browser, neutral and umd targets stub the node and bun builtins behind the seam) while the node and bun runtimes keep the real driver — the top-level await of the devthink lineage would break every cjs and umd output. */
let cacheddriver: DatabaseConstructor | undefined;

function databasedriver(): DatabaseConstructor {
  if (cacheddriver !== undefined) return cacheddriver;
  if (process.versions.bun) {
    /* The computed specifier keeps the bundler from statically resolving the bun builtin: the platform-portable bundles never inline a cjs interop wrapper for it and the node and bun runtimes resolve the real module at call time. */
    const bunrequire = require as unknown as (specifier: string) => { Database: DatabaseConstructor };
    const bunsqlite = bunrequire(["bun", "sqlite"].join(":"));
    cacheddriver = bunsqlite.Database;
  } else {
    const nodesqlite = process.getBuiltinModule?.("node:sqlite") as { DatabaseSync: DatabaseConstructor } | undefined;
    if (nodesqlite === undefined)
      throw new Error(
        "The node sqlite builtin is unavailable in this runtime; the workbench store falls back to the JSON records.",
      );
    cacheddriver = nodesqlite.DatabaseSync;
  }
  return cacheddriver;
}

export { databasedriver as sharedatabasedriver };

export type StoredWorkspace = { id: string; title: string; createdAt: string; updatedAt: string };
export type StoredTab = {
  id: string;
  sessionId: string;
  workspaceId: string;
  label: string;
  provider?: string;
  sectionId: string;
  createdAt: string;
  updatedAt: string;
};
export type StoredMessage = {
  id: string;
  sessionId: string;
  workspaceId: string;
  tabId: string;
  sectionId: string;
  role: string;
  content: string;
  createdAt: string;
};
export type StoredSession = {
  id: string;
  workspaceId: string;
  title: string;
  mode: string;
  model?: string;
  provider?: string;
  activeTabId: string;
  createdAt: string;
  updatedAt: string;
  tabs: StoredTab[];
  messages: StoredMessage[];
};
export type StoredPreference = { key: string; value: string; updatedAt: string };

function initialize(database: Database): void {
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, title TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, title TEXT NOT NULL, mode TEXT NOT NULL, model TEXT, provider TEXT, active_tab_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tabs (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, workspace_id TEXT NOT NULL, label TEXT NOT NULL, provider TEXT, section_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, workspace_id TEXT NOT NULL, tab_id TEXT NOT NULL, section_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS preferences (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS sessions_workspace_updated ON sessions(workspace_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS tabs_session_updated ON tabs(session_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS messages_session_created ON messages(session_id, created_at ASC);
  `);
}

/** Executes a local SQLite transaction without allowing database failures to erase JSON-compatible records. */
export function mirrorSession(paths: DevThinkPaths, workspace: StoredWorkspace, session: StoredSession): void {
  let database: Database | undefined;
  try {
    database = new (databasedriver())(paths.database);
    initialize(database);
    database.exec("BEGIN IMMEDIATE");
    database
      .prepare(
        "INSERT INTO workspaces (id, title, created_at, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title = excluded.title, updated_at = excluded.updated_at",
      )
      .run(workspace.id, workspace.title, workspace.createdAt, workspace.updatedAt);
    database
      .prepare(
        "INSERT INTO sessions (id, workspace_id, title, mode, model, provider, active_tab_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET workspace_id = excluded.workspace_id, title = excluded.title, mode = excluded.mode, model = excluded.model, provider = excluded.provider, active_tab_id = excluded.active_tab_id, updated_at = excluded.updated_at",
      )
      .run(
        session.id,
        session.workspaceId,
        session.title,
        session.mode,
        session.model ?? null,
        session.provider ?? null,
        session.activeTabId,
        session.createdAt,
        session.updatedAt,
      );
    database.prepare("DELETE FROM tabs WHERE session_id = ?").run(session.id);
    database.prepare("DELETE FROM messages WHERE session_id = ?").run(session.id);
    const addTab = database.prepare(
      "INSERT INTO tabs (id, session_id, workspace_id, label, provider, section_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    const addMessage = database.prepare(
      "INSERT INTO messages (id, session_id, workspace_id, tab_id, section_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    for (const tab of session.tabs)
      addTab.run(
        tab.id,
        tab.sessionId,
        tab.workspaceId,
        tab.label,
        tab.provider ?? null,
        tab.sectionId,
        tab.createdAt,
        tab.updatedAt,
      );
    for (const message of session.messages)
      addMessage.run(
        message.id,
        message.sessionId,
        message.workspaceId,
        message.tabId,
        message.sectionId,
        message.role,
        message.content,
        message.createdAt,
      );
    database.exec("COMMIT");
  } catch {
    try {
      database?.exec("ROLLBACK");
    } catch {
      /* JSON compatibility record remains the authoritative fallback. */
    }
  } finally {
    database?.close();
  }
}

/** Reads non-sensitive workbench preferences from the CLI-owned local database. */
export function readPreferences(paths: DevThinkPaths): Record<string, StoredPreference> {
  let database: Database | undefined;
  try {
    database = new (databasedriver())(paths.database);
    initialize(database);
    const rows = database
      .prepare("SELECT key, value, updated_at AS updatedAt FROM preferences ORDER BY key ASC")
      .all() as StoredPreference[];
    return Object.fromEntries(rows.map((row) => [row.key, row]));
  } catch {
    return {};
  } finally {
    database?.close();
  }
}

/** Persists an allowlisted interface preference without mixing it with provider credentials. */
export function savePreference(paths: DevThinkPaths, key: string, value: string): StoredPreference {
  const preference = { key, value, updatedAt: new Date().toISOString() };
  let database: Database | undefined;
  try {
    database = new (databasedriver())(paths.database);
    initialize(database);
    database
      .prepare(
        "INSERT INTO preferences (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
      )
      .run(preference.key, preference.value, preference.updatedAt);
  } finally {
    database?.close();
  }
  return preference;
}

/* ============================================================================
 * @section 2 — storagelane: the storage lane the platform stores everything
 * through (the browser never stores: the family vault is the engine).
 * ========================================================================== */

/**
 * storagelane — the storage lane the platform stores everything through.
 *
 * The owner's law: the platform never stores in the visitor browser — the
 * storage lives in the family infrastructure, and the vault is the storage
 * engine of the family (the concurrent of the hosted databases and the
 * object buckets). This section is the honest seam of that law: the record
 * contract is vault shaped (owner, key, content, bytes, updated), the store
 * is the node native sqlite the workbench mirror already rides, the database
 * file sits in the devthink data home outside every served root, and the
 * quota answers the plan the owner of the account set — with the generous
 * default floor of 900 megabytes and never a hardcoded two gigabyte cap.
 * When the vault service deploys with its own host, this section is the only
 * surface that swaps: the routes above it never learn the difference.
 *
 * @section store — the database file and the lazy schema
 * @section keys — the owner and key validation
 * @section objects — the put, get, delete, list and usage surface
 */

/** @section store */

/** The generous default floor of the quota: the owner asked for at least 900. */
export const DEFAULTQUOTAMB = 900;

/** The database path sits beside the workbench store in the data home, never under a served root. */
function storagedatabasepath(): string {
  return join(dirname(resolvePaths().database), "devthink-storage.sqlite");
}

let cacheddatabase: Database | undefined;

/** The schema statements the storage store lays down once per fresh file. */
const SCHEMASTATEMENTS = [
  "CREATE TABLE IF NOT EXISTS storageobjects (owner TEXT NOT NULL, key TEXT NOT NULL, content BLOB NOT NULL, bytes INTEGER NOT NULL, updatedat TEXT NOT NULL, PRIMARY KEY (owner, key))",
  "CREATE INDEX IF NOT EXISTS storageobjectsowner ON storageobjects(owner, updatedat DESC)",
];

/** Opens the storage database once per process and lays the vault-shaped schema down. The private `Statement`/`Database` twins the lane once declared are gone: it rides the ONE family driver type of §1 (the driver object carries exec, prepare and close at runtime), and the call resolves the §1 driver itself (the `sharedatabasedriver` alias names the export the account lane imports — inside the family the local name is `databasedriver`). */
function storagedatabase(): Database {
  if (cacheddatabase !== undefined) return cacheddatabase;
  const DatabaseConstructor = databasedriver() as unknown as new (path: string) => Database;
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
      "INSERT INTO storageobjects (owner, key, content, bytes, updatedat) VALUES (?, ?, ?, ?, ?) ON CONFLICT(owner, key) DO UPDATE SET content = excluded.content, bytes = excluded.bytes, updatedat = excluded.updatedat",
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
    .prepare("SELECT owner, key, content, bytes, updatedat FROM storageobjects WHERE owner = ? AND key = ?")
    .all(owner, key) as Array<{ owner: string; key: string; content: string; bytes: number; updatedat: string }>;
  const row = rows[0];
  if (!row) return null;
  return { owner: row.owner, key: row.key, content: row.content, bytes: Number(row.bytes), updatedAt: row.updatedat };
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
    .prepare("SELECT key, bytes, updatedat FROM storageobjects WHERE owner = ? ORDER BY updatedat DESC LIMIT 500")
    .all(owner) as Array<{ key: string; bytes: number; updatedat: string }>;
  return rows.map((row) => ({ key: row.key, bytes: Number(row.bytes), updatedAt: row.updatedat }));
}

/** Ensures the storage database exists before the first route touches it. */
export async function preparestorage(): Promise<void> {
  await mkdir(dirname(storagedatabasepath()), { recursive: true });
  storagedatabase();
}

/* ============================================================================
 * @section 3 — database: the lazy prisma persistence surface.
 * ========================================================================== */

/**
 * database — prisma database client and persistence logic
 * one file one responsibility — only db logic lives here
 * uses prisma 7 with libsql adapter for serverless vercel netlify compat
 * local dev uses gateway own sqlite at devthink.db
 * production uses remote url from DATABASE_URL when it is libsql or http
 * the client is LAZY: @prisma/client loads on the first database touch,
 * never at import time (a fresh consumer can import the library and run
 * the cli init before the generated client exists)
 */

const globalforprisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** resolve db url — the gateway's own variable always wins, the host's
 * DATABASE_URL only carries remote deployment urls
 *
 *   DEVTHINK_DATABASE_URL — the gateway's own override: any url flavor
 *     including file: (the documented local development flow)
 *   DATABASE_URL — the deployment convention (vercel netlify): remote
 *     libsql http https postgres urls pass through; a LOCAL file url from
 *     the host is the host's database, never the gateway's — the gateway
 *     keeps its own sqlite instead of adopting a foreign local file
 *   default — the local sqlite at devthink.db
 *
 * the old resolver dropped DEVTHINK_DATABASE_URL whenever it carried a
 * file: url (only remote prefixes passed through), so every documented
 * local override silently connected to the fallback path instead */
function resolvedburl(): { url: string; isremote: boolean } {
  const own = process.env.DEVTHINK_DATABASE_URL || "";
  const isremote = (u: string) =>
    u.startsWith("libsql:") || u.startsWith("http:") || u.startsWith("https:") || u.startsWith("postgres:");
  if (own) {
    return { url: own, isremote: isremote(own) };
  }
  const host = process.env.DATABASE_URL || "";
  if (isremote(host)) {
    return { url: host, isremote: true };
  }
  /** remote url for production vercel netlify — local file for dev */
  return { url: "file:./devthink.db", isremote: false };
}

/** ensuredb — resolves the prisma client lazily: @prisma/client loads
 * through a dynamic import on the FIRST database touch, never at module
 * import time. a fresh consumer (npx @wenathlan/devthink gateway init) can load and
 * run the whole library and cli before the generated client exists — the
 * eager singleton used to crash the import itself. */
async function ensuredb(): Promise<PrismaClient> {
  if (globalforprisma.prisma) return globalforprisma.prisma;
  const { url, isremote } = resolvedburl();
  /** PrismaLibSql takes config not a pre-created client */
  const config = isremote
    ? { url, ...(process.env.DATABASE_AUTH_TOKEN ? { authToken: process.env.DATABASE_AUTH_TOKEN } : {}) }
    : { url };
  const adapter = new PrismaLibSql(config);
  // cjs interop: a commonjs @prisma/client resolution exposes the class on
  // the default export (the module namespace may not carry the named
  // binding) — accept both spellings
  const mod = (await import("@prisma/client")) as {
    PrismaClient?: new (opts: { adapter: PrismaLibSql }) => PrismaClient;
    default?: { PrismaClient: new (opts: { adapter: PrismaLibSql }) => PrismaClient };
  };
  const prismaclient = mod.PrismaClient ?? mod.default?.PrismaClient;
  if (!prismaclient) {
    throw new Error("@prisma/client resolved without the PrismaClient class — run npx prisma generate");
  }
  const client = new prismaclient({ adapter });
  globalforprisma.prisma = client;
  return client;
}

/** makedbproxy — the lazy db surface: every property chain (model, client
 * method, $transaction) resolves through ensuredb before the call runs, so
 * importing this module never touches @prisma/client and the module graph
 * of the library stays prisma-free until persistence is actually used */
function makedbproxy(path: string[]): unknown {
  const call = async (...args: unknown[]) => {
    let cursor: unknown = await ensuredb();
    for (const segment of path) {
      cursor = (cursor as Record<string, unknown>)[segment];
    }
    return (cursor as (...callargs: unknown[]) => unknown)(...args);
  };
  return new Proxy(call, {
    get(_target, prop, receiver) {
      if (typeof prop === "symbol") return Reflect.get(_target, prop, receiver);
      if (prop === "then") return undefined;
      return makedbproxy([...path, String(prop)]);
    },
  });
}

/** db — the shared prisma client singleton, lazy (the proxy instantiates
 * the client — and loads @prisma/client — on the first database touch) */
export const db = makedbproxy([]) as PrismaClient;

/** savemsg — persist a chat message to the db never throws */
export async function savemsg(data: Record<string, unknown>): Promise<void> {
  try {
    await db.chatMessage.create({ data });
  } catch {
    // never throw on db errors
  }
}

/** getsession — retrieve or create a session by id */
export async function getsession(sessionid: string): Promise<{ sessionid: string; messagecount: number } | null> {
  try {
    const count = await db.chatMessage.count({ where: { sessionid } });
    return { sessionid, messagecount: count };
  } catch {
    return null;
  }
}

/** getmessagessince — get messages for a session for context management */
export async function getsessionmessages(sessionid: string, limit = 100): Promise<unknown[]> {
  try {
    const messages = await db.chatMessage.findMany({
      where: { sessionid, status: "completed" },
      orderBy: { createdat: "asc" },
      take: limit,
    });
    return messages;
  } catch {
    return [];
  }
}

/** the seen flags the onboarding table carries (the columns of the row). */
export type onboardingflags = { introseen: boolean; onboardingseen: boolean };

/** the stages of the entry flow one visitor walks through. */
export type onboardingstagename = "intro" | "onboarding";

/**
 * getonboardingstate — read the catalogued seen flags of one visitor.
 * Never throws: a database failure answers null (the caller serves the
 * defaults). The Prisma call is a parameterized find — never a concatenated
 * SQL string.
 *
 * @param visitor the anonymous visitor token the row keys on.
 * @returns the seen flags, or null when the visitor is unknown/unreachable.
 */
export async function getonboardingstate(visitor: string): Promise<onboardingflags | null> {
  try {
    const row = await db.onboardingState.findUnique({
      where: { visitor },
      select: { introseen: true, onboardingseen: true },
    });
    return row ? { introseen: row.introseen, onboardingseen: row.onboardingseen } : null;
  } catch {
    return null;
  }
}

/**
 * setonboardingstage — raise one stage of the entry flow for one visitor.
 * The upsert creates the row on the first write; the flags only ever move
 * upward (seeing the onboarding implies the intro handed over). Never
 * throws: a database failure answers null.
 *
 * @param visitor the anonymous visitor token the row keys on.
 * @param stage the stage the visitor just saw.
 * @returns the resulting seen flags, or null when the write failed.
 */
export async function setonboardingstage(visitor: string, stage: onboardingstagename): Promise<onboardingflags | null> {
  const onboardingseen = stage === "onboarding";
  const raise = onboardingseen ? { introseen: true, onboardingseen: true } : { introseen: true };
  try {
    const row = await db.onboardingState.upsert({
      where: { visitor },
      create: { visitor, introseen: true, onboardingseen },
      update: raise,
      select: { introseen: true, onboardingseen: true },
    });
    return { introseen: row.introseen, onboardingseen: row.onboardingseen };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* copy — the copy table the components load by id (the stubs law)     */
/* ------------------------------------------------------------------ */

/** One copy row as the api answers it. */
export type copyrow = { key: string; text: string };

/**
 * listcopyrows — every copy row of the app (the stubs load by id over
 * /api/v1/copy). Never throws: a database failure answers the empty list
 * and the build seed keeps the interface answering.
 */
export async function listcopyrows(): Promise<copyrow[]> {
  try {
    const rows = await db.copyRow.findMany({ select: { key: true, text: true } });
    return rows;
  } catch {
    return [];
  }
}

/**
 * upsertcopyrows — the ingestion: the build seed fills the table (the
 * tables first, then the ingestion), equal keys update in place.
 *
 * @param rows the seed rows to write.
 * @returns the count of rows written, or null when the write failed.
 */
export async function upsertcopyrows(rows: readonly copyrow[]): Promise<number | null> {
  try {
    let written = 0;
    for (const row of rows) {
      await db.copyRow.upsert({
        where: { key: row.key },
        create: { key: row.key, text: row.text },
        update: { text: row.text },
      });
      written += 1;
    }
    return written;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* plan — the visual gate row (the badge the identity wears)           */
/* ------------------------------------------------------------------ */

/** One plan row as the api answers it (the engines carry no limits — the
 * row only stamps the badge and the enterprise custom megabytes; the
 * 64-bit pointers ride bigint in the row, the api narrows to number). */
export type planrow = { tier: string; storagemb: bigint | null; rammib: bigint | null; since: Date };

/**
 * getplan — the plan one visitor carries.
 *
 * @param visitor the anonymous visitor token the row keys on.
 * @returns the plan row, or null when the visitor never stamped one.
 */
export async function getplan(visitor: string): Promise<planrow | null> {
  try {
    const row = await db.planState.findUnique({
      where: { visitor },
      select: { tier: true, storagemb: true, rammib: true, since: true },
    });
    return row ?? null;
  } catch {
    return null;
  }
}

/**
 * setplan — stamp the plan the visitor selected (upsert, the enterprise
 * custom megabytes riding only when defined).
 *
 * @param visitor the anonymous visitor token.
 * @param tier the selected tier (free, pro, enterprise).
 * @param custom the enterprise custom values.
 * @returns the resulting row, or null when the write failed.
 */
export async function setplan(
  visitor: string,
  tier: string,
  custom?: { storagemb?: number; rammib?: number },
): Promise<planrow | null> {
  const data = {
    tier,
    storagemb: custom?.storagemb ?? null,
    rammib: custom?.rammib ?? null,
  };
  try {
    const row = await db.planState.upsert({
      where: { visitor },
      create: { visitor, ...data },
      update: data,
      select: { tier: true, storagemb: true, rammib: true, since: true },
    });
    return row;
  } catch {
    return null;
  }
}

/* ============================================================================
 * @section 4 — db: the browser-local IndexedDB store (the os HD).
 * ========================================================================== */

/** DevThink v1.1.16: browser-local, non-secret workbench records. IndexedDB is an offline cache, never a credential vault or remote database. */

export type BrowserIdentity = { userId: string; deviceId: string; createdAt: string };
export type BrowserRoute = { workspaceId: string; sessionId: string; tabId: string; sectionId: string };

type LocalRecord = {
  id: string;
  ownerId: string;
  updatedAt: string;
  deviceId: string;
  revision: number;
  tombstone: boolean;
};
export type BrowserWorkspace = LocalRecord & { title: string; createdAt: string };
export type BrowserSession = LocalRecord & {
  workspaceId: string;
  title: string;
  mode: string;
  model?: string;
  provider?: string;
  activeTabId: string;
  createdAt: string;
};
export type BrowserTab = LocalRecord & {
  sessionId: string;
  workspaceId: string;
  label: string;
  provider?: string;
  sectionId: string;
  createdAt: string;
};
export type BrowserMessage = LocalRecord & {
  sessionId: string;
  workspaceId: string;
  tabId: string;
  sectionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};
export type BrowserPreference = LocalRecord & { key: string; value: string };
export type BrowserCredential = {
  id: string;
  ownerId: string;
  providerId: string;
  value: string;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
  localOnly: true;
};
export type BrowserSessionSnapshot = {
  identity: BrowserIdentity;
  workspace?: BrowserWorkspace;
  session?: BrowserSession;
  tabs: BrowserTab[];
  messages: BrowserMessage[];
  preferences: Record<string, string>;
};
export type BrowserStoreSummary = {
  available: boolean;
  database: string;
  ownerId?: string;
  deviceId?: string;
  workspaces: number;
  sessions: number;
  tabs: number;
  messages: number;
  preferences: number;
  mode: "local-only" | "paired-gateway" | "remote-adapter";
};

type StoreName =
  | "meta"
  | "workspaces"
  | "sessions"
  | "tabs"
  | "messages"
  | "preferences"
  | "labels"
  | "credentials";
type MetaEntry = { key: string; value: BrowserIdentity };

const databaseName = "devthink.db";
const databaseVersion = 3;
const dataStores: Array<Exclude<StoreName, "meta" | "credentials">> = [
  "workspaces",
  "sessions",
  "tabs",
  "messages",
  "preferences",
  "labels",
];
const ownerExpression = /^[a-z][a-z0-9]{9,14}$/;

function timestamp(): string {
  return new Date().toISOString();
}

function compactToken(length = 10): string {
  const alphabet = "0123456789abcdefghjkmnpqrstvwxyz";
  const bytes = new Uint8Array(length);
  globalThis.crypto?.getRandomValues?.(bytes);
  return Array.from(bytes, (value, index) => alphabet[value ? value & 31 : (Date.now() + index) & 31]).join("");
}

function request<T>(source: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    source.onsuccess = () => resolve(source.result);
    source.onerror = () => reject(source.error || new Error("DevThink browser store request failed."));
  });
}

function finished(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error("DevThink browser store transaction aborted."));
    transaction.onerror = () => reject(transaction.error || new Error("DevThink browser store transaction failed."));
  });
}

function openStore(): Promise<IDBDatabase> {
  if (!("indexedDB" in globalThis)) return Promise.reject(new Error("IndexedDB is unavailable in this browser."));
  return new Promise((resolve, reject) => {
    const open = globalThis.indexedDB.open(databaseName, databaseVersion);
    open.onupgradeneeded = () => {
      const database = open.result;
      if (!database.objectStoreNames.contains("meta")) database.createObjectStore("meta", { keyPath: "key" });
      for (const storeName of dataStores) {
        if (database.objectStoreNames.contains(storeName)) continue;
        const store = database.createObjectStore(storeName, { keyPath: "id" });
        store.createIndex("ownerId", "ownerId", { unique: false });
        if (storeName === "sessions") store.createIndex("workspaceId", "workspaceId", { unique: false });
        if (storeName === "tabs" || storeName === "messages")
          store.createIndex("sessionId", "sessionId", { unique: false });
      }
      if (!database.objectStoreNames.contains("credentials")) {
        const credentials = database.createObjectStore("credentials", { keyPath: "id" });
        credentials.createIndex("ownerId", "ownerId", { unique: false });
        credentials.createIndex("providerId", "providerId", { unique: false });
      }
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error || new Error("DevThink browser store could not open."));
  });
}

async function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const database = await openStore();
  try {
    const transaction = database.transaction(storeName, mode);
    const result = await operation(transaction.objectStore(storeName));
    await finished(transaction);
    return result;
  } finally {
    database.close();
  }
}

async function record<T>(storeName: StoreName, id: string): Promise<T | undefined> {
  return withStore(storeName, "readonly", async (store) => (await request(store.get(id))) as T | undefined);
}

async function allOwned<T extends LocalRecord>(storeName: Exclude<StoreName, "meta">, ownerId: string): Promise<T[]> {
  return withStore(storeName, "readonly", async (store) =>
    ((await request(store.index("ownerId").getAll(IDBKeyRange.only(ownerId)))) as T[]).filter(
      (item) => !item.tombstone,
    ),
  );
}

async function put<T>(storeName: StoreName, value: T): Promise<T> {
  return withStore(storeName, "readwrite", async (store) => {
    await request(store.put(value));
    return value;
  });
}

async function updateRecord<T extends LocalRecord>(
  storeName: Exclude<StoreName, "meta">,
  identity: BrowserIdentity,
  id: string,
  value: Omit<T, keyof LocalRecord> & Partial<Pick<T, "updatedAt" | "tombstone">>,
): Promise<T> {
  const current = await record<T>(storeName, id);
  const next = {
    ...current,
    ...value,
    id,
    ownerId: identity.userId,
    deviceId: identity.deviceId,
    updatedAt: value.updatedAt || timestamp(),
    revision: Math.max(0, current?.revision || 0) + 1,
    tombstone: value.tombstone || false,
  } as T;
  return put(storeName, next);
}

/** Creates one browser-local identity only when a paired CLI identity is not available. */
export async function browserIdentity(): Promise<BrowserIdentity> {
  const existing = await record<MetaEntry>("meta", "identity");
  if (existing?.value && ownerExpression.test(existing.value.userId)) return existing.value;
  const identity = { userId: `b${compactToken(11)}`, deviceId: `d_${compactToken(10)}`, createdAt: timestamp() };
  await put("meta", { key: "identity", value: identity } satisfies MetaEntry);
  return identity;
}

/** Mounts one owner partition as the active drive of this browser (the os hard-drive model: opening a drive points the meta identity at its owner, and the records of that owner come with it). */
export async function activateOwnerDrive(identity: BrowserIdentity): Promise<void> {
  if (!ownerExpression.test(identity.userId)) throw new Error("Drive owner rejected.");
  await put("meta", { key: "identity", value: identity } satisfies MetaEntry);
}

/** Caches the public identity supplied by a paired local gateway without importing any authentication material. */
export async function cacheBrowserIdentity(identity: BrowserIdentity): Promise<BrowserIdentity> {
  if (!ownerExpression.test(identity.userId)) return browserIdentity();
  const current = await browserIdentity();
  if (current.userId !== identity.userId) {
    for (const storeName of dataStores) {
      const records = await allOwned<LocalRecord>(storeName, current.userId);
      for (const item of records)
        await put(storeName, {
          ...item,
          ownerId: identity.userId,
          deviceId: current.deviceId,
          updatedAt: timestamp(),
          revision: item.revision + 1,
        });
    }
  }
  const next = { ...current, userId: identity.userId };
  await put("meta", { key: "identity", value: next } satisfies MetaEntry);
  return next;
}

export async function readBrowserPreferences(): Promise<Record<string, string>> {
  const identity = await browserIdentity();
  const preferences = await allOwned<BrowserPreference>("preferences", identity.userId);
  return Object.fromEntries(preferences.map((preference) => [preference.key, preference.value]));
}

/** the label store: every interface string of the app lives here, never
 * hardcoded inside a widget. the id is the page.widget.key path, the text
 * rides the english source of truth, and the translated flag protects the
 * runtime translation from the seed overwrite. */
export type BrowserLabel = { id: string; text: string; revision: number; updatedAt: string; translated?: boolean };

export async function saveLabel(id: string, text: string, revision: number, translated = false): Promise<BrowserLabel> {
  return put<BrowserLabel>("labels", { id, text, revision, updatedAt: timestamp(), translated });
}

export async function readLabel(id: string): Promise<BrowserLabel | undefined> {
  return withStore("labels", "readonly", async (store) => (await request(store.get(id))) as BrowserLabel | undefined);
}

export async function readAllLabels(): Promise<BrowserLabel[]> {
  return withStore("labels", "readonly", async (store) =>
    (await request(store.getAll())) as unknown as BrowserLabel[],
  );
}

/** Reads one locally stored credential value by its provider id, or null when the machine holds none. The value never leaves the browser: the caller receives the stored string itself, so account hashes stay device-local. */
export async function readBrowserCredential(providerId: string): Promise<string | null> {
  const identity = await browserIdentity();
  const credential = await record<BrowserCredential>("credentials", `${identity.userId}:${providerId}`);
  return credential?.localOnly ? credential.value : null;
}

/** Persists a non-secret interface preference or provider selection locally in this browser. */
export async function saveBrowserPreference(key: string, value: string): Promise<BrowserPreference> {
  const identity = await browserIdentity();
  return updateRecord<BrowserPreference>("preferences", identity, `${identity.userId}:${key}`, { key, value });
}

/** Stores a provider credential only after an explicit browser-local consent action. It is never included in summaries, gateway payloads or remote sync records. */
export async function saveBrowserCredential(providerId: string, value: string): Promise<void> {
  const identity = await browserIdentity();
  const now = timestamp();
  const id = `${identity.userId}:${providerId}`;
  const existing = await record<BrowserCredential>("credentials", id);
  await put("credentials", {
    id,
    ownerId: identity.userId,
    providerId,
    value,
    deviceId: identity.deviceId,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    localOnly: true,
  } satisfies BrowserCredential);
}

export async function removeBrowserCredential(providerId: string): Promise<void> {
  const identity = await browserIdentity();
  await withStore("credentials", "readwrite", async (store) => {
    await request(store.delete(`${identity.userId}:${providerId}`));
  });
}

export async function browserCredentialProviders(): Promise<string[]> {
  const identity = await browserIdentity();
  return withStore("credentials", "readonly", async (store) =>
    ((await request(store.index("ownerId").getAll(IDBKeyRange.only(identity.userId)))) as BrowserCredential[])
      .filter((credential) => credential.localOnly)
      .map((credential) => credential.providerId),
  );
}

/** Ensures a URL-addressable workspace, session and tab exist in browser-local storage. */
export async function ensureBrowserSession(
  route: BrowserRoute,
  input: { provider?: string; model?: string; title?: string; mode?: string; tabLabel?: string } = {},
): Promise<BrowserSessionSnapshot> {
  const identity = await browserIdentity();
  const now = timestamp();
  const workspace = await record<BrowserWorkspace>("workspaces", route.workspaceId);
  if (!workspace || workspace.ownerId !== identity.userId)
    await updateRecord<BrowserWorkspace>("workspaces", identity, route.workspaceId, {
      title: input.title || "Local workspace",
      createdAt: now,
    });
  const session = await record<BrowserSession>("sessions", route.sessionId);
  if (!session || session.ownerId !== identity.userId)
    await updateRecord<BrowserSession>("sessions", identity, route.sessionId, {
      workspaceId: route.workspaceId,
      title: input.title || "Local session",
      mode: input.mode || "chat",
      model: input.model,
      provider: input.provider,
      activeTabId: route.tabId,
      createdAt: now,
    });
  const tab = await record<BrowserTab>("tabs", route.tabId);
  if (!tab || tab.ownerId !== identity.userId)
    await updateRecord<BrowserTab>("tabs", identity, route.tabId, {
      sessionId: route.sessionId,
      workspaceId: route.workspaceId,
      label: input.tabLabel || "local session",
      provider: input.provider,
      sectionId: route.sectionId,
      createdAt: now,
    });
  return loadBrowserSession(route.sessionId);
}

export async function loadBrowserSession(sessionId: string): Promise<BrowserSessionSnapshot> {
  const identity = await browserIdentity();
  const session = await record<BrowserSession>("sessions", sessionId);
  const [tabs, messages, preferences] = await Promise.all([
    allOwned<BrowserTab>("tabs", identity.userId),
    allOwned<BrowserMessage>("messages", identity.userId),
    readBrowserPreferences(),
  ]);
  return {
    identity,
    workspace:
      session?.ownerId === identity.userId
        ? await record<BrowserWorkspace>("workspaces", session.workspaceId)
        : undefined,
    session: session?.ownerId === identity.userId && !session.tombstone ? session : undefined,
    tabs: tabs
      .filter((tab) => tab.sessionId === sessionId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    messages: messages
      .filter((message) => message.sessionId === sessionId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    preferences,
  };
}

export async function saveBrowserTab(
  route: BrowserRoute,
  input: { label: string; provider?: string | undefined; sectionId?: string | undefined },
): Promise<BrowserTab> {
  const identity = await browserIdentity();
  await ensureBrowserSession(route, { provider: input.provider });
  return updateRecord<BrowserTab>("tabs", identity, route.tabId, {
    sessionId: route.sessionId,
    workspaceId: route.workspaceId,
    label: input.label,
    provider: input.provider,
    sectionId: input.sectionId || route.sectionId,
    createdAt: (await record<BrowserTab>("tabs", route.tabId))?.createdAt || timestamp(),
  });
}

export async function removeBrowserTab(id: string): Promise<void> {
  const identity = await browserIdentity();
  const tab = await record<BrowserTab>("tabs", id);
  if (!tab || tab.ownerId !== identity.userId) return;
  await updateRecord<BrowserTab>("tabs", identity, id, { ...tab, tombstone: true });
}

export async function removeBrowserMessage(id: string): Promise<void> {
  const identity = await browserIdentity();
  const message = await record<BrowserMessage>("messages", id);
  if (!message || message.ownerId !== identity.userId) return;
  await updateRecord<BrowserMessage>("messages", identity, id, { ...message, tombstone: true });
}

export async function saveBrowserMessages(
  route: BrowserRoute,
  messages: Array<Pick<BrowserMessage, "id" | "role" | "content"> & Partial<Pick<BrowserMessage, "createdAt">>>,
): Promise<void> {
  const identity = await browserIdentity();
  await ensureBrowserSession(route);
  for (const message of messages)
    await updateRecord<BrowserMessage>("messages", identity, message.id, {
      sessionId: route.sessionId,
      workspaceId: route.workspaceId,
      tabId: route.tabId,
      sectionId: route.sectionId,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt || (await record<BrowserMessage>("messages", message.id))?.createdAt || timestamp(),
    });
}

/** Mirrors a safe gateway payload in the browser cache so it remains usable if the local gateway is later unavailable. */
export async function cacheGatewaySession(payload: {
  id: string;
  workspaceId: string;
  title: string;
  mode?: string;
  model?: string;
  provider?: string;
  activeTabId: string;
  createdAt?: string;
  updatedAt?: string;
  tabs: Array<{
    id: string;
    workspaceId: string;
    sessionId: string;
    label: string;
    provider?: string;
    sectionId: string;
    createdAt: string;
    updatedAt: string;
  }>;
  messages: Array<{
    id: string;
    workspaceId: string;
    sessionId: string;
    tabId: string;
    sectionId: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
  }>;
}): Promise<void> {
  const identity = await browserIdentity();
  const now = timestamp();
  await updateRecord<BrowserWorkspace>("workspaces", identity, payload.workspaceId, {
    title: payload.title || "Paired workspace",
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now,
  });
  await updateRecord<BrowserSession>("sessions", identity, payload.id, {
    workspaceId: payload.workspaceId,
    title: payload.title,
    mode: payload.mode || "chat",
    model: payload.model,
    provider: payload.provider,
    activeTabId: payload.activeTabId,
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now,
  });
  for (const tab of payload.tabs)
    await updateRecord<BrowserTab>("tabs", identity, tab.id, {
      sessionId: payload.id,
      workspaceId: payload.workspaceId,
      label: tab.label,
      provider: tab.provider,
      sectionId: tab.sectionId,
      createdAt: tab.createdAt,
      updatedAt: tab.updatedAt,
    });
  for (const message of payload.messages)
    await updateRecord<BrowserMessage>("messages", identity, message.id, {
      sessionId: payload.id,
      workspaceId: payload.workspaceId,
      tabId: message.tabId,
      sectionId: message.sectionId,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.createdAt,
    });
}

export async function browserStoreSummary(paired = false): Promise<BrowserStoreSummary> {
  if (!("indexedDB" in globalThis))
    return {
      available: false,
      database: databaseName,
      workspaces: 0,
      sessions: 0,
      tabs: 0,
      messages: 0,
      preferences: 0,
      mode: paired ? "paired-gateway" : "local-only",
    };
  const identity = await browserIdentity();
  const [workspaces, sessions, tabs, messages, preferences] = await Promise.all(
    dataStores.map((storeName) => allOwned<LocalRecord>(storeName, identity.userId)),
  );
  return {
    available: true,
    database: databaseName,
    ownerId: identity.userId,
    deviceId: identity.deviceId,
    workspaces: workspaces.length,
    sessions: sessions.length,
    tabs: tabs.length,
    messages: messages.length,
    preferences: preferences.length,
    mode: paired ? "paired-gateway" : "local-only",
  };
}

export async function browserWorkspaces(): Promise<
  Array<{ id: string; title: string; updatedAt: string; sessionCount: number }>
> {
  const identity = await browserIdentity();
  const [workspaces, sessions] = await Promise.all([
    allOwned<BrowserWorkspace>("workspaces", identity.userId),
    allOwned<BrowserSession>("sessions", identity.userId),
  ]);
  return workspaces
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .map((workspace) => ({
      id: workspace.id,
      title: workspace.title,
      updatedAt: workspace.updatedAt,
      sessionCount: sessions.filter((session) => session.workspaceId === workspace.id).length,
    }));
}

/* ============================================================================
 * @section 5 — harddrives: the drive registry of the os (root logic layer).
 * ========================================================================== */

/**
 * harddrives — the drive registry of the os (root logic layer). The os
 * treats databases as hard drives: every drive is one owner partition of
 * the local store (the browser database keys every record by its owner),
 * the active drive is the owner the meta identity points at, and opening a
 * new drive is mounting a fresh partition — the old drive keeps its records
 * on this machine and can be mounted again at any time. The registry rides
 * localStorage; the meta identity stays the single source of truth for the
 * mounted drive.
 */

/** one drive of this machine: the owner partition with its given label */
export type HardDrive = {
  /** the owner id the partition answers to (the db owner expression) */
  id: string;
  /** the name the operator gave the drive */
  label: string;
  /** the device id minted with the drive */
  deviceId: string;
  /** when the drive was created */
  createdAt: string;
};

/** the registry key of this machine's known drives */
export const DRIVES_KEY = "dt.hd.list";

function readdrives(): HardDrive[] {
  try {
    const raw = window.localStorage.getItem(DRIVES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<HardDrive>[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is HardDrive =>
        typeof item?.id === "string" &&
        typeof item?.label === "string" &&
        typeof item?.deviceId === "string" &&
        typeof item?.createdAt === "string",
    );
  } catch {
    return [];
  }
}

function savedrives(list: HardDrive[]): void {
  try {
    window.localStorage.setItem(DRIVES_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable: the registry lives for this session only */
  }
}

/** the drives of this machine plus the one currently mounted (the active
 * drive registers itself lazily, so a machine that never opened the panel
 * still answers one drive). The lazy registration answers the CALLER too:
 * the first visit returns the freshly registered drive in its list (the
 * stale-list bug — the first read answered zero drives and the panels
 * stayed empty until a reload — is dead: the saved array is the returned
 * array). */
export async function drives(): Promise<{ active: HardDrive; list: HardDrive[] }> {
  const identity = await browserIdentity();
  let list = readdrives();
  const active: HardDrive = list.find((item) => item.id === identity.userId) ?? {
    id: identity.userId,
    label: "HD 1",
    deviceId: identity.deviceId,
    createdAt: identity.createdAt,
  };
  if (!list.some((item) => item.id === active.id)) {
    list = [active, ...list];
    savedrives(list);
  }
  return { active, list };
}

function midentity(): string {
  const alphabet = "0123456789abcdefghjkmnpqrstvwxyz";
  const bytes = new Uint8Array(11);
  globalThis.crypto?.getRandomValues?.(bytes);
  const token = Array.from(bytes, (value) => alphabet[value & 31]).join("") || Math.random().toString(36).slice(2, 13);
  return `b${token}`;
}

/** mounts a brand-new drive: the current drive registers (it stays on this
 * machine), a fresh owner partition becomes the mounted one — an empty
 * database until the operator fills it */
export async function newdrive(label?: string): Promise<HardDrive> {
  const identity = await browserIdentity();
  const list = readdrives();
  if (!list.some((item) => item.id === identity.userId))
    list.unshift({
      id: identity.userId,
      label: `HD ${list.length + 1}`,
      deviceId: identity.deviceId,
      createdAt: identity.createdAt,
    });
  const drive: HardDrive = {
    id: midentity(),
    label: label?.trim() || `HD ${list.length + 1}`,
    deviceId: `d_${identity.deviceId.slice(2)}`,
    createdAt: new Date().toISOString(),
  };
  list.unshift(drive);
  savedrives(list);
  await activateOwnerDrive({ userId: drive.id, deviceId: drive.deviceId, createdAt: drive.createdAt });
  return drive;
}

/** mounts one known drive: the meta identity points back at its owner and
 * every record of that partition comes with it */
export async function opendrive(id: string): Promise<void> {
  const drive = readdrives().find((item) => item.id === id);
  if (!drive) throw new Error("Drive not found on this machine.");
  await activateOwnerDrive({ userId: drive.id, deviceId: drive.deviceId, createdAt: drive.createdAt });
}

/** renames one known drive */
export function renamerive(id: string, label: string): void {
  const list = readdrives();
  const drive = list.find((item) => item.id === id);
  if (!drive) return;
  drive.label = label.trim() || drive.label;
  savedrives(list);
}

/* ============================================================================
 * @section 6 — workbenchsession: the workbench chat session files (node).
 * ========================================================================== */

/**
 * workbenchsession — the devthink workbench chat sessions (the 1.1.16
 * surface of the grand merge; split from the extension session domain on
 * the platform boundary: the extension sessions stay browser-pure, this
 * node surface keeps the workbench chat session files).
 */

/** DevThink session model: one stable identity contract for CLI, gateway, local database, and URL-addressable web state. */
export type SessionSection =
  | "chat"
  | "inspector"
  | "settings"
  | "memory"
  | "providers"
  | "projects"
  | "routes"
  | "usage";
export type SessionTab = {
  id: string;
  sessionId: string;
  workspaceId: string;
  label: string;
  provider?: string | undefined;
  sectionId: SessionSection;
  createdAt: string;
  updatedAt: string;
};
export type SessionMessage = ChatMessage & {
  id: string;
  sessionId: string;
  workspaceId: string;
  tabId: string;
  sectionId: SessionSection;
  createdAt: string;
};
export type Workspace = { id: string; title: string; createdAt: string; updatedAt: string };

export type Session = {
  id: string;
  workspaceId: string;
  title: string;
  mode: string;
  model?: string | undefined;
  provider?: string | undefined;
  createdAt: string;
  updatedAt: string;
  activeTabId: string;
  tabs: SessionTab[];
  messages: SessionMessage[];
};

function sessionPath(paths: DevThinkPaths, id: string): string {
  return join(paths.sessions, `${id}.json`);
}

function safeTitle(messages: SessionMessage[]): string {
  const first = messages.find((message) => message.role === "user");
  return first?.content.slice(0, 80) || "Untitled session";
}

function workspacePath(paths: DevThinkPaths, id: string): string {
  return join(paths.workspaces, `${id}.json`);
}

function atomicWrite(path: string, value: unknown): void {
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(temporary, path);
}

function newWorkspace(
  id = createCompactId("w"),
  title = "Untitled workspace",
  now = new Date().toISOString(),
): Workspace {
  return { id, title, createdAt: now, updatedAt: now };
}

function newTab(
  sessionId: string,
  workspaceId: string,
  provider: string | undefined,
  label: string,
  sectionId: SessionSection,
  now: string,
  id = createCompactId("t"),
): SessionTab {
  return { id, sessionId, workspaceId, provider, label, sectionId, createdAt: now, updatedAt: now };
}

function normalizeSession(raw: Session): Session {
  const now = raw.updatedAt || new Date().toISOString();
  const workspaceId = raw.workspaceId || createCompactId("w");
  const tabs = raw.tabs?.length
    ? raw.tabs.map((tab) => ({
        ...tab,
        sessionId: raw.id,
        workspaceId,
        sectionId: tab.sectionId || ("chat" as SessionSection),
      }))
    : [newTab(raw.id, workspaceId, raw.provider, raw.title || "Untitled session", "chat", now)];
  const activeTabId = tabs.some((tab) => tab.id === raw.activeTabId) ? raw.activeTabId : tabs[0].id;
  const messages = (raw.messages || []).map((message) => ({
    ...message,
    id: message.id || createCompactId("m"),
    sessionId: raw.id,
    workspaceId,
    tabId: message.tabId || activeTabId,
    sectionId: message.sectionId || ("chat" as SessionSection),
    createdAt: message.createdAt || now,
  }));
  return { ...raw, workspaceId, activeTabId, tabs, messages };
}

function readSession(path: string): Session | undefined {
  try {
    if (!existsSync(path)) return undefined;
    return normalizeSession(JSON.parse(readFileSync(path, "utf8")) as Session);
  } catch {
    return undefined;
  }
}

function workspaceFor(session: Session): Workspace {
  const title = session.title === "Untitled session" ? "Untitled workspace" : session.title;
  return newWorkspace(session.workspaceId, title, session.createdAt);
}

function saveSession(paths: DevThinkPaths, session: Session): Session {
  ensurePaths(paths);
  const normalized = normalizeSession(session);
  const existing = loadWorkspace(paths, normalized.workspaceId);
  const workspace = {
    ...(existing || workspaceFor(normalized)),
    title: normalized.title === "Untitled session" ? existing?.title || "Untitled workspace" : normalized.title,
    updatedAt: normalized.updatedAt,
  };
  atomicWrite(sessionPath(paths, normalized.id), normalized);
  atomicWrite(workspacePath(paths, workspace.id), workspace);
  mirrorSession(paths, workspace as StoredWorkspace, normalized as StoredSession);
  return normalized;
}

export function createWorkspace(
  paths: DevThinkPaths,
  title = "Untitled workspace",
  id = createCompactId("w"),
): Workspace {
  ensurePaths(paths);
  const workspace = newWorkspace(id, title);
  atomicWrite(workspacePath(paths, id), workspace);
  return workspace;
}

export function loadWorkspace(paths: DevThinkPaths, id: string): Workspace | undefined {
  try {
    if (!existsSync(workspacePath(paths, id))) return undefined;
    return JSON.parse(readFileSync(workspacePath(paths, id), "utf8")) as Workspace;
  } catch {
    return undefined;
  }
}

export function createSession(
  paths: DevThinkPaths,
  metadata: Pick<Session, "mode" | "model" | "provider"> & {
    workspaceId?: string | undefined;
    tabId?: string | undefined;
    sectionId?: SessionSection;
    title?: string | undefined;
  },
): Session {
  const now = new Date().toISOString();
  const id = createCompactId("s");
  const workspace = metadata.workspaceId
    ? loadWorkspace(paths, metadata.workspaceId) || createWorkspace(paths, "Untitled workspace", metadata.workspaceId)
    : createWorkspace(paths);
  const tab = newTab(
    id,
    workspace.id,
    metadata.provider,
    metadata.title || "Untitled session",
    metadata.sectionId || "chat",
    now,
    metadata.tabId,
  );
  const session: Session = {
    id,
    workspaceId: workspace.id,
    title: metadata.title || "Untitled session",
    mode: metadata.mode,
    model: metadata.model,
    provider: metadata.provider,
    createdAt: now,
    updatedAt: now,
    activeTabId: tab.id,
    tabs: [tab],
    messages: [],
  };
  return saveSession(paths, session);
}

export function loadSession(paths: DevThinkPaths, id: string): Session | undefined {
  const session = readSession(sessionPath(paths, id));
  return session ? saveSession(paths, session) : undefined;
}

export function createTab(
  paths: DevThinkPaths,
  session: Session,
  input: {
    id?: string | undefined;
    label?: string | undefined;
    provider?: string | undefined;
    sectionId?: SessionSection;
  },
): Session {
  const now = new Date().toISOString();
  const tab = newTab(
    session.id,
    session.workspaceId,
    input.provider || session.provider,
    input.label || "New session",
    input.sectionId || "chat",
    now,
    input.id,
  );
  return saveSession(paths, { ...session, activeTabId: tab.id, updatedAt: now, tabs: [...session.tabs, tab] });
}

export function updateTab(
  paths: DevThinkPaths,
  session: Session,
  tabId: string,
  input: { label?: string | undefined; provider?: string | undefined; sectionId?: SessionSection | undefined },
): Session {
  const now = new Date().toISOString();
  const tabs = session.tabs.map((tab) =>
    tab.id === tabId ? ({ ...tab, ...input, updatedAt: now } as SessionTab) : tab,
  );
  if (!tabs.some((tab) => tab.id === tabId)) throw new Error(`Tab not found: ${tabId}`);
  return saveSession(paths, { ...session, activeTabId: tabId, updatedAt: now, tabs });
}

export function appendMessage(
  paths: DevThinkPaths,
  session: Session,
  message: ChatMessage,
  context?: { tabId?: string; sectionId?: SessionSection; id?: string },
): Session {
  const now = new Date().toISOString();
  const tabId = context?.tabId || session.activeTabId;
  if (!session.tabs.some((tab) => tab.id === tabId)) throw new Error(`Tab not found: ${tabId}`);
  const nextMessages = [
    ...session.messages,
    {
      ...message,
      id: context?.id || createCompactId("m"),
      sessionId: session.id,
      workspaceId: session.workspaceId,
      tabId,
      sectionId: context?.sectionId || "chat",
      createdAt: now,
    },
  ];
  return saveSession(paths, { ...session, title: safeTitle(nextMessages), updatedAt: now, messages: nextMessages });
}

export function listSessions(paths: DevThinkPaths): Session[] {
  if (!existsSync(paths.sessions)) return [];
  return readdirSync(paths.sessions)
    .filter((file) => file.endsWith(".json") && !file.endsWith(".memory.json"))
    .map((file) => readSession(join(paths.sessions, file)))
    .filter((session): session is Session => Boolean(session))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function renderSessionMarkdown(session: Session): string {
  const lines = [
    `# ${session.title}`,
    "",
    `- Workspace: ${session.workspaceId}`,
    `- Session: ${session.id}`,
    `- Active tab: ${session.activeTabId}`,
    `- Mode: ${session.mode}`,
    `- Provider: ${session.provider || "not configured"}`,
    `- Model: ${session.model || "not configured"}`,
    "",
  ];
  for (const message of session.messages) lines.push(`## ${message.role}`, "", message.content, "");
  return `${lines.join("\n")}\n`;
}

export function exportSession(paths: DevThinkPaths, id: string, format: "json" | "markdown"): string {
  const session = loadSession(paths, id);
  if (!session) throw new Error(`Session not found: ${id}`);
  return format === "json" ? `${JSON.stringify(session, null, 2)}\n` : renderSessionMarkdown(session);
}

/* ============================================================================
 * @section 7 — workbenchmemory: the layered workbench memory store (node).
 * ========================================================================== */

/**
 * workbenchmemory — the devthink workbench memory store (the 1.1.16
 * surface of the grand merge; split from the extension memory domain on the
 * platform boundary: the extension memory stays browser-pure, this node
 * surface keeps the filesystem-backed layered store of the workbench CLI).
 */

export type MemoryLayer = "session" | "project" | "global";

export type MemoryEntry = {
  id: string;
  layer: MemoryLayer;
  key: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type MemoryQuery = {
  key?: string;
  text?: string;
  sessionId?: string;
};

function memoryFile(paths: DevThinkPaths, layer: MemoryLayer, sessionId?: string): string {
  if (layer === "session") return join(paths.sessions, `${sessionId || "active"}.memory.json`);
  if (layer === "project") return join(process.cwd(), ".devthink", "project-memory.json");
  return join(paths.memory, "global-memory.json");
}

function readEntries(path: string, layer: MemoryLayer): MemoryEntry[] {
  try {
    if (!existsSync(path)) return [];
    const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
    return Array.isArray(parsed) ? (parsed as MemoryEntry[]).filter((entry) => entry.layer === layer) : [];
  } catch {
    return [];
  }
}

function writeEntries(path: string, entries: MemoryEntry[]): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function scoreEntry(entry: MemoryEntry, query: MemoryQuery): number {
  const key = normalize(query.key || "");
  const text = normalize(query.text || "");
  let score = 0;
  if (key && normalize(entry.key) === key) score += 10;
  if (text && normalize(entry.content).includes(text)) score += 5;
  if (!key && !text) score = 1;
  return score;
}

export function createMemoryStore(paths: DevThinkPaths) {
  return {
    remember(entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">): MemoryEntry {
      const now = new Date().toISOString();
      const path = memoryFile(paths, entry.layer, entry.layer === "session" ? entry.key : undefined);
      const entries = readEntries(path, entry.layer);
      const current = entries.find((item) => item.key === entry.key);
      const next: MemoryEntry = {
        id: current?.id || crypto.randomUUID(),
        ...entry,
        createdAt: current?.createdAt || now,
        updatedAt: now,
      };
      writeEntries(path, [...entries.filter((item) => item.id !== next.id), next]);
      return next;
    },
    resolve(query: MemoryQuery): MemoryEntry | undefined {
      const layers: MemoryLayer[] = ["session", "project", "global"];
      for (const layer of layers) {
        const entries = readEntries(memoryFile(paths, layer, query.sessionId), layer);
        const match = entries
          .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)[0];
        if (match) return match.entry;
      }
      return undefined;
    },
    list(layer?: MemoryLayer, sessionId?: string): MemoryEntry[] {
      const layers: MemoryLayer[] = layer ? [layer] : ["session", "project", "global"];
      return layers.flatMap((item) => readEntries(memoryFile(paths, item, sessionId), item));
    },
  };
}

export type MemoryStore = ReturnType<typeof createMemoryStore>;

export function memorySummary(store: MemoryStore): string {
  const entries = store.list();
  if (!entries.length) return "No local memory entries.";
  return entries.map((entry) => `${entry.layer}:${entry.key} — ${entry.content}`).join("\n");
}

/* ============================================================================
 * @section 8 — sync: the local snapshot export and remote sync status.
 * ========================================================================== */

export type SyncSnapshot = {
  version: 1;
  userId: string;
  deviceId: string;
  exportedAt: string;
  workspaces: Workspace[];
  sessions: Session[];
};
export type RemoteSyncStatus = { enabled: boolean; endpoint?: string; ready: boolean; reason?: string };

export function exportLocalSnapshot(paths: DevThinkPaths): SyncSnapshot {
  const identity = getIdentity(paths);
  const sessions = listSessions(paths);
  const workspaces = [...new Set(sessions.map((session) => session.workspaceId))].flatMap((workspaceId) => {
    const workspace = loadWorkspace(paths, workspaceId);
    return workspace ? [workspace] : [];
  });
  return {
    version: 1,
    userId: identity.userId,
    deviceId: identity.deviceId,
    exportedAt: new Date().toISOString(),
    workspaces,
    sessions,
  };
}

export function remoteSyncStatus(config: DevThinkConfig): RemoteSyncStatus {
  const remote = config.web?.remoteSync;
  if (!remote?.enabled)
    return {
      enabled: false,
      ready: false,
      reason: "Remote synchronization is disabled; local pairing remains available.",
    };
  if (!remote.endpoint)
    return {
      enabled: true,
      ready: false,
      reason: "Set web.remoteSync.endpoint to a user-operated HTTPS API that implements the DevThink sync contract.",
    };
  if (!isSecureRemoteEndpoint(remote.endpoint)) {
    return {
      enabled: true,
      endpoint: remote.endpoint,
      ready: false,
      reason: "Remote synchronization endpoint is not a valid HTTPS URL.",
    };
  }
  return { enabled: true, endpoint: new URL(remote.endpoint).toString(), ready: true };
}
