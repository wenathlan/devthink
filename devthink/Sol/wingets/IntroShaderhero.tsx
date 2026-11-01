/**
 * shaderhero.tsx — the living shader hero of the intro SaaS face (the winget
 * the hero section composes behind the statement): one full-bleed WebGL
 * canvas painting the doctrine hero — a grade derivando (the drifting
 * perspective grid) and a particle field answering it — in the ever rose
 * family of the landing (the --color-ever walk of sol.css the owner
 * ordered back). The engine loads LAZY: three.js rides a dynamic import
 * inside the mount effect, so the landing bundle never carries the 3d
 * engine and the face paints from the CSS gaussian alone while the module
 * travels. The motion law: the whole surface never arms under
 * prefers-reduced-motion (the canvas stays empty, the static CSS
 * atmosphere owns the face) and the loop pauses on a hidden tab. The
 * cleanup is total: the rAF dies, the listeners and the observer detach,
 * the geometry, the material and the renderer dispose on unmount. Purely
 * presentational: pointer-events none, aria-hidden, no copy.
 */

import { useEffect, useRef } from "react";

/** the alpha cap of the whole field — the hero reads, the statement reads over it */
const FIELD_OPACITY = 0.85;

/** the device pixel ratio ceiling — the shader stays crisp, the fill rate
 * stays cheap on the hidpi phones the landing answers */
const DPR_CAP = 2;

/** the grid and the particles in one fragment shader: deterministic (hash
 * noise, no random), time-driven, alpha-composited over the transparent
 * canvas so the CSS atmosphere under it stays the base */
const FRAGMENT = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = vUv;

  // the grade derivando: the field drifts down-right at a crawl; the
  // density grows toward the horizon (the top of the hero), so the grid
  // reads as a floor seen from above the statement
  float persp = mix(1.0, 3.4, uv.y);
  vec2 cell = vec2((uv.x - 0.5) * persp + uTime * 0.010, uv.y * persp * 0.62 + uTime * 0.022);
  vec2 g = abs(fract(cell) - 0.5);
  float d = min(g.x, g.y);
  float line = smoothstep(0.46, 0.44, d);
  float glow = smoothstep(0.22, 0.0, d) * 0.4;

  // the particles: one per hash cell of a coarser lattice, drifting up,
  // twinkling on their own phase — the sky the grid floats in
  vec2 pcell = uv * vec2(26.0, 15.0) + vec2(uTime * 0.012, -uTime * 0.05);
  vec2 pid = floor(pcell);
  vec2 pf = fract(pcell);
  float seed = hash(pid);
  vec2 ppos = vec2(hash(pid + 1.7), hash(pid + 3.1));
  float pd = length(pf - ppos);
  float twinkle = 0.5 + 0.5 * sin(uTime * (0.6 + seed) + seed * 6.2831);
  float dotm = smoothstep(0.10, 0.0, pd) * step(0.72, seed) * (0.35 + 0.65 * twinkle);

  // the composition: the ever rose walk — ever body, ever-deep crest and
  // the ever ink on the few largest particles — the brand walk of the
  // landing (the --color-ever family of sol.css)
  vec3 ink = mix(vec3(0.941, 0.314, 0.620), vec3(0.788, 0.169, 0.525), uv.y);
  vec3 ever = vec3(0.345, 0.075, 0.259);
  vec3 pcol = mix(ink, ever, step(0.94, seed));

  // the mask: the field fades at the very top (the header stays clean),
  // at the bottom edge it hands over to the CSS gaussian blobs
  float mask = smoothstep(1.02, 0.62, uv.y) * smoothstep(-0.02, 0.16, uv.y);
  float alpha = (line * 0.16 + glow * 0.12 + dotm * 0.30) * mask;

  gl_FragColor = vec4(mix(ink, pcol, dotm), alpha * ${FIELD_OPACITY.toFixed(2)});
}
`;

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/** three.js as the page never imports it statically: the types ride the
 * module namespace so the lazy lane stays typed without pulling the graph */
type ThreeModule = typeof import("three");
type ThreeVector2 = import("three").Vector2;

/**
 * Shaderhero — the drifting grid and the particle sky behind the intro
 * statement. Renders nothing under reduced motion (the static atmosphere
 * owns the face); the WebGL field arms itself only after the lazy module
 * lands, and every resource it opens dies with the component.
 */
export function Shaderhero() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    // the motion law: the hero never arms under the reduced-motion
    // preference — the canvas stays empty, the CSS atmosphere owns the face
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let disposed = false;
    let frame = 0;
    let started = false;
    let cleanup: (() => void) | null = null;

    void import("three").then((three: ThreeModule) => {
      if (disposed || !hostRef.current) return;
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      host.appendChild(canvas);

      const renderer = new three.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
      renderer.setClearColor(0x000000, 0);

      const scene = new three.Scene();
      const camera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geometry = new three.PlaneGeometry(2, 2);
      const material = new three.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uRes: { value: new three.Vector2(1, 1) },
        },
      });
      scene.add(new three.Mesh(geometry, material));

      const resize = () => {
        const rect = host.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        renderer.setSize(rect.width, rect.height, false);
        (material.uniforms.uRes.value as ThreeVector2).set(rect.width, rect.height);
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(host);

      // the loop pauses on a hidden tab: the rAF already throttles, the
      // visibility guard stops the uniform clock from running away while
      // the landing is not on screen
      const clock = new three.Clock();
      const tick = () => {
        frame = window.requestAnimationFrame(tick);
        if (document.hidden) return;
        // the delta clamps so a long stall never jumps the field
        material.uniforms.uTime.value += Math.min(clock.getDelta(), 0.05);
        renderer.render(scene, camera);
      };

      const onHidden = () => {
        if (document.hidden) {
          window.cancelAnimationFrame(frame);
          frame = 0;
          return;
        }
        if (!frame) {
          clock.getDelta();
          tick();
        }
      };
      document.addEventListener("visibilitychange", onHidden);

      started = true;
      tick();

      cleanup = () => {
        document.removeEventListener("visibilitychange", onHidden);
        observer.disconnect();
        if (frame) window.cancelAnimationFrame(frame);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        canvas.remove();
      };
    });

    return () => {
      disposed = true;
      // a cleanup that lands before the lazy module resolves just cancels
      // the promise's effect; after it, the scene teardown runs
      if (started) cleanup?.();
    };
  }, []);

  return <div ref={hostRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
}
