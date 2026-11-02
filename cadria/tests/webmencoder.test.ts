// # webmencoder.test — the real EBML muxer lane of the encoder doctrine,
// runnable with vitest:
//   pnpm vitest run tests/webmencoder.test.ts
// The battery walks the container the way any EBML reader does: the vint
// vectors (ids keep the marker bit, sizes carry it), the element walk (the
// independent python-grade structural walk the development oracle verified
// against ffprobe), the family probe lane (mediaprobe's probeWebm answers
// the container, the duration, the dimensions and the honest codec row),
// and the demux twin (decodeWebmFrames inflates every SimpleBlock payload
// back to the exact frame bytes, timecodes and keyframe flags included).
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { probeWebm } from "../mediaprobewebm.ts";
import type { PixelImage } from "../pixel.ts";
import {
  CADRIA_CODEC_ID,
  decodeWebmFrames,
  ebmlElement,
  ebmlFloat64,
  ebmlUint,
  ebmlVintId,
  ebmlVintSize,
  encodeWebmFrames,
  EBML_HEADER_ID,
  SEGMENT_ID,
  WebmError,
  type WebmFrameSource,
} from "../webmencoder.ts";

/** a deterministic gradient frame. */
function frame(w: number, h: number, seed: number): PixelImage {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const at = (y * w + x) * 4;
      data[at] = (x * 255) / Math.max(1, w - 1);
      data[at + 1] = (y * 255) / Math.max(1, h - 1);
      data[at + 2] = (x + y + seed * 37) % 256;
      data[at + 3] = 255;
    }
  }
  return { width: w, height: h, data };
}

/** the frame sources of a small stream. */
function sources(count: number, w = 24, h = 16): WebmFrameSource[] {
  return Array.from({ length: count }, (_, at) => ({ pixels: frame(w, h, at) }));
}

describe("the vint lane", () => {
  it("writes id vints with the marker bit riding the id", () => {
    assert.deepEqual(Array.from(ebmlVintId(0x1a45dfa3)), [0x1a, 0x45, 0xdf, 0xa3]);
    assert.deepEqual(Array.from(ebmlVintId(0x18538067)), [0x18, 0x53, 0x80, 0x67]);
    assert.deepEqual(Array.from(ebmlVintId(0xae)), [0xae]);
    assert.deepEqual(Array.from(ebmlVintId(0x1549a966)), [0x15, 0x49, 0xa9, 0x66]);
    assert.deepEqual(Array.from(ebmlVintId(0x2ad7b1)), [0x2a, 0xd7, 0xb1]);
    assert.deepEqual(Array.from(ebmlVintId(0xe7)), [0xe7]);
  });

  it("writes minimal size vints with the marker bit set", () => {
    assert.deepEqual(Array.from(ebmlVintSize(0)), [0x80]);
    assert.deepEqual(Array.from(ebmlVintSize(1)), [0x81]);
    assert.deepEqual(Array.from(ebmlVintSize(126)), [0xfe]);
    assert.deepEqual(Array.from(ebmlVintSize(127)), [0xff]);
    assert.deepEqual(Array.from(ebmlVintSize(128)), [0x40, 0x80]);
    assert.deepEqual(Array.from(ebmlVintSize(16383)), [0x7f, 0xff]);
    assert.deepEqual(Array.from(ebmlVintSize(16384)), [0x20, 0x40, 0x00]);
  });

  it("writes uint and float64 bodies big-endian", () => {
    assert.deepEqual(Array.from(ebmlUint(0)), [0x00]);
    assert.deepEqual(Array.from(ebmlUint(1)), [0x01]);
    assert.deepEqual(Array.from(ebmlUint(300)), [0x01, 0x2c]);
    assert.deepEqual(Array.from(ebmlUint(1_000_000)), [0x0f, 0x42, 0x40]);
    assert.deepEqual(Array.from(ebmlFloat64(1.5)), [0x3f, 0xf8, 0, 0, 0, 0, 0, 0]);
  });

  it("refuses ids, sizes and values out of range", () => {
    assert.throws(() => ebmlVintId(0), WebmError);
    assert.throws(() => ebmlVintId(-1), WebmError);
    assert.throws(() => ebmlVintSize(-1), WebmError);
    assert.throws(() => ebmlUint(-1), WebmError);
    assert.throws(() => ebmlUint(1.5), WebmError);
    assert.throws(() => ebmlFloat64(Number.NaN), WebmError);
  });

  it("seals elements as id vint + size vint + body", () => {
    const element = ebmlElement(0x42f7, ebmlUint(1));
    assert.deepEqual(Array.from(element), [0x42, 0xf7, 0x81, 0x01]);
  });
});

describe("the real muxer", () => {
  it("opens with the EBML header and carries the Segment behind it", () => {
    const bytes = encodeWebmFrames(sources(2), { fps: 24, width: 24, height: 16 });
    assert.deepEqual(Array.from(bytes.subarray(0, 4)), [0x1a, 0x45, 0xdf, 0xa3]);
    // walk the header element: id vint (4 bytes), size vint, then the body
    const first = bytes[4];
    let sizeLength = 1;
    let mask = 0x80;
    while (!(first & mask)) {
      sizeLength += 1;
      mask >>= 1;
    }
    let size = first & (0xff >> sizeLength);
    for (let at = 1; at < sizeLength; at += 1) size = size * 256 + bytes[4 + at];
    const segmentAt = 4 + sizeLength + size;
    assert.deepEqual(
      Array.from(bytes.subarray(segmentAt, segmentAt + 4)),
      [0x18, 0x53, 0x80, 0x67],
      "the Segment id follows the EBML header",
    );
    void SEGMENT_ID;
  });

  it("answers the honest codec row through the family probe lane", () => {
    const bytes = encodeWebmFrames(sources(3), { fps: 24, width: 24, height: 16 });
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const probe = probeWebm(view, bytes.length);
    assert.equal(probe.container, "webm");
    assert.equal(probe.brand, "webm");
    assert.equal(probe.tracks.length, 1);
    assert.equal(probe.tracks[0].kind, "video");
    assert.equal(probe.tracks[0].codec, CADRIA_CODEC_ID);
    assert.equal(probe.tracks[0].width, 24);
    assert.equal(probe.tracks[0].height, 16);
    assert.ok(Math.abs(probe.durationSeconds - 3 / 24) < 1e-9, `duration ${probe.durationSeconds}`);
  });

  it("round trips every frame byte through the demux twin", () => {
    const frames = sources(5, 12, 10);
    const bytes = encodeWebmFrames(frames, { fps: 25, width: 12, height: 10 });
    const report = decodeWebmFrames(bytes);
    assert.equal(report.codecId, CADRIA_CODEC_ID);
    assert.equal(report.width, 12);
    assert.equal(report.height, 10);
    assert.equal(report.frames.length, 5);
    assert.ok(Math.abs(report.durationSeconds - 0.2) < 1e-9);
    for (let at = 0; at < 5; at += 1) {
      assert.equal(report.frames[at].pixels.width, 12);
      assert.equal(report.frames[at].pixels.height, 10);
      assert.deepEqual(
        Array.from(report.frames[at].pixels.data),
        Array.from(frames[at].pixels.data),
        `frame ${at} must round trip byte-exact`,
      );
    }
  });

  it("carries the presentation timecodes on the frame grid", () => {
    const frames = sources(4, 8, 8);
    const bytes = encodeWebmFrames(frames, { fps: 40, width: 8, height: 8 });
    const report = decodeWebmFrames(bytes);
    assert.deepEqual(
      report.frames.map((entry) => entry.timestampMs),
      [0, 25, 50, 75],
    );
  });

  it("flags the head of every cluster as the keyframe", () => {
    const frames = sources(6, 8, 8);
    const bytes = encodeWebmFrames(frames, { fps: 24, width: 8, height: 8, clusterFrames: 2 });
    const report = decodeWebmFrames(bytes);
    assert.deepEqual(
      report.frames.map((entry) => entry.keyframe),
      [true, false, true, false, true, false],
    );
  });

  it("honors an explicit keyframe flag over the cluster-head default", () => {
    const frames = sources(2, 8, 8).map((source, at) => ({ ...source, keyframe: at === 1 }));
    const bytes = encodeWebmFrames(frames, { fps: 24, width: 8, height: 8, clusterFrames: 8 });
    const report = decodeWebmFrames(bytes);
    // the explicit flag wins: frame 0 says false (not the cluster-head default true)
    assert.deepEqual(
      report.frames.map((entry) => entry.keyframe),
      [false, true],
    );
  });

  it("deflates the payloads (the cadria lossless lane earns its bytes)", () => {
    const frames = sources(4, 32, 32);
    const bytes = encodeWebmFrames(frames, { fps: 24, width: 32, height: 32 });
    assert.ok(bytes.length < 4 * 32 * 32 * 4, `deflated stream must stay small, got ${bytes.length}`);
  });

  it("answers the same bytes for the same frames (determinism)", () => {
    const frames = sources(3, 8, 8);
    const options = { fps: 24, width: 8, height: 8 };
    assert.deepEqual(Array.from(encodeWebmFrames(frames, options)), Array.from(encodeWebmFrames(frames, options)));
  });

  it("refuses empty streams, bad dimensions, bad fps and mismatched frames", () => {
    assert.throws(() => encodeWebmFrames([], { fps: 24, width: 8, height: 8 }), WebmError);
    assert.throws(() => encodeWebmFrames(sources(1), { fps: 24, width: 0, height: 8 }), WebmError);
    assert.throws(() => encodeWebmFrames(sources(1), { fps: 0, width: 8, height: 8 }), WebmError);
    const mixed = [{ pixels: frame(8, 8, 0) }, { pixels: frame(9, 9, 1) }];
    assert.throws(() => encodeWebmFrames(mixed, { fps: 24, width: 8, height: 8 }), WebmError);
    const damaged = [{ pixels: { width: 8, height: 8, data: new Uint8ClampedArray(9) } }];
    assert.throws(() => encodeWebmFrames(damaged, { fps: 24, width: 8, height: 8 }), WebmError);
  });
});

describe("the demux twin", () => {
  it("refuses damaged streams honestly", () => {
    assert.throws(() => decodeWebmFrames(new Uint8Array(2)), WebmError);
    assert.throws(() => decodeWebmFrames(new Uint8Array([0x1e, 0xe0, 0xff])), WebmError);
    // a valid container with a damaged payload inflates to a refusal, not a fake frame
    const bytes = encodeWebmFrames(sources(1, 8, 8), { fps: 24, width: 8, height: 8 });
    const damaged = new Uint8Array(bytes);
    damaged[damaged.length - 1] ^= 0xff;
    assert.throws(() => decodeWebmFrames(damaged), WebmError);
  });

  it("answers the EBML header id constant the stream opens with", () => {
    const bytes = encodeWebmFrames(sources(1, 8, 8), { fps: 24, width: 8, height: 8 });
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    assert.equal(view.getUint32(0), EBML_HEADER_ID >>> 0);
  });
});
