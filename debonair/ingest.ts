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

import type { AudioReport } from "./analyze.ts";
import { analyze } from "./analyze.ts";
import { type StemPair, separate } from "./hpss.ts";
import { chromaOf, FFT_SIZE, fftInPlace, HANN_TABLE } from "./spectrum.ts";

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
