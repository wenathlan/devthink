/**
 * motion — consolidated motion and time logics of the cadria family.
 * @module motion
 * @family wave/logicfold2
 * One keyed file per family: the former variant arms (easecurves, timeticks, designmotion)
 * retired into this seat with every export preserved under the same name.
 */

// # motion.ts — the one keyed file of the motion family: the consolidation
// law of the root (one keyed file per family — the pattern versawase.ts
// itself set when it folded its eight arms) merged the three motion and time
// seats of the studio into this seat — the keyframe easing curves (the
// former easecurves.ts body below), the exact tick clock (timeticks.ts) and
// the sol.css motion token mirror (designmotion.ts) — every export
// preserved verbatim, zero logic changes. The consolidation notes: the three
// seats declared no duplicated helper and no same-name const or decl across
// their bodies (the designmotion EASE_* token spellings never collide with
// the easecurves preset table), so every export rides once under its own
// name with no group suffix; the one intra-family import the seats carried
// (designmotion reading bezierprogress from easecurves) dissolved into the
// seat; no other import rode the three waves — every surface stays live in
// one seat.


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: easecurves.ts — the keyframe easing curves (first section).    */
/* (consolidation note: zero imports rode this wave — the body lands       */
/* verbatim.)                                                              */
/* ══════════════════════════════════════════════════════════════════════ */

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
// project-class clean-room), re-derived natively in pure TypeScript: no
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

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: timeticks.ts — the exact tick clock.                           */
/* (consolidation note: zero imports rode this wave — the body lands       */
/* verbatim.)                                                              */
/* ══════════════════════════════════════════════════════════════════════ */

// # timeticks — exact media time for the cadria video studio, housed at the
// cadria root beside versawase. All time is an integer number of ticks at
// TICKS_PER_SECOND = 254 016 000 000/s — a rate that divides evenly into every
// broadcast frame duration (23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60,
// 119.88, 120) and every common audio sample clock (8 k … 192 k), so edits,
// frame math and audio alignment never drift. Timecode (SMPTE drop/non-drop)
// is only a *display* of ticks. Every conversion is total: a zero or negative
// rate answers the default rate instead of dividing by zero, and non-finite
// numbers answer zero instead of throwing. The clean-room pattern is absorbed
// from filmcraft (storytold/filmcraft, crates/time — a project-class
// clean-room of the exact-time model of professional editors), re-derived
// natively in pure TypeScript: BigInt carry gives the exact rational
// multiplications that plain floats cannot, and every result saturates inside
// the safe-integer range. Non-goals: no wall-clock or calendar time, no
// ffmpeg time-base strings, no DOM/storage/worker, no sequencing (the edit
// algebra lives in timelineedit.ts). Exports: 22 functions, 4 types, 4
// constants — the honest count for this theme.

export const TICKS_PER_SECOND = 254_016_000_000;

/** every tick answer saturates here (± 2^53 − 1 ticks ≈ 9.85 hours). */
export const MAX_TICKS = Number.MAX_SAFE_INTEGER;

/** a frame rate as an exact rational `num / den` frames per second. */
export type FrameRate = { num: number; den: number };

/** the rate every damaged/absent rate falls back to (23.976). */
export const DEFAULT_FRAME_RATE: FrameRate = { num: 24000, den: 1001 };

/** the sequence-settings list of common rates, in editor menu order. */
export const COMMON_FRAME_RATES: readonly FrameRate[] = [
  { num: 24000, den: 1001 },
  { num: 24, den: 1 },
  { num: 25, den: 1 },
  { num: 30000, den: 1001 },
  { num: 30, den: 1 },
  { num: 48, den: 1 },
  { num: 50, den: 1 },
  { num: 60000, den: 1001 },
  { num: 60, den: 1 },
  { num: 120000, den: 1001 },
  { num: 120, den: 1 },
];

function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function saturate(v: bigint | number): number {
  const n = typeof v === "bigint" ? Number(v) : v;
  return n > MAX_TICKS ? MAX_TICKS : n < -MAX_TICKS ? -MAX_TICKS : n;
}

/** floor((a·num)/den) exactly via BigInt (never a float drift, never a panic). */
function ratiofloor(a: number, num: number, den: number): number {
  if (den === 0 || !Number.isFinite(a) || !Number.isFinite(num)) return 0;
  const n = BigInt(Math.trunc(a)) * BigInt(Math.trunc(num));
  const d = BigInt(Math.trunc(den));
  const q = n / d;
  return saturate(n % d === 0n || n < 0n === d < 0n ? q : q - 1n);
}

/** round((a·num)/den), halves away from zero, exactly via BigInt. */
function _ratioround(a: number, num: number, den: number): number {
  if (den === 0 || !Number.isFinite(a) || !Number.isFinite(num)) return 0;
  const n = BigInt(Math.trunc(a)) * BigInt(Math.trunc(num));
  const d = BigInt(Math.trunc(den));
  const neg = n < 0n !== d < 0n;
  const an = n < 0n ? -n : n;
  const ad = d < 0n ? -d : d;
  let q = an / ad;
  if ((an % ad) * 2n >= ad) q += 1n;
  return saturate(neg ? -q : q);
}

/** reduces `num/den` by gcd; a zero or negative side answers the default rate. */
export function framerate(num: number, den: number): FrameRate {
  const g = gcd(Math.abs(Math.trunc(num)), Math.abs(Math.trunc(den))) || 1;
  const n = Math.trunc(num) / g;
  const d = Math.trunc(den) / g;
  return n > 0 && d > 0 ? { num: n, den: d } : { ...DEFAULT_FRAME_RATE };
}

/** closest standard rate for a container's average fps; exotic rates become n/1000. */
export function frameratefromf64(fps: number): FrameRate {
  if (!Number.isFinite(fps) || fps <= 0) return { ...DEFAULT_FRAME_RATE };
  for (const r of COMMON_FRAME_RATES) {
    if (Math.abs(r.num / r.den - fps) < 0.005) return { ...r };
  }
  return framerate(Math.round(fps * 1000), 1000);
}

/** human label ("24", "23.976") — the display of a rational rate. */
export function framelabel(rate: FrameRate): string {
  const r = framerate(rate.num, rate.den);
  if (r.den === 1) return String(r.num);
  return (r.num / r.den).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

/** exact tick duration of one frame (rounded down only for exotic rates). */
export function frameduration(rate: FrameRate): number {
  const r = framerate(rate.num, rate.den);
  return Math.max(1, ratiofloor(TICKS_PER_SECOND, r.den, r.num));
}

/** index of the frame containing `t` (floor, exact). */
export function frameat(rate: FrameRate, t: number): number {
  const r = framerate(rate.num, rate.den);
  return ratiofloor(Math.trunc(t), r.num, TICKS_PER_SECOND * r.den);
}

/** start tick of frame `f` (exact). */
export function tickofframe(rate: FrameRate, f: number): number {
  const r = framerate(rate.num, rate.den);
  return ratiofloor(Math.trunc(f), TICKS_PER_SECOND * r.den, r.num);
}

/** snaps `t` to a frame boundary: floor, nearest, or ceil. */
export function snaptick(rate: FrameRate, t: number, mode: "floor" | "nearest" | "ceil" = "floor"): number {
  const a = tickofframe(rate, frameat(rate, t));
  if (mode === "floor") return a;
  const b = tickofframe(rate, frameat(rate, t) + 1);
  if (mode === "ceil") return t <= a ? a : b;
  return t - a <= b - t ? a : b;
}

/** timecode base (frames per timecode second) and NTSC drop-frame params. */
export type TimecodeParams = { base: number; dropPerMinute: number; dropCapable: boolean };

/** 30 for 29.97 → 2 dropped per minute; drop only applies to x/1001 rates with base % 30 === 0. */
export function timecodeparams(rate: FrameRate): TimecodeParams {
  const r = framerate(rate.num, rate.den);
  const base = Math.max(1, Math.ceil(r.num / r.den));
  const dropCapable = r.den === 1001 && base % 30 === 0;
  return { base, dropPerMinute: dropCapable ? base / 15 : 0, dropCapable };
}

/** SMPTE fields of a frame count: (neg, h, m, s, f) with the drop-frame skip applied. */
export type TimecodeFields = { neg: boolean; hours: number; minutes: number; seconds: number; frames: number };

export function framestofields(frame: number, rate: FrameRate, dropFrame = false): TimecodeFields {
  const p = timecodeparams(rate);
  let n = Math.abs(Math.trunc(frame));
  const neg = Math.trunc(frame) < 0;
  if (dropFrame && p.dropCapable) {
    const perMin = p.base * 60 - p.dropPerMinute;
    const per10 = perMin * 10 + p.dropPerMinute;
    const d = Math.floor(n / per10);
    const m = n - d * per10;
    n += p.dropPerMinute * 9 * d;
    if (m > p.dropPerMinute) n += p.dropPerMinute * Math.floor((m - p.dropPerMinute) / perMin);
  }
  return {
    neg,
    hours: Math.floor(n / (p.base * 3600)),
    minutes: Math.floor(n / (p.base * 60)) % 60,
    seconds: Math.floor(n / p.base) % 60,
    frames: n % p.base,
  };
}

/** "HH:MM:SS(:|;)FF" of tick `t`; the ";" separator marks drop-frame counting. */
export function formattimecode(t: number, rate: FrameRate, dropFrame = false): string {
  const f = framestofields(frameat(rate, t), rate, dropFrame);
  const sep = dropFrame && timecodeparams(rate).dropCapable ? ";" : ":";
  const p2 = (v: number) => String(v).padStart(2, "0");
  return `${f.neg ? "-" : ""}${p2(f.hours)}:${p2(f.minutes)}:${p2(f.seconds)}${sep}${p2(f.frames)}`;
}

/** parses "HH:MM:SS:FF" (also "MM:SS:FF", "SS:FF", and ";" drop spellings) into ticks. */
export function parsetimecode(text: string, rate: FrameRate, dropFrame = false): number | null {
  const p = timecodeparams(rate);
  const raw = text.trim();
  const neg = raw.startsWith("-");
  const parts = (neg ? raw.slice(1) : raw).split(/[:;]/);
  if (parts.length < 2 || parts.length > 4) return null;
  const nums = parts.map((s) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : NaN));
  if (nums.some((v) => !Number.isFinite(v))) return null;
  while (nums.length < 4) nums.unshift(0);
  const [h, m, s, f] = nums;
  if (m > 59 || s > 59 || f >= p.base) return null;
  let n = ((h * 60 + m) * 60 + s) * p.base + f;
  if (dropFrame && p.dropCapable) n -= p.dropPerMinute * (m - Math.floor(m / 10));
  const t = tickofframe(rate, n);
  return neg ? -t : t;
}

/** seconds → ticks, rounded to the nearest tick (exact inside the safe range). */
export function ticksfromseconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return 0;
  const w = Math.trunc(seconds);
  const frac = seconds - w;
  return saturate(BigInt(w) * BigInt(TICKS_PER_SECOND) + BigInt(Math.round(frac * TICKS_PER_SECOND)));
}

/** ticks → seconds at display precision (ticks stay the source of truth). */
export function tickstoseconds(t: number): number {
  return Math.trunc(t) / TICKS_PER_SECOND;
}

/** exact conversion from `units` at `per_second` (e.g. samples at 48 000); zero rate → 0. */
export function ticksfromunits(units: number, perSecond: number): number {
  return ratiofloor(units, TICKS_PER_SECOND, perSecond);
}

/** floor conversion to a count of units at `per_second`; zero rate → 0. */
export function tickstounitsfloor(t: number, perSecond: number): number {
  return ratiofloor(t, perSecond, TICKS_PER_SECOND);
}

/** ticks from a rational container timestamp `pts · num / den` seconds (exact). */
export function ticksfromrational(pts: number, num: number, den: number): number {
  if (den === 0 || !Number.isFinite(pts) || !Number.isFinite(num)) return 0;
  const n = BigInt(Math.trunc(pts)) * BigInt(Math.trunc(num)) * BigInt(TICKS_PER_SECOND);
  return saturate(Number(n / BigInt(Math.trunc(den))));
}

/** inverse of ticksfromrational, rounded to the nearest timebase unit (halves away from zero). */
export function tickstorationalround(t: number, num: number, den: number): number {
  if (den === 0 || num === 0 || !Number.isFinite(t)) return 0;
  const n = BigInt(Math.trunc(t)) * BigInt(Math.trunc(den));
  const d = BigInt(Math.trunc(num)) * BigInt(TICKS_PER_SECOND);
  const neg = n < 0n !== d < 0n;
  const an = n < 0n ? -n : n;
  const ad = d < 0n ? -d : d;
  let q = an / ad;
  if ((an % ad) * 2n >= ad) q += 1n;
  return saturate(neg ? -q : q);
}

/** scales `t` by the rational `num/den`, flooring — the rate-stretch primitive. */
export function scaleticks(t: number, num: number, den: number): number {
  return ratiofloor(t, num, den);
}

/** exact integer arithmetic on ticks, saturating instead of overflowing. */
export function addticks(a: number, b: number): number {
  return saturate(Math.trunc(a) + Math.trunc(b));
}

/** exact integer arithmetic on ticks, saturating instead of overflowing. */
export function subticks(a: number, b: number): number {
  return saturate(Math.trunc(a) - Math.trunc(b));
}

/** clamps into [lo, hi]; crossed bounds answer `lo` (never a panic). */
export function clampticks(t: number, lo: number, hi: number): number {
  return Math.max(Math.trunc(lo), Math.min(Math.trunc(t), Math.trunc(hi)));
}

/** a half-open time range [start, start + duration). */
export type TimeRange = { start: number; duration: number };

/** builds a range, clamping negative durations to zero. */
export function makerange(start: number, duration: number): TimeRange {
  return { start: Math.trunc(start), duration: Math.max(0, Math.trunc(duration)) };
}

/** exclusive end tick of a range. */
export function rangeend(r: TimeRange): number {
  return r.start + r.duration;
}

/** whether the half-open ranges share any tick. */
export function rangeoverlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < rangeend(b) && b.start < rangeend(a);
}

/** the shared half-open range, or null when they do not overlap. */
export function rangeintersect(a: TimeRange, b: TimeRange): TimeRange | null {
  const s = Math.max(a.start, b.start);
  const e = Math.min(rangeend(a), rangeend(b));
  return e > s ? makerange(s, e - s) : null;
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: designmotion.ts — the sol.css motion token mirror.             */
/* (consolidation note: the bezierprogress import this wave carried from   */
/* easecurves dissolved into the seat — the solver is the first section    */
/* above.)                                                                 */
/* ══════════════════════════════════════════════════════════════════════ */

// # designmotion — the ts mirror of the sol.css motion tokens
// the css side owns the truth (sol/sol.css, tokens section); this module is
// its typed echo for the tsx side, so components never re-invent a duration,
// an easing or a spring. one design, two runtimes: the same numbers appear in
// both places, documented against each other. pure constants — no dom, no css
// injection, no side effects. the bezier sampling delegates to easecurves.ts
// (bezierprogress), so the solver stays single-sourced. no token duplication
// of colors/surfaces here: colors live only in css custom properties.

/** micro-interaction duration in ms (css --dur-1): hover, press, color, glyph */
export const DURATION_MICRO = 150;

/** windows/panels duration in ms (css --dur-2): window open, toast, dialog */
export const DURATION_WINDOW = 250;

/** spring-entrance duration in ms (css --dur-3) when not running real physics */
export const DURATION_SPRING = 300;

/** editorial entrance duration in ms (css --dur-enter): hero, page reveal */
export const DURATION_ENTER = 640;

/** the stagger step in ms between entrance siblings (css nth-child delays) */
export const STAGGER = 70;

/** micro easing (css --ease-out): the dominant out curve — never linear */
export const EASE_MICRO: readonly [number, number, number, number] = [0.22, 1, 0.36, 1];

/** windows/panels easing (css --ease-window): the fluent emphatic curve */
export const EASE_WINDOW: readonly [number, number, number, number] = [0.85, 0.14, 0.14, 0.85];

/** exit easing (css --ease-exit): the fluent accelerate-out */
export const EASE_EXIT: readonly [number, number, number, number] = [0.7, 0, 1, 0.5];

/** splash/back-out easing (css --ease-spring): the overshoot entrance */
export const EASE_SPRING: readonly [number, number, number, number] = [0.34, 1.56, 0.64, 1];

/** the intro slide-out curve (winintro data-leaving) */
export const EASE_LEAVE: readonly [number, number, number, number] = [0.76, 0, 0.24, 1];

/** spring physics for the motion library of the tsx wave (css has no spring) */
export const SPRING_STIFFNESS = 300;
export const SPRING_DAMPING = 25;
export const SPRING_MASS = 1;

/** scale floors — entrances never start from 0 */
export const SCALE_FLOOR = 0.96;
export const SCALE_MENU = 0.97;
export const SCALE_TOOLTIP = 0.98;

/** press micro-feedback: the shared :active scale for buttons and keys */
export const PRESS_SCALE = 0.97;

/** the caption-button hover of the window chrome (fluent red), rgb 0-255 */
export const CLOSE_RED: readonly [number, number, number] = [232, 17, 35];

/** the css cubic-bezier() string of a handle tuple, for inline styles */
export function easeCss(ease: readonly number[]): string {
  return `cubic-bezier(${ease.join(", ")})`;
}

/**
 * the progress (0–1) a handle tuple plays at time fraction t — the runtime
 * sampling of the css easings above; delegates to the easecurves solver.
 */
export function evaluateEase(ease: readonly number[], t: number): number {
  if (ease.length !== 4) return t;
  return bezierprogress(ease[0], ease[1], ease[2], ease[3], t);
}

/** the resolved entrance motion of a window/panel: duration + easing pair */
export const WINDOW_MOTION = { duration: DURATION_WINDOW, ease: EASE_WINDOW } as const;

/** the resolved micro motion of a control: duration + easing pair */
export const MICRO_MOTION = { duration: DURATION_MICRO, ease: EASE_MICRO } as const;

/** the resolved spring motion of an entrance: duration + easing pair */
export const SPRING_MOTION = { duration: DURATION_SPRING, ease: EASE_SPRING } as const;
