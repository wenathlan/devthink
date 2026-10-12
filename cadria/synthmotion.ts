// # synthmotion — the motion layer of the cadria audio→image wave: it folds
// the fused audio descriptor (audioattributes.ts contract; dims per the
// audiofeatures.ts DIM_ORDER) into a deterministic MotionSpec — how the
// generated image animates under its audio. One loop is one beat: loopMs =
// 60000/bpm, bpm clamped into the canonical 70-160 band (→ 375-857 ms).
// Keyframes sit on the beat grid inside the loop (pulses subdivided by
// onset density and gated by pulse trust, a section-start reveal, a flux
// wipe, a narrative shift); strengths blend confidence + regularity;
// parallaxDepth reads the energyDrive cross dim by name (DIM_ORDER places
// it at 29); drift follows the narrativeContour table; easing is pure data
// (beziers + documented damped spring; house micro 150 ms / window 250 ms /
// 0.22,1,0.36,1 exported). Total and deterministic. Exports: 7 types, 12
// doctrine constants, evaluateEase, synthMotion, motionTimeline,
// motionReduced.

import type { AudioDescriptor } from "./audioattributes.ts";
import { clamp01, DIM_ORDER } from "./audiofeatures.ts";
import { bezierprogress } from "./easecurves.ts";

/** spec-level easing names — pure evaluators, never CSS timing strings
 *  (evaluateEase also answers the house "micro" curve). */
export type MotionEasing = "standard" | "decelerate" | "accelerate" | "springy";
export type EaseName = MotionEasing | "micro";

/** the four motion gestures a keyframe can drive. */
export type MotionKeyframeKind = "pulse" | "shift" | "reveal" | "wipe";

/** per-loop camera drift: x/y in reference-frame px, rotation in degrees. */
export type MotionDrift = { x: number; y: number; rotation: number };

/** one motion gesture inside the loop — tMs ∈ [0, loopMs), strength 0-1;
 *  targets = the block roles it drives (empty = the whole frame). */
export type MotionKeyframe = { tMs: number; kind: MotionKeyframeKind; strength: number; targets: readonly string[] };

/** the full choreography one descriptor synthesizes — frozen on return. */
export type MotionSpec = {
  loopMs: number; // one beat: 60000/bpm, canonical 70-160 bpm → 375-857 ms
  keyframes: readonly MotionKeyframe[]; // ≤ KEYFRAME_CAP, sorted by tMs then kind
  easing: MotionEasing; // spec-level default curve for the render wave
  drift: MotionDrift; // per-loop drift from the narrative contour
  pulseScale: number; // beat breath, PULSE_SCALE_FLOOR…PULSE_SCALE_CEIL
  parallaxDepth: number; // 0-1, from the energyDrive cross dim
};

/** one absolute-timed event of motionTimeline: tMs from clip start, loop =
 *  the 0-based loop index, strength 0-1, targets = block roles driven. */
export type MotionEvent = {
  tMs: number;
  kind: MotionKeyframeKind;
  strength: number;
  targets: readonly string[];
  loop: number;
};

// ---- doctrine constants (pure data for the render/export waves) ----

/** canonical bpm band — loopMs always lands at 375-857 ms inside it. */
export const MOTION_MIN_BPM = 70;
export const MOTION_MAX_BPM = 160;

/** house micro doctrine: micro moves play 150 ms, window moves 250 ms. */
export const MICRO_MS = 150;
export const WINDOW_MS = 250;

/** the house micro bezier — (0.22, 1, 0.36, 1), strong ease-out, no string. */
export const MICRO_EASE: readonly [number, number, number, number] = [0.22, 1, 0.36, 1];

/** control points per named bezier: standard — the workhorse in-out;
 *  decelerate — fast entry to rest; accelerate — rest into fast exit. */
export const EASE_CONTROL: Readonly<Record<Exclude<EaseName, "springy">, readonly [number, number, number, number]>> = {
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
  micro: MICRO_EASE,
};

/** springy = damped spring from rest: 1 − e^(−6t)(cos 8t + 0.75 sin 8t), ζ ≈ 0.6, overshoot ≈ 9.5 %, tail pinned to 1. */
export const SPRING_DECAY = 6;
export const SPRING_FREQUENCY = 8;

/** beat breath floors: idle 0.96 → hardest hit 1.08. */
export const PULSE_SCALE_FLOOR = 0.96;
export const PULSE_SCALE_CEIL = 1.08;

/** hard caps: ≤ 64 keyframes per spec, ≤ 512 events per timeline. */
export const KEYFRAME_CAP = 64;
export const TIMELINE_EVENT_CAP = 512;

/** neutral loop when nothing readable is provided (120 bpm). */
const DEFAULT_LOOP_MS = 500;

// ---- descriptor dims (resolved by name against DIM_ORDER, indexed fallback) ----

function dimIndex(name: string, fallback: number): number {
  const at = DIM_ORDER.indexOf(name);
  return at >= 0 ? at : fallback;
}

const DIM_FLUX = dimIndex("flux", 4); // 0-6 spectral block
const DIM_FLUX_VARIANCE = dimIndex("fluxVariance", 5);
const DIM_TEMPO = dimIndex("tempo", 7); // 7-11 rhythm block
const DIM_PULSE_TRUST = dimIndex("pulseConfidence", 8);
const DIM_ONSETS = dimIndex("onsetDensity", 9);
const DIM_REGULARITY = dimIndex("grooveRegularity", 10);
const DIM_PUNCH = dimIndex("punch", 22); // 22-27 energy/structure block
const DIM_PEAK_MASS = dimIndex("peakMass", 24);
const DIM_CONTOUR = dimIndex("narrativeContour", 26);
const DIM_SECTION_DENSITY = dimIndex("sectionDensity", 27);
const DIM_ENERGY_DRIVE = dimIndex("energyDrive", 29); // 28-31 cross block

/** onsetDensity stores onsets/s squashed over 0-8 — the raw rate back out. */
const ONSET_SPAN = 8;

/** flux blend that opens the wipe: 0.7 flux + 0.3 variance ≥ this. */
const WIPE_FLUX_GATE = 0.4;

/** total number read: finite numbers pass, everything else answers 0. */
function num(x: unknown): number {
  return typeof x === "number" && Number.isFinite(x) ? x : 0;
}

/** clamped dim read — damaged descriptors answer 0, never NaN, never throw. */
function dim(descriptor: AudioDescriptor | null | undefined, at: number): number {
  const vector = (descriptor as { vector?: unknown } | null | undefined)?.vector;
  return Array.isArray(vector) ? clamp01(num((vector as unknown[])[at])) : 0;
}

// narrativeContour weights (flat 0, fall 0.25, wave 0.5, arch 0.75, rise 1)
// → per-loop camera drift, band-matched; a flat narrative rests the camera.
const DRIFT_BY_CONTOUR: readonly { ceiling: number; drift: MotionDrift }[] = [
  { ceiling: 0.125, drift: { x: 0, y: 0, rotation: 0 } }, // flat
  { ceiling: 0.375, drift: { x: -8, y: 6, rotation: -0.8 } }, // fall
  { ceiling: 0.625, drift: { x: 5, y: 0, rotation: 0.5 } }, // wave
  { ceiling: 0.875, drift: { x: 9, y: -5, rotation: 1 } }, // arch
  { ceiling: Number.POSITIVE_INFINITY, drift: { x: 12, y: -9, rotation: 1.5 } }, // rise
];

function driftFor(contour: number): MotionDrift {
  const row = DRIFT_BY_CONTOUR.find((entry) => contour < entry.ceiling) ?? DRIFT_BY_CONTOUR[0];
  return { x: row.drift.x, y: row.drift.y, rotation: row.drift.rotation };
}

/**
 * pure easing evaluator: the value fraction (0-1) the named curve plays at
 * time fraction t (clamped; endpoints exactly 0 and 1). Beziers ride the
 * shared easecurves engine (Newton + bisection); springy is the documented
 * damped spring; unknown names → standard.
 */
export function evaluateEase(name: EaseName, t: number): number {
  if (!Number.isFinite(t)) return 0;
  const tc = Math.min(1, Math.max(0, t));
  if (tc <= 0) return 0;
  if (tc >= 1) return 1;
  if (name === "springy") {
    return (
      1 -
      Math.exp(-SPRING_DECAY * tc) *
        (Math.cos(SPRING_FREQUENCY * tc) + (SPRING_DECAY / SPRING_FREQUENCY) * Math.sin(SPRING_FREQUENCY * tc))
    );
  }
  const points = EASE_CONTROL[name as Exclude<EaseName, "springy">] ?? EASE_CONTROL.standard;
  return bezierprogress(points[0], points[1], points[2], points[3], tc);
}

const KIND_RANK: Record<MotionKeyframeKind, number> = { reveal: 0, wipe: 1, shift: 2, pulse: 3 };

function kindRank(kind: unknown): number {
  return typeof kind === "string" && kind in KIND_RANK ? KIND_RANK[kind as MotionKeyframeKind] : 9;
}

/** canonical spec order: time, then gesture priority, then stronger first. */
function canonicalOrder(a: MotionKeyframe, b: MotionKeyframe): number {
  return (
    num(a.tMs) - num(b.tMs) ||
    kindRank(a.kind) - kindRank(b.kind) ||
    clamp01(num(b.strength)) - clamp01(num(a.strength))
  );
}

function keyframe(tMs: number, kind: MotionKeyframeKind, strength: number, targets: readonly string[]): MotionKeyframe {
  return Object.freeze({ tMs, kind, strength: clamp01(strength), targets: Object.freeze([...targets]) });
}

/** deterministic 0…span-1 turn from the first hex nibbles of the seed. */
function seedTurn(seed: string, span: number): number {
  if (span <= 1) return 0;
  const turn = Number.parseInt(seed.slice(0, 4), 16);
  return Number.isFinite(turn) ? turn % span : 0;
}

/**
 * synthesizes the motion choreography for one fused descriptor and the
 * composition's block roles (when the mapping wave has them). Deterministic
 * and frozen: same inputs → deep-equal spec; totals over damaged
 * descriptors (every read coerces, nothing throws, nothing NaN). House
 * order — reveal t=0 (section-start proxy; downbeat cycle, peak mass and
 * section density set strength) · shift t=½ (drift carrier, narrative
 * moves) · wipe t=¾ (hot flux; one seed-rotated block band) · pulse grid
 * 1/2/4 per loop by onset density (≥2.5 onsets/beat → 16ths, ≥1.25 → 8ths),
 * gated by pulse trust (<0.35 → downbeat only), strengths blending
 * confidence + regularity, decaying across offbeats.
 */
export function synthMotion(descriptor: AudioDescriptor, blockRoles?: string[]): MotionSpec {
  const box = (descriptor ?? {}) as { vector?: unknown; scalar?: unknown; seed?: unknown };
  const scalar = (box.scalar !== null && typeof box.scalar === "object" ? box.scalar : {}) as Record<string, unknown>;
  const bpmRaw = num(scalar.bpm);
  const bpm =
    bpmRaw > 0
      ? Math.min(MOTION_MAX_BPM, Math.max(MOTION_MIN_BPM, bpmRaw))
      : MOTION_MIN_BPM + dim(descriptor, DIM_TEMPO) * (MOTION_MAX_BPM - MOTION_MIN_BPM);
  const loopMs = 60000 / bpm;
  const confidence = dim(descriptor, DIM_PULSE_TRUST);
  const regularity = dim(descriptor, DIM_REGULARITY);
  const contour = dim(descriptor, DIM_CONTOUR);
  const punch = dim(descriptor, DIM_PUNCH);
  const fluxGate = clamp01(0.7 * dim(descriptor, DIM_FLUX) + 0.3 * dim(descriptor, DIM_FLUX_VARIANCE));

  const roles = (Array.isArray(blockRoles) ? blockRoles : []).filter(
    (role) => typeof role === "string" && role.length > 0,
  );
  const all = Object.freeze(roles);
  const band = roles.length > 0 ? roles[seedTurn(typeof box.seed === "string" ? box.seed : "", roles.length)] : null;

  const keyframes: MotionKeyframe[] = [];
  const downbeat = Math.min(16, Math.max(1, Math.round(num(scalar.downbeat)) || 4));
  const revealWeight = clamp01(0.75 + 0.25 / downbeat); // tight downbeat cycles open hotter
  keyframes.push(
    keyframe(
      0,
      "reveal",
      clamp01(
        (0.3 + 0.45 * dim(descriptor, DIM_PEAK_MASS) + 0.25 * dim(descriptor, DIM_SECTION_DENSITY)) * revealWeight,
      ),
      all,
    ),
  );
  if (contour > 0) keyframes.push(keyframe(loopMs / 2, "shift", clamp01(0.2 + 0.6 * contour), all));
  if (fluxGate >= WIPE_FLUX_GATE)
    keyframes.push(keyframe(loopMs * 0.75, "wipe", clamp01(0.35 + 0.65 * fluxGate), band ? [band] : []));
  const breath = clamp01(0.5 * punch + 0.3 * confidence + 0.2 * regularity);
  const pulseBase = clamp01(0.35 + 0.45 * confidence + 0.2 * regularity);
  const onsetsPerBeat = (dim(descriptor, DIM_ONSETS) * ONSET_SPAN) / (bpm / 60);
  const grid = confidence < 0.35 ? 1 : onsetsPerBeat >= 2.5 ? 4 : onsetsPerBeat >= 1.25 ? 2 : 1;
  for (let i = 0; i < grid; i += 1) {
    keyframes.push(keyframe((loopMs * i) / grid, "pulse", Math.max(0.15, pulseBase * (1 - 0.18 * i)), all));
  }
  keyframes.sort(canonicalOrder);

  return Object.freeze({
    loopMs,
    keyframes: Object.freeze(keyframes.slice(0, KEYFRAME_CAP)),
    easing: punch >= 0.66 || fluxGate >= 0.6 ? "springy" : contour >= 0.625 ? "standard" : "decelerate",
    drift: Object.freeze(driftFor(contour)),
    pulseScale: PULSE_SCALE_FLOOR + (PULSE_SCALE_CEIL - PULSE_SCALE_FLOOR) * breath,
    parallaxDepth: dim(descriptor, DIM_ENERGY_DRIVE),
  });
}

/**
 * expands the spec across the clip: floor(durationMs/loopMs) copies of the
 * keyframe grid as absolute-timed events sorted by time, hard-capped at
 * 512 (stream beyond that by looping the spec again); zero/negative
 * durations and empty specs answer [].
 */
export function motionTimeline(spec: MotionSpec, durationMs: number): readonly MotionEvent[] {
  const box = (spec ?? {}) as { loopMs?: unknown; keyframes?: unknown };
  const loopMs = num(box.loopMs);
  const keys = Array.isArray(box.keyframes) ? (box.keyframes as readonly MotionKeyframe[]) : [];
  if (!(loopMs > 0) || keys.length === 0) return [];
  const dur = Math.max(0, num(durationMs));
  const loops = Math.floor(dur / loopMs);
  if (loops <= 0) return [];
  const ordered = [...keys].sort(canonicalOrder);
  const events: MotionEvent[] = [];
  const count = Math.min(loops * ordered.length, TIMELINE_EVENT_CAP);
  for (let n = 0; n < count; n += 1) {
    const at = Math.floor(n / ordered.length);
    const kf = ordered[n % ordered.length];
    events.push(
      Object.freeze({
        tMs: at * loopMs + num(kf?.tMs),
        kind: (typeof kf?.kind === "string" ? kf.kind : "pulse") as MotionKeyframeKind,
        strength: clamp01(num(kf?.strength)),
        targets: Object.freeze([...(Array.isArray(kf?.targets) ? kf.targets : [])]),
        loop: at,
      }),
    );
  }
  return Object.freeze(events);
}

/**
 * the accessibility hard-stop: everything that moves the frame on its own
 * (drift, beat breath, camera parallax, springy overshoot) is switched off;
 * only reveal keyframes survive — content still appears, it just stops
 * dancing. Idempotent, never mutates the input.
 */
export function motionReduced(spec: MotionSpec): MotionSpec {
  const box = (spec ?? {}) as { loopMs?: unknown; keyframes?: unknown };
  const loopMs = num(box.loopMs);
  const keys = Array.isArray(box.keyframes) ? (box.keyframes as readonly MotionKeyframe[]) : [];
  const ceiling = loopMs > 0 ? loopMs : Number.POSITIVE_INFINITY;
  const reveals = keys
    .filter((kf) => kf?.kind === "reveal")
    .map((kf) =>
      Object.freeze({
        tMs: Math.min(Math.max(num(kf.tMs), 0), ceiling),
        kind: "reveal" as const,
        strength: clamp01(num(kf.strength)),
        targets: Object.freeze([...(Array.isArray(kf.targets) ? kf.targets : [])]),
      }),
    );
  return Object.freeze({
    loopMs: loopMs > 0 ? loopMs : DEFAULT_LOOP_MS,
    keyframes: Object.freeze(reveals),
    easing: "decelerate" as const,
    drift: Object.freeze({ x: 0, y: 0, rotation: 0 }),
    pulseScale: 1,
    parallaxDepth: 0,
  });
}
