/**
 * source.ts — the SOURCE layer of the generation studio: turn a picked file
 * or a built-in intro fixture into one normalized StudioSource, then run the
 * genuine wave-1 chain over it. The decode doctrine is the documented dual
 * path:
 *   wav  → the raw bytes go to analyzeWavBytes, whose decodeWav walk
 *          (audiodecode.ts over audioformat.ts) owns the container natively,
 *          no web audio needed;
 *   else → AudioContext.decodeAudioData decodes mp3/ogg/flac/m4a in the
 *          browser and fromAudioBufferLike maps the web AudioBuffer onto the
 *          same AudioFrames contract (channels interleaved; analyzePcm does
 *          its own downmix + resample). AudioContext is browser-only: where
 *          none exists the guard answers the documented message and the page
 *          surfaces it — wav stays decodable everywhere.
 * Every async boundary is wrapped in a try/catch that rethrows with the step
 * named, so the studio status line can show a traceable message.
 */

import { fromAudioBufferLike, wavinfo } from "../../audiodecode.ts";
import { type AnalysisReport, analyzePcm, analyzeWavBytes } from "../../audiopipeline.ts";
import type { DemoFixture, DemoFixtureId } from "../intro/fixtures.ts";
import { demoFixtures } from "../intro/fixtures.ts";

/** hard cap on an uploaded file (bytes) — bounds the decodeAudioData working set. */
const MAX_FILE_BYTES = 64 * 1024 * 1024;

/** one normalized audio source the studio stage can analyze. */
export type StudioSource = {
  /** display name (fixture name or the file's own name) */
  name: string;
  /** where the source came from — the rail chips and meta rows read it */
  kind: "fixture" | "wav" | "decoded";
  /** one-line human detail for the rail (the decode path taken) */
  detail: string;
  sampleRate: number;
  channels: number;
  durationMs: number;
  /** interleaved samples (fixtures + web-audio path); unused on the wav bytes path */
  samples: Float32Array;
  /** raw container bytes when kind === "wav" — decodeWav runs on these */
  wavBytes: Uint8Array | null;
  sizeBytes: number;
};

/**
 * analyzeSource — one source into the genuine pipeline: wav containers ride
 * the bytes path (analyzeWavBytes → decodeWav), everything else analyzePcm
 * over the decoded interleaved samples. Throws the pipeline's own errors.
 */
export function analyzeSource(source: StudioSource): AnalysisReport {
  if (source.wavBytes) return analyzeWavBytes(source.wavBytes);
  return analyzePcm(source.samples, source.sampleRate, source.channels);
}

/**
 * fixtureSource — one built-in intro fixture by id (pure code synthesis, no
 * I/O); unknown ids throw immediately so the caller's catch shows the miss.
 */
export function fixtureSource(id: DemoFixtureId): StudioSource {
  const fixture: DemoFixture | undefined = demoFixtures().find((entry) => entry.id === id);
  if (!fixture) throw new Error(`studio: unknown fixture "${id}"`);
  return {
    name: fixture.name,
    kind: "fixture",
    detail: `${fixture.detail} · built-in`,
    sampleRate: fixture.sampleRate,
    channels: 1,
    durationMs: (fixture.samples.length / fixture.sampleRate) * 1000,
    samples: fixture.samples,
    wavBytes: null,
    sizeBytes: fixture.samples.byteLength,
  };
}

/** RIFF/WAVE sniff: the first 12 bytes carry the two tags. */
function isWavBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const tag = (at: number): string => String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
  return tag(0) === "RIFF" && tag(8) === "WAVE";
}

/** the browser AudioContext constructor or null (node/ssr has none). */
function audioContextCtor(): typeof AudioContext | null {
  const scope = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  return scope.AudioContext ?? scope.webkitAudioContext ?? null;
}

/**
 * fileSource — the dual decode path for one picked file: wav bytes go to the
 * native decodeWav lane (kept whole for analyzeWavBytes), every other
 * container goes through AudioContext.decodeAudioData + fromAudioBufferLike.
 * Browser-only guard: without an AudioContext the documented message throws
 * and the caller renders it. The context is always closed in `finally`.
 */
export async function fileSource(file: File): Promise<StudioSource> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`"${file.name}" is ${(file.size / 1048576).toFixed(1)} MB — the studio accepts files up to 64 MB.`);
  }
  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch (error) {
    throw new Error(`reading "${file.name}" failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }
  if (isWavBytes(bytes)) {
    const info = wavinfo(bytes);
    return {
      name: file.name,
      kind: "wav",
      detail: "wav container · native decode path",
      sampleRate: info.sampleRate,
      channels: info.channels,
      durationMs: info.durationSeconds * 1000,
      samples: new Float32Array(0),
      wavBytes: bytes,
      sizeBytes: file.size,
    };
  }
  const Ctor = audioContextCtor();
  if (!Ctor) {
    throw new Error(
      "decoding compressed audio needs a browser AudioContext (mp3/ogg/flac/m4a) and this environment has none — a .wav file decodes natively instead.",
    );
  }
  const context = new Ctor();
  try {
    // a private copy: decodeAudioData detaches the buffer it is handed
    const audioData = bytes.slice().buffer as ArrayBuffer;
    const buffer = await context.decodeAudioData(audioData);
    const channelData: Float32Array[] = [];
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      channelData.push(buffer.getChannelData(channel));
    }
    const frames = fromAudioBufferLike({ sampleRate: buffer.sampleRate, channelData });
    return {
      name: file.name,
      kind: "decoded",
      detail: `${file.type || "audio"} · web-audio decode path`,
      sampleRate: frames.sampleRate,
      channels: frames.channels,
      durationMs: (frames.length / frames.sampleRate) * 1000,
      samples: frames.samples,
      wavBytes: null,
      sizeBytes: file.size,
    };
  } catch (error) {
    throw new Error(
      `the browser decoder refused "${file.name}": ${error instanceof Error ? error.message : "unknown error"}`,
    );
  } finally {
    try {
      void context.close();
    } catch {
      // the context was already closed — nothing to do
    }
  }
}
