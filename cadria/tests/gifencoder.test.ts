// # gifencoder.test — the real GIF89a byte lane of the encoder doctrine,
// runnable with vitest:
//   pnpm vitest run tests/gifencoder.test.ts
// The battery walks the stream the way an independent viewer would: the
// header, the logical screen descriptor, the global color table, the
// NETSCAPE2.0 loop block, the per-frame graphic control extension and image
// descriptor, then the LZW data sub-blocks — decoded here by a matched
// decoder written from the format's own reconstruction rules (the same pair
// the development oracle verified against PIL, the independent decoder).
// The palette lane is pinned by the lossless corner (fewer distinct colors
// than the budget answer the exact colors) and the median cut (a two-color
// cast answers its own two colors).
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { PixelImage } from "../pixel.ts";
import {
  encodeGif,
  encodeGifLzw,
  GifError,
  GIF_MAX_COLORS,
  gifFrameIndices,
  gifTableSize,
  quantizePalette,
  type GifColor,
} from "../gifencoder.ts";

/** a solid image of one color. */
function solid(width: number, height: number, rgba: [number, number, number, number]): PixelImage {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let at = 0; at < data.length; at += 4) data.set(rgba, at);
  return { width, height, data };
}

/** a deterministic gradient with a bounded color count (rgb = f(x) + g(y)). */
function gradient(width: number, height: number, step = 8): PixelImage {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      data[at] = Math.round((x / Math.max(1, width - 1)) * 200);
      data[at + 1] = Math.round((y / Math.max(1, height - 1)) * 200);
      data[at + 2] = (x * 3 + y * 5) % 256;
      data[at + 3] = 255;
    }
  }
  return { width, height, data };
}

/** a deterministic pseudo-random frame (the dictionary-reset stress cast). */
function noise(width: number, height: number, seed: number): PixelImage {
  let state = seed >>> 0;
  const next = (): number => ((state = (state * 1103515245 + 12345) & 0x7fffffff) >>> 0);
  const data = new Uint8ClampedArray(width * height * 4);
  for (let at = 0; at < data.length; at += 4) {
    data[at] = next() & 0xff;
    data[at + 1] = next() & 0xff;
    data[at + 2] = next() & 0xff;
    data[at + 3] = 255;
  }
  return { width, height, data };
}

/**
 * decodeLzw — the matched decoder of the test battery: the classic GIF LZW
 * reconstruction (clear codes reset, the kwkwk corner, codes grow when the
 * dictionary crosses the current width, LSB-first bits). Written from the
 * format rules, never from the encoder's own code.
 */
function decodeLzw(data: Uint8Array, minCodeSize: number): Uint8Array {
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  let codeSize = minCodeSize + 1;
  const prefix = new Int32Array(4096);
  const suffix = new Uint8Array(4096);
  for (let root = 0; root < clear; root += 1) suffix[root] = root;
  const out: number[] = [];
  const stack: number[] = [];
  let prev = -1;
  let next = eoi + 1;
  let bitAt = 0;
  const read = (): number => {
    let code = 0;
    for (let at = 0; at < codeSize; at += 1) {
      const byte = data[bitAt >> 3] ?? 0;
      const bit = (byte >> (bitAt & 7)) & 1;
      code |= bit << at;
      bitAt += 1;
    }
    return code;
  };
  const firstOf = (code: number): number => {
    let walk = code;
    while (walk >= clear + 2 && prefix[walk] >= 0) walk = prefix[walk];
    return suffix[walk];
  };
  const emit = (code: number): void => {
    stack.length = 0;
    let walk = code;
    while (walk >= clear + 2 && prefix[walk] >= 0) {
      stack.push(suffix[walk]);
      walk = prefix[walk];
    }
    stack.push(suffix[walk]);
    for (let at = stack.length - 1; at >= 0; at -= 1) out.push(stack[at]);
  };
  for (;;) {
    if (((bitAt + codeSize) >> 3) > data.length) break;
    const code = read();
    if (code === eoi) break;
    if (code === clear) {
      codeSize = minCodeSize + 1;
      next = eoi + 1;
      prev = -1;
      continue;
    }
    if (prev === -1) {
      emit(code);
      prev = code;
      continue;
    }
    if (code < next) emit(code);
    else if (code === next) {
      // the kwkwk corner: the code being defined right now
      emit(prev);
      out.push(firstOf(prev));
    } else throw new Error(`decodeLzw: code ${code} ahead of the dictionary (${next})`);
    // the new entry: the previous string plus the first char of the current entry
    prefix[next] = prev;
    suffix[next] = code === next ? firstOf(prev) : firstOf(code);
    next += 1;
    if (next === 1 << codeSize && codeSize < 12) codeSize += 1;
    prev = code;
  }
  return Uint8Array.from(out);
}

/** reads one little-endian u16 of the stream. */
function u16(bytes: Uint8Array, at: number): number {
  return bytes[at] | (bytes[at + 1] << 8);
}

/** walks the sub-blocked LZW data of one frame into the joined code bytes. */
function readSubBlocks(bytes: Uint8Array, startAt: number): { data: number[]; end: number } {
  const data: number[] = [];
  let at = startAt;
  while (bytes[at] !== 0) {
    const length = bytes[at];
    for (let offset = 1; offset <= length; offset += 1) data.push(bytes[at + offset]);
    at += 1 + length;
  }
  return { data, end: at + 1 };
}

/** finds the next graphic control extension (0x21 0xF9 0x04) at or after
 *  `from` — the anchor every frame walk rides (the color table bytes are
 *  arbitrary, so a bare 0x2C scan cannot find the image descriptor). */
function findGce(bytes: Uint8Array, from: number): number {
  for (let at = Math.max(0, from); at + 3 < bytes.length; at += 1) {
    if (bytes[at] === 0x21 && bytes[at + 1] === 0xf9 && bytes[at + 2] === 0x04) return at;
  }
  return -1;
}

describe("the median-cut palette lane", () => {
  it("answers the exact distinct colors when they fit the budget (the lossless corner)", () => {
    const red = solid(4, 4, [255, 0, 0, 255]);
    const blue = solid(4, 4, [0, 0, 255, 255]);
    const { palette, tableSize } = quantizePalette([red, blue], 256);
    assert.equal(palette.length, 2);
    assert.deepEqual([...palette].sort(), [
      [0, 0, 255],
      [255, 0, 0],
    ] as GifColor[]);
    assert.equal(tableSize, 2);
  });

  it("pads the table to a power of two and keeps the budget", () => {
    const image = gradient(32, 32, 32); // 32-step gradients: bounded distinct count
    const { palette, tableSize } = quantizePalette([image], 32);
    assert.ok(palette.length <= 32, `palette of ${palette.length} must fit the budget`);
    assert.ok(tableSize >= palette.length && tableSize <= GIF_MAX_COLORS);
    assert.equal(tableSize & (tableSize - 1), 0, "the table size is a power of two");
    assert.equal(gifTableSize(palette.length), tableSize);
  });

  it("splits a two-cluster cast into its own two colors (the median cut)", () => {
    const data = new Uint8ClampedArray(4 * 4 * 4);
    // half the pixels near black, half near white: budget 2 answers both means
    for (let pixel = 0; pixel < 16; pixel += 1) {
      const at = pixel * 4;
      const dark = pixel < 8;
      data[at] = dark ? 10 : 245;
      data[at + 1] = dark ? 12 : 250;
      data[at + 2] = dark ? 8 : 240;
      data[at + 3] = 255;
    }
    const { palette } = quantizePalette([{ width: 4, height: 4, data }], 2);
    assert.equal(palette.length, 2);
    const sorted = [...palette].sort((a, b) => a[0] - b[0]);
    assert.deepEqual(sorted[0], [10, 12, 8]);
    assert.deepEqual(sorted[1], [245, 250, 240]);
  });

  it("refuses empty casts and damaged buffers", () => {
    assert.throws(() => quantizePalette([]), GifError);
    assert.throws(() => quantizePalette([{ width: 2, height: 2, data: new Uint8ClampedArray(3) }]), GifError);
  });
});

describe("the LZW lane", () => {
  it("round trips simple sequences through the matched decoder", () => {
    const sequences: Uint8Array[] = [
      Uint8Array.from([0, 0, 0, 1, 1, 2]),
      Uint8Array.from([0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3]),
      Uint8Array.from([3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]),
    ];
    for (const indices of sequences) {
      const minCodeSize = 2;
      const decoded = decodeLzw(encodeGifLzw(indices, minCodeSize), minCodeSize);
      assert.deepEqual(Array.from(decoded), Array.from(indices));
    }
  });

  it("round trips a dictionary-reset stress cast (past 4096 codes)", () => {
    const minCodeSize = 8;
    const indices = gifFrameIndices(noise(64, 64, 987654321), [
      [0, 0, 0],
      [255, 255, 255],
    ], 2);
    // a pseudo-random index cast at min code size 8: the dictionary fills and resets
    let state = 24680;
    const random = new Uint8Array(60000);
    for (let at = 0; at < random.length; at += 1) {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      random[at] = state & 0xff;
    }
    const decoded = decodeLzw(encodeGifLzw(random, minCodeSize), minCodeSize);
    assert.deepEqual(Array.from(decoded), Array.from(random));
    assert.ok(encodeGifLzw(random, minCodeSize).length < random.length * 2);
    void indices;
  });

  it("opens with the clear code and closes with the end-of-information code", () => {
    const minCodeSize = 2;
    const indices = Uint8Array.from([1, 2, 1, 2]);
    const bytes = encodeGifLzw(indices, minCodeSize);
    const clear = 1 << minCodeSize;
    const eoi = clear + 1;
    // a forward LSB-first code reader over the packed stream
    let codeSize = minCodeSize + 1;
    let bitAt = 0;
    const codes: number[] = [];
    for (;;) {
      let code = 0;
      for (let at = 0; at < codeSize; at += 1) {
        code |= (((bytes[(bitAt + at) >> 3] ?? 0) >> ((bitAt + at) & 7)) & 1) << at;
      }
      bitAt += codeSize;
      codes.push(code);
      if (code === clear) codeSize = minCodeSize + 1;
      if (code === eoi) break;
      if (codes.length > bytes.length * 8) throw new Error("the code reader ran away");
    }
    assert.equal(codes[0], clear, "the stream opens with the clear code");
    assert.equal(codes[codes.length - 1], eoi, "the stream closes with the end-of-information code");
    assert.deepEqual(codes.slice(1, -1).length > 0, true, "the stream carries payload codes between");
  });

  it("refuses empty indices, out-of-space indices and bad code sizes", () => {
    assert.throws(() => encodeGifLzw(new Uint8Array(0), 2), GifError);
    assert.throws(() => encodeGifLzw(Uint8Array.from([4]), 2), GifError);
    assert.throws(() => encodeGifLzw(Uint8Array.from([0]), 1), GifError);
    assert.throws(() => encodeGifLzw(Uint8Array.from([0]), 9), GifError);
  });
});

describe("the real GIF89a encoder", () => {
  it("writes the header, screen descriptor, color table and trailer", () => {
    const image = solid(8, 4, [255, 128, 0, 255]);
    const bytes = encodeGif([{ image }], { delayMs: 40 });
    assert.equal(String.fromCharCode(...bytes.subarray(0, 6)), "GIF89a");
    assert.equal(u16(bytes, 6), 8);
    assert.equal(u16(bytes, 8), 4);
    // GCT flag 1, color resolution 7, size bits for a 2-entry table (0)
    assert.equal(bytes[10], 0x80 | (7 << 4) | 0);
    assert.equal(bytes[11], 0);
    assert.equal(bytes[12], 0);
    // the 2-entry global color table
    assert.deepEqual(Array.from(bytes.subarray(13, 19)), [255, 128, 0, 0, 0, 0]);
    assert.equal(bytes[bytes.length - 1], 0x3b);
  });
  it("writes the NETSCAPE2.0 loop block with the loop count", () => {
    const bytes = encodeGif([{ image: solid(4, 4, [1, 2, 3, 255]) }], { loop: 3 });
    const text = String.fromCharCode(...bytes.subarray(0, 40));
    const at = text.indexOf("NETSCAPE2.0");
    assert.ok(at > 0, "the loop block rides the stream");
    assert.equal(bytes[at - 2], 0xff);
    assert.equal(bytes[at - 1], 0x0b);
    assert.equal(bytes[at + 11], 0x03); // the block size of the loop sub-block
    assert.equal(bytes[at + 12], 0x01); // the loop sub-block id
    assert.equal(u16(bytes, at + 13), 3);
    assert.equal(bytes[at + 15], 0x00); // the block terminator
  });

  it("writes the graphic control extension with the delay in centiseconds", () => {
    const image = solid(6, 6, [9, 9, 9, 255]);
    const bytes = encodeGif([{ image }, { image, delayMs: 250 }], { delayMs: 40 });
    const first = findGce(bytes, 0);
    assert.ok(first > 0);
    // the image descriptor rides 8 bytes behind the GCE anchor
    assert.equal(bytes[first + 8], 0x2c);
    assert.equal(bytes[first], 0x21);
    assert.equal(bytes[first + 1], 0xf9);
    assert.equal(bytes[first + 2], 0x04);
    assert.equal(bytes[first + 3], 0x04); // disposal 1 (do not dispose), no transparency
    assert.equal(u16(bytes, first + 4), 4, "40 ms answers 4 centiseconds");
    assert.equal(bytes[first + 6], 0x00);
    assert.equal(bytes[first + 7], 0x00);
    // the second frame overrides with 250 ms = 25 cs
    const second = findGce(bytes, first + 8);
    assert.ok(second > 0);
    assert.equal(u16(bytes, second + 4), 25);
  });

  it("decodes the LZW sub-blocks back to the quantized indices (the matched decoder)", () => {
    const frames = [gradient(24, 18, 6), gradient(24, 18, 12)];
    const { palette, tableSize } = quantizePalette(frames, 256);
    const bytes = encodeGif(frames.map((image) => ({ image })), { delayMs: 60 });
    // walk to the first frame through the GCE anchor, then read its LZW data
    const gce = findGce(bytes, 0);
    assert.ok(gce > 0);
    const at = gce + 8; // the image descriptor
    assert.equal(bytes[at], 0x2c);
    assert.equal(u16(bytes, at + 5), 24);
    assert.equal(u16(bytes, at + 7), 18);
    const minCodeSize = bytes[at + 10];
    const { data, end } = readSubBlocks(bytes, at + 11);
    const decoded = decodeLzw(Uint8Array.from(data), minCodeSize);
    const expected = gifFrameIndices(frames[0], palette, tableSize);
    assert.deepEqual(Array.from(decoded), Array.from(expected));
    // the stream carries a second frame and closes with the trailer
    assert.ok(findGce(bytes, end) > 0);
    assert.equal(bytes[bytes.length - 1], 0x3b);
  });

  it("round trips pixels exactly in the lossless corner", () => {
    const frames = [
      solid(10, 10, [255, 0, 0, 255]),
      solid(10, 10, [0, 255, 0, 255]),
      solid(10, 10, [0, 0, 255, 255]),
      gradient(10, 10, 51),
    ];
    const { palette } = quantizePalette(frames, 256);
    const bytes = encodeGif(frames.map((image) => ({ image })), { delayMs: 70 });
    // every frame decodes back to its own pixels through palette reconstruction
    let search = 0;
    for (const frame of frames) {
      const gce = findGce(bytes, search);
      assert.ok(gce > 0, "every frame carries a graphic control extension");
      const at = gce + 8;
      assert.equal(bytes[at], 0x2c, "every frame carries an image descriptor");
      const minCodeSize = bytes[at + 10];
      const { data, end } = readSubBlocks(bytes, at + 11);
      const indices = decodeLzw(Uint8Array.from(data), minCodeSize);
      assert.equal(indices.length, frame.width * frame.height);
      for (let pixel = 0; pixel < indices.length; pixel += 1) {
        const color = palette[indices[pixel]];
        const at4 = pixel * 4;
        assert.equal(color[0], frame.data[at4]);
        assert.equal(color[1], frame.data[at4 + 1]);
        assert.equal(color[2], frame.data[at4 + 2]);
      }
      search = end;
    }
  });

  it("answers the same bytes for the same frames (determinism)", () => {
    const frames = [gradient(20, 20, 10), gradient(20, 20, 20)].map((image) => ({ image }));
    const first = encodeGif(frames, { delayMs: 50 });
    const second = encodeGif(frames, { delayMs: 50 });
    assert.deepEqual(Array.from(first), Array.from(second));
  });

  it("refuses empty frame sets and mixed screen sizes", () => {
    assert.throws(() => encodeGif([], {}), GifError);
    const small = solid(4, 4, [0, 0, 0, 255]);
    const large = solid(8, 8, [0, 0, 0, 255]);
    assert.throws(() => encodeGif([{ image: small }, { image: large }], {}), GifError);
  });
});
