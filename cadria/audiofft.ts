// # audiofft — the spectral engine under audiospectrum: an iterative radix-2
// FFT (Cooley–Tukey, in-place), the periodic window functions and the STFT.
// Pure TypeScript over typed arrays, zero dependencies, zero DOM: the same
// calls run in the browser and in node. Bit-reversal and twiddle tables are
// precomputed per size and cached in module maps — caching never changes a
// result, only avoids recomputation, so every function stays deterministic.
// Sizes are power-of-two 256..16384. Windows are periodic (the spectral
// analysis convention, denominator N): hann sums to N/2, hamming to 0.54·N,
// blackman to 0.42·N. The STFT walks frame starts 0, hop, 2·hop, … and
// zero-pads the tail window, so the frame count is exactly
// ceil((n − size) / hop) + 1 (0 frames below one full window). Non-finite
// samples read as 0 at the stft/fftMagnitudes boundary. Errors throw
// FftError; nothing else escapes. Non-goals: no inverse FFT, no real-FFT
// packing tricks, no WASM — one honest radix-2 pass. audiospectrum.ts owns
// the features built on top of these frames.

/** Error raised for invalid sizes, mismatched buffers and malformed options. */
export class FftError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "FftError";
  }
}

/** the window functions the STFT can apply. */
export type WindowName = "hann" | "hamming" | "blackman";

/** smallest supported FFT size (power of two). */
export const FFT_MIN_SIZE = 256;

/** largest supported FFT size (power of two). */
export const FFT_MAX_SIZE = 16384;

/** precomputed tables for one FFT size (shared, read-only after build). */
interface FftTables {
  /** bit-reversal permutation: reverse[i] is the new index of bin i */
  reverse: Uint32Array;
  /** twiddle cosines: cos[k] = cos(2πk/n) for k in [0, n/2) */
  cos: Float64Array;
  /** twiddle sines: sin[k] = sin(2πk/n) for k in [0, n/2) */
  sin: Float64Array;
}

const fftTableCache = new Map<number, FftTables>();
const windowCache = new Map<string, Float64Array>();

/** validates a power-of-two size within [256, 16384] and returns it. */
function checkedSize(size: number, label: string): number {
  if (!Number.isInteger(size) || size < FFT_MIN_SIZE || size > FFT_MAX_SIZE || (size & (size - 1)) !== 0) {
    throw new FftError(
      `audiofft: ${label} must be a power-of-two integer in [${FFT_MIN_SIZE}, ${FFT_MAX_SIZE}], got ${size}`,
    );
  }
  return size;
}

/** builds (once) and returns the reversal + twiddle tables for a size. */
function tablesFor(size: number): FftTables {
  const cached = fftTableCache.get(size);
  if (cached) return cached;
  const reverse = new Uint32Array(size);
  for (let i = 0; i < size; i++) {
    let x = i;
    let r = 0;
    for (let bits = size; bits > 1; bits >>= 1) {
      r = (r << 1) | (x & 1);
      x >>= 1;
    }
    reverse[i] = r;
  }
  const half = size >> 1;
  const cos = new Float64Array(half);
  const sin = new Float64Array(half);
  for (let k = 0; k < half; k++) {
    cos[k] = Math.cos((2 * Math.PI * k) / size);
    sin[k] = Math.sin((2 * Math.PI * k) / size);
  }
  const tables = { reverse, cos, sin };
  fftTableCache.set(size, tables);
  return tables;
}

/**
 * fft — in-place iterative radix-2 Cooley–Tukey transform of the complex
 * signal (re, im), forward convention e^(−i2πkn/N). Both buffers must share
 * one power-of-two length in [256, 16384]; contents are permuted and
 * overwritten (the in-place contract).
 */
export function fft(re: Float32Array, im: Float32Array): void {
  if (re.length !== im.length) {
    throw new FftError(`audiofft: real and imaginary buffers differ (${re.length} vs ${im.length})`);
  }
  const size = checkedSize(re.length, "size");
  const { reverse, cos, sin } = tablesFor(size);
  for (let i = 0; i < size; i++) {
    const j = reverse[i];
    if (j > i) {
      const tr = re[i];
      const ti = im[i];
      re[i] = re[j];
      im[i] = im[j];
      re[j] = tr;
      im[j] = ti;
    }
  }
  for (let len = 2; len <= size; len <<= 1) {
    const half = len >> 1;
    const stride = size / len;
    for (let lower = 0; lower < size; lower += len) {
      for (let j = 0; j < half; j++) {
        const k = j * stride;
        const c = cos[k];
        const s = sin[k];
        const upper = lower + j + half;
        const xr = re[upper];
        const xi = im[upper];
        const tr = xr * c + xi * s;
        const ti = xi * c - xr * s;
        re[upper] = re[lower + j] - tr;
        im[upper] = im[lower + j] - ti;
        re[lower + j] += tr;
        im[lower + j] += ti;
      }
    }
  }
}

/**
 * fftMagnitudes — convenience over fft for one real-valued frame of `size`
 * samples: returns the one-sided magnitude spectrum, `size/2 + 1` bins from
 * DC (bin 0) to nyquist (bin size/2). The input frame is not modified.
 */
export function fftMagnitudes(frame: Float32Array): Float32Array {
  const size = checkedSize(frame.length, "frame size");
  const re = Float32Array.from(frame);
  const im = new Float32Array(size);
  for (let i = 0; i < size; i++) re[i] = Number.isFinite(re[i]) ? re[i] : 0;
  fft(re, im);
  const bins = (size >> 1) + 1;
  const magnitudes = new Float32Array(bins);
  for (let k = 0; k < bins; k++) magnitudes[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
  return magnitudes;
}

/** builds (once) and returns a periodic window of a size for a formula. */
function cachedWindow(name: WindowName, size: number, at: (i: number, n: number) => number): Float64Array {
  checkedSize(size, `${name} window size`);
  const key = `${name}:${size}`;
  const hit = windowCache.get(key);
  if (hit) return hit;
  const window = new Float64Array(size);
  for (let i = 0; i < size; i++) window[i] = at(i, size);
  windowCache.set(key, window);
  return window;
}

/** periodic hann: 0.5 − 0.5·cos(2πi/N); sums to N/2. */
export function hann(size: number): Float64Array {
  return cachedWindow("hann", size, (i, n) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / n));
}

/** periodic hamming: 0.54 − 0.46·cos(2πi/N); sums to 0.54·N. */
export function hamming(size: number): Float64Array {
  return cachedWindow("hamming", size, (i, n) => 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / n));
}

/** periodic blackman: 0.42 − 0.5·cos(2πi/N) + 0.08·cos(4πi/N); sums to 0.42·N. */
export function blackman(size: number): Float64Array {
  return cachedWindow(
    "blackman",
    size,
    (i, n) => 0.42 - 0.5 * Math.cos((2 * Math.PI * i) / n) + 0.08 * Math.cos((4 * Math.PI * i) / n),
  );
}

/** resolves a window by name (the STFT option path). */
export function windowFunction(name: WindowName, size: number): Float64Array {
  switch (name) {
    case "hann":
      return hann(size);
    case "hamming":
      return hamming(size);
    case "blackman":
      return blackman(size);
  }
  throw new FftError(`audiofft: unknown window "${String(name)}" (expected hann, hamming or blackman)`);
}

/** the STFT options: window length, hop and window name (defaults 1024/512/hann). */
export interface StftOptions {
  /** window length in samples, power of two in [256, 16384] (default 1024). */
  size?: number;
  /** samples between frame starts, integer >= 1 (default size / 2). */
  hop?: number;
  /** analysis window (default "hann"). */
  window?: WindowName;
}

/** frame count for n samples: 0 below one window, else ceil((n − size)/hop) + 1. */
export function stftFrameCount(samples: number, size: number, hop: number): number {
  if (samples < size) return 0;
  return Math.ceil((samples - size) / hop) + 1;
}

/**
 * stft — slides a window over the samples and returns one one-sided
 * magnitude spectrum (size/2 + 1 bins) per frame. Frame starts walk 0, hop,
 * 2·hop, …; a tail window reaching past the end reads zeros, which pins the
 * frame count at ceil((n − size)/hop) + 1 (empty below one full window).
 * Deterministic: same samples and options, same frames.
 */
export function stft(samples: Float32Array, options: StftOptions = {}): Float32Array[] {
  const size = checkedSize(options.size ?? 1024, "size");
  const hop = options.hop ?? size / 2;
  if (!Number.isInteger(hop) || hop < 1) {
    throw new FftError(`audiofft: hop must be an integer >= 1, got ${hop}`);
  }
  const win = windowFunction(options.window ?? "hann", size);
  const count = stftFrameCount(samples.length, size, hop);
  const bins = (size >> 1) + 1;
  const frames: Float32Array[] = [];
  const re = new Float32Array(size);
  const im = new Float32Array(size);
  for (let f = 0; f < count; f++) {
    const start = f * hop;
    for (let i = 0; i < size; i++) {
      const t = start + i;
      const sample = t < samples.length ? samples[t] : 0;
      re[i] = (Number.isFinite(sample) ? sample : 0) * win[i];
    }
    im.fill(0);
    fft(re, im);
    const magnitudes = new Float32Array(bins);
    for (let k = 0; k < bins; k++) magnitudes[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
    frames.push(magnitudes);
  }
  return frames;
}
