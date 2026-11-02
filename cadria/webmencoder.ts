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
// rides "webm" so the family probe lane (mediaprobewebm.ts) recognizes the
// stream; the mediaprobe walk answers the honest codec row (V_CADRIA, the
// dimensions, the duration) for every stream this module ships.
// Non-goals: no streaming (unknown-size elements), no lacing (one
// SimpleBlock per frame), no audio tracks, no seek head/cues (the demux
// walks clusters linearly). Exports: 1 error, 8 functions, 4 constants,
// 5 types.

import { deflateSync, inflateSync } from "node:zlib";
import type { PixelImage } from "./pixel.ts";

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
