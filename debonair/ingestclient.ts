// # ingestclient — the typed client of the gateway ingest lane (root
// layer, waves PV1.007 + PV1.008): the browser-side seat that speaks the
// six routes the gateway table serves — the upload that queues the job,
// the progress query the bench polls, the shelf list under the visibility
// law, the document read and the document removal. every call answers a
// typed result, never a throw: the machine codes are offline (the host
// law refused the origin, or the network never answered), timeout (the
// call kept silent past its window), refused (the gateway answered a
// status outside the 2xx lane beyond the 400 law), bad-response (the
// gateway answered 2xx but the body failed the shape guard) and
// bad-request (the gateway refused the caller's facts with a 400). the
// https law is the house one: the origin passes hostallowed before any
// call leaves the host (https only, public hosts only — the same law
// onboardingstate carries), every call rides an abort window (the json
// lanes the onboardingstate window, the upload lane the blob byte-body
// window), and the fetch seam is injected (the tests hand doubles, the
// browser hands the default). the wire types ride the gateway's own
// projections (IngestJobValue, IngestStampRow — imported, never re-typed,
// the lockstep law the worker rides against the wavwriter tables). the
// owner identity seat rides the onboardingstate law: one minted decimal
// id per browser, localStorage-cached, module-memory for the session —
// every upload stamps it, every shelf query carries it. zero
// dependencies, zero consumer data.

import { mintid } from "./bigintids.ts";
import { blobidvalid } from "./blobstore.ts";
import type { IngestJobValue } from "./gatewayapi.ts";
import type { IngestJobKind, IngestJobVisibility, IngestStampRow } from "./ingestworker.ts";
import { hostallowed } from "./onboardingstate.ts";

/** @section codes — the typed failure branch */

/** The machine codes the client answers — one per lane, never a throw. */
export type IngestClientCode = "offline" | "timeout" | "refused" | "bad-response" | "bad-request";

/** One typed client failure — the code, the readable message and the http
 * status the gateway answered (null when no answer arrived). */
export interface IngestClientError {
  /** The machine code of the refusing lane. */
  code: IngestClientCode;
  /** The readable message (the gateway's own message rides when it sent one). */
  message: string;
  /** The http status of the refusal (null on offline and timeout). */
  status: number | null;
}

/** The typed result every client call answers. */
export type IngestClientResult<T> = { ok: true; data: T } | { ok: false; error: IngestClientError };

/** The failure branch builder. */
function fail(
  code: IngestClientCode,
  message: string,
  status: number | null = null,
): { ok: false; error: IngestClientError } {
  return { ok: false, error: { code, message, status } };
}

/** @section seams — the injected dependencies */

/** The seams one call rides (the cloudsync discipline: the tests inject
 * doubles, the browser hands the defaults; the abort window is injectable
 * so the timeout lane tests in milliseconds). */
export interface IngestClientDeps {
  /** The fetch implementation (defaults to globalThis.fetch). */
  fetchImpl?: typeof fetch;
  /** The abort window in ms (defaults per lane — the call lanes 2500, the
   * upload lane 30000; the tests pin it). */
  timeoutMs?: number;
}

/** The abort window of the json lanes (the onboardingstate law — a slow
 * gateway must never hang a page). */
export const INGEST_CALL_TIMEOUT_MS = 2500;

/** The abort window of the upload lane — byte bodies ride the blob law
 * (the same window the gateway blob store's own lane carries). */
export const INGEST_UPLOAD_TIMEOUT_MS = 30_000;

/** The readable message of any thrown failure. */
function errmsg(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** @section base64 — the json body encode lane */

/** The standard base64 alphabet (the upload's json lane carries the bytes
 * as base64 — the gateway decodes it back with its own strict table, so
 * this encoder mirrors that law: padded, honest, zero dependencies). */
const B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Encodes bytes as standard padded base64 — the json lane of the upload
 * route (the same hand-rolled discipline the gateway's decoder rides,
 * never btoa: the lane must answer identically on every host).
 *
 * @param bytes the bytes to encode.
 * @returns the base64 text.
 */
function encodebase64(bytes: Uint8Array): string {
  let out = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const b0 = bytes[index];
    const b1 = index + 1 < bytes.length ? bytes[index + 1] : 0;
    const b2 = index + 2 < bytes.length ? bytes[index + 2] : 0;
    const has1 = index + 1 < bytes.length;
    const has2 = index + 2 < bytes.length;
    out += B64_ALPHABET[b0 >> 2];
    out += B64_ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)];
    out += has1 ? B64_ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)] : "=";
    out += has2 ? B64_ALPHABET[b2 & 0x3f] : "=";
  }
  return out;
}

/** @section lane — the one call every function rides */

/**
 * One gateway call under the house https law: the origin passes
 * hostallowed before any byte leaves the host (a refusal answers offline
 * and never fetches), the abort window guards the wait (a silent gateway
 * answers timeout), the non-2xx answers translate by status (400 the
 * bad-request lane, the rest refused, the gateway's own message riding
 * when it sent one), and a 2xx body that fails the shape guard answers
 * bad-response. never a throw.
 *
 * @param origin the gateway origin (https, a public host).
 * @param method the http method.
 * @param path the route path with the query.
 * @param body the json body (undefined rides a bodyless call).
 * @param timeoutMs the abort window.
 * @param validate the shape guard (null answers bad-response).
 * @param deps the injected seams.
 * @returns the typed result.
 */
async function lane<T>(
  origin: string,
  method: string,
  path: string,
  body: unknown | undefined,
  timeoutMs: number,
  validate: (parsed: unknown) => T | null,
  deps: IngestClientDeps = {},
): Promise<IngestClientResult<T>> {
  if (!hostallowed(origin)) {
    return fail("offline", `the origin ${JSON.stringify(origin)} refuses the house https law`);
  }
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    return fail("offline", "no fetch seam on this host");
  }
  const waitMs = deps.timeoutMs ?? timeoutMs;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), waitMs);
  let response: Response;
  try {
    response = await fetchImpl(`${origin}${path}`, {
      method,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    return aborted
      ? fail("timeout", `the gateway kept silent past ${waitMs} ms`)
      : fail("offline", `the gateway is unreachable: ${errmsg(error)}`);
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    const wire = await response
      .json()
      .then((parsed) => (parsed as { error?: { message?: unknown } })?.error)
      .catch(() => null);
    const message =
      wire && typeof wire.message === "string" && wire.message.length > 0
        ? wire.message
        : `the gateway answered ${response.status}`;
    if (response.status === 400) return fail("bad-request", message, 400);
    return fail("refused", message, response.status);
  }
  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch (error) {
    return fail("bad-response", `the gateway answered no json: ${errmsg(error)}`, response.status);
  }
  const guarded = validate(parsed);
  if (guarded === null) {
    return fail("bad-response", "the gateway answered a foreign shape", response.status);
  }
  return { ok: true, data: guarded };
}

/** @section guards — the wire shape validators */

/** The job walk states the wire carries. */
const JOB_STATES: readonly string[] = ["queued", "running", "done", "failed"];

/** The ingest kinds the stamped rows carry (the schema law — the render
 * lane rides the same column, so the guard accepts all three). */
const ROW_KINDS: readonly string[] = ["upload", "reference", "render"];

/** The visibility lanes the stamped rows carry. */
const ROW_VISIBILITIES: readonly string[] = ["private", "vitrine"];

/**
 * Guards one job row — the walk the bench polls: the state off the enum,
 * the fraction outside 0..1 or a missing pointer answers null.
 *
 * @param parsed the json the route answered.
 * @returns the job row, or null when the shape is foreign.
 */
function jobvalid(parsed: unknown): IngestJobValue | null {
  if (typeof parsed !== "object" || parsed === null) return null;
  const row = parsed as Record<string, unknown>;
  if (typeof row.id !== "string" || row.id.length === 0) return null;
  if (typeof row.ownerId !== "string" || row.ownerId.length === 0) return null;
  if (typeof row.state !== "string" || !JOB_STATES.includes(row.state)) return null;
  if (typeof row.fraction !== "number" || !Number.isFinite(row.fraction) || row.fraction < 0 || row.fraction > 1)
    return null;
  if (row.phase !== null && typeof row.phase !== "string") return null;
  if (row.documentId !== null && typeof row.documentId !== "string") return null;
  if (row.error !== null && typeof row.error !== "string") return null;
  if (typeof row.createdAt !== "string") return null;
  if (row.finishedAt !== null && typeof row.finishedAt !== "string") return null;
  return parsed as IngestJobValue;
}

/**
 * Guards one stamped document row — the identity columns (the owner, the
 * kind, the visibility) beside the pointers and the document itself.
 *
 * @param parsed the json the route answered.
 * @returns the stamped row, or null when the shape is foreign.
 */
function rowvalid(parsed: unknown): IngestStampRow | null {
  if (typeof parsed !== "object" || parsed === null) return null;
  const row = parsed as Record<string, unknown>;
  if (typeof row.id !== "string" || row.id.length === 0) return null;
  if (typeof row.ownerId !== "string" || row.ownerId.length === 0) return null;
  if (typeof row.kind !== "string" || !ROW_KINDS.includes(row.kind)) return null;
  if (typeof row.visibility !== "string" || !ROW_VISIBILITIES.includes(row.visibility)) return null;
  if (typeof row.name !== "string" || row.name.length === 0) return null;
  if (typeof row.mixPointer !== "string" || row.mixPointer.length === 0) return null;
  if (typeof row.stemsPointer !== "string" || row.stemsPointer.length === 0) return null;
  if (typeof row.sizeBytes !== "number" || !Number.isFinite(row.sizeBytes)) return null;
  if (typeof row.sha256 !== "string") return null;
  if (typeof row.sampleRate !== "number" || !Number.isFinite(row.sampleRate)) return null;
  if (typeof row.durationSeconds !== "number" || !Number.isFinite(row.durationSeconds)) return null;
  if (typeof row.pcmhash !== "number" || !Number.isFinite(row.pcmhash)) return null;
  if (typeof row.ingestedAt !== "string") return null;
  if (typeof row.document !== "object" || row.document === null) return null;
  return parsed as IngestStampRow;
}

/** @section calls — the five seats of the lane */

/** The upload facts the json lane posts (the base64 bytes, the display
 * name, the owner stamp, the kind and the visibility). */
export interface UploadIngestInput {
  /** The source bytes (the gateway decodes them at the run). */
  bytes: Uint8Array;
  /** The display name of the source (the worker folds the extension). */
  name: string;
  /** The owner stamp — the minted decimal id every document carries. */
  ownerId: string;
  /** The ingest kind: a visitor upload or a system reference. */
  kind: IngestJobKind;
  /** The visibility the stamped document carries. */
  visibility: IngestJobVisibility;
  /** The gateway origin (https, a public host). */
  origin: string;
}

/**
 * POST /api/v1/ingest/upload — queues one ingest job: the bytes ride the
 * json lane as base64, the gateway mints the job id and registers the
 * queued ledger row. the run itself starts through the gateway worker
 * loop (startJob) — the walk lands through pollJob.
 *
 * @param input the upload facts.
 * @param deps the injected seams.
 * @returns the job id, or the typed err of the refusing lane.
 */
export async function uploadIngest(
  input: UploadIngestInput,
  deps: IngestClientDeps = {},
): Promise<IngestClientResult<{ jobId: string }>> {
  return lane(
    input.origin,
    "POST",
    "/api/v1/ingest/upload",
    {
      bytes: encodebase64(input.bytes),
      name: input.name,
      ownerId: input.ownerId,
      kind: input.kind,
      visibility: input.visibility,
    },
    INGEST_UPLOAD_TIMEOUT_MS,
    (parsed) => {
      if (typeof parsed !== "object" || parsed === null) return null;
      const jobId = (parsed as Record<string, unknown>).jobId;
      return typeof jobId === "string" && jobId.length > 0 ? { jobId } : null;
    },
    deps,
  );
}

/**
 * GET /api/v1/ingest/jobs/:id — the job row the bench polls: the walk
 * state, the last completed phase, the ascending fraction, the honest
 * failure, the stamped document id and the instants.
 *
 * @param jobId the queued job the upload answered.
 * @param origin the gateway origin.
 * @param deps the injected seams.
 * @returns the job row, or the typed err of the refusing lane.
 */
export async function pollJob(
  jobId: string,
  origin: string,
  deps: IngestClientDeps = {},
): Promise<IngestClientResult<IngestJobValue>> {
  return lane(
    origin,
    "GET",
    `/api/v1/ingest/jobs/${encodeURIComponent(jobId)}`,
    undefined,
    INGEST_CALL_TIMEOUT_MS,
    jobvalid,
    deps,
  );
}

/**
 * GET /api/v1/ingest — the shelf rows under the visibility law: the
 * vitrine rows list for everyone, the private rows ride only when the
 * ownerId query carries their owner's pointer. a foreign row never
 * blocks the shelf (the valid rows ride, the guard skips the rest).
 *
 * @param origin the gateway origin.
 * @param ownerId the owner pointer the private rows ride for (optional).
 * @param deps the injected seams.
 * @returns the stamped rows, or the typed err of the refusing lane.
 */
export async function fetchShelf(
  origin: string,
  ownerId?: string,
  deps: IngestClientDeps = {},
): Promise<IngestClientResult<IngestStampRow[]>> {
  const query = ownerId === undefined ? "" : `?ownerId=${encodeURIComponent(ownerId)}`;
  return lane(
    origin,
    "GET",
    `/api/v1/ingest${query}`,
    undefined,
    INGEST_CALL_TIMEOUT_MS,
    (parsed) => {
      if (typeof parsed !== "object" || parsed === null) return null;
      const records = (parsed as Record<string, unknown>).records;
      if (!Array.isArray(records)) return null;
      const rows: IngestStampRow[] = [];
      for (const record of records) {
        const guarded = rowvalid(record);
        if (guarded !== null) rows.push(guarded);
      }
      return rows;
    },
    deps,
  );
}

/**
 * GET /api/v1/ingest/:id — one stamped document row: the identity columns
 * beside the parsed document json (the bench renders the cards from it).
 *
 * @param id the document id.
 * @param origin the gateway origin.
 * @param deps the injected seams.
 * @returns the stamped row, or the typed err of the refusing lane.
 */
export async function fetchDocument(
  id: string,
  origin: string,
  deps: IngestClientDeps = {},
): Promise<IngestClientResult<IngestStampRow>> {
  return lane(
    origin,
    "GET",
    `/api/v1/ingest/${encodeURIComponent(id)}`,
    undefined,
    INGEST_CALL_TIMEOUT_MS,
    rowvalid,
    deps,
  );
}

/**
 * DELETE /api/v1/ingest/:id — drops the row and every blob it addresses
 * (the mix, the manifest, the stems the manifest names).
 *
 * @param id the document id.
 * @param origin the gateway origin.
 * @param deps the injected seams.
 * @returns the removal ack, or the typed err of the refusing lane.
 */
export async function deleteDocument(
  id: string,
  origin: string,
  deps: IngestClientDeps = {},
): Promise<IngestClientResult<{ removed: boolean; id: string }>> {
  return lane(
    origin,
    "DELETE",
    `/api/v1/ingest/${encodeURIComponent(id)}`,
    undefined,
    INGEST_CALL_TIMEOUT_MS,
    (parsed) => {
      if (typeof parsed !== "object" || parsed === null) return null;
      const record = parsed as Record<string, unknown>;
      return record.removed === true && typeof record.id === "string" && record.id.length > 0
        ? { removed: true, id: record.id }
        : null;
    },
    deps,
  );
}

/** @section identity — the owner seat and the origin */

/** The localStorage key of the owner identity (the onboardingstate seat
 * law: the db rows are keyed by the stamp, the cache survives reloads). */
const OWNER_KEY = "debonair.owner.id";

/** The session memory of the owner stamp (never re-mints within a session). */
let ownermemo: string | null = null;

/**
 * The owner identity seat — the stamp every upload carries and every
 * private shelf query rides: one minted decimal id per browser, generated
 * once, cached in localStorage (the onboardingstate visitor-seat law) and
 * mirrored in module memory for the session. a sealed storage keeps the
 * session stamp in memory only; a host without a window (the lanes the
 * tests drive) answers the process stamp.
 *
 * @returns the owner id in the minted decimal form.
 */
export function ownerid(): string {
  if (ownermemo !== null) return ownermemo;
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(OWNER_KEY);
      if (stored !== null && blobidvalid(stored)) {
        ownermemo = stored;
        return stored;
      }
    } catch {
      // storage sealed: the session mints below
    }
    const fresh = mintid();
    try {
      window.localStorage.setItem(OWNER_KEY, fresh);
    } catch {
      // the cache is best effort: the session memory holds the stamp
    }
    ownermemo = fresh;
    return fresh;
  }
  ownermemo ??= mintid();
  return ownermemo;
}

/** The configured gateway origin (the ingest store env law, read lazily
 * so the lane follows the deploy configuration at call time — never a
 * hardcoded domain). */
export function ingestorigin(): string {
  const raw =
    typeof import.meta !== "undefined"
      ? ((import.meta.env?.VITE_DEBONAIR_URL as string | undefined) ?? undefined)
      : undefined;
  return (raw ?? "").trim().replace(/\/+$/, "");
}
