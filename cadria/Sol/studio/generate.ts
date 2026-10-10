/**
 * generate.ts — the GENERATION layer of the studio: fold the analyzed
 * descriptor, the selected style and the controls into one ImageProject v1
 * (the buildImageProject chain the gateway's /api/generate runs) and compile
 * its deterministic render frame. The style fold is the render-wave concern
 * the gateway deliberately leaves out (gateway.ts: "applyStyleBias stays a
 * render-wave concern — the ImageProject carries no bias block"), applied
 * here with documented, deterministic mappings BEFORE the project is built:
 *   palette — paletteBias lightness/chroma/warmth nudge the oklch triples of
 *             anchor/support/accents (±0.12 l, chroma ×0.65–1.35, hue ±24°
 *             warm-positive); the ink+surface AA-guarded pair is untouched;
 *   blocks  — the hero rect is pulled toward the style's heroScale share
 *             (factor clamped 0.6–1.6, recentered inside the canvas);
 *   texture — applyStyleBias folds synthTexture(descriptor) with the style's
 *             texture bias inside TEXTURE_RANGES (in-contract, clamped);
 *   motion  — keyframe strengths scale by the style tempo, the per-loop
 *             drift by the drift bias (×0.25–1.75).
 * The composition cast itself stays descriptor-driven (synthcomposition),
 * exactly like the gateway; the style never invents blocks.
 * Beside generation this module owns the export helpers (svg blob, png via
 * OffscreenCanvas with a graceful no-op) and the dual-mode gallery handoff
 * (probe /api/health with an 800 ms AbortController budget → gateway POST,
 * else the caller records an in-memory session save — never browser storage).
 */

import type { AudioDescriptor } from "../../audioattributes.ts";
import type { AnalysisReport } from "../../audiopipeline.ts";
import { buildImageProject, type ImageProject } from "../../imageproject.ts";
import { type RenderFrame, renderCommands } from "../../imagerender.ts";
import { applyStyleBias, type StyleSpec, styleByName } from "../../imagestyles.ts";
import { type Block, compositionBlocks, rhythmScatter } from "../../synthcomposition.ts";
import { type MotionSpec, synthMotion } from "../../synthmotion.ts";
import {
  type OklchTriple,
  oklchToSrgbHex,
  type Palette,
  srgbHexToOklch,
  synthPalette,
  wrapHue,
} from "../../synthpalette.ts";
import { synthTexture } from "../../synthtexture.ts";

/** the studio controls one generation run reads. */
export type StudioControls = { styleName: string; width: number; height: number; seed: string };

/** one finished generation: the frozen project, its compiled frame + motion, the style applied. */
export type StudioGeneration = { project: ImageProject; frame: RenderFrame; motion: MotionSpec; style: StyleSpec };

/** one session save the export row records (gateway post or local fallback). */
export type SessionSave = {
  id: string;
  mode: "gateway" | "local";
  style: string;
  seed: string;
  bpm: number;
  at: string;
};

// ---- documented style-fold constants (see module header) ----

const LIGHTNESS_SPAN = 0.12; // paletteBias.lightness −1…1 → oklch l ±0.12
const CHROMA_SPAN = 0.35; // paletteBias.chroma −1…1 → chroma × 0.65…1.35
const WARMTH_DEGREES = 24; // paletteBias.warmth −1…1 → hue ±24°, positive warmer
const DRIFT_SPAN = 1.5; // drift bias 0…1 → drift × 0.25…1.75
const HERO_FACTOR_MIN = 0.6; // hero rescale factor floor
const HERO_FACTOR_MAX = 1.6; // hero rescale factor ceiling

/** one oklch triple through the style's palette bias, clamped to the legal oklch domain. */
function tintTriple(triple: OklchTriple, lightness: number, chroma: number, warmth: number): OklchTriple {
  return {
    l: Math.min(0.98, Math.max(0.02, triple.l + lightness * LIGHTNESS_SPAN)),
    c: Math.min(0.33, Math.max(0, triple.c * (1 + chroma * CHROMA_SPAN))),
    h: wrapHue(triple.h + warmth * WARMTH_DEGREES),
  };
}

/** tintedPalette — the palette bias folded into anchor/support/accents; ink+surface stay the guarded pair. */
function tintedPalette(palette: Palette, style: StyleSpec): Palette {
  const { lightness, chroma, warmth } = style.paletteBias;
  const anchor = tintTriple(palette.oklch.anchor, lightness, chroma, warmth);
  const accentTriples = palette.oklch.accents.map((triple) => tintTriple(triple, lightness, chroma, warmth));
  const accents = accentTriples.map((triple, index) =>
    triple ? oklchToSrgbHex(triple.l, triple.c, triple.h) : (palette.accents[index] ?? palette.anchor),
  );
  const support = palette.support.map((hex) => {
    const recovered = srgbHexToOklch(hex);
    if (!recovered) return hex;
    const triple = tintTriple(recovered, lightness, chroma, warmth);
    return oklchToSrgbHex(triple.l, triple.c, triple.h);
  });
  return {
    ...palette,
    anchor: oklchToSrgbHex(anchor.l, anchor.c, anchor.h),
    support,
    accents,
    oklch: { anchor, accents: accentTriples },
  };
}

/** rescaledHero — pulls the hero rect's width share toward the style's heroScale, recentered inside the canvas. */
function rescaledHero(blocks: readonly Block[], heroScale: number): Block[] {
  const index = blocks.findIndex((block) => block.role === "hero");
  const hero = index >= 0 ? blocks[index] : undefined;
  if (!hero || hero.rect.w <= 0 || hero.rect.h <= 0 || !Number.isFinite(heroScale) || heroScale <= 0) {
    return [...blocks];
  }
  const factor = Math.min(HERO_FACTOR_MAX, Math.max(HERO_FACTOR_MIN, heroScale / hero.rect.w));
  const w = Math.min(1, Math.max(0.05, hero.rect.w * factor));
  const h = Math.min(1, Math.max(0.05, hero.rect.h * factor));
  const x = Math.min(1 - w, Math.max(0, hero.rect.x + hero.rect.w / 2 - w / 2));
  const y = Math.min(1 - h, Math.max(0, hero.rect.y + hero.rect.h / 2 - h / 2));
  const out = [...blocks];
  out[index] = { ...hero, rect: { x, y, w, h } };
  return out;
}

/** foldedMotion — keyframe strengths × the style tempo, per-loop drift × the drift gain. */
function foldedMotion(motion: MotionSpec, strengthScale: number, driftScale: number): MotionSpec {
  const gain = 0.25 + DRIFT_SPAN * (Number.isFinite(driftScale) ? Math.min(1, Math.max(0, driftScale)) : 0);
  return {
    ...motion,
    keyframes: motion.keyframes.map((keyframe) => ({
      ...keyframe,
      strength: Math.min(1, Math.max(0, keyframe.strength * (Number.isFinite(strengthScale) ? strengthScale : 1))),
    })),
    drift: {
      x: motion.drift.x * gain,
      y: motion.drift.y * gain,
      rotation: motion.drift.rotation * gain,
    },
  };
}

/**
 * projectDescriptor — the project bundle's audio replica. buildImageProject
 * validates the descriptor's audio scalars against the documented
 * ProjectAudio contract (bpm 20-1000); pulse-less sources (a noise wall,
 * silence) analyze to bpm under the band, so ONLY the bundle's scalar rides
 * a clamped replica — the readout, the motion fold and every other spec
 * keep the true analyzed numbers, and synthMotion already rides its own
 * canonical 70-160 bpm band for the loop.
 */
function projectDescriptor(descriptor: AudioDescriptor): AudioDescriptor {
  const scalar = { ...descriptor.scalar };
  const raw = scalar.bpm;
  scalar.bpm = Number.isFinite(raw) ? Math.min(1000, Math.max(20, raw)) : 120;
  return { ...descriptor, scalar };
}

/**
 * generateStudioProject — the one-call generation chain: style → bias fold →
 * palette/blocks/texture/motion → buildImageProject (validated + frozen) →
 * renderCommands over the project's own fields. Deterministic: same report,
 * controls and style → bit-identical commands and signature (the project's
 * createdAt ISO stamp is the documented wall-clock field, excluded from
 * determinism equality like the gateway's own records).
 */
export function generateStudioProject(descriptor: AudioDescriptor, controls: StudioControls): StudioGeneration {
  const style = styleByName(controls.styleName);
  const biased = applyStyleBias({ texture: synthTexture(descriptor) }, style);
  const palette = tintedPalette(synthPalette(descriptor), style);
  const blocks = rescaledHero(
    rhythmScatter(descriptor, compositionBlocks(descriptor)),
    style.compositionBias.heroScale,
  );
  const motion = foldedMotion(
    synthMotion(
      descriptor,
      blocks.map((block) => block.role),
    ),
    biased.strength,
    biased.drift,
  );
  const project = buildImageProject({
    descriptor: projectDescriptor(descriptor),
    seed: controls.seed.trim().length > 0 ? controls.seed.trim() : descriptor.seed,
    style: style.name,
    palette,
    blocks,
    texture: biased.texture,
    motion,
    width: controls.width,
    height: controls.height,
  });
  const frame = renderCommands({
    seed: project.seed,
    palette: project.palette,
    blocks: project.blocks,
    texture: project.texture,
    canvas: { width: project.canvas.width, height: project.canvas.height },
  });
  return { project, frame, motion: project.motion, style };
}

// ---- export helpers ----

/** downloadBlob — triggers a client-side download of one artifact (blob URL + anchor click). */
export function downloadBlob(name: string, payload: BlobPart, type: string): void {
  const url = URL.createObjectURL(new Blob([payload], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** pngSupported — the OffscreenCanvas + createImageBitmap presence probe behind the graceful no-op. */
export function pngSupported(): boolean {
  return typeof OffscreenCanvas === "function" && typeof createImageBitmap === "function";
}

/**
 * pngFromSvg — rasterizes the svg master through OffscreenCanvas.drawImage at
 * the project size. Any failure (no OffscreenCanvas, decode refusal, context
 * loss) answers null — the caller keeps the svg download and says so quietly.
 */
export async function pngFromSvg(svg: string, width: number, height: number): Promise<Blob | null> {
  if (!pngSupported()) return null;
  try {
    const source = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const bitmap = await createImageBitmap(source);
    try {
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext("2d");
      if (!context) return null;
      context.drawImage(bitmap, 0, 0, width, height);
      return await canvas.convertToBlob({ type: "image/png" });
    } finally {
      bitmap.close();
    }
  } catch {
    return null;
  }
}

// ---- the dual-mode gallery handoff ----

/**
 * probeGateway — answers true only when /api/health replies { ok: true }
 * within the budget (default 800 ms, an AbortController cut). Any refusal,
 * timeout or network error answers false — the caller records locally.
 */
export async function probeGateway(timeoutMs = 800): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch("/api/health", { signal: controller.signal });
    if (!response.ok) return false;
    const payload: unknown = await response.json();
    return typeof payload === "object" && payload !== null && (payload as { ok?: unknown }).ok === true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * saveToGateway — POSTs { report, style, seed } to /api/generate (the report
 * carries the descriptor the gateway resolves) and answers the projectId.
 * Non-2xx or a malformed envelope throws with the gateway's own message.
 */
export async function saveToGateway(report: AnalysisReport, styleName: string, seed: string): Promise<string> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ report, style: styleName, seed }),
  });
  const payload: unknown = await response.json().catch(() => null);
  const box = (payload ?? {}) as { projectId?: unknown; error?: unknown };
  if (!response.ok || typeof box.projectId !== "string") {
    const detail = typeof box.error === "string" ? box.error : `gateway answered ${response.status}`;
    throw new Error(`gateway save failed: ${detail}`);
  }
  return box.projectId;
}

/** reseededSeed — the deterministic reseed lane: a nonce folds into the base seed (no RNG anywhere). */
export function reseededSeed(base: string, nonce: number): string {
  const clean = base.length > 0 ? base : "cadria";
  return `${clean}::r${Math.max(1, Math.floor(nonce))}`;
}
