// # theory — the one keyword file of the music theory domain of the
// katexis engine: the consolidation law of the root (one keyword file per
// family — the theory, the grammar, the style dictionary and the beat law
// that lived scattered across the app's leaf files unified into one module,
// every file one responsibility) folded the seven wave files of the theory
// family into this seat — the theory kernel (the former musictheory.ts body
// below), the tuning conversion (tuning.ts), the progression grammar
// (harmonyengine.ts), the drum-pattern grammar (rhythmgrammar.ts), the
// style dictionary (genrematrix.ts) and the beat grid (beatgrid.ts) —
// every export preserved verbatim, zero logic changes. The consolidation
// notes: the intra-family imports the waves carried (the progression
// grammar reading the kernel, the style dictionary reading the grammar,
// the drum grammar and the kernel) dissolved into the seat; the eighth
// member the audit census named (the trained genre corpus, genre.ts)
// rides OUTSIDE this seat by the layer law its own import graph answers —
// the corpus lane reads the pattern miner (the corpus training calls the
// mineGenre engine beside the profile tables) while the pattern family
// reads this kernel's SCALE_STEPS, so seating the corpus here would bend
// the family line (genre → pattern → theory) into a cycle no module
// evaluator walks safely — the corpus stays in its own genre.ts seat at
// the pattern layer, importing the dictionary names from this seat as the
// re-export face it always carried; no same-name export collision lived in
// two sources across the seven seated members, so no group suffix rides
// any public name — the one private pair the census found is the failure
// constructor both the beat grid and the unseated corpus carry (never
// verbatim — the beat one answers the typed BeatResult, the corpus one
// CorpusResult) — the beat grid's copy rides as failBeat; and the retired
// alias face patternenums.ts (the fourteen-line re-export of pattern.ts
// the logicfold2 wave left so relative importers kept resolving, while
// the published map already answered "./patternenums" from pattern.ts)
// rode no importer at all — the alias retired with this fold, the pattern
// vocabulary staying in the pattern family's own keyed file where the
// alias's own header pins it (the theory seat never claims the pattern
// domain).

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: musictheory.ts — the theory kernel (the first section). */
/* ══════════════════════════════════════════════════════════════════════ */

// # musictheory — the theory kernel of the katexis engine (root layer):
// scales, interval math, the chord vocabulary over all twelve roots,
// roman-numeral parsing and the voice-leading helpers. The design follows the
// engine digest: theory-first, deterministic, zero dependencies — one scale
// table, one interval table, one chord-shape table; every function reads the
// tables and nothing else. Non-goals: no audio, no scheduling, no playback;
// the harmony grammar, rhythm grammar and genre matrix own their layers and
// import from here. Pure and multi-mode — the same call runs in the browser
// and in node (the unit tests).

/** A key: a tonic pitch class and a mode from the scale table. */
export interface Key {
  /** The tonic pitch class, 0..11 (0 = C, 1 = C# ...). */
  tonic: number;
  /** The mode name of the scale table. */
  mode: ScaleName;
}

/** A chord: a root pitch class, a quality and an optional slash bass. */
export interface Chord {
  /** The root pitch class, 0..11. */
  root: number;
  /** The quality of the chord-shape table. */
  quality: ChordQuality;
  /** The slash bass pitch class, when the chord reads "Am7/G". */
  bass?: number;
}

/** The chord qualities the shape table carries (triads, sus, 6th/7th/9th). */
export type ChordQuality =
  | "maj"
  | "min"
  | "dim"
  | "aug"
  | "sus2"
  | "sus4"
  | "maj6"
  | "min6"
  | "dom7"
  | "maj7"
  | "min7"
  | "halfdim"
  | "dim7"
  | "minmaj7"
  | "dom9"
  | "maj9"
  | "min9"
  | "add9";

/** The scale vocabulary of the engine. */
export type ScaleName =
  | "major"
  | "natural-minor"
  | "harmonic-minor"
  | "melodic-minor"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "aeolian"
  | "locrian"
  | "pentatonic-major"
  | "pentatonic-minor"
  | "blues";

/** The chromatic note names (sharp spelling), index = pitch class. */
export const NOTE_NAMES: readonly string[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/** The flat spelling of the same wheel (used by flat keys). */
export const FLAT_NAMES: readonly string[] = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

/** The semitone steps of every scale, counted from the tonic. */
export const SCALE_STEPS: Record<ScaleName, readonly number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  "natural-minor": [0, 2, 3, 5, 7, 8, 10],
  "harmonic-minor": [0, 2, 3, 5, 7, 8, 11],
  "melodic-minor": [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  "pentatonic-major": [0, 2, 4, 7, 9],
  "pentatonic-minor": [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
};

/** Every scale name the table carries. */
export const SCALE_NAMES = Object.keys(SCALE_STEPS) as ScaleName[];

/** The interval names by semitone distance, 0..11. */
export const INTERVAL_NAMES: readonly string[] = [
  "unison",
  "minor second",
  "major second",
  "minor third",
  "major third",
  "perfect fourth",
  "tritone",
  "perfect fifth",
  "minor sixth",
  "major sixth",
  "minor seventh",
  "major seventh",
];

/** The chord shapes: semitone steps from the root, per quality. */
export const CHORD_SHAPES: Record<ChordQuality, readonly number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  maj6: [0, 4, 7, 9],
  min6: [0, 3, 7, 9],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  halfdim: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  minmaj7: [0, 3, 7, 11],
  dom9: [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  min9: [0, 3, 7, 10, 14],
  add9: [0, 4, 7, 14],
};

/** The symbol suffix every quality appends after the note name. */
export const CHORD_SUFFIX: Record<ChordQuality, string> = {
  maj: "",
  min: "m",
  dim: "dim",
  aug: "aug",
  sus2: "sus2",
  sus4: "sus4",
  maj6: "6",
  min6: "m6",
  dom7: "7",
  maj7: "maj7",
  min7: "m7",
  halfdim: "m7b5",
  dim7: "dim7",
  minmaj7: "mmaj7",
  dom9: "9",
  maj9: "maj9",
  min9: "m9",
  add9: "add9",
};

/** The quality suffixes a roman numeral may carry (case-aware). */
const ROMAN_QUALITY: Record<string, { upper: ChordQuality; lower: ChordQuality }> = {
  "": { upper: "maj", lower: "min" },
  "7": { upper: "dom7", lower: "min7" },
  "6": { upper: "maj6", lower: "min6" },
  "9": { upper: "dom9", lower: "min9" },
  maj7: { upper: "maj7", lower: "maj7" },
  m7: { upper: "min7", lower: "min7" },
  maj9: { upper: "maj9", lower: "maj9" },
  m9: { upper: "min9", lower: "min9" },
  add9: { upper: "add9", lower: "add9" },
  sus2: { upper: "sus2", lower: "sus2" },
  sus4: { upper: "sus4", lower: "sus4" },
  dim: { upper: "dim", lower: "dim" },
  dim7: { upper: "dim7", lower: "dim7" },
  o: { upper: "dim", lower: "dim" },
  o7: { upper: "dim7", lower: "dim7" },
  m7b5: { upper: "halfdim", lower: "halfdim" },
  aug: { upper: "aug", lower: "aug" },
  "+": { upper: "aug", lower: "aug" },
};

/** The numeral suffix every quality serialises back to (romanOf). */
const NUMERAL_SUFFIX: Record<ChordQuality, string> = {
  maj: "",
  min: "",
  dim: "dim",
  aug: "aug",
  sus2: "sus2",
  sus4: "sus4",
  maj6: "6",
  min6: "6",
  dom7: "7",
  maj7: "maj7",
  min7: "7",
  halfdim: "m7b5",
  dim7: "dim7",
  minmaj7: "maj7",
  dom9: "9",
  maj9: "maj9",
  min9: "9",
  add9: "add9",
};

const ROMAN_LETTERS: readonly string[] = ["I", "II", "III", "IV", "V", "VI", "VII"];
const ROMAN_DEGREES: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7 };
const TRIAD_QUALITIES: readonly ChordQuality[] = ["maj", "min", "dim", "aug"];

/** Folds any integer onto the twelve pitch classes. */
export function transposePc(pc: number, semitones: number): number {
  return (((pc + semitones) % 12) + 12) % 12;
}

/** The note name of a pitch class (flat spelling on request). */
export function noteName(pc: number, flats = false): string {
  return (flats ? FLAT_NAMES : NOTE_NAMES)[((pc % 12) + 12) % 12];
}

/** Parses a note name ("C", "F#", "Eb") into a pitch class; null when malformed. */
export function noteToPc(name: string): number | null {
  const match = /^([A-G])([b#]*)$/.exec(name.trim());
  if (!match) return null;
  let pc = NOTE_NAMES.indexOf(match[1]);
  for (const accidental of match[2]) pc += accidental === "#" ? 1 : -1;
  return pc < 0 ? null : ((pc % 12) + 12) % 12;
}

/** The interval name of an integer semitone distance (mod 12). */
export function intervalName(semitones: number): string {
  return INTERVAL_NAMES[((((Math.round(semitones) % 12) + 12) % 12) + 12) % 12];
}

/** The interval name between two pitch classes (from towards to, mod 12). */
export function intervalBetween(from: number, to: number): string {
  return intervalName(to - from);
}

/** Builds a chord over any of the twelve roots. */
export function makeChord(root: number, quality: ChordQuality, bass?: number): Chord {
  const chord: Chord = { root: transposePc(root, 0), quality };
  return bass === undefined ? chord : { ...chord, bass: transposePc(bass, 0) };
}

/** The chord shape intervals of a quality. */
export function chordIntervals(quality: ChordQuality): readonly number[] {
  return CHORD_SHAPES[quality];
}

/** The pitch classes a chord covers (the slash bass first, when present). */
export function chordPcs(chord: Chord): number[] {
  const pcs = CHORD_SHAPES[chord.quality].map((step) => transposePc(chord.root, step));
  return chord.bass === undefined ? pcs : [chord.bass, ...pcs];
}

/** Stacks the chord ascending from C4's octave (C4 = midi 60); the bass is not stacked. */
export function chordNotes(chord: Chord, octave = 4): number[] {
  const base = 12 * (octave + 1) + chord.root;
  return CHORD_SHAPES[chord.quality].map((step) => base + step);
}

/** The lead-sheet symbol of a chord ("Am7/G"). */
export function chordSymbol(chord: Chord): string {
  const head = `${noteName(chord.root)}${CHORD_SUFFIX[chord.quality]}`;
  return chord.bass === undefined ? head : `${head}/${noteName(chord.bass)}`;
}

/** The quality whose shape equals the given intervals (triads only); null otherwise. */
export function qualityFromIntervals(intervals: readonly number[]): ChordQuality | null {
  for (const quality of TRIAD_QUALITIES) {
    const shape = CHORD_SHAPES[quality];
    if (shape.length === intervals.length && shape.every((step, i) => step === intervals[i])) return quality;
  }
  return null;
}

/** Parses a lead-sheet token ("Cmaj7", "Am7/G", "F#m7b5", "Db9"); null when malformed. */
export function parseChord(token: string): Chord | null {
  const match = /^([A-G])([#b]{0,8})([^/]{0,64})(?:\/([A-G][#b]{0,8}))?$/.exec(token.trim());
  if (!match) return null;
  const root = noteToPc(`${match[1]}${match[2]}`);
  if (root === null) return null;
  const aliases: Record<string, ChordQuality> = { maj: "maj", min: "min", o: "dim", "+": "aug" };
  const quality =
    (Object.keys(CHORD_SUFFIX) as ChordQuality[]).find((q) => CHORD_SUFFIX[q] === match[3]) ??
    aliases[match[3]] ??
    null;
  if (quality === null) return null;
  const bass = match[4] === undefined ? undefined : noteToPc(match[4]);
  return bass === null ? null : makeChord(root, quality, bass);
}

/** The pitch classes of a key's scale, from the tonic. */
export function scalePcs(key: Key): number[] {
  return SCALE_STEPS[key.mode].map((step) => transposePc(key.tonic, step));
}

/** The pitch class of a scale degree (1-based) with an optional #-/b-shift. */
export function degreeToPc(key: Key, degree: number, accidental = 0): number {
  const steps = SCALE_STEPS[key.mode];
  const index = Math.min(steps.length, Math.max(1, Math.round(degree))) - 1;
  return transposePc(key.tonic, steps[index] + accidental);
}

/** The diatonic triad on a scale degree; null on scales shorter than seven notes. */
export function diatonicTriad(key: Key, degree: number): Chord | null {
  const steps = SCALE_STEPS[key.mode];
  if (steps.length < 7) return null;
  const first = Math.max(1, Math.round(degree));
  const at = (skip: number) => {
    const position = first - 1 + skip;
    return transposePc(key.tonic, steps[position % 7] + 12 * Math.floor(position / 7));
  };
  const root = at(0);
  const quality = qualityFromIntervals([0, (at(2) - root + 36) % 12, (at(4) - root + 36) % 12]);
  return quality === null ? null : makeChord(root, quality);
}

/**
 * Parses a roman numeral in a key ("i", "IV", "v7", "bIII", "#iv", "viio",
 * "VImaj7"): case sets the base quality, a leading b/# shifts the degree's
 * root, the suffix picks from the roman quality table. Null when malformed.
 */
export function parseRoman(token: string, key: Key): Chord | null {
  const match = /^([b#]{0,8})([ivIV]{1,32})(.{0,256})$/.exec(token.trim());
  if (!match) return null;
  const degree = ROMAN_DEGREES[match[2].toLowerCase()];
  const entry = ROMAN_QUALITY[match[3]];
  if (degree === undefined || entry === undefined) return null;
  const isUpper = match[2] === match[2].toUpperCase() && match[2] !== match[2].toLowerCase();
  const accidental = match[1].includes("#") ? 1 : match[1].includes("b") ? -1 : 0;
  return makeChord(degreeToPc(key, degree, accidental), isUpper ? entry.upper : entry.lower);
}

/**
 * Re-annotates a chord as a roman numeral of a key; null when the root sits
 * outside the scale. The case mirrors the chord's own quality (minor and
 * diminished qualities read lowercase, so a raised V7 in minor stays upper),
 * the suffix mirrors the quality — parseRoman(romanOf(chord, key), key)
 * round-trips root and quality for every diatonic chord.
 */
export function romanOf(chord: Chord, key: Key): string | null {
  const index = scalePcs(key).indexOf(chord.root);
  if (index < 0) return null;
  const lower =
    chord.quality === "min" ||
    chord.quality === "min6" ||
    chord.quality === "min7" ||
    chord.quality === "min9" ||
    chord.quality === "minmaj7" ||
    chord.quality === "dim" ||
    chord.quality === "halfdim" ||
    chord.quality === "dim7";
  const letters = lower ? ROMAN_LETTERS[index].toLowerCase() : ROMAN_LETTERS[index];
  return `${letters}${NUMERAL_SUFFIX[chord.quality]}`;
}

/** How many pitch classes two voicings share. */
export function commonTones(from: readonly number[], to: readonly number[]): number {
  const a = new Set(from.map((n) => ((n % 12) + 12) % 12));
  const b = new Set(to.map((n) => ((n % 12) + 12) % 12));
  let shared = 0;
  for (const pc of a) if (b.has(pc)) shared++;
  return shared;
}

/** Total nearest pitch-class movement (in semitones) from one voicing to the next. */
export function voiceLeadDistance(from: readonly number[], to: readonly number[]): number {
  const targets = to.map((n) => ((n % 12) + 12) % 12);
  return from.reduce((total, note) => {
    const pc = ((note % 12) + 12) % 12;
    const move = targets.map((t) => Math.min((((t - pc) % 12) + 12) % 12, (((pc - t) % 12) + 12) % 12));
    return total + Math.min(...move);
  }, 0);
}

/**
 * The inversion of a chord whose bass sits nearest to a reference midi note:
 * every rotation is stacked ascending from its bass; ties prefer root position.
 */
export function nearestInversion(chord: Chord, reference: number): { notes: number[]; inversion: number } {
  const pcs = CHORD_SHAPES[chord.quality].map((step) => transposePc(chord.root, step));
  let best: { notes: number[]; inversion: number; distance: number } | null = null;
  for (let inversion = 0; inversion < pcs.length; inversion++) {
    const delta = (((pcs[inversion] - reference) % 12) + 12) % 12;
    const distance = Math.min(delta, 12 - delta);
    const bass = distance === delta ? reference + delta : reference - (12 - delta);
    const notes = pcs.map((_, i) => bass + ((((pcs[(inversion + i) % pcs.length] - pcs[inversion]) % 12) + 12) % 12));
    if (best === null || distance < best.distance) best = { notes, inversion, distance };
  }
  return { notes: best === null ? [] : best.notes, inversion: best === null ? 0 : best.inversion };
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: tuning.ts — the midi-to-hertz helper of the transport. */
/* ══════════════════════════════════════════════════════════════════════ */

// # tuning — the midi-to-hertz helper of the studio transport (root logic,
// moved from sol/studio/tuning.ts): the single conversion every synth recipe
// reads. Twelve-tone equal temperament, A4 = 440 Hz. Pure and side-effect
// free.

/** The A4 reference of the studio (Hz). */
export const CONCERT_PITCH = 440;

/** The midi note number A4 answers to. */
export const A4_MIDI = 69;

/**
 * Converts a midi note number to its frequency.
 *
 * @param midi the note number (fractional bends allowed).
 * @returns the frequency in Hz.
 */
export function midiToHz(midi: number): number {
  return CONCERT_PITCH * 2 ** ((midi - A4_MIDI) / 12);
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: harmonyengine.ts — the progression grammar (the intra-family */
/* import of the theory kernel dissolved into the seat).             */
/* ══════════════════════════════════════════════════════════════════════ */

// # harmonyengine — the progression grammar of the katexis engine (root
// layer): the documented progression sets per style, cadence detection, the
// functional tension curve, the seeded progression generator and the
// reharmonisation passes. Every random decision runs through a local
// mulberry32 seeded from a string (seed 42 plays the same song twice — the
// engine digest calls this non-negotiable for a DAW). The reharmonisation
// rules are documented next to their passes. Non-goals: no audio, no drums
// (rhythmgrammar owns the grid), no genre table (genrematrix reads this
// file). Pure and multi-mode — browser and node alike.


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
    mode: "major",
    moods: ["bright", "radio", "anthemic", "uplifting"],
    loops: ["I-V-vi-IV", "vi-IV-I-V", "I-vi-IV-V"],
  },
  trap: {
    mode: "minor",
    moods: ["dark", "hard", "808", "night"],
    loops: ["i-VI-III-VII", "i-VII-VI-VII", "i-iv-VI-V"],
  },
  drill: {
    mode: "minor",
    moods: ["cold", "sliding", "uk", "aggressive"],
    loops: ["i-VI-VII", "i-VII-VI", "i-iv-VI-VII"],
  },
  house: {
    mode: "minor",
    moods: ["dance", "groove", "club", "deep"],
    loops: ["i7-iv7-VII-VI", "i-III-VII-VI", "i7-v7-VI7-V"],
  },
  dnb: {
    mode: "minor",
    moods: ["fast", "liquid", "rolling", "energetic"],
    loops: ["i-VI-III-VII", "i-vii-VI-VII", "i-iv-VI-v"],
  },
  lofi: {
    mode: "major",
    moods: ["chill", "soft", "study", "tape", "dusty"],
    // the borrowed iv7 (minor subdominant) is the documented lo-fi extension
    loops: ["Imaj7-ii7-V7-vi7", "Imaj7-iv7-ii7-V7", "Imaj7-VImaj7-ii7-V7"],
  },
  techno: {
    mode: "minor",
    moods: ["hypnotic", "industrial", "raw", "warehouse"],
    loops: ["i-VII-i-VII", "i-i-VI-VII", "i-VII-VI-VII"],
  },
  ambient: {
    mode: "major",
    moods: ["calm", "spacious", "drift", "sleep"],
    loops: ["I-IV", "I-IV-I-V", "vi-IV-I-V"],
  },
  jazz: {
    mode: "major",
    moods: ["smooth", "swing", "standards", "sophisticated"],
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
  dim: 0.1,
  dim7: 0.1,
  halfdim: 0.1,
  dom7: 0.05,
  dom9: 0.05,
  maj7: -0.05,
  maj9: -0.05,
  min7: -0.05,
  min9: -0.05,
  sus2: -0.05,
  sus4: -0.05,
};

/** The diatonic third-relation substitution table (each pair shares two tones). */
const SUBSTITUTION: Record<number, number> = { 1: 6, 6: 1, 2: 4, 4: 2, 3: 5, 5: 3, 7: 5 };

/** The modes whose tonic reads minor (the phrygian cadence only fires there). */
const MINOR_MODES: readonly string[] = [
  "natural-minor",
  "harmonic-minor",
  "melodic-minor",
  "aeolian",
  "dorian",
  "phrygian",
  "locrian",
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
export function generateProgression(options: { seed: string; key: Key; mood?: string; bars?: number }): ChordEvent[] {
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
export function reharmonizeDiatonic(chords: readonly Chord[], key: Key, rng: () => number, probability = 0.5): Chord[] {
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

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: rhythmgrammar.ts — the drum-pattern grammar. */
/* ══════════════════════════════════════════════════════════════════════ */

// # rhythmgrammar — the drum-pattern grammar of the katexis engine (root
// layer): the sixteen-step grid, the eight documented genre families, swing
// offsets, seeded fills, accent curves and the half/double-time folding. A
// PatternGrid carries velocities only — timing lives in the beat grid
// (beatgrid.ts), so swing answers per-step offsets in step units and the
// synthesis wave turns both into hits. The family patterns are written as
// glyph strings ("-" rest, ":" ghost 0.35, "o" mid 0.6, "x" accent 0.85,
// "X" full 1) so every fixture is readable and deterministic by eye.
// Non-goals: no audio, no humanise noise (the synthesis wave owns it), no
// genre table (genrematrix reads this file). Pure and multi-mode.

/** The eight lanes of the grid. */
export type LaneName = "kick" | "snare" | "hat" | "openhat" | "clap" | "perc" | "ride" | "tom";

/** One sixteen-step bar of velocities per lane (0..1, 0 = silent). */
export interface PatternGrid {
  /** The step count, always 16. */
  steps: number;
  /** One velocity array of length 16 per lane. */
  lanes: Record<LaneName, number[]>;
}

/** A grid plus the per-step swing offsets the scheduler adds (in steps). */
export interface SwingGrid {
  /** The untouched grid (a clone). */
  grid: PatternGrid;
  /** The offset per step in step units (0 = straight). */
  offsets: number[];
}

/** The eight documented pattern families. */
export type FamilyName = "trap" | "drill" | "house" | "dnb" | "lofi" | "pop" | "techno" | "ambient";

export const LANES: readonly LaneName[] = ["kick", "snare", "hat", "openhat", "clap", "perc", "ride", "tom"];
export const FAMILY_NAMES: readonly FamilyName[] = [
  "trap",
  "drill",
  "house",
  "dnb",
  "lofi",
  "pop",
  "techno",
  "ambient",
];
export const STEPS = 16;

/** The velocity glyph table. */
const VEL: Record<string, number> = { "-": 0, ":": 0.35, o: 0.6, x: 0.85, X: 1 };

/** Parses one glyph string into a velocity lane (throws on a malformed row). */
function lane(pattern: string): number[] {
  if (pattern.length !== STEPS) throw new Error(`lane must hold ${STEPS} glyphs`);
  return [...pattern].map((glyph) => {
    const velocity = VEL[glyph];
    if (velocity === undefined) throw new Error(`unknown velocity glyph: ${glyph}`);
    return velocity;
  });
}

/** Builds a grid from one glyph string per lane. */
export function gridFromSpec(spec: Record<LaneName, string>): PatternGrid {
  const lanes = {} as Record<LaneName, number[]>;
  for (const name of LANES) lanes[name] = lane(spec[name] ?? "----------------");
  return { steps: STEPS, lanes };
}

/** An all-silent grid. */
export function emptyGrid(): PatternGrid {
  return gridFromSpec({} as Record<LaneName, string>);
}

/** A deep clone (mutating a copy never touches the family tables). */
export function cloneGrid(grid: PatternGrid): PatternGrid {
  const lanes = {} as Record<LaneName, number[]>;
  for (const name of LANES) lanes[name] = [...grid.lanes[name]];
  return { steps: grid.steps, lanes };
}

/** The eight base families of the grammar (documented classic placements). */
export const FAMILIES: Record<FamilyName, PatternGrid> = {
  trap: gridFromSpec({
    // 808 hits on 1, the "and" of 2 and of 3; hats 8ths closing into a roll
    kick: "X-------x--X----",
    snare: "--------x-------",
    hat: "x-o-x-o-x-o-xoXX",
    openhat: "------------x---",
    clap: "--------x-------",
    perc: "----:-------:---",
    ride: "----------------",
    tom: "----------------",
  }),
  drill: gridFromSpec({
    // sliding 808, offset snare with a ghost, busier hats than trap
    kick: "X------x--X-----",
    snare: "--------x------:",
    hat: "x-o-x-oxx-o-x-o-",
    openhat: "----------------",
    clap: "--------x-------",
    perc: "--x-----:---x---",
    ride: "----------------",
    tom: "----------------",
  }),
  house: gridFromSpec({
    // four on the floor, clap on 2 and 4, open hats on the offbeat 8ths
    kick: "X---X---X---X---",
    snare: "----------------",
    hat: "--o---o---o---o-",
    openhat: "--x---x---x---x-",
    clap: "----x-------x---",
    perc: "-----:-----:----",
    ride: "----------------",
    tom: "----------------",
  }),
  dnb: gridFromSpec({
    // the classic two-step: kick 1 and the "and" of 3, snare 2 and 4
    kick: "X---------x-----",
    snare: "----x-------x---",
    hat: "x-o-x-o-x-o-x-o-",
    openhat: "------------x---",
    clap: "----------------",
    perc: "------:---------",
    ride: "----------------",
    tom: "----------------",
  }),
  lofi: gridFromSpec({
    // laid-back kick, swung 8th hats, soft open hat before the loop
    kick: "X-------x-x-----",
    snare: "----x-------x---",
    hat: "x-o-x-o-x-o-x-o-",
    openhat: "------------o---",
    clap: "----------------",
    perc: "------:-------:-",
    ride: "----------------",
    tom: "----------------",
  }),
  pop: gridFromSpec({
    // kick 1 and 3 with a pickup, clap owns the backbeat, straight 8th hats
    kick: "X-----x-X-------",
    snare: "----------------",
    hat: "x-o-x-o-x-o-x-o-",
    openhat: "------------x---",
    clap: "----x-------x---",
    perc: "----:-------:---",
    ride: "----------------",
    tom: "----------------",
  }),
  techno: gridFromSpec({
    // four on the floor, offbeat open hats, ghosted 16th hats throughout
    kick: "X---X---X---X---",
    snare: "----------------",
    hat: "::::::::::::::::",
    openhat: "--x---x---x---x-",
    clap: "----------------",
    perc: "----:-------:---",
    ride: "----------------",
    tom: "----------------",
  }),
  ambient: gridFromSpec({
    // no drums to speak of: a soft pulse, shimmering ride, sparse ghosts
    kick: "x---------------",
    snare: "----------------",
    hat: "----:-------:---",
    openhat: "----------------",
    clap: "----------------",
    perc: "--------:-------",
    ride: "x-------:-------",
    tom: "----------------",
  }),
};

/** The problems of a grid (wrong step count, lane lengths, velocity range). */
export function validateGrid(grid: PatternGrid): string[] {
  const problems: string[] = [];
  if (grid.steps !== STEPS) problems.push(`steps must be ${STEPS}`);
  for (const name of LANES) {
    const values = grid.lanes[name];
    if (values === undefined) {
      problems.push(`missing lane: ${name}`);
      continue;
    }
    if (values.length !== STEPS) problems.push(`lane ${name} must hold ${STEPS} steps`);
    values.forEach((v, step) => {
      if (!Number.isFinite(v) || v < 0 || v > 1) problems.push(`lane ${name} step ${step} out of range`);
    });
  }
  return problems;
}

/** The sum of a lane's velocities (0 for a silent lane). */
export function laneDensity(grid: PatternGrid, name: LaneName): number {
  return grid.lanes[name].reduce((a, b) => a + b, 0);
}

/**
 * The per-step swing offsets, in step units. The ratio is the swung midpoint
 * in [0.5, 0.75] (0.5 = straight, values outside clamp to straight);
 * division 2 swings the offbeat 8ths (steps 2, 6, 10, 14) by 4r - 2,
 * division 4 swings every odd 16th by 2r - 1.
 */
export function swingOffsets(ratio: number, division: 2 | 4 = 2): number[] {
  const offsets = new Array<number>(STEPS).fill(0);
  if (!(ratio >= 0.5 && ratio <= 0.75)) return offsets;
  for (let step = 0; step < STEPS; step++) {
    if (division === 2 && step % 4 === 2) offsets[step] = 4 * ratio - 2;
    if (division === 4 && step % 2 === 1) offsets[step] = 2 * ratio - 1;
  }
  return offsets;
}

/** Attaches swing offsets to a grid (the velocities are untouched). */
export function applySwing(grid: PatternGrid, ratio: number, division: 2 | 4 = 2): SwingGrid {
  return { grid: cloneGrid(grid), offsets: swingOffsets(ratio, division) };
}

/** The accent style per family: four-on-floor, backbeat or flat shimmer. */
const ACCENT_STYLE: Record<FamilyName, "floor" | "backbeat" | "flat"> = {
  trap: "backbeat",
  drill: "backbeat",
  dnb: "backbeat",
  lofi: "backbeat",
  pop: "backbeat",
  house: "floor",
  techno: "floor",
  ambient: "flat",
};

/** The per-step velocity multiplier curve of a family (downbeats lean in). */
export function accentMap(family: FamilyName): number[] {
  const style = ACCENT_STYLE[family];
  return Array.from({ length: STEPS }, (_, step) => {
    if (style === "flat") return step === 0 ? 1.05 : 1;
    if (step % 4 === 0) return style === "floor" ? 1.2 : step === 0 || step === 8 ? 1.2 : 1.1;
    if (step % 2 === 0) return 0.95;
    return 0.8;
  });
}

/** Multiplies a grid by a family's accent curve, clamped to [0, 1]. */
export function applyAccents(grid: PatternGrid, family: FamilyName): PatternGrid {
  const curve = accentMap(family);
  const out = cloneGrid(grid);
  for (const name of LANES)
    out.lanes[name] = out.lanes[name].map((v, step) => Math.min(1, Math.max(0, v * curve[step])));
  return out;
}

/**
 * Seeded fill pass: when the rng draws under `chance`, the last four steps
 * carry the documented snare->tom cascade (snare 0.85/0.6/0.85/1, tom 0.85/1
 * on the final two when the rng says so, hats halved); otherwise the grid
 * passes through untouched.
 */
export function maybeFill(grid: PatternGrid, rng: () => number, chance = 0.25): PatternGrid {
  const out = cloneGrid(grid);
  if (rng() >= chance) return out;
  const cascade = [0.85, 0.6, 0.85, 1];
  cascade.forEach((v, i) => {
    out.lanes.snare[STEPS - 4 + i] = Math.max(out.lanes.snare[STEPS - 4 + i], v);
    out.lanes.hat[STEPS - 4 + i] *= 0.5;
  });
  if (rng() < 0.5) {
    out.lanes.tom[STEPS - 2] = Math.max(out.lanes.tom[STEPS - 2], 0.85);
    out.lanes.tom[STEPS - 1] = Math.max(out.lanes.tom[STEPS - 1], 1);
  }
  return out;
}

/**
 * Half/double-time folding of a one-bar phrase. Double-time samples every
 * second step (the phrase loops twice per bar); half-time reads the phrase
 * at half resolution — source steps 0..7 land on the even steps, odd steps
 * stay silent and later steps drop (fold before fills, then let the
 * generator re-add one). Collisions merge by max velocity.
 */
export function foldPattern(grid: PatternGrid, factor: 0.5 | 2): PatternGrid {
  const out = emptyGrid();
  for (const name of LANES) {
    const source = grid.lanes[name];
    out.lanes[name] = Array.from({ length: STEPS }, (_, step) => {
      if (factor === 2) return source[(2 * step) % STEPS] ?? 0;
      return step % 2 === 0 ? (source[step / 2] ?? 0) : 0;
    });
  }
  return out;
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: genrematrix.ts — the deterministic style dictionary (the    */
/* intra-family imports of the grammar, the drum families and the       */
/* kernel dissolved into the seat).                                     */
/* ══════════════════════════════════════════════════════════════════════ */

/**
 * genrematrix — the deterministic style dictionary leaf of the katexis engine.
 * @module genrematrix
 * @family wave/logicfold2
 * The matrix rides its own leaf seat so the pattern/composer/genre family
 * never closes a cycle: every consumer imports the table without dragging
 * the corpus arms, and the genre seat re-exports the same names so the
 * public face stays frozen.
 */


/* ===== block: genrematrix ===== */
// # genrematrix — the deterministic style dictionary of the katexis engine
// (root layer): the fifteen genre entries the generator reads, each carrying
// its bpm range, swing default, pattern family reference, scale biases,
// progression set reference, mix target (the documented LUFS the mix wave
// masters towards) and timbre hints. The matrix is a pure table: every
// reference is validated against the sibling tables by validateMatrix, and
// every pick (bpm, genre match) runs on the engine's seeded rng — same seed,
// same record. Non-goals: no synthesis, no patterns of its own (the family
// grids live in rhythmgrammar, the loops in harmonyengine).

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
    id: "trap",
    label: "Trap",
    bpmin: 130,
    bpmax: 150,
    bpm: 140,
    swing: 0.5,
    pattern: "trap",
    scales: ["natural-minor", "harmonic-minor"],
    progressions: "trap",
    lufs: -9,
    timbre: ["808-sub", "dark-bells", "distorted-hats"],
  },
  {
    id: "drill",
    label: "Drill",
    bpmin: 138,
    bpmax: 146,
    bpm: 142,
    swing: 0.5,
    pattern: "drill",
    scales: ["harmonic-minor", "phrygian"],
    progressions: "drill",
    lufs: -8,
    timbre: ["sliding-808", "orchestral-stabs", "uk-hats"],
  },
  {
    id: "hiphop",
    label: "Hip Hop",
    bpmin: 84,
    bpmax: 96,
    bpm: 90,
    swing: 0.58,
    pattern: "lofi",
    scales: ["dorian", "natural-minor"],
    progressions: "jazz",
    lufs: -10,
    timbre: ["sample-chops", "vinyl-crackle", "punchy-kick"],
  },
  {
    id: "rude-trap",
    label: "Rude Trap",
    bpmin: 144,
    bpmax: 160,
    bpm: 150,
    swing: 0.5,
    pattern: "trap",
    scales: ["phrygian", "harmonic-minor"],
    progressions: "trap",
    lufs: -8,
    timbre: ["screaming-808", "metal-hats", "horror-leads"],
  },
  {
    id: "house",
    label: "House",
    bpmin: 120,
    bpmax: 128,
    bpm: 124,
    swing: 0.54,
    pattern: "house",
    scales: ["natural-minor", "dorian"],
    progressions: "house",
    lufs: -9,
    timbre: ["filtered-chords", "disco-bass", "four-on-floor"],
  },
  {
    id: "techno",
    label: "Techno",
    bpmin: 126,
    bpmax: 142,
    bpm: 132,
    swing: 0.5,
    pattern: "techno",
    scales: ["phrygian", "natural-minor"],
    progressions: "techno",
    lufs: -9,
    timbre: ["hypnotic-arp", "analog-drone", "raw-kick"],
  },
  {
    id: "edm",
    label: "EDM",
    bpmin: 126,
    bpmax: 132,
    bpm: 128,
    swing: 0.5,
    pattern: "house",
    scales: ["major", "natural-minor"],
    progressions: "pop",
    lufs: -8,
    timbre: ["supersaw", "sidechain-pad", "festival-drop"],
  },
  {
    id: "dnb",
    label: "Drum & Bass",
    bpmin: 168,
    bpmax: 176,
    bpm: 174,
    swing: 0.5,
    pattern: "dnb",
    scales: ["natural-minor", "dorian"],
    progressions: "dnb",
    lufs: -8,
    timbre: ["reese-bass", "amen-break", "liquid-pads"],
  },
  {
    id: "ambient",
    label: "Ambient",
    bpmin: 60,
    bpmax: 80,
    bpm: 70,
    swing: 0.5,
    pattern: "ambient",
    scales: ["lydian", "major", "natural-minor"],
    progressions: "ambient",
    lufs: -16,
    timbre: ["granular-pad", "field-recording", "slow-shimmer"],
  },
  {
    id: "lofi",
    label: "Lo-Fi",
    bpmin: 72,
    bpmax: 88,
    bpm: 80,
    swing: 0.62,
    pattern: "lofi",
    scales: ["dorian", "major", "natural-minor"],
    progressions: "lofi",
    lufs: -14,
    timbre: ["tape-saturation", "jazz-keys", "dusty-drums"],
  },
  {
    id: "pop",
    label: "Pop",
    bpmin: 100,
    bpmax: 120,
    bpm: 110,
    swing: 0.53,
    pattern: "pop",
    scales: ["major", "mixolydian"],
    progressions: "pop",
    lufs: -9,
    timbre: ["bright-vocal-chain", "plucky-synth", "tight-kick"],
  },
  {
    id: "rnb",
    label: "R&B",
    bpmin: 88,
    bpmax: 104,
    bpm: 96,
    swing: 0.6,
    pattern: "lofi",
    scales: ["natural-minor", "dorian"],
    progressions: "jazz",
    lufs: -10,
    timbre: ["silky-keys", "finger-snap", "deep-bass"],
  },
  {
    id: "hyperpop",
    label: "Hyperpop",
    bpmin: 140,
    bpmax: 165,
    bpm: 150,
    swing: 0.5,
    pattern: "pop",
    scales: ["major", "lydian"],
    progressions: "pop",
    lufs: -7,
    timbre: ["pitched-vocal-stack", "glitch-perc", "brash-synth"],
  },
  {
    id: "afrobeats",
    label: "Afrobeats",
    bpmin: 100,
    bpmax: 112,
    bpm: 106,
    swing: 0.58,
    pattern: "pop",
    scales: ["major", "mixolydian"],
    progressions: "pop",
    lufs: -10,
    timbre: ["log-drum", "shaker-groove", "airy-pad"],
  },
  {
    id: "jazz",
    label: "Jazz",
    bpmin: 120,
    bpmax: 160,
    bpm: 132,
    swing: 0.66,
    pattern: "lofi",
    scales: ["major", "dorian", "mixolydian"],
    progressions: "jazz",
    lufs: -12,
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
    if (!PROGRESSION_IDS.includes(genre.progressions))
      problems.push(`${genre.id}: unknown progression set ${genre.progressions}`);
    if (genre.scales.length === 0) problems.push(`${genre.id}: no scale bias`);
    for (const scale of genre.scales)
      if (!SCALE_NAMES.includes(scale)) problems.push(`${genre.id}: unknown scale ${scale}`);
    if (!Number.isFinite(genre.lufs) || genre.lufs < -16 || genre.lufs > -7)
      problems.push(`${genre.id}: lufs ${genre.lufs} out of band`);
    if (genre.timbre.length === 0) problems.push(`${genre.id}: no timbre hints`);
  }
  return problems;
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: beatgrid.ts — the beat grid (consolidation note: the        */
/* private failure constructor rides as failBeat because the unseated   */
/* corpus lane (genre.ts at the pattern layer) carries a same-name      */
/* fail of its own corpus contract — the suffix keeps the two private   */
/* constructors apart; no public surface moved).                        */
/* ══════════════════════════════════════════════════════════════════════ */

// # beatgrid — the beat grid of debonair (root layer): tempo detection, beat
// tracking, quantize/swing/subdivisions and the tempo map with time curves.
// The clean-room pattern is absorbed from filmcraft's audio-dsp/remix.rs
// (autocorrelation tempo with a log-Gaussian prior at 120 BPM, dynamic
// programming beat tracking with a squared log-ratio penalty) and from
// remotion's interpolate (piecewise curves with an explicit extrapolation
// policy, reduced here to linear/exponential/hold tempo ramps). The file
// receives an onset envelope as a parameter — spectra stay in the katexis
// engine. Non-goals: no DSP, no playback, no notation, no MIDI IO. Pure and
// multi-mode — the same call runs in the browser and in node (the unit tests).

/** The machine readable failure codes of the beat grid. */
export type BeatErrorCode = "empty-envelope" | "no-pulse" | "bad-grid" | "bad-tempo" | "bad-strength";

/** The typed result every fallible grid call answers with (errors by return). */
export type BeatResult<T> = { ok: true; value: T } | { ok: false; code: BeatErrorCode; message: string };

/** One grid of beats in seconds with its bar arrangement. */
export interface BeatGrid {
  /** The tempo in BPM (must be > 0). */
  bpm: number;
  /** The beat positions in seconds, strictly increasing (>= 0). */
  beats: number[];
  /** Beats per bar for downbeat labelling (default 4). */
  beatsperbar: number;
}

/** The tempo curve shape carried by an anchor towards the next anchor. */
export type TempoCurve = "hold" | "linear" | "exponential";

/** One tempo anchor: the tempo is exact here and curves into the next anchor. */
export interface TempoAnchor {
  /** The anchor time in seconds (>= 0). */
  time: number;
  /** The tempo at the anchor in BPM (> 0). */
  bpm: number;
  /** The curve towards the next anchor (default "hold"). */
  curve: TempoCurve;
}

/** A piecewise tempo map over the whole programme. */
export interface TempoMap {
  /** The anchors sorted by time (at least one). */
  anchors: TempoAnchor[];
}

/** Fails a fallible call with one machine readable code. */
function failBeat<T>(code: BeatErrorCode, message: string): BeatResult<T> {
  return { ok: false, code, message };
}

/** The mean and standard deviation of a series (zeros when empty). */
function meanSd(values: readonly number[]): { mean: number; sd: number } {
  const n = values.length;
  if (n === 0) return { mean: 0, sd: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / n;
  return { mean, sd: Math.sqrt(values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n) };
}

/**
 * Onset envelope per frame: half-wave rectified energy flux of a mono signal,
 * normalised to unit standard deviation — the time-domain stand-in for the
 * spectral flux the katexis engine computes. Answers the envelope and fps.
 */
export function onsetEnvelope(
  samples: readonly number[],
  samplerate: number,
  frame = 1024,
): { envelope: number[]; framerate: number } {
  const frames = Math.max(0, Math.floor(samples.length / frame));
  const energy: number[] = [];
  for (let t = 0; t < frames; t++) {
    let acc = 0;
    for (let i = 0; i < frame; i++) acc += samples[t * frame + i] * samples[t * frame + i];
    energy.push(acc / frame);
  }
  const flux: number[] = [];
  for (let t = 1; t < energy.length; t++) flux.push(Math.max(0, energy[t] - energy[t - 1]));
  const { mean, sd } = meanSd(flux);
  return { envelope: flux.map((v) => (sd > 0 ? (v - mean) / sd : 0)), framerate: samplerate / frame };
}

/**
 * Detects the tempo of an onset envelope: autocorrelation over the 50–200 BPM
 * band with a log-Gaussian prior centred at 120 BPM and parabolic refinement.
 * Answers BPM, period (frames) and pulse (0..1); codes `empty-envelope`, `no-pulse`.
 */
export function detectTempo(
  envelope: readonly number[],
  framerate: number,
  minbpm = 50,
  maxbpm = 200,
): BeatResult<{ bpm: number; period: number; pulse: number }> {
  if (envelope.length < 4 || !(framerate > 0))
    return failBeat("empty-envelope", "the envelope is too short to carry a pulse");
  const { mean, sd } = meanSd(envelope);
  if (!(sd > 0)) return failBeat("no-pulse", "a flat envelope carries no pulse");
  const centred = envelope.map((v) => v - mean);
  const autocorrelation = (lag: number): number => {
    let acc = 0;
    for (let i = 0; i + lag < centred.length; i++) acc += centred[i] * centred[i + lag];
    return acc / (centred.length - lag);
  };
  const zero = Math.max(1e-12, autocorrelation(0));
  const lo = Math.max(2, Math.floor((framerate * 60) / maxbpm));
  const hi = Math.min(centred.length - 2, Math.ceil((framerate * 60) / minbpm));
  if (hi <= lo + 2) return failBeat("empty-envelope", "the envelope is too short for the requested tempo band");
  let best = -Infinity,
    bestlag = lo;
  for (let lag = lo; lag <= hi; lag++) {
    const bpm = (60 * framerate) / lag;
    const weighted = autocorrelation(lag) * Math.exp(-0.5 * Math.log2(bpm / 120) ** 2);
    if (weighted > best) {
      best = weighted;
      bestlag = lag;
    }
  }
  const raw = autocorrelation(bestlag);
  if (raw <= 0.1 * zero) return failBeat("no-pulse", "no usable rhythmic pulse in the envelope");
  const [a, b, c] = [autocorrelation(bestlag - 1), raw, autocorrelation(bestlag + 1)];
  const den = a - 2 * b + c;
  const period = bestlag + (den < 0 ? Math.max(-0.5, Math.min(0.5, 0.5 * ((a - c) / den))) : 0);
  return { ok: true, value: { bpm: (60 * framerate) / period, period, pulse: raw / zero } };
}

/**
 * Tracks beats over an onset envelope with dynamic programming: each beat
 * collects the local onset strength and pays a squared log-ratio penalty for
 * deviating from the period; backtracked from the strongest last-period beat.
 * Answers the beat frame indices, increasing.
 */
export function trackBeats(envelope: readonly number[], period: number): number[] {
  const n = envelope.length;
  if (n < 2 || !(period >= 1)) return [];
  const score = new Array<number>(n).fill(0);
  const back = new Array<number>(n).fill(-1);
  const lo = Math.max(1, Math.round(period * 0.5));
  const hi = Math.max(lo + 1, Math.round(period * 2));
  for (let t = 1; t < n; t++) {
    let best = 0;
    let arg = -1;
    for (let prev = Math.max(0, t - hi); prev <= t - lo; prev++) {
      const value = score[prev] - 100 * Math.log((t - prev) / period) ** 2;
      if (arg === -1 || value > best) {
        best = value;
        arg = prev;
      }
    }
    score[t] = envelope[t] + Math.max(0, best);
    back[t] = arg;
  }
  let t = Math.max(0, n - Math.ceil(period) - 1);
  for (let i = t; i < n; i++) if (score[i] > score[t]) t = i;
  const beats: number[] = [];
  while (t >= 0) {
    beats.push(t);
    t = back[t];
  }
  return beats.reverse();
}

/** Builds a grid from tracked beats (frame indices) and a tempo; code `bad-grid`. */
export function gridFromBeats(
  beatframes: readonly number[],
  framerate: number,
  bpm: number,
  beatsperbar = 4,
): BeatResult<BeatGrid> {
  if (beatframes.length < 2) return failBeat("bad-grid", "at least two beats are needed for a grid");
  if (!(framerate > 0) || !(bpm > 0) || !(beatsperbar >= 1))
    return failBeat("bad-grid", "framerate, bpm and beatsperbar must be positive");
  const beats = beatframes.map((f) => f / framerate);
  for (let i = 1; i < beats.length; i++)
    if (!(beats[i] > beats[i - 1])) return failBeat("bad-grid", "beat frames must be strictly increasing");
  return { ok: true, value: { bpm, beats, beatsperbar: Math.round(beatsperbar) } };
}

/** Builds a synthetic grid from a constant tempo over a duration; code `bad-grid`. */
export function identityGrid(bpm: number, duration: number, offset = 0, beatsperbar = 4): BeatResult<BeatGrid> {
  if (!(bpm > 0) || duration < 0 || offset < 0) return failBeat("bad-grid", "bpm must be positive and times non negative");
  const beats: number[] = [];
  for (let t = offset; t <= duration + 1e-9; t += 60 / bpm) beats.push(t);
  return { ok: true, value: { bpm, beats, beatsperbar: Math.round(beatsperbar) } };
}

/** The number of beats a grid holds. */
export function beatCount(grid: BeatGrid): number {
  return grid.beats.length;
}

/** Whether the beat at an index opens a bar (out-of-range indexes never do). */
export function isDownbeat(grid: BeatGrid, index: number): boolean {
  return index >= 0 && index < grid.beats.length && index % grid.beatsperbar === 0;
}

/** The time of beat `index` (fractional indexes interpolate; past the grid the step holds). */
export function beatTime(grid: BeatGrid, index: number): number {
  const last = grid.beats.length - 1;
  if (last < 0) return 0;
  const base = Math.min(last, Math.max(0, Math.floor(index)));
  const span =
    base + 1 <= last
      ? grid.beats[base + 1] - grid.beats[base]
      : last > 0
        ? grid.beats[last] - grid.beats[last - 1]
        : 60 / grid.bpm;
  return grid.beats[base] + (index - base) * span;
}

/** The index of the beat nearest to a time (0 when the grid is empty). */
export function nearestBeat(grid: BeatGrid, time: number): number {
  let best = 0;
  let bestd = Infinity;
  for (let i = 0; i < grid.beats.length; i++) {
    const d = Math.abs(grid.beats[i] - time);
    if (d < bestd) {
      bestd = d;
      best = i;
    }
  }
  return best;
}

/** Quantizes a time towards the nearest beat; `strength` 0..1 (1 snaps exactly); codes `bad-grid`, `bad-strength`. */
export function quantizeToGrid(time: number, grid: BeatGrid, strength: number): BeatResult<number> {
  if (grid.beats.length === 0) return failBeat("bad-grid", "the grid has no beats");
  if (!(strength >= 0 && strength <= 1)) return failBeat("bad-strength", "strength must sit in [0, 1]");
  return { ok: true, value: time + strength * (grid.beats[nearestBeat(grid, time)] - time) };
}

/**
 * The swing delay a time receives: offbeat positions (a quarter to three
 * quarters into the beat) are delayed when the swing ratio leaves 0.5; the
 * ratio is the swung midpoint in [0.5, 0.75], 0.5 is straight time.
 */
export function swingOffset(grid: BeatGrid, time: number, ratio: number): number {
  if (grid.beats.length < 2 || !(ratio >= 0.5 && ratio <= 0.75)) return 0;
  const step = grid.beats[1] - grid.beats[0];
  let i = 0;
  while (i + 1 < grid.beats.length && grid.beats[i + 1] <= time) i++;
  const p = (time - grid.beats[i]) / step;
  return p > 0.25 && p < 0.75 ? (ratio - 0.5) * step : 0;
}

/** The subdivision times of one beat (2 = eighths, 3 = triplet eighths, 4 = sixteenths). */
export function subdivideBeat(grid: BeatGrid, index: number, divisions: number): number[] {
  if (!(divisions >= 2) || index < 0 || index >= grid.beats.length) return [];
  const start = grid.beats[index];
  const end = index + 1 < grid.beats.length ? grid.beats[index + 1] : start + 60 / grid.bpm;
  return Array.from({ length: divisions }, (_, k) => start + ((end - start) * k) / divisions);
}

/** Validates a tempo map (anchors increasing, positive BPM); code `bad-tempo`. */
export function tempoMapFromAnchors(anchors: readonly TempoAnchor[]): BeatResult<TempoMap> {
  if (anchors.length === 0) return failBeat("bad-tempo", "a tempo map needs at least one anchor");
  for (let i = 0; i < anchors.length; i++) {
    if (!(anchors[i].bpm > 0) || anchors[i].time < 0)
      return failBeat("bad-tempo", "anchor bpm must be positive and time non negative");
    if (i > 0 && anchors[i].time <= anchors[i - 1].time)
      return failBeat("bad-tempo", "anchor times must be strictly increasing");
  }
  return { ok: true, value: { anchors: anchors.map((a) => ({ time: a.time, bpm: a.bpm, curve: a.curve ?? "hold" })) } };
}

/** The constant tempo map of a grid. */
export function gridToTempoMap(grid: BeatGrid): TempoMap {
  return { anchors: [{ time: 0, bpm: grid.bpm, curve: "hold" }] };
}

/**
 * Evaluates the tempo curve at a time: times before the first anchor hold its
 * tempo and past the last anchor the final one holds — the "clamp" policy.
 */
export function tempoAtTime(map: TempoMap, time: number): number {
  const anchors = map.anchors;
  if (time <= anchors[0].time) return anchors[0].bpm;
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (time < b.time) {
      const t = (time - a.time) / (b.time - a.time);
      if (a.curve === "exponential") return a.bpm * (b.bpm / a.bpm) ** t;
      if (a.curve === "linear") return a.bpm + (b.bpm - a.bpm) * t;
      return a.bpm;
    }
  }
  return anchors[anchors.length - 1].bpm;
}

/** Integrates the tempo map: how many beats elapse between two times (∫ bpm dt / 60). */
export function beatsElapsed(map: TempoMap, from: number, to: number): number {
  if (!(to > from)) return 0;
  let beats = 0;
  for (let i = 0; i < map.anchors.length - 1; i++) {
    const a = map.anchors[i];
    const b = map.anchors[i + 1];
    const t0 = Math.max(from, a.time);
    const t1 = Math.min(to, b.time);
    if (!(t1 > t0)) continue;
    const span = t1 - t0;
    const end = t1 >= b.time ? b.bpm : tempoAtTime(map, t1);
    beats +=
      (a.curve === "exponential" && end !== a.bpm
        ? (span * (end - a.bpm)) / Math.log(end / a.bpm)
        : (span * (a.bpm + end)) / 2) / 60;
  }
  const last = map.anchors[map.anchors.length - 1];
  if (to > last.time) beats += (Math.max(0, to - Math.max(from, last.time)) * last.bpm) / 60;
  return beats;
}

/**
 * The inverse integral: the time at which `beats` beats elapsed from `from`
 * (partial segments solved by bisection — curves are monotone). Answers
 * `from` for a zero or negative distance.
 */
export function timeAtBeat(map: TempoMap, from: number, beats: number): number {
  if (!(beats > 0)) return from;
  let remaining = beats;
  let time = from;
  for (let i = 0; i < map.anchors.length - 1; i++) {
    const b = map.anchors[i + 1];
    const start = Math.max(from, map.anchors[i].time);
    if (!(b.time > start)) continue;
    const whole = beatsElapsed(map, start, b.time);
    if (remaining <= whole) {
      let lo = start;
      let hi = b.time;
      for (let k = 0; k < 48; k++) {
        const mid = (lo + hi) / 2;
        if (beatsElapsed(map, start, mid) < remaining) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }
    remaining -= whole;
    time = b.time;
  }
  const last = map.anchors[map.anchors.length - 1];
  return time + (Math.max(0, remaining) * 60) / last.bpm;
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: patternenums.ts — the retired alias face (dissolved). The   */
/* fourteen-line body the alias carried was a pure re-export of          */
/* pattern.ts — the pattern family's own keyed file, never this seat's   */
/* domain — and no relative importer rode it (the published map already  */
/* answers "./patternenums" from pattern.ts), so the alias retired with  */
/* this fold and no code rides here: the pattern vocabulary stays in     */
/* pattern.ts where the alias's own header pins it.                      */
/* ══════════════════════════════════════════════════════════════════════ */

