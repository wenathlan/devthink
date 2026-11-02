// # versawaseshaders — the GLSL material catalog and source validator of
// the versawase engine. shadercomp.ts owns the compositor fragment effects
// (film/optics vocabulary over a source texture); this module owns the 3d
// material lane: the vertex stages that carry a GeneratedMesh to clip space
// (mvp with normal matrix, flat mvp) and the fragment materials that shade
// it (lambert, toon, matcap, uv/normal debug, depth ramp), every source a
// real ES 3.00 program. The validator is the honest gate the family law
// asks for: brace/paren/bracket balance, the #version-first rule, the
// es 3.00 storage invariants (no gl_FragColor, no attribute/varying),
// declared-uniform extraction, required-uniform checks and the
// sampler-behind-texture() rule — all over comments-stripped source with
// line numbers preserved, answering typed issues instead of throwing. The
// catalog cross-checks itself (validateCatalogShaders) and the compositor
// library (validateLibraryEffects folds every shadercomp effect program
// through the same gate), so a broken body is refused before any manifest
// row ships. Pure node-side TypeScript: the sha-256 stamps ride node:crypto
// exactly like shadercomp, nothing here touches the GPU.

import { createHash } from "node:crypto";
import { compileEffectProgram, SHADER_EFFECTS } from "./shadercomp.ts";

/** one catalog stage: a real GLSL ES 3.00 source plus its declared uniforms. */
export interface ShaderStageEntry {
  id: string;
  stage: "vertex" | "fragment";
  label: string;
  /** the full GLSL source, `#version 300 es` first. */
  glsl: string;
  /** every uniform the source declares — the manifest contract. */
  uniforms: readonly string[];
}

/** one finding of the validator: what broke, and where. */
export interface ShaderIssue {
  /** stable machine code (unbalanced-braces, missing-uniform, ...). */
  code: string;
  /** 1-based line of the finding (0 when the source never reaches it). */
  line: number;
  message: string;
}

/** the typed answer of the validator — issues empty means ok. */
export interface ShaderValidation {
  ok: boolean;
  issues: readonly ShaderIssue[];
  /** the uniforms the source declares, in declaration order. */
  uniforms: readonly string[];
}

/** the validation options; every field carries a default. */
export interface ValidateShaderOptions {
  /** the stage the source claims to be (documented on the issue only). */
  stage?: "vertex" | "fragment";
  /** whether a `void main(` entry point is required (default true). */
  requiresMain?: boolean;
  /** uniforms the caller requires the source to declare. */
  requiredUniforms?: readonly string[];
}

/** strips line and block comments while preserving every line number. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (block) => "\n".repeat((block.match(/\n/g) ?? []).length))
    .replace(/\/\/[^\n]*/g, "");
}

/** 1-based line of a character index inside the source. */
function lineOf(source: string, index: number): number {
  let line = 1;
  for (let at = 0; at < index && at < source.length; at += 1) {
    if (source.charCodeAt(at) === 10) line += 1;
  }
  return line;
}

/** extracts the declared uniform names (declaration order, duplicates kept out). */
function declaredUniforms(stripped: string): string[] {
  const names: string[] = [];
  const pattern = /uniform\s+\w+\s+(\w+)\s*(?:\[[^\]]*\])?\s*;/g;
  for (const match of stripped.matchAll(pattern)) {
    if (!names.includes(match[1])) names.push(match[1]);
  }
  return names;
}

/**
 * Validates one GLSL source honestly: brace/paren/bracket balance with the
 * offending line, the #version-first-line rule, the es 3.00 invariants
 * (gl_FragColor and attribute/varying are refused), the main() entry point,
 * declared-uniform extraction, required-uniform presence and the rule that
 * texture() calls need a declared sampler. Comments are stripped first, so
 * commented-out damage never fools the gate and real line numbers survive.
 */
export function validateShaderSource(source: string, options: ValidateShaderOptions = {}): ShaderValidation {
  const issues: ShaderIssue[] = [];
  const requiresMain = options.requiresMain ?? true;
  if (typeof source !== "string" || source.trim().length === 0) {
    return { ok: false, issues: [{ code: "empty-source", line: 0, message: "the shader source is empty" }], uniforms: [] };
  }
  const stripped = stripComments(source);
  const uniforms = declaredUniforms(stripped);

  // bracket balance: every opener must close, and on its own nesting level
  const pairs: [string, string, string][] = [
    ["{", "}", "unbalanced-braces"],
    ["(", ")", "unbalanced-parens"],
    ["[", "]", "unbalanced-brackets"],
  ];
  for (const [open, close, code] of pairs) {
    const stack: number[] = [];
    let closedEarly = -1;
    for (let at = 0; at < stripped.length; at += 1) {
      const character = stripped[at];
      if (character === open) stack.push(at);
      else if (character === close) {
        const opened = stack.pop();
        if (opened === undefined) {
          closedEarly = at;
          break;
        }
      }
    }
    if (closedEarly >= 0)
      issues.push({ code, line: lineOf(stripped, closedEarly), message: `a "${close}" closes without its "${open}"` });
    else if (stack.length > 0)
      issues.push({ code, line: lineOf(stripped, stack[stack.length - 1]), message: `${stack.length} "${open}" never close` });
  }

  // the #version directive must lead the file when it appears at all
  const versionAt = stripped.search(/^\s*#\s*version\b/m);
  if (versionAt > 0)
    issues.push({ code: "version-not-first", line: lineOf(stripped, versionAt), message: "#version must be the first line of the source" });

  // es 3.00 storage invariants
  const fragColor = /\bgl_FragColor\b/.exec(stripped);
  if (fragColor)
    issues.push({ code: "es3-fragcolor", line: lineOf(stripped, fragColor.index), message: "gl_FragColor is es 1.00 storage — declare an out vec4 and write it" });
  const legacy = /\b(?:attribute|varying)\b/.exec(stripped);
  if (legacy)
    issues.push({
      code: "es3-legacy-storage",
      line: lineOf(stripped, legacy.index),
      message: `"${legacy[0]}" is es 1.00 storage — es 3.00 spells it in/out`,
    });

  // the entry point
  if (requiresMain && !/\bvoid\s+main\s*\(/.test(stripped))
    issues.push({ code: "missing-main", line: 0, message: "the source never declares `void main(`" });

  // required uniforms
  for (const required of options.requiredUniforms ?? []) {
    if (!uniforms.includes(required))
      issues.push({ code: "missing-uniform", line: 0, message: `the source never declares uniform "${required}"` });
  }

  // texture() needs a declared sampler
  if (/\btexture\s*\(/.test(stripped) && !/\buniform\s+sampler2D\s+\w+/.test(stripped))
    issues.push({ code: "texture-without-sampler", line: 0, message: "texture() is called but no sampler2D uniform is declared" });

  return { ok: issues.length === 0, issues, uniforms };
}

// ---------------------------------------------------------------------------
// the vertex stages
// ---------------------------------------------------------------------------

/** the mvp vertex stage with normals and uv (the material lane standard). */
const VERTEX_MVP_STANDARD =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "in vec3 aPosition;\n" +
  "in vec3 aNormal;\n" +
  "in vec2 aUv;\n" +
  "uniform mat4 uModel;\n" +
  "uniform mat4 uViewProjection;\n" +
  "uniform mat3 uNormalMatrix;\n" +
  "out vec3 vNormal;\n" +
  "out vec2 vUv;\n" +
  "void main() {\n" +
  "  vNormal = normalize(uNormalMatrix * aNormal);\n" +
  "  vUv = aUv;\n" +
  "  gl_Position = uViewProjection * uModel * vec4(aPosition, 1.0);\n" +
  "}\n";

/** the flat mvp vertex stage (positions only — the depth ramp rides it). */
const VERTEX_MVP_FLAT =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "in vec3 aPosition;\n" +
  "uniform mat4 uModel;\n" +
  "uniform mat4 uViewProjection;\n" +
  "void main() {\n" +
  "  gl_Position = uViewProjection * uModel * vec4(aPosition, 1.0);\n" +
  "}\n";

/** the vertex stages of the catalog. */
export const VERTEX_STAGES: readonly ShaderStageEntry[] = [
  {
    id: "mvp-standard",
    stage: "vertex",
    label: "mvp with normals and uv",
    glsl: VERTEX_MVP_STANDARD,
    uniforms: ["uModel", "uViewProjection", "uNormalMatrix"],
  },
  {
    id: "mvp-flat",
    stage: "vertex",
    label: "flat mvp (positions only)",
    glsl: VERTEX_MVP_FLAT,
    uniforms: ["uModel", "uViewProjection"],
  },
];

// ---------------------------------------------------------------------------
// the fragment materials
// ---------------------------------------------------------------------------

/** the lambert material: diffuse plus a documented ambient floor. */
const FRAGMENT_LAMBERT =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "uniform vec3 uLightDirection;\n" +
  "uniform vec3 uLightColor;\n" +
  "uniform vec3 uBaseColor;\n" +
  "in vec3 vNormal;\n" +
  "in vec2 vUv;\n" +
  "out vec4 outColor;\n" +
  "void main() {\n" +
  "  vec3 normal = normalize(vNormal);\n" +
  "  float diffuse = max(dot(normal, normalize(uLightDirection)), 0.0);\n" +
  "  vec3 lit = uBaseColor * uLightColor * (0.18 + 0.82 * diffuse);\n" +
  "  outColor = vec4(lit, 1.0);\n" +
  "}\n";

/** the toon material: the diffuse term quantized into bands. */
const FRAGMENT_TOON =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "uniform vec3 uLightDirection;\n" +
  "uniform vec3 uBaseColor;\n" +
  "uniform float uBands;\n" +
  "in vec3 vNormal;\n" +
  "in vec2 vUv;\n" +
  "out vec4 outColor;\n" +
  "void main() {\n" +
  "  vec3 normal = normalize(vNormal);\n" +
  "  float diffuse = max(dot(normal, normalize(uLightDirection)), 0.0);\n" +
  "  float bands = max(uBands, 1.0);\n" +
  "  float quantized = floor(diffuse * bands) / max(bands - 1.0, 1.0);\n" +
  "  outColor = vec4(uBaseColor * (0.35 + 0.65 * quantized), 1.0);\n" +
  "}\n";

/** the matcap material: the view-space normal mapped onto a sampler look. */
const FRAGMENT_MATCAP =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "uniform sampler2D uMatcap;\n" +
  "in vec3 vNormal;\n" +
  "in vec2 vUv;\n" +
  "out vec4 outColor;\n" +
  "void main() {\n" +
  "  vec3 normal = normalize(vNormal);\n" +
  "  vec2 cap = normal.xy * 0.5 + 0.5;\n" +
  "  outColor = vec4(texture(uMatcap, cap).rgb, 1.0);\n" +
  "}\n";

/** the uv debug material: paints the interpolated uv coordinates. */
const FRAGMENT_UV_DEBUG =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "in vec3 vNormal;\n" +
  "in vec2 vUv;\n" +
  "out vec4 outColor;\n" +
  "void main() {\n" +
  "  outColor = vec4(vUv, 0.0, 1.0);\n" +
  "}\n";

/** the normal debug material: normals mapped from -1..1 into 0..1 rgb. */
const FRAGMENT_NORMAL_DEBUG =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "in vec3 vNormal;\n" +
  "in vec2 vUv;\n" +
  "out vec4 outColor;\n" +
  "void main() {\n" +
  "  vec3 normal = normalize(vNormal) * 0.5 + 0.5;\n" +
  "  outColor = vec4(normal, 1.0);\n" +
  "}\n";

/** the depth ramp material: the window depth painted as a near-white ramp. */
const FRAGMENT_DEPTH_RAMP =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "out vec4 outColor;\n" +
  "void main() {\n" +
  "  float depth = gl_FragCoord.z;\n" +
  "  outColor = vec4(vec3(1.0 - depth), 1.0);\n" +
  "}\n";

/** the fragment materials of the catalog, each with its vertex pairing. */
export const FRAGMENT_MATERIALS: readonly (ShaderStageEntry & { vertexStage: string })[] = [
  {
    id: "lambert",
    stage: "fragment",
    label: "lambert diffuse",
    glsl: FRAGMENT_LAMBERT,
    uniforms: ["uLightDirection", "uLightColor", "uBaseColor"],
    vertexStage: "mvp-standard",
  },
  {
    id: "toon",
    stage: "fragment",
    label: "banded toon",
    glsl: FRAGMENT_TOON,
    uniforms: ["uLightDirection", "uBaseColor", "uBands"],
    vertexStage: "mvp-standard",
  },
  {
    id: "matcap",
    stage: "fragment",
    label: "matcap look",
    glsl: FRAGMENT_MATCAP,
    uniforms: ["uMatcap"],
    vertexStage: "mvp-standard",
  },
  {
    id: "uvdebug",
    stage: "fragment",
    label: "uv debug",
    glsl: FRAGMENT_UV_DEBUG,
    uniforms: [],
    vertexStage: "mvp-standard",
  },
  {
    id: "normaldebug",
    stage: "fragment",
    label: "normal debug",
    glsl: FRAGMENT_NORMAL_DEBUG,
    uniforms: [],
    vertexStage: "mvp-standard",
  },
  {
    id: "depthramp",
    stage: "fragment",
    label: "depth ramp",
    glsl: FRAGMENT_DEPTH_RAMP,
    uniforms: [],
    vertexStage: "mvp-flat",
  },
];

/** one compiled material program: both stages, both hashes, the uniform manifest. */
export interface MaterialProgram {
  id: string;
  vertexStage: string;
  fragmentStage: string;
  vertexSource: string;
  fragmentSource: string;
  vertexSha256: string;
  fragmentSha256: string;
  /** every uniform both stages declare (vertex first, then fragment). */
  uniforms: readonly string[];
}

/** the material ids the catalog answers (the caller-facing surface). */
export function materialIds(): readonly string[] {
  return FRAGMENT_MATERIALS.map((material) => material.id);
}

/**
 * Compiles one catalog material into its program pair: the paired vertex
 * stage, the fragment source, the sha-256 of each (the PrecompiledShader
 * doctrine — a visitor machine never compiles a shader) and the uniform
 * manifest of both stages. Unknown ids answer null — no pretend program.
 */
export function compileMaterialProgram(id: string): MaterialProgram | null {
  const material = FRAGMENT_MATERIALS.find((entry) => entry.id === id);
  if (!material) return null;
  const vertex = VERTEX_STAGES.find((stage) => stage.id === material.vertexStage);
  if (!vertex) return null;
  return {
    id: material.id,
    vertexStage: vertex.id,
    fragmentStage: material.id,
    vertexSource: vertex.glsl,
    fragmentSource: material.glsl,
    vertexSha256: createHash("sha256").update(vertex.glsl, "utf8").digest("hex"),
    fragmentSha256: createHash("sha256").update(material.glsl, "utf8").digest("hex"),
    uniforms: [...vertex.uniforms, ...material.uniforms],
  };
}

/** validates every catalog stage against its own declared uniforms. */
export function validateCatalogShaders(): { id: string; validation: ShaderValidation }[] {
  const rows: { id: string; validation: ShaderValidation }[] = [];
  for (const stage of [...VERTEX_STAGES, ...FRAGMENT_MATERIALS]) {
    rows.push({
      id: stage.id,
      validation: validateShaderSource(stage.glsl, { stage: stage.stage, requiredUniforms: stage.uniforms }),
    });
  }
  return rows;
}

/**
 * Cross-checks the compositor library: every shadercomp effect compiled into
 * its full program (header + body + footer) and folded through the same
 * validator, with the pass uniforms required. A broken effect body surfaces
 * here before any manifest row ships.
 */
export function validateLibraryEffects(): { id: string; validation: ShaderValidation }[] {
  const rows: { id: string; validation: ShaderValidation }[] = [];
  for (const effect of SHADER_EFFECTS) {
    const compiled = compileEffectProgram(effect.id, 0);
    rows.push({
      id: effect.id,
      validation: compiled
        ? validateShaderSource(compiled.program, { stage: "fragment", requiredUniforms: ["uSource", "uResolution", "uTime", "uAmount"] })
        : {
            ok: false,
            issues: [{ code: "unknown-effect", line: 0, message: `effect "${effect.id}" did not compile` }],
            uniforms: [],
          },
    });
  }
  return rows;
}
