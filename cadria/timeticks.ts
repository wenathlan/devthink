// # timeticks — exact media time for the cadria video studio, housed at the
// cadria root beside versawase. All time is an integer number of ticks at
// TICKS_PER_SECOND = 254 016 000 000/s — a rate that divides evenly into every
// broadcast frame duration (23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60,
// 119.88, 120) and every common audio sample clock (8 k … 192 k), so edits,
// frame math and audio alignment never drift. Timecode (SMPTE drop/non-drop)
// is only a *display* of ticks. Every conversion is total: a zero or negative
// rate answers the default rate instead of dividing by zero, and non-finite
// numbers answer zero instead of throwing. The clean-room pattern is absorbed
// from filmcraft (storytold/filmcraft, crates/time — a PROJETO-class
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
