// # arranger — the composer of the katexis engine (root layer): one call turns
// a prompt and a seed into the whole arrangement plan the DAW surfaces read —
// the genre (genrematrix), the bpm (pickBpm), the key and the chord timeline
// (harmonyengine over musictheory), the drum grid with accents, swing and
// fills (rhythmgrammar), the section voicing, the playlist clips
// (timelinemodel) and the mixing desk rows (mixergraph strips). Every random
// decision runs through the engine's seeded mulberry32 — same prompt, same
// seed, same take. Zero audio and zero consumer data: the browser transport
// (Sol/studio/audioengine.ts) and the tests read the same plan. Pure and
// multi-mode — browser and node alike.

import { GENRES, type GenreStyle, matchGenre, pickBpm } from "./genrematrix.ts";
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
import { type TimelineClip, validatePlacement } from "./timelinemodel.ts";

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
