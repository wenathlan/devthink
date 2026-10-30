// # audioengine — the browser transport of the studio page (root logic,
// moved from Sol/studio/audioengine.ts): one WebAudio graph per take — the
// role buses wired exactly as the mixergraph model resolves them (fader →
// analyser → master → compressor → out), the synth recipes of the katexis
// wave-b2 contract (kick 808 pitch envelope, noise snare and hats, detuned
// pad, vibrato lead) and a lookahead scheduler that expands takeevents
// against the audio clock with the loop pass. 48 kHz is requested on the
// context; the pure math the tests pin lives in takeevents/dawview/
// mixergraph — this file only owns the REAL audio glue, so play, stop, loop,
// faders and the VU meters drive actual sound.
// The v2.28 honest extension: load(plan, schedule?) lets the studio hand the
// edited schedule the piano roll rebuilt — the transport plays the notes the
// desk shows, nothing synthesized behind the scenes.
// The v2.29 export path: the voice recipes ride a shared VoiceBank over any
// BaseAudioContext, so renderTakeOffline bounces the take (or a single stem)
// through an OfflineAudioContext with the same graph, the same faders and a
// seeded noise buffer — same prompt and seed rebuild the exact wav bytes.
// Zero demo paths: a failed context answers a typed error the page renders.

import type { ArrangerRole, TakePlan } from "./arranger.ts";
import { hashSeed, mulberry32 } from "./harmonyengine.ts";
import { dbToLinear } from "./mixergraph.ts";
import { type NoteEvent, scheduleTake, type TakeSchedule } from "./takeevents.ts";
import { midiToHz } from "./tuning.ts";

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
 * answers what the desk plays.
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
