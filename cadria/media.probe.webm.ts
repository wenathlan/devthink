// # media.probe.webm — the EBML half of the container probe: a WebM head in, the
// Segment facts out. Pure TypeScript over typed arrays — zero DOM, zero external
// package. The walk reads the EBML header (DocType) and the Segment body: Info
// (TimecodeScale + Duration, the clock math) and Tracks → TrackEntry (TrackType,
// CodecID, Video PixelWidth/PixelHeight, Audio SamplingFrequency/Channels).

import { asciiAt, finishTracks, ProbeError, type MediaProbe, type MediaTrackMeta } from "./media.probe.ts";

/** Reads one EBML vint (ids keep the marker bit, sizes drop it). */
function readVint(view: DataView, offset: number, limit: number, keepMarker: boolean): { value: number; end: number } {
  if (offset >= limit) throw new ProbeError("media.probe: truncated EBML header");
  const first = view.getUint8(offset);
  let length = 1;
  let mask = 0x80;
  while (length <= 8 && !(first & mask)) {
    length += 1;
    mask >>= 1;
  }
  if (length > 8 || offset + length > limit) throw new ProbeError("media.probe: unreadable EBML vint");
  let value = keepMarker ? first : first & (0xff >> length);
  for (let index = 1; index < length; index++) value = value * 256 + view.getUint8(offset + index);
  return { value, end: offset + length };
}

/** Reads an EBML element header (id + size) and answers the body range. */
function readEbmlElement(view: DataView, offset: number, limit: number): { id: number; bodyStart: number; end: number } {
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
function parseSegment(view: DataView, start: number, end: number, state: { timecodeScaleNs: number; durationTicks: number; tracks: Partial<MediaTrackMeta>[] }): void {
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
