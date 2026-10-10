// # synthpalette — the palette layer of the cadria image-mapping wave,
// housed at the cadria root beside colorconvert. It folds the fused 32-dim
// AudioDescriptor (audiofeatures.ts) into one deterministic image palette in
// OKLCH: an anchor keyed by the tonic, a support field washed out by
// noisiness, 2–4 accents whose count tracks the energy gauges, an ink/surface
// text pair guarded to wcag AA, and light/dark/duotone variants. Pure
// TypeScript, zero dependencies; the colorimetry itself (OKLab matrices, sRGB
// curve, hex spellings) stays in colorconvert.ts — this file owns only the
// mapping rules, the contrast guard and the fallback rungs. Every function is
// total: a damaged descriptor (missing/short vector, one non-finite dim)
// answers the neutral gray-green fallback palette, never throws, never
// carries NaN; the same descriptor always answers the same palette
// bit-for-bit (the seed is deliberately ignored — the vector is the contract).
// Mapping contract (descriptor dim → palette dial, per DIM_ORDER):
//   d12 tonalCenter     → anchor hue: tonic/11·360 + TONIC_HUE_OFFSET[class]
//   d13 keyStrength     → accent chroma 0.10 + 0.10·strength
//   d31 moodShadow      → minor depth: anchor chroma ·(1 − 0.4·mood) and anchor
//                         lightness − 0.06·mood (moodShadow is d31 in the
//                         shipped contract, not d15 = dissonance)
//   d6 + d18 brightness → lightness ladder: anchor 0.42 + 0.30·gauge, surface
//                         0.16 + 0.80·gauge (bright mixes get airy paper, dark
//                         mixes get deep screens)
//   d16 noisiness       → support desaturation 0.05·(1 − 0.8·noise)
//   d22 + d29 energy    → accent count 2 + floor(mean·3) clamped 2–4 (punch +
//                         the flux×onset cross drive — the mission's "23+28"
//                         resolves to these carriers under DIM_ORDER)
// Exports: OklchTriple, Palette, AA_MIN_CONTRAST, TONIC_HUE_OFFSET,
// ACCENT_HUE_FAN, FALLBACK_PALETTE, oklchToSrgbHex, srgbHexToOklch, wrapHue,
// hueDistance, tonicHue, relativeLuminance, contrastRatio, synthPalette,
// paletteVariants.

import type { AudioDescriptor } from "./audioattributes.ts";
import { DESCRIPTOR_DIMS } from "./audiofeatures.ts";
import { hexfromrgb, oklchfromrgb, relativeluma709, rgbfromhex, rgbfromoklch } from "./colorconvert.ts";

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

// descriptor dim positions — literals per the fixed contract at the top of audiofeatures.ts (DIM_ORDER); position is the contract.
const DIM = { brightness: 6, tonic: 12, keyStrength: 13, noisiness: 16, timbreBrightness: 18, punch: 22, energyDrive: 29, moodShadow: 31 };

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
function assemble(anchor: OklchTriple, support: OklchTriple[], accents: OklchTriple[], ink: OklchTriple, surface: OklchTriple): Palette {
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
  [{ l: 0.68, c: 0.015, h: 117 }, { l: 0.42, c: 0.015, h: 173 }],
  [{ l: 0.66, c: 0.05, h: 295 }, { l: 0.38, c: 0.05, h: 260 }],
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
  const accentSource: OklchTriple[] =
    source.oklch?.accents?.length ? source.oklch.accents : FALLBACK_PALETTE.oklch.accents;
  const supportSource: OklchTriple[] = (source.support ?? []).map((t) => srgbHexToOklch(t) ?? { l: 0.5, c: 0.02, h: hue });
  const surfaceSource = srgbHexToOklch(source.surface) ?? { l: 0.95, c: 0.008, h: hue };
  const variants: Palette[] = [];
  if (n >= 1) {
    // light — gallery wall
    const surface: OklchTriple = { l: 0.97, c: 0.008, h: hue };
    const anchor: OklchTriple = { l: clampLight(Math.max(a.l, 0.72)), c: clampChroma(a.c * 0.85), h: hue };
    const accents = accentSource.map((t) => ({ l: clampLight(t.l + 0.15), c: clampChroma(t.c * 0.85), h: wrapHue(t.h) }));
    const support = supportSource.map((t) => ({ l: clampLight(t.l + 0.12), c: clampChroma(t.c * 0.7), h: wrapHue(t.h) }));
    variants.push(assemble(anchor, support, accents, inkFor(surface, hue).ink, surface));
  }
  if (n >= 2) {
    // dark — screening room
    const surface: OklchTriple = { l: 0.14, c: 0.012, h: hue };
    const anchor: OklchTriple = { l: clampLight(Math.max(0.3, a.l - 0.12)), c: clampChroma(a.c), h: hue };
    const accents = accentSource.map((t) => ({ l: clampLight(Math.max(0.25, t.l - 0.15)), c: clampChroma(t.c), h: wrapHue(t.h) }));
    const support = supportSource.map((t) => ({ l: clampLight(Math.max(0.18, t.l - 0.1)), c: clampChroma(t.c * 0.6), h: wrapHue(t.h) }));
    variants.push(assemble(anchor, support, accents, inkFor(surface, hue).ink, surface));
  }
  if (n >= 3) {
    // duotone — anchor hue + its complement only
    const complement = wrapHue(hue + 180);
    const surface: OklchTriple = { l: surfaceSource.l >= 0.5 ? 0.96 : 0.13, c: 0.02, h: hue };
    const anchor: OklchTriple = { l: clampLight(a.l), c: clampChroma(a.c), h: hue };
    const accents = accentSource.map((t, k) => ({ l: clampLight(t.l), c: clampChroma(t.c * 0.8), h: k % 2 === 0 ? complement : hue }));
    const support = supportSource.map((t) => ({ l: clampLight(t.l), c: clampChroma(t.c * 0.4), h: hue }));
    variants.push(assemble(anchor, support, accents, inkFor(surface, hue).ink, surface));
  }
  return variants;
}
