// # audiotimbreenv — the frame-envelope half of the cadria timbre layer, housed
// at the cadria root beside audiotimbre. This is the dynamics feed of the
// audio→image campaign (wave 1, module a5): it slices a sample buffer into
// analysis frames and answers how loud each slice is (rmsEnvelope), what that
// means in decibels with a hard −90 dB floor (todb), how the loudness spreads
// across the take (dynamicStats) and how each onset attacks and decays
// (onsetShapes). Onset positions arrive as plain milliseconds over the
// audiorhythm contract — detection lives there, shaping lives here, so this
// module stays rhythm-independent. The framing rule (size 1024, hop 512,
// floor((n − size) / hop) + 1 frames, one partial frame when the buffer is
// shorter) is the single framing definition of the timbre layer, shared with
// audiotimbre.ts through framecount so both halves always agree on where a
// frame starts. Everything is total: non-finite samples read as silence,
// empty or damaged input answers empty frames or neutral stats, and nothing
// ever throws. Non-goals: no spectra (audiotimbre owns mel/MFCC and the DFT),
// no onset detection, no windowing (envelopes are plain rectangular frames —
// the paint feed wants honest local energy, not tapered energy).
// Exports: 7 functions, 3 types, 3 constants — the honest count for this theme.

export const DB_FLOOR = -90;

/** default analysis window in samples, shared by every frame-domain helper. */
export const DEFAULT_SIZE = 1024;

/** default frame advance in samples — 50 % overlap at the default size. */
export const DEFAULT_HOP = 512;

/** frame-domain options: window size and hop, both in samples. */
export type EnvelopeOptions = { size?: number; hop?: number };

/** the loudness spread of an envelope; every field is finite and clamped. */
export type DynamicStats = {
  minDb: number;
  maxDb: number;
  rangeDb: number;
  meanDb: number;
  crestFactor: number;
};

/** how one onset rises and falls: 10–90 % attack in ms, peak→25 % decay in ms, linear peak. */
export type OnsetShape = { attackMs: number; decayMs: number; peak: number };

/** count of analysis frames over `n` samples — the one framing rule of the timbre layer. */
export function framecount(n: number, size: number, hop: number): number {
  if (!Number.isFinite(n) || n < 1) return 0;
  const s = Math.max(1, Math.trunc(size));
  const h = Math.max(1, Math.trunc(hop));
  return n <= s ? 1 : Math.floor((n - s) / h) + 1;
}

/** amplitude → decibels (20·log10 against full scale 1.0), floored at −90 dB, never NaN. */
export function todb(v: number): number {
  const a = Number.isFinite(v) ? Math.abs(v) : 0;
  return a <= 0 ? DB_FLOOR : Math.max(DB_FLOOR, 20 * Math.log10(a));
}

function clean(v: number): number {
  return Number.isFinite(v) ? v : 0;
}

/** RMS envelope, one value per hop (linear amplitude, never negative, never NaN). */
export function rmsEnvelope(samples: ArrayLike<number>, opts?: EnvelopeOptions): Float32Array {
  const n = samples?.length ?? 0;
  const size = Math.max(1, Math.trunc(opts?.size ?? DEFAULT_SIZE));
  const hop = Math.max(1, Math.trunc(opts?.hop ?? DEFAULT_HOP));
  const frames = framecount(n, size, hop);
  const out = new Float32Array(frames);
  const span = Math.min(size, Math.max(1, n));
  for (let f = 0; f < frames; f++) {
    const start = Math.min(f * hop, n - span);
    let sum = 0;
    for (let i = 0; i < span; i++) {
      const v = clean(samples[start + i]);
      sum += v * v;
    }
    out[f] = Math.sqrt(sum / span);
  }
  return out;
}

/** loudness spread of a linear envelope; silence answers the floor everywhere with crest factor 1. */
export function dynamicStats(rms: ArrayLike<number>): DynamicStats {
  const n = rms?.length ?? 0;
  if (n < 1) return { minDb: DB_FLOOR, maxDb: DB_FLOOR, rangeDb: 0, meanDb: DB_FLOOR, crestFactor: 1 };
  let minDb = Infinity;
  let maxDb = -Infinity;
  let sumDb = 0;
  let sumSq = 0;
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, clean(rms[i]));
    const db = todb(a);
    if (db < minDb) minDb = db;
    if (db > maxDb) maxDb = db;
    sumDb += db;
    sumSq += a * a;
    if (a > peak) peak = a;
  }
  const overall = Math.sqrt(sumSq / n);
  const crest = overall > 0 ? Math.min(peak / overall, 10 ** (-DB_FLOOR / 20)) : 1;
  return { minDb, maxDb, rangeDb: maxDb - minDb, meanDb: sumDb / n, crestFactor: crest };
}

/** attack/decay shaping per onset (milliseconds in, shapes out, order preserved, nothing throws). */
export function onsetShapes(
  rms: ArrayLike<number>,
  onsetsMs: readonly number[],
  sampleRate: number,
  opts?: { hop?: number; attackMs?: number; decayMs?: number },
): OnsetShape[] {
  const n = rms?.length ?? 0;
  const sr = Number.isFinite(sampleRate) && sampleRate > 0 ? sampleRate : 0;
  const hop = Math.max(1, Math.trunc(opts?.hop ?? DEFAULT_HOP));
  const attackWin = Math.max(0, opts?.attackMs ?? 250);
  const decayWin = Math.max(attackWin, opts?.decayMs ?? 400);
  const msPerFrame = sr > 0 ? (1000 * hop) / sr : 0;
  const framesOf = (ms: number): number =>
    Math.max(0, Math.round((Math.max(0, Number.isFinite(ms) ? ms : 0) / 1000) * (sr / hop)));
  const shapes: OnsetShape[] = [];
  for (const raw of Array.isArray(onsetsMs) ? onsetsMs : []) {
    const onset = Math.min(Math.max(0, n - 1), framesOf(raw));
    const aEnd = Math.min(n, onset + Math.max(1, framesOf(attackWin)));
    const dEnd = Math.min(n, onset + Math.max(aEnd - onset, framesOf(decayWin)));
    let peak = 0;
    let peakAt = onset;
    for (let i = onset; i < dEnd; i++) {
      const a = Math.max(0, clean(rms[i]));
      if (a > peak) {
        peak = a;
        peakAt = i;
      }
    }
    const rise = 0.1 * peak;
    const set = 0.9 * peak;
    let start = -1;
    let end = -1;
    for (let i = onset; i < aEnd; i++) {
      const a = Math.max(0, clean(rms[i]));
      if (start < 0 && a >= rise) start = i;
      if (start >= 0 && a >= set) {
        end = i;
        break;
      }
    }
    const attackMs = peak <= 0 ? 0 : end >= 0 ? (end - start) * msPerFrame : attackWin;
    let decayMs = 0;
    if (peak > 0) {
      const fade = 0.25 * peak;
      decayMs = decayWin;
      for (let i = peakAt; i < dEnd; i++) {
        if (Math.max(0, clean(rms[i])) <= fade) {
          decayMs = (i - peakAt) * msPerFrame;
          break;
        }
      }
    }
    shapes.push({ attackMs, decayMs, peak });
  }
  return shapes;
}

/** zero-crossing rate per frame, each clamped into [0, 1] (1 = sign flips every sample). */
export function zcr(samples: ArrayLike<number>, opts?: EnvelopeOptions): Float32Array {
  const n = samples?.length ?? 0;
  const size = Math.max(1, Math.trunc(opts?.size ?? DEFAULT_SIZE));
  const hop = Math.max(1, Math.trunc(opts?.hop ?? DEFAULT_HOP));
  const frames = framecount(n, size, hop);
  const out = new Float32Array(frames);
  const span = Math.min(size, Math.max(1, n));
  for (let f = 0; f < frames; f++) {
    const start = Math.min(f * hop, n - span);
    let flips = 0;
    for (let i = start + 1; i < start + span; i++) {
      if (clean(samples[i - 1]) >= 0 !== clean(samples[i]) >= 0) flips++;
    }
    out[f] = span > 1 ? Math.min(1, flips / (span - 1)) : 0;
  }
  return out;
}

/** aggregate zero-crossing rate over the whole buffer; fewer than two samples answers 0. */
export function zcrrate(samples: ArrayLike<number>): number {
  const n = samples?.length ?? 0;
  if (n < 2) return 0;
  let flips = 0;
  for (let i = 1; i < n; i++) {
    if (clean(samples[i - 1]) >= 0 !== clean(samples[i]) >= 0) flips++;
  }
  return Math.min(1, flips / (n - 1));
}
