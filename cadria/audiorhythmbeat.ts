// # audiorhythmbeat — the tempo & beat-geometry half of the cadria rhythm
// layer (wave 1, module a3, sibling of audiorhythm.ts): bookkeeping over
// plain numbers and envelope arrays, no FFT, no decoding. estimateBpm reads
// tempo by autocorrelation over a bounded bpm range plus a comb refinement
// whose between-teeth penalty keeps the fundamental above its double-length
// multiple (180 never collapses to 90); bpmOverTime slides that estimate
// across the envelope; canonicalTempo folds a raw bpm into 70-160 (above
// 160 halves — the trap half-time fold, a detected 180 reads 90 — below 70
// doubles, in-range passes untouched, so 150 stays 150 with multiplier 1);
// beatGrid lays an even click track from bpm + phase; downbeatIndex /
// downbeatGrid phase-align the bar line to onset energy (envelope sampled
// at beat times, strongest rotation wins, ties keep the earliest);
// swingRatio reads the offbeat split from inter-onset positions (0.5
// straight → 2/3 triplet). This leaf also hosts the shared RhythmError so
// the dependency arrow stays one-way: audiorhythm.ts imports here, never
// the reverse. Deterministic, finite-guarded answers; contract violations
// (bpm ≤ 0, negative durations, bad periods) throw RhythmError.

/** Error raised for malformed bpm values, grids, envelopes and options. */
export class RhythmError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "RhythmError";
  }
}

/** passes finite numbers through and replaces NaN/±Infinity with a fallback. */
export function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

/** clamps into [lo, hi]; non-finite reads lo. */
function clamp(value: number, lo: number, hi: number): number {
  const v = finite(value, lo);
  return v < lo ? lo : v > hi ? hi : v;
}

/** validates a finite bpm > 0 — the one contract every caller here shares. */
function checkedBpm(bpm: number, caller: string): number {
  if (!Number.isFinite(bpm) || bpm <= 0)
    throw new RhythmError(`audiorhythm: ${caller} bpm must be finite > 0, got ${bpm}`);
  return bpm;
}

/** the canonical-tempo answer: the folded bpm plus the fold that was used. */
export type CanonicalTempo = { bpm: number; multiplier: 0.5 | 1 | 2 };

/**
 * canonicalTempo — folds a raw bpm into the 70-160 window: above 160
 * halves (trap half-time), below 70 doubles, in-range passes untouched
 * (150 stays 150, multiplier 1 — the documented choice). A fold that still
 * lands outside (input < 35 or > 320) clamps to the near edge; non-finite
 * or non-positive input reads as unknown: bpm 0, multiplier 1.
 */
export function canonicalTempo(bpm: number): CanonicalTempo {
  if (!Number.isFinite(bpm) || bpm <= 0) return { bpm: 0, multiplier: 1 };
  const multiplier: 0.5 | 1 | 2 = bpm > 160 ? 0.5 : bpm < 70 ? 2 : 1;
  return { bpm: clamp(bpm * multiplier, 70, 160), multiplier };
}

/**
 * beatGrid — an even click track: offsetMs + k·(60000/bpm) for every beat
 * inside [0, durationMs]. A negative offset clips the grid at 0; a zero
 * duration or an offset past the end answers empty; the grid caps at 4096
 * beats so absurd bpm + duration pairs cannot loop forever.
 */
export function beatGrid(bpm: number, durationMs: number, offsetMs = 0): number[] {
  checkedBpm(bpm, "beatGrid");
  if (!Number.isFinite(durationMs) || durationMs < 0)
    throw new RhythmError(`audiorhythm: beatGrid durationMs must be finite >= 0, got ${durationMs}`);
  if (!Number.isFinite(offsetMs))
    throw new RhythmError(`audiorhythm: beatGrid offsetMs must be finite, got ${offsetMs}`);
  const period = 60000 / bpm;
  const beats: number[] = [];
  const first = offsetMs >= 0 ? 0 : Math.ceil(-offsetMs / period - 1e-9);
  for (let k = first; k - first < 4096; k++) {
    const t = offsetMs + k * period;
    if (t > durationMs + 1e-9) break;
    beats.push(finite(t));
  }
  return beats;
}

/** the onset envelope's strength around one time: max of the ±1-frame
 *  neighborhood (outside reads 0) — downbeat scoring samples this at beat
 *  times, so a beat that fires earns its rotation. */
export function envelopeSampleAt(envelope: Float32Array, frameMs: number, tMs: number): number {
  const frame = Math.round(tMs / frameMs);
  let peak = 0;
  for (let i = frame - 1; i <= frame + 1; i++) {
    if (i >= 0 && i < envelope.length && envelope[i] > peak) peak = envelope[i];
  }
  return peak;
}

/**
 * downbeatIndex — the bar rotation whose beats carry the most onset
 * energy: for each r in 0..periodBeats-1 the envelope is sampled at
 * beats[r], beats[r+periodBeats], … and the highest mean wins (ties keep
 * the earliest rotation, so a uniform grid reads 0). No beats or an empty
 * envelope answer 0.
 */
export function downbeatIndex(
  beats: readonly number[],
  envelope: Float32Array,
  frameMs: number,
  periodBeats = 4,
): number {
  if (!Number.isInteger(periodBeats) || periodBeats < 1) {
    throw new RhythmError(`audiorhythm: downbeatIndex periodBeats must be an integer >= 1, got ${periodBeats}`);
  }
  if (!Number.isFinite(frameMs) || frameMs <= 0)
    throw new RhythmError(`audiorhythm: downbeatIndex frameMs must be finite > 0, got ${frameMs}`);
  if (beats.length === 0 || envelope.length === 0) return 0;
  let best = 0;
  let bestScore = -Infinity;
  for (let r = 0; r < periodBeats; r++) {
    let sum = 0;
    let count = 0;
    for (let i = r; i < beats.length; i += periodBeats) {
      sum += envelopeSampleAt(envelope, frameMs, beats[i]);
      count++;
    }
    const score = count > 0 ? sum / count : 0;
    if (score > bestScore + 1e-12) {
      bestScore = score;
      best = r;
    }
  }
  return best;
}

/** how the bar line landed: the beat grid (ms) plus the winning rotation
 *  `downbeatIndex` — beats[r], beats[r + periodBeats], … are the downbeats. */
export type DownbeatGrid = { beats: number[]; downbeatIndex: number; periodBeats: number };

/** downbeatGrid — beatGrid plus the downbeat phase aligned to onset energy
 *  (options: periodBeats, default 4 = 4/4; offsetMs, the grid phase in ms). */
export function downbeatGrid(
  bpm: number,
  durationMs: number,
  envelope: Float32Array,
  frameMs: number,
  options: { periodBeats?: number; offsetMs?: number } = {},
): DownbeatGrid {
  const periodBeats = options.periodBeats ?? 4;
  const beats = beatGrid(bpm, durationMs, options.offsetMs ?? 0);
  return { beats, downbeatIndex: downbeatIndex(beats, envelope, frameMs, periodBeats), periodBeats };
}

/** the swing read: `ratio` is the beat-pair split in [0.5, 0.75] — 0.5
 *  straight, 2/3 triplet — and `swung` flips at SWING_THRESHOLD (0.58). */
export type SwingRead = { ratio: number; swung: boolean };

/** a beat-pair split at or above this reads as swung. */
export const SWING_THRESHOLD = 0.58;

/**
 * swingRatio — how the offbeat sits between beats. The phase anchors by
 * scanning 48 candidate rotations of a `bpm` grid and keeping the one under
 * which the onsets carry the most beat weight — each on-beat hit (|p| < 0.08)
 * scores 1, or the onset's own strength when `weights` is handed in (the
 * beat is the stronger onset: loud onbeats outrank quiet offbeats and the
 * count alone cannot separate the onbeat anchor from the offbeat anchor).
 * Every onset then reduces to its relative position inside its beat and the
 * split reads from the late cluster (positions 0.55-0.89, the offbeat that
 * closes the pair): a late cluster at least as populated as the early one
 * (0.12-0.45, the triplet "and" side) sets the ratio, otherwise the mean of
 * all offbeat positions clamps to the 0.5 floor. Under 3 onsets or no
 * offbeat content answers straight.
 */
export function swingRatio(onsetsMs: readonly number[], bpm: number, weights?: readonly number[]): SwingRead {
  checkedBpm(bpm, "swingRatio");
  const times = [...onsetsMs].filter((t) => Number.isFinite(t)).sort((a, b) => a - b);
  if (times.length < 3) return { ratio: 0.5, swung: false };
  const strength = (t: number): number => {
    if (!weights || weights.length === 0) return 1;
    const index = times.indexOf(t);
    const w = index >= 0 && index < weights.length ? weights[index] : 0;
    return Number.isFinite(w) && w > 0 ? w : 0;
  };
  const period = 60000 / bpm;
  const offset = times[0];
  const phaseBins = 48;
  /** wraps a raw position into [0, 1). */
  const wrap = (r: number): number => ((r % 1) + 1) % 1;
  const onBeatWeight = (anchor: number): number => {
    let onBeats = 0;
    for (const t of times) {
      const p = wrap((t - anchor) / period);
      if (p < 0.08 || p > 0.92) onBeats += strength(t);
    }
    return onBeats;
  };
  /** the mean of the non-beat positions under one anchor (0 when none). */
  const _offBeatMean = (anchor: number): number => {
    const rest: number[] = [];
    for (const t of times) {
      const p = wrap((t - anchor) / period);
      if (p >= 0.12 && p <= 0.89) rest.push(p);
    }
    return rest.length > 0 ? rest.reduce((acc, v) => acc + v, 0) / rest.length : 0;
  };
  let bestOffset = offset;
  let bestScore = -1;
  for (let b = 0; b < phaseBins; b++) {
    const anchor = offset - (b / phaseBins) * period;
    const score = onBeatWeight(anchor);
    if (score > bestScore) {
      bestScore = score;
      bestOffset = anchor;
    }
  }
  const positions: number[] = [];
  for (const t of times) {
    const p = wrap((t - bestOffset) / period);
    if (p >= 0.12 && p <= 0.89) positions.push(p);
  }
  if (positions.length === 0) return { ratio: 0.5, swung: false };
  const mean = (list: readonly number[]): number => list.reduce((acc, v) => acc + v, 0) / list.length;
  const late = positions.filter((p) => p > 0.55);
  const early = positions.filter((p) => p < 0.45);
  const ratio = late.length > 0 && late.length >= early.length ? mean(late) : mean(positions);
  return { ratio: finite(clamp(ratio, 0.5, 0.75), 0.5), swung: ratio >= SWING_THRESHOLD };
}

/** bpm search bounds (defaults 60-200). */
export type BpmOptions = { minBpm?: number; maxBpm?: number };

/** one tempo hypothesis with its normalized support score (0-1). */
export type BpmCandidate = { bpm: number; score: number };

/** the tempo answer: best bpm, 0-1 confidence, runner-up hypotheses. */
export type BpmEstimate = {
  bpm: number; // best bpm in [minBpm, maxBpm]; 0 when nothing correlates
  confidence: number; // pulse trust 0-1: autocorrelation plus comb support
  candidates: BpmCandidate[]; // sorted by score, at most 5, deduped within 1 bpm
};

/** frame period of the synthetic impulse envelope built from onset lists. */
const ONSET_TRAIN_FRAME_MS = 5;

/** comb teeth per candidate — sixteen beats of evidence at most. */
const COMB_TEETH = 16;

/** micro-shifts (in frames) tried around a refined lag to seat the comb. */
const COMB_SHIFTS: readonly number[] = [0, -0.2, 0.2, -0.4, 0.4];

/** spikes a 5 ms-frame impulse envelope from onset times in ms. */
function onsetTrain(onsetsMs: readonly number[]): Float32Array {
  let last = 0;
  for (const t of onsetsMs) if (Number.isFinite(t) && t > last) last = t;
  const train = new Float32Array(Math.max(1, Math.ceil(last / ONSET_TRAIN_FRAME_MS) + 1));
  for (const t of onsetsMs) {
    if (!Number.isFinite(t) || t < 0) continue;
    const f = Math.round(t / ONSET_TRAIN_FRAME_MS);
    if (f < train.length) train[f] = 1;
  }
  return train;
}

/** raw autocorrelation of the envelope at one integer lag. */
function autocorrelation(envelope: Float32Array, lag: number): number {
  let sum = 0;
  for (let i = 0; i + lag < envelope.length; i++) sum += envelope[i] * envelope[i + lag];
  return sum;
}

/** linear read of the envelope at a fractional frame index (outside reads 0). */
function envelopeAtLag(envelope: Float32Array, index: number): number {
  const i = Math.floor(index);
  if (i < 0 || i >= envelope.length) return 0;
  const next = i + 1 < envelope.length ? envelope[i + 1] : envelope[i];
  return envelope[i] + (next - envelope[i]) * (index - i);
}

/** parabolic peak shift from three samples, clamped to ±0.5 (flat reads 0). */
function parabolicShift(left: number, center: number, right: number): number {
  const denom = left - 2 * center + right;
  if (!(Math.abs(denom) > 1e-12)) return 0;
  const shift = (0.5 * (left - right)) / denom;
  return shift < -0.5 ? -0.5 : shift > 0.5 ? 0.5 : shift;
}

/** clamps into 0-1; non-finite reads 0. */
function clamp01(value: number): number {
  const v = finite(value);
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * estimateBpm — tempo by autocorrelation + comb: the lag range implied by
 * the bpm bounds is scanned for the strongest local maxima, each is
 * parabolic-refined, then a comb of up to 16 teeth scores how
 * pulse-train-like the envelope is at that period — hits on the teeth minus
 * half the energy between them, so the fundamental always outscores its
 * double-length multiple — plus a ±0.4-frame micro-shift seating the teeth
 * on the pulses. Accepts an onset envelope plus its frame period (ms) or a
 * plain list of onset times in ms (converted to a 5 ms impulse envelope).
 * Nothing correlating (silence, an envelope shorter than the slowest
 * period) answers bpm 0, confidence 0, no candidates.
 */
export function estimateBpm(
  source: readonly number[] | Float32Array,
  frameMs?: number,
  options: BpmOptions = {},
): BpmEstimate {
  const minBpm = options.minBpm ?? 60;
  const maxBpm = options.maxBpm ?? 200;
  if (!Number.isFinite(minBpm) || minBpm <= 0 || !Number.isFinite(maxBpm) || maxBpm <= minBpm) {
    throw new RhythmError(`audiorhythm: need 0 < minBpm < maxBpm, got ${minBpm}..${maxBpm}`);
  }
  let envelope: Float32Array;
  let stepMs: number;
  if (source instanceof Float32Array) {
    const step = Number(frameMs);
    if (!Number.isFinite(step) || step <= 0)
      throw new RhythmError(`audiorhythm: frameMs must be finite > 0 for an envelope, got ${frameMs}`);
    envelope = source;
    stepMs = step;
  } else {
    envelope = onsetTrain(source);
    stepMs = ONSET_TRAIN_FRAME_MS;
  }
  const energy = autocorrelation(envelope, 0);
  const minLag = Math.max(1, Math.ceil(60000 / maxBpm / stepMs));
  const topLag = Math.min(Math.floor(60000 / minBpm / stepMs), envelope.length - 2);
  if (!(energy > 0) || topLag < minLag) return { bpm: 0, confidence: 0, candidates: [] };
  const lo = minLag - 1;
  const acf = new Float64Array(topLag + 2 - lo);
  for (let lag = lo; lag <= topLag + 1; lag++) acf[lag - lo] = autocorrelation(envelope, lag);
  const ranked: { lag: number; norm: number }[] = [];
  for (let lag = minLag; lag <= topLag; lag++) {
    const value = acf[lag - lo];
    if (!(value > 0)) continue;
    if (lag > minLag && value <= acf[lag - 1 - lo]) continue;
    if (lag < topLag && value < acf[lag + 1 - lo]) continue;
    ranked.push({ lag, norm: value / energy });
  }
  ranked.sort((a, b) => b.norm - a.norm);
  let peakValue = 0;
  for (const v of envelope) if (v > peakValue) peakValue = v;
  const candidates: BpmCandidate[] = [];
  for (const { lag, norm } of ranked.slice(0, 6)) {
    const base = lag + parabolicShift(acf[lag - 1 - lo], acf[lag - lo], acf[lag + 1 - lo]);
    let bestComb = 0;
    let bestShift = 0;
    for (const shift of COMB_SHIFTS) {
      const trial = base + shift;
      if (trial < minLag || trial > topLag) continue;
      let comb = 0;
      let count = 0;
      for (let k = 1; k * trial < envelope.length && count < COMB_TEETH; k++, count++) {
        comb += envelopeAtLag(envelope, k * trial) - 0.5 * envelopeAtLag(envelope, (k + 0.5) * trial);
      }
      const value = count > 0 ? clamp01(comb / count / peakValue) : 0;
      if (value > bestComb) {
        bestComb = value;
        bestShift = shift;
      }
    }
    const seated = Math.max(minLag, Math.min(topLag, base + bestShift));
    candidates.push({ bpm: 60000 / (seated * stepMs), score: clamp01(0.5 * norm + 0.5 * bestComb) });
  }
  candidates.sort((a, b) => b.score - a.score);
  const deduped: BpmCandidate[] = [];
  for (const candidate of candidates) {
    if (!deduped.some((kept) => Math.abs(kept.bpm - candidate.bpm) < 1)) deduped.push(candidate);
  }
  const best = deduped[0];
  return { bpm: best ? best.bpm : 0, confidence: best ? best.score : 0, candidates: deduped.slice(0, 5) };
}

/** one point of the tempo curve: window center time and window tempo. */
export type TempoPoint = { tMs: number; bpm: number };

/**
 * bpmOverTime — the tempo curve: a sliding window of `windowMs` (advanced
 * by half a window) runs estimateBpm over each envelope slice and reports
 * the window center time with its tempo (0 when a slice holds no pulse).
 * A window needs at least 200 ms and 4 frames; the tail window shrinks
 * instead of overrunning the envelope.
 */
export function bpmOverTime(
  envelope: Float32Array,
  frameMs: number,
  windowMs = 4000,
  options: BpmOptions = {},
): TempoPoint[] {
  if (!Number.isFinite(frameMs) || frameMs <= 0)
    throw new RhythmError(`audiorhythm: frameMs must be finite > 0, got ${frameMs}`);
  if (!Number.isFinite(windowMs) || windowMs < 200)
    throw new RhythmError(`audiorhythm: windowMs must be finite >= 200, got ${windowMs}`);
  const points: TempoPoint[] = [];
  const windowFrames = Math.max(4, Math.round(windowMs / frameMs));
  const step = Math.max(1, windowFrames >> 1);
  for (let start = 0; start < envelope.length; start += step) {
    const stop = Math.min(envelope.length, start + windowFrames);
    if (stop - start < 4) break;
    const slice = envelope.subarray(start, stop);
    points.push({ tMs: (start + (stop - start) / 2) * frameMs, bpm: estimateBpm(slice, frameMs, options).bpm });
    if (stop === envelope.length) break;
  }
  return points;
}
