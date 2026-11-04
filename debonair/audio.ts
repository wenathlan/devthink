// # audio — the audio domain of the katexis engine, consolidated: every
// audio*.ts leaf of the root (the cadria audio→image analysis wave, the
// decode/format pair, the fft kernel, the rhythm halves, the spectrum,
// structure, timbre halves, the tonality pair, the descriptor fusion, the
// pipeline orchestrator and the browser transport) folded into the one
// keyword file the ownership law pins for this domain. The merge is pure
// consolidation — zero logic edits, every export verbatim — under the
// section banners below, one banner per retired source:
//
//   audioattributes.ts   the shared descriptor contract (the five summary
//                        types + the fused AudioDescriptor) — the canonical
//                        home of the contract names
//   audioformat.ts       the WAV (RIFF/WAVE) byte walk
//   audiodecode.ts       the pcm decode layer (AudioFrames contract)
//   audiofft.ts          the radix-2 FFT kernel + the STFT
//   audiorhythmbeat.ts   the tempo & beat-geometry leaf (RhythmError lives here)
//   audiorhythm.ts       the onset half of the rhythm layer
//   audiospectrum.ts     the spectral analysis layer
//   audiostructure.ts    the structure layer (novelty, sections, narratives)
//   audiotimbreenv.ts    the frame-envelope half of the timbre layer
//   audiotimbre.ts       the spectral-timbre half (mel/MFCC)
//   audiotonalitychords.ts  the chord timeline of the tonality layer
//   audiotonality.ts     the chroma/key layer of the tonality layer
//   audiofeatures.ts     the fusion layer (the 32-dim AudioDescriptor)
//   audiopipeline.ts     the wave-1 orchestrator (AnalysisReport)
//   audioengine.ts       the browser transport of the studio page
//
// The consolidation notes (the only edits the merge made):
// - the contract types that the analysis leaves re-declared with identical
//   shapes (KeyMode, NarrativeShape, SpectralSummary) answer from the
//   audioattributes section alone — the duplicate declarations folded away;
// - the four contract-named types whose leaf shapes carry more than the
//   contract summary keep their full shape under their leaf names:
//   audiorhythm's RhythmStats → RhythmRead, audiotonality's HarmonicStats →
//   HarmonicRead, audiotimbre's TimbreStats → TimbreRead, audiostructure's
//   StructureStats → RawStructureStats (the alias audiopipeline already
//   imported it under);
// - the identical private helpers the leaves each carried (clamp, clamp01,
//   clean, finite) answer once — clamp01/finite ride their exported seats,
//   clamp and clean keep one private declaration each;
// - audiotimbre's private symmetric hann window answers as symmetricHann so
//   the periodic hann of the fft kernel keeps its exported name;
// - audiodecode's re-export of the audioformat seats (WavInfo,
//   AudioDecodeError, wavinfo) folds into the audioformat section itself.

import type { ArrangerRole, TakePlan } from "./arranger.ts";
import { hashSeed, mulberry32 } from "./harmonyengine.ts";
import { dbToLinear } from "./mixergraph.ts";
import { type NoteEvent, scheduleTake, type TakeSchedule } from "./take.ts";
import { midiToHz } from "./tuning.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: audioattributes.ts — the shared descriptor contract. */
/* ════════════════════════════════════════════════════════════════════ */

/** key quality — the two modes the tonal wave reports. */
export type KeyMode = "major" | "minor";

/** energy storyline of a clip over time. */
export type NarrativeShape = "arch" | "rise" | "fall" | "wave" | "flat";

/** spectrum summary over the whole clip — hz where noted, energies 0-1. */
export interface SpectralSummary {
  centroidMean: number; // mean spectral centroid, hz (0 … ~8000)
  centroidStd: number; // spread of the centroid over time, hz
  rolloffMean: number; // mean 85% rolloff frequency, hz
  flatnessMean: number; // mean flatness, 0 = tonal … 1 = noiselike
  flatnessStd: number; // spread of flatness over time
  fluxMean: number; // mean spectral flux (frame-to-frame change)
  fluxStd: number; // spread of flux over time
  bandBalance: number[]; // seven log-band energies 0-1, low → high
  brightnessIndex: number; // overall brightness weight, 0-1
}

/** pulse summary — tempo, trust and groove of the beat grid. */
export interface RhythmStats {
  bpm: number; // beats per minute, 0 … ~300
  confidence: number; // pulse trust, 0-1
  onsetsPerSecond: number; // onset density, 0 … ~8
  regularityIndex: number; // how even the pulse grid is, 0-1
  swing: { ratio: number; swung: boolean }; // beat-pair split, 0.5 straight → 0.75 triplet
  downbeatPeriodBeats: number; // beats per downbeat cycle (4 = 4/4)
}

/** tonal summary — key, chroma mass and how fast harmony moves. */
export interface HarmonicStats {
  key: {
    tonic: number; // pitch class 0 = c … 11 = b
    mode: KeyMode; // major or minor
    strength: number; // key confidence, 0-1
  };
  chromaEnergy: number[]; // twelve pitch-class energies 0-1, c first
  harmonicChangeRate: number; // chord-change speed, 0-1
  dissonanceIndex: number; // roughness weight, 0-1
}

/** timbre summary — texture, warmth and loudness envelope of the mix. */
export interface TimbreStats {
  noisiness: number; // noiselike vs pure weight, 0-1
  warmth: number; // low-mid body weight, 0-1
  dynamics: {
    rangeDb: number; // loud-soft span, db (0 … ~60)
    crestFactor: number; // peak/rms ratio, linear (0 … ~20)
  };
  brightness: number; // high-frequency weight, 0-1
  slopeMean: number; // mean spectral slope, db/octave (~-12 … 0)
  zcrMean: number; // mean zero-crossing rate, 0-0.5
}

/** form summary — length, sections and the energy storyline. */
export interface StructureStats {
  durationMs: number; // whole-clip length in milliseconds
  peakSectionMs: number; // length of the loudest section, ms
  repetitionIndex: number; // how self-similar the clip is, 0-1
  narrativeShape: NarrativeShape; // energy storyline over time
  sectionCount: number; // detected sections, 0 … ~12
}

/** the five-stat bundle the fusion layer folds into one descriptor. */
export interface DescriptorStats {
  spectral: SpectralSummary;
  rhythm: RhythmStats;
  harmonic: HarmonicStats;
  timbre: TimbreStats;
  structure: StructureStats;
}

/**
 * fused, image-ready view of one clip: a deterministic seed plus a 32-dim
 * 0-1 vector in the fixed order documented at the top of the fusion layer
 * (dims 0-6 spectral, 7-11 rhythm, 12-15 tonal, 16-21 timbre, 22-27
 * energy/structure, 28-31 cross features) and named scalar conveniences for
 * quick reads (bpm, centroidHz, rolloffHz, brightness, contrastDb, crest,
 * durationMs, peakMs, sections, tonic, minor, keyStrength, swingRatio, …).
 */
export interface AudioDescriptor {
  /** contract revision — frozen at 1; bumps only with the mapping wave. */
  version: 1;
  /** 16-hex fnv-1a fingerprint: pcm bits when available, stats otherwise. */
  seed: string;
  /** exactly 32 dims, each clamped 0-1 — position is the contract. */
  vector: number[];
  /** named numbers the studio ui can read without dim arithmetic. */
  scalar: Record<string, number>;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: audioformat.ts — the WAV (RIFF/WAVE) byte walk. */
/* ════════════════════════════════════════════════════════════════════ */

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
  if (size < 16)
    throw new AudioDecodeError("wav-bad-fmt", `audiodecode: fmt chunk carries ${size} bytes, 16 is the minimum`);
  const tag = view.getUint16(body, true);
  const channels = view.getUint16(body + 2, true);
  const sampleRate = view.getUint32(body + 4, true);
  const bitDepth = view.getUint16(body + 14, true);
  let isFloat = false;
  if (tag === 0xfffe && size >= 40) {
    // wave-format-extensible: the subformat guid repeats the real tag in its first two bytes
    const subFormat = view.getUint16(body + 24, true);
    if (subFormat !== 1 && subFormat !== 3) {
      throw new AudioDecodeError(
        "wav-unsupported-format",
        `audiodecode: extensible subformat ${subFormat} is not pcm or ieee float`,
      );
    }
    isFloat = subFormat === 3;
  } else if (tag === 3) isFloat = true;
  else if (tag !== 1)
    throw new AudioDecodeError(
      "wav-unsupported-format",
      `audiodecode: format tag ${tag} is not pcm (1) or ieee float (3)`,
    );
  if (bitDepth !== 8 && bitDepth !== 16 && bitDepth !== 24 && bitDepth !== 32) {
    throw new AudioDecodeError("wav-unsupported-bit-depth", `audiodecode: ${bitDepth}-bit samples are not supported`);
  }
  if (isFloat && bitDepth !== 32)
    throw new AudioDecodeError("wav-unsupported-bit-depth", "audiodecode: ieee float is only supported at 32 bits");
  if (channels < 1) throw new AudioDecodeError("wav-bad-channels", `audiodecode: ${channels} channels makes no wav`);
  if (sampleRate < 1)
    throw new AudioDecodeError("wav-bad-sample-rate", `audiodecode: sample rate ${sampleRate} makes no wav`);
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
  if (bytes.byteLength < 12)
    throw new AudioDecodeError(
      "wav-too-small",
      `audiodecode: ${bytes.byteLength} bytes is too small for a riff header`,
    );
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const limit = bytes.byteLength;
  if (asciiAt(view, 0, 4) !== "RIFF") throw new AudioDecodeError("wav-not-riff", "audiodecode: missing the RIFF magic");
  if (asciiAt(view, 8, 4) !== "WAVE")
    throw new AudioDecodeError("wav-not-wave", `audiodecode: riff form ${asciiAt(view, 8, 4)} is not WAVE`);
  let fmt: ReturnType<typeof readFmt> | null = null;
  let dataStart = -1;
  let dataLength = 0;
  let offset = 12;
  while (offset + 8 <= limit) {
    const id = asciiAt(view, offset, 4);
    const size = view.getUint32(offset + 4, true);
    const body = offset + 8;
    if (body + size > limit)
      throw new AudioDecodeError(
        "wav-truncated",
        `audiodecode: chunk ${id} declares ${size} bytes but only ${limit - body} remain`,
      );
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
  if (frames < 1)
    throw new AudioDecodeError(
      "wav-empty-data",
      `audiodecode: data chunk holds ${dataLength} bytes, less than one ${fmt.blockAlign}-byte frame`,
    );
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
              ? (((view.getUint8(at) | (view.getUint8(at + 1) << 8) | (view.getUint8(at + 2) << 16)) << 8) >> 8) /
                8388608
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

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: audiodecode.ts — the pcm decode layer (AudioFrames contract). */
/* ════════════════════════════════════════════════════════════════════ */

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
    throw new AudioDecodeError(
      "decode-bad-target-rate",
      `audiodecode: target sample rate ${targetSampleRate} is not a usable hz`,
    );
  }
  const maxDuration = options.maxDurationSeconds;
  if (maxDuration !== undefined && (!Number.isFinite(maxDuration) || maxDuration <= 0)) {
    throw new AudioDecodeError(
      "decode-bad-max-duration",
      `audiodecode: max duration ${maxDuration} is not a positive span`,
    );
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
    for (let channel = 0; channel < frames.channels; channel++)
      sum += frames.samples[frame * frames.channels + channel];
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
    throw new AudioDecodeError(
      "decode-bad-target-rate",
      `audiodecode: target sample rate ${targetSampleRate} is not a usable hz`,
    );
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
    throw new AudioDecodeError(
      "decode-bad-ceiling",
      `audiodecode: normalization ceiling ${ceiling} is not a positive amplitude`,
    );
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
    throw new AudioDecodeError(
      "decode-bad-sample-rate",
      `audiodecode: buffer sample rate ${buffer.sampleRate} is not a usable hz`,
    );
  }
  const channels = buffer.channelData.length;
  if (channels < 1)
    throw new AudioDecodeError("decode-no-channels", "audiodecode: a buffer with no channels makes no audio");
  const length = buffer.channelData[0].length;
  for (const channel of buffer.channelData) {
    if (channel.length !== length) {
      throw new AudioDecodeError(
        "decode-uneven-channels",
        `audiodecode: channel lengths differ (${channel.length} against ${length})`,
      );
    }
  }
  const samples = new Float32Array(length * channels);
  for (let frame = 0; frame < length; frame++) {
    for (let channel = 0; channel < channels; channel++)
      samples[frame * channels + channel] = buffer.channelData[channel][frame];
  }
  return { sampleRate: buffer.sampleRate, channels, length, samples };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: audiofft.ts — the spectral engine (radix-2 FFT + the STFT). */
/* ════════════════════════════════════════════════════════════════════ */

/** Error raised for invalid sizes, mismatched buffers and malformed options. */
export class FftError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "FftError";
  }
}

/** the window functions the STFT can apply. */
export type WindowName = "hann" | "hamming" | "blackman";

/** smallest supported FFT size (power of two). */
export const FFT_MIN_SIZE = 256;

/** largest supported FFT size (power of two). */
export const FFT_MAX_SIZE = 16384;

/** precomputed tables for one FFT size (shared, read-only after build). */
interface FftTables {
  /** bit-reversal permutation: reverse[i] is the new index of bin i */
  reverse: Uint32Array;
  /** twiddle cosines: cos[k] = cos(2πk/n) for k in [0, n/2) */
  cos: Float64Array;
  /** twiddle sines: sin[k] = sin(2πk/n) for k in [0, n/2) */
  sin: Float64Array;
}

const fftTableCache = new Map<number, FftTables>();
const windowCache = new Map<string, Float64Array>();

/** validates a power-of-two size within [256, 16384] and returns it. */
function checkedSize(size: number, label: string): number {
  if (!Number.isInteger(size) || size < FFT_MIN_SIZE || size > FFT_MAX_SIZE || (size & (size - 1)) !== 0) {
    throw new FftError(
      `audiofft: ${label} must be a power-of-two integer in [${FFT_MIN_SIZE}, ${FFT_MAX_SIZE}], got ${size}`,
    );
  }
  return size;
}

/** builds (once) and returns the reversal + twiddle tables for a size. */
function tablesFor(size: number): FftTables {
  const cached = fftTableCache.get(size);
  if (cached) return cached;
  const reverse = new Uint32Array(size);
  for (let i = 0; i < size; i++) {
    let x = i;
    let r = 0;
    for (let bits = size; bits > 1; bits >>= 1) {
      r = (r << 1) | (x & 1);
      x >>= 1;
    }
    reverse[i] = r;
  }
  const half = size >> 1;
  const cos = new Float64Array(half);
  const sin = new Float64Array(half);
  for (let k = 0; k < half; k++) {
    cos[k] = Math.cos((2 * Math.PI * k) / size);
    sin[k] = Math.sin((2 * Math.PI * k) / size);
  }
  const tables = { reverse, cos, sin };
  fftTableCache.set(size, tables);
  return tables;
}

/**
 * fft — in-place iterative radix-2 Cooley–Tukey transform of the complex
 * signal (re, im), forward convention e^(−i2πkn/N). Both buffers must share
 * one power-of-two length in [256, 16384] and one element domain (both
 * float32 or both float64 — the engine's one kernel serves the float32 stft
 * lanes and the float64 analysis lanes alike, precision follows the
 * buffers); contents are permuted and overwritten (the in-place contract).
 */
export function fft(re: Float32Array | Float64Array, im: Float32Array | Float64Array): void {
  if (re.length !== im.length) {
    throw new FftError(`audiofft: real and imaginary buffers differ (${re.length} vs ${im.length})`);
  }
  const size = checkedSize(re.length, "size");
  const { reverse, cos, sin } = tablesFor(size);
  for (let i = 0; i < size; i++) {
    const j = reverse[i];
    if (j > i) {
      const tr = re[i];
      const ti = im[i];
      re[i] = re[j];
      im[i] = im[j];
      re[j] = tr;
      im[j] = ti;
    }
  }
  for (let len = 2; len <= size; len <<= 1) {
    const half = len >> 1;
    const stride = size / len;
    for (let lower = 0; lower < size; lower += len) {
      for (let j = 0; j < half; j++) {
        const k = j * stride;
        const c = cos[k];
        const s = sin[k];
        const upper = lower + j + half;
        const xr = re[upper];
        const xi = im[upper];
        const tr = xr * c + xi * s;
        const ti = xi * c - xr * s;
        re[upper] = re[lower + j] - tr;
        im[upper] = im[lower + j] - ti;
        re[lower + j] += tr;
        im[lower + j] += ti;
      }
    }
  }
}

/**
 * fftMagnitudes — convenience over fft for one real-valued frame of `size`
 * samples: returns the one-sided magnitude spectrum, `size/2 + 1` bins from
 * DC (bin 0) to nyquist (bin size/2). The input frame is not modified.
 */
export function fftMagnitudes(frame: Float32Array): Float32Array {
  const size = checkedSize(frame.length, "frame size");
  const re = Float32Array.from(frame);
  const im = new Float32Array(size);
  for (let i = 0; i < size; i++) re[i] = Number.isFinite(re[i]) ? re[i] : 0;
  fft(re, im);
  const bins = (size >> 1) + 1;
  const magnitudes = new Float32Array(bins);
  for (let k = 0; k < bins; k++) magnitudes[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
  return magnitudes;
}

/** builds (once) and returns a periodic window of a size for a formula. */
function cachedWindow(name: WindowName, size: number, at: (i: number, n: number) => number): Float64Array {
  checkedSize(size, `${name} window size`);
  const key = `${name}:${size}`;
  const hit = windowCache.get(key);
  if (hit) return hit;
  const window = new Float64Array(size);
  for (let i = 0; i < size; i++) window[i] = at(i, size);
  windowCache.set(key, window);
  return window;
}

/** periodic hann: 0.5 − 0.5·cos(2πi/N); sums to N/2. */
export function hann(size: number): Float64Array {
  return cachedWindow("hann", size, (i, n) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / n));
}

/** periodic hamming: 0.54 − 0.46·cos(2πi/N); sums to 0.54·N. */
export function hamming(size: number): Float64Array {
  return cachedWindow("hamming", size, (i, n) => 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / n));
}

/** periodic blackman: 0.42 − 0.5·cos(2πi/N) + 0.08·cos(4πi/N); sums to 0.42·N. */
export function blackman(size: number): Float64Array {
  return cachedWindow(
    "blackman",
    size,
    (i, n) => 0.42 - 0.5 * Math.cos((2 * Math.PI * i) / n) + 0.08 * Math.cos((4 * Math.PI * i) / n),
  );
}

/** resolves a window by name (the STFT option path). */
export function windowFunction(name: WindowName, size: number): Float64Array {
  switch (name) {
    case "hann":
      return hann(size);
    case "hamming":
      return hamming(size);
    case "blackman":
      return blackman(size);
  }
  throw new FftError(`audiofft: unknown window "${String(name)}" (expected hann, hamming or blackman)`);
}

/** the STFT options: window length, hop and window name (defaults 1024/512/hann). */
export interface StftOptions {
  /** window length in samples, power of two in [256, 16384] (default 1024). */
  size?: number;
  /** samples between frame starts, integer >= 1 (default size / 2). */
  hop?: number;
  /** analysis window (default "hann"). */
  window?: WindowName;
}

/** frame count for n samples: 0 below one window, else ceil((n − size)/hop) + 1. */
export function stftFrameCount(samples: number, size: number, hop: number): number {
  if (samples < size) return 0;
  return Math.ceil((samples - size) / hop) + 1;
}

/**
 * stft — slides a window over the samples and returns one one-sided
 * magnitude spectrum (size/2 + 1 bins) per frame. Frame starts walk 0, hop,
 * 2·hop, …; a tail window reaching past the end reads zeros, which pins the
 * frame count at ceil((n − size)/hop) + 1 (empty below one full window).
 * Deterministic: same samples and options, same frames.
 */
export function stft(samples: Float32Array, options: StftOptions = {}): Float32Array[] {
  const size = checkedSize(options.size ?? 1024, "size");
  const hop = options.hop ?? size / 2;
  if (!Number.isInteger(hop) || hop < 1) {
    throw new FftError(`audiofft: hop must be an integer >= 1, got ${hop}`);
  }
  const win = windowFunction(options.window ?? "hann", size);
  const count = stftFrameCount(samples.length, size, hop);
  const bins = (size >> 1) + 1;
  const frames: Float32Array[] = [];
  const re = new Float32Array(size);
  const im = new Float32Array(size);
  for (let f = 0; f < count; f++) {
    const start = f * hop;
    for (let i = 0; i < size; i++) {
      const t = start + i;
      const sample = t < samples.length ? samples[t] : 0;
      re[i] = (Number.isFinite(sample) ? sample : 0) * win[i];
    }
    im.fill(0);
    fft(re, im);
    const magnitudes = new Float32Array(bins);
    for (let k = 0; k < bins; k++) magnitudes[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
    frames.push(magnitudes);
  }
  return frames;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: audiorhythmbeat.ts — the tempo & beat-geometry leaf. */
/* ════════════════════════════════════════════════════════════════════ */

/** Error raised for malformed bpm values, grids, envelopes and options. */
export class RhythmError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "RhythmError";
  }
}

/** passes finite numbers through and replaces NaN/±Infinity with a fallback. */
export function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

/** clamps into [lo, hi]; non-finite reads lo. */
function clamp(value: number, lo: number, hi: number): number {
  const v = finite(value, lo);
  return v < lo ? lo : v > hi ? hi : v;
}

/** validates a finite bpm > 0 — the one contract every caller here shares. */
function checkedBpm(bpm: number, caller: string): number {
  if (!Number.isFinite(bpm) || bpm <= 0)
    throw new RhythmError(`audiorhythm: ${caller} bpm must be finite > 0, got ${bpm}`);
  return bpm;
}

/** the canonical-tempo answer: the folded bpm plus the fold that was used. */
export type CanonicalTempo = { bpm: number; multiplier: 0.5 | 1 | 2 };

/**
 * canonicalTempo — folds a raw bpm into the 70-160 window: above 160
 * halves (trap half-time), below 70 doubles, in-range passes untouched
 * (150 stays 150, multiplier 1 — the documented choice). A fold that still
 * lands outside (input < 35 or > 320) clamps to the near edge; non-finite
 * or non-positive input reads as unknown: bpm 0, multiplier 1.
 */
export function canonicalTempo(bpm: number): CanonicalTempo {
  if (!Number.isFinite(bpm) || bpm <= 0) return { bpm: 0, multiplier: 1 };
  const multiplier: 0.5 | 1 | 2 = bpm > 160 ? 0.5 : bpm < 70 ? 2 : 1;
  return { bpm: clamp(bpm * multiplier, 70, 160), multiplier };
}

/**
 * beatGrid — an even click track: offsetMs + k·(60000/bpm) for every beat
 * inside [0, durationMs]. A negative offset clips the grid at 0; a zero
 * duration or an offset past the end answers empty; the grid caps at 4096
 * beats so absurd bpm + duration pairs cannot loop forever.
 */
export function beatGrid(bpm: number, durationMs: number, offsetMs = 0): number[] {
  checkedBpm(bpm, "beatGrid");
  if (!Number.isFinite(durationMs) || durationMs < 0)
    throw new RhythmError(`audiorhythm: beatGrid durationMs must be finite >= 0, got ${durationMs}`);
  if (!Number.isFinite(offsetMs))
    throw new RhythmError(`audiorhythm: beatGrid offsetMs must be finite, got ${offsetMs}`);
  const period = 60000 / bpm;
  const beats: number[] = [];
  const first = offsetMs >= 0 ? 0 : Math.ceil(-offsetMs / period - 1e-9);
  for (let k = first; k - first < 4096; k++) {
    const t = offsetMs + k * period;
    if (t > durationMs + 1e-9) break;
    beats.push(finite(t));
  }
  return beats;
}

/** the onset envelope's strength around one time: max of the ±1-frame
 *  neighborhood (outside reads 0) — downbeat scoring samples this at beat
 *  times, so a beat that fires earns its rotation. */
export function envelopeSampleAt(envelope: Float32Array, frameMs: number, tMs: number): number {
  const frame = Math.round(tMs / frameMs);
  let peak = 0;
  for (let i = frame - 1; i <= frame + 1; i++) {
    if (i >= 0 && i < envelope.length && envelope[i] > peak) peak = envelope[i];
  }
  return peak;
}

/**
 * downbeatIndex — the bar rotation whose beats carry the most onset
 * energy: for each r in 0..periodBeats-1 the envelope is sampled at
 * beats[r], beats[r+periodBeats], … and the highest mean wins (ties keep
 * the earliest rotation, so a uniform grid reads 0). No beats or an empty
 * envelope answer 0.
 */
export function downbeatIndex(
  beats: readonly number[],
  envelope: Float32Array,
  frameMs: number,
  periodBeats = 4,
): number {
  if (!Number.isInteger(periodBeats) || periodBeats < 1) {
    throw new RhythmError(`audiorhythm: downbeatIndex periodBeats must be an integer >= 1, got ${periodBeats}`);
  }
  if (!Number.isFinite(frameMs) || frameMs <= 0)
    throw new RhythmError(`audiorhythm: downbeatIndex frameMs must be finite > 0, got ${frameMs}`);
  if (beats.length === 0 || envelope.length === 0) return 0;
  let best = 0;
  let bestScore = -Infinity;
  for (let r = 0; r < periodBeats; r++) {
    let sum = 0;
    let count = 0;
    for (let i = r; i < beats.length; i += periodBeats) {
      sum += envelopeSampleAt(envelope, frameMs, beats[i]);
      count++;
    }
    const score = count > 0 ? sum / count : 0;
    if (score > bestScore + 1e-12) {
      bestScore = score;
      best = r;
    }
  }
  return best;
}

/** how the bar line landed: the beat grid (ms) plus the winning rotation
 * `downbeatIndex` — beats[r], beats[r + periodBeats], … are the downbeats. */
export type DownbeatGrid = { beats: number[]; downbeatIndex: number; periodBeats: number };

/** downbeatGrid — beatGrid plus the downbeat phase aligned to onset energy
 * (options: periodBeats, default 4 = 4/4; offsetMs, the grid phase in ms). */
export function downbeatGrid(
  bpm: number,
  durationMs: number,
  envelope: Float32Array,
  frameMs: number,
  options: { periodBeats?: number; offsetMs?: number } = {},
): DownbeatGrid {
  const periodBeats = options.periodBeats ?? 4;
  const beats = beatGrid(bpm, durationMs, options.offsetMs ?? 0);
  return { beats, downbeatIndex: downbeatIndex(beats, envelope, frameMs, periodBeats), periodBeats };
}

/** the swing read: `ratio` is the beat-pair split in [0.5, 0.75] — 0.5
 * straight, 2/3 triplet — and `swung` flips at SWING_THRESHOLD (0.58). */
export type SwingRead = { ratio: number; swung: boolean };

/** a beat-pair split at or above this reads as swung. */
export const SWING_THRESHOLD = 0.58;

/**
 * swingRatio — how the offbeat sits between beats. The phase anchors by
 * scanning 48 candidate rotations of a `bpm` grid and keeping the one under
 * which the onsets carry the most beat weight — each on-beat hit (|p| < 0.08)
 * scores 1, or the onset's own strength when `weights` is handed in (the
 * beat is the stronger onset: loud onbeats outrank quiet offbeats and the
 * count alone cannot separate the onbeat anchor from the offbeat anchor).
 * Every onset then reduces to its relative position inside its beat and the
 * split reads from the late cluster (positions 0.55-0.89, the offbeat that
 * closes the pair): a late cluster at least as populated as the early one
 * (0.12-0.45, the triplet "and" side) sets the ratio, otherwise the mean of
 * all offbeat positions clamps to the 0.5 floor. Under 3 onsets or no
 * offbeat content answers straight.
 */
export function swingRatio(onsetsMs: readonly number[], bpm: number, weights?: readonly number[]): SwingRead {
  checkedBpm(bpm, "swingRatio");
  const times = [...onsetsMs].filter((t) => Number.isFinite(t)).sort((a, b) => a - b);
  if (times.length < 3) return { ratio: 0.5, swung: false };
  const strength = (t: number): number => {
    if (!weights || weights.length === 0) return 1;
    const index = times.indexOf(t);
    const w = index >= 0 && index < weights.length ? weights[index] : 0;
    return Number.isFinite(w) && w > 0 ? w : 0;
  };
  const period = 60000 / bpm;
  const offset = times[0];
  const phaseBins = 48;
  /** wraps a raw position into [0, 1). */
  const wrap = (r: number): number => ((r % 1) + 1) % 1;
  const onBeatWeight = (anchor: number): number => {
    let onBeats = 0;
    for (const t of times) {
      const p = wrap((t - anchor) / period);
      if (p < 0.08 || p > 0.92) onBeats += strength(t);
    }
    return onBeats;
  };
  /** the mean of the non-beat positions under one anchor (0 when none). */
  const _offBeatMean = (anchor: number): number => {
    const rest: number[] = [];
    for (const t of times) {
      const p = wrap((t - anchor) / period);
      if (p >= 0.12 && p <= 0.89) rest.push(p);
    }
    return rest.length > 0 ? rest.reduce((acc, v) => acc + v, 0) / rest.length : 0;
  };
  let bestOffset = offset;
  let bestScore = -1;
  for (let b = 0; b < phaseBins; b++) {
    const anchor = offset - (b / phaseBins) * period;
    const score = onBeatWeight(anchor);
    if (score > bestScore) {
      bestScore = score;
      bestOffset = anchor;
    }
  }
  const positions: number[] = [];
  for (const t of times) {
    const p = wrap((t - bestOffset) / period);
    if (p >= 0.12 && p <= 0.89) positions.push(p);
  }
  if (positions.length === 0) return { ratio: 0.5, swung: false };
  const mean = (list: readonly number[]): number => list.reduce((acc, v) => acc + v, 0) / list.length;
  const late = positions.filter((p) => p > 0.55);
  const early = positions.filter((p) => p < 0.45);
  const ratio = late.length > 0 && late.length >= early.length ? mean(late) : mean(positions);
  return { ratio: finite(clamp(ratio, 0.5, 0.75), 0.5), swung: ratio >= SWING_THRESHOLD };
}

/** bpm search bounds (defaults 60-200). */
export type BpmOptions = { minBpm?: number; maxBpm?: number };

/** one tempo hypothesis with its normalized support score (0-1). */
export type BpmCandidate = { bpm: number; score: number };

/** the tempo answer: best bpm, 0-1 confidence, runner-up hypotheses. */
export type BpmEstimate = {
  bpm: number; // best bpm in [minBpm, maxBpm]; 0 when nothing correlates
  confidence: number; // pulse trust 0-1: autocorrelation plus comb support
  candidates: BpmCandidate[]; // sorted by score, at most 5, deduped within 1 bpm
};

/** frame period of the synthetic impulse envelope built from onset lists. */
const ONSET_TRAIN_FRAME_MS = 5;

/** comb teeth per candidate — sixteen beats of evidence at most. */
const COMB_TEETH = 16;

/** micro-shifts (in frames) tried around a refined lag to seat the comb. */
const COMB_SHIFTS: readonly number[] = [0, -0.2, 0.2, -0.4, 0.4];

/** spikes a 5 ms-frame impulse envelope from onset times in ms. */
function onsetTrain(onsetsMs: readonly number[]): Float32Array {
  let last = 0;
  for (const t of onsetsMs) if (Number.isFinite(t) && t > last) last = t;
  const train = new Float32Array(Math.max(1, Math.ceil(last / ONSET_TRAIN_FRAME_MS) + 1));
  for (const t of onsetsMs) {
    if (!Number.isFinite(t) || t < 0) continue;
    const f = Math.round(t / ONSET_TRAIN_FRAME_MS);
    if (f < train.length) train[f] = 1;
  }
  return train;
}

/** raw autocorrelation of the envelope at one integer lag. */
function autocorrelation(envelope: Float32Array, lag: number): number {
  let sum = 0;
  for (let i = 0; i + lag < envelope.length; i++) sum += envelope[i] * envelope[i + lag];
  return sum;
}

/** linear read of the envelope at a fractional frame index (outside reads 0). */
function envelopeAtLag(envelope: Float32Array, index: number): number {
  const i = Math.floor(index);
  if (i < 0 || i >= envelope.length) return 0;
  const next = i + 1 < envelope.length ? envelope[i + 1] : envelope[i];
  return envelope[i] + (next - envelope[i]) * (index - i);
}

/** parabolic peak shift from three samples, clamped to ±0.5 (flat reads 0). */
function parabolicShift(left: number, center: number, right: number): number {
  const denom = left - 2 * center + right;
  if (!(Math.abs(denom) > 1e-12)) return 0;
  const shift = (0.5 * (left - right)) / denom;
  return shift < -0.5 ? -0.5 : shift > 0.5 ? 0.5 : shift;
}

/**
 * estimateBpm — tempo by autocorrelation + comb: the lag range implied by
 * the bpm bounds is scanned for the strongest local maxima, each is
 * parabolic-refined, then a comb of up to 16 teeth scores how
 * pulse-train-like the envelope is at that period — hits on the teeth minus
 * half the energy between them, so the fundamental always outscores its
 * double-length multiple — plus a ±0.4-frame micro-shift seating the teeth
 * on the pulses. Accepts an onset envelope plus its frame period (ms) or a
 * plain list of onset times in ms (converted to a 5 ms impulse envelope).
 * Nothing correlating (silence, an envelope shorter than the slowest
 * period) answers bpm 0, confidence 0, no candidates.
 */
export function estimateBpm(
  source: readonly number[] | Float32Array,
  frameMs?: number,
  options: BpmOptions = {},
): BpmEstimate {
  const minBpm = options.minBpm ?? 60;
  const maxBpm = options.maxBpm ?? 200;
  if (!Number.isFinite(minBpm) || minBpm <= 0 || !Number.isFinite(maxBpm) || maxBpm <= minBpm) {
    throw new RhythmError(`audiorhythm: need 0 < minBpm < maxBpm, got ${minBpm}..${maxBpm}`);
  }
  let envelope: Float32Array;
  let stepMs: number;
  if (source instanceof Float32Array) {
    const step = Number(frameMs);
    if (!Number.isFinite(step) || step <= 0)
      throw new RhythmError(`audiorhythm: frameMs must be finite > 0 for an envelope, got ${frameMs}`);
    envelope = source;
    stepMs = step;
  } else {
    envelope = onsetTrain(source);
    stepMs = ONSET_TRAIN_FRAME_MS;
  }
  const energy = autocorrelation(envelope, 0);
  const minLag = Math.max(1, Math.ceil(60000 / maxBpm / stepMs));
  const topLag = Math.min(Math.floor(60000 / minBpm / stepMs), envelope.length - 2);
  if (!(energy > 0) || topLag < minLag) return { bpm: 0, confidence: 0, candidates: [] };
  const lo = minLag - 1;
  const acf = new Float64Array(topLag + 2 - lo);
  for (let lag = lo; lag <= topLag + 1; lag++) acf[lag - lo] = autocorrelation(envelope, lag);
  const ranked: { lag: number; norm: number }[] = [];
  for (let lag = minLag; lag <= topLag; lag++) {
    const value = acf[lag - lo];
    if (!(value > 0)) continue;
    if (lag > minLag && value <= acf[lag - 1 - lo]) continue;
    if (lag < topLag && value < acf[lag + 1 - lo]) continue;
    ranked.push({ lag, norm: value / energy });
  }
  ranked.sort((a, b) => b.norm - a.norm);
  let peakValue = 0;
  for (const v of envelope) if (v > peakValue) peakValue = v;
  const candidates: BpmCandidate[] = [];
  for (const { lag, norm } of ranked.slice(0, 6)) {
    const base = lag + parabolicShift(acf[lag - 1 - lo], acf[lag - lo], acf[lag + 1 - lo]);
    let bestComb = 0;
    let bestShift = 0;
    for (const shift of COMB_SHIFTS) {
      const trial = base + shift;
      if (trial < minLag || trial > topLag) continue;
      let comb = 0;
      let count = 0;
      for (let k = 1; k * trial < envelope.length && count < COMB_TEETH; k++, count++) {
        comb += envelopeAtLag(envelope, k * trial) - 0.5 * envelopeAtLag(envelope, (k + 0.5) * trial);
      }
      const value = count > 0 ? clamp01(comb / count / peakValue) : 0;
      if (value > bestComb) {
        bestComb = value;
        bestShift = shift;
      }
    }
    const seated = Math.max(minLag, Math.min(topLag, base + bestShift));
    candidates.push({ bpm: 60000 / (seated * stepMs), score: clamp01(0.5 * norm + 0.5 * bestComb) });
  }
  candidates.sort((a, b) => b.score - a.score);
  const deduped: BpmCandidate[] = [];
  for (const candidate of candidates) {
    if (!deduped.some((kept) => Math.abs(kept.bpm - candidate.bpm) < 1)) deduped.push(candidate);
  }
  const best = deduped[0];
  return { bpm: best ? best.bpm : 0, confidence: best ? best.score : 0, candidates: deduped.slice(0, 5) };
}

/** one point of the tempo curve: window center time and window tempo. */
export type TempoPoint = { tMs: number; bpm: number };

/**
 * bpmOverTime — the tempo curve: a sliding window of `windowMs` (advanced
 * by half a window) runs estimateBpm over each envelope slice and reports
 * the window center time with its tempo (0 when a slice holds no pulse).
 * A window needs at least 200 ms and 4 frames; the tail window shrinks
 * instead of overrunning the envelope.
 */
export function bpmOverTime(
  envelope: Float32Array,
  frameMs: number,
  windowMs = 4000,
  options: BpmOptions = {},
): TempoPoint[] {
  if (!Number.isFinite(frameMs) || frameMs <= 0)
    throw new RhythmError(`audiorhythm: frameMs must be finite > 0, got ${frameMs}`);
  if (!Number.isFinite(windowMs) || windowMs < 200)
    throw new RhythmError(`audiorhythm: windowMs must be finite >= 200, got ${windowMs}`);
  const points: TempoPoint[] = [];
  const windowFrames = Math.max(4, Math.round(windowMs / frameMs));
  const step = Math.max(1, windowFrames >> 1);
  for (let start = 0; start < envelope.length; start += step) {
    const stop = Math.min(envelope.length, start + windowFrames);
    if (stop - start < 4) break;
    const slice = envelope.subarray(start, stop);
    points.push({ tMs: (start + (stop - start) / 2) * frameMs, bpm: estimateBpm(slice, frameMs, options).bpm });
    if (stop === envelope.length) break;
  }
  return points;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 6: audiorhythm.ts — the onset half of the rhythm layer. */
/* ════════════════════════════════════════════════════════════════════ */

/** the onset envelope answer: flux values per frame plus the frame period. */
export type OnsetEnvelope = { envelope: Float32Array; frameMs: number };

/** onset-envelope options: stft geometry plus the smoothing horizon. */
export type OnsetEnvelopeOptions = { size?: number; hop?: number; smoothMs?: number };

/**
 * onsetEnvelope — half-wave rectified spectral flux across consecutive stft
 * magnitude frames, lightened by a centered moving average of `smoothMs`
 * (default 40 ms — short enough to keep the spikes, long enough to de-flicker
 * the noise floor). Frame 0 reads 0 (no previous frame). Throws RhythmError
 * for a non-finite/non-positive sampleRate and for sample slices shorter
 * than one analysis window.
 */
export function onsetEnvelope(
  samples: Float32Array,
  sampleRate: number,
  options: OnsetEnvelopeOptions = {},
): OnsetEnvelope {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0)
    throw new RhythmError(`audiorhythm: sampleRate must be finite > 0, got ${sampleRate}`);
  const size = options.size ?? 1024;
  const hop = options.hop ?? size / 2;
  const smoothMs = options.smoothMs ?? 40;
  if (!Number.isFinite(hop) || hop < 1 || hop > size)
    throw new RhythmError(`audiorhythm: hop must be finite within [1, size], got ${hop}`);
  const frames = stft(samples, { size, hop });
  const flux = new Float32Array(frames.length);
  for (let f = 1; f < frames.length; f++) {
    const current = frames[f];
    const previous = frames[f - 1];
    let sum = 0;
    for (let b = 0; b < current.length; b++) {
      const rise = current[b] - previous[b];
      if (rise > 0) sum += rise;
    }
    flux[f] = finite(sum);
  }
  const frameMs = (hop / sampleRate) * 1000;
  const width = Math.max(1, Math.round(smoothMs / frameMs));
  if (width <= 1) return { envelope: flux, frameMs };
  const smoothed = new Float32Array(flux.length);
  let running = 0;
  let count = 0;
  let head = 0;
  for (let i = 0; i < flux.length; i++) {
    running += flux[i];
    count++;
    if (count > width) {
      running -= flux[head];
      head++;
      count--;
    }
    smoothed[i] = finite(running / count);
  }
  return { envelope: smoothed, frameMs };
}

/** peak-picking options: threshold factor and the minimum onset spacing. */
export type OnsetPeakOptions = { k?: number; minGapMs?: number };

/**
 * onsetPeaks — adaptive peak picking: a frame qualifies when it exceeds its
 * neighborhood mean plus `k` standard deviations (default 1.5), holds a
 * local maximum over ±2 frames, and sits at least `minGapMs` (default 60)
 * past the last accepted onset. Answers onset times in ms, ascending.
 */
export function onsetPeaks(envelope: Float32Array, frameMs: number, options: OnsetPeakOptions = {}): number[] {
  if (!Number.isFinite(frameMs) || frameMs <= 0)
    throw new RhythmError(`audiorhythm: frameMs must be finite > 0, got ${frameMs}`);
  const k = options.k ?? 1.5;
  const minGapMs = options.minGapMs ?? 60;
  let mean = 0;
  for (const v of envelope) mean += v;
  mean = envelope.length > 0 ? mean / envelope.length : 0;
  let variance = 0;
  for (const v of envelope) {
    const d = v - mean;
    variance += d * d;
  }
  const std = envelope.length > 1 ? Math.sqrt(variance / envelope.length) : 0;
  const threshold = mean + k * std;
  const onsets: number[] = [];
  let lastAcceptedMs = -Infinity;
  for (let i = 0; i < envelope.length; i++) {
    const v = envelope[i];
    if (!(v > threshold)) continue;
    if (i > 0 && envelope[i - 1] > v) continue;
    if (i + 1 < envelope.length && envelope[i + 1] > v) continue;
    const tMs = i * frameMs;
    if (tMs - lastAcceptedMs < minGapMs) continue;
    onsets.push(finite(tMs));
    lastAcceptedMs = tMs;
  }
  return onsets;
}

/** the rhythm facade answer the descriptor layer reads (the full read of
 * the onset layer: the contract summary plus the multiplier and the raw
 * estimate the fold produced it from — audiorhythm's own shape, distinct
 * from the DescriptorStats summary of the same name). */
export type RhythmRead = {
  bpm: number; // canonical bpm inside 70-160; 0 when no pulse was found
  multiplier: 0.5 | 1 | 2; // the fold that produced the canonical bpm
  confidence: number; // 0-1 pulse trust of the raw estimate
  onsetsPerSecond: number; // accepted peaks per second of envelope span
  regularityIndex: number; // 0-1: 1 = metronome, 0 = scatter
  swing: SwingRead; // beat-pair split read
  downbeatPeriodBeats: number; // beats per bar of the aligned grid
  rawBpm: number; // the estimate before the 70-160 fold
};

/** stats options: bpm bounds and the bar period handed to the grid. */
export type RhythmStatsOptions = { minBpm?: number; maxBpm?: number; periodBeats?: number; minGapMs?: number };

/**
 * rhythmStats — the full rhythm read of one sample slice: envelope, peaks,
 * tempo (estimate + canonical fold), swing, downbeat alignment and the
 * regularity index (1 - normalized interval spread over the inter-onset
 * gaps, metronomes near 1, scatter near 0). A pulse-less slice answers the
 * zero band (bpm 0, confidence 0, regularity 0) without throwing.
 */
export function rhythmStats(samples: Float32Array, sampleRate: number, options: RhythmStatsOptions = {}): RhythmRead {
  const { envelope, frameMs } = onsetEnvelope(samples, sampleRate);
  const onsets = onsetPeaks(envelope, frameMs, { minGapMs: options.minGapMs ?? 60 });
  const estimate: BpmEstimate = estimateBpm(envelope, frameMs, {
    minBpm: options.minBpm ?? 60,
    maxBpm: options.maxBpm ?? 200,
  });
  if (estimate.bpm <= 0 || onsets.length < 3) {
    return {
      bpm: 0,
      multiplier: 1,
      confidence: 0,
      onsetsPerSecond: 0,
      regularityIndex: 0,
      swing: { ratio: 0.5, swung: false },
      downbeatPeriodBeats: options.periodBeats ?? 4,
      rawBpm: 0,
    };
  }
  const canonical: CanonicalTempo = canonicalTempo(estimate.bpm);
  const gaps: number[] = [];
  for (let i = 1; i < onsets.length; i++) gaps.push(onsets[i] - onsets[i - 1]);
  const gapMean = gaps.reduce((acc, v) => acc + v, 0) / gaps.length;
  const gapSpread = Math.sqrt(gaps.reduce((acc, v) => acc + (v - gapMean) ** 2, 0) / gaps.length);
  const regularityIndex = clamp(1 - gapSpread / Math.max(gapMean, 1e-9), 0, 1);
  // the beat is the stronger onset: the swing anchor reads onset strengths
  // (envelope sampled at each onset) so loud onbeats outrank quiet offbeats.
  const weights = onsets.map((t) => envelopeSampleAt(envelope, frameMs, t));
  const swing: SwingRead = swingRatio(onsets, canonical.bpm, weights);
  const durationMs = envelope.length * frameMs;
  const grid: DownbeatGrid = downbeatGrid(canonical.bpm, durationMs, envelope, frameMs, {
    periodBeats: options.periodBeats ?? 4,
  });
  return {
    bpm: canonical.bpm,
    multiplier: canonical.multiplier,
    confidence: clamp(estimate.confidence, 0, 1),
    onsetsPerSecond: finite(onsets.length / Math.max(durationMs / 1000, 1e-9)),
    regularityIndex,
    swing,
    downbeatPeriodBeats: grid.periodBeats,
    rawBpm: finite(estimate.bpm),
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 7: audiospectrum.ts — the spectral analysis layer. */
/* ════════════════════════════════════════════════════════════════════ */

/** Error raised for malformed spectra, sample rates, band counts and frames. */
export class SpectrumError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "SpectrumError";
  }
}

/** the seven band edges in Hz: 8 edges delimiting 7 half-open [lo, hi) bands. */
export const BAND_EDGES_HZ: readonly number[] = [20, 60, 250, 500, 2000, 4000, 6000, 20000];

/** the seven band names, index-aligned with the BAND_EDGES_HZ pairs. */
export const BAND_NAMES: readonly string[] = [
  "sub-bass",
  "bass",
  "low-mid",
  "mid",
  "high-mid",
  "presence",
  "brilliance",
];

/** epsilon keeping log(0) finite inside the flatness geometric mean. */
const FLATNESS_EPSILON = 1e-12;

/** validates a positive finite sample rate. */
function checkedRate(sampleRate: number): void {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0)
    throw new SpectrumError(`audiospectrum: sampleRate must be finite > 0, got ${sampleRate}`);
}

/** validates rate + spectrum of a per-frame feature; returns the bin step. */
function checkedBinWidth(magnitudes: Float32Array, sampleRate: number, caller: string): number {
  if (magnitudes.length < 2)
    throw new SpectrumError(
      `audiospectrum: ${caller} needs a one-sided spectrum of length >= 2, got ${magnitudes.length}`,
    );
  checkedRate(sampleRate);
  return sampleRate / (2 * (magnitudes.length - 1));
}

/** hertz → mel on the HTK scale: 2595·log10(1 + f/700). */
export function hertzToMel(hz: number): number {
  return 2595 * Math.log10(1 + hz / 700);
}

/** mel → hertz on the HTK scale: the exact inverse of hertzToMel. */
export function melToHertz(mel: number): number {
  return 700 * (10 ** (mel / 2595) - 1);
}

/**
 * melbands — filters one magnitude frame through a triangular mel filterbank
 * (weighted mean per band). `bands + 2` centers sit linearly in mel from 0 Hz
 * to nyquist; band b rises over [center_b, center_{b+1}] and falls over
 * [center_{b+1}, center_{b+2}], each band divided by its own weight sum so a
 * flat spectrum reads as equal bands; a band too narrow to touch a bin falls
 * back to the nearest bin of its peak.
 */
export function melbands(magnitudes: Float32Array, sampleRate: number, bands = 40): Float32Array {
  const step = checkedBinWidth(magnitudes, sampleRate, "melbands");
  if (!Number.isInteger(bands) || bands < 1)
    throw new SpectrumError(`audiospectrum: bands must be an integer >= 1, got ${bands}`);
  const lastBin = magnitudes.length - 1;
  const melMax = hertzToMel(sampleRate / 2);
  const out = new Float32Array(bands);
  for (let band = 0; band < bands; band++) {
    const lo = melToHertz((melMax * band) / (bands + 1));
    const peak = melToHertz((melMax * (band + 1)) / (bands + 1));
    const hi = melToHertz((melMax * (band + 2)) / (bands + 1));
    const first = Math.max(0, Math.ceil(lo / step));
    const stop = Math.min(lastBin + 1, Math.ceil(hi / step));
    let weighted = 0,
      weights = 0;
    for (let k = first; k < stop; k++) {
      const f = k * step;
      const w = Math.min((f - lo) / (peak - lo), (hi - f) / (hi - peak));
      if (w <= 0) continue;
      weighted += Math.max(magnitudes[k], 0) * w;
      weights += w;
    }
    out[band] =
      weights > 0
        ? finite(weighted / weights)
        : finite(Math.max(magnitudes[Math.min(lastBin, Math.max(0, Math.round(peak / step)))], 0));
  }
  return out;
}

/**
 * spectralCentroid — the magnitude-weighted mean frequency of one frame in
 * Hz: the center of mass of the spectrum. Digital silence reads 0.
 */
export function spectralCentroid(magnitudes: Float32Array, sampleRate: number): number {
  const step = checkedBinWidth(magnitudes, sampleRate, "spectralCentroid");
  let weighted = 0,
    total = 0;
  for (let k = 0; k < magnitudes.length; k++) {
    const m = Math.max(magnitudes[k], 0);
    weighted += m * k;
    total += m;
  }
  if (total <= 0) return 0;
  return finite((weighted / total) * step);
}

/**
 * spectralRolloff — the frequency in Hz below which `threshold` (default
 * 0.85) of the frame's magnitude sum has accumulated; the brightness cutoff.
 * Digital silence reads 0.
 */
export function spectralRolloff(magnitudes: Float32Array, sampleRate: number, threshold = 0.85): number {
  const step = checkedBinWidth(magnitudes, sampleRate, "spectralRolloff");
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 1)
    throw new SpectrumError(`audiospectrum: threshold must be within (0, 1], got ${threshold}`);
  let total = 0;
  for (let k = 0; k < magnitudes.length; k++) total += Math.max(magnitudes[k], 0);
  if (total <= 0) return 0;
  const target = threshold * total;
  let cumulative = 0;
  for (let k = 0; k < magnitudes.length; k++) {
    cumulative += Math.max(magnitudes[k], 0);
    if (cumulative >= target) return finite(k * step);
  }
  return finite((magnitudes.length - 1) * step);
}

/**
 * spectralFlatness — geometric mean over arithmetic mean of the magnitudes,
 * within [0, 1]: near 0 for a pure tone (one spike on a quiet floor), near 1
 * for noise (an even floor). Digital silence reads 0.
 */
export function spectralFlatness(magnitudes: Float32Array): number {
  if (magnitudes.length < 1)
    throw new SpectrumError(`audiospectrum: spectralFlatness needs a non-empty spectrum, got ${magnitudes.length}`);
  let logSum = 0,
    sum = 0;
  for (let k = 0; k < magnitudes.length; k++) {
    const m = Math.max(magnitudes[k], 0);
    logSum += Math.log(m + FLATNESS_EPSILON);
    sum += m;
  }
  if (sum <= 0) return 0;
  const geometric = Math.exp(logSum / magnitudes.length) / (sum / magnitudes.length + FLATNESS_EPSILON);
  return finite(Math.min(1, geometric));
}

/**
 * spectralFlux — the half-wave rectified bin diff between two frames, summed
 * over bins: how much energy arrived since the previous frame. Onsets light
 * up, steady frames read 0. Frame lengths must match.
 */
export function spectralFlux(current: Float32Array, previous: Float32Array): number {
  if (current.length !== previous.length)
    throw new SpectrumError(
      `audiospectrum: spectralFlux frames differ in length (${current.length} vs ${previous.length})`,
    );
  let flux = 0;
  for (let k = 0; k < current.length; k++) flux += Math.max(0, Math.max(current[k], 0) - Math.max(previous[k], 0));
  return finite(flux);
}

/**
 * bandEnergies — sums the magnitudes of the seven fixed bands (BAND_EDGES_HZ,
 * half-open in Hz; DC stays out; a band past nyquist reads 0), in order.
 */
export function bandEnergies(magnitudes: Float32Array, sampleRate: number): Float32Array {
  const step = checkedBinWidth(magnitudes, sampleRate, "bandEnergies");
  const out = new Float32Array(BAND_NAMES.length);
  for (let band = 0; band < BAND_NAMES.length; band++) {
    const first = Math.max(1, Math.ceil(BAND_EDGES_HZ[band] / step));
    const stop = Math.min(magnitudes.length, Math.ceil(BAND_EDGES_HZ[band + 1] / step));
    let energy = 0;
    for (let k = first; k < stop; k++) energy += Math.max(magnitudes[k], 0);
    out[band] = finite(energy);
  }
  return out;
}

/** arithmetic mean of a series (empty reads 0). */
function mean(values: readonly number[]): number {
  return values.length > 0 ? values.reduce((acc, value) => acc + value, 0) / values.length : 0;
}

/** population standard deviation (divide by n; a single value reads 0). */
function stdDev(values: readonly number[], meanValue: number): number {
  if (values.length < 2) return 0;
  return Math.sqrt(values.reduce((acc, value) => acc + (value - meanValue) ** 2, 0) / values.length);
}

/**
 * summarizeSpectrum — aggregates a stack of one-sided magnitude frames (the
 * stft output shape) into one SpectralSummary; frames must share their bin
 * count and at least one be given. Flux diffs consecutive frames (frame 0
 * counts 0); bandBalance normalizes mean band energies to sum 1 (uniform
 * 1/7 fallback on silence).
 */
export function summarizeSpectrum(frames: readonly Float32Array[], sampleRate: number): SpectralSummary {
  if (frames.length === 0) throw new SpectrumError("audiospectrum: summarizeSpectrum needs at least one frame");
  checkedRate(sampleRate);
  const bins = frames[0].length;
  for (let f = 0; f < frames.length; f++) {
    if (frames[f].length !== bins)
      throw new SpectrumError(`audiospectrum: frame ${f} has ${frames[f].length} bins, expected ${bins}`);
  }
  const centroids: number[] = [],
    rolloffs: number[] = [],
    flatnesses: number[] = [],
    fluxes: number[] = [];
  const bandAcc = new Float64Array(BAND_NAMES.length);
  for (let f = 0; f < frames.length; f++) {
    const frame = frames[f];
    centroids.push(spectralCentroid(frame, sampleRate));
    rolloffs.push(spectralRolloff(frame, sampleRate));
    flatnesses.push(spectralFlatness(frame));
    fluxes.push(f === 0 ? 0 : spectralFlux(frame, frames[f - 1]));
    const bands = bandEnergies(frame, sampleRate);
    for (let b = 0; b < bands.length; b++) bandAcc[b] += bands[b];
  }
  const centroidMean = mean(centroids);
  const flatnessMean = mean(flatnesses);
  const fluxMean = mean(fluxes);
  const bandTotal = bandAcc.reduce((acc, energy) => acc + energy, 0);
  const uniform = 1 / BAND_NAMES.length;
  return {
    centroidMean: finite(centroidMean),
    centroidStd: finite(stdDev(centroids, centroidMean)),
    rolloffMean: finite(mean(rolloffs)),
    flatnessMean: finite(flatnessMean),
    flatnessStd: finite(stdDev(flatnesses, flatnessMean)),
    fluxMean: finite(fluxMean),
    fluxStd: finite(stdDev(fluxes, fluxMean)),
    bandBalance: BAND_NAMES.map((_, b) => finite(bandTotal > 0 ? bandAcc[b] / bandTotal : uniform)),
    brightnessIndex: finite(Math.min(1, Math.max(0, centroidMean / (sampleRate / 2)))),
  };
}

/**
 * spectrogramImage — decimates magnitude frames into a grayscale width×height
 * image for the visualize pipeline, column-major (index = x·height + y: x is
 * time, y is frequency, y = 0 at the low end). Frames and bins pool by max
 * (the per-cell min/max rule that keeps transients alive) over log1p
 * magnitudes, then a per-image min/max stretch maps to 0..255; silence → 0.
 */
export function spectrogramImage(frames: readonly Float32Array[], width: number, height: number): Uint8ClampedArray {
  if (frames.length === 0) throw new SpectrumError("audiospectrum: spectrogramImage needs at least one frame");
  if (!Number.isInteger(width) || width < 1 || !Number.isInteger(height) || height < 1)
    throw new SpectrumError(`audiospectrum: width and height must be integers >= 1, got ${width}x${height}`);
  const bins = frames[0].length;
  if (bins < 1) throw new SpectrumError("audiospectrum: spectrogramImage frames must not be empty");
  for (let f = 0; f < frames.length; f++) {
    if (frames[f].length !== bins)
      throw new SpectrumError(`audiospectrum: frame ${f} has ${frames[f].length} bins, expected ${bins}`);
  }
  const cellCount = width * height;
  const cells = new Float64Array(cellCount);
  let min = Infinity,
    max = -Infinity;
  for (let x = 0; x < width; x++) {
    const start = Math.min(Math.floor((x * frames.length) / width), frames.length - 1);
    const stop = Math.min(Math.max(Math.floor(((x + 1) * frames.length) / width), start + 1), frames.length);
    for (let y = 0; y < height; y++) {
      const binStart = Math.min(Math.floor((y * bins) / height), bins - 1);
      const binStop = Math.min(Math.max(Math.floor(((y + 1) * bins) / height), binStart + 1), bins);
      let peak = -Infinity;
      for (let f = start; f < stop; f++) {
        const frame = frames[f];
        for (let k = binStart; k < binStop; k++) peak = Math.max(peak, Math.log1p(Math.max(frame[k], 0)));
      }
      const cell = finite(peak, 0);
      cells[x * height + y] = cell;
      if (cell < min) min = cell;
      if (cell > max) max = cell;
    }
  }
  const image = new Uint8ClampedArray(cellCount);
  if (max > min) {
    const scale = 255 / (max - min);
    for (let i = 0; i < cellCount; i++) image[i] = Math.round((cells[i] - min) * scale);
  }
  return image;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 8: audiostructure.ts — the structure layer. */
/* ════════════════════════════════════════════════════════════════════ */

/** one feature vector per analysis frame (band energies, mel bins, …) — all the caller brings. */
export type FeatureFrames = readonly Float32Array[];
/** the role a section plays in the energy narrative. */
export type SectionRole = "intro" | "build" | "peak" | "break" | "outro";
/** one composition section: half-open [startMs, endMs) plus its energy stats. */
export type Section = { startMs: number; endMs: number; role: SectionRole; energyMean: number; energyPeak: number };
/** the complete structure feed for the imagery waves (the raw layer shape —
 * the DescriptorStats summary of the same name folds it through
 * canonicalStructure). */
export type RawStructureStats = {
  sections: Section[];
  durationMs: number;
  peakSectionMs: number;
  repetitionIndex: number;
  narrativeShape: NarrativeShape;
};
// NoveltyOptions: frameRate is Hz, smoothingMs widens both the comparison windows and the smoothing box.
export type NoveltyOptions = { frameRate: number; smoothingMs?: number };
// BoundaryOptions: threshold defaults to mean + 1.5·std of the novelty; minSectionMs guards section length.
export type BoundaryOptions = { minSectionMs?: number; threshold?: number };
export type EnergyOptions = { points?: number };
export type StructureOptions = { smoothingMs?: number; minSectionMs?: number; threshold?: number; points?: number };

/** tensionCurve weights: 40% peak-scaled novelty + 60% energy (documented, deterministic). */
export const TENSION_NOVELTY_WEIGHT = 0.4;
export const TENSION_ENERGY_WEIGHT = 0.6;

// narrative heuristics: flatness floor, half drift for rise/fall, center-peak margin for arch.
const FLAT_STD = 0.08;
const HALF_DRIFT = 0.15;
const ARCH_MARGIN = 0.2;

/** cosine similarity over the shorter vector, NaN-guarded and clamped to 0–1; zero vectors answer 0. */
function cosim(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const dim = Math.min(a.length, b.length);
  let dot = 0,
    na = 0,
    nb = 0;
  for (let d = 0; d < dim; d += 1) {
    const x = a[d];
    const y = b[d];
    if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const den = Math.sqrt(na) * Math.sqrt(nb);
  return den > 0 && Number.isFinite(dot) ? Math.max(0, Math.min(1, dot / den)) : 0;
}

function meanOf(x: ArrayLike<number>): number {
  let sum = 0;
  for (let i = 0; i < x.length; i += 1) sum += x[i];
  return x.length > 0 ? sum / x.length : 0;
}

function stdOf(x: ArrayLike<number>, mean: number): number {
  let sum = 0;
  for (let i = 0; i < x.length; i += 1) sum += (x[i] - mean) * (x[i] - mean);
  return x.length > 0 ? Math.sqrt(sum / x.length) : 0;
}

/** frameEnergies — the internal RMS: quadratic mean of each feature vector (tracks signal RMS for magnitude-like features); empty or NaN frames answer 0. */
export function frameEnergies(frames: FeatureFrames): Float32Array {
  const out = new Float32Array(frames.length);
  for (let f = 0; f < frames.length; f += 1) {
    const v = frames[f];
    let sum = 0;
    for (let d = 0; d < v.length; d += 1) if (Number.isFinite(v[d])) sum += v[d] * v[d];
    out[f] = v.length > 0 ? Math.sqrt(sum / v.length) : 0;
  }
  return out;
}

/** centered moving average with a running sum; edges shrink the window and float dust clamps into [0, 1]. */
function smoothbox(x: Float32Array, width: number): Float32Array {
  const n = x.length;
  if (width <= 1 || n === 0) return x;
  const half = Math.floor(width / 2);
  const out = new Float32Array(n);
  const stop = Math.min(n - 1, half);
  let sum = 0;
  for (let j = 0; j <= stop; j += 1) sum += x[j];
  let count = stop + 1;
  for (let i = 0; i < n; i += 1) {
    out[i] = sum / count >= 1 ? 1 : sum / count > 0 ? sum / count : 0;
    if (i + 1 + half < n) {
      sum += x[i + 1 + half];
      count += 1;
    }
    if (i - half >= 0) {
      sum -= x[i - half];
      count -= 1;
    }
  }
  return out;
}

/**
 * noveltyCurve — the self-similarity novelty: per frame, the mean feature vectors of the
 * adjacent windows before and after it (each ~smoothingMs/2 wide — the diagonal checkerboard
 * of the self-similarity matrix) are compared by cosine distance, then the raw curve is
 * smoothed with a centered moving average ~smoothingMs/4 wide — narrow enough to settle
 * frame noise without smearing the joint spike it exists to expose. Edge windows shrink;
 * empty windows and zero-norm vectors answer 0; the curve stays inside [0, 1].
 */
export function noveltyCurve(frames: FeatureFrames, options: NoveltyOptions): Float32Array {
  const n = frames.length;
  const rate = options.frameRate;
  if (n === 0 || !Number.isFinite(rate) || rate <= 0) return new Float32Array(0);
  const span =
    options.smoothingMs !== undefined && Number.isFinite(options.smoothingMs) && options.smoothingMs > 0
      ? options.smoothingMs
      : 800;
  const half = Math.max(1, Math.round((span / 2000) * rate));
  // smoothing box = a quarter of the comparison span, so the joint spike survives its own denoising
  const width = Math.max(1, Math.round((span / 4000) * rate));
  let dim = 0;
  for (let f = 0; f < n; f += 1) dim = Math.max(dim, frames[f].length);
  const prefix = new Float64Array((n + 1) * dim);
  for (let f = 0; f < n; f += 1) {
    const v = frames[f];
    for (let d = 0; d < dim; d += 1) {
      const x = d < v.length ? v[d] : 0;
      prefix[(f + 1) * dim + d] = prefix[f * dim + d] + (Number.isFinite(x) ? x : 0);
    }
  }
  const a = new Float64Array(dim);
  const b = new Float64Array(dim);
  const raw = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const from = Math.max(0, i - half);
    const to = Math.min(n, i + half);
    if (from >= i || to <= i) continue;
    for (let d = 0; d < dim; d += 1) {
      a[d] = (prefix[i * dim + d] - prefix[from * dim + d]) / (i - from);
      b[d] = (prefix[to * dim + d] - prefix[i * dim + d]) / (to - i);
    }
    raw[i] = 1 - cosim(a, b);
  }
  return smoothbox(raw, width);
}

/**
 * structureBoundaries — peak picking on the novelty: a boundary is a frame above
 * `threshold` (default mean + 1.5·std) that is a local maximum; candidates are then
 * greedily kept strongest-first under the minimum-section guarantee (no two kept
 * boundaries closer than minSectionMs — a huge minSectionMs still keeps the strongest
 * one). Answers boundary times in ms, ascending; a flat novelty answers none.
 */
export function structureBoundaries(novelty: Float32Array, frameRate: number, options: BoundaryOptions = {}): number[] {
  const n = novelty.length;
  if (n === 0 || !Number.isFinite(frameRate) || frameRate <= 0) return [];
  const mean = meanOf(novelty);
  const threshold =
    options.threshold !== undefined && Number.isFinite(options.threshold)
      ? options.threshold
      : mean + 1.5 * stdOf(novelty, mean);
  const minMs =
    options.minSectionMs !== undefined && Number.isFinite(options.minSectionMs) ? options.minSectionMs : 8000;
  const minGap = Math.max(1, Math.round((minMs / 1000) * frameRate));
  const candidates: number[] = [];
  for (let i = 0; i < n; i += 1) {
    if (novelty[i] <= threshold) continue;
    if (novelty[i] >= (i > 0 ? novelty[i - 1] : -Infinity) && novelty[i] >= (i < n - 1 ? novelty[i + 1] : -Infinity))
      candidates.push(i);
  }
  const kept: number[] = [];
  for (const frame of [...candidates].sort((a, b) => novelty[b] - novelty[a] || a - b)) {
    if (kept.every((k) => Math.abs(k - frame) >= minGap)) kept.push(frame);
  }
  return kept.sort((a, b) => a - b).map((frame) => (frame / frameRate) * 1000);
}

// role rules: a lone section is its own "peak"; first = "intro", last = "outro"; middle sections rank
// by energyMean — the top ⌊m/3⌋ (at least one) become "peak", the bottom ⌊m/3⌋ become "break" (only
// when m ≥ 3) and the rest stay "build".
function assignRoles(sections: Section[]): void {
  const count = sections.length;
  if (count === 0) return;
  if (count === 1) {
    sections[0].role = "peak";
    return;
  }
  sections[0].role = "intro";
  sections[count - 1].role = "outro";
  const middles = sections.slice(1, count - 1).map((section, index) => ({ section, index }));
  middles.sort((a, b) => a.section.energyMean - b.section.energyMean || a.index - b.index);
  const tops = Math.max(1, Math.floor(middles.length / 3));
  const bottoms = middles.length >= 3 ? tops : 0;
  middles.forEach((entry, rank) => {
    entry.section.role = rank >= middles.length - tops ? "peak" : rank < bottoms ? "break" : "build";
  });
}

/**
 * labelSections — tiles [0, durationMs) at the given boundaries (0 and the duration are
 * implicit; boundaries are clamped into the open interval, sorted and deduped) and assigns
 * roles by the documented quantile rules. Energy stats come from the frame range each
 * section covers (the tail edge clamps to at least one frame), so adjacent sections share
 * at most their edge frame.
 */
export function labelSections(boundaries: readonly number[], energyFrames: Float32Array, frameRate: number): Section[] {
  const n = energyFrames.length;
  if (n === 0 || !Number.isFinite(frameRate) || frameRate <= 0) return [];
  const durationMs = (n / frameRate) * 1000;
  const clipped = boundaries
    .filter((b) => Number.isFinite(b))
    .map((b) => Math.min(durationMs, Math.max(0, b)))
    .sort((a, b) => a - b);
  const edges: number[] = [0];
  for (const b of clipped) if (b > 1e-9 && b < durationMs - 1e-9 && b - edges[edges.length - 1] >= 1e-6) edges.push(b);
  edges.push(durationMs);
  const sections: Section[] = [];
  for (let s = 0; s + 1 < edges.length; s += 1) {
    const f0 = Math.min(n - 1, Math.max(0, Math.round((edges[s] / 1000) * frameRate)));
    const f1 = Math.min(n, Math.max(f0 + 1, Math.round((edges[s + 1] / 1000) * frameRate)));
    let sum = 0;
    let peak = 0;
    for (let f = f0; f < f1; f += 1) {
      sum += energyFrames[f];
      peak = Math.max(peak, energyFrames[f]);
    }
    sections.push({
      startMs: edges[s],
      endMs: edges[s + 1],
      role: "build",
      energyMean: sum / (f1 - f0),
      energyPeak: peak,
    });
  }
  assignRoles(sections);
  return sections;
}

/**
 * energyCurve — the 0–1 energy narrative for motion choreography: the RMS frames linearly
 * resampled to `points` samples, then peak-normalized (the loudest sample is exactly 1).
 * Silence and empty input answer all zeros of the requested length.
 */
export function energyCurve(rmsFrames: Float32Array, options: EnergyOptions = {}): Float32Array {
  const raw = options.points;
  const points = raw === undefined || !Number.isFinite(raw) ? 64 : Math.max(1, Math.trunc(raw));
  const n = rmsFrames.length;
  const out = new Float32Array(points);
  for (let k = 0; k < points && n > 0; k += 1) {
    const pos = points === 1 ? (n - 1) / 2 : (k * (n - 1)) / (points - 1);
    const i0 = Math.floor(pos);
    const v = rmsFrames[i0] * (1 - (pos - i0)) + rmsFrames[Math.min(n - 1, i0 + 1)] * (pos - i0);
    out[k] = Number.isFinite(v) ? v : 0;
  }
  let top = 0;
  for (let k = 0; k < points; k += 1) top = Math.max(top, out[k]);
  if (top > 0) for (let k = 0; k < points; k += 1) out[k] = clamp01(out[k] / top);
  return out;
}

/** linear sample of a curve at relative position t ∈ [0, 1]. */
function sampleAt(curve: Float32Array, t: number): number {
  const m = curve.length;
  if (m === 0) return 0;
  const pos = Math.max(0, Math.min(1, t)) * (m - 1);
  const i0 = Math.floor(pos);
  return curve[i0] + (curve[Math.min(m - 1, i0 + 1)] - curve[i0]) * (pos - i0);
}

/**
 * tensionCurve — the combined choreography feed: novelty peak-scaled to 0–1 and resampled
 * to the energy length, then TENSION_NOVELTY_WEIGHT·novelty + TENSION_ENERGY_WEIGHT·energy
 * (40% change, 60% loudness), clamped to 0–1; as long as `energy`, never NaN.
 */
export function tensionCurve(novelty: Float32Array, energy: Float32Array): Float32Array {
  const out = new Float32Array(energy.length);
  let top = 0;
  for (let i = 0; i < novelty.length; i += 1) if (Number.isFinite(novelty[i])) top = Math.max(top, novelty[i]);
  for (let k = 0; k < energy.length; k += 1) {
    const nov = top > 0 ? sampleAt(novelty, energy.length === 1 ? 0.5 : k / (energy.length - 1)) / top : 0;
    out[k] = clamp01(TENSION_NOVELTY_WEIGHT * clamp01(nov) + TENSION_ENERGY_WEIGHT * clamp01(energy[k]));
  }
  return out;
}

/**
 * repetitionIndexOf — blockiness of the self-similarity lag curve: mean cosine similarity
 * between frames one lag apart, per lag, over lags from max(minSectionMs, 2 s) to half the
 * track; the strongest lag is scored against the lag-curve baseline as
 * (best − baseline) / (1 − baseline), 0–1 clamped. No lag contrast (or too short) → 0.
 */
function repetitionIndexOf(frames: FeatureFrames, frameRate: number, minSectionMs: number): number {
  const n = frames.length;
  if (n < 4 || !Number.isFinite(frameRate) || frameRate <= 0) return 0;
  const minMs = Number.isFinite(minSectionMs) && minSectionMs > 0 ? minSectionMs : 8000;
  const minLag = Math.max(1, Math.round((Math.max(minMs, 2000) / 1000) * frameRate));
  const maxLag = Math.floor(n / 2);
  if (minLag > maxLag) return 0;
  const step = Math.max(1, Math.round(minLag / 4));
  let best = 0,
    total = 0,
    lags = 0;
  for (let lag = minLag; lag <= maxLag; lag += step) {
    let sum = 0;
    for (let i = 0; i + lag < n; i += 1) sum += cosim(frames[i], frames[i + lag]);
    best = Math.max(best, sum / (n - lag));
    total += sum / (n - lag);
    lags += 1;
  }
  return clamp01((best - total / lags) / Math.max(1 - total / lags, 1e-6));
}

/**
 * narrativeShapeOf — documented heuristics over the peak-normalized energy curve: std < 0.08
 * is "flat"; the second half mean above/below the first half by ≥ 0.15 is "rise"/"fall";
 * otherwise a maximum standing in the middle half and ≥ 0.2 over both edge quarters is
 * "arch"; anything else is "wave".
 */
function narrativeShapeOf(curve: Float32Array): NarrativeShape {
  const n = curve.length;
  if (n < 2) return "flat";
  const mean = meanOf(curve);
  if (stdOf(curve, mean) < FLAT_STD) return "flat";
  const half = Math.floor(n / 2);
  const drift = meanOf(curve.subarray(half)) - meanOf(curve.subarray(0, half));
  if (drift >= HALF_DRIFT) return "rise";
  if (drift <= -HALF_DRIFT) return "fall";
  let peakIdx = 0;
  for (let i = 1; i < n; i += 1) if (curve[i] > curve[peakIdx]) peakIdx = i;
  const quarter = Math.max(1, Math.floor(n / 4));
  const edge = Math.max(meanOf(curve.subarray(0, quarter)), meanOf(curve.subarray(n - quarter)));
  if (peakIdx >= quarter && peakIdx <= n - 1 - quarter && curve[peakIdx] - edge >= ARCH_MARGIN) return "arch";
  return "wave";
}

/**
 * analyzeStructure — the full composition feed in one deterministic pass: internal RMS,
 * novelty, boundaries, labeled sections, energy narrative, repetition index and narrative
 * shape. peakSectionMs is the startMs of the loudest "peak" section (falling back to the
 * loudest section of any role). Empty or invalid input answers a zeroed "flat" report.
 */
export function analyzeStructure(
  frames: FeatureFrames,
  frameRate: number,
  options: StructureOptions = {},
): RawStructureStats {
  const rms = frameEnergies(frames);
  if (rms.length === 0 || !Number.isFinite(frameRate) || frameRate <= 0) {
    return { sections: [], durationMs: 0, peakSectionMs: 0, repetitionIndex: 0, narrativeShape: "flat" };
  }
  const novelty = noveltyCurve(frames, { frameRate, smoothingMs: options.smoothingMs });
  const boundaries = structureBoundaries(novelty, frameRate, {
    minSectionMs: options.minSectionMs,
    threshold: options.threshold,
  });
  const sections = labelSections(boundaries, rms, frameRate);
  let peakSectionMs = 0;
  let best = -Infinity;
  for (const section of sections) {
    const score = section.energyMean + (section.role === "peak" ? 1e9 : 0);
    if (score > best) {
      best = score;
      peakSectionMs = section.startMs;
    }
  }
  return {
    sections,
    durationMs: (rms.length / frameRate) * 1000,
    peakSectionMs,
    repetitionIndex: repetitionIndexOf(frames, frameRate, options.minSectionMs ?? 8000),
    narrativeShape: narrativeShapeOf(energyCurve(rms, { points: options.points })),
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 9: audiotimbreenv.ts — the frame-envelope half of the timbre layer. */
/* ════════════════════════════════════════════════════════════════════ */

export const DB_FLOOR = -90;

/** default analysis window in samples, shared by every frame-domain helper. */
export const DEFAULT_SIZE = 1024;

/** default frame advance in samples — 50 % overlap at the default size. */
export const DEFAULT_HOP = 512;

/** frame-domain options: window size and hop, both in samples. */
export type EnvelopeOptions = { size?: number; hop?: number };

/** the loudness spread of an envelope; every field is finite and clamped. */
export type DynamicStats = {
  minDb: number;
  maxDb: number;
  rangeDb: number;
  meanDb: number;
  crestFactor: number;
};

/** how one onset rises and falls: 10–90 % attack in ms, peak→25 % decay in ms, linear peak. */
export type OnsetShape = { attackMs: number; decayMs: number; peak: number };

/** count of analysis frames over `n` samples — the one framing rule of the timbre layer. */
export function framecount(n: number, size: number, hop: number): number {
  if (!Number.isFinite(n) || n < 1) return 0;
  const s = Math.max(1, Math.trunc(size));
  const h = Math.max(1, Math.trunc(hop));
  return n <= s ? 1 : Math.floor((n - s) / h) + 1;
}

/** amplitude → decibels (20·log10 against full scale 1.0), floored at −90 dB, never NaN. */
export function todb(v: number): number {
  const a = Number.isFinite(v) ? Math.abs(v) : 0;
  return a <= 0 ? DB_FLOOR : Math.max(DB_FLOOR, 20 * Math.log10(a));
}

function clean(v: number): number {
  return Number.isFinite(v) ? v : 0;
}

/** RMS envelope, one value per hop (linear amplitude, never negative, never NaN). */
export function rmsEnvelope(samples: ArrayLike<number>, opts?: EnvelopeOptions): Float32Array {
  const n = samples?.length ?? 0;
  const size = Math.max(1, Math.trunc(opts?.size ?? DEFAULT_SIZE));
  const hop = Math.max(1, Math.trunc(opts?.hop ?? DEFAULT_HOP));
  const frames = framecount(n, size, hop);
  const out = new Float32Array(frames);
  const span = Math.min(size, Math.max(1, n));
  for (let f = 0; f < frames; f++) {
    const start = Math.min(f * hop, n - span);
    let sum = 0;
    for (let i = 0; i < span; i++) {
      const v = clean(samples[start + i]);
      sum += v * v;
    }
    out[f] = Math.sqrt(sum / span);
  }
  return out;
}

/** loudness spread of a linear envelope; silence answers the floor everywhere with crest factor 1. */
export function dynamicStats(rms: ArrayLike<number>): DynamicStats {
  const n = rms?.length ?? 0;
  if (n < 1) return { minDb: DB_FLOOR, maxDb: DB_FLOOR, rangeDb: 0, meanDb: DB_FLOOR, crestFactor: 1 };
  let minDb = Infinity;
  let maxDb = -Infinity;
  let sumDb = 0;
  let sumSq = 0;
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, clean(rms[i]));
    const db = todb(a);
    if (db < minDb) minDb = db;
    if (db > maxDb) maxDb = db;
    sumDb += db;
    sumSq += a * a;
    if (a > peak) peak = a;
  }
  const overall = Math.sqrt(sumSq / n);
  const crest = overall > 0 ? Math.min(peak / overall, 10 ** (-DB_FLOOR / 20)) : 1;
  return { minDb, maxDb, rangeDb: maxDb - minDb, meanDb: sumDb / n, crestFactor: crest };
}

/** attack/decay shaping per onset (milliseconds in, shapes out, order preserved, nothing throws). */
export function onsetShapes(
  rms: ArrayLike<number>,
  onsetsMs: readonly number[],
  sampleRate: number,
  opts?: { hop?: number; attackMs?: number; decayMs?: number },
): OnsetShape[] {
  const n = rms?.length ?? 0;
  const sr = Number.isFinite(sampleRate) && sampleRate > 0 ? sampleRate : 0;
  const hop = Math.max(1, Math.trunc(opts?.hop ?? DEFAULT_HOP));
  const attackWin = Math.max(0, opts?.attackMs ?? 250);
  const decayWin = Math.max(attackWin, opts?.decayMs ?? 400);
  const msPerFrame = sr > 0 ? (1000 * hop) / sr : 0;
  const framesOf = (ms: number): number =>
    Math.max(0, Math.round((Math.max(0, Number.isFinite(ms) ? ms : 0) / 1000) * (sr / hop)));
  const shapes: OnsetShape[] = [];
  for (const raw of Array.isArray(onsetsMs) ? onsetsMs : []) {
    const onset = Math.min(Math.max(0, n - 1), framesOf(raw));
    const aEnd = Math.min(n, onset + Math.max(1, framesOf(attackWin)));
    const dEnd = Math.min(n, onset + Math.max(aEnd - onset, framesOf(decayWin)));
    let peak = 0;
    let peakAt = onset;
    for (let i = onset; i < dEnd; i++) {
      const a = Math.max(0, clean(rms[i]));
      if (a > peak) {
        peak = a;
        peakAt = i;
      }
    }
    const rise = 0.1 * peak;
    const set = 0.9 * peak;
    let start = -1;
    let end = -1;
    for (let i = onset; i < aEnd; i++) {
      const a = Math.max(0, clean(rms[i]));
      if (start < 0 && a >= rise) start = i;
      if (start >= 0 && a >= set) {
        end = i;
        break;
      }
    }
    const attackMs = peak <= 0 ? 0 : end >= 0 ? (end - start) * msPerFrame : attackWin;
    let decayMs = 0;
    if (peak > 0) {
      const fade = 0.25 * peak;
      decayMs = decayWin;
      for (let i = peakAt; i < dEnd; i++) {
        if (Math.max(0, clean(rms[i])) <= fade) {
          decayMs = (i - peakAt) * msPerFrame;
          break;
        }
      }
    }
    shapes.push({ attackMs, decayMs, peak });
  }
  return shapes;
}

/** zero-crossing rate per frame, each clamped into [0, 1] (1 = sign flips every sample). */
export function zcr(samples: ArrayLike<number>, opts?: EnvelopeOptions): Float32Array {
  const n = samples?.length ?? 0;
  const size = Math.max(1, Math.trunc(opts?.size ?? DEFAULT_SIZE));
  const hop = Math.max(1, Math.trunc(opts?.hop ?? DEFAULT_HOP));
  const frames = framecount(n, size, hop);
  const out = new Float32Array(frames);
  const span = Math.min(size, Math.max(1, n));
  for (let f = 0; f < frames; f++) {
    const start = Math.min(f * hop, n - span);
    let flips = 0;
    for (let i = start + 1; i < start + span; i++) {
      if (clean(samples[i - 1]) >= 0 !== clean(samples[i]) >= 0) flips++;
    }
    out[f] = span > 1 ? Math.min(1, flips / (span - 1)) : 0;
  }
  return out;
}

/** aggregate zero-crossing rate over the whole buffer; fewer than two samples answers 0. */
export function zcrrate(samples: ArrayLike<number>): number {
  const n = samples?.length ?? 0;
  if (n < 2) return 0;
  let flips = 0;
  for (let i = 1; i < n; i++) {
    if (clean(samples[i - 1]) >= 0 !== clean(samples[i]) >= 0) flips++;
  }
  return Math.min(1, flips / (n - 1));
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 10: audiotimbre.ts — the spectral-timbre half (mel/MFCC). */
/* ════════════════════════════════════════════════════════════════════ */

/** filter count of the mel bank — the classic 26-filter front end. */
export const MEL_BANDS = 26;

/** coefficient count answered by mfcc when the caller does not choose. */
export const DEFAULT_COEFFICIENTS = 13;

/** mel-bank options: filter count and the frequency span the triangles cover. */
export type MelOptions = { bands?: number; fmin?: number; fmax?: number };
/** mfcc options — the mel-bank span plus how many coefficients to keep. */
export type MfccOptions = MelOptions & { coefficients?: number };
/** timbreStats options — framing plus the mfcc front end, nothing else. */
export type TimbreOptions = MfccOptions & { size?: number; hop?: number };

/** the wave-1 paint-texture contract: one audio take → the numbers that steer brush texture.
 *
 * Every field maps to visual texture downstream: `noisiness` drives grain — the speckle density the
 * brush scatters over the canvas (white-noise takes grain heavily, pure tones stay glassy smooth);
 * `warmth` drives stroke softness — low-mid energy renders as soft round glazes, bright takes as
 * crisp thin strokes; `dynamics.rangeDb` drives contrast — how far the value scale may spread
 * between the darkest and the lightest paint (wide range earns chiaroscuro, compressed stays milky);
 * `brightness` places the palette toward light/cool zones on a high centroid and deep/warm ones on a
 * low one; `slopeMean` tilts the texture gradient; the mfcc vectors shape brush character and
 * `zcrMean` adds fine grit. All fields are finite and clamped — generators need no guarding.
 */
export type TimbreRead = {
  mfccMean: number[]; // mean of the per-frame MFCC vector (13 entries by default)
  mfccStd: number[]; // population std of the same coefficients across frames
  slopeMean: number; // mean spectral tilt (log-log), negative = dark-heavy
  zcrMean: number; // mean zero-crossing rate, clamped [0, 1]
  noisiness: number; // spectral flatness mean in [0, 1] — the grain dial
  warmth: number; // low-mid power share in [0, 1] — the stroke-softness dial
  brightness: number; // normalized spectral centroid in [0, 1] — the palette dial
  dynamics: DynamicStats; // the loudness spread (rangeDb = the contrast dial)
};

function cleanMag(v: number): number {
  const m = clean(v);
  return m > 0 ? m : 0;
}
function clampRange(v: number, lo: number, hi: number): number {
  return Number.isFinite(v) ? (v < lo ? lo : v > hi ? hi : v) : 0;
}
function goodRate(sampleRate: number): number {
  return Number.isFinite(sampleRate) && sampleRate > 0 ? sampleRate : 0;
}

/** hertz → HTK mel (2595·log10(1 + f/700)); damaged input answers 0. */
export function hztomel(f: number): number {
  return 2595 * Math.log10(1 + (Number.isFinite(f) && f > 0 ? f : 0) / 700);
}

/** HTK mel → hertz, the exact inverse of hztomel on the same domain. */
export function meltohz(m: number): number {
  return 700 * (10 ** ((Number.isFinite(m) && m > 0 ? m : 0) / 2595) - 1);
}

/** the mel triangle bank over `bins` DFT bins: one row per band, integer HTK edges, peak exactly 1. */
export function melFilterbank(bins: number, sampleRate: number, opts?: MelOptions): Float32Array[] {
  const count = Math.max(2, Math.trunc(bins));
  const sr = goodRate(sampleRate);
  const bands = Math.max(1, Math.trunc(opts?.bands ?? MEL_BANDS));
  const nyquist = sr / 2;
  const fmin = clampRange(opts?.fmin ?? 0, 0, nyquist);
  const fmax = clampRange(opts?.fmax ?? nyquist, fmin, nyquist);
  const melMin = hztomel(fmin);
  const span = hztomel(fmax) - melMin;
  const live = sr > 0 && span > 0;
  const edge = (i: number): number =>
    live ? Math.floor(((2 * count - 1) * meltohz(melMin + (span * i) / (bands + 1))) / sr) : -1;
  const rows: Float32Array[] = [];
  for (let b = 0; b < bands; b++) {
    const row = new Float32Array(count);
    const left = edge(b);
    const center = edge(b + 1);
    const right = edge(b + 2);
    for (let k = Math.max(0, left); k <= Math.min(count - 1, right); k++) {
      let w = 0;
      if (k <= center) w = center > left ? (k - left) / (center - left) : 1;
      else w = right > center ? (right - k) / (right - center) : 0;
      row[k] = clamp01(w);
    }
    rows.push(row);
  }
  return rows;
}

/** unnormalized DCT-II: out[k] = Σ x[i]·cos(π·k·(2i+1)/(2n)) — pure, full precision, no scaling. */
export function dctii(input: ArrayLike<number>): Float64Array {
  const n = Math.max(0, Math.trunc(input?.length ?? 0));
  const out = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += clean(input[i]) * Math.cos((Math.PI * k * (2 * i + 1)) / (2 * n));
    out[k] = Number.isFinite(sum) ? sum : 0;
  }
  return out;
}

/** mel-band log energies of one magnitude frame — power weighted, floored 80 dB under the band peak
 * (the librosa top-db window) so leakage tails cannot swing the log from frame to frame. */
function melEnergies(magnitudes: ArrayLike<number>, bank: Float32Array[]): Float64Array {
  const bins = magnitudes?.length ?? 0;
  const out = new Float64Array(bank.length);
  let peak = 0;
  for (let b = 0; b < bank.length; b++) {
    const row = bank[b];
    let energy = 0;
    for (let k = 0; k < bins; k++) {
      const m = cleanMag(magnitudes[k]);
      energy += m * m * row[k];
    }
    out[b] = energy;
    if (energy > peak) peak = energy;
  }
  const floor = Math.max(1e-12, peak * 1e-8);
  for (let b = 0; b < bank.length; b++) out[b] = Math.log(Math.max(out[b], floor));
  return out;
}

/** MFCCs of one magnitude frame: mel log energies → DCT-II → first `coefficients` answers (13 by default). */
export function mfcc(magnitudes: ArrayLike<number>, sampleRate: number, opts?: MfccOptions): Float32Array {
  const bank = melFilterbank(Math.max(2, magnitudes?.length ?? 0), sampleRate, opts);
  const coefficients = Math.min(Math.max(1, Math.trunc(opts?.coefficients ?? DEFAULT_COEFFICIENTS)), bank.length);
  const spectrum = dctii(melEnergies(magnitudes, bank));
  const out = new Float32Array(coefficients);
  for (let c = 0; c < coefficients; c++) out[c] = Number.isFinite(spectrum[c]) ? spectrum[c] : 0;
  return out;
}

/** symmetric Hann window of `n` points (n ≤ 1 answers unity — nothing to taper):
 * the timbre layer's own taper, distinct from the periodic hann the fft
 * kernel exports (denominator n − 1, the filter-design convention). */
function symmetricHann(n: number): Float64Array {
  const w = new Float64Array(Math.max(0, n));
  for (let i = 0; i < n; i++) w[i] = n > 1 ? 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)) : 1;
  return w;
}

/** private small-frame DFT: magnitudes of bins 0..n/2 via exact twiddle tables — the no-audiofft fallback. */
function dftMagnitudes(frame: Float64Array): Float32Array {
  const n = frame.length;
  const bins = Math.max(0, (n >> 1) + 1);
  const cosTable = new Float64Array(n),
    sinTable = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    cosTable[i] = Math.cos((2 * Math.PI * i) / n);
    sinTable[i] = Math.sin((2 * Math.PI * i) / n);
  }
  const out = new Float32Array(bins);
  for (let k = 0; k < bins; k++) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i++) {
      const twiddle = n > 0 ? (k * i) % n : 0;
      re += frame[i] * cosTable[twiddle];
      im -= frame[i] * sinTable[twiddle];
    }
    out[k] = Math.sqrt(re * re + im * im);
  }
  return out;
}

/** slope of log-magnitude over log-frequency (least squares, clamped to ±24); too few points → 0. */
export function spectralSlope(magnitudes: ArrayLike<number>, sampleRate: number): number {
  const bins = magnitudes?.length ?? 0;
  const sr = goodRate(sampleRate);
  if (bins < 3 || sr <= 0) return 0;
  const binHz = sr / (2 * (bins - 1));
  let n = 0;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (let k = 1; k < bins; k++) {
    const m = cleanMag(magnitudes[k]);
    if (m <= 1e-12) continue;
    const x = Math.log(k * binHz);
    const y = Math.log(m);
    n++;
    sx += x;
    sy += y;
    sxx += x * x;
    sxy += x * y;
  }
  const denom = n * sxx - sx * sx;
  if (n < 2 || Math.abs(denom) < 1e-9) return 0;
  return clampRange((n * sxy - sx * sy) / denom, -24, 24);
}

/** rolloff sharpness: the bin where `ratio` (default 0.85) of the power has accumulated, over the top bin. */
export function rolloffSharpness(magnitudes: ArrayLike<number>, opts?: { ratio?: number }): number {
  const bins = magnitudes?.length ?? 0;
  if (bins < 2) return 0;
  const ratio = clamp01(opts?.ratio ?? 0.85);
  let total = 0;
  for (let k = 0; k < bins; k++) total += cleanMag(magnitudes[k]) ** 2;
  if (total <= 0) return 0;
  let acc = 0;
  for (let k = 0; k < bins; k++) {
    acc += cleanMag(magnitudes[k]) ** 2;
    if (acc >= ratio * total) return clamp01(k / (bins - 1));
  }
  return 1;
}

/** noisiness = spectral flatness (geometric over arithmetic power mean) — the 1 − harmonicity proxy, in [0, 1]. */
export function noisinessIndex(magnitudes: ArrayLike<number>): number {
  const bins = magnitudes?.length ?? 0;
  if (bins < 2) return 0;
  let logSum = 0;
  let sum = 0;
  for (let k = 0; k < bins; k++) {
    const p = cleanMag(magnitudes[k]) ** 2;
    logSum += Math.log(Math.max(p, 1e-12));
    sum += p;
  }
  return sum <= 0 ? 0 : clamp01(Math.exp(logSum / bins) / (sum / bins));
}

/** warmth = power share below `splitHz` (default 1000); silence or a damaged rate answers the neutral 0.5. */
export function warmthIndex(magnitudes: ArrayLike<number>, sampleRate: number, opts?: { splitHz?: number }): number {
  const bins = magnitudes?.length ?? 0;
  const sr = goodRate(sampleRate);
  if (bins < 2 || sr <= 0) return 0.5;
  const splitBin = (clampRange(opts?.splitHz ?? 1000, 0, sr / 2) / (sr / 2)) * (bins - 1);
  let low = 0;
  let high = 0;
  for (let k = 0; k < bins; k++) {
    const m = cleanMag(magnitudes[k]);
    if (k < splitBin) low += m * m;
    else high += m * m;
  }
  return low + high <= 0 ? 0.5 : clamp01(low / (low + high));
}

/** brightness = power-weighted mean frequency (spectral centroid) over Nyquist, in [0, 1]; silence answers 0. */
export function brightness(magnitudes: ArrayLike<number>, sampleRate: number): number {
  const bins = magnitudes?.length ?? 0;
  const sr = goodRate(sampleRate);
  if (bins < 2 || sr <= 0) return 0;
  const binHz = sr / (2 * (bins - 1));
  let num = 0;
  let den = 0;
  for (let k = 0; k < bins; k++) {
    const p = cleanMag(magnitudes[k]) ** 2;
    num += k * binHz * p;
    den += p;
  }
  return den > 0 ? clamp01(num / den / (sr / 2)) : 0;
}

/** rolls the whole timbre layer into one TimbreRead answer for the paint feed (see TimbreRead for the texture mapping). */
export function timbreStats(samples: ArrayLike<number>, sampleRate: number, opts?: TimbreOptions): TimbreRead {
  const sr = goodRate(sampleRate);
  const size = Math.max(64, Math.trunc(opts?.size ?? DEFAULT_SIZE));
  const hop = Math.max(1, Math.trunc(opts?.hop ?? DEFAULT_HOP));
  const n = samples?.length ?? 0;
  const env = rmsEnvelope(samples, { size, hop });
  const bank = melFilterbank((size >> 1) + 1, sr, opts);
  const coefficients = Math.min(Math.max(1, Math.trunc(opts?.coefficients ?? DEFAULT_COEFFICIENTS)), bank.length);
  const window = symmetricHann(size);
  const span = Math.min(size, Math.max(1, n));
  const sums = new Float64Array(coefficients),
    squares = new Float64Array(coefficients);
  let slopeSum = 0;
  let noisinessSum = 0;
  let warmthSum = 0;
  let brightnessSum = 0;
  for (let f = 0; f < env.length; f++) {
    const start = Math.min(f * hop, n - span);
    const frame = new Float64Array(size);
    for (let i = 0; i < span; i++) frame[i] = clean(samples[start + i]) * window[i];
    const mag = dftMagnitudes(frame);
    const spectrum = dctii(melEnergies(mag, bank));
    for (let c = 0; c < coefficients; c++) {
      const v = Number.isFinite(spectrum[c]) ? spectrum[c] : 0;
      sums[c] += v;
      squares[c] += v * v;
    }
    slopeSum += spectralSlope(mag, sr);
    noisinessSum += noisinessIndex(mag);
    warmthSum += warmthIndex(mag, sr);
    brightnessSum += brightness(mag, sr);
  }
  const g = env.length > 0 ? env.length : 1;
  const mfccMean: number[] = [];
  const mfccStd: number[] = [];
  for (let c = 0; c < coefficients; c++) {
    const mean = sums[c] / g;
    mfccMean.push(mean);
    mfccStd.push(Math.sqrt(Math.max(0, squares[c] / g - mean * mean)));
  }
  const rates = zcr(samples, { size, hop });
  const zcrMean = rates.length > 0 ? clamp01(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
  return {
    mfccMean,
    mfccStd,
    slopeMean: slopeSum / g,
    zcrMean,
    noisiness: noisinessSum / g,
    warmth: warmthSum / g,
    brightness: brightnessSum / g,
    dynamics: dynamicStats(env),
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 11: audiotonalitychords.ts — the chord timeline of the tonality layer. */
/* ════════════════════════════════════════════════════════════════════ */

/** the chord qualities the template table folds over the twelve roots. */
export type ChordQuality = "maj" | "min" | "dim" | "aug" | "maj7" | "min7" | "dom7";

/** one detected chord stretch over the chromagram timeline. */
export type ChordSegment = {
  /** timeline start in milliseconds (first frame index × frameMs) */
  startMs: number;
  /** timeline end in milliseconds, exclusive (one past the last frame × frameMs) */
  endMs: number;
  /** chord root as a pitch-class index 0–11 (0 = c, tuned at a440) */
  root: number;
  /** chord quality from the template table */
  quality: ChordQuality;
  /** mean cosine similarity of the member frames, clamped to 0–1 */
  confidence: number;
};

/** options for detectChords; every field is optional and sanitized. */
export type ChordDetectorOptions = {
  /** shortest run of frames allowed to keep its own label (default 4) */
  minFramesPerChord?: number;
  /** milliseconds one chroma frame spans (default 1000·2048/44100) */
  frameMs?: number;
  /** frames scoring below this cosine count as unvoiced and inherit a neighbour (default 0) */
  minConfidence?: number;
};

/** chord-tone intervals in semitones above the root, per quality. */
export const CHORD_INTERVALS: Readonly<Record<ChordQuality, readonly number[]>> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
};

/** milliseconds of one frame on the default cadria stft grid (hop 2048 at 44100 Hz). */
export const CHORD_DEFAULT_FRAME_MS = (1000 * 2048) / 44100;

const QUALITY_ORDER: readonly ChordQuality[] = ["maj", "min", "dim", "aug", "maj7", "min7", "dom7"];
const ROOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

/** one scored chord shape: uniform weight 1 on the chord tones, 0 elsewhere. */
export type ChordTemplate = {
  /** root pitch class 0–11 */
  root: number;
  /** quality from CHORD_INTERVALS */
  quality: ChordQuality;
  /** 12-bin template the cosine similarity reads */
  weights: Float32Array;
};

/** the full 7 qualities × 12 roots table (84 templates), root ascending, quality as declared. */
export const chordTemplates: readonly ChordTemplate[] = QUALITY_ORDER.flatMap((quality) =>
  ROOTS.map((root) => {
    const weights = new Float32Array(12);
    for (const interval of CHORD_INTERVALS[quality]) weights[(root + interval) % 12] = 1;
    return { root, quality, weights };
  }),
);

type FrameLabel = { label: number; confidence: number };

/** cosine similarity argmax over the whole template table; label −1 when the frame is silent. */
function bestTemplate(chroma: Float32Array | readonly number[]): FrameLabel {
  let norm = 0;
  for (let i = 0; i < 12; i += 1) {
    const value = Number.isFinite(chroma[i]) ? chroma[i] : 0;
    norm += value * value;
  }
  if (!(norm > 0)) return { label: -1, confidence: 0 };
  norm = Math.sqrt(norm);
  let best = -1;
  let bestScore = -1;
  for (let t = 0; t < chordTemplates.length; t += 1) {
    const weights = chordTemplates[t].weights;
    let dot = 0;
    let templateNorm = 0;
    for (let i = 0; i < 12; i += 1) {
      dot += chroma[i] * weights[i];
      templateNorm += weights[i] * weights[i];
    }
    const score = dot / (norm * Math.sqrt(templateNorm));
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }
  return { label: best, confidence: Math.min(1, Math.max(0, bestScore)) };
}

type Run = { label: number; from: number; to: number; confSum: number; count: number };

/** run-length encodes the per-frame labels with their confidence sums. */
function collectRuns(labels: readonly number[], confidences: readonly number[]): Run[] {
  const runs: Run[] = [];
  for (let i = 0; i < labels.length; i += 1) {
    const last = runs[runs.length - 1];
    if (last && last.label === labels[i]) {
      last.to = i + 1;
      last.confSum += confidences[i];
      last.count += 1;
    } else {
      runs.push({ label: labels[i], from: i, to: i + 1, confSum: confidences[i], count: 1 });
    }
  }
  return runs;
}

/** greedy smoother: dissolves every run shorter than minFrames into its longer neighbour (ties → previous). */
function dissolveShortRuns(runs: readonly Run[], minFrames: number): Run[] {
  const list = runs.slice();
  while (list.length > 1) {
    const at = list.findIndex((run) => run.count < minFrames);
    if (at < 0) break;
    const run = list[at];
    const prev = at > 0 ? list[at - 1] : null;
    const next = at + 1 < list.length ? list[at + 1] : null;
    const target = prev && next ? (next.count > prev.count ? next : prev) : (prev ?? next);
    if (!target) break;
    target.from = Math.min(target.from, run.from);
    target.to = Math.max(target.to, run.to);
    target.confSum += run.confSum;
    target.count += run.count;
    list.splice(at, 1);
  }
  return list;
}

/** the chord timeline of a chromagram: cosine argmax per frame, then greedy smoothing; [] when nothing sounds. */
export function detectChords(chromagram: readonly Float32Array[], options: ChordDetectorOptions = {}): ChordSegment[] {
  const minFrames = Math.max(1, Math.trunc(options.minFramesPerChord ?? 4));
  const frameMs =
    Number.isFinite(options.frameMs) && (options.frameMs as number) > 0
      ? (options.frameMs as number)
      : CHORD_DEFAULT_FRAME_MS;
  const minConfidence = Number.isFinite(options.minConfidence)
    ? Math.min(1, Math.max(0, options.minConfidence as number))
    : 0;
  if (chromagram.length === 0) return [];
  const labels: number[] = [];
  const confidences: number[] = [];
  for (const frame of chromagram) {
    const found = bestTemplate(frame);
    labels.push(found.confidence >= minConfidence && found.label >= 0 ? found.label : -1);
    confidences.push(found.confidence);
  }
  // unvoiced frames inherit the previous label; leading silence inherits the first voiced one
  for (let i = 1; i < labels.length; i += 1) if (labels[i] < 0) labels[i] = labels[i - 1];
  const first = labels.findIndex((label) => label >= 0);
  if (first < 0) return [];
  for (let i = 0; i < first; i += 1) labels[i] = labels[first];
  return dissolveShortRuns(collectRuns(labels, confidences), minFrames).map((run) => ({
    startMs: run.from * frameMs,
    endMs: run.to * frameMs,
    root: chordTemplates[run.label].root,
    quality: chordTemplates[run.label].quality,
    confidence: Math.min(1, Math.max(0, run.confSum / run.count)),
  }));
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 12: audiotonality.ts — the chroma/key layer of the tonality layer. */
/* ════════════════════════════════════════════════════════════════════ */

/** one ranked key rotation with its clamped correlation strength. */
export type KeyCandidate = {
  /** tonic pitch class 0–11 (0 = c) */
  tonic: number;
  /** major or minor rotation of the profile */
  mode: KeyMode;
  /** Pearson r against the mean chroma, clamped to 0–1 */
  strength: number;
};

/** the winning key plus the 23 runner-up rotations, strongest first. */
export type KeyEstimate = {
  /** tonic pitch class 0–11 (0 = c) */
  tonic: number;
  /** major or minor */
  mode: KeyMode;
  /** strength of the winner, 0–1 (0 = flat or silent chroma) */
  strength: number;
  /** the remaining rotations sorted by strength descending (deterministic ties) */
  alternatives: KeyCandidate[];
};

/** the wave-1 harmonic summary downstream image stages consume (the full
 * read of the tonality layer — the DescriptorStats summary of the same name
 * folds the key through its own contract shape). */
export type HarmonicRead = {
  /** key estimate for the mean chroma */
  key: KeyEstimate;
  /** L1-normalized 12-bin mean chroma (chroma energy) */
  chromaEnergy: number[];
  /** detected chord segments per second of chromagram span */
  harmonicChangeRate: number;
  /** dissonance proxy: normalized Shannon entropy of the mean chroma, 0–1 */
  dissonanceIndex: number;
};

/** options for harmonicStats; every field is optional. */
export type HarmonicStatsOptions = {
  /** STFT hop used to build the chromagram (default 2048) — sets frameMs */
  hop?: number;
  /** shortest chord run in frames passed to detectChords (default 4) */
  minFramesPerChord?: number;
};

/** lowercase pitch-class names, index = pitch class 0–11. */
export const pitchClassNames = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"] as const;

/** Krumhansl-Schmuckler (Krumhansl-Kessler) key profiles, index = scale degree from the tonic. */
export const keyProfiles: Readonly<Record<KeyMode, readonly number[]>> = {
  major: [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
  minor: [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17],
};

const A4_HZ = 440;
const A4_MIDI = 69;
const CHROMA_MIN_HZ = 55; // a1: below this the 4096-bin grid cannot resolve semitones
const CHROMA_MAX_HZ = 2093; // c7: above this harmonics dominate the fold
const DEGREES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

/** periodic hann window (the analysis window of the STFT stand-in). */
function hannWindow(size: number): Float64Array {
  const window = new Float64Array(size);
  for (let i = 0; i < size; i += 1) window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / size);
  return window;
}

/** in-place iterative radix-2 FFT (decimation in time, natural-order output). */
function fftInto(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i];
      re[i] = re[j];
      re[j] = tr;
      const ti = im[i];
      im[i] = im[j];
      im[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = (-2 * Math.PI) / len;
    const wr = Math.cos(angle);
    const wi = Math.sin(angle);
    const half = len >> 1;
    for (let base = 0; base < n; base += len) {
      let cr = 1;
      let ci = 0;
      for (let j = 0; j < half; j += 1) {
        const vr = re[base + j + half] * cr - im[base + j + half] * ci;
        const vi = re[base + j + half] * ci + im[base + j + half] * cr;
        const ur = re[base + j];
        const ui = im[base + j];
        re[base + j] = ur + vr;
        im[base + j] = ui + vi;
        re[base + j + half] = ur - vr;
        im[base + j + half] = ui - vi;
        const nextCr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nextCr;
      }
    }
  }
}

/** hann-windowed STFT magnitudes (size/2+1 bins per frame) — the private stand-in for the audiofft contract. */
export function spectrumFrames(samples: Float32Array | readonly number[], size = 4096, hop = 2048): Float32Array[] {
  const n = Math.trunc(size);
  const step = Math.trunc(hop);
  if (!(n >= 2) || (n & (n - 1)) !== 0 || step < 1 || samples.length < n) return [];
  const window = hannWindow(n);
  const frames: Float32Array[] = [];
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let start = 0; start + n <= samples.length; start += step) {
    for (let i = 0; i < n; i += 1) {
      const sample = samples[start + i];
      re[i] = Number.isFinite(sample) ? sample * window[i] : 0;
    }
    im.fill(0);
    fftInto(re, im);
    const magnitudes = new Float32Array(n / 2 + 1);
    for (let k = 0; k <= n / 2; k += 1) magnitudes[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
    frames.push(magnitudes);
  }
  return frames;
}

/** zeroes non-finite/negative cells and scales to unit L1 sum; all-zero input stays all-zero. */
function normalizeL1(vector: Float32Array): Float32Array {
  let sum = 0;
  for (let i = 0; i < vector.length; i += 1) {
    const value = vector[i];
    const clean = Number.isFinite(value) && value > 0 ? value : 0;
    vector[i] = clean;
    sum += clean;
  }
  if (sum > 0) for (let i = 0; i < vector.length; i += 1) vector[i] /= sum;
  return vector;
}

/** 12-bin chroma of one magnitude frame: bin → nearest semitone at a440, power folded, L1-normalized. */
export function chromaVector(
  magnitudes: Float32Array | readonly number[],
  sampleRate: number,
  size?: number,
): Float32Array {
  const chroma = new Float32Array(12);
  const bins = magnitudes.length;
  const n = size === undefined ? (bins > 1 ? (bins - 1) * 2 : 0) : Math.trunc(size);
  if (!(n >= 2) || !Number.isFinite(sampleRate) || sampleRate <= 0) return chroma;
  const hzPerBin = sampleRate / n;
  const lastBin = Math.min(bins - 1, Math.floor(n / 2));
  for (let k = 1; k <= lastBin; k += 1) {
    const magnitude = magnitudes[k];
    if (!Number.isFinite(magnitude) || magnitude <= 0) continue;
    const freq = k * hzPerBin;
    if (freq < CHROMA_MIN_HZ || freq > CHROMA_MAX_HZ) continue;
    const midi = A4_MIDI + 12 * Math.log2(freq / A4_HZ);
    const pitchClass = ((Math.round(midi) % 12) + 12) % 12;
    chroma[pitchClass] += magnitude * magnitude;
  }
  return normalizeL1(chroma);
}

/** one 12-bin chroma frame per magnitude frame; hop is validated for contract symmetry with spectrumFrames. */
export function chromagram(
  magnitudeFrames: readonly Float32Array[],
  sampleRate: number,
  hop = 2048,
  size = 4096,
): Float32Array[] {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0 || !(Math.trunc(hop) >= 1)) return [];
  return magnitudeFrames.map((frame) => chromaVector(frame, sampleRate, size));
}

/** Pearson r of two equal-length vectors; 0 when either side has no variance. */
function pearson(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  let meanA = 0;
  let meanB = 0;
  for (let i = 0; i < n; i += 1) {
    meanA += a[i];
    meanB += b[i];
  }
  meanA /= n;
  meanB /= n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = a[i] - meanA;
    const dy = b[i] - meanB;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (!(sxx > 0) || !(syy > 0)) return 0;
  return sxy / Math.sqrt(sxx * syy);
}

function sanitizeChroma(chroma: Float32Array | readonly number[]): number[] {
  return DEGREES.map((degree) => {
    const value = chroma[degree];
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
  });
}

/** Krumhansl-Schmuckler key of a mean chroma: 24 rotated-profile Pearson correlations, best + ranked rest. */
export function estimateKey(meanChroma: Float32Array | readonly number[]): KeyEstimate {
  const chroma = sanitizeChroma(meanChroma);
  const candidates: KeyCandidate[] = [];
  for (let tonic = 0; tonic < 12; tonic += 1) {
    for (const mode of ["major", "minor"] as const) {
      const profile = keyProfiles[mode];
      const rotated = DEGREES.map((degree) => profile[(degree - tonic + 12) % 12]);
      const r = pearson(chroma, rotated);
      candidates.push({ tonic, mode, strength: Math.min(1, Math.max(0, r)) });
    }
  }
  candidates.sort(
    (a, b) => b.strength - a.strength || a.tonic - b.tonic || (a.mode === b.mode ? 0 : a.mode === "major" ? -1 : 1),
  );
  const winner = candidates[0];
  return { tonic: winner.tonic, mode: winner.mode, strength: winner.strength, alternatives: candidates.slice(1) };
}

/** "c major"-style lowercase name of a key estimate. */
export function keyName(key: { tonic: number; mode: KeyMode }): string {
  if (!Number.isFinite(key.tonic)) return "";
  const pitchClass = ((Math.round(key.tonic) % 12) + 12) % 12;
  return `${pitchClassNames[pitchClass]} ${key.mode === "minor" ? "minor" : "major"}`;
}

/** mean chroma over the frames, sanitized and L1-normalized; empty input answers zeros. */
function meanChroma(frames: readonly Float32Array[]): Float32Array {
  const mean = new Float32Array(12);
  let count = 0;
  for (const frame of frames) {
    if (!frame || frame.length < 12) continue;
    for (let i = 0; i < 12; i += 1) mean[i] += Number.isFinite(frame[i]) ? frame[i] : 0;
    count += 1;
  }
  if (count > 0) for (let i = 0; i < 12; i += 1) mean[i] /= count;
  return normalizeL1(mean);
}

/** dissonance proxy: Shannon entropy of the mean chroma normalized by ln(12); 0 for silence. */
function chromaEntropy(mean: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) if (Number.isFinite(mean[i]) && mean[i] > 0) sum += mean[i];
  if (!(sum > 0)) return 0;
  let entropy = 0;
  for (let i = 0; i < 12; i += 1) {
    const p = mean[i] / sum;
    if (p > 0) entropy -= p * Math.log(p);
  }
  return entropy / Math.log(12);
}

/** the wave-1 HarmonicRead of a chromagram: key, energy, chord change rate, dissonance. */
export function harmonicStats(
  chromagram: readonly Float32Array[],
  sampleRate: number,
  options: HarmonicStatsOptions = {},
): HarmonicRead {
  const hop = Math.trunc(options.hop ?? 2048);
  const frameMs =
    Number.isFinite(sampleRate) && sampleRate > 0 && hop >= 1 ? (1000 * hop) / sampleRate : CHORD_DEFAULT_FRAME_MS;
  const mean = meanChroma(chromagram);
  const segments = detectChords(chromagram, { minFramesPerChord: options.minFramesPerChord, frameMs });
  const seconds = (chromagram.length * frameMs) / 1000;
  return {
    key: estimateKey(mean),
    chromaEnergy: Array.from(mean),
    harmonicChangeRate: seconds > 0 ? segments.length / seconds : 0,
    dissonanceIndex: chromaEntropy(mean),
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 13: audiofeatures.ts — the fusion layer (the 32-dim descriptor). */
/* ════════════════════════════════════════════════════════════════════ */

/** the vector holds exactly this many dims — the mapping wave reads by index. */
export const DESCRIPTOR_DIMS = 32;

/** dim names by position — position i of the vector is DIM_ORDER[i]. */
export const DIM_ORDER: readonly string[] = [
  "spectralCentroid",
  "spectralSpread",
  "rolloff",
  "flatness",
  "flux",
  "fluxVariance",
  "brightness",
  "tempo",
  "pulseConfidence",
  "onsetDensity",
  "grooveRegularity",
  "swing",
  "tonalCenter",
  "keyStrength",
  "harmonicChange",
  "dissonance",
  "noisiness",
  "warmth",
  "timbreBrightness",
  "textureSlope",
  "zeroCrossings",
  "contrast",
  "punch",
  "duration",
  "peakMass",
  "repetition",
  "narrativeContour",
  "sectionDensity",
  "brightnessPulse",
  "energyDrive",
  "bandTilt",
  "moodShadow",
];

/** narrative shapes → 0-1 contour weight (how much energy climbs to the tail). */
export const NARRATIVE_CONTOUR: Record<NarrativeShape, number> = {
  arch: 0.75,
  rise: 1,
  fall: 0.25,
  wave: 0.5,
  flat: 0,
};

/** pitch-class names, tonic 0 = c (summary text only). */
const TONIC_NAMES = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];

/** fnv-1a offset basis (32-bit) shared by both seed lanes. */
const FNV_BASIS = 0x811c9dc5;

/** fnv-1a prime (32-bit) — imul keeps every fold inside int32 land. */
const FNV_PRIME = 0x01000193;

/** at most this many pcm words enter the seed hash (stride grows instead). */
const SEED_SAMPLE_CAP = 8192;

/** clamps x into 0-1; non-finite answers 0 — total, never NaN. */
export function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** linear map of x from [lo, hi] into 0-1, clamped; damaged bounds answer 0. */
export function normalize01(x: number, lo: number, hi: number): number {
  if (!Number.isFinite(x) || !Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return 0;
  return clamp01((x - lo) / (hi - lo));
}

/** logistic squash around `center` with `spread` — a smooth monotonic 0-1
 *  curve for unbounded quantities (tempo) that avoids hard clamp edges. */
export function zcurve(x: number, center: number, spread: number): number {
  if (!Number.isFinite(x) || !Number.isFinite(center) || !Number.isFinite(spread) || spread <= 0) return 0;
  return clamp01(1 / (1 + Math.exp(-(x - center) / spread)));
}

/** one fnv-1a byte fold over a 32-bit lane. */
function fold(lane: number, byte: number): number {
  return Math.imul((lane ^ (byte & 0xff)) >>> 0, FNV_PRIME) >>> 0;
}

/** renders one 32-bit lane as 8 lowercase hex digits. */
function hex8(lane: number): string {
  return (lane >>> 0).toString(16).padStart(8, "0");
}

/** loose view of a possibly damaged stat object: every field unknown/absent. */
type Loose<T> = { [K in keyof T]?: unknown };

function view<T>(o: unknown): Loose<T> {
  return o !== null && typeof o === "object" ? (o as Loose<T>) : {};
}

/** total number read: finite numbers pass, everything else answers 0. */
function num(x: unknown): number {
  return typeof x === "number" && Number.isFinite(x) ? x : 0;
}

/** total array-slot read for the fixed-length stat arrays. */
function slot(a: unknown, i: number): number {
  if (!Array.isArray(a)) return 0;
  return num((a as unknown[])[i]);
}

/** seed serializer: finite numbers print verbatim, damaged values print "?" —
 *  the same stats always yield the same string, so the same seed. */
function fmt(x: unknown): string {
  return typeof x === "number" && Number.isFinite(x) ? String(x) : "?";
}

/** fixed-count list print for the chroma/band arrays. */
function fmtlist(a: unknown, count: number): string {
  if (!Array.isArray(a)) return "?";
  const list = a as unknown[];
  return Array.from({ length: count }, (_, i) => fmt(list[i])).join(",");
}

/**
 * deterministic 64-bit-ish audio fingerprint: two fnv-1a lanes over at most
 * 8192 stride-sampled float32 words (low lane folds the bytes little-endian,
 * high lane big-endian), with the word count folded in first so even
 * silences of different lengths diverge. Same pcm → same seed, always.
 */
export function audioSeed(pcm: Float32Array): string {
  const data = pcm instanceof Float32Array ? pcm : new Float32Array(0);
  const words = data.byteLength >> 2;
  let low = FNV_BASIS;
  let high = FNV_BASIS;
  low = fold(fold(fold(fold(low, words & 0xff), (words >>> 8) & 0xff), (words >>> 16) & 0xff), (words >>> 24) & 0xff);
  high = fold(fold(fold(fold(high, (words >>> 24) & 0xff), (words >>> 16) & 0xff), (words >>> 8) & 0xff), words & 0xff);
  if (words > 0) {
    const stride = Math.max(1, Math.ceil(words / SEED_SAMPLE_CAP));
    const bytes = new DataView(data.buffer, data.byteOffset, words * 4);
    for (let w = 0; w < words; w += stride) {
      const bits = bytes.getUint32(w * 4, true);
      low = fold(fold(fold(fold(low, bits & 0xff), (bits >>> 8) & 0xff), (bits >>> 16) & 0xff), (bits >>> 24) & 0xff);
      high = fold(fold(fold(fold(high, (bits >>> 24) & 0xff), (bits >>> 16) & 0xff), (bits >>> 8) & 0xff), bits & 0xff);
    }
  }
  return hex8(low) + hex8(high);
}

/**
 * stats fallback of the seed: folds a canonical pipe-string of every stat
 * field in fixed order (fnv-1a, two lanes — low over low bytes, high over
 * high bytes). Stable for identical stats, different for different stats.
 */
export function audioSeedFromStats(stats: DescriptorStats): string {
  const box = view<DescriptorStats>(stats);
  const sp = view<SpectralSummary>(box.spectral);
  const rh = view<RhythmStats>(box.rhythm);
  const ha = view<HarmonicStats>(box.harmonic);
  const ti = view<TimbreStats>(box.timbre);
  const st = view<StructureStats>(box.structure);
  const sw = view<RhythmStats["swing"]>(rh.swing);
  const dy = view<TimbreStats["dynamics"]>(ti.dynamics);
  const key = view<HarmonicStats["key"]>(ha.key);
  const line = [
    "cadria-audio-descriptor-v1",
    fmt(sp.centroidMean),
    fmt(sp.centroidStd),
    fmt(sp.rolloffMean),
    fmt(sp.flatnessMean),
    fmt(sp.flatnessStd),
    fmt(sp.fluxMean),
    fmt(sp.fluxStd),
    fmt(sp.brightnessIndex),
    fmtlist(sp.bandBalance, 7),
    fmt(rh.bpm),
    fmt(rh.confidence),
    fmt(rh.onsetsPerSecond),
    fmt(rh.regularityIndex),
    fmt(sw.ratio),
    sw.swung === true ? "1" : "0",
    fmt(rh.downbeatPeriodBeats),
    fmt(key.tonic),
    key.mode === "minor" ? "minor" : "major",
    fmt(key.strength),
    fmtlist(ha.chromaEnergy, 12),
    fmt(ha.harmonicChangeRate),
    fmt(ha.dissonanceIndex),
    fmt(ti.noisiness),
    fmt(ti.warmth),
    fmt(dy.rangeDb),
    fmt(dy.crestFactor),
    fmt(ti.brightness),
    fmt(ti.slopeMean),
    fmt(ti.zcrMean),
    fmt(st.durationMs),
    fmt(st.peakSectionMs),
    fmt(st.repetitionIndex),
    typeof st.narrativeShape === "string" ? st.narrativeShape : "?",
    fmt(st.sectionCount),
  ].join("|");
  let low = FNV_BASIS;
  let high = FNV_BASIS;
  for (let i = 0; i < line.length; i += 1) {
    const code = line.charCodeAt(i);
    low = fold(low, code & 0xff);
    high = fold(high, (code >>> 8) & 0xff);
  }
  return hex8(low) + hex8(high);
}

/**
 * folds the five stat summaries into the image-ready descriptor. The vector
 * order is the contract documented at the top of this section; every raw value
 * travels through an explicit range and the final guard re-clamps each dim
 * into 0-1, so no NaN or out-of-range number can ever escape. `seedOverride`
 * (e.g. audioSeed(pcm)) wins when the raw audio is at hand; otherwise the
 * descriptor seeds from the stats themselves. The answer is frozen — the
 * contract is immutable once fused.
 */
export function fuseDescriptor(stats: DescriptorStats, seedOverride?: string): AudioDescriptor {
  const box = view<DescriptorStats>(stats);
  const sp = view<SpectralSummary>(box.spectral);
  const rh = view<RhythmStats>(box.rhythm);
  const ha = view<HarmonicStats>(box.harmonic);
  const ti = view<TimbreStats>(box.timbre);
  const st = view<StructureStats>(box.structure);
  const sw = view<RhythmStats["swing"]>(rh.swing);
  const dy = view<TimbreStats["dynamics"]>(ti.dynamics);
  const key = view<HarmonicStats["key"]>(ha.key);
  const rawShape = st.narrativeShape;
  const shape: NarrativeShape =
    typeof rawShape === "string" && rawShape in NARRATIVE_CONTOUR ? (rawShape as NarrativeShape) : "flat";
  const confidence = clamp01(num(rh.confidence));
  const brightness = clamp01(num(sp.brightnessIndex));
  const fluxMean = num(sp.fluxMean);
  const onsets = num(rh.onsetsPerSecond);
  const lowAvg = (slot(sp.bandBalance, 0) + slot(sp.bandBalance, 1)) / 2;
  const highAvg = (slot(sp.bandBalance, 5) + slot(sp.bandBalance, 6)) / 2;
  const vector: number[] = [
    // dims 0-6 · spectral shape
    normalize01(num(sp.centroidMean), 0, 8000),
    normalize01(num(sp.centroidStd), 0, 4000),
    normalize01(num(sp.rolloffMean), 0, 12000),
    normalize01(num(sp.flatnessMean), 0, 0.5),
    normalize01(fluxMean, 0, 0.3),
    normalize01(num(sp.fluxStd), 0, 0.2),
    brightness,
    // dims 7-11 · rhythm pulse
    zcurve(num(rh.bpm), 110, 40),
    confidence,
    normalize01(onsets, 0, 8),
    clamp01(num(rh.regularityIndex)),
    normalize01(num(sw.ratio), 0.5, 0.75),
    // dims 12-15 · tonal field
    clamp01(num(key.tonic) / 11),
    clamp01(num(key.strength)),
    clamp01(num(ha.harmonicChangeRate)),
    clamp01(num(ha.dissonanceIndex)),
    // dims 16-21 · timbre color
    clamp01(num(ti.noisiness)),
    clamp01(num(ti.warmth)),
    clamp01(num(ti.brightness)),
    normalize01(num(ti.slopeMean), -12, 0),
    normalize01(num(ti.zcrMean), 0, 0.5),
    normalize01(num(dy.rangeDb), 0, 60),
    // dims 22-27 · energy & structure
    normalize01(num(dy.crestFactor), 0, 20),
    normalize01(num(st.durationMs), 0, 360000),
    normalize01(num(st.peakSectionMs), 0, 60000),
    clamp01(num(st.repetitionIndex)),
    NARRATIVE_CONTOUR[shape],
    normalize01(num(st.sectionCount), 0, 12),
    // dims 28-31 · cross features
    clamp01(brightness * confidence),
    clamp01((fluxMean * onsets) / 2.4),
    clamp01((lowAvg - highAvg + 1) / 2),
    clamp01(num(key.strength) * (key.mode === "minor" ? 1 : 0)),
  ];
  if (vector.length !== DESCRIPTOR_DIMS) throw new Error("descriptor vector must hold exactly 32 dims");
  const guarded = vector.map(clamp01);
  const vectorMean = guarded.reduce((sum, v) => sum + v, 0) / DESCRIPTOR_DIMS;
  const chroma = Array.isArray(ha.chromaEnergy)
    ? (ha.chromaEnergy as unknown[]).reduce<number>((m, v) => Math.max(m, num(v)), 0)
    : 0;
  const scalar: Record<string, number> = {
    bpm: num(rh.bpm),
    confidence,
    centroidHz: num(sp.centroidMean),
    rolloffHz: num(sp.rolloffMean),
    flatness: clamp01(num(sp.flatnessMean)),
    brightness,
    noisiness: clamp01(num(ti.noisiness)),
    warmth: clamp01(num(ti.warmth)),
    contrastDb: num(dy.rangeDb),
    crest: num(dy.crestFactor),
    durationMs: num(st.durationMs),
    peakMs: num(st.peakSectionMs),
    repetition: clamp01(num(st.repetitionIndex)),
    sections: num(st.sectionCount),
    contour: NARRATIVE_CONTOUR[shape],
    tonic: num(key.tonic),
    minor: key.mode === "minor" ? 1 : 0,
    keyStrength: clamp01(num(key.strength)),
    harmonicChange: clamp01(num(ha.harmonicChangeRate)),
    dissonance: clamp01(num(ha.dissonanceIndex)),
    swingRatio: num(sw.ratio),
    swung: sw.swung === true ? 1 : 0,
    downbeat: num(rh.downbeatPeriodBeats),
    chromaPeak: clamp01(chroma),
    vectorMean,
  };
  const seed = typeof seedOverride === "string" && seedOverride.length > 0 ? seedOverride : audioSeedFromStats(stats);
  const descriptor: AudioDescriptor = {
    version: 1,
    seed,
    vector: Object.freeze(guarded) as unknown as number[],
    scalar,
  };
  Object.freeze(scalar);
  Object.freeze(descriptor);
  return descriptor;
}

/**
 * human-readable lowercase block of "what the audio says" for the studio
 * ui: one line per family (pulse, key, spectrum, timbre, form) built from
 * the named scalars — never throws on a damaged descriptor.
 */
export function descriptorSummary(d: AudioDescriptor): string {
  const s: Record<string, unknown> = (d?.scalar ?? {}) as Record<string, unknown>;
  const g = (k: string): number => num(s[k]);
  const tonic = TONIC_NAMES[Math.min(11, Math.max(0, Math.round(g("tonic"))))] ?? "c";
  const mode = g("minor") >= 0.5 ? "minor" : "major";
  const shapes = Object.keys(NARRATIVE_CONTOUR) as NarrativeShape[];
  const shape = shapes.find((k) => NARRATIVE_CONTOUR[k] === g("contour")) ?? "flat";
  return [
    `audio descriptor v1 · seed ${typeof d?.seed === "string" ? d.seed : "unknown"}`,
    `tempo ${g("bpm").toFixed(1)} bpm · pulse confidence ${g("confidence").toFixed(2)} · swing ${g("swingRatio").toFixed(2)} · downbeat every ${g("downbeat").toFixed(1)} beats`,
    `key ${tonic} ${mode} (strength ${g("keyStrength").toFixed(2)}) · harmonic change ${g("harmonicChange").toFixed(2)} · dissonance ${g("dissonance").toFixed(2)}`,
    `spectral centroid ${g("centroidHz").toFixed(0)} hz · rolloff ${g("rolloffHz").toFixed(0)} hz · brightness ${g("brightness").toFixed(2)} · flatness ${g("flatness").toFixed(2)}`,
    `timbre noisiness ${g("noisiness").toFixed(2)} · warmth ${g("warmth").toFixed(2)} · contrast ${g("contrastDb").toFixed(1)} db · crest ${g("crest").toFixed(1)}`,
    `structure ${g("durationMs").toFixed(0)} ms · peak section ${g("peakMs").toFixed(0)} ms · ${g("sections").toFixed(0)} sections · ${shape} contour · repetition ${g("repetition").toFixed(2)}`,
  ].join("\n");
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 14: audiopipeline.ts — the wave-1 orchestrator (AnalysisReport). */
/* ════════════════════════════════════════════════════════════════════ */

/** error raised when the pipeline refuses a slice: stable `code` field. */
export class PipelineError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "PipelineError";
    this.code = code;
  }
}

/** pipeline options: the analysis sample rate dominates the cost curve. */
export type PipelineOptions = { analysisSampleRate?: number };

/** the source metadata the report records beside the analysis. */
export type ReportSource = { kind: "wav" | "pcm"; sampleRate: number; channels: number; durationMs: number };

/** the full wave-1 answer: source, five stat blocks, descriptor, timings. */
export type AnalysisReport = {
  schemaVersion: 1;
  source: ReportSource;
  spectrum: ReturnType<typeof summarizeSpectrum>;
  rhythm: ReturnType<typeof rhythmStats>;
  harmonic: ReturnType<typeof harmonicStats>;
  timbre: ReturnType<typeof timbreStats>;
  structure: StructureStats;
  descriptor: AudioDescriptor;
  timings: { decodeMs: number; analysisMs: number };
};

/** the minimum slice the pipeline accepts: one second keeps every block honest. */
const MIN_DURATION_MS = 1000;

/** wraps raw structure stats into the canonical shared shape (sectionCount added). */
function canonicalStructure(raw: RawStructureStats): StructureStats {
  return {
    durationMs: raw.durationMs,
    peakSectionMs: raw.peakSectionMs,
    repetitionIndex: raw.repetitionIndex,
    narrativeShape: raw.narrativeShape,
    sectionCount: raw.sections.length,
  };
}

/**
 * analyzePcm — the full analysis chain over one interleaved sample buffer:
 * downmix/resample through the decode layer, stft for the spectrum summary
 * and the chromagram, the rhythm facade for tempo/onsets/swing, timbre over
 * the resampled slice, structure over the per-frame band energies, then the
 * descriptor fusion seeded from the pcm hash. Throws PipelineError for an
 * empty slice (`pipeline-empty-samples`), a slice shorter than one second
 * (`pipeline-too-short`) or a non-finite sample rate
 * (`pipeline-unsupported-sample-rate`).
 */
export function analyzePcm(
  samples: Float32Array,
  sampleRate: number,
  channels = 1,
  options: PipelineOptions = {},
): AnalysisReport {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0)
    throw new PipelineError(
      "pipeline-unsupported-sample-rate",
      `audiopipeline: sampleRate must be finite > 0, got ${sampleRate}`,
    );
  if (!(samples instanceof Float32Array) || samples.length === 0)
    throw new PipelineError("pipeline-empty-samples", "audiopipeline: the sample slice is empty");
  const started = Date.now();
  const analysisRate = options.analysisSampleRate ?? 22050;
  const frames: AudioFrames = { sampleRate, channels, length: Math.floor(samples.length / channels), samples };
  const mono = channels === 1 ? frames : downmix(frames);
  const working = mono.sampleRate === analysisRate ? mono : resample(mono, analysisRate);
  const decodeMs = Date.now() - started;
  const durationMs = (working.length / working.sampleRate) * 1000;
  if (durationMs < MIN_DURATION_MS) {
    throw new PipelineError(
      "pipeline-too-short",
      `audiopipeline: the slice must run at least ${MIN_DURATION_MS} ms, got ${Math.round(durationMs)} ms`,
    );
  }
  const analysisStarted = Date.now();
  const size = 2048;
  const hop = 512;
  const magnitudeFrames = stft(working.samples, { size, hop });
  const spectrum = summarizeSpectrum(magnitudeFrames, working.sampleRate);
  const rhythm = rhythmStats(working.samples, working.sampleRate);
  const chroma = chromagram(magnitudeFrames, working.sampleRate, hop, size);
  const harmonic = harmonicStats(chroma, working.sampleRate, { hop });
  const timbre = timbreStats(working.samples, working.sampleRate, { size, hop });
  const bandFrames = magnitudeFrames.map((frame) => bandEnergies(frame, working.sampleRate));
  const frameRate = working.sampleRate / hop;
  const structure = canonicalStructure(analyzeStructure(bandFrames, frameRate));
  const stats: DescriptorStats = { spectral: spectrum, rhythm, harmonic, timbre, structure };
  const descriptor = fuseDescriptor(stats, audioSeed(working.samples));
  const analysisMs = Date.now() - analysisStarted;
  return {
    schemaVersion: 1,
    source: { kind: "pcm", sampleRate: working.sampleRate, channels: 1, durationMs },
    spectrum,
    rhythm,
    harmonic,
    timbre,
    structure,
    descriptor,
    timings: { decodeMs, analysisMs },
  };
}

/**
 * analyzeWavBytes — decode a wav container then hand the pcm to analyzePcm:
 * the decode options mirror the pipeline (mono, analysis sample rate), the
 * source kind records `wav` and decode errors surface as AudioDecodeError
 * from the decode layer untouched.
 */
export function analyzeWavBytes(bytes: Uint8Array, options: PipelineOptions = {}): AnalysisReport {
  if (!(bytes instanceof Uint8Array) || bytes.length === 0)
    throw new PipelineError("pipeline-empty-samples", "audiopipeline: the wav bytes are empty");
  const started = Date.now();
  const analysisRate = options.analysisSampleRate ?? 22050;
  const decoded = decodeWav(bytes, { targetSampleRate: analysisRate, mono: true });
  const decodeMs = Date.now() - started;
  const report = analyzePcm(decoded.samples, decoded.sampleRate, 1, options);
  return {
    ...report,
    source: { ...report.source, kind: "wav", sampleRate: decoded.sampleRate },
    timings: { ...report.timings, decodeMs },
  };
}

/** reportDigest — one lowercase line the studio UI can log: bpm, key, shape, seed. */
export function reportDigest(report: AnalysisReport): string {
  const { rhythm, harmonic, structure, descriptor } = report;
  const mode = harmonic.key.mode;
  const tonic = Math.round(harmonic.key.tonic);
  const keyName = `${["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"][tonic] ?? "?"} ${mode}`;
  return `bpm ${Math.round(rhythm.bpm)} · ${keyName} · ${structure.narrativeShape} · ${structure.sectionCount} sections · ${Math.round(report.source.durationMs)} ms · seed ${descriptor.seed}`;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 15: audioengine.ts — the browser transport of the studio page. */
/* ════════════════════════════════════════════════════════════════════ */

/** The typed transport failure the page renders honestly. */
export class TransportError extends Error {
  readonly code: "no-context" | "no-plan";
  constructor(code: "no-context" | "no-plan", message: string) {
    super(message);
    this.name = "TransportError";
    this.code = code;
  }
}

/** The per-role synth trim (the recipes leave different headroom). */
export const ROLE_TRIM: Record<ArrangerRole, number> = { drums: 0.9, bass: 0.85, keys: 0.5, lead: 0.4 };

/** The desk's default mix law — the faders the transport opens with, the
 * master db and the master trim; the offline render lane rides the same
 * numbers so the bounce answers what the desk plays. */
export const DEFAULT_MIX_LAW = {
  /** The role faders in db (the strip the desk opens with). */
  faders: { drums: -4, bass: -5, keys: -9, lead: -7 },
  /** The master fader in db. */
  masterDb: -2,
  /** The linear trim the master gain carries beside the fader. */
  masterTrim: 0.9,
} as const;

/** The wave-b2 voice recipe table — the one source of every synthesis
 * number the engine answers: the browser VoiceBank schedules these seats
 * onto the WebAudio graph and the offline render lane (renderworker.ts,
 * the server bounce) drives the same table sample-accurately in pure
 * typescript, so the desk and the bounce can never drift apart — the
 * recipes are never re-implemented, both lanes read them here. Every seat
 * carries the envelope, the filter and the stop law its voice rides. */
export const VOICE_RECIPES = {
  /** The 808 kick: the pitch envelope dives 135→42 hz, the gain decays to
   * silence over the tail, the source stops at stopSeconds. */
  kick: { pitchFromHz: 135, pitchToHz: 42, pitchSeconds: 0.09, gainSeconds: 0.34, stopSeconds: 0.36 },
  /** The noise snare: the bandpass burst beside the triangle body, each
   * branch with its own envelope and stop. */
  snare: {
    bandHz: 1850,
    bandQ: 0.9,
    noiseGain: 0.8,
    noiseSeconds: 0.2,
    noiseStopSeconds: 0.22,
    bodyHz: 186,
    bodyGain: 0.5,
    bodySeconds: 0.11,
    bodyStopSeconds: 0.13,
  },
  /** The clap: the tighter bandpass burst. */
  clap: { bandHz: 1150, bandQ: 1.4, noiseGain: 0.9, noiseSeconds: 0.18, stopSeconds: 0.2 },
  /** The closed hat: the highpass tick, the stop a hair past the decay. */
  hat: { highHz: 7600, gain: 0.5, decaySeconds: 0.05, stopPadSeconds: 0.02 },
  /** The open hat: the same seat with the longer decay. */
  openhat: { highHz: 7600, gain: 0.5, decaySeconds: 0.3, stopPadSeconds: 0.02 },
  /** The ride: the lower hiss. */
  ride: { highHz: 6200, gain: 0.3, decaySeconds: 0.55, stopPadSeconds: 0.03 },
  /** The perc blip. */
  perc: { hz: 820, gain: 0.32, seconds: 0.09, stopPadSeconds: 0.02 },
  /** The tom dive. */
  tom: { pitchFromHz: 172, pitchToHz: 96, pitchSeconds: 0.2, gain: 0.6, gainSeconds: 0.26, stopSeconds: 0.28 },
  /** The bass: the sub sine under the triangle an octave up, the
   * attack-sustain-release gate closing after the note's seconds. */
  bass: {
    midSemitones: 12,
    lowpassHz: 640,
    attackPeak: 0.9,
    attackSeconds: 0.012,
    sustainLevel: 0.5,
    sustainTcSeconds: 0.12,
    releaseTcSeconds: 0.05,
    stopPadSeconds: 0.3,
  },
  /** The detuned pad: the two saws around the pitch, the slow swell, the
   * slow release after the note's seconds. */
  pad: {
    detuneCents: 6,
    lowpassHz: 960,
    gain: 0.5,
    attackSeconds: 0.28,
    releaseTcSeconds: 0.18,
    stopPadSeconds: 0.9,
  },
  /** The vibrato lead: the square voice, the fast attack, the exponential
   * decay over at least minSeconds. */
  lead: {
    vibratoHz: 5.5,
    vibratoCents: 7,
    lowpassHz: 2400,
    gain: 0.34,
    attackSeconds: 0.015,
    minSeconds: 0.2,
    stopPadSeconds: 0.1,
  },
  /** The unmapped-lane fallback: the hat seat at the shorter decay. */
  fallback: { highHz: 7600, gain: 0.5, decaySeconds: 0.06, stopPadSeconds: 0.02 },
} as const;

/** The scheduler horizon (seconds scheduled ahead of the playhead). */
const LOOKAHEAD = 0.35;
/** The scheduler tick (ms). */
const TICK_MS = 80;
/** The analyser fft size of the VU taps. */
const FFT_SIZE = 512;
/** The release tail the offline bounce adds after the last gate (s). */
export const RENDER_TAIL_S = 1.2;
/** The shared noise buffer length (s) — one second seeds every noise voice. */
export const NOISE_SECONDS = 1;

/** The sinks one voice rides: the audio context, the noise take and the stop registry. */
export interface VoiceSink {
  /** The context the voices build their nodes on (live or offline). */
  ac: BaseAudioContext;
  /** The shared white-noise take (the snare/hat/clap/ride source). */
  noise: AudioBuffer | null;
  /** The role buses the voices connect to. */
  buses: Map<ArrangerRole, GainNode>;
  /** The stop registry (live tracks its sources; offline lets them end). */
  ontrack?: (node: AudioScheduledSourceNode, stopAt: number) => void;
}

/**
 * Builds the seeded white-noise channel — the one source every noise
 * voice reads: the mulberry32 stream over the identity string, the same
 * bytes the browser bank and the offline render lane answer for the same
 * seed (a bounce is byte-stable).
 *
 * @param seedSource the identity string the rng rides.
 * @param length the sample count to fill.
 * @returns the seeded white-noise channel, -1..1.
 */
export function seededNoiseChannel(seedSource: string, length: number): Float32Array {
  const channel = new Float32Array(length);
  const rng = mulberry32(hashSeed(seedSource));
  for (let index = 0; index < length; index++) channel[index] = rng() * 2 - 1;
  return channel;
}

/**
 * Builds the shared white-noise take, seeded by the take's own identity —
 * the same prompt and seed rebuild the same noise, so a bounce is byte-stable.
 *
 * @param ac the context the buffer is allocated on (buffers are context-free).
 * @param seedSource the identity string the rng rides.
 * @returns one second of seeded white noise.
 */
function makeNoiseBuffer(ac: BaseAudioContext, seedSource: string): AudioBuffer {
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * NOISE_SECONDS), ac.sampleRate);
  buffer.getChannelData(0).set(seededNoiseChannel(seedSource, buffer.length));
  return buffer;
}

/**
 * The voice bank: the wave-b2 recipes over any BaseAudioContext. The live
 * transport and the offline bounce ride the exact same synthesis — the desk
 * and the export never drift apart.
 */
export class VoiceBank {
  private readonly sink: VoiceSink;

  constructor(sink: VoiceSink) {
    this.sink = sink;
  }

  /** Dispatches one event to its recipe voice. */
  voice(event: NoteEvent, when: number): void {
    const bus = this.sink.buses.get(event.role);
    if (!bus) return;
    switch (event.lane) {
      case "kick":
        this.kick(bus, event, when);
        break;
      case "snare":
        this.snare(bus, event, when);
        break;
      case "clap":
        this.clap(bus, event, when);
        break;
      case "hat":
        this.hat(bus, event, when, VOICE_RECIPES.hat.decaySeconds);
        break;
      case "openhat":
        this.hat(bus, event, when, VOICE_RECIPES.openhat.decaySeconds);
        break;
      case "ride":
        this.ride(bus, event, when);
        break;
      case "perc":
        this.perc(bus, event, when);
        break;
      case "tom":
        this.tom(bus, event, when);
        break;
      case "bass":
        this.bass(bus, event, when);
        break;
      case "keys":
        this.pad(bus, event, when);
        break;
      case "lead":
        this.lead(bus, event, when);
        break;
      default:
        this.hat(bus, event, when, VOICE_RECIPES.fallback.decaySeconds);
    }
  }

  /** Registers a scheduled source so the live stop() can silence it. */
  private track(node: AudioScheduledSourceNode, stopAt: number): void {
    this.sink.ontrack?.(node, stopAt);
  }

  private kick(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const recipe = VOICE_RECIPES.kick;
    const osc = ac.createOscillator();
    osc.type = "sine";
    const gain = ac.createGain();
    osc.frequency.setValueAtTime(recipe.pitchFromHz, when);
    osc.frequency.exponentialRampToValueAtTime(recipe.pitchToHz, when + recipe.pitchSeconds);
    gain.gain.setValueAtTime(event.velocity, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + recipe.gainSeconds);
    osc.connect(gain).connect(out);
    osc.start(when);
    this.track(osc, when + recipe.stopSeconds);
  }

  private snare(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const recipe = VOICE_RECIPES.snare;
    const noise = ac.createBufferSource();
    noise.buffer = this.sink.noise;
    const band = ac.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = recipe.bandHz;
    band.Q.value = recipe.bandQ;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(event.velocity * recipe.noiseGain, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + recipe.noiseSeconds);
    noise.connect(band).connect(gain).connect(out);
    const body = ac.createOscillator();
    body.type = "triangle";
    body.frequency.value = recipe.bodyHz;
    const bodyGain = ac.createGain();
    bodyGain.gain.setValueAtTime(event.velocity * recipe.bodyGain, when);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, when + recipe.bodySeconds);
    body.connect(bodyGain).connect(out);
    noise.start(when);
    body.start(when);
    this.track(noise, when + recipe.noiseStopSeconds);
    this.track(body, when + recipe.bodyStopSeconds);
  }

  private clap(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const recipe = VOICE_RECIPES.clap;
    const noise = ac.createBufferSource();
    noise.buffer = this.sink.noise;
    const band = ac.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = recipe.bandHz;
    band.Q.value = recipe.bandQ;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(event.velocity * recipe.noiseGain, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + recipe.noiseSeconds);
    noise.connect(band).connect(gain).connect(out);
    noise.start(when);
    this.track(noise, when + recipe.stopSeconds);
  }

  private hat(out: AudioNode, event: NoteEvent, when: number, decay: number): void {
    const ac = this.sink.ac;
    const recipe = VOICE_RECIPES.hat;
    const noise = ac.createBufferSource();
    noise.buffer = this.sink.noise;
    const high = ac.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = recipe.highHz;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(event.velocity * recipe.gain, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    noise.connect(high).connect(gain).connect(out);
    noise.start(when);
    this.track(noise, when + decay + recipe.stopPadSeconds);
  }

  private ride(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const recipe = VOICE_RECIPES.ride;
    const noise = ac.createBufferSource();
    noise.buffer = this.sink.noise;
    const high = ac.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = recipe.highHz;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(event.velocity * recipe.gain, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + recipe.decaySeconds);
    noise.connect(high).connect(gain).connect(out);
    noise.start(when);
    this.track(noise, when + recipe.decaySeconds + recipe.stopPadSeconds);
  }

  private perc(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const recipe = VOICE_RECIPES.perc;
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = recipe.hz;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(event.velocity * recipe.gain, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + recipe.seconds);
    osc.connect(gain).connect(out);
    osc.start(when);
    this.track(osc, when + recipe.seconds + recipe.stopPadSeconds);
  }

  private tom(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const recipe = VOICE_RECIPES.tom;
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(recipe.pitchFromHz, when);
    osc.frequency.exponentialRampToValueAtTime(recipe.pitchToHz, when + recipe.pitchSeconds);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(event.velocity * recipe.gain, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + recipe.gainSeconds);
    osc.connect(gain).connect(out);
    osc.start(when);
    this.track(osc, when + recipe.stopSeconds);
  }

  private bass(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const recipe = VOICE_RECIPES.bass;
    const sub = ac.createOscillator();
    sub.type = "sine";
    sub.frequency.value = midiToHz(event.midi);
    const mid = ac.createOscillator();
    mid.type = "triangle";
    mid.frequency.value = midiToHz(event.midi + recipe.midSemitones);
    const lowpass = ac.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = recipe.lowpassHz;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(event.velocity * recipe.attackPeak, when + recipe.attackSeconds);
    gain.gain.setTargetAtTime(
      event.velocity * recipe.sustainLevel,
      when + recipe.attackSeconds,
      recipe.sustainTcSeconds,
    );
    gain.gain.setTargetAtTime(0.0001, when + event.seconds, recipe.releaseTcSeconds);
    sub.connect(lowpass);
    mid.connect(lowpass);
    lowpass.connect(gain).connect(out);
    sub.start(when);
    mid.start(when);
    this.track(sub, when + event.seconds + recipe.stopPadSeconds);
    this.track(mid, when + event.seconds + recipe.stopPadSeconds);
  }

  private pad(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const recipe = VOICE_RECIPES.pad;
    const left = ac.createOscillator();
    const right = ac.createOscillator();
    left.type = "sawtooth";
    right.type = "sawtooth";
    left.frequency.value = midiToHz(event.midi);
    right.frequency.value = midiToHz(event.midi);
    left.detune.value = -recipe.detuneCents;
    right.detune.value = recipe.detuneCents;
    const lowpass = ac.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = recipe.lowpassHz;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(event.velocity * recipe.gain, when + recipe.attackSeconds);
    gain.gain.setTargetAtTime(0.0001, when + event.seconds, recipe.releaseTcSeconds);
    left.connect(lowpass);
    right.connect(lowpass);
    lowpass.connect(gain).connect(out);
    left.start(when);
    right.start(when);
    this.track(left, when + event.seconds + recipe.stopPadSeconds);
    this.track(right, when + event.seconds + recipe.stopPadSeconds);
  }

  private lead(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const recipe = VOICE_RECIPES.lead;
    const osc = ac.createOscillator();
    osc.type = "square";
    osc.frequency.value = midiToHz(event.midi);
    const vibrato = ac.createOscillator();
    vibrato.frequency.value = recipe.vibratoHz;
    const depth = ac.createGain();
    depth.gain.value = recipe.vibratoCents;
    vibrato.connect(depth).connect(osc.detune);
    const lowpass = ac.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = recipe.lowpassHz;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(event.velocity * recipe.gain, when + recipe.attackSeconds);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(recipe.minSeconds, event.seconds));
    osc.connect(lowpass).connect(gain).connect(out);
    osc.start(when);
    vibrato.start(when);
    this.track(osc, when + event.seconds + recipe.stopPadSeconds);
    this.track(vibrato, when + event.seconds + recipe.stopPadSeconds);
  }
}

/**
 * The glue bus the desk and the bounce share: role faders (the plan's own
 * strips), the master fader and the same compressor settings — the export
 * answers what the desk plays. the honest mastering gap, documented here
 * never hidden: this browser graph carries no true-peak limiter (webaudio
 * owns no deterministic limiter node; a real lookahead limiter needs an
 * audio worklet — its own wave), so the desk and the studio bounce ride
 * the glue's ua-tailored ceiling while the server render lane closes its
 * bounces with the engine's own deterministic −1 dBTP limiter (limiter.ts,
 * the number the MASTERING spec pins) — the published take honours the
 * ceiling on every machine alike, the desk honestly does not promise it.
 *
 * @param ac the context the graph builds on.
 * @param plan the plan whose strips ride the faders.
 * @returns the role buses plus the master gain (taps are the caller's business).
 */
function buildRoleGraph(
  ac: BaseAudioContext,
  plan: TakePlan,
): { buses: Map<ArrangerRole, GainNode>; master: GainNode } {
  const masterStrip = plan.strips.find((strip) => strip.master);
  const master = ac.createGain();
  master.gain.value = dbToLinear(masterStrip?.faderDb ?? -2) * DEFAULT_MIX_LAW.masterTrim;
  const glue = ac.createDynamicsCompressor();
  glue.threshold.value = -10;
  glue.knee.value = 12;
  glue.ratio.value = 3;
  glue.attack.value = 0.01;
  glue.release.value = 0.22;
  master.connect(glue).connect(ac.destination);
  const buses = new Map<ArrangerRole, GainNode>();
  for (const role of ["drums", "bass", "keys", "lead"] as ArrangerRole[]) {
    const strip = plan.strips.find((row) => row.name === role);
    const bus = ac.createGain();
    bus.gain.value = dbToLinear(strip?.faderDb ?? -6) * ROLE_TRIM[role];
    bus.connect(master);
    buses.set(role, bus);
  }
  return { buses, master };
}

/**
 * The take transport: load(plan) → play/stop/loop, the role faders, the live
 * VU levels and the playhead position. One engine drives one take.
 */
export class TakeEngine {
  private plan: TakePlan | null = null;
  private schedule: TakeSchedule | null = null;
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private buses = new Map<ArrangerRole, GainNode>();
  private taps = new Map<ArrangerRole, AnalyserNode>();
  private masterTap: AnalyserNode | null = null;
  private bank: VoiceBank | null = null;
  private noise: AudioBuffer | null = null;
  private active = new Set<AudioScheduledSourceNode>();
  private timer: number | null = null;
  private nextIndex = 0;
  private baseTime = 0;
  private baseOffset = 0;
  private faders: Record<ArrangerRole, number> = { ...DEFAULT_MIX_LAW.faders };
  private masterDb: number = DEFAULT_MIX_LAW.masterDb;
  private looping = false;
  private running = false;

  /** Builds the context and the per-take graph (safe to call again on a new take).
   * The resume rides its own promise: the desk must open before any gesture —
   * a pending `context.resume()` (the autoplay policy holds it until the
   * visitor interacts) can never gate the load. The schedule rides in
   * explicitly when the desk edited the notes (the piano roll rebuilds it
   * with notesToSchedule) — the engine schedules what it is handed and
   * answers scheduleTake(plan) itself when no edit is in play.
   *
   * @param plan the arrangement plan.
   * @param schedule the optional edited schedule (defaults to scheduleTake(plan)).
   */
  async load(plan: TakePlan, schedule?: TakeSchedule): Promise<void> {
    this.stop();
    this.plan = plan;
    this.schedule = schedule ?? scheduleTake(plan);
    const context = this.ensureContext();
    void context.resume().catch(() => undefined);
    this.buildGraph();
  }

  /** Swaps the desk to a new plan while keeping the engine alive. */
  get loadedPlanId(): string | null {
    return this.plan?.id ?? null;
  }

  /** Starts playback from a position (the top when omitted). */
  play(from = 0): void {
    if (!this.plan || !this.schedule) throw new TransportError("no-plan", "load a take before playing");
    const context = this.ensureContext();
    void context.resume().catch(() => undefined);
    if (!this.running) {
      this.running = true;
      this.baseOffset = from >= 0 ? from : 0;
      this.baseTime = context.currentTime + 0.06;
      this.nextIndex = this.schedule.events.findIndex((event) => event.time >= this.baseOffset);
      if (this.nextIndex < 0) this.nextIndex = this.schedule.events.length;
      this.tick();
      this.timer = window.setInterval(() => this.tick(), TICK_MS);
    }
  }

  /** Stops playback and silences every scheduled voice. */
  stop(): void {
    this.running = false;
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    const context = this.context;
    if (context) {
      for (const source of this.active) {
        try {
          source.stop(context.currentTime);
        } catch {
          /* an already-stopped voice is fine */
        }
      }
    }
    this.active.clear();
  }

  /** Whether the transport is running. */
  get isPlaying(): boolean {
    return this.running;
  }

  /** Whether the transport wraps at the end of the take. */
  get loop(): boolean {
    return this.looping;
  }

  set loop(on: boolean) {
    this.looping = on;
  }

  /** The playhead position in seconds (frozen where the transport stopped). */
  position(): number {
    if (!this.plan) return 0;
    if (!this.running || !this.context) return this.baseOffset;
    const position = this.baseOffset + (this.context.currentTime - this.baseTime);
    if (position >= this.plan.durationSeconds)
      return this.looping ? position % this.plan.durationSeconds : this.plan.durationSeconds;
    return position;
  }

  /** Sets one role fader (dB) onto the live bus. */
  setRoleGain(role: ArrangerRole, db: number): void {
    this.faders[role] = db;
    const bus = this.buses.get(role);
    if (bus && this.context) bus.gain.setTargetAtTime(dbToLinear(db) * ROLE_TRIM[role], this.context.currentTime, 0.02);
  }

  /** Sets the master fader (dB) onto the live bus. */
  setMasterGain(db: number): void {
    this.masterDb = db;
    if (this.master && this.context)
      this.master.gain.setTargetAtTime(dbToLinear(db) * 0.9, this.context.currentTime, 0.02);
  }

  /** Reads every fader the engine currently rides. */
  faderDb(role: ArrangerRole): number {
    return this.faders[role];
  }

  /** The analyser tap of one bus (the live spectrum scope reads it). */
  analyserOf(role: ArrangerRole | "master"): AnalyserNode | null {
    return role === "master" ? this.masterTap : (this.taps.get(role) ?? null);
  }

  /**
   * The live VU levels per role in dBFS (−Infinity at silence): a short rms
   * window over each role's analyser tap.
   */
  levels(): Record<ArrangerRole, number> {
    const out: Record<ArrangerRole, number> = { drums: -Infinity, bass: -Infinity, keys: -Infinity, lead: -Infinity };
    if (!this.context) return out;
    const buffer = new Float32Array(FFT_SIZE);
    for (const role of Object.keys(out) as ArrangerRole[]) {
      const tap = this.taps.get(role);
      if (!tap) continue;
      tap.getFloatTimeDomainData(buffer);
      let sum = 0;
      for (const sample of buffer) sum += sample * sample;
      const rms = Math.sqrt(sum / buffer.length);
      out[role] = rms <= 0 ? Number.NEGATIVE_INFINITY : 20 * Math.log10(rms);
    }
    return out;
  }

  /** Tears the graph down (page unmount). */
  dispose(): void {
    this.stop();
    void this.context?.close().catch(() => undefined);
    this.context = null;
    this.master = null;
    this.masterTap = null;
    this.bank = null;
    this.buses.clear();
    this.taps.clear();
    this.noise = null;
  }

  // -- internals ------------------------------------------------------------

  private ensureContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext({ sampleRate: 48000, latencyHint: "interactive" });
      this.buildGraph();
    }
    return this.context;
  }

  private buildGraph(): void {
    const context = this.context;
    const plan = this.plan;
    if (!context || !plan) return;
    this.master = context.createGain();
    this.master.gain.value = dbToLinear(this.masterDb) * DEFAULT_MIX_LAW.masterTrim;
    const glue = context.createDynamicsCompressor();
    glue.threshold.value = -10;
    glue.knee.value = 12;
    glue.ratio.value = 3;
    glue.attack.value = 0.01;
    glue.release.value = 0.22;
    this.masterTap = context.createAnalyser();
    this.masterTap.fftSize = FFT_SIZE;
    this.master.connect(this.masterTap).connect(glue).connect(context.destination);
    this.buses.clear();
    this.taps.clear();
    for (const role of ["drums", "bass", "keys", "lead"] as ArrangerRole[]) {
      const bus = context.createGain();
      bus.gain.value = dbToLinear(this.faders[role]) * ROLE_TRIM[role];
      const tap = context.createAnalyser();
      tap.fftSize = FFT_SIZE;
      bus.connect(tap);
      tap.connect(this.master);
      this.buses.set(role, bus);
      this.taps.set(role, tap);
    }
    // one second of shared, seeded white noise (the snare/hat/clap/ride source)
    this.noise = makeNoiseBuffer(context, `noise:${plan.seed}:${plan.prompt}`);
    this.bank = new VoiceBank({
      ac: context,
      noise: this.noise,
      buses: this.buses,
      ontrack: (node, stopAt) => this.track(node, stopAt),
    });
  }

  /** The lookahead pass: schedules every event that entered the horizon. */
  private tick(): void {
    const context = this.context;
    const plan = this.plan;
    const schedule = this.schedule;
    if (!context || !plan || !schedule || !this.running || !this.bank) return;
    const position = this.position();
    const horizon = position + LOOKAHEAD;
    while (this.nextIndex < schedule.events.length && schedule.events[this.nextIndex].time < horizon) {
      const event = schedule.events[this.nextIndex];
      this.nextIndex += 1;
      const when = this.baseTime + (event.time - this.baseOffset);
      this.bank.voice(event, Math.max(when, context.currentTime));
    }
    if (position >= plan.durationSeconds) {
      if (this.looping) {
        this.baseOffset = 0;
        this.baseTime += plan.durationSeconds;
        this.nextIndex = 0;
      } else {
        this.stop();
      }
    }
  }

  /** Registers a scheduled source so stop() can silence it. */
  private track(node: AudioScheduledSourceNode, stopAt: number): void {
    this.active.add(node);
    node.onended = () => this.active.delete(node);
    try {
      node.stop(stopAt);
    } catch {
      /* stop before start is impossible for offset-scheduled voices */
    }
  }
}

/** The options one offline bounce rides (stems filter the roles). */
export interface OfflineRenderOptions {
  /** The roles the bounce plays (every role when omitted — the full mix). */
  roles?: readonly ArrangerRole[];
  /** The sample rate (the plan's mastering rate when omitted). */
  sampleRate?: number;
  /** The release tail after the last gate in seconds (the default is 1.2). */
  tailSeconds?: number;
}

/**
 * Bounces the take (or one stem of it) through an OfflineAudioContext with
 * the exact graph the desk plays: the plan's own faders, the same glue
 * compressor, the same wave-b2 recipes and a noise buffer seeded by the
 * take's identity — same prompt, same seed, same bytes.
 *
 * @param plan the arrangement plan.
 * @param schedule the schedule to bounce (the desk's edited one rides in).
 * @param options the role filter, rate and tail (a stem renders its role only).
 * @returns the rendered buffer (two channels, the mix or the stem).
 * @throws TransportError("no-plan") when the plan carries no duration.
 */
export async function renderTakeOffline(
  plan: TakePlan,
  schedule: TakeSchedule,
  options: OfflineRenderOptions = {},
): Promise<AudioBuffer> {
  if (!(plan.durationSeconds > 0)) throw new TransportError("no-plan", "the plan carries no duration");
  const sampleRate = options.sampleRate ?? plan.mastering.sampleRateHz ?? 48000;
  const tail = options.tailSeconds ?? RENDER_TAIL_S;
  const frames = Math.ceil((plan.durationSeconds + tail) * sampleRate);
  const offline = new OfflineAudioContext(2, frames, sampleRate);
  const { buses, master } = buildRoleGraph(offline, plan);
  const noise = makeNoiseBuffer(offline, `noise:${plan.seed}:${plan.prompt}`);
  const bank = new VoiceBank({ ac: offline, noise, buses });
  const roles = options.roles ? new Set(options.roles) : null;
  for (const event of schedule.events) {
    if (roles && !roles.has(event.role)) continue;
    bank.voice(event, Math.max(0, event.time));
  }
  void master;
  return offline.startRendering();
}
