// # vocalsynth — the formant voice of the katexis engine (root layer): the
// sample-accurate vowel synthesizer the engine corpus documents (doc 16 of
// outros.debonair). A glottal saw source rides a three-formant bandpass bank
// (the vowel table), syllables land on the grid, vibrato is seeded so the
// same take answers the same voice. Pure math — the transport renders it.

/** The five-vowel formant table (hz), F1/F2/F3 per vowel. */
export const VOWEL_FORMANTS: Readonly<Record<Vowel, readonly [number, number, number]>> = {
  a: [730, 1090, 2440],
  e: [530, 1840, 2480],
  i: [270, 2290, 3010],
  o: [570, 840, 2410],
  u: [300, 870, 2240],
};

/** The vowel id the syllables carry. */
export type Vowel = "a" | "e" | "i" | "o" | "u";

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

/** Applies one RBJ bandpass biquad in place over the samples. */
function bandpass(samples: Float32Array, f0: number, q: number, sampleRate: number): void {
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
    const x0 = samples[i];
    const y0 = (b0 / a0) * x0 + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
    samples[i] = y0;
  }
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
    bandpass(buffer, formants[f], 9 - f * 2, options.sampleRate);
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
    return { vowel, midi, start: start + i * per, duration: per * 0.92, velocity: 0.8, consonant: i === 0 };
  });
}
