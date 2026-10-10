// # audioengine — the browser transport of the studio page (Sol layer): one
// WebAudio graph per take — the role buses wired exactly as the mixergraph
// model resolves them (fader → analyser → master → compressor → out), the
// synth recipes of the katexis wave-b2 contract (kick 808 pitch envelope,
// noise snare and hats, detuned pad, vibrato lead) and a lookahead scheduler
// that expands takeevents against the audio clock with the loop pass. 48 kHz
// is requested on the context; the pure math the tests pin lives in
// takeevents/dawview/mixergraph — this file only owns the REAL audio glue,
// so play, stop, loop, faders and the VU meters drive actual sound.
// Zero demo paths: a failed context answers a typed error the page renders.

import type { ArrangerRole, TakePlan } from "../../arranger.ts";
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
   * visitor interacts) can never gate the load. */
  async load(plan: TakePlan): Promise<void> {
    this.stop();
    this.plan = plan;
    this.schedule = scheduleTake(plan);
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
    this.master.connect(glue).connect(context.destination);
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
    // one second of shared white noise (the snare/hat/clap/ride source)
    const noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const channel = noise.getChannelData(0);
    for (let index = 0; index < channel.length; index++) channel[index] = Math.random() * 2 - 1;
    this.noise = noise;
  }

  /** The lookahead pass: schedules every event that entered the horizon. */
  private tick(): void {
    const context = this.context;
    const plan = this.plan;
    const schedule = this.schedule;
    if (!context || !plan || !schedule || !this.running) return;
    const position = this.position();
    const horizon = position + LOOKAHEAD;
    while (this.nextIndex < schedule.events.length && schedule.events[this.nextIndex].time < horizon) {
      const event = schedule.events[this.nextIndex];
      this.nextIndex += 1;
      const when = this.baseTime + (event.time - this.baseOffset);
      this.voice(event, Math.max(when, context.currentTime));
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

  /** Dispatches one event to its recipe voice. */
  private voice(event: NoteEvent, when: number): void {
    const context = this.context;
    const bus = event.role === "drums" ? this.buses.get("drums") : this.buses.get(event.role);
    if (!context || !bus) return;
    const destination = bus;
    switch (event.lane) {
      case "kick":
        this.kick(context, destination, event, when);
        break;
      case "snare":
        this.snare(context, destination, event, when);
        break;
      case "clap":
        this.clap(context, destination, event, when);
        break;
      case "hat":
        this.hat(context, destination, event, when, 0.05);
        break;
      case "openhat":
        this.hat(context, destination, event, when, 0.3);
        break;
      case "ride":
        this.ride(context, destination, event, when);
        break;
      case "perc":
        this.perc(context, destination, event, when);
        break;
      case "tom":
        this.tom(context, destination, event, when);
        break;
      case "bass":
        this.bass(context, destination, event, when);
        break;
      case "keys":
        this.pad(context, destination, event, when);
        break;
      case "lead":
        this.lead(context, destination, event, when);
        break;
      default:
        this.hat(context, destination, event, when, 0.06);
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

  private kick(context: AudioContext, out: AudioNode, event: NoteEvent, when: number): void {
    const osc = context.createOscillator();
    osc.type = "sine";
    const gain = context.createGain();
    osc.frequency.setValueAtTime(135, when);
    osc.frequency.exponentialRampToValueAtTime(42, when + 0.09);
    gain.gain.setValueAtTime(event.velocity, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.34);
    osc.connect(gain).connect(out);
    osc.start(when);
    this.track(osc, when + 0.36);
  }

  private snare(context: AudioContext, out: AudioNode, event: NoteEvent, when: number): void {
    const noise = context.createBufferSource();
    noise.buffer = this.noise;
    const band = context.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1850;
    band.Q.value = 0.9;
    const gain = context.createGain();
    gain.gain.setValueAtTime(event.velocity * 0.8, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.2);
    noise.connect(band).connect(gain).connect(out);
    const body = context.createOscillator();
    body.type = "triangle";
    body.frequency.value = 186;
    const bodyGain = context.createGain();
    bodyGain.gain.setValueAtTime(event.velocity * 0.5, when);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.11);
    body.connect(bodyGain).connect(out);
    noise.start(when);
    body.start(when);
    this.track(noise, when + 0.22);
    this.track(body, when + 0.13);
  }

  private clap(context: AudioContext, out: AudioNode, event: NoteEvent, when: number): void {
    const noise = context.createBufferSource();
    noise.buffer = this.noise;
    const band = context.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1150;
    band.Q.value = 1.4;
    const gain = context.createGain();
    gain.gain.setValueAtTime(event.velocity * 0.9, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
    noise.connect(band).connect(gain).connect(out);
    noise.start(when);
    this.track(noise, when + 0.2);
  }

  private hat(context: AudioContext, out: AudioNode, event: NoteEvent, when: number, decay: number): void {
    const noise = context.createBufferSource();
    noise.buffer = this.noise;
    const high = context.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 7600;
    const gain = context.createGain();
    gain.gain.setValueAtTime(event.velocity * 0.5, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    noise.connect(high).connect(gain).connect(out);
    noise.start(when);
    this.track(noise, when + decay + 0.02);
  }

  private ride(context: AudioContext, out: AudioNode, event: NoteEvent, when: number): void {
    const noise = context.createBufferSource();
    noise.buffer = this.noise;
    const high = context.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 6200;
    const gain = context.createGain();
    gain.gain.setValueAtTime(event.velocity * 0.3, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.55);
    noise.connect(high).connect(gain).connect(out);
    noise.start(when);
    this.track(noise, when + 0.58);
  }

  private perc(context: AudioContext, out: AudioNode, event: NoteEvent, when: number): void {
    const osc = context.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 820;
    const gain = context.createGain();
    gain.gain.setValueAtTime(event.velocity * 0.32, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.09);
    osc.connect(gain).connect(out);
    osc.start(when);
    this.track(osc, when + 0.11);
  }

  private tom(context: AudioContext, out: AudioNode, event: NoteEvent, when: number): void {
    const osc = context.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(172, when);
    osc.frequency.exponentialRampToValueAtTime(96, when + 0.2);
    const gain = context.createGain();
    gain.gain.setValueAtTime(event.velocity * 0.6, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.26);
    osc.connect(gain).connect(out);
    osc.start(when);
    this.track(osc, when + 0.28);
  }

  private bass(context: AudioContext, out: AudioNode, event: NoteEvent, when: number): void {
    const sub = context.createOscillator();
    sub.type = "sine";
    sub.frequency.value = midiToHz(event.midi);
    const mid = context.createOscillator();
    mid.type = "triangle";
    mid.frequency.value = midiToHz(event.midi + 12);
    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 640;
    const gain = context.createGain();
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

  private pad(context: AudioContext, out: AudioNode, event: NoteEvent, when: number): void {
    const left = context.createOscillator();
    const right = context.createOscillator();
    left.type = "sawtooth";
    right.type = "sawtooth";
    left.frequency.value = midiToHz(event.midi);
    right.frequency.value = midiToHz(event.midi);
    left.detune.value = -6;
    right.detune.value = 6;
    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 960;
    const gain = context.createGain();
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

  private lead(context: AudioContext, out: AudioNode, event: NoteEvent, when: number): void {
    const osc = context.createOscillator();
    osc.type = "square";
    osc.frequency.value = midiToHz(event.midi);
    const vibrato = context.createOscillator();
    vibrato.frequency.value = 5.5;
    const depth = context.createGain();
    depth.gain.value = 7;
    vibrato.connect(depth).connect(osc.detune);
    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2400;
    const gain = context.createGain();
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
