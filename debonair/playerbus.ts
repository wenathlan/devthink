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

import { planTake, type TakePlan } from "./arranger.ts";
import { TakeEngine, TransportError } from "./audioengine.ts";
import { gatewayblobstore, sessionblobstore } from "./blobstore.ts";
import { findTakeRecord, loadTakeRecords, type StorageLike, sessionStorageOrMemory } from "./takestore.ts";

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

/** Every take the bus shelf carries: the generated plans and the ingested
 * references — one grammar, the row decides by kind. */
export type BusTake = TakePlan | ReferenceTake;

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
 * The duration of any shelf take (the bus clock law: the plan answers its
 * own field, the reference answers its source's).
 *
 * @param take the shelf take.
 * @returns the duration in seconds.
 */
export function durationOfTake(take: BusTake): number {
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
 * into one typed result). */
export type ResolveReferenceAnswer =
  | { ok: true; audio: DecodedReference }
  | { ok: false; code: ReferencePlayCode; message: string };

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
  /** The typed reference-lane failure code (empty while healthy or when the
   * refusal is a plain transport error). */
  noticeCode: ReferencePlayCode | "";
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
let noticeCode: ReferencePlayCode | "" = "";
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
 * transport, decided by the take's own kind. */
function liveTransport(): TransportClock | null {
  const current = takes[index];
  if (!current) return null;
  return isReferenceTake(current) ? referenceEngine : engine;
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
  if (!current || isReferenceTake(current)) return;
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
