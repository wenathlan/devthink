// # generateserver.test — the generate lane of the debonair gateway
// (waves PV4.003 + PV6.001): the seventeen-route table carries the four
// generate rows beside the thirteen standing ones (the render queue, the
// render job progress, the track publish, the vitrine list — the
// automation vocabulary), the queue validates the pattern plan and
// registers the queued render_jobs row in the canonical serialized form,
// the walk drives the renderworker end to end through the gateway seats
// (queued → rendering → done with the wav in the store and the track row
// landed with the owner pointer and the wav address), the poll route
// answers the walk, the publish route flips the track onto the vitrine
// under the owner law (a foreign pointer answers forbidden, never
// someone else's shelf), the vitrine route answers the published surface
// under the visibility law (the published rows list for everyone, the
// owner's own rows ride beside them when the ownerId query carries their
// pointer) and the honest failure codes answer their lanes (the empty
// plan, the conflict of a landed walk, the not-found of an unknown job).
// runnable with vitest:
//   pnpm vitest run tests/generateserver.test.ts
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterAll, describe, it } from "vitest";
import { mintid } from "../bigintids.ts";
import { memoryblobstore } from "../blobstore.ts";
import type {
  GatewayAnswer,
  GatewayEnv,
  GatewayProfileRow,
  GatewayProfileSeat,
  GatewayRequest,
  GatewayTrackSeat,
  RenderJobValue,
} from "../gatewayapi.ts";
import { dispatch, matchroute, routes, startRenderJob } from "../gatewayapi.ts";
import { serializePattern } from "../patternenums.ts";
import type { GenreProfile } from "../patternminer.ts";
import {
  getrenderjob,
  getrendertrack,
  listrendertracks,
  migraterenderjobsschema,
  migratetrackschema,
  publishrendertrack,
  renderjobseat,
  rendertrackseat,
} from "../renderjobs.ts";
import type { RenderTrackRow } from "../renderworker.ts";

/** The pinned base tick the clocks and the mints walk from. */
const BASE_TICK = 1_700_000_000_000;
/** The owner pointer of every test walk (the minted decimal string). */
const OWNER_ID = mintid();
/** A foreign owner pointer (the forbidden lane). */
const FOREIGN_OWNER = mintid();

/** A silent sixteen-step lane (the surgical plan's off seats). */
const SILENT_LANE: readonly number[] = new Array<number>(16).fill(0);

/** The surgical plan fixture: two bars at 120 bpm, nothing but the kick
 * lane at steps 0 and 8 (a valid debonair.pattern/1 project the render
 * lane renders fast). */
function kickplan() {
  return {
    schema: "debonair.pattern/1" as const,
    bpm: 120,
    root: 0,
    scale: "major" as const,
    bars: 2,
    mood: "surgical",
    prompt: "the kick isolate",
    drums: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      snare: [...SILENT_LANE],
      hat: [...SILENT_LANE],
      clap: [...SILENT_LANE],
    },
    notes: [],
    embedding: new Array<number>(32).fill(0),
  };
}

/** The silent plan: every lane off, no notes — the empty-plan isolate. */
function silentplan() {
  const plan = kickplan();
  return {
    ...plan,
    drums: { kick: [...SILENT_LANE], snare: [...SILENT_LANE], hat: [...SILENT_LANE], clap: [...SILENT_LANE] },
  };
}

/** Builds one gateway request (the transport adapter's job in production,
 * the test double here). */
function request(
  method: string,
  path: string,
  query: Record<string, string> = {},
  json: Record<string, unknown> | null = null,
): GatewayRequest {
  return { method, path, query, json, raw: null };
}

/** Unwraps one ok answer — a refusal throws with the machine code. */
function valueof<T>(answer: GatewayAnswer<T>): T {
  if (!answer.ok) throw new Error(`the route refused: ${answer.error.code} — ${answer.error.message}`);
  return answer.value;
}

/** Unwraps one err answer — an ok answer fails the test (the status rides
 * the answer envelope, the code and the message ride the error branch). */
function errof(answer: GatewayAnswer): { code: string; status: number; message: string } {
  assert.ok(!answer.ok, "the answer must refuse");
  return { ...answer.error, status: answer.status };
}

/** One in-memory profile seat (the vitrine fold reads it). */
function profileseat(): GatewayProfileSeat & { rows: Map<number, GatewayProfileRow> } {
  const rows = new Map<number, GatewayProfileRow>();
  let seq = 0;
  return {
    rows,
    async saveprofile(profile: GenreProfile) {
      const id = ++seq;
      rows.set(id, {
        id,
        genre: profile.genre,
        referenceIds: profile.referenceIds,
        profile,
        createdAt: new Date(BASE_TICK + id * 1000).toISOString(),
      });
      return id;
    },
    async listprofiles() {
      return [...rows.values()].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    },
  };
}

/** The gateway track seat over the temp sqlite (the walk's own seat grown
 * with the publish and list reads the routes serve — the merged seat
 * carries both vocabularies, the visibility list riding the binding's own
 * seat beside the generate lane's reads). */
function trackseat(temp: Database): GatewayTrackSeat {
  const base = rendertrackseat(temp);
  return {
    puttrackrow: base.puttrackrow,
    listtrackrows: base.listtrackrows.bind(base),
    async gettrackrow(id) {
      return getrendertrack(id, temp);
    },
    async publishtrackrow(id) {
      return publishrendertrack(id, temp);
    },
    async listpublishedrows() {
      return listrendertracks({ status: "published" }, temp);
    },
    async listownerrows(ownerId) {
      return listrendertracks({ ownerId }, temp);
    },
  };
}

/** Builds one full gateway environment over a temp sqlite and the memory
 * store (the same seats the gateway worker lane wires). */
function gatewayenv(temp: Database): { env: GatewayEnv; profiles: Map<number, GatewayProfileRow>; minted: string[] } {
  const store = memoryblobstore();
  const profiles = profileseat();
  let clock = 0;
  const minted: string[] = [];
  const env: GatewayEnv = {
    store,
    db: {
      async puttingestrow() {
        return { ok: true };
      },
      async getstampedrow() {
        return null;
      },
      async liststampedrows() {
        return [];
      },
      async dropstampedrow() {
        return null;
      },
    },
    jobs: {
      putjob() {},
      getjob() {
        return null;
      },
      updatejob() {},
      listjobs() {
        return [];
      },
    },
    profiles,
    renderJobs: renderjobseat(temp),
    tracks: trackseat(temp),
    now: () => new Date(BASE_TICK + 10_000 + clock++ * 1000).toISOString(),
    mint: () => {
      const id = mintid(BASE_TICK + 20_000 + minted.length);
      minted.push(id);
      return id;
    },
  };
  return { env, profiles: profiles.rows, minted };
}

/** the temp directories the flow tests created (folded away at the end). */
const dirs: string[] = [];

/** One fresh temp sqlite database (the worker-test law). */
async function newdatabase(): Promise<Database> {
  const dir = await mkdtemp(path.join(tmpdir(), "debonair-generateserver-"));
  dirs.push(dir);
  const temp = new Database(path.join(dir, "generate.db"));
  migraterenderjobsschema(temp);
  migratetrackschema(temp);
  return temp;
}

afterAll(async () => {
  await Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("the route table (the seventeen rows)", () => {
  it("carries the four generate rows beside the thirteen standing ones", () => {
    assert.equal(
      routes.length,
      17,
      "the seventeen-route table (the thirteen standing + the generate lane's four spellings)",
    );
    const paths = routes.map((row) => `${row.method} ${row.path}`);
    assert.deepEqual(paths.slice(13), [
      "POST /api/v1/generate/render",
      "GET /api/v1/generate/jobs/:id",
      "POST /api/v1/tracks/:id/publish",
      "GET /api/v1/vitrine",
    ]);
  });

  it("answers the match verdicts of the generate rows", () => {
    const queue = matchroute("POST", "/api/v1/generate/render");
    assert.ok(queue.kind === "routed" && queue.route.handler === "queueGenerateRender");
    const poll = matchroute("GET", "/api/v1/generate/jobs/123");
    assert.ok(poll.kind === "routed" && poll.route.handler === "getGenerateJob");
    const publish = matchroute("POST", "/api/v1/tracks/123/publish");
    assert.ok(publish.kind === "routed" && publish.route.handler === "publishTrackById");
    const vitrine = matchroute("GET", "/api/v1/vitrine");
    assert.ok(vitrine.kind === "routed" && vitrine.route.handler === "listVitrine");
    // the method law: the wrong verb answers the 405 shape
    const wrong = matchroute("GET", "/api/v1/generate/render");
    assert.ok(wrong.kind === "method" && wrong.allowed.includes("POST"));
    const absent = matchroute("GET", "/api/v1/generate");
    assert.ok(absent.kind === "absent");
  });
});

describe("the render queue route", () => {
  it("validates the owner pointer and the plan contract", async () => {
    const temp = await newdatabase();
    const { env } = gatewayenv(temp);
    const nobody = errof(await dispatch(env, request("POST", "/api/v1/generate/render", {}, { plan: kickplan() })));
    assert.equal(nobody.code, "bad-owner");
    const noplan = errof(await dispatch(env, request("POST", "/api/v1/generate/render", {}, { ownerId: OWNER_ID })));
    assert.equal(noplan.code, "bad-request");
    const broken = errof(
      await dispatch(
        env,
        request("POST", "/api/v1/generate/render", {}, { ownerId: OWNER_ID, plan: { schema: "nope" } }),
      ),
    );
    assert.equal(broken.code, "bad-request");
    assert.match(broken.message, /pattern contract/);
    const nojson = errof(await dispatch(env, request("POST", "/api/v1/generate/render")));
    assert.equal(nojson.code, "bad-request");
  });

  it("registers the queued row in the canonical serialized form", async () => {
    const temp = await newdatabase();
    const { env, minted } = gatewayenv(temp);
    const queued = valueof(
      await dispatch(env, request("POST", "/api/v1/generate/render", {}, { ownerId: OWNER_ID, plan: kickplan() })),
    );
    assert.equal(queued.jobId, minted[0], "the mint answers the job id");
    const row = getrenderjob(queued.jobId, temp);
    assert.ok(row, "the row lands");
    assert.equal(row.state, "queued");
    assert.equal(row.owner_id, OWNER_ID);
    assert.equal(row.plan_json, serializePattern(kickplan()), "the canonical bytes whatever key order the caller sent");
    assert.equal(row.wav_pointer, null);
    assert.equal(row.error, null);
  });
});

describe("the render walk and the poll route", () => {
  it("walks queued → rendering → done with the wav and the track row", async () => {
    const temp = await newdatabase();
    const { env } = gatewayenv(temp);
    const queued = valueof(
      await dispatch(env, request("POST", "/api/v1/generate/render", {}, { ownerId: OWNER_ID, plan: kickplan() })),
    );
    const run = await startRenderJob(env, queued.jobId);
    const take = valueof(run);
    assert.ok(take.wavPointer.length > 0);
    assert.ok(take.bytes > 0);
    assert.ok(take.durationSeconds > 0);
    assert.ok(take.trackId, "the track row lands");
    // the poll route answers the walk
    const polled = valueof(
      await dispatch(env, request("GET", `/api/v1/generate/jobs/${queued.jobId}`)),
    ) as RenderJobValue;
    assert.equal(polled.state, "done");
    assert.equal(polled.phase, "store", "the last completed phase of the render vocabulary");
    assert.equal(polled.fraction, 1);
    assert.equal(polled.wavPointer, take.wavPointer);
    assert.equal(polled.ownerId, OWNER_ID);
    assert.equal(polled.error, null);
    assert.ok(polled.finishedAt);
    // the store holds the wav the pointer names
    const stored = await env.store.get(take.wavPointer);
    assert.ok(stored.ok);
    assert.equal(stored.data?.byteLength, take.bytes);
    assert.equal(stored.pointer.kind, "audio/wav");
    // the track row landed with the owner pointer and the wav address
    const track = valueof(await dispatch(env, request("GET", "/api/v1/vitrine", { ownerId: OWNER_ID }))).tracks.find(
      (row: RenderTrackRow) => row.wavPointer === take.wavPointer,
    );
    assert.ok(track, "the owner shelf answers the track");
    assert.equal(track.ownerId, OWNER_ID);
    assert.equal(track.status, "ready");
    // the walk is one-shot — a re-run refuses conflict
    const again = errof(await startRenderJob(env, queued.jobId));
    assert.equal(again.code, "conflict");
    assert.equal(again.status, 409);
  });

  it("answers the unknown job with not-found and the empty plan with bad-request", async () => {
    const temp = await newdatabase();
    const { env } = gatewayenv(temp);
    const unknown = errof(await dispatch(env, request("GET", `/api/v1/generate/jobs/${mintid()}`)));
    assert.equal(unknown.code, "not-found");
    assert.equal(unknown.status, 404);
    // the silent plan queues honestly (the route validates the contract,
    // not the renderability) and the walk refuses empty-plan
    const queued = valueof(
      await dispatch(env, request("POST", "/api/v1/generate/render", {}, { ownerId: OWNER_ID, plan: silentplan() })),
    );
    const run = errof((await startRenderJob(env, queued.jobId)) as GatewayAnswer);
    assert.equal(run.code, "bad-request");
    assert.equal(run.status, 400);
    assert.match(run.message, /empty-plan/);
    const landed = getrenderjob(queued.jobId, temp);
    assert.ok(landed);
    assert.equal(landed.state, "failed");
    assert.match(landed.error ?? "", /empty-plan/);
  });
});

describe("the publish route and the vitrine law", () => {
  /** Queues and walks one take, answering the walk facts. */
  async function landone(env: GatewayEnv): Promise<{ jobId: string; wavPointer: string; trackId: string }> {
    const queued = valueof(
      await dispatch(env, request("POST", "/api/v1/generate/render", {}, { ownerId: OWNER_ID, plan: kickplan() })),
    );
    const run = await startRenderJob(env, queued.jobId);
    const take = valueof(run);
    assert.ok(take.trackId);
    return { jobId: queued.jobId, wavPointer: take.wavPointer, trackId: take.trackId };
  }

  it("flips the track onto the vitrine under the owner law", async () => {
    const temp = await newdatabase();
    const { env } = gatewayenv(temp);
    const landed = await landone(env);
    // the public vitrine carries no unpublished rows
    const before = valueof(await dispatch(env, request("GET", "/api/v1/vitrine")));
    assert.equal(before.tracks.length, 0);
    // the foreign owner answers forbidden — never someone else's shelf
    const foreign = errof(
      await dispatch(env, request("POST", `/api/v1/tracks/${landed.trackId}/publish`, {}, { ownerId: FOREIGN_OWNER })),
    );
    assert.equal(foreign.code, "forbidden");
    assert.equal(foreign.status, 403);
    // a malformed owner pointer answers bad-owner
    const malformed = errof(
      await dispatch(env, request("POST", `/api/v1/tracks/${landed.trackId}/publish`, {}, { ownerId: "not-minted" })),
    );
    assert.equal(malformed.code, "bad-owner");
    // the owner publishes
    const published = valueof(
      await dispatch(env, request("POST", `/api/v1/tracks/${landed.trackId}/publish`, {}, { ownerId: OWNER_ID })),
    );
    assert.equal(published.status, "published");
    assert.equal(published.id, landed.trackId);
    assert.equal(published.wavPointer, landed.wavPointer);
    // the public vitrine now carries the published row
    const after = valueof(await dispatch(env, request("GET", "/api/v1/vitrine")));
    assert.equal(after.tracks.length, 1);
    assert.equal(after.tracks[0]?.id, landed.trackId);
    assert.equal(after.tracks[0]?.status, "published");
  });

  it("answers the unknown track with not-found", async () => {
    const temp = await newdatabase();
    const { env } = gatewayenv(temp);
    const unknown = errof(
      await dispatch(env, request("POST", `/api/v1/tracks/${mintid()}/publish`, {}, { ownerId: OWNER_ID })),
    );
    assert.equal(unknown.code, "not-found");
    assert.equal(unknown.status, 404);
  });

  it("carries the owner shelf beside the published rows and the freshest profiles", async () => {
    const temp = await newdatabase();
    const { env } = gatewayenv(temp);
    const first = await landone(env);
    const second = await landone(env);
    // two profile rows of one genre: the fold keeps the freshest
    await env.profiles.saveprofile({
      schema: "debonair.profile/1",
      genre: "trap",
      referenceIds: ["a"],
      trainedOn: 1,
      bpm: { min: 138, median: 140, max: 144, histogram: [0, 0, 0, 0, 1, 0, 0, 0] },
      keyPool: [{ name: "A minor", weight: 1 }],
      onsetDensity: new Array<number>(16).fill(0.4),
      bandBalance: { low: 0.5, mid: 0.3, high: 0.2 },
      loudness: { target: -9, min: -9.5, max: -8.5 },
      centroid: new Array<number>(32).fill(0.03),
      chromaProfile: new Array<number>(12).fill(0.08),
      updatedAt: "2026-06-01T00:00:00.000Z",
    });
    await env.profiles.saveprofile({
      schema: "debonair.profile/1",
      genre: "trap",
      referenceIds: ["a", "b"],
      trainedOn: 2,
      bpm: { min: 138, median: 141, max: 144, histogram: [0, 0, 0, 0, 2, 0, 0, 0] },
      keyPool: [{ name: "A minor", weight: 1 }],
      onsetDensity: new Array<number>(16).fill(0.5),
      bandBalance: { low: 0.5, mid: 0.3, high: 0.2 },
      loudness: { target: -9, min: -9.5, max: -8.5 },
      centroid: new Array<number>(32).fill(0.03),
      chromaProfile: new Array<number>(12).fill(0.08),
      updatedAt: "2026-06-02T00:00:00.000Z",
    });
    // publish only the first take; the second stays on the owner shelf
    await dispatch(env, request("POST", `/api/v1/tracks/${first.trackId}/publish`, {}, { ownerId: OWNER_ID }));
    const publiclist = valueof(await dispatch(env, request("GET", "/api/v1/vitrine")));
    assert.equal(publiclist.tracks.length, 1, "the published row alone lists for everyone");
    assert.equal(publiclist.profiles.length, 1, "the freshest profile row of the genre");
    assert.equal(publiclist.profiles[0]?.profile.trainedOn, 2, "the fold keeps the freshest row");
    const ownershelf = valueof(await dispatch(env, request("GET", "/api/v1/vitrine", { ownerId: OWNER_ID })));
    assert.equal(ownershelf.tracks.length, 2, "the owner's own rows ride beside the published one");
    const ids = new Set(ownershelf.tracks.map((row: RenderTrackRow) => row.id));
    assert.ok(ids.has(first.trackId) && ids.has(second.trackId));
    // a malformed ownerId query answers bad-owner
    const malformed = errof(await dispatch(env, request("GET", "/api/v1/vitrine", { ownerId: "nope" })));
    assert.equal(malformed.code, "bad-owner");
  });
});
