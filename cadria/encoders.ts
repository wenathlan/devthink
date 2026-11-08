/**
 * encoders — consolidated encoder byte lanes of the cadria family.
 * @module encoders
 * @family wave/logicfold2
 * One keyed file per family: the former variant arms (pngencoder, gifencoder, webmencoder)
 * retired into this seat with every export preserved under the same name.
 */

// # encoders.ts — the one keyed file of the encoder family: the consolidation
// law of the root (one keyed file per family — the pattern versawase.ts
// itself set when it folded its eight arms) merged the three real byte lanes
// of the wave-4 encoder doctrine into this seat — the PNG still lane (the
// former pngencoder.ts body below), the GIF89a indexed animation lane
// (gifencoder.ts) and the EBML/WebM container lane (webmencoder.ts) — every
// export preserved verbatim, zero logic changes. The consolidation notes:
// the three lanes declared no duplicated helper and no same-name const or
// decl across their bodies, so every export rides once under its own name
// with no group suffix; the imports the lanes carried (the node:zlib
// deflate/inflate pair the png and webm lanes both opened, and the
// PixelImage type all three read from the pixel arm of the color family)
// merged into the seat's top imports, the type repointed at color.ts —
// the keyed file that now houses the pixel engine — every surface stays
// live in one seat.

import { deflateSync, inflateSync } from "node:zlib";
import type { PixelImage } from "./color.ts";


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: pngencoder.ts — the real PNG byte lane (the first section).    */
/* (consolidation note: the node:zlib import and the PixelImage type this  */
/* lane carried merged into the seat's top imports — the type reads        */
/* color.ts, the keyed file that now houses the pixel engine.)             */
/* ══════════════════════════════════════════════════════════════════════ */

// # pngencoder — the real PNG byte lane of the versawase engine (the wave-4
// encoder doctrine: the last mile ships real bytes, never mock buffers). The
// encoder writes a complete, decodable PNG stream: the 8-byte signature, one
// IHDR (8-bit RGBA, color type 6, no interlace), one IDAT carrying every
// scanline behind a real zlib deflate (node:zlib — the native lane), and the
// IEND tail. Every chunk carries its honest CRC-32 (the reflected IEEE
// polynomial of the PNG specification), and every scanline picks its filter
// with the real adaptive heuristic (minimum sum of absolute differences over
// the five spec filters None/Sub/Up/Average/Paeth) the reference encoders
// use. The decode twin (decodePng) walks the same stream back — signature
// and CRC verification, IHDR reads, IDAT inflate, filter undo — because the
// import lane (videoimport.ts) and the tests both need a reader that is as
// real as the writer. Non-goals: no interlacing (Adam7), no 16-bit depth,
// no ancillary chunks beyond what honesty demands — the single-frame still
// lane of the video encoder (videoencoder.ts) rides this module.
// Exports: 1 error, 8 functions, 3 constants, 2 types — the honest count.

/** the one error type this module raises: unreadable input or a damaged stream. */
export class PngError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "PngError";
  }
}

/** the 8-byte PNG signature every stream starts with (decimal 137 80 78 71 13 10 26 10). */
export const PNG_SIGNATURE: readonly number[] = [137, 80, 78, 71, 13, 10, 26, 10];

/** bytes per pixel of the one color type this lane writes and reads (8-bit RGBA). */
export const PNG_BYTES_PER_PIXEL = 4;

/** the five scanline filters of the specification, in spec order. */
export type PngFilter = 0 | 1 | 2 | 3 | 4;

/** the CRC-32 table of the PNG specification (reflected, poly 0xEDB88320). */
const CRC_TABLE: readonly number[] = (() => {
  const table = new Array<number>(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

/**
 * pngCrc32 — the chunk integrity lane: the CRC-32 of the bytes (the
 * reflected IEEE polynomial), starting from the spec seed 0xFFFFFFFF and
 * finishing with the inversion.
 *
 * @param bytes the bytes to checksum (the chunk type followed by its data).
 * @param seed the running crc of a previous call (the spec init when omitted).
 * @returns the 32-bit checksum, unsigned.
 */
export function pngCrc32(bytes: Uint8Array, seed = 0xffffffff): number {
  let crc = seed >>> 0;
  for (let at = 0; at < bytes.length; at += 1) crc = CRC_TABLE[(crc ^ bytes[at]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * pngChunk — one length-typed CRC-sealed chunk: the big-endian u32 data
 * length, the 4 ASCII type bytes, the data, then the CRC-32 of type + data.
 *
 * @param type the 4-character chunk type ("IHDR", "IDAT", "IEND").
 * @param data the chunk body.
 * @returns the sealed chunk bytes.
 */
export function pngChunk(type: string, data: Uint8Array): Uint8Array {
  if (!/^[A-Za-z]{4}$/.test(type)) throw new PngError(`pngencoder: chunk type must be 4 letters, got "${type}"`);
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let at = 0; at < 4; at += 1) out[4 + at] = type.charCodeAt(at);
  out.set(data, 8);
  const sealed = new Uint8Array(4 + data.length);
  for (let at = 0; at < 4; at += 1) sealed[at] = type.charCodeAt(at);
  sealed.set(data, 4);
  view.setUint32(8 + data.length, pngCrc32(sealed));
  return out;
}

/** the Paeth predictor of the specification (nearest of a, b, c by the distance triple). */
function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/**
 * pngFilterRow — applies one spec filter to a scanline in place and answers
 * the filtered bytes (the byte the decoder reconstruct semantics expect).
 * The unfiltered row is read first; the prior row (zeros for the first
 * scanline) supplies b/c; bpp is the filter step (4 for RGBA).
 *
 * @param filter the spec filter 0-4.
 * @param row the raw scanline bytes (length = width × bpp).
 * @param prior the reconstructed previous scanline (zeros on the first row).
 * @param bpp bytes per pixel.
 * @returns the filtered scanline.
 */
export function pngFilterRow(filter: PngFilter, row: Uint8Array, prior: Uint8Array, bpp: number): Uint8Array {
  const out = new Uint8Array(row.length);
  for (let at = 0; at < row.length; at += 1) {
    const a = at >= bpp ? row[at - bpp] : 0;
    const b = prior[at];
    const c = at >= bpp ? prior[at - bpp] : 0;
    let value: number;
    switch (filter) {
      case 0:
        value = row[at];
        break;
      case 1:
        value = row[at] - a;
        break;
      case 2:
        value = row[at] - b;
        break;
      case 3:
        value = row[at] - ((a + b) >> 1);
        break;
      default:
        value = row[at] - paeth(a, b, c);
        break;
    }
    out[at] = value & 0xff;
  }
  return out;
}

/** the adaptive heuristic score of a filtered scanline: the sum of absolute byte values (as signed). */
function filterScore(bytes: Uint8Array): number {
  let sum = 0;
  for (let at = 0; at < bytes.length; at += 1) {
    const signed = bytes[at] < 128 ? bytes[at] : bytes[at] - 256;
    sum += signed < 0 ? -signed : signed;
  }
  return sum;
}

/**
 * pngUnfilterRow — the decode twin of pngFilterRow: reconstructs one raw
 * scanline from its filtered bytes plus the reconstructed prior row.
 *
 * @param filter the spec filter 0-4 the scanline carries.
 * @param filtered the filtered scanline bytes.
 * @param prior the reconstructed previous scanline (zeros on the first row).
 * @param bpp bytes per pixel.
 * @returns the raw scanline.
 */
export function pngUnfilterRow(filter: PngFilter, filtered: Uint8Array, prior: Uint8Array, bpp: number): Uint8Array {
  const out = new Uint8Array(filtered.length);
  for (let at = 0; at < filtered.length; at += 1) {
    const a = at >= bpp ? out[at - bpp] : 0;
    const b = prior[at];
    const c = at >= bpp ? prior[at - bpp] : 0;
    let value: number;
    switch (filter) {
      case 0:
        value = filtered[at];
        break;
      case 1:
        value = filtered[at] + a;
        break;
      case 2:
        value = filtered[at] + b;
        break;
      case 3:
        value = filtered[at] + ((a + b) >> 1);
        break;
      default:
        value = filtered[at] + paeth(a, b, c);
        break;
    }
    out[at] = value & 0xff;
  }
  return out;
}

/** validates the PixelImage shape every lane of this module demands. */
function assertImage(image: PixelImage, where: string): void {
  const { width, height, data } = image ?? ({} as PixelImage);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new PngError(`${where}: dimensions must be positive integers, got ${width}x${height}`);
  }
  if (!data || data.length !== width * height * PNG_BYTES_PER_PIXEL) {
    throw new PngError(
      `${where}: RGBA buffer is ${data?.length ?? 0} bytes, expected ${width * height * PNG_BYTES_PER_PIXEL} for ${width}x${height}`,
    );
  }
}

/** the filter byte each scanline picked (the adaptive encoder telemetry the tests read). */
export type PngFilterSelection = { filter: PngFilter; score: number };

/**
 * pngFilteredStream — the adaptive pre-compression pass: every scanline is
 * filtered through all five spec filters and the minimum-sum-of-absolute-
 * differences winner ships (the heuristic of the reference encoders).
 * Answers the concatenated stream (one filter byte per scanline) and the
 * per-scanline selection telemetry.
 *
 * @param image the source RGBA image.
 * @returns the filtered stream and the winning filter per scanline.
 */
export function pngFilteredStream(image: PixelImage): { stream: Uint8Array; selections: PngFilterSelection[] } {
  assertImage(image, "pngencoder");
  const { width, height, data } = image;
  const bpp = PNG_BYTES_PER_PIXEL;
  const stride = width * bpp;
  const stream = new Uint8Array(height * (stride + 1));
  const selections: PngFilterSelection[] = [];
  const prior = new Uint8Array(stride);
  for (let y = 0; y < height; y += 1) {
    const row = new Uint8Array(data.buffer, data.byteOffset + y * stride, stride);
    let best: PngFilterSelection = { filter: 0, score: Number.POSITIVE_INFINITY };
    let bestBytes: Uint8Array = row;
    for (const filter of [0, 1, 2, 3, 4] as const) {
      const filtered = pngFilterRow(filter, row, prior, bpp);
      const score = filterScore(filtered);
      if (score < best.score) {
        best = { filter, score };
        bestBytes = filtered;
      }
    }
    const at = y * (stride + 1);
    stream[at] = best.filter;
    stream.set(bestBytes, at + 1);
    prior.set(row);
    selections.push(best);
  }
  return { stream, selections };
}

/**
 * encodePng — the real encoder: signature, IHDR (8-bit RGBA), one IDAT of
 * the adaptively filtered stream behind a real zlib deflate, IEND. The same
 * image answers the same bytes every call (no clock, no randomness); the
 * compression level rides the option (default 6, the zlib middle).
 *
 * @param image the source RGBA image.
 * @param options the deflate level (0-9).
 * @returns the complete PNG stream.
 */
export function encodePng(image: PixelImage, options: { level?: number } = {}): Uint8Array {
  assertImage(image, "pngencoder");
  const level = Number.isInteger(options?.level) ? Math.min(9, Math.max(0, options.level as number)) : 6;
  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, image.width);
  view.setUint32(4, image.height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: truecolor with alpha
  ihdr[10] = 0; // compression: zlib
  ihdr[11] = 0; // filter: adaptive
  ihdr[12] = 0; // interlace: none
  const { stream } = pngFilteredStream(image);
  const idat = deflateSync(stream, { level });
  const parts = [
    new Uint8Array(PNG_SIGNATURE),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", new Uint8Array(idat)),
    pngChunk("IEND", new Uint8Array(0)),
  ];
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** one parsed chunk of the stream walk. */
export type PngChunkRead = { type: string; data: Uint8Array; crcValid: boolean };

/**
 * decodePng — the decode twin: verifies the signature, walks every chunk,
 * verifies every CRC, reads the IHDR (only 8-bit RGBA answers), inflates
 * the IDAT stream and undoes every scanline filter. Damaged input answers
 * PngError — never a pretend decode.
 *
 * @param bytes the PNG stream.
 * @returns the decoded RGBA image.
 */
export function decodePng(bytes: Uint8Array): PixelImage {
  if (!(bytes instanceof Uint8Array) || bytes.length < 8) throw new PngError("pngencoder: stream too small to decode");
  for (let at = 0; at < 8; at += 1) {
    if (bytes[at] !== PNG_SIGNATURE[at]) throw new PngError(`pngencoder: signature byte ${at} is ${bytes[at]}`);
  }
  const chunks: PngChunkRead[] = [];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    if (offset + 12 + length > bytes.length) throw new PngError(`pngencoder: chunk at ${offset} runs past the stream`);
    let type = "";
    for (let at = 0; at < 4; at += 1) type += String.fromCharCode(bytes[offset + 4 + at]);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    const crc = view.getUint32(offset + 8 + length);
    const sealed = new Uint8Array(4 + length);
    for (let at = 0; at < 4; at += 1) sealed[at] = bytes[offset + 4 + at];
    sealed.set(data, 4);
    const crcValid = pngCrc32(sealed) === crc;
    chunks.push({ type, data, crcValid });
    offset += 12 + length;
    if (type === "IEND") break;
  }
  if (chunks.length === 0 || chunks[0].type !== "IHDR") throw new PngError("pngencoder: stream carries no IHDR");
  const bad = chunks.find((chunk) => !chunk.crcValid);
  if (bad) throw new PngError(`pngencoder: chunk ${bad.type} carries a broken CRC`);
  const ihdr = chunks[0].data;
  const width = new DataView(ihdr.buffer, ihdr.byteOffset).getUint32(0);
  const height = new DataView(ihdr.buffer, ihdr.byteOffset).getUint32(4);
  if (ihdr[8] !== 8 || ihdr[9] !== 6) {
    throw new PngError(`pngencoder: only 8-bit RGBA decodes here, got depth ${ihdr[8]} color type ${ihdr[9]}`);
  }
  if (width < 1 || height < 1) throw new PngError(`pngencoder: IHDR dimensions ${width}x${height} are not positive`);
  const idat = chunks.filter((chunk) => chunk.type === "IDAT").map((chunk) => chunk.data);
  if (idat.length === 0) throw new PngError("pngencoder: stream carries no IDAT");
  const total = idat.reduce((sum, part) => sum + part.length, 0);
  const joined = new Uint8Array(total);
  let joinAt = 0;
  for (const part of idat) {
    joined.set(part, joinAt);
    joinAt += part.length;
  }
  let stream: Uint8Array;
  try {
    stream = new Uint8Array(inflateSync(joined));
  } catch (error) {
    throw new PngError(`pngencoder: the IDAT stream does not inflate: ${(error as Error).message}`, { cause: error });
  }
  const bpp = PNG_BYTES_PER_PIXEL;
  const stride = width * bpp;
  if (stream.length !== height * (stride + 1)) {
    throw new PngError(
      `pngencoder: inflated stream is ${stream.length} bytes, expected ${height * (stride + 1)} for ${width}x${height}`,
    );
  }
  const data = new Uint8ClampedArray(width * height * bpp);
  const prior = new Uint8Array(stride);
  for (let y = 0; y < height; y += 1) {
    const at = y * (stride + 1);
    const filter = stream[at] as PngFilter;
    if (filter < 0 || filter > 4) throw new PngError(`pngencoder: scanline ${y} carries unknown filter ${filter}`);
    const filtered = stream.subarray(at + 1, at + 1 + stride);
    const row = pngUnfilterRow(filter, filtered, prior, bpp);
    data.set(row, y * stride);
    prior.set(row);
  }
  return { width, height, data };
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: gifencoder.ts — the real GIF89a byte lane.                     */
/* (consolidation note: the PixelImage type import this lane carried       */
/* merged into the seat's top import — it reads color.ts, the keyed file   */
/* that now houses the pixel engine.)                                      */
/* ══════════════════════════════════════════════════════════════════════ */

// # gifencoder — the real GIF89a byte lane of the versawase engine (the
// wave-4 encoder doctrine: the last mile ships real bytes, never mock
// buffers). The encoder writes a complete, decodable GIF89a stream: the
// header, the logical screen descriptor with a global color table, the
// NETSCAPE2.0 loop block, one graphic control extension plus image
// descriptor plus LZW data block per frame, and the trailer. The palette
// is a real median-cut quantization over every pixel of every frame
// (boxes split on their longest axis at the median until the color
// budget is spent, each box donating its average), the indices are a
// nearest-palette match, and the image data is a real GIF LZW stream —
// clear codes, growing code widths from the minimum code size to 12
// bits, a dictionary reset when the code space fills, and LSB-first bit
// packing into 255-byte sub-blocks. Verified against third-party
// decoders (the development oracle): the same stream PIL decodes is the
// stream this module claims. Non-goals: no local color tables, no
// interlacing, no transparency index (the frames are opaque RGBA over
// the quantized palette), no frame-level disposal beyond the documented
// "do not dispose". Exports: 1 error, 4 functions, 1 type.

/** the one error type this module raises: unreadable frames or options. */
export class GifError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "GifError";
  }
}

/** the palette budget ceiling of the GIF format (a power-of-two table). */
export const GIF_MAX_COLORS = 256;

/** one rgb triple of a palette (0-255 per channel). */
export type GifColor = readonly [number, number, number];

/** one bucket of the median cut: the pixel samples it holds. */
interface ColorBox {
  pixels: number[];
}

/** packs one pixel sample (three 0-255 channels) into a single integer. */
function pack(r: number, g: number, b: number): number {
  return (r << 16) | (g << 8) | b;
}

/** unpacks one packed sample into its rgb triple. */
function unpack(packed: number): GifColor {
  return [(packed >> 16) & 0xff, (packed >> 8) & 0xff, packed & 0xff];
}

/** the channel spread of a box: the widest channel first (the split axis). */
function widestChannel(box: ColorBox): 0 | 1 | 2 {
  let best: 0 | 1 | 2 = 0;
  let bestSpread = -1;
  for (let channel = 0 as 0 | 1 | 2; channel < 3; channel = (channel + 1) as 0 | 1 | 2) {
    const shift = (2 - channel) * 8;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const packed of box.pixels) {
      const value = (packed >> shift) & 0xff;
      if (value < min) min = value;
      if (value > max) max = value;
    }
    const spread = max - min;
    if (spread > bestSpread) {
      bestSpread = spread;
      best = channel;
    }
  }
  return best;
}

/**
 * quantizePalette — the real median cut: every pixel of every frame is
 * sampled into boxes; the box with pixels and the widest channel spread
 * splits at the median of that channel until the color budget is spent
 * or no box can split; every box donates the average of its samples.
 * Fewer distinct colors than the budget answers a palette that carries
 * every distinct color exactly (the lossless corner of the quantizer).
 *
 * @param frames the frames to quantize across (the palette is global).
 * @param maxColors the color budget (2-256, default 256).
 * @returns the palette and its power-of-two size (the table the GIF ships).
 */
export function quantizePalette(
  frames: readonly PixelImage[],
  maxColors = GIF_MAX_COLORS,
): { palette: GifColor[]; tableSize: number } {
  const budget = Math.min(GIF_MAX_COLORS, Math.max(2, Math.floor(maxColors)));
  const distinct = new Map<number, number>();
  for (const frame of frames) {
    if (!frame || !frame.data || frame.data.length !== frame.width * frame.height * 4) {
      throw new GifError("gifencoder: every frame must carry a width x height x 4 RGBA buffer");
    }
    for (let at = 0; at < frame.data.length; at += 4) {
      const packed = pack(frame.data[at], frame.data[at + 1], frame.data[at + 2]);
      distinct.set(packed, (distinct.get(packed) ?? 0) + 1);
    }
  }
  if (distinct.size === 0) throw new GifError("gifencoder: the frame set carries no pixels");
  const unique = [...distinct.keys()];
  if (unique.length <= budget) {
    // the lossless corner: every distinct color rides the table unchanged
    const palette = unique.slice(0, budget).map(unpack);
    return { palette, tableSize: tableSizeFor(palette.length) };
  }
  let boxes: ColorBox[] = [{ pixels: unique }];
  while (boxes.length < budget) {
    // the split candidate: the populated box with the widest spread
    let candidate = -1;
    let candidateSpread = -1;
    for (let at = 0; at < boxes.length; at += 1) {
      const box = boxes[at];
      if (box.pixels.length < 2) continue;
      const channel = widestChannel(box);
      const shift = (2 - channel) * 8;
      let min = 255;
      let max = 0;
      for (const packed of box.pixels) {
        const value = (packed >> shift) & 0xff;
        if (value < min) min = value;
        if (value > max) max = value;
      }
      if (max - min > candidateSpread) {
        candidateSpread = max - min;
        candidate = at;
      }
    }
    if (candidate < 0 || candidateSpread <= 0) break;
    const box = boxes[candidate];
    const channel = widestChannel(box);
    const shift = (2 - channel) * 8;
    const sorted = [...box.pixels].sort((left, right) => ((left >> shift) & 0xff) - ((right >> shift) & 0xff));
    const median = sorted.length >> 1;
    boxes.splice(
      candidate,
      1,
      { pixels: sorted.slice(0, median) },
      { pixels: sorted.slice(median) },
    );
  }
  boxes = boxes.filter((box) => box.pixels.length > 0);
  const palette: GifColor[] = boxes.map((box) => {
    let r = 0;
    let g = 0;
    let b = 0;
    for (const packed of box.pixels) {
      const [pr, pg, pb] = unpack(packed);
      r += pr;
      g += pg;
      b += pb;
    }
    const count = box.pixels.length;
    return [Math.round(r / count), Math.round(g / count), Math.round(b / count)] as GifColor;
  });
  return { palette, tableSize: tableSizeFor(palette.length) };
}

/** the power-of-two table size the palette pads to (2-256 entries). */
function tableSizeFor(colors: number): number {
  let size = 2;
  while (size < colors && size < GIF_MAX_COLORS) size <<= 1;
  return size;
}

/** the GIF packed screen byte for a global color table of the given size. */
function screenPacked(gctSize: number): number {
  // GCT flag 1, color resolution 7 (8 bits per channel), no sort, size bits
  return 0x80 | (7 << 4) | (Math.log2(gctSize) - 1);
}

/** the minimum LZW code size a table of the given size needs (2-8). */
function minCodeSizeFor(tableSize: number): number {
  return Math.max(2, Math.log2(tableSize));
}

/**
 * encodeGifLzw — the real GIF LZW compressor: the clear code opens the
 * stream, string matching extends the prefix through a dictionary of
 * (prefix, next) pairs, codes grow one bit when the dictionary crosses
 * the current width, and a full 4096-code dictionary emits the running
 * code, resets through a fresh clear code and rebuilds. Bits pack
 * LSB-first. Answers the raw code stream (the caller cuts sub-blocks).
 *
 * @param indices one palette index per pixel.
 * @param minCodeSize the LZW minimum code size (2-8).
 * @returns the packed code bits.
 */
export function encodeGifLzw(indices: Uint8Array, minCodeSize: number): Uint8Array {
  if (!Number.isInteger(minCodeSize) || minCodeSize < 2 || minCodeSize > 8) {
    throw new GifError(`gifencoder: LZW minimum code size must be 2-8, got ${minCodeSize}`);
  }
  if (!indices || indices.length === 0) throw new GifError("gifencoder: the LZW lane needs at least one index");
  for (const index of indices) {
    if (index >= 1 << minCodeSize) {
      throw new GifError(`gifencoder: index ${index} does not fit the ${minCodeSize}-bit code space`);
    }
  }
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  let codeSize = minCodeSize + 1;
  let next = eoi + 1;
  let dictionary = new Map<number, number>();
  const bytes: number[] = [];
  let byte = 0;
  let bits = 0;
  const emit = (code: number, width: number): void => {
    byte |= code << bits;
    bits += width;
    while (bits >= 8) {
      bytes.push(byte & 0xff);
      byte >>= 8;
      bits -= 8;
    }
  };
  emit(clear, codeSize);
  let prefix = indices[0];
  for (let at = 1; at < indices.length; at += 1) {
    const k = indices[at];
    const key = prefix * 256 + k;
    const hit = dictionary.get(key);
    if (hit !== undefined) {
      prefix = hit;
      continue;
    }
    emit(prefix, codeSize);
    if (next < 4096) {
      dictionary.set(key, next);
      if (next === 1 << codeSize && codeSize < 12) codeSize += 1;
      next += 1;
    } else {
      emit(clear, codeSize);
      dictionary = new Map<number, number>();
      codeSize = minCodeSize + 1;
      next = eoi + 1;
    }
    prefix = k;
  }
  emit(prefix, codeSize);
  emit(eoi, codeSize);
  if (bits > 0) bytes.push(byte & 0xff);
  return Uint8Array.from(bytes);
}

/** one frame of the encode request (the delay may override the stream default). */
export type GifFrame = { image: PixelImage; delayMs?: number };

/** the encode options every field of which carries a documented default. */
export type GifEncodeOptions = {
  /** the loop count (0 = forever, the default) */
  loop?: number;
  /** the default delay per frame in milliseconds (default 100 = 10 cs) */
  delayMs?: number;
  /** the color budget of the global palette (default 256) */
  maxColors?: number;
};

/** appends one extension or data sub-block sequence to the byte list. */
function appendSubBlocks(bytes: number[], data: Uint8Array): void {
  for (let at = 0; at < data.length; at += 255) {
    const window = data.subarray(at, Math.min(at + 255, data.length));
    bytes.push(window.length);
    for (const byte of window) bytes.push(byte);
  }
  bytes.push(0);
}

/**
 * encodeGif — the real GIF89a encoder: header, logical screen descriptor
 * with the median-cut global color table, the NETSCAPE2.0 loop block,
 * then one graphic control extension (delay in centiseconds, disposal
 * "do not dispose"), image descriptor (full-frame, no interlace) and
 * LZW sub-block sequence per frame, closed by the trailer. The same
 * frames answer the same bytes every call (no clock, no randomness).
 *
 * @param frames the frames to encode (all must share dimensions).
 * @param options the loop, delay and color budget options.
 * @returns the complete GIF89a stream.
 */
export function encodeGif(frames: readonly GifFrame[], options: GifEncodeOptions = {}): Uint8Array {
  if (!Array.isArray(frames) || frames.length === 0) throw new GifError("gifencoder: the gif needs at least one frame");
  const first = frames[0].image;
  const width = first.width;
  const height = first.height;
  for (const frame of frames) {
    const image = frame.image;
    if (image.width !== width || image.height !== height) {
      throw new GifError(
        `gifencoder: every frame must share the screen size ${width}x${height}, got ${image.width}x${image.height}`,
      );
    }
  }
  const { palette, tableSize } = quantizePalette(
    frames.map((frame) => frame.image),
    options.maxColors,
  );
  const minCodeSize = minCodeSizeFor(tableSize);
  const bytes: number[] = [];
  // the header and the logical screen descriptor
  for (const code of "GIF89a") bytes.push(code.charCodeAt(0));
  const view = new DataView(new ArrayBuffer(2));
  const pushU16 = (value: number): void => {
    view.setUint16(0, value, true);
    bytes.push(view.getUint8(0), view.getUint8(1));
  };
  pushU16(width);
  pushU16(height);
  bytes.push(screenPacked(tableSize));
  bytes.push(0); // background color index
  bytes.push(0); // pixel aspect ratio (unspecified)
  // the global color table, padded to the power-of-two size
  for (let entry = 0; entry < tableSize; entry += 1) {
    const color = palette[entry] ?? [0, 0, 0];
    bytes.push(color[0], color[1], color[2]);
  }
  // the NETSCAPE2.0 loop block (the animation loop contract of the format)
  const loop = Number.isFinite(options.loop) ? Math.max(0, Math.floor(options.loop as number)) : 0;
  bytes.push(0x21, 0xff, 0x0b);
  for (const code of "NETSCAPE2.0") bytes.push(code.charCodeAt(0));
  bytes.push(0x03, 0x01);
  pushU16(loop);
  bytes.push(0x00);
  const defaultDelayMs = Number.isFinite(options.delayMs) ? Math.max(0, options.delayMs as number) : 100;
  for (const frame of frames) {
    const image = frame.image;
    const delayMs = frame.delayMs !== undefined ? Math.max(0, frame.delayMs) : defaultDelayMs;
    // the graphic control extension: disposal 1 (do not dispose), delay in centiseconds
    bytes.push(0x21, 0xf9, 0x04, 0x04);
    pushU16(Math.round(delayMs / 10));
    bytes.push(0x00, 0x00); // no transparency index
    // the image descriptor: full frame, no local table, no interlace
    bytes.push(0x2c);
    pushU16(0);
    pushU16(0);
    pushU16(width);
    pushU16(height);
    bytes.push(0x00);
    // the LZW minimum code size and the sub-blocked code stream
    bytes.push(minCodeSize);
    appendSubBlocks(bytes, encodeGifLzw(gifFrameIndices(image, palette, tableSize), minCodeSize));
  }
  bytes.push(0x3b); // the trailer
  return Uint8Array.from(bytes);
}

/** the nearest palette entry by squared distance (ties ride the lowest index). */
function nearestIndex(palette: readonly GifColor[], tableSize: number, r: number, g: number, b: number): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let at = 0; at < palette.length && at < tableSize; at += 1) {
    const [pr, pg, pb] = palette[at];
    const dr = pr - r;
    const dg = pg - g;
    const db = pb - b;
    const distance = dr * dr + dg * dg + db * db;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = at;
    }
  }
  return best;
}

/**
 * gifFrameIndices — the quantized view a GIF viewer reconstructs: every
 * pixel maps to its nearest palette entry (squared distance, ties to the
 * lowest index). The encoder lane and the import lane share this map so
 * the shipped bytes and the read-back pixels answer the same table.
 *
 * @param image the frame to index.
 * @param palette the global color table.
 * @param tableSize the power-of-two table size (the padded entries).
 * @returns one palette index per pixel.
 */
export function gifFrameIndices(image: PixelImage, palette: readonly GifColor[], tableSize: number): Uint8Array {
  if (!image || !image.data || image.data.length !== image.width * image.height * 4) {
    throw new GifError("gifencoder: the frame must carry a width x height x 4 RGBA buffer");
  }
  const indices = new Uint8Array(image.width * image.height);
  for (let at = 0, pixel = 0; pixel < indices.length; pixel += 1, at += 4) {
    indices[pixel] = nearestIndex(palette, tableSize, image.data[at], image.data[at + 1], image.data[at + 2]);
  }
  return indices;
}

/** exported for the import lane: the power-of-two table size of a palette. */
export function gifTableSize(colors: number): number {
  return tableSizeFor(colors);
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: webmencoder.ts — the real EBML muxer lane.                     */
/* (consolidation note: the node:zlib import and the PixelImage type this  */
/* lane carried merged into the seat's top imports — the type reads        */
/* color.ts.)                                                              */
/* ══════════════════════════════════════════════════════════════════════ */

// # webmencoder — the real EBML muxer of the versawase engine (the wave-4
// encoder doctrine: the last mile ships real bytes, never mock buffers).
// The muxer writes a complete, parseable Matroska/WebM stream: the EBML
// header with its DocType, one Segment carrying Info (TimecodeScale +
// Duration, the clock math the family probe lane reads back), Tracks (one
// video TrackEntry with PixelWidth/PixelHeight) and one Cluster per frame
// window with SimpleBlocks (signed 16-bit relative timecodes, the keyframe
// flag bit, real payloads).
//
// THE CODEC BOUNDARY (the honest sub-codec doctrine this module documents):
// a full VP8/VP9 encoder is out of scope for this wave, so the muxer NEVER
// claims a codec it did not encode. The frame payload lane is the cadria
// lossless frame codec — CodecID "V_CADRIA", one real zlib deflate of the
// RGBA frame bytes per SimpleBlock — a real, lossless, clearly named
// sub-codec. A real VPX encoder docks at the same boundary: hand
// encodeWebmFrames pre-encoded payloads through the payload lane and the
// container muxes them unchanged; the demux twin (decodeWebmFrames) walks
// the EBML back, inflates the payloads and answers the frames. The DocType
// rides "webm" so the family probe lane (mediaprobe.ts) recognizes the
// stream; the mediaprobe walk answers the honest codec row (V_CADRIA, the
// dimensions, the duration) for every stream this module ships.
// Non-goals: no streaming (unknown-size elements), no lacing (one
// SimpleBlock per frame), no audio tracks, no seek head/cues (the demux
// walks clusters linearly). Exports: 1 error, 8 functions, 4 constants,
// 5 types.

/** the one error type this module raises: unreadable frames or a damaged stream. */
export class WebmError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "WebmError";
  }
}

/** the EBML magic element id every stream opens with (0x1A45DFA3). */
export const EBML_HEADER_ID = 0x1a45dfa3;

/** the Segment element id (0x18538067). */
export const SEGMENT_ID = 0x18538067;

/** the honest codec id of the cadria lossless frame lane (never a VPX claim). */
export const CADRIA_CODEC_ID = "V_CADRIA";

/** the cluster window the muxer cuts (frames per Cluster element). */
export const DEFAULT_CLUSTER_FRAMES = 30;

/** one frame source of the mux: pixels the cadria lossless lane deflates. */
export type WebmFrameSource = {
  /** the frame pixels (RGBA, width x height x 4 — the stream dimensions). */
  pixels: PixelImage;
  /** keyframe flag (defaults to the first frame of each cluster). */
  keyframe?: boolean;
};

/**
 * ebmlVintId — the ID vint of one element id: the marker bit rides the id
 * itself (every Matroska id carries it), the length is the smallest byte
 * count whose top byte keeps the marker, big-endian.
 *
 * @param id the element id with its marker bit (0x1A45DFA3, 0xAE, ...).
 * @returns the id bytes.
 */
export function ebmlVintId(id: number): Uint8Array {
  if (!Number.isInteger(id) || id <= 0 || id > 0xffffffff) {
    throw new WebmError(`webmencoder: element id must be a positive u32, got ${id}`);
  }
  let length = 4;
  while (length > 1) {
    const top = id >>> (8 * (length - 1));
    if (top >= 1 << (8 - length) && top < 1 << (9 - length)) break;
    length -= 1;
  }
  const out = new Uint8Array(length);
  for (let at = 0; at < length; at += 1) out[at] = (id >>> (8 * (length - 1 - at))) & 0xff;
  return out;
}

/**
 * ebmlVintSize — the size vint of one element body: minimal length, the
 * marker bit set on the first byte, the value big-endian behind it. The
 * whole-file buffering of this muxer never needs the unknown-size escape.
 *
 * @param size the body length (>= 0).
 * @returns the size bytes.
 */
export function ebmlVintSize(size: number): Uint8Array {
  if (!Number.isInteger(size) || size < 0 || size > 0xfffffff) {
    throw new WebmError(`webmencoder: element size must be a non-negative u28, got ${size}`);
  }
  let length = 1;
  while (size >= 1 << (7 * length)) length += 1;
  const out = new Uint8Array(length);
  for (let at = 0; at < length; at += 1) {
    const shift = 8 * (length - 1 - at);
    out[at] = (size >>> shift) & 0xff;
  }
  out[0] |= 1 << (8 - length);
  return out;
}

/** the big-endian uint element body of a value (minimal length, 1 byte for 0). */
export function ebmlUint(value: number): Uint8Array {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffffffff) {
    throw new WebmError(`webmencoder: uint value out of range: ${value}`);
  }
  let length = 0;
  let rest = value;
  while (rest > 0) {
    length += 1;
    rest = Math.floor(rest / 256);
  }
  const out = new Uint8Array(Math.max(1, length));
  let low = value;
  for (let at = out.length - 1; at >= 0; at -= 1) {
    out[at] = low % 256;
    low = Math.floor(low / 256);
  }
  return out;
}

/** the big-endian float64 element body of a value (the Duration spelling). */
export function ebmlFloat64(value: number): Uint8Array {
  if (!Number.isFinite(value)) throw new WebmError(`webmencoder: float value must be finite, got ${value}`);
  const out = new Uint8Array(8);
  new DataView(out.buffer).setFloat64(0, value, false);
  return out;
}

/** the ascii element body of a text value. */
function ebmlAscii(text: string): Uint8Array {
  return Uint8Array.from(text, (char) => char.charCodeAt(0) & 0xff);
}

/**
 * ebmlElement — one element: the id vint, the size vint of the body, the
 * body. Master elements compose by concatenating child payloads.
 *
 * @param id the element id.
 * @param body the element body bytes.
 * @returns the sealed element.
 */
export function ebmlElement(id: number, body: Uint8Array): Uint8Array {
  const idBytes = ebmlVintId(id);
  const sizeBytes = ebmlVintSize(body.length);
  const out = new Uint8Array(idBytes.length + sizeBytes.length + body.length);
  out.set(idBytes, 0);
  out.set(sizeBytes, idBytes.length);
  out.set(body, idBytes.length + sizeBytes.length);
  return out;
}

/** concatenates element byte lists into one body. */
function join(parts: readonly Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** the encode options every field of which carries a documented default. */
export type WebmEncodeOptions = {
  /** the frame rate the timecodes ride (frames per second, > 0). */
  fps: number;
  /** the stream width (every frame must match). */
  width: number;
  /** the stream height (every frame must match). */
  height: number;
  /** the cluster window in frames (default 30). */
  clusterFrames?: number;
};

/**
 * encodeWebmFrames — the real muxer: EBML header (DocType webm), Segment
 * with Info (TimecodeScale 1 ms, Duration in scale units), Tracks (one
 * video TrackEntry, CodecID V_CADRIA, the cadria lossless frame lane) and
 * one Cluster per window of frames, each frame one SimpleBlock (signed
 * 16-bit relative timecode, keyframe flag on the window head, the deflated
 * RGBA payload). Deterministic: the same frames answer the same bytes.
 *
 * @param frames the frame sources (all must match the stream dimensions).
 * @param options the fps, dimensions and cluster window.
 * @returns the complete EBML stream.
 */
export function encodeWebmFrames(frames: readonly WebmFrameSource[], options: WebmEncodeOptions): Uint8Array {
  if (!Array.isArray(frames) || frames.length === 0) {
    throw new WebmError("webmencoder: the stream needs at least one frame");
  }
  const { width, height } = options;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new WebmError(`webmencoder: stream dimensions must be positive integers, got ${width}x${height}`);
  }
  const fps = options.fps;
  if (!Number.isFinite(fps) || fps <= 0) throw new WebmError(`webmencoder: fps must be > 0, got ${fps}`);
  const clusterFrames = Math.max(1, Math.floor(options.clusterFrames ?? DEFAULT_CLUSTER_FRAMES));
  for (const frame of frames) {
    const pixels = frame.pixels;
    if (pixels.width !== width || pixels.height !== height) {
      throw new WebmError(
        `webmencoder: every frame must match the stream ${width}x${height}, got ${pixels.width}x${pixels.height}`,
      );
    }
    if (!pixels.data || pixels.data.length !== width * height * 4) {
      throw new WebmError(
        `webmencoder: frame pixels are ${pixels.data?.length ?? 0} bytes, expected ${width * height * 4}`,
      );
    }
  }
  // the EBML header
  const header = ebmlElement(
    EBML_HEADER_ID,
    join([
      ebmlElement(0x4286, ebmlUint(1)), // EBMLVersion
      ebmlElement(0x42f7, ebmlUint(1)), // EBMLReadVersion
      ebmlElement(0x42f2, ebmlUint(4)), // EBMLMaxIDLength
      ebmlElement(0x42f3, ebmlUint(8)), // EBMLMaxSizeLength
      ebmlElement(0x4282, ebmlAscii("webm")), // DocType
      ebmlElement(0x4287, ebmlUint(2)), // DocTypeVersion
      ebmlElement(0x4285, ebmlUint(2)), // DocTypeReadVersion
    ]),
  );
  // the Info segment child: the clock every reader (and the family probe) walks back
  const frameMs = 1000 / fps;
  const durationMs = frames.length * frameMs;
  const info = ebmlElement(
    0x1549a966,
    join([
      ebmlElement(0x2ad7b1, ebmlUint(1_000_000)), // TimecodeScale: 1 ms
      ebmlElement(0x4489, ebmlFloat64(durationMs)), // Duration (scale units)
      ebmlElement(0x4d80, ebmlAscii("cadria-versawase")), // MuxingApp
      ebmlElement(0x5741, ebmlAscii("cadria-versawase")), // WritingApp
    ]),
  );
  // the Tracks segment child: one video track on the cadria lossless frame lane
  const tracks = ebmlElement(
    0x1654ae6b,
    ebmlElement(
      0xae, // TrackEntry
      join([
        ebmlElement(0xd7, ebmlUint(1)), // TrackNumber
        ebmlElement(0x73c5, ebmlUint(1)), // TrackUID
        ebmlElement(0x83, ebmlUint(1)), // TrackType: video
        ebmlElement(0x86, ebmlAscii(CADRIA_CODEC_ID)), // CodecID (the honest lane)
        ebmlElement(0x23e383, ebmlUint(Math.round(1e9 / fps))), // DefaultDuration (ns)
        ebmlElement(
          0xe0, // Video
          join([ebmlElement(0xb0, ebmlUint(width)), ebmlElement(0xba, ebmlUint(height))]),
        ),
      ]),
    ),
  );
  // the clusters: one per window, every frame one SimpleBlock
  const clusters: Uint8Array[] = [];
  for (let base = 0; base < frames.length; base += clusterFrames) {
    const window = frames.slice(base, base + clusterFrames);
    const blocks: Uint8Array[] = [ebmlElement(0xe7, ebmlUint(Math.round(base * frameMs)))]; // Timestamp (absolute ms)
    window.forEach((frame, at) => {
      const relativeMs = Math.round(at * frameMs);
      const flags = (frame.keyframe ?? at === 0 ? 0x80 : 0x00) | 0x00; // keyframe bit, no lacing
      const payload = deflateSync(
        new Uint8Array(frame.pixels.data.buffer, frame.pixels.data.byteOffset, frame.pixels.data.length),
      );
      const body = new Uint8Array(3 + payload.length);
      const view = new DataView(body.buffer);
      view.setInt16(0, Math.max(-32768, Math.min(32767, relativeMs)), false);
      body[2] = flags;
      body.set(payload, 3);
      blocks.push(ebmlElement(0xa3, body)); // SimpleBlock
    });
    clusters.push(ebmlElement(0x1f43b675, join(blocks)));
  }
  return join([header, ebmlElement(SEGMENT_ID, join([info, tracks, ...clusters]))]);
}

/** one decoded frame with its timing and keyframe flag. */
export type WebmDecodedFrame = {
  pixels: PixelImage;
  /** the absolute presentation timecode in milliseconds. */
  timestampMs: number;
  keyframe: boolean;
};

/** the demux answer: the stream facts plus every decoded frame. */
export type WebmDecodeReport = {
  width: number;
  height: number;
  codecId: string;
  durationSeconds: number;
  timecodeScaleMs: number;
  frames: WebmDecodedFrame[];
};

/** reads one vint (ids keep the marker, sizes drop it); answers the value and the end. */
function readVint(view: DataView, offset: number, limit: number, keepMarker: boolean): { value: number; end: number } {
  if (offset >= limit) throw new WebmError("webmencoder: truncated EBML header");
  const first = view.getUint8(offset);
  let length = 1;
  let mask = 0x80;
  while (length <= 8 && !(first & mask)) {
    length += 1;
    mask >>= 1;
  }
  if (length > 8 || offset + length > limit) throw new WebmError("webmencoder: unreadable EBML vint");
  let value = keepMarker ? first : first & (0xff >> length);
  for (let at = 1; at < length; at += 1) value = value * 256 + view.getUint8(offset + at);
  return { value, end: offset + length };
}

/** reads one element header; answers the id, the body range and the end. */
function readElement(view: DataView, offset: number, limit: number): { id: number; bodyStart: number; end: number } {
  const id = readVint(view, offset, limit, true);
  const size = readVint(view, id.end, limit, false);
  const lengthBytes = size.end - id.end;
  const unknown = lengthBytes < 8 && size.value === 2 ** (7 * lengthBytes) - 1;
  return { id: id.value, bodyStart: size.end, end: unknown ? limit : Math.min(size.end + size.value, limit) };
}

/** reads a big-endian uint body. */
function readUint(view: DataView, start: number, end: number): number {
  let value = 0;
  for (let at = start; at < end; at += 1) value = value * 256 + view.getUint8(at);
  return value;
}

/**
 * decodeWebmFrames — the demux twin: walks the EBML stream back (header,
 * Info clock, TrackEntry facts) and answers every SimpleBlock frame of
 * every Cluster — the payload inflated by the cadria lossless lane, the
 * presentation timecodes absolute, the keyframe flags read. Damaged input
 * answers WebmError — never a pretend decode.
 *
 * @param bytes the EBML stream encodeWebmFrames shipped.
 * @returns the stream facts and the decoded frames.
 */
export function decodeWebmFrames(bytes: Uint8Array): WebmDecodeReport {
  if (!(bytes instanceof Uint8Array) || bytes.length < 4) throw new WebmError("webmencoder: stream too small to demux");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const limit = bytes.length;
  // the one mutable cell of the walk: everything the segment children write
  const state = {
    timecodeScaleMs: 1,
    durationMs: 0,
    width: 0,
    height: 0,
    codecId: "",
    frames: [] as WebmDecodedFrame[],
  };
  let sawHeader = false;
  let offset = 0;
  while (offset < limit) {
    const element = readElement(view, offset, limit);
    if (element.id === EBML_HEADER_ID) sawHeader = true;
    if (element.id === SEGMENT_ID) {
      // the Segment carries Info, Tracks and the Clusters — walk its children
      let child = element.bodyStart;
      while (child < element.end) {
        const inner = readElement(view, child, element.end);
        demuxInfo(view, inner, state);
        demuxTracks(view, inner, state);
        demuxCluster(view, bytes, inner, state);
        child = inner.end;
      }
    }
    offset = element.end;
  }
  if (!sawHeader) throw new WebmError("webmencoder: the stream carries no EBML header");
  if (state.width < 1 || state.height < 1) {
    throw new WebmError("webmencoder: the stream carries no video track dimensions");
  }
  return {
    width: state.width,
    height: state.height,
    codecId: state.codecId,
    durationSeconds: (state.durationMs * state.timecodeScaleMs) / 1000,
    timecodeScaleMs: state.timecodeScaleMs,
    frames: state.frames.sort((left, right) => left.timestampMs - right.timestampMs),
  };
}

/** the demux state every segment child writes (the one mutable cell of the walk). */
interface DemuxState {
  timecodeScaleMs: number;
  durationMs: number;
  width: number;
  height: number;
  codecId: string;
  frames: WebmDecodedFrame[];
}

/** reads one Info element (the clock: TimecodeScale + Duration) when the child is one. */
function demuxInfo(view: DataView, element: { id: number; bodyStart: number; end: number }, state: DemuxState): void {
  if (element.id !== 0x1549a966) return;
  let cursor = element.bodyStart;
  while (cursor < element.end) {
    const child = readElement(view, cursor, element.end);
    if (child.id === 0x2ad7b1) state.timecodeScaleMs = readUint(view, child.bodyStart, child.end) / 1_000_000;
    if (child.id === 0x4489 && child.end - child.bodyStart === 8) {
      state.durationMs = view.getFloat64(child.bodyStart, false);
    }
    cursor = child.end;
  }
}

/** reads one Tracks element (the first video TrackEntry facts) when the child is one. */
function demuxTracks(view: DataView, element: { id: number; bodyStart: number; end: number }, state: DemuxState): void {
  if (element.id !== 0x1654ae6b) return;
  let cursor = element.bodyStart;
  while (cursor < element.end) {
    const entry = readElement(view, cursor, element.end);
    if (entry.id === 0xae) {
      let inner = entry.bodyStart;
      while (inner < entry.end) {
        const field = readElement(view, inner, entry.end);
        if (field.id === 0x86) {
          let text = "";
          for (let at = field.bodyStart; at < field.end; at += 1) text += String.fromCharCode(view.getUint8(at));
          state.codecId = text;
        }
        if (field.id === 0xe0) {
          let video = field.bodyStart;
          while (video < field.end) {
            const dim = readElement(view, video, field.end);
            if (dim.id === 0xb0) state.width = readUint(view, dim.bodyStart, dim.end);
            if (dim.id === 0xba) state.height = readUint(view, dim.bodyStart, dim.end);
            video = dim.end;
          }
        }
        inner = field.end;
      }
    }
    cursor = entry.end;
  }
}

/** reads one Cluster element (the timestamp base, then the SimpleBlock frames) when the child is one. */
function demuxCluster(
  view: DataView,
  bytes: Uint8Array,
  element: { id: number; bodyStart: number; end: number },
  state: DemuxState,
): void {
  if (element.id !== 0x1f43b675) return;
  let base = 0;
  let cursor = element.bodyStart;
  while (cursor < element.end) {
    const child = readElement(view, cursor, element.end);
    if (child.id === 0xe7) base = readUint(view, child.bodyStart, child.end);
    if (child.id === 0xa3) {
      if (child.end - child.bodyStart < 4) throw new WebmError("webmencoder: a SimpleBlock is too small to read");
      const relative = view.getInt16(child.bodyStart, false);
      const flags = view.getUint8(child.bodyStart + 2);
      const payload = bytes.subarray(child.bodyStart + 3, child.end);
      if (state.width < 1 || state.height < 1) {
        throw new WebmError("webmencoder: a Cluster rode before the TrackEntry named the dimensions");
      }
      let data: Uint8Array;
      try {
        data = new Uint8Array(inflateSync(payload));
      } catch (error) {
        throw new WebmError(`webmencoder: a frame payload does not inflate: ${(error as Error).message}`, {
          cause: error,
        });
      }
      if (data.length !== state.width * state.height * 4) {
        throw new WebmError(
          `webmencoder: a frame payload inflated to ${data.length} bytes, expected ${state.width * state.height * 4}`,
        );
      }
      state.frames.push({
        pixels: {
          width: state.width,
          height: state.height,
          data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.length),
        },
        timestampMs: base + relative,
        keyframe: (flags & 0x80) !== 0,
      });
    }
    cursor = child.end;
  }
}
