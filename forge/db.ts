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
`);

const listrunners = database.prepare("SELECT id, name, kind, boundary, status FROM runners ORDER BY name");
const runsOf = database.prepare("SELECT id, runnerId, outcome, detail, createdAt FROM runlogs WHERE runnerId = ? ORDER BY createdAt DESC");
const insertRunner = database.prepare("INSERT INTO runners (id, name, kind, boundary, status) VALUES (?, ?, ?, ?, ?)");
const insertRun = database.prepare("INSERT INTO runlogs (id, runnerId, outcome, detail) VALUES (?, ?, ?, ?)");

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
