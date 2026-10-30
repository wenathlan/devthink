// # libraryface.test — the npm library face of the katexis engine (the
// pipeline wave PV6.005): the package contract any consumer imports. the
// exports map answers one subpath per engine module — the nine pure
// pipeline seats and the three server lanes — with the family publish
// shape (the types/import/default conditions over the root sources, the
// same source doctrine @wenathlan/getry/thinking rides); every target is a
// repository file that ships inside the npm files array, because an export
// the envelope never packs is a broken promise; the local import closure of
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
const audioenginemodule = await import("@wenathlan/debonair/audioengine");
const blobstoremodule = await import("@wenathlan/debonair/blobstore");
const composermodule = await import("@wenathlan/debonair/composer");
const gatewayapimodule = await import("@wenathlan/debonair/gatewayapi");
const hpssmodule = await import("@wenathlan/debonair/hpss");
const ingestmodule = await import("@wenathlan/debonair/ingest");
const ingestworkermodule = await import("@wenathlan/debonair/ingestworker");
const patternenumsmodule = await import("@wenathlan/debonair/patternenums");
const patternminermodule = await import("@wenathlan/debonair/patternminer");
const renderworkermodule = await import("@wenathlan/debonair/renderworker");
const wavwritermodule = await import("@wenathlan/debonair/wavwriter");

/** The engine subpaths the library publishes, in the map's own order: the
 * nine pure pipeline seats first, the three server lanes last. */
const SUBPATHS = [
  "analyze",
  "hpss",
  "ingest",
  "patternminer",
  "patternenums",
  "composer",
  "audioengine",
  "wavwriter",
  "blobstore",
  "ingestworker",
  "renderworker",
  "gatewayapi",
] as const;

type Subpath = (typeof SUBPATHS)[number];

/** The one publish shape every subpath answers: the family conditions —
 * types for the declaration consumer, import for the esm consumer, default
 * for everything else — over the root source file, the same doctrine the
 * getry thinking export rides (no dist step, the source is the library). */
const familysubpath = (module: Subpath) => {
  const target = `./${module}.ts`;
  return { types: target, import: target, default: target };
};

/** The loaded subpath modules — the specifier imports above, keyed by
 * subpath, so the pin walks the same objects the map resolves. */
const MODULES: Record<Subpath, Record<string, unknown>> = {
  analyze: analyzemodule,
  hpss: hpssmodule,
  ingest: ingestmodule,
  patternminer: patternminermodule,
  patternenums: patternenumsmodule,
  composer: composermodule,
  audioengine: audioenginemodule,
  wavwriter: wavwritermodule,
  blobstore: blobstoremodule,
  ingestworker: ingestworkermodule,
  renderworker: renderworkermodule,
  gatewayapi: gatewayapimodule,
};

/** The runtime seat a named export answers — the honest ladder: functions
 * and classes answer "function", the tables and arrays answer "object",
 * the scalar constants answer their own typeof. */
type Seat = "function" | "object" | "number" | "string";

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
  ingest: {
    decompose: "function",
    ingestPcm: "function",
    onsetSecondsOf: "function",
    pcmhash: "function",
    segmentsof: "function",
    INGEST_SCHEMA_VERSION: "string",
    NOTE_NAMES: "object",
  },
  patternminer: {
    documentVector: "function",
    mineGenre: "function",
    segmentVector: "function",
    serializeProfile: "function",
    similarityRank: "function",
    validateGenreProfile: "function",
    ProfileError: "function",
    BPM_BUCKETS: "number",
    CHROMA_BINS: "number",
    ONSET_CURVE_BINS: "number",
    SEGMENT_DIM: "number",
    KEY_MODES: "object",
    KEY_POOL_NAMES: "object",
    PROFILE_ERROR_CODES: "object",
    PROFILE_GENRE_KEYS: "object",
    PROFILE_LIMITS: "object",
    PROFILE_SCHEMA_VERSION: "string",
  },
  patternenums: {
    parsePattern: "function",
    patternFromLlm: "function",
    patternNoteName: "function",
    patternNoteToPc: "function",
    patternPromptHint: "function",
    patternScaleIntervals: "function",
    serializePattern: "function",
    validatePatternProject: "function",
    validatePatternTimeline: "function",
    PatternError: "function",
    CHROMA_DIM: "number",
    EMBEDDING_DIM: "number",
    LANE_STEPS: "number",
    BAND_LABELS: "object",
    DRUM_LANE_KEYS: "object",
    EVENT_KINDS: "object",
    NOTE_NAMES: "object",
    PATTERN_ERROR_CODES: "object",
    PATTERN_GENRE_KEYS: "object",
    PATTERN_LIMITS: "object",
    PATTERN_PROJECT_ERROR_CODES: "object",
    PATTERN_SCALES: "object",
    PATTERN_SCALE_ALIASES: "object",
    PATTERN_SCALE_NAMES: "object",
    PATTERN_SCHEMA_IDS: "object",
    PATTERN_TIMELINE_ERROR_CODES: "object",
    PATTERN_VOICES: "object",
    TIMELINE_SOURCES: "object",
    TRANSIENT_LABELS: "object",
    PATTERN_SCHEMA_VERSION: "string",
    TIMELINE_SCHEMA_VERSION: "string",
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
  audioengine: {
    renderTakeOffline: "function",
    seededNoiseChannel: "function",
    TakeEngine: "function",
    TransportError: "function",
    VoiceBank: "function",
    NOISE_SECONDS: "number",
    RENDER_TAIL_S: "number",
    DEFAULT_MIX_LAW: "object",
    ROLE_TRIM: "object",
    VOICE_RECIPES: "object",
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
  ingestworker: {
    downmixmono: "function",
    parseWav: "function",
    runIngestJob: "function",
    PIPELINE_PHASES: "object",
    INGEST_STEMS_SCHEMA_VERSION: "string",
    INGEST_WORKER_MODALITY: "string",
  },
  renderworker: {
    renderPatternMix: "function",
    renderPlan: "function",
    schedulePattern: "function",
    startRenderJob: "function",
    RENDER_BIT_DEPTH: "number",
    RENDER_SAMPLE_RATE: "number",
    RENDER_PHASES: "object",
    RENDER_WAV_KIND: "string",
    RENDER_WORKER_MODALITY: "string",
  },
  gatewayapi: {
    dispatch: "function",
    matchpath: "function",
    matchroute: "function",
    startJob: "function",
    startMinerJob: "function",
    startRenderLaneJob: "function",
    startRenderJob: "function",
    MINER_PHASES: "object",
    routes: "object",
  },
};

/** Every relative seat an exported module reaches — the local import
 * closure the tarball must pack so the published module graph never
 * breaks: each walk step reads the file, asserts every relative specifier
 * carries the .ts extension (the tsconfig allowImportingTsExtensions law)
 * and follows it, so the closure is the exact set the exports graph loads. */
function importclosure(roots: readonly Subpath[]): string[] {
  const seen = new Set<string>();
  const queue: string[] = roots.map((module) => `${module}.ts`);
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
      const file = `${module}.ts`;
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
