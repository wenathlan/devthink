// # timelinemodel — the arrangement timeline model of debonair (root layer):
// clips with track, start and duration, the edit operations the DAW asks for
// (split, trim, move, snap) and the placement validation that keeps an
// arrangement playable. Zero render and zero audio: the studio page draws the
// clips it already serves and the katexis engine stays deferred — this file
// owns the STATE and its invariants. Time lives in seconds, a clip occupies
// [start, start + duration) on one track and two clips of the same track may
// never overlap unless the caller explicitly allows it. Pure and multi-mode —
// the same call runs in the browser and in node (the unit tests).

/** The machine readable failure codes of the timeline model. */
export type TimelineErrorCode = "bad-clip" | "bad-grid" | "overlap" | "split-outside" | "trim-invalid";

/** The typed timeline failure, traceable to the clip and the code. */
export class TimelineModelError extends Error {
  /** Machine readable failure code. */
  readonly code: TimelineErrorCode;
  /** The clip the failure belongs to (when known). */
  readonly clipid: string | null;

  constructor(code: TimelineErrorCode, clipid: string | null, message?: string) {
    super(message ?? `timeline ${code}${clipid === null ? "" : ` for ${clipid}`}`);
    this.name = "TimelineModelError";
    this.code = code;
    this.clipid = clipid;
  }
}

/** One clip of the arrangement: a labeled span on one track. */
export interface TimelineClip {
  /** The clip id. */
  id: string;
  /** The track the clip sits on. */
  track: string;
  /** The display label (the studio timeline renders it). */
  label: string;
  /** The clip start in seconds (>= 0). */
  start: number;
  /** The clip duration in seconds (> 0). */
  duration: number;
}

/** The snap grid of an arrangement (one step per beat of the session). */
export interface TimelineGrid {
  /** The grid step in seconds (must be > 0). */
  stepseconds: number;
}

/** The float tolerance of every interval comparison. */
const EPSILON = 1e-6;

/** The shortest duration an edit may leave a clip with, in seconds. */
export const MINIMUMDURATION = 0.05;

/**
 * Snaps a time to the nearest grid step.
 *
 * @param time the time in seconds.
 * @param grid the snap grid.
 * @returns the snapped time (float noise cleaned).
 */
export function snapToGrid(time: number, grid: TimelineGrid): number {
  if (!Number.isFinite(time) || time < 0) throw new TimelineModelError("bad-clip", null, `timeline snap needs a time >= 0, got ${time}`);
  assertgrid(grid);
  const snapped = Math.round(time / grid.stepseconds) * grid.stepseconds;
  return Number(snapped.toFixed(9));
}

/**
 * Snaps a clip onto the grid: the start lands on the nearest step and the
 * duration rounds to whole steps (never below the minimum).
 *
 * @param clip the clip to snap.
 * @param grid the snap grid.
 * @returns the snapped clip (a new row).
 */
export function snapClip(clip: TimelineClip, grid: TimelineGrid): TimelineClip {
  assertclip(clip);
  const start = snapToGrid(clip.start, grid);
  const duration = Math.max(MINIMUMDURATION, snapToGrid(Math.max(grid.stepseconds, clip.duration), grid));
  return { ...clip, start, duration };
}

/**
 * Checks whether two clips overlap on the same track (touching edges do not
 * count).
 *
 * @param left one clip.
 * @param right the other clip.
 * @returns true when the clips share time on the same track.
 */
export function clipsOverlap(left: TimelineClip, right: TimelineClip): boolean {
  return (
    left.track === right.track &&
    left.start < right.start + right.duration - EPSILON &&
    right.start < left.start + left.duration - EPSILON
  );
}

/**
 * Validates the placement of one clip against the rest of the arrangement:
 * the clip shape must be sound and, unless overlap is allowed, no same-track
 * clip may share its time.
 *
 * @param clip the clip to place.
 * @param others the clips already on the timeline (the clip itself may be among them).
 * @param options the placement options (allowoverlap defaults to false).
 */
export function validatePlacement(clip: TimelineClip, others: readonly TimelineClip[], options: { allowoverlap?: boolean } = {}): void {
  assertclip(clip);
  if (options.allowoverlap) return;
  for (const other of others) {
    if (other.id === clip.id) continue;
    if (clipsOverlap(clip, other)) {
      throw new TimelineModelError("overlap", clip.id, `timeline clip ${clip.id} overlaps ${other.id} on track ${clip.track}`);
    }
  }
}

/**
 * Splits one clip at a time inside its span, producing two clips that
 * together cover the original exactly.
 *
 * @param clip the clip to split.
 * @param at the split time in seconds (strictly inside the span).
 * @returns the left and right clips (new rows, new ids).
 */
export function splitClip(clip: TimelineClip, at: number): [TimelineClip, TimelineClip] {
  assertclip(clip);
  if (!Number.isFinite(at) || at <= clip.start + EPSILON || at >= clip.start + clip.duration - EPSILON) {
    throw new TimelineModelError("split-outside", clip.id, `timeline split time ${at} sits outside clip ${clip.id}`);
  }
  const leftduration = at - clip.start;
  return [
    { ...clip, id: `${clip.id}.a`, duration: leftduration },
    { ...clip, id: `${clip.id}.b`, start: at, duration: clip.duration - leftduration },
  ];
}

/**
 * Trims one edge of a clip: the start slides right, the end slides left,
 * never below the minimum duration.
 *
 * @param clip the clip to trim.
 * @param edge the edge to move.
 * @param to the new edge time in seconds.
 * @returns the trimmed clip (a new row).
 */
export function trimClip(clip: TimelineClip, edge: "start" | "end", to: number): TimelineClip {
  assertclip(clip);
  const end = clip.start + clip.duration;
  if (!Number.isFinite(to)) throw new TimelineModelError("trim-invalid", clip.id, `timeline trim needs a finite time, got ${to}`);
  if (edge === "start") {
    if (to < clip.start - EPSILON || to > end - MINIMUMDURATION + EPSILON) {
      throw new TimelineModelError("trim-invalid", clip.id, `timeline trim start ${to} outside [${clip.start}, ${end - MINIMUMDURATION}]`);
    }
    return { ...clip, start: Math.max(0, to), duration: end - Math.max(0, to) };
  }
  if (to < clip.start + MINIMUMDURATION - EPSILON || to > end + EPSILON) {
    throw new TimelineModelError("trim-invalid", clip.id, `timeline trim end ${to} outside [${clip.start + MINIMUMDURATION}, ${end}]`);
  }
  return { ...clip, duration: Math.max(MINIMUMDURATION, to - clip.start) };
}

/**
 * Moves a clip in time (and optionally across tracks) by a signed delta and
 * validates the landing spot against the rest of the arrangement.
 *
 * @param clip the clip to move.
 * @param deltaseconds the signed time delta in seconds.
 * @param others the clips already on the timeline (the clip itself may be among them).
 * @param options the move options (grid snap, target track, allowoverlap).
 * @returns the moved clip (a new row).
 */
export function moveClip(
  clip: TimelineClip,
  deltaseconds: number,
  others: readonly TimelineClip[],
  options: { grid?: TimelineGrid; track?: string; allowoverlap?: boolean } = {},
): TimelineClip {
  assertclip(clip);
  if (!Number.isFinite(deltaseconds)) throw new TimelineModelError("bad-clip", clip.id, `timeline move needs a finite delta, got ${deltaseconds}`);
  const raw = Math.max(0, clip.start + deltaseconds);
  const moved: TimelineClip = {
    ...clip,
    track: options.track ?? clip.track,
    start: options.grid ? snapToGrid(raw, options.grid) : raw,
  };
  validatePlacement(moved, others, options);
  return moved;
}

/**
 * Lists the clips playing at one instant (a clip counts while the instant
 * sits inside its half-open span).
 *
 * @param clips the arrangement.
 * @param time the instant in seconds.
 * @returns the active clips.
 */
export function activeAt(clips: readonly TimelineClip[], time: number): TimelineClip[] {
  if (!Number.isFinite(time) || time < 0) throw new TimelineModelError("bad-clip", null, `timeline instant must be >= 0, got ${time}`);
  return clips.filter((clip) => clip.start - EPSILON <= time && time < clip.start + clip.duration - EPSILON);
}

/**
 * Measures the arrangement length: the end of the last clip (0 when empty).
 *
 * @param clips the arrangement.
 * @returns the total duration in seconds.
 */
export function totalDuration(clips: readonly TimelineClip[]): number {
  return clips.reduce((peak, clip) => Math.max(peak, clip.start + clip.duration), 0);
}

/** validates the clip shape once so every helper can trust it. */
function assertclip(clip: TimelineClip): void {
  if (!clip || typeof clip.id !== "string" || clip.id.length === 0) throw new TimelineModelError("bad-clip", null, "timeline needs a clip with an id");
  if (typeof clip.track !== "string" || clip.track.length === 0) throw new TimelineModelError("bad-clip", clip.id, `timeline clip ${clip.id} needs a track`);
  if (!Number.isFinite(clip.start) || clip.start < 0) throw new TimelineModelError("bad-clip", clip.id, `timeline clip ${clip.id} start must be >= 0, got ${clip.start}`);
  if (!Number.isFinite(clip.duration) || clip.duration <= 0) throw new TimelineModelError("bad-clip", clip.id, `timeline clip ${clip.id} duration must be > 0, got ${clip.duration}`);
}

/** validates the grid once so every helper can trust it. */
function assertgrid(grid: TimelineGrid): void {
  if (!grid || !Number.isFinite(grid.stepseconds) || grid.stepseconds <= 0) {
    throw new TimelineModelError("bad-grid", null, `timeline grid step must be a positive number, got ${grid?.stepseconds}`);
  }
}
