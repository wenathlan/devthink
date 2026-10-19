// # ingeststore — the ONE writer of the ingest records the katexis library
// feeds on (browser layer). The document rides the platform database over
// POST/GET /api/v1/ingest, HTTPS only: the base url arrives through
// VITE_DEBONAIR_URL and every candidate host passes hostallowed first
// (localhost, loopback, private and reserved ranges refused — the same
// network law onboardingstate carries). The localStorage key
// debonair.ingest.mirror is purely the offline cache of the database (byte
// capped, oldest evicted, never the source of truth) and module memory
// covers the session. Reads merge db and mirror with db-wins, so an ingest
// saved while offline resurfaces when the gateway answers again.
//
// The node/sqlite half of the store lives in ingestdb.ts (better-sqlite3,
// parameter binding only): the gateway serves the same rows both layers
// write. Pure browser code here — zero node imports.

import type { IngestDocument } from "./ingest.ts";
import { INGEST_SCHEMA_VERSION } from "./ingest.ts";
import { hostallowed } from "./onboardingstate.ts";

/** One stored ingest: the id the layer assigned and where it lives. */
export interface IngestRecord {
  /** The id of the document (gateway id or a local- prefixed fallback). */
  id: string;
  /** Where the record landed: "db" (gateway accepted) or "offline" (mirror). */
  where: "db" | "offline";
  /** The full parametrized document (schema debonair.ingest/1). */
  doc: IngestDocument;
}

/** The localStorage cache key (the DB mirror, never the source of truth). */
const MIRROR_KEY = "debonair.ingest.mirror";

/** The byte ceiling of the offline mirror — oldest records evict first. */
const MIRROR_BYTES = 4 * 1024 * 1024;

/** The configured platform base (HTTPS gateway); empty answers mirror-only. */
const BASE =
  (typeof import.meta !== "undefined" ? (import.meta.env?.VITE_DEBONAIR_URL as string | undefined) : undefined)
    ?.trim()
    .replace(/\/+$/, "") ?? "";

/** The platform route the store rides (the gateway serves /api/v1/*). */
const API_PATH = "/api/v1/ingest";

/** The abort window of every platform call (ms) — the panel never hangs. */
const TIMEOUT_MS = 5000;

/** module memory: the session records, consulted before any i/o. */
const memory = new Map<string, IngestRecord>();

/** The mirror row shape that rides localStorage (the doc rides inside). */
interface MirrorRow {
  id: string;
  bytes: number;
  doc: IngestDocument;
}

/** Reads the offline mirror (memory first, then the localStorage cache). */
function mirrorall(): MirrorRow[] {
  if (memory.size > 0) return [...memory.values()].map((r) => ({ id: r.id, bytes: 0, doc: r.doc }));
  try {
    const raw = window.localStorage.getItem(MIRROR_KEY);
    if (!raw) return [];
    const rows = JSON.parse(raw) as MirrorRow[];
    for (const row of rows) memory.set(row.id, { id: row.id, where: "offline", doc: row.doc });
    return rows;
  } catch {
    return [];
  }
}

/** Persists the mirror under the byte ceiling (best-effort: quota and
 * privacy modes refuse silently, memory still covers the session). */
function mirrorsave(): void {
  try {
    const rows: MirrorRow[] = [];
    let total = 0;
    for (const record of [...memory.values()].reverse()) {
      const bytes = JSON.stringify(record.doc).length;
      if (total + bytes > MIRROR_BYTES && rows.length > 0) break;
      rows.unshift({ id: record.id, bytes, doc: record.doc });
      total += bytes;
    }
    window.localStorage.setItem(MIRROR_KEY, JSON.stringify(rows));
  } catch {
    // storage unavailable: the mirror lives in module memory only
  }
}

/** One platform call: HTTPS, validated host, hard timeout, JSON in/out. */
async function call(method: string, path: string, body?: unknown): Promise<unknown | null> {
  if (!BASE || !hostallowed(BASE)) return null;
  try {
    const res = await fetch(BASE + path, {
      method,
      credentials: "include",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return null;
    return (await res.json()) as unknown;
  } catch {
    return null;
  }
}

/** The local fallback id: deterministic from the document identity, so the
 * same take re-ingested offline lands on the same mirror slot. */
function localid(doc: IngestDocument): string {
  const seed = `${doc.name}|${doc.sampleRate}|${doc.durationSeconds}|${doc.pcmhash}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `local-${(hash >>> 0).toString(16)}`;
}

/** The record-level guard: only schema-matching documents ever persist. */
function docvalid(doc: IngestDocument): boolean {
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

/**
 * Stores one ingest document: the gateway first (POST /api/v1/ingest), the
 * offline mirror when the platform is unreachable. The record returns with
 * its id and where it landed.
 *
 * @param doc the parametrized document from ingestPcm.
 * @returns the stored record, or null when the document failed the guard.
 */
export async function saveingest(doc: IngestDocument): Promise<IngestRecord | null> {
  if (!docvalid(doc)) return null;
  const answer = (await call("POST", API_PATH, { document: doc })) as { id?: string } | null;
  if (answer && typeof answer.id === "string" && answer.id.length > 0) {
    const record: IngestRecord = { id: answer.id, where: "db", doc };
    memory.set(record.id, record);
    mirrorsave();
    return record;
  }
  const record: IngestRecord = { id: localid(doc), where: "offline", doc };
  memory.set(record.id, record);
  mirrorsave();
  return record;
}

/**
 * Lists every ingest record: the gateway list first, merged with the mirror
 * (db wins by id, offline-only records keep their place). Names ride the
 * list so the shelf can render without fetching each document.
 *
 * @returns the merged records, newest ingest first.
 */
export async function listingests(): Promise<IngestRecord[]> {
  const answer = (await call("GET", API_PATH)) as { records?: { id: string; document: IngestDocument }[] } | null;
  const merged = new Map<string, IngestRecord>();
  for (const row of mirrorall()) {
    if (!merged.has(row.id)) merged.set(row.id, { id: row.id, where: "offline", doc: row.doc });
  }
  if (answer?.records) {
    for (const row of answer.records) {
      if (row && typeof row.id === "string" && row.document) {
        merged.set(row.id, { id: row.id, where: "db", doc: row.document });
        memory.set(row.id, { id: row.id, where: "db", doc: row.document });
      }
    }
  }
  return [...merged.values()].sort((a, b) => (a.doc.ingestedAt < b.doc.ingestedAt ? 1 : -1));
}

/**
 * Fetches one ingest document by id: the gateway first, the mirror fallback.
 *
 * @param id the record id (from saveingest or listingests).
 * @returns the document, or null when no layer holds it.
 */
export async function getingest(id: string): Promise<IngestDocument | null> {
  const answer = (await call("GET", `${API_PATH}/${encodeURIComponent(id)}`)) as { document?: IngestDocument } | null;
  if (answer?.document) return answer.document;
  return memory.get(id)?.doc ?? null;
}

/**
 * Drops one ingest record: DELETE on the gateway when it accepts, the
 * mirror entry removed either way.
 *
 * @param id the record id.
 */
export async function droppingest(id: string): Promise<void> {
  await call("DELETE", `${API_PATH}/${encodeURIComponent(id)}`);
  memory.delete(id);
  try {
    const rows = mirrorall().filter((r) => r.id !== id);
    window.localStorage.setItem(MIRROR_KEY, JSON.stringify(rows));
  } catch {
    // storage unavailable: the session memory still dropped it
  }
}

/** The count of records the session memory holds (the panel badge). */
export function ingestcount(): number {
  return memory.size;
}
