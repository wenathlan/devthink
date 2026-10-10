// # imageexport — the export & integration layer of the cadria audio→image
// wave (module b8, the wave-2 integrator). It turns the fused wave-2 stack —
// synthpalette (b1), synthcomposition (b2), synthtexture (b3), synthmotion
// (b4) — into shippable artifacts: one ExportPlan per format with a documented
// byte-estimate model, the svg vector master, the animation manifest (≤128
// deterministic frame signatures) and one exportBundle that always ships the
// svg master plus every requested raster/animation format.
//
// Integration seams (wave-2 status): b5 imagestyles, b6 imageproject and b7
// imagerender had not landed when this module was written. It therefore
// consumes a structural ExportProject (id + descriptor + palette + blocks +
// texture + motion) — exactly the slice of the future ImageProject the export
// wave needs — and toExportProject normalizes the stack, re-deriving missing
// or damaged pieces from the descriptor. renderProjectSvg and
// thumbnailSignature stand in for imagerender.renderSvg / its frame
// perturbation at the same call shape, so swapping the sibling in later is a
// one-line change. Every byte is deterministic: no Math.random, no Date, no
// deps — same project + options → deep-equal artifacts, digests included.
//
// Byte-estimate model (per format): svg = svg.length (master rendered and
// measured; ASCII-only by construction, chars = bytes); png =
// ceil(w·h·4·PNG_COMPRESS_FACTOR); webm = ceil(frames·w·h·WEBM_BITS_PER_PIXEL
// / 8); gif = ceil(frames·w·h·GIF_BITS_PER_PIXEL / 8) + GIF_OVERHEAD_BYTES;
// frames = min(MANIFEST_FRAME_CAP, max(2, round(loopMs·fps/1000))).
//
// Error taxonomy (ExportError.code): "export-format" (unknown format, bad fps,
// no format requested), "export-loop-required" (webm/gif without a loopMs > 0),
// "export-size" (png off the documented ladder, any size outside [64, 4096]),
// "export-empty" (blank id, unreadable palette, empty block cast).

import type { AudioDescriptor } from "./audioattributes.ts";
import type { Block } from "./synthcomposition.ts";
import { compositionBlocks } from "./synthcomposition.ts";
import type { MotionSpec } from "./synthmotion.ts";
import { synthMotion } from "./synthmotion.ts";
import type { Palette } from "./synthpalette.ts";
import { synthPalette } from "./synthpalette.ts";
import type { TextureSpec } from "./synthtexture.ts";
import { sanitizeTexture, synthTexture } from "./synthtexture.ts";

/** every artifact format the export wave can plan and bundle. */
export type ExportFormat = "svg" | "png" | "webm" | "gif";
/** the documented error taxonomy — one code per refusal reason. */
export type ExportErrorCode = "export-format" | "export-loop-required" | "export-size" | "export-empty";
/** the one error type this module throws, tagged with its taxonomy code. */
export class ExportError extends Error {
  code: ExportErrorCode;
  constructor(code: ExportErrorCode, message: string) {
    super(message);
    this.name = "ExportError";
    this.code = code;
  }
}
/** the png size ladder — the only raster sizes a png plan accepts (square pairs). */
export const PNG_SIZE_LADDER: readonly { label: string; width: number; height: number }[] = [
  { label: "1080", width: 1080, height: 1080 },
  { label: "1440", width: 1440, height: 1440 },
  { label: "2160", width: 2160, height: 2160 },
];
/** fps rungs the animation formats accept — anything else refuses (export-format). */
export const ANIMATION_FPS: readonly number[] = [24, 30, 60];
/** hard cap on planned and manifested frames — a loop never ships more. */
export const MANIFEST_FRAME_CAP = 128;
// free-format viewport bounds (svg/webm/gif width & height) and the default raster.
const SIZE_MIN = 64;
const SIZE_MAX = 4096;
const DEFAULT_SIZE = 1080;
// byte-estimate model constants — documented in the module header table.
export const PNG_COMPRESS_FACTOR = 0.35; // png: deflate share of the raw RGBA frame
export const WEBM_BITS_PER_PIXEL = 0.08; // webm: bits per pixel per frame
export const GIF_BITS_PER_PIXEL = 0.12; // gif: indexed bits per pixel per frame
export const GIF_OVERHEAD_BYTES = 1024; // gif: header + color table

/**
 * the plan one export format follows. fps/loopMs/frames are null on static
 * formats (svg/png); qualityNote is the documented per-format quality
 * contract; estimatedBytes follows the documented module-header model.
 */
export type ExportPlan = {
  format: ExportFormat;
  width: number;
  height: number;
  fps: number | null;
  loopMs: number | null;
  frames: number | null;
  qualityNote: string;
  estimatedBytes: number;
};
/** one shippable file in a bundle: name, kind, fnv1a digest of its bytes/sidecar. */
export type ExportArtifact = { filename: string; kind: ExportFormat; digest: string };
/** the bundle answer: the primary (first requested) plan plus every artifact. */
export type ExportBundle = { artifacts: ExportArtifact[]; plan: ExportPlan };
/** one manifest frame: even-spread loop time plus the deterministic signature. */
export type ManifestFrame = { index: number; tMs: number; signature: string };
/** the animation handoff the render/encode wave can trust to be stable. */
export type AnimationManifest = { loopMs: number; fps: number; frames: ManifestFrame[] };
/** the per-frame camera state the animation signatures ride. */
export type FramePerturbation = { scale: number; dx: number; dy: number; rotate: number; phase: number };
/**
 * the structural project slice this module consumes (the future ImageProject
 * satisfies it as-is): id names artifacts, descriptor is the fused contract,
 * palette/blocks/texture/motion are the wave-2 layer outputs.
 */
export type ExportProject = {
  id: string;
  descriptor: AudioDescriptor;
  palette: Palette;
  blocks: Block[];
  texture: TextureSpec;
  motion: MotionSpec;
};
const FNV_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const QUALITY_NOTES: Record<ExportFormat, string> = {
  svg: "vector master — lossless, scale-free, ASCII artifact",
  png: "raster 8-bit RGBA single frame — lossless deflate at ladder size",
  webm: "animated raster, vp9-class estimate — lossy timed frames",
  gif: "256-color indexed loop — lossy palette animation",
};
/** clamps into 0-1; non-finite answers 0 — the house total read. */
function clamp01(x: number): number {
  return Number.isFinite(x) ? (x < 0 ? 0 : x > 1 ? 1 : x) : 0;
}
/** total number read: finite numbers pass, everything else answers the fallback. */
function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
/** fixed-decimal spelling with -0 scrubbed — every number entering an artifact passes here. */
function fx(v: number, digits: number): string {
  const out = Number.isFinite(v) ? v.toFixed(digits) : (0).toFixed(digits);
  return out.startsWith("-") && Number(out) === 0 ? out.slice(1) : out;
}
/** fnv1aHex — the module digest: fnv-1a over both bytes of every UTF-16 code unit → 8 lowercase hex chars. */
export function fnv1aHex(text: string): string {
  let lane = FNV_BASIS;
  const s = typeof text === "string" ? text : "";
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    lane = Math.imul((Math.imul((lane ^ (c & 0xff)) >>> 0, FNV_PRIME) ^ ((c >>> 8) & 0xff)) >>> 0, FNV_PRIME) >>> 0;
  }
  return lane.toString(16).padStart(8, "0");
}
/** xml-escapes the id for title/aria text inside the svg artifact. */
function esc(s: string): string {
  return s.replace(/[<>&"]/g, (c) => (c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : "&quot;"));
}
/** palette-shaped: the minimal contract the renderer and signatures trust. */
function isPalette(p: unknown): p is Palette {
  const b = p as Palette;
  return (
    b !== null &&
    typeof b === "object" &&
    typeof b.anchor === "string" &&
    typeof b.surface === "string" &&
    typeof b.ink === "string" &&
    Array.isArray(b.accents) &&
    b.accents.length > 0
  );
}

/** refuses to ship blank ids, unreadable palettes or an empty cast (export-empty). */
function assertShippable(project: unknown): asserts project is ExportProject {
  const p = project as ExportProject;
  if (!p || typeof p !== "object") throw new ExportError("export-empty", "project is not an object");
  if (typeof p.id !== "string" || p.id.trim().length === 0)
    throw new ExportError("export-empty", "project id is blank — nothing to name the artifact");
  if (!isPalette(p.palette)) throw new ExportError("export-empty", "project carries no readable palette");
  if (!Array.isArray(p.blocks) || p.blocks.length === 0)
    throw new ExportError("export-empty", "project has an empty block cast — nothing to paint");
}

/**
 * toExportProject — the integration seam for the mapping wave: normalizes the
 * wave-2 stack into the structural project this module consumes; missing or
 * damaged pieces re-derive from the descriptor (palette via synthPalette,
 * blocks via compositionBlocks, texture via synthTexture sanitized, motion via
 * synthMotion over the block roles); blank id → export-empty.
 */
export function toExportProject(
  id: string,
  parts: {
    descriptor: AudioDescriptor;
    palette?: Palette;
    blocks?: Block[];
    texture?: TextureSpec;
    motion?: MotionSpec;
  },
): ExportProject {
  if (typeof id !== "string" || id.trim().length === 0)
    throw new ExportError("export-empty", "project id is blank — nothing to name the artifact");
  const box = parts && typeof parts === "object" ? parts : ({} as typeof parts),
    d = (
      box.descriptor && typeof box.descriptor === "object"
        ? box.descriptor
        : { version: 1, seed: "", vector: [], scalar: {} }
    ) as AudioDescriptor;
  const blocks: Block[] = Array.isArray(box.blocks) && box.blocks.length > 0 ? box.blocks : compositionBlocks(d);
  return {
    id,
    descriptor: d,
    palette: isPalette(box.palette) ? box.palette : synthPalette(d),
    blocks,
    texture: sanitizeTexture(box.texture ?? synthTexture(d)),
    motion:
      box.motion ??
      synthMotion(
        d,
        blocks.map((b) => b.role),
      ),
  };
}
/** role → fill: hero wears the anchor, cadre cycles accents, field/edge split the support pair. */
function blockFill(palette: Palette, role: string, index: number): string {
  if (role === "hero") return palette.anchor;
  if (role === "cadre") return palette.accents[index % palette.accents.length];
  if (role === "edge") return palette.support[1] ?? palette.support[0] ?? palette.anchor;
  return palette.support[0] ?? palette.anchor;
}

/**
 * renderProjectSvg — the local stand-in for imagerender.renderSvg (b7 had not
 * landed; same call shape, one-line swap later). Deterministic vector master:
 * surface ground, one glaze wash when the texture stacks layers, the block cast
 * painted role-first (hero stroked in ink at the texture stroke weight), an
 * optional feTurbulence grain filter. Geometry is normalized 0-1 scaled into
 * the w×h viewport at 2-dp precision, stable forever.
 */
export function renderProjectSvg(project: ExportProject, width: number, height: number): string {
  const w = Math.max(1, Math.round(num(width, DEFAULT_SIZE)));
  const h = Math.max(1, Math.round(num(height, w)));
  const p = project.palette,
    t = project.texture;
  const grain = fnv1aHex(`${project.id}:grain`);
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="cadria ${esc(project.id)}">`,
    `<title>${esc(project.id)}</title><desc>cadria audio-to-image master — ${project.blocks.length} blocks</desc>`,
    `<rect width="${w}" height="${h}" fill="${p.surface}"/>`,
  ];
  if (t.glazeLayers >= 2)
    parts.push(`<rect width="${w}" height="${h}" fill="${p.anchor}" opacity="${fx(t.glazeOpacity * 0.25, 2)}"/>`);
  const heroStroke = ` stroke="${p.ink}" stroke-width="${fx(t.strokeWeight * (w / DEFAULT_SIZE), 2)}"`;
  project.blocks.forEach((b, i) => {
    parts.push(
      `<rect x="${fx(b.rect.x * w, 2)}" y="${fx(b.rect.y * h, 2)}" width="${fx(b.rect.w * w, 2)}" height="${fx(b.rect.h * h, 2)}" fill="${blockFill(p, b.role, i)}" opacity="${fx(t.glazeOpacity, 2)}"${b.role === "hero" ? heroStroke : ""}/>`,
    );
  });
  if (t.grainDensity > 0) {
    parts.push(`<g filter="url(#${grain})"></g><defs><filter id="${grain}" x="0" y="0" width="100%" height="100%">`);
    parts.push(
      `<feTurbulence type="fractalNoise" baseFrequency="${fx(0.08 + 0.24 * t.grainDensity, 3)}" numOctaves="3" seed="${Number.parseInt(grain, 16) % 65536}" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 ${fx(t.grainOpacity, 3)} 0"/></filter></defs>`,
    );
  }
  parts.push("</svg>");
  return parts.join("");
}
/** buildSvgArtifact — the always-shipped vector master: renders at the requested
 *  viewport (default 1080, bounded [64, 4096] else export-size), names it `${id}.svg`. */
export function buildSvgArtifact(
  project: ExportProject,
  size?: { width?: number; height?: number },
): { filename: string; bytes: string; digest: string } {
  assertShippable(project);
  const width = clampSize(size?.width ?? DEFAULT_SIZE, "width");
  const height = clampSize(size?.height ?? width, "height");
  const bytes = renderProjectSvg(project, width, height);
  return { filename: `${project.id}.svg`, bytes, digest: fnv1aHex(bytes) };
}
/** integer size inside the documented [64, 4096] bounds, else export-size. */
function clampSize(v: unknown, what: string): number {
  const n = num(v, NaN);
  if (!Number.isInteger(n) || n < SIZE_MIN || n > SIZE_MAX)
    throw new ExportError("export-size", `${what} must be an integer in [${SIZE_MIN}, ${SIZE_MAX}] — got ${String(v)}`);
  return n;
}

/** png viewport: height rides the width rung; the pair must sit on the documented ladder. */
function pngSize(options: { width?: number; height?: number }): { width: number; height: number } {
  const w = options.width ?? 1080;
  const h = options.height ?? w;
  const rung = PNG_SIZE_LADDER.find((r) => r.width === w && r.height === h);
  if (!rung)
    throw new ExportError(
      "export-size",
      `png sizes must be a ladder pair ${PNG_SIZE_LADDER.map((r) => r.label).join("/")} — got ${String(w)}x${String(h)}`,
    );
  return { width: rung.width, height: rung.height };
}
/** the documented frame arithmetic: even spread, at least 2, capped at MANIFEST_FRAME_CAP. */
function frameCount(loopMs: number, fps: number): number {
  return Math.min(MANIFEST_FRAME_CAP, Math.max(2, Math.round((loopMs * fps) / 1000)));
}
/**
 * exportPlan — validates the request against the documented contract: svg/png
 * are single-frame, png must sit exactly on PNG_SIZE_LADDER (square
 * 1080/1440/2160), webm/gif need an fps rung and a loopMs > 0; the byte
 * estimate follows the documented module-header model.
 */
export function exportPlan(
  project: ExportProject,
  options: { format: ExportFormat; width?: number; height?: number; fps?: number; loopMs?: number },
): ExportPlan {
  assertShippable(project);
  const format = options?.format;
  if (format !== "svg" && format !== "png" && format !== "webm" && format !== "gif")
    throw new ExportError(
      "export-format",
      `unknown export format ${JSON.stringify(format)} — expected svg|png|webm|gif`,
    );
  const view =
    format === "png"
      ? pngSize(options)
      : {
          width: clampSize(options?.width ?? DEFAULT_SIZE, "width"),
          height: clampSize(options?.height ?? options?.width ?? DEFAULT_SIZE, "height"),
        };
  if (format === "svg" || format === "png") {
    return {
      format,
      width: view.width,
      height: view.height,
      fps: null,
      loopMs: null,
      frames: null,
      qualityNote: QUALITY_NOTES[format],
      estimatedBytes:
        format === "svg"
          ? renderProjectSvg(project, view.width, view.height).length
          : Math.ceil(view.width * view.height * 4 * PNG_COMPRESS_FACTOR),
    };
  }
  const fps = num(options?.fps, 30);
  if (!ANIMATION_FPS.includes(fps))
    throw new ExportError(
      "export-format",
      `animation fps must be one of ${ANIMATION_FPS.join("/")} — got ${String(options?.fps)}`,
    );
  const loopMs = options?.loopMs;
  if (!(typeof loopMs === "number" && Number.isFinite(loopMs) && loopMs > 0))
    throw new ExportError(
      "export-loop-required",
      `${format} loops need a documented loopMs > 0 (one beat = 60000/bpm) — got ${String(loopMs)}`,
    );
  const bits =
    frameCount(loopMs, fps) * view.width * view.height * (format === "webm" ? WEBM_BITS_PER_PIXEL : GIF_BITS_PER_PIXEL);
  return {
    format,
    width: view.width,
    height: view.height,
    fps,
    loopMs,
    frames: frameCount(loopMs, fps),
    qualityNote: QUALITY_NOTES[format],
    estimatedBytes: Math.ceil(bits / 8) + (format === "gif" ? GIF_OVERHEAD_BYTES : 0),
  };
}
/** perturbFrame — the per-frame camera state the signatures ride (local stand-in
 *  for imagerender's perturbation): the nearest pulse at/before tMs (wrap-aware)
 *  drives beat breath; drift rides the loop phase. Deterministic, total. */
export function perturbFrame(project: ExportProject, tMs: number): FramePerturbation {
  const motion = project?.motion;
  const loop = num(motion?.loopMs, 0) > 0 ? motion.loopMs : 500;
  const phase = clamp01(num(tMs, 0) / loop);
  const pulses = (Array.isArray(motion?.keyframes) ? motion.keyframes : []).filter(
    (k) => k?.kind === "pulse" && Number.isFinite(k?.strength),
  );
  const at = pulses.filter((k) => k.tMs <= num(tMs, 0)),
    strength = pulses.length > 0 ? (at.length > 0 ? at[at.length - 1] : pulses[pulses.length - 1]).strength : 0;
  return {
    scale: 1 + (num(motion?.pulseScale, 1) - 1) * clamp01(strength),
    dx: num(motion?.drift?.x, 0) * phase + 0,
    dy: num(motion?.drift?.y, 0) * phase + 0,
    rotate: num(motion?.drift?.rotation, 0) * phase + 0,
    phase,
  }; // +0 scrubs -0
}

/** thumbnailSignature — the deterministic per-frame fingerprint (local stand-in
 *  for imagerender's): folds the perturbation, the block cast (4-dp geometry plus
 *  role fill), the texture dials and the palette poles into one fnv1a hex. */
export function thumbnailSignature(
  project: ExportProject,
  tMs: number,
  width = DEFAULT_SIZE,
  height = DEFAULT_SIZE,
): string {
  const pert = perturbFrame(project, tMs);
  const rows = project.blocks.map(
    (b, i) =>
      `${i}:${b.role}:${fx(b.rect.x, 4)},${fx(b.rect.y, 4)},${fx(b.rect.w, 4)},${fx(b.rect.h, 4)}:${blockFill(project.palette, b.role, i)}`,
  );
  const t = project.texture,
    tex = `t:${fx(t.grainDensity, 3)},${fx(t.strokeWeight, 2)},${t.glazeLayers},${fx(t.glazeOpacity, 3)},${fx(t.turbulence, 3)}`;
  const head = `cadria-thumb-1|${project.id}|${width}x${height}|${Math.round(num(tMs, 0))}|${fx(pert.scale, 5)}|${fx(pert.dx, 4)}|${fx(pert.dy, 4)}|${fx(pert.rotate, 4)}|${project.palette.anchor}|${project.palette.surface}`;
  return fnv1aHex(`${head}|${rows.join("|")}|${tex}`);
}

/** buildAnimationManifest — the animation handoff: frameCount even-spread frames
 *  across the loop (capped at MANIFEST_FRAME_CAP, index- and time-sorted, tMs
 *  strictly inside [0, loopMs)), each fingerprinted by thumbnailSignature at the
 *  plan's viewport. Static plans refuse (export-format); loopless refuse too. */
export function buildAnimationManifest(project: ExportProject, plan: ExportPlan): AnimationManifest {
  assertShippable(project);
  if (plan.format !== "webm" && plan.format !== "gif")
    throw new ExportError("export-format", `animation manifests need a webm/gif plan — got ${String(plan?.format)}`);
  const fps = num(plan.fps, 30),
    loopMs = num(plan.loopMs, 0);
  if (!(loopMs > 0))
    throw new ExportError("export-loop-required", `plan carries no loop — ${plan.format} manifests need loopMs > 0`);
  const frames: ManifestFrame[] = [];
  for (let i = 0, count = frameCount(loopMs, fps); i < count; i += 1) {
    const tMs = Math.min(loopMs - 1, Math.round((i * loopMs) / count));
    frames.push({ index: i, tMs, signature: thumbnailSignature(project, tMs, plan.width, plan.height) });
  }
  return { loopMs, fps, frames };
}
/** png sidecar digest: raster size plus the frame-0 signature. */
function pngDigest(project: ExportProject, plan: ExportPlan): string {
  return fnv1aHex(
    `png-sidecar-1|${project.id}|${plan.width}x${plan.height}|${thumbnailSignature(project, 0, plan.width, plan.height)}`,
  );
}
/** animation sidecar digest: timing plus every frame signature. */
function animationDigest(
  project: ExportProject,
  kind: ExportFormat,
  plan: ExportPlan,
  manifest: AnimationManifest,
): string {
  return fnv1aHex(
    `${kind}-sidecar-1|${project.id}|${plan.width}x${plan.height}|${plan.fps}|${plan.loopMs}|${manifest.frames.map((f) => f.signature).join(",")}`,
  );
}

/** exportBundle — the one-call export: the svg master always ships, then every
 *  requested format adds its artifact (duplicates skipped, order kept). Digests:
 *  svg folds its real bytes; png folds the raster sidecar; webm/gif fold the
 *  animation sidecar. The plan is the primary (first requested) format's. */
export function exportBundle(
  project: ExportProject,
  options: { format: ExportFormat | ExportFormat[]; width?: number; height?: number; fps?: number; loopMs?: number },
): ExportBundle {
  assertShippable(project);
  const asked = Array.isArray(options?.format) ? options.format : [options?.format],
    formats: ExportFormat[] = [];
  for (const f of asked) {
    if (f !== "svg" && f !== "png" && f !== "webm" && f !== "gif")
      throw new ExportError("export-format", `unknown export format ${JSON.stringify(f)} — expected svg|png|webm|gif`);
    if (!formats.includes(f)) formats.push(f);
  }
  if (formats.length === 0)
    throw new ExportError("export-format", "no export format requested — name svg, png, webm or gif");
  const plan = exportPlan(project, { ...options, format: formats[0] });
  const svg = buildSvgArtifact(project, { width: plan.width, height: plan.height });
  const artifacts: ExportArtifact[] = [{ filename: svg.filename, kind: "svg", digest: svg.digest }];
  for (const f of formats) {
    if (f === "svg") continue;
    const p = exportPlan(project, { ...options, format: f });
    if (f === "png") {
      artifacts.push({ filename: `${project.id}.png`, kind: "png", digest: pngDigest(project, p) });
      continue;
    }
    artifacts.push({
      filename: `${project.id}.${f}`,
      kind: f,
      digest: animationDigest(project, f, p, buildAnimationManifest(project, p)),
    });
  }
  return { artifacts, plan };
}
