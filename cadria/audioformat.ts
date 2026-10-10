// # audioformat — the WAV (RIFF/WAVE) byte walk of the audiodecode module: header
// parse, chunk walk and sample decode over DataView, with every endian field read
// explicitly (RIFF is little-endian). The DSP half lives in audiodecode.ts — this
// file answers what the bytes say and hands back interleaved pcm; nothing here
// resamples, downmixes or normalizes.

/** The stable error of the decode surface: `code` stays machine-readable across versions. */
export class AudioDecodeError extends Error {
  /** stable machine code, e.g. "wav-not-riff" or "wav-truncated" */
  readonly code: string;
  constructor(code: string, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AudioDecodeError";
    this.code = code;
  }
}

/** The header answer of one wav probe — no samples touched. */
export interface WavInfo {
  /** frames per second */
  sampleRate: number;
  /** channel count of the interleaved data (1 = mono) */
  channels: number;
  /** container bit depth: 8 | 16 | 24 | 32 */
  bitDepth: number;
  /** true when the data chunk carries ieee float32 instead of integer pcm */
  isFloat: boolean;
  /** per-channel sample frames */
  frames: number;
  /** frames / sampleRate */
  durationSeconds: number;
}

/** The parsed fmt chunk plus the byte range of the data payload. */
export interface WavLayout {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  isFloat: boolean;
  /** bytes per frame (all channels) */
  blockAlign: number;
  /** per-channel frames the data payload fills (a partial tail frame is dropped) */
  frames: number;
  /** absolute offset of the first data byte */
  dataStart: number;
  /** declared size of the data payload in bytes */
  dataLength: number;
}

/** Reads an ascii field of `length` bytes at `offset`. */
function asciiAt(view: DataView, offset: number, length: number): string {
  let text = "";
  for (let index = 0; index < length; index++) text += String.fromCharCode(view.getUint8(offset + index));
  return text;
}

/** Parses the fmt body: format tag, layout and the bit depths this walk supports. */
function readFmt(view: DataView, body: number, size: number): Omit<WavLayout, "frames" | "dataStart" | "dataLength"> {
  if (size < 16) throw new AudioDecodeError("wav-bad-fmt", `audiodecode: fmt chunk carries ${size} bytes, 16 is the minimum`);
  const tag = view.getUint16(body, true);
  const channels = view.getUint16(body + 2, true);
  const sampleRate = view.getUint32(body + 4, true);
  const bitDepth = view.getUint16(body + 14, true);
  let isFloat = false;
  if (tag === 0xfffe && size >= 40) {
    // wave-format-extensible: the subformat guid repeats the real tag in its first two bytes
    const subFormat = view.getUint16(body + 24, true);
    if (subFormat !== 1 && subFormat !== 3) {
      throw new AudioDecodeError("wav-unsupported-format", `audiodecode: extensible subformat ${subFormat} is not pcm or ieee float`);
    }
    isFloat = subFormat === 3;
  } else if (tag === 3) isFloat = true;
  else if (tag !== 1) throw new AudioDecodeError("wav-unsupported-format", `audiodecode: format tag ${tag} is not pcm (1) or ieee float (3)`);
  if (bitDepth !== 8 && bitDepth !== 16 && bitDepth !== 24 && bitDepth !== 32) {
    throw new AudioDecodeError("wav-unsupported-bit-depth", `audiodecode: ${bitDepth}-bit samples are not supported`);
  }
  if (isFloat && bitDepth !== 32) throw new AudioDecodeError("wav-unsupported-bit-depth", "audiodecode: ieee float is only supported at 32 bits");
  if (channels < 1) throw new AudioDecodeError("wav-bad-channels", `audiodecode: ${channels} channels makes no wav`);
  if (sampleRate < 1) throw new AudioDecodeError("wav-bad-sample-rate", `audiodecode: sample rate ${sampleRate} makes no wav`);
  return { sampleRate, channels, bitDepth, isFloat, blockAlign: channels * (bitDepth >> 3) };
}

/**
 * readWavLayout — walks the riff chunk list and answers the fmt facts plus where
 * the data payload lives, without decoding a single sample. The walk is bounded
 * by the actual byte length (streaming files may lie in the riff size field);
 * chunk ids are matched in any order (first fmt, first data win) and odd-sized
 * chunks consume their pad byte.
 */
export function readWavLayout(bytes: Uint8Array): WavLayout {
  if (bytes.byteLength < 12) throw new AudioDecodeError("wav-too-small", `audiodecode: ${bytes.byteLength} bytes is too small for a riff header`);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const limit = bytes.byteLength;
  if (asciiAt(view, 0, 4) !== "RIFF") throw new AudioDecodeError("wav-not-riff", "audiodecode: missing the RIFF magic");
  if (asciiAt(view, 8, 4) !== "WAVE") throw new AudioDecodeError("wav-not-wave", `audiodecode: riff form ${asciiAt(view, 8, 4)} is not WAVE`);
  let fmt: ReturnType<typeof readFmt> | null = null;
  let dataStart = -1;
  let dataLength = 0;
  let offset = 12;
  while (offset + 8 <= limit) {
    const id = asciiAt(view, offset, 4);
    const size = view.getUint32(offset + 4, true);
    const body = offset + 8;
    if (body + size > limit) throw new AudioDecodeError("wav-truncated", `audiodecode: chunk ${id} declares ${size} bytes but only ${limit - body} remain`);
    if (id === "fmt " && fmt === null) fmt = readFmt(view, body, size);
    else if (id === "data" && dataStart < 0) {
      dataStart = body;
      dataLength = size;
    }
    offset = body + size + (size & 1);
  }
  if (dataStart < 0) throw new AudioDecodeError("wav-missing-data", "audiodecode: no data chunk in the walk");
  if (fmt === null) throw new AudioDecodeError("wav-missing-fmt", "audiodecode: no fmt chunk in the walk");
  const frames = Math.floor(dataLength / fmt.blockAlign);
  if (frames < 1) throw new AudioDecodeError("wav-empty-data", `audiodecode: data chunk holds ${dataLength} bytes, less than one ${fmt.blockAlign}-byte frame`);
  return { ...fmt, frames, dataStart, dataLength };
}

/**
 * readWavSamples — decodes the layout's data payload into one interleaved
 * Float32Array (frame f channel c at f * channels + c), normalized to the
 * nominal [-1, 1] window: u8 shifts by 128, integers divide by the signed
 * maximum, float32 passes through (over-range values stay over-range on
 * purpose; the downmix clamps). Callers may narrow `layout.frames` first —
 * the duration clamp does exactly that.
 */
export function readWavSamples(bytes: Uint8Array, layout: WavLayout): Float32Array {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const { channels, bitDepth, isFloat, blockAlign, frames, dataStart } = layout;
  const samples = new Float32Array(frames * channels);
  for (let frame = 0; frame < frames; frame++) {
    const base = dataStart + frame * blockAlign;
    for (let channel = 0; channel < channels; channel++) {
      const at = base + channel * (bitDepth >> 3);
      samples[frame * channels + channel] = isFloat
        ? view.getFloat32(at, true)
        : bitDepth === 8
          ? (view.getUint8(at) - 128) / 128
          : bitDepth === 16
            ? view.getInt16(at, true) / 32768
            : bitDepth === 24
              ? (((view.getUint8(at) | (view.getUint8(at + 1) << 8) | (view.getUint8(at + 2) << 16)) << 8) >> 8) / 8388608
              : view.getInt32(at, true) / 2147483648;
    }
  }
  return samples;
}

/** wavinfo — the header-only probe: what the container says, no samples decoded. */
export function wavinfo(bytes: Uint8Array): WavInfo {
  const layout = readWavLayout(bytes);
  return {
    sampleRate: layout.sampleRate,
    channels: layout.channels,
    bitDepth: layout.bitDepth,
    isFloat: layout.isFloat,
    frames: layout.frames,
    durationSeconds: layout.frames / layout.sampleRate,
  };
}
