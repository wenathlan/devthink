// # mediaprobe — the container metadata probe of the family, housed at the cadria root.
// Library-grade module shipped inside the published packages (npm, maven with the Spring
// Boot rider): it owns the domain types, the dispatch and both format walks — zero
// consumer data. Given the first bytes of a media file it answers the container, the
// duration and one row per stream (codec, dimensions or sample layout) — the shape
// transcodeplan.ts consumes as its SourceMedia. The format walks ride this one file as
// the two sections under the facade: the mp4 walk (the ISO-BMFF box tree) and the webm
// walk (the EBML headers), the two containers the walk of remotion's media-parser
// covers. Pure TypeScript over typed arrays — zero DOM, zero canvas, zero external
// package: the same probe runs in the browser (a fetched ArrayBuffer) and in node
// (bytes in the tests).

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

// ---- mp4 walk — the ISO-BMFF half of the probe: an MP4 head in, the moov facts
// out. The walk goes ftyp (brands) → moov → mvhd (movie clock) → trak → tkhd
// (extent) + mdia → mdhd (track clock) + hdlr (vide/soun) + minf → stbl → stsd
// (codec and the sample entry layout), following the box discipline of
// remotion's media-parser. ----

interface Mp4Box {
  type: string;
  bodyStart: number;
  end: number;
}

/** Reads one ISO-BMFF box header (32-bit and 64-bit sizes, size 0 = to the end). */
function readMp4Box(view: DataView, offset: number, limit: number): Mp4Box {
  if (offset + 8 > limit) throw new ProbeError(`mediaprobe: truncated box header at ${offset}`);
  const size = view.getUint32(offset);
  const type = asciiAt(view, offset + 4, 4);
  let header = 8;
  let end = offset + size;
  if (size === 1) {
    if (offset + 16 > limit) throw new ProbeError(`mediaprobe: truncated 64-bit size on "${type}"`);
    end = view.getUint32(offset + 8) * 2 ** 32 + view.getUint32(offset + 12);
    header = 16;
  } else if (size === 0) {
    end = limit;
  }
  if (end < offset + header || end > limit) throw new ProbeError(`mediaprobe: truncated "${type}" box`);
  return { type, bodyStart: offset + header, end };
}

/** Walks the children of an ISO-BMFF container body. */
function mp4Children(view: DataView, start: number, end: number, visit: (box: Mp4Box) => void): void {
  let offset = start;
  while (offset < end) {
    const box = readMp4Box(view, offset, end);
    visit(box);
    offset = box.end;
  }
}

/** Reads the timescale/duration pair of an mvhd/mdhd body (version 0 and 1). */
function readMediaTimes(view: DataView, bodyStart: number): { timescale: number; duration: number } {
  const version = view.getUint8(bodyStart);
  if (version === 1) {
    return {
      timescale: view.getUint32(bodyStart + 20),
      duration: view.getUint32(bodyStart + 24) * 2 ** 32 + view.getUint32(bodyStart + 28),
    };
  }
  return { timescale: view.getUint32(bodyStart + 12), duration: view.getUint32(bodyStart + 16) };
}

/** Reads width/height from the last 8 bytes of a tkhd body (fixed 16.16 point). */
function readTkhdExtent(view: DataView, box: Mp4Box): { width: number; height: number } {
  return { width: view.getUint32(box.end - 8) / 2 ** 16, height: view.getUint32(box.end - 4) / 2 ** 16 };
}

/**
 * Parses the first stsd entry: the codec fourcc plus, per kind, the sample
 * layout — VisualSampleEntry keeps width/height at body+24/+26, AudioSampleEntry
 * keeps channels at body+16 and the 16.16 sample rate at body+24.
 */
function readStsdEntry(view: DataView, stsd: Mp4Box, kind: MediaTrackKind): Partial<MediaTrackMeta> {
  const entry = readMp4Box(view, stsd.bodyStart + 8, stsd.end);
  const meta: Partial<MediaTrackMeta> = { codec: entry.type };
  const body = entry.end - entry.bodyStart;
  if (kind === "audio") {
    if (body >= 18) meta.channels = view.getUint16(entry.bodyStart + 16);
    if (body >= 28) meta.sampleRate = Math.round(view.getUint32(entry.bodyStart + 24) / 2 ** 16);
    return meta;
  }
  if (body >= 28) {
    meta.width = view.getUint16(entry.bodyStart + 24);
    meta.height = view.getUint16(entry.bodyStart + 26);
  }
  return meta;
}

/** Walks one trak subtree collecting its handler, times and sample layout. */
function readTrak(view: DataView, box: Mp4Box): Partial<MediaTrackMeta> {
  const meta: Partial<MediaTrackMeta> = {};
  let durationSeconds: number | undefined;
  mp4Children(view, box.bodyStart, box.end, (child) => {
    if (child.type === "tkhd") {
      const extent = readTkhdExtent(view, child);
      if (extent.width > 0) meta.width = extent.width;
      if (extent.height > 0) meta.height = extent.height;
      return;
    }
    if (child.type !== "mdia") return;
    mp4Children(view, child.bodyStart, child.end, (mdiaChild) => {
      if (mdiaChild.type === "mdhd") {
        const times = readMediaTimes(view, mdiaChild.bodyStart);
        if (times.timescale > 0) durationSeconds = times.duration / times.timescale;
        return;
      }
      if (mdiaChild.type === "hdlr") {
        const handler = asciiAt(view, mdiaChild.bodyStart + 8, 4);
        if (handler === "vide") meta.kind = "video";
        if (handler === "soun") meta.kind = "audio";
        return;
      }
      if (mdiaChild.type === "minf") {
        mp4Children(view, mdiaChild.bodyStart, mdiaChild.end, (minfChild) => {
          if (minfChild.type !== "stbl") return;
          mp4Children(view, minfChild.bodyStart, minfChild.end, (stblChild) => {
            if (stblChild.type === "stsd") Object.assign(meta, readStsdEntry(view, stblChild, meta.kind ?? "video"));
          });
        });
      }
    });
  });
  if (durationSeconds !== undefined) meta.durationSeconds = durationSeconds;
  return meta;
}

/**
 * Parses an MP4 (ISO-BMFF) buffer: the ftyp brands, the mvhd movie clock and
 * one row per trak. Throws `ProbeError` when the moov is missing (a
 * fragmented or stripped file) or any box is truncated.
 *
 * @param view the data view over the file head.
 * @param limit the byte length the probe may walk.
 * @returns the media probe.
 */
export function probeMp4(view: DataView, limit: number): MediaProbe {
  let brand = "";
  let brands: string[] | undefined;
  let durationSeconds = 0;
  const tracks: Partial<MediaTrackMeta>[] = [];
  let sawMoov = false;
  mp4Children(view, 0, limit, (box) => {
    if (box.type === "ftyp") {
      brand = asciiAt(view, box.bodyStart, 4);
      const count = Math.floor((box.end - box.bodyStart - 8) / 4);
      brands = Array.from({ length: Math.max(0, count) }, (_, index) =>
        asciiAt(view, box.bodyStart + 8 + index * 4, 4),
      );
      return;
    }
    if (box.type === "moov") {
      sawMoov = true;
      mp4Children(view, box.bodyStart, box.end, (moovChild) => {
        if (moovChild.type === "mvhd") {
          const times = readMediaTimes(view, moovChild.bodyStart);
          if (times.timescale > 0) durationSeconds = times.duration / times.timescale;
          return;
        }
        if (moovChild.type === "trak") tracks.push(readTrak(view, moovChild));
      });
    }
  });
  if (!sawMoov) throw new ProbeError("mediaprobe: mp4 carries no moov box (fragmented or stripped file)");
  return {
    container: "mp4",
    brand,
    brands,
    durationSeconds,
    tracks: finishTracks(tracks),
  };
}

// ---- webm walk — the EBML half of the probe: a WebM head in, the Segment facts
// out. The walk reads the EBML header (DocType) and the Segment body: Info
// (TimecodeScale + Duration, the clock math) and Tracks → TrackEntry (TrackType,
// CodecID, Video PixelWidth/PixelHeight, Audio SamplingFrequency/Channels). ----

/** Reads one EBML vint (ids keep the marker bit, sizes drop it). */
function readVint(view: DataView, offset: number, limit: number, keepMarker: boolean): { value: number; end: number } {
  if (offset >= limit) throw new ProbeError("mediaprobe: truncated EBML header");
  const first = view.getUint8(offset);
  let length = 1;
  let mask = 0x80;
  while (length <= 8 && !(first & mask)) {
    length += 1;
    mask >>= 1;
  }
  if (length > 8 || offset + length > limit) throw new ProbeError("mediaprobe: unreadable EBML vint");
  let value = keepMarker ? first : first & (0xff >> length);
  for (let index = 1; index < length; index++) value = value * 256 + view.getUint8(offset + index);
  return { value, end: offset + length };
}

/** Reads an EBML element header (id + size) and answers the body range. */
function readEbmlElement(
  view: DataView,
  offset: number,
  limit: number,
): { id: number; bodyStart: number; end: number } {
  const id = readVint(view, offset, limit, true);
  const size = readVint(view, id.end, limit, false);
  const lengthBytes = size.end - id.end;
  const unknown = size.value === 2 ** (7 * lengthBytes) - 1;
  return { id: id.value, bodyStart: size.end, end: unknown ? limit : Math.min(size.end + size.value, limit) };
}

/** Reads a big-endian EBML uint of up to 8 bytes. */
function readEbmlUint(view: DataView, start: number, end: number): number {
  let value = 0;
  for (let offset = start; offset < end; offset++) value = value * 256 + view.getUint8(offset);
  return value;
}

/** Walks one TrackEntry: type, CodecID and the video/audio layout. */
function readTrackEntry(view: DataView, start: number, end: number): Partial<MediaTrackMeta> {
  const meta: Partial<MediaTrackMeta> = {};
  let cursor = start;
  while (cursor < end) {
    const child = readEbmlElement(view, cursor, end);
    if (child.id === 0x83) meta.kind = readEbmlUint(view, child.bodyStart, child.end) === 2 ? "audio" : "video";
    if (child.id === 0x86) meta.codec = asciiAt(view, child.bodyStart, child.end - child.bodyStart);
    if (child.id === 0xe0) {
      let inner = child.bodyStart;
      while (inner < child.end) {
        const field = readEbmlElement(view, inner, child.end);
        if (field.id === 0xb0) meta.width = readEbmlUint(view, field.bodyStart, field.end);
        if (field.id === 0xba) meta.height = readEbmlUint(view, field.bodyStart, field.end);
        inner = field.end;
      }
    }
    if (child.id === 0xe1) {
      let inner = child.bodyStart;
      while (inner < child.end) {
        const field = readEbmlElement(view, inner, child.end);
        if (field.id === 0xb5) meta.sampleRate = Math.round(view.getFloat64(field.bodyStart));
        if (field.id === 0x9f) meta.channels = readEbmlUint(view, field.bodyStart, field.end);
        inner = field.end;
      }
    }
    cursor = child.end;
  }
  return meta;
}

/** Walks the Segment body: Info carries the clock, Tracks the streams. */
function parseSegment(
  view: DataView,
  start: number,
  end: number,
  state: { timecodeScaleNs: number; durationTicks: number; tracks: Partial<MediaTrackMeta>[] },
): void {
  let cursor = start;
  while (cursor < end) {
    const element = readEbmlElement(view, cursor, end);
    if (element.id === 0x1549a966) {
      let inner = element.bodyStart;
      while (inner < element.end) {
        const child = readEbmlElement(view, inner, element.end);
        if (child.id === 0x2ad7b1) state.timecodeScaleNs = readEbmlUint(view, child.bodyStart, child.end);
        if (child.id === 0x4489) {
          state.durationTicks =
            child.end - child.bodyStart === 4 ? view.getFloat32(child.bodyStart) : view.getFloat64(child.bodyStart);
        }
        inner = child.end;
      }
    }
    if (element.id === 0x1654ae6b) {
      let inner = element.bodyStart;
      while (inner < element.end) {
        const entry = readEbmlElement(view, inner, element.end);
        if (entry.id === 0xae) state.tracks.push(readTrackEntry(view, entry.bodyStart, entry.end));
        inner = entry.end;
      }
    }
    cursor = element.end;
  }
}

/**
 * Parses a WebM (EBML) buffer: the DocType brand, the Segment clock
 * (Duration × TimecodeScale, 1µs default) and one row per TrackEntry.
 *
 * @param view the data view over the file head.
 * @param limit the byte length the probe may walk.
 * @returns the media probe.
 */
export function probeWebm(view: DataView, limit: number): MediaProbe {
  let brand = "webm";
  const state = { timecodeScaleNs: 1_000_000, durationTicks: 0, tracks: [] as Partial<MediaTrackMeta>[] };
  let offset = 0;
  while (offset < limit) {
    const element = readEbmlElement(view, offset, limit);
    if (element.id === 0x1a45dfa3) {
      // EBML header: the DocType names the subtype
      let cursor = element.bodyStart;
      while (cursor < element.end) {
        const child = readEbmlElement(view, cursor, element.end);
        if (child.id === 0x4282) brand = asciiAt(view, child.bodyStart, child.end - child.bodyStart);
        cursor = child.end;
      }
    }
    if (element.id === 0x18538067) parseSegment(view, element.bodyStart, element.end, state);
    offset = element.end;
  }
  return {
    container: "webm",
    brand,
    durationSeconds: state.durationTicks * (state.timecodeScaleNs / 1e9),
    tracks: finishTracks(state.tracks),
  };
}
