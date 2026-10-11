/** forge root database logic: the self-hosted store of the sandbox runners.
 * better-sqlite3 with prepared statements only — every external input rides a
 * bound parameter, never a concatenated string (the parameterized query rule). */
import Database from "better-sqlite3";

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

/** the mirrored row of the onboarding_state table (the first-run state of one visitor). */
export type OnboardingStateRow = {
  visitor: string;
  introseen: boolean;
  onboardingseen: boolean;
  updatedAt: string;
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
