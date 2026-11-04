// # ingest — the decomposition pipeline of the katexis engine (root layer):
// one mono pcm goes in, the parametrized ingest document goes out — the
// format the pattern miner and the composer consume (the reference v1
// approach that proved the reconstruction: decompose, parameterize, store,
// then generate from the stored vectors). The pipeline: hpss separates the
// harmonic and the percussive stem, the shared analyze chain reports each
// stem (rhythm, key, bands, loudness, structure) and the percussive
// envelope answers the onset list the pattern miner quantizes. The document
// is deterministic for a given pcm — the same take always ingests to the
// same bytes. Pure math, zero storage, zero audio context.
//
// The file carries the whole ingest keyword family under the fold law
// (every file that starts with the same keyword is one file): the
// decomposition pipeline (the base lane this header describes) and the six
// retired variant arms as sections below — the ingest client, the ingest
// db, the ingest payload, the ingest recon, the ingest store and the
// ingest worker lanes, every export of the family one export of this file.

import type { AudioReport } from "./analyze.ts";
import { analyze, SILENCE_RMS } from "./analyze.ts";
import {
  AudioDecodeError,
  bpmOverTime,
  brightness,
  mfcc,
  onsetEnvelope,
  readWavLayout,
  readWavSamples,
  resample,
  rmsEnvelope,
  rolloffSharpness,
  spectralFlux,
  spectralSlope,
  warmthIndex,
} from "./audio.ts";
import { mintid } from "./bigintids.ts";
import { type BlobPointer, type BlobStore, blobidvalid, sha256hex } from "./blobstore.ts";
import type { IngestJobValue } from "./gatewayapi.ts";
import { hashSeed, mulberry32 } from "./harmonyengine.ts";
import { type StemPair, separate } from "./hpss.ts";
import { hostallowed } from "./onboardingstate.ts";
import { PATTERN_SCALE_NAMES, PATTERN_SCALES } from "./pattern.ts";
import type { GenreProfile } from "./pattern.ts";
import { serializeProfile } from "./pattern.ts";
import {
  fnv1aNumbers,
  RECON_LAYERS,
  RECON_SAMPLE_RATE,
  RECON_SCHEMA_VERSION,
  type ReconCorrelations,
  type ReconDocument,
  type ReconFrame,
  type ReconHeader,
  type ReconLayerFrame,
} from "./recon.ts";
import type { WorkerModality } from "./sandboxmodality.ts";
import { chromaOf, FFT_SIZE, fftInPlace, frameSpectrum, HANN_TABLE, keyOf } from "./spectrum.ts";
import { midiToHz } from "./tuning.ts";
import type { WavBitDepth, WavFormatRow } from "./wavwriter.ts";
import {
  CHANNELS_MAX,
  CHANNELS_MIN,
  encodeWav,
  HEADER_LAYOUT,
  SAMPLE_RATE_MAX,
  SAMPLE_RATE_MIN,
  WAV_FORMAT,
  WavError,
} from "./wavwriter.ts";

/* ===== the decomposition pipeline ===== */

/** The ingest document schema this pipeline writes (the only one). */
export const INGEST_SCHEMA_VERSION = "debonair.ingest/1";

/** The pitch-class names the dominant-note vector reports (index = pc). */
export const NOTE_NAMES: readonly string[] = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];

/** One second-long vector frame of a stem — the proven v1 decomposition
 * shape: every second answers its own numbers, so the pattern miner reads
 * the track as a numeric time series instead of raw audio. */
export interface IngestSegment {
  /** The second index this frame covers (0-based). */
  s: number;
  /** The rms of the second. */
  rms: number;
  /** The peak of the second. */
  peak: number;
  /** The zero crossing rate of the second. */
  zcr: number;
  /** The spectral centroid of the second, hz. */
  cent: number;
  /** The spectral flatness of the second (geometric/arithmetic mean). */
  flat: number;
  /** The strongest rms rise inside the second (the local beat strength). */
  beat: number;
  /** The onset count inside the second. */
  onsets: number;
  /** The band energy fractions [low, mid, high] of the second. */
  bands: number[];
  /** The dominant pitch class of the second ("" when silent). */
  note: string;
  /** The twelve-bin chroma of the second (pitch classes 0..11). */
  chroma: number[];
}

/** One analyzed stem of the ingest document. */
export interface IngestStem {
  /** The stem role the separator assigned: "harmonic" or "percussive". */
  role: "harmonic" | "percussive";
  /** The full analysis report of the stem pcm. */
  report: AudioReport;
  /** The second-by-second vector frames of the stem. */
  segments: IngestSegment[];
  /** The onset times of the stem in seconds (the pattern grid seed). */
  onsetsSeconds: number[];
  /** The stem peak (0..1+) for the shelf meters. */
  peak: number;
  /** The stem rms for the shelf meters. */
  rms: number;
  /** The fnv-1a hash of the stem pcm bits — the fidelity id the render
   * checksum compares against (the v1 reconstruction proof). */
  pcmhash: number;
}

/** The parametrized ingest document the db stores and the composer mines. */
export interface IngestDocument {
  /** The schema version ("debonair.ingest/1"). */
  schema: string;
  /** The display name the ingest carried (file name without the extension). */
  name: string;
  /** The iso instant of the ingest. */
  ingestedAt: string;
  /** The sample rate of the analyzed pcm. */
  sampleRate: number;
  /** The duration in seconds. */
  durationSeconds: number;
  /** The analysis of the full mix. */
  mix: AudioReport;
  /** The second-by-second vector frames of the full mix. */
  segments: IngestSegment[];
  /** The fnv-1a hash of the mix pcm bits (the fidelity id of the take). */
  pcmhash: number;
  /** The separated stems, mix-conserving. */
  stems: IngestStem[];
}

/** The minimum gap two onsets keep, in seconds (the envelope refractory). */
const ONSET_GAP_S = 0.06;
/** The envelope window of the onset detector, in ms. */
const ENVELOPE_MS = 12;
/** The fraction of the envelope maximum an onset must clear. */
const ONSET_THRESHOLD = 0.22;

/** The rms of a block of samples. */
function rmsOf(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / (samples.length || 1));
}

/** The peak of a block of samples. */
function peakOf(samples: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = Math.abs(samples[i]);
    if (v > peak) peak = v;
  }
  return peak;
}

/**
 * Detects the onset times of a stem from its rms envelope: the envelope
 * slides a short window, the peaks clear a fraction of the maximum and keep
 * the refractory gap. Pure and deterministic.
 *
 * @param pcm the stem samples.
 * @param sampleRate the sample rate of the pcm.
 * @returns the onset times in seconds, ascending.
 */
export function onsetSecondsOf(pcm: Float32Array, sampleRate: number): number[] {
  const win = Math.max(1, Math.round((ENVELOPE_MS / 1000) * sampleRate));
  const frames = Math.max(1, Math.floor(pcm.length / win));
  const env = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    const start = f * win;
    for (let i = 0; i < win; i++) {
      const s = pcm[start + i] ?? 0;
      sum += s * s;
    }
    env[f] = Math.sqrt(sum / win);
  }
  const diff = new Float32Array(frames);
  for (let f = 1; f < frames; f++) {
    const d = env[f] - env[f - 1];
    if (d > 0) diff[f] = d;
  }
  let max = 0;
  for (let f = 0; f < frames; f++) if (diff[f] > max) max = diff[f];
  if (max <= 0) return [];
  const gapFrames = Math.max(1, Math.round((ONSET_GAP_S * sampleRate) / win));
  const onsets: number[] = [];
  let lastFrame = -gapFrames * 2;
  const threshold = max * ONSET_THRESHOLD;
  for (let f = 1; f < frames - 1; f++) {
    if (diff[f] < threshold) continue;
    if (diff[f] <= diff[f - 1] || diff[f] < diff[f + 1]) continue;
    if (f - lastFrame < gapFrames) continue;
    onsets.push((f * win) / sampleRate);
    lastFrame = f;
  }
  return onsets;
}

/** The fnv-1a 32-bit hash of a pcm block — the deterministic fidelity id the
 * renderer checksums against (the v1 seed/checksum proof, one number per
 * stem instead of a kilometer array). */
export function pcmhash(pcm: Float32Array): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < pcm.length; i++) {
    const view = new DataView(new ArrayBuffer(4));
    view.setFloat32(0, pcm[i], true);
    const bits = view.getUint32(0, true);
    hash ^= bits & 0xff;
    hash = Math.imul(hash, 0x01000193);
    hash ^= (bits >> 8) & 0xff;
    hash = Math.imul(hash, 0x01000193);
    hash ^= (bits >> 16) & 0xff;
    hash = Math.imul(hash, 0x01000193);
    hash ^= (bits >> 24) & 0xff;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** The band edges of the three-band split, hz (low, mid, high). */
const BAND_EDGES: readonly [number, number] = [250, 2000];

/**
 * Decomposes one pcm into the second-by-second vector frames: one real FFT
 * per second answers the centroid, the flatness, the band split and the
 * chroma; the envelope answers the local beat strength; the passed onset
 * list is bucketed per second. Pure and deterministic — the same pcm always
 * yields the same frames.
 *
 * @param pcm the stem (or mix) samples.
 * @param sampleRate the rate of the pcm.
 * @param onsets the stem onset times in seconds (from onsetSecondsOf).
 * @returns one frame per whole second of the pcm.
 */
export function segmentsof(pcm: Float32Array, sampleRate: number, onsets: readonly number[]): IngestSegment[] {
  const seconds = Math.floor(pcm.length / sampleRate);
  const frames: IngestSegment[] = [];
  const binHz = sampleRate / FFT_SIZE;
  const win = Math.max(1, Math.round((ENVELOPE_MS / 1000) * sampleRate));
  for (let s = 0; s < seconds; s++) {
    const start = s * sampleRate;
    // the spectrum frame: the first fft window of the second, hann-weighted
    const re = new Array<number>(FFT_SIZE).fill(0);
    const im = new Array<number>(FFT_SIZE).fill(0);
    for (let i = 0; i < FFT_SIZE; i++) re[i] = (pcm[start + i] ?? 0) * HANN_TABLE[i];
    fftInPlace(re, im);
    const bins = FFT_SIZE / 2 + 1;
    const magnitudes = new Array<number>(bins);
    for (let b = 0; b < bins; b++) magnitudes[b] = Math.hypot(re[b], im[b]);
    // spectral moments: centroid, flatness, the three-band energy split
    let magSum = 0;
    let weighted = 0;
    let logSum = 0;
    const bandEnergy = [0, 0, 0];
    for (let b = 1; b < bins; b++) {
      const m = magnitudes[b];
      if (m <= 0) continue;
      magSum += m;
      weighted += m * b * binHz;
      logSum += Math.log(m);
      if (b * binHz < BAND_EDGES[0]) bandEnergy[0] += m;
      else if (b * binHz < BAND_EDGES[1]) bandEnergy[1] += m;
      else bandEnergy[2] += m;
    }
    const cent = magSum > 0 ? weighted / magSum : 0;
    const geo = magSum > 0 ? Math.exp(logSum / bins) : 0;
    const ari = magSum / bins;
    const flat = ari > 0 ? geo / ari : 0;
    const bandTotal = bandEnergy[0] + bandEnergy[1] + bandEnergy[2] || 1;
    // time domain: rms, peak, zcr over the whole second
    let sq = 0;
    let peak = 0;
    let crossings = 0;
    for (let i = 0; i < sampleRate; i++) {
      const v = pcm[start + i] ?? 0;
      sq += v * v;
      const a = Math.abs(v);
      if (a > peak) peak = a;
      const prev = pcm[start + i - 1] ?? v;
      if (v >= 0 !== prev >= 0) crossings++;
    }
    const rms = Math.sqrt(sq / sampleRate);
    const zcr = crossings / sampleRate;
    // the local beat strength: the strongest positive envelope rise inside
    // the second, and the onset bucket from the passed list
    let envPrev = 0;
    let beat = 0;
    for (let f = 0; f * win < sampleRate; f++) {
      let sum = 0;
      const off = start + f * win;
      for (let i = 0; i < win; i++) {
        const v = pcm[off + i] ?? 0;
        sum += v * v;
      }
      const env = Math.sqrt(sum / win);
      const rise = env - envPrev;
      if (rise > beat) beat = rise;
      envPrev = env;
    }
    const onsetsHere = onsets.filter((t) => t >= s && t < s + 1).length;
    // the tonal axis: the chroma of the second and its dominant pitch class
    const chroma = chromaOf(magnitudes, binHz);
    let best = 0;
    for (let pc = 1; pc < 12; pc++) if (chroma[pc] > chroma[best]) best = pc;
    frames.push({
      s,
      rms: Number(rms.toFixed(6)),
      peak: Number(peak.toFixed(6)),
      zcr: Number(zcr.toFixed(4)),
      cent: Math.round(cent),
      flat: Number(flat.toFixed(4)),
      beat: Number(beat.toFixed(4)),
      onsets: onsetsHere,
      bands: bandEnergy.map((e) => Number((e / bandTotal).toFixed(4))),
      note: rms > 0.001 ? NOTE_NAMES[best] : "",
      chroma: chroma.map((c) => Number(c.toFixed(2))),
    });
  }
  return frames;
}

/** The ingest options: the caller stamps the name and the instant. */
export interface IngestOptions {
  /** The display name of the source (no extension). */
  name: string;
  /** The iso instant stamped on the document (defaults to now). */
  at?: string;
}

/** The decomposition the bench plays back: the ingest document plus the
 * stem pcm the wav lane stores (one hpss pass, the analysis and the stored
 * bytes share the same separation — the conservation the audition proves
 * is the one the document pins). */
export interface IngestDecomposition {
  /** The parametrized document (schema debonair.ingest/1). */
  doc: IngestDocument;
  /** The harmonic stem pcm the wav lane encodes. */
  harmonic: Float32Array;
  /** The percussive stem pcm the wav lane encodes. */
  percussive: Float32Array;
}

/**
 * Decomposes one mono pcm into the document AND the stems in hand — the
 * playback-proof lane: the bench separates once, hands every stem to this
 * call, and receives the same document ingestPcm answers beside the stem
 * pcm the mix and stem wavs encode (the deterministic document stays
 * byte-identical to the ingestPcm path).
 *
 * @param mono the decoded pcm (any sample rate; the document records it).
 * @param stems the hpss pair the caller separated (separate(mono)).
 * @param sampleRate the sample rate of the pcm.
 * @param options the name and optional instant.
 * @returns the document plus the stem pcm.
 */
export function decompose(
  mono: Float32Array,
  stems: StemPair,
  sampleRate: number,
  options: IngestOptions,
): IngestDecomposition {
  return {
    doc: documentOf(mono, stems.harmonic, stems.percussive, sampleRate, options),
    harmonic: stems.harmonic,
    percussive: stems.percussive,
  };
}

/**
 * Decomposes one mono pcm into the ingest document: hpss stems, per-stem
 * reports, onset lists and the mix report — the pre-training data one real
 * track contributes to the library.
 *
 * @param mono the decoded pcm (any sample rate; the document records it).
 * @param sampleRate the sample rate of the pcm.
 * @param options the name and optional instant.
 * @returns the ingest document (schema debonair.ingest/1).
 */
export function ingestPcm(mono: Float32Array, sampleRate: number, options: IngestOptions): IngestDocument {
  const { harmonic, percussive } = separate(mono);
  return documentOf(mono, harmonic, percussive, sampleRate, options);
}

/**
 * Decomposes one mono pcm into the mix-lane ingest document — the hpss
 * separation deliberately left out: the mix report and the mix segments
 * over the same analyzers the full walk rides, the stems seat empty. The
 * corpus lane (genrecorpus.ts) reads the mix lane only (the miner's own
 * documented read — mineGenre never touches the stems), so its reference
 * takes train through this lighter walk; the library's pre-training keeps
 * the full ingestPcm (the stems are the audition lane's). Deterministic
 * beside its sibling: the same pcm answers the same mix lane bit-for-bit.
 *
 * @param mono the rendered pcm (any sample rate; the document records it).
 * @param sampleRate the sample rate of the pcm.
 * @param options the name and optional instant.
 * @returns the mix-lane ingest document (stems: []).
 */
export function ingestMixPcm(mono: Float32Array, sampleRate: number, options: IngestOptions): IngestDocument {
  const report = analyze(Array.from(mono), sampleRate, { fingerprint: false });
  const onsets = onsetSecondsOf(mono, sampleRate);
  return {
    schema: INGEST_SCHEMA_VERSION,
    name: options.name,
    ingestedAt: options.at ?? new Date().toISOString(),
    sampleRate,
    durationSeconds: mono.length / sampleRate,
    mix: report,
    segments: segmentsof(mono, sampleRate, onsets),
    pcmhash: pcmhash(mono),
    stems: [],
  };
}

/**
 * Builds the ingest document over a separation the caller owns (the one
 * constructor the decompose and ingestPcm lanes share).
 *
 * @param mono the mix pcm.
 * @param harmonic the harmonic stem pcm.
 * @param percussive the percussive stem pcm.
 * @param sampleRate the sample rate of the pcm.
 * @param options the name and optional instant.
 * @returns the ingest document (schema debonair.ingest/1).
 */
function documentOf(
  mono: Float32Array,
  harmonic: Float32Array,
  percussive: Float32Array,
  sampleRate: number,
  options: IngestOptions,
): IngestDocument {
  const reportOf = (pcm: Float32Array): AudioReport => analyze(Array.from(pcm), sampleRate, { fingerprint: false });
  const harmonicOnsets = onsetSecondsOf(harmonic, sampleRate);
  const percussiveOnsets = onsetSecondsOf(percussive, sampleRate);
  const stems: IngestStem[] = [
    {
      role: "harmonic",
      report: reportOf(harmonic),
      segments: segmentsof(harmonic, sampleRate, harmonicOnsets),
      onsetsSeconds: harmonicOnsets,
      peak: peakOf(harmonic),
      rms: rmsOf(harmonic),
      pcmhash: pcmhash(harmonic),
    },
    {
      role: "percussive",
      report: reportOf(percussive),
      segments: segmentsof(percussive, sampleRate, percussiveOnsets),
      onsetsSeconds: percussiveOnsets,
      peak: peakOf(percussive),
      rms: rmsOf(percussive),
      pcmhash: pcmhash(percussive),
    },
  ];
  const mixOnsets = onsetSecondsOf(mono, sampleRate);
  return {
    schema: INGEST_SCHEMA_VERSION,
    name: options.name,
    ingestedAt: options.at ?? new Date().toISOString(),
    sampleRate,
    durationSeconds: mono.length / sampleRate,
    mix: reportOf(mono),
    segments: segmentsof(mono, sampleRate, mixOnsets),
    pcmhash: pcmhash(mono),
    stems,
  };
}

/* ===== the ingest client lane ===== */

// the typed client of the gateway ingest lane (root
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

/** @section lane — the one call every client of this app rides */

/**
 * One gateway call under the house https law (exported for the sibling
 * client lanes of this app — the generate lane rides the same discipline,
 * one lane helper per app, never duplicated): the origin passes
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
export async function gatewaylane<T>(
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
  return gatewaylane(
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
  return gatewaylane(
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
  return gatewaylane(
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
  return gatewaylane(
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
  return gatewaylane(
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

/* ===== the ingest db lane ===== */

// the node/sqlite half of the ingest store: the rows the
// gateway serves the browser layer (the ingest store lane below) read and
// write here. better-sqlite3 through the db.ts helpers, every statement
// prepared and parameterized — no sql is ever assembled by string
// concatenation (the house database law). The document rides its column
// as canonical json; the pattern miner later reads the same json the
// browser shelf shows.
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
//
// The job ledger of the pipeline wave PV1.006 rides beside the documents:
// the ingest_jobs table — one row per server job the upload route queues,
// the nine-column walk (queued → running → done | failed, the phase and
// the ascending fraction the worker reports) the progress route polls. The
// pointer columns (owner_id, document_id) ride the decimal string form the
// mint answers and the api carries — text cells, the ledger joins nothing,
// no bigint cast dance. The row functions stay synchronous on purpose: the
// worker's progress callback is synchronous, and the walk must land its
// patches in order (the better-sqlite3 discipline).

/** The db face the ingest db lane rides: the site connection and its
 * parameterized helpers, bound through a lazy dynamic import the node
 * callers await once before the first row call (the test suites and the
 * gateway wiring) — the browser pages never call these seats, so the
 * browser bundle never evaluates the native sqlite lane (the same
 * node-face discipline the blob store's node:fs/promises seam rides). */
type DbFace = typeof import("./db.ts");
let db: DbFace["db"];
let execute: DbFace["execute"];
let queryAll: DbFace["queryAll"];
let queryOne: DbFace["queryOne"];

/**
 * Binds the db face once — the entry hand of the sqlite half: the node
 * callers (the test suites, the gateway wiring) await this before the
 * first row call so every statement lands through the one connection the
 * site db owns; the browser never calls it (no page touches these seats).
 *
 * @returns the bound face (the connection and the helpers).
 */
export async function loaddbface(): Promise<DbFace> {
  const face = await import("./db.ts");
  db = face.db;
  execute = face.execute;
  queryAll = face.queryAll;
  queryOne = face.queryOne;
  return face;
}

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
    // biome-ignore lint/style/useTemplate: the source audit of the ledger wave forbids every template interpolation inside the db module (the house database law)
    super(message ?? "ingest db " + code);
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
 * Reads one ingest document by id (the sqlite half — the parsed document
 * the docjson column carries).
 *
 * @param id the record id.
 * @returns the document, or undefined when the id is unknown.
 */
export function getingestdoc(id: string): IngestDocument | undefined {
  const row = getingestrow(id);
  if (!row) return undefined;
  try {
    return JSON.parse(row.docjson) as IngestDocument;
  } catch {
    return undefined;
  }
}

/**
 * Lists every ingest document, newest first (the shelf order — the sqlite
 * half, the parsed documents the docjson columns carry).
 *
 * @returns the parsed documents.
 */
export function listingestdocs(): IngestDocument[] {
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
 * Drops one ingest row (the sqlite half — the row and its docjson; the
 * blobs the pointers address ride the caller's lane).
 *
 * @param id the record id.
 * @returns true when a row was removed.
 */
export function droppingestrow(id: string): boolean {
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

/* ------------------------------------------------------------------ */
/* the job ledger (wave PV1.006) — the ingest_jobs walk                */
/* ------------------------------------------------------------------ */

/** The job states the ledger walks (the upload registers "queued", the
 * run moves it through "running", the walk lands "done" or "failed"). */
export type IngestJobState = "queued" | "running" | "done" | "failed";

/** One job ledger row as the sqlite table holds it — the nine prescribed
 * columns of the walk (the progress route answers these verbatim, the
 * pointer columns in the decimal string form the mint answers). */
export interface IngestJobRow {
  /** The minted job id (the decimal string the upload's mint answered). */
  id: string;
  /** The owner pointer (the decimal string — the identity the stamps carry). */
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

/** The mutable fields of one job row — the walk patches these (the id, the
 * owner and the registration instant never change). */
export interface IngestJobPatch {
  /** The walk state. */
  state?: IngestJobState;
  /** The last completed phase. */
  phase?: string | null;
  /** The completed share. */
  fraction?: number;
  /** The honest failure. */
  error?: string | null;
  /** The stamped document id. */
  document_id?: string | null;
  /** The landing instant. */
  finished_at?: string | null;
}

/** The create statement of the ledger — a fresh database gets the nine
 * columns in one statement; a standing table keeps its rows (the
 * create-if-not-exists law, the same shape the documents table rides). */
const CREATE_INGEST_JOBS = `
    CREATE TABLE IF NOT EXISTS ingest_jobs (
      id          TEXT PRIMARY KEY,
      owner_id    TEXT NOT NULL,
      state       TEXT NOT NULL DEFAULT 'queued',
      phase       TEXT,
      fraction    REAL NOT NULL DEFAULT 0,
      error       TEXT,
      document_id TEXT,
      created_at  TEXT NOT NULL,
      finished_at TEXT
    );
  `;

/**
 * Brings the ingest_jobs table to any better-sqlite3 handle — the
 * create-if-not-exists migration (idempotent: a fresh handle gets the
 * table, a standing one keeps its rows). DDL only, a constant statement,
 * zero parameters, zero interpolation.
 *
 * @param target the database handle (the app db or a test database).
 */
export function migratejobsschema(target: typeof db): void {
  target.exec(CREATE_INGEST_JOBS);
}

/**
 * Ensures the ingest_jobs table exists on the app database (the ledger
 * creates its own table so the schema stays layered — the seed never
 * depends on it).
 */
export function ensurejobsschema(): void {
  migratejobsschema(db);
}

/**
 * Registers one job row (or refreshes the row of the same id — the upsert
 * law the document writes ride).
 *
 * @param row the full ledger row.
 */
export function putjob(row: IngestJobRow): void {
  ensurejobsschema();
  execute(
    `INSERT INTO ingest_jobs (id, owner_id, state, phase, fraction, error, document_id, created_at, finished_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       owner_id = excluded.owner_id,
       state = excluded.state,
       phase = excluded.phase,
       fraction = excluded.fraction,
       error = excluded.error,
       document_id = excluded.document_id,
       created_at = excluded.created_at,
       finished_at = excluded.finished_at`,
    [
      row.id,
      row.owner_id,
      row.state,
      row.phase,
      row.fraction,
      row.error,
      row.document_id,
      row.created_at,
      row.finished_at,
    ],
  );
}

/**
 * Reads one job row by id.
 *
 * @param id the job id.
 * @returns the row, or null when the id answers nothing.
 */
export function getjob(id: string): IngestJobRow | null {
  ensurejobsschema();
  return (
    queryOne<IngestJobRow>(
      "SELECT id, owner_id, state, phase, fraction, error, document_id, created_at, finished_at FROM ingest_jobs WHERE id = ?",
      [id],
    ) ?? null
  );
}

/**
 * Patches one job row — the walk lands its patches here (the state, the
 * phase, the fraction, the error, the document, the finish). The merge is
 * read-then-write over two constant statements: the standing row reads,
 * the patch overlays, the full mutable set writes back — a column the
 * patch omits keeps its standing value (the single-writer walk of the
 * gateway lane keeps the read-then-write honest: one worker walks one
 * job).
 *
 * @param id the job id.
 * @param patch the mutable fields to overlay.
 * @returns true when a row was patched.
 */
export function updatejob(id: string, patch: IngestJobPatch): boolean {
  const standing = getjob(id);
  if (standing === null) return false;
  execute(
    "UPDATE ingest_jobs SET state = ?, phase = ?, fraction = ?, error = ?, document_id = ?, finished_at = ? WHERE id = ?",
    [
      patch.state ?? standing.state,
      patch.phase !== undefined ? patch.phase : standing.phase,
      patch.fraction ?? standing.fraction,
      patch.error !== undefined ? patch.error : standing.error,
      patch.document_id !== undefined ? patch.document_id : standing.document_id,
      patch.finished_at !== undefined ? patch.finished_at : standing.finished_at,
      id,
    ],
  );
  return true;
}

/**
 * Lists the job rows, newest first (the created_at order, the minted id
 * as the same-instant tiebreak — the ids sort by creation). An owner
 * filter rides when the caller carries one.
 *
 * @param ownerId the owner pointer filter, or undefined for every row.
 * @returns the rows.
 */
export function listjobs(ownerId?: string): IngestJobRow[] {
  ensurejobsschema();
  if (ownerId === undefined) {
    return queryAll<IngestJobRow>(
      "SELECT id, owner_id, state, phase, fraction, error, document_id, created_at, finished_at FROM ingest_jobs ORDER BY created_at DESC, id DESC",
    );
  }
  return queryAll<IngestJobRow>(
    "SELECT id, owner_id, state, phase, fraction, error, document_id, created_at, finished_at FROM ingest_jobs WHERE owner_id = ? ORDER BY created_at DESC, id DESC",
    [ownerId],
  );
}

/* ===== the ingest payload lane ===== */

// the structured payload lane of the kathesis ingest (root
// layer, wave T4-E · PR17): the v1 pattern the owner charged as valid, rebuilt
// on the honest laws — the forward ingest turns sound bytes into the detailed
// structured json payload (the container facts, the track summary, the 100 ms
// energy chunks, the beats and onsets, and the embedded debonair.ingest/1
// document with its per-second vector frames), and the reverse ingest
// reconstructs playable wav bytes out of that payload through seeded vector
// synthesis — never a re-encode, never a base64 pcm array (the corpus ban).
// The lane is pure typescript: zero dependencies, zero dom, zero audio
// context, zero gpu — the sandbox runs it wherever the deploy pins the worker
// modality, the visitor machine is never touched. The compressed containers
// answer the honest container-only payload (real header facts, zero fake
// vectors): decoding mp3/ogg needs a codec the pure node lane does not carry,
// and the limit is documented in code, tests and
// docs/kathesisresearch.md instead of being papered over.

// ---- the schema and the constants ------------------------------------------

/** The schema literal of the structured payload this lane writes (the only one). */
export const SOUND_PAYLOAD_SCHEMA_VERSION = "debonair.soundpayload/1";

/** The energy chunk span in milliseconds — the sub-second envelope resolution
 * the one-second vector frames do not carry (ten chunks per second). */
export const ENERGY_CHUNK_MS = 100;

/** The default depth of the reconstructed wav (the compact pcm16 lane; the
 * caller may ask for 24 or the 32f float lane through the options). */
export const RECONSTRUCT_DEFAULT_DEPTH: WavBitDepth = 16;

/** The sandbox modality this lane's walk declares (the same vocabulary mirror
 * the ingest worker rides): the honest default is "local" — the walk runs in
 * the deploy's own process and this module never spawns anything itself. The
 * declaration is the contract the deploy reads; a deploy that opts the heavy
 * synthesis onto a saddle modality pins DEBONAIR_WORKER_MODALITY and the
 * platform resolves the sandbox — the browser and the gpu of the visitor are
 * never part of this lane. */
export const PAYLOAD_LANE_MODALITY: WorkerModality = "local";

// ---- the container probe ----------------------------------------------------

/** The sound container kinds the probe speaks. */
export type SoundFormatKind = "wav" | "mp3" | "ogg" | "unknown";

/** The container facts the probe answers — what the bytes say, honestly split
 * between the formats the pure-node lane can fully walk (wav) and the ones it
 * can only read at the header level (mp3, ogg). */
export interface SoundContainerFacts {
  /** The detected container kind ("unknown" when no magic matches). */
  format: SoundFormatKind;
  /** The bare mime of the container ("audio/wav", "audio/mpeg", "audio/ogg"). */
  mime: string;
  /** The frames per second the header declares (null when unreadable). */
  sampleRate: number | null;
  /** The channel count the header declares (null when unreadable). */
  channels: number | null;
  /** The bits per sample the wav fmt chunk declares (wav only, else null). */
  bitDepth: number | null;
  /** The duration in seconds (the exact walk for wav, the granule scan for
   * ogg, the cbr estimate for mp3 — null when the container says nothing). */
  durationSeconds: number | null;
  /** True only when the pure-node lane can decode the pcm (the wav walk);
   * compressed containers answer false — the honest codec limit. */
  decodable: boolean;
  /** The human-readable honest summary ("riff/wave pcm 16-bit stereo 44100
   * hz, 2.00 s" / "mpeg1 layer iii, 128 kbps cbr estimate, 44100 hz, joint
   * stereo, ~3.00 s (cbr estimate)"). */
  facts: string;
}

/** The layer-iii bitrate tables (kbps), indexed by the 4-bit header field —
 * protocol constants of the mpeg audio standard, the same law the wav
 * format table rides. */
const MP3_BITRATES_KBPS: Readonly<Record<"mpeg1" | "mpeg2", readonly number[]>> = {
  mpeg1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  mpeg2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};

/** The sample-rate tables (hz), indexed by the 2-bit header field. */
const MP3_RATES_HZ: Readonly<Record<"mpeg1" | "mpeg2" | "mpeg25", readonly number[]>> = {
  mpeg1: [44100, 48000, 32000],
  mpeg2: [22050, 24000, 16000],
  mpeg25: [11025, 12000, 8000],
};

/** The channel-mode names of the mp3 header, indexed by the 2-bit field. */
const MP3_MODES: readonly string[] = ["stereo", "joint stereo", "dual channel", "mono"];

/** The bound of the mp3 frame-sync scan (bytes after the id3 tag) — the probe
 * never walks a whole file hunting a header. */
const MP3_SCAN_LIMIT = 65536;

/** Reads an ascii field of `length` bytes at `offset` (the probe's own reader). */
function asciiof(bytes: Uint8Array, offset: number, length: number): string {
  let text = "";
  for (let index = 0; index < length; index++) text += String.fromCharCode(bytes[offset + index]);
  return text;
}

/** Skips the id3v2 tag when present, answering the offset the audio frames
 * start at (the syncsafe size field, ten bytes of overhead). */
function id3skip(bytes: Uint8Array): number {
  if (bytes.length < 10 || asciiof(bytes, 0, 3) !== "ID3") return 0;
  const size = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
  return 10 + size;
}

/** The one mpeg layer-iii frame header the scan accepted. */
interface Mp3Frame {
  /** The absolute offset of the frame header. */
  offset: number;
  /** The mpeg generation ("mpeg1" | "mpeg2" | "mpeg25"). */
  generation: "mpeg1" | "mpeg2" | "mpeg25";
  /** The bitrate in kbps (0 means the free band — the scan refuses it). */
  bitrateKbps: number;
  /** The sample rate in hz. */
  sampleRate: number;
  /** The channel count (1 mono, 2 otherwise). */
  channels: number;
  /** The channel-mode name. */
  mode: string;
}

/** Scans for the first valid mpeg layer-iii frame header at or after `from` —
 * the sync word, the version and layer fields, the bitrate and rate indexes
 * all validated; anything else keeps the scan moving. */
function mp3frame(bytes: Uint8Array, from: number): Mp3Frame | null {
  const limit = Math.min(bytes.length - 4, from + MP3_SCAN_LIMIT);
  for (let i = from; i < limit; i++) {
    if (bytes[i] !== 0xff || (bytes[i + 1] & 0xe0) !== 0xe0) continue;
    const versionBits = (bytes[i + 1] >> 3) & 0x3;
    const layerBits = (bytes[i + 1] >> 1) & 0x3;
    if (versionBits === 1 || layerBits !== 1) continue; // reserved version, non-iii layer
    const generation = versionBits === 3 ? "mpeg1" : versionBits === 2 ? "mpeg2" : "mpeg25";
    const bitrateIndex = bytes[i + 2] >> 4;
    const rateIndex = (bytes[i + 2] >> 2) & 0x3;
    if (bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3) continue;
    const bitrateKbps = MP3_BITRATES_KBPS[generation === "mpeg1" ? "mpeg1" : "mpeg2"][bitrateIndex];
    const sampleRate = MP3_RATES_HZ[generation][rateIndex];
    const modeIndex = bytes[i + 3] >> 6;
    return {
      offset: i,
      generation,
      bitrateKbps,
      sampleRate,
      channels: modeIndex === 3 ? 1 : 2,
      mode: MP3_MODES[modeIndex],
    };
  }
  return null;
}

/** The ogg identification answer of the first page. */
interface OggIdent {
  /** The codec the first packet names ("vorbis" | "opus"). */
  codec: "vorbis" | "opus";
  /** The channel count the ident header declares. */
  channels: number;
  /** The sample rate the ident header declares (the opus decode rate is
   * always 48000 — the input rate is informational). */
  sampleRate: number;
}

/** Reads the ogg identification header off the first page payload and walks
 * every page for the greatest granule position — the duration the container
 * itself declares (vorbis granules count at the ident rate, opus at 48000). */
function oggwalk(bytes: Uint8Array): { ident: OggIdent; maxGranule: number } | null {
  if (bytes.length < 27 || asciiof(bytes, 0, 4) !== "OggS") return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const firstSegments = bytes[26];
  const payloadStart = 27 + firstSegments;
  if (payloadStart > bytes.length) return null;
  const magic = asciiof(bytes, payloadStart, 7);
  let ident: OggIdent | null = null;
  if (magic === "\x01vorbis") {
    ident = {
      codec: "vorbis",
      channels: bytes[payloadStart + 11],
      sampleRate: view.getUint32(payloadStart + 12, true),
    };
  } else if (asciiof(bytes, payloadStart, 8) === "OpusHead") {
    const inputRate = view.getUint32(payloadStart + 12, true);
    ident = { codec: "opus", channels: bytes[payloadStart + 9], sampleRate: inputRate > 0 ? inputRate : 48000 };
  }
  if (!ident || ident.channels < 1 || ident.sampleRate < 1) return null;
  // the granule walk: every page header carries its granule at offset 6
  let offset = 0;
  let maxGranule = 0;
  while (offset + 27 <= bytes.length && asciiof(bytes, offset, 4) === "OggS") {
    const granuleLo = view.getUint32(offset + 6, true);
    const granuleHi = view.getUint32(offset + 10, true);
    const granule = granuleHi * 4294967296 + granuleLo;
    if (granule > maxGranule) maxGranule = granule;
    const segments = bytes[offset + 26];
    let pageLength = 27 + segments;
    for (let s = 0; s < segments; s++) pageLength += bytes[offset + 27 + s];
    if (pageLength <= 0) break;
    offset += pageLength;
  }
  return { ident, maxGranule };
}

/**
 * probesound — the container probe: what the bytes are and what they declare,
 * honestly split by what the pure-node lane can walk. The wav lane answers
 * the full riff facts (decodable true); the mp3 lane answers the layer-iii
 * frame facts with the cbr duration estimate (an estimate, labeled as one);
 * the ogg lane answers the identification header plus the granule-scan
 * duration; anything else answers the unknown refusal. Never throws — the
 * facts carry the refusal.
 *
 * @param bytes the sound bytes of any container.
 * @returns the container facts (format "unknown" when no magic matches).
 */
export function probesound(bytes: Uint8Array): SoundContainerFacts {
  if (bytes.length >= 12 && asciiof(bytes, 0, 4) === "RIFF" && asciiof(bytes, 8, 4) === "WAVE") {
    try {
      const layout = readWavLayout(bytes);
      const duration = layout.frames / layout.sampleRate;
      return {
        format: "wav",
        mime: "audio/wav",
        sampleRate: layout.sampleRate,
        channels: layout.channels,
        bitDepth: layout.bitDepth,
        durationSeconds: duration,
        decodable: true,
        facts: `riff/wave ${layout.isFloat ? "ieee float" : "pcm"} ${layout.bitDepth}-bit ${
          layout.channels === 1 ? "mono" : `${layout.channels} channels`
        } ${layout.sampleRate} hz, ${duration.toFixed(2)} s`,
      };
    } catch (error) {
      const code = error instanceof AudioDecodeError ? error.code : "unreadable";
      return {
        format: "wav",
        mime: "audio/wav",
        sampleRate: null,
        channels: null,
        bitDepth: null,
        durationSeconds: null,
        decodable: false,
        facts: `riff/wave magic present but the walk refused (${code})`,
      };
    }
  }
  if (bytes.length >= 4 && asciiof(bytes, 0, 4) === "OggS") {
    const walk = oggwalk(bytes);
    if (walk) {
      const rate = walk.ident.codec === "opus" ? 48000 : walk.ident.sampleRate;
      const duration = walk.maxGranule > 0 ? walk.maxGranule / rate : null;
      return {
        format: "ogg",
        mime: "audio/ogg",
        sampleRate: rate,
        channels: walk.ident.channels,
        bitDepth: null,
        durationSeconds: duration,
        decodable: false,
        facts: `ogg ${walk.ident.codec}, ${walk.ident.channels === 1 ? "mono" : `${walk.ident.channels} channels`}, ${rate} hz${
          duration === null ? "" : `, ${duration.toFixed(2)} s (granule scan)`
        }`,
      };
    }
    return {
      format: "ogg",
      mime: "audio/ogg",
      sampleRate: null,
      channels: null,
      bitDepth: null,
      durationSeconds: null,
      decodable: false,
      facts: "ogg page magic present but the identification header refused",
    };
  }
  const frame = mp3frame(bytes, id3skip(bytes));
  if (frame) {
    const audioBytes = Math.max(0, bytes.length - frame.offset);
    const duration = frame.bitrateKbps > 0 ? (audioBytes * 8) / (frame.bitrateKbps * 1000) : null;
    return {
      format: "mp3",
      mime: "audio/mpeg",
      sampleRate: frame.sampleRate,
      channels: frame.channels,
      bitDepth: null,
      durationSeconds: duration,
      decodable: false,
      facts: `${frame.generation} layer iii, ${frame.bitrateKbps} kbps, ${frame.sampleRate} hz, ${frame.mode}${
        duration === null ? "" : `, ~${duration.toFixed(2)} s (cbr estimate)`
      }`,
    };
  }
  return {
    format: "unknown",
    mime: "application/octet-stream",
    sampleRate: null,
    channels: null,
    bitDepth: null,
    durationSeconds: null,
    decodable: false,
    facts: "no container magic the probe walks (riff/wave, ogg pages, id3 or mpeg sync)",
  };
}

// ---- the energy chunks -------------------------------------------------------

/** One energy chunk of the envelope — the sub-second resolution the payload
 * adds over the one-second vector frames (the "chunks de energia" of the
 * owner's charge). */
export interface EnergyChunk {
  /** The chunk index (0-based, ascending). */
  i: number;
  /** The chunk span in milliseconds (the constant the lane rode). */
  ms: number;
  /** The rms of the chunk (0..1). */
  rms: number;
  /** The peak of the chunk (0..1+). */
  peak: number;
}

/**
 * energychunks — the fixed-span energy envelope of a pcm: one chunk per
 * ENERGY_CHUNK_MS with its rms and peak, the last chunk covering the tail.
 * Pure and deterministic — the same pcm answers the same chunks.
 *
 * @param pcm the mono pcm of any length.
 * @param sampleRate the rate of the pcm.
 * @param chunkMs the chunk span (defaults to ENERGY_CHUNK_MS).
 * @returns the chunks, ascending, rounded to six decimals.
 */
export function energychunks(pcm: Float32Array, sampleRate: number, chunkMs: number = ENERGY_CHUNK_MS): EnergyChunk[] {
  if (chunkMs <= 0 || !Number.isFinite(chunkMs)) chunkMs = ENERGY_CHUNK_MS;
  const win = Math.max(1, Math.round((chunkMs / 1000) * sampleRate));
  const chunks: EnergyChunk[] = [];
  for (let start = 0; start < pcm.length; start += win) {
    let sum = 0;
    let peak = 0;
    const end = Math.min(start + win, pcm.length);
    for (let i = start; i < end; i++) {
      sum += pcm[i] * pcm[i];
      const a = Math.abs(pcm[i]);
      if (a > peak) peak = a;
    }
    const count = end - start;
    chunks.push({
      i: chunks.length,
      ms: Math.round((start / sampleRate) * 1000),
      rms: Number(Math.sqrt(sum / count).toFixed(6)),
      peak: Number(peak.toFixed(6)),
    });
  }
  return chunks;
}

// ---- the structured payload --------------------------------------------------

/** The analysis depth the payload honestly declares: "full" (the wav lane —
 * the pcm was decoded and decomposed) or "container-only" (the compressed
 * lane — header facts only, zero analysis vectors, zero fake numbers). */
export type PayloadAnalysisDepth = "full" | "container-only";

/** The source block of the payload: what the bytes are and where they came
 * from — the identity fields (byte length, sha256) beside the container
 * facts the probe answered. */
export interface SoundPayloadSource {
  /** The display name of the source (one trailing extension folded away). */
  name: string;
  /** The byte length of the source. */
  byteLength: number;
  /** The sha256 of the source bytes (the content identity the store rides). */
  sha256: string;
  /** The container facts of the probe (format, mime, rate, channels, depth,
   * duration, decodable, the facts line). */
  container: SoundContainerFacts;
}

/** The track summary of the full analysis — the faixa numbers the owner's
 * charge names: duration, sample rate, tempo, key, loudness, the stems and
 * the structure counts. */
export interface SoundPayloadTrack {
  /** The analyzed duration in seconds (the whole source, or the clamped
   * window when maxDurationSeconds rode). */
  durationSeconds: number;
  /** The sample rate of the analysis (the source's own rate). */
  sampleRate: number;
  /** The dominant bpm of the mix (the autocorrelation tempo of the report). */
  bpm: number;
  /** The detected key: the tonic name and the mode. */
  key: { tonic: string; mode: "major" | "minor" };
  /** The integrated loudness of the mix in LUFS (measured, never claimed). */
  loudnessLufs: number;
  /** The onset count of the mix. */
  onsetCount: number;
  /** The per-stem summaries (role, frame count, onset count, peak, rms, pcmhash). */
  stems: {
    role: string;
    frames: number;
    onsets: number;
    peak: number;
    rms: number;
    pcmhash: number;
  }[];
  /** The structure section count of the mix report. */
  structureSections: number;
  /** The fnv-1a hash of the mix pcm (the fidelity id of the take). */
  pcmhash: number;
}

/** The beats block of the full analysis: the tempo and the onset lists — the
 * mix onsets beside the per-stem onsets (the "beats/onsets" of the charge). */
export interface SoundPayloadBeats {
  /** The dominant bpm of the mix. */
  bpm: number;
  /** The mix onset times in seconds, ascending. */
  onsetSeconds: number[];
  /** The per-stem onset lists, in the document's stem order. */
  stems: { role: string; onsetSeconds: number[] }[];
}

/** The structured payload document — the v1 pattern improved: the container
 * facts, the track summary, the energy chunks, the beats, and the embedded
 * debonair.ingest/1 document (the per-second vector frames the miner and the
 * composer read), all in one grammar, deterministic for the same bytes. */
export interface SoundPayload {
  /** The schema literal ("debonair.soundpayload/1"). */
  schema: string;
  /** The display name of the source. */
  name: string;
  /** The iso instant of the ingest. */
  ingestedAt: string;
  /** The honest depth marker ("full" | "container-only"). */
  analysis: PayloadAnalysisDepth;
  /** The source block (identity + container facts). */
  source: SoundPayloadSource;
  /** The track summary (null on the container-only lane). */
  track: SoundPayloadTrack | null;
  /** The energy chunks (empty on the container-only lane). */
  energy: EnergyChunk[];
  /** The beats block (null on the container-only lane). */
  beats: SoundPayloadBeats | null;
  /** The embedded decomposition document (null on the container-only lane). */
  document: IngestDocument | null;
}

/** The ingest options of the payload lane: the caller stamps the name, the
 * instant and the optional analysis window. */
export interface IngestPayloadOptions {
  /** The display name of the source (one trailing extension folds away). */
  name: string;
  /** The iso instant stamped on the payload (defaults to now). */
  at?: string;
  /** Decode at most this many seconds from the head (the bounded-work guard
   * the decode lane rides; the container facts keep the full duration). */
  maxDurationSeconds?: number;
}

/** The machine codes the payload ingest answers. */
export type IngestPayloadErrorCode = "unknown-format" | "wav-unwalkable" | "empty-audio";

/** The typed ingest result — ok carries the payload, the error branch
 * carries the machine code. Never a throw. */
export type IngestPayloadResult =
  | { ok: true; payload: SoundPayload }
  | { ok: false; code: IngestPayloadErrorCode; message: string };

/** Folds one trailing extension away and answers a non-empty display name
 * (the one law the payload and the worker lanes share — the fold kept this
 * single seat, the worker's twin retired with it). */
function displayname(name: string): string {
  const stripped = name.replace(/\.[^.]+$/, "");
  if (stripped.length > 0) return stripped;
  return name.length > 0 ? name : "untitled";
}

/** Downmixes interleaved pcm to the mono channel-average (the channel law
 * the worker lane rides, the [-1, 1] clamp included). */
function monodownmix(interleaved: Float32Array, channels: number): Float32Array {
  if (channels === 1) return interleaved;
  const frames = Math.floor(interleaved.length / channels);
  const mono = new Float32Array(frames);
  for (let frame = 0; frame < frames; frame++) {
    let sum = 0;
    for (let channel = 0; channel < channels; channel++) sum += interleaved[frame * channels + channel];
    const average = sum / channels;
    mono[frame] = Math.min(1, Math.max(-1, average));
  }
  return mono;
}

/**
 * ingestPayload — the forward ingest of the v1 pattern: the sound bytes
 * become the detailed structured payload. The wav lane decodes (the pure
 * riff walk), downmixes and hands the pcm to ingest.ts's own end-to-end
 * chain (ingestPcm — the decomposition math is never duplicated here), then
 * layers the container facts, the track summary, the energy chunks and the
 * beats around the embedded document. The mp3/ogg lanes answer the honest
 * container-only payload: real header facts, "container-only" depth, zero
 * analysis vectors — the pure node lane carries no compressed codec and the
 * payload says so instead of inventing numbers. Deterministic for the same
 * bytes and options.
 *
 * @param bytes the sound bytes (wav fully walked; mp3/ogg header facts only).
 * @param options the name, the optional instant and the optional window.
 * @returns the typed payload result (machine-coded refusals, never a throw).
 */
export function ingestPayload(bytes: Uint8Array, options: IngestPayloadOptions): IngestPayloadResult {
  const probe = probesound(bytes);
  const name = displayname(options.name);
  const source: SoundPayloadSource = {
    name,
    byteLength: bytes.length,
    sha256: sha256hex(bytes),
    container: probe,
  };
  const ingestedAt = options.at ?? new Date().toISOString();
  if (probe.format === "unknown") {
    return {
      ok: false,
      code: "unknown-format",
      message: `the bytes carry no container magic the lane walks: ${probe.facts}`,
    };
  }
  if (probe.format === "wav" && !probe.decodable) {
    return { ok: false, code: "wav-unwalkable", message: `the riff walk refused the bytes: ${probe.facts}` };
  }
  if (!probe.decodable) {
    // the honest compressed lane: header facts, zero fake vectors
    return {
      ok: true,
      payload: {
        schema: SOUND_PAYLOAD_SCHEMA_VERSION,
        name,
        ingestedAt,
        analysis: "container-only",
        source,
        track: null,
        energy: [],
        beats: null,
        document: null,
      },
    };
  }

  // the wav lane: decode the clamped window, downmix, decompose
  const layout = readWavLayout(bytes);
  const frames =
    options.maxDurationSeconds === undefined
      ? layout.frames
      : Math.min(layout.frames, Math.floor(options.maxDurationSeconds * layout.sampleRate));
  const interleaved = readWavSamples(bytes, { ...layout, frames });
  const mono = monodownmix(interleaved, layout.channels);
  if (mono.length === 0) return { ok: false, code: "empty-audio", message: "the container carries no audio frames" };
  const document = ingestPcm(mono, layout.sampleRate, { name, at: ingestedAt });
  const mixOnsets = onsetSecondsOf(mono, layout.sampleRate);
  const track: SoundPayloadTrack = {
    durationSeconds: document.durationSeconds,
    sampleRate: document.sampleRate,
    bpm: document.mix.rhythm.bpm,
    key: { tonic: document.mix.key.tonicName, mode: document.mix.key.mode },
    loudnessLufs: document.mix.loudness.integrated,
    onsetCount: mixOnsets.length,
    stems: document.stems.map((stem) => ({
      role: stem.role,
      frames: stem.segments.length,
      onsets: stem.onsetsSeconds.length,
      peak: stem.peak,
      rms: stem.rms,
      pcmhash: stem.pcmhash,
    })),
    structureSections: document.mix.structure.length,
    pcmhash: document.pcmhash,
  };
  const beats: SoundPayloadBeats = {
    bpm: document.mix.rhythm.bpm,
    onsetSeconds: mixOnsets.map((t) => Number(t.toFixed(4))),
    stems: document.stems.map((stem) => ({
      role: stem.role,
      onsetSeconds: stem.onsetsSeconds.map((t) => Number(t.toFixed(4))),
    })),
  };
  return {
    ok: true,
    payload: {
      schema: SOUND_PAYLOAD_SCHEMA_VERSION,
      name,
      ingestedAt,
      analysis: "full",
      source,
      track,
      energy: energychunks(mono, layout.sampleRate),
      beats,
      document,
    },
  };
}

// ---- the reverse ingest (the reconstruction) ---------------------------------

/** The synthesis gains of the reconstruction — the mix of the tonal bed, the
 * noise bed and the onset bursts; protocol constants of the lane, tuned once
 * and pinned by the fidelity tests. */
const SYNTH_GAINS = {
  /** The partial gain per weighted chroma bin. */
  partial: 0.3,
  /** The filtered-noise bed gain (the percussive bands). */
  noise: 0.5,
  /** The onset burst gain (the percussive attacks). */
  burst: 0.6,
} as const;

/** The onset burst shape: attack and decay in milliseconds. */
const BURST_ATTACK_MS = 1;
const BURST_DECAY_MS = 120;

/** The reconstruction options: the depth of the emitted wav. */
export interface ReconstructOptions {
  /** The bit depth of the wav bytes (16, 24 or 32f — defaults to 16). */
  bitDepth?: WavBitDepth;
}

/** The measured fidelity of the reconstruction — the per-second gap between
 * the synthesized rms and the payload's own vector frames, measured on the
 * synthesis the lane just ran (the truth funnel spirit of the corpus: zcr,
 * flatness, centroid — here the rms ladder — measured, never claimed). */
export interface ReconstructionFidelity {
  /** The mean absolute per-second rms gap against the document frames. */
  meanRmsError: number;
  /** The worst absolute per-second rms gap. */
  worstRmsError: number;
}

/** The reconstruction answer: the wav bytes plus the honest self-measurement. */
export interface SoundReconstruction {
  /** The riff/wave bytes (pcm16/24/32f per the options) — real container
   * bytes the player lane or the sandbox can stream as-is. */
  bytes: Uint8Array;
  /** The mime of the bytes ("audio/wav"). */
  mime: string;
  /** The sample rate of the synthesis (the payload's own analysis rate). */
  sampleRate: number;
  /** The duration of the synthesis in seconds. */
  durationSeconds: number;
  /** The fnv-1a hash of the synthesized pcm (the identity of the rebuild). */
  pcmhash: number;
  /** The measured fidelity against the payload's vector frames. */
  fidelity: ReconstructionFidelity;
}

/** The machine codes the reconstruction answers. */
export type ReconstructErrorCode =
  | "bad-schema"
  | "container-only"
  | "no-frames"
  | "rate-out-of-band"
  | "encode-refused";

/** The typed reconstruction result — ok carries the wav bytes and the
 * fidelity, the error branch carries the machine code. Never a throw. */
export type ReconstructResult =
  | { ok: true; reconstruction: SoundReconstruction }
  | { ok: false; code: ReconstructErrorCode; message: string };

/** Answers the energy shape of one second — the chunk rms values of that
 * second normalized to their max (0 when the second is silent, a flat 1 when
 * the payload carries no chunks for it), the within-second envelope both
 * stems ride. */
function secondshape(payload: SoundPayload, second: number, chunksPerSecond: number): number[] {
  const start = second * chunksPerSecond;
  const slice = payload.energy.slice(start, start + chunksPerSecond).map((chunk) => chunk.rms);
  if (slice.length === 0) return Array.from({ length: chunksPerSecond }, () => 1);
  const max = Math.max(...slice, 0);
  if (max <= 0) return slice.map(() => 0);
  return slice.map((rms) => rms / max);
}

/**
 * reconstructWav — the reverse ingest of the v1 pattern: the structured
 * payload becomes real wav bytes through seeded vector synthesis. The
 * harmonic stem's chroma frames drive additive partials (one sine per
 * weighted pitch class in the mid register, the phase drawn from the
 * engine's own mulberry32 seat), the percussive stem's band fractions drive
 * a three-band filtered-noise bed, the percussive onset list drives the
 * exponential-decay bursts, and the mix energy chunks shape every second —
 * the two synthesized stems sum like the hpss pair the document pinned. The
 * result is honest vector synthesis (the v1 proof's quality bar), never a
 * bit-exact re-encode: the payload carries vectors and hashes only, and the
 * fidelity block measures the per-second gap instead of claiming it away.
 * Deterministic — the same payload answers the same bytes.
 *
 * @param payload the structured payload (the full-analysis lane).
 * @param options the depth of the emitted wav (defaults to pcm16).
 * @returns the typed reconstruction result (machine-coded refusals).
 */
export function reconstructWav(payload: SoundPayload, options: ReconstructOptions = {}): ReconstructResult {
  if (payload.schema !== SOUND_PAYLOAD_SCHEMA_VERSION) {
    return {
      ok: false,
      code: "bad-schema",
      message: `the payload schema ${payload.schema} is not ${SOUND_PAYLOAD_SCHEMA_VERSION}`,
    };
  }
  if (payload.analysis !== "full" || !payload.document || !payload.track) {
    return {
      ok: false,
      code: "container-only",
      message:
        "the payload carries no vector frames (container-only lane) — the reconstruction needs the full analysis",
    };
  }
  const document = payload.document;
  if (document.segments.length === 0 || document.stems.length === 0) {
    return { ok: false, code: "no-frames", message: "the document carries no per-second frames to synthesize from" };
  }
  const sampleRate = document.sampleRate;
  if (sampleRate < SAMPLE_RATE_MIN || sampleRate > SAMPLE_RATE_MAX) {
    return {
      ok: false,
      code: "rate-out-of-band",
      message: `the analysis rate ${sampleRate} hz sits outside the writer band ${SAMPLE_RATE_MIN}..${SAMPLE_RATE_MAX}`,
    };
  }
  const seconds = document.segments.length;
  const chunksPerSecond = Math.max(1, Math.round(1000 / ENERGY_CHUNK_MS));
  const mono = new Float32Array(seconds * sampleRate);
  const rng = mulberry32(hashSeed(`soundpayload:${document.pcmhash}`));
  const harmonic = document.stems.find((stem) => stem.role === "harmonic") ?? document.stems[0];
  const percussive = document.stems.find((stem) => stem.role === "percussive") ?? document.stems[1];

  for (let second = 0; second < seconds; second++) {
    const shape = secondshape(payload, second, chunksPerSecond);
    const hseg = harmonic.segments[second];
    const pseg = percussive.segments[second];
    const start = second * sampleRate;
    // the tonal bed: one partial per weighted pitch class, the mid register
    let chromaMax = 0;
    for (let pc = 0; pc < 12; pc++) if (hseg.chroma[pc] > chromaMax) chromaMax = hseg.chroma[pc];
    const partials: { hz: number; amp: number; phase: number }[] = [];
    if (chromaMax > 0 && hseg.rms > 0) {
      for (let pc = 0; pc < 12; pc++) {
        const weight = hseg.chroma[pc] / chromaMax;
        if (weight < 0.1) continue;
        partials.push({
          hz: midiToHz(48 + pc),
          amp: weight * hseg.rms * SYNTH_GAINS.partial,
          phase: rng() * 2 * Math.PI,
        });
      }
    }
    // the noise bed: three one-pole bands shaped by the percussive fractions
    const lowAmp = pseg.bands[0] * pseg.rms * SYNTH_GAINS.noise;
    const midAmp = pseg.bands[1] * pseg.rms * SYNTH_GAINS.noise;
    const highAmp = pseg.bands[2] * pseg.rms * SYNTH_GAINS.noise;
    let lpLow = 0;
    let lpMid = 0;
    let lpHigh = 0;
    // the onset bursts of this second (the percussive attacks)
    const onsetsHere = percussive.onsetsSeconds.filter((t) => t >= second && t < second + 1);
    const attack = Math.max(1, Math.round((BURST_ATTACK_MS / 1000) * sampleRate));
    const decay = Math.max(1, Math.round((BURST_DECAY_MS / 1000) * sampleRate));
    const burstLength = attack + decay;
    for (let i = 0; i < sampleRate; i++) {
      const t = i / sampleRate;
      const envelope = shape[Math.min(chunksPerSecond - 1, Math.floor((i / sampleRate) * chunksPerSecond))];
      let sample = 0;
      for (const partial of partials)
        sample += partial.amp * envelope * Math.sin(2 * Math.PI * partial.hz * t + partial.phase);
      const white = rng() * 2 - 1;
      lpLow += 0.02 * (white - lpLow);
      lpMid += 0.12 * (white - lpMid);
      lpHigh += 0.5 * (white - lpHigh);
      sample += (lpLow * lowAmp + (lpMid - lpLow) * midAmp + (white - lpHigh) * highAmp) * envelope;
      for (const onset of onsetsHere) {
        const offset = Math.round((onset - second) * sampleRate);
        const at = i - offset;
        if (at < 0 || at >= burstLength) continue;
        const gain = at < attack ? at / attack : Math.exp(-(at - attack) / decay);
        sample += (rng() * 2 - 1) * pseg.peak * SYNTH_GAINS.burst * gain;
      }
      mono[start + i] = Math.min(1, Math.max(-1, sample));
    }
  }

  // the honest self-measurement: the per-second rms gap against the frames
  const errors: number[] = [];
  for (let second = 0; second < seconds; second++) {
    let sum = 0;
    const start = second * sampleRate;
    for (let i = 0; i < sampleRate; i++) sum += mono[start + i] * mono[start + i];
    errors.push(Math.abs(Math.sqrt(sum / sampleRate) - document.segments[second].rms));
  }
  const fidelity: ReconstructionFidelity = {
    meanRmsError: Number((errors.reduce((a, b) => a + b, 0) / (errors.length || 1)).toFixed(6)),
    worstRmsError: Number(Math.max(...errors, 0).toFixed(6)),
  };

  const bitDepth = options.bitDepth ?? RECONSTRUCT_DEFAULT_DEPTH;
  try {
    const bytes = encodeWav([mono], { sampleRate, bitDepth });
    return {
      ok: true,
      reconstruction: {
        bytes,
        mime: "audio/wav",
        sampleRate,
        durationSeconds: seconds,
        pcmhash: pcmhash(mono),
        fidelity,
      },
    };
  } catch (error) {
    const message = error instanceof WavError ? `${error.code} (${error.message})` : String(error);
    return { ok: false, code: "encode-refused", message: `the wavwriter refused the reconstruction: ${message}` };
  }
}

/* ===== the ingest store lane ===== */

// the ONE writer of the ingest records the katexis library
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
// The node/sqlite half of the store lives in the ingest db lane above
// (better-sqlite3, parameter binding only): the gateway serves the same
// rows both layers write. Pure browser code here — zero node imports. The
// record guard is the db lane's own exported docvalid (the two arms
// carried byte-identical seats — the fold kept the one above, the store's
// twin retired with it).

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

/* ===== the ingest worker lane ===== */

// the server ingest job of the debonair app (root layer,
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
// db lane rides an injected handle (the ingest db seam — the worker stays
// pure of any database import, the same injectable discipline the
// takestore storage and the blobstore fetch seams ride), so the pure lane
// runs store-only. every call answers a typed result with a machine code,
// never a throw; the same bytes answer the same document and the same
// digests (the seeded law — the pointer ids ride the time mint, the
// sha256 is the content identity). zero consumer data. The display-name
// law is the payload lane's own displayname seat above (the two arms
// carried the same fold-one-extension rule — the fold kept the one seat,
// the worker's twin and its fallback constant retired with it).

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

/** The ingest db handle — the seam the gateway wires to the real
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
  /** The ingest db handle, or null when the lane runs store-only. */
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

/* ===== the ingest recon lane ===== */

// the recon descriptor lane of the katexis engine (root
// layer, wave 16a): the measurement half of the debonair.recon/3 contract
// (reconpayload.ts owns the law, this file fills the seats). The lane wraps
// the existing ingest pipeline — one hpss separation, the ingest document
// (debonair.ingest/1, untouched — the recon never removes a fact from it),
// the per-second segment vectors — and adds the descriptors the recon
// frames seat: the 13-coefficient MFCC (dct-ii over the mel bands, imported
// from the timbre library — never re-implemented), the 32-window rms
// envelope statistics, the top-5 spectral peaks, the YIN fundamental notes
// (window 80 ms, hop 40 ms, the tonal layers only — the hpss harmonic stem
// is the layer detection the engine already owns), the per-second flux, the
// per-second krumhansl root with the 48-scale fit, and the per-second bpm
// (the sliding tempo curve of the rhythm library). One 4096-point FFT per
// signal per second is computed and shared by every spectral seat (mfcc,
// peaks, rolloff, slope, warmth, brightness, flux); the segment seats ride
// the ingest document the lane reuses, and the tempo lane rides the rhythm
// module's own onset stft (imported, not duplicated). Everything is pure
// math over the pcm — the same bytes always answer the same document, and
// the canonical serializer then answers the same json bytes (docs/recon.spec.md
// §9). Non-goals: no storage, no scheduling, no synthesis — the ladder's
// lower rungs own theirs. Pure and multi-mode — the browser and node agree.

// ---------------------------------------------------------------------------
// the descriptor constants (the window laws the frames ride)
// ---------------------------------------------------------------------------

/** The mel coefficient count the mfcc seats carry (the dct-ii front end of
 * the timbre library answers 13 by default — one number, one law). */
export const RECON_MFCC_COEFFICIENTS = 13;

/** The rms window count of the envelope seat — thirty-two windows per
 * second, seated as their statistics (mean, std, min, max, spread). */
export const RECON_ENVELOPE_WINDOWS = 32;

/** The spectral peak count the peak seats carry (the top five). */
export const RECON_SPECTRAL_PEAKS = 5;

/** The noise-floor guard of the peak lane: a candidate must clear this
 * fraction of the strongest bin (−60 db) — numerical leakage never seats a
 * partial, a pure sine answers its fundamental and four empty seats. */
export const RECON_PEAK_FLOOR = 1e-3;

/** The YIN analysis window, in ms (the f0 tracker's ear). */
export const RECON_YIN_WINDOW_MS = 80;

/** The YIN hop, in ms (half the window — the classic overlap). */
export const RECON_YIN_HOP_MS = 40;

/** The YIN absolute threshold on the cumulative mean normalized difference
 * (the de Cheveigné & Kawahara default — a dip under 0.1 is a period). */
export const RECON_YIN_THRESHOLD = 0.1;

/** The lowest fundamental the YIN lane trusts, hz (the bass register floor). */
export const RECON_YIN_MIN_HZ = 50;

/** The highest fundamental the YIN lane trusts, hz (above this a monophonic
 * voice is unlikely and the timbre seats tell the story instead). */
export const RECON_YIN_MAX_HZ = 1600;

/** The sliding tempo window of the per-second bpm seat, in ms (the shortest
 * honest window the tempo curve accepts — it must hold a pulse). */
export const RECON_BPM_WINDOW_MS = 2000;

/** The midi breakpoint under which the register law seats the bass family. */
export const RECON_BASS_MIDI_MAX = 48;

/** The midi breakpoint under which the register law seats the guitar family. */
export const RECON_GUITAR_MIDI_MAX = 72;

/** The layer dictionary seats of the two hpss stems (0 harmonic, 1 percussive). */
const HARMONIC_LAYER_ID = RECON_LAYERS.indexOf("harmonic");
const PERCUSSIVE_LAYER_ID = RECON_LAYERS.indexOf("percussive");

// ---------------------------------------------------------------------------
// the descriptor kernels (each one answers a frozen seat family)
// ---------------------------------------------------------------------------

/**
 * The 32-window rms envelope of one second, as its statistics — the frame's
 * envelope seats. The window law: size = hop = floor(sampleRate / 32), so
 * exactly thirty-two rectangular windows cover the second (the envelope
 * kernel of the timbre library — imported, never re-implemented).
 *
 * @param second the pcm of one second (sampleRate samples).
 * @param sampleRate the analysis rate.
 * @returns the five envelope statistics (mean, std, min, max, dynamic).
 */
export function reconEnvelope32(
  second: Float32Array,
  sampleRate: number,
): { mean: number; std: number; min: number; max: number; dynamic: number } {
  const window = Math.max(1, Math.floor(sampleRate / RECON_ENVELOPE_WINDOWS));
  const envelope = rmsEnvelope(second, { size: window, hop: window });
  if (envelope.length === 0) return { mean: 0, std: 0, min: 0, max: 0, dynamic: 0 };
  let sum = 0;
  let min = Infinity;
  let max = 0;
  for (const value of envelope) {
    sum += value;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const mean = sum / envelope.length;
  let squared = 0;
  for (const value of envelope) squared += (value - mean) * (value - mean);
  return { mean, std: Math.sqrt(squared / envelope.length), min, max, dynamic: max - min };
}

/**
 * The top-5 spectral peaks of one magnitude spectrum, interleaved
 * [hz0, mag0, hz1, mag1, …] — the frame's peak seats and the layer peak
 * stream. The peak law: a bin qualifies when it is a local maximum (it
 * holds its left neighbour and beats its right) and clears the noise-floor
 * guard (a thousandth of the strongest bin — numerical leakage never seats
 * a partial), candidates rank by magnitude (ties keep the lower bin),
 * magnitudes normalize by the frame's strongest bin, and absent peaks seat
 * zero — a pure sine answers its fundamental and four empty seats, honestly.
 *
 * @param magnitudes the shared magnitude spectrum of the second.
 * @param binHz the frequency per bin.
 * @returns ten numbers: five hz/mag pairs, strongest first.
 */
export function reconSpectralPeaks(magnitudes: readonly number[], binHz: number): number[] {
  const candidates: { bin: number; magnitude: number }[] = [];
  for (let bin = 1; bin < magnitudes.length - 1; bin++) {
    const magnitude = magnitudes[bin];
    if (magnitude <= 0) continue;
    if (magnitude >= magnitudes[bin - 1] && magnitude > magnitudes[bin + 1]) {
      candidates.push({ bin, magnitude });
    }
  }
  const strongest = candidates.reduce((max, candidate) => Math.max(max, candidate.magnitude), 0);
  const seated =
    strongest > 0 ? candidates.filter((candidate) => candidate.magnitude >= strongest * RECON_PEAK_FLOOR) : [];
  seated.sort((a, b) => b.magnitude - a.magnitude || a.bin - b.bin);
  const out = new Array<number>(RECON_SPECTRAL_PEAKS * 2).fill(0);
  for (let seat = 0; seat < RECON_SPECTRAL_PEAKS; seat++) {
    const candidate = seated[seat];
    if (candidate === undefined) break;
    out[seat * 2] = candidate.bin * binHz;
    out[seat * 2 + 1] = strongest > 0 ? candidate.magnitude / strongest : 0;
  }
  return out;
}

/**
 * The YIN fundamental notes of one pcm slice — the midi note lane of the
 * tonal layers. The algorithm is the classic de Cheveigné & Kawahara YIN:
 * the squared difference function per lag (computed lazily — the cumsum
 * walks from lag 1 and the search stops at the first dip under the
 * threshold, so high voices pay little), the cumulative mean normalized
 * difference, the absolute threshold 0.1 with the descent to the local
 * minimum, parabolic interpolation on the normalized difference, and the
 * silence gate. Consecutive frames within half a semitone merge into one
 * note (the first onset, the loudest velocity); the answer is the flat
 * triple list [midi, onset, vel, …] with the onset seated 0..1 in the slice.
 *
 * @param pcm the tonal layer's pcm.
 * @param sampleRate the analysis rate.
 * @param from the first sample of the slice.
 * @param to the end of the slice (exclusive).
 * @returns the note triples, time-ascending.
 */
export function reconYinNotes(pcm: Float32Array, sampleRate: number, from: number, to: number): number[] {
  const window = Math.max(2, Math.round((RECON_YIN_WINDOW_MS / 1000) * sampleRate));
  const hop = Math.max(1, Math.round((RECON_YIN_HOP_MS / 1000) * sampleRate));
  const minLag = Math.max(1, Math.ceil(sampleRate / RECON_YIN_MAX_HZ));
  const maxLag = Math.min(window - 2, Math.floor(sampleRate / RECON_YIN_MIN_HZ));
  const span = Math.max(0, to - from);
  if (maxLag <= minLag || span < window) return [];
  const notes: number[] = [];
  let openMidi = -1;
  let openOnset = 0;
  let openVel = 0;
  const closeOpen = () => {
    if (openMidi >= 0) notes.push(openMidi, openOnset, openVel);
    openMidi = -1;
  };
  for (let start = from; start + window <= to; start += hop) {
    // the silence gate — a quiet frame carries no honest fundamental
    let energy = 0;
    for (let i = 0; i < window; i++) energy += pcm[start + i] * pcm[start + i];
    const frameRms = Math.sqrt(energy / window);
    if (frameRms <= SILENCE_RMS) {
      closeOpen();
      continue;
    }
    // the cumulative mean normalized difference, computed lazily: the cumsum
    // walks from lag 1 (the honest denominator) and stops at the first dip
    // under the threshold — the descent may extend it one lag at a time
    const raw = new Float64Array(maxLag + 1);
    const normalizedTable = new Float64Array(maxLag + 1);
    let computed = 0;
    let cumulative = 0;
    const ensure = (lag: number): number => {
      while (computed < lag) {
        computed++;
        let sum = 0;
        for (let i = 0; i < window - computed; i++) {
          const delta = pcm[start + i] - pcm[start + i + computed];
          sum += delta * delta;
        }
        raw[computed] = sum;
        cumulative += sum;
        normalizedTable[computed] = cumulative > 1e-30 ? (sum * computed) / cumulative : 0;
      }
      return normalizedTable[lag];
    };
    let tauStar = -1;
    for (let lag = minLag; lag <= maxLag; lag++) {
      if (ensure(lag) < RECON_YIN_THRESHOLD) {
        tauStar = lag;
        break;
      }
    }
    let period = -1;
    if (tauStar >= 0) {
      // descend to the local minimum under the threshold
      period = tauStar;
      while (period + 1 <= maxLag && ensure(period + 1) < normalizedTable[period]) period++;
    } else {
      // nothing under the strict threshold — the global dip serves when it
      // is still a strong period (the honest tolerance of the lane)
      ensure(maxLag);
      let best = minLag;
      let bestValue = normalizedTable[minLag];
      for (let lag = minLag + 1; lag <= maxLag; lag++) {
        if (normalizedTable[lag] < bestValue) {
          bestValue = normalizedTable[lag];
          best = lag;
        }
      }
      if (bestValue < RECON_YIN_THRESHOLD * 5) period = best;
    }
    if (period < minLag) {
      closeOpen();
      continue;
    }
    // the parabolic interpolation on the normalized difference
    const left = period > 1 ? normalizedTable[period - 1] : 1;
    const right = period < maxLag ? ensure(period + 1) : normalizedTable[period];
    const denominator = left - 2 * normalizedTable[period] + right;
    const shift = denominator < 0 ? Math.max(-0.5, Math.min(0.5, (0.5 * (left - right)) / denominator)) : 0;
    const hz = sampleRate / (period + shift);
    if (hz < RECON_YIN_MIN_HZ || hz > RECON_YIN_MAX_HZ) {
      closeOpen();
      continue;
    }
    const midi = 69 + 12 * Math.log2(hz / 440);
    const onset = span > 0 ? (start - from) / span : 0;
    const vel = Math.min(1, frameRms);
    if (openMidi >= 0 && Math.abs(midi - openMidi) < 0.5) {
      openVel = Math.max(openVel, vel);
    } else {
      closeOpen();
      openMidi = midi;
      openOnset = onset;
      openVel = vel;
    }
  }
  closeOpen();
  return notes;
}

/**
 * The best 48-scale fit at one root — the frame's scaleType seat. The fit
 * law: every scale of the pattern vocabulary scores its captured-minus-
 * leaked chroma energy (the degrees inside the scale minus the degrees
 * outside it, at the rotation the root seats); the highest score wins and
 * ties keep the lowest id (the library carries honest aliases — maj7
 * mirrors major — and the lowest id is the canonical spelling).
 *
 * @param chroma the twelve-bin chroma of the second.
 * @param root the krumhansl root the scale rotates on.
 * @returns the scale id 0..47.
 */
export function reconScaleFit(chroma: readonly number[], root: number): number {
  let bestId = 0;
  let bestScore = -Infinity;
  for (const [id, name] of PATTERN_SCALE_NAMES.entries()) {
    const intervals = PATTERN_SCALES[name];
    let inside = 0;
    for (const degree of intervals) inside += chroma[(root + degree) % 12] ?? 0;
    const outside = chroma.reduce((sum, value) => sum + value, 0) - inside;
    const score = inside - outside;
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }
  return bestId;
}

/**
 * The per-second tempo series — the frame's bpm seat. The tempo law: the
 * rhythm library's onset envelope (its own 1024-point stft — the rhythm
 * lane's kernel, imported) feeds the sliding bpmOverTime curve (a 2-second
 * window advanced half a window); every second seats the bpm of the window
 * whose center sits nearest, zero when no window held a pulse. Never one
 * global value — the header's median and mean ride this series.
 *
 * @param pcm the mix pcm.
 * @param sampleRate the analysis rate.
 * @param seconds the whole seconds the frames cover.
 * @returns one bpm per second.
 */
export function reconBpmPerSecond(pcm: Float32Array, sampleRate: number, seconds: number): number[] {
  const out = new Array<number>(seconds).fill(0);
  if (pcm.length < 1024 || seconds <= 0) return out;
  let envelope: Float32Array;
  let frameMs = 0;
  try {
    const lane = onsetEnvelope(pcm, sampleRate);
    envelope = lane.envelope;
    frameMs = lane.frameMs;
  } catch {
    return out;
  }
  const points = bpmOverTime(envelope, frameMs, RECON_BPM_WINDOW_MS);
  if (points.length === 0) return out;
  for (let s = 0; s < seconds; s++) {
    const center = (s + 0.5) * 1000;
    let nearest = points[0];
    let nearestDistance = Math.abs(points[0].tMs - center);
    for (const point of points) {
      const distance = Math.abs(point.tMs - center);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = point;
      }
    }
    out[s] = nearest.bpm;
  }
  return out;
}

// ---------------------------------------------------------------------------
// the conversion lane (ingest/1 → recon/3, the converter contract)
// ---------------------------------------------------------------------------

/** The text-seat overrides and the take identity the converter accepts. */
export interface ReconOptions {
  /** The display name (reconOf requires it; reconFromIngest defaults to the ingest document's). */
  name?: string;
  /** The iso instant the wrapped ingest document stamps (reconOf only). */
  at?: string;
  /** The meter seat — a dictionary value, default "4/4". */
  timeSignature?: string;
  /** The encoding seat — a dictionary value, default "pcm16". */
  encoding?: string;
  /** The mime seat — a dictionary value, default "audio/wav". */
  mimeType?: string;
  /** The instrument seat — a dictionary value, default "mix". */
  instrumentName?: string;
  /** The family seat — a dictionary value; the default answers the register law. */
  instrumentFamily?: string;
}

/** The block rms of a pcm slice — the envelope kernel's one-window reading
 * (size = hop = the whole slice), the dominance measure the register law rides. */
function blockRms(pcm: Float32Array): number {
  if (pcm.length < 1) return 0;
  const envelope = rmsEnvelope(pcm, { size: pcm.length, hop: pcm.length });
  return envelope[0] ?? 0;
}

/** The mean of a series (0 when empty). */
function meanOf(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** The median of a series (0 when empty; the mean of the two middles when even). */
function medianOf(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** The population standard deviation of a series (0 when empty). */
function stdOf(values: readonly number[]): number {
  if (values.length < 2) return 0;
  const mean = meanOf(values);
  return Math.sqrt(meanOf(values.map((value) => (value - mean) * (value - mean))));
}

/** The statistical mode of a series of small ids, ties keeping the lowest id. */
function modeIdOf(values: readonly number[]): number {
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  let bestId = 0;
  let bestCount = 0;
  for (const id of [...counts.keys()].sort((a, b) => a - b)) {
    const count = counts.get(id) ?? 0;
    if (count > bestCount) {
      bestCount = count;
      bestId = id;
    }
  }
  return bestId;
}

/** Rounds to four decimals (the canonical number law of the serializer). */
function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}

/** The first FFT_SIZE samples of a second as a plain array (the shared
 * first-window law the ingest segments ride — zero-padded when short). */
function secondWindow(second: Float32Array): number[] {
  const window = new Array<number>(FFT_SIZE).fill(0);
  for (let i = 0; i < FFT_SIZE && i < second.length; i++) window[i] = second[i];
  return window;
}

/**
 * Builds the recon document over a decomposition the caller owns — the one
 * constructor the reconOf and reconFromIngest lanes share. The pcm must sit
 * at the canon rate (the resample happens before this door); the segment
 * seats map the ingest lane's per-second vectors (at the canon rate they
 * are the decomposition's own numbers — zero recompute), the descriptor
 * seats ride one shared FFT per signal per second, and the header answers
 * the aggregates, the modes and the identity hashes.
 *
 * @param name the display name of the take.
 * @param mono the mix pcm at RECON_SAMPLE_RATE.
 * @param harmonic the harmonic stem pcm at RECON_SAMPLE_RATE.
 * @param percussive the percussive stem pcm at RECON_SAMPLE_RATE.
 * @param segments the per-second segment vectors at RECON_SAMPLE_RATE.
 * @param options the text-seat overrides.
 * @returns the debonair.recon/3 document.
 */
function buildRecon(
  name: string,
  mono: Float32Array,
  harmonic: Float32Array,
  percussive: Float32Array,
  segments: readonly IngestSegment[],
  options: ReconOptions,
): ReconDocument {
  const sampleRate = RECON_SAMPLE_RATE;
  const seconds = segments.length;
  const bpmSeries = reconBpmPerSecond(mono, sampleRate, seconds);
  const frames: ReconFrame[] = [];
  const mixSpectra: Float32Array[] = [];
  const rawFlux: number[] = [];
  for (let s = 0; s < seconds; s++) {
    const segment = segments[s];
    const start = s * sampleRate;
    const second = mono.subarray(start, start + sampleRate);
    // the one shared fft of the second — every spectral seat reads it (the
    // mfcc, the peaks, the timbre indices, the flux)
    const spectrum = frameSpectrum(secondWindow(second), sampleRate);
    const magnitudes = Float32Array.from(spectrum.magnitudes);
    mixSpectra.push(magnitudes);
    rawFlux.push(s === 0 ? 0 : spectralFlux(magnitudes, mixSpectra[s - 1]));
    // the mfcc seats: the dct-ii front end of the timbre library over the
    // shared spectrum — computed once per second, shared by the seats
    const coefficients = mfcc(spectrum.magnitudes, sampleRate, { coefficients: RECON_MFCC_COEFFICIENTS });
    const [mc0, mc1, mc2, mc3, mc4, mc5, mc6, mc7, mc8, mc9, mc10, mc11, mc12] = [...coefficients];
    // the mix peak seats: the top-5 of the shared spectrum
    const [h0, m0, h1, m1, h2, m2, h3, m3, h4, m4] = reconSpectralPeaks(spectrum.magnitudes, spectrum.binHz);
    // the envelope seats: the 32-window statistics of the second
    const envelope = reconEnvelope32(second, sampleRate);
    // the chroma seats: the segment's wheel normalized to unit sum (the
    // clamp law seats proportions, the rms seat keeps the level)
    const chromaSum = segment.chroma.reduce((sum, value) => sum + value, 0);
    const wheel = segment.chroma.map((value) => (chromaSum > 0 ? value / chromaSum : 0));
    const scaleRoot = keyOf(segment.chroma).tonic;
    // the layer lane: the per-track exception (peaks per layer, the yin
    // notes on the tonal harmonic stem only)
    const harmonicSecond = harmonic.subarray(start, start + sampleRate);
    const percussiveSecond = percussive.subarray(start, start + sampleRate);
    const harmonicSpectrum = frameSpectrum(secondWindow(harmonicSecond), sampleRate);
    const percussiveSpectrum = frameSpectrum(secondWindow(percussiveSecond), sampleRate);
    const notes = reconYinNotes(harmonic, sampleRate, start, start + sampleRate);
    const layers: ReconLayerFrame[] = [
      {
        layerId: HARMONIC_LAYER_ID,
        spectralPeaks: reconSpectralPeaks(harmonicSpectrum.magnitudes, harmonicSpectrum.binHz).map(round4),
        midiNotes: notes.map(round4),
      },
      {
        layerId: PERCUSSIVE_LAYER_ID,
        spectralPeaks: reconSpectralPeaks(percussiveSpectrum.magnitudes, percussiveSpectrum.binHz).map(round4),
        midiNotes: [],
      },
    ];
    // the note statistics over the tonal notes of the second
    const midiValues: number[] = [];
    for (let triple = 0; triple < notes.length; triple += 3) midiValues.push(notes[triple]);
    const frame: ReconFrame = {
      s,
      active: segment.rms > SILENCE_RMS ? 1 : 0,
      rms: segment.rms,
      peak: segment.peak,
      zcr: segment.zcr,
      centroid: segment.cent,
      flatness: segment.flat,
      flux: 0,
      rolloff: round4(rolloffSharpness(spectrum.magnitudes)),
      slope: round4(spectralSlope(spectrum.magnitudes, sampleRate)),
      warmth: round4(warmthIndex(spectrum.magnitudes, sampleRate)),
      brightness: round4(brightness(spectrum.magnitudes, sampleRate)),
      beatStrength: segment.beat,
      onsetCount: segment.onsets,
      bandLow: segment.bands[0] ?? 0,
      bandMid: segment.bands[1] ?? 0,
      bandHigh: segment.bands[2] ?? 0,
      chroma0: round4(wheel[0] ?? 0),
      chroma1: round4(wheel[1] ?? 0),
      chroma2: round4(wheel[2] ?? 0),
      chroma3: round4(wheel[3] ?? 0),
      chroma4: round4(wheel[4] ?? 0),
      chroma5: round4(wheel[5] ?? 0),
      chroma6: round4(wheel[6] ?? 0),
      chroma7: round4(wheel[7] ?? 0),
      chroma8: round4(wheel[8] ?? 0),
      chroma9: round4(wheel[9] ?? 0),
      chroma10: round4(wheel[10] ?? 0),
      chroma11: round4(wheel[11] ?? 0),
      mfcc0: round4(mc0),
      mfcc1: round4(mc1),
      mfcc2: round4(mc2),
      mfcc3: round4(mc3),
      mfcc4: round4(mc4),
      mfcc5: round4(mc5),
      mfcc6: round4(mc6),
      mfcc7: round4(mc7),
      mfcc8: round4(mc8),
      mfcc9: round4(mc9),
      mfcc10: round4(mc10),
      mfcc11: round4(mc11),
      mfcc12: round4(mc12),
      envelopeMean: round4(envelope.mean),
      envelopeStd: round4(envelope.std),
      envelopeMin: round4(envelope.min),
      envelopeMax: round4(envelope.max),
      envelopeDynamic: round4(envelope.dynamic),
      bpm: round4(bpmSeries[s] ?? 0),
      scaleRoot,
      scaleType: reconScaleFit(segment.chroma, scaleRoot),
      pcmhash: pcmhash(second),
      spectralPeaksHash: fnv1aNumbers([
        layers[0].layerId,
        ...layers[0].spectralPeaks,
        layers[1].layerId,
        ...layers[1].spectralPeaks,
      ]),
      midiNotesHash: fnv1aNumbers([layers[0].layerId, ...layers[0].midiNotes]),
      peakHz0: round4(h0),
      peakHz1: round4(h1),
      peakHz2: round4(h2),
      peakHz3: round4(h3),
      peakHz4: round4(h4),
      peakMag0: round4(m0),
      peakMag1: round4(m1),
      peakMag2: round4(m2),
      peakMag3: round4(m3),
      peakMag4: round4(m4),
      noteCount: midiValues.length,
      noteMidiMean: midiValues.length > 0 ? round4(meanOf(midiValues)) : 0,
      noteMidiRange: midiValues.length > 1 ? round4(Math.max(...midiValues) - Math.min(...midiValues)) : 0,
      layers,
    };
    frames.push(frame);
  }
  // the flux normalization: the series folds to 0..1 by its own maximum
  const fluxMax = Math.max(...rawFlux, 0);
  for (const frame of frames) frame.flux = round4(fluxMax > 0 ? (rawFlux[frame.s] ?? 0) / fluxMax : 0);
  const header = headerOf(name, mono, harmonic, percussive, frames, options);
  return { header, frames, correlations: correlationsOf(frames) };
}

/**
 * The header of the recon document — the manifest seats, the time
 * aggregates (the mean over the frames of every shared seat), the opening
 * tonality, the statistical modes, the median tempo and the identity hashes.
 *
 * @param name the display name.
 * @param mono the mix pcm at the canon rate.
 * @param harmonic the harmonic stem pcm.
 * @param percussive the percussive stem pcm.
 * @param frames the per-second frames.
 * @param options the text-seat overrides.
 * @returns the 76-seat header.
 */
function headerOf(
  name: string,
  mono: Float32Array,
  harmonic: Float32Array,
  percussive: Float32Array,
  frames: readonly ReconFrame[],
  options: ReconOptions,
): ReconHeader {
  const active = frames.filter((frame) => frame.active > 0);
  const opening = active[0];
  const aggregate = (seat: keyof ReconFrame): number =>
    frames.length > 0 ? round4(meanOf(frames.map((frame) => frame[seat] as number))) : 0;
  const family = options.instrumentFamily ?? reconFamilyOf(frames, blockRms(harmonic), blockRms(percussive));
  return {
    schema: RECON_SCHEMA_VERSION,
    name,
    mimeType: options.mimeType ?? "audio/wav",
    encoding: options.encoding ?? "pcm16",
    timeSignature: options.timeSignature ?? "4/4",
    instrumentName: options.instrumentName ?? "mix",
    instrumentFamily: family,
    sampleRate: RECON_SAMPLE_RATE,
    durationSeconds: round4(mono.length / RECON_SAMPLE_RATE),
    bpmMedian: round4(medianOf(frames.map((frame) => frame.bpm))),
    mostUsedScaleId: modeIdOf(active.map((frame) => frame.scaleType)),
    mostUsedKeyId: modeIdOf(active.map((frame) => frame.scaleRoot)),
    rms: aggregate("rms"),
    peak: aggregate("peak"),
    zcr: aggregate("zcr"),
    centroid: aggregate("centroid"),
    flatness: aggregate("flatness"),
    flux: aggregate("flux"),
    rolloff: aggregate("rolloff"),
    slope: aggregate("slope"),
    warmth: aggregate("warmth"),
    brightness: aggregate("brightness"),
    beatStrength: aggregate("beatStrength"),
    onsetCount: aggregate("onsetCount"),
    bandLow: aggregate("bandLow"),
    bandMid: aggregate("bandMid"),
    bandHigh: aggregate("bandHigh"),
    chroma0: aggregate("chroma0"),
    chroma1: aggregate("chroma1"),
    chroma2: aggregate("chroma2"),
    chroma3: aggregate("chroma3"),
    chroma4: aggregate("chroma4"),
    chroma5: aggregate("chroma5"),
    chroma6: aggregate("chroma6"),
    chroma7: aggregate("chroma7"),
    chroma8: aggregate("chroma8"),
    chroma9: aggregate("chroma9"),
    chroma10: aggregate("chroma10"),
    chroma11: aggregate("chroma11"),
    mfcc0: aggregate("mfcc0"),
    mfcc1: aggregate("mfcc1"),
    mfcc2: aggregate("mfcc2"),
    mfcc3: aggregate("mfcc3"),
    mfcc4: aggregate("mfcc4"),
    mfcc5: aggregate("mfcc5"),
    mfcc6: aggregate("mfcc6"),
    mfcc7: aggregate("mfcc7"),
    mfcc8: aggregate("mfcc8"),
    mfcc9: aggregate("mfcc9"),
    mfcc10: aggregate("mfcc10"),
    mfcc11: aggregate("mfcc11"),
    mfcc12: aggregate("mfcc12"),
    envelopeMean: aggregate("envelopeMean"),
    envelopeStd: aggregate("envelopeStd"),
    envelopeMin: aggregate("envelopeMin"),
    envelopeMax: aggregate("envelopeMax"),
    envelopeDynamic: aggregate("envelopeDynamic"),
    bpm: aggregate("bpm"),
    scaleRoot: opening?.scaleRoot ?? 0,
    scaleType: opening?.scaleType ?? 0,
    pcmhash: pcmhash(mono),
    spectralPeaksHash: fnv1aNumbers(frames.flatMap((frame) => [frame.s, frame.spectralPeaksHash])),
    midiNotesHash: fnv1aNumbers(frames.flatMap((frame) => [frame.s, frame.midiNotesHash])),
    peakHz0: aggregate("peakHz0"),
    peakHz1: aggregate("peakHz1"),
    peakHz2: aggregate("peakHz2"),
    peakHz3: aggregate("peakHz3"),
    peakHz4: aggregate("peakHz4"),
    peakMag0: aggregate("peakMag0"),
    peakMag1: aggregate("peakMag1"),
    peakMag2: aggregate("peakMag2"),
    peakMag3: aggregate("peakMag3"),
    peakMag4: aggregate("peakMag4"),
    noteCount: aggregate("noteCount"),
    noteMidiMean: aggregate("noteMidiMean"),
    noteMidiRange: aggregate("noteMidiRange"),
  };
}

/**
 * The register law — the family seat. The tonal register decides first: a
 * mean midi under 48 seats bass, under 72 seats guitar, above seats vocal
 * (the monophonic families the note lane serves). Without notes the energy
 * decides: a percussive-dominant take seats percussion, a sustained tonal
 * one seats pad. A decision the engine recomputes from the frames.
 *
 * @param frames the per-second frames (the note seats are all it reads).
 * @param harmonicRms the harmonic stem's block rms.
 * @param percussiveRms the percussive stem's block rms.
 * @returns the family name (a dictionary seat).
 */
export function reconFamilyOf(
  frames: ReadonlyArray<Pick<ReconFrame, "noteCount" | "noteMidiMean">>,
  harmonicRms: number,
  percussiveRms: number,
): string {
  const sung = frames.filter((frame) => frame.noteCount > 0);
  if (sung.length > 0) {
    const register = meanOf(sung.map((frame) => frame.noteMidiMean));
    if (register < RECON_BASS_MIDI_MAX) return "bass";
    if (register < RECON_GUITAR_MIDI_MAX) return "guitar";
    return "vocal";
  }
  return percussiveRms > harmonicRms ? "percussion" : "pad";
}

/**
 * The four named correlations — the whole-track relations the frames'
 * series answer (docs/recon.spec.md §10): the tempo drift, the transition
 * assertion, the distortion trajectory identity and the pitch slope.
 *
 * @param frames the per-second frames.
 * @returns the correlation block.
 */
function correlationsOf(frames: readonly ReconFrame[]): ReconCorrelations {
  const bpms = frames.map((frame) => frame.bpm);
  const bpmMean = meanOf(bpms);
  const tempoFluctuationIndex = bpmMean > 0 ? round4(Math.min(1, stdOf(bpms) / bpmMean)) : 0;
  const fluxes = frames.map((frame) => frame.flux);
  const fluxMax = Math.max(...fluxes, 0);
  const spectralTransitionConfidence = fluxMax > 0 ? round4(Math.min(1, meanOf(fluxes) / fluxMax)) : 0;
  const harmonicDistortionStateHash = fnv1aNumbers(
    frames.flatMap((frame) => [frame.flatness, frame.peak, frame.warmth]),
  );
  const sung = frames.filter((frame) => frame.noteCount > 0);
  let pitchTrajectorySlope = 0;
  if (sung.length >= 2) {
    const meanS = meanOf(sung.map((frame) => frame.s));
    const meanMidi = meanOf(sung.map((frame) => frame.noteMidiMean));
    let numerator = 0;
    let denominator = 0;
    for (const frame of sung) {
      numerator += (frame.s - meanS) * (frame.noteMidiMean - meanMidi);
      denominator += (frame.s - meanS) * (frame.s - meanS);
    }
    pitchTrajectorySlope = denominator > 0 ? round4(numerator / denominator) : 0;
  }
  return { tempoFluctuationIndex, spectralTransitionConfidence, harmonicDistortionStateHash, pitchTrajectorySlope };
}

/** Carries one mono pcm to the canon rate (the identity shortcut answers
 * the same object when the rate already sits at 44100). */
function toCanonRate(mono: Float32Array, sampleRate: number): Float32Array {
  if (sampleRate === RECON_SAMPLE_RATE) return mono;
  return resample({ samples: mono, sampleRate, channels: 1, length: mono.length }, RECON_SAMPLE_RATE).samples;
}

/**
 * Converts an existing decomposition into the recon document — the
 * converter the ingest lane calls when the separation already happened
 * (the worker, the bench): the ingest document names the take, the pcms
 * feed the descriptors, and nothing is removed from the ingest document
 * (the debonair.ingest/1 record stays whole beside the recon/3 canon). A
 * source off the canon rate is resampled to 44100 and the segment vectors
 * recompute at the canon (the ingest document's own numbers stay untouched).
 *
 * @param doc the ingest document (debonair.ingest/1) of the decomposition.
 * @param mono the mix pcm of the document.
 * @param harmonic the harmonic stem pcm.
 * @param percussive the percussive stem pcm.
 * @param options the text-seat overrides.
 * @returns the debonair.recon/3 document.
 */
export function reconFromIngest(
  doc: IngestDocument,
  mono: Float32Array,
  harmonic: Float32Array,
  percussive: Float32Array,
  options: ReconOptions = {},
): ReconDocument {
  const monoCanon = toCanonRate(mono, doc.sampleRate);
  const harmonicCanon = toCanonRate(harmonic, doc.sampleRate);
  const percussiveCanon = toCanonRate(percussive, doc.sampleRate);
  const segments =
    doc.sampleRate === RECON_SAMPLE_RATE
      ? doc.segments
      : segmentsof(monoCanon, RECON_SAMPLE_RATE, onsetSecondsOf(monoCanon, RECON_SAMPLE_RATE));
  return buildRecon(options.name ?? doc.name, monoCanon, harmonicCanon, percussiveCanon, segments, options);
}

/**
 * Decomposes one mono pcm into the recon document — the standalone lane:
 * one hpss separation, the full ingest document (the same bytes the
 * ingestPcm path answers), then the descriptors over the mix and the
 * stems. Deterministic end to end: the same pcm always answers the same
 * document, whatever the source rate (the off-canon sources resample to
 * 44100 first — the cd law of docs/recon.spec.md §8).
 *
 * @param mono the decoded pcm (any sample rate).
 * @param sampleRate the rate of the pcm.
 * @param options the take identity (the name is required) and the seat overrides.
 * @returns the debonair.recon/3 document.
 */
export function reconOf(
  mono: Float32Array,
  sampleRate: number,
  options: ReconOptions & { name: string },
): ReconDocument {
  const monoCanon = toCanonRate(mono, sampleRate);
  const stems: StemPair = separate(monoCanon);
  const { doc } = decompose(monoCanon, stems, RECON_SAMPLE_RATE, { name: options.name, at: options.at });
  return buildRecon(options.name, monoCanon, stems.harmonic, stems.percussive, doc.segments, options);
}

/**
 * The per-track stream view of a recon document — the spectralPeaksStream
 * and the midiNotes the track-only exception seats (docs/recon.spec.md §4):
 * the per-second layer entries of one track concatenated in time order.
 *
 * @param doc the recon document.
 * @param layerId the track (0 harmonic, 1 percussive).
 * @returns the concatenated peak pairs and note triples of the track.
 */
export function trackStreamOf(doc: ReconDocument, layerId: number): { spectralPeaks: number[]; midiNotes: number[] } {
  const spectralPeaks: number[] = [];
  const midiNotes: number[] = [];
  for (const frame of doc.frames) {
    const layer = frame.layers.find((entry) => entry.layerId === layerId);
    if (layer === undefined) continue;
    spectralPeaks.push(...layer.spectralPeaks);
    midiNotes.push(...layer.midiNotes);
  }
  return { spectralPeaks, midiNotes };
}

// ---------------------------------------------------------------------------
// the statistical header audits (the mode and series laws of §4)
// ---------------------------------------------------------------------------

/**
 * The statistical mode of the per-second scaleType seats over the sounding
 * seconds — the audit twin of the header's mostUsedScaleId: recomputing the
 * mode from the frames must answer the seat the header carries (never a
 * pinned global — the V7 ban). The dictionary answers the name twin
 * (reconScaleName) — the payload never carries both sides of one fact.
 *
 * @param frames the per-second frames (the active seats decide the sounding seconds).
 * @returns the prevailing scale id 0..47 (ties keep the lowest id).
 */
export function reconScaleModeOf(frames: ReadonlyArray<Pick<ReconFrame, "active" | "scaleType">>): number {
  return modeIdOf(frames.filter((frame) => frame.active > 0).map((frame) => frame.scaleType));
}

/**
 * The statistical mode of the per-second scaleRoot seats over the sounding
 * seconds — the audit twin of the header's mostUsedKeyId (the same mode
 * law, the dictionary answering the name twin through reconRootName).
 *
 * @param frames the per-second frames (the active seats decide the sounding seconds).
 * @returns the prevailing root id 0..11 (ties keep the lowest id).
 */
export function reconRootModeOf(frames: ReadonlyArray<Pick<ReconFrame, "active" | "scaleRoot">>): number {
  return modeIdOf(frames.filter((frame) => frame.active > 0).map((frame) => frame.scaleRoot));
}

/**
 * The per-second bpm series of a recon document — the tempo law's own view:
 * one bpm per second (the sliding-window estimates the frames seat), never
 * one global value; the header's bpmMedian and bpm seats are this series'
 * median and mean, the two honest summaries beside the series itself.
 *
 * @param doc the recon document.
 * @returns one bpm per second, the frames' own order.
 */
export function reconBpmSeriesOf(doc: ReconDocument): number[] {
  return doc.frames.map((frame) => frame.bpm);
}
