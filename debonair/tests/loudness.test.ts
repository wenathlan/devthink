// # loudness.test — honest unit tests for the loudness meter (K-weighting,
// gating, LRA, peaks, normalisation gain), runnable with the node built-in
// runner (no dependencies, no install):
//   node --test tests/loudness.test.ts
// The fixtures synthesise a 1 kHz sine at known amplitudes; every expected
// number is derived from the meter itself, never from a lookup table.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeLoudness,
  applyGain,
  biquadFilter,
  channelWeights,
  energyToLufs,
  gainToTarget,
  gatingBlocks,
  integratedLoudness,
  kHighpassCoefficients,
  kShelfCoefficients,
  kWeightChannel,
  loudnessRange,
  loudnessSeries,
  lufsToEnergy,
  percentile,
  samplePeakDb,
  truePeakDb,
  weightedMeanSquare,
} from "../loudness.ts";

const SR = 48000;

/** Synthesises a sine of `amp` amplitude at `hz` for `seconds`. */
function sine(amp: number, hz = 1000, seconds = 1): number[] {
  const out: number[] = [];
  for (let i = 0; i < SR * seconds; i++) out.push(amp * Math.sin((2 * Math.PI * hz * i) / SR));
  return out;
}

describe("energy domain conversions", () => {
  it("converts energy and LUFS both ways", () => {
    assert.ok(Math.abs(energyToLufs(1) + 0.691) < 1e-12, `full scale ${energyToLufs(1)}`);
    assert.ok(energyToLufs(0) === Number.NEGATIVE_INFINITY);
    assert.ok(Math.abs(lufsToEnergy(-0.691) - 1) < 1e-12);
    const roundtrip = energyToLufs(lufsToEnergy(-23));
    assert.ok(Math.abs(roundtrip + 23) < 1e-12, `roundtrip ${roundtrip}`);
  });

  it("weights channels like BS.1770 (the LFE counts zero)", () => {
    assert.deepEqual(channelWeights(4), [1, 1, 1, 0]);
    assert.deepEqual(channelWeights(2), [1, 1]);
    assert.deepEqual(channelWeights(0), [1]);
  });

  it("reads percentiles and the loudness range", () => {
    assert.ok(percentile([1, 2, 3, 4, 5], 50) === 3);
    assert.ok(percentile([1, 2, 3, 4, 5], 25) === 2);
    assert.ok(percentile([1, 2, 3, 4, 5], 0) === 1 && percentile([1, 2, 3, 4, 5], 100) === 5);
    assert.ok(Number.isNaN(percentile([], 10)));
    const lra = loudnessRange([-20, -20, -20, -40, -40]);
    assert.ok(Math.abs(lra - 20) < 1e-9, `lra ${lra}`);
  });

  it("gates the integrated loudness in two stages", () => {
    const e23 = lufsToEnergy(-23);
    assert.ok(Math.abs(integratedLoudness([e23, e23, e23, e23]) + 23) < 1e-12);
    const gated = integratedLoudness([e23, e23, e23, lufsToEnergy(-50)]);
    assert.ok(Math.abs(gated + 23) < 1e-9, `relative gate ${gated}`);
    assert.ok(integratedLoudness([0, 0, 0]) === Number.NEGATIVE_INFINITY);
  });
});

describe("the K filter chain", () => {
  it("filters with a biquad and carries its state", () => {
    const passthrough = { b0: 1, b1: 0, b2: 0, a1: 0, a2: 0 };
    const first = biquadFilter(passthrough, [1, 2, 3]);
    assert.deepEqual(first.filtered, [1, 2, 3]);
    assert.deepEqual(first.state, { x1: 3, x2: 2, y1: 3, y2: 2 });
    const next = biquadFilter(passthrough, [4], first.state);
    assert.deepEqual(next.filtered, [4]);
    assert.deepEqual(next.state, { x1: 4, x2: 3, y1: 4, y2: 3 });
  });

  it("keeps the BS.1770 filter shapes honest", () => {
    const shelf = kShelfCoefficients(SR);
    const dcgain = (shelf.b0 + shelf.b1 + shelf.b2) / (1 + shelf.a1 + shelf.a2);
    assert.ok(Math.abs(dcgain - 1) < 1e-9, `shelf dc gain ${dcgain}`);
    const hp = kHighpassCoefficients(SR);
    assert.ok(Math.abs(hp.b0 + hp.b1 + hp.b2) < 1e-12, "the RLB high-pass nulls dc");
    const tail = kWeightChannel(new Array(SR).fill(1), SR);
    assert.ok(Math.abs(tail[tail.length - 1]) < 1e-9, `dc tail ${tail[tail.length - 1]}`);
  });

  it("lays out 400 ms gating blocks with 100 ms hops", () => {
    assert.ok(gatingBlocks([sine(0.5, 1000, 1)], SR).length === 7);
    assert.ok(gatingBlocks([sine(0.5, 1000, 0.1)], SR).length === 0, "too short for one block");
    assert.ok(gatingBlocks([], SR).length === 0);
  });

  it("stays linear under scaling (6.02 LU for half the amplitude)", () => {
    const full = loudnessSeries([sine(0.5, 1000, 1)], SR, 0.4);
    const half = loudnessSeries([sine(0.5, 1000, 1).map((v) => v / 2)], SR, 0.4);
    assert.ok(full.length === half.length && full.length === 7);
    for (let i = 0; i < 3; i++)
      assert.ok(Math.abs(full[i] - half[i] - 6.0206) < 1e-4, `linearity ${full[i] - half[i]}`);
    const paired = weightedMeanSquare([sine(0.5), sine(0.5)], SR);
    assert.ok(Math.abs(paired - weightedMeanSquare([sine(0.5)], SR)) < 1e-9, "stereo of one signal measures the same");
  });
});

describe("peaks and normalisation", () => {
  it("reads sample and true peaks", () => {
    const wave = sine(0.5, 1000, 1);
    const sample = samplePeakDb(wave);
    assert.ok(Math.abs(sample + 6.020599913279624) < 1e-9, `sample peak ${sample}`);
    const truepeak = truePeakDb(wave);
    assert.ok(Math.abs(truepeak - sample) < 1e-9, `true peak ${truepeak}`);
    assert.ok(Math.abs(truePeakDb(new Array(100).fill(0.5)) + 6.020599913279624) < 1e-9, "dc peaks at its level");
    assert.ok(Math.abs(truePeakDb([0, 1, 0, -1])) < 1e-12, "the interpolated crest stays at full scale");
    assert.ok(samplePeakDb([]) === Number.NEGATIVE_INFINITY && truePeakDb([0, 0]) === Number.NEGATIVE_INFINITY);
  });

  it("computes the normalisation gain and applies it", () => {
    assert.ok(gainToTarget(-18, -23) === -5, "plain attenuation");
    assert.ok(gainToTarget(-50, -10) === 23, "the EBU boost clamp");
    assert.ok(gainToTarget(-30, -5, 23, -1, -20) === 19, "the true-peak ceiling clamp");
    assert.ok(gainToTarget(Number.NEGATIVE_INFINITY, -23) === 0, "silence is never boosted");
    const scaled = applyGain([1, 0.5], -6.020599913279624);
    assert.ok(Math.abs(scaled[0] - 0.5) < 1e-12 && Math.abs(scaled[1] - 0.25) < 1e-12, `gain ${scaled}`);
  });

  it("measures a full programme and refuses broken input", () => {
    const report = analyzeLoudness([sine(0.5, 1000, 1)], SR);
    assert.ok(report.ok, report.ok ? "" : report.message);
    assert.ok(Math.abs(report.value.integrated + 9.07) < 0.5, `integrated ${report.value.integrated}`);
    assert.ok(Math.abs(report.value.samplepeakdb + 6.020599913279624) < 1e-9);
    assert.ok(Math.abs(report.value.truepeakdb + 6.020599913279624) < 1e-9);
    assert.ok(Math.abs(report.value.lra) < 1e-9, "a steady sine has no range");
    const silence = analyzeLoudness([[0, 0, 0]], SR);
    assert.ok(silence.ok && silence.value.integrated === Number.NEGATIVE_INFINITY);
    const badrate = analyzeLoudness([sine(0.5, 1000, 1)], 0);
    assert.ok(!badrate.ok && badrate.code === "bad-samplerate");
    const empty = analyzeLoudness([[]], SR);
    assert.ok(!empty.ok && empty.code === "empty-signal");
  });
});
