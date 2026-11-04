/**
 * genre — consolidated genre engine logics of the debonair family.
 * @module genre
 * @family wave/logicfold2
 * One keyed file per family: the former variant arms (genrecorpus, genrematrix)
 * retired into this seat with every export preserved under the same name.
 */

import { composeFromProfile } from "./composer.ts";
import { PROGRESSION_IDS, hashSeed, mulberry32 } from "./harmonyengine.ts";
import { IngestDocument, ingestMixPcm } from "./ingest.ts";
import { limitTruePeak } from "./limiter.ts";
import { SCALE_NAMES, ScaleName } from "./musictheory.ts";
import { CHROMA_BINS, GenreProfile, IngestDocumentWithId, PROFILE_GENRE_KEYS, PROFILE_LIMITS, SEGMENT_DIM, TrainedCorpusSeat, TrainedStyleVector, mineGenre } from "./pattern.ts";
import { RENDER_SAMPLE_RATE, renderPatternMix, schedulePattern } from "./render.ts";
import { FAMILY_NAMES, FamilyName } from "./rhythmgrammar.ts";

/* ===== block: genrecorpus ===== */
// # genrecorpus — the trained genre corpus of the classifier (root layer,
// the corpus wave of the style law): one feature vector per style,
// TRAINED over real audio — no dictionary constant ever answers a
// verdict through this lane. the training pipeline is the engine's own,
// end to end: for every genre of the style dictionary the composer
// writes reference plans (over a seed profile the dictionary sparks —
// the writing needs a profile, the TRUTH is never the profile: it is
// what the measurement answers), the render lane synthesises every
// reference take sample-accurately at the 48 khz mastering rate through
// the engine's own recipes and closes it with the deterministic
// true-peak limiter (the published bounce shape), the ingest lane
// decomposes every take into the mix-lane document (the same analyzers
// the library's pre-training rides — the report and the per-second
// segment vectors over the real pcm), and the pattern miner mines the
// genre's references into the profile the corpus row carries: the
// 22-seat segment centroid (the same similarity space the profile and
// the rank ride), the bpm median, the loudness target and the
// twelve-bin chroma profile — every number measured off real rendered
// audio, never read off the dictionary.
// the wiring is the seam law: the classifier (patternminer's
// classifyDocument) takes the corpus through the structural
// TrainedCorpusSeat — this module builds the corpus, satisfies the seat
// and hands it over, so the ONE verdict entry point answers from
// trained data when a corpus rides and keeps its pinned style-law
// ranking when it does not (zero feature loss, no import cycle: the
// miner never imports this file, the seat is structural).
// the corpus document is versioned and canonical like every payload the
// house writes: debonair.corpus/1, the validator clamps tolerantly and
// rejects hard with machine codes, the serializer orders every key and
// rounds every number to four decimals — the same corpus always
// serializes to the same bytes. the training is deterministic and
// instant-free (the epoch instant the reference documents carry is the
// determinism law: no wall clock ever enters the corpus), pure and
// node-side — zero network, zero storage, zero browser.








// ---------------------------------------------------------------------------
// the schema and the typed failure (the payload discipline)
// ---------------------------------------------------------------------------

/** The schema literal of the trained genre corpus document (the only one). */
export const CORPUS_SCHEMA_VERSION = "debonair.corpus/1";

/** The machine readable failure codes of the corpus contract. */
export const CORPUS_ERROR_CODES = ["bad-schema", "bad-genre", "bad-style", "empty-corpus"] as const;

/** Every machine code the corpus contract answers. */
export type CorpusErrorCode = (typeof CORPUS_ERROR_CODES)[number];

/** The typed corpus failure, traceable to its machine code. */
export class CorpusError extends Error {
  /** Machine readable failure code. */
  readonly code: CorpusErrorCode;

  constructor(code: CorpusErrorCode, message?: string) {
    super(message ?? `corpus ${code}`);
    this.name = "CorpusError";
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// the corpus document
// ---------------------------------------------------------------------------

/** One trained style row of the corpus: the measured feature vector of one
 * genre, mined over its reference takes. */
export interface CorpusStyleRow {
  /** The stable genre id of the style dictionary. */
  genreId: string;
  /** The human label of the genre. */
  label: string;
  /** The trained 22-seat segment centroid (the similarity space's law). */
  vector: readonly number[];
  /** The trained bpm median, measured over the reference takes. */
  bpm: number;
  /** The trained loudness target (measured LUFS). */
  lufs: number;
  /** The trained chroma profile, twelve normalized bins. */
  chroma: readonly number[];
  /** The reference count the row trained on. */
  trainedOn: number;
  /** The reference ids the row trained on (the canonical order). */
  referenceIds: readonly string[];
}

/** The trained genre corpus: one row per trained style, the dictionary's
 * own order (a partial corpus trains the styles it trained — the seat
 * covers what it covered, the style law covers the rest). */
export interface GenreCorpus {
  /** The schema literal ("debonair.corpus/1"). */
  schema: "debonair.corpus/1";
  /** The reference takes each style trained on. */
  referencesPerGenre: number;
  /** The trained style rows, the dictionary's order. */
  styles: readonly CorpusStyleRow[];
}

/** The typed answer of the corpus validator. */
export type CorpusResult = { ok: true; doc: GenreCorpus } | { ok: false; code: CorpusErrorCode; message: string };

/** The training options the corpus accepts. */
export interface CorpusTrainOptions {
  /** The reference takes each style trains on (default 1 — the honest
   * floor; more references deepen the centroid). */
  referencesPerGenre?: number;
  /** The bars each reference take spans (default 2 — a phrase pair). */
  bars?: number;
}

/** The default reference count (the honest floor, documented above). */
export const CORPUS_DEFAULT_REFERENCES = 1;

/** The default bar span of a reference take. */
export const CORPUS_DEFAULT_BARS = 2;

/** The epoch instant the reference documents carry — the determinism law:
 * no wall clock ever enters the corpus (the same training always answers
 * the same bytes). */
export const CORPUS_INSTANT = "1970-01-01T00:00:00.000Z";

// ---------------------------------------------------------------------------
// the seed profile (the writer's spark, never the truth)
// ---------------------------------------------------------------------------

/** True when the scale name seats the minor family (the seed heuristic —
 * the mode the seed profile's key pool declares; the corpus's truth is
 * the measured chroma, never this spelling). */
function minorish(scale: string): boolean {
  return /minor|phrygian|dorian|locrian|blues/.test(scale);
}

/**
 * Builds the seed profile of one genre — the profile the composer needs
 * to write for the style: the tempo band and the median from the
 * dictionary's own row, the mode the first scale's family declares, the
 * even band split and the flat onset curve (the family grid rides). The
 * honest law, documented never hidden: the seed profile only sparks the
 * WRITING — the corpus row never reads a number off it; every number the
 * row carries is measured off the rendered reference takes.
 *
 * @param genre the style dictionary row.
 * @returns the seed profile (validateGenreProfile ok).
 */
export function seedProfileOf(genre: (typeof GENRES)[number]): GenreProfile {
  const mode = minorish(genre.scales[0] ?? "") ? "minor" : "major";
  return {
    schema: "debonair.profile/1",
    genre: genre.id,
    referenceIds: ["corpus-seed"],
    trainedOn: 1,
    bpm: { min: genre.bpmin, median: genre.bpm, max: genre.bpmax, histogram: new Array<number>(8).fill(0) },
    keyPool: [{ name: mode === "minor" ? "A minor" : "C major", weight: 1 }],
    onsetDensity: new Array<number>(16).fill(0),
    bandBalance: { low: 1 / 3, mid: 1 / 3, high: 1 / 3 },
    loudness: { target: genre.lufs, min: genre.lufs - 1, max: genre.lufs + 1 },
    centroid: new Array<number>(SEGMENT_DIM).fill(0),
    chromaProfile: new Array<number>(CHROMA_BINS).fill(0),
    updatedAt: CORPUS_INSTANT,
  };
}

// ---------------------------------------------------------------------------
// the training pipeline (compose -> render -> ingest -> mine)
// ---------------------------------------------------------------------------

/**
 * Renders one reference take of a genre — the engine's own walk: the
 * composer writes the plan over the seed profile and the salt, the render
 * lane synthesises the mix at the mastering rate and closes it with the
 * true-peak limiter (the published bounce shape the classifier's queries
 * mastered through themselves).
 *
 * @param genre the style dictionary row.
 * @param profile the seed profile.
 * @param index the reference index (the salt).
 * @param bars the bar span of the take.
 * @returns the limited pcm of the reference take.
 */
function renderReference(
  genre: (typeof GENRES)[number],
  profile: GenreProfile,
  index: number,
  bars: number,
): Float32Array {
  const plan = composeFromProfile(
    `${genre.id} reference take ${index} at ${bars} bars`,
    profile,
    `corpus:${genre.id}:${index}`,
  );
  const schedule = schedulePattern(plan);
  const mix = renderPatternMix(schedule, `noise:corpus:${genre.id}:${index}:${plan.prompt}`);
  return limitTruePeak(mix, RENDER_SAMPLE_RATE);
}

/**
 * Trains the genre corpus — one measured feature vector per style: for
 * every genre of the dictionary, the references render through the
 * engine's own lanes (the composer, the render lane, the true-peak
 * close), the ingest lane decomposes every take into the mix-lane
 * document (the real analyzers over the real pcm) and the pattern miner
 * mines the genre's references into the profile the row carries — the
 * centroid, the bpm median, the loudness target, the chroma profile.
 * Deterministic and instant-free: the same options always answer the
 * same corpus bit-for-bit (the epoch instant, the seeded salts, the
 * pure dsp). Pure and node-side — zero network, zero storage.
 *
 * @param options the reference count and the bar span (the defaults ride
 *   the honest floor: one reference per style, two bars).
 * @returns the trained corpus (schema debonair.corpus/1).
 */
export function trainGenreCorpus(options: CorpusTrainOptions = {}): GenreCorpus {
  const references = Math.max(1, Math.min(8, Math.round(options.referencesPerGenre ?? CORPUS_DEFAULT_REFERENCES)));
  const bars = Math.max(1, Math.min(16, Math.round(options.bars ?? CORPUS_DEFAULT_BARS)));
  const styles: CorpusStyleRow[] = [];
  for (const genre of GENRES) {
    const profile = seedProfileOf(genre);
    const documents: IngestDocumentWithId[] = [];
    for (let index = 0; index < references; index++) {
      const pcm = renderReference(genre, profile, index, bars);
      const doc: IngestDocument = ingestMixPcm(pcm, RENDER_SAMPLE_RATE, {
        name: `corpus:${genre.id}:${index}`,
        at: CORPUS_INSTANT,
      });
      documents.push({ ...doc, id: `corpus:${genre.id}:${index}` });
    }
    const mined = mineGenre(documents, genre.id);
    styles.push({
      genreId: genre.id,
      label: genre.label,
      vector: mined.centroid,
      bpm: mined.bpm.median,
      lufs: mined.loudness.target,
      chroma: mined.chromaProfile,
      trainedOn: documents.length,
      referenceIds: mined.referenceIds,
    });
  }
  return { schema: CORPUS_SCHEMA_VERSION, referencesPerGenre: references, styles };
}

// ---------------------------------------------------------------------------
// the validator and the canonical round trip (the determinism law)
// ---------------------------------------------------------------------------

/** True when the value is a finite number. */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** True when the value is a plain record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Rounds to four decimals (the canonical number law). */
function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}

/** Clamps into 0..1 (the tolerant tier of the bounded seats). */
function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** Clamps into an inclusive band (the tolerant tier). */
function clampBand(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

/** Fails a validator with one machine readable code. */
function fail(code: CorpusErrorCode, message: string): CorpusResult {
  return { ok: false, code, message };
}

/**
 * Validates a debonair.corpus/1 payload: the schema literal, the style
 * rows (the genre keys of the dictionary, unique; the vector's 22 seats
 * and the chroma's 12 bins clamped 0..1; the bpm and the loudness clamped
 * into the profile limits' bands; the counts and the reference ids of the
 * tolerant tier), every present-but-broken shape answering its machine
 * code.
 *
 * @param value the parsed json payload (unknown by design).
 * @returns the normalized corpus or the machine code.
 */
export function validateGenreCorpus(value: unknown): CorpusResult {
  if (!isRecord(value)) return fail("bad-schema", "the corpus payload is not an object");
  if (value.schema !== CORPUS_SCHEMA_VERSION) return fail("bad-schema", `the schema must be "${CORPUS_SCHEMA_VERSION}"`);
  const references = isFiniteNumber(value.referencesPerGenre)
    ? clampBand(Math.round(value.referencesPerGenre), 1, 8)
    : CORPUS_DEFAULT_REFERENCES;
  if (!Array.isArray(value.styles)) return fail("bad-style", "the styles must be an array");
  if (value.styles.length === 0) return fail("empty-corpus", "the corpus trains at least one style — none rode the payload");
  const styles: CorpusStyleRow[] = [];
  const seen = new Set<string>();
  for (const [index, entry] of value.styles.entries()) {
    if (!isRecord(entry)) return fail("bad-style", `the style at ${index} is not an object`);
    if (typeof entry.genreId !== "string" || !PROFILE_GENRE_KEYS.includes(entry.genreId))
      return fail("bad-genre", `the style at ${index} carries the genre "${String(entry.genreId)}" — not one of the fifteen`);
    if (seen.has(entry.genreId)) return fail("bad-genre", `the style at ${index} repeats the genre ${entry.genreId}`);
    seen.add(entry.genreId);
    const label = typeof entry.label === "string" ? entry.label : "";
    if (!Array.isArray(entry.vector) || entry.vector.length !== SEGMENT_DIM)
      return fail("bad-style", `the style at ${index} needs ${SEGMENT_DIM} vector seats`);
    const vector: number[] = [];
    for (const seat of entry.vector) {
      if (!isFiniteNumber(seat)) return fail("bad-style", `the style at ${index} carries a non-numeric vector seat`);
      vector.push(clamp01(seat));
    }
    if (!Array.isArray(entry.chroma) || entry.chroma.length !== CHROMA_BINS)
      return fail("bad-style", `the style at ${index} needs ${CHROMA_BINS} chroma bins`);
    const chroma: number[] = [];
    for (const bin of entry.chroma) {
      if (!isFiniteNumber(bin)) return fail("bad-style", `the style at ${index} carries a non-numeric chroma bin`);
      chroma.push(clamp01(bin));
    }
    const bpm = isFiniteNumber(entry.bpm) ? clampBand(entry.bpm, PROFILE_LIMITS.bpmMin, PROFILE_LIMITS.bpmMax) : 0;
    const lufs = isFiniteNumber(entry.lufs) ? clampBand(entry.lufs, PROFILE_LIMITS.lufsMin, PROFILE_LIMITS.lufsMax) : 0;
    const trainedOn = isFiniteNumber(entry.trainedOn) ? Math.max(0, Math.round(entry.trainedOn)) : 0;
    const referenceIds = Array.isArray(entry.referenceIds)
      ? entry.referenceIds.filter((id): id is string => typeof id === "string")
      : [];
    styles.push({ genreId: entry.genreId, label, vector, bpm, lufs, chroma, trainedOn, referenceIds });
  }
  // the canonical order: the dictionary's own (the fifteen in their row
  // order, a partial corpus keeps the subset's order)
  const ordered = PROFILE_GENRE_KEYS.flatMap((key) => styles.filter((style) => style.genreId === key));
  return { ok: true, doc: { schema: CORPUS_SCHEMA_VERSION, referencesPerGenre: references, styles: ordered } };
}

/** Builds the canonical corpus object: the contract key order, every
 * number rounded to four decimals. */
function canonicalCorpus(doc: GenreCorpus): Record<string, unknown> {
  return {
    schema: CORPUS_SCHEMA_VERSION,
    referencesPerGenre: doc.referencesPerGenre,
    styles: doc.styles.map((style) => ({
      genreId: style.genreId,
      label: style.label,
      vector: style.vector.map(round4),
      bpm: round4(style.bpm),
      lufs: round4(style.lufs),
      chroma: style.chroma.map(round4),
      trainedOn: style.trainedOn,
      referenceIds: [...style.referenceIds],
    })),
  };
}

/**
 * Serializes a corpus to its canonical json: the validator runs first (a
 * broken corpus throws CorpusError honestly), then the canonical builder
 * orders every key and rounds every number to four decimals — the same
 * corpus always serializes to the same bytes, whatever key order it
 * arrived with.
 *
 * @param corpus the trained genre corpus.
 * @returns the canonical json string.
 * @throws CorpusError when the corpus fails the contract.
 */
export function serializeCorpus(corpus: GenreCorpus): string {
  const result = validateGenreCorpus(corpus);
  if (!result.ok) throw new CorpusError(result.code, result.message);
  return JSON.stringify(canonicalCorpus(result.doc));
}

/**
 * Parses a json string onto a corpus document: the json must parse and
 * carry the corpus schema literal, then the validator clamps or answers
 * the machine code.
 *
 * @param json the serialized corpus.
 * @returns the normalized corpus or the machine code.
 */
export function parseCorpus(json: string): CorpusResult {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return fail("bad-schema", "the corpus payload is not valid json");
  }
  return validateGenreCorpus(value);
}

// ---------------------------------------------------------------------------
// the seat and the default corpus (the wiring)
// ---------------------------------------------------------------------------

/**
 * Hands the corpus to the classifier — the structural seat the trained
 * lane satisfies: the style rows as the classifier's TrainedStyleVector
 * list (the same shape, the same seats — classifyDocument(doc, seat)
 * answers from the trained data).
 *
 * @param corpus the trained genre corpus (or the parsed document).
 * @returns the trained corpus seat (structural).
 */
export function corpusSeatOf(corpus: GenreCorpus): TrainedCorpusSeat {
  const styles: TrainedStyleVector[] = corpus.styles.map((style) => ({
    genreId: style.genreId,
    label: style.label,
    vector: style.vector,
    bpm: style.bpm,
    lufs: style.lufs,
    chroma: style.chroma,
  }));
  return { styles };
}

/** The memo of the default corpus — the training is deterministic, so
 * one walk per process answers every caller (the lazy seat keeps the
 * import graph light: nothing renders until a caller asks). */
let defaultCorpusMemo: GenreCorpus | null = null;

/**
 * The default trained corpus — one reference take per style, two bars
 * each, trained on the first call and memoized (the training is pure and
 * deterministic: the same walk always answers the same corpus, so the
 * memo never lies). The seat the gateway and the surfaces hand the
 * classifier when the deploy trains no corpus of its own.
 *
 * @returns the default trained genre corpus.
 */
export function defaultGenreCorpus(): GenreCorpus {
  if (defaultCorpusMemo === null) defaultCorpusMemo = trainGenreCorpus();
  return defaultCorpusMemo;
}

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
