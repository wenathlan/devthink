// # shaders.test — the shader seat of the versawaze engine: the honest
// TypeScript shading math (lambert, blinn, phong, toon, fresnel, the point
// light inverse square), the per-vertex mesh shading pass and the GLSL
// emission validated through the single-sourced versawaseshaders gate,
// runnable with vitest:
//   bun x vitest run tests/shaders.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  DEFAULT_MATERIAL,
  PointLight,
  ShadingMaterial,
  ShaderLight,
  SHADING_MODEL_GLSL,
  DirectionalLight,
  compileMaterialProgram,
  fresnelSchlick,
  glslShadingModel,
  materialIds,
  shadeBlinn,
  shadeFragment,
  shadeLambert,
  shadePhong,
  shadeToon,
  shademesh,
  validateShadingCatalog,
} from "../shaders.ts";
import { generateBox, generatePlane, transformmesh } from "../mesh.ts";
import { mat4translation } from "../versa.ts";

/** close-enough for shading math. */
const EPS = 1e-6;

function close(a: number, b: number, eps: number = EPS, message?: string): void {
  assert.ok(Math.abs(a - b) <= eps, `${message ? `${message}: ` : ""}expected ${a} ≈ ${b}`);
}

/** a neutral material that isolates one term at a time. */
const isolate = (overrides: Partial<ShadingMaterial>): ShadingMaterial => ({ ...DEFAULT_MATERIAL, ...overrides });

const straightLight: DirectionalLight = { kind: "directional", direction: [0, 1, 0], color: [1, 1, 1], intensity: 1 };

describe("shaders lambert", () => {
  it("answers the full ambient + diffuse when the normal faces the light", () => {
    const color = shadeLambert([0, 1, 0], [0, 0, 0], [0, 1, 0], [straightLight], isolate({ baseColor: [1, 1, 1] }));
    close(color[0], DEFAULT_MATERIAL.ambient + DEFAULT_MATERIAL.diffuse);
    close(color[1], DEFAULT_MATERIAL.ambient + DEFAULT_MATERIAL.diffuse);
  });

  it("answers the ambient floor when the normal faces away", () => {
    const material = isolate({ baseColor: [1, 1, 1], fresnelStrength: 0 });
    const color = shadeLambert([0, -1, 0], [0, 0, 0], [0, 1, 0], [straightLight], material);
    close(color[0], DEFAULT_MATERIAL.ambient);
  });

  it("clamps the display answer at one", () => {
    const color = shadeLambert([0, 1, 0], [0, 0, 0], [0, 1, 0], [straightLight], isolate({ baseColor: [1, 1, 1], ambient: 0.6, diffuse: 0.9 }));
    close(color[0], 1);
  });
});

describe("shaders specular models", () => {
  it("answers the full blinn highlight when the half vector is the normal", () => {
    const material = isolate({ baseColor: [0, 0, 0], ambient: 0, diffuse: 0, specular: 0.5, shininess: 8, fresnelStrength: 0 });
    const color = shadeBlinn([0, 1, 0], [0, 0, 0], [0, 1, 0], [straightLight], material);
    close(color[0], 0.5);
    const dark = shadeBlinn([1, 0, 0], [0, 0, 0], [0, 1, 0], [straightLight], material);
    close(dark[0], 0, EPS, "no specular when the light sits behind the surface");
  });

  it("keeps blinn softer than phong at equal shininess on the diagonal", () => {
    const material = isolate({ baseColor: [0, 0, 0], ambient: 0, diffuse: 0, specular: 1, shininess: 8, fresnelStrength: 0 });
    const diagonal: DirectionalLight = {
      kind: "directional",
      direction: [Math.SQRT1_2, Math.SQRT1_2, 0],
      color: [1, 1, 1],
      intensity: 1,
    };
    const blinn = shadeBlinn([0, 1, 0], [0, 0, 0], [0, 1, 0], [diagonal], material);
    const phong = shadePhong([0, 1, 0], [0, 0, 0], [0, 1, 0], [diagonal], material);
    assert.ok(blinn[0] > phong[0], `blinn ${blinn[0]} should outshine phong ${phong[0]} on the diagonal`);
    assert.ok(phong[0] > 0);
  });

  it("quantizes the toon ramp and steps the toon specular", () => {
    const material = isolate({ baseColor: [1, 1, 1], ambient: 0.1, diffuse: 0.8, specular: 0, toonSteps: 2, fresnelStrength: 0 });
    // nDotL = 1 → band 1 → the full diffuse answers (specular isolated out)
    const full = shadeToon([0, 1, 0], [0, 0, 0], [0, 1, 0], [straightLight], material);
    close(full[0], 0.1 + 0.8);
    // a 0.4 cosine falls into the darkest band of the two-step ramp
    const shallow: DirectionalLight = {
      kind: "directional",
      direction: [Math.sqrt(1 - 0.4 * 0.4), 0.4, 0],
      color: [1, 1, 1],
      intensity: 1,
    };
    const banded = shadeToon([0, 1, 0], [0, 0, 0], [0, 1, 0], [shallow], material);
    close(banded[0], 0.1, 1e-6, "the 0.4 cosine falls into the darkest band");
    // the stepped specular rides the halfway peak: straight-on it saturates
    const stepped = shadeToon([0, 1, 0], [0, 0, 0], [0, 1, 0], [straightLight], { ...material, specular: 0.5 });
    close(stepped[0], 1, 1e-6, "the highlight step saturates the display clamp");
  });

  it("answers the fresnel rim honestly (zero head-on, full grazing)", () => {
    close(fresnelSchlick([0, 1, 0], [0, 1, 0], 3, 0.5), 0);
    close(fresnelSchlick([0, 1, 0], [1, 0, 0], 3, 0.5), 0.5);
  });

  it("dispatches the four models through the single fragment entry", () => {
    const lights: readonly ShaderLight[] = [straightLight];
    for (const model of ["lambert", "blinn", "phong", "toon"] as const) {
      const color = shadeFragment(model, [0, 1, 0], [0, 0, 0], [0, 1, 0], lights);
      for (const channel of color) assert.ok(channel >= 0 && channel <= 1, `${model} stays in the display range`);
    }
  });
});

describe("shaders point lights", () => {
  it("falls off with the inverse square of the distance", () => {
    const near: PointLight = { kind: "point", position: [0, 2, 0], color: [1, 1, 1], intensity: 4 };
    const far: PointLight = { kind: "point", position: [0, 4, 0], color: [1, 1, 1], intensity: 4 };
    const material = isolate({ baseColor: [1, 1, 1], ambient: 0, diffuse: 1, specular: 0, fresnelStrength: 0 });
    const nearColor = shadeLambert([0, 1, 0], [0, 0, 0], [0, 1, 0], [near], material);
    const farColor = shadeLambert([0, 1, 0], [0, 0, 0], [0, 1, 0], [far], material);
    close(nearColor[0] / farColor[0], 4, 1e-4, "double the distance answers a quarter of the light");
  });

  it("ignores a light that sits inside the surface", () => {
    const inside: PointLight = { kind: "point", position: [0, 0, 0], color: [1, 1, 1], intensity: 10 };
    const material = isolate({ baseColor: [1, 1, 1], ambient: 0, diffuse: 1, specular: 0, fresnelStrength: 0 });
    const color = shadeLambert([0, 1, 0], [0, 0, 0], [0, 1, 0], [inside], material);
    close(color[0], 0);
  });
});

describe("shaders mesh pass", () => {
  it("shades the box per vertex: the lit face brighter than the dark face", () => {
    const box = generateBox({ width: 2, height: 2, depth: 2 });
    const colors = shademesh(
      box,
      { eye: [0, 5, 5], lights: [straightLight], material: isolate({ fresnelStrength: 0 }) },
      "lambert",
    );
    assert.equal(colors.length, box.counts.vertices * 3);
    // the +y face vertices (normal (0,1,0)) answer brighter than the -y face
    let topLuma = 0;
    let bottomLuma = 0;
    for (let vertex = 0; vertex < box.counts.vertices; vertex += 1) {
      const luma = colors[vertex * 3] + colors[vertex * 3 + 1] + colors[vertex * 3 + 2];
      if (box.normals[vertex * 3 + 1] > 0.9) topLuma = Math.max(topLuma, luma);
      if (box.normals[vertex * 3 + 1] < -0.9) bottomLuma = Math.max(bottomLuma, luma);
    }
    assert.ok(topLuma > bottomLuma, `the lit face (${topLuma}) should outshine the dark face (${bottomLuma})`);
    for (const channel of colors) assert.ok(channel >= 0 && channel <= 1);
  });

  it("rides the model transform: the translated plane shades like the origin plane", () => {
    const plane = generatePlane({ width: 2, depth: 2 });
    const light: DirectionalLight = { kind: "directional", direction: [0, 1, 0], color: [1, 1, 1], intensity: 1 };
    const atOrigin = shademesh(plane, { eye: [0, 5, 0], lights: [light] }, "lambert");
    // the model-matrix path: the same plane carried by the transform
    const byMatrix = shademesh(plane, { model: mat4translation(10, 0, 0), eye: [10, 5, 0], lights: [light] }, "lambert");
    for (let at = 0; at < atOrigin.length; at += 1) close(byMatrix[at], atOrigin[at], 1e-3, `matrix channel ${at}`);
    // the baked-geometry path: the plane pre-transformed by transformmesh
    const moved = transformmesh(plane, mat4translation(10, 0, 0));
    const byBake = shademesh(moved, { eye: [10, 5, 0], lights: [light] }, "lambert");
    for (let at = 0; at < atOrigin.length; at += 1) close(byBake[at], atOrigin[at], 1e-3, `baked channel ${at}`);
  });

  it("refuses a mesh without positions honestly", () => {
    assert.throws(
      () =>
        shademesh(
          { positions: new Float32Array(0), normals: new Float32Array(0), uvs: new Float32Array(0), indices: new Uint32Array(0), counts: { vertices: 0, triangles: 0 } },
          { eye: [0, 0, 5], lights: [] },
        ),
      /no position buffer/,
    );
  });
});

describe("shaders GLSL emission and catalog", () => {
  it("emits ES 3.00 sources that pass the single-sourced validator", () => {
    const report = validateShadingCatalog();
    assert.equal(report.length, 4);
    for (const row of report) {
      assert.ok(row.validation.ok, `${row.model}: ${row.validation.issues.map((issue) => issue.message).join("; ")}`);
    }
  });

  it("answers the model source and refuses the unknown key", () => {
    for (const source of Object.values(SHADING_MODEL_GLSL)) {
      assert.ok(source.startsWith("#version 300 es"));
      assert.ok(source.includes("void main("));
      assert.ok(!source.includes("gl_FragColor"));
    }
    assert.equal(glslShadingModel("lambert"), SHADING_MODEL_GLSL.lambert);
    assert.equal(glslShadingModel("unknown" as "lambert"), null);
  });

  it("re-exports the versawase material catalog intact (the dedup law)", () => {
    assert.ok(materialIds().includes("lambert"));
    assert.ok(materialIds().includes("toon"));
    const program = compileMaterialProgram("lambert");
    assert.ok(program);
    assert.ok(program.vertexSource.startsWith("#version 300 es"));
    assert.ok(program.fragmentSource.startsWith("#version 300 es"));
    assert.match(program.vertexSha256, /^[0-9a-f]{64}$/);
  });
});
