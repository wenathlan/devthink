// # reconpayload — the reconstruction contract of the katexis engine (root
// layer, wave 16a): the debonair.recon/3 document, the frozen seat law of
// RECON-V3 (76 header seats, 66 layer seats per second, 4 correlations — 82
// distinct parameters, the shared 64 binding header and frame
// symmetrically). Every seat is one number; the only text rides the seven
// whitelist seats (schema, name, mimeType, encoding, timeSignature,
// instrumentName, instrumentFamily) and every string those seats accept
// comes from the bidirectional dictionaries (the 48 scales of the pattern
// vocabulary map 0..47, the twelve roots, the instruments, the families,
// the time signatures, the encodings, the mime types) — the payload never
// carries both sides of one fact. The validator hand-rolls the whole
// contract (zero dependencies, the family law): it clamps tolerantly where
// the contract allows (every normalized data-layer seat 0..1) and rejects
// hard with machine codes where the shape breaks (a string outside the
// whitelist, a key with an underscore or a hyphen, a duplicate key in the
// raw json, an unknown seat). The canonical serializer orders every key by
// the frozen seat lists and rounds every number to four decimals, so the
// same document always serializes to the same bytes. The law itself lives
// in docs/recon.spec.md (the lineage V1→V8, the anti-base64 strategies, the
// reconstruction ladder, the ban list); this file is the law in code.
// Non-goals: no audio, no measurement (the descriptor lane ingestrecon.ts
// fills the seats), no storage, no synthesis. Pure and multi-mode — the
// same call runs in the browser and in node.

import { NOTE_NAMES, PATTERN_SCALE_NAMES, PATTERN_VOICES } from "./patternenums.ts";

// ---------------------------------------------------------------------------
// the schema id, the canon rate and the pinned counts (the contract numbers)
// ---------------------------------------------------------------------------

/** The schema literal of the recon document (the only one this contract writes). */
export const RECON_SCHEMA_VERSION = "debonair.recon/3";

/** The analysis rate of the recon lane — the cd canon (docs/recon.spec.md §8;
 * the render master stays at the katexis MASTERING rate, the two never swap). */
export const RECON_SAMPLE_RATE = 44100;

/**
 * The pinned parameter counts of RECON-V3 — the numbers the test battery
 * freezes and the spec documents: 76 header seats, 66 layer seats per
 * second, 4 correlations, 82 distinct parameters (76 + 66 − 64 shared + 4)
 * out of a historical maximum of 170 unique metrics across the research
 * iterations.
 */
export const RECON_PARAM_COUNTS = {
  /** The header seats (the manifest plus the time aggregates). */
  header: 76,
  /** The layer seats every second carries. */
  frame: 66,
  /** The named correlations the document closes with. */
  correlations: 4,
  /** The distinct parameters across header, layer and correlations. */
  distinct: 82,
  /** The analytic keys header and frame share (the symmetric inheritance). */
  shared: 64,
  /** The historical maximum of unique metrics the research iterations saw. */
  historicalMax: 170,
} as const;

/** The maximum characters the free-text name seat carries. */
export const RECON_NAME_MAX = 120;

/** The maximum note triples one layer second may carry (the runaway cap). */
export const RECON_NOTES_MAX = 96;

// ---------------------------------------------------------------------------
// the bidirectional dictionaries (every string has its numeric twin here)
// ---------------------------------------------------------------------------

/** The scale dictionary: the forty-eight pattern scales, ids 0..47 — the
 * numeric twins of the payload's scaleType seats ("phrygian-dom" ↔ 27). */
export const RECON_SCALE_NAMES: readonly string[] = PATTERN_SCALE_NAMES;

/** The root dictionary: the twelve pitch-class names, ids 0..11. */
export const RECON_ROOT_NAMES: readonly string[] = NOTE_NAMES;

/** The instrument dictionary: the whole-mix seat plus the eight engine
 * voices (the pattern vocabulary), ids 0..8. */
export const RECON_INSTRUMENTS: readonly string[] = ["mix", ...PATTERN_VOICES];

/** The family dictionary: the eight instrument families, ids 0..7. */
export const RECON_FAMILIES: readonly string[] = [
  "bass",
  "guitar",
  "vocal",
  "keys",
  "lead",
  "drums",
  "percussion",
  "pad",
];

/** The tonal families — the monophonic voices the YIN note lane serves
 * (one honest f0; polyphonic layers get no notes). */
export const RECON_TONAL_FAMILIES: readonly string[] = ["bass", "guitar", "vocal"];

/** The time-signature dictionary: the eight meters, ids 0..7 (the caller
 * stamps the meter; the downbeat detector's period seat rides a future wave). */
export const RECON_TIME_SIGNATURES: readonly string[] = ["4/4", "3/4", "2/4", "6/8", "5/4", "7/8", "9/8", "12/8"];

/** The encoding dictionary: the three wav depths the writer owns, ids 0..2. */
export const RECON_ENCODINGS: readonly string[] = ["pcm16", "pcm24", "pcm32f"];

/** The mime dictionary: the mime the decode lane reads, id 0. */
export const RECON_MIME_TYPES: readonly string[] = ["audio/wav"];

/** The layer dictionary: the hpss stems — the layer detection the engine
 * already owns (harmonic id 0 is the tonal layer, percussive id 1 is not). */
export const RECON_LAYERS: readonly string[] = ["harmonic", "percussive"];

/** The id of the tonal layer (the only layer the midi notes lane serves). */
export const RECON_TONAL_LAYER_ID = 0;

/** The whitelist of text seats — the only keys whose value may be a string
 * (besides nothing else, anywhere, ever). */
export const RECON_TEXT_KEYS: readonly string[] = [
  "schema",
  "name",
  "mimeType",
  "encoding",
  "timeSignature",
  "instrumentName",
  "instrumentFamily",
] as const;

/**
 * The numeric id of a name inside a dictionary table; −1 when the name is
 * not in the vocabulary (the honest refuse — the caller surfaces the code).
 *
 * @param table the dictionary (one of the RECON_* name tables).
 * @param name the string to fold onto its seat.
 * @returns the id 0..table.length−1, or −1 outside the vocabulary.
 */
export function reconIdOf(table: readonly string[], name: string): number {
  const id = table.indexOf(name);
  return id;
}

/**
 * The name of a numeric id inside a dictionary table (the twin the payload
 * never carries — the dictionary answers it); "" when the id sits outside.
 *
 * @param table the dictionary (one of the RECON_* name tables).
 * @param id the numeric seat.
 * @returns the canonical name, or "" outside the table.
 */
export function reconNameOf(table: readonly string[], id: number): string {
  return Number.isInteger(id) && id >= 0 && id < table.length ? table[id] : "";
}

// ---------------------------------------------------------------------------
// the frozen seat lists (76 header · 66 layer · 4 correlations)
// ---------------------------------------------------------------------------

/**
 * The 76 header seats, frozen in canonical order — the manifest twelve plus
 * the 64 time aggregates the frames share. every seat is a measurement or a
 * decision the engine recomputes: the manifest carries what the source is,
 * the aggregates carry what the whole take measured (mean over the seconds
 * unless the seat's comment says otherwise).
 */
export const RECON_HEADER_KEYS: readonly string[] = [
  // — the manifest (12): what the document is and where it came from —
  "schema", // the contract literal "debonair.recon/3" — the signature every parser routes on
  "name", // the display name of the source — the only free text the whitelist allows
  "mimeType", // the mime of the analyzed bytes (dictionary) — the decode lane's own fact
  "encoding", // the sample encoding of the source (dictionary) — pcm16/24/32f, the writer's depths
  "timeSignature", // the meter the caller stamped (dictionary) — the downbeat period rides a future wave
  "instrumentName", // the voice seat of the document (dictionary) — "mix" for a reference recon
  "instrumentFamily", // the register-law family (dictionary) — bass/guitar/vocal by the tonal register
  "sampleRate", // the analysis rate — 44100, the cd canon the recon lane freezes
  "durationSeconds", // the length of the analyzed pcm — the frame count's other face
  "bpmMedian", // the median of the per-second bpm series — the honest tempo summary, never one global
  "mostUsedScaleId", // the statistical mode of the per-second scaleType seats — the prevailing scale
  "mostUsedKeyId", // the statistical mode of the per-second scaleRoot seats — the prevailing root
  // — the time-domain and spectral aggregates (mean over the seconds) —
  "rms", // the mean per-second rms — the loudness the whole take carried
  "peak", // the mean per-second peak — the level ceiling the seconds touched
  "zcr", // the mean zero-crossing rate — the brightness proxy the time domain answers
  "centroid", // the mean spectral centroid, hz — where the energy sits in frequency
  "flatness", // the mean spectral flatness — the tone-versus-noise balance
  "flux", // the mean normalized spectral flux — how fast the timbre moved
  "rolloff", // the mean rolloff sharpness (0..1) — where the spectrum closes
  "slope", // the mean spectral tilt — the dark-heavy or bright-heavy lean
  "warmth", // the mean low-mid power share (0..1) — the warm/dial of the timbre library
  "brightness", // the mean normalized centroid (0..1) — the palette dial the timbre library owns
  "beatStrength", // the mean per-second beat strength — how hard the pulses asserted
  "onsetCount", // the mean per-second onset count — the rhythmic density
  "bandLow", // the mean low-band fraction (under 250 hz) — the energy split, seat one
  "bandMid", // the mean mid-band fraction (250..2000 hz) — the energy split, seat two
  "bandHigh", // the mean high-band fraction (over 2000 hz) — the energy split, seat three
  // — the chroma aggregates (mean over the seconds, one seat per pitch class) —
  "chroma0", // the mean energy on c — the tonal mass, wheel seat 0
  "chroma1", // the mean energy on c# — wheel seat 1
  "chroma2", // the mean energy on d — wheel seat 2
  "chroma3", // the mean energy on d# — wheel seat 3
  "chroma4", // the mean energy on e — wheel seat 4
  "chroma5", // the mean energy on f — wheel seat 5
  "chroma6", // the mean energy on f# — wheel seat 6
  "chroma7", // the mean energy on g — wheel seat 7
  "chroma8", // the mean energy on g# — wheel seat 8
  "chroma9", // the mean energy on a — wheel seat 9
  "chroma10", // the mean energy on a# — wheel seat 10
  "chroma11", // the mean energy on b — wheel seat 11
  // — the mfcc aggregates (mean over the seconds, dct-ii coefficient seats) —
  "mfcc0", // the mean mel coefficient 0 — the overall spectral energy shape
  "mfcc1", // the mean mel coefficient 1 — the low-band balance
  "mfcc2", // the mean mel coefficient 2 — the mid-band contour, seat one
  "mfcc3", // the mean mel coefficient 3 — the mid-band contour, seat two
  "mfcc4", // the mean mel coefficient 4 — the mid-band contour, seat three
  "mfcc5", // the mean mel coefficient 5 — the upper-mid contour, seat one
  "mfcc6", // the mean mel coefficient 6 — the upper-mid contour, seat two
  "mfcc7", // the mean mel coefficient 7 — the upper-mid contour, seat three
  "mfcc8", // the mean mel coefficient 8 — the high-band contour, seat one
  "mfcc9", // the mean mel coefficient 9 — the high-band contour, seat two
  "mfcc10", // the mean mel coefficient 10 — the fine detail, seat one
  "mfcc11", // the mean mel coefficient 11 — the fine detail, seat two
  "mfcc12", // the mean mel coefficient 12 — the fine detail, seat three
  // — the 32-window envelope aggregates (mean over the seconds) —
  "envelopeMean", // the mean of the per-second 32-window rms mean — the macro dynamics level
  "envelopeStd", // the mean of the per-second envelope std — the inside-second movement
  "envelopeMin", // the mean of the per-second envelope minimum — the quietest window
  "envelopeMax", // the mean of the per-second envelope maximum — the loudest window
  "envelopeDynamic", // the mean of the per-second max−min spread — the inside-second dynamic range
  // — the tempo, tonality and identity aggregates —
  "bpm", // the mean of the per-second bpm series — beside the median seat, never one global
  "scaleRoot", // the opening sounding second's root — the establishing tonality (not the mode)
  "scaleType", // the opening sounding second's scale — the establishing mode (not the prevailing one)
  "pcmhash", // the fnv-1a identity of the whole analyzed pcm — the checksum lane's anchor
  "spectralPeaksHash", // the fnv-1a identity of the concatenated per-track peak streams
  "midiNotesHash", // the fnv-1a identity of the concatenated per-track note streams
  // — the top-5 spectral peak aggregates of the mix total (mean over seconds) —
  "peakHz0", // the mean hz of the strongest peak — the dominant partial
  "peakHz1", // the mean hz of the second peak — the next partial, seat one
  "peakHz2", // the mean hz of the third peak — the next partial, seat two
  "peakHz3", // the mean hz of the fourth peak — the next partial, seat three
  "peakHz4", // the mean hz of the fifth peak — the next partial, seat four
  "peakMag0", // the mean normalized magnitude of the strongest peak (0..1)
  "peakMag1", // the mean normalized magnitude of the second peak (0..1)
  "peakMag2", // the mean normalized magnitude of the third peak (0..1)
  "peakMag3", // the mean normalized magnitude of the fourth peak (0..1)
  "peakMag4", // the mean normalized magnitude of the fifth peak (0..1)
  // — the note aggregates of the tonal layers (mean over the seconds) —
  "noteCount", // the mean per-second note count — the melodic density
  "noteMidiMean", // the mean per-second mean midi — the register the melody kept
  "noteMidiRange", // the mean per-second midi spread — the melodic ambitus
];

/**
 * The 66 layer seats every second carries, frozen in canonical order — the
 * 64 shared keys (the header carries their time aggregate) plus the two
 * frame-only coordinates (s, active). every seat is the mix total of that
 * second (one total value); the per-track exceptions live in the layer lane.
 */
export const RECON_FRAME_KEYS: readonly string[] = [
  // — the frame-only seats (2): the coordinates —
  "s", // the second index — the frame's position on the timeline
  "active", // the sounding decision — 1 when the second clears the silence floor, else 0
  // — the time-domain and spectral measurements of the second —
  "rms", // the rms of the second — the loudness seat
  "peak", // the absolute peak of the second — the level ceiling
  "zcr", // the zero-crossing rate of the second — the brightness proxy
  "centroid", // the spectral centroid of the second, hz — the energy's frequency seat
  "flatness", // the spectral flatness of the second (0..1) — tone versus noise
  "flux", // the normalized spectral flux into this second (0..1) — the timbre movement
  "rolloff", // the rolloff sharpness of the second (0..1) — where the spectrum closes
  "slope", // the spectral tilt of the second — the dark/bright lean
  "warmth", // the low-mid power share of the second (0..1) — the warmth dial
  "brightness", // the normalized centroid of the second (0..1) — the brightness dial
  "beatStrength", // the strongest envelope rise inside the second (0..1) — the local pulse
  "onsetCount", // the onset count inside the second — the rhythmic density
  "bandLow", // the low-band fraction of the second (under 250 hz, 0..1)
  "bandMid", // the mid-band fraction of the second (250..2000 hz, 0..1)
  "bandHigh", // the high-band fraction of the second (over 2000 hz, 0..1)
  // — the chroma of the second (one seat per pitch class, normalized 0..1) —
  "chroma0", // the energy on c — the tonal wheel seat 0
  "chroma1", // the energy on c# — wheel seat 1
  "chroma2", // the energy on d — wheel seat 2
  "chroma3", // the energy on d# — wheel seat 3
  "chroma4", // the energy on e — wheel seat 4
  "chroma5", // the energy on f — wheel seat 5
  "chroma6", // the energy on f# — wheel seat 6
  "chroma7", // the energy on g — wheel seat 7
  "chroma8", // the energy on g# — wheel seat 8
  "chroma9", // the energy on a — wheel seat 9
  "chroma10", // the energy on a# — wheel seat 10
  "chroma11", // the energy on b — wheel seat 11
  // — the mfcc of the second (dct-ii over the mel bands, 13 coefficient seats) —
  "mfcc0", // mel coefficient 0 — the overall spectral shape
  "mfcc1", // mel coefficient 1 — the low-band balance
  "mfcc2", // mel coefficient 2 — the mid contour, seat one
  "mfcc3", // mel coefficient 3 — the mid contour, seat two
  "mfcc4", // mel coefficient 4 — the mid contour, seat three
  "mfcc5", // mel coefficient 5 — the upper-mid contour, seat one
  "mfcc6", // mel coefficient 6 — the upper-mid contour, seat two
  "mfcc7", // mel coefficient 7 — the upper-mid contour, seat three
  "mfcc8", // mel coefficient 8 — the high contour, seat one
  "mfcc9", // mel coefficient 9 — the high contour, seat two
  "mfcc10", // mel coefficient 10 — the fine detail, seat one
  "mfcc11", // mel coefficient 11 — the fine detail, seat two
  "mfcc12", // mel coefficient 12 — the fine detail, seat three
  // — the 32-window rms envelope of the second, as its statistics —
  "envelopeMean", // the mean of the 32 window rms values (0..1)
  "envelopeStd", // the standard deviation of the 32 windows (0..1)
  "envelopeMin", // the minimum window rms (0..1)
  "envelopeMax", // the maximum window rms (0..1)
  "envelopeDynamic", // the max−min spread of the 32 windows (0..1)
  // — the tempo, tonality and identity of the second —
  "bpm", // the sliding-window tempo estimate covering this second — never one global
  "scaleRoot", // the krumhansl root of the second (0..11) — the dictionary twin answers the name
  "scaleType", // the best 48-scale fit at that root (0..47) — the dictionary twin answers the name
  "pcmhash", // the fnv-1a identity of this second's pcm — the per-second checksum anchor
  "spectralPeaksHash", // the fnv-1a identity of this second's per-track peak streams
  "midiNotesHash", // the fnv-1a identity of this second's per-track note streams
  // — the top-5 spectral peaks of the mix total (hz seats, then normalized magnitudes) —
  "peakHz0", // the hz of the strongest peak — the dominant partial
  "peakHz1", // the hz of the second peak
  "peakHz2", // the hz of the third peak
  "peakHz3", // the hz of the fourth peak
  "peakHz4", // the hz of the fifth peak
  "peakMag0", // the normalized magnitude of the strongest peak (0..1)
  "peakMag1", // the normalized magnitude of the second peak (0..1)
  "peakMag2", // the normalized magnitude of the third peak (0..1)
  "peakMag3", // the normalized magnitude of the fourth peak (0..1)
  "peakMag4", // the normalized magnitude of the fifth peak (0..1)
  // — the note lane of the tonal layers, as its statistics —
  "noteCount", // the note count of the second (the tonal layers' yin notes)
  "noteMidiMean", // the mean midi of the second's notes (0 when none)
  "noteMidiRange", // the midi spread of the second's notes (0 when under two)
];

/**
 * The four named correlations the document closes with — the whole-track
 * relations the frames' series answer (docs/recon.spec.md §10).
 */
export const RECON_CORRELATION_KEYS: readonly string[] = [
  "tempoFluctuationIndex", // the relative drift of the per-second bpm series (std/mean, 0..1)
  "spectralTransitionConfidence", // the mean per-second flux over the series max — the transition assertion
  "harmonicDistortionStateHash", // the fnv-1a identity of the per-second distortion trajectory
  "pitchTrajectorySlope", // the least-squares slope of the per-second mean midi (semitones/second)
];

/** The seats of the layer lane (the per-track exception inside every frame). */
export const RECON_LAYER_KEYS: readonly string[] = ["layerId", "spectralPeaks", "midiNotes"];

/**
 * The normalized frame seats — the data-layer parameters the validator
 * clamps into 0..1 (the clamp law of docs/recon.spec.md §4). every other
 * frame seat is a raw physical quantity (hz, midi, counts, ids, hashes) and
 * only needs to be finite.
 */
export const RECON_NORMALIZED_FRAME_KEYS: readonly string[] = [
  "active",
  "rms",
  "peak",
  "zcr",
  "flatness",
  "flux",
  "rolloff",
  "warmth",
  "brightness",
  "beatStrength",
  "bandLow",
  "bandMid",
  "bandHigh",
  "chroma0",
  "chroma1",
  "chroma2",
  "chroma3",
  "chroma4",
  "chroma5",
  "chroma6",
  "chroma7",
  "chroma8",
  "chroma9",
  "chroma10",
  "chroma11",
  "envelopeMean",
  "envelopeStd",
  "envelopeMin",
  "envelopeMax",
  "envelopeDynamic",
  "peakMag0",
  "peakMag1",
  "peakMag2",
  "peakMag3",
  "peakMag4",
];

// ---------------------------------------------------------------------------
// the payload documents (the typed contracts the seats build)
// ---------------------------------------------------------------------------

/** One layer inside a second — the per-track exception lane: the spectral
 * peak stream and the midi notes live here (per track), everything else in
 * the frame is the single mix total. */
export interface ReconLayerFrame {
  /** The track the layer names (the dictionary id: 0 harmonic, 1 percussive). */
  layerId: number;
  /** The top-5 spectral peaks of the layer's second, interleaved
   * [hz0, mag0, hz1, mag1, …] — at most ten numbers, magnitudes 0..1. */
  spectralPeaks: number[];
  /** The yin notes of the layer's second, interleaved [midi, onset, vel, …]
   * — the tonal layers only, at most RECON_NOTES_MAX triples. */
  midiNotes: number[];
}

/** One second of the recon document — the main node: the 66 layer seats of
 * the mix total plus the per-track layer lane. */
export interface ReconFrame {
  /** The second index, 0-based (the frame-only coordinate). */
  s: number;
  /** The sounding decision: 1 when the second cleared the silence floor. */
  active: number;
  /** The rms of the second, 0..1. */
  rms: number;
  /** The absolute peak of the second, 0..1. */
  peak: number;
  /** The zero-crossing rate of the second, 0..1. */
  zcr: number;
  /** The spectral centroid of the second, hz. */
  centroid: number;
  /** The spectral flatness of the second, 0..1. */
  flatness: number;
  /** The normalized spectral flux into the second, 0..1. */
  flux: number;
  /** The rolloff sharpness of the second, 0..1. */
  rolloff: number;
  /** The spectral tilt of the second. */
  slope: number;
  /** The low-mid power share of the second, 0..1. */
  warmth: number;
  /** The normalized centroid of the second, 0..1. */
  brightness: number;
  /** The strongest envelope rise inside the second, 0..1. */
  beatStrength: number;
  /** The onset count inside the second. */
  onsetCount: number;
  /** The low-band fraction (under 250 hz), 0..1. */
  bandLow: number;
  /** The mid-band fraction (250..2000 hz), 0..1. */
  bandMid: number;
  /** The high-band fraction (over 2000 hz), 0..1. */
  bandHigh: number;
  /** The normalized chroma of the second, twelve seats (c..b), each 0..1. */
  chroma0: number;
  chroma1: number;
  chroma2: number;
  chroma3: number;
  chroma4: number;
  chroma5: number;
  chroma6: number;
  chroma7: number;
  chroma8: number;
  chroma9: number;
  chroma10: number;
  chroma11: number;
  /** The mel-frequency cepstrum of the second, thirteen dct-ii seats. */
  mfcc0: number;
  mfcc1: number;
  mfcc2: number;
  mfcc3: number;
  mfcc4: number;
  mfcc5: number;
  mfcc6: number;
  mfcc7: number;
  mfcc8: number;
  mfcc9: number;
  mfcc10: number;
  mfcc11: number;
  mfcc12: number;
  /** The mean of the second's 32 rms windows, 0..1. */
  envelopeMean: number;
  /** The std of the second's 32 rms windows, 0..1. */
  envelopeStd: number;
  /** The minimum of the second's 32 rms windows, 0..1. */
  envelopeMin: number;
  /** The maximum of the second's 32 rms windows, 0..1. */
  envelopeMax: number;
  /** The max−min spread of the second's 32 rms windows, 0..1. */
  envelopeDynamic: number;
  /** The sliding-window tempo covering the second. */
  bpm: number;
  /** The krumhansl root of the second, 0..11. */
  scaleRoot: number;
  /** The best 48-scale fit at that root, 0..47. */
  scaleType: number;
  /** The fnv-1a identity of the second's pcm. */
  pcmhash: number;
  /** The fnv-1a identity of the second's per-track peak streams. */
  spectralPeaksHash: number;
  /** The fnv-1a identity of the second's per-track note streams. */
  midiNotesHash: number;
  /** The hz of the mix total's five strongest spectral peaks, strongest first. */
  peakHz0: number;
  peakHz1: number;
  peakHz2: number;
  peakHz3: number;
  peakHz4: number;
  /** The normalized magnitudes of those five peaks, 0..1, strongest first. */
  peakMag0: number;
  peakMag1: number;
  peakMag2: number;
  peakMag3: number;
  peakMag4: number;
  /** The note count of the second's tonal layers. */
  noteCount: number;
  /** The mean midi of the second's notes (0 when none). */
  noteMidiMean: number;
  /** The midi spread of the second's notes (0 when under two). */
  noteMidiRange: number;
  /** The per-track layer lane of the second (the exception track data). */
  layers: ReconLayerFrame[];
}

/** The header of the recon document — the manifest twelve plus the 64 time
 * aggregates of the frames (the symmetric inheritance: the same analytic
 * keys the frames carry, aggregated over the seconds). */
export interface ReconHeader {
  /** The contract literal ("debonair.recon/3"). */
  schema: string;
  /** The display name of the source (the only free text). */
  name: string;
  /** The mime of the analyzed bytes (the dictionary twin answers the id). */
  mimeType: string;
  /** The sample encoding of the source (dictionary). */
  encoding: string;
  /** The meter the caller stamped (dictionary). */
  timeSignature: string;
  /** The voice seat of the document (dictionary). */
  instrumentName: string;
  /** The register-law family (dictionary). */
  instrumentFamily: string;
  /** The analysis rate — 44100, the cd canon. */
  sampleRate: number;
  /** The length of the analyzed pcm, seconds. */
  durationSeconds: number;
  /** The median of the per-second bpm series. */
  bpmMedian: number;
  /** The mode of the per-second scaleType seats, 0..47. */
  mostUsedScaleId: number;
  /** The mode of the per-second scaleRoot seats, 0..11. */
  mostUsedKeyId: number;
  /** The mean per-second rms, 0..1. */
  rms: number;
  /** The mean per-second peak, 0..1. */
  peak: number;
  /** The mean per-second zero-crossing rate, 0..1. */
  zcr: number;
  /** The mean spectral centroid, hz. */
  centroid: number;
  /** The mean spectral flatness, 0..1. */
  flatness: number;
  /** The mean normalized flux, 0..1. */
  flux: number;
  /** The mean rolloff sharpness, 0..1. */
  rolloff: number;
  /** The mean spectral tilt. */
  slope: number;
  /** The mean low-mid share, 0..1. */
  warmth: number;
  /** The mean normalized centroid, 0..1. */
  brightness: number;
  /** The mean per-second beat strength, 0..1. */
  beatStrength: number;
  /** The mean per-second onset count. */
  onsetCount: number;
  /** The mean low-band fraction, 0..1. */
  bandLow: number;
  /** The mean mid-band fraction, 0..1. */
  bandMid: number;
  /** The mean high-band fraction, 0..1. */
  bandHigh: number;
  /** The mean chroma of the whole take, twelve seats (c..b), each 0..1. */
  chroma0: number;
  chroma1: number;
  chroma2: number;
  chroma3: number;
  chroma4: number;
  chroma5: number;
  chroma6: number;
  chroma7: number;
  chroma8: number;
  chroma9: number;
  chroma10: number;
  chroma11: number;
  /** The mean mfcc of the whole take, thirteen dct-ii seats. */
  mfcc0: number;
  mfcc1: number;
  mfcc2: number;
  mfcc3: number;
  mfcc4: number;
  mfcc5: number;
  mfcc6: number;
  mfcc7: number;
  mfcc8: number;
  mfcc9: number;
  mfcc10: number;
  mfcc11: number;
  mfcc12: number;
  /** The mean of the per-second envelope means, 0..1. */
  envelopeMean: number;
  /** The mean of the per-second envelope stds, 0..1. */
  envelopeStd: number;
  /** The mean of the per-second envelope minima, 0..1. */
  envelopeMin: number;
  /** The mean of the per-second envelope maxima, 0..1. */
  envelopeMax: number;
  /** The mean of the per-second envelope spreads, 0..1. */
  envelopeDynamic: number;
  /** The mean of the per-second bpm series. */
  bpm: number;
  /** The opening sounding second's root, 0..11 (the establishing tonality). */
  scaleRoot: number;
  /** The opening sounding second's scale, 0..47 (the establishing mode). */
  scaleType: number;
  /** The fnv-1a identity of the whole analyzed pcm. */
  pcmhash: number;
  /** The fnv-1a identity of the concatenated per-track peak streams. */
  spectralPeaksHash: number;
  /** The fnv-1a identity of the concatenated per-track note streams. */
  midiNotesHash: number;
  /** The mean hz of the mix total's five strongest peaks. */
  peakHz0: number;
  peakHz1: number;
  peakHz2: number;
  peakHz3: number;
  peakHz4: number;
  /** The mean normalized magnitude of those five peaks, 0..1. */
  peakMag0: number;
  peakMag1: number;
  peakMag2: number;
  peakMag3: number;
  peakMag4: number;
  /** The mean per-second note count. */
  noteCount: number;
  /** The mean per-second mean midi. */
  noteMidiMean: number;
  /** The mean per-second midi spread. */
  noteMidiRange: number;
}

/** The four named correlations — the whole-track relations (§10 of the spec). */
export interface ReconCorrelations {
  /** The relative drift of the per-second bpm series (std/mean, 0..1). */
  tempoFluctuationIndex: number;
  /** The mean per-second flux over the series max (0..1). */
  spectralTransitionConfidence: number;
  /** The fnv-1a identity of the per-second distortion trajectory. */
  harmonicDistortionStateHash: number;
  /** The least-squares slope of the per-second mean midi (semitones/second). */
  pitchTrajectorySlope: number;
}

/** The reconstruction document — the canonical analysis format of the
 * engine: the header, one frame per whole second, the four correlations. */
export interface ReconDocument {
  /** The manifest and the time aggregates (76 seats). */
  header: ReconHeader;
  /** The per-second nodes (the main node of the document). */
  frames: ReconFrame[];
  /** The whole-track correlations (4 seats). */
  correlations: ReconCorrelations;
}

// ---------------------------------------------------------------------------
// the typed failure (machine codes the caller surfaces)
// ---------------------------------------------------------------------------

/** The machine readable failure codes of the recon validator. */
export const RECON_ERROR_CODES = [
  "bad-schema",
  "duplicate-key",
  "bad-key-name",
  "bad-key",
  "bad-text",
  "bad-dictionary",
  "bad-number",
  "bad-header",
  "bad-frame",
  "bad-correlation",
  "bad-layer",
] as const;

/** The typed recon failure code. */
export type ReconErrorCode = (typeof RECON_ERROR_CODES)[number];

/** The typed recon failure, traceable to its machine code. */
export class ReconError extends Error {
  /** Machine readable failure code. */
  readonly code: ReconErrorCode;

  constructor(code: ReconErrorCode, message?: string) {
    super(message ?? `recon ${code}`);
    this.name = "ReconError";
    this.code = code;
  }
}

/** The ok arm: the validated and clamped document. */
export interface ReconOk {
  ok: true;
  doc: ReconDocument;
}

/** The err arm: the machine code and the honest message. */
export interface ReconErr {
  ok: false;
  code: ReconErrorCode;
  message: string;
}

/** The typed result every recon call answers with (errors by return). */
export type ReconResult = ReconOk | ReconErr;

// ---------------------------------------------------------------------------
// the canonical hash and the seed law (the determinism rail)
// ---------------------------------------------------------------------------

/**
 * The fnv-1a 32-bit hash of a number list — the identity the stream seats
 * (spectralPeaksHash, midiNotesHash, harmonicDistortionStateHash) ride. The
 * canonical numbers fold in their ieee-754 double bits, low byte first, so
 * the same rounded numbers always answer the same hash, whatever the
 * platform. Identifies, never alleges reproduction (the anti-fake law).
 *
 * @param values the canonical (four-decimal) numbers to identify.
 * @returns the uint32 fnv-1a digest.
 */
export function fnv1aNumbers(values: readonly number[]): number {
  const view = new DataView(new ArrayBuffer(8));
  let hash = 0x811c9dc5;
  for (const value of values) {
    view.setFloat64(0, Number.isFinite(value) ? value : 0, true);
    for (let byte = 0; byte < 8; byte++) {
      hash ^= view.getUint8(byte);
      hash = Math.imul(hash, 0x01000193);
    }
  }
  return hash >>> 0;
}

// ---------------------------------------------------------------------------
// the pure helpers (the vocabulary and shape laws)
// ---------------------------------------------------------------------------

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
function fail(code: ReconErrorCode, message: string): ReconErr {
  return { ok: false, code, message };
}

/** The camelCase seat law: lowercase start, letters and digits only — no
 * underscore, no hyphen, no upper start, and never a "Total" suffix. */
const KEY_LAW = /^[a-z][a-zA-Z0-9]*$/;

/**
 * Reads the text seats of a block: the whitelisted keys must hold strings
 * inside their dictionaries (the free name excepted — its shape answers
 * bad-text); a dictionary miss answers its own machine code.
 *
 * @param block the parsed header record.
 * @param dictionaries the five dictionary-bound seats with their tables.
 * @returns the five seated strings or the machine code.
 */
function textSeatsOf(
  block: Record<string, unknown>,
  dictionaries: Record<string, readonly string[]>,
): { ok: true; seats: Record<string, string> } | ReconErr {
  const seats: Record<string, string> = {};
  for (const [key, table] of Object.entries(dictionaries)) {
    const value = block[key];
    if (typeof value !== "string" || !table.includes(value)) {
      return {
        ok: false,
        code: "bad-dictionary",
        message: `the ${key} must be one of ${table.join(", ")}`,
      };
    }
    seats[key] = value;
  }
  const name = block.name;
  if (typeof name !== "string" || name.length < 1 || name.length > RECON_NAME_MAX || /[\u0000-\u001f]/.test(name)) {
    return {
      ok: false,
      code: "bad-text",
      message: `the name must be 1..${RECON_NAME_MAX} printable characters`,
    };
  }
  seats.name = name;
  return { ok: true, seats };
}

/**
 * Audits the keys of a block against the key law and the frozen seat list:
 * a key with an underscore, a hyphen, an upper start or a Total suffix
 * answers bad-key-name; a well-named key outside the frozen list answers
 * bad-key; a missing frozen seat answers bad-key too (the seats are exact).
 *
 * @param block the parsed record.
 * @param seats the frozen seat list the block must match exactly.
 * @param label the block's name for the honest message.
 * @param extra the optional exception lane key allowed beside the seats.
 */
function auditKeys(
  block: Record<string, unknown>,
  seats: readonly string[],
  label: string,
  extra?: string,
): ReconErr | null {
  const allowed = extra === undefined ? seats : [...seats, extra];
  for (const key of Object.keys(block)) {
    if (!KEY_LAW.test(key) || key.endsWith("Total")) {
      return fail(
        "bad-key-name",
        `the ${label} key "${key}" violates the camelCase seat law (no underscore, no hyphen, no Total suffix)`,
      );
    }
    if (!allowed.includes(key)) {
      return fail("bad-key", `the ${label} key "${key}" is not one of the frozen ${seats.length} seats`);
    }
  }
  for (const seat of allowed) {
    if (!(seat in block)) {
      return fail("bad-key", `the ${label} is missing the frozen seat "${seat}"`);
    }
  }
  return null;
}

/**
 * Reads the numeric seats of a block: every seat must hold a finite number;
 * the normalized seats clamp into 0..1 (the tolerant clamp law); the enum
 * seats (integer id ranges) reject their bounds honestly.
 *
 * @param block the parsed record.
 * @param seats the numeric seat list.
 * @param normalized the seats clamped 0..1.
 * @param label the block's name for the honest message.
 * @returns the seated numbers or the machine code.
 */
function numericSeatsOf(
  block: Record<string, unknown>,
  seats: readonly string[],
  normalized: readonly string[],
  label: string,
): { ok: true; seats: Record<string, number> } | ReconErr {
  const out: Record<string, number> = {};
  for (const seat of seats) {
    const value = block[seat];
    if (typeof value === "string") {
      return fail("bad-text", `the ${label} seat "${seat}" is text — only the whitelist carries text`);
    }
    if (!isFiniteNumber(value)) {
      return fail("bad-number", `the ${label} seat "${seat}" must be a finite number`);
    }
    out[seat] = normalized.includes(seat) ? clamp(value, 0, 1) : value;
  }
  return { ok: true, seats: out };
}

// ---------------------------------------------------------------------------
// the validators (hand-rolled, zero dependencies — the family law)
// ---------------------------------------------------------------------------

/**
 * Validates one layer of a frame: the layer dictionary id, the peak pairs
 * and the note triples — notes only on the tonal layer (the yin lane's
 * honest limit), magnitudes and velocities clamped 0..1.
 *
 * @param value the parsed layer record.
 * @returns the clamped layer or the machine code.
 */
function layerOf(value: unknown): { ok: true; layer: ReconLayerFrame } | ReconErr {
  if (!isRecord(value)) return fail("bad-layer", "a frame layer is not an object");
  const audit = auditKeys(value, RECON_LAYER_KEYS, "layer");
  if (audit !== null) return audit;
  const layerId = value.layerId;
  if (!isFiniteNumber(layerId) || !Number.isInteger(layerId) || layerId < 0 || layerId >= RECON_LAYERS.length) {
    return fail("bad-layer", `the layerId must be an integer 0..${RECON_LAYERS.length - 1}`);
  }
  const peaks = value.spectralPeaks;
  if (!Array.isArray(peaks) || peaks.length > 10 || peaks.length % 2 !== 0) {
    return fail("bad-layer", "the spectralPeaks must hold at most ten numbers in hz/mag pairs");
  }
  const seatedPeaks: number[] = [];
  for (const [index, entry] of peaks.entries()) {
    if (!isFiniteNumber(entry)) return fail("bad-layer", `the spectral peak at ${index} is not a number`);
    seatedPeaks.push(index % 2 === 1 ? clamp(entry, 0, 1) : entry);
  }
  const notes = value.midiNotes;
  if (!Array.isArray(notes) || notes.length > RECON_NOTES_MAX * 3 || notes.length % 3 !== 0) {
    return fail("bad-layer", `the midiNotes must hold at most ${RECON_NOTES_MAX} midi/onset/vel triples`);
  }
  if (notes.length > 0 && layerId !== RECON_TONAL_LAYER_ID) {
    return fail("bad-layer", `the ${RECON_LAYERS[layerId]} layer is not tonal — only ${RECON_LAYERS[RECON_TONAL_LAYER_ID]} carries notes`);
  }
  const seatedNotes: number[] = [];
  for (let triple = 0; triple < notes.length; triple += 3) {
    const midi = notes[triple];
    const onset = notes[triple + 1];
    const vel = notes[triple + 2];
    if (!isFiniteNumber(midi) || !isFiniteNumber(onset) || !isFiniteNumber(vel)) {
      return fail("bad-layer", `the note at ${triple / 3} is not three numbers`);
    }
    seatedNotes.push(clamp(midi, 0, 127), clamp(onset, 0, 1), clamp(vel, 0, 1));
  }
  return { ok: true, layer: { layerId, spectralPeaks: seatedPeaks, midiNotes: seatedNotes } };
}

/**
 * Validates a debonair.recon/3 payload. the shape must hold exactly (the 76
 * header seats, the 66 frame seats plus the layer lane, the 4 correlations);
 * the whitelisted text seats must sit inside their dictionaries; the
 * normalized seats clamp 0..1; the enum id seats reject outside their
 * ranges; the layer lane answers its own codes. Broken shapes answer their
 * machine codes honestly — nothing is silently dropped.
 *
 * @param value the parsed json payload (unknown by design).
 * @returns the clamped document or the machine code.
 */
export function validateRecon(value: unknown): ReconResult {
  if (!isRecord(value)) return fail("bad-schema", "the recon payload is not an object");
  const header = value.header;
  if (!isRecord(header)) return fail("bad-header", "the recon payload needs a header object");
  if (header.schema !== RECON_SCHEMA_VERSION) {
    return fail("bad-schema", `the header schema must be "${RECON_SCHEMA_VERSION}"`);
  }
  const headerAudit = auditKeys(header, RECON_HEADER_KEYS, "header");
  if (headerAudit !== null) return headerAudit;
  for (const key of RECON_TEXT_KEYS) {
    if (typeof header[key] !== "string") {
      return fail("bad-text", `the header seat "${key}" must be text (the whitelist)`);
    }
  }
  const text = textSeatsOf(header, {
    mimeType: RECON_MIME_TYPES,
    encoding: RECON_ENCODINGS,
    timeSignature: RECON_TIME_SIGNATURES,
    instrumentName: RECON_INSTRUMENTS,
    instrumentFamily: RECON_FAMILIES,
  });
  if (!text.ok) return text;
  const headerNumericSeats = RECON_HEADER_KEYS.filter((key) => !RECON_TEXT_KEYS.includes(key));
  const headerNormalizedSeats = headerNumericSeats.filter((seat) => RECON_NORMALIZED_FRAME_KEYS.includes(seat));
  const numbers = numericSeatsOf(header, headerNumericSeats, headerNormalizedSeats, "header");
  if (!numbers.ok) return numbers;
  for (const [seat, id] of [
    ["mostUsedScaleId", RECON_SCALE_NAMES.length - 1],
    ["mostUsedKeyId", RECON_ROOT_NAMES.length - 1],
    ["scaleRoot", RECON_ROOT_NAMES.length - 1],
    ["scaleType", RECON_SCALE_NAMES.length - 1],
  ] as const) {
    const value2 = numbers.seats[seat];
    if (!Number.isInteger(value2) || value2 < 0 || value2 > id) {
      return fail("bad-number", `the header seat "${seat}" must be an integer 0..${id}`);
    }
  }
  const seatedHeader = {
    schema: RECON_SCHEMA_VERSION,
    ...text.seats,
    ...numbers.seats,
  } as unknown as ReconHeader;
  if (!Array.isArray(value.frames)) return fail("bad-frame", "the recon payload needs a frames array");
  const frames: ReconFrame[] = [];
  for (const [index, entry] of value.frames.entries()) {
    if (!isRecord(entry)) return fail("bad-frame", `the frame at ${index} is not an object`);
    const frameAudit = auditKeys(entry, RECON_FRAME_KEYS, `frame ${index}`, "layers");
    if (frameAudit !== null) return frameAudit;
    const frameNumbers = numericSeatsOf(entry, RECON_FRAME_KEYS, RECON_NORMALIZED_FRAME_KEYS, `frame ${index}`);
    if (!frameNumbers.ok) return frameNumbers;
    const s = frameNumbers.seats.s;
    if (!Number.isInteger(s) || s !== index) {
      return fail("bad-frame", `the frame at ${index} must seat its own second (s ${index})`);
    }
    for (const [seat, bound] of [
      ["scaleRoot", RECON_ROOT_NAMES.length - 1],
      ["scaleType", RECON_SCALE_NAMES.length - 1],
    ] as const) {
      const seated = frameNumbers.seats[seat];
      if (!Number.isInteger(seated) || seated < 0 || seated > bound) {
        return fail("bad-number", `the frame ${index} seat "${seat}" must be an integer 0..${bound}`);
      }
    }
    if (!Array.isArray(entry.layers)) return fail("bad-layer", `the frame at ${index} needs its layers lane`);
    const layers: ReconLayerFrame[] = [];
    let lastLayerId = -1;
    for (const layerEntry of entry.layers) {
      const layer = layerOf(layerEntry);
      if (!layer.ok) return layer;
      if (layer.layer.layerId <= lastLayerId) {
        return fail("bad-layer", `the layers of frame ${index} must ascend by layerId without repeats`);
      }
      lastLayerId = layer.layer.layerId;
      layers.push(layer.layer);
    }
    frames.push({ ...frameNumbers.seats, layers } as unknown as ReconFrame);
  }
  const correlations = value.correlations;
  if (!isRecord(correlations)) return fail("bad-correlation", "the recon payload needs a correlations object");
  const correlationAudit = auditKeys(correlations, RECON_CORRELATION_KEYS, "correlations");
  if (correlationAudit !== null) return correlationAudit;
  const correlationNumbers = numericSeatsOf(
    correlations,
    RECON_CORRELATION_KEYS,
    ["tempoFluctuationIndex", "spectralTransitionConfidence"],
    "correlations",
  );
  if (!correlationNumbers.ok) return correlationNumbers;
  const distortion = correlationNumbers.seats.harmonicDistortionStateHash;
  if (!Number.isInteger(distortion) || distortion < 0 || distortion > 0xffffffff) {
    return fail("bad-number", "the harmonicDistortionStateHash must be a uint32");
  }
  return {
    ok: true,
    doc: {
      header: seatedHeader,
      frames,
      correlations: correlationNumbers.seats as unknown as ReconCorrelations,
    },
  };
}

// ---------------------------------------------------------------------------
// the duplicate-key scanner (the raw json law)
// ---------------------------------------------------------------------------

/**
 * Scans raw json for duplicate keys — JSON.parse silently keeps the last of
 * a repeated key, so the parser walks the text itself: inside every object,
 * a key token seen twice answers true (the payload is refused before it
 * parses into a lie). Strings are gulped whole with their escapes honored,
 * and a string token only counts as a key when a colon follows it.
 *
 * @param json the raw serialized payload.
 * @returns true when some object carries a duplicate key.
 */
export function reconHasDuplicateKeys(json: string): boolean {
  const stacks: Set<string>[] = [];
  let index = 0;
  let pendingKey: string | null = null;
  while (index < json.length) {
    const char = json[index];
    if (char === '"') {
      const start = index + 1;
      let end = start;
      let escaped = false;
      while (end < json.length) {
        const c = json[end];
        if (escaped) escaped = false;
        else if (c === "\\") escaped = true;
        else if (c === '"') break;
        end++;
      }
      const token = json.slice(start, end);
      // a string followed (past whitespace) by a colon is a key token
      let peek = end + 1;
      while (peek < json.length && /\s/.test(json[peek])) peek++;
      pendingKey = json[peek] === ":" ? token : null;
      index = end + 1;
      continue;
    }
    if (char === "{") {
      stacks.push(new Set());
      index++;
      continue;
    }
    if (char === "}") {
      stacks.pop();
      pendingKey = null;
      index++;
      continue;
    }
    if (char === ":" && pendingKey !== null && stacks.length > 0) {
      const seen = stacks[stacks.length - 1];
      if (seen.has(pendingKey)) return true;
      seen.add(pendingKey);
      pendingKey = null;
      index++;
      continue;
    }
    if (char === "," || char === "[") pendingKey = null;
    index++;
  }
  return false;
}

// ---------------------------------------------------------------------------
// the canonical round trip (the determinism law)
// ---------------------------------------------------------------------------

/** Builds the canonical header record: the frozen seat order, every number
 * rounded to four decimals. */
function canonicalHeader(header: ReconHeader): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const seat of RECON_HEADER_KEYS) {
    const value = (header as unknown as Record<string, unknown>)[seat];
    out[seat] = typeof value === "number" ? round4(value) : value;
  }
  return out;
}

/** Builds the canonical frame record: the frozen seat order, the numbers
 * rounded, the layer lane last. */
function canonicalFrame(frame: ReconFrame): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const record = frame as unknown as Record<string, unknown>;
  for (const seat of RECON_FRAME_KEYS) {
    out[seat] = round4(record[seat] as number);
  }
  out.layers = frame.layers.map((layer) => ({
    layerId: layer.layerId,
    spectralPeaks: layer.spectralPeaks.map(round4),
    midiNotes: layer.midiNotes.map(round4),
  }));
  return out;
}

/** Builds the canonical correlations record: the frozen order, four decimals. */
function canonicalCorrelations(correlations: ReconCorrelations): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const seat of RECON_CORRELATION_KEYS) {
    out[seat] = round4((correlations as unknown as Record<string, number>)[seat]);
  }
  return out;
}

/**
 * Serializes a recon document to its canonical json: the validator runs
 * first (a broken document throws ReconError honestly), then the canonical
 * builder orders every key by the frozen seat lists and rounds every number
 * to four decimals — the same document always serializes to the same bytes,
 * whatever key order it arrived with.
 *
 * @param doc the recon document.
 * @returns the canonical json string.
 */
export function serializeRecon(doc: ReconDocument): string {
  const result = validateRecon(doc);
  if (!result.ok) throw new ReconError(result.code, result.message);
  return JSON.stringify({
    header: canonicalHeader(result.doc.header),
    frames: result.doc.frames.map(canonicalFrame),
    correlations: canonicalCorrelations(result.doc.correlations),
  });
}

/**
 * Parses a json string onto a recon document: the json must parse, carry no
 * duplicate key (the scanner catches what JSON.parse silently collapses)
 * and validate as debonair.recon/3; every failure answers its machine code.
 *
 * @param json the serialized document.
 * @returns the clamped document or the machine code.
 */
export function parseRecon(json: string): ReconResult {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return fail("bad-schema", "the payload is not valid json");
  }
  if (reconHasDuplicateKeys(json)) {
    return fail("duplicate-key", "the payload carries a duplicate key JSON.parse would silently collapse");
  }
  return validateRecon(value);
}

// ---------------------------------------------------------------------------
// the dictionary shortcuts (the named twins the callers read)
// ---------------------------------------------------------------------------

/** The id of a scale name (0..47); −1 outside the library. */
export function reconScaleId(name: string): number {
  return reconIdOf(RECON_SCALE_NAMES, name);
}

/** The name of a scale id ("phrygian-dom" for 27); "" outside. */
export function reconScaleName(id: number): string {
  return reconNameOf(RECON_SCALE_NAMES, id);
}

/** The id of a root name (0..11); −1 outside. */
export function reconRootId(name: string): number {
  return reconIdOf(RECON_ROOT_NAMES, name);
}

/** The name of a root id ("a" for 9); "" outside. */
export function reconRootName(id: number): string {
  return reconNameOf(RECON_ROOT_NAMES, id);
}

/** The id of an instrument name; −1 outside. */
export function reconInstrumentId(name: string): number {
  return reconIdOf(RECON_INSTRUMENTS, name);
}

/** The name of an instrument id; "" outside. */
export function reconInstrumentName(id: number): string {
  return reconNameOf(RECON_INSTRUMENTS, id);
}

/** The id of a family name; −1 outside. */
export function reconFamilyId(name: string): number {
  return reconIdOf(RECON_FAMILIES, name);
}

/** The name of a family id; "" outside. */
export function reconFamilyName(id: number): string {
  return reconNameOf(RECON_FAMILIES, id);
}

/** The id of a layer name; −1 outside. */
export function reconLayerId(name: string): number {
  return reconIdOf(RECON_LAYERS, name);
}

/** The name of a layer id; "" outside. */
export function reconLayerName(id: number): string {
  return reconNameOf(RECON_LAYERS, id);
}
