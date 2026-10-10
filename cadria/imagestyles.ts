// # imagestyles — the style layer of the cadria audio→image wave (module b6):
// fifteen named generation styles that bias every sibling wave-2 spec. A
// style is a compact fingerprint: a mood line + tags (tag 0 is the family —
// calm | kinetic | dark; the table spans 5 of each) over four bias groups:
// paletteBias chroma/lightness/warmth signed deltas in [-1, 1];
// compositionBias density [0, 1], symmetry mirror|rotational|asymmetric,
// heroScale [0.3, 0.7]; textureBias additive deltas over TextureSpec fields,
// |delta| ≤ half the field span (TEXTURE_DELTA_CAP); motionBias tempo (a
// [0, 1] multiplier on keyframe strength) + driftScale [0, 1]. Names are
// lowercase printmaking/optics/material-craft vocabulary, lightly deformed,
// no repeated endings (pairwise common suffix ≤ 3 letters).
// styleForDescriptor scores every style with the documented weighted
// distance STYLE_MATCH_WEIGHTS — noisiness vs the grain push, mean(tempo,
// energyDrive) vs the motion push, mean(brightness, timbreBrightness) vs
// the lightness side, moodShadow vs the darkness side — lowest score wins,
// exact ties break alphabetically. applyStyleBias folds a style into base
// layer values with pure clamped math: palette + density additive,
// heroScale pulled HERO_PULL toward the style's share, texture additive
// inside TEXTURE_RANGES with synthtexture's grain coupling kept, motion
// multiplicative; damaged numbers coerce to neutrals, never NaN.
// Deterministic throughout: same inputs → bit-for-bit same outputs.
// Exports: types StyleSymmetry, BiasRange, PaletteBias, CompositionBias,
// TextureBias, MotionBias, StyleSpec, StyleBase, StyleBiased, StyleError;
// consts STYLE_RANGES, STYLE_MATCH_WEIGHTS, TEXTURE_DELTA_CAP, HERO_PULL;
// functions imageStyles, styleByName, styleForDescriptor, styleFingerprint,
// applyStyleBias.

import type { AudioDescriptor } from "./audioattributes.ts";
import { DIM_ORDER } from "./audiofeatures.ts";
import { GRAIN_COUPLING, TEXTURE_RANGES, type TextureSpec } from "./synthtexture.ts";

/** symmetry grammar a style asks of the composition layer. */
export type StyleSymmetry = "mirror" | "rotational" | "asymmetric";
/** documented numeric range of one bias group. */
export type BiasRange = readonly [number, number];
/** signed palette deltas — −1 muted/dark/cool, +1 saturated/bright/warm. */
export type PaletteBias = { chroma: number; lightness: number; warmth: number };
/** composition deltas: layout density, symmetry grammar, preferred hero share. */
export type CompositionBias = { density: number; symmetry: StyleSymmetry; heroScale: number };
/** additive deltas over TextureSpec fields, |delta| ≤ TEXTURE_DELTA_CAP[field]. */
export type TextureBias = Partial<{ [K in keyof TextureSpec]: number }>;
/** motion deltas: keyframe-strength multiplier and drift scale, both 0-1. */
export type MotionBias = { tempo: number; driftScale: number };
/** one named generation style — tags[0] is the family: calm | kinetic | dark. */
export type StyleSpec = {
  name: string; // unique lowercase vocabulary word
  mood: string; // one-line documented intent
  paletteBias: PaletteBias; compositionBias: CompositionBias;
  textureBias: TextureBias; motionBias: MotionBias; tags: string[];
};
/** base values applyStyleBias bends — missing fields take neutral defaults. */
export type StyleBase = {
  chroma?: number; lightness?: number; warmth?: number; // palette 0-1 (default 0.5)
  density?: number; heroScale?: number; // composition (defaults 0.5)
  texture?: Partial<TextureSpec>; // texture base values (default NEUTRAL_TEXTURE)
  strength?: number; drift?: number; // motion base values 0-1 (default 1)
};
/** biased values — every field present, finite, inside its documented range. */
export type StyleBiased = {
  chroma: number; lightness: number; warmth: number; density: number; heroScale: number;
  texture: TextureSpec; strength: number; drift: number; // texture inside TEXTURE_RANGES
};
/** thrown by styleByName for misses — check error.code === "style-unknown". */
export type StyleError = Error & { code: "style-unknown" };

// ---- documented constants (the validation + matching surface) ----

/** bias ranges — every style below is validated against these. */
export const STYLE_RANGES: Readonly<{ palette: BiasRange; density: BiasRange; heroScale: BiasRange; motion: BiasRange }> = {
  palette: [-1, 1], density: [0, 1], heroScale: [0.3, 0.7], motion: [0, 1],
};
/** weighted distance for styleForDescriptor — the four weights sum to 1. */
export const STYLE_MATCH_WEIGHTS = { grain: 0.3, motion: 0.3, light: 0.2, shadow: 0.2 } as const;
/** |textureBias delta| ceiling per field: half the documented field span. */
export const TEXTURE_DELTA_CAP: Readonly<Record<keyof TextureSpec, number>> = Object.fromEntries(
  (Object.keys(TEXTURE_RANGES) as (keyof TextureSpec)[]).map((f) => [f, (TEXTURE_RANGES[f].max - TEXTURE_RANGES[f].min) / 2]),
) as Readonly<Record<keyof TextureSpec, number>>;
/** share of the gap applyStyleBias closes toward a style's heroScale. */
export const HERO_PULL = 0.5;

// ---- the table: 5 calm, 5 kinetic, 5 dark/moody ----

const TABLE: readonly StyleSpec[] = [
  { name: "opaline", mood: "milky glass washes drifting over slow pastel air",
    paletteBias: { chroma: -0.55, lightness: 0.55, warmth: -0.2 }, compositionBias: { density: 0.2, symmetry: "mirror", heroScale: 0.38 }, textureBias: { grainDensity: -0.35, grainSize: -2.2, glazeOpacity: 0.25, specular: 0.3, turbulence: -0.3 },
    motionBias: { tempo: 0.15, driftScale: 0.2 }, tags: ["calm", "glassy", "pastel", "airy"] },
  { name: "mistrelle", mood: "fog-soft fields breathing in hushed pale gradients",
    paletteBias: { chroma: -0.4, lightness: 0.4, warmth: -0.35 }, compositionBias: { density: 0.25, symmetry: "mirror", heroScale: 0.34 }, textureBias: { strokeSoftness: 0.4, glazeLayers: 1.5, grainDensity: -0.2, glazeOpacity: -0.2 },
    motionBias: { tempo: 0.22, driftScale: 0.35 }, tags: ["calm", "foggy", "pale", "soft"] },
  { name: "veiloam", mood: "earthy loam tones resting under a sheer muted veil",
    paletteBias: { chroma: -0.45, lightness: 0.1, warmth: 0.5 }, compositionBias: { density: 0.3, symmetry: "asymmetric", heroScale: 0.42 }, textureBias: { strokeSoftness: 0.3, glazeLayers: 1, strokeWeight: -3, grainDensity: -0.05 },
    motionBias: { tempo: 0.3, driftScale: 0.25 }, tags: ["calm", "earthy", "muted", "veiled"] },
  { name: "plienair", mood: "open-air daylight sketch with soft warm neutrals",
    paletteBias: { chroma: 0.1, lightness: 0.6, warmth: 0.55 }, compositionBias: { density: 0.4, symmetry: "asymmetric", heroScale: 0.46 }, textureBias: { strokeJitter: 0.15, strokeWeight: 2, grainDensity: 0.1, specular: 0.1 },
    motionBias: { tempo: 0.35, driftScale: 0.4 }, tags: ["calm", "daylight", "sketched", "warm"] },
  { name: "fernwell", mood: "quiet green still water under leaf-soft light",
    paletteBias: { chroma: -0.15, lightness: 0.3, warmth: -0.45 }, compositionBias: { density: 0.35, symmetry: "rotational", heroScale: 0.4 }, textureBias: { grainSize: 1, grainDensity: 0.05, glazeOpacity: 0.1, turbulence: -0.1 },
    motionBias: { tempo: 0.28, driftScale: 0.3 }, tags: ["calm", "green", "still", "leafy"] },
  { name: "strobic", mood: "hard strobe pulses cutting high-contrast flicker",
    paletteBias: { chroma: 0.5, lightness: 0.25, warmth: -0.1 }, compositionBias: { density: 0.85, symmetry: "rotational", heroScale: 0.55 }, textureBias: { grainDensity: 0.2, strokeJitter: 0.5, turbulence: 0.45, strokeWeight: 4 },
    motionBias: { tempo: 0.95, driftScale: 0.85 }, tags: ["kinetic", "strobe", "pulsed", "electric"] },
  { name: "kinegram", mood: "sliced hologram wedges spinning in cool light",
    paletteBias: { chroma: 0.35, lightness: 0.15, warmth: -0.5 }, compositionBias: { density: 0.7, symmetry: "rotational", heroScale: 0.5 }, textureBias: { strokeJitter: 0.3, glazeLayers: 2, specular: 0.35, strokeSoftness: -0.2 },
    motionBias: { tempo: 0.8, driftScale: 0.7 }, tags: ["kinetic", "hologram", "sliced", "cool"] },
  { name: "voltura", mood: "electric surge arcing in molten accent spikes",
    paletteBias: { chroma: 0.8, lightness: 0.1, warmth: -0.25 }, compositionBias: { density: 0.75, symmetry: "asymmetric", heroScale: 0.62 }, textureBias: { turbulence: 0.4, strokeWeight: 6, strokeJitter: 0.4, specular: 0.25 },
    motionBias: { tempo: 0.9, driftScale: 1 }, tags: ["kinetic", "surge", "arced", "molten"] },
  { name: "ryther", mood: "syncopated scatter jittering against the beat grid",
    paletteBias: { chroma: 0.25, lightness: 0, warmth: 0.3 }, compositionBias: { density: 0.9, symmetry: "asymmetric", heroScale: 0.34 }, textureBias: { strokeJitter: 0.5, grainDensity: 0.25, strokeWeight: -2, turbulence: 0.3 },
    motionBias: { tempo: 0.85, driftScale: 0.9 }, tags: ["kinetic", "syncopated", "scattered", "jittery"] },
  { name: "percussa", mood: "struck-metal bursts chiselled into brassy plates",
    paletteBias: { chroma: 0.45, lightness: -0.1, warmth: 0.35 }, compositionBias: { density: 0.6, symmetry: "mirror", heroScale: 0.66 }, textureBias: { strokeWeight: 8, strokeSoftness: -0.3, grainOpacity: 0.2, turbulence: 0.25 },
    motionBias: { tempo: 0.7, driftScale: 0.6 }, tags: ["kinetic", "struck", "chiselled", "brassy"] },
  { name: "nocturn", mood: "deep night washes under a faint moon sheen",
    paletteBias: { chroma: -0.3, lightness: -0.7, warmth: -0.4 }, compositionBias: { density: 0.3, symmetry: "mirror", heroScale: 0.44 }, textureBias: { glazeLayers: 2, glazeOpacity: 0.3, specular: -0.3, grainDensity: -0.15, strokeSoftness: 0.2 },
    motionBias: { tempo: 0.3, driftScale: 0.45 }, tags: ["dark", "night", "washed", "moonlit"] },
  { name: "umbrous", mood: "heavy shadow pressing a low-key silhouette",
    paletteBias: { chroma: -0.6, lightness: -0.8, warmth: 0 }, compositionBias: { density: 0.25, symmetry: "mirror", heroScale: 0.55 }, textureBias: { grainDensity: -0.25, glazeOpacity: 0.35, specular: -0.4, strokeWeight: 1.5, glazeLayers: 1 },
    motionBias: { tempo: 0.35, driftScale: 0.3 }, tags: ["dark", "shadowed", "silhouette", "low-key"] },
  { name: "sablewane", mood: "black satin fading to one thin crescent glow",
    paletteBias: { chroma: -0.2, lightness: -0.6, warmth: -0.15 }, compositionBias: { density: 0.35, symmetry: "asymmetric", heroScale: 0.62 }, textureBias: { specular: 0.2, grainSize: -1.5, glazeOpacity: 0.2, turbulence: -0.15 },
    motionBias: { tempo: 0.45, driftScale: 0.55 }, tags: ["dark", "satin", "crescent", "fading"] },
  { name: "tarnglass", mood: "dark lake glass holding a cold stilled mirror",
    paletteBias: { chroma: -0.35, lightness: -0.5, warmth: -0.6 }, compositionBias: { density: 0.2, symmetry: "mirror", heroScale: 0.5 }, textureBias: { turbulence: -0.35, specular: 0.3, grainDensity: -0.3, strokeSoftness: 0.15, glazeOpacity: 0.25 },
    motionBias: { tempo: 0.4, driftScale: 0.5 }, tags: ["dark", "mirror", "cold", "stilled"] },
  { name: "charlow", mood: "charred ember dusk smoldering under ashy reds",
    paletteBias: { chroma: 0.05, lightness: -0.55, warmth: 0.6 }, compositionBias: { density: 0.45, symmetry: "asymmetric", heroScale: 0.58 }, textureBias: { grainDensity: 0.4, grainSize: 2.5, grainOpacity: 0.25, turbulence: 0.25, strokeWeight: 3 },
    motionBias: { tempo: 0.55, driftScale: 0.5 }, tags: ["dark", "ember", "ashy", "smoldering"] },
];

// ---- table access ----

/** fresh deep copy — callers may mutate freely without corrupting the table. */
function copy(style: StyleSpec): StyleSpec {
  return {
    ...style, paletteBias: { ...style.paletteBias }, compositionBias: { ...style.compositionBias },
    textureBias: { ...style.textureBias }, motionBias: { ...style.motionBias }, tags: [...style.tags],
  };
}

/** all 15 styles, table order (calm → kinetic → dark), fresh deep copies. */
export function imageStyles(): readonly StyleSpec[] {
  return TABLE.map(copy);
}

function styleError(code: "style-unknown", message: string): StyleError {
  const error = new Error(message) as StyleError;
  error.code = code;
  return error;
}

/** one style by name — trimmed + lowercased; misses throw style-unknown. */
export function styleByName(name: string): StyleSpec {
  const key = typeof name === "string" ? name.trim().toLowerCase() : "";
  const hit = TABLE.find((style) => style.name === key);
  if (!hit) throw styleError("style-unknown", `unknown style (code style-unknown): ${typeof name === "string" ? JSON.stringify(name) : String(name)}`);
  return copy(hit);
}

// ---- deterministic matching ----

const FNV_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/** fnv-1a over a string, both bytes per char — deterministic and stable. */
function fnv1a(text: string): number {
  let lane = FNV_BASIS;
  for (let i = 0; i < text.length; i++) {
    lane = Math.imul((lane ^ (text.charCodeAt(i) & 0xff)) >>> 0, FNV_PRIME) >>> 0;
    lane = Math.imul((lane ^ ((text.charCodeAt(i) >>> 8) & 0xff)) >>> 0, FNV_PRIME) >>> 0;
  }
  return lane >>> 0;
}

function dimIndex(name: string, fallback: number): number {
  const at = DIM_ORDER.indexOf(name);
  return at >= 0 ? at : fallback;
}

/** total descriptor dim read: finite values clamp 0-1, damage answers 0.5. */
function dim(descriptor: AudioDescriptor, name: string, fallback: number): number {
  const vector: unknown = (descriptor as Partial<AudioDescriptor> | null | undefined)?.vector;
  const value = Array.isArray(vector) ? ((vector as unknown[])[dimIndex(name, fallback)] as number) : Number.NaN;
  return Number.isFinite(value) ? (value < 0 ? 0 : value > 1 ? 1 : value) : 0.5;
}

/** grain side of a style: mean of the normalized grain fields, 0-1. */
function grainPush(style: StyleSpec): number {
  const fields = ["grainDensity", "grainSize", "turbulence"] as const;
  let sum = 0;
  for (const field of fields) sum += clamp01(0.5 + (style.textureBias[field] ?? 0) / (2 * TEXTURE_DELTA_CAP[field]));
  return sum / fields.length;
}

/** motion side of a style: mean tempo/driftScale, 0-1. */
function motionPush(style: StyleSpec): number {
  return clamp01((style.motionBias.tempo + style.motionBias.driftScale) / 2);
}

/** lightness side of a style: lightness bias −1…1 mapped to 0…1. */
function lightSide(style: StyleSpec): number {
  return clamp01((style.paletteBias.lightness + 1) / 2);
}

/** deterministic weighted-distance match; ties break alphabetically. */
export function styleForDescriptor(descriptor: AudioDescriptor): StyleSpec {
  const noise = dim(descriptor, "noisiness", 16);
  const tempo = (dim(descriptor, "tempo", 7) + dim(descriptor, "energyDrive", 29)) / 2;
  const bright = (dim(descriptor, "brightness", 6) + dim(descriptor, "timbreBrightness", 18)) / 2;
  const mood = dim(descriptor, "moodShadow", 31);
  const weights = STYLE_MATCH_WEIGHTS;
  let best: StyleSpec | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const style of TABLE) {
    const score = weights.grain * Math.abs(noise - grainPush(style))
      + weights.motion * Math.abs(tempo - motionPush(style))
      + weights.light * Math.abs(bright - lightSide(style))
      + weights.shadow * Math.abs(mood - (1 - lightSide(style)));
    if (score < bestScore || (score === bestScore && best !== null && style.name < best.name)) {
      best = style;
      bestScore = score;
    }
  }
  return copy(best as StyleSpec);
}

// ---- fingerprint ----

function fmt(x: unknown): string {
  return typeof x === "number" && Number.isFinite(x) ? String(x) : "?";
}

/** stable 8-hex fnv-1a fingerprint of the whole style — for ui + tests. */
export function styleFingerprint(style: StyleSpec): string {
  const source = style && typeof style === "object" ? style : ({} as StyleSpec);
  const palette = source.paletteBias ?? ({} as PaletteBias);
  const comp = source.compositionBias ?? ({} as CompositionBias);
  const tex = source.textureBias ?? ({} as TextureBias);
  const motion = source.motionBias ?? ({} as MotionBias);
  const keys = Object.keys(TEXTURE_RANGES) as (keyof TextureSpec)[];
  const parts = [source.name ?? "?", source.mood ?? "?", fmt(palette.chroma), fmt(palette.lightness), fmt(palette.warmth), fmt(comp.density), comp.symmetry ?? "?", fmt(comp.heroScale),
    ...keys.map((field) => fmt(tex[field])), fmt(motion.tempo), fmt(motion.driftScale), Array.isArray(source.tags) ? source.tags.join(",") : "?"];
  return fnv1a(parts.join("|")).toString(16).padStart(8, "0");
}

// ---- bias application ----

function clamp01(x: number): number {
  return Number.isFinite(x) ? (x < 0 ? 0 : x > 1 ? 1 : x) : 0;
}

function clampRange(x: number, lo: number, hi: number): number {
  return Number.isFinite(x) ? (x < lo ? lo : x > hi ? hi : x) : lo;
}

/** total number read: finite passes, everything else answers the fallback. */
function num(x: unknown, fallback: number): number {
  return typeof x === "number" && Number.isFinite(x) ? x : fallback;
}

/** neutral mid texture — the base applyStyleBias starts from when none given. */
const NEUTRAL_TEXTURE: TextureSpec = {
  grainDensity: 0.5, grainSize: 4.5, grainOpacity: 0.5, strokeSoftness: 0.5,
  strokeWeight: 12.25, strokeJitter: 0.5, glazeLayers: 3, glazeOpacity: 0.5,
  specular: 0.5, turbulence: 0.5,
};

/**
 * folds a style into base layer values with pure clamped math: palette and
 * density add the style's bias (clamped 0-1), heroScale pulls HERO_PULL of
 * the way to the style's share (clamped 0.3-0.7), texture adds each delta
 * inside TEXTURE_RANGES (glazeLayers rounded whole, grain coupling kept),
 * motion multiplies strength by tempo and drift by driftScale (clamped 0-1).
 */
export function applyStyleBias(base: StyleBase, style: StyleSpec): StyleBiased {
  const texture = {} as TextureSpec;
  const source = base?.texture;
  for (const field of Object.keys(TEXTURE_RANGES) as (keyof TextureSpec)[]) {
    const range = TEXTURE_RANGES[field];
    let value = clampRange(num(source?.[field], NEUTRAL_TEXTURE[field]) + (style.textureBias[field] ?? 0), range.min, range.max);
    if (field === "glazeLayers") value = Math.round(value);
    texture[field] = value;
  }
  texture.grainOpacity = Math.min(texture.grainOpacity, texture.grainDensity + GRAIN_COUPLING);
  const heroBase = num(base?.heroScale, 0.5);
  const hero = clampRange(heroBase + (style.compositionBias.heroScale - heroBase) * HERO_PULL, STYLE_RANGES.heroScale[0], STYLE_RANGES.heroScale[1]);
  return {
    chroma: clamp01(num(base?.chroma, 0.5) + style.paletteBias.chroma), lightness: clamp01(num(base?.lightness, 0.5) + style.paletteBias.lightness),
    warmth: clamp01(num(base?.warmth, 0.5) + style.paletteBias.warmth), density: clamp01(num(base?.density, 0.5) + style.compositionBias.density),
    heroScale: hero, texture,
    strength: clamp01(num(base?.strength, 1) * style.motionBias.tempo), drift: clamp01(num(base?.drift, 1) * style.motionBias.driftScale),
  };
}
