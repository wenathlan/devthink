// # composer — the prompt-to-plan brain of the generation lane (root layer,
// the pipeline wave PV4.001): the prompt parses onto the genre seat
// (genrematrix — the explicit genre words win, then the style keywords the
// reference tolerated in pt and en, then the seeded default), the genre
// profile the pattern miner answered loads (the bpm distribution, the key
// pool, the onset density curve, the band balance, the chroma profile, the
// centroid) and the seeded vector plan composes — a debonair.pattern/1
// document whose projection onto the miner's twenty-two-seat similarity
// space sits near the profile centroid. the musicality laws port from the
// reference aurora composer: the bass locks to the kick in the chord root,
// the melody rides the rhythm cells of the genre with the chord tones on the
// accents and the root resolution at the bar's last cell, every note lands
// diatonic to the chosen scale (the patternenums library, the theory
// kernel's tables underneath), the pads hold the chord ladder, the drift and
// energy cycles shape the sections, and the profile's band balance tilts the
// voice choice (low-heavy corpora answer bass/pad-leaning plans). the
// similarity law is honest: a plain prompt answers a plan whose cosine
// against the centroid clears the documented floor (0.85), and when the
// prompt pins scalars away from the corpus the prompt wins and the
// similarity honestly drops — the report says so. determinism is total: the
// same prompt, profile and salt always answer the same serializePattern
// bytes (every draw rides one seeded mulberry32 seat). the validators run
// before every return — a composer that emits an invalid plan is a bug, the
// internal guard throws. non-goals: no audio (the render wave PV4.002 reads
// the plan), no storage, no mining (patternminer owns the profile), no
// arrangement surface (arranger owns the take plan — this file is the
// profile-driven sibling that answers the pattern contract). pure and
// multi-mode — the same call runs in the browser and in node.

import { GENRES, type GenreStyle, genreById, matchGenre } from "./genrematrix.ts";
import { type ChordEvent, generateProgression, hashSeed, mulberry32, PROGRESSION_SETS } from "./harmonyengine.ts";
import type { IngestSegment } from "./ingest.ts";
import { chordPcs, type Key, noteToPc, SCALE_NAMES, SCALE_STEPS, type ScaleName } from "./musictheory.ts";
import {
  EMBEDDING_DIM,
  LANE_STEPS,
  PATTERN_LIMITS,
  PATTERN_SCALES,
  PATTERN_SCHEMA_VERSION,
  type PatternDrumLanes,
  type PatternNoteEvent,
  type PatternProject,
  type PatternScaleName,
  type PatternVoice,
  patternNoteName,
  validatePatternProject,
} from "./patternenums.ts";
import {
  documentVector,
  type GenreProfile,
  type IngestDocumentWithId,
  SEGMENT_DIM,
  type SimilarityHit,
  segmentVector,
  validateGenreProfile,
} from "./patternminer.ts";
import { FAMILIES, type FamilyName } from "./rhythmgrammar.ts";

// ---------------------------------------------------------------------------
// the typed failure (machine codes the caller surfaces)
// ---------------------------------------------------------------------------

/** The machine readable failure codes of the composer contract. */
export const COMPOSER_ERROR_CODES = ["no-profile", "bad-genre", "empty-profile", "invalid-plan"] as const;

/** Every machine code the composer answers. */
export type ComposerErrorCode = (typeof COMPOSER_ERROR_CODES)[number];

/** The typed composer failure, traceable to its machine code. */
export class ComposerError extends Error {
  /** Machine readable failure code. */
  readonly code: ComposerErrorCode;

  constructor(code: ComposerErrorCode, message?: string) {
    super(message ?? `composer ${code}`);
    this.name = "ComposerError";
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// the tables (the constant-table law — every vocabulary seat on top)
// ---------------------------------------------------------------------------

/** The similarity floor: a plan the composer answers for a profile it
 * read clears this cosine against that profile's centroid. the composer
 * draws every seat from the profile's own numbers — the curve sets the drum
 * densities, the band balance tilts the voices, the chroma sets the root,
 * the pool sets the mode — so the matched plan correlates by construction
 * and the observed band sits 0.89..0.99 across lanes and salts (the seeded
 * jitter, the family grids and the seeded loop pick bound it). a prompt
 * that pins scalars away from the corpus wins and the similarity honestly
 * drops — a root pin decorrelates the twelve chroma seats (a tritone pin
 * answers ~0.94 against ~0.98), a tempo pin thins the count seats — and
 * the forced list names every pin that moved the answer; the floor breaks
 * when the prompt forces the shape wholesale away (an ambient prompt
 * against a percussive corpus answers ~0.83, under the floor, the report
 * says so). */
export const SIMILARITY_FLOOR = 0.85;

/** The bar count a prompt without a "N bars" pin answers (one full
 * progression cycle — the fill bar lands on bar three). */
export const DEFAULT_BARS = 4;

/** The style keywords the reference generator tolerated (pt and en) folded
 * onto the matrix keys it lacks: phonk rides the rude-trap screaming-808
 * seat, the synthwave family rides the pop grid (the backbeat clap and the
 * straight 8th hats are the retro groove), the rest name the lanes the
 * matrix's own match misses (the id, the label and the timbre tags). the
 * table is ordered — the first hit wins, and the explicit matrix match runs
 * before all of it. */
const STYLE_KEYWORDS: readonly (readonly [RegExp, string])[] = [
  [/phonk|memphis/, "rude-trap"],
  [/synthwave|retrowave|vaporwave|outrun|synth/, "pop"],
  // boom bap sits before the lofi row: the compound names the genre, the
  // dusty/vinyl adjectives it rides are timbre words lofi shares
  [/boom\s?bap/, "hiphop"],
  [/lo-?fi|chill|estudo|dusty|vinyl/, "lofi"],
  [/bebop|standards|swing\b/, "jazz"],
  [/ambien|dream|sonho|et[eé]reo/, "ambient"],
  [/jungle|breakbeat/, "dnb"],
  [/\bsoul\b/, "rnb"],
];

/** The scale words the prompt pins onto the forty-eight library — the
 * reference's detector ported (the pt spellings included), the mixolydian
 * row before the lydian because "mixolydian" contains it. the major/minor
 * words fold last so "harmonic minor" answers the harmonic seat. */
const SCALE_WORDS: readonly (readonly [RegExp, PatternScaleName])[] = [
  [/mixolydian|mixol[ií]dio/, "mixolydian"],
  [/dorian|dorico/, "dorian"],
  [/phrygian|fr[ií]gio/, "phrygian"],
  [/lydian|l[ií]dio/, "lydian"],
  [/locrian|locr[ií]o/, "locrian"],
  [/blues/, "blues"],
  [/harmonic|harmonica|harm[oô]nica/, "harmonic-minor"],
  [/pentat|pentat[oô]nica/, "pentatonic-minor"],
  [/whole.?tone/, "whole-tone"],
  [/hijaz|arabe?/, "hijaz"],
  [/gypsy|cigana/, "gypsy-major"],
  [/japan|japon[eê]s|oriental/, "insen"],
  [/prometheus|space/, "prometheus"],
  [/bebop/, "bebop-dom"],
];

/** The mood words that brighten the plan label (the reference's "+" lane). */
const BRIGHT_WORDS = /feliz|happy|bright|alegre|uplift/;
/** The mood words that darken the plan label (the reference's "dark" lane). */
const DARK_WORDS = /sombrio|dark|tenebroso|noir/;
/** The words that push the intensity up (the hard lane). */
const HARD_WORDS = /hard|agressiv|aggressive|brutal|sombrio|dark|tenebroso/;
/** The words that pull the intensity down (the soft lane). */
const SOFT_WORDS = /chill|soft|suave|calm|calma|dream|sonho|gentle|leve/;

/** The style energy the reference's presets carried, keyed by the
 * rhythmgrammar family (the matrix genres fold through their pattern seat;
 * pop carries the synthwave register, dnb the rolling seat, ambient the
 * reference's dreamy override). */
const INTENSITY_BASE: Record<FamilyName, number> = {
  trap: 0.72,
  drill: 0.82,
  house: 0.78,
  dnb: 0.8,
  lofi: 0.4,
  pop: 0.62,
  techno: 0.8,
  ambient: 0.34,
};

/** The melody rhythm cells per family — the reference's groove table ported
 * (the [step, dur] pairs the lead onsets lock to, the fill every fourth
 * bar, the accent steps the chord tones land on), the pop/dnb/ambient rows
 * the honest completion of the port (the straight-8th retro lane, the
 * two-step, the whole-note swells). */
interface MelodyCell {
  /** The main cell: [step, duration] pairs per bar. */
  main: readonly (readonly [number, number])[];
  /** The fill cell (every fourth bar). */
  fill: readonly (readonly [number, number])[];
  /** The accent steps (the chord-tone seats). */
  accent: readonly number[];
}

const MELODY_CELLS: Record<FamilyName, MelodyCell> = {
  trap: {
    main: [
      [0, 1],
      [3, 1],
      [6, 2],
      [10, 1],
      [14, 1],
    ],
    fill: [
      [0, 1],
      [2, 1],
      [3, 1],
      [6, 2],
      [10, 1],
      [13, 1],
      [14, 1],
      [15, 1],
    ],
    accent: [0, 6, 10],
  },
  drill: {
    main: [
      [0, 2],
      [3, 1],
      [5, 1],
      [8, 2],
      [11, 1],
      [14, 1],
    ],
    fill: [
      [0, 2],
      [3, 1],
      [5, 1],
      [8, 1],
      [11, 1],
      [13, 1],
      [14, 1],
      [15, 1],
    ],
    accent: [0, 8],
  },
  lofi: {
    main: [
      [0, 2],
      [5, 1],
      [8, 3],
      [13, 2],
    ],
    fill: [
      [0, 2],
      [5, 1],
      [8, 2],
      [11, 1],
      [13, 1],
      [14, 1],
    ],
    accent: [0, 8],
  },
  house: {
    main: [
      [0, 1],
      [2, 1],
      [6, 1],
      [8, 1],
      [10, 1],
      [14, 1],
    ],
    fill: [
      [0, 1],
      [2, 1],
      [6, 1],
      [8, 1],
      [10, 1],
      [12, 1],
      [14, 1],
      [15, 1],
    ],
    accent: [0, 8],
  },
  techno: {
    main: [
      [0, 1],
      [4, 2],
      [8, 1],
      [12, 2],
    ],
    fill: [
      [0, 1],
      [4, 1],
      [8, 1],
      [10, 1],
      [12, 1],
      [14, 1],
    ],
    accent: [0, 8],
  },
  dnb: {
    main: [
      [0, 2],
      [6, 1],
      [10, 2],
      [14, 1],
    ],
    fill: [
      [0, 1],
      [2, 1],
      [6, 1],
      [10, 1],
      [12, 1],
      [14, 1],
    ],
    accent: [0, 10],
  },
  pop: {
    main: [
      [0, 2],
      [4, 1],
      [6, 1],
      [8, 2],
      [12, 2],
    ],
    fill: [
      [0, 1],
      [2, 1],
      [4, 1],
      [6, 1],
      [8, 1],
      [10, 1],
      [12, 1],
      [14, 1],
    ],
    accent: [0, 8],
  },
  ambient: {
    main: [
      [0, 4],
      [8, 4],
    ],
    fill: [
      [0, 3],
      [6, 2],
      [10, 4],
    ],
    accent: [0, 8],
  },
};

/** The register bands the melody walks per family (the reference's
 * full-keyboard law — no C4-only melodies). */
const MELODY_REGISTERS: Record<FamilyName, readonly [number, number]> = {
  trap: [60, 84],
  drill: [62, 86],
  lofi: [55, 79],
  house: [58, 82],
  techno: [60, 84],
  dnb: [58, 84],
  pop: [58, 82],
  ambient: [55, 84],
};

/** The lead voice per family (the reference's instrument table). */
const LEAD_VOICES: Record<FamilyName, PatternVoice> = {
  trap: "pluck",
  drill: "bell",
  lofi: "keys",
  house: "keys",
  techno: "arp",
  dnb: "keys",
  pop: "pluck",
  ambient: "flute",
};

/** The warm fold: a low-heavy corpus answers the softer lead seats (the
 * band tilt law — everything warms to keys, the flute keeps its breath). */
const WARM_VOICE: Record<PatternVoice, PatternVoice> = {
  lead: "keys",
  pluck: "keys",
  keys: "keys",
  bell: "keys",
  arp: "keys",
  flute: "flute",
  bass: "bass",
  pad: "pad",
};

/** The bright fold: a high-heavy corpus answers the brighter seats. */
const BRIGHT_VOICE: Record<PatternVoice, PatternVoice> = {
  lead: "lead",
  pluck: "lead",
  keys: "bell",
  bell: "bell",
  arp: "arp",
  flute: "bell",
  bass: "bass",
  pad: "pad",
};

/** The lead-family voices (the stats seats read these; bass and pad sit out). */
const LEAD_FAMILY: readonly PatternVoice[] = ["lead", "pluck", "keys", "bell", "arp", "flute"];

/** The energy cycle the reference's long-form composer shaped sections with
 * (a velocity factor per two-bar section). */
const ENERGY_CYCLE: readonly number[] = [0.84, 1.0, 1.08, 0.95, 1.05, 0.9];

/** The drift cycle the reference's variations walked (the register wander
 * per section boundary). */
const DRIFT_CYCLE: readonly number[] = [0.16, 0.28, 0.42, 0.22, 0.5, 0.3];

/** The sampling spans of the eight histogram buckets — the same edges the
 * miner buckets the references with (its table stays private; this mirror
 * keeps the bpm sampling honest against the profile's own histogram). */
const BPM_SAMPLING_EDGES: readonly number[] = [60, 80, 100, 120, 140, 160, 180, 200, 240];

/** The absolute floor a curve bin clears to count as a kick peak (a flat
 * quiet curve owns no peaks — the honest guard against the relative law
 * firing on silence). */
const KICK_PEAK_FLOOR = 0.5;

/** The relative share of the curve's maximum a bin carries to push the
 * kick (the peak law: bin >= floor and bin >= share * max). */
const KICK_PEAK_SHARE = 0.75;

/** The drum hit mass of the timeline synthesis — the binary lanes carry no
 * velocities, the family accent mean answers the energy proxy. */
const DRUM_HIT_MASS = 0.8;

/** The symbolic folds of the timeline synthesis — the calibration table
 * that lands the plan's per-second features onto the bands the ingest
 * frames report (each fold documented at its seat): the plan's per-step
 * velocity mass answers the corpus rms band 0.1..0.35; the hat rate per
 * second answers the analog zero-crossing band 0.005..0.06; the drum mass
 * share answers the corpus flatness band 0.03..0.2; the strongest onset
 * answers the rms-rise band 0.05..0.2; the note fundamentals answer the
 * analyzed centroid (the partial-rich centroid sits three heads above the
 * fundamental mean); the distinct onset steps fold by four — the envelope
 * the detector would peak-count (the refractory window lets a busy trap
 * grid's seven distinct sixteenth events a second answer the two peaks a
 * second the corpus detector reports, the sparse lane stays sparse). */
const PLAN_ENERGY_FOLD = 0.12;
const PLAN_ZCR_FOLD = 100;
const PLAN_NOISE_FOLD = 0.16;
const PLAN_ATTACK_FOLD = 0.16;
const PLAN_CENT_FOLD = 3;
const PLAN_ONSET_FOLD = 4;

// ---------------------------------------------------------------------------
// the pure helpers
// ---------------------------------------------------------------------------

/** Rounds to four decimals (the canonical number law). */
function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}

/** Clamps into an inclusive range. */
function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

/** The honest floor: a non-finite number reads zero. */
function fin(x: number): number {
  return Number.isFinite(x) ? x : 0;
}

/** The mean of a list; zero when empty. */
function meanOf(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const value of values) sum += value;
  return sum / values.length;
}

/** The population standard deviation of a list; zero when empty. */
function stdOf(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const mean = meanOf(values);
  let sum = 0;
  for (const value of values) sum += (value - mean) * (value - mean);
  return Math.sqrt(sum / values.length);
}

/** The cosine of two vectors over their shared length; zero when either
 * norm is zero (the miner's honest floor, the same law its rank rides). */
function cosine(a: readonly number[], b: readonly number[]): number {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < length; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  if (normA <= 0 || normB <= 0) return 0;
  const score = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return Number.isFinite(score) ? score : 0;
}

/** The weighted draw over a pool (the weights clamp at zero, the total-zero
 * pool answers the uniform draw). */
function weightedPick<T>(pool: readonly T[], weightOf: (item: T) => number, rng: () => number): T {
  let total = 0;
  const weights = pool.map((item) => {
    const weight = Math.max(0, weightOf(item));
    total += weight;
    return weight;
  });
  if (total <= 0) return pool[Math.floor(rng() * pool.length) % pool.length] as T;
  let pick = rng() * total;
  for (let i = 0; i < pool.length; i++) {
    pick -= weights[i] ?? 0;
    if (pick <= 0) return pool[i] as T;
  }
  return pool[pool.length - 1] as T;
}

// ---------------------------------------------------------------------------
// the prompt spec (the parse lane)
// ---------------------------------------------------------------------------

/** The genre's explicit words: the id's tokens plus the label's alphabetic
 * words of three letters or more ("rude-trap" answers {rude, trap}, "R&B"
 * answers {r&b}). */
function genreWordsOf(genre: GenreStyle): string[] {
  const words = new Set<string>();
  for (const word of `${genre.id} ${genre.label}`.toLowerCase().split(/[^a-z0-9&]+/)) {
    if (word.length >= 3) words.add(word);
  }
  return [...words];
}

/**
 * The explicit genre-word lane: every genre scores the prompt tokens — a
 * complete id match (every id word present) carries the top weight, a
 * complete label match the middle weight, and the matched word count
 * breaks the rest, ties answering the earlier matrix entry. so "rude
 * trap" names rude-trap (a complete id of two words over trap's one),
 * "afrobeats log drum" names afrobeats (the complete id outweighs dnb's
 * lone "drum" label word), "drum and bass" names dnb (the complete
 * label), and a lone "trap" token still names trap. this lane runs first
 * because the matrix's own match counts the timbre tags too — a "slow"
 * token would tie "r&b" into ambient's slow-shimmer — and the mission's
 * discipline puts the explicit genre words before the style keywords.
 *
 * @param p the lowercased prompt.
 * @returns the named genre, undefined when no genre word appears.
 */
function explicitGenreOf(p: string): GenreStyle | undefined {
  const tokens = new Set(p.split(/[^a-z0-9&]+/).filter(Boolean));
  let best: GenreStyle | undefined;
  let bestRank = 0;
  for (const genre of GENRES) {
    const idWords = genre.id
      .toLowerCase()
      .split(/[^a-z0-9&]+/)
      .filter((word) => word.length >= 3);
    const labelWords = genre.label
      .toLowerCase()
      .split(/[^a-z0-9&]+/)
      .filter((word) => word.length >= 3);
    const idComplete = idWords.length > 0 && idWords.every((word) => tokens.has(word));
    const labelComplete = labelWords.length > 0 && labelWords.every((word) => tokens.has(word));
    const matched = genreWordsOf(genre).filter((word) => tokens.has(word)).length;
    // the rank: the complete id (hundreds), the complete label (tens), the
    // matched word count (units) — the word count stays under ten by the
    // vocabulary's size
    const rank = (idComplete ? 100 : 0) + (labelComplete ? 10 : 0) + matched;
    if (rank > bestRank) {
      best = genre;
      bestRank = rank;
    }
  }
  return bestRank > 0 ? best : undefined;
}

/** The musical parameters a prompt pins: the genre seat (always one of the
 * fifteen — the match discipline), the explicit scalars (null when the
 * prompt leaves them to the profile), the bars, the intensity and the seed
 * seat the determinism rides. */
export interface ComposerPromptSpec {
  /** The genrematrix key the prompt answers (one of the fifteen). */
  genre: string;
  /** True when an explicit genre word or style keyword hit (the seeded
   * default answers false — the profile lane still serves it). */
  genreExplicit: boolean;
  /** The pinned tempo ("140 bpm"), clamped to the contract band; null when
   * the profile's distribution answers. */
  bpm: number | null;
  /** The pinned root (a lone note name, the reference's law), 0..11; null
   * when the key pool answers. */
  root: number | null;
  /** The pinned scale (a scale word onto the forty-eight); null when the
   * genre bias answers. */
  scale: PatternScaleName | null;
  /** The bar count ("8 bars"), clamped to the contract band. */
  bars: number;
  /** The style energy, 0..1 (the family base, the hard/soft modifiers, the
   * seeded jitter — the reference's law). */
  intensity: number;
  /** The seed seat: the lowercased prompt, "debonair" when empty. */
  seed: string;
}

/** Reads the lone note name the reference's law caught: a solo a-g letter
 * with an optional accidental, never inside a word (the article
 * false-positive included — the tolerance the reference lived with; one
 * guard added: the letter never rides an ampersand, so the "r&b" genre
 * word carries no b pin). */
const ROOT_WORD = /(?:^|[^a-z&])([a-g])(#|b)?(?![a-z])/;

/**
 * Parses a free-text prompt onto the composer spec. the match discipline
 * runs in three lanes — the matrix's own match (the id, the label and the
 * timbre tags), then the style keywords the reference tolerated, then the
 * seeded default (the arranger's fallback law, so a spec always exists) —
 * and the scalars pin only when the prompt names them: "NN bpm" (or the pt
 * "batidas"), the lone note name, the scale word, "N bars". pure and
 * deterministic: the same prompt always answers the same spec.
 *
 * @param prompt the free text ("dark trap, hard 808s, 140 bpm").
 * @returns the pinned spec.
 */
export function parseComposerPrompt(prompt: string): ComposerPromptSpec {
  const p = prompt.trim().toLowerCase();
  const rng = mulberry32(hashSeed(`composer:parse:${p}`));
  // the genre lanes: the explicit genre words, the style keywords (the
  // reference's pt/en tolerance), the matrix's own match (the id, the
  // label and the timbre tags), the seeded default
  let genre: GenreStyle | undefined = explicitGenreOf(p);
  let genreExplicit = genre !== undefined;
  if (genre === undefined) {
    for (const [pattern, id] of STYLE_KEYWORDS) {
      if (pattern.test(p)) {
        genre = genreById(id);
        genreExplicit = true;
        if (genre !== undefined) break;
      }
    }
  }
  if (genre === undefined) {
    genre = matchGenre(p);
    genreExplicit = genre !== undefined;
  }
  if (genre === undefined) {
    genre = GENRES[Math.floor(hashSeed(`fallback:${p}`) % GENRES.length)];
    genreExplicit = false;
  }
  // the tempo pin ("140 bpm", "140 batidas")
  const bpmMatch = /(\d{2,3})\s*(bpm|batidas)/.exec(p);
  const bpm =
    bpmMatch === null
      ? null
      : clamp(Number.parseInt(bpmMatch[1] ?? "0", 10), PATTERN_LIMITS.bpmMin, PATTERN_LIMITS.bpmMax);
  // the root pin: the lone note law
  const rootMatch = ROOT_WORD.exec(p);
  let root: number | null = null;
  if (rootMatch !== null) {
    const letters: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    const base = letters[(rootMatch[1] ?? "").toLowerCase()] ?? null;
    if (base !== null) {
      root = base;
      if (rootMatch[2] === "#") root = (base + 1) % 12;
      if (rootMatch[2] === "b") root = (base + 11) % 12;
    }
  }
  // the scale pin: the word table, then the major/minor fold
  let scale: PatternScaleName | null = null;
  for (const [pattern, name] of SCALE_WORDS) {
    if (pattern.test(p)) {
      scale = name;
      break;
    }
  }
  if (scale === null) {
    if (/major|maior/.test(p)) scale = "major";
    else if (/minor|menor/.test(p)) scale = "natural-minor";
  }
  // the bars pin ("8 bars", "8 compassos")
  const barsMatch = /(\d{1,3})\s*(bars?|compassos?)/.exec(p);
  const bars =
    barsMatch === null
      ? DEFAULT_BARS
      : clamp(Number.parseInt(barsMatch[1] ?? "0", 10), PATTERN_LIMITS.barsMin, PATTERN_LIMITS.barsMax);
  // the intensity: the family base, the hard/soft modifiers, the seeded jitter
  const base = INTENSITY_BASE[genre.pattern];
  const modifier = HARD_WORDS.test(p) ? 0.12 : SOFT_WORDS.test(p) ? -0.12 : 0;
  const intensity = round4(clamp(base + modifier + (rng() - 0.5) * 0.08, 0, 1));
  return { genre: genre.id, genreExplicit, bpm, root, scale, bars, intensity, seed: p || "debonair" };
}

/** The plan label the prompt answers (the reference's mood lane: the genre
 * label, the bright "+" and the dark suffix). */
function moodLabelOf(prompt: string, genre: GenreStyle): string {
  const p = prompt.trim().toLowerCase();
  const label = genre.label.toLowerCase();
  if (BRIGHT_WORDS.test(p)) return `${label} +`;
  if (DARK_WORDS.test(p)) return `${label} dark`;
  return label;
}

/** The mood query the progression picker scores — the arranger's lane
 * ported: the prompt tokens shared with the progression sets' mood words
 * join the query; the genre id rides the fallback. */
function moodWordsOf(prompt: string, genre: GenreStyle): string {
  const tokens = new Set(prompt.trim().toLowerCase().split(/\s+/).filter(Boolean));
  const moods = new Set<string>();
  for (const set of Object.values(PROGRESSION_SETS)) {
    for (const mood of set.moods) if (tokens.has(mood)) moods.add(mood);
  }
  if (moods.size === 0) return genre.id;
  return [...moods].join(" ");
}

// ---------------------------------------------------------------------------
// the profile reads (the laws the miner's document answers)
// ---------------------------------------------------------------------------

/**
 * Loads the genre profile the caller hands: the document must exist and
 * pass the miner's contract (a broken profile is no profile — the honest
 * chain carries the miner's code), the genre key must sit inside the
 * fifteen the style dictionary owns, and the references must have fed it
 * (an empty profile answers no plan, the miner's own honest law).
 *
 * @param profile the profile document (unknown by design — js callers).
 * @returns the checked profile.
 * @throws ComposerError no-profile, bad-genre or empty-profile.
 */
function requireProfile(profile: GenreProfile | null | undefined): GenreProfile {
  if (profile === null || profile === undefined || typeof profile !== "object")
    throw new ComposerError("no-profile", "the composer loads the profile the miner answered — none was handed");
  const result = validateGenreProfile(profile);
  if (!result.ok) {
    if (result.code === "bad-genre")
      throw new ComposerError("bad-genre", `the profile's genre is outside the fifteen: ${result.message}`);
    throw new ComposerError("no-profile", `the profile failed its contract (${result.code}): ${result.message}`);
  }
  if (result.doc.trainedOn === 0 || result.doc.referenceIds.length === 0)
    throw new ComposerError(
      "empty-profile",
      "the composer writes for a genre its references fed — an empty profile answers no plan",
    );
  return result.doc;
}

/**
 * The tempo law: the prompt's pin wins (the parse already clamped it);
 * otherwise the profile's distribution answers — the histogram weights pick
 * the bucket, the seeded draw lands inside the bucket's span, the median
 * anchors the point (the raw draw blends half-way with the median when the
 * median sits inside the drawn bucket), and the answer stays inside the
 * corpus's own span when the span is sane. an empty histogram answers the
 * median itself (the corpus's center). the answer rounds to integer beats
 * inside the contract band.
 *
 * @param profile the genre profile.
 * @param rng the seeded draw.
 * @returns the tempo, 40..240.
 */
function profileBpm(profile: GenreProfile, rng: () => number): number {
  const { min, median, max, histogram } = profile.bpm;
  let bpm = median;
  const total = histogram.reduce((sum, count) => sum + Math.max(0, count), 0);
  if (total > 0) {
    let pick = rng() * total;
    let bucket = histogram.length - 1;
    for (let b = 0; b < histogram.length; b++) {
      pick -= Math.max(0, histogram[b] ?? 0);
      if (pick <= 0) {
        bucket = b;
        break;
      }
    }
    const lo = BPM_SAMPLING_EDGES[bucket] ?? PATTERN_LIMITS.bpmMin;
    const hi = BPM_SAMPLING_EDGES[bucket + 1] ?? PATTERN_LIMITS.bpmMax;
    let draw = lo + rng() * (hi - lo);
    if (median >= lo && median < hi) draw = (draw + median) / 2;
    bpm = draw;
    if (min > 0 && max > min && max <= PATTERN_LIMITS.bpmMax) bpm = clamp(bpm, min, max);
  }
  return Math.round(clamp(bpm, PATTERN_LIMITS.bpmMin, PATTERN_LIMITS.bpmMax));
}

/** The tonic pitch class of a key-pool name ("A minor" -> 9). */
function tonicOf(name: string): number {
  const pc = noteToPc((name.split(" ")[0] ?? "").trim());
  return pc === null ? 0 : pc;
}

/** The pitch class the chroma profile's mass centers on (ties answer the
 * lowest pitch class — deterministic). */
function chromaArgmax(chroma: readonly number[]): number {
  let best = 0;
  for (let pc = 1; pc < chroma.length; pc++) if ((chroma[pc] ?? 0) > (chroma[best] ?? 0)) best = pc;
  return best;
}

/**
 * The root law: the key pool's top answer carries the tonic; when the pool
 * is flat (the top weights tie) the chroma profile's tonal mass breaks the
 * tie among the tied entries; an empty pool answers the chroma argmax
 * outright (the tonal mass is the seat the references own).
 *
 * @param profile the genre profile.
 * @returns the root pitch class, 0..11.
 */
function profileRoot(profile: GenreProfile): number {
  const pool = profile.keyPool;
  if (pool.length === 0) return chromaArgmax(profile.chromaProfile);
  const top = pool[0];
  if (top === undefined) return chromaArgmax(profile.chromaProfile);
  const tied = pool.filter((entry) => Math.abs(entry.weight - top.weight) < 1e-9);
  if (tied.length <= 1) return tonicOf(top.name);
  let best = top;
  let bestMass = -1;
  for (const entry of tied) {
    const mass = fin(profile.chromaProfile[tonicOf(entry.name)] ?? 0);
    if (mass > bestMass) {
      best = entry;
      bestMass = mass;
    }
  }
  return tonicOf(best.name);
}

/**
 * The mode law: the pool entry that names the root answers its mode; when
 * the pool never names the root (the flat lane read the chroma) the
 * third-degree mass decides — the reference's key-detection threshold
 * (minor when the minor third clears 0.82 of the major third's mass).
 *
 * @param profile the genre profile.
 * @param root the chosen root pitch class.
 * @returns "major" or "minor".
 */
function profileMode(profile: GenreProfile, root: number): "major" | "minor" {
  const entry = profile.keyPool.find((candidate) => tonicOf(candidate.name) === root);
  if (entry !== undefined) return entry.name.endsWith("minor") ? "minor" : "major";
  const thirdMinor = fin(profile.chromaProfile[(root + 3) % 12] ?? 0);
  const thirdMajor = fin(profile.chromaProfile[(root + 4) % 12] ?? 0);
  return thirdMinor > thirdMajor * 0.82 ? "minor" : "major";
}

/**
 * The scale bias law: the matrix's genre bias walks its list and the first
 * scale whose third degree matches the corpus's mode wins (the diatonic
 * fold — a minor-keyed corpus never answers a major-mode vocabulary); when
 * nothing matches the first bias answers. the kernel's "aeolian" spelling
 * folds onto the pattern library's canonical "natural-minor" (the alias
 * law the patternenums parser rides).
 *
 * @param genre the style of the prompt's genre.
 * @param mode the corpus's mode.
 * @returns the scale the genre biases toward.
 */
function scaleForGenre(genre: GenreStyle, mode: "major" | "minor"): PatternScaleName {
  const third = mode === "minor" ? 3 : 4;
  for (const name of genre.scales) {
    if (SCALE_STEPS[name].includes(third)) return name === "aeolian" ? "natural-minor" : name;
  }
  const first = genre.scales[0];
  return first === undefined ? "major" : first === "aeolian" ? "natural-minor" : first;
}

/**
 * The kernel fold: the harmony grammar keys off the thirteen kernel modes,
 * so an extension scale of the forty-eight folds onto the kernel that
 * shares the most semitones (the twelve kernel scales reuse the theory
 * tables by reference — the identity check catches them; ties answer the
 * kernel order). the melody keeps the full forty-eight set — only the
 * chord ladder rides the fold.
 *
 * @param scale the chosen pattern scale.
 * @returns the nearest kernel mode.
 */
function nearestKernelMode(scale: PatternScaleName): ScaleName {
  const intervals = PATTERN_SCALES[scale];
  const direct = SCALE_NAMES.find((name) => SCALE_STEPS[name] === intervals);
  if (direct !== undefined) return direct;
  let best: ScaleName = SCALE_NAMES[0] ?? "major";
  let bestShared = -1;
  for (const name of SCALE_NAMES) {
    const shared = SCALE_STEPS[name].filter((step) => intervals.includes(step)).length;
    if (shared > bestShared) {
      best = name;
      bestShared = shared;
    }
  }
  return best;
}

/**
 * The snap: a midi pitch folds onto the chosen scale's tones (the pc passes
 * when it is already a tone, else the nearest tone within two semitones —
 * the reference's quantizer law, so every note the plan carries is diatonic
 * to the chosen scale).
 *
 * @param midi the candidate pitch.
 * @param root the chosen root pitch class.
 * @param intervals the chosen scale's semitone set.
 * @returns the snapped pitch.
 */
function nearestScaleTone(midi: number, root: number, intervals: readonly number[]): number {
  const tones = intervals.map((iv) => (((root + iv) % 12) + 12) % 12);
  const base = Math.round(midi);
  const pc = ((base % 12) + 12) % 12;
  if (tones.includes(pc)) return base;
  for (const delta of [1, -1, 2, -2]) {
    if (tones.includes((((base + delta) % 12) + 12) % 12)) return base + delta;
  }
  return base;
}

/** The nearest scale tone index of the sorted tone ladder (the walk seat). */
function nearestToneIndex(midi: number, tones: readonly number[]): number {
  let best = 0;
  for (let i = 0; i < tones.length; i++) {
    if (Math.abs((tones[i] ?? 0) - midi) < Math.abs((tones[best] ?? 0) - midi)) best = i;
  }
  return best;
}

/** Moves a pitch by n ladder seats (the reference's scale-step walk; the
 * ladder clamps at its ends). */
function scaleStepWalk(midi: number, delta: number, tones: readonly number[]): number {
  if (tones.length === 0) return midi;
  const index = clamp(nearestToneIndex(midi, tones) + delta, 0, tones.length - 1);
  return tones[index] ?? midi;
}

// ---------------------------------------------------------------------------
// the drums (the onset-curve laws)
// ---------------------------------------------------------------------------

/**
 * The drum law: the genre's rhythmgrammar family pattern folds onto the
 * four contract lanes (the kick, snare and clap binarize at the contract
 * threshold — the family's 0.35 ghosts sit under it, the honest fold; the
 * hat lane merges the hat and openhat lanes by max) and the profile's onset
 * density curve seeds the density seats: the busy-ness (the curve's mean
 * blended half-and-half with the centroid's onset-rate seat — the curve is
 * normalized to its own peak, so a quiet corpus needs the absolute anchor)
 * sets the hat survival per step (the odd 16ths thin at low busy-ness and
 * intensity, the reference's hat-thinning lane inverted), and the curve's
 * peaks (bin >= the absolute floor and >= the share of the maximum) push
 * the kick onto the even steps where the family rests (the reference's
 * learned-kick lane, the curve's sixteen bins riding the grid's sixteen
 * steps).
 *
 * @param family the genre's pattern family.
 * @param profile the genre profile.
 * @param intensity the style energy.
 * @param rng the seeded draw.
 * @returns the four sixteen-step lanes.
 */
function buildDrums(family: FamilyName, profile: GenreProfile, intensity: number, rng: () => number): PatternDrumLanes {
  const base = FAMILIES[family];
  const threshold = PATTERN_LIMITS.stepThreshold;
  const kick = base.lanes.kick.map((v) => (v >= threshold ? 1 : 0));
  const snare = base.lanes.snare.map((v) => (v >= threshold ? 1 : 0));
  const clap = base.lanes.clap.map((v) => (v >= threshold ? 1 : 0));
  const hat = base.lanes.hat.map((v, s) => (Math.max(v, base.lanes.openhat[s]) >= threshold ? 1 : 0));
  // the busy seat: the curve's mean blended with the absolute onset-rate seat
  const curve = profile.onsetDensity;
  const curveMean = meanOf(curve);
  const onsetSeat = fin(profile.centroid[6] ?? 0);
  const busy = clamp(curveMean * 0.5 + onsetSeat * 0.5, 0, 1);
  // the hat law: survival per step, the odd 16ths thin first
  for (let s = 0; s < LANE_STEPS; s++) {
    const odd = s % 2 === 1;
    const survival = odd ? clamp(0.25 + busy * 0.5 + intensity * 0.25, 0, 1) : clamp(0.45 + busy * 0.55, 0, 1);
    if ((hat[s] ?? 0) === 1) {
      if (rng() >= survival) hat[s] = 0;
    } else if (odd && busy > 0.7 && rng() < (busy - 0.7) * 2.5) {
      hat[s] = 1;
    }
  }
  // the kick law: the curve's peaks push the kick where the family rests
  let peak = 0;
  for (const bin of curve) if (bin > peak) peak = bin;
  for (let s = 0; s < LANE_STEPS; s += 2) {
    const bin = fin(curve[s] ?? 0);
    if ((kick[s] ?? 0) === 0 && bin >= KICK_PEAK_FLOOR && bin >= KICK_PEAK_SHARE * peak && rng() < 0.5) kick[s] = 1;
  }
  return { kick, snare, hat, clap };
}

// ---------------------------------------------------------------------------
// the notes (the melody laws the reference proved)
// ---------------------------------------------------------------------------

/** The band tilt of a balance: the dominant band, "mid" when none dominates. */
function bandTiltOf(bands: { low: number; mid: number; high: number }): "low" | "mid" | "high" {
  if (bands.low > bands.mid && bands.low > bands.high) return "low";
  if (bands.high > bands.mid && bands.high > bands.low) return "high";
  return "mid";
}

/** The lead voice of a family under the profile's band tilt (the warm fold
 * for the low-heavy corpora, the bright fold for the high-heavy). */
function leadVoiceOf(family: FamilyName, tilt: "low" | "mid" | "high"): PatternVoice {
  const voice = LEAD_VOICES[family];
  if (tilt === "low") return WARM_VOICE[voice];
  if (tilt === "high") return BRIGHT_VOICE[voice];
  return voice;
}

/**
 * The note engine — the reference's melody laws ported onto the debonair
 * vocabulary. the lead rides the family's rhythm cells (the fill cell every
 * fourth bar, the weak cells trimmed at low intensity), the pitch walks the
 * chosen scale's ladder within four semitones of the current seat (the
 * reference's near-walk bias), the chord tones triple their weight on the
 * accent steps, the octave jumps fire on the reference's 0.11 draw, the
 * bar's last cell resolves to the chord root (snapped — the diatonic
 * discipline), and the velocities humanize around the accent law. the bass
 * locks to the kick: every kick step of the final lane answers a bass note
 * in the chord root (the low-heavy tilt sustains it twice as long), and the
 * pads hold the chord ladder — the root and the third, the half-bar bed.
 * the drift cycle walks the register at each two-bar section boundary and
 * the energy cycle scales the section velocities (the reference's
 * long-form laws).
 *
 * @param options the spec, the profile, the genre, the chosen scale and
 * root, the chord ladder, the final drum lanes and the seeded draw.
 * @returns the sorted note events.
 */
function composeNotes(options: {
  spec: ComposerPromptSpec;
  profile: GenreProfile;
  genre: GenreStyle;
  scale: PatternScaleName;
  root: number;
  chords: readonly ChordEvent[];
  drums: PatternDrumLanes;
  rng: () => number;
}): PatternNoteEvent[] {
  const { spec, profile, genre, scale, root, chords, drums, rng } = options;
  const intervals = PATTERN_SCALES[scale];
  const cells = MELODY_CELLS[genre.pattern];
  const [regLo, regHi] = MELODY_REGISTERS[genre.pattern];
  const tilt = bandTiltOf(profile.bandBalance);
  const voice = leadVoiceOf(genre.pattern, tilt);
  const bassDur = tilt === "low" ? 4 : 2;
  // the ladder: the chosen scale's tones inside the walking register
  const tones: number[] = [];
  for (let oct = -1; oct <= 2; oct++) {
    for (const iv of intervals) {
      const midi = 60 + root + iv + oct * 12;
      if (midi >= regLo - 4 && midi <= regHi + 12) tones.push(midi);
    }
  }
  tones.sort((a, b) => a - b);
  const notes: PatternNoteEvent[] = [];
  let current = Math.min(
    regHi - 4,
    60 + root + (intervals[Math.floor(rng() * Math.min(3, intervals.length))] ?? 0) + 12,
  );
  for (let bar = 0; bar < spec.bars; bar++) {
    const chord = chords[bar] ?? chords[chords.length - 1];
    if (chord === undefined) break;
    const pcs = chordPcs(chord.chord);
    const chordPc = chord.chord.root;
    const chordSet = new Set(pcs.map((pc) => ((nearestScaleTone(60 + pc, root, intervals) % 12) + 12) % 12));
    const isFill = bar % 4 === 3;
    const source = isFill ? cells.fill : cells.main;
    const template =
      spec.intensity < 0.5 && !isFill ? source.filter(([st]) => st % 4 === 0 || cells.accent.includes(st)) : source;
    const section = Math.floor(bar / 2);
    const energy = ENERGY_CYCLE[section % ENERGY_CYCLE.length] ?? 1;
    const drift = DRIFT_CYCLE[section % DRIFT_CYCLE.length] ?? 0.3;
    // the drift port: the register walks the ladder at each section boundary
    if (section > 0 && bar % 2 === 0) {
      const reach = drift > 0.35 ? 2 : 1;
      current = scaleStepWalk(current, rng() < 0.5 ? reach : -reach, tones);
    }
    for (const [idx, entry] of template.entries()) {
      const [off, dur] = entry;
      const step = bar * LANE_STEPS + off;
      const isLast = idx === template.length - 1;
      const isAccent = cells.accent.includes(off) || off % 4 === 0;
      let pitch: number;
      if (isLast) {
        pitch = nearestScaleTone(60 + chordPc, root, intervals);
      } else {
        const near = tones.filter((tone) => Math.abs(tone - current) <= 4);
        const pool = near.length > 0 ? near : tones;
        pitch = weightedPick(
          pool,
          (candidate) => (isAccent && chordSet.has(((candidate % 12) + 12) % 12) ? 3 : 1),
          rng,
        );
        if (rng() < 0.11) {
          const jumped = pitch + (rng() < 0.5 ? 12 : -12);
          if (jumped >= regLo - 4 && jumped <= regHi) pitch = jumped;
        }
      }
      current = pitch;
      const humanized = clamp((isAccent ? 0.9 : 0.66) + (rng() - 0.5) * 0.1, 0.35, 1);
      const vel = clamp(humanized * energy, 0.25, 1);
      notes.push({ step, pitch, vel: round4(vel), dur: clamp(dur, 0.5, 4), voice });
    }
    // the bass lock: every kick step answers the chord root in the basement
    for (let s = 0; s < LANE_STEPS; s++) {
      if ((drums.kick[s] ?? 0) !== 1) continue;
      const step = bar * LANE_STEPS + s;
      if (notes.some((note) => note.voice === "bass" && note.step === step)) continue;
      notes.push({
        step,
        pitch: nearestScaleTone(24 + chordPc, root, intervals),
        vel: round4(clamp(0.94 * energy, 0.25, 1)),
        dur: bassDur,
        voice: "bass",
      });
    }
    // the pads: the chord ladder's root and third, the half-bar bed
    const third = pcs[1] ?? (chordPc + (intervals[2] ?? 3)) % 12;
    notes.push({
      step: bar * LANE_STEPS,
      pitch: nearestScaleTone(46 + chordPc, root, intervals),
      vel: 0.32,
      dur: 8,
      voice: "pad",
    });
    notes.push({
      step: bar * LANE_STEPS,
      pitch: nearestScaleTone(46 + third, root, intervals),
      vel: 0.28,
      dur: 8,
      voice: "pad",
    });
  }
  notes.sort((a, b) => a.step - b.step);
  return notes;
}

// ---------------------------------------------------------------------------
// the plan's seats (the timeline synthesis and the embeddings)
// ---------------------------------------------------------------------------

/**
 * The timeline synthesis: the plan laid on the clock — at the plan's tempo
 * one bar spans 240/bpm seconds, every sixteenth step lands on its second,
 * and each second answers the features the miner reads, through the
 * calibration folds of the table above (the plan's notes carry fundamentals
 * where the analyzed mix carries partial-rich centroids, the binary drum
 * lanes carry the accent-mean mass, the envelope merges the sixteenth grid
 * into detector peaks). the band split rides the ingest decomposition's own
 * transient law — the kick owns the low band, the snare and clap the mid,
 * the hat the high — with the notes placed by register. the chroma carries
 * the per-second velocity-mass distribution, the silent second owns no
 * tonal mass (the miner's law).
 *
 * @param doc the composed plan.
 * @returns one synthesized segment per second of the plan's timeline.
 */
function planSegments(doc: PatternProject): IngestSegment[] {
  const stepsPerSecond = (4 * doc.bpm) / 60;
  const totalSteps = doc.bars * LANE_STEPS;
  const seconds = Math.max(1, Math.ceil(totalSteps / stepsPerSecond));
  // the absolute drum hit steps, per lane (the lanes loop each bar)
  const drumSteps: { step: number; lane: "kick" | "snare" | "clap" | "hat" }[] = [];
  for (let bar = 0; bar < doc.bars; bar++) {
    for (let s = 0; s < LANE_STEPS; s++) {
      if ((doc.drums.kick[s] ?? 0) === 1) drumSteps.push({ step: bar * LANE_STEPS + s, lane: "kick" });
      if ((doc.drums.snare[s] ?? 0) === 1) drumSteps.push({ step: bar * LANE_STEPS + s, lane: "snare" });
      if ((doc.drums.clap[s] ?? 0) === 1) drumSteps.push({ step: bar * LANE_STEPS + s, lane: "clap" });
      if ((doc.drums.hat[s] ?? 0) === 1) drumSteps.push({ step: bar * LANE_STEPS + s, lane: "hat" });
    }
  }
  const segments: IngestSegment[] = [];
  for (let t = 0; t < seconds; t++) {
    // the second's span on the clock, in seconds (the steps land at step/sps)
    const from = t;
    const to = t + 1;
    let kickHits = 0;
    let snareHits = 0;
    let hatHits = 0;
    let drumMass = 0;
    const onsetSteps = new Set<number>();
    let velMax = 0;
    for (const hit of drumSteps) {
      const time = hit.step / stepsPerSecond;
      if (time < from || time >= to) continue;
      if (hit.lane === "kick") kickHits++;
      else if (hit.lane === "hat") hatHits++;
      else snareHits++;
      drumMass += DRUM_HIT_MASS;
      onsetSteps.add(hit.step);
      velMax = Math.max(velMax, DRUM_HIT_MASS);
    }
    let noteMass = 0;
    let lowMass = 0;
    let midMass = 0;
    let highMass = 0;
    let hzWeighted = 0;
    const chromaMass = new Array<number>(12).fill(0);
    for (const note of doc.notes) {
      const onset = note.step / stepsPerSecond;
      const end = (note.step + note.dur) / stepsPerSecond;
      const overlap = Math.max(0, Math.min(end, to) - Math.max(onset, from));
      if (overlap <= 0) continue;
      const mass = note.vel * overlap * stepsPerSecond;
      noteMass += mass;
      const pc = ((Math.round(note.pitch) % 12) + 12) % 12;
      chromaMass[pc] += mass;
      hzWeighted += mass * 440 * 2 ** ((note.pitch - 69) / 12);
      if (note.pitch < 48) lowMass += mass;
      else if (note.pitch < 72) midMass += mass;
      else highMass += mass;
      if (onset >= from && onset < to) {
        onsetSteps.add(note.step);
        velMax = Math.max(velMax, note.vel);
      }
    }
    const low = lowMass + kickHits * DRUM_HIT_MASS;
    const mid = midMass + snareHits * DRUM_HIT_MASS;
    const high = highMass + hatHits * DRUM_HIT_MASS;
    const bandTotal = low + mid + high;
    const chromaTotal = chromaMass.reduce((sum, bin) => sum + bin, 0);
    let dominant = -1;
    for (let pc = 0; pc < 12; pc++) if (chromaMass[pc] > dominant) dominant = chromaMass[pc] ?? 0;
    const dominantPc = chromaMass.findIndex((bin) => bin === dominant && dominant > 0);
    segments.push({
      s: t,
      rms: clamp(((noteMass + drumMass) / stepsPerSecond) * PLAN_ENERGY_FOLD, 0, 1),
      peak: clamp(velMax, 0, 1),
      zcr: hatHits / PLAN_ZCR_FOLD,
      cent: noteMass > 0 ? (hzWeighted / noteMass) * PLAN_CENT_FOLD : 0,
      flat: bandTotal > 0 ? (drumMass / (drumMass + noteMass)) * PLAN_NOISE_FOLD : 0,
      beat: velMax * PLAN_ATTACK_FOLD,
      onsets: onsetSteps.size / PLAN_ONSET_FOLD,
      bands: bandTotal > 0 ? [low / bandTotal, mid / bandTotal, high / bandTotal] : [0, 0, 0],
      note: dominantPc >= 0 ? patternNoteName(dominantPc) : "",
      chroma: chromaTotal > 0 ? chromaMass.map((bin) => bin / chromaTotal) : chromaMass,
    });
  }
  return segments;
}

/**
 * The plan's seat in the miner's similarity space: the mean of the
 * synthesized segments' normalized vectors — the same seats, the same
 * clamps (the miner's own segmentVector), the same aggregation law the
 * documentVector folds with — so the plan, its profile centroid and the
 * references answer in one space and the cosine reads honestly.
 *
 * @param doc the composed plan.
 * @returns the twenty-two-seat mean vector.
 */
export function planVector(doc: PatternProject): number[] {
  const segments = planSegments(doc);
  const sums = new Array<number>(SEGMENT_DIM).fill(0);
  for (const segment of segments) {
    const vector = segmentVector(segment);
    for (let seat = 0; seat < SEGMENT_DIM; seat++) sums[seat] += vector[seat] ?? 0;
  }
  return sums.map((sum) => round4(sum / segments.length));
}

/**
 * The plan's thirty-two-dim patternenums embedding — the reference layout
 * ported seat by seat (the chroma mass share, the hat and drum densities,
 * the lead statistics, the velocity moments, the tempo seat, the log
 * density, the bass share), every seat clamped 0..1.5 the way the reference
 * normalizer clamped. the timeline lane recomputes it; the composer writes
 * the honest one.
 *
 * @param doc the composed plan.
 * @returns the thirty-two-dim embedding.
 */
function planEmbedding(doc: PatternProject): number[] {
  const v = new Array<number>(EMBEDDING_DIM).fill(0);
  const totalSteps = Math.max(1, doc.bars * LANE_STEPS);
  let chromaSum = 0;
  for (const note of doc.notes) {
    const pc = ((Math.round(note.pitch) % 12) + 12) % 12;
    v[pc] += note.vel * Math.min(4, note.dur);
    chromaSum += note.vel * Math.min(4, note.dur);
  }
  if (chromaSum > 0) for (let i = 0; i < 12; i++) v[i] = (v[i] ?? 0) / chromaSum;
  const lead = doc.notes.filter((note) => LEAD_FAMILY.includes(note.voice));
  const bass = doc.notes.filter((note) => note.voice === "bass");
  const pad = doc.notes.filter((note) => note.voice === "pad");
  const hatDensity = doc.drums.hat.reduce((a, b) => a + b, 0) / LANE_STEPS;
  const drumDensity =
    (doc.drums.kick.reduce((a, b) => a + b, 0) +
      doc.drums.snare.reduce((a, b) => a + b, 0) +
      doc.drums.hat.reduce((a, b) => a + b, 0) +
      doc.drums.clap.reduce((a, b) => a + b, 0)) /
    (LANE_STEPS * 4);
  const leadPitches = lead.map((note) => note.pitch);
  const leadDurs = lead.map((note) => note.dur);
  const offbeats = lead.filter((note) => note.step % 2 === 1).length;
  const velValues = doc.notes.map((note) => note.vel);
  v[12] = meanOf(leadPitches) / 127;
  v[13] = Math.min(1, hatDensity * 1.6);
  v[14] = 1 - Math.min(1, (pad.length / totalSteps) * 8);
  v[15] = hatDensity;
  v[16] = Math.min(1, (lead.length / totalSteps) * 1.8);
  v[17] = drumDensity;
  v[18] = meanOf(leadDurs) / 8;
  v[19] = lead.length > 1 ? offbeats / lead.length : 0;
  const velMean = meanOf(velValues);
  const velStd = stdOf(velValues);
  v[20] = velMean;
  v[21] = velStd * 2;
  v[22] = velMean;
  v[23] = velStd * 2;
  v[24] = meanOf(leadPitches) / 127;
  v[25] = stdOf(leadPitches) / 48;
  v[26] = lead.length > 0 ? Math.min(...leadPitches) / 127 : 0;
  v[27] = lead.length > 0 ? Math.max(...leadPitches) / 127 : 0;
  v[28] = doc.bpm / 220;
  v[29] = Math.min(1, Math.log10(doc.notes.length + 1) / 2.5);
  v[30] = bass.length / totalSteps;
  v[31] = hatDensity;
  return v.map((seat) => clamp(fin(seat), 0, 1.5));
}

/**
 * The similarity law: the cosine of the plan's segment vector against the
 * profile centroid — the honest seat the floor reads. the twenty-two-seat
 * space carries no tempo seat, so a contradictory tempo moves the plan's
 * feel (the timeline synthesis answers denser seconds) but the root pin is
 * the contradiction that decorrelates the twelve chroma seats and breaks
 * the floor.
 *
 * @param doc the composed plan.
 * @param profile the genre profile.
 * @returns the cosine, rounded to four decimals.
 */
export function compositionSimilarity(doc: PatternProject, profile: GenreProfile): number {
  return round4(cosine(planVector(doc), profile.centroid));
}

// ---------------------------------------------------------------------------
// the orchestrators (last — the family law)
// ---------------------------------------------------------------------------

/** The whole composition the internal lane answers: the spec, the plan, the
 * forced pins (the prompt scalars that moved the answer away from the
 * profile's own) and the similarity. */
interface Composition {
  spec: ComposerPromptSpec;
  plan: PatternProject;
  forced: readonly string[];
  similarity: number;
}

/**
 * Composes the plan: the prompt parses, the profile loads, the laws run in
 * order (the tempo law, the root and scale law, the drum law, the note
 * law), the embedding writes and the validator guards — the plan that
 * leaves always answers validatePatternProject ok.
 *
 * @param prompt the free-text prompt.
 * @param profile the genre profile the miner answered.
 * @param salt the fresh-take salt ("" answers the canonical take).
 * @returns the composition.
 * @throws ComposerError no-profile, bad-genre, empty-profile or the
 * internal invalid-plan guard.
 */
function compose(prompt: string, profile: GenreProfile | null | undefined, salt: string): Composition {
  const checked = requireProfile(profile);
  const spec = parseComposerPrompt(prompt);
  const genre = genreById(spec.genre);
  if (genre === undefined)
    throw new ComposerError("bad-genre", `the genre "${spec.genre}" is not one of the fifteen the matrix owns`);
  const rng = mulberry32(hashSeed(`composer:${spec.seed}:${salt}`));
  // law 1 — the tempo: the prompt pin wins, else the profile's distribution
  const bpm = spec.bpm ?? profileBpm(checked, rng);
  // law 2 — the root and the scale: the prompt pins win, else the pool and
  // the genre bias (the chroma tilting the flat pool)
  const poolRoot = profileRoot(checked);
  const root = spec.root ?? poolRoot;
  const mode = profileMode(checked, poolRoot);
  const profileScale = scaleForGenre(genre, mode);
  const scale = spec.scale ?? profileScale;
  const forced: string[] = [];
  if (spec.genre !== checked.genre) forced.push("genre");
  if (spec.bpm !== null && (spec.bpm < checked.bpm.min || spec.bpm > checked.bpm.max)) forced.push("bpm");
  if (spec.root !== null && spec.root !== poolRoot) forced.push("root");
  if (spec.scale !== null && spec.scale !== profileScale) forced.push("scale");
  // the chord ladder: the harmony grammar over the kernel fold of the scale
  const key: Key = { tonic: root, mode: nearestKernelMode(scale) };
  const chords = generateProgression({
    seed: `${spec.seed}:${genre.id}:${salt}`,
    key,
    mood: moodWordsOf(prompt, genre),
    bars: spec.bars,
  });
  // law 3 — the drums: the family grid seeded by the onset curve
  const drums = buildDrums(genre.pattern, checked, spec.intensity, rng);
  // law 4 — the notes: the melody laws over the profile's band tilt
  const notes = composeNotes({ spec, profile: checked, genre, scale, root, chords, drums, rng });
  const doc: PatternProject = {
    schema: PATTERN_SCHEMA_VERSION,
    bpm,
    root,
    scale,
    bars: spec.bars,
    mood: moodLabelOf(prompt, genre),
    prompt: prompt.trim(),
    drums,
    notes,
    embedding: [],
  };
  doc.embedding = planEmbedding(doc);
  // the validators run before every return — an invalid plan is a bug
  const result = validatePatternProject(doc);
  if (!result.ok)
    throw new ComposerError(
      "invalid-plan",
      `the composed plan failed its contract (${result.code}): ${result.message}`,
    );
  return { spec, plan: result.doc, forced, similarity: compositionSimilarity(result.doc, checked) };
}

/**
 * The profile-driven plan: the prompt meets the genre profile and the
 * seeded vector plan answers — a valid debonair.pattern/1 document whose
 * serialization is byte-identical for the same prompt, profile and salt.
 *
 * @param prompt the free-text prompt.
 * @param profile the genre profile the miner answered.
 * @param salt the fresh-take salt ("" answers the canonical take).
 * @returns the composed plan (validatePatternProject ok).
 * @throws ComposerError the typed codes of the contract.
 */
export function composeFromProfile(prompt: string, profile: GenreProfile, salt = ""): PatternProject {
  return compose(prompt, profile, salt).plan;
}

/** The similar-references answer: the plan plus the audit chain — the
 * similarity against the profile centroid (the floor verdict, the forced
 * pins) and the ranked references (the miner's own law: the cosine over the
 * mean normalized segment vectors, score descending then id ascending). */
export interface CompositionReport {
  /** The composed plan (validatePatternProject ok). */
  plan: PatternProject;
  /** The cosine of the plan's segment vector against the profile centroid. */
  similarity: number;
  /** True while the similarity clears the documented floor. */
  nearCentroid: boolean;
  /** The prompt pins that moved the answer away from the profile's own
   * (the honest chain — the prompt won, the similarity says so). */
  forced: readonly string[];
  /** The ranked references (the miner's similarity applied to the plan). */
  hits: readonly SimilarityHit[];
}

/**
 * The similar-references answer: the same seeded plan the profile lane
 * composes, plus the ranked reference ids — the plan's segment vector
 * against every reference's document vector, the miner's tie law, the
 * audit chain the vitrine shows.
 *
 * @param prompt the free-text prompt.
 * @param profile the genre profile the miner answered.
 * @param references the candidate references, each with its row id.
 * @param salt the fresh-take salt ("" answers the canonical take).
 * @returns the composition report.
 * @throws ComposerError the typed codes of the contract.
 */
export function composeSimilar(
  prompt: string,
  profile: GenreProfile,
  references: readonly IngestDocumentWithId[],
  salt = "",
): CompositionReport {
  const { plan, forced, similarity } = compose(prompt, profile, salt);
  const vector = planVector(plan);
  const hits: SimilarityHit[] = references.map((reference) => ({
    id: reference.id,
    score: round4(cosine(vector, documentVector(reference))),
  }));
  hits.sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { plan, similarity, nearCentroid: similarity >= SIMILARITY_FLOOR, forced, hits };
}
