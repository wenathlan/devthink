// # harmonyengine — the progression grammar of the katexis engine (root
// layer): the documented progression sets per style, cadence detection, the
// functional tension curve, the seeded progression generator and the
// reharmonisation passes. Every random decision runs through a local
// mulberry32 seeded from a string (seed 42 plays the same song twice — the
// engine digest calls this non-negotiable for a DAW). The reharmonisation
// rules are documented next to their passes. Non-goals: no audio, no drums
// (rhythmgrammar owns the grid), no genre table (genrematrix reads this
// file). Pure and multi-mode — browser and node alike.

import {
  type Chord,
  type Key,
  chordSymbol,
  diatonicTriad,
  parseRoman,
  romanOf,
  scalePcs,
} from "./musictheory.ts";

/** One documented progression set: numerals written against its home mode. */
export interface ProgressionSpec {
  /** The mode the numerals assume ("i" = tonic minor here, tonic major in pop). */
  mode: "major" | "minor";
  /** The mood keywords the generator scores a request against. */
  moods: readonly string[];
  /** The bar loops, roman tokens joined by "-". */
  loops: readonly string[];
}

/** One bar of a generated timeline. */
export interface ChordEvent {
  /** The bar index, 0-based. */
  bar: number;
  /** The chord of the bar. */
  chord: Chord;
  /** The lead-sheet symbol ("Am7"). */
  symbol: string;
  /** The functional tension, 0..1. */
  tension: number;
}

/** The cadence names the detector answers. */
export type CadenceName = "perfect" | "authentic" | "plagal" | "deceptive" | "half" | "phrygian" | "none";

/** The result of the relative-minor reharmonisation pass. */
export interface RelativeSwap {
  /** The key after the swap (major keys move to their relative aeolian). */
  key: Key;
  /** The same chords, re-annotated as numerals of the new key. */
  numerals: readonly (string | null)[];
}

/** The documented progression sets, one entry per style family. */
export const PROGRESSION_SETS: Record<string, ProgressionSpec> = {
  pop: {
    mode: "major", moods: ["bright", "radio", "anthemic", "uplifting"],
    loops: ["I-V-vi-IV", "vi-IV-I-V", "I-vi-IV-V"],
  },
  trap: {
    mode: "minor", moods: ["dark", "hard", "808", "night"],
    loops: ["i-VI-III-VII", "i-VII-VI-VII", "i-iv-VI-V"],
  },
  drill: {
    mode: "minor", moods: ["cold", "sliding", "uk", "aggressive"],
    loops: ["i-VI-VII", "i-VII-VI", "i-iv-VI-VII"],
  },
  house: {
    mode: "minor", moods: ["dance", "groove", "club", "deep"],
    loops: ["i7-iv7-VII-VI", "i-III-VII-VI", "i7-v7-VI7-V"],
  },
  dnb: {
    mode: "minor", moods: ["fast", "liquid", "rolling", "energetic"],
    loops: ["i-VI-III-VII", "i-vii-VI-VII", "i-iv-VI-v"],
  },
  lofi: {
    mode: "major", moods: ["chill", "soft", "study", "tape", "dusty"],
    // the borrowed iv7 (minor subdominant) is the documented lo-fi extension
    loops: ["Imaj7-ii7-V7-vi7", "Imaj7-iv7-ii7-V7", "Imaj7-VImaj7-ii7-V7"],
  },
  techno: {
    mode: "minor", moods: ["hypnotic", "industrial", "raw", "warehouse"],
    loops: ["i-VII-i-VII", "i-i-VI-VII", "i-VII-VI-VII"],
  },
  ambient: {
    mode: "major", moods: ["calm", "spacious", "drift", "sleep"],
    loops: ["I-IV", "I-IV-I-V", "vi-IV-I-V"],
  },
  jazz: {
    mode: "major", moods: ["smooth", "swing", "standards", "sophisticated"],
    // bII7 is the documented tritone substitution of V7
    loops: ["ii7-V7-Imaj7", "iii7-VI7-ii7-V7", "vi7-ii7-V7-Imaj7", "ii7-bII7-Imaj7"],
  },
};

/** Every progression set id the table carries. */
export const PROGRESSION_IDS = Object.keys(PROGRESSION_SETS);

/** Functional weight per scale degree: tonic rests, dominant pulls, vii burns. */
const TENSION_DEGREE: Record<number, number> = { 1: 0.05, 2: 0.45, 3: 0.25, 4: 0.35, 5: 0.65, 6: 0.3, 7: 0.85 };

/** The tension delta per quality (extensions soften, alterations bite). */
const TENSION_QUALITY: Partial<Record<Chord["quality"], number>> = {
  dim: 0.1, dim7: 0.1, halfdim: 0.1, dom7: 0.05, dom9: 0.05,
  maj7: -0.05, maj9: -0.05, min7: -0.05, min9: -0.05, sus2: -0.05, sus4: -0.05,
};

/** The diatonic third-relation substitution table (each pair shares two tones). */
const SUBSTITUTION: Record<number, number> = { 1: 6, 6: 1, 2: 4, 4: 2, 3: 5, 5: 3, 7: 5 };

/** The modes whose tonic reads minor (the phrygian cadence only fires there). */
const MINOR_MODES: readonly string[] = [
  "natural-minor", "harmonic-minor", "melodic-minor", "aeolian", "dorian", "phrygian", "locrian",
];

/** FNV-1a: a seed string folds into one uint32. */
export function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (const ch of seed) {
    hash ^= ch.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** The canonical mulberry32 of the engine: deterministic, one uint32 seed. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The functional tension of a chord in a key: the degree weight plus the
 * quality delta; a root outside the scale sits at the flat-0.7 tension.
 */
export function tensionOf(chord: Chord, key: Key): number {
  const index = scalePcs(key).indexOf(chord.root);
  const base = index >= 0 ? (TENSION_DEGREE[index + 1] ?? 0.7) : 0.7;
  const value = base + (TENSION_QUALITY[chord.quality] ?? 0);
  return Math.min(1, Math.max(0, value));
}

/** Picks a progression set: mode match scores 2, every mood keyword hits 1; rng breaks ties. */
export function pickProgression(key: Key, mood: string, rng: () => number): ProgressionSpec {
  const wants = mood.toLowerCase().split(/\s+/).filter(Boolean);
  const score = (spec: ProgressionSpec) =>
    (spec.mode === (MINOR_MODES.includes(key.mode) ? "minor" : "major") ? 2 : 0) +
    wants.filter((w) => spec.moods.includes(w)).length;
  const best = Math.max(...PROGRESSION_IDS.map((id) => score(PROGRESSION_SETS[id])));
  const pool = PROGRESSION_IDS.map((id) => PROGRESSION_SETS[id]).filter((spec) => score(spec) === best);
  return pool[Math.floor(rng() * pool.length) % pool.length];
}

/**
 * Generates the chord timeline: seed + key + mood -> one chord per bar. The
 * rng picks the set and the loop, then the loop cycles across `bars`.
 */
export function generateProgression(options: {
  seed: string;
  key: Key;
  mood?: string;
  bars?: number;
}): ChordEvent[] {
  const rng = mulberry32(hashSeed(options.seed));
  const spec = pickProgression(options.key, options.mood ?? "", rng);
  const loop = spec.loops[Math.floor(rng() * spec.loops.length) % spec.loops.length].split("-");
  const bars = Math.max(1, Math.round(options.bars ?? 8));
  const events: ChordEvent[] = [];
  for (let bar = 0; bar < bars; bar++) {
    const chord = parseRoman(loop[bar % loop.length], options.key);
    if (chord === null) throw new Error(`unparseable numeral in set loop: ${loop[bar % loop.length]}`);
    events.push({ bar, chord, symbol: chordSymbol(chord), tension: tensionOf(chord, options.key) });
  }
  return events;
}

/**
 * Detects the cadence of the last two chords. Documented rules: 5->1 perfect
 * (V7) or authentic, 5->6 deceptive, 4->1 plagal, 2/4->5 half, and the minor
 * iv->V phrygian; anything else, or any chromatic root, is "none".
 */
export function detectCadence(chords: readonly Chord[], key: Key): CadenceName {
  if (chords.length < 2) return "none";
  const pcs = scalePcs(key);
  const degree = (chord: Chord) => {
    const index = pcs.indexOf(chord.root);
    return index < 0 ? null : index + 1;
  };
  const penult = degree(chords[chords.length - 2]);
  const final = degree(chords[chords.length - 1]);
  if (penult === null || final === null) return "none";
  const penultChord = chords[chords.length - 2];
  if (penult === 5 && final === 1) return penultChord.quality === "dom7" ? "perfect" : "authentic";
  if (penult === 5 && final === 6) return "deceptive";
  if (penult === 4 && final === 1) return "plagal";
  if (penult === 4 && final === 5)
    return MINOR_MODES.includes(key.mode) && penultChord.quality === "min" ? "phrygian" : "half";
  if (penult === 2 && final === 5) return "half";
  return "none";
}

/**
 * Reharmonisation pass 1 — diatonic substitution. Rule: a diatonic chord may
 * swap with its third-relation partner (I<->vi, ii<->IV, iii<->V, vii->V,
 * mirrored in minor), which shares two of its tones; the rng draws per chord
 * against `probability`; chromatic roots and slash basses are left alone.
 */
export function reharmonizeDiatonic(
  chords: readonly Chord[],
  key: Key,
  rng: () => number,
  probability = 0.5,
): Chord[] {
  const pcs = scalePcs(key);
  return chords.map((chord) => {
    const index = pcs.indexOf(chord.root);
    const partner = index < 0 ? undefined : SUBSTITUTION[index + 1];
    if (partner === undefined || rng() >= probability) return { ...chord };
    const swap = diatonicTriad(key, partner);
    return swap === null ? { ...chord } : swap;
  });
}

/**
 * Reharmonisation pass 2 — relative minor swap. Rule: major keys move to
 * their relative aeolian (tonic + 3 degrees); because both scales share the
 * same seven pitch classes, every chord keeps its notes and only its numeral
 * changes (each degree shifts by +2, qualities re-read diatonically).
 */
export function reharmonizeRelative(chords: readonly Chord[], key: Key): RelativeSwap {
  const toMinor = !MINOR_MODES.includes(key.mode);
  const next: Key = toMinor
    ? { tonic: (((key.tonic + 9) % 12) + 12) % 12, mode: "aeolian" }
    : { tonic: (((key.tonic + 3) % 12) + 12) % 12, mode: "major" };
  return { key: next, numerals: chords.map((chord) => romanOf(chord, next)) };
}
