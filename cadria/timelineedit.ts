// # timelineedit — the edit algebra of the cadria timeline, housed at the
// cadria root beside timeticks. It owns the track-item operations a video
// editor needs: overwrite, insert, lift (gap stays), extract (ripple, gap
// closes), split, edge trims limited by media handles, roll, slip, slide and
// rate stretch — plus the sync-lock primitives (`shiftfrom`, `syncconflict`)
// so the caller cascades an insert/extract to every sync-locked track the way
// the reference editor does. Semantics follow the Premiere model: insert
// pushes right, trims never cross neighbours, and source time is media time,
// so trims and splits never move keyframes. The clean-room pattern is
// absorbed from filmcraft (storytold/filmcraft, crates/edit — a PROJETO-class
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
