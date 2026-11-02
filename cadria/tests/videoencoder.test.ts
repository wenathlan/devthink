// # videoencoder.test — the encoder facade of the wave-4 doctrine, runnable
// with vitest:
//   pnpm vitest run tests/videoencoder.test.ts
// The battery watches the one promise the facade makes: every format lane
// answers real bytes with real signatures and real digests — the png lane
// opens with the PNG signature, the gif lane with GIF89a, the webm lane
// with the EBML magic; the sha-256 recomputes from the bytes (node:crypto
// itself); the refusals are typed and honest (no lane throws past the
// facade, no mock buffer rides).
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "vitest";
import type { PixelImage } from "../pixel.ts";
import { decodeWebmFrames } from "../webmencoder.ts";
import {
  encodeVideoFrames,
  VIDEO_EXTENSION,
  VIDEO_MIME,
  videoSha256,
  type VideoEncodeFormat,
} from "../videoencoder.ts";

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

describe("the real byte lanes", () => {
  it("answers png bytes that open with the signature", () => {
    const outcome = encodeVideoFrames([frame(12, 9, 0)], { format: "png" });
    assert.equal(outcome.ok, true);
    if (!outcome.ok) return;
    assert.equal(outcome.artifact.format, "png");
    assert.equal(outcome.artifact.mime, "image/png");
    assert.equal(outcome.artifact.frames, 1);
    assert.equal(outcome.artifact.fps, null);
    assert.deepEqual(Array.from(outcome.artifact.bytes.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(outcome.artifact.bytes[outcome.artifact.bytes.length - 1], 0x82); // the IEND CRC tail
  });

  it("answers gif bytes that open with GIF89a and close with the trailer", () => {
    const outcome = encodeVideoFrames([frame(10, 10, 0), frame(10, 10, 1)], { format: "gif", fps: 10 });
    assert.equal(outcome.ok, true);
    if (!outcome.ok) return;
    assert.equal(outcome.artifact.format, "gif");
    assert.equal(outcome.artifact.mime, "image/gif");
    assert.equal(outcome.artifact.frames, 2);
    assert.equal(String.fromCharCode(...outcome.artifact.bytes.subarray(0, 6)), "GIF89a");
    assert.equal(outcome.artifact.bytes[outcome.artifact.bytes.length - 1], 0x3b);
  });

  it("answers webm bytes that open with the EBML magic and demux back", () => {
    const frames = [frame(16, 12, 0), frame(16, 12, 1), frame(16, 12, 2)];
    const outcome = encodeVideoFrames(frames, { format: "webm", fps: 12 });
    assert.equal(outcome.ok, true);
    if (!outcome.ok) return;
    assert.equal(outcome.artifact.format, "webm");
    assert.equal(outcome.artifact.mime, "video/webm");
    assert.equal(outcome.artifact.frames, 3);
    const view = new DataView(
      outcome.artifact.bytes.buffer,
      outcome.artifact.bytes.byteOffset,
      outcome.artifact.bytes.byteLength,
    );
    assert.equal(view.getUint32(0), 0x1a45dfa3);
    // the demux twin answers the same frames back — the bytes are real
    const report = decodeWebmFrames(outcome.artifact.bytes);
    assert.equal(report.frames.length, 3);
    for (let at = 0; at < 3; at += 1) {
      assert.deepEqual(Array.from(report.frames[at].pixels.data), Array.from(frames[at].data));
    }
  });
});

describe("the artifact facts", () => {
  it("carries the real sha-256 of the bytes (node:crypto recomputes it)", () => {
    for (const format of ["png", "webm", "gif"] as VideoEncodeFormat[]) {
      const outcome = encodeVideoFrames([frame(8, 8, 3), frame(8, 8, 4)], {
        format,
        fps: format === "png" ? undefined : 8,
      });
      assert.equal(outcome.ok, true, `${format} must encode`);
      if (!outcome.ok) continue;
      const recomputed = createHash("sha256").update(outcome.artifact.bytes).digest("hex");
      assert.equal(outcome.artifact.sha256, recomputed, `${format} digest must recompute from the bytes`);
      assert.equal(outcome.artifact.byteLength, outcome.artifact.bytes.length);
      assert.match(outcome.artifact.sha256, /^[0-9a-f]{64}$/);
    }
  });

  it("names the mime and the extension of every lane", () => {
    assert.equal(VIDEO_MIME.png, "image/png");
    assert.equal(VIDEO_MIME.webm, "video/webm");
    assert.equal(VIDEO_MIME.gif, "image/gif");
    assert.equal(VIDEO_EXTENSION.png, "png");
    assert.equal(VIDEO_EXTENSION.webm, "webm");
    assert.equal(VIDEO_EXTENSION.gif, "gif");
  });

  it("answers the same artifact for the same request (determinism)", () => {
    const frames = [frame(10, 8, 0), frame(10, 8, 1)];
    const first = encodeVideoFrames(frames, { format: "webm", fps: 5 });
    const second = encodeVideoFrames(frames, { format: "webm", fps: 5 });
    assert.equal(first.ok && second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.equal(first.artifact.sha256, second.artifact.sha256);
    assert.deepEqual(Array.from(first.artifact.bytes), Array.from(second.artifact.bytes));
  });

  it("videoSha256 answers the standard sha-256 vector", () => {
    assert.equal(videoSha256(new Uint8Array(0)), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    assert.equal(
      videoSha256(new TextEncoder().encode("abc")),
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});

describe("the typed refusals", () => {
  it("refuses unknown formats (encode-format)", () => {
    const outcome = encodeVideoFrames([frame(4, 4, 0)], { format: "jpeg" as VideoEncodeFormat });
    assert.deepEqual(outcome, {
      ok: false,
      issue: "encode-format",
      detail: 'unknown format "jpeg" — expected png, webm or gif',
    });
  });

  it("refuses empty frame lists (encode-empty)", () => {
    for (const format of ["png", "webm", "gif"] as VideoEncodeFormat[]) {
      const outcome = encodeVideoFrames([], { format, fps: 10 });
      assert.equal(outcome.ok, false);
      assert.ok(!outcome.ok && outcome.issue === "encode-empty");
    }
  });

  it("refuses damaged frames (encode-bad-frame)", () => {
    const damaged: PixelImage = { width: 2, height: 2, data: new Uint8ClampedArray(5) };
    const outcome = encodeVideoFrames([damaged], { format: "png" });
    assert.ok(!outcome.ok && outcome.issue === "encode-bad-frame");
    const mixed = encodeVideoFrames([frame(4, 4, 0), frame(5, 4, 1)], { format: "webm", fps: 10 });
    assert.ok(!mixed.ok && mixed.issue === "encode-bad-frame");
    assert.match(!mixed.ok ? mixed.detail : "", /frame 1 is 5x4/);
  });

  it("refuses animation lanes without a real fps (encode-bad-fps)", () => {
    for (const fps of [undefined, 0, -3, Number.NaN] as (number | undefined)[]) {
      const webm = encodeVideoFrames([frame(4, 4, 0)], { format: "webm", fps });
      assert.ok(!webm.ok && webm.issue === "encode-bad-fps", `webm fps ${String(fps)} must refuse`);
      const gif = encodeVideoFrames([frame(4, 4, 0)], { format: "gif", fps });
      assert.ok(!gif.ok && gif.issue === "encode-bad-fps", `gif fps ${String(fps)} must refuse`);
    }
    // the png still lane needs no fps
    const still = encodeVideoFrames([frame(4, 4, 0)], { format: "png", fps: undefined });
    assert.equal(still.ok, true);
  });
});
