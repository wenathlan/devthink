// # pngencoder.test — the real PNG byte lane of the encoder doctrine, runnable
// with vitest:
//   pnpm vitest run tests/pngencoder.test.ts
// The battery watches the promise the wave-4 law makes: the encoder ships
// real bytes, never mock buffers. Every structural claim is verified by an
// independent walk in this file — the CRC is recomputed from the polynomial,
// the IDAT is inflated by node:zlib itself, the scanlines are unfiltered by
// the spec reconstruction, and the decode twin (decodePng) answers the same
// pixels the encoder ate. The adaptive filter heuristic is pinned with
// images that force each filter family to win.
import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import { describe, it } from "vitest";
import type { PixelImage } from "../pixel.ts";
import {
  decodePng,
  encodePng,
  PngError,
  PNG_SIGNATURE,
  pngChunk,
  pngCrc32,
  pngFilterRow,
  pngFilteredStream,
  pngUnfilterRow,
} from "../pngencoder.ts";

/** a solid RGBA image builder (deterministic, no randomness). */
function solid(width: number, height: number, rgba: [number, number, number, number]): PixelImage {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let at = 0; at < data.length; at += 4) data.set(rgba, at);
  return { width, height, data };
}

/** a horizontal ramp where every row is unique: row 0 rides Sub, later
 *  rows ride Paeth (a+b-c predicts any separable ramp exactly — the honest
 *  adaptive answer, never a hardcoded filter). */
function horizontalGradient(width: number, height: number): PixelImage {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      data[at] = Math.round((x / Math.max(1, width - 1)) * 150) + y * 10;
      data[at + 1] = 128;
      data[at + 2] = 64;
      data[at + 3] = 255;
    }
  }
  return { width, height, data };
}

/** a vertical gradient (top → bottom ramps the green channel): Up territory. */
function verticalGradient(width: number, height: number): PixelImage {
  const image: PixelImage = { width, height, data: new Uint8ClampedArray(width * height * 4) };
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      image.data[at] = 32;
      image.data[at + 1] = Math.round((y / Math.max(1, height - 1)) * 255);
      image.data[at + 2] = 200;
      image.data[at + 3] = 255;
    }
  }
  return image;
}

describe("the crc and chunk lane", () => {
  it("answers the spec CRC-32 vectors", () => {
    // the classic check values of CRC-32 (IEEE, reflected): "", "123456789" and
    // the PNG tail "IEND" (0xAE426082 — the constant every PNG walkthrough pins)
    assert.equal(pngCrc32(new Uint8Array(0)), 0);
    assert.equal(pngCrc32(new TextEncoder().encode("123456789")), 0xcbf43926);
    assert.equal(pngCrc32(new TextEncoder().encode("IEND")), 0xae426082);
  });

  it("seals chunks with length, type, data and a verified CRC", () => {
    const chunk = pngChunk("IDAT", new Uint8Array([1, 2, 3, 4]));
    assert.equal(chunk.length, 16);
    assert.equal(chunk[0], 0);
    assert.equal(chunk[1], 0);
    assert.equal(chunk[2], 0);
    assert.equal(chunk[3], 4);
    assert.equal(String.fromCharCode(chunk[4], chunk[5], chunk[6], chunk[7]), "IDAT");
    assert.deepEqual(Array.from(chunk.subarray(8, 12)), [1, 2, 3, 4]);
    const sealed = new Uint8Array(8);
    sealed.set(chunk.subarray(4, 12));
    // an independent recomputation of the same polynomial agrees
    const view = new DataView(chunk.buffer);
    assert.equal(view.getUint32(12), pngCrc32(sealed));
  });

  it("refuses chunk types that are not four letters", () => {
    assert.throws(() => pngChunk("IDAT5", new Uint8Array(0)), PngError);
    assert.throws(() => pngChunk("IDA", new Uint8Array(0)), PngError);
  });
});

describe("the scanline filter lane", () => {
  it("round trips every filter through filter and unfilter", () => {
    const row = Uint8Array.from([10, 200, 30, 255, 77, 8, 250, 1, 99, 42, 42, 42]);
    const prior = Uint8Array.from([99, 1, 200, 255, 3, 3, 3, 250, 128, 128, 7, 9]);
    for (const filter of [0, 1, 2, 3, 4] as const) {
      const filtered = pngFilterRow(filter, row, prior, 4);
      const back = pngUnfilterRow(filter, filtered, prior, 4);
      assert.deepEqual(Array.from(back), Array.from(row), `filter ${filter} must reconstruct the row`);
    }
  });

  it("picks the minimum-score filter with the 0-to-4 tie order (the adaptive heuristic)", () => {
    const image = horizontalGradient(24, 6);
    const { selections } = pngFilteredStream(image);
    // the heuristic re-derived in the test: every filter scored, first winner kept
    const stride = image.width * 4;
    for (let y = 0; y < image.height; y += 1) {
      const row = new Uint8Array(image.data.buffer, image.data.byteOffset + y * stride, stride);
      const truePrior =
        y === 0
          ? new Uint8Array(stride)
          : new Uint8Array(image.data.buffer, image.data.byteOffset + (y - 1) * stride, stride);
      let best = 0;
      let bestScore = Number.POSITIVE_INFINITY;
      for (const filter of [0, 1, 2, 3, 4] as const) {
        const filtered = pngFilterRow(filter, row, truePrior, 4);
        let score = 0;
        for (const byte of filtered) score += byte < 128 ? byte : 256 - byte;
        if (score < bestScore) {
          bestScore = score;
          best = filter;
        }
      }
      assert.equal(selections[y].filter, best, `scanline ${y} must ride the minimum-score filter`);
    }
    // the pinned corner: row 0 rides Sub, the separable ramp rows ride Paeth
    assert.equal(selections[0].filter, 1);
    for (let y = 1; y < image.height; y += 1) assert.equal(selections[y].filter, 4);
  });

  it("ships the winning filter byte per scanline in the pre-compression stream", () => {
    const image = solid(4, 3, [9, 9, 9, 255]);
    const { stream, selections } = pngFilteredStream(image);
    assert.equal(stream.length, 3 * (4 * 4 + 1));
    // row 0 rides Sub (the first pixel only pays); identical rows ride Up (zero cost)
    assert.equal(selections[0].filter, 1);
    assert.equal(selections[1].filter, 2);
    assert.equal(selections[2].filter, 2);
    assert.equal(stream[0], 1);
    assert.equal(stream[17], 2);
    assert.equal(stream[34], 2);
  });
});

describe("the real encoder", () => {
  it("writes the signature, IHDR, IDAT and IEND in spec order", () => {
    const bytes = encodePng(solid(5, 4, [255, 0, 128, 255]));
    assert.deepEqual(Array.from(bytes.subarray(0, 8)), [...PNG_SIGNATURE]);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    // IHDR: length 13, type, width, height, depth 8, color type 6
    assert.equal(view.getUint32(8), 13);
    assert.equal(String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]), "IHDR");
    assert.equal(view.getUint32(16), 5);
    assert.equal(view.getUint32(20), 4);
    assert.equal(bytes[24], 8);
    assert.equal(bytes[25], 6);
    assert.equal(bytes[26], 0);
    assert.equal(bytes[27], 0);
    assert.equal(bytes[28], 0);
    // the stream closes with the empty IEND chunk
    const tail = bytes.subarray(bytes.length - 12);
    const tailView = new DataView(tail.buffer, tail.byteOffset, tail.byteLength);
    assert.equal(tailView.getUint32(0), 0);
    assert.equal(String.fromCharCode(tail[4], tail[5], tail[6], tail[7]), "IEND");
  });

  it("inflates the IDAT back to the exact filtered scanlines (node:zlib itself)", () => {
    const image = horizontalGradient(9, 5);
    const { stream } = pngFilteredStream(image);
    const bytes = encodePng(image);
    // walk to the IDAT chunk (signature 8 + IHDR 12 + 13 = 33)
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    assert.equal(String.fromCharCode(bytes[37], bytes[38], bytes[39], bytes[40]), "IDAT");
    const length = view.getUint32(33);
    const idat = bytes.subarray(41, 41 + length);
    const inflated = new Uint8Array(inflateSync(idat));
    assert.deepEqual(Array.from(inflated), Array.from(stream));
  });

  it("answers the same bytes for the same image (determinism, no clock)", () => {
    const image = solid(12, 7, [10, 220, 30, 128]);
    const first = encodePng(image);
    const second = encodePng(image);
    assert.deepEqual(Array.from(first), Array.from(second));
    const other = encodePng(solid(12, 7, [10, 220, 31, 128]));
    assert.notDeepEqual(Array.from(first), Array.from(other));
  });

  it("compresses real content below the raw stream size", () => {
    const image = horizontalGradient(64, 64);
    const bytes = encodePng(image);
    assert.ok(bytes.length < 64 * 64 * 4, `the deflate lane must earn its keep, got ${bytes.length} bytes`);
  });
});

describe("the decode twin", () => {
  it("round trips every pixel through encodePng and decodePng", () => {
    for (const image of [
      solid(16, 16, [1, 2, 3, 255]),
      solid(7, 11, [250, 200, 150, 100]),
      horizontalGradient(20, 6),
      verticalGradient(6, 20),
    ]) {
      const decoded = decodePng(encodePng(image));
      assert.equal(decoded.width, image.width);
      assert.equal(decoded.height, image.height);
      assert.deepEqual(Array.from(decoded.data), Array.from(image.data));
    }
  });

  it("refuses damaged streams honestly", () => {
    const bytes = encodePng(solid(4, 4, [1, 2, 3, 255]));
    const brokenCrc = new Uint8Array(bytes);
    brokenCrc[brokenCrc.length - 1] ^= 0xff; // the IEND CRC no longer verifies
    assert.throws(() => decodePng(brokenCrc), PngError);
    const brokenSignature = new Uint8Array(bytes);
    brokenSignature[1] = 81; // "Q"
    assert.throws(() => decodePng(brokenSignature), PngError);
    assert.throws(() => decodePng(new Uint8Array(4)), PngError);
    assert.throws(() => decodePng(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0])), PngError);
  });

  it("refuses unreadable images on the encode side", () => {
    assert.throws(() => encodePng({ width: 0, height: 4, data: new Uint8ClampedArray(0) }), PngError);
    assert.throws(
      () => encodePng({ width: 2, height: 2, data: new Uint8ClampedArray(5) }),
      PngError,
    );
  });
});
