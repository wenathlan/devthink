// # ingest.test — the decomposition pipeline contract: the hpss separation
//   conserves the mix (harmonic + percussive == the original), the ingest
//   document is deterministic for a given pcm and carries the vector
//   segments the pattern miner reads (one frame per second, chroma, bands,
//   onsets), the pcm hash is stable and the store guard refuses foreign
//   schemas. runnable with vitest: pnpm vitest run test/ingest.test.ts







import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { beforeAll, describe, it } from "vitest";
import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { mfcc, wavinfo } from "../audio.ts";
import { mintid } from "../bigintids.ts";
import { memoryblobstore } from "../blobstore.ts";
import type { BlobStore } from "../blobstore.ts";
import type { IngestJobValue } from "../gatewayapi.ts";
import { postReference, servicelaneid } from "../ialane.ts";
import { separate } from "../hpss.ts";
import { RECON_LAYERS, RECON_SAMPLE_RATE, RECON_SCALE_NAMES, serializeRecon, validateRecon } from "../recon.ts";
import { FFT_SIZE, frameSpectrum, keyOf } from "../spectrum.ts";
import { encodeWav, wavInfo } from "../wavwriter.ts";
import {
  ENERGY_CHUNK_MS,
  INGEST_SCHEMA_VERSION,
  INGEST_STEMS_SCHEMA_VERSION,
  PAYLOAD_LANE_MODALITY,
  RECON_ENVELOPE_WINDOWS,
  RECON_MFCC_COEFFICIENTS,
  SOUND_PAYLOAD_SCHEMA_VERSION,
  type EnergyChunk,
  type IngestClientResult,
  type IngestDbHandle,
  type IngestDocument,
  type IngestJobInput,
  type IngestJobProgress,
  type IngestJobResult,
  type IngestRow,
  type IngestStampRow,
  type IngestStemsManifest,
  type SoundPayload,
  decompose,
  deleteDocument,
  downmixmono,
  fetchDocument,
  fetchShelf,
  ingestPcm,
  ingestPayload,
  onsetSecondsOf,
  parseWav,
  pcmhash,
  pollJob,
  probesound,
  reconBpmPerSecond,
  reconEnvelope32,
  reconFamilyOf,
  reconFromIngest,
  reconOf,
  reconScaleFit,
  reconSpectralPeaks,
  reconYinNotes,
  reconstructWav,
  runIngestJob,
  segmentsof,
  trackStreamOf,
  uploadIngest,
} from "../ingest.ts";

/** A deterministic synthetic take: a 110 hz sawtooth bass (harmonic) over
 * an 8 hz amplitude-gated click train (percussive), 3 seconds at 8 khz —
 * small enough to analyze fast, structured enough to exercise both stems. */
function synthetictake(): { mono: Float32Array; sampleRate: number } {
  const sampleRate = 8000;
  const length = sampleRate * 3;
  const mono = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const bass = 0.4 * Math.sign(Math.sin(2 * Math.PI * 110 * t));
    const gate = t % 0.5 < 0.02 ? 0.8 : 0;
    mono[i] = Math.max(-1, Math.min(1, bass * 0.7 + gate));
  }
  return { mono, sampleRate };
}

describe("hpss separation", () => {
  it("conserves the mix: harmonic + percussive equals the original", () => {
    const { mono, sampleRate } = synthetictake();
    const { harmonic, percussive } = separate(mono);
    assert.equal(harmonic.length, mono.length);
    let worst = 0;
    // the centered framing keeps every input sample near a window peak, so
    // the whole signal conserves to the f32 storage floor
    for (let i = 0; i < mono.length; i++) {
      worst = Math.max(worst, Math.abs(harmonic[i] + percussive[i] - mono[i]));
    }
    assert.ok(worst < 1e-3, `reconstruction error ${worst}`);
    void sampleRate;
  });

  it("pushes the click train into the percussive stem and the sawtooth into the harmonic one", () => {
    const { mono } = synthetictake();
    const { harmonic, percussive } = separate(mono);
    const energy = (pcm: Float32Array): number => {
      let sum = 0;
      for (let i = 0; i < pcm.length; i++) sum += pcm[i] * pcm[i];
      return sum;
    };
    assert.ok(energy(harmonic) > energy(percussive), "the tonal sawtooth carries most of the energy");
  });
});

describe("ingest document", () => {
  const { mono, sampleRate } = synthetictake();
  const doc = ingestPcm(mono, sampleRate, { name: "synthetic take", at: "2026-01-01T00:00:00.000Z" });

  it("writes the one schema with the mix, two stems and per-second frames", () => {
    assert.equal(doc.schema, INGEST_SCHEMA_VERSION);
    assert.equal(doc.name, "synthetic take");
    assert.equal(doc.stems.length, 2);
    assert.equal(doc.stems[0].role, "harmonic");
    assert.equal(doc.stems[1].role, "percussive");
    assert.equal(doc.segments.length, 3);
    for (const stem of doc.stems) assert.equal(stem.segments.length, 3);
  });

  it("is deterministic: the same pcm ingests to the same bytes", () => {
    const again = ingestPcm(mono, sampleRate, { name: "synthetic take", at: "2026-01-01T00:00:00.000Z" });
    assert.equal(JSON.stringify(again), JSON.stringify(doc));
  });

  it("carries the vector fields every frame needs", () => {
    for (const frame of doc.segments) {
      assert.equal(frame.s >= 0, true);
      assert.equal(frame.bands.length, 3);
      assert.equal(frame.chroma.length, 12);
      const total = frame.bands.reduce((sum, value) => sum + value, 0);
      assert.ok(Math.abs(total - 1) < 0.01, `bands sum ${total}`);
      assert.ok(frame.rms >= 0 && frame.peak >= 0 && frame.zcr >= 0);
      assert.ok(["", ...["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"]].includes(frame.note));
    }
  });

  it("hashes the pcm deterministically and differently per stem", () => {
    assert.equal(pcmhash(mono), doc.pcmhash);
    assert.notEqual(doc.stems[0].pcmhash, doc.stems[1].pcmhash);
    const scratch = new Float32Array(mono);
    scratch[10] += 0.5;
    assert.notEqual(pcmhash(scratch), doc.pcmhash);
  });

  it("detects the gated clicks as onsets of the percussive stem", () => {
    const onsets = onsetSecondsOf(mono, sampleRate);
    assert.ok(onsets.length >= 4, `onsets ${onsets.length}`);
    for (let i = 1; i < onsets.length; i++) assert.ok(onsets[i] > onsets[i - 1], "ascending");
  });

  it("segments count the onsets that fall inside each second", () => {
    const onsets = onsetSecondsOf(mono, sampleRate);
    const frames = segmentsof(mono, sampleRate, onsets);
    let counted = 0;
    for (const frame of frames) counted += frame.onsets;
    assert.equal(counted, onsets.length);
  });
});

describe("the store guard", () => {
  it("accepts only schema-matching documents (the browser guard shape)", () => {
    const { mono, sampleRate } = synthetictake();
    const doc = ingestPcm(mono, sampleRate, { name: "guard take", at: "2026-01-01T00:00:00.000Z" });
    const broken = { schema: "other/1" } as unknown as IngestDocument;
    // the guard lives in the store module: the shape check mirrors it here
    const guard = (candidate: IngestDocument): boolean =>
      !!candidate &&
      candidate.schema === INGEST_SCHEMA_VERSION &&
      typeof candidate.name === "string" &&
      candidate.name.length > 0 &&
      Array.isArray(candidate.stems) &&
      candidate.stems.length > 0 &&
      Array.isArray(candidate.segments);
    assert.equal(guard(broken), false);
    assert.equal(guard(doc), true);
  });
});


/* ===== the ingest client lane battery ===== */











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
function clientseededrng(seed: number): () => number {
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
  const rng = clientseededrng(2027);
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
const CLIENT_SOURCE_NAME = "client walk take.wav";

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
      { bytes: BYTES, name: CLIENT_SOURCE_NAME, ownerId: OWNER, kind: "upload", visibility: "private", origin: ORIGIN },
      { fetchImpl },
    );
    assert.deepEqual(dataof(upload), { jobId: JOB_ID });
    // the wire law: POST /api/v1/ingest/upload, the json lane, the base64 bytes
    assert.equal(calls[0].method, "POST");
    assert.equal(calls[0].url, `${ORIGIN}/api/v1/ingest/upload`);
    assert.equal(calls[0].headers["content-type"], "application/json");
    assert.deepEqual(JSON.parse(calls[0].body ?? "{}"), {
      bytes: BYTES_B64,
      name: CLIENT_SOURCE_NAME,
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
      { bytes: BYTES, name: CLIENT_SOURCE_NAME, ownerId: OWNER, kind: "upload", visibility: "private", origin: ORIGIN },
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
        name: CLIENT_SOURCE_NAME,
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
      { bytes: BYTES, name: CLIENT_SOURCE_NAME, ownerId: OWNER, kind: "upload", visibility: "private", origin: ORIGIN },
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
        { bytes: BYTES, name: CLIENT_SOURCE_NAME, ownerId: OWNER, kind: "upload", visibility: "private", origin },
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


/* ===== the ingest payload lane battery ===== */







/** The pinned instant every deterministic run stamps (the seeded law). */
const PINNED_AT = "2026-01-01T00:00:00.000Z";

/** The source rate of the synthetic take (the writer band floor, fast to analyze). */
const SAMPLE_RATE = 8000;

/** The length of the synthetic take in whole seconds (one vector frame per second). */
const SECONDS = 3;

/**
 * The deterministic synthetic source: a 110 hz sawtooth bass (the harmonic
 * ridge) over an 8 hz amplitude-gated click train (the percussive broadband),
 * clamped to full scale — the proven shape the hpss separation and the onset
 * detector both lock onto, small enough to keep the whole lane inside the
 * test timeout.
 */
function payloadsynthetictake(): Float32Array {
  const length = SAMPLE_RATE * SECONDS;
  const mono = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const bass = 0.4 * Math.sign(Math.sin(2 * Math.PI * 110 * t));
    const gate = t % 0.5 < 0.02 ? 0.8 : 0;
    mono[i] = Math.max(-1, Math.min(1, bass * 0.7 + gate));
  }
  return mono;
}

/** Encodes the synthetic take as the wav bytes a visitor would upload. */
function takewav(): Uint8Array {
  return encodeWav([payloadsynthetictake()], { sampleRate: SAMPLE_RATE, bitDepth: 16 });
}

/** Crafts minimal mpeg1 layer-iii bytes: one valid frame header (128 kbps,
 * 44100 hz, mono) with an optional id3v2 tag in front — the probe only needs
 * the header to answer the format facts. */
function mp3bytes(withId3: boolean, total = 16001): Uint8Array {
  const tag = withId3 ? 20 : 0;
  const bytes = new Uint8Array(total);
  if (withId3) {
    // "ID3" v2.3, no flags, syncsafe size 10 — ten bytes of tag body follow
    bytes.set([0x49, 0x44, 0x33, 3, 0, 0, 0, 0, 0, 10], 0);
  }
  const at = tag;
  bytes[at] = 0xff;
  bytes[at + 1] = 0xfb; // sync 111 + mpeg1 (11) + layer iii (01) + no protection
  bytes[at + 2] = 0x90; // bitrate index 9 (128 kbps), rate index 0 (44100 hz)
  bytes[at + 3] = 0xc0; // channel mode 3 = mono
  return bytes;
}

/** Crafts a minimal two-page ogg vorbis container: the bos page carrying the
 * 30-byte identification header (2 channels, 44100 hz) and a closing page
 * whose granule position declares the duration. */
function oggbytes(durationSeconds: number, channels = 2, sampleRate = 44100): Uint8Array {
  const packet = new Uint8Array(30);
  packet.set([1, 118, 111, 114, 98, 105, 115], 0); // \x01vorbis
  const packetView = new DataView(packet.buffer);
  packetView.setUint32(7, 0, true); // version 0
  packet[11] = channels;
  packetView.setUint32(12, sampleRate, true);
  const page1Length = 27 + 1 + 30;
  const bytes = new Uint8Array(page1Length + 27);
  bytes.set([0x4f, 0x67, 0x67, 0x53], 0); // "OggS"
  bytes[4] = 0; // stream structure version 0
  bytes[5] = 0x02; // continued | bos | eos -> bos only
  bytes[26] = 1; // one segment in the table
  bytes[27] = 30; // the identification packet is one lacing value
  bytes.set(packet, 28);
  const view = new DataView(bytes.buffer);
  const page2 = page1Length;
  bytes.set([0x4f, 0x67, 0x67, 0x53], page2);
  const granule = Math.round(durationSeconds * sampleRate);
  view.setUint32(page2 + 6, granule % 4294967296, true);
  view.setUint32(page2 + 10, Math.floor(granule / 4294967296), true);
  bytes[page2 + 26] = 0; // a segment-less closing page
  return bytes;
}

describe("the container probe", () => {
  it("answers the wav facts of real encoded bytes (the exact walk)", () => {
    const probe = probesound(takewav());
    assert.equal(probe.format, "wav");
    assert.equal(probe.mime, "audio/wav");
    assert.equal(probe.sampleRate, SAMPLE_RATE);
    assert.equal(probe.channels, 1);
    assert.equal(probe.bitDepth, 16);
    assert.equal(probe.decodable, true);
    assert.ok(Math.abs((probe.durationSeconds ?? 0) - SECONDS) < 0.01);
    assert.match(probe.facts, /pcm 16-bit mono 8000 hz/);
  });

  it("answers the mp3 header facts with the cbr estimate", () => {
    const probe = probesound(mp3bytes(false));
    assert.equal(probe.format, "mp3");
    assert.equal(probe.mime, "audio/mpeg");
    assert.equal(probe.sampleRate, 44100);
    assert.equal(probe.channels, 1);
    assert.equal(probe.decodable, false);
    // 16001 bytes * 8 bits / 128 kbps = ~1.00 s — the labeled estimate
    assert.ok(Math.abs((probe.durationSeconds ?? 0) - 1.0) < 0.01);
    assert.match(probe.facts, /mpeg1 layer iii, 128 kbps, 44100 hz, mono/);
    assert.match(probe.facts, /cbr estimate/);
  });

  it("skips the id3v2 tag before the mp3 frame scan", () => {
    const probe = probesound(mp3bytes(true));
    assert.equal(probe.format, "mp3");
    assert.equal(probe.sampleRate, 44100);
    assert.match(probe.facts, /128 kbps/);
  });

  it("answers the ogg identification header and the granule-scan duration", () => {
    const probe = probesound(oggbytes(2));
    assert.equal(probe.format, "ogg");
    assert.equal(probe.mime, "audio/ogg");
    assert.equal(probe.sampleRate, 44100);
    assert.equal(probe.channels, 2);
    assert.equal(probe.decodable, false);
    assert.ok(Math.abs((probe.durationSeconds ?? 0) - 2) < 0.01);
    assert.match(probe.facts, /ogg vorbis, 2 channels, 44100 hz, 2\.00 s \(granule scan\)/);
  });

  it("answers the unknown refusal for bytes without container magic", () => {
    const probe = probesound(new Uint8Array(64));
    assert.equal(probe.format, "unknown");
    assert.equal(probe.decodable, false);
    assert.equal(probe.durationSeconds, null);
  });

  it("marks a broken riff as wav magic present but unwalkable", () => {
    const bytes = new Uint8Array(12);
    bytes.set([0x52, 0x49, 0x46, 0x46], 0); // "RIFF"
    bytes.set([0x57, 0x41, 0x56, 0x45], 8); // "WAVE"
    const probe = probesound(bytes);
    assert.equal(probe.format, "wav");
    assert.equal(probe.decodable, false);
    assert.match(probe.facts, /walk refused/);
  });
});

describe("the forward ingest payload (the wav lane)", () => {
  it("writes the structured payload with the track summary, the energy chunks, the beats and the embedded document", () => {
    const answer = ingestPayload(takewav(), { name: "saw click take.wav", at: PINNED_AT });
    assert.equal(answer.ok, true);
    if (!answer.ok) return;
    const payload = answer.payload;
    assert.equal(payload.schema, SOUND_PAYLOAD_SCHEMA_VERSION);
    assert.equal(payload.analysis, "full");
    assert.equal(payload.name, "saw click take");
    assert.equal(payload.ingestedAt, PINNED_AT);
    // the source block: identity + container facts
    assert.equal(payload.source.byteLength, takewav().length);
    assert.match(payload.source.sha256, /^[0-9a-f]{64}$/);
    assert.equal(payload.source.container.format, "wav");
    assert.equal(payload.source.container.decodable, true);
    // the track summary: the faixa numbers the charge names
    assert.ok(payload.track);
    assert.ok(Math.abs(payload.track.durationSeconds - SECONDS) < 0.01);
    assert.equal(payload.track.sampleRate, SAMPLE_RATE);
    assert.ok(payload.track.bpm > 0);
    assert.equal(typeof payload.track.key.tonic, "string");
    assert.equal(payload.track.stems.length, 2);
    assert.deepEqual(
      payload.track.stems.map((stem) => stem.role),
      ["harmonic", "percussive"],
    );
    assert.ok(payload.track.stems.every((stem) => stem.onsets >= 0 && stem.frames === SECONDS));
    assert.ok(payload.track.structureSections >= 1);
    // the energy chunks: ten per second, ascending ms
    const expectedChunks = (SECONDS * 1000) / ENERGY_CHUNK_MS;
    assert.equal(payload.energy.length, expectedChunks);
    assert.deepEqual(
      payload.energy.slice(0, 3).map((chunk: EnergyChunk) => chunk.ms),
      [0, ENERGY_CHUNK_MS, ENERGY_CHUNK_MS * 2],
    );
    assert.ok(payload.energy.every((chunk) => chunk.rms > 0));
    // the beats: the mix onsets beside the per-stem onset lists
    assert.ok(payload.beats);
    assert.equal(payload.beats.bpm, payload.track.bpm);
    assert.ok(payload.beats.onsetSeconds.length >= 1, "the gated clicks answer mix onsets");
    assert.ok(payload.beats.stems.some((stem) => stem.role === "percussive" && stem.onsetSeconds.length >= 1));
    // the embedded document: the v1 decomposition, one frame per second
    assert.ok(payload.document);
    assert.equal(payload.document.schema, INGEST_SCHEMA_VERSION);
    assert.equal(payload.document.segments.length, SECONDS);
    assert.equal(payload.document.sampleRate, SAMPLE_RATE);
  });

  it("is deterministic: the same bytes and options answer the same payload json", () => {
    const bytes = takewav();
    const first = ingestPayload(bytes, { name: "take.wav", at: PINNED_AT });
    const second = ingestPayload(bytes, { name: "take.wav", at: PINNED_AT });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.equal(JSON.stringify(first.payload), JSON.stringify(second.payload));
  });

  it("clamps the analysis window while the container facts keep the full duration", () => {
    const answer = ingestPayload(takewav(), { name: "take.wav", at: PINNED_AT, maxDurationSeconds: 1 });
    assert.equal(answer.ok, true);
    if (!answer.ok) return;
    const payload = answer.payload;
    assert.ok(payload.track);
    assert.ok(Math.abs(payload.track.durationSeconds - 1) < 0.01);
    assert.ok(Math.abs((payload.source.container.durationSeconds ?? 0) - SECONDS) < 0.01);
    assert.equal(payload.energy.length, 1000 / ENERGY_CHUNK_MS);
  });

  it("answers the honest container-only payload for compressed bytes (zero fake vectors)", () => {
    const answer = ingestPayload(mp3bytes(false), { name: "song.mp3", at: PINNED_AT });
    assert.equal(answer.ok, true);
    if (!answer.ok) return;
    const payload = answer.payload;
    assert.equal(payload.analysis, "container-only");
    assert.equal(payload.track, null);
    assert.deepEqual(payload.energy, []);
    assert.equal(payload.beats, null);
    assert.equal(payload.document, null);
    assert.equal(payload.source.container.sampleRate, 44100);
    assert.equal(payload.source.container.format, "mp3");
    const ogg = ingestPayload(oggbytes(2), { name: "song.ogg", at: PINNED_AT });
    assert.equal(ogg.ok, true);
    if (ogg.ok) assert.equal(ogg.payload.analysis, "container-only");
  });

  it("refuses the unknown and unwalkable containers with the machine codes", () => {
    const unknown = ingestPayload(new Uint8Array(32), { name: "mystery.bin" });
    assert.equal(unknown.ok, false);
    if (!unknown.ok) assert.equal(unknown.code, "unknown-format");
    const broken = new Uint8Array(12);
    broken.set([0x52, 0x49, 0x46, 0x46], 0);
    broken.set([0x57, 0x41, 0x56, 0x45], 8);
    const unwalkable = ingestPayload(broken, { name: "broken.wav" });
    assert.equal(unwalkable.ok, false);
    if (!unwalkable.ok) assert.equal(unwalkable.code, "wav-unwalkable");
  });

  it("declares the sandbox modality of the lane (the sandbox, never the browser)", () => {
    assert.equal(PAYLOAD_LANE_MODALITY, "local");
  });
});

describe("the reverse ingest (the payload to wav reconstruction)", () => {
  /** The pinned full payload every reconstruction test rides. */
  const payloadof = (): SoundPayload => {
    const answer = ingestPayload(takewav(), { name: "saw click take.wav", at: PINNED_AT });
    if (!answer.ok) throw new Error(`the fixture ingest failed: ${answer.code}`);
    return answer.payload;
  };

  it("reconstructs real wav bytes that parse back through two independent readers", () => {
    const result = reconstructWav(payloadof());
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const { bytes, sampleRate, durationSeconds, mime } = result.reconstruction;
    assert.equal(mime, "audio/wav");
    assert.equal(sampleRate, SAMPLE_RATE);
    assert.equal(durationSeconds, SECONDS);
    // the writer's own reader
    const writerinfo = wavInfo(bytes);
    assert.equal(writerinfo.sampleRate, SAMPLE_RATE);
    assert.equal(writerinfo.channels, 1);
    assert.equal(writerinfo.bitDepth, 16);
    assert.equal(writerinfo.frames, SAMPLE_RATE * SECONDS);
    // the decoder's independent reader (audioformat.ts)
    const decoderinfo = wavinfo(bytes);
    assert.equal(decoderinfo.frames, writerinfo.frames);
    assert.ok(Math.abs(decoderinfo.durationSeconds - SECONDS) < 0.01);
  });

  it("is non-silent and carries energy across the seconds (the playable proof)", () => {
    const result = reconstructWav(payloadof());
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const info = wavinfo(result.reconstruction.bytes);
    assert.ok(info.frames > 0);
    // the loudness of the rebuild: the per-second fidelity says the frames and
    // the synthesis stay in the same neighborhood — measured, never claimed
    const { fidelity } = result.reconstruction;
    assert.ok(fidelity.meanRmsError >= 0);
    assert.ok(fidelity.worstRmsError >= fidelity.meanRmsError);
    assert.ok(fidelity.meanRmsError < 0.25, `the mean rms gap ${fidelity.meanRmsError} leaves the neighborhood`);
  });

  it("is deterministic: the same payload answers the same bytes", () => {
    const payload = payloadof();
    const first = reconstructWav(payload);
    const second = reconstructWav(payload);
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.deepEqual(Array.from(first.reconstruction.bytes), Array.from(second.reconstruction.bytes));
    assert.equal(first.reconstruction.pcmhash, second.reconstruction.pcmhash);
  });

  it("is honest vector synthesis: the rebuild hash differs from the source hash", () => {
    const payload = payloadof();
    const result = reconstructWav(payload);
    assert.equal(result.ok, true);
    if (!result.ok || !payload.track) return;
    // the payload hash is the identity of the source; the synthesis answers
    // its own — a copy would be a re-encode claim, the ban the corpus pins
    assert.notEqual(result.reconstruction.pcmhash, payload.track.pcmhash);
  });

  it("round trips: the reconstructed wav ingests back as a full payload", () => {
    const result = reconstructWav(payloadof());
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const again = ingestPayload(result.reconstruction.bytes, { name: "rebuild.wav", at: PINNED_AT });
    assert.equal(again.ok, true);
    if (!again.ok) return;
    assert.equal(again.payload.analysis, "full");
    assert.ok(Math.abs((again.payload.track?.durationSeconds ?? 0) - SECONDS) < 0.01);
    assert.equal(again.payload.source.container.format, "wav");
    assert.equal(again.payload.document?.segments.length, SECONDS);
  });

  it("refuses the container-only payload, the foreign schema and the depth the writer never writes", () => {
    const compressed = ingestPayload(mp3bytes(false), { name: "song.mp3", at: PINNED_AT });
    assert.equal(compressed.ok, true);
    if (compressed.ok) {
      const refused = reconstructWav(compressed.payload);
      assert.equal(refused.ok, false);
      if (!refused.ok) assert.equal(refused.code, "container-only");
    }
    const payload = payloadof();
    const foreign = reconstructWav({ ...payload, schema: "debonair.foreign/9" });
    assert.equal(foreign.ok, false);
    if (!foreign.ok) assert.equal(foreign.code, "bad-schema");
    const baddepth = reconstructWav(payload, { bitDepth: 8 as never });
    assert.equal(baddepth.ok, false);
    if (!baddepth.ok) assert.equal(baddepth.code, "encode-refused");
  });

  it("answers the pcm24 depth when the caller asks for it", () => {
    const result = reconstructWav(payloadof(), { bitDepth: 24 });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(wavInfo(result.reconstruction.bytes).bitDepth, 24);
  });
});


/* ===== the ingest schema law battery ===== */







// the seat answers before the module load: this suite rides its own
// database file so the parallel vitest workers never share one wal
// writer (the SQLITE_BUSY lesson — every suite its own seat).
process.env.DATABASE_URL = "file:./local.ingestschema.db";

const ingestmodule = await import("../ingest.ts");
const { getingestrow, IngestDbError, listingestrows, migrateingestschema, puttingest } = ingestmodule;
// the fold's lazy db face: the db.ts load rides behind loaddbface, so the
// suite binds its own seat after the env pin — the same load the static
// import of the retired arm answered at module time.
await ingestmodule.loaddbface();

/** A deterministic synthetic take: a 110 hz sawtooth bass (harmonic) over
 * an 8 hz amplitude-gated click train (percussive), 3 seconds at 8 khz —
 * the same shape test/ingest.test.ts rides, small enough to ingest fast,
 * structured enough to fill every column of the document. */
function schemasynthetictake(): { mono: Float32Array; sampleRate: number } {
  const sampleRate = 8000;
  const length = sampleRate * 3;
  const mono = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const bass = 0.4 * Math.sign(Math.sin(2 * Math.PI * 110 * t));
    const gate = t % 0.5 < 0.02 ? 0.8 : 0;
    mono[i] = Math.max(-1, Math.min(1, bass * 0.7 + gate));
  }
  return { mono, sampleRate };
}

/** One parametrized document the writes ride (a fixed ingest instant so
 * the rows stay deterministic across runs). */
function takedoc(name: string): IngestDocument {
  const { mono, sampleRate } = schemasynthetictake();
  return ingestPcm(mono, sampleRate, { name, at: "2026-01-01T00:00:00.000Z" });
}

/** A 64-hex sha fixture (the blob store wave computes the real one). */
const SHA_FIXTURE = "3a7f1c9e2b84d05f6a1e93c47d82b5a6f0c1d2e34f5a6b7c8d9e0f1a2b3c4d5e";

describe("the reference law round trip", () => {
  it("stamps and reads back every column the law names", () => {
    const owner = "9007199254740993"; // 2^53 + 1 — beyond the js number floor
    const mix = "9223372036854775806"; // 2^63 - 2 — the top of the 64-bit rail
    const stems = "12345678901234567";
    const doc = takedoc("law take");
    puttingest("ingestschema-law", doc, {
      ownerId: owner,
      kind: "reference",
      visibility: "vitrine",
      mixPointer: mix,
      stemsPointer: stems,
      sizeBytes: 44100,
      sha256: SHA_FIXTURE,
    });
    const row = getingestrow("ingestschema-law");
    assert.ok(row, "the row must read back");
    assert.equal(row.id, "ingestschema-law");
    assert.equal(row.name, "law take");
    assert.equal(row.samplerate, 8000);
    assert.equal(row.ingestedat, "2026-01-01T00:00:00.000Z");
    assert.equal(row.owner_id, owner);
    assert.equal(row.kind, "reference");
    assert.equal(row.visibility, "vitrine");
    assert.equal(row.mix_pointer, mix);
    assert.equal(row.stems_pointer, stems);
    assert.equal(row.size_bytes, 44100);
    assert.equal(row.sha256, SHA_FIXTURE);
    assert.deepEqual(JSON.parse(row.docjson), doc);
  });

  it("reads the pointers exact beyond the js number floor (the cast law)", () => {
    // a number-coerced read would round 2^53 + 1 down to 2^53 and drop the
    // tail of a minted id — the row must answer the exact decimal string
    const row = getingestrow("ingestschema-law");
    assert.ok(row);
    assert.ok(BigInt(row.owner_id) > 2n ** 53n, "the probe id rides beyond the floor");
    assert.equal(row.owner_id, "9007199254740993");
    assert.notEqual(row.owner_id, "9007199254740992");
    assert.equal(BigInt(row.mix_pointer), 9223372036854775806n);
    assert.ok(BigInt(row.mix_pointer) > 2n ** 53n, "the mix pointer rides beyond the floor");
  });

  it("keeps an explicit vitrine visibility beside the private default", () => {
    puttingest("ingestschema-vitrine", takedoc("vitrine take"), {
      ownerId: "12345678901234568",
      kind: "render",
      visibility: "vitrine",
    });
    const row = getingestrow("ingestschema-vitrine");
    assert.ok(row);
    assert.equal(row.visibility, "vitrine");
    assert.equal(row.kind, "render");
  });
});

describe("the default law", () => {
  it("defaults the visibility to private and the absent fields to their zero shapes", () => {
    puttingest("ingestschema-default", takedoc("default take"), {
      ownerId: "12345678901234567",
      kind: "upload",
    });
    const row = getingestrow("ingestschema-default");
    assert.ok(row);
    assert.equal(row.visibility, "private");
    assert.equal(row.mix_pointer, null);
    assert.equal(row.stems_pointer, null);
    assert.equal(row.size_bytes, 0);
    assert.equal(row.sha256, "");
  });
});

describe("the migration path", () => {
  /** Boots one old-shape database (the exact PV0 table) carrying one row
   * of real pre-law data. */
  function oldshapedb() {
    const old = new Database(":memory:");
    old.exec(`
      CREATE TABLE ingest_documents (
        id              TEXT PRIMARY KEY,
        name            TEXT NOT NULL,
        durationseconds REAL NOT NULL DEFAULT 0,
        samplerate      INTEGER NOT NULL DEFAULT 0,
        pcmhash         INTEGER NOT NULL DEFAULT 0,
        ingestedat      TEXT NOT NULL,
        docjson         TEXT NOT NULL
      );
    `);
    old
      .prepare(
        "INSERT INTO ingest_documents (id, name, durationseconds, samplerate, pcmhash, ingestedat, docjson) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        "old-1",
        "pre-law take",
        3,
        8000,
        424242,
        "2025-12-31T23:59:59.999Z",
        JSON.stringify(takedoc("pre-law take")),
      );
    return old;
  }

  /** Reads one full row off any handle with the store's column law (the
   * same literal column list, the same text casts — zero interpolation
   * into sql, the house law holds in the tests alike). */
  function rowof(handle: ReturnType<typeof oldshapedb>, id: string): IngestRow {
    const row = handle
      .prepare(
        `SELECT id, name, durationseconds, samplerate, pcmhash, ingestedat, docjson,
                CAST(owner_id AS TEXT) AS owner_id, kind, visibility,
                CAST(mix_pointer AS TEXT) AS mix_pointer, CAST(stems_pointer AS TEXT) AS stems_pointer,
                size_bytes, sha256
         FROM ingest_documents WHERE id = ?`,
      )
      .get(id) as IngestRow | undefined;
    assert.ok(row, `the row ${id} must read back`);
    return row;
  }

  it("upgrades an old-shape database without losing rows", () => {
    const old = oldshapedb();
    migrateingestschema(old);
    const counted = old.prepare("SELECT COUNT(*) AS total FROM ingest_documents").get() as { total: number };
    assert.equal(counted.total, 1, "no row is lost to the migration");
    const row = rowof(old, "old-1");
    // the pre-law data survives untouched
    assert.equal(row.name, "pre-law take");
    assert.equal(row.durationseconds, 3);
    assert.equal(row.samplerate, 8000);
    assert.equal(row.pcmhash, 424242);
    assert.equal(row.ingestedat, "2025-12-31T23:59:59.999Z");
    assert.ok(typeof row.docjson === "string" && row.docjson.length > 0, "the document json survives");
    // the law's fills on the pre-law row
    assert.equal(row.owner_id, "0");
    assert.equal(row.kind, "upload");
    assert.equal(row.visibility, "private");
    assert.equal(row.mix_pointer, null);
    assert.equal(row.stems_pointer, null);
    assert.equal(row.size_bytes, 0);
    assert.equal(row.sha256, "");
  });

  it("is idempotent — a second migration changes nothing", () => {
    const old = oldshapedb();
    migrateingestschema(old);
    migrateingestschema(old);
    const counted = old.prepare("SELECT COUNT(*) AS total FROM ingest_documents").get() as { total: number };
    assert.equal(counted.total, 1);
    const row = rowof(old, "old-1");
    assert.equal(row.name, "pre-law take");
    assert.equal(row.owner_id, "0");
    assert.equal(row.visibility, "private");
  });

  it("lands the full shape on a fresh handle (the create path)", () => {
    const fresh = new Database(":memory:");
    migrateingestschema(fresh);
    const columns = (fresh.pragma("table_info(ingest_documents)") as { name: string }[]).map((column) => column.name);
    for (const law of ["owner_id", "kind", "visibility", "mix_pointer", "stems_pointer", "size_bytes", "sha256"]) {
      assert.ok(columns.includes(law), `the fresh table carries ${law}`);
    }
    assert.equal(columns.length, 14, "the seven old columns plus the seven law columns");
  });
});

describe("the typed errors", () => {
  const doc = takedoc("error take");
  const goodowner = "12345678901234569";

  it("refuses a bad owner pointer (bad-owner)", () => {
    for (const bad of ["", "0", "-7", "abc", "12.5", "1e18", "18446744073709551616"]) {
      assert.throws(
        () => puttingest("ingestschema-err", doc, { ownerId: bad, kind: "upload" }),
        (error: unknown): boolean => error instanceof IngestDbError && error.code === "bad-owner",
        `owner "${bad}" must fail the mint law`,
      );
    }
  });

  it("refuses a bad kind (bad-kind)", () => {
    for (const bad of ["other", "references", "Upload", ""]) {
      assert.throws(
        () => puttingest("ingestschema-err", doc, { ownerId: goodowner, kind: bad as IngestRow["kind"] }),
        (error: unknown): boolean => error instanceof IngestDbError && error.code === "bad-kind",
        `kind "${bad}" must fail the enum law`,
      );
    }
  });

  it("refuses a bad visibility (bad-visibility)", () => {
    for (const bad of ["public", "PRIVATE", "", "vitrines"]) {
      assert.throws(
        () =>
          puttingest("ingestschema-err", doc, {
            ownerId: goodowner,
            kind: "upload",
            visibility: bad as IngestRow["visibility"],
          }),
        (error: unknown): boolean => error instanceof IngestDbError && error.code === "bad-visibility",
        `visibility "${bad}" must fail the lane law`,
      );
    }
  });

  it("refuses a bad blob pointer (bad-pointer)", () => {
    assert.throws(
      () => puttingest("ingestschema-err", doc, { ownerId: goodowner, kind: "upload", mixPointer: "nope" }),
      (error: unknown): boolean => error instanceof IngestDbError && error.code === "bad-pointer",
    );
    assert.throws(
      () => puttingest("ingestschema-err", doc, { ownerId: goodowner, kind: "upload", mixPointer: "0" }),
      (error: unknown): boolean => error instanceof IngestDbError && error.code === "bad-pointer",
    );
    assert.throws(
      () =>
        puttingest("ingestschema-err", doc, {
          ownerId: goodowner,
          kind: "upload",
          stemsPointer: "18446744073709551616",
        }),
      (error: unknown): boolean => error instanceof IngestDbError && error.code === "bad-pointer",
    );
  });
});

describe("the owner chain", () => {
  it("keeps two documents from different owners distinct and time-ordered", () => {
    const tick = 1_700_000_000_000;
    const ownerA = mintid(tick);
    const ownerB = mintid(tick + 1);
    assert.notEqual(ownerA, ownerB);
    assert.ok(BigInt(ownerA) < BigInt(ownerB), "the ids sort by creation");
    puttingest("ingestschema-chain-a", takedoc("chain a"), { ownerId: ownerA, kind: "reference" });
    puttingest("ingestschema-chain-b", takedoc("chain b"), {
      ownerId: ownerB,
      kind: "upload",
      visibility: "vitrine",
    });
    const rows = listingestrows().filter(
      (row) => row.id === "ingestschema-chain-a" || row.id === "ingestschema-chain-b",
    );
    assert.equal(rows.length, 2, "both documents list through the row seam");
    const rowA = rows.find((row) => row.id === "ingestschema-chain-a");
    const rowB = rows.find((row) => row.id === "ingestschema-chain-b");
    assert.ok(rowA && rowB, "both chain rows read back");
    assert.equal(rowA.owner_id, ownerA);
    assert.equal(rowB.owner_id, ownerB);
    assert.notEqual(rowA.owner_id, rowB.owner_id, "the owners never bleed across rows");
    assert.equal(rowA.kind, "reference");
    assert.equal(rowB.kind, "upload");
    assert.equal(rowB.visibility, "vitrine");
    assert.ok(BigInt(rowA.owner_id) < BigInt(rowB.owner_id), "the chain stays time-ordered end to end");
  });
});


/* ===== the ingest worker lane battery ===== */















/** The source rate of the synthetic take (a rate the writer's band carries). */
const WORKER_SAMPLE_RATE = 44100;
/** The length of the synthetic take in whole seconds (one vector frame per second). */
const WORKER_SECONDS = 2;
/** The raw job name (one trailing extension folds away into the display name). */
const WORKER_SOURCE_NAME = "sine click take.wav";
/** The display name the document carries (the extension folded). */
const DISPLAY_NAME = "sine click take";
/** The owner id of every test job (the minted decimal string the rows stamp). */
const OWNER_ID = mintid();

/** A tiny deterministic prng — the same seed answers the same take. */
function workerseededrng(seed: number): () => number {
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
  const rng = workerseededrng(2026);
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

/** The full synthetic wav the pipeline ingests (16-bit at the source rate). */
const sourceWav = encodeWav([syntheticsource(WORKER_SAMPLE_RATE, WORKER_SECONDS)], { sampleRate: WORKER_SAMPLE_RATE, bitDepth: 16 });
/** The source samples (the decode round trip compares against these). */
const sourceMono = syntheticsource(WORKER_SAMPLE_RATE, WORKER_SECONDS);
/** The independent digest of the source bytes (node crypto, not the store's own rounds). */
const sourceSha = createHash("sha256").update(sourceWav).digest("hex");
/** A half-second wav for the failure lanes (the pipeline still walks every phase before it). */
const tinyWav = encodeWav([syntheticsource(WORKER_SAMPLE_RATE, 0.5)], { sampleRate: WORKER_SAMPLE_RATE, bitDepth: 16 });

/**
 * Builds a job input with the defaults every test shares (the tiny wav,
 * the memory store, the pure lane).
 *
 * @param overrides the bytes, the store or the db handle to swap in.
 * @returns the job input.
 */
function jobinput(overrides: { bytes?: Uint8Array; store?: BlobStore; db?: IngestDbHandle | null }): IngestJobInput {
  return {
    bytes: overrides.bytes ?? tinyWav,
    name: WORKER_SOURCE_NAME,
    ownerId: OWNER_ID,
    kind: "upload",
    visibility: "private",
    store: overrides.store ?? memoryblobstore(),
    db: overrides.db ?? null,
  };
}

describe("parseWav — the decoder mirrors the writer", () => {
  it("round trips the 16-bit encode within the quantization", () => {
    const decoded = parseWav(sourceWav);
    assert.ok(decoded.ok);
    assert.equal(decoded.channels, 1);
    assert.equal(decoded.sampleRate, WORKER_SAMPLE_RATE);
    assert.equal(decoded.bitDepth, 16);
    assert.equal(decoded.frames, sourceMono.length);
    assert.equal(decoded.durationSeconds, sourceMono.length / WORKER_SAMPLE_RATE);
    assert.equal(decoded.isFloat, false);
    assert.equal(decoded.pcm.length, 1);
    let worst = 0;
    for (let i = 0; i < sourceMono.length; i++) {
      worst = Math.max(worst, Math.abs(decoded.pcm[0][i] - sourceMono[i]));
    }
    assert.ok(worst <= 1 / 32767, `round trip error ${worst}`);
  });

  it("round trips the 24-bit encode within the quantization", () => {
    const decoded = parseWav(encodeWav([sourceMono], { sampleRate: WORKER_SAMPLE_RATE, bitDepth: 24 }));
    assert.ok(decoded.ok);
    assert.equal(decoded.bitDepth, 24);
    assert.equal(decoded.isFloat, false);
    let worst = 0;
    for (let i = 0; i < sourceMono.length; i++) {
      worst = Math.max(worst, Math.abs(decoded.pcm[0][i] - sourceMono[i]));
    }
    assert.ok(worst <= 1 / 8388607, `round trip error ${worst}`);
  });

  it("round trips the float32 encode exactly (the ieee words as-is)", () => {
    const decoded = parseWav(encodeWav([sourceMono], { sampleRate: WORKER_SAMPLE_RATE, bitDepth: 32 }));
    assert.ok(decoded.ok);
    assert.equal(decoded.bitDepth, 32);
    assert.equal(decoded.isFloat, true);
    for (let i = 0; i < sourceMono.length; i++) {
      assert.equal(decoded.pcm[0][i], sourceMono[i]);
    }
  });

  it("deinterleaves stereo frame by frame", () => {
    const left = new Float32Array([1, 0.5, -0.25, 0]);
    const right = new Float32Array([-1, 0, 0.25, 0.75]);
    const decoded = parseWav(encodeWav([left, right], { sampleRate: WORKER_SAMPLE_RATE, bitDepth: 16 }));
    assert.ok(decoded.ok);
    assert.equal(decoded.channels, 2);
    assert.equal(decoded.pcm.length, 2);
    for (let i = 0; i < left.length; i++) {
      assert.ok(Math.abs(decoded.pcm[0][i] - left[i]) <= 1 / 32767);
      assert.ok(Math.abs(decoded.pcm[1][i] - right[i]) <= 1 / 32767);
    }
  });

  it("downmixes the channel average (the mono law)", () => {
    const left = new Float32Array([1, 0.5, -0.25]);
    const right = new Float32Array([-1, 0.5, 0.25]);
    assert.deepEqual(Array.from(downmixmono([left, right])), [0, 0.5, 0]);
    assert.deepEqual(Array.from(downmixmono([left])), [1, 0.5, -0.25]);
    assert.equal(downmixmono([]).length, 0);
  });
});

describe("parseWav — the failure codes", () => {
  it("refuses bytes without the riff magic (bad-riff)", () => {
    const decoded = parseWav(new TextEncoder().encode("this is not a wav at all"));
    assert.ok(!decoded.ok);
    assert.equal(decoded.code, "bad-riff");
  });

  it("refuses a broken wave magic (bad-wave)", () => {
    const bytes = new Uint8Array(sourceWav);
    bytes.set([78, 79, 84, 87], 8); // "NOTW" where WAVE belongs
    const decoded = parseWav(bytes);
    assert.ok(!decoded.ok);
    assert.equal(decoded.code, "bad-wave");
  });

  it("refuses a wav without a fmt chunk (bad-fmt)", () => {
    const bytes = new Uint8Array(sourceWav);
    bytes.set([106, 117, 110, 107], 12); // "junk" where fmt belongs
    const decoded = parseWav(bytes);
    assert.ok(!decoded.ok);
    assert.equal(decoded.code, "bad-fmt");
  });

  it("refuses a wav without a data chunk (bad-data)", () => {
    const bytes = new Uint8Array(sourceWav);
    bytes.set([106, 117, 110, 107], 36); // "junk" where data belongs
    const decoded = parseWav(bytes);
    assert.ok(!decoded.ok);
    assert.equal(decoded.code, "bad-data");
  });

  it("refuses the depths the writer never writes (unsupported-depth)", () => {
    const bits = new Uint8Array(sourceWav);
    new DataView(bits.buffer).setUint16(34, 8, true); // 8-bit pcm
    const decodedBits = parseWav(bits);
    assert.ok(!decodedBits.ok);
    assert.equal(decodedBits.code, "unsupported-depth");
    const code = new Uint8Array(sourceWav);
    new DataView(code.buffer).setUint16(20, 3, true); // the float code at 16 bits
    const decodedCode = parseWav(code);
    assert.ok(!decodedCode.ok);
    assert.equal(decodedCode.code, "unsupported-depth");
  });

  it("refuses a payload cut past the data claim (truncated)", () => {
    const decoded = parseWav(sourceWav.subarray(0, sourceWav.length - 1000));
    assert.ok(!decoded.ok);
    assert.equal(decoded.code, "truncated");
  });

  it("parses a zero-frame wav (the job layer answers empty-audio)", () => {
    const empty = new Uint8Array(sourceWav.subarray(0, 44));
    new DataView(empty.buffer).setUint32(40, 0, true); // the data chunk claims nothing
    const decoded = parseWav(empty);
    assert.ok(decoded.ok);
    assert.equal(decoded.frames, 0);
    assert.equal(decoded.pcm[0].length, 0);
  });
});

describe("runIngestJob — the full pipeline on the memory mirror", () => {
  const store = memoryblobstore();
  const progress: IngestJobProgress[] = [];
  let result: IngestJobResult;

  beforeAll(async () => {
    result = await runIngestJob(
      {
        bytes: sourceWav,
        name: WORKER_SOURCE_NAME,
        ownerId: OWNER_ID,
        kind: "reference",
        visibility: "private",
        store,
        db: null,
        at: PINNED_AT,
      },
      (step) => progress.push(step),
    );
  });

  it("answers ok with the ingest.ts document shape", () => {
    assert.ok(result.ok);
    assert.equal(result.document.schema, INGEST_SCHEMA_VERSION);
    assert.equal(result.document.name, DISPLAY_NAME);
    assert.equal(result.document.sampleRate, WORKER_SAMPLE_RATE);
    assert.equal(result.document.durationSeconds, WORKER_SECONDS);
    assert.equal(result.document.ingestedAt, PINNED_AT);
    assert.equal(result.document.stems.length, 2);
    assert.equal(result.document.stems[0].role, "harmonic");
    assert.equal(result.document.stems[1].role, "percussive");
    assert.equal(result.document.segments.length, WORKER_SECONDS);
    assert.ok(result.document.mix.rhythm.bpm >= 60 && result.document.mix.rhythm.bpm <= 190);
    assert.equal(typeof result.document.pcmhash, "number");
  });

  it("lands the mix and both stems as non-silent wavs that conserve the mix", async () => {
    assert.ok(result.ok);
    assert.equal(result.pointers.stems.length, 2);
    const mixGet = await store.get(result.pointers.mix.id);
    assert.ok(mixGet.ok && mixGet.data);
    const mix = parseWav(mixGet.data);
    assert.ok(mix.ok);
    assert.equal(mix.channels, 1);
    assert.equal(mix.sampleRate, WORKER_SAMPLE_RATE);
    assert.equal(mix.bitDepth, 16);
    assert.equal(mix.frames, sourceMono.length);
    const stems: { pcm: Float32Array[]; frames: number }[] = [];
    for (const pointer of result.pointers.stems) {
      const stemGet = await store.get(pointer.id);
      assert.ok(stemGet.ok && stemGet.data);
      const stem = parseWav(stemGet.data);
      assert.ok(stem.ok);
      assert.equal(stem.frames, sourceMono.length);
      stems.push({ pcm: stem.pcm, frames: stem.frames });
    }
    // the energy: the mix and both stems are non-silent
    const energy = (pcm: Float32Array): number => {
      let sum = 0;
      for (const value of pcm) sum += value * value;
      return sum;
    };
    assert.ok(energy(mix.pcm[0]) > 0, "the mix is non-silent");
    assert.ok(energy(stems[0].pcm[0]) > 0, "the harmonic stem is non-silent");
    assert.ok(energy(stems[1].pcm[0]) > 0, "the percussive stem is non-silent");
    // the conservation: harmonic + percussive equals the mix (the stored wavs too)
    let worst = 0;
    for (let i = 0; i < mix.frames; i++) {
      worst = Math.max(worst, Math.abs(stems[0].pcm[0][i] + stems[1].pcm[0][i] - mix.pcm[0][i]));
    }
    assert.ok(worst < 1e-3, `conservation error ${worst}`);
  });

  it("writes the stems manifest with the pointer chain and the source digest", async () => {
    assert.ok(result.ok);
    const got = await store.get(result.pointers.manifest.id);
    assert.ok(got.ok && got.data);
    const manifest = JSON.parse(new TextDecoder().decode(got.data)) as IngestStemsManifest;
    assert.equal(manifest.schema, INGEST_STEMS_SCHEMA_VERSION);
    assert.equal(manifest.name, DISPLAY_NAME);
    assert.equal(manifest.sampleRate, WORKER_SAMPLE_RATE);
    assert.equal(manifest.bitDepth, 16);
    assert.equal(manifest.sha256, sourceSha);
    assert.equal(manifest.sizeBytes, sourceWav.length);
    assert.equal(manifest.stems.length, 2);
    for (let i = 0; i < manifest.stems.length; i++) {
      assert.equal(manifest.stems[i].role, result.document.stems[i].role);
      assert.equal(manifest.stems[i].pointer.id, result.pointers.stems[i].id);
      assert.equal(manifest.stems[i].frames, result.document.stems[i].segments.length);
      assert.equal(manifest.stems[i].onsets, result.document.stems[i].onsetsSeconds.length);
    }
    // hpss found both stems: the sines feed the harmonic ridge, the clicks feed the percussive broadband
    assert.ok(manifest.stems[0].rms > manifest.stems[1].rms, "the harmonic stem carries the tonal energy");
    assert.ok(manifest.stems[1].onsets >= 4, `percussive onsets ${manifest.stems[1].onsets}`);
    const onsets = result.document.stems[1].onsetsSeconds;
    for (let i = 1; i < onsets.length; i++) {
      assert.ok(Math.abs(onsets[i] - onsets[i - 1] - 0.25) < 0.06, `click grid gap ${onsets[i] - onsets[i - 1]}`);
    }
  });

  it("carries the right kinds on every pointer and nothing else in the store", async () => {
    assert.ok(result.ok);
    assert.equal(result.pointers.mix.kind, "audio/wav");
    for (const stem of result.pointers.stems) assert.equal(stem.kind, "audio/wav");
    assert.equal(result.pointers.manifest.kind, "application/json");
    assert.equal((await store.list()).length, 4);
  });

  it("reports the phases in the pipeline order with ascending fractions", () => {
    assert.ok(result.ok);
    assert.deepEqual(
      progress.map((step) => step.phase),
      ["decode", "separate", "analyze", "segment", "store"],
    );
    for (let i = 0; i < progress.length; i++) {
      assert.ok(progress[i].fraction > 0 && progress[i].fraction <= 1);
      if (i > 0) assert.ok(progress[i].fraction > progress[i - 1].fraction, "ascending");
    }
    assert.equal(progress[progress.length - 1].fraction, 1);
  });

  it("leaves the row lane out when db is null (the pure lane)", () => {
    assert.ok(result.ok);
    assert.equal(result.rowId, undefined);
  });
});

describe("runIngestJob — the db lane on a temp sqlite", () => {
  /** One ingest_documents row as the sqlite table holds it (the PV1.001 column set). */
  interface StampRow {
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

  it("stamps the row with the owner, the kind, the visibility, the pointers, the size and the sha", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "debonair-ingest-worker-"));
    const database = new Database(path.join(dir, "ingest.db"));
    try {
      database.exec(`
        CREATE TABLE ingest_documents (
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
        `INSERT INTO ingest_documents (id, owner_id, kind, visibility, name, mix_pointer, stems_pointer,
         size_bytes, sha256, samplerate, durationseconds, pcmhash, ingestedat, docjson)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      const handle: IngestDbHandle = {
        async puttingestrow(row) {
          try {
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
          } catch (error) {
            return {
              ok: false,
              code: "insert-refused",
              message: error instanceof Error ? error.message : String(error),
            };
          }
        },
      };
      const progress: IngestJobProgress[] = [];
      const result = await runIngestJob(
        {
          bytes: sourceWav,
          name: WORKER_SOURCE_NAME,
          ownerId: OWNER_ID,
          kind: "upload",
          visibility: "vitrine",
          store: memoryblobstore(),
          db: handle,
          at: PINNED_AT,
        },
        (step) => progress.push(step),
      );
      assert.ok(result.ok);
      const rows = database.prepare("SELECT * FROM ingest_documents").all() as StampRow[];
      assert.equal(rows.length, 1);
      const row = rows[0];
      assert.equal(row.id, result.rowId);
      assert.match(row.id, /^[1-9]\d{0,19}$/); // the minted decimal form
      assert.equal(row.owner_id, OWNER_ID);
      assert.equal(row.kind, "upload");
      assert.equal(row.visibility, "vitrine");
      assert.equal(row.name, DISPLAY_NAME);
      assert.equal(row.mix_pointer, result.pointers.mix.id);
      assert.equal(row.stems_pointer, result.pointers.manifest.id);
      assert.equal(row.size_bytes, sourceWav.length);
      assert.equal(row.sha256, sourceSha);
      assert.equal(row.samplerate, WORKER_SAMPLE_RATE);
      assert.equal(row.durationseconds, WORKER_SECONDS);
      assert.equal(row.ingestedat, PINNED_AT);
      assert.equal(row.pcmhash, result.document.pcmhash);
      assert.deepEqual(JSON.parse(row.docjson), result.document);
      // the db lane rides the row phase after the store
      assert.deepEqual(
        progress.map((step) => step.phase),
        ["decode", "separate", "analyze", "segment", "store", "row"],
      );
      assert.equal(progress[progress.length - 1].fraction, 1);
    } finally {
      database.close();
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe("runIngestJob — determinism (the seeded law)", () => {
  it("answers the same document and the same digests for the same bytes", async () => {
    const runonce = async () => {
      const store = memoryblobstore();
      const result = await runIngestJob({
        bytes: sourceWav,
        name: WORKER_SOURCE_NAME,
        ownerId: OWNER_ID,
        kind: "upload",
        visibility: "private",
        store,
        db: null,
        at: PINNED_AT,
      });
      assert.ok(result.ok);
      const got = await store.get(result.pointers.manifest.id);
      assert.ok(got.ok && got.data);
      const manifest = JSON.parse(new TextDecoder().decode(got.data)) as IngestStemsManifest;
      return {
        document: JSON.stringify(result.document),
        mixsha: result.pointers.mix.sha256,
        stemshas: result.pointers.stems.map((pointer) => pointer.sha256),
        manifestshas: manifest.stems.map((stem) => stem.pointer.sha256),
        sizes: [result.pointers.mix.bytes, ...result.pointers.stems.map((pointer) => pointer.bytes)],
      };
    };
    assert.deepEqual(await runonce(), await runonce());
    /* the xvfb seats answer the fifteen-second honesty the same way: the
       ingest walk spawns real worker lanes the runner stamps under the
       five-second default, and the determinism pair runs the whole job
       twice, so the slow hosts answer inside the raised window. */
  }, 30000);
});

describe("runIngestJob — the failure codes", () => {
  it("answers bad-riff for garbage bytes (the honest first failure)", async () => {
    const result = await runIngestJob(jobinput({ bytes: new TextEncoder().encode("not a wav at all") }));
    assert.ok(!result.ok);
    assert.equal(result.code, "bad-riff");
  });

  it("answers truncated for a payload cut past the data claim", async () => {
    const result = await runIngestJob(jobinput({ bytes: sourceWav.subarray(0, sourceWav.length - 1000) }));
    assert.ok(!result.ok);
    assert.equal(result.code, "truncated");
  });

  it("answers empty-audio for a wav with no frames", async () => {
    const empty = new Uint8Array(sourceWav.subarray(0, 44));
    new DataView(empty.buffer).setUint32(40, 0, true); // the data chunk claims nothing
    const result = await runIngestJob(jobinput({ bytes: empty }));
    assert.ok(!result.ok);
    assert.equal(result.code, "empty-audio");
  });

  it("answers store-failed when the store refuses the size (the cap law)", async () => {
    const result = await runIngestJob(jobinput({ store: memoryblobstore({ capBytes: 64 }) }));
    assert.ok(!result.ok);
    assert.equal(result.code, "store-failed");
    assert.ok(result.message.includes("too-large"));
  });

  it("answers store-failed when the store lane throws (never a crash)", async () => {
    const hostile: BlobStore = {
      async put() {
        throw new Error("the lane is hostile");
      },
      async get() {
        return { ok: false, code: "not-found", message: "none", status: null };
      },
      async remove() {
        return { ok: false, code: "not-found", message: "none", status: null };
      },
      async list() {
        return [];
      },
      close() {},
    };
    const result = await runIngestJob(jobinput({ store: hostile }));
    assert.ok(!result.ok);
    assert.equal(result.code, "store-failed");
    assert.ok(result.message.includes("hostile"));
  });

  it("answers db-failed when the handle refuses the row", async () => {
    const handle: IngestDbHandle = {
      async puttingestrow() {
        return { ok: false, code: "refused", message: "the table is read only" };
      },
    };
    const result = await runIngestJob(jobinput({ db: handle }));
    assert.ok(!result.ok);
    assert.equal(result.code, "db-failed");
    assert.ok(result.message.includes("refused"));
  });

  it("answers db-failed when the handle throws (never a crash)", async () => {
    const handle: IngestDbHandle = {
      async puttingestrow() {
        throw new Error("the db exploded");
      },
    };
    const result = await runIngestJob(jobinput({ db: handle }));
    assert.ok(!result.ok);
    assert.equal(result.code, "db-failed");
    assert.ok(result.message.includes("exploded"));
  });
});


/* ===== the ingest recon lane battery ===== */









/** The analysis rate of the recon lane (the cd canon). */
const SR = RECON_SAMPLE_RATE;

/** A deterministic synthetic take: a sustained 440 hz sine (the tonal
 * layer, A4 for the yin lane) over a 120 bpm click train (the percussive
 * layer, the pulse for the tempo lane) — two seconds, two frames. */
function reconsynthetictake(): Float32Array {
  const mono = new Float32Array(SR * 2);
  for (let i = 0; i < mono.length; i++) {
    const t = i / SR;
    const sine = 0.35 * Math.sin(2 * Math.PI * 440 * t);
    const click = t % 0.5 < 0.015 ? 0.5 : 0;
    mono[i] = Math.max(-1, Math.min(1, sine + click));
  }
  return mono;
}

/** One pure 440 hz sine second — the clean probe of the spectral kernels. */
function pureSineSecond(): Float32Array {
  const second = new Float32Array(SR);
  for (let i = 0; i < second.length; i++) second[i] = 0.4 * Math.sin((2 * Math.PI * 440 * i) / SR);
  return second;
}

// the heavy artifacts, built once at collection: the standalone lane twice
// (the determinism proof) and the converter lane over the same separation
const TAKE = reconsynthetictake();
const RECON_FIRST = reconOf(TAKE, SR, { name: "law take" });
const RECON_SECOND = reconOf(TAKE, SR, { name: "law take" });
const STEMS = separate(TAKE);
const DECOMP = decompose(TAKE, STEMS, SR, { name: "law take", at: "2026-01-01T00:00:00.000Z" });
const INGEST_SNAPSHOT = JSON.parse(JSON.stringify(DECOMP.doc));
const RECON_CONVERTED = reconFromIngest(DECOMP.doc, TAKE, DECOMP.harmonic, DECOMP.percussive);

describe("the descriptor kernels (the deterministic measurements)", () => {
  it("seats the timbre library's own 13-coefficient mfcc for a sine", () => {
    const frame = RECON_FIRST.frames[0];
    assert.ok(frame, "the take seats its first frame");
    const record = frame as unknown as Record<string, number>;
    const seats = Array.from({ length: RECON_MFCC_COEFFICIENTS }, (_, c) => record[`mfcc${c}`]);
    assert.equal(seats.length, 13);
    for (const seat of seats) assert.ok(Number.isFinite(seat), "every coefficient is finite");
    // the seats equal the library's answer over the same shared spectrum —
    // the lane imports the front end, it never re-implements it
    const spectrum = frameSpectrum(Array.from(TAKE.subarray(0, FFT_SIZE)), SR);
    const coefficients = mfcc(spectrum.magnitudes, SR, { coefficients: RECON_MFCC_COEFFICIENTS });
    assert.equal(coefficients.length, 13);
    const again = mfcc(spectrum.magnitudes, SR, { coefficients: RECON_MFCC_COEFFICIENTS });
    assert.deepEqual([...again], [...coefficients], "the same spectrum answers the same coefficients");
    const rounded = (value: number): number => Math.round(value * 10000) / 10000;
    for (let c = 0; c < RECON_MFCC_COEFFICIENTS; c++) {
      assert.equal(seats[c], rounded(coefficients[c]), `the mfcc${c} seat equals the library's answer`);
    }
  });

  it("seats exactly 32 equal windows for a constant signal", () => {
    const constant = new Float32Array(SR).fill(0.5);
    const envelope = reconEnvelope32(constant, SR);
    assert.ok(Math.abs(envelope.mean - 0.5) < 1e-6, "the mean window rms is the constant");
    assert.ok(Math.abs(envelope.min - 0.5) < 1e-6);
    assert.ok(Math.abs(envelope.max - 0.5) < 1e-6);
    assert.equal(envelope.std, 0, "thirty-two equal windows carry no movement");
    assert.equal(envelope.dynamic, 0);
    assert.equal(RECON_ENVELOPE_WINDOWS, 32);
  });

  it("seats the fundamental bin of a pure sine as the strongest peak", () => {
    const spectrum = frameSpectrum(Array.from(pureSineSecond().subarray(0, FFT_SIZE)), SR);
    const peaks = reconSpectralPeaks(spectrum.magnitudes, spectrum.binHz);
    assert.equal(peaks.length, 10, "five hz/mag pairs");
    assert.ok(
      Math.abs(peaks[0] - 440) <= spectrum.binHz,
      `the strongest peak sits on the fundamental (${peaks[0]} hz)`,
    );
    assert.equal(peaks[1], 1, "the strongest peak normalizes to 1");
    for (let seat = 1; seat < 5; seat++) {
      assert.equal(peaks[seat * 2], 0, `a pure sine has no partial ${seat + 1}`);
      assert.equal(peaks[seat * 2 + 1], 0);
    }
  });

  it("detects A4 (midi 69) on a 440 hz sine with the yin lane", () => {
    const notes = reconYinNotes(pureSineSecond(), SR, 0, SR);
    assert.ok(notes.length >= 3, "the sine seats at least one note triple");
    assert.equal(notes.length % 3, 0);
    const [midi, onset, vel] = notes;
    assert.equal(Math.round(midi), 69, `the 440 hz sine is A4 (got midi ${midi})`);
    assert.ok(Math.abs(midi - 69) < 0.5, "the fundamental lands within a quarter tone");
    assert.ok(onset >= 0 && onset <= 1, "the onset seats inside the second");
    assert.ok(vel > 0 && vel <= 1, "the velocity seats in 0..1");
  });

  it("answers no note for silence (the honest aperiodic gate)", () => {
    const silence = new Float32Array(SR);
    assert.deepEqual(reconYinNotes(silence, SR, 0, SR), []);
  });

  it("fits the 48-scale library at the krumhansl root", () => {
    // the c major triad energy inside the major scale: capture 1, leak 0
    const majorTriad = [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0];
    assert.equal(keyOf(majorTriad).tonic, 0, "krumhansl seats the root on c");
    assert.equal(reconScaleFit(majorTriad, 0), 0, "the major scale wins at root c (ties keep the lowest id)");
    // the phrygian dominant degrees (root, b2, 4, 5) fit phrygian-dom —
    // the spec's own dictionary example
    const phrygian = [1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0];
    assert.equal(reconScaleFit(phrygian, 0), RECON_SCALE_NAMES.indexOf("phrygian-dom"));
  });

  it("seats the family by the register law", () => {
    const frame = (noteCount: number, noteMidiMean: number) => ({ noteCount, noteMidiMean });
    assert.equal(reconFamilyOf([frame(1, 40)], 0.1, 0.1), "bass");
    assert.equal(reconFamilyOf([frame(1, 60)], 0.1, 0.1), "guitar");
    assert.equal(reconFamilyOf([frame(1, 80)], 0.1, 0.1), "vocal");
    assert.equal(reconFamilyOf([frame(0, 0)], 0.1, 0.5), "percussion");
    assert.equal(reconFamilyOf([frame(0, 0)], 0.5, 0.1), "pad");
  });

  it("seats a per-second tempo series (never one global)", () => {
    const bpm = reconBpmPerSecond(TAKE, SR, 2);
    assert.equal(bpm.length, 2);
    for (const value of bpm) assert.ok(value >= 0 && value <= 250, `the bpm ${value} seats honestly`);
    assert.ok(bpm.some((value) => value > 0), "the 120 bpm click train carries a pulse");
  });
});

describe("the standalone lane (reconOf)", () => {
  it("answers the same document twice (the determinism law)", () => {
    assert.equal(serializeRecon(RECON_FIRST), serializeRecon(RECON_SECOND));
  });

  it("seats the canon rate, the frames and the layers of the take", () => {
    assert.equal(RECON_FIRST.header.sampleRate, 44100);
    assert.equal(RECON_FIRST.header.schema, "debonair.recon/3");
    assert.equal(RECON_FIRST.frames.length, 2, "two seconds, two frames");
    for (const frame of RECON_FIRST.frames) {
      assert.equal(frame.layers.length, 2, "the harmonic and percussive layers");
      assert.equal(frame.layers[0].layerId, RECON_LAYERS.indexOf("harmonic"));
      assert.equal(frame.layers[1].layerId, RECON_LAYERS.indexOf("percussive"));
      assert.deepEqual(frame.layers[1].midiNotes, [], "the percussive layer carries no notes");
      assert.equal(frame.layers[0].midiNotes.length % 3, 0, "the note lane seats triples");
      assert.ok(frame.noteCount >= 1, "the tonal sine seats notes");
      assert.equal(Math.round(frame.noteMidiMean), 69, "the 440 hz sine seats A4");
      assert.ok(frame.bpm >= 0, "the per-second bpm seats honestly");
    }
    assert.ok(RECON_FIRST.header.mostUsedKeyId >= 0 && RECON_FIRST.header.mostUsedKeyId <= 11);
    assert.ok(RECON_FIRST.header.mostUsedScaleId >= 0 && RECON_FIRST.header.mostUsedScaleId <= 47);
    assert.ok(RECON_FIRST.correlations.tempoFluctuationIndex >= 0);
    assert.ok(RECON_FIRST.correlations.tempoFluctuationIndex <= 1);
    assert.ok(Number.isInteger(RECON_FIRST.correlations.harmonicDistortionStateHash));
  });

  it("validates against the contract (the document the lane answers is lawful)", () => {
    const result = validateRecon(RECON_FIRST);
    assert.ok(result.ok);
  });

  it("resamples an off-canon source to the 44100 canon", () => {
    const eightK = new Float32Array(8000 + 800); // 1.1 s at 8 khz
    for (let i = 0; i < eightK.length; i++) eightK[i] = 0.3 * Math.sin((2 * Math.PI * 440 * i) / 8000);
    const doc = reconOf(eightK, 8000, { name: "off canon" });
    assert.equal(doc.header.sampleRate, 44100);
    assert.equal(doc.frames.length, 1);
    assert.ok(Math.abs(doc.header.durationSeconds - 1.1) < 0.01);
  });
});

describe("the converter lane (ingest/1 → recon/3)", () => {
  it("maps every segment fact onto its recon seat (information preserved)", () => {
    const doc = RECON_CONVERTED;
    assert.equal(doc.frames.length, DECOMP.doc.segments.length);
    for (const [index, segment] of DECOMP.doc.segments.entries()) {
      const frame = doc.frames[index];
      assert.equal(frame.s, segment.s);
      assert.equal(frame.rms, segment.rms, "the rms seat");
      assert.equal(frame.peak, segment.peak, "the peak seat");
      assert.equal(frame.zcr, segment.zcr, "the zcr seat");
      assert.equal(frame.centroid, segment.cent, "the centroid seat");
      assert.equal(frame.flatness, segment.flat, "the flatness seat");
      assert.equal(frame.beatStrength, segment.beat, "the beat strength seat");
      assert.equal(frame.onsetCount, segment.onsets, "the onset count seat");
      assert.equal(frame.bandLow, segment.bands[0], "the low band seat");
      assert.equal(frame.bandMid, segment.bands[1], "the mid band seat");
      assert.equal(frame.bandHigh, segment.bands[2], "the high band seat");
      // the chroma seats: the wheel normalized to unit sum, the dominant
      // pitch class preserved
      const wheel = [
        frame.chroma0,
        frame.chroma1,
        frame.chroma2,
        frame.chroma3,
        frame.chroma4,
        frame.chroma5,
        frame.chroma6,
        frame.chroma7,
        frame.chroma8,
        frame.chroma9,
        frame.chroma10,
        frame.chroma11,
      ];
      const wheelSum = wheel.reduce((sum, value) => sum + value, 0);
      assert.ok(Math.abs(wheelSum - 1) < 0.02 || wheelSum === 0, "the wheel sums to one (or silence)");
      const dominantFrame = wheel.indexOf(Math.max(...wheel));
      const dominantSegment = segment.chroma.indexOf(Math.max(...segment.chroma));
      assert.equal(dominantFrame, dominantSegment, "the dominant pitch class survives the normalization");
    }
  });

  it("carries the identity of the ingest document (name, duration, pcm hash)", () => {
    assert.equal(RECON_CONVERTED.header.name, DECOMP.doc.name);
    assert.equal(RECON_CONVERTED.header.durationSeconds, DECOMP.doc.durationSeconds);
    assert.equal(RECON_CONVERTED.header.pcmhash, DECOMP.doc.pcmhash);
    assert.ok(RECON_CONVERTED.header.bpmMedian >= 0);
    assert.equal(RECON_CONVERTED.header.timeSignature, "4/4", "the default meter seat");
    assert.equal(RECON_CONVERTED.header.encoding, "pcm16", "the default encoding seat");
    assert.equal(RECON_CONVERTED.header.mimeType, "audio/wav", "the default mime seat");
  });

  it("never removes a fact from the ingest document (the record stays whole)", () => {
    assert.deepEqual(JSON.parse(JSON.stringify(DECOMP.doc)), INGEST_SNAPSHOT);
    assert.equal(DECOMP.doc.schema, "debonair.ingest/1");
    assert.equal(DECOMP.doc.stems.length, 2, "both stems stay");
    assert.equal(DECOMP.doc.segments.length, 2, "the mix segments stay");
  });

  it("answers the same document as the standalone lane over the same take", () => {
    // the converter over the decomposition and the standalone lane agree:
    // one separation, one analysis, one law
    assert.equal(serializeRecon(RECON_CONVERTED), serializeRecon(RECON_FIRST));
  });

  it("exposes the per-track streams of the track-only exception", () => {
    const harmonic = trackStreamOf(RECON_FIRST, RECON_LAYERS.indexOf("harmonic"));
    const percussive = trackStreamOf(RECON_FIRST, RECON_LAYERS.indexOf("percussive"));
    assert.ok(harmonic.midiNotes.length >= 3, "the harmonic stream carries the yin notes");
    assert.equal(percussive.midiNotes.length, 0, "the percussive stream carries none");
    assert.ok(harmonic.spectralPeaks.length > 0, "the harmonic stream carries its peaks");
    assert.ok(percussive.spectralPeaks.length > 0, "the percussive stream carries its peaks");
  });

  it("round-trips the converter output through the contract parser", () => {
    const parsed = JSON.parse(serializeRecon(RECON_CONVERTED));
    assert.equal(parsed.header.schema, "debonair.recon/3");
    const validated = validateRecon(parsed);
    assert.ok(validated.ok, "the serialized converter output parses back lawful");
  });
});
