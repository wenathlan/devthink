// # audiodecode — the pcm decode layer of the audio→image pipeline: turn audio
// bytes into the AudioFrames contract the analysis and imagery waves consume.
// The node path covers WAV natively (the byte walk lives in audioformat.ts); in
// the browser, AudioContext.decodeAudioData handles the compressed containers
// (mp3, ogg, flac, m4a) and hands web AudioBuffers over, which fromAudioBufferLike
// maps onto the same contract without importing any DOM type. Other containers
// route through the mediaprobe metadata facade. Deterministic by construction:
// same bytes in, same frames out — no clocks, no randomness.
import { AudioDecodeError, readWavLayout, readWavSamples } from "./audioformat.ts";

export { AudioDecodeError, wavinfo } from "./audioformat.ts";
export type { WavInfo } from "./audioformat.ts";

/** The decoded pcm answer: per-channel frame count plus one interleaved sample array. */
export interface AudioFrames {
  /** frames per second after the decode options ran */
  sampleRate: number;
  /** interleaved channel count, 1 when the mono option downmixed */
  channels: number;
  /** per-channel frames; samples.length === length * channels */
  length: number;
  /** interleaved samples; frame f channel c at f * channels + c, nominal [-1, 1] */
  samples: Float32Array;
}

/** The decode knobs; every field is optional, defaults documented on decodeWav. */
export interface DecodeOptions {
  /** resample target in hz (default 48000) */
  targetSampleRate?: number;
  /** average the channels down to mono (default true) */
  mono?: boolean;
  /** decode at most this many seconds from the head, clamped at the source rate */
  maxDurationSeconds?: number;
}

/** The slice of the web AudioBuffer this module consumes, without DOM types. */
export interface AudioBufferLike {
  sampleRate: number;
  /** one array per channel of equal length, as buffer.getChannelData(c) hands out */
  channelData: readonly Float32Array[];
}

/**
 * decodeWav — the full path: parse, clamp, downmix, resample. Defaults are
 * 48000 hz, mono, unclamped. The duration clamp cuts whole frames at the source
 * rate first (bounding the work), downmixing averages before resampling (exact
 * under linear interpolation, and cheaper), and the resample only runs when the
 * rates differ. Throws AudioDecodeError with the wav-* codes of audioformat and
 * the decode-* codes of the options.
 */
export function decodeWav(bytes: Uint8Array, options: DecodeOptions = {}): AudioFrames {
  const targetSampleRate = options.targetSampleRate ?? 48000;
  if (!Number.isFinite(targetSampleRate) || targetSampleRate < 1) {
    throw new AudioDecodeError("decode-bad-target-rate", `audiodecode: target sample rate ${targetSampleRate} is not a usable hz`);
  }
  const maxDuration = options.maxDurationSeconds;
  if (maxDuration !== undefined && (!Number.isFinite(maxDuration) || maxDuration <= 0)) {
    throw new AudioDecodeError("decode-bad-max-duration", `audiodecode: max duration ${maxDuration} is not a positive span`);
  }
  const layout = readWavLayout(bytes);
  const clamped =
    maxDuration === undefined
      ? layout
      : { ...layout, frames: Math.min(layout.frames, Math.floor(maxDuration * layout.sampleRate)) };
  let frames: AudioFrames = {
    sampleRate: clamped.sampleRate,
    channels: clamped.channels,
    length: clamped.frames,
    samples: readWavSamples(bytes, clamped),
  };
  if (options.mono ?? true) frames = downmix(frames);
  if (frames.sampleRate !== targetSampleRate) frames = resample(frames, targetSampleRate);
  return frames;
}

/**
 * downmix — averages the channels of every frame into one mono channel. The
 * result clamps to [-1, 1], a guard for float sources already past full scale
 * (integer sources cannot leave the window by averaging). Mono input returns
 * the same object untouched.
 */
export function downmix(frames: AudioFrames): AudioFrames {
  if (frames.channels === 1) return frames;
  const samples = new Float32Array(frames.length);
  for (let frame = 0; frame < frames.length; frame++) {
    let sum = 0;
    for (let channel = 0; channel < frames.channels; channel++) sum += frames.samples[frame * frames.channels + channel];
    const average = sum / frames.channels;
    samples[frame] = average > 1 ? 1 : average < -1 ? -1 : average;
  }
  return { sampleRate: frames.sampleRate, channels: 1, length: frames.length, samples };
}

/**
 * resample — linear interpolation to `targetSampleRate`, per channel over the
 * interleaved array. Output length is floor(length * to / from); source
 * positions are i * from / to, clamped so the tail holds its last sample
 * instead of extrapolating, and an empty input stays empty. Same-rate calls
 * return the same object (the identity shortcut the tests pin down).
 */
export function resample(frames: AudioFrames, targetSampleRate: number): AudioFrames {
  if (!Number.isFinite(targetSampleRate) || targetSampleRate < 1) {
    throw new AudioDecodeError("decode-bad-target-rate", `audiodecode: target sample rate ${targetSampleRate} is not a usable hz`);
  }
  if (frames.sampleRate === targetSampleRate) return frames;
  const outLength = Math.floor((frames.length * targetSampleRate) / frames.sampleRate);
  const samples = new Float32Array(outLength * frames.channels);
  const last = frames.length - 1;
  for (let index = 0; index < outLength; index++) {
    const position = (index * frames.sampleRate) / targetSampleRate;
    const left = Math.min(Math.floor(position), last);
    const right = Math.min(left + 1, last);
    const fraction = Math.min(Math.max(position - left, 0), 1);
    for (let channel = 0; channel < frames.channels; channel++) {
      const start = frames.samples[left * frames.channels + channel];
      const end = frames.samples[right * frames.channels + channel];
      samples[index * frames.channels + channel] = start * (1 - fraction) + end * fraction;
    }
  }
  return { sampleRate: targetSampleRate, channels: frames.channels, length: outLength, samples };
}

/**
 * normalizePeak — scales every sample by ceiling / peak so the loudest point
 * lands on `ceiling` (default 0.98), keeping the shape untouched. Digital
 * silence and inputs already at the ceiling return the same object; the input
 * arrays are never written.
 */
export function normalizePeak(frames: AudioFrames, ceiling = 0.98): AudioFrames {
  if (!Number.isFinite(ceiling) || ceiling <= 0) {
    throw new AudioDecodeError("decode-bad-ceiling", `audiodecode: normalization ceiling ${ceiling} is not a positive amplitude`);
  }
  let peak = 0;
  for (let index = 0; index < frames.samples.length; index++) {
    const magnitude = Math.abs(frames.samples[index]);
    if (magnitude > peak) peak = magnitude;
  }
  const gain = peak > 0 ? ceiling / peak : 1;
  if (gain === 1) return frames;
  const samples = new Float32Array(frames.samples.length);
  for (let index = 0; index < samples.length; index++) samples[index] = frames.samples[index] * gain;
  return { ...frames, samples };
}

/**
 * fromAudioBufferLike — maps browser audio onto the AudioFrames contract: in
 * the browser, AudioContext.decodeAudioData handles mp3/ogg/flac/m4a and yields
 * a web AudioBuffer; pass its sampleRate and getChannelData arrays here and
 * everything downstream (resample, downmix, normalization, analysis, imagery)
 * runs on the same shape decodeWav returns. The node path covers WAV natively;
 * other containers route through the mediaprobe metadata facade. The channel
 * arrays are copied — the browser hands out live views, this contract owns its
 * bytes.
 */
export function fromAudioBufferLike(buffer: AudioBufferLike): AudioFrames {
  if (!Number.isFinite(buffer.sampleRate) || buffer.sampleRate < 1) {
    throw new AudioDecodeError("decode-bad-sample-rate", `audiodecode: buffer sample rate ${buffer.sampleRate} is not a usable hz`);
  }
  const channels = buffer.channelData.length;
  if (channels < 1) throw new AudioDecodeError("decode-no-channels", "audiodecode: a buffer with no channels makes no audio");
  const length = buffer.channelData[0].length;
  for (const channel of buffer.channelData) {
    if (channel.length !== length) {
      throw new AudioDecodeError("decode-uneven-channels", `audiodecode: channel lengths differ (${channel.length} against ${length})`);
    }
  }
  const samples = new Float32Array(length * channels);
  for (let frame = 0; frame < length; frame++) {
    for (let channel = 0; channel < channels; channel++) samples[frame * channels + channel] = buffer.channelData[channel][frame];
  }
  return { sampleRate: buffer.sampleRate, channels, length, samples };
}
