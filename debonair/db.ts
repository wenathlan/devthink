// # db — the self-hosted sqlite runtime of the site: better-sqlite3 bootstrap and
// parameterized query helpers only. Every statement is prepared and parameterized —
// no sql is ever assembled by string concatenation. The schema mirrors
// prisma/schema.prisma and the seed module provides the first-run rows; the site api
// serves the same tables to the Sol pages over HTTPS (see catalog.ts).

import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { LABEL_MANIFEST, LABEL_REVISION } from "./labels.ts";
import {
  seedGenres,
  seedHeroBadges,
  seedLibraryTracks,
  seedLocaleChoices,
  seedMixerStrips,
  seedReadouts,
  seedStageCards,
  seedTimelineTracks,
} from "./seed.ts";

const rawUrl = process.env.DATABASE_URL ?? "file:./local.db";
const file = rawUrl.startsWith("file:") ? rawUrl.slice("file:".length) : rawUrl;
mkdirSync(path.dirname(path.resolve(file)), { recursive: true });

export const db = new Database(file);
db.pragma("busy_timeout = 5000");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export type SqlParam = string | number | bigint | boolean | null;

/** Runs a parameterized statement and returns the change counters. */
export function execute(
  sql: string,
  params: readonly SqlParam[] = [],
): { changes: number; lastInsertRowid: number | bigint } {
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
CREATE TABLE IF NOT EXISTS onboarding_states (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor        TEXT NOT NULL UNIQUE,
  introseen      INTEGER NOT NULL DEFAULT 0,
  onboardingseen INTEGER NOT NULL DEFAULT 0,
  updatedAt      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS labels (
  id         TEXT PRIMARY KEY,
  text       TEXT NOT NULL,
  revision   INTEGER NOT NULL DEFAULT 0,
  updatedAt  TEXT NOT NULL DEFAULT (datetime('now')),
  translated INTEGER NOT NULL DEFAULT 0
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
export function renderJobRows(
  status: string,
): { id: number; genre: string; seed: number; duration: string; status: string }[] {
  return queryAll("SELECT id, genre, seed, duration, status FROM render_jobs WHERE status = ? ORDER BY id", [status]);
}

/** one row of the onboarding_states table (the entry-flow gates of a visitor). */
export type OnboardingStateRow = {
  id: number;
  visitor: string;
  introseen: number;
  onboardingseen: number;
  updatedAt: string;
};

/** the stage flags the entry flow consults, as booleans. */
export type OnboardingFlags = { introseen: boolean; onboardingseen: boolean };

/** one labels row: the interface copy store. the id is the page.widget.key
 * path, the text rides the english source of truth (labels.ts), and the
 * translated flag protects a runtime translation from the seed overwrite.
 * the shape mirrors the browser seed rows in labels.ts one to one. */
export type LabelRow = {
  id: string;
  text: string;
  revision: number;
  updatedAt: string;
  translated?: boolean;
};

/**
 * Reads the onboarding stage flags of one visitor (parameterized; undefined
 * before the first write). The browser accessor serves the same flags over
 * GET /api/v1/onboarding (onboardingstate.ts).
 *
 * @param visitor the visitor key of the row.
 * @returns the flags, or undefined when the visitor never wrote.
 */
export function getOnboardingState(visitor: string): OnboardingFlags | undefined {
  const row = queryOne<Pick<OnboardingStateRow, "introseen" | "onboardingseen">>(
    "SELECT introseen, onboardingseen FROM onboarding_states WHERE visitor = ?",
    [visitor],
  );
  if (!row) return undefined;
  return { introseen: row.introseen === 1, onboardingseen: row.onboardingseen === 1 };
}

/**
 * Marks one onboarding stage seen for a visitor — idempotent seen-wins
 * upsert (a stage seen anywhere stays seen), prepared and parameterized,
 * never concatenated SQL.
 *
 * @param visitor the visitor key of the row.
 * @param stage the stage the visitor just saw (or deliberately skipped).
 * @returns the flags after the write.
 */
export function setOnboardingStage(visitor: string, stage: "intro" | "onboarding"): OnboardingFlags {
  execute(
    `INSERT INTO onboarding_states (visitor, introseen, onboardingseen, updatedAt)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(visitor) DO UPDATE SET
       introseen = MAX(introseen, excluded.introseen),
       onboardingseen = MAX(onboardingseen, excluded.onboardingseen),
       updatedAt = datetime('now')`,
    [visitor, stage === "intro" ? 1 : 0, stage === "onboarding" ? 1 : 0],
  );
  return getOnboardingState(visitor) ?? { introseen: false, onboardingseen: false };
}

/* --------------------------------------------------------------------- */
/* labels — the interface copy store                                      */
/* --------------------------------------------------------------------- */

/** the raw labels projection sqlite answers (translated rides the 0/1 cell). */
type LabelRowSql = {
  id: string;
  text: string;
  revision: number;
  updatedAt: string;
  translated: number;
};

/** Projects one raw labels row into the stored label projection. */
function labelRowOf(row: LabelRowSql): LabelRow {
  return {
    id: row.id,
    text: row.text,
    revision: row.revision,
    updatedAt: row.updatedAt,
    ...(row.translated === 1 ? { translated: true } : {}),
  };
}

/**
 * Writes one label row (idempotent upsert; the caller owns the revision),
 * prepared and parameterized, never concatenated SQL.
 *
 * @param id the page.widget.key path of the label.
 * @param text the surface text.
 * @param revision the manifest revision the text carries.
 * @param translated true when the row carries a runtime translation.
 * @returns the stored label projection.
 */
export function saveLabel(id: string, text: string, revision: number, translated = false): LabelRow {
  execute(
    `INSERT INTO labels (id, text, revision, updatedAt, translated) VALUES (?, ?, ?, datetime('now'), ?)
     ON CONFLICT(id) DO UPDATE SET
       text = excluded.text,
       revision = excluded.revision,
       updatedAt = excluded.updatedAt,
       translated = excluded.translated`,
    [id, text, revision, translated ? 1 : 0],
  );
  const row = queryOne<LabelRowSql>("SELECT id, text, revision, updatedAt, translated FROM labels WHERE id = ?", [id]);
  if (!row) throw new Error(`label "${id}" write did not land`);
  return labelRowOf(row);
}

/**
 * Reads one label row by its page.widget.key path.
 *
 * @param id the label id.
 * @returns the row, or undefined when absent.
 */
export function readLabel(id: string): LabelRow | undefined {
  const row = queryOne<LabelRowSql>("SELECT id, text, revision, updatedAt, translated FROM labels WHERE id = ?", [id]);
  return row ? labelRowOf(row) : undefined;
}

/**
 * Reads every label row of the store ordered by id.
 *
 * @returns the label rows.
 */
export function readAllLabels(): LabelRow[] {
  return queryAll<LabelRowSql>("SELECT id, text, revision, updatedAt, translated FROM labels ORDER BY id ASC").map(
    labelRowOf,
  );
}

/**
 * Ingests the english manifest of labels.ts into the labels table — the
 * db-side twin of the browser seedLabels: idempotent, the changed rows
 * refresh, and the translated rows stay protected from the overwrite.
 *
 * @returns the seeded and protected row counts.
 */
export function seedLabelRows(): { seeded: number; protected: number } {
  ensureSchema();
  const rows = new Map(readAllLabels().map((row) => [row.id, row]));
  let seeded = 0;
  let saved = 0;
  for (const [id, text] of Object.entries(LABEL_MANIFEST)) {
    const row = rows.get(id);
    if (row === undefined || (row.translated !== true && row.text !== text)) {
      saveLabel(id, text, LABEL_REVISION, row?.translated ?? false);
      seeded += 1;
    }
    saved += 1;
  }
  return { seeded, protected: saved - seeded };
}

/* the copy law rides the db boot: the label seed ingests the english manifest
 * of labels.ts beside the schema (the interface strings land in the store,
 * the translated rows protected from the overwrite). best effort: a sealed
 * store never blocks the boot, the manifest always answers the wingets. */
try {
  seedLabelRows();
} catch {
  /* the manifest answers; the store catches up on the next boot */
}
