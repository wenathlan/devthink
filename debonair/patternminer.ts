// # patternminer — the genre tool the references feed (root layer): reads
// the ingested documents of one genre and answers the genre profile — the
// bpm distribution, the key pool, the onset density curve, the band
// balance, the loudness targets and the chroma profile — as the versioned
// deterministic document debonair.profile/1 (the pipeline waves PV3.001
// through PV3.003). the similarity rank answers a prompt with its nearest
// references: cosine over the mean normalized segment vectors, the same
// normalization law the reference embedding laid down (the same seats, the
// same clamps, so the space stays comparable). everything here is pure and
// deterministic: the documents sort by id into the canonical order first,
// every number rounds to four decimals, so the same documents always
// answer the same profile — byte-identical whatever permutation the caller
// hands. the chord ladder the pipeline wave names rides the chroma profile
// (the honest limit: the ingest documents carry no chord annotations, the
// twelve-bin tonal mass is the seat the composer reads). the validators
// hand-roll the whole contract (zero dependencies, the family law): they
// clamp tolerantly where the contract allows and reject hard with machine
// codes where the shape breaks. non-goals: no audio, no storage (the row
// seat lives in ingestdb.ts), no scheduling — pure and multi-mode, the
// same call runs in the browser and in node.

import { GENRES } from "./genrematrix.ts";
import type { IngestDocument, IngestSegment } from "./ingest.ts";
import { NOTE_NAMES, noteName } from "./musictheory.ts";

// ---------------------------------------------------------------------------
// the schema id and the vocabulary tables (the constant-table law)
// ---------------------------------------------------------------------------

/** The schema literal of the genre profile document (the only one). */
export const PROFILE_SCHEMA_VERSION = "debonair.profile/1";

/** The genre keys the profile names (the ids the style dictionary owns —
 * the grouping law: the caller groups the references by one of these). */
export const PROFILE_GENRE_KEYS: readonly string[] = GENRES.map((genre) => genre.id);

/** The key modes the pool vocabulary carries. */
export const KEY_MODES: readonly string[] = ["major", "minor"];

/** The twenty-four key names of the pool vocabulary: the twelve tonic
 * spellings of the theory kernel, each in both modes. */
export const KEY_POOL_NAMES: readonly string[] = NOTE_NAMES.flatMap((name) =>
  KEY_MODES.map((mode) => `${name} ${mode}`),
);

/** The seats of the normalized segment vector (the reference embedding
 * layout): rms, peak, zcr, cent, flat, beat, onsets, the three band
 * fractions, the twelve chroma bins. */
export const SEGMENT_DIM = 22;

/** The chroma bins a profile carries (the pitch-class wheel). */
export const CHROMA_BINS = 12;

/** The bins of the onset density curve (the normalized timeline resample). */
export const ONSET_CURVE_BINS = 16;

/** The rms clamp of the reference seat: the level multiplies by 2.4 before
 * the 0..1 cap (the reference embeds its dynamics seat the same way). */
const RMS_GAIN = 2.4;
/** The zcr clamp of the reference seat: the rate multiplies by 8. */
const ZCR_GAIN = 8;
/** The centroid clamp of the reference seat: the hz divide by 8000 (the
 * mission's explicit cap). */
const CENT_HZ = 8000;
/** The flatness clamp of the reference seat: the flatness multiplies by 2. */
const FLAT_GAIN = 2;
/** The beat clamp of the reference onset-strength seat: the rise
 * multiplies by 4 (the beat field is the onset strength of a second). */
const BEAT_GAIN = 4;
/** The onset clamp of the mission law: the per-second count divides by 4
 * before the cap (the reference divided by 3 — our detector counts the
 * envelope peaks of a full mix second, four a second is the busy ceiling). */
const ONSETS_CEILING = 4;

/** The bpm histogram edges: nine edges answer the eight buckets, the last
 * edge inclusive — a value lands in the first bucket whose upper edge
 * clears it, below the table folds into bucket 0, above it into the last
 * (the analyze band 60..190 rides inside, the matrix bands 60..176 land
 * whole). */
const BPM_BUCKET_EDGES: readonly number[] = [60, 80, 100, 120, 140, 160, 180, 200, 240];

/** The bucket count of the bpm histogram (derived from the edges table). */
export const BPM_BUCKETS = BPM_BUCKET_EDGES.length - 1;

/** The contract ranges the tolerant tier clamps into (the single home of
 * every number the contract pins beyond the 0..1 clamps). */
export const PROFILE_LIMITS = {
  /** The bpm band of the tolerant scalars. */
  bpmMin: 0,
  bpmMax: 300,
  /** The lufs band of the tolerant scalars. */
  lufsMin: -60,
  lufsMax: 0,
} as const;

// ---------------------------------------------------------------------------
// the typed failure (machine codes the caller surfaces)
// ---------------------------------------------------------------------------

/** The machine readable failure codes of the profile contract: the seven
 * validator codes the law names plus the miner's empty-set (a genre with
 * no references answers no profile — the honest error, never a zero
 * profile that would masquerade as an answer). */
export const PROFILE_ERROR_CODES = [
  "bad-schema",
  "bad-genre",
  "bad-histogram",
  "bad-keypool",
  "bad-curve",
  "bad-bands",
  "bad-chroma",
  "empty-set",
] as const;

/** Every machine code the profile contract answers. */
export type ProfileErrorCode = (typeof PROFILE_ERROR_CODES)[number];

/** The typed profile failure, traceable to its machine code. */
export class ProfileError extends Error {
  /** Machine readable failure code. */
  readonly code: ProfileErrorCode;

  constructor(code: ProfileErrorCode, message?: string) {
    super(message ?? `profile ${code}`);
    this.name = "ProfileError";
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// the payload document (the profile contract)
// ---------------------------------------------------------------------------

/** One ranked key of the pool. */
export interface KeyPoolEntry {
  /** The key name, a tonic spelling of the theory kernel plus a mode
   * ("A minor", "C major"). */
  name: string;
  /** The blend of the detector vote share and the tonic chroma mass,
   * 0..1. */
  weight: number;
}

/** The bpm distribution the profile answers. */
export interface ProfileBpm {
  /** The floor of the references' bpm. */
  min: number;
  /** The median of the references' bpm. */
  median: number;
  /** The ceiling of the references' bpm. */
  max: number;
  /** The eight-bucket histogram of the references' bpm (integer counts). */
  histogram: number[];
}

/** The loudness targets the profile answers. */
export interface ProfileLoudness {
  /** The integrated target the genre masters towards (the median lufs). */
  target: number;
  /** The quietest integrated lufs of the references. */
  min: number;
  /** The loudest integrated lufs of the references. */
  max: number;
}

/** The band balance means (the three fractions of the mix). */
export interface ProfileBands {
  /** The low band mean (under 250 hz). */
  low: number;
  /** The mid band mean (250 hz to 2 khz). */
  mid: number;
  /** The high band mean (above 2 khz). */
  high: number;
}

/** The genre profile document (schema debonair.profile/1): the numbers one
 * genre's references answer, deterministic for a given set — the composer
 * wave reads it, the vitrine cards surface it. */
export interface GenreProfile {
  /** The schema literal ("debonair.profile/1"). */
  schema: "debonair.profile/1";
  /** The genre key of the group (one of the fifteen). */
  genre: string;
  /** The minted document ids that fed it, id ascending (the audit chain). */
  referenceIds: string[];
  /** The count of the references that fed it. */
  trainedOn: number;
  /** The bpm distribution. */
  bpm: ProfileBpm;
  /** The ranked key pool, weight descending then name ascending. */
  keyPool: KeyPoolEntry[];
  /** The onset density curve: the per-second mean across the references,
   * normalized 0..1 over the corpus timeline, resampled to sixteen bins. */
  onsetDensity: number[];
  /** The band balance means. */
  bandBalance: ProfileBands;
  /** The loudness targets. */
  loudness: ProfileLoudness;
  /** The mean normalized segment vector — the cosine seat (the genre's
   * center, twenty-two seats). */
  centroid: number[];
  /** The twelve-bin chroma mean (the per-second pitch-class distributions
   * averaged; the chord ladder's honest seat). */
  chromaProfile: number[];
  /** The freshest ingestedAt of the references (the instant the profile's
   * data was last fed — deterministic, never a wall clock). */
  updatedAt: string;
}

/** The ingest document plus its row id (the minted pointer the audit
 * chain names — the grouping caller hands one per reference). */
export interface IngestDocumentWithId extends IngestDocument {
  /** The row id the ingest store assigned. */
  id: string;
}

/** One ranked reference of the similarity answer. */
export interface SimilarityHit {
  /** The reference's row id. */
  id: string;
  /** The cosine over the mean normalized segment vectors, 0..1. */
  score: number;
}

// ---------------------------------------------------------------------------
// the validation answer
// ---------------------------------------------------------------------------

/** The ok arm: the normalized profile. */
export interface ProfileOk {
  ok: true;
  doc: GenreProfile;
}

/** The err arm: the machine code and the honest message. */
export interface ProfileErr {
  ok: false;
  code: ProfileErrorCode;
  message: string;
}

/** The typed result the validator answers with (errors by return). */
export type ProfileResult = ProfileOk | ProfileErr;

// ---------------------------------------------------------------------------
// the pure helpers (the vector law and the numeric folds)
// ---------------------------------------------------------------------------

/** True when the value is a plain record (an object, not an array). */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** True when the value is a finite number. */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Rounds to four decimals (the canonical number law). */
function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}

/** Clamps into 0..1. */
function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** The honest floor: a non-finite number reads zero (the same tolerance
 * the validator clamps with — the miner never poisons a profile with a
 * NaN a malformed document carries). */
function fin(x: number): number {
  return Number.isFinite(x) ? x : 0;
}

/** Fails a validator with one machine readable code. */
function fail(code: ProfileErrorCode, message: string): ProfileErr {
  return { ok: false, code, message };
}

/** The median of a list: the middle of the ascending sort, the mean of the
 * two middles on even counts; zero when the list is empty. */
function medianOf(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? (sorted[mid] ?? 0) : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

/** The mean of a list rounded to four decimals; zero when the list is
 * empty (the aggregate never invents a value an empty corpus never had). */
function meanRounded(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const value of values) sum += value;
  return round4(sum / values.length);
}

/**
 * The normalization law: one ingest segment onto its twenty-two seats,
 * each clamped 0..1 the way the reference embedding clamped its
 * counterpart — rms by 2.4, zcr by 8, cent over 8000 hz, flatness by 2,
 * the beat rise by 4 (the onset-strength seat), the onset count by four
 * (the mission law), the peak and the band fractions and the chroma bins
 * in their natural 0..1. the same seats, the same clamps, so the space
 * stays comparable with the reference layout.
 *
 * @param segment one second of the mix (an ingest frame).
 * @returns the twenty-two-seat normalized vector.
 */
export function segmentVector(segment: IngestSegment): number[] {
  const bands = Array.isArray(segment.bands) ? segment.bands : [];
  const chroma = Array.isArray(segment.chroma) ? segment.chroma : [];
  const vector = [
    clamp01(fin(segment.rms) * RMS_GAIN),
    clamp01(fin(segment.peak)),
    clamp01(fin(segment.zcr) * ZCR_GAIN),
    clamp01(fin(segment.cent) / CENT_HZ),
    clamp01(fin(segment.flat) * FLAT_GAIN),
    clamp01(fin(segment.beat) * BEAT_GAIN),
    clamp01(fin(segment.onsets) / ONSETS_CEILING),
    clamp01(fin(bands[0] ?? 0)),
    clamp01(fin(bands[1] ?? 0)),
    clamp01(fin(bands[2] ?? 0)),
  ];
  for (let pc = 0; pc < CHROMA_BINS; pc++) vector.push(clamp01(fin(chroma[pc] ?? 0)));
  return vector;
}

/**
 * The document's seat in the similarity space: the mean of the mix
 * segments' normalized vectors, every seat rounded to four decimals —
 * the cosine law reads these, so a query and its references answer in the
 * same space (a document with no segments answers the zero vector).
 *
 * @param doc one ingest document (the mix lane is the read).
 * @returns the twenty-two-seat mean vector.
 */
export function documentVector(doc: IngestDocument): number[] {
  const segments = Array.isArray(doc.segments) ? doc.segments : [];
  if (segments.length === 0) return new Array<number>(SEGMENT_DIM).fill(0);
  const sums = new Array<number>(SEGMENT_DIM).fill(0);
  for (const segment of segments) {
    const vector = segmentVector(segment);
    for (let seat = 0; seat < SEGMENT_DIM; seat++) sums[seat] += vector[seat] ?? 0;
  }
  return sums.map((sum) => round4(sum / segments.length));
}

/* ============================================================ *
 * the genre verdict — the style-law classifier the ingest lane
 * rides: one document measured against the fifteen style seats of
 * the dictionary, every score derived from the report the analysis
 * measured (the bpm, the key mode, the loudness and the band
 * balance), never from the name. the seats:
 *   bpm      — inside the genre's inclusive range the score is one,
 *              outside it decays by the gaussian of the distance (the
 *              sigma of eight beats answers the neighboring-genre
 *              overlap the dictionary carries);
 *   mode     — the share of the genre's scales that match the
 *              document's measured key mode (minor scales against a
 *              minor key, major scales against a major key);
 *   loudness — the gaussian of the distance to the genre's mastered
 *              target (the three-decibel sigma the corpus documents);
 *   timbre   — the band-balance distance to the expectation the
 *              genre's timbre hints carry (the sub-heavy hints pull
 *              low, the hat hints pull high, the pad hints hold the
 *              mids).
 * the weighted sum answers the verdict score; the fifteen rank
 * descending, the confidence normalizes against the winning score so
 * a decisive document answers near one and an even field answers the
 * honest split. deterministic: the same document always answers the
 * same ranking bit-for-bit.
 * ============================================================ */

/** the weight each style seat carries in the verdict (the sum is one). */
export const GENRE_SEAT_WEIGHTS: Readonly<Record<"bpm" | "mode" | "loudness" | "timbre", number>> = {
  bpm: 0.35,
  mode: 0.2,
  loudness: 0.2,
  timbre: 0.25,
};

/** the gaussian sigma of the bpm seat (beats per minute). */
const BPM_SIGMA = 8;
/** the gaussian sigma of the loudness seat (LUFS). */
const LUFS_SIGMA = 3;

/** the minor-family scale names (the mode affinity the scales carry). */
const MINOR_SCALES: ReadonlySet<string> = new Set([
  "natural-minor",
  "harmonic-minor",
  "phrygian",
  "dorian",
  "locrian",
  "minor-pentatonic",
  "blues",
]);

/** the timbre hints that pull the expected band balance toward the lows,
 * the mids and the highs (the sub and kick hints ride low, the pad and
 * bell hints hold the mids, the hat and shimmer hints ride high). */
const TIMBRE_LOW: ReadonlySet<string> = new Set([
  "808-sub",
  "sliding-808",
  "punchy-kick",
  "sub-bass",
  "rumble",
  "vinyl-crackle",
  "sample-chops",
  "warm-keys",
]);
const TIMBRE_MID: ReadonlySet<string> = new Set([
  "dark-bells",
  "orchestral-stabs",
  "dark-pads",
  "warm-pads",
  "organ-chords",
  "ep-keys",
  "guitar-chops",
  "brass-stabs",
]);
const TIMBRE_HIGH: ReadonlySet<string> = new Set([
  "distorted-hats",
  "uk-hats",
  "shimmer",
  "bright-leads",
  "air-pads",
  "sizzle",
  "white-noise-sweeps",
  "plucks",
]);

/* ============================================================ *
 * the trained corpus seat — the classifier's trained lane: the
 * corpus wave (genrecorpus.ts) trains one feature vector per style
 * over real audio rendered through the engine's own dsp lanes and
 * hands the rows through this structural seat, so the ONE verdict
 * entry point answers from trained data when a corpus rides and
 * from the style-law seats when it does not (zero feature loss:
 * the no-corpus call keeps its pinned ranking bit-for-bit). every
 * seat the trained score reads is a number MEASURED off real
 * reference takes — the 22-seat segment centroid (the same
 * similarity space the profile rides), the bpm median, the lufs
 * target and the twelve-bin chroma profile — never a dictionary
 * constant. a genre the seat does not train keeps the style law
 * (the seat covers what it covered, the dictionary covers the rest).
 * ============================================================ */

/** One trained style row the corpus seat answers — structural, the
 * corpus lane (genrecorpus.ts) satisfies it with the profiles its
 * reference takes trained. */
export interface TrainedStyleVector {
  /** the stable genre id of the style dictionary. */
  genreId: string;
  /** the human label of the genre. */
  label: string;
  /** the trained 22-seat segment centroid (the similarity space's own
   * normalization law, measured over the reference takes). */
  vector: readonly number[];
  /** the trained bpm median (measured over the reference takes). */
  bpm: number;
  /** the trained loudness target (measured LUFS over the reference takes). */
  lufs: number;
  /** the trained chroma profile (twelve normalized bins, measured). */
  chroma: readonly number[];
}

/** The trained corpus seat the classifier rides — structural: the corpus
 * lane hands the trained style rows, the classifier never imports it (no
 * cycle, the seam law the render lane's stores ride). */
export interface TrainedCorpusSeat {
  /** One row per trained style (a genre absent from the rows keeps the
   * style-law seats). */
  styles: readonly TrainedStyleVector[];
}

/** the weight each trained seat carries in the corpus verdict (the sum is
 * one — the same law the style seats ride). the vector seat leads (the
 * full 22-seat similarity), the bpm seat carries the tempo the segment
 * space lacks (the composer's own documented gap), the loudness and the
 * chroma seats close the field. */
export const GENRE_CORPUS_WEIGHTS: Readonly<Record<"vector" | "bpm" | "lufs" | "chroma", number>> = {
  vector: 0.35,
  bpm: 0.3,
  lufs: 0.15,
  chroma: 0.2,
};

/** One trained style row the seat carries, indexed by genre id. */
function styleIndex(seat: TrainedCorpusSeat): Map<string, TrainedStyleVector> {
  const index = new Map<string, TrainedStyleVector>();
  for (const style of seat.styles) {
    if (!index.has(style.genreId)) index.set(style.genreId, style);
  }
  return index;
}

/** The mean normalized chroma of a document's mix segments (the same
 * mean-normalization law the profile's chroma profile rides: every
 * silent second sits the mean out). */
function documentChroma(doc: IngestDocument): number[] {
  const sums = new Array<number>(CHROMA_BINS).fill(0);
  let owners = 0;
  for (const segment of Array.isArray(doc.segments) ? doc.segments : []) {
    const chroma = Array.isArray(segment.chroma) ? segment.chroma : [];
    const bins: number[] = [];
    let sum = 0;
    for (let pc = 0; pc < CHROMA_BINS; pc++) {
      const value = fin(chroma[pc] ?? 0);
      bins.push(value);
      sum += value;
    }
    if (sum <= 0) continue;
    owners++;
    for (let pc = 0; pc < CHROMA_BINS; pc++) sums[pc] += (bins[pc] ?? 0) / sum;
  }
  if (owners === 0) return new Array<number>(CHROMA_BINS).fill(0);
  return sums.map((sum) => sum / owners);
}

/** The trained score of one style row against the document's measured
 * seats: the weighted sum of the four corpus seats, every number
 * measured off real reference takes. */
function trainedScore(
  style: TrainedStyleVector,
  seats: { vector: readonly number[]; bpm: number; lufs: number; chroma: readonly number[] },
): number {
  const vectorSeat = cosine(seats.vector, style.vector);
  const bpmSeat = gaussian(Math.abs(seats.bpm - style.bpm), BPM_SIGMA);
  const lufsSeat = gaussian(Math.abs(seats.lufs - style.lufs), LUFS_SIGMA);
  const chromaSeat = cosine(seats.chroma, style.chroma);
  return round4(
    Math.max(
      0,
      GENRE_CORPUS_WEIGHTS.vector * vectorSeat +
        GENRE_CORPUS_WEIGHTS.bpm * bpmSeat +
        GENRE_CORPUS_WEIGHTS.lufs * lufsSeat +
        GENRE_CORPUS_WEIGHTS.chroma * chromaSeat,
    ),
  );
}

/** one ranked verdict of the style-law classifier. */
export interface GenreVerdict {
  /** the stable genre id of the style dictionary ("trap"). */
  genreId: string;
  /** the human label of the genre ("Trap"). */
  label: string;
  /** the weighted style-law score, zero to one (four decimals). */
  score: number;
  /** the winner's share of the field (the confidence the ranking carries). */
  confidence: number;
}

/** the gaussian of a distance (the seat kernel the bpm and loudness ride).
 *
 * @param distance the absolute distance from the target.
 * @param sigma the width of the kernel.
 * @returns the decayed score in zero to one.
 */
function gaussian(distance: number, sigma: number): number {
  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

/** the expected band balance one genre's timbre hints carry: every hint
 * votes its band, the normalized votes answer the [low, mid, high]
 * expectation (a genre with no mapped hints answers the even split).
 *
 * @param genre one style of the dictionary.
 * @returns the expected [low, mid, high] shares (summing to one).
 */
function timbreExpectation(genre: (typeof GENRES)[number]): [number, number, number] {
  let low = 0;
  let mid = 0;
  let high = 0;
  for (const hint of genre.timbre) {
    if (TIMBRE_LOW.has(hint)) low += 1;
    else if (TIMBRE_MID.has(hint)) mid += 1;
    else if (TIMBRE_HIGH.has(hint)) high += 1;
  }
  const total = low + mid + high;
  if (total === 0) return [1 / 3, 1 / 3, 1 / 3];
  return [low / total, mid / total, high / total];
}

/** the mode affinity one genre's scales carry for the measured mode.
 *
 * @param genre one style of the dictionary.
 * @param mode the document's measured key mode.
 * @returns the share of the genre's scales matching the mode (the even
 * split when the genre declares no scales).
 */
function modeAffinity(genre: (typeof GENRES)[number], mode: "major" | "minor"): number {
  if (genre.scales.length === 0) return 0.5;
  let matching = 0;
  for (const scale of genre.scales) {
    const minorish = MINOR_SCALES.has(scale);
    if (minorish === (mode === "minor")) matching += 1;
  }
  return matching / genre.scales.length;
}

/**
 * classifyDocument — the style-law verdict of one ingest document: the
 * fifteen genres of the dictionary ranked by the weighted style seats the
 * report measured, the winner first with its share of the field as the
 * confidence. Every score derives from the document's measured numbers
 * (the bpm, the key mode, the loudness and the mean band balance) — never
 * from the name. When a trained corpus seat rides, the trained lane
 * takes over: every genre the seat trained answers its measured distance
 * (the 22-seat centroid cosine, the bpm gaussian, the loudness gaussian,
 * the chroma cosine — the trained data, never the dictionary constants)
 * and the genres the seat does not train keep the style law. Deterministic:
 * the same document answers the same ranking bit-for-bit; a damaged
 * report coerces through the analysis layer's own total law.
 *
 * @param doc one ingest document (the mix lane is the read).
 * @param seat the optional trained corpus seat (the corpus lane's rows).
 * @returns the fifteen verdicts ranked descending by score.
 */
export function classifyDocument(doc: IngestDocument, seat?: TrainedCorpusSeat): GenreVerdict[] {
  const bpm = fin(doc.mix.rhythm.bpm);
  const mode: "major" | "minor" = doc.mix.key.mode === "minor" ? "minor" : "major";
  const lufs = fin(doc.mix.loudness.integrated);
  const trained = seat === undefined ? undefined : styleIndex(seat);
  const trainedSeats =
    trained === undefined || trained.size === 0
      ? undefined
      : { vector: documentVector(doc), bpm, lufs, chroma: documentChroma(doc) };
  const segments = Array.isArray(doc.segments) ? doc.segments : [];
  let low = 0;
  let mid = 0;
  let high = 0;
  let owners = 0;
  for (const segment of segments) {
    const bands = Array.isArray(segment.bands) ? segment.bands : [];
    const a = fin(bands[0] ?? 0);
    const b = fin(bands[1] ?? 0);
    const c = fin(bands[2] ?? 0);
    const sum = a + b + c;
    if (sum <= 0) continue;
    owners += 1;
    low += a / sum;
    mid += b / sum;
    high += c / sum;
  }
  const balance: [number, number, number] =
    owners > 0 ? [low / owners, mid / owners, high / owners] : [1 / 3, 1 / 3, 1 / 3];
  const scored = GENRES.map((genre) => {
    // the trained lane first: a style the corpus trained answers its
    // measured distance, never the dictionary constants
    const trainedStyle = trained?.get(genre.id);
    if (trainedStyle !== undefined && trainedSeats !== undefined) {
      return { genreId: genre.id, label: genre.label, score: trainedScore(trainedStyle, trainedSeats) };
    }
    const bpmDistance = bpm < genre.bpmin ? genre.bpmin - bpm : bpm > genre.bpmax ? bpm - genre.bpmax : 0;
    const bpmSeat = gaussian(bpmDistance, BPM_SIGMA);
    const modeSeat = modeAffinity(genre, mode);
    const loudnessSeat = gaussian(Math.abs(lufs - genre.lufs), LUFS_SIGMA);
    const expectation = timbreExpectation(genre);
    const timbreSeat =
      1 -
      (Math.abs(balance[0] - expectation[0]) +
        Math.abs(balance[1] - expectation[1]) +
        Math.abs(balance[2] - expectation[2])) /
        2;
    const score =
      GENRE_SEAT_WEIGHTS.bpm * bpmSeat +
      GENRE_SEAT_WEIGHTS.mode * modeSeat +
      GENRE_SEAT_WEIGHTS.loudness * loudnessSeat +
      GENRE_SEAT_WEIGHTS.timbre * Math.max(0, timbreSeat);
    return { genreId: genre.id, label: genre.label, score: round4(Math.max(0, score)) };
  });
  const total = scored.reduce((sum, verdict) => sum + verdict.score, 0);
  return scored
    .map((verdict) => ({
      ...verdict,
      confidence: total > 0 ? round4(verdict.score / total) : 0,
    }))
    .sort((a, b) => b.score - a.score || (a.genreId < b.genreId ? -1 : a.genreId > b.genreId ? 1 : 0));
}

/** The cosine of two equal-length vectors; zero when either norm is zero
 * (the honest floor the reference similarity carries). */
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

/** The bucket a bpm lands in: the first bucket whose upper edge clears it,
 * below the table folds into bucket 0, above it into the last (inclusive). */
function bpmBucketOf(bpm: number): number {
  for (let b = 0; b < BPM_BUCKETS; b++) {
    if (bpm < (BPM_BUCKET_EDGES[b + 1] ?? Number.POSITIVE_INFINITY)) return b;
  }
  return BPM_BUCKETS - 1;
}

/**
 * The onset density curve of a corpus: the per-second mean onset count
 * across the documents that own the second, normalized so the busiest
 * second reads 1, then resampled onto sixteen bins over the longest
 * reference's timeline — the span law: bin b collects every second whose
 * [t, t+1) span overlaps the bin's slice of the timeline, each bin answers
 * the mean of its seconds (empty bins read 0, an honest resample whatever
 * the corpus length).
 *
 * @param docs the references of the genre, canonical order.
 * @returns the sixteen normalized bins.
 */
function onsetCurveOf(docs: readonly IngestDocumentWithId[]): number[] {
  const laneOf = (doc: IngestDocumentWithId): IngestSegment[] => (Array.isArray(doc.segments) ? doc.segments : []);
  const seconds = docs.reduce((top, doc) => Math.max(top, laneOf(doc).length), 0);
  const curve = new Array<number>(ONSET_CURVE_BINS).fill(0);
  if (seconds === 0) return curve;
  // the per-second mean across the documents that own the second
  const means = new Array<number>(seconds).fill(0);
  for (let t = 0; t < seconds; t++) {
    let sum = 0;
    let owners = 0;
    for (const doc of docs) {
      const segment = laneOf(doc)[t];
      if (segment === undefined) continue;
      sum += fin(segment.onsets);
      owners++;
    }
    means[t] = owners > 0 ? sum / owners : 0;
  }
  // the normalization: the busiest second reads 1
  let peak = 0;
  for (const mean of means) if (mean > peak) peak = mean;
  const norm = means.map((mean) => (peak > 0 ? mean / peak : 0));
  // the span law: the resample onto the sixteen bins
  for (let b = 0; b < ONSET_CURVE_BINS; b++) {
    const lo = b / ONSET_CURVE_BINS;
    const hi = (b + 1) / ONSET_CURVE_BINS;
    let sum = 0;
    let count = 0;
    for (let t = 0; t < seconds; t++) {
      if (t / seconds < hi && lo < (t + 1) / seconds) {
        sum += norm[t] ?? 0;
        count++;
      }
    }
    curve[b] = count > 0 ? round4(sum / count) : 0;
  }
  return curve;
}

// ---------------------------------------------------------------------------
// the validator (hand-rolled, zero dependencies — the family law)
// ---------------------------------------------------------------------------

/** The tolerant count clamp: a non-number reads zero, a finite value
 * rounds to a non-negative integer (the tier that never rejects). */
function countOf(value: unknown): number {
  return isFiniteNumber(value) ? Math.max(0, Math.round(value)) : 0;
}

/** The tolerant scalar clamp: a non-number reads zero, a finite value
 * clamps into the band (the tier that never rejects). */
function tolerantOf(value: unknown, lo: number, hi: number): number {
  return isFiniteNumber(value) ? Math.min(hi, Math.max(lo, value)) : 0;
}

/**
 * Validates a debonair.profile/1 payload. the law runs in three tiers:
 * the identity (the schema literal, the genre key — required, coded
 * bad-schema and bad-genre); the coded shapes (the histogram, the key
 * pool, the onset curve, the band balance, the chroma profile — an
 * absent field defaults to its empty shape, a present-but-broken one
 * answers its machine code); the tolerant scalars (the counts, the
 * reference ids, the bpm scalars, the loudness, the centroid, the
 * updatedAt — every absent field defaults, every present value clamps
 * into its band, never a rejection). the validator clamps, the
 * serializer rounds — the patternenums discipline.
 *
 * @param value the parsed json payload (unknown by design).
 * @returns the normalized profile or the machine code.
 */
export function validateGenreProfile(value: unknown): ProfileResult {
  if (!isRecord(value)) return fail("bad-schema", "the profile payload is not an object");
  if (value.schema !== PROFILE_SCHEMA_VERSION)
    return fail("bad-schema", `the schema must be "${PROFILE_SCHEMA_VERSION}"`);
  if (typeof value.genre !== "string" || !PROFILE_GENRE_KEYS.includes(value.genre))
    return fail("bad-genre", `the genre must be one of the fifteen keys (${PROFILE_GENRE_KEYS.join(", ")})`);
  // the tolerant scalars — the tier that never rejects
  const trainedOn = countOf(value.trainedOn);
  const referenceIds = Array.isArray(value.referenceIds)
    ? value.referenceIds.filter((id): id is string => typeof id === "string")
    : [];
  const updatedAt = typeof value.updatedAt === "string" ? value.updatedAt : "";
  // the coded shapes — absent defaults, broken answers its code
  const bpmSource: Record<string, unknown> = isRecord(value.bpm) ? value.bpm : {};
  let histogram = new Array<number>(BPM_BUCKETS).fill(0);
  if (bpmSource.histogram !== undefined) {
    const source = bpmSource.histogram;
    if (!Array.isArray(source) || source.length !== BPM_BUCKETS)
      return fail("bad-histogram", `the histogram must hold ${BPM_BUCKETS} buckets`);
    histogram = [];
    for (const entry of source) {
      if (!isFiniteNumber(entry)) return fail("bad-histogram", "the histogram buckets must be numbers");
      histogram.push(Math.max(0, Math.round(entry)));
    }
  }
  const bpm: ProfileBpm = {
    min: tolerantOf(bpmSource.min, PROFILE_LIMITS.bpmMin, PROFILE_LIMITS.bpmMax),
    median: tolerantOf(bpmSource.median, PROFILE_LIMITS.bpmMin, PROFILE_LIMITS.bpmMax),
    max: tolerantOf(bpmSource.max, PROFILE_LIMITS.bpmMin, PROFILE_LIMITS.bpmMax),
    histogram,
  };
  const keyPool: KeyPoolEntry[] = [];
  if (value.keyPool !== undefined) {
    if (!Array.isArray(value.keyPool)) return fail("bad-keypool", "the key pool must be an array");
    for (const entry of value.keyPool) {
      if (!isRecord(entry)) return fail("bad-keypool", "the key pool entry is not an object");
      if (typeof entry.name !== "string" || !KEY_POOL_NAMES.includes(entry.name))
        return fail("bad-keypool", `the key name "${String(entry.name)}" is outside the vocabulary`);
      if (!isFiniteNumber(entry.weight)) return fail("bad-keypool", "the key weight must be a number");
      keyPool.push({ name: entry.name, weight: clamp01(entry.weight) });
    }
  }
  let onsetDensity = new Array<number>(ONSET_CURVE_BINS).fill(0);
  if (value.onsetDensity !== undefined) {
    const source = value.onsetDensity;
    if (!Array.isArray(source) || source.length !== ONSET_CURVE_BINS)
      return fail("bad-curve", `the onset curve must hold ${ONSET_CURVE_BINS} bins`);
    onsetDensity = [];
    for (const bin of source) {
      if (!isFiniteNumber(bin)) return fail("bad-curve", "the onset curve bins must be numbers");
      onsetDensity.push(clamp01(bin));
    }
  }
  let bandBalance: ProfileBands = { low: 0, mid: 0, high: 0 };
  if (value.bandBalance !== undefined) {
    const source = value.bandBalance;
    if (!isRecord(source)) return fail("bad-bands", "the band balance must carry low, mid and high");
    if (!isFiniteNumber(source.low) || !isFiniteNumber(source.mid) || !isFiniteNumber(source.high))
      return fail("bad-bands", "the band balance needs the three numeric bands");
    bandBalance = { low: clamp01(source.low), mid: clamp01(source.mid), high: clamp01(source.high) };
  }
  let chromaProfile = new Array<number>(CHROMA_BINS).fill(0);
  if (value.chromaProfile !== undefined) {
    const source = value.chromaProfile;
    if (!Array.isArray(source) || source.length !== CHROMA_BINS)
      return fail("bad-chroma", `the chroma profile must hold ${CHROMA_BINS} bins`);
    chromaProfile = [];
    for (const bin of source) {
      if (!isFiniteNumber(bin)) return fail("bad-chroma", "the chroma bins must be numbers");
      chromaProfile.push(clamp01(bin));
    }
  }
  // the tolerant tail: the centroid and the loudness fold to their zero
  // shapes when broken — the same floor the miner's honest read keeps
  const centroid =
    Array.isArray(value.centroid) && value.centroid.length === SEGMENT_DIM && value.centroid.every(isFiniteNumber)
      ? value.centroid.map((seat) => clamp01(seat))
      : new Array<number>(SEGMENT_DIM).fill(0);
  const loudnessSource: Record<string, unknown> = isRecord(value.loudness) ? value.loudness : {};
  const loudness: ProfileLoudness = {
    target: tolerantOf(loudnessSource.target, PROFILE_LIMITS.lufsMin, PROFILE_LIMITS.lufsMax),
    min: tolerantOf(loudnessSource.min, PROFILE_LIMITS.lufsMin, PROFILE_LIMITS.lufsMax),
    max: tolerantOf(loudnessSource.max, PROFILE_LIMITS.lufsMin, PROFILE_LIMITS.lufsMax),
  };
  return {
    ok: true,
    doc: {
      schema: PROFILE_SCHEMA_VERSION,
      genre: value.genre,
      referenceIds,
      trainedOn,
      bpm,
      keyPool,
      onsetDensity,
      bandBalance,
      loudness,
      centroid,
      chromaProfile,
      updatedAt,
    },
  };
}

// ---------------------------------------------------------------------------
// the canonical serialization (the determinism law)
// ---------------------------------------------------------------------------

/** Builds the canonical profile object: the contract key order, every
 * number rounded to four decimals. */
function canonicalProfile(doc: GenreProfile): Record<string, unknown> {
  return {
    schema: PROFILE_SCHEMA_VERSION,
    genre: doc.genre,
    referenceIds: [...doc.referenceIds],
    trainedOn: doc.trainedOn,
    bpm: {
      min: round4(doc.bpm.min),
      median: round4(doc.bpm.median),
      max: round4(doc.bpm.max),
      histogram: doc.bpm.histogram.map((count) => Math.max(0, Math.round(count))),
    },
    keyPool: doc.keyPool.map((entry) => ({ name: entry.name, weight: round4(entry.weight) })),
    onsetDensity: doc.onsetDensity.map((bin) => round4(bin)),
    bandBalance: {
      low: round4(doc.bandBalance.low),
      mid: round4(doc.bandBalance.mid),
      high: round4(doc.bandBalance.high),
    },
    loudness: { target: round4(doc.loudness.target), min: round4(doc.loudness.min), max: round4(doc.loudness.max) },
    centroid: doc.centroid.map((seat) => round4(seat)),
    chromaProfile: doc.chromaProfile.map((bin) => round4(bin)),
    updatedAt: doc.updatedAt,
  };
}

/**
 * Serializes a genre profile to its canonical json: the validator runs
 * first (a broken profile throws ProfileError honestly), then the
 * canonical builder orders every key and rounds every number to four
 * decimals — the same profile always serializes to the same bytes,
 * whatever key order it arrived with.
 *
 * @param profile the genre profile.
 * @returns the canonical json string.
 * @throws ProfileError when the profile fails the contract.
 */
export function serializeProfile(profile: GenreProfile): string {
  const result = validateGenreProfile(profile);
  if (!result.ok) throw new ProfileError(result.code, result.message);
  return JSON.stringify(canonicalProfile(result.doc));
}

// ---------------------------------------------------------------------------
// the orchestrators (the miner and the rank — last, the family law)
// ---------------------------------------------------------------------------

/**
 * Mines one genre's references into the genre profile: the caller groups
 * the documents by genre (the grouping law) and hands one group with its
 * genre key; the miner reads the mix lane of every document — the mix
 * report (the bpm, the key, the loudness) and the mix segments (the
 * per-second vectors) — and answers the deterministic profile. the
 * documents sort by id into the canonical order first, so any permutation
 * of the same set answers the same bytes; every number rounds to four
 * decimals. the key pool blends the detector votes (one vote per
 * document, the mix report's key) with the tonic chroma mass (the corpus
 * pitch-class distribution) — the even mean of the two shares; the onset
 * curve normalizes the per-second means by the busiest second, then
 * resamples onto the sixteen bins over the longest reference's timeline.
 *
 * @param documents the references of one genre, each with its row id.
 * @param genre the genre key of the group (one of the fifteen).
 * @returns the genre profile (schema debonair.profile/1).
 * @throws ProfileError bad-genre on a key outside the fifteen, empty-set
 * on a group with no references (a genre with no references answers no
 * profile — the honest error, never a zero profile).
 */
export function mineGenre(documents: IngestDocumentWithId[], genre: string): GenreProfile {
  if (!PROFILE_GENRE_KEYS.includes(genre))
    throw new ProfileError("bad-genre", `the genre "${genre}" is not one of the fifteen the style dictionary owns`);
  if (documents.length === 0)
    throw new ProfileError(
      "empty-set",
      "the miner profiles a genre its references feed — an empty set answers no profile",
    );
  // the canonical order: the documents sort by id ascending — every
  // aggregate and the audit chain ride the same order, so any permutation
  // of the same set answers the same bytes
  const sorted = [...documents].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const referenceIds = sorted.map((doc) => doc.id);
  const segmentsAll = sorted.flatMap((doc) => (Array.isArray(doc.segments) ? doc.segments : []));
  // the bpm distribution: the scalars and the eight-bucket histogram
  const bpmValues = sorted.map((doc) => fin(doc.mix.rhythm.bpm));
  let bpmMin = bpmValues[0] ?? 0;
  let bpmMax = bpmValues[0] ?? 0;
  const bpmHistogram = new Array<number>(BPM_BUCKETS).fill(0);
  for (const bpm of bpmValues) {
    if (bpm < bpmMin) bpmMin = bpm;
    if (bpm > bpmMax) bpmMax = bpm;
    bpmHistogram[bpmBucketOf(bpm)] = (bpmHistogram[bpmBucketOf(bpm)] ?? 0) + 1;
  }
  const bpm: ProfileBpm = {
    min: round4(bpmMin),
    median: round4(medianOf(bpmValues)),
    max: round4(bpmMax),
    histogram: bpmHistogram,
  };
  // the chroma profile: the per-second pitch-class distributions averaged
  // (a silent second owns no tonal mass — it sits the mean out)
  const chromaSums = new Array<number>(CHROMA_BINS).fill(0);
  let chromaOwners = 0;
  for (const segment of segmentsAll) {
    const chroma = Array.isArray(segment.chroma) ? segment.chroma : [];
    const bins: number[] = [];
    let sum = 0;
    for (let pc = 0; pc < CHROMA_BINS; pc++) {
      const value = fin(chroma[pc] ?? 0);
      bins.push(value);
      sum += value;
    }
    if (sum <= 0) continue;
    chromaOwners++;
    for (let pc = 0; pc < CHROMA_BINS; pc++) chromaSums[pc] += (bins[pc] ?? 0) / sum;
  }
  const chromaProfile = new Array<number>(CHROMA_BINS).fill(0);
  if (chromaOwners > 0) {
    for (let pc = 0; pc < CHROMA_BINS; pc++) chromaProfile[pc] = round4((chromaSums[pc] ?? 0) / chromaOwners);
  }
  // the key pool: one vote per document (the mix report's key, the name
  // rebuilt through the theory kernel's spelling), the weight blending the
  // vote share with the tonic chroma mass — ranked weight descending,
  // ties by name ascending
  const votes = new Map<string, { tonic: number; count: number }>();
  for (const doc of sorted) {
    const tonic = ((Math.round(fin(doc.mix.key.tonic)) % 12) + 12) % 12;
    const mode = doc.mix.key.mode === "minor" ? "minor" : "major";
    const name = `${noteName(tonic)} ${mode}`;
    const standing = votes.get(name);
    votes.set(name, { tonic, count: (standing?.count ?? 0) + 1 });
  }
  const keyPool: KeyPoolEntry[] = [...votes.entries()]
    .map(([name, { tonic, count }]) => ({
      name,
      weight: round4((count / sorted.length + (chromaProfile[tonic] ?? 0)) / 2),
    }))
    .sort((a, b) => b.weight - a.weight || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  // the onset density curve: the per-second means, the busiest second
  // normalized to 1, the sixteen-bin resample over the longest timeline
  const onsetDensity = onsetCurveOf(sorted);
  // the band balance: the mean of the raw fractions over every second
  const bandBalance: ProfileBands = {
    low: meanRounded(segmentsAll.map((segment) => fin((Array.isArray(segment.bands) ? segment.bands : [])[0] ?? 0))),
    mid: meanRounded(segmentsAll.map((segment) => fin((Array.isArray(segment.bands) ? segment.bands : [])[1] ?? 0))),
    high: meanRounded(segmentsAll.map((segment) => fin((Array.isArray(segment.bands) ? segment.bands : [])[2] ?? 0))),
  };
  // the loudness targets: the median integrated lufs and the span
  const integrated = sorted.map((doc) => fin(doc.mix.loudness.integrated));
  let lufsMin = integrated[0] ?? 0;
  let lufsMax = integrated[0] ?? 0;
  for (const value of integrated) {
    if (value < lufsMin) lufsMin = value;
    if (value > lufsMax) lufsMax = value;
  }
  const loudness: ProfileLoudness = {
    target: round4(medianOf(integrated)),
    min: round4(lufsMin),
    max: round4(lufsMax),
  };
  // the centroid: the mean normalized segment vector over every second —
  // the cosine seat (the genre's center, the composer wave reads it)
  const vectors = segmentsAll.map(segmentVector);
  const centroid = new Array<number>(SEGMENT_DIM).fill(0);
  for (let seat = 0; seat < SEGMENT_DIM; seat++) {
    centroid[seat] = meanRounded(vectors.map((vector) => vector[seat] ?? 0));
  }
  // the audit stamp: the freshest ingestedAt of the references (the string
  // max — the instants ride their iso ordering, never a numeric coercion)
  let updatedAt = "";
  for (const doc of sorted) if (doc.ingestedAt > updatedAt) updatedAt = doc.ingestedAt;
  return {
    schema: PROFILE_SCHEMA_VERSION,
    genre,
    referenceIds,
    trainedOn: sorted.length,
    bpm,
    keyPool,
    onsetDensity,
    bandBalance,
    loudness,
    centroid,
    chromaProfile,
    updatedAt,
  };
}

/**
 * Ranks the references by their cosine similarity to the query: both
 * sides project onto the mean normalized segment vector (the same
 * normalization law the profile rides), the score rounds to four
 * decimals, ties break by id ascending — pure, deterministic, the same
 * call always answers the same order.
 *
 * @param query the document the prompt hands (a plain ingest document).
 * @param references the candidate references, each with its row id.
 * @returns the ranked hits, score descending then id ascending.
 */
export function similarityRank(query: IngestDocument, references: IngestDocumentWithId[]): SimilarityHit[] {
  const queryVector = documentVector(query);
  const hits: SimilarityHit[] = references.map((reference) => ({
    id: reference.id,
    score: round4(cosine(queryVector, documentVector(reference))),
  }));
  hits.sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return hits;
}
