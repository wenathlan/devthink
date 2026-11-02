// # timestretch.test — the phase vocoder executor: the length law (the
// output timeline answers the ratio), the pitch law (a stretched tone
// keeps its frequency — the vocoder's whole point), the beat law (a click
// track's onsets land at the stretched spacing), the identity pass (a
// ratio of one reconstructs the input within the ola tolerance), the
// determinism of the transform and the honest machine codes of the band
// law. the fft window law rides the shared spectrum tables — no kernel is
// re-implemented here, the test only measures what the executor answers.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { onsetSecondsOf } from "../ingest.ts";
import { FFT_SIZE, frameSpectrum } from "../spectrum.ts";
import { STRETCH_RATIO_MAX, STRETCH_RATIO_MIN, StretchError, stretchPcm } from "../timestretch.ts";

/** The house rate the tests render at (the mastering law). */
const SR = 48000;

/** A sine of the given frequency and length. */
function sine(hz: number, seconds: number, phase = 0): Float32Array {
  const out = new Float32Array(Math.round(seconds * SR));
  for (let i = 0; i < out.length; i++) out[i] = Math.sin((2 * Math.PI * hz * i) / SR + phase);
  return out;
}

/** A click track: a short noise burst every spacing seconds. */
function clicks(count: number, spacingSeconds: number): Float32Array {
  const burst = Math.round(0.01 * SR);
  const out = new Float32Array(Math.round(count * spacingSeconds * SR) + burst);
  for (let hit = 0; hit < count; hit++) {
    const at = Math.round(hit * spacingSeconds * SR);
    for (let i = 0; i < burst; i++) {
      out[at + i] = (i / burst) * (1 - i / burst) * 2 * Math.sin((i * 12.9898) % (2 * Math.PI));
    }
  }
  return out;
}

/** The dominant frequency of a stretch window, hz (the strongest bin). */
function dominantHz(samples: Float32Array, from: number, window: number): number {
  const frame = new Array<number>(FFT_SIZE).fill(0);
  for (let i = 0; i < FFT_SIZE; i++) frame[i] = samples[from + i] ?? 0;
  const spectrum = frameSpectrum(frame, SR);
  let best = 1;
  let bestMag = 0;
  for (let b = 1; b < spectrum.magnitudes.length; b++) {
    if (spectrum.magnitudes[b] > bestMag) {
      bestMag = spectrum.magnitudes[b] ?? 0;
      best = b;
    }
  }
  return best * spectrum.binHz;
}

/** The rms of a slice. */
function rmsOf(samples: Float32Array, from: number, count: number): number {
  let sum = 0;
  for (let i = from; i < from + count && i < samples.length; i++) sum += (samples[i] ?? 0) ** 2;
  return Math.sqrt(sum / Math.max(1, Math.min(count, samples.length - from)));
}

describe("timestretch — the length law", () => {
  const tone = sine(440, 0.5);

  it("answers the ratio's timeline for slow and fast stretches", () => {
    for (const ratio of [0.5, 1, 1.5, 2]) {
      const stretched = stretchPcm(tone, ratio);
      assert.equal(stretched.length, Math.round(tone.length * ratio), `the ratio ${ratio} answers its timeline`);
    }
  });

  it("stretches silence to silence", () => {
    const stretched = stretchPcm(new Float32Array(SR), 1.5);
    assert.equal(stretched.length, Math.round(SR * 1.5));
    for (const sample of stretched) assert.equal(sample, 0);
  });
});

describe("timestretch — the pitch law (the vocoder's whole point)", () => {
  it("keeps a tone's frequency through a slow stretch", () => {
    const input = sine(440, 0.5);
    const stretched = stretchPcm(input, 2);
    // measure past the grid's head, where the ola window sum is healthy;
    // the honest law: the vocoder preserves the magnitude spectrum, so the
    // stretched tone answers the input's own strongest bin (the 11.7 hz
    // bin width of the 4096 window at 48k rides the tolerance)
    const expected = dominantHz(input, Math.round(0.1 * SR), FFT_SIZE);
    const measured = dominantHz(stretched, Math.round(0.3 * SR), FFT_SIZE);
    assert.ok(
      Math.abs(measured - expected) < 12,
      `the stretched tone answers ${measured.toFixed(2)} hz, the input answered ${expected.toFixed(2)}`,
    );
  });

  it("keeps a tone's frequency through a fast stretch", () => {
    const input = sine(220, 1);
    const stretched = stretchPcm(input, 0.5);
    const expected = dominantHz(input, Math.round(0.1 * SR), FFT_SIZE);
    const measured = dominantHz(stretched, Math.round(0.1 * SR), FFT_SIZE);
    assert.ok(
      Math.abs(measured - expected) < 12,
      `the sped-up tone answers ${measured.toFixed(2)} hz, the input answered ${expected.toFixed(2)}`,
    );
  });
});

describe("timestretch — the beat law", () => {
  it("lands the onsets at the stretched spacing", () => {
    const track = clicks(6, 0.5);
    const stretched = stretchPcm(track, 2);
    const onsets = onsetSecondsOf(stretched, SR);
    assert.ok(onsets.length >= 4, `the stretched track answers ${onsets.length} onsets`);
    // the first four onsets ride the 1.0 s spacing inside the onset tolerance
    for (let index = 1; index < 4; index++) {
      const gap = (onsets[index] ?? 0) - (onsets[index - 1] ?? 0);
      assert.ok(Math.abs(gap - 1.0) < 0.05, `the onset gap ${gap.toFixed(3)} s is not the stretched 1.0 s`);
    }
  });
});

describe("timestretch — the identity pass", () => {
  it("reconstructs the input at ratio one within the ola tolerance", () => {
    const tone = sine(330, 0.4, 0.7);
    const identity = stretchPcm(tone, 1);
    // measure inside the grid, away from the ola edges
    const from = Math.round(0.1 * SR);
    const count = Math.round(0.2 * SR);
    let worst = 0;
    for (let i = 0; i < count; i++) {
      const diff = Math.abs((identity[from + i] ?? 0) - (tone[from + i] ?? 0));
      if (diff > worst) worst = diff;
    }
    assert.ok(worst < 0.05, `the identity pass wobbles ${worst.toFixed(4)} — the ola reconstruction broke`);
  });
});

describe("timestretch — the determinism and the machine codes", () => {
  it("answers the same bytes twice", () => {
    const input = clicks(3, 0.3);
    const first = stretchPcm(input, 1.5);
    const second = stretchPcm(input, 1.5);
    assert.equal(first.length, second.length);
    for (let i = 0; i < first.length; i++) assert.equal(first[i], second[i]);
  });

  it("refuses an empty signal and a ratio outside the band", () => {
    assert.throws(() => stretchPcm(new Float32Array(0), 1), (error: unknown): boolean => {
      return error instanceof StretchError && error.code === "empty-signal";
    });
    for (const ratio of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, STRETCH_RATIO_MIN / 2, STRETCH_RATIO_MAX * 2]) {
      assert.throws(
        () => stretchPcm(sine(100, 0.1), ratio),
        (error: unknown): boolean => error instanceof StretchError && error.code === "bad-ratio",
        `the ratio ${String(ratio)} must answer bad-ratio`,
      );
    }
  });

  it("keeps the energy finite and the level sane through the stretch", () => {
    const stretched = stretchPcm(sine(523, 0.3), 1.7);
    for (const sample of stretched) assert.ok(Number.isFinite(sample));
    const body = rmsOf(stretched, Math.round(0.05 * SR), Math.round(stretched.length - 0.1 * SR));
    assert.ok(body > 1e-3 && body < 1.5, `the stretched body rms ${body.toFixed(4)} sits outside the sane band`);
  });
});
