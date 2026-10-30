// # generateclient.test — the typed client of the generation lane (waves
// PV4.004 + PV4.005): the pure composition lane (the reference fold — the
// genre matrix's matcher over the document name, the same grouping law the
// miner lane rides; the composer over the profile with the salt law — the
// same prompt and salt answer the same plan, a fresh salt a fresh take;
// the opt-in voice key — the plan with voice differs from without, the
// honest assertion; the no-references refusal — the composer never rides
// a zero profile) and the http seats (the queue, the poll, the publish,
// the vitrine list and the wav download through injected fetch doubles —
// the offline origin law, the abort window, the 400 bad-request lane, the
// foreign-shape bad-response lane, and the wire guards skipping a foreign
// row without blocking the shelf). runnable with vitest:
//   pnpm vitest run tests/generateclient.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { AudioReport } from "../analyze.ts";
import { mintid } from "../bigintids.ts";
import {
  composeTake,
  fetchTakeWav,
  fetchVitrine,
  GENERATE_CALL_TIMEOUT_MS,
  type GenerateClientDeps,
  type GenerateReference,
  ownerid,
  pollRenderJob,
  publishTrack,
  queueRender,
} from "../generateclient.ts";
import type { IngestDocument, IngestSegment } from "../ingest.ts";
import { serializePattern, validatePatternProject } from "../patternenums.ts";
import { singPattern } from "../vocalsynth.ts";

// ---------------------------------------------------------------------------
// the fixtures (the honest corpus shape — the same values the composer
// suite rides, the names carrying the genre the grouping law reads)
// ---------------------------------------------------------------------------

/** The tonal mass of the trap corpus (the A tonic dominant). */
const TRAP_CHROMA = (() => {
  const chroma = new Array<number>(12).fill(0.02);
  chroma[9] = 0.32;
  chroma[5] = 0.15;
  chroma[7] = 0.15;
  chroma[0] = 0.1;
  return chroma;
})();

/** Builds one ingested document shaped like the trap corpus. */
function trapReference(id: string): IngestDocument {
  const segments: IngestSegment[] = [];
  for (let s = 0; s < 16; s++) {
    segments.push({
      rms: 0.28,
      peak: 0.9,
      zcr: 0.055,
      cent: 600,
      flat: 0.055,
      beat: 0.14,
      onsets: 2,
      bands: [0.55, 0.26, 0.19],
      note: "",
      chroma: TRAP_CHROMA,
      s,
    });
  }
  const report: AudioReport = {
    sampleRate: 8000,
    durationSeconds: 0,
    rhythm: { bpm: 140, onsetStrength: 0 },
    key: { tonic: 9, tonicName: "", mode: "minor" },
    loudness: { integrated: -9 },
    spectrum: { bands: [0, 0, 0, 0, 0, 0, 0], centroidHz: 0 },
    structure: [],
    fingerprintHashes: 0,
  };
  return {
    schema: "debonair.ingest/1",
    name: `dark trap reference ${id}`,
    ingestedAt: "2026-05-01T00:00:00.000Z",
    sampleRate: 8000,
    durationSeconds: segments.length,
    mix: report,
    segments,
    pcmhash: 0,
    stems: [],
  };
}

/** One session reference (the id, the name and the document the fold reads). */
function reference(id: string): GenerateReference {
  const doc = trapReference(id);
  return { id, name: doc.name, document: doc };
}

/** The law-abiding origin the happy lanes ride (a public https host). */
const ORIGIN = "https://debonair.example";

/** One json answer the fetch double serves. */
function jsonresponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

/** Builds one fetch double over a route map (method + path → the answer).
 * An answer may be a Response (served verbatim), a plain json-able value
 * (serialized) or a function of the call's init — the side-effect lanes
 * (the queue recorder) ride the function form. */
function fetchdouble(routes: Record<string, unknown | Response>): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const answer = routes[`${method} ${url}`];
    if (answer === undefined) return jsonresponse({ error: { code: "not-found", message: "no double" } }, 404);
    const value = answer instanceof Function ? await answer(init) : answer;
    return value instanceof Response ? value : jsonresponse(value);
  }) as typeof fetch;
}

/** The composed plan over the trap corpus (the fold + the composer). */
function composedPlan(salt = ""): ReturnType<typeof composeTake> {
  return composeTake({
    prompt: "dark trap, hard 808s, C minor, 140 bpm",
    salt,
    voice: false,
    references: [reference("r1"), reference("r2"), reference("r3")],
  });
}

// ---------------------------------------------------------------------------
// the pure lane (the fold, the composer, the salt, the voice)
// ---------------------------------------------------------------------------

describe("generateclient — composeTake (the pure lane)", () => {
  it("folds the references of the genre into the profile and composes the plan", () => {
    const answer = composedPlan();
    assert.ok(answer.ok, answer.ok ? "" : answer.message);
    const checked = validatePatternProject(answer.composition.plan);
    assert.ok(checked.ok, "the composed plan answers its own contract");
    assert.equal(answer.composition.profileGenre, "trap");
    assert.equal(answer.composition.referenceCount, 3);
    assert.ok(answer.composition.similarity > 0, "the audit chain carries the similarity");
    assert.equal(answer.composition.sung, false, "the voice key off answers the instrumental plan");
  });

  it("answers the same plan for the same prompt and salt, a fresh plan for a fresh salt", () => {
    const first = composedPlan();
    const again = composedPlan();
    assert.ok(first.ok && again.ok);
    assert.equal(
      serializePattern(first.composition.plan),
      serializePattern(again.composition.plan),
      "the same prompt and salt answer the same plan",
    );
    const fresh = composedPlan("fresh-salt");
    assert.ok(fresh.ok);
    assert.notEqual(
      serializePattern(first.composition.plan),
      serializePattern(fresh.composition.plan),
      "a fresh salt answers a fresh take",
    );
  });

  it("answers a plan with voice that differs from the plan without (the honest assertion)", () => {
    const instrumental = composeTake({
      prompt: "dark trap, hard 808s",
      salt: "",
      voice: false,
      references: [reference("r1"), reference("r2")],
    });
    const voiced = composeTake({
      prompt: "dark trap, hard 808s",
      salt: "",
      voice: true,
      references: [reference("r1"), reference("r2")],
    });
    assert.ok(instrumental.ok && voiced.ok);
    assert.ok(voiced.composition.sung, "the voice key rode and the sung notes landed");
    assert.notEqual(
      serializePattern(instrumental.composition.plan),
      serializePattern(voiced.composition.plan),
      "the plan with voice differs from the plan without",
    );
    assert.ok(
      voiced.composition.plan.notes.length > instrumental.composition.plan.notes.length,
      "the sung line lands on top of the instrumental",
    );
  });

  it("refuses honestly when no reference of the genre answers the fold", () => {
    const answer = composeTake({
      prompt: "dark trap, hard 808s",
      salt: "",
      voice: false,
      references: [],
    });
    assert.ok(!answer.ok);
    assert.equal(answer.code, "no-references");
    const foreign = composeTake({
      prompt: "dark trap, hard 808s",
      salt: "",
      genreId: "ambient",
      voice: false,
      references: [reference("r1")],
    });
    assert.ok(!foreign.ok, "a trap corpus never feeds the ambient fold");
    assert.equal(foreign.code, "no-references");
  });
});

// ---------------------------------------------------------------------------
// the http seats (the lane law under fetch doubles)
// ---------------------------------------------------------------------------

describe("generateclient — the http seats", () => {
  const plan = (() => {
    const answer = composedPlan();
    if (!answer.ok) throw new Error(answer.message);
    return answer.composition.plan;
  })();
  const owner = mintid();

  it("queues the render and polls the walk to done", async () => {
    const calls: string[] = [];
    const fetchImpl = fetchdouble({
      "POST https://debonair.example/api/v1/render": () => {
        calls.push("queue");
        return { jobId: "job-1" };
      },
      "GET https://debonair.example/api/v1/render/jobs/job-1": () => {
        calls.push("poll");
        return {
          id: "job-1",
          ownerId: owner,
          state: "done",
          phase: "store",
          fraction: 1,
          error: null,
          wavPointer: mintid(),
          trackPointer: mintid(),
          createdAt: "2026-06-01T00:00:00.000Z",
          finishedAt: "2026-06-01T00:00:02.000Z",
        };
      },
    });
    const queued = await queueRender({ plan, ownerId: owner, origin: ORIGIN }, { fetchImpl });
    assert.ok(queued.ok, queued.ok ? "" : queued.error.message);
    assert.equal(queued.data.jobId, "job-1");
    assert.deepEqual(calls, ["queue"]);
    const polled = await pollRenderJob("job-1", ORIGIN, { fetchImpl });
    assert.ok(polled.ok, polled.ok ? "" : polled.error.message);
    assert.equal(polled.data.state, "done");
    assert.ok(polled.data.trackPointer !== null, "the track pointer the publish key rides");
  });

  it("publishes the track and lists the vitrine under the visibility law", async () => {
    const trackId = mintid();
    const wav = mintid();
    const fetchImpl = fetchdouble({
      [`POST ${ORIGIN}/api/v1/tracks`]: {
        kind: "render",
        id: trackId,
        name: "Dark Trap",
        genre: "dark trap",
        seconds: 9,
        status: "ready",
        wavPointer: wav,
        ownerId: owner,
        publishedAt: "2026-06-01T00:00:00.000Z",
      },
      [`GET ${ORIGIN}/api/v1/tracks`]: {
        records: [
          {
            kind: "render",
            id: trackId,
            name: "Dark Trap",
            genre: "dark trap",
            seconds: 9,
            status: "ready",
            wavPointer: wav,
            ownerId: owner,
            publishedAt: "2026-06-01T00:00:00.000Z",
          },
          {
            kind: "reference",
            id: mintid(),
            name: "dark trap reference r1",
            genre: "Trap",
            seconds: 16,
            status: "ready",
            wavPointer: mintid(),
            ownerId: owner,
            publishedAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      },
    });
    const published = await publishTrack({ trackId, ownerId: owner, origin: ORIGIN }, { fetchImpl });
    assert.ok(published.ok, published.ok ? "" : published.error.message);
    assert.equal(published.data.kind, "render");
    assert.equal(published.data.id, trackId);
    const shelf = await fetchVitrine(ORIGIN, { fetchImpl });
    assert.ok(shelf.ok, shelf.ok ? "" : shelf.error.message);
    assert.equal(shelf.data.length, 2, "the generated takes beside the ingested references, one grammar");
    assert.ok(shelf.data.some((row) => row.kind === "render") && shelf.data.some((row) => row.kind === "reference"));
  });

  it("refuses the offline origin before any byte leaves the host", async () => {
    let called = false;
    const fetchImpl = (async () => {
      called = true;
      return jsonresponse({});
    }) as typeof fetch;
    const refused = await queueRender({ plan, ownerId: owner, origin: "http://insecure.example" }, { fetchImpl });
    assert.ok(!refused.ok);
    assert.equal(refused.error.code, "offline");
    const local = await fetchVitrine("https://localhost", { fetchImpl });
    assert.ok(!local.ok);
    assert.equal(local.error.code, "offline");
    assert.equal(called, false, "the host law refused before any fetch rode");
  });

  it("maps the 400 lane to bad-request and the 500 lane to refused", async () => {
    const fetchImpl = fetchdouble({
      [`POST ${ORIGIN}/api/v1/render`]: jsonresponse(
        { error: { code: "bad-request", message: "the plan failed the pattern contract" } },
        400,
      ),
      [`GET ${ORIGIN}/api/v1/tracks`]: jsonresponse(
        { error: { code: "db-failed", message: "the shelf refused" } },
        500,
      ),
    });
    const refused = await queueRender({ plan, ownerId: owner, origin: ORIGIN }, { fetchImpl });
    assert.ok(!refused.ok);
    assert.equal(refused.error.code, "bad-request");
    assert.equal(refused.error.status, 400);
    assert.ok(refused.error.message.includes("pattern contract"));
    const shelf = await fetchVitrine(ORIGIN, { fetchImpl });
    assert.ok(!shelf.ok);
    assert.equal(shelf.error.code, "refused");
    assert.equal(shelf.error.status, 500);
  });

  it("answers bad-response when a 2xx body fails the shape guard", async () => {
    const fetchImpl = fetchdouble({
      [`GET ${ORIGIN}/api/v1/render/jobs/job-9`]: { id: "job-9", state: "exploded" },
      [`GET ${ORIGIN}/api/v1/tracks`]: {
        records: [
          { kind: "alien", id: "x", name: "y" },
          {
            kind: "render",
            id: mintid(),
            name: "Good Row",
            genre: "trap",
            seconds: 4,
            status: "ready",
            wavPointer: mintid(),
            ownerId: owner,
            publishedAt: "2026-06-01T00:00:00.000Z",
          },
        ],
      },
    });
    const polled = await pollRenderJob("job-9", ORIGIN, { fetchImpl });
    assert.ok(!polled.ok);
    assert.equal(polled.error.code, "bad-response");
    const shelf = await fetchVitrine(ORIGIN, { fetchImpl });
    assert.ok(shelf.ok, "a foreign row never blocks the shelf");
    assert.equal(shelf.data.length, 1);
    assert.equal(shelf.data[0]?.name, "Good Row");
  });

  it("answers timeout when the gateway keeps silent past the window", async () => {
    const hanging = (async () =>
      new Promise<Response>(() => {
        /* the gateway never answers */
      })) as typeof fetch;
    const deps: GenerateClientDeps = { fetchImpl: hanging, timeoutMs: 5 };
    const polled = await pollRenderJob("job-1", ORIGIN, deps);
    assert.ok(!polled.ok);
    assert.equal(polled.error.code, "timeout");
    assert.equal(GENERATE_CALL_TIMEOUT_MS, 2500, "the call lanes ride the onboardingstate window");
  });

  it("fetches the wav bytes through the blob lane (the download's round trip)", async () => {
    const wav = new Uint8Array([82, 73, 70, 70, 4, 0, 0, 0, 87, 65, 86, 69]);
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      assert.ok(url.startsWith(`${ORIGIN}/api/v1/blob/`), "the download rides the blob route");
      return new Response(wav, { status: 200, headers: { "content-type": "audio/wav" } });
    }) as typeof fetch;
    const previous = globalThis.fetch;
    globalThis.fetch = fetchImpl;
    try {
      const answer = await fetchTakeWav({ blobId: mintid(), origin: ORIGIN });
      assert.ok(answer.ok, answer.ok ? "" : answer.error.message);
      assert.equal(answer.data.mime, "audio/wav");
      assert.equal(answer.data.byteCount, wav.length);
      assert.deepEqual(Array.from(answer.data.bytes), Array.from(wav), "the bytes round trip");
    } finally {
      globalThis.fetch = previous;
    }
  });

  it("refuses the wav lane honestly (the bad pointer, the offline origin)", async () => {
    const bad = await fetchTakeWav({ blobId: "not-a-pointer", origin: ORIGIN });
    assert.ok(!bad.ok);
    assert.equal(bad.error.code, "bad-request");
    const offline = await fetchTakeWav({ blobId: mintid(), origin: "https://192.168.0.10" });
    assert.ok(!offline.ok);
    assert.equal(offline.error.code, "offline");
  });
});

// ---------------------------------------------------------------------------
// the owner seat
// ---------------------------------------------------------------------------

describe("generateclient — the owner seat", () => {
  it("answers one minted decimal stamp per process (the session memo)", () => {
    const first = ownerid();
    const again = ownerid();
    assert.equal(first, again, "the session never re-mints");
    assert.ok(/^[0-9]+$/.test(first), "the minted decimal form");
    assert.ok(BigInt(first) > 0n, "a real pointer, never zero");
  });
});

// ---------------------------------------------------------------------------
// the vocal lane's never-blocking law (the client rides the module's own seat)
// ---------------------------------------------------------------------------

describe("generateclient — the voice key rides singPattern (never blocking)", () => {
  it("keeps the sung plan inside the pattern contract", () => {
    const answer = composedPlan();
    assert.ok(answer.ok);
    const sung = singPattern(answer.composition.plan, "voice-seed");
    const checked = validatePatternProject(sung);
    assert.ok(checked.ok, "the sung plan answers its own contract");
  });
});
