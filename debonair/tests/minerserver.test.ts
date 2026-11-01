// # minerserver.test — the miner lane contract of the debonair gateway
// (waves PV3.004 + PV3.005): the three route rows ride the table with the
// mine literal ahead of the profile :genre param (the table order is the
// law), the mine validation lanes answer the machine codes of their facts
// (the genre key of the fifteen, the owner pointer, the json body), the
// mine walk runs end to end on a temp sqlite with seeded reference
// documents (the collect reads the genre's references alone — the kind
// "upload" rows and the foreign genres sit the walk out — the mine
// answers the profile document, the store lands the genre_profiles row,
// the ledger walks running → collect → mine → store → done with the
// profile row id in the document_id column, the routes answer the landed
// row end to end), the empty-set lane lands failed with the honest
// code (a genre with no references answers no profile, never a zero
// one), a re-run refuses conflict and a bad payload genre leaves the row
// queued, the vitrine law answers the newest row per genre (a retrain
// lands a fresh row, the list folds to the freshest), and the home card
// data rides the catalog seam: the offline seed answers the fifteen
// genres of the miner's own vocabulary, each untrained — trainedOn 0 and
// the honest empty numbers, never a fake figure — and the accessor
// answers memoized, write-free. runnable with vitest:
//   pnpm vitest run tests/minerserver.test.ts
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterAll, beforeAll, describe, it } from "vitest";
import { mintid } from "../bigintids.ts";
import type { MemoryBlobStore } from "../blobstore.ts";
import { memoryblobstore } from "../blobstore.ts";
import { listGenreProfileCards } from "../catalog.ts";
import type {
  GatewayAnswer,
  GatewayDocumentSeat,
  GatewayEnv,
  GatewayErr,
  GatewayJobPatch,
  GatewayJobRow,
  GatewayJobSeat,
  GatewayProfileRow,
  GatewayProfileSeat,
  GatewayRequest,
  IngestJobValue,
  MinerRunValue,
} from "../gatewayapi.ts";
import { dispatch, matchroute, startMinerJob } from "../gatewayapi.ts";
import { GENRES } from "../genrematrix.ts";
import type { IngestDocument, IngestSegment } from "../ingest.ts";
import { INGEST_SCHEMA_VERSION } from "../ingest.ts";
// the seat answers before the module load: this suite rides its own
// database file so the parallel vitest workers never share one wal
// writer (the SQLITE_BUSY lesson — every suite its own seat).
process.env.DATABASE_URL = "file:./local.minerserver.db";

const ingestdbmodule = await import("../ingestdb.ts");
const { listGenreProfiles, migrategenreschema, migratejobsschema } = ingestdbmodule;
import type { IngestStampRow } from "../ingestworker.ts";
import { PROFILE_GENRE_KEYS, validateGenreProfile } from "../patternminer.ts";
import { seedGenreProfileCards } from "../seed.ts";

/** The pinned base tick the clocks and the mints walk from. */
const BASE_TICK = 1_700_000_000_000;
/** The owner id of every test mine (the minted decimal string the rows stamp). */
const OWNER_ID = mintid();
/** A 64-hex sha fixture (the reference rows stamp it). */
const SHA_FIXTURE = "5e7f1c9e2b84d05f6a1e93c47d82b5a6f0c1d2e34f5a6b7c8d9e0f1a2b3c4d5e";
/** The id of the first techno reference (the mint order keeps it the lesser). */
const ALPHA_ID = mintid(BASE_TICK + 1);
/** The id of the second techno reference. */
const BETA_ID = mintid(BASE_TICK + 2);
/** The id of the trap reference (the foreign genre). */
const GAMMA_ID = mintid(BASE_TICK + 3);
/** The id of the techno upload (the kind that sits the walk out). */
const DELTA_ID = mintid(BASE_TICK + 4);

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
 * to the reference-law table (the same binding the gatewayapi suite
 * rides).
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
 * functions the gateway worker lane wires, recording every patch so the
 * tests can pin the walk order.
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
    listjobs() {
      return database
        .prepare(
          "SELECT id, owner_id, state, phase, fraction, error, document_id, created_at, finished_at FROM ingest_jobs ORDER BY created_at DESC, id DESC",
        )
        .all() as GatewayJobRow[];
    },
  };
}

/**
 * The genre profile seat over a sqlite handle — the genre_profiles row
 * functions the miner lane wires (the parsed rows the routes serve).
 *
 * @param database the temp sqlite handle.
 * @returns the profile seat.
 */
function profileseat(database: Database): GatewayProfileSeat {
  migrategenreschema(database);
  return {
    async saveprofile(profile) {
      const json = JSON.stringify({
        schema: profile.schema,
        genre: profile.genre,
        referenceIds: profile.referenceIds,
        trainedOn: profile.trainedOn,
        bpm: profile.bpm,
        keyPool: profile.keyPool,
        onsetDensity: profile.onsetDensity,
        bandBalance: profile.bandBalance,
        loudness: profile.loudness,
        centroid: profile.centroid,
        chromaProfile: profile.chromaProfile,
        updatedAt: profile.updatedAt,
      });
      const result = database
        .prepare("INSERT INTO genre_profiles (genre, reference_ids, profile_json) VALUES (?, ?, ?)")
        .run(profile.genre, JSON.stringify(profile.referenceIds), json);
      return Number(result.lastInsertRowid);
    },
    async listprofiles() {
      const rows = database
        .prepare("SELECT id, genre, reference_ids, profile_json, created_at FROM genre_profiles ORDER BY id DESC")
        .all() as { id: number; genre: string; reference_ids: string; profile_json: string; created_at: string }[];
      return rows.map((row) => ({
        id: row.id,
        genre: row.genre,
        referenceIds: JSON.parse(row.reference_ids) as string[],
        profile: JSON.parse(row.profile_json) as GatewayProfileRow["profile"],
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
    now: () => new Date(BASE_TICK + 10_000 + clock++ * 1000).toISOString(),
    mint: () => mintid(BASE_TICK + 20_000 + minted++),
  };
  return { env, walk, store };
}

/** the temp directories the flow tests created (folded away at the end). */
const dirs: string[] = [];

/** One fresh temp sqlite database (the worker-test law). */
async function newdatabase(): Promise<Database> {
  const dir = await mkdtemp(path.join(tmpdir(), "debonair-minerserver-"));
  dirs.push(dir);
  return new Database(path.join(dir, "miner.db"));
}

afterAll(async () => {
  await Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

// ---------------------------------------------------------------------------
// the reference fixtures (the honest construction: the fields the miner reads)
// ---------------------------------------------------------------------------

/** One synthetic segment of a reference fixture: the bands carry the
 * balance the profile surfaces, the chroma peaks on the tonic. */
function refsegment(s: number, bands: readonly number[], tonic: number): IngestSegment {
  const chroma = new Array<number>(12).fill(0.02);
  chroma[tonic] = 0.5;
  return {
    s,
    rms: 0.2,
    peak: 0.5,
    zcr: 0.02,
    cent: 1000,
    flat: 0.1,
    beat: 0.05,
    onsets: 2,
    bands: [...bands],
    note: "",
    chroma,
  };
}

/** The patch refdoc reads: the numbers the miner reads, pinned. */
interface RefPatch {
  bpm: number;
  tonic: number;
  integrated: number;
  bands: readonly number[];
  ingestedAt: string;
}

/** One synthetic reference document with the pinned numbers the miner
 * reads (the mix report and the mix segments carry the genre's figures,
 * the stems ride empty — the separation layer is not the profile's read). */
function refdoc(patch: RefPatch): IngestDocument {
  const seconds = [0, 1, 2].map((s) => refsegment(s, patch.bands, patch.tonic));
  return {
    schema: INGEST_SCHEMA_VERSION,
    name: "reference",
    ingestedAt: patch.ingestedAt,
    sampleRate: 8000,
    durationSeconds: seconds.length,
    mix: {
      sampleRate: 8000,
      durationSeconds: seconds.length,
      rhythm: { bpm: patch.bpm, onsetStrength: 0 },
      key: { tonic: patch.tonic, tonicName: "", mode: "minor" },
      loudness: { integrated: patch.integrated },
      spectrum: { bands: [0, 0, 0, 0, 0, 0, 0], centroidHz: 0 },
      structure: [],
      fingerprintHashes: 0,
    },
    segments: seconds,
    pcmhash: 0,
    stems: [],
  };
}

/** One stamped reference row fixture (the shape the worker's db lane stamps). */
function refrow(id: string, name: string, kind: "reference" | "upload", doc: IngestDocument): IngestStampRow {
  return {
    id,
    ownerId: OWNER_ID,
    kind,
    visibility: "vitrine",
    name,
    mixPointer: mintid(BASE_TICK),
    stemsPointer: mintid(BASE_TICK),
    sizeBytes: 2048,
    sha256: SHA_FIXTURE,
    sampleRate: 8000,
    durationSeconds: 3,
    pcmhash: 0,
    ingestedAt: doc.ingestedAt,
    document: doc,
  };
}

/** The first techno reference: 128 bpm, F minor, low-heavy. */
const technoAlpha = refrow(
  ALPHA_ID,
  "techno reference alpha",
  "reference",
  refdoc({ bpm: 128, tonic: 5, integrated: -9.5, bands: [0.5, 0.3, 0.2], ingestedAt: "2026-02-01T00:00:00.000Z" }),
);
/** The second techno reference: 134 bpm, F minor, low-heavy alike. */
const technoBeta = refrow(
  BETA_ID,
  "techno reference beta",
  "reference",
  refdoc({ bpm: 134, tonic: 5, integrated: -8.5, bands: [0.5, 0.3, 0.2], ingestedAt: "2026-02-02T00:00:00.000Z" }),
);
/** The trap reference: the foreign genre the techno walk never reads. */
const trapGamma = refrow(
  GAMMA_ID,
  "trap reference gamma",
  "reference",
  refdoc({ bpm: 140, tonic: 9, integrated: -9, bands: [0.4, 0.3, 0.3], ingestedAt: "2026-02-03T00:00:00.000Z" }),
);
/** The techno upload: the visitor kind that sits every walk out. */
const technoDelta = refrow(
  DELTA_ID,
  "techno upload delta",
  "upload",
  refdoc({ bpm: 150, tonic: 0, integrated: -10, bands: [0.1, 0.2, 0.7], ingestedAt: "2026-02-04T00:00:00.000Z" }),
);

/** Stamps the reference fixtures through the document seat. */
async function seedshelf(env: GatewayEnv): Promise<void> {
  for (const row of [technoAlpha, technoBeta, trapGamma, technoDelta]) {
    const answer = await env.db.puttingestrow(row);
    assert.ok(answer.ok, "the shelf accepts the reference fixture");
  }
}

// ---------------------------------------------------------------------------
// the request double and the unwrap helpers
// ---------------------------------------------------------------------------

/**
 * Builds one gateway request — the transport adapter's job in production,
 * the test double here.
 *
 * @param method the http method.
 * @param path the request path.
 * @param json the parsed json body (the mine lane).
 * @returns the request.
 */
function request(method: string, path: string, json: Record<string, unknown> | null = null): GatewayRequest {
  return { method, path, query: {}, json, raw: null };
}

/** Posts one mine body and answers the err (the validation shortcut). */
async function refutemine(env: GatewayEnv, body: Record<string, unknown> | null): Promise<GatewayErr> {
  return errof(await dispatch(env, request("POST", "/api/v1/profiles/mine", body)));
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

/** Registers one queued mine job through the route and answers its id. */
async function minethroughroute(env: GatewayEnv, genre: string, ownerId: string = OWNER_ID): Promise<string> {
  const answer = await dispatch(env, request("POST", "/api/v1/profiles/mine", { genre, ownerId }));
  return valueof<{ jobId: string }>(answer).jobId;
}

// ---------------------------------------------------------------------------
// the suites
// ---------------------------------------------------------------------------

describe("the route rows of the miner lane", () => {
  let env: GatewayEnv;
  let database: Database;

  beforeAll(() => {
    database = new Database(":memory:");
    ({ env } = gatewayenv(database));
  });
  afterAll(() => database.close());

  it("captures the genre param of the profile read", () => {
    const verdict = matchroute("GET", "/api/v1/profiles/techno");
    assert.equal(verdict.kind, "routed");
    if (verdict.kind === "routed") {
      assert.equal(verdict.route.handler, "getProfile");
      assert.deepEqual(verdict.params, { genre: "techno" });
    }
  });

  it("routes the mine literal ahead of the profile :genre param (the table order is the law)", () => {
    const verdict = matchroute("POST", "/api/v1/profiles/mine");
    assert.equal(verdict.kind, "routed");
    if (verdict.kind === "routed") {
      assert.equal(verdict.route.handler, "mineProfile");
      assert.equal(verdict.route.path, "/api/v1/profiles/mine");
    }
    // a GET on the mine path asks the :genre route — the literal answers POST only
    const read = matchroute("GET", "/api/v1/profiles/mine");
    assert.equal(read.kind, "routed");
    if (read.kind === "routed") {
      assert.equal(read.route.handler, "getProfile");
      assert.deepEqual(read.params, { genre: "mine" });
    }
  });

  it("answers the 405 shape when the method misses on the profiles path", async () => {
    const answer = errof(await dispatch(env, request("DELETE", "/api/v1/profiles")));
    assert.equal(answer.status, 405);
    assert.equal(answer.error.code, "method-not-allowed");
    assert.ok(answer.error.message.includes("GET"), `the allowed methods ride the message: ${answer.error.message}`);
    const mine = errof(await dispatch(env, request("PUT", "/api/v1/profiles/mine")));
    assert.equal(mine.status, 405);
    assert.equal(mine.error.code, "method-not-allowed");
  });
});

describe("the mine validation lanes (the body law)", () => {
  let env: GatewayEnv;
  let database: Database;

  beforeAll(() => {
    database = new Database(":memory:");
    ({ env } = gatewayenv(database));
  });
  afterAll(() => database.close());

  it("refuses a request with no json body (bad-request)", async () => {
    const answer = await refutemine(env, null);
    assert.equal(answer.status, 400);
    assert.equal(answer.error.code, "bad-request");
  });

  it("refuses a genre off the fifteen (bad-request)", async () => {
    for (const bad of ["polka", "", "Techno", "not-a-genre"]) {
      const answer = await refutemine(env, { genre: bad, ownerId: OWNER_ID });
      assert.equal(answer.status, 400, `the genre "${bad}" must fail the vocabulary law`);
      assert.equal(answer.error.code, "bad-request");
    }
  });

  it("refuses a malformed owner pointer (bad-owner)", async () => {
    for (const bad of ["nope", "", "0", "-7", "12.5"]) {
      const answer = await refutemine(env, { genre: "techno", ownerId: bad });
      assert.equal(answer.status, 400, `the owner "${bad}" must fail the mint law`);
      assert.equal(answer.error.code, "bad-owner");
    }
  });

  it("registers the queued ledger row on the honest ask (201)", async () => {
    const answer = await dispatch(
      env,
      request("POST", "/api/v1/profiles/mine", { genre: "techno", ownerId: OWNER_ID }),
    );
    assert.equal(answer.status, 201);
    const jobId = valueof<{ jobId: string }>(answer).jobId;
    assert.match(jobId, /^[1-9]\d{0,19}$/);
    const row = env.jobs.getjob(jobId);
    assert.ok(row, "the mine registers the ledger row");
    assert.equal(row.owner_id, OWNER_ID);
    assert.equal(row.state, "queued");
    assert.equal(row.phase, null);
    assert.equal(row.fraction, 0);
    assert.equal(row.error, null);
    assert.equal(row.document_id, null);
    assert.ok(row.created_at.length > 0);
    assert.equal(row.finished_at, null);
  });

  it("refuses a start on a job the ledger never held (not-found)", async () => {
    const answer = errof(await startMinerJob(env, mintid(), { genre: "techno" }));
    assert.equal(answer.status, 404);
    assert.equal(answer.error.code, "not-found");
  });

  it("refuses a bad payload genre without moving the queued row", async () => {
    const jobId = await minethroughroute(env, "house");
    const answer = errof(await startMinerJob(env, jobId, { genre: "polka" }));
    assert.equal(answer.status, 400);
    assert.equal(answer.error.code, "bad-request");
    const row = env.jobs.getjob(jobId);
    assert.ok(row);
    assert.equal(row.state, "queued", "the row stays queued — an honest payload can still walk");
  });
});

describe("the mine walk end to end (the temp sqlite + seeded references)", () => {
  let database: Database;
  let env: GatewayEnv;
  let walk: GatewayJobPatch[];
  let jobId = "";
  let run: MinerRunValue;

  beforeAll(async () => {
    database = await newdatabase();
    ({ env, walk } = gatewayenv(database));
    await seedshelf(env);
    jobId = await minethroughroute(env, "techno");
    run = valueof(await startMinerJob(env, jobId, { genre: "techno" }));
  });
  afterAll(() => database.close());

  it("answers the done run with the profile document", () => {
    assert.equal(run.jobId, jobId);
    assert.equal(run.state, "done");
    assert.match(run.profileId, /^[1-9]\d{0,19}$/);
    assert.equal(run.profile.schema, "debonair.profile/1");
    assert.equal(run.profile.genre, "techno");
    assert.equal(run.profile.trainedOn, 2);
    assert.equal(run.profile.bpm.min, 128);
    assert.equal(run.profile.bpm.median, 131);
    assert.equal(run.profile.bpm.max, 134);
    assert.equal(run.profile.keyPool[0]?.name, "F minor");
    assert.ok(run.profile.updatedAt.length > 0);
  });

  it("collects only the genre's references — the upload and the foreign genre sit the walk out", () => {
    assert.deepEqual(run.profile.referenceIds, [ALPHA_ID, BETA_ID]);
    assert.ok(!run.profile.referenceIds.includes(GAMMA_ID), "the trap reference never feeds the techno profile");
    assert.ok(!run.profile.referenceIds.includes(DELTA_ID), "the visitor upload never feeds a genre profile");
  });

  it("walks the ledger running → collect → mine → store → done with ascending fractions", () => {
    assert.equal(walk[0].state, "running");
    assert.equal(walk[0].fraction, 0);
    const phases = walk.slice(1, 4).map((patch) => patch.phase);
    assert.deepEqual(phases, ["collect", "mine", "store"]);
    const fractions = walk.slice(1, 4).map((patch) => patch.fraction);
    assert.equal(fractions[0], 1 / 3);
    assert.equal(fractions[1], 2 / 3);
    assert.equal(fractions[2], 1);
    const done = walk[4];
    assert.equal(done.state, "done");
    assert.equal(done.fraction, 1);
    assert.equal(done.document_id, run.profileId);
    assert.ok(done.finished_at);
  });

  it("lands the done ledger row with the profile row id in the document_id column", async () => {
    const row = valueof<IngestJobValue>(await dispatch(env, request("GET", `/api/v1/ingest/jobs/${jobId}`)));
    assert.equal(row.state, "done");
    assert.equal(row.phase, "store");
    assert.equal(row.fraction, 1);
    assert.equal(row.error, null);
    assert.equal(row.documentId, run.profileId);
    assert.equal(row.ownerId, OWNER_ID);
    assert.ok(row.finishedAt !== null && row.finishedAt >= row.createdAt);
  });

  it("landed the profile row in genre_profiles (the canonical json the seat stores)", () => {
    const cells = database.prepare("SELECT id, genre, reference_ids, profile_json FROM genre_profiles").all() as {
      id: number;
      genre: string;
      reference_ids: string;
      profile_json: string;
    }[];
    assert.equal(cells.length, 1);
    const cell = cells[0];
    assert.ok(cell);
    assert.equal(String(cell.id), run.profileId);
    assert.equal(cell.genre, "techno");
    assert.deepEqual(JSON.parse(cell.reference_ids), [ALPHA_ID, BETA_ID]);
    const parsed = validateGenreProfile(JSON.parse(cell.profile_json));
    assert.ok(parsed.ok, "the stored profile validates against its own contract");
    if (parsed.ok) assert.equal(parsed.doc.trainedOn, 2);
  });

  it("the profile read answers the landed row", async () => {
    const row = valueof<GatewayProfileRow>(await dispatch(env, request("GET", "/api/v1/profiles/techno")));
    assert.equal(String(row.id), run.profileId);
    assert.equal(row.genre, "techno");
    assert.deepEqual(row.referenceIds, [ALPHA_ID, BETA_ID]);
    assert.equal(row.profile.trainedOn, 2);
    assert.equal(row.profile.bpm.min, 128);
    assert.equal(row.profile.bpm.max, 134);
    assert.ok(row.createdAt.length > 0);
  });

  it("the profiles list answers the vitrine row", async () => {
    const list = valueof<{ records: GatewayProfileRow[] }>(await dispatch(env, request("GET", "/api/v1/profiles")));
    assert.equal(list.records.length, 1);
    const record = list.records[0];
    assert.ok(record);
    assert.equal(record.genre, "techno");
    assert.equal(String(record.id), run.profileId);
  });

  it("refuses a re-run of the landed job (conflict)", async () => {
    const answer = errof(await startMinerJob(env, jobId, { genre: "techno" }));
    assert.equal(answer.status, 409);
    assert.equal(answer.error.code, "conflict");
  });
});

describe("the empty-set failure — a genre with no references lands failed", () => {
  let database: Database;
  let env: GatewayEnv;
  let jobId = "";

  beforeAll(async () => {
    database = await newdatabase();
    ({ env } = gatewayenv(database));
    await seedshelf(env);
    jobId = await minethroughroute(env, "ambient");
    const answer = errof(await startMinerJob(env, jobId, { genre: "ambient" }));
    assert.equal(answer.status, 400);
    assert.equal(answer.error.code, "bad-request");
    assert.ok(
      answer.error.message.startsWith("empty-set"),
      `the message carries the miner code: ${answer.error.message}`,
    );
  });
  afterAll(() => database.close());

  it("lands the failed row with the honest error code", async () => {
    const row = valueof<IngestJobValue>(await dispatch(env, request("GET", `/api/v1/ingest/jobs/${jobId}`)));
    assert.equal(row.state, "failed");
    assert.ok(row.error?.startsWith("empty-set"), `the ledger error: ${row.error}`);
    assert.equal(row.documentId, null);
    assert.equal(row.phase, "collect", "the shelf read completed — the empty group is the mine's refusal");
    assert.equal(row.fraction, 1 / 3);
    assert.ok(row.finishedAt !== null);
  });

  it("landed no profile row", async () => {
    const counted = database.prepare("SELECT COUNT(*) AS total FROM genre_profiles").get() as { total: number };
    assert.equal(counted.total, 0);
    const list = valueof<{ records: GatewayProfileRow[] }>(await dispatch(env, request("GET", "/api/v1/profiles")));
    assert.equal(list.records.length, 0);
  });

  it("the profile read of the untrained genre answers not-found", async () => {
    const answer = errof(await dispatch(env, request("GET", "/api/v1/profiles/ambient")));
    assert.equal(answer.status, 404);
    assert.equal(answer.error.code, "not-found");
  });
});

describe("the vitrine law — the newest row per genre", () => {
  let database: Database;
  let env: GatewayEnv;

  beforeAll(async () => {
    database = await newdatabase();
    ({ env } = gatewayenv(database));
    await seedshelf(env);
    // the first techno training, then a retrain (a fresh job, a fresh row)
    const first = await minethroughroute(env, "techno");
    valueof(await startMinerJob(env, first, { genre: "techno" }));
    const retrain = await minethroughroute(env, "techno");
    valueof(await startMinerJob(env, retrain, { genre: "techno" }));
    // a second genre trains beside it
    const trap = await minethroughroute(env, "trap");
    valueof(await startMinerJob(env, trap, { genre: "trap" }));
  });
  afterAll(() => database.close());

  it("keeps every training in the table (the audit trail)", () => {
    const rows = listGenreProfiles(database);
    assert.equal(rows.length, 3);
    assert.deepEqual(
      rows.map((row) => row.genre),
      ["trap", "techno", "techno"],
      "the table lists newest first — the trap training landed last",
    );
  });

  it("the list folds to the newest row per genre", async () => {
    const list = valueof<{ records: GatewayProfileRow[] }>(await dispatch(env, request("GET", "/api/v1/profiles")));
    assert.equal(list.records.length, 2, "one record per trained genre");
    const techno = list.records.find((row) => row.genre === "techno");
    const trap = list.records.find((row) => row.genre === "trap");
    assert.ok(techno && trap);
    assert.equal(techno.id, 2, "the retrained row surfaces, not the first training");
    assert.equal(trap.id, 3);
    assert.ok(list.records[0] && list.records[0].id >= (list.records[1]?.id ?? 0), "the records answer newest first");
  });

  it("the profile read answers the freshest row of the genre", async () => {
    const row = valueof<GatewayProfileRow>(await dispatch(env, request("GET", "/api/v1/profiles/techno")));
    assert.equal(row.id, 2, "the retrain answers, the first training stays in the audit trail");
    const trap = valueof<GatewayProfileRow>(await dispatch(env, request("GET", "/api/v1/profiles/trap")));
    assert.equal(trap.genre, "trap");
    assert.equal(trap.profile.trainedOn, 1);
    assert.deepEqual(trap.referenceIds, [GAMMA_ID]);
  });

  it("refuses a genre off the fifteen on the profile read (bad-request)", async () => {
    const answer = errof(await dispatch(env, request("GET", "/api/v1/profiles/polka")));
    assert.equal(answer.status, 400);
    assert.equal(answer.error.code, "bad-request");
  });
});

describe("the vitrine card data — the catalog seam and the honest seed", () => {
  it("the seed answers the fifteen genres of the miner's own vocabulary, untrained", () => {
    assert.equal(seedGenreProfileCards.length, 15);
    assert.deepEqual(
      seedGenreProfileCards.map((card) => card.genre),
      [...PROFILE_GENRE_KEYS],
      "the seed never drifts from the miner's vocabulary",
    );
    const labels = new Map(GENRES.map((genre) => [genre.id, genre.label]));
    for (const card of seedGenreProfileCards) {
      assert.equal(card.group, "genre-profiles");
      assert.equal(card.label, labels.get(card.genre));
      assert.equal(card.trainedOn, 0, "never a fake trained count");
      assert.equal(card.bpmMin, 0, "never a fake bpm floor");
      assert.equal(card.bpmMax, 0, "never a fake bpm ceiling");
      assert.equal(card.keyTop, "", "never a fake key");
      assert.equal(card.bandsLow, 0, "never a fake band balance");
      assert.equal(card.bandsMid, 0);
      assert.equal(card.bandsHigh, 0);
      assert.equal(card.updatedAt, "");
    }
  });

  it("the catalog answers the seed rows offline, memoized (the write-free seam)", async () => {
    const first = listGenreProfileCards();
    const second = listGenreProfileCards();
    assert.equal(first, second, "the memo answers the same promise — the table reads once");
    const rows = await first;
    assert.deepEqual(rows, [...seedGenreProfileCards]);
  });
});
