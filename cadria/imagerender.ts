// # imagerender — the render layer of the cadria audio→image studio (wave 2,
// module b7): a deterministic draw-command compiler. It consumes a project-ish
// input — the same fields imageproject.ts bundles (seed, palette, blocks,
// texture, canvas) as a minimal local RenderInput, so an ImageProject assigns
// to it structurally — and compiles it into a pixel-free frame: { width,
// height, background, commands }. The browser paints those commands
// (renderSvg in imagerenderpaint.ts serializes the same list to SVG); node
// tests assert them. Nothing here touches pixels: geometry is normalized 0-1,
// colors are #rrggbb, opacity 0-1, blur in px, and the pipeline is total and
// deterministic — no Math.random, no Date, same project → bit-identical
// commands. Paint order (documented z bands, also the array order):
//   0 background · 1000 gradientwash (hero) · 2000 block fills (hero ellipse
//   anchor + cadre/field/edge rects) · 2500 strokes (strokeSoftness/weight)
//   · 3000 grain (grainDensity) · 4000 specular (hero highlight).
// Budget: 4096 commands; overflow truncates grain first and keeps the
// specular last — priority: background > hero wash > fills > strokes > grain
// > specular (grain is the only count that scales freely, with count =
// ceil(density × canvasArea / 1600) positioned by jitterField(seed)).
// Exports: DrawCommand (+ per-kind types), RenderFrame, RenderInput,
// COMMAND_BUDGET, Z_* bands, WIPE_BAND, WIPE_SHIFT, SHIFT_STEP,
// renderCommands, renderThumbnailSignature, renderKeyframePerturbation,
// renderSvg (re-exported from imagerenderpaint.ts).

import type { Block, BlockRole, Rect } from "./synthcomposition.ts";
import type { MotionKeyframe } from "./synthmotion.ts";
import type { Palette } from "./synthpalette.ts";
import { FALLBACK_PALETTE } from "./synthpalette.ts";
import type { TextureSpec } from "./synthtexture.ts";
import { GRAIN_COUPLING, jitterField, TEXTURE_RANGES } from "./synthtexture.ts";

export { renderSvg } from "./imagerenderpaint.ts";

/** shared paint fields: opacity 0-1, blur in px (0 = crisp), z = paint order. */
type PaintBase = { opacity: number; blur: number; z: number; role?: BlockRole };
/** filled axis-aligned rectangle, normalized 0-1 (x/y top-left, w/h extents). */
export type RectCommand = PaintBase & { kind: "rect"; x: number; y: number; w: number; h: number; fill: string };
/** filled ellipse on center + radii, normalized 0-1. */
export type EllipseCommand = PaintBase & {
  kind: "ellipse";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill: string;
};
/** two-stop linear wash over a normalized rect; angle in degrees (0 = +x, svg y-down). */
export type GradientWashCommand = PaintBase & {
  kind: "gradientwash";
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
  from: string;
  to: string;
};
/** closed filled polygon: flat x,y pairs, normalized 0-1. */
export type PathCommand = PaintBase & { kind: "path"; points: number[]; fill: string };
/** open stroked polyline: flat x,y pairs normalized 0-1, stroke width in px. */
export type StrokePathCommand = PaintBase & {
  kind: "strokepath";
  points: number[];
  stroke: string;
  strokeWidth: number;
};
/** one grain speckle: normalized x/y, radius in px (grainSize). */
export type GrainFieldCommand = PaintBase & { kind: "grainfield"; x: number; y: number; r: number; fill: string };
/** the draw-command IR: geometry + style + z, every numeric field finite. */
export type DrawCommand =
  | RectCommand
  | EllipseCommand
  | GradientWashCommand
  | PathCommand
  | StrokePathCommand
  | GrainFieldCommand;

/** what renderCommands answers: canvas px size, surface color, paint-ready list. */
export type RenderFrame = { width: number; height: number; background: string; commands: DrawCommand[] };
/**
 * project-ish input — the imageproject.ts fields this layer consumes, all
 * optional (an ImageProject v1 assigns to it structurally; texture accepts
 * partials so the compiler stays total over hand-built fixtures).
 */
export type RenderInput = {
  seed?: string; // scatter seed for grain/stroke/specular lanes
  palette?: Palette; // colors; default FALLBACK_PALETTE
  blocks?: Block[]; // layout cast, hero first per synthcomposition
  texture?: Partial<TextureSpec>; // surface texture; missing fields = neutral mids
  canvas?: { width?: number; height?: number }; // px; default 1080×1080 (imageproject's default)
};

export const COMMAND_BUDGET = 4096;
export const Z_BACKGROUND = 0;
export const Z_WASH = 1000;
export const Z_BLOCK = 2000;
export const Z_STROKE = 2500;
export const Z_GRAIN = 3000;
export const Z_SPECULAR = 4000;
/** default canvas px (mirrors imageproject's 1080×1080; clamped 64-8192 whole). */
export const RENDER_DEFAULT_SIZE = 1080;
const SIZE_MIN = 64;
const SIZE_MAX = 8192;
const GRAIN_AREA = 1600; // px² of surface per grain at density 1
const ANCHOR_SHARE = 0.6; // ellipse anchor radius as a share of the hero half-extent
const GRADIENT_ANGLE = 45; // wash tilt, degrees
const WASH_BLUR_MAX = 16; // turbulence × this = wash blur px
const STROKE_BLUR_MAX = 8; // strokeSoftness × this = stroke blur px
const SPECULAR_MAX = 0.6; // specular × this = highlight opacity
const STROKE_POINTS = 4; // vertices per jittered strokepath
/** wipe gesture: geometry centered in the middle-third band shifts +x by WIPE_SHIFT × strength. */
export const WIPE_BAND = { top: 1 / 3, bottom: 2 / 3 };
export const WIPE_SHIFT = 0.08;
/** shift gesture: the frame drifts by (x, y) × strength per loop-step. */
export const SHIFT_STEP = { x: 0.04, y: -0.02 };
const PULSE_DEFAULT_SCALE = 1.04; // pulseScale when the caller omits it (clamped 0.5-2)
/** neutral texture mids — the fallback for missing/damaged texture fields. */
const NEUTRAL: TextureSpec = {
  grainDensity: 0.5,
  grainSize: 3,
  grainOpacity: 0.4,
  strokeSoftness: 0.4,
  strokeWeight: 4,
  strokeJitter: 0.3,
  glazeLayers: 3,
  glazeOpacity: 0.4,
  specular: 0.3,
  turbulence: 0.3,
};
const HEX = /^#[0-9a-f]{6}$/;
const FNV_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

const clamp = (v: number, lo: number, hi: number): number => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo);
const clamp01 = (v: number): number => clamp(v, 0, 1);
/** total color guard: only well-formed hex passes; damage answers the fallback. */
const color = (hex: unknown, fallback: string): string => (typeof hex === "string" && HEX.test(hex) ? hex : fallback);
/** stacked-wash composite: glazeLayers translucent washes at glazeOpacity read as one alpha. */
const glazeComposite = (t: TextureSpec): number => 1 - (1 - t.glazeOpacity) ** t.glazeLayers;

/** clamps caller texture into TEXTURE_RANGES (neutral for missing fields); enforces the grain coupling. */
function readTexture(texture?: Partial<TextureSpec>): TextureSpec {
  const out = { ...NEUTRAL };
  for (const key of Object.keys(NEUTRAL) as Array<keyof TextureSpec>) {
    const v = texture?.[key];
    if (typeof v === "number" && Number.isFinite(v))
      out[key] = clamp(v, TEXTURE_RANGES[key].min, TEXTURE_RANGES[key].max);
  }
  out.grainOpacity = Math.min(out.grainOpacity, out.grainDensity + GRAIN_COUPLING);
  out.glazeLayers = Math.max(1, Math.round(out.glazeLayers));
  return out;
}

/** fits a block rect into the canvas: finite corners ≥ 0, extents trimmed so x+w ≤ 1. */
function fitRect(r?: Rect): Rect {
  const x = clamp01(r?.x ?? 0);
  const y = clamp01(r?.y ?? 0);
  const w = clamp(r?.w ?? 0, 0, 1 - x);
  const h = clamp(r?.h ?? 0, 0, 1 - y);
  return { x, y, w, h };
}

/** one jittered horizontal polyline across rect at a height share (strokeJitter-driven). */
function strokePath(rect: Rect, share: number, jitter: number, seed: string, salt: number): number[] {
  const vals = jitterField(`${seed}:stroke${salt}`, STROKE_POINTS * 2);
  const points: number[] = [];
  for (let i = 0; i < STROKE_POINTS; i += 1) {
    const t = i / (STROKE_POINTS - 1);
    points.push(
      clamp01(rect.x + t * rect.w + jitter * 0.02 * vals[i * 2]),
      clamp01(rect.y + rect.h * share + jitter * 0.1 * rect.h * vals[i * 2 + 1]),
    );
  }
  return points;
}

/**
 * renderCommands — the deterministic compilation: background from the palette
 * surface; the hero block becomes a gradientwash (anchor → first accent) plus
 * an ellipse anchor; cadre/field blocks become rects at the glaze composite
 * opacity (1 − (1 − glazeOpacity)^glazeLayers), edge blocks the single quiet
 * glazeOpacity layer; hero + cadre get strokepaths (width = strokeWeight,
 * blur = strokeSoftness × 8); grain speckles from grainDensity × area / 1600
 * positioned by jitterField; a white specular polygon closes the paint order.
 * Empty cast → background-only. Same input, same frame, always.
 */
export function renderCommands(input: RenderInput = {}): RenderFrame {
  const width = Math.round(
    clamp(
      Number.isFinite(input.canvas?.width) ? (input.canvas?.width as number) : RENDER_DEFAULT_SIZE,
      SIZE_MIN,
      SIZE_MAX,
    ),
  );
  const height = Math.round(
    clamp(
      Number.isFinite(input.canvas?.height) ? (input.canvas?.height as number) : RENDER_DEFAULT_SIZE,
      SIZE_MIN,
      SIZE_MAX,
    ),
  );
  const palette = input.palette ?? FALLBACK_PALETTE;
  const surface = color(palette?.surface, "#101413");
  const anchor = color(palette?.anchor, surface);
  const ink = color(palette?.ink, "#f4f1ea");
  const support = [0, 1].map((i) => color(palette?.support?.[i], anchor));
  const accent = color(palette?.accents?.[0], anchor);
  const t = readTexture(input.texture);
  const seed = typeof input.seed === "string" ? input.seed : "";
  const blocks = (Array.isArray(input.blocks) ? input.blocks : []).map((b) => ({
    rect: fitRect(b?.rect),
    role: (b?.role === "hero" || b?.role === "cadre" || b?.role === "edge" ? b.role : "field") as BlockRole,
  }));
  const heroIndex = blocks.findIndex((b) => b.role === "hero");
  const hero =
    heroIndex >= 0 && blocks[heroIndex].rect.w > 0 && blocks[heroIndex].rect.h > 0 ? blocks[heroIndex] : undefined;
  const glaze = glazeComposite(t);
  const commands: DrawCommand[] = [
    { kind: "rect", x: 0, y: 0, w: 1, h: 1, fill: surface, opacity: 1, blur: 0, z: Z_BACKGROUND },
  ];
  const fills: DrawCommand[] = [];
  const strokes: DrawCommand[] = [];
  if (hero) {
    fills.push({
      kind: "ellipse",
      cx: hero.rect.x + hero.rect.w / 2,
      cy: hero.rect.y + hero.rect.h / 2,
      rx: (hero.rect.w / 2) * ANCHOR_SHARE,
      ry: (hero.rect.h / 2) * ANCHOR_SHARE,
      fill: accent,
      opacity: glaze,
      blur: 0,
      z: Z_BLOCK,
      role: "hero",
    });
    strokes.push({
      kind: "strokepath",
      points: strokePath(hero.rect, 1 / 3, t.strokeJitter, seed, 0),
      stroke: ink,
      strokeWidth: t.strokeWeight,
      opacity: 1,
      blur: STROKE_BLUR_MAX * t.strokeSoftness,
      z: Z_STROKE,
      role: "hero",
    });
  }
  blocks.forEach((b, i) => {
    if (i === heroIndex || b.rect.w <= 0 || b.rect.h <= 0) return;
    fills.push({
      kind: "rect",
      x: b.rect.x,
      y: b.rect.y,
      w: b.rect.w,
      h: b.rect.h,
      fill: b.role === "edge" ? support[i % 2] : support[(i + 1) % 2],
      opacity: b.role === "edge" ? t.glazeOpacity : glaze,
      blur: 0,
      z: Z_BLOCK + i,
      role: b.role,
    });
    if (b.role === "cadre")
      strokes.push({
        kind: "strokepath",
        points: strokePath(b.rect, 0.5, t.strokeJitter, seed, i),
        stroke: ink,
        strokeWidth: t.strokeWeight,
        opacity: 1,
        blur: STROKE_BLUR_MAX * t.strokeSoftness,
        z: Z_STROKE + i,
        role: b.role,
      });
  });
  const wash: DrawCommand[] = hero
    ? [
        {
          kind: "gradientwash",
          x: hero.rect.x,
          y: hero.rect.y,
          w: hero.rect.w,
          h: hero.rect.h,
          angle: GRADIENT_ANGLE,
          from: anchor,
          to: accent,
          opacity: 1,
          blur: WASH_BLUR_MAX * t.turbulence,
          z: Z_WASH,
          role: "hero",
        },
      ]
    : [];
  // grain: count = ceil(density × area / 1600), truncated to the budget (one slot reserved for specular)
  const grainBudget = Math.max(0, COMMAND_BUDGET - commands.length - wash.length - fills.length - strokes.length - 1);
  const grainCount =
    blocks.length > 0 ? Math.min(grainBudget, Math.ceil((t.grainDensity * width * height) / GRAIN_AREA)) : 0;
  const field = jitterField(`${seed}:grain`, grainCount * 2);
  const grains: DrawCommand[] = [];
  for (let i = 0; i < grainCount; i += 1)
    grains.push({
      kind: "grainfield",
      x: (field[i * 2] + 1) / 2,
      y: (field[i * 2 + 1] + 1) / 2,
      r: t.grainSize,
      fill: ink,
      opacity: t.grainOpacity,
      blur: 0,
      z: Z_GRAIN,
    });
  const specular: DrawCommand[] = [];
  if (hero) {
    const vals = jitterField(`${seed}:spec`, 10);
    const points: number[] = [];
    for (let i = 0; i < 5; i += 1)
      points.push(
        clamp01(hero.rect.x + ((vals[i * 2] + 1) / 2) * hero.rect.w),
        clamp01(hero.rect.y + (0.1 + 0.3 * ((vals[i * 2 + 1] + 1) / 2)) * hero.rect.h),
      );
    specular.push({
      kind: "path",
      points,
      fill: "#ffffff",
      opacity: SPECULAR_MAX * t.specular,
      blur: 0,
      z: Z_SPECULAR,
      role: "hero",
    });
  }
  commands.push(...wash, ...fills, ...strokes, ...grains, ...specular);
  return { width, height, background: surface, commands };
}

// ---- animation hooks: one keyframe → a fresh command list (never mutating) ----

/** mean (x, y) of a flat point list — the center perturbations scale about. */
function meanPair(points: number[]): [number, number] {
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (let i = 0; i + 1 < points.length; i += 2) {
    sx += points[i];
    sy += points[i + 1];
    n += 1;
  }
  return n > 0 ? [sx / n, sy / n] : [0.5, 0.5];
}

/** vertical center of one command's geometry (wipe band membership). */
function centerY(c: DrawCommand): number {
  if (c.kind === "rect" || c.kind === "gradientwash") return c.y + c.h / 2;
  if (c.kind === "ellipse") return c.cy;
  if (c.kind === "path" || c.kind === "strokepath") return meanPair(c.points)[1];
  return c.y;
}

/** translates one command's geometry by (dx, dy) — the copy carries new coords. */
function translate(c: DrawCommand, dx: number, dy: number): DrawCommand {
  if (c.kind === "rect" || c.kind === "gradientwash") return { ...c, x: c.x + dx, y: c.y + dy };
  if (c.kind === "ellipse") return { ...c, cx: c.cx + dx, cy: c.cy + dy };
  if (c.kind === "path" || c.kind === "strokepath")
    return { ...c, points: c.points.map((v, i) => (i % 2 === 0 ? v + dx : v + dy)) };
  return { ...c, x: c.x + dx, y: c.y + dy };
}

/** scales one command's geometry about its own center by s (grain keeps its texture-fixed radius). */
function scale(c: DrawCommand, s: number): DrawCommand {
  if (c.kind === "rect" || c.kind === "gradientwash") {
    const cx = c.x + c.w / 2;
    const cy = c.y + c.h / 2;
    return { ...c, x: cx - (cx - c.x) * s, y: cy - (cy - c.y) * s, w: c.w * s, h: c.h * s };
  }
  if (c.kind === "ellipse") return { ...c, rx: c.rx * s, ry: c.ry * s };
  if (c.kind === "path" || c.kind === "strokepath") {
    const [cx, cy] = meanPair(c.points);
    return { ...c, points: c.points.map((v, i) => (i % 2 === 0 ? cx + (v - cx) * s : cy + (v - cy) * s)) };
  }
  return { ...c };
}

/**
 * renderKeyframePerturbation — the animation hook: compiles one motion
 * keyframe (synthmotion's MotionKeyframe shape) into a NEW command list; the
 * input is never mutated. pulse scales the targeted roles' geometry about
 * each command's own center by 1 + (pulseScale − 1) × strength (targets empty
 * = the hero; pulseScale clamped 0.5-2, default 1.04), so strength 1 is
 * exactly pulseScale and strength 0 is the identity. wipe translates the
 * documented WIPE_BAND middle third (+x, WIPE_SHIFT × strength); shift drifts
 * every non-background command by SHIFT_STEP × strength; reveal multiplies
 * non-background opacity by strength. The background (z ≤ Z_BACKGROUND) and
 * grain never move; wiped geometry may leave [0,1] by at most the shift.
 * Unknown kinds answer a shallow copy.
 */
export function renderKeyframePerturbation(
  commands: readonly DrawCommand[],
  keyframe: Pick<MotionKeyframe, "kind" | "strength" | "targets"> & { tMs?: number },
  pulseScale = PULSE_DEFAULT_SCALE,
): DrawCommand[] {
  const list: readonly DrawCommand[] = Array.isArray(commands) ? commands : [];
  const strength = clamp01(keyframe?.strength ?? 0);
  if (keyframe?.kind === "pulse") {
    const s = 1 + (clamp(pulseScale, 0.5, 2) - 1) * strength;
    const roles = new Set<string>(keyframe.targets?.length ? keyframe.targets : ["hero"]);
    return list.map((c) => (c.role !== undefined && roles.has(c.role) ? scale(c, s) : c));
  }
  if (keyframe?.kind === "wipe") {
    const dx = WIPE_SHIFT * strength;
    return list.map((c) =>
      c.z > Z_BACKGROUND && c.kind !== "grainfield" && centerY(c) >= WIPE_BAND.top && centerY(c) <= WIPE_BAND.bottom
        ? translate(c, dx, 0)
        : c,
    );
  }
  if (keyframe?.kind === "shift")
    return list.map((c) => (c.z > Z_BACKGROUND ? translate(c, SHIFT_STEP.x * strength, SHIFT_STEP.y * strength) : c));
  if (keyframe?.kind === "reveal")
    return list.map((c) => (c.z > Z_BACKGROUND ? { ...c, opacity: c.opacity * strength } : c));
  return [...list];
}

// canonical signature fields per kind (z/opacity/blur always included)
const SIG_FIELDS: Record<DrawCommand["kind"], string[]> = {
  rect: ["x", "y", "w", "h", "fill"],
  ellipse: ["cx", "cy", "rx", "ry", "fill"],
  gradientwash: ["x", "y", "w", "h", "angle", "from", "to"],
  path: ["points", "fill"],
  strokepath: ["points", "stroke", "strokeWidth"],
  grainfield: ["x", "y", "r", "fill"],
};

/** one field as a fixed-precision canonical string (4 decimals, order-stable). */
function sigValue(c: DrawCommand, key: string): string {
  const v = (c as unknown as Record<string, unknown>)[key];
  if (Array.isArray(v)) return (v as number[]).map((n) => n.toFixed(4)).join("+");
  return typeof v === "number" ? v.toFixed(4) : String(v);
}

/**
 * renderThumbnailSignature — a short stable hash (8 hex chars, fnv-1a) of the
 * canonical command serialization (kind, z, opacity, blur, then the kind's
 * fields at 4-decimal precision). Same commands → same signature across runs
 * and processes; any geometry/color/order change moves it (test/CI diff hook).
 */
export function renderThumbnailSignature(commands: readonly DrawCommand[]): string {
  let lane = FNV_BASIS;
  const list: readonly DrawCommand[] = Array.isArray(commands) ? commands : [];
  for (const c of list) {
    for (const key of ["kind", "z", "opacity", "blur", ...SIG_FIELDS[c.kind]]) {
      const text = `${key}=${sigValue(c, key)}`;
      for (let i = 0; i < text.length; i += 1)
        lane = Math.imul((lane ^ (text.charCodeAt(i) & 0xff)) >>> 0, FNV_PRIME) >>> 0;
    }
  }
  return (lane >>> 0).toString(16).padStart(8, "0");
}
