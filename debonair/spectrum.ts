// # spectrum — the spectral frame law of the katexis engine (root layer):
// the shared window, the magnitude math and the chroma projection every
// analysis domain rides. the transform itself is the engine's one kernel —
// audiofft's radix-2 cooley–tukey with its precomputed bit-reversal and
// twiddle tables — imported here, never re-implemented: before the
// unification this file carried a second fft kernel of its own, and two
// kernels in one engine is the duplication the house law forbids. the
// fingerprint builder, the analyzer, hpss and any future b-wave module
// project frames through here so the window, the magnitude math and the
// chroma law stay in one place. Pure math — zero storage, zero audio context.

import { fft } from "./audiofft.ts";

/** The FFT window length the analysis domains share (4096 = ~93ms at 44.1k). */
export const FFT_SIZE = 4096;
/** The hop between frames, in samples (1024 = 4x overlap). */
export const HOP_SIZE = 1024;
/** The Hann window table, precomputed once for FFT_SIZE (the symmetric
 * law — denominator size − 1 — every analysis caller's numbers ride; the
 * periodic windows audiofft serves belong to its own stft lane, a
 * different contract, never silently swapped). */
export const HANN_TABLE: readonly number[] = buildHann(FFT_SIZE);

/** Builds one Hann window of the given length. */
function buildHann(size: number): number[] {
  const table = new Array<number>(size);
  for (let i = 0; i < size; i++) {
    table[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1));
  }
  return table;
}

/** One complex spectrum frame: magnitudes per bin (size/2 + 1 useful bins). */
export interface SpectrumFrame {
  /** The magnitude per bin, length size/2 + 1. */
  magnitudes: readonly number[];
  /** The bin frequency resolution (samplerate / size). */
  binHz: number;
}

/**
 * Computes the in-place radix-2 FFT of a complex signal (re, im arrays of
 * the same power-of-two length) — the audiofft kernel under the frame-law
 * signature the analysis callers ride. Plain number[] lanes keep their
 * float64 precision through a scratch pair (the kernel's float64 seat);
 * typed-array lanes ride the kernel directly, precision following the
 * buffer. the kernel's own domain is the power-of-two range [256, 16384]
 * (audiofft's law — the house frames all ride 4096); a size off the domain
 * or a mismatched pair throws the kernel's FftError, honestly, never
 * silent garbage.
 *
 * @param re the real part, mutated in place (number[] or Float32Array).
 * @param im the imaginary part, mutated in place (number[] or Float32Array).
 */
export function fftInPlace(re: number[] | Float32Array, im: number[] | Float32Array): void {
  if (re instanceof Float32Array && im instanceof Float32Array) {
    fft(re, im);
    return;
  }
  const size = re.length;
  const scratchRe = Float64Array.from(re);
  const scratchIm = Float64Array.from(im);
  fft(scratchRe, scratchIm);
  for (let i = 0; i < size; i++) {
    re[i] = scratchRe[i];
    im[i] = scratchIm[i];
  }
}

/**
 * Windows one frame with the shared Hann table and answers its magnitude
 * spectrum (bins 0..size/2). The sample rate rides the caller — no rate is
 * baked in, the bin resolution follows whatever pcm the engine runs.
 *
 * @param samples the frame samples, length FFT_SIZE.
 * @param samplerate the rate of the pcm the frame came from (default 44100,
 * the cd quality the legacy callers assumed).
 * @returns the magnitude spectrum frame.
 */
export function frameSpectrum(samples: readonly number[], samplerate = 44100): SpectrumFrame {
  const re = new Array<number>(FFT_SIZE).fill(0);
  const im = new Array<number>(FFT_SIZE).fill(0);
  for (let i = 0; i < FFT_SIZE; i++) {
    re[i] = (samples[i] ?? 0) * HANN_TABLE[i];
  }
  fftInPlace(re, im);
  const bins = FFT_SIZE / 2 + 1;
  const magnitudes = new Array<number>(bins);
  for (let b = 0; b < bins; b++) {
    magnitudes[b] = Math.hypot(re[b], im[b]);
  }
  return { magnitudes, binHz: samplerate / FFT_SIZE };
}

/** The Krumhansl-Kessler key profiles the chroma projection correlates. */
export const KK_MAJOR: readonly number[] = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
export const KK_MINOR: readonly number[] = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

/**
 * Folds one magnitude spectrum into the twelve-bin chroma vector (one bin
 * per pitch class, octave-folded, log-frequency weighted).
 *
 * @param magnitudes the magnitude spectrum.
 * @param binHz the frequency per bin.
 * @returns the chroma vector, length 12, energy-summed.
 */
export function chromaOf(magnitudes: readonly number[], binHz: number): number[] {
  const chroma = new Array<number>(12).fill(0);
  for (let bin = 2; bin < magnitudes.length; bin++) {
    const hz = bin * binHz;
    if (hz < 55 || hz > 4200) continue;
    const midi = 69 + 12 * Math.log2(hz / 440);
    const pc = ((Math.round(midi) % 12) + 12) % 12;
    chroma[pc] += magnitudes[bin];
  }
  return chroma;
}

/**
 * Correlates a chroma vector against the twenty-four KK key profiles and
 * answers the best tonic pitch class and mode.
 *
 * @param chroma the twelve-bin chroma vector.
 * @returns the tonic pc (0=C) and the mode.
 */
export function keyOf(chroma: readonly number[]): { tonic: number; mode: "major" | "minor" } {
  let best: { tonic: number; mode: "major" | "minor"; score: number } = { tonic: 0, mode: "major", score: -Infinity };
  for (let tonic = 0; tonic < 12; tonic++) {
    // the window starts at the tonic: rotated[0] is the energy on the candidate tonic
    const rotated = chroma.map((_, i) => chroma[(i + tonic) % 12]);
    const major = correlation(rotated, KK_MAJOR);
    const minor = correlation(rotated, KK_MINOR);
    if (major > best.score) best = { tonic, mode: "major", score: major };
    if (minor > best.score) best = { tonic, mode: "minor", score: minor };
  }
  return { tonic: best.tonic, mode: best.mode };
}

/** The Pearson correlation of two equal-length vectors. */
function correlation(a: readonly number[], b: readonly number[]): number {
  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  return denA === 0 || denB === 0 ? 0 : num / Math.sqrt(denA * denB);
}
