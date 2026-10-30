// # gatewayapi — the http route table of the debonair gateway lane (root
// layer, waves PV1.003 + PV1.006 + PV2.001): the six routes the family
// gateway serves — the ingest upload that queues a job, the job progress
// query the bench polls, the document shelf, the document read, the
// document removal and the blob stream — pure typescript over an injected
// environment, the same framework-agnostic discipline vault/api.ts rides:
// the route table sits at the top (method + path pattern + handler name),
// the handlers stay pure over the seats, and every answer is the typed
// ok(value) | err(code, status) — never a throw. the transport owns the
// wire: a node:http adapter, a worker fetch adapter or a test double
// builds the GatewayRequest and serializes the GatewayAnswer — the cors
// law, the json headers and the blob content-type ride the adapter; this
// layer answers values, machine codes and statuses only (the family law:
// the handler answers the bytes and the mime, the transport adaptation is
// the gateway's job).
//
// the lanes: the upload validates the body under the vault body law (the
// json lane carries the base64 bytes — decoded by a hand-rolled strict
// base64, the same zero-dependency discipline the blob store's sha256
// rides; the raw lane carries the verbatim body with the facts in the
// query, the deposit law), mints the job id and registers the queued
// ledger row. the run itself starts through startJob: the caller lane
// (the gateway worker loop) owns the queue and hands the payload — the
// bytes never ride a row twice, the blob store owns them the moment the
// worker stores them — while the ledger row stays the nine-column
// progress record the job route answers. the walk patches the row through
// the sync ledger seat (running, then every completed phase with its
// ascending fraction, then done with the document id, or failed with the
// honest error code). the shelf serves the visibility law: the vitrine
// rows list for everyone, the private rows ride only for their owner. the
// blob stream answers the stored bytes with the pointer's kind as the
// mime. the db lane rides the injected-handle seam the worker already
// defines (IngestDbHandle): this stack's ingest_documents table predates
// the reference-law columns, so the document seat is the seam and the
// wiring lane binds the real table behind it once the schema wave lands
// on the stack — this module never learns the difference (the injectable
// discipline the takestore storage and the blobstore fetch seams ride).
// zero dependencies, zero consumer data.

import type { BlobPointer, BlobResult, BlobStore } from "./blobstore.ts";
import { blobidvalid } from "./blobstore.ts";
import type { IngestDocument } from "./ingest.ts";
import type {
  IngestDbHandle,
  IngestJobErrorCode,
  IngestJobKind,
  IngestJobPointers,
  IngestJobVisibility,
  IngestStampRow,
  IngestStemsManifest,
} from "./ingestworker.ts";
import { INGEST_STEMS_SCHEMA_VERSION, runIngestJob } from "./ingestworker.ts";

/** @section table — the route catalog */

/** The handler names the route table may name — the catalog seat at the
 * bottom answers every one (the compile-time lockstep: a table row cannot
 * name a handler the catalog forgot). */
export type GatewayHandlerName =
  | "uploadIngest"
  | "getIngestJob"
  | "listIngestShelf"
  | "getIngest"
  | "deleteIngest"
  | "getBlob";

/** One row of the route catalog — the method, the path pattern and the
 * handler name (the family route shape vault/api.ts rides, grown with the
 * method and the pattern the param routes need). */
export interface RouteSpec {
  /** The http method the row answers. */
  method: "GET" | "POST" | "DELETE";
  /** The path pattern — a ":name" segment captures one path parameter. */
  path: string;
  /** The handler seat the row dispatches to. */
  handler: GatewayHandlerName;
}

/** The route catalog of the debonair gateway lane — the six routes the
 * family gateway serves: the ingest job lane (the upload, the progress
 * query, the shelf, the read, the removal) and the blob stream. The more
 * specific rows ride first (the jobs route before the document :id route)
 * — the first match wins and the table order is the law. */
export const routes: readonly RouteSpec[] = [
  { method: "POST", path: "/api/v1/ingest/upload", handler: "uploadIngest" },
  { method: "GET", path: "/api/v1/ingest/jobs/:id", handler: "getIngestJob" },
  { method: "GET", path: "/api/v1/ingest", handler: "listIngestShelf" },
  { method: "GET", path: "/api/v1/ingest/:id", handler: "getIngest" },
  { method: "DELETE", path: "/api/v1/ingest/:id", handler: "deleteIngest" },
  { method: "GET", path: "/api/v1/blob/:id", handler: "getBlob" },
];

/** @section match — the path matcher and the dispatch verdict */

/** Decodes one url-encoded path segment, falling back to the raw text on
 * a malformed escape (the vault safeDecode law). */
function safedecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Matches one path against one pattern — hand-rolled and deterministic:
 * no regex, no lookarounds, the segment count must match exactly, a
 * literal segment must equal, a ":name" segment captures (an empty
 * capture never matches — a route param always carries a value). The
 * caller owns the url parse (the vault handle law): the path rides the
 * pathname alone, no query string, no trailing-slash folding.
 *
 * @param pattern the route pattern.
 * @param path the concrete request path.
 * @returns the captured params, or null when the path does not match.
 */
export function matchpath(pattern: string, path: string): Record<string, string> | null {
  const parts = pattern.split("/");
  const segments = path.split("/");
  if (parts.length !== segments.length) return null;
  const params: Record<string, string> = {};
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    if (part.startsWith(":")) {
      if (segments[index] === "") return null;
      params[part.slice(1)] = safedecode(segments[index]);
    } else if (part !== segments[index]) {
      return null;
    }
  }
  return params;
}

/** The dispatch verdict of one request against the table: "routed" (a row
 * matched the method and the path — the params ride along), "method" (the
 * path matches at least one row but the method answers none of them — the
 * 405 shape) or "absent" (no row matches the path — the 404 shape). */
export type RouteVerdict =
  | { kind: "routed"; route: RouteSpec; params: Record<string, string> }
  | { kind: "method"; allowed: readonly string[] }
  | { kind: "absent" };

/**
 * Matches one method + path against the route table — deterministic: the
 * first row whose pattern matches wins; a path that only matches rows of
 * other methods answers the method verdict with the methods the table
 * would have answered; a path no row matches answers absent.
 *
 * @param method the http method (any case — the match normalizes).
 * @param path the request path.
 * @returns the verdict.
 */
export function matchroute(method: string, path: string): RouteVerdict {
  const verb = method.trim().toUpperCase();
  const allowed: string[] = [];
  for (const route of routes) {
    const params = matchpath(route.path, path);
    if (params === null) continue;
    if (route.method === verb) return { kind: "routed", route, params };
    allowed.push(route.method);
  }
  return allowed.length > 0 ? { kind: "method", allowed } : { kind: "absent" };
}

/** @section env — the environment seam */

/** The states the job ledger walks (the upload registers "queued", the
 * run moves it through "running", the walk lands "done" or "failed"). */
export type IngestJobState = "queued" | "running" | "done" | "failed";

/** One job ledger row — the ingest_jobs table shape (the nine prescribed
 * columns; the pointer columns ride the decimal string form the mint
 * answers, the same shape the ingestdb row functions bind). */
export interface GatewayJobRow {
  /** The minted job id (the decimal string). */
  id: string;
  /** The owner pointer (the decimal string). */
  owner_id: string;
  /** The walk state. */
  state: IngestJobState;
  /** The last completed pipeline phase (null until the run starts). */
  phase: string | null;
  /** The completed share of the pipeline (0..1, ascending). */
  fraction: number;
  /** The honest failure — "<code>: <message>" (null while the walk rides). */
  error: string | null;
  /** The stamped document id (null until the walk lands done). */
  document_id: string | null;
  /** The iso instant of the registration. */
  created_at: string;
  /** The iso instant the walk landed (done or failed; null while riding). */
  finished_at: string | null;
}

/** The mutable fields of one ledger row — the walk patches these. */
export type GatewayJobPatch = Partial<
  Pick<GatewayJobRow, "state" | "phase" | "fraction" | "error" | "document_id" | "finished_at">
>;

/** The job ledger seat — the ingest_jobs row functions behind one seam
 * (the wiring lane binds the real ingestdb functions; the tests bind a
 * temp sqlite). The seat is synchronous on purpose: the worker's progress
 * callback is synchronous, and a sync seat keeps every phase landing in
 * order — a queued write must never overtake the done write (the
 * better-sqlite3 discipline the ingestdb row functions ride). */
export interface GatewayJobSeat {
  /** Registers one job row (the upsert law — a re-registration refreshes). */
  putjob(row: GatewayJobRow): void;
  /** Reads one job row (null when the id answers nothing). */
  getjob(id: string): GatewayJobRow | null;
  /** Patches one job row (a missing id changes nothing). */
  updatejob(id: string, patch: GatewayJobPatch): void;
  /** Lists the job rows, newest first (an owner filter rides when the
   * caller carries one). */
  listjobs(ownerId?: string): GatewayJobRow[];
}

/** The document shelf seat — the ingestdb seam the worker's own handle
 * law names (IngestDbHandle.puttingestrow stamps the IngestStampRow),
 * grown with the shelf reads the routes serve. This stack rides the
 * injected handle because the ingest_documents table of this branch
 * predates the reference-law columns (owner, kind, visibility, the
 * pointers, the size, the sha); once the schema wave lands on the stack
 * the wiring lane binds the real table behind the same seat and this
 * module never learns the difference (the injectable discipline the
 * takestore storage and the blobstore fetch seams ride). */
export interface GatewayDocumentSeat extends IngestDbHandle {
  /** Reads one stamped row (null when the id answers nothing). */
  getstampedrow(id: string): Promise<IngestStampRow | null>;
  /** Lists every stamped row, newest first (the shelf order — the seat
   * answers rows, the visibility law filters in the route layer). */
  liststampedrows(): Promise<IngestStampRow[]>;
  /** Drops one row, answering the row it dropped (null when absent). */
  dropstampedrow(id: string): Promise<IngestStampRow | null>;
}

/** The environment every handler rides — all injected, the handlers pure
 * over it (the vault law: the surface owns no state, the seats own it). */
export interface GatewayEnv {
  /** The blob store the worker writes and the stream route reads. */
  store: BlobStore;
  /** The document shelf seat (the ingestdb seam). */
  db: GatewayDocumentSeat;
  /** The job ledger seat. */
  jobs: GatewayJobSeat;
  /** The iso clock the registrations and the finishes stamp. */
  now: () => string;
  /** The id mint — the decimal string seat the job ids ride. */
  mint: () => string;
}

/** @section answers — the typed response discipline */

/** The machine codes the gateway answers — typed, traceable, never a
 * throw (the vault { error: { code, message } } law). */
export type GatewayErrorCode =
  | "bad-request" // 400 — the body or the query failed the route's law
  | "bad-owner" // 400 — the owner pointer is not a minted decimal
  | "not-found" // 404 — no row or no route answers the id or the path
  | "method-not-allowed" // 405 — the path matches, the method does not
  | "conflict" // 409 — the row's state refuses the move
  | "store-failed" // 500 — the blob store refused or threw
  | "db-failed"; // 500 — a seat refused or threw

/** One typed success — the value the route answers with its status (the
 * transport adapter serializes the value as the response body). */
export interface GatewayOk<T> {
  ok: true;
  status: number;
  value: T;
}

/** One typed failure — the machine code, the status and the readable
 * message; the wire shape is the vault's own { error: { code, message } }. */
export interface GatewayErr {
  ok: false;
  status: number;
  error: { code: GatewayErrorCode; message: string };
}

/** The answer every handler and the dispatch itself give. */
export type GatewayAnswer<T = unknown> = GatewayOk<T> | GatewayErr;

/** The success branch builder. */
function ok<T>(value: T, status = 200): GatewayOk<T> {
  return { ok: true, status, value };
}

/** The failure branch builder — the machine code rides the answer, never
 * a throw. */
function err(code: GatewayErrorCode, status: number, message: string): GatewayErr {
  return { ok: false, status, error: { code, message } };
}

/** The readable message of any thrown failure. */
function errmsgof(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** @section request — the transport-neutral request and the wire values */

/** One gateway request — the transport adapter (node:http, a worker
 * fetch, a test double) builds it; the handlers stay pure over it. The
 * body law is the vault's own: the json lane carries the parsed object
 * (the upload facts with the base64 bytes), the raw lane carries the
 * verbatim bytes with the facts in the query (the deposit law — the raw
 * body answers every byte today, multipart parsing is a later rung). */
export interface GatewayRequest {
  /** The http method (any case — the dispatch normalizes). */
  method: string;
  /** The request path — the pathname alone, no query string, no
   * trailing-slash folding (the matcher is strict). */
  path: string;
  /** The query parameters, already decoded. */
  query: Record<string, string>;
  /** The parsed json body (null when absent, not json, or not an object). */
  json: Record<string, unknown> | null;
  /** The raw body bytes (null on the json lane). */
  raw: Uint8Array | null;
}

/** The blob stream one GET /api/v1/blob/:id answers — the bytes, the mime
 * and the pointer facts. The transport adapter sets the content-type and
 * the x-debonair-blob-* headers the gateway seam reads back; the
 * adaptation is the gateway's job, the family law. */
export interface BlobStreamValue {
  /** The blob bytes. */
  bytes: Uint8Array;
  /** The pointer's kind — the content type the stream answers. */
  mime: string;
  /** The pointer (the digest, the byte count, the stored-at instant). */
  pointer: BlobPointer;
}

/** The wire projection of one ledger row — the camelCase face the job
 * route answers (the table columns stay snake, the wire owns its names). */
export interface IngestJobValue {
  /** The job id. */
  id: string;
  /** The owner pointer. */
  ownerId: string;
  /** The walk state. */
  state: IngestJobState;
  /** The last completed phase (null until the run starts). */
  phase: string | null;
  /** The completed share of the pipeline (0..1). */
  fraction: number;
  /** The honest failure (null while the walk rides). */
  error: string | null;
  /** The stamped document id (null until done). */
  documentId: string | null;
  /** The iso instant of the registration. */
  createdAt: string;
  /** The iso instant the walk landed. */
  finishedAt: string | null;
}

/** The queued payload the caller lane hands the run — the upload facts
 * the worker needs beside the row. The queue (the gateway worker loop)
 * carries the payload: the prescribed nine ledger columns carry none, and
 * the bytes never ride a row twice — the blob store owns them the moment
 * the worker stores them. The owner rides the ledger row alone (the
 * single source of truth the registration stamped). */
export interface GatewayJobPayload {
  /** The source wav bytes (the wavwriter's own formats). */
  bytes: Uint8Array;
  /** The display name of the source (the worker folds the extension). */
  name: string;
  /** The ingest kind. */
  kind: IngestJobKind;
  /** The visibility the stamped document carries. */
  visibility: IngestJobVisibility;
}

/** The value one landed run answers — the document, the pointer chain and
 * the stamped row id. */
export interface IngestRunValue {
  /** The job that ran. */
  jobId: string;
  /** The landed state (a failed run answers the typed err instead). */
  state: "done";
  /** The stamped document id. */
  documentId: string | null;
  /** The parametrized document (schema debonair.ingest/1). */
  document: IngestDocument;
  /** The pointer chain — the mix, the stems, the manifest. */
  pointers: IngestJobPointers;
}

/** @section base64 — the body decode lane */

/** The standard base64 alphabet (the "=" pads the tail). */
const B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** The alphabet lookup table — built once per process. */
const B64_TABLE: Record<string, number> = {};
for (let index = 0; index < B64_ALPHABET.length; index++) {
  B64_TABLE[B64_ALPHABET[index]] = index;
}

/**
 * Decodes strict base64 — the upload's json lane rides it (the same
 * hand-rolled discipline the blob store's sha256 rides: deterministic,
 * pure, zero runtime surprises). The strict law: the length folds to
 * four, only the alphabet rides, the "=" pads only the tail (one or two),
 * and a group never carries a lone data char.
 *
 * @param text the base64 text.
 * @returns the decoded bytes, or null when the text is not honest base64.
 */
function decodebase64(text: string): Uint8Array | null {
  if (text.length % 4 !== 0) return null;
  let pads = 0;
  if (text.endsWith("==")) pads = 2;
  else if (text.endsWith("=")) pads = 1;
  const chars = text.length - pads;
  const tail = chars % 4;
  if (tail === 1) return null;
  const bytes = Math.floor(chars / 4) * 3 + (tail === 2 ? 1 : tail === 3 ? 2 : 0);
  const out = new Uint8Array(bytes);
  let cursor = 0;
  let buffer = 0;
  let bits = 0;
  for (let index = 0; index < chars; index++) {
    const value = B64_TABLE[text[index]];
    if (value === undefined) return null;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[cursor++] = (buffer >> bits) & 0xff;
    }
  }
  return out;
}

/** @section handlers — the ingest and the blob surface */

/** The upload facts one validated body answers. */
interface UploadFacts {
  /** The source bytes. */
  bytes: Uint8Array;
  /** The display name. */
  name: string;
  /** The owner pointer. */
  ownerId: string;
  /** The ingest kind. */
  kind: IngestJobKind;
  /** The visibility. */
  visibility: IngestJobVisibility;
}

/** The typed upload body verdict — every refusal answers the machine code
 * of its lane (the bytes and the name the bad-request law, the owner
 * pointer the bad-owner law, the kind and the visibility the enum law). */
type UploadFactsResult = { ok: true; facts: UploadFacts } | { ok: false; code: GatewayErrorCode; message: string };

/**
 * Reads the upload facts off one request — the json lane (the base64
 * bytes ride the "bytes" field) or the raw lane (the verbatim bytes ride
 * the body, the facts ride the query — the vault deposit law). The kind
 * defaults to "upload" and the visibility to "private" (the law the
 * caller lane carries into the run payload).
 *
 * @param request the gateway request.
 * @returns the facts, or the machine-coded refusal.
 */
function uploadfacts(request: GatewayRequest): UploadFactsResult {
  let bytes: Uint8Array;
  let namefield: unknown;
  let ownerfield: unknown;
  let kindfield: unknown;
  let visibilityfield: unknown;
  if (request.json !== null) {
    const json = request.json;
    if (typeof json.bytes !== "string") {
      return {
        ok: false,
        code: "bad-request",
        message: "the upload needs the base64 bytes field (or the raw body lane with the facts in the query)",
      };
    }
    const decoded = decodebase64(json.bytes);
    if (decoded === null) {
      return { ok: false, code: "bad-request", message: "the bytes field is not honest base64" };
    }
    bytes = decoded;
    namefield = json.name;
    ownerfield = json.ownerId;
    kindfield = json.kind;
    visibilityfield = json.visibility;
  } else if (request.raw !== null) {
    bytes = request.raw;
    namefield = request.query.name;
    ownerfield = request.query.ownerId;
    kindfield = request.query.kind;
    visibilityfield = request.query.visibility;
  } else {
    return { ok: false, code: "bad-request", message: "the upload needs a body (the json lane or the raw lane)" };
  }
  if (bytes.length === 0) {
    return { ok: false, code: "bad-request", message: "the upload carries no bytes" };
  }
  if (typeof namefield !== "string" || namefield.length === 0) {
    return { ok: false, code: "bad-request", message: "the upload needs a name" };
  }
  if (typeof ownerfield !== "string" || !blobidvalid(ownerfield)) {
    return { ok: false, code: "bad-owner", message: "the upload needs the owner pointer in the minted decimal form" };
  }
  let kind: IngestJobKind = "upload";
  if (kindfield !== undefined) {
    if (kindfield === "upload" || kindfield === "reference") kind = kindfield;
    else return { ok: false, code: "bad-request", message: "the kind is off the enum (upload | reference)" };
  }
  let visibility: IngestJobVisibility = "private";
  if (visibilityfield !== undefined) {
    if (visibilityfield === "private" || visibilityfield === "vitrine") visibility = visibilityfield;
    else return { ok: false, code: "bad-request", message: "the visibility is off the lanes (private | vitrine)" };
  }
  return { ok: true, facts: { bytes, name: namefield, ownerId: ownerfield, kind, visibility } };
}

/**
 * POST /api/v1/ingest/upload — validates the body, mints the job id and
 * registers the queued ledger row; the run itself starts through startJob
 * (the caller lane's queue carries the payload).
 */
async function uploadIngest(env: GatewayEnv, request: GatewayRequest): Promise<GatewayAnswer<{ jobId: string }>> {
  const facts = uploadfacts(request);
  if (!facts.ok) return err(facts.code, 400, facts.message);
  const jobId = env.mint();
  const row: GatewayJobRow = {
    id: jobId,
    owner_id: facts.facts.ownerId,
    state: "queued",
    phase: null,
    fraction: 0,
    error: null,
    document_id: null,
    created_at: env.now(),
    finished_at: null,
  };
  try {
    env.jobs.putjob(row);
  } catch (error) {
    return err("db-failed", 500, `the ledger refused the registration: ${errmsgof(error)}`);
  }
  return ok({ jobId }, 201);
}

/** The wire projection of one ledger row (the camelCase face). */
function jobwire(row: GatewayJobRow): IngestJobValue {
  return {
    id: row.id,
    ownerId: row.owner_id,
    state: row.state,
    phase: row.phase,
    fraction: row.fraction,
    error: row.error,
    documentId: row.document_id,
    createdAt: row.created_at,
    finishedAt: row.finished_at,
  };
}

/**
 * GET /api/v1/ingest/jobs/:id — the job row (the walk the bench polls:
 * the state, the phase, the fraction, the error, the document, the
 * instants).
 */
async function getIngestJob(
  env: GatewayEnv,
  _request: GatewayRequest,
  params: Record<string, string>,
): Promise<GatewayAnswer<IngestJobValue>> {
  let row: GatewayJobRow | null;
  try {
    row = env.jobs.getjob(params.id);
  } catch (error) {
    return err("db-failed", 500, `the ledger refused the read: ${errmsgof(error)}`);
  }
  if (row === null) return err("not-found", 404, `no job answers ${params.id}`);
  return ok(jobwire(row));
}

/**
 * GET /api/v1/ingest — the shelf rows under the visibility law: the
 * vitrine rows list for everyone, the private rows ride only when the
 * ownerId query carries their owner's pointer.
 */
async function listIngestShelf(
  env: GatewayEnv,
  request: GatewayRequest,
): Promise<GatewayAnswer<{ records: IngestStampRow[] }>> {
  const owner = request.query.ownerId;
  if (owner !== undefined && !blobidvalid(owner)) {
    return err("bad-owner", 400, "the ownerId query must ride the minted decimal form");
  }
  let rows: IngestStampRow[];
  try {
    rows = await env.db.liststampedrows();
  } catch (error) {
    return err("db-failed", 500, `the shelf refused the list: ${errmsgof(error)}`);
  }
  const visible = rows.filter((row) => row.visibility === "vitrine" || (owner !== undefined && row.ownerId === owner));
  return ok({ records: visible });
}

/**
 * GET /api/v1/ingest/:id — the stamped document row: the identity
 * columns (the owner, the kind, the visibility, the pointer pair, the
 * size, the sha) beside the parsed document json.
 */
async function getIngest(
  env: GatewayEnv,
  _request: GatewayRequest,
  params: Record<string, string>,
): Promise<GatewayAnswer<IngestStampRow>> {
  let row: IngestStampRow | null;
  try {
    row = await env.db.getstampedrow(params.id);
  } catch (error) {
    return err("db-failed", 500, `the shelf refused the read: ${errmsgof(error)}`);
  }
  if (row === null) return err("not-found", 404, `no document answers ${params.id}`);
  return ok(row);
}

/**
 * Removes every blob the stamped row addresses — the mix, the stems
 * manifest, and the stem wavs the manifest names. Best-effort by law: the
 * row is already gone, a missing or hostile blob never blocks the answer
 * (an orphan byte folds away with the store's own sweep; a dangling row
 * never comes back).
 *
 * @param env the gateway environment.
 * @param row the row that was dropped.
 */
async function removeblobs(env: GatewayEnv, row: IngestStampRow): Promise<void> {
  const ids = new Set<string>([row.mixPointer, row.stemsPointer]);
  try {
    const manifest = await env.store.get(row.stemsPointer);
    if (manifest.ok && manifest.data !== null) {
      const parsed = JSON.parse(new TextDecoder().decode(manifest.data)) as Partial<IngestStemsManifest>;
      if (parsed.schema === INGEST_STEMS_SCHEMA_VERSION && Array.isArray(parsed.stems)) {
        for (const stem of parsed.stems) {
          if (stem && typeof stem.pointer?.id === "string") ids.add(stem.pointer.id);
        }
      }
    }
  } catch {
    // a manifest that fails the parse never blocks the removal
  }
  for (const id of ids) {
    try {
      await env.store.remove(id);
    } catch {
      // a hostile store never blocks the answer — the row is already gone
    }
  }
}

/**
 * DELETE /api/v1/ingest/:id — drops the row, then the blobs ride along
 * through the store (the mix, the manifest, the stems the manifest
 * names). The row drops first — a crash leaves orphan blobs, never a row
 * that points at missing bytes (the bytes-before-row law mirrored).
 */
async function deleteIngest(
  env: GatewayEnv,
  _request: GatewayRequest,
  params: Record<string, string>,
): Promise<GatewayAnswer<{ removed: boolean; id: string }>> {
  let row: IngestStampRow | null;
  try {
    row = await env.db.getstampedrow(params.id);
  } catch (error) {
    return err("db-failed", 500, `the shelf refused the read: ${errmsgof(error)}`);
  }
  if (row === null) return err("not-found", 404, `no document answers ${params.id}`);
  try {
    await env.db.dropstampedrow(params.id);
  } catch (error) {
    return err("db-failed", 500, `the shelf refused the drop: ${errmsgof(error)}`);
  }
  await removeblobs(env, row);
  return ok({ removed: true, id: params.id });
}

/**
 * GET /api/v1/blob/:id — streams the bytes with the pointer's kind as
 * the content type. The handler answers the bytes and the mime; the
 * transport adaptation (the headers, the content-type, the digest
 * headers the gateway seam reads) is the gateway's job, the family law.
 */
async function getBlob(
  env: GatewayEnv,
  _request: GatewayRequest,
  params: Record<string, string>,
): Promise<GatewayAnswer<BlobStreamValue>> {
  let got: BlobResult;
  try {
    got = await env.store.get(params.id);
  } catch (error) {
    return err("store-failed", 500, `the blob store threw: ${errmsgof(error)}`);
  }
  if (!got.ok) {
    if (got.code === "not-found") return err("not-found", 404, got.message);
    if (got.code === "bad-id") return err("bad-request", 400, got.message);
    return err("store-failed", 500, `${got.code}: ${got.message}`);
  }
  if (got.data === null) {
    return err("store-failed", 500, `the blob store answered no bytes for ${params.id}`);
  }
  return ok({ bytes: got.data, mime: got.pointer.kind, pointer: got.pointer });
}

/** @section dispatch — the one entry the transport calls */

/** The handler seat one route table row names — pure over the
 * environment, typed in the answer, never a throw (the guards translate
 * a hostile seat into the machine code of its lane). */
export type GatewayHandler = (
  env: GatewayEnv,
  request: GatewayRequest,
  params: Record<string, string>,
) => Promise<GatewayAnswer>;

/** The handler catalog the route table names — one seat per name (the
 * compile-time lockstep with GatewayHandlerName). */
const handlers: Record<GatewayHandlerName, GatewayHandler> = {
  uploadIngest,
  getIngestJob,
  listIngestShelf,
  getIngest,
  deleteIngest,
  getBlob,
};

/**
 * Dispatches one request against the route table — the single entry the
 * transport adapter calls. Never a throw: the table miss answers the 404
 * shape, the method miss the 405 shape, a hostile seat the machine code
 * of its lane, and the last-resort guard (a handler that faulted past its
 * own guards — unreachable in practice) the db-failed shape.
 *
 * @param env the injected environment.
 * @param request the transport-neutral request.
 * @returns the typed answer.
 */
export async function dispatch(env: GatewayEnv, request: GatewayRequest): Promise<GatewayAnswer> {
  const method = request.method.trim().toUpperCase();
  const verdict = matchroute(method, request.path);
  if (verdict.kind === "absent") {
    return err("not-found", 404, `no route answers ${request.path}`);
  }
  if (verdict.kind === "method") {
    return err(
      "method-not-allowed",
      405,
      `${method} does not ride ${request.path} — the table answers ${verdict.allowed.join(", ")}`,
    );
  }
  try {
    return await handlers[verdict.route.handler](env, request, verdict.params);
  } catch (error) {
    return err("db-failed", 500, `the route faulted past its guards: ${errmsgof(error)}`);
  }
}

/** @section startjob — the run lane the caller loop drives */

/** Maps a worker failure code onto the gateway code of its lane — the
 * store and db codes ride their own lanes, the decode and empty-audio
 * codes ride bad-request (the bytes were the caller's). */
function mapcode(code: IngestJobErrorCode): { code: GatewayErrorCode; status: number } {
  if (code === "store-failed") return { code: "store-failed", status: 500 };
  if (code === "db-failed") return { code: "db-failed", status: 500 };
  return { code: "bad-request", status: 400 };
}

/**
 * Starts one queued job — the caller lane (the gateway worker loop) hands
 * the queued payload and this function walks the worker end to end with
 * the ledger row riding along: the state moves queued → running, every
 * completed phase patches the phase and the ascending fraction (the
 * worker's own report), and the walk lands done with the document id or
 * failed with the honest error code ("<code>: <message>"). Never a throw;
 * every refusal answers the typed err; a re-run of a landed job answers
 * conflict (the walk is one-shot — a fresh upload mints a fresh job).
 *
 * @param env the injected environment.
 * @param jobId the queued job the upload registered.
 * @param payload the queued payload the caller lane carries (the bytes
 *   and the identity facts the worker needs).
 * @returns the landed run (the document, the pointers, the row id), or
 *   the typed err of the refusing lane.
 */
export async function startJob(
  env: GatewayEnv,
  jobId: string,
  payload: GatewayJobPayload,
): Promise<GatewayAnswer<IngestRunValue>> {
  let row: GatewayJobRow | null;
  try {
    row = env.jobs.getjob(jobId);
  } catch (error) {
    return err("db-failed", 500, `the ledger refused the read: ${errmsgof(error)}`);
  }
  if (row === null) return err("not-found", 404, `no job answers ${jobId}`);
  if (row.state !== "queued") {
    return err("conflict", 409, `the job ${jobId} is ${row.state} — only a queued job starts`);
  }
  try {
    env.jobs.updatejob(jobId, { state: "running", fraction: 0 });
  } catch (error) {
    return err("db-failed", 500, `the ledger refused the running patch: ${errmsgof(error)}`);
  }
  const result = await runIngestJob(
    {
      bytes: payload.bytes,
      name: payload.name,
      ownerId: row.owner_id,
      kind: payload.kind,
      visibility: payload.visibility,
      store: env.store,
      db: env.db,
      at: env.now(),
    },
    (progress) => {
      try {
        env.jobs.updatejob(jobId, { phase: progress.phase, fraction: progress.fraction });
      } catch {
        // a hostile ledger never breaks the run — the answer matters more
      }
    },
  );
  if (!result.ok) {
    const failure = `${result.code}: ${result.message}`;
    try {
      env.jobs.updatejob(jobId, { state: "failed", error: failure, finished_at: env.now() });
    } catch (error) {
      return err("db-failed", 500, `the ledger refused the failure stamp: ${errmsgof(error)}`);
    }
    const mapped = mapcode(result.code);
    return err(mapped.code, mapped.status, failure);
  }
  try {
    env.jobs.updatejob(jobId, {
      state: "done",
      fraction: 1,
      document_id: result.rowId ?? null,
      finished_at: env.now(),
    });
  } catch (error) {
    return err(
      "db-failed",
      500,
      `the ledger refused the done stamp (the document ${result.rowId ?? "?"} landed): ${errmsgof(error)}`,
    );
  }
  return ok({
    jobId,
    state: "done",
    documentId: result.rowId ?? null,
    document: result.document,
    pointers: result.pointers,
  });
}
