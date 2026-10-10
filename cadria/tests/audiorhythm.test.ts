// # audiorhythm.test — deterministic unit tests for the cadria rhythm layer,
// runnable with the node built-in runner (no install):
//   node --test tests/audiorhythm.test.ts
// Fixtures synthesize click tracks, swings and jitter straight into PCM —
// no binary files, no randomness.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { onsetEnvelope, onsetPeaks, rhythmStats } from "../audiorhythm.ts";
import { canonicalTempo, RhythmError } from "../audiorhythmbeat.ts";

/** builds a mono sine burst at hz for ms on a track at sampleRate. */
function burst(
  track: Float32Array,
  sampleRate: number,
  startMs: number,
  durationMs: number,
  hz: number,
  gain = 0.8,
): void {
  const start = Math.round((startMs / 1000) * sampleRate);
  const length = Math.round((durationMs / 1000) * sampleRate);
  for (let i = 0; i < length && start + i < track.length; i++) {
    track[start + i] += gain * Math.sin((2 * Math.PI * hz * i) / sampleRate);
  }
}

/** synthesizes a click track: short 1200Hz bursts every `periodMs`. */
function clickTrack(sampleRate: number, durationMs: number, periodMs: number, clickMs = 18): Float32Array {
  const track = new Float32Array(Math.round((durationMs / 1000) * sampleRate));
  for (let t = 0; t < durationMs; t += periodMs) burst(track, sampleRate, t, clickMs, 1200);
  return track;
}

describe("onset envelope", () => {
  const sampleRate = 22050;
  it("answers zero flux for silence", () => {
    const { envelope } = onsetEnvelope(new Float32Array(sampleRate * 2), sampleRate);
    let max = 0;
    for (const v of envelope) if (v > max) max = v;
    assert.ok(max === 0, `silence flux must be 0, got ${max}`);
  });
  it("fires peaks on a click track and stays near zero between", () => {
    const track = clickTrack(sampleRate, 4000, 500);
    const { envelope, frameMs } = onsetEnvelope(track, sampleRate);
    assert.ok(frameMs > 0);
    let peaks = 0;
    for (let i = 1; i < envelope.length - 1; i++)
      if (envelope[i] > envelope[i - 1] && envelope[i] >= envelope[i + 1] && envelope[i] > 0.05) peaks++;
    assert.ok(peaks >= 6, `expected at least 6 flux peaks for 7 clicks, got ${peaks}`);
  });
  it("keeps frameMs tied to the hop and sample rate", () => {
    const { frameMs } = onsetEnvelope(clickTrack(sampleRate, 1000, 250), sampleRate, { size: 1024, hop: 256 });
    assert.ok(Math.abs(frameMs - (256 / sampleRate) * 1000) < 1e-9);
  });
  it("throws RhythmError for a bad sample rate", () => {
    assert.throws(() => onsetEnvelope(new Float32Array(1024), 0), RhythmError);
  });
  it("is deterministic", () => {
    const track = clickTrack(sampleRate, 2000, 333);
    const a = onsetEnvelope(track, sampleRate);
    const b = onsetEnvelope(track, sampleRate);
    assert.deepEqual([...b.envelope], [...a.envelope]);
  });
});

describe("onset peaks", () => {
  const sampleRate = 22050;
  it("finds near-exact counts on an impulse track", () => {
    const track = clickTrack(sampleRate, 4000, 500);
    const { envelope, frameMs } = onsetEnvelope(track, sampleRate);
    const onsets = onsetPeaks(envelope, frameMs);
    // the t=0 click sits inside the first stft frame — spectral flux has no
    // previous frame to diff against, so detection starts at the second click.
    assert.ok(onsets.length >= 5 && onsets.length <= 7, `expected 5-7 onsets, got ${onsets.length}`);
    assert.ok(Math.abs(onsets[0] - 500) < 80, `first detected onset near 500ms, got ${onsets[0]}`);
  });
  it("answers no peaks on silence", () => {
    const { envelope, frameMs } = onsetEnvelope(new Float32Array(sampleRate), sampleRate);
    assert.equal(onsetPeaks(envelope, frameMs).length, 0);
  });
  it("respects the minimum gap", () => {
    const track = clickTrack(sampleRate, 2000, 90);
    const { envelope, frameMs } = onsetEnvelope(track, sampleRate);
    const onsets = onsetPeaks(envelope, frameMs, { minGapMs: 200 });
    for (let i = 1; i < onsets.length; i++)
      assert.ok(onsets[i] - onsets[i - 1] >= 200 - 1e-9, `gap ${onsets[i] - onsets[i - 1]} below minGapMs`);
  });
  it("returns ascending times", () => {
    const track = clickTrack(sampleRate, 3000, 400);
    const { envelope, frameMs } = onsetEnvelope(track, sampleRate);
    const onsets = onsetPeaks(envelope, frameMs);
    for (let i = 1; i < onsets.length; i++) assert.ok(onsets[i] > onsets[i - 1]);
  });
});

describe("tempo estimate via stats", () => {
  const sampleRate = 22050;
  it("reads a 120 bpm click track at 118-122", () => {
    const stats = rhythmStats(clickTrack(sampleRate, 8000, 500), sampleRate);
    assert.ok(stats.rawBpm >= 118 && stats.rawBpm <= 122, `bpm ${stats.rawBpm} outside 118-122`);
    assert.equal(stats.multiplier, 1);
    assert.ok(stats.regularityIndex > 0.6, `regularity ${stats.regularityIndex} too low`);
  });
  it("canonicalizes 180 bpm into the 70-160 fold", () => {
    const folded = canonicalTempo(180);
    assert.equal(folded.bpm, 90);
    assert.equal(folded.multiplier, 0.5);
  });
  it("reads a 90 bpm track near 90", () => {
    const stats = rhythmStats(clickTrack(sampleRate, 8000, 666.6667), sampleRate);
    assert.ok(stats.bpm >= 86 && stats.bpm <= 94, `bpm ${stats.bpm} outside 86-94`);
  });
  it("answers the zero band for silence without throwing", () => {
    const stats = rhythmStats(new Float32Array(sampleRate * 3), sampleRate);
    assert.equal(stats.bpm, 0);
    assert.equal(stats.confidence, 0);
    assert.equal(stats.onsetsPerSecond, 0);
    assert.deepEqual(stats.swing, { ratio: 0.5, swung: false });
  });
  it("keeps regularity of a metronome above a jittered track", () => {
    const clean = rhythmStats(clickTrack(sampleRate, 6000, 500), sampleRate);
    const jittered = clickTrack(sampleRate, 6000, 500);
    for (let t = 0, k = 0; t < 6000; t += 500, k++) {
      const drift = (k % 2 === 0 ? 28 : -31) * (1 + (k % 3) / 4);
      burst(jittered, sampleRate, Math.max(0, t + drift), 18, 1200, 0.5);
    }
    const rough = rhythmStats(jittered, sampleRate);
    assert.ok(
      clean.regularityIndex > rough.regularityIndex,
      `clean ${clean.regularityIndex} must beat jitter ${rough.regularityIndex}`,
    );
  });
  it("reports a swung track as swung", () => {
    const sampleRate2 = 22050;
    const track = new Float32Array(Math.round(4 * sampleRate2));
    for (let beat = 0; beat < 8; beat++) {
      const base = beat * 500;
      burst(track, sampleRate2, base, 15, 1200);
      burst(track, sampleRate2, base + 340, 12, 900, 0.5);
    }
    const stats = rhythmStats(track, sampleRate2);
    assert.ok(stats.swing.ratio > 0.58, `ratio ${stats.swing.ratio} below the swing threshold`);
    assert.equal(stats.swing.swung, true);
  });
});

describe("stats hygiene", () => {
  const sampleRate = 22050;
  it("is deterministic end to end", () => {
    const track = clickTrack(sampleRate, 5000, 428.57);
    assert.deepEqual(rhythmStats(track, sampleRate), rhythmStats(track, sampleRate));
  });
  it("carries only finite numbers", () => {
    const stats = rhythmStats(clickTrack(sampleRate, 4000, 500), sampleRate);
    const walk = (value: unknown): void => {
      if (typeof value === "number") assert.ok(Number.isFinite(value), `non-finite ${value}`);
      else if (value !== null && typeof value === "object") for (const child of Object.values(value)) walk(child);
    };
    walk(stats);
  });
  it("clamps onsetsPerSecond to a sane band", () => {
    const stats = rhythmStats(clickTrack(sampleRate, 4000, 500), sampleRate);
    assert.ok(
      stats.onsetsPerSecond > 0 && stats.onsetsPerSecond < 20,
      `onsets/s ${stats.onsetsPerSecond} outside sanity`,
    );
  });
  it("throws for a non-finite sample rate", () => {
    assert.throws(() => rhythmStats(new Float32Array(1024), NaN), RhythmError);
  });
});
