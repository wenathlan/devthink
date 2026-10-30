// # gatewayapi.test — the route table contract of the debonair gateway
// lane: the matcher (the exact routes match, the :params extract, the
// wrong method answers the 405 shape, the unknown path the 404 shape, the
// jobs route rides ahead of the document :id route), the upload
// validation lanes (the vault body law — the base64 json lane, the raw
// lane, the owner pointer law, the enum laws), the upload flow end to end
// on the memory store and a temp sqlite (the synthetic wav uploads, the
// ledger row lands queued, startJob walks the worker running → done with
// ascending fractions and the final phase, the document row stamps, the
// shelf lists it, the read answers it, the blob route streams the mix
// bytes with the audio/wav mime, the delete removes the row and every
// blob), the failure lane (garbage bytes land failed with the honest
// error code), the visibility law (the vitrine rows list for everyone,
// the private rows only for the owner query), the render and the publish
// lane (the composed plan queues through the contract gate, the walk
// lands the track row private with the wav in the store, the publish
// moves it onto the vitrine under the owner law — the private stays
// private, the vitrine list serves the published takes beside the
// vitrine references, the blob route streams the landed wav) — beside
// the generate lane's own four spellings the automation seats ride (the
// render queue, the job poll, the publish by id and the vitrine surface
// under the merged seventeen-route table) — and the
// ledger row functions round trip with the parameterization audit (no
// interpolated sql ever rides the db module). runnable with vitest:
// pnpm vitest run tests/gatewayapi.test.ts
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterAll, beforeAll, describe, it } from "vitest";
import { mintid } from "../bigintids.ts";
import type { MemoryBlobStore } from "../blobstore.ts";
import { memoryblobstore } from "../blobstore.ts";
import type {
  BlobStreamValue,
  GatewayAnswer,
  GatewayDocumentSeat,
  GatewayEnv,
  GatewayErr,
  GatewayJobPatch,
  GatewayJobRow,
  GatewayJobSeat,
  GatewayProfileSeat,
  GatewayRequest,
  IngestJobValue,
  IngestRunValue,
  RenderJobValue,
  RenderRunValue,
  VitrineTrackValue,
} from "../gatewayapi.ts";
import { dispatch, matchpath, matchroute, routes, startJob, startRenderLaneJob } from "../gatewayapi.ts";
import { INGEST_SCHEMA_VERSION, ingestPcm } from "../ingest.ts";
import {
  getjob,
  listGenreProfiles,
  listjobs,
  migrategenreschema,
  migratejobsschema,
  putjob,
  saveGenreProfile,
  updatejob,
} from "../ingestdb.ts";
import type { IngestStampRow } from "../ingestworker.ts";
import { parseWav } from "../ingestworker.ts";
import { serializePattern } from "../patternenums.ts";
import type { GenreProfile } from "../patternminer.ts";
import { renderjobseat, rendertrackseat } from "../renderjobs.ts";
import { encodeWav, wavInfo } from "../wavwriter.ts";

/** The source rate of the synthetic take (a rate the writer's band carries). */
const SAMPLE_RATE = 44100;
/** The length of the synthetic take in whole seconds (one vector frame per second). */
const SECONDS = 2;
/** The raw job name (one trailing extension folds away into the display name). */
const SOURCE_NAME = "sine click take.wav";
/** The display name the document carries (the extension folded). */
const DISPLAY_NAME = "sine click take";
/** The pinned base tick the clocks and the mints walk from (distinct instants keep the order deterministic). */
const BASE_TICK = 1_700_000_000_000;
/** The owner id of every test job (the minted decimal string the rows stamp). */
const OWNER_ID = mintid();
/** A 64-hex sha fixture (the rows the visibility lane stamps carry). */
const SHA_FIXTURE = "3a7f1c9e2b84d05f6a1e93c47d82b5a6f0c1d2e34f5a6b7c8d9e0f1a2b3c4d5e";

/** A tiny deterministic prng — the same seed answers the same take. */
function seededrng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * The synthetic source: two sines (the harmonic ridge) over a click train
 * (the percussive broadband), clamped to full scale — small enough to
 * ingest fast, structured enough that hpss finds both stems.
 *
 * @param sampleRate the rate of the take.
 * @param seconds the length of the take.
 * @returns the mono samples.
 */
function syntheticsource(sampleRate: number, seconds: number): Float32Array {
  const rng = seededrng(2026);
  const mono = new Float32Array(Math.floor(sampleRate * seconds));
  for (let i = 0; i < mono.length; i++) {
    const t = i / sampleRate;
    const tones = 0.35 * Math.sin(2 * Math.PI * 220 * t) + 0.2 * Math.sin(2 * Math.PI * 331 * t);
    const phase = t % 0.25;
    const click = phase < 0.01 ? 0.8 * (1 - phase / 0.01) * (rng() * 2 - 1) : 0;
    mono[i] = Math.max(-1, Math.min(1, tones + click));
  }
  return mono;
}

/** The full synthetic wav the flow ingests (16-bit at the source rate). */
const sourceWav = encodeWav([syntheticsource(SAMPLE_RATE, SECONDS)], { sampleRate: SAMPLE_RATE, bitDepth: 16 });
/** The source samples (the blob stream compares its frames against these). */
const sourceMono = syntheticsource(SAMPLE_RATE, SECONDS);
/** The independent digest of the source bytes (node crypto, not the store's own rounds). */
const sourceSha = createHash("sha256").update(sourceWav).digest("hex");
/** The garbage bytes the failure lane feeds the worker. */
const garbage = new TextEncoder().encode("not a wav at all");

/** The run payload the flow hands startJob (the upload facts the queue carries). */
const runpayload = { bytes: sourceWav, name: SOURCE_NAME, kind: "upload", visibility: "vitrine" } as const;

/**
 * Builds one gateway request — the transport adapter's job in production,
 * the test double here.
 *
 * @param method the http method.
 * @param path the request path.
 * @param query the query parameters.
 * @param json the parsed json body (the json lane).
 * @param raw the raw body bytes (the deposit lane).
 * @returns the request.
 */
function request(
  method: string,
  path: string,
  query: Record<string, string> = {},
  json: Record<string, unknown> | null = null,
  raw: Uint8Array | null = null,
): GatewayRequest {
  return { method, path, query, json, raw };
}

/** Posts one upload body on the json lane and answers the err (the validation shortcut). */
async function refuseupload(env: GatewayEnv, body: Record<string, unknown>): Promise<GatewayErr> {
  return errof(await dispatch(env, request("POST", "/api/v1/ingest/upload", {}, body)));
}

/** Posts one upload on the raw lane and answers the err (the validation shortcut). */
async function refuseuploadraw(env: GatewayEnv, query: Record<string, string>): Promise<GatewayErr> {
  return errof(await dispatch(env, request("POST", "/api/v1/ingest/upload", query, null, sourceWav)));
}

/** Unwraps one ok answer — a refusal throws with the machine code and the message. */
function valueof<T>(answer: GatewayAnswer<T>): T {
  if (!answer.ok) {
    throw new Error(`the route refused: ${answer.error.code} — ${answer.error.message}`);
  }
  return answer.value;
}

/** Unwraps one err answer — an ok answer fails the test. */
function errof(answer: GatewayAnswer): GatewayErr {
  assert.ok(!answer.ok, "the answer must refuse");
  return answer;
}

/** One raw ingest_documents cell row of the temp sqlite (the reference-law column set). */
interface DocCellRow {
  id: string;
  owner_id: string;
  kind: string;
  visibility: string;
  name: string;
  mix_pointer: string;
  stems_pointer: string;
  size_bytes: number;
  sha256: string;
  samplerate: number;
  durationseconds: number;
  pcmhash: number;
  ingestedat: string;
  docjson: string;
}

/** The literal column list of the reference-law table (the seat reads it verbatim). */
const DOC_COLUMNS =
  "id, owner_id, kind, visibility, name, mix_pointer, stems_pointer, size_bytes, sha256, samplerate, durationseconds, pcmhash, ingestedat, docjson";

/**
 * The document shelf seat over a sqlite handle — the ingestdb seam bound
 * to the reference-law table (the same column set the worker's own test
 * handle stamps: the owner, the kind, the visibility, the pointer pair,
 * the size, the sha and the canonical document json).
 *
 * @param database the temp sqlite handle.
 * @returns the document seat.
 */
function documentseat(database: Database): GatewayDocumentSeat {
  database.exec(`
    CREATE TABLE IF NOT EXISTS ingest_documents (
      id              TEXT PRIMARY KEY,
      owner_id        TEXT NOT NULL,
      kind            TEXT NOT NULL,
      visibility      TEXT NOT NULL,
      name            TEXT NOT NULL,
      mix_pointer     TEXT NOT NULL,
      stems_pointer   TEXT NOT NULL,
      size_bytes      INTEGER NOT NULL,
      sha256          TEXT NOT NULL,
      samplerate      INTEGER NOT NULL DEFAULT 0,
      durationseconds REAL NOT NULL DEFAULT 0,
      pcmhash         INTEGER NOT NULL DEFAULT 0,
      ingestedat      TEXT NOT NULL,
      docjson         TEXT NOT NULL
    );
  `);
  const insert = database.prepare(
    `INSERT OR REPLACE INTO ingest_documents (id, owner_id, kind, visibility, name, mix_pointer, stems_pointer,
     size_bytes, sha256, samplerate, durationseconds, pcmhash, ingestedat, docjson)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const byid = database.prepare(`SELECT ${DOC_COLUMNS} FROM ingest_documents WHERE id = ?`);
  const all = database.prepare(`SELECT ${DOC_COLUMNS} FROM ingest_documents ORDER BY ingestedat DESC`);
  const drop = database.prepare("DELETE FROM ingest_documents WHERE id = ?");
  const stampof = (row: DocCellRow): IngestStampRow => ({
    id: row.id,
    ownerId: row.owner_id,
    kind: row.kind as IngestStampRow["kind"],
    visibility: row.visibility as IngestStampRow["visibility"],
    name: row.name,
    mixPointer: row.mix_pointer,
    stemsPointer: row.stems_pointer,
    sizeBytes: row.size_bytes,
    sha256: row.sha256,
    sampleRate: row.samplerate,
    durationSeconds: row.durationseconds,
    pcmhash: row.pcmhash,
    ingestedAt: row.ingestedat,
    document: JSON.parse(row.docjson) as IngestStampRow["document"],
  });
  return {
    async puttingestrow(row) {
      insert.run(
        row.id,
        row.ownerId,
        row.kind,
        row.visibility,
        row.name,
        row.mixPointer,
        row.stemsPointer,
        row.sizeBytes,
        row.sha256,
        row.sampleRate,
        row.durationSeconds,
        row.pcmhash,
        row.ingestedAt,
        JSON.stringify(row.document),
      );
      return { ok: true };
    },
    async getstampedrow(id) {
      const row = byid.get(id) as DocCellRow | undefined;
      return row ? stampof(row) : null;
    },
    async liststampedrows() {
      return (all.all() as DocCellRow[]).map(stampof);
    },
    async dropstampedrow(id) {
      const row = byid.get(id) as DocCellRow | undefined;
      if (!row) return null;
      drop.run(id);
      return stampof(row);
    },
  };
}

/**
 * The job ledger seat over a sqlite handle — the ingest_jobs row
 * functions the gateway worker lane wires (the same nine columns the
 * real ingestdb binds), recording every patch so the tests can pin the
 * walk order.
 *
 * @param database the temp sqlite handle.
 * @param walk the patch recorder.
 * @returns the job seat.
 */
function jobseat(database: Database, walk: GatewayJobPatch[]): GatewayJobSeat {
  migratejobsschema(database);
  const insert = database.prepare(
    `INSERT INTO ingest_jobs (id, owner_id, state, phase, fraction, error, document_id, created_at, finished_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       owner_id = excluded.owner_id, state = excluded.state, phase = excluded.phase,
       fraction = excluded.fraction, error = excluded.error, document_id = excluded.document_id,
       created_at = excluded.created_at, finished_at = excluded.finished_at`,
  );
  const byid = database.prepare(
    "SELECT id, owner_id, state, phase, fraction, error, document_id, created_at, finished_at FROM ingest_jobs WHERE id = ?",
  );
  const all = database.prepare(
    "SELECT id, owner_id, state, phase, fraction, error, document_id, created_at, finished_at FROM ingest_jobs ORDER BY created_at DESC, id DESC",
  );
  const owned = database.prepare(
    "SELECT id, owner_id, state, phase, fraction, error, document_id, created_at, finished_at FROM ingest_jobs WHERE owner_id = ? ORDER BY created_at DESC, id DESC",
  );
  const patchstatement = database.prepare(
    "UPDATE ingest_jobs SET state = ?, phase = ?, fraction = ?, error = ?, document_id = ?, finished_at = ? WHERE id = ?",
  );
  return {
    putjob(row) {
      insert.run(
        row.id,
        row.owner_id,
        row.state,
        row.phase,
        row.fraction,
        row.error,
        row.document_id,
        row.created_at,
        row.finished_at,
      );
    },
    getjob(id) {
      return (byid.get(id) as GatewayJobRow | undefined) ?? null;
    },
    updatejob(id, patch) {
      walk.push(patch);
      const standing = byid.get(id) as GatewayJobRow | undefined;
      if (!standing) return;
      patchstatement.run(
        patch.state ?? standing.state,
        patch.phase !== undefined ? patch.phase : standing.phase,
        patch.fraction ?? standing.fraction,
        patch.error !== undefined ? patch.error : standing.error,
        patch.document_id !== undefined ? patch.document_id : standing.document_id,
        patch.finished_at !== undefined ? patch.finished_at : standing.finished_at,
        id,
      );
    },
    listjobs(ownerId) {
      if (ownerId === undefined) return all.all() as GatewayJobRow[];
      return owned.all(ownerId) as GatewayJobRow[];
    },
  };
}

/**
 * The genre profile seat over a sqlite handle — the genre_profiles row
 * functions the miner lane wires (the same binding the minerserver suite
 * rides, keeping the shared gatewayenv honest for every walk).
 *
 * @param database the temp sqlite handle.
 * @returns the profile seat.
 */
function profileseat(database: Database): GatewayProfileSeat {
  migrategenreschema(database);
  return {
    async saveprofile(profile: GenreProfile) {
      return saveGenreProfile(profile, database);
    },
    async listprofiles() {
      return listGenreProfiles(database).map((row) => ({
        id: row.id,
        genre: row.genre,
        referenceIds: JSON.parse(row.reference_ids) as string[],
        profile: JSON.parse(row.profile_json) as GenreProfile,
        createdAt: row.created_at,
      }));
    },
  };
}

/**
 * Builds one full gateway environment over a sqlite handle and the memory
 * store — the same seats the gateway worker lane wires against the real
 * database, with a ticking clock and a ticking mint so the orders stay
 * deterministic.
 *
 * @param database the sqlite handle.
 * @returns the environment, the walk recorder and the store.
 */
function gatewayenv(database: Database): { env: GatewayEnv; walk: GatewayJobPatch[]; store: MemoryBlobStore } {
  const store = memoryblobstore();
  const walk: GatewayJobPatch[] = [];
  let clock = 0;
  let minted = 0;
  const env: GatewayEnv = {
    store,
    db: documentseat(database),
    jobs: jobseat(database, walk),
    profiles: profileseat(database),
    renderJobs: renderjobseat(database),
    tracks: rendertrackseat(database),
    now: () => new Date(BASE_TICK + clock++ * 1000).toISOString(),
    mint: () => mintid(BASE_TICK + minted++),
  };
  return { env, walk, store };
}

/** the temp directories the flow tests created (folded away at the end). */
const dirs: string[] = [];

/** One fresh temp sqlite database (the worker-test law). */
async function newdatabase(): Promise<Database> {
  const dir = await mkdtemp(path.join(tmpdir(), "debonair-gatewayapi-"));
  dirs.push(dir);
  return new Database(path.join(dir, "gateway.db"));
}

afterAll(async () => {
  await Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

/** One tiny parametrized document fixture (the visibility lane stamps these). */
function docfixture(name: string): IngestStampRow["document"] {
  const sampleRate = 8000;
  const mono = new Float32Array(sampleRate);
  for (let i = 0; i < mono.length; i++) {
    const t = i / sampleRate;
    mono[i] = 0.4 * Math.sin(2 * Math.PI * 220 * t);
  }
  return ingestPcm(mono, sampleRate, { name, at: "2026-01-01T00:00:00.000Z" });
}

/** One stamped row fixture (the shape the worker's db lane stamps). */
function stamprow(id: string, ownerId: string, visibility: "private" | "vitrine"): IngestStampRow {
  return {
    id,
    ownerId,
    kind: "upload",
    visibility,
    name: `vis ${id}`,
    mixPointer: mintid(BASE_TICK),
    stemsPointer: mintid(BASE_TICK),
    sizeBytes: 44100,
    sha256: SHA_FIXTURE,
    sampleRate: 8000,
    durationSeconds: 1,
    pcmhash: 424242,
    ingestedAt: "2026-01-01T00:00:00.000Z",
    document: docfixture(`vis ${id}`),
  };
}

/** The canonical pattern json the queue lane rides — a hand-built two-bar
 * plan (the contract gate parses it, the canonical bytes register, the
 * walk renders it fast): the kick on the bar heads, the snare on the
 * backbeats, the odd-step hats, a bass note under each kick and a short
 * lead line over the top. */
function queuePlan(): string {
  return serializePattern({
    schema: "debonair.pattern/1" as const,
    bpm: 120,
    root: 9,
    scale: "natural-minor" as const,
    bars: 2,
    mood: "dark trap",
    prompt: "gateway lane take",
    drums: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hat: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    notes: [
      { step: 0, pitch: 45, vel: 0.8, dur: 4, voice: "bass" },
      { step: 8, pitch: 45, vel: 0.8, dur: 4, voice: "bass" },
      { step: 0, pitch: 69, vel: 0.7, dur: 2, voice: "lead" },
      { step: 4, pitch: 72, vel: 0.6, dur: 2, voice: "lead" },
      { step: 12, pitch: 71, vel: 0.6, dur: 2, voice: "lead" },
    ],
    embedding: new Array<number>(32).fill(0),
  });
}

describe("the route table and the matcher", () => {
  let env: GatewayEnv;
  let database: Database;

  beforeAll(() => {
    database = new Database(":memory:");
    ({ env } = gatewayenv(database));
  });
  afterAll(() => database.close());

  it("carries the seventeen routes of the law in the family shape (the thirteen + the generate lane's four spellings)", () => {
    assert.deepEqual(routes, [
      { method: "POST", path: "/api/v1/ingest/upload", handler: "uploadIngest" },
      { method: "GET", path: "/api/v1/ingest/jobs/:id", handler: "getIngestJob" },
      { method: "GET", path: "/api/v1/ingest", handler: "listIngestShelf" },
      { method: "GET", path: "/api/v1/ingest/:id", handler: "getIngest" },
      { method: "DELETE", path: "/api/v1/ingest/:id", handler: "deleteIngest" },
      { method: "GET", path: "/api/v1/blob/:id", handler: "getBlob" },
      { method: "POST", path: "/api/v1/profiles/mine", handler: "mineProfile" },
      { method: "GET", path: "/api/v1/profiles", handler: "listProfiles" },
      { method: "GET", path: "/api/v1/profiles/:genre", handler: "getProfile" },
      { method: "POST", path: "/api/v1/render", handler: "queueRender" },
      { method: "GET", path: "/api/v1/render/jobs/:id", handler: "getRenderJob" },
      { method: "POST", path: "/api/v1/tracks", handler: "publishTrack" },
      { method: "GET", path: "/api/v1/tracks", handler: "listTracks" },
      { method: "POST", path: "/api/v1/generate/render", handler: "queueGenerateRender" },
      { method: "GET", path: "/api/v1/generate/jobs/:id", handler: "getGenerateJob" },
      { method: "POST", path: "/api/v1/tracks/:id/publish", handler: "publishTrackById" },
      { method: "GET", path: "/api/v1/vitrine", handler: "listVitrine" },
    ]);
  });

  it("matches every exact route", () => {
    const exact: readonly [string, string, string][] = [
      ["POST", "/api/v1/ingest/upload", "uploadIngest"],
      ["GET", "/api/v1/ingest/jobs/1", "getIngestJob"],
      ["GET", "/api/v1/ingest", "listIngestShelf"],
      ["GET", "/api/v1/ingest/1", "getIngest"],
      ["DELETE", "/api/v1/ingest/1", "deleteIngest"],
      ["GET", "/api/v1/blob/1", "getBlob"],
      ["POST", "/api/v1/profiles/mine", "mineProfile"],
      ["GET", "/api/v1/profiles", "listProfiles"],
      ["GET", "/api/v1/profiles/techno", "getProfile"],
      ["POST", "/api/v1/render", "queueRender"],
      ["GET", "/api/v1/render/jobs/9", "getRenderJob"],
      ["POST", "/api/v1/tracks", "publishTrack"],
      ["GET", "/api/v1/tracks", "listTracks"],
      ["POST", "/api/v1/generate/render", "queueGenerateRender"],
      ["GET", "/api/v1/generate/jobs/9", "getGenerateJob"],
      ["POST", "/api/v1/tracks/9/publish", "publishTrackById"],
      ["GET", "/api/v1/vitrine", "listVitrine"],
    ];
    for (const [method, pathname, handler] of exact) {
      const verdict = matchroute(method, pathname);
      assert.equal(verdict.kind, "routed", `${method} ${pathname} must route`);
      if (verdict.kind === "routed") assert.equal(verdict.route.handler, handler);
    }
  });

  it("extracts the path params", () => {
    const job = matchroute("GET", "/api/v1/ingest/jobs/424242");
    assert.equal(job.kind, "routed");
    if (job.kind === "routed") {
      assert.equal(job.route.handler, "getIngestJob");
      assert.deepEqual(job.params, { id: "424242" });
    }
    const doc = matchroute("GET", "/api/v1/ingest/998877");
    assert.equal(doc.kind, "routed");
    if (doc.kind === "routed") assert.deepEqual(doc.params, { id: "998877" });
    const blob = matchroute("GET", "/api/v1/blob/1122334455");
    assert.equal(blob.kind, "routed");
    if (blob.kind === "routed") assert.deepEqual(blob.params, { id: "1122334455" });
  });

  it("keeps the jobs route ahead of the document :id route (the table order is the law)", () => {
    const verdict = matchroute("GET", "/api/v1/ingest/jobs/77");
    assert.equal(verdict.kind, "routed");
    if (verdict.kind === "routed") {
      assert.equal(verdict.route.handler, "getIngestJob");
      assert.equal(verdict.route.path, "/api/v1/ingest/jobs/:id");
    }
  });

  it("normalizes the method case (any case rides)", () => {
    assert.equal(matchroute("get", "/api/v1/ingest").kind, "routed");
    assert.equal(matchroute(" post ", "/api/v1/ingest/upload").kind, "routed");
  });

  it("refuses the foreign shapes and the empty param (matchpath is strict)", () => {
    assert.equal(matchpath("/api/v1/ingest/:id", "/api/v1/ingest/"), null);
    assert.equal(matchpath("/api/v1/ingest", "/api/v1/ingest/x"), null);
    assert.equal(matchpath("/api/v1/ingest", "/api/v1/ingest/"), null);
    assert.equal(matchpath("/api/v1/ingest/:id", "/api/v1/blob/1"), null);
    assert.deepEqual(matchpath("/api/v1/ingest/:id", "/api/v1/ingest/abc"), { id: "abc" });
  });

  it("answers the 405 shape when the method misses (dispatch)", async () => {
    const answer = errof(await dispatch(env, request("DELETE", "/api/v1/ingest")));
    assert.equal(answer.status, 405);
    assert.equal(answer.error.code, "method-not-allowed");
    assert.ok(answer.error.message.includes("DELETE"));
    const shelf = errof(await dispatch(env, request("POST", "/api/v1/ingest")));
    assert.equal(shelf.status, 405);
    assert.equal(shelf.error.code, "method-not-allowed");
  });

  it("answers the 404 shape when no route matches (dispatch)", async () => {
    const answer = errof(await dispatch(env, request("GET", "/api/v1/nothing")));
    assert.equal(answer.status, 404);
    assert.equal(answer.error.code, "not-found");
    const trailing = errof(await dispatch(env, request("GET", "/api/v1/ingest/")));
    assert.equal(trailing.status, 404);
    assert.equal(trailing.error.code, "not-found");
  });
});

describe("the upload validation lanes (the vault body law)", () => {
  let env: GatewayEnv;
  let database: Database;

  beforeAll(() => {
    database = new Database(":memory:");
    ({ env } = gatewayenv(database));
  });
  afterAll(() => database.close());

  it("refuses a request with no body (bad-request)", async () => {
    const answer = errof(await dispatch(env, request("POST", "/api/v1/ingest/upload")));
    assert.equal(answer.status, 400);
    assert.equal(answer.error.code, "bad-request");
  });

  it("refuses a json body without the bytes field (bad-request)", async () => {
    const answer = await refuseupload(env, { name: SOURCE_NAME, ownerId: OWNER_ID });
    assert.equal(answer.status, 400);
    assert.equal(answer.error.code, "bad-request");
  });

  it("refuses dishonest base64 and empty bytes (bad-request)", async () => {
    for (const bad of ["!!!!", "abc", "a=cd", "abcd=", ""]) {
      const answer = await refuseupload(env, { bytes: bad, name: SOURCE_NAME, ownerId: OWNER_ID });
      assert.equal(answer.status, 400);
      assert.equal(answer.error.code, "bad-request", `the bytes "${bad}" must fail the body law`);
    }
  });

  it("refuses a missing name (bad-request)", async () => {
    const answer = await refuseupload(env, {
      bytes: Buffer.from(sourceWav).toString("base64"),
      ownerId: OWNER_ID,
    });
    assert.equal(answer.status, 400);
    assert.equal(answer.error.code, "bad-request");
  });

  it("refuses a malformed owner pointer (bad-owner)", async () => {
    for (const bad of ["nope", "", "0", "-7", "12.5"]) {
      const answer = await refuseupload(env, { bytes: "AAAA", name: SOURCE_NAME, ownerId: bad });
      assert.equal(answer.status, 400);
      assert.equal(answer.error.code, "bad-owner", `the owner "${bad}" must fail the mint law`);
    }
  });

  it("refuses a kind off the enum and a visibility off the lanes (bad-request)", async () => {
    const kind = await refuseupload(env, { bytes: "AAAA", name: SOURCE_NAME, ownerId: OWNER_ID, kind: "other" });
    assert.equal(kind.status, 400);
    assert.equal(kind.error.code, "bad-request");
    const visibility = await refuseupload(env, {
      bytes: "AAAA",
      name: SOURCE_NAME,
      ownerId: OWNER_ID,
      visibility: "public",
    });
    assert.equal(visibility.status, 400);
    assert.equal(visibility.error.code, "bad-request");
  });

  it("accepts the raw body lane with the facts in the query (the deposit law)", async () => {
    const answer = await dispatch(
      env,
      request("POST", "/api/v1/ingest/upload", { name: SOURCE_NAME, ownerId: OWNER_ID }, null, sourceWav),
    );
    const value = valueof<{ jobId: string }>(answer);
    assert.equal(answer.status, 201);
    const row = env.jobs.getjob(value.jobId);
    assert.ok(row, "the raw lane registers the row");
    assert.equal(row.state, "queued");
    assert.equal(row.owner_id, OWNER_ID);
    assert.equal(row.phase, null);
    assert.equal(row.fraction, 0);
    assert.ok(row.created_at.length > 0);
  });

  it("refuses a malformed owner on the raw lane too (bad-owner)", async () => {
    const answer = await refuseuploadraw(env, { name: SOURCE_NAME, ownerId: "nope" });
    assert.equal(answer.status, 400);
    assert.equal(answer.error.code, "bad-owner");
  });
});

describe("the upload flow end to end (the memory store + a temp sqlite)", () => {
  let database: Database;
  let env: GatewayEnv;
  let store: MemoryBlobStore;
  let walk: GatewayJobPatch[];
  let jobId = "";
  let queued: IngestJobValue;
  let run: IngestRunValue;

  beforeAll(async () => {
    database = await newdatabase();
    ({ env, walk, store } = gatewayenv(database));
    const upload = await dispatch(
      env,
      request(
        "POST",
        "/api/v1/ingest/upload",
        {},
        {
          bytes: Buffer.from(sourceWav).toString("base64"),
          name: SOURCE_NAME,
          ownerId: OWNER_ID,
          kind: "upload",
          visibility: "vitrine",
        },
      ),
    );
    assert.equal(upload.status, 201);
    jobId = valueof<{ jobId: string }>(upload).jobId;
    // the queued row lands before any run starts (the poll lane sees it)
    queued = valueof<IngestJobValue>(await dispatch(env, request("GET", `/api/v1/ingest/jobs/${jobId}`)));
    run = valueof(await startJob(env, jobId, runpayload));
  });
  afterAll(() => database.close());

  it("answers the minted job id with the queued row landing first", () => {
    assert.match(jobId, /^[1-9]\d{0,19}$/);
    assert.equal(queued.id, jobId);
    assert.equal(queued.ownerId, OWNER_ID);
    assert.equal(queued.state, "queued");
    assert.equal(queued.phase, null);
    assert.equal(queued.fraction, 0);
    assert.equal(queued.error, null);
    assert.equal(queued.documentId, null);
    assert.ok(queued.createdAt.length > 0);
    assert.equal(queued.finishedAt, null);
  });

  it("walks the ledger running → done with ascending fractions and the final phase", () => {
    assert.equal(walk[0].state, "running");
    assert.equal(walk[0].fraction, 0);
    const phases = walk.slice(1, 7).map((patch) => patch.phase);
    assert.deepEqual(phases, ["decode", "separate", "analyze", "segment", "store", "row"]);
    const fractions = walk.slice(1, 7).map((patch) => patch.fraction);
    for (let index = 0; index < fractions.length; index++) {
      assert.ok(fractions[index] > 0 && fractions[index] <= 1, `fraction ${fractions[index]}`);
      if (index > 0) assert.ok(fractions[index] > fractions[index - 1], "ascending");
    }
    assert.equal(fractions[5], 1);
    const done = walk[7];
    assert.equal(done.state, "done");
    assert.equal(done.fraction, 1);
    assert.equal(done.document_id, run.documentId);
    assert.ok(done.finished_at);
  });

  it("lands the done row with the document id, the final phase and the finish", async () => {
    const row = valueof<IngestJobValue>(await dispatch(env, request("GET", `/api/v1/ingest/jobs/${jobId}`)));
    assert.equal(row.id, jobId);
    assert.equal(row.state, "done");
    assert.equal(row.phase, "row");
    assert.equal(row.fraction, 1);
    assert.equal(row.error, null);
    assert.equal(row.documentId, run.documentId);
    assert.equal(row.ownerId, OWNER_ID);
    assert.ok(row.createdAt.length > 0);
    assert.ok(row.finishedAt !== null && row.finishedAt >= row.createdAt);
  });

  it("stamped the document row through the db lane (the identity chain)", () => {
    const cell = database
      .prepare(
        "SELECT owner_id, kind, visibility, name, mix_pointer, stems_pointer, size_bytes, sha256, samplerate, durationseconds FROM ingest_documents WHERE id = ?",
      )
      .get(run.documentId ?? "") as
      | {
          owner_id: string;
          kind: string;
          visibility: string;
          name: string;
          mix_pointer: string;
          stems_pointer: string;
          size_bytes: number;
          sha256: string;
          samplerate: number;
          durationseconds: number;
        }
      | undefined;
    assert.ok(cell, "the stamped row exists");
    assert.equal(cell.owner_id, OWNER_ID);
    assert.equal(cell.kind, "upload");
    assert.equal(cell.visibility, "vitrine");
    assert.equal(cell.name, DISPLAY_NAME);
    assert.equal(cell.mix_pointer, run.pointers.mix.id);
    assert.equal(cell.stems_pointer, run.pointers.manifest.id);
    assert.equal(cell.size_bytes, sourceWav.length);
    assert.equal(cell.sha256, sourceSha);
    assert.equal(cell.samplerate, SAMPLE_RATE);
    assert.equal(cell.durationseconds, SECONDS);
  });

  it("the read answers the full stamped row and the document json", async () => {
    const row = valueof<IngestStampRow>(await dispatch(env, request("GET", `/api/v1/ingest/${run.documentId}`)));
    assert.equal(row.id, run.documentId);
    assert.equal(row.ownerId, OWNER_ID);
    assert.equal(row.name, DISPLAY_NAME);
    assert.equal(row.document.schema, INGEST_SCHEMA_VERSION);
    assert.equal(row.document.name, DISPLAY_NAME);
    assert.equal(row.document.sampleRate, SAMPLE_RATE);
    assert.equal(row.document.durationSeconds, SECONDS);
    assert.equal(row.document.stems.length, 2);
  });

  it("the shelf lists the vitrine row", async () => {
    const shelf = valueof<{ records: IngestStampRow[] }>(await dispatch(env, request("GET", "/api/v1/ingest")));
    const ids = shelf.records.map((row) => row.id);
    assert.ok(ids.includes(run.documentId ?? ""), "the shelf lists the ingested document");
    const listed = shelf.records.find((row) => row.id === run.documentId);
    assert.ok(listed);
    assert.equal(listed.visibility, "vitrine");
    assert.equal(listed.document.name, DISPLAY_NAME);
  });

  it("the blob route streams the mix bytes with the audio/wav mime", async () => {
    const stream = valueof<BlobStreamValue>(await dispatch(env, request("GET", `/api/v1/blob/${run.pointers.mix.id}`)));
    assert.equal(stream.mime, "audio/wav");
    assert.equal(stream.pointer.kind, "audio/wav");
    assert.equal(stream.bytes.length, stream.pointer.bytes);
    assert.equal(createHash("sha256").update(stream.bytes).digest("hex"), stream.pointer.sha256);
    const decoded = parseWav(stream.bytes);
    assert.ok(decoded.ok);
    if (decoded.ok) {
      assert.equal(decoded.channels, 1);
      assert.equal(decoded.sampleRate, SAMPLE_RATE);
      assert.equal(decoded.frames, sourceMono.length);
    }
  });

  it("refuses a re-run of the landed job (conflict)", async () => {
    const answer = errof(await startJob(env, jobId, runpayload));
    assert.equal(answer.status, 409);
    assert.equal(answer.error.code, "conflict");
  });

  it("the delete removes the row and every blob (the manifest stems ride along)", async () => {
    const drop = valueof<{ removed: boolean; id: string }>(
      await dispatch(env, request("DELETE", `/api/v1/ingest/${run.documentId}`)),
    );
    assert.deepEqual(drop, { removed: true, id: run.documentId });
    const gone = errof(await dispatch(env, request("GET", `/api/v1/ingest/${run.documentId}`)));
    assert.equal(gone.status, 404);
    assert.equal(gone.error.code, "not-found");
    const shelf = valueof<{ records: IngestStampRow[] }>(await dispatch(env, request("GET", "/api/v1/ingest")));
    assert.ok(!shelf.records.some((row) => row.id === run.documentId), "the shelf no longer lists it");
    assert.equal((await store.list()).length, 0, "the mix, both stems and the manifest all folded away");
    const job = valueof<IngestJobValue>(await dispatch(env, request("GET", `/api/v1/ingest/jobs/${jobId}`)));
    assert.equal(job.state, "done", "the ledger row stays as the audit trail");
  });
});

describe("the failure lane — garbage bytes land failed with the honest code", () => {
  let database: Database;
  let env: GatewayEnv;
  let jobId = "";

  beforeAll(async () => {
    database = await newdatabase();
    ({ env } = gatewayenv(database));
    const upload = await dispatch(
      env,
      request(
        "POST",
        "/api/v1/ingest/upload",
        {},
        { bytes: Buffer.from(garbage).toString("base64"), name: SOURCE_NAME, ownerId: OWNER_ID },
      ),
    );
    jobId = valueof<{ jobId: string }>(upload).jobId;
    const answer = errof(
      await startJob(env, jobId, { bytes: garbage, name: SOURCE_NAME, kind: "upload", visibility: "private" }),
    );
    assert.equal(answer.status, 400);
    assert.equal(answer.error.code, "bad-request");
    assert.ok(
      answer.error.message.startsWith("bad-riff"),
      `the message carries the worker code: ${answer.error.message}`,
    );
  });
  afterAll(() => database.close());

  it("lands the failed row with the honest error code and the finish", async () => {
    const row = valueof<IngestJobValue>(await dispatch(env, request("GET", `/api/v1/ingest/jobs/${jobId}`)));
    assert.equal(row.state, "failed");
    assert.ok(row.error?.startsWith("bad-riff"), `the ledger error: ${row.error}`);
    assert.equal(row.documentId, null);
    assert.equal(row.fraction, 0, "nothing completed — the decode refused first");
    assert.equal(row.phase, null);
    assert.ok(row.finishedAt !== null);
  });

  it("stamped no document row", () => {
    const counted = database.prepare("SELECT COUNT(*) AS total FROM ingest_documents").get() as { total: number };
    assert.equal(counted.total, 0);
  });
});

describe("the visibility law — the vitrine shelf and the owner's private lane", () => {
  const OWNER_A = mintid();
  const OWNER_B = mintid();
  let database: Database;
  let env: GatewayEnv;

  beforeAll(async () => {
    database = await newdatabase();
    ({ env } = gatewayenv(database));
    await env.db.puttingestrow(stamprow("vis-a-private", OWNER_A, "private"));
    await env.db.puttingestrow(stamprow("vis-b-vitrine", OWNER_B, "vitrine"));
    await env.db.puttingestrow(stamprow("vis-a-vitrine", OWNER_A, "vitrine"));
  });
  afterAll(() => database.close());

  it("lists only the vitrine rows for everyone", async () => {
    const shelf = valueof<{ records: IngestStampRow[] }>(await dispatch(env, request("GET", "/api/v1/ingest")));
    const ids = shelf.records.map((row) => row.id).sort();
    assert.deepEqual(ids, ["vis-a-vitrine", "vis-b-vitrine"]);
  });

  it("rides the owner's private rows when the ownerId query carries", async () => {
    const own = valueof<{ records: IngestStampRow[] }>(
      await dispatch(env, request("GET", "/api/v1/ingest", { ownerId: OWNER_A })),
    );
    const ids = own.records.map((row) => row.id).sort();
    assert.deepEqual(ids, ["vis-a-private", "vis-a-vitrine", "vis-b-vitrine"]);
    const other = valueof<{ records: IngestStampRow[] }>(
      await dispatch(env, request("GET", "/api/v1/ingest", { ownerId: OWNER_B })),
    );
    assert.deepEqual(
      other.records.map((row) => row.id).sort(),
      ["vis-a-vitrine", "vis-b-vitrine"],
      "the owner without a private row sees the vitrine alone",
    );
  });

  it("refuses a malformed owner query (bad-owner)", async () => {
    const answer = errof(await dispatch(env, request("GET", "/api/v1/ingest", { ownerId: "nope" })));
    assert.equal(answer.status, 400);
    assert.equal(answer.error.code, "bad-owner");
  });
});

describe("the render and the publish lane (the vitrine answers)", () => {
  const OWNER_C = mintid();
  const OWNER_D = mintid();
  let database: Database;
  let env: GatewayEnv;
  let store: MemoryBlobStore;
  let jobId = "";
  let trackId = "";
  let wavPointer = "";
  let run: RenderRunValue;

  beforeAll(async () => {
    database = await newdatabase();
    ({ env, store } = gatewayenv(database));
    // the shelf the vitrine list serves beside the published take: one
    // vitrine reference, one private reference (the private never lists)
    await env.db.puttingestrow(stamprow("pub-a-vitrine", OWNER_D, "vitrine"));
    await env.db.puttingestrow(stamprow("pub-b-private", OWNER_D, "private"));
    // the loop closes: the plan queues, the walk renders, the take lands
    const queued = valueof<{ jobId: string }>(
      await dispatch(env, request("POST", "/api/v1/render", {}, { plan: queuePlan(), ownerId: OWNER_C })),
    );
    jobId = queued.jobId;
    run = valueof(await startRenderLaneJob(env, jobId));
    trackId = run.trackId ?? "";
    wavPointer = run.wavPointer;
  });
  afterAll(() => database.close());

  it("queues the plan under the contract gate and lands the take private", async () => {
    assert.match(jobId, /^[1-9]\d{0,19}$/);
    assert.equal(run.state, "done");
    assert.ok(run.bytes > 44, "the wav carries frames past the header");
    assert.ok(run.durationSeconds > 0);
    assert.match(trackId, /^[1-9]\d{0,19}$/);
    const row = database
      .prepare(
        "SELECT name, genre, seconds, status, CAST(owner_id AS TEXT) AS owner_id, CAST(wav_pointer AS TEXT) AS wav_pointer, visibility FROM tracks WHERE id = ?",
      )
      .get(trackId) as
      | {
          name: string;
          genre: string;
          seconds: number;
          status: string;
          owner_id: string;
          wav_pointer: string;
          visibility: string;
        }
      | undefined;
    assert.ok(row, "the walk stamped the track row");
    assert.equal(row.name, "Gateway lane take");
    assert.equal(row.genre, "dark trap");
    assert.equal(row.status, "ready");
    assert.equal(row.owner_id, OWNER_C);
    assert.equal(row.wav_pointer, wavPointer);
    assert.equal(row.visibility, "private", "a fresh render lands private — the publish lane moves it");
  });

  it("answers the walk through the render job route (the poll lane)", async () => {
    const row = valueof<RenderJobValue>(await dispatch(env, request("GET", `/api/v1/render/jobs/${jobId}`)));
    assert.equal(row.id, jobId);
    assert.equal(row.state, "done");
    assert.equal(row.phase, "store");
    assert.equal(row.fraction, 1);
    assert.equal(row.error, null);
    assert.equal(row.wavPointer, wavPointer);
    assert.equal(row.trackPointer, trackId);
    assert.ok(row.finishedAt !== null);
    const missing = errof(await dispatch(env, request("GET", "/api/v1/render/jobs/999")));
    assert.equal(missing.status, 404);
    assert.equal(missing.error.code, "not-found");
  });

  it("streams the landed wav through the blob route (the download lane)", async () => {
    const stream = valueof<BlobStreamValue>(await dispatch(env, request("GET", `/api/v1/blob/${wavPointer}`)));
    assert.equal(stream.mime, "audio/wav");
    const held = await store.get(wavPointer);
    assert.ok(held.ok && held.data !== null, "the store holds the landed wav");
    assert.deepEqual(
      Array.from(stream.bytes),
      Array.from(held.data as Uint8Array),
      "the round trip answers the store bytes",
    );
    assert.equal(stream.pointer.bytes, run.bytes);
    assert.equal(wavInfo(stream.bytes).sampleRate, 48000);
  });

  it("publishes the take onto the vitrine under the owner law", async () => {
    const published = valueof<VitrineTrackValue>(
      await dispatch(env, request("POST", "/api/v1/tracks", {}, { trackId, ownerId: OWNER_C })),
    );
    assert.equal(published.kind, "render");
    assert.equal(published.id, trackId);
    assert.equal(published.name, "Gateway lane take");
    assert.equal(published.wavPointer, wavPointer);
    assert.equal(published.ownerId, OWNER_C);
  });

  it("refuses the publish of another owner — the private stays private", async () => {
    const answer = errof(await dispatch(env, request("POST", "/api/v1/tracks", {}, { trackId, ownerId: OWNER_D })));
    assert.equal(answer.status, 409);
    assert.equal(answer.error.code, "conflict");
  });

  it("refuses the publish of a missing track and a malformed id", async () => {
    const missing = errof(
      await dispatch(env, request("POST", "/api/v1/tracks", {}, { trackId: "88888888888888888888", ownerId: OWNER_C })),
    );
    assert.equal(missing.status, 404);
    assert.equal(missing.error.code, "not-found");
    const malformed = errof(
      await dispatch(env, request("POST", "/api/v1/tracks", {}, { trackId: "nope", ownerId: OWNER_C })),
    );
    assert.equal(malformed.status, 400);
    assert.equal(malformed.error.code, "bad-request");
  });

  it("answers the standing vitrine row on a re-publish (idempotent)", async () => {
    const again = valueof<VitrineTrackValue>(
      await dispatch(env, request("POST", "/api/v1/tracks", {}, { trackId, ownerId: OWNER_C })),
    );
    assert.equal(again.id, trackId);
    assert.equal(again.wavPointer, wavPointer);
  });

  it("lists the vitrine rows beside the vitrine references — the private never lists", async () => {
    const shelf = valueof<{ records: VitrineTrackValue[] }>(await dispatch(env, request("GET", "/api/v1/tracks")));
    const ids = shelf.records.map((row) => `${row.kind}:${row.id}`);
    assert.ok(ids.includes(`render:${trackId}`), "the published take lists");
    assert.ok(ids.includes("reference:pub-a-vitrine"), "the vitrine reference lists beside it");
    assert.ok(!ids.includes("reference:pub-b-private"), "the private reference never lists");
    const render = shelf.records.find((row) => row.id === trackId);
    assert.ok(render);
    assert.equal(render.kind, "render");
    assert.equal(render.genre, "dark trap");
    // the published law: the vitrine reference (2026-01-01) rides ahead of
    // the render stamp (the ticking clock of this suite) — newest first
    assert.equal(shelf.records[0]?.kind, "reference");
    assert.equal(shelf.records[shelf.records.length - 1]?.id, trackId);
  });

  it("refuses a second walk of the landed job (the one-shot law)", async () => {
    const answer = errof(await startRenderLaneJob(env, jobId));
    assert.equal(answer.status, 409);
    assert.equal(answer.error.code, "conflict");
  });

  it("refuses a foreign plan at the queue (the contract gate)", async () => {
    const answer = errof(
      await dispatch(
        env,
        request(
          "POST",
          "/api/v1/render",
          {},
          { plan: JSON.stringify({ schema: "debonair.pattern/2" }), ownerId: OWNER_C },
        ),
      ),
    );
    assert.equal(answer.status, 400);
    assert.equal(answer.error.code, "bad-request");
  });
});

describe("the ingest_jobs ledger (the row functions round trip)", () => {
  const JOB_ID = "gatewayapi-ledger-1";
  const OWNER = mintid();
  const OTHER_OWNER = mintid();

  it("registers and reads back the queued row", () => {
    putjob({
      id: JOB_ID,
      owner_id: OWNER,
      state: "queued",
      phase: null,
      fraction: 0,
      error: null,
      document_id: null,
      created_at: "2026-01-01T00:00:00.000Z",
      finished_at: null,
    });
    const row = getjob(JOB_ID);
    assert.ok(row, "the row must read back");
    assert.equal(row.id, JOB_ID);
    assert.equal(row.owner_id, OWNER);
    assert.equal(row.state, "queued");
    assert.equal(row.phase, null);
    assert.equal(row.fraction, 0);
    assert.equal(row.error, null);
    assert.equal(row.document_id, null);
    assert.equal(row.created_at, "2026-01-01T00:00:00.000Z");
    assert.equal(row.finished_at, null);
  });

  it("patches the walk without touching the standing fields", () => {
    assert.equal(updatejob(JOB_ID, { state: "running", fraction: 0 }), true);
    let row = getjob(JOB_ID);
    assert.ok(row);
    assert.equal(row.state, "running");
    assert.equal(row.phase, null, "the phase the patch omits keeps its standing value");
    assert.equal(updatejob(JOB_ID, { phase: "decode", fraction: 1 / 6 }), true);
    row = getjob(JOB_ID);
    assert.ok(row);
    assert.equal(row.phase, "decode");
    assert.equal(row.state, "running", "the state the patch omits keeps its standing value");
    assert.equal(
      updatejob(JOB_ID, { state: "done", fraction: 1, document_id: "doc-1", finished_at: "2026-01-01T00:00:09.000Z" }),
      true,
    );
    row = getjob(JOB_ID);
    assert.ok(row);
    assert.equal(row.state, "done");
    assert.equal(row.fraction, 1);
    assert.equal(row.phase, "decode");
    assert.equal(row.document_id, "doc-1");
    assert.equal(row.finished_at, "2026-01-01T00:00:09.000Z");
  });

  it("answers false and null when the id answers nothing", () => {
    assert.equal(updatejob("no-such-job", { state: "done" }), false);
    assert.equal(getjob("no-such-job"), null);
  });

  it("lists the owner's jobs and keeps the owners apart", () => {
    putjob({
      id: mintid(),
      owner_id: OTHER_OWNER,
      state: "queued",
      phase: null,
      fraction: 0,
      error: null,
      document_id: null,
      created_at: "2026-01-02T00:00:00.000Z",
      finished_at: null,
    });
    const owned = listjobs(OWNER);
    assert.equal(owned.length, 1, "a fresh owner sees exactly its own row");
    assert.equal(owned[0].id, JOB_ID);
    const every = listjobs();
    assert.ok(every.some((row) => row.id === JOB_ID));
    assert.ok(every.some((row) => row.owner_id === OTHER_OWNER));
    const first = every.findIndex((row) => row.owner_id === OTHER_OWNER);
    const second = every.findIndex((row) => row.id === JOB_ID);
    assert.ok(first !== -1 && second !== -1);
    assert.ok(first < second, "the later registration lists first (newest first)");
  });

  it("migrates a fresh handle with the nine columns and stays idempotent", () => {
    const fresh = new Database(":memory:");
    try {
      migratejobsschema(fresh);
      migratejobsschema(fresh);
      const columns = (fresh.pragma("table_info(ingest_jobs)") as { name: string }[]).map((column) => column.name);
      assert.deepEqual(columns, [
        "id",
        "owner_id",
        "state",
        "phase",
        "fraction",
        "error",
        "document_id",
        "created_at",
        "finished_at",
      ]);
    } finally {
      fresh.close();
    }
  });

  it("rides parameterized sql only — no interpolated statement ever assembles", () => {
    const source = readFileSync(new URL("../ingestdb.ts", import.meta.url), "utf8");
    assert.ok(!source.includes("${"), "no template interpolation rides the db module (the house database law)");
    assert.ok(source.includes("CREATE TABLE IF NOT EXISTS ingest_jobs"), "the ledger migration lands its table");
  });
});
