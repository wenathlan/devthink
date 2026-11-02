// # ingestpayload — the structured payload lane of the kathesis ingest (root
// layer, wave T4-E · PR17): the v1 pattern the owner charged as valid, rebuilt
// on the honest laws — the forward ingest turns sound bytes into the detailed
// structured json payload (the container facts, the track summary, the 100 ms
// energy chunks, the beats and onsets, and the embedded debonair.ingest/1
// document with its per-second vector frames), and the reverse ingest
// reconstructs playable wav bytes out of that payload through seeded vector
// synthesis — never a re-encode, never a base64 pcm array (the corpus ban).
// The lane is pure typescript: zero dependencies, zero dom, zero audio
// context, zero gpu — the sandbox runs it wherever the deploy pins the worker
// modality, the visitor machine is never touched. The compressed containers
// answer the honest container-only payload (real header facts, zero fake
// vectors): decoding mp3/ogg needs a codec the pure node lane does not carry,
// and the limit is documented in code, tests and
// docs/kathesisresearch.md instead of being papered over.

import { AudioDecodeError, readWavLayout, readWavSamples } from "./audioformat.ts";
import { sha256hex } from "./blobstore.ts";
import { hashSeed, mulberry32 } from "./harmonyengine.ts";
import { type IngestDocument, ingestPcm, onsetSecondsOf, pcmhash } from "./ingest.ts";
import type { WorkerModality } from "./sandboxmodality.ts";
import { midiToHz } from "./tuning.ts";
import { encodeWav, SAMPLE_RATE_MAX, SAMPLE_RATE_MIN, type WavBitDepth, WavError } from "./wavwriter.ts";

// ---- the schema and the constants ------------------------------------------

/** The schema literal of the structured payload this lane writes (the only one). */
export const SOUND_PAYLOAD_SCHEMA_VERSION = "debonair.soundpayload/1";

/** The energy chunk span in milliseconds — the sub-second envelope resolution
 * the one-second vector frames do not carry (ten chunks per second). */
export const ENERGY_CHUNK_MS = 100;

/** The default depth of the reconstructed wav (the compact pcm16 lane; the
 * caller may ask for 24 or the 32f float lane through the options). */
export const RECONSTRUCT_DEFAULT_DEPTH: WavBitDepth = 16;

/** The sandbox modality this lane's walk declares (the same vocabulary mirror
 * the ingest worker rides): the honest default is "local" — the walk runs in
 * the deploy's own process and this module never spawns anything itself. The
 * declaration is the contract the deploy reads; a deploy that opts the heavy
 * synthesis onto a saddle modality pins DEBONAIR_WORKER_MODALITY and the
 * platform resolves the sandbox — the browser and the gpu of the visitor are
 * never part of this lane. */
export const PAYLOAD_LANE_MODALITY: WorkerModality = "local";

// ---- the container probe ----------------------------------------------------

/** The sound container kinds the probe speaks. */
export type SoundFormatKind = "wav" | "mp3" | "ogg" | "unknown";

/** The container facts the probe answers — what the bytes say, honestly split
 * between the formats the pure-node lane can fully walk (wav) and the ones it
 * can only read at the header level (mp3, ogg). */
export interface SoundContainerFacts {
  /** The detected container kind ("unknown" when no magic matches). */
  format: SoundFormatKind;
  /** The bare mime of the container ("audio/wav", "audio/mpeg", "audio/ogg"). */
  mime: string;
  /** The frames per second the header declares (null when unreadable). */
  sampleRate: number | null;
  /** The channel count the header declares (null when unreadable). */
  channels: number | null;
  /** The bits per sample the wav fmt chunk declares (wav only, else null). */
  bitDepth: number | null;
  /** The duration in seconds (the exact walk for wav, the granule scan for
   * ogg, the cbr estimate for mp3 — null when the container says nothing). */
  durationSeconds: number | null;
  /** True only when the pure-node lane can decode the pcm (the wav walk);
   * compressed containers answer false — the honest codec limit. */
  decodable: boolean;
  /** The human-readable honest summary ("riff/wave pcm 16-bit stereo 44100
   * hz, 2.00 s" / "mpeg1 layer iii, 128 kbps cbr estimate, 44100 hz, joint
   * stereo, ~3.00 s (cbr estimate)"). */
  facts: string;
}

/** The layer-iii bitrate tables (kbps), indexed by the 4-bit header field —
 * protocol constants of the mpeg audio standard, the same law the wav
 * format table rides. */
const MP3_BITRATES_KBPS: Readonly<Record<"mpeg1" | "mpeg2", readonly number[]>> = {
  mpeg1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  mpeg2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};

/** The sample-rate tables (hz), indexed by the 2-bit header field. */
const MP3_RATES_HZ: Readonly<Record<"mpeg1" | "mpeg2" | "mpeg25", readonly number[]>> = {
  mpeg1: [44100, 48000, 32000],
  mpeg2: [22050, 24000, 16000],
  mpeg25: [11025, 12000, 8000],
};

/** The channel-mode names of the mp3 header, indexed by the 2-bit field. */
const MP3_MODES: readonly string[] = ["stereo", "joint stereo", "dual channel", "mono"];

/** The bound of the mp3 frame-sync scan (bytes after the id3 tag) — the probe
 * never walks a whole file hunting a header. */
const MP3_SCAN_LIMIT = 65536;

/** Reads an ascii field of `length` bytes at `offset` (the probe's own reader). */
function asciiof(bytes: Uint8Array, offset: number, length: number): string {
  let text = "";
  for (let index = 0; index < length; index++) text += String.fromCharCode(bytes[offset + index]);
  return text;
}

/** Skips the id3v2 tag when present, answering the offset the audio frames
 * start at (the syncsafe size field, ten bytes of overhead). */
function id3skip(bytes: Uint8Array): number {
  if (bytes.length < 10 || asciiof(bytes, 0, 3) !== "ID3") return 0;
  const size = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
  return 10 + size;
}

/** The one mpeg layer-iii frame header the scan accepted. */
interface Mp3Frame {
  /** The absolute offset of the frame header. */
  offset: number;
  /** The mpeg generation ("mpeg1" | "mpeg2" | "mpeg25"). */
  generation: "mpeg1" | "mpeg2" | "mpeg25";
  /** The bitrate in kbps (0 means the free band — the scan refuses it). */
  bitrateKbps: number;
  /** The sample rate in hz. */
  sampleRate: number;
  /** The channel count (1 mono, 2 otherwise). */
  channels: number;
  /** The channel-mode name. */
  mode: string;
}

/** Scans for the first valid mpeg layer-iii frame header at or after `from` —
 * the sync word, the version and layer fields, the bitrate and rate indexes
 * all validated; anything else keeps the scan moving. */
function mp3frame(bytes: Uint8Array, from: number): Mp3Frame | null {
  const limit = Math.min(bytes.length - 4, from + MP3_SCAN_LIMIT);
  for (let i = from; i < limit; i++) {
    if (bytes[i] !== 0xff || (bytes[i + 1] & 0xe0) !== 0xe0) continue;
    const versionBits = (bytes[i + 1] >> 3) & 0x3;
    const layerBits = (bytes[i + 1] >> 1) & 0x3;
    if (versionBits === 1 || layerBits !== 1) continue; // reserved version, non-iii layer
    const generation = versionBits === 3 ? "mpeg1" : versionBits === 2 ? "mpeg2" : "mpeg25";
    const bitrateIndex = bytes[i + 2] >> 4;
    const rateIndex = (bytes[i + 2] >> 2) & 0x3;
    if (bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3) continue;
    const bitrateKbps = MP3_BITRATES_KBPS[generation === "mpeg1" ? "mpeg1" : "mpeg2"][bitrateIndex];
    const sampleRate = MP3_RATES_HZ[generation][rateIndex];
    const modeIndex = bytes[i + 3] >> 6;
    return {
      offset: i,
      generation,
      bitrateKbps,
      sampleRate,
      channels: modeIndex === 3 ? 1 : 2,
      mode: MP3_MODES[modeIndex],
    };
  }
  return null;
}

/** The ogg identification answer of the first page. */
interface OggIdent {
  /** The codec the first packet names ("vorbis" | "opus"). */
  codec: "vorbis" | "opus";
  /** The channel count the ident header declares. */
  channels: number;
  /** The sample rate the ident header declares (the opus decode rate is
   * always 48000 — the input rate is informational). */
  sampleRate: number;
}

/** Reads the ogg identification header off the first page payload and walks
 * every page for the greatest granule position — the duration the container
 * itself declares (vorbis granules count at the ident rate, opus at 48000). */
function oggwalk(bytes: Uint8Array): { ident: OggIdent; maxGranule: number } | null {
  if (bytes.length < 27 || asciiof(bytes, 0, 4) !== "OggS") return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const firstSegments = bytes[26];
  const payloadStart = 27 + firstSegments;
  if (payloadStart > bytes.length) return null;
  const magic = asciiof(bytes, payloadStart, 7);
  let ident: OggIdent | null = null;
  if (magic === "\x01vorbis") {
    ident = {
      codec: "vorbis",
      channels: bytes[payloadStart + 11],
      sampleRate: view.getUint32(payloadStart + 12, true),
    };
  } else if (asciiof(bytes, payloadStart, 8) === "OpusHead") {
    const inputRate = view.getUint32(payloadStart + 12, true);
    ident = { codec: "opus", channels: bytes[payloadStart + 9], sampleRate: inputRate > 0 ? inputRate : 48000 };
  }
  if (!ident || ident.channels < 1 || ident.sampleRate < 1) return null;
  // the granule walk: every page header carries its granule at offset 6
  let offset = 0;
  let maxGranule = 0;
  while (offset + 27 <= bytes.length && asciiof(bytes, offset, 4) === "OggS") {
    const granuleLo = view.getUint32(offset + 6, true);
    const granuleHi = view.getUint32(offset + 10, true);
    const granule = granuleHi * 4294967296 + granuleLo;
    if (granule > maxGranule) maxGranule = granule;
    const segments = bytes[offset + 26];
    let pageLength = 27 + segments;
    for (let s = 0; s < segments; s++) pageLength += bytes[offset + 27 + s];
    if (pageLength <= 0) break;
    offset += pageLength;
  }
  return { ident, maxGranule };
}

/**
 * probesound — the container probe: what the bytes are and what they declare,
 * honestly split by what the pure-node lane can walk. The wav lane answers
 * the full riff facts (decodable true); the mp3 lane answers the layer-iii
 * frame facts with the cbr duration estimate (an estimate, labeled as one);
 * the ogg lane answers the identification header plus the granule-scan
 * duration; anything else answers the unknown refusal. Never throws — the
 * facts carry the refusal.
 *
 * @param bytes the sound bytes of any container.
 * @returns the container facts (format "unknown" when no magic matches).
 */
export function probesound(bytes: Uint8Array): SoundContainerFacts {
  if (bytes.length >= 12 && asciiof(bytes, 0, 4) === "RIFF" && asciiof(bytes, 8, 4) === "WAVE") {
    try {
      const layout = readWavLayout(bytes);
      const duration = layout.frames / layout.sampleRate;
      return {
        format: "wav",
        mime: "audio/wav",
        sampleRate: layout.sampleRate,
        channels: layout.channels,
        bitDepth: layout.bitDepth,
        durationSeconds: duration,
        decodable: true,
        facts: `riff/wave ${layout.isFloat ? "ieee float" : "pcm"} ${layout.bitDepth}-bit ${
          layout.channels === 1 ? "mono" : `${layout.channels} channels`
        } ${layout.sampleRate} hz, ${duration.toFixed(2)} s`,
      };
    } catch (error) {
      const code = error instanceof AudioDecodeError ? error.code : "unreadable";
      return {
        format: "wav",
        mime: "audio/wav",
        sampleRate: null,
        channels: null,
        bitDepth: null,
        durationSeconds: null,
        decodable: false,
        facts: `riff/wave magic present but the walk refused (${code})`,
      };
    }
  }
  if (bytes.length >= 4 && asciiof(bytes, 0, 4) === "OggS") {
    const walk = oggwalk(bytes);
    if (walk) {
      const rate = walk.ident.codec === "opus" ? 48000 : walk.ident.sampleRate;
      const duration = walk.maxGranule > 0 ? walk.maxGranule / rate : null;
      return {
        format: "ogg",
        mime: "audio/ogg",
        sampleRate: rate,
        channels: walk.ident.channels,
        bitDepth: null,
        durationSeconds: duration,
        decodable: false,
        facts: `ogg ${walk.ident.codec}, ${walk.ident.channels === 1 ? "mono" : `${walk.ident.channels} channels`}, ${rate} hz${
          duration === null ? "" : `, ${duration.toFixed(2)} s (granule scan)`
        }`,
      };
    }
    return {
      format: "ogg",
      mime: "audio/ogg",
      sampleRate: null,
      channels: null,
      bitDepth: null,
      durationSeconds: null,
      decodable: false,
      facts: "ogg page magic present but the identification header refused",
    };
  }
  const frame = mp3frame(bytes, id3skip(bytes));
  if (frame) {
    const audioBytes = Math.max(0, bytes.length - frame.offset);
    const duration = frame.bitrateKbps > 0 ? (audioBytes * 8) / (frame.bitrateKbps * 1000) : null;
    return {
      format: "mp3",
      mime: "audio/mpeg",
      sampleRate: frame.sampleRate,
      channels: frame.channels,
      bitDepth: null,
      durationSeconds: duration,
      decodable: false,
      facts: `${frame.generation} layer iii, ${frame.bitrateKbps} kbps, ${frame.sampleRate} hz, ${frame.mode}${
        duration === null ? "" : `, ~${duration.toFixed(2)} s (cbr estimate)`
      }`,
    };
  }
  return {
    format: "unknown",
    mime: "application/octet-stream",
    sampleRate: null,
    channels: null,
    bitDepth: null,
    durationSeconds: null,
    decodable: false,
    facts: "no container magic the probe walks (riff/wave, ogg pages, id3 or mpeg sync)",
  };
}

// ---- the energy chunks -------------------------------------------------------

/** One energy chunk of the envelope — the sub-second resolution the payload
 * adds over the one-second vector frames (the "chunks de energia" of the
 * owner's charge). */
export interface EnergyChunk {
  /** The chunk index (0-based, ascending). */
  i: number;
  /** The chunk span in milliseconds (the constant the lane rode). */
  ms: number;
  /** The rms of the chunk (0..1). */
  rms: number;
  /** The peak of the chunk (0..1+). */
  peak: number;
}

/**
 * energychunks — the fixed-span energy envelope of a pcm: one chunk per
 * ENERGY_CHUNK_MS with its rms and peak, the last chunk covering the tail.
 * Pure and deterministic — the same pcm answers the same chunks.
 *
 * @param pcm the mono pcm of any length.
 * @param sampleRate the rate of the pcm.
 * @param chunkMs the chunk span (defaults to ENERGY_CHUNK_MS).
 * @returns the chunks, ascending, rounded to six decimals.
 */
export function energychunks(pcm: Float32Array, sampleRate: number, chunkMs: number = ENERGY_CHUNK_MS): EnergyChunk[] {
  if (chunkMs <= 0 || !Number.isFinite(chunkMs)) chunkMs = ENERGY_CHUNK_MS;
  const win = Math.max(1, Math.round((chunkMs / 1000) * sampleRate));
  const chunks: EnergyChunk[] = [];
  for (let start = 0; start < pcm.length; start += win) {
    let sum = 0;
    let peak = 0;
    const end = Math.min(start + win, pcm.length);
    for (let i = start; i < end; i++) {
      sum += pcm[i] * pcm[i];
      const a = Math.abs(pcm[i]);
      if (a > peak) peak = a;
    }
    const count = end - start;
    chunks.push({
      i: chunks.length,
      ms: Math.round((start / sampleRate) * 1000),
      rms: Number(Math.sqrt(sum / count).toFixed(6)),
      peak: Number(peak.toFixed(6)),
    });
  }
  return chunks;
}

// ---- the structured payload --------------------------------------------------

/** The analysis depth the payload honestly declares: "full" (the wav lane —
 * the pcm was decoded and decomposed) or "container-only" (the compressed
 * lane — header facts only, zero analysis vectors, zero fake numbers). */
export type PayloadAnalysisDepth = "full" | "container-only";

/** The source block of the payload: what the bytes are and where they came
 * from — the identity fields (byte length, sha256) beside the container
 * facts the probe answered. */
export interface SoundPayloadSource {
  /** The display name of the source (one trailing extension folded away). */
  name: string;
  /** The byte length of the source. */
  byteLength: number;
  /** The sha256 of the source bytes (the content identity the store rides). */
  sha256: string;
  /** The container facts of the probe (format, mime, rate, channels, depth,
   * duration, decodable, the facts line). */
  container: SoundContainerFacts;
}

/** The track summary of the full analysis — the faixa numbers the owner's
 * charge names: duration, sample rate, tempo, key, loudness, the stems and
 * the structure counts. */
export interface SoundPayloadTrack {
  /** The analyzed duration in seconds (the whole source, or the clamped
   * window when maxDurationSeconds rode). */
  durationSeconds: number;
  /** The sample rate of the analysis (the source's own rate). */
  sampleRate: number;
  /** The dominant bpm of the mix (the autocorrelation tempo of the report). */
  bpm: number;
  /** The detected key: the tonic name and the mode. */
  key: { tonic: string; mode: "major" | "minor" };
  /** The integrated loudness of the mix in LUFS (measured, never claimed). */
  loudnessLufs: number;
  /** The onset count of the mix. */
  onsetCount: number;
  /** The per-stem summaries (role, frame count, onset count, peak, rms, pcmhash). */
  stems: {
    role: string;
    frames: number;
    onsets: number;
    peak: number;
    rms: number;
    pcmhash: number;
  }[];
  /** The structure section count of the mix report. */
  structureSections: number;
  /** The fnv-1a hash of the mix pcm (the fidelity id of the take). */
  pcmhash: number;
}

/** The beats block of the full analysis: the tempo and the onset lists — the
 * mix onsets beside the per-stem onsets (the "beats/onsets" of the charge). */
export interface SoundPayloadBeats {
  /** The dominant bpm of the mix. */
  bpm: number;
  /** The mix onset times in seconds, ascending. */
  onsetSeconds: number[];
  /** The per-stem onset lists, in the document's stem order. */
  stems: { role: string; onsetSeconds: number[] }[];
}

/** The structured payload document — the v1 pattern improved: the container
 * facts, the track summary, the energy chunks, the beats, and the embedded
 * debonair.ingest/1 document (the per-second vector frames the miner and the
 * composer read), all in one grammar, deterministic for the same bytes. */
export interface SoundPayload {
  /** The schema literal ("debonair.soundpayload/1"). */
  schema: string;
  /** The display name of the source. */
  name: string;
  /** The iso instant of the ingest. */
  ingestedAt: string;
  /** The honest depth marker ("full" | "container-only"). */
  analysis: PayloadAnalysisDepth;
  /** The source block (identity + container facts). */
  source: SoundPayloadSource;
  /** The track summary (null on the container-only lane). */
  track: SoundPayloadTrack | null;
  /** The energy chunks (empty on the container-only lane). */
  energy: EnergyChunk[];
  /** The beats block (null on the container-only lane). */
  beats: SoundPayloadBeats | null;
  /** The embedded decomposition document (null on the container-only lane). */
  document: IngestDocument | null;
}

/** The ingest options of the payload lane: the caller stamps the name, the
 * instant and the optional analysis window. */
export interface IngestPayloadOptions {
  /** The display name of the source (one trailing extension folds away). */
  name: string;
  /** The iso instant stamped on the payload (defaults to now). */
  at?: string;
  /** Decode at most this many seconds from the head (the bounded-work guard
   * the decode lane rides; the container facts keep the full duration). */
  maxDurationSeconds?: number;
}

/** The machine codes the payload ingest answers. */
export type IngestPayloadErrorCode = "unknown-format" | "wav-unwalkable" | "empty-audio";

/** The typed ingest result — ok carries the payload, the error branch
 * carries the machine code. Never a throw. */
export type IngestPayloadResult =
  | { ok: true; payload: SoundPayload }
  | { ok: false; code: IngestPayloadErrorCode; message: string };

/** Folds one trailing extension away and answers a non-empty display name. */
function displayname(name: string): string {
  const stripped = name.replace(/\.[^.]+$/, "");
  if (stripped.length > 0) return stripped;
  return name.length > 0 ? name : "untitled";
}

/** Downmixes interleaved pcm to the mono channel-average (the channel law
 * the worker lane rides, the [-1, 1] clamp included). */
function monodownmix(interleaved: Float32Array, channels: number): Float32Array {
  if (channels === 1) return interleaved;
  const frames = Math.floor(interleaved.length / channels);
  const mono = new Float32Array(frames);
  for (let frame = 0; frame < frames; frame++) {
    let sum = 0;
    for (let channel = 0; channel < channels; channel++) sum += interleaved[frame * channels + channel];
    const average = sum / channels;
    mono[frame] = Math.min(1, Math.max(-1, average));
  }
  return mono;
}

/**
 * ingestPayload — the forward ingest of the v1 pattern: the sound bytes
 * become the detailed structured payload. The wav lane decodes (the pure
 * riff walk), downmixes and hands the pcm to ingest.ts's own end-to-end
 * chain (ingestPcm — the decomposition math is never duplicated here), then
 * layers the container facts, the track summary, the energy chunks and the
 * beats around the embedded document. The mp3/ogg lanes answer the honest
 * container-only payload: real header facts, "container-only" depth, zero
 * analysis vectors — the pure node lane carries no compressed codec and the
 * payload says so instead of inventing numbers. Deterministic for the same
 * bytes and options.
 *
 * @param bytes the sound bytes (wav fully walked; mp3/ogg header facts only).
 * @param options the name, the optional instant and the optional window.
 * @returns the typed payload result (machine-coded refusals, never a throw).
 */
export function ingestPayload(bytes: Uint8Array, options: IngestPayloadOptions): IngestPayloadResult {
  const probe = probesound(bytes);
  const name = displayname(options.name);
  const source: SoundPayloadSource = {
    name,
    byteLength: bytes.length,
    sha256: sha256hex(bytes),
    container: probe,
  };
  const ingestedAt = options.at ?? new Date().toISOString();
  if (probe.format === "unknown") {
    return {
      ok: false,
      code: "unknown-format",
      message: `the bytes carry no container magic the lane walks: ${probe.facts}`,
    };
  }
  if (probe.format === "wav" && !probe.decodable) {
    return { ok: false, code: "wav-unwalkable", message: `the riff walk refused the bytes: ${probe.facts}` };
  }
  if (!probe.decodable) {
    // the honest compressed lane: header facts, zero fake vectors
    return {
      ok: true,
      payload: {
        schema: SOUND_PAYLOAD_SCHEMA_VERSION,
        name,
        ingestedAt,
        analysis: "container-only",
        source,
        track: null,
        energy: [],
        beats: null,
        document: null,
      },
    };
  }

  // the wav lane: decode the clamped window, downmix, decompose
  const layout = readWavLayout(bytes);
  const frames =
    options.maxDurationSeconds === undefined
      ? layout.frames
      : Math.min(layout.frames, Math.floor(options.maxDurationSeconds * layout.sampleRate));
  const interleaved = readWavSamples(bytes, { ...layout, frames });
  const mono = monodownmix(interleaved, layout.channels);
  if (mono.length === 0) return { ok: false, code: "empty-audio", message: "the container carries no audio frames" };
  const document = ingestPcm(mono, layout.sampleRate, { name, at: ingestedAt });
  const mixOnsets = onsetSecondsOf(mono, layout.sampleRate);
  const track: SoundPayloadTrack = {
    durationSeconds: document.durationSeconds,
    sampleRate: document.sampleRate,
    bpm: document.mix.rhythm.bpm,
    key: { tonic: document.mix.key.tonicName, mode: document.mix.key.mode },
    loudnessLufs: document.mix.loudness.integrated,
    onsetCount: mixOnsets.length,
    stems: document.stems.map((stem) => ({
      role: stem.role,
      frames: stem.segments.length,
      onsets: stem.onsetsSeconds.length,
      peak: stem.peak,
      rms: stem.rms,
      pcmhash: stem.pcmhash,
    })),
    structureSections: document.mix.structure.length,
    pcmhash: document.pcmhash,
  };
  const beats: SoundPayloadBeats = {
    bpm: document.mix.rhythm.bpm,
    onsetSeconds: mixOnsets.map((t) => Number(t.toFixed(4))),
    stems: document.stems.map((stem) => ({
      role: stem.role,
      onsetSeconds: stem.onsetsSeconds.map((t) => Number(t.toFixed(4))),
    })),
  };
  return {
    ok: true,
    payload: {
      schema: SOUND_PAYLOAD_SCHEMA_VERSION,
      name,
      ingestedAt,
      analysis: "full",
      source,
      track,
      energy: energychunks(mono, layout.sampleRate),
      beats,
      document,
    },
  };
}

// ---- the reverse ingest (the reconstruction) ---------------------------------

/** The synthesis gains of the reconstruction — the mix of the tonal bed, the
 * noise bed and the onset bursts; protocol constants of the lane, tuned once
 * and pinned by the fidelity tests. */
const SYNTH_GAINS = {
  /** The partial gain per weighted chroma bin. */
  partial: 0.3,
  /** The filtered-noise bed gain (the percussive bands). */
  noise: 0.5,
  /** The onset burst gain (the percussive attacks). */
  burst: 0.6,
} as const;

/** The onset burst shape: attack and decay in milliseconds. */
const BURST_ATTACK_MS = 1;
const BURST_DECAY_MS = 120;

/** The reconstruction options: the depth of the emitted wav. */
export interface ReconstructOptions {
  /** The bit depth of the wav bytes (16, 24 or 32f — defaults to 16). */
  bitDepth?: WavBitDepth;
}

/** The measured fidelity of the reconstruction — the per-second gap between
 * the synthesized rms and the payload's own vector frames, measured on the
 * synthesis the lane just ran (the truth funnel spirit of the corpus: zcr,
 * flatness, centroid — here the rms ladder — measured, never claimed). */
export interface ReconstructionFidelity {
  /** The mean absolute per-second rms gap against the document frames. */
  meanRmsError: number;
  /** The worst absolute per-second rms gap. */
  worstRmsError: number;
}

/** The reconstruction answer: the wav bytes plus the honest self-measurement. */
export interface SoundReconstruction {
  /** The riff/wave bytes (pcm16/24/32f per the options) — real container
   * bytes the player lane or the sandbox can stream as-is. */
  bytes: Uint8Array;
  /** The mime of the bytes ("audio/wav"). */
  mime: string;
  /** The sample rate of the synthesis (the payload's own analysis rate). */
  sampleRate: number;
  /** The duration of the synthesis in seconds. */
  durationSeconds: number;
  /** The fnv-1a hash of the synthesized pcm (the identity of the rebuild). */
  pcmhash: number;
  /** The measured fidelity against the payload's vector frames. */
  fidelity: ReconstructionFidelity;
}

/** The machine codes the reconstruction answers. */
export type ReconstructErrorCode =
  | "bad-schema"
  | "container-only"
  | "no-frames"
  | "rate-out-of-band"
  | "encode-refused";

/** The typed reconstruction result — ok carries the wav bytes and the
 * fidelity, the error branch carries the machine code. Never a throw. */
export type ReconstructResult =
  | { ok: true; reconstruction: SoundReconstruction }
  | { ok: false; code: ReconstructErrorCode; message: string };

/** Answers the energy shape of one second — the chunk rms values of that
 * second normalized to their max (0 when the second is silent, a flat 1 when
 * the payload carries no chunks for it), the within-second envelope both
 * stems ride. */
function secondshape(payload: SoundPayload, second: number, chunksPerSecond: number): number[] {
  const start = second * chunksPerSecond;
  const slice = payload.energy.slice(start, start + chunksPerSecond).map((chunk) => chunk.rms);
  if (slice.length === 0) return Array.from({ length: chunksPerSecond }, () => 1);
  const max = Math.max(...slice, 0);
  if (max <= 0) return slice.map(() => 0);
  return slice.map((rms) => rms / max);
}

/**
 * reconstructWav — the reverse ingest of the v1 pattern: the structured
 * payload becomes real wav bytes through seeded vector synthesis. The
 * harmonic stem's chroma frames drive additive partials (one sine per
 * weighted pitch class in the mid register, the phase drawn from the
 * engine's own mulberry32 seat), the percussive stem's band fractions drive
 * a three-band filtered-noise bed, the percussive onset list drives the
 * exponential-decay bursts, and the mix energy chunks shape every second —
 * the two synthesized stems sum like the hpss pair the document pinned. The
 * result is honest vector synthesis (the v1 proof's quality bar), never a
 * bit-exact re-encode: the payload carries vectors and hashes only, and the
 * fidelity block measures the per-second gap instead of claiming it away.
 * Deterministic — the same payload answers the same bytes.
 *
 * @param payload the structured payload (the full-analysis lane).
 * @param options the depth of the emitted wav (defaults to pcm16).
 * @returns the typed reconstruction result (machine-coded refusals).
 */
export function reconstructWav(payload: SoundPayload, options: ReconstructOptions = {}): ReconstructResult {
  if (payload.schema !== SOUND_PAYLOAD_SCHEMA_VERSION) {
    return {
      ok: false,
      code: "bad-schema",
      message: `the payload schema ${payload.schema} is not ${SOUND_PAYLOAD_SCHEMA_VERSION}`,
    };
  }
  if (payload.analysis !== "full" || !payload.document || !payload.track) {
    return {
      ok: false,
      code: "container-only",
      message:
        "the payload carries no vector frames (container-only lane) — the reconstruction needs the full analysis",
    };
  }
  const document = payload.document;
  if (document.segments.length === 0 || document.stems.length === 0) {
    return { ok: false, code: "no-frames", message: "the document carries no per-second frames to synthesize from" };
  }
  const sampleRate = document.sampleRate;
  if (sampleRate < SAMPLE_RATE_MIN || sampleRate > SAMPLE_RATE_MAX) {
    return {
      ok: false,
      code: "rate-out-of-band",
      message: `the analysis rate ${sampleRate} hz sits outside the writer band ${SAMPLE_RATE_MIN}..${SAMPLE_RATE_MAX}`,
    };
  }
  const seconds = document.segments.length;
  const chunksPerSecond = Math.max(1, Math.round(1000 / ENERGY_CHUNK_MS));
  const mono = new Float32Array(seconds * sampleRate);
  const rng = mulberry32(hashSeed(`soundpayload:${document.pcmhash}`));
  const harmonic = document.stems.find((stem) => stem.role === "harmonic") ?? document.stems[0];
  const percussive = document.stems.find((stem) => stem.role === "percussive") ?? document.stems[1];

  for (let second = 0; second < seconds; second++) {
    const shape = secondshape(payload, second, chunksPerSecond);
    const hseg = harmonic.segments[second];
    const pseg = percussive.segments[second];
    const start = second * sampleRate;
    // the tonal bed: one partial per weighted pitch class, the mid register
    let chromaMax = 0;
    for (let pc = 0; pc < 12; pc++) if (hseg.chroma[pc] > chromaMax) chromaMax = hseg.chroma[pc];
    const partials: { hz: number; amp: number; phase: number }[] = [];
    if (chromaMax > 0 && hseg.rms > 0) {
      for (let pc = 0; pc < 12; pc++) {
        const weight = hseg.chroma[pc] / chromaMax;
        if (weight < 0.1) continue;
        partials.push({
          hz: midiToHz(48 + pc),
          amp: weight * hseg.rms * SYNTH_GAINS.partial,
          phase: rng() * 2 * Math.PI,
        });
      }
    }
    // the noise bed: three one-pole bands shaped by the percussive fractions
    const lowAmp = pseg.bands[0] * pseg.rms * SYNTH_GAINS.noise;
    const midAmp = pseg.bands[1] * pseg.rms * SYNTH_GAINS.noise;
    const highAmp = pseg.bands[2] * pseg.rms * SYNTH_GAINS.noise;
    let lpLow = 0;
    let lpMid = 0;
    let lpHigh = 0;
    // the onset bursts of this second (the percussive attacks)
    const onsetsHere = percussive.onsetsSeconds.filter((t) => t >= second && t < second + 1);
    const attack = Math.max(1, Math.round((BURST_ATTACK_MS / 1000) * sampleRate));
    const decay = Math.max(1, Math.round((BURST_DECAY_MS / 1000) * sampleRate));
    const burstLength = attack + decay;
    for (let i = 0; i < sampleRate; i++) {
      const t = i / sampleRate;
      const envelope = shape[Math.min(chunksPerSecond - 1, Math.floor((i / sampleRate) * chunksPerSecond))];
      let sample = 0;
      for (const partial of partials)
        sample += partial.amp * envelope * Math.sin(2 * Math.PI * partial.hz * t + partial.phase);
      const white = rng() * 2 - 1;
      lpLow += 0.02 * (white - lpLow);
      lpMid += 0.12 * (white - lpMid);
      lpHigh += 0.5 * (white - lpHigh);
      sample += (lpLow * lowAmp + (lpMid - lpLow) * midAmp + (white - lpHigh) * highAmp) * envelope;
      for (const onset of onsetsHere) {
        const offset = Math.round((onset - second) * sampleRate);
        const at = i - offset;
        if (at < 0 || at >= burstLength) continue;
        const gain = at < attack ? at / attack : Math.exp(-(at - attack) / decay);
        sample += (rng() * 2 - 1) * pseg.peak * SYNTH_GAINS.burst * gain;
      }
      mono[start + i] = Math.min(1, Math.max(-1, sample));
    }
  }

  // the honest self-measurement: the per-second rms gap against the frames
  const errors: number[] = [];
  for (let second = 0; second < seconds; second++) {
    let sum = 0;
    const start = second * sampleRate;
    for (let i = 0; i < sampleRate; i++) sum += mono[start + i] * mono[start + i];
    errors.push(Math.abs(Math.sqrt(sum / sampleRate) - document.segments[second].rms));
  }
  const fidelity: ReconstructionFidelity = {
    meanRmsError: Number((errors.reduce((a, b) => a + b, 0) / (errors.length || 1)).toFixed(6)),
    worstRmsError: Number(Math.max(...errors, 0).toFixed(6)),
  };

  const bitDepth = options.bitDepth ?? RECONSTRUCT_DEFAULT_DEPTH;
  try {
    const bytes = encodeWav([mono], { sampleRate, bitDepth });
    return {
      ok: true,
      reconstruction: {
        bytes,
        mime: "audio/wav",
        sampleRate,
        durationSeconds: seconds,
        pcmhash: pcmhash(mono),
        fidelity,
      },
    };
  } catch (error) {
    const message = error instanceof WavError ? `${error.code} (${error.message})` : String(error);
    return { ok: false, code: "encode-refused", message: `the wavwriter refused the reconstruction: ${message}` };
  }
}
