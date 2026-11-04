/**
 * image — consolidated image engine logics of the cadria family.
 * @module image
 * @family wave/logicfold2
 * One keyed file per family: the former variant arms (imageexport, imageproject, imagerender, imagestyles)
 * retired into this seat with every export preserved under the same name.
 */

import { Block, BlockRole, FALLBACK_PALETTE, GRAIN_COUPLING, KEYFRAME_CAP, MotionEasing, MotionKeyframe, MotionKeyframeKind, MotionSpec, OklchTriple, Palette, Rect, TEXTURE_RANGES, TextureSpec, compositionBlocks, jitterField, oklchToSrgbHex, sanitizeTexture, synthMotion, synthPalette, synthTexture, wrapHue } from "./synth.ts";
import { AudioDescriptor, DIM_ORDER } from "@wenathlan/debonair/audio";

/* ===== block: imageexport ===== */
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
/* ===== block: imageproject ===== */
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
  descriptor: AudioDescriptor;
  seed?: string;
  style?: string; // seed ← descriptor.seed, style ← "atelier"
  palette: Palette;
  blocks: Block[];
  texture: TextureSpec;
  motion: MotionSpec;
  width?: number;
  height?: number; // canvas, default 1080×1080
};

export const PROJECT_VERSION = 1;
export const CANVAS_MIN = 64,
  CANVAS_MAX = 8192;
/** golden angle in degrees — variant i rotates the anchor hue by (i+1)·step. */
export const VARIANT_HUE_STEP = 137.5;
const VARIANT_CAP = 12;
const FNV_BASISimageproject = 0x811c9dc5,
  FNV_PRIMEimageproject = 0x01000193;
const HEX = /^#[0-9a-f]{6}$/;
const ROLES: ReadonlySet<string> = new Set(["hero", "cadre", "field", "edge"]);
const EASINGS: ReadonlySet<string> = new Set(["standard", "decelerate", "accelerate", "springy"]);
const KINDS: ReadonlySet<string> = new Set(["pulse", "shift", "reveal", "wipe"]);
const PITCH_CLASSES = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];

/** the one error type this layer throws, tagged with its taxonomy code. */
export class ProjectError extends Error {
  code: ProjectErrorCode;
  constructor(code: ProjectErrorCode, message: string) {
    super(message);
    this.name = "ProjectError";
    this.code = code;
  }
}

type Box = Record<string, unknown>;
const isBox = (v: unknown): v is Box => v !== null && typeof v === "object" && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isNum = (v: unknown): v is number => typeof v === "number";
const fin = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
function fail(code: ProjectErrorCode, what: string): never {
  throw new ProjectError(code, what);
}
const shape = (ok: boolean, what: string): void => {
  if (!ok) fail("project-shape", what);
};
const range = (ok: boolean, what: string): void => {
  if (!ok) fail("project-range", what);
};
/** reads a required number off a box: missing/mistyped → "project-shape". */
const numField = (b: Box, key: string, what: string): number => {
  const v = b[key];
  if (!isNum(v)) fail("project-shape", `${what} number`);
  return v;
};

/** one declared OKLCH color: l 0-1, c 0-0.33, h 0-360 (synthpalette's domain). */
function triple(t: unknown, what: string): OklchTriple {
  shape(isBox(t), `${what} object`);
  const { l, c, h } = t as Box;
  if (!isNum(l) || !isNum(c) || !isNum(h)) fail("project-shape", `${what} l/c/h numbers`);
  range(
    fin(l) && l >= 0 && l <= 1 && fin(c) && c >= 0 && c <= 0.33 && fin(h) && h >= 0 && h < 360,
    `${what} l 0-1, c 0-0.33, h 0-360`,
  );
  return { l, c, h };
}

const hex = (v: unknown, what: string): string => {
  if (!isStr(v) || !HEX.test(v)) fail("project-shape", `${what} must be "#rrggbb"`);
  return v;
};

/** validates and replicas the fused descriptor (v1, 32 finite 0-1 dims). */
function validDescriptor(v: unknown): AudioDescriptor {
  shape(isBox(v), "descriptor object");
  const b = v as Box;
  const version = numField(b, "version", "descriptor.version");
  if (!Number.isInteger(version) || version !== 1)
    fail("project-version", `descriptor.version ${version} unsupported (read v1)`);
  shape(isStr(b.seed) && b.seed.length > 0, "descriptor.seed non-empty string");
  shape(Array.isArray(b.vector) && b.vector.length === 32, "descriptor.vector of 32 dims");
  const vector = (b.vector as unknown[]).map((d, i) =>
    fin(d) && d >= 0 && d <= 1 ? d : fail("project-range", `descriptor.vector[${i}] finite in 0-1`),
  );
  shape(isBox(b.scalar), "descriptor.scalar object");
  const scalar: Record<string, number> = {};
  for (const [k, val] of Object.entries(b.scalar as Box))
    scalar[k] = fin(val) ? val : fail("project-range", `descriptor.scalar.${k} finite`);
  return { version: 1, seed: b.seed as string, vector, scalar };
}

/** audio stats off the validated scalar; key reads "<pitch><m?>" (e.g. "am"). */
function validAudio(scalar: Box): ProjectAudio {
  const durationMs = numField(scalar, "durationMs", "scalar.durationMs"),
    bpm = numField(scalar, "bpm", "scalar.bpm");
  const tonic = numField(scalar, "tonic", "scalar.tonic"),
    minor = numField(scalar, "minor", "scalar.minor");
  range(
    fin(durationMs) && durationMs >= 0 && fin(bpm) && bpm >= 20 && bpm <= 1000,
    "scalar durationMs ≥ 0, bpm 20-1000",
  );
  range(
    fin(tonic) && tonic >= 0 && tonic <= 11 && fin(minor) && minor >= 0 && minor <= 1,
    "scalar tonic 0-11, minor 0-1",
  );
  const pitch = PITCH_CLASSES[Math.min(11, Math.max(0, Math.round(tonic)))];
  return { durationMs, bpm, key: minor >= 0.5 ? `${pitch}m` : pitch };
}

function validPalette(v: unknown): Palette {
  shape(isBox(v), "palette object");
  const b = v as Box;
  const anchor = hex(b.anchor, "palette.anchor"),
    ink = hex(b.ink, "palette.ink"),
    surface = hex(b.surface, "palette.surface");
  shape(
    Array.isArray(b.support) && b.support.length >= 1 && Array.isArray(b.accents) && b.accents.length >= 1,
    "palette.support/accents non-empty arrays",
  );
  const support = (b.support as unknown[]).map((s, i) => hex(s, `palette.support[${i}]`)),
    accents = (b.accents as unknown[]).map((s, i) => hex(s, `palette.accents[${i}]`));
  shape(isBox(b.oklch), "palette.oklch object");
  const o = b.oklch as Box;
  shape(Array.isArray(o.accents), "palette.oklch.accents array");
  const oklch = {
    anchor: triple(o.anchor, "palette.oklch.anchor"),
    accents: (o.accents as unknown[]).map((t, i) => triple(t, `palette.oklch.accents[${i}]`)),
  };
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
    const rect = {
      x: numField(r, "x", `blocks[${i}].rect.x`),
      y: numField(r, "y", `blocks[${i}].rect.y`),
      w: numField(r, "w", `blocks[${i}].rect.w`),
      h: numField(r, "h", `blocks[${i}].rect.h`),
    };
    const weight = numField(b, "weight", `blocks[${i}].weight`);
    range(
      [rect.x, rect.y, rect.w, rect.h].every((n) => fin(n) && n >= 0 && n <= 1) &&
        rect.x + rect.w <= 1 + 1e-6 &&
        rect.y + rect.h <= 1 + 1e-6 &&
        fin(weight) &&
        weight > 0 &&
        weight <= 1,
      `blocks[${i}].rect 0-1 inside canvas, weight 0-1`,
    );
    return { rect, weight, role: b.role as BlockRole };
  });
}

function validTexture(v: unknown): TextureSpec {
  shape(isBox(v), "texture object");
  const b = v as Box;
  const out = {} as Record<keyof TextureSpec, number>;
  for (const key of Object.keys(TEXTURE_RANGES) as (keyof TextureSpec)[]) {
    const { min, max } = TEXTURE_RANGES[key];
    const value = numField(b, key, `texture.${key}`);
    range(fin(value) && value >= min && value <= max, `texture.${key} in ${min}-${max}`);
    out[key] = value;
  }
  range(
    Number.isInteger(out.glazeLayers) && out.grainOpacity <= out.grainDensity + GRAIN_COUPLING + 1e-9,
    "texture.glazeLayers whole, grainOpacity coupling",
  );
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
    const tMs = numField(k, "tMs", `motion.keyframes[${i}].tMs`),
      strength = numField(k, "strength", `motion.keyframes[${i}].strength`);
    shape(isStr(k.kind) && KINDS.has(k.kind), `motion.keyframes[${i}].kind pulse|shift|reveal|wipe`);
    shape(Array.isArray(k.targets) && k.targets.every(isStr), `motion.keyframes[${i}].target strings`);
    range(
      fin(tMs) && tMs >= 0 && fin(strength) && strength >= 0 && strength <= 1,
      `motion.keyframes[${i}].tMs ≥ 0, strength 0-1`,
    );
    return { tMs, kind: k.kind as MotionKeyframeKind, strength, targets: [...(k.targets as string[])] };
  });
  shape(isBox(b.drift), "motion.drift object");
  const d = b.drift as Box;
  const drift = {
    x: numField(d, "x", "motion.drift.x"),
    y: numField(d, "y", "motion.drift.y"),
    rotation: numField(d, "rotation", "motion.drift.rotation"),
  };
  range(Object.values(drift).every(fin), "motion.drift finite");
  const pulseScale = numField(b, "pulseScale", "motion.pulseScale"),
    parallaxDepth = numField(b, "parallaxDepth", "motion.parallaxDepth");
  range(fin(pulseScale) && pulseScale > 0 && pulseScale <= 4, "motion.pulseScale in 0-4");
  range(fin(parallaxDepth) && parallaxDepth >= 0 && parallaxDepth <= 1, "motion.parallaxDepth in 0-1");
  return { loopMs, keyframes, easing: b.easing as MotionEasing, drift, pulseScale, parallaxDepth };
}

/** slug lane: lowercase, non-alphanumerics fold to "-", trimmed. */
const slug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-{1,64}|-{1,64}$/g, "") || "x";

function deepFreeze<T>(v: T): T {
  if (Array.isArray(v)) {
    for (const item of v) deepFreeze(item);
    Object.freeze(v);
  } else if (v !== null && typeof v === "object") {
    for (const k of Object.keys(v as Box)) deepFreeze((v as Box)[k]);
    Object.freeze(v);
  }
  return v;
}
/** validates + replicas every part of a bundle box, then freezes the result. */
function assemble(b: Box): ImageProject {
  const descriptor = validDescriptor(b.descriptor);
  const seed = b.seed === undefined ? descriptor.seed : b.seed,
    style = b.style === undefined ? "atelier" : b.style;
  const canvas = isBox(b.canvas) ? b.canvas : b; // serialized bundles nest w/h under canvas
  const width = canvas.width === undefined ? 1080 : canvas.width,
    height = canvas.height === undefined ? 1080 : canvas.height;
  if (!isStr(seed) || seed.length === 0 || !isStr(style) || style.length === 0)
    fail("project-shape", "seed/style non-empty strings");
  if (!isNum(width) || !isNum(height)) fail("project-shape", "canvas width/height numbers");
  range(
    fin(width) &&
      Number.isInteger(width) &&
      width >= CANVAS_MIN &&
      width <= CANVAS_MAX &&
      fin(height) &&
      Number.isInteger(height) &&
      height >= CANVAS_MIN &&
      height <= CANVAS_MAX,
    "canvas whole in 64-8192",
  );
  const orientation: CanvasOrientation = width > height ? "landscape" : height > width ? "portrait" : "square";
  const createdAt = b.createdAt === undefined ? new Date().toISOString() : b.createdAt;
  if (!isStr(createdAt) || Number.isNaN(Date.parse(createdAt))) fail("project-shape", "createdAt ISO string");
  return deepFreeze({
    version: PROJECT_VERSION,
    id: `${slug(seed)}-${slug(style)}`,
    seed,
    style,
    createdAt,
    audio: validAudio(descriptor.scalar),
    descriptor,
    palette: validPalette(b.palette),
    blocks: validBlocks(b.blocks),
    texture: validTexture(b.texture),
    motion: validMotion(b.motion),
    canvas: { width, height, orientation },
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
  if (!isBox(project) || project.version !== PROJECT_VERSION)
    fail("project-version", "serialize expects an ImageProject v1");
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
  try {
    raw = JSON.parse(text);
  } catch (error) {
    fail("project-shape", `invalid json: ${(error as Error).message}`);
  }
  shape(isBox(raw), "project object");
  const b = raw as Box;
  const version = numField(b, "version", "project.version");
  if (!Number.isInteger(version) || version !== PROJECT_VERSION)
    fail("project-version", `project.version ${version} unsupported (read v${PROJECT_VERSION})`);
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
  if (!isBox(project) || project.version !== PROJECT_VERSION)
    fail("project-version", "projectVariants expects an ImageProject v1");
  const asked = count === undefined ? 3 : count;
  if (!isNum(asked)) fail("project-shape", "variant count number");
  range(
    fin(asked) && Number.isInteger(asked) && asked >= 0 && asked <= VARIANT_CAP,
    `variant count in 0-${VARIANT_CAP}`,
  );
  const variants: ImageProject[] = [];
  for (let i = 0; i < asked; i += 1) {
    const anchor = project.palette.oklch.anchor,
      hue = wrapHue(anchor.h + (i + 1) * VARIANT_HUE_STEP);
    const rotated: Palette = {
      ...project.palette,
      anchor: oklchToSrgbHex(anchor.l, anchor.c, hue),
      oklch: { anchor: { ...anchor, h: hue }, accents: project.palette.oklch.accents.map((t) => ({ ...t })) },
    };
    variants.push(
      buildImageProject({
        descriptor: project.descriptor,
        seed: `${project.seed}::variant${i}`,
        style: project.style,
        palette: rotated,
        blocks: project.blocks,
        texture: project.texture,
        motion: project.motion,
        width: project.canvas.width,
        height: project.canvas.height,
      }),
    );
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
  let state = FNV_BASISimageproject;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    state = Math.imul((state ^ (code & 0xff)) >>> 0, FNV_PRIMEimageproject) >>> 0;
    state = Math.imul((state ^ ((code >>> 8) & 0xff)) >>> 0, FNV_PRIMEimageproject) >>> 0;
  }
  let lane = state >>> 0;
  return () => {
    lane = (lane + 0x6d2b79f5) | 0;
    let t = lane;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** integer in [min, max] inclusive; non-integer or inverted bounds → "project-range". */
export function rngInt(rng: () => number, min: number, max: number): number {
  if (!fin(min) || !fin(max) || !Number.isInteger(min) || !Number.isInteger(max) || max < min)
    fail("project-range", "rngInt needs integer bounds min ≤ max");
  return min + Math.floor(rng() * (max - min + 1));
}

/** one item of a non-empty list; empty or non-array → "project-shape". */
export function rngPick<T>(rng: () => number, items: readonly T[]): T {
  shape(Array.isArray(items) && items.length > 0, "rngPick needs a non-empty list");
  return items[Math.floor(rng() * items.length)];
}
/* ===== block: imagerender ===== */
// # imagerender — the render layer of the cadria audio→image studio (wave 2,
// module b7): a deterministic draw-command compiler. It consumes a project-ish
// input — the same fields imageproject.ts bundles (seed, palette, blocks,
// texture, canvas) as a minimal local RenderInput, so an ImageProject assigns
// to it structurally — and compiles it into a pixel-free frame: { width,
// height, background, commands }. The browser paints those commands
// (renderSvg in the svg serialization section below serializes the same list
// to SVG); node tests assert them. Nothing here touches pixels: geometry is
// normalized 0-1,
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
// renderSvg.



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
/* deduped: SIZE_MIN — identical arm retired, the imageexport block declaration answers */const SIZE_MAXimagerender = 8192;
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
/* deduped: HEX — identical arm retired, the imageproject block declaration answers *//* deduped: FNV_BASIS — identical arm retired, the imageexport block declaration answers *//* deduped: FNV_PRIME — identical arm retired, the imageexport block declaration answers */const clamp = (v: number, lo: number, hi: number): number => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo);
const clamp01imagerender = (v: number): number => clamp(v, 0, 1);
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
  const x = clamp01imagerender(r?.x ?? 0);
  const y = clamp01imagerender(r?.y ?? 0);
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
      clamp01imagerender(rect.x + t * rect.w + jitter * 0.02 * vals[i * 2]),
      clamp01imagerender(rect.y + rect.h * share + jitter * 0.1 * rect.h * vals[i * 2 + 1]),
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
      SIZE_MAXimagerender,
    ),
  );
  const height = Math.round(
    clamp(
      Number.isFinite(input.canvas?.height) ? (input.canvas?.height as number) : RENDER_DEFAULT_SIZE,
      SIZE_MIN,
      SIZE_MAXimagerender,
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
        clamp01imagerender(hero.rect.x + ((vals[i * 2] + 1) / 2) * hero.rect.w),
        clamp01imagerender(hero.rect.y + (0.1 + 0.3 * ((vals[i * 2 + 1] + 1) / 2)) * hero.rect.h),
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
  const strength = clamp01imagerender(keyframe?.strength ?? 0);
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

// ---- svg serialization — the SVG arm of the render layer: the deterministic
// serializer any SVG consumer paints (the browser pages and the gateway render
// route alike). Every number is spelled with fixed 3-decimal toFixed (never a
// locale float, never an exponent for the magnitudes used here), ids are
// command indexes (unique, stable), there are no timestamps and no escaping —
// all inputs are internal IR (colors are #rrggbb by compiler contract), so the
// same frame always serializes to the same string, byte for byte. Geometry
// arrives normalized 0-1 and is scaled by the frame size here; px fields
// (strokeWidth, grainfield r, blur) pass through unscaled. Kind mapping:
// rect→<rect>, ellipse→<ellipse>, gradientwash→<linearGradient>+<rect>,
// path→closed <path d="… Z">, strokepath→open stroked <path>, grainfield→
// <circle>; blur > 0 adds a per-command <feGaussianBlur> filter def. ----

/** fixed 3-decimal spelling; non-finite damage answers "0.000" (total, never NaN). */
function f(n: number): string {
  return (Number.isFinite(n) ? n : 0).toFixed(3);
}

/** flat x,y pairs (normalized) → "M x y L x y …" path data, scaled to px. */
function pathData(points: number[], w: number, h: number): string {
  const out: string[] = [];
  for (let i = 0; i + 1 < points.length; i += 2)
    out.push(`${i === 0 ? "M" : "L"} ${f(points[i] * w)} ${f(points[i + 1] * h)}`);
  return out.length > 0 ? out.join(" ") : "M 0.000 0.000";
}

/** blur > 0 registers one filter def and answers its reference attribute. */
function blurAttr(c: DrawCommand, i: number, defs: string[]): string {
  if (!(c.blur > 0)) return "";
  defs.push(
    `<filter id="blur-${i}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${f(c.blur)}"/></filter>`,
  );
  return ` filter="url(#blur-${i})"`;
}

/** shared fill-paint attributes: fill-opacity (unless 1) plus the blur reference. */
function fillAttrs(c: DrawCommand, i: number, defs: string[]): string {
  return `${c.opacity < 1 ? ` fill-opacity="${f(c.opacity)}"` : ""}${blurAttr(c, i, defs)}`;
}

/** serializes one command; the defs list collects gradient/filter partners in order. */
function commandSvg(c: DrawCommand, i: number, w: number, h: number, defs: string[]): string {
  switch (c.kind) {
    case "rect":
      return `<rect x="${f(c.x * w)}" y="${f(c.y * h)}" width="${f(c.w * w)}" height="${f(c.h * h)}" fill="${c.fill}"${fillAttrs(c, i, defs)}/>`;
    case "ellipse":
      return `<ellipse cx="${f(c.cx * w)}" cy="${f(c.cy * h)}" rx="${f(c.rx * w)}" ry="${f(c.ry * h)}" fill="${c.fill}"${fillAttrs(c, i, defs)}/>`;
    case "gradientwash": {
      // angle in degrees (0 = +x, svg y-down) → objectBoundingBox endpoints
      const rad = (Number.isFinite(c.angle) ? c.angle : 0) * (Math.PI / 180);
      const dx = Math.cos(rad) / 2;
      const dy = Math.sin(rad) / 2;
      defs.push(
        `<linearGradient id="wash-${i}" x1="${f(0.5 - dx)}" y1="${f(0.5 - dy)}" x2="${f(0.5 + dx)}" y2="${f(0.5 + dy)}"><stop offset="0" stop-color="${c.from}"/><stop offset="1" stop-color="${c.to}"/></linearGradient>`,
      );
      return `<rect x="${f(c.x * w)}" y="${f(c.y * h)}" width="${f(c.w * w)}" height="${f(c.h * h)}" fill="url(#wash-${i})"${fillAttrs(c, i, defs)}/>`;
    }
    case "path":
      return `<path d="${pathData(c.points, w, h)} Z" fill="${c.fill}"${fillAttrs(c, i, defs)}/>`;
    case "strokepath":
      return `<path d="${pathData(c.points, w, h)}" fill="none" stroke="${c.stroke}" stroke-width="${f(c.strokeWidth)}" stroke-opacity="${f(c.opacity)}" stroke-linecap="round"${blurAttr(c, i, defs)}/>`;
    case "grainfield":
      return `<circle cx="${f(c.x * w)}" cy="${f(c.y * h)}" r="${f(c.r)}" fill="${c.fill}"${fillAttrs(c, i, defs)}/>`;
  }
}

/**
 * renderSvg — the deterministic SVG serializer over a render frame (exactly
 * what renderCommands answers): root svg with width/height/viewBox, then an
 * optional <defs> block (gradients + blur filters, command-index ids), then
 * one element per command in paint order. Newline-indented, no trailing
 * whitespace, ends with a newline.
 */
export function renderSvg(frame: RenderFrame): string {
  const width = Math.round(Number.isFinite(frame?.width) ? frame.width : 1080);
  const height = Math.round(Number.isFinite(frame?.height) ? frame.height : 1080);
  const defs: string[] = [];
  const commands = Array.isArray(frame?.commands) ? frame.commands : [];
  const body = commands.map((c, i) => commandSvg(c, i, width, height, defs));
  const head = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  const defBlock = defs.length > 0 ? `  <defs>\n    ${defs.join("\n    ")}\n  </defs>` : "";
  return `${[head, defBlock, ...body.map((row) => `  ${row}`), "</svg>"].filter((row) => row.length > 0).join("\n")}\n`;
}
/* ===== block: imagestyles ===== */
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
  paletteBias: PaletteBias;
  compositionBias: CompositionBias;
  textureBias: TextureBias;
  motionBias: MotionBias;
  tags: string[];
};
/** base values applyStyleBias bends — missing fields take neutral defaults. */
export type StyleBase = {
  chroma?: number;
  lightness?: number;
  warmth?: number; // palette 0-1 (default 0.5)
  density?: number;
  heroScale?: number; // composition (defaults 0.5)
  texture?: Partial<TextureSpec>; // texture base values (default NEUTRAL_TEXTURE)
  strength?: number;
  drift?: number; // motion base values 0-1 (default 1)
};
/** biased values — every field present, finite, inside its documented range. */
export type StyleBiased = {
  chroma: number;
  lightness: number;
  warmth: number;
  density: number;
  heroScale: number;
  texture: TextureSpec;
  strength: number;
  drift: number; // texture inside TEXTURE_RANGES
};
/** thrown by styleByName for misses — check error.code === "style-unknown". */
export type StyleError = Error & { code: "style-unknown" };

// ---- documented constants (the validation + matching surface) ----

/** bias ranges — every style below is validated against these. */
export const STYLE_RANGES: Readonly<{
  palette: BiasRange;
  density: BiasRange;
  heroScale: BiasRange;
  motion: BiasRange;
}> = {
  palette: [-1, 1],
  density: [0, 1],
  heroScale: [0.3, 0.7],
  motion: [0, 1],
};
/** weighted distance for styleForDescriptor — the four weights sum to 1. */
export const STYLE_MATCH_WEIGHTS = { grain: 0.3, motion: 0.3, light: 0.2, shadow: 0.2 } as const;
/** |textureBias delta| ceiling per field: half the documented field span. */
export const TEXTURE_DELTA_CAP: Readonly<Record<keyof TextureSpec, number>> = Object.fromEntries(
  (Object.keys(TEXTURE_RANGES) as (keyof TextureSpec)[]).map((f) => [
    f,
    (TEXTURE_RANGES[f].max - TEXTURE_RANGES[f].min) / 2,
  ]),
) as Readonly<Record<keyof TextureSpec, number>>;
/** share of the gap applyStyleBias closes toward a style's heroScale. */
export const HERO_PULL = 0.5;

// ---- the table: 5 calm, 5 kinetic, 5 dark/moody ----

const TABLE: readonly StyleSpec[] = [
  {
    name: "opaline",
    mood: "milky glass washes drifting over slow pastel air",
    paletteBias: { chroma: -0.55, lightness: 0.55, warmth: -0.2 },
    compositionBias: { density: 0.2, symmetry: "mirror", heroScale: 0.38 },
    textureBias: { grainDensity: -0.35, grainSize: -2.2, glazeOpacity: 0.25, specular: 0.3, turbulence: -0.3 },
    motionBias: { tempo: 0.15, driftScale: 0.2 },
    tags: ["calm", "glassy", "pastel", "airy"],
  },
  {
    name: "mistrelle",
    mood: "fog-soft fields breathing in hushed pale gradients",
    paletteBias: { chroma: -0.4, lightness: 0.4, warmth: -0.35 },
    compositionBias: { density: 0.25, symmetry: "mirror", heroScale: 0.34 },
    textureBias: { strokeSoftness: 0.4, glazeLayers: 1.5, grainDensity: -0.2, glazeOpacity: -0.2 },
    motionBias: { tempo: 0.22, driftScale: 0.35 },
    tags: ["calm", "foggy", "pale", "soft"],
  },
  {
    name: "veiloam",
    mood: "earthy loam tones resting under a sheer muted veil",
    paletteBias: { chroma: -0.45, lightness: 0.1, warmth: 0.5 },
    compositionBias: { density: 0.3, symmetry: "asymmetric", heroScale: 0.42 },
    textureBias: { strokeSoftness: 0.3, glazeLayers: 1, strokeWeight: -3, grainDensity: -0.05 },
    motionBias: { tempo: 0.3, driftScale: 0.25 },
    tags: ["calm", "earthy", "muted", "veiled"],
  },
  {
    name: "plienair",
    mood: "open-air daylight sketch with soft warm neutrals",
    paletteBias: { chroma: 0.1, lightness: 0.6, warmth: 0.55 },
    compositionBias: { density: 0.4, symmetry: "asymmetric", heroScale: 0.46 },
    textureBias: { strokeJitter: 0.15, strokeWeight: 2, grainDensity: 0.1, specular: 0.1 },
    motionBias: { tempo: 0.35, driftScale: 0.4 },
    tags: ["calm", "daylight", "sketched", "warm"],
  },
  {
    name: "fernwell",
    mood: "quiet green still water under leaf-soft light",
    paletteBias: { chroma: -0.15, lightness: 0.3, warmth: -0.45 },
    compositionBias: { density: 0.35, symmetry: "rotational", heroScale: 0.4 },
    textureBias: { grainSize: 1, grainDensity: 0.05, glazeOpacity: 0.1, turbulence: -0.1 },
    motionBias: { tempo: 0.28, driftScale: 0.3 },
    tags: ["calm", "green", "still", "leafy"],
  },
  {
    name: "strobic",
    mood: "hard strobe pulses cutting high-contrast flicker",
    paletteBias: { chroma: 0.5, lightness: 0.25, warmth: -0.1 },
    compositionBias: { density: 0.85, symmetry: "rotational", heroScale: 0.55 },
    textureBias: { grainDensity: 0.2, strokeJitter: 0.5, turbulence: 0.45, strokeWeight: 4 },
    motionBias: { tempo: 0.95, driftScale: 0.85 },
    tags: ["kinetic", "strobe", "pulsed", "electric"],
  },
  {
    name: "kinegram",
    mood: "sliced hologram wedges spinning in cool light",
    paletteBias: { chroma: 0.35, lightness: 0.15, warmth: -0.5 },
    compositionBias: { density: 0.7, symmetry: "rotational", heroScale: 0.5 },
    textureBias: { strokeJitter: 0.3, glazeLayers: 2, specular: 0.35, strokeSoftness: -0.2 },
    motionBias: { tempo: 0.8, driftScale: 0.7 },
    tags: ["kinetic", "hologram", "sliced", "cool"],
  },
  {
    name: "voltura",
    mood: "electric surge arcing in molten accent spikes",
    paletteBias: { chroma: 0.8, lightness: 0.1, warmth: -0.25 },
    compositionBias: { density: 0.75, symmetry: "asymmetric", heroScale: 0.62 },
    textureBias: { turbulence: 0.4, strokeWeight: 6, strokeJitter: 0.4, specular: 0.25 },
    motionBias: { tempo: 0.9, driftScale: 1 },
    tags: ["kinetic", "surge", "arced", "molten"],
  },
  {
    name: "ryther",
    mood: "syncopated scatter jittering against the beat grid",
    paletteBias: { chroma: 0.25, lightness: 0, warmth: 0.3 },
    compositionBias: { density: 0.9, symmetry: "asymmetric", heroScale: 0.34 },
    textureBias: { strokeJitter: 0.5, grainDensity: 0.25, strokeWeight: -2, turbulence: 0.3 },
    motionBias: { tempo: 0.85, driftScale: 0.9 },
    tags: ["kinetic", "syncopated", "scattered", "jittery"],
  },
  {
    name: "percussa",
    mood: "struck-metal bursts chiselled into brassy plates",
    paletteBias: { chroma: 0.45, lightness: -0.1, warmth: 0.35 },
    compositionBias: { density: 0.6, symmetry: "mirror", heroScale: 0.66 },
    textureBias: { strokeWeight: 8, strokeSoftness: -0.3, grainOpacity: 0.2, turbulence: 0.25 },
    motionBias: { tempo: 0.7, driftScale: 0.6 },
    tags: ["kinetic", "struck", "chiselled", "brassy"],
  },
  {
    name: "nocturn",
    mood: "deep night washes under a faint moon sheen",
    paletteBias: { chroma: -0.3, lightness: -0.7, warmth: -0.4 },
    compositionBias: { density: 0.3, symmetry: "mirror", heroScale: 0.44 },
    textureBias: { glazeLayers: 2, glazeOpacity: 0.3, specular: -0.3, grainDensity: -0.15, strokeSoftness: 0.2 },
    motionBias: { tempo: 0.3, driftScale: 0.45 },
    tags: ["dark", "night", "washed", "moonlit"],
  },
  {
    name: "umbrous",
    mood: "heavy shadow pressing a low-key silhouette",
    paletteBias: { chroma: -0.6, lightness: -0.8, warmth: 0 },
    compositionBias: { density: 0.25, symmetry: "mirror", heroScale: 0.55 },
    textureBias: { grainDensity: -0.25, glazeOpacity: 0.35, specular: -0.4, strokeWeight: 1.5, glazeLayers: 1 },
    motionBias: { tempo: 0.35, driftScale: 0.3 },
    tags: ["dark", "shadowed", "silhouette", "low-key"],
  },
  {
    name: "sablewane",
    mood: "black satin fading to one thin crescent glow",
    paletteBias: { chroma: -0.2, lightness: -0.6, warmth: -0.15 },
    compositionBias: { density: 0.35, symmetry: "asymmetric", heroScale: 0.62 },
    textureBias: { specular: 0.2, grainSize: -1.5, glazeOpacity: 0.2, turbulence: -0.15 },
    motionBias: { tempo: 0.45, driftScale: 0.55 },
    tags: ["dark", "satin", "crescent", "fading"],
  },
  {
    name: "tarnglass",
    mood: "dark lake glass holding a cold stilled mirror",
    paletteBias: { chroma: -0.35, lightness: -0.5, warmth: -0.6 },
    compositionBias: { density: 0.2, symmetry: "mirror", heroScale: 0.5 },
    textureBias: { turbulence: -0.35, specular: 0.3, grainDensity: -0.3, strokeSoftness: 0.15, glazeOpacity: 0.25 },
    motionBias: { tempo: 0.4, driftScale: 0.5 },
    tags: ["dark", "mirror", "cold", "stilled"],
  },
  {
    name: "charlow",
    mood: "charred ember dusk smoldering under ashy reds",
    paletteBias: { chroma: 0.05, lightness: -0.55, warmth: 0.6 },
    compositionBias: { density: 0.45, symmetry: "asymmetric", heroScale: 0.58 },
    textureBias: { grainDensity: 0.4, grainSize: 2.5, grainOpacity: 0.25, turbulence: 0.25, strokeWeight: 3 },
    motionBias: { tempo: 0.55, driftScale: 0.5 },
    tags: ["dark", "ember", "ashy", "smoldering"],
  },
];

// ---- table access ----

/** fresh deep copy — callers may mutate freely without corrupting the table. */
function copy(style: StyleSpec): StyleSpec {
  return {
    ...style,
    paletteBias: { ...style.paletteBias },
    compositionBias: { ...style.compositionBias },
    textureBias: { ...style.textureBias },
    motionBias: { ...style.motionBias },
    tags: [...style.tags],
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
  if (!hit)
    throw styleError(
      "style-unknown",
      `unknown style (code style-unknown): ${typeof name === "string" ? JSON.stringify(name) : String(name)}`,
    );
  return copy(hit);
}

// ---- deterministic matching ----

/* deduped: FNV_BASIS — identical arm retired, the imageexport block declaration answers *//* deduped: FNV_PRIME — identical arm retired, the imageexport block declaration answers *//** fnv-1a over a string, both bytes per char — deterministic and stable. */
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
    const score =
      weights.grain * Math.abs(noise - grainPush(style)) +
      weights.motion * Math.abs(tempo - motionPush(style)) +
      weights.light * Math.abs(bright - lightSide(style)) +
      weights.shadow * Math.abs(mood - (1 - lightSide(style)));
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
  const parts = [
    source.name ?? "?",
    source.mood ?? "?",
    fmt(palette.chroma),
    fmt(palette.lightness),
    fmt(palette.warmth),
    fmt(comp.density),
    comp.symmetry ?? "?",
    fmt(comp.heroScale),
    ...keys.map((field) => fmt(tex[field])),
    fmt(motion.tempo),
    fmt(motion.driftScale),
    Array.isArray(source.tags) ? source.tags.join(",") : "?",
  ];
  return fnv1a(parts.join("|")).toString(16).padStart(8, "0");
}

// ---- bias application ----

/* deduped: clamp01 — identical arm retired, the imageexport block declaration answers */function clampRange(x: number, lo: number, hi: number): number {
  return Number.isFinite(x) ? (x < lo ? lo : x > hi ? hi : x) : lo;
}

/** total number read: finite passes, everything else answers the fallback. */
function numimagestyles(x: unknown, fallback: number): number {
  return typeof x === "number" && Number.isFinite(x) ? x : fallback;
}

/** neutral mid texture — the base applyStyleBias starts from when none given. */
const NEUTRAL_TEXTURE: TextureSpec = {
  grainDensity: 0.5,
  grainSize: 4.5,
  grainOpacity: 0.5,
  strokeSoftness: 0.5,
  strokeWeight: 12.25,
  strokeJitter: 0.5,
  glazeLayers: 3,
  glazeOpacity: 0.5,
  specular: 0.5,
  turbulence: 0.5,
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
    let value = clampRange(
      numimagestyles(source?.[field], NEUTRAL_TEXTURE[field]) + (style.textureBias[field] ?? 0),
      range.min,
      range.max,
    );
    if (field === "glazeLayers") value = Math.round(value);
    texture[field] = value;
  }
  texture.grainOpacity = Math.min(texture.grainOpacity, texture.grainDensity + GRAIN_COUPLING);
  const heroBase = numimagestyles(base?.heroScale, 0.5);
  const hero = clampRange(
    heroBase + (style.compositionBias.heroScale - heroBase) * HERO_PULL,
    STYLE_RANGES.heroScale[0],
    STYLE_RANGES.heroScale[1],
  );
  return {
    chroma: clamp01(numimagestyles(base?.chroma, 0.5) + style.paletteBias.chroma),
    lightness: clamp01(numimagestyles(base?.lightness, 0.5) + style.paletteBias.lightness),
    warmth: clamp01(numimagestyles(base?.warmth, 0.5) + style.paletteBias.warmth),
    density: clamp01(numimagestyles(base?.density, 0.5) + style.compositionBias.density),
    heroScale: hero,
    texture,
    strength: clamp01(numimagestyles(base?.strength, 1) * style.motionBias.tempo),
    drift: clamp01(numimagestyles(base?.drift, 1) * style.motionBias.driftScale),
  };
}
