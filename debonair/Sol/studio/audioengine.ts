// # audioengine — the browser transport of the studio page (Sol layer): one
// WebAudio graph per take — the role buses wired exactly as the mixergraph
// model resolves them (fader → analyser → master → compressor → out), the
// synth recipes of the katexis wave-b2 contract (kick 808 pitch envelope,
// noise snare and hats, detuned pad, vibrato lead) and a lookahead scheduler
// that expands takeevents against the audio clock with the loop pass. 48 kHz
// is requested on the context; the pure math the tests pin lives in
// takeevents/dawview/mixergraph — this file only owns the REAL audio glue,
// so play, stop, loop, faders and the VU meters drive actual sound.
// The v2.28 honest extension: load(plan, schedule?) lets the studio hand the
// edited schedule the piano roll rebuilt — the transport plays the notes the
// desk shows, nothing synthesized behind the scenes.
// The v2.29 export path: the voice recipes ride a shared VoiceBank over any
// BaseAudioContext, so renderTakeOffline bounces the take (or a single stem)
// through an OfflineAudioContext with the same graph, the same faders and a
// seeded noise buffer — same prompt and seed rebuild the exact wav bytes.
// Zero demo paths: a failed context answers a typed error the page renders.

import type { ArrangerRole, TakePlan } from "../../arranger.ts";
import { hashSeed, mulberry32 } from "../../harmonyengine.ts";
import { dbToLinear } from "../../mixergraph.ts";
import { type NoteEvent, scheduleTake, type TakeSchedule } from "../../takeevents.ts";
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
const ROLE_TRIM: Record<ArrangerRole, number> = { drums: 0.9, bass: 0.85, keys: 0.5, lead: 0.4 };

/** The scheduler horizon (seconds scheduled ahead of the playhead). */
const LOOKAHEAD = 0.35;
/** The scheduler tick (ms). */
const TICK_MS = 80;
/** The analyser fft size of the VU taps. */
const FFT_SIZE = 512;
/** The release tail the offline bounce adds after the last gate (s). */
const RENDER_TAIL_S = 1.2;
/** The shared noise buffer length (s) — one second seeds every noise voice. */
const NOISE_SECONDS = 1;

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
 * Builds the shared white-noise take, seeded by the take's own identity —
 * the same prompt and seed rebuild the same noise, so a bounce is byte-stable.
 *
 * @param ac the context the buffer is allocated on (buffers are context-free).
 * @param seedSource the identity string the rng rides.
 * @returns one second of seeded white noise.
 */
function makeNoiseBuffer(ac: BaseAudioContext, seedSource: string): AudioBuffer {
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * NOISE_SECONDS), ac.sampleRate);
  const channel = buffer.getChannelData(0);
  const rng = mulberry32(hashSeed(seedSource));
  for (let index = 0; index < channel.length; index++) channel[index] = rng() * 2 - 1;
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
        this.hat(bus, event, when, 0.05);
        break;
      case "openhat":
        this.hat(bus, event, when, 0.3);
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
        this.hat(bus, event, when, 0.06);
    }
  }

  /** Registers a scheduled source so the live stop() can silence it. */
  private track(node: AudioScheduledSourceNode, stopAt: number): void {
    this.sink.ontrack?.(node, stopAt);
  }

  private kick(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const osc = ac.createOscillator();
    osc.type = "sine";
    const gain = ac.createGain();
    osc.frequency.setValueAtTime(135, when);
    osc.frequency.exponentialRampToValueAtTime(42, when + 0.09);
    gain.gain.setValueAtTime(event.velocity, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.34);
    osc.connect(gain).connect(out);
    osc.start(when);
    this.track(osc, when + 0.36);
  }

  private snare(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const noise = ac.createBufferSource();
    noise.buffer = this.sink.noise;
    const band = ac.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1850;
    band.Q.value = 0.9;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(event.velocity * 0.8, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.2);
    noise.connect(band).connect(gain).connect(out);
    const body = ac.createOscillator();
    body.type = "triangle";
    body.frequency.value = 186;
    const bodyGain = ac.createGain();
    bodyGain.gain.setValueAtTime(event.velocity * 0.5, when);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.11);
    body.connect(bodyGain).connect(out);
    noise.start(when);
    body.start(when);
    this.track(noise, when + 0.22);
    this.track(body, when + 0.13);
  }

  private clap(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const noise = ac.createBufferSource();
    noise.buffer = this.sink.noise;
    const band = ac.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1150;
    band.Q.value = 1.4;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(event.velocity * 0.9, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
    noise.connect(band).connect(gain).connect(out);
    noise.start(when);
    this.track(noise, when + 0.2);
  }

  private hat(out: AudioNode, event: NoteEvent, when: number, decay: number): void {
    const ac = this.sink.ac;
    const noise = ac.createBufferSource();
    noise.buffer = this.sink.noise;
    const high = ac.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 7600;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(event.velocity * 0.5, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    noise.connect(high).connect(gain).connect(out);
    noise.start(when);
    this.track(noise, when + decay + 0.02);
  }

  private ride(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const noise = ac.createBufferSource();
    noise.buffer = this.sink.noise;
    const high = ac.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 6200;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(event.velocity * 0.3, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.55);
    noise.connect(high).connect(gain).connect(out);
    noise.start(when);
    this.track(noise, when + 0.58);
  }

  private perc(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 820;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(event.velocity * 0.32, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.09);
    osc.connect(gain).connect(out);
    osc.start(when);
    this.track(osc, when + 0.11);
  }

  private tom(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(172, when);
    osc.frequency.exponentialRampToValueAtTime(96, when + 0.2);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(event.velocity * 0.6, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.26);
    osc.connect(gain).connect(out);
    osc.start(when);
    this.track(osc, when + 0.28);
  }

  private bass(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const sub = ac.createOscillator();
    sub.type = "sine";
    sub.frequency.value = midiToHz(event.midi);
    const mid = ac.createOscillator();
    mid.type = "triangle";
    mid.frequency.value = midiToHz(event.midi + 12);
    const lowpass = ac.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 640;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(event.velocity * 0.9, when + 0.012);
    gain.gain.setTargetAtTime(event.velocity * 0.5, when + 0.012, 0.12);
    gain.gain.setTargetAtTime(0.0001, when + event.seconds, 0.05);
    sub.connect(lowpass);
    mid.connect(lowpass);
    lowpass.connect(gain).connect(out);
    sub.start(when);
    mid.start(when);
    this.track(sub, when + event.seconds + 0.3);
    this.track(mid, when + event.seconds + 0.3);
  }

  private pad(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const left = ac.createOscillator();
    const right = ac.createOscillator();
    left.type = "sawtooth";
    right.type = "sawtooth";
    left.frequency.value = midiToHz(event.midi);
    right.frequency.value = midiToHz(event.midi);
    left.detune.value = -6;
    right.detune.value = 6;
    const lowpass = ac.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 960;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(event.velocity * 0.5, when + 0.28);
    gain.gain.setTargetAtTime(0.0001, when + event.seconds, 0.18);
    left.connect(lowpass);
    right.connect(lowpass);
    lowpass.connect(gain).connect(out);
    left.start(when);
    right.start(when);
    this.track(left, when + event.seconds + 0.9);
    this.track(right, when + event.seconds + 0.9);
  }

  private lead(out: AudioNode, event: NoteEvent, when: number): void {
    const ac = this.sink.ac;
    const osc = ac.createOscillator();
    osc.type = "square";
    osc.frequency.value = midiToHz(event.midi);
    const vibrato = ac.createOscillator();
    vibrato.frequency.value = 5.5;
    const depth = ac.createGain();
    depth.gain.value = 7;
    vibrato.connect(depth).connect(osc.detune);
    const lowpass = ac.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2400;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(event.velocity * 0.34, when + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.2, event.seconds));
    osc.connect(lowpass).connect(gain).connect(out);
    osc.start(when);
    vibrato.start(when);
    this.track(osc, when + event.seconds + 0.1);
    this.track(vibrato, when + event.seconds + 0.1);
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
  master.gain.value = dbToLinear(masterStrip?.faderDb ?? -2) * 0.9;
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
  private faders: Record<ArrangerRole, number> = { drums: -4, bass: -5, keys: -9, lead: -7 };
  private masterDb = -2;
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
    this.master.gain.value = dbToLinear(this.masterDb) * 0.9;
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
