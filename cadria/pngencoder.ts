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

import { deflateSync, inflateSync } from "node:zlib";
import type { PixelImage } from "./pixel.ts";

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
