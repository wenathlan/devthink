// # ducking — the sidechain ducking logic of debonair (root layer): level
// envelopes, activity regions, the per-sample compressor gain (threshold,
// ratio, soft knee, attack, release, hold) and the volume keyframes an
// offline auto-duck renders into a music clip. The clean-room pattern is
// absorbed from filmcraft's audio-dsp/ducking.rs (RMS envelope over prefix
// sums, activity with blip removal and gap bridging, keyframes with merged
// ramps) with the classic desk compressor curve. It is the processing par of
// mixergraph — the dB conversion is imported from there, never duplicated.
// Non-goals: no routing, no buses, no playback, no audio decode. Pure and
// multi-mode — the same call runs in the browser and in node (the unit tests).

import { dbToLinear, linearToDb } from "./mixergraph.ts";

/** The machine readable failure codes of the ducking logic. */
export type DuckingErrorCode = "bad-params" | "bad-samplerate" | "empty-signal";

/** The typed result every fallible ducking call answers with (errors by return). */
export type DuckingResult<T> = { ok: true; value: T } | { ok: false; code: DuckingErrorCode; message: string };

/** The compressor parameters of a ducking processor. */
export interface DuckingParams {
  /** The level (dBFS) above which the duck engages. */
  thresholddb: number;
  /** The compression ratio above the threshold (>= 1). */
  ratio: number;
  /** The soft-knee width in dB (0 = hard knee). */
  kneedb: number;
  /** The attack time in seconds (level rise onto the gain reduction). */
  attackseconds: number;
  /** The release time in seconds (the gain coming back). */
  releaseseconds: number;
  /** The hold time in seconds before the release may start. */
  holdseconds: number;
}

/** One span of trigger activity, in seconds. */
export interface DuckingRegion {
  /** The region start in seconds (>= 0). */
  start: number;
  /** The region end in seconds (> start). */
  end: number;
}

/** The running state of the per-sample envelope follower. */
export interface FollowerState {
  /** The follower level as a linear amplitude. */
  level: number;
  /** The remaining hold samples before the release may start. */
  holdremaining: number;
  /** The last gain the follower answered, in dB. */
  gaindb: number;
}

/** The level floor (dBFS) silence reads as. */
export const FLOORDB = -120;

/** The empty follower state. */
export function followerInitial(): FollowerState {
  return { level: 0, holdremaining: 0, gaindb: 0 };
}

/** Fails a fallible call with one machine readable code. */
function fail<T>(code: DuckingErrorCode, message: string): DuckingResult<T> {
  return { ok: false, code, message };
}

/** Validates the compressor parameters and the sample rate. */
export function validateDucking(params: DuckingParams, samplerate: number): DuckingResult<number> {
  if (!(samplerate > 0)) return fail("bad-samplerate", "the sample rate must be positive");
  if (!Number.isFinite(params.thresholddb) || params.thresholddb > 0)
    return fail("bad-params", "the threshold must be finite and at or below 0 dBFS");
  if (!(params.ratio >= 1)) return fail("bad-params", "the ratio must be 1 or above");
  if (params.kneedb < 0 || params.attackseconds < 0 || params.releaseseconds < 0 || params.holdseconds < 0)
    return fail("bad-params", "knee, attack, release and hold must be non negative");
  return { ok: true, value: 0 };
}

/** The Essential-Sound style sensitivity (0..10) → detection threshold in dBFS. */
export function sensitivityToThreshold(sensitivity: number): number {
  return -20 - 4 * Math.max(0, Math.min(10, sensitivity));
}

/**
 * RMS level (dBFS) per hop: entry `k` is the RMS of the window centred on
 * `k · hop` (clipped at the edges), power averaged over the given channels;
 * silence reads as `FLOORDB`.
 */
export function rmsEnvelopeDb(
  channels: readonly number[][],
  samplerate: number,
  hopseconds: number,
  windowseconds: number,
): number[] {
  const len = channels.length > 0 ? Math.min(...channels.map((c) => c.length)) : 0;
  if (len === 0) return [];
  const hop = Math.max(1, Math.round(hopseconds * samplerate));
  const half = Math.max(1, Math.round((windowseconds * samplerate) / 2));
  const prefix = new Array<number>(len + 1).fill(0);
  for (let i = 0; i < len; i++) {
    let acc = 0;
    for (const channel of channels) acc += channel[i] * channel[i];
    prefix[i + 1] = prefix[i] + acc / channels.length;
  }
  const out: number[] = [];
  for (let k = 0; k * hop < len; k++) {
    const a = Math.max(0, k * hop - half);
    const b = Math.min(len, k * hop + half);
    const ms = Math.max(0, prefix[b] - prefix[a]) / Math.max(1, b - a);
    out.push(ms <= 1e-12 ? FLOORDB : Math.max(FLOORDB, 10 * Math.log10(ms)));
  }
  return out;
}

/** The regions where the envelope exceeds the threshold, gaps shorter than `bridgeseconds` merged and spans shorter than `minonseconds` dropped. */
export function activityRegions(
  envelopedb: readonly number[],
  hopseconds: number,
  thresholddb: number,
  minonseconds: number,
  bridgeseconds: number,
): DuckingRegion[] {
  const raw: DuckingRegion[] = [];
  let start = -1;
  for (let k = 0; k <= envelopedb.length; k++) {
    const on = k < envelopedb.length && envelopedb[k] > thresholddb;
    if (on && start < 0) start = k;
    if (!on && start >= 0) {
      raw.push({ start: start * hopseconds, end: k * hopseconds });
      start = -1;
    }
  }
  const merged: DuckingRegion[] = [];
  for (const region of raw) {
    const last = merged[merged.length - 1];
    if (last && region.start - last.end < bridgeseconds - 1e-9) last.end = region.end;
    else merged.push({ start: region.start, end: region.end });
  }
  return merged.filter((r) => r.end - r.start >= minonseconds - 1e-9);
}

/** Unions overlapping or touching regions (sorted by start). */
export function mergeRegions(regions: readonly DuckingRegion[]): DuckingRegion[] {
  const sorted = [...regions].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: DuckingRegion[] = [];
  for (const region of sorted) {
    const last = out[out.length - 1];
    if (last && region.start <= last.end) last.end = Math.max(last.end, region.end);
    else out.push({ start: region.start, end: region.end });
  }
  return out;
}

/** The region containing a time, or null when the time sits in open air. */
export function regionAt(regions: readonly DuckingRegion[], time: number): DuckingRegion | null {
  for (const region of regions) if (time >= region.start && time < region.end) return region;
  return null;
}

/** The total ducked time of a region set, in seconds. */
export function totalDuckTime(regions: readonly DuckingRegion[]): number {
  return regions.reduce((a, r) => a + Math.max(0, r.end - r.start), 0);
}

/**
 * The static compressor curve: the gain (dB) a level receives. Below the
 * knee nothing happens, inside the knee a quadratic ramp takes over, above
 * it the reduction grows with `1 - 1/ratio` per dB of overshoot.
 */
export function staticGainDb(leveldb: number, thresholddb: number, ratio: number, kneedb: number): number {
  const over = leveldb - thresholddb;
  const slope = 1 - 1 / Math.max(1, ratio);
  if (kneedb <= 0 || over <= -kneedb / 2) return over >= 0 ? -slope * over : 0;
  if (over >= kneedb / 2) return -slope * over;
  const knee = over + kneedb / 2;
  return (-slope * knee * knee) / (2 * kneedb);
}

/** The per-sample one-pole smoothing coefficient of an attack or release time. */
export function smoothingCoefficient(seconds: number, samplerate: number): number {
  if (!(seconds > 0) || !(samplerate > 0)) return 1;
  return Math.exp(-1 / (seconds * samplerate));
}

/**
 * Advances the envelope follower by one sample: the level rises through the
 * attack coefficient, holds for `holdseconds` and falls through the release
 * coefficient; the gain is the static curve applied to the level.
 */
export function followerStep(
  state: FollowerState,
  sample: number,
  params: DuckingParams,
  samplerate: number,
): FollowerState {
  const magnitude = Math.abs(sample);
  let level = state.level;
  let holdremaining = state.holdremaining;
  if (magnitude > level) {
    level += (1 - smoothingCoefficient(params.attackseconds, samplerate)) * (magnitude - level);
    holdremaining = Math.round(params.holdseconds * samplerate);
  } else if (holdremaining > 0) {
    holdremaining--;
  } else {
    level += (1 - smoothingCoefficient(params.releaseseconds, samplerate)) * (magnitude - level);
  }
  const gaindb = staticGainDb(linearToDb(level), params.thresholddb, params.ratio, params.kneedb);
  return { level, holdremaining, gaindb };
}

/**
 * Runs the follower over a whole sidechain block and answers the per-sample
 * gain in dB (0 when open, negative when ducking) — the render-ready curve.
 */
export function followerGainDb(
  sidechain: readonly number[],
  samplerate: number,
  params: DuckingParams,
): DuckingResult<number[]> {
  const valid = validateDucking(params, samplerate);
  if (!valid.ok) return valid;
  if (sidechain.length === 0) return fail("empty-signal", "the sidechain is empty");
  let state = followerInitial();
  const gains: number[] = [];
  for (const sample of sidechain) {
    state = followerStep(state, sample, params, samplerate);
    gains.push(state.gaindb);
  }
  return { ok: true, value: gains };
}

/** The per-sample gain in linear amplitude (the mix multiply), or the error. */
export function followerGainLinear(
  sidechain: readonly number[],
  samplerate: number,
  params: DuckingParams,
): DuckingResult<number[]> {
  const gains = followerGainDb(sidechain, samplerate, params);
  return gains.ok ? { ok: true, value: gains.value.map(dbToLinear) } : gains;
}

/**
 * The volume keyframes `(time, level)` that duck by `reducedb` under each
 * region: ramp from `basedb` at `start − fade` down to `basedb − reducedb`
 * at `start`, hold, ramp back up at `end`. Ramps that would overlap are
 * merged (the level stays ducked between the regions) and everything is
 * clamped to the clip; times are strictly increasing, no regions → none.
 */
export function duckKeyframes(
  regions: readonly DuckingRegion[],
  clipstart: number,
  clipend: number,
  basedb: number,
  reducedb: number,
  fadeseconds: number,
): Array<[number, number]> {
  const fade = Math.max(fadeseconds, 1e-3);
  const duckedlevel = basedb - Math.abs(reducedb);
  const clipped = [...regions]
    .filter((r) => r.end > r.start && r.end > clipstart && r.start < clipend)
    .map((r) => ({ start: Math.max(clipstart, r.start), end: Math.min(clipend, r.end) }));
  const sorted = mergeRegions(clipped);
  // the ramps would overlap when the open gap is shorter than the two fades
  const spans: DuckingRegion[] = [];
  for (const region of sorted) {
    const last = spans[spans.length - 1];
    if (last && region.start - last.end < 2 * fade) last.end = region.end;
    else spans.push({ start: region.start, end: region.end });
  }
  if (spans.length === 0) return [];
  const frames: Array<[number, number]> = [];
  let cursor = clipstart;
  let duckedsofar = false;
  for (const span of spans) {
    const dipstart = span.start - fade;
    if (!duckedsofar) {
      const p = dipstart < clipstart ? Math.min(1, (clipstart - dipstart) / fade) : 0;
      frames.push([clipstart, basedb + (duckedlevel - basedb) * p]);
    } else {
      const recovery = Math.min(cursor + fade, clipend);
      const p = (recovery - cursor) / fade;
      frames.push([recovery, duckedlevel + (basedb - duckedlevel) * p]);
    }
    if (dipstart > frames[frames.length - 1][0]) frames.push([dipstart, basedb]);
    frames.push([span.start, duckedlevel]);
    if (span.end < clipend) frames.push([span.end, duckedlevel]);
    cursor = span.end;
    duckedsofar = true;
  }
  const recovery = Math.min(cursor + fade, clipend);
  const p = cursor < clipend ? (recovery - cursor) / fade : 0;
  frames.push([recovery, duckedlevel + (basedb - duckedlevel) * p]);
  return frames.filter(([t], i) => i === 0 || t > frames[i - 1][0]);
}

/** The ducked level (dB) at a time under a keyframe list (edges hold). */
export function levelAtTime(keyframes: ReadonlyArray<[number, number]>, time: number): number {
  if (keyframes.length === 0) return 0;
  if (time <= keyframes[0][0]) return keyframes[0][1];
  for (let i = 1; i < keyframes.length; i++) {
    const [t1, v1] = keyframes[i];
    const [t0, v0] = keyframes[i - 1];
    if (time <= t1) return v0 + ((v1 - v0) * (time - t0)) / Math.max(1e-12, t1 - t0);
  }
  return keyframes[keyframes.length - 1][1];
}

/**
 * The offline auto-duck pipeline: RMS envelope → activity regions under the
 * params threshold (250 ms minimum span, 500 ms bridge). The keyframes of
 * `duckKeyframes` are what the render applies to the music clip.
 */
export function autoDuckRegions(
  sidechain: readonly number[],
  samplerate: number,
  params: DuckingParams,
): DuckingResult<DuckingRegion[]> {
  const valid = validateDucking(params, samplerate);
  if (!valid.ok) return valid;
  if (sidechain.length === 0) return fail("empty-signal", "the sidechain is empty");
  const envelope = rmsEnvelopeDb([sidechain], samplerate, 0.01, 0.04);
  return { ok: true, value: activityRegions(envelope, 0.01, params.thresholddb, 0.25, 0.5) };
}
