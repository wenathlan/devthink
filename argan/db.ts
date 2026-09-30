// # db — the self-hosted sqlite runtime of the site: better-sqlite3 bootstrap and
// parameterized query helpers only. Every statement is prepared and parameterized —
// no sql is ever assembled by string concatenation. The schema mirrors
// prisma/schema.prisma and the seed module provides the first-run rows; the site api
// serves the same tables to the Sol pages over HTTPS (see catalog.ts).
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import {
  seedConfigBlocks,
  seedDnssecAlgorithms,
  seedDnssecKeyCards,
  seedDohFirstCards,
  seedHeroBadges,
  seedLibraryCards,
  seedLocaleChoices,
  seedPublicationSteps,
  seedRecordSets,
  seedResolverChoices,
  seedRolloverSteps,
  seedTransports,
  seedZones,
} from "./seed";

const rawUrl = process.env.DATABASE_URL ?? "file:./local.db";
const file = rawUrl.startsWith("file:") ? rawUrl.slice("file:".length) : rawUrl;
mkdirSync(path.dirname(path.resolve(file)), { recursive: true });

export const db = new Database(file);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

export type SqlParam = string | number | bigint | boolean | null;

/** Runs a parameterized statement and returns the change counters. */
export function execute(sql: string, params: readonly SqlParam[] = []): { changes: number; lastInsertRowid: number | bigint } {
  const statement = db.prepare(sql);
  return statement.run(...(params as never[])) as { changes: number; lastInsertRowid: number | bigint };
}

/** Runs a parameterized query and returns every row. */
export function queryAll<T>(sql: string, params: readonly SqlParam[] = []): T[] {
  return db.prepare(sql).all(...(params as never[])) as T[];
}

/** Runs a parameterized query and returns the first row. */
export function queryOne<T>(sql: string, params: readonly SqlParam[] = []): T | undefined {
  return db.prepare(sql).get(...(params as never[])) as T | undefined;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS zones (
  origin TEXT PRIMARY KEY,
  kind   TEXT NOT NULL,
  serial TEXT NOT NULL,
  state  TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS record_sets (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  ordinal INTEGER NOT NULL,
  kind   TEXT NOT NULL,
  name   TEXT,
  type   TEXT,
  data   TEXT,
  note   TEXT,
  line   TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS dnssec_keys (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  zone_origin TEXT NOT NULL,
  role       TEXT NOT NULL,
  algorithm  INTEGER NOT NULL DEFAULT 15,
  active     INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS gateway_routes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  zone_origin TEXT NOT NULL,
  transport   TEXT NOT NULL,
  port        TEXT NOT NULL,
  spec        TEXT,
  state       TEXT NOT NULL DEFAULT 'planned',
  enabled     INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS content_rows (
  kind    TEXT NOT NULL,
  ordinal INTEGER NOT NULL,
  payload TEXT NOT NULL,
  PRIMARY KEY (kind, ordinal)
);
`;

/** Creates the tables when they do not exist (idempotent, mirrors the prisma schema). */
export function ensureSchema(): void {
  db.exec(SCHEMA);
}

/** Inserts the seed tables of the site when the content rows are still empty. */
export function seedIfEmpty(): void {
  ensureSchema();
  const count = queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM content_rows");
  if (count && count.total > 0) return;

  const insertContent = db.prepare("INSERT OR IGNORE INTO content_rows (kind, ordinal, payload) VALUES (?, ?, ?)");
  const insertZone = db.prepare("INSERT OR IGNORE INTO zones (origin, kind, serial, state) VALUES (?, ?, ?, ?)");
  const insertRecord = db.prepare(
    "INSERT INTO record_sets (ordinal, kind, name, type, data, note, line) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );

  const contentTables: readonly [string, readonly unknown[]][] = [
    ["publication-steps", seedPublicationSteps],
    ["cards.home-library", seedLibraryCards],
    ["cards.dnssec-keys", seedDnssecKeyCards],
    ["cards.doh-first", seedDohFirstCards],
    ["badges.hero", seedHeroBadges],
    ["badges.dnssec-alg", seedDnssecAlgorithms],
    ["transports", seedTransports],
    ["config-blocks", seedConfigBlocks],
    ["rollover-steps", seedRolloverSteps],
    ["choices.resolver", seedResolverChoices],
    ["choices.locale", seedLocaleChoices],
  ];
  const writeContent = db.transaction(() => {
    for (const [kind, rows] of contentTables) {
      rows.forEach((row, ordinal) => {
        insertContent.run(kind, ordinal, JSON.stringify(row));
      });
    }
    for (const zone of seedZones) {
      insertZone.run(zone.origin, zone.kind, zone.serial, zone.state);
    }
    seedRecordSets.forEach((row, ordinal) => {
      insertRecord.run(ordinal, row.kind, row.name ?? null, row.type ?? null, row.data ?? null, row.note ?? null, row.line);
    });
  });
  writeContent();
}

/** Typed accessor of the zones table (parameterized by origin). */
export function zoneRow(origin: string): { origin: string; kind: string; serial: string; state: string } | undefined {
  return queryOne("SELECT origin, kind, serial, state FROM zones WHERE origin = ?", [origin]);
}

/** Typed accessor of the record set lines (parameterized by nothing: the apex snapshot). */
export function recordSetRows(): { ordinal: number; kind: string; line: string }[] {
  return queryAll("SELECT ordinal, kind, line FROM record_sets ORDER BY ordinal");
}
