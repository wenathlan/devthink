// # imageproject — the PROJECT layer of the cadria audio→image wave: one
// immutable, serializable, versioned bundle (ImageProject v1) pinning the
// fused AudioDescriptor plus every wave-2 spec (Palette, Block[], TextureSpec,
// MotionSpec) to a seed, a style and a canvas for the render wave. Also owns
// the seeded randomness everything downstream draws from: the seed string
// folds with fnv-1a (both bytes of every char — the same 32-bit hash family
// the audio seed and the texture jitter use) into the mulberry32 state lane
// (state += 0x6d2b79f5, xor/imul shuffle, top bits over 2^32) — the same seed
// always replays the identical [0,1) sequence. ProjectError codes:
// "project-shape" missing/mistyped fields, malformed hex, unknown symbols ·
// "project-range" non-finite or out-of-bounds numbers · "project-version"
// unreadable bundle/descriptor version. Fresh deep-frozen replicas only —
// caller inputs are never mutated, in memory or across JSON.
import type { AudioDescriptor } from "./audioattributes.ts";
import type { Block, BlockRole } from "./synthcomposition.ts";
import { KEYFRAME_CAP, type MotionEasing, type MotionKeyframeKind, type MotionSpec } from "./synthmotion.ts";
import { oklchToSrgbHex, wrapHue, type OklchTriple, type Palette } from "./synthpalette.ts";
import { GRAIN_COUPLING, TEXTURE_RANGES, type TextureSpec } from "./synthtexture.ts";

export type ProjectErrorCode = "project-version" | "project-shape" | "project-range";
export type CanvasOrientation = "portrait" | "landscape" | "square";
export type ProjectAudio = { durationMs: number; bpm: number; key: string };
export type ProjectCanvas = { width: number; height: number; orientation: CanvasOrientation };
/** the frozen v1 bundle — every sub-object is deep-frozen on build/parse. */
export type ImageProject = {
  version: 1;
  id: string; // slug of seed + style
  seed: string;
  style: string;
  createdAt: string; // ISO stamp — excluded from determinism equality
  audio: ProjectAudio;
  descriptor: AudioDescriptor;
  palette: Palette;
  blocks: Block[];
  texture: TextureSpec;
  motion: MotionSpec;
  canvas: ProjectCanvas;
};
export type BuildImageProjectInput = {
  descriptor: AudioDescriptor; seed?: string; style?: string; // seed ← descriptor.seed, style ← "atelier"
  palette: Palette; blocks: Block[]; texture: TextureSpec; motion: MotionSpec;
  width?: number; height?: number; // canvas, default 1080×1080
};

export const PROJECT_VERSION = 1;
export const CANVAS_MIN = 64, CANVAS_MAX = 8192;
/** golden angle in degrees — variant i rotates the anchor hue by (i+1)·step. */
export const VARIANT_HUE_STEP = 137.5;
const VARIANT_CAP = 12;
const FNV_BASIS = 0x811c9dc5, FNV_PRIME = 0x01000193;
const HEX = /^#[0-9a-f]{6}$/;
const ROLES: ReadonlySet<string> = new Set(["hero", "cadre", "field", "edge"]);
const EASINGS: ReadonlySet<string> = new Set(["standard", "decelerate", "accelerate", "springy"]);
const KINDS: ReadonlySet<string> = new Set(["pulse", "shift", "reveal", "wipe"]);
const PITCH_CLASSES = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];

/** the one error type this layer throws, tagged with its taxonomy code. */
export class ProjectError extends Error {
  code: ProjectErrorCode;
  constructor(code: ProjectErrorCode, message: string) { super(message); this.name = "ProjectError"; this.code = code; }
}

type Box = Record<string, unknown>;
const isBox = (v: unknown): v is Box => v !== null && typeof v === "object" && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isNum = (v: unknown): v is number => typeof v === "number";
const fin = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
function fail(code: ProjectErrorCode, what: string): never { throw new ProjectError(code, what); }
const shape = (ok: boolean, what: string): void => { if (!ok) fail("project-shape", what); };
const range = (ok: boolean, what: string): void => { if (!ok) fail("project-range", what); };
/** reads a required number off a box: missing/mistyped → "project-shape". */
const numField = (b: Box, key: string, what: string): number => {
  const v = b[key];
  if (!isNum(v)) fail("project-shape", `${what} number`);
  return v;
};

/** one declared OKLCH color: l 0-1, c 0-0.33, h 0-360 (synthpalette's domain). */
function triple(t: unknown, what: string): OklchTriple {
  shape(isBox(t), `${what} object`); const { l, c, h } = t as Box;
  if (!isNum(l) || !isNum(c) || !isNum(h)) fail("project-shape", `${what} l/c/h numbers`);
  range(fin(l) && l >= 0 && l <= 1 && fin(c) && c >= 0 && c <= 0.33 && fin(h) && h >= 0 && h < 360, `${what} l 0-1, c 0-0.33, h 0-360`);
  return { l, c, h };
}

const hex = (v: unknown, what: string): string => {
  if (!isStr(v) || !HEX.test(v)) fail("project-shape", `${what} must be "#rrggbb"`);
  return v;
};

/** validates and replicas the fused descriptor (v1, 32 finite 0-1 dims). */
function validDescriptor(v: unknown): AudioDescriptor {
  shape(isBox(v), "descriptor object"); const b = v as Box;
  const version = numField(b, "version", "descriptor.version");
  if (!Number.isInteger(version) || version !== 1) fail("project-version", `descriptor.version ${version} unsupported (read v1)`);
  shape(isStr(b.seed) && b.seed.length > 0, "descriptor.seed non-empty string");
  shape(Array.isArray(b.vector) && b.vector.length === 32, "descriptor.vector of 32 dims");
  const vector = (b.vector as unknown[]).map((d, i) => (fin(d) && d >= 0 && d <= 1 ? d : fail("project-range", `descriptor.vector[${i}] finite in 0-1`)));
  shape(isBox(b.scalar), "descriptor.scalar object"); const scalar: Record<string, number> = {};
  for (const [k, val] of Object.entries(b.scalar as Box)) scalar[k] = fin(val) ? val : fail("project-range", `descriptor.scalar.${k} finite`);
  return { version: 1, seed: b.seed as string, vector, scalar };
}

/** audio stats off the validated scalar; key reads "<pitch><m?>" (e.g. "am"). */
function validAudio(scalar: Box): ProjectAudio {
  const durationMs = numField(scalar, "durationMs", "scalar.durationMs"), bpm = numField(scalar, "bpm", "scalar.bpm");
  const tonic = numField(scalar, "tonic", "scalar.tonic"), minor = numField(scalar, "minor", "scalar.minor");
  range(fin(durationMs) && durationMs >= 0 && fin(bpm) && bpm >= 20 && bpm <= 1000, "scalar durationMs ≥ 0, bpm 20-1000");
  range(fin(tonic) && tonic >= 0 && tonic <= 11 && fin(minor) && minor >= 0 && minor <= 1, "scalar tonic 0-11, minor 0-1");
  const pitch = PITCH_CLASSES[Math.min(11, Math.max(0, Math.round(tonic)))];
  return { durationMs, bpm, key: minor >= 0.5 ? `${pitch}m` : pitch };
}

function validPalette(v: unknown): Palette {
  shape(isBox(v), "palette object"); const b = v as Box;
  const anchor = hex(b.anchor, "palette.anchor"), ink = hex(b.ink, "palette.ink"), surface = hex(b.surface, "palette.surface");
  shape(Array.isArray(b.support) && b.support.length >= 1 && Array.isArray(b.accents) && b.accents.length >= 1, "palette.support/accents non-empty arrays");
  const support = (b.support as unknown[]).map((s, i) => hex(s, `palette.support[${i}]`)), accents = (b.accents as unknown[]).map((s, i) => hex(s, `palette.accents[${i}]`));
  shape(isBox(b.oklch), "palette.oklch object"); const o = b.oklch as Box;
  shape(Array.isArray(o.accents), "palette.oklch.accents array");
  const oklch = { anchor: triple(o.anchor, "palette.oklch.anchor"), accents: (o.accents as unknown[]).map((t, i) => triple(t, `palette.oklch.accents[${i}]`)) };
  return { anchor, support, ink, surface, accents, oklch };
}

function validBlocks(v: unknown): Block[] {
  shape(Array.isArray(v) && v.length >= 1, "blocks non-empty array");
  return (v as unknown[]).map((raw, i) => {
    shape(isBox(raw), `blocks[${i}] object`);
    const b = raw as Box;
    shape(isStr(b.role) && ROLES.has(b.role), `blocks[${i}].role hero|cadre|field|edge`);
    shape(isBox(b.rect), `blocks[${i}].rect object`);
    const r = b.rect as Box;
    const rect = { x: numField(r, "x", `blocks[${i}].rect.x`), y: numField(r, "y", `blocks[${i}].rect.y`),
      w: numField(r, "w", `blocks[${i}].rect.w`), h: numField(r, "h", `blocks[${i}].rect.h`) };
    const weight = numField(b, "weight", `blocks[${i}].weight`);
    range([rect.x, rect.y, rect.w, rect.h].every((n) => fin(n) && n >= 0 && n <= 1)
      && rect.x + rect.w <= 1 + 1e-6 && rect.y + rect.h <= 1 + 1e-6 && fin(weight) && weight > 0 && weight <= 1, `blocks[${i}].rect 0-1 inside canvas, weight 0-1`);
    return { rect, weight, role: b.role as BlockRole };
  });
}

function validTexture(v: unknown): TextureSpec {
  shape(isBox(v), "texture object"); const b = v as Box;
  const out = {} as Record<keyof TextureSpec, number>;
  for (const key of Object.keys(TEXTURE_RANGES) as (keyof TextureSpec)[]) {
    const { min, max } = TEXTURE_RANGES[key];
    const value = numField(b, key, `texture.${key}`);
    range(fin(value) && value >= min && value <= max, `texture.${key} in ${min}-${max}`);
    out[key] = value;
  }
  range(Number.isInteger(out.glazeLayers) && out.grainOpacity <= out.grainDensity + GRAIN_COUPLING + 1e-9, "texture.glazeLayers whole, grainOpacity coupling");
  return out as TextureSpec;
}

function validMotion(v: unknown): MotionSpec {
  shape(isBox(v), "motion object");
  const b = v as Box;
  const loopMs = numField(b, "loopMs", "motion.loopMs");
  range(fin(loopMs) && loopMs > 0, "motion.loopMs > 0");
  shape(isStr(b.easing) && EASINGS.has(b.easing), "motion.easing standard|decelerate|accelerate|springy");
  shape(Array.isArray(b.keyframes), "motion.keyframes array");
  const rawKeys = b.keyframes as unknown[];
  range(rawKeys.length <= KEYFRAME_CAP, `motion.keyframes ≤ ${KEYFRAME_CAP}`);
  const keyframes = rawKeys.map((raw, i) => {
    shape(isBox(raw), `motion.keyframes[${i}] object`);
    const k = raw as Box;
    const tMs = numField(k, "tMs", `motion.keyframes[${i}].tMs`), strength = numField(k, "strength", `motion.keyframes[${i}].strength`);
    shape(isStr(k.kind) && KINDS.has(k.kind), `motion.keyframes[${i}].kind pulse|shift|reveal|wipe`);
    shape(Array.isArray(k.targets) && k.targets.every(isStr), `motion.keyframes[${i}].target strings`);
    range(fin(tMs) && tMs >= 0 && fin(strength) && strength >= 0 && strength <= 1, `motion.keyframes[${i}].tMs ≥ 0, strength 0-1`);
    return { tMs, kind: k.kind as MotionKeyframeKind, strength, targets: [...(k.targets as string[])] };
  });
  shape(isBox(b.drift), "motion.drift object"); const d = b.drift as Box;
  const drift = { x: numField(d, "x", "motion.drift.x"), y: numField(d, "y", "motion.drift.y"), rotation: numField(d, "rotation", "motion.drift.rotation") };
  range(Object.values(drift).every(fin), "motion.drift finite");
  const pulseScale = numField(b, "pulseScale", "motion.pulseScale"), parallaxDepth = numField(b, "parallaxDepth", "motion.parallaxDepth");
  range(fin(pulseScale) && pulseScale > 0 && pulseScale <= 4, "motion.pulseScale in 0-4");
  range(fin(parallaxDepth) && parallaxDepth >= 0 && parallaxDepth <= 1, "motion.parallaxDepth in 0-1");
  return { loopMs, keyframes, easing: b.easing as MotionEasing, drift, pulseScale, parallaxDepth };
}

/** slug lane: lowercase, non-alphanumerics fold to "-", trimmed. */
const slug = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "x";

function deepFreeze<T>(v: T): T {
  if (Array.isArray(v)) { for (const item of v) deepFreeze(item); Object.freeze(v); }
  else if (v !== null && typeof v === "object") { for (const k of Object.keys(v as Box)) deepFreeze((v as Box)[k]); Object.freeze(v); }
  return v;
}
/** validates + replicas every part of a bundle box, then freezes the result. */
function assemble(b: Box): ImageProject {
  const descriptor = validDescriptor(b.descriptor);
  const seed = b.seed === undefined ? descriptor.seed : b.seed, style = b.style === undefined ? "atelier" : b.style;
  const canvas = isBox(b.canvas) ? b.canvas : b; // serialized bundles nest w/h under canvas
  const width = canvas.width === undefined ? 1080 : canvas.width, height = canvas.height === undefined ? 1080 : canvas.height;
  if (!isStr(seed) || seed.length === 0 || !isStr(style) || style.length === 0) fail("project-shape", "seed/style non-empty strings");
  if (!isNum(width) || !isNum(height)) fail("project-shape", "canvas width/height numbers");
  range(fin(width) && Number.isInteger(width) && width >= CANVAS_MIN && width <= CANVAS_MAX && fin(height) && Number.isInteger(height) && height >= CANVAS_MIN && height <= CANVAS_MAX, "canvas whole in 64-8192");
  const orientation: CanvasOrientation = width > height ? "landscape" : height > width ? "portrait" : "square";
  const createdAt = b.createdAt === undefined ? new Date().toISOString() : b.createdAt;
  if (!isStr(createdAt) || Number.isNaN(Date.parse(createdAt))) fail("project-shape", "createdAt ISO string");
  return deepFreeze({
    version: PROJECT_VERSION, id: `${slug(seed)}-${slug(style)}`, seed, style, createdAt,
    audio: validAudio(descriptor.scalar), descriptor, palette: validPalette(b.palette), blocks: validBlocks(b.blocks),
    texture: validTexture(b.texture), motion: validMotion(b.motion), canvas: { width, height, orientation },
  });
}

/**
 * buildImageProject — validates every field of the bundle and freezes it into
 * one ImageProject v1 (seed ← descriptor.seed, style ← "atelier", canvas ←
 * 1080×1080; orientation derives from w/h, equal → "square").
 */
export function buildImageProject(input: BuildImageProjectInput): ImageProject {
  shape(isBox(input), "build input object");
  return assemble(input as Box);
}

/** JSON text of the bundle — only a v1 ImageProject serializes. */
export function serializeProject(project: ImageProject): string {
  if (!isBox(project) || project.version !== PROJECT_VERSION) fail("project-version", "serialize expects an ImageProject v1");
  return JSON.stringify(project);
}

/**
 * parseProject — the serialize inverse: parses JSON, refuses any version this
 * build does not read ("project-version"), re-validates and re-freezes every
 * field; damaged JSON or a non-object payload answers "project-shape".
 */
export function parseProject(text: string): ImageProject {
  shape(isStr(text) && text.length > 0, "project json string");
  let raw: unknown;
  try { raw = JSON.parse(text); } catch (error) { fail("project-shape", `invalid json: ${(error as Error).message}`); }
  shape(isBox(raw), "project object");
  const b = raw as Box;
  const version = numField(b, "version", "project.version");
  if (!Number.isInteger(version) || version !== PROJECT_VERSION) fail("project-version", `project.version ${version} unsupported (read v${PROJECT_VERSION})`);
  return assemble(b);
}

/**
 * projectVariants — `count` (default 3, capped 0-12) sibling projects off one
 * parent: same audio/descriptor, blocks, texture and motion; seed becomes
 * `${seed}::variant${i}` (→ a fresh id) and the palette anchor hue rotates by
 * (i+1)·VARIANT_HUE_STEP golden-angle degrees, re-rendered through
 * synthpalette's gamut clamp; re-deriving jitter-dependent layout fields is
 * out of scope — variants are the render wave's seed handles.
 */
export function projectVariants(project: ImageProject, count = 3): ImageProject[] {
  if (!isBox(project) || project.version !== PROJECT_VERSION) fail("project-version", "projectVariants expects an ImageProject v1");
  const asked = count === undefined ? 3 : count;
  if (!isNum(asked)) fail("project-shape", "variant count number");
  range(fin(asked) && Number.isInteger(asked) && asked >= 0 && asked <= VARIANT_CAP, `variant count in 0-${VARIANT_CAP}`);
  const variants: ImageProject[] = [];
  for (let i = 0; i < asked; i += 1) {
    const anchor = project.palette.oklch.anchor, hue = wrapHue(anchor.h + (i + 1) * VARIANT_HUE_STEP);
    const rotated: Palette = {
      ...project.palette, anchor: oklchToSrgbHex(anchor.l, anchor.c, hue),
      oklch: { anchor: { ...anchor, h: hue }, accents: project.palette.oklch.accents.map((t) => ({ ...t })) },
    };
    variants.push(buildImageProject({
      descriptor: project.descriptor, seed: `${project.seed}::variant${i}`, style: project.style, palette: rotated,
      blocks: project.blocks, texture: project.texture, motion: project.motion, width: project.canvas.width, height: project.canvas.height,
    }));
  }
  return variants;
}

/**
 * rngFromSeed (mulberry32 over an fnv-1a state lane) — folds the seed string
 * with fnv-1a into one 32-bit state lane, then runs mulberry32 from it: each
 * call advances the lane by 0x6d2b79f5 and yields the shuffled top bits over
 * 2^32 — same seed, identical replay.
 */
export function rngFromSeed(seed: string): () => number {
  const text = isStr(seed) ? seed : "";
  let state = FNV_BASIS;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    state = Math.imul((state ^ (code & 0xff)) >>> 0, FNV_PRIME) >>> 0;
    state = Math.imul((state ^ ((code >>> 8) & 0xff)) >>> 0, FNV_PRIME) >>> 0;
  }
  let lane = state >>> 0;
  return () => {
    lane = (lane + 0x6d2b79f5) | 0;
    let t = lane; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** integer in [min, max] inclusive; non-integer or inverted bounds → "project-range". */
export function rngInt(rng: () => number, min: number, max: number): number {
  if (!fin(min) || !fin(max) || !Number.isInteger(min) || !Number.isInteger(max) || max < min) fail("project-range", "rngInt needs integer bounds min ≤ max");
  return min + Math.floor(rng() * (max - min + 1));
}

/** one item of a non-empty list; empty or non-array → "project-shape". */
export function rngPick<T>(rng: () => number, items: readonly T[]): T {
  shape(Array.isArray(items) && items.length > 0, "rngPick needs a non-empty list");
  return items[Math.floor(rng() * items.length)];
}
