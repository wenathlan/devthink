/**
 * speccatalog.ts — the spec catalog layer of the saddle database (root
 * layer, library-grade: no consumer data hardcoded here).
 *
 * mirrors the repository datasets (boards.json, cores.json, gpus.json,
 * processors.json) into the site DB on first run and serves typed list
 * accessors over prepared statements. every statement is parameterized —
 * sql is never assembled by string concatenation. the database file is
 * the same one db.ts boots (SADDLE_DB environment, never a hardcoded
 * location), so the engine, the self-hosted api and the theme answer
 * from one source of truth. the json files stay the seed source of
 * record; nothing inside the engine modules duplicates them.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { dbpath } from './db.ts';

/** the directory holding this module: the repository root with the
 * datasets beside the engine sources. */
const moduledir = dirname(fileURLToPath(import.meta.url));

/** one normalized catalog row: the payload cell keeps the full source
 * row as json text so no field of the datasets is lost. */
export type SpecRow = {
  id: string;
  name: string;
  payload: string;
};

/** the datasets the catalog mirrors, with the array key of each file. */
const datasets: { dataset: 'boards' | 'cores' | 'gpus' | 'processors'; file: string; key: string }[] = [
  { dataset: 'boards', file: 'boards.json', key: 'boards' },
  { dataset: 'cores', file: 'cores.json', key: 'models' },
  { dataset: 'gpus', file: 'gpus.json', key: 'gpus' },
  { dataset: 'processors', file: 'processors.json', key: 'processors' },
];

/** the catalog schema: static strings only, safe on every boot. */
const ddl = `
  create table if not exists specboards (
    id text primary key,
    name text not null,
    payload text not null
  );
  create table if not exists speccores (
    id text primary key,
    name text not null,
    payload text not null
  );
  create table if not exists specgpus (
    id text primary key,
    name text not null,
    payload text not null
  );
  create table if not exists specprocessors (
    id text primary key,
    name text not null,
    payload text not null
  );
`;

/** the statements, all prepared once (bound parameters only). */
const statements: Record<string, { insert: ReturnType<DatabaseSync.prototype.prepare>; select: ReturnType<DatabaseSync.prototype.prepare> }> = {};

/** the catalog connection: the same file the engine db.ts boots. */
let database: DatabaseSync | null = null;

/** true once the mirror pass has run for this process. */
let mirrored = false;

/**
 * derives the stable row id: sha-256 of the exact source row, so the
 * mirror stays idempotent across runs (insert or replace).
 *
 * @param dataset the dataset namespace.
 * @param row the raw source row.
 * @returns the hex digest id.
 */
function rowid(dataset: string, row: unknown): string {
  return createHash('sha256').update(`${dataset}:${JSON.stringify(row)}`).digest('hex').slice(0, 40);
}

/**
 * extracts the display name of a row from the usual field candidates.
 *
 * @param row the raw source row.
 * @returns the best name field found.
 */
function rowname(row: Record<string, unknown>): string {
  const candidates = ['name', 'model', 'model_name', 'board', 'title', 'id'];
  for (const key of candidates) {
    const value = row[key];
    if (typeof value === 'string' && value.trim() !== '') return value;
  }
  return '(unnamed)';
}

/**
 * opens the catalog connection, creates the schema and mirrors the
 * datasets on first run. errors stay contained: a catalog failure never
 * breaks the engine boot.
 */
function ensurecatalog(): void {
  if (mirrored) return;
  database = new DatabaseSync(dbpath);
  database.exec(ddl);
  for (const spec of datasets) {
    statements[spec.dataset] = {
      insert: database.prepare(`insert or replace into spec${spec.dataset} (id, name, payload) values (?, ?, ?)`),
      select: database.prepare(`select id, name, payload from spec${spec.dataset} order by name`),
    };
    try {
      const document = JSON.parse(readFileSync(join(moduledir, spec.file), 'utf8')) as Record<string, unknown>;
      const rows = document[spec.key];
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        if (row === null || typeof row !== 'object') continue;
        const record = row as Record<string, unknown>;
        statements[spec.dataset].insert.run(rowid(spec.dataset, row), rowname(record), JSON.stringify(record));
      }
    } catch {
      /* an unreadable dataset leaves the catalog table as-is; the json
       * file stays the source of record for the next boot */
    }
  }
  mirrored = true;
}

/**
 * lists the rows of one dataset through the prepared statement.
 *
 * @param dataset the dataset to read.
 * @returns the catalog rows.
 */
function listdataset(dataset: 'boards' | 'cores' | 'gpus' | 'processors'): SpecRow[] {
  ensurecatalog();
  const statement = statements[dataset]?.select;
  if (!statement) return [];
  return statement.all() as unknown as SpecRow[];
}

/**
 * lists the boards dataset.
 *
 * @returns the board rows.
 */
export function listboards(): SpecRow[] {
  return listdataset('boards');
}

/**
 * lists the cores dataset.
 *
 * @returns the core rows.
 */
export function listcores(): SpecRow[] {
  return listdataset('cores');
}

/**
 * lists the gpus dataset.
 *
 * @returns the gpu rows.
 */
export function listgpus(): SpecRow[] {
  return listdataset('gpus');
}

/**
 * lists the processors dataset.
 *
 * @returns the processor rows.
 */
export function listprocessors(): SpecRow[] {
  return listdataset('processors');
}
