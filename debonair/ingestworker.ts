// # ingestworker — the server ingest job of the debonair app (root layer,
// wave PV1.004): the pipeline that runs entirely outside the visitor's
// browser — the gateway lane the upload route queues and the job route
// polls. the job decodes the wav bytes through a hand-rolled parser that
// mirrors the wavwriter's own formats (pcm 16, pcm 24, ieee float 32 — the
// writer's format table is imported, never re-typed), downmixes to mono
// (the channel-average law the bench rides), separates the hpss stems,
// analyzes and segments through ingest.ts's own end-to-end chain
// (ingestPcm — the math is never duplicated here), encodes the mix and
// each stem back through the wavwriter at the source's own rate and depth
// (the mastering 48000 law pins the render lane; the reference lane keeps
// the source rate so the stored wavs answer the document's seconds and
// hashes), puts them in the blob store beside a stems manifest json, and
// stamps the ingest document row with the pointer chain — owner id, kind,
// visibility, mix pointer, stems pointer, size and the source sha256. the
// db lane rides an injected handle (the ingestdb seam — the worker stays
// pure of any database import, the same injectable discipline the
// takestore storage and the blobstore fetch seams ride), so the pure lane
// runs store-only. every call answers a typed result with a machine code,
// never a throw; the same bytes answer the same document and the same
// digests (the seeded law — the pointer ids ride the time mint, the
// sha256 is the content identity). zero consumer data.

import { mintid } from "./bigintids.ts";
import type { BlobPointer, BlobStore } from "./blobstore.ts";
import { sha256hex } from "./blobstore.ts";
import { separate } from "./hpss.ts";
import type { IngestDocument } from "./ingest.ts";
import { ingestPcm } from "./ingest.ts";
import type { WorkerModality } from "./sandboxmodality.ts";
import type { WavBitDepth, WavFormatRow } from "./wavwriter.ts";
import {
  CHANNELS_MAX,
  CHANNELS_MIN,
  encodeWav,
  HEADER_LAYOUT,
  SAMPLE_RATE_MAX,
  SAMPLE_RATE_MIN,
  WAV_FORMAT,
} from "./wavwriter.ts";

/** The schema literal of the stems bundle manifest the store phase writes. */
export const INGEST_STEMS_SCHEMA_VERSION = "debonair.ingeststems/1";

/** The pipeline phases in the law order (the bench, the job route and the
 * worker speak the same names); the row phase rides only the db lane. */
export const PIPELINE_PHASES: readonly IngestJobPhase[] = ["decode", "separate", "analyze", "segment", "store", "row"];

/** The sandbox modality this worker's walk declares (wave PV6.003): the
 * honest default is "local" — the walk runs in the deploy's own process
 * and this module never spawns anything itself. the declaration is the
 * contract the deploy reads: a deploy that opts the heavy jobs onto a
 * saddle modality pins DEBONAIR_WORKER_MODALITY (one of the
 * sandboxmodality vocabulary's saddle ids) and the platform resolves the
 * sandbox — this file only names the lane's truth (opt-in per deploy,
 * never a silent switch). */
export const INGEST_WORKER_MODALITY: WorkerModality = "local";

/** The blob kind of the encoded wavs (the mime the playback lane streams). */
const WAV_KIND = "audio/wav";

/** The blob kind of the stems manifest json. */
const MANIFEST_KIND = "application/json";

/** The fallback display name when the input carries none (the document guard requires one). */
const FALLBACK_NAME = "untitled";

/** The decode format table — the writer's own rows, keyed by the fmt code
 * and bit depth the parser reads back (the lockstep law: the decoder never
 * invents a format the encoder cannot have written). */
const WAV_DECODE_FORMATS: readonly { depth: WavBitDepth; row: WavFormatRow }[] = [
  { depth: 16, row: WAV_FORMAT.pcm16 },
  { depth: 24, row: WAV_FORMAT.pcm24 },
  { depth: 32, row: WAV_FORMAT.float32 },
];

/** The json face of the manifest bytes (one encoder per process). */
const manifestencoder = new TextEncoder();

/** The ingest kind of a job: a visitor upload or a system reference. */
export type IngestJobKind = "upload" | "reference";

/** The visibility of a document: the private shelf or the vitrine. */
export type IngestJobVisibility = "private" | "vitrine";

/** The machine codes of the wav decoder (the writer's mirror refuses first
 * on the container, then the fmt shape, then the depth, then the data). */
export type WavDecodeErrorCode = "bad-riff" | "bad-wave" | "bad-fmt" | "unsupported-depth" | "bad-data" | "truncated";

/** The decoded wav — the per-channel float pcm (deinterleaved, normalized
 * to -1..1 exactly inverse to the writer's quantize; the float lane reads
 * the ieee words as-is) beside the header facts. */
export interface WavDecoded {
  /** The pcm per channel, one Float32Array each (frames long). */
  pcm: Float32Array[];
  /** The sample rate in hz. */
  sampleRate: number;
  /** The channel count. */
  channels: number;
  /** The bit depth (16, 24 or 32 — 32 always means ieee float). */
  bitDepth: WavBitDepth;
  /** The frame count the data chunk carries. */
  frames: number;
  /** The exact play time: frames / sampleRate. */
  durationSeconds: number;
  /** Whether the fmt chunk declares ieee float (code 3). */
  isFloat: boolean;
}

/** The typed decode answer — ok carries the pcm and the header facts, the
 * error branch carries the machine code. never a throw. */
export type WavDecodeResult = ({ ok: true } & WavDecoded) | { ok: false; code: WavDecodeErrorCode; message: string };

/** One pipeline phase of the worker (the names the bench and the job
 * progress route carry). */
export type IngestJobPhase = "decode" | "separate" | "analyze" | "segment" | "store" | "row";

/** One progress report: the phase that just landed and the share of the
 * running pipeline that is complete (0..1, ascending — the row phase rides
 * only the db lane, so both lanes end at 1). */
export interface IngestJobProgress {
  /** The phase that completed. */
  phase: IngestJobPhase;
  /** The completed share of the pipeline. */
  fraction: number;
}

/** The progress callback — a hostile throw never breaks the job. */
export type IngestProgressCallback = (progress: IngestJobProgress) => void;

/** One stem row of the stems manifest — the pointer of the stored wav plus
 * the vector facts the document carries (the pattern miner's grid seed). */
export interface IngestStemsManifestStem {
  /** The stem role: "harmonic" or "percussive". */
  role: "harmonic" | "percussive";
  /** The pointer of the stored stem wav (audio/wav). */
  pointer: BlobPointer;
  /** The stem's vector frame count (one per second). */
  frames: number;
  /** The stem's onset count. */
  onsets: number;
  /** The stem peak (the shelf meter). */
  peak: number;
  /** The stem rms (the shelf meter). */
  rms: number;
}

/** The stems bundle manifest the store phase writes beside the wavs — the
 * blob the row's stems_pointer names (one wav per stem is stored, the
 * manifest lists them; the pointer pair the schema carries stays two
 * columns: mix_pointer and stems_pointer). */
export interface IngestStemsManifest {
  /** The schema literal ("debonair.ingeststems/1"). */
  schema: typeof INGEST_STEMS_SCHEMA_VERSION;
  /** The display name of the source (no extension). */
  name: string;
  /** The sample rate of every stored wav (the source's own). */
  sampleRate: number;
  /** The bit depth of every stored wav (the source's own). */
  bitDepth: WavBitDepth;
  /** The sha256 of the source bytes — the digest the whole bundle answers to. */
  sha256: string;
  /** The byte count of the source. */
  sizeBytes: number;
  /** One row per stem, the document's stem order. */
  stems: IngestStemsManifestStem[];
}

/** The vector facts of one stem the segment phase reads out of the
 * document (the manifest rows marry them with the store pointers). */
interface StemFacts {
  /** The stem role. */
  role: "harmonic" | "percussive";
  /** The vector frame count. */
  frames: number;
  /** The onset count. */
  onsets: number;
  /** The stem peak. */
  peak: number;
  /** The stem rms. */
  rms: number;
}

/** One stamped ingest row the worker hands the db lane — the column set
 * the ingest_documents table carries: the owner, the kind, the
 * visibility, the two blob pointers, the size and the digest beside the
 * document itself (the docjson column). */
export interface IngestStampRow {
  /** The minted row id (the decimal string the house mint answers). */
  id: string;
  /** The owner id (the minted decimal string — every document carries one). */
  ownerId: string;
  /** The ingest kind: a visitor upload or a system reference. */
  kind: IngestJobKind;
  /** The visibility: the private shelf or the vitrine. */
  visibility: IngestJobVisibility;
  /** The display name (no extension). */
  name: string;
  /** The blob id of the stored mix wav. */
  mixPointer: string;
  /** The blob id of the stems manifest json. */
  stemsPointer: string;
  /** The byte count of the source wav. */
  sizeBytes: number;
  /** The sha256 of the source wav (the store-computed digest). */
  sha256: string;
  /** The sample rate of the analyzed pcm. */
  sampleRate: number;
  /** The duration in seconds. */
  durationSeconds: number;
  /** The fnv-1a hash of the mix pcm bits. */
  pcmhash: number;
  /** The iso instant stamped on the document. */
  ingestedAt: string;
  /** The full parametrized document (the docjson column). */
  document: IngestDocument;
}

/** The typed answer of one db lane insert — never a throw (a throwing
 * handle answers db-failed through the worker's guard). */
export type IngestDbAnswer = { ok: true } | { ok: false; code: string; message: string };

/** The ingestdb handle — the seam the gateway wires to the real
 * ingest_documents table when the schema upgrade lands; the worker stays
 * pure of any database import (the injectable discipline the takestore
 * storage and the blobstore fetch seams ride). */
export interface IngestDbHandle {
  /** Inserts one stamped row (parameter binding only, the house database law). */
  puttingestrow(row: IngestStampRow): Promise<IngestDbAnswer>;
}

/** The server job input: the source bytes, the identity stamps and the two
 * seams — the store always rides, the db lane is optional (the pure lane
 * runs store-only). */
export interface IngestJobInput {
  /** The source wav bytes (the wavwriter's own formats: pcm 16, pcm 24, ieee float 32). */
  bytes: Uint8Array;
  /** The display name of the source (one trailing extension folds away). */
  name: string;
  /** The owner id — the minted decimal string (every document carries one). */
  ownerId: string;
  /** The ingest kind: a visitor upload or a system reference. */
  kind: IngestJobKind;
  /** The visibility: the private shelf or the vitrine. */
  visibility: IngestJobVisibility;
  /** The blob store the mix, the stems and the manifest land in. */
  store: BlobStore;
  /** The ingestdb handle, or null when the lane runs store-only. */
  db: IngestDbHandle | null;
  /** The iso instant stamped on the document and the row (defaults to the
   * wall clock; the deterministic lanes pin it). */
  at?: string;
}

/** The pointer chain the job answers: the mix wav, one wav per stem (the
 * document's stem order) and the stems manifest that names them. */
export interface IngestJobPointers {
  /** The stored mix wav (audio/wav — the mono downmix the document analyzed). */
  mix: BlobPointer;
  /** The stored stem wavs (audio/wav, harmonic first). */
  stems: BlobPointer[];
  /** The stored stems manifest json (application/json — the row's stems_pointer). */
  manifest: BlobPointer;
}

/** The machine codes the job answers: the decode codes first, the pipeline
 * failures last. */
export type IngestJobErrorCode = WavDecodeErrorCode | "empty-audio" | "store-failed" | "db-failed";

/** The typed job result — ok carries the document, the pointer chain and
 * the row id (absent on the pure lane), the error branch carries the
 * machine code. never a throw. */
export type IngestJobResult =
  | { ok: true; document: IngestDocument; pointers: IngestJobPointers; rowId?: string }
  | { ok: false; code: IngestJobErrorCode; message: string };

/** The decode error branch builder. */
function decodeerr(code: WavDecodeErrorCode, message: string): WavDecodeResult {
  return { ok: false, code, message };
}

/** The job error branch builder. */
function joberr(code: IngestJobErrorCode, message: string): IngestJobResult {
  return { ok: false, code, message };
}

/** The readable message of any thrown failure. */
function errmsgof(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Reads ascii magic out of the bytes (the decoder's own reader — the
 * writer's readAscii stays private). */
function readascii(bytes: Uint8Array, offset: number, length: number): string {
  let text = "";
  for (let index = 0; index < length; index++) text += String.fromCharCode(bytes[offset + index]);
  return text;
}

/**
 * Parses the wav bytes back into the per-channel float pcm — the exact
 * inverse of the wavwriter's encode: the riff/wave magic, the chunk walk
 * (unknown chunks skip, odd sizes pad), the fmt shape bands the writer
 * pins (1..8 channels, 8000..192000 hz) and the format table the writer
 * itself owns (pcm 16, pcm 24, ieee float 32 — anything else refuses as
 * unsupported-depth). the 16 and 24 bit lanes divide by the writer's own
 * full-scale codes, so encode then parse answers the source samples within
 * the quantization; the float lane reads the ieee words as-is. a data
 * chunk claiming bytes past the buffer answers truncated; a wav with a
 * zero-frame data chunk parses ok (the job layer answers empty-audio).
 *
 * @param bytes the file bytes (a view rides its own offset and length).
 * @returns the decoded pcm and header facts, or the machine code.
 */
export function parseWav(bytes: Uint8Array): WavDecodeResult {
  if (bytes.length < 4 || readascii(bytes, 0, 4) !== "RIFF") {
    return decodeerr("bad-riff", "wav needs the RIFF magic in the first four bytes");
  }
  if (bytes.length < HEADER_LAYOUT.riffBytes || readascii(bytes, 8, 4) !== "WAVE") {
    return decodeerr("bad-wave", "wav needs the WAVE magic at offset 8");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let fmt: { formatCode: number; channels: number; sampleRate: number; bitsPerSample: number } | null = null;
  let data: { offset: number; size: number } | null = null;
  let cursor = HEADER_LAYOUT.riffBytes;
  while (cursor + HEADER_LAYOUT.chunkHeaderBytes <= bytes.length) {
    const id = readascii(bytes, cursor, 4);
    const size = view.getUint32(cursor + 4, true);
    if (cursor + HEADER_LAYOUT.chunkHeaderBytes + size > bytes.length) {
      return decodeerr("truncated", `the ${id.trim()} chunk claims ${size} bytes past the buffer`);
    }
    if (id === "fmt " && fmt === null) {
      if (size < HEADER_LAYOUT.fmtContentPcm) {
        return decodeerr("bad-fmt", `the fmt chunk carries ${size} bytes, fewer than the fixed fields`);
      }
      fmt = {
        formatCode: view.getUint16(cursor + 8, true),
        channels: view.getUint16(cursor + 10, true),
        sampleRate: view.getUint32(cursor + 12, true),
        bitsPerSample: view.getUint16(cursor + 22, true),
      };
    } else if (id === "data" && data === null) {
      data = { offset: cursor + HEADER_LAYOUT.chunkHeaderBytes, size };
    }
    cursor += HEADER_LAYOUT.chunkHeaderBytes + size + (size % 2); // chunks pad to even lengths
  }
  if (fmt === null) return decodeerr("bad-fmt", "wav carries no fmt chunk");
  if (data === null) return decodeerr("bad-data", "wav carries no data chunk");
  if (fmt.channels < CHANNELS_MIN || fmt.channels > CHANNELS_MAX) {
    return decodeerr("bad-fmt", `wav carries ${fmt.channels} channels, outside ${CHANNELS_MIN}..${CHANNELS_MAX}`);
  }
  if (fmt.sampleRate < SAMPLE_RATE_MIN || fmt.sampleRate > SAMPLE_RATE_MAX) {
    return decodeerr("bad-fmt", `wav carries ${fmt.sampleRate} hz, outside ${SAMPLE_RATE_MIN}..${SAMPLE_RATE_MAX}`);
  }
  const format = WAV_DECODE_FORMATS.find(
    (row) => row.row.formatCode === fmt?.formatCode && row.row.bitsPerSample === fmt?.bitsPerSample,
  );
  if (!format) {
    return decodeerr(
      "unsupported-depth",
      `wav declares format ${fmt.formatCode} at ${fmt.bitsPerSample} bits — the writer's own formats are pcm 16, pcm 24 and ieee float 32`,
    );
  }
  const block = fmt.channels * format.row.bytesPerSample;
  const frames = Math.floor(data.size / block);
  // the deinterleave: frame-major samples split per channel, normalized to
  // float (-1..1) exactly inverse to the writer's quantize
  const pcm: Float32Array[] = [];
  for (let channel = 0; channel < fmt.channels; channel++) pcm.push(new Float32Array(frames));
  const base = data.offset;
  if (format.row.isFloat) {
    for (let frame = 0; frame < frames; frame++) {
      for (let channel = 0; channel < fmt.channels; channel++) {
        pcm[channel][frame] = view.getFloat32(base + (frame * fmt.channels + channel) * 4, true);
      }
    }
  } else {
    for (let frame = 0; frame < frames; frame++) {
      for (let channel = 0; channel < fmt.channels; channel++) {
        const at = base + (frame * fmt.channels + channel) * format.row.bytesPerSample;
        let code: number;
        if (format.row.bytesPerSample === 2) {
          code = view.getInt16(at, true);
        } else {
          // the 24-bit lane: three little-endian bytes, sign-extended
          const unsigned = bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16);
          code = unsigned >= 0x800000 ? unsigned - 0x1000000 : unsigned;
        }
        pcm[channel][frame] = code / format.row.fullScale;
      }
    }
  }
  return {
    ok: true,
    pcm,
    sampleRate: fmt.sampleRate,
    channels: fmt.channels,
    bitDepth: format.depth,
    frames,
    durationSeconds: frames / fmt.sampleRate,
    isFloat: format.row.isFloat,
  };
}

/**
 * Downmixes the decoded channels to mono through the channel average (the
 * law the bench's decodeMono rides — one channel passes through the same
 * division, so the mono mix is exactly the decoded channel).
 *
 * @param channels the per-channel pcm (equal length).
 * @returns the mono pcm (empty when no channel rides along).
 */
export function downmixmono(channels: readonly Float32Array[]): Float32Array {
  if (channels.length === 0) return new Float32Array(0);
  const mono = new Float32Array(channels[0].length);
  for (const channel of channels) {
    for (let frame = 0; frame < mono.length; frame++) mono[frame] += (channel[frame] ?? 0) / channels.length;
  }
  return mono;
}

/**
 * The display name law: one trailing file extension folds away (the
 * ingest document carries the name without the extension, the same law
 * the bench applies), an empty strip keeps the raw name, and an empty name
 * answers the fallback (the document guard requires a non-empty name).
 *
 * @param name the raw name the job carried.
 * @returns the display name.
 */
function displayname(name: string): string {
  const stripped = name.replace(/\.[^.]+$/, "");
  if (stripped.length > 0) return stripped;
  return name.length > 0 ? name : FALLBACK_NAME;
}

/**
 * Puts bytes in the store — the typed bridge that also guards a hostile
 * seam: a throwing store answers the readable failure, never a crash.
 *
 * @param store the blob store.
 * @param data the bytes.
 * @param kind the bare mime the pointer carries.
 * @returns the pointer, or the readable failure.
 */
async function putbytes(
  store: BlobStore,
  data: Uint8Array,
  kind: string,
): Promise<{ ok: true; pointer: BlobPointer } | { ok: false; message: string }> {
  try {
    const result = await store.put(data, kind);
    if (result.ok) return { ok: true, pointer: result.pointer };
    return { ok: false, message: `${result.code} (${result.message})` };
  } catch (error) {
    return { ok: false, message: `the store lane threw: ${errmsgof(error)}` };
  }
}

/**
 * Encodes one mono pcm through the wavwriter at the source's own rate and
 * depth and puts it in the store under the audio/wav kind. a writer
 * refusal (the shape bands, the size cap) translates to the typed failure.
 *
 * @param store the blob store.
 * @param pcm the mono pcm.
 * @param sampleRate the source's rate.
 * @param bitDepth the source's depth.
 * @returns the pointer, or the readable failure.
 */
async function putwav(
  store: BlobStore,
  pcm: Float32Array,
  sampleRate: number,
  bitDepth: WavBitDepth,
): Promise<{ ok: true; pointer: BlobPointer } | { ok: false; message: string }> {
  let bytes: Uint8Array;
  try {
    bytes = encodeWav([pcm], { sampleRate, bitDepth });
  } catch (error) {
    return { ok: false, message: `the wavwriter refused the bounce: ${errmsgof(error)}` };
  }
  return putbytes(store, bytes, WAV_KIND);
}

/**
 * Runs one server ingest job end to end — decode, separate, analyze,
 * segment, store (and the row stamp when the db lane rides) — the whole
 * pipeline outside the visitor's browser. the document comes from
 * ingest.ts's own end-to-end chain (ingestPcm — the math is never
 * duplicated here); the stem audio comes from the same deterministic
 * separation answered once more, so the stored wavs answer the document's
 * pcmhashes. the manifest lands after the wavs (a crash leaves orphan
 * blobs, never a bundle that points at missing bytes) and the row lands
 * after the manifest (never a row that points at missing bytes) — the
 * bytes-before-manifest law the file lane rides. every failure answers the
 * typed result with a machine code — never a throw.
 *
 * @param input the source bytes, the identity stamps and the seams.
 * @param onProgress the optional progress sink (one report per completed phase).
 * @returns the document, the pointer chain and the row id, or the machine code.
 */
export async function runIngestJob(
  input: IngestJobInput,
  onProgress?: IngestProgressCallback,
): Promise<IngestJobResult> {
  const phases = input.db === null ? PIPELINE_PHASES.filter((phase) => phase !== "row") : PIPELINE_PHASES;
  const report = (phase: IngestJobPhase): void => {
    if (!onProgress) return;
    try {
      onProgress({ phase, fraction: (phases.indexOf(phase) + 1) / phases.length });
    } catch {
      // a hostile callback never breaks the job — the answer matters more
    }
  };

  // phase: decode — the wav bytes become mono float pcm (the average law)
  const decoded = parseWav(input.bytes);
  if (!decoded.ok) return joberr(decoded.code, decoded.message);
  const mono = downmixmono(decoded.pcm);
  if (mono.length === 0) return joberr("empty-audio", "the wav carries no audio frames");
  const sampleRate = decoded.sampleRate;
  const bitDepth = decoded.bitDepth;
  report("decode");

  // phase: separate — the hpss pair the store writes (the same
  // deterministic separation ingestPcm rides inside, answered once more
  // for the stem audio itself)
  const pair = separate(mono);
  report("separate");

  // phase: analyze — ingest.ts's own end-to-end chain answers the document
  // (the mix report, both stem reports and the per-second vector frames)
  const name = displayname(input.name);
  const document = ingestPcm(mono, sampleRate, { name, at: input.at ?? new Date().toISOString() });
  report("analyze");

  // phase: segment — the vector facts the manifest rows carry, the stem
  // audio paired to the document's stems by role
  const stemPcm: Float32Array[] = document.stems.map((stem) =>
    stem.role === "harmonic" ? pair.harmonic : pair.percussive,
  );
  const stemFacts: StemFacts[] = document.stems.map((stem) => ({
    role: stem.role,
    frames: stem.segments.length,
    onsets: stem.onsetsSeconds.length,
    peak: stem.peak,
    rms: stem.rms,
  }));
  report("segment");

  // phase: store — the mix and the stems ride the wavwriter at the
  // source's own rate and depth, the manifest lands last
  const sourceSha = sha256hex(input.bytes);
  const mixPut = await putwav(input.store, mono, sampleRate, bitDepth);
  if (!mixPut.ok) return joberr("store-failed", `the store refused the mix: ${mixPut.message}`);
  const stemPointers: BlobPointer[] = [];
  for (const audio of stemPcm) {
    const put = await putwav(input.store, audio, sampleRate, bitDepth);
    if (!put.ok) return joberr("store-failed", `the store refused a stem: ${put.message}`);
    stemPointers.push(put.pointer);
  }
  const manifest: IngestStemsManifest = {
    schema: INGEST_STEMS_SCHEMA_VERSION,
    name,
    sampleRate,
    bitDepth,
    sha256: sourceSha,
    sizeBytes: input.bytes.length,
    stems: stemFacts.map((facts, index) => ({ ...facts, pointer: stemPointers[index] })),
  };
  const manifestPut = await putbytes(input.store, manifestencoder.encode(JSON.stringify(manifest)), MANIFEST_KIND);
  if (!manifestPut.ok) return joberr("store-failed", `the store refused the manifest: ${manifestPut.message}`);
  report("store");
  const pointers: IngestJobPointers = { mix: mixPut.pointer, stems: stemPointers, manifest: manifestPut.pointer };
  if (input.db === null) return { ok: true, document, pointers };

  // phase: row — the db stamp (owner, kind, visibility, the pointer pair,
  // the size and the digest) lands after the bytes
  const row: IngestStampRow = {
    id: mintid(),
    ownerId: input.ownerId,
    kind: input.kind,
    visibility: input.visibility,
    name,
    mixPointer: mixPut.pointer.id,
    stemsPointer: manifestPut.pointer.id,
    sizeBytes: input.bytes.length,
    sha256: sourceSha,
    sampleRate,
    durationSeconds: document.durationSeconds,
    pcmhash: document.pcmhash,
    ingestedAt: document.ingestedAt,
    document,
  };
  let answer: IngestDbAnswer;
  try {
    answer = await input.db.puttingestrow(row);
  } catch (error) {
    return joberr("db-failed", `the db lane threw: ${errmsgof(error)}`);
  }
  if (!answer.ok) return joberr("db-failed", `the db lane refused the row: ${answer.code} (${answer.message})`);
  report("row");
  return { ok: true, document, pointers, rowId: row.id };
}
