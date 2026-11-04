/**
 * studio — consolidated studio logics of the cadria family
 * @module studio
 * @family wave/logicfold3
 * One keyed file per family: the former variant arms (studiosource)
 * retired into this seat with every export preserved under the same name.
 */

import {
  type AnalysisReport,
  analyzePcm,
  analyzeWavBytes,
  fromAudioBufferLike,
  wavinfo,
} from "@wenathlan/debonair/audio";
import { DemoFixture, DemoFixtureId, demoFixtures } from "./introfixtures.ts";

/* ===== block: studiogenerate ===== */
/**
 * studiogenerate.ts — the GENERATION layer of the studio (moved from
 * sol/studio/generate.ts: pure logic rides the app root): fold the analyzed
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

/* (the AnalysisReport binding rode this statement too — the studiosource
 * hoist above already binds it from the same module; the dedup kept one) */
import { type AudioDescriptor } from "@wenathlan/debonair/audio";
import { buildImageProject, type ImageProject } from "./image.ts";
import { type RenderFrame, renderCommands } from "./image.ts";
import { applyStyleBias, type StyleSpec, styleByName } from "./image.ts";
import {
  type Block,
  compositionBlocks,
  rhythmScatter,
  type MotionSpec,
  synthMotion,
  type OklchTriple,
  oklchToSrgbHex,
  type Palette,
  srgbHexToOklch,
  synthPalette,
  synthTexture,
  wrapHue,
} from "./synth.ts";

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

/* ===== block: studiosource ===== */
/**
 * studiosource.ts — the SOURCE layer of the generation studio (moved from
 * sol/studio/source.ts: pure logic rides the app root): turn a picked file
 * or a built-in intro fixture into one normalized StudioSource, then run the
 * genuine wave-1 chain over it. The decode doctrine is the documented dual
 * path:
 *   wav  → the raw bytes go to analyzeWavBytes, whose decodeWav walk
 *          (the decode layer of the audio keyword file) owns the container natively,
 *          no web audio needed;
 *   else → AudioContext.decodeAudioData decodes mp3/ogg/flac/m4a in the
 *          browser and fromAudioBufferLike maps the web AudioBuffer onto the
 *          same AudioFrames contract (channels interleaved; analyzePcm does
 *          its own downmix + resample). AudioContext is browser-only: where
 *          none exists the guard answers the documented message and the page
 *          surfaces it — wav stays decodable everywhere.
 * Every async boundary is wrapped in a try/catch that rethrows with the step
 * named, so the studio status line can show a traceable message.
 */


/** hard cap on an uploaded file (bytes) — bounds the decodeAudioData working set. */
const MAX_FILE_BYTES = 64 * 1024 * 1024;

/** one normalized audio source the studio stage can analyze. */
export type StudioSource = {
  /** display name (fixture name or the file's own name) */
  name: string;
  /** where the source came from — the rail chips and meta rows read it */
  kind: "fixture" | "wav" | "decoded";
  /** one-line human detail for the rail (the decode path taken) */
  detail: string;
  sampleRate: number;
  channels: number;
  durationMs: number;
  /** interleaved samples (fixtures + web-audio path); unused on the wav bytes path */
  samples: Float32Array;
  /** raw container bytes when kind === "wav" — decodeWav runs on these */
  wavBytes: Uint8Array | null;
  sizeBytes: number;
};

/**
 * analyzeSource — one source into the genuine pipeline: wav containers ride
 * the bytes path (analyzeWavBytes → decodeWav), everything else analyzePcm
 * over the decoded interleaved samples. Throws the pipeline's own errors.
 */
export function analyzeSource(source: StudioSource): AnalysisReport {
  if (source.wavBytes) return analyzeWavBytes(source.wavBytes);
  return analyzePcm(source.samples, source.sampleRate, source.channels);
}

/**
 * fixtureSource — one built-in intro fixture by id (pure code synthesis, no
 * I/O); unknown ids throw immediately so the caller's catch shows the miss.
 */
export function fixtureSource(id: DemoFixtureId): StudioSource {
  const fixture: DemoFixture | undefined = demoFixtures().find((entry) => entry.id === id);
  if (!fixture) throw new Error(`studio: unknown fixture "${id}"`);
  return {
    name: fixture.name,
    kind: "fixture",
    detail: `${fixture.detail} · built-in`,
    sampleRate: fixture.sampleRate,
    channels: 1,
    durationMs: (fixture.samples.length / fixture.sampleRate) * 1000,
    samples: fixture.samples,
    wavBytes: null,
    sizeBytes: fixture.samples.byteLength,
  };
}

/** RIFF/WAVE sniff: the first 12 bytes carry the two tags. */
function isWavBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const tag = (at: number): string => String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
  return tag(0) === "RIFF" && tag(8) === "WAVE";
}

/** the browser AudioContext constructor or null (node/ssr has none). */
function audioContextCtor(): typeof AudioContext | null {
  const scope = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  return scope.AudioContext ?? scope.webkitAudioContext ?? null;
}

/**
 * fileSource — the dual decode path for one picked file: wav bytes go to the
 * native decodeWav lane (kept whole for analyzeWavBytes), every other
 * container goes through AudioContext.decodeAudioData + fromAudioBufferLike.
 * Browser-only guard: without an AudioContext the documented message throws
 * and the caller renders it. The context is always closed in `finally`.
 */
export async function fileSource(file: File): Promise<StudioSource> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`"${file.name}" is ${(file.size / 1048576).toFixed(1)} MB — the studio accepts files up to 64 MB.`);
  }
  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch (error) {
    throw new Error(`reading "${file.name}" failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }
  if (isWavBytes(bytes)) {
    const info = wavinfo(bytes);
    return {
      name: file.name,
      kind: "wav",
      detail: "wav container · native decode path",
      sampleRate: info.sampleRate,
      channels: info.channels,
      durationMs: info.durationSeconds * 1000,
      samples: new Float32Array(0),
      wavBytes: bytes,
      sizeBytes: file.size,
    };
  }
  const Ctor = audioContextCtor();
  if (!Ctor) {
    throw new Error(
      "decoding compressed audio needs a browser AudioContext (mp3/ogg/flac/m4a) and this environment has none — a .wav file decodes natively instead.",
    );
  }
  const context = new Ctor();
  try {
    // a private copy: decodeAudioData detaches the buffer it is handed
    const audioData = bytes.slice().buffer as ArrayBuffer;
    const buffer = await context.decodeAudioData(audioData);
    const channelData: Float32Array[] = [];
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      channelData.push(buffer.getChannelData(channel));
    }
    const frames = fromAudioBufferLike({ sampleRate: buffer.sampleRate, channelData });
    return {
      name: file.name,
      kind: "decoded",
      detail: `${file.type || "audio"} · web-audio decode path`,
      sampleRate: frames.sampleRate,
      channels: frames.channels,
      durationMs: (frames.length / frames.sampleRate) * 1000,
      samples: frames.samples,
      wavBytes: null,
      sizeBytes: file.size,
    };
  } catch (error) {
    throw new Error(
      `the browser decoder refused "${file.name}": ${error instanceof Error ? error.message : "unknown error"}`,
    );
  } finally {
    try {
      void context.close();
    } catch {
      // the context was already closed — nothing to do
    }
  }
}

