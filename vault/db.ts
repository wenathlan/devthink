/**
 * db.ts — the self-hosted site store of the vault: the app database over
 * the shared storage lane (the storage law of the family — the mechanism
 * lives in storagelane.ts and only there; this file keeps the vault's own
 * tables, schema and accessors, the app data). Every statement is prepared
 * and bound — no sql is ever assembled by string concatenation. The schema
 * mirrors prisma/schema.prisma (the documentation of record) and the boot
 * DDL is the idempotent seed-on-first-run: the tables exist after the first
 * open, always. The platform gateway serves the same tables to the Sol
 * pages over HTTPS (GET/POST /api/v1/onboarding — the browser accessor is
 * onboardingstate.ts); no server route lives here.
 */

import { LABEL_MANIFEST, LABEL_REVISION } from "./labels.ts";
import { openStorageLane } from "./storagelane.ts";

/** the correlated tables the runtime keeps (the family sync contract names). */
export const tables = ["keys", "payloads", "onboarding_states", "labels", "accounts", "databases", "apikeys"] as const;

/** the one storage lane of the site store (WAL, foreign keys, patient locks — the vault's own file). */
const lane = openStorageLane({ defaultFile: "./vault.db" });

/** the one sqlite connection of the runtime (re-exported seat of the lane). */
export const db = lane.db;

/** the parameterized helpers of the site store (re-exported seats of the lane). */
export const { execute, queryAll, queryOne } = lane;

/** the parameter types the helpers bind (sqlite stores them narrow — re-exported seat of the lane). */
export type { SqlParam } from "./storagelane.ts";

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
CREATE TABLE IF NOT EXISTS labels (
  id         TEXT PRIMARY KEY,
  text       TEXT NOT NULL,
  revision   INTEGER NOT NULL DEFAULT 0,
  updatedAt  TEXT NOT NULL DEFAULT (datetime('now')),
  translated INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS accounts (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  passwordDigest TEXT NOT NULL,
  createdAt      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS databases (
  id         TEXT PRIMARY KEY,
  accountId  TEXT NOT NULL REFERENCES accounts(id),
  name       TEXT NOT NULL,
  quotaBytes INTEGER,
  createdAt  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS apikeys (
  id          TEXT PRIMARY KEY,
  databaseId  TEXT NOT NULL REFERENCES databases(id),
  label       TEXT NOT NULL DEFAULT 'the first key',
  keyDigest   TEXT NOT NULL UNIQUE,
  createdAt   TEXT NOT NULL DEFAULT (datetime('now')),
  lastUsedAt  TEXT,
  revokedAt   TEXT
);
`;

/** Creates the tables when they do not exist (idempotent, mirrors the prisma schema). */
export function ensureSchema(): void {
  lane.exec(SCHEMA);
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

/* --------------------------------------------------------------------- */
/* labels — the interface copy store                                      */
/* --------------------------------------------------------------------- */

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
