/**
 * timeline — consolidated timeline engine logics of the cadria family.
 * @module timeline
 * @family wave/logicfold2
 * One keyed file per family: the former variant arms (timelineedit, timelineview)
 * retired into this seat with every export preserved under the same name.
 */

import { FrameRate, MAX_TICKS, TICKS_PER_SECOND, addticks, clampticks, formattimecode, snaptick, ticksfromseconds } from "./timeticks.ts";

/* ===== block: timelineedit ===== */
// # timelineedit — the edit algebra of the cadria timeline, housed at the
// cadria root beside timeticks. It owns the track-item operations a video
// editor needs: overwrite, insert, lift (gap stays), extract (ripple, gap
// closes), split, edge trims limited by media handles, roll, slip, slide and
// rate stretch — plus the sync-lock primitives (`shiftfrom`, `syncconflict`)
// so the caller cascades an insert/extract to every sync-locked track the way
// the reference editor does. Semantics follow the Premiere model: insert
// pushes right, trims never cross neighbours, and source time is media time,
// so trims and splits never move keyframes. The clean-room pattern is
// absorbed from filmcraft (storytold/filmcraft, crates/edit — a project-class
// clean-room), re-derived natively in pure TypeScript: every function takes
// the track as a parameter, validates first, answers the new track or an
// EditIssue by return type (never a throw), and never mutates its input.
// Non-goals: no UI/selection state, no rendering, no keyframe storage, no
// linked audio/video graph, no transitions. Exports: 15 functions, 6 types.

/** one clip on a track: timeline span plus the media window it shows. */
export type EditItem = {
  /** unique inside a track (caller-owned; split/shift allocate max+1) */
  id: number;
  /** timeline start, in ticks */
  start: number;
  /** timeline duration, in ticks */
  duration: number;
  /** earliest media tick the item shows (its In point) */
  sourceIn: number;
  /** playback rate: media ticks consumed per timeline tick (1 = native) */
  speed: number;
};

/** one track: locked tracks reject every edit, sync-locked tracks cascade. */
export type EditTrack = { id: number; locked: boolean; syncLock: boolean; items: EditItem[] };

/** a half-open tick span [start, start + duration). */
export type EditRange = { start: number; duration: number };

/** every way an edit can honestly refuse (by return type, never a throw). */
export type EditIssue =
  | "locked"
  | "no-item"
  | "sync-lock-conflict"
  | "no-handles"
  | "too-short"
  | "overlap"
  | "nothing";

/** either the new track (or payload) or the reason the edit did not happen. */
export type EditOutcome<T> = { ok: true; value: T } | { ok: false; error: EditIssue };

/** media window an item may draw from: handles for trims, minimum length. */
export type EditLimits = { mediaStart?: number; mediaDuration?: number | null; minDuration?: number };

type Resolved = { mediaStart: number; mediaDuration: number | null; minDuration: number };

function resolve(l?: EditLimits): Resolved {
  return { mediaStart: l?.mediaStart ?? 0, mediaDuration: l?.mediaDuration ?? null, minDuration: l?.minDuration ?? 1 };
}
function ok<T>(value: T): EditOutcome<T> {
  return { ok: true, value };
}
function refuse(error: EditIssue): EditOutcome<never> {
  return { ok: false, error };
}
function byStart(a: EditItem, b: EditItem): number {
  return a.start - b.start || a.id - b.id;
}

/** exclusive timeline end of an item. */
export function itemend(item: EditItem): number {
  return item.start + item.duration;
}

/** the track with items ordered by start (a normalized copy). */
export function sorttrack(track: EditTrack): EditTrack {
  return { ...track, items: [...track.items].sort(byStart) };
}

/** the item strictly covering tick `t`, or null. */
export function itemat(track: EditTrack, t: number): EditItem | null {
  return track.items.find((it) => it.start <= t && t < itemend(it)) ?? null;
}

function nextid(track: EditTrack): number {
  return track.items.reduce((m, it) => Math.max(m, it.id), -1) + 1;
}

function finditem(track: EditTrack, id: number): EditItem | null {
  return track.items.find((it) => it.id === id) ?? null;
}

function neighbors(track: EditTrack, item: EditItem): { prevEnd: number | null; nextStart: number | null } {
  let prevEnd: number | null = null;
  let nextStart: number | null = null;
  const end = itemend(item);
  for (const other of track.items) {
    if (other.id === item.id) continue;
    const oend = itemend(other);
    if (oend <= item.start && (prevEnd === null || oend > prevEnd)) prevEnd = oend;
    if (other.start >= end && (nextStart === null || other.start < nextStart)) nextStart = other.start;
  }
  return { prevEnd, nextStart };
}

/** whether the track holds any material inside the range — the sync-lock test. */
export function syncconflict(track: EditTrack, range: EditRange): boolean {
  const end = range.start + range.duration;
  return track.items.some((it) => it.start < end && itemend(it) > range.start);
}

/** removes the span, keeping the outside pieces of partial overlaps (shared by lift/overwrite). */
function cutspan(items: EditItem[], start: number, end: number): { kept: EditItem[]; touched: boolean } {
  const kept: EditItem[] = [];
  let touched = false;
  for (const it of items) {
    const e = itemend(it);
    if (e <= start || it.start >= end) {
      kept.push(it);
      continue;
    }
    touched = true;
    if (it.start < start) kept.push({ ...it, duration: start - it.start });
    if (e > end) {
      kept.push({
        ...it,
        start: end,
        duration: e - end,
        sourceIn: it.sourceIn + Math.round((end - it.start) * it.speed),
      });
    }
  }
  return { kept, touched };
}

/** shifts every item from tick `t` right by `delta` (negative closes), splitting any straddler. */
export function shiftfrom(track: EditTrack, t: number, delta: number): EditTrack {
  let fresh = nextid(track);
  const items: EditItem[] = [];
  for (const it of [...track.items].sort(byStart)) {
    const end = itemend(it);
    if (t <= it.start) items.push({ ...it, start: it.start + delta });
    else if (t < end) {
      const cut = t - it.start;
      items.push({ ...it, duration: cut });
      items.push({
        id: fresh++,
        start: t + delta,
        duration: end - t,
        sourceIn: it.sourceIn + Math.round(cut * it.speed),
        speed: it.speed,
      });
    } else items.push({ ...it });
  }
  return { ...track, items: items.sort(byStart) };
}

/** overwrite: the item replaces whatever sits under its span; partials are trimmed. */
export function overwrite(track: EditTrack, item: EditItem): EditOutcome<EditTrack> {
  if (track.locked) return refuse("locked");
  if (!(item.duration > 0)) return refuse("too-short");
  const { kept } = cutspan(track.items, item.start, itemend(item));
  kept.push({ ...item });
  return ok({ ...track, items: kept.sort(byStart) });
}

/** insert: splits at the In point and pushes the rest of the track right by the item length. */
export function insert(track: EditTrack, item: EditItem): EditOutcome<EditTrack> {
  if (track.locked) return refuse("locked");
  if (!(item.duration > 0)) return refuse("too-short");
  const shifted = shiftfrom(track, item.start, item.duration);
  return ok({ ...shifted, items: [...shifted.items, { ...item }].sort(byStart) });
}

/** lift: removes the span and leaves the gap (the material after stays put). */
export function lift(track: EditTrack, range: EditRange): EditOutcome<EditTrack> {
  if (track.locked) return refuse("locked");
  const { kept, touched } = cutspan(track.items, range.start, range.start + range.duration);
  if (!touched) return refuse("nothing");
  return ok({ ...track, items: kept.sort(byStart) });
}

/** extract (ripple delete): lift plus closing the gap; check sync-locked tracks first. */
export function extract(track: EditTrack, range: EditRange): EditOutcome<EditTrack> {
  const lifted = lift(track, range);
  if (!lifted.ok) return lifted;
  const edge = range.start + range.duration;
  return ok({
    ...lifted.value,
    items: lifted.value.items.map((it) => (it.start >= edge ? { ...it, start: it.start - range.duration } : it)),
  });
}

/** splits the item strictly containing `t` in two; the right piece gets a fresh id. */
export function split(
  track: EditTrack,
  t: number,
  limits?: EditLimits,
): EditOutcome<{ track: EditTrack; rightId: number }> {
  if (track.locked) return refuse("locked");
  const idx = track.items.findIndex((it) => it.start < t && t < itemend(it));
  if (idx < 0) return refuse("nothing");
  const item = track.items[idx];
  const min = resolve(limits).minDuration;
  if (t - item.start < min || itemend(item) - t < min) return refuse("too-short");
  const cut = t - item.start;
  const right: EditItem = {
    id: nextid(track),
    start: t,
    duration: item.duration - cut,
    sourceIn: item.sourceIn + Math.round(cut * item.speed),
    speed: item.speed,
  };
  const items = [...track.items];
  items.splice(idx, 1, { ...item, duration: cut }, right);
  return ok({ track: { ...track, items }, rightId: right.id });
}

/** regular edge trim ("in" | "out"), limited by handles and by the neighbours. */
export function trim(
  track: EditTrack,
  id: number,
  edge: "in" | "out",
  delta: number,
  limits?: EditLimits,
): EditOutcome<EditTrack> {
  if (track.locked) return refuse("locked");
  const item = finditem(track, id);
  if (!item) return refuse("no-item");
  if (delta === 0) return refuse("nothing");
  const lim = resolve(limits);
  const { prevEnd, nextStart } = neighbors(track, item);
  if (edge === "in") {
    const newStart = item.start + delta;
    const newDur = item.duration - delta;
    const newIn = item.sourceIn + Math.round(delta * item.speed);
    if (newDur < lim.minDuration) return refuse("too-short");
    if (prevEnd !== null && newStart < prevEnd) return refuse("overlap");
    if (newIn < lim.mediaStart) return refuse("no-handles");
    return ok(replace(track, item, { ...item, start: newStart, duration: newDur, sourceIn: newIn }));
  }
  const newDur = item.duration + delta;
  const srcEnd = item.sourceIn + Math.round(newDur * item.speed);
  if (newDur < lim.minDuration) return refuse("too-short");
  if (nextStart !== null && item.start + newDur > nextStart) return refuse("overlap");
  if (lim.mediaDuration !== null && srcEnd > lim.mediaStart + lim.mediaDuration) return refuse("no-handles");
  return ok(replace(track, item, { ...item, duration: newDur }));
}

/** roll: moves the cut between `id` and its right neighbour; both sides keep content. */
export function roll(track: EditTrack, id: number, delta: number, limits?: EditLimits): EditOutcome<EditTrack> {
  if (track.locked) return refuse("locked");
  const left = finditem(track, id);
  if (!left) return refuse("no-item");
  const right = track.items.find((it) => it.id !== left.id && it.start === itemend(left));
  if (!right || delta === 0) return refuse("nothing");
  const lim = resolve(limits);
  if (left.duration + delta < lim.minDuration || right.duration - delta < lim.minDuration) return refuse("too-short");
  if (
    lim.mediaDuration !== null &&
    left.sourceIn + Math.round((left.duration + delta) * left.speed) > lim.mediaStart + lim.mediaDuration
  ) {
    return refuse("no-handles");
  }
  if (right.sourceIn + Math.round(delta * right.speed) < lim.mediaStart) return refuse("no-handles");
  return ok({
    ...track,
    items: track.items.map((it) => {
      if (it.id === left.id) return { ...it, duration: it.duration + delta };
      if (it.id === right.id) {
        return {
          ...it,
          start: it.start + delta,
          duration: it.duration - delta,
          sourceIn: it.sourceIn + Math.round(delta * it.speed),
        };
      }
      return it;
    }),
  });
}

/** slip: swaps which media the item shows; the timeline span never moves. */
export function slip(track: EditTrack, id: number, delta: number, limits?: EditLimits): EditOutcome<EditTrack> {
  if (track.locked) return refuse("locked");
  const item = finditem(track, id);
  if (!item) return refuse("no-item");
  if (delta === 0) return refuse("nothing");
  const lim = resolve(limits);
  const newIn = item.sourceIn + delta;
  const srcDur = Math.round(item.duration * item.speed);
  if (newIn < lim.mediaStart) return refuse("no-handles");
  if (lim.mediaDuration !== null && newIn + srcDur > lim.mediaStart + lim.mediaDuration) return refuse("no-handles");
  return ok(replace(track, item, { ...item, sourceIn: newIn }));
}

/** slide: moves the item in time; neighbours keep their spans, only gaps change. */
export function slide(track: EditTrack, id: number, delta: number): EditOutcome<EditTrack> {
  if (track.locked) return refuse("locked");
  const item = finditem(track, id);
  if (!item) return refuse("no-item");
  if (delta === 0) return refuse("nothing");
  const { prevEnd, nextStart } = neighbors(track, item);
  const newStart = item.start + delta;
  if (prevEnd !== null && newStart < prevEnd) return refuse("overlap");
  if (nextStart !== null && newStart + item.duration > nextStart) return refuse("overlap");
  return ok(replace(track, item, { ...item, start: newStart }));
}

/** rate stretch: the item keeps its media window but fills a new timeline length. */
export function ratestretch(
  track: EditTrack,
  id: number,
  newDuration: number,
  limits?: EditLimits,
): EditOutcome<EditTrack> {
  if (track.locked) return refuse("locked");
  const item = finditem(track, id);
  if (!item) return refuse("no-item");
  const lim = resolve(limits);
  if (newDuration < lim.minDuration) return refuse("too-short");
  const srcDur = Math.round(item.duration * item.speed);
  if (srcDur <= 0) return refuse("nothing");
  const { nextStart } = neighbors(track, item);
  if (nextStart !== null && item.start + newDuration > nextStart) return refuse("overlap");
  return ok(replace(track, item, { ...item, duration: newDuration, speed: srcDur / newDuration }));
}

function replace(track: EditTrack, item: EditItem, patch: EditItem): EditTrack {
  return { ...track, items: track.items.map((it) => (it.id === item.id ? patch : it)) };
}

/* ===== block: timelineview ===== */
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
