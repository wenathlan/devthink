// # mediaprobemp4 — the ISO-BMFF half of the container probe: an MP4 head in, the
// moov facts out. Pure TypeScript over typed arrays — zero DOM, zero external package.
// The walk goes ftyp (brands) → moov → mvhd (movie clock) → trak → tkhd (extent) +
// mdia → mdhd (track clock) + hdlr (vide/soun) + minf → stbl → stsd (codec and the
// sample entry layout), following the box discipline of remotion's media-parser.

import {
  asciiAt,
  finishTracks,
  type MediaProbe,
  type MediaTrackKind,
  type MediaTrackMeta,
  ProbeError,
} from "./mediaprobe.ts";

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
