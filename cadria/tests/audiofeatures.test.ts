// # audiofeatures.test — the descriptor contract of the cadria audio wave,
// runnable with the node built-in runner (no dependencies, no install):
//   node --test tests/audiofeatures.test.ts
// The tests watch the three promises the module makes: the 32-dim vector is
// total (right length, finite, clamped 0-1) no matter how damaged the input,
// the answer is deterministic (same stats or same pcm → same descriptor and
// seed, different audio → different seed), and the documented monotonic
// mappings hold (louder dynamics range → higher contrast dim, faster bpm →
// higher tempo dim) so the image-mapping wave can trust every dim by index.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { DescriptorStats } from "../audioattributes.ts";
import {
  audioSeed,
  audioSeedFromStats,
  DESCRIPTOR_DIMS,
  DIM_ORDER,
  descriptorSummary,
  fuseDescriptor,
  normalize01,
  zcurve,
} from "../audiofeatures.ts";

/** one believable mid-tempo minor-key clip, all fields in documented units. */
const baseStats: DescriptorStats = {
  spectral: {
    centroidMean: 2200,
    centroidStd: 900,
    rolloffMean: 7200,
    flatnessMean: 0.12,
    flatnessStd: 0.05,
    fluxMean: 0.08,
    fluxStd: 0.04,
    bandBalance: [0.5, 0.6, 0.7, 0.6, 0.4, 0.2, 0.1],
    brightnessIndex: 0.55,
  },
  rhythm: {
    bpm: 124,
    confidence: 0.82,
    onsetsPerSecond: 3.4,
    regularityIndex: 0.71,
    swing: { ratio: 0.58, swung: true },
    downbeatPeriodBeats: 4,
  },
  harmonic: {
    key: { tonic: 9, mode: "minor", strength: 0.64 },
    chromaEnergy: [0.3, 0.2, 0.5, 0.2, 0.4, 0.1, 0.2, 0.3, 0.9, 0.2, 0.3, 0.2],
    harmonicChangeRate: 0.31,
    dissonanceIndex: 0.22,
  },
  timbre: {
    noisiness: 0.34,
    warmth: 0.61,
    dynamics: { rangeDb: 18.5, crestFactor: 8.2 },
    brightness: 0.58,
    slopeMean: -5.5,
    zcrMean: 0.11,
  },
  structure: {
    durationMs: 213000,
    peakSectionMs: 24000,
    repetitionIndex: 0.42,
    narrativeShape: "arch",
    sectionCount: 6,
  },
};

/** every field broken at once — NaN, infinities, wrong literals, short arrays. */
const damagedStats = {
  spectral: {
    centroidMean: NaN,
    centroidStd: Infinity,
    rolloffMean: NaN,
    flatnessMean: NaN,
    flatnessStd: NaN,
    fluxMean: -5,
    fluxStd: 99,
    bandBalance: [NaN, NaN, NaN],
    brightnessIndex: NaN,
  },
  rhythm: {
    bpm: NaN,
    confidence: NaN,
    onsetsPerSecond: NaN,
    regularityIndex: NaN,
    swing: { ratio: NaN, swung: "yes" },
    downbeatPeriodBeats: NaN,
  },
  harmonic: {
    key: { tonic: NaN, mode: "dorian", strength: NaN },
    chromaEnergy: [NaN],
    harmonicChangeRate: NaN,
    dissonanceIndex: NaN,
  },
  timbre: {
    noisiness: NaN,
    warmth: NaN,
    dynamics: { rangeDb: NaN, crestFactor: NaN },
    brightness: NaN,
    slopeMean: NaN,
    zcrMean: NaN,
  },
  structure: {
    durationMs: NaN,
    peakSectionMs: NaN,
    repetitionIndex: NaN,
    narrativeShape: "crescendo",
    sectionCount: NaN,
  },
} as unknown as DescriptorStats;

/** 0.1 s of 440 hz sine at 44.1 khz — stable deterministic fixture. */
function sine440(): Float32Array {
  const out = new Float32Array(8820);
  for (let i = 0; i < out.length; i += 1) out[i] = 0.5 * Math.sin((2 * Math.PI * 440 * i) / 44100);
  return out;
}

/** 0.1 s of lcg noise — clearly different bits from the sine fixture. */
function noiseburst(): Float32Array {
  const out = new Float32Array(8820);
  let state = 123456789;
  for (let i = 0; i < out.length; i += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    out[i] = (state / 2147483648 - 1) * 0.5;
  }
  return out;
}

describe("audiofeatures vector", () => {
  it("fuses exactly 32 dims in the documented order", () => {
    const d = fuseDescriptor(baseStats);
    assert.equal(DIM_ORDER.length, DESCRIPTOR_DIMS);
    assert.equal(d.vector.length, DESCRIPTOR_DIMS);
    assert.equal(d.version, 1);
    // spot-check the documented order at the group edges
    assert.equal(d.vector[0], normalize01(2200, 0, 8000)); // spectral centroid
    assert.equal(d.vector[6], 0.55); // brightness passes through
    assert.equal(d.vector[7], zcurve(124, 110, 40)); // tempo
    assert.equal(d.vector[21], normalize01(18.5, 0, 60)); // dynamics contrast
    assert.equal(d.vector[31], 0.64); // mood shadow = key strength × minor
  });
  it("keeps every dim finite and clamped to 0-1", () => {
    const d = fuseDescriptor(baseStats);
    for (const v of d.vector) {
      assert.ok(Number.isFinite(v));
      assert.ok(v >= 0 && v <= 1);
    }
  });
  it("folds the band balance into the cross dims", () => {
    const low = fuseDescriptor({
      ...baseStats,
      spectral: { ...baseStats.spectral, bandBalance: [1, 0.9, 0.2, 0.1, 0, 0, 0] },
    });
    const high = fuseDescriptor({
      ...baseStats,
      spectral: { ...baseStats.spectral, bandBalance: [0, 0, 0, 0.1, 0.2, 0.9, 1] },
    });
    assert.ok(low.vector[30] > 0.5); // band tilt leans dark
    assert.ok(high.vector[30] < 0.5); // band tilt leans bright
  });
  it("marks the mood shadow only on a minor key", () => {
    const minor = fuseDescriptor(baseStats);
    const major = fuseDescriptor({
      ...baseStats,
      harmonic: { ...baseStats.harmonic, key: { ...baseStats.harmonic.key, mode: "major" } },
    });
    assert.equal(minor.scalar.minor, 1);
    assert.ok(minor.vector[31] > 0);
    assert.equal(major.vector[31], 0);
  });
});

describe("audiofeatures determinism", () => {
  it("answers a deep-equal descriptor for the same stats twice", () => {
    assert.deepEqual(fuseDescriptor(baseStats), fuseDescriptor(baseStats));
    assert.equal(fuseDescriptor(baseStats).seed, audioSeedFromStats(baseStats));
  });
  it("stays stable and frozen at version 1", () => {
    const d = fuseDescriptor(baseStats);
    assert.equal(d.version, 1);
    assert.ok(Object.isFrozen(d));
    assert.ok(Object.isFrozen(d.vector));
    assert.ok(Object.isFrozen(d.scalar));
  });
  it("seeds identically from the same pcm fixture", () => {
    assert.equal(audioSeed(sine440()), audioSeed(sine440()));
    assert.match(audioSeed(sine440()), /^[0-9a-f]{16}$/);
  });
  it("seeds differently for clearly different pcm fixtures", () => {
    assert.notEqual(audioSeed(sine440()), audioSeed(noiseburst()));
  });
  it("seeds differently for different stats and never for identical ones", () => {
    const a = audioSeedFromStats(baseStats);
    const b = audioSeedFromStats({ ...baseStats, rhythm: { ...baseStats.rhythm, bpm: 126 } });
    assert.equal(a, audioSeedFromStats(baseStats));
    assert.notEqual(a, b);
    assert.match(b, /^[0-9a-f]{16}$/);
  });
  it("survives empty, tiny and non-pcm input with a stable seed", () => {
    const empty = audioSeed(new Float32Array(0));
    assert.match(empty, /^[0-9a-f]{16}$/);
    assert.equal(empty, audioSeed(new Float32Array(0)));
    assert.notEqual(empty, audioSeed(new Float32Array(1))); // length folds in
    assert.equal(audioSeed(undefined as unknown as Float32Array), empty);
  });
});

describe("audiofeatures monotonic mappings", () => {
  it("maps a wider dynamics range to a higher contrast dim (21)", () => {
    const loud = fuseDescriptor({
      ...baseStats,
      timbre: { ...baseStats.timbre, dynamics: { rangeDb: 50, crestFactor: 8.2 } },
    });
    const quiet = fuseDescriptor({
      ...baseStats,
      timbre: { ...baseStats.timbre, dynamics: { rangeDb: 10, crestFactor: 8.2 } },
    });
    assert.ok(loud.vector[21] > quiet.vector[21]);
  });
  it("maps a faster bpm to a higher tempo dim (7)", () => {
    const fast = fuseDescriptor({ ...baseStats, rhythm: { ...baseStats.rhythm, bpm: 140 } });
    const slow = fuseDescriptor({ ...baseStats, rhythm: { ...baseStats.rhythm, bpm: 90 } });
    assert.ok(fast.vector[7] > slow.vector[7]);
  });
  it("keeps zcurve monotonic across the tempo field", () => {
    const a = zcurve(60, 110, 40);
    const b = zcurve(110, 110, 40);
    const c = zcurve(200, 110, 40);
    assert.ok(a < b && b < c);
  });
});

describe("audiofeatures helpers", () => {
  it("clamps normalize01 on both edges, degenerate ranges and NaN", () => {
    assert.equal(normalize01(-1, 0, 1), 0);
    assert.equal(normalize01(2, 0, 1), 1);
    assert.equal(normalize01(5, 0, 10), 0.5);
    assert.equal(normalize01(NaN, 0, 1), 0);
    assert.equal(normalize01(0.5, 1, 0), 0);
  });
  it("answers a lowercase summary that names key and bpm", () => {
    const text = descriptorSummary(fuseDescriptor(baseStats));
    assert.ok(text.includes("key"));
    assert.ok(text.includes("bpm"));
    assert.ok(text.includes("arch"));
    assert.equal(text, text.toLowerCase());
  });
});

describe("audiofeatures damage control", () => {
  it("coerces NaN-riddled stats without emitting NaN anywhere", () => {
    const d = fuseDescriptor(damagedStats);
    assert.equal(d.vector.length, DESCRIPTOR_DIMS);
    for (const v of d.vector) {
      assert.ok(Number.isFinite(v));
      assert.ok(v >= 0 && v <= 1);
    }
    for (const v of Object.values(d.scalar)) {
      assert.ok(Number.isFinite(v));
      assert.ok(v >= 0 && v <= 1);
    }
    assert.match(d.seed, /^[0-9a-f]{16}$/);
    assert.match(descriptorSummary(d), /^[a-z]/); // still readable, lowercase
  });
  it("honors an explicit pcm seed override when the audio is at hand", () => {
    const d = fuseDescriptor(baseStats, audioSeed(sine440()));
    assert.equal(d.seed, audioSeed(sine440()));
    assert.match(d.seed, /^[0-9a-f]{16}$/);
  });
});
