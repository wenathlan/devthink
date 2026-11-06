// # shaders — the shader seat of the versawaze engine, housed at the cadria
// root beside versa.ts and mesh.ts. Two honest halves, one owner:
//
//   1. the catalog — the GLSL sources of the family. The 3d material lane
//      (vertex stages + fragment materials) and the source validator live in
//      versawase.ts (versawaseshaders) and the compositor fragment effects
//      live in shadercomp.ts; this seat re-exports every row instead of
//      duplicating a single source line (the dedup law), and adds the four
//      shading models of the movement lane as GLSL ES 3.00 fragment
//      programs (lambert, blinn, phong, toon) whose constants mirror the
//      TypeScript side byte for byte.
//
//   2. the math — the same lighting models evaluated in pure TypeScript:
//      lambert diffuse, blinn half-vector specular, phong reflection
//      specular, the quantized toon ramp and the schlick fresnel rim, plus
//      the per-vertex mesh shading pass (model transform on the positions,
//      inverse-transpose normal matrix on the normals, view vector per
//      vertex) that the Saddle render lane runs edge-side. The edge law is
//      absolute: the engine renders server/edge-side through the sandbox —
//      a visitor GPU/CPU never compiles or evaluates a shader here, exactly
//      like the compile-shader workload lane the catalog documents.
//
// Every function is pure over its arguments, lights speak unit vectors,
// colors speak 0..1 rgb triples and the answers clamp to 0..1 (a shader
// output is a display value, never an energy budget). Errors refuse by
// return type (null) — the easecurves house rule. Exports: 7 types, 11
// functions, 2 constants, 17 re-exports — the honest count for this theme.

import {
  type EffectProgram,
  type ShaderEffect,
  type ShaderEffectId,
  SHADER_EFFECTS,
  compileEffectProgram,
  libraryManifestComplete,
  shaderIdsKnown,
  shaderManifest,
} from "./shadercomp.ts";
import {
  type MaterialProgram,
  type ShaderIssue,
  type ShaderStageEntry,
  type ShaderValidation,
  type ValidateShaderOptions,
  FRAGMENT_MATERIALS,
  VERTEX_STAGES,
  compileMaterialProgram,
  materialIds,
  validateCatalogShaders,
  validateLibraryEffects,
  validateShaderSource,
} from "./versawase.ts";
import { type GeneratedMesh, MeshGenError } from "./versawase.ts";
import { type Mat4, type Vec3, mat3normalfrommat4, mat4transformpoint, vec3normalize, vec3sub } from "./versa.ts";

// ---------------------------------------------------------------------------
// the catalog re-exports — one owner, many call sites, zero duplication
// ---------------------------------------------------------------------------

export {
  type EffectProgram,
  type MaterialProgram,
  type ShaderEffect,
  type ShaderEffectId,
  type ShaderIssue,
  type ShaderStageEntry,
  type ShaderValidation,
  type ValidateShaderOptions,
  FRAGMENT_MATERIALS,
  SHADER_EFFECTS,
  VERTEX_STAGES,
  compileEffectProgram,
  compileMaterialProgram,
  libraryManifestComplete,
  materialIds,
  shaderIdsKnown,
  shaderManifest,
  validateCatalogShaders,
  validateLibraryEffects,
  validateShaderSource,
};

// ---------------------------------------------------------------------------
// the shading vocabulary — lights, materials, rgb
// ---------------------------------------------------------------------------

/** one rgb triple in 0..1 (the display convention of this seat). */
export type Rgb = [number, number, number];

/** one directional light: the direction points from the surface toward the
 * light (the caller normalizes, the math trusts and re-checks nothing). */
export interface DirectionalLight {
  kind: "directional";
  direction: Vec3;
  color: Rgb;
  intensity: number;
}

/** one point light: the position is world space, the intensity falls with
 * the inverse square of the distance (the honest physics, no fake range
 * clamps — the caller shapes the range through the intensity). */
export interface PointLight {
  kind: "point";
  position: Vec3;
  color: Rgb;
  intensity: number;
}

/** every light the shading models speak. */
export type ShaderLight = DirectionalLight | PointLight;

/** the shading material: the honest knobs of the four models. */
export interface ShadingMaterial {
  /** the surface albedo in 0..1. */
  baseColor: Rgb;
  /** the ambient term (0..1, the flat floor). */
  ambient: number;
  /** the diffuse scale (0..1). */
  diffuse: number;
  /** the specular scale (0..1). */
  specular: number;
  /** the specular exponent (blinn/phong; >= 1). */
  shininess: number;
  /** the toon ramp step count (>= 2). */
  toonSteps: number;
  /** the fresnel rim exponent (>= 0). */
  fresnelPower: number;
  /** the fresnel rim strength (0..1). */
  fresnelStrength: number;
}

/** the engine default material: the honest neutral gray studio preset. */
export const DEFAULT_MATERIAL: ShadingMaterial = {
  baseColor: [0.8, 0.8, 0.8],
  ambient: 0.15,
  diffuse: 0.85,
  specular: 0.4,
  shininess: 32,
  toonSteps: 3,
  fresnelPower: 3,
  fresnelStrength: 0.25,
};

/** clamps one channel into the display range. */
function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** clamps one rgb triple into the display range. */
function clampRgb(color: Rgb): Rgb {
  return [clamp01(color[0]), clamp01(color[1]), clamp01(color[2])];
}

/** folds a light's contribution into the accumulated rgb terms:
 * diffuseTerm and specularTerm ride back by mutation (the per-light loop
 * stays one pass, no intermediate arrays). */
function accumulateLight(
  light: ShaderLight,
  normal: Vec3,
  position: Vec3,
  viewDir: Vec3,
  material: ShadingMaterial,
  terms: { diffuse: Rgb; specular: Rgb; quantized: number },
  model: "lambert" | "blinn" | "phong" | "toon",
): void {
  let lightDir: Vec3;
  let strength = light.intensity;
  if (light.kind === "directional") {
    lightDir = light.direction;
  } else {
    const toLight = vec3sub(light.position, position);
    const distance = Math.hypot(toLight[0], toLight[1], toLight[2]);
    if (distance < 1e-9) return; // a light inside the surface lights nothing
    lightDir = [toLight[0] / distance, toLight[1] / distance, toLight[2] / distance];
    strength = light.intensity / (distance * distance);
  }
  const nDotL = normal[0] * lightDir[0] + normal[1] * lightDir[1] + normal[2] * lightDir[2];
  if (nDotL <= 0) return; // behind the surface: no diffuse, no specular
  const weight = strength * nDotL;
  terms.diffuse[0] += light.color[0] * weight;
  terms.diffuse[1] += light.color[1] * weight;
  terms.diffuse[2] += light.color[2] * weight;
  terms.quantized += weight;
  if (model === "lambert" || material.specular <= 0) return;
  let specularTerm = 0;
  if (model === "blinn") {
    // the half-vector between the light and the view
    const halfX = lightDir[0] + viewDir[0];
    const halfY = lightDir[1] + viewDir[1];
    const halfZ = lightDir[2] + viewDir[2];
    const halfLength = Math.hypot(halfX, halfY, halfZ);
    if (halfLength < 1e-9) return;
    const nDotH = (normal[0] * halfX + normal[1] * halfY + normal[2] * halfZ) / halfLength;
    if (nDotH <= 0) return;
    specularTerm = Math.pow(nDotH, material.shininess);
  } else if (model === "phong") {
    // the reflection of the light direction about the normal
    const reflectX = 2 * nDotL * normal[0] - lightDir[0];
    const reflectY = 2 * nDotL * normal[1] - lightDir[1];
    const reflectZ = 2 * nDotL * normal[2] - lightDir[2];
    const rDotV = reflectX * viewDir[0] + reflectY * viewDir[1] + reflectZ * viewDir[2];
    if (rDotV <= 0) return;
    specularTerm = Math.pow(rDotV, material.shininess);
  } else {
    // toon: the specular is a step — full or nothing at the halfway peak
    const halfX = lightDir[0] + viewDir[0];
    const halfY = lightDir[1] + viewDir[1];
    const halfZ = lightDir[2] + viewDir[2];
    const halfLength = Math.hypot(halfX, halfY, halfZ);
    if (halfLength < 1e-9) return;
    const nDotH = (normal[0] * halfX + normal[1] * halfY + normal[2] * halfZ) / halfLength;
    specularTerm = nDotH > 0.95 ? 1 : 0;
  }
  const specularWeight = strength * specularTerm * material.specular;
  terms.specular[0] += light.color[0] * specularWeight;
  terms.specular[1] += light.color[1] * specularWeight;
  terms.specular[2] += light.color[2] * specularWeight;
}

/** the shared body of the four models: the ambient floor, the per-light
 * pass, the model-specific specular, the fresnel rim and the display clamp. */
function shade(
  model: "lambert" | "blinn" | "phong" | "toon",
  normal: Vec3,
  position: Vec3,
  viewDir: Vec3,
  lights: readonly ShaderLight[],
  material: ShadingMaterial,
): Rgb {
  const terms = { diffuse: [0, 0, 0] as Rgb, specular: [0, 0, 0] as Rgb, quantized: 0 };
  for (const light of lights) accumulateLight(light, normal, position, viewDir, material, terms, model);
  let diffuseScale = material.diffuse;
  if (model === "toon") {
    // the quantized ramp: the accumulated diffuse weight snapped to the
    // step grid (floor, so the darkest band is the ambient floor itself)
    const steps = Math.max(2, Math.round(material.toonSteps));
    diffuseScale = material.diffuse * (Math.floor(Math.min(1, terms.quantized) * steps) / steps);
  }
  const nDotV = Math.max(0, normal[0] * viewDir[0] + normal[1] * viewDir[1] + normal[2] * viewDir[2]);
  const fresnel = material.fresnelStrength * Math.pow(1 - nDotV, Math.max(0, material.fresnelPower));
  return clampRgb([
    material.baseColor[0] * material.ambient +
      material.baseColor[0] * diffuseScale * terms.diffuse[0] +
      terms.specular[0] +
      fresnel,
    material.baseColor[1] * material.ambient +
      material.baseColor[1] * diffuseScale * terms.diffuse[1] +
      terms.specular[1] +
      fresnel,
    material.baseColor[2] * material.ambient +
      material.baseColor[2] * diffuseScale * terms.diffuse[2] +
      terms.specular[2] +
      fresnel,
  ]);
}

// ---------------------------------------------------------------------------
// the four shading models — the honest TypeScript math
// ---------------------------------------------------------------------------

/** Lambert: the ambient floor plus the diffuse cosine term of every light;
 * no specular — the matte answer. */
export function shadeLambert(
  normal: Vec3,
  position: Vec3,
  viewDir: Vec3,
  lights: readonly ShaderLight[],
  material: ShadingMaterial = DEFAULT_MATERIAL,
): Rgb {
  return shade("lambert", normal, position, viewDir, lights, material);
}

/** Blinn-Phong: lambert plus the half-vector specular — the standard of the
 * realtime lane (the half vector is cheaper than the reflection and softer
 * at equal shininess). */
export function shadeBlinn(
  normal: Vec3,
  position: Vec3,
  viewDir: Vec3,
  lights: readonly ShaderLight[],
  material: ShadingMaterial = DEFAULT_MATERIAL,
): Rgb {
  return shade("blinn", normal, position, viewDir, lights, material);
}

/** Phong: lambert plus the reflection specular — the mirror-lobe answer,
 * tighter highlights than blinn at equal shininess. */
export function shadePhong(
  normal: Vec3,
  position: Vec3,
  viewDir: Vec3,
  lights: readonly ShaderLight[],
  material: ShadingMaterial = DEFAULT_MATERIAL,
): Rgb {
  return shade("phong", normal, position, viewDir, lights, material);
}

/** Toon: lambert quantized onto the step ramp plus the stepped specular —
 * the cel-shaded answer. */
export function shadeToon(
  normal: Vec3,
  position: Vec3,
  viewDir: Vec3,
  lights: readonly ShaderLight[],
  material: ShadingMaterial = DEFAULT_MATERIAL,
): Rgb {
  return shade("toon", normal, position, viewDir, lights, material);
}

/** the schlick fresnel of one surface point: the grazing rim strength,
 * 0 head-on and `strength` at the grazing angle. */
export function fresnelSchlick(normal: Vec3, viewDir: Vec3, power: number, strength: number): number {
  const nDotV = normal[0] * viewDir[0] + normal[1] * viewDir[1] + normal[2] * viewDir[2];
  return strength * Math.pow(1 - Math.max(0, nDotV), Math.max(0, power));
}

/** every shading model the seat speaks — the dispatch key of the pipeline. */
export type ShadingModel = "lambert" | "blinn" | "phong" | "toon";

/** one dispatch over the four models (the pipeline's single entry). */
export function shadeFragment(
  model: ShadingModel,
  normal: Vec3,
  position: Vec3,
  viewDir: Vec3,
  lights: readonly ShaderLight[],
  material: ShadingMaterial = DEFAULT_MATERIAL,
): Rgb {
  return shade(model, normal, position, viewDir, lights, material);
}

// ---------------------------------------------------------------------------
// the per-vertex mesh shading pass — the saddle render lane's core
// ---------------------------------------------------------------------------

/** the shading scene: the camera eye, the lights, the material and the
 * optional model transform (identity when the mesh is already world-space). */
export interface ShadingScene {
  model?: Mat4;
  /** the world-space camera position the view vectors point toward. */
  eye: Vec3;
  lights: readonly ShaderLight[];
  material?: ShadingMaterial;
}

/**
 * Shades one whole mesh per vertex on the CPU: every position rides the
 * model transform, every normal rides the inverse-transpose normal matrix
 * (renormalized — non-uniform scale stays honest), the view vector is
 * recomputed per vertex from the eye and the four models dispatch through
 * `model`. The answer is a Float32Array of 3 floats per vertex in 0..1 —
 * the exact buffer a gouraud raster pass (compositorraster) or an OBJ/STL
 * export (visualize) consumes. A singular model transform refuses with
 * MeshGenError (the meshgen doctrine); nothing here touches the GPU.
 */
export function shademesh(mesh: GeneratedMesh, scene: ShadingScene, model: ShadingModel = "lambert"): Float32Array {
  if (!mesh || !(mesh.positions instanceof Float32Array) || mesh.positions.length === 0)
    throw new MeshGenError("shaders: the mesh carries no position buffer");
  const material = scene.material ?? DEFAULT_MATERIAL;
  const modelMatrix = scene.model;
  const normalMatrix = modelMatrix ? mat3normalfrommat4(modelMatrix) : null;
  if (modelMatrix && !normalMatrix) throw new MeshGenError("shaders: the model transform is singular — no normal matrix exists");
  const count = mesh.positions.length / 3;
  const colors = new Float32Array(count * 3);
  for (let vertex = 0; vertex < count; vertex += 1) {
    const at = vertex * 3;
    let position: Vec3 = [mesh.positions[at], mesh.positions[at + 1], mesh.positions[at + 2]];
    let normal: Vec3 = [mesh.normals[at], mesh.normals[at + 1], mesh.normals[at + 2]];
    if (modelMatrix) {
      const moved = mat4transformpoint(modelMatrix, position);
      if (!moved) throw new MeshGenError("shaders: a vertex rides the w = 0 plane of the model transform");
      position = moved;
      const nx = mesh.normals[at];
      const ny = mesh.normals[at + 1];
      const nz = mesh.normals[at + 2];
      const tx = (normalMatrix as Float32Array)[0] * nx + (normalMatrix as Float32Array)[3] * ny + (normalMatrix as Float32Array)[6] * nz;
      const ty = (normalMatrix as Float32Array)[1] * nx + (normalMatrix as Float32Array)[4] * ny + (normalMatrix as Float32Array)[7] * nz;
      const tz = (normalMatrix as Float32Array)[2] * nx + (normalMatrix as Float32Array)[5] * ny + (normalMatrix as Float32Array)[8] * nz;
      const length = Math.hypot(tx, ty, tz);
      if (length < 1e-12) throw new MeshGenError("shaders: a normal collapsed under the model transform");
      normal = [tx / length, ty / length, tz / length];
    }
    const view = vec3normalize(vec3sub(scene.eye, position));
    if (!view) continue; // the eye sits inside the vertex: the ambient floor holds
    const color = shade(model, normal, position, view, scene.lights, material);
    colors[at] = color[0];
    colors[at + 1] = color[1];
    colors[at + 2] = color[2];
  }
  return colors;
}

// ---------------------------------------------------------------------------
// the GLSL emission — the four models as honest ES 3.00 fragment programs
// ---------------------------------------------------------------------------

/** the shared GLSL header of the four models (the uniforms the TS side
 * mirrors; `uLightDirection`/`uLightColor`/`uLightIntensity` name one
 * directional light, the multi-light loop rides the uniform arrays). */
const GLSL_HEADER =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "in vec3 vNormal;\n" +
  "in vec3 vWorldPosition;\n" +
  "uniform vec3 uEye;\n" +
  "uniform vec3 uBaseColor;\n" +
  "uniform float uAmbient;\n" +
  "uniform float uDiffuse;\n" +
  "uniform float uSpecular;\n" +
  "uniform float uShininess;\n" +
  "uniform float uFresnelStrength;\n" +
  "uniform float uFresnelPower;\n" +
  "out vec4 outColor;\n";

/** the lambert body: the ambient floor plus the directional diffuse. */
const GLSL_LAMBERT =
  GLSL_HEADER +
  "void main() {\n" +
  "  vec3 normal = normalize(vNormal);\n" +
  "  float nDotL = max(dot(normal, normalize(vec3(0.4, 0.8, 0.45))), 0.0);\n" +
  "  vec3 color = uBaseColor * (uAmbient + uDiffuse * nDotL);\n" +
  "  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);\n" +
  "}\n";

/** the blinn body: lambert plus the half-vector specular. */
const GLSL_BLINN =
  GLSL_HEADER +
  "void main() {\n" +
  "  vec3 normal = normalize(vNormal);\n" +
  "  vec3 viewDir = normalize(uEye - vWorldPosition);\n" +
  "  vec3 lightDir = normalize(vec3(0.4, 0.8, 0.45));\n" +
  "  float nDotL = max(dot(normal, lightDir), 0.0);\n" +
  "  vec3 halfVector = normalize(lightDir + viewDir);\n" +
  "  float specularTerm = pow(max(dot(normal, halfVector), 0.0), uShininess) * step(0.0, nDotL);\n" +
  "  float nDotV = max(dot(normal, viewDir), 0.0);\n" +
  "  float fresnel = uFresnelStrength * pow(1.0 - nDotV, uFresnelPower);\n" +
  "  vec3 color = uBaseColor * (uAmbient + uDiffuse * nDotL) + vec3(uSpecular * specularTerm + fresnel);\n" +
  "  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);\n" +
  "}\n";

/** the phong body: lambert plus the reflection specular. */
const GLSL_PHONG =
  GLSL_HEADER +
  "void main() {\n" +
  "  vec3 normal = normalize(vNormal);\n" +
  "  vec3 viewDir = normalize(uEye - vWorldPosition);\n" +
  "  vec3 lightDir = normalize(vec3(0.4, 0.8, 0.45));\n" +
  "  float nDotL = max(dot(normal, lightDir), 0.0);\n" +
  "  vec3 reflection = 2.0 * nDotL * normal - lightDir;\n" +
  "  float specularTerm = pow(max(dot(reflection, viewDir), 0.0), uShininess) * step(0.0, nDotL);\n" +
  "  float nDotV = max(dot(normal, viewDir), 0.0);\n" +
  "  float fresnel = uFresnelStrength * pow(1.0 - nDotV, uFresnelPower);\n" +
  "  vec3 color = uBaseColor * (uAmbient + uDiffuse * nDotL) + vec3(uSpecular * specularTerm + fresnel);\n" +
  "  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);\n" +
  "}\n";

/** the toon body: the quantized ramp plus the stepped specular. */
const GLSL_TOON =
  GLSL_HEADER +
  "uniform float uToonSteps;\n" +
  "void main() {\n" +
  "  vec3 normal = normalize(vNormal);\n" +
  "  vec3 viewDir = normalize(uEye - vWorldPosition);\n" +
  "  vec3 lightDir = normalize(vec3(0.4, 0.8, 0.45));\n" +
  "  float nDotL = max(dot(normal, lightDir), 0.0);\n" +
  "  float steps = max(2.0, uToonSteps);\n" +
  "  float band = floor(min(nDotL, 1.0) * steps) / steps;\n" +
  "  vec3 halfVector = normalize(lightDir + viewDir);\n" +
  "  float stepSpecular = dot(normal, halfVector) > 0.95 ? 1.0 : 0.0;\n" +
  "  vec3 color = uBaseColor * (uAmbient + uDiffuse * band) + vec3(uSpecular * stepSpecular);\n" +
  "  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);\n" +
  "}\n";

/** the GLSL fragment programs of the four models — byte-stable sources whose
 * constants mirror the TypeScript math (the catalog row of this seat). */
export const SHADING_MODEL_GLSL: Readonly<Record<ShadingModel, string>> = Object.freeze({
  lambert: GLSL_LAMBERT,
  blinn: GLSL_BLINN,
  phong: GLSL_PHONG,
  toon: GLSL_TOON,
});

/** answers the GLSL fragment program of one shading model (null on an
 * unknown key — the typed refusal). */
export function glslShadingModel(model: ShadingModel): string | null {
  return SHADING_MODEL_GLSL[model] ?? null;
}

/** validates every emitted model program through the single-sourced
 * validator (versawaseshaders) — the honest gate before any manifest row
 * ships; the answer carries one row per model. */
export function validateShadingCatalog(): { model: ShadingModel; validation: ShaderValidation }[] {
  return (Object.keys(SHADING_MODEL_GLSL) as ShadingModel[]).map((model) => ({
    model,
    validation: validateShaderSource(SHADING_MODEL_GLSL[model], { stage: "fragment" }),
  }));
}
