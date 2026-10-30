// # ingestdb — the node/sqlite half of the ingest store: the rows the
// gateway serves the browser layer (ingeststore.ts) read and write here.
// better-sqlite3 through the db.ts helpers, every statement prepared and
// parameterized — no sql is ever assembled by string concatenation (the
// house database law). The document rides its column as canonical json;
// the pattern miner later reads the same json the browser shelf shows.
//
// The reference law of the pipeline wave PV1.001: every row carries the
// owner pointer (a bigintids mint — the user ingest and the system ia
// ingest stamp the same column), the kind, the visibility, the blob
// addresses of the mix and the stems, the size and the content hash. The
// 64-bit pointers bind as bigints and read back through a text cast — the
// decimal string form the db columns and the api carry, exact beyond the
// js number floor (a plain number read would round a minted id). An
// old-shape database (the PV0 table) migrates in place: the alter path
// adds the missing columns with the law's defaults, no row is ever
// destroyed, no value is ever rewritten.

import { db, execute, queryAll, queryOne } from "./db.ts";
import type { IngestDocument } from "./ingest.ts";
import { INGEST_SCHEMA_VERSION } from "./ingest.ts";
import type { GenreProfile } from "./patternminer.ts";
import { serializeProfile } from "./patternminer.ts";

/** The document kinds the reference law names: the references the pattern
 * miner reads, the renders the composer stores, the uploads the bench
 * ingests. */
export type IngestKind = "reference" | "render" | "upload";

/** The visibility lanes the shelf law names: a private row answers only
 * its owner, a vitrine row surfaces the public shelf. */
export type IngestVisibility = "private" | "vitrine";

/** The machine readable failure codes of the ingest store: a malformed
 * owner mint (bad-owner), a kind off the enum (bad-kind), a visibility off
 * the lanes (bad-visibility), a blob address that is not a minted-shape
 * pointer (bad-pointer). */
export type IngestDbErrorCode = "bad-owner" | "bad-kind" | "bad-visibility" | "bad-pointer";

/** The typed ingest store failure, traceable to a machine code. */
export class IngestDbError extends Error {
  /** Machine readable failure code. */
  readonly code: IngestDbErrorCode;

  constructor(code: IngestDbErrorCode, message?: string) {
    super(message ?? `ingestdb ${code}`);
    this.name = "IngestDbError";
    this.code = code;
  }
}

/** One ingest row as the sqlite table holds it — the columns of the PV0
 * shape plus the reference-law columns of PV1.001. The 64-bit pointers
 * read in the decimal string form (the form the api carries): the cells
 * cast to text on read so the value stays exact beyond the js number
 * floor. */
export interface IngestRow {
  id: string;
  name: string;
  durationseconds: number;
  samplerate: number;
  pcmhash: number;
  ingestedat: string;
  docjson: string;
  /** The owner pointer, a bigintids mint in decimal form; the pre-law
   * rows carry the zero epoch marker (owner 0 — the migration fill, never
   * a fresh write, which must carry a real mint). */
  owner_id: string;
  /** The document kind: reference | render | upload. */
  kind: IngestKind;
  /** The visibility lane: private | vitrine. */
  visibility: IngestVisibility;
  /** The blob store id of the mix wav, decimal form; null before the
   * blob store wave lands its pointers. */
  mix_pointer: string | null;
  /** The blob store id of the stems bundle, decimal form; nullable alike. */
  stems_pointer: string | null;
  /** The stored byte size of the content. */
  size_bytes: number;
  /** The sha256 of the stored content, hex; empty until the blob wave. */
  sha256: string;
}

/** The storage fields every write stamps (the reference law of PV1.001).
 * The owner pointer and the kind are required; the visibility defaults to
 * private, the blob pointers to null, the size to 0 and the hash to the
 * empty string — the blob store wave fills the pointers when it lands. */
export interface IngestStorage {
  /** The owner id — a bigintids mint, decimal string form, never null. */
  ownerId: string;
  /** The document kind. */
  kind: IngestKind;
  /** The visibility lane; defaults to "private". */
  visibility?: IngestVisibility;
  /** The blob store id of the mix wav, decimal string; null until stored. */
  mixPointer?: string | null;
  /** The blob store id of the stems bundle, decimal string; nullable alike. */
  stemsPointer?: string | null;
  /** The stored byte size; defaults to 0. */
  sizeBytes?: number;
  /** The sha256 of the stored content, hex; defaults to the empty string. */
  sha256?: string;
}

/** The kinds the write accepts — the one place the enum lives. */
const KINDS: readonly IngestKind[] = ["reference", "render", "upload"];

/** The visibilities the write accepts. */
const VISIBILITIES: readonly IngestVisibility[] = ["private", "vitrine"];

/** The mint ceiling — a 64-bit pointer never reaches the signed rail of
 * the sqlite integer storage (2^63). */
const POINTER_MAX = 1n << 63n;

/** The decimal shape every mint produces (the bigintids law). */
const DECIMAL = /^[0-9]+$/;

/**
 * Parses one decimal pointer (the owner id or a blob address) into the
 * exact bind value. Zero is the pre-law epoch marker the migration fills
 * — a fresh write never carries it; anything off the decimal shape or
 * above the 64-bit rail throws the typed error of its column.
 *
 * @param code the failure code of the column (bad-owner | bad-pointer).
 * @param value the decimal string the caller passed.
 * @returns the exact bigint bind.
 * @throws IngestDbError when the value is not a minted-shape pointer.
 */
function pointerof(code: "bad-owner" | "bad-pointer", value: string): bigint {
  if (typeof value !== "string" || !DECIMAL.test(value)) throw new IngestDbError(code);
  let parsed: bigint;
  try {
    parsed = BigInt(value);
  } catch {
    throw new IngestDbError(code);
  }
  if (parsed <= 0n || parsed >= POINTER_MAX) throw new IngestDbError(code);
  return parsed;
}

/**
 * Parses one optional blob address: the null absence binds null, a
 * present value must answer the minted shape.
 *
 * @param code the failure code of the column (bad-pointer).
 * @param value the decimal string or the null absence.
 * @returns the exact bigint bind, or null.
 * @throws IngestDbError when a present value is not a minted-shape pointer.
 */
function optionalpointer(code: "bad-pointer", value: string | null | undefined): bigint | null {
  if (value === null || value === undefined) return null;
  return pointerof(code, value);
}

/** The create statement of the full reference-law shape — a fresh
 * database gets every column in one statement, with the same names and
 * the same defaults the alter path below adds to an old-shape table. */
const CREATE_INGEST_DOCUMENTS = `
    CREATE TABLE IF NOT EXISTS ingest_documents (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      durationseconds REAL NOT NULL DEFAULT 0,
      samplerate      INTEGER NOT NULL DEFAULT 0,
      pcmhash         INTEGER NOT NULL DEFAULT 0,
      ingestedat      TEXT NOT NULL,
      docjson         TEXT NOT NULL,
      owner_id        BIGINT NOT NULL DEFAULT 0,
      kind            TEXT NOT NULL DEFAULT 'upload',
      visibility      TEXT NOT NULL DEFAULT 'private',
      mix_pointer     BIGINT,
      stems_pointer   BIGINT,
      size_bytes      INTEGER NOT NULL DEFAULT 0,
      sha256          TEXT NOT NULL DEFAULT ''
    );
  `;

/** The reference-law columns the migration adds to an old-shape table
 * (the PV0 shape) — one fixed alter statement per column, the same
 * defaults the create path carries. The pre-law rows keep their data and
 * gain the law's fills: owner 0 (the pre-identity epoch marker — the
 * migration never fabricates an identity the rows never had), kind
 * "upload" (the bench ingests of the PV0 wave were human uploads),
 * visibility "private", null pointers, zero size, empty hash. */
const UPGRADE_COLUMNS: readonly { column: string; ddl: string }[] = [
  { column: "owner_id", ddl: "ALTER TABLE ingest_documents ADD COLUMN owner_id BIGINT NOT NULL DEFAULT 0" },
  { column: "kind", ddl: "ALTER TABLE ingest_documents ADD COLUMN kind TEXT NOT NULL DEFAULT 'upload'" },
  { column: "visibility", ddl: "ALTER TABLE ingest_documents ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'" },
  { column: "mix_pointer", ddl: "ALTER TABLE ingest_documents ADD COLUMN mix_pointer BIGINT" },
  { column: "stems_pointer", ddl: "ALTER TABLE ingest_documents ADD COLUMN stems_pointer BIGINT" },
  { column: "size_bytes", ddl: "ALTER TABLE ingest_documents ADD COLUMN size_bytes INTEGER NOT NULL DEFAULT 0" },
  { column: "sha256", ddl: "ALTER TABLE ingest_documents ADD COLUMN sha256 TEXT NOT NULL DEFAULT ''" },
];

/**
 * Brings the ingest_documents table of any better-sqlite3 handle to the
 * reference law shape: the create statement lands the table when absent,
 * then the alter path adds every column an old-shape table lacks.
 * Migration in place — no row is ever destroyed, no value is ever
 * rewritten. DDL only: the statements are constants, zero parameters,
 * zero interpolation — the same shape the db.ts schema rides.
 *
 * @param target the database handle (the app db or a test database).
 */
export function migrateingestschema(target: typeof db): void {
  target.exec(CREATE_INGEST_DOCUMENTS);
  const standing = target.pragma("table_info(ingest_documents)") as { name: string }[];
  const carried = new Set(standing.map((column) => column.name));
  for (const upgrade of UPGRADE_COLUMNS) {
    if (!carried.has(upgrade.column)) target.exec(upgrade.ddl);
  }
}

/**
 * Ensures the ingest_documents table exists at the reference law shape
 * (the store creates its own table so the schema stays layered — the
 * seed never depends on it; an old-shape table upgrades in place).
 */
export function ensureingestschema(): void {
  migrateingestschema(db);
}

/**
 * Inserts one ingest document (or replaces the row of the same id) with
 * the reference-law storage fields stamped end to end.
 *
 * @param id the record id the caller assigned.
 * @param doc the parametrized document (schema debonair.ingest/1).
 * @param storage the owner pointer, the kind, the visibility, the blob
 * addresses, the size and the content hash of PV1.001.
 * @throws IngestDbError bad-owner, bad-kind, bad-visibility or bad-pointer.
 */
export function puttingest(id: string, doc: IngestDocument, storage: IngestStorage): void {
  const owner = pointerof("bad-owner", storage.ownerId);
  if (!KINDS.includes(storage.kind)) throw new IngestDbError("bad-kind");
  const visibility = storage.visibility ?? "private";
  if (!VISIBILITIES.includes(visibility)) throw new IngestDbError("bad-visibility");
  const mixpointer = optionalpointer("bad-pointer", storage.mixPointer);
  const stemspointer = optionalpointer("bad-pointer", storage.stemsPointer);
  ensureingestschema();
  execute(
    `INSERT INTO ingest_documents
       (id, name, durationseconds, samplerate, pcmhash, ingestedat, docjson,
        owner_id, kind, visibility, mix_pointer, stems_pointer, size_bytes, sha256)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       durationseconds = excluded.durationseconds,
       samplerate = excluded.samplerate,
       pcmhash = excluded.pcmhash,
       ingestedat = excluded.ingestedat,
       docjson = excluded.docjson,
       owner_id = excluded.owner_id,
       kind = excluded.kind,
       visibility = excluded.visibility,
       mix_pointer = excluded.mix_pointer,
       stems_pointer = excluded.stems_pointer,
       size_bytes = excluded.size_bytes,
       sha256 = excluded.sha256`,
    [
      id,
      doc.name,
      doc.durationSeconds,
      doc.sampleRate,
      doc.pcmhash,
      doc.ingestedAt,
      JSON.stringify(doc),
      owner,
      storage.kind,
      visibility,
      mixpointer,
      stemspointer,
      storage.sizeBytes ?? 0,
      storage.sha256 ?? "",
    ],
  );
}

/**
 * Reads one full ingest row by id — every column of the reference law,
 * the pointers in the decimal string form.
 *
 * @param id the record id.
 * @returns the row, or undefined when the id is unknown.
 */
export function getingestrow(id: string): IngestRow | undefined {
  ensureingestschema();
  return queryOne<IngestRow>(
    `SELECT id, name, durationseconds, samplerate, pcmhash, ingestedat, docjson,
            CAST(owner_id AS TEXT) AS owner_id, kind, visibility,
            CAST(mix_pointer AS TEXT) AS mix_pointer, CAST(stems_pointer AS TEXT) AS stems_pointer,
            size_bytes, sha256
     FROM ingest_documents WHERE id = ?`,
    [id],
  );
}

/**
 * Lists every ingest row newest first (the shelf order), every column of
 * the reference law carried end to end.
 *
 * @returns the rows.
 */
export function listingestrows(): IngestRow[] {
  ensureingestschema();
  return queryAll<IngestRow>(
    `SELECT id, name, durationseconds, samplerate, pcmhash, ingestedat, docjson,
            CAST(owner_id AS TEXT) AS owner_id, kind, visibility,
            CAST(mix_pointer AS TEXT) AS mix_pointer, CAST(stems_pointer AS TEXT) AS stems_pointer,
            size_bytes, sha256
     FROM ingest_documents ORDER BY ingestedat DESC`,
  );
}

/**
 * Reads one ingest document by id.
 *
 * @param id the record id.
 * @returns the document, or undefined when the id is unknown.
 */
export function getingest(id: string): IngestDocument | undefined {
  const row = getingestrow(id);
  if (!row) return undefined;
  try {
    return JSON.parse(row.docjson) as IngestDocument;
  } catch {
    return undefined;
  }
}

/**
 * Lists every ingest document, newest first (the shelf order).
 *
 * @returns the parsed documents.
 */
export function listingests(): IngestDocument[] {
  const docs: IngestDocument[] = [];
  for (const row of listingestrows()) {
    try {
      docs.push(JSON.parse(row.docjson) as IngestDocument);
    } catch {
      // a row that fails the parse never blocks the shelf
    }
  }
  return docs;
}

/**
 * Drops one ingest row.
 *
 * @param id the record id.
 * @returns true when a row was removed.
 */
export function droppingest(id: string): boolean {
  return execute("DELETE FROM ingest_documents WHERE id = ?", [id]).changes > 0;
}

/** The guard the gateway reuses before persisting a browser document. */
export function docvalid(doc: IngestDocument): boolean {
  return (
    !!doc &&
    doc.schema === INGEST_SCHEMA_VERSION &&
    typeof doc.name === "string" &&
    doc.name.length > 0 &&
    Array.isArray(doc.stems) &&
    doc.stems.length > 0 &&
    Array.isArray(doc.segments)
  );
}

// ---------------------------------------------------------------------------
// the genre profile seat (the pattern miner wave PV3.002)
// ---------------------------------------------------------------------------

/** One genre_profiles row as the sqlite table holds it: the profile rides
 * its column as canonical json, the reference ids ride theirs as json text
 * (the audit chain), the created_at stamps the storage instant — the
 * profile's own updatedAt stays deterministic (the freshest reference
 * ingestedAt), the row never rewrites the document's law. */
export interface GenreProfileRow {
  /** The autoincrement row id. */
  id: number;
  /** The genre key of the profile (one of the fifteen). */
  genre: string;
  /** The reference ids as json text (the audit chain). */
  reference_ids: string;
  /** The canonical profile json (serializeProfile bytes). */
  profile_json: string;
  /** The storage instant (datetime('now') at the write). */
  created_at: string;
}

/** The create statement of the genre profile seat — create-if-not-exists,
 * the same migration law as ingest_documents minus the alter path: the
 * seat is new, no old shape exists to upgrade. DDL only, a constant
 * statement, zero parameters, zero interpolation. */
const CREATE_GENRE_PROFILES = `
    CREATE TABLE IF NOT EXISTS genre_profiles (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      genre         TEXT NOT NULL,
      reference_ids TEXT NOT NULL,
      profile_json  TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `;

/**
 * Brings the genre_profiles table of any better-sqlite3 handle to the
 * miner's law shape: the create statement lands the table when absent,
 * idempotent on every call.
 *
 * @param target the database handle (the app db or a test database).
 */
export function migrategenreschema(target: typeof db): void {
  target.exec(CREATE_GENRE_PROFILES);
}

/**
 * Ensures the genre_profiles table exists at the app db (the store
 * creates its own table so the schema stays layered).
 */
export function ensuregenreschema(): void {
  migrategenreschema(db);
}

/**
 * Stores one genre profile: the document serializes through the canonical
 * law first (a broken profile throws the typed error honestly — no row
 * ever lands for a document that fails the contract), then the row lands
 * with the genre, the reference ids as json text and the canonical json —
 * prepared and parameterized, never concatenated sql.
 *
 * @param profile the genre profile (schema debonair.profile/1).
 * @param target the database handle (defaults to the app db).
 * @returns the row id the storage assigned.
 * @throws ProfileError when the profile fails the contract.
 */
export function saveGenreProfile(profile: GenreProfile, target: typeof db = db): number {
  const json = serializeProfile(profile);
  migrategenreschema(target);
  const result = target
    .prepare(`INSERT INTO genre_profiles (genre, reference_ids, profile_json) VALUES (?, ?, ?)`)
    .run(profile.genre, JSON.stringify(profile.referenceIds), json);
  return Number(result.lastInsertRowid);
}

/**
 * Lists every genre profile row newest first (the vitrine order — the
 * latest training of each genre surfaces first).
 *
 * @param target the database handle (defaults to the app db).
 * @returns the rows.
 */
export function listGenreProfiles(target: typeof db = db): GenreProfileRow[] {
  migrategenreschema(target);
  return target
    .prepare(`SELECT id, genre, reference_ids, profile_json, created_at FROM genre_profiles ORDER BY id DESC`)
    .all() as GenreProfileRow[];
}
