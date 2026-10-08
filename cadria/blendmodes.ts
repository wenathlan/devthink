// # blendmodes — the layer blend formulas of the cadria image studio, housed
// at the cadria root beside matiz. Every mode answers as a scalar per-channel
// function over pixels in the 0–255 byte domain (the ISO 32000-2 / W3C
// Compositing definitions), with the classic photo-editor variants where the
// editor diverges from the standard (Photoshop's Soft Light; Overlay as
// Hard-Light with the operands swapped). The four non-separable modes (hue,
// saturation, color, luminosity) ride the luminance/saturation decomposition
// of the standard. The clean-room pattern is absorbed from photocraft
// (storytold/photocraft, crates/color/blend.rs — a PROJETO-class clean-room
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
export type Rgb = [number, number, number];

/** one RGB triple normalized to 0–1 (the internal working domain). */
export type Rgb01 = [number, number, number];

function clamp01(v: number): number {
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
  return [clamp01(out[0]), clamp01(out[1]), clamp01(out[2])];
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
  return formula ? clamp01(formula(clamp01(backdrop), clamp01(source))) : clamp01(source);
}

/** the separable blend over 0–255 byte channels; non-separable modes answer the source. */
export function blendchannel(mode: BlendModeName, backdrop: number, source: number): number {
  const b = Number.isFinite(backdrop) ? clamp01(backdrop / 255) : 0;
  const s = Number.isFinite(source) ? clamp01(source / 255) : 0;
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
export function blendrgb(mode: BlendModeName, backdrop: Rgb, source: Rgb): Rgb {
  const to01 = (rgb: Rgb): Rgb01 => [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
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
  const as = clamp01(sourceAlpha);
  const ab = clamp01(backdropAlpha);
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
  backdrop: Rgb,
  source: Rgb,
  alphas?: { backdrop?: number; source?: number },
): Rgb {
  const ab = (alphas?.backdrop ?? 255) / 255;
  const as = (alphas?.source ?? 255) / 255;
  const to01 = (rgb: Rgb): Rgb01 => [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
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
  const opacity = clamp01((opts?.opacity ?? 255) / 255);
  const out = new Uint8ClampedArray(backdrop.data.length);
  for (let at = 0; at < backdrop.data.length; at += 4) {
    const b: Rgb = [backdrop.data[at], backdrop.data[at + 1], backdrop.data[at + 2]];
    const s: Rgb = [source.data[at], source.data[at + 1], source.data[at + 2]];
    const sa = clamp01((source.data[at + 3] * opacity) / 255);
    const ab = clamp01(backdrop.data[at + 3] / 255);
    const pixel = blendpixel(mode, b, s, { backdrop: backdrop.data[at + 3], source: source.data[at + 3] * opacity });
    out[at] = pixel[0];
    out[at + 1] = pixel[1];
    out[at + 2] = pixel[2];
    out[at + 3] = Math.round((sa + (1 - sa) * ab) * 255);
  }
  return { width: backdrop.width, height: backdrop.height, data: out };
}

/** folds a stack of rgba layers over the backdrop (the mini compositor); null on any mismatch. */
export function blendlayerstack(
  mode: BlendModeName,
  backdrop: { width: number; height: number; data: Uint8ClampedArray },
  layers: readonly { width: number; height: number; data: Uint8ClampedArray; opacity?: number }[],
): { width: number; height: number; data: Uint8ClampedArray } | null {
  let acc: { width: number; height: number; data: Uint8ClampedArray } | null = backdrop;
  for (const layer of layers) {
    if (!acc) return null;
    acc = blendimage(mode, acc, layer, { opacity: layer.opacity });
  }
  return acc;
}
