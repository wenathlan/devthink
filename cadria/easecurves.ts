// # easecurves — the temporal easing of one keyframe segment for the cadria
// motion tools, housed at the cadria root beside timeticks. A curve is
// independent of the segment's duration and values, so it can be kept as a
// preset and applied to any pair of keyframes: it is the out side of the
// first key and the in side of the second, in Keyframe-Velocity terms —
// influence in percent of the segment, speed relative to the segment's
// average speed (1 = linear, 0 = at rest). In the normalized value graph the
// handles are (x1, y1) = (out influence, out speed · out influence) and
// (x2, y2) = (1 − in influence, 1 − in speed · in influence). Sampling is
// deterministic: one Newton pass with a fixed bisection fallback, no
// randomness, no time-based iteration. The clean-room pattern is absorbed
// from effectcraft (storytold/effectcraft, crates/keyframe/ease_curve.rs — a
// PROJETO-class clean-room), re-derived natively in pure TypeScript: no
// keyframe value unions (scalar numbers only), no spatial/motion-path
// dimension scaling, no auto-bezier bookkeeping. Errors answer null by
// return type; nothing throws. Non-goals: no DOM/CSS timing functions, no
// spring physics, no color interpolation, no timeline sequencing
// (timelineedit.ts owns edits). Exports: 12 functions, 4 named presets +
// the preset table, 2 constants, 2 types — the honest count for this theme.

/** one segment easing: the out side of key A and the in side of key B. */
export type EaseCurve = {
  /** how much of the segment (0.1–100 %) the outgoing ease owns */
  outInfluence: number;
  /** outgoing speed relative to the segment average (0 = at rest, 1 = linear) */
  outSpeed: number;
  /** how much of the segment (0.1–100 %) the incoming ease owns */
  inInfluence: number;
  /** incoming speed relative to the segment average */
  inSpeed: number;
};

/** one scalar keyframe with its two sides (null/absent side plays linear). */
export type EaseKey = {
  /** key time in ticks */
  time: number;
  /** the held value */
  value: number;
  /** ease leaving this key (undefined plays linear) */
  outCurve?: EaseCurve | null;
  /** ease entering this key (undefined plays linear) */
  inCurve?: EaseCurve | null;
  /** hold key: the value freezes until the next key time, then jumps */
  holdOut?: boolean;
};

/** smallest influence (percent), as in the Keyframe Velocity dialog. */
export const MIN_INFLUENCE = 0.1;

/** relative speeds stay within ± this (a handle 100× steeper than linear). */
export const MAX_SPEED = 100;

/** constant speed: both handles a third of the way along the straight line. */
export const EASE_LINEAR: EaseCurve = { outInfluence: 100 / 3, outSpeed: 1, inInfluence: 100 / 3, inSpeed: 1 };

/** easy ease: at rest on both ends of the segment. */
export const EASE_INOUT: EaseCurve = { outInfluence: 100 / 3, outSpeed: 0, inInfluence: 100 / 3, inSpeed: 0 };

/** starts at rest, releases into linear. */
export const EASE_IN: EaseCurve = { outInfluence: 100 / 3, outSpeed: 0, inInfluence: 100 / 3, inSpeed: 1 };

/** linear into the segment, settles at rest. */
export const EASE_OUT: EaseCurve = { outInfluence: 100 / 3, outSpeed: 1, inInfluence: 100 / 3, inSpeed: 0 };

/** the named preset table the motion panel iterates. */
export const EASE_PRESETS: Readonly<Record<"linear" | "in" | "out" | "inout", EaseCurve>> = {
  linear: EASE_LINEAR,
  in: EASE_IN,
  out: EASE_OUT,
  inout: EASE_INOUT,
};

/** the curve with influences in 0.1–100 % and speeds within ±100; null when a number is not finite. */
export function sanitizecurve(curve: EaseCurve): EaseCurve | null {
  const values = [curve.outInfluence, curve.outSpeed, curve.inInfluence, curve.inSpeed];
  if (!values.every((v) => Number.isFinite(v))) return null;
  const inf = (v: number) => Math.min(100, Math.max(MIN_INFLUENCE, v));
  const speed = (v: number) => Math.min(MAX_SPEED, Math.max(-MAX_SPEED, v));
  return {
    outInfluence: inf(curve.outInfluence),
    outSpeed: speed(curve.outSpeed),
    inInfluence: inf(curve.inInfluence),
    inSpeed: speed(curve.inSpeed),
  };
}

/** handles in the normalized value graph: [x1, y1, x2, y2]. */
export function curvehandles(curve: EaseCurve): [number, number, number, number] {
  const o = curve.outInfluence / 100;
  const i = curve.inInfluence / 100;
  return [o, curve.outSpeed * o, 1 - i, 1 - curve.inSpeed * i];
}

/** the curve with handles [x1, y1, x2, y2] (influence floored at 0.1 %); null when not finite. */
export function curvefromhandles(handles: readonly number[]): EaseCurve | null {
  if (handles.length !== 4 || !handles.every((v) => Number.isFinite(v))) return null;
  const o = Math.min(1, Math.max(MIN_INFLUENCE / 100, handles[0]));
  const i = Math.min(1, Math.max(MIN_INFLUENCE / 100, 1 - handles[2]));
  return sanitizecurve({
    outInfluence: o * 100,
    outSpeed: handles[1] / o,
    inInfluence: i * 100,
    inSpeed: (1 - handles[3]) / i,
  });
}

function bezieraxis(u: number, c1: number, c2: number): number {
  const omu = 1 - u;
  return 3 * omu * omu * u * c1 + 3 * omu * u * u * c2 + u * u * u;
}

/** solves x(u) = t for the monotone time axis (x1/x2 within 0–1 keep it monotone). */
function beziersolve(t: number, x1: number, x2: number): number {
  let u = t;
  for (let i = 0; i < 8; i += 1) {
    const err = bezieraxis(u, x1, x2) - t;
    if (Math.abs(err) < 1e-9) return u;
    const d = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
    if (Math.abs(d) < 1e-12) break;
    u -= err / d;
    if (u < 0) u = 0;
    if (u > 1) u = 1;
  }
  let lo = 0;
  let hi = 1;
  u = t;
  for (let i = 0; i < 24; i += 1) {
    const err = bezieraxis(u, x1, x2) - t;
    if (Math.abs(err) < 1e-9) return u;
    if (err < 0) lo = u;
    else hi = u;
    u = (lo + hi) / 2;
  }
  return u;
}

/** the progress (value fraction) a cubic-bezier pair of handles plays at time fraction t. */
export function bezierprogress(x1: number, y1: number, x2: number, y2: number, t: number): number {
  if (![x1, y1, x2, y2, t].every(Number.isFinite)) return 0;
  const tc = Math.min(1, Math.max(0, t));
  if (tc <= 0) return 0;
  if (tc >= 1) return 1;
  return bezieraxis(beziersolve(tc, Math.min(1, Math.max(0, x1)), Math.min(1, Math.max(0, x2))), y1, y2);
}

/** the progress the curve plays at time fraction t (sanitized first); null when unsanitizable. */
export function curveprogress(curve: EaseCurve, t: number): number | null {
  const safe = sanitizecurve(curve);
  if (!safe) return null;
  const [x1, y1, x2, y2] = curvehandles(safe);
  return bezierprogress(x1, y1, x2, y2, t);
}

/** whether the curve plays the straight line (both sides linear within epsilon). */
export function islinearcurve(curve: EaseCurve): boolean {
  const safe = sanitizecurve(curve);
  if (!safe) return false;
  const near = (a: number, b: number, eps: number) => Math.abs(a - b) <= eps;
  return (
    near(safe.outSpeed, 1, 1e-9) &&
    near(safe.inSpeed, 1, 1e-9) &&
    near(safe.outInfluence, 100 / 3, 1e-6) &&
    near(safe.inInfluence, 100 / 3, 1e-6)
  );
}

/** the inverse question: at what time fraction does the curve reach progress p (bisection, deterministic). */
export function timeatprogress(curve: EaseCurve, p: number): number | null {
  const safe = sanitizecurve(curve);
  if (!safe) return null;
  const [x1, y1, x2, y2] = curvehandles(safe);
  const target = Math.min(1, Math.max(0, p));
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2;
    const v = bezierprogress(x1, y1, x2, y2, mid);
    if (Math.abs(v - target) < 1e-9) return mid;
    if (v < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** the value a segment plays at t01 ∈ [0, 1] — hold keys jump, curves compose out→in. */
export function evaluatesegment(a: EaseKey, b: EaseKey, t01: number): number {
  if (!Number.isFinite(t01)) return a.value;
  const t = Math.min(1, Math.max(0, t01));
  if (a.holdOut) return t < 1 ? a.value : b.value;
  const oa = ((a.outCurve ? sanitizecurve(a.outCurve) : null) ?? EASE_LINEAR).outInfluence / 100;
  const ib = ((b.inCurve ? sanitizecurve(b.inCurve) : null) ?? EASE_LINEAR).inInfluence / 100;
  const out = a.outCurve ? sanitizecurve(a.outCurve) : null;
  const inn = b.inCurve ? sanitizecurve(b.inCurve) : null;
  const x1 = out ? oa : 1 / 3;
  const y1 = out ? out.outSpeed * oa : (1 / 3) * 1;
  const x2 = inn ? 1 - ib : 2 / 3;
  const y2 = inn ? 1 - inn.inSpeed * ib : 1 - (1 / 3) * 1;
  const p = bezierprogress(x1, y1, x2, y2, t);
  return a.value + (b.value - a.value) * p;
}

/** the value the key track plays at `time` (ticks); null for an empty track. */
export function evaluatekeys(keys: readonly EaseKey[], time: number): number | null {
  if (keys.length === 0 || !Number.isFinite(time)) return null;
  if (time <= keys[0].time) return keys[0].value;
  if (time >= keys[keys.length - 1].time) return keys[keys.length - 1].value;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const a = keys[i];
    const b = keys[i + 1];
    if (time >= a.time && time <= b.time) {
      if (b.time <= a.time) return b.value;
      return evaluatesegment(a, b, (time - a.time) / (b.time - a.time));
    }
  }
  return keys[keys.length - 1].value;
}

/** n + 1 deterministic progress samples (0 → 1) of the curve; null when unsanitizable. */
export function samplecurve(curve: EaseCurve, n: number): number[] | null {
  const steps = Math.trunc(n);
  if (!(steps >= 1)) return null;
  const safe = sanitizecurve(curve);
  if (!safe) return null;
  const samples: number[] = [];
  for (let i = 0; i <= steps; i += 1) samples.push(curveprogress(safe, i / steps) ?? 0);
  return samples;
}

/** applies the curve to segment i → i+1 on a copy; null when there is no such segment. */
export function applycurve(keys: readonly EaseKey[], i: number, curve: EaseCurve): EaseKey[] | null {
  const idx = Math.trunc(i);
  if (idx < 0 || idx + 1 >= keys.length) return null;
  const safe = sanitizecurve(curve);
  if (!safe) return null;
  return keys.map((key, at) => {
    if (at === idx) return { ...key, outCurve: safe };
    if (at === idx + 1) return { ...key, inCurve: safe };
    return key;
  });
}

/** the curve segment i → i+1 plays (a side without a curve measures linear); null for holds. */
export function measurecurve(keys: readonly EaseKey[], i: number): EaseCurve | null {
  const idx = Math.trunc(i);
  if (idx < 0 || idx + 1 >= keys.length) return null;
  const a = keys[idx];
  const b = keys[idx + 1];
  if (a.holdOut) return null;
  const out = a.outCurve ? sanitizecurve(a.outCurve) : null;
  const inn = b.inCurve ? sanitizecurve(b.inCurve) : null;
  if (!out && !inn) return sanitizecurve(EASE_LINEAR);
  return sanitizecurve({
    outInfluence: out ? out.outInfluence : 100 / 3,
    outSpeed: out ? out.outSpeed : 1,
    inInfluence: inn ? inn.inInfluence : 100 / 3,
    inSpeed: inn ? inn.inSpeed : 1,
  });
}
