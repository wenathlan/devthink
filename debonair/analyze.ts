// # analyze — the audio analysis pipeline of the katexis engine (root layer):
// the canonical decode→features→rhythm→key→loudness→structure chain the
// engine corpus documents (docs 01/07/09/12/14/15/26). The decoder stays in
// the host (saddle runs the binaries; the browser passes decoded pcm) — the
// engine takes mono float samples and answers the report.schema v1. Pure
// math, deterministic, zero rng.

import { fingerprintOf } from "./fingerprint.ts";
import { gatingBlocks, integratedLoudness, kWeightChannel } from "./loudness.ts";
import { chromaOf, FFT_SIZE, frameSpectrum, HOP_SIZE, keyOf } from "./spectrum.ts";

/** The bpm search floor of the autocorrelation tempo scan. */
export const BPM_FLOOR = 60;
/** The bpm search ceiling of the autocorrelation tempo scan. */
export const BPM_CEIL = 190;
/** The minimum RMS a frame must clear to count as sounding (structure). */
export const SILENCE_RMS = 1e-4;

/** The seven-band energy ladder the corpus prescribes (hz edges). */
export const BAND_LADDER: readonly number[] = [30, 60, 120, 500, 2000, 4000, 8000, 16000];
/** The band labels the report carries, low → high. */
export const BAND_LABELS: readonly string[] = ["sub", "bass", "low-mid", "mid", "high-mid", "presence", "brilliance"];

/** The analysis report the pipeline answers (schema v1). */
export interface AudioReport {
  /** The sample rate of the analyzed pcm. */
  sampleRate: number;
  /** The duration in seconds. */
  durationSeconds: number;
  /** The rhythm block. */
  rhythm: {
    /** The dominant bpm (autocorrelation of the onset envelope). */
    bpm: number;
    /** The onset envelope strength (0..1-ish, relative). */
    onsetStrength: number;
  };
  /** The tonality block. */
  key: {
    /** The tonic pitch class id, 0 = C. */
    tonic: number;
    /** The pitch class name. */
    tonicName: string;
    /** The mode. */
    mode: "major" | "minor";
  };
  /** The loudness block (ebu r128 over the mono signal). */
  loudness: {
    /** The integrated loudness, LUFS. */
    integrated: number;
  };
  /** The spectral block. */
  spectrum: {
    /** The mean energy per band, BAND_LABELS order. */
    bands: readonly number[];
    /** The mean spectral centroid, hz. */
    centroidHz: number;
  };
  /** The structure block: contiguous sounding sections. */
  structure: readonly StructureSection[];
  /** The fingerprint hash count (identity, the db rides elsewhere). */
  fingerprintHashes: number;
}

/** One structure section the report carries. */
export interface StructureSection {
  /** The section label by energy rank (intro/verse/chorus…). */
  label: string;
  /** The start second. */
  start: number;
  /** The end second. */
  end: number;
  /** The mean rms of the section, relative to the loudest. */
  energy: number;
}

/** The pitch class names, indexed by pc id. */
const PC_NAMES: readonly string[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
/** The structure labels by descending energy rank. */
const STRUCTURE_LABELS: readonly string[] = ["chorus", "verse", "bridge", "intro", "outro"];

/**
 * Computes the frame feature rows the whole report rides: rms, spectral
 * flux, centroid and chroma per stft frame.
 *
 * @param mono the mono samples.
 * @param samplerate the sample rate.
 * @returns the per-frame features.
 */
function frameFeatures(mono: readonly number[], samplerate: number) {
  const frameCount = Math.max(1, Math.floor((mono.length - FFT_SIZE) / HOP_SIZE) + 1);
  const rms: number[] = [];
  const flux: number[] = [];
  const centroid: number[] = [];
  const chroma: number[] = new Array(12).fill(0);
  const window = new Array<number>(FFT_SIZE).fill(0);
  let previous = new Array<number>(FFT_SIZE / 2 + 1).fill(0);
  for (let f = 0; f < frameCount; f++) {
    const start = f * HOP_SIZE;
    let energy = 0;
    for (let i = 0; i < FFT_SIZE; i++) {
      const v = mono[start + i] ?? 0;
      window[i] = v;
      energy += v * v;
    }
    rms.push(Math.sqrt(energy / FFT_SIZE));
    const frame = frameSpectrum(window);
    let magSum = 0;
    let weighted = 0;
    let fluxSum = 0;
    for (let b = 0; b < frame.magnitudes.length; b++) {
      const mag = frame.magnitudes[b];
      const d = mag - previous[b];
      if (d > 0) fluxSum += d;
      magSum += mag;
      weighted += mag * b * frame.binHz;
    }
    flux.push(fluxSum);
    centroid.push(magSum > 0 ? weighted / magSum : 0);
    const chromaFrame = chromaOf(frame.magnitudes, frame.binHz);
    for (let pc = 0; pc < 12; pc++) chroma[pc] += chromaFrame[pc];
    previous = frame.magnitudes.slice();
  }
  void samplerate;
  return { rms, flux, centroid, chroma };
}

/**
 * Scans the onset envelope autocorrelation over the documented bpm window
 * and answers the dominant tempo.
 *
 * @param flux the spectral-flux onset envelope.
 * @param samplerate the sample rate.
 * @returns the dominant bpm and the normalized onset strength.
 */
function tempoOf(flux: readonly number[], samplerate: number): { bpm: number; strength: number } {
  const mean = flux.reduce((s, v) => s + v, 0) / Math.max(1, flux.length);
  const centered = flux.map((v) => v - mean);
  const framesPerSecond = samplerate / HOP_SIZE;
  const minLag = Math.max(1, Math.floor((60 / BPM_CEIL) * framesPerSecond));
  const maxLag = Math.min(centered.length - 1, Math.ceil((60 / BPM_FLOOR) * framesPerSecond));
  // the tempo law: the autocorrelation rides fractional lags (linear
  // interpolation of the envelope) — integer-only lags let the 2x harmonic
  // win whenever the true period is non-integer, the classic octave error
  const interp = (arr: readonly number[], pos: number): number => {
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    const frac = pos - lo;
    return (arr[lo] ?? 0) * (1 - frac) + (arr[hi] ?? 0) * frac;
  };
  const step = 0.25;
  const scoreAt = (lag: number): number => {
    let score = 0;
    for (let i = 0; i + lag < centered.length; i++) score += centered[i] * interp(centered, i + lag);
    return score / (centered.length - lag);
  };
  const scores: number[] = [];
  const lags: number[] = [];
  for (let lag = minLag; lag <= maxLag; lag += step) {
    scores.push(scoreAt(lag));
    lags.push(lag);
  }
  const bestRaw = Math.max(...scores);
  let bestIndex = 0;
  for (let k = 0; k < scores.length; k++) {
    if (scores[k] === bestRaw) {
      bestIndex = k;
      break;
    }
  }
  let bestLag = lags[bestIndex];
  // the octave law: while the half lag still scores 0.7x of the peak (with
  // interpolated envelopes), the beat sits below the picked harmonic
  while (bestLag / 2 >= minLag) {
    const halfScore = scoreAt(bestLag / 2);
    if (halfScore < bestRaw * 0.7) break;
    bestLag /= 2;
  }
  const bestScore = scoreAt(bestLag);
  const strength = Math.max(0, Math.min(1, bestScore / (Math.max(1e-12, mean) + 1e-9) / 8));
  return { bpm: Math.round((60 * framesPerSecond) / bestLag), strength };
}

/**
 * Segments the sounding material into contiguous sections and ranks them by
 * energy into the structure labels.
 *
 * @param rms the per-frame rms.
 * @param samplerate the sample rate.
 * @returns the structure sections.
 */
function structureOf(rms: readonly number[], samplerate: number): StructureSection[] {
  const sounding = rms.map((v) => v > SILENCE_RMS);
  const sections: Array<{ start: number; end: number; energy: number }> = [];
  let open = -1;
  for (let f = 0; f < rms.length; f++) {
    if (sounding[f] && open < 0) open = f;
    if ((!sounding[f] || f === rms.length - 1) && open >= 0) {
      const end = sounding[f] ? f + 1 : f;
      const slice = rms.slice(open, end);
      sections.push({
        start: (open * HOP_SIZE) / samplerate,
        end: (end * HOP_SIZE) / samplerate,
        energy: slice.reduce((s, v) => s + v, 0) / Math.max(1, slice.length),
      });
      open = -1;
    }
  }
  const peak = Math.max(...sections.map((s) => s.energy), 1e-12);
  const ranked = [...sections].sort((a, b) => b.energy - a.energy);
  const labels = new Map(
    sections.map((s) => [s, STRUCTURE_LABELS[Math.min(ranked.indexOf(s), STRUCTURE_LABELS.length - 1)]]),
  );
  return sections.map((s) => ({
    label: labels.get(s) ?? "verse",
    start: s.start,
    end: s.end,
    energy: s.energy / peak,
  }));
}

/**
 * Runs the full analysis pipeline over one mono pcm signal.
 *
 * @param mono the decoded mono samples.
 * @param samplerate the sample rate.
 * @param options the optional fingerprint switch.
 * @returns the analysis report (schema v1).
 */
export function analyze(mono: readonly number[], samplerate: number, options?: { fingerprint?: boolean }): AudioReport {
  const features = frameFeatures(mono, samplerate);
  const tempo = tempoOf(features.flux, samplerate);
  const key = keyOf(features.chroma);
  const weighted = kWeightChannel(mono as number[], samplerate);
  const blocks = gatingBlocks([weighted], samplerate);
  const bandEnergies = bandEnergiesOf(mono, samplerate);
  const centroidMean = features.centroid.reduce((s, v) => s + v, 0) / Math.max(1, features.centroid.length);
  return {
    sampleRate: samplerate,
    durationSeconds: mono.length / samplerate,
    rhythm: { bpm: tempo.bpm, onsetStrength: tempo.strength },
    key: { tonic: key.tonic, tonicName: PC_NAMES[key.tonic], mode: key.mode },
    loudness: { integrated: integratedLoudness(blocks) },
    spectrum: { bands: bandEnergies, centroidHz: Math.round(centroidMean) },
    structure: structureOf(features.rms, samplerate),
    fingerprintHashes: options?.fingerprint ? fingerprintOf(mono, samplerate).length : 0,
  };
}

/** Computes the mean energy of the seven documented bands (one frame pass). */
function bandEnergiesOf(mono: readonly number[], samplerate: number): number[] {
  const bins = new Array<number>(BAND_LABELS.length).fill(0);
  const counts = new Array<number>(BAND_LABELS.length).fill(0);
  const binHz = samplerate / FFT_SIZE;
  const frameCount = Math.max(1, Math.floor((mono.length - FFT_SIZE) / HOP_SIZE) + 1);
  const stride = Math.max(1, Math.floor(frameCount / 24));
  const window = new Array<number>(FFT_SIZE).fill(0);
  for (let f = 0; f < frameCount; f += stride) {
    const start = f * HOP_SIZE;
    for (let i = 0; i < FFT_SIZE; i++) window[i] = mono[start + i] ?? 0;
    const frame = frameSpectrum(window);
    for (let b = 1; b < frame.magnitudes.length; b++) {
      const hz = b * binHz;
      if (hz < BAND_LADDER[0] || hz > BAND_LADDER[BAND_LADDER.length - 1]) continue;
      let band = 0;
      while (band < BAND_LADDER.length - 1 && hz > BAND_LADDER[band + 1]) band++;
      bins[band] += frame.magnitudes[b];
      counts[band]++;
    }
  }
  return bins.map((sum, i) => (counts[i] > 0 ? sum / counts[i] : 0));
}
