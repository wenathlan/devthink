/**
 * db.ts — the self-hosted sqlite runtime of the foundry: the better-sqlite3
 * bootstrap and the parameterized query helpers of the runner clone. Every
 * statement is prepared and bound — no sql is ever assembled by string
 * concatenation. The schema mirrors prisma/schema.prisma (the documentation
 * of record) and the boot DDL is the idempotent seed-on-first-run: the
 * tables exist after the first open, always. The platform gateway serves
 * the same tables to the Sol pages over HTTPS (GET/POST /api/v1/onboarding —
 * the browser accessor is onboardingstate.ts); no server route lives here.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

/** the correlated tables the runtime keeps (the family sync contract names). */
export const tables = ["keys", "payloads", "onboarding_states"] as const;

const rawUrl = process.env.DATABASE_URL ?? "file:./foundry.db";
const file = rawUrl.startsWith("file:") ? rawUrl.slice("file:".length) : rawUrl;
mkdirSync(path.dirname(path.resolve(file)), { recursive: true });

/** the one sqlite connection of the runtime (WAL, foreign keys, patient locks). */
export const db = new Database(file);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

/** the parameter types the helpers bind (sqlite stores them narrow). */
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
CREATE TABLE IF NOT EXISTS keys (
  id        TEXT PRIMARY KEY,
  scope     TEXT NOT NULL DEFAULT 'store',
  payload   TEXT NOT NULL DEFAULT '',
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS payloads (
  id        TEXT PRIMARY KEY,
  keyId     TEXT,
  bytes     BLOB,
  size      INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS onboarding_states (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor        TEXT NOT NULL UNIQUE,
  introseen      INTEGER NOT NULL DEFAULT 0,
  onboardingseen INTEGER NOT NULL DEFAULT 0,
  updatedAt      TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

/** Creates the tables when they do not exist (idempotent, mirrors the prisma schema). */
export function ensureSchema(): void {
  db.exec(SCHEMA);
}

// the boot seed: the tables exist from the first open, always (idempotent).
ensureSchema();

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
