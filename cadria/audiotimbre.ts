// # audiotimbre — the spectral-timbre half of the cadria audio→image paint
// feed (wave 1, module a5), housed at the cadria root beside audiotimbreenv.
// It turns sound into the numbers that later steer brush texture: a 26-band
// HTK mel filterbank (local clean-room, zero dependencies — spectral
// magnitudes come from a private small-frame DFT, no audiofft import, so the
// module stays self-contained by contract) feeds an unnormalized DCT-II for
// MFCCs, and the magnitude spectrum answers slope, rolloff sharpness,
// noisiness (flatness — the harmonicity proxy inverted), warmth and
// brightness. timbreStats rolls everything into the TimbreStats contract,
// dynamics and crossings riding in from audiotimbreenv. Every answer is
// clamped and finite: damaged input reads as silence or neutral, nothing
// throws. Exports: 11 functions, 4 types, 2 constants — the honest count.

import { DEFAULT_HOP, DEFAULT_SIZE, type DynamicStats, dynamicStats, rmsEnvelope, zcr } from "./audiotimbreenv.ts";

/** filter count of the mel bank — the classic 26-filter front end. */
export const MEL_BANDS = 26;

/** coefficient count answered by mfcc when the caller does not choose. */
export const DEFAULT_COEFFICIENTS = 13;

/** mel-bank options: filter count and the frequency span the triangles cover. */
export type MelOptions = { bands?: number; fmin?: number; fmax?: number };
/** mfcc options — the mel-bank span plus how many coefficients to keep. */
export type MfccOptions = MelOptions & { coefficients?: number };
/** timbreStats options — framing plus the mfcc front end, nothing else. */
export type TimbreOptions = MfccOptions & { size?: number; hop?: number };

/** the wave-1 paint-texture contract: one audio take → the numbers that steer brush texture.
 *
 * Every field maps to visual texture downstream: `noisiness` drives grain — the speckle density the
 * brush scatters over the canvas (white-noise takes grain heavily, pure tones stay glassy smooth);
 * `warmth` drives stroke softness — low-mid energy renders as soft round glazes, bright takes as
 * crisp thin strokes; `dynamics.rangeDb` drives contrast — how far the value scale may spread
 * between the darkest and the lightest paint (wide range earns chiaroscuro, compressed stays milky);
 * `brightness` places the palette toward light/cool zones on a high centroid and deep/warm ones on a
 * low one; `slopeMean` tilts the texture gradient; the mfcc vectors shape brush character and
 * `zcrMean` adds fine grit. All fields are finite and clamped — generators need no guarding.
 */
export type TimbreStats = {
  mfccMean: number[]; // mean of the per-frame MFCC vector (13 entries by default)
  mfccStd: number[]; // population std of the same coefficients across frames
  slopeMean: number; // mean spectral tilt (log-log), negative = dark-heavy
  zcrMean: number; // mean zero-crossing rate, clamped [0, 1]
  noisiness: number; // spectral flatness mean in [0, 1] — the grain dial
  warmth: number; // low-mid power share in [0, 1] — the stroke-softness dial
  brightness: number; // normalized spectral centroid in [0, 1] — the palette dial
  dynamics: DynamicStats; // the loudness spread (rangeDb = the contrast dial)
};

function clean(v: number): number {
  return Number.isFinite(v) ? v : 0;
}
function cleanMag(v: number): number {
  const m = clean(v);
  return m > 0 ? m : 0;
}
function clamp01(v: number): number {
  return Number.isFinite(v) ? (v < 0 ? 0 : v > 1 ? 1 : v) : 0;
}
function clampRange(v: number, lo: number, hi: number): number {
  return Number.isFinite(v) ? (v < lo ? lo : v > hi ? hi : v) : 0;
}
function goodRate(sampleRate: number): number {
  return Number.isFinite(sampleRate) && sampleRate > 0 ? sampleRate : 0;
}

/** hertz → HTK mel (2595·log10(1 + f/700)); damaged input answers 0. */
export function hztomel(f: number): number {
  return 2595 * Math.log10(1 + (Number.isFinite(f) && f > 0 ? f : 0) / 700);
}

/** HTK mel → hertz, the exact inverse of hztomel on the same domain. */
export function meltohz(m: number): number {
  return 700 * (10 ** ((Number.isFinite(m) && m > 0 ? m : 0) / 2595) - 1);
}

/** the mel triangle bank over `bins` DFT bins: one row per band, integer HTK edges, peak exactly 1. */
export function melFilterbank(bins: number, sampleRate: number, opts?: MelOptions): Float32Array[] {
  const count = Math.max(2, Math.trunc(bins));
  const sr = goodRate(sampleRate);
  const bands = Math.max(1, Math.trunc(opts?.bands ?? MEL_BANDS));
  const nyquist = sr / 2;
  const fmin = clampRange(opts?.fmin ?? 0, 0, nyquist);
  const fmax = clampRange(opts?.fmax ?? nyquist, fmin, nyquist);
  const melMin = hztomel(fmin);
  const span = hztomel(fmax) - melMin;
  const live = sr > 0 && span > 0;
  const edge = (i: number): number =>
    live ? Math.floor(((2 * count - 1) * meltohz(melMin + (span * i) / (bands + 1))) / sr) : -1;
  const rows: Float32Array[] = [];
  for (let b = 0; b < bands; b++) {
    const row = new Float32Array(count);
    const left = edge(b);
    const center = edge(b + 1);
    const right = edge(b + 2);
    for (let k = Math.max(0, left); k <= Math.min(count - 1, right); k++) {
      let w = 0;
      if (k <= center) w = center > left ? (k - left) / (center - left) : 1;
      else w = right > center ? (right - k) / (right - center) : 0;
      row[k] = clamp01(w);
    }
    rows.push(row);
  }
  return rows;
}

/** unnormalized DCT-II: out[k] = Σ x[i]·cos(π·k·(2i+1)/(2n)) — pure, full precision, no scaling. */
export function dctii(input: ArrayLike<number>): Float64Array {
  const n = Math.max(0, Math.trunc(input?.length ?? 0));
  const out = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += clean(input[i]) * Math.cos((Math.PI * k * (2 * i + 1)) / (2 * n));
    out[k] = Number.isFinite(sum) ? sum : 0;
  }
  return out;
}

/** mel-band log energies of one magnitude frame — power weighted, floored 80 dB under the band peak
 * (the librosa top-db window) so leakage tails cannot swing the log from frame to frame. */
function melEnergies(magnitudes: ArrayLike<number>, bank: Float32Array[]): Float64Array {
  const bins = magnitudes?.length ?? 0;
  const out = new Float64Array(bank.length);
  let peak = 0;
  for (let b = 0; b < bank.length; b++) {
    const row = bank[b];
    let energy = 0;
    for (let k = 0; k < bins; k++) {
      const m = cleanMag(magnitudes[k]);
      energy += m * m * row[k];
    }
    out[b] = energy;
    if (energy > peak) peak = energy;
  }
  const floor = Math.max(1e-12, peak * 1e-8);
  for (let b = 0; b < bank.length; b++) out[b] = Math.log(Math.max(out[b], floor));
  return out;
}

/** MFCCs of one magnitude frame: mel log energies → DCT-II → first `coefficients` answers (13 by default). */
export function mfcc(magnitudes: ArrayLike<number>, sampleRate: number, opts?: MfccOptions): Float32Array {
  const bank = melFilterbank(Math.max(2, magnitudes?.length ?? 0), sampleRate, opts);
  const coefficients = Math.min(Math.max(1, Math.trunc(opts?.coefficients ?? DEFAULT_COEFFICIENTS)), bank.length);
  const spectrum = dctii(melEnergies(magnitudes, bank));
  const out = new Float32Array(coefficients);
  for (let c = 0; c < coefficients; c++) out[c] = Number.isFinite(spectrum[c]) ? spectrum[c] : 0;
  return out;
}

/** Hann window of `n` points (n ≤ 1 answers unity — nothing to taper). */
function hann(n: number): Float64Array {
  const w = new Float64Array(Math.max(0, n));
  for (let i = 0; i < n; i++) w[i] = n > 1 ? 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)) : 1;
  return w;
}

/** private small-frame DFT: magnitudes of bins 0..n/2 via exact twiddle tables — the no-audiofft fallback. */
function dftMagnitudes(frame: Float64Array): Float32Array {
  const n = frame.length;
  const bins = Math.max(0, (n >> 1) + 1);
  const cosTable = new Float64Array(n),
    sinTable = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    cosTable[i] = Math.cos((2 * Math.PI * i) / n);
    sinTable[i] = Math.sin((2 * Math.PI * i) / n);
  }
  const out = new Float32Array(bins);
  for (let k = 0; k < bins; k++) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i++) {
      const twiddle = n > 0 ? (k * i) % n : 0;
      re += frame[i] * cosTable[twiddle];
      im -= frame[i] * sinTable[twiddle];
    }
    out[k] = Math.sqrt(re * re + im * im);
  }
  return out;
}

/** slope of log-magnitude over log-frequency (least squares, clamped to ±24); too few points → 0. */
export function spectralSlope(magnitudes: ArrayLike<number>, sampleRate: number): number {
  const bins = magnitudes?.length ?? 0;
  const sr = goodRate(sampleRate);
  if (bins < 3 || sr <= 0) return 0;
  const binHz = sr / (2 * (bins - 1));
  let n = 0;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (let k = 1; k < bins; k++) {
    const m = cleanMag(magnitudes[k]);
    if (m <= 1e-12) continue;
    const x = Math.log(k * binHz);
    const y = Math.log(m);
    n++;
    sx += x;
    sy += y;
    sxx += x * x;
    sxy += x * y;
  }
  const denom = n * sxx - sx * sx;
  if (n < 2 || Math.abs(denom) < 1e-9) return 0;
  return clampRange((n * sxy - sx * sy) / denom, -24, 24);
}

/** rolloff sharpness: the bin where `ratio` (default 0.85) of the power has accumulated, over the top bin. */
export function rolloffSharpness(magnitudes: ArrayLike<number>, opts?: { ratio?: number }): number {
  const bins = magnitudes?.length ?? 0;
  if (bins < 2) return 0;
  const ratio = clamp01(opts?.ratio ?? 0.85);
  let total = 0;
  for (let k = 0; k < bins; k++) total += cleanMag(magnitudes[k]) ** 2;
  if (total <= 0) return 0;
  let acc = 0;
  for (let k = 0; k < bins; k++) {
    acc += cleanMag(magnitudes[k]) ** 2;
    if (acc >= ratio * total) return clamp01(k / (bins - 1));
  }
  return 1;
}

/** noisiness = spectral flatness (geometric over arithmetic power mean) — the 1 − harmonicity proxy, in [0, 1]. */
export function noisinessIndex(magnitudes: ArrayLike<number>): number {
  const bins = magnitudes?.length ?? 0;
  if (bins < 2) return 0;
  let logSum = 0;
  let sum = 0;
  for (let k = 0; k < bins; k++) {
    const p = cleanMag(magnitudes[k]) ** 2;
    logSum += Math.log(Math.max(p, 1e-12));
    sum += p;
  }
  return sum <= 0 ? 0 : clamp01(Math.exp(logSum / bins) / (sum / bins));
}

/** warmth = power share below `splitHz` (default 1000); silence or a damaged rate answers the neutral 0.5. */
export function warmthIndex(magnitudes: ArrayLike<number>, sampleRate: number, opts?: { splitHz?: number }): number {
  const bins = magnitudes?.length ?? 0;
  const sr = goodRate(sampleRate);
  if (bins < 2 || sr <= 0) return 0.5;
  const splitBin = (clampRange(opts?.splitHz ?? 1000, 0, sr / 2) / (sr / 2)) * (bins - 1);
  let low = 0;
  let high = 0;
  for (let k = 0; k < bins; k++) {
    const m = cleanMag(magnitudes[k]);
    if (k < splitBin) low += m * m;
    else high += m * m;
  }
  return low + high <= 0 ? 0.5 : clamp01(low / (low + high));
}

/** brightness = power-weighted mean frequency (spectral centroid) over Nyquist, in [0, 1]; silence answers 0. */
export function brightness(magnitudes: ArrayLike<number>, sampleRate: number): number {
  const bins = magnitudes?.length ?? 0;
  const sr = goodRate(sampleRate);
  if (bins < 2 || sr <= 0) return 0;
  const binHz = sr / (2 * (bins - 1));
  let num = 0;
  let den = 0;
  for (let k = 0; k < bins; k++) {
    const p = cleanMag(magnitudes[k]) ** 2;
    num += k * binHz * p;
    den += p;
  }
  return den > 0 ? clamp01(num / den / (sr / 2)) : 0;
}

/** rolls the whole timbre layer into one TimbreStats answer for the paint feed (see TimbreStats for the texture mapping). */
export function timbreStats(samples: ArrayLike<number>, sampleRate: number, opts?: TimbreOptions): TimbreStats {
  const sr = goodRate(sampleRate);
  const size = Math.max(64, Math.trunc(opts?.size ?? DEFAULT_SIZE));
  const hop = Math.max(1, Math.trunc(opts?.hop ?? DEFAULT_HOP));
  const n = samples?.length ?? 0;
  const env = rmsEnvelope(samples, { size, hop });
  const bank = melFilterbank((size >> 1) + 1, sr, opts);
  const coefficients = Math.min(Math.max(1, Math.trunc(opts?.coefficients ?? DEFAULT_COEFFICIENTS)), bank.length);
  const window = hann(size);
  const span = Math.min(size, Math.max(1, n));
  const sums = new Float64Array(coefficients),
    squares = new Float64Array(coefficients);
  let slopeSum = 0;
  let noisinessSum = 0;
  let warmthSum = 0;
  let brightnessSum = 0;
  for (let f = 0; f < env.length; f++) {
    const start = Math.min(f * hop, n - span);
    const frame = new Float64Array(size);
    for (let i = 0; i < span; i++) frame[i] = clean(samples[start + i]) * window[i];
    const mag = dftMagnitudes(frame);
    const spectrum = dctii(melEnergies(mag, bank));
    for (let c = 0; c < coefficients; c++) {
      const v = Number.isFinite(spectrum[c]) ? spectrum[c] : 0;
      sums[c] += v;
      squares[c] += v * v;
    }
    slopeSum += spectralSlope(mag, sr);
    noisinessSum += noisinessIndex(mag);
    warmthSum += warmthIndex(mag, sr);
    brightnessSum += brightness(mag, sr);
  }
  const g = env.length > 0 ? env.length : 1;
  const mfccMean: number[] = [];
  const mfccStd: number[] = [];
  for (let c = 0; c < coefficients; c++) {
    const mean = sums[c] / g;
    mfccMean.push(mean);
    mfccStd.push(Math.sqrt(Math.max(0, squares[c] / g - mean * mean)));
  }
  const rates = zcr(samples, { size, hop });
  const zcrMean = rates.length > 0 ? clamp01(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
  return {
    mfccMean,
    mfccStd,
    slopeMean: slopeSum / g,
    zcrMean,
    noisiness: noisinessSum / g,
    warmth: warmthSum / g,
    brightness: brightnessSum / g,
    dynamics: dynamicStats(env),
  };
}
