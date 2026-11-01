/**
 * Halo.tsx — the hero halo of the product face: a lazy three.js field —
 * a slow wireframe icosahedron over a drifting particle sphere, both in
 * the windows accent read off the token (never a fixed hue) — riding
 * behind the hero copy. The doctrine rules hold: the module loads through
 * a dynamic import (the static bundle never carries three), the scene
 * only builds on a motion-allowed document (prefers-reduced-motion
 * refuses it), the render loop rides requestAnimationFrame with a
 * document-visibility gate, and the cleanup disposes every geometry,
 * material, texture target and the renderer itself, disconnects the
 * observers and cancels the frame — zero leaks on unmount. A host without
 * WebGL answers an honest null.
 */

import { useEffect, useRef } from "react";

/** the accent token the halo reads (the value comes from the stylesheet). */
const ACCENT_TOKEN = "--color-win";

/** the device pixel ratio the renderer caps at (the retinal ceiling). */
const PIXEL_CAP = 2;

/** the scene build payload one render keeps alive. */
interface HaloRig {
  renderer: {
    dispose: () => void;
    setAnimationLoop: (callback: (() => void) | null) => void;
    domElement: HTMLCanvasElement;
  };
  disposables: { dispose: () => void }[];
  stop: () => void;
}

/**
 * The hero halo: an absolutely positioned canvas the hero styles place.
 *
 * @returns the halo element (the canvas mounts through the effect).
 */
export function Halo() {
  const holder = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = holder.current;
    if (!host) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rig: HaloRig | null = null;
    let cancelled = false;
    let resize: ResizeObserver | null = null;

    void (async () => {
      const THREE = await import("three");
      if (cancelled || !host) return;

      let gl: WebGLRenderingContext | null = null;
      try {
        gl =
          document.createElement("canvas").getContext("webgl2") ?? document.createElement("canvas").getContext("webgl");
      } catch {
        gl = null;
      }
      if (!gl) return;

      const accent = getComputedStyle(document.documentElement).getPropertyValue(ACCENT_TOKEN).trim() || "#4cc2ff";
      const width = () => host.clientWidth || 1;
      const height = () => host.clientHeight || 1;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width() / height(), 0.1, 60);
      camera.position.set(0, 0, 9);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, PIXEL_CAP));
      renderer.setSize(width(), height());
      renderer.domElement.className = "vc-halo__canvas";
      host.appendChild(renderer.domElement);

      const disposables: { dispose: () => void }[] = [];

      // the wireframe icosahedron — the vault shell, slow and heavy
      const shellGeometry = new THREE.IcosahedronGeometry(3.1, 1);
      const shellWireframe = new THREE.WireframeGeometry(shellGeometry);
      const shellMaterial = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.32 });
      const shell = new THREE.LineSegments(shellWireframe, shellMaterial);
      disposables.push(shellGeometry, shellWireframe, shellMaterial);
      scene.add(shell);

      // the drifting particle sphere — the edge nodes of the store
      const count = 640;
      const positions = new Float32Array(count * 3);
      for (let index = 0; index < count; index += 1) {
        const phi = Math.acos((2 * (index + 0.5)) / count - 1);
        const theta = Math.PI * (1 + Math.sqrt(5)) * index;
        const radius = 4.15 + (index % 3) * 0.12;
        positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[index * 3 + 1] = radius * Math.cos(phi);
        positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      }
      const fieldGeometry = new THREE.BufferGeometry();
      fieldGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const fieldMaterial = new THREE.PointsMaterial({ color: accent, size: 0.045, transparent: true, opacity: 0.6 });
      const field = new THREE.Points(fieldGeometry, fieldMaterial);
      disposables.push(fieldGeometry, fieldMaterial);
      scene.add(field);

      const clock = new THREE.Clock();
      let running = true;
      const frame = (): void => {
        if (!running) return;
        const elapsed = clock.getElapsedTime();
        shell.rotation.y = elapsed * 0.06;
        shell.rotation.x = Math.sin(elapsed * 0.11) * 0.08;
        field.rotation.y = -elapsed * 0.028;
        renderer.render(scene, camera);
      };
      renderer.setAnimationLoop(frame);

      const visibilityGate = (): void => {
        if (document.hidden) {
          running = false;
          renderer.setAnimationLoop(null);
        } else if (!running) {
          running = true;
          clock.start();
          renderer.setAnimationLoop(frame);
        }
      };
      document.addEventListener("visibilitychange", visibilityGate);

      resize = new ResizeObserver(() => {
        camera.aspect = width() / height();
        (camera as { updateProjectionMatrix: () => void }).updateProjectionMatrix();
        renderer.setSize(width(), height());
      });
      resize.observe(host);

      rig = {
        renderer: renderer as unknown as HaloRig["renderer"],
        disposables,
        stop: () => {
          running = false;
          renderer.setAnimationLoop(null);
          document.removeEventListener("visibilitychange", visibilityGate);
        },
      };
    })();

    return () => {
      cancelled = true;
      resize?.disconnect();
      if (rig) {
        rig.stop();
        for (const disposable of rig.disposables) disposable.dispose();
        rig.renderer.dispose();
        rig.renderer.domElement.remove();
      }
    };
  }, []);

  return <div className="vc-halo" aria-hidden="true" ref={holder} />;
}

export default Halo;
