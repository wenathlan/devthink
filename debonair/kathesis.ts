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
//
//   the wave-fourteen dsp fold — the ten analysis and synthesis leaves
//                            the consolidation law seated (audit ranking
//                            eight): the fft spectrum core, the formant
//                            voice bank, the harmonic-percussive
//                            separation, the phase-vocoder time stretch,
//                            the true-peak limiter, the itu-r bs.1770
//                            loudness engine, the sidechain ducking, the
//                            stem planning lane, the demix-to-wavs lane
//                            and the sung-voice synthesizer — every body
//                            verbatim, the intra-group imports dissolved
//                            (the hpss, timestretch and demix reading the
//                            spectrum core, the demix reading hpss, the
//                            vocalsynth reading the formant bank, the
//                            vocalsynth re-export face of the formant
//                            names retired), the ducking failure
//                            constructor riding the failDuck suffix (the
//                            loudness section keeps the fail name, first
//                            in file order) and the cross-family wires
//                            (audio fft, katexis mastering, mixergraph
//                            conversion, pattern validation, theory
//                            seeding, wavwriter encoding, the arrangement
//                            and take types) riding the header import
//                            block — the writers family (wavwriter,
//                            midiwriter) staying its own leaf exactly as
//                            the audit orders

// library-grade: domain types and pure, deterministic helpers only — zero
// consumer data, zero storage, zero browser seats, zero network (the edge
// law: the heavy walks ride the saddle lanes the sandboxmodality seat
// declares, never the visitor's machine). the same call runs in the
// browser and in node. Non-goals: no analysis (audio.ts owns it), no
// scheduling (renderengine.ts owns it), no payloads (pattern.ts owns the
// contract — this seat reads the types and folds the historical v2
// documents onto it, never re-validates by its own law).

import type { ArrangerRole, TakePlan } from "./arrangement.ts";
import { fft, melbands } from "./audio.ts";
import { MASTERING } from "./katexis.ts";
import { dbToLinear, linearToDb } from "./mixergraph.ts";
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
  type PatternNoteEvent,
  type PatternProject,
  type PatternTimeline,
  validatePatternProject,
  validatePatternTimeline,
} from "./pattern.ts";
import type { NoteEvent, TakeSchedule } from "./take.ts";
import { hashSeed, midiToHz, mulberry32 } from "./theory.ts";
import { encodeWav } from "./wavwriter.ts";


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
  { seat: "voice", module: "kathesis.ts", owns: "the glottal source, the formant filter bank and the vowel phrase renderer (the formant and vocalsynth sections of this seat sing the line — the wave-fourteen dsp fold)" },
  { seat: "mixing", module: "renderengine.ts", owns: "the recipe voices over the bus faders — the offline bounce and the desk share one law" },
  { seat: "mastering", module: "kathesis.ts", owns: "the true-peak oversampling limiter and the bs.1770 loudness law (the limiter and loudness sections of this seat — the wave-fourteen dsp fold)" },
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

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: spectrum.ts — the fft spectrum core (the analysis primitives the hpss, timestretch and demix sections read — the intra-group imports dissolved, the audio fft import staying the one cross-family wire). */
/* ══════════════════════════════════════════════════════════════════════ */

// # spectrum — the spectral frame law of the katexis engine (root layer):
// the shared window, the magnitude math and the chroma projection every
// analysis domain rides. the transform itself is the engine's one kernel —
// the radix-2 cooley–tukey with its precomputed bit-reversal and
// twiddle tables the audio.ts fft section carries —
// imported here, never re-implemented: before the
// unification this file carried a second fft kernel of its own, and two
// kernels in one engine is the duplication the house law forbids. the
// fingerprint builder, the analyzer, hpss and any future b-wave module
// project frames through here so the window, the magnitude math and the
// chroma law stay in one place. Pure math — zero storage, zero audio context.


/** The FFT window length the analysis domains share (4096 = ~93ms at 44.1k). */
export const FFT_SIZE = 4096;
/** The hop between frames, in samples (1024 = 4x overlap). */
export const HOP_SIZE = 1024;
/** The Hann window table, precomputed once for FFT_SIZE (the symmetric
 * law — denominator size − 1 — every analysis caller's numbers ride; the
 * periodic windows the audio.ts fft section serves belong to its own stft lane, a
 * different contract, never silently swapped). */
export const HANN_TABLE: readonly number[] = buildHann(FFT_SIZE);

/** Builds one Hann window of the given length. */
function buildHann(size: number): number[] {
  const table = new Array<number>(size);
  for (let i = 0; i < size; i++) {
    table[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1));
  }
  return table;
}

/** One complex spectrum frame: magnitudes per bin (size/2 + 1 useful bins). */
export interface SpectrumFrame {
  /** The magnitude per bin, length size/2 + 1. */
  magnitudes: readonly number[];
  /** The bin frequency resolution (samplerate / size). */
  binHz: number;
}

/**
 * Computes the in-place radix-2 FFT of a complex signal (re, im arrays of
 * the same power-of-two length) — the fft kernel of the audio.ts fft section
 * under the frame-law signature the analysis callers ride. Plain number[] lanes keep their
 * float64 precision through a scratch pair (the kernel's float64 seat);
 * typed-array lanes ride the kernel directly, precision following the
 * buffer. the kernel's own domain is the power-of-two range [256, 16384]
 * (the fft kernel's own law — the house frames all ride 4096); a size off the domain
 * or a mismatched pair throws the kernel's FftError, honestly, never
 * silent garbage.
 *
 * @param re the real part, mutated in place (number[] or Float32Array).
 * @param im the imaginary part, mutated in place (number[] or Float32Array).
 */
export function fftInPlace(re: number[] | Float32Array, im: number[] | Float32Array): void {
  if (re instanceof Float32Array && im instanceof Float32Array) {
    fft(re, im);
    return;
  }
  const size = re.length;
  const scratchRe = Float64Array.from(re);
  const scratchIm = Float64Array.from(im);
  fft(scratchRe, scratchIm);
  for (let i = 0; i < size; i++) {
    re[i] = scratchRe[i];
    im[i] = scratchIm[i];
  }
}

/**
 * Windows one frame with the shared Hann table and answers its magnitude
 * spectrum (bins 0..size/2). The sample rate rides the caller — no rate is
 * baked in, the bin resolution follows whatever pcm the engine runs.
 *
 * @param samples the frame samples, length FFT_SIZE.
 * @param samplerate the rate of the pcm the frame came from (default 44100,
 * the cd quality the legacy callers assumed).
 * @returns the magnitude spectrum frame.
 */
export function frameSpectrum(samples: readonly number[], samplerate = 44100): SpectrumFrame {
  const re = new Array<number>(FFT_SIZE).fill(0);
  const im = new Array<number>(FFT_SIZE).fill(0);
  for (let i = 0; i < FFT_SIZE; i++) {
    re[i] = (samples[i] ?? 0) * HANN_TABLE[i];
  }
  fftInPlace(re, im);
  const bins = FFT_SIZE / 2 + 1;
  const magnitudes = new Array<number>(bins);
  for (let b = 0; b < bins; b++) {
    magnitudes[b] = Math.hypot(re[b], im[b]);
  }
  return { magnitudes, binHz: samplerate / FFT_SIZE };
}

/** The Krumhansl-Kessler key profiles the chroma projection correlates. */
export const KK_MAJOR: readonly number[] = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
export const KK_MINOR: readonly number[] = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

/**
 * Folds one magnitude spectrum into the twelve-bin chroma vector (one bin
 * per pitch class, octave-folded, log-frequency weighted).
 *
 * @param magnitudes the magnitude spectrum.
 * @param binHz the frequency per bin.
 * @returns the chroma vector, length 12, energy-summed.
 */
export function chromaOf(magnitudes: readonly number[], binHz: number): number[] {
  const chroma = new Array<number>(12).fill(0);
  for (let bin = 2; bin < magnitudes.length; bin++) {
    const hz = bin * binHz;
    if (hz < 55 || hz > 4200) continue;
    const midi = 69 + 12 * Math.log2(hz / 440);
    const pc = ((Math.round(midi) % 12) + 12) % 12;
    chroma[pc] += magnitudes[bin];
  }
  return chroma;
}

/**
 * Correlates a chroma vector against the twenty-four KK key profiles and
 * answers the best tonic pitch class and mode.
 *
 * @param chroma the twelve-bin chroma vector.
 * @returns the tonic pc (0=C) and the mode.
 */
export function keyOf(chroma: readonly number[]): { tonic: number; mode: "major" | "minor" } {
  let best: { tonic: number; mode: "major" | "minor"; score: number } = { tonic: 0, mode: "major", score: -Infinity };
  for (let tonic = 0; tonic < 12; tonic++) {
    // the window starts at the tonic: rotated[0] is the energy on the candidate tonic
    const rotated = chroma.map((_, i) => chroma[(i + tonic) % 12]);
    const major = correlation(rotated, KK_MAJOR);
    const minor = correlation(rotated, KK_MINOR);
    if (major > best.score) best = { tonic, mode: "major", score: major };
    if (minor > best.score) best = { tonic, mode: "minor", score: minor };
  }
  return { tonic: best.tonic, mode: best.mode };
}

/** The Pearson correlation of two equal-length vectors. */
function correlation(a: readonly number[], b: readonly number[]): number {
  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  return denA === 0 || denB === 0 ? 0 : num / Math.sqrt(denA * denB);
}


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: formant.ts — the formant voice bank (the source-filter resonator law — the theory kernel import staying the one cross-family wire). */
/* ══════════════════════════════════════════════════════════════════════ */

// # formant — the formant vocal render of the katexis engine (root layer,
// the second rung the vocalsynth lane always named: a real source-filter
// model — the glottal source, the formant filter bank, the envelope —
// producing sung and speech-like vocal pcm, node-side, through pure
// typescript dsp). the model is the classic one the speech literature
// pins: a glottal source (the band-limited saw or the rosenberg pulse,
// the vibrato riding the pitch of the sung events), a parallel bank of
// formant resonators — one rbj bandpass per formant pole, the pole
// frequencies of the vowel table F1..F3 beside the fixed F4/F5 seats,
// the bandwidths derived from the poles (the f/10 law of the resonant
// tongue) — and an attack-sustain-release envelope with the leading
// consonant noise burst for the spoken seats. a vowel glide (a
// diphthong) interpolates the pole frequencies across the event, so the
// lane sings "ai" and "ou" as one moving voice, never two spliced ones.
// the laws the lane owns: every event renders through the same core (a
// sung note and a spoken syllable differ only in the pitch seat — midi
// against a fixed f0 — and the vibrato), the breath noise rides the same
// formant bank (an unvoiced event is the filter with the noise source),
// the level law normalizes the event first and scales the velocity after
// (velocity shapes the level, never the timbre), and the phrase mix is
// additive with the clamp (the transport owns the master strip).
// ownership: this file is the one home of the vowel formant table and
// the formant resonator law — vocalsynth re-exports the table for its
// pinned public surface and rides the same bandpass through the exported
// helper, so the syllable voice and the formant lane answer one law,
// never two. the fft-free, context-free, storage-free walk is pure and
// deterministic: the same events, options and rng answer the same bytes
// on every machine.


/** The vowel id the formant table carries (a e i o u, the five the
 * syllable lane rides). */
export type Vowel = "a" | "e" | "i" | "o" | "u";

/** The five-vowel formant table (hz), F1/F2/F3 per vowel — the classic
 * Peterson–Barney/Klatt seats the speech literature pins, the one home of
 * the numbers (the syllable lane re-exports it, its pinned tests read it
 * through the same table). */
export const VOWEL_FORMANTS: Readonly<Record<Vowel, readonly [number, number, number]>> = {
  a: [730, 1090, 2440],
  e: [530, 1840, 2480],
  i: [270, 2290, 3010],
  o: [570, 840, 2410],
  u: [300, 870, 2240],
};

/** One formant pole of the resonator bank. */
export interface FormantPole {
  /** The pole frequency in hz. */
  hz: number;
  /** The bandwidth in hz (the rbj q rides hz/bw — the f/10 tongue law). */
  bw: number;
  /** The linear gain the pole's branch carries (F1 leads, the upper poles taper). */
  gain: number;
}

/** The fixed F4/F5 seats of the bank (hz) — the laryngeal and the
 * brilliance poles every vowel shares (the klatt class fixed tail). */
export const UPPER_FORMANT_HZ: readonly [number, number] = [3500, 4500];

/** The fixed bandwidths of the F4/F5 seats (hz). */
export const UPPER_FORMANT_BW: readonly [number, number] = [250, 300];

/** The upper-pole gains (the taper: each octave up answers a third quieter). */
export const UPPER_FORMANT_GAINS: readonly [number, number] = [0.5, 0.25];

/**
 * Builds the formant pole bank of one vowel: F1..F3 from the vowel table
 * (the bandwidth the f/10 law derives, the gain the taper 1/(index+1)
 * answers), F4/F5 the fixed klatt tail. One table, derived in code —
 * never a second magic grid.
 *
 * @param vowel the vowel the bank sings.
 * @returns the five poles, F1..F5 ascending.
 */
export function vowelBank(vowel: Vowel): readonly FormantPole[] {
  const base = VOWEL_FORMANTS[vowel];
  const poles: FormantPole[] = [];
  for (let index = 0; index < 3; index++) {
    const hz = base[index] ?? 800;
    poles.push({ hz, bw: hz / 10, gain: 1 / (index + 1) });
  }
  for (let index = 0; index < UPPER_FORMANT_HZ.length; index++) {
    poles.push({
      hz: UPPER_FORMANT_HZ[index] ?? 3500,
      bw: UPPER_FORMANT_BW[index] ?? 250,
      gain: UPPER_FORMANT_GAINS[index] ?? 0.5,
    });
  }
  return poles;
}

/**
 * Interpolates two pole banks (the diphthong law): the frequencies and
 * the bandwidths crossfade linearly across the glide's seat, the gains
 * hold. Two banks of the same vowel answer that vowel unchanged.
 *
 * @param from the bank the event opens with.
 * @param to the bank the event closes with.
 * @param seat the crossfade position, 0..1.
 * @returns the interpolated bank.
 */
export function glideBank(from: readonly FormantPole[], to: readonly FormantPole[], seat: number): FormantPole[] {
  const clamped = Math.min(1, Math.max(0, seat));
  return from.map((pole, index) => {
    const target = to[index] ?? pole;
    return {
      hz: pole.hz + ((target.hz - pole.hz) * clamped),
      bw: pole.bw + ((target.bw - pole.bw) * clamped),
      gain: pole.gain,
    };
  });
}

/** The glottal source models the lane carries. */
export type GlottalSourceKind = "saw" | "pulse";

/** The vibrato rate of the sung events (hz, the corpus law). */
export const FORMANT_VIBRATO_HZ = 5;

/** The vibrato depth of the sung events (semitones). */
export const FORMANT_VIBRATO_SEMITONES = 0.35;

/** The default spoken f0 when an event declares neither midi nor hz (the
 * speech-register floor the lane documents). */
export const DEFAULT_SPEECH_HZ = 220;

/** The consonant noise burst length (seconds). */
export const FORMANT_CONSONANT_S = 0.024;

/** The target event peak the level law normalizes to (the syllable lane's
 * own documented seat, one number per engine). */
export const FORMANT_TARGET_PEAK = 0.45;

/** The envelope seats: the attack and the release windows (seconds). */
export const FORMANT_ENVELOPE = { attackSeconds: 0.02, releaseSeconds: 0.06 } as const;

/**
 * The band-limited sawtooth glottal source at one phase: the harmonic sum
 * the bandlimit pins (the harmonics never ride past half the rate), the
 * 1/h tilt the glottal spectrum carries.
 *
 * @param phase the source phase, [0, 1).
 * @param harmonics the bandlimit (the classic twelve).
 * @returns the source sample.
 */
export function glottalSaw(phase: number, harmonics = 12): number {
  let sample = 0;
  for (let harmonic = 1; harmonic <= harmonics; harmonic++) {
    sample += Math.sin(2 * Math.PI * harmonic * phase) / harmonic;
  }
  return sample;
}

/**
 * The rosenberg glottal pulse at one phase — the asymmetric
 * polynomial pulse the speech literature pins (the open phase t²
 * rise, the smooth close), the more speech-like source of the pair.
 *
 * @param phase the source phase, [0, 1).
 * @returns the source sample.
 */
export function rosenbergPulse(phase: number): number {
  const openPhase = 0.6;
  if (phase < openPhase) {
    const seat = phase / openPhase;
    return 3 * seat * seat - 2 * seat * seat * seat;
  }
  const seat = (phase - openPhase) / (1 - openPhase);
  return 1 - seat * seat;
}

/** One rbj bandpass resonator — the direct form 1 seat the formant poles
 * ride (the same transfer function the syllable voice carries, this file
 * is the one home). The retune seat keeps the filter state across a pole
 * move (the diphthong law updates the coefficients at the control rate,
 * never the ring). */
export interface FormantResonator {
  /** Steps the resonator over one input sample. */
  step(x: number): number;
  /** Retunes the pole (the coefficients move, the state rides). */
  retune(hz: number, bw: number): void;
}

/** Builds the rbj coefficients of one pole seat (the shared law of the
 * constructor and the retune walk). The parallel bank rides the
 * unity-peak form of the bandpass — the classic skirt form (b0 = α)
 * carries a centre gain of 2·sin(w0), so the upper poles would own the
 * balance just by sitting higher (the fixed F4/F5 tail would drown the
 * vowel's own F1/F2 law); the unity-peak seat (b0 = 1/(4Q)) hands the
 * balance to the pole gains, the klatt parallel-bank law. The syllable
 * lane's chained helper keeps the historical skirt form its pinned
 * contract rides — two documented laws, one file, never confused. */
function rbjOf(hz: number, bw: number, sampleRate: number) {
  const w0 = (2 * Math.PI * hz) / sampleRate;
  const q = Math.max(0.5, hz / Math.max(1, bw));
  const alpha = Math.sin(w0) / (2 * q);
  const a0 = 1 + alpha;
  const b0 = 1 / (4 * q);
  return {
    b0: b0 / a0,
    b2: -b0 / a0,
    a1: (-2 * Math.cos(w0)) / a0,
    a2: (1 - alpha) / a0,
  };
}

/**
 * Builds one formant resonator: the rbj constant-peak bandpass at the
 * pole frequency with the bandwidth's q (f/bw), zero state.
 *
 * @param hz the pole frequency.
 * @param bw the bandwidth.
 * @param sampleRate the render rate.
 * @returns the primed resonator.
 */
export function formantResonator(hz: number, bw: number, sampleRate: number): FormantResonator {
  let { b0, b2, a1, a2 } = rbjOf(hz, bw, sampleRate);
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  return {
    step(x: number): number {
      const y0 = b0 * x + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1;
      x1 = x;
      y2 = y1;
      y1 = y0;
      return y0;
    },
    retune(hz2: number, bw2: number): void {
      const next = rbjOf(hz2, bw2, sampleRate);
      b0 = next.b0;
      b2 = next.b2;
      a1 = next.a1;
      a2 = next.a2;
    },
  };
}

/**
 * Applies one rbj bandpass over a whole buffer in place — the helper the
 * syllable voice rides for its chained law (the same coefficients, the
 * same order, byte-identical answers — one implementation home).
 *
 * @param samples the buffer the bandpass filters in place.
 * @param f0 the centre frequency.
 * @param q the resonance.
 * @param sampleRate the render rate.
 */
export function applyBandpass(samples: Float32Array, f0: number, q: number, sampleRate: number): void {
  const w0 = (2 * Math.PI * f0) / sampleRate;
  const alpha = Math.sin(w0) / (2 * q);
  const b0 = alpha;
  const b2 = -alpha;
  const a0 = 1 + alpha;
  const a1 = -2 * Math.cos(w0);
  const a2 = 1 - alpha;
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const x0 = samples[i] ?? 0;
    const y0 = (b0 / a0) * x0 + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
    samples[i] = y0;
  }
}

/** The control hop of the diphthong glide (samples): the pole moves the
 * resonator coefficients at this rate — fine enough that the ear reads a
 * moving formant, coarse enough that the coefficient walk stays cheap
 * (the state rides through every retune, the ring never resets). */
export const FORMANT_CONTROL_HOP = 256;

/** One sung or spoken event of the phrase. */
export interface FormantEvent {
  /** The start second on the phrase timeline. */
  start: number;
  /** The duration in seconds. */
  duration: number;
  /** The velocity 0..1 — the level seat (the timbre stays the bank's). */
  velocity: number;
  /** The vowel — or the glide pair of a diphthong ("ai" answers [a, i]). */
  vowels: readonly Vowel[] | readonly [Vowel, Vowel];
  /** The sung pitch, midi 69 = a4 (wins over hz when both ride). */
  midi?: number;
  /** The spoken f0 (the default when midi is absent). */
  hz?: number;
  /** Whether the event is voiced (the glottal source) or a breath (noise). */
  voiced: boolean;
  /** The leading consonant burst (the spoken seats ride it). */
  consonant?: boolean;
}

/** The render options one phrase carries. */
export interface FormantRenderOptions {
  /** The sample rate of the render. */
  sampleRate: number;
  /** The seeded rng 0..1 (the vibrato phases and the noise seats ride it);
   * absent answers the lane's own fixed seed, so the default render is
   * deterministic without a caller-provided stream. */
  random?: () => number;
  /** The glottal source model (default "saw", the syllable voice's law). */
  source?: GlottalSourceKind;
  /** The attack window in seconds (default 0.02). */
  attackSeconds?: number;
  /** The release window in seconds (default 0.06). */
  releaseSeconds?: number;
}

/** One rendered phrase: the mono samples plus the peak meter. */
export interface FormantRender {
  /** The mono samples, length ceil(span · sampleRate), at least one. */
  samples: Float32Array;
  /** The absolute peak (0..1+). */
  peak: number;
}

/** Reads the rng or answers the lane's fixed seeded stream (the
 * determinism law — the default render repeats bit-for-bit). */
function randomOf(options: FormantRenderOptions): () => number {
  return options.random ?? mulberry32(hashSeed("formant:v1"));
}

/** The f0 of one event (the midi seat wins, the hz second, the speech
 * floor last — the documented order). */
function f0Of(event: FormantEvent): number {
  if (event.midi !== undefined && Number.isFinite(event.midi)) return midiToHz(event.midi);
  if (event.hz !== undefined && Number.isFinite(event.hz) && event.hz > 0) return event.hz;
  return DEFAULT_SPEECH_HZ;
}

/**
 * Renders one event into a fresh buffer — the source-filter walk: the
 * source (the glottal saw or the rosenberg pulse with the seeded vibrato
 * of the sung events, the seeded noise of the breath), the parallel
 * formant bank (a resonator per pole, the diphthong glide interpolating
 * the poles across the span), the asr envelope, the consonant burst.
 * The level law runs last: the event normalizes to the target peak, the
 * velocity scales after (the velocity shapes the level, never the timbre).
 *
 * @param event the event to render.
 * @param options the render options.
 * @param random the seeded rng (the caller shares one stream per phrase).
 * @returns the event buffer.
 */
function renderEvent(event: FormantEvent, options: FormantRenderOptions, random: () => number): Float32Array {
  const sampleRate = options.sampleRate;
  const length = Math.max(1, Math.round(event.duration * sampleRate));
  const buffer = new Float32Array(length);
  const first = (event.vowels[0] ?? "a") as Vowel;
  const last = ((event.vowels.length > 1 ? event.vowels[1] : event.vowels[0]) ?? first) as Vowel;
  const from = vowelBank(first);
  const to = vowelBank(last);
  const f0 = f0Of(event);
  const vibratoDepth = 2 ** (FORMANT_VIBRATO_SEMITONES / 12) - 1;
  const vibratoPhase = random() * Math.PI * 2;
  const source = options.source ?? "saw";
  // the parallel bank: a resonator per pole, the diphthong glide retuning
  // the coefficients at the control hop (the state rides every retune)
  const gains = from.map((pole) => pole.gain);
  const resonators = from.map((pole) => formantResonator(pole.hz, pole.bw, sampleRate));
  // the running source phase (the vibrato integrates its instantaneous
  // frequency into it, one sample at a time)
  let phase = 0;
  const retune = (seat: number): void => {
    for (let p = 0; p < resonators.length; p++) {
      const fromPole = from[p] ?? { hz: 800, bw: 80, gain: 1 };
      const toPole = to[p] ?? fromPole;
      const hz = fromPole.hz + (toPole.hz - fromPole.hz) * seat;
      const bw = fromPole.bw + (toPole.bw - fromPole.bw) * seat;
      resonators[p]?.retune(hz, bw);
    }
  };
  for (let i = 0; i < length; i++) {
    if (i % FORMANT_CONTROL_HOP === 0) retune(length > 1 ? i / (length - 1) : 0);
    const t = i / sampleRate;
    // the source: the vibrato modulates the instantaneous frequency and the
    // phase integrates it (the honest fm law — a multiplicative phase would
    // drift the deviation with t, the syllable lane's historical quirk this
    // lane does not inherit), the breath rides the seeded noise
    let sample = 0;
    if (event.voiced) {
      const vibrato = 1 + vibratoDepth * Math.sin(2 * Math.PI * FORMANT_VIBRATO_HZ * t + vibratoPhase);
      phase = (phase + (f0 * vibrato) / sampleRate) % 1;
      sample = source === "pulse" ? rosenbergPulse(phase) : glottalSaw(phase);
      sample *= 0.22;
    } else {
      sample = (random() * 2 - 1) * 0.5;
    }
    // the parallel bank: each pole resonates the source at its own gain
    let filtered = 0;
    for (let p = 0; p < resonators.length; p++) {
      filtered += (resonators[p]?.step(sample) ?? 0) * (gains[p] ?? 1);
    }
    buffer[i] = filtered;
  }
  // the consonant burst: the leading noise, the short decay the burst law pins
  if (event.consonant) {
    const burst = Math.min(length, Math.max(1, Math.round(FORMANT_CONSONANT_S * sampleRate)));
    for (let i = 0; i < burst; i++) {
      buffer[i] = (buffer[i] ?? 0) + (random() * 2 - 1) * 0.12 * (1 - i / burst);
    }
  }
  // the envelope: the attack window in, the release window out, both
  // clamped inside the event's own span (a short event keeps its shape)
  const attack = Math.max(1, Math.round((options.attackSeconds ?? FORMANT_ENVELOPE.attackSeconds) * sampleRate));
  const release = Math.max(1, Math.round((options.releaseSeconds ?? FORMANT_ENVELOPE.releaseSeconds) * sampleRate));
  const attackWin = Math.min(attack, length);
  const releaseWin = Math.min(release, length - 1);
  for (let i = 0; i < length; i++) {
    let gain = 1;
    if (i < attackWin) gain = i / attackWin;
    if (i >= length - releaseWin) gain = Math.min(gain, (length - i) / releaseWin);
    buffer[i] = (buffer[i] ?? 0) * gain;
  }
  // the level law: normalize to the target peak, scale the velocity after
  let peak = 0;
  for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(buffer[i] ?? 0));
  if (peak > 0) {
    const gain = FORMANT_TARGET_PEAK / peak;
    for (let i = 0; i < length; i++) buffer[i] = (buffer[i] ?? 0) * gain;
  }
  const velocity = Number.isFinite(event.velocity) ? Math.min(1, Math.max(0, event.velocity)) : 1;
  for (let i = 0; i < length; i++) buffer[i] = (buffer[i] ?? 0) * velocity;
  return buffer;
}

/**
 * Renders a whole sung or spoken phrase onto one mono buffer: every event
 * through the source-filter core, placed additively at its start, the
 * mix clamped to full scale (the transport owns the master strip). the
 * rng stream is shared across the events (pass a fresh seeded stream per
 * render call — the same stream answers the same phrase).
 *
 * @param events the phrase events, any order (the placement is absolute).
 * @param options the render options (sampleRate, rng, source, envelope).
 * @returns the rendered phrase (the samples and the peak).
 */
export function renderFormantPhrase(
  events: readonly FormantEvent[],
  options: FormantRenderOptions,
): FormantRender {
  const random = randomOf(options);
  const tail = events.reduce((max, event) => Math.max(max, event.start + event.duration), 0);
  const samples = new Float32Array(Math.max(1, Math.ceil(tail * options.sampleRate)));
  let peak = 0;
  for (const event of events) {
    if (!(event.duration > 0) || !Number.isFinite(event.start) || event.start < 0) continue;
    const buffer = renderEvent(event, options, random);
    const offset = Math.round(event.start * options.sampleRate);
    for (let i = 0; i < buffer.length && offset + i < samples.length; i++) {
      const value = Math.max(-1, Math.min(1, (samples[offset + i] ?? 0) + (buffer[i] ?? 0)));
      samples[offset + i] = value;
      const abs = Math.abs(value);
      if (abs > peak) peak = abs;
    }
  }
  return { samples, peak };
}


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: hpss.ts — the harmonic-percussive separation (the stft masks over the spectrum core). */
/* ══════════════════════════════════════════════════════════════════════ */

// # hpss — the harmonic/percussive stem separator of the katexis engine (root
// layer): the classical median-filter HPSS (Fitzgerald 2010, Driedger Müller
// Dissecco 2014) over the shared spectral kernel. One real STFT of the mono
// pcm, two median filters on the magnitude (across time separates the
// harmonic ridge, across frequency separates the percussive broadband), two
// soft Wiener masks that always sum to one and one ISTFT per stem with the
// ORIGINAL phases — the conservation law: harmonic + percussive equals the
// input within float tolerance, the separation never invents or loses
// energy. Pure math, deterministic, zero storage, zero audio context, zero
// downloads — the runner floor (saddle) or the browser rides it as-is.


/** The median window across time for the harmonic ridge (odd frames). */
export const HARMONIC_KERNEL = 17;
/** The median window across frequency for the percussive broadband (odd bins). */
export const PERCUSSIVE_KERNEL = 17;

/** One complex spectrum of the stft: full fft-size bins (re, im interleaved by array pair).
 * Exported for the sibling dsp lanes the spectrum rides (the demix builds
 * its band-refined masks over the same framing — one stft law per engine). */
export interface Stft {
  /** The real part per frame, frame × fftSize. */
  re: Float32Array[];
  /** The imaginary part per frame, frame × fftSize. */
  im: Float32Array[];
  /** The magnitude per frame, frame × (fftSize / 2 + 1). */
  mag: Float32Array[];
  /** The frame count. */
  frames: number;
  /** The fft size behind re/im/mag. */
  size: number;
  /** The half-window preroll the centered framing prepended: the input
   * sample 0 lives at padded index pre (the istft trims it back). */
  pre: number;
}

/**
 * Computes the real STFT of a mono signal with the shared hann window and
 * hop, CENTER framed: half a window of silence rides in front of the input
 * so every input sample sits near a window peak (the librosa law) — the
 * inverse never divides the filtered frames by a window tail.
 *
 * @param mono the input samples.
 * @returns the complex spectra and magnitudes per frame, with the preroll.
 */
export function stft(mono: Float32Array): Stft {
  const size = FFT_SIZE;
  const hop = HOP_SIZE;
  const pre = size / 2;
  const padded = pre + mono.length;
  const frames = Math.max(1, Math.ceil(Math.max(0, padded - size) / hop) + 1);
  const re: Float32Array[] = [];
  const im: Float32Array[] = [];
  const mag: Float32Array[] = [];
  const half = size / 2 + 1;
  for (let f = 0; f < frames; f++) {
    const start = f * hop;
    const fre = number_array(size);
    const fim = number_array(size);
    for (let i = 0; i < size; i++) {
      // the padded timeline: frame start rides the preroll, the input
      // sample 0 lands at padded index pre
      const at = start + i - pre;
      const s = at >= 0 && at < mono.length ? mono[at] : 0;
      fre[i] = s * HANN_TABLE[i];
    }
    fftInPlace(fre, fim);
    re.push(fre);
    im.push(fim);
    const m = new Float32Array(half);
    for (let k = 0; k < half; k++) {
      m[k] = Math.hypot(fre[k], fim[k]);
    }
    mag.push(m);
  }
  return { re, im, mag, frames, size, pre };
}

/** The float array constructor alias (keeps the fill sites short). */
function number_array(n: number): Float32Array {
  return new Float32Array(n);
}

/**
 * Sliding median along one axis of a magnitude matrix. A small insertion
 * window keeps the kernel linear on 17 elements; the borders shrink the
 * window instead of padding.
 *
 * @param mag the per-frame magnitudes.
 * @param kernel the odd window length.
 * @param axis "time" filters across frames per bin, "freq" across bins per frame.
 * @returns the median-filtered copy (same shape).
 */
export function medianFilter(mag: readonly Float32Array[], kernel: number, axis: "time" | "freq"): Float32Array[] {
  const frames = mag.length;
  const bins = mag[0].length;
  const half = (kernel - 1) / 2;
  const window: number[] = new Array(kernel);
  const out: Float32Array[] = [];
  if (axis === "freq") {
    for (let f = 0; f < frames; f++) {
      const row = new Float32Array(bins);
      for (let k = 0; k < bins; k++) {
        const lo = Math.max(0, k - half);
        const hi = Math.min(bins - 1, k + half);
        let n = 0;
        for (let j = lo; j <= hi; j++) window[n++] = mag[f][j];
        row[k] = medianOf(window, n);
      }
      out.push(row);
    }
    return out;
  }
  for (let f = 0; f < frames; f++) {
    const row = new Float32Array(bins);
    const lo = Math.max(0, f - half);
    const hi = Math.min(frames - 1, f + half);
    for (let k = 0; k < bins; k++) {
      let n = 0;
      for (let g = lo; g <= hi; g++) window[n++] = mag[g][k];
      row[k] = medianOf(window, n);
    }
    out.push(row);
  }
  return out;
}

/** The median of the first n values of the window (insertion sort — kernel stays ≤ 17). */
function medianOf(window: number[], n: number): number {
  for (let i = 1; i < n; i++) {
    const v = window[i];
    let j = i - 1;
    while (j >= 0 && window[j] > v) {
      window[j + 1] = window[j];
      j--;
    }
    window[j + 1] = v;
  }
  return window[n >> 1];
}

/**
 * Inverse stft with the overlap-add hann synthesis (the hann window doubles
 * as the synthesis window; the hop of a quarter size keeps the ola constant).
 *
 * @param stft the complex spectra carrying the phases to restore.
 * @param gain the per-bin soft mask (0..1) applied on the complex spectrum.
 * @returns the reconstructed mono samples.
 */
export function istft(stft: Stft, gain: readonly Float32Array[]): Float32Array {
  const { re, im, size } = stft;
  const hop = HOP_SIZE;
  const frames = stft.frames;
  const length = (frames - 1) * hop + size;
  // f64 everywhere in the inverse: the ola divides tiny window sums at the
  // edges and the spectrum-to-sample cancellation runs nine orders deep —
  // single precision loses both
  const out = new Float64Array(length);
  const norm = new Float64Array(length);
  const fre: number[] = new Array<number>(size).fill(0);
  const fim: number[] = new Array<number>(size).fill(0);
  const half = size / 2 + 1;
  for (let f = 0; f < frames; f++) {
    const mask = gain[f];
    // the inverse rides the forward transform: conj(fft(conj(X))) = N·x —
    // the bins go in conjugated (and the hermitian mirror follows the
    // flipped sign), the ola reads the real part scaled by 1/N
    for (let k = 0; k < half; k++) {
      const g = mask ? mask[k] : 1;
      fre[k] = re[f][k] * g;
      fim[k] = -im[f][k] * g;
      if (k > 0 && k < size / 2) {
        fre[size - k] = re[f][k] * g;
        fim[size - k] = im[f][k] * g;
      }
    }
    fftInPlace(fre, fim);
    const start = f * hop;
    const scale = 1 / size;
    for (let i = 0; i < size; i++) {
      out[start + i] += fre[i] * scale * HANN_TABLE[i];
      norm[start + i] += HANN_TABLE[i] * HANN_TABLE[i];
    }
  }
  for (let i = 0; i < length; i++) {
    // the ola divides only where the window sum is healthy: at the signal
    // head/tail a lone frame carries the sample in its window tail, and
    // dividing there amplifies the filtered content instead of restoring
    // it — those samples keep the attenuated ola sum (a millisecond fade,
    // the same edge law the centered framings of the reference tools hide
    // with padding)
    if (norm[i] > 1e-2) out[i] /= norm[i];
  }
  // the engine contract stays f32 (the consumers ride Float32Array pcm):
  // the f64 accumulators rounded once at the end keep the conservation
  return Float32Array.from(out);
}

/**
 * Builds the soft wiener masks from the two median-filtered magnitude
 * matrices. MaskH + MaskP = 1 for every frame and bin — the conservation
 * the istft relies on.
 *
 * @param harmonic the time-median magnitudes.
 * @param percussive the frequency-median magnitudes.
 * @returns the pair of gain matrices in the same shape.
 */
export function masksOf(
  harmonic: readonly Float32Array[],
  percussive: readonly Float32Array[],
): {
  harmonic: Float32Array[];
  percussive: Float32Array[];
} {
  const harmonicGain: Float32Array[] = [];
  const percussiveGain: Float32Array[] = [];
  for (let f = 0; f < harmonic.length; f++) {
    const h = new Float32Array(harmonic[f].length);
    const p = new Float32Array(harmonic[f].length);
    for (let k = 0; k < harmonic[f].length; k++) {
      const h2 = harmonic[f][k] * harmonic[f][k];
      const p2 = percussive[f][k] * percussive[f][k];
      const total = h2 + p2;
      if (total <= 1e-20) {
        h[k] = 0.5;
        p[k] = 0.5;
      } else {
        h[k] = h2 / total;
        p[k] = p2 / total;
      }
    }
    harmonicGain.push(h);
    percussiveGain.push(p);
  }
  return { harmonic: harmonicGain, percussive: percussiveGain };
}

/** The two separated stems of one separation pass. */
export interface StemPair {
  /** The harmonic stem: tones, pads, bass, sustained vocals. */
  harmonic: Float32Array;
  /** The percussive stem: kicks, snares, hats, transients. */
  percussive: Float32Array;
}

/**
 * Separates one mono signal into the harmonic and the percussive stem. The
 * masks ride the ORIGINAL phase of the input spectrum, so the pair sums back
 * to the input (float tolerance) — the conservation the tests pin.
 *
 * @param mono the input samples.
 * @returns the two stems, each the input length.
 */
export function separate(mono: Float32Array): StemPair {
  const spectra = stft(mono);
  const harmonic = medianFilter(spectra.mag, HARMONIC_KERNEL, "time");
  const percussive = medianFilter(spectra.mag, PERCUSSIVE_KERNEL, "freq");
  const { harmonic: hg, percussive: pg } = masksOf(harmonic, percussive);
  // the centered framing pads half a window in front: the ola grid also
  // trails past the end — the stems answer the input length exactly, the
  // preroll and the tail never leak to the consumers
  const harmonicFull = istft(spectra, hg);
  const percussiveFull = istft(spectra, pg);
  return {
    harmonic: harmonicFull.subarray(spectra.pre, spectra.pre + mono.length),
    percussive: percussiveFull.subarray(spectra.pre, spectra.pre + mono.length),
  };
}


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: timestretch.ts — the phase-vocoder time stretch (the spectrum core again, the stretch contract with its error codes). */
/* ══════════════════════════════════════════════════════════════════════ */

// # timestretch — the time-stretch executor of the katexis engine (root
// layer, the wave the speechalign plan always named and no lane ever
// rendered): the classic phase vocoder (Flanagan 1966, Portnoff 1976, the
// Laroche–Dolon identity phase locking of 1999) over the shared spectral
// kernel — one stft on the analysis grid, per-bin phase propagation across
// consecutive frames (the heterodyned instantaneous-frequency rotation),
// the synthesis phases locked to the local spectral peaks, one inverse
// frame per analysis frame placed on the synthesis grid, the hann window
// riding both passes and the overlap-add normalised by the squared-window
// sum (the same ola edge law hpss pins: the head and tail of the grid
// divide only where the window sum is healthy). The pitch never moves:
// the analysis hop is constant (HOP_SIZE, the shared law), the synthesis
// hop carries the stretch (Hs = Ha · ratio), the phase advance measured on
// the analysis timeline drives the synthesis timeline — a 440 hz tone
// stretched to twice its length still answers 440 hz, the test pins it.
// Honest limits, documented never hidden: the phase vocoder is a
// sinusoidal-model engine — transients smear when the stretch grows (the
// window is 93 ms at 44.1k, so a stretch of 2 rides 186 ms of phase
// history over each output frame), and the band law keeps the stretch
// inside 0.25..2: below the floor the synthesis hop out-runs the window
// (the ola grid stops overlapping), above the ceiling the squared-window
// sum grows gaps (the same law from the other side) — a stretch beyond
// the band answers its machine code, never a silent pretend-pass. The
// fft kernel is imported from spectrum.ts — never re-implemented, the
// family law; the window and the hop are the shared tables so the
// stretch, hpss and the analyzer read one law. Pure math, deterministic:
// the same samples and ratio always answer the same bytes, on every
// machine, node or browser alike.


/** The machine readable failure codes of the stretch contract. */
export type StretchErrorCode = "empty-signal" | "bad-ratio";

/** The typed stretch failure, traceable to a machine code. */
export class StretchError extends Error {
  /** Machine readable failure code. */
  readonly code: StretchErrorCode;

  constructor(code: StretchErrorCode, message?: string) {
    super(message ?? `timestretch ${code}`);
    this.name = "StretchError";
    this.code = code;
  }
}

/** The slowest stretch the phase vocoder law answers (the output holds a
 * quarter of the input's timeline — the synthesis hop of 256 against the
 * 4096 window rides a healthy sixteen-fold overlap; any slower and one
 * analysis frame must span more than the window itself). */
export const STRETCH_RATIO_MIN = 0.25;

/** The fastest stretch the phase vocoder law answers in the other
 * direction (the output holds twice the input's timeline — the synthesis
 * hop of 2048 against the 4096 window keeps the fifty percent overlap the
 * squared-window normalisation needs; any longer and the ola grid grows
 * gaps whose window sum sits under the divide law). */
export const STRETCH_RATIO_MAX = 2;

/** The principal argument: the angle wrapped into (−π, π] — the phase
 * difference law every per-bin rotation rides. */
function princarg(angle: number): number {
  const wrapped = angle % (2 * Math.PI);
  if (wrapped > Math.PI) return wrapped - 2 * Math.PI;
  if (wrapped <= -Math.PI) return wrapped + 2 * Math.PI;
  return wrapped;
}

/** One analysis frame of the stretch stft: the magnitudes and the phases
 * of the useful half spectrum. */
interface AnalysisFrame {
  /** Magnitudes per bin, length FFT_SIZE / 2 + 1. */
  mag: Float64Array;
  /** Phases per bin, the same length. */
  phase: Float64Array;
}

/**
 * The analysis pass: the hann-windowed stft on the constant grid, one
 * frame per HOP_SIZE of input. The frame count covers both timelines —
 * the input's (no sample rides outside the grid) and the output's (the
 * stretched ola tail needs frames past the input's end, their windows
 * reading the zero padding) — a signal shorter than one window still
 * answers its one zero-padded frame.
 *
 * @param mono the input samples.
 * @param frames the frame count the caller pinned (the grid law above).
 * @returns the analysis frames, exactly `frames` of them.
 */
function analyze(mono: Float32Array, frames: number): AnalysisFrame[] {
  const size = FFT_SIZE;
  const hop = HOP_SIZE;
  const half = size / 2 + 1;
  const out: AnalysisFrame[] = [];
  // the number[] lanes keep their float64 precision through the kernel's
  // scratch pair (the spectrum law — the phase vocoder's cancellation runs
  // as deep as the hpss inverse)
  const re = new Array<number>(size).fill(0);
  const im = new Array<number>(size).fill(0);
  for (let k = 0; k < frames; k++) {
    const start = k * hop;
    re.fill(0);
    im.fill(0);
    for (let i = 0; i < size; i++) {
      const sample = mono[start + i] ?? 0;
      re[i] = sample * HANN_TABLE[i];
    }
    fftInPlace(re, im);
    const mag = new Float64Array(half);
    const phase = new Float64Array(half);
    for (let b = 0; b < half; b++) {
      mag[b] = Math.hypot(re[b], im[b]);
      phase[b] = Math.atan2(im[b], re[b]);
    }
    out.push({ mag, phase });
  }
  return out;
}

/** Finds the local spectral peaks of one frame: a bin at or above its
 * lower neighbour and strictly above the upper one — the seats whose
 * rotation the region law locks onto (the Laroche–Dolon peaks). */
function peaksOf(mag: Float64Array): number[] {
  const peaks: number[] = [];
  for (let b = 1; b < mag.length - 1; b++) {
    if (mag[b] >= mag[b - 1] && mag[b] > mag[b + 1]) peaks.push(b);
  }
  return peaks;
}

/** Maps every bin onto the peak whose region owns it: the peaks divide the
 * spectrum at the midpoints between neighbours, each bin answers the
 * nearest peak (the identity phase-locking region of the classic paper —
 * the phase of a bin follows its region's peak, the magnitude shape stays
 * untouched). An empty peak table answers the identity map. */
function peakRegions(peaks: readonly number[], bins: number): Int32Array {
  const owner = new Int32Array(bins);
  if (peaks.length === 0) {
    for (let b = 0; b < bins; b++) owner[b] = b;
    return owner;
  }
  let peak = 0;
  for (let b = 0; b < bins; b++) {
    while (peak + 1 < peaks.length && b >= ((peaks[peak] ?? 0) + (peaks[peak + 1] ?? 0)) / 2) peak += 1;
    owner[b] = peaks[peak] ?? b;
  }
  return owner;
}

/**
 * Time-stretches one mono signal, pitch preserved — the phase vocoder walk:
 * analysis (the shared hann window, the constant hop), phase propagation
 * (the heterodyned per-bin rotation of consecutive frames), identity phase
 * locking (the synthesis phases of a peak's region follow the peak's
 * rotation, the bins keep their own analysis offset), synthesis (the
 * inverse frames placed on the synthesis hop, the ola normalised by the
 * squared-window sum). Deterministic and total: the same samples and ratio
 * answer the same bytes; silence stretches to silence; the output length
 * is round(ratio · input length).
 *
 * @param mono the input samples (any level, any rate — the window law rides
 *   samples, never hz).
 * @param ratio the stretch factor: the output's timeline over the input's
 *   (2 = twice as long, 0.5 = half as long, 1 = the identity pass).
 * @returns the stretched samples, length round(ratio · mono.length).
 * @throws StretchError empty-signal when nothing rides the input,
 *   bad-ratio when the ratio is not a finite number inside the band
 *   0.25..2 (the honest refusal, never a silent clamp).
 */
export function stretchPcm(mono: Float32Array, ratio: number): Float32Array {
  if (!(mono.length > 0)) throw new StretchError("empty-signal", "the stretch needs samples — nothing rides the input");
  if (!Number.isFinite(ratio) || ratio < STRETCH_RATIO_MIN || ratio > STRETCH_RATIO_MAX)
    throw new StretchError(
      "bad-ratio",
      `the stretch ratio ${String(ratio)} sits outside the honest band ${STRETCH_RATIO_MIN}..${STRETCH_RATIO_MAX}`,
    );

  const size = FFT_SIZE;
  const hop = HOP_SIZE;
  const half = size / 2 + 1;
  const synthesisHop = hop * ratio;
  const outputLength = Math.round(mono.length * ratio);
  // the frame count covers the input grid and the output grid: the input
  // needs a frame per hop until its last sample sits inside a window, the
  // stretched output needs frames until its last sample sits inside a
  // synthesis window (the tail frames read the zero padding past the end)
  const inputFrames = 1 + Math.max(0, Math.ceil((mono.length - size) / hop));
  const outputFrames = 1 + Math.max(0, Math.ceil((outputLength - size) / synthesisHop));
  const frames = analyze(mono, Math.max(inputFrames, outputFrames));
  const out = new Float64Array(outputLength + size);
  const norm = new Float64Array(outputLength + size);
  // the phase seats: the per-bin advance of the analysis timeline (the
  // expected rotation of one hop at the bin's centre frequency) and the
  // running synthesis phase
  const advance = new Float64Array(half);
  for (let b = 0; b < half; b++) advance[b] = (2 * Math.PI * b * hop) / size;
  let synthPhase = Float64Array.from(frames[0]?.phase ?? new Float64Array(half));

  const re = new Array<number>(size).fill(0);
  const im = new Array<number>(size).fill(0);
  for (let k = 0; k < frames.length; k++) {
    const frame = frames[k] as AnalysisFrame;
    if (k > 0) {
      const previous = frames[k - 1] as AnalysisFrame;
      const raw = new Float64Array(half);
      for (let b = 0; b < half; b++) {
        // the heterodyned instantaneous-frequency rotation: the measured
        // phase difference minus the expected advance, wrapped, then the
        // advance restored — the answer is the analysis timeline's true
        // per-hop rotation estimated inside the bin's neighbourhood. the
        // synthesis timeline advances by the SAME rotation scaled by the
        // ratio (the hop it lands on is Ha·ratio wide: a stretch moves the
        // frames, never the frequency — the Portnoff phase-advance law)
        const delta = princarg(frame.phase[b] - previous.phase[b] - advance[b]);
        raw[b] = synthPhase[b] + (advance[b] + delta) * ratio;
      }
      // the identity phase locking: the rotation of each region's peak owns
      // the region — the bins of a peak keep the peak's rotation plus
      // their own analysis offset, so the peak's skirt moves as one voice
      // instead of wrapping apart (the classic phasiness fix)
      const peaks = peaksOf(frame.mag);
      const owner = peakRegions(peaks, half);
      const locked = new Float64Array(half);
      for (let b = 0; b < half; b++) {
        const peakBin = owner[b] ?? b;
        const rotation = princarg((raw[peakBin] ?? 0) - (frame.phase[peakBin] ?? 0));
        locked[b] = rotation + (frame.phase[b] ?? 0);
      }
      synthPhase = locked;
    }
    // the synthesis frame: the analysis magnitudes over the synthesis
    // phases, hermitian mirror, the inverse riding the forward transform
    // (conj(fft(conj(X))) = N·x — the same istft trick hpss rides)
    re.fill(0);
    im.fill(0);
    for (let b = 0; b < half; b++) {
      const magnitude = frame.mag[b];
      const angle = synthPhase[b] ?? 0;
      // the conjugate spectrum goes in — the inverse rides the forward
      // transform (conj(fft(conj(X))) = N·x, the same istft trick hpss
      // rides: the real part of the answer is the frame itself)
      re[b] = magnitude * Math.cos(angle);
      im[b] = -magnitude * Math.sin(angle);
      if (b > 0 && b < size / 2) {
        re[size - b] = re[b] ?? 0;
        im[size - b] = -(im[b] ?? 0);
      }
    }
    fftInPlace(re, im);
    const start = Math.round(k * synthesisHop);
    const scale = 1 / size;
    for (let i = 0; i < size; i++) {
      const at = start + i;
      if (at >= out.length) break;
      out[at] += (re[i] ?? 0) * scale * HANN_TABLE[i];
      norm[at] += HANN_TABLE[i] * HANN_TABLE[i];
    }
  }
  const result = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    // the ola divides only where the window sum is healthy (the hpss edge
    // law — the grid's head and tail keep the attenuated sum, a millisecond
    // fade instead of an amplified edge)
    result[i] = norm[i] > 1e-2 ? (out[i] ?? 0) / norm[i] : 0;
  }
  return result;
}


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: limiter.ts — the true-peak limiter (the mastering margin law, the katexis mastering table import). */
/* ══════════════════════════════════════════════════════════════════════ */

// # limiter — the true-peak limiter of the render lane (root layer): the
// mastering ceiling the bounce answers. a classic lookahead limiter whose
// sidechain measures the inter-sample peak through a 4× polyphase fir
// oversampler (the itu-r bs.1770-4 class of anti-imaging filters a true-peak
// meter rides), so the wav that leaves the render worker honours the −1 dbtp
// law the mastering spec pins (katexis MASTERING.truePeakDbtp — the number
// the stage card promises and the loudness lane judges). the walk is the
// textbook two-gain law: the demand lane (every sample answers the gain its
// oversampled peak asks), the sloped lookahead window (the gain must reach
// every demand inside the lookahead span, descending at most 1/lookahead per
// sample — the offline form of the delay-line lookahead: a streaming desk
// limiter would ride the same law through a ring buffer), and the linear
// release on top (the gain climbs back to unity at 1/release per sample).
// the honest bounds, measured over the adversarial grid the tests pin: the
// output's sample peak lands exactly at the sidechain aim (ceiling minus the
// process margin), the output's true peak under this module's own 4× yard
// stays at least 0.05 db under the promised ceiling for every physically
// plausible input — sines at every frequency, phase and level, bursts,
// steps, squares and noise, hot up to 18 db over the ceiling, cold starts
// included. the one corner outside the law, documented never hidden: an
// instantaneous full-scale nyquist alternation from absolute digital
// silence (content whose bandlimited reconstruction is not defined) can
// overshoot by ~0.1 db — no render the engine composes contains it, and the
// house does not pretend otherwise. why this file owns its own oversampler
// instead of reusing loudness.ts's truePeakDb: that meter is a
// linear-interpolation estimate — a straight line between two samples never
// exceeds its endpoints, so its "true peak" is mathematically the sample
// peak (its own header disclaims the estimate honestly). a limiter riding it
// would be a sample-peak limiter wearing a true-peak badge, and the house
// never fakes a number: inter-sample peaks need a real reconstruction
// filter, so the windowed-sinc polyphase lives here. pure math, zero
// dependencies beyond the mastering spec, zero storage — deterministic: the
// same samples answer the same bytes on every machine, the law the render
// lane's byte-stability rides.


/** The oversampling factor of the true-peak sidechain (4× — the bs.1770-4
 * class: four sub-sample positions per input sample). */
export const TRUEPEAK_OVERSAMPLING = 4;

/** The lookahead window in seconds — the span the gain descent may use
 * (5 ms: the attack ramp a ceiling this tight rides). */
export const LIMITER_LOOKAHEAD_S = 0.005;

/** The release window in seconds — the span the gain climb back to unity
 * may take (50 ms: fast enough for the groove, slow enough to stay
 * inaudible). */
export const LIMITER_RELEASE_S = 0.05;

/** The process margin under the ceiling, in db: the sidechain aims this far
 * below the promised ceiling because the gain modulation across the
 * oversampler's 13-tap window can smear the limit by a fraction of a db —
 * the measured worst case over the adversarial grid sits 0.05 db under the
 * promise with this margin riding (the tests pin it). the honest
 * engineering practice every true-peak limiter carries. */
export const LIMITER_MARGIN_DB = 0.1;

/** The options the limiter accepts — every seat carries the house default
 * (the mastering spec's ceiling, the lookahead and release above). */
export interface LimiterOptions {
  /** The ceiling in dbtp (default MASTERING.truePeakDbtp, the −1 the spec
   * pins — the promise the stage card makes). */
  ceilingDbtp?: number;
  /** The lookahead window in seconds (default 5 ms). */
  lookaheadSeconds?: number;
  /** The release window in seconds (default 50 ms). */
  releaseSeconds?: number;
}

/** The taps of the longest polyphase branch (the prototype is
 * 4·12 + 1 taps: the centre tap lands on branch 0, so one branch owns 13
 * taps and the other three own 12). */
const TAPS_PER_PHASE = 13;

/** The prototype length: 49 taps, odd so the centre tap is real and branch
 * 0 reconstructs the input at unity (each branch answers a quarter-sample
 * fractional delay — together the four branches sample the bandlimited
 * wave at four sub-sample positions per input sample). */
const PROTOTYPE_LENGTH = TRUEPEAK_OVERSAMPLING * (TAPS_PER_PHASE - 1) + 1;

/** The group delay of the oversampler's branches, in input samples: the
 * branch taps read the input around 6 samples back (the prototype's centre
 * over the oversampling factor), so a peak measured at sidechain index j
 * is the peak that lands on the output at j − 6 — the demand lane is
 * shifted by exactly this delay before the lookahead window rides it, the
 * alignment without which a hot transient slips through at a gain the
 * descent had not finished (the classic lookahead/oversampler alignment
 * law). */
const OVERSAMPLER_DELAY_SAMPLES = (PROTOTYPE_LENGTH - 1) / (2 * TRUEPEAK_OVERSAMPLING);

/** The prototype taps (hann-windowed sinc at the quarter-band cutoff,
 * normalised so every branch sums to unity at dc), built once at module
 * load — pure math, deterministic. */
const PROTOTYPE = buildPrototype();

/**
 * Builds the polyphase prototype: a hann-windowed sinc with the cutoff at
 * the baseband edge of the 4× timeline (fs/2), scaled so the whole
 * prototype sums to the oversampling factor — the zero-stuffing law (every
 * branch of the polyphase then answers unity at dc, the four sub-sample
 * positions all reconstruct the same wave).
 *
 * @returns the frozen prototype taps, length 49.
 */
function buildPrototype(): Float64Array {
  const centre = (PROTOTYPE_LENGTH - 1) / 2;
  const taps = new Float64Array(PROTOTYPE_LENGTH);
  let sum = 0;
  for (let i = 0; i < PROTOTYPE_LENGTH; i++) {
    const offset = (i - centre) / TRUEPEAK_OVERSAMPLING;
    // the ideal lowpass at the quarter band: sinc(u) with sinc(0) = 1
    const sinc = offset === 0 ? 1 : Math.sin(Math.PI * offset) / (Math.PI * offset);
    const hann = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (PROTOTYPE_LENGTH - 1));
    taps[i] = sinc * hann;
    sum += taps[i];
  }
  const dcGain = TRUEPEAK_OVERSAMPLING / sum;
  for (let i = 0; i < PROTOTYPE_LENGTH; i++) taps[i] *= dcGain;
  return taps;
}

/** The polyphase branches: branch p holds the prototype taps at indices
 * p, p+4, p+8, … — branch p applied to the input history answers the
 * bandlimited wave at one of the four sub-sample positions. */
const BRANCHES: readonly Float64Array[] = Array.from({ length: TRUEPEAK_OVERSAMPLING }, (_, phase) => {
  const taps: number[] = [];
  for (let index = phase; index < PROTOTYPE_LENGTH; index += TRUEPEAK_OVERSAMPLING) taps.push(PROTOTYPE[index]);
  return Float64Array.from(taps);
});

/**
 * The 4× polyphase oversampler of the true-peak sidechain: a ring of the
 * last 13 inputs and four fir branches over it. the branch outputs answer
 * the bandlimited wave at the four sub-sample positions; the raw sample
 * rides beside them at the call sites — the sample peak is a floor of the
 * true peak (the bandlimited wave passes through its samples), and the
 * demand lane folds it at its own zero-delay alignment.
 */
class Oversampler {
  private readonly history = new Float64Array(TAPS_PER_PHASE);
  private write = 0;

  /**
   * Feeds one input sample and answers the oversampled peak around it:
   * the max absolute branch output (the raw sample is the caller's fold).
   *
   * @param x the input sample.
   * @returns the branch peak at this sample's sub-sample positions.
   */
  peakAt(x: number): number {
    this.history[this.write] = x;
    let peak = 0;
    for (const branch of BRANCHES) {
      let acc = 0;
      let read = this.write;
      for (let j = 0; j < branch.length; j++) {
        acc += branch[j] * this.history[read];
        read = read === 0 ? this.history.length - 1 : read - 1;
      }
      const magnitude = Math.abs(acc);
      if (magnitude > peak) peak = magnitude;
    }
    this.write = (this.write + 1) % this.history.length;
    return peak;
  }
}

/**
 * Measures the true peak of a signal under the limiter's own 4×
 * windowed-sinc law — the linear-domain peak (1.0 = 0 dbtp). this is the
 * honest yard the limiting guarantee and its tests read: the same taps the
 * sidechain rides, run over a whole block. (loudness.ts's truePeakDb stays
 * the linear-interpolation estimate its header disclaims — the two laws
 * are documented apart, never confused.)
 *
 * @param samples the signal to measure (mono).
 * @returns the oversampled peak, 0 for empty input.
 */
export function truePeakLinear(samples: Float32Array | readonly number[]): number {
  const bank = new Oversampler();
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    // the raw sample rides beside the branches — the bandlimited wave
    // passes through its samples, so the honest yard reads both
    const value = Math.max(Math.abs(samples[i]), bank.peakAt(samples[i]));
    if (value > peak) peak = value;
  }
  return peak;
}

/**
 * Limits a signal to the true-peak ceiling — the mastering close of the
 * render lane. the walk, deterministic and pure:
 *
 * 1. the demand lane: every output index answers the gain its peak asks
 *    (ceiling / peak, unity when the peak sits under the ceiling already)
 *    — the raw sample folds at the index it lands on (zero delay, the
 *    sample-peak law holds exactly), the oversampled branches fold at the
 *    oversampler's group delay (their sub-sample positions are the ones
 *    the output index carries);
 * 2. the sloped lookahead: the gain envelope at m must be low enough that,
 *    climbing at most 1/lookahead per sample, it reaches every demand
 *    inside [m, m + lookahead] — the windowed minimum of demand + slope,
 *    the offline form of the delay-line lookahead (the gain descends
 *    before the peak arrives, never after);
 * 3. the linear release: the envelope may climb back at most 1/release per
 *    sample, so the recovery spans the release window.
 *
 * the output length equals the input length — the lookahead is compensated
 * (the descent happens in the samples before the peak, which is the whole
 * point of the lookahead). silence passes untouched (a demand of unity
 * holds the envelope at unity: zero times one is zero, bit-exact).
 *
 * @param samples the linear master mix (mono, any level — the mix may ride
 *   hot, the ceiling is the law).
 * @param sampleRate the rate of the mix (the lookahead and release windows
 *   scale with it).
 * @param options the ceiling, lookahead and release seats (house defaults).
 * @returns the limited mix, the same length, never above the ceiling.
 */
export function limitTruePeak(samples: Float32Array, sampleRate: number, options: LimiterOptions = {}): Float32Array {
  const count = samples.length;
  const out = new Float32Array(count);
  if (count === 0) return out;
  if (!(sampleRate > 0)) return out;

  const lookahead = Math.max(1, Math.round((options.lookaheadSeconds ?? LIMITER_LOOKAHEAD_S) * sampleRate));
  const releaseSamples = Math.max(1, Math.round((options.releaseSeconds ?? LIMITER_RELEASE_S) * sampleRate));
  const ceilingDbtp = options.ceilingDbtp ?? MASTERING.truePeakDbtp;
  const ceiling = 10 ** ((ceilingDbtp - LIMITER_MARGIN_DB) / 20);
  const attackSlope = 1 / lookahead;
  const releaseSlope = 1 / releaseSamples;

  // pass 1: the branch peaks — the oversampler walked over the whole mix
  // once (its group delay is compensated in the demand fold below)
  const branchPeaks = new Float64Array(count);
  const bank = new Oversampler();
  for (let i = 0; i < count; i++) branchPeaks[i] = bank.peakAt(samples[i]);

  // pass 2: the sloped lookahead window over the demand + j·attackSlope (a
  // rising demand enters the window at a value it can still reach, so only
  // the slope it must descend at rides the minimum), then the release on
  // top. the demand at output index j folds the raw sample x[j] (zero
  // delay — the sample-peak law holds exactly), the branch peaks measured
  // at sidechain index j + delay (the oversampler's group delay — those
  // branches are the sub-sample positions of the output index j) and the
  // branch peaks at j itself (the fir's own boundary view: at the signal's
  // head the reconstruction rings, and the output's yard reads the same
  // ring at its own head — the fold keeps the guarantee closed at the
  // onset). past the signal's end the branches read silence.
  const windowed = new Float64Array(count + lookahead + 1);
  for (let j = 0; j < windowed.length; j++) {
    const branchAt = j + OVERSAMPLER_DELAY_SAMPLES;
    const peak = Math.max(
      Math.abs(samples[j] ?? 0),
      j < count ? branchPeaks[j] : 0,
      branchAt < count ? branchPeaks[branchAt] : 0,
    );
    const asked = peak > ceiling ? ceiling / peak : 1;
    windowed[j] = asked + j * attackSlope;
  }

  // the sliding-window minimum rides a monotonic deque (indices, values
  // ascending) — one push and one pop per sample, the lookahead window of
  // a whole take stays linear.
  const deque = new Int32Array(windowed.length);
  let head = 0;
  let tail = 0;
  const push = (index: number): void => {
    while (head < tail && windowed[deque[tail - 1]] >= windowed[index]) tail -= 1;
    deque[tail] = index;
    tail += 1;
  };
  for (let j = 0; j <= lookahead; j++) push(j);

  let envelope = 1;
  for (let m = 0; m < count; m++) {
    if (m > 0) push(m + lookahead);
    while (deque[head] < m) head += 1;
    const target = windowed[deque[head]] - m * attackSlope;
    envelope = Math.min(target, envelope + releaseSlope);
    if (envelope > 1) envelope = 1;
    out[m] = samples[m] * envelope;
  }
  return out;
}


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: loudness.ts — the itu-r bs.1770 loudness engine (the k-weighting, the gating blocks, the range and peak meters — zero imports, pure dsp). */
/* ══════════════════════════════════════════════════════════════════════ */

// # loudness — the loudness metering and normalisation of debonair (root
// layer): K-weighting, momentary/short-term/integrated loudness with the
// two-stage gate, loudness range and true peak, plus the gain that lands a
// programme on a target. The clean-room pattern is absorbed from filmcraft's
// audio-dsp/loudness.rs (ITU-R BS.1770-4 / EBU R128 metering: the two
// K-weight stages derived from their analog prototypes through the bilinear
// transform, 400 ms gating blocks with 75 % overlap, exact energy sums, LRA
// percentiles) — re-derived here in pure TypeScript. The power domain owns
// its own math (10·log10 of mean square): mixergraph's dB helpers are
// amplitude-domain and are not reused. Non-goals: no certified ITU true-peak
// oversampler (the 4× estimate here is linear — katexis owns DSP quality),
// no playback, no decode. Pure and multi-mode — browser and node alike.

/** The machine readable failure codes of the loudness logic. */
export type LoudnessErrorCode = "bad-samplerate" | "bad-params" | "empty-signal";

/** The typed result every fallible loudness call answers with (errors by return). */
export type LoudnessResult<T> = { ok: true; value: T } | { ok: false; code: LoudnessErrorCode; message: string };

/** One second-order filter section (Direct Form I coefficients). */
export interface KCoeffs {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

/** The carried filter memory of one biquad (for streaming blocks). */
export interface BiquadState {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

/** The summary a full measurement answers. */
export interface LoudnessReport {
  /** The integrated loudness in LUFS (−Infinity for silence). */
  integrated: number;
  /** The loudness range in LU (EBU Tech 3342). */
  lra: number;
  /** The approximate true peak in dBTP. */
  truepeakdb: number;
  /** The sample peak in dBFS. */
  samplepeakdb: number;
}

/** The gate floor of the integrated loudness, in LUFS. */
export const ABSOLUTEGATE = -70;

/** The relative gate of the integrated loudness, in LU under the ungated level. */
export const RELATIVEGATE = 10;

/** Fails a fallible call with one machine readable code. */
function fail<T>(code: LoudnessErrorCode, message: string): LoudnessResult<T> {
  return { ok: false, code, message };
}

/** The loudness of a channel-weighted mean square, in LUFS. */
export function energyToLufs(meansquare: number): number {
  return meansquare <= 0 ? Number.NEGATIVE_INFINITY : -0.691 + 10 * Math.log10(meansquare);
}

/** The mean square a LUFS value stands for (the inverse of energyToLufs). */
export function lufsToEnergy(lufs: number): number {
  return Number.isFinite(lufs) ? 10 ** ((lufs + 0.691) / 10) : 0;
}

/** BS.1770 stage 1: the high-shelf "head" pre-filter for a sample rate. */
export function kShelfCoefficients(samplerate: number): KCoeffs {
  const f0 = 1681.974450955533;
  const q = 0.7071752369554196;
  const gaindb = 3.999843853973347;
  const k = Math.tan((Math.PI * f0) / samplerate);
  const vh = 10 ** (gaindb / 20);
  const vb = vh ** 0.4996667741545416;
  const a0 = 1 + k / q + k * k;
  return {
    b0: (vh + (vb * k) / q + k * k) / a0,
    b1: (2 * (k * k - vh)) / a0,
    b2: (vh - (vb * k) / q + k * k) / a0,
    a1: (2 * (k * k - 1)) / a0,
    a2: (1 - k / q + k * k) / a0,
  };
}

/** BS.1770 stage 2: the RLB high-pass for a sample rate. */
export function kHighpassCoefficients(samplerate: number): KCoeffs {
  const f0 = 38.13547087602444;
  const q = 0.5003270373238773;
  const k = Math.tan((Math.PI * f0) / samplerate);
  const a0 = 1 + k / q + k * k;
  return { b0: 1 / a0, b1: -2 / a0, b2: 1 / a0, a1: (2 * (k * k - 1)) / a0, a2: (1 - k / q + k * k) / a0 };
}

/** Filters one block with a biquad, carrying the state (Direct Form I). */
export function biquadFilter(
  coeffs: KCoeffs,
  samples: readonly number[],
  state: BiquadState = { x1: 0, x2: 0, y1: 0, y2: 0 },
): { filtered: number[]; state: BiquadState } {
  const filtered = new Array<number>(samples.length);
  let { x1, x2, y1, y2 } = state;
  for (let i = 0; i < samples.length; i++) {
    const x0 = samples[i];
    const y0 = coeffs.b0 * x0 + coeffs.b1 * x1 + coeffs.b2 * x2 - coeffs.a1 * y1 - coeffs.a2 * y2;
    filtered[i] = y0;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
  }
  return { filtered, state: { x1, x2, y1, y2 } };
}

/** The BS.1770 channel weights (L R C LFE Ls Rs Lb Rb — the LFE counts 0). */
export function channelWeights(channels: number): number[] {
  const table = [1, 1, 1, 0, 1.41, 1.41, 1.41, 1.41];
  return Array.from({ length: Math.max(1, channels) }, (_, i) => table[i] ?? 1);
}

/** K-weights one channel (both stages in series). */
export function kWeightChannel(samples: readonly number[], samplerate: number): number[] {
  const shelf = biquadFilter(kShelfCoefficients(samplerate), samples);
  return biquadFilter(kHighpassCoefficients(samplerate), shelf.filtered).filtered;
}

/**
 * The channel-weighted mean square of a whole programme (the K-filtered sum
 * of squares over the channel weights, normalised by the sample count).
 */
export function weightedMeanSquare(channels: readonly number[][], samplerate: number): number {
  if (channels.length === 0) return 0;
  const weights = channelWeights(channels.length);
  let acc = 0;
  for (let c = 0; c < channels.length; c++) {
    const weighted = kWeightChannel(channels[c], samplerate);
    let sum = 0;
    for (const v of weighted) sum += v * v;
    acc += weights[c] * (sum / weighted.length);
  }
  return acc / channels.length;
}

/** The gating blocks: 400 ms windows of weighted mean square, every 100 ms. */
export function gatingBlocks(channels: readonly number[][], samplerate: number): number[] {
  if (channels.length === 0 || !(samplerate > 0)) return [];
  const len = Math.min(...channels.map((c) => c.length));
  const block = Math.round(0.4 * samplerate);
  const hop = Math.round(0.1 * samplerate);
  if (len < block) return [];
  const weights = channelWeights(channels.length);
  const prefix = channels.map((channel) => {
    const weighted = kWeightChannel(channel, samplerate);
    const pre = new Array<number>(weighted.length + 1).fill(0);
    for (let i = 0; i < weighted.length; i++) pre[i + 1] = pre[i] + weighted[i] * weighted[i];
    return pre;
  });
  const blocks: number[] = [];
  for (let start = 0; start + block <= len; start += hop) {
    let acc = 0;
    for (let c = 0; c < channels.length; c++) acc += weights[c] * (prefix[c][start + block] - prefix[c][start]);
    blocks.push(acc / (channels.length * block));
  }
  return blocks;
}

/**
 * The integrated loudness of a block series: the two-stage gate keeps blocks
 * above the absolute floor, then above 10 LU under the interim level, and
 * answers the energy mean of the survivors (−Infinity for silence).
 */
export function integratedLoudness(blocks: readonly number[]): number {
  const above = blocks.filter((b) => energyToLufs(b) > ABSOLUTEGATE);
  if (above.length === 0) return Number.NEGATIVE_INFINITY;
  const interim = energyToLufs(above.reduce((a, b) => a + b, 0) / above.length);
  const survivors = above.filter((b) => energyToLufs(b) > interim - RELATIVEGATE);
  if (survivors.length === 0) return interim;
  return energyToLufs(survivors.reduce((a, b) => a + b, 0) / survivors.length);
}

/**
 * A loudness series over fixed windows (momentary = 0.4 s, short-term = 3 s)
 * answered in LUFS per 100 ms hop.
 */
export function loudnessSeries(channels: readonly number[][], samplerate: number, windowseconds: number): number[] {
  if (channels.length === 0 || !(samplerate > 0)) return [];
  const len = Math.min(...channels.map((c) => c.length));
  const window = Math.round(windowseconds * samplerate);
  const hop = Math.round(0.1 * samplerate);
  if (len < window) return [];
  const weights = channelWeights(channels.length);
  const prefix = channels.map((channel) => {
    const weighted = kWeightChannel(channel, samplerate);
    const pre = new Array<number>(weighted.length + 1).fill(0);
    for (let i = 0; i < weighted.length; i++) pre[i + 1] = pre[i] + weighted[i] * weighted[i];
    return pre;
  });
  const series: number[] = [];
  for (let start = 0; start + window <= len; start += hop) {
    let acc = 0;
    for (let c = 0; c < channels.length; c++) acc += weights[c] * (prefix[c][start + window] - prefix[c][start]);
    series.push(energyToLufs(acc / (channels.length * window)));
  }
  return series;
}

/** The p-quantile of a sorted series with linear interpolation (EBU 3342 style). */
export function percentile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return Number.NaN;
  const position = (p / 100) * (sorted.length - 1);
  const low = Math.floor(position);
  const high = Math.ceil(position);
  return low === high ? sorted[low] : sorted[low] + (sorted[high] - sorted[low]) * (position - low);
}

/**
 * The loudness range of a short-term series: the series is gated at the
 * absolute floor and 20 LU under its mean, then LRA is the 95th minus the
 * 10th percentile (EBU Tech 3342).
 */
export function loudnessRange(shortterm: readonly number[]): number {
  const above = shortterm.filter((l) => Number.isFinite(l) && l > ABSOLUTEGATE);
  if (above.length === 0) return 0;
  const mean = above.reduce((a, b) => a + b, 0) / above.length;
  const survivors = above.filter((l) => l > mean - 20).sort((a, b) => a - b);
  if (survivors.length === 0) return 0;
  return percentile(survivors, 95) - percentile(survivors, 10);
}

/** The sample peak in dBFS (−Infinity for silence). */
export function samplePeakDb(samples: readonly number[]): number {
  let peak = 0;
  for (const v of samples) peak = Math.max(peak, Math.abs(v));
  return peak === 0 ? Number.NEGATIVE_INFINITY : 20 * Math.log10(peak);
}

/**
 * The approximate true peak in dBTP: the signal is read at 4× the sample
 * rate through linear interpolation and the peak is referred to full scale.
 * This is an estimate — a certified polyphase oversampler stays in katexis.
 */
export function truePeakDb(samples: readonly number[]): number {
  let peak = 0;
  for (let i = 0; i < samples.length - 1; i++) {
    for (let k = 0; k < 4; k++) peak = Math.max(peak, Math.abs(samples[i] + ((samples[i + 1] - samples[i]) * k) / 4));
  }
  if (samples.length > 0) peak = Math.max(peak, Math.abs(samples[samples.length - 1]));
  return peak === 0 ? Number.NEGATIVE_INFINITY : 20 * Math.log10(peak);
}

/**
 * The gain that lands a programme on a target: the loudness difference,
 * with positive boosts clamped (EBU R128 never boosts more than +23 LU) and
 * the true-peak ceiling respected when a dBTP limit is given.
 */
export function gainToTarget(
  lufs: number,
  targetlufs: number,
  maxboostdb = 23,
  truepeakceiling = -1,
  currenttruepeakdb = Number.NEGATIVE_INFINITY,
): number {
  const gain = targetlufs - lufs;
  const boosted = Math.min(gain, Number.isFinite(lufs) ? maxboostdb : 0);
  const headroom = truepeakceiling - currenttruepeakdb;
  return Number.isFinite(headroom) ? Math.min(boosted, headroom) : boosted;
}

/** Applies a gain to a block of samples (the render step of normalisation). */
export function applyGain(samples: readonly number[], gaindb: number): number[] {
  const linear = 10 ** (gaindb / 20);
  return samples.map((v) => v * linear);
}

/**
 * The full offline measurement of a programme: integrated loudness, LRA,
 * true and sample peak. Codes: `bad-samplerate`, `empty-signal`.
 */
export function analyzeLoudness(channels: readonly number[][], samplerate: number): LoudnessResult<LoudnessReport> {
  if (!(samplerate > 0)) return fail("bad-samplerate", "the sample rate must be positive");
  const len = Math.min(...channels.map((c) => c.length));
  if (channels.length === 0 || len === 0) return fail("empty-signal", "the programme has no samples");
  const mono = channels[0];
  return {
    ok: true,
    value: {
      integrated: integratedLoudness(gatingBlocks(channels, samplerate)),
      lra: loudnessRange(loudnessSeries(channels, samplerate, 3)),
      truepeakdb: truePeakDb(mono),
      samplepeakdb: samplePeakDb(mono),
    },
  };
}


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: ducking.ts — the sidechain ducking engine (the follower law, the mixer graph conversion imports). */
/* ══════════════════════════════════════════════════════════════════════ */

// # ducking — the sidechain ducking logic of debonair (root layer): level
// envelopes, activity regions, the per-sample compressor gain (threshold,
// ratio, soft knee, attack, release, hold) and the volume keyframes an
// offline auto-duck renders into a music clip. The clean-room pattern is
// absorbed from filmcraft's audio-dsp/ducking.rs (RMS envelope over prefix
// sums, activity with blip removal and gap bridging, keyframes with merged
// ramps) with the classic desk compressor curve. It is the processing par of
// mixergraph — the dB conversion is imported from there, never duplicated.
// Non-goals: no routing, no buses, no playback, no audio decode. Pure and
// multi-mode — the same call runs in the browser and in node (the unit tests).


/** The machine readable failure codes of the ducking logic. */
export type DuckingErrorCode = "bad-params" | "bad-samplerate" | "empty-signal";

/** The typed result every fallible ducking call answers with (errors by return). */
export type DuckingResult<T> = { ok: true; value: T } | { ok: false; code: DuckingErrorCode; message: string };

/** The compressor parameters of a ducking processor. */
export interface DuckingParams {
  /** The level (dBFS) above which the duck engages. */
  thresholddb: number;
  /** The compression ratio above the threshold (>= 1). */
  ratio: number;
  /** The soft-knee width in dB (0 = hard knee). */
  kneedb: number;
  /** The attack time in seconds (level rise onto the gain reduction). */
  attackseconds: number;
  /** The release time in seconds (the gain coming back). */
  releaseseconds: number;
  /** The hold time in seconds before the release may start. */
  holdseconds: number;
}

/** One span of trigger activity, in seconds. */
export interface DuckingRegion {
  /** The region start in seconds (>= 0). */
  start: number;
  /** The region end in seconds (> start). */
  end: number;
}

/** The running state of the per-sample envelope follower. */
export interface FollowerState {
  /** The follower level as a linear amplitude. */
  level: number;
  /** The remaining hold samples before the release may start. */
  holdremaining: number;
  /** The last gain the follower answered, in dB. */
  gaindb: number;
}

/** The level floor (dBFS) silence reads as. */
export const FLOORDB = -120;

/** The empty follower state. */
export function followerInitial(): FollowerState {
  return { level: 0, holdremaining: 0, gaindb: 0 };
}

/** Fails a fallible call with one machine readable code. */
function failDuck<T>(code: DuckingErrorCode, message: string): DuckingResult<T> {
  return { ok: false, code, message };
}

/** Validates the compressor parameters and the sample rate. */
export function validateDucking(params: DuckingParams, samplerate: number): DuckingResult<number> {
  if (!(samplerate > 0)) return failDuck("bad-samplerate", "the sample rate must be positive");
  if (!Number.isFinite(params.thresholddb) || params.thresholddb > 0)
    return failDuck("bad-params", "the threshold must be finite and at or below 0 dBFS");
  if (!(params.ratio >= 1)) return failDuck("bad-params", "the ratio must be 1 or above");
  if (params.kneedb < 0 || params.attackseconds < 0 || params.releaseseconds < 0 || params.holdseconds < 0)
    return failDuck("bad-params", "knee, attack, release and hold must be non negative");
  return { ok: true, value: 0 };
}

/** The Essential-Sound style sensitivity (0..10) → detection threshold in dBFS. */
export function sensitivityToThreshold(sensitivity: number): number {
  return -20 - 4 * Math.max(0, Math.min(10, sensitivity));
}

/**
 * RMS level (dBFS) per hop: entry `k` is the RMS of the window centred on
 * `k · hop` (clipped at the edges), power averaged over the given channels;
 * silence reads as `FLOORDB`.
 */
export function rmsEnvelopeDb(
  channels: ReadonlyArray<readonly number[]>,
  samplerate: number,
  hopseconds: number,
  windowseconds: number,
): number[] {
  const len = channels.length > 0 ? Math.min(...channels.map((c) => c.length)) : 0;
  if (len === 0) return [];
  const hop = Math.max(1, Math.round(hopseconds * samplerate));
  const half = Math.max(1, Math.round((windowseconds * samplerate) / 2));
  const prefix = new Array<number>(len + 1).fill(0);
  for (let i = 0; i < len; i++) {
    let acc = 0;
    for (const channel of channels) acc += channel[i] * channel[i];
    prefix[i + 1] = prefix[i] + acc / channels.length;
  }
  const out: number[] = [];
  for (let k = 0; k * hop < len; k++) {
    const a = Math.max(0, k * hop - half);
    const b = Math.min(len, k * hop + half);
    const ms = Math.max(0, prefix[b] - prefix[a]) / Math.max(1, b - a);
    out.push(ms <= 1e-12 ? FLOORDB : Math.max(FLOORDB, 10 * Math.log10(ms)));
  }
  return out;
}

/** The regions where the envelope exceeds the threshold, gaps shorter than `bridgeseconds` merged and spans shorter than `minonseconds` dropped. */
export function activityRegions(
  envelopedb: readonly number[],
  hopseconds: number,
  thresholddb: number,
  minonseconds: number,
  bridgeseconds: number,
): DuckingRegion[] {
  const raw: DuckingRegion[] = [];
  let start = -1;
  for (let k = 0; k <= envelopedb.length; k++) {
    const on = k < envelopedb.length && envelopedb[k] > thresholddb;
    if (on && start < 0) start = k;
    if (!on && start >= 0) {
      raw.push({ start: start * hopseconds, end: k * hopseconds });
      start = -1;
    }
  }
  const merged: DuckingRegion[] = [];
  for (const region of raw) {
    const last = merged[merged.length - 1];
    if (last && region.start - last.end < bridgeseconds - 1e-9) last.end = region.end;
    else merged.push({ start: region.start, end: region.end });
  }
  return merged.filter((r) => r.end - r.start >= minonseconds - 1e-9);
}

/** Unions overlapping or touching regions (sorted by start). */
export function mergeRegions(regions: readonly DuckingRegion[]): DuckingRegion[] {
  const sorted = [...regions].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: DuckingRegion[] = [];
  for (const region of sorted) {
    const last = out[out.length - 1];
    if (last && region.start <= last.end) last.end = Math.max(last.end, region.end);
    else out.push({ start: region.start, end: region.end });
  }
  return out;
}

/** The region containing a time, or null when the time sits in open air. */
export function regionAt(regions: readonly DuckingRegion[], time: number): DuckingRegion | null {
  for (const region of regions) if (time >= region.start && time < region.end) return region;
  return null;
}

/** The total ducked time of a region set, in seconds. */
export function totalDuckTime(regions: readonly DuckingRegion[]): number {
  return regions.reduce((a, r) => a + Math.max(0, r.end - r.start), 0);
}

/**
 * The static compressor curve: the gain (dB) a level receives. Below the
 * knee nothing happens, inside the knee a quadratic ramp takes over, above
 * it the reduction grows with `1 - 1/ratio` per dB of overshoot.
 */
export function staticGainDb(leveldb: number, thresholddb: number, ratio: number, kneedb: number): number {
  const over = leveldb - thresholddb;
  const slope = 1 - 1 / Math.max(1, ratio);
  if (kneedb <= 0 || over <= -kneedb / 2) return over >= 0 ? -slope * over : 0;
  if (over >= kneedb / 2) return -slope * over;
  const knee = over + kneedb / 2;
  return (-slope * knee * knee) / (2 * kneedb);
}

/** The per-sample one-pole smoothing coefficient of an attack or release time. */
export function smoothingCoefficient(seconds: number, samplerate: number): number {
  if (!(seconds > 0) || !(samplerate > 0)) return 1;
  return Math.exp(-1 / (seconds * samplerate));
}

/**
 * Advances the envelope follower by one sample: the level rises through the
 * attack coefficient, holds for `holdseconds` and falls through the release
 * coefficient; the gain is the static curve applied to the level.
 */
export function followerStep(
  state: FollowerState,
  sample: number,
  params: DuckingParams,
  samplerate: number,
): FollowerState {
  const magnitude = Math.abs(sample);
  let level = state.level;
  let holdremaining = state.holdremaining;
  if (magnitude > level) {
    level += (1 - smoothingCoefficient(params.attackseconds, samplerate)) * (magnitude - level);
    holdremaining = Math.round(params.holdseconds * samplerate);
  } else if (holdremaining > 0) {
    holdremaining--;
  } else {
    level += (1 - smoothingCoefficient(params.releaseseconds, samplerate)) * (magnitude - level);
  }
  const gaindb = staticGainDb(linearToDb(level), params.thresholddb, params.ratio, params.kneedb);
  return { level, holdremaining, gaindb };
}

/**
 * Runs the follower over a whole sidechain block and answers the per-sample
 * gain in dB (0 when open, negative when ducking) — the render-ready curve.
 */
export function followerGainDb(
  sidechain: readonly number[],
  samplerate: number,
  params: DuckingParams,
): DuckingResult<number[]> {
  const valid = validateDucking(params, samplerate);
  if (!valid.ok) return valid;
  if (sidechain.length === 0) return failDuck("empty-signal", "the sidechain is empty");
  let state = followerInitial();
  const gains: number[] = [];
  for (const sample of sidechain) {
    state = followerStep(state, sample, params, samplerate);
    gains.push(state.gaindb);
  }
  return { ok: true, value: gains };
}

/** The per-sample gain in linear amplitude (the mix multiply), or the error. */
export function followerGainLinear(
  sidechain: readonly number[],
  samplerate: number,
  params: DuckingParams,
): DuckingResult<number[]> {
  const gains = followerGainDb(sidechain, samplerate, params);
  return gains.ok ? { ok: true, value: gains.value.map(dbToLinear) } : gains;
}

/**
 * The volume keyframes `(time, level)` that duck by `reducedb` under each
 * region: ramp from `basedb` at `start − fade` down to `basedb − reducedb`
 * at `start`, hold, ramp back up at `end`. Ramps that would overlap are
 * merged (the level stays ducked between the regions) and everything is
 * clamped to the clip; times are strictly increasing, no regions → none.
 */
export function duckKeyframes(
  regions: readonly DuckingRegion[],
  clipstart: number,
  clipend: number,
  basedb: number,
  reducedb: number,
  fadeseconds: number,
): Array<[number, number]> {
  const fade = Math.max(fadeseconds, 1e-3);
  const duckedlevel = basedb - Math.abs(reducedb);
  const clipped = [...regions]
    .filter((r) => r.end > r.start && r.end > clipstart && r.start < clipend)
    .map((r) => ({ start: Math.max(clipstart, r.start), end: Math.min(clipend, r.end) }));
  const sorted = mergeRegions(clipped);
  // the ramps would overlap when the open gap is shorter than the two fades
  const spans: DuckingRegion[] = [];
  for (const region of sorted) {
    const last = spans[spans.length - 1];
    if (last && region.start - last.end < 2 * fade) last.end = region.end;
    else spans.push({ start: region.start, end: region.end });
  }
  if (spans.length === 0) return [];
  const frames: Array<[number, number]> = [];
  let cursor = clipstart;
  let duckedsofar = false;
  for (const span of spans) {
    const dipstart = span.start - fade;
    if (!duckedsofar) {
      const p = dipstart < clipstart ? Math.min(1, (clipstart - dipstart) / fade) : 0;
      frames.push([clipstart, basedb + (duckedlevel - basedb) * p]);
    } else {
      const recovery = Math.min(cursor + fade, clipend);
      const p = (recovery - cursor) / fade;
      frames.push([recovery, duckedlevel + (basedb - duckedlevel) * p]);
    }
    if (dipstart > frames[frames.length - 1][0]) frames.push([dipstart, basedb]);
    frames.push([span.start, duckedlevel]);
    if (span.end < clipend) frames.push([span.end, duckedlevel]);
    cursor = span.end;
    duckedsofar = true;
  }
  const recovery = Math.min(cursor + fade, clipend);
  const p = cursor < clipend ? (recovery - cursor) / fade : 0;
  frames.push([recovery, duckedlevel + (basedb - duckedlevel) * p]);
  return frames.filter(([t], i) => i === 0 || t > frames[i - 1][0]);
}

/** The ducked level (dB) at a time under a keyframe list (edges hold). */
export function levelAtTime(keyframes: ReadonlyArray<[number, number]>, time: number): number {
  if (keyframes.length === 0) return 0;
  if (time <= keyframes[0][0]) return keyframes[0][1];
  for (let i = 1; i < keyframes.length; i++) {
    const [t1, v1] = keyframes[i];
    const [t0, v0] = keyframes[i - 1];
    if (time <= t1) return v0 + ((v1 - v0) * (time - t0)) / Math.max(1e-12, t1 - t0);
  }
  return keyframes[keyframes.length - 1][1];
}

/**
 * The offline auto-duck pipeline: RMS envelope → activity regions under the
 * params threshold (250 ms minimum span, 500 ms bridge). The keyframes of
 * `duckKeyframes` are what the render applies to the music clip.
 */
export function autoDuckRegions(
  sidechain: readonly number[],
  samplerate: number,
  params: DuckingParams,
): DuckingResult<DuckingRegion[]> {
  const valid = validateDucking(params, samplerate);
  if (!valid.ok) return valid;
  if (sidechain.length === 0) return failDuck("empty-signal", "the sidechain is empty");
  const envelope = rmsEnvelopeDb([sidechain], samplerate, 0.01, 0.04);
  return { ok: true, value: activityRegions(envelope, 0.01, params.thresholddb, 0.25, 0.5) };
}


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: stems.ts — the stem planning lane (the manifest law, the arrangement and take type wires beside the katexis mastering table). */
/* ══════════════════════════════════════════════════════════════════════ */

// # stems — the stem planner of the katexis engine (root layer): the take
// schedule partitions by arrangement role into the per-stem bounces the
// export seam writes, one wav per role, plus the manifest that names them
// and the validation that proves nothing was lost on the way. The
// conservation invariant is the whole point: the sum of the stem events
// must equal the schedule total, or the bounce lied. The wav bytes
// themselves come from wavwriter when the UI bounces. Pure and multi-mode —
// zero DOM, zero storage, zero audio.


/** The machine readable failure codes of the stem planner. */
export type StemsErrorCode = "empty-schedule" | "unknown-role" | "bad-order" | "conservation" | "bad-manifest";

/** The typed stems failure, traceable to a machine code. */
export class StemsError extends Error {
  /** Machine readable failure code. */
  readonly code: StemsErrorCode;

  constructor(code: StemsErrorCode, message?: string) {
    super(message ?? `stems ${code}`);
    this.name = "StemsError";
    this.code = code;
  }
}

/** The manifest schema the export surface declares (v1 — the only one this planner writes). */
export const STEMS_SCHEMA_VERSION = "debonair.stems/1";

/** The bounce policy one role carries. */
export interface StemRolePolicy {
  /** The arrangement role the stem carries. */
  role: ArrangerRole;
  /** The channels the bounce renders: drum and bass buses fold to mono for punch, the pad stays stereo. */
  channelkind: "mono" | "stereo";
}

/** The role table — the partition order, the bounce policy, the one place a stem role is named. */
export const STEM_ROLES: readonly StemRolePolicy[] = [
  { role: "drums", channelkind: "mono" },
  { role: "bass", channelkind: "mono" },
  { role: "keys", channelkind: "stereo" },
  { role: "lead", channelkind: "mono" },
];

/**
 * Names the file one stem bounces to (the manifest and the download seam agree on it).
 *
 * @param takeId the stable id of the take.
 * @param role the arrangement role.
 * @returns the file name ("<takeId>-<role>.wav").
 */
export function stemFile(takeId: string, role: ArrangerRole): string {
  return `${takeId}-${role}.wav`;
}

/** One planned stem: the events of one role plus the facts the bounce needs. */
export interface StemPlan {
  /** The arrangement role the stem carries. */
  role: ArrangerRole;
  /** The file the bounce writes (the take id, the role, the wav extension). */
  file: string;
  /** The channels the bounce renders. */
  channelkind: "mono" | "stereo";
  /** The desk fader the take opens the role's strip with (the bounce rides it). */
  gainDb: number;
  /** The events of the role, time-ascending (the partition keeps the schedule's order). */
  events: readonly NoteEvent[];
  /** The seconds the stem spans: the last gate end (0 for an empty role). */
  seconds: number;
}

/** One stem row of the manifest (the counts, not the events). */
export interface StemsManifestStem {
  /** The arrangement role. */
  role: ArrangerRole;
  /** The file the bounce writes. */
  file: string;
  /** The event count the stem carries. */
  events: number;
  /** The seconds the stem spans. */
  seconds: number;
}

/** The manifest the export seam writes beside the wavs (schema v1). */
export interface StemsManifest {
  /** The schema marker ("debonair.stems/1"). */
  schemaVersion: "debonair.stems/1";
  /** The stable id of the take. */
  takeId: string;
  /** The bounce sample rate (the mastering spec's 48000). */
  sampleRate: number;
  /** The genre loudness target the take renders under (LUFS). */
  lufsTarget: number;
  /** One row per stem, in the canonical role order. */
  stems: readonly StemsManifestStem[];
  /** The ISO instant the manifest was written (wall clock, like the take shelf's savedAt). */
  generatedAt: string;
}

/** One validateStems verdict: the machine code plus a human line. */
export interface StemsProblem {
  /** The machine readable failure code. */
  code: StemsErrorCode;
  /** The human readable line. */
  message: string;
}

/**
 * Partitions the schedule into one stem per role, in the canonical role
 * order, deterministically: same schedule, same partition. The gain rides
 * the desk fader the plan opened the role's strip with.
 *
 * @param schedule the scheduled take (time-ascending events).
 * @param plan the plan the take answers to (the naming and the faders ride it).
 * @returns one stem per role of STEM_ROLES, in that order.
 */
export function planStems(schedule: TakeSchedule, plan: TakePlan): StemPlan[] {
  if (schedule.events.length === 0) {
    throw new StemsError("empty-schedule", `take ${plan.id} schedules no events; there is nothing to bounce`);
  }
  for (const event of schedule.events) {
    if (!STEM_ROLES.some((policy) => policy.role === event.role)) {
      throw new StemsError("unknown-role", `event ${event.lane}@${event.time} rides the unknown role ${event.role}`);
    }
  }
  return STEM_ROLES.map((policy) => {
    const events = schedule.events.filter((event) => event.role === policy.role);
    const strip = plan.strips.find((row) => row.name === policy.role);
    const latest = events.reduce((end, event) => Math.max(end, event.time + event.seconds), 0);
    return {
      role: policy.role,
      file: stemFile(plan.id, policy.role),
      channelkind: policy.channelkind,
      gainDb: strip?.faderDb ?? 0,
      events,
      seconds: Number(latest.toFixed(6)),
    };
  });
}

/**
 * Builds the manifest schema v1 for a planned partition: the take identity,
 * the mastering rate, the genre loudness target and one counted row per stem.
 *
 * @param take the plan plus the partition planStems answered.
 * @returns the manifest (generatedAt rides the wall clock, like the take shelf).
 */
export function stemsManifest(take: { plan: TakePlan; stems: readonly StemPlan[] }): StemsManifest {
  return {
    schemaVersion: STEMS_SCHEMA_VERSION,
    takeId: take.plan.id,
    sampleRate: MASTERING.sampleRateHz,
    lufsTarget: take.plan.lufsTarget,
    stems: take.stems.map((stem) => ({
      role: stem.role,
      file: stem.file,
      events: stem.events.length,
      seconds: stem.seconds,
    })),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Validates a manifest against the schedule it claims to describe: the
 * schema shape, the naming, the canonical order, the span of every stem and
 * the conservation invariant — the sum of the stem events equals the
 * schedule total, per role and overall.
 *
 * @param schedule the scheduled take.
 * @param plan the plan the take answers to.
 * @param manifest the manifest to check.
 * @returns the problems found (an empty list is a sound manifest).
 */
export function validateStems(schedule: TakeSchedule, plan: TakePlan, manifest: StemsManifest): StemsProblem[] {
  const problems: StemsProblem[] = [];
  if (manifest.schemaVersion !== STEMS_SCHEMA_VERSION) {
    problems.push({ code: "bad-manifest", message: `schema ${manifest.schemaVersion} is not ${STEMS_SCHEMA_VERSION}` });
  }
  if (manifest.takeId !== plan.id)
    problems.push({
      code: "bad-manifest",
      message: `manifest answers take ${manifest.takeId}, plan carries ${plan.id}`,
    });
  if (manifest.sampleRate !== MASTERING.sampleRateHz) {
    problems.push({
      code: "bad-manifest",
      message: `sample rate ${manifest.sampleRate} is not the mastering ${MASTERING.sampleRateHz}`,
    });
  }
  if (!Number.isFinite(manifest.lufsTarget))
    problems.push({ code: "bad-manifest", message: `lufs target ${manifest.lufsTarget} is not finite` });
  if (Number.isNaN(Date.parse(manifest.generatedAt)))
    problems.push({ code: "bad-manifest", message: "generatedAt is not an ISO instant" });
  if (
    manifest.stems.length !== STEM_ROLES.length ||
    manifest.stems.some((stem, index) => stem.role !== STEM_ROLES[index].role)
  ) {
    problems.push({ code: "bad-order", message: "the manifest stems are not in the canonical role order" });
  }
  for (const stem of manifest.stems) {
    if (stem.file !== stemFile(manifest.takeId, stem.role)) {
      problems.push({ code: "bad-manifest", message: `stem ${stem.role} names ${stem.file}` });
    }
    if (!(stem.seconds >= 0 && stem.seconds <= schedule.duration + 1e-6)) {
      problems.push({ code: "bad-manifest", message: `stem ${stem.role} spans ${stem.seconds}s past the take` });
    }
  }
  const total = manifest.stems.reduce((sum, stem) => sum + stem.events, 0);
  if (total !== schedule.events.length) {
    problems.push({
      code: "conservation",
      message: `the stems carry ${total} events for ${schedule.events.length} scheduled`,
    });
  }
  for (const stem of manifest.stems) {
    if (stem.events !== schedule.perRole[stem.role]) {
      problems.push({
        code: "conservation",
        message: `stem ${stem.role} carries ${stem.events} for ${schedule.perRole[stem.role]} scheduled`,
      });
    }
  }
  return problems;
}


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: demix.ts — the hpss-based demix lane (the separation to wavs — the wavwriter import staying, the hpss imports dissolved). */
/* ══════════════════════════════════════════════════════════════════════ */

// # demix — the four-stem demix of the katexis engine (root layer, the
// wave the stem planner always stopped short of): one mono signal in,
// the four stems the remix market rides out — vocals, drums, bass,
// other — every one of them real pcm, the whole walk through the
// existing dsp lanes, zero new kernels. The separation law is the honest
// one the node-side lanes own: one shared stft (hpss — the same centered
// framing every analysis lane reads), the classical median-filter hpss
// masks (the harmonic ridge against the percussive broadband, the soft
// wiener pair that always sums to one) and the band-split refinements on
// top of the harmonic mask: the bass band mask (the raised-cosine
// crossover at 250 hz, the sub-bass seat a bass stem owns), the vocal
// formant band mask (the 300..3400 hz band with the soft skirts, the
// seat a sung or spoken voice rides) and the complement both leave (the
// instrumental other stem). The conservation law is the whole point and
// the test pins it: the four masks sum to one for every frame and bin
// (drums + harmonic = 1 from the wiener pair, bass + vocals + other = the
// harmonic share by construction), the four stems carry the ORIGINAL
// phases, so the istft pair of any subset and the sum of all four answers
// the input within float tolerance — the demix never invents and never
// loses energy.
// The honest limits, documented never hidden: a four-stem demix without
// a trained model routes by the seats the signal itself declares — the
// percussive transient seat (every kick and snare hit), the sustained
// low band (the sub-bass), the sustained vocal formant band (a voice
// alone in that band answers the vocals stem; a pad inside the same
// band answers it too, the band law cannot tell a voice from a pad —
// the trained-separator wave owns that answer, this lane owns the
// honest spectral routing). Every stem renders to real pcm bytes (the
// mono float32 lanes every consumer rides) and to the wav the export
// seam writes (wavwriter, mono pcm 16 at the mastering law). Pure and
// deterministic: the same input always answers the same stems,
// bit-for-bit, node and browser alike — zero storage, zero audio
// context, zero network.


/** The machine readable failure codes of the demix contract. */
export type DemixErrorCode = "empty-signal" | "bad-rate";

/** The typed demix failure, traceable to a machine code. */
export class DemixError extends Error {
  /** Machine readable failure code. */
  readonly code: DemixErrorCode;

  constructor(code: DemixErrorCode, message?: string) {
    super(message ?? `demix ${code}`);
    this.name = "DemixError";
    this.code = code;
  }
}

/** The canonical stem names of the four-stem demix, the answer's order. */
export const DEMIX_STEM_NAMES = ["vocals", "drums", "bass", "other"] as const;

/** One stem name of the four-stem demix. */
export type DemixStemName = (typeof DEMIX_STEM_NAMES)[number];

/** The bass crossover seat: the band mask rides the raised-cosine ramp
 * between these edges — 200 hz flat below, 300 hz flat above (the classic
 * sub-bass seat, the ingest three-band split's own low edge is 250). */
export const DEMIX_BASS_HZ: readonly [number, number] = [200, 300];

/** The vocal formant band: the band mask rides the raised-cosine skirts
 * between these edges — 200..300 hz rising, 3400..4400 hz falling (the
 * F1..F3 span of the human voice, the formant lane's own register). */
export const DEMIX_VOCAL_HZ: readonly [number, number, number, number] = [200, 300, 3400, 4400];

/**
 * The raised-cosine ramp between two edges: 0 at the low edge, 1 at the
 * high edge, the cosine skirt between — the soft crossover every band
 * mask rides (a hard edge would ring the istft, the mask law keeps the
 * transition smooth).
 *
 * @param value the position to read.
 * @param low the edge where the ramp answers 0.
 * @param high the edge where the ramp answers 1.
 * @returns the ramp 0..1, clamped outside the edges.
 */
function rampOf(value: number, low: number, high: number): number {
  if (value <= low) return 0;
  if (value >= high) return 1;
  const seat = (value - low) / (high - low);
  return 0.5 - 0.5 * Math.cos(Math.PI * seat);
}

/**
 * The bass band mask of one bin: 1 through the sub-bass, the cosine ramp
 * out through the crossover, 0 above it.
 *
 * @param hz the bin frequency.
 * @returns the mask 0..1.
 */
function bassMaskOf(hz: number): number {
  return 1 - rampOf(hz, DEMIX_BASS_HZ[0], DEMIX_BASS_HZ[1]);
}

/**
 * The vocal formant band mask of one bin: the soft skirts in and out of
 * the 300..3400 hz band (the voice's own register, the formant lane's
 * seats).
 *
 * @param hz the bin frequency.
 * @returns the mask 0..1.
 */
function vocalMaskOf(hz: number): number {
  const [riseLow, riseHigh, fallLow, fallHigh] = DEMIX_VOCAL_HZ;
  const rise = rampOf(hz, riseLow, riseHigh);
  const fall = 1 - rampOf(hz, fallLow, fallHigh);
  return Math.min(rise, fall);
}

/** One separated stem: the name, the pcm and the honest energy facts. */
export interface DemixStem {
  /** The stem name (one of DEMIX_STEM_NAMES). */
  name: DemixStemName;
  /** The stem pcm, the input's own length, the original phases riding. */
  pcm: Float32Array;
  /** The stem's peak (0..1+). */
  peak: number;
  /** The stem's rms. */
  rms: number;
}

/** The four-stem answer: one stem per name, in the canonical order. */
export interface DemixResult {
  /** The vocals stem (the harmonic energy of the vocal formant band). */
  vocals: DemixStem;
  /** The drums stem (the percussive mask — every transient). */
  drums: DemixStem;
  /** The bass stem (the harmonic energy under the 250 hz crossover). */
  bass: DemixStem;
  /** The other stem (the harmonic energy the voice and the bass do not own). */
  other: DemixStem;
  /** The sample rate the masks and the stems rode (the caller's own). */
  sampleRate: number;
  /** The stems in the canonical order (the zip the export seam rides). */
  stems: readonly DemixStem[];
}

/** The rms of a pcm block. */
function rmsOf(pcm: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < pcm.length; i++) sum += pcm[i] * pcm[i];
  return Math.sqrt(sum / Math.max(1, pcm.length));
}

/** The peak of a pcm block. */
function peakOf(pcm: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < pcm.length; i++) {
    const value = Math.abs(pcm[i] ?? 0);
    if (value > peak) peak = value;
  }
  return peak;
}

/** One stem of the answer, built from its mask matrix over the shared stft. */
function stemOf(name: DemixStemName, spectra: Stft, mask: readonly Float32Array[], length: number): DemixStem {
  const full = istft(spectra, mask);
  const pcm = Float32Array.from(full.subarray(spectra.pre, spectra.pre + length));
  return { name, pcm, peak: peakOf(pcm), rms: rmsOf(pcm) };
}

/**
 * Builds the four band-refined masks over one hpss mask pair: the
 * percussive mask answers the drums untouched; the harmonic share splits
 * three ways — the bass band under the crossover, the vocal formant band
 * above it, the complement to the other stem. The four masks sum to one
 * for every frame and bin (the wiener pair already sums to one, the
 * three-way split of the harmonic share sums to the harmonic share by
 * construction): the conservation law the stems carry.
 *
 * @param spectra the shared stft of the input.
 * @param harmonic the harmonic wiener mask (per frame, per bin).
 * @param percussive the percussive wiener mask.
 * @param sampleRate the rate the bin frequencies read.
 * @returns the four masks in the canonical order.
 */
function demixMasks(
  spectra: Stft,
  harmonic: readonly Float32Array[],
  percussive: readonly Float32Array[],
  sampleRate: number,
): {
  vocals: Float32Array[];
  drums: Float32Array[];
  bass: Float32Array[];
  other: Float32Array[];
} {
  const bins = spectra.mag[0]?.length ?? 0;
  const binHz = sampleRate / spectra.size;
  const bassBand = new Float64Array(bins);
  const vocalBand = new Float64Array(bins);
  for (let b = 0; b < bins; b++) {
    bassBand[b] = bassMaskOf(b * binHz);
    vocalBand[b] = vocalMaskOf(b * binHz);
  }
  const vocals: Float32Array[] = [];
  const drums: Float32Array[] = [];
  const bass: Float32Array[] = [];
  const other: Float32Array[] = [];
  for (let f = 0; f < spectra.frames; f++) {
    const h = harmonic[f] ?? new Float32Array(bins);
    const p = percussive[f] ?? new Float32Array(bins);
    const v = new Float32Array(bins);
    const d = new Float32Array(bins);
    const b = new Float32Array(bins);
    const o = new Float32Array(bins);
    for (let k = 0; k < bins; k++) {
      const bassSeat = bassBand[k] ?? 0;
      const vocalSeat = vocalBand[k] ?? 0;
      // the harmonic share splits three ways: the bass band first, the
      // vocal band over the complement, the rest to the other stem — the
      // three seats sum to the harmonic share exactly
      d[k] = p[k] ?? 0;
      b[k] = (h[k] ?? 0) * bassSeat;
      const aboveBass = (h[k] ?? 0) * (1 - bassSeat);
      v[k] = aboveBass * vocalSeat;
      o[k] = aboveBass * (1 - vocalSeat);
    }
    vocals.push(v);
    drums.push(d);
    bass.push(b);
    other.push(o);
  }
  return { vocals, drums, bass, other };
}

/**
 * Demixes one mono signal into the four stems — vocals, drums, bass,
 * other — through the existing dsp lanes: the shared hpss stft, the
 * median-filter wiener pair, the band-split refinement of the harmonic
 * share, one istft per stem over the original phases. Deterministic and
 * conserving: the four stems sum back to the input within float
 * tolerance (the conservation law the tests pin), the same input always
 * answers the same stems.
 *
 * @param mono the input samples (any level).
 * @param sampleRate the input's sample rate (the band masks read hz).
 * @returns the four stems in the canonical order, each the input's length.
 * @throws DemixError empty-signal when nothing rides the input, bad-rate
 *   when the rate is not a positive finite number.
 */
export function demix(mono: Float32Array, sampleRate: number): DemixResult {
  if (!(mono.length > 0)) throw new DemixError("empty-signal", "the demix needs samples — nothing rides the input");
  if (!Number.isFinite(sampleRate) || sampleRate <= 0)
    throw new DemixError("bad-rate", `the sample rate ${String(sampleRate)} is not a usable hz`);
  const spectra = stft(mono);
  const harmonicMag = medianFilter(spectra.mag, HARMONIC_KERNEL, "time");
  const percussiveMag = medianFilter(spectra.mag, PERCUSSIVE_KERNEL, "freq");
  const pair = masksOf(harmonicMag, percussiveMag);
  const masks = demixMasks(spectra, pair.harmonic, pair.percussive, sampleRate);
  const vocals = stemOf("vocals", spectra, masks.vocals, mono.length);
  const drums = stemOf("drums", spectra, masks.drums, mono.length);
  const bass = stemOf("bass", spectra, masks.bass, mono.length);
  const other = stemOf("other", spectra, masks.other, mono.length);
  return {
    vocals,
    drums,
    bass,
    other,
    sampleRate,
    stems: [vocals, drums, bass, other],
  };
}

/** One stem's wav answer: the file name and the bytes. */
export interface DemixWav {
  /** The stem name. */
  name: DemixStemName;
  /** The wav file name ("<name>.wav"). */
  file: string;
  /** The encoded wav bytes (mono pcm 16 at the input's rate). */
  bytes: Uint8Array;
}

/**
 * Renders every stem to its wav bytes — the export seam of the demix: one
 * mono pcm 16 wav per stem (wavwriter's own encoder, the mastering law's
 * depth), the stems in the canonical order, the file names the stem
 * carries. The bytes are real: the same encode the bounce lane rides.
 *
 * @param mono the input samples.
 * @param sampleRate the input's sample rate.
 * @returns one wav per stem, in the canonical order.
 * @throws DemixError the demix's own codes, plus the wav writer's typed
 *   refusal (WavError) when the encode refuses the bounce.
 */
export function demixToWavs(mono: Float32Array, sampleRate: number): DemixWav[] {
  const result = demix(mono, sampleRate);
  return result.stems.map((stem) => ({
    name: stem.name,
    file: `${stem.name}.wav`,
    bytes: encodeWav([stem.pcm], { sampleRate, bitDepth: 16 }),
  }));
}


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: vocalsynth.ts — the sung-voice synthesizer (the formant bank ride — the formant imports dissolved, the pattern and theory kernel wires staying). */
/* ══════════════════════════════════════════════════════════════════════ */

// # vocalsynth — the syllable voice of the katexis engine (root layer): the
// sample-accurate vowel synthesizer the engine corpus documents (doc 16 of
// outros.debonair). A glottal saw source rides a three-formant bandpass bank
// (the vowel table), syllables land on the grid, vibrato is seeded so the
// same take answers the same voice. Pure math — the transport renders it.
//
// the vocal lane of the generation pipeline (wave PV4.005, opt-in, never
// blocking): singPattern is the FIRST RUNG — the seeded voice over the
// plan's melody computed at the pattern level, so the sung notes ride the
// ordinary plan grammar and the renderworker's pattern bridge schedules
// them through the existing recipes (the airy lead seat — the vibrato
// recipe the singing modulation lives in). the melody is the plan's own
// top line (the highest note at every step, the bass sitting out — every
// pattern note is a melodic note of the score), and the phrase breathing
// is seeded (a phrase sings, a breath rests — the same plan and seed
// answer the same sung line). the SECOND RUNG landed with the formant
// wave: formant.ts owns the source-filter resonator law and the formant
// table (this lane re-exports the table it always published and rides
// the same bandpass through the exported helper — one implementation
// home), sungLineOf hands the sung line to any render lane, and the
// offline bounce's voice option (renderworker) sings it through the
// full formant bank under its own voice bus — the flute seat of the
// first rung stays the plan grammar, the formant render is the bounce's
// own honest voice.


// the formant table and the vowel id live in the formant section above
// (the source-filter lane owns the resonator law and the poles) — the
// re-export face this lane once carried dissolved with the fold: the
// names answer their one seat directly, the pinned contracts reading
// the same names through the same module.

/** The vibrato rate the corpus prescribes (hz). */
export const VIBRATO_HZ = 5;
/** The vibrato depth in semitones. */
export const VIBRATO_SEMITONES = 0.35;
/** The consonant noise burst length, in samples at 44.1k (~24ms). */
export const CONSONANT_SAMPLES = 1050;

/** The target syllable peak the renderer normalizes to (0..1). */
export const TARGET_SYLLABLE_PEAK = 0.45;

/** One syllable the renderer sings. */
export interface Syllable {
  /** The vowel the syllable holds. */
  vowel: Vowel;
  /** The voiced midi note (69 = A4). */
  midi: number;
  /** The start second on the take grid. */
  start: number;
  /** The duration in seconds. */
  duration: number;
  /** The velocity 0..1 (the harmony tension rides it). */
  velocity: number;
  /** The optional leading consonant (a noise burst s/t/k…). */
  consonant?: boolean;
}

/** The options one render accepts. */
export interface VoiceRenderOptions {
  /** The sample rate (the caller pins it explicitly — the render lane
   * masters at the 48000 RENDER_SAMPLE_RATE, the recon lane answers the
   * 44100 cd canon; the seat never assumes a rate). */
  sampleRate: number;
  /** The seeded rng in 0..1 (deterministic per take). */
  random: () => number;
}

/** One rendered voice take: the mono samples plus the peak meter. */
export interface VoiceRender {
  /** The mono samples, length ceil(duration * sampleRate). */
  samples: Float32Array;
  /** The absolute peak (0..1+). */
  peak: number;
}

/** Maps a midi note to hz (a4 = 440). */
function midiToHz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/**
 * Renders one syllable into a fresh buffer: glottal saw with seeded vibrato,
 * the three formant bandpasses, the consonant burst, the envelope.
 *
 * @param syllable the syllable to sing.
 * @param options the render options.
 * @returns the syllable buffer.
 */
function renderSyllable(syllable: Syllable, options: VoiceRenderOptions): Float32Array {
  const length = Math.max(1, Math.round(syllable.duration * options.sampleRate));
  const buffer = new Float32Array(length);
  const hz = midiToHz(syllable.midi);
  const vibratoDepth = 2 ** (VIBRATO_SEMITONES / 12) - 1;
  const vibratoPhase = options.random() * Math.PI * 2;
  for (let i = 0; i < length; i++) {
    const t = i / options.sampleRate;
    const vibrato = 1 + vibratoDepth * Math.sin(2 * Math.PI * VIBRATO_HZ * t + vibratoPhase);
    const phase = (hz * vibrato * t) % 1;
    // the glottal source: a bandwidth-limited saw (first 12 harmonics summed)
    let sample = 0;
    for (let harmonic = 1; harmonic <= 12; harmonic++) {
      sample += Math.sin(2 * Math.PI * harmonic * phase) / harmonic;
    }
    buffer[i] = sample * 0.22;
  }
  const formants = VOWEL_FORMANTS[syllable.vowel];
  for (let f = 0; f < formants.length; f++) {
    applyBandpass(buffer, formants[f], 9 - f * 2, options.sampleRate);
  }
  if (syllable.consonant) {
    const burst = Math.min(CONSONANT_SAMPLES, length);
    for (let i = 0; i < burst; i++) {
      buffer[i] += (options.random() * 2 - 1) * 0.12 * (1 - i / burst);
    }
  }
  // the asr envelope: 12% attack, sustain, 22% release
  const attack = Math.max(1, Math.floor(length * 0.12));
  const release = Math.max(1, Math.floor(length * 0.22));
  for (let i = 0; i < length; i++) {
    let gain = 1;
    if (i < attack) gain = i / attack;
    if (i >= length - release) gain = Math.min(gain, (length - i) / release);
    buffer[i] *= gain * syllable.velocity;
  }
  // the voice level law: the formant bank is narrow — normalize the syllable
  // to the documented target peak so the mix desk receives a sane fader span
  let peak = 0;
  for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(buffer[i]));
  if (peak > 0) {
    const gain = TARGET_SYLLABLE_PEAK / peak;
    for (let i = 0; i < length; i++) buffer[i] *= gain;
  }
  return buffer;
}

/**
 * Renders the full syllable track onto one take-length buffer. The mixing
 * law is additive with clamp — the transport owns the master strip. The
 * random stream is CONSUMED: pass a fresh seeded rng per render call, the
 * same seed then answers the same take.
 *
 * @param syllables the syllable track.
 * @param options the render options (sampleRate + seeded random).
 * @returns the rendered voice take.
 */
export function renderVoice(syllables: readonly Syllable[], options: VoiceRenderOptions): VoiceRender {
  const tail = syllables.reduce((max, s) => Math.max(max, s.start + s.duration), 0);
  const samples = new Float32Array(Math.max(1, Math.ceil(tail * options.sampleRate)));
  let peak = 0;
  for (const syllable of syllables) {
    const buffer = renderSyllable(syllable, options);
    const offset = Math.round(syllable.start * options.sampleRate);
    for (let i = 0; i < buffer.length && offset + i < samples.length; i++) {
      const value = samples[offset + i] + buffer[i];
      samples[offset + i] = Math.max(-1, Math.min(1, value));
      const abs = Math.abs(samples[offset + i]);
      if (abs > peak) peak = abs;
    }
  }
  return { samples, peak };
}

/**
 * Splits one lyric line into the vowel syllable grid: syllables distribute
 * evenly across the given span, seeded vowels follow the text when latin
 * vowels exist (deterministic fallback otherwise).
 *
 * @param line the lyric line.
 * @param midi the voiced note.
 * @param start the span start second.
 * @param span the span seconds.
 * @param options the render options (the seeded random picks fallback vowels).
 * @returns the syllables of the line.
 */
export function syllablesOfLine(
  line: string,
  midi: number,
  start: number,
  span: number,
  options: VoiceRenderOptions,
): Syllable[] {
  const tokens = line
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const glyphs = tokens.length > 0 ? tokens.join("") : "a";
  const count = Math.max(1, Math.min(glyphs.length, 16));
  const vowels: Vowel[] = ["a", "e", "i", "o", "u"];
  const per = span / count;
  return Array.from({ length: count }, (_, i) => {
    const found = glyphs[i] as Vowel | undefined;
    const vowel = found && vowels.includes(found) ? found : vowels[Math.floor(options.random() * vowels.length)];
    return { vowel, midi, start: start + i * per, duration: per * 0.92, velocity: SING_VELOCITY, consonant: i === 0 };
  });
}

// ---------------------------------------------------------------------------
// the pattern lane (the vocal lane's first rung, wave PV4.005)
// ---------------------------------------------------------------------------

/** The syllable velocity the sung notes ride — the same 0.8 law
 * syllablesOfLine stamps, named for the pattern lane. */
export const SING_VELOCITY = 0.8 as const;

/** The register lift of the sung line (semitones) — the voice sits an
 * octave above the instrumental melody, the classic vocal register. */
export const SING_LIFT_SEMITONES = 12 as const;

/**
 * Reads the melodic line of one composed plan — the voice's own seat: the
 * top note at every step, the bass sitting the line out (the foundation
 * is not the melody). Every pattern note is a melodic note of the score,
 * and the highest voice at each onset is the line the ear follows — the
 * line a singer sings over the arrangement.
 *
 * @param plan the composed plan.
 * @returns the melody notes, time-ascending.
 */
function melodyOf(plan: PatternProject): PatternNoteEvent[] {
  const top = new Map<number, PatternNoteEvent>();
  for (const note of plan.notes) {
    if (note.voice === "bass") continue;
    const standing = top.get(note.step);
    if (standing === undefined || note.pitch > standing.pitch) top.set(note.step, note);
  }
  return [...top.values()].sort((left, right) => left.step - right.step || left.pitch - right.pitch);
}

/**
 * Sings one composed plan — the opt-in vocal lane of the generation flow
 * (the first rung): the plan's melodic line (the top note at every step,
 * the bass sitting out) answers the sung line, computed at the pattern
 * level so the ordinary render recipes carry them (the airy lead seat —
 * the vibrato recipe the singing modulation lives in). the law: one
 * melody note answers one sung note, lifted an octave into the vocal
 * register (a unison note when the lift would leave the midi window),
 * the syllable velocity law riding the velocity, and the seeded phrase
 * breathing deciding which notes sing — a phrase of one to three notes,
 * a breath of one to two, so the same plan and seed always answer the
 * same sung line. the instrumental notes ride untouched (the voice lands
 * on top, never in place of), and a plan with no melody answers itself
 * (nothing to sing — the honest empty lane). never blocking: a sung plan
 * that somehow fails its contract answers the instrumental plan
 * unchanged.
 *
 * @param plan the composed plan (the composer's PatternProject).
 * @param seed the take identity the phrase breathing rides.
 * @returns the sung plan (validatePatternProject ok).
 */
export function singPattern(plan: PatternProject, seed: string): PatternProject {
  const sung = sungLineOf(plan, seed);
  if (sung.length === 0) return plan;
  const sungdoc: PatternProject = { ...plan, notes: [...plan.notes, ...sung] };
  const checked = validatePatternProject(sungdoc);
  return checked.ok ? checked.doc : plan;
}

/**
 * sungLineOf — the sung line of one composed plan, the law singPattern
 * rides: the melody notes (the top note at every step, the bass sitting
 * the line out) lifted an octave into the vocal register, the syllable
 * velocity law riding the velocity, and the seeded phrase breathing
 * deciding which notes sing — a phrase of one to three notes, a breath of
 * one to two. Exported for the bounce's own voice seat (renderworker's
 * vocal option renders THIS line through the formant bank under its own
 * voice bus — the second rung), so the sung line a plan carries has one
 * home and both render lanes read it. Deterministic: the same plan and
 * seed always answer the same line.
 *
 * @param plan the composed plan (the composer's PatternProject).
 * @param seed the take identity the phrase breathing rides.
 * @returns the sung line (empty when the plan carries no melody).
 */
export function sungLineOf(plan: PatternProject, seed: string): PatternNoteEvent[] {
  const melody = melodyOf(plan);
  if (melody.length === 0) return [];
  const rng = mulberry32(hashSeed(`voice:${seed}`));
  const sung: PatternNoteEvent[] = [];
  let at = 0;
  while (at < melody.length) {
    const phrase = 1 + Math.floor(rng() * 3); // a phrase sings one to three notes
    for (let index = 0; index < phrase && at < melody.length; index++, at++) {
      const note = melody[at] as PatternNoteEvent;
      const lift = note.pitch + SING_LIFT_SEMITONES <= 127 ? SING_LIFT_SEMITONES : 0;
      sung.push({
        step: note.step,
        pitch: note.pitch + lift,
        vel: note.vel * SING_VELOCITY,
        dur: note.dur,
        voice: "flute",
      });
    }
    at += 1 + Math.floor(rng() * 2); // a breath rests one to two notes
  }
  return sung;
}








