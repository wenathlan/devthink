// # audiotonality — the tonality layer of the cadria audio→image wave 1:
// chroma → key → chords → harmonic stats. Magnitudes come from the STFT
// contract (../audiofft.ts stft/fftMagnitudes); until that file exists this
// module stands in with spectrumFrames, a private hann-windowed radix-2 DFT
// over the small default grid (size 4096, hop 2048), so the API stays
// self-contained and audiotonality imports nothing. Chroma folds FFT bins
// into the 12 pitch classes by nearest-semitone mapping at a440 tuning
// (bin freq k·sampleRate/size → midi 69 + 12·log2(freq/440) → pitch class
// round(midi) mod 12), accumulates spectral power, and normalizes each frame
// to L1 with NaN guards (non-finite or silent input answers a zero vector,
// never NaN). Key estimation correlates the mean chroma against the
// Krumhansl-Schmuckler (Krumhansl-Kessler) major/minor profiles rotated over
// the 12 tonics with Pearson r; strength is the clamped winner correlation
// and alternatives rank the remaining 23 rotations. Chord detection lives in
// audiotonalitychords.ts; HarmonicStats summarizes key + energy + chord
// change rate + a dissonance index (normalized chroma entropy). Everything
// is deterministic and nothing throws; damaged input answers zeros or an
// empty timeline. Exports: 5 types, 5 constants/tables, 7 functions.

import { CHORD_DEFAULT_FRAME_MS, detectChords } from "./audiotonalitychords.ts";

/** the two modes of the key profiles and estimates. */
export type KeyMode = "major" | "minor";

/** one ranked key rotation with its clamped correlation strength. */
export type KeyCandidate = {
  /** tonic pitch class 0–11 (0 = c) */
  tonic: number;
  /** major or minor rotation of the profile */
  mode: KeyMode;
  /** Pearson r against the mean chroma, clamped to 0–1 */
  strength: number;
};

/** the winning key plus the 23 runner-up rotations, strongest first. */
export type KeyEstimate = {
  /** tonic pitch class 0–11 (0 = c) */
  tonic: number;
  /** major or minor */
  mode: KeyMode;
  /** strength of the winner, 0–1 (0 = flat or silent chroma) */
  strength: number;
  /** the remaining rotations sorted by strength descending (deterministic ties) */
  alternatives: KeyCandidate[];
};

/** the wave-1 harmonic summary downstream image stages consume. */
export type HarmonicStats = {
  /** key estimate for the mean chroma */
  key: KeyEstimate;
  /** L1-normalized 12-bin mean chroma (chroma energy) */
  chromaEnergy: number[];
  /** detected chord segments per second of chromagram span */
  harmonicChangeRate: number;
  /** dissonance proxy: normalized Shannon entropy of the mean chroma, 0–1 */
  dissonanceIndex: number;
};

/** options for harmonicStats; every field is optional. */
export type HarmonicStatsOptions = {
  /** STFT hop used to build the chromagram (default 2048) — sets frameMs */
  hop?: number;
  /** shortest chord run in frames passed to detectChords (default 4) */
  minFramesPerChord?: number;
};

/** lowercase pitch-class names, index = pitch class 0–11. */
export const pitchClassNames = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"] as const;

/** Krumhansl-Schmuckler (Krumhansl-Kessler) key profiles, index = scale degree from the tonic. */
export const keyProfiles: Readonly<Record<KeyMode, readonly number[]>> = {
  major: [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
  minor: [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17],
};

const A4_HZ = 440;
const A4_MIDI = 69;
const CHROMA_MIN_HZ = 55; // a1: below this the 4096-bin grid cannot resolve semitones
const CHROMA_MAX_HZ = 2093; // c7: above this harmonics dominate the fold
const DEGREES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

/** periodic hann window (the analysis window of the STFT stand-in). */
function hannWindow(size: number): Float64Array {
  const window = new Float64Array(size);
  for (let i = 0; i < size; i += 1) window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / size);
  return window;
}

/** in-place iterative radix-2 FFT (decimation in time, natural-order output). */
function fftInto(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i];
      re[i] = re[j];
      re[j] = tr;
      const ti = im[i];
      im[i] = im[j];
      im[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = (-2 * Math.PI) / len;
    const wr = Math.cos(angle);
    const wi = Math.sin(angle);
    const half = len >> 1;
    for (let base = 0; base < n; base += len) {
      let cr = 1;
      let ci = 0;
      for (let j = 0; j < half; j += 1) {
        const vr = re[base + j + half] * cr - im[base + j + half] * ci;
        const vi = re[base + j + half] * ci + im[base + j + half] * cr;
        const ur = re[base + j];
        const ui = im[base + j];
        re[base + j] = ur + vr;
        im[base + j] = ui + vi;
        re[base + j + half] = ur - vr;
        im[base + j + half] = ui - vi;
        const nextCr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nextCr;
      }
    }
  }
}

/** hann-windowed STFT magnitudes (size/2+1 bins per frame) — the private stand-in for the audiofft contract. */
export function spectrumFrames(samples: Float32Array | readonly number[], size = 4096, hop = 2048): Float32Array[] {
  const n = Math.trunc(size);
  const step = Math.trunc(hop);
  if (!(n >= 2) || (n & (n - 1)) !== 0 || step < 1 || samples.length < n) return [];
  const window = hannWindow(n);
  const frames: Float32Array[] = [];
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let start = 0; start + n <= samples.length; start += step) {
    for (let i = 0; i < n; i += 1) {
      const sample = samples[start + i];
      re[i] = Number.isFinite(sample) ? sample * window[i] : 0;
    }
    im.fill(0);
    fftInto(re, im);
    const magnitudes = new Float32Array(n / 2 + 1);
    for (let k = 0; k <= n / 2; k += 1) magnitudes[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
    frames.push(magnitudes);
  }
  return frames;
}

/** zeroes non-finite/negative cells and scales to unit L1 sum; all-zero input stays all-zero. */
function normalizeL1(vector: Float32Array): Float32Array {
  let sum = 0;
  for (let i = 0; i < vector.length; i += 1) {
    const value = vector[i];
    const clean = Number.isFinite(value) && value > 0 ? value : 0;
    vector[i] = clean;
    sum += clean;
  }
  if (sum > 0) for (let i = 0; i < vector.length; i += 1) vector[i] /= sum;
  return vector;
}

/** 12-bin chroma of one magnitude frame: bin → nearest semitone at a440, power folded, L1-normalized. */
export function chromaVector(magnitudes: Float32Array | readonly number[], sampleRate: number, size?: number): Float32Array {
  const chroma = new Float32Array(12);
  const bins = magnitudes.length;
  const n = size === undefined ? (bins > 1 ? (bins - 1) * 2 : 0) : Math.trunc(size);
  if (!(n >= 2) || !Number.isFinite(sampleRate) || sampleRate <= 0) return chroma;
  const hzPerBin = sampleRate / n;
  const lastBin = Math.min(bins - 1, Math.floor(n / 2));
  for (let k = 1; k <= lastBin; k += 1) {
    const magnitude = magnitudes[k];
    if (!Number.isFinite(magnitude) || magnitude <= 0) continue;
    const freq = k * hzPerBin;
    if (freq < CHROMA_MIN_HZ || freq > CHROMA_MAX_HZ) continue;
    const midi = A4_MIDI + 12 * Math.log2(freq / A4_HZ);
    const pitchClass = ((Math.round(midi) % 12) + 12) % 12;
    chroma[pitchClass] += magnitude * magnitude;
  }
  return normalizeL1(chroma);
}

/** one 12-bin chroma frame per magnitude frame; hop is validated for contract symmetry with spectrumFrames. */
export function chromagram(magnitudeFrames: readonly Float32Array[], sampleRate: number, hop = 2048, size = 4096): Float32Array[] {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0 || !(Math.trunc(hop) >= 1)) return [];
  return magnitudeFrames.map((frame) => chromaVector(frame, sampleRate, size));
}

/** Pearson r of two equal-length vectors; 0 when either side has no variance. */
function pearson(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  let meanA = 0;
  let meanB = 0;
  for (let i = 0; i < n; i += 1) {
    meanA += a[i];
    meanB += b[i];
  }
  meanA /= n;
  meanB /= n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = a[i] - meanA;
    const dy = b[i] - meanB;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (!(sxx > 0) || !(syy > 0)) return 0;
  return sxy / Math.sqrt(sxx * syy);
}

function sanitizeChroma(chroma: Float32Array | readonly number[]): number[] {
  return DEGREES.map((degree) => {
    const value = chroma[degree];
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
  });
}

/** Krumhansl-Schmuckler key of a mean chroma: 24 rotated-profile Pearson correlations, best + ranked rest. */
export function estimateKey(meanChroma: Float32Array | readonly number[]): KeyEstimate {
  const chroma = sanitizeChroma(meanChroma);
  const candidates: KeyCandidate[] = [];
  for (let tonic = 0; tonic < 12; tonic += 1) {
    for (const mode of ["major", "minor"] as const) {
      const profile = keyProfiles[mode];
      const rotated = DEGREES.map((degree) => profile[(degree - tonic + 12) % 12]);
      const r = pearson(chroma, rotated);
      candidates.push({ tonic, mode, strength: Math.min(1, Math.max(0, r)) });
    }
  }
  candidates.sort((a, b) => b.strength - a.strength || a.tonic - b.tonic || (a.mode === b.mode ? 0 : a.mode === "major" ? -1 : 1));
  const winner = candidates[0];
  return { tonic: winner.tonic, mode: winner.mode, strength: winner.strength, alternatives: candidates.slice(1) };
}

/** "c major"-style lowercase name of a key estimate. */
export function keyName(key: { tonic: number; mode: KeyMode }): string {
  if (!Number.isFinite(key.tonic)) return "";
  const pitchClass = ((Math.round(key.tonic) % 12) + 12) % 12;
  return `${pitchClassNames[pitchClass]} ${key.mode === "minor" ? "minor" : "major"}`;
}

/** mean chroma over the frames, sanitized and L1-normalized; empty input answers zeros. */
function meanChroma(frames: readonly Float32Array[]): Float32Array {
  const mean = new Float32Array(12);
  let count = 0;
  for (const frame of frames) {
    if (!frame || frame.length < 12) continue;
    for (let i = 0; i < 12; i += 1) mean[i] += Number.isFinite(frame[i]) ? frame[i] : 0;
    count += 1;
  }
  if (count > 0) for (let i = 0; i < 12; i += 1) mean[i] /= count;
  return normalizeL1(mean);
}

/** dissonance proxy: Shannon entropy of the mean chroma normalized by ln(12); 0 for silence. */
function chromaEntropy(mean: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) if (Number.isFinite(mean[i]) && mean[i] > 0) sum += mean[i];
  if (!(sum > 0)) return 0;
  let entropy = 0;
  for (let i = 0; i < 12; i += 1) {
    const p = mean[i] / sum;
    if (p > 0) entropy -= p * Math.log(p);
  }
  return entropy / Math.log(12);
}

/** the wave-1 HarmonicStats of a chromagram: key, energy, chord change rate, dissonance. */
export function harmonicStats(chromagram: readonly Float32Array[], sampleRate: number, options: HarmonicStatsOptions = {}): HarmonicStats {
  const hop = Math.trunc(options.hop ?? 2048);
  const frameMs = Number.isFinite(sampleRate) && sampleRate > 0 && hop >= 1 ? (1000 * hop) / sampleRate : CHORD_DEFAULT_FRAME_MS;
  const mean = meanChroma(chromagram);
  const segments = detectChords(chromagram, { minFramesPerChord: options.minFramesPerChord, frameMs });
  const seconds = (chromagram.length * frameMs) / 1000;
  return {
    key: estimateKey(mean),
    chromaEnergy: Array.from(mean),
    harmonicChangeRate: seconds > 0 ? segments.length / seconds : 0,
    dissonanceIndex: chromaEntropy(mean),
  };
}
