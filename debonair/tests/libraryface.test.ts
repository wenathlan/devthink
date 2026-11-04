// # libraryface.test — the npm library face of the katexis engine (the
// pipeline wave PV6.005): the package contract any consumer imports. the
// exports map answers one subpath per engine module — the nine pure
// pipeline seats, the two keyword seats the audio fold wave seated (the
// audio family and the take family, every leaf the half-done fold of #347
// left beside its keyword file retired into the one file per domain), the
// five retired leaf keys the same fold keeps as published-specifier
// aliases of the audio keyword file (the embedder's old specifiers keep
// resolving, every target the one file the domain owns) with
// the three gap seats the engine ownership wave completed (beatgrid,
// speechalign, stems),
// and the three server seats last (the two worker lanes and the route
// table leaf the gateway and the sibling lanes ride — the wave 2d carve
// out) — with the family publish shape (the
// types/import/default conditions over the root sources, the same source
// doctrine @wenathlan/getry/thinking rides); every target is a repository
// file that ships inside the npm files array, because an export the
// envelope never packs is a broken promise; the local import closure of
// every exported module packs with it, so the module graph never breaks at
// install time; and the honest surface pin walks every named export of
// every subpath through the package specifier itself — the embedder's own
// path — asserting the runtime seat each seat answers (function, object,
// number or string, never undefined), so a wave that drops, renames or
// reshapes a public seat goes red before the release.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "vitest";

// the db seat isolation law: the package walk pulls every engine module,
// and the db-carrying seats open their database at import time — pointing
// this suite's seat at its own file keeps the parallel vitest workers off
// the shared local.db the other suites ride (the SQLITE_BUSY lesson of the
// first CI run: one writer per wal file, every suite its own seat).
process.env.DATABASE_URL = "file:./local.libraryface.test.db";

const analyzemodule = await import("@wenathlan/debonair/analyze");
const audiomodule = await import("@wenathlan/debonair/audio");
const takemodule = await import("@wenathlan/debonair/take");
const beatgridmodule = await import("@wenathlan/debonair/beatgrid");
const blobstoremodule = await import("@wenathlan/debonair/blobstore");
const composermodule = await import("@wenathlan/debonair/composer");
const coverpalettemodule = await import("@wenathlan/debonair/coverpalette");
const demixmodule = await import("@wenathlan/debonair/demix");
const formantmodule = await import("@wenathlan/debonair/formant");
const genrecorpusmodule = await import("@wenathlan/debonair/genre");
const gatewayapimodule = await import("@wenathlan/debonair/gatewayapi");
const routetablemodule = await import("@wenathlan/debonair/routetable");
const hpssmodule = await import("@wenathlan/debonair/hpss");
const ingestmodule = await import("@wenathlan/debonair/ingest");
const reconpayloadmodule = await import("@wenathlan/debonair/reconpayload");
const patternenumsmodule = await import("@wenathlan/debonair/pattern");
const patternminermodule = await import("@wenathlan/debonair/pattern");
const renderworkermodule = await import("@wenathlan/debonair/render");
const reconworkermodule = await import("@wenathlan/debonair/reconworker");
const reverseingestmodule = await import("@wenathlan/debonair/reverseingest");
const speechalignmodule = await import("@wenathlan/debonair/speechalign");
const stemsmodule = await import("@wenathlan/debonair/stems");
const timestretchmodule = await import("@wenathlan/debonair/timestretch");
const patternselfmodule = await import("@wenathlan/debonair/pattern");
const genreselfmodule = await import("@wenathlan/debonair/genre");
const rendeselfmodule = await import("@wenathlan/debonair/render");
const wavwritermodule = await import("@wenathlan/debonair/wavwriter");

/** The engine subpaths the library publishes, in the map's own order: the
 * nine pure pipeline seats first, the two keyword seats the audio fold wave
 * seated (the audio and the take families, one keyword file per domain),
 * the five retired leaf keys the fold keeps as published-specifier aliases
 * of the audio keyword file next, the three gap seats the engine ownership
 * wave seated after them, the three server seats last (the two worker
 * lanes and the route table leaf). */
const SUBPATHS = [
  "analyze",
  "hpss",
  "ingest",
  "reconpayload",
  "patternminer",
  "demix",
  "formant",
  "genrecorpus",
  "reverseingest",
  "timestretch",
  "patternenums",
  "composer",
  "coverpalette",
  "audio",
  "take",
  "wavwriter",
  "blobstore",
  "audioattributes",
  "audiodecode",
  "audioengine",
  "audiofeatures",
  "audiopipeline",
  "beatgrid",
  "speechalign",
  "stems",
  "renderworker",
  "reconworker",
  "gatewayapi",
  "routetable",
  "pattern",
  "genre",
  "render",
] as const;

type Subpath = (typeof SUBPATHS)[number];

/** The keyword-file targets: the two family seats answer their keyword
 * files and the five retired leaf keys answer the audio keyword file (the
 * alias shape the fold pins — one target per domain, so the published
 * specifiers of the retired leaves resolve to the file that owns them
 * now); the retired worker/corpus/miner keys answer their own fold seats
 * the same way; every subpath outside this table answers its own root
 * source. */
const KEYWORD: Partial<Record<Subpath, string>> = {
  audio: "audio.ts",
  take: "take.ts",
  audioattributes: "audio.ts",
  audiodecode: "audio.ts",
  audioengine: "audio.ts",
  audiofeatures: "audio.ts",
  audiopipeline: "audio.ts",
  reconpayload: "recon.ts",
  reconworker: "recon.ts",
  patternminer: "pattern.ts",
  patternenums: "pattern.ts",
  genrecorpus: "genre.ts",
  renderworker: "render.ts",
};

/** The repository file a subpath resolves to — the keyword seat or alias
 * answers the keyword file, every other seat its own root source. */
const targetOf = (module: Subpath): string => KEYWORD[module] ?? `${module}.ts`;

/** The one publish shape every subpath answers: the family conditions —
 * types for the declaration consumer, import for the esm consumer, default
 * for everything else — over the target source file, the same doctrine the
 * getry thinking export rides (no dist step, the source is the library). */
const familysubpath = (module: Subpath) => {
  const target = `./${targetOf(module)}`;
  return { types: target, import: target, default: target };
};

/** The loaded subpath modules — the specifier imports above, keyed by
 * subpath, so the pin walks the same objects the map resolves. */
const MODULES: Record<Subpath, Record<string, unknown>> = {
  analyze: analyzemodule,
  hpss: hpssmodule,
  ingest: ingestmodule,
  reconpayload: reconpayloadmodule,
  patternminer: patternminermodule,
  patternenums: patternenumsmodule,
  composer: composermodule,
  coverpalette: coverpalettemodule,
  demix: demixmodule,
  formant: formantmodule,
  genrecorpus: genrecorpusmodule,
  reverseingest: reverseingestmodule,
  timestretch: timestretchmodule,
  audio: audiomodule,
  take: takemodule,
  wavwriter: wavwritermodule,
  blobstore: blobstoremodule,
  audioattributes: audiomodule,
  audiodecode: audiomodule,
  audioengine: audiomodule,
  audiofeatures: audiomodule,
  audiopipeline: audiomodule,
  beatgrid: beatgridmodule,
  speechalign: speechalignmodule,
  stems: stemsmodule,
  renderworker: renderworkermodule,
  reconworker: reconworkermodule,
  gatewayapi: gatewayapimodule,
  routetable: routetablemodule,
  pattern: patternselfmodule,
  genre: genreselfmodule,
  render: rendeselfmodule,
};

/** The runtime seat a named export answers — the honest ladder: functions
 * and classes answer "function", the tables and arrays answer "object",
 * the scalar constants answer their own typeof. */
type Seat = "function" | "object" | "number" | "string";

/** The audio keyword surface (the audio fold wave): the fifteen retired
 * leaves ride as sections of the one file the ownership law pins for the
 * domain — the descriptor contract, the wav walk, the decode layer, the
 * fft kernel, the rhythm pair, the spectrum, the structure, the timbre
 * pair, the tonality pair, the fusion, the pipeline orchestrator and the
 * browser transport — every runtime seat the fold carried, pinned once:
 * the family seat and the five alias keys answer the same table. */
const audiosurface: Record<string, Seat> = {
  AudioDecodeError: "function",
  BAND_EDGES_HZ: "object",
  BAND_NAMES: "object",
  CHORD_DEFAULT_FRAME_MS: "number",
  CHORD_INTERVALS: "object",
  DB_FLOOR: "number",
  DEFAULT_COEFFICIENTS: "number",
  DEFAULT_HOP: "number",
  DEFAULT_MIX_LAW: "object",
  DEFAULT_SIZE: "number",
  DESCRIPTOR_DIMS: "number",
  DIM_ORDER: "object",
  FFT_MAX_SIZE: "number",
  FFT_MIN_SIZE: "number",
  FftError: "function",
  MEL_BANDS: "number",
  NARRATIVE_CONTOUR: "object",
  NOISE_SECONDS: "number",
  PipelineError: "function",
  RENDER_TAIL_S: "number",
  ROLE_TRIM: "object",
  RhythmError: "function",
  SWING_THRESHOLD: "number",
  SpectrumError: "function",
  TENSION_ENERGY_WEIGHT: "number",
  TENSION_NOVELTY_WEIGHT: "number",
  TakeEngine: "function",
  TransportError: "function",
  VOICE_RECIPES: "object",
  VoiceBank: "function",
  analyzePcm: "function",
  analyzeStructure: "function",
  analyzeWavBytes: "function",
  audioSeed: "function",
  audioSeedFromStats: "function",
  bandEnergies: "function",
  beatGrid: "function",
  blackman: "function",
  bpmOverTime: "function",
  brightness: "function",
  canonicalTempo: "function",
  chordTemplates: "object",
  chromaVector: "function",
  chromagram: "function",
  clamp01: "function",
  dctii: "function",
  decodeWav: "function",
  descriptorSummary: "function",
  detectChords: "function",
  downbeatGrid: "function",
  downbeatIndex: "function",
  downmix: "function",
  dynamicStats: "function",
  energyCurve: "function",
  envelopeSampleAt: "function",
  estimateBpm: "function",
  estimateKey: "function",
  fft: "function",
  fftMagnitudes: "function",
  finite: "function",
  frameEnergies: "function",
  framecount: "function",
  fromAudioBufferLike: "function",
  fuseDescriptor: "function",
  hamming: "function",
  hann: "function",
  harmonicStats: "function",
  hertzToMel: "function",
  hztomel: "function",
  keyName: "function",
  keyProfiles: "object",
  labelSections: "function",
  melFilterbank: "function",
  melToHertz: "function",
  melbands: "function",
  meltohz: "function",
  mfcc: "function",
  noisinessIndex: "function",
  normalize01: "function",
  normalizePeak: "function",
  noveltyCurve: "function",
  onsetEnvelope: "function",
  onsetPeaks: "function",
  onsetShapes: "function",
  pitchClassNames: "object",
  readWavLayout: "function",
  readWavSamples: "function",
  renderTakeOffline: "function",
  reportDigest: "function",
  resample: "function",
  rhythmStats: "function",
  rmsEnvelope: "function",
  rolloffSharpness: "function",
  seededNoiseChannel: "function",
  spectralCentroid: "function",
  spectralFlatness: "function",
  spectralFlux: "function",
  spectralRolloff: "function",
  spectralSlope: "function",
  spectrogramImage: "function",
  spectrumFrames: "function",
  stft: "function",
  stftFrameCount: "function",
  structureBoundaries: "function",
  summarizeSpectrum: "function",
  swingRatio: "function",
  tensionCurve: "function",
  timbreStats: "function",
  todb: "function",
  warmthIndex: "function",
  wavinfo: "function",
  windowFunction: "function",
  zcr: "function",
  zcrrate: "function",
  zcurve: "function",
};

/** The honest surface pin — every named runtime export of every subpath
 * with the seat it answers. the deepEqual walk below asserts this table is
 * the COMPLETE surface (no unnamed export, no missing row), so the table
 * and the module can never drift apart silently. */
const SURFACE: Record<Subpath, Record<string, Seat>> = {
  analyze: {
    analyze: "function",
    BAND_LABELS: "object",
    BAND_LADDER: "object",
    BPM_CEIL: "number",
    BPM_FLOOR: "number",
    SILENCE_RMS: "number",
  },
  hpss: {
    istft: "function",
    masksOf: "function",
    medianFilter: "function",
    separate: "function",
    stft: "function",
    HARMONIC_KERNEL: "number",
    PERCUSSIVE_KERNEL: "number",
  },
  /* the ingest family seat — one file under the fold law: the decomposition
   * pipeline, the client, the db, the payload, the store, the worker and the
   * recon lanes, every runtime seat of the six retired arms one seat here. */
  ingest: {
    decompose: "function",
    ingestMixPcm: "function",
    ingestPcm: "function",
    onsetSecondsOf: "function",
    pcmhash: "function",
    segmentsof: "function",
    INGEST_SCHEMA_VERSION: "string",
    NOTE_NAMES: "object",
    INGEST_CALL_TIMEOUT_MS: "number",
    INGEST_UPLOAD_TIMEOUT_MS: "number",
    gatewaylane: "function",
    uploadIngest: "function",
    pollJob: "function",
    fetchShelf: "function",
    fetchDocument: "function",
    deleteDocument: "function",
    ownerid: "function",
    ingestorigin: "function",
    loaddbface: "function",
    IngestDbError: "function",
    migrateingestschema: "function",
    ensureingestschema: "function",
    puttingest: "function",
    getingestrow: "function",
    listingestrows: "function",
    getingestdoc: "function",
    listingestdocs: "function",
    droppingestrow: "function",
    docvalid: "function",
    migrategenreschema: "function",
    ensuregenreschema: "function",
    saveGenreProfile: "function",
    listGenreProfiles: "function",
    migratejobsschema: "function",
    ensurejobsschema: "function",
    putjob: "function",
    getjob: "function",
    updatejob: "function",
    listjobs: "function",
    SOUND_PAYLOAD_SCHEMA_VERSION: "string",
    ENERGY_CHUNK_MS: "number",
    RECONSTRUCT_DEFAULT_DEPTH: "number",
    PAYLOAD_LANE_MODALITY: "string",
    probesound: "function",
    energychunks: "function",
    ingestPayload: "function",
    reconstructWav: "function",
    saveingest: "function",
    listingests: "function",
    getingest: "function",
    droppingest: "function",
    ingestcount: "function",
    INGEST_STEMS_SCHEMA_VERSION: "string",
    PIPELINE_PHASES: "object",
    INGEST_WORKER_MODALITY: "string",
    parseWav: "function",
    downmixmono: "function",
    runIngestJob: "function",
    RECON_MFCC_COEFFICIENTS: "number",
    RECON_ENVELOPE_WINDOWS: "number",
    RECON_SPECTRAL_PEAKS: "number",
    RECON_PEAK_FLOOR: "number",
    RECON_YIN_WINDOW_MS: "number",
    RECON_YIN_HOP_MS: "number",
    RECON_YIN_THRESHOLD: "number",
    RECON_YIN_MIN_HZ: "number",
    RECON_YIN_MAX_HZ: "number",
    RECON_BPM_WINDOW_MS: "number",
    RECON_BASS_MIDI_MAX: "number",
    RECON_GUITAR_MIDI_MAX: "number",
    reconEnvelope32: "function",
    reconSpectralPeaks: "function",
    reconYinNotes: "function",
    reconScaleFit: "function",
    reconBpmPerSecond: "function",
    reconFamilyOf: "function",
    reconFromIngest: "function",
    reconOf: "function",
    trackStreamOf: "function",
    reconScaleModeOf: "function",
    reconRootModeOf: "function",
    reconBpmSeriesOf: "function",
  },
  reconpayload: {
    RECON_CORRELATION_KEYS: "object",
    RECON_ENCODINGS: "object",
    RECON_ERROR_CODES: "object",
    RECON_FAMILIES: "object",
    RECON_FRAME_KEYS: "object",
    RECON_HEADER_KEYS: "object",
    RECON_INSTRUMENTS: "object",
    RECON_LAYERS: "object",
    RECON_LAYER_KEYS: "object",
    RECON_MIME_TYPES: "object",
    RECON_NAME_MAX: "number",
    RECON_NORMALIZED_FRAME_KEYS: "object",
    RECON_NOTES_MAX: "number",
    RECON_PARAM_COUNTS: "object",
    RECON_PHASES: "object",
    RECON_RENDER_BIT_DEPTH: "number",
    RECON_RENDER_SAMPLE_RATE: "number",
    RECON_ROOT_NAMES: "object",
    RECON_SAMPLE_RATE: "number",
    RECON_SCALE_NAMES: "object",
    RECON_SCHEMA_VERSION: "string",
    RECON_TEXT_KEYS: "object",
    RECON_TIME_SIGNATURES: "object",
    RECON_TONAL_FAMILIES: "object",
    RECON_TONAL_LAYER_ID: "number",
    RECON_WAV_KIND: "string",
    ReconError: "function",
    fnv1aNumbers: "function",
    parseRecon: "function",
    reconFamilyId: "function",
    reconFamilyName: "function",
    reconHasDuplicateKeys: "function",
    reconIdOf: "function",
    reconInstrumentId: "function",
    reconInstrumentName: "function",
    reconLayerId: "function",
    reconLayerName: "function",
    reconNameOf: "function",
    reconRootId: "function",
    reconRootName: "function",
    reconScaleId: "function",
    reconScaleName: "function",
    reconSeedOf: "function",
    renderRecon: "function",
    renderReconPcm: "function",
    renderReconPlan: "function",
    serializeRecon: "function",
    startReconJob: "function",
    validateRecon: "function",
  },
  patternminer: {
    BAND_LABELS: "object",
    BPM_BUCKETS: "number",
    CHROMA_BINS: "number",
    CHROMA_DIM: "number",
    DRUM_LANE_KEYS: "object",
    EMBEDDING_DIM: "number",
    EVENT_KINDS: "object",
    GENRE_CORPUS_WEIGHTS: "object",
    GENRE_SEAT_WEIGHTS: "object",
    KEY_MODES: "object",
    KEY_POOL_NAMES: "object",
    LANE_STEPS: "number",
    NOTE_NAMES: "object",
    ONSET_CURVE_BINS: "number",
    PATTERN_ERROR_CODES: "object",
    PATTERN_GENRE_KEYS: "object",
    PATTERN_LIMITS: "object",
    PATTERN_PROJECT_ERROR_CODES: "object",
    PATTERN_SCALES: "object",
    PATTERN_SCALE_ALIASES: "object",
    PATTERN_SCALE_NAMES: "object",
    PATTERN_SCHEMA_IDS: "object",
    PATTERN_SCHEMA_VERSION: "string",
    PATTERN_TIMELINE_ERROR_CODES: "object",
    PATTERN_VOICES: "object",
    PROFILE_ERROR_CODES: "object",
    PROFILE_GENRE_KEYS: "object",
    PROFILE_LIMITS: "object",
    PROFILE_SCHEMA_VERSION: "string",
    PatternError: "function",
    ProfileError: "function",
    SEGMENT_DIM: "number",
    TIMELINE_SCHEMA_VERSION: "string",
    TIMELINE_SOURCES: "object",
    TRANSIENT_LABELS: "object",
    classifyDocument: "function",
    documentVector: "function",
    mineGenre: "function",
    parsePattern: "function",
    patternFromLlm: "function",
    patternNoteName: "function",
    patternNoteToPc: "function",
    patternPromptHint: "function",
    patternScaleIntervals: "function",
    segmentVector: "function",
    serializePattern: "function",
    serializeProfile: "function",
    similarityRank: "function",
    validateGenreProfile: "function",
    validatePatternProject: "function",
    validatePatternTimeline: "function",
  },
  patternenums: {
    BAND_LABELS: "object",
    BPM_BUCKETS: "number",
    CHROMA_BINS: "number",
    CHROMA_DIM: "number",
    DRUM_LANE_KEYS: "object",
    EMBEDDING_DIM: "number",
    EVENT_KINDS: "object",
    GENRE_CORPUS_WEIGHTS: "object",
    GENRE_SEAT_WEIGHTS: "object",
    KEY_MODES: "object",
    KEY_POOL_NAMES: "object",
    LANE_STEPS: "number",
    NOTE_NAMES: "object",
    ONSET_CURVE_BINS: "number",
    PATTERN_ERROR_CODES: "object",
    PATTERN_GENRE_KEYS: "object",
    PATTERN_LIMITS: "object",
    PATTERN_PROJECT_ERROR_CODES: "object",
    PATTERN_SCALES: "object",
    PATTERN_SCALE_ALIASES: "object",
    PATTERN_SCALE_NAMES: "object",
    PATTERN_SCHEMA_IDS: "object",
    PATTERN_SCHEMA_VERSION: "string",
    PATTERN_TIMELINE_ERROR_CODES: "object",
    PATTERN_VOICES: "object",
    PROFILE_ERROR_CODES: "object",
    PROFILE_GENRE_KEYS: "object",
    PROFILE_LIMITS: "object",
    PROFILE_SCHEMA_VERSION: "string",
    PatternError: "function",
    ProfileError: "function",
    SEGMENT_DIM: "number",
    TIMELINE_SCHEMA_VERSION: "string",
    TIMELINE_SOURCES: "object",
    TRANSIENT_LABELS: "object",
    classifyDocument: "function",
    documentVector: "function",
    mineGenre: "function",
    parsePattern: "function",
    patternFromLlm: "function",
    patternNoteName: "function",
    patternNoteToPc: "function",
    patternPromptHint: "function",
    patternScaleIntervals: "function",
    segmentVector: "function",
    serializePattern: "function",
    serializeProfile: "function",
    similarityRank: "function",
    validateGenreProfile: "function",
    validatePatternProject: "function",
    validatePatternTimeline: "function",
  },
  composer: {
    composeFromProfile: "function",
    composeSimilar: "function",
    compositionSimilarity: "function",
    parseComposerPrompt: "function",
    planVector: "function",
    ComposerError: "function",
    DEFAULT_BARS: "number",
    SIMILARITY_FLOOR: "number",
    COMPOSER_ERROR_CODES: "object",
  },
  coverpalette: {
    coverPaletteFromStats: "function",
    coverPaletteFromPcm: "function",
    plateAccents: "function",
  },
  demix: {
    demix: "function",
    demixToWavs: "function",
    DemixError: "function",
    DEMIX_STEM_NAMES: "object",
    DEMIX_BASS_HZ: "object",
    DEMIX_VOCAL_HZ: "object",
  },
  formant: {
    vowelBank: "function",
    glideBank: "function",
    glottalSaw: "function",
    rosenbergPulse: "function",
    formantResonator: "function",
    applyBandpass: "function",
    renderFormantPhrase: "function",
    VOWEL_FORMANTS: "object",
    UPPER_FORMANT_HZ: "object",
    UPPER_FORMANT_BW: "object",
    UPPER_FORMANT_GAINS: "object",
    FORMANT_VIBRATO_HZ: "number",
    FORMANT_VIBRATO_SEMITONES: "number",
    DEFAULT_SPEECH_HZ: "number",
    FORMANT_CONSONANT_S: "number",
    FORMANT_CONTROL_HOP: "number",
    FORMANT_TARGET_PEAK: "number",
    FORMANT_ENVELOPE: "object",
  },
  genrecorpus: {
    CORPUS_DEFAULT_BARS: "number",
    CORPUS_DEFAULT_REFERENCES: "number",
    CORPUS_ERROR_CODES: "object",
    CORPUS_INSTANT: "string",
    CORPUS_SCHEMA_VERSION: "string",
    CorpusError: "function",
    GENRES: "object",
    corpusSeatOf: "function",
    defaultGenreCorpus: "function",
    genreById: "function",
    matchGenre: "function",
    parseCorpus: "function",
    pickBpm: "function",
    seedProfileOf: "function",
    serializeCorpus: "function",
    trainGenreCorpus: "function",
    validateGenreCorpus: "function",
    validateMatrix: "function",
  },
  reverseingest: {
    reverseIngestPayload: "function",
    timelineEvents: "function",
    shapeTimelineLoudness: "function",
    ReverseIngestError: "function",
  },
  timestretch: {
    stretchPcm: "function",
    StretchError: "function",
    STRETCH_RATIO_MIN: "number",
    STRETCH_RATIO_MAX: "number",
  },
  audio: audiosurface,
  /* the five retired leaf keys the fold keeps as published-specifier
   * aliases: each resolves to the audio keyword file, so each answers the
   * keyword file's whole runtime surface — the pin walks the one table. */
  audioattributes: audiosurface,
  audiodecode: audiosurface,
  audioengine: audiosurface,
  audiofeatures: audiosurface,
  audiopipeline: audiosurface,
  /* the take keyword seat (the audio fold wave): the three retired take
   * leaves — the event scheduler, the session take store, the bounce
   * desk — answer their one keyword file. */
  take: {
    EXPORT_LABELS: "object",
    RECON_SEED_SCHEMA_VERSION: "string",
    TAKE_SELECT_KEY: "string",
    TAKE_STORE_KEY: "string",
    downloadFile: "function",
    eventsInWindow: "function",
    exportTake: "function",
    findTakeRecord: "function",
    loadTakeRecords: "function",
    memoryStorage: "function",
    positionAt: "function",
    reconSeedFile: "function",
    removeTakePlan: "function",
    saveTakePlan: "function",
    scheduleTake: "function",
    sectionAt: "function",
    sessionStorageOrMemory: "function",
    validateSchedule: "function",
  },
  wavwriter: {
    encodeWav: "function",
    validateEncoding: "function",
    wavInfo: "function",
    writeWav16: "function",
    writeWav24: "function",
    writeWav32f: "function",
    WavError: "function",
    CHANNELS_MAX: "number",
    CHANNELS_MIN: "number",
    EXPORT_SIZE_LIMIT_BYTES: "number",
    MAX_DURATION_SECONDS: "number",
    SAMPLE_RATE_MAX: "number",
    SAMPLE_RATE_MIN: "number",
    HEADER_LAYOUT: "object",
    WAV_FORMAT: "object",
  },
  blobstore: {
    blobidvalid: "function",
    blobkindvalid: "function",
    blobrowvalid: "function",
    blobshavalid: "function",
    fileblobstore: "function",
    gatewayblobstore: "function",
    lfsPointerFrom: "function",
    lfsPointerText: "function",
    memoryblobstore: "function",
    sessionblobstore: "function",
    sha256hex: "function",
    blobseatfromenv: "function",
    resolveblobstore: "function",
    vaultblobstore: "function",
    vaultclientseam: "function",
    FileBlobStore: "function",
    GatewayBlobStore: "function",
    MemoryBlobStore: "function",
    VaultBlobStore: "function",
    BLOB_BACKEND_NAMES: "object",
    BLOB_DEFAULT_CAP_BYTES: "number",
    BLOB_GATEWAY_TIMEOUT_MS: "number",
    BLOB_BACKEND_ENV: "string",
    BLOB_ORIGIN_ENV: "string",
    BLOB_ROOT_ENV: "string",
    BLOB_SCHEMA_VERSION: "string",
    VAULT_ORIGIN_ENV: "string",
    VAULT_PROJECT_ENV: "string",
    VAULT_TOKEN_ENV: "string",
  },
  beatgrid: {
    onsetEnvelope: "function",
    detectTempo: "function",
    trackBeats: "function",
    gridFromBeats: "function",
    identityGrid: "function",
    beatCount: "function",
    isDownbeat: "function",
    beatTime: "function",
    nearestBeat: "function",
    quantizeToGrid: "function",
    swingOffset: "function",
    subdivideBeat: "function",
    tempoMapFromAnchors: "function",
    gridToTempoMap: "function",
    tempoAtTime: "function",
    beatsElapsed: "function",
    timeAtBeat: "function",
  },
  speechalign: {
    frameRms: "function",
    rmsToDb: "function",
    noiseFloorDb: "function",
    speechThresholdDb: "function",
    voicedFlags: "function",
    flagsToSegments: "function",
    mergeSegments: "function",
    trimSegments: "function",
    segmentAt: "function",
    totalSpeechSeconds: "function",
    stretchRatio: "function",
    clampStretch: "function",
    beatGridTimes: "function",
    fitPlan: "function",
    planOffsets: "function",
    maxStretchRatio: "function",
    alignSpeech: "function",
    defaultSpeechParams: "object",
  },
  stems: {
    planStems: "function",
    stemsManifest: "function",
    validateStems: "function",
    stemFile: "function",
    StemsError: "function",
    STEM_ROLES: "object",
    STEMS_SCHEMA_VERSION: "string",
  },
  renderworker: {
    RENDER_BIT_DEPTH: "number",
    RENDER_PHASES: "object",
    RENDER_SAMPLE_RATE: "number",
    RENDER_WAV_KIND: "string",
    RENDER_WORKER_MODALITY: "string",
    VOICE_BUS_FADER_DB: "number",
    ensurerenderjobsschema: "function",
    ensuretrackschema: "function",
    formantEventsOf: "function",
    getrenderjob: "function",
    getrendertrack: "function",
    listrenderjobs: "function",
    listrendertracks: "function",
    migraterenderjobsschema: "function",
    migratetrackschema: "function",
    publishrendertrack: "function",
    putrenderjob: "function",
    putrendertrack: "function",
    renderPatternMix: "function",
    renderPlan: "function",
    renderVoiceMix: "function",
    renderjobseat: "function",
    rendertrackseat: "function",
    schedulePattern: "function",
    startRenderJob: "function",
    updaterenderjob: "function",
  },
  reconworker: {
    RECON_CORRELATION_KEYS: "object",
    RECON_ENCODINGS: "object",
    RECON_ERROR_CODES: "object",
    RECON_FAMILIES: "object",
    RECON_FRAME_KEYS: "object",
    RECON_HEADER_KEYS: "object",
    RECON_INSTRUMENTS: "object",
    RECON_LAYERS: "object",
    RECON_LAYER_KEYS: "object",
    RECON_MIME_TYPES: "object",
    RECON_NAME_MAX: "number",
    RECON_NORMALIZED_FRAME_KEYS: "object",
    RECON_NOTES_MAX: "number",
    RECON_PARAM_COUNTS: "object",
    RECON_PHASES: "object",
    RECON_RENDER_BIT_DEPTH: "number",
    RECON_RENDER_SAMPLE_RATE: "number",
    RECON_ROOT_NAMES: "object",
    RECON_SAMPLE_RATE: "number",
    RECON_SCALE_NAMES: "object",
    RECON_SCHEMA_VERSION: "string",
    RECON_TEXT_KEYS: "object",
    RECON_TIME_SIGNATURES: "object",
    RECON_TONAL_FAMILIES: "object",
    RECON_TONAL_LAYER_ID: "number",
    RECON_WAV_KIND: "string",
    ReconError: "function",
    fnv1aNumbers: "function",
    parseRecon: "function",
    reconFamilyId: "function",
    reconFamilyName: "function",
    reconHasDuplicateKeys: "function",
    reconIdOf: "function",
    reconInstrumentId: "function",
    reconInstrumentName: "function",
    reconLayerId: "function",
    reconLayerName: "function",
    reconNameOf: "function",
    reconRootId: "function",
    reconRootName: "function",
    reconScaleId: "function",
    reconScaleName: "function",
    reconSeedOf: "function",
    renderRecon: "function",
    renderReconPcm: "function",
    renderReconPlan: "function",
    serializeRecon: "function",
    startReconJob: "function",
    validateRecon: "function",
  },
  gatewayapi: {
    dispatch: "function",
    matchpath: "function",
    matchroute: "function",
    startJob: "function",
    startMinerJob: "function",
    startRenderLaneJob: "function",
    startRenderJob: "function",
    startReconLaneJob: "function",
    MINER_PHASES: "object",
    routes: "object",
  },
  routetable: {
    /* the route table leaf the wave 2d carve out seated: the nineteen-row
     * catalog with its two pure matchers — the lightest face of the
     * gateway contract, the seat the getry lane imports instead of
     * mirroring the rows (safedecode stays the leaf's private helper, the
     * same seat it answers inside gatewayapi). */
    routes: "object",
    matchpath: "function",
    matchroute: "function",
  },
  pattern: {
    BAND_LABELS: "object",
    BPM_BUCKETS: "number",
    CHROMA_BINS: "number",
    CHROMA_DIM: "number",
    DRUM_LANE_KEYS: "object",
    EMBEDDING_DIM: "number",
    EVENT_KINDS: "object",
    GENRE_CORPUS_WEIGHTS: "object",
    GENRE_SEAT_WEIGHTS: "object",
    KEY_MODES: "object",
    KEY_POOL_NAMES: "object",
    LANE_STEPS: "number",
    NOTE_NAMES: "object",
    ONSET_CURVE_BINS: "number",
    PATTERN_ERROR_CODES: "object",
    PATTERN_GENRE_KEYS: "object",
    PATTERN_LIMITS: "object",
    PATTERN_PROJECT_ERROR_CODES: "object",
    PATTERN_SCALES: "object",
    PATTERN_SCALE_ALIASES: "object",
    PATTERN_SCALE_NAMES: "object",
    PATTERN_SCHEMA_IDS: "object",
    PATTERN_SCHEMA_VERSION: "string",
    PATTERN_TIMELINE_ERROR_CODES: "object",
    PATTERN_VOICES: "object",
    PROFILE_ERROR_CODES: "object",
    PROFILE_GENRE_KEYS: "object",
    PROFILE_LIMITS: "object",
    PROFILE_SCHEMA_VERSION: "string",
    PatternError: "function",
    ProfileError: "function",
    SEGMENT_DIM: "number",
    TIMELINE_SCHEMA_VERSION: "string",
    TIMELINE_SOURCES: "object",
    TRANSIENT_LABELS: "object",
    classifyDocument: "function",
    documentVector: "function",
    mineGenre: "function",
    parsePattern: "function",
    patternFromLlm: "function",
    patternNoteName: "function",
    patternNoteToPc: "function",
    patternPromptHint: "function",
    patternScaleIntervals: "function",
    segmentVector: "function",
    serializePattern: "function",
    serializeProfile: "function",
    similarityRank: "function",
    validateGenreProfile: "function",
    validatePatternProject: "function",
    validatePatternTimeline: "function",
  },
  genre: {
    CORPUS_DEFAULT_BARS: "number",
    CORPUS_DEFAULT_REFERENCES: "number",
    CORPUS_ERROR_CODES: "object",
    CORPUS_INSTANT: "string",
    CORPUS_SCHEMA_VERSION: "string",
    CorpusError: "function",
    GENRES: "object",
    corpusSeatOf: "function",
    defaultGenreCorpus: "function",
    genreById: "function",
    matchGenre: "function",
    parseCorpus: "function",
    pickBpm: "function",
    seedProfileOf: "function",
    serializeCorpus: "function",
    trainGenreCorpus: "function",
    validateGenreCorpus: "function",
    validateMatrix: "function",
  },
  render: {
    RENDER_BIT_DEPTH: "number",
    RENDER_PHASES: "object",
    RENDER_SAMPLE_RATE: "number",
    RENDER_WAV_KIND: "string",
    RENDER_WORKER_MODALITY: "string",
    VOICE_BUS_FADER_DB: "number",
    ensurerenderjobsschema: "function",
    ensuretrackschema: "function",
    formantEventsOf: "function",
    getrenderjob: "function",
    getrendertrack: "function",
    listrenderjobs: "function",
    listrendertracks: "function",
    migraterenderjobsschema: "function",
    migratetrackschema: "function",
    publishrendertrack: "function",
    putrenderjob: "function",
    putrendertrack: "function",
    renderPatternMix: "function",
    renderPlan: "function",
    renderVoiceMix: "function",
    renderjobseat: "function",
    rendertrackseat: "function",
    schedulePattern: "function",
    startRenderJob: "function",
    updaterenderjob: "function",
  },
};

/** Every relative seat an exported module reaches — the local import
 * closure the tarball must pack so the published module graph never
 * breaks: each walk step reads the file, asserts every relative specifier
 * carries the .ts extension (the tsconfig allowImportingTsExtensions law)
 * and follows it, so the closure is the exact set the exports graph loads. */
function importclosure(roots: readonly Subpath[]): string[] {
  const seen = new Set<string>();
  const queue: string[] = roots.map((module) => targetOf(module));
  const specifier = /from\s+"\.\/([^"]+)"/g;
  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file)) continue;
    seen.add(file);
    if (!existsSync(file)) throw new Error(`The closure walks ${file}, which is not a repository file.`);
    for (const match of readFileSync(file, "utf8").matchAll(specifier)) {
      const seat = match[1];
      if (!seat.endsWith(".ts")) {
        throw new Error(`The local import ${seat} of ${file} drops the .ts extension the family law pins.`);
      }
      if (!seen.has(seat)) queue.push(seat);
    }
  }
  return [...seen].sort();
}

describe("the library face of @wenathlan/debonair", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
    exports: Record<string, { types: string; import: string; default: string }>;
    files: string[];
  };

  it("publishes one subpath per engine module with the family condition shape", () => {
    assert.deepEqual(
      Object.keys(pkg.exports),
      SUBPATHS.map((module) => `./${module}`),
    );
    for (const module of SUBPATHS) {
      assert.deepEqual(
        pkg.exports[`./${module}`],
        familysubpath(module),
        `the ${module} subpath left the family shape`,
      );
    }
  });

  it("answers every exports target with a repository file the tarball packs", () => {
    for (const module of SUBPATHS) {
      const file = targetOf(module);
      assert.ok(existsSync(file), `the exports target ${file} does not resolve to a repository file`);
      assert.ok(pkg.files.includes(file), `the exports target ${file} never ships in the npm files array`);
    }
  });

  it("packs the local import closure of the exported modules — the graph never breaks at install time", () => {
    for (const file of importclosure(SUBPATHS)) {
      assert.ok(pkg.files.includes(file), `the closure seat ${file} never ships in the npm files array`);
    }
  });

  it("pins every named export of every subpath to the runtime seat it answers", () => {
    for (const module of SUBPATHS) {
      const loaded = MODULES[module];
      const pin = SURFACE[module];
      assert.deepEqual(
        Object.keys(loaded).sort(),
        Object.keys(pin).sort(),
        `the ${module} surface drifted from the pin — the table and the module must move together`,
      );
      for (const [name, seat] of Object.entries(pin)) {
        assert.equal(typeof loaded[name], seat, `the ${module} seat ${name} stopped answering ${seat}`);
      }
    }
  });
});
