// # synth — the synthesis wave of the cadria audio→image studio, consolidated
// at the cadria root as ONE keyword file of the versawase engine (the wave-4
// root-logic consolidation law: one correlated domain per root file). The
// former satellite modules folded here verbatim, in pipeline order:
//   Section 1: synthtexture.ts  — the surface texture layer (grain, stroke, glaze).
//   Section 2: synthpalette.ts  — the OKLCH palette layer with the AA ink guard.
//   Section 3: synthmotion.ts   — the motion choreography layer (keyframes, easing).
//   Section 4: synthcomposition.ts — the layout grammar layer (grid, blocks, scatter).
// Every export of every source file is preserved here; the intra-domain
// imports dissolved into the single module scope; the shared fnv-1a constants
// (byte-identical in the sources) declare once. The section-private helpers
// that collided across sources (clamp01, dim) carry their section names. The
// cross-domain seams stay imports: colorconvert (colorimetry) and easecurves
// (bezier math) keep their own root files, and the audio contract rides the
// published debonair specifiers the family resolves for the embedder.

import {
  type AudioDescriptor,
  clamp01,
  DESCRIPTOR_DIMS,
  DIM_ORDER,
  NARRATIVE_CONTOUR,
  type NarrativeShape,
} from "@wenathlan/debonair/audio";
import { hexfromrgb, oklchfromrgb, relativeluma709, rgbfromhex, rgbfromoklch } from "./color.ts";
import { bezierprogress } from "./motion.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: synthtexture.ts — the texture layer of the cadria audio→image wave (module */
/* b3): it folds the fused AudioDescriptor's timbre block into the surface */
/* parameters a renderer paints with — grain, stroke and glaze. */
/* ════════════════════════════════════════════════════════════════════ */

/** one surface texture the renderer paints with — px where noted, else 0-1. */
export interface TextureSpec {
  /** speckle coverage of the surface (0-1) */
  grainDensity: number;
  /** speckle radius in px (1-8) */
  grainSize: number;
  /** speckle alpha (0-1) — coupled: never above grainDensity + 0.2 */
  grainOpacity: number;
  /** edge blur of strokes (0-1) — warm mixes paint soft */
  strokeSoftness: number;
  /** stroke thickness in px (0.5-24) */
  strokeWeight: number;
  /** positional scatter of strokes (0-1) */
  strokeJitter: number;
  /** translucent wash layers stacked (1-6, whole) */
  glazeLayers: number;
  /** per-layer wash alpha (0-1) */
  glazeOpacity: number;
  /** highlight weight (0-1) */
  specular: number;
  /** surface agitation (0-1) */
  turbulence: number;
}

/** documented clamp bounds per field — the renderer may trust these edges. */
export const TEXTURE_RANGES: Readonly<Record<keyof TextureSpec, { min: number; max: number }>> = {
  grainDensity: { min: 0, max: 1 },
  grainSize: { min: 1, max: 8 },
  grainOpacity: { min: 0, max: 1 },
  strokeSoftness: { min: 0, max: 1 },
  strokeWeight: { min: 0.5, max: 24 },
  strokeJitter: { min: 0, max: 1 },
  glazeLayers: { min: 1, max: 6 },
  glazeOpacity: { min: 0, max: 1 },
  specular: { min: 0, max: 1 },
  turbulence: { min: 0, max: 1 },
};

/** documented coupling headroom: grainOpacity never exceeds grainDensity + this. */
export const GRAIN_COUPLING = 0.2;

/** how much say the descriptor keeps over a preset's non-frozen fields (0-1). */
export const TEXTURE_PRESET_BLEND = 0.5;

/** upper bound on one scatter field — guards runaway requests. */
export const JITTER_FIELD_CAP = 65536;

/** the three named feels: pure tones, mid neutral, noise walls. */
export type TexturePresetName = "glass" | "canvas" | "static";

/** one named preset: its base spec plus the fields it freezes against deltas. */
export interface TexturePreset {
  /** preset key */
  name: TexturePresetName;
  /** frozen base surface */
  spec: TextureSpec;
  /** fields the blend never moves — the preset's identity */
  frozen: readonly (keyof TextureSpec)[];
  /** one-line documented intent */
  note: string;
}

/** fresh preset table on every call (callers may mutate their copy freely). */
export function texturePresets(): Readonly<Record<TexturePresetName, TexturePreset>> {
  const table: Record<TexturePresetName, TexturePreset> = {
    glass: {
      name: "glass",
      spec: {
        grainDensity: 0.04,
        grainSize: 1,
        grainOpacity: 0.12,
        strokeSoftness: 0.2,
        strokeWeight: 2,
        strokeJitter: 0.05,
        glazeLayers: 1,
        glazeOpacity: 0.25,
        specular: 0.55,
        turbulence: 0.05,
      },
      frozen: ["grainSize", "glazeLayers", "specular"],
      note: "pure tones: one still sheet, fine grain, steady sheen",
    },
    canvas: {
      name: "canvas",
      spec: {
        grainDensity: 0.4,
        grainSize: 3.5,
        grainOpacity: 0.42,
        strokeSoftness: 0.5,
        strokeWeight: 8,
        strokeJitter: 0.35,
        glazeLayers: 3,
        glazeOpacity: 0.5,
        specular: 0.3,
        turbulence: 0.4,
      },
      frozen: ["glazeLayers"],
      note: "the neutral mid: balanced weave the descriptor bends freely",
    },
    static: {
      name: "static",
      spec: {
        grainDensity: 0.95,
        grainSize: 7,
        grainOpacity: 0.85,
        strokeSoftness: 0.15,
        strokeWeight: 18,
        strokeJitter: 0.9,
        glazeLayers: 6,
        glazeOpacity: 0.8,
        specular: 0.12,
        turbulence: 0.9,
      },
      frozen: ["grainDensity", "grainSize", "turbulence"],
      note: "noise walls: dense coarse grain stays dense whatever plays",
    },
  };
  return Object.freeze(table);
}

/** fnv-1a 32-bit constants, the same lanes the audio seed folds. */
const FNV_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/** one fnv-1a byte fold over a 32-bit lane. */
function fold(lane: number, byte: number): number {
  return Math.imul((lane ^ (byte & 0xff)) >>> 0, FNV_PRIME) >>> 0;
}

/**
 * deterministic scatter field for stroke positions: folds the seed string
 * (fnv-1a, both bytes of every char) and then the entry index, so entry i
 * depends only on the seed and i — field(n) is always a prefix of field(m)
 * for m > n. Values land in [-1, 1); counts floor, and non-finite, negative
 * or over-cap counts clamp (cap → JITTER_FIELD_CAP entries).
 */
export function jitterField(seed: string, count: number): number[] {
  const asked = typeof count === "number" && Number.isFinite(count) ? Math.floor(count) : 0;
  const n = Math.max(0, Math.min(JITTER_FIELD_CAP, asked));
  let lane = FNV_BASIS;
  const text = typeof seed === "string" ? seed : "";
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    lane = fold(fold(lane, code & 0xff), (code >>> 8) & 0xff);
  }
  const out: number[] = [];
  for (let i = 0; i < n; i += 1) {
    lane = fold(fold(fold(fold(lane, i & 0xff), (i >>> 8) & 0xff), (i >>> 16) & 0xff), (i >>> 24) & 0xff);
    out.push(lane / 0x80000000 - 1);
  }
  return out;
}

/** the consumed dims by contract position (the DIM_ORDER of audio.ts). */
const FLATNESS_DIM = 3;
const FLUX_DIM = 4;
const NOISE_DIM = 16;
const WARMTH_DIM = 17;
const BRIGHT_DIM = 18;
const ZCR_DIM = 20;
const CONTRAST_DIM = 21;

/** consumed dims in read order: spectral pair first, then the timbre block. */
const READ_DIMS = [FLATNESS_DIM, FLUX_DIM, NOISE_DIM, WARMTH_DIM, BRIGHT_DIM, ZCR_DIM, CONTRAST_DIM];

/**
 * defensive read of the consumed dims: null when the descriptor is not an
 * object, the vector is missing or too short, or ANY consumed dim is
 * non-finite — one bad dim distrusts the whole descriptor (the documented
 * fallback rule). Finite dims re-clamp into 0-1.
 */
function readDims(descriptor: AudioDescriptor): number[] | null {
  const box = descriptor !== null && typeof descriptor === "object" ? (descriptor as { vector?: unknown }) : null;
  if (!box || !Array.isArray(box.vector) || box.vector.length <= CONTRAST_DIM) return null;
  const dims: number[] = [];
  for (const i of READ_DIMS) {
    const v = box.vector[i];
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
    dims.push(v < 0 ? 0 : v > 1 ? 1 : v);
  }
  return dims;
}

/**
 * clamps every field into TEXTURE_RANGES (damaged fields fall to the range
 * floor), rounds glazeLayers whole, and pulls grainOpacity under
 * grainDensity + GRAIN_COUPLING — the documented coupling, enforced here so
 * every sanitized spec satisfies it.
 */
export function sanitizeTexture(spec: TextureSpec): TextureSpec {
  const box = (spec !== null && typeof spec === "object" ? spec : {}) as Partial<TextureSpec>;
  const pick = (key: keyof TextureSpec): number => {
    const range = TEXTURE_RANGES[key];
    const v = box[key];
    return typeof v === "number" && Number.isFinite(v) ? Math.min(range.max, Math.max(range.min, v)) : range.min;
  };
  const out = {
    grainDensity: pick("grainDensity"),
    grainSize: pick("grainSize"),
    grainOpacity: pick("grainOpacity"),
    strokeSoftness: pick("strokeSoftness"),
    strokeWeight: pick("strokeWeight"),
    strokeJitter: pick("strokeJitter"),
    glazeLayers: pick("glazeLayers"),
    glazeOpacity: pick("glazeOpacity"),
    specular: pick("specular"),
    turbulence: pick("turbulence"),
  };
  out.glazeLayers = Math.round(out.glazeLayers);
  out.grainOpacity = Math.min(out.grainOpacity, out.grainDensity + GRAIN_COUPLING);
  return out;
}

/**
 * the documented timbre → texture table, one monotonic ramp per field (see
 * the module header for the dim ↔ field map). A damaged descriptor answers
 * the neutral canvas preset.
 */
export function synthTexture(descriptor: AudioDescriptor): TextureSpec {
  const dims = readDims(descriptor);
  if (dims === null) return sanitizeTexture({ ...texturePresets().canvas.spec });
  const [flatness, flux, noisiness, warmth, brightness, zcr, contrast] = dims;
  const grainDensity = 0.05 + 0.9 * noisiness;
  return sanitizeTexture({
    grainDensity,
    grainSize: 1 + 7 * noisiness * (1 - 0.5 * zcr), // zcr refines the grain
    grainOpacity: 0.1 + 0.8 * grainDensity, // inside the documented coupling
    strokeSoftness: 0.15 + 0.8 * warmth,
    strokeWeight: 0.5 + 23.5 * (0.12 + 0.5 * warmth + 0.38 * contrast),
    strokeJitter: 0.05 + 0.9 * flux,
    glazeLayers: Math.round(1 + 5 * flatness),
    glazeOpacity: 0.2 + 0.6 * brightness,
    specular: 0.05 + 0.9 * brightness,
    turbulence: 0.05 + 0.8 * contrast + 0.15 * noisiness,
  });
}

/**
 * mean absolute field distance between two specs, each field normalized by
 * its documented range (px and layer counts share the 0-1 footing), so
 * presets can be ranked against a synthesized surface. Damaged fields read
 * as their range floor; the answer is finite in [0, 1].
 */
export function textureDistance(a: TextureSpec, b: TextureSpec): number {
  const keys = Object.keys(TEXTURE_RANGES) as (keyof TextureSpec)[];
  let sum = 0;
  for (const key of keys) {
    const { min, max } = TEXTURE_RANGES[key];
    const av = typeof a[key] === "number" && Number.isFinite(a[key]) ? a[key] : min;
    const bv = typeof b[key] === "number" && Number.isFinite(b[key]) ? b[key] : min;
    sum += Math.abs(av - bv) / (max - min);
  }
  return sum / keys.length;
}

/**
 * blends a preset base with the descriptor's synthTexture deltas: frozen
 * fields (the preset's identity) pass through untouched, every other field
 * moves TEXTURE_PRESET_BLEND of the way toward the synthesized spec, then
 * the whole answer sanitizes. Unknown names fall back to the canvas base.
 */
export function synthTextureFromPreset(name: TexturePresetName, descriptor: AudioDescriptor): TextureSpec {
  const presets = texturePresets();
  const preset = Object.hasOwn(presets, name) ? presets[name] : presets.canvas;
  const base = preset.spec;
  const dynamic = synthTexture(descriptor);
  const mix = (key: keyof TextureSpec): number =>
    preset.frozen.includes(key) ? base[key] : base[key] + TEXTURE_PRESET_BLEND * (dynamic[key] - base[key]);
  return sanitizeTexture({
    grainDensity: mix("grainDensity"),
    grainSize: mix("grainSize"),
    grainOpacity: mix("grainOpacity"),
    strokeSoftness: mix("strokeSoftness"),
    strokeWeight: mix("strokeWeight"),
    strokeJitter: mix("strokeJitter"),
    glazeLayers: mix("glazeLayers"),
    glazeOpacity: mix("glazeOpacity"),
    specular: mix("specular"),
    turbulence: mix("turbulence"),
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: synthpalette.ts — the palette layer of the cadria image-mapping wave, */
/* housed at the cadria root beside colorconvert. */
/* ════════════════════════════════════════════════════════════════════ */

/** one OKLCH color: l 0–1, c 0–0.33, h degrees wrapped into [0, 360). */
export type OklchTriple = { l: number; c: number; h: number };

/** the palette the imagery waves paint with: hex spellings plus the declared OKLCH triples. */
export type Palette = {
  anchor: string; // hero color hex
  support: string[]; // two quiet field rungs hugging the anchor
  ink: string; // text color, AA-guarded against surface
  surface: string; // background hex (the guard may darken it one rescue rung)
  accents: string[]; // 2–4 pops, count tracks descriptor energy
  oklch: { anchor: OklchTriple; accents: OklchTriple[] }; // declared triples (hex = gamut-clamped rendering)
};

/** wcag AA floor for body text (4.5:1) — the ink guard refuses anything under it. */
export const AA_MIN_CONTRAST = 4.5;

/**
 * per-pitch-class hue corrections over the tonic/11·360 wheel (c first,
 * degrees). The raw wheel spreads the classes ~32.7° apart but lands b on
 * 360° ≡ c's hue; the alternating ±n° nudges give every class a documented
 * hue — c 6°, c# 26.7°, …, b 348° — with pairwise separation ≥ 18°, so no two
 * keys (c and c#, c and b included) can ever share an anchor hue.
 */
export const TONIC_HUE_OFFSET: readonly number[] = [6, -6, 5, -5, 4, -4, 3, -3, 2, -2, 1, -12];

/** accent hue fan over the anchor hue: a split-complementary pair first, then
 *  the warm cross and the triad rung that the higher energy counts add. */
export const ACCENT_HUE_FAN: readonly number[] = [150, 215, 75, 285];

/** accent lightness offsets off the anchor rung, paired with ACCENT_HUE_FAN. */
const ACCENT_LADDER: readonly number[] = [0.18, -0.12, 0.28, -0.22];

/** clamps lightness into 0–1; non-finite answers 0 — total, never NaN. */
function clampLight(l: number): number {
  return Number.isFinite(l) ? Math.min(1, Math.max(0, l)) : 0;
}

/** clamps chroma into 0–0.33 (the sRGB-reachable OKLCH ceiling). */
function clampChroma(c: number): number {
  return Number.isFinite(c) ? Math.min(0.33, Math.max(0, c)) : 0;
}

/** wraps any hue into [0, 360); NaN/±∞ answer 0. */
export function wrapHue(h: number): number {
  if (!Number.isFinite(h)) return 0;
  return ((h % 360) + 360) % 360;
}

/** shortest angular distance between two hues, 0–180 (wrap-safe). */
export function hueDistance(a: number, b: number): number {
  const d = Math.abs(wrapHue(a) - wrapHue(b));
  return Math.min(d, 360 - d);
}

/**
 * OKLCH → "#rrggbb": oklch → oklab (a = c·cos h, b = c·sin h) → linear sRGB
 * through colorconvert's declared matrices → gamma curve → byte clamp.
 * Runaway or non-finite inputs clamp into a legal hex, never NaN.
 */
export function oklchToSrgbHex(l: number, c: number, h: number): string {
  return hexfromrgb(rgbfromoklch(clampLight(l), clampChroma(c), wrapHue(h)));
}

/** "#rrggbb" → OKLCH — the oklchToSrgbHex inverse within one byte of rounding;
 *  malformed hex answers null (colorconvert's null contract). */
export function srgbHexToOklch(hex: string): OklchTriple | null {
  const rgb = rgbfromhex(hex);
  return rgb ? oklchfromrgb(rgb[0], rgb[1], rgb[2]) : null;
}

/** anchor hue of a pitch class (0 = c … 11 = b): tonic/11·360 plus the
 *  TONIC_HUE_OFFSET correction, wrapped; damaged tonic answers c (0 → 6°). */
export function tonicHue(tonic: number): number {
  const t = Number.isFinite(tonic) ? Math.min(11, Math.max(0, Math.round(tonic))) : 0;
  return wrapHue((t / 11) * 360 + TONIC_HUE_OFFSET[t]);
}

/** wcag relative luminance of a hex color (BT.709 weights over linearized
 *  sRGB); malformed hex answers 0. */
export function relativeLuminance(hex: string): number {
  const rgb = rgbfromhex(hex);
  return rgb ? relativeluma709(rgb[0], rgb[1], rgb[2]) : 0;
}

/** wcag contrast ratio between two hex colors (1 … 21); malformed answers 1. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// descriptor dim positions — literals per the fixed contract at the top of the audio keyword file (DIM_ORDER); position is the contract.
const DIM = {
  brightness: 6,
  tonic: 12,
  keyStrength: 13,
  noisiness: 16,
  timbreBrightness: 18,
  punch: 22,
  energyDrive: 29,
  moodShadow: 31,
};

/**
 * total descriptor read: the vector must hold DESCRIPTOR_DIMS finite dims; every value clamps into 0–1. Any
 * damage answers null (the caller renders the fallback rung).
 */
function descriptorDims(d: AudioDescriptor): number[] | null {
  const vector = d !== null && typeof d === "object" ? (d as AudioDescriptor).vector : null;
  if (!Array.isArray(vector) || vector.length < DESCRIPTOR_DIMS) return null;
  const dims: number[] = [];
  for (let i = 0; i < DESCRIPTOR_DIMS; i += 1) {
    const v = vector[i];
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
    dims.push(Math.min(1, Math.max(0, v)));
  }
  return dims;
}

/**
 * inkFor — the AA guard. Text ink must reach AA_MIN_CONTRAST against the
 * surface; the documented rung ladder answers the first passing rung:
 * (1) the tinted pole on the surface's own side (near-white ink over dark
 * surfaces, near-black over light ones, both on the anchor hue), (2) the pure pole of that side, (3) the opposite
 * pure pole, (4) surface rescue — the surface itself walks 0.06 lightness darker per step (up to four steps; the
 * only case where the guard rewrites the surface) and the ladder re-runs. The final backstop pins a deep surface
 * under pure white ink (provably ≥ AA for any hue). Deterministic — no randomness anywhere.
 */
function inkFor(surface: OklchTriple, anchorHue: number): { ink: OklchTriple; surface: OklchTriple } {
  let surf: OklchTriple = { ...surface };
  for (let rescue = 0; rescue < 5; rescue += 1) {
    const darkSurface = surf.l < 0.5;
    const rungs: OklchTriple[] = [
      { l: darkSurface ? 0.97 : 0.08, c: 0.012, h: anchorHue }, // tinted pole
      { l: darkSurface ? 1 : 0, c: 0, h: anchorHue }, // pure pole, same side
      { l: darkSurface ? 0 : 1, c: 0, h: anchorHue }, // opposite pole
    ];
    for (const rung of rungs) {
      const pair = contrastRatio(oklchToSrgbHex(rung.l, rung.c, rung.h), oklchToSrgbHex(surf.l, surf.c, surf.h));
      if (pair >= AA_MIN_CONTRAST) return { ink: rung, surface: surf };
    }
    surf = { l: clampLight(surf.l - 0.06), c: surf.c, h: surf.h };
  }
  return { ink: { l: 1, c: 0, h: anchorHue }, surface: { l: 0.13, c: surf.c, h: surf.h } };
}

/** palette assembly — the single place hexes and the oklch echo are written. */
function assemble(
  anchor: OklchTriple,
  support: OklchTriple[],
  accents: OklchTriple[],
  ink: OklchTriple,
  surface: OklchTriple,
): Palette {
  const hex = (t: OklchTriple) => oklchToSrgbHex(t.l, t.c, t.h);
  return {
    anchor: hex(anchor),
    support: support.map(hex),
    ink: hex(ink),
    surface: hex(surface),
    accents: accents.map(hex),
    oklch: { anchor: { ...anchor }, accents: accents.map((t) => ({ ...t })) },
  };
}

/**
 * FALLBACK_PALETTE — the neutral gray-green rung any damaged descriptor answers (missing/short vector, one
 * non-finite dim): sage hue 145, chroma ≤ 0.05 everywhere, two accents, ink pre-guarded to AA against its paper
 * surface. Exported so the imagery waves can detect the fallback and warn.
 */
export const FALLBACK_PALETTE: Palette = assemble(
  { l: 0.55, c: 0.035, h: 145 },
  [
    { l: 0.68, c: 0.015, h: 117 },
    { l: 0.42, c: 0.015, h: 173 },
  ],
  [
    { l: 0.66, c: 0.05, h: 295 },
    { l: 0.38, c: 0.05, h: 260 },
  ],
  { l: 0.12, c: 0.01, h: 145 },
  { l: 0.95, c: 0.008, h: 145 },
);

/**
 * synthPalette — the descriptor → palette fold. Every dial is documented in
 * the mapping contract at the top of this file; the ink/surface pair is the
 * last step so the guard sees the final surface. Pure, total, deterministic.
 */
export function synthPalette(descriptor: AudioDescriptor): Palette {
  const dims = descriptorDims(descriptor);
  if (!dims) return FALLBACK_PALETTE;
  const hue = tonicHue(Math.round(dims[DIM.tonic] * 11));
  const keyStrength = dims[DIM.keyStrength];
  const mood = dims[DIM.moodShadow];
  const brightness = (dims[DIM.brightness] + dims[DIM.timbreBrightness]) / 2;
  const noisiness = dims[DIM.noisiness];
  const energy = (dims[DIM.punch] + dims[DIM.energyDrive]) / 2;
  // lightness ladder (d6 + d18) with the minor depth pull (d31)
  const anchorL = clampLight(0.42 + 0.3 * brightness - 0.06 * mood);
  const anchorC = clampChroma(0.12 * (1 - 0.4 * mood));
  const anchor: OklchTriple = { l: anchorL, c: anchorC, h: hue };
  // surface rides the same ladder out to the poles; tint fades with noise
  const surface: OklchTriple = {
    l: clampLight(0.16 + 0.8 * brightness),
    c: clampChroma(0.025 * (1 - 0.5 * noisiness)),
    h: hue,
  };
  // support field: two quiet rungs ±28° off the anchor, desaturated by noise
  const supportC = clampChroma(0.05 * (1 - 0.8 * noisiness));
  const support: OklchTriple[] = [
    { l: clampLight(anchorL + 0.16), c: supportC, h: wrapHue(hue + 28) },
    { l: clampLight(anchorL - 0.16), c: supportC, h: wrapHue(hue - 28) },
  ];
  // accents: count from energy (d22 + d29), chroma from key strength (d13)
  const count = 2 + Math.min(2, Math.floor(energy * 3));
  const accentC = clampChroma(0.1 + 0.1 * keyStrength);
  const accents: OklchTriple[] = [];
  for (let k = 0; k < count; k += 1) {
    accents.push({
      l: clampLight(anchorL + ACCENT_LADDER[k]),
      c: accentC,
      h: wrapHue(hue + ACCENT_HUE_FAN[k]),
    });
  }
  const guarded = inkFor(surface, hue);
  return assemble(anchor, support, accents, guarded.ink, guarded.surface);
}

/**
 * paletteVariants — light/dark/duotone derivations of one palette, in that
 * order, `count` of them (default 3, truncated into 0–3, non-finite → 3).
 * Every variant keeps the anchor hue exactly (the oklch echo carries it) and
 * re-runs the AA ink ladder against its own surface:
 *   light — gallery wall: surface pinned to l 0.97 on the anchor hue, anchor
 *           raised to ≥ 0.72 with chroma × 0.85, accents/support lifted
 *           (+0.15 / +0.12 lightness, chroma × 0.85 / × 0.7);
 *   dark — screening room: surface pinned to l 0.14, anchor dropped 0.12
 *           (floor 0.3) with chroma kept, accents/support dropped (−0.15 /
 *           −0.10 lightness, support chroma × 0.6);
 *   duotone — the palette collapses to the anchor hue and its complement
 *           (+180°): accents alternate complement/anchor hues at 0.8× chroma,
 *           support runs on the anchor hue at 0.4× chroma, and the surface
 *           keeps its original pole side (0.96 light / 0.13 dark).
 * A damaged palette argument falls back to the fallback rung's pieces.
 */
export function paletteVariants(palette: Palette, count = 3): Palette[] {
  const n = Number.isFinite(count) ? Math.min(3, Math.max(0, Math.trunc(count))) : 3;
  const source = palette !== null && typeof palette === "object" ? palette : FALLBACK_PALETTE;
  const a = source.oklch?.anchor ?? FALLBACK_PALETTE.oklch.anchor;
  const hue = wrapHue(a.h);
  const accentSource: OklchTriple[] = source.oklch?.accents?.length
    ? source.oklch.accents
    : FALLBACK_PALETTE.oklch.accents;
  const supportSource: OklchTriple[] = (source.support ?? []).map(
    (t) => srgbHexToOklch(t) ?? { l: 0.5, c: 0.02, h: hue },
  );
  const surfaceSource = srgbHexToOklch(source.surface) ?? { l: 0.95, c: 0.008, h: hue };
  const variants: Palette[] = [];
  if (n >= 1) {
    // light — gallery wall
    const surface: OklchTriple = { l: 0.97, c: 0.008, h: hue };
    const anchor: OklchTriple = { l: clampLight(Math.max(a.l, 0.72)), c: clampChroma(a.c * 0.85), h: hue };
    const accents = accentSource.map((t) => ({
      l: clampLight(t.l + 0.15),
      c: clampChroma(t.c * 0.85),
      h: wrapHue(t.h),
    }));
    const support = supportSource.map((t) => ({
      l: clampLight(t.l + 0.12),
      c: clampChroma(t.c * 0.7),
      h: wrapHue(t.h),
    }));
    variants.push(assemble(anchor, support, accents, inkFor(surface, hue).ink, surface));
  }
  if (n >= 2) {
    // dark — screening room
    const surface: OklchTriple = { l: 0.14, c: 0.012, h: hue };
    const anchor: OklchTriple = { l: clampLight(Math.max(0.3, a.l - 0.12)), c: clampChroma(a.c), h: hue };
    const accents = accentSource.map((t) => ({
      l: clampLight(Math.max(0.25, t.l - 0.15)),
      c: clampChroma(t.c),
      h: wrapHue(t.h),
    }));
    const support = supportSource.map((t) => ({
      l: clampLight(Math.max(0.18, t.l - 0.1)),
      c: clampChroma(t.c * 0.6),
      h: wrapHue(t.h),
    }));
    variants.push(assemble(anchor, support, accents, inkFor(surface, hue).ink, surface));
  }
  if (n >= 3) {
    // duotone — anchor hue + its complement only
    const complement = wrapHue(hue + 180);
    const surface: OklchTriple = { l: surfaceSource.l >= 0.5 ? 0.96 : 0.13, c: 0.02, h: hue };
    const anchor: OklchTriple = { l: clampLight(a.l), c: clampChroma(a.c), h: hue };
    const accents = accentSource.map((t, k) => ({
      l: clampLight(t.l),
      c: clampChroma(t.c * 0.8),
      h: k % 2 === 0 ? complement : hue,
    }));
    const support = supportSource.map((t) => ({ l: clampLight(t.l), c: clampChroma(t.c * 0.4), h: hue }));
    variants.push(assemble(anchor, support, accents, inkFor(surface, hue).ink, surface));
  }
  return variants;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: synthmotion.ts — the motion layer of the cadria audio→image wave: it folds */
/* the fused audio descriptor into a deterministic MotionSpec. */
/* ════════════════════════════════════════════════════════════════════ */

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

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: synthcomposition.ts — the composition layer of the cadria audio→image studio */
/* (wave 2, module b2): the layout grammar over a normalized 0-1 canvas. */
/* ════════════════════════════════════════════════════════════════════ */

/** one rectangle on the normalized canvas: x/y top-left corner, w/h extents, all 0-1. */
export type Rect = { x: number; y: number; w: number; h: number };
/** the four layout roles: the hero mass, its cadre ring, field fill, edge border. */
export type BlockRole = "hero" | "cadre" | "field" | "edge";
/** one placed block: where it lives, the visual weight it carries (0-1) and its role. */
export type Block = { rect: Rect; weight: number; role: BlockRole };
/** the tile grammar: whole-canvas column/row counts plus gutter and margin, all normalized 0-1. */
export type CompositionGrid = { columns: number; rows: number; gutter: number; margin: number };
/** the balance audit: weighted canvas center plus per-x-bin density shares summing to 1. */
export type BalanceReport = { centerX: number; centerY: number; densityHistogram: number[] };

/** grid bounds: columns/rows always land inside this documented 3-12 range. */
export const GRID_MIN = 3;
export const GRID_MAX = 12;
/** density histogram resolution of compositionBalance (bins across the x axis). */
export const HISTOGRAM_BINS = 8;

// grammar dials (deterministic, documented): gutter/margin tighten as repetition
// rises; at REPETITION_SQUARE the grid locks square (a regular lattice); the
// jitter budget is a share of the gutter; swing leans that jitter late.
const GUTTER_MAX = 0.04;
const GUTTER_MIN = 0.008;
const MARGIN_MAX = 0.06;
const MARGIN_MIN = 0.024;
const REPETITION_SQUARE = 0.75;
const JITTER_GUTTER_SHARE = 0.5;
const SWING_LEAN = 0.5;
/** visual weight base per role (× boost × area, then normalized to sum 1 across blocks). */
const ROLE_BASE: Record<BlockRole, number> = { hero: 1, cadre: 0.5, field: 0.25, edge: 0.125 };
/** weight boost for the wave contour's mirrored second peak (stays below the hero). */
const WAVE_MIRROR_BOOST = 1.6;

/** the composition section's clamp01 (the motion section rides the audiofeatures import). */
function clamp01Composition(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** integer clamp with rounding; non-finite answers the floor. */
function clampInt(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  return Math.min(hi, Math.max(lo, Math.round(v)));
}

function clampNum(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  return Math.min(hi, Math.max(lo, v));
}

/** total dim read: vector slot i clamped 0-1; everything damaged answers 0. */
function dimComposition(d: AudioDescriptor, i: number): number {
  const v = Array.isArray(d?.vector) ? d.vector[i] : undefined;
  return typeof v === "number" && Number.isFinite(v) ? clamp01Composition(v) : 0;
}

/** reverse-maps the contour weight to its narrative shape (nearest match, flat fallback). */
function contourShape(c: number): NarrativeShape {
  if (!Number.isFinite(c)) return "flat";
  let best: NarrativeShape = "flat";
  let bestD = Infinity;
  for (const shape of Object.keys(NARRATIVE_CONTOUR) as NarrativeShape[]) {
    const d = Math.abs(NARRATIVE_CONTOUR[shape] - c);
    if (d < bestD) {
      bestD = d;
      best = shape;
    }
  }
  return best;
}

/** one fnv-1a pass over a string, byte-folded (the constants the audio keyword file hashes with). */
function fnv1a(text: string): number {
  let lane = FNV_BASIS;
  for (let i = 0; i < text.length; i += 1)
    lane = Math.imul((lane ^ (text.charCodeAt(i) & 0xff)) >>> 0, FNV_PRIME) >>> 0;
  return lane;
}

/** folds the block index into the seed lane — fnv-1a of the seed string, per block index. */
function foldIndex(lane: number, index: number): number {
  let out = lane >>> 0;
  for (let shift = 0; shift < 32; shift += 8)
    out = Math.imul((out ^ ((index >>> shift) & 0xff)) >>> 0, FNV_PRIME) >>> 0;
  return out;
}

/** clamps a rect into the canvas: corners ≥ 0, extents finite and trimmed so x+w ≤ 1.
 * (named fitrect — the bare `fit` collides with the linter's focused-test heuristic.) */
function fitrect(r: Rect): Rect {
  const x = clamp01Composition(r.x);
  const y = clamp01Composition(r.y);
  const w = Number.isFinite(r.w) ? Math.max(0, Math.min(r.w, 1 - x)) : 0;
  const h = Number.isFinite(r.h) ? Math.max(0, Math.min(r.h, 1 - y)) : 0;
  return { x, y, w, h };
}

/** guard for caller-supplied grammars: integer counts in [1,16], gutter/margin sane. */
function sanitize(g?: CompositionGrid): CompositionGrid {
  return {
    columns: clampInt(g?.columns ?? NaN, 1, 16),
    rows: clampInt(g?.rows ?? NaN, 1, 16),
    gutter: clampNum(g?.gutter ?? NaN, 0, 0.1),
    margin: clampNum(g?.margin ?? NaN, 0, 0.25),
  };
}

/**
 * compositionGrid — the tile grammar: columns climb with section density
 * (dim 27) across the documented 3-12 range; rows follow a density+repetition
 * blend but lock square at REPETITION_SQUARE (repetitive audio tiles a
 * regular lattice); gutter and margin tighten from GUTTER_MAX/MARGIN_MAX down
 * to GUTTER_MIN/MARGIN_MIN as repetition (dim 25) rises. Damaged dims answer
 * the quiet loose 3x3 grid.
 */
export function compositionGrid(descriptor: AudioDescriptor): CompositionGrid {
  const density = dimComposition(descriptor, 27);
  const repetition = dimComposition(descriptor, 25);
  const columns = clampInt(GRID_MIN + (GRID_MAX - GRID_MIN) * density, GRID_MIN, GRID_MAX);
  const rows =
    repetition >= REPETITION_SQUARE
      ? columns
      : clampInt(GRID_MIN + (GRID_MAX - GRID_MIN) * (0.5 * density + 0.5 * repetition), GRID_MIN, GRID_MAX);
  const gutter = GUTTER_MIN + (GUTTER_MAX - GUTTER_MIN) * (1 - repetition);
  const margin = MARGIN_MIN + (MARGIN_MAX - MARGIN_MIN) * (1 - repetition);
  return { columns, rows, gutter, margin };
}

/**
 * compositionBlocks — casts the layout roles over the grid: exactly one hero
 * (its cells merged, bleeding one gutter outward so it always reads as the
 * largest mass, span grown by peak mass dim 24), at most 8 cadre blocks
 * ringing it clockwise (the wave contour spends the first on a mirrored
 * second peak), then the remaining cells row-major as edge blocks (border
 * cells, grown over the margin to the canvas border) and field blocks
 * (interior fill). The contour dim 26 anchors the hero rows — rise high,
 * fall low, arch/flat centered, wave in the upper band — while the hero
 * column stays centered for balance. Weights are ROLE_BASE × boost × area,
 * normalized to sum 1. Blocks come back hero-first, then cadre, then the
 * row-major fill; same descriptor, same blocks, always.
 */
export function compositionBlocks(descriptor: AudioDescriptor, grid?: CompositionGrid): Block[] {
  const g = sanitize(grid ?? compositionGrid(descriptor));
  const { columns, rows, gutter, margin } = g;
  const peak = dimComposition(descriptor, 24);
  const shape = contourShape(dimComposition(descriptor, 26));
  const cw = Math.max(0.001, (1 - 2 * margin - (columns - 1) * gutter) / columns);
  const ch = Math.max(0.001, (1 - 2 * margin - (rows - 1) * gutter) / rows);
  const key = (col: number, row: number): string => `${col},${row}`;
  const cell = (col: number, row: number): Rect => ({
    x: margin + col * (cw + gutter),
    y: margin + row * (ch + gutter),
    w: cw,
    h: ch,
  });
  // hero span in cells per axis: grows with peak mass, keeping one ring of cells free
  const maxSpanX = Math.max(1, Math.min(Math.floor(columns / 2), columns - 2));
  const maxSpanY = Math.max(1, Math.min(Math.floor(rows / 2), rows - 2));
  const spanX = maxSpanX < 2 ? 1 : clampInt(2 + peak * (maxSpanX - 2), 2, maxSpanX);
  const spanY = maxSpanY < 2 ? 1 : clampInt(2 + peak * (maxSpanY - 2), 2, maxSpanY);
  // vertical grammar: the contour anchors the hero rows, horizontal stays centered for balance
  const roomY = Math.max(0, rows - spanY - 1);
  const roomX = Math.max(0, columns - spanX - 1);
  const loY = Math.min(1, roomY);
  const anchorRow =
    shape === "rise"
      ? clampInt(rows * 0.18, loY, roomY)
      : shape === "fall"
        ? clampInt(rows - spanY - rows * 0.18, loY, roomY)
        : shape === "wave"
          ? clampInt((rows - 2 * spanY) * 0.3, loY, roomY)
          : clampInt((rows - spanY) / 2, loY, roomY);
  const anchorCol = clampInt((columns - spanX) / 2, Math.min(1, roomX), roomX);
  const claimed = new Set<string>();
  for (let dy = 0; dy < spanY; dy += 1)
    for (let dx = 0; dx < spanX; dx += 1) claimed.add(key(anchorCol + dx, anchorRow + dy));
  const parts: Array<{ rect: Rect; role: BlockRole; boost: number }> = [];
  // the hero: merged cells bleeding one gutter outward — strictly larger than any single cell
  parts.push({
    rect: fitrect({
      x: margin + anchorCol * (cw + gutter) - gutter,
      y: margin + anchorRow * (ch + gutter) - gutter,
      w: spanX * cw + (spanX + 1) * gutter,
      h: spanY * ch + (spanY + 1) * gutter,
    }),
    role: "hero",
    boost: 1,
  });
  const cadres: Array<[number, number]> = [];
  if (shape === "wave") {
    // the second peak: the hero's span mirrored through the canvas center (skipped on collision)
    const mCol = columns - anchorCol - spanX;
    const mRow = rows - anchorRow - spanY;
    let free = mCol >= 0 && mRow >= 0;
    for (let dy = 0; free && dy < spanY; dy += 1)
      for (let dx = 0; free && dx < spanX; dx += 1) free = !claimed.has(key(mCol + dx, mRow + dy));
    if (free) {
      for (let dy = 0; dy < spanY; dy += 1)
        for (let dx = 0; dx < spanX; dx += 1) claimed.add(key(mCol + dx, mRow + dy));
      parts.push({
        rect: fitrect({
          x: margin + mCol * (cw + gutter),
          y: margin + mRow * (ch + gutter),
          w: spanX * cw + (spanX - 1) * gutter,
          h: spanY * ch + (spanY - 1) * gutter,
        }),
        role: "cadre",
        boost: WAVE_MIRROR_BOOST,
      });
      cadres.push([mCol, mRow]);
    }
  }
  // the ring: clockwise from the hero's top-left corner, budget 8 including the wave mirror
  const ring: Array<[number, number]> = [];
  for (let dx = -1; dx <= spanX; dx += 1) ring.push([anchorCol + dx, anchorRow - 1]);
  for (let dy = 0; dy <= spanY; dy += 1) ring.push([anchorCol + spanX, anchorRow + dy]);
  for (let dx = spanX - 1; dx >= -1; dx -= 1) ring.push([anchorCol + dx, anchorRow + spanY]);
  for (let dy = spanY - 1; dy >= 0; dy -= 1) ring.push([anchorCol - 1, anchorRow + dy]);
  for (const [col, row] of ring) {
    if (cadres.length >= 8 || col < 0 || row < 0 || col >= columns || row >= rows || claimed.has(key(col, row)))
      continue;
    cadres.push([col, row]);
    claimed.add(key(col, row));
    parts.push({ rect: fitrect(cell(col, row)), role: "cadre", boost: 1 });
  }
  // the fill: border cells grow over the margin and answer "edge", interior cells answer "field"
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      if (claimed.has(key(col, row))) continue;
      const border = row === 0 || row === rows - 1 || col === 0 || col === columns - 1;
      if (!border) {
        parts.push({ rect: fitrect(cell(col, row)), role: "field", boost: 1 });
        continue;
      }
      const er = cell(col, row);
      if (col === 0) {
        er.w += er.x;
        er.x = 0;
      }
      if (col === columns - 1) er.w = 1 - er.x;
      if (row === 0) {
        er.h += er.y;
        er.y = 0;
      }
      if (row === rows - 1) er.h = 1 - er.y;
      parts.push({ rect: fitrect(er), role: "edge", boost: 1 });
    }
  }
  const raw = parts.map((p) => ROLE_BASE[p.role] * p.boost * p.rect.w * p.rect.h);
  const total = raw.reduce((sum, v) => sum + v, 0);
  return parts.map((p, i) => ({ rect: p.rect, weight: raw[i] / total, role: p.role }));
}

/**
 * rhythmScatter — the rhythmic placement pass: jitters every block inside
 * its gutter ring with a deterministic fnv-1a offset (the descriptor seed
 * string hashed to one lane, the block index folded in per block, split into
 * an x and a y half). Onset density (dim 9) scales the budget up to
 * JITTER_GUTTER_SHARE of the derived grid's gutter, so a scattered block can
 * close its gutter but never cross into a neighbor — the overlap tolerance
 * IS the gutter (assumes the default compositionBlocks(descriptor) pairing).
 * Swing (dim 11) leans the jitter in +x — the late-beat push — before the
 * per-axis clamp. Roles and weights pass through untouched.
 */
export function rhythmScatter(descriptor: AudioDescriptor, blocks: readonly Block[]): Block[] {
  const grid = compositionGrid(descriptor);
  const amp = JITTER_GUTTER_SHARE * grid.gutter * dimComposition(descriptor, 9);
  const swing = dimComposition(descriptor, 11);
  const seedLane = fnv1a(typeof descriptor?.seed === "string" ? descriptor.seed : "");
  return (Array.isArray(blocks) ? blocks : []).map((b, i) => {
    const lane = foldIndex(seedLane, i);
    const jx = ((lane & 0xffff) - 32767.5) / 32767.5;
    const jy = (((lane >>> 16) & 0xffff) - 32767.5) / 32767.5;
    const ox = Math.min(amp, Math.max(-amp, jx * amp + swing * SWING_LEAN * amp));
    const oy = Math.min(amp, Math.max(-amp, jy * amp));
    return {
      rect: fitrect({ x: b.rect.x + ox, y: b.rect.y + oy, w: b.rect.w, h: b.rect.h }),
      weight: b.weight,
      role: b.role,
    };
  });
}

/**
 * compositionBalance — the audit feed: the weight-weighted canvas center
 * plus an 8-bin density histogram over x (each bin holds its share of the
 * total weight, summing to 1). Blocks with zero or damaged weight/geometry
 * carry no mass; a massless audit answers the neutral center 0.5/0.5 with
 * an empty histogram. Purely informational — for tests and the polish wave.
 */
export function compositionBalance(blocks: readonly Block[]): BalanceReport {
  const bins = new Array<number>(HISTOGRAM_BINS).fill(0);
  let mass = 0;
  let sx = 0;
  let sy = 0;
  for (const b of Array.isArray(blocks) ? blocks : []) {
    const r = b?.rect;
    const w = typeof b?.weight === "number" && Number.isFinite(b.weight) && b.weight > 0 ? b.weight : 0;
    if (!r || !Number.isFinite(r.x) || !Number.isFinite(r.y) || !Number.isFinite(r.w) || !Number.isFinite(r.h))
      continue;
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    mass += w;
    sx += w * cx;
    sy += w * cy;
    bins[Math.min(HISTOGRAM_BINS - 1, Math.max(0, Math.floor(cx * HISTOGRAM_BINS)))] += w;
  }
  if (mass <= 0) return { centerX: 0.5, centerY: 0.5, densityHistogram: bins };
  return { centerX: sx / mass, centerY: sy / mass, densityHistogram: bins.map((v) => v / mass) };
}
