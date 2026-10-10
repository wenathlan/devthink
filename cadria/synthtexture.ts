// # synthtexture — the texture layer of the cadria audio→image wave (module
// b3): it folds the fused AudioDescriptor's timbre block into the surface
// parameters a renderer paints with — grain, stroke and glaze. It reads the
// 32-dim vector of audiofeatures.ts by position (position is the contract):
// dim 3 flatness, dim 4 flux and dims 16-21 timbre (noisiness, warmth,
// timbre brightness, texture slope, zero crossings, dynamics contrast).
// The documented timbre → texture table (every ramp is monotonic):
//
//   noisiness  (16) → grainDensity + grainSize     noise walls speckle dense
//   warmth     (17) → strokeSoftness + strokeWeight  warm mixes paint soft
//   brightness (18) → specular + glazeOpacity      bright mixes sheen and air
//   contrast   (21) → strokeWeight push + turbulence   dynamics bold the line
//   flatness   (3)  → glazeLayers                  flat spectra stack washes
//   flux       (4)  → strokeJitter                 spectral motion shakes lines
//   zcr        (20) → grain fineness               high zero crossings refine
//
// textureSlope (19) is left to the shade layer — reserved here. Everything
// is total and deterministic: a damaged descriptor (missing vector, short
// vector, or any non-finite consumed dim) answers the neutral canvas preset,
// every field comes back finite inside TEXTURE_RANGES, grainOpacity obeys
// the documented coupling (never above grainDensity + GRAIN_COUPLING), and
// the scatter field is fnv-1a based, so the same seed always lays the same
// jitter. Exports: TEXTURE_RANGES, GRAIN_COUPLING, TEXTURE_PRESET_BLEND,
// JITTER_FIELD_CAP, types TextureSpec, TexturePresetName, TexturePreset,
// functions texturePresets, jitterField, sanitizeTexture, synthTexture,
// textureDistance, synthTextureFromPreset.

import type { AudioDescriptor } from "./audioattributes.ts";

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

/** the consumed dims by contract position (audiofeatures.ts DIM_ORDER). */
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
