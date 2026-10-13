// # shadercomp — the fragment effect library and pass compiler of the versawase
// compositor, housed at the cadria root. Every effect is a named fragment body
// drawn from real film and optics vocabulary (lap dissolve, raccord, halation),
// compiled into a deterministic WebGL2/WebGPU-ready program whose sha-256 feeds
// the PrecompiledShader manifest of versawase.ts — no visitor machine ever
// compiles a shader. The library owns effects and programs only: amounts are
// caller-supplied, sources are textures the runtime binds, and nothing here
// touches the DOM or the GPU. Unknown ids and damaged ranges answer typed
// outcomes instead of throwing, mirroring the transcodeplan contract. The
// dissolve planner answers the lap-dissolve/raccord tension of the family as
// pure per-step opacity ramps, deterministic over any step count.

import { createHash } from "node:crypto";
import { type PrecompiledShader, shaderManifestComplete } from "./versawase.ts";

/** Every named effect of the compositor library. */
export type ShaderEffectId =
  | "lapdissolve"
  | "fadeblack"
  | "raccordflash"
  | "halation"
  | "prismsplit"
  | "bloompass"
  | "vignette"
  | "grainfilm"
  | "scandrape"
  | "inkbleed"
  | "chromaoffset"
  | "edgeglitch";

/** One library effect: a pure fragment body plus its honest amount range. */
export interface ShaderEffect {
  id: ShaderEffectId;
  label: string;
  /** film-technique family the effect belongs to */
  family: "transition" | "optics" | "texture" | "artifact";
  /** glsl body: vec4 effect(vec4 src, vec2 uv, float time, float amount) */
  glsl: string;
  defaultAmount: number;
  minAmount: number;
  maxAmount: number;
}

/** The compiled program of one effect pass (byte-deterministic for a given id). */
export interface EffectProgram {
  effectId: ShaderEffectId;
  amount: number;
  /** the full fragment program source, stable byte for byte */
  program: string;
  /** sha-256 of the program — the PrecompiledShader.sha256 contract */
  sha256: string;
}

/** One opacity step of a dissolve plan (both layers sum to one over a lap dissolve). */
export interface DissolveStep {
  seconds: number;
  /** opacity of the outgoing layer */
  baseOpacity: number;
  /** opacity of the incoming layer */
  overlayOpacity: number;
}

/** The dissolve plan: which technique, over how long, ramped at which steps. */
export interface DissolvePlan {
  technique: "straight-cut" | "lap-dissolve" | "fade-through-black";
  durationSeconds: number;
  steps: readonly DissolveStep[];
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const FRAGMENT_HEADER =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "uniform sampler2D uSource;\n" +
  "uniform vec2 uResolution;\n" +
  "uniform float uTime;\n" +
  "uniform float uAmount;\n" +
  "in vec2 vUv;\n" +
  "out vec4 outColor;\n";

const FRAGMENT_FOOTER =
  "void main() { outColor = effect(texture(uSource, vUv), vUv, uTime, uAmount); }\n";

/** The library itself — every body is a pure function of (src, uv, time, amount). */
export const SHADER_EFFECTS: readonly ShaderEffect[] = [
  {
    id: "lapdissolve",
    label: "lap dissolve",
    family: "transition",
    glsl:
      "vec4 effect(vec4 src, vec2 uv, float time, float amount) {\n" +
      "  vec4 overlay = texture(uSource, uv + vec2(0.0005 * amount, 0.0));\n" +
      "  return mix(src, overlay, clamp(amount, 0.0, 1.0));\n" +
      "}\n",
    defaultAmount: 0.5,
    minAmount: 0,
    maxAmount: 1,
  },
  {
    id: "fadeblack",
    label: "fade through black",
    family: "transition",
    glsl:
      "vec4 effect(vec4 src, vec2 uv, float time, float amount) {\n" +
      "  float dip = smoothstep(0.0, 0.5, amount) * (1.0 - smoothstep(0.5, 1.0, amount));\n" +
      "  return src * (1.0 - dip);\n" +
      "}\n",
    defaultAmount: 0.5,
    minAmount: 0,
    maxAmount: 1,
  },
  {
    id: "raccordflash",
    label: "raccord flash frame",
    family: "transition",
    glsl:
      "vec4 effect(vec4 src, vec2 uv, float time, float amount) {\n" +
      "  float flash = step(0.5, fract(time * 24.0)) * amount;\n" +
      "  return mix(src, vec4(1.0), flash * 0.35);\n" +
      "}\n",
    defaultAmount: 0.2,
    minAmount: 0,
    maxAmount: 1,
  },
  {
    id: "halation",
    label: "halation bloom",
    family: "optics",
    glsl:
      "vec4 effect(vec4 src, vec2 uv, float time, float amount) {\n" +
      "  float lum = dot(src.rgb, vec3(0.2126, 0.7152, 0.0722));\n" +
      "  float halo = smoothstep(0.55, 1.0, lum) * amount;\n" +
      "  vec3 warm = vec3(1.0, 0.82, 0.66);\n" +
      "  return vec4(src.rgb + warm * halo * 0.45, src.a);\n" +
      "}\n",
    defaultAmount: 0.4,
    minAmount: 0,
    maxAmount: 1,
  },
  {
    id: "prismsplit",
    label: "prism split",
    family: "optics",
    glsl:
      "vec4 effect(vec4 src, vec2 uv, float time, float amount) {\n" +
      "  vec2 dir = uv - vec2(0.5);\n" +
      "  float shift = 0.004 * amount;\n" +
      "  float r = texture(uSource, uv + dir * shift).r;\n" +
      "  float b = texture(uSource, uv - dir * shift).b;\n" +
      "  return vec4(r, src.g, b, src.a);\n" +
      "}\n",
    defaultAmount: 0.3,
    minAmount: 0,
    maxAmount: 1,
  },
  {
    id: "bloompass",
    label: "soft bloom",
    family: "optics",
    glsl:
      "vec4 effect(vec4 src, vec2 uv, float time, float amount) {\n" +
      "  vec3 blur = vec3(0.0);\n" +
      "  for (int i = 0; i < 4; i++) {\n" +
      "    float fi = float(i) + 1.0;\n" +
      "    vec2 off = vec2(fi, fi * 0.6) * (0.004 * amount);\n" +
      "    blur += texture(uSource, uv + off).rgb;\n" +
      "    blur += texture(uSource, uv - off).rgb;\n" +
      "  }\n" +
      "  return vec4(src.rgb + blur * 0.08 * amount, src.a);\n" +
      "}\n",
    defaultAmount: 0.5,
    minAmount: 0,
    maxAmount: 1,
  },
  {
    id: "vignette",
    label: "lens vignette",
    family: "optics",
    glsl:
      "vec4 effect(vec4 src, vec2 uv, float time, float amount) {\n" +
      "  float d = length(uv - vec2(0.5));\n" +
      "  float mask = 1.0 - smoothstep(0.35, 0.78, d) * amount;\n" +
      "  return vec4(src.rgb * mask, src.a);\n" +
      "}\n",
    defaultAmount: 0.45,
    minAmount: 0,
    maxAmount: 1,
  },
  {
    id: "grainfilm",
    label: "film grain",
    family: "texture",
    glsl:
      "vec4 effect(vec4 src, vec2 uv, float time, float amount) {\n" +
      "  vec2 seed = uv * vec2(1024.0, 768.0) + fract(time) * 91.7;\n" +
      "  float noise = fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);\n" +
      "  float g = (noise - 0.5) * 0.18 * amount;\n" +
      "  return vec4(src.rgb + g, src.a);\n" +
      "}\n",
    defaultAmount: 0.35,
    minAmount: 0,
    maxAmount: 1,
  },
  {
    id: "scandrape",
    label: "scanline drape",
    family: "texture",
    glsl:
      "vec4 effect(vec4 src, vec2 uv, float time, float amount) {\n" +
      "  float line = sin(uv.y * uResolution.y * 3.14159) * 0.5 + 0.5;\n" +
      "  float mask = mix(1.0, 0.55 + 0.45 * line, amount);\n" +
      "  return vec4(src.rgb * mask, src.a);\n" +
      "}\n",
    defaultAmount: 0.3,
    minAmount: 0,
    maxAmount: 1,
  },
  {
    id: "inkbleed",
    label: "ink bleed edges",
    family: "texture",
    glsl:
      "vec4 effect(vec4 src, vec2 uv, float time, float amount) {\n" +
      "  float edge = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));\n" +
      "  float bleed = smoothstep(0.12, 0.0, edge) * amount;\n" +
      "  vec3 ink = src.rgb * (1.0 - bleed) + vec3(0.02, 0.02, 0.03) * bleed;\n" +
      "  return vec4(ink, src.a);\n" +
      "}\n",
    defaultAmount: 0.4,
    minAmount: 0,
    maxAmount: 1,
  },
  {
    id: "chromaoffset",
    label: "chroma offset",
    family: "artifact",
    glsl:
      "vec4 effect(vec4 src, vec2 uv, float time, float amount) {\n" +
      "  float t = sin(time * 6.2831) * 0.002 * amount;\n" +
      "  float r = texture(uSource, uv + vec2(t, 0.0)).r;\n" +
      "  float b = texture(uSource, uv - vec2(t, 0.0)).b;\n" +
      "  return vec4(r, src.g, b, src.a);\n" +
      "}\n",
    defaultAmount: 0.25,
    minAmount: 0,
    maxAmount: 1,
  },
  {
    id: "edgeglitch",
    label: "edge glitch",
    family: "artifact",
    glsl:
      "vec4 effect(vec4 src, vec2 uv, float time, float amount) {\n" +
      "  float band = floor(uv.y * 24.0);\n" +
      "  float jump = step(0.92, fract(sin(band * 91.17 + floor(time * 12.0)) * 43758.5453));\n" +
      "  vec2 shifted = uv + vec2(jump * 0.03 * amount, 0.0);\n" +
      "  return texture(uSource, shifted);\n" +
      "}\n",
    defaultAmount: 0.2,
    minAmount: 0,
    maxAmount: 1,
  },
];

const effectById = (id: string): ShaderEffect | undefined =>
  SHADER_EFFECTS.find((effect) => effect.id === id);

/** The program header/footer wrap: shared, so the sha only moves when a body moves. */
export function compileEffectProgram(effectId: string, amount: number): EffectProgram | null {
  const effect = effectById(effectId);
  if (!effect) return null;
  const bounded = Number.isFinite(amount)
    ? clamp01((amount - effect.minAmount) / (effect.maxAmount - effect.minAmount || 1)) *
        (effect.maxAmount - effect.minAmount) +
      effect.minAmount
    : effect.defaultAmount;
  const normalized = Number(bounded.toFixed(6));
  const program = FRAGMENT_HEADER + effect.glsl + FRAGMENT_FOOTER;
  const sha256 = createHash("sha256").update(program, "utf8").digest("hex");
  return { effectId: effect.id, amount: normalized, program, sha256 };
}

/** The PrecompiledShader manifest rows for the whole library (or a chosen subset). */
export function shaderManifest(ids?: readonly ShaderEffectId[]): PrecompiledShader[] {
  const chosen = ids && ids.length > 0 ? ids : SHADER_EFFECTS.map((effect) => effect.id);
  const rows: PrecompiledShader[] = [];
  for (const id of chosen) {
    const compiled = compileEffectProgram(id, 0);
    if (!compiled) continue;
    rows.push({ id: `${compiled.effectId}-fragment`, stage: "fragment", artifact: `inline://shadercomp/${compiled.effectId}`, sha256: compiled.sha256 });
  }
  return rows;
}

/** True when every requested id exists in the library (the typed gate for callers). */
export function shaderIdsKnown(ids: readonly string[]): boolean {
  return ids.every((id) => effectById(id) !== undefined);
}

/** The straight-cut plan: binary opacities, one boundary at the midpoint. */
const straightCut = (durationSeconds: number, stepCount: number): DissolvePlan => {
  const half = durationSeconds / 2;
  const steps: DissolveStep[] = [];
  for (let index = 0; index < stepCount; index += 1) {
    const seconds = (durationSeconds * index) / (stepCount - 1 || 1);
    const outgoing = seconds < half;
    steps.push({ seconds, baseOpacity: outgoing ? 1 : 0, overlayOpacity: outgoing ? 0 : 1 });
  }
  return { technique: "straight-cut", durationSeconds, steps };
};

/** The lap-dissolve plan: the two layers crossfade and always sum to one. */
const lapDissolve = (durationSeconds: number, stepCount: number): DissolvePlan => {
  const steps: DissolveStep[] = [];
  for (let index = 0; index < stepCount; index += 1) {
    const ratio = index / (stepCount - 1 || 1);
    const overlay = clamp01(Number(ratio.toFixed(6)));
    steps.push({ seconds: durationSeconds * ratio, baseOpacity: Number((1 - overlay).toFixed(6)), overlayOpacity: overlay });
  }
  return { technique: "lap-dissolve", durationSeconds, steps };
};

/** The fade-through-black plan: outgoing dips to zero at the half, overlay rises after. */
const fadeThroughBlack = (durationSeconds: number, stepCount: number): DissolvePlan => {
  const half = durationSeconds / 2;
  const steps: DissolveStep[] = [];
  for (let index = 0; index < stepCount; index += 1) {
    const ratio = index / (stepCount - 1 || 1);
    const seconds = durationSeconds * ratio;
    const firstHalf = seconds <= half;
    const local = firstHalf ? seconds / (half || 1) : (seconds - half) / (half || 1);
    steps.push({
      seconds,
      baseOpacity: firstHalf ? Number((1 - local).toFixed(6)) : 0,
      overlayOpacity: firstHalf ? 0 : Number(clamp01(local).toFixed(6)),
    });
  }
  return { technique: "fade-through-black", durationSeconds, steps };
};

/** The typed outcome every dissolve request answers. */
export type DissolveOutcome =
  | { ok: true; plan: DissolvePlan }
  | { ok: false; error: "dissolve-unknown-technique" | "dissolve-bad-duration" | "dissolve-bad-steps" };

/** Plans a transition ramp: unknown technique, non-finite or non-positive duration,
 * and step counts under 2 answer { ok: false, error } — nothing throws. */
export function dissolvePlan(
  technique: string,
  durationSeconds: number,
  stepCount = 24,
): DissolveOutcome {
  if (technique !== "straight-cut" && technique !== "lap-dissolve" && technique !== "fade-through-black")
    return { ok: false, error: "dissolve-unknown-technique" };
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0)
    return { ok: false, error: "dissolve-bad-duration" };
  if (!Number.isInteger(stepCount) || stepCount < 2)
    return { ok: false, error: "dissolve-bad-steps" };
  if (technique === "straight-cut") return { ok: true, plan: straightCut(durationSeconds, stepCount) };
  if (technique === "fade-through-black") return { ok: true, plan: fadeThroughBlack(durationSeconds, stepCount) };
  return { ok: true, plan: lapDissolve(durationSeconds, stepCount) };
}

/** Honest gate for callers that persist manifests: the library always ships complete rows. */
export function libraryManifestComplete(): boolean {
  return shaderManifestComplete(shaderManifest());
}
