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
  | "maj" | "min" | "dim" | "aug" | "sus2" | "sus4"
  | "maj6" | "min6"
  | "dom7" | "maj7" | "min7" | "halfdim" | "dim7" | "minmaj7"
  | "dom9" | "maj9" | "min9" | "add9";

/** The scale vocabulary of the engine. */
export type ScaleName =
  | "major" | "natural-minor" | "harmonic-minor" | "melodic-minor"
  | "dorian" | "phrygian" | "lydian" | "mixolydian" | "aeolian" | "locrian"
  | "pentatonic-major" | "pentatonic-minor" | "blues";

/** The chromatic note names (sharp spelling), index = pitch class. */
export const NOTE_NAMES: readonly string[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/** The flat spelling of the same wheel (used by flat keys). */
export const FLAT_NAMES: readonly string[] = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

/** The semitone steps of every scale, counted from the tonic. */
export const SCALE_STEPS: Record<ScaleName, readonly number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11], "natural-minor": [0, 2, 3, 5, 7, 8, 10],
  "harmonic-minor": [0, 2, 3, 5, 7, 8, 11], "melodic-minor": [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10], locrian: [0, 1, 3, 5, 6, 8, 10],
  "pentatonic-major": [0, 2, 4, 7, 9], "pentatonic-minor": [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
};

/** Every scale name the table carries. */
export const SCALE_NAMES = Object.keys(SCALE_STEPS) as ScaleName[];

/** The interval names by semitone distance, 0..11. */
export const INTERVAL_NAMES: readonly string[] = [
  "unison", "minor second", "major second", "minor third", "major third",
  "perfect fourth", "tritone", "perfect fifth", "minor sixth", "major sixth",
  "minor seventh", "major seventh",
];

/** The chord shapes: semitone steps from the root, per quality. */
export const CHORD_SHAPES: Record<ChordQuality, readonly number[]> = {
  maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8],
  sus2: [0, 2, 7], sus4: [0, 5, 7], maj6: [0, 4, 7, 9], min6: [0, 3, 7, 9],
  dom7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10],
  halfdim: [0, 3, 6, 10], dim7: [0, 3, 6, 9], minmaj7: [0, 3, 7, 11],
  dom9: [0, 4, 7, 10, 14], maj9: [0, 4, 7, 11, 14], min9: [0, 3, 7, 10, 14],
  add9: [0, 4, 7, 14],
};

/** The symbol suffix every quality appends after the note name. */
export const CHORD_SUFFIX: Record<ChordQuality, string> = {
  maj: "", min: "m", dim: "dim", aug: "aug", sus2: "sus2", sus4: "sus4",
  maj6: "6", min6: "m6", dom7: "7", maj7: "maj7", min7: "m7",
  halfdim: "m7b5", dim7: "dim7", minmaj7: "mmaj7",
  dom9: "9", maj9: "maj9", min9: "m9", add9: "add9",
};

/** The quality suffixes a roman numeral may carry (case-aware). */
const ROMAN_QUALITY: Record<string, { upper: ChordQuality; lower: ChordQuality }> = {
  "": { upper: "maj", lower: "min" }, "7": { upper: "dom7", lower: "min7" },
  "6": { upper: "maj6", lower: "min6" }, "9": { upper: "dom9", lower: "min9" },
  maj7: { upper: "maj7", lower: "maj7" }, m7: { upper: "min7", lower: "min7" },
  maj9: { upper: "maj9", lower: "maj9" }, m9: { upper: "min9", lower: "min9" },
  add9: { upper: "add9", lower: "add9" }, sus2: { upper: "sus2", lower: "sus2" },
  sus4: { upper: "sus4", lower: "sus4" }, dim: { upper: "dim", lower: "dim" },
  dim7: { upper: "dim7", lower: "dim7" }, o: { upper: "dim", lower: "dim" },
  o7: { upper: "dim7", lower: "dim7" }, m7b5: { upper: "halfdim", lower: "halfdim" },
  aug: { upper: "aug", lower: "aug" }, "+": { upper: "aug", lower: "aug" },
};

/** The numeral suffix every quality serialises back to (romanOf). */
const NUMERAL_SUFFIX: Record<ChordQuality, string> = {
  maj: "", min: "", dim: "dim", aug: "aug", sus2: "sus2", sus4: "sus4",
  maj6: "6", min6: "6", dom7: "7", maj7: "maj7", min7: "7",
  halfdim: "m7b5", dim7: "dim7", minmaj7: "maj7",
  dom9: "9", maj9: "maj9", min9: "9", add9: "add9",
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
  return INTERVAL_NAMES[(((Math.round(semitones) % 12) + 12) % 12 + 12) % 12];
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
  const match = /^([A-G])([#b]*)([^/]*)(?:\/([A-G][#b]*))?$/.exec(token.trim());
  if (!match) return null;
  const root = noteToPc(`${match[1]}${match[2]}`);
  if (root === null) return null;
  const aliases: Record<string, ChordQuality> = { maj: "maj", min: "min", o: "dim", "+": "aug" };
  const quality =
    (Object.keys(CHORD_SUFFIX) as ChordQuality[]).find((q) => CHORD_SUFFIX[q] === match[3]) ??
    aliases[match[3]] ?? null;
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
  const match = /^([b#]*)([ivIV]+)(.*)$/.exec(token.trim());
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
  const lower = chord.quality === "min" || chord.quality === "min6" || chord.quality === "min7" || chord.quality === "min9" || chord.quality === "minmaj7" || chord.quality === "dim" || chord.quality === "halfdim" || chord.quality === "dim7";
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
    const notes = pcs.map((_, i) => bass + (((pcs[(inversion + i) % pcs.length] - pcs[inversion]) % 12) + 12) % 12);
    if (best === null || distance < best.distance) best = { notes, inversion, distance };
  }
  return { notes: best === null ? [] : best.notes, inversion: best === null ? 0 : best.inversion };
}
