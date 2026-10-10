// # genrematrix — the deterministic style dictionary of the katexis engine
// (root layer): the fifteen genre entries the generator reads, each carrying
// its bpm range, swing default, pattern family reference, scale biases,
// progression set reference, mix target (the documented LUFS the mix wave
// masters towards) and timbre hints. The matrix is a pure table: every
// reference is validated against the sibling tables by validateMatrix, and
// every pick (bpm, genre match) runs on the engine's seeded rng — same seed,
// same record. Non-goals: no synthesis, no patterns of its own (the family
// grids live in rhythmgrammar, the loops in harmonyengine).

import { SCALE_NAMES, type ScaleName } from "./musictheory.ts";
import { FAMILY_NAMES, type FamilyName } from "./rhythmgrammar.ts";
import { PROGRESSION_IDS, hashSeed, mulberry32 } from "./harmonyengine.ts";

/** One genre of the generator's style dictionary. */
export interface GenreStyle {
  /** The stable id the generator and the schema reference ("rude-trap"). */
  id: string;
  /** The human label of the picker ("Rude Trap"). */
  label: string;
  /** The inclusive bpm range of the genre. */
  bpmin: number;
  /** The inclusive bpm ceiling of the genre. */
  bpmax: number;
  /** The default bpm a fresh project opens at. */
  bpm: number;
  /** The swing default (the swung midpoint, 0.5 = straight). */
  swing: number;
  /** The pattern family of rhythmgrammar the drums read. */
  pattern: FamilyName;
  /** The scale biases, most likely first. */
  scales: readonly ScaleName[];
  /** The progression set id of harmonyengine the chords read. */
  progressions: string;
  /** The mix target in LUFS (documented per genre, mastering reads it). */
  lufs: number;
  /** The timbre hints the synthesis wave tags its layers with. */
  timbre: readonly string[];
}

/**
 * The fifteen genres. Loudness targets follow the corpus: loudness-war
 * styles master to -7..-9 LUFS, streaming-native styles to -14, ambient
 * sits quiet at -16 (the ATM analysis measured -9.1 for a trap record).
 */
export const GENRES: readonly GenreStyle[] = [
  {
    id: "trap", label: "Trap", bpmin: 130, bpmax: 150, bpm: 140, swing: 0.5, pattern: "trap",
    scales: ["natural-minor", "harmonic-minor"], progressions: "trap", lufs: -9,
    timbre: ["808-sub", "dark-bells", "distorted-hats"],
  },
  {
    id: "drill", label: "Drill", bpmin: 138, bpmax: 146, bpm: 142, swing: 0.5, pattern: "drill",
    scales: ["harmonic-minor", "phrygian"], progressions: "drill", lufs: -8,
    timbre: ["sliding-808", "orchestral-stabs", "uk-hats"],
  },
  {
    id: "hiphop", label: "Hip Hop", bpmin: 84, bpmax: 96, bpm: 90, swing: 0.58, pattern: "lofi",
    scales: ["dorian", "natural-minor"], progressions: "jazz", lufs: -10,
    timbre: ["sample-chops", "vinyl-crackle", "punchy-kick"],
  },
  {
    id: "rude-trap", label: "Rude Trap", bpmin: 144, bpmax: 160, bpm: 150, swing: 0.5, pattern: "trap",
    scales: ["phrygian", "harmonic-minor"], progressions: "trap", lufs: -8,
    timbre: ["screaming-808", "metal-hats", "horror-leads"],
  },
  {
    id: "house", label: "House", bpmin: 120, bpmax: 128, bpm: 124, swing: 0.54, pattern: "house",
    scales: ["natural-minor", "dorian"], progressions: "house", lufs: -9,
    timbre: ["filtered-chords", "disco-bass", "four-on-floor"],
  },
  {
    id: "techno", label: "Techno", bpmin: 126, bpmax: 142, bpm: 132, swing: 0.5, pattern: "techno",
    scales: ["phrygian", "natural-minor"], progressions: "techno", lufs: -9,
    timbre: ["hypnotic-arp", "analog-drone", "raw-kick"],
  },
  {
    id: "edm", label: "EDM", bpmin: 126, bpmax: 132, bpm: 128, swing: 0.5, pattern: "house",
    scales: ["major", "natural-minor"], progressions: "pop", lufs: -8,
    timbre: ["supersaw", "sidechain-pad", "festival-drop"],
  },
  {
    id: "dnb", label: "Drum & Bass", bpmin: 168, bpmax: 176, bpm: 174, swing: 0.5, pattern: "dnb",
    scales: ["natural-minor", "dorian"], progressions: "dnb", lufs: -8,
    timbre: ["reese-bass", "amen-break", "liquid-pads"],
  },
  {
    id: "ambient", label: "Ambient", bpmin: 60, bpmax: 80, bpm: 70, swing: 0.5, pattern: "ambient",
    scales: ["lydian", "major", "natural-minor"], progressions: "ambient", lufs: -16,
    timbre: ["granular-pad", "field-recording", "slow-shimmer"],
  },
  {
    id: "lofi", label: "Lo-Fi", bpmin: 72, bpmax: 88, bpm: 80, swing: 0.62, pattern: "lofi",
    scales: ["dorian", "major", "natural-minor"], progressions: "lofi", lufs: -14,
    timbre: ["tape-saturation", "jazz-keys", "dusty-drums"],
  },
  {
    id: "pop", label: "Pop", bpmin: 100, bpmax: 120, bpm: 110, swing: 0.53, pattern: "pop",
    scales: ["major", "mixolydian"], progressions: "pop", lufs: -9,
    timbre: ["bright-vocal-chain", "plucky-synth", "tight-kick"],
  },
  {
    id: "rnb", label: "R&B", bpmin: 88, bpmax: 104, bpm: 96, swing: 0.6, pattern: "lofi",
    scales: ["natural-minor", "dorian"], progressions: "jazz", lufs: -10,
    timbre: ["silky-keys", "finger-snap", "deep-bass"],
  },
  {
    id: "hyperpop", label: "Hyperpop", bpmin: 140, bpmax: 165, bpm: 150, swing: 0.5, pattern: "pop",
    scales: ["major", "lydian"], progressions: "pop", lufs: -7,
    timbre: ["pitched-vocal-stack", "glitch-perc", "brash-synth"],
  },
  {
    id: "afrobeats", label: "Afrobeats", bpmin: 100, bpmax: 112, bpm: 106, swing: 0.58, pattern: "pop",
    scales: ["major", "mixolydian"], progressions: "pop", lufs: -10,
    timbre: ["log-drum", "shaker-groove", "airy-pad"],
  },
  {
    id: "jazz", label: "Jazz", bpmin: 120, bpmax: 160, bpm: 132, swing: 0.66, pattern: "lofi",
    scales: ["major", "dorian", "mixolydian"], progressions: "jazz", lufs: -12,
    timbre: ["brushed-kit", "upright-bass", "rhodes"],
  },
];

/** Finds a genre by its stable id. */
export function genreById(id: string): GenreStyle | undefined {
  return GENRES.find((genre) => genre.id === id);
}

/** Picks a bpm inside the genre's range from a seed string (deterministic). */
export function pickBpm(genre: GenreStyle, seed: string): number {
  const rng = mulberry32(hashSeed(`${genre.id}:${seed}`));
  return genre.bpmin + Math.floor(rng() * (genre.bpmax - genre.bpmin + 1));
}

/**
 * Matches a free-text request to a genre: every whitespace token that appears
 * in the id, label or timbre tags scores one point; the best score wins and
 * ties resolve to the earlier entry; no hit answers undefined.
 */
export function matchGenre(query: string): GenreStyle | undefined {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  let best: GenreStyle | undefined;
  let bestScore = 0;
  for (const genre of GENRES) {
    const haystack = `${genre.id} ${genre.label} ${genre.timbre.join(" ")}`.toLowerCase();
    const score = tokens.filter((token) => haystack.includes(token)).length;
    if (score > bestScore) {
      best = genre;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : undefined;
}

/** Validates the whole matrix against the sibling tables; answers the problems. */
export function validateMatrix(): string[] {
  const problems: string[] = [];
  if (GENRES.length !== 15) problems.push(`the matrix holds ${GENRES.length} genres, expected 15`);
  const ids = new Set<string>();
  for (const genre of GENRES) {
    if (ids.has(genre.id)) problems.push(`duplicate genre id: ${genre.id}`);
    ids.add(genre.id);
    if (!(genre.bpm > 0) || genre.bpmin > genre.bpm || genre.bpm > genre.bpmax)
      problems.push(`${genre.id}: bpm ${genre.bpm} outside [${genre.bpmin}, ${genre.bpmax}]`);
    if (!(genre.swing >= 0.5 && genre.swing <= 0.75)) problems.push(`${genre.id}: swing ${genre.swing} out of band`);
    if (!FAMILY_NAMES.includes(genre.pattern)) problems.push(`${genre.id}: unknown pattern family ${genre.pattern}`);
    if (!PROGRESSION_IDS.includes(genre.progressions)) problems.push(`${genre.id}: unknown progression set ${genre.progressions}`);
    if (genre.scales.length === 0) problems.push(`${genre.id}: no scale bias`);
    for (const scale of genre.scales) if (!SCALE_NAMES.includes(scale)) problems.push(`${genre.id}: unknown scale ${scale}`);
    if (!Number.isFinite(genre.lufs) || genre.lufs < -16 || genre.lufs > -7) problems.push(`${genre.id}: lufs ${genre.lufs} out of band`);
    if (genre.timbre.length === 0) problems.push(`${genre.id}: no timbre hints`);
  }
  return problems;
}
