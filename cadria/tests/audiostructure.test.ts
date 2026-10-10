// # audiostructure.test — honest unit tests for the structure layer, runnable with
// the node built-in runner (no install, no dependencies):
//   node --test tests/audiostructure.test.ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeStructure,
  energyCurve,
  frameEnergies,
  labelSections,
  noveltyCurve,
  structureBoundaries,
  tensionCurve,
  type Section,
  type StructureStats,
} from "../audiostructure.ts";

const RATE = 100; // 100 Hz analysis frames → 10 ms per frame
const INTRO = [1, 0.2, 0.1, 0.05] as const;
const BUILD = [0.2, 1, 0.5, 0.3] as const;
const PEAK = [0.8, 0.1, 0.4, 1] as const;
const OUTRO = [0.05, 0.3, 0.15, 0.1] as const;

function scaled(dir: readonly number[], k: number): Float32Array {
  return Float32Array.from(dir, (v) => v * k);
}

/** The synthetic song: quiet intro (9 s) → rising build (12 s) → loud peak (12 s) → quiet outro (9 s). */
function songFrames(): Float32Array[] {
  const frames: Float32Array[] = [];
  for (let i = 0; i < 900; i += 1) frames.push(scaled(INTRO, 0.12));
  for (let i = 0; i < 1200; i += 1) frames.push(scaled(BUILD, 0.4 + (0.6 * i) / 1199));
  for (let i = 0; i < 1200; i += 1) frames.push(scaled(PEAK, 1.6));
  for (let i = 0; i < 900; i += 1) frames.push(scaled(OUTRO, 0.1));
  return frames;
}

/** The arch: quiet — loud — quiet, symmetric thirds. */
function archFrames(): Float32Array[] {
  const frames: Float32Array[] = [];
  for (let i = 0; i < 1000; i += 1) frames.push(scaled(INTRO, 0.12));
  for (let i = 0; i < 1000; i += 1) frames.push(scaled(PEAK, 1.6));
  for (let i = 0; i < 1000; i += 1) frames.push(scaled(INTRO, 0.12));
  return frames;
}

/** The flat line: one constant texture, no joints at all. */
function flatFrames(): Float32Array[] {
  const frames: Float32Array[] = [];
  for (let i = 0; i < 1200; i += 1) frames.push(scaled([0.5, 0.4, 0.3, 0.2], 0.5));
  return frames;
}

/** The wave: loud — quiet — loud — quiet, 8 s blocks. */
function waveFrames(): Float32Array[] {
  const frames: Float32Array[] = [];
  for (let block = 0; block < 4; block += 1) {
    const loud = block % 2 === 0;
    for (let i = 0; i < 800; i += 1) frames.push(scaled(loud ? PEAK : INTRO, loud ? 1.6 : 0.12));
  }
  return frames;
}

/** Three identical 8 s blocks (A/B halves inside each block) — perfectly periodic. */
function repeatingFrames(): Float32Array[] {
  const frames: Float32Array[] = [];
  for (let block = 0; block < 3; block += 1) {
    for (let j = 0; j < 800; j += 1) {
      const dir = j < 400 ? [1, 0.1, 0.3, 0.2] : [0.1, 0.9, 0.2, 0.6];
      frames.push(scaled(dir, 0.7 + (0.2 * (j % 400)) / 399));
    }
  }
  return frames;
}

/** The same internal motion, but every block shifts its directions — through-composed. */
function throughFrames(): Float32Array[] {
  const base = [
    [1, 0.1, 0.3, 0.2],
    [0.1, 0.9, 0.2, 0.6],
  ] as const;
  const frames: Float32Array[] = [];
  for (let block = 0; block < 3; block += 1) {
    for (let j = 0; j < 800; j += 1) {
      const dir = base[j < 400 ? 0 : 1];
      const vec = scaled([dir[(0 + block) % 4], dir[(1 + block) % 4], dir[(2 + block) % 4], dir[(3 + block) % 4]], 0.7 + (0.2 * (j % 400)) / 399);
      frames.push(vec);
    }
  }
  return frames;
}

function jointMax(novelty: Float32Array, ms: number): number {
  const frame = Math.round((ms / 1000) * RATE);
  let top = 0;
  for (let i = Math.max(0, frame - 120); i <= Math.min(novelty.length - 1, frame + 120); i += 1) top = Math.max(top, novelty[i]);
  return top;
}

function maxOf(values: Float32Array): number {
  let top = 0;
  for (const v of values) top = Math.max(top, v);
  return top;
}

describe("audiostructure novelty", () => {
  it("spikes at the section joints and stays quiet inside sections", () => {
    const novelty = noveltyCurve(songFrames(), { frameRate: RATE });
    assert.equal(novelty.length, 4200);
    for (const v of novelty) assert.ok(Number.isFinite(v) && v >= 0 && v <= 1);
    assert.ok(jointMax(novelty, 9000) > 0.3, "intro → build joint spikes");
    assert.ok(jointMax(novelty, 21000) > 0.3, "build → peak joint spikes");
    assert.ok(jointMax(novelty, 33000) > 0.3, "peak → outro joint spikes");
    for (let f = 300; f <= 500; f += 1) assert.ok(novelty[f] < 0.02, "intro interior stays quiet");
    for (let f = 1400; f <= 1700; f += 1) assert.ok(novelty[f] < 0.02, "the rising build keeps one direction, so it stays quiet");
  });

  it("answers empty for empty input or a broken frame rate", () => {
    assert.equal(noveltyCurve([], { frameRate: RATE }).length, 0);
    assert.equal(noveltyCurve(songFrames(), { frameRate: 0 }).length, 0);
    assert.equal(noveltyCurve(songFrames(), { frameRate: Number.NaN }).length, 0);
    assert.equal(frameEnergies([]).length, 0);
  });
});

describe("audiostructure boundaries", () => {
  it("finds one boundary per joint and respects minSectionMs", () => {
    const novelty = noveltyCurve(songFrames(), { frameRate: RATE });
    const bounds = structureBoundaries(novelty, RATE);
    assert.equal(bounds.length, 3);
    for (const joint of [9000, 21000, 33000]) {
      assert.ok(bounds.some((b) => Math.abs(b - joint) <= 1200), `a boundary lands near ${joint}ms`);
    }
    for (let i = 1; i < bounds.length; i += 1) assert.ok(bounds[i] - bounds[i - 1] >= 8000, "kept boundaries honor the minimum section");
  });

  it("a huge minSectionMs keeps only the strongest joint; a high threshold drops all", () => {
    const novelty = noveltyCurve(songFrames(), { frameRate: RATE });
    const starved = structureBoundaries(novelty, RATE, { minSectionMs: 60000 });
    assert.equal(starved.length, 1, "strongest-first greedy keeps the single strongest boundary");
    const apexMs = (novelty.reduce((best, v, i) => (v > novelty[best] ? i : best), 0) / RATE) * 1000;
    assert.equal(
      starved[0],
      structureBoundaries(novelty, RATE).reduce((a, b) => (Math.abs(b - apexMs) < Math.abs(a - apexMs) ? b : a), 0),
      "…which sits on the strongest novelty peak (the curve's global maximum, not its latest boundary)",
    );
    assert.deepEqual(structureBoundaries(novelty, RATE, { threshold: 2 }), []);
    assert.deepEqual(structureBoundaries(new Float32Array(0), RATE), []);
  });
});

describe("audiostructure sections", () => {
  it("tiles the song into intro/build/peak/outro without gaps or overlaps", () => {
    const rms = frameEnergies(songFrames());
    const novelty = noveltyCurve(songFrames(), { frameRate: RATE });
    const sections: Section[] = labelSections(structureBoundaries(novelty, RATE), rms, RATE);
    assert.deepEqual(
      sections.map((s) => s.role),
      ["intro", "build", "peak", "outro"],
    );
    assert.equal(sections[0].startMs, 0);
    assert.equal(sections[sections.length - 1].endMs, 42000);
    for (let i = 1; i < sections.length; i += 1) assert.equal(sections[i].startMs, sections[i - 1].endMs, "adjacent sections share their edge");
    const [first, build, peak] = sections;
    assert.ok(peak.energyMean > build.energyMean, "the peak section out-louds the build");
    assert.ok(build.energyMean > first.energyMean, "the build out-louds the intro");
    for (const s of sections) assert.ok(s.energyPeak >= s.energyMean);
  });

  it("a lone section is its own peak and broken inputs answer empty", () => {
    const rms = frameEnergies(flatFrames());
    assert.deepEqual(labelSections([], rms, RATE).map((s) => ({ role: s.role, startMs: s.startMs, endMs: s.endMs })), [
      { role: "peak", startMs: 0, endMs: 12000 },
    ]);
    assert.deepEqual(labelSections([6000], rms, 0), []);
    assert.deepEqual(labelSections([6000], new Float32Array(0), RATE), []);
    assert.deepEqual(
      labelSections([60000, -5, Number.NaN], rms, RATE).map((s) => s.role),
      ["peak"],
      "out-of-range and NaN boundaries clamp or drop into one section",
    );
  });
});

describe("audiostructure curves", () => {
  it("resamples the rms into a 0–1 peak-normalized energy curve", () => {
    const rms = frameEnergies(songFrames());
    const curve = energyCurve(rms);
    assert.equal(curve.length, 64);
    for (const v of curve) assert.ok(Number.isFinite(v) && v >= 0 && v <= 1);
    assert.equal(maxOf(curve), 1, "the loudest sample normalizes to exactly 1");
    assert.ok(curve[63] < 0.1, "the quiet outro tail stays near zero");
    assert.equal(energyCurve(rms, { points: 16 }).length, 16);
    const silent = energyCurve(new Float32Array(0));
    assert.equal(silent.length, 64);
    assert.ok([...silent].every((v) => v === 0));
  });

  it("blends novelty and energy with the documented weights", () => {
    const rms = frameEnergies(songFrames());
    const novelty = noveltyCurve(songFrames(), { frameRate: RATE });
    const energy = energyCurve(rms);
    const tension = tensionCurve(novelty, energy);
    assert.equal(tension.length, energy.length);
    for (const v of tension) assert.ok(Number.isFinite(v) && v >= 0 && v <= 1);
    assert.ok(maxOf(tension) >= 0.6, "peak loudness alone carries the 0.6 energy weight");
    assert.equal(tensionCurve(novelty, new Float32Array(0)).length, 0);
  });
});

describe("audiostructure analyzeStructure", () => {
  it("reads the synthetic song end to end", () => {
    const stats: StructureStats = analyzeStructure(songFrames(), RATE);
    assert.equal(stats.durationMs, 42000);
    assert.deepEqual(
      stats.sections.map((s) => s.role),
      ["intro", "build", "peak", "outro"],
    );
    assert.equal(stats.narrativeShape, "rise", "the song rises into its peak");
    assert.ok(stats.peakSectionMs >= 20000 && stats.peakSectionMs <= 23000, "peakSectionMs points at the peak section start");
    assert.ok(stats.repetitionIndex >= 0 && stats.repetitionIndex <= 1);
  });

  it("classifies arch, flat and wave narratives", () => {
    assert.equal(analyzeStructure(archFrames(), RATE).narrativeShape, "arch");
    assert.equal(analyzeStructure(flatFrames(), RATE).narrativeShape, "flat");
    assert.equal(analyzeStructure(waveFrames(), RATE).narrativeShape, "wave");
  });

  it("scores a repeating pattern above a through-composed twin", () => {
    const repeating = analyzeStructure(repeatingFrames(), RATE).repetitionIndex;
    const through = analyzeStructure(throughFrames(), RATE).repetitionIndex;
    assert.ok(Number.isFinite(repeating) && Number.isFinite(through));
    assert.ok(repeating >= 0 && repeating <= 1 && through >= 0 && through <= 1);
    assert.ok(repeating - through > 0.3, `repeating ${repeating} must beat through-composed ${through}`);
  });

  it("is deterministic across runs", () => {
    assert.deepEqual(analyzeStructure(songFrames(), RATE), analyzeStructure(songFrames(), RATE));
    assert.deepEqual(analyzeStructure(archFrames(), RATE), analyzeStructure(archFrames(), RATE));
    assert.deepEqual(
      noveltyCurve(songFrames(), { frameRate: RATE }),
      noveltyCurve(songFrames(), { frameRate: RATE }),
    );
  });

  it("carries no NaN anywhere across every fixture", () => {
    for (const frames of [songFrames(), archFrames(), flatFrames(), waveFrames(), repeatingFrames(), throughFrames()]) {
      const novelty = noveltyCurve(frames, { frameRate: RATE });
      const bounds = structureBoundaries(novelty, RATE);
      const rms = frameEnergies(frames);
      const energy = energyCurve(rms);
      const stats = analyzeStructure(frames, RATE);
      for (const v of novelty) assert.ok(Number.isFinite(v));
      for (const b of bounds) assert.ok(Number.isFinite(b));
      for (const s of stats.sections) {
        for (const v of [s.startMs, s.endMs, s.energyMean, s.energyPeak]) assert.ok(Number.isFinite(v));
      }
      for (const v of energy) assert.ok(Number.isFinite(v));
      for (const v of tensionCurve(novelty, energy)) assert.ok(Number.isFinite(v));
      for (const v of [stats.durationMs, stats.peakSectionMs, stats.repetitionIndex]) assert.ok(Number.isFinite(v));
    }
  });

  it("degenerate inputs answer total zeroed values", () => {
    assert.deepEqual(analyzeStructure([], RATE), {
      sections: [],
      durationMs: 0,
      peakSectionMs: 0,
      repetitionIndex: 0,
      narrativeShape: "flat",
    });
    const single = analyzeStructure([Float32Array.from([1, 1, 1, 1])], RATE);
    assert.equal(single.durationMs, 10);
    assert.equal(single.sections.length, 1);
    assert.equal(single.sections[0].role, "peak");
    assert.equal(single.narrativeShape, "flat");
    assert.equal(single.repetitionIndex, 0);
    assert.equal(analyzeStructure(songFrames(), 0).durationMs, 0);
  });
});
