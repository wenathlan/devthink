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

import type { PixelImage } from "./pixel.ts";

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
