// # analyze.test — the analysis pipeline: a synthetic click track answers
// its true bpm, a pure-tone key answers its pitch class, the report carries
// the schema v1 shape and the structure segments stay inside the duration.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { analyze, BAND_LABELS } from "../debonair/analyze.ts";

/** Builds a percussive click track at the given bpm (deterministic). */
function clicks(bpm: number, seconds: number, sampleRate = 44100): number[] {
  const out = new Array<number>(Math.round(seconds * sampleRate)).fill(0);
  const beat = (60 / bpm) * sampleRate;
  for (let hit = 0; hit * beat < out.length; hit++) {
    const start = Math.round(hit * beat);
    for (let i = 0; i < 900 && start + i < out.length; i++) {
      out[start + i] = Math.exp((-3 * i) / 300) * Math.sin((2 * Math.PI * 1000 * i) / sampleRate);
    }
  }
  return out;
}

describe("analyze — the pipeline", () => {
  it("reads the tempo of a 120 bpm click track", () => {
    const report = analyze(clicks(120, 6), 44100);
    assert.ok(Math.abs(report.rhythm.bpm - 120) <= 6, `bpm ${report.rhythm.bpm} drifted past 6`);
  });

  it("keys a 220hz-dominant tone to the A pitch class", () => {
    const tone = Array.from({ length: 44100 * 2 }, (_, i) => 0.6 * Math.sin((2 * Math.PI * 220 * i) / 44100));
    const report = analyze(tone, 44100);
    assert.equal(report.key.tonicName, "A");
  });

  it("answers the schema v1 shape", () => {
    const report = analyze(clicks(90, 4), 44100);
    assert.equal(report.sampleRate, 44100);
    assert.ok(Math.abs(report.durationSeconds - 4) < 0.1);
    assert.equal(report.spectrum.bands.length, BAND_LABELS.length);
    assert.ok(report.loudness.integrated < 0, "integrated lufs must be negative");
    assert.ok(Array.isArray(report.structure));
  });

  it("keeps structure sections inside the duration", () => {
    const report = analyze(clicks(140, 5), 44100);
    for (const section of report.structure) {
      assert.ok(section.start >= 0 && section.end <= report.durationSeconds + 0.2);
      assert.ok(section.energy > 0 && section.energy <= 1);
    }
  });

  it("counts fingerprint hashes when the switch is on", () => {
    const report = analyze(clicks(120, 2), 44100, { fingerprint: true });
    assert.ok(report.fingerprintHashes > 0);
  });
});
