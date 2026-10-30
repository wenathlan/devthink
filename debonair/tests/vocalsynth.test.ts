// # vocalsynth.test — the formant voice: the render is deterministic under
// the same seed, the syllables stay finite and clamped, the vowel table
// answers the documented formants and the line splitter lands syllables
// inside the span. the pattern lane (the vocal lane's first rung, wave
// PV4.005): singPattern answers a plan with voice that differs from the
// plan without — the sung line rides the melody seats on the airy lead
// seat, lifted an octave when the window holds, the seeded phrase
// breathing deciding which notes sing, the instrumental untouched.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { validatePatternProject } from "../patternenums.ts";
import { renderVoice, singPattern, syllablesOfLine, VOWEL_FORMANTS } from "../vocalsynth.ts";

/** The deterministic rng the tests ride (mulberry32, the engine's law). */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("vocalsynth — the vowel table", () => {
  it("carries the documented a-vowel formants", () => {
    assert.deepEqual([...VOWEL_FORMANTS.a], [730, 1090, 2440]);
  });
});

describe("vocalsynth — renderVoice", () => {
  const syllables = [
    { vowel: "a" as const, midi: 64, start: 0, duration: 0.4, velocity: 0.9, consonant: true },
    { vowel: "o" as const, midi: 67, start: 0.45, duration: 0.4, velocity: 0.8 },
  ];

  it("is deterministic for the same seed", () => {
    // the random stream is consumed per render — fresh seed, same take
    const first = renderVoice(syllables, { sampleRate: 44100, random: seeded(2026) });
    const again = renderVoice(syllables, { sampleRate: 44100, random: seeded(2026) });
    assert.equal(first.samples.length, again.samples.length);
    let identical = true;
    for (let i = 0; i < first.samples.length; i++) {
      if (first.samples[i] !== again.samples[i]) {
        identical = false;
        break;
      }
    }
    assert.ok(identical, "the same seed rendered a different take");
  });

  it("renders a finite, clamped, non-silent take", () => {
    const voice = renderVoice(syllables, { sampleRate: 44100, random: seeded(2026) });
    assert.ok(voice.samples.length >= Math.ceil(0.85 * 44100));
    let sum = 0;
    for (const v of voice.samples) {
      assert.ok(Number.isFinite(v));
      assert.ok(Math.abs(v) <= 1);
      sum += Math.abs(v);
    }
    assert.ok(sum > 0, "the voice rendered silence");
    assert.ok(voice.peak > 0.1, "the voice rides the normalized level law");
  });

  it("changes the timbre with the vowel", () => {
    const energy = (vowel: "a" | "i") => {
      const voice = renderVoice([{ vowel, midi: 64, start: 0, duration: 0.3, velocity: 1 }], {
        sampleRate: 44100,
        random: seeded(9),
      });
      let sum = 0;
      for (const v of voice.samples) sum += v * v;
      return Math.round(sum * 1e4);
    };
    assert.notEqual(energy("a"), energy("i"));
  });
});

describe("vocalsynth — syllablesOfLine", () => {
  const options = { sampleRate: 44100, random: seeded(7) };

  it("lands every syllable inside the span", () => {
    const syllables = syllablesOfLine("neon rain over the city", 60, 2, 3.2, options);
    assert.ok(syllables.length >= 1 && syllables.length <= 16);
    for (const s of syllables) {
      assert.ok(s.start >= 2 && s.start + s.duration <= 5.3);
      assert.ok(s.velocity > 0 && s.velocity <= 1);
    }
  });

  it("answers a fallback vowel for glyph-less text", () => {
    const syllables = syllablesOfLine("123 456", 60, 0, 1, options);
    assert.equal(syllables.length, 1);
    assert.ok(["a", "e", "i", "o", "u"].includes(syllables[0].vowel));
  });
});

// ---------------------------------------------------------------------------
// the pattern lane (the vocal lane's first rung, wave PV4.005)
// ---------------------------------------------------------------------------

/** One melody note of a plan (the pattern grammar's own shape). */
function melodyNote(
  step: number,
  pitch: number,
  voice: string,
): {
  step: number;
  pitch: number;
  vel: number;
  dur: number;
  voice: string;
} {
  return { step, pitch, vel: 0.9, dur: 2, voice };
}

/** A minimal plan carrying a lead melody, a bass line and the drum grid. */
function melodyPlan(notes: readonly ReturnType<typeof melodyNote>[]): {
  schema: "debonair.pattern/1";
  bpm: number;
  root: number;
  scale: string;
  bars: number;
  mood: string;
  prompt: string;
  drums: { kick: number[]; snare: number[]; hat: number[]; clap: number[] };
  notes: readonly ReturnType<typeof melodyNote>[];
  embedding: number[];
} {
  // the embedding law: 32 numbers (zeros are legal — the miner recomputes)
  return {
    schema: "debonair.pattern/1",
    bpm: 140,
    root: 9,
    scale: "natural-minor",
    bars: 2,
    mood: "dark trap",
    prompt: "dark trap take",
    drums: {
      kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    },
    notes,
    embedding: new Array<number>(32).fill(0),
  };
}

describe("vocalsynth — singPattern (the pattern lane's first rung)", () => {
  const melody = [
    melodyNote(0, 69, "lead"),
    melodyNote(2, 72, "lead"),
    melodyNote(4, 71, "pluck"),
    melodyNote(6, 67, "flute"),
    melodyNote(8, 69, "bass"),
    melodyNote(10, 45, "bass"),
  ];
  const plan = melodyPlan(melody);

  it("answers a plan with voice that differs from the plan without", () => {
    const sung = singPattern(plan, "voice-seed");
    assert.ok(sung !== plan, "the sung plan is a fresh document");
    assert.ok(sung.notes.length > plan.notes.length, "the sung line lands on top of the instrumental");
    for (const note of plan.notes) {
      const rides = sung.notes.some(
        (candidate) =>
          candidate.step === note.step &&
          candidate.pitch === note.pitch &&
          candidate.voice === note.voice &&
          candidate.dur === note.dur,
      );
      assert.ok(rides, `the instrumental note at step ${note.step} rides untouched`);
    }
  });

  it("sings only the melody seats, on the airy lead seat, lifted an octave", () => {
    const sung = singPattern(plan, "voice-seed");
    const melodyCount = melody.filter((note) => ["lead", "pluck", "bell", "arp", "flute"].includes(note.voice)).length;
    const sungNotes = sung.notes.slice(plan.notes.length);
    assert.ok(sungNotes.length > 0, "the voice sang at least one note");
    assert.ok(sungNotes.length <= melodyCount, "the phrase breathing never sings more than the melody");
    for (const note of sungNotes) {
      assert.equal(note.voice, "flute");
      const source = melody.find((candidate) => candidate.step === note.step);
      assert.ok(source, "each sung note sits on a melody note");
      const lift = source.pitch + 12 <= 127 ? 12 : 0;
      assert.equal(note.pitch, source.pitch + lift, "the register law: the lift when the window holds, unison else");
      assert.ok(note.vel <= source.vel, "the syllable velocity law rides under the melody");
    }
  });

  it("is deterministic under the same seed (the phrase breathing law)", () => {
    const first = singPattern(plan, "voice-seed");
    const again = singPattern(plan, "voice-seed");
    assert.deepEqual(first.notes, again.notes, "the same plan and seed answer the same sung line");
    const other = singPattern(plan, "voice-seed-two");
    assert.notDeepEqual(first.notes, other.notes, "a fresh seed answers a fresh sung line");
  });

  it("answers the plan itself when the melody is silent", () => {
    const silent = melodyPlan([melodyNote(0, 45, "bass")]);
    assert.equal(singPattern(silent, "voice-seed"), silent, "nothing to sing — the honest empty lane");
  });

  it("answers a plan that passes its own contract (the validator law)", () => {
    const sung = singPattern(plan, "voice-seed");
    const checked = validatePatternProject(sung);
    assert.ok(checked.ok, `the sung plan failed its contract: ${checked.ok ? "" : checked.message}`);
  });
});
