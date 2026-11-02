// # timestretch — the time-stretch executor of the katexis engine (root
// layer, the wave the speechalign plan always named and no lane ever
// rendered): the classic phase vocoder (Flanagan 1966, Portnoff 1976, the
// Laroche–Dolon identity phase locking of 1999) over the shared spectral
// kernel — one stft on the analysis grid, per-bin phase propagation across
// consecutive frames (the heterodyned instantaneous-frequency rotation),
// the synthesis phases locked to the local spectral peaks, one inverse
// frame per analysis frame placed on the synthesis grid, the hann window
// riding both passes and the overlap-add normalised by the squared-window
// sum (the same ola edge law hpss pins: the head and tail of the grid
// divide only where the window sum is healthy). The pitch never moves:
// the analysis hop is constant (HOP_SIZE, the shared law), the synthesis
// hop carries the stretch (Hs = Ha · ratio), the phase advance measured on
// the analysis timeline drives the synthesis timeline — a 440 hz tone
// stretched to twice its length still answers 440 hz, the test pins it.
// Honest limits, documented never hidden: the phase vocoder is a
// sinusoidal-model engine — transients smear when the stretch grows (the
// window is 93 ms at 44.1k, so a stretch of 2 rides 186 ms of phase
// history over each output frame), and the band law keeps the stretch
// inside 0.25..2: below the floor the synthesis hop out-runs the window
// (the ola grid stops overlapping), above the ceiling the squared-window
// sum grows gaps (the same law from the other side) — a stretch beyond
// the band answers its machine code, never a silent pretend-pass. The
// fft kernel is imported from spectrum.ts — never re-implemented, the
// family law; the window and the hop are the shared tables so the
// stretch, hpss and the analyzer read one law. Pure math, deterministic:
// the same samples and ratio always answer the same bytes, on every
// machine, node or browser alike.

import { FFT_SIZE, fftInPlace, HANN_TABLE, HOP_SIZE } from "./spectrum.ts";

/** The machine readable failure codes of the stretch contract. */
export type StretchErrorCode = "empty-signal" | "bad-ratio";

/** The typed stretch failure, traceable to a machine code. */
export class StretchError extends Error {
  /** Machine readable failure code. */
  readonly code: StretchErrorCode;

  constructor(code: StretchErrorCode, message?: string) {
    super(message ?? `timestretch ${code}`);
    this.name = "StretchError";
    this.code = code;
  }
}

/** The slowest stretch the phase vocoder law answers (the output holds a
 * quarter of the input's timeline — the synthesis hop of 256 against the
 * 4096 window rides a healthy sixteen-fold overlap; any slower and one
 * analysis frame must span more than the window itself). */
export const STRETCH_RATIO_MIN = 0.25;

/** The fastest stretch the phase vocoder law answers in the other
 * direction (the output holds twice the input's timeline — the synthesis
 * hop of 2048 against the 4096 window keeps the fifty percent overlap the
 * squared-window normalisation needs; any longer and the ola grid grows
 * gaps whose window sum sits under the divide law). */
export const STRETCH_RATIO_MAX = 2;

/** The principal argument: the angle wrapped into (−π, π] — the phase
 * difference law every per-bin rotation rides. */
function princarg(angle: number): number {
  const wrapped = angle % (2 * Math.PI);
  if (wrapped > Math.PI) return wrapped - 2 * Math.PI;
  if (wrapped <= -Math.PI) return wrapped + 2 * Math.PI;
  return wrapped;
}

/** One analysis frame of the stretch stft: the magnitudes and the phases
 * of the useful half spectrum. */
interface AnalysisFrame {
  /** Magnitudes per bin, length FFT_SIZE / 2 + 1. */
  mag: Float64Array;
  /** Phases per bin, the same length. */
  phase: Float64Array;
}

/**
 * The analysis pass: the hann-windowed stft on the constant grid, one
 * frame per HOP_SIZE of input. The frame count covers both timelines —
 * the input's (no sample rides outside the grid) and the output's (the
 * stretched ola tail needs frames past the input's end, their windows
 * reading the zero padding) — a signal shorter than one window still
 * answers its one zero-padded frame.
 *
 * @param mono the input samples.
 * @param frames the frame count the caller pinned (the grid law above).
 * @returns the analysis frames, exactly `frames` of them.
 */
function analyze(mono: Float32Array, frames: number): AnalysisFrame[] {
  const size = FFT_SIZE;
  const hop = HOP_SIZE;
  const half = size / 2 + 1;
  const out: AnalysisFrame[] = [];
  // the number[] lanes keep their float64 precision through the kernel's
  // scratch pair (the spectrum law — the phase vocoder's cancellation runs
  // as deep as the hpss inverse)
  const re = new Array<number>(size).fill(0);
  const im = new Array<number>(size).fill(0);
  for (let k = 0; k < frames; k++) {
    const start = k * hop;
    re.fill(0);
    im.fill(0);
    for (let i = 0; i < size; i++) {
      const sample = mono[start + i] ?? 0;
      re[i] = sample * HANN_TABLE[i];
    }
    fftInPlace(re, im);
    const mag = new Float64Array(half);
    const phase = new Float64Array(half);
    for (let b = 0; b < half; b++) {
      mag[b] = Math.hypot(re[b], im[b]);
      phase[b] = Math.atan2(im[b], re[b]);
    }
    out.push({ mag, phase });
  }
  return out;
}

/** Finds the local spectral peaks of one frame: a bin at or above its
 * lower neighbour and strictly above the upper one — the seats whose
 * rotation the region law locks onto (the Laroche–Dolon peaks). */
function peaksOf(mag: Float64Array): number[] {
  const peaks: number[] = [];
  for (let b = 1; b < mag.length - 1; b++) {
    if (mag[b] >= mag[b - 1] && mag[b] > mag[b + 1]) peaks.push(b);
  }
  return peaks;
}

/** Maps every bin onto the peak whose region owns it: the peaks divide the
 * spectrum at the midpoints between neighbours, each bin answers the
 * nearest peak (the identity phase-locking region of the classic paper —
 * the phase of a bin follows its region's peak, the magnitude shape stays
 * untouched). An empty peak table answers the identity map. */
function peakRegions(peaks: readonly number[], bins: number): Int32Array {
  const owner = new Int32Array(bins);
  if (peaks.length === 0) {
    for (let b = 0; b < bins; b++) owner[b] = b;
    return owner;
  }
  let peak = 0;
  for (let b = 0; b < bins; b++) {
    while (peak + 1 < peaks.length && b >= ((peaks[peak] ?? 0) + (peaks[peak + 1] ?? 0)) / 2) peak += 1;
    owner[b] = peaks[peak] ?? b;
  }
  return owner;
}

/**
 * Time-stretches one mono signal, pitch preserved — the phase vocoder walk:
 * analysis (the shared hann window, the constant hop), phase propagation
 * (the heterodyned per-bin rotation of consecutive frames), identity phase
 * locking (the synthesis phases of a peak's region follow the peak's
 * rotation, the bins keep their own analysis offset), synthesis (the
 * inverse frames placed on the synthesis hop, the ola normalised by the
 * squared-window sum). Deterministic and total: the same samples and ratio
 * answer the same bytes; silence stretches to silence; the output length
 * is round(ratio · input length).
 *
 * @param mono the input samples (any level, any rate — the window law rides
 *   samples, never hz).
 * @param ratio the stretch factor: the output's timeline over the input's
 *   (2 = twice as long, 0.5 = half as long, 1 = the identity pass).
 * @returns the stretched samples, length round(ratio · mono.length).
 * @throws StretchError empty-signal when nothing rides the input,
 *   bad-ratio when the ratio is not a finite number inside the band
 *   0.25..2 (the honest refusal, never a silent clamp).
 */
export function stretchPcm(mono: Float32Array, ratio: number): Float32Array {
  if (!(mono.length > 0)) throw new StretchError("empty-signal", "the stretch needs samples — nothing rides the input");
  if (!Number.isFinite(ratio) || ratio < STRETCH_RATIO_MIN || ratio > STRETCH_RATIO_MAX)
    throw new StretchError(
      "bad-ratio",
      `the stretch ratio ${String(ratio)} sits outside the honest band ${STRETCH_RATIO_MIN}..${STRETCH_RATIO_MAX}`,
    );

  const size = FFT_SIZE;
  const hop = HOP_SIZE;
  const half = size / 2 + 1;
  const synthesisHop = hop * ratio;
  const outputLength = Math.round(mono.length * ratio);
  // the frame count covers the input grid and the output grid: the input
  // needs a frame per hop until its last sample sits inside a window, the
  // stretched output needs frames until its last sample sits inside a
  // synthesis window (the tail frames read the zero padding past the end)
  const inputFrames = 1 + Math.max(0, Math.ceil((mono.length - size) / hop));
  const outputFrames = 1 + Math.max(0, Math.ceil((outputLength - size) / synthesisHop));
  const frames = analyze(mono, Math.max(inputFrames, outputFrames));
  const out = new Float64Array(outputLength + size);
  const norm = new Float64Array(outputLength + size);
  // the phase seats: the per-bin advance of the analysis timeline (the
  // expected rotation of one hop at the bin's centre frequency) and the
  // running synthesis phase
  const advance = new Float64Array(half);
  for (let b = 0; b < half; b++) advance[b] = (2 * Math.PI * b * hop) / size;
  let synthPhase = Float64Array.from(frames[0]?.phase ?? new Float64Array(half));

  const re = new Array<number>(size).fill(0);
  const im = new Array<number>(size).fill(0);
  for (let k = 0; k < frames.length; k++) {
    const frame = frames[k] as AnalysisFrame;
    if (k > 0) {
      const previous = frames[k - 1] as AnalysisFrame;
      const raw = new Float64Array(half);
      for (let b = 0; b < half; b++) {
        // the heterodyned instantaneous-frequency rotation: the measured
        // phase difference minus the expected advance, wrapped, then the
        // advance restored — the answer is the analysis timeline's true
        // per-hop rotation estimated inside the bin's neighbourhood. the
        // synthesis timeline advances by the SAME rotation scaled by the
        // ratio (the hop it lands on is Ha·ratio wide: a stretch moves the
        // frames, never the frequency — the Portnoff phase-advance law)
        const delta = princarg(frame.phase[b] - previous.phase[b] - advance[b]);
        raw[b] = synthPhase[b] + (advance[b] + delta) * ratio;
      }
      // the identity phase locking: the rotation of each region's peak owns
      // the region — the bins of a peak keep the peak's rotation plus
      // their own analysis offset, so the peak's skirt moves as one voice
      // instead of wrapping apart (the classic phasiness fix)
      const peaks = peaksOf(frame.mag);
      const owner = peakRegions(peaks, half);
      const locked = new Float64Array(half);
      for (let b = 0; b < half; b++) {
        const peakBin = owner[b] ?? b;
        const rotation = princarg((raw[peakBin] ?? 0) - (frame.phase[peakBin] ?? 0));
        locked[b] = rotation + (frame.phase[b] ?? 0);
      }
      synthPhase = locked;
    }
    // the synthesis frame: the analysis magnitudes over the synthesis
    // phases, hermitian mirror, the inverse riding the forward transform
    // (conj(fft(conj(X))) = N·x — the same istft trick hpss rides)
    re.fill(0);
    im.fill(0);
    for (let b = 0; b < half; b++) {
      const magnitude = frame.mag[b];
      const angle = synthPhase[b] ?? 0;
      // the conjugate spectrum goes in — the inverse rides the forward
      // transform (conj(fft(conj(X))) = N·x, the same istft trick hpss
      // rides: the real part of the answer is the frame itself)
      re[b] = magnitude * Math.cos(angle);
      im[b] = -magnitude * Math.sin(angle);
      if (b > 0 && b < size / 2) {
        re[size - b] = re[b] ?? 0;
        im[size - b] = -(im[b] ?? 0);
      }
    }
    fftInPlace(re, im);
    const start = Math.round(k * synthesisHop);
    const scale = 1 / size;
    for (let i = 0; i < size; i++) {
      const at = start + i;
      if (at >= out.length) break;
      out[at] += (re[i] ?? 0) * scale * HANN_TABLE[i];
      norm[at] += HANN_TABLE[i] * HANN_TABLE[i];
    }
  }
  const result = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    // the ola divides only where the window sum is healthy (the hpss edge
    // law — the grid's head and tail keep the attenuated sum, a millisecond
    // fade instead of an amplified edge)
    result[i] = norm[i] > 1e-2 ? (out[i] ?? 0) / norm[i] : 0;
  }
  return result;
}
