// # reconworker.test — the reverse loop of the recon lane (the wave 16b
// battery): the pure synthesis (the same document always answers the same
// wav bytes, the same seed and the same checksums — the determinism law of
// docs/recon.spec.md §9), the container law (mono pcm 16 at the 44100 cd
// canon, never the 48 khz master rate), the honest round-trip funnel (the
// descriptor lane's own measurements over the render land inside the bands
// the original's seats measured — rms, zcr, centroid, flatness per second),
// the anti-fake law (the render checksum identifies the synthesis, it never
// equals the source pcmhash the document carries — a checksum identifies,
// never verifies), the orchestrator and the job walk over the shared render
// ledger (queued → rendering → done with the reconstruct/encode/store
// phases, the same document answering the same wav across two jobs — the
// recon law the render lane's job-identity law deliberately differs from),
// the compact seed export (the canonical document + seed + checksums, no
// wav, no base64, no open pcm arrays — the honest size in the label) and
// the statistical header audits (the mode and bpm series twins of §4).
// runnable with vitest: pnpm vitest run test/reconworker.test.ts
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterAll, describe, it } from "vitest";
import { planTake } from "../arrangement.ts";
import { memoryblobstore } from "../blobstore.ts";
import { onsetSecondsOf, reconBpmSeriesOf, reconOf, reconRootModeOf, reconScaleModeOf, segmentsof } from "../ingest.ts";
import { RECON_NOTES_MAX, RECON_SCALE_NAMES, serializeRecon } from "../recon.ts";
import {
  RECON_PHASES,
  RECON_RENDER_BIT_DEPTH,
  RECON_RENDER_SAMPLE_RATE,
  RECON_WAV_KIND,
  type RenderJobPatch,
  reconSeedOf,
  renderRecon,
  renderReconPlan,
  startReconJob,
} from "../recon.ts";
import { renderjobseat } from "../render.ts";
import {
  EXPORT_LABELS,
  exportTake,
  RECON_SEED_SCHEMA_VERSION,
  reconSeedFile,
  scheduleTake,
} from "../take.ts";
import { HEADER_LAYOUT, wavInfo } from "../wavwriter.ts";

/** The analysis rate of the recon lane (the cd canon). */
const SR = RECON_RENDER_SAMPLE_RATE;

/**
 * A deterministic synthetic take — the same shape the descriptor battery
 * rides: a sustained 440 hz sine (the tonal layer) over a 120 bpm click
 * train (the percussive layer), two seconds, two frames.
 */
function synthetictake(): Float32Array {
  const mono = new Float32Array(SR * 2);
  for (let i = 0; i < mono.length; i++) {
    const t = i / SR;
    const sine = 0.35 * Math.sin(2 * Math.PI * 440 * t);
    const click = t % 0.5 < 0.015 ? 0.5 : 0;
    mono[i] = Math.max(-1, Math.min(1, sine + click));
  }
  return mono;
}

// the heavy artifacts, built once at collection: the document the descriptor
// lane answers, and the reconstruction over it (twice — the determinism proof)
const TAKE = synthetictake();
const DOC = reconOf(TAKE, SR, { name: "law take" });
const RENDER_FIRST = renderRecon(DOC);
const RENDER_SECOND = renderRecon(DOC);

/** Decodes the mono pcm16 payload of the render's wav bytes (the writer's
 * own layout — the test double of the decode lane). */
function decodeMono16(bytes: Uint8Array): Float32Array {
  const info = wavInfo(bytes);
  assert.equal(info.channels, 1, "the reconstruction is mono");
  assert.equal(info.bitDepth, 16, "the reconstruction is pcm 16");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const pcm = new Float32Array(info.frames);
  for (let i = 0; i < info.frames; i++) pcm[i] = view.getInt16(HEADER_LAYOUT.pcmPayloadOffset + i * 2, true) / 32768;
  return pcm;
}

/** The render's per-second measurements — the descriptor lane's own segment
 * kernel over the reconstruction (the same measurements that filled the
 * document's seats, run over the render: the honest funnel). */
function renderedSegments(): ReturnType<typeof segmentsof> {
  return segmentsof(decodeMono16(RENDER_FIRST.wav), SR, onsetSecondsOf(decodeMono16(RENDER_FIRST.wav), SR));
}

// ---------------------------------------------------------------------------
// the fixtures of the export lane
// ---------------------------------------------------------------------------

/** A real composed plan the seed export rides (the recon branch never
 * bounces when the document rides along — the plan seats the file name). */
const PLAN = planTake({ prompt: "recon export proof, dusty keys, warm sub", seed: "recon-export-proof" });
const SCHEDULE = scheduleTake(PLAN);

// ---------------------------------------------------------------------------
// the temp databases the walk tests ride
// ---------------------------------------------------------------------------

/** the temp directories the walk tests created (folded away at the end). */
const dirs: string[] = [];

/** One fresh temp sqlite database (the worker-test law). */
async function newdatabase(): Promise<Database> {
  const dir = await mkdtemp(path.join(tmpdir(), "debonair-reconworker-"));
  dirs.push(dir);
  return new Database(path.join(dir, "recon.db"));
}

afterAll(async () => {
  await Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

// ---------------------------------------------------------------------------
// the tests
// ---------------------------------------------------------------------------

describe("the reconstruction synthesis (renderRecon)", () => {
  it("answers the same bytes, seed and checksums twice (the determinism law)", () => {
    assert.deepEqual([...RENDER_SECOND.wav], [...RENDER_FIRST.wav], "the same document answers the same wav bytes");
    assert.equal(RENDER_SECOND.seed, RENDER_FIRST.seed);
    assert.deepEqual(RENDER_SECOND.checksums, RENDER_FIRST.checksums);
  });

  it("rides the cd canon container (mono pcm 16 at 44100, never the master rate)", () => {
    const info = wavInfo(RENDER_FIRST.wav);
    assert.equal(info.sampleRate, 44100, "the reconstruction renders at the cd canon");
    assert.equal(info.channels, 1);
    assert.equal(info.bitDepth, RECON_RENDER_BIT_DEPTH);
    assert.equal(info.frames, DOC.frames.length * SR, "one second of frames per document frame");
    assert.ok(Math.abs(info.durationSeconds - DOC.frames.length) < 0.01);
    assert.notEqual(info.sampleRate, 48000, "the two rates never silently swap");
  });

  it("seats the seed on the document's canonical bytes (a fresh document answers a fresh seed)", () => {
    assert.equal(RENDER_FIRST.seed, reconSeedOf(DOC));
    assert.match(RENDER_FIRST.seed, /^recon\/3:[0-9a-f]{8}$/);
    const renamed = reconOf(TAKE, SR, { name: "another take" });
    const otherSeed = reconSeedOf(renamed);
    assert.notEqual(otherSeed, RENDER_FIRST.seed, "a different document answers a different seed");
    assert.equal(reconSeedOf(renamed), otherSeed, "the seed is stable per document");
  });

  it("honours the anti-fake law: the render checksum identifies, never verifies", () => {
    const { checksums } = RENDER_FIRST;
    assert.equal(checksums.sourcePcmHash, DOC.header.pcmhash, "the source hash echoes the document's identity");
    assert.notEqual(
      checksums.renderPcmHash,
      checksums.sourcePcmHash,
      "the synthesis never reconstitutes the analyzed pcm — the hashes differ by law",
    );
    assert.ok(Number.isInteger(checksums.renderPcmHash));
    assert.ok(checksums.renderPcmHash >= 0 && checksums.renderPcmHash <= 0xffffffff);
    assert.ok(Number.isInteger(checksums.seedHash));
    // the same law on a second document: the render hash identifies the render
    const other = renderRecon(reconOf(TAKE, SR, { name: "another take" }));
    assert.notEqual(other.checksums.renderPcmHash, checksums.renderPcmHash);
  });

  it("renders silence for the inactive frames (the silence floor is honest)", () => {
    const pcm = decodeMono16(RENDER_FIRST.wav);
    const active = DOC.frames.map((frame) => frame.active > 0);
    for (const [second, frame] of DOC.frames.entries()) {
      if (frame.active > 0) continue;
      const slice = pcm.subarray(second * SR, (second + 1) * SR);
      let energy = 0;
      for (const sample of slice) energy += sample * sample;
      assert.ok(Math.sqrt(energy / slice.length) < 1e-4, `the inactive second ${second} answers silence`);
    }
    assert.ok(
      active.some((flag) => flag),
      "the fixture carries at least one sounding second",
    );
  });
});

describe("the honest round-trip funnel (the features of the render land inside the bands)", () => {
  it("answers the rms, zcr, centroid and flatness of every second inside the bands", () => {
    const segments = renderedSegments();
    assert.equal(segments.length, DOC.frames.length, "one measured second per frame");
    for (const [second, frame] of DOC.frames.entries()) {
      const measured = segments[second];
      assert.ok(measured, `the render seats its second ${second}`);
      // the loudness band — the layer normalization targets the rms seat
      assert.ok(
        Math.abs(measured.rms - frame.rms) <= Math.max(0.08, frame.rms * 0.45),
        `second ${second}: the render rms ${measured.rms.toFixed(4)} sits near the seat ${frame.rms.toFixed(4)}`,
      );
      // the brightness proxy band (zcr)
      assert.ok(
        Math.abs(measured.zcr - frame.zcr) <= Math.max(0.04, frame.zcr * 1.5),
        `second ${second}: the render zcr ${measured.zcr.toFixed(4)} sits near the seat ${frame.zcr.toFixed(4)}`,
      );
      // the spectral center band — within a musical neighbourhood of the seat
      assert.ok(
        measured.cent >= frame.centroid * 0.33 && measured.cent <= frame.centroid * 3,
        `second ${second}: the render centroid ${measured.cent.toFixed(1)} hz sits inside the band of the seat ${frame.centroid.toFixed(1)} hz`,
      );
      // the tone-versus-noise band (flatness, absolute)
      assert.ok(
        Math.abs(measured.flat - frame.flatness) <= 0.35,
        `second ${second}: the render flatness ${measured.flat.toFixed(4)} sits near the seat ${frame.flatness.toFixed(4)}`,
      );
    }
  });

  it("keeps the strongest partial of the tonal seconds near the strongest peak seat", () => {
    const pcm = decodeMono16(RENDER_FIRST.wav);
    for (const [second, frame] of DOC.frames.entries()) {
      if (frame.active <= 0 || frame.peakHz0 <= 0) continue;
      // the render's strongest correlation peak: the autocorrelation-free
      // shortcut — the zero-crossing fundamental of the loudest sine content
      const slice = pcm.subarray(second * SR, (second + 1) * SR);
      let crossings = 0;
      for (let i = 1; i < slice.length; i++) {
        if ((slice[i - 1] <= 0 && slice[i] > 0) || (slice[i - 1] >= 0 && slice[i] < 0)) crossings++;
      }
      const crossingHz = (crossings / slice.length) * SR;
      // the tonal energy centers within a factor of three of the dominant peak
      assert.ok(
        crossingHz >= frame.peakHz0 / 3 && crossingHz <= frame.peakHz0 * 6,
        `second ${second}: the render's crossing rate ${crossingHz.toFixed(1)} hz bands the dominant peak ${frame.peakHz0.toFixed(1)} hz`,
      );
    }
  });
});

describe("the orchestrator and the job walk (the shared render ledger)", () => {
  it("walks reconstruct → encode → store with the wav in the store", async () => {
    const database = await newdatabase();
    const store = memoryblobstore();
    const patches: RenderJobPatch[] = [];
    const base = renderjobseat(database);
    const jobs = {
      ...base,
      updatejob(id: string, patch: RenderJobPatch): void {
        patches.push(patch);
        base.updatejob(id, patch);
      },
    };
    const now = (() => {
      let clock = 0;
      return () => new Date(1_700_000_000_000 + clock++ * 1000).toISOString();
    })();
    const jobId = "9001";
    jobs.putjob({
      id: jobId,
      owner_id: "1",
      state: "queued",
      phase: null,
      fraction: 0,
      error: null,
      plan_json: serializeRecon(DOC),
      wav_pointer: null,
      track_pointer: null,
      created_at: now(),
      finished_at: null,
    });
    const run = await startReconJob({ store, jobs, now }, jobId);
    assert.ok(run.ok, `the walk lands done (${run.ok ? "" : `${run.code}: ${run.message}`})`);
    if (!run.ok) return;
    assert.equal(run.state, "done");
    assert.equal(run.jobId, jobId);
    assert.ok(run.wavPointer.length > 0);
    assert.equal(run.bytes, RENDER_FIRST.wav.length, "the bytes are the deterministic render");
    assert.ok(Math.abs(run.durationSeconds - DOC.frames.length) < 0.01);
    assert.equal(run.seed, RENDER_FIRST.seed);
    assert.deepEqual(run.checksums, RENDER_FIRST.checksums);
    const row = jobs.getjob(jobId);
    assert.ok(row);
    assert.equal(row.state, "done");
    assert.equal(row.phase, "store", "the last completed phase of the recon vocabulary");
    assert.equal(row.fraction, 1);
    assert.equal(row.wav_pointer, run.wavPointer);
    assert.equal(row.track_pointer, null, "a reconstruction is not a new take — no track row");
    assert.equal(row.error, null);
    // the phase vocabulary landed ascending, the recon's own names
    const phases = patches.map((patch) => patch.phase).filter((phase) => phase !== null && phase !== undefined);
    assert.deepEqual(phases, [...RECON_PHASES]);
    // the store holds the wav the pointer names, under the wav kind
    const stored = await store.get(run.wavPointer);
    assert.ok(stored.ok);
    assert.equal(stored.data?.byteLength, run.bytes);
    assert.equal(stored.pointer.kind, RECON_WAV_KIND);
    assert.equal(wavInfo(stored.data as Uint8Array).sampleRate, 44100);
    database.close();
  });

  it("answers the same wav across two jobs (the document is the take identity)", async () => {
    const database = await newdatabase();
    const store = memoryblobstore();
    const jobs = renderjobseat(database);
    const now = (): string => "2026-01-01T00:00:00.000Z";
    const runs = [];
    for (const jobId of ["9002", "9003"]) {
      jobs.putjob({
        id: jobId,
        owner_id: "1",
        state: "queued",
        phase: null,
        fraction: 0,
        error: null,
        plan_json: serializeRecon(DOC),
        wav_pointer: null,
        track_pointer: null,
        created_at: now(),
        finished_at: null,
      });
      const run = await startReconJob({ store, jobs, now }, jobId);
      assert.ok(run.ok);
      if (run.ok) runs.push(run);
    }
    assert.equal(runs.length, 2);
    const [first, second] = runs as Extract<Awaited<ReturnType<typeof startReconJob>>, { ok: boolean }>[];
    if (!("wavPointer" in first) || !("wavPointer" in second)) throw new Error("the runs must land");
    const firstBytes = await store.get(first.wavPointer);
    const secondBytes = await store.get(second.wavPointer);
    assert.ok(firstBytes.ok && secondBytes.ok);
    assert.deepEqual(
      [...(secondBytes.data as Uint8Array)],
      [...(firstBytes.data as Uint8Array)],
      "two jobs over one document answer the same wav — the recon determinism law",
    );
    database.close();
  });

  it("fails honestly on a broken queued payload (bad-document) and refuses the re-run (conflict)", async () => {
    const database = await newdatabase();
    const store = memoryblobstore();
    const jobs = renderjobseat(database);
    const now = (): string => "2026-01-01T00:00:00.000Z";
    const jobId = "9004";
    jobs.putjob({
      id: jobId,
      owner_id: "1",
      state: "queued",
      phase: null,
      fraction: 0,
      error: null,
      plan_json: "not a recon document at all",
      wav_pointer: null,
      track_pointer: null,
      created_at: now(),
      finished_at: null,
    });
    const failed = await startReconJob({ store, jobs, now }, jobId);
    assert.ok(!failed.ok);
    if (!failed.ok) {
      assert.equal(failed.code, "bad-document");
      assert.match(failed.message, /recon contract/);
    }
    const row = jobs.getjob(jobId);
    assert.ok(row);
    assert.equal(row.state, "failed");
    assert.match(row.error ?? "", /^bad-document:/);
    // the re-run of a landed job answers conflict (the walk is one-shot)
    const rerun = await startReconJob({ store, jobs, now }, jobId);
    assert.ok(!rerun.ok);
    if (!rerun.ok) assert.equal(rerun.code, "conflict");
    // a job that answers nothing answers not-found
    const missing = await startReconJob({ store, jobs, now }, "42");
    assert.ok(!missing.ok);
    if (!missing.ok) assert.equal(missing.code, "not-found");
    database.close();
  });

  it("answers the typed store refusal through renderReconPlan (never a throw)", async () => {
    const store = memoryblobstore();
    const refusing = {
      put: async (): Promise<{ ok: false; code: string; message: string }> => ({
        ok: false,
        code: "bad-kind",
        message: "the test store refuses",
      }),
    };
    const result = await renderReconPlan(DOC, refusing);
    assert.ok(!result.ok);
    if (!result.ok) {
      assert.equal(result.code, "store-failed");
      assert.match(result.message, /the test store refuses/);
    }
    // the healthy lane answers the pointer and the deterministic bytes
    const healthy = await renderReconPlan(DOC, store, (progress) => {
      assert.ok(RECON_PHASES.includes(progress.phase));
      assert.ok(progress.fraction > 0 && progress.fraction <= 1);
    });
    assert.ok(healthy.ok);
    if (healthy.ok) {
      assert.equal(healthy.wavPointer.kind, RECON_WAV_KIND);
      assert.deepEqual([...healthy.bytes], [...RENDER_FIRST.wav]);
      assert.equal(healthy.seed, RENDER_FIRST.seed);
    }
  });
});

describe("the compact seed export (the honest size answer)", () => {
  it("exports the canonical document, the seed and the checksums — no wav, no base64, no pcm arrays", async () => {
    const files = await exportTake("recon", PLAN, SCHEDULE, DOC);
    assert.equal(files.length, 1);
    const file = files[0];
    assert.equal(file.name, `${PLAN.id}-recon-seed.json`);
    assert.match(file.label, /no pcm/, "the label declares the absence honestly");
    assert.match(file.label, /kb/, "the label declares the honest size");
    const text = await file.blob.text();
    const parsed = JSON.parse(text) as Record<string, unknown>;
    assert.equal(parsed.schema, RECON_SEED_SCHEMA_VERSION);
    assert.equal(parsed.seed, reconSeedOf(DOC));
    assert.equal(parsed.name, PLAN.id);
    const checksums = parsed.checksums as Record<string, number>;
    assert.equal(checksums.pcmhash, DOC.header.pcmhash);
    assert.equal(checksums.spectralPeaksHash, DOC.header.spectralPeaksHash);
    assert.equal(checksums.midiNotesHash, DOC.header.midiNotesHash);
    const document = parsed.document as { header: { schema: string }; frames: unknown[] };
    assert.equal(document.header.schema, "debonair.recon/3");
    assert.equal(document.frames.length, DOC.frames.length);
    // the ban list (docs/recon.spec.md §7): no base64 anywhere
    assert.ok(!text.includes("base64"), "the word base64 never rides the export");
    assert.ok(!/[A-Za-z0-9+/]{64,}={0,2}/.test(text), "no base64-shaped run rides the export");
    // no open pcm arrays: every numeric array inside the payload stays inside
    // the frozen seat caps (peaks 10, notes RECON_NOTES_MAX*3)
    const numericArrays: number[] = [];
    const walk = (value: unknown): void => {
      if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === "number") numericArrays.push(value.length);
        for (const entry of value) walk(entry);
        return;
      }
      if (value !== null && typeof value === "object") {
        for (const entry of Object.values(value as Record<string, unknown>)) walk(entry);
      }
    };
    walk(parsed);
    assert.ok(numericArrays.length > 0, "the layer lanes carry their short streams");
    for (const length of numericArrays) {
      assert.ok(
        length <= RECON_NOTES_MAX * 3,
        `a numeric array of ${length} entries rides the export — only the frozen seat caps (peaks/notes) are lawful`,
      );
    }
  });

  it("answers the same export bytes twice and weighs a fraction of the pcm", async () => {
    const first = reconSeedFile(DOC, "proof");
    const second = reconSeedFile(DOC, "proof");
    const firstBytes = new Uint8Array(await first.blob.arrayBuffer());
    const secondBytes = new Uint8Array(await second.blob.arrayBuffer());
    assert.deepEqual([...secondBytes], [...firstBytes], "the canonical serializer pins the export bytes");
    // the size honesty: the seed export weighs a fraction of the pcm it names
    assert.ok(
      firstBytes.length < RENDER_FIRST.wav.length / 10,
      `the seed export (${firstBytes.length} bytes) weighs under a tenth of the wav (${RENDER_FIRST.wav.length} bytes)`,
    );
    assert.match(first.label, /no pcm/);
  });

  it("seats the recon action in the export vocabulary", () => {
    assert.equal(EXPORT_LABELS.recon, "recon seed");
    assert.ok(Object.keys(EXPORT_LABELS).includes("recon"));
  });
});

describe("the statistical header audits (the mode and series twins)", () => {
  it("answers the header's mostUsed seats from the frames (the modes, never a pinned global)", () => {
    assert.equal(reconScaleModeOf(DOC.frames), DOC.header.mostUsedScaleId, "the scale mode twin");
    assert.equal(reconRootModeOf(DOC.frames), DOC.header.mostUsedKeyId, "the root mode twin");
    // the dictionary mirrors answer the names (the payload never carries both sides)
    const scaleName = RECON_SCALE_NAMES[DOC.header.mostUsedScaleId];
    const rootName = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"][DOC.header.mostUsedKeyId];
    assert.ok(typeof scaleName === "string" && scaleName.length > 0);
    assert.ok(typeof rootName === "string" && rootName.length > 0);
    // the hand law: the mode counts the sounding seconds, ties keep the lowest id
    const frames = [
      { active: 1, scaleType: 5, scaleRoot: 3 },
      { active: 1, scaleType: 5, scaleRoot: 3 },
      { active: 1, scaleType: 5, scaleRoot: 3 },
      { active: 1, scaleType: 2, scaleRoot: 3 },
      { active: 1, scaleType: 2, scaleRoot: 9 },
      { active: 0, scaleType: 40, scaleRoot: 11 }, // silent — never counts
    ];
    assert.equal(reconScaleModeOf(frames), 5);
    assert.equal(reconRootModeOf(frames), 3);
  });

  it("answers the per-second bpm series the header summarizes (never one global)", () => {
    const series = reconBpmSeriesOf(DOC);
    assert.equal(series.length, DOC.frames.length);
    assert.deepEqual(
      series,
      DOC.frames.map((frame) => frame.bpm),
    );
    const positive = series.filter((value) => value > 0);
    assert.ok(positive.length > 0, "the click train carries a pulse the series seats");
    // the median seat is the series' median, the mean seat its mean
    const sorted = [...positive].sort((left, right) => left - right);
    const median =
      sorted.length % 2 === 1
        ? sorted[(sorted.length - 1) / 2]
        : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    assert.ok(Math.abs(DOC.header.bpmMedian - median) < 0.01, "the median seat rides the series");
  });
});
