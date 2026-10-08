// # mediaprobe — the container metadata facade of the family, housed at the cadria root.
// Library-grade module shipped inside the published packages (npm, maven with the Spring
// Boot rider): it owns the domain types and the dispatch only — zero consumer data.
// Given the first bytes of a media file it answers the container, the duration and one
// row per stream (codec, dimensions or sample layout) — the shape transcodeplan.ts
// consumes as its SourceMedia. The format walk lives beside the facade: the MP4 half
// in mediaprobemp4.ts (the ISO-BMFF box tree) and the WebM half in
// mediaprobewebm.ts (the EBML headers), the two containers the walk of remotion's
// media-parser covers. Pure TypeScript over typed arrays — zero DOM, zero canvas,
// zero external package: the same probe runs in the browser (a fetched ArrayBuffer)
// and in node (bytes in the tests).
import { probeMp4 } from "./mediaprobemp4.ts";
import { probeWebm } from "./mediaprobewebm.ts";

/** The kinds of stream the probe answers for. */
export type MediaTrackKind = "video" | "audio";

/** One stream of a probed container. */
export interface MediaTrackMeta {
  /** the stream index inside the file, in file order */
  index: number;
  kind: MediaTrackKind;
  /** the codec fourcc (mp4: "avc1", "mp4a") or EBML CodecID (webm: "V_VP9") */
  codec: string;
  /** video only: the encoded dimensions */
  width?: number;
  height?: number;
  /** audio only */
  sampleRate?: number;
  channels?: number;
  /** the stream's own duration when the container carries it per track */
  durationSeconds?: number;
}

/** The metadata answer of one probe. */
export interface MediaProbe {
  container: "mp4" | "webm";
  /** mp4: the major brand ("isom"); webm: the DocType ("webm") */
  brand: string;
  /** mp4 only: the compatible brands list */
  brands?: string[];
  durationSeconds: number;
  tracks: MediaTrackMeta[];
}

/** Error raised for unknown containers and truncated structure. */
export class ProbeError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ProbeError";
  }
}

/** Reads an ASCII field of `length` bytes at an offset (shared by both walks). */
export function asciiAt(view: DataView, offset: number, length: number): string {
  let text = "";
  for (let index = 0; index < length; index++) text += String.fromCharCode(view.getUint8(offset + index));
  return text;
}

/** Normalizes the collected stream rows: indexes in file order, kinds and codecs filled. */
export function finishTracks(tracks: readonly Partial<MediaTrackMeta>[]): MediaTrackMeta[] {
  return tracks.map((meta, index) => ({
    ...meta,
    index,
    kind: meta.kind ?? "video",
    codec: meta.codec ?? "unknown",
  }));
}

/**
 * probeMedia — answers the container, duration and stream rows of a media
 * file from its first bytes. Accepts MP4 (ftyp + moov) and WebM (EBML);
 * anything else throws `ProbeError`. The answer feeds
 * transcodeplan.buildTranscodePlan as its SourceMedia.
 *
 * @param bytes the head of the file (moov at the front; a moov-at-end file
 *   needs its tail — the probe answers what the given bytes carry).
 * @returns the media probe.
 */
export function probeMedia(bytes: Uint8Array): MediaProbe {
  if (bytes.byteLength < 12) throw new ProbeError(`mediaprobe: ${bytes.byteLength} bytes is too small to probe`);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const limit = bytes.byteLength;
  if (asciiAt(view, 4, 4) === "ftyp") return probeMp4(view, limit);
  if (view.getUint32(0) === 0x1a45dfa3) return probeWebm(view, limit);
  throw new ProbeError("mediaprobe: unknown container (expected an ftyp box or an EBML header)");
}
