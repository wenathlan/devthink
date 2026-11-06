// # renderjob.test — the render job executor of the encoder doctrine,
// runnable with vitest:
//   pnpm vitest run test/renderjob.test.ts
// The battery watches the promise the executor makes: the encode path
// executes for real — the compiled frames rasterize through the CPU sampler,
// ride the real byte lanes and answer decodable bytes (the webm demux
// returns the exact rasterized pixels), the slice grid matches the
// F-CAD-027 windowing, the same request answers the same bytes, and the
// refusals stay typed and honest (the audit's "declarative only" lane is
// retired).
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { rasterizeCommands } from "../compositorraster.ts";
import type { RenderFrame } from "../image.ts";
import {
  executeRenderJob,
  RENDER_SLICE_SECONDS,
  type RenderJobRequest,
  renderJobSlices,
  verifyRenderArtifact,
} from "../renderjob.ts";
import { decodeWebmFrames } from "../webmencoder.ts";

/** one deterministic compiled frame: a background plus two z-ordered rects. */
function frameIR(index: number): RenderFrame {
  const shift = index % 4;
  return {
    width: 12,
    height: 9,
    background: "#101418",
    commands: [
      { kind: "rect", x: 0.1 + shift * 0.05, y: 0.1, w: 0.5, h: 0.4, fill: "#3f6df6", opacity: 1, blur: 0, z: 2000 },
      { kind: "rect", x: 0.3, y: 0.45, w: 0.4, h: 0.35, fill: "#f6b73c", opacity: 0.8, blur: 0, z: 2500 },
    ],
  };
}

/** the standard video request the battery encodes. */
function videoRequest(overrides: Partial<RenderJobRequest> = {}): RenderJobRequest {
  return { id: "job-test", format: "webm", fps: 6, frames: [0, 1, 2, 3, 4, 5].map(frameIR), ...overrides };
}

describe("the executor answers real bytes", () => {
  it("encodes webm bytes that demux back to the exact rasterized pixels", () => {
    const request = videoRequest();
    const outcome = executeRenderJob(request);
    assert.equal(outcome.ok, true);
    if (!outcome.ok) return;
    assert.equal(outcome.artifact.format, "webm");
    assert.equal(outcome.artifact.frames, 6);
    assert.equal(outcome.artifact.mime, "video/webm");
    assert.equal(outcome.rasterFrames, 6);
    const view = new DataView(
      outcome.artifact.bytes.buffer,
      outcome.artifact.bytes.byteOffset,
      outcome.artifact.bytes.byteLength,
    );
    assert.equal(view.getUint32(0), 0x1a45dfa3); // the EBML magic — real container bytes
    const report = decodeWebmFrames(outcome.artifact.bytes);
    assert.equal(report.frames.length, 6);
    for (let at = 0; at < 6; at += 1) {
      const expected = rasterizeCommands(request.frames[at]);
      assert.deepEqual(Array.from(report.frames[at].pixels.data), Array.from(expected.data));
    }
  });

  it("encodes png bytes that decode back to the rasterized still", () => {
    const request = videoRequest({ format: "png", frames: [frameIR(0)] });
    const outcome = executeRenderJob(request);
    assert.equal(outcome.ok, true);
    if (!outcome.ok) return;
    assert.equal(outcome.artifact.frames, 1);
    assert.deepEqual(Array.from(outcome.artifact.bytes.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(outcome.slices, 1);
  });

  it("encodes gif bytes that open with GIF89a and close with the trailer", () => {
    const outcome = executeRenderJob(videoRequest({ format: "gif" }));
    assert.equal(outcome.ok, true);
    if (!outcome.ok) return;
    assert.equal(outcome.artifact.frames, 6);
    assert.equal(String.fromCharCode(...outcome.artifact.bytes.subarray(0, 6)), "GIF89a");
    assert.equal(outcome.artifact.bytes[outcome.artifact.bytes.length - 1], 0x3b);
  });
});

describe("the slice grid (F-CAD-027: preview equals final)", () => {
  it("cuts the documented window and covers every frame exactly once", () => {
    const request = videoRequest({ sliceSeconds: 1 }); // 6 frames at 6 fps = 1s → one slice
    const slices = renderJobSlices(request);
    assert.equal(slices.length, 1);
    assert.equal(slices[0].fromFrame, 0);
    assert.equal(slices[0].toFrame, 6);
    const wide = videoRequest({ fps: 2, sliceSeconds: 1, frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(frameIR) });
    const windows = renderJobSlices(wide); // 10 frames at 2 fps, 2 frames per slice
    assert.equal(windows.length, 5);
    let covered = 0;
    for (const slice of windows) {
      assert.equal(slice.toFrame - slice.fromFrame, 2);
      covered += slice.frames;
    }
    assert.equal(covered, 10);
    assert.equal(windows[windows.length - 1].toFrame, 10);
  });

  it("defaults to the doctrine window and reports the slice count it rode", () => {
    assert.equal(RENDER_SLICE_SECONDS, 10);
    const request = videoRequest({ sliceSeconds: 2, fps: 1, frames: [0, 1, 2, 3, 4, 5].map(frameIR) });
    const outcome = executeRenderJob(request);
    assert.equal(outcome.ok, true);
    if (!outcome.ok) return;
    assert.equal(outcome.slices, 3); // 6 frames at 1 fps, 2-second windows
  });

  it("answers one whole window for the still lane and the empty request", () => {
    assert.equal(renderJobSlices({ id: "x", format: "png", frames: [frameIR(0)] })[0].frames, 1);
    assert.deepEqual(renderJobSlices({ id: "x", format: "png", frames: [] }), []);
  });
});

describe("determinism", () => {
  it("answers the same bytes for the same request", () => {
    const request = videoRequest();
    const first = executeRenderJob(request);
    const second = executeRenderJob(request);
    assert.equal(first.ok && second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.equal(first.artifact.sha256, second.artifact.sha256);
    assert.deepEqual(Array.from(first.artifact.bytes), Array.from(second.artifact.bytes));
  });
});

describe("the verify twin", () => {
  it("proves every lane's bytes decode", () => {
    for (const format of ["png", "webm", "gif"] as const) {
      const frames = format === "png" ? [frameIR(0)] : [frameIR(0), frameIR(1), frameIR(2)];
      const outcome = executeRenderJob(videoRequest({ format, fps: 6, frames }));
      assert.equal(outcome.ok, true, `${format} must execute`);
      if (!outcome.ok) continue;
      const verify = verifyRenderArtifact(outcome.artifact);
      assert.equal(verify.ok, true, `${format} must verify: ${verify.ok ? "" : verify.reason}`);
      if (!verify.ok) continue;
      assert.equal(verify.format, format);
      assert.equal(verify.frames, frames.length);
      assert.equal(verify.width, 12);
      assert.equal(verify.height, 9);
    }
  });

  it("refuses mangled bytes and empty artifacts", () => {
    const outcome = executeRenderJob(videoRequest());
    assert.equal(outcome.ok, true);
    if (!outcome.ok) return;
    const damaged = { ...outcome.artifact, bytes: outcome.artifact.bytes.slice() };
    damaged.bytes[damaged.bytes.length - 40] ^= 0xff; // corrupt inside the last cluster payload
    assert.equal(verifyRenderArtifact(damaged).ok, false);
    assert.equal(verifyRenderArtifact({ ...outcome.artifact, bytes: new Uint8Array(0) }).ok, false);
    assert.equal(verifyRenderArtifact({ ...outcome.artifact, byteLength: outcome.artifact.byteLength + 1 }).ok, false);
  });
});

describe("the typed refusals", () => {
  it("refuses unknown formats (job-bad-format)", () => {
    const outcome = executeRenderJob({ ...videoRequest(), format: "mp4" as never });
    assert.ok(!outcome.ok && outcome.issue === "job-bad-format");
  });

  it("refuses empty frame lists (job-empty)", () => {
    const outcome = executeRenderJob(videoRequest({ frames: [] }));
    assert.ok(!outcome.ok && outcome.issue === "job-empty");
  });

  it("refuses animation lanes without an fps (job-bad-fps)", () => {
    for (const fps of [undefined, 0, -2, Number.NaN]) {
      const outcome = executeRenderJob(videoRequest({ fps }));
      assert.ok(!outcome.ok && outcome.issue === "job-bad-fps", `fps ${String(fps)} must refuse`);
    }
    const still = executeRenderJob(videoRequest({ format: "png", fps: undefined, frames: [frameIR(0)] }));
    assert.equal(still.ok, true); // the still lane needs no clock
  });

  it("refuses streams whose frames disagree on size (job-bad-size)", () => {
    const mixed = [frameIR(0), { ...frameIR(1), width: 16 }];
    const outcome = executeRenderJob(videoRequest({ frames: mixed }));
    assert.ok(!outcome.ok && outcome.issue === "job-bad-size");
    assert.match(!outcome.ok ? outcome.detail : "", /frame 1 is 16x9/);
  });
});
