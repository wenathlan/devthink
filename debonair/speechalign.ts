/**
 * speechalign — the speech-to-grid alignment logic of debonair (root layer):
 * energy detection over RMS frames, the silence/speech threshold, phrase
 * segmentation with gap bridging and minimum length, and the fit of the
 * detected phrases onto a beat grid under stretch limits (the per-phrase
 * offsets and ratios an offline renderer executes). The clean-room pattern
 * is absorbed from the DAW speech alignment pattern (vocal comping and
 * beat-mapping pipelines: RMS windowing, a percentiled noise floor anchored
 * to the peak, greedy segment stitching, slot fitting with clamped
 * time-stretch) — re-derived here in pure TypeScript. Neighbours stay out of
 * reach on purpose: loudness owns metering, beatgrid owns the tempo map,
 * ducking owns the music side — nothing is imported, this file is
 * self-contained and deterministic (no clock, no randomness). Non-goals: no
 * actual time stretch or resampling (katexis owns DSP quality), no
 * playback, no audio decode, no transcription. Pure and multi-mode —
 * browser and node alike.
 */

/** The machine readable failure codes of the speech alignment logic. */
export type SpeechAlignErrorCode = "bad-samplerate" | "bad-params" | "empty-signal" | "no-speech";

/** The typed result every fallible alignment call answers with (errors by return). */
export type SpeechAlignResult<T> = { ok: true; value: T } | { ok: false; code: SpeechAlignErrorCode; message: string };

/** One detected phrase of the recording, in seconds (end exclusive). */
export interface Segment {
  start: number;
  end: number;
}

/** One phrase-to-grid-slot assignment of a fit plan. */
export interface FitEntry {
  /** The slot (and segment) this entry fills, by position. */
  index: number;
  /** The phrase in the recording it reads from, in seconds. */
  sourcestart: number;
  sourceend: number;
  /** The grid window it lands on, in seconds. */
  targetstart: number;
  targetend: number;
  /** The time-stretch ratio source→target after the limits were applied. */
  ratio: number;
  /** Whether the ratio had to be clamped into the stretch limits. */
  clamped: boolean;
}

/** The parameters of one speech alignment pass. */
export interface SpeechAlignParams {
  /** The sample rate of the recording, in Hz. */
  samplerate: number;
  /** The RMS analysis frame, in samples. */
  framesize: number;
  /** The hop between frames, in samples (≤ framesize). */
  hop: number;
  /** The margin (dB) the speech threshold rides above the noise floor. */
  margindb: number;
  /** The silence gap (s) below which neighbouring phrases are bridged. */
  gapseconds: number;
  /** The minimum phrase length (s) that survives trimming. */
  minseconds: number;
  /** The tempo of the grid, in BPM. */
  bpm: number;
  /** The number of grid slots offered to the phrases (≥ 2). */
  beats: number;
  /** The grid origin, in seconds. */
  offsetseconds: number;
  /** The slowest allowed stretch (≥ 0). */
  minratio: number;
  /** The fastest allowed stretch. */
  maxratio: number;
}

/** The plan a successful alignment answers. */
export interface AlignPlan {
  /** The phrases that survived the gates, in timeline order. */
  segments: Segment[];
  /** The phrase-to-slot assignments (at most one per grid slot). */
  entries: FitEntry[];
  /** The speech threshold the detection settled on, in dBFS. */
  thresholddb: number;
}

/** The dB value digital silence is read at by the floor and threshold logic. */
const SILENCEFLOOR = -120;

/** The parameters a normal pass starts from (a 46 ms RMS frame at 21 ms hop). */
export const defaultSpeechParams: SpeechAlignParams = {
  samplerate: 48000,
  framesize: 2205,
  hop: 1024,
  margindb: 12,
  gapseconds: 0.3,
  minseconds: 0.2,
  bpm: 120,
  beats: 16,
  offsetseconds: 0,
  minratio: 0.5,
  maxratio: 2,
};

/** Fails a fallible call with one machine readable code. */
function fail<T>(code: SpeechAlignErrorCode, message: string): SpeechAlignResult<T> {
  return { ok: false, code, message };
}

/** The p-quantile of a sorted series with linear interpolation (private). */
function quantile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return Number.NaN;
  const position = (p / 100) * (sorted.length - 1);
  const low = Math.floor(position);
  const high = Math.ceil(position);
  return low === high ? sorted[low] : sorted[low] + (sorted[high] - sorted[low]) * (position - low);
}

/**
 * The RMS of every analysis frame: windows of `framesize` samples advance by
 * `hop` samples while they still fit inside the signal; a signal shorter
 * than one frame answers no window.
 */
export function frameRms(samples: readonly number[], framesize: number, hop: number): number[] {
  if (!(framesize > 0) || !(hop > 0) || samples.length < framesize) return [];
  const values: number[] = [];
  for (let start = 0; start + framesize <= samples.length; start += hop) {
    let sum = 0;
    for (let i = start; i < start + framesize; i++) sum += samples[i] * samples[i];
    values.push(Math.sqrt(sum / framesize));
  }
  return values;
}

/** An RMS value in dBFS (−Infinity for digital silence). */
export function rmsToDb(rms: number): number {
  return rms > 0 ? 20 * Math.log10(rms) : Number.NEGATIVE_INFINITY;
}

/**
 * The noise floor of an envelope: the 10th percentile, where digital
 * silence counts as the silence floor (−120 dB) instead of being dropped,
 * so a recording of pure quiet still has a floor to ride on.
 */
export function noiseFloorDb(envelopedb: readonly number[]): number {
  if (envelopedb.length === 0) return Number.NEGATIVE_INFINITY;
  const mapped = envelopedb.map((v) => (Number.isFinite(v) ? v : SILENCEFLOOR)).sort((a, b) => a - b);
  return quantile(mapped, 10);
}

/**
 * The speech threshold of an envelope: the noise floor raised by the margin,
 * clamped to never sit further than 40 LU under the peak (digital silence
 * would otherwise gate everything in) and never closer than 6 LU to the
 * peak (real phrase tails would otherwise be gated out). No finite frame
 * answers −Infinity — nothing can be voiced.
 */
export function speechThresholdDb(envelopedb: readonly number[], margindb: number): number {
  const peak = envelopedb.reduce((m, v) => (Number.isFinite(v) && v > m ? v : m), Number.NEGATIVE_INFINITY);
  if (!Number.isFinite(peak)) return Number.NEGATIVE_INFINITY;
  const target = noiseFloorDb(envelopedb) + margindb;
  return Math.min(Math.max(target, peak - 40), peak - 6);
}

/** Flags every frame whose level is strictly above the threshold. */
export function voicedFlags(envelopedb: readonly number[], thresholddb: number): boolean[] {
  return envelopedb.map((v) => v > thresholddb);
}

/**
 * Stitches voiced-frame runs into phrases: a run of frames `[i..j]` becomes
 * the window from the first frame's start to the last frame's end.
 */
export function flagsToSegments(flags: readonly boolean[], frameseconds: number, hopseconds: number): Segment[] {
  const segments: Segment[] = [];
  let run = -1;
  for (let i = 0; i <= flags.length; i++) {
    const on = i < flags.length && flags[i];
    if (on && run < 0) run = i;
    if (!on && run >= 0) {
      segments.push({ start: run * hopseconds, end: (i - 1) * hopseconds + frameseconds });
      run = -1;
    }
  }
  return segments;
}

/** Bridges neighbouring phrases whose silence gap is shorter than `gapseconds`. */
export function mergeSegments(segments: readonly Segment[], gapseconds: number): Segment[] {
  const merged: Segment[] = [];
  for (const seg of segments) {
    const last = merged[merged.length - 1];
    if (last && seg.start - last.end < gapseconds) last.end = Math.max(last.end, seg.end);
    else merged.push({ start: seg.start, end: seg.end });
  }
  return merged;
}

/** Drops the phrases shorter than `minseconds` (blips, clicks, breaths). */
export function trimSegments(segments: readonly Segment[], minseconds: number): Segment[] {
  return segments.filter((s) => s.end - s.start >= minseconds);
}

/** The phrase containing a point in time, if any (end exclusive). */
export function segmentAt(segments: readonly Segment[], timeseconds: number): Segment | undefined {
  return segments.find((s) => s.start <= timeseconds && timeseconds < s.end);
}

/** The summed length of the phrases, in seconds. */
export function totalSpeechSeconds(segments: readonly Segment[]): number {
  return segments.reduce((acc, s) => acc + (s.end - s.start), 0);
}

/** The stretch ratio that fits a source length onto a target length (1 for a degenerate source). */
export function stretchRatio(sourceseconds: number, targetseconds: number): number {
  return sourceseconds > 0 ? targetseconds / sourceseconds : 1;
}

/** Clamps a stretch ratio into the limits and reports whether it moved. */
export function clampStretch(ratio: number, minratio: number, maxratio: number): { ratio: number; clamped: boolean } {
  const clamped = Math.min(maxratio, Math.max(minratio, ratio));
  return { ratio: clamped, clamped: clamped !== ratio };
}

/**
 * The times of the grid slots: `beats` evenly spaced slot starts from the
 * offset, one beat (60 / bpm seconds) apart. A non-positive tempo or no
 * slots answers an empty grid.
 */
export function beatGridTimes(bpm: number, beats: number, offsetseconds = 0): number[] {
  if (!(bpm > 0) || beats < 1) return [];
  const step = 60 / bpm;
  return Array.from({ length: Math.floor(beats) }, (_, i) => offsetseconds + i * step);
}

/**
 * Fits the phrases onto the grid in order: phrase *i* fills slot *i* (the
 * slot length is the gap to the next slot start; the last slot reuses the
 * previous length, so a grid of fewer than two slots fits nothing). Each
 * entry carries the stretch ratio the fit needs, clamped into the limits,
 * and whether the clamp had to bite.
 */
export function fitPlan(
  segments: readonly Segment[],
  slots: readonly number[],
  minratio: number,
  maxratio: number,
): FitEntry[] {
  if (slots.length < 2) return [];
  const entries: FitEntry[] = [];
  const count = Math.min(segments.length, slots.length);
  for (let i = 0; i < count; i++) {
    const slotseconds = i < slots.length - 1 ? slots[i + 1] - slots[i] : slots[i] - slots[i - 1];
    const source = segments[i];
    const fit = clampStretch(stretchRatio(source.end - source.start, slotseconds), minratio, maxratio);
    entries.push({
      index: i,
      sourcestart: source.start,
      sourceend: source.end,
      targetstart: slots[i],
      targetend: slots[i] + slotseconds,
      ratio: fit.ratio,
      clamped: fit.clamped,
    });
  }
  return entries;
}

/** The render offset of every entry: where the phrase lands minus where it lives. */
export function planOffsets(entries: readonly FitEntry[]): number[] {
  return entries.map((e) => e.targetstart - e.sourcestart);
}

/** The worst stretch the plan asks for (1 — no stretch — for an empty plan). */
export function maxStretchRatio(entries: readonly FitEntry[]): number {
  if (entries.length === 0) return 1;
  return entries.reduce((m, e) => Math.max(m, e.ratio), Number.NEGATIVE_INFINITY);
}

/**
 * The full offline alignment of a recording: RMS framing, thresholding,
 * phrase detection (gap bridged, blips trimmed) and the grid fit under the
 * stretch limits. Codes: `bad-samplerate`, `bad-params`, `empty-signal`,
 * `no-speech`.
 */
export function alignSpeech(samples: readonly number[], params: SpeechAlignParams): SpeechAlignResult<AlignPlan> {
  if (!(params.samplerate > 0)) return fail("bad-samplerate", "the sample rate must be positive");
  if (samples.length === 0) return fail("empty-signal", "the recording has no samples");
  if (!(params.framesize > 0) || !(params.hop > 0) || params.hop > params.framesize) {
    return fail("bad-params", "the analysis frame must be positive with a hop inside it");
  }
  if (!(params.bpm > 0) || params.beats < 2)
    return fail("bad-params", "the grid needs a positive tempo and at least two slots");
  if (!(params.minratio > 0) || params.maxratio < params.minratio) {
    return fail("bad-params", "the stretch limits must be positive with a minimum not above the maximum");
  }
  const envelopedb = frameRms(samples, params.framesize, params.hop).map(rmsToDb);
  if (!envelopedb.some(Number.isFinite)) return fail("no-speech", "the recording has no measurable speech energy");
  const thresholddb = speechThresholdDb(envelopedb, params.margindb);
  const detected = flagsToSegments(
    voicedFlags(envelopedb, thresholddb),
    params.framesize / params.samplerate,
    params.hop / params.samplerate,
  );
  const segments = trimSegments(mergeSegments(detected, params.gapseconds), params.minseconds);
  if (segments.length === 0) return fail("no-speech", "no phrase survives the gap bridge and minimum length gates");
  const slots = beatGridTimes(params.bpm, params.beats, params.offsetseconds);
  return {
    ok: true,
    value: { segments, entries: fitPlan(segments, slots, params.minratio, params.maxratio), thresholddb },
  };
}
