// # wavwriter.test — the wav encoder contract: the magic bytes and the chunk
// sizes the format pins, the round trip wavInfo proves from the bytes alone,
// the clamp (and the anti-NaN law) that keeps the bus inside full scale, the
// float32 marker, the mono/stereo interleave, the 24-bit byte order and the
// hard failures the export seam must see with their machine codes.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { EXPORT_SIZE_LIMIT_BYTES, encodeWav, validateEncoding, WAV_FORMAT, WavError, wavInfo } from "../debonair/wavwriter.ts";

/** Reads a little-endian u16 out of the bytes. */
const u16le = (bytes: Uint8Array, offset: number): number => bytes[offset] | (bytes[offset + 1] << 8);

/** Reads a little-endian u32 out of the bytes. */
const u32le = (bytes: Uint8Array, offset: number): number =>
  (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;

describe("wavwriter — encodeWav", () => {
  const mono = new Float32Array([0, 0.25, -0.5, 1]);
  const bytes = encodeWav([mono], { sampleRate: 48000, bitDepth: 16 });

  it("opens with the riff/wave magic", () => {
    assert.equal(String.fromCharCode(...bytes.subarray(0, 4)), "RIFF");
    assert.equal(String.fromCharCode(...bytes.subarray(8, 12)), "WAVE");
  });

  it("lays the chunks at the documented offsets with exact sizes", () => {
    assert.equal(String.fromCharCode(...bytes.subarray(12, 16)), "fmt ");
    assert.equal(u32le(bytes, 16), 16); // the pcm fmt content is exactly 16 bytes
    assert.equal(String.fromCharCode(...bytes.subarray(36, 40)), "data");
    assert.equal(u32le(bytes, 40), 8); // 4 frames x 1 channel x 2 bytes
    assert.equal(u32le(bytes, 4), bytes.length - 8); // the riff size is everything after the field
    assert.equal(bytes.length, 44 + 8); // the classic 44 byte header
    assert.equal(u32le(bytes, 28), 48000 * 1 * 2); // the byte rate agrees
  });

  it("round trips through wavInfo with the exact duration", () => {
    const info = wavInfo(bytes);
    assert.equal(info.sampleRate, 48000);
    assert.equal(info.channels, 1);
    assert.equal(info.bitDepth, 16);
    assert.equal(info.frames, 4);
    assert.equal(info.durationSeconds, 4 / 48000);
    assert.equal(info.isFloat, false);
  });

  it("clamps the bus into full scale and never writes a NaN word", () => {
    const loud = encodeWav([new Float32Array([1.5, -1.5, Number.NaN])], { sampleRate: 8000, bitDepth: 16 });
    const view = new DataView(loud.buffer, loud.byteOffset + 44, 6);
    assert.equal(view.getInt16(0, true), 32767);
    assert.equal(view.getInt16(2, true), -32767);
    assert.equal(view.getInt16(4, true), 0);
    assert.equal(wavInfo(loud).sampleRate, 8000);
  });

  it("marks the float32 format with code 3 and the 18 byte fmt chunk", () => {
    const floats = encodeWav([mono], { sampleRate: 48000, bitDepth: 32 });
    assert.equal(u32le(floats, 16), 18);
    assert.equal(u16le(floats, 20), 3);
    assert.equal(u16le(floats, 36), 0); // cbSize = 0 closes the float fmt chunk
    const info = wavInfo(floats);
    assert.equal(info.isFloat, true);
    assert.equal(info.bitDepth, 32);
    assert.equal(String.fromCharCode(...floats.subarray(38, 42)), "data");
  });

  it("interleaves stereo frame by frame", () => {
    const left = new Float32Array([1, 0.5]);
    const right = new Float32Array([-1, 0]);
    const stereo = encodeWav([left, right], { sampleRate: 48000, bitDepth: 16 });
    const view = new DataView(stereo.buffer, stereo.byteOffset + 44, 8);
    assert.equal(wavInfo(stereo).channels, 2);
    assert.equal(view.getInt16(0, true), 32767); // left first
    assert.equal(view.getInt16(2, true), -32767); // right second
    assert.equal(view.getInt16(4, true), 16384);
    assert.equal(view.getInt16(6, true), 0);
  });

  it("writes pcm24 across three little-endian bytes", () => {
    const full = encodeWav([new Float32Array([1])], { sampleRate: 48000, bitDepth: 24 });
    assert.equal(full[44], 0xff);
    assert.equal(full[45], 0xff);
    assert.equal(full[46], 0x7f);
    assert.equal(wavInfo(full).bitDepth, 24);
    assert.equal(u32le(full, 40), 3);
  });

  it("is deterministic for the same bus", () => {
    assert.deepEqual(encodeWav([mono], { sampleRate: 48000, bitDepth: 16 }), bytes);
  });
});

describe("wavwriter — failures", () => {
  it("refuses rates outside 8000..192000", () => {
    assert.throws(
      () => encodeWav([new Float32Array(4)], { sampleRate: 7999, bitDepth: 16 }),
      (error: unknown) => error instanceof WavError && error.code === "bad-rate",
    );
    assert.throws(
      () => encodeWav([new Float32Array(4)], { sampleRate: 192001, bitDepth: 16 }),
      (error: unknown) => error instanceof WavError && error.code === "bad-rate",
    );
  });

  it("refuses broken magic and a truncated data chunk in wavInfo", () => {
    assert.throws(
      () => wavInfo(new Uint8Array(64)),
      (error: unknown) => error instanceof WavError && error.code === "bad-magic",
    );
    const bytes = encodeWav([new Float32Array(4)], { sampleRate: 48000, bitDepth: 16 });
    assert.throws(
      () => wavInfo(bytes.subarray(0, 44)), // the data header survives, the payload does not
      (error: unknown) => error instanceof WavError && error.code === "bad-truncation",
    );
  });

  it("answers the validateEncoding invariants with machine codes", () => {
    assert.deepEqual(validateEncoding([new Float32Array(4)], { sampleRate: 48000, bitDepth: 16 }), []);
    assert.equal(validateEncoding([new Float32Array(4)], { sampleRate: 1000, bitDepth: 16 })[0].code, "bad-rate");
    assert.equal(validateEncoding([], { sampleRate: 48000, bitDepth: 16 })[0].code, "bad-channels");
    assert.equal(
      validateEncoding([new Float32Array(4), new Float32Array(5)], { sampleRate: 48000, bitDepth: 16 })[0].code,
      "bad-shape",
    );
  });

  it("flags a bounce past the 50 MB export cap before any bytes exist", () => {
    const huge = [
      new Float32Array(3400000),
      new Float32Array(3400000),
      new Float32Array(3400000),
      new Float32Array(3400000),
    ];
    assert.equal(validateEncoding(huge, { sampleRate: 48000, bitDepth: 32 })[0].code, "oversize");
    assert.equal(EXPORT_SIZE_LIMIT_BYTES, 52428800);
    assert.equal(WAV_FORMAT.pcm24.bytesPerSample, 3);
  });
});
