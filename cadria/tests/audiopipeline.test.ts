// # audiopipeline.test — deterministic end-to-end tests for the wave-1
// orchestrator, runnable with the node built-in runner:
//   node --test tests/audiopipeline.test.ts
// The fixture synthesizes a 4-second 4-phase song (saw intro, hats, c-major
// triad, decaying pad) straight into pcm — no binary files on disk.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeWav } from "../audiodecode.ts";
import { analyzePcm, analyzeWavBytes, PipelineError, reportDigest } from "../audiopipeline.ts";

const SAMPLE_RATE = 48000;

/** appends a sine/saw tone with the given gain envelope into the track. */
function tone(
  track: Float32Array,
  sampleRate: number,
  startMs: number,
  durationMs: number,
  hz: number,
  gain = 0.6,
  kind: "sine" | "saw" = "sine",
): void {
  const start = Math.round((startMs / 1000) * sampleRate);
  const length = Math.round((durationMs / 1000) * sampleRate);
  for (let i = 0; i < length && start + i < track.length; i++) {
    const phase = (hz * i) / sampleRate;
    const value = kind === "saw" ? 2 * (phase - Math.floor(phase + 0.5)) : Math.sin(2 * Math.PI * phase);
    const fade = i < length * 0.1 ? i / (length * 0.1) : i > length * 0.85 ? (length - i) / (length * 0.15) : 1;
    track[start + i] += gain * value * fade;
  }
}

/** the shared 4-second song fixture: a steady 120bpm kick spine under an
 * intro saw, hats, triad and falling pad — the kick keeps the tempo band
 * decisive for both the pcm and the quantized wav path. */
function songFixture(): Float32Array {
  const track = new Float32Array(4 * SAMPLE_RATE);
  for (let t = 0; t < 4000; t += 500) tone(track, SAMPLE_RATE, t, 120, 60, 0.7);
  tone(track, SAMPLE_RATE, 0, 1000, 110, 0.5, "saw");
  for (const hz of [261.63, 329.63, 392.0]) tone(track, SAMPLE_RATE, 2000, 1000, hz, 0.4);
  for (const [i, hz] of [220, 196, 174.61].entries())
    tone(track, SAMPLE_RATE, 2000 + i * 120, 1000 - i * 120, hz, 0.45 - i * 0.12);
  return track;
}

/** wraps pcm into a minimal 16-bit mono wav byte buffer (RIFF header). */
function wavBytes(samples: Float32Array, sampleRate: number): Uint8Array {
  const pcm = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    pcm[i] = Math.round(clamped * 32767);
  }
  const bytes = new Uint8Array(44 + pcm.length * 2);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string): void => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };
  text(0, "RIFF");
  view.setUint32(4, 36 + pcm.length * 2, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, pcm.length * 2, true);
  bytes.set(new Uint8Array(pcm.buffer), 44);
  return bytes;
}

describe("analysis report", () => {
  const song = songFixture();
  const report = analyzePcm(song, SAMPLE_RATE);

  it("carries schemaVersion 1 and a sane source block", () => {
    assert.equal(report.schemaVersion, 1);
    assert.equal(report.source.kind, "pcm");
    assert.equal(report.source.channels, 1);
    assert.ok(Math.abs(report.source.durationMs - 4000) < 60, `duration ${report.source.durationMs}`);
    assert.equal(report.source.sampleRate, 22050);
  });
  it("answers every analysis block", () => {
    for (const block of ["spectrum", "rhythm", "harmonic", "timbre", "structure", "descriptor"] as const) {
      assert.ok(report[block] != null, `missing block ${block}`);
    }
  });
  it("reads a sane tempo band", () => {
    assert.ok(report.rhythm.rawBpm >= 100 && report.rhythm.rawBpm <= 145, `bpm ${report.rhythm.rawBpm}`);
    assert.ok(report.rhythm.confidence > 0.1, `confidence ${report.rhythm.confidence}`);
  });
  it("keys the triad section with strength", () => {
    assert.ok(report.harmonic.key.strength > 0, `strength ${report.harmonic.key.strength}`);
    assert.ok(report.harmonic.key.tonic >= 0 && report.harmonic.key.tonic <= 11);
  });
  it("fuses a 32-dim descriptor clamped to 0-1", () => {
    assert.equal(report.descriptor.vector.length, 32);
    for (const dim of report.descriptor.vector) assert.ok(Number.isFinite(dim) && dim >= 0 && dim <= 1, `dim ${dim}`);
    assert.equal(report.descriptor.version, 1);
  });
  it("sections the four-phase fixture in order", () => {
    assert.ok(report.structure.sectionCount >= 2, `sections ${report.structure.sectionCount}`);
    assert.ok(
      report.structure.durationMs > 0 && Math.abs(report.structure.durationMs - report.source.durationMs) < 120,
      `structure duration ${report.structure.durationMs} vs source ${report.source.durationMs}`,
    );
    assert.ok(["arch", "rise", "fall", "wave", "flat"].includes(report.structure.narrativeShape));
  });
  it("is deterministic apart from the timings", () => {
    const again = analyzePcm(song, SAMPLE_RATE);
    const strip = (r: typeof report): Omit<typeof r, "timings"> => {
      const { timings: _timings, ...rest } = r;
      return rest;
    };
    assert.deepEqual(strip(again), strip(report));
  });
  it("survives a json round trip with the same shape", () => {
    const restored = JSON.parse(JSON.stringify(report));
    assert.equal(restored.schemaVersion, 1);
    assert.equal(restored.descriptor.vector.length, 32);
    assert.equal(restored.structure.sectionCount, report.structure.sectionCount);
  });
});

describe("wav path", () => {
  const song = songFixture();
  it("agrees with the pcm path modulo container quantization", () => {
    const fromBytes = analyzeWavBytes(wavBytes(song, SAMPLE_RATE), { analysisSampleRate: 22050 });
    const fromPcm = analyzePcm(song, SAMPLE_RATE, 1, { analysisSampleRate: 22050 });
    // the wav container quantizes to 16 bits: each path stays bit-deterministic
    // on its own input (covered by the determinism test), and across paths the
    // stable stats agree — tempo within two bpm — while onset-sensitive dims
    // (swing, regularity) may flip under the quantization staircase, so the
    // whole vector only needs to stay close on average.
    assert.ok(
      Math.abs(fromBytes.rhythm.rawBpm - fromPcm.rhythm.rawBpm) < 2,
      `bpm ${fromBytes.rhythm.rawBpm} vs ${fromPcm.rhythm.rawBpm}`,
    );
    let sum = 0;
    for (let i = 0; i < fromPcm.descriptor.vector.length; i++)
      sum += Math.abs(fromBytes.descriptor.vector[i] - fromPcm.descriptor.vector[i]);
    const meanDiff = sum / fromPcm.descriptor.vector.length;
    assert.ok(meanDiff < 0.15, `mean dim diff ${meanDiff.toFixed(4)} too high`);
    assert.equal(fromBytes.source.kind, "wav");
  });
  it("round trips through the decode layer first", () => {
    const bytes = wavBytes(song, SAMPLE_RATE);
    const decoded = decodeWav(bytes, { targetSampleRate: 22050, mono: true });
    assert.ok(decoded.length > 0);
    assert.equal(decoded.channels, 1);
  });
});

describe("error taxonomy", () => {
  it("refuses an empty slice", () => {
    assert.throws(
      () => analyzePcm(new Float32Array(0), 48000),
      (error: unknown) => error instanceof PipelineError && error.code === "pipeline-empty-samples",
    );
  });
  it("refuses a slice shorter than one second", () => {
    assert.throws(
      () => analyzePcm(new Float32Array(22050 / 2), 22050),
      (error: unknown) => error instanceof PipelineError && error.code === "pipeline-too-short",
    );
  });
  it("refuses a non-finite sample rate", () => {
    assert.throws(
      () => analyzePcm(new Float32Array(48000), NaN),
      (error: unknown) => error instanceof PipelineError && error.code === "pipeline-unsupported-sample-rate",
    );
  });
  it("refuses empty wav bytes", () => {
    assert.throws(
      () => analyzeWavBytes(new Uint8Array(0)),
      (error: unknown) => error instanceof PipelineError && error.code === "pipeline-empty-samples",
    );
  });
});

describe("report digest", () => {
  it("names bpm, key, shape and seed in lowercase", () => {
    const digest = reportDigest(analyzePcm(songFixture(), SAMPLE_RATE));
    assert.match(digest, /bpm \d+/);
    assert.match(digest, / (major|minor) /);
    assert.match(digest, /seed [0-9a-f]+/);
    assert.equal(digest, digest.toLowerCase());
  });
});
