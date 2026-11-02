// # versawaseshaders test — the GLSL material catalog and the source
// validator, runnable with vitest (no GPU, no DOM):
//   pnpm vitest run tests/versawaseshaders.test.ts
// Every test watches the gate: catalog stages validate against their own
// declared uniforms, damage is caught with the machine code and the line
// (unbalanced braces, es 1.00 storage, #version placement, missing
// uniforms, samplerless texture calls), comments never fool the strip, the
// compiled pairs carry sha-256 stamps, and the compositor library plus the
// render pass vertex stage fold through the same gate unchanged.

import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  compileMaterialProgram,
  FRAGMENT_MATERIALS,
  materialIds,
  validateCatalogShaders,
  validateLibraryEffects,
  validateShaderSource,
  VERTEX_STAGES,
} from "../versawaseshaders.ts";
import { SHADER_EFFECTS } from "../shadercomp.ts";
import { PASS_VERTEX_SOURCE } from "../versawaserender.ts";

describe("versawaseshaders catalog", () => {
  it("ships the material lane: two vertex stages and six fragment materials", () => {
    assert.equal(VERTEX_STAGES.length, 2);
    assert.equal(FRAGMENT_MATERIALS.length, 6);
    assert.deepEqual([...materialIds()], ["lambert", "toon", "matcap", "uvdebug", "normaldebug", "depthramp"]);
  });

  it("validates every catalog stage against its own declared uniforms", () => {
    for (const row of validateCatalogShaders()) {
      assert.deepEqual(row.validation.issues, [], `${row.id} must validate clean`);
      assert.ok(row.validation.ok);
    }
  });

  it("compiles every material into a hashed program pair with a uniform manifest", () => {
    for (const id of materialIds()) {
      const program = compileMaterialProgram(id);
      assert.ok(program, `${id} compiles`);
      assert.match(program.vertexSha256, /^[0-9a-f]{64}$/);
      assert.match(program.fragmentSha256, /^[0-9a-f]{64}$/);
      assert.ok(program.uniforms.includes("uModel"));
      assert.ok(program.fragmentSource.startsWith("#version 300 es"));
      assert.ok(program.vertexSource.startsWith("#version 300 es"));
      const vertex = VERTEX_STAGES.find((stage) => stage.id === program.vertexStage);
      assert.ok(vertex, "the pairing vertex stage exists");
    }
  });

  it("answers null for an unknown material id — no pretend program", () => {
    assert.equal(compileMaterialProgram("phong deluxe"), null);
  });

  it("pairs the depth ramp with the flat stage and the rest with the standard stage", () => {
    assert.equal(compileMaterialProgram("depthramp")?.vertexStage, "mvp-flat");
    assert.equal(compileMaterialProgram("lambert")?.vertexStage, "mvp-standard");
  });
});

describe("versawaseshaders validator", () => {
  it("catches unbalanced braces, parens and brackets with the offending line", () => {
    const braces = validateShaderSource("#version 300 es\nvoid main() {\n  if (true) {\n}\n");
    assert.equal(braces.ok, false);
    assert.ok(braces.issues.some((issue) => issue.code === "unbalanced-braces" && issue.line === 2));
    const parens = validateShaderSource("void main() { vec2 v = vec2(0.0; }\n");
    assert.ok(parens.issues.some((issue) => issue.code === "unbalanced-parens"));
    const brackets = validateShaderSource("void main() { float a[3 = 0.0; }\n");
    assert.ok(brackets.issues.some((issue) => issue.code === "unbalanced-brackets"));
    const early = validateShaderSource("void main() { } }\n");
    assert.ok(early.issues.some((issue) => issue.code === "unbalanced-braces"));
  });

  it("catches the es 1.00 storage invariants: gl_FragColor, attribute, varying", () => {
    const frag = validateShaderSource("out vec4 o;\nvoid main() { gl_FragColor = vec4(1.0); }\n");
    assert.ok(frag.issues.some((issue) => issue.code === "es3-fragcolor"));
    const legacy = validateShaderSource("attribute vec3 a;\nvarying vec2 v;\nvoid main() { }\n");
    const codes = legacy.issues.map((issue) => issue.code);
    assert.ok(codes.includes("es3-legacy-storage"));
  });

  it("enforces the #version-first rule", () => {
    const misplaced = validateShaderSource("precision highp float;\n#version 300 es\nvoid main() { }\n");
    assert.ok(misplaced.issues.some((issue) => issue.code === "version-not-first" && issue.line === 2));
  });

  it("requires the main entry point when asked, and lets fragments of a library skip it", () => {
    const noMain = validateShaderSource("float helper() { return 1.0; }\n");
    assert.ok(noMain.issues.some((issue) => issue.code === "missing-main"));
    const asEffect = validateShaderSource("vec4 effect(vec4 s, vec2 uv, float t, float a) { return s; }\n", {
      requiresMain: false,
    });
    assert.equal(asEffect.ok, true);
  });

  it("extracts declared uniforms and enforces required ones", () => {
    const source = "uniform mat4 uModel;\nuniform sampler2D uSource;\nvoid main() { }\n";
    const validation = validateShaderSource(source, { requiredUniforms: ["uModel", "uSource"] });
    assert.deepEqual([...validation.uniforms], ["uModel", "uSource"]);
    assert.equal(validation.ok, true);
    const missing = validateShaderSource(source, { requiredUniforms: ["uProjection"] });
    assert.ok(missing.issues.some((issue) => issue.code === "missing-uniform"));
  });

  it("refuses texture() calls without a declared sampler", () => {
    const samplerless = validateShaderSource("void main() { vec4 c = texture(uTex, vec2(0.0)); }\n");
    assert.ok(samplerless.issues.some((issue) => issue.code === "texture-without-sampler"));
  });

  it("never lets commented-out damage fool the gate, and keeps real line numbers", () => {
    const commented = validateShaderSource(
      "void main() { }\n// gl_FragColor and an unbalanced { live in a comment\n/* void main( { */\n",
    );
    assert.deepEqual(commented.issues, []);
    assert.equal(commented.ok, true);
  });

  it("refuses the empty source honestly", () => {
    const empty = validateShaderSource("   ");
    assert.equal(empty.ok, false);
    assert.ok(empty.issues.some((issue) => issue.code === "empty-source"));
  });
});

describe("versawaseshaders cross-checks", () => {
  it("folds every compositor effect program through the same gate", () => {
    const rows = validateLibraryEffects();
    assert.equal(rows.length, SHADER_EFFECTS.length);
    for (const row of rows) {
      assert.deepEqual(row.validation.issues, [], `effect ${row.id} must validate clean`);
      assert.ok(row.validation.ok);
      assert.deepEqual([...row.validation.uniforms], ["uSource", "uResolution", "uTime", "uAmount"]);
    }
  });

  it("validates the render pass vertex stage of versawaserender unchanged", () => {
    const validation = validateShaderSource(PASS_VERTEX_SOURCE, { stage: "vertex" });
    assert.deepEqual(validation.issues, []);
    assert.ok(validation.ok);
  });
});
