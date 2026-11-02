// # demix.test — the four-stem demix: the conservation law (the four
// stems sum back to the input within float tolerance — the separation
// never invents or loses energy), the routing law (a sine answers the
// stem whose band owns it, a transient answers the drums), the wav
// answers (mono pcm 16, one file per stem, the header parsing back),
// the determinism of the whole walk and the honest machine codes.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { DEMIX_STEM_NAMES, DemixError, demix, demixToWavs, type DemixResult } from "../demix.ts";
import { wavInfo } from "../wavwriter.ts";

/** The house rate the fixtures ride. */
const SR = 48000;

/** A sine of the given frequency and length. */
function sine(hz: number, seconds: number): Float32Array {
  const out = new Float32Array(Math.round(seconds * SR));
  for (let i = 0; i < out.length; i++) out[i] = 0.5 * Math.sin((2 * Math.PI * hz * i) / SR);
  return out;
}

/** A percussive click train: short broadband bursts, the drum fixture. */
function clicks(count: number, spacingSeconds: number): Float32Array {
  const burst = Math.round(0.02 * SR);
  const out = new Float32Array(Math.round(count * spacingSeconds * SR));
  for (let hit = 0; hit < count; hit++) {
    const at = Math.round(hit * spacingSeconds * SR);
    for (let i = 0; i < burst; i++) out[at + i] = (i % 2 === 0 ? 1 : -1) * (1 - i / burst);
  }
  return out;
}

/** The rms of a pcm. */
function rms(pcm: Float32Array): number {
  let sum = 0;
  for (const sample of pcm) sum += sample * sample;
  return Math.sqrt(sum / Math.max(1, pcm.length));
}

/** The worst absolute difference of two equal-length pcms. */
function worstDiff(a: Float32Array, b: Float32Array): number {
  let worst = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = Math.abs((a[i] ?? 0) - (b[i] ?? 0));
    if (diff > worst) worst = diff;
  }
  return worst;
}

describe("demix — the conservation law", () => {
  const mix = clicks(4, 0.3);
  const tone = sine(110, 1.2);
  const both = Float32Array.from({ length: tone.length }, (_, i) => (tone[i] ?? 0) + (mix[i] ?? 0) * 0.7);

  it("answers the four stems in the canonical order, each the input's length", () => {
    const result = demix(both, SR);
    assert.deepEqual(
      result.stems.map((stem) => stem.name),
      [...DEMIX_STEM_NAMES],
    );
    for (const stem of result.stems) {
      assert.equal(stem.pcm.length, both.length, `the ${stem.name} stem answers the input's length`);
      for (const sample of stem.pcm) assert.ok(Number.isFinite(sample));
    }
  });

  it("sums the four stems back to the input within float tolerance", () => {
    const result = demix(both, SR);
    const sum = new Float32Array(both.length);
    for (const stem of result.stems) {
      for (let i = 0; i < stem.pcm.length; i++) sum[i] += stem.pcm[i] ?? 0;
    }
    // measure inside the frame grid, away from the ola edges
    const from = Math.round(0.05 * SR);
    const count = both.length - Math.round(0.1 * SR);
    const worst = worstDiff(sum.subarray(from, from + count), both.subarray(from, from + count));
    assert.ok(worst < 1e-3, `the four stems miss the input by ${worst.toExponential(3)}`);
  });
});

describe("demix — the routing law", () => {
  it("routes a sustained sub-bass sine to the bass stem", () => {
    const result = demix(sine(80, 1.0), SR);
    const bassRms = rms(result.bass.pcm);
    const others = [result.vocals, result.drums, result.other].map((stem) => rms(stem.pcm));
    assert.ok(
      bassRms > Math.max(...others) * 4,
      `the bass stem rms ${bassRms.toFixed(4)} must own the 80 hz sine against ${others.map((v) => v.toFixed(4)).join(", ")}`,
    );
  });

  it("routes a sustained vocal-band sine to the vocals stem", () => {
    const result = demix(sine(700, 1.0), SR);
    const vocalsRms = rms(result.vocals.pcm);
    const others = [result.drums, result.bass, result.other].map((stem) => rms(stem.pcm));
    assert.ok(
      vocalsRms > Math.max(...others) * 4,
      `the vocals stem rms ${vocalsRms.toFixed(4)} must own the 700 hz sine`,
    );
  });

  it("routes a sustained brilliance-band sine to the other stem", () => {
    const result = demix(sine(9000, 1.0), SR);
    const otherRms = rms(result.other.pcm);
    const others = [result.vocals, result.drums, result.bass].map((stem) => rms(stem.pcm));
    assert.ok(
      otherRms > Math.max(...others) * 4,
      `the other stem rms ${otherRms.toFixed(4)} must own the 9 khz sine`,
    );
  });

  it("routes a percussive click train to the drums stem", () => {
    const result = demix(clicks(6, 0.25), SR);
    const drumsRms = rms(result.drums.pcm);
    const others = [result.vocals, result.bass, result.other].map((stem) => rms(stem.pcm));
    assert.ok(
      drumsRms > Math.max(...others) * 2,
      `the drums stem rms ${drumsRms.toFixed(4)} must own the click train`,
    );
  });
});

describe("demix — the wav answers and the machine codes", () => {
  it("renders one mono pcm 16 wav per stem, the header parsing back", () => {
    const wavs = demixToWavs(sine(440, 0.6), SR);
    assert.equal(wavs.length, DEMIX_STEM_NAMES.length);
    for (const wav of wavs) {
      assert.equal(wav.file, `${wav.name}.wav`);
      const info = wavInfo(wav.bytes);
      assert.equal(info.sampleRate, SR);
      assert.equal(info.channels, 1);
      assert.equal(info.bitDepth, 16);
      assert.ok(info.frames > 0, `the ${wav.name} wav carries frames`);
    }
  });

  it("is deterministic — the same input answers the same stems", () => {
    const input = sine(330, 0.5);
    const first = demix(input, SR);
    const second = demix(input, SR);
    for (const name of DEMIX_STEM_NAMES) {
      const a = first[name as keyof DemixResult] as { pcm: Float32Array };
      const b = second[name as keyof DemixResult] as { pcm: Float32Array };
      assert.deepEqual([...a.pcm.slice(0, 4800)], [...b.pcm.slice(0, 4800)], `the ${name} stem must repeat`);
    }
  });

  it("refuses an empty signal and a broken rate with the machine codes", () => {
    assert.throws(() => demix(new Float32Array(0), SR), (error: unknown): boolean => {
      return error instanceof DemixError && error.code === "empty-signal";
    });
    assert.throws(() => demix(sine(100, 0.1), 0), (error: unknown): boolean => {
      return error instanceof DemixError && error.code === "bad-rate";
    });
    assert.throws(() => demix(sine(100, 0.1), Number.NaN), (error: unknown): boolean => {
      return error instanceof DemixError && error.code === "bad-rate";
    });
  });
});
