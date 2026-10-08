// # beatgrid — the beat grid of debonair (root layer): tempo detection, beat
// tracking, quantize/swing/subdivisions and the tempo map with time curves.
// The clean-room pattern is absorbed from filmcraft's audio-dsp/remix.rs
// (autocorrelation tempo with a log-Gaussian prior at 120 BPM, dynamic
// programming beat tracking with a squared log-ratio penalty) and from
// remotion's interpolate (piecewise curves with an explicit extrapolation
// policy, reduced here to linear/exponential/hold tempo ramps). The file
// receives an onset envelope as a parameter — spectra stay in the katexis
// engine. Non-goals: no DSP, no playback, no notation, no MIDI IO. Pure and
// multi-mode — the same call runs in the browser and in node (the unit tests).

/** The machine readable failure codes of the beat grid. */
export type BeatErrorCode = "empty-envelope" | "no-pulse" | "bad-grid" | "bad-tempo" | "bad-strength";

/** The typed result every fallible grid call answers with (errors by return). */
export type BeatResult<T> = { ok: true; value: T } | { ok: false; code: BeatErrorCode; message: string };

/** One grid of beats in seconds with its bar arrangement. */
export interface BeatGrid {
  /** The tempo in BPM (must be > 0). */
  bpm: number;
  /** The beat positions in seconds, strictly increasing (>= 0). */
  beats: number[];
  /** Beats per bar for downbeat labelling (default 4). */
  beatsperbar: number;
}

/** The tempo curve shape carried by an anchor towards the next anchor. */
export type TempoCurve = "hold" | "linear" | "exponential";

/** One tempo anchor: the tempo is exact here and curves into the next anchor. */
export interface TempoAnchor {
  /** The anchor time in seconds (>= 0). */
  time: number;
  /** The tempo at the anchor in BPM (> 0). */
  bpm: number;
  /** The curve towards the next anchor (default "hold"). */
  curve: TempoCurve;
}

/** A piecewise tempo map over the whole programme. */
export interface TempoMap {
  /** The anchors sorted by time (at least one). */
  anchors: TempoAnchor[];
}

/** Fails a fallible call with one machine readable code. */
function fail<T>(code: BeatErrorCode, message: string): BeatResult<T> {
  return { ok: false, code, message };
}

/** The mean and standard deviation of a series (zeros when empty). */
function meanSd(values: readonly number[]): { mean: number; sd: number } {
  const n = values.length;
  if (n === 0) return { mean: 0, sd: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / n;
  return { mean, sd: Math.sqrt(values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n) };
}

/**
 * Onset envelope per frame: half-wave rectified energy flux of a mono signal,
 * normalised to unit standard deviation — the time-domain stand-in for the
 * spectral flux the katexis engine computes. Answers the envelope and fps.
 */
export function onsetEnvelope(
  samples: readonly number[],
  samplerate: number,
  frame = 1024,
): { envelope: number[]; framerate: number } {
  const frames = Math.max(0, Math.floor(samples.length / frame));
  const energy: number[] = [];
  for (let t = 0; t < frames; t++) {
    let acc = 0;
    for (let i = 0; i < frame; i++) acc += samples[t * frame + i] * samples[t * frame + i];
    energy.push(acc / frame);
  }
  const flux: number[] = [];
  for (let t = 1; t < energy.length; t++) flux.push(Math.max(0, energy[t] - energy[t - 1]));
  const { mean, sd } = meanSd(flux);
  return { envelope: flux.map((v) => (sd > 0 ? (v - mean) / sd : 0)), framerate: samplerate / frame };
}

/**
 * Detects the tempo of an onset envelope: autocorrelation over the 50–200 BPM
 * band with a log-Gaussian prior centred at 120 BPM and parabolic refinement.
 * Answers BPM, period (frames) and pulse (0..1); codes `empty-envelope`, `no-pulse`.
 */
export function detectTempo(
  envelope: readonly number[],
  framerate: number,
  minbpm = 50,
  maxbpm = 200,
): BeatResult<{ bpm: number; period: number; pulse: number }> {
  if (envelope.length < 4 || !(framerate > 0))
    return fail("empty-envelope", "the envelope is too short to carry a pulse");
  const { mean, sd } = meanSd(envelope);
  if (!(sd > 0)) return fail("no-pulse", "a flat envelope carries no pulse");
  const centred = envelope.map((v) => v - mean);
  const autocorrelation = (lag: number): number => {
    let acc = 0;
    for (let i = 0; i + lag < centred.length; i++) acc += centred[i] * centred[i + lag];
    return acc / (centred.length - lag);
  };
  const zero = Math.max(1e-12, autocorrelation(0));
  const lo = Math.max(2, Math.floor((framerate * 60) / maxbpm));
  const hi = Math.min(centred.length - 2, Math.ceil((framerate * 60) / minbpm));
  if (hi <= lo + 2) return fail("empty-envelope", "the envelope is too short for the requested tempo band");
  let best = -Infinity,
    bestlag = lo;
  for (let lag = lo; lag <= hi; lag++) {
    const bpm = (60 * framerate) / lag;
    const weighted = autocorrelation(lag) * Math.exp(-0.5 * Math.log2(bpm / 120) ** 2);
    if (weighted > best) {
      best = weighted;
      bestlag = lag;
    }
  }
  const raw = autocorrelation(bestlag);
  if (raw <= 0.1 * zero) return fail("no-pulse", "no usable rhythmic pulse in the envelope");
  const [a, b, c] = [autocorrelation(bestlag - 1), raw, autocorrelation(bestlag + 1)];
  const den = a - 2 * b + c;
  const period = bestlag + (den < 0 ? Math.max(-0.5, Math.min(0.5, 0.5 * ((a - c) / den))) : 0);
  return { ok: true, value: { bpm: (60 * framerate) / period, period, pulse: raw / zero } };
}

/**
 * Tracks beats over an onset envelope with dynamic programming: each beat
 * collects the local onset strength and pays a squared log-ratio penalty for
 * deviating from the period; backtracked from the strongest last-period beat.
 * Answers the beat frame indices, increasing.
 */
export function trackBeats(envelope: readonly number[], period: number): number[] {
  const n = envelope.length;
  if (n < 2 || !(period >= 1)) return [];
  const score = new Array<number>(n).fill(0);
  const back = new Array<number>(n).fill(-1);
  const lo = Math.max(1, Math.round(period * 0.5));
  const hi = Math.max(lo + 1, Math.round(period * 2));
  for (let t = 1; t < n; t++) {
    let best = 0;
    let arg = -1;
    for (let prev = Math.max(0, t - hi); prev <= t - lo; prev++) {
      const value = score[prev] - 100 * Math.log((t - prev) / period) ** 2;
      if (arg === -1 || value > best) {
        best = value;
        arg = prev;
      }
    }
    score[t] = envelope[t] + Math.max(0, best);
    back[t] = arg;
  }
  let t = Math.max(0, n - Math.ceil(period) - 1);
  for (let i = t; i < n; i++) if (score[i] > score[t]) t = i;
  const beats: number[] = [];
  while (t >= 0) {
    beats.push(t);
    t = back[t];
  }
  return beats.reverse();
}

/** Builds a grid from tracked beats (frame indices) and a tempo; code `bad-grid`. */
export function gridFromBeats(
  beatframes: readonly number[],
  framerate: number,
  bpm: number,
  beatsperbar = 4,
): BeatResult<BeatGrid> {
  if (beatframes.length < 2) return fail("bad-grid", "at least two beats are needed for a grid");
  if (!(framerate > 0) || !(bpm > 0) || !(beatsperbar >= 1))
    return fail("bad-grid", "framerate, bpm and beatsperbar must be positive");
  const beats = beatframes.map((f) => f / framerate);
  for (let i = 1; i < beats.length; i++)
    if (!(beats[i] > beats[i - 1])) return fail("bad-grid", "beat frames must be strictly increasing");
  return { ok: true, value: { bpm, beats, beatsperbar: Math.round(beatsperbar) } };
}

/** Builds a synthetic grid from a constant tempo over a duration; code `bad-grid`. */
export function identityGrid(bpm: number, duration: number, offset = 0, beatsperbar = 4): BeatResult<BeatGrid> {
  if (!(bpm > 0) || duration < 0 || offset < 0) return fail("bad-grid", "bpm must be positive and times non negative");
  const beats: number[] = [];
  for (let t = offset; t <= duration + 1e-9; t += 60 / bpm) beats.push(t);
  return { ok: true, value: { bpm, beats, beatsperbar: Math.round(beatsperbar) } };
}

/** The number of beats a grid holds. */
export function beatCount(grid: BeatGrid): number {
  return grid.beats.length;
}

/** Whether the beat at an index opens a bar (out-of-range indexes never do). */
export function isDownbeat(grid: BeatGrid, index: number): boolean {
  return index >= 0 && index < grid.beats.length && index % grid.beatsperbar === 0;
}

/** The time of beat `index` (fractional indexes interpolate; past the grid the step holds). */
export function beatTime(grid: BeatGrid, index: number): number {
  const last = grid.beats.length - 1;
  if (last < 0) return 0;
  const base = Math.min(last, Math.max(0, Math.floor(index)));
  const span =
    base + 1 <= last
      ? grid.beats[base + 1] - grid.beats[base]
      : last > 0
        ? grid.beats[last] - grid.beats[last - 1]
        : 60 / grid.bpm;
  return grid.beats[base] + (index - base) * span;
}

/** The index of the beat nearest to a time (0 when the grid is empty). */
export function nearestBeat(grid: BeatGrid, time: number): number {
  let best = 0;
  let bestd = Infinity;
  for (let i = 0; i < grid.beats.length; i++) {
    const d = Math.abs(grid.beats[i] - time);
    if (d < bestd) {
      bestd = d;
      best = i;
    }
  }
  return best;
}

/** Quantizes a time towards the nearest beat; `strength` 0..1 (1 snaps exactly); codes `bad-grid`, `bad-strength`. */
export function quantizeToGrid(time: number, grid: BeatGrid, strength: number): BeatResult<number> {
  if (grid.beats.length === 0) return fail("bad-grid", "the grid has no beats");
  if (!(strength >= 0 && strength <= 1)) return fail("bad-strength", "strength must sit in [0, 1]");
  return { ok: true, value: time + strength * (grid.beats[nearestBeat(grid, time)] - time) };
}

/**
 * The swing delay a time receives: offbeat positions (a quarter to three
 * quarters into the beat) are delayed when the swing ratio leaves 0.5; the
 * ratio is the swung midpoint in [0.5, 0.75], 0.5 is straight time.
 */
export function swingOffset(grid: BeatGrid, time: number, ratio: number): number {
  if (grid.beats.length < 2 || !(ratio >= 0.5 && ratio <= 0.75)) return 0;
  const step = grid.beats[1] - grid.beats[0];
  let i = 0;
  while (i + 1 < grid.beats.length && grid.beats[i + 1] <= time) i++;
  const p = (time - grid.beats[i]) / step;
  return p > 0.25 && p < 0.75 ? (ratio - 0.5) * step : 0;
}

/** The subdivision times of one beat (2 = eighths, 3 = triplet eighths, 4 = sixteenths). */
export function subdivideBeat(grid: BeatGrid, index: number, divisions: number): number[] {
  if (!(divisions >= 2) || index < 0 || index >= grid.beats.length) return [];
  const start = grid.beats[index];
  const end = index + 1 < grid.beats.length ? grid.beats[index + 1] : start + 60 / grid.bpm;
  return Array.from({ length: divisions }, (_, k) => start + ((end - start) * k) / divisions);
}

/** Validates a tempo map (anchors increasing, positive BPM); code `bad-tempo`. */
export function tempoMapFromAnchors(anchors: readonly TempoAnchor[]): BeatResult<TempoMap> {
  if (anchors.length === 0) return fail("bad-tempo", "a tempo map needs at least one anchor");
  for (let i = 0; i < anchors.length; i++) {
    if (!(anchors[i].bpm > 0) || anchors[i].time < 0)
      return fail("bad-tempo", "anchor bpm must be positive and time non negative");
    if (i > 0 && anchors[i].time <= anchors[i - 1].time)
      return fail("bad-tempo", "anchor times must be strictly increasing");
  }
  return { ok: true, value: { anchors: anchors.map((a) => ({ time: a.time, bpm: a.bpm, curve: a.curve ?? "hold" })) } };
}

/** The constant tempo map of a grid. */
export function gridToTempoMap(grid: BeatGrid): TempoMap {
  return { anchors: [{ time: 0, bpm: grid.bpm, curve: "hold" }] };
}

/**
 * Evaluates the tempo curve at a time: times before the first anchor hold its
 * tempo and past the last anchor the final one holds — the "clamp" policy.
 */
export function tempoAtTime(map: TempoMap, time: number): number {
  const anchors = map.anchors;
  if (time <= anchors[0].time) return anchors[0].bpm;
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (time < b.time) {
      const t = (time - a.time) / (b.time - a.time);
      if (a.curve === "exponential") return a.bpm * (b.bpm / a.bpm) ** t;
      if (a.curve === "linear") return a.bpm + (b.bpm - a.bpm) * t;
      return a.bpm;
    }
  }
  return anchors[anchors.length - 1].bpm;
}

/** Integrates the tempo map: how many beats elapse between two times (∫ bpm dt / 60). */
export function beatsElapsed(map: TempoMap, from: number, to: number): number {
  if (!(to > from)) return 0;
  let beats = 0;
  for (let i = 0; i < map.anchors.length - 1; i++) {
    const a = map.anchors[i];
    const b = map.anchors[i + 1];
    const t0 = Math.max(from, a.time);
    const t1 = Math.min(to, b.time);
    if (!(t1 > t0)) continue;
    const span = t1 - t0;
    const end = t1 >= b.time ? b.bpm : tempoAtTime(map, t1);
    beats +=
      (a.curve === "exponential" && end !== a.bpm
        ? (span * (end - a.bpm)) / Math.log(end / a.bpm)
        : (span * (a.bpm + end)) / 2) / 60;
  }
  const last = map.anchors[map.anchors.length - 1];
  if (to > last.time) beats += (Math.max(0, to - Math.max(from, last.time)) * last.bpm) / 60;
  return beats;
}

/**
 * The inverse integral: the time at which `beats` beats elapsed from `from`
 * (partial segments solved by bisection — curves are monotone). Answers
 * `from` for a zero or negative distance.
 */
export function timeAtBeat(map: TempoMap, from: number, beats: number): number {
  if (!(beats > 0)) return from;
  let remaining = beats;
  let time = from;
  for (let i = 0; i < map.anchors.length - 1; i++) {
    const b = map.anchors[i + 1];
    const start = Math.max(from, map.anchors[i].time);
    if (!(b.time > start)) continue;
    const whole = beatsElapsed(map, start, b.time);
    if (remaining <= whole) {
      let lo = start;
      let hi = b.time;
      for (let k = 0; k < 48; k++) {
        const mid = (lo + hi) / 2;
        if (beatsElapsed(map, start, mid) < remaining) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }
    remaining -= whole;
    time = b.time;
  }
  const last = map.anchors[map.anchors.length - 1];
  return time + (Math.max(0, remaining) * 60) / last.bpm;
}
