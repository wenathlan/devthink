// # reverseingest — the reconstruction lane of the v1 law (root layer):
// the old outros.debonair v1 pattern decomposed a complete song into a
// structured json payload, and the reverse ingest reconstructed the song
// from the payload and played it. this lane implements that law honestly
// in the new sandbox model: the payload in (a json string or the parsed
// document), real audio out — reconstructed through the existing dsp
// lanes, never a parallel format, never a browser seat:
//
//   debonair.pattern/1 — the symbolic score: the validator clamps the
//     payload, the schedule bridge folds it onto the flat event list, the
//     render lane synthesises the mix sample-accurately at the 48 khz
//     mastering rate through the engine's own recipes (the one source the
//     browser bank and the offline bounce read — never re-implemented
//     here), the deterministic true-peak limiter closes the programme and
//     the wavwriter encodes the playable bytes (mono pcm 16). byte parity
//     with renderPlan: the same plan and seed answer the same bytes
//     through both doors, the test pins it — the reverse ingest IS the
//     render lane, only the door differs.
//
//   debonair.timeline/1 — the dissected reference (the decomposition of a
//     complete song: one frame per second, every detected event with its
//     onset, velocity and pitch): the reconstruction reassembles the
//     events through the same recipe lanes (a kick-classified transient
//     answers the kick recipe, a hat the hat seat, a hit the snare body,
//     a note the melodic lead voice at its pitch), then honours the
//     decomposition's own measurements — the per-second rms the frames
//     carry shapes the reconstructed loudness (the reassembly follows the
//     payload's energy law, a silent frame answers silence), the shaping
//     smoothed at the second boundaries, the limiter closing the
//     programme before the encode. honest limits, documented never
//     hidden: the payload carries onsets, not gates — a note answers the
//     nominal one-beat gate at the timeline's tempo (clamped inside
//     50 ms..2 s, the recipes carry their own envelopes); the chroma and
//     the centroid are the analysis's fingerprints, not synthesis
//     parameters — they stay in the report, never pretended into audio.
//
// the playable output is the render lane's own: mono pcm 16 wav bytes at
// the mastering rate, and the optional blob store seat puts them under
// audio/wav answering the pointer the playback lane streams (the same
// RenderBlobStore seam the render orchestrator rides — structural, the
// memory mirror and the gateway both satisfy it). determinism is total:
// the same payload answers the same bytes (the take identity rides the
// seed — the caller's seed or the payload's canonical serialization),
// and every failure answers the typed result with a machine code, never
// a throw. pure and node-side — zero browser, zero gpu, zero network.

import { hashSeed } from "./harmonyengine.ts";
import { limitTruePeak } from "./limiter.ts";
import {
  PATTERN_SCHEMA_VERSION,
  type PatternDocument,
  type PatternFrameEvent,
  type PatternTimeline,
  parsePattern,
  serializePattern,
  validatePatternProject,
  validatePatternTimeline,
} from "./patternenums.ts";
import {
  RENDER_BIT_DEPTH,
  RENDER_SAMPLE_RATE,
  RENDER_WAV_KIND,
  type RenderBlobStore,
  type RenderStorePut,
  renderPatternMix,
  schedulePattern,
} from "./renderworker.ts";
import type { NoteEvent } from "./takeevents.ts";
import { encodeWav } from "./wavwriter.ts";

/** The machine readable failure codes of the reverse ingest. */
export type ReverseIngestErrorCode = "bad-payload" | "empty-payload" | "render-failed" | "store-failed";

/** The typed reverse ingest failure, traceable to a machine code. */
export class ReverseIngestError extends Error {
  /** Machine readable failure code. */
  readonly code: ReverseIngestErrorCode;

  constructor(code: ReverseIngestErrorCode, message?: string) {
    super(message ?? `reverseingest ${code}`);
    this.name = "ReverseIngestError";
    this.code = code;
  }
}

/** The options one reconstruction rides. */
export interface ReverseIngestOptions {
  /** The take identity the seeded noise and the reconstruction ride —
   * absent answers the payload's own canonical serialization (one
   * payload, one identity, the same bytes every time). */
  seed?: string;
  /** The blob store the wav lands in (absent answers the bytes only —
   * the caller owns the playback). */
  store?: RenderBlobStore;
}

/** The ok answer: the playable wav beside the pcm it encoded. */
export interface ReverseIngestOk {
  ok: true;
  /** The payload schema the reconstruction rode. */
  schema: string;
  /** The playable wav bytes (mono pcm 16 at the mastering rate). */
  wav: Uint8Array;
  /** The limited pcm the wav encodes (the render lane's own close). */
  pcm: Float32Array;
  /** The sample rate of the reconstruction (the mastering law's 48 khz). */
  sampleRate: number;
  /** The duration in seconds (the release tail included). */
  durationSeconds: number;
  /** The blob pointer when a store rode the call (null otherwise). */
  wavPointer: { id: string; bytes: number; kind: string } | null;
}

/** The typed answer of one reconstruction — ok or the machine code. */
export type ReverseIngestResult = ReverseIngestOk | { ok: false; code: ReverseIngestErrorCode; message: string };

/** The nominal gate floor of a timeline event (s). */
const GATE_FLOOR_S = 0.05;
/** The nominal gate ceiling of a timeline event (s). */
const GATE_CEIL_S = 2;
/** The loudness-shaping window at the second boundaries (s) — the linear
 * ramp that keeps the per-second gain law from clicking. */
const SHAPE_RAMP_S = 0.01;
/** The loudness-shaping gain band — the reassembly follows the payload's
 * measurements inside this band, never an unbounded correction. */
const SHAPE_GAIN_BAND: readonly [number, number] = [0.25, 4];

/** The readable message of any thrown failure. */
function errmsgof(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Parses the payload source — a json string or the already-parsed
 * document — through the pattern contract (the one validator the file
 * lane and the llm lane ride; the machine codes pass through the
 * message, the code is ours). */
function parsePayload(source: string | PatternDocument): { ok: true; doc: PatternDocument } | { ok: false; message: string } {
  const result = typeof source === "string" ? parsePattern(source) : source === null || typeof source !== "object"
    ? { ok: false as const, code: "bad-schema" as const, message: "the payload is not an object" }
    : (source as { schema?: string }).schema === PATTERN_SCHEMA_VERSION
      ? validatePatternProject(source)
      : validatePatternTimeline(source);
  if (!result.ok) return { ok: false, message: `the payload failed the pattern contract (${result.code}): ${result.message}` };
  return { ok: true, doc: result.doc };
}

/** Maps a midi note onto hz (a4 = 440, the tuning law folded locally —
 * the payload's hz seat folds onto the midi seat the recipes read). */
function hzToMidi(hz: number): number {
  return 69 + 12 * Math.log2(Math.max(1, hz) / 440);
}

/** The nominal gate of a timeline event: one beat at the timeline's
 * tempo, clamped inside the documented band (the payload carries onsets,
 * not gates — the recipes carry their own envelopes). */
function gateOf(bpm: number): number {
  return Math.min(GATE_CEIL_S, Math.max(GATE_FLOOR_S, 60 / Math.max(30, bpm)));
}

/** The lane one timeline event rides: the kick-classified transient the
 * kick recipe, the hat the hat seat, a hit the snare body, a note the
 * melodic lead voice (the payload names no voice — the lead recipe is
 * the engine's melodic seat). */
function laneOf(event: PatternFrameEvent): { lane: string; role: "drums" | "lead"; midi: number } {
  if (event.kind === "transient") {
    if (event.note === "kick") return { lane: "kick", role: "drums", midi: 0 };
    if (event.note === "hat") return { lane: "hat", role: "drums", midi: 0 };
    return { lane: "snare", role: "drums", midi: 0 };
  }
  const midi = event.pitch ?? (event.hz !== undefined ? Math.round(hzToMidi(event.hz)) : 69);
  return { lane: "lead", role: "lead", midi: Math.min(127, Math.max(0, midi)) };
}

/**
 * Folds the dissected reference onto the flat event list — the
 * reassembly of the timeline payload: every event of every frame lands
 * at its second plus its onset, its velocity riding, its lane mapped by
 * the classification the detector stamped. The frames sort by second
 * first (a shuffled payload answers the same reconstruction).
 *
 * @param timeline the validated timeline payload.
 * @returns the flat event list (time-ascending), empty when the payload
 *   declares no event.
 */
export function timelineEvents(timeline: PatternTimeline): NoteEvent[] {
  const gate = gateOf(timeline.bpm);
  const events: NoteEvent[] = [];
  for (const frame of [...timeline.frames].sort((a, b) => a.s - b.s)) {
    for (const event of frame.events) {
      const seat = laneOf(event);
      events.push({
        lane: seat.lane,
        role: seat.role,
        time: frame.s + Math.min(1, Math.max(0, event.onset)),
        seconds: gate,
        velocity: Math.min(1, Math.max(0, event.velocity)),
        midi: seat.midi,
      });
    }
  }
  events.sort((a, b) => a.time - b.time);
  return events;
}

/** The rms of a slice of a pcm. */
function rmsAt(pcm: Float32Array, from: number, count: number): number {
  let sum = 0;
  const end = Math.min(pcm.length, from + count);
  for (let i = from; i < end; i++) sum += pcm[i] * pcm[i];
  const n = Math.max(1, end - from);
  return Math.sqrt(sum / n);
}

/**
 * Shapes the reconstructed mix onto the timeline's own loudness law: the
 * per-second rms the frames measured (0..1, the decomposition's honest
 * energy) rides the reconstruction — a frame that heard rms x shapes its
 * second toward x inside the documented gain band, a silent frame
 * answers silence, a second without a frame keeps the reconstruction
 * (the payload's frames are the truth, its gaps are not silence). The
 * per-second gains crossfade at the boundaries (the 10 ms ramp law).
 *
 * @param mix the rendered mix (the master law already applied).
 * @param timeline the validated timeline payload.
 * @returns the shaped mix, the same length.
 */
export function shapeTimelineLoudness(mix: Float32Array, timeline: PatternTimeline): Float32Array {
  const rate = RENDER_SAMPLE_RATE;
  const out = Float32Array.from(mix);
  const frames = new Map<number, number>();
  for (const frame of timeline.frames) frames.set(frame.s, frame.rms);
  const seconds = Math.floor(out.length / rate);
  if (seconds === 0) return out;
  // the per-second gain law
  const gains = new Float64Array(seconds);
  for (let s = 0; s < seconds; s++) {
    const measured = frames.get(s);
    if (measured === undefined) {
      gains[s] = 1;
      continue;
    }
    if (!(measured > 0)) {
      gains[s] = 0;
      continue;
    }
    const actual = rmsAt(out, s * rate, rate);
    if (actual < 1e-6) {
      // the payload heard something the events do not carry — nothing to
      // shape, the reconstruction keeps its silence (the events are the
      // score, the rms shapes what renders)
      gains[s] = 1;
      continue;
    }
    gains[s] = Math.min(SHAPE_GAIN_BAND[1], Math.max(SHAPE_GAIN_BAND[0], measured / actual));
  }
  // the crossfaded application: the ramp window rides the boundaries
  const ramp = Math.max(1, Math.round(SHAPE_RAMP_S * rate));
  for (let s = 0; s < seconds; s++) {
    const start = s * rate;
    const end = Math.min(out.length, start + rate);
    for (let i = start; i < end; i++) {
      let gain = gains[s] ?? 1;
      const into = i - start;
      const rest = end - i;
      if (into < ramp && s > 0) {
        const previous = gains[s - 1] ?? 1;
        gain = previous + ((gain - previous) * into) / ramp;
      } else if (rest < ramp && s + 1 < seconds) {
        const next = gains[s + 1] ?? 1;
        gain = gain + ((next - gain) * (ramp - rest)) / ramp;
      }
      out[i] = (mix[i] ?? 0) * gain;
    }
  }
  return out;
}

/** The ok branch builder. */
function okOf(
  schema: string,
  pcm: Float32Array,
  wav: Uint8Array,
  pointer: { id: string; bytes: number; kind: string } | null,
): ReverseIngestResult {
  return {
    ok: true,
    schema,
    wav,
    pcm,
    sampleRate: RENDER_SAMPLE_RATE,
    durationSeconds: pcm.length / RENDER_SAMPLE_RATE,
    wavPointer: pointer,
  };
}

/** The error branch builder. */
function fail(code: ReverseIngestErrorCode, message: string): ReverseIngestResult {
  return { ok: false, code, message };
}

/**
 * Reconstructs the playable audio from a structured payload — the
 * reverse ingest of the v1 law: the payload (a canonical json string or
 * the parsed document, either schema the pattern contract owns) walks
 * the render lane and answers the wav bytes the player streams. The
 * pattern score synthesises through the engine's own recipes (byte parity
 * with renderPlan under the same seed — the test pins it); the dissected
 * timeline reassembles its events through the same recipe lanes and
 * shapes the loudness onto the frames' own measurements. The optional
 * store seat lands the wav under audio/wav answering the pointer.
 * Deterministic, typed, node-side — never a throw.
 *
 * @param source the payload (a json string or the parsed pattern or
 *   timeline document).
 * @param options the take identity seed and the optional store seat.
 * @returns the playable wav beside the pcm it encoded, or the machine
 *   code of the refusing lane.
 */
export async function reverseIngestPayload(
  source: string | PatternDocument,
  options: ReverseIngestOptions = {},
): Promise<ReverseIngestResult> {
  const parsed = parsePayload(source);
  if (!parsed.ok) return fail("bad-payload", parsed.message);
  const doc = parsed.doc;

  // the take identity: the caller's seed, else the payload's own
  // canonical serialization (one payload, one identity)
  let seed = options.seed;
  if (seed === undefined) {
    try {
      seed = `reverseingest:${hashSeed(serializePattern(doc)).toString(16)}`;
    } catch {
      seed = "reverseingest";
    }
  }

  // the reconstruction: both payloads fold onto the flat event list and
  // synthesise through the render lane's own mix
  let mix: Float32Array;
  try {
    if (doc.schema === PATTERN_SCHEMA_VERSION) {
      const schedule = schedulePattern(doc);
      if (schedule.events.length === 0)
        return fail("empty-payload", "the score carries no drum hits and no notes — nothing to reconstruct");
      mix = renderPatternMix(schedule, `noise:${seed}:${doc.prompt}`);
    } else {
      const events = timelineEvents(doc);
      if (events.length === 0)
        return fail("empty-payload", "the timeline declares no events — nothing to reconstruct");
      const schedule = { events, duration: Math.max(doc.seconds, events[events.length - 1]?.time ?? 0), stepSeconds: 60 / (doc.bpm * 4) };
      mix = renderPatternMix(schedule, `noise:${seed}:timeline`);
      mix = shapeTimelineLoudness(mix, doc);
    }
  } catch (error) {
    return fail("render-failed", `the reconstruction faulted: ${errmsgof(error)}`);
  }

  // the mastering close and the playable encode (the render lane's law)
  let pcm: Float32Array;
  let wav: Uint8Array;
  try {
    pcm = limitTruePeak(mix, RENDER_SAMPLE_RATE);
    wav = encodeWav([pcm], { sampleRate: RENDER_SAMPLE_RATE, bitDepth: RENDER_BIT_DEPTH });
  } catch (error) {
    return fail("render-failed", `the encode refused the reconstruction: ${errmsgof(error)}`);
  }

  // the optional store seat: the wav lands beside its pointer
  if (options.store !== undefined) {
    let put: RenderStorePut;
    try {
      put = await options.store.put(wav, RENDER_WAV_KIND);
    } catch (error) {
      return fail("store-failed", `the store lane threw: ${errmsgof(error)}`);
    }
    if (!put.ok) return fail("store-failed", `the store refused the wav: ${put.code} (${put.message})`);
    return okOf(doc.schema, pcm, wav, put.pointer);
  }
  return okOf(doc.schema, pcm, wav, null);
}
