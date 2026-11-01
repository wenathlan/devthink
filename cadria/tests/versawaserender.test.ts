// # versawaserender test — the WebGL2 runtime validated without a GPU: the
// fullscreen triangle, the compile cache, the pass planner over the real
// EffectPrograms of shadercomp, the typed refusal contract, the readback row
// flip, and a scripted GL mock that pins the call order of one whole run.
// Every suite is pure node — no canvas, no DOM, no real context.

import { describe, expect, it, vi } from "vitest";
import { compileEffectProgram, SHADER_EFFECTS } from "../shadercomp.ts";
import {
  createProgramCache,
  createRenderer,
  flipRows,
  fullscreenTriangle,
  type ImageInput,
  PASS_VERTEX_SOURCE,
  type PassSpec,
  passCacheKey,
  planPasses,
  type RenderCanvas,
  VersaRender,
} from "../versawaserender.ts";

/** builds a w×h grayscale horizontal ramp (left black, right white, alpha full). */
function gradientImage(width: number, height: number): ImageInput {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const value = Math.round((255 * x) / (width - 1));
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
      data[index + 3] = 255;
    }
  }
  return { width, height, data };
}

/** the GL constants the runtime touches, with their real WebGL2 values. */
const GL_CONSTANTS = {
  RGBA: 0x1907,
  UNSIGNED_BYTE: 0x1401,
  TEXTURE_2D: 0x0de1,
  TEXTURE0: 0x84c0,
  VERTEX_SHADER: 0x8b31,
  FRAGMENT_SHADER: 0x8b30,
  COMPILE_STATUS: 0x8b81,
  LINK_STATUS: 0x8b82,
  TRIANGLES: 0x0004,
  FRAMEBUFFER: 0x8d40,
  FRAMEBUFFER_COMPLETE: 0x8cd5,
  COLOR_ATTACHMENT0: 0x8ce0,
  TEXTURE_MIN_FILTER: 0x2801,
  TEXTURE_MAG_FILTER: 0x2800,
  TEXTURE_WRAP_S: 0x2802,
  TEXTURE_WRAP_T: 0x2803,
  LINEAR: 0x0001,
  CLAMP_TO_EDGE: 0x812f,
  ARRAY_BUFFER: 0x8892,
  STATIC_DRAW: 0x88e4,
  FLOAT: 0x1406,
  UNPACK_FLIP_Y_WEBGL: 0x9240,
  DEPTH_TEST: 0x0b71,
  BLEND: 0x0be2,
} as const;

/** the mock knobs: shader compile, program link, framebuffer completeness. */
interface MockOverrides {
  compileOk?: boolean;
  linkOk?: boolean;
  fbComplete?: boolean;
}

/** builds a recording WebGL2 mock: every method a vi.fn, constants real-valued. */
function mockGL(overrides: MockOverrides = {}) {
  const compileOk = overrides.compileOk ?? true;
  const linkOk = overrides.linkOk ?? true;
  const fbComplete = overrides.fbComplete ?? true;
  const gl = {
    ...GL_CONSTANTS,
    createBuffer: vi.fn(() => ({})),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createVertexArray: vi.fn(() => ({})),
    bindVertexArray: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    disable: vi.fn(),
    createTexture: vi.fn(() => ({})),
    deleteTexture: vi.fn(),
    bindTexture: vi.fn(),
    texParameteri: vi.fn(),
    texImage2D: vi.fn(),
    pixelStorei: vi.fn(),
    activeTexture: vi.fn(),
    createFramebuffer: vi.fn(() => ({})),
    deleteFramebuffer: vi.fn(),
    bindFramebuffer: vi.fn(),
    framebufferTexture2D: vi.fn(),
    checkFramebufferStatus: vi.fn(() => (fbComplete ? GL_CONSTANTS.FRAMEBUFFER_COMPLETE : 0)),
    createShader: vi.fn(() => ({})),
    deleteShader: vi.fn(),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => compileOk),
    getShaderInfoLog: vi.fn(() => "mock compile boom"),
    createProgram: vi.fn(() => ({})),
    deleteProgram: vi.fn(),
    attachShader: vi.fn(),
    bindAttribLocation: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => linkOk),
    getProgramInfoLog: vi.fn(() => "mock link boom"),
    getUniformLocation: vi.fn((_program: unknown, name: string) => ({ name })),
    useProgram: vi.fn(),
    uniform1i: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    viewport: vi.fn(),
    drawArrays: vi.fn(),
    readPixels: vi.fn(
      (_x: number, _y: number, w: number, _h: number, _format: number, _type: number, out: Uint8Array) => {
        // deterministic rows: the bottom row answers 40, the next 80, then 120 …
        const row = w * 4;
        for (let start = 0, rowAt = 0; start < out.length; start += row, rowAt += 1) {
          const fill = 40 * (rowAt + 1);
          for (let i = 0; i < row; i += 1) out[start + i] = fill;
        }
      },
    ),
    getError: vi.fn(() => 0),
  };
  return { gl: gl as unknown as WebGL2RenderingContext, calls: gl };
}

/** a canvas stub whose getContext answers the given mock (or null). */
function mockCanvas(gl: WebGL2RenderingContext | null): RenderCanvas {
  return { width: 0, height: 0, getContext: () => gl };
}

describe("versawaserender structure", () => {
  it("ships the clip-space fullscreen triangle that covers the viewport", () => {
    const triangle = fullscreenTriangle();
    expect([...triangle.positions]).toEqual([-1, -1, 3, -1, -1, 3]);
    expect(triangle.count).toBe(3);
    expect(triangle.strideBytes).toBe(8);
  });

  it("shares one vertex source that satisfies the fragment contract of the library", () => {
    expect(PASS_VERTEX_SOURCE.startsWith("#version 300 es")).toBe(true);
    expect(PASS_VERTEX_SOURCE).toContain("in vec2 aPosition;");
    expect(PASS_VERTEX_SOURCE).toContain("out vec2 vUv;");
    expect(PASS_VERTEX_SOURCE).toContain("gl_Position = vec4(aPosition, 0.0, 1.0);");
    // the fragment header of shadercomp declares `in vec2 vUv` — the names must meet
    expect(PASS_VERTEX_SOURCE).toContain("vUv = aPosition * 0.5 + 0.5;");
  });

  it("counts hits and misses in the compile cache without duplicating keys", () => {
    const cache = createProgramCache();
    const first = compileEffectProgram("halation", 0.4);
    expect(first).not.toBeNull();
    if (!first) return;
    const entry = {
      key: passCacheKey(first),
      program: {} as WebGLProgram,
      uniforms: { uSource: null, uResolution: null, uTime: null, uAmount: null },
    };
    expect(cache.lookup(entry.key)).toBeNull();
    cache.store(entry);
    expect(cache.lookup(entry.key)).toBe(entry);
    cache.store(entry);
    expect(cache.size()).toBe(1);
    expect(cache.stats()).toEqual({ hits: 1, misses: 1 });
  });

  it("keys the cache on the program sha-256, stable across amounts", () => {
    const small = compileEffectProgram("grainfilm", 0.1);
    const big = compileEffectProgram("grainfilm", 0.9);
    expect(small).not.toBeNull();
    expect(big).not.toBeNull();
    if (!small || !big) return;
    expect(passCacheKey(small)).toBe(small.sha256);
    expect(passCacheKey(small)).toBe(passCacheKey(big));
  });
});

describe("versawaserender pass planning over the real effect library", () => {
  it("plans every one of the twelve effects as one source→canvas pass", () => {
    expect(SHADER_EFFECTS.length).toBe(12);
    for (const effect of SHADER_EFFECTS) {
      const compiled = compileEffectProgram(effect.id, effect.defaultAmount);
      expect(compiled).not.toBeNull();
      if (!compiled) continue;
      const planned = planPasses([{ program: compiled, time: 1 }]);
      expect(planned).toHaveLength(1);
      expect(planned[0].reads).toBe("source");
      expect(planned[0].writes).toBe("canvas");
      expect(planned[0].index).toBe(0);
      expect(planned[0].total).toBe(1);
      expect(planned[0].spec.program).toBe(compiled);
      expect(planned[0].spec.time).toBe(1);
    }
  });

  it("ping-pongs a four-effect chain through both framebuffers to the canvas", () => {
    const ids = ["halation", "bloompass", "grainfilm", "vignette"] as const;
    const specs: PassSpec[] = [];
    for (const id of ids) {
      const compiled = compileEffectProgram(id, 0.5);
      expect(compiled).not.toBeNull();
      if (compiled) specs.push({ program: compiled, time: id.length });
    }
    const planned = planPasses(specs);
    expect(planned.map((pass) => pass.reads)).toEqual(["source", "fbo0", "fbo1", "fbo0"]);
    expect(planned.map((pass) => pass.writes)).toEqual(["fbo0", "fbo1", "fbo0", "canvas"]);
    for (const pass of planned) {
      expect(pass.reads === pass.writes).toBe(false);
    }
  });

  it("never lets a pass read the framebuffer it writes", () => {
    for (let total = 1; total <= 7; total += 1) {
      const specs: PassSpec[] = [];
      for (let index = 0; index < total; index += 1) {
        const effect = SHADER_EFFECTS[index % SHADER_EFFECTS.length];
        const compiled = compileEffectProgram(effect.id, 0.2);
        if (compiled) specs.push({ program: compiled });
      }
      const planned = planPasses(specs);
      for (let index = 1; index < planned.length; index += 1) {
        // each pass reads exactly what the previous pass wrote
        expect(planned[index].reads).toBe(planned[index - 1].writes);
      }
      expect(planned[planned.length - 1].writes).toBe("canvas");
    }
  });
});

describe("versawaserender typed refusals", () => {
  it("refuses a canvas without a webgl2 context instead of pretending", () => {
    expect(createRenderer(mockCanvas(null))).toEqual({ ok: false, error: "render-no-webgl2" });
  });

  it("refuses empty pass lists and damaged sources with typed errors", () => {
    const { gl } = mockGL();
    const outcome = createRenderer(mockCanvas(gl));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const renderer = outcome.renderer;
    expect(renderer).toBeInstanceOf(VersaRender);
    const source = gradientImage(4, 3);
    expect(renderer.run(source, [])).toEqual({ ok: false, error: "render-empty-passes" });
    const halation = compileEffectProgram("halation", 0.4);
    if (!halation) throw new Error("expected a compiled program");
    const broken = renderer.run({ width: 2, height: 2, data: new Uint8ClampedArray(4) }, [{ program: halation }]);
    expect(broken.ok).toBe(false);
    if (broken.ok) return;
    expect(broken.error).toBe("render-bad-source");
    expect(broken.detail).toBe("2x2 with 4 bytes");
  });
});

describe("versawaserender execution over a scripted GL mock", () => {
  it("runs a two-pass chain in order and reads the result back flipped", () => {
    const { gl, calls } = mockGL();
    const outcome = createRenderer(mockCanvas(gl));
    if (!outcome.ok) throw new Error("expected a renderer from the mock");
    const source = gradientImage(1, 3);
    const halation = compileEffectProgram("halation", 0.4);
    const vignette = compileEffectProgram("vignette", 0.45);
    if (!halation || !vignette) throw new Error("expected compiled programs");

    const result = outcome.renderer.run(source, [
      { program: halation, time: 2 },
      { program: vignette, time: 3 },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.width).toBe(1);
    expect(result.height).toBe(3);
    expect(result.pixels).toHaveLength(12);
    expect(result.passes).toBe(2);
    expect(result.cache).toEqual({ hits: 0, misses: 2 });

    // one fullscreen-triangle draw per pass
    expect(calls.drawArrays).toHaveBeenCalledTimes(2);
    for (const call of calls.drawArrays.mock.calls) {
      expect(call[0]).toBe(GL_CONSTANTS.TRIANGLES);
      expect(call[1]).toBe(0);
      expect(call[2]).toBe(3);
    }
    // pass 1 writes the ping-pong framebuffer, the last pass writes the canvas
    const framebufferBindings = calls.bindFramebuffer.mock.calls.map((call) => call[1]);
    expect(framebufferBindings.at(-2)).not.toBeNull();
    expect(framebufferBindings.at(-1)).toBeNull();
    // the source upload is flipped, then the pixel store is restored
    const flipCalls = calls.pixelStorei.mock.calls.filter((call) => call[0] === GL_CONSTANTS.UNPACK_FLIP_Y_WEBGL);
    expect(flipCalls.map((call) => call[1])).toEqual([true, false]);
    expect(calls.texImage2D).toHaveBeenCalledWith(
      GL_CONSTANTS.TEXTURE_2D,
      0,
      GL_CONSTANTS.RGBA,
      1,
      3,
      0,
      GL_CONSTANTS.RGBA,
      GL_CONSTANTS.UNSIGNED_BYTE,
      source.data,
    );
    // uniforms: the amount rides the compiled program, the resolution the run size
    expect(calls.uniform2f).toHaveBeenCalledWith({ name: "uResolution" }, 1, 3);
    expect(calls.uniform1f).toHaveBeenCalledWith({ name: "uTime" }, 2);
    expect(calls.uniform1f).toHaveBeenCalledWith({ name: "uAmount" }, halation.amount);
    expect(calls.viewport).toHaveBeenCalledWith(0, 0, 1, 3);
    // readback: bottom-up rows 40/80/120 flip into top-down 120/80/40
    expect(calls.readPixels).toHaveBeenCalledTimes(1);
    expect([...result.pixels]).toEqual([120, 120, 120, 120, 80, 80, 80, 80, 40, 40, 40, 40]);
  });

  it("serves the second run from the compile cache without recompiling", () => {
    const { gl, calls } = mockGL();
    const outcome = createRenderer(mockCanvas(gl));
    if (!outcome.ok) throw new Error("expected a renderer from the mock");
    const source = gradientImage(2, 2);
    const halation = compileEffectProgram("halation", 0.4);
    if (!halation) throw new Error("expected a compiled program");
    const first = outcome.renderer.run(source, [{ program: halation }]);
    const second = outcome.renderer.run(source, [{ program: halation }]);
    expect(first.ok && second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.cache).toEqual({ hits: 1, misses: 1 });
    // two compiles per program (vertex + fragment) happened once, never again
    expect(calls.createShader).toHaveBeenCalledTimes(2);
    expect(calls.drawArrays).toHaveBeenCalledTimes(2);
  });

  it("answers typed refusals for compile, link and framebuffer failures", () => {
    const source = gradientImage(2, 2);
    const halation = compileEffectProgram("halation", 0.4);
    if (!halation) throw new Error("expected a compiled program");

    const compileFail = mockGL({ compileOk: false });
    const compileRenderer = createRenderer(mockCanvas(compileFail.gl));
    if (!compileRenderer.ok) throw new Error("expected a renderer");
    expect(compileRenderer.renderer.run(source, [{ program: halation }])).toEqual({
      ok: false,
      error: "render-compile-failed",
      detail: "mock compile boom",
    });

    const linkFail = mockGL({ linkOk: false });
    const linkRenderer = createRenderer(mockCanvas(linkFail.gl));
    if (!linkRenderer.ok) throw new Error("expected a renderer");
    expect(linkRenderer.renderer.run(source, [{ program: halation }])).toEqual({
      ok: false,
      error: "render-compile-failed",
      detail: "mock link boom",
    });

    const fbFail = mockGL({ fbComplete: false });
    const fbRenderer = createRenderer(mockCanvas(fbFail.gl));
    if (!fbRenderer.ok) throw new Error("expected a renderer");
    expect(fbRenderer.renderer.run(source, [{ program: halation }])).toEqual({
      ok: false,
      error: "render-framebuffer-incomplete",
    });
  });
});

describe("versawaserender row flip", () => {
  it("swaps GL bottom-up rows into top-down ImageData order", () => {
    // one 2×2 RGBA image: two full rows of 8 bytes each
    const pixels = new Uint8ClampedArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    expect([...flipRows(pixels, 2, 2)]).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("keeps the middle row of an odd height in place", () => {
    // one 1×3 RGBA image: three rows of 4 bytes, the middle row stays put
    const pixels = new Uint8ClampedArray([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]);
    expect([...flipRows(pixels, 1, 3)]).toEqual([90, 100, 110, 120, 50, 60, 70, 80, 10, 20, 30, 40]);
  });
});
