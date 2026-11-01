// # db — the self-hosted sqlite runtime of the site: better-sqlite3 bootstrap and
// parameterized query helpers only. Every statement is prepared and parameterized —
// no sql is ever assembled by string concatenation. The schema mirrors
// prisma/schema.prisma and the seed module provides the first-run rows; the site api
// serves the same tables to the Sol pages over HTTPS (see catalog.ts).

import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { labelManifest, LABEL_REVISION } from "./labels.ts";
import {
  seedAnchors,
  seedAutoplayChoices,
  seedFilterChoices,
  seedHeroBadges,
  seedPlayerFormats,
  seedProjects,
  seedSeatCards,
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
CREATE TABLE IF NOT EXISTS projects (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  detail     TEXT NOT NULL,
  discipline TEXT NOT NULL,
  format     TEXT NOT NULL,
  tone       TEXT NOT NULL DEFAULT 'default',
  art        INTEGER NOT NULL DEFAULT 1,
  createdAt  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS assets (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  projectId INTEGER NOT NULL,
  kind      TEXT NOT NULL,
  extension TEXT NOT NULL,
  size      BIGINT NOT NULL DEFAULT 0,
  hash      TEXT
);
CREATE TABLE IF NOT EXISTS render_jobs (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  projectId INTEGER,
  trackId   INTEGER,
  prompt    TEXT NOT NULL DEFAULT '',
  genre     TEXT NOT NULL DEFAULT '',
  seed      INTEGER NOT NULL DEFAULT 0,
  duration  TEXT NOT NULL DEFAULT '',
  status    TEXT NOT NULL DEFAULT 'queued',
  seconds   INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS onboarding_states (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor        TEXT NOT NULL UNIQUE,
  introseen      INTEGER NOT NULL DEFAULT 0,
  onboardingseen INTEGER NOT NULL DEFAULT 0,
  updatedAt      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS player_formats (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  format  TEXT NOT NULL,
  media   TEXT NOT NULL,
  engine  TEXT NOT NULL,
  tone    TEXT NOT NULL DEFAULT 'default',
  status  TEXT NOT NULL,
  extensions TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS content_rows (
  kind    TEXT NOT NULL,
  ordinal INTEGER NOT NULL,
  payload TEXT NOT NULL,
  PRIMARY KEY (kind, ordinal)
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
  // the label seed rides the db boot beside the content seed: fire and forget
  // with the catch — the interface strings land in the site's own store
  void seedLabelRows().catch(() => {});
  const count = queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM content_rows");
  if (count && count.total > 0) return;

  const insertContent = db.prepare("INSERT OR IGNORE INTO content_rows (kind, ordinal, payload) VALUES (?, ?, ?)");
  const insertFormat = db.prepare(
    "INSERT INTO player_formats (format, media, engine, tone, status, extensions) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const insertProject = db.prepare(
    "INSERT INTO projects (title, detail, discipline, format, tone, art) VALUES (?, ?, ?, ?, ?, ?)",
  );

  const contentTables: readonly [string, readonly unknown[]][] = [
    ["anchors", seedAnchors],
    ["cards.home-seats", seedSeatCards],
    ["badges.hero", seedHeroBadges],
    ["choices.gallery-filter", seedFilterChoices],
    ["choices.autoplay", seedAutoplayChoices],
  ];
  const writeContent = db.transaction(() => {
    for (const [kind, rows] of contentTables) {
      rows.forEach((row, ordinal) => {
        insertContent.run(kind, ordinal, JSON.stringify(row));
      });
    }
    for (const format of seedPlayerFormats) {
      insertFormat.run(
        format.format,
        format.media,
        format.engine,
        format.tone,
        format.status,
        format.extensions.join(" "),
      );
    }
    for (const project of seedProjects) {
      insertProject.run(project.title, project.detail, project.discipline, project.format, project.tone, project.art);
    }
  });
  writeContent();
}

/** Typed accessor of the projects table (parameterized by discipline). */
export function projectRows(discipline: string): { id: number; title: string; discipline: string; format: string }[] {
  return queryAll("SELECT id, title, discipline, format FROM projects WHERE discipline = ? OR ? = 'all' ORDER BY id", [
    discipline,
    discipline,
  ]);
}

/** the label store: every interface string of the app lives here, never
 * hardcoded inside a widget. the id is the page.widget.key path, the text
 * rides the english source of truth, and the translated flag protects the
 * runtime translation from the seed overwrite. the shapes mirror the os app
 * store (devthink/db.ts) one to one: the same row type, the same three
 * accessors, over the site's own sqlite instead of a browser index. */
export type BrowserLabel = { id: string; text: string; revision: number; updatedAt: string; translated?: boolean };

function labelRow(row: {
  id: string;
  text: string;
  revision: number;
  updatedAt: string;
  translated: number;
}): BrowserLabel {
  return {
    id: row.id,
    text: row.text,
    revision: row.revision,
    updatedAt: row.updatedAt,
    ...(row.translated === 1 ? { translated: true } : {}),
  };
}

/** Writes one label row (idempotent upsert; the caller owns the revision). */
export async function saveLabel(id: string, text: string, revision: number, translated = false): Promise<BrowserLabel> {
  execute(
    `INSERT INTO labels (id, text, revision, updatedAt, translated) VALUES (?, ?, ?, datetime('now'), ?)
     ON CONFLICT(id) DO UPDATE SET
       text = excluded.text,
       revision = excluded.revision,
       updatedAt = excluded.updatedAt,
       translated = excluded.translated`,
    [id, text, revision, translated ? 1 : 0],
  );
  const row = queryOne<{ id: string; text: string; revision: number; updatedAt: string; translated: number }>(
    "SELECT id, text, revision, updatedAt, translated FROM labels WHERE id = ?",
    [id],
  );
  if (!row) throw new Error("cadria label store write did not land.");
  return labelRow(row);
}

/** Reads one label row by its page.widget.key path, or undefined when absent. */
export async function readLabel(id: string): Promise<BrowserLabel | undefined> {
  const row = queryOne<{ id: string; text: string; revision: number; updatedAt: string; translated: number }>(
    "SELECT id, text, revision, updatedAt, translated FROM labels WHERE id = ?",
    [id],
  );
  return row ? labelRow(row) : undefined;
}

/** Reads every label row of the store. */
export async function readAllLabels(): Promise<BrowserLabel[]> {
  return queryAll<{ id: string; text: string; revision: number; updatedAt: string; translated: number }>(
    "SELECT id, text, revision, updatedAt, translated FROM labels ORDER BY id",
  ).map(labelRow);
}

/**
 * Ingests the english manifest into the labels table — the db-side twin of
 * the browser seedLabels: idempotent, the changed rows refresh, and the
 * translated rows stay protected from the overwrite.
 *
 * @returns the seeded and protected row counts.
 */
export async function seedLabelRows(): Promise<{ seeded: number; protected: number }> {
  ensureSchema();
  const rows = new Map((await readAllLabels()).map((row) => [row.id, row]));
  let seeded = 0;
  let saved = 0;
  for (const [id, text] of Object.entries(labelManifest)) {
    const row = rows.get(id);
    if (!row || (!row.translated && row.text !== text)) {
      await saveLabel(id, text, LABEL_REVISION, row?.translated ?? false);
      seeded += 1;
    }
    saved += 1;
  }
  return { seeded, protected: saved - seeded };
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

/**
 * Reads the onboarding stage flags of one visitor (parameterized; undefined
 * before the first write). The browser accessor serves the same flags over
 * GET /api/v1/onboarding.
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
