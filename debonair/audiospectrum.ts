// # audiospectrum — the spectral analysis layer of the audio→image campaign
// (wave 1, module a2). It reads one-sided magnitude spectra — the Float32Array
// frames that audiofft.ts (stft / fftMagnitudes) produces — and answers what
// the image side needs: mel-band energies, per-frame spectral features
// (centroid, 85 % rolloff, flatness, half-wave flux, seven fixed band
// energies), the SpectralSummary frame aggregate and a grayscale spectrogram
// decimator ready for the visualize pipeline. Pure TypeScript, zero
// dependencies, zero DOM, deterministic: the same calls run in the browser
// and in node. Conventions: mel on the HTK scale (2595·log10(1 + f/700));
// bands half-open [lo, hi) Hz mapped to bins by rounding; "energy" is the
// magnitude sum (bandBalance normalizes the scale away); flux is the
// half-wave rectified bin diff summed over bins; standard deviations are
// population (÷ n). Every returned number passes a finite guard — NaN/±∞
// never escape, digital silence maps to 0 — and magnitudes are clamped to
// ≥ 0 before use. Errors throw SpectrumError. Non-goals: no decoding, no
// playback, no inverse transforms — audiofft.ts owns the FFT and the STFT.

/** Error raised for malformed spectra, sample rates, band counts and frames. */
export class SpectrumError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "SpectrumError";
  }
}

/** the seven band edges in Hz: 8 edges delimiting 7 half-open [lo, hi) bands. */
export const BAND_EDGES_HZ: readonly number[] = [20, 60, 250, 500, 2000, 4000, 6000, 20000];

/** the seven band names, index-aligned with the BAND_EDGES_HZ pairs. */
export const BAND_NAMES: readonly string[] = [
  "sub-bass",
  "bass",
  "low-mid",
  "mid",
  "high-mid",
  "presence",
  "brilliance",
];

/** epsilon keeping log(0) finite inside the flatness geometric mean. */
const FLATNESS_EPSILON = 1e-12;

/** passes finite numbers through and replaces NaN/±Infinity with a fallback. */
function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

/** validates a positive finite sample rate. */
function checkedRate(sampleRate: number): void {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0)
    throw new SpectrumError(`audiospectrum: sampleRate must be finite > 0, got ${sampleRate}`);
}

/** validates rate + spectrum of a per-frame feature; returns the bin step. */
function checkedBinWidth(magnitudes: Float32Array, sampleRate: number, caller: string): number {
  if (magnitudes.length < 2)
    throw new SpectrumError(
      `audiospectrum: ${caller} needs a one-sided spectrum of length >= 2, got ${magnitudes.length}`,
    );
  checkedRate(sampleRate);
  return sampleRate / (2 * (magnitudes.length - 1));
}

/** hertz → mel on the HTK scale: 2595·log10(1 + f/700). */
export function hertzToMel(hz: number): number {
  return 2595 * Math.log10(1 + hz / 700);
}

/** mel → hertz on the HTK scale: the exact inverse of hertzToMel. */
export function melToHertz(mel: number): number {
  return 700 * (10 ** (mel / 2595) - 1);
}

/**
 * melbands — filters one magnitude frame through a triangular mel filterbank
 * (weighted mean per band). `bands + 2` centers sit linearly in mel from 0 Hz
 * to nyquist; band b rises over [center_b, center_{b+1}] and falls over
 * [center_{b+1}, center_{b+2}], each band divided by its own weight sum so a
 * flat spectrum reads as equal bands; a band too narrow to touch a bin falls
 * back to the nearest bin of its peak.
 */
export function melbands(magnitudes: Float32Array, sampleRate: number, bands = 40): Float32Array {
  const step = checkedBinWidth(magnitudes, sampleRate, "melbands");
  if (!Number.isInteger(bands) || bands < 1)
    throw new SpectrumError(`audiospectrum: bands must be an integer >= 1, got ${bands}`);
  const lastBin = magnitudes.length - 1;
  const melMax = hertzToMel(sampleRate / 2);
  const out = new Float32Array(bands);
  for (let band = 0; band < bands; band++) {
    const lo = melToHertz((melMax * band) / (bands + 1));
    const peak = melToHertz((melMax * (band + 1)) / (bands + 1));
    const hi = melToHertz((melMax * (band + 2)) / (bands + 1));
    const first = Math.max(0, Math.ceil(lo / step));
    const stop = Math.min(lastBin + 1, Math.ceil(hi / step));
    let weighted = 0,
      weights = 0;
    for (let k = first; k < stop; k++) {
      const f = k * step;
      const w = Math.min((f - lo) / (peak - lo), (hi - f) / (hi - peak));
      if (w <= 0) continue;
      weighted += Math.max(magnitudes[k], 0) * w;
      weights += w;
    }
    out[band] =
      weights > 0
        ? finite(weighted / weights)
        : finite(Math.max(magnitudes[Math.min(lastBin, Math.max(0, Math.round(peak / step)))], 0));
  }
  return out;
}

/**
 * spectralCentroid — the magnitude-weighted mean frequency of one frame in
 * Hz: the center of mass of the spectrum. Digital silence reads 0.
 */
export function spectralCentroid(magnitudes: Float32Array, sampleRate: number): number {
  const step = checkedBinWidth(magnitudes, sampleRate, "spectralCentroid");
  let weighted = 0,
    total = 0;
  for (let k = 0; k < magnitudes.length; k++) {
    const m = Math.max(magnitudes[k], 0);
    weighted += m * k;
    total += m;
  }
  if (total <= 0) return 0;
  return finite((weighted / total) * step);
}

/**
 * spectralRolloff — the frequency in Hz below which `threshold` (default
 * 0.85) of the frame's magnitude sum has accumulated; the brightness cutoff.
 * Digital silence reads 0.
 */
export function spectralRolloff(magnitudes: Float32Array, sampleRate: number, threshold = 0.85): number {
  const step = checkedBinWidth(magnitudes, sampleRate, "spectralRolloff");
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 1)
    throw new SpectrumError(`audiospectrum: threshold must be within (0, 1], got ${threshold}`);
  let total = 0;
  for (let k = 0; k < magnitudes.length; k++) total += Math.max(magnitudes[k], 0);
  if (total <= 0) return 0;
  const target = threshold * total;
  let cumulative = 0;
  for (let k = 0; k < magnitudes.length; k++) {
    cumulative += Math.max(magnitudes[k], 0);
    if (cumulative >= target) return finite(k * step);
  }
  return finite((magnitudes.length - 1) * step);
}

/**
 * spectralFlatness — geometric mean over arithmetic mean of the magnitudes,
 * within [0, 1]: near 0 for a pure tone (one spike on a quiet floor), near 1
 * for noise (an even floor). Digital silence reads 0.
 */
export function spectralFlatness(magnitudes: Float32Array): number {
  if (magnitudes.length < 1)
    throw new SpectrumError(`audiospectrum: spectralFlatness needs a non-empty spectrum, got ${magnitudes.length}`);
  let logSum = 0,
    sum = 0;
  for (let k = 0; k < magnitudes.length; k++) {
    const m = Math.max(magnitudes[k], 0);
    logSum += Math.log(m + FLATNESS_EPSILON);
    sum += m;
  }
  if (sum <= 0) return 0;
  const geometric = Math.exp(logSum / magnitudes.length) / (sum / magnitudes.length + FLATNESS_EPSILON);
  return finite(Math.min(1, geometric));
}

/**
 * spectralFlux — the half-wave rectified bin diff between two frames, summed
 * over bins: how much energy arrived since the previous frame. Onsets light
 * up, steady frames read 0. Frame lengths must match.
 */
export function spectralFlux(current: Float32Array, previous: Float32Array): number {
  if (current.length !== previous.length)
    throw new SpectrumError(
      `audiospectrum: spectralFlux frames differ in length (${current.length} vs ${previous.length})`,
    );
  let flux = 0;
  for (let k = 0; k < current.length; k++) flux += Math.max(0, Math.max(current[k], 0) - Math.max(previous[k], 0));
  return finite(flux);
}

/**
 * bandEnergies — sums the magnitudes of the seven fixed bands (BAND_EDGES_HZ,
 * half-open in Hz; DC stays out; a band past nyquist reads 0), in order.
 */
export function bandEnergies(magnitudes: Float32Array, sampleRate: number): Float32Array {
  const step = checkedBinWidth(magnitudes, sampleRate, "bandEnergies");
  const out = new Float32Array(BAND_NAMES.length);
  for (let band = 0; band < BAND_NAMES.length; band++) {
    const first = Math.max(1, Math.ceil(BAND_EDGES_HZ[band] / step));
    const stop = Math.min(magnitudes.length, Math.ceil(BAND_EDGES_HZ[band + 1] / step));
    let energy = 0;
    for (let k = first; k < stop; k++) energy += Math.max(magnitudes[k], 0);
    out[band] = finite(energy);
  }
  return out;
}

/** the frame aggregate the image side consumes (every field finite). */
export interface SpectralSummary {
  /** mean spectral centroid in Hz across frames. */
  centroidMean: number;
  /** population standard deviation of the centroid. */
  centroidStd: number;
  /** mean 85 % spectral rolloff in Hz. */
  rolloffMean: number;
  /** mean spectral flatness (0 tonal → 1 noise-like). */
  flatnessMean: number;
  /** population standard deviation of the flatness. */
  flatnessStd: number;
  /** mean spectral flux (frame 0 counts 0). */
  fluxMean: number;
  /** population standard deviation of the flux. */
  fluxStd: number;
  /** seven band energies normalized to sum 1 (uniform 1/7 on silence). */
  bandBalance: number[];
  /** centroidMean / nyquist clamped to [0, 1] — the brightness dial. */
  brightnessIndex: number;
}

/** arithmetic mean of a series (empty reads 0). */
function mean(values: readonly number[]): number {
  return values.length > 0 ? values.reduce((acc, value) => acc + value, 0) / values.length : 0;
}

/** population standard deviation (divide by n; a single value reads 0). */
function stdDev(values: readonly number[], meanValue: number): number {
  if (values.length < 2) return 0;
  return Math.sqrt(values.reduce((acc, value) => acc + (value - meanValue) ** 2, 0) / values.length);
}

/**
 * summarizeSpectrum — aggregates a stack of one-sided magnitude frames (the
 * stft output shape) into one SpectralSummary; frames must share their bin
 * count and at least one be given. Flux diffs consecutive frames (frame 0
 * counts 0); bandBalance normalizes mean band energies to sum 1 (uniform
 * 1/7 fallback on silence).
 */
export function summarizeSpectrum(frames: readonly Float32Array[], sampleRate: number): SpectralSummary {
  if (frames.length === 0) throw new SpectrumError("audiospectrum: summarizeSpectrum needs at least one frame");
  checkedRate(sampleRate);
  const bins = frames[0].length;
  for (let f = 0; f < frames.length; f++) {
    if (frames[f].length !== bins)
      throw new SpectrumError(`audiospectrum: frame ${f} has ${frames[f].length} bins, expected ${bins}`);
  }
  const centroids: number[] = [],
    rolloffs: number[] = [],
    flatnesses: number[] = [],
    fluxes: number[] = [];
  const bandAcc = new Float64Array(BAND_NAMES.length);
  for (let f = 0; f < frames.length; f++) {
    const frame = frames[f];
    centroids.push(spectralCentroid(frame, sampleRate));
    rolloffs.push(spectralRolloff(frame, sampleRate));
    flatnesses.push(spectralFlatness(frame));
    fluxes.push(f === 0 ? 0 : spectralFlux(frame, frames[f - 1]));
    const bands = bandEnergies(frame, sampleRate);
    for (let b = 0; b < bands.length; b++) bandAcc[b] += bands[b];
  }
  const centroidMean = mean(centroids);
  const flatnessMean = mean(flatnesses);
  const fluxMean = mean(fluxes);
  const bandTotal = bandAcc.reduce((acc, energy) => acc + energy, 0);
  const uniform = 1 / BAND_NAMES.length;
  return {
    centroidMean: finite(centroidMean),
    centroidStd: finite(stdDev(centroids, centroidMean)),
    rolloffMean: finite(mean(rolloffs)),
    flatnessMean: finite(flatnessMean),
    flatnessStd: finite(stdDev(flatnesses, flatnessMean)),
    fluxMean: finite(fluxMean),
    fluxStd: finite(stdDev(fluxes, fluxMean)),
    bandBalance: BAND_NAMES.map((_, b) => finite(bandTotal > 0 ? bandAcc[b] / bandTotal : uniform)),
    brightnessIndex: finite(Math.min(1, Math.max(0, centroidMean / (sampleRate / 2)))),
  };
}

/**
 * spectrogramImage — decimates magnitude frames into a grayscale width×height
 * image for the visualize pipeline, column-major (index = x·height + y: x is
 * time, y is frequency, y = 0 at the low end). Frames and bins pool by max
 * (the per-cell min/max rule that keeps transients alive) over log1p
 * magnitudes, then a per-image min/max stretch maps to 0..255; silence → 0.
 */
export function spectrogramImage(frames: readonly Float32Array[], width: number, height: number): Uint8ClampedArray {
  if (frames.length === 0) throw new SpectrumError("audiospectrum: spectrogramImage needs at least one frame");
  if (!Number.isInteger(width) || width < 1 || !Number.isInteger(height) || height < 1)
    throw new SpectrumError(`audiospectrum: width and height must be integers >= 1, got ${width}x${height}`);
  const bins = frames[0].length;
  if (bins < 1) throw new SpectrumError("audiospectrum: spectrogramImage frames must not be empty");
  for (let f = 0; f < frames.length; f++) {
    if (frames[f].length !== bins)
      throw new SpectrumError(`audiospectrum: frame ${f} has ${frames[f].length} bins, expected ${bins}`);
  }
  const cellCount = width * height;
  const cells = new Float64Array(cellCount);
  let min = Infinity,
    max = -Infinity;
  for (let x = 0; x < width; x++) {
    const start = Math.min(Math.floor((x * frames.length) / width), frames.length - 1);
    const stop = Math.min(Math.max(Math.floor(((x + 1) * frames.length) / width), start + 1), frames.length);
    for (let y = 0; y < height; y++) {
      const binStart = Math.min(Math.floor((y * bins) / height), bins - 1);
      const binStop = Math.min(Math.max(Math.floor(((y + 1) * bins) / height), binStart + 1), bins);
      let peak = -Infinity;
      for (let f = start; f < stop; f++) {
        const frame = frames[f];
        for (let k = binStart; k < binStop; k++) peak = Math.max(peak, Math.log1p(Math.max(frame[k], 0)));
      }
      const cell = finite(peak, 0);
      cells[x * height + y] = cell;
      if (cell < min) min = cell;
      if (cell > max) max = cell;
    }
  }
  const image = new Uint8ClampedArray(cellCount);
  if (max > min) {
    const scale = 255 / (max - min);
    for (let i = 0; i < cellCount; i++) image[i] = Math.round((cells[i] - min) * scale);
  }
  return image;
}
