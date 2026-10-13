// # versawaseslices — the sliced-render planner of the versawase engine (the
// F-CAD-027 doctrine: the render is cut into fixed seconds slices, the preview
// rides the same slice grid as the final, and the assembly is deterministic).
// Library-grade and pure: a caller brings the duration, the frame rate and the
// slice length; the planner answers the frame-aligned slices with their tick
// windows, the honest wall-clock estimate across parallel workers and the
// weighted progress readout. Frame math composes on the timeticks primitives
// (frameratefromf64, frameat, tickofframe) — never re-derived here.

import {
  type FrameRate,
  frameratefromf64,
  frameat,
  tickofframe,
  ticksfromseconds,
} from "./timeticks.ts";

/** One render slice: a frame-aligned window of the timeline with its tick span. */
export interface RenderSlice {
  /** 0-based position in the assembly order */
  index: number;
  /** first frame of the slice (inclusive, timeline grid) */
  fromFrame: number;
  /** one past the last frame of the slice (exclusive) */
  toFrame: number;
  /** exact tick at fromFrame */
  fromTick: number;
  /** exact tick at toFrame */
  toTick: number;
  /** frame count the slice renders */
  frames: number;
}

/** Options of the slice planner; every field carries an engine default. */
export interface SlicePlanOptions {
  /** total media duration in seconds (> 0) */
  durationSeconds: number;
  /** frames per second: a FrameRate or a float (resolved through timeticks) */
  fps?: FrameRate | number;
  /** target slice length in seconds (default 10 — the F-CAD-027 doctrine) */
  sliceSeconds?: number;
  /** cap of slices before the planner widens them (default unlimited) */
  maxSlices?: number;
}

/** Plans the frame-aligned render slices of one timeline (empty for zero duration). */
export function planSlices(options: SlicePlanOptions): readonly RenderSlice[] {
  const { durationSeconds } = options;
  if (!(durationSeconds > 0)) return [];
  const rate = resolveRate(options.fps);
  const sliceSeconds = options.sliceSeconds !== undefined ? options.sliceSeconds : 10;
  if (!(sliceSeconds > 0)) return [];
  const totalFrames = Math.max(1, frameat(rate, ticksfromseconds(durationSeconds)));
  let sliceFrames = Math.max(1, Math.round(sliceSeconds * (rate.num / rate.den)));
  if (options.maxSlices !== undefined && options.maxSlices >= 1) {
    const widest = Math.ceil(totalFrames / options.maxSlices);
    if (widest > sliceFrames) sliceFrames = widest;
  }
  const slices: RenderSlice[] = [];
  for (let from = 0; from < totalFrames; from += sliceFrames) {
    const to = Math.min(from + sliceFrames, totalFrames);
    slices.push({
      index: slices.length,
      fromFrame: from,
      toFrame: to,
      fromTick: tickofframe(rate, from),
      toTick: tickofframe(rate, to),
      frames: to - from,
    });
  }
  return slices;
}

/** The slice that owns a timeline instant (preview seek rides the same grid as the final). */
export function sliceAt(slices: readonly RenderSlice[], seconds: number): RenderSlice | undefined {
  if (!(seconds >= 0) || slices.length === 0) return undefined;
  const rate = slicesRate(slices);
  const frame = frameat(rate, ticksfromseconds(seconds));
  const last = slices[slices.length - 1];
  if (frame >= last.toFrame) return undefined;
  for (const slice of slices) {
    if (frame >= slice.fromFrame && frame < slice.toFrame) return slice;
  }
  return undefined;
}

/** Aggregated render progress (0..1), weighted by frames — never by slice count. */
export function sliceProgress(slices: readonly RenderSlice[], completedIndexes: readonly number[]): number {
  if (slices.length === 0) return 0;
  const total = slices.reduce((sum, slice) => sum + slice.frames, 0);
  if (total === 0) return 0;
  const done = new Set(completedIndexes);
  const finished = slices.reduce((sum, slice) => (done.has(slice.index) ? sum + slice.frames : sum), 0);
  return finished / total;
}

/**
 * The honest wall-clock estimate across parallel workers: slices ride the
 * assembly order round-robin, every worker pays its own frames at
 * secondsPerFrame, and the render finishes when the slowest worker does.
 */
export function estimateWallClock(
  slices: readonly RenderSlice[],
  secondsPerFrame: number,
  workers: number,
): number {
  if (slices.length === 0 || !(secondsPerFrame >= 0)) return 0;
  const lanes = Math.max(1, Math.floor(workers));
  const loads = Array.from({ length: lanes }, () => 0);
  slices.forEach((slice, at) => {
    const lane = at % lanes;
    loads[lane] += slice.frames * secondsPerFrame;
  });
  return Math.max(...loads, 0);
}

/** Recovers the frame rate a plan was built against (from the first slice tick span). */
function slicesRate(slices: readonly RenderSlice[]): FrameRate {
  const first = slices[0];
  const span = first.frames > 0 ? first.toTick - first.fromTick : 0;
  const fps = span > 0 ? first.frames / (span / 254_016_000_000) : 24;
  return frameratefromf64(fps);
}

/** Resolves the caller fps into a FrameRate (number rides frameratefromf64). */
function resolveRate(fps?: FrameRate | number): FrameRate {
  if (typeof fps === "number") return frameratefromf64(fps);
  return fps ?? frameratefromf64(24);
}
