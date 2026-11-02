// # formant.test — the source-filter vocal lane: the vowel table keeps its
// pinned seats through the new home (the syllable lane re-exports them),
// the bank derives the five poles (F1..F3 from the table, the fixed klatt
// tail, the f/10 bandwidths), the sung render carries the pitch of its
// note (a periodic source answers its f0 at the zero crossings), the
// vowels colour the spectrum apart (the F2 law), the diphthong glide moves
// the formants across the event, the speech seats render (the breath and
// the consonant burst), the level law scales the velocity after the
// normalization, the two glottal sources answer different bytes, and the
// bounce integration rides (formantEventsOf over a composed plan, the
// voice mix deterministic, renderPlan's voice option answering a different
// wav than the instrumental bounce).
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { composeFromProfile } from "../composer.ts";
import {
  FORMANT_TARGET_PEAK,
  glideBank,
  glottalSaw,
  renderFormantPhrase,
  rosenbergPulse,
  vowelBank,
  VOWEL_FORMANTS,
  type Vowel,
} from "../formant.ts";
import type { GenreProfile } from "../patternminer.ts";
import { RENDER_SAMPLE_RATE, formantEventsOf, renderPlan, renderVoiceMix } from "../renderworker.ts";
import { FFT_SIZE, frameSpectrum } from "../spectrum.ts";
import { VOWEL_FORMANTS as REEXPORTED } from "../vocalsynth.ts";

/** The render rate the lane rides (the mastering law). */
const SR = RENDER_SAMPLE_RATE;

/** The deterministic seeded rng the tests ride (mulberry32, the engine's law). */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The dominant spectral peak of a window, hz (the strongest bin). */
function dominantHz(samples: Float32Array, from: number): number {
  const frame = new Array<number>(FFT_SIZE).fill(0);
  for (let i = 0; i < FFT_SIZE; i++) frame[i] = samples[from + i] ?? 0;
  const spectrum = frameSpectrum(frame, SR);
  let best = 1;
  let bestMag = 0;
  for (let b = 1; b < spectrum.magnitudes.length; b++) {
    if ((spectrum.magnitudes[b] ?? 0) > bestMag) {
      bestMag = spectrum.magnitudes[b] ?? 0;
      best = b;
    }
  }
  return best * spectrum.binHz;
}

/** The spectral centroid of a slice, hz. */
function centroidHz(samples: Float32Array, from: number, count: number): number {
  const frame = new Array<number>(FFT_SIZE).fill(0);
  for (let i = 0; i < FFT_SIZE; i++) frame[i] = samples[from + Math.floor(count / 2) - FFT_SIZE / 2 + i] ?? 0;
  const spectrum = frameSpectrum(frame, SR);
  let sum = 0;
  let weighted = 0;
  for (let b = 1; b < spectrum.magnitudes.length; b++) {
    const mag = spectrum.magnitudes[b] ?? 0;
    sum += mag;
    weighted += mag * b * spectrum.binHz;
  }
  return sum > 0 ? weighted / sum : 0;
}

/** The rms of a slice. */
function rms(samples: Float32Array, from: number, count: number): number {
  let sum = 0;
  for (let i = from; i < from + count && i < samples.length; i++) sum += (samples[i] ?? 0) ** 2;
  return Math.sqrt(sum / Math.max(1, count));
}

/** One sung event at the given pitch. */
function sung(midi: number, vowel: Vowel, duration = 0.4): Parameters<typeof renderFormantPhrase>[0][number] {
  return { start: 0, duration, velocity: 1, vowels: [vowel], midi, voiced: true };
}

describe("formant — the vowel table and the bank", () => {
  it("keeps the pinned a-vowel seats through the new home and the re-export", () => {
    assert.deepEqual([...VOWEL_FORMANTS.a], [730, 1090, 2440]);
    assert.deepEqual(REEXPORTED, VOWEL_FORMANTS, "the syllable lane re-exports the one table");
  });

  it("derives the five poles: the table's F1..F3, the fixed tail, the f/10 bandwidths", () => {
    for (const vowel of ["a", "e", "i", "o", "u"] as Vowel[]) {
      const bank = vowelBank(vowel);
      assert.equal(bank.length, 5);
      for (let index = 0; index < 3; index++) {
        assert.equal(bank[index]?.hz, VOWEL_FORMANTS[vowel][index]);
        assert.ok(Math.abs((bank[index]?.bw ?? 0) - (bank[index]?.hz ?? 0) / 10) < 1e-9, "the f/10 law");
      }
      assert.ok((bank[3]?.hz ?? 0) < (bank[4]?.hz ?? 1), "the fixed tail ascends");
    }
    // the glide interpolates the poles and keeps the gains
    const glide = glideBank(vowelBank("a"), vowelBank("i"), 0.5);
    assert.ok(
      Math.abs((glide[1]?.hz ?? 0) - (VOWEL_FORMANTS.a[1] + VOWEL_FORMANTS.i[1]) / 2) < 1e-6,
      "the F2 seat crosses the midpoint",
    );
    assert.deepEqual(
      glide.map((pole) => pole.gain),
      vowelBank("a").map((pole) => pole.gain),
    );
  });

  it("carries both glottal source models as bounded, distinct seats", () => {
    assert.ok(Math.abs(glottalSaw(0.25)) > 0);
    assert.ok(Math.abs(rosenbergPulse(0.3)) > 0);
    for (const phase of [0, 0.25, 0.5, 0.9]) {
      assert.ok(Math.abs(glottalSaw(phase)) <= 4);
      assert.ok(rosenbergPulse(phase) >= -0.001 && rosenbergPulse(phase) <= 1.001);
    }
    assert.notEqual(glottalSaw(0.25), rosenbergPulse(0.25));
  });
});

describe("formant — the sung render", () => {
  it("renders a finite, non-silent, deterministic phrase", () => {
    const events = [sung(69, "a", 0.4), { ...sung(72, "o", 0.3), start: 0.5 }];
    const first = renderFormantPhrase(events, { sampleRate: SR, random: seeded(2026) });
    const second = renderFormantPhrase(events, { sampleRate: SR, random: seeded(2026) });
    assert.equal(first.samples.length, Math.ceil(0.8 * SR));
    let sum = 0;
    for (const sample of first.samples) {
      assert.ok(Number.isFinite(sample));
      sum += Math.abs(sample);
    }
    assert.ok(sum > 0, "the phrase rendered silence");
    for (let i = 0; i < first.samples.length; i++) {
      assert.equal(first.samples[i], second.samples[i], "the same seed answered a different phrase");
    }
  });

  it("carries the note's pitch in its harmonics (the source law)", () => {
    const phrase = renderFormantPhrase([sung(69, "u", 0.5)], { sampleRate: SR, random: seeded(9) });
    const dominant = dominantHz(phrase.samples, Math.round(0.15 * SR));
    const harmonic = Math.abs(dominant - 440) < 12 || Math.abs(dominant - 880) < 12;
    assert.ok(
      harmonic,
      `the sung a4 answers its strongest partial at ${dominant.toFixed(1)} hz — neither 440 nor its octave`,
    );
  });

  it("colours the vowels apart (the F2 law moves the centroid)", () => {
    const a = renderFormantPhrase([sung(81, "a", 0.4)], { sampleRate: SR, random: seeded(4) });
    const i = renderFormantPhrase([sung(81, "i", 0.4)], { sampleRate: SR, random: seeded(4) });
    const centroidA = centroidHz(a.samples, Math.round(0.1 * SR), Math.round(0.2 * SR));
    const centroidI = centroidHz(i.samples, Math.round(0.1 * SR), Math.round(0.2 * SR));
    assert.ok(
      centroidI > centroidA * 1.2,
      `the i-vowel centroid ${centroidI.toFixed(0)} must sit above the a ${centroidA.toFixed(0)}`,
    );
  });

  it("moves the formants across a diphthong glide", () => {
    const glide = renderFormantPhrase(
      [{ start: 0, duration: 0.6, velocity: 1, vowels: ["a", "i"], midi: 81, voiced: true }],
      { sampleRate: SR, random: seeded(4) },
    );
    const head = centroidHz(glide.samples, Math.round(0.04 * SR), Math.round(0.1 * SR));
    const tail = centroidHz(glide.samples, Math.round(0.5 * SR), Math.round(0.1 * SR));
    assert.ok(
      tail > head * 1.08,
      `the glide's tail centroid ${tail.toFixed(0)} must climb above its head ${head.toFixed(0)}`,
    );
  });

  it("scales the velocity after the normalization (the level law)", () => {
    const loud = renderFormantPhrase([sung(64, "e", 0.3)], { sampleRate: SR, random: seeded(7) });
    const quiet = renderFormantPhrase([{ ...sung(64, "e", 0.3), velocity: 0.25 }], {
      sampleRate: SR,
      random: seeded(7),
    });
    assert.ok(loud.peak > FORMANT_TARGET_PEAK * 0.9 && loud.peak <= FORMANT_TARGET_PEAK + 0.05);
    const ratio = loud.peak / Math.max(1e-9, quiet.peak);
    assert.ok(Math.abs(ratio - 4) < 0.2, `the velocity law answered ${ratio.toFixed(3)}, not 4`);
  });

  it("answers the two glottal sources with different bytes", () => {
    const saw = renderFormantPhrase([sung(64, "a", 0.3)], {
      sampleRate: SR,
      random: seeded(11),
      source: "saw",
    });
    const pulse = renderFormantPhrase([sung(64, "a", 0.3)], {
      sampleRate: SR,
      random: seeded(11),
      source: "pulse",
    });
    assert.notDeepEqual([...saw.samples.slice(0, 2400)], [...pulse.samples.slice(0, 2400)]);
  });
});

describe("formant — the speech seats", () => {
  it("renders a breath event (the noise source through the bank)", () => {
    const breath = renderFormantPhrase(
      [{ start: 0, duration: 0.3, velocity: 1, vowels: ["o"], hz: 120, voiced: false }],
      { sampleRate: SR, random: seeded(3) },
    );
    let sum = 0;
    for (const sample of breath.samples) {
      assert.ok(Number.isFinite(sample));
      sum += Math.abs(sample);
    }
    assert.ok(sum > 0, "the breath rendered silence");
  });

  it("adds the consonant burst at the event's head", () => {
    const plain = renderFormantPhrase([{ start: 0, duration: 0.2, velocity: 1, vowels: ["a"], hz: 120, voiced: true }], {
      sampleRate: SR,
      random: seeded(5),
    });
    const burst = renderFormantPhrase(
      [{ start: 0, duration: 0.2, velocity: 1, vowels: ["a"], hz: 120, voiced: true, consonant: true }],
      { sampleRate: SR, random: seeded(5) },
    );
    const head = Math.round(0.02 * SR);
    assert.notDeepEqual(
      [...burst.samples.slice(0, head)],
      [...plain.samples.slice(0, head)],
      "the consonant must colour the event's head",
    );
    // the burst decays away: the tails agree
    const from = Math.round(0.1 * SR);
    const tailDiff = Math.abs(rms(burst.samples, from, head) - rms(plain.samples, from, head));
    assert.ok(tailDiff < 0.05, `the burst leaked past its window (${tailDiff.toFixed(4)})`);
  });
});

describe("formant — the bounce integration (the second rung)", () => {
  const profile: GenreProfile = {
    schema: "debonair.profile/1",
    genre: "trap",
    referenceIds: ["ref-f1", "ref-f2"],
    trainedOn: 2,
    bpm: { min: 138, median: 140, max: 144, histogram: [0, 0, 0, 0, 2, 0, 0, 0] },
    keyPool: [{ name: "A minor", weight: 0.75 }],
    onsetDensity: [1, 0.3, 0.55, 0.3, 1, 0.3, 0.55, 0.3, 1, 0.3, 0.55, 0.3, 1, 0.3, 0.55, 0.3],
    bandBalance: { low: 0.55, mid: 0.26, high: 0.19 },
    loudness: { target: -9, min: -9.5, max: -8.5 },
    centroid: new Array<number>(22).fill(0.2),
    chromaProfile: new Array<number>(12).fill(1 / 12),
    updatedAt: "2026-05-01T00:00:00.000Z",
  };
  const plan = composeFromProfile("dark trap, hard 808s, 140 bpm", profile);
  const memory = {
    blobs: new Map<string, { bytes: Uint8Array; kind: string }>(),
    async put(bytes: Uint8Array, kind: string) {
      const id = String(this.blobs.size + 1);
      this.blobs.set(id, { bytes, kind });
      return { ok: true as const, pointer: { id, bytes: bytes.length, sha256: "", kind } };
    },
  };

  it("folds the sung line onto formant events inside the plan's span", () => {
    const events = formantEventsOf(plan, "formant-test");
    assert.ok(events.length > 0, "the composed plan carries a melody the voice sings");
    const span = (plan.bars * 16 * 60) / (plan.bpm * 4);
    for (const event of events) {
      assert.ok(event.start >= 0 && event.start < span, "the event lands inside the plan's span");
      assert.ok(event.duration > 0);
      assert.equal(event.voiced, true);
      assert.ok(event.midi !== undefined && event.midi > 40 && event.midi <= 127);
    }
    const again = formantEventsOf(plan, "formant-test");
    assert.deepEqual(again, events, "the sung line is deterministic");
    const fresh = formantEventsOf(plan, "formant-test-2");
    assert.ok(
      fresh.some((event, index) => event.vowels[0] !== events[index]?.vowels[0]) || fresh.length !== events.length,
      "a fresh seed answers a fresh vowel line",
    );
  });

  it("renders the voice mix deterministic and non-silent at the house rate", () => {
    const first = renderVoiceMix(plan, "formant-test");
    const second = renderVoiceMix(plan, "formant-test");
    assert.equal(first.length, second.length);
    for (let i = 0; i < first.length; i++) assert.equal(first[i], second[i]);
    let sum = 0;
    for (const sample of first) sum += Math.abs(sample);
    assert.ok(sum > 0, "the voice mix rendered silence");
  });

  it("answers a different bounce with the voice bus riding", async () => {
    const instrumental = await renderPlan(plan, "formant-test", memory);
    const sung = await renderPlan(plan, "formant-test", memory, undefined, { voice: true });
    assert.ok(instrumental.ok && sung.ok);
    if (!instrumental.ok || !sung.ok) return;
    assert.notDeepEqual(
      [...instrumental.bytes.slice(0, 2000)],
      [...sung.bytes.slice(0, 2000)],
      "the voice bus must colour the bounce",
    );
    assert.equal(sung.durationSeconds, instrumental.durationSeconds);
  });
});
