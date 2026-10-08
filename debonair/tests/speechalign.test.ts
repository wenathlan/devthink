// # speechalign.test — honest unit tests for the speech alignment logic (RMS
// framing, silence threshold, phrase segmentation, grid fitting with stretch
// limits), runnable with the node built-in runner (no dependencies, no
// install):
//   node --test tests/speechalign.test.ts
// The fixture synthesises a 3 s "voice": two sine phrases (0.2–0.8 s and
// 1.2–1.7 s) with 50 ms fades over digital silence, so every phrase boundary
// the logic reports is checkable by hand.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  alignSpeech,
  beatGridTimes,
  clampStretch,
  defaultSpeechParams,
  fitPlan,
  flagsToSegments,
  frameRms,
  maxStretchRatio,
  mergeSegments,
  noiseFloorDb,
  planOffsets,
  rmsToDb,
  segmentAt,
  speechThresholdDb,
  stretchRatio,
  totalSpeechSeconds,
  trimSegments,
  voicedFlags,
} from "../speechalign.ts";

const SR = 1000;
const FRAMESIZE = 50;
const HOP = 25;

/** The voice: two faded sine phrases (0.2–0.8 s and 1.2–1.7 s) over silence. */
function voice(): number[] {
  const out = new Array<number>(SR * 3).fill(0);
  const phrases: Array<[number, number]> = [
    [0.2, 0.8],
    [1.2, 1.7],
  ];
  for (const [from, to] of phrases) {
    for (let i = Math.round(from * SR); i < Math.round(to * SR); i++) {
      const t = i / SR;
      const fade = Math.max(0, Math.min((t - from) / 0.05, (to - t) / 0.05, 1));
      out[i] = 0.4 * fade * Math.sin((2 * Math.PI * 140 * i) / SR);
    }
  }
  return out;
}

/** The alignment parameters the query tests share. */
const PARAMS = {
  samplerate: SR,
  framesize: FRAMESIZE,
  hop: HOP,
  margindb: 12,
  gapseconds: 0.12,
  minseconds: 0.1,
  bpm: 120,
  beats: 5,
  offsetseconds: 0,
  minratio: 0.5,
  maxratio: 2,
};

describe("energy framing and threshold", () => {
  it("frames the recording into RMS windows", () => {
    const frames = frameRms(voice(), FRAMESIZE, HOP);
    assert.ok(frames.length === 119, `frames ${frames.length}`);
    assert.ok(frames[0] === 0, "the leading silence frames to zero");
    assert.ok(Math.abs(frames[12] - 0.282842712474619) < 1e-9, `full frame ${frames[12]}`);
    assert.deepEqual(frameRms(new Array(100).fill(0.5), 50, 25), [0.5, 0.5, 0.5]);
    assert.ok(frameRms(new Array(30).fill(1), 50, 25).length === 0, "too short for one frame");
    assert.ok(Math.abs(rmsToDb(0.1) + 20) < 1e-12 && rmsToDb(0) === Number.NEGATIVE_INFINITY);
  });

  it("derives the silence threshold from the envelope", () => {
    const env = frameRms(voice(), FRAMESIZE, HOP).map(rmsToDb);
    assert.ok(Math.abs(noiseFloorDb([-60, -60, -60, -20, -20]) + 60) < 1e-12, "the floor is the 10th percentile");
    assert.ok(Math.abs(speechThresholdDb([-60, -60, -60, -20, -20], 12) + 48) < 1e-12, "floor plus margin");
    const threshold = speechThresholdDb(env, 12);
    assert.ok(threshold > -55 && threshold < -47, `threshold ${threshold}`);
    assert.ok(speechThresholdDb([], 12) === Number.NEGATIVE_INFINITY, "no frame, no threshold");
    const flags = voicedFlags(env, threshold);
    assert.ok(flags.filter((f) => f).length === 46, "only the phrase frames are voiced");
  });
});

describe("phrase detection on the synthesised voice", () => {
  it("finds the two phrases at their hand-checkable boundaries", () => {
    const env = frameRms(voice(), FRAMESIZE, HOP).map(rmsToDb);
    const flags = voicedFlags(env, speechThresholdDb(env, 12));
    const segments = flagsToSegments(flags, FRAMESIZE / SR, HOP / SR);
    assert.ok(segments.length === 2, `phrases ${segments.length}`);
    assert.ok(
      Math.abs(segments[0].start - 0.175) < 1e-9 && Math.abs(segments[0].end - 0.825) < 1e-9,
      `A ${JSON.stringify(segments[0])}`,
    );
    assert.ok(
      Math.abs(segments[1].start - 1.175) < 1e-9 && Math.abs(segments[1].end - 1.725) < 1e-9,
      `B ${JSON.stringify(segments[1])}`,
    );
  });

  it("stitches voiced-frame runs into phrases", () => {
    const segments = flagsToSegments([true, true, true, false, false, true], 0.25, 0.125);
    assert.deepEqual(segments, [
      { start: 0, end: 0.5 },
      { start: 0.625, end: 0.875 },
    ]);
    assert.deepEqual(flagsToSegments([], 0.25, 0.125), []);
  });

  it("merges close phrases and trims blips", () => {
    const phrases = [
      { start: 0, end: 0.5 },
      { start: 0.55, end: 1 },
      { start: 2, end: 3 },
    ];
    assert.deepEqual(mergeSegments(phrases, 0.1), [
      { start: 0, end: 1 },
      { start: 2, end: 3 },
    ]);
    assert.ok(mergeSegments(phrases, 0.04).length === 3, "a wider gap survives");
    assert.deepEqual(
      trimSegments(
        [
          { start: 0, end: 0.15 },
          { start: 0, end: 0.3 },
        ],
        0.2,
      ),
      [{ start: 0, end: 0.3 }],
    );
  });

  it("locates phrases and sums the speech time", () => {
    const phrases = [
      { start: 0, end: 0.5 },
      { start: 0.55, end: 1 },
    ];
    assert.deepEqual(segmentAt(phrases, 0.25), { start: 0, end: 0.5 });
    assert.ok(segmentAt(phrases, 0.5) === undefined, "the end is exclusive");
    assert.ok(Math.abs(totalSpeechSeconds(phrases) - 0.95) < 1e-12);
    assert.ok(totalSpeechSeconds([]) === 0);
  });
});

describe("grid fitting", () => {
  it("builds the beat grid and the stretch limits", () => {
    const grid = beatGridTimes(120, 4);
    assert.deepEqual(grid, [0, 0.5, 1, 1.5]);
    const shifted = beatGridTimes(90, 3, 1);
    assert.ok(Math.abs(shifted[2] - (1 + 2 / 1.5)) < 1e-12, `offset grid ${shifted[2]}`);
    assert.ok(beatGridTimes(0, 4).length === 0, "no tempo, no grid");
    assert.ok(stretchRatio(2, 1) === 0.5 && stretchRatio(0, 5) === 1, "a degenerate source does not stretch");
    assert.deepEqual(clampStretch(3, 0.5, 2), { ratio: 2, clamped: true });
    assert.deepEqual(clampStretch(1.5, 0.5, 2), { ratio: 1.5, clamped: false });
  });

  it("fits phrases into slots and clamps the stretch", () => {
    const phrases = [
      { start: 0.175, end: 0.825 },
      { start: 1.175, end: 1.725 },
    ];
    const plan = fitPlan(phrases, beatGridTimes(120, 5), 0.5, 2);
    assert.ok(plan.length === 2, `entries ${plan.length}`);
    assert.ok(Math.abs(plan[0].ratio - 0.5 / 0.65) < 1e-12 && !plan[0].clamped, `slot 0 ${plan[0].ratio}`);
    assert.ok(Math.abs(plan[1].targetstart - 0.5) < 1e-12 && Math.abs(plan[1].targetend - 1) < 1e-12);
    const squeezed = fitPlan([{ start: 0, end: 0.65 }], [0, 0.5, 1], 0.9, 2);
    assert.deepEqual(squeezed[0].ratio, 0.9);
    assert.ok(squeezed[0].clamped, "the minimum ratio had to bite");
    assert.ok(fitPlan([{ start: 0, end: 1 }], [0], 0.5, 2).length === 0, "a one-slot grid fits nothing");
  });

  it("plans the offsets and reports the worst stretch", () => {
    const phrases = [
      { start: 0.175, end: 0.825 },
      { start: 1.175, end: 1.725 },
    ];
    const plan = fitPlan(phrases, beatGridTimes(120, 5), 0.5, 2);
    const offsets = planOffsets(plan);
    assert.ok(Math.abs(offsets[0] + 0.175) < 1e-12 && Math.abs(offsets[1] + 0.675) < 1e-12, `offsets ${offsets}`);
    assert.ok(Math.abs(maxStretchRatio(plan) - 0.5 / 0.55) < 1e-12, `worst ${maxStretchRatio(plan)}`);
    assert.ok(maxStretchRatio([]) === 1, "an empty plan stretches nothing");
  });
});

describe("the full alignment", () => {
  it("aligns the synthesised voice onto a 120 BPM grid", () => {
    const result = alignSpeech(voice(), PARAMS);
    assert.ok(result.ok, result.ok ? "" : result.message);
    const plan = result.value;
    assert.ok(plan.segments.length === 2 && plan.entries.length === 2, "both phrases land on the grid");
    assert.ok(plan.thresholddb > -55 && plan.thresholddb < -47, `threshold ${plan.thresholddb}`);
    assert.ok(Math.abs(plan.entries[0].ratio - 0.5 / 0.65) < 1e-12, `ratio 0 ${plan.entries[0].ratio}`);
    assert.ok(Math.abs(plan.entries[1].ratio - 0.5 / 0.55) < 1e-12, `ratio 1 ${plan.entries[1].ratio}`);
    assert.ok(
      plan.entries.every((e) => !e.clamped),
      "no stretch limit was hit",
    );
    assert.ok(Math.abs(maxStretchRatio(plan.entries) - 0.5 / 0.55) < 1e-12, "the worst stretch is phrase B");
  });

  it("refuses broken input with machine readable codes", () => {
    const defaults = { ...defaultSpeechParams, samplerate: SR, framesize: FRAMESIZE, hop: HOP, bpm: 120, beats: 5 };
    assert.ok(!alignSpeech([], PARAMS).ok && alignSpeech([], PARAMS).code === "empty-signal");
    assert.ok(alignSpeech(voice(), { ...PARAMS, samplerate: 0 }).code === "bad-samplerate");
    assert.ok(alignSpeech(voice(), { ...PARAMS, hop: 0 }).code === "bad-params");
    assert.ok(alignSpeech(voice(), { ...PARAMS, minratio: 2, maxratio: 0.5 }).code === "bad-params");
    assert.ok(alignSpeech(new Array(3000).fill(0), defaults).code === "no-speech", "digital silence has no speech");
    assert.ok(
      alignSpeech(voice(), { ...defaults, minseconds: 5 }).code === "no-speech",
      "over-eager trimming gates everything",
    );
  });
});
