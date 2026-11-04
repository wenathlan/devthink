/**
 * render — consolidated render engine logics of the debonair family.
 * @module render
 * @family wave/logicfold2
 * One keyed file per family: the former variant arms (renderjobs, renderworker)
 * retired into this seat with every export preserved under the same name.
 */

import { ArrangerRole } from "./arrangement.ts";
import { DEFAULT_MIX_LAW, NOISE_SECONDS, RENDER_TAIL_S, ROLE_TRIM, VOICE_RECIPES, seededNoiseChannel } from "./audio.ts";
import { mintid } from "./bigintids.ts";
import { db } from "./db.ts";
import { FormantEvent, Vowel, renderFormantPhrase } from "./formant.ts";
import { hashSeed, mulberry32 } from "./harmonyengine.ts";
import { MASTERING, trackNameFromPrompt } from "./katexis.ts";
import { limitTruePeak } from "./limiter.ts";
import { dbToLinear } from "./mixergraph.ts";
import { DRUM_LANE_KEYS, LANE_STEPS, PATTERN_SCHEMA_VERSION, PatternProject, PatternVoice, parsePattern, validatePatternProject } from "./pattern.ts";
import { WorkerModality } from "./sandboxmodality.ts";
import { NoteEvent } from "./take.ts";
import { midiToHz } from "./tuning.ts";
import { sungLineOf } from "./vocalsynth.ts";
import { encodeWav } from "./wavwriter.ts";

/* ===== block: renderjobs ===== */
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

/* ===== block: renderworker ===== */
// # renderworker — the server render job of the generation lane (root
// layer, the pipeline waves PV4.002 and PV4.003): the composed plan (a
// debonair.pattern/1 PatternProject, the composer's answer) renders offline
// into real wav bytes entirely outside the visitor's browser. the walk is
// the pipeline's own: schedule (the plan folds onto the flat time-ascending
// NoteEvent list the takeevents contract names — the drum lanes each bar,
// every note at its step, the sixteenth grid at 60/(bpm*4) seconds), render
// (the engine's own recipes driven sample-accurately at the 48 khz rate the
// MASTERING spec pins — the kick 808 pitch dive, the noise snare and hats,
// the bass sub, the detuned pad, the vibrato lead, every number read from
// the VOICE_RECIPES table of the audioengine section of audio.ts,
// never re-implemented: the browser VoiceBank and this lane read the one
// source, so the desk and the bounce cannot drift), encode (the wavwriter,
// mono pcm 16 — the reference's wav
// law), store (the blob store put under audio/wav). determinism is total:
// the same plan and seed answer the same bytes (the seeded noise rides the
// take identity through the audioengine section's own seededNoiseChannel — the same
// stream the browser bank reads). the mix law rides the desk's own default
// faders and master trim (DEFAULT_MIX_LAW); the glue compressor stays the
// browser desk's — the webaudio compressor is deliberately ua-tailored, so
// the offline bounce pins the linear master mix that stays byte-stable on
// every machine — closed by the engine's own deterministic true-peak
// limiter (limiter.ts, the −1 dBTP ceiling the MASTERING spec pins, the
// promise the stage card makes), the one mastering stage the published
// bounce must honour on every machine alike. the honest WYSIWYG gap,
// documented never hidden: the desk the visitor hears rides the
// ua-tailored glue compressor without a true-peak ceiling (a deterministic
// browser limiter needs an audio worklet — its own wave), the bounce adds
// the ceiling; the difference is the render lane's law, not a pretence.
// the job lane mirrors the ingest worker's discipline: the
// db never imports here — the ledger and the track row ride injected seats
// (renderjobs.ts binds them to sqlite; the gateway stack binds the routes),
// every call answers a typed result with a machine code, never a throw.
// zero consumer data.
















// ---------------------------------------------------------------------------
// the render lane constants (the mastering law)
// ---------------------------------------------------------------------------

/** The house rate the MASTERING spec pins — every render bounces here. */
export const RENDER_SAMPLE_RATE = MASTERING.sampleRateHz;

/** The bounce depth: mono pcm 16 (the reference's wav export law). */
export const RENDER_BIT_DEPTH = 16 as const;

/** The blob kind of the rendered wav (the mime the playback lane streams). */
export const RENDER_WAV_KIND = "audio/wav";

/** The drum gate the schedule bridge hands the percussive lanes (the
 * takeevents law — the recipes carry their own envelopes, the gate is the
 * nominal seat). */
const DRUM_GATE_SECONDS = 0.12;

/** The pipeline phases of one render, in the law order (the ledger row and
 * the progress callback speak these names). */
export const RENDER_PHASES: readonly RenderPhase[] = ["schedule", "render", "encode", "store"];

/** One phase of the render pipeline. */
export type RenderPhase = "schedule" | "render" | "encode" | "store";

/** The sandbox modality this worker's walk declares (wave PV6.003): the
 * honest default is "local" — the offline render runs in the deploy's own
 * process and this module never spawns anything itself. the declaration
 * is the contract the deploy reads: a deploy that opts the heavy render
 * onto a saddle modality pins DEBONAIR_WORKER_MODALITY (one of the
 * sandboxmodality vocabulary's saddle ids) and the platform resolves the
 * sandbox — this file only names the lane's truth (opt-in per deploy,
 * never a silent switch). */
export const RENDER_WORKER_MODALITY: WorkerModality = "local";

// ---------------------------------------------------------------------------
// the blob store seam (the store wave's contract, structural)
// ---------------------------------------------------------------------------

/** One content-addressed blob pointer — the row the store answers on put.
 * The shape mirrors the blob store wave's own pointer (id, bytes, sha256,
 * kind, storedAt): the real store satisfies this seam structurally, so the
 * stack merge wires it without a shim. */
export interface RenderBlobPointer {
  /** The minted 64-bit blob id, decimal string form. */
  id: string;
  /** The byte count of the blob. */
  bytes: number;
  /** The store-computed sha256 hex digest of the bytes. */
  sha256: string;
  /** The bare mime the caller declared ("audio/wav"). */
  kind: string;
  /** The iso instant the store accepted the bytes. */
  storedAt?: string;
}

/** The typed put answer of the store seam — never a throw (a hostile store
 * answers the error branch; the worker guards a throw besides). */
export type RenderStorePut = { ok: true; pointer: RenderBlobPointer } | { ok: false; code: string; message: string };

/** The storage seam the render lane rides: one put call, the same contract
 * the blob store wave owns (put(data, kind) answers the pointer of the
 * stored bytes). The memory mirror, the file lane and the gateway seam all
 * satisfy it structurally. */
export interface RenderBlobStore {
  /** Stores bytes under a freshly minted pointer; the digest is computed
   * by the store itself, never trusted from the caller. */
  put(data: Uint8Array, kind: string): Promise<RenderStorePut>;
}

// ---------------------------------------------------------------------------
// the typed results (machine codes, never a throw)
// ---------------------------------------------------------------------------

/** The machine codes the render answers: the silent plan (empty-plan), the
 * render or encode refusal (render-failed — a plan off the contract or a
 * writer refusal rides here with the reason), the store refusal
 * (store-failed). */
export type RenderErrorCode = "empty-plan" | "render-failed" | "store-failed";

/** The typed renderPlan answer — ok carries the pointer, the bytes and the
 * rendered duration; the error branch carries the machine code. */
export type RenderPlanResult =
  | { ok: true; wavPointer: RenderBlobPointer; bytes: Uint8Array; durationSeconds: number }
  | { ok: false; code: RenderErrorCode; message: string };

/** One progress report: the phase that just landed and the completed share
 * of the walk (0..1, ascending). */
export interface RenderJobProgress {
  /** The phase that completed. */
  phase: RenderPhase;
  /** The completed share of the pipeline. */
  fraction: number;
}

/** The progress callback — a hostile throw never breaks the job. */
export type RenderProgressCallback = (progress: RenderJobProgress) => void;

// ---------------------------------------------------------------------------
// the schedule bridge (the plan folds onto the engine's event list)
// ---------------------------------------------------------------------------

/** The voice seat of the pattern vocabulary: which recipe lane and which
 * role bus each PatternVoice renders on. The engine's own dispatch law
 * decides: the melodic seats (lead, pluck, bell, arp, flute) ride the
 * vibrato lead recipe, the keys and pad seats ride the detuned pad recipe
 * (the engine's keys seat IS the pad), the bass rides the bass recipe. */
const VOICE_SEAT: Record<PatternVoice, { lane: string; role: ArrangerRole }> = {
  lead: { lane: "lead", role: "lead" },
  pluck: { lane: "lead", role: "lead" },
  keys: { lane: "keys", role: "keys" },
  bell: { lane: "lead", role: "lead" },
  arp: { lane: "lead", role: "lead" },
  flute: { lane: "lead", role: "lead" },
  bass: { lane: "bass", role: "bass" },
  pad: { lane: "keys", role: "keys" },
};

/** The scheduled plan: the flat time-ascending event list (the takeevents
 * NoteEvent contract, reused verbatim) beside the take's musical span. */
export interface PatternSchedule {
  /** Every note event, time-ascending. */
  events: readonly NoteEvent[];
  /** The take's musical span in seconds — the bars law (bars * 240 / bpm),
   * widened honestly when a note line onsets past the last bar. */
  duration: number;
  /** The sixteenth step in seconds (60 / (bpm * 4)). */
  stepSeconds: number;
}

/**
 * Folds a pattern project onto the flat note event list — the bridge
 * between the composer's plan and the engine's recipes. The drum lanes
 * loop each bar exactly as the plan carries them (a hit at a step answers
 * one drums-role event, the binary lane at full velocity); every note
 * lands at its step on the sixteenth grid with its voice's recipe lane and
 * role bus. Pure, deterministic, zero audio.
 *
 * @param plan the validated pattern project.
 * @returns the schedule (the events, the span, the step seconds).
 */
export function schedulePattern(plan: PatternProject): PatternSchedule {
  const stepSeconds = 60 / (plan.bpm * 4);
  const events: NoteEvent[] = [];
  for (let bar = 0; bar < plan.bars; bar++) {
    const barStart = bar * LANE_STEPS;
    for (const key of DRUM_LANE_KEYS) {
      const lane = plan.drums[key];
      for (let step = 0; step < LANE_STEPS; step++) {
        if ((lane[step] ?? 0) !== 1) continue;
        events.push({
          lane: key,
          role: "drums",
          time: (barStart + step) * stepSeconds,
          seconds: DRUM_GATE_SECONDS,
          velocity: 1,
          midi: 0,
        });
      }
    }
  }
  for (const note of plan.notes) {
    const seat = VOICE_SEAT[note.voice];
    events.push({
      lane: seat.lane,
      role: seat.role,
      time: note.step * stepSeconds,
      seconds: note.dur * stepSeconds,
      velocity: note.vel,
      midi: note.pitch,
    });
  }
  events.sort((left, right) => left.time - right.time);
  const barsSpan = plan.bars * LANE_STEPS * stepSeconds;
  const lastOnset = events.length > 0 ? events[events.length - 1].time : 0;
  return { events, duration: Math.max(barsSpan, lastOnset), stepSeconds };
}

// ---------------------------------------------------------------------------
// the dsp primitives (the webaudio automation and filter laws, closed form)
// ---------------------------------------------------------------------------

/** The exponential ramp of the webaudio automation law: v(t) = from *
 * (to/from)^(dt/seconds), holding the end values outside the span. */
function expRampOf(from: number, to: number, dt: number, seconds: number): number {
  if (dt <= 0) return from;
  if (dt >= seconds) return to;
  return from * (to / from) ** (dt / seconds);
}

/** The linear ramp of the webaudio automation law, holding the ends. */
function linearRampOf(from: number, to: number, dt: number, seconds: number): number {
  if (dt <= 0) return from;
  if (dt >= seconds) return to;
  return from + ((to - from) * dt) / seconds;
}

/** The set-target curve of the webaudio automation law: target + (from -
 * target) * exp(-dt/tc). */
function targetOf(target: number, from: number, dt: number, tc: number): number {
  if (dt <= 0) return from;
  return target + (from - target) * Math.exp(-dt / tc);
}

/** One running biquad filter — the rbj coefficients of the webaudio
 * biquad's transfer function (the spec-pinned response), direct form 1. */
interface BiquadFilter {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

/**
 * Builds one biquad filter voice — the rbj cookbook coefficients of the
 * webaudio biquad law (the same transfer function the browser node pins,
 * q the recipes carry or the node's default 1).
 *
 * @param type the filter family: lowpass, highpass or bandpass.
 * @param hz the cutoff frequency.
 * @param q the resonance (the webaudio default is 1).
 * @param sampleRate the render rate.
 * @returns the primed filter (zero state).
 */
function biquadOf(type: "lowpass" | "highpass" | "bandpass", hz: number, q: number, sampleRate: number): BiquadFilter {
  const omega = (2 * Math.PI * hz) / sampleRate;
  const cos = Math.cos(omega);
  const alpha = Math.sin(omega) / (2 * q);
  const a0 = 1 + alpha;
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  if (type === "lowpass") {
    b0 = (1 - cos) / 2;
    b1 = 1 - cos;
    b2 = (1 - cos) / 2;
  } else if (type === "highpass") {
    b0 = (1 + cos) / 2;
    b1 = -(1 + cos);
    b2 = (1 + cos) / 2;
  } else {
    // the constant-peak bandpass the webaudio spec pins
    b0 = alpha;
    b1 = 0;
    b2 = -alpha;
  }
  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: (-2 * cos) / a0,
    a2: (1 - alpha) / a0,
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  };
}

/** Steps one biquad over one input sample (direct form 1). */
function runBiquad(filter: BiquadFilter, x: number): number {
  const y =
    filter.b0 * x + filter.b1 * filter.x1 + filter.b2 * filter.x2 - filter.a1 * filter.y1 - filter.a2 * filter.y2;
  filter.x2 = filter.x1;
  filter.x1 = x;
  filter.y2 = filter.y1;
  filter.y1 = y;
  return y;
}

/** The sawtooth voice of the webaudio oscillator law (phase in [0,1)). */
function sawOf(phase: number): number {
  return 2 * phase - 1;
}

/** The square voice of the webaudio oscillator law. */
function squareOf(phase: number): number {
  return phase < 0.5 ? 1 : -1;
}

/** The triangle voice of the webaudio oscillator law. */
function triangleOf(phase: number): number {
  return (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * phase));
}

/** Reads the shared noise take at one instant — the buffer source's own
 * law: one second of seeded noise, silence past its end. */
function noiseAt(noise: Float32Array, dt: number, sampleRate: number): number {
  if (dt < 0 || dt >= NOISE_SECONDS) return 0;
  return noise[Math.min(noise.length - 1, Math.floor(dt * sampleRate))] ?? 0;
}

// ---------------------------------------------------------------------------
// the recipe voices (every number read from the VOICE_RECIPES table)
// ---------------------------------------------------------------------------

/** The 808 kick: the pitch envelope dives, the gain decays, the source
 * stops where the recipe says. */
function addKick(mix: Float32Array, sampleRate: number, start: number, velocity: number, gain: number): void {
  const recipe = VOICE_RECIPES.kick;
  const end = Math.min(mix.length, start + Math.ceil(recipe.stopSeconds * sampleRate));
  let phase = 0;
  for (let i = start; i < end; i++) {
    const dt = (i - start) / sampleRate;
    const freq =
      dt < recipe.pitchSeconds
        ? recipe.pitchFromHz * (recipe.pitchToHz / recipe.pitchFromHz) ** (dt / recipe.pitchSeconds)
        : recipe.pitchToHz;
    phase = (phase + freq / sampleRate) % 1;
    const env = expRampOf(velocity, 0.0001, dt, recipe.gainSeconds);
    mix[i] += Math.sin(2 * Math.PI * phase) * env * gain;
  }
}

/** The noise snare: the bandpass burst beside the triangle body, each
 * branch with its own envelope and stop. */
function addSnare(
  mix: Float32Array,
  sampleRate: number,
  start: number,
  velocity: number,
  gain: number,
  noise: Float32Array,
): void {
  const recipe = VOICE_RECIPES.snare;
  const noiseEnd = Math.min(mix.length, start + Math.ceil(recipe.noiseStopSeconds * sampleRate));
  const band = biquadOf("bandpass", recipe.bandHz, recipe.bandQ, sampleRate);
  for (let i = start; i < noiseEnd; i++) {
    const dt = (i - start) / sampleRate;
    const env = expRampOf(velocity * recipe.noiseGain, 0.0001, dt, recipe.noiseSeconds);
    mix[i] += runBiquad(band, noiseAt(noise, dt, sampleRate)) * env * gain;
  }
  const bodyEnd = Math.min(mix.length, start + Math.ceil(recipe.bodyStopSeconds * sampleRate));
  let phase = 0;
  for (let i = start; i < bodyEnd; i++) {
    const dt = (i - start) / sampleRate;
    phase = (phase + recipe.bodyHz / sampleRate) % 1;
    const env = expRampOf(velocity * recipe.bodyGain, 0.0001, dt, recipe.bodySeconds);
    mix[i] += triangleOf(phase) * env * gain;
  }
}

/** The clap: the tighter bandpass burst. */
function addClap(
  mix: Float32Array,
  sampleRate: number,
  start: number,
  velocity: number,
  gain: number,
  noise: Float32Array,
): void {
  const recipe = VOICE_RECIPES.clap;
  const end = Math.min(mix.length, start + Math.ceil(recipe.stopSeconds * sampleRate));
  const band = biquadOf("bandpass", recipe.bandHz, recipe.bandQ, sampleRate);
  for (let i = start; i < end; i++) {
    const dt = (i - start) / sampleRate;
    const env = expRampOf(velocity * recipe.noiseGain, 0.0001, dt, recipe.noiseSeconds);
    mix[i] += runBiquad(band, noiseAt(noise, dt, sampleRate)) * env * gain;
  }
}

/** The hat seat: the highpass tick at the recipe's decay. */
function addHat(
  mix: Float32Array,
  sampleRate: number,
  start: number,
  velocity: number,
  gain: number,
  noise: Float32Array,
  decaySeconds: number,
  stopPadSeconds: number,
  hatGain: number,
  highHz: number,
): void {
  const end = Math.min(mix.length, start + Math.ceil((decaySeconds + stopPadSeconds) * sampleRate));
  const high = biquadOf("highpass", highHz, 1, sampleRate);
  for (let i = start; i < end; i++) {
    const dt = (i - start) / sampleRate;
    const env = expRampOf(velocity * hatGain, 0.0001, dt, decaySeconds);
    mix[i] += runBiquad(high, noiseAt(noise, dt, sampleRate)) * env * gain;
  }
}

/** The bass: the sub sine under the triangle an octave up through the
 * lowpass, the attack-sustain-release gate closing after the note. */
function addBass(mix: Float32Array, sampleRate: number, start: number, event: NoteEvent, gain: number): void {
  const recipe = VOICE_RECIPES.bass;
  const end = Math.min(mix.length, start + Math.ceil((event.seconds + recipe.stopPadSeconds) * sampleRate));
  const lowpass = biquadOf("lowpass", recipe.lowpassHz, 1, sampleRate);
  const attackEnd = event.velocity * recipe.attackPeak;
  const sustain = event.velocity * recipe.sustainLevel;
  const gateValue =
    event.seconds > recipe.attackSeconds
      ? targetOf(sustain, attackEnd, event.seconds - recipe.attackSeconds, recipe.sustainTcSeconds)
      : expRampOf(0.0001, attackEnd, event.seconds, recipe.attackSeconds);
  let subPhase = 0;
  let midPhase = 0;
  for (let i = start; i < end; i++) {
    const dt = (i - start) / sampleRate;
    subPhase = (subPhase + midiToHz(event.midi) / sampleRate) % 1;
    midPhase = (midPhase + midiToHz(event.midi + recipe.midSemitones) / sampleRate) % 1;
    let env: number;
    if (dt < recipe.attackSeconds) env = expRampOf(0.0001, attackEnd, dt, recipe.attackSeconds);
    else if (dt < event.seconds) env = targetOf(sustain, attackEnd, dt - recipe.attackSeconds, recipe.sustainTcSeconds);
    else env = targetOf(0.0001, gateValue, dt - event.seconds, recipe.releaseTcSeconds);
    const voice = Math.sin(2 * Math.PI * subPhase) + triangleOf(midPhase);
    mix[i] += runBiquad(lowpass, voice) * env * gain;
  }
}

/** The detuned pad: the two saws around the pitch through the lowpass,
 * the slow swell, the slow release. */
function addPad(mix: Float32Array, sampleRate: number, start: number, event: NoteEvent, gain: number): void {
  const recipe = VOICE_RECIPES.pad;
  const end = Math.min(mix.length, start + Math.ceil((event.seconds + recipe.stopPadSeconds) * sampleRate));
  const lowpass = biquadOf("lowpass", recipe.lowpassHz, 1, sampleRate);
  const baseHz = midiToHz(event.midi);
  const leftHz = baseHz * 2 ** (-recipe.detuneCents / 1200);
  const rightHz = baseHz * 2 ** (recipe.detuneCents / 1200);
  const peak = event.velocity * recipe.gain;
  const gateValue =
    event.seconds < recipe.attackSeconds ? linearRampOf(0.0001, peak, event.seconds, recipe.attackSeconds) : peak;
  let leftPhase = 0;
  let rightPhase = 0;
  for (let i = start; i < end; i++) {
    const dt = (i - start) / sampleRate;
    leftPhase = (leftPhase + leftHz / sampleRate) % 1;
    rightPhase = (rightPhase + rightHz / sampleRate) % 1;
    let env: number;
    if (dt < recipe.attackSeconds) env = linearRampOf(0.0001, peak, dt, recipe.attackSeconds);
    else if (dt < event.seconds) env = peak;
    else env = targetOf(0.0001, gateValue, dt - event.seconds, recipe.releaseTcSeconds);
    mix[i] += runBiquad(lowpass, sawOf(leftPhase) + sawOf(rightPhase)) * env * gain;
  }
}

/** The vibrato lead: the square voice, the detune modulation, the fast
 * attack, the exponential decay over at least the recipe's floor. */
function addLead(mix: Float32Array, sampleRate: number, start: number, event: NoteEvent, gain: number): void {
  const recipe = VOICE_RECIPES.lead;
  const end = Math.min(mix.length, start + Math.ceil((event.seconds + recipe.stopPadSeconds) * sampleRate));
  const lowpass = biquadOf("lowpass", recipe.lowpassHz, 1, sampleRate);
  const baseHz = midiToHz(event.midi);
  const peak = event.velocity * recipe.gain;
  const decayEnd = Math.max(recipe.minSeconds, event.seconds);
  let phase = 0;
  for (let i = start; i < end; i++) {
    const dt = (i - start) / sampleRate;
    const detune = recipe.vibratoCents * Math.sin(2 * Math.PI * recipe.vibratoHz * dt);
    phase = (phase + (baseHz * 2 ** (detune / 1200)) / sampleRate) % 1;
    let env: number;
    if (dt < recipe.attackSeconds) env = linearRampOf(0.0001, peak, dt, recipe.attackSeconds);
    else if (dt < decayEnd) env = expRampOf(peak, 0.0001, dt - recipe.attackSeconds, decayEnd - recipe.attackSeconds);
    else env = 0.0001;
    mix[i] += runBiquad(lowpass, squareOf(phase)) * env * gain;
  }
}

/**
 * Renders one event onto the mix through its recipe — the VoiceBank's own
 * dispatch law: the drum seats, the keys seat (the engine's keys IS the
 * pad recipe), the bass and lead seats, the hat fallback for any lane the
 * engine does not name.
 *
 * @param mix the mix bus the voice adds into.
 * @param event the scheduled note.
 * @param noise the shared seeded noise take.
 */
function addVoice(mix: Float32Array, event: NoteEvent, noise: Float32Array): void {
  const sampleRate = RENDER_SAMPLE_RATE;
  const start = Math.round(event.time * sampleRate);
  if (start < 0 || start >= mix.length) return;
  const fader = DEFAULT_MIX_LAW.faders[event.role];
  const trim = ROLE_TRIM[event.role];
  // the VoiceBank's own bus law: an event whose role bus the desk does not
  // name answers nothing (never a NaN gain)
  if (fader === undefined || trim === undefined) return;
  const gain = dbToLinear(fader) * trim;
  switch (event.lane) {
    case "kick":
      addKick(mix, sampleRate, start, event.velocity, gain);
      break;
    case "snare":
      addSnare(mix, sampleRate, start, event.velocity, gain, noise);
      break;
    case "clap":
      addClap(mix, sampleRate, start, event.velocity, gain, noise);
      break;
    case "hat":
      addHat(
        mix,
        sampleRate,
        start,
        event.velocity,
        gain,
        noise,
        VOICE_RECIPES.hat.decaySeconds,
        VOICE_RECIPES.hat.stopPadSeconds,
        VOICE_RECIPES.hat.gain,
        VOICE_RECIPES.hat.highHz,
      );
      break;
    case "bass":
      addBass(mix, sampleRate, start, event, gain);
      break;
    case "keys":
      addPad(mix, sampleRate, start, event, gain);
      break;
    case "lead":
      addLead(mix, sampleRate, start, event, gain);
      break;
    default:
      addHat(
        mix,
        sampleRate,
        start,
        event.velocity,
        gain,
        noise,
        VOICE_RECIPES.fallback.decaySeconds,
        VOICE_RECIPES.fallback.stopPadSeconds,
        VOICE_RECIPES.fallback.gain,
        VOICE_RECIPES.fallback.highHz,
      );
  }
}

/**
 * Renders the whole schedule sample-accurately at the house rate — every
 * voice through its recipe onto the mix bus, the desk's default faders and
 * role trims folding each bus, the master fader and trim closing the mix
 * (the glue compressor stays the browser desk's: the webaudio compressor
 * is ua-tailored, the offline bounce pins the linear master law that stays
 * byte-stable on every machine — the true-peak ceiling is the render
 * orchestrator's close, limitTruePeak after this mix, never baked in here:
 * this function stays the pure linear mix the tests pin). The noise take
 * is the engine's own seeded channel over the take identity — the same
 * stream the browser bank reads.
 *
 * @param schedule the flat event list with its span.
 * @param seedSource the take identity the noise rng rides.
 * @returns the mono mix, the release tail included.
 */
export function renderPatternMix(schedule: PatternSchedule, seedSource: string): Float32Array {
  const noise = seededNoiseChannel(seedSource, Math.ceil(RENDER_SAMPLE_RATE * NOISE_SECONDS));
  const frames = Math.ceil((schedule.duration + RENDER_TAIL_S) * RENDER_SAMPLE_RATE);
  const mix = new Float32Array(frames);
  for (const event of schedule.events) addVoice(mix, event, noise);
  const masterGain = dbToLinear(DEFAULT_MIX_LAW.masterDb) * DEFAULT_MIX_LAW.masterTrim;
  for (let i = 0; i < frames; i++) mix[i] *= masterGain;
  return mix;
}

// ---------------------------------------------------------------------------
// the voice seat (the formant lane of the bounce — the second rung)
// ---------------------------------------------------------------------------

/** The voice bus fader the bounce's vocal seat rides (db) — its own strip
 * beside the desk's role seats (the lead bus carries the instrumental
 * melody, the voice bus carries the sung line through the formant bank). */
export const VOICE_BUS_FADER_DB = -6;

/** The vowel seats the seeded vocal line draws from (the bounce sings
 * without lyrics — the syllable lane's own text-to-vowel law answers when
 * a lyric rides; the seed decides here, the same take identity law every
 * lane rides). */
const VOWEL_SEATS: readonly Vowel[] = ["a", "e", "i", "o", "u"];

/**
 * Builds the formant events of a plan's sung line — the glue between the
 * pattern grammar and the formant lane: the sung line (sungLineOf, the
 * melody seat and the seeded phrase breathing the syllable lane owns)
 * folds onto the phrase events at the pattern's own step law (the same
 * stepSeconds the schedule bridge rides), the vowels drawn from the take
 * identity's seeded stream. Deterministic: the same plan and seed always
 * answer the same vocal line.
 *
 * @param plan the composed plan.
 * @param seed the take identity the sung line and the vowels ride.
 * @returns the formant events (empty when the plan carries no melody).
 */
export function formantEventsOf(plan: PatternProject, seed: string): FormantEvent[] {
  const sung = sungLineOf(plan, seed);
  if (sung.length === 0) return [];
  const stepSeconds = 60 / (plan.bpm * 4);
  const rng = mulberry32(hashSeed(`formant:${seed}`));
  return sung.map((note) => ({
    start: note.step * stepSeconds,
    duration: note.dur * stepSeconds,
    velocity: note.vel,
    vowels: [VOWEL_SEATS[Math.floor(rng() * VOWEL_SEATS.length)] ?? "a"],
    midi: note.pitch,
    voiced: true,
  }));
}

/**
 * Renders the bounce's vocal pcm — the sung line through the formant
 * source-filter lane at the house rate, under the voice bus fader and the
 * master law (the bus feeds the master like the role buses, the same
 * linear master gain the mix rides). The seat the renderPlan voice option
 * adds onto the linear mix before the mastering close.
 *
 * @param plan the composed plan.
 * @param seed the take identity.
 * @returns the vocal pcm, the mix's own length, zeroed when no line sings.
 */
export function renderVoiceMix(plan: PatternProject, seed: string): Float32Array {
  const events = formantEventsOf(plan, seed);
  const frames = Math.ceil((schedulePattern(plan).duration + RENDER_TAIL_S) * RENDER_SAMPLE_RATE);
  const out = new Float32Array(frames);
  if (events.length === 0) return out;
  const phrase = renderFormantPhrase(events, { sampleRate: RENDER_SAMPLE_RATE }).samples;
  const masterGain = dbToLinear(DEFAULT_MIX_LAW.masterDb) * DEFAULT_MIX_LAW.masterTrim;
  const voiceGain = dbToLinear(VOICE_BUS_FADER_DB) * masterGain;
  for (let i = 0; i < frames && i < phrase.length; i++) out[i] = (phrase[i] ?? 0) * voiceGain;
  return out;
}

/** The options the render orchestrator accepts. */
export interface RenderPlanOptions {
  /** Sings the plan's own melody line through the formant bank under the
   * voice bus (the second rung the syllable lane always named): the sung
   * line renders node-side through formant.ts's source-filter lane and
   * adds onto the linear mix before the mastering close. Hand the
   * instrumental plan — a plan singPattern already answered carries the
   * sung line on the airy lead seat too, and both buses would sound (the
   * caller owns the plan it hands). Default off: the plan's own voices
   * only, the byte-stable bounce the tests pin. */
  voice?: boolean;
}

// ---------------------------------------------------------------------------
// the orchestrator (schedule -> render -> encode -> store)
// ---------------------------------------------------------------------------

/** The readable message of any thrown failure. */
function errmsgof(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** The plan error branch builder. */
function planerr(code: RenderErrorCode, message: string): RenderPlanResult {
  return { ok: false, code, message };
}

/**
 * Renders one composed plan end to end — the pipeline's own walk: the
 * contract gate (a plan off the debonair.pattern/1 law answers
 * render-failed with the validator's reason), the schedule (the flat
 * event list; a plan with no drum hits and no notes answers empty-plan),
 * the offline render through the engine's recipes at the mastering rate
 * (with the optional formant voice bus riding its own strip under the
 * master law), closed by the true-peak limiter (the −1 dBTP mastering
 * law), the wav encode (mono pcm 16), the blob store put under audio/wav.
 * every failure answers the typed result with a machine code — never a
 * throw. deterministic: the same plan and seed answer the same bytes on
 * every machine (the seeded noise rides the take identity, the dsp is
 * pure).
 *
 * @param plan the composed plan (the composer's PatternProject).
 * @param seed the take identity — the seed the noise rng rides (the same
 *   plan with a fresh seed answers a fresh take).
 * @param store the blob store the wav lands in.
 * @param onProgress the optional progress sink (one report per completed phase).
 * @param options the render options (the formant voice bus, opt-in).
 * @returns the pointer, the bytes and the duration, or the machine code.
 */
export async function renderPlan(
  plan: PatternProject,
  seed: string,
  store: RenderBlobStore,
  onProgress?: RenderProgressCallback,
  options: RenderPlanOptions = {},
): Promise<RenderPlanResult> {
  const report = (phase: RenderPhase): void => {
    if (!onProgress) return;
    try {
      onProgress({ phase, fraction: (RENDER_PHASES.indexOf(phase) + 1) / RENDER_PHASES.length });
    } catch {
      // a hostile callback never breaks the job — the answer matters more
    }
  };

  // phase: schedule — the contract gate, then the flat event list
  const checked = validatePatternProject(plan);
  if (!checked.ok)
    return planerr("render-failed", `the plan failed its contract (${checked.code}): ${checked.message}`);
  const schedule = schedulePattern(checked.doc);
  if (schedule.events.length === 0)
    return planerr("empty-plan", "the plan carries no drum hits and no notes — nothing to render");
  report("schedule");

  // phase: render — the engine's recipes, sample-accurate at the house
  // rate, the optional formant voice bus riding its own strip under the
  // master law, then the mastering close: the linear master mix rides the
  // deterministic true-peak limiter (the −1 dBTP law the stage card
  // promises) before the wav writer ever sees a sample
  let pcm: Float32Array;
  try {
    const mix = renderPatternMix(schedule, `noise:${seed}:${checked.doc.prompt}`);
    if (options.voice) {
      const voice = renderVoiceMix(checked.doc, seed);
      for (let i = 0; i < mix.length && i < voice.length; i++) mix[i] += voice[i] ?? 0;
    }
    pcm = limitTruePeak(mix, RENDER_SAMPLE_RATE);
  } catch (error) {
    return planerr("render-failed", `the render lane faulted: ${errmsgof(error)}`);
  }
  report("render");

  // phase: encode — the wavwriter at the mastering rate, mono pcm 16
  let bytes: Uint8Array;
  try {
    bytes = encodeWav([pcm], { sampleRate: RENDER_SAMPLE_RATE, bitDepth: RENDER_BIT_DEPTH });
  } catch (error) {
    return planerr("render-failed", `the wavwriter refused the bounce: ${errmsgof(error)}`);
  }
  report("encode");

  // phase: store — the wav lands in the blob store under audio/wav
  let put: RenderStorePut;
  try {
    put = await store.put(bytes, RENDER_WAV_KIND);
  } catch (error) {
    return planerr("store-failed", `the store lane threw: ${errmsgof(error)}`);
  }
  if (!put.ok) return planerr("store-failed", `the store refused the wav: ${put.code} (${put.message})`);
  report("store");

  return {
    ok: true,
    wavPointer: put.pointer,
    bytes,
    durationSeconds: pcm.length / RENDER_SAMPLE_RATE,
  };
}

// ---------------------------------------------------------------------------
// the job ledger contract (the ingest_jobs walk law, render's own columns)
// ---------------------------------------------------------------------------

/** The states the render ledger walks (the queue registers "queued", the
 * run moves it through "rendering", the walk lands "done" or "failed"). */
export type RenderJobState = "queued" | "rendering" | "done" | "failed";

/** One render job ledger row — the render_jobs table shape: the same walk
 * law the ingest_jobs table rides with the render lane's own payload
 * columns (the queued plan json, the landed wav pointer and the track row
 * the walk stamped — the pointer chain the publish lane follows). */
export interface RenderJobRow {
  /** The minted job id (the decimal string). */
  id: string;
  /** The owner pointer (the decimal string). */
  owner_id: string;
  /** The walk state. */
  state: RenderJobState;
  /** The last completed phase (null until the run starts). */
  phase: string | null;
  /** The completed share of the walk (0..1, ascending). */
  fraction: number;
  /** The honest failure — "<code>: <message>" (null while the walk rides). */
  error: string | null;
  /** The queued plan (canonical serializePattern bytes). */
  plan_json: string;
  /** The landed wav blob id (null until the walk lands done). */
  wav_pointer: string | null;
  /** The track row the walk stamped (null until the track lane lands). */
  track_pointer: string | null;
  /** The iso instant of the registration. */
  created_at: string;
  /** The iso instant the walk landed (done or failed; null while riding). */
  finished_at: string | null;
}

/** The mutable fields of one ledger row — the walk patches these (the id,
 * the owner, the plan and the registration instant never change). */
export type RenderJobPatch = Partial<
  Pick<RenderJobRow, "state" | "phase" | "fraction" | "error" | "wav_pointer" | "track_pointer" | "finished_at">
>;

/** The job ledger seat — the render_jobs row functions behind one seam
 * (the renderjobs module binds the real sqlite functions; the tests bind a
 * temp database). The seat is synchronous on purpose: the walk's progress
 * patches land in order — a queued write must never overtake the done
 * write (the same discipline the gateway's job seat rides). */
export interface RenderJobSeat {
  /** Registers one job row (the upsert law — a re-registration refreshes). */
  putjob(row: RenderJobRow): void;
  /** Reads one job row (null when the id answers nothing). */
  getjob(id: string): RenderJobRow | null;
  /** Patches one job row (a missing id changes nothing). */
  updatejob(id: string, patch: RenderJobPatch): void;
  /** Lists the job rows, newest first (an owner filter rides when the
   * caller carries one). */
  listjobs(ownerId?: string): RenderJobRow[];
}

/** One rendered track row the walk stamps — the tracks table's own columns
 * grown with the pointer chain (the reference law of PV1.001 mirrored:
 * every row carries the owner pointer and the blob address of the wav, and
 * the visibility lane the publish wave rides: a fresh render lands private,
 * the owner's publish moves it to the vitrine). */
export interface RenderTrackRow {
  /** The minted track id (the decimal string). */
  id: string;
  /** The owner pointer (the decimal string — every row carries one). */
  ownerId: string;
  /** The display name (the prompt's first words, the house naming law). */
  name: string;
  /** The genre line (the plan's mood label). */
  genre: string;
  /** The rendered duration in seconds. */
  seconds: number;
  /** The track status ("ready" once the wav landed). */
  status: string;
  /** The blob id of the landed wav (the decimal string). */
  wavPointer: string;
  /** The visibility lane: the private shelf until the owner publishes. */
  visibility: RenderTrackVisibility;
  /** The iso instant of the stamp. */
  createdAt: string;
}

/** The visibility lanes a rendered track row walks — the same law the
 * ingest documents ride (private | vitrine): a fresh render lands private,
 * the owner's publish moves it onto the vitrine where the public list
 * serves it. */
export type RenderTrackVisibility = "private" | "vitrine";

/** The typed answer of one db lane insert — never a throw (a throwing
 * seat answers through the walk's guard). */
export type RenderDbAnswer = { ok: true } | { ok: false; code: string; message: string };

/** The track row seat — the db seam the walk stamps the track through
 * (the ingest worker's own handle law: the worker stays pure of any
 * database import, the wiring lane binds the table). */
export interface RenderTrackSeat {
  /** Inserts one rendered track row (parameter binding only, the house
   * database law). */
  puttrackrow(row: RenderTrackRow): Promise<RenderDbAnswer>;
}

// ---------------------------------------------------------------------------
// the job walk (the caller loop drives it; the gateway binds the routes)
// ---------------------------------------------------------------------------

/** The environment the walk rides — all injected, the handlers pure over
 * it (the gateway's own env law; the route binding lands with the gateway
 * stack). */
export interface RenderEnv {
  /** The blob store the wav lands in. */
  store: RenderBlobStore;
  /** The render job ledger seat. */
  jobs: RenderJobSeat;
  /** The track row seat, or null when the lane runs store-only. */
  tracks: RenderTrackSeat | null;
  /** The iso clock the registrations and the finishes stamp. */
  now: () => string;
}

/** The machine codes the walk answers: the ledger codes first (not-found,
 * conflict, ledger-failed), the render codes last (bad-plan, the
 * renderPlan codes passthrough, the track stamp). */
export type RenderRunErrorCode =
  | "not-found" // no job row answers the id
  | "conflict" // the row's state refuses the move (the walk is one-shot)
  | "bad-plan" // the queued payload fails the pattern contract
  | "empty-plan" // the plan carries nothing renderable
  | "render-failed" // the render or the encode refused
  | "store-failed" // the blob store refused the wav
  | "track-failed" // the track lane refused the row
  | "ledger-failed"; // the ledger seat refused a patch

/** The typed walk answer — ok carries the landed take (the wav pointer,
 * the byte count, the duration, the track id), the error branch carries
 * the machine code. never a throw. */
export type RenderJobRun =
  | {
      ok: true;
      jobId: string;
      state: "done";
      wavPointer: string;
      bytes: number;
      durationSeconds: number;
      trackId: string | null;
    }
  | { ok: false; code: RenderRunErrorCode; message: string };

/** The run error branch builder. */
function runerr(code: RenderRunErrorCode, message: string): RenderJobRun {
  return { ok: false, code, message };
}

/**
 * Starts one queued render job — the caller lane (the gateway worker
 * loop) hands the job id and this function walks the render end to end
 * with the ledger row riding along: the state moves queued → rendering,
 * every completed phase patches the phase and the ascending fraction (the
 * render's own report), the wav lands in the blob store, the track row
 * lands with the pointers (after the bytes — never a row that points at
 * missing bytes) and the walk lands done with the wav pointer or failed
 * with the honest error code ("<code>: <message>"). the take identity is
 * the job id itself — one job, one deterministic take (a fresh take
 * queues a fresh job, the same law the one-shot walk rides). never a
 * throw; a re-run of a landed job answers conflict.
 *
 * @param env the injected environment (the store, the seats, the clock).
 * @param jobId the queued job the caller lane registered.
 * @returns the landed take, or the machine code of the refusing lane.
 */
export async function startRenderJob(env: RenderEnv, jobId: string): Promise<RenderJobRun> {
  let row: RenderJobRow | null;
  try {
    row = env.jobs.getjob(jobId);
  } catch (error) {
    return runerr("ledger-failed", `the ledger refused the read: ${errmsgof(error)}`);
  }
  if (row === null) return runerr("not-found", `no job answers ${jobId}`);
  if (row.state !== "queued") {
    return runerr("conflict", `the job ${jobId} is ${row.state} — only a queued job starts`);
  }
  try {
    env.jobs.updatejob(jobId, { state: "rendering", fraction: 0 });
  } catch (error) {
    return runerr("ledger-failed", `the ledger refused the rendering patch: ${errmsgof(error)}`);
  }
  const fail = (code: RenderRunErrorCode, message: string): RenderJobRun => {
    try {
      env.jobs.updatejob(jobId, { state: "failed", error: `${code}: ${message}`, finished_at: env.now() });
    } catch {
      // a hostile ledger never breaks the answer — the failure lands in the run
    }
    return runerr(code, message);
  };

  // the queued payload: the canonical pattern json the composer serialized
  const parsed = parsePattern(row.plan_json);
  if (!parsed.ok) {
    return fail("bad-plan", `the queued payload failed the pattern contract (${parsed.code}): ${parsed.message}`);
  }
  if (parsed.doc.schema !== PATTERN_SCHEMA_VERSION) {
    return fail("bad-plan", "the queued payload is not a debonair.pattern/1 project");
  }
  const plan = parsed.doc;

  // the run: the job id is the take identity (one job, one take)
  const result = await renderPlan(plan, jobId, env.store, (progress) => {
    try {
      env.jobs.updatejob(jobId, { phase: progress.phase, fraction: progress.fraction });
    } catch {
      // a hostile ledger never breaks the run — the answer matters more
    }
  });
  if (!result.ok) return fail(result.code, result.message);

  // the track row lands after the bytes (never a row that points at
  // missing bytes), the owner pointer and the wav address riding along
  const track: RenderTrackRow = {
    id: mintid(),
    ownerId: row.owner_id,
    name: trackNameFromPrompt(plan.prompt) || plan.mood || "untitled",
    genre: plan.mood,
    seconds: Math.round(result.durationSeconds),
    status: "ready",
    wavPointer: result.wavPointer.id,
    visibility: "private",
    createdAt: env.now(),
  };
  if (env.tracks !== null) {
    let answer: RenderDbAnswer;
    try {
      answer = await env.tracks.puttrackrow(track);
    } catch (error) {
      return fail("track-failed", `the track lane threw: ${errmsgof(error)}`);
    }
    if (!answer.ok) return fail("track-failed", `the track lane refused the row: ${answer.code} (${answer.message})`);
  }
  try {
    env.jobs.updatejob(jobId, {
      state: "done",
      fraction: 1,
      wav_pointer: result.wavPointer.id,
      track_pointer: env.tracks === null ? null : track.id,
      finished_at: env.now(),
    });
  } catch (error) {
    return runerr(
      "ledger-failed",
      `the ledger refused the done stamp (the wav ${result.wavPointer.id} landed): ${errmsgof(error)}`,
    );
  }
  return {
    ok: true,
    jobId,
    state: "done",
    wavPointer: result.wavPointer.id,
    bytes: result.bytes.length,
    durationSeconds: result.durationSeconds,
    trackId: env.tracks === null ? null : track.id,
  };
}
