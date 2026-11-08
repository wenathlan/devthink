/**
 * color — consolidated color and pixel logics of the cadria family.
 * @module color
 * @family wave/logicfold2
 * One keyed file per family: the former variant arms (colorconvert, blendmodes, pixel, masks)
 * retired into this seat with every export preserved under the same name.
 */

// # color.ts — the one keyed file of the color family: the consolidation law
// of the root (one keyed file per family — the pattern versawase.ts itself
// set when it folded its eight arms) merged the four color and pixel seats of
// the image/video studio into this seat — the color-space conversion math
// (the former colorconvert.ts body below), the layer blend formulas
// (blendmodes.ts), the pixel engine (pixel.ts) and the selection masks
// (masks.ts) — every export preserved verbatim, zero logic changes. The
// consolidation notes: the clamp01 helper two of the waves carried verbatim
// (the exported colorconvert seat and the private masks copy, byte-identical
// bodies) rides once in its first section — the colorconvert seat, exported
// exactly as it always was (the masks copy was dropped; the masks section
// reads the one seat); the blendmodes wave carried a DIFFERING private
// clamp01 (no NaN guard) beside the same exported Rgb triple name as
// colorconvert, so per the collision census those two decls keep-first and
// ride the blendmodes group suffix (clamp01Blendmodes, RgbBlendmodes — the
// colorconvert seats keep the bare names, and every importer of Rgb from
// either wave resolves to the identical 0-255 triple shape); no other
// same-name const or decl lived in two sources; the four waves carried zero
// imports, so nothing dissolved and nothing merged — every surface stays
// live in one seat.


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: colorconvert.ts — the color-space math (the first section).    */
/* (consolidation note: clamp01 rides HERE as the one seat of the helper   */
/* the masks section also carried verbatim (byte-identical bodies) —       */
/* exported exactly as this wave always shipped it.)                       */
/* ══════════════════════════════════════════════════════════════════════ */

// # colorconvert — the color-space conversions of the cadria image/video
// studio, housed at the cadria root beside pixel. It owns the pure math the
// pixel engine calls: sRGB ↔ linear (the IEC 61966-2-1 piecewise curve,
// precomputed as a 256-entry decode table), HSL and HSV round trips, OKLab
// (Björn Ottosson's model, via the four declared 3×3 matrices), YCbCr in the
// BT.601 and BT.709 families with the studio-swing (16–235 / 16–240) the
// video domain expects, the relative luminance of BT.709, and the small hex
// spellings the UI needs. The clean-room pattern is absorbed from lightcraft
// and photocraft (storytold/*craft, color/convert modules — project-class
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

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: blendmodes.ts — the layer blend formulas.                      */
/* (consolidation note: the private clamp01 this wave carried (a           */
/* differing body — no NaN guard) and its exported Rgb triple ride the     */
/* blendmodes group suffix (clamp01Blendmodes, RgbBlendmodes) per the      */
/* collision census — the colorconvert section owns the bare names, and    */
/* every importer of Rgb from either wave resolves to the same triple.)    */
/* ══════════════════════════════════════════════════════════════════════ */

// # blendmodes — the layer blend formulas of the cadria image studio, housed
// at the cadria root beside pixel. Every mode answers as a scalar per-channel
// function over pixels in the 0–255 byte domain (the ISO 32000-2 / W3C
// Compositing definitions), with the classic photo-editor variants where the
// editor diverges from the standard (Photoshop's Soft Light; Overlay as
// Hard-Light with the operands swapped). The four non-separable modes (hue,
// saturation, color, luminosity) ride the luminance/saturation decomposition
// of the standard. The clean-room pattern is absorbed from photocraft
// (storytold/photocraft, crates/color/blend.rs — a project-class clean-room
// scalar reference), re-derived natively in pure TypeScript: no PSD keys, no
// serde enums, no dissolve/hardmix noise modes, no float-pipeline coupling.
// Every function is pure, validates by return type (null on shape mismatch)
// and never mutates its input. Non-goals: no GPU kernels to match, no layer
// styles (stroke/shadow), no group pass-through semantics, no color
// management (colorconvert.ts owns spaces). Exports: 14 functions, 3 tables,
// 5 types — the honest count for this theme.

/** the sixteen editor blend modes, in the layer-menu order of the classic editor. */
export type BlendModeName =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "colordodge"
  | "colorburn"
  | "hardlight"
  | "softlight"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";

/** the menu-order table callers iterate for UI lists. */
export const BLEND_MODES: readonly BlendModeName[] = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "colordodge",
  "colorburn",
  "hardlight",
  "softlight",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
];

/** the modes that blend channel-by-channel (everything but the HSL quadruple). */
export type SeparableName = Exclude<BlendModeName, "hue" | "saturation" | "color" | "luminosity">;

/** a per-channel blend `B(backdrop, source)` over normalized channels. */
export type ChannelFormula = (backdrop: number, source: number) => number;

/** the normalized (0–1) scalar reference every channel blend must match. */
export const SEPARABLE_FORMULAS: Record<SeparableName, ChannelFormula> = {
  normal: (_b, s) => s,
  multiply: (b, s) => b * s,
  screen: (b, s) => b + s - b * s,
  overlay: (b, s) => hardlight(s, b),
  darken: (b, s) => Math.min(b, s),
  lighten: (b, s) => Math.max(b, s),
  colordodge: (b, s) => (b <= 0 ? 0 : s >= 1 ? 1 : Math.min(1, b / (1 - s))),
  colorburn: (b, s) => (b >= 1 ? 1 : s <= 0 ? 0 : 1 - Math.min(1, (1 - b) / s)),
  hardlight: (b, s) => hardlight(b, s),
  softlight: (b, s) => softlight(b, s),
  difference: (b, s) => Math.abs(b - s),
  exclusion: (b, s) => b + s - 2 * b * s,
};

/** the classic luminance weights of the compositing standard (not Rec. 709). */
export const LUMA_WEIGHTS: readonly [number, number, number] = [0.3, 0.59, 0.11];

/** one opaque RGB triple in the 0–255 byte domain. */
export type RgbBlendmodes = [number, number, number];

/** one RGB triple normalized to 0–1 (the internal working domain). */
export type Rgb01 = [number, number, number];

function clamp01Blendmodes(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function hardlight(b: number, s: number): number {
  return s <= 0.5 ? 2 * s * b : 1 - 2 * (1 - b) * (1 - s);
}

/** the photo-editor Soft Light (differs from the W3C polynomial above 0.5). */
function softlight(b: number, s: number): number {
  if (s <= 0.5) return b - (1 - 2 * s) * b * (1 - b);
  const d = b <= 0.25 ? ((16 * b - 12) * b + 4) * b : Math.sqrt(b);
  return b + (2 * s - 1) * (d - b);
}

/** whether the mode blends per channel (false for the hue/sat/color/lum quadruple). */
export function isseparable(mode: BlendModeName): boolean {
  return mode !== "hue" && mode !== "saturation" && mode !== "color" && mode !== "luminosity";
}

/** luminance of a normalized triple under LUMA_WEIGHTS. */
export function lumaof(c: Rgb01): number {
  return c[0] * LUMA_WEIGHTS[0] + c[1] * LUMA_WEIGHTS[1] + c[2] * LUMA_WEIGHTS[2];
}

/** saturation of a normalized triple (max − min channel). */
export function satof(c: Rgb01): number {
  return Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]);
}

/** clips the triple back into the RGB gamut around its own luminance. */
export function clipcolor(c: Rgb01): Rgb01 {
  const l = lumaof(c);
  const n = Math.min(c[0], c[1], c[2]);
  const x = Math.max(c[0], c[1], c[2]);
  let out = c;
  if (n < 0) out = out.map((v) => l + (((v - l) * l) / (l - n) || 0)) as Rgb01;
  if (x > 1) out = out.map((v) => l + (((v - l) * (1 - l)) / (x - l) || 0)) as Rgb01;
  return [clamp01Blendmodes(out[0]), clamp01Blendmodes(out[1]), clamp01Blendmodes(out[2])];
}

/** sets the luminance of a triple, preserving hue and saturation. */
export function setluma(c: Rgb01, l: number): Rgb01 {
  const d = l - lumaof(c);
  return clipcolor([c[0] + d, c[1] + d, c[2] + d]);
}

/** sets the saturation of a triple, preserving hue and luminance. */
export function setsaturation(c: Rgb01, s: number): Rgb01 {
  const order = [0, 1, 2].sort((a, b) => c[a] - c[b]);
  const [min, mid, max] = order;
  const out: Rgb01 = [c[0], c[1], c[2]];
  if (c[max] > c[min]) {
    out[mid] = ((c[mid] - c[min]) * s) / (c[max] - c[min]);
    out[max] = s;
  } else {
    out[mid] = 0;
    out[max] = 0;
  }
  out[min] = 0;
  return out;
}

/** the normalized separable blend; non-separable modes answer the source (fallback). */
export function blendchannel01(mode: BlendModeName, backdrop: number, source: number): number {
  const formula = SEPARABLE_FORMULAS[mode as SeparableName];
  return formula ? clamp01Blendmodes(formula(clamp01Blendmodes(backdrop), clamp01Blendmodes(source))) : clamp01Blendmodes(source);
}

/** the separable blend over 0–255 byte channels; non-separable modes answer the source. */
export function blendchannel(mode: BlendModeName, backdrop: number, source: number): number {
  const b = Number.isFinite(backdrop) ? clamp01Blendmodes(backdrop / 255) : 0;
  const s = Number.isFinite(source) ? clamp01Blendmodes(source / 255) : 0;
  return Math.round(blendchannel01(mode, b, s) * 255);
}

/** the full three-channel blend in the normalized domain (the GPU-reference form). */
export function blendrgb01(mode: BlendModeName, backdrop: Rgb01, source: Rgb01): Rgb01 {
  if (isseparable(mode)) {
    return [
      blendchannel01(mode, backdrop[0], source[0]),
      blendchannel01(mode, backdrop[1], source[1]),
      blendchannel01(mode, backdrop[2], source[2]),
    ];
  }
  if (mode === "hue") return setluma(setsaturation(source, satof(backdrop)), lumaof(backdrop));
  if (mode === "saturation") return setluma(setsaturation(backdrop, satof(source)), lumaof(backdrop));
  if (mode === "color") return setluma(source, lumaof(backdrop));
  return setluma(backdrop, lumaof(source));
}

/** the full three-channel blend over 0–255 triples, non-separable modes included. */
export function blendrgb(mode: BlendModeName, backdrop: RgbBlendmodes, source: RgbBlendmodes): RgbBlendmodes {
  const to01 = (rgb: RgbBlendmodes): Rgb01 => [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
  const mixed = blendrgb01(mode, to01(backdrop), to01(source));
  return [Math.round(mixed[0] * 255), Math.round(mixed[1] * 255), Math.round(mixed[2] * 255)];
}

/** the W3C composite step: blended color and coverage from alpha-weighted inputs. */
export function alphacomposite(
  blended: Rgb01,
  source: Rgb01,
  backdrop: Rgb01,
  sourceAlpha: number,
  backdropAlpha: number,
): { color: Rgb01; alpha: number } {
  const as = clamp01Blendmodes(sourceAlpha);
  const ab = clamp01Blendmodes(backdropAlpha);
  const alpha = as + (1 - as) * ab;
  if (alpha <= 0) return { color: [0, 0, 0], alpha: 0 };
  const color = [0, 1, 2].map((i) => {
    const co = as * (1 - ab) * source[i] + as * ab * blended[i] + (1 - as) * ab * backdrop[i];
    return co / alpha;
  }) as Rgb01;
  return { color, alpha };
}

/** blends one pixel with per-layer alpha (0–255, backdrop defaults opaque). */
export function blendpixel(
  mode: BlendModeName,
  backdrop: RgbBlendmodes,
  source: RgbBlendmodes,
  alphas?: { backdrop?: number; source?: number },
): RgbBlendmodes {
  const ab = (alphas?.backdrop ?? 255) / 255;
  const as = (alphas?.source ?? 255) / 255;
  const to01 = (rgb: RgbBlendmodes): Rgb01 => [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
  const blended = to01(blendrgb(mode, backdrop, source));
  const out = alphacomposite(blended, to01(source), to01(backdrop), as, ab);
  return [Math.round(out.color[0] * 255), Math.round(out.color[1] * 255), Math.round(out.color[2] * 255)];
}

/** blends a whole rgba image over another; both must share dimensions; answers a new buffer. */
export function blendimage(
  mode: BlendModeName,
  backdrop: { width: number; height: number; data: Uint8ClampedArray },
  source: { width: number; height: number; data: Uint8ClampedArray },
  opts?: { opacity?: number },
): { width: number; height: number; data: Uint8ClampedArray } | null {
  if (backdrop.width !== source.width || backdrop.height !== source.height) return null;
  const opacity = clamp01Blendmodes((opts?.opacity ?? 255) / 255);
  const out = new Uint8ClampedArray(backdrop.data.length);
  for (let at = 0; at < backdrop.data.length; at += 4) {
    const b: RgbBlendmodes = [backdrop.data[at], backdrop.data[at + 1], backdrop.data[at + 2]];
    const s: RgbBlendmodes = [source.data[at], source.data[at + 1], source.data[at + 2]];
    const sa = clamp01Blendmodes((source.data[at + 3] * opacity) / 255);
    const ab = clamp01Blendmodes(backdrop.data[at + 3] / 255);
    const pixel = blendpixel(mode, b, s, { backdrop: backdrop.data[at + 3], source: source.data[at + 3] * opacity });
    out[at] = pixel[0];
    out[at + 1] = pixel[1];
    out[at + 2] = pixel[2];
    out[at + 3] = Math.round((sa + (1 - sa) * ab) * 255);
  }
  return { width: backdrop.width, height: backdrop.height, data: out };
}

/** folds a stack of rgba layers over the backdrop (the mini compositor); null on any mismatch.
 * Each layer may override the stack-wide mode with its own `mode` — the per-layer
 * choice is what the timeline and the studio panels ride when one layer carries
 * its own blend identity. */
export function blendlayerstack(
  mode: BlendModeName,
  backdrop: { width: number; height: number; data: Uint8ClampedArray },
  layers: readonly { width: number; height: number; data: Uint8ClampedArray; opacity?: number; mode?: BlendModeName }[],
): { width: number; height: number; data: Uint8ClampedArray } | null {
  let acc: { width: number; height: number; data: Uint8ClampedArray } | null = backdrop;
  for (const layer of layers) {
    if (!acc) return null;
    acc = blendimage(layer.mode ?? mode, acc, layer, { opacity: layer.opacity });
  }
  return acc;
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: pixel.ts — the pixel engine.                                   */
/* (consolidation note: zero imports rode this wave — the body lands       */
/* verbatim.)                                                              */
/* ══════════════════════════════════════════════════════════════════════ */

// # pixel — the pixel engine of the cadria image studio, housed at the cadria
// root beside versawase. Pure TypeScript over the ImageData shape ({width,
// height, data: Uint8ClampedArray}): brightness, contrast and saturation
// adjustments, the grayscale and sepia tints, the 3x3 convolution, the box
// blur and the bilinear resize. Every stage answers a NEW buffer — the input
// is never mutated — and every stage validates honestly through PixelError.
// The engine never leaves cadria: the DevThink native image studio pulls it
// by the catalog row (engine "pixel", owner "cadria") over HTTPS and never
// bundles it, the same way the video studio rides versawase. In the browser
// a canvas ImageData rides in directly; in the tests the synthetic buffers
// ride in. Zero dependencies, no canvas, no worker.

export class PixelError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "PixelError";
  }
}

/** one raster image: the dimensions and the rgba byte buffer the canvas
 * calls ImageData. The length must answer for width × height × 4. */
export type PixelImage = { width: number; height: number; data: Uint8ClampedArray };

/** the three channel adjustments: brightness multiplies, contrast swings
 * around the 128 midpoint and saturation interpolates toward the luma. */
export type PixelAdjustments = { brightness?: number; contrast?: number; saturation?: number };

/** the color tints: grayscale rides the rec 709 luma, sepia the classic
 * warm matrix. "none" keeps the adjusted colors. */
export type PixelTint = "none" | "grayscale" | "sepia";

/** one 3x3 convolution kernel, row by row, the center at index 4. */
export type PixelKernel = [number, number, number, number, number, number, number, number, number];

/** the composed pipeline options: every stage is optional and the stages run
 * in the documented order — adjust, tint, convolve, blur, resize. */
export type PixelOptions = {
  adjustments?: PixelAdjustments;
  tint?: PixelTint;
  kernel?: PixelKernel;
  blurRadius?: number;
  resize?: { width: number; height: number };
};

/** the kernel presets: identity answers the input, sharpen recovers edges
 * and outline answers the inverse of the blur. */
export const pixelkernels: Record<"identity" | "sharpen" | "outline", PixelKernel> = {
  identity: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
  outline: [0, 1, 0, 1, -4, 1, 0, 1, 0],
};

/** Validates one image honestly: finite positive dimensions and a buffer
 * that answers for width × height × 4 bytes. */
function guardimage(image: PixelImage): void {
  if (!Number.isInteger(image.width) || image.width <= 0)
    throw new PixelError(`pixel: width must be a positive integer, got ${image.width}`);
  if (!Number.isInteger(image.height) || image.height <= 0)
    throw new PixelError(`pixel: height must be a positive integer, got ${image.height}`);
  if (!(image.data instanceof Uint8ClampedArray)) throw new PixelError("pixel: data must be a Uint8ClampedArray");
  if (image.data.length !== image.width * image.height * 4)
    throw new PixelError(
      `pixel: data carries ${image.data.length} bytes but ${image.width}×${image.height} needs ${image.width * image.height * 4}`,
    );
}

/** the rec 709 luma of one rgba pixel. */
function luma(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Builds a copy of the buffer so no stage ever mutates the input. */
function copybuffer(image: PixelImage): Uint8ClampedArray {
  return new Uint8ClampedArray(image.data);
}

/** Applies the three channel adjustments: brightness multiplies the value,
 * contrast swings it around the 128 midpoint and saturation interpolates it
 * toward the luma of the adjusted pixel. One (default 1) answers unchanged. */
export function adjustimage(image: PixelImage, adjustments: PixelAdjustments = {}): PixelImage {
  guardimage(image);
  const brightness = adjustments.brightness ?? 1;
  const contrast = adjustments.contrast ?? 1;
  const saturation = adjustments.saturation ?? 1;
  for (const amount of [brightness, contrast, saturation]) {
    if (!Number.isFinite(amount) || amount < 0)
      throw new PixelError(`pixel: adjustments must be finite numbers >= 0, got ${amount}`);
  }
  const data = copybuffer(image);
  for (let at = 0; at < data.length; at += 4) {
    let r = data[at] * brightness;
    let g = data[at + 1] * brightness;
    let b = data[at + 2] * brightness;
    r = (r - 128) * contrast + 128;
    g = (g - 128) * contrast + 128;
    b = (b - 128) * contrast + 128;
    const gray = luma(r, g, b);
    data[at] = gray + (r - gray) * saturation;
    data[at + 1] = gray + (g - gray) * saturation;
    data[at + 2] = gray + (b - gray) * saturation;
  }
  return { width: image.width, height: image.height, data };
}

/** Tints the image: grayscale answers the rec 709 luma on every channel and
 * sepia answers the classic warm matrix. The alpha rides untouched. */
export function tintimage(image: PixelImage, tint: PixelTint): PixelImage {
  guardimage(image);
  if (tint === "none") return { width: image.width, height: image.height, data: copybuffer(image) };
  if (tint !== "grayscale" && tint !== "sepia") throw new PixelError(`pixel: unknown tint "${tint}"`);
  const data = copybuffer(image);
  for (let at = 0; at < data.length; at += 4) {
    const r = data[at];
    const g = data[at + 1];
    const b = data[at + 2];
    if (tint === "grayscale") {
      const gray = luma(r, g, b);
      data[at] = gray;
      data[at + 1] = gray;
      data[at + 2] = gray;
    } else {
      data[at] = 0.393 * r + 0.769 * g + 0.189 * b;
      data[at + 1] = 0.349 * r + 0.686 * g + 0.168 * b;
      data[at + 2] = 0.272 * r + 0.534 * g + 0.131 * b;
    }
  }
  return { width: image.width, height: image.height, data };
}

/** Convolves the image with one 3x3 kernel: every channel samples the clamped
 * neighborhood (edges replicate), the kernel multiplies row by row and the
 * alpha rides untouched. The identity kernel answers the input colors. */
export function convolveimage(image: PixelImage, kernel: PixelKernel): PixelImage {
  guardimage(image);
  if (kernel.length !== 9 || kernel.some((weight) => !Number.isFinite(weight)))
    throw new PixelError("pixel: a kernel carries exactly nine finite weights");
  const { width, height } = image;
  const source = image.data;
  const data = new Uint8ClampedArray(source.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      data[at + 3] = source[at + 3];
      for (let channel = 0; channel < 3; channel += 1) {
        let sum = 0;
        for (let ky = 0; ky < 3; ky += 1) {
          const ny = Math.min(height - 1, Math.max(0, y + ky - 1));
          for (let kx = 0; kx < 3; kx += 1) {
            const nx = Math.min(width - 1, Math.max(0, x + kx - 1));
            sum += kernel[ky * 3 + kx] * source[(ny * width + nx) * 4 + channel];
          }
        }
        data[at + channel] = sum;
      }
    }
  }
  return { width, height, data };
}

/** Box-blurs the image with one separable horizontal pass and one vertical
 * pass over a (2·radius+1) window with clamped edges: the rgb channels ride
 * the box average and the alpha rides untouched. Radius 0 answers a copy. */
export function boxblurimage(image: PixelImage, radius: number): PixelImage {
  guardimage(image);
  if (!Number.isInteger(radius) || radius < 0)
    throw new PixelError(`pixel: blurRadius must be an integer >= 0, got ${radius}`);
  if (radius === 0) return { width: image.width, height: image.height, data: copybuffer(image) };
  const { width, height } = image;
  const span = radius * 2 + 1;
  const horizontal = new Uint8ClampedArray(image.data.length);
  const data = new Uint8ClampedArray(image.data.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      horizontal[at + 3] = image.data[at + 3];
      for (let channel = 0; channel < 3; channel += 1) {
        let sum = 0;
        for (let k = -radius; k <= radius; k += 1) {
          const nx = Math.min(width - 1, Math.max(0, x + k));
          sum += image.data[(y * width + nx) * 4 + channel];
        }
        horizontal[at + channel] = sum / span;
      }
    }
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      data[at + 3] = horizontal[at + 3];
      for (let channel = 0; channel < 3; channel += 1) {
        let sum = 0;
        for (let k = -radius; k <= radius; k += 1) {
          const ny = Math.min(height - 1, Math.max(0, y + k));
          sum += horizontal[(ny * width + x) * 4 + channel];
        }
        data[at + channel] = sum / span;
      }
    }
  }
  return { width, height, data };
}

/** Resizes the image with bilinear sampling over pixel centers: every dest
 * pixel maps back to the source, the four neighbors blend by weight and the
 * edges clamp, so nothing reads outside the buffer. */
export function resizeimage(image: PixelImage, target: { width: number; height: number }): PixelImage {
  guardimage(image);
  if (!Number.isInteger(target.width) || target.width <= 0)
    throw new PixelError(`pixel: resize width must be a positive integer, got ${target.width}`);
  if (!Number.isInteger(target.height) || target.height <= 0)
    throw new PixelError(`pixel: resize height must be a positive integer, got ${target.height}`);
  const { width: sw, height: sh } = image;
  const { width: dw, height: dh } = target;
  const data = new Uint8ClampedArray(dw * dh * 4);
  for (let y = 0; y < dh; y += 1) {
    const sy = ((y + 0.5) * sh) / dh - 0.5;
    const y0 = Math.floor(sy);
    const wy = sy - y0;
    const ya = Math.min(sh - 1, Math.max(0, y0));
    const yb = Math.min(sh - 1, Math.max(0, y0 + 1));
    for (let x = 0; x < dw; x += 1) {
      const sx = ((x + 0.5) * sw) / dw - 0.5;
      const x0 = Math.floor(sx);
      const wx = sx - x0;
      const xa = Math.min(sw - 1, Math.max(0, x0));
      const xb = Math.min(sw - 1, Math.max(0, x0 + 1));
      const at = (y * dw + x) * 4;
      for (let channel = 0; channel < 4; channel += 1) {
        const top = image.data[(ya * sw + xa) * 4 + channel] * (1 - wx) + image.data[(ya * sw + xb) * 4 + channel] * wx;
        const bottom =
          image.data[(yb * sw + xa) * 4 + channel] * (1 - wx) + image.data[(yb * sw + xb) * 4 + channel] * wx;
        data[at + channel] = top * (1 - wy) + bottom * wy;
      }
    }
  }
  return { width: dw, height: dh, data };
}

/** Runs the whole pixel pipeline in the documented order: the channel
 * adjustments first, the tint second, the 3x3 convolution third, the box
 * blur fourth and the bilinear resize last. With no options the pipeline
 * answers a copy. DevThink never calls this directly — the studio page
 * queues the work over the gateway and the cadria engine answers there. */
export function runpixel(image: PixelImage, options: PixelOptions = {}): PixelImage {
  guardimage(image);
  let current: PixelImage = { width: image.width, height: image.height, data: copybuffer(image) };
  if (options.adjustments) current = adjustimage(current, options.adjustments);
  if (options.tint) current = tintimage(current, options.tint);
  if (options.kernel) current = convolveimage(current, options.kernel);
  if (options.blurRadius !== undefined) current = boxblurimage(current, options.blurRadius);
  if (options.resize) current = resizeimage(current, options.resize);
  return current;
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: masks.ts — the selection masks.                                */
/* (consolidation note: the private clamp01 copy this wave carried         */
/* verbatim was dropped; the section reads the one seat in the             */
/* colorconvert section.)                                                  */
/* ══════════════════════════════════════════════════════════════════════ */

// # masks — the selection masks of the cadria image/video studio, housed at
// the cadria root beside pixel. A mask is a plane of opacities (0–1 floats)
// or a boolean grid; components combine with the local-adjustment algebra of
// the reference raw editor: Add (max), Subtract (a · (1 − c)) and Intersect
// (a · c). On top of the combination sit the operations the studio needs:
// inversion, amount scaling, feathering (a deterministic separable box blur,
// repeated passes approximating the soft edge), thresholding in both
// directions, bounds, cropping and the two base shape generators (rectangle,
// ellipse) plus the linear gradient. The clean-room pattern is absorbed from
// lightcraft (storytold/lightcraft, crates/pipeline/masks.rs — a
// project-class clean-room of local adjustments), re-derived natively in pure
// TypeScript over flat typed arrays shaped like the pixel engine: no guided
// edge refine, no image-content awareness, no brush strokes, no GPU. Every
// function is pure, validates by return type (null on mismatch) and never
// mutates its input. Non-goals: no color adjustment application (pixel owns
// pixels), no vector paths, no magic-wand/wandselect, no storage. Exports:
// 18 functions, 4 types — the honest count for this theme.

/** a plane of opacities, 0 (outside) … 1 (fully selected), row-major. */
export type OpacityGrid = { width: number; height: number; data: Float32Array };

/** a hard-edged selection, 0 or 1 per cell, row-major. */
export type BooleanGrid = { width: number; height: number; data: Uint8Array };

/** the component algebra: Add takes the max, Subtract erases, Intersect multiplies. */
export type MaskOp = "add" | "subtract" | "intersect";

/** the inclusive cell rectangle where a mask is non-empty. */
export type MaskBounds = { minX: number; minY: number; maxX: number; maxY: number };

/** one layer of a mask stack: a plane plus the operation that folds it in. */
export type MaskLayer = { grid: OpacityGrid; op: MaskOp };

function dims(a: { width: number; height: number }, b: { width: number; height: number }): boolean {
  return a.width === b.width && a.height === b.height && a.width > 0 && a.height > 0;
}

/** an empty (or filled) opacity plane. */
export function makeopacity(width: number, height: number, fill = 0): OpacityGrid {
  const w = Math.max(0, Math.trunc(width));
  const h = Math.max(0, Math.trunc(height));
  const data = new Float32Array(w * h).fill(clamp01(fill));
  return { width: w, height: h, data };
}

/** an empty (or filled) boolean grid. */
export function makeboolean(width: number, height: number, fill = 0): BooleanGrid {
  const w = Math.max(0, Math.trunc(width));
  const h = Math.max(0, Math.trunc(height));
  const data = new Uint8Array(w * h).fill(fill ? 1 : 0);
  return { width: w, height: h, data };
}

/** combines two planes; dimensions must match; answers a new plane. */
export function combinemasks(a: OpacityGrid, b: OpacityGrid, op: MaskOp): OpacityGrid | null {
  if (!dims(a, b)) return null;
  const out = new Float32Array(a.data.length);
  for (let i = 0; i < out.length; i += 1) {
    const av = clamp01(a.data[i]);
    const bv = clamp01(b.data[i]);
    out[i] = op === "add" ? Math.max(av, bv) : op === "subtract" ? av * (1 - bv) : av * bv;
  }
  return { width: a.width, height: a.height, data: out };
}

/** inverts a plane (1 − v). */
export function invertmask(grid: OpacityGrid): OpacityGrid {
  const out = new Float32Array(grid.data.length);
  for (let i = 0; i < out.length; i += 1) out[i] = 1 - clamp01(grid.data[i]);
  return { width: grid.width, height: grid.height, data: out };
}

/** scales a plane by the adjustment amount, clamped to 0–1. */
export function scalemask(grid: OpacityGrid, amount: number): OpacityGrid {
  const k = Number.isFinite(amount) ? amount : 1;
  const out = new Float32Array(grid.data.length);
  for (let i = 0; i < out.length; i += 1) out[i] = clamp01(clamp01(grid.data[i]) * k);
  return { width: grid.width, height: grid.height, data: out };
}

/** one separable box-blur pass with clamped edges (deterministic). */
function boxpass(data: Float32Array, w: number, h: number, r: number, vertical: boolean): Float32Array {
  const out = new Float32Array(data.length);
  const span = 2 * r + 1;
  const outer = vertical ? w : h;
  const inner = vertical ? h : w;
  for (let o = 0; o < outer; o += 1) {
    let sum = 0;
    for (let k = -r; k <= r; k += 1) {
      const at = Math.min(inner - 1, Math.max(0, k));
      sum += data[vertical ? at * w + o : o * w + at];
    }
    for (let i = 0; i < inner; i += 1) {
      out[vertical ? i * w + o : o * w + i] = sum / span;
      const addAt = Math.min(inner - 1, i + r + 1);
      const subAt = Math.max(0, i - r);
      sum += data[vertical ? addAt * w + o : o * w + addAt] - data[vertical ? subAt * w + o : o * w + subAt];
    }
  }
  return out;
}

/** feathers a plane: a radius-r box blur repeated `passes` times (radius 0 copies). */
export function feathermask(grid: OpacityGrid, radius: number, passes = 2): OpacityGrid {
  const r = Math.max(0, Math.floor(radius));
  const count = Math.max(1, Math.trunc(passes));
  let data: Float32Array = Float32Array.from(grid.data, clamp01);
  if (r > 0 && grid.width > 0 && grid.height > 0) {
    for (let p = 0; p < count; p += 1) {
      data = boxpass(data, grid.width, grid.height, r, false);
      data = boxpass(data, grid.width, grid.height, r, true);
    }
  }
  return { width: grid.width, height: grid.height, data };
}

/** hard threshold into a boolean grid (v ≥ t). */
export function thresholdmask(grid: OpacityGrid, t = 0.5): BooleanGrid {
  const data = new Uint8Array(grid.data.length);
  for (let i = 0; i < data.length; i += 1) data[i] = grid.data[i] >= t ? 1 : 0;
  return { width: grid.width, height: grid.height, data };
}

/** boolean grid → opacity plane (0/1). */
export function booleantoalpha(mask: BooleanGrid): OpacityGrid {
  const data = new Float32Array(mask.data.length);
  for (let i = 0; i < data.length; i += 1) data[i] = mask.data[i] ? 1 : 0;
  return { width: mask.width, height: mask.height, data };
}

/** opacity plane → boolean grid (v ≥ t). */
export function alphatoboolean(grid: OpacityGrid, t = 0.5): BooleanGrid {
  return thresholdmask(grid, t);
}

/** the inclusive bounds of cells above `t`, or null when nothing is selected. */
export function maskbounds(grid: OpacityGrid, t = 0): MaskBounds | null {
  let minX = -1;
  let minY = -1;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      if (grid.data[y * grid.width + x] > t) {
        if (minX < 0 || x < minX) minX = x;
        if (minY < 0) minY = y;
        if (x > maxX) maxX = x;
        maxY = y;
      }
    }
  }
  return minX < 0 ? null : { minX, minY, maxX, maxY };
}

/** crops a plane to bounds (clamped into the plane); a degenerate crop answers null. */
export function cropmask(grid: OpacityGrid, bounds: MaskBounds): OpacityGrid | null {
  const minX = Math.max(0, Math.trunc(bounds.minX));
  const minY = Math.max(0, Math.trunc(bounds.minY));
  const maxX = Math.min(grid.width - 1, Math.trunc(bounds.maxX));
  const maxY = Math.min(grid.height - 1, Math.trunc(bounds.maxY));
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  if (w <= 0 || h <= 0 || grid.width <= 0 || grid.height <= 0) return null;
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) out[y * w + x] = grid.data[(y + minY) * grid.width + (x + minX)];
  }
  return { width: w, height: h, data: out };
}

/** a filled rectangle (clamped into the plane), full opacity. */
export function rectmask(width: number, height: number, x: number, y: number, w: number, h: number): OpacityGrid {
  const grid = makeopacity(width, height, 0);
  const x0 = Math.max(0, Math.trunc(x));
  const y0 = Math.max(0, Math.trunc(y));
  const x1 = Math.min(grid.width, Math.trunc(x) + Math.max(0, Math.trunc(w)));
  const y1 = Math.min(grid.height, Math.trunc(y) + Math.max(0, Math.trunc(h)));
  for (let yy = y0; yy < y1; yy += 1) {
    for (let xx = x0; xx < x1; xx += 1) grid.data[yy * grid.width + xx] = 1;
  }
  return grid;
}

/** an ellipse centered at (cx, cy) with radii (rx, ry); inside is full opacity. */
export function ellipsemask(
  width: number,
  height: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): OpacityGrid {
  const grid = makeopacity(width, height, 0);
  if (!(rx > 0 && ry > 0)) return grid;
  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) grid.data[y * grid.width + x] = 1;
    }
  }
  return grid;
}

/** a linear ramp 0 → 1 toward the given side ("right" ramps left-edge 0 to right-edge 1). */
export function gradientmask(width: number, height: number, direction: "up" | "down" | "left" | "right"): OpacityGrid {
  const grid = makeopacity(width, height, 0);
  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      let v: number;
      if (direction === "right") v = grid.width <= 1 ? 1 : x / (grid.width - 1);
      else if (direction === "left") v = grid.width <= 1 ? 1 : (grid.width - 1 - x) / (grid.width - 1);
      else if (direction === "down") v = grid.height <= 1 ? 1 : y / (grid.height - 1);
      else v = grid.height <= 1 ? 1 : (grid.height - 1 - y) / (grid.height - 1);
      grid.data[y * grid.width + x] = clamp01(v);
    }
  }
  return grid;
}

/** one pass of a box rank filter (max dilates, min erodes), clamped edges, deterministic. */
function rankpass(
  data: Float32Array,
  w: number,
  h: number,
  r: number,
  vertical: boolean,
  rank: "max" | "min",
): Float32Array {
  const out = new Float32Array(data.length);
  const outer = vertical ? w : h;
  const inner = vertical ? h : w;
  for (let o = 0; o < outer; o += 1) {
    for (let i = 0; i < inner; i += 1) {
      let best = data[vertical ? i * w + o : o * w + i];
      for (let k = -r; k <= r; k += 1) {
        const at = Math.min(inner - 1, Math.max(0, i + k));
        const v = data[vertical ? at * w + o : o * w + at];
        best = rank === "max" ? Math.max(best, v) : Math.min(best, v);
      }
      out[vertical ? i * w + o : o * w + i] = best;
    }
  }
  return out;
}

function rankfilter(grid: OpacityGrid, radius: number, rank: "max" | "min"): OpacityGrid {
  const r = Math.max(0, Math.floor(radius));
  let data: Float32Array = Float32Array.from(grid.data, clamp01);
  if (r > 0 && grid.width > 0 && grid.height > 0) {
    data = rankpass(data, grid.width, grid.height, r, false, rank);
    data = rankpass(data, grid.width, grid.height, r, true, rank);
  }
  return { width: grid.width, height: grid.height, data };
}

/** grows (dilates) the selection by a radius-r box — closes pinholes before feathering. */
export function growmask(grid: OpacityGrid, radius: number): OpacityGrid {
  return rankfilter(grid, radius, "max");
}

/** shrinks (erodes) the selection by a radius-r box — eats halos after feathering. */
export function shrinkmask(grid: OpacityGrid, radius: number): OpacityGrid {
  return rankfilter(grid, radius, "min");
}

/** mean opacity of a plane (how much of the frame the mask owns). */
export function maskcoverage(grid: OpacityGrid): number {
  if (grid.data.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < grid.data.length; i += 1) sum += clamp01(grid.data[i]);
  return sum / grid.data.length;
}

/** folds a layer stack over a base (default empty); any dimension mismatch answers null. */
export function maskstack(layers: readonly MaskLayer[], base?: OpacityGrid): OpacityGrid | null {
  const first = layers[0];
  if (!first && !base) return null;
  const shape: { width: number; height: number; data?: Float32Array } = base ?? {
    width: first.grid.width,
    height: first.grid.height,
  };
  let acc: OpacityGrid = {
    width: shape.width,
    height: shape.height,
    data: Float32Array.from(shape.data ?? new Float32Array(shape.width * shape.height)),
  };
  for (const layer of layers) {
    const next = combinemasks(acc, layer.grid, layer.op);
    if (!next) return null;
    acc = next;
  }
  return acc;
}
