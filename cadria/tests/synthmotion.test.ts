// # synthmotion.test — the motion layer contract, runnable with the node
// built-in runner (no dependencies, no install):
//   node --test tests/synthmotion.test.ts
// The tests watch the promises the module makes: the loop is beat-synced
// and canonical (500 ms at 120 bpm, clamped to 375-857 ms), keyframes land
// on the documented beat grid, strength tracks pulse confidence, easings
// are pure curves with exact endpoints (standard(0.5) inside (0.4, 0.9)),
// the timeline expands and caps deterministically, the reduced-motion
// contract stops everything but the reveal, and every answer is total
// (no NaN) and deterministic (deep-equal on repeat).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AudioDescriptor, DescriptorStats } from "../audioattributes.ts";
import { fuseDescriptor } from "../audiofeatures.ts";
import { bezierprogress } from "../easecurves.ts";
import {
  KEYFRAME_CAP,
  MICRO_EASE,
  MOTION_MAX_BPM,
  MOTION_MIN_BPM,
  PULSE_SCALE_CEIL,
  PULSE_SCALE_FLOOR,
  TIMELINE_EVENT_CAP,
  evaluateEase,
  motionReduced,
  motionTimeline,
  synthMotion,
} from "../synthmotion.ts";
import type { MotionKeyframe, MotionSpec } from "../synthmotion.ts";

/** one believable mid-tempo minor-key clip — bpm pinned at 120 → 500 ms loop. */
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
    bpm: 120,
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

/** fused descriptor with shallow stat overrides. */
function desc(over: Partial<DescriptorStats>): AudioDescriptor {
  return fuseDescriptor({ ...baseStats, ...over } as DescriptorStats);
}

/** the block roles the mapping wave would hand over. */
const ROLES = ["sky", "figure", "ground", "accent"];

/** keyframes of one kind, in spec order. */
function ofKind(spec: MotionSpec, kind: MotionKeyframe["kind"]): MotionKeyframe[] {
  return spec.keyframes.filter((kf) => kf.kind === kind);
}

/** distance from t to the nearest multiple of step. */
function nearMultiple(t: number, step: number): number {
  const phase = t % step;
  return Math.min(phase, step - phase);
}

/** every number reachable from a value (deep walk over spec/events). */
function deepNumbers(x: unknown, out: number[] = []): number[] {
  if (typeof x === "number") out.push(x);
  else if (Array.isArray(x)) for (const item of x) deepNumbers(item, out);
  else if (x !== null && typeof x === "object") for (const v of Object.values(x)) deepNumbers(v, out);
  return out;
}

describe("synthmotion loop clock", () => {
  it("syncs the loop to one beat — 500 ms at 120 bpm", () => {
    const spec = synthMotion(desc({}), ROLES);
    assert.ok(Math.abs(spec.loopMs - 500) <= 2);
  });
  it("clamps the loop into the canonical 375-857 ms band", () => {
    const fast = synthMotion(desc({ rhythm: { ...baseStats.rhythm, bpm: 300 } }), ROLES);
    const slow = synthMotion(desc({ rhythm: { ...baseStats.rhythm, bpm: 40 } }), ROLES);
    assert.ok(Math.abs(fast.loopMs - 60000 / MOTION_MAX_BPM) < 1e-9);
    assert.ok(Math.abs(slow.loopMs - 60000 / MOTION_MIN_BPM) < 1e-9);
  });
  it("falls back to the tempo dim when scalar.bpm is unusable", () => {
    const zeros = synthMotion({ ...desc({}), scalar: {}, vector: new Array(32).fill(0) }, ROLES);
    assert.ok(Math.abs(zeros.loopMs - 60000 / MOTION_MIN_BPM) < 1e-9);
  });
});

describe("synthmotion beat grid", () => {
  it("places one pulse on the beat for sparse grooves, grid-tight", () => {
    const spec = synthMotion(desc({
      rhythm: { ...baseStats.rhythm, onsetsPerSecond: 0.5 },
      structure: { ...baseStats.structure, narrativeShape: "flat" },
    }), ROLES);
    const pulses = ofKind(spec, "pulse");
    assert.equal(pulses.length, 1);
    assert.ok(Math.abs(pulses[0].tMs) < 0.001); // the downbeat of the loop
    for (const kf of spec.keyframes) assert.ok(nearMultiple(kf.tMs, spec.loopMs) < 0.001);
  });
  it("subdivides to 8ths and 16ths as onset density climbs", () => {
    const eighths = synthMotion(desc({ rhythm: { ...baseStats.rhythm, onsetsPerSecond: 2.5 } }), ROLES);
    assert.equal(ofKind(eighths, "pulse").length, 2);
    const sixteenths = synthMotion(desc({ rhythm: { ...baseStats.rhythm, onsetsPerSecond: 6 } }), ROLES);
    assert.equal(ofKind(sixteenths, "pulse").length, 4);
    for (const kf of sixteenths.keyframes) assert.ok(nearMultiple(kf.tMs, sixteenths.loopMs / 4) < 1e-6);
  });
  it("drops back to the downbeat only when the pulse grid is untrusted", () => {
    const spec = synthMotion(desc({ rhythm: { ...baseStats.rhythm, confidence: 0.2, onsetsPerSecond: 6 } }), ROLES);
    assert.equal(ofKind(spec, "pulse").length, 1);
  });
  it("scales pulse strength with pulse confidence alone", () => {
    const trusted = synthMotion(desc({ rhythm: { ...baseStats.rhythm, confidence: 0.9 } }), ROLES);
    const doubted = synthMotion(desc({ rhythm: { ...baseStats.rhythm, confidence: 0.2 } }), ROLES);
    const hi = ofKind(trusted, "pulse").find((kf) => kf.tMs < 0.001);
    const lo = ofKind(doubted, "pulse").find((kf) => kf.tMs < 0.001);
    assert.ok(hi && lo && hi.strength > lo.strength);
  });
  it("strength also rides groove regularity", () => {
    const tight = synthMotion(desc({ rhythm: { ...baseStats.rhythm, regularityIndex: 0.95 } }), ROLES);
    const loose = synthMotion(desc({ rhythm: { ...baseStats.rhythm, regularityIndex: 0.05 } }), ROLES);
    assert.ok(ofKind(tight, "pulse")[0].strength > ofKind(loose, "pulse")[0].strength);
  });
  it("reveals each loop opening with strength from the structure dims", () => {
    const loud = synthMotion(desc({ structure: { ...baseStats.structure, peakSectionMs: 60000, sectionCount: 12 } }), ROLES);
    const quiet = synthMotion(desc({ structure: { ...baseStats.structure, peakSectionMs: 6000, sectionCount: 2 } }), ROLES);
    const a = ofKind(loud, "reveal")[0];
    const b = ofKind(quiet, "reveal")[0];
    assert.equal(a.tMs, 0);
    assert.ok(a.strength > 0.5);
    assert.ok(a.strength > b.strength);
  });
  it("wipes only when spectral flux runs hot", () => {
    const hot = synthMotion(desc({ spectral: { ...baseStats.spectral, fluxMean: 0.3, fluxStd: 0.2 } }), ROLES);
    const cold = synthMotion(desc({ spectral: { ...baseStats.spectral, fluxMean: 0.01, fluxStd: 0.01 } }), ROLES);
    const wipes = ofKind(hot, "wipe");
    assert.equal(wipes.length, 1);
    assert.ok(Math.abs(wipes[0].tMs - hot.loopMs * 0.75) < 1e-6);
    assert.equal(ofKind(cold, "wipe").length, 0);
  });
  it("shifts only when the narrative contour moves", () => {
    const still = synthMotion(desc({ structure: { ...baseStats.structure, narrativeShape: "flat" } }), ROLES);
    const arch = synthMotion(desc({}), ROLES);
    assert.equal(ofKind(still, "shift").length, 0);
    const shifts = ofKind(arch, "shift");
    assert.equal(shifts.length, 1);
    assert.ok(Math.abs(shifts[0].tMs - arch.loopMs / 2) < 1e-6);
    assert.equal(arch.easing, "standard"); // contour ≥ 0.625 picks the workhorse
  });
  it("keeps the keyframe budget at or under 64", () => {
    const busy = synthMotion(desc({
      rhythm: { ...baseStats.rhythm, onsetsPerSecond: 8 },
      spectral: { ...baseStats.spectral, fluxMean: 0.3, fluxStd: 0.2 },
      structure: { ...baseStats.structure, narrativeShape: "rise" },
    }), ROLES);
    assert.ok(busy.keyframes.length <= KEYFRAME_CAP);
    assert.ok(ofKind(busy, "reveal").length >= 1);
  });
});

describe("synthmotion easing", () => {
  const names = ["standard", "decelerate", "accelerate", "springy", "micro"] as const;
  it("pins the endpoints exactly at 0 and 1 and clamps outside", () => {
    for (const name of names) {
      assert.equal(evaluateEase(name, 0), 0);
      assert.equal(evaluateEase(name, 1), 1);
      assert.equal(evaluateEase(name, -0.5), 0);
      assert.equal(evaluateEase(name, 1.5), 1);
    }
  });
  it("plays the beziers monotonic and springy bounded-bouncy", () => {
    for (const name of ["standard", "decelerate", "accelerate", "micro"] as const) {
      let prev = -1;
      for (let i = 0; i <= 32; i += 1) {
        const v = evaluateEase(name, i / 32);
        assert.ok(v >= prev - 1e-9, `${name} must not decrease`);
        prev = v;
      }
    }
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (let i = 0; i <= 200; i += 1) {
      const v = evaluateEase("springy", i / 200);
      min = Math.min(min, v);
      max = Math.max(max, v);
    }
    assert.ok(min >= 0 && min < 0.02); // leaves rest, never dips low
    assert.ok(max > 1.005 && max <= 1.15); // the documented ~9.5 % overshoot
  });
  it("answers standard(0.5) inside (0.4, 0.9) and mirrors the house micro bezier", () => {
    const mid = evaluateEase("standard", 0.5);
    assert.ok(mid > 0.4 && mid < 0.9);
    assert.equal(evaluateEase("micro", 0.5), bezierprogress(MICRO_EASE[0], MICRO_EASE[1], MICRO_EASE[2], MICRO_EASE[3], 0.5));
    assert.equal(evaluateEase("nope" as (typeof names)[number], 0.5), mid); // unknown → standard
  });
  it("springy trends upward across the whole curve", () => {
    const mean = (xs: number[]) => xs.reduce((sum, v) => sum + v, 0) / xs.length;
    const first = [0, 1, 2].map((i) => evaluateEase("springy", (i + 0.5) / 30));
    const last = [27, 28, 29].map((i) => evaluateEase("springy", (i + 0.5) / 30));
    assert.ok(mean(last) > mean(first));
  });
});

describe("synthmotion timeline", () => {
  it("expands keyframes across loops with absolute times", () => {
    const spec = synthMotion(desc({}), ROLES); // 4 keyframes per loop
    const events = motionTimeline(spec, spec.loopMs * 10);
    assert.equal(events.length, spec.keyframes.length * 10);
    for (let i = 1; i < events.length; i += 1) assert.ok(events[i].tMs >= events[i - 1].tMs);
    assert.equal(events[0].loop, 0);
    assert.equal(events[0].tMs, 0);
    const last = events[events.length - 1];
    assert.equal(last.loop, 9);
    assert.ok(last.tMs < spec.loopMs * 10);
    const at = events.findIndex((event) => event.loop === 5 && event.kind === "pulse");
    assert.ok(at >= 0 && events[at].tMs >= spec.loopMs * 5);
  });
  it("caps the expansion at 512 events, all inside the duration", () => {
    const spec = synthMotion(desc({}), ROLES);
    const events = motionTimeline(spec, spec.loopMs * 200);
    assert.equal(events.length, TIMELINE_EVENT_CAP);
    assert.ok(events.every((event) => event.tMs >= 0 && event.tMs < spec.loopMs * 200));
  });
  it("answers an empty timeline for zero durations and empty specs", () => {
    const spec = synthMotion(desc({}), ROLES);
    assert.equal(motionTimeline(spec, 0).length, 0);
    assert.equal(motionTimeline(spec, -5).length, 0);
    assert.equal(motionTimeline({ ...spec, keyframes: [] }, 5000).length, 0);
  });
});

describe("synthmotion reduced motion", () => {
  it("hard-stops drift, breath and parallax, keeping only reveals", () => {
    const spec = synthMotion(desc({}), ROLES);
    const reduced = motionReduced(spec);
    assert.deepEqual(reduced.drift, { x: 0, y: 0, rotation: 0 });
    assert.equal(reduced.pulseScale, 1);
    assert.equal(reduced.parallaxDepth, 0);
    assert.equal(reduced.easing, "decelerate");
    assert.ok(reduced.keyframes.length >= 1);
    assert.ok(reduced.keyframes.every((kf) => kf.kind === "reveal"));
    const source = ofKind(spec, "reveal")[0];
    assert.equal(reduced.keyframes[0].tMs, source.tMs);
    assert.equal(reduced.keyframes[0].strength, source.strength);
    assert.ok(ofKind(spec, "pulse").length >= 1); // the input stays untouched
  });
  it("is idempotent and totals over damaged specs", () => {
    const once = motionReduced(synthMotion(desc({}), ROLES));
    assert.deepEqual(motionReduced(once), once);
    const empty = motionReduced({} as MotionSpec);
    assert.equal(empty.loopMs, 500);
    assert.equal(empty.keyframes.length, 0);
    assert.deepEqual(empty.drift, { x: 0, y: 0, rotation: 0 });
  });
});

describe("synthmotion contract", () => {
  it("is deterministic — same descriptor and roles, deep-equal frozen spec", () => {
    const d = desc({});
    const a = synthMotion(d, ROLES);
    const b = synthMotion(d, ROLES);
    assert.deepEqual(a, b);
    assert.ok(Object.isFrozen(a));
    assert.ok(Object.isFrozen(a.keyframes));
    assert.ok(Object.isFrozen(a.keyframes[0]));
    assert.ok(Object.isFrozen(a.drift));
  });
  it("keeps parallaxDepth in [0, 1] and tracks the energyDrive dim", () => {
    const driven = synthMotion(desc({
      spectral: { ...baseStats.spectral, fluxMean: 0.25 },
      rhythm: { ...baseStats.rhythm, onsetsPerSecond: 7 },
    }), ROLES);
    const idle = synthMotion(desc({
      spectral: { ...baseStats.spectral, fluxMean: 0.005 },
      rhythm: { ...baseStats.rhythm, onsetsPerSecond: 0.3 },
    }), ROLES);
    for (const spec of [driven, idle]) assert.ok(spec.parallaxDepth >= 0 && spec.parallaxDepth <= 1);
    assert.ok(driven.parallaxDepth > idle.parallaxDepth);
  });
  it("keeps the beat breath inside the documented floors", () => {
    const spec = synthMotion(desc({}), ROLES);
    assert.ok(spec.pulseScale >= PULSE_SCALE_FLOOR && spec.pulseScale <= PULSE_SCALE_CEIL);
    const dead = synthMotion({ ...desc({}), vector: new Array(32).fill(0) }, ROLES);
    assert.equal(dead.pulseScale, PULSE_SCALE_FLOOR);
  });
  it("targets only provided roles, or nothing when roles are absent", () => {
    const withRoles = synthMotion(desc({ spectral: { ...baseStats.spectral, fluxMean: 0.3, fluxStd: 0.2 } }), ROLES);
    for (const kf of withRoles.keyframes) {
      assert.ok(kf.targets.length >= 1);
      for (const target of kf.targets) assert.ok(ROLES.includes(target));
    }
    assert.equal(ofKind(withRoles, "wipe")[0].targets.length, 1); // the seed-rotated band
    const withoutRoles = synthMotion(desc({}));
    for (const kf of withoutRoles.keyframes) assert.deepEqual(kf.targets, []);
  });
  it("never emits NaN anywhere in the spec or its timeline", () => {
    const spec = synthMotion(desc({}), ROLES);
    const events = motionTimeline(spec, spec.loopMs * 20);
    for (const value of [...deepNumbers(spec), ...deepNumbers(events)]) assert.ok(Number.isFinite(value));
  });
  it("totals over a damaged descriptor and a missing one", () => {
    const damaged = {
      version: 1,
      seed: "zzzz",
      vector: new Array(32).fill(NaN),
      scalar: { bpm: "fast" },
    } as unknown as AudioDescriptor;
    const spec = synthMotion(damaged, ROLES);
    assert.ok(spec.loopMs >= 375 && spec.loopMs <= 857.15);
    assert.ok(spec.keyframes.length >= 1);
    for (const value of deepNumbers(spec)) assert.ok(Number.isFinite(value));
    assert.deepEqual(spec.drift, { x: 0, y: 0, rotation: 0 }); // flat contour rests
    assert.ok(Number.isFinite(synthMotion(null as unknown as AudioDescriptor, ROLES).loopMs));
  });
  it("maps the narrative contour onto the documented drift table", () => {
    const flat = synthMotion(desc({ structure: { ...baseStats.structure, narrativeShape: "flat" } }), ROLES);
    const rise = synthMotion(desc({ structure: { ...baseStats.structure, narrativeShape: "rise" } }), ROLES);
    const fall = synthMotion(desc({ structure: { ...baseStats.structure, narrativeShape: "fall" } }), ROLES);
    assert.deepEqual(flat.drift, { x: 0, y: 0, rotation: 0 });
    assert.deepEqual(rise.drift, { x: 12, y: -9, rotation: 1.5 });
    assert.deepEqual(fall.drift, { x: -8, y: 6, rotation: -0.8 });
  });
});
