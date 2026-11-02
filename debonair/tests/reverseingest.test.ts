// # reverseingest.test — the reconstruction lane of the v1 law: the
// pattern payload reconstructs through the render lane (byte parity with
// renderPlan under the same seed — the reverse ingest IS the render lane,
// only the door differs), the string and the parsed document answer the
// same bytes, the default identity is deterministic, the timeline payload
// reassembles its events through the recipe lanes (the kick onset lands,
// the note's partial rides, the per-second loudness follows the frames'
// own measurements, a silent frame answers silence), the store seat lands
// the wav beside its pointer and the refusing lanes answer their machine
// codes.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { onsetSecondsOf } from "../ingest.ts";
import { LANE_STEPS, type PatternProject, type PatternTimeline, serializePattern } from "../patternenums.ts";
import { renderPlan, type RenderBlobStore } from "../renderworker.ts";
import { reverseIngestPayload, timelineEvents } from "../reverseingest.ts";
import { FFT_SIZE, frameSpectrum } from "../spectrum.ts";
import { midiToHz } from "../tuning.ts";
import { wavInfo } from "../wavwriter.ts";

/** The mastering rate the reconstruction rides. */
const SR = 48000;

/** A silent sixteen-step lane. */
const SILENT: readonly number[] = new Array<number>(LANE_STEPS).fill(0);

/** The surgical score: one bar at 120 bpm — a kick at 0 and 8, one a4
 * lead note at step 4, one c3 bass note at step 0. */
function patternPayload(): PatternProject {
  return {
    schema: "debonair.pattern/1",
    bpm: 120,
    root: 0,
    scale: "major",
    bars: 1,
    mood: "surgical",
    prompt: "the reverse ingest fixture",
    drums: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      snare: [...SILENT],
      hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      clap: [...SILENT],
    },
    notes: [
      { step: 4, pitch: 69, vel: 0.8, dur: 2, voice: "lead" },
      { step: 0, pitch: 48, vel: 0.9, dur: 4, voice: "bass" },
    ],
    embedding: new Array<number>(32).fill(0),
  };
}

/** The dissected reference: three seconds — a busy opening second (a kick
 * at the top, an a4 note at the first quarter), a quieter second (one c5
 * note), a silent third. */
function timelinePayload(): PatternTimeline {
  return {
    schema: "debonair.timeline/1",
    source: "import",
    bpm: 120,
    seconds: 3,
    embedding: new Array<number>(32).fill(0),
    frames: [
      {
        s: 0,
        rms: 0.3,
        centroid: 800,
        flux: 0.5,
        chroma: new Array<number>(12).fill(1 / 12),
        embedding: new Array<number>(32).fill(0),
        events: [
          { kind: "transient", note: "kick", onset: 0, velocity: 1, confidence: 0.9 },
          { kind: "note", pitch: 69, onset: 0.25, velocity: 0.8, confidence: 0.8 },
        ],
        tags: [],
      },
      {
        s: 1,
        rms: 0.06,
        centroid: 900,
        flux: 0.2,
        chroma: new Array<number>(12).fill(1 / 12),
        embedding: new Array<number>(32).fill(0),
        events: [{ kind: "note", pitch: 72, onset: 0, velocity: 0.7, confidence: 0.7 }],
        tags: [],
      },
      {
        s: 2,
        rms: 0,
        centroid: 0,
        flux: 0,
        chroma: new Array<number>(12).fill(0),
        embedding: new Array<number>(32).fill(0),
        events: [],
        tags: [],
      },
    ],
  };
}

/** The memory store the tests hand (the render lane's own seam, structural). */
function memoryStore(): RenderBlobStore & { blobs: { id: string; bytes: Uint8Array; kind: string }[] } {
  const blobs: { id: string; bytes: Uint8Array; kind: string }[] = [];
  return {
    blobs,
    async put(bytes: Uint8Array, kind: string) {
      const id = String(blobs.length + 1);
      blobs.push({ id, bytes, kind });
      return { ok: true as const, pointer: { id, bytes: bytes.length, sha256: "", kind } };
    },
  };
}

/** The rms of one second of a pcm. */
function rmsOfSecond(pcm: Float32Array, second: number): number {
  let sum = 0;
  const from = second * SR;
  for (let i = from; i < from + SR && i < pcm.length; i++) sum += (pcm[i] ?? 0) ** 2;
  return Math.sqrt(sum / SR);
}

/** The rms of a window of a pcm. */
function rmsOfWindow(pcm: Float32Array, from: number, count: number): number {
  let sum = 0;
  for (let i = from; i < from + count && i < pcm.length; i++) sum += (pcm[i] ?? 0) ** 2;
  return Math.sqrt(sum / Math.max(1, count));
}

/** The dominant spectral peak of a window, hz. */
function dominantHz(pcm: Float32Array, from: number): number {
  const frame = new Array<number>(FFT_SIZE).fill(0);
  for (let i = 0; i < FFT_SIZE; i++) frame[i] = pcm[from + i] ?? 0;
  const spectrum = frameSpectrum(frame, SR);
  let best = 1;
  let bestMag = 0;
  for (let b = 1; b < spectrum.magnitudes.length; b++) {
    if ((spectrum.magnitudes[b] ?? 0) > bestMag) {
      bestMag = spectrum.magnitudes[b] ?? 0;
      best = b;
    }
  }
  return best * spectrum.binHz;
}

describe("reverseingest — the pattern payload (the render lane parity)", () => {
  const plan = patternPayload();

  it("reconstructs playable wav bytes through the render lane, byte parity with renderPlan", async () => {
    const store = memoryStore();
    const rendered = await renderPlan(plan, "parity-seed", store);
    assert.ok(rendered.ok, `renderPlan refused the fixture: ${rendered.ok ? "" : rendered.message}`);
    const result = await reverseIngestPayload(serializePattern(plan), { seed: "parity-seed" });
    assert.ok(result.ok, `the reverse ingest refused the score: ${result.ok ? "" : result.message}`);
    if (!result.ok || !rendered.ok) return;
    assert.equal(result.schema, "debonair.pattern/1");
    assert.equal(result.sampleRate, SR);
    assert.equal(result.durationSeconds, rendered.durationSeconds);
    assert.deepEqual([...result.wav], [...rendered.bytes], "the same plan and seed must answer the same bytes");
    const info = wavInfo(result.wav);
    assert.equal(info.sampleRate, SR);
    assert.equal(info.channels, 1);
    assert.equal(info.bitDepth, 16);
  });

  it("answers the same bytes for the json string and the parsed document", async () => {
    const fromString = await reverseIngestPayload(serializePattern(plan), { seed: "same" });
    const fromDoc = await reverseIngestPayload(plan, { seed: "same" });
    assert.ok(fromString.ok && fromDoc.ok);
    if (!fromString.ok || !fromDoc.ok) return;
    assert.deepEqual([...fromString.wav], [...fromDoc.wav]);
  });

  it("is deterministic under the default payload identity", async () => {
    const first = await reverseIngestPayload(plan);
    const second = await reverseIngestPayload(serializePattern(plan));
    assert.ok(first.ok && second.ok);
    if (!first.ok || !second.ok) return;
    assert.deepEqual([...first.wav], [...second.wav]);
    assert.equal(first.durationSeconds, second.durationSeconds);
  });

  it("lands the wav in the store beside its pointer when a store rides", async () => {
    const store = memoryStore();
    const result = await reverseIngestPayload(plan, { seed: "stored", store });
    assert.ok(result.ok);
    if (!result.ok) return;
    assert.ok(result.wavPointer, "the store seat must answer the pointer");
    assert.equal(result.wavPointer?.bytes, result.wav.length);
    assert.equal(store.blobs.length, 1);
    assert.deepEqual([...store.blobs[0]?.bytes ?? []], [...result.wav]);
  });
});

describe("reverseingest — the timeline payload (the reassembly)", () => {
  const timeline = timelinePayload();

  it("folds the frames onto the flat event list, time-ascending", () => {
    const events = timelineEvents(timeline);
    assert.equal(events.length, 3);
    for (let index = 1; index < events.length; index++) {
      assert.ok((events[index]?.time ?? 0) >= (events[index - 1]?.time ?? 0), "the events ascend");
    }
    assert.equal(events[0]?.lane, "kick");
    assert.equal(events[1]?.lane, "lead");
    assert.equal(events[1]?.midi, 69);
    assert.equal(events[2]?.midi, 72);
    // the shuffled payload answers the same reconstruction
    const shuffled = timelineEvents({ ...timeline, frames: [...timeline.frames].reverse() });
    assert.deepEqual(shuffled, events);
  });

  it("reconstructs playable wav bytes that span the timeline", async () => {
    const result = await reverseIngestPayload(timeline, { seed: "timeline" });
    assert.ok(result.ok, `the reverse ingest refused the timeline: ${result.ok ? "" : result.message}`);
    if (!result.ok) return;
    assert.equal(result.schema, "debonair.timeline/1");
    const info = wavInfo(result.wav);
    assert.equal(info.sampleRate, SR);
    assert.equal(info.channels, 1);
    assert.equal(info.bitDepth, 16);
    assert.ok(result.durationSeconds >= 3, `the reconstruction spans ${result.durationSeconds}s`);
  });

  it("lands the reassembly's onsets where the payload declares them", async () => {
    const result = await reverseIngestPayload(timeline, { seed: "timeline" });
    assert.ok(result.ok);
    if (!result.ok) return;
    const onsets = onsetSecondsOf(result.pcm, SR);
    assert.ok(onsets.length > 0, "the reconstruction carries no onset");
    // the a4 note at the first quarter leads the detected onsets — the
    // kick at the head is the envelope detector's own honest limit (a
    // rise from digital silence needs a previous frame to rise from)
    assert.ok(
      Math.abs((onsets[0] ?? 99) - 0.25) < 0.05,
      `the first onset lands at ${onsets[0]?.toFixed(3)}s — the a4 at the quarter must lead`,
    );
    // the kick at the top: its head energy leads its own decay
    const head = rmsOfWindow(result.pcm, 0, Math.round(0.04 * SR));
    const decay = rmsOfWindow(result.pcm, Math.round(0.15 * SR), Math.round(0.04 * SR));
    assert.ok(head > decay * 2, `the kick's head ${head.toFixed(4)} must lead its decay ${decay.toFixed(4)}`);
  });

  it("rides the note's partial through the reassembly (the recipe law)", async () => {
    const result = await reverseIngestPayload(timeline, { seed: "timeline" });
    assert.ok(result.ok);
    if (!result.ok) return;
    // the a4 note at second 0's first quarter — the lead recipe's square
    // rides its fundamental, the lowpass keeps it the strongest partial
    const dominant = dominantHz(result.pcm, Math.round(0.3 * SR));
    const expected = midiToHz(69);
    assert.ok(
      Math.abs(dominant - expected) < 15,
      `the reassembled a4 answers its strongest partial at ${dominant.toFixed(1)} hz, not ${expected.toFixed(1)}`,
    );
  });

  it("follows the frames' own loudness law — busier louder, silent frames silent", async () => {
    const result = await reverseIngestPayload(timeline, { seed: "timeline" });
    assert.ok(result.ok);
    if (!result.ok) return;
    const first = rmsOfSecond(result.pcm, 0);
    const second = rmsOfSecond(result.pcm, 1);
    const third = rmsOfSecond(result.pcm, 2);
    assert.ok(first > second * 1.3, `the louder frame must own the louder second (${first.toFixed(4)} vs ${second.toFixed(4)})`);
    assert.ok(third < 0.02, `the silent frame answers silence, not ${third.toFixed(4)}`);
  });
});

describe("reverseingest — the machine codes", () => {
  it("refuses a broken payload with bad-payload", async () => {
    for (const broken of ["", "not json at all", JSON.stringify({ schema: "debonair.other/1" })]) {
      const result = await reverseIngestPayload(broken);
      assert.ok(!result.ok && result.code === "bad-payload", `"${broken.slice(0, 24)}" must answer bad-payload`);
    }
  });

  it("refuses an empty payload with empty-payload", async () => {
    const silent: PatternProject = { ...patternPayload(), drums: { kick: [...SILENT], snare: [...SILENT], hat: [...SILENT], clap: [...SILENT] }, notes: [] };
    const score = await reverseIngestPayload(silent);
    assert.ok(!score.ok && score.code === "empty-payload");
    const quiet: PatternTimeline = { ...timelinePayload(), frames: [] };
    const timeline = await reverseIngestPayload(quiet);
    assert.ok(!timeline.ok && timeline.code === "empty-payload");
  });

  it("surfaces the store's refusal with store-failed", async () => {
    const refusing: RenderBlobStore = {
      async put() {
        return { ok: false, code: "no-room", message: "the store is full" };
      },
    };
    const result = await reverseIngestPayload(patternPayload(), { seed: "refused", store: refusing });
    assert.ok(!result.ok && result.code === "store-failed", "the refusing store must answer store-failed");
  });
});
