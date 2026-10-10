// # db — the self-hosted sqlite runtime of the site: better-sqlite3 bootstrap and
// parameterized query helpers only. Every statement is prepared and parameterized —
// no sql is ever assembled by string concatenation. The schema mirrors
// prisma/schema.prisma and the seed module provides the first-run rows; the site api
// serves the same tables to the Sol pages over HTTPS (see catalog.ts).
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
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
      insertFormat.run(format.format, format.media, format.engine, format.tone, format.status, format.extensions.join(" "));
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
