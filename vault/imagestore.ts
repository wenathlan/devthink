// # imagestore.ts — the image pipeline seat of the vault (the pr9 law the
// owner charged: standardize the images the neo.img references pin, validate
// the DPI and the MIME type of every deposit, and store through the real
// object ledger — never the rehearsal shelf). the module carries three
// honest layers:
//
//   the pure validators  the magic-byte mime sniffer (png, jpeg, webp, gif,
//                        svg), the density readers (the png pHYs chunk, the
//                        jpeg JFIF APP0 density block) and the dimension
//                        gates — zero dependencies, the browser lanes may
//                        inline them exactly the way objectface rides the
//                        page cores.
//   the standardizer     the sharp lane (node-only, lazy): metadata reads,
//                        the webp conversion the neo.img standard demands
//                        and the thumbnail ladder. sharp is the pinned
//                        dependency the manifest always carried — this seat
//                        is the first real import.
//   the store lane       putImage: validate the bytes, standardize when
//                        asked, deposit through putObject (the real ledger
//                        — the 256KB chunk pipeline, the sha-256 manifests,
//                        the quota gates) and answer the image facts the
//                        explore pages read.
//
// THE VISITOR LAW (the family constitution): nothing here ever touches the
// visitor machine — the pipeline runs inside the vault engine on the
// self-hosted edge, the sharp lane owns every cycle it spends on the
// engine's own infrastructure.
//
// the density law: the DPI the owner charges answers from the bytes
// themselves — the png pHYs chunk carries pixels-per-meter (the 0.0254
// constant converts to inches), the jpeg JFIF block carries either dpi
// directly (unit 1) or dots-per-centimeter (unit 2, the 2.54 conversion),
// and every format without an embedded density answers the honest 72
// default (the css/svg reference density) — never a guess above it.

import { sha256Hex } from "./sha.ts";

/** the image mime kinds the sniffer answers, mapped from magic bytes. */
export type SniffedMime = "image/png" | "image/jpeg" | "image/webp" | "image/gif" | "image/svg+xml";

/** the density facts of one image read from its own bytes. */
export interface ImageDensity {
  /** the dots per inch the bytes carry (the 72 default when nothing embeds one). */
  dpi: number;
  /** where the density answered from — the honest provenance. */
  source: "png-pHYs" | "jpeg-jfif" | "svg-default" | "format-default";
}

/** the width and height an image declares, in pixels. */
export interface ImageDimensions {
  width: number;
  height: number;
}

/** the refusal the validation answers: why the bytes are not a storable image. */
export type ImageRefusal =
  | { kind: "empty"; why: string }
  | { kind: "not-an-image"; why: string; sniffed: SniffedMime | null }
  | { kind: "mime-mismatch"; why: string; claimed: string; sniffed: SniffedMime }
  | { kind: "too-large"; why: string; size: number; limit: number }
  | { kind: "density-absurd"; why: string; dpi: number }
  | { kind: "dimensions-absurd"; why: string }
  | { kind: "processor-absent"; why: string };

/** the validated facts of one image deposit. */
export interface ImageFacts {
  /** the sniffed mime (the bytes' own truth, never the claimed label). */
  mime: SniffedMime;
  /** the density read from the bytes. */
  density: ImageDensity;
  /** the pixel dimensions (the header read; sharp refines when asked). */
  dimensions: ImageDimensions | null;
  /** the byte size of the deposit. */
  size: number;
  /** the whole-bytes sha-256 the ledger seals. */
  digest: string;
}

/** the answer of the put lane: the sealed object with its image facts, or the refusal. */
export type PutImageAnswer =
  | { object: import("./objects.ts").LedgerObject; facts: ImageFacts; standardized: boolean }
  | { refusal: ImageRefusal | import("./objects.ts").LedgerRefusal };

/** the hard ceiling of one image deposit (the 32MB seat the image lane rides). */
export const IMAGE_MAX_BYTES = 32 * 1024 * 1024;

/** the honest dpi range the density law accepts — below 1 and above 2400 never answers a real device. */
export const DPI_FLOOR = 1;
export const DPI_CEILING = 2400;

/** the dimension ceiling (the 12000px seat — larger than any panel the family renders). */
export const IMAGE_MAX_DIMENSION = 12000;

/** the standard output of the neo.img conversion lane. */
export const STANDARD_IMAGE_MIME = "image/webp" as const;

/** the thumbnail widths the explore ladder answers (the neo.img grid seats). */
export const THUMB_WIDTHS = [96, 192, 384, 768] as const;

/* ── the pure mime sniffer — the magic bytes are the only truth ── */

/**
 * Sniffs the image mime from the bytes' magic numbers — the claimed
 * content-type label never enters the decision. Returns null when the
 * bytes answer none of the five image signatures.
 *
 * @param bytes the raw bytes of the deposit.
 * @returns the sniffed mime or null when nothing matches.
 */
export function sniffImageMime(bytes: Uint8Array): SniffedMime | null {
  if (bytes.length < 12) return null;
  // png: 89 50 4e 47 0d 0a 1a 0a
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  // jpeg: ff d8 ff
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  // gif: GIF8
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return "image/gif";
  }
  // webp: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  // svg: the text signature — an xml prolog or the svg root within the head
  const head = new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(0, 512)).trimStart().toLowerCase();
  if (head.startsWith("<?xml") || head.startsWith("<svg") || head.startsWith("<!doctype svg")) {
    if (head.includes("<svg")) return "image/svg+xml";
  }
  return null;
}

/* ── the density readers — the bytes carry the dpi, the law reads it ── */

/**
 * Reads the png IHDR dimensions — the width and height words of the first
 * chunk (big-endian at offsets 16 and 20 of the signature-true bytes).
 */
export function pngDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 24 || sniffImageMime(bytes) !== "image/png") return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

/**
 * Reads the png pHYs chunk — the physical pixel dimensions. The chunk
 * carries ppuX, ppuY and the unit byte (1 = meter); the 0.0254 constant
 * converts pixels-per-meter to dots-per-inch. Absent chunk → null.
 */
export function pngPhysDensity(bytes: Uint8Array): ImageDensity | null {
  if (sniffImageMime(bytes) !== "image/png") return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8; // past the signature
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
    if (type === "pHYs" && length >= 9 && offset + 8 + 9 <= bytes.length) {
      const ppuX = view.getUint32(offset + 8);
      const unit = bytes[offset + 16];
      if (unit === 1 && ppuX > 0) {
        return { dpi: Math.round(ppuX * 0.0254), source: "png-pHYs" };
      }
      return null; // unit 0 = unknown density — the honest null
    }
    offset += 12 + length; // length + type + data + crc
    if (length === 0 && type !== "IEND") offset += 0; // the loop guard: zero-length chunks still advance 12
  }
  return null;
}

/**
 * Reads the jpeg JFIF APP0 density block — the first APP0 marker (FFE0)
 * carrying the JFIF identifier. The unit byte says 1 (dpi, direct) or
 * 2 (dpcm, the 2.54 conversion). Absent block → null.
 */
export function jpegJfifDensity(bytes: Uint8Array): ImageDensity | null {
  if (sniffImageMime(bytes) !== "image/jpeg") return null;
  // the JFIF APP0 must sit at the head: ff d8 ff e0 <len:2> "JFIF\0"
  if (bytes.length < 20) return null;
  if (bytes[3] !== 0xe0) return null;
  if (
    bytes[6] !== 0x4a ||
    bytes[7] !== 0x46 ||
    bytes[8] !== 0x49 ||
    bytes[9] !== 0x46 ||
    bytes[10] !== 0x00
  ) {
    return null; // not a JFIF APP0 (exif-first jpegs answer null — the honest provenance)
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const units = bytes[13];
  const xdensity = view.getUint16(14);
  if (units === 1 && xdensity > 0) {
    return { dpi: xdensity, source: "jpeg-jfif" };
  }
  if (units === 2 && xdensity > 0) {
    return { dpi: Math.round(xdensity * 2.54), source: "jpeg-jfif" };
  }
  return null; // unit 0 = aspect ratio only — no density
}

/**
 * Reads the jpeg SOF dimensions — walks the markers to the first SOFn
 * (C0-CF except C4, C8, CC) and answers the height/height words.
 */
export function jpegDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (sniffImageMime(bytes) !== "image/jpeg") return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2; // past ff d8
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2; // standalone markers carry no length
      continue;
    }
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      // SOFn: <len:2> <precision:1> <height:2> <width:2>
      if (offset + 8 > bytes.length) return null;
      return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
    }
    const seglen = view.getUint16(offset + 2);
    if (seglen < 2) return null; // corrupt length word
    offset += 2 + seglen;
  }
  return null;
}

/**
 * Reads the density of any image — the format-appropriate reader with the
 * honest 72 default (the css reference density every format without an
 * embedded value answers).
 *
 * @param bytes the raw bytes of the image.
 * @returns the density facts with the provenance the law pins.
 */
export function readImageDensity(bytes: Uint8Array): ImageDensity {
  const png = pngPhysDensity(bytes);
  if (png !== null) return png;
  const jpeg = jpegJfifDensity(bytes);
  if (jpeg !== null) return jpeg;
  const sniffed = sniffImageMime(bytes);
  if (sniffed === "image/svg+xml") return { dpi: 72, source: "svg-default" };
  return { dpi: 72, source: "format-default" };
}

/**
 * Reads the header dimensions of any image — png and jpeg walk their own
 * structures, webp answers the vp8/vp8l/vp8x frames are left to the sharp
 * lane (null here, refined when the processor is present).
 */
export function readImageDimensions(bytes: Uint8Array): ImageDimensions | null {
  const png = pngDimensions(bytes);
  if (png !== null) return png;
  return jpegDimensions(bytes);
}

/* ── the validation gate — every deposit walks it ── */

/**
 * Validates the image bytes against the pr9 law: the magic-byte sniff (the
 * claimed mime must match the bytes' own signature), the size ceiling, the
 * density range and the dimension ceiling.
 *
 * @param bytes the raw bytes of the deposit.
 * @param claimedMime the content-type the deposit rode with.
 * @param limit the byte ceiling (defaults to the 32MB seat).
 * @returns the sniffed mime when the bytes pass, or the refusal.
 */
export function validateImage(
  bytes: Uint8Array,
  claimedMime: string,
  limit: number = IMAGE_MAX_BYTES,
): { mime: SniffedMime } | { refusal: ImageRefusal } {
  if (bytes.length === 0) {
    return { refusal: { kind: "empty", why: "the deposit carries no bytes" } };
  }
  if (bytes.length > limit) {
    return {
      refusal: { kind: "too-large", why: `the image is ${bytes.length} bytes — the seat accepts ${limit}`, size: bytes.length, limit },
    };
  }
  const sniffed = sniffImageMime(bytes);
  if (sniffed === null) {
    return { refusal: { kind: "not-an-image", why: "the bytes answer none of the five image signatures", sniffed: null } };
  }
  if (claimedMime !== sniffed) {
    return {
      refusal: {
        kind: "mime-mismatch",
        why: `the deposit claims "${claimedMime}" but the bytes answer "${sniffed}"`,
        claimed: claimedMime,
        sniffed,
      },
    };
  }
  const density = readImageDensity(bytes);
  if (density.dpi < DPI_FLOOR || density.dpi > DPI_CEILING) {
    return {
      refusal: { kind: "density-absurd", why: `the embedded density ${density.dpi} dpi sits outside the honest ${DPI_FLOOR}-${DPI_CEILING} range`, dpi: density.dpi },
    };
  }
  const dims = readImageDimensions(bytes);
  if (dims !== null && (dims.width > IMAGE_MAX_DIMENSION || dims.height > IMAGE_MAX_DIMENSION)) {
    return {
      refusal: {
        kind: "dimensions-absurd",
        why: `the image is ${dims.width}x${dims.height} — the seat accepts ${IMAGE_MAX_DIMENSION}px per side`,
      },
    };
  }
  return { mime: sniffed };
}

/* ── the sharp lane — node-only, lazy, the pinned dependency made real ── */

/** the loaded sharp callable the lane answers (never imported at the top — the browser lanes never feel it). */
type SharpModule = typeof import("sharp").default;

let sharpseat: SharpModule | null | undefined;

async function sharpopen(): Promise<SharpModule | null> {
  if (sharpseat !== undefined) return sharpseat;
  sharpseat = null;
  if (typeof process === "undefined" || !process.versions?.node) return sharpseat;
  try {
    const mod = (await import("sharp")) as unknown as { default?: unknown };
    const seat = typeof mod.default === "function" ? mod.default : mod;
    sharpseat = typeof seat === "function" ? (seat as SharpModule) : null;
  } catch {
    sharpseat = null; // the honest absence — the pure lanes still answer
  }
  return sharpseat;
}

/** the standardization answer of the neo.img lane. */
export interface StandardizeAnswer {
  /** the converted bytes (webp, the family standard). */
  bytes: Uint8Array;
  /** the standard mime the converted bytes answer. */
  mime: typeof STANDARD_IMAGE_MIME;
  /** the dimensions of the converted image. */
  dimensions: ImageDimensions;
}

/**
 * Standardizes one image to the neo.img law: the webp conversion (quality
 * 82, effort 4 — the trylle-grade compression seat), with the density
 * re-stamped 144 (the retina reference the explore grid renders). The svg
 * signatures never rasterize — the vector is already the standard.
 *
 * @param bytes the validated image bytes.
 * @returns the converted deposit or the refusal when the processor is absent.
 */
export async function standardizeImage(bytes: Uint8Array): Promise<StandardizeAnswer | { refusal: ImageRefusal }> {
  const sniffed = sniffImageMime(bytes);
  if (sniffed === "image/svg+xml") {
    return { refusal: { kind: "processor-absent", why: "the svg signature never rasterizes — the vector is the standard" } };
  }
  const sharp = await sharpopen();
  if (sharp === null) {
    return { refusal: { kind: "processor-absent", why: "the sharp processor is absent from this runtime — the pure lanes still validate" } };
  }
  try {
    const pipeline = sharp(Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength), { density: 144 });
    const converted = await pipeline.webp({ quality: 82, effort: 4 }).toBuffer({ resolveWithObject: true });
    return {
      bytes: new Uint8Array(converted.data),
      mime: STANDARD_IMAGE_MIME,
      dimensions: { width: converted.info.width, height: converted.info.height },
    };
  } catch (error) {
    return {
      refusal: { kind: "not-an-image", why: `the processor refused the bytes: ${(error as Error).message}`, sniffed },
    };
  }
}

/**
 * Renders one thumbnail of the deposit at the asked width (the explore
 * grid ladder). The svg signatures answer the refusal — thumbnails of
 * vectors are a copy, not a render.
 *
 * @param bytes the validated image bytes.
 * @param width the thumbnail width (the THUMB_WIDTHS ladder).
 * @returns the webp thumbnail or the refusal.
 */
export async function imageThumb(
  bytes: Uint8Array,
  width: number,
): Promise<{ bytes: Uint8Array; dimensions: ImageDimensions } | { refusal: ImageRefusal }> {
  const sniffed = sniffImageMime(bytes);
  if (sniffed === "image/svg+xml") {
    return { refusal: { kind: "processor-absent", why: "the svg signature never rasterizes into a thumbnail" } };
  }
  const sharp = await sharpopen();
  if (sharp === null) {
    return { refusal: { kind: "processor-absent", why: "the sharp processor is absent from this runtime" } };
  }
  try {
    const pipeline = sharp(Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength), { density: 144 });
    const converted = await pipeline
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    return {
      bytes: new Uint8Array(converted.data),
      dimensions: { width: converted.info.width, height: converted.info.height },
    };
  } catch (error) {
    return {
      refusal: { kind: "not-an-image", why: `the processor refused the bytes: ${(error as Error).message}`, sniffed },
    };
  }
}

/* ── the store lane — the real ledger under the image facts ── */

/** the deposit the image store accepts. */
export interface PutImageInput {
  /** the owning project (the ledger's gate — the project must exist). */
  projectId: string;
  /** the repository-relative absolute path the image answers at. */
  path: string;
  /** the content type the deposit claims (validated against the magic bytes). */
  mime: string;
  /** the real image bytes. */
  bytes: Uint8Array;
  /** the retention bucket (defaults to the site-assets seat the neo.img lane rides). */
  bucket?: string;
  /** standardize to the webp law before storing (defaults true — the pr9 standardization). */
  standardize?: boolean;
}

/**
 * Deposits one image through the full law: the magic-byte validation (the
 * claimed mime must match the bytes' own signature), the density read, the
 * optional webp standardization (the neo.img law) and the real ledger put
 * (the 256KB chunk pipeline, the quota gate, the sha-256 manifest).
 *
 * @param input the image deposit.
 * @returns the sealed object with its image facts, or the refusal.
 */
export async function putImage(input: PutImageInput): Promise<PutImageAnswer> {
  const gate = validateImage(input.bytes, input.mime);
  if ("refusal" in gate) return { refusal: gate.refusal };
  let bytes = input.bytes;
  let mime: string = gate.mime;
  let standardized = false;
  let dims = readImageDimensions(input.bytes);
  if (input.standardize !== false) {
    const converted = await standardizeImage(input.bytes);
    if ("refusal" in converted) {
      // the honest split: the processor-absent refusals keep the original
      // bytes (the pure lanes still deposit); the not-an-image refusal
      // never reaches here — the gate already answered it.
      if (converted.refusal.kind !== "processor-absent") {
        return { refusal: converted.refusal };
      }
    } else {
      bytes = converted.bytes;
      mime = converted.mime;
      dims = converted.dimensions;
      standardized = true;
    }
  }
  const { putObject } = await import("./objects.ts");
  const answer = putObject({ projectId: input.projectId, path: input.path, mime, bytes, bucket: input.bucket ?? "site-assets" });
  if ("refusal" in answer) return { refusal: answer.refusal };
  const facts: ImageFacts = {
    mime: gate.mime,
    density: readImageDensity(input.bytes),
    dimensions: dims,
    size: input.bytes.length,
    digest: standardized ? answer.object.digest : sha256Hex(input.bytes),
  };
  return { object: answer.object, facts, standardized };
}
