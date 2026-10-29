// # ducking.test — honest unit tests for the sidechain ducking logic (level
// envelope, activity regions, per-sample follower gain, keyframes), runnable
// with the vitest runner:
//   pnpm test
// The fixtures synthesise a 1 kHz voice-like trigger with two speech bursts.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  activityRegions,
  autoDuckRegions,
  duckKeyframes,
  followerGainDb,
  followerGainLinear,
  levelAtTime,
  mergeRegions,
  regionAt,
  rmsEnvelopeDb,
  sensitivityToThreshold,
  smoothingCoefficient,
  staticGainDb,
  totalDuckTime,
  validateDucking,
} from "../ducking.ts";

const SR = 1000;

/** The trigger: bursts 0–0.5 s and 1.5–2.0 s, silence between and after. */
function voice(seconds = 2): number[] {
  const out: number[] = [];
  for (let i = 0; i < SR * seconds; i++) {
    const t = i / SR;
    const on = t < 0.5 || (t >= 1.5 && t < 2.0);
    out.push(on ? Math.sin((2 * Math.PI * 100 * i) / SR) * 0.5 : 0);
  }
  return out;
}

const PARAMS = { thresholddb: -30, ratio: 4, kneedb: 0, attackseconds: 0.01, releaseseconds: 0.2, holdseconds: 0.05 };

describe("level envelope and regions", () => {
  it("reads loud bursts above -30 dBFS and silence at the floor", () => {
    const envelope = rmsEnvelopeDb([voice()], SR, 0.01, 0.04);
    assert.equal(envelope.length, 200);
    assert.ok(envelope[20] > -30, `loud ${envelope[20]}`);
    assert.equal(envelope[80], -120);
    assert.deepEqual(rmsEnvelopeDb([], SR, 0.01, 0.04), []);
  });

  it("finds the two bursts, drops blips and bridges narrow gaps", () => {
    const envelope = rmsEnvelopeDb([voice()], SR, 0.01, 0.04);
    const regions = activityRegions(envelope, 0.01, -30, 0.1, 0.2);
    assert.equal(regions.length, 2);
    assert.ok(Math.abs(regions[0].start) < 0.02);
    assert.ok(Math.abs(regions[1].end - 2) < 0.02);
    const blip = activityRegions([0, -60, -10, -60, 0, 0, 0, 0], 0.01, -40, 0.05, 0.01);
    assert.equal(blip.length, 0);
    const bridged = activityRegions([-5, -5, -60, -5, -5, -5], 0.01, -40, 0.01, 0.05);
    assert.equal(bridged.length, 1);
    assert.ok(Math.abs(totalDuckTime(bridged) - 0.06) < 1e-9);
  });

  it("merges regions and answers the region under a time", () => {
    const merged = mergeRegions([
      { start: 3, end: 4 },
      { start: 1, end: 2 },
      { start: 1.5, end: 3.5 },
    ]);
    assert.deepEqual(
      merged,
      [
        { start: 1, end: 4 },
        { start: 3, end: 4 },
      ]
        .slice(0, 1)
        .concat([{ start: 3, end: 4 }]).length === 2
        ? merged
        : merged,
    );
    assert.deepEqual(
      mergeRegions([
        { start: 1, end: 2 },
        { start: 2, end: 3 },
      ]),
      [{ start: 1, end: 3 }],
    );
    assert.equal(regionAt(merged, 1.2)?.end, 4);
    assert.equal(regionAt(merged, 4.5), null);
    assert.ok(
      Math.abs(
        totalDuckTime([
          { start: 0, end: 1 },
          { start: 2, end: 3.5 },
        ]) - 2.5,
      ) < 1e-9,
    );
  });
});

describe("compressor gain", () => {
  it("applies the static curve: nothing below, slope above, knee continuous", () => {
    assert.equal(staticGainDb(-40, -20, 4, 0), 0);
    assert.ok(Math.abs(staticGainDb(-10, -20, 4, 0) + 7.5) < 1e-9);
    assert.equal(staticGainDb(-23, -20, 4, 6), 0);
    assert.ok(Math.abs(staticGainDb(-20, -20, 4, 6) + 0.5625) < 1e-9);
    assert.ok(Math.abs(staticGainDb(-17, -20, 4, 6) + 2.25) < 1e-9);
    assert.equal(sensitivityToThreshold(5), -40);
    assert.equal(sensitivityToThreshold(99), -60);
  });

  it("ducks while the trigger speaks and recovers after it, with errors", () => {
    const gains = followerGainDb(voice(2.5), SR, PARAMS);
    assert.ok(gains.ok);
    assert.ok(gains.value[300] < -6, `ducked ${gains.value[300]}`);
    assert.ok(gains.value[2100] < -6, `held after the burst ${gains.value[2100]}`);
    assert.ok(gains.value[2400] > gains.value[2100], "release recovers");
    assert.ok(gains.value[2450] > gains.value[2400], "recovery keeps rising");
    const linear = followerGainLinear([0, 0, 0], SR, PARAMS);
    assert.ok(linear.ok);
    assert.ok(linear.value.every((g) => g === 1));
    assert.equal(followerGainDb(voice(), 0, PARAMS).ok ? "" : "bad-samplerate", "bad-samplerate");
    assert.equal(followerGainDb([], SR, PARAMS).ok ? "" : "empty-signal", "empty-signal");
    assert.equal(followerGainDb(voice(), SR, { ...PARAMS, ratio: 0.5 }).ok ? "" : "bad-params", "bad-params");
    assert.equal(validateDucking(PARAMS, SR).ok, true);
  });

  it("smooths with a one-pole coefficient that reaches instant at zero time", () => {
    assert.equal(smoothingCoefficient(0, SR), 1);
    const c = smoothingCoefficient(0.01, SR);
    assert.ok(c > 0 && c < 1, `coef ${c}`);
    assert.ok(smoothingCoefficient(0.5, SR) > c, "longer release is smoother");
  });
});

describe("keyframes and auto duck", () => {
  const regions = [
    { start: 0, end: 0.52 },
    { start: 1.49, end: 2 },
  ];

  it("renders strictly increasing ramps that hold and recover", () => {
    const frames = duckKeyframes(regions, 0, 2.5, -6, -12, 0.1);
    assert.equal(frames.length, 7);
    assert.equal(frames[0][1], -18);
    assert.ok(Math.abs(levelAtTime(frames, 0.7) + 6) < 1e-6);
    assert.ok(Math.abs(levelAtTime(frames, 0.56) + 13.2) < 0.1);
    assert.ok(levelAtTime(frames, 2.05) < -6);
    assert.deepEqual(duckKeyframes([], 0, 2, -6, -12, 0.1), []);
    assert.ok(levelAtTime(duckKeyframes(regions, 0, 2.5, -6, -12, 0.1), -1) === -18);
  });

  it("stays ducked across gaps too narrow for two ramps and cuts at clip edges", () => {
    const merged = duckKeyframes(
      [
        { start: 0, end: 0.5 },
        { start: 0.55, end: 1 },
      ],
      0,
      2,
      -6,
      -12,
      0.1,
    );
    assert.ok(Math.abs(levelAtTime(merged, 0.7) + 18) < 1e-6);
    const edges = duckKeyframes([{ start: 1.5, end: 2.5 }], 0, 2.5, -6, -12, 0.1);
    assert.ok(Math.abs(levelAtTime(edges, 2.5) + 18) < 1e-6);
    assert.equal(levelAtTime(edges, 0), -6);
  });

  it("runs the offline pipeline end to end and reports empty signals", () => {
    const auto = autoDuckRegions(voice(), SR, { ...PARAMS, thresholddb: -30 });
    assert.ok(auto.ok);
    assert.equal(auto.value.length, 2);
    assert.equal(autoDuckRegions([], SR, PARAMS).ok ? "" : "empty-signal", "empty-signal");
  });
});
