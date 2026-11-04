/**
 * arrangement — consolidated arrangement logics of the debonair family
 * @module arrangement
 * @family wave/logicfold3
 * One keyed file per family: the former variant arms (arranger)
 * retired into this seat with every export preserved under the same name.
 */

import { GENRES, type GenreStyle, matchGenre, pickBpm } from "./genre.ts";
import { type ChordEvent, generateProgression, hashSeed, mulberry32, PROGRESSION_SETS } from "./harmonyengine.ts";
import type { MixerStripRow } from "./katexis.ts";
import { MASTERING, trackNameFromPrompt } from "./katexis.ts";
import { type Key, noteName } from "./musictheory.ts";
import {
  applyAccents,
  applySwing,
  FAMILIES,
  type FamilyName,
  type LaneName,
  type PatternGrid,
  validateGrid,
} from "./rhythmgrammar.ts";
/* (the type TimelineClip binding rode this statement too — the arrangement
 * block above already binds it from the same module; the dedup kept one) */
import { validatePlacement } from "./timelinemodel.ts";

/* ===== block: arrangement ===== */
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

import { type NoteEvent, scheduleTake, type TakeSchedule } from "./take.ts";
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

/* ===== block: arranger ===== */
// # arranger — the composer of the katexis engine (root layer): one call turns
// a prompt and a seed into the whole arrangement plan the DAW surfaces read —
// the genre (genrematrix), the bpm (pickBpm), the key and the chord timeline
// (harmonyengine over musictheory), the drum grid with accents, swing and
// fills (rhythmgrammar), the section voicing, the playlist clips
// (timelinemodel) and the mixing desk rows (mixergraph strips). Every random
// decision runs through the engine's seeded mulberry32 — same prompt, same
// seed, same take. Zero audio and zero consumer data: the browser transport
// (sol/studio/audioengine.ts) and the tests read the same plan. Pure and
// multi-mode — browser and node alike.


/** The instrument roles the arrangement carries (one timeline track each). */
export type ArrangerRole = "drums" | "bass" | "keys" | "lead";

/** Every role of the desk, master excluded. */
export const ROLE_NAMES: readonly ArrangerRole[] = ["drums", "bass", "keys", "lead"];

/** One named section of the arrangement: a span of bars with its energy. */
export interface PlanSection {
  /** The display name of the section ("drop"). */
  name: string;
  /** The bar index the section starts at (0-based). */
  bar: number;
  /** How many bars the section lasts. */
  bars: number;
  /** The velocity multiplier the scheduler applies to the section (0..1.2). */
  energy: number;
  /** The roles that play in the section. */
  voices: readonly ArrangerRole[];
}

/** The 16-bar arrangement the generator writes: 5 sections, one voicing each. */
export const SECTION_PLAN: readonly PlanSection[] = [
  { name: "intro", bar: 0, bars: 2, energy: 0.55, voices: ["drums", "keys"] },
  { name: "verse", bar: 2, bars: 4, energy: 0.85, voices: ["drums", "bass", "keys"] },
  { name: "lift", bar: 6, bars: 3, energy: 0.95, voices: ["drums", "bass", "keys", "lead"] },
  { name: "drop", bar: 9, bars: 5, energy: 1.0, voices: ["drums", "bass", "keys", "lead"] },
  { name: "outro", bar: 14, bars: 2, energy: 0.6, voices: ["bass", "keys"] },
];

/** The desk fader of each role (the seed gain the mixer opens with, in dB). */
const ROLE_FADERS: Record<ArrangerRole, number> = { drums: -4, bass: -5, keys: -9, lead: -7 };

/** The drum lanes of the grid the rack renders, top to bottom. */
export const RACK_LANES: readonly LaneName[] = ["kick", "snare", "clap", "hat", "openhat", "perc", "ride", "tom"];

/** The short key label of every mode the generator picks from. */
const MODE_LABEL: Record<Key["mode"], string> = {
  major: "maj",
  "natural-minor": "min",
  "harmonic-minor": "harm min",
  "melodic-minor": "mel min",
  dorian: "dor",
  phrygian: "phr",
  lydian: "lyd",
  mixolydian: "mix",
  aeolian: "min",
  locrian: "loc",
  "pentatonic-major": "penta maj",
  "pentatonic-minor": "penta min",
  blues: "blues",
};

/** The whole arrangement plan one take carries. */
export interface TakePlan {
  /** The stable id of the take (fnv-1a of seed and prompt, base36). */
  id: string;
  /** The display name (the first words of the prompt). */
  name: string;
  /** The prompt the take answers to. */
  prompt: string;
  /** The seed string the plan is deterministic against. */
  seed: string;
  /** The genre id of the matrix ("techno"). */
  genreId: string;
  /** The genre label ("Techno"). */
  genreLabel: string;
  /** The picked bpm, inside the genre range. */
  bpm: number;
  /** The swung midpoint of the genre (0.5 = straight). */
  swing: number;
  /** The pattern family of rhythmgrammar the drums read. */
  pattern: FamilyName;
  /** The key of the take. */
  key: Key;
  /** The short key label ("C min"). */
  keyLabel: string;
  /** The total bar count (always the section plan's sum). */
  bars: number;
  /** The seconds one bar lasts at the picked bpm (4/4). */
  barSeconds: number;
  /** The total duration in seconds. */
  durationSeconds: number;
  /** The chord timeline, one event per bar. */
  chords: readonly ChordEvent[];
  /** The accented drum grid (velocities 0..1). */
  grid: PatternGrid;
  /** The per-step swing offsets, in step units. */
  offsets: readonly number[];
  /** One fill draw per bar (the last bar of a cycle may cascade). */
  fillBars: readonly boolean[];
  /** The sections with their voicing and energy. */
  sections: readonly PlanSection[];
  /** The playlist clips, one run per voiced role per section. */
  clips: readonly TimelineClip[];
  /** The desk rows the mixer opens with (master included). */
  strips: readonly MixerStripRow[];
  /** The genre's documented loudness target (LUFS). */
  lufsTarget: number;
  /** The engine mastering spec the take renders under (verbatim). */
  mastering: typeof MASTERING;
}

/** The options planTake accepts. */
export interface PlanOptions {
  /** The free text prompt ("midnight techno, dark sub, 132 bpm"). */
  prompt: string;
  /** The deterministic seed ("debonair-demo"). */
  seed: string;
  /** Pins the genre id; when absent the prompt is matched against the matrix. */
  genreId?: string;
}

/**
 * Composes the arrangement plan for one prompt and seed.
 *
 * @param options the prompt, the seed and the optional pinned genre.
 * @returns the deterministic plan (same inputs, same take).
 */
export function planTake(options: PlanOptions): TakePlan {
  const prompt = options.prompt.trim();
  const seed = options.seed.trim() || "debonair";
  const rng = mulberry32(hashSeed(`arranger:${seed}:${prompt}`));
  const genre = resolveGenre(prompt, options.genreId);
  const bpm = pickBpm(genre, seed);
  const key: Key = { tonic: Math.floor(rng() * 12), mode: genre.scales[Math.floor(rng() * genre.scales.length)] };
  const mood = moodWords(prompt, genre);
  const chords = generateProgression({ seed: `${seed}:${genre.id}`, key, mood, bars: TOTAL_BARS });
  const accented = applyAccents(FAMILIES[genre.pattern], genre.pattern);
  const { grid, offsets } = applySwing(accented, genre.swing, 2);
  const fillBars = Array.from({ length: TOTAL_BARS }, (_, bar) => (bar + 1) % 4 === 0 && rng() < 0.4);
  const barSeconds = (60 / bpm) * 4;
  const sections = SECTION_PLAN;
  const clips = buildClips(sections, barSeconds);
  const strips = buildStrips(rng);
  return {
    id: takeId(seed, prompt),
    name: trackNameFromPrompt(prompt) || "Untitled take",
    prompt,
    seed,
    genreId: genre.id,
    genreLabel: genre.label,
    bpm,
    swing: genre.swing,
    pattern: genre.pattern,
    key,
    keyLabel: `${noteName(key.tonic)} ${MODE_LABEL[key.mode]}`,
    bars: TOTAL_BARS,
    barSeconds,
    durationSeconds: Number((TOTAL_BARS * barSeconds).toFixed(6)),
    chords,
    grid,
    offsets,
    fillBars,
    sections,
    clips,
    strips,
    lufsTarget: genre.lufs,
    mastering: MASTERING,
  };
}

/** The arrangement length in bars (the section table must sum to this). */
export const TOTAL_BARS = SECTION_PLAN.reduce((total, section) => total + section.bars, 0);

/** The beat seconds of a plan (the scheduler's step unit). */
export function beatSecondsOf(plan: TakePlan): number {
  return 60 / plan.bpm;
}

/** The step seconds of the 16-step grid (a sixteenth note). */
export function stepSecondsOf(plan: TakePlan): number {
  return beatSecondsOf(plan) / 4;
}

/**
 * Resolves the genre of a take: the pinned id wins, then the prompt match,
 * then the seeded fallback so a plan always exists.
 *
 * @param prompt the prompt text.
 * @param genreId the optional pinned genre id.
 * @returns the genre style of the matrix.
 */
export function resolveGenre(prompt: string, genreId?: string): GenreStyle {
  if (genreId) {
    const pinned = GENRES.find((genre) => genre.id === genreId);
    if (pinned) return pinned;
  }
  return matchGenre(prompt) ?? GENRES[Math.floor(hashSeed(`fallback:${prompt}`) % GENRES.length)];
}

/** Collects the mood words the prompt shares with the genre's progression sets. */
function moodWords(prompt: string, genre: GenreStyle): string {
  const tokens = new Set(prompt.toLowerCase().split(/\s+/).filter(Boolean));
  const moods = new Set<string>();
  for (const spec of Object.values(PROGRESSION_SETS)) {
    for (const mood of spec.moods) if (tokens.has(mood)) moods.add(mood);
  }
  if (moods.size === 0) return genre.id;
  return [...moods].join(" ");
}

/**
 * Builds the playlist clips: one clip per voiced role per section, snapped to
 * the beat grid and validated against the rest of the arrangement.
 *
 * @param sections the section plan.
 * @param barSeconds the seconds one bar lasts.
 * @returns the validated clips.
 */
function buildClips(sections: readonly PlanSection[], barSeconds: number): TimelineClip[] {
  const clips: TimelineClip[] = [];
  for (const section of sections) {
    for (const role of section.voices) {
      clips.push({
        id: `${role}-${section.name}`,
        track: role,
        label: section.name,
        start: Number((section.bar * barSeconds).toFixed(6)),
        duration: Number((section.bars * barSeconds).toFixed(6)),
      });
    }
  }
  const placed: TimelineClip[] = [];
  for (const clip of clips) {
    validatePlacement(clip, placed);
    placed.push(clip);
  }
  return placed;
}

/** Builds the desk rows: one strip per role plus the master bus. */
function buildStrips(rng: () => number): MixerStripRow[] {
  const rows: MixerStripRow[] = ROLE_NAMES.map((role) => ({
    name: role,
    meterPercent: 0,
    faderDb: Number((ROLE_FADERS[role] + (rng() * 2 - 1)).toFixed(1)),
  }));
  rows.push({ name: "master", meterPercent: 0, faderDb: -2, master: true });
  return rows;
}

/** Derives the stable take id from the seed and the prompt. */
export function takeId(seed: string, prompt: string): string {
  return hashSeed(`${seed}:${prompt}`).toString(36);
}

/**
 * Validates a plan end to end; answers the problems (an empty list is a
 * sound plan): the grid, the chord count, the section sum, the clip
 * placement and the desk shape.
 *
 * @param plan the plan to check.
 * @returns the problems found.
 */
export function validatePlan(plan: TakePlan): string[] {
  const problems: string[] = [];
  problems.push(...validateGrid(plan.grid));
  if (plan.chords.length !== plan.bars)
    problems.push(`plan carries ${plan.chords.length} chords for ${plan.bars} bars`);
  const sectionBars = plan.sections.reduce((total, section) => total + section.bars, 0);
  if (sectionBars !== plan.bars) problems.push(`sections cover ${sectionBars} bars, plan carries ${plan.bars}`);
  if (!plan.strips.some((strip) => strip.master)) problems.push("plan carries no master strip");
  const duration = plan.bars * plan.barSeconds;
  if (Math.abs(plan.durationSeconds - duration) > 1e-6) problems.push("durationSeconds disagrees with bpm and bars");
  for (const clip of plan.clips) {
    if (clip.start + clip.duration > duration + 1e-6) problems.push(`clip ${clip.id} runs past the arrangement`);
  }
  return problems;
}

