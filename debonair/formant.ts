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

import { hashSeed, mulberry32 } from "./harmonyengine.ts";
import { midiToHz } from "./tuning.ts";

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
