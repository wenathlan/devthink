/**
 * shaderwall.tsx — the WebGL aurora wall of the DevThink OS desktop (campaign
 * V3 · R1-a). One full-screen triangle draws a slow, domain-warped aurora in
 * the house palette — graphite #17191f base, one #ff5f00 ember light rising
 * from the lower third, warm #ffca8a drifts and a film-grain dither — at a
 * fixed ~12% opacity so the UI above always stays readable (the 8–14%
 * doctrine band). The static radial fallback lives in sol.css as
 * --wall-fallback on the atmosphere; this canvas paints OVER it, and when
 * WebGL is unavailable the canvas simply never draws and the fallback shows.
 *
 * Discipline: the render loop is a rAF at ~30fps, paused while
 * document.hidden (visibilitychange) and reduced to ONE static frame under
 * prefers-reduced-motion; the backing store is capped below device resolution
 * (the field is soft — resolution buys nothing) and the context is released
 * on unmount. No UI logic, no state, no re-renders: one effect owns the GL
 * lifecycle and the component renders a single <canvas>.
 */

import { useEffect, useRef } from "react";

/** the fullscreen-triangle vertex shader (three corner vertices, no matrices) */
const VERTEX_SRC = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/** the aurora fragment shader: warped fbm, one ember light, grain dither */
const FRAGMENT_SRC = `
precision mediump float;

uniform vec2 u_res;
uniform float u_time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 s = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, s.x), mix(c, d, s.x), s.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(11.7, 9.2);
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res.xy) / min(u_res.x, u_res.y);
  float t = u_time * 0.06;

  // one light source: the ember aurora rising from the lower third of the wall
  vec2 warp = vec2(fbm(p * 2.4 + vec2(t * 0.5, -t * 0.7)), fbm(p * 2.1 - vec2(t * 0.4, t * 0.3)));
  float aurora = fbm(p * 1.7 + warp * 0.55 + vec2(0.0, -t * 0.4));
  // well-defined falloff (edge0 < edge1): 1.0 at the light, 0.0 far away
  float light = 1.0 - smoothstep(0.05, 0.95, length(p - vec2(0.0, -0.52)));

  vec3 base = vec3(0.090, 0.098, 0.122);   // #17191f — the graphite floor
  vec3 ember = vec3(1.0, 0.373, 0.0);      // #ff5f00 — the signal
  vec3 amber = vec3(1.0, 0.792, 0.541);    // #ffca8a — the warm edge

  vec3 col = base;
  col += ember * pow(aurora, 2.8) * light * 0.9;
  col += amber * pow(fbm(p * 2.6 - warp + vec2(t * 0.35, t * 0.2)), 3.4) * light * 0.4;
  col *= 1.0 - dot(p, p) * 0.5;            // the vignette keeps the edges quiet

  // film-grain dither: kills the banding the soft gradients would show
  float grain = hash(gl_FragCoord.xy + fract(u_time) * 61.7) - 0.5;
  col += grain * (2.0 / 255.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

/** compiles one shader of a type, false on failure (the fallback wall shows) */
function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** builds the one program of the wall; null when the GL pipeline fails */
function buildProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  if (!vertex || !fragment) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

type ShaderWallProps = {
  /** extra classes beside the shaderwall composition */
  className?: string;
};

/** The desktop aurora wall: one canvas, one program, one quiet loop. The
 * paint contract rides the Tailwind composition (task 3-a): an absolute
 * full-bleed layer at the 12% atmosphere opacity (the 8–14% band: atmosphere,
 * never noise), pointer-transparent, hidden entirely under
 * prefers-reduced-transparency (the static --wall-fallback recipe beneath
 * answers instead). */
export function ShaderWall({ className }: ShaderWallProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    }) as WebGLRenderingContext | null;
    if (!gl) return undefined; // the css --wall-fallback stays visible

    const program = buildProgram(gl);
    if (!program) return undefined;
    // bound off the context so the call site does not read like a react hook
    const applyProgram = gl.useProgram.bind(gl);
    applyProgram(program);

    // the fullscreen triangle: one buffer, three corners, never touched again
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");

    // the backing store stays under device resolution — the field is soft
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = 0.62 * Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(240, Math.round(rect.width * scale));
      const height = Math.max(160, Math.round(rect.height * scale));
      if (canvas.width === width && canvas.height === height) return false;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      return true;
    };

    const draw = (seconds: number) => {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, seconds);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      raf = window.requestAnimationFrame(frame);
      if (now - last < 33) return; // ~30fps: the aurora never needs more
      last = now;
      draw(now / 1000);
    };

    resize();
    if (reduced) {
      // one static composition, then silence — the reduced-motion contract
      draw(7.3);
    } else {
      raf = window.requestAnimationFrame(frame);
    }

    const onVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(raf);
      } else if (!reduced) {
        last = 0;
        raf = window.requestAnimationFrame(frame);
      }
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      window.cancelAnimationFrame(raf);
    };
    const onRestored = () => {
      draw(reduced ? 7.3 : performance.now() / 1000);
    };
    const observer = new ResizeObserver(() => {
      if (resize()) draw(reduced ? 7.3 : performance.now() / 1000);
    });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  // purely decorative: the aria-hidden atmosphere wrapper owns the a11y story
  return (
    <canvas
      ref={canvasRef}
      className={`shaderwall absolute inset-0 h-full w-full opacity-12 pointer-events-none [@media(prefers-reduced-transparency:reduce)]:hidden ${className ?? ""}`}
    />
  );
}
