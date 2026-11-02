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

import { hashSeed, mulberry32 } from "./harmonyengine.ts";
import { applyBandpass, type Vowel, VOWEL_FORMANTS } from "./formant.ts";
import { type PatternNoteEvent, type PatternProject, validatePatternProject } from "./patternenums.ts";

// the formant table and the vowel id live in their one home, formant.ts
// (the source-filter lane owns the resonator law and the poles); the
// public surface this lane always carried re-exports them so the pinned
// contracts keep reading the same seats through the same names.
export { VOWEL_FORMANTS } from "./formant.ts";
export type { Vowel } from "./formant.ts";

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
  /** The sample rate (the take spec pins 44100). */
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
