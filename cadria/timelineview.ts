// # timelineview — the pure view-model of the cadria edit surface, housed at
// the cadria root beside timelineedit (the algebra) and timeticks (the
// clock). It owns everything the edit UI needs that is pure math: the
// tick↔pixel mapping, the ruler step choice, the clip geometry, the edit
// points the playhead snaps to, the frame-quantized playback advance and the
// stock slate bin the surface ships as its honest material. No DOM, no
// React, no storage: every function takes its inputs as parameters and
// answers by return type, so the node runner can pin the geometry the same
// way timelineedit.test pins the algebra. The screen (Sol/edit/edit.tsx)
// folds real edits through timelineedit and reads every number it paints
// from here — the view never invents time.

import { type EditIssue, type EditItem, type EditTrack, itemend } from "./timelineedit.ts";
import {
  addticks,
  clampticks,
  type FrameRate,
  formattimecode,
  MAX_TICKS,
  snaptick,
  TICKS_PER_SECOND,
  ticksfromseconds,
} from "./timeticks.ts";

// ---- the tick↔pixel mapping -------------------------------------------------

/** the zoom ladder of the edit surface, in px per second (index-driven, the
 * toolbar zoom in/out walks this list). */
export const ZOOM_LEVELS: readonly number[] = [8, 16, 32, 64, 128, 256];

/** the zoom level the surface opens at (64 px/s ≈ one 1080-frame a pixel-step). */
export const DEFAULT_ZOOM_INDEX = 3;

/** converts a tick position to a horizontal pixel offset at `pxPerSecond`. */
export function ticktopx(t: number, pxPerSecond: number): number {
  if (!Number.isFinite(t) || !Number.isFinite(pxPerSecond) || pxPerSecond <= 0) return 0;
  return (t / TICKS_PER_SECOND) * pxPerSecond;
}

/** converts a horizontal pixel offset back to ticks (floored — pixels are
 * coarser than ticks, never the reverse). */
export function pxtotick(px: number, pxPerSecond: number): number {
  if (!Number.isFinite(px) || !Number.isFinite(pxPerSecond) || pxPerSecond <= 0) return 0;
  const t = Math.floor((px / pxPerSecond) * TICKS_PER_SECOND);
  return clampticks(t, 0, MAX_TICKS);
}

// ---- the ruler -----------------------------------------------------------------

/** the candidate major steps of the ruler, in seconds (the classic NLE ladder:
 * halves, ones, fives, tens, thirties, minutes, ten-minutes). */
const RULER_STEPS: readonly number[] = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];

/** one ruler tick: its tick position and whether it carries a label. */
export type RulerTick = { tick: number; major: boolean; label: string };

/** the px spacing a major step must clear to stay readable. */
const MAJOR_MIN_PX = 72;

/** the ticks the ruler draws across `[t0, t1]`: the smallest ladder step whose
 * majors clear 72 px, minors at major/5, labels only on majors (SMPTE via
 * timeticks). Deterministic and bounded (≤ 1600 draws) so a broken zoom can
 * never flood the DOM. */
export function rulerticks(t0: number, t1: number, rate: FrameRate, pxPerSecond: number): RulerTick[] {
  const from = Math.max(0, Math.min(t0, t1));
  const to = Math.max(from, t1);
  if (pxPerSecond <= 0 || to <= from) return [];
  let seconds = RULER_STEPS[RULER_STEPS.length - 1];
  for (const candidate of RULER_STEPS) {
    if (candidate * pxPerSecond >= MAJOR_MIN_PX) {
      seconds = candidate;
      break;
    }
  }
  const majorTick = Math.round(seconds * TICKS_PER_SECOND);
  const minorTick = Math.max(1, Math.round((seconds / 5) * TICKS_PER_SECOND));
  const cap = 1600;
  const ticks: RulerTick[] = [];
  const firstMinor = Math.ceil(from / minorTick) * minorTick;
  for (let tick = firstMinor; tick <= to && ticks.length < cap; tick += minorTick) {
    const major = tick % majorTick === 0;
    ticks.push({ tick, major, label: major ? formattimecode(tick, rate) : "" });
  }
  return ticks;
}

// ---- clip geometry --------------------------------------------------------------

/** the on-screen box of a clip: left offset and width in px, the width
 * floored at 2 px so a sub-pixel clip stays grabbable. */
export function clipgeometry(item: EditItem, pxPerSecond: number): { left: number; width: number } {
  const left = ticktopx(item.start, pxPerSecond);
  const width = Math.max(2, ticktopx(item.duration, pxPerSecond));
  return { left, width };
}

/** the media-window box inside a clip face: where the source in point sits as
 * a 0..1 fraction when the source duration is known, else 0. */
export function mediawindow(item: EditItem, mediaDuration: number | null): { from: number; to: number } {
  if (mediaDuration === null || mediaDuration <= 0) return { from: 0, to: 1 };
  const from = clampticks(item.sourceIn, 0, mediaDuration) / mediaDuration;
  const span = Math.round(item.duration * item.speed);
  const to = clampticks(item.sourceIn + span, 0, mediaDuration) / mediaDuration;
  return { from, to: Math.max(from, to) };
}

// ---- the sequence -----------------------------------------------------------------

/** the exclusive end of the sequence: the furthest item end, or 0 on an
 * empty track. */
export function sequenceend(track: EditTrack): number {
  return track.items.reduce((max, it) => Math.max(max, itemend(it)), 0);
}

/** the sorted unique edit points of a track (0, every start, every end) — the
 * stops the prev/next transport keys walk and the playhead magnet snaps to. */
export function editpoints(track: EditTrack): number[] {
  const points = new Set<number>([0]);
  for (const it of track.items) {
    points.add(it.start);
    points.add(itemend(it));
  }
  return [...points].sort((a, b) => a - b);
}

/** the nearest edit point within `threshold` ticks of `t`, or null — the
 * playhead magnet. ties answer the earlier point (the cut behind the
 * playhead wins, the way a reference editor magnet behaves). */
export function snapedit(track: EditTrack, t: number, threshold: number): number | null {
  if (!(threshold > 0)) return null;
  let best: number | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const point of editpoints(track)) {
    const distance = Math.abs(point - t);
    if (distance > threshold) continue;
    if (best === null || distance < bestDistance) {
      best = point;
      bestDistance = distance;
    }
  }
  return best;
}

/** the playhead advanced by `deltaMs` of wall clock, frame-quantized when
 * `quantize` (the snap toggle rides playback too), saturated at MAX_TICKS. */
export function advanceplayhead(rate: FrameRate, t: number, deltaMs: number, quantize: boolean): number {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return quantize ? snaptick(rate, t, "nearest") : t;
  const next = addticks(t, Math.round((deltaMs / 1000) * TICKS_PER_SECOND));
  return clampticks(quantize ? snaptick(rate, next, "nearest") : next, 0, MAX_TICKS);
}

/** the visible tick window for a scroll offset and viewport width. */
export function visiblewindow(scrollPx: number, widthPx: number, pxPerSecond: number): { from: number; to: number } {
  const from = pxtotick(Math.max(0, scrollPx), pxPerSecond);
  const to = pxtotick(Math.max(0, scrollPx) + Math.max(0, widthPx), pxPerSecond);
  return { from, to: Math.max(from, to) };
}

// ---- the refusal vocabulary -----------------------------------------------------

/** the honest text of an edit refusal (the algebra's issue vocabulary, one
 * line each — the surface never lies about why an edit was kept out). */
export function refusalnote(error: EditIssue): string {
  const lines: Readonly<Record<EditIssue, string>> = {
    locked: "the track is locked — unlock it to edit.",
    "no-item": "no clip answers that id.",
    "sync-lock-conflict": "a sync-locked track holds material there.",
    "no-handles": "the trim ran out of master handles — kept.",
    "too-short": "the edit would leave less than one frame — kept.",
    overlap: "the neighbour blocks the move — kept.",
    nothing: "nothing to edit there.",
  };
  return lines[error];
}

// ---- the stock bin -----------------------------------------------------------------

/** one slate of the stock bin: a synthetic clip the surface ships in code —
 * the honest material of the edit surface (like the intro fixtures: no
 * upload, no network, no pretend footage). */
export type BinSlate = {
  /** the bin id (stable, index-derived) */
  id: string;
  /** the lowercase name the clip face carries */
  name: string;
  /** the source duration in ticks */
  duration: number;
  /** the one-line detail the bin row reads */
  detail: string;
};

/** the stock slates, in bin order (name · seconds · what they are). */
const SLATES: readonly { name: string; seconds: number; detail: string }[] = [
  { name: "tone glass", seconds: 4, detail: "pure sine glass — titles, pauses" },
  { name: "static field", seconds: 6, detail: "noise floor — texture beds" },
  { name: "pulse slate", seconds: 3, detail: "kicked pulse — beat cuts" },
  { name: "drift band", seconds: 8, detail: "slow band — b-roll spine" },
  { name: "edge marker", seconds: 2, detail: "one-frame flash — hard cuts" },
];

/** the stock bin: deterministic slates with exact tick durations. */
export function stockbin(): readonly BinSlate[] {
  return SLATES.map((slate, index) => ({
    id: `slate-${String(index + 1).padStart(2, "0")}`,
    name: slate.name,
    duration: ticksfromseconds(slate.seconds),
    detail: slate.detail,
  }));
}

/** the face colors of the bin (the rose ramp only — the surface paints its
 * material in the house hues, never the banned defaults). */
export const SLATE_FACES: readonly string[] = ["#f472b6", "#ec4899", "#f9a8d4", "#db2777", "#f78dc3"];

/** the face color of the bin index (wraps; a damaged index answers the first
 * face so the surface can never paint an undefined fill). */
export function slateface(index: number): string {
  if (!Number.isFinite(index)) return SLATE_FACES[0];
  return SLATE_FACES[((index % SLATE_FACES.length) + SLATE_FACES.length) % SLATE_FACES.length];
}
