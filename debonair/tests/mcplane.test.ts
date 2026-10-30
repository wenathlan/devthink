// # mcplane.test — the mcp automation lane of the debonair engine (wave
// PV6.004) over a fake gateway fetch: the tool catalog answers the family
// mcp contract (the six namespaced debonair.* names, the version, the
// risk class, the consent text, the json schema inputs with the required
// list), the lane is opt-in (an absent config, an empty origin or an
// origin that refuses the house https law answers null and every tool
// answers the not-configured refusal — the lane never opens silently),
// the agent identity stamps every write (the upload, the mine, the render
// and the publish bodies carry the lane's own minted owner pointer or the
// caller's carried one — the same column law every owner stamp rides),
// each tool walks the same gateway client lanes the browser rides (the
// upload posts the base64 reference with the vitrine visibility, the mine
// queues and polls the shared ledger to done, the compose reads the
// freshest profile and answers the pure composer's plan, the render
// queues the plan and resolves the track id through the owner shelf, the
// publish flips the row under the owner law, the vitrine answers the
// public surface), the honest failure lanes answer (the off-dictionary
// genre and the dishonest base64 refuse bad-args before any byte leaves
// the host, a walk that lands failed answers job-failed with the honest
// error, a foreign track answers lane-refused with the wire status, an
// unknown name answers unknown-tool and the bare name never resolves).
// runnable with vitest:
//   pnpm vitest run tests/mcplane.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { mintid } from "../bigintids.ts";
import type { GatewayProfileRow } from "../gatewayapi.ts";
import {
  type ComposePlanResult,
  calltool,
  type ListVitrineResult,
  MCP_DOMAIN,
  MCP_TOOL_NAMES,
  type McpAgentLane,
  mcpComposePlan,
  mcpIngestReference,
  mcpListVitrine,
  mcplane,
  mcpMineProfile,
  mcpPublishTrack,
  mcpRenderTrack,
  toolcatalog,
} from "../mcplane.ts";
import { validatePatternProject } from "../patternenums.ts";
import type { GenreProfile } from "../patternminer.ts";
import type { RenderTrackRow } from "../renderworker.ts";
import { encodeWav } from "../wavwriter.ts";

/** The gateway origin every call rides (a public https host — the law). */
const ORIGIN = "https://gateway.example.com";
/** The agent identity the caller carries (its own, minted by the test). */
const AGENT = mintid();
/** The job id the fake gateway mints for the ingest walk. */
const INGEST_JOB = mintid();
/** The job id the fake gateway mints for the mine walk. */
const MINE_JOB = mintid();
/** The profile row id the mine walk lands. */
const PROFILE_ROW_ID = 7;
/** The job id the fake gateway mints for the render walk. */
const RENDER_JOB = mintid();
/** The wav pointer the render walk lands. */
const WAV_POINTER = mintid();
/** The track id the render walk stamps. */
const TRACK_ID = mintid();

/** One recorded wire call. */
interface WireCall {
  method: string;
  url: string;
  body: string | null;
}

/** The fake gateway fetch — records every call and answers from the route
 * table (the debonair wire shapes verbatim; the walk routes shift their
 * row queues so the poll loop proves it waits).
 *
 * @param routes the route table ("METHOD path" → the answer builder).
 * @param walks the poll routes and their row queues (each poll shifts one
 * row until the queue empties).
 */
function fakegateway(
  routes: Record<string, () => Response>,
  walks: Record<string, Response[]> = {},
): { fetchImpl: typeof fetch; calls: WireCall[] } {
  const calls: WireCall[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    calls.push({ method: init?.method ?? "GET", url, body: typeof init?.body === "string" ? init.body : null });
    const key = `${(init?.method ?? "GET").toUpperCase()} ${url.slice(ORIGIN.length)}`;
    const walk = walks[key];
    if (walk !== undefined && walk.length > 0) return walk.shift() ?? Response.json({}, { status: 500 });
    const route = routes[key];
    if (route !== undefined) return route();
    return Response.json({ error: { code: "not-found", message: `no lane answers ${key}` } }, { status: 404 });
  };
  return { fetchImpl, calls };
}

/** The lane over one fake gateway (the agent identity, the deps seat, the
 * fast poll rhythm the walk-waiting tools ride). */
function lanewith(fetchImpl: typeof fetch): McpAgentLane {
  const built = mcplane({
    origin: ORIGIN,
    agentId: AGENT,
    deps: { fetchImpl },
    pollIntervalMs: 1,
    pollDeadlineMs: 1000,
  });
  assert.ok(built !== null, "the lawful origin builds the lane");
  return built;
}

/** A tiny deterministic wav fixture (honest bytes for the base64 lane). */
function wavfixture(): Uint8Array {
  const mono = new Float32Array(800);
  for (let index = 0; index < mono.length; index++) {
    mono[index] = 0.5 * Math.sin((2 * Math.PI * 220 * index) / 8000);
  }
  return encodeWav([mono], { sampleRate: 8000, bitDepth: 16 });
}

/** The reference bytes every ingest call posts. */
const BYTES = wavfixture();
/** The base64 of the fixture (the exact json lane text). */
const BYTES_B64 = Buffer.from(BYTES).toString("base64");

/** The trap corpus profile the profile routes answer (a valid
 * debonair.profile/1 document — the composer's own seat). */
const PROFILE: GenreProfile = {
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
};

/** One profile row of any genre key (the wire projection the routes
 * answer — the document's genre field rides the row's own key). */
function profilerow(genre: string): GatewayProfileRow {
  return {
    id: PROFILE_ROW_ID,
    genre,
    referenceIds: PROFILE.referenceIds,
    profile: { ...PROFILE, genre },
    createdAt: "2026-06-02T00:00:00.000Z",
  };
}

/** The track row the render walk stamps and the publish flips (the
 * visibility lane the merged renderworker row carries — the walk lands
 * private, the fixture answers the published lane the status names). */
function trackrow(status: string): RenderTrackRow {
  return {
    id: TRACK_ID,
    ownerId: AGENT,
    name: "dark trap night",
    genre: "trap",
    seconds: 8,
    status,
    wavPointer: WAV_POINTER,
    visibility: "vitrine",
    createdAt: "2026-06-03T00:00:00.000Z",
  };
}

/** One ingest ledger row the poll route answers. */
function ingestrow(
  id: string,
  state: "queued" | "running" | "done" | "failed",
  fraction: number,
  phase: string | null,
  documentId: string | null,
  error: string | null = null,
): Response {
  return Response.json({
    id,
    ownerId: AGENT,
    state,
    phase,
    fraction,
    error,
    documentId,
    createdAt: "2026-06-01T00:00:00.000Z",
    finishedAt: state === "done" || state === "failed" ? "2026-06-01T00:00:02.000Z" : null,
  });
}

/** One render ledger row the poll route answers. */
function renderrow(
  state: "queued" | "rendering" | "done" | "failed",
  fraction: number,
  phase: string | null,
  wavPointer: string | null,
  error: string | null = null,
): Response {
  return Response.json({
    id: RENDER_JOB,
    ownerId: AGENT,
    state,
    phase,
    fraction,
    error,
    wavPointer,
    createdAt: "2026-06-01T00:00:00.000Z",
    finishedAt: state === "done" || state === "failed" ? "2026-06-01T00:00:02.000Z" : null,
  });
}

/** The full fake gateway every happy walk rides (the trap and drill
 * profile reads, the owner shelf beside the public vitrine). */
function happygateway(): { fetchImpl: typeof fetch; calls: WireCall[] } {
  return fakegateway(
    {
      "POST /api/v1/ingest/upload": () => Response.json({ jobId: INGEST_JOB }, { status: 201 }),
      "POST /api/v1/profiles/mine": () => Response.json({ jobId: MINE_JOB }, { status: 201 }),
      "GET /api/v1/profiles/trap": () => Response.json(profilerow("trap")),
      "GET /api/v1/profiles/drill": () => Response.json(profilerow("drill")),
      "POST /api/v1/generate/render": () => Response.json({ jobId: RENDER_JOB }, { status: 201 }),
      [`POST /api/v1/tracks/${TRACK_ID}/publish`]: () => Response.json(trackrow("published")),
      "GET /api/v1/vitrine": () => Response.json({ tracks: [trackrow("ready")], profiles: [profilerow("trap")] }),
      [`GET /api/v1/vitrine?ownerId=${AGENT}`]: () =>
        Response.json({ tracks: [trackrow("ready")], profiles: [profilerow("trap")] }),
    },
    {
      [`GET /api/v1/ingest/jobs/${INGEST_JOB}`]: [ingestrow(INGEST_JOB, "done", 1, "row", TRACK_ID)],
      [`GET /api/v1/ingest/jobs/${MINE_JOB}`]: [ingestrow(MINE_JOB, "done", 1, "store", String(PROFILE_ROW_ID))],
      [`GET /api/v1/generate/jobs/${RENDER_JOB}`]: [
        renderrow("rendering", 0.5, "render", null),
        renderrow("done", 1, "store", WAV_POINTER),
      ],
    },
  );
}

describe("the tool catalog (the family mcp contract)", () => {
  it("carries the six namespaced tools with the metadata law", () => {
    assert.equal(MCP_DOMAIN, "debonair");
    const catalog = toolcatalog();
    assert.deepEqual(
      catalog.map((tool) => tool.name),
      [
        "debonair.ingest_reference",
        "debonair.mine_profile",
        "debonair.compose_plan",
        "debonair.render_track",
        "debonair.publish_track",
        "debonair.list_vitrine",
      ],
    );
    assert.deepEqual(
      [...MCP_TOOL_NAMES],
      catalog.map((tool) => tool.name),
    );
    for (const tool of catalog) {
      assert.ok(tool.name.startsWith(`${MCP_DOMAIN}.`), "every name carries its domain prefix");
      assert.equal(typeof tool.version, "number");
      assert.ok(tool.risk === "read" || tool.risk === "write");
      assert.ok(tool.consent.length > 0, "every tool states its consent requirement");
      assert.equal(tool.inputs.type, "object");
      assert.ok(Array.isArray(tool.inputs.required));
      for (const property of Object.values(tool.inputs.properties)) {
        assert.ok(["string", "number", "boolean", "object", "array"].includes(property.type));
        assert.ok(property.description.length > 0, "the openapi style field layout");
      }
    }
    // the write tools carry their consent gates; the reads answer none
    assert.deepEqual(
      catalog.filter((tool) => tool.risk === "write").map((tool) => tool.name),
      ["debonair.ingest_reference", "debonair.mine_profile", "debonair.render_track", "debonair.publish_track"],
    );
    assert.deepEqual(
      catalog.filter((tool) => tool.risk === "read").map((tool) => tool.name),
      ["debonair.compose_plan", "debonair.list_vitrine"],
    );
  });
});

describe("the opt-in gate (the lane only answers when configured)", () => {
  it("refuses to build on an absent config, an empty or an unlawful origin", () => {
    assert.equal(mcplane(null), null);
    assert.equal(mcplane(undefined), null);
    assert.equal(mcplane({ origin: "" }), null);
    assert.equal(mcplane({ origin: "http://gateway.example.com" }), null, "http never rides");
    assert.equal(mcplane({ origin: "https://localhost" }), null, "loopback never rides");
    assert.notEqual(mcplane({ origin: `${ORIGIN}/` }), null, "the lawful origin builds (the trailing slash folds)");
  });

  it("mints the agent identity per lane build and keeps the caller's own", () => {
    const built = mcplane({ origin: ORIGIN });
    assert.ok(built !== null);
    assert.equal(built.origin, ORIGIN);
    assert.match(built.agentId, /^[1-9]\d{0,19}$/, "the minted decimal form");
    const carried = mcplane({ origin: ORIGIN, agentId: AGENT });
    assert.ok(carried !== null);
    assert.equal(carried.agentId, AGENT, "the caller's identity rides");
  });

  it("answers the not-configured refusal for every tool — the lane never opens silently", async () => {
    for (const name of MCP_TOOL_NAMES) {
      const answer = await calltool(null, name, {});
      assert.ok(!answer.ok, `${name} refuses`);
      assert.equal(answer.code, "not-configured");
      assert.match(answer.message, /the deploy configures the gateway origin/);
    }
  });
});

describe("debonair.ingest_reference (the reference library grows without a human)", () => {
  it("posts the reference through the upload route with the agent identity and the vitrine visibility", async () => {
    const { fetchImpl, calls } = happygateway();
    const answer = await mcpIngestReference(lanewith(fetchImpl), {
      name: "night drive take.wav",
      genre: "trap",
      bytes: BYTES_B64,
    });
    assert.ok(answer.ok);
    assert.deepEqual(answer.result, {
      jobId: INGEST_JOB,
      genre: "trap",
      name: "night drive take.wav",
      serviceId: AGENT,
      kind: "reference",
      visibility: "vitrine",
    });
    // the wire law: the same upload route the bench rides, the agent stamps the owner column
    const call = calls[0];
    assert.ok(call);
    assert.equal(call.method, "POST");
    assert.equal(call.url, `${ORIGIN}/api/v1/ingest/upload`);
    assert.deepEqual(JSON.parse(call.body ?? "{}"), {
      bytes: BYTES_B64,
      name: "night drive take.wav",
      ownerId: AGENT,
      kind: "reference",
      visibility: "vitrine",
    });
  });

  it("refuses the off-dictionary genre and the dishonest base64 before any byte leaves the host", async () => {
    const { fetchImpl, calls } = happygateway();
    const genre = await mcpIngestReference(lanewith(fetchImpl), { name: "take.wav", genre: "waltz", bytes: BYTES_B64 });
    assert.ok(!genre.ok);
    assert.equal(genre.code, "bad-args");
    assert.match(genre.message, /off the style dictionary/);
    const bytes = await mcpIngestReference(lanewith(fetchImpl), {
      name: "take.wav",
      genre: "trap",
      bytes: "not*base64==",
    });
    assert.ok(!bytes.ok && bytes.code === "bad-args");
    const missing = await mcpIngestReference(lanewith(fetchImpl), { genre: "trap", bytes: BYTES_B64 });
    assert.ok(!missing.ok && missing.code === "bad-args", "the name is required");
    assert.equal(calls.length, 0, "no byte left the host");
  });
});

describe("debonair.mine_profile (the genre profile job)", () => {
  it("queues the mine under the agent identity and answers the landed profile row", async () => {
    const { fetchImpl, calls } = happygateway();
    const answer = await mcpMineProfile(lanewith(fetchImpl), { genre: "trap" });
    assert.ok(answer.ok);
    assert.deepEqual(answer.result, {
      jobId: MINE_JOB,
      profileId: String(PROFILE_ROW_ID),
      genre: "trap",
      ownerId: AGENT,
    });
    const mine = calls[0];
    assert.ok(mine);
    assert.equal(mine.method, "POST");
    assert.equal(mine.url, `${ORIGIN}/api/v1/profiles/mine`);
    assert.deepEqual(JSON.parse(mine.body ?? "{}"), { genre: "trap", ownerId: AGENT });
    assert.equal(calls[1]?.url, `${ORIGIN}/api/v1/ingest/jobs/${MINE_JOB}`, "the shared ledger carries the walk");
  });

  it("waits a riding walk, answers the failed walk with the honest error and refuses the off-dictionary genre", async () => {
    const riding = fakegateway(
      { "POST /api/v1/profiles/mine": () => Response.json({ jobId: MINE_JOB }, { status: 201 }) },
      {
        [`GET /api/v1/ingest/jobs/${MINE_JOB}`]: [
          ingestrow(MINE_JOB, "running", 1 / 3, "collect", null),
          ingestrow(MINE_JOB, "done", 1, "store", String(PROFILE_ROW_ID)),
        ],
      },
    );
    const landed = await mcpMineProfile(lanewith(riding.fetchImpl), { genre: "trap" });
    assert.ok(landed.ok, "the poll loop waits past the riding row");
    const failing = fakegateway(
      { "POST /api/v1/profiles/mine": () => Response.json({ jobId: MINE_JOB }, { status: 201 }) },
      {
        [`GET /api/v1/ingest/jobs/${MINE_JOB}`]: [
          ingestrow(MINE_JOB, "failed", 1 / 3, "collect", null, "empty-set: the genre carries no references"),
        ],
      },
    );
    const refusal = await mcpMineProfile(lanewith(failing.fetchImpl), { genre: "trap" });
    assert.ok(!refusal.ok);
    assert.equal(refusal.code, "job-failed");
    assert.match(refusal.message ?? "", /empty-set/);
    const genre = await mcpMineProfile(lanewith(failing.fetchImpl), { genre: "waltz" });
    assert.ok(!genre.ok && genre.code === "bad-args");
  });
});

describe("debonair.compose_plan (the pure composer over the freshest profile)", () => {
  it("reads the profile through the gateway and answers the validated plan (the determinism law)", async () => {
    const { fetchImpl, calls } = happygateway();
    const answer = await mcpComposePlan(lanewith(fetchImpl), { prompt: "808 sub", genre: "trap" });
    assert.ok(answer.ok);
    const result = answer.result as ComposePlanResult;
    assert.equal(result.genre, "trap");
    assert.equal(result.prompt, "808 sub");
    const checked = validatePatternProject(result.plan);
    assert.ok(checked.ok, "the plan passes the pattern contract");
    assert.equal(calls[0]?.url, `${ORIGIN}/api/v1/profiles/trap`, "the freshest profile reads through the gateway");
    // the determinism law: the same prompt and salt answer the same plan
    const again = await mcpComposePlan(lanewith(fetchImpl), { prompt: "808 sub", genre: "trap" });
    assert.ok(again.ok);
    assert.deepEqual((again.result as ComposePlanResult).plan, result.plan);
  });

  it("resolves the genre from the prompt and refuses the unmatched prompt", async () => {
    const { fetchImpl, calls } = happygateway();
    const matched = await mcpComposePlan(lanewith(fetchImpl), { prompt: "make me a drill beat" });
    assert.ok(matched.ok);
    const result = matched.result as ComposePlanResult;
    assert.equal(result.genre, "drill", "the prompt's own match");
    assert.equal(calls[0]?.url, `${ORIGIN}/api/v1/profiles/drill`);
    const unmatched = await mcpComposePlan(lanewith(fetchImpl), { prompt: "zzz qqq wibble" });
    assert.ok(!unmatched.ok);
    assert.equal(unmatched.code, "bad-args");
    assert.match(unmatched.message ?? "", /name the genre explicitly/);
    const salted = await mcpComposePlan(lanewith(fetchImpl), { prompt: "808 sub", salt: 12 });
    assert.ok(!salted.ok && salted.code === "bad-args", "the salt, when it rides, must be a string");
  });
});

describe("debonair.render_track (the take lands under the agent identity)", () => {
  it("queues the composed plan, waits the walk and resolves the track id through the owner shelf", async () => {
    const { fetchImpl, calls } = happygateway();
    const composed = await mcpComposePlan(lanewith(fetchImpl), { prompt: "808 sub", genre: "trap" });
    assert.ok(composed.ok);
    const answer = await mcpRenderTrack(lanewith(fetchImpl), { plan: (composed.result as ComposePlanResult).plan });
    assert.ok(answer.ok);
    assert.deepEqual(answer.result, {
      jobId: RENDER_JOB,
      wavPointer: WAV_POINTER,
      trackId: TRACK_ID,
      ownerId: AGENT,
    });
    // the wire law: the queue posts the canonical plan with the agent owner stamp
    const queue = calls.find((call) => call.url === `${ORIGIN}/api/v1/generate/render`);
    assert.ok(queue);
    const body = JSON.parse(queue.body ?? "{}") as { ownerId: string; plan: unknown };
    assert.equal(body.ownerId, AGENT);
    // the owner shelf read resolves the track id (the walk's own stamp)
    const shelf = calls.find((call) => call.url === `${ORIGIN}/api/v1/vitrine?ownerId=${AGENT}`);
    assert.ok(shelf, "the vitrine read carries the agent identity");
  });

  it("composes from the prompt when no plan rides and refuses the broken plan", async () => {
    const { fetchImpl, calls } = happygateway();
    const answer = await mcpRenderTrack(lanewith(fetchImpl), { prompt: "808 sub", genre: "trap" });
    assert.ok(answer.ok);
    assert.equal(answer.result.trackId, TRACK_ID);
    assert.ok(
      calls.some((call) => call.url === `${ORIGIN}/api/v1/profiles/trap`),
      "the prompt composed first",
    );
    const broken = await mcpRenderTrack(lanewith(fetchImpl), { plan: { schema: "debonair.pattern/1" } });
    assert.ok(!broken.ok && broken.code === "bad-args");
    assert.match(broken.message ?? "", /pattern contract/);
    const neither = await mcpRenderTrack(lanewith(fetchImpl), {});
    assert.ok(!neither.ok && neither.code === "bad-args", "a render needs the plan or the prompt");
  });
});

describe("debonair.publish_track (the vitrine is the owner's move)", () => {
  it("flips the row under the agent identity", async () => {
    const { fetchImpl, calls } = happygateway();
    const answer = await mcpPublishTrack(lanewith(fetchImpl), { trackId: TRACK_ID });
    assert.ok(answer.ok);
    assert.equal(answer.result.id, TRACK_ID);
    assert.equal(answer.result.status, "published");
    const call = calls[0];
    assert.ok(call);
    assert.equal(call.method, "POST");
    assert.equal(call.url, `${ORIGIN}/api/v1/tracks/${TRACK_ID}/publish`);
    assert.deepEqual(JSON.parse(call.body ?? "{}"), { ownerId: AGENT });
  });

  it("answers the foreign track with the wire status (the owner law)", async () => {
    const foreign = fakegateway({
      [`POST /api/v1/tracks/${TRACK_ID}/publish`]: () =>
        Response.json(
          { error: { code: "forbidden", message: `the track ${TRACK_ID} answers to another owner` } },
          { status: 403 },
        ),
    });
    const answer = await mcpPublishTrack(lanewith(foreign.fetchImpl), { trackId: TRACK_ID });
    assert.ok(!answer.ok);
    assert.equal(answer.code, "lane-refused");
    assert.ok(answer.lane !== undefined && answer.lane.status === 403);
    assert.match(answer.message, /another owner/);
    const missing = await mcpPublishTrack(lanewith(foreign.fetchImpl), {});
    assert.ok(!missing.ok && missing.code === "bad-args");
  });
});

describe("debonair.list_vitrine (the public surface)", () => {
  it("answers the published tracks beside the freshest profiles", async () => {
    const { fetchImpl, calls } = happygateway();
    const answer = await mcpListVitrine(lanewith(fetchImpl), {});
    assert.ok(answer.ok);
    const surface = answer.result as ListVitrineResult;
    assert.equal(surface.tracks.length, 1);
    assert.equal(surface.tracks[0]?.wavPointer, WAV_POINTER);
    assert.equal(surface.profiles.length, 1);
    assert.equal(surface.profiles[0]?.profile.genre, "trap");
    assert.equal(calls[0]?.url, `${ORIGIN}/api/v1/vitrine`, "the public read carries no owner query");
  });
});

describe("the tools/call dispatch law", () => {
  it("answers unknown-tool for a foreign name and never resolves the bare name", async () => {
    const { fetchImpl } = happygateway();
    const agent = lanewith(fetchImpl);
    const foreign = await calltool(agent, "vault.upload", {});
    assert.ok(!foreign.ok);
    assert.equal(foreign.code, "unknown-tool");
    assert.match(foreign.message, /debonair\.ingest_reference/);
    // the collision law: a bare name resolves only when exactly one tool of
    // the catalog carries it — the debonair catalog answers namespaced names
    const bare = await calltool(agent, "ingest_reference", {});
    assert.ok(!bare.ok && bare.code === "unknown-tool");
  });

  it("hands the empty args through when the caller carries none", async () => {
    const { fetchImpl } = happygateway();
    const agent = lanewith(fetchImpl);
    const answer = await calltool(agent, "debonair.list_vitrine", undefined);
    assert.ok(answer.ok);
  });

  it("rides the same gateway lanes through the calltool seat as the direct seats", async () => {
    const { fetchImpl, calls } = happygateway();
    const agent = lanewith(fetchImpl);
    const answer = await calltool(agent, "debonair.ingest_reference", {
      name: "night drive take.wav",
      genre: "trap",
      bytes: BYTES_B64,
    });
    assert.ok(answer.ok);
    assert.equal(calls[0]?.url, `${ORIGIN}/api/v1/ingest/upload`);
  });
});
