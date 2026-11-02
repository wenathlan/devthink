// # compositorraster — the software rasterizer of the timeline compositor
// (the wave-4 compositor doctrine, actions 251-270: pixels, not promises).
// The GL runtime (versawaserender.ts) paints compiled EffectPrograms through
// WebGL2 in the browser; this sibling rasterizes the same frame contract on
// the CPU so the render queue (renderjob.ts) can produce real encoded bytes
// headlessly. Two samplers live here: the DrawCommand rasterizer over the
// imagerender IR (rect, ellipse, gradient wash, path, stroke path, grain
// speckle — anti-aliased scanline coverage, the documented z bands, the
// per-command box-blur lane over pixel.ts) and the 3D scene sampler over
// the visualize mesh geometry (perspective camera on the versawase3d orbit
// contract, backface culling, a real z-buffer, perspective-correct gouraud
// vertex colors). Non-goals: no WebGL (the GL runtime owns the browser
// lane), no lighting model (the vertex colors the mesh generator carries
// are the truth), no masks beyond the coverage the shapes own.
// Exports: 1 function family, 5 helpers, 2 types.

import { type DrawCommand, type RenderFrame, Z_BACKGROUND } from "./imagerender.ts";
import { makeopacity, type OpacityGrid } from "./masks.ts";
import { boxblurimage, type PixelImage } from "./pixel.ts";
import { fitCameraDistance } from "./versawase3d.ts";
import type { MeshGeometry } from "./visualizemesh.ts";

/** one rgb triple 0-255 (the byte domain of every raster lane). */
export type RgbTriple = readonly [number, number, number];

/** the documented parse failure answer: the fallback color, never a throw. */
const FALLBACK_COLOR: RgbTriple = [0, 0, 0];

/**
 * hexcolor — parses the "#rrggbb" spelling every DrawCommand carries into
 * its rgb triple; damaged input answers the fallback (total, never a throw).
 *
 * @param hex the color spelling.
 * @param fallback the answer for unreadable input (default black).
 * @returns the rgb triple.
 */
export function hexcolor(hex: string, fallback: RgbTriple = FALLBACK_COLOR): RgbTriple {
  if (typeof hex !== "string" || !/^#[0-9a-f]{6}$/i.test(hex)) return fallback;
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

/** clamps into 0-1. */
function clamp01(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

/** the coverage a pixel [x, x+1) takes of the span [edge0, edge1) (analytic 1D). */
function spanCoverage(x: number, edge0: number, edge1: number): number {
  const left = Math.max(x, edge0);
  const right = Math.min(x + 1, edge1);
  return clamp01(right - left);
}

/**
 * rectCoverage — paints the analytic anti-aliased coverage of one axis-
 * aligned rectangle (px coordinates, fractional edges) into a fresh grid.
 *
 * @param width the canvas width.
 * @param height the canvas height.
 * @param x0 the left edge (px).
 * @param y0 the top edge (px).
 * @param x1 the right edge (px).
 * @param y1 the bottom edge (px).
 * @returns the coverage grid.
 */
export function rectCoverage(
  width: number,
  height: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): OpacityGrid {
  const grid = makeopacity(width, height, 0);
  const left = Math.max(0, Math.floor(x0));
  const top = Math.max(0, Math.floor(y0));
  const right = Math.min(width, Math.ceil(x1));
  const bottom = Math.min(height, Math.ceil(y1));
  for (let y = top; y < bottom; y += 1) {
    const cy = spanCoverage(y, y0, y1);
    if (cy <= 0) continue;
    for (let x = left; x < right; x += 1) {
      const cx = spanCoverage(x, x0, x1);
      if (cx <= 0) continue;
      grid.data[y * width + x] = cx * cy;
    }
  }
  return grid;
}

/** one sample offset of the 3x3 supersampling pattern (thirds of the pixel). */
const SUPERSAMPLE: readonly (readonly [number, number])[] = [
  [-1 / 3, -1 / 3],
  [0, -1 / 3],
  [1 / 3, -1 / 3],
  [-1 / 3, 0],
  [0, 0],
  [1 / 3, 0],
  [-1 / 3, 1 / 3],
  [0, 1 / 3],
  [1 / 3, 1 / 3],
];

/**
 * ellipseCoverage — the 3x3 supersampled coverage of one ellipse (px center
 * and radii): the implicit equation samples at nine sub-pixel positions and
 * the hit count over nine answers the pixel alpha.
 *
 * @param width the canvas width.
 * @param height the canvas height.
 * @param cx the ellipse center x (px).
 * @param cy the ellipse center y (px).
 * @param rx the x radius (px).
 * @param ry the y radius (px).
 * @returns the coverage grid.
 */
export function ellipseCoverage(
  width: number,
  height: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): OpacityGrid {
  const grid = makeopacity(width, height, 0);
  if (!(rx > 0 && ry > 0)) return grid;
  const left = Math.max(0, Math.floor(cx - rx - 1));
  const right = Math.min(width, Math.ceil(cx + rx + 1));
  const top = Math.max(0, Math.floor(cy - ry - 1));
  const bottom = Math.min(height, Math.ceil(cy + ry + 1));
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      let hits = 0;
      for (const [dx, dy] of SUPERSAMPLE) {
        const nx = (x + 0.5 + dx - cx) / rx;
        const ny = (y + 0.5 + dy - cy) / ry;
        if (nx * nx + ny * ny <= 1) hits += 1;
      }
      if (hits > 0) grid.data[y * width + x] = hits / SUPERSAMPLE.length;
    }
  }
  return grid;
}

/** the even-odd point-in-polygon test (px coordinates, flat x,y pairs). */
function pointInPolygon(px: number, py: number, points: readonly number[]): boolean {
  let inside = false;
  const count = points.length / 2;
  for (let at = 0, prev = count - 1; at < count; prev = at, at += 1) {
    const ax = points[at * 2];
    const ay = points[at * 2 + 1];
    const bx = points[prev * 2];
    const by = points[prev * 2 + 1];
    if (ay > py !== by > py && px < ((bx - ax) * (py - ay)) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}

/** the bounding box of a flat x,y point list (px). */
function pointsBounds(points: readonly number[]): { left: number; top: number; right: number; bottom: number } {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (let at = 0; at + 1 < points.length; at += 2) {
    left = Math.min(left, points[at]);
    top = Math.min(top, points[at + 1]);
    right = Math.max(right, points[at]);
    bottom = Math.max(bottom, points[at + 1]);
  }
  if (!Number.isFinite(left)) return { left: 0, top: 0, right: 0, bottom: 0 };
  return { left, top, right, bottom };
}

/**
 * polygonCoverage — the 3x3 supersampled even-odd fill of one closed
 * polygon (px coordinates, flat x,y pairs).
 *
 * @param width the canvas width.
 * @param height the canvas height.
 * @param points the flat x,y pairs (px).
 * @returns the coverage grid.
 */
export function polygonCoverage(width: number, height: number, points: readonly number[]): OpacityGrid {
  const grid = makeopacity(width, height, 0);
  if (points.length < 6) return grid;
  const bounds = pointsBounds(points);
  const left = Math.max(0, Math.floor(bounds.left));
  const top = Math.max(0, Math.floor(bounds.top));
  const right = Math.min(width, Math.ceil(bounds.right));
  const bottom = Math.min(height, Math.ceil(bounds.bottom));
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      let hits = 0;
      for (const [dx, dy] of SUPERSAMPLE) {
        if (pointInPolygon(x + 0.5 + dx, y + 0.5 + dy, points)) hits += 1;
      }
      if (hits > 0) grid.data[y * width + x] = hits / SUPERSAMPLE.length;
    }
  }
  return grid;
}

/** the squared distance from a point to one segment (px). */
function segmentDistance2(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const length2 = dx * dx + dy * dy;
  const t = length2 === 0 ? 0 : clamp01(((px - ax) * dx + (py - ay) * dy) / length2);
  const cx = ax + t * dx - px;
  const cy = ay + t * dy - py;
  return cx * cx + cy * cy;
}

/**
 * strokeCoverage — the anti-aliased coverage of one stroked polyline (px
 * coordinates, stroke width in px, round joins and caps): a pixel is covered
 * by its center distance to the nearest segment against the half width,
 * feathered over one pixel (the smoothstep of the scanline lane).
 *
 * @param width the canvas width.
 * @param height the canvas height.
 * @param points the flat x,y pairs (px).
 * @param strokeWidth the stroke width (px).
 * @returns the coverage grid.
 */
export function strokeCoverage(
  width: number,
  height: number,
  points: readonly number[],
  strokeWidth: number,
): OpacityGrid {
  const grid = makeopacity(width, height, 0);
  if (points.length < 4 || !(strokeWidth > 0)) return grid;
  const half = strokeWidth / 2;
  const bounds = pointsBounds(points);
  const pad = half + 1;
  const left = Math.max(0, Math.floor(bounds.left - pad));
  const top = Math.max(0, Math.floor(bounds.top - pad));
  const right = Math.min(width, Math.ceil(bounds.right + pad));
  const bottom = Math.min(height, Math.ceil(bounds.bottom + pad));
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      let nearest = Number.POSITIVE_INFINITY;
      for (let at = 0; at + 3 < points.length; at += 2) {
        nearest = Math.min(
          nearest,
          segmentDistance2(px, py, points[at], points[at + 1], points[at + 2], points[at + 3]),
        );
      }
      const distance = Math.sqrt(nearest);
      const coverage = clamp01(half + 0.5 - distance);
      if (coverage > 0) grid.data[y * width + x] = coverage;
    }
  }
  return grid;
}

/** the coverage grid of one draw command (the shape lane of the rasterizer). */
function commandCoverage(command: DrawCommand, width: number, height: number): OpacityGrid {
  switch (command.kind) {
    case "rect":
      return rectCoverage(width, height, command.x * width, command.y * height, (command.x + command.w) * width, (command.y + command.h) * height);
    case "ellipse":
      return ellipseCoverage(
        width,
        height,
        command.cx * width,
        command.cy * height,
        Math.max(0.5, command.rx * width),
        Math.max(0.5, command.ry * height),
      );
    case "gradientwash":
      return rectCoverage(width, height, command.x * width, command.y * height, (command.x + command.w) * width, (command.y + command.h) * height);
    case "path":
      return polygonCoverage(
        width,
        height,
        command.points.flatMap((value, at) => (at % 2 === 0 ? [value * width] : [value * height])),
      );
    case "strokepath":
      return strokeCoverage(
        width,
        height,
        command.points.flatMap((value, at) => (at % 2 === 0 ? [value * width] : [value * height])),
        command.strokeWidth,
      );
    case "grainfield":
      return ellipseCoverage(width, height, command.x * width, command.y * height, Math.max(0.5, command.r), Math.max(0.5, command.r));
  }
}

/** the flat fill color of one command (gradient wash answers the midpoint). */
function commandColor(command: DrawCommand): RgbTriple {
  if (command.kind === "gradientwash") {
    const from = hexcolor(command.from);
    const to = hexcolor(command.to);
    return [
      Math.round((from[0] + to[0]) / 2),
      Math.round((from[1] + to[1]) / 2),
      Math.round((from[2] + to[2]) / 2),
    ];
  }
  if (command.kind === "strokepath") return hexcolor(command.stroke);
  return hexcolor(command.fill);
}

/** paints one coverage grid onto the target with source-over alpha blending. */
function paintCoverage(
  target: PixelImage,
  coverage: OpacityGrid,
  color: RgbTriple,
  opacity: number,
  offset: { dx: number; dy: number } = { dx: 0, dy: 0 },
): void {
  const { width, height, data } = target;
  for (let y = 0; y < height; y += 1) {
    const sy = y - offset.dy;
    if (sy < 0 || sy >= coverage.height) continue;
    for (let x = 0; x < width; x += 1) {
      const sx = x - offset.dx;
      if (sx < 0 || sx >= coverage.width) continue;
      const alpha = coverage.data[sy * coverage.width + sx] * opacity;
      if (alpha <= 0) continue;
      const at = (y * width + x) * 4;
      data[at] = Math.round(color[0] * alpha + data[at] * (1 - alpha));
      data[at + 1] = Math.round(color[1] * alpha + data[at + 1] * (1 - alpha));
      data[at + 2] = Math.round(color[2] * alpha + data[at + 2] * (1 - alpha));
      data[at + 3] = Math.round(255 * alpha + data[at + 3] * (1 - alpha));
    }
  }
}

/** paints one gradient wash (the per-pixel two-stop lerp along the angle). */
function paintGradientWash(
  target: PixelImage,
  command: Extract<DrawCommand, { kind: "gradientwash" }>,
  coverage: OpacityGrid,
  opacity: number,
): void {
  const { width, height, data } = target;
  const from = hexcolor(command.from);
  const to = hexcolor(command.to);
  const rad = (Number.isFinite(command.angle) ? command.angle : 0) * (Math.PI / 180);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const boxLeft = command.x * width;
  const boxTop = command.y * height;
  const boxWidth = command.w * width;
  const boxHeight = command.h * height;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = coverage.data[y * width + x] * opacity;
      if (alpha <= 0) continue;
      // the objectBoundingBox endpoints of the SVG serializer: t = 0.5 + (u-0.5)cos + (v-0.5)sin
      const u = boxWidth > 0 ? (x + 0.5 - boxLeft) / boxWidth : 0.5;
      const v = boxHeight > 0 ? (y + 0.5 - boxTop) / boxHeight : 0.5;
      const t = clamp01(0.5 + (u - 0.5) * cos + (v - 0.5) * sin);
      const at = (y * width + x) * 4;
      data[at] = Math.round((from[0] + (to[0] - from[0]) * t) * alpha + data[at] * (1 - alpha));
      data[at + 1] = Math.round((from[1] + (to[1] - from[1]) * t) * alpha + data[at + 1] * (1 - alpha));
      data[at + 2] = Math.round((from[2] + (to[2] - from[2]) * t) * alpha + data[at + 2] * (1 - alpha));
      data[at + 3] = Math.round(255 * alpha + data[at + 3] * (1 - alpha));
    }
  }
}

/** renders one command into a transparent full-canvas layer (the blur lane). */
function commandLayer(command: DrawCommand, coverage: OpacityGrid, width: number, height: number): PixelImage {
  const layer: PixelImage = { width, height, data: new Uint8ClampedArray(width * height * 4) };
  const opacity = clamp01(command.opacity);
  if (command.kind === "gradientwash") {
    paintGradientWash(layer, command, coverage, 1);
  } else {
    paintCoverage(layer, coverage, commandColor(command), opacity);
  }
  return layer;
}

/** composites one layer over the target with source-over alpha (per-pixel). */
function compositeLayer(target: PixelImage, layer: PixelImage, opacity: number): void {
  const { width, height, data } = target;
  for (let at = 0; at < data.length; at += 4) {
    const alpha = (layer.data[at + 3] / 255) * opacity;
    if (alpha <= 0) continue;
    data[at] = Math.round(layer.data[at] * alpha + data[at] * (1 - alpha));
    data[at + 1] = Math.round(layer.data[at + 1] * alpha + data[at + 1] * (1 - alpha));
    data[at + 2] = Math.round(layer.data[at + 2] * alpha + data[at + 2] * (1 - alpha));
    data[at + 3] = Math.round(255 * alpha + data[at + 3] * (1 - alpha));
  }
}

/**
 * rasterizeCommands — the DrawCommand rasterizer: the background fills
 * opaque, then every command paints in z order (stable — the array order
 * breaks ties), the shapes through their anti-aliased coverage, the blur
 * lane through a per-command layer and the pixel.ts box blur (a real blur,
 * the standard cheap kernel), and everything lands through source-over
 * alpha blending. The background (z <= Z_BACKGROUND) never paints twice.
 * Deterministic: the same frame answers the same pixels, always.
 *
 * @param frame the compiled render frame (imagerender's IR).
 * @returns the rasterized pixels.
 */
export function rasterizeCommands(frame: RenderFrame): PixelImage {
  const width = Math.max(1, Math.round(Number.isFinite(frame?.width) ? frame.width : 1));
  const height = Math.max(1, Math.round(Number.isFinite(frame?.height) ? frame.height : 1));
  const background = hexcolor(frame?.background, [0, 0, 0]);
  const target: PixelImage = { width, height, data: new Uint8ClampedArray(width * height * 4) };
  for (let at = 0; at < target.data.length; at += 4) {
    target.data[at] = background[0];
    target.data[at + 1] = background[1];
    target.data[at + 2] = background[2];
    target.data[at + 3] = 255;
  }
  const commands = (Array.isArray(frame?.commands) ? frame.commands : [])
    .map((command, index) => ({ command, index }))
    .sort((left, right) => left.command.z - right.command.z || left.index - right.index);
  for (const { command } of commands) {
    if (command.z <= Z_BACKGROUND) continue; // the background already painted
    const coverage = commandCoverage(command, width, height);
    const blur = Number.isFinite(command.blur) && command.blur > 0 ? Math.round(command.blur) : 0;
    if (blur > 0) {
      const layer = commandLayer(command, coverage, width, height);
      const blurred = boxblurimage(layer, blur) ?? layer;
      compositeLayer(target, blurred, clamp01(command.opacity));
      continue;
    }
    if (command.kind === "gradientwash") {
      paintGradientWash(target, command, coverage, clamp01(command.opacity));
      continue;
    }
    paintCoverage(target, coverage, commandColor(command), clamp01(command.opacity));
  }
  return target;
}

/** the camera of the 3D scene sampler — the versawase3d orbit contract. */
export interface SceneCamera {
  /** polar angle from +y in degrees (default 62 — the three-quarter view). */
  phiDegrees?: number;
  /** azimuth around +y in degrees (default -32). */
  thetaDegrees?: number;
  /** vertical field of view in degrees (default 50). */
  fovDegrees?: number;
  /** the camera distance (default: the fitCameraDistance framing). */
  distance?: number;
}

/** one projected vertex of the raster pipeline (screen x/y, view depth, color). */
interface ProjectedVertex {
  x: number;
  y: number;
  z: number; // the view-space depth (positive forward)
  r: number;
  g: number;
  b: number;
}

/**
 * rasterizeScene3d — the 3D scene sampler: mirrors the mesh into the y-up
 * space of the versawase3d contract (winding reversed with it), frames it
 * with the orbit camera (the fitCameraDistance default), projects through a
 * real perspective divide, culls back faces by the screen-space winding,
 * rasterizes with a z-buffer (pixel-center samples) and shades with
 * perspective-correct gouraud interpolation of the vertex colors. The
 * answer is a transparent layer (alpha 255 only where geometry lands) so
 * the compositor can blend it over any track below.
 *
 * @param mesh the mesh geometry (image-space vertices: x right, y down, z height).
 * @param colors rgb vertex colors 0-1 (3 per vertex, or null for the flat gray).
 * @param camera the orbit camera.
 * @param size the output size.
 * @returns the rasterized transparent layer.
 */
export function rasterizeScene3d(
  mesh: MeshGeometry,
  colors: Float32Array | null,
  camera: SceneCamera,
  size: { width: number; height: number },
): PixelImage {
  const width = Math.max(1, Math.round(size.width));
  const height = Math.max(1, Math.round(size.height));
  const layer: PixelImage = { width, height, data: new Uint8ClampedArray(width * height * 4) };
  const vertices = mesh?.vertices;
  const indices = mesh?.indices;
  if (!vertices || !indices || vertices.length < 9 || indices.length < 3) return layer;
  // the mirror: image y grows down, the camera space grows up (the winding follows)
  const count = vertices.length / 3;
  const positions = new Float64Array(count * 3);
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  for (let at = 0; at < count; at += 1) {
    const x = vertices[at * 3];
    const y = -vertices[at * 3 + 1];
    const z = vertices[at * 3 + 2];
    positions[at * 3] = x;
    positions[at * 3 + 1] = y;
    positions[at * 3 + 2] = z;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }
  // center the model at the origin (the orbit contract aims at the center)
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;
  for (let at = 0; at < count * 3; at += 3) {
    positions[at] -= cx;
    positions[at + 1] -= cy;
    positions[at + 2] -= cz;
  }
  const phi = ((camera.phiDegrees ?? 62) * Math.PI) / 180;
  const theta = ((camera.thetaDegrees ?? -32) * Math.PI) / 180;
  const fov = ((camera.fovDegrees ?? 50) * Math.PI) / 180;
  const size3: [number, number, number] = [maxX - minX, maxY - minY, maxZ - minZ];
  const distance = camera.distance ?? fitCameraDistance(size3, (camera.fovDegrees ?? 50));
  // the eye on the orbit sphere, looking at the origin, +y up
  const eyeX = distance * Math.sin(phi) * Math.sin(theta);
  const eyeY = distance * Math.cos(phi);
  const eyeZ = distance * Math.sin(phi) * Math.cos(theta);
  let fx = -eyeX;
  let fy = -eyeY;
  let fz = -eyeZ;
  const forwardLength = Math.hypot(fx, fy, fz) || 1;
  fx /= forwardLength;
  fy /= forwardLength;
  fz /= forwardLength;
  // right = normalize(forward x up), up' = right x forward
  let rx = fy * 0 - fz * 1;
  let ry = fz * 0 - fx * 0;
  let rz = fx * 1 - fy * 0;
  const rightLength = Math.hypot(rx, ry, rz) || 1;
  rx /= rightLength;
  ry /= rightLength;
  rz /= rightLength;
  const ux = ry * fz - rz * fy;
  const uy = rz * fx - rx * fz;
  const uz = rx * fy - ry * fx;
  const scale = (height / 2) / Math.tan(fov / 2);
  const near = 0.01;
  const projected: ProjectedVertex[] = new Array(count);
  for (let at = 0; at < count; at += 1) {
    const px = positions[at * 3] - eyeX;
    const py = positions[at * 3 + 1] - eyeY;
    const pz = positions[at * 3 + 2] - eyeZ;
    const vx = px * rx + py * ry + pz * rz;
    const vy = px * ux + py * uy + pz * uz;
    const vz = px * fx + py * fy + pz * fz;
    const colorAt = at * 3;
    projected[at] = {
      x: width / 2 + (vz > near ? (vx * scale) / vz : Number.NaN),
      y: height / 2 - (vz > near ? (vy * scale) / vz : Number.NaN),
      z: vz,
      r: colors ? colors[colorAt] : 0.5,
      g: colors ? colors[colorAt + 1] : 0.5,
      b: colors ? colors[colorAt + 2] : 0.5,
    };
  }
  // the z-buffer: pixel-center rasterization over the screen bounding box
  const depth = new Float64Array(width * height).fill(Number.POSITIVE_INFINITY);
  for (let face = 0; face + 2 < indices.length; face += 3) {
    const a = projected[indices[face]];
    const b = projected[indices[face + 1]];
    const c = projected[indices[face + 2]];
    if (!a || !b || !c) continue;
    if (!(a.z > near && b.z > near && c.z > near)) continue;
    // the mirrored winding culls the back faces toward the camera
    const winding = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    if (winding <= 0) continue;
    const left = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)));
    const right = Math.min(width, Math.ceil(Math.max(a.x, b.x, c.x)));
    const top = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)));
    const bottom = Math.min(height, Math.ceil(Math.max(a.y, b.y, c.y)));
    for (let y = top; y < bottom; y += 1) {
      for (let x = left; x < right; x += 1) {
        const px = x + 0.5;
        const py = y + 0.5;
        const denominator = winding;
        if (denominator === 0) continue;
        const w0 = ((b.x - a.x) * (py - a.y) - (b.y - a.y) * (px - a.x)) / denominator;
        const w1 = ((c.x - b.x) * (py - b.y) - (c.y - b.y) * (px - b.x)) / denominator;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        // perspective-correct: interpolate 1/z and the color/z pairs
        const zView = 1 / (w0 / a.z + w1 / b.z + w2 / c.z);
        const at = y * width + x;
        if (zView >= depth[at]) continue;
        depth[at] = zView;
        const r = (w0 * (a.r / a.z) + w1 * (b.r / b.z) + w2 * (c.r / c.z)) * zView;
        const g = (w0 * (a.g / a.z) + w1 * (b.g / b.z) + w2 * (c.g / c.z)) * zView;
        const b2 = (w0 * (a.b / a.z) + w1 * (b.b / b.z) + w2 * (c.b / c.z)) * zView;
        const pixel = at * 4;
        layer.data[pixel] = Math.round(clamp01(r) * 255);
        layer.data[pixel + 1] = Math.round(clamp01(g) * 255);
        layer.data[pixel + 2] = Math.round(clamp01(b2) * 255);
        layer.data[pixel + 3] = 255;
      }
    }
  }
  return layer;
}
