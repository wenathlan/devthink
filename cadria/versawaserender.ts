// # versawaserender — the WebGL2 runtime that actually executes the compiled
// EffectPrograms of shadercomp.ts: one fullscreen-triangle draw per effect,
// ping-pong framebuffers between passes, and a readPixels readback that
// answers an ImageData-shaped buffer. Vanilla WebGL2 only — three never
// rides the 2d compositor passes. Refusal is typed and honest: a canvas
// without a webgl2 context never fakes a render, and damaged input answers
// outcomes instead of throwing (the transcodeplan/shadercomp contract).
// The pure pieces (triangle geometry, program cache, pass planning, row
// flip) are node-testable; every GL call sits in one renderer class
// behind them.

import type { EffectProgram } from "./shadercomp.ts";
import type { ImageInput } from "./visualizemesh.ts";

export type { ImageInput };

/**
 * The vertex shader every pass shares: the clip-space triangle carries vUv,
 * so the fragment bodies of the library (which declare `in vec2 vUv`) plug
 * in without any per-effect vertex code.
 */
export const PASS_VERTEX_SOURCE =
  "#version 300 es\n" +
  "in vec2 aPosition;\n" +
  "out vec2 vUv;\n" +
  "void main() {\n" +
  "  vUv = aPosition * 0.5 + 0.5;\n" +
  "  gl_Position = vec4(aPosition, 0.0, 1.0);\n" +
  "}\n";

/** the shared fullscreen triangle: one attribute, 2 floats per vertex. */
export interface FullscreenTriangle {
  /** interleaved xy positions: (-1,-1), (3,-1), (-1,3) in clip space. */
  positions: Float32Array;
  /** always 3 — one draw covers the whole viewport. */
  count: number;
  /** 8 bytes per vertex (2 floats) for vertexAttribPointer. */
  strideBytes: number;
}

/** the clip-space triangle that covers the viewport (vUv runs 0..2 over it, 0..1 on screen). */
export function fullscreenTriangle(): FullscreenTriangle {
  return {
    positions: new Float32Array([-1, -1, 3, -1, -1, 3]),
    count: 3,
    strideBytes: 8,
  };
}

/** one cached compile entry: the linked program plus its uniform slots. */
export interface CachedPass {
  /** the cache key — the sha-256 of the program source (passCacheKey). */
  key: string;
  program: WebGLProgram;
  uniforms: {
    uSource: WebGLUniformLocation | null;
    uResolution: WebGLUniformLocation | null;
    uTime: WebGLUniformLocation | null;
    uAmount: WebGLUniformLocation | null;
  };
}

/** the compile cache: keyed by program sha-256, counting hits and misses. */
export interface ProgramCache {
  lookup(key: string): CachedPass | null;
  store(entry: CachedPass): void;
  size(): number;
  all(): readonly CachedPass[];
  stats(): { hits: number; misses: number };
}

/** a fresh compile cache — one per renderer, deterministic and testable. */
export function createProgramCache(): ProgramCache {
  const entries = new Map<string, CachedPass>();
  let hits = 0;
  let misses = 0;
  return {
    lookup(key) {
      const entry = entries.get(key);
      if (entry) {
        hits += 1;
        return entry;
      }
      misses += 1;
      return null;
    },
    store(entry) {
      entries.set(entry.key, entry);
    },
    size() {
      return entries.size;
    },
    all() {
      return [...entries.values()];
    },
    stats() {
      return { hits, misses };
    },
  };
}

/** the cache key of one compiled pass: the sha-256 the program already carries. */
export function passCacheKey(program: EffectProgram): string {
  return program.sha256;
}

/** one requested effect pass: the compiled program plus its clock. */
export interface PassSpec {
  program: EffectProgram;
  /** the effect clock in seconds (drives the time-varying bodies, default 0). */
  time?: number;
}

/** where one planned pass reads its source texture from. */
export type PassReadSlot = "source" | "fbo0" | "fbo1";

/** where one planned pass writes its result to. */
export type PassWriteSlot = "canvas" | "fbo0" | "fbo1";

/** one planned pass of the chain: slot wiring resolved before any GL call. */
export interface PlannedPass {
  index: number;
  total: number;
  spec: PassSpec;
  reads: PassReadSlot;
  writes: PassWriteSlot;
}

/**
 * The pure pass planner: pass 0 reads the source texture, every later pass
 * reads the framebuffer the previous pass wrote (ping-pong between fbo0 and
 * fbo1), and the last pass writes the visible canvas. A pass never reads
 * and writes the same framebuffer.
 */
export function planPasses(passes: readonly PassSpec[]): PlannedPass[] {
  const total = passes.length;
  const planned: PlannedPass[] = [];
  for (let index = 0; index < total; index += 1) {
    const reads: PassReadSlot = index === 0 ? "source" : index % 2 === 1 ? "fbo0" : "fbo1";
    const writes: PassWriteSlot = index === total - 1 ? "canvas" : index % 2 === 0 ? "fbo0" : "fbo1";
    planned.push({ index, total, spec: passes[index], reads, writes });
  }
  return planned;
}

/**
 * Flips GL bottom-up readback rows into top-down ImageData order, in place.
 * GL readPixels answers the bottom row first; ImageData consumers expect the
 * top row first, so the swap keeps the readback honest about orientation.
 */
export function flipRows(pixels: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const row = width * 4;
  for (let y = 0; y < Math.floor(height / 2); y += 1) {
    const top = y * row;
    const bottom = (height - 1 - y) * row;
    for (let x = 0; x < row; x += 1) {
      const swap = pixels[top + x];
      pixels[top + x] = pixels[bottom + x];
      pixels[bottom + x] = swap;
    }
  }
  return pixels;
}

/** the canvas surface the runtime accepts (HTMLCanvasElement and OffscreenCanvas both fit). */
export interface RenderCanvas {
  width: number;
  height: number;
  getContext(contextId: "webgl2"): WebGL2RenderingContext | null;
}

/** the typed refusal of a renderer request — never a throw, never a fake render. */
export type RenderRefusal =
  | { ok: false; error: "render-no-webgl2" }
  | {
      ok: false;
      error: "render-empty-passes" | "render-bad-source" | "render-compile-failed" | "render-framebuffer-incomplete";
      detail?: string;
    };

/** the typed outcome of one render run: the readback pixels plus cache telemetry. */
export type RenderOutcome =
  | {
      ok: true;
      width: number;
      height: number;
      pixels: Uint8ClampedArray;
      passes: number;
      cache: { hits: number; misses: number };
    }
  | RenderRefusal;

/** the honest outcome of acquiring a renderer for one canvas. */
export type RendererOutcome = { ok: true; renderer: VersaRender } | { ok: false; error: "render-no-webgl2" };

/**
 * Acquires the WebGL2 runtime for one canvas. A canvas without a webgl2
 * context answers { ok: false, error: "render-no-webgl2" } — the honest
 * refusal of the house, never a fallback pretend render.
 */
export function createRenderer(canvas: RenderCanvas): RendererOutcome {
  const gl = canvas.getContext("webgl2");
  if (!gl) return { ok: false, error: "render-no-webgl2" };
  return { ok: true, renderer: new VersaRender(canvas, gl) };
}

/** one 2x2 RGBA ping-pong framebuffer pair (or null before the first ensure). */
interface PingPongPair {
  textures: { fbo0: WebGLTexture; fbo1: WebGLTexture };
  framebuffers: { fbo0: WebGLFramebuffer; fbo1: WebGLFramebuffer };
  width: number;
  height: number;
}

/**
 * The runtime itself: holds the GL context, the shared fullscreen-triangle
 * VAO, the ping-pong framebuffers and the program cache. One `run` executes
 * a whole effect chain over one source image and reads the result back.
 */
export class VersaRender {
  private readonly canvas: RenderCanvas;
  private readonly gl: WebGL2RenderingContext;
  private readonly cache = createProgramCache();
  private readonly triangle = fullscreenTriangle();
  private readonly vao: WebGLVertexArrayObject;
  private pair: PingPongPair | null = null;
  private sourceTexture: WebGLTexture | null = null;
  private lastInfoLog = "";

  constructor(canvas: RenderCanvas, gl: WebGL2RenderingContext) {
    this.canvas = canvas;
    this.gl = gl;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.triangle.positions, gl.STATIC_DRAW);
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, this.triangle.strideBytes, 0);
    gl.bindVertexArray(null);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
  }

  /** the compile cache telemetry surface (the wingets never need this). */
  cacheStats(): { hits: number; misses: number } {
    return this.cache.stats();
  }

  /**
   * Executes one effect chain over one source image. Every pass is one
   * fullscreen-triangle draw of the effect's compiled program; the last pass
   * lands on the visible canvas and the readback answers an ImageData-shaped
   * buffer (rows flipped into top-down order).
   */
  run(source: ImageInput, passes: readonly PassSpec[]): RenderOutcome {
    if (passes.length === 0) return { ok: false, error: "render-empty-passes" };
    const { width, height } = source;
    if (
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width < 1 ||
      height < 1 ||
      source.data.length !== width * height * 4
    ) {
      return {
        ok: false,
        error: "render-bad-source",
        detail: `${width}x${height} with ${source.data.length} bytes`,
      };
    }
    const gl = this.gl;
    if (this.canvas.width !== width) this.canvas.width = width;
    if (this.canvas.height !== height) this.canvas.height = height;
    if (!this.ensurePair(width, height)) return { ok: false, error: "render-framebuffer-incomplete" };
    const pair = this.pair as PingPongPair;
    const planned = planPasses(passes);
    const sourceTexture = this.uploadSource(source);

    for (const pass of planned) {
      const entry = this.compile(pass.spec.program);
      if (!entry) return { ok: false, error: "render-compile-failed", detail: this.lastInfoLog };
      gl.bindFramebuffer(gl.FRAMEBUFFER, pass.writes === "canvas" ? null : pair.framebuffers[pass.writes]);
      gl.viewport(0, 0, width, height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pass.reads === "source" ? sourceTexture : pair.textures[pass.reads]);
      // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is a WebGL2 state call binding the current program, not a react hook
      gl.useProgram(entry.program);
      gl.bindVertexArray(this.vao);
      if (entry.uniforms.uSource) gl.uniform1i(entry.uniforms.uSource, 0);
      if (entry.uniforms.uResolution) gl.uniform2f(entry.uniforms.uResolution, width, height);
      if (entry.uniforms.uTime) gl.uniform1f(entry.uniforms.uTime, pass.spec.time ?? 0);
      if (entry.uniforms.uAmount) gl.uniform1f(entry.uniforms.uAmount, pass.spec.program.amount);
      gl.drawArrays(gl.TRIANGLES, 0, this.triangle.count);
    }

    const raw = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, raw);
    const pixels = new Uint8ClampedArray(raw.buffer, raw.byteOffset, raw.length);
    return {
      ok: true,
      width,
      height,
      pixels: flipRows(pixels, width, height),
      passes: planned.length,
      cache: this.cache.stats(),
    };
  }

  /** releases every GL object this renderer created (the context stays). */
  dispose(): void {
    const gl = this.gl;
    for (const entry of this.cache.all()) gl.deleteProgram(entry.program);
    if (this.sourceTexture) gl.deleteTexture(this.sourceTexture);
    if (this.pair) {
      gl.deleteTexture(this.pair.textures.fbo0);
      gl.deleteTexture(this.pair.textures.fbo1);
      gl.deleteFramebuffer(this.pair.framebuffers.fbo0);
      gl.deleteFramebuffer(this.pair.framebuffers.fbo1);
    }
    this.pair = null;
    this.sourceTexture = null;
  }

  /** (re)allocates the ping-pong pair at the run size; false when incomplete. */
  private ensurePair(width: number, height: number): boolean {
    const gl = this.gl;
    if (this.pair && this.pair.width === width && this.pair.height === height) return true;
    if (this.pair) {
      gl.deleteTexture(this.pair.textures.fbo0);
      gl.deleteTexture(this.pair.textures.fbo1);
      gl.deleteFramebuffer(this.pair.framebuffers.fbo0);
      gl.deleteFramebuffer(this.pair.framebuffers.fbo1);
    }
    const textures = { fbo0: gl.createTexture(), fbo1: gl.createTexture() };
    const framebuffers = { fbo0: gl.createFramebuffer(), fbo1: gl.createFramebuffer() };
    for (const texture of [textures.fbo0, textures.fbo1]) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    for (const [slot, texture] of [
      ["fbo0", textures.fbo0],
      ["fbo1", textures.fbo1],
    ] as const) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[slot]);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) return false;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.pair = { textures, framebuffers, width, height };
    return true;
  }

  /** uploads one source image as the pass-0 input texture (flipped so v=0 answers the bottom row). */
  private uploadSource(source: ImageInput): WebGLTexture {
    const gl = this.gl;
    const texture = this.sourceTexture ?? gl.createTexture();
    this.sourceTexture = texture;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, source.width, source.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, source.data);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  /** cache-or-compile one effect program; null with lastInfoLog on failure. */
  private compile(program: EffectProgram): CachedPass | null {
    const key = passCacheKey(program);
    const hit = this.cache.lookup(key);
    if (hit) return hit;
    const gl = this.gl;
    const vertex = this.compileShader(gl.VERTEX_SHADER, PASS_VERTEX_SOURCE);
    const fragment = this.compileShader(gl.FRAGMENT_SHADER, program.program);
    if (!vertex || !fragment) return null;
    const linked = gl.createProgram();
    gl.attachShader(linked, vertex);
    gl.attachShader(linked, fragment);
    gl.bindAttribLocation(linked, 0, "aPosition");
    gl.linkProgram(linked);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (gl.getProgramParameter(linked, gl.LINK_STATUS) !== true) {
      this.lastInfoLog = gl.getProgramInfoLog(linked) ?? "link failed";
      gl.deleteProgram(linked);
      return null;
    }
    const entry: CachedPass = {
      key,
      program: linked,
      uniforms: {
        uSource: gl.getUniformLocation(linked, "uSource"),
        uResolution: gl.getUniformLocation(linked, "uResolution"),
        uTime: gl.getUniformLocation(linked, "uTime"),
        uAmount: gl.getUniformLocation(linked, "uAmount"),
      },
    };
    this.cache.store(entry);
    return entry;
  }

  /** compiles one shader stage; null with lastInfoLog on failure. */
  private compileShader(kind: GLenum, sourceText: string): WebGLShader | null {
    const gl = this.gl;
    const shader = gl.createShader(kind);
    if (!shader) {
      this.lastInfoLog = "shader allocation failed";
      return null;
    }
    gl.shaderSource(shader, sourceText);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
      this.lastInfoLog = gl.getShaderInfoLog(shader) ?? "compile failed";
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
}
