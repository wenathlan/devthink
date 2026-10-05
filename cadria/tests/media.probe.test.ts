// # media.probe.test — honest unit tests for the container probe, runnable with the
// node built-in runner (no install, no dependencies):
//   node --test tests/media.probe.test.ts
// The fixtures are synthetic MP4 (ISO-BMFF) and WebM (EBML) heads built byte by byte
// below — no binary files, no canvas, no decoder.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { probeMedia, ProbeError } from "../media.probe.ts";

/** big-endian u32 bytes. */
function u32(value: number): number[] {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
}

/** big-endian u16 bytes. */
function u16(value: number): number[] {
  return [(value >> 8) & 0xff, value & 0xff];
}

/** the ascii bytes of a fourcc / CodecID / DocType. */
function ascii(text: string): number[] {
  return [...text].map((char) => char.charCodeAt(0));
}

/** one ISO-BMFF box: size, type, body. */
function mp4box(type: string, ...body: number[]): number[] {
  return [...u32(body.length + 8), ...ascii(type), ...body];
}

/** big-endian float64 bytes (EBML Duration / SamplingFrequency). */
function f64(value: number): number[] {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value);
  return [...new Uint8Array(view.buffer)];
}

/** one EBML element: id (with marker), size vint (marker dropped), body. */
function ebml(id: number[], ...body: number[]): number[] {
  const size = body.length;
  const sizeVint = size < 127 ? [0x80 | size] : [0x40 | (size >> 8), size & 0xff];
  return [...id, ...sizeVint, ...body];
}

/** EBML element ids the probe walks. */
const ID = {
  ebml: [0x1a, 0x45, 0xdf, 0xa3],
  docType: [0x42, 0x82],
  segment: [0x18, 0x53, 0x80, 0x67],
  info: [0x15, 0x49, 0xa9, 0x66],
  timecodeScale: [0x2a, 0xd7, 0xb1],
  duration: [0x44, 0x89],
  tracks: [0x16, 0x54, 0xae, 0x6b],
  trackEntry: [0xae],
  trackType: [0x83],
  codecId: [0x86],
  video: [0xe0],
  pixelWidth: [0xb0],
  pixelHeight: [0xba],
  audio: [0xe1],
  samplingFrequency: [0xb5],
  channels: [0x9f],
};

/** builds a minimal MP4 head: ftyp + moov(mvhd, video trak, audio trak). */
function mp4Fixture(): Uint8Array {
  const ftyp = mp4box("ftyp", ...ascii("isom"), ...u32(512), ...ascii("isom"), ...ascii("mp42"));
  const mvhd = mp4box(
    "mvhd",
    0, 0, 0, 0, // version 0 + flags
    ...u32(0), ...u32(0), // creation, modification
    ...u32(1000), ...u32(3200), // timescale, duration → 3.2 s
    ...new Array<number>(80).fill(0), // rate/volume/matrix/predefined/next track id
  );
  const tkhd = (width: number, height: number) =>
    mp4box(
      "tkhd",
      0, 0, 0, 0, // version 0 + flags
      ...u32(0), ...u32(0), ...u32(1), ...u32(0), ...u32(3200), // ids and duration
      ...new Array<number>(8).fill(0), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...new Array<number>(36).fill(0), // matrix
      ...u32(width * 2 ** 16), ...u32(height * 2 ** 16), // fixed 16.16 extent
    );
  const mdhd = (timescale: number, duration: number) =>
    mp4box("mdhd", 0, 0, 0, 0, ...u32(0), ...u32(0), ...u32(timescale), ...u32(duration), ...u16(0), ...u16(0));
  const hdlr = (handler: string) => mp4box("hdlr", 0, 0, 0, 0, ...u32(0), ...ascii(handler), 0);
  const stsd = (entry: number[]) => mp4box("stsd", 0, 0, 0, 0, ...u32(1), ...entry);
  const avc1 = mp4box(
    "avc1",
    ...new Array<number>(6).fill(0), ...u16(1), // reserved, data reference
    ...u16(0), ...u16(0), ...u32(0), ...u32(0), ...u32(0), // predefined/reserved
    ...u16(320), ...u16(240), // width, height
    ...u32(0x00480000), ...u32(0x00480000), ...u32(0), ...u16(1),
    ...new Array<number>(32).fill(0), ...u16(24), ...u16(0xffff),
  );
  const mp4a = mp4box(
    "mp4a",
    ...new Array<number>(6).fill(0), ...u16(1),
    ...u16(0), ...u16(0), ...u32(0), // version, revision, vendor
    ...u16(2), ...u16(16), ...u16(0), ...u16(0), // channels, sample size
    ...u32(48000 * 2 ** 16), // sample rate, 16.16 fixed
  );
  const trak = (extent: [number, number], timescale: number, duration: number, handler: string, entry: number[]) =>
    mp4box(
      "trak",
      ...tkhd(...extent),
      ...mp4box("mdia", ...mdhd(timescale, duration), ...hdlr(handler), ...mp4box("minf", ...mp4box("stbl", ...stsd(entry)))),
    );
  const moov = mp4box("moov", ...mvhd, ...trak([320, 240], 1000, 3200, "vide", avc1), ...trak([0, 0], 48000, 153600, "soun", mp4a));
  return Uint8Array.from([...ftyp, ...moov]);
}

/** builds a minimal WebM head: EBML(DocType) + Segment(Info, Tracks). */
function webmFixture(): Uint8Array {
  const header = ebml(ID.ebml, ...ebml(ID.docType, ...ascii("webm")));
  const info = ebml(ID.info, ...ebml(ID.timecodeScale, ...u32(1_000_000)), ...ebml(ID.duration, ...f64(3200)));
  const videoTrack = ebml(
    ID.trackEntry,
    ...ebml(ID.trackType, 0x01),
    ...ebml(ID.codecId, ...ascii("V_VP9")),
    ...ebml(ID.video, ...ebml(ID.pixelWidth, ...u16(320)), ...ebml(ID.pixelHeight, ...u16(240))),
  );
  const audioTrack = ebml(
    ID.trackEntry,
    ...ebml(ID.trackType, 0x02),
    ...ebml(ID.codecId, ...ascii("A_OPUS")),
    ...ebml(ID.audio, ...ebml(ID.samplingFrequency, ...f64(48000)), ...ebml(ID.channels, 0x02)),
  );
  const segment = ebml(ID.segment, ...info, ...ebml(ID.tracks, ...videoTrack, ...audioTrack));
  return Uint8Array.from([...header, ...segment]);
}

describe("media.probe mp4", () => {
  const probe = probeMedia(mp4Fixture());

  it("answers the container, brands and movie duration", () => {
    assert.equal(probe.container, "mp4");
    assert.equal(probe.brand, "isom");
    assert.deepEqual(probe.brands, ["isom", "mp42"]);
    assert.equal(probe.durationSeconds, 3.2);
  });

  it("answers one row per stream with codec and layout", () => {
    assert.equal(probe.tracks.length, 2);
    const [video, audio] = probe.tracks;
    assert.equal(video.kind, "video");
    assert.equal(video.codec, "avc1");
    assert.equal(video.width, 320);
    assert.equal(video.height, 240);
    assert.equal(video.durationSeconds, 3.2);
    assert.equal(audio.kind, "audio");
    assert.equal(audio.codec, "mp4a");
    assert.equal(audio.channels, 2);
    assert.equal(audio.sampleRate, 48000);
    assert.equal(audio.durationSeconds, 3.2);
  });

  it("feeds the transcode planner as a source", async () => {
    const { buildTranscodePlan } = await import("../transcode.plan.ts");
    const source = {
      width: probe.tracks[0].width ?? 0,
      height: probe.tracks[0].height ?? 0,
      durationSeconds: probe.durationSeconds,
      fps: 30,
      videoCodec: probe.tracks[0].codec,
      audioCodec: probe.tracks[1].codec,
    };
    const plan = buildTranscodePlan(source, [
      { id: "240p", height: 240, videoCodec: "avc1", audioCodec: "mp4a", videoBitrate: "400K", audioBitrate: "64K" },
    ]);
    assert.equal(plan.variants[0].width, 320);
    assert.equal(plan.variants[0].height, 240);
  });
});

describe("media.probe webm", () => {
  const probe = probeMedia(webmFixture());

  it("answers the container, doctype and clock math", () => {
    assert.equal(probe.container, "webm");
    assert.equal(probe.brand, "webm");
    assert.equal(probe.durationSeconds, 3.2);
  });

  it("answers both tracks with their EBML codecs and layouts", () => {
    assert.equal(probe.tracks.length, 2);
    const [video, audio] = probe.tracks;
    assert.equal(video.codec, "V_VP9");
    assert.equal(video.width, 320);
    assert.equal(video.height, 240);
    assert.equal(audio.codec, "A_OPUS");
    assert.equal(audio.sampleRate, 48000);
    assert.equal(audio.channels, 2);
  });
});

describe("media.probe errors", () => {
  it("rejects buffers too small to probe", () => {
    assert.throws(() => probeMedia(new Uint8Array(8)), ProbeError);
  });

  it("rejects unknown containers with a typed error", () => {
    assert.throws(() => probeMedia(new Uint8Array(64)), ProbeError);
  });

  it("rejects truncated box structure", () => {
    const ftyp = mp4box("ftyp", ...ascii("isom"), ...u32(512));
    const truncated = Uint8Array.from([...ftyp.slice(0, 10)]);
    assert.throws(() => probeMedia(truncated), ProbeError);
  });
});
