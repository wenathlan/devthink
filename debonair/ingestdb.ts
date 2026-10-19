// # ingestdb — the node/sqlite half of the ingest store: the rows the
// gateway serves the browser layer (ingeststore.ts) read and write here.
// better-sqlite3 through the db.ts helpers, every statement prepared and
// parameterized — no sql is ever assembled by string concatenation (the
// house database law). The document rides its column as canonical json;
// the pattern miner later reads the same json the browser shelf shows.

import { execute, queryAll, queryOne } from "./db.ts";
import type { IngestDocument } from "./ingest.ts";
import { INGEST_SCHEMA_VERSION } from "./ingest.ts";

/** One ingest row as the sqlite table holds it. */
export interface IngestRow {
  id: string;
  name: string;
  durationseconds: number;
  samplerate: number;
  pcmhash: number;
  ingestedat: string;
  docjson: string;
}

/**
 * Ensures the ingest_documents table exists (the store creates its own
 * table so the schema stays layered — the seed never depends on it).
 */
export function ensureingestschema(): void {
  execute(`
    CREATE TABLE IF NOT EXISTS ingest_documents (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      durationseconds REAL NOT NULL DEFAULT 0,
      samplerate      INTEGER NOT NULL DEFAULT 0,
      pcmhash         INTEGER NOT NULL DEFAULT 0,
      ingestedat      TEXT NOT NULL,
      docjson         TEXT NOT NULL
    );
  `);
}

/**
 * Inserts one ingest document (or replaces the row of the same id).
 *
 * @param id the record id the caller assigned.
 * @param doc the parametrized document (schema debonair.ingest/1).
 */
export function puttingest(id: string, doc: IngestDocument): void {
  ensureingestschema();
  execute(
    `INSERT INTO ingest_documents (id, name, durationseconds, samplerate, pcmhash, ingestedat, docjson)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       durationseconds = excluded.durationseconds,
       samplerate = excluded.samplerate,
       pcmhash = excluded.pcmhash,
       ingestedat = excluded.ingestedat,
       docjson = excluded.docjson`,
    [id, doc.name, doc.durationSeconds, doc.sampleRate, doc.pcmhash, doc.ingestedAt, JSON.stringify(doc)],
  );
}

/**
 * Reads one ingest document by id.
 *
 * @param id the record id.
 * @returns the document, or undefined when the id is unknown.
 */
export function getingest(id: string): IngestDocument | undefined {
  const row = queryOne<IngestRow>(
    "SELECT id, name, durationseconds, samplerate, pcmhash, ingestedat, docjson FROM ingest_documents WHERE id = ?",
    [id],
  );
  if (!row) return undefined;
  try {
    return JSON.parse(row.docjson) as IngestDocument;
  } catch {
    return undefined;
  }
}

/**
 * Lists every ingest row, newest first (the shelf order).
 *
 * @returns the parsed documents.
 */
export function listingests(): IngestDocument[] {
  const rows = queryAll<IngestRow>(
    "SELECT id, name, durationseconds, samplerate, pcmhash, ingestedat, docjson FROM ingest_documents ORDER BY ingestedat DESC",
  );
  const docs: IngestDocument[] = [];
  for (const row of rows) {
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
