// # patternenums — the pattern vocabulary and the payload contract of the
// katexis engine (root layer): the discrete enums every writer speaks — the
// note names, the forty-eight-scale library, the instrument voices, the drum
// lane keys, the genre keys, the event kinds, the band labels — and the two
// schema-signed json documents built on them: debonair.pattern/1 (the
// symbolic project the studio schedules) and debonair.timeline/1 (the
// dissected reference the pattern miner reads). The validators hand-roll
// the whole contract (zero dependencies, the family law): they clamp
// tolerantly where the contract allows (vel 0..1, dur 0.25..16, the 0..1
// frame fields) and reject hard with machine codes where the shape breaks.
// The canonical serializer orders every key and rounds every number to four
// decimals, so the same document always serializes to the same bytes. The
// llm bridge turns the tables into the one-paragraph instruction a model
// reads and surfaces the honest codes when the model drifts. The scale
// library ports the reference generator: the twelve sets the theory kernel
// already owns reuse its exports verbatim, the extensions ride the hyphen
// naming law, and the reference underscore spellings fold in as aliases.
// Non-goals: no audio, no synthesis, no storage, no mining (the sibling
// layers own theirs; this file owns the vocabulary and the contract only).
// Pure and multi-mode — the same call runs in the browser and in node.

import { GENRES } from "./genrematrix.ts";
import { SCALE_STEPS } from "./musictheory.ts";

// ---------------------------------------------------------------------------
// the schema ids (the versioned literals both documents sign themselves with)
// ---------------------------------------------------------------------------

/** The schema literal of the project payload (the symbolic score). */
export const PATTERN_SCHEMA_VERSION = "debonair.pattern/1";

/** The schema literal of the timeline payload (the dissected reference). */
export const TIMELINE_SCHEMA_VERSION = "debonair.timeline/1";

/** Both schema ids the parser accepts. */
export const PATTERN_SCHEMA_IDS: readonly string[] = [PATTERN_SCHEMA_VERSION, TIMELINE_SCHEMA_VERSION];

// ---------------------------------------------------------------------------
// the enum tables (the discrete vocabulary, the constant-table law)
// ---------------------------------------------------------------------------

/** The pitch-class names of the pattern vocabulary, lowercase with sharps
 * (index = pitch class, the spelling the ingest frames report). */
export const NOTE_NAMES: readonly string[] = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];

/** The scale vocabulary of the pattern payload: forty-eight names — the
 * twelve the theory kernel owns (reused verbatim) plus the thirty-six
 * extensions ported from the reference generator under the hyphen law. */
export type PatternScaleName =
  | "major"
  | "natural-minor"
  | "harmonic-minor"
  | "melodic-minor"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "locrian"
  | "pentatonic-major"
  | "pentatonic-minor"
  | "blues"
  | "harmonic-major"
  | "dorian-b2"
  | "lydian-aug"
  | "lydian-dom"
  | "mixolydian-b6"
  | "locrian-nat2"
  | "super-locrian"
  | "blues-maj"
  | "bebop-dom"
  | "bebop-maj"
  | "whole-tone"
  | "diminished-wh"
  | "diminished-hw"
  | "augmented"
  | "chromatic-be-bop"
  | "phrygian-dom"
  | "hijaz"
  | "double-harmonic"
  | "enigmatic"
  | "hungarian-minor"
  | "hungarian-major"
  | "persian"
  | "spanish-8tone"
  | "prometheus"
  | "tritone"
  | "insen"
  | "iwato"
  | "kumoi"
  | "in-scale-jp"
  | "yo-scale"
  | "gypsy-major"
  | "neapolitan-minor"
  | "neapolitan-major"
  | "maj7"
  | "min9"
  | "acoustic";

/** The semitone interval sets of the forty-eight scales, counted from the
 * root: the twelve the kernel owns reference its SCALE_STEPS exports (one
 * source of truth), the extensions carry their own tables. */
export const PATTERN_SCALES: Record<PatternScaleName, readonly number[]> = {
  // the twelve the theory kernel owns — the sets reuse the kernel exports
  major: SCALE_STEPS.major,
  "natural-minor": SCALE_STEPS["natural-minor"],
  "harmonic-minor": SCALE_STEPS["harmonic-minor"],
  "melodic-minor": SCALE_STEPS["melodic-minor"],
  dorian: SCALE_STEPS.dorian,
  phrygian: SCALE_STEPS.phrygian,
  lydian: SCALE_STEPS.lydian,
  mixolydian: SCALE_STEPS.mixolydian,
  locrian: SCALE_STEPS.locrian,
  "pentatonic-major": SCALE_STEPS["pentatonic-major"],
  "pentatonic-minor": SCALE_STEPS["pentatonic-minor"],
  blues: SCALE_STEPS.blues,
  // the harmonic and melodic families
  "harmonic-major": [0, 2, 4, 5, 7, 8, 11],
  "dorian-b2": [0, 1, 3, 5, 7, 9, 10],
  "lydian-aug": [0, 2, 4, 6, 8, 9, 11],
  "lydian-dom": [0, 2, 4, 6, 7, 9, 10],
  "mixolydian-b6": [0, 2, 4, 5, 7, 8, 10],
  "locrian-nat2": [0, 2, 3, 5, 6, 8, 10],
  "super-locrian": [0, 1, 3, 4, 6, 8, 10],
  // the pentatonic, blues and bebop staples
  "blues-maj": [0, 2, 3, 4, 7, 9],
  "bebop-dom": [0, 2, 4, 5, 7, 9, 10, 11],
  "bebop-maj": [0, 2, 4, 5, 7, 8, 9, 11],
  // the symmetric and exotic sets
  "whole-tone": [0, 2, 4, 6, 8, 10],
  "diminished-wh": [0, 2, 3, 5, 6, 8, 9, 11],
  "diminished-hw": [0, 1, 3, 4, 6, 7, 9, 10],
  augmented: [0, 3, 4, 7, 8, 11],
  "chromatic-be-bop": [0, 3, 4, 5, 7, 9, 10],
  // the world and cinematic sets
  "phrygian-dom": [0, 1, 4, 5, 7, 8, 10],
  hijaz: [0, 1, 4, 5, 7, 8, 11],
  "double-harmonic": [0, 1, 4, 5, 7, 8, 11],
  enigmatic: [0, 1, 4, 6, 8, 10, 11],
  "hungarian-minor": [0, 2, 3, 6, 7, 8, 11],
  "hungarian-major": [0, 3, 4, 6, 7, 9, 10],
  persian: [0, 1, 4, 5, 6, 8, 11],
  "spanish-8tone": [0, 1, 3, 4, 5, 6, 8, 10],
  prometheus: [0, 2, 4, 6, 9, 10],
  tritone: [0, 1, 4, 6, 7, 10],
  insen: [0, 1, 5, 7, 10],
  iwato: [0, 1, 5, 6, 10],
  kumoi: [0, 2, 3, 7, 9],
  "in-scale-jp": [0, 1, 5, 7, 8],
  "yo-scale": [0, 2, 5, 7, 9],
  "gypsy-major": [0, 1, 4, 5, 7, 8, 10],
  "neapolitan-minor": [0, 1, 3, 5, 7, 8, 11],
  "neapolitan-major": [0, 1, 3, 5, 7, 9, 11],
  // the lo-fi and soul aliases (the sets mirror the kernel's major and minor)
  maj7: SCALE_STEPS.major,
  min9: SCALE_STEPS["natural-minor"],
  acoustic: [0, 2, 4, 6, 7, 9, 10],
};

/** Every scale name the library carries (forty-eight, insertion order). */
export const PATTERN_SCALE_NAMES = Object.keys(PATTERN_SCALES) as PatternScaleName[];

/** The alternate spellings the scale parser folds onto the canonical names:
 * the reference generator's underscore tokens and the kernel's aeolian
 * alias (the parsed document always carries the canonical name). */
export const PATTERN_SCALE_ALIASES: Record<string, PatternScaleName> = {
  minor: "natural-minor",
  aeolian: "natural-minor",
  harmonic_minor: "harmonic-minor",
  melodic_minor: "melodic-minor",
  pent_minor: "pentatonic-minor",
  pent_major: "pentatonic-major",
  blues_min: "blues",
};

/** The instrument voices the engine renders (the audioengine recipes). */
export type PatternVoice = "lead" | "pluck" | "keys" | "bell" | "arp" | "flute" | "bass" | "pad";

/** The voice vocabulary in engine order. */
export const PATTERN_VOICES: readonly PatternVoice[] = ["lead", "pluck", "keys", "bell", "arp", "flute", "bass", "pad"];

/** The four drum lane keys of the pattern grid. */
export type PatternDrumLaneKey = "kick" | "snare" | "hat" | "clap";

/** The drum lane keys in grid order. */
export const DRUM_LANE_KEYS: readonly PatternDrumLaneKey[] = ["kick", "snare", "hat", "clap"];

/** The steps one lane carries (the sixteen-step grid, the rhythmgrammar law). */
export const LANE_STEPS = 16;

/** The genre keys of the style dictionary (the ids genrematrix owns — the
 * mood and the prompt ride them, the hint lists them, never a copy). */
export const PATTERN_GENRE_KEYS: readonly string[] = GENRES.map((genre) => genre.id);

/** The event kinds a timeline frame reports. */
export type PatternEventKind = "note" | "transient";

/** The event kind table. */
export const EVENT_KINDS: readonly PatternEventKind[] = ["note", "transient"];

/** The transient classification labels: the band split answers the label
 * (low = kick, high = hat, anything else = hit). */
export type PatternTransientLabel = "kick" | "hat" | "hit";

/** The transient label table. */
export const TRANSIENT_LABELS: readonly PatternTransientLabel[] = ["kick", "hat", "hit"];

/** The band labels of the three-band split (the ingest decomposition order:
 * low under 250 hz, mid under 2 khz, high above). */
export const BAND_LABELS: readonly string[] = ["low", "mid", "high"];

/** Where a timeline document came from. */
export type PatternTimelineSource = "import" | "generated" | "variation";

/** The timeline source table. */
export const TIMELINE_SOURCES: readonly PatternTimelineSource[] = ["import", "generated", "variation"];

/** The embedding dimensionality both documents carry. */
export const EMBEDDING_DIM = 32;

/** The chroma bins a timeline frame carries. */
export const CHROMA_DIM = 12;

/** The contract ranges the validators enforce and the hint teaches (the
 * single home of every number the contract pins). */
export const PATTERN_LIMITS = {
  /** The project tempo band. */
  bpmMin: 40,
  bpmMax: 240,
  /** The bar count band. */
  barsMin: 1,
  barsMax: 128,
  /** The midi pitch band. */
  pitchMin: 0,
  pitchMax: 127,
  /** The velocity band (clamped on parse, never rejected). */
  velMin: 0,
  velMax: 1,
  /** The duration band in steps (clamped on parse, never rejected). */
  durMin: 0.25,
  durMax: 16,
  /** The lane binarization threshold (a step >= it is a hit). */
  stepThreshold: 0.5,
  /** The timeline tempo band. */
  timelineBpmMin: 30,
  timelineBpmMax: 300,
} as const;

// ---------------------------------------------------------------------------
// the typed failure (machine codes the caller surfaces)
// ---------------------------------------------------------------------------

/** The machine readable failure codes of the project validator. */
export const PATTERN_PROJECT_ERROR_CODES = [
  "bad-schema",
  "bad-bpm",
  "bad-root",
  "unknown-scale",
  "bad-bars",
  "bad-lane",
  "bad-note",
  "unknown-voice",
  "bad-embedding",
] as const;

/** The machine readable failure codes of the timeline validator. */
export const PATTERN_TIMELINE_ERROR_CODES = [
  "bad-schema",
  "bad-source",
  "bad-bpm",
  "bad-seconds",
  "bad-embedding",
  "bad-frame",
  "bad-event",
] as const;

/** Every machine code the pattern contract answers. */
export type PatternErrorCode =
  | (typeof PATTERN_PROJECT_ERROR_CODES)[number]
  | (typeof PATTERN_TIMELINE_ERROR_CODES)[number];

/** The whole codes table (both documents, no duplicates). */
export const PATTERN_ERROR_CODES: readonly PatternErrorCode[] = [
  ...new Set([...PATTERN_PROJECT_ERROR_CODES, ...PATTERN_TIMELINE_ERROR_CODES]),
];

/** The typed pattern failure, traceable to its machine code. */
export class PatternError extends Error {
  /** Machine readable failure code. */
  readonly code: PatternErrorCode;

  constructor(code: PatternErrorCode, message?: string) {
    super(message ?? `pattern ${code}`);
    this.name = "PatternError";
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// the payload documents (the llm-writable contracts)
// ---------------------------------------------------------------------------

/** One melodic note of the project score. */
export interface PatternNoteEvent {
  /** The 16th-note step index, 0-based (multi-bar lines may pass 15). */
  step: number;
  /** The midi pitch, 0..127 (floats carry cents precision). */
  pitch: number;
  /** The velocity, clamped to 0..1 on parse. */
  vel: number;
  /** The duration in steps, clamped to 0.25..16 on parse. */
  dur: number;
  /** The voice that renders the note (one of PATTERN_VOICES). */
  voice: PatternVoice;
}

/** The four 16-step drum lanes (binary hits: 0 = silent, 1 = a hit). */
export type PatternDrumLanes = Record<PatternDrumLaneKey, number[]>;

/** The symbolic project document: the score the studio schedules. */
export interface PatternProject {
  /** The schema literal ("debonair.pattern/1"). */
  schema: "debonair.pattern/1";
  /** The tempo, 40..240. */
  bpm: number;
  /** The tonic pitch class, 0..11 (a note name parses onto it). */
  root: number;
  /** The scale, one of the forty-eight (aliases fold onto the canonical). */
  scale: PatternScaleName;
  /** The bar count, 1..128. */
  bars: number;
  /** The mood label (free text, the genre keys ride it). */
  mood: string;
  /** The prompt the document answers (free text, "" when absent). */
  prompt: string;
  /** The four drum lanes, each sixteen binary steps. */
  drums: PatternDrumLanes;
  /** The note events (step, pitch, vel, dur, voice). */
  notes: PatternNoteEvent[];
  /** The 32-dim embedding (the miner recomputes it; zeros are legal). */
  embedding: number[];
}

/** One detected event inside a timeline frame (a note or a transient). */
export interface PatternFrameEvent {
  /** The event kind. */
  kind: PatternEventKind;
  /** The label: a note name for notes ("a3"), kick/hat/hit for transients. */
  note?: string;
  /** The midi pitch when the kind is a note (cents precision). */
  pitch?: number;
  /** The onset inside the second, 0..1 (clamped on parse). */
  onset: number;
  /** The velocity, 0..1 (clamped on parse). */
  velocity: number;
  /** The detector confidence, 0..1 (clamped on parse). */
  confidence: number;
  /** The fundamental in hz when the kind is a note. */
  hz?: number;
}

/** One second of the dissected reference: the numbers the miner reads. */
export interface PatternTimelineFrame {
  /** The second index, 0-based. */
  s: number;
  /** The rms of the second, 0..1 (clamped on parse). */
  rms: number;
  /** The spectral centroid of the second, hz (floored at zero on parse). */
  centroid: number;
  /** The spectral flux of the second (floored at zero on parse). */
  flux: number;
  /** The twelve chroma bins of the second. */
  chroma: number[];
  /** The 32-dim frame embedding. */
  embedding: number[];
  /** The events detected inside the second. */
  events: PatternFrameEvent[];
  /** The free-text tags of the second ("ritmico", "melodico"...). */
  tags: string[];
}

/** The dissected reference document: audio as numbers, second by second. */
export interface PatternTimeline {
  /** The schema literal ("debonair.timeline/1"). */
  schema: "debonair.timeline/1";
  /** Where the document came from. */
  source: PatternTimelineSource;
  /** The tempo of the reference, 30..300. */
  bpm: number;
  /** The duration in seconds, >= 0. */
  seconds: number;
  /** The 32-dim song-level embedding. */
  embedding: number[];
  /** One frame per second of the reference. */
  frames: PatternTimelineFrame[];
}

/** Either payload document (the serializer and the parser take both). */
export type PatternDocument = PatternProject | PatternTimeline;

// ---------------------------------------------------------------------------
// the validation answer
// ---------------------------------------------------------------------------

/** The ok arm: the parsed and clamped document. */
export interface PatternOk<T extends PatternDocument> {
  ok: true;
  doc: T;
}

/** The err arm: the machine code and the honest message. */
export interface PatternErr {
  ok: false;
  code: PatternErrorCode;
  message: string;
}

/** The typed result every validator answers with (errors by return). */
export type PatternResult<T extends PatternDocument = PatternProject> = PatternOk<T> | PatternErr;

// ---------------------------------------------------------------------------
// the pure helpers (the vocabulary lookups)
// ---------------------------------------------------------------------------

/** The note name of a pitch class (folds outside 0..11; "a" for 9). */
export function patternNoteName(pc: number): string {
  return NOTE_NAMES[((Math.round(pc) % 12) + 12) % 12];
}

/** Parses a note name ("a", "A", "f#") onto its pitch class; null when the
 * name is not in the vocabulary. */
export function patternNoteToPc(name: string): number | null {
  const pc = NOTE_NAMES.indexOf(name.trim().toLowerCase());
  return pc < 0 ? null : pc;
}

/** The interval set of a scale; throws PatternError("unknown-scale") on a
 * name outside the forty-eight (prototype keys included). */
export function patternScaleIntervals(name: string): readonly number[] {
  if (!Object.hasOwn(PATTERN_SCALES, name))
    throw new PatternError("unknown-scale", `the scale "${name}" is not in the library`);
  return PATTERN_SCALES[name as PatternScaleName];
}

/** True when the value is a plain record (an object, not an array). */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** True when the value is a finite number. */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Clamps a number into the inclusive range. */
function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

/** Rounds to four decimals (the canonical number law). */
function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}

/** Fails a validator with one machine readable code. */
function fail<T extends PatternDocument>(code: PatternErrorCode, message: string): PatternResult<T> {
  return { ok: false, code, message };
}

/** Parses the root field: an integer 0..11 or a note name ("a", "F#");
 * null when neither parses. */
function rootOf(value: unknown): number | null {
  if (isFiniteNumber(value)) {
    if (!Number.isInteger(value) || value < 0 || value > 11) return null;
    return value;
  }
  if (typeof value === "string") return patternNoteToPc(value);
  return null;
}

/** Parses the scale field: a canonical name passes, an alias folds, null
 * when neither matches (prototype keys never match). */
function scaleOf(value: unknown): PatternScaleName | null {
  if (typeof value !== "string") return null;
  const name = value.trim();
  if (Object.hasOwn(PATTERN_SCALES, name)) return name as PatternScaleName;
  return Object.hasOwn(PATTERN_SCALE_ALIASES, name) ? PATTERN_SCALE_ALIASES[name] : null;
}

/** Reads a 32-dim embedding: absent answers the zero vector, a malformed
 * array answers null. */
function embeddingOf(value: unknown): number[] | null {
  if (value === undefined) return new Array<number>(EMBEDDING_DIM).fill(0);
  if (!Array.isArray(value) || value.length !== EMBEDDING_DIM) return null;
  const out: number[] = [];
  for (const entry of value) {
    if (!isFiniteNumber(entry)) return null;
    out.push(entry);
  }
  return out;
}

// ---------------------------------------------------------------------------
// the validators (hand-rolled, zero dependencies — the family law)
// ---------------------------------------------------------------------------

/**
 * Validates a debonair.pattern/1 payload. The shape must hold (the schema
 * literal, the four lanes, the note fields); the bounded note values clamp
 * (vel to 0..1, dur to 0.25..16) and the lane steps binarize at the
 * threshold; the absent optionals default (voice "pluck", notes [], the
 * embedding zeros, the free text ""); out-of-band scalars, unknown scales
 * and unknown voices answer their machine codes.
 *
 * @param value the parsed json payload (unknown by design).
 * @returns the clamped document or the machine code.
 */
export function validatePatternProject(value: unknown): PatternResult<PatternProject> {
  if (!isRecord(value)) return fail("bad-schema", "the pattern payload is not an object");
  if (value.schema !== PATTERN_SCHEMA_VERSION)
    return fail("bad-schema", `the schema must be "${PATTERN_SCHEMA_VERSION}"`);
  const { bpmMin, bpmMax, barsMin, barsMax, pitchMin, pitchMax, velMin, velMax, durMin, durMax, stepThreshold } =
    PATTERN_LIMITS;
  if (!isFiniteNumber(value.bpm) || value.bpm < bpmMin || value.bpm > bpmMax)
    return fail("bad-bpm", `the bpm must be a number ${bpmMin}..${bpmMax}`);
  const root = rootOf(value.root);
  if (root === null) return fail("bad-root", "the root must be an integer 0..11 or a note name");
  const scale = scaleOf(value.scale);
  if (scale === null) return fail("unknown-scale", `the scale "${String(value.scale)}" is not in the library`);
  if (!isFiniteNumber(value.bars) || !Number.isInteger(value.bars) || value.bars < barsMin || value.bars > barsMax)
    return fail("bad-bars", `the bars must be an integer ${barsMin}..${barsMax}`);
  const mood = typeof value.mood === "string" ? value.mood : "";
  const prompt = typeof value.prompt === "string" ? value.prompt : "";
  // the four lanes: sixteen finite steps each, binarized at the threshold
  const drums = value.drums;
  if (!isRecord(drums)) return fail("bad-lane", "the drums must carry the four lanes");
  const lanes: PatternDrumLanes = { kick: [], snare: [], hat: [], clap: [] };
  for (const key of DRUM_LANE_KEYS) {
    const lane = drums[key];
    if (!Array.isArray(lane) || lane.length !== LANE_STEPS)
      return fail("bad-lane", `the ${key} lane must hold ${LANE_STEPS} steps`);
    const steps: number[] = [];
    for (const [index, step] of lane.entries()) {
      if (!isFiniteNumber(step)) return fail("bad-lane", `the ${key} lane step ${index} is not a number`);
      steps.push(step >= stepThreshold ? 1 : 0);
    }
    lanes[key] = steps;
  }
  // the notes: an array (absent answers the empty line), each event clamped
  if (value.notes !== undefined && !Array.isArray(value.notes)) return fail("bad-note", "the notes must be an array");
  const source = value.notes === undefined ? [] : value.notes;
  const notes: PatternNoteEvent[] = [];
  for (const [index, entry] of source.entries()) {
    if (!isRecord(entry)) return fail("bad-note", `the note at ${index} is not an object`);
    if (!isFiniteNumber(entry.step) || !Number.isInteger(entry.step) || entry.step < 0)
      return fail("bad-note", `the note at ${index} needs an integer step >= 0`);
    if (!isFiniteNumber(entry.pitch) || entry.pitch < pitchMin || entry.pitch > pitchMax)
      return fail("bad-note", `the note at ${index} needs a pitch ${pitchMin}..${pitchMax}`);
    if (!isFiniteNumber(entry.vel)) return fail("bad-note", `the note at ${index} needs a numeric vel`);
    if (!isFiniteNumber(entry.dur)) return fail("bad-note", `the note at ${index} needs a numeric dur`);
    let voice: PatternVoice;
    if (entry.voice === undefined) {
      voice = "pluck";
    } else if (typeof entry.voice === "string" && PATTERN_VOICES.includes(entry.voice as PatternVoice)) {
      voice = entry.voice as PatternVoice;
    } else {
      return fail("unknown-voice", `the note at ${index} carries the voice ${JSON.stringify(entry.voice)}`);
    }
    notes.push({
      step: entry.step,
      pitch: entry.pitch,
      vel: clamp(entry.vel, velMin, velMax),
      dur: clamp(entry.dur, durMin, durMax),
      voice,
    });
  }
  const embedding = embeddingOf(value.embedding);
  if (embedding === null) return fail("bad-embedding", `the embedding must hold ${EMBEDDING_DIM} numbers`);
  return {
    ok: true,
    doc: {
      schema: PATTERN_SCHEMA_VERSION,
      bpm: value.bpm,
      root,
      scale,
      bars: value.bars,
      mood,
      prompt,
      drums: lanes,
      notes,
      embedding,
    },
  };
}

/**
 * Validates a debonair.timeline/1 payload with the project discipline: the
 * shape must hold (the source, the frames, the events), the bounded frame
 * fields clamp (rms, onset, velocity and confidence to 0..1; centroid and
 * flux floor at zero) and the absent optionals default (the embeddings to
 * zeros, the tags to [], a label-less transient to "hit"). Broken frames
 * and events answer their own machine codes.
 *
 * @param value the parsed json payload (unknown by design).
 * @returns the clamped document or the machine code.
 */
export function validatePatternTimeline(value: unknown): PatternResult<PatternTimeline> {
  if (!isRecord(value)) return fail("bad-schema", "the timeline payload is not an object");
  if (value.schema !== TIMELINE_SCHEMA_VERSION)
    return fail("bad-schema", `the schema must be "${TIMELINE_SCHEMA_VERSION}"`);
  const { timelineBpmMin, timelineBpmMax, pitchMin, pitchMax } = PATTERN_LIMITS;
  const source = TIMELINE_SOURCES.find((entry) => entry === value.source);
  if (source === undefined) return fail("bad-source", `the source must be one of ${TIMELINE_SOURCES.join(", ")}`);
  if (!isFiniteNumber(value.bpm) || value.bpm < timelineBpmMin || value.bpm > timelineBpmMax)
    return fail("bad-bpm", `the bpm must be a number ${timelineBpmMin}..${timelineBpmMax}`);
  if (!isFiniteNumber(value.seconds) || value.seconds < 0)
    return fail("bad-seconds", "the seconds must be a number >= 0");
  const embedding = embeddingOf(value.embedding);
  if (embedding === null) return fail("bad-embedding", `the embedding must hold ${EMBEDDING_DIM} numbers`);
  if (!Array.isArray(value.frames)) return fail("bad-frame", "the frames must be an array");
  const frames: PatternTimelineFrame[] = [];
  for (const [index, entry] of value.frames.entries()) {
    if (!isRecord(entry)) return fail("bad-frame", `the frame at ${index} is not an object`);
    if (!isFiniteNumber(entry.s) || !Number.isInteger(entry.s) || entry.s < 0)
      return fail("bad-frame", `the frame at ${index} needs an integer second >= 0`);
    if (!isFiniteNumber(entry.rms)) return fail("bad-frame", `the frame at ${index} needs a numeric rms`);
    if (!isFiniteNumber(entry.centroid)) return fail("bad-frame", `the frame at ${index} needs a numeric centroid`);
    if (!isFiniteNumber(entry.flux)) return fail("bad-frame", `the frame at ${index} needs a numeric flux`);
    if (!Array.isArray(entry.chroma) || entry.chroma.length !== CHROMA_DIM)
      return fail("bad-frame", `the frame at ${index} needs ${CHROMA_DIM} chroma bins`);
    const chroma: number[] = [];
    for (const bin of entry.chroma) {
      if (!isFiniteNumber(bin)) return fail("bad-frame", `the frame at ${index} carries a non-numeric chroma bin`);
      chroma.push(bin);
    }
    const frameEmbedding = embeddingOf(entry.embedding);
    if (frameEmbedding === null)
      return fail("bad-frame", `the frame at ${index} needs ${EMBEDDING_DIM} embedding numbers`);
    if (entry.events !== undefined && !Array.isArray(entry.events))
      return fail("bad-event", `the frame at ${index} carries a non-array events field`);
    const sourceEvents = entry.events === undefined ? [] : entry.events;
    const events: PatternFrameEvent[] = [];
    for (const [eventIndex, eventEntry] of sourceEvents.entries()) {
      if (!isRecord(eventEntry)) return fail("bad-event", `the event at ${index}:${eventIndex} is not an object`);
      const kind = eventEntry.kind;
      if (kind !== "note" && kind !== "transient")
        return fail("bad-event", `the event at ${index}:${eventIndex} needs the kind note or transient`);
      let note: string | undefined;
      if (eventEntry.note === undefined) {
        note = kind === "transient" ? "hit" : undefined;
      } else {
        if (typeof eventEntry.note !== "string")
          return fail("bad-event", `the event at ${index}:${eventIndex} carries a non-string label`);
        if (kind === "transient" && !TRANSIENT_LABELS.includes(eventEntry.note as PatternTransientLabel))
          return fail(
            "bad-event",
            `the transient at ${index}:${eventIndex} must classify as ${TRANSIENT_LABELS.join(", ")}`,
          );
        note = eventEntry.note;
      }
      let pitch: number | undefined;
      if (eventEntry.pitch !== undefined) {
        if (!isFiniteNumber(eventEntry.pitch) || eventEntry.pitch < pitchMin || eventEntry.pitch > pitchMax)
          return fail("bad-event", `the event at ${index}:${eventIndex} needs a pitch ${pitchMin}..${pitchMax}`);
        pitch = eventEntry.pitch;
      }
      let hz: number | undefined;
      if (eventEntry.hz !== undefined) {
        if (!isFiniteNumber(eventEntry.hz))
          return fail("bad-event", `the event at ${index}:${eventIndex} needs a numeric hz`);
        hz = eventEntry.hz;
      }
      if (!isFiniteNumber(eventEntry.onset))
        return fail("bad-event", `the event at ${index}:${eventIndex} needs a numeric onset`);
      if (!isFiniteNumber(eventEntry.velocity))
        return fail("bad-event", `the event at ${index}:${eventIndex} needs a numeric velocity`);
      if (!isFiniteNumber(eventEntry.confidence))
        return fail("bad-event", `the event at ${index}:${eventIndex} needs a numeric confidence`);
      const event: PatternFrameEvent = {
        kind,
        onset: clamp(eventEntry.onset, 0, 1),
        velocity: clamp(eventEntry.velocity, 0, 1),
        confidence: clamp(eventEntry.confidence, 0, 1),
      };
      if (note !== undefined) event.note = note;
      if (pitch !== undefined) event.pitch = pitch;
      if (hz !== undefined) event.hz = hz;
      events.push(event);
    }
    const tags = Array.isArray(entry.tags) ? entry.tags.filter((tag): tag is string => typeof tag === "string") : [];
    frames.push({
      s: entry.s,
      rms: clamp(entry.rms, 0, 1),
      centroid: Math.max(0, entry.centroid),
      flux: Math.max(0, entry.flux),
      chroma,
      embedding: frameEmbedding,
      events,
      tags,
    });
  }
  return {
    ok: true,
    doc: {
      schema: TIMELINE_SCHEMA_VERSION,
      source,
      bpm: value.bpm,
      seconds: value.seconds,
      embedding,
      frames,
    },
  };
}

// ---------------------------------------------------------------------------
// the canonical round trip (the determinism law)
// ---------------------------------------------------------------------------

/** Builds the canonical project object: the contract key order, every
 * number rounded to four decimals. */
function canonicalProject(doc: PatternProject): Record<string, unknown> {
  return {
    schema: PATTERN_SCHEMA_VERSION,
    bpm: round4(doc.bpm),
    root: doc.root,
    scale: doc.scale,
    bars: doc.bars,
    mood: doc.mood,
    prompt: doc.prompt,
    drums: {
      kick: [...doc.drums.kick],
      snare: [...doc.drums.snare],
      hat: [...doc.drums.hat],
      clap: [...doc.drums.clap],
    },
    notes: doc.notes.map((note) => ({
      step: note.step,
      pitch: round4(note.pitch),
      vel: round4(note.vel),
      dur: round4(note.dur),
      voice: note.voice,
    })),
    embedding: doc.embedding.map(round4),
  };
}

/** Builds the canonical timeline object: the contract key order, every
 * number rounded to four decimals, the optional event fields dropped when
 * absent. */
function canonicalTimeline(doc: PatternTimeline): Record<string, unknown> {
  return {
    schema: TIMELINE_SCHEMA_VERSION,
    source: doc.source,
    bpm: round4(doc.bpm),
    seconds: round4(doc.seconds),
    embedding: doc.embedding.map(round4),
    frames: doc.frames.map((frame) => ({
      s: frame.s,
      rms: round4(frame.rms),
      centroid: round4(frame.centroid),
      flux: round4(frame.flux),
      chroma: frame.chroma.map(round4),
      embedding: frame.embedding.map(round4),
      events: frame.events.map((event) => ({
        kind: event.kind,
        ...(event.note === undefined ? {} : { note: event.note }),
        ...(event.pitch === undefined ? {} : { pitch: round4(event.pitch) }),
        onset: round4(event.onset),
        velocity: round4(event.velocity),
        confidence: round4(event.confidence),
        ...(event.hz === undefined ? {} : { hz: round4(event.hz) }),
      })),
      tags: [...frame.tags],
    })),
  };
}

/**
 * Serializes a pattern document to its canonical json: the validator runs
 * first (a broken document throws PatternError honestly), then the
 * canonical builder orders every key and rounds every number to four
 * decimals — the same document always serializes to the same bytes,
 * whatever key order it arrived with.
 *
 * @param doc the project or timeline document.
 * @returns the canonical json string.
 */
export function serializePattern(doc: PatternDocument): string {
  const result =
    doc.schema === PATTERN_SCHEMA_VERSION
      ? validatePatternProject(doc)
      : doc.schema === TIMELINE_SCHEMA_VERSION
        ? validatePatternTimeline(doc)
        : fail("bad-schema", `the document carries neither pattern schema literal (${PATTERN_SCHEMA_IDS.join(", ")})`);
  if (!result.ok) throw new PatternError(result.code, result.message);
  const canonical =
    result.doc.schema === PATTERN_SCHEMA_VERSION ? canonicalProject(result.doc) : canonicalTimeline(result.doc);
  return JSON.stringify(canonical);
}

/**
 * Parses a json string onto a pattern document: the json must parse and
 * carry one of the two schema literals, then the matching validator clamps
 * or answers the machine code.
 *
 * @param json the serialized document.
 * @returns the clamped document or the machine code.
 */
export function parsePattern(json: string): PatternResult<PatternDocument> {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return fail("bad-schema", "the payload is not valid json");
  }
  if (isRecord(value)) {
    if (value.schema === PATTERN_SCHEMA_VERSION) return validatePatternProject(value);
    if (value.schema === TIMELINE_SCHEMA_VERSION) return validatePatternTimeline(value);
  }
  return fail("bad-schema", `the schema must be "${PATTERN_SCHEMA_VERSION}" or "${TIMELINE_SCHEMA_VERSION}"`);
}

// ---------------------------------------------------------------------------
// the llm bridge (the tables become the instruction)
// ---------------------------------------------------------------------------

/**
 * Builds the one-paragraph instruction an llm reads to emit a valid
 * debonair.pattern/1 document: every token comes from the enum tables (the
 * note names, the forty-eight scales, the voices, the lane keys, the genre
 * keys) and the limits table — zero hardcoded vocabulary. When a document
 * is passed, its pinned scalars ride the paragraph so the model edits in
 * place.
 *
 * @param doc the document at hand (optional, any subset of its scalars).
 * @returns the instruction paragraph.
 */
export function patternPromptHint(doc?: Partial<PatternProject>): string {
  const { bpmMin, bpmMax, barsMin, barsMax, pitchMin, pitchMax, velMin, velMax, durMin, durMax } = PATTERN_LIMITS;
  const pinned: string[] = [];
  if (doc !== undefined) {
    if (isFiniteNumber(doc.bpm)) pinned.push(`bpm ${doc.bpm}`);
    if (doc.root !== undefined) pinned.push(`root ${doc.root} (${patternNoteName(doc.root)})`);
    if (doc.scale !== undefined) pinned.push(`scale ${doc.scale}`);
    if (isFiniteNumber(doc.bars)) pinned.push(`bars ${doc.bars}`);
    if (doc.mood !== undefined && doc.mood !== "") pinned.push(`mood "${doc.mood}"`);
  }
  const pin =
    pinned.length > 0
      ? ` The document at hand pins ${pinned.join(", ")} — keep them unless the request says otherwise.`
      : "";
  const parts = [
    `answer one json object and nothing else, with the schema "${PATTERN_SCHEMA_VERSION}":`,
    `bpm a number ${bpmMin}..${bpmMax};`,
    `root an integer 0..11 or one of the note names ${NOTE_NAMES.join(", ")};`,
    `scale one of the forty-eight ${PATTERN_SCALE_NAMES.join(", ")};`,
    `bars an integer ${barsMin}..${barsMax};`,
    `mood a short free-text label that may name one of the genres ${PATTERN_GENRE_KEYS.join(", ")};`,
    `prompt one free-text sentence;`,
    `drums an object with the four lanes ${DRUM_LANE_KEYS.join(", ")}, each an array of ${LANE_STEPS} hits written 0 or 1;`,
    `notes an array of events, each {step an integer 16th index, pitch midi ${pitchMin}..${pitchMax}, vel ${velMin}..${velMax}, dur ${durMin}..${durMax} steps, voice one of ${PATTERN_VOICES.join(", ")} — pluck when omitted};`,
    `embedding an array of ${EMBEDDING_DIM} numbers, zeros when unknown.`,
  ];
  return `${parts.join(" ")}${pin}`;
}

/**
 * Reads an llm answer onto a project document: the json must parse and
 * validate as debonair.pattern/1; every failure answers its machine code
 * (bad-schema for unparsable json, a foreign schema or a timeline answer)
 * so the caller surfaces the honest reason.
 *
 * @param json the raw model answer.
 * @returns the clamped document or the machine code.
 */
export function patternFromLlm(json: string): PatternResult<PatternProject> {
  const result = parsePattern(json);
  if (!result.ok) return result;
  if (result.doc.schema !== PATTERN_SCHEMA_VERSION)
    return fail(
      "bad-schema",
      `the model answered a "${result.doc.schema}" document, expected "${PATTERN_SCHEMA_VERSION}"`,
    );
  return { ok: true, doc: result.doc };
}
