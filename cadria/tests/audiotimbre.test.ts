// # audiotimbre.test — the timbre layer of the audio→image paint feed
// (mel/MFCC, envelopes, dynamics, onset shapes and the spectral descriptors),
// runnable with the node built-in runner (no dependencies, no install):
//   node --test tests/audiotimbre.test.ts
// Every test watches the three invariants the module promises: the
// descriptors separate the fixtures they were built for (noise vs tone, pad
// vs click, warm vs bright, loud vs quiet), every answer stays finite under
// damaged input, and the whole layer is deterministic — the same buffer
// answers the same numbers on every run. Fixtures are synthesized (sines,
// ramps, an LCG pseudo-noise) so the suite never touches the filesystem.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  brightness,
  DEFAULT_COEFFICIENTS,
  dctii,
  hztomel,
  MEL_BANDS,
  melFilterbank,
  meltohz,
  mfcc,
  noisinessIndex,
  rolloffSharpness,
  spectralSlope,
  timbreStats,
  warmthIndex,
} from "../audiotimbre.ts";
import { DB_FLOOR, dynamicStats, onsetShapes, rmsEnvelope, todb, zcr, zcrrate } from "../audiotimbreenv.ts";

const SR = 16000;

function sine(freq: number, seconds: number, amp = 0.8, sr = SR): Float32Array {
  const n = Math.round(seconds * sr);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = amp * Math.sin((2 * Math.PI * freq * i) / sr);
  return out;
}

/** deterministic pseudo-noise (LCG — no Math.random anywhere in this suite). */
function lcgNoise(n: number, seed = 7): Float32Array {
  let state = seed >>> 0 || 1;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    state = (Math.imul(state, 1103515245) + 12345) >>> 0;
    out[i] = state / 2147483648 - 1;
  }
  return out;
}

/** one-bin magnitude spectrum (bin k of 257 covers k·31.25 Hz at the suite rate). */
function spikeAt(bin: number, bins = 257): Float32Array {
  const out = new Float32Array(bins);
  out[bin] = 1;
  return out;
}

function finiteDeep(value: unknown): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  if (value instanceof Float32Array || value instanceof Float64Array) return Array.from(value).every(finiteDeep);
  if (Array.isArray(value)) return value.every(finiteDeep);
  if (value && typeof value === "object") return Object.values(value).every(finiteDeep);
  return true;
}

describe("audiotimbre", () => {
  it("answers 26 overlapping mel triangles with unit peaks", () => {
    const bank = melFilterbank(257, SR);
    assert.equal(bank.length, MEL_BANDS);
    for (const row of bank) {
      let peak = 0;
      for (const w of row) {
        assert.ok(w >= 0 && w <= 1);
        peak = Math.max(peak, w);
      }
      assert.ok(peak > 0.9);
    }
    assert.deepEqual(melFilterbank(257, SR), bank);
    assert.deepEqual(melFilterbank(257, Number.NaN)[0], new Float32Array(257));
  });

  it("round-trips the HTK mel scale", () => {
    assert.ok(Math.abs(hztomel(1000) - 1000.5) < 1);
    assert.ok(Math.abs(meltohz(hztomel(440)) - 440) < 1e-6);
    assert.equal(hztomel(0), 0);
    assert.equal(hztomel(Number.NaN), 0);
    assert.equal(meltohz(-5), 0);
  });

  it("matches the known DCT-II of [1, 2, 3, 4]", () => {
    const out = dctii([1, 2, 3, 4]);
    assert.ok(Math.abs(out[0] - 10) < 1e-9);
    assert.ok(Math.abs(out[1] + 3.1543220298889496) < 1e-9);
    assert.ok(Math.abs(out[2]) < 1e-9);
    assert.ok(Math.abs(out[3] + 0.2241707645839828) < 1e-9);
    const flat = dctii([3, 3, 3, 3]);
    assert.ok(Math.abs(flat[0] - 12) < 1e-9);
    for (let k = 1; k < 4; k++) assert.ok(Math.abs(flat[k]) < 1e-9);
    assert.equal(dctii([]).length, 0);
  });

  it("answers 13 finite coefficients for a sine-like magnitude frame", () => {
    const out = mfcc(spikeAt(16), SR);
    assert.equal(out.length, DEFAULT_COEFFICIENTS);
    for (const v of out) assert.ok(Number.isFinite(v));
    const again = mfcc(spikeAt(16), SR);
    assert.deepEqual(again, out);
  });

  it("keeps the first mfcc coefficient stable across same-pitch frames", () => {
    const stats = timbreStats(sine(440, 0.6), SR);
    assert.ok(stats.mfccStd[0] < 0.5);
    assert.ok(finiteDeep(stats.mfccMean) && finiteDeep(stats.mfccStd));
  });

  it("holds a constant-level sine steady in the rms envelope", () => {
    const env = rmsEnvelope(sine(440, 0.5, 0.5));
    assert.ok(env.length >= 14);
    const target = 0.5 / Math.SQRT2;
    for (const v of env) assert.ok(Math.abs(v - target) < 0.05 * target);
  });

  it("floors silence at −90 dB and reads full scale as 0 dB", () => {
    assert.equal(todb(0), DB_FLOOR);
    assert.equal(todb(1e-12), DB_FLOOR);
    assert.equal(todb(Number.NaN), DB_FLOOR);
    assert.equal(todb(1), 0);
    assert.ok(Math.abs(todb(0.1) + 20) < 1e-9);
    const silent = dynamicStats(rmsEnvelope(new Float32Array(4096)));
    assert.equal(silent.minDb, DB_FLOOR);
    assert.equal(silent.maxDb, DB_FLOOR);
    assert.equal(silent.rangeDb, 0);
    assert.equal(silent.crestFactor, 1);
  });

  it("reads a crescendo with a wide dynamic range", () => {
    const n = SR;
    const crescendo = new Float32Array(n);
    for (let i = 0; i < n; i++) crescendo[i] = 0.01 + (0.99 * i) / (n - 1);
    const stats = dynamicStats(rmsEnvelope(crescendo));
    assert.ok(stats.rangeDb > 10);
    assert.ok(stats.crestFactor >= 1);
    assert.ok(stats.maxDb > stats.meanDb && stats.meanDb > stats.minDb);
    assert.ok(finiteDeep(stats));
  });

  it("separates a fast click attack from a slow pad attack", () => {
    const click = new Float32Array(4000);
    for (let i = 0; i < 64; i++) click[i] = 0.9 * Math.exp(-i / 16);
    const clickShape = onsetShapes(rmsEnvelope(click, { size: 256, hop: 128 }), [0], 8000, { hop: 128 })[0];
    assert.ok(clickShape.attackMs < 10);
    assert.ok(clickShape.peak > 0);
    const pad = new Float32Array(8000);
    for (let i = 0; i < 8000; i++) {
      const t = i / 8000;
      pad[i] = (t < 0.3 ? 0.01 + (0.99 * t) / 0.3 : 1) * Math.sin((2 * Math.PI * 220 * i) / 8000);
    }
    const padShape = onsetShapes(rmsEnvelope(pad, { size: 512, hop: 128 }), [0], 8000, { hop: 128 })[0];
    assert.ok(padShape.attackMs > 50);
    assert.ok(Number.isFinite(clickShape.decayMs) && clickShape.decayMs >= 0);
    assert.ok(Number.isFinite(padShape.decayMs) && padShape.decayMs >= 0);
  });

  it("tolerates empty and out-of-range onset lists", () => {
    const env = rmsEnvelope(sine(440, 0.25));
    assert.deepEqual(onsetShapes(env, [], SR), []);
    const shapes = onsetShapes(env, [-100, Number.NaN, 1e9], SR);
    assert.equal(shapes.length, 3);
    for (const shape of shapes) {
      assert.ok(finiteDeep(shape) && shape.peak >= 0 && shape.attackMs >= 0 && shape.decayMs >= 0);
    }
  });

  it("ranks the zero-crossing rate of a high sine above a low one", () => {
    const high = zcrrate(sine(3000, 0.25));
    const low = zcrrate(sine(300, 0.25));
    assert.ok(high > 0.2 && low < 0.1);
    assert.ok(high > low);
    const frames = zcr(sine(3000, 0.25));
    assert.ok(frames.length > 0 && Array.from(frames).every((v) => v > 0.2));
    assert.equal(zcrrate(new Float32Array(0)), 0);
  });

  it("prefers the low-passed fixture in warmth", () => {
    assert.ok(warmthIndex(spikeAt(8), SR) > 0.99);
    assert.ok(warmthIndex(spikeAt(128), SR) < 0.01);
    const warmStats = timbreStats(sine(250, 0.5), SR);
    const brightStats = timbreStats(sine(4000, 0.5), SR);
    assert.ok(warmStats.warmth > 0.9);
    assert.ok(brightStats.warmth < 0.1);
    assert.ok(warmStats.warmth > brightStats.warmth);
  });

  it("ranks noise above a tone in noisiness", () => {
    const flat = new Float32Array(257).fill(1);
    const tone = spikeAt(40);
    const noiseMags = new Float32Array(257);
    const rng = lcgNoise(257, 3);
    for (let k = 0; k < 257; k++) noiseMags[k] = 0.1 + Math.abs(rng[k]) * 0.9;
    assert.ok(noisinessIndex(flat) > 0.99);
    assert.ok(noisinessIndex(tone) < 0.01);
    assert.ok(noisinessIndex(noiseMags) > noisinessIndex(tone));
    const noiseStats = timbreStats(lcgNoise(8000), SR);
    const toneStats = timbreStats(sine(440, 0.5), SR);
    assert.ok(noiseStats.noisiness > 0.2);
    assert.ok(toneStats.noisiness < 0.1);
    assert.ok(noiseStats.noisiness > toneStats.noisiness);
  });

  it("reads slope, rolloff sharpness and centroid from tilted spectra", () => {
    const bins = 257;
    const falling = new Float32Array(bins);
    const rising = new Float32Array(bins);
    const even = new Float32Array(bins);
    for (let k = 0; k < bins; k++) {
      falling[k] = 1 / (k + 1);
      rising[k] = k + 1;
      even[k] = 1;
    }
    assert.ok(spectralSlope(falling, SR) < -0.8);
    assert.ok(spectralSlope(rising, SR) > 0.8);
    assert.ok(Math.abs(spectralSlope(even, SR)) < 1e-6);
    assert.ok(Math.abs(rolloffSharpness(spikeAt(8)) - 8 / 256) < 1e-9);
    assert.ok(Math.abs(rolloffSharpness(spikeAt(240)) - 240 / 256) < 1e-9);
    assert.equal(rolloffSharpness(new Float32Array(257)), 0);
    assert.ok(Math.abs(brightness(spikeAt(8), SR) - 8 / 256) < 1e-9);
    assert.ok(Math.abs(brightness(spikeAt(128), SR) - 0.5) < 1e-9);
  });

  it("answers the full TimbreStats contract shape", () => {
    const stats = timbreStats(sine(440, 0.6), SR);
    assert.equal(stats.mfccMean.length, 13);
    assert.equal(stats.mfccStd.length, 13);
    for (const v of stats.mfccMean) assert.ok(Number.isFinite(v));
    for (const v of stats.mfccStd) assert.ok(v >= 0 && Number.isFinite(v));
    assert.ok(stats.zcrMean >= 0 && stats.zcrMean <= 1);
    assert.ok(stats.noisiness >= 0 && stats.noisiness <= 1);
    assert.ok(stats.warmth >= 0 && stats.warmth <= 1);
    assert.ok(stats.brightness >= 0 && stats.brightness <= 1);
    assert.ok(Number.isFinite(stats.slopeMean));
    assert.ok(stats.dynamics.rangeDb >= 0 && stats.dynamics.crestFactor >= 1);
    const silent = timbreStats(new Float32Array(4096), SR);
    assert.equal(silent.brightness, 0);
    assert.equal(silent.noisiness, 0);
    assert.equal(silent.warmth, 0.5);
    assert.equal(silent.dynamics.minDb, DB_FLOOR);
  });

  it("is deterministic across runs", () => {
    const mixed = new Float32Array(8000);
    const noise = lcgNoise(8000, 11);
    for (let i = 0; i < 8000; i++) mixed[i] = 0.5 * Math.sin((2 * Math.PI * 440 * i) / SR) + 0.2 * noise[i];
    assert.deepEqual(timbreStats(mixed, SR), timbreStats(mixed, SR));
  });

  it("stays finite on damaged input everywhere", () => {
    const broken = new Float32Array([Number.NaN, 1, Number.POSITIVE_INFINITY, -2, 0]);
    assert.ok(finiteDeep(rmsEnvelope(broken)));
    assert.ok(finiteDeep(dynamicStats([Number.NaN, 0.5, Number.POSITIVE_INFINITY, 0])));
    assert.ok(finiteDeep(zcr(broken)) && finiteDeep(zcrrate(broken)));
    assert.ok(finiteDeep(mfcc([Number.NaN, 2, Number.NaN, 1, 0, 3], SR)));
    assert.ok(finiteDeep(spectralSlope([Number.NaN, 1, 2, 0, 4], SR)));
    assert.ok(Number.isFinite(noisinessIndex([Number.NaN, 1, Number.NaN])));
    assert.ok(Number.isFinite(warmthIndex([Number.NaN, 1, 2], Number.NaN)));
    assert.ok(Number.isFinite(brightness([Number.NaN, 1], SR)));
    const shapes = onsetShapes(new Float32Array(0), [Number.NaN], SR);
    assert.equal(shapes.length, 1);
    assert.ok(finiteDeep(shapes));
    assert.ok(finiteDeep(timbreStats(broken, SR)));
  });
});
