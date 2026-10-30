// # renderjobs — the node/sqlite half of the render lane (root layer, the
// pipeline waves PV4.003 + PV4.004 + PV6.001): the render_jobs ledger the
// pipeline names — the same walk law the ingest_jobs table rides (create-if-not-
// exists, the in-place alter path for a standing site-shape table, prepared
// and parameterized statements only — no sql is ever assembled by string
// concatenation, the house database law) — plus the tracks pointer chain:
// every rendered track row carries the owner pointer, the blob address of
// the wav and the visibility lane (the reference law of PV1.001 mirrored
// onto the site's own tracks table, the alter path adding the columns a
// standing table lacks, no row ever destroyed, no value ever rewritten — a
// fresh render lands private, the publish lane moves it onto the vitrine
// and the vitrine list serves the published rows beside the ingested
// references). the publish move answers the two vocabularies the family
// waves ride (the vitrine wave's visibility climb and the generate lane's
// status flip — one move, both flags, so a row published through either
// route lists on both surfaces), and the track list carries both filter
// shapes (the visibility lane of the tracks route, the published status
// and the owner shelf of the generate lane's vitrine). the worker lane stays
// pure of any database import (the injectable discipline the ingest
// worker and the takestore storage seams ride): this module implements the
// seats renderworker.ts names, and the tests bind a temp sqlite through
// the same parameterized functions.

import { db } from "./db.ts";
import type {
  RenderDbAnswer,
  RenderJobPatch,
  RenderJobRow,
  RenderJobSeat,
  RenderTrackRow,
  RenderTrackSeat,
  RenderTrackVisibility,
} from "./renderworker.ts";

/** The mint ceiling — a 64-bit pointer never reaches the signed rail of
 * the sqlite integer storage (2^63). */
const POINTER_MAX = 1n << 63n;

/** The decimal shape every mint produces (the bigintids law). */
const DECIMAL = /^[0-9]+$/;

/**
 * Parses one decimal pointer into the exact bigint bind — the track lane's
 * owner and wav columns ride the same law the ingest pointers ride: the
 * minted decimal shape, never zero, never past the 64-bit rail.
 *
 * @param value the decimal string the caller passed.
 * @returns the exact bigint bind, or null when the shape breaks.
 */
function pointerof(value: string): bigint | null {
  if (typeof value !== "string" || !DECIMAL.test(value)) return null;
  let parsed: bigint;
  try {
    parsed = BigInt(value);
  } catch {
    return null;
  }
  if (parsed <= 0n || parsed >= POINTER_MAX) return null;
  return parsed;
}

// ---------------------------------------------------------------------------
// the render_jobs ledger (the ingest_jobs walk law, render's own columns)
// ---------------------------------------------------------------------------

/** The create statement of the ledger — a fresh database gets the ten
 * walk columns in one statement; a standing table keeps its rows (the
 * create-if-not-exists law). */
const CREATE_RENDER_JOBS = `
    CREATE TABLE IF NOT EXISTS render_jobs (
      id            TEXT PRIMARY KEY,
      owner_id      TEXT NOT NULL,
      state         TEXT NOT NULL DEFAULT 'queued',
      phase         TEXT,
      fraction      REAL NOT NULL DEFAULT 0,
      error         TEXT,
      plan_json     TEXT NOT NULL DEFAULT '',
      wav_pointer   TEXT,
      track_pointer TEXT,
      created_at    TEXT NOT NULL,
      finished_at   TEXT
    );
  `;

/** The ledger columns the migration adds to a standing table — the
 * site's own render_jobs shape (the generation queue the db schema
 * seeded: the integer id, the track and project pointers, the prompt,
 * the genre, the seed, the duration, the status, the seconds) never
 * wrote a row, and the alter path upgrades it in place: every ledger
 * column lands with the law's defaults, no row is ever destroyed, no
 * value is ever rewritten (the same in-place law the ingest_documents
 * migration rides). */
const RENDER_JOB_UPGRADES: readonly { column: string; ddl: string }[] = [
  { column: "owner_id", ddl: "ALTER TABLE render_jobs ADD COLUMN owner_id TEXT NOT NULL DEFAULT ''" },
  { column: "state", ddl: "ALTER TABLE render_jobs ADD COLUMN state TEXT NOT NULL DEFAULT 'queued'" },
  { column: "phase", ddl: "ALTER TABLE render_jobs ADD COLUMN phase TEXT" },
  { column: "fraction", ddl: "ALTER TABLE render_jobs ADD COLUMN fraction REAL NOT NULL DEFAULT 0" },
  { column: "error", ddl: "ALTER TABLE render_jobs ADD COLUMN error TEXT" },
  { column: "plan_json", ddl: "ALTER TABLE render_jobs ADD COLUMN plan_json TEXT NOT NULL DEFAULT ''" },
  { column: "wav_pointer", ddl: "ALTER TABLE render_jobs ADD COLUMN wav_pointer TEXT" },
  { column: "track_pointer", ddl: "ALTER TABLE render_jobs ADD COLUMN track_pointer TEXT" },
  { column: "created_at", ddl: "ALTER TABLE render_jobs ADD COLUMN created_at TEXT NOT NULL DEFAULT ''" },
  { column: "finished_at", ddl: "ALTER TABLE render_jobs ADD COLUMN finished_at TEXT" },
];

/**
 * Brings the render_jobs table of any better-sqlite3 handle to the ledger
 * law shape: the create statement lands the table when absent, then the
 * alter path adds every column a standing table lacks. DDL only: the
 * statements are constants, zero parameters, zero interpolation.
 *
 * @param target the database handle (the app db or a test database).
 */
export function migraterenderjobsschema(target: typeof db): void {
  target.exec(CREATE_RENDER_JOBS);
  const standing = target.pragma("table_info(render_jobs)") as { name: string }[];
  const carried = new Set(standing.map((column) => column.name));
  for (const upgrade of RENDER_JOB_UPGRADES) {
    if (!carried.has(upgrade.column)) target.exec(upgrade.ddl);
  }
}

/**
 * Ensures the render_jobs ledger exists at the app database (the ledger
 * creates its own table so the schema stays layered — the seed never
 * depends on it).
 */
export function ensurerenderjobsschema(): void {
  migraterenderjobsschema(db);
}

/** The ledger column list every read carries — the id in the decimal
 * string form (a standing site table holds it in an integer column, the
 * cast keeps the minted pointer exact beyond the js number floor). */
const RENDER_JOB_COLUMNS = `CAST(id AS TEXT) AS id, owner_id, state, phase, fraction, error, plan_json, wav_pointer, track_pointer, created_at, finished_at`;

/**
 * Registers one render job row (or refreshes the row of the same id — the
 * upsert law the ledger writes ride).
 *
 * @param row the full ledger row.
 * @param target the database handle (defaults to the app db).
 */
export function putrenderjob(row: RenderJobRow, target: typeof db = db): void {
  migraterenderjobsschema(target);
  target
    .prepare(
      `INSERT INTO render_jobs (id, owner_id, state, phase, fraction, error, plan_json, wav_pointer, track_pointer, created_at, finished_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         owner_id = excluded.owner_id,
         state = excluded.state,
         phase = excluded.phase,
         fraction = excluded.fraction,
         error = excluded.error,
         plan_json = excluded.plan_json,
         wav_pointer = excluded.wav_pointer,
         track_pointer = excluded.track_pointer,
         created_at = excluded.created_at,
         finished_at = excluded.finished_at`,
    )
    .run(
      row.id,
      row.owner_id,
      row.state,
      row.phase,
      row.fraction,
      row.error,
      row.plan_json,
      row.wav_pointer,
      row.track_pointer,
      row.created_at,
      row.finished_at,
    );
}

/**
 * Reads one render job row by id.
 *
 * @param id the job id.
 * @param target the database handle (defaults to the app db).
 * @returns the row, or null when the id answers nothing.
 */
export function getrenderjob(id: string, target: typeof db = db): RenderJobRow | null {
  migraterenderjobsschema(target);
  return (
    (target.prepare(`SELECT ${RENDER_JOB_COLUMNS} FROM render_jobs WHERE id = ?`).get(id) as
      | RenderJobRow
      | undefined) ?? null
  );
}

/**
 * Patches one render job row — the walk lands its patches here (the
 * state, the phase, the fraction, the error, the wav pointer, the
 * finish). The merge is read-then-write over two constant statements: the
 * standing row reads, the patch overlays, the full mutable set writes
 * back — a column the patch omits keeps its standing value (the
 * single-writer walk keeps the read-then-write honest: one worker walks
 * one job).
 *
 * @param id the job id.
 * @param patch the mutable fields to overlay.
 * @param target the database handle (defaults to the app db).
 * @returns true when a row was patched.
 */
export function updaterenderjob(id: string, patch: RenderJobPatch, target: typeof db = db): boolean {
  const standing = getrenderjob(id, target);
  if (standing === null) return false;
  target
    .prepare(
      "UPDATE render_jobs SET state = ?, phase = ?, fraction = ?, error = ?, wav_pointer = ?, track_pointer = ?, finished_at = ? WHERE id = ?",
    )
    .run(
      patch.state ?? standing.state,
      patch.phase !== undefined ? patch.phase : standing.phase,
      patch.fraction ?? standing.fraction,
      patch.error !== undefined ? patch.error : standing.error,
      patch.wav_pointer !== undefined ? patch.wav_pointer : standing.wav_pointer,
      patch.track_pointer !== undefined ? patch.track_pointer : standing.track_pointer,
      patch.finished_at !== undefined ? patch.finished_at : standing.finished_at,
      id,
    );
  return true;
}

/**
 * Lists the render job rows, newest first (the created_at order, the
 * minted id as the same-instant tiebreak — the ids sort by creation). An
 * owner filter rides when the caller carries one.
 *
 * @param ownerId the owner pointer filter, or undefined for every row.
 * @param target the database handle (defaults to the app db).
 * @returns the rows.
 */
export function listrenderjobs(ownerId?: string, target: typeof db = db): RenderJobRow[] {
  migraterenderjobsschema(target);
  if (ownerId === undefined) {
    return target
      .prepare(`SELECT ${RENDER_JOB_COLUMNS} FROM render_jobs ORDER BY created_at DESC, id DESC`)
      .all() as RenderJobRow[];
  }
  return target
    .prepare(`SELECT ${RENDER_JOB_COLUMNS} FROM render_jobs WHERE owner_id = ? ORDER BY created_at DESC, id DESC`)
    .all(ownerId) as RenderJobRow[];
}

// ---------------------------------------------------------------------------
// the tracks pointer chain (the site's own table, the reference law grown)
// ---------------------------------------------------------------------------

/** The create statement of the tracks table at the pointer-law shape —
 * the site schema's own columns with the owner pointer and the wav
 * address riding along (the same names and defaults the alter path adds
 * to a standing table, the same shape db.ts seeds: a fresh database gets
 * every column in one statement either order the boots land). */
const CREATE_RENDER_TRACKS = `
    CREATE TABLE IF NOT EXISTS tracks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      genre       TEXT NOT NULL,
      seconds     INTEGER NOT NULL DEFAULT 0,
      status      TEXT NOT NULL DEFAULT 'draft',
      createdAt   TEXT NOT NULL DEFAULT (datetime('now')),
      owner_id    BIGINT NOT NULL DEFAULT 0,
      wav_pointer BIGINT,
      visibility  TEXT NOT NULL DEFAULT 'private'
    );
  `;

/** The pointer columns the migration adds to a standing tracks table —
 * the site table keeps every row and gains the reference law's columns
 * with its fills (owner 0, the pre-identity epoch marker the migration
 * never fabricates an identity for; a null wav address; the private
 * visibility — a standing row never rides the vitrine until its owner
 * publishes it). */
const RENDER_TRACK_UPGRADES: readonly { column: string; ddl: string }[] = [
  { column: "owner_id", ddl: "ALTER TABLE tracks ADD COLUMN owner_id BIGINT NOT NULL DEFAULT 0" },
  { column: "wav_pointer", ddl: "ALTER TABLE tracks ADD COLUMN wav_pointer BIGINT" },
  { column: "visibility", ddl: "ALTER TABLE tracks ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'" },
];

/**
 * Brings the tracks table of any better-sqlite3 handle to the pointer-law
 * shape: the create statement lands the table when absent (the site
 * schema's own columns plus the pointer pair), then the alter path adds
 * the pointer columns a standing table lacks. DDL only.
 *
 * @param target the database handle (the app db or a test database).
 */
export function migratetrackschema(target: typeof db): void {
  target.exec(CREATE_RENDER_TRACKS);
  const standing = target.pragma("table_info(tracks)") as { name: string }[];
  const carried = new Set(standing.map((column) => column.name));
  for (const upgrade of RENDER_TRACK_UPGRADES) {
    if (!carried.has(upgrade.column)) target.exec(upgrade.ddl);
  }
}

/**
 * Ensures the tracks table exists at the pointer-law shape on the app
 * database.
 */
export function ensuretrackschema(): void {
  migratetrackschema(db);
}

/** The visibility lanes the tracks table carries (the ingest documents'
 * own law — a fresh row lands private, the owner's publish moves it to
 * the vitrine). */
const TRACK_VISIBILITIES: readonly string[] = ["private", "vitrine"];

/**
 * Stamps one rendered track row — the walk's done stamp beside the wav:
 * the name, the genre line, the seconds, the ready status, the owner
 * pointer, the blob address of the wav and the visibility lane (a fresh
 * render lands private — the reference law's chain, never a row that
 * points at missing bytes — the walk calls this after the store
 * answered). The pointers bind as exact bigints and read back through
 * the text cast.
 *
 * @param row the rendered track row.
 * @param target the database handle (defaults to the app db).
 * @returns the typed db answer (bad-owner or bad-pointer on a shape
 *   break — the mint law the ingest pointers ride).
 */
export function putrendertrack(row: RenderTrackRow, target: typeof db = db): RenderDbAnswer {
  const id = pointerof(row.id);
  const owner = pointerof(row.ownerId);
  const wav = pointerof(row.wavPointer);
  if (owner === null)
    return { ok: false, code: "bad-owner", message: `the owner pointer "${row.ownerId}" is not a minted decimal` };
  if (wav === null)
    return { ok: false, code: "bad-pointer", message: `the wav pointer "${row.wavPointer}" is not a minted decimal` };
  if (id === null)
    return { ok: false, code: "bad-pointer", message: `the track id "${row.id}" is not a minted decimal` };
  if (!TRACK_VISIBILITIES.includes(row.visibility))
    return {
      ok: false,
      code: "bad-visibility",
      message: `the visibility "${row.visibility}" is not one of the lanes (private | vitrine)`,
    };
  migratetrackschema(target);
  target
    .prepare(
      `INSERT INTO tracks (id, name, genre, seconds, status, createdAt, owner_id, wav_pointer, visibility)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, row.name, row.genre, Math.round(row.seconds), row.status, row.createdAt, owner, wav, row.visibility);
  return { ok: true };
}

/** The track column list every read carries — the pointers in the decimal
 * string form, the visibility lane riding along. */
const RENDER_TRACK_COLUMNS = `CAST(id AS TEXT) AS id, name, genre, seconds, status, createdAt,
        CAST(owner_id AS TEXT) AS ownerId, CAST(wav_pointer AS TEXT) AS wavPointer, visibility`;

/**
 * Reads one rendered track row by id — every column of the pointer law,
 * the pointers in the decimal string form.
 *
 * @param id the track id.
 * @param target the database handle (defaults to the app db).
 * @returns the row, or null when the id answers nothing.
 */
export function getrendertrack(id: string, target: typeof db = db): RenderTrackRow | null {
  migratetrackschema(target);
  const parsed = pointerof(id);
  if (parsed === null) return null;
  const row = target.prepare(`SELECT ${RENDER_TRACK_COLUMNS} FROM tracks WHERE id = ?`).get(parsed) as
    | RenderTrackRow
    | undefined;
  return row ?? null;
}

/** The filter shapes the track list answers — the vitrine wave's
 * visibility lane (a bare "private" | "vitrine" string) or the generate
 * lane's own filter (the published status and the owner shelf), one seat
 * for both vocabularies the family waves ride. */
export type RenderTrackFilter =
  | RenderTrackVisibility
  | {
      /** The status filter (the generate lane's published flag). */
      status?: string;
      /** The owner pointer filter (the owner's own shelf). */
      ownerId?: string;
    };

/**
 * Lists the rendered track rows, newest first (the createdAt order, the
 * minted id as the same-instant tiebreak). The filter rides when the
 * caller carries one, either vocabulary: a bare visibility string (the
 * tracks route's vitrine list — the private stays private until its
 * owner publishes) or the generate lane's own shape (the published
 * status, the owner's whole shelf).
 *
 * @param filter the visibility lane, the status/owner filter, or undefined
 *   for every row.
 * @param target the database handle (defaults to the app db).
 * @returns the rows.
 */
export function listrendertracks(filter?: RenderTrackFilter, target: typeof db = db): RenderTrackRow[] {
  migratetrackschema(target);
  const clauses: string[] = [];
  const params: (string | bigint)[] = [];
  if (typeof filter === "string") {
    clauses.push("visibility = ?");
    params.push(filter);
  } else if (filter !== undefined) {
    if (filter.status !== undefined) {
      clauses.push("status = ?");
      params.push(filter.status);
    }
    if (filter.ownerId !== undefined) {
      const owner = pointerof(filter.ownerId);
      if (owner === null) return [];
      clauses.push("owner_id = ?");
      params.push(owner);
    }
  }
  const where = clauses.length > 0 ? ` WHERE ${clauses.join(" AND ")}` : "";
  return target
    .prepare(`SELECT ${RENDER_TRACK_COLUMNS} FROM tracks${where} ORDER BY createdAt DESC, id DESC`)
    .all(...(params as never[])) as RenderTrackRow[];
}

/**
 * Publishes one rendered track row — the owner's move of the publish
 * lane: the row climbs onto the vitrine under both flags the family
 * waves read (the visibility lane the tracks route lists and the
 * published status the generate lane's vitrine answers — one move, both
 * vocabularies, so a row published through either route lists on both
 * surfaces; idempotent — a standing published row answers itself, the
 * upsert law the ledgers ride), the row reading back with every column.
 *
 * @param id the track id.
 * @param target the database handle (defaults to the app db).
 * @returns the published row, or null when the id answers nothing.
 */
export function publishrendertrack(id: string, target: typeof db = db): RenderTrackRow | null {
  migratetrackschema(target);
  const parsed = pointerof(id);
  if (parsed === null) return null;
  target.prepare("UPDATE tracks SET status = 'published', visibility = 'vitrine' WHERE id = ?").run(parsed);
  return getrendertrack(id, target);
}

// ---------------------------------------------------------------------------
// the seat adapters (the wiring lane binds the tables)
// ---------------------------------------------------------------------------

/**
 * Binds the render job ledger seat onto a database handle — the walk's
 * putjob/getjob/updatejob/listjobs calls land on the parameterized
 * functions above (the app db by default, a temp sqlite in the tests).
 *
 * @param target the database handle (defaults to the app db).
 * @returns the ledger seat.
 */
export function renderjobseat(target: typeof db = db): RenderJobSeat {
  return {
    putjob: (row) => putrenderjob(row, target),
    getjob: (id) => getrenderjob(id, target),
    updatejob: (id, patch) => {
      updaterenderjob(id, patch, target);
    },
    listjobs: (ownerId) => listrenderjobs(ownerId, target),
  };
}

/**
 * Binds the track row seat onto a database handle — the walk's
 * puttrackrow call lands on the parameterized function above (the
 * ingest handle's own async answer law), and the gateway's vitrine
 * surfaces ride the same binding: the row read, the visibility list, the
 * publish move, the published list and the owner shelf (the gateway
 * track seat satisfies this shape structurally — one binding, both
 * lanes, both vocabularies).
 *
 * @param target the database handle (defaults to the app db).
 * @returns the track seat.
 */
export function rendertrackseat(target: typeof db = db): RenderTrackSeat & {
  gettrackrow(id: string): Promise<RenderTrackRow | null>;
  listtrackrows(visibility?: RenderTrackVisibility): Promise<RenderTrackRow[]>;
  publishtrackrow(id: string): Promise<RenderTrackRow | null>;
  listpublishedrows(): Promise<RenderTrackRow[]>;
  listownerrows(ownerId: string): Promise<RenderTrackRow[]>;
} {
  return {
    puttrackrow: async (row) => putrendertrack(row, target),
    gettrackrow: async (id) => getrendertrack(id, target),
    listtrackrows: async (visibility) => listrendertracks(visibility, target),
    publishtrackrow: async (id) => publishrendertrack(id, target),
    listpublishedrows: async () => listrendertracks({ status: "published" }, target),
    listownerrows: async (ownerId) => listrendertracks({ ownerId }, target),
  };
}
