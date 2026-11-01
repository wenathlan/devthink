// # versawase3d — the 3d viewport runtime of the versawase engine: it takes
// the mesh data the visualize pipeline already produces (vertices, indices,
// vertex colors, normals) and mounts a real three.js scene — perspective
// camera with a hand-rolled orbit (drag to rotate, wheel or pinch to zoom,
// no external controls package), ambient plus directional light, a
// vertex-colored standard material, and a rAF loop that stays still under
// reduced motion. The mesh math is a pure conversion (image space is
// mirrored into three's y-up space and the winding is reversed to keep the
// front faces toward the camera), node-testable without any canvas; the
// DOM side (listeners, observer, loop) lives in one viewport object that
// disposes cleanly.

import * as THREE from "three";
import type { MeshGeometry } from "./visualizemesh.ts";

/** the mesh payload the viewport mounts — exactly what visualize() answers. */
export interface MeshData {
  mesh: MeshGeometry;
  /** rgb vertex colors 0-1, 3 per vertex (null = plain material). */
  colors: Float32Array | null;
  /** xyz unit normals, 3 per vertex (null = the geometry computes its own). */
  normals: Float32Array | null;
}

/** the pure, three-ready conversion of one mesh payload. */
export interface ThreeMeshArgs {
  /** xyz positions with y mirrored: image rows read top-down in three's y-up space. */
  positions: Float32Array;
  /** unit normals with y mirrored to match the positions (null when the input had none). */
  normals: Float32Array | null;
  /** vertex colors passed through untouched (null when the input had none). */
  colors: Float32Array | null;
  /** triangle indices with the winding reversed — the y mirror flips front faces. */
  indices: Uint32Array;
  /** the axis-aligned center of the converted positions. */
  center: [number, number, number];
  /** the axis-aligned extent of the converted positions. */
  size: [number, number, number];
  /** element counts of the mesh. */
  counts: { vertices: number; triangles: number };
}

/**
 * Converts one visualize mesh into three's coordinate system: image space
 * grows x right and y down, so the y axis is mirrored (rows read top-down)
 * and, because a mirror reflection flips triangle winding, the last two
 * corners of every face are swapped — the front faces keep pointing toward
 * the camera at +z. Colors pass through; provided normals are mirrored the
 * same way as the positions.
 */
export function threeMeshArgs(data: MeshData): ThreeMeshArgs {
  const { mesh } = data;
  const source = mesh.vertices;
  const positions = new Float32Array(source.length);
  for (let offset = 0; offset < source.length; offset += 3) {
    positions[offset] = source[offset];
    positions[offset + 1] = -source[offset + 1];
    positions[offset + 2] = source[offset + 2];
  }
  let normals: Float32Array | null = null;
  if (data.normals) {
    const given = data.normals;
    normals = new Float32Array(given.length);
    for (let offset = 0; offset < given.length; offset += 3) {
      normals[offset] = given[offset];
      normals[offset + 1] = -given[offset + 1];
      normals[offset + 2] = given[offset + 2];
    }
  }
  const faces = mesh.indices;
  const indices = new Uint32Array(faces.length);
  for (let face = 0; face < faces.length; face += 3) {
    indices[face] = faces[face];
    indices[face + 1] = faces[face + 2];
    indices[face + 2] = faces[face + 1];
  }
  const min: [number, number, number] = [0, 0, 0];
  const max: [number, number, number] = [0, 0, 0];
  for (let offset = 0; offset < positions.length; offset += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      const value = positions[offset + axis];
      if (offset === 0 || value < min[axis]) min[axis] = value;
      if (offset === 0 || value > max[axis]) max[axis] = value;
    }
  }
  return {
    positions,
    normals,
    colors: data.colors,
    indices,
    center: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
    size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
    counts: { vertices: positions.length / 3, triangles: indices.length / 3 },
  };
}

/**
 * The camera distance that frames the longest mesh side inside the viewport:
 * half the longest side over the tangent of half the field of view, times a
 * breathing margin. Degenerate meshes fall back to the unit side.
 */
export function fitCameraDistance(
  size: readonly [number, number, number] | readonly number[],
  fovDegrees = 50,
  margin = 1.45,
): number {
  const longest = Math.max(size[0], size[1], size[2]) || 1;
  const halfFov = ((fovDegrees > 0 && fovDegrees < 180 ? fovDegrees : 50) / 2) * (Math.PI / 180);
  return (longest / 2 / Math.tan(halfFov)) * (margin > 0 ? margin : 1);
}

/** the mount options of one viewport. */
export interface ViewportOptions {
  /** initial polar angle from +y in degrees (default 62 — a three-quarter view). */
  phiDegrees?: number;
  /** initial azimuth around +y in degrees (default -32). */
  thetaDegrees?: number;
  /** slow idle drift while the OS allows motion (default true). */
  spin?: boolean;
  /** the reduced-motion answer: no autonomous motion, renders on demand (default false). */
  reducedMotion?: boolean;
}

/** one mounted viewport: deterministic surface, clean teardown. */
export interface Viewport {
  /** renders one frame synchronously (the screenshot path uses it). */
  renderNow(): void;
  /** restores the initial framing. */
  reset(): void;
  /** answers a png data url of the current frame (for the download row). */
  screenshot(): string;
  /** cancels the loop, drops the listeners and disposes every three resource. */
  dispose(): void;
}

/** the honest outcome of mounting: a viewport, or the typed refusal. */
export type ViewportOutcome = { ok: true; viewport: Viewport } | { ok: false; error: "three-no-webgl" };

/** the idle drift rate in radians per second (a slow showroom turn). */
const SPIN_RAD_PER_SECOND = 0.22;

/** drag sensitivity in radians per pixel. */
const ROTATE_PER_PIXEL = 0.006;

/** zoom sensitivity per wheel notch (exponential). */
const ZOOM_PER_NOTCH = 0.0012;

/**
 * Mounts the real 3d scene over one canvas: converted BufferGeometry with
 * vertex colors, ambient plus directional light, a perspective camera on a
 * hand-rolled orbit and a rAF loop that only moves when the OS allows
 * motion — under reduced motion the viewport renders on demand (input and
 * resize) and never animates on its own. A canvas without a webgl context
 * answers { ok: false, error: "three-no-webgl" } — no fallback, no pretend.
 */
export function mountThreeScene(
  canvas: HTMLCanvasElement,
  data: MeshData,
  options: ViewportOptions = {},
): ViewportOutcome {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch {
    return { ok: false, error: "three-no-webgl" };
  }

  const args = threeMeshArgs(data);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(args.positions, 3));
  if (args.normals) geometry.setAttribute("normal", new THREE.BufferAttribute(args.normals, 3));
  if (args.colors) geometry.setAttribute("color", new THREE.BufferAttribute(args.colors, 3));
  geometry.setIndex(new THREE.BufferAttribute(args.indices, 1));
  if (!args.normals) geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: args.colors !== null,
    roughness: 0.9,
    metalness: 0.05,
    // carved holes (minHeight) let the orbit see the back of the relief
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  // lay the relief up: the image plane becomes horizontal, heights point to +y
  const group = new THREE.Group();
  group.rotation.x = -Math.PI / 2;
  group.add(mesh);

  const scene = new THREE.Scene();
  scene.add(group);
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  // rotation.x = -pi/2 maps (x, y, z) to (x, z, -y): the center follows
  const target = new THREE.Vector3(args.center[0], args.center[2], -args.center[1]);
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position
    .copy(target)
    .add(new THREE.Vector3(0.5, 0.9, 0.7).normalize().multiplyScalar(Math.max(args.size[1], 1) * 4 + 10));
  key.target.position.copy(target);
  scene.add(key);
  scene.add(key.target);

  const fov = 50;
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.01, 10000);
  const initialTheta = ((options.thetaDegrees ?? -32) * Math.PI) / 180;
  const initialPhi = ((options.phiDegrees ?? 62) * Math.PI) / 180;
  const initialRadius = fitCameraDistance(args.size, fov);
  const minRadius = initialRadius * 0.3;
  const maxRadius = initialRadius * 5;

  let theta = initialTheta;
  let phi = initialPhi;
  let radius = initialRadius;
  let dragging = false;
  let pinchDistance = 0;
  let dirty = true;
  let disposed = false;
  let raf = 0;
  let lastFrameMs = 0;
  const pointers = new Map<number, { x: number; y: number }>();
  const reduced = options.reducedMotion ?? false;
  const spinEnabled = (options.spin ?? true) && !reduced;

  const clampRadius = (value: number): number => Math.min(maxRadius, Math.max(minRadius, value));
  const clampPhi = (value: number): number => Math.min(Math.PI - 0.08, Math.max(0.08, value));
  const pointerDistance = (): number => {
    const [first, second] = [...pointers.values()];
    if (!first || !second) return 0;
    return Math.hypot(first.x - second.x, first.y - second.y);
  };

  const place = (): void => {
    camera.position.set(
      target.x + radius * Math.sin(phi) * Math.cos(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.sin(theta),
    );
    camera.lookAt(target);
  };

  const frame = (now: number): void => {
    raf = 0;
    if (disposed) return;
    const deltaSeconds = lastFrameMs === 0 ? 0 : Math.min((now - lastFrameMs) / 1000, 0.1);
    lastFrameMs = now;
    if (spinEnabled && !dragging) {
      theta += SPIN_RAD_PER_SECOND * deltaSeconds;
      dirty = true;
    }
    if (dirty) {
      place();
      renderer.render(scene, camera);
      dirty = false;
    }
    if (spinEnabled) raf = requestAnimationFrame(frame);
  };

  /** asks for one frame — the reduced-motion path renders exactly this and stops. */
  const requestRender = (): void => {
    dirty = true;
    if (raf === 0 && !disposed) raf = requestAnimationFrame(frame);
  };

  const resize = (): void => {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  };

  const onPointerDown = (event: PointerEvent): void => {
    canvas.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    dragging = true;
    if (pointers.size === 2) pinchDistance = pointerDistance();
  };
  const onPointerMove = (event: PointerEvent): void => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    if (pointers.size === 2) {
      previous.x = event.clientX;
      previous.y = event.clientY;
      const next = pointerDistance();
      if (pinchDistance > 0 && next > 0) radius = clampRadius((radius * pinchDistance) / next);
      pinchDistance = next;
    } else {
      theta -= (event.clientX - previous.x) * ROTATE_PER_PIXEL;
      phi = clampPhi(phi - (event.clientY - previous.y) * ROTATE_PER_PIXEL);
    }
    previous.x = event.clientX;
    previous.y = event.clientY;
    requestRender();
  };
  const onPointerUp = (event: PointerEvent): void => {
    pointers.delete(event.pointerId);
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (pointers.size < 2) pinchDistance = 0;
    dragging = pointers.size > 0;
    requestRender();
  };
  const onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    radius = clampRadius(radius * Math.exp(event.deltaY * ZOOM_PER_NOTCH));
    requestRender();
  };

  const listeners: [string, EventListener, AddEventListenerOptions?][] = [
    ["pointerdown", onPointerDown as EventListener],
    ["pointermove", onPointerMove as EventListener],
    ["pointerup", onPointerUp as EventListener],
    ["pointercancel", onPointerUp as EventListener],
    ["wheel", onWheel as EventListener, { passive: false }],
  ];
  for (const [type, listener, capture] of listeners) {
    canvas.addEventListener(type, listener, capture);
  }
  canvas.style.touchAction = "none";

  const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => resize()) : null;
  observer?.observe(canvas);
  resize();

  return {
    ok: true,
    viewport: {
      renderNow(): void {
        place();
        renderer.render(scene, camera);
        dirty = false;
      },
      reset(): void {
        theta = initialTheta;
        phi = initialPhi;
        radius = initialRadius;
        requestRender();
      },
      screenshot(): string {
        place();
        renderer.render(scene, camera);
        dirty = false;
        return canvas.toDataURL("image/png");
      },
      dispose(): void {
        if (disposed) return;
        disposed = true;
        if (raf !== 0) cancelAnimationFrame(raf);
        raf = 0;
        observer?.disconnect();
        for (const [type, listener, capture] of listeners) {
          canvas.removeEventListener(type, listener, capture);
        }
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      },
    },
  };
}
