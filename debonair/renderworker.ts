// # renderworker — the server render job of the generation lane (root
// layer, the pipeline waves PV4.002 and PV4.003): the composed plan (a
// debonair.pattern/1 PatternProject, the composer's answer) renders offline
// into real wav bytes entirely outside the visitor's browser. the walk is
// the pipeline's own: schedule (the plan folds onto the flat time-ascending
// NoteEvent list the takeevents contract names — the drum lanes each bar,
// every note at its step, the sixteenth grid at 60/(bpm*4) seconds), render
// (the engine's own recipes driven sample-accurately at the 48 khz rate the
// MASTERING spec pins — the kick 808 pitch dive, the noise snare and hats,
// the bass sub, the detuned pad, the vibrato lead, every number read from
// audioengine's VOICE_RECIPES table, never re-implemented: the browser
// VoiceBank and this lane read the one source, so the desk and the bounce
// cannot drift), encode (the wavwriter, mono pcm 16 — the reference's wav
// law), store (the blob store put under audio/wav). determinism is total:
// the same plan and seed answer the same bytes (the seeded noise rides the
// take identity through audioengine's own seededNoiseChannel — the same
// stream the browser bank reads). the mix law rides the desk's own default
// faders and master trim (DEFAULT_MIX_LAW); the glue compressor stays the
// browser desk's — the webaudio compressor is deliberately ua-tailored, so
// the offline bounce pins the linear master mix that stays byte-stable on
// every machine. the job lane mirrors the ingest worker's discipline: the
// db never imports here — the ledger and the track row ride injected seats
// (renderjobs.ts binds them to sqlite; the gateway stack binds the routes),
// every call answers a typed result with a machine code, never a throw.
// zero consumer data.

import type { ArrangerRole } from "./arranger.ts";
import {
  DEFAULT_MIX_LAW,
  NOISE_SECONDS,
  RENDER_TAIL_S,
  ROLE_TRIM,
  seededNoiseChannel,
  VOICE_RECIPES,
} from "./audioengine.ts";
import { mintid } from "./bigintids.ts";
import { MASTERING, trackNameFromPrompt } from "./katexis.ts";
import { dbToLinear } from "./mixergraph.ts";
import {
  DRUM_LANE_KEYS,
  LANE_STEPS,
  PATTERN_SCHEMA_VERSION,
  type PatternProject,
  type PatternVoice,
  parsePattern,
  validatePatternProject,
} from "./patternenums.ts";
import type { NoteEvent } from "./takeevents.ts";
import { midiToHz } from "./tuning.ts";
import { encodeWav } from "./wavwriter.ts";

// ---------------------------------------------------------------------------
// the render lane constants (the mastering law)
// ---------------------------------------------------------------------------

/** The house rate the MASTERING spec pins — every render bounces here. */
export const RENDER_SAMPLE_RATE = MASTERING.sampleRateHz;

/** The bounce depth: mono pcm 16 (the reference's wav export law). */
export const RENDER_BIT_DEPTH = 16 as const;

/** The blob kind of the rendered wav (the mime the playback lane streams). */
export const RENDER_WAV_KIND = "audio/wav";

/** The drum gate the schedule bridge hands the percussive lanes (the
 * takeevents law — the recipes carry their own envelopes, the gate is the
 * nominal seat). */
const DRUM_GATE_SECONDS = 0.12;

/** The pipeline phases of one render, in the law order (the ledger row and
 * the progress callback speak these names). */
export const RENDER_PHASES: readonly RenderPhase[] = ["schedule", "render", "encode", "store"];

/** One phase of the render pipeline. */
export type RenderPhase = "schedule" | "render" | "encode" | "store";

// ---------------------------------------------------------------------------
// the blob store seam (the store wave's contract, structural)
// ---------------------------------------------------------------------------

/** One content-addressed blob pointer — the row the store answers on put.
 * The shape mirrors the blob store wave's own pointer (id, bytes, sha256,
 * kind, storedAt): the real store satisfies this seam structurally, so the
 * stack merge wires it without a shim. */
export interface RenderBlobPointer {
  /** The minted 64-bit blob id, decimal string form. */
  id: string;
  /** The byte count of the blob. */
  bytes: number;
  /** The store-computed sha256 hex digest of the bytes. */
  sha256: string;
  /** The bare mime the caller declared ("audio/wav"). */
  kind: string;
  /** The iso instant the store accepted the bytes. */
  storedAt?: string;
}

/** The typed put answer of the store seam — never a throw (a hostile store
 * answers the error branch; the worker guards a throw besides). */
export type RenderStorePut = { ok: true; pointer: RenderBlobPointer } | { ok: false; code: string; message: string };

/** The storage seam the render lane rides: one put call, the same contract
 * the blob store wave owns (put(data, kind) answers the pointer of the
 * stored bytes). The memory mirror, the file lane and the gateway seam all
 * satisfy it structurally. */
export interface RenderBlobStore {
  /** Stores bytes under a freshly minted pointer; the digest is computed
   * by the store itself, never trusted from the caller. */
  put(data: Uint8Array, kind: string): Promise<RenderStorePut>;
}

// ---------------------------------------------------------------------------
// the typed results (machine codes, never a throw)
// ---------------------------------------------------------------------------

/** The machine codes the render answers: the silent plan (empty-plan), the
 * render or encode refusal (render-failed — a plan off the contract or a
 * writer refusal rides here with the reason), the store refusal
 * (store-failed). */
export type RenderErrorCode = "empty-plan" | "render-failed" | "store-failed";

/** The typed renderPlan answer — ok carries the pointer, the bytes and the
 * rendered duration; the error branch carries the machine code. */
export type RenderPlanResult =
  | { ok: true; wavPointer: RenderBlobPointer; bytes: Uint8Array; durationSeconds: number }
  | { ok: false; code: RenderErrorCode; message: string };

/** One progress report: the phase that just landed and the completed share
 * of the walk (0..1, ascending). */
export interface RenderJobProgress {
  /** The phase that completed. */
  phase: RenderPhase;
  /** The completed share of the pipeline. */
  fraction: number;
}

/** The progress callback — a hostile throw never breaks the job. */
export type RenderProgressCallback = (progress: RenderJobProgress) => void;

// ---------------------------------------------------------------------------
// the schedule bridge (the plan folds onto the engine's event list)
// ---------------------------------------------------------------------------

/** The voice seat of the pattern vocabulary: which recipe lane and which
 * role bus each PatternVoice renders on. The engine's own dispatch law
 * decides: the melodic seats (lead, pluck, bell, arp, flute) ride the
 * vibrato lead recipe, the keys and pad seats ride the detuned pad recipe
 * (the engine's keys seat IS the pad), the bass rides the bass recipe. */
const VOICE_SEAT: Record<PatternVoice, { lane: string; role: ArrangerRole }> = {
  lead: { lane: "lead", role: "lead" },
  pluck: { lane: "lead", role: "lead" },
  keys: { lane: "keys", role: "keys" },
  bell: { lane: "lead", role: "lead" },
  arp: { lane: "lead", role: "lead" },
  flute: { lane: "lead", role: "lead" },
  bass: { lane: "bass", role: "bass" },
  pad: { lane: "keys", role: "keys" },
};

/** The scheduled plan: the flat time-ascending event list (the takeevents
 * NoteEvent contract, reused verbatim) beside the take's musical span. */
export interface PatternSchedule {
  /** Every note event, time-ascending. */
  events: readonly NoteEvent[];
  /** The take's musical span in seconds — the bars law (bars * 240 / bpm),
   * widened honestly when a note line onsets past the last bar. */
  duration: number;
  /** The sixteenth step in seconds (60 / (bpm * 4)). */
  stepSeconds: number;
}

/**
 * Folds a pattern project onto the flat note event list — the bridge
 * between the composer's plan and the engine's recipes. The drum lanes
 * loop each bar exactly as the plan carries them (a hit at a step answers
 * one drums-role event, the binary lane at full velocity); every note
 * lands at its step on the sixteenth grid with its voice's recipe lane and
 * role bus. Pure, deterministic, zero audio.
 *
 * @param plan the validated pattern project.
 * @returns the schedule (the events, the span, the step seconds).
 */
export function schedulePattern(plan: PatternProject): PatternSchedule {
  const stepSeconds = 60 / (plan.bpm * 4);
  const events: NoteEvent[] = [];
  for (let bar = 0; bar < plan.bars; bar++) {
    const barStart = bar * LANE_STEPS;
    for (const key of DRUM_LANE_KEYS) {
      const lane = plan.drums[key];
      for (let step = 0; step < LANE_STEPS; step++) {
        if ((lane[step] ?? 0) !== 1) continue;
        events.push({
          lane: key,
          role: "drums",
          time: (barStart + step) * stepSeconds,
          seconds: DRUM_GATE_SECONDS,
          velocity: 1,
          midi: 0,
        });
      }
    }
  }
  for (const note of plan.notes) {
    const seat = VOICE_SEAT[note.voice];
    events.push({
      lane: seat.lane,
      role: seat.role,
      time: note.step * stepSeconds,
      seconds: note.dur * stepSeconds,
      velocity: note.vel,
      midi: note.pitch,
    });
  }
  events.sort((left, right) => left.time - right.time);
  const barsSpan = plan.bars * LANE_STEPS * stepSeconds;
  const lastOnset = events.length > 0 ? events[events.length - 1].time : 0;
  return { events, duration: Math.max(barsSpan, lastOnset), stepSeconds };
}

// ---------------------------------------------------------------------------
// the dsp primitives (the webaudio automation and filter laws, closed form)
// ---------------------------------------------------------------------------

/** The exponential ramp of the webaudio automation law: v(t) = from *
 * (to/from)^(dt/seconds), holding the end values outside the span. */
function expRampOf(from: number, to: number, dt: number, seconds: number): number {
  if (dt <= 0) return from;
  if (dt >= seconds) return to;
  return from * (to / from) ** (dt / seconds);
}

/** The linear ramp of the webaudio automation law, holding the ends. */
function linearRampOf(from: number, to: number, dt: number, seconds: number): number {
  if (dt <= 0) return from;
  if (dt >= seconds) return to;
  return from + ((to - from) * dt) / seconds;
}

/** The set-target curve of the webaudio automation law: target + (from -
 * target) * exp(-dt/tc). */
function targetOf(target: number, from: number, dt: number, tc: number): number {
  if (dt <= 0) return from;
  return target + (from - target) * Math.exp(-dt / tc);
}

/** One running biquad filter — the rbj coefficients of the webaudio
 * biquad's transfer function (the spec-pinned response), direct form 1. */
interface BiquadFilter {
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
 * q the recipes carry or the node's default 1).
 *
 * @param type the filter family: lowpass, highpass or bandpass.
 * @param hz the cutoff frequency.
 * @param q the resonance (the webaudio default is 1).
 * @param sampleRate the render rate.
 * @returns the primed filter (zero state).
 */
function biquadOf(type: "lowpass" | "highpass" | "bandpass", hz: number, q: number, sampleRate: number): BiquadFilter {
  const omega = (2 * Math.PI * hz) / sampleRate;
  const cos = Math.cos(omega);
  const alpha = Math.sin(omega) / (2 * q);
  const a0 = 1 + alpha;
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  if (type === "lowpass") {
    b0 = (1 - cos) / 2;
    b1 = 1 - cos;
    b2 = (1 - cos) / 2;
  } else if (type === "highpass") {
    b0 = (1 + cos) / 2;
    b1 = -(1 + cos);
    b2 = (1 + cos) / 2;
  } else {
    // the constant-peak bandpass the webaudio spec pins
    b0 = alpha;
    b1 = 0;
    b2 = -alpha;
  }
  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: (-2 * cos) / a0,
    a2: (1 - alpha) / a0,
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  };
}

/** Steps one biquad over one input sample (direct form 1). */
function runBiquad(filter: BiquadFilter, x: number): number {
  const y =
    filter.b0 * x + filter.b1 * filter.x1 + filter.b2 * filter.x2 - filter.a1 * filter.y1 - filter.a2 * filter.y2;
  filter.x2 = filter.x1;
  filter.x1 = x;
  filter.y2 = filter.y1;
  filter.y1 = y;
  return y;
}

/** The sawtooth voice of the webaudio oscillator law (phase in [0,1)). */
function sawOf(phase: number): number {
  return 2 * phase - 1;
}

/** The square voice of the webaudio oscillator law. */
function squareOf(phase: number): number {
  return phase < 0.5 ? 1 : -1;
}

/** The triangle voice of the webaudio oscillator law. */
function triangleOf(phase: number): number {
  return (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * phase));
}

/** Reads the shared noise take at one instant — the buffer source's own
 * law: one second of seeded noise, silence past its end. */
function noiseAt(noise: Float32Array, dt: number, sampleRate: number): number {
  if (dt < 0 || dt >= NOISE_SECONDS) return 0;
  return noise[Math.min(noise.length - 1, Math.floor(dt * sampleRate))] ?? 0;
}

// ---------------------------------------------------------------------------
// the recipe voices (every number read from the VOICE_RECIPES table)
// ---------------------------------------------------------------------------

/** The 808 kick: the pitch envelope dives, the gain decays, the source
 * stops where the recipe says. */
function addKick(mix: Float32Array, sampleRate: number, start: number, velocity: number, gain: number): void {
  const recipe = VOICE_RECIPES.kick;
  const end = Math.min(mix.length, start + Math.ceil(recipe.stopSeconds * sampleRate));
  let phase = 0;
  for (let i = start; i < end; i++) {
    const dt = (i - start) / sampleRate;
    const freq =
      dt < recipe.pitchSeconds
        ? recipe.pitchFromHz * (recipe.pitchToHz / recipe.pitchFromHz) ** (dt / recipe.pitchSeconds)
        : recipe.pitchToHz;
    phase = (phase + freq / sampleRate) % 1;
    const env = expRampOf(velocity, 0.0001, dt, recipe.gainSeconds);
    mix[i] += Math.sin(2 * Math.PI * phase) * env * gain;
  }
}

/** The noise snare: the bandpass burst beside the triangle body, each
 * branch with its own envelope and stop. */
function addSnare(
  mix: Float32Array,
  sampleRate: number,
  start: number,
  velocity: number,
  gain: number,
  noise: Float32Array,
): void {
  const recipe = VOICE_RECIPES.snare;
  const noiseEnd = Math.min(mix.length, start + Math.ceil(recipe.noiseStopSeconds * sampleRate));
  const band = biquadOf("bandpass", recipe.bandHz, recipe.bandQ, sampleRate);
  for (let i = start; i < noiseEnd; i++) {
    const dt = (i - start) / sampleRate;
    const env = expRampOf(velocity * recipe.noiseGain, 0.0001, dt, recipe.noiseSeconds);
    mix[i] += runBiquad(band, noiseAt(noise, dt, sampleRate)) * env * gain;
  }
  const bodyEnd = Math.min(mix.length, start + Math.ceil(recipe.bodyStopSeconds * sampleRate));
  let phase = 0;
  for (let i = start; i < bodyEnd; i++) {
    const dt = (i - start) / sampleRate;
    phase = (phase + recipe.bodyHz / sampleRate) % 1;
    const env = expRampOf(velocity * recipe.bodyGain, 0.0001, dt, recipe.bodySeconds);
    mix[i] += triangleOf(phase) * env * gain;
  }
}

/** The clap: the tighter bandpass burst. */
function addClap(
  mix: Float32Array,
  sampleRate: number,
  start: number,
  velocity: number,
  gain: number,
  noise: Float32Array,
): void {
  const recipe = VOICE_RECIPES.clap;
  const end = Math.min(mix.length, start + Math.ceil(recipe.stopSeconds * sampleRate));
  const band = biquadOf("bandpass", recipe.bandHz, recipe.bandQ, sampleRate);
  for (let i = start; i < end; i++) {
    const dt = (i - start) / sampleRate;
    const env = expRampOf(velocity * recipe.noiseGain, 0.0001, dt, recipe.noiseSeconds);
    mix[i] += runBiquad(band, noiseAt(noise, dt, sampleRate)) * env * gain;
  }
}

/** The hat seat: the highpass tick at the recipe's decay. */
function addHat(
  mix: Float32Array,
  sampleRate: number,
  start: number,
  velocity: number,
  gain: number,
  noise: Float32Array,
  decaySeconds: number,
  stopPadSeconds: number,
  hatGain: number,
  highHz: number,
): void {
  const end = Math.min(mix.length, start + Math.ceil((decaySeconds + stopPadSeconds) * sampleRate));
  const high = biquadOf("highpass", highHz, 1, sampleRate);
  for (let i = start; i < end; i++) {
    const dt = (i - start) / sampleRate;
    const env = expRampOf(velocity * hatGain, 0.0001, dt, decaySeconds);
    mix[i] += runBiquad(high, noiseAt(noise, dt, sampleRate)) * env * gain;
  }
}

/** The bass: the sub sine under the triangle an octave up through the
 * lowpass, the attack-sustain-release gate closing after the note. */
function addBass(mix: Float32Array, sampleRate: number, start: number, event: NoteEvent, gain: number): void {
  const recipe = VOICE_RECIPES.bass;
  const end = Math.min(mix.length, start + Math.ceil((event.seconds + recipe.stopPadSeconds) * sampleRate));
  const lowpass = biquadOf("lowpass", recipe.lowpassHz, 1, sampleRate);
  const attackEnd = event.velocity * recipe.attackPeak;
  const sustain = event.velocity * recipe.sustainLevel;
  const gateValue =
    event.seconds > recipe.attackSeconds
      ? targetOf(sustain, attackEnd, event.seconds - recipe.attackSeconds, recipe.sustainTcSeconds)
      : expRampOf(0.0001, attackEnd, event.seconds, recipe.attackSeconds);
  let subPhase = 0;
  let midPhase = 0;
  for (let i = start; i < end; i++) {
    const dt = (i - start) / sampleRate;
    subPhase = (subPhase + midiToHz(event.midi) / sampleRate) % 1;
    midPhase = (midPhase + midiToHz(event.midi + recipe.midSemitones) / sampleRate) % 1;
    let env: number;
    if (dt < recipe.attackSeconds) env = expRampOf(0.0001, attackEnd, dt, recipe.attackSeconds);
    else if (dt < event.seconds) env = targetOf(sustain, attackEnd, dt - recipe.attackSeconds, recipe.sustainTcSeconds);
    else env = targetOf(0.0001, gateValue, dt - event.seconds, recipe.releaseTcSeconds);
    const voice = Math.sin(2 * Math.PI * subPhase) + triangleOf(midPhase);
    mix[i] += runBiquad(lowpass, voice) * env * gain;
  }
}

/** The detuned pad: the two saws around the pitch through the lowpass,
 * the slow swell, the slow release. */
function addPad(mix: Float32Array, sampleRate: number, start: number, event: NoteEvent, gain: number): void {
  const recipe = VOICE_RECIPES.pad;
  const end = Math.min(mix.length, start + Math.ceil((event.seconds + recipe.stopPadSeconds) * sampleRate));
  const lowpass = biquadOf("lowpass", recipe.lowpassHz, 1, sampleRate);
  const baseHz = midiToHz(event.midi);
  const leftHz = baseHz * 2 ** (-recipe.detuneCents / 1200);
  const rightHz = baseHz * 2 ** (recipe.detuneCents / 1200);
  const peak = event.velocity * recipe.gain;
  const gateValue =
    event.seconds < recipe.attackSeconds ? linearRampOf(0.0001, peak, event.seconds, recipe.attackSeconds) : peak;
  let leftPhase = 0;
  let rightPhase = 0;
  for (let i = start; i < end; i++) {
    const dt = (i - start) / sampleRate;
    leftPhase = (leftPhase + leftHz / sampleRate) % 1;
    rightPhase = (rightPhase + rightHz / sampleRate) % 1;
    let env: number;
    if (dt < recipe.attackSeconds) env = linearRampOf(0.0001, peak, dt, recipe.attackSeconds);
    else if (dt < event.seconds) env = peak;
    else env = targetOf(0.0001, gateValue, dt - event.seconds, recipe.releaseTcSeconds);
    mix[i] += runBiquad(lowpass, sawOf(leftPhase) + sawOf(rightPhase)) * env * gain;
  }
}

/** The vibrato lead: the square voice, the detune modulation, the fast
 * attack, the exponential decay over at least the recipe's floor. */
function addLead(mix: Float32Array, sampleRate: number, start: number, event: NoteEvent, gain: number): void {
  const recipe = VOICE_RECIPES.lead;
  const end = Math.min(mix.length, start + Math.ceil((event.seconds + recipe.stopPadSeconds) * sampleRate));
  const lowpass = biquadOf("lowpass", recipe.lowpassHz, 1, sampleRate);
  const baseHz = midiToHz(event.midi);
  const peak = event.velocity * recipe.gain;
  const decayEnd = Math.max(recipe.minSeconds, event.seconds);
  let phase = 0;
  for (let i = start; i < end; i++) {
    const dt = (i - start) / sampleRate;
    const detune = recipe.vibratoCents * Math.sin(2 * Math.PI * recipe.vibratoHz * dt);
    phase = (phase + (baseHz * 2 ** (detune / 1200)) / sampleRate) % 1;
    let env: number;
    if (dt < recipe.attackSeconds) env = linearRampOf(0.0001, peak, dt, recipe.attackSeconds);
    else if (dt < decayEnd) env = expRampOf(peak, 0.0001, dt - recipe.attackSeconds, decayEnd - recipe.attackSeconds);
    else env = 0.0001;
    mix[i] += runBiquad(lowpass, squareOf(phase)) * env * gain;
  }
}

/**
 * Renders one event onto the mix through its recipe — the VoiceBank's own
 * dispatch law: the drum seats, the keys seat (the engine's keys IS the
 * pad recipe), the bass and lead seats, the hat fallback for any lane the
 * engine does not name.
 *
 * @param mix the mix bus the voice adds into.
 * @param event the scheduled note.
 * @param noise the shared seeded noise take.
 */
function addVoice(mix: Float32Array, event: NoteEvent, noise: Float32Array): void {
  const sampleRate = RENDER_SAMPLE_RATE;
  const start = Math.round(event.time * sampleRate);
  if (start < 0 || start >= mix.length) return;
  const fader = DEFAULT_MIX_LAW.faders[event.role];
  const trim = ROLE_TRIM[event.role];
  // the VoiceBank's own bus law: an event whose role bus the desk does not
  // name answers nothing (never a NaN gain)
  if (fader === undefined || trim === undefined) return;
  const gain = dbToLinear(fader) * trim;
  switch (event.lane) {
    case "kick":
      addKick(mix, sampleRate, start, event.velocity, gain);
      break;
    case "snare":
      addSnare(mix, sampleRate, start, event.velocity, gain, noise);
      break;
    case "clap":
      addClap(mix, sampleRate, start, event.velocity, gain, noise);
      break;
    case "hat":
      addHat(
        mix,
        sampleRate,
        start,
        event.velocity,
        gain,
        noise,
        VOICE_RECIPES.hat.decaySeconds,
        VOICE_RECIPES.hat.stopPadSeconds,
        VOICE_RECIPES.hat.gain,
        VOICE_RECIPES.hat.highHz,
      );
      break;
    case "bass":
      addBass(mix, sampleRate, start, event, gain);
      break;
    case "keys":
      addPad(mix, sampleRate, start, event, gain);
      break;
    case "lead":
      addLead(mix, sampleRate, start, event, gain);
      break;
    default:
      addHat(
        mix,
        sampleRate,
        start,
        event.velocity,
        gain,
        noise,
        VOICE_RECIPES.fallback.decaySeconds,
        VOICE_RECIPES.fallback.stopPadSeconds,
        VOICE_RECIPES.fallback.gain,
        VOICE_RECIPES.fallback.highHz,
      );
  }
}

/**
 * Renders the whole schedule sample-accurately at the house rate — every
 * voice through its recipe onto the mix bus, the desk's default faders and
 * role trims folding each bus, the master fader and trim closing the mix
 * (the glue compressor stays the browser desk's: the webaudio compressor
 * is ua-tailored, the offline bounce pins the linear master law that stays
 * byte-stable on every machine). The noise take is the engine's own seeded
 * channel over the take identity — the same stream the browser bank reads.
 *
 * @param schedule the flat event list with its span.
 * @param seedSource the take identity the noise rng rides.
 * @returns the mono mix, the release tail included.
 */
export function renderPatternMix(schedule: PatternSchedule, seedSource: string): Float32Array {
  const noise = seededNoiseChannel(seedSource, Math.ceil(RENDER_SAMPLE_RATE * NOISE_SECONDS));
  const frames = Math.ceil((schedule.duration + RENDER_TAIL_S) * RENDER_SAMPLE_RATE);
  const mix = new Float32Array(frames);
  for (const event of schedule.events) addVoice(mix, event, noise);
  const masterGain = dbToLinear(DEFAULT_MIX_LAW.masterDb) * DEFAULT_MIX_LAW.masterTrim;
  for (let i = 0; i < frames; i++) mix[i] *= masterGain;
  return mix;
}

// ---------------------------------------------------------------------------
// the orchestrator (schedule -> render -> encode -> store)
// ---------------------------------------------------------------------------

/** The readable message of any thrown failure. */
function errmsgof(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** The plan error branch builder. */
function planerr(code: RenderErrorCode, message: string): RenderPlanResult {
  return { ok: false, code, message };
}

/**
 * Renders one composed plan end to end — the pipeline's own walk: the
 * contract gate (a plan off the debonair.pattern/1 law answers
 * render-failed with the validator's reason), the schedule (the flat
 * event list; a plan with no drum hits and no notes answers empty-plan),
 * the offline render through the engine's recipes at the mastering rate,
 * the wav encode (mono pcm 16), the blob store put under audio/wav. every
 * failure answers the typed result with a machine code — never a throw.
 * deterministic: the same plan and seed answer the same bytes on every
 * machine (the seeded noise rides the take identity, the dsp is pure).
 *
 * @param plan the composed plan (the composer's PatternProject).
 * @param seed the take identity — the seed the noise rng rides (the same
 *   plan with a fresh seed answers a fresh take).
 * @param store the blob store the wav lands in.
 * @param onProgress the optional progress sink (one report per completed phase).
 * @returns the pointer, the bytes and the duration, or the machine code.
 */
export async function renderPlan(
  plan: PatternProject,
  seed: string,
  store: RenderBlobStore,
  onProgress?: RenderProgressCallback,
): Promise<RenderPlanResult> {
  const report = (phase: RenderPhase): void => {
    if (!onProgress) return;
    try {
      onProgress({ phase, fraction: (RENDER_PHASES.indexOf(phase) + 1) / RENDER_PHASES.length });
    } catch {
      // a hostile callback never breaks the job — the answer matters more
    }
  };

  // phase: schedule — the contract gate, then the flat event list
  const checked = validatePatternProject(plan);
  if (!checked.ok)
    return planerr("render-failed", `the plan failed its contract (${checked.code}): ${checked.message}`);
  const schedule = schedulePattern(checked.doc);
  if (schedule.events.length === 0)
    return planerr("empty-plan", "the plan carries no drum hits and no notes — nothing to render");
  report("schedule");

  // phase: render — the engine's recipes, sample-accurate at the house rate
  let pcm: Float32Array;
  try {
    pcm = renderPatternMix(schedule, `noise:${seed}:${checked.doc.prompt}`);
  } catch (error) {
    return planerr("render-failed", `the render lane faulted: ${errmsgof(error)}`);
  }
  report("render");

  // phase: encode — the wavwriter at the mastering rate, mono pcm 16
  let bytes: Uint8Array;
  try {
    bytes = encodeWav([pcm], { sampleRate: RENDER_SAMPLE_RATE, bitDepth: RENDER_BIT_DEPTH });
  } catch (error) {
    return planerr("render-failed", `the wavwriter refused the bounce: ${errmsgof(error)}`);
  }
  report("encode");

  // phase: store — the wav lands in the blob store under audio/wav
  let put: RenderStorePut;
  try {
    put = await store.put(bytes, RENDER_WAV_KIND);
  } catch (error) {
    return planerr("store-failed", `the store lane threw: ${errmsgof(error)}`);
  }
  if (!put.ok) return planerr("store-failed", `the store refused the wav: ${put.code} (${put.message})`);
  report("store");

  return {
    ok: true,
    wavPointer: put.pointer,
    bytes,
    durationSeconds: pcm.length / RENDER_SAMPLE_RATE,
  };
}

// ---------------------------------------------------------------------------
// the job ledger contract (the ingest_jobs walk law, render's own columns)
// ---------------------------------------------------------------------------

/** The states the render ledger walks (the queue registers "queued", the
 * run moves it through "rendering", the walk lands "done" or "failed"). */
export type RenderJobState = "queued" | "rendering" | "done" | "failed";

/** One render job ledger row — the render_jobs table shape: the same walk
 * law the ingest_jobs table rides with the render lane's own payload
 * columns (the queued plan json, the landed wav pointer). */
export interface RenderJobRow {
  /** The minted job id (the decimal string). */
  id: string;
  /** The owner pointer (the decimal string). */
  owner_id: string;
  /** The walk state. */
  state: RenderJobState;
  /** The last completed phase (null until the run starts). */
  phase: string | null;
  /** The completed share of the walk (0..1, ascending). */
  fraction: number;
  /** The honest failure — "<code>: <message>" (null while the walk rides). */
  error: string | null;
  /** The queued plan (canonical serializePattern bytes). */
  plan_json: string;
  /** The landed wav blob id (null until the walk lands done). */
  wav_pointer: string | null;
  /** The iso instant of the registration. */
  created_at: string;
  /** The iso instant the walk landed (done or failed; null while riding). */
  finished_at: string | null;
}

/** The mutable fields of one ledger row — the walk patches these (the id,
 * the owner, the plan and the registration instant never change). */
export type RenderJobPatch = Partial<
  Pick<RenderJobRow, "state" | "phase" | "fraction" | "error" | "wav_pointer" | "finished_at">
>;

/** The job ledger seat — the render_jobs row functions behind one seam
 * (the renderjobs module binds the real sqlite functions; the tests bind a
 * temp database). The seat is synchronous on purpose: the walk's progress
 * patches land in order — a queued write must never overtake the done
 * write (the same discipline the gateway's job seat rides). */
export interface RenderJobSeat {
  /** Registers one job row (the upsert law — a re-registration refreshes). */
  putjob(row: RenderJobRow): void;
  /** Reads one job row (null when the id answers nothing). */
  getjob(id: string): RenderJobRow | null;
  /** Patches one job row (a missing id changes nothing). */
  updatejob(id: string, patch: RenderJobPatch): void;
  /** Lists the job rows, newest first (an owner filter rides when the
   * caller carries one). */
  listjobs(ownerId?: string): RenderJobRow[];
}

/** One rendered track row the walk stamps — the tracks table's own columns
 * grown with the pointer chain (the reference law of PV1.001 mirrored:
 * every row carries the owner pointer and the blob address of the wav). */
export interface RenderTrackRow {
  /** The minted track id (the decimal string). */
  id: string;
  /** The owner pointer (the decimal string — every row carries one). */
  ownerId: string;
  /** The display name (the prompt's first words, the house naming law). */
  name: string;
  /** The genre line (the plan's mood label). */
  genre: string;
  /** The rendered duration in seconds. */
  seconds: number;
  /** The track status ("ready" once the wav landed). */
  status: string;
  /** The blob id of the landed wav (the decimal string). */
  wavPointer: string;
  /** The iso instant of the stamp. */
  createdAt: string;
}

/** The typed answer of one db lane insert — never a throw (a throwing
 * seat answers through the walk's guard). */
export type RenderDbAnswer = { ok: true } | { ok: false; code: string; message: string };

/** The track row seat — the db seam the walk stamps the track through
 * (the ingest worker's own handle law: the worker stays pure of any
 * database import, the wiring lane binds the table). */
export interface RenderTrackSeat {
  /** Inserts one rendered track row (parameter binding only, the house
   * database law). */
  puttrackrow(row: RenderTrackRow): Promise<RenderDbAnswer>;
}

// ---------------------------------------------------------------------------
// the job walk (the caller loop drives it; the gateway binds the routes)
// ---------------------------------------------------------------------------

/** The environment the walk rides — all injected, the handlers pure over
 * it (the gateway's own env law; the route binding lands with the gateway
 * stack). */
export interface RenderEnv {
  /** The blob store the wav lands in. */
  store: RenderBlobStore;
  /** The render job ledger seat. */
  jobs: RenderJobSeat;
  /** The track row seat, or null when the lane runs store-only. */
  tracks: RenderTrackSeat | null;
  /** The iso clock the registrations and the finishes stamp. */
  now: () => string;
}

/** The machine codes the walk answers: the ledger codes first (not-found,
 * conflict, ledger-failed), the render codes last (bad-plan, the
 * renderPlan codes passthrough, the track stamp). */
export type RenderRunErrorCode =
  | "not-found" // no job row answers the id
  | "conflict" // the row's state refuses the move (the walk is one-shot)
  | "bad-plan" // the queued payload fails the pattern contract
  | "empty-plan" // the plan carries nothing renderable
  | "render-failed" // the render or the encode refused
  | "store-failed" // the blob store refused the wav
  | "track-failed" // the track lane refused the row
  | "ledger-failed"; // the ledger seat refused a patch

/** The typed walk answer — ok carries the landed take (the wav pointer,
 * the byte count, the duration, the track id), the error branch carries
 * the machine code. never a throw. */
export type RenderJobRun =
  | {
      ok: true;
      jobId: string;
      state: "done";
      wavPointer: string;
      bytes: number;
      durationSeconds: number;
      trackId: string | null;
    }
  | { ok: false; code: RenderRunErrorCode; message: string };

/** The run error branch builder. */
function runerr(code: RenderRunErrorCode, message: string): RenderJobRun {
  return { ok: false, code, message };
}

/**
 * Starts one queued render job — the caller lane (the gateway worker
 * loop) hands the job id and this function walks the render end to end
 * with the ledger row riding along: the state moves queued → rendering,
 * every completed phase patches the phase and the ascending fraction (the
 * render's own report), the wav lands in the blob store, the track row
 * lands with the pointers (after the bytes — never a row that points at
 * missing bytes) and the walk lands done with the wav pointer or failed
 * with the honest error code ("<code>: <message>"). the take identity is
 * the job id itself — one job, one deterministic take (a fresh take
 * queues a fresh job, the same law the one-shot walk rides). never a
 * throw; a re-run of a landed job answers conflict.
 *
 * @param env the injected environment (the store, the seats, the clock).
 * @param jobId the queued job the caller lane registered.
 * @returns the landed take, or the machine code of the refusing lane.
 */
export async function startRenderJob(env: RenderEnv, jobId: string): Promise<RenderJobRun> {
  let row: RenderJobRow | null;
  try {
    row = env.jobs.getjob(jobId);
  } catch (error) {
    return runerr("ledger-failed", `the ledger refused the read: ${errmsgof(error)}`);
  }
  if (row === null) return runerr("not-found", `no job answers ${jobId}`);
  if (row.state !== "queued") {
    return runerr("conflict", `the job ${jobId} is ${row.state} — only a queued job starts`);
  }
  try {
    env.jobs.updatejob(jobId, { state: "rendering", fraction: 0 });
  } catch (error) {
    return runerr("ledger-failed", `the ledger refused the rendering patch: ${errmsgof(error)}`);
  }
  const fail = (code: RenderRunErrorCode, message: string): RenderJobRun => {
    try {
      env.jobs.updatejob(jobId, { state: "failed", error: `${code}: ${message}`, finished_at: env.now() });
    } catch {
      // a hostile ledger never breaks the answer — the failure lands in the run
    }
    return runerr(code, message);
  };

  // the queued payload: the canonical pattern json the composer serialized
  const parsed = parsePattern(row.plan_json);
  if (!parsed.ok) {
    return fail("bad-plan", `the queued payload failed the pattern contract (${parsed.code}): ${parsed.message}`);
  }
  if (parsed.doc.schema !== PATTERN_SCHEMA_VERSION) {
    return fail("bad-plan", "the queued payload is not a debonair.pattern/1 project");
  }
  const plan = parsed.doc;

  // the run: the job id is the take identity (one job, one take)
  const result = await renderPlan(plan, jobId, env.store, (progress) => {
    try {
      env.jobs.updatejob(jobId, { phase: progress.phase, fraction: progress.fraction });
    } catch {
      // a hostile ledger never breaks the run — the answer matters more
    }
  });
  if (!result.ok) return fail(result.code, result.message);

  // the track row lands after the bytes (never a row that points at
  // missing bytes), the owner pointer and the wav address riding along
  const track: RenderTrackRow = {
    id: mintid(),
    ownerId: row.owner_id,
    name: trackNameFromPrompt(plan.prompt) || plan.mood || "untitled",
    genre: plan.mood,
    seconds: Math.round(result.durationSeconds),
    status: "ready",
    wavPointer: result.wavPointer.id,
    createdAt: env.now(),
  };
  if (env.tracks !== null) {
    let answer: RenderDbAnswer;
    try {
      answer = await env.tracks.puttrackrow(track);
    } catch (error) {
      return fail("track-failed", `the track lane threw: ${errmsgof(error)}`);
    }
    if (!answer.ok) return fail("track-failed", `the track lane refused the row: ${answer.code} (${answer.message})`);
  }
  try {
    env.jobs.updatejob(jobId, {
      state: "done",
      fraction: 1,
      wav_pointer: result.wavPointer.id,
      finished_at: env.now(),
    });
  } catch (error) {
    return runerr(
      "ledger-failed",
      `the ledger refused the done stamp (the wav ${result.wavPointer.id} landed): ${errmsgof(error)}`,
    );
  }
  return {
    ok: true,
    jobId,
    state: "done",
    wavPointer: result.wavPointer.id,
    bytes: result.bytes.length,
    durationSeconds: result.durationSeconds,
    trackId: env.tracks === null ? null : track.id,
  };
}
