// # ingestworker.test — the server worker contract: the hand-rolled wav
// decoder mirrors the wavwriter's own formats (pcm 16, pcm 24, ieee float
// 32 — the round trips land within the quantization, the float lane is
// exact, the foreign shapes answer the machine codes), the full pipeline
// runs end to end on a seeded synthetic take (two sines and a click
// train, so hpss finds both stems) through the memory blob store — the
// document is the ingest.ts shape, the mix and the stems land as
// non-silent wavs that conserve the mix, the stems manifest carries the
// pointer chain and the source digest, the phases report in the pipeline
// order with ascending fractions — the db lane stamps the temp sqlite row
// (owner, kind, visibility, the pointer pair, the size, the sha) through
// the injectable handle, and the same bytes answer the same document and
// the same digests (the seeded law). runnable with vitest:
// pnpm vitest run tests/ingestworker.test.ts
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { beforeAll, describe, it } from "vitest";
import { mintid } from "../bigintids.ts";
import type { BlobStore } from "../blobstore.ts";
import { memoryblobstore } from "../blobstore.ts";
import { INGEST_SCHEMA_VERSION } from "../ingest.ts";
import type {
  IngestDbHandle,
  IngestJobInput,
  IngestJobProgress,
  IngestJobResult,
  IngestStemsManifest,
} from "../ingestworker.ts";
import { downmixmono, INGEST_STEMS_SCHEMA_VERSION, parseWav, runIngestJob } from "../ingestworker.ts";
import { encodeWav } from "../wavwriter.ts";

/** The source rate of the synthetic take (a rate the writer's band carries). */
const SAMPLE_RATE = 44100;
/** The length of the synthetic take in whole seconds (one vector frame per second). */
const SECONDS = 2;
/** The raw job name (one trailing extension folds away into the display name). */
const SOURCE_NAME = "sine click take.wav";
/** The display name the document carries (the extension folded). */
const DISPLAY_NAME = "sine click take";
/** The pinned instant every deterministic run stamps (the seeded law). */
const PINNED_AT = "2026-01-01T00:00:00.000Z";
/** The owner id of every test job (the minted decimal string the rows stamp). */
const OWNER_ID = mintid();

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

/** The full synthetic wav the pipeline ingests (16-bit at the source rate). */
const sourceWav = encodeWav([syntheticsource(SAMPLE_RATE, SECONDS)], { sampleRate: SAMPLE_RATE, bitDepth: 16 });
/** The source samples (the decode round trip compares against these). */
const sourceMono = syntheticsource(SAMPLE_RATE, SECONDS);
/** The independent digest of the source bytes (node crypto, not the store's own rounds). */
const sourceSha = createHash("sha256").update(sourceWav).digest("hex");
/** A half-second wav for the failure lanes (the pipeline still walks every phase before it). */
const tinyWav = encodeWav([syntheticsource(SAMPLE_RATE, 0.5)], { sampleRate: SAMPLE_RATE, bitDepth: 16 });

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
    name: SOURCE_NAME,
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
    assert.equal(decoded.sampleRate, SAMPLE_RATE);
    assert.equal(decoded.bitDepth, 16);
    assert.equal(decoded.frames, sourceMono.length);
    assert.equal(decoded.durationSeconds, sourceMono.length / SAMPLE_RATE);
    assert.equal(decoded.isFloat, false);
    assert.equal(decoded.pcm.length, 1);
    let worst = 0;
    for (let i = 0; i < sourceMono.length; i++) {
      worst = Math.max(worst, Math.abs(decoded.pcm[0][i] - sourceMono[i]));
    }
    assert.ok(worst <= 1 / 32767, `round trip error ${worst}`);
  });

  it("round trips the 24-bit encode within the quantization", () => {
    const decoded = parseWav(encodeWav([sourceMono], { sampleRate: SAMPLE_RATE, bitDepth: 24 }));
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
    const decoded = parseWav(encodeWav([sourceMono], { sampleRate: SAMPLE_RATE, bitDepth: 32 }));
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
    const decoded = parseWav(encodeWav([left, right], { sampleRate: SAMPLE_RATE, bitDepth: 16 }));
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
        name: SOURCE_NAME,
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
    assert.equal(result.document.sampleRate, SAMPLE_RATE);
    assert.equal(result.document.durationSeconds, SECONDS);
    assert.equal(result.document.ingestedAt, PINNED_AT);
    assert.equal(result.document.stems.length, 2);
    assert.equal(result.document.stems[0].role, "harmonic");
    assert.equal(result.document.stems[1].role, "percussive");
    assert.equal(result.document.segments.length, SECONDS);
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
    assert.equal(mix.sampleRate, SAMPLE_RATE);
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
    assert.equal(manifest.sampleRate, SAMPLE_RATE);
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
    const dir = await mkdtemp(path.join(tmpdir(), "debonair-ingestworker-"));
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
          name: SOURCE_NAME,
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
      assert.equal(row.samplerate, SAMPLE_RATE);
      assert.equal(row.durationseconds, SECONDS);
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
        name: SOURCE_NAME,
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
  });
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
