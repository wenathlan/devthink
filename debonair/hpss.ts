// # hpss — the harmonic/percussive stem separator of the katexis engine (root
// layer): the classical median-filter HPSS (Fitzgerald 2010, Driedger Müller
// Dissecco 2014) over the shared spectral kernel. One real STFT of the mono
// pcm, two median filters on the magnitude (across time separates the
// harmonic ridge, across frequency separates the percussive broadband), two
// soft Wiener masks that always sum to one and one ISTFT per stem with the
// ORIGINAL phases — the conservation law: harmonic + percussive equals the
// input within float tolerance, the separation never invents or loses
// energy. Pure math, deterministic, zero storage, zero audio context, zero
// downloads — the runner floor (saddle) or the browser rides it as-is.

import { FFT_SIZE, fftInPlace, HANN_TABLE, HOP_SIZE } from "./spectrum.ts";

/** The median window across time for the harmonic ridge (odd frames). */
export const HARMONIC_KERNEL = 17;
/** The median window across frequency for the percussive broadband (odd bins). */
export const PERCUSSIVE_KERNEL = 17;

/** One complex spectrum of the stft: full fft-size bins (re, im interleaved by array pair). */
interface Stft {
  /** The real part per frame, frame × fftSize. */
  re: Float32Array[];
  /** The imaginary part per frame, frame × fftSize. */
  im: Float32Array[];
  /** The magnitude per frame, frame × (fftSize / 2 + 1). */
  mag: Float32Array[];
  /** The frame count. */
  frames: number;
  /** The fft size behind re/im/mag. */
  size: number;
  /** The half-window preroll the centered framing prepended: the input
   * sample 0 lives at padded index pre (the istft trims it back). */
  pre: number;
}

/**
 * Computes the real STFT of a mono signal with the shared hann window and
 * hop, CENTER framed: half a window of silence rides in front of the input
 * so every input sample sits near a window peak (the librosa law) — the
 * inverse never divides the filtered frames by a window tail.
 *
 * @param mono the input samples.
 * @returns the complex spectra and magnitudes per frame, with the preroll.
 */
export function stft(mono: Float32Array): Stft {
  const size = FFT_SIZE;
  const hop = HOP_SIZE;
  const pre = size / 2;
  const padded = pre + mono.length;
  const frames = Math.max(1, Math.ceil(Math.max(0, padded - size) / hop) + 1);
  const re: Float32Array[] = [];
  const im: Float32Array[] = [];
  const mag: Float32Array[] = [];
  const half = size / 2 + 1;
  for (let f = 0; f < frames; f++) {
    const start = f * hop;
    const fre = number_array(size);
    const fim = number_array(size);
    for (let i = 0; i < size; i++) {
      // the padded timeline: frame start rides the preroll, the input
      // sample 0 lands at padded index pre
      const at = start + i - pre;
      const s = at >= 0 && at < mono.length ? mono[at] : 0;
      fre[i] = s * HANN_TABLE[i];
    }
    fftInPlace(fre, fim);
    re.push(fre);
    im.push(fim);
    const m = new Float32Array(half);
    for (let k = 0; k < half; k++) {
      m[k] = Math.hypot(fre[k], fim[k]);
    }
    mag.push(m);
  }
  return { re, im, mag, frames, size, pre };
}

/** The float array constructor alias (keeps the fill sites short). */
function number_array(n: number): Float32Array {
  return new Float32Array(n);
}

/**
 * Sliding median along one axis of a magnitude matrix. A small insertion
 * window keeps the kernel linear on 17 elements; the borders shrink the
 * window instead of padding.
 *
 * @param mag the per-frame magnitudes.
 * @param kernel the odd window length.
 * @param axis "time" filters across frames per bin, "freq" across bins per frame.
 * @returns the median-filtered copy (same shape).
 */
export function medianFilter(mag: readonly Float32Array[], kernel: number, axis: "time" | "freq"): Float32Array[] {
  const frames = mag.length;
  const bins = mag[0].length;
  const half = (kernel - 1) / 2;
  const window: number[] = new Array(kernel);
  const out: Float32Array[] = [];
  if (axis === "freq") {
    for (let f = 0; f < frames; f++) {
      const row = new Float32Array(bins);
      for (let k = 0; k < bins; k++) {
        const lo = Math.max(0, k - half);
        const hi = Math.min(bins - 1, k + half);
        let n = 0;
        for (let j = lo; j <= hi; j++) window[n++] = mag[f][j];
        row[k] = medianOf(window, n);
      }
      out.push(row);
    }
    return out;
  }
  for (let f = 0; f < frames; f++) {
    const row = new Float32Array(bins);
    const lo = Math.max(0, f - half);
    const hi = Math.min(frames - 1, f + half);
    for (let k = 0; k < bins; k++) {
      let n = 0;
      for (let g = lo; g <= hi; g++) window[n++] = mag[g][k];
      row[k] = medianOf(window, n);
    }
    out.push(row);
  }
  return out;
}

/** The median of the first n values of the window (insertion sort — kernel stays ≤ 17). */
function medianOf(window: number[], n: number): number {
  for (let i = 1; i < n; i++) {
    const v = window[i];
    let j = i - 1;
    while (j >= 0 && window[j] > v) {
      window[j + 1] = window[j];
      j--;
    }
    window[j + 1] = v;
  }
  return window[n >> 1];
}

/**
 * Inverse stft with the overlap-add hann synthesis (the hann window doubles
 * as the synthesis window; the hop of a quarter size keeps the ola constant).
 *
 * @param stft the complex spectra carrying the phases to restore.
 * @param gain the per-bin soft mask (0..1) applied on the complex spectrum.
 * @returns the reconstructed mono samples.
 */
export function istft(stft: Stft, gain: readonly Float32Array[]): Float32Array {
  const { re, im, size } = stft;
  const hop = HOP_SIZE;
  const frames = stft.frames;
  const length = (frames - 1) * hop + size;
  // f64 everywhere in the inverse: the ola divides tiny window sums at the
  // edges and the spectrum-to-sample cancellation runs nine orders deep —
  // single precision loses both
  const out = new Float64Array(length);
  const norm = new Float64Array(length);
  const fre: number[] = new Array<number>(size).fill(0);
  const fim: number[] = new Array<number>(size).fill(0);
  const half = size / 2 + 1;
  for (let f = 0; f < frames; f++) {
    const mask = gain[f];
    // the inverse rides the forward transform: conj(fft(conj(X))) = N·x —
    // the bins go in conjugated (and the hermitian mirror follows the
    // flipped sign), the ola reads the real part scaled by 1/N
    for (let k = 0; k < half; k++) {
      const g = mask ? mask[k] : 1;
      fre[k] = re[f][k] * g;
      fim[k] = -im[f][k] * g;
      if (k > 0 && k < size / 2) {
        fre[size - k] = re[f][k] * g;
        fim[size - k] = im[f][k] * g;
      }
    }
    fftInPlace(fre, fim);
    const start = f * hop;
    const scale = 1 / size;
    for (let i = 0; i < size; i++) {
      out[start + i] += fre[i] * scale * HANN_TABLE[i];
      norm[start + i] += HANN_TABLE[i] * HANN_TABLE[i];
    }
  }
  for (let i = 0; i < length; i++) {
    // the ola divides only where the window sum is healthy: at the signal
    // head/tail a lone frame carries the sample in its window tail, and
    // dividing there amplifies the filtered content instead of restoring
    // it — those samples keep the attenuated ola sum (a millisecond fade,
    // the same edge law the centered framings of the reference tools hide
    // with padding)
    if (norm[i] > 1e-2) out[i] /= norm[i];
  }
  // the engine contract stays f32 (the consumers ride Float32Array pcm):
  // the f64 accumulators rounded once at the end keep the conservation
  return Float32Array.from(out);
}

/**
 * Builds the soft wiener masks from the two median-filtered magnitude
 * matrices. MaskH + MaskP = 1 for every frame and bin — the conservation
 * the istft relies on.
 *
 * @param harmonic the time-median magnitudes.
 * @param percussive the frequency-median magnitudes.
 * @returns the pair of gain matrices in the same shape.
 */
export function masksOf(
  harmonic: readonly Float32Array[],
  percussive: readonly Float32Array[],
): {
  harmonic: Float32Array[];
  percussive: Float32Array[];
} {
  const harmonicGain: Float32Array[] = [];
  const percussiveGain: Float32Array[] = [];
  for (let f = 0; f < harmonic.length; f++) {
    const h = new Float32Array(harmonic[f].length);
    const p = new Float32Array(harmonic[f].length);
    for (let k = 0; k < harmonic[f].length; k++) {
      const h2 = harmonic[f][k] * harmonic[f][k];
      const p2 = percussive[f][k] * percussive[f][k];
      const total = h2 + p2;
      if (total <= 1e-20) {
        h[k] = 0.5;
        p[k] = 0.5;
      } else {
        h[k] = h2 / total;
        p[k] = p2 / total;
      }
    }
    harmonicGain.push(h);
    percussiveGain.push(p);
  }
  return { harmonic: harmonicGain, percussive: percussiveGain };
}

/** The two separated stems of one separation pass. */
export interface StemPair {
  /** The harmonic stem: tones, pads, bass, sustained vocals. */
  harmonic: Float32Array;
  /** The percussive stem: kicks, snares, hats, transients. */
  percussive: Float32Array;
}

/**
 * Separates one mono signal into the harmonic and the percussive stem. The
 * masks ride the ORIGINAL phase of the input spectrum, so the pair sums back
 * to the input (float tolerance) — the conservation the tests pin.
 *
 * @param mono the input samples.
 * @returns the two stems, each the input length.
 */
export function separate(mono: Float32Array): StemPair {
  const spectra = stft(mono);
  const harmonic = medianFilter(spectra.mag, HARMONIC_KERNEL, "time");
  const percussive = medianFilter(spectra.mag, PERCUSSIVE_KERNEL, "freq");
  const { harmonic: hg, percussive: pg } = masksOf(harmonic, percussive);
  // the centered framing pads half a window in front: the ola grid also
  // trails past the end — the stems answer the input length exactly, the
  // preroll and the tail never leak to the consumers
  const harmonicFull = istft(spectra, hg);
  const percussiveFull = istft(spectra, pg);
  return {
    harmonic: harmonicFull.subarray(spectra.pre, spectra.pre + mono.length),
    percussive: percussiveFull.subarray(spectra.pre, spectra.pre + mono.length),
  };
}
