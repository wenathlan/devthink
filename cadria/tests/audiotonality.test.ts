// # audiotonality.test — the tonality layer: the hann-windowed STFT stand-in,
// the a440 bin→pitch-class chroma fold, the Krumhansl-Schmuckler key estimate,
// the chord timeline with greedy smoothing and the HarmonicStats summary,
// runnable with the node built-in runner (no dependencies, no install):
//   node --test tests/audiotonality.test.ts
// Every fixture is a deterministic synthetic waveform (sines at
// equal-tempered a440 pitches, octave 4+) and every test watches the two
// invariants the module promises: clean tonal input lands on the right
// tonic/chord, and damaged or silent input answers zeros or an empty
// timeline instead of NaN.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chromaVector, chromagram, estimateKey, harmonicStats, keyName, keyProfiles, pitchClassNames, spectrumFrames } from "../audiotonality.ts";
import { CHORD_INTERVALS, chordTemplates, detectChords } from "../audiotonalitychords.ts";

const RATE = 44100;
const FRAME_MS = (1000 * 2048) / 44100;

function noteHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function tone(freq: number, seconds: number, amp: number): Float32Array {
  const count = Math.round(seconds * RATE);
  const out = new Float32Array(count);
  for (let i = 0; i < count; i += 1) out[i] = amp * Math.sin((2 * Math.PI * freq * i) / RATE);
  return out;
}

function chord(parts: readonly Float32Array[]): Float32Array {
  const total = Math.max(...parts.map((part) => part.length));
  const out = new Float32Array(total);
  for (const part of parts) for (let i = 0; i < part.length; i += 1) out[i] += part[i];
  return out;
}

function sequence(parts: readonly Float32Array[]): Float32Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Float32Array(total);
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

function meanChromaOf(frames: readonly Float32Array[]): Float32Array {
  const mean = new Float32Array(12);
  for (const frame of frames) for (let i = 0; i < 12; i += 1) mean[i] += frame[i];
  for (let i = 0; i < 12; i += 1) mean[i] /= frames.length;
  return mean;
}

/** sustained triad chroma frame (1/3 per chord tone) built from the shared interval table. */
function triadChroma(root: number, quality: "maj" | "min"): Float32Array {
  const chroma = new Float32Array(12);
  for (const interval of CHORD_INTERVALS[quality]) chroma[(root + interval) % 12] = 1 / 3;
  return chroma;
}

// sustained c major scale (c4…b4) with the tonic triad twice the amplitude of the passing tones
const C_MAJOR_SAMPLES = chord([
  tone(noteHz(60), 1, 0.3),
  tone(noteHz(62), 1, 0.12),
  tone(noteHz(64), 1, 0.3),
  tone(noteHz(65), 1, 0.12),
  tone(noteHz(67), 1, 0.3),
  tone(noteHz(69), 1, 0.12),
  tone(noteHz(71), 1, 0.12),
]);

// sustained a natural minor (a3…g4) with the a minor triad doubled in amplitude
const A_MINOR_SAMPLES = chord([
  tone(noteHz(57), 1, 0.3),
  tone(noteHz(59), 1, 0.12),
  tone(noteHz(60), 1, 0.3),
  tone(noteHz(62), 1, 0.12),
  tone(noteHz(64), 1, 0.3),
  tone(noteHz(65), 1, 0.12),
  tone(noteHz(67), 1, 0.12),
]);

// the c–f–g–c progression, four 0.4 s major triads in octave 4/5
const CHORD_SECONDS = 0.4;
function triadSamples(rootMidi: number): Float32Array {
  return chord([0, 4, 7].map((interval) => tone(noteHz(rootMidi + interval), CHORD_SECONDS, 0.25)));
}
const PROGRESSION_SAMPLES = sequence([triadSamples(60), triadSamples(65), triadSamples(67), triadSamples(60)]);

const SINE_SAMPLES = tone(440, 1, 0.2); // pure a440
const PROGRESSION_CHROMA = chromagram(spectrumFrames(PROGRESSION_SAMPLES), RATE);

describe("audiotonality chroma", () => {
  it("folds a pure a440 sine into chroma bin 9", () => {
    const [frame] = spectrumFrames(SINE_SAMPLES);
    assert.ok(frame);
    const chroma = chromaVector(frame, RATE);
    for (let pc = 0; pc < 12; pc += 1) {
      if (pc === 9) continue;
      assert.ok(chroma[9] > chroma[pc], `bin 9 dominates bin ${pc}`);
    }
    assert.ok(chroma[9] > 0.7);
  });

  it("normalizes chroma to a unit l1 sum and guards NaN magnitudes", () => {
    const magnitudes = new Float32Array(513);
    magnitudes[5] = 2; // 5 × 44100/1024 ≈ 215 Hz → pitch class 9
    magnitudes[2] = Number.NaN;
    magnitudes[7] = Number.POSITIVE_INFINITY;
    const chroma = chromaVector(magnitudes, RATE);
    const sum = chroma.reduce((total, value) => total + value, 0);
    assert.ok(Math.abs(sum - 1) < 1e-3);
    assert.ok(Math.abs(chroma[9] - 1) < 1e-3);
    assert.equal(chroma.some((value) => !Number.isFinite(value)), false);
    const poisoned = new Float32Array(513).fill(Number.NaN);
    const silent = chromaVector(poisoned, RATE);
    assert.equal(silent.reduce((total, value) => total + value, 0), 0);
    assert.equal(silent.some((value) => !Number.isFinite(value)), false);
  });

  it("shapes one 12-bin frame per stft hop", () => {
    const frames = spectrumFrames(SINE_SAMPLES);
    assert.equal(frames.length, Math.floor((SINE_SAMPLES.length - 4096) / 2048) + 1);
    assert.equal(frames[0].length, 2049);
    const chroma = chromagram(frames, RATE);
    assert.equal(chroma.length, frames.length);
    for (const frame of chroma) {
      assert.equal(frame.length, 12);
      assert.ok(Math.abs(frame.reduce((total, value) => total + value, 0) - 1) < 1e-3);
    }
    assert.equal(chromagram(frames, RATE, 0).length, 0);
  });
});

describe("audiotonality key", () => {
  it("names pitch classes and keys in lowercase", () => {
    assert.deepEqual([...pitchClassNames], ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"]);
    assert.equal(keyName({ tonic: 0, mode: "major" }), "c major");
    assert.equal(keyName({ tonic: 9, mode: "minor" }), "a minor");
    assert.equal(keyName({ tonic: Number.NaN, mode: "major" }), "");
    assert.equal(keyProfiles.major.length, 12);
    assert.equal(keyProfiles.minor.length, 12);
  });

  it("hears c major in the c major scale fixture", () => {
    const chroma = chromagram(spectrumFrames(C_MAJOR_SAMPLES), RATE);
    const key = estimateKey(meanChromaOf(chroma));
    assert.equal(key.tonic, 0);
    assert.equal(key.mode, "major");
    assert.ok(key.strength > 0.5, `strength ${key.strength}`);
    assert.equal(keyName(key), "c major");
  });

  it("hears a minor in the a minor fixture", () => {
    const chroma = chromagram(spectrumFrames(A_MINOR_SAMPLES), RATE);
    const key = estimateKey(meanChromaOf(chroma));
    assert.equal(key.tonic, 9);
    assert.equal(key.mode, "minor");
    assert.ok(key.strength > 0.5, `strength ${key.strength}`);
    assert.equal(keyName(key), "a minor");
  });

  it("ranks the 23 alternatives below the winner", () => {
    const key = estimateKey(meanChromaOf(chromagram(spectrumFrames(C_MAJOR_SAMPLES), RATE)));
    assert.equal(key.alternatives.length, 23);
    assert.ok(key.alternatives.every((candidate) => candidate.strength <= key.strength));
    for (let i = 1; i < key.alternatives.length; i += 1) {
      assert.ok(key.alternatives[i - 1].strength >= key.alternatives[i].strength, `rank ${i}`);
    }
    assert.ok(key.alternatives.every((candidate) => candidate.tonic >= 0 && candidate.tonic <= 11));
    assert.ok(key.alternatives.every((candidate) => candidate.mode === "major" || candidate.mode === "minor"));
  });
});

describe("audiotonalitychords", () => {
  it("folds the 7 qualities over 12 roots into 84 templates", () => {
    assert.equal(chordTemplates.length, 84);
    assert.equal(new Set(chordTemplates.map((template) => template.quality)).size, 7);
    const maj = chordTemplates[0];
    assert.equal(maj.root, 0);
    assert.equal(maj.quality, "maj");
    for (let pc = 0; pc < 12; pc += 1) {
      assert.equal(maj.weights[pc], CHORD_INTERVALS.maj.includes(pc) ? 1 : 0);
    }
    assert.ok(chordTemplates.every((template) => template.weights.reduce((total, value) => total + value, 0) >= 1));
  });

  it("traces the c–f–g–c progression into four major segments", () => {
    const timeline = detectChords(PROGRESSION_CHROMA, { minFramesPerChord: 4, frameMs: FRAME_MS });
    assert.equal(timeline.length, 4);
    assert.deepEqual(timeline.map((segment) => segment.root), [0, 5, 7, 0]);
    assert.ok(timeline.every((segment) => segment.quality === "maj"));
    for (let i = 0; i < timeline.length; i += 1) {
      assert.ok(Number.isFinite(timeline[i].startMs) && Number.isFinite(timeline[i].endMs));
      assert.ok(timeline[i].endMs > timeline[i].startMs);
      assert.ok(timeline[i].confidence > 0 && timeline[i].confidence <= 1);
      if (i > 0) assert.ok(timeline[i].startMs >= timeline[i - 1].endMs, `segment ${i} monotonic`);
    }
  });

  it("merges rapid chord flips into one segment", () => {
    const frames: Float32Array[] = [];
    for (let i = 0; i < 12; i += 1) frames.push(i % 2 === 0 ? triadChroma(0, "maj") : triadChroma(5, "maj"));
    const timeline = detectChords(frames, { minFramesPerChord: 3, frameMs: 100 });
    assert.equal(timeline.length, 1);
    assert.equal(timeline[0].quality, "maj");
    assert.equal(timeline[0].startMs, 0);
    assert.equal(timeline[0].endMs, 1200);
    assert.ok(Number.isFinite(timeline[0].confidence) && timeline[0].confidence <= 1);
  });

  it("answers an empty timeline for empty or silent chromagrams", () => {
    assert.equal(detectChords([], { minFramesPerChord: 1 }).length, 0);
    assert.equal(detectChords([new Float32Array(12), new Float32Array(12)], { minFramesPerChord: 1 }).length, 0);
  });
});

describe("harmonicstats", () => {
  it("scores flat noise more dissonant than a major triad", () => {
    const flat: Float32Array[] = Array.from({ length: 12 }, () => new Float32Array(12).fill(1 / 12));
    const triad: Float32Array[] = Array.from({ length: 12 }, () => triadChroma(0, "maj"));
    const flatStats = harmonicStats(flat, RATE);
    const triadStats = harmonicStats(triad, RATE);
    assert.ok(flatStats.dissonanceIndex > triadStats.dissonanceIndex);
    assert.ok(flatStats.dissonanceIndex > 0.95);
    assert.ok(triadStats.dissonanceIndex < 0.6);
  });

  it("counts chord changes per second across the progression", () => {
    const stats = harmonicStats(PROGRESSION_CHROMA, RATE);
    assert.ok(stats.harmonicChangeRate > 2 && stats.harmonicChangeRate < 3.5, `rate ${stats.harmonicChangeRate}`);
    const energy = stats.chromaEnergy.reduce((total, value) => total + value, 0);
    assert.ok(Math.abs(energy - 1) < 1e-3);
    assert.equal(stats.chromaEnergy.length, 12);
  });

  it("repeats bit-identical stats for the same fixture", () => {
    const mean = meanChromaOf(PROGRESSION_CHROMA);
    assert.deepEqual(estimateKey(mean), estimateKey(mean));
    assert.deepEqual(harmonicStats(PROGRESSION_CHROMA, RATE), harmonicStats(PROGRESSION_CHROMA, RATE, { hop: 2048 }));
  });

  it("keeps every stats field finite and NaN-free", () => {
    const stats = harmonicStats(PROGRESSION_CHROMA, RATE);
    const flat = harmonicStats(Array.from({ length: 4 }, () => new Float32Array(12)), RATE);
    const empty = harmonicStats([], RATE);
    for (const candidate of [stats, flat, empty]) {
      assert.ok(Number.isFinite(candidate.key.strength));
      assert.ok(Number.isFinite(candidate.harmonicChangeRate));
      assert.ok(Number.isFinite(candidate.dissonanceIndex));
      assert.ok(candidate.chromaEnergy.every(Number.isFinite));
      assert.ok(candidate.key.alternatives.every((alternative) => Number.isFinite(alternative.strength)));
    }
    assert.equal(empty.key.strength, 0);
    assert.equal(empty.harmonicChangeRate, 0);
    assert.equal(empty.dissonanceIndex, 0);
    const timeline = detectChords(PROGRESSION_CHROMA, { frameMs: FRAME_MS });
    assert.ok(timeline.every((segment) => [segment.startMs, segment.endMs, segment.root, segment.confidence].every(Number.isFinite)));
  });
});
