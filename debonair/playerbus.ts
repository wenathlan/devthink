// # playerbus — the shared playback host of debonair (root layer): ONE
// take engine for the whole app, so the suno-style player bar on the shell
// and the song cards on the landing drive the same real transport the studio
// page rides. The bus owns the shelf (the session takes plus the demo plan),
// the current take, the playhead clock and the typed failure notice; pages
// subscribe for snapshots and every control goes through here, so two
// surfaces can never fight over two engines. The studio hushes the bus on
// mount (one audible transport at a time) — the bus never reaches back into
// the studio. Zero storage writes: the shelf rides the session scope.
//
// The playback-proof lane (wave PV2.002): the shelf is a GRAMMAR UNION —
// the generated takes (TakePlan, the synth scheduler) and the ingested
// references (ReferenceTake, a blob pointer the seam resolves) ride the
// same bus surface: play/pause/seek/stop, the playhead clock, the loop and
// the typed notice. A reference take carries {blobId, mime, name,
// durationSeconds}; the bytes resolve through the injected fetch-bytes
// seam (the session mirror first, the gateway law GET /api/v1/blob/:id
// after — never a hardcoded domain), the decode seam answers pure decoded
// audio, and the ReferenceTransport plays it through its own AudioContext
// with the same clock law the TakeEngine rides. The honest typed errors —
// blob-missing, decode-failed, unsupported-mime — surface through the
// snapshot beside the message.
//
// The recon ladder (wave 16b): a recon take — a debonair.recon/3 document
// with no stored pcm — climbs the honest escada of docs/recon.spec.md §6:
// (1) the memory cache (a reconstruction this tab already landed), (2) the
// blob lane (a stored reconstruction the take carries a pointer to), (3)
// the recon gateway lane (POST /api/v1/recon with the document, the job
// poll, the wav the blob route answers), (4) the typed refusal
// recon-unavailable when no lane answers — never a fake, never a
// placeholder. The reconstruction plays through the reference transport
// (decoded audio — the same clock, the same singleton law: one audible
// transport, the plan engine hushing beside it).

import { planTake, type TakePlan } from "./arranger.ts";
import { TakeEngine, TransportError } from "./audio.ts";
import { gatewayblobstore, sessionblobstore } from "./blobstore.ts";
import type { ReconDocument } from "./reconpayload.ts";
import { findTakeRecord, loadTakeRecords, type StorageLike, sessionStorageOrMemory } from "./take.ts";

/** The demo take the bus always carries (the studio's own demo seed). */
const DEMO_PROMPT = "midnight studio take, warm sub bass, dusty keys, brass light";
const DEMO_SEED = "debonair-demo";

// ---- the reference take lane -------------------------------------------------

/** The blob pointer a reference take plays: the id the blob store minted,
 * the bare mime the bytes answer ("audio/wav"), the display name and the
 * duration the document pinned — everything the bus needs before the bytes
 * arrive, so the shelf row renders and the seek lane clamps without i/o. */
export interface ReferenceSource {
  /** The minted 64-bit blob id (decimal string — the store owns the shape). */
  blobId: string;
  /** The bare mime the stored bytes answer ("audio/wav"). */
  mime: string;
  /** The display name of the stored source. */
  name: string;
  /** The duration in seconds (the document's own number). */
  durationSeconds: number;
}

/** One ingested reference on the bus shelf: a take whose source is a blob
 * pointer, not a synth plan — the bench and the library feature it exactly
 * the way a generated take is featured, and the bar plays it through the
 * same transport surface. */
export interface ReferenceTake {
  /** The take kind — the reference lane (the discriminant of the union). */
  kind: "reference";
  /** The stable id of the take (the record id the shelf dedupes on). */
  id: string;
  /** The display name (the ingested track name). */
  name: string;
  /** The shelf origin — "bench" (an ingested reference) or "render" (a
   * generated take whose landed wav rides the same blob lane); the
   * display decides the identity line. Absent reads "bench" — the
   * standing rows the playback wave stored keep their face. */
  origin?: ReferenceOrigin;
  /** The blob pointer the bytes resolve through. */
  source: ReferenceSource;
}

/** The shelf origins the blob lane carries: the ingested references the
 * bench stored and the rendered takes the generation lane landed (the
 * same transport, the same grammar — the row says which lane it came
 * from). */
export type ReferenceOrigin = "bench" | "render";

/** Every take the bus shelf carries: the generated plans, the ingested
 * references and the recon documents — one grammar, the row decides by kind. */
export type BusTake = TakePlan | ReferenceTake | ReconTake;

/**
 * One recon take on the bus shelf: a debonair.recon/3 document the ladder
 * renders back into sound — the payload rung of docs/recon.spec.md §6. The
 * document carries everything the reconstruction needs (the 82 seats); the
 * optional wav blob pointer names a stored reconstruction (the blob rung —
 * a landed render the ladder resolves before it queues a fresh job).
 */
export interface ReconTake {
  /** The take kind — the recon lane (the discriminant of the union). */
  kind: "recon";
  /** The stable id of the take (the bus dedupes and caches on it). */
  id: string;
  /** The display name (the analyzed take's name). */
  name: string;
  /** The recon document (the debonair.recon/3 payload the ladder renders from). */
  document: ReconDocument;
  /** The blob pointer of a stored reconstruction wav, when one landed (the
   * blob rung — resolved before the gateway rung climbs). */
  wavBlobId?: string;
}

/**
 * Reads the reference discriminant of any shelf take.
 *
 * @param take the shelf take.
 * @returns true when the take rides the reference lane.
 */
export function isReferenceTake(take: BusTake): take is ReferenceTake {
  return "kind" in take && take.kind === "reference";
}

/**
 * Reads the recon discriminant of any shelf take.
 *
 * @param take the shelf take.
 * @returns true when the take rides the recon lane.
 */
export function isReconTake(take: BusTake): take is ReconTake {
  return "kind" in take && take.kind === "recon";
}

/**
 * The duration of any shelf take (the bus clock law: the plan answers its
 * own field, the reference its source's, the recon its document's header).
 *
 * @param take the shelf take.
 * @returns the duration in seconds.
 */
export function durationOfTake(take: BusTake): number {
  if (isReconTake(take)) return take.document.header.durationSeconds;
  return isReferenceTake(take) ? take.source.durationSeconds : take.durationSeconds;
}

/** The decoded audio of one reference — the pure shape the decode seam
 * answers and the transport plays (no WebAudio types: the browser seam
 * decodes over decodeAudioData, the tests answer the same shape directly). */
export interface DecodedReference {
  /** The sample channels (one Float32Array per channel, uniform length). */
  channels: Float32Array<ArrayBuffer>[];
  /** The sample rate of the channels. */
  sampleRate: number;
  /** The duration in seconds. */
  durationSeconds: number;
}

/** The honest typed failures of the reference lane: the blob law first
 * (the bytes never answered), the mime law second (the blob is not audio
 * this bus plays), the decoder last (the bytes are audio but refused). */
export type ReferencePlayCode = "blob-missing" | "decode-failed" | "unsupported-mime";

/** The honest typed failure of the recon lane: no rung of the ladder
 * answered — the memory cache empty, the blob lane missing, the gateway
 * lane offline. The bus refuses with this code; it never fakes a render. */
export type ReconPlayCode = "recon-unavailable";

/** Every typed notice code the snapshot can carry (empty while healthy). */
export type BusNoticeCode = ReferencePlayCode | ReconPlayCode | "";

/** The fetch-bytes seam answer: the bytes and the mime the lane honored,
 * or the typed missing-blob failure. */
export type FetchBytesAnswer =
  | { ok: true; bytes: Uint8Array; mime: string }
  | { ok: false; code: "blob-missing"; message: string };

/** The decode seam answer: the pure decoded audio, or the typed failure. */
export type DecodeBytesAnswer =
  | { ok: true; audio: DecodedReference }
  | { ok: false; code: "decode-failed" | "unsupported-mime"; message: string };

/** The resolution answer the bus plays or renders (the seam pair collapsed
 * into one typed result — the error arm carries the reference codes and the
 * recon lane's typed refusal, the honest unions the ladder answers). */
export type ResolveReferenceAnswer =
  | { ok: true; audio: DecodedReference }
  | { ok: false; code: ReferencePlayCode | ReconPlayCode; message: string };

/** The seam pair the reference lane rides, injectable so the tests pin the
 * contract and a deploy can redirect the lanes (the defaults follow the
 * house laws: the session mirror then the gateway url, the host decoder). */
export interface ReferenceSeams {
  /** Answers the bytes of one blob pointer (the url law lives here). */
  fetchBytes(source: ReferenceSource): Promise<FetchBytesAnswer>;
  /** Answers the decoded audio of the bytes (the mime already honored). */
  decodeAudio(bytes: Uint8Array, mime: string): Promise<DecodeBytesAnswer>;
}

/**
 * The mime law of the reference lane: a bare mime (the rfc shape, never
 * parameters) whose type is audio — everything else answers
 * unsupported-mime before a byte decodes.
 *
 * @param mime the candidate mime.
 * @returns true when the bus may decode the bytes.
 */
export function referenceMimePlayable(mime: string): boolean {
  return /^audio\/[a-z0-9!#$%&'*+\-.^_`|~]+$/i.test(mime.trim());
}

/** The readable message of any failure. */
function errmsg(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** The configured gateway origin (the ingest store's env law, read lazily
 * so the lane follows the deploy configuration at call time — never a
 * hardcoded domain). */
function gatewayOrigin(): string {
  const raw =
    typeof import.meta !== "undefined"
      ? ((import.meta.env?.VITE_DEBONAIR_URL as string | undefined) ?? undefined)
      : undefined;
  return (raw ?? "").trim().replace(/\/+$/, "");
}

/**
 * The default fetch-bytes seam: the session mirror first (the bytes the
 * bench stored on this device), the gateway lane after (the same law the
 * blob store's gateway backend rides — GET {origin}/api/v1/blob/:id under
 * the house https law, the headers and the abort window included). Every
 * miss collapses into the one honest code: the blob did not answer.
 *
 * @param source the blob pointer.
 * @returns the bytes and the mime the lane honored, or the typed failure.
 */
async function defaultFetchBytes(source: ReferenceSource): Promise<FetchBytesAnswer> {
  const mirror = await sessionblobstore().get(source.blobId);
  if (mirror.ok && mirror.data) {
    return { ok: true, bytes: mirror.data, mime: mirror.pointer.kind || source.mime };
  }
  const origin = gatewayOrigin();
  if (!origin) return { ok: false, code: "blob-missing", message: `no blob lane answers ${source.blobId}` };
  const lane = gatewayblobstore(origin);
  const answer = await lane.get(source.blobId);
  if (!answer.ok) return { ok: false, code: "blob-missing", message: answer.message };
  if (!answer.data) return { ok: false, code: "blob-missing", message: `the blob ${source.blobId} answered no bytes` };
  return { ok: true, bytes: answer.data, mime: answer.pointer.kind || source.mime };
}

/**
 * The default decode seam: the host decoder (an OfflineAudioContext
 * decodeAudioData — the same lane the bench decodes files through). A host
 * without a decoder answers the honest typed failure.
 *
 * @param bytes the bytes the fetch seam answered.
 * @param mime the mime the lane honored.
 * @returns the decoded audio, or the typed failure.
 */
async function defaultDecodeAudio(bytes: Uint8Array, mime: string): Promise<DecodeBytesAnswer> {
  const Decoder = (globalThis as { OfflineAudioContext?: typeof OfflineAudioContext }).OfflineAudioContext;
  if (typeof Decoder !== "function") {
    return { ok: false, code: "decode-failed", message: "this host carries no audio decoder" };
  }
  try {
    // decodeAudioData detaches the buffer it reads — a copy keeps the
    // caller's bytes answerable again
    const context = new Decoder(1, 1, 44100);
    const buffer = await context.decodeAudioData(bytes.slice().buffer);
    const channels: Float32Array<ArrayBuffer>[] = [];
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) channels.push(buffer.getChannelData(ch).slice());
    return { ok: true, audio: { channels, sampleRate: buffer.sampleRate, durationSeconds: buffer.duration } };
  } catch (error) {
    return { ok: false, code: "decode-failed", message: `the decoder refused the ${mime} bytes: ${errmsg(error)}` };
  }
}

/** The default seam pair (the house laws above). */
const defaultSeams: ReferenceSeams = { fetchBytes: defaultFetchBytes, decodeAudio: defaultDecodeAudio };

/** The injected seam pair (null rides the defaults). */
let injectedSeams: ReferenceSeams | null = null;

/**
 * Injects (or restores) the reference seams — the door the tests and a
 * deploy redirect the lanes through.
 *
 * @param seams the seam pair, or null to ride the defaults.
 * @returns nothing.
 */
export function busSetReferenceSeams(seams: ReferenceSeams | null): void {
  injectedSeams = seams;
}

/**
 * Reads the active reference seams (the injected pair or the defaults).
 *
 * @returns the seam pair the lane rides.
 */
export function busReferenceSeams(): ReferenceSeams {
  return injectedSeams ?? defaultSeams;
}

/**
 * Resolves one reference source into decoded audio: the bytes seam first
 * (a broken seam maps to the missing-blob code, never a throw), the mime
 * law second (the mime the seam honored, not the one the pointer declared),
 * the decoder last (a broken seam maps to the decode-failed code). Pure
 * over the seams — the bus and the tests call it alike.
 *
 * @param source the blob pointer.
 * @param seams the seam pair (defaults to the active seams).
 * @returns the decoded audio, or the typed failure.
 */
export async function resolveReferenceAudio(
  source: ReferenceSource,
  seams: ReferenceSeams = busReferenceSeams(),
): Promise<ResolveReferenceAnswer> {
  let fetched: FetchBytesAnswer;
  try {
    fetched = await seams.fetchBytes(source);
  } catch (error) {
    return { ok: false, code: "blob-missing", message: `the bytes seam refused ${source.blobId}: ${errmsg(error)}` };
  }
  if (!fetched.ok) return fetched;
  if (!referenceMimePlayable(fetched.mime)) {
    return { ok: false, code: "unsupported-mime", message: `the ${fetched.mime} blob is not audio this bus plays` };
  }
  try {
    return await seams.decodeAudio(fetched.bytes, fetched.mime);
  } catch (error) {
    return { ok: false, code: "decode-failed", message: `the decode seam refused the bytes: ${errmsg(error)}` };
  }
}

// ---- the recon ladder (memory -> blob -> gateway -> the honest refuse) ----

/** The queue answer of the recon gateway seam: the job id, or the typed
 * unavailable refusal (an offline lane, a refused document — never a fake
 * job id). */
export type ReconQueueAnswer = { ok: true; jobId: string } | { ok: false; code: ReconPlayCode; message: string };

/** The poll answer of the recon gateway seam: the walk state, the landed wav
 * pointer and the honest failure, or the typed unavailable refusal. */
export type ReconPollAnswer =
  | { ok: true; state: "queued" | "rendering" | "done" | "failed"; wavPointer: string | null; error: string | null }
  | { ok: false; code: ReconPlayCode; message: string };

/** The gateway seam pair the recon rung rides, injectable so the tests pin
 * the contract and a deploy can redirect the lane (the defaults follow the
 * house law: the configured gateway origin, never a hardcoded domain). */
export interface ReconGatewaySeams {
  /** Queues one reconstruction of the document (POST /api/v1/recon). */
  queueRecon(document: ReconDocument): Promise<ReconQueueAnswer>;
  /** Polls one queued reconstruction job (GET /api/v1/recon/jobs/:id). */
  pollReconJob(jobId: string): Promise<ReconPollAnswer>;
}

/** The poll cadence of the ladder's wait, in ms (the first poll rides
 * immediately; the attempts after breathe this interval). */
const RECON_POLL_INTERVAL_MS = 120;

/** The poll attempt budget (interval * attempts ≈ the honest wait window
 * before the ladder answers the typed refusal). */
const RECON_POLL_ATTEMPTS = 100;

/** The memory-cache ceiling — the reconstructions this tab keeps decoded
 * (the oldest evicts; the ladder's first rung, bounded like the session
 * mirror the blob lane rides). */
const RECON_CACHE_TAKES = 4;

/**
 * The default queue seam: the configured gateway origin under the house
 * https law — POST {origin}/api/v1/recon with the document on the json
 * lane. A host with no configured origin answers the typed refusal (the
 * offline lane never fakes a job); a refused document or an unreachable
 * lane maps onto the same honest code with the readable reason.
 *
 * @param document the recon document the ladder renders.
 * @returns the job id, or the typed unavailable refusal.
 */
async function defaultQueueRecon(document: ReconDocument): Promise<ReconQueueAnswer> {
  const origin = gatewayOrigin();
  if (!origin) {
    return { ok: false, code: "recon-unavailable", message: "no gateway lane answers the reconstruction" };
  }
  try {
    const response = await fetch(`${origin}/api/v1/recon`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ document }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return {
        ok: false,
        code: "recon-unavailable",
        message: `the recon lane refused the document (${response.status}): ${detail.slice(0, 160)}`,
      };
    }
    const value = (await response.json()) as { jobId?: unknown };
    if (typeof value.jobId !== "string" || value.jobId.length === 0) {
      return { ok: false, code: "recon-unavailable", message: "the recon lane answered no job id" };
    }
    return { ok: true, jobId: value.jobId };
  } catch (error) {
    return { ok: false, code: "recon-unavailable", message: `the recon lane is unreachable: ${errmsg(error)}` };
  }
}

/**
 * The default poll seam: GET {origin}/api/v1/recon/jobs/:id — the walk the
 * ladder waits on (the state, the landed wav pointer, the honest failure).
 *
 * @param jobId the queued reconstruction job.
 * @returns the walk state, or the typed unavailable refusal.
 */
async function defaultPollReconJob(jobId: string): Promise<ReconPollAnswer> {
  const origin = gatewayOrigin();
  if (!origin) {
    return { ok: false, code: "recon-unavailable", message: "no gateway lane answers the reconstruction" };
  }
  try {
    const response = await fetch(`${origin}/api/v1/recon/jobs/${encodeURIComponent(jobId)}`);
    if (!response.ok) {
      return { ok: false, code: "recon-unavailable", message: `the recon job poll refused (${response.status})` };
    }
    const value = (await response.json()) as { state?: unknown; wavPointer?: unknown; error?: unknown };
    if (value.state !== "queued" && value.state !== "rendering" && value.state !== "done" && value.state !== "failed") {
      return { ok: false, code: "recon-unavailable", message: "the recon job poll answered an unknown state" };
    }
    return {
      ok: true,
      state: value.state,
      wavPointer: typeof value.wavPointer === "string" ? value.wavPointer : null,
      error: typeof value.error === "string" ? value.error : null,
    };
  } catch (error) {
    return { ok: false, code: "recon-unavailable", message: `the recon job poll is unreachable: ${errmsg(error)}` };
  }
}

/** The default recon seam pair (the house laws above). */
const defaultReconSeams: ReconGatewaySeams = { queueRecon: defaultQueueRecon, pollReconJob: defaultPollReconJob };

/** The injected recon seam pair (null rides the defaults). */
let injectedReconSeams: ReconGatewaySeams | null = null;

/**
 * Injects (or restores) the recon gateway seams — the door the tests and a
 * deploy redirect the lane through.
 *
 * @param seams the seam pair, or null to ride the defaults.
 * @returns nothing.
 */
export function busSetReconSeams(seams: ReconGatewaySeams | null): void {
  injectedReconSeams = seams;
}

/**
 * Reads the active recon gateway seams (the injected pair or the defaults).
 *
 * @returns the seam pair the recon rung rides.
 */
export function busReconSeams(): ReconGatewaySeams {
  return injectedReconSeams ?? defaultReconSeams;
}

/** The memory cache of landed reconstructions — the ladder's first rung:
 * the decoded audio this tab already rendered, keyed by take id, the oldest
 * evicted at the ceiling. */
const reconCache = new Map<string, DecodedReference>();

/** Caches one landed reconstruction (the first rung of the next climb). */
function cacheReconstruction(takeId: string, audio: DecodedReference): void {
  if (reconCache.size >= RECON_CACHE_TAKES && !reconCache.has(takeId)) {
    const oldest = reconCache.keys().next();
    if (!oldest.done) reconCache.delete(oldest.value);
  }
  reconCache.set(takeId, audio);
}

/** One honest wait step between poll attempts (the first poll rides free). */
function reconPollDelay(attempt: number): Promise<void> {
  if (attempt === 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, RECON_POLL_INTERVAL_MS));
}

/**
 * Resolves one recon take into decoded audio — the honest escada of
 * docs/recon.spec.md §6, one rung at a time, never a fake:
 *
 * 1. the memory cache — a reconstruction this tab already landed answers
 *    without a lane;
 * 2. the blob lane — a stored reconstruction the take carries a pointer to
 *    resolves through the reference bytes+decode seams (a miss climbs);
 * 3. the recon gateway lane — the document queues (POST /api/v1/recon),
 *    the job poll waits inside the attempt budget, the landed wav resolves
 *    through the blob route and decodes;
 * 4. the typed refusal — recon-unavailable, the honest message of the last
 *    refusing rung, never a placeholder render.
 *
 * A landed reconstruction seats the memory cache (the next climb answers at
 * the first rung). Pure over the seams — the bus and the tests call it alike.
 *
 * @param take the recon take.
 * @param seams the reference seam pair (the blob rung rides them).
 * @param reconSeams the recon gateway seam pair.
 * @returns the decoded audio, or the typed failure.
 */
export async function resolveReconAudio(
  take: ReconTake,
  seams: ReferenceSeams = busReferenceSeams(),
  reconSeams: ReconGatewaySeams = busReconSeams(),
): Promise<ResolveReferenceAnswer> {
  // rung 1 — the memory cache
  const cached = reconCache.get(take.id);
  if (cached) return { ok: true, audio: cached };
  // rung 2 — the blob lane (a stored reconstruction)
  if (take.wavBlobId !== undefined) {
    const stored = await resolveReferenceAudio(
      { blobId: take.wavBlobId, mime: "audio/wav", name: take.name, durationSeconds: durationOfTake(take) },
      seams,
    );
    if (stored.ok) {
      cacheReconstruction(take.id, stored.audio);
      return stored;
    }
    // a miss climbs — the ladder never stops at a missing rung
  }
  // rung 3 — the recon gateway lane
  const queued = await reconSeams.queueRecon(take.document);
  if (!queued.ok) return { ok: false, code: "recon-unavailable", message: queued.message };
  for (let attempt = 0; attempt < RECON_POLL_ATTEMPTS; attempt++) {
    await reconPollDelay(attempt);
    const polled = await reconSeams.pollReconJob(queued.jobId);
    if (!polled.ok) return { ok: false, code: "recon-unavailable", message: polled.message };
    if (polled.state === "failed") {
      return {
        ok: false,
        code: "recon-unavailable",
        message: polled.error ?? "the reconstruction job failed",
      };
    }
    if (polled.state === "done" && polled.wavPointer !== null) {
      const landed = await resolveReferenceAudio(
        { blobId: polled.wavPointer, mime: "audio/wav", name: take.name, durationSeconds: durationOfTake(take) },
        seams,
      );
      if (landed.ok) {
        cacheReconstruction(take.id, landed.audio);
        return landed;
      }
      return {
        ok: false,
        code: "blob-missing",
        message: `the reconstruction landed but the wav ${polled.wavPointer} did not answer`,
      };
    }
  }
  // rung 4 — the honest refusal (never a fake)
  return {
    ok: false,
    code: "recon-unavailable",
    message: `the reconstruction of ${take.id} did not land inside the wait window`,
  };
}

// ---- the session reference shelf ---------------------------------------------

/** The session key the reference shelf rides (the takestore discipline). */
export const REFERENCE_STORE_KEY = "debonair.references";

/** One stored reference take (the shelf row the library lists). */
export interface ReferenceRecord {
  /** The reference take (the blob pointer it plays). */
  take: ReferenceTake;
  /** The ISO timestamp of the store. */
  savedAt: string;
}

/** The record-level guard: only well-formed reference takes ever persist. */
function referenceTakeValid(candidate: unknown): candidate is ReferenceTake {
  if (!candidate || typeof candidate !== "object") return false;
  const take = candidate as Record<string, unknown>;
  const source = take.source as Record<string, unknown> | null | undefined;
  return (
    take.kind === "reference" &&
    typeof take.id === "string" &&
    take.id.length > 0 &&
    typeof take.name === "string" &&
    (take.origin === undefined || take.origin === "bench" || take.origin === "render") &&
    !!source &&
    typeof source === "object" &&
    typeof source.blobId === "string" &&
    source.blobId.length > 0 &&
    typeof source.mime === "string" &&
    source.mime.length > 0 &&
    typeof source.name === "string" &&
    typeof source.durationSeconds === "number" &&
    Number.isFinite(source.durationSeconds) &&
    source.durationSeconds > 0
  );
}

/** Parses the stored shelf document; a broken document answers empty. */
function parseReferenceDocument(raw: string | null): ReferenceRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is ReferenceRecord => {
      const record = entry as ReferenceRecord;
      return referenceTakeValid(record?.take) && typeof record.savedAt === "string";
    });
  } catch {
    return [];
  }
}

/**
 * Loads every stored reference take, newest first.
 *
 * @param storage the storage seam (defaults to the session storage).
 * @returns the reference records.
 */
export function loadReferenceRecords(storage: StorageLike = sessionStorageOrMemory()): ReferenceRecord[] {
  return parseReferenceDocument(storage.getItem(REFERENCE_STORE_KEY)).sort((left, right) =>
    right.savedAt.localeCompare(left.savedAt),
  );
}

/**
 * Stores one reference take (replacing the record of the same take id) and
 * keeps the live bus shelf coherent with the session shelf.
 *
 * @param take the reference take to store.
 * @param storage the storage seam (defaults to the session storage).
 * @returns the records after the write, newest first.
 */
export function saveReferenceTake(
  take: ReferenceTake,
  storage: StorageLike = sessionStorageOrMemory(),
): ReferenceRecord[] {
  const record: ReferenceRecord = { take, savedAt: new Date().toISOString() };
  const rest = parseReferenceDocument(storage.getItem(REFERENCE_STORE_KEY)).filter(
    (entry) => entry.take.id !== take.id,
  );
  const records = [record, ...rest];
  storage.setItem(REFERENCE_STORE_KEY, JSON.stringify(records));
  if (!takes.some((held) => held.id === take.id)) takes = [...takes, take];
  emit();
  return records;
}

/**
 * Removes one reference take by id.
 *
 * @param id the take id.
 * @param storage the storage seam (defaults to the session storage).
 * @returns the records after the removal, newest first.
 */
export function removeReferenceTake(id: string, storage: StorageLike = sessionStorageOrMemory()): ReferenceRecord[] {
  const records = parseReferenceDocument(storage.getItem(REFERENCE_STORE_KEY)).filter((entry) => entry.take.id !== id);
  storage.setItem(REFERENCE_STORE_KEY, JSON.stringify(records));
  takes = takes.filter((held) => held.id !== id);
  if (index >= takes.length) index = Math.max(0, takes.length - 1);
  emit();
  return records;
}

// ---- the reference transport --------------------------------------------------

/** The clock surface both lanes answer (the bus drives them identically —
 * the one reason the shelf grammar stays honest). */
interface TransportClock {
  /** Starts playback from a position (the top when omitted). */
  play(from?: number): void;
  /** Stops playback and silences every scheduled voice. */
  stop(): void;
  /** The playhead position in seconds. */
  position(): number;
  /** Whether the transport wraps at the end of the take. */
  readonly loop: boolean;
}

/** The decoded-audio transport of the reference lane: one AudioContext, one
 * buffer source at a time, the same base-offset clock law the TakeEngine
 * rides. The bus owns it exactly the way it owns the plan engine. */
class ReferenceTransport {
  private readonly context: AudioContext;
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private baseOffset = 0;
  private baseTime = 0;
  private looping = false;
  private running = false;

  constructor() {
    this.context = new AudioContext({ sampleRate: 48000, latencyHint: "interactive" });
    void this.context.resume().catch(() => undefined);
  }

  /** Loads one decoded reference (the channels rebuild as one buffer). */
  load(decoded: DecodedReference): void {
    this.stop();
    const length = decoded.channels[0]?.length ?? 0;
    if (length <= 0) return;
    const buffer = this.context.createBuffer(decoded.channels.length, length, decoded.sampleRate);
    for (let ch = 0; ch < decoded.channels.length; ch++) buffer.copyToChannel(decoded.channels[ch], ch);
    this.buffer = buffer;
  }

  /** Whether the transport wraps at the end of the take. */
  get loop(): boolean {
    return this.looping;
  }

  set loop(on: boolean) {
    this.looping = on;
    if (this.source) this.source.loop = on;
  }

  /** Starts playback from a position (the top when omitted). */
  play(from = 0): void {
    const buffer = this.buffer;
    if (!buffer || buffer.duration <= 0) throw new TransportError("no-plan", "load the reference before playing");
    this.stop();
    void this.context.resume().catch(() => undefined);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = this.looping;
    source.connect(this.context.destination);
    const offset = Math.max(from, 0);
    this.baseOffset = this.looping ? offset % buffer.duration : Math.min(offset, Math.max(0, buffer.duration - 0.01));
    this.baseTime = this.context.currentTime + 0.06;
    source.start(this.baseTime, this.baseOffset);
    this.source = source;
    this.running = true;
  }

  /** Stops playback and silences the sounding source. */
  stop(): void {
    this.running = false;
    const source = this.source;
    this.source = null;
    if (!source) return;
    try {
      source.stop();
    } catch {
      /* an already-ended voice is fine */
    }
    try {
      source.disconnect();
    } catch {
      /* an already-detached voice is fine */
    }
  }

  /** The playhead position in seconds (frozen where the transport stopped). */
  position(): number {
    const buffer = this.buffer;
    if (!buffer) return 0;
    if (!this.running) return this.baseOffset;
    const position = this.baseOffset + (this.context.currentTime - this.baseTime);
    if (position >= buffer.duration) return this.looping ? position % buffer.duration : buffer.duration;
    return Math.max(0, position);
  }
}

// ---- the bus -------------------------------------------------------------------

/** One immutable view of the bus state a subscriber receives. */
export interface PlayerSnapshot {
  /** The shelf the bus cycles through (demo first, session takes after,
   * the ingested references beside them — one grammar). */
  takes: readonly BusTake[];
  /** The index of the current take inside the shelf. */
  index: number;
  /** Whether the transport is running. */
  playing: boolean;
  /** The playhead position in seconds. */
  position: number;
  /** The duration of the current take in seconds. */
  duration: number;
  /** The typed transport failure (empty while healthy). */
  notice: string;
  /** The typed reference-lane or recon-lane failure code (empty while
   * healthy or when the refusal is a plain transport error). */
  noticeCode: BusNoticeCode;
}

/** The subscriber callback shape. */
type Listener = (snapshot: PlayerSnapshot) => void;

/** The single bus instance (module scope — the app has one audio transport). */
let engine: TakeEngine | null = null;
let engineFailed = false;
let referenceEngine: ReferenceTransport | null = null;
let referenceFailed = false;

let takes: BusTake[] = [];
let index = 0;
let playing = false;
let position = 0;
let notice = "";
let noticeCode: BusNoticeCode = "";
let frame = 0;
let loadedId = "";
const listeners = new Set<Listener>();

/**
 * Builds the current immutable snapshot.
 *
 * @returns the snapshot of the bus state.
 */
function snapshot(): PlayerSnapshot {
  const current = takes[index];
  return {
    takes,
    index,
    playing,
    position,
    duration: current ? durationOfTake(current) : 0,
    notice,
    noticeCode,
  };
}

/**
 * Emits the snapshot to every subscriber.
 *
 * @returns nothing.
 */
function emit(): void {
  const view = snapshot();
  for (const listener of listeners) listener(view);
}

/** The transport of the current take — the plan engine or the reference
 * transport (the decoded-audio lane the references and the recon
 * reconstructions both ride), decided by the take's own kind. */
function liveTransport(): TransportClock | null {
  const current = takes[index];
  if (!current) return null;
  return isReferenceTake(current) || isReconTake(current) ? referenceEngine : engine;
}

/**
 * Starts the playhead clock (a rAF loop while the transport runs).
 *
 * @returns nothing.
 */
function ride(): void {
  const transport = liveTransport();
  const current = takes[index];
  if (!playing || !transport || !current) return;
  position = transport.position();
  if (position >= durationOfTake(current) - 0.01 && !transport.loop) {
    playing = false;
    position = durationOfTake(current);
    transport.stop();
    emit();
    return;
  }
  emit();
  frame = window.requestAnimationFrame(ride);
}

/**
 * Loads the shelf (demo plan first, session takes after, the ingested
 * references beside them) and arms the plan engine on the first take.
 * Idempotent: the shelf refreshes on every call so a fresh composition
 * lands without a reload. The reference lane never resolves at arm — the
 * bytes answer the play gesture, not the page paint.
 *
 * @returns nothing.
 */
function arm(): void {
  try {
    const store = sessionStorageOrMemory();
    const demo = planTake({ prompt: DEMO_PROMPT, seed: DEMO_SEED });
    const stored = loadTakeRecords(store).map((record) => record.plan);
    const references = loadReferenceRecords(store).map((record) => record.take);
    takes = [demo, ...stored.filter((take) => take.id !== demo.id), ...references];
  } catch {
    if (takes.length === 0) takes = [planTake({ prompt: DEMO_PROMPT, seed: DEMO_SEED })];
  }
  if (index >= takes.length) index = 0;
  if (engineFailed || !engine) return;
  const current = takes[index];
  if (!current || isReferenceTake(current) || isReconTake(current)) return;
  engine
    .load(current)
    .then(() => {
      notice = "";
      emit();
    })
    .catch((error: unknown) => {
      notice = error instanceof Error ? error.message : "the transport refused this take";
      emit();
    });
}

/**
 * Makes sure the plan engine exists (built once, on the first gesture-bound call).
 *
 * @returns the engine, or null when the browser refused the audio context.
 */
function ensureEngine(): TakeEngine | null {
  if (engineFailed) return null;
  if (!engine) {
    try {
      engine = new TakeEngine();
    } catch (error) {
      engineFailed = true;
      notice = error instanceof Error ? error.message : "the audio context is unavailable";
      return null;
    }
  }
  return engine;
}

/**
 * Makes sure the reference transport exists (built once, on the first
 * reference play — its own context, the same gesture law).
 *
 * @returns the transport, or null when the browser refused the audio context.
 */
function ensureReferenceTransport(): ReferenceTransport | null {
  if (referenceFailed) return null;
  if (!referenceEngine) {
    try {
      referenceEngine = new ReferenceTransport();
    } catch (error) {
      referenceFailed = true;
      notice = error instanceof Error && error.message ? error.message : "the audio context is unavailable";
      return null;
    }
  }
  return referenceEngine;
}

/**
 * Plays the current generated take from the given second (the engine
 * reloads only when the take actually changed).
 *
 * @param current the plan take.
 * @param from the playhead second to start at.
 * @returns nothing.
 */
function playPlan(current: TakePlan, from: number): void {
  const active = ensureEngine();
  if (!active) return;
  const start = (): void => {
    if (!engine) return;
    try {
      engine.loop = true;
      engine.play(from);
      playing = true;
      notice = "";
      noticeCode = "";
      emit();
      frame = window.requestAnimationFrame(ride);
    } catch (error) {
      notice = error instanceof TransportError ? error.message : "the transport refused to start";
      noticeCode = "";
      playing = false;
      emit();
    }
  };
  if (loadedId === current.id) {
    start();
    return;
  }
  active
    .load(current)
    .then(() => {
      loadedId = current.id;
      start();
    })
    .catch((error: unknown) => {
      notice = error instanceof Error ? error.message : "the transport refused this take";
      noticeCode = "";
      playing = false;
      emit();
    });
}

/** Starts the reference transport under the bus law (the same start the
 * plan lane rides: loop on, the notice cleared, the rAF clock armed). */
function startReference(transport: ReferenceTransport, from: number): void {
  try {
    transport.loop = true;
    transport.play(from);
    playing = true;
    notice = "";
    noticeCode = "";
    emit();
    frame = window.requestAnimationFrame(ride);
  } catch (error) {
    notice = error instanceof TransportError ? error.message : "the transport refused to start";
    noticeCode = "";
    playing = false;
    emit();
  }
}

/**
 * Plays the current reference take: a loaded take starts directly (the plan
 * lane's loadedId law), a fresh one resolves through the seams first (the
 * network lane before the context — a blob failure surfaces honestly even
 * on a host without audio), the transport loads the decoded audio, then the
 * same start law the plan lane rides. Every seam failure answers the typed
 * code through the snapshot.
 *
 * @param current the reference take.
 * @param from the playhead second to start at.
 * @returns nothing.
 */
function playReference(current: ReferenceTake, from: number): void {
  if (loadedId === current.id && referenceEngine) {
    startReference(referenceEngine, from);
    return;
  }
  resolveReferenceAudio(current.source)
    .then((answer) => {
      if (!answer.ok) {
        notice = answer.message;
        noticeCode = answer.code;
        playing = false;
        emit();
        return;
      }
      const transport = ensureReferenceTransport();
      if (!transport) return;
      transport.load(answer.audio);
      loadedId = current.id;
      startReference(transport, from);
    })
    .catch((error: unknown) => {
      notice = error instanceof Error ? error.message : "the reference lane refused this take";
      noticeCode = "decode-failed";
      playing = false;
      emit();
    });
}

/**
 * Plays the current recon take: the ladder's own play path (a loaded take
 * starts directly, a fresh one climbs the escada — memory, blob, gateway,
 * the typed refusal), the landed reconstruction loading onto the reference
 * transport (the same decoded-audio lane the references ride, the same
 * singleton law), then the same start law the plan lane rides. Every
 * ladder failure answers the typed code through the snapshot — the bus
 * never fakes a render.
 *
 * @param current the recon take.
 * @param from the playhead second to start at.
 * @returns nothing.
 */
function playRecon(current: ReconTake, from: number): void {
  if (loadedId === current.id && referenceEngine) {
    startReference(referenceEngine, from);
    return;
  }
  resolveReconAudio(current)
    .then((answer) => {
      if (!answer.ok) {
        notice = answer.message;
        noticeCode = answer.code;
        playing = false;
        emit();
        return;
      }
      const transport = ensureReferenceTransport();
      if (!transport) return;
      transport.load(answer.audio);
      loadedId = current.id;
      startReference(transport, from);
    })
    .catch((error: unknown) => {
      notice = error instanceof Error ? error.message : "the recon lane refused this take";
      noticeCode = "recon-unavailable";
      playing = false;
      emit();
    });
}

/**
 * Plays the current take from the given second (the shelf arms on demand,
 * the lane is the take's own kind, and the other lane hushes — one audible
 * transport at a time).
 *
 * @param from the playhead second to start at.
 * @returns nothing.
 */
export function busPlay(from = position): void {
  if (takes.length === 0) arm();
  const current = takes[index];
  if (!current) return;
  if (isReconTake(current)) {
    if (engine) engine.stop();
    playRecon(current, from);
    return;
  }
  if (isReferenceTake(current)) {
    if (engine) engine.stop();
    playReference(current, from);
    return;
  }
  if (referenceEngine) referenceEngine.stop();
  playPlan(current, from);
}

/**
 * Pauses the transport (the playhead freezes where it is).
 *
 * @returns nothing.
 */
export function busPause(): void {
  const transport = liveTransport();
  if (!transport) return;
  position = transport.position();
  transport.stop();
  playing = false;
  window.cancelAnimationFrame(frame);
  emit();
}

/**
 * Toggles play/pause on the current take.
 *
 * @returns nothing.
 */
export function busToggle(): void {
  if (playing) busPause();
  else busPlay();
}

/**
 * Selects a take by id (or the next one when the id is unknown) and plays it
 * from the top.
 *
 * @param id the take id to select; omitted selects the next take.
 * @returns nothing.
 */
export function busSelect(id?: string): void {
  if (takes.length === 0) arm();
  if (id) {
    const at = takes.findIndex((take) => take.id === id);
    if (at >= 0) index = at;
  } else {
    index = (index + 1) % Math.max(takes.length, 1);
  }
  position = 0;
  if (playing) busPlay(0);
  else emit();
}

/**
 * Adds a take to the front of the shelf (a fresh composition, a song-card
 * render or an ingested reference) and makes it current.
 *
 * @param take the take to feature.
 * @returns nothing.
 */
export function busFeature(take: BusTake): void {
  const at = takes.findIndex((held) => held.id === take.id);
  if (at >= 0) index = at;
  else {
    takes = [take, ...takes];
    index = 0;
  }
  position = 0;
  emit();
}

/**
 * Seeks the current take (works while playing and while paused).
 *
 * @param seconds the target playhead second.
 * @returns nothing.
 */
export function busSeek(seconds: number): void {
  const current = takes[index];
  if (!current) return;
  const clamped = Math.min(Math.max(0, seconds), durationOfTake(current));
  position = clamped;
  const transport = playing ? liveTransport() : null;
  if (transport) {
    transport.stop();
    transport.play(clamped);
  }
  emit();
}

/**
 * Stops the bus transport without touching the shelf (the studio page calls
 * this on mount so only one transport is ever audible).
 *
 * @returns nothing.
 */
export function busHush(): void {
  const transport = liveTransport();
  if (!transport || !playing) return;
  position = transport.position();
  transport.stop();
  playing = false;
  window.cancelAnimationFrame(frame);
  emit();
}

/**
 * Reads the take a stored id points at (the session note the studio leaves).
 *
 * @param id the take id.
 * @returns the take, or undefined when the shelf does not carry it.
 */
export function busTakeById(id: string): BusTake | undefined {
  if (takes.length === 0) arm();
  return findTakeRecord(id, sessionStorageOrMemory())?.plan ?? takes.find((take) => take.id === id);
}

/**
 * Subscribes one listener to the bus snapshots.
 *
 * @param listener the callback.
 * @returns the unsubscribe function.
 */
export function busSubscribe(listener: Listener): () => void {
  if (takes.length === 0) arm();
  listeners.add(listener);
  listener(snapshot());
  return () => {
    listeners.delete(listener);
  };
}
