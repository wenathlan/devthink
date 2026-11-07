// # kathesis — the engine seat and the dsp core of the debonair family:
// the one keyword file the engine laws pin for the synthesis, effects and
// sound-ai primitives the render lane, the studio desk and the reverse
// ingest read. debonair IS the kathesis engine (the complete daw and
// sound-ai infrastructure, the suno.com / google flow music / fl studio
// mobile / youtube competitor the platform law names) and kathesis houses
// katexis (the site vocabulary of katexis.ts answers the content tables,
// never the dsp — the two never swap seats).
//
// the sections of this seat, in file order:
//
//   the engine registry      the seat table (every seat the mission names
//                            with its owning module — the honest map, no
//                            seat claims a module that does not exist)
//   the payload generations  the v1/v2/v3 registry the outros.debonair
//                            research recorded (docs/kathesisresearch.md):
//                            v1 the detailed decomposition law this engine
//                            ships (the debonair dot-slash-one schema family), v2 the
//                            vector-one studio contracts (the historical
//                            "vector-one/*@5.0" ids this seat recognizes
//                            and converts onto the v1 contract), v3 the
//                            recon seat law (debonair.recon/3 — the frozen
//                            parameter seats of docs/recon.spec.md)
//   the dsp primitives       the webaudio automation ramps (verbatim from
//                            the render lane, the one source law), the
//                            full rbj cookbook biquad set (the render
//                            lane's low/high/bandpass trio extended with
//                            notch, allpass, peaking and both shelves) and
//                            the transfer-function magnitude walk
//   the wavetable seat       band-limited additive wavetables (sine, saw,
//                            square, triangle, soft saw, pulse, organ) in
//                            mip tiers (the harmonic ceiling ladder that
//                            keeps high notes inside nyquist) behind the
//                            phase-accumulator oscillator with morph,
//                            detune and drift — real wavetable synthesis,
//                            never a naive aliasing saw
//   the adsr seat            the attack/decay/sustain/release envelope as
//                            the closed-form level law and the streaming
//                            gate/release state machine the voices ride
//   the eq chain seat        the parametric band cascade (peaking, shelves,
//                            pass and notch) with the summed magnitude
//                            response in db — the mixer's eq, real
//                            transfer-function math
//   the delay seat           the fractional delay line, the damped
//                            feedback delay (the echo send) and the
//                            ping-pong stereo pair
//   the reverb seat          the freeverb law: eight parallel combs and
//                            four series allpasses per channel, the stereo
//                            spread, room size and damping — the plate of
//                            the rack
//   the drive seat           the tanh soft-clip waveshaper law (the master
//                            saturation the reference engine pinned)
//   the effects rack seat    the ordered slot chain (gain → eq → drive →
//                            delay → reverb) any lane renders through
//   the sampler seat         the sample voice: a float32 take pitched by
//                            the ratio law, looped between the loop
//                            points, gated by the adsr seat, routed
//                            through an optional rack
//   the sound ai seat        the honest generative core: the markov model
//                            over payload events (note transitions, drum
//                            lane histograms, the velocity, duration and
//                            bpm histograms, the scale affinity and the
//                            root mass — the vector-one model state the
//                            research recorded, ported onto the
//                            debonair.timeline/1 and debonair.pattern/1
//                            payloads this engine owns) and the spectral
//                            envelope pair (the mel-band envelope of a
//                            magnitude stack, the additive resynthesis
//                            under it) — deterministic, seeded, never a
//                            fake label on static data
//
// library-grade: domain types and pure, deterministic helpers only — zero
// consumer data, zero storage, zero browser seats, zero network (the edge
// law: the heavy walks ride the saddle lanes the sandboxmodality seat
// declares, never the visitor's machine). the same call runs in the
// browser and in node. Non-goals: no analysis (audio.ts owns it), no
// scheduling (renderengine.ts owns it), no payloads (pattern.ts owns the
// contract — this seat reads the types and folds the historical v2
// documents onto it, never re-validates by its own law).

import { melbands } from "./audio.ts";
import { hashSeed, mulberry32 } from "./harmonyengine.ts";
import { MASTERING } from "./katexis.ts";
import { dbToLinear } from "./mixergraph.ts";
import {
  BPM_BUCKET_EDGES,
  DRUM_LANE_KEYS,
  EMBEDDING_DIM,
  LANE_STEPS,
  PATTERN_LIMITS,
  PATTERN_SCALE_NAMES,
  TIMELINE_SCHEMA_VERSION,
  type PatternDocument,
  type PatternDrumLaneKey,
  type PatternProject,
  type PatternTimeline,
  validatePatternProject,
  validatePatternTimeline,
} from "./pattern.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the engine registry — the seat table. */
/* ════════════════════════════════════════════════════════════════════ */

/** The engine name the platform law pins (debonair houses this engine). */
export const ENGINE_NAME = "kathesis" as const;

/** The site vocabulary the engine houses (katexis.ts — content only). */
export const ENGINE_HOUSES = "katexis" as const;

/** The engine's own schema generation (the v1 law this seat ships). */
export const ENGINE_SCHEMA_GENERATION = "v1" as const;

/** One row of the engine seat table: a named seat, its owning module and
 * the one-line law of what it owns (the honest map — a seat never claims
 * a module that does not exist). */
export interface KathesisSeat {
  /** The seat name (kebab, the vocabulary the docs speak). */
  seat: string;
  /** The owning module of the seat (the file that answers it). */
  module: string;
  /** The one-line law of the seat. */
  owns: string;
}

/** The seat table of the kathesis engine — every seat the platform law
 * names (music studio, mixer, effects rack, transport, sampler,
 * synthesis, voice, mixing, mastering) beside the ingest pair and the
 * sound ai, each answered by the module that owns it. */
export const KATHESIS_SEATS: readonly KathesisSeat[] = Object.freeze([
  { seat: "music-studio", module: "audio.ts", owns: "the take engine, the browser transport graph and the analysis pipeline the studio pages ride" },
  { seat: "mixer", module: "mixergraph.ts", owns: "the strip graph, the fader math (db ↔ linear), the sends and the resolved bus paths" },
  { seat: "effects-rack", module: "kathesis.ts", owns: "the ordered slot chain — eq, drive, delay and reverb — any lane renders through" },
  { seat: "transport", module: "audio.ts", owns: "the lookahead scheduler, the vu taps and the take playhead law" },
  { seat: "sampler", module: "kathesis.ts", owns: "the sample voice — a float32 take pitched by the ratio law, looped, gated, routed" },
  { seat: "synthesis", module: "kathesis.ts", owns: "the wavetable oscillator tiers, the adsr seat and the spectral resynthesis bank" },
  { seat: "voice", module: "formant.ts", owns: "the glottal source, the formant filter bank and the vowel phrase renderer (vocalsynth.ts sings the line)" },
  { seat: "mixing", module: "renderengine.ts", owns: "the recipe voices over the bus faders — the offline bounce and the desk share one law" },
  { seat: "mastering", module: "limiter.ts", owns: "the true-peak oversampling limiter and the bs.1770 loudness law (loudness.ts)" },
  { seat: "ingest", module: "ingest.ts", owns: "the stream separation, the pcm decode and the detailed structured payload documents" },
  { seat: "reverse-ingest", module: "reverseingest.ts", owns: "the reconstruction — a payload in, playable wav bytes out (the v1 law's second door)" },
  { seat: "sound-ai", module: "kathesis.ts", owns: "the markov model over payload events and the spectral envelope resynthesis" },
  { seat: "sandbox", module: "sandboxmodality.ts", owns: "the saddle lane declarations the heavy walks ride (the edge law — never the visitor's machine)" },
] as const);

/** Answers one seat row by name.
 *
 * @param seat the seat name.
 * @returns the row, or undefined when the table carries no such seat. */
export function seatOf(seat: string): KathesisSeat | undefined {
  return KATHESIS_SEATS.find((row) => row.seat === seat);
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the payload generations — the v1/v2/v3 registry. */
/* ════════════════════════════════════════════════════════════════════ */

/** The generation ids the corpus records (the outros.debonair lineage). */
export type PayloadGenerationId = "v1" | "v2" | "v3";

/** One generation of the ingest payload standard: the id, the schema ids
 * the generation signed itself with and the honest law of what it was. */
export interface PayloadGeneration {
  /** The generation id. */
  id: PayloadGenerationId;
  /** The schema literals the generation signed (the v1 family is the one
   * this engine writes; v2/v3 answer the historical ids). */
  schemas: readonly string[];
  /** The law of the generation (one honest sentence, research-derived). */
  law: string;
}

/** The payload generations the deep research recorded
 * (docs/kathesisresearch.md §1.1): v1 — the per-second decomposition law
 * (ingest converts a complete song into a detailed structured json
 * payload, the reverse ingest reconstructs and plays it; improved, it is
 * the law this engine ships as the debonair dot-slash-one schema family); v2 — the
 * vector-one studio contracts (the typed zod documents of the historical
 * outros.debonair v2 tree: "vector-one/timeline@5.0" and
 * "vector-one/project@5.0"); v3 — the recon seat law (debonair.recon/3,
 * the frozen parameter seats — 76 header, 66 layer per second — that
 * docs/recon.spec.md pins; no separate v3 folder survived the corpus
 * dedup, the cascade generation of the v2 tree is its honest record). */
export const PAYLOAD_GENERATIONS: readonly PayloadGeneration[] = Object.freeze([
  {
    id: "v1",
    schemas: [
      "debonair.pattern/1",
      "debonair.timeline/1",
      "debonair.ingest/1",
      "debonair.soundpayload/1",
      "debonair.ingeststems/1",
      "debonair.stems/1",
      "debonair.profile/1",
      "debonair.reconseed/1",
      "debonair.blob/1",
      "debonair.corpus/1",
      "debonair.soundmodel/1",
    ],
    law: "the detailed decomposition standard: ingest converts a complete music track into a structured json payload (segments, beats, spectral frames, stems, events) and the reverse ingest reconstructs and plays it — the sandbox lane, never the visitor's browser",
  },
  {
    id: "v2",
    schemas: ["vector-one/timeline@5.0", "vector-one/project@5.0"],
    law: "the historical vector-one studio contracts of the outros.debonair v2 tree — one frame per second (rms, centroid, flux, chroma, embedding, events, tags) beside the symbolic project; recognized and converted onto the v1 contract by this seat",
  },
  {
    id: "v3",
    schemas: ["debonair.recon/3"],
    law: "the recon seat law: the frozen parameter seats of docs/recon.spec.md (76 header seats, 66 layer seats per second, 4 correlations) — the compact carrier the reconstruction ladder reads",
  },
] as const);

/** Answers the generation one schema literal belongs to.
 *
 * @param schema the schema literal of a payload document.
 * @returns the generation row, or undefined when the literal belongs to
 *   no recorded generation. */
export function payloadGenerationOf(schema: string): PayloadGeneration | undefined {
  return PAYLOAD_GENERATIONS.find((generation) => generation.schemas.includes(schema));
}

/** The typed answer of the historical v2 fold — ok or the machine code. */
export type VectorOneFoldResult =
  | { ok: true; doc: PatternTimeline }
  | { ok: false; code: "bad-schema" | "bad-fold"; message: string };

/**
 * Folds one historical vector-one timeline (the outros.debonair v2
 * contract, "vector-one/timeline@5.0") onto the v1 contract this engine
 * owns — the history-aware door of the ingest pair: a payload the old
 * studio wrote still walks the reverse ingest. The fold is honest and
 * documented: the frame fields map one to one (the shapes descend from
 * the same lineage), the note labels lower their spelling, a transient
 * label outside the v1 vocabulary (kick / hat / hit) folds onto the
 * generic "hit", and the clamps ride the one validator of record
 * (validatePatternTimeline — never a second law here).
 *
 * @param value the parsed vector-one document.
 * @returns the validated debonair.timeline/1 document, or the machine
 *   code of the refusing fold.
 */
export function vectorOneTimelineToPatternTimeline(value: unknown): VectorOneFoldResult {
  if (typeof value !== "object" || value === null) {
    return { ok: false, code: "bad-schema", message: "the vector-one payload is not an object" };
  }
  const record = value as Record<string, unknown>;
  if (record.schema !== "vector-one/timeline@5.0") {
    return { ok: false, code: "bad-schema", message: 'the schema must be "vector-one/timeline@5.0"' };
  }
  if (!Array.isArray(record.frames)) {
    return { ok: false, code: "bad-fold", message: "the vector-one payload carries no frames array" };
  }
  // the fold: same lineage, one-to-one fields, the honest label law
  const frames = record.frames.map((entry) => {
    if (typeof entry !== "object" || entry === null) return entry;
    const frame = { ...(entry as Record<string, unknown>) };
    if (Array.isArray(frame.events)) {
      frame.events = frame.events.map((event) => {
        if (typeof event !== "object" || event === null) return event;
        const folded = { ...(event as Record<string, unknown>) };
        if (typeof folded.note === "string") {
          const lowered = folded.note.trim().toLowerCase();
          folded.note = folded.kind === "transient" && !["kick", "hat", "hit"].includes(lowered) ? "hit" : lowered;
        }
        return folded;
      });
    }
    return frame;
  });
  const folded = { ...record, schema: TIMELINE_SCHEMA_VERSION, frames };
  const result = validatePatternTimeline(folded);
  if (!result.ok) {
    return { ok: false, code: "bad-fold", message: `the fold failed the v1 contract (${result.code}): ${result.message}` };
  }
  return { ok: true, doc: result.doc };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the dsp primitives — the ramps and the biquad set. */
/* ════════════════════════════════════════════════════════════════════ */

/** The exponential ramp of the webaudio automation law: v(t) = from *
 * (to/from)^(dt/seconds), holding the end values outside the span. */
export function expRampOf(from: number, to: number, dt: number, seconds: number): number {
  if (dt <= 0) return from;
  if (dt >= seconds) return to;
  return from * (to / from) ** (dt / seconds);
}

/** The linear ramp of the webaudio automation law, holding the ends. */
export function linearRampOf(from: number, to: number, dt: number, seconds: number): number {
  if (dt <= 0) return from;
  if (dt >= seconds) return to;
  return from + ((to - from) * dt) / seconds;
}

/** The set-target curve of the webaudio automation law: target + (from -
 * target) * exp(-dt/tc). */
export function targetOf(target: number, from: number, dt: number, tc: number): number {
  if (dt <= 0) return from;
  return target + (from - target) * Math.exp(-dt / tc);
}

/** The biquad families of the rbj cookbook — the render lane's trio
 * (lowpass, highpass, bandpass) extended with the notch, the allpass,
 * the peaking filter and both shelves the eq chain rides. */
export type BiquadFamily =
  | "lowpass"
  | "highpass"
  | "bandpass"
  | "notch"
  | "allpass"
  | "peaking"
  | "lowshelf"
  | "highshelf";

/** One running biquad filter — the rbj coefficients of the webaudio
 * biquad's transfer function (the spec-pinned response), direct form 1. */
export interface BiquadFilter {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

/**
 * Builds one biquad filter voice — the rbj cookbook coefficients of the
 * webaudio biquad law (the same transfer function the browser node pins,
 * q the caller carries or the node's default 1; the peaking and shelf
 * seats fold the gain in db through the a-coefficient law). The math is
 * verbatim the render lane's — this seat is the one source, the lanes
 * import it.
 *
 * @param type the filter family.
 * @param hz the cutoff (or center) frequency.
 * @param q the resonance (the webaudio default is 1).
 * @param sampleRate the render rate.
 * @param gainDb the boost/cut of the peaking and shelf seats (ignored by
 *   the pass/notch/allpass families).
 * @returns the primed filter (zero state).
 */
export function biquadOf(
  type: BiquadFamily,
  hz: number,
  q: number,
  sampleRate: number,
  gainDb = 0,
): BiquadFilter {
  const omega = (2 * Math.PI * hz) / sampleRate;
  const cos = Math.cos(omega);
  const alpha = Math.sin(omega) / (2 * q);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let a0 = 1 + alpha;
  let a1 = -2 * cos;
  let a2 = 1 - alpha;
  if (type === "lowpass") {
    b0 = (1 - cos) / 2;
    b1 = 1 - cos;
    b2 = (1 - cos) / 2;
  } else if (type === "highpass") {
    b0 = (1 + cos) / 2;
    b1 = -(1 + cos);
    b2 = (1 + cos) / 2;
  } else if (type === "bandpass") {
    // the constant-peak bandpass the webaudio spec pins
    b0 = alpha;
    b1 = 0;
    b2 = -alpha;
  } else if (type === "notch") {
    b0 = 1;
    b1 = -2 * cos;
    b2 = 1;
  } else if (type === "allpass") {
    b0 = 1 - alpha;
    b1 = -2 * cos;
    b2 = 1 + alpha;
  } else {
    // the gain seats: the peaking filter and both shelves
    const a = 10 ** (gainDb / 40);
    const twoSqrtAA = 2 * Math.sqrt(a) * alpha;
    if (type === "peaking") {
      b0 = 1 + alpha * a;
      b1 = -2 * cos;
      b2 = 1 - alpha * a;
      a0 = 1 + alpha / a;
      a1 = -2 * cos;
      a2 = 1 - alpha / a;
    } else if (type === "lowshelf") {
      b0 = a * (a + 1 - (a - 1) * cos + twoSqrtAA);
      b1 = 2 * a * (a - 1 - (a + 1) * cos);
      b2 = a * (a + 1 - (a - 1) * cos - twoSqrtAA);
      a0 = a + 1 + (a - 1) * cos + twoSqrtAA;
      a1 = -2 * (a - 1 + (a + 1) * cos);
      a2 = a + 1 + (a - 1) * cos - twoSqrtAA;
    } else {
      // highshelf
      b0 = a * (a + 1 + (a - 1) * cos + twoSqrtAA);
      b1 = -2 * a * (a - 1 + (a + 1) * cos);
      b2 = a * (a + 1 + (a - 1) * cos - twoSqrtAA);
      a0 = a + 1 - (a - 1) * cos + twoSqrtAA;
      a1 = 2 * (a - 1 - (a + 1) * cos);
      a2 = a + 1 - (a - 1) * cos - twoSqrtAA;
    }
  }
  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0,
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  };
}

/** Steps one biquad over one input sample (direct form 1). */
export function runBiquad(filter: BiquadFilter, x: number): number {
  const y =
    filter.b0 * x + filter.b1 * filter.x1 + filter.b2 * filter.x2 - filter.a1 * filter.y1 - filter.a2 * filter.y2;
  filter.x2 = filter.x1;
  filter.x1 = x;
  filter.y2 = filter.y1;
  filter.y1 = y;
  return y;
}

/**
 * The magnitude response of one biquad at a frequency — the transfer
 * function H(z) walked on the unit circle (z = e^{jw}, the classic
 * frequency response of the direct form coefficients), answered in db.
 *
 * @param filter the primed filter (the state never moves — the walk is
 *   pure).
 * @param hz the probe frequency.
 * @param sampleRate the render rate.
 * @returns the magnitude in db (0 db = unity).
 */
export function biquadMagnitudeDb(filter: BiquadFilter, hz: number, sampleRate: number): number {
  const w = (2 * Math.PI * hz) / sampleRate;
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  // z^-1 = e^{-jw}, z^-2 = e^{-2jw}
  const re1 = cosW;
  const im1 = -sinW;
  const re2 = Math.cos(2 * w);
  const im2 = -Math.sin(2 * w);
  const numeratorRe = filter.b0 + filter.b1 * re1 + filter.b2 * re2;
  const numeratorIm = filter.b1 * im1 + filter.b2 * im2;
  const denominatorRe = 1 + filter.a1 * re1 + filter.a2 * re2;
  const denominatorIm = filter.a1 * im1 + filter.a2 * im2;
  const numeratorSq = numeratorRe * numeratorRe + numeratorIm * numeratorIm;
  const denominatorSq = denominatorRe * denominatorRe + denominatorIm * denominatorIm;
  if (denominatorSq <= 0) return 0;
  const ratio = numeratorSq / denominatorSq;
  if (ratio <= 0) return -Infinity;
  return 10 * Math.log10(ratio);
}

/** One running one-pole lowpass — the damping seat of the delay loops. */
export interface OnePoleFilter {
  /** The feedback coefficient (the pole position, 0..1). */
  a: number;
  /** The last output (the filter state). */
  z: number;
}

/**
 * Builds one one-pole lowpass — y[n] = (1-a)·x[n] + a·y[n-1], the pole
 * pinned by the cutoff law a = exp(-2π·hz/sr).
 *
 * @param hz the cutoff frequency.
 * @param sampleRate the render rate.
 * @returns the primed filter (zero state).
 */
export function onePoleOf(hz: number, sampleRate: number): OnePoleFilter {
  return { a: Math.exp((-2 * Math.PI * hz) / sampleRate), z: 0 };
}

/** Steps one one-pole lowpass over one input sample. */
export function runOnePole(filter: OnePoleFilter, x: number): number {
  filter.z = (1 - filter.a) * x + filter.a * filter.z;
  return filter.z;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the wavetable seat — band-limited additive tables. */
/* ════════════════════════════════════════════════════════════════════ */

/** The wavetable shapes the seat builds (each an honest additive law). */
export type WavetableShape = "sine" | "saw" | "square" | "triangle" | "softsaw" | "pulse" | "organ";

/** The shapes table (the vocabulary the oscillator morph reads). */
export const WAVETABLE_SHAPES: readonly WavetableShape[] = [
  "sine",
  "saw",
  "square",
  "triangle",
  "softsaw",
  "pulse",
  "organ",
];

/** The wavetable size (one table holds this many samples, one cycle). */
export const WAVETABLE_SIZE = 2048;

/** The harmonic ceilings of the mip ladder — a note picks the richest
 * tier whose ceiling stays inside nyquist (the anti-aliasing law of the
 * classic wavetable synths: high notes read narrow tables). */
export const WAVETABLE_TIERS: readonly number[] = [256, 128, 64, 32, 16, 8, 4, 2, 1];

/** The pulse duty of the pulse shape (62 percent — the vintage wide
 * pulse the law documents). */
export const PULSE_DUTY = 0.62;

/** The organ drawbar law: the partial multiples beside their weights
 * (the honest additive recipe, not a sampled pipe). */
export const ORGAN_PARTIALS: readonly { multiple: number; weight: number }[] = [
  { multiple: 1, weight: 1 },
  { multiple: 2, weight: 0.5 },
  { multiple: 3, weight: 0.35 },
  { multiple: 4, weight: 0.25 },
  { multiple: 6, weight: 0.2 },
  { multiple: 8, weight: 0.15 },
];

/** The soft-saw rolloff exponent (harmonic n answers 1/n^1.25 — the
 * warmer saw, gentler than the pure 1/n law). */
export const SOFTSAW_ROLLOFF = 1.25;

/** The peak the built tables normalize to (headroom below unity). */
export const WAVETABLE_PEAK = 0.9;

/**
 * Builds one band-limited wavetable by additive synthesis — the partial
 * law of the shape summed over one cycle, dc-corrected and peak
 * normalized. Real wavetable math: every sample is the closed-form
 * partial sum, never a naive modulo saw.
 *
 * @param shape the wave shape.
 * @param harmonics the partial ceiling (the table holds at most this
 *   many harmonics).
 * @returns the table (WAVETABLE_SIZE samples, one cycle, -peak..peak).
 */
export function buildWavetable(shape: WavetableShape, harmonics: number): Float32Array {
  const table = new Float32Array(WAVETABLE_SIZE);
  const ceiling = Math.max(1, Math.floor(harmonics));
  for (let index = 0; index < WAVETABLE_SIZE; index++) {
    const phase = index / WAVETABLE_SIZE;
    let sum = 0;
    if (shape === "sine") {
      sum = Math.sin(2 * Math.PI * phase);
    } else if (shape === "saw") {
      for (let n = 1; n <= ceiling; n++) sum += Math.sin(2 * Math.PI * n * phase) / n;
    } else if (shape === "square") {
      for (let n = 1; n <= ceiling; n += 2) sum += (4 / (Math.PI * n)) * Math.sin(2 * Math.PI * n * phase);
    } else if (shape === "triangle") {
      for (let n = 1, k = 0; n <= ceiling; n += 2, k++) {
        sum += (((-1) ** k) * 8 / (Math.PI * Math.PI * n * n)) * Math.sin(2 * Math.PI * n * phase);
      }
    } else if (shape === "softsaw") {
      for (let n = 1; n <= ceiling; n++) sum += Math.sin(2 * Math.PI * n * phase) / n ** SOFTSAW_ROLLOFF;
    } else if (shape === "pulse") {
      // the fourier series of the duty-p pulse: (2/(n·π))·sin(n·π·w)
      for (let n = 1; n <= ceiling; n++) {
        sum += ((2 / (Math.PI * n)) * Math.sin(Math.PI * n * PULSE_DUTY)) * Math.cos(2 * Math.PI * n * phase);
      }
    } else {
      // organ: the drawbar partials inside the ceiling
      for (const partial of ORGAN_PARTIALS) {
        if (partial.multiple > ceiling) continue;
        sum += partial.weight * Math.sin(2 * Math.PI * partial.multiple * phase);
      }
    }
    table[index] = sum;
  }
  // the dc correction (the pulse carries a mean — the tables stay centered)
  let mean = 0;
  for (let index = 0; index < WAVETABLE_SIZE; index++) mean += table[index];
  mean /= WAVETABLE_SIZE;
  let peak = 0;
  for (let index = 0; index < WAVETABLE_SIZE; index++) {
    table[index] -= mean;
    peak = Math.max(peak, Math.abs(table[index]));
  }
  if (peak > 0) {
    const scale = WAVETABLE_PEAK / peak;
    for (let index = 0; index < WAVETABLE_SIZE; index++) table[index] *= scale;
  }
  return table;
}

/** The built table tiers of one shape — one table per harmonic ceiling of
 * the mip ladder, indexed richest (0) to purest (last). */
export interface WavetableTierStack {
  /** The shape the stack answers. */
  shape: WavetableShape;
  /** One table per tier of WAVETABLE_TIERS. */
  tiers: readonly Float32Array[];
}

/** The built stacks, one per shape, memoized at first read (the engine's
 * own tables — deterministic, the same bytes every boot). */
const tierStacks = new Map<WavetableShape, WavetableTierStack>();

/**
 * Answers the tier stack of one shape — the memoized mip ladder the
 * oscillator reads (built once, WAVETABLE_TIERS tables, the same math
 * every call).
 *
 * @param shape the wave shape.
 * @returns the stack (shape + tiers, richest first).
 */
export function wavetableStack(shape: WavetableShape): WavetableTierStack {
  const memo = tierStacks.get(shape);
  if (memo !== undefined) return memo;
  const stack: WavetableTierStack = {
    shape,
    tiers: WAVETABLE_TIERS.map((ceiling) => buildWavetable(shape, ceiling)),
  };
  tierStacks.set(shape, stack);
  return stack;
}

/**
 * Answers the tier index a note reads — the richest tier whose harmonic
 * ceiling stays inside nyquist (the anti-aliasing law: a note at hz with
 * ceiling H stays honest while hz·H ≤ sr/2).
 *
 * @param stack the shape's tier stack.
 * @param hz the note frequency.
 * @param sampleRate the render rate.
 * @returns the tier index (0 = richest; the last tier when the note sits
 *   above every ceiling).
 */
export function tierIndexOf(stack: WavetableTierStack, hz: number, sampleRate: number): number {
  const nyquist = sampleRate / 2;
  for (let index = 0; index < WAVETABLE_TIERS.length; index++) {
    if (stack.tiers[index] === undefined) break;
    if (hz * WAVETABLE_TIERS[index] <= nyquist) return index;
  }
  return stack.tiers.length - 1;
}

/** The sawtooth voice of the webaudio oscillator law (phase in [0,1)) —
 * the naive band-unlimited shape the browser node pins; the render
 * lane's recipes read it verbatim (byte parity), the wavetable seat
 * above answers the band-limited law for the synthesis voices. */
export function sawOf(phase: number): number {
  return 2 * phase - 1;
}

/** The square voice of the webaudio oscillator law (phase in [0,1)). */
export function squareOf(phase: number): number {
  return phase < 0.5 ? 1 : -1;
}

/** The triangle voice of the webaudio oscillator law (phase in [0,1)). */
export function triangleOf(phase: number): number {
  return (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * phase));
}

/** Reads one wavetable at a fractional position — the linear
 * interpolation the seat pins (the wrap-around law of the one-cycle
 * table). */
function readTable(table: Float32Array, position: number): number {
  const size = table.length;
  const wrapped = ((position % size) + size) % size;
  const index = Math.floor(wrapped);
  const fraction = wrapped - index;
  const next = (index + 1) % size;
  return table[index] * (1 - fraction) + table[next] * fraction;
}

/** The oscillator options — the two shapes the morph seat blends, the
 * detune and the drift law. */
export interface WavetableOscillatorOptions {
  /** The first shape of the morph (morph 0 answers it alone). */
  shapeA: WavetableShape;
  /** The second shape of the morph (morph 1 answers it alone). */
  shapeB?: WavetableShape;
  /** The morph seat, 0..1 (0 = shapeA, 1 = shapeB). */
  morph?: number;
  /** The detune in cents (-1200..1200, 0 = pure). */
  detuneCents?: number;
  /** The drift depth in cents (the vibrato law, 0 = still). */
  driftCents?: number;
  /** The drift rate in hz (the vibrato speed). */
  driftHz?: number;
  /** The output amplitude (0..1). */
  amplitude?: number;
  /** The sample rate the oscillator renders at. */
  sampleRate: number;
}

/**
 * The wavetable oscillator — the phase accumulator over the tier stacks
 * of the two morph shapes, the tier chosen per note by the nyquist law,
 * the detune and the drift folded into the phase increment, the read
 * linear-interpolated. One instance renders one voice stream; the same
 * construction answers the same samples (deterministic, zero rng).
 */
export class WavetableOscillator {
  private readonly options: Required<Pick<WavetableOscillatorOptions, "shapeA" | "morph" | "detuneCents" | "driftCents" | "driftHz" | "amplitude" | "sampleRate">> & {
    shapeB: WavetableShape;
  };
  private readonly stackA: WavetableTierStack;
  private readonly stackB: WavetableTierStack;
  private phase = 0;
  private driftPhase = 0;
  private hz = 440;

  constructor(options: WavetableOscillatorOptions) {
    this.options = {
      shapeA: options.shapeA,
      shapeB: options.shapeB ?? options.shapeA,
      morph: clamp(options.morph ?? 0, 0, 1),
      detuneCents: clamp(options.detuneCents ?? 0, -1200, 1200),
      driftCents: Math.max(0, options.driftCents ?? 0),
      driftHz: Math.max(0, options.driftHz ?? 0),
      amplitude: clamp(options.amplitude ?? 1, 0, 1),
      sampleRate: options.sampleRate,
    };
    this.stackA = wavetableStack(this.options.shapeA);
    this.stackB = wavetableStack(this.options.shapeB);
  }

  /** Sets the note the oscillator sings (the tier re-seats by the
   * nyquist law on every call). */
  note(hz: number): void {
    this.hz = Math.max(0.01, hz);
  }

  /** Answers the current note (hz). */
  noteHz(): number {
    return this.hz;
  }

  /** Answers one sample — the morphed, detuned, drifted read. */
  next(): number {
    const { sampleRate, morph, detuneCents, driftCents, driftHz, amplitude } = this.options;
    const drift =
      driftCents > 0 && driftHz > 0 ? driftCents * Math.sin(2 * Math.PI * this.driftPhase) : 0;
    const cents = detuneCents + drift;
    const effectiveHz = this.hz * 2 ** (cents / 1200);
    const tierA = tierIndexOf(this.stackA, effectiveHz, sampleRate);
    const tierB = tierIndexOf(this.stackB, effectiveHz, sampleRate);
    const position = this.phase * WAVETABLE_SIZE;
    const sampleA = readTable(this.stackA.tiers[tierA] ?? this.stackA.tiers[this.stackA.tiers.length - 1], position);
    const sampleB = readTable(this.stackB.tiers[tierB] ?? this.stackB.tiers[this.stackB.tiers.length - 1], position);
    const sample = sampleA * (1 - morph) + sampleB * morph;
    this.phase = (this.phase + effectiveHz / sampleRate) % 1;
    if (driftHz > 0) this.driftPhase = (this.driftPhase + driftHz / sampleRate) % 1;
    return sample * amplitude;
  }

  /** Renders a span of samples — the same stream next() answers. */
  render(count: number): Float32Array {
    const out = new Float32Array(Math.max(0, Math.floor(count)));
    for (let index = 0; index < out.length; index++) out[index] = this.next();
    return out;
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: the adsr seat — the gate law. */
/* ════════════════════════════════════════════════════════════════════ */

/** The adsr law of a voice — the attack to peak, the decay to the
 * sustain level, the hold and the release to silence. */
export interface AdsrSpec {
  /** The attack span in seconds (> 0; 0 answers the instant law — one
   * sample ramp). */
  attackSeconds: number;
  /** The decay span in seconds (>= 0). */
  decaySeconds: number;
  /** The sustain level, 0..1 (the level the hold answers). */
  sustainLevel: number;
  /** The release span in seconds (> 0). */
  releaseSeconds: number;
}

/** The house adsr of the melodic seats (fast attack, musical decay). */
export const ADSR_MELODIC: AdsrSpec = {
  attackSeconds: 0.01,
  decaySeconds: 0.08,
  sustainLevel: 0.65,
  releaseSeconds: 0.12,
} as const;

/** The house adsr of the percussive seats (the pluck law — long decay). */
export const ADSR_PERCUSSIVE: AdsrSpec = {
  attackSeconds: 0.002,
  decaySeconds: 0.22,
  sustainLevel: 0,
  releaseSeconds: 0.05,
} as const;

/** The time constant law of the curved segments: each segment answers
 * its span divided by this — the exponential reaches ~95 percent inside
 * the span (1 - e^{-3} ≈ 0.9502). */
export const ADSR_SEGMENT_TCS = 3;

/**
 * The closed-form adsr level at one instant — the law the streaming seat
 * walks per sample: the attack ramps linearly to 1 (the webaudio
 * linearRamp law), the decay and the release ride the set-target curve
 * toward their targets, the hold answers the sustain level.
 *
 * @param spec the adsr law.
 * @param tSeconds the seconds since the gate opened.
 * @param held whether the gate is still held (false = the release walk
 *   from the level the gate closed at — pass the close level through
 *   releaseFrom).
 * @param releaseFrom the level the release walks from (the held level at
 *   the close; defaults to the sustain law).
 * @returns the level, 0..1.
 */
export function adsrLevelAt(spec: AdsrSpec, tSeconds: number, held: boolean, releaseFrom?: number): number {
  if (!held) {
    const from = releaseFrom ?? spec.sustainLevel;
    return Math.max(0, targetOf(0, from, tSeconds, spec.releaseSeconds / ADSR_SEGMENT_TCS));
  }
  const attack = Math.max(1e-6, spec.attackSeconds);
  if (tSeconds <= attack) return clamp(tSeconds / attack, 0, 1);
  const decayT = tSeconds - attack;
  if (spec.decaySeconds <= 0) return spec.sustainLevel;
  if (decayT >= spec.decaySeconds * 2) return spec.sustainLevel;
  return Math.max(spec.sustainLevel, targetOf(spec.sustainLevel, 1, decayT, spec.decaySeconds / ADSR_SEGMENT_TCS));
}

/** The streaming adsr states. */
type AdsrState = "idle" | "attack" | "decay" | "sustain" | "release";

/**
 * The streaming adsr envelope — the per-sample state machine the voices
 * ride: gate() opens (from zero — the classic simple law, a retrigger
 * restarts the attack), release() closes from the current level (the
 * honest law: whatever level the voice sits at, the release walks it
 * home), step() answers the level. Deterministic, allocation-free.
 */
export class AdsrEnvelope {
  private readonly spec: AdsrSpec;
  private readonly sampleRate: number;
  private state: AdsrState = "idle";
  private level = 0;
  private elapsed = 0;

  constructor(spec: AdsrSpec, sampleRate: number) {
    this.spec = spec;
    this.sampleRate = sampleRate;
  }

  /** Opens the gate (the attack walks from zero — the retrigger law). */
  gate(): void {
    this.state = "attack";
    this.level = 0;
    this.elapsed = 0;
  }

  /** Closes the gate (the release walks from the current level). */
  release(): void {
    if (this.state === "idle") return;
    this.state = "release";
    this.elapsed = 0;
  }

  /** The current state of the machine. */
  stateOf(): AdsrState {
    return this.state;
  }

  /** The current level (0..1, the last step's answer). */
  levelOf(): number {
    return this.level;
  }

  /** Advances one sample and answers the level. */
  step(): number {
    const dt = 1 / this.sampleRate;
    this.elapsed += dt;
    const attack = Math.max(1e-6, this.spec.attackSeconds);
    if (this.state === "attack") {
      this.level = clamp(this.elapsed / attack, 0, 1);
      if (this.elapsed >= attack) {
        this.state = this.spec.decaySeconds > 0 ? "decay" : "sustain";
        this.elapsed = 0;
      }
    } else if (this.state === "decay") {
      this.level = Math.max(
        this.spec.sustainLevel,
        targetOf(this.spec.sustainLevel, this.level, dt, this.spec.decaySeconds / ADSR_SEGMENT_TCS),
      );
      if (this.elapsed >= this.spec.decaySeconds * 2 || Math.abs(this.level - this.spec.sustainLevel) < 1e-4) {
        this.state = "sustain";
      }
    } else if (this.state === "sustain") {
      this.level = this.spec.sustainLevel;
    } else if (this.state === "release") {
      this.level = Math.max(0, targetOf(0, this.level, dt, Math.max(1e-6, this.spec.releaseSeconds) / ADSR_SEGMENT_TCS));
      if (this.level < 1e-4) {
        this.level = 0;
        this.state = "idle";
      }
    }
    return this.level;
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 6: the eq chain seat — the parametric cascade. */
/* ════════════════════════════════════════════════════════════════════ */

/** The band families the eq chain accepts. */
export type EqBandFamily = "peaking" | "lowshelf" | "highshelf" | "lowpass" | "highpass" | "notch";

/** One parametric band of the eq chain. */
export interface EqBandSpec {
  /** The band family. */
  type: EqBandFamily;
  /** The center (or corner) frequency in hz. */
  hz: number;
  /** The resonance (the peaking width seat; 1 answers the broad law). */
  q: number;
  /** The boost/cut in db (the peaking and shelf seats read it; 0 on the
   * pass and notch seats). */
  gainDb: number;
}

/** The eq chain spec — the ordered band cascade. */
export interface EqChainSpec {
  /** The bands, applied in order. */
  bands: readonly EqBandSpec[];
}

/** One running eq chain — the primed biquad cascade. */
export interface EqChain {
  /** The bands the chain runs (the primed states, in order). */
  filters: readonly BiquadFilter[];
}

/** The reference eq of the historical v2 desk (the outros.debonair v2
 * DEFAULT_EQ — nine bands, the honest flat law: every seat answers 0 db
 * until the desk moves it). */
export const REFERENCE_EQ_BANDS: readonly EqBandSpec[] = [
  { type: "peaking", hz: 115, q: 1, gainDb: 0 },
  { type: "peaking", hz: 250, q: 1, gainDb: 0 },
  { type: "peaking", hz: 450, q: 1, gainDb: 0 },
  { type: "peaking", hz: 630, q: 1, gainDb: 0 },
  { type: "peaking", hz: 1250, q: 1, gainDb: 0 },
  { type: "peaking", hz: 2700, q: 1, gainDb: 0 },
  { type: "peaking", hz: 5300, q: 1, gainDb: 0 },
  { type: "peaking", hz: 7500, q: 1, gainDb: 0 },
  { type: "peaking", hz: 12870, q: 1, gainDb: 0 },
] as const;

/**
 * Builds the running eq chain — one primed biquad per band (the gain
 * seat folds through the biquad law, the pass and notch bands ignore
 * it).
 *
 * @param spec the chain spec.
 * @param sampleRate the render rate.
 * @returns the primed chain.
 */
export function buildEqChain(spec: EqChainSpec, sampleRate: number): EqChain {
  return {
    filters: spec.bands.map((band) =>
      biquadOf(band.type, Math.max(1, band.hz), Math.max(0.1, band.q), sampleRate, band.gainDb),
    ),
  };
}

/** Steps the chain over one input sample (the cascade order = the band
 * order). */
export function runEqChain(chain: EqChain, x: number): number {
  let sample = x;
  for (const filter of chain.filters) sample = runBiquad(filter, sample);
  return sample;
}

/**
 * The summed magnitude response of the chain at one frequency — the
 * cascade law: the db gains of the bands add (the log-domain walk of the
 * chained transfer functions).
 *
 * @param spec the chain spec.
 * @param hz the probe frequency.
 * @param sampleRate the render rate.
 * @returns the magnitude in db (0 db = unity).
 */
export function eqResponseDb(spec: EqChainSpec, hz: number, sampleRate: number): number {
  let total = 0;
  for (const band of spec.bands) {
    const filter = biquadOf(band.type, Math.max(1, band.hz), Math.max(0.1, band.q), sampleRate, band.gainDb);
    total += biquadMagnitudeDb(filter, hz, sampleRate);
  }
  return total;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 7: the delay seat — the echo lines. */
/* ════════════════════════════════════════════════════════════════════ */

/**
 * The fractional delay line — the circular buffer with the linear-
 * interpolated read (a delay of 1.5 samples answers the halfway blend;
 * the write seat always lands one sample ahead of the longest read).
 */
export class DelayLine {
  private readonly buffer: Float32Array;
  private writeIndex = 0;

  constructor(maxDelaySeconds: number, sampleRate: number) {
    const length = Math.max(2, Math.ceil(maxDelaySeconds * sampleRate) + 2);
    this.buffer = new Float32Array(length);
  }

  /** Writes one sample at the write seat. */
  write(x: number): void {
    this.buffer[this.writeIndex] = x;
    this.writeIndex = (this.writeIndex + 1) % this.buffer.length;
  }

  /** Reads the sample delaySeconds ago — the fractional read blends the
   * two neighbours (the linear law). */
  read(delaySeconds: number, sampleRate: number): number {
    const delaySamples = Math.max(0, delaySeconds * sampleRate);
    const size = this.buffer.length;
    const readPosition = this.writeIndex - 1 - delaySamples;
    const wrapped = ((readPosition % size) + size) % size;
    const index = Math.floor(wrapped);
    const fraction = wrapped - index;
    const next = (index + 1) % size;
    return this.buffer[index] * (1 - fraction) + this.buffer[next] * fraction;
  }
}

/** The feedback delay law — the echo send of the rack. */
export interface FeedbackDelaySpec {
  /** The echo time in seconds. */
  delaySeconds: number;
  /** The feedback, 0..<1 (the echo repeat law; 1 answers the infinite
   * loop — clamped away). */
  feedback: number;
  /** The damping cutoff of the loop filter (each repeat darkens — the
   * tape law). */
  dampingHz: number;
  /** The wet mix, 0..1 (the dry rides at 1 - wet). */
  wetMix: number;
}

/**
 * The damped feedback delay — the classic echo: the input writes into
 * the line, the delayed tap runs through the one-pole damper and feeds
 * back (the repeat law), the output blends the dry input with the damped
 * tap. Deterministic, streaming, one instance one channel.
 */
export class FeedbackDelay {
  private readonly spec: FeedbackDelaySpec;
  private readonly sampleRate: number;
  private readonly line: DelayLine;
  private readonly damper: OnePoleFilter;

  constructor(spec: FeedbackDelaySpec, sampleRate: number) {
    this.spec = spec;
    this.sampleRate = sampleRate;
    this.line = new DelayLine(spec.delaySeconds, sampleRate);
    this.damper = onePoleOf(spec.dampingHz, sampleRate);
  }

  /** Processes one sample — the echo law (the tap lands exactly at the
   * spec's delay seat: the read walks one sample under the delay because
   * it happens before the write, the classic line law). */
  process(x: number): number {
    const delaySeconds = Math.max(0, this.spec.delaySeconds - 1 / this.sampleRate);
    const tap = this.line.read(delaySeconds, this.sampleRate);
    const damped = runOnePole(this.damper, tap);
    this.line.write(x + damped * Math.min(0.999, Math.max(0, this.spec.feedback)));
    const wet = Math.min(1, Math.max(0, this.spec.wetMix));
    return x * (1 - wet) + damped * wet;
  }
}

/** The ping-pong law — the stereo echo that alternates the channels. */
export class PingPongDelay {
  private readonly spec: FeedbackDelaySpec;
  private readonly sampleRate: number;
  private readonly left: DelayLine;
  private readonly right: DelayLine;
  private readonly damper: OnePoleFilter;

  constructor(spec: FeedbackDelaySpec, sampleRate: number) {
    this.spec = spec;
    this.sampleRate = sampleRate;
    this.left = new DelayLine(spec.delaySeconds, sampleRate);
    this.right = new DelayLine(spec.delaySeconds, sampleRate);
    this.damper = onePoleOf(spec.dampingHz, sampleRate);
  }

  /**
   * Processes one stereo pair — the input lands on the left line, the
   * left tap feeds the right line (the bounce), the right tap feeds back
   * the left (the loop). Answers the wet stereo pair (the classic law:
   * a mono input, the echo alternating the channels).
   */
  process(leftIn: number, rightIn: number): [number, number] {
    const feedback = Math.min(0.999, Math.max(0, this.spec.feedback));
    const delaySeconds = Math.max(0, this.spec.delaySeconds - 1 / this.sampleRate);
    const leftTap = this.left.read(delaySeconds, this.sampleRate);
    const rightTap = this.right.read(delaySeconds, this.sampleRate);
    const dampedLeft = runOnePole(this.damper, leftTap);
    this.left.write(leftIn + rightTap * feedback);
    this.right.write(dampedLeft * feedback);
    const wet = Math.min(1, Math.max(0, this.spec.wetMix));
    return [leftIn * (1 - wet) + dampedLeft * wet, rightIn * (1 - wet) + rightTap * wet];
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 8: the reverb seat — the freeverb law. */
/* ════════════════════════════════════════════════════════════════════ */

/** The comb tunings of the freeverb law — eight parallel combs per
 * channel, the delays in samples at the 44.1 khz canon (scaled by the
 * render rate at build). */
export const FREEVERB_COMB_TUNINGS: readonly number[] = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];

/** The allpass tunings of the freeverb law — four series allpasses per
 * channel (the diffusion stage). */
export const FREEVERB_ALLPASS_TUNINGS: readonly number[] = [556, 441, 341, 225];

/** The stereo spread of the freeverb law — the right channel's delays
 * sit this many samples past the left (the width seat). */
export const FREEVERB_STEREO_SPREAD = 23;

/** The allpass feedback of the freeverb law (the diffusion constant). */
export const FREEVERB_ALLPASS_FEEDBACK = 0.5;

/** The reverb law of the rack. */
export interface ReverbSpec {
  /** The room size, 0..1 (the comb feedback law: 0.7 + 0.28·size). */
  roomSize: number;
  /** The damping, 0..1 (the loop filter cutoff law: 0.2 + 0.4·damp in
   * the one-pole coefficient walk). */
  damping: number;
  /** The wet mix, 0..1 (the dry rides at 1 - wet). */
  wetMix: number;
  /** The output width, 0..1 (the stereo spread blend — 0 answers the
   * mono plate, 1 the full spread law). */
  width: number;
}

/** The house plate of the rack — the classic room. */
export const REVERB_ROOM: ReverbSpec = {
  roomSize: 0.72,
  damping: 0.35,
  wetMix: 0.3,
  width: 1,
} as const;

/** One running comb of the freeverb law — the delay line with the damped
 * feedback loop. */
class FreeverbComb {
  private readonly line: Float32Array;
  private index = 0;
  private filterStore = 0;

  constructor(size: number, private readonly feedback: number, private readonly damp: number) {
    this.line = new Float32Array(Math.max(2, size));
  }

  process(x: number): number {
    const output = this.line[this.index] ?? 0;
    this.filterStore = output * (1 - this.damp) + this.filterStore * this.damp;
    this.line[this.index] = x + this.filterStore * this.feedback;
    this.index = (this.index + 1) % this.line.length;
    return output;
  }
}

/** One running allpass of the freeverb law — the diffuser. */
class FreeverbAllpass {
  private readonly line: Float32Array;
  private index = 0;

  constructor(
    size: number,
    private readonly feedback: number,
  ) {
    this.line = new Float32Array(Math.max(2, size));
  }

  process(x: number): number {
    const buffered = this.line[this.index] ?? 0;
    const output = -x + buffered;
    this.line[this.index] = x + buffered * this.feedback;
    this.index = (this.index + 1) % this.line.length;
    return output;
  }
}

/** One channel of the plate — the eight combs summed and diffused. */
class ReverbChannel {
  private readonly combs: FreeverbComb[];
  private readonly allpasses: FreeverbAllpass[];

  constructor(sampleRate: number, roomSize: number, damping: number, offset: number) {
    const scale = sampleRate / 44100;
    this.combs = FREEVERB_COMB_TUNINGS.map(
      (tuning) => new FreeverbComb(Math.round(tuning * scale) + offset, 0.7 + 0.28 * roomSize, 0.2 + 0.4 * damping),
    );
    this.allpasses = FREEVERB_ALLPASS_TUNINGS.map(
      (tuning) => new FreeverbAllpass(Math.round(tuning * scale) + offset, FREEVERB_ALLPASS_FEEDBACK),
    );
  }

  process(x: number): number {
    let sample = 0;
    for (const comb of this.combs) sample += comb.process(x);
    for (const allpass of this.allpasses) sample = allpass.process(sample);
    return sample;
  }
}

/**
 * The freeverb plate — eight parallel damped combs and four series
 * allpasses per channel, the stereo spread law (the right channel sits
 * FREEVERB_STEREO_SPREAD samples past the left), the room size and
 * damping seats of the spec. The wet answer of the classic law (the
 * input passes dry, the plate adds the wet tail).
 */
export class ReverbSeat {
  private readonly spec: ReverbSpec;
  private readonly left: ReverbChannel;
  private readonly right: ReverbChannel;

  constructor(spec: ReverbSpec, sampleRate: number) {
    this.spec = spec;
    const spread = Math.max(0, Math.min(1, spec.width)) * FREEVERB_STEREO_SPREAD;
    this.left = new ReverbChannel(sampleRate, spec.roomSize, spec.damping, 0);
    this.right = new ReverbChannel(sampleRate, spec.roomSize, spec.damping, Math.round(spread));
  }

  /**
   * Processes one stereo pair — the dry passthrough beside the wet
   * plate (the wet mix law; the width 0 seat answers the mono plate —
   * both channels read the left channel's tail).
   */
  process(leftIn: number, rightIn: number): [number, number] {
    const monoWidth = this.spec.width <= 0;
    const wetLeft = this.left.process(leftIn);
    const wetRight = monoWidth ? wetLeft : this.right.process(rightIn);
    const wet = Math.min(1, Math.max(0, this.spec.wetMix));
    const dry = 1 - wet;
    // the classic freeverb wet gain law: the plate sits under the dry
    const wetGain = wet * 0.35;
    return [leftIn * dry + wetLeft * wetGain, rightIn * dry + wetRight * wetGain];
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 9: the drive seat — the soft-clip law. */
/* ════════════════════════════════════════════════════════════════════ */

/** The drive amount band (the tanh law's k — the reference engine's
 * master saturation pinned 3.2 at the desk, 6 at the curve builder). */
export const DRIVE_AMOUNT_BAND: readonly [number, number] = [1, 12];

/**
 * The soft-clip drive — the tanh waveshaper law of the reference
 * engine's master bus: y = tanh(k·x)/tanh(k) pinned at the ±1 ceiling,
 * symmetric, bounded by construction (the analog saturation law, the
 * honest ceiling a limiter never has to chase — the raw ratio tops at
 * 1/tanh(k) past the knee, the clamp seats the ceiling itself).
 *
 * @param x the input sample.
 * @param amount the drive amount (k).
 * @returns the shaped sample, -1..1.
 */
export function driveSample(x: number, amount: number): number {
  const k = Math.min(DRIVE_AMOUNT_BAND[1], Math.max(DRIVE_AMOUNT_BAND[0], amount));
  return Math.max(-1, Math.min(1, Math.tanh(k * x) / Math.tanh(k)));
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 10: the effects rack seat — the slot chain. */
/* ════════════════════════════════════════════════════════════════════ */

/** One slot of the rack — exactly one law. */
export type RackSlot =
  | { kind: "gain"; gainDb: number }
  | { kind: "eq"; bands: readonly EqBandSpec[] }
  | { kind: "drive"; amount: number }
  | { kind: "delay"; spec: FeedbackDelaySpec }
  | { kind: "reverb"; spec: ReverbSpec };

/** The rack spec — the ordered slots (the chain walks them in order). */
export interface EffectsRackSpec {
  /** The slots, in chain order. */
  slots: readonly RackSlot[];
}

/** The house rack of the lead voice — the reference console's send law. */
export const RACK_LEAD: EffectsRackSpec = {
  slots: [
    { kind: "eq", bands: [{ type: "peaking", hz: 2700, q: 0.9, gainDb: 1.5 }] },
    { kind: "delay", spec: { delaySeconds: 0.27, feedback: 0.34, dampingHz: 2800, wetMix: 0.22 } },
    { kind: "reverb", spec: { ...REVERB_ROOM, wetMix: 0.18 } },
  ],
} as const;

/**
 * The effects rack — the ordered slot chain any lane renders through:
 * the gain seats fold the fader math (db → linear), the eq seats run
 * their primed cascades, the drive seat shapes, the delay and reverb
 * seats run their lines — one process call walks the whole chain, the
 * state streaming in the slots. Deterministic: the same spec and the
 * same input answer the same bytes.
 */
export class EffectsRack {
  private readonly sampleRate: number;
  private readonly slots: readonly RackSlot[];
  private readonly eqChains: Map<number, EqChain> = new Map();
  private readonly delays: Map<number, FeedbackDelay> = new Map();
  private readonly reverbs: Map<number, ReverbSeat> = new Map();

  constructor(spec: EffectsRackSpec, sampleRate: number) {
    this.sampleRate = sampleRate;
    this.slots = spec.slots;
    this.slots.forEach((slot, index) => {
      if (slot.kind === "eq") this.eqChains.set(index, buildEqChain({ bands: slot.bands }, sampleRate));
      if (slot.kind === "delay") this.delays.set(index, new FeedbackDelay(slot.spec, sampleRate));
      if (slot.kind === "reverb") this.reverbs.set(index, new ReverbSeat(slot.spec, sampleRate));
    });
  }

  /** Processes one mono sample through the chain. */
  process(x: number): number {
    let sample = x;
    this.slots.forEach((slot, index) => {
      if (slot.kind === "gain") {
        sample *= dbToLinear(slot.gainDb);
      } else if (slot.kind === "eq") {
        const chain = this.eqChains.get(index);
        if (chain !== undefined) sample = runEqChain(chain, sample);
      } else if (slot.kind === "drive") {
        sample = driveSample(sample, slot.amount);
      } else if (slot.kind === "delay") {
        const delay = this.delays.get(index);
        if (delay !== undefined) sample = delay.process(sample);
      } else {
        const reverb = this.reverbs.get(index);
        if (reverb !== undefined) sample = reverb.process(sample, sample)[0];
      }
    });
    return sample;
  }

  /** Renders a whole buffer through the chain (the same stream process
   * answers, one allocation). */
  render(input: Float32Array): Float32Array {
    const out = new Float32Array(input.length);
    for (let index = 0; index < input.length; index++) out[index] = this.process(input[index] ?? 0);
    return out;
  }
}

/**
 * Renders a buffer through a rack — the one-shot door of the rack seat
 * (build, walk, answer; the streaming class stays for the lanes that
 * hold the chain).
 *
 * @param input the mono buffer.
 * @param spec the rack spec.
 * @param sampleRate the render rate.
 * @returns the rendered buffer, the same length.
 */
export function renderRack(input: Float32Array, spec: EffectsRackSpec, sampleRate: number): Float32Array {
  return new EffectsRack(spec, sampleRate).render(input);
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 11: the sampler seat — the sample voice. */
/* ════════════════════════════════════════════════════════════════════ */

/** The sampler law — one float32 take beside its playing seats. */
export interface SamplerSpec {
  /** The sample the voice plays (mono, -1..1). */
  sample: Float32Array;
  /** The root note of the sample in hz (a note at rootHz answers the
   * take at its own rate — the ratio law). */
  rootHz: number;
  /** The loop start in seconds (absent answers 0). */
  loopStartSeconds?: number;
  /** The loop end in seconds (absent answers the take's end). */
  loopEndSeconds?: number;
  /** Whether the voice loops between the loop points (false = one-shot:
   * past the end the voice answers silence). */
  loop: boolean;
  /** The gate law the voice rides. */
  adsr: AdsrSpec;
}

/** The answer of one sampler note render. */
export interface SamplerNoteResult {
  /** The rendered voice (the gate span + the release tail). */
  pcm: Float32Array;
  /** The sample rate of the render. */
  sampleRate: number;
  /** The seconds of the render. */
  seconds: number;
}

/**
 * Renders one sampler note — the pitch ratio law (the read index
 * advances at hz/rootHz; a note an octave up answers the take at twice
 * the speed), the loop wrap between the loop points (the one-shot law
 * answers silence past the end), the adsr gate (the attack through the
 * sustain, the release after the gate span) and the velocity law, the
 * optional rack folding the finished voice. Real sampler math: the read
 * is linear-interpolated, the gate is the streaming adsr seat, the
 * amplitude never exceeds the velocity.
 *
 * @param spec the sampler law.
 * @param hz the note the voice sings.
 * @param gateSeconds the gate span (the note's hold).
 * @param velocity the note velocity, 0..1.
 * @param sampleRate the render rate.
 * @param rack the optional rack the voice renders through.
 * @returns the rendered voice beside its facts.
 */
export function renderSamplerNote(
  spec: SamplerSpec,
  hz: number,
  gateSeconds: number,
  velocity: number,
  sampleRate: number,
  rack?: EffectsRackSpec,
): SamplerNoteResult {
  const take = spec.sample;
  const loopStart = Math.max(0, spec.loopStartSeconds ?? 0) * sampleRate;
  const loopEnd = Math.min(take.length, (spec.loopEndSeconds ?? take.length / sampleRate) * sampleRate);
  const ratio = Math.max(0.01, hz / Math.max(0.01, spec.rootHz));
  const gate = Math.max(0.01, gateSeconds);
  const seconds = gate + Math.max(0.01, spec.adsr.releaseSeconds) + 0.01;
  const count = Math.max(1, Math.ceil(seconds * sampleRate));
  const voice = new Float32Array(count);
  const envelope = new AdsrEnvelope(spec.adsr, sampleRate);
  envelope.gate();
  let readIndex = 0;
  const releaseAt = Math.round(gate * sampleRate);
  for (let index = 0; index < count; index++) {
    if (index >= releaseAt && envelope.stateOf() !== "release" && envelope.stateOf() !== "idle") {
      envelope.release();
    }
    let sample = 0;
    if (readIndex < take.length) {
      const floorIndex = Math.floor(readIndex);
      const fraction = readIndex - floorIndex;
      const nextIndex = Math.min(take.length - 1, floorIndex + 1);
      sample = (take[floorIndex] ?? 0) * (1 - fraction) + (take[nextIndex] ?? 0) * fraction;
    }
    voice[index] = sample * envelope.step() * Math.min(1, Math.max(0, velocity));
    readIndex += ratio;
    if (spec.loop && loopEnd > loopStart && readIndex >= loopEnd) {
      readIndex = loopStart + ((readIndex - loopStart) % Math.max(1, loopEnd - loopStart));
    }
  }
  const pcm = rack === undefined ? voice : renderRack(voice, rack, sampleRate);
  return { pcm, sampleRate, seconds: pcm.length / sampleRate };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 12: the sound ai seat — the markov model and the spectral
 * envelope pair. honest 2026 code: the model is learned from real
 * payload events (never a hardcoded table), the generation is a seeded
 * deterministic walk (never a fake label on static data). */
/* ════════════════════════════════════════════════════════════════════ */

/** The schema literal of the sound model document. */
export const SOUND_MODEL_SCHEMA_VERSION = "debonair.soundmodel/1" as const;

/** The mel band count of the spectral envelope (the seat the resynthesis
 * bank reads). */
export const SPECTRAL_ENVELOPE_BANDS = 16;

/** The velocity histogram bins (0..1 across eight buckets). */
export const VELOCITY_BUCKETS = 8;

/** The note duration histogram buckets — the step spans the walk
 * samples (the bucket centers). */
export const NOTE_DURATION_BUCKETS: readonly number[] = [0.5, 1, 2, 4, 8];

/** The learned model of the sound ai — the vector-one model state
 * (noteBigram, drumHistogram, scaleAffinity, bpmHistogram) ported onto
 * the payloads this engine owns and extended with the seats the
 * generation walk reads. every table is a count table learned from real
 * documents — zeros are legal and honest (an untrained seat generates
 * the honest fallback, never a fake style). */
export interface SoundModelState {
  /** The schema literal. */
  schema: typeof SOUND_MODEL_SCHEMA_VERSION;
  /** The model's own version. */
  version: number;
  /** The documents the model learned from. */
  trainedOn: number;
  /** The order-one markov table over note pitches: pitch → pitch →
   * count (the transition law the melodic walk reads). */
  noteTransitions: Record<string, Record<string, number>>;
  /** The global pitch counts (the fallback row when the walk reaches an
   * unseen pitch). */
  notePitchCounts: Record<string, number>;
  /** The counts of the first pitch of every phrase (the walk's start
   * seat). */
  noteStarts: Record<string, number>;
  /** The onset histogram across the sixteen steps of the bar (0..1
   * normalized — the busy steps the walk favors). */
  noteStepHistogram: number[];
  /** The duration histogram over NOTE_DURATION_BUCKETS (counts). */
  noteDurationHistogram: number[];
  /** The drum lane histograms — one sixteen-step count row per lane. */
  drumHistogram: Record<PatternDrumLaneKey, number[]>;
  /** The velocity histogram (VELOCITY_BUCKETS counts). */
  velocityHistogram: number[];
  /** The bpm histogram over the pattern miner's bucket edges (bucket →
   * count, keyed by the bucket's lower edge label). */
  bpmHistogram: Record<string, number>;
  /** The scale affinity — the scales of the learned projects (scale →
   * count). */
  scaleAffinity: Record<string, number>;
  /** The twelve pitch-class masses (the root seat — the timeline chroma
   * and the project roots both fold here). */
  rootMass: number[];
  /** The spectral envelope — SPECTRAL_ENVELOPE_BANDS mel band means,
   * 0..1 (the timbre seat; learned from the frames the caller hands,
   * zeros when the documents carry none). */
  spectralEnvelope: number[];
  /** The instant the model was trained (iso). */
  updatedAt: string;
}

/** A count record without a prototype — the honest record seat the
 * codeql battery recognizes (a null-prototype object can never pollute
 * Object.prototype, the house law the scripts consolidation already
 * answers): every dynamic count key the payload documents carry — pitch
 * labels, bucket edges, scale names, whatever a malicious string rides —
 * lands on an own property or nothing, the record stays sealed. */
function newcountrecord<T>(): Record<string, T> {
  return Object.create(null);
}

/** The empty model — the honest zero state every table starts from. */
export function emptySoundModel(at = new Date().toISOString()): SoundModelState {
  return {
    schema: SOUND_MODEL_SCHEMA_VERSION,
    version: 1,
    trainedOn: 0,
    noteTransitions: newcountrecord<Record<string, number>>(),
    notePitchCounts: newcountrecord<number>(),
    noteStarts: newcountrecord<number>(),
    noteStepHistogram: new Array<number>(LANE_STEPS).fill(0),
    noteDurationHistogram: new Array<number>(NOTE_DURATION_BUCKETS.length).fill(0),
    drumHistogram: {
      kick: new Array<number>(LANE_STEPS).fill(0),
      snare: new Array<number>(LANE_STEPS).fill(0),
      hat: new Array<number>(LANE_STEPS).fill(0),
      clap: new Array<number>(LANE_STEPS).fill(0),
    },
    velocityHistogram: new Array<number>(VELOCITY_BUCKETS).fill(0),
    bpmHistogram: newcountrecord<number>(),
    scaleAffinity: newcountrecord<number>(),
    rootMass: new Array<number>(12).fill(0),
    spectralEnvelope: new Array<number>(SPECTRAL_ENVELOPE_BANDS).fill(0),
    updatedAt: at,
  };
}

/** The bucket of one bpm under the pattern miner's edges. */
function bpmBucketOf(bpm: number): string {
  for (let index = 0; index < BPM_BUCKET_EDGES.length - 1; index++) {
    if (bpm < (BPM_BUCKET_EDGES[index + 1] ?? Infinity)) return String(BPM_BUCKET_EDGES[index]);
  }
  return String(BPM_BUCKET_EDGES[BPM_BUCKET_EDGES.length - 1] ?? 240);
}

/** The duration bucket of one note span (steps). */
function durationBucketOf(dur: number): number {
  let best = 0;
  let bestDistance = Infinity;
  NOTE_DURATION_BUCKETS.forEach((center, index) => {
    const distance = Math.abs(center - dur);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

/** The velocity bucket of one velocity (0..1). */
function velocityBucketOf(velocity: number): number {
  return Math.min(VELOCITY_BUCKETS - 1, Math.max(0, Math.floor(velocity * VELOCITY_BUCKETS)));
}

/** The nearest bucket center of the velocity histogram. */
function velocityCenterOf(bucket: number): number {
  return (bucket + 0.5) / VELOCITY_BUCKETS;
}

/** Adds one count to a count record — the prototype seats never carry a
 * count (the defensive guard the codeql battery asked for: the pitch
 * strings are numeric in practice, the guard keeps the record honest
 * whatever a payload carries; the assignment rides the negative
 * conjunction the codeql sanitizer recognizes — the early-return shape
 * the earlier securityheal seated never satisfied the battery, the
 * wrapped assignment does). */
function bump(record: Record<string, number>, key: string, count = 1): void {
  if (key !== "__proto__" && key !== "constructor" && key !== "prototype") {
    record[key] = (record[key] ?? 0) + count;
  }
}

/**
 * Trains the sound model from payload documents — the markov seat over
 * real events: the timeline documents fold their note events (the
 * pitch-to-pitch transitions in time order, the velocities, the chroma
 * masses, the bpm bucket), the project documents fold their notes (the
 * transitions, the step onsets, the durations, the velocities), their
 * drum lanes (the step histograms), their scales and roots beside the
 * bpm bucket. every number is a learned count — the model never invents
 * a seat the documents do not carry (an untrained scale affinity answers
 * the honest fallback at generation).
 *
 * @param docs the payload documents (either schema, any mix).
 * @param at the training instant (iso; defaults to now).
 * @returns the trained model.
 */
export function trainSoundModel(docs: readonly PatternDocument[], at = new Date().toISOString()): SoundModelState {
  const model = emptySoundModel(at);
  model.trainedOn = docs.length;
  for (const doc of docs) {
    bump(model.bpmHistogram, bpmBucketOf(doc.bpm));
    if (doc.schema === TIMELINE_SCHEMA_VERSION) {
      // the dissected reference: the events in (second, onset) order
      const events = doc.frames
        .flatMap((frame) => frame.events.map((event) => ({ s: frame.s, event })))
        .sort((left, right) => left.s - right.s || left.event.onset - right.event.onset);
      let previousPitch: number | null = null;
      let phraseOpen = true;
      for (const { event } of events) {
        if (event.kind !== "note") continue;
        const pitch = Math.round(event.pitch ?? 69);
        const key = String(pitch);
        bump(model.notePitchCounts, key);
        model.velocityHistogram[velocityBucketOf(event.velocity)] += 1;
        if (phraseOpen) {
          bump(model.noteStarts, key);
          phraseOpen = false;
        }
        if (previousPitch !== null) {
          const row = model.noteTransitions[String(previousPitch)] ?? newcountrecord<number>();
          bump(row, key);
          model.noteTransitions[String(previousPitch)] = row;
        }
        previousPitch = pitch;
      }
      // the chroma masses fold onto the root seat
      for (const frame of doc.frames) {
        frame.chroma.forEach((bin, index) => {
          model.rootMass[index % 12] = (model.rootMass[index % 12] ?? 0) + (Number.isFinite(bin) ? Math.max(0, bin) : 0);
        });
      }
      // the rms/centroid law: the honest timbre fold — the envelope
      // learns the centroid mass (the resynthesis bank reads it back)
      const meanCentroid = doc.frames.reduce((sum, frame) => sum + Math.max(0, frame.centroid), 0) / Math.max(1, doc.frames.length);
      const band = Math.min(
        SPECTRAL_ENVELOPE_BANDS - 1,
        Math.max(0, Math.round((Math.log2(Math.max(40, meanCentroid) / 40) / Math.log2(16000 / 40)) * SPECTRAL_ENVELOPE_BANDS)),
      );
      model.spectralEnvelope[band] += 1;
    } else {
      // the symbolic score: the notes in step order, the lanes, the scale
      const notes = [...doc.notes].sort((left, right) => left.step - right.step);
      let previousPitch: number | null = null;
      let phraseOpen = true;
      for (const note of notes) {
        const key = String(note.pitch);
        bump(model.notePitchCounts, key);
        model.velocityHistogram[velocityBucketOf(note.vel)] += 1;
        model.noteStepHistogram[note.step % LANE_STEPS] += 1;
        model.noteDurationHistogram[durationBucketOf(note.dur)] += 1;
        if (phraseOpen) {
          bump(model.noteStarts, key);
          phraseOpen = false;
        }
        if (previousPitch !== null) {
          const row = model.noteTransitions[String(previousPitch)] ?? newcountrecord<number>();
          bump(row, key);
          model.noteTransitions[String(previousPitch)] = row;
        }
        previousPitch = note.pitch;
      }
      for (const lane of DRUM_LANE_KEYS) {
        const steps = doc.drums[lane];
        if (steps === undefined) continue;
        for (let step = 0; step < LANE_STEPS; step++) {
          if ((steps[step] ?? 0) >= PATTERN_LIMITS.stepThreshold) {
            model.drumHistogram[lane][step] += 1;
          }
        }
      }
      bump(model.scaleAffinity, doc.scale);
      model.rootMass[doc.root % 12] += 1;
    }
  }
  return model;
}

/** The generation options of the sound ai walk. */
export interface GenerateFromSoundModelOptions {
  /** The bar count of the answer (1..128, default 4). */
  bars?: number;
  /** The mood label of the answer (default "generated"). */
  mood?: string;
  /** The prompt the answer carries (default ""). */
  prompt?: string;
}

/** The typed answer of the generation walk. */
export type GenerateFromSoundModelResult =
  | { ok: true; doc: PatternProject }
  | { ok: false; code: "empty-model" | "bad-walk"; message: string };

/** Samples one key from a count record — the cumulative law (the rng
 * walks the counts; an empty record answers undefined). */
function sampleKeyOf(record: Record<string, number>, roll: number): string | undefined {
  const keys = Object.keys(record);
  if (keys.length === 0) return undefined;
  const total = keys.reduce((sum, key) => sum + (record[key] ?? 0), 0);
  if (total <= 0) return keys[0];
  let cursor = roll * total;
  for (const key of keys) {
    cursor -= record[key] ?? 0;
    if (cursor <= 0) return key;
  }
  return keys[keys.length - 1];
}

/** Samples one index from a count array — the same cumulative law. */
function sampleIndexOf(counts: readonly number[], roll: number): number | undefined {
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (total <= 0) return undefined;
  let cursor = roll * total;
  for (let index = 0; index < counts.length; index++) {
    cursor -= counts[index] ?? 0;
    if (cursor <= 0) return index;
  }
  return counts.length - 1;
}

/**
 * Generates one pattern project from the learned model — the seeded
 * markov walk: the tempo samples the bpm histogram, the root and scale
 * answer the root mass and the scale affinity, the drum lanes sample
 * their step histograms (the busy steps keep their hits), the melodic
 * line walks the note transitions (an unseen pitch falls back to the
 * global pitch counts, an untrained model answers the honest
 * empty-model refusal — never a fake style), the velocities and the
 * durations sample their histograms, and the whole answer folds through
 * the one validator of record (the same clamps every payload walks).
 * Deterministic: the same model and seed answer the same document.
 *
 * @param model the learned model.
 * @param seedSource the identity the rng rides.
 * @param options the walk options.
 * @returns the validated debonair.pattern/1 document, or the machine
 *   code of the refusing walk.
 */
export function generateFromSoundModel(
  model: SoundModelState,
  seedSource: string,
  options: GenerateFromSoundModelOptions = {},
): GenerateFromSoundModelResult {
  const hasNotes = Object.keys(model.notePitchCounts).length > 0;
  const hasDrums = DRUM_LANE_KEYS.some((lane) => model.drumHistogram[lane].some((count) => count > 0));
  if (!hasNotes && !hasDrums) {
    return { ok: false, code: "empty-model", message: "the model carries no note events and no drum hits — nothing to generate" };
  }
  const rng = mulberry32(hashSeed(`soundmodel:${seedSource}`));
  const bars = Math.min(PATTERN_LIMITS.barsMax, Math.max(PATTERN_LIMITS.barsMin, Math.round(options.bars ?? 4)));
  // the tempo: the histogram mode, else the honest fallback
  const bpmBucket = sampleKeyOf(model.bpmHistogram, rng());
  const bpm = bpmBucket === undefined ? 120 : Math.min(PATTERN_LIMITS.bpmMax, Math.max(PATTERN_LIMITS.bpmMin, Number(bpmBucket) + 20));
  // the root: the mass argmax, else c
  const root = model.rootMass.reduce((best, mass, index) => (mass > (model.rootMass[best] ?? 0) ? index : best), 0);
  // the scale: the affinity argmax, else natural-minor
  const scaleEntry = Object.entries(model.scaleAffinity).sort((left, right) => right[1] - left[1])[0];
  const scale =
    scaleEntry !== undefined && (PATTERN_SCALE_NAMES as readonly string[]).includes(scaleEntry[0])
      ? (scaleEntry[0] as PatternProject["scale"])
      : "natural-minor";
  // the drum lanes: the per-step probability law (the busiest step of a
  // lane answers its full hit rate, the quieter steps their share)
  const drums: Record<PatternDrumLaneKey, number[]> = { kick: [], snare: [], hat: [], clap: [] };
  for (const lane of DRUM_LANE_KEYS) {
    const histogram = model.drumHistogram[lane];
    const peak = Math.max(...histogram);
    for (let step = 0; step < LANE_STEPS; step++) {
      const probability = peak > 0 ? (histogram[step] ?? 0) / peak : 0;
      drums[lane].push(rng() < probability ? 1 : 0);
    }
  }
  // the melodic walk: the onset law (the step histogram normalized),
  // the pitch law (the markov row, the global fallback), the velocity
  // and duration laws (their histograms)
  const onsetPeak = Math.max(...model.noteStepHistogram);
  const velocityTotal = model.velocityHistogram.reduce((sum, count) => sum + count, 0);
  const durationTotal = model.noteDurationHistogram.reduce((sum, count) => sum + count, 0);
  const notes: PatternProject["notes"] = [];
  if (hasNotes) {
    let lastPitch = Number(sampleKeyOf(model.noteStarts, rng()) ?? sampleKeyOf(model.notePitchCounts, rng()) ?? 69);
    if (!Number.isFinite(lastPitch)) lastPitch = 69;
    for (let step = 0; step < bars * LANE_STEPS; step++) {
      const onsetProbability = onsetPeak > 0 ? (model.noteStepHistogram[step % LANE_STEPS] ?? 0) / onsetPeak : 0.125;
      if (rng() >= onsetProbability) continue;
      const row = model.noteTransitions[String(lastPitch)];
      const nextKey = row !== undefined ? sampleKeyOf(row, rng()) : undefined;
      const fallbackKey = sampleKeyOf(model.notePitchCounts, rng());
      const pitch = Number(nextKey ?? fallbackKey ?? lastPitch);
      if (!Number.isFinite(pitch)) continue;
      const velocityBucket = velocityTotal > 0 ? (sampleIndexOf(model.velocityHistogram, rng()) ?? 4) : 4;
      const durationBucket = durationTotal > 0 ? (sampleIndexOf(model.noteDurationHistogram, rng()) ?? 1) : 1;
      const duration = durationTotal > 0 ? (NOTE_DURATION_BUCKETS[durationBucket] ?? 2) : 2;
      notes.push({
        step,
        pitch: Math.min(PATTERN_LIMITS.pitchMax, Math.max(PATTERN_LIMITS.pitchMin, Math.round(pitch))),
        vel: velocityTotal > 0 ? velocityCenterOf(velocityBucket) : 0.7,
        dur: Math.min(PATTERN_LIMITS.durMax, Math.max(PATTERN_LIMITS.durMin, duration)),
        voice: pitch < 48 ? "bass" : "lead",
      });
      lastPitch = pitch;
    }
  }
  // the answer folds through the one validator (the same clamps every
  // payload walks — the honest door, never a second law)
  const candidate = {
    schema: "debonair.pattern/1" as const,
    bpm,
    root,
    scale,
    bars,
    mood: options.mood ?? "generated",
    prompt: options.prompt ?? "",
    drums,
    notes,
    embedding: new Array<number>(EMBEDDING_DIM).fill(0),
  };
  const validated = validatePatternProject(candidate);
  if (!validated.ok) {
    return { ok: false, code: "bad-walk", message: `the walk failed the pattern contract (${validated.code}): ${validated.message}` };
  }
  return { ok: true, doc: validated.doc };
}

/**
 * Extracts the spectral envelope of a magnitude stack — the mel-band
 * means of the frames (audio.ts owns the mel filterbank — no
 * duplication), normalized to the loudest band (0..1, the shape law the
 * resynthesis bank reads).
 *
 * @param frames the magnitude frames (the stft output).
 * @param sampleRate the rate of the frames.
 * @param bands the band count (default the seat's 16).
 * @returns the envelope (bands numbers, 0..1 — zeros when the stack
 *   carries no energy).
 */
export function spectralEnvelopeOf(frames: readonly Float32Array[], sampleRate: number, bands = SPECTRAL_ENVELOPE_BANDS): number[] {
  if (frames.length === 0) return new Array<number>(bands).fill(0);
  const sums = new Array<number>(bands).fill(0);
  for (const frame of frames) {
    const mel = melbands(frame, sampleRate, bands);
    for (let band = 0; band < bands; band++) sums[band] += mel[band] ?? 0;
  }
  const means = sums.map((sum) => sum / frames.length);
  const peak = Math.max(...means);
  if (!(peak > 0)) return new Array<number>(bands).fill(0);
  return means.map((mean) => Math.min(1, Math.max(0, mean / peak)));
}

/** The resynthesis options of the spectral bank. */
export interface ResynthesizeSpectralOptions {
  /** The span of the render in seconds (default 2). */
  seconds?: number;
  /** The fundamental of the bank in hz (default 110 — the a2 law). */
  fundamentalHz?: number;
  /** The partial ceiling of the bank (default 48). */
  partials?: number;
  /** The sample rate of the render (default the mastering rate). */
  sampleRate?: number;
  /** The amplitude ceiling of the render (default 0.9). */
  peak?: number;
}

/**
 * Resynthesizes audio under a spectral envelope — the additive bank:
 * each partial lands inside the mel band its frequency belongs to (the
 * envelope law: a partial's amplitude answers its band's level), the
 * phases seeded by the identity (deterministic — the same envelope and
 * seed answer the same bytes), the sum peak-normalized. The honest
 * generative seat of the timbre: the envelope shapes real partials,
 * never a noise bed with a label.
 *
 * @param envelope the spectral envelope (SPECTRAL_ENVELOPE_BANDS levels,
 *   0..1).
 * @param seedSource the identity the phases ride.
 * @param options the render options.
 * @returns the rendered pcm, -peak..peak.
 */
export function resynthesizeSpectral(
  envelope: readonly number[],
  seedSource: string,
  options: ResynthesizeSpectralOptions = {},
): Float32Array {
  const seconds = Math.max(0.01, options.seconds ?? 2);
  const fundamental = Math.max(20, options.fundamentalHz ?? 110);
  const partials = Math.max(1, Math.min(128, Math.round(options.partials ?? 48)));
  const sampleRate = options.sampleRate ?? MASTERING.sampleRateHz;
  const peak = Math.min(1, Math.max(0.01, options.peak ?? 0.9));
  const bands = envelope.length > 0 ? envelope.length : SPECTRAL_ENVELOPE_BANDS;
  const rng = mulberry32(hashSeed(`spectral:${seedSource}`));
  const count = Math.max(1, Math.ceil(seconds * sampleRate));
  const out = new Float32Array(count);
  // the band law: the mel scale the envelope answers (audio.ts owns the
  // hz↔mel law — the same walk, no duplication)
  const nyquist = sampleRate / 2;
  const melLow = melOf(40);
  const melHigh = melOf(Math.min(16000, nyquist));
  for (let partial = 1; partial <= partials; partial++) {
    const hz = fundamental * partial;
    if (hz >= nyquist) break;
    const band = Math.min(bands - 1, Math.max(0, Math.floor(((melOf(hz) - melLow) / (melHigh - melLow)) * bands)));
    const level = envelope[band] ?? 0;
    if (level <= 0) continue;
    // the natural rolloff beside the seeded phase (the honest additive law)
    const amplitude = level / Math.sqrt(partial);
    const phase = rng() * 2 * Math.PI;
    for (let index = 0; index < count; index++) {
      out[index] += amplitude * Math.sin(2 * Math.PI * hz * (index / sampleRate) + phase);
    }
  }
  let renderedPeak = 0;
  for (let index = 0; index < count; index++) renderedPeak = Math.max(renderedPeak, Math.abs(out[index]));
  if (renderedPeak > 0) {
    const scale = peak / renderedPeak;
    for (let index = 0; index < count; index++) out[index] *= scale;
  }
  return out;
}

/** The hz → mel walk of the envelope law (the hzToMel law of audio.ts,
 * folded locally — the seat never imports the analysis lane's private
 * spelling twice; the formula is the same 2595·log10(1+hz/700)). */
function melOf(hz: number): number {
  return 2595 * Math.log10(1 + hz / 700);
}

/** The local clamp (the family's private spelling, kept private). */
function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}
