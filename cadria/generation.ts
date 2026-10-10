// # generation — the sqlite data layer of the audio→image generation pipeline:
// the boot DDL for audio_analyses + image_generations, the parameterized
// accessors and the GenerationStore seam the gateway agent builds against.
// Sibling module of db.ts (kept apart so db.ts stays under 300 lines): every
// statement is prepared and parameterized — no sql is ever assembled by string
// concatenation. Columns follow the family sync contract (schema.prisma is the
// documentation of record): identity pointers are text, counts are 32-bit
// ints, time is iso text, and the byte-scale JSON payloads are capped at
// 512 KiB by this runtime seam. Every accessor is wrapped in a try/catch whose
// errors answer traceable `[generationStore.<method>]` strings.
import { db, execute, queryAll, queryOne } from "./db.ts";

// — the storage seam (names and signatures are the contract with the gateway) —

export type GenerationRecord = { id: string; seed: string; style: string; bpm: number; keyTonic: number; keyMode: string; durationMs: number; descriptorJson: string; projectJson: string; svgDigest: string; createdAt: string };
export type AnalysisRecord = { id: string; sourceKind: string; sampleRate: number; durationMs: number; bpm: number; keyName: string; reportJson: string; createdAt: string };
export interface GenerationStore {
  saveGeneration(record: GenerationRecord): { ok: true } | { ok: false; error: string };
  getGeneration(id: string): GenerationRecord | null;
  listGenerations(limit: number): GenerationRecord[];
  deleteGeneration(id: string): boolean;
  saveAnalysis(record: AnalysisRecord): { ok: true } | { ok: false; error: string };
  getAnalysis(id: string): AnalysisRecord | null;
  listAnalyses(limit: number): AnalysisRecord[];
}

const MAX_ID_CHARS = 128;
const MAX_JSON_BYTES = 512 * 1024;
const BPM_MIN = 20;
const BPM_MAX = 300;
const LIMIT_MIN = 1;
const LIMIT_MAX = 200;

const GENERATION_DDL = `
CREATE TABLE IF NOT EXISTS audio_analyses (
  id          TEXT PRIMARY KEY,
  sourceKind  TEXT NOT NULL,
  sampleRate  INTEGER NOT NULL,
  durationMs  INTEGER NOT NULL,
  bpm         INTEGER NOT NULL,
  keyName     TEXT NOT NULL,
  reportJson  TEXT NOT NULL,
  createdAt   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS audio_analyses_createdAt_idx ON audio_analyses (createdAt);
CREATE TABLE IF NOT EXISTS image_generations (
  id             TEXT PRIMARY KEY,
  seed           TEXT NOT NULL,
  style          TEXT NOT NULL,
  bpm            INTEGER NOT NULL,
  keyTonic       INTEGER NOT NULL,
  keyMode        TEXT NOT NULL,
  durationMs     INTEGER NOT NULL,
  descriptorJson TEXT NOT NULL,
  projectJson    TEXT NOT NULL,
  svgDigest      TEXT NOT NULL,
  createdAt      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS image_generations_createdAt_idx ON image_generations (createdAt);
`;

/** Creates the generation tables when they do not exist (idempotent boot DDL). */
export function ensureGenerationSchema(): void {
  db.exec(GENERATION_DDL);
}

// — validation helpers (all answers traceable, none throw) —

/** Answers the seam violation of an id, or null when the id is contract-true. */
function idError(id: unknown): string | null {
  if (typeof id !== "string" || id.length === 0) return "id must be a non-empty string";
  if (id.length > MAX_ID_CHARS) return `id must be at most ${MAX_ID_CHARS} chars`;
  return null;
}

/** Clamps bpm into 20–300; answers null when the value is not a finite number. */
function clampBpm(bpm: number): number | null {
  if (typeof bpm !== "number" || !Number.isFinite(bpm)) return null;
  return Math.round(Math.min(BPM_MAX, Math.max(BPM_MIN, bpm)));
}

/** Clamps the page limit into 1–200 (non-finite falls back to one row). */
function clampLimit(limit: number): number {
  const n = typeof limit === "number" && Number.isFinite(limit) ? Math.round(limit) : LIMIT_MIN;
  return Math.min(LIMIT_MAX, Math.max(LIMIT_MIN, n));
}

/** True when a JSON payload exceeds the 512 KiB seam cap. */
function jsonTooLarge(value: string): boolean {
  return Buffer.byteLength(value, "utf8") > MAX_JSON_BYTES;
}

/** Answers the seam violation of a required text column, or null when fine. */
function textError(field: string, value: unknown): string | null {
  return typeof value === "string" ? null : `${field} must be a string`;
}

/** Logs an accessor failure under its traceable tag (the house try/catch rule). */
function trace(where: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[generationStore.${where}] ${message}`);
}

/** The uniform rejected answer of the save accessors. */
function fail(where: string, why: string): { ok: false; error: string } {
  return { ok: false, error: `[generationStore.${where}] ${why}` };
}

// — static parameterized statements (columns inline, values always bound) —

const UPSERT_GENERATION = `
INSERT INTO image_generations
  (id, seed, style, bpm, keyTonic, keyMode, durationMs, descriptorJson, projectJson, svgDigest, createdAt)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT (id) DO UPDATE SET
  seed = excluded.seed, style = excluded.style, bpm = excluded.bpm,
  keyTonic = excluded.keyTonic, keyMode = excluded.keyMode,
  durationMs = excluded.durationMs, descriptorJson = excluded.descriptorJson,
  projectJson = excluded.projectJson, svgDigest = excluded.svgDigest,
  createdAt = excluded.createdAt
`;

const UPSERT_ANALYSIS = `
INSERT INTO audio_analyses
  (id, sourceKind, sampleRate, durationMs, bpm, keyName, reportJson, createdAt)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT (id) DO UPDATE SET
  sourceKind = excluded.sourceKind, sampleRate = excluded.sampleRate,
  durationMs = excluded.durationMs, bpm = excluded.bpm, keyName = excluded.keyName,
  reportJson = excluded.reportJson, createdAt = excluded.createdAt
`;

const GENERATION_BY_ID =
  "SELECT id, seed, style, bpm, keyTonic, keyMode, durationMs, descriptorJson, projectJson, svgDigest, createdAt FROM image_generations WHERE id = ?";

const GENERATIONS_PAGE =
  "SELECT id, seed, style, bpm, keyTonic, keyMode, durationMs, descriptorJson, projectJson, svgDigest, createdAt FROM image_generations ORDER BY createdAt DESC, rowid DESC LIMIT ?";

const ANALYSIS_BY_ID =
  "SELECT id, sourceKind, sampleRate, durationMs, bpm, keyName, reportJson, createdAt FROM audio_analyses WHERE id = ?";

const ANALYSES_PAGE =
  "SELECT id, sourceKind, sampleRate, durationMs, bpm, keyName, reportJson, createdAt FROM audio_analyses ORDER BY createdAt DESC, rowid DESC LIMIT ?";

// — generation accessors —

function saveGeneration(record: GenerationRecord): { ok: true } | { ok: false; error: string } {
  const where = "saveGeneration";
  try {
    if (record === null || typeof record !== "object") return fail(where, "record must be an object");
    const whyId = idError(record.id);
    if (whyId) return fail(where, whyId);
    const bpm = clampBpm(record.bpm);
    if (bpm === null) return fail(where, "bpm must be a finite number");
    for (const field of ["seed", "style", "keyMode", "descriptorJson", "projectJson", "svgDigest", "createdAt"] as const) {
      const why = textError(field, record[field]);
      if (why) return fail(where, why);
    }
    if (jsonTooLarge(record.descriptorJson)) return fail(where, "descriptorJson exceeds the 512 KiB cap");
    if (jsonTooLarge(record.projectJson)) return fail(where, "projectJson exceeds the 512 KiB cap");
    execute(UPSERT_GENERATION, [
      record.id, record.seed, record.style, bpm, record.keyTonic, record.keyMode,
      record.durationMs, record.descriptorJson, record.projectJson, record.svgDigest, record.createdAt,
    ]);
    return { ok: true };
  } catch (error) {
    trace(where, error);
    return fail(where, error instanceof Error ? error.message : String(error));
  }
}

function getGeneration(id: string): GenerationRecord | null {
  try {
    if (idError(id)) return null;
    return queryOne<GenerationRecord>(GENERATION_BY_ID, [id]) ?? null;
  } catch (error) {
    trace("getGeneration", error);
    return null;
  }
}

function listGenerations(limit: number): GenerationRecord[] {
  try {
    return queryAll<GenerationRecord>(GENERATIONS_PAGE, [clampLimit(limit)]);
  } catch (error) {
    trace("listGenerations", error);
    return [];
  }
}

function deleteGeneration(id: string): boolean {
  try {
    if (idError(id)) return false;
    return execute("DELETE FROM image_generations WHERE id = ?", [id]).changes > 0;
  } catch (error) {
    trace("deleteGeneration", error);
    return false;
  }
}

// — analysis accessors —

function saveAnalysis(record: AnalysisRecord): { ok: true } | { ok: false; error: string } {
  const where = "saveAnalysis";
  try {
    if (record === null || typeof record !== "object") return fail(where, "record must be an object");
    const whyId = idError(record.id);
    if (whyId) return fail(where, whyId);
    const bpm = clampBpm(record.bpm);
    if (bpm === null) return fail(where, "bpm must be a finite number");
    for (const field of ["sourceKind", "keyName", "reportJson", "createdAt"] as const) {
      const why = textError(field, record[field]);
      if (why) return fail(where, why);
    }
    if (jsonTooLarge(record.reportJson)) return fail(where, "reportJson exceeds the 512 KiB cap");
    execute(UPSERT_ANALYSIS, [
      record.id, record.sourceKind, record.sampleRate, record.durationMs,
      bpm, record.keyName, record.reportJson, record.createdAt,
    ]);
    return { ok: true };
  } catch (error) {
    trace(where, error);
    return fail(where, error instanceof Error ? error.message : String(error));
  }
}

function getAnalysis(id: string): AnalysisRecord | null {
  try {
    if (idError(id)) return null;
    return queryOne<AnalysisRecord>(ANALYSIS_BY_ID, [id]) ?? null;
  } catch (error) {
    trace("getAnalysis", error);
    return null;
  }
}

function listAnalyses(limit: number): AnalysisRecord[] {
  try {
    return queryAll<AnalysisRecord>(ANALYSES_PAGE, [clampLimit(limit)]);
  } catch (error) {
    trace("listAnalyses", error);
    return [];
  }
}

// — the seam facade —

/** The sqlite-backed GenerationStore of the seam (boots the schema on call). */
export function generationStore(): GenerationStore {
  ensureGenerationSchema();
  return {
    saveGeneration,
    getGeneration,
    listGenerations,
    deleteGeneration,
    saveAnalysis,
    getAnalysis,
    listAnalyses,
  };
}
