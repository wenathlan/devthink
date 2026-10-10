// # transcodeplan.test — honest unit tests for the transcode planner, runnable with
// the node built-in runner (no install, no dependencies):
//   node --test tests/transcodeplan.test.ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildTranscodePlan,
  estimateVariantBytes,
  evenDimension,
  parseBitrate,
  type SourceMedia,
  TranscodeError,
  type TranscodeRung,
  validateRung,
} from "../transcodeplan.ts";

/** The probed source the plan tests build from (the mediaprobe.ts shape). */
const SOURCE: SourceMedia = {
  width: 1920,
  height: 1080,
  durationSeconds: 60,
  fps: 30,
  videoCodec: "avc1",
  audioCodec: "mp4a",
};

/** A mixed ladder: one too tall for the source, one vp9 webm rung, an fps cap. */
const LADDER: TranscodeRung[] = [
  { id: "2160p", height: 2160, videoCodec: "avc1", audioCodec: "mp4a", videoBitrate: "16M", audioBitrate: "192K" },
  { id: "1080p", height: 1080, videoCodec: "avc1", audioCodec: "mp4a", videoBitrate: "4M", audioBitrate: "128K" },
  {
    id: "720p",
    height: 720,
    videoCodec: "avc1",
    audioCodec: "mp4a",
    videoBitrate: "2500K",
    audioBitrate: "96K",
    fps: 24,
  },
  { id: "480p", height: 480, videoCodec: "vp09", audioCodec: "opus", videoBitrate: "1M", audioBitrate: "64K" },
];

describe("transcodeplan bitrates", () => {
  it("parses the renderer spellings into bps", () => {
    assert.equal(parseBitrate("4M"), 4_000_000);
    assert.equal(parseBitrate("2500K"), 2_500_000);
    assert.equal(parseBitrate("800k"), 800_000);
  });

  it("rejects bare numbers, missing suffixes and junk", () => {
    assert.throws(() => parseBitrate(4_000_000 as unknown as string), TranscodeError);
    assert.throws(() => parseBitrate("4000000"), TranscodeError);
    assert.throws(() => parseBitrate("4G"), TranscodeError);
    assert.throws(() => parseBitrate("0M"), TranscodeError);
  });

  it("floors dimensions onto even values the MPEG encoders demand", () => {
    assert.equal(evenDimension(853.33), 852);
    assert.equal(evenDimension(1920), 1920);
    assert.equal(evenDimension(1), 2);
  });
});

describe("transcodeplan validation", () => {
  it("names the failing rung in every thrown error", () => {
    assert.throws(
      () => validateRung({ ...LADDER[1], height: 0 }),
      (error: unknown) => error instanceof TranscodeError && error.message.includes('"1080p"'),
    );
    assert.throws(
      () => validateRung({ ...LADDER[1], videoBitrate: "4" }),
      (error: unknown) => error instanceof TranscodeError && error.message.includes('"1080p"'),
    );
    assert.throws(
      () => validateRung({ ...LADDER[1], fps: -1 }),
      (error: unknown) => error instanceof TranscodeError && error.message.includes('"1080p"'),
    );
    assert.throws(
      () => validateRung({ ...LADDER[1], videoCodec: "not a codec" }),
      (error: unknown) => error instanceof TranscodeError && error.message.includes('"1080p"'),
    );
  });

  it("rejects broken sources and ladders before any variant is built", () => {
    assert.throws(() => buildTranscodePlan({ ...SOURCE, height: 0 }, LADDER), TranscodeError);
    assert.throws(() => buildTranscodePlan({ ...SOURCE, durationSeconds: 0 }, LADDER), TranscodeError);
    assert.throws(() => buildTranscodePlan(SOURCE, []), TranscodeError);
    assert.throws(() => buildTranscodePlan(SOURCE, [LADDER[1], { ...LADDER[1], height: 540 }]), TranscodeError);
  });

  it("answers the size estimate from the bitrates and the duration", () => {
    assert.equal(estimateVariantBytes("4M", "128K", 60), 30_960_000);
    assert.equal(estimateVariantBytes("1M", "64K", 10), 1_330_000);
  });
});

describe("transcodeplan planner", () => {
  it("builds the runnable variants: never upscales, orders highest-first", () => {
    const plan = buildTranscodePlan(SOURCE, LADDER);
    assert.deepEqual(
      plan.variants.map((variant) => variant.rung.id),
      ["1080p", "720p", "480p"],
    );
    assert.equal(plan.variants.length, 3);
  });

  it("keeps the aspect, even dimensions and the codec-native container", () => {
    const plan = buildTranscodePlan(SOURCE, LADDER);
    const [top, , low] = plan.variants;
    assert.equal(top.width, 1920);
    assert.equal(top.height, 1080);
    assert.equal(top.container, "mp4");
    assert.equal(low.width, 852, "1920×480/1080 floors onto the even 852");
    assert.equal(low.height, 480);
    assert.equal(low.container, "webm", "vp09 defaults to webm");
  });

  it("caps the fps by the rung and clamps by the source fps", () => {
    const plan = buildTranscodePlan(SOURCE, LADDER);
    assert.equal(plan.variants[0].fps, 30);
    assert.equal(plan.variants[1].fps, 24);
  });

  it("estimates the bytes per variant and the plan total", () => {
    const plan = buildTranscodePlan(SOURCE, LADDER);
    assert.equal(plan.variants[0].estimatedBytes, 30_960_000);
    assert.equal(
      plan.estimatedBytes,
      plan.variants.reduce((sum, variant) => sum + variant.estimatedBytes, 0),
    );
  });

  it("keeps the top of the ladder under maxRungs", () => {
    const plan = buildTranscodePlan(SOURCE, LADDER, { maxRungs: 2 });
    assert.deepEqual(
      plan.variants.map((variant) => variant.rung.id),
      ["1080p", "720p"],
    );
  });

  it("throws a traceable error when no rung fits the source", () => {
    assert.throws(
      () => buildTranscodePlan({ ...SOURCE, height: 360 }, [LADDER[0], LADDER[1]]),
      (error: unknown) => error instanceof TranscodeError && error.message.includes("no rung fits"),
    );
  });
});
