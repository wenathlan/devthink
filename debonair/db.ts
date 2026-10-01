// # db — the self-hosted sqlite runtime of the site: better-sqlite3 bootstrap and
// parameterized query helpers only. Every statement is prepared and parameterized —
// no sql is ever assembled by string concatenation. The schema mirrors
// prisma/schema.prisma and the seed module provides the first-run rows; the site api
// serves the same tables to the Sol pages over HTTPS (see catalog.ts).
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import {
  seedGenres,
  seedHeroBadges,
  seedLibraryTracks,
  seedLocaleChoices,
  seedMixerStrips,
  seedReadouts,
  seedStageCards,
  seedTimelineTracks,
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
CREATE TABLE IF NOT EXISTS tracks (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL,
  genre     TEXT NOT NULL,
  seconds   INTEGER NOT NULL DEFAULT 0,
  status    TEXT NOT NULL DEFAULT 'draft',
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS render_jobs (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  trackId   INTEGER,
  projectId INTEGER,
  prompt    TEXT NOT NULL DEFAULT '',
  genre     TEXT NOT NULL DEFAULT '',
  seed      INTEGER NOT NULL DEFAULT 0,
  duration  TEXT NOT NULL DEFAULT '',
  status    TEXT NOT NULL DEFAULT 'queued',
  seconds   INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS timeline_tracks (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  name   TEXT NOT NULL,
  sound  TEXT NOT NULL,
  color  TEXT NOT NULL DEFAULT 'c1',
  ordinal INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS clips (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  trackId      INTEGER NOT NULL,
  label        TEXT NOT NULL,
  leftPercent  REAL NOT NULL,
  widthPercent REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS mixer_strips (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  meterPercent INTEGER NOT NULL DEFAULT 0,
  faderDb      REAL NOT NULL DEFAULT 0,
  master       INTEGER NOT NULL DEFAULT 0
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
  const insertTrack = db.prepare("INSERT INTO timeline_tracks (name, sound, color, ordinal) VALUES (?, ?, ?, ?)");
  const insertClip = db.prepare("INSERT INTO clips (trackId, label, leftPercent, widthPercent) VALUES (?, ?, ?, ?)");
  const insertStrip = db.prepare("INSERT INTO mixer_strips (name, meterPercent, faderDb, master) VALUES (?, ?, ?, ?)");

  const contentTables: readonly [string, readonly unknown[]][] = [
    ["genres", seedGenres],
    ["readouts", seedReadouts],
    ["library-tracks", seedLibraryTracks],
    ["cards.home-stages", seedStageCards],
    ["badges.hero", seedHeroBadges],
    ["choices.locale", seedLocaleChoices],
  ];
  const writeContent = db.transaction(() => {
    for (const [kind, rows] of contentTables) {
      rows.forEach((row, ordinal) => {
        insertContent.run(kind, ordinal, JSON.stringify(row));
      });
    }
    for (const [index, track] of seedTimelineTracks.entries()) {
      const result = insertTrack.run(track.name, track.sound, track.colorClass, index);
      for (const clip of track.clips) {
        insertClip.run(result.lastInsertRowid, clip.label, clip.leftPercent, clip.widthPercent);
      }
    }
    for (const strip of seedMixerStrips) {
      insertStrip.run(strip.name, strip.meterPercent, strip.faderDb, strip.master ? 1 : 0);
    }
  });
  writeContent();
}

/** Typed accessor of the render queue (parameterized by the family-canonical status pointer). */
export function renderJobRows(status: string): { id: number; genre: string; seed: number; duration: string; status: string }[] {
  return queryAll("SELECT id, genre, seed, duration, status FROM render_jobs WHERE status = ? ORDER BY id", [status]);
}
