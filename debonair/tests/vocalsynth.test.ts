// # vocalsynth.test — the formant voice: the render is deterministic under
// the same seed, the syllables stay finite and clamped, the vowel table
// answers the documented formants and the line splitter lands syllables
// inside the span.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { renderVoice, syllablesOfLine, VOWEL_FORMANTS } from "../vocalsynth.ts";

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
