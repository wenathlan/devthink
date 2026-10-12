// # colorconvert — the color-space conversions of the cadria image/video
// studio, housed at the cadria root beside matiz. It owns the pure math the
// pixel engine calls: sRGB ↔ linear (the IEC 61966-2-1 piecewise curve,
// precomputed as a 256-entry decode table), HSL and HSV round trips, OKLab
// (Björn Ottosson's model, via the four declared 3×3 matrices), YCbCr in the
// BT.601 and BT.709 families with the studio-swing (16–235 / 16–240) the
// video domain expects, the relative luminance of BT.709, and the small hex
// spellings the UI needs. The clean-room pattern is absorbed from lightcraft
// and photocraft (storytold/*craft, color/convert modules — PROJETO-class
// clean-rooms), re-derived natively in pure TypeScript: every matrix is a
// declared constant table, every conversion is a pure function, every result
// is clamped, and invalid input answers a clamped or null value instead of
// throwing. Non-goals: no ICC profiles, no wide-gamut (Display-P3) matrices,
// no float32 GPU packing, no CTL/ACES transforms, no per-channel order
// debates beyond the declared RGB memory order. Exports: 20 functions, 7
// constants, 5 types — the honest count for this theme.

/** one RGB triple in the 0–255 byte domain (memory order r, g, b). */
export type Rgb = [number, number, number];

/** HSL: hue 0–360 (0 on the achromatic axis), saturation/lightness 0–1. */
export type Hsl = { h: number; s: number; l: number };

/** HSV: hue 0–360 (0 on the achromatic axis), saturation/value 0–1. */
export type Hsv = { h: number; s: number; v: number };

/** the Kr/Kb pair a YCbCr family is built from (Kg = 1 − Kr − Kb). */
export type YcbcrCoeffs = { kr: number; kb: number };

/** the sRGB → linear decode of every byte (IEC 61966-2-1 piecewise curve). */
export const SRGB_DECODE: Readonly<Float64Array> = (() => {
  const table = new Float64Array(256);
  for (let i = 0; i < 256; i += 1) table[i] = srgbdecode(i / 255);
  return table;
})();

function srgbdecode(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function srgbencode(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return clamp01(v) * 255;
}

/** clamps a number into 0–1. */
export function clamp01(v: number): number {
  return Number.isFinite(v) ? (v < 0 ? 0 : v > 1 ? 1 : v) : 0;
}

/** clamps into the 0–255 byte domain, half-up rounding. */
export function clampchannel(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(255, Math.max(0, Math.round(v)));
}

/** byte (0–255) → linear (0–1) through the decode table. */
export function srgbtolinear(c: number): number {
  if (!Number.isFinite(c)) return 0;
  const i = clampchannel(c);
  return SRGB_DECODE[i];
}

/** linear (0–1) → byte (0–255) through the encode curve. */
export function lineartosrgb(c: number): number {
  if (!Number.isFinite(c)) return 0;
  return Math.round(srgbencode(clamp01(c)));
}

function huehelpers(r: number, g: number, b: number): { max: number; min: number; d: number; h: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = 60 * (((g - b) / d + 6) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  return { max, min, d, h };
}

function huetriplet(h: number, c: number, x: number, m: number): Rgb {
  const seg = ((h % 360) + 360) % 360;
  const t =
    seg < 60
      ? [c, x, 0]
      : seg < 120
        ? [x, c, 0]
        : seg < 180
          ? [0, c, x]
          : seg < 240
            ? [0, x, c]
            : seg < 300
              ? [x, 0, c]
              : [c, 0, x];
  return [clampchannel((t[0] + m) * 255), clampchannel((t[1] + m) * 255), clampchannel((t[2] + m) * 255)];
}

/** 0–255 sRGB → HSL. */
export function rgbtohsl(r: number, g: number, b: number): Hsl {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const { max, min, d, h } = huehelpers(rn, gn, bn);
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s: clamp01(s), l: clamp01(l) };
}

/** HSL → 0–255 sRGB (hue wraps, out-of-range saturation clamps). */
export function hsltorgb(h: number, s: number, l: number): Rgb {
  const c = (1 - Math.abs(2 * clamp01(l) - 1)) * clamp01(s);
  const x = c * (1 - Math.abs(((((h / 60) % 2) + 2) % 2) - 1));
  const m = clamp01(l) - c / 2;
  return huetriplet(h, c, x, m);
}

/** 0–255 sRGB → HSV. */
export function rgbtohsv(r: number, g: number, b: number): Hsv {
  const { max, d, h } = huehelpers(r / 255, g / 255, b / 255);
  return { h, s: clamp01(max === 0 ? 0 : d / max), v: clamp01(max) };
}

/** HSV → 0–255 sRGB. */
export function hsvtorgb(h: number, s: number, v: number): Rgb {
  const c = clamp01(v) * clamp01(s);
  const x = c * (1 - Math.abs(((((h / 60) % 2) + 2) % 2) - 1));
  return huetriplet(h, c, x, clamp01(v) - c);
}

/** linear sRGB → LMS cone space (OKLab M1, rows r/g/b → l/m/s). */
export const SRGB_TO_LMS: readonly number[] = [
  0.4122214708, 0.5363325363, 0.0514459929, 0.2119034982, 0.6806995451, 0.1073969566, 0.0883024619, 0.2817188376,
  0.6299787005,
];

/** cube-rooted LMS → OKLab (OKLab M2). */
export const LMS_TO_OKLAB: readonly number[] = [
  0.2104542553, 0.793617785, -0.0040720468, 1.9779984951, -2.428592205, 0.4505937099, 0.0259040371, 0.7827717662,
  -0.808675766,
];

/** OKLab → cube-rooted LMS (inverse of M2). */
export const OKLAB_TO_LMS: readonly number[] = [
  1, 0.3963377774, 0.2158037573, 1, -0.1055613458, -0.0638541728, 1, -0.0894841775, -1.291485548,
];

/** cube-rooted LMS → linear sRGB (inverse of M1). */
export const LMS_TO_SRGB: readonly number[] = [
  4.0767416621, -3.3077115913, 0.2309699292, -1.2684380046, 2.6097574011, -0.3413193965, -0.0041960863, -0.7034186147,
  1.707614701,
];

function mul3(m: readonly number[], r: number, g: number, b: number): [number, number, number] {
  return [m[0] * r + m[1] * g + m[2] * b, m[3] * r + m[4] * g + m[5] * b, m[6] * r + m[7] * g + m[8] * b];
}

function cbrt(v: number): number {
  return v < 0 ? -((-v) ** (1 / 3)) : v ** (1 / 3);
}

/** 0–255 sRGB → OKLab (l 0–1, a/b roughly −0.4…0.4). */
export function oklabfromrgb(r: number, g: number, b: number): { l: number; a: number; b: number } {
  const lms = mul3(SRGB_TO_LMS, srgbtolinear(r), srgbtolinear(g), srgbtolinear(b));
  const lab = mul3(LMS_TO_OKLAB, cbrt(lms[0]), cbrt(lms[1]), cbrt(lms[2]));
  return { l: lab[0], a: lab[1], b: lab[2] };
}

/** OKLab → 0–255 sRGB, clamped into the gamut the cube can hold. */
export function rgbfromoklab(l: number, a: number, b: number): Rgb {
  const lms = mul3(OKLAB_TO_LMS, l, a, b);
  const lin = mul3(LMS_TO_SRGB, lms[0] ** 3, lms[1] ** 3, lms[2] ** 3);
  return [
    clampchannel(srgbencode(clamp01(lin[0]))),
    clampchannel(srgbencode(clamp01(lin[1]))),
    clampchannel(srgbencode(clamp01(lin[2]))),
  ];
}

/** BT.601 (SD) Kr/Kb. */
export const YCBCR_601: YcbcrCoeffs = { kr: 0.299, kb: 0.114 };

/** BT.709 (HD) Kr/Kb. */
export const YCBCR_709: YcbcrCoeffs = { kr: 0.2126, kb: 0.0722 };

/** studio-swing YCbCr (Y 16–235, Cb/Cr 16–240) from 0–255 gamma RGB. */
export function ycbcrfromrgb(
  r: number,
  g: number,
  b: number,
  coeffs: YcbcrCoeffs,
): { y: number; cb: number; cr: number } {
  const [rn, gn, bn] = [clamp01(r / 255), clamp01(g / 255), clamp01(b / 255)];
  const kg = 1 - coeffs.kr - coeffs.kb;
  const y01 = coeffs.kr * rn + kg * gn + coeffs.kb * bn;
  const y = 16 + 219 * y01;
  const cb = 128 + 224 * 0.5 * ((bn - y01) / (1 - coeffs.kb));
  const cr = 128 + 224 * 0.5 * ((rn - y01) / (1 - coeffs.kr));
  return {
    y: clampchannel(y),
    cb: clampchannel(Math.min(240, Math.max(16, cb))),
    cr: clampchannel(Math.min(240, Math.max(16, cr))),
  };
}

/** studio-swing YCbCr → 0–255 gamma RGB (clamped, never throws). */
export function rgbfromycbcr(y: number, cb: number, cr: number, coeffs: YcbcrCoeffs): Rgb {
  const kg = 1 - coeffs.kr - coeffs.kb;
  const y01 = (clampchannel(y) - 16) / 219;
  const cb01 = (Math.min(240, Math.max(16, clampchannel(cb))) - 128) / 224;
  const cr01 = (Math.min(240, Math.max(16, clampchannel(cr))) - 128) / 224;
  const b = y01 + 2 * (1 - coeffs.kb) * cb01;
  const r = y01 + 2 * (1 - coeffs.kr) * cr01;
  const g = (y01 - coeffs.kr * r - coeffs.kb * b) / kg;
  return [clampchannel(r * 255), clampchannel(g * 255), clampchannel(b * 255)];
}

/** clamps a triple into the 0–255 byte domain (the shared guard of every decode). */
export function clamprgb(rgb: Rgb): Rgb {
  return [clampchannel(rgb[0]), clampchannel(rgb[1]), clampchannel(rgb[2])];
}

/** OKLab in its cylindrical form: chroma 0–~0.33, hue 0–360. */
export type Oklch = { l: number; c: number; h: number };

/** 0–255 sRGB → OKLCh (the perceptual hue/saturation dial the pickers use). */
export function oklchfromrgb(r: number, g: number, b: number): Oklch {
  const lab = oklabfromrgb(r, g, b);
  const c = Math.hypot(lab.a, lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: lab.l, c, h };
}

/** OKLCh → 0–255 sRGB, clamped into the gamut. */
export function rgbfromoklch(l: number, c: number, h: number): Rgb {
  const rad = (h * Math.PI) / 180;
  return rgbfromoklab(l, Number.isFinite(c) ? c * Math.cos(rad) : 0, Number.isFinite(c) ? c * Math.sin(rad) : 0);
}

/** perceptual mix of two 0–255 triples through OKLab (t 0–1, clamped). */
export function mixrgb(a: Rgb, b: Rgb, t: number): Rgb {
  const k = clamp01(Number.isFinite(t) ? t : 0);
  const la = oklabfromrgb(a[0], a[1], a[2]);
  const lb = oklabfromrgb(b[0], b[1], b[2]);
  return rgbfromoklab(la.l + (lb.l - la.l) * k, la.a + (lb.a - la.a) * k, la.b + (lb.b - la.b) * k);
}

/** BT.601 relative luma of 0–255 gamma RGB (the SD scopes' gray). */
export function relativeluma601(r: number, g: number, b: number): number {
  return clamp01(0.299 * srgbtolinear(r) + 0.587 * srgbtolinear(g) + 0.114 * srgbtolinear(b));
}

/** BT.709 relative luminance of 0–255 gamma RGB (linearized first). */
export function relativeluma709(r: number, g: number, b: number): number {
  const [rn, gn, bn] = [srgbtolinear(r), srgbtolinear(g), srgbtolinear(b)];
  return clamp01(0.2126 * rn + 0.7152 * gn + 0.0722 * bn);
}

/** "#rrggbb" (lowercase) from a 0–255 triple. */
export function hexfromrgb(rgb: Rgb): string {
  const p2 = (v: number) => clampchannel(v).toString(16).padStart(2, "0");
  return `#${p2(rgb[0])}${p2(rgb[1])}${p2(rgb[2])}`;
}

/** "#rgb" or "#rrggbb" (with or without "#") → 0–255 triple, or null when malformed. */
export function rgbfromhex(text: string): Rgb | null {
  const raw = text.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]+$/.test(raw) || (raw.length !== 3 && raw.length !== 6)) return null;
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}
