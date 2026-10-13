// # arrangement — the clip binding of the katexis engine (root layer): the
// desk edits clips (move, trim, split, duplicate, delete — the timelinemodel
// algebra) and the arrangement answers with the schedule that re-slices the
// take's material across the edited clips. The model is the proportional
// re-slice: per role, the plan's original clips tile one contiguous span of
// material; the edited clips of the same role divide that span by duration
// share, and each edited clip plays its slice at the take's own tempo from
// its own start. Moving a clip moves what it plays, trimming shortens the
// slice, deleting hands the material to the survivors, duplicating splits
// the share — one law, no per-case branches, fully deterministic.
// NON-GOALS: no audio, no DOM, no storage, no rng (the re-slice is algebra,
// not chance). The time-stretch law is deliberately NOT here: a slice plays
// at the take's tempo or goes silent past its share — the documented limit.
// Pure and multi-mode — browser and node alike.

import { type ArrangerRole, ROLE_NAMES, type TakePlan } from "./arranger.ts";
import { type NoteEvent, scheduleTake, type TakeSchedule } from "./takeevents.ts";
import type { TimelineClip } from "./timelinemodel.ts";

/** The typed arrangement failure the desk renders honestly. */
export class ArrangementError extends Error {
  /** The machine-readable failure code. */
  readonly code: "bad-clips" | "bad-plan" | "empty-role";
  /** The clip id the refusal names (when one clip is at fault). */
  readonly clipid: string | null;
  constructor(code: "bad-clips" | "bad-plan" | "empty-role", clipid: string | null, message?: string) {
    super(message ?? `arrangement ${code}${clipid === null ? "" : ` for ${clipid}`}`);
    this.name = "ArrangementError";
    this.code = code;
    this.clipid = clipid;
  }
}

/** The epsilon the time math rides (the timelinemodel's own tolerance). */
const EPSILON = 1e-6;

/**
 * Validates the edited arrangement before the re-slice reads it: finite
 * times, positive durations, non-negative starts, ids present.
 *
 * @param clips the edited arrangement.
 * @throws ArrangementError("bad-clips") on the first unsound clip.
 */
function assertClips(clips: readonly TimelineClip[]): void {
  if (!Array.isArray(clips)) throw new ArrangementError("bad-clips", null, "the arrangement is not a clip list");
  for (const clip of clips) {
    if (!clip || typeof clip.id !== "string" || clip.id.length === 0)
      throw new ArrangementError("bad-clips", null, "the arrangement carries a clip without an id");
    if (!Number.isFinite(clip.start) || clip.start < 0)
      throw new ArrangementError("bad-clips", clip.id, `clip starts at ${clip.start}`);
    if (!Number.isFinite(clip.duration) || clip.duration <= 0)
      throw new ArrangementError("bad-clips", clip.id, `clip lasts ${clip.duration}`);
  }
}

/** The time order the re-slice walks the clips in (start, then id for ties). */
function byStart(left: TimelineClip, right: TimelineClip): number {
  return left.start - right.start || left.id.localeCompare(right.id);
}

/**
 * Rebuilds the schedule the edited arrangement plays: per role, the plan's
 * original material is re-sliced across the edited clips by duration share.
 *
 * The law, exactly: the role's original clips (the plan's own) concatenate,
 * in time order, into one strip of material — a gap between two originals is
 * silence of the source, not material. The edited clips of that role walk the
 * strip cumulatively: clip j opens on the strip position Σ(durations before j)
 * and claims totalSource × (j.duration / totalEdited) of strip material.
 * Every event whose concatenated position lands inside the claim plays at the
 * clip's own start plus the offset inside the claim; anything past the clip's
 * own gate (or past the take's end) stays silent. Feeding the plan's own
 * clips answers the seeded schedule — the identity the tests pin — because
 * the edited walk then reproduces the original windows one to one.
 *
 * @param plan the plan the take answers to (the untouched material source).
 * @param clips the edited arrangement (the desk's clips).
 * @param source the seeded schedule the material reads from (defaults to
 *   scheduleTake(plan); the studio passes its own when the roll edited too).
 * @returns the schedule the transport plays for this arrangement.
 * @throws ArrangementError on unsound clips or an unsound plan.
 */
export function rebaseSchedule(
  plan: TakePlan,
  clips: readonly TimelineClip[],
  source: TakeSchedule = scheduleTake(plan),
): TakeSchedule {
  if (!plan || plan.bars < 1 || !(plan.durationSeconds > 0))
    throw new ArrangementError("bad-plan", null, `plan ${plan?.id ?? "?"} carries no duration`);
  assertClips(clips);

  const events: NoteEvent[] = [];
  const perRole: Record<ArrangerRole, number> = { drums: 0, bass: 0, keys: 0, lead: 0 };

  for (const role of ROLE_NAMES) {
    const originals = plan.clips.filter((clip) => clip.track === role).sort(byStart);
    const edited = clips.filter((clip) => clip.track === role).sort(byStart);
    if (originals.length === 0 || edited.length === 0) continue;
    const totalSource = originals.reduce((sum, clip) => sum + clip.duration, 0);
    const totalEdited = edited.reduce((sum, clip) => sum + clip.duration, 0);
    if (!(totalSource > 0) || !(totalEdited > 0)) continue;

    // the concatenated strip of the role's source material: segment k covers
    // the strip [cursorBefore, cursorBefore + dur) and answers the absolute
    // window [start, start + dur) — gaps between originals are source silence
    const segments: readonly { cursor: number; start: number; duration: number }[] = originals.map((clip, index) => ({
      cursor: originals.slice(0, index).reduce((sum, entry) => sum + entry.duration, 0),
      start: clip.start,
      duration: clip.duration,
    }));

    /** Maps an absolute source time to its strip position (null in the gaps).
     * The open edge rides −EPSILON: the grid's bar boundaries drift a unit in
     * the last place, and an onset ON a clip's start belongs to that clip. */
    const toStrip = (time: number): number | null => {
      for (const segment of segments) {
        if (time >= segment.start - EPSILON && time < segment.start + segment.duration)
          return segment.cursor + (time - segment.start);
      }
      return null;
    };

    // the strip positions of the role's events, once per role
    const stripEvents: readonly { position: number; event: NoteEvent }[] = source.events
      .filter((event) => event.role === role)
      .map((event) => ({ position: toStrip(event.time), event }))
      .filter((entry): entry is { position: number; event: NoteEvent } => entry.position !== null);

    let elapsed = 0;
    for (const clip of edited) {
      const claimStart = elapsed;
      const claimEnd = elapsed + totalSource * (clip.duration / totalEdited);
      elapsed = claimEnd;
      for (const { position, event } of stripEvents) {
        if (position < claimStart - EPSILON || position >= claimEnd - EPSILON) continue;
        const moved = clip.start + (position - claimStart);
        if (moved >= clip.start + clip.duration - EPSILON) continue; // past the clip's own gate
        if (moved >= plan.durationSeconds - EPSILON) continue; // past the take's end
        events.push({ ...event, time: Number(moved.toFixed(9)) });
      }
    }
  }

  // a stable time sort keeps the seeded tie order (roles inserted in the
  // canonical order reproduce takeevents' own generation order at ties)
  events.sort((left, right) => left.time - right.time);
  for (const event of events) perRole[event.role] += 1;
  return { events, perRole, duration: plan.durationSeconds };
}

/**
 * Validates the plan the desk wants to edit against: bars, duration and at
 * least one voiced role (an empty list is a sound edit base).
 *
 * @param plan the plan under edit.
 * @returns the problems found.
 */
export function validateArrangement(plan: TakePlan): string[] {
  const problems: string[] = [];
  if (plan.bars < 1) problems.push("the plan carries no bars");
  if (!(plan.durationSeconds > 0)) problems.push("the plan carries no duration");
  const voiced = ROLE_NAMES.filter((role) => plan.clips.some((clip) => clip.track === role));
  if (voiced.length === 0) problems.push("the plan carries no voiced clips");
  return problems;
}
