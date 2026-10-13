// # wavwriter — the riff/wave encoder of the katexis engine (root layer): one call turns the
// channel buses a render owns into the exact bytes a .wav file carries — interleaved, clamped
// to full scale, little-endian, with the chunk sizes the format pins. The export seam of wave
// b2 promised deterministic bytes for a given take, so the writer is dependency-free and the
// same call runs in the studio (browser) and in node (these tests); wavInfo parses the same
// headers back so every contract is provable from the bytes alone. Pure — zero DOM, zero audio.

/** The machine readable failure codes of the wav writer. */
export type WavErrorCode =
  | "bad-magic"
  | "bad-rate"
  | "bad-channels"
  | "bad-depth"
  | "bad-shape"
  | "bad-duration"
  | "empty-audio"
  | "bad-truncation"
  | "no-fmt"
  | "no-data"
  | "oversize";

/** The typed wav failure, traceable to a machine code. */
export class WavError extends Error {
  /** Machine readable failure code. */
  readonly code: WavErrorCode;

  constructor(code: WavErrorCode, message?: string) {
    super(message ?? `wav ${code}`);
    this.name = "WavError";
    this.code = code;
  }
}

/** The bit depths the writer speaks; 32 always encodes IEEE float32 (the fmt code carries the truth). */
export type WavBitDepth = 16 | 24 | 32;

/** The format ids the table names (the options speak in depths, the chunk speaks in codes). */
export type WavFormatId = "pcm16" | "pcm24" | "float32";

/** One row of the format table: the numbers the fmt chunk and the quantizer read. */
export interface WavFormatRow {
  /** The format code written into the fmt chunk (1 = PCM integer, 3 = IEEE float). */
  formatCode: number;
  /** The bits per sample the fmt chunk declares. */
  bitsPerSample: number;
  /** The bytes one sample occupies in the data chunk. */
  bytesPerSample: number;
  /** The integer code of full scale after the clamp (the negative rail sits one below). */
  fullScale: number;
  /** Whether the samples are IEEE floats. */
  isFloat: boolean;
}

/** The format table — the single place a depth is translated into bytes and codes. */
export const WAV_FORMAT: Record<WavFormatId, WavFormatRow> = {
  pcm16: { formatCode: 1, bitsPerSample: 16, bytesPerSample: 2, fullScale: 32767, isFloat: false },
  pcm24: { formatCode: 1, bitsPerSample: 24, bytesPerSample: 3, fullScale: 8388607, isFloat: false },
  float32: { formatCode: 3, bitsPerSample: 32, bytesPerSample: 4, fullScale: 0, isFloat: true },
};

/** Maps the options depth onto the format table (32f is the float32 row). */
const BITDEPTH_TO_FORMAT: Partial<Record<number, WavFormatId>> = { 16: "pcm16", 24: "pcm24", 32: "float32" };

/** The byte layout of the file (every multi-byte field little-endian):
 *  - riff : "RIFF" at 0, size at 4 (every byte that follows the field), "WAVE" at 8 — 12 bytes
 *  - fmt  : "fmt " at 12, content size at 16 (16 pcm / 18 float, the float one closes with cbSize = 0), fields at 20
 *  - data : "data" at 12 + 8 + fmtContent, size at +4, samples at +8
 */
export const HEADER_LAYOUT = {
  riffBytes: 12,
  chunkHeaderBytes: 8,
  fmtContentPcm: 16,
  fmtContentFloat: 18,
  /** The classic 44-byte pcm header: where a mono pcm payload starts. */
  pcmPayloadOffset: 44,
  /** The 46-byte float header: where a mono float payload starts. */
  floatPayloadOffset: 46,
} as const;

/** The session rate band the encoder accepts (the mastering spec rides 48000). */
export const SAMPLE_RATE_MIN = 8000;
/** The ceiling of the session rate band. */
export const SAMPLE_RATE_MAX = 192000;
/** The channel count the desk bounces (a stem is 1, a mix is 2). */
export const CHANNELS_MIN = 1;
/** The ceiling of the channel count. */
export const CHANNELS_MAX = 8;
/** The export seam caps a bounce at 50 MB before encoding (the documented product rule). */
export const EXPORT_SIZE_LIMIT_BYTES = 52428800;
/** The longest session the validator answers coherent, in seconds (a sanity ceiling, not a format one). */
export const MAX_DURATION_SECONDS = 3600;

/** The options encodeWav accepts. */
export interface WavOptions {
  /** The session sample rate in Hz (8000..192000). */
  sampleRate: number;
  /** The target depth: 16, 24 or 32 (32 = IEEE float32). */
  bitDepth: WavBitDepth;
}

/** The facts wavInfo reads back out of the bytes. */
export interface WavInfo {
  /** The declared sample rate in Hz. */
  sampleRate: number;
  /** The declared channel count. */
  channels: number;
  /** The declared bits per sample. */
  bitDepth: number;
  /** The frame count the data chunk carries. */
  frames: number;
  /** The exact play time: frames / sampleRate. */
  durationSeconds: number;
  /** Whether the fmt chunk declares IEEE float (code 3). */
  isFloat: boolean;
}

/** One validateEncoding verdict: the machine code plus a human line. */
export interface WavProblem {
  /** The machine readable failure code. */
  code: WavErrorCode;
  /** The human readable line. */
  message: string;
}

/** Clamps one sample into full scale; the anti-NaN law turns garbage into silence, never a corrupt word. */
function clampSample(sample: number): number {
  if (!Number.isFinite(sample)) return 0;
  return Math.min(1, Math.max(-1, sample));
}

/** Folds the buses into one interleaved float frame stream (frame-major, the wav order). */
function interleave(channels: readonly Float32Array[]): Float32Array {
  const frames = channels[0].length;
  const stream = new Float32Array(frames * channels.length);
  for (let frame = 0; frame < frames; frame++) {
    for (let channel = 0; channel < channels.length; channel++) {
      stream[frame * channels.length + channel] = clampSample(channels[channel][frame]);
    }
  }
  return stream;
}

/** The shared pre-encode assertions: shape, channel count and rate, thrown with machine codes. */
function assertShape(channels: readonly Float32Array[], sampleRate: number): void {
  if (!Number.isInteger(sampleRate) || sampleRate < SAMPLE_RATE_MIN || sampleRate > SAMPLE_RATE_MAX) {
    throw new WavError("bad-rate", `wav needs a rate inside ${SAMPLE_RATE_MIN}..${SAMPLE_RATE_MAX}, got ${sampleRate}`);
  }
  if (channels.length < CHANNELS_MIN || channels.length > CHANNELS_MAX) {
    throw new WavError("bad-channels", `wav carries ${CHANNELS_MIN}..${CHANNELS_MAX} channels, got ${channels.length}`);
  }
  const frames = channels[0].length;
  if (frames === 0) throw new WavError("empty-audio", "wav needs at least one frame per channel");
  for (const channel of channels) {
    if (channel.length !== frames)
      throw new WavError("bad-shape", `wav channels disagree (${channel.length} vs ${frames})`);
  }
}

/** Quantizes one clamped sample to the integer code of a depth (fullScale, with the negative rail one below). */
function quantize(sample: number, fullScale: number): number {
  return Math.min(fullScale, Math.max(-fullScale - 1, Math.round(sample * fullScale)));
}

/** Writes ascii magic straight into the byte array. */
function writeAscii(bytes: Uint8Array, offset: number, text: string): void {
  for (let index = 0; index < text.length; index++) bytes[offset + index] = text.charCodeAt(index);
}

/** Reads ascii magic back out of the byte array. */
function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  let text = "";
  for (let index = 0; index < length; index++) text += String.fromCharCode(bytes[offset + index]);
  return text;
}

/** Assembles the full file for one depth: the riff/wave/fmt/data chunks plus the interleaved payload. */
function writeFormat(channels: readonly Float32Array[], sampleRate: number, depth: WavBitDepth): Uint8Array {
  assertShape(channels, sampleRate);
  const format = WAV_FORMAT[BITDEPTH_TO_FORMAT[depth] as WavFormatId];
  const count = channels.length;
  const interleaved = interleave(channels);
  const dataBytes = interleaved.length * format.bytesPerSample;
  const fmtContent = format.isFloat ? HEADER_LAYOUT.fmtContentFloat : HEADER_LAYOUT.fmtContentPcm;
  const total =
    HEADER_LAYOUT.riffBytes + HEADER_LAYOUT.chunkHeaderBytes + fmtContent + HEADER_LAYOUT.chunkHeaderBytes + dataBytes;
  const bytes = new Uint8Array(total);
  const view = new DataView(bytes.buffer);

  writeAscii(bytes, 0, "RIFF");
  view.setUint32(4, total - 8, true);
  writeAscii(bytes, 8, "WAVE");

  writeAscii(bytes, 12, "fmt ");
  view.setUint32(16, fmtContent, true);
  view.setUint16(20, format.formatCode, true);
  view.setUint16(22, count, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * count * format.bytesPerSample, true);
  view.setUint16(32, count * format.bytesPerSample, true);
  view.setUint16(34, format.bitsPerSample, true);
  if (format.isFloat) view.setUint16(36, 0, true); // cbSize = 0: the float fmt chunk is exactly 18 bytes

  const dataHeaderAt = HEADER_LAYOUT.riffBytes + HEADER_LAYOUT.chunkHeaderBytes + fmtContent;
  writeAscii(bytes, dataHeaderAt, "data");
  view.setUint32(dataHeaderAt + 4, dataBytes, true);
  const payload = dataHeaderAt + HEADER_LAYOUT.chunkHeaderBytes;

  if (depth === 16) {
    for (let index = 0; index < interleaved.length; index++) {
      view.setInt16(payload + index * 2, quantize(interleaved[index], format.fullScale), true);
    }
  } else if (depth === 24) {
    for (let index = 0; index < interleaved.length; index++) {
      const code = quantize(interleaved[index], format.fullScale);
      const unsigned = code < 0 ? code + 16777216 : code;
      bytes[payload + index * 3] = unsigned & 0xff;
      bytes[payload + index * 3 + 1] = (unsigned >> 8) & 0xff;
      bytes[payload + index * 3 + 2] = (unsigned >> 16) & 0xff;
    }
  } else {
    for (let index = 0; index < interleaved.length; index++)
      view.setFloat32(payload + index * 4, interleaved[index], true);
  }
  return bytes;
}

/**
 * Encodes the channel buses into a complete wav file (pcm16, pcm24 or float32).
 *
 * @param channels the per-channel float buses, equal length, 1..8 of them.
 * @param options the sample rate and the target depth (32 = IEEE float32).
 * @returns the riff/wave bytes, ready to write or to hand to wavInfo.
 */
export function encodeWav(channels: readonly Float32Array[], options: WavOptions): Uint8Array {
  assertShape(channels, options.sampleRate);
  if (!BITDEPTH_TO_FORMAT[options.bitDepth])
    throw new WavError("bad-depth", `wav depth ${options.bitDepth} is not 16, 24 or 32f`);
  return writeFormat(channels, options.sampleRate, options.bitDepth);
}

/**
 * Encodes the buses as 16-bit PCM (format code 1).
 *
 * @param channels the per-channel float buses.
 * @param sampleRate the session rate in Hz.
 * @returns the wav bytes.
 */
export function writeWav16(channels: readonly Float32Array[], sampleRate: number): Uint8Array {
  return writeFormat(channels, sampleRate, 16);
}

/**
 * Encodes the buses as 24-bit PCM (format code 1, three bytes per sample).
 *
 * @param channels the per-channel float buses.
 * @param sampleRate the session rate in Hz.
 * @returns the wav bytes.
 */
export function writeWav24(channels: readonly Float32Array[], sampleRate: number): Uint8Array {
  return writeFormat(channels, sampleRate, 24);
}

/**
 * Encodes the buses as IEEE float32 (format code 3).
 *
 * @param channels the per-channel float buses.
 * @param sampleRate the session rate in Hz.
 * @returns the wav bytes.
 */
export function writeWav32f(channels: readonly Float32Array[], sampleRate: number): Uint8Array {
  return writeFormat(channels, sampleRate, 32);
}

/**
 * Parses the wav header back out of the bytes (the minimum the tests and the export surfaces need).
 *
 * @param bytes the file bytes.
 * @returns the rate, channel count, depth, frame count, duration and float flag.
 */
export function wavInfo(bytes: Uint8Array): WavInfo {
  if (bytes.length < HEADER_LAYOUT.riffBytes || readAscii(bytes, 0, 4) + readAscii(bytes, 8, 4) !== "RIFFWAVE") {
    throw new WavError("bad-magic", "wav needs the RIFF....WAVE magic in the first 12 bytes");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let fmt: { formatCode: number; channels: number; sampleRate: number; bitsPerSample: number } | null = null;
  let data: { size: number } | null = null;
  let cursor = HEADER_LAYOUT.riffBytes;
  while (cursor + HEADER_LAYOUT.chunkHeaderBytes <= bytes.length) {
    const id = readAscii(bytes, cursor, 4);
    const size = view.getUint32(cursor + 4, true);
    if (cursor + HEADER_LAYOUT.chunkHeaderBytes + size > bytes.length) {
      throw new WavError("bad-truncation", `chunk ${id.trim()} claims ${size} bytes past the buffer`);
    }
    if (id === "fmt ") {
      fmt = {
        formatCode: view.getUint16(cursor + 8, true),
        channels: view.getUint16(cursor + 10, true),
        sampleRate: view.getUint32(cursor + 12, true),
        bitsPerSample: view.getUint16(cursor + 22, true),
      };
    } else if (id === "data") {
      data = { size };
    }
    cursor += HEADER_LAYOUT.chunkHeaderBytes + size + (size % 2); // chunks pad to even lengths
  }
  if (fmt === null) throw new WavError("no-fmt", "wav carries no fmt chunk");
  if (data === null) throw new WavError("no-data", "wav carries no data chunk");
  const frames = Math.floor(data.size / (fmt.channels * (fmt.bitsPerSample / 8)));
  return {
    sampleRate: fmt.sampleRate,
    channels: fmt.channels,
    bitDepth: fmt.bitsPerSample,
    frames,
    durationSeconds: frames / fmt.sampleRate,
    isFloat: fmt.formatCode === 3,
  };
}

/**
 * Answers the export invariants before bytes exist: the rate band, the channel band, the shared
 * shape, the session length and the 50 MB cap. The encoder stays pure; this is the verdict.
 *
 * @param channels the per-channel float buses.
 * @param options the sample rate and the target depth.
 * @returns the problems found (an empty list is a sound export).
 */
export function validateEncoding(channels: readonly Float32Array[], options: WavOptions): WavProblem[] {
  const problems: WavProblem[] = [];
  const rate = options.sampleRate;
  if (!Number.isInteger(rate) || rate < SAMPLE_RATE_MIN || rate > SAMPLE_RATE_MAX) {
    problems.push({ code: "bad-rate", message: `rate ${rate} outside ${SAMPLE_RATE_MIN}..${SAMPLE_RATE_MAX}` });
  }
  if (channels.length < CHANNELS_MIN || channels.length > CHANNELS_MAX) {
    problems.push({
      code: "bad-channels",
      message: `${channels.length} channels outside ${CHANNELS_MIN}..${CHANNELS_MAX}`,
    });
  }
  const frames = channels.length > 0 ? channels[0].length : 0;
  if (channels.length > 0 && frames === 0) problems.push({ code: "empty-audio", message: "the buses carry no frames" });
  for (const channel of channels) {
    if (channel.length !== frames) problems.push({ code: "bad-shape", message: "the channels disagree in length" });
  }
  const durationSeconds = rate > 0 ? frames / rate : 0;
  if (!(durationSeconds > 0) || durationSeconds > MAX_DURATION_SECONDS) {
    problems.push({
      code: "bad-duration",
      message: `duration ${durationSeconds}s is not inside (0..${MAX_DURATION_SECONDS}]`,
    });
  }
  const formatId = BITDEPTH_TO_FORMAT[options.bitDepth];
  if (formatId === undefined) {
    problems.push({ code: "bad-depth", message: `depth ${options.bitDepth} is not 16, 24 or 32f` });
  } else {
    const format = WAV_FORMAT[formatId];
    const fmtBytes = format.isFloat ? HEADER_LAYOUT.fmtContentFloat : HEADER_LAYOUT.fmtContentPcm;
    const fileBytes = 20 + fmtBytes + frames * channels.length * format.bytesPerSample; // 20 = riff + both chunk headers
    if (fileBytes > EXPORT_SIZE_LIMIT_BYTES) {
      problems.push({
        code: "oversize",
        message: `a ${fileBytes} byte bounce passes the ${EXPORT_SIZE_LIMIT_BYTES} byte cap`,
      });
    }
  }
  return problems;
}
