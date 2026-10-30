// # ingestclient.test — the typed client of the gateway ingest lane over
// an injected fake fetch: the happy upload → poll → done walk (the wire
// shapes pinned — the base64 json lane of the upload, the owner stamp,
// the kind and the visibility laws, the shelf query under the visibility
// law, the document read, the delete ack), the failure codes (400 the
// bad-request lane with the gateway's own message, the other statuses
// refused, a 2xx body that fails the shape guard bad-response, the silent
// gateway timeout on the injectable window, the network offline), the
// https law refusal before any call leaves the host (http, loopback and
// the empty origin), and the system ia lane posting the same route with
// the service identity (the body asserts the reference kind, the service
// owner stamp and the vitrine visibility; the genre law refuses off the
// style dictionary without a call). runnable with vitest:
// pnpm vitest run tests/ingestclient.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { mintid } from "../bigintids.ts";
import type { IngestJobValue } from "../gatewayapi.ts";
import { postReference, servicelaneid } from "../ialane.ts";
import { INGEST_SCHEMA_VERSION, ingestPcm } from "../ingest.ts";
import type { IngestClientResult } from "../ingestclient.ts";
import { deleteDocument, fetchDocument, fetchShelf, pollJob, uploadIngest } from "../ingestclient.ts";
import type { IngestStampRow } from "../ingestworker.ts";
import { encodeWav } from "../wavwriter.ts";

/** The gateway origin every call rides (a public https host — the law). */
const ORIGIN = "https://gateway.example.com";
/** The owner stamp of every test call (the minted decimal string). */
const OWNER = mintid();
/** The service identity the ia lane test carries (its own, not the process seat). */
const SERVICE = mintid();
/** The job id the fake gateway mints for the walk. */
const JOB_ID = mintid();
/** The document id the walk stamps when it lands. */
const DOC_ID = mintid();

/** A tiny deterministic prng — the same seed answers the same take. */
function seededrng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * The synthetic source of the upload fixture: two sines over a click
 * train, half a second at 8 khz — small enough to encode fast, honest
 * wav bytes for the wire (the fake gateway never runs the worker).
 */
function uploadfixture(): Uint8Array {
  const rng = seededrng(2027);
  const mono = new Float32Array(4000);
  for (let i = 0; i < mono.length; i++) {
    const t = i / 8000;
    const tones = 0.4 * Math.sin(2 * Math.PI * 220 * t) + 0.2 * Math.sin(2 * Math.PI * 331 * t);
    const click = t % 0.05 < 0.01 ? 0.5 * (rng() * 2 - 1) : 0;
    mono[i] = Math.max(-1, Math.min(1, tones + click));
  }
  return encodeWav([mono], { sampleRate: 8000, bitDepth: 16 });
}

/** The upload bytes every call posts (the base64 lane round trips them). */
const BYTES = uploadfixture();
/** The base64 of the fixture bytes (the exact json lane text). */
const BYTES_B64 = Buffer.from(BYTES).toString("base64");
/** The raw source name the upload lane carries. */
const SOURCE_NAME = "client walk take.wav";

/**
 * The synthetic document the stamped row carries — the real chain over a
 * seeded two-second take (the same shape the ingest schema tests ride).
 */
function stampfixture(): IngestStampRow {
  const mono = new Float32Array(16000);
  for (let i = 0; i < mono.length; i++) {
    const t = i / 8000;
    const bass = 0.4 * Math.sign(Math.sin(2 * Math.PI * 110 * t));
    const gate = t % 0.5 < 0.02 ? 0.8 : 0;
    mono[i] = Math.max(-1, Math.min(1, bass * 0.7 + gate));
  }
  const document = ingestPcm(mono, 8000, { name: "client walk take", at: "2026-01-01T00:00:00.000Z" });
  return {
    id: DOC_ID,
    ownerId: OWNER,
    kind: "upload",
    visibility: "private",
    name: "client walk take",
    mixPointer: mintid(),
    stemsPointer: mintid(),
    sizeBytes: BYTES.byteLength,
    sha256: "3a7f1c9e2b84d05f6a1e93c47d82b5a6f0c1d2e34f5a6b7c8d9e0f1a2b3c4d5e",
    sampleRate: 8000,
    durationSeconds: document.durationSeconds,
    pcmhash: document.pcmhash,
    ingestedAt: "2026-01-01T00:00:00.000Z",
    document,
  };
}

/** The stamped row the read and the shelf answer. */
const ROW = stampfixture();

/** The walk rows the fake gateway answers in poll order. */
const WALK: IngestJobValue[] = [
  {
    id: JOB_ID,
    ownerId: OWNER,
    state: "running",
    phase: "decode",
    fraction: 1 / 6,
    error: null,
    documentId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    finishedAt: null,
  },
  {
    id: JOB_ID,
    ownerId: OWNER,
    state: "running",
    phase: "store",
    fraction: 5 / 6,
    error: null,
    documentId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    finishedAt: null,
  },
  {
    id: JOB_ID,
    ownerId: OWNER,
    state: "done",
    phase: "row",
    fraction: 1,
    error: null,
    documentId: DOC_ID,
    createdAt: "2026-01-01T00:00:00.000Z",
    finishedAt: "2026-01-01T00:00:02.000Z",
  },
];

/** The failed row the failure lane answers. */
const FAILED: IngestJobValue = {
  id: JOB_ID,
  ownerId: OWNER,
  state: "failed",
  phase: "decode",
  fraction: 1 / 6,
  error: "bad-riff: wav needs the RIFF magic in the first four bytes",
  documentId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  finishedAt: "2026-01-01T00:00:01.000Z",
};

/** One recorded lane call (the url carries the query verbatim). */
interface LaneCall {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
}

/**
 * The fake fetch seam — records every call, answers from the handler.
 *
 * @param answer the handler (a Response or a promise of one).
 * @returns the fetch impl and the recorded calls.
 */
function fakelane(answer: (call: LaneCall) => Response | Promise<Response>): {
  fetchImpl: typeof fetch;
  calls: LaneCall[];
} {
  const calls: LaneCall[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const source = init?.headers as Record<string, string> | undefined;
    const headers: Record<string, string> = {};
    for (const name of Object.keys(source ?? {})) headers[name] = String(source?.[name]);
    const call: LaneCall = {
      method: init?.method ?? "GET",
      url: typeof input === "string" ? input : input.url,
      headers,
      body: typeof init?.body === "string" ? init.body : null,
    };
    calls.push(call);
    return answer(call);
  };
  return { fetchImpl, calls };
}

/** The fetch that hangs until the abort fires (the timeout lane). */
const hangfetch: typeof fetch = (_input, init) =>
  new Promise((_resolve, reject) => {
    init?.signal?.addEventListener(
      "abort",
      () => {
        reject(new DOMException("aborted", "AbortError"));
      },
      { once: true },
    );
  });

/** The walk router: the upload mints the job, the poll shifts the rows. */
function walkrouter(rows: IngestJobValue[]): (call: LaneCall) => Response {
  return (call) => {
    if (call.method === "POST" && call.url === `${ORIGIN}/api/v1/ingest/upload`) {
      return Response.json({ jobId: JOB_ID }, { status: 201 });
    }
    if (call.url === `${ORIGIN}/api/v1/ingest/jobs/${JOB_ID}`) {
      return Response.json(rows.shift() ?? WALK[WALK.length - 1]);
    }
    if (call.method === "GET" && call.url === `${ORIGIN}/api/v1/ingest/${DOC_ID}`) {
      return Response.json(ROW);
    }
    if (call.method === "GET" && call.url === `${ORIGIN}/api/v1/ingest?ownerId=${OWNER}`) {
      return Response.json({ records: [ROW] });
    }
    if (call.method === "DELETE" && call.url === `${ORIGIN}/api/v1/ingest/${DOC_ID}`) {
      return Response.json({ removed: true, id: DOC_ID });
    }
    return new Response("no lane answers", { status: 500 });
  };
}

/** Unwraps one ok result — a refusal fails the test with the code. */
function dataof<T>(result: IngestClientResult<T>): T {
  if (!result.ok) throw new Error(`the lane refused: ${result.error.code} — ${result.error.message}`);
  return result.data;
}

describe("the client walk over the injected fetch (the happy lane)", () => {
  it("posts the upload, polls the row to done, reads the shelf, the document and the delete", async () => {
    const { fetchImpl, calls } = fakelane(walkrouter([...WALK]));
    const upload = await uploadIngest(
      { bytes: BYTES, name: SOURCE_NAME, ownerId: OWNER, kind: "upload", visibility: "private", origin: ORIGIN },
      { fetchImpl },
    );
    assert.deepEqual(dataof(upload), { jobId: JOB_ID });
    // the wire law: POST /api/v1/ingest/upload, the json lane, the base64 bytes
    assert.equal(calls[0].method, "POST");
    assert.equal(calls[0].url, `${ORIGIN}/api/v1/ingest/upload`);
    assert.equal(calls[0].headers["content-type"], "application/json");
    assert.deepEqual(JSON.parse(calls[0].body ?? "{}"), {
      bytes: BYTES_B64,
      name: SOURCE_NAME,
      ownerId: OWNER,
      kind: "upload",
      visibility: "private",
    });
    // the base64 lane round trips the fixture bytes exact
    assert.deepEqual(Buffer.from(BYTES_B64, "base64"), Buffer.from(BYTES));

    const decode = dataof(await pollJob(JOB_ID, ORIGIN, { fetchImpl }));
    assert.equal(decode.state, "running");
    assert.equal(decode.phase, "decode");
    assert.equal(decode.fraction, 1 / 6);
    const store = dataof(await pollJob(JOB_ID, ORIGIN, { fetchImpl }));
    assert.equal(store.phase, "store");
    assert.equal(store.fraction, 5 / 6);
    const done = dataof(await pollJob(JOB_ID, ORIGIN, { fetchImpl }));
    assert.equal(done.state, "done");
    assert.equal(done.documentId, DOC_ID);
    assert.equal(done.finishedAt, "2026-01-01T00:00:02.000Z");
    assert.equal(calls[1].url, `${ORIGIN}/api/v1/ingest/jobs/${JOB_ID}`);
    assert.equal(calls[1].method, "GET");

    assert.deepEqual(dataof(await fetchDocument(DOC_ID, ORIGIN, { fetchImpl })), ROW);
    assert.deepEqual(dataof(await fetchShelf(ORIGIN, OWNER, { fetchImpl })), [ROW]);
    assert.equal(calls[4].url, `${ORIGIN}/api/v1/ingest/${DOC_ID}`);
    assert.equal(calls[4].method, "GET");
    // the visibility law: the shelf carries the owner query
    assert.equal(calls[5].url, `${ORIGIN}/api/v1/ingest?ownerId=${OWNER}`);
    assert.deepEqual(dataof(await deleteDocument(DOC_ID, ORIGIN, { fetchImpl })), { removed: true, id: DOC_ID });
    assert.equal(calls[6].method, "DELETE");
    assert.equal(calls[6].url, `${ORIGIN}/api/v1/ingest/${DOC_ID}`);
    assert.equal(calls.length, 7);
  });

  it("answers the failed row honestly when the walk lands failed", async () => {
    const { fetchImpl } = fakelane(walkrouter([FAILED]));
    const upload = await uploadIngest(
      { bytes: BYTES, name: SOURCE_NAME, ownerId: OWNER, kind: "upload", visibility: "private", origin: ORIGIN },
      { fetchImpl },
    );
    assert.ok(upload.ok);
    const row = dataof(await pollJob(JOB_ID, ORIGIN, { fetchImpl }));
    assert.equal(row.state, "failed");
    assert.equal(row.error, "bad-riff: wav needs the RIFF magic in the first four bytes");
  });

  it("keeps the vitrine shelf working without the owner query", async () => {
    const { fetchImpl, calls } = fakelane((call) => {
      assert.equal(call.url, `${ORIGIN}/api/v1/ingest`);
      return Response.json({ records: [ROW] });
    });
    assert.deepEqual(dataof(await fetchShelf(ORIGIN, undefined, { fetchImpl })), [ROW]);
    assert.equal(calls.length, 1);
  });

  it("skips the foreign shelf rows without breaking the list", async () => {
    const foreign = { ...ROW, ownerId: "not-a-pointer", mixPointer: "" };
    const { fetchImpl } = fakelane(() => Response.json({ records: [foreign, ROW, null] }));
    assert.deepEqual(dataof(await fetchShelf(ORIGIN, OWNER, { fetchImpl })), [ROW]);
  });
});

describe("the failure codes (never a throw)", () => {
  it("answers bad-request on the 400 lane with the gateway's own message", async () => {
    const { fetchImpl } = fakelane(() =>
      Response.json(
        { error: { code: "bad-owner", message: "the upload needs the owner pointer in the minted decimal form" } },
        { status: 400 },
      ),
    );
    const upload = await uploadIngest(
      {
        bytes: BYTES,
        name: SOURCE_NAME,
        ownerId: "not-a-pointer",
        kind: "upload",
        visibility: "private",
        origin: ORIGIN,
      },
      { fetchImpl },
    );
    assert.ok(!upload.ok);
    assert.equal(upload.error.code, "bad-request");
    assert.equal(upload.error.status, 400);
    assert.equal(upload.error.message, "the upload needs the owner pointer in the minted decimal form");
  });

  it("answers refused on the other statuses (the wire message rides)", async () => {
    const { fetchImpl } = fakelane(() =>
      Response.json({ error: { code: "db-failed", message: "the ledger refused the read" } }, { status: 500 }),
    );
    const row = await pollJob(JOB_ID, ORIGIN, { fetchImpl });
    assert.ok(!row.ok);
    assert.equal(row.error.code, "refused");
    assert.equal(row.error.status, 500);
    assert.equal(row.error.message, "the ledger refused the read");
  });

  it("answers bad-response when a 2xx body fails the shape guard", async () => {
    const notjson = fakelane(
      () => new Response("not json at all", { status: 200, headers: { "content-type": "text/plain" } }),
    );
    const row = await pollJob(JOB_ID, ORIGIN, { fetchImpl: notjson.fetchImpl });
    assert.ok(!row.ok);
    assert.equal(row.error.code, "bad-response");
    // a 200 that parses but carries no job row answers the same lane
    const wrongshape = fakelane(() => Response.json({ job: "the id field is missing" }));
    const upload = await uploadIngest(
      { bytes: BYTES, name: SOURCE_NAME, ownerId: OWNER, kind: "upload", visibility: "private", origin: ORIGIN },
      { fetchImpl: wrongshape.fetchImpl },
    );
    assert.ok(!upload.ok);
    assert.equal(upload.error.code, "bad-response");
    assert.equal(upload.error.status, 200);
  });

  it("answers timeout when the gateway keeps silent past the window", async () => {
    const row = await pollJob(JOB_ID, ORIGIN, { fetchImpl: hangfetch, timeoutMs: 60 });
    assert.ok(!row.ok);
    assert.equal(row.error.code, "timeout");
    assert.equal(row.error.status, null);
  });

  it("answers offline when the network refuses — never a throw", async () => {
    const { fetchImpl } = fakelane(() => {
      throw new Error("the dns is down");
    });
    const shelf = await fetchShelf(ORIGIN, OWNER, { fetchImpl });
    assert.ok(!shelf.ok);
    assert.equal(shelf.error.code, "offline");
    assert.equal(shelf.error.status, null);
  });
});

describe("the https law (the host guard before any call leaves)", () => {
  it("refuses the insecure, the loopback and the empty origin without a call", async () => {
    const { fetchImpl, calls } = fakelane(() => new Response("never read", { status: 200 }));
    for (const origin of ["http://gateway.example.com", "https://localhost", "https://10.0.0.8", ""]) {
      const upload = await uploadIngest(
        { bytes: BYTES, name: SOURCE_NAME, ownerId: OWNER, kind: "upload", visibility: "private", origin },
        { fetchImpl },
      );
      assert.ok(!upload.ok, `${origin} must refuse`);
      assert.equal(upload.error.code, "offline");
      assert.equal(upload.error.status, null);
    }
    assert.equal(calls.length, 0);
  });
});

describe("the system ia lane (the service identity through the same route)", () => {
  it("posts the reference with the service identity, the vitrine law and the genre record", async () => {
    const { fetchImpl, calls } = fakelane(() => Response.json({ jobId: JOB_ID }, { status: 201 }));
    const post = await postReference({
      bytes: BYTES,
      name: "ia reference take.wav",
      genre: "house",
      origin: ORIGIN,
      serviceId: SERVICE,
      deps: { fetchImpl },
    });
    assert.ok(post.ok);
    assert.deepEqual(post.data, {
      jobId: JOB_ID,
      genre: "house",
      name: "ia reference take.wav",
      serviceId: SERVICE,
      kind: "reference",
      visibility: "vitrine",
    });
    // the body asserts the service identity: the owner stamp, the kind and
    // the visibility the system lane rides
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, "POST");
    assert.equal(calls[0].url, `${ORIGIN}/api/v1/ingest/upload`);
    assert.deepEqual(JSON.parse(calls[0].body ?? "{}"), {
      bytes: BYTES_B64,
      name: "ia reference take.wav",
      ownerId: SERVICE,
      kind: "reference",
      visibility: "vitrine",
    });
  });

  it("stamps the lane's own process identity when the caller carries none", async () => {
    const { fetchImpl, calls } = fakelane(() => Response.json({ jobId: JOB_ID }, { status: 201 }));
    const post = await postReference({
      bytes: BYTES,
      name: "seat take.wav",
      genre: "jazz",
      origin: ORIGIN,
      deps: { fetchImpl },
    });
    assert.ok(post.ok);
    assert.equal(post.data.serviceId, servicelaneid());
    const body = JSON.parse(calls[0]?.body ?? "{}") as { ownerId?: string };
    assert.equal(body.ownerId, servicelaneid());
    assert.ok(/^\d+$/.test(body.ownerId ?? ""), "the seat answers the minted decimal form");
  });

  it("refuses a genre off the style dictionary without a call", async () => {
    const { fetchImpl, calls } = fakelane(() => new Response("never read", { status: 200 }));
    const post = await postReference({
      bytes: BYTES,
      name: "off the dictionary.wav",
      genre: "breakcore",
      origin: ORIGIN,
      serviceId: SERVICE,
      deps: { fetchImpl },
    });
    assert.ok(!post.ok);
    assert.equal(post.error.code, "bad-request");
    assert.equal(post.error.status, null);
    assert.equal(calls.length, 0);
  });

  it("rides the refusing upload through the client's own codes", async () => {
    const { fetchImpl } = fakelane(() =>
      Response.json(
        { error: { code: "bad-owner", message: "the upload needs the owner pointer in the minted decimal form" } },
        { status: 400 },
      ),
    );
    const post = await postReference({
      bytes: BYTES,
      name: "refused take.wav",
      genre: "trap",
      origin: ORIGIN,
      serviceId: "not-a-pointer",
      deps: { fetchImpl },
    });
    assert.ok(!post.ok);
    assert.equal(post.error.code, "bad-request");
    assert.equal(post.error.status, 400);
  });
});

describe("the wire fixtures stay honest (the lockstep law)", () => {
  it("carries the ingest schema literal the stamped document rides", () => {
    assert.equal(ROW.document.schema, INGEST_SCHEMA_VERSION);
    assert.equal(ROW.document.segments.length, 2);
    assert.equal(ROW.document.name, "client walk take");
  });
});
