/** forge root database logic: the self-hosted store of the sandbox runners.
 * better-sqlite3 with prepared statements only — every external input rides a
 * bound parameter, never a concatenated string (the parameterized query rule). */
import Database from "better-sqlite3";
import { LABEL_MANIFEST, LABEL_REVISION } from "./labels.ts";

export type Runner = { id: string; name: string; kind: string; boundary: string; status: string };
export type RunEntry = { id: string; runnerId: string; outcome: string; detail: string; createdAt: string };

const database = new Database(process.env.FORGE_DB_PATH ?? "forge.db");

database.exec(`
  CREATE TABLE IF NOT EXISTS runners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    boundary TEXT NOT NULL DEFAULT 'saddle',
    status TEXT NOT NULL DEFAULT 'idle'
  );
  CREATE TABLE IF NOT EXISTS runlogs (
    id TEXT PRIMARY KEY,
    runnerId TEXT NOT NULL REFERENCES runners(id),
    outcome TEXT NOT NULL,
    detail TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS onboarding_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor TEXT NOT NULL UNIQUE,
    introseen INTEGER NOT NULL DEFAULT 0,
    onboardingseen INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS labels (
    id         TEXT PRIMARY KEY,
    text       TEXT NOT NULL,
    revision   INTEGER NOT NULL DEFAULT 0,
    updatedAt  TEXT NOT NULL DEFAULT (datetime('now')),
    translated INTEGER NOT NULL DEFAULT 0
  );
`);

const listrunners = database.prepare("SELECT id, name, kind, boundary, status FROM runners ORDER BY name");
const runsOf = database.prepare(
  "SELECT id, runnerId, outcome, detail, createdAt FROM runlogs WHERE runnerId = ? ORDER BY createdAt DESC",
);
const insertRunner = database.prepare("INSERT INTO runners (id, name, kind, boundary, status) VALUES (?, ?, ?, ?, ?)");
const insertRun = database.prepare("INSERT INTO runlogs (id, runnerId, outcome, detail) VALUES (?, ?, ?, ?)");
const selectOnboarding = database.prepare(
  'SELECT visitor, introseen, onboardingseen, "updatedAt" AS updatedAt FROM onboarding_state WHERE visitor = ?',
);
// the seen-wins upsert: a stage marked anywhere stays marked (MAX), the flow never replays
const upsertOnboarding = database.prepare(
  `INSERT INTO onboarding_state (visitor, introseen, onboardingseen, "updatedAt")
   VALUES (?, ?, ?, ?)
   ON CONFLICT(visitor) DO UPDATE SET
     introseen = MAX(introseen, excluded.introseen),
     onboardingseen = MAX(onboardingseen, excluded.onboardingseen),
     "updatedAt" = excluded."updatedAt"`,
);
const upsertLabel = database.prepare(
  `INSERT INTO labels (id, text, revision, updatedAt, translated) VALUES (?, ?, ?, datetime('now'), ?)
   ON CONFLICT(id) DO UPDATE SET
     text = excluded.text,
     revision = excluded.revision,
     updatedAt = excluded.updatedAt,
     translated = excluded.translated`,
);
const selectLabel = database.prepare(
  "SELECT id, text, revision, updatedAt, translated FROM labels WHERE id = ?",
);
const selectAllLabels = database.prepare(
  "SELECT id, text, revision, updatedAt, translated FROM labels ORDER BY id ASC",
);

/** the mirrored row of the onboarding_state table (the first-run state of one visitor). */
export type OnboardingStateRow = {
  visitor: string;
  introseen: boolean;
  onboardingseen: boolean;
  updatedAt: string;
};

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

export function runners(): Runner[] {
  return listrunners.all() as Runner[];
}

export function runnerRuns(runnerId: string): RunEntry[] {
  return runsOf.all(runnerId) as RunEntry[];
}

export function addRunner(id: string, name: string, kind: string, boundary = "saddle", status = "idle"): void {
  insertRunner.run(id, name, kind, boundary, status);
}

export function logRun(id: string, runnerId: string, outcome: string, detail = ""): void {
  insertRun.run(id, runnerId, outcome, detail);
}

/**
 * Reads the first-run state of one visitor from the onboarding_state table.
 *
 * @param visitor the stable visitor id.
 * @returns the mirrored row, or undefined when the visitor never started the flow.
 */
export function getonboardingstate(visitor: string): OnboardingStateRow | undefined {
  const row = selectOnboarding.get(visitor) as
    | { visitor: string; introseen: number; onboardingseen: number; updatedAt: string }
    | undefined;
  if (!row) return undefined;
  return {
    visitor: row.visitor,
    introseen: row.introseen === 1,
    onboardingseen: row.onboardingseen === 1,
    updatedAt: row.updatedAt,
  };
}

/**
 * Marks a first-run stage seen for one visitor (the seen-wins upsert):
 * "intro" marks the splash, "onboarding" marks the splash and the finish —
 * the flags only ever move forward.
 *
 * @param visitor the stable visitor id.
 * @param stage the stage that was seen.
 */
export function setonboardingstage(visitor: string, stage: "intro" | "onboarding"): void {
  upsertOnboarding.run(visitor, 1, stage === "onboarding" ? 1 : 0, new Date().toISOString());
}

/* --------------------------------------------------------------------- */
/* labels — the interface copy store                                      */
/* --------------------------------------------------------------------- */

/**
 * Writes one label row (idempotent upsert; the caller owns the revision),
 * prepared and parameterized, never concatenated SQL.
 *
 * @param id the page.widget.key path of the label.
 * @param text the surface text.
 * @param revision the manifest revision the text carries.
 * @param translated true when the row carries a runtime translation.
 * @returns the stored label row.
 */
export function saveLabel(id: string, text: string, revision: number, translated = false): LabelRow {
  upsertLabel.run(id, text, revision, translated ? 1 : 0);
  const row = selectLabel.get(id) as
    | { id: string; text: string; revision: number; updatedAt: string; translated: number }
    | undefined;
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
  const row = selectLabel.get(id) as
    | { id: string; text: string; revision: number; updatedAt: string; translated: number }
    | undefined;
  return row ? labelRowOf(row) : undefined;
}

/**
 * Reads every label row of the store ordered by id.
 *
 * @returns the label rows.
 */
export function readAllLabels(): LabelRow[] {
  return (selectAllLabels.all() as { id: string; text: string; revision: number; updatedAt: string; translated: number }[]).map(
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

/** Projects one raw labels row (translated rides the 0/1 cell) into the
 * stored label projection. */
function labelRowOf(row: {
  id: string;
  text: string;
  revision: number;
  updatedAt: string;
  translated: number;
}): LabelRow {
  return {
    id: row.id,
    text: row.text,
    revision: row.revision,
    updatedAt: row.updatedAt,
    ...(row.translated === 1 ? { translated: true } : {}),
  };
}

/* the copy law rides the db boot: the label seed ingests the english manifest
 * of labels.ts beside the schema (the interface strings land in the store,
 * the translated rows protected from the overwrite). best effort: a sealed
 * store never blocks the boot, the manifest always answers the widgets. */
try {
  seedLabelRows();
} catch {
  /* the manifest answers; the store catches up on the next boot */
}
