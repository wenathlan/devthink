// # versawase — the image, video, animation and 3D engine of the family, housed
// at the cadria root and consolidated as ONE keyword file of the versawase
// domain (the edgelandes law of the root: one keyword file per domain —
// the purest fold candidate the family carries). The former eight arms
// folded here verbatim, in pipeline order:
//   Section 1: versawasegen.ts         — the procedural mesh generator (uv
//                                         sphere, torus, noise terrain,
//                                         extrusion, the twist/belly/subdivide
//                                         modifier stack, the honest audit).
//   Section 2: versawaseshaders.ts     — the GLSL material catalog and the
//                                         source validator of the 3d material
//                                         lane (2 vertex stages, 6 materials).
//   Section 3: versawaserender.ts      — the WebGL2 pass runtime (fullscreen
//                                         triangle, ping-pong framebuffers,
//                                         the readPixels readback).
//   Section 4: versawase3d.ts          — the three.js viewport runtime (the
//                                         mesh conversion, the hand-rolled
//                                         orbit, the honest mount).
//   Section 5: versawaseanimate.ts     — the animation sampler (per-node
//                                         snapshots over the Scene3d contract).
//   Section 6: versawaseslices.ts      — the sliced-render planner (the
//                                         F-CAD-027 doctrine).
//   Section 7: versawasescheduler.ts   — the render-job scheduler (the
//                                         multi-slot plan, the pure status
//                                         transitions).
//   Section 8: versawasecomposition.ts — the composition document (tracks,
//                                         clips, the effect stack, the
//                                         gl-transitions catalog, the json
//                                         round trip, the Saddle slice plan).
// Every export of every source file is preserved verbatim — zero logic
// changes, every specifier rides intact. The consolidation notes (the only
// edits the merge made): the intra-family imports dissolved into the single
// module scope — versawaseanimate and versawasescheduler composed on
// trackValueAt, sceneDuration and renderJobFrames of the first seat below,
// and versawasecomposition composed on planSlices and RenderSlice of the
// slices section (the sections ride pipeline order, so every dissolved
// reference is already declared when its consumer composes); the shared
// cross-domain imports (node:crypto of composition+shaders, three of the
// viewport, shadercomp of composition+shaders+render, timeticks of slices,
// visualize of viewport+render) declare once at the top; the published
// ./versawase3d, ./versawaseanimate, ./versawasecomposition, ./versawasegen,
// ./versawaserender, ./versawasescheduler, ./versawaseshaders and
// ./versawaseslices specifiers keep resolving through the package exports
// map — they point at this seat now, the way the edgelandes fold kept every
// retired specifier live.
//
// Library-grade module shipped inside the published packages (npm, maven with the Spring
// Boot rider): it owns the domain types and pure, generic helpers only — zero consumer
// data. The content tables of this site live in the db layer (seed.ts + db.ts) and reach
// the Sol pages through the catalog accessor over HTTPS; a page never hardcodes a row.
// The family renders through this engine: stealthhead (the fps platform) depends on the
// published @wenathlan/cadria library for every 3D, animation and render concern and
// carries only its storage and pre-compilation surface.

import { createHash } from "node:crypto";
import * as THREE from "three";
import { compileEffectProgram, type EffectProgram, SHADER_EFFECTS, type ShaderEffectId } from "./shadercomp.ts";
import { type FrameRate, frameratefromf64, frameat, tickofframe, ticksfromseconds } from "./timeticks.ts";
import type { ImageInput, MeshGeometry } from "./visualize.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* versawase.ts — the engine domain contract (the first seat). */
/* ════════════════════════════════════════════════════════════════════ */

/** Badge tone used across the family cards and chips. */
export type BadgeTone = "default" | "success" | "error" | "warning" | "info";

/** One row of the player formats table. */
export interface PlayerFormat {
  format: string;
  media: string;
  engine: string;
  tone: BadgeTone;
  status: string;
  /** the handled extensions this format answers for */
  extensions: readonly string[];
}

/** One creative anchor docked around the studio shell. */
export interface CreativeAnchor {
  id: string;
  title: string;
  detail: string;
}

export type GalleryDiscipline = "video" | "image" | "3d";

/** One project card of the gallery. */
export interface GalleryProject {
  title: string;
  detail: string;
  discipline: GalleryDiscipline;
  format: string;
  tone: BadgeTone;
  /** index of the pure-css artwork header (1..6) */
  art: number;
}

/** A structured card rendered from the db layer (home seats). */
export interface FeatureCard {
  group: string;
  title: string;
  detail: string;
}

/** A small tone-coded chip (hero badges). */
export interface SignalBadge {
  group: string;
  label: string;
  tone: BadgeTone;
  dot?: boolean;
}

/** One option of the settings and filter selects. */
export interface OptionChoice {
  group: string;
  value: string;
  label: string;
  selected?: boolean;
}

/** Configuration of the player demo timeline (engine defaults, page overridable). */
export interface PlayerDemoConfig {
  durationSeconds: number;
  startSeconds: number;
  volumePercent: number;
}

/** Resolves the player demo configuration with engine defaults. */
export function playerDemo(config: Partial<PlayerDemoConfig> = {}): PlayerDemoConfig {
  return { durationSeconds: 161, startSeconds: 67, volumePercent: 80, ...config };
}

/** Resolves the css class suffix of a badge tone (empty for the default tone). */
export function toneClass(tone: BadgeTone): string {
  return tone === "default" ? "" : ` ${tone}`;
}

/** Formats a seconds count as a mm:ss timecode. */
export function formatTimecode(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
  const seconds = String(safe % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

/** Finds the player format that answers for a file extension (".mp4" style). */
export function formatByExtension(formats: readonly PlayerFormat[], extension: string): PlayerFormat | undefined {
  const wanted = extension.toLowerCase();
  return formats.find((format) => format.extensions.some((item) => item.toLowerCase() === wanted));
}

/** Finds a creative anchor by its id. */
export function anchorById(anchors: readonly CreativeAnchor[], id: string): CreativeAnchor | undefined {
  return anchors.find((anchor) => anchor.id === id);
}

/** Filters the gallery projects by discipline ("all" keeps every row). */
export function projectsByDiscipline(
  projects: readonly GalleryProject[],
  discipline: GalleryDiscipline | "all",
): readonly GalleryProject[] {
  if (discipline === "all") return projects;
  return projects.filter((project) => project.discipline === discipline);
}

// ---------------------------------------------------------------------------
// 3D, animation and render surface — the Blender/After Effects/Remotion side of
// the engine. Library-grade: every consumer (cadria pages, stealthhead, external
// packages) brings its own data and configures the pipeline through these types.
// ---------------------------------------------------------------------------

/** A scene-graph node of a 3D world (mesh, light, camera or group). */
export interface SceneNode {
  id: string;
  kind: "mesh" | "light" | "camera" | "group";
  name: string;
  /** parent node id (empty for roots) */
  parent: string;
}

/** One animation channel over time: keys are seconds, values are normalized. */
export interface AnimationTrack {
  id: string;
  target: string;
  channel: "position" | "rotation" | "scale" | "opacity" | "morph";
  /** sorted key times in seconds */
  keys: readonly number[];
  /** parallel key values (same length as keys) */
  values: readonly number[];
  loop: boolean;
}

/** A renderable 3D scene with its animation set. */
export interface Scene3d {
  id: string;
  name: string;
  nodes: readonly SceneNode[];
  tracks: readonly AnimationTrack[];
  /** engine frame rate the tracks were authored against */
  fps: number;
}

/** A render job the pipeline schedules (image, video or 3D frame range). */
export interface RenderJob {
  id: string;
  kind: GalleryDiscipline;
  sceneId?: string;
  /** inclusive frame range for 3D jobs */
  frameFrom?: number;
  frameTo?: number;
  status: "queued" | "rendering" | "ready" | "failed";
  tone?: BadgeTone;
}

/** A precompiled shader program: shaders ship compiled so no visitor machine ever compiles. */
export interface PrecompiledShader {
  id: string;
  stage: "vertex" | "fragment" | "compute";
  /** compiled artifact reference inside the LFS/DB storage layer */
  artifact: string;
  sha256: string;
}

/** Linear interpolation of one animation track value at a given second. */
export function trackValueAt(track: AnimationTrack, seconds: number): number {
  const { keys, values } = track;
  if (keys.length === 0) return 0;
  if (seconds <= keys[0]) return values[0];
  const last = keys.length - 1;
  if (seconds >= keys[last]) return track.loop ? values[0] : values[last];
  for (let index = 0; index < last; index += 1) {
    if (seconds >= keys[index] && seconds <= keys[index + 1]) {
      const span = keys[index + 1] - keys[index] || 1;
      const ratio = (seconds - keys[index]) / span;
      return values[index] + (values[index + 1] - values[index]) * ratio;
    }
  }
  return values[last];
}

/** Total animation duration of a scene (the largest key across its tracks). */
export function sceneDuration(scene: Scene3d): number {
  return scene.tracks.reduce(
    (max, track) => Math.max(max, track.keys.length ? track.keys[track.keys.length - 1] : 0),
    0,
  );
}

/** Frame count a 3D render job produces (fps-normalized, inclusive range). */
export function renderJobFrames(job: RenderJob, fps: number): number {
  if (job.kind !== "3d" || job.frameFrom === undefined || job.frameTo === undefined) return 1;
  const seconds = Math.max(0, job.frameTo - job.frameFrom);
  return Math.max(1, Math.ceil(seconds * (fps > 0 ? fps : 30)));
}

/** Verifies a precompiled shader manifest row: every stage keeps an artifact reference and a sha-256 hash. */
export function shaderManifestComplete(shaders: readonly PrecompiledShader[]): boolean {
  return (
    shaders.length > 0 && shaders.every((shader) => shader.artifact.length > 0 && /^[0-9a-f]{64}$/.test(shader.sha256))
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: versawasegen.ts — the procedural mesh generator. */
/* ════════════════════════════════════════════════════════════════════ */

/**
 * versawasegen — the procedural mesh generator of the versawase engine:
 * pure TypeScript functions that build real geometry — uv sphere, torus,
 * noise terrain and polygon extrusion — answering the {positions, normals,
 * uvs, indices} buffer set every consumer of the family 3d lane speaks.
 * The primitives carry the modifier stack the engine doctrine records
 * (twist, belly, subdivision) as pure whole-mesh transforms, and every
 * generator composes on one honest audit (validateMesh) instead of hoping
 * the buffers are well formed. Zero dependencies, zero DOM, zero GL: the
 * same calls run in node (the tests), in the browser viewport
 * (versawase3d mounts the buffers) and inside a Saddle render lane
 * (software rasterization never touches the visitor GPU). Coordinates are
 * y-up to match the three.js space the 3d viewport mounts; winding is
 * counter-clockwise seen from outside, so front faces point away from the
 * solid. The noise floor is a deterministic integer-hash value noise with
 * quintic fade and fractal octaves — the terrain height is real
 * mathematics, never a canned table.
 */

/** one 2d point of an extrusion profile. */
export interface Vec2 {
  x: number;
  y: number;
}

/** the generated buffer set every primitive answers. */
export interface GeneratedMesh {
  /** xyz per vertex, 3 floats each, y-up. */
  positions: Float32Array;
  /** unit xyz normals, 3 floats per vertex, parallel to positions. */
  normals: Float32Array;
  /** uv pairs, 2 floats per vertex. */
  uvs: Float32Array;
  /** triangle indices, 3 per face, counter-clockwise from outside. */
  indices: Uint32Array;
  /** element counts of the mesh. */
  counts: { vertices: number; triangles: number };
}

/** honest structural audit of a mesh buffer set — never a hope. */
export interface MeshValidation {
  ok: boolean;
  /** every broken invariant, empty when ok (one code per finding). */
  issues: { code: string; message: string }[];
  /** element counts the audit observed (zeros when the buffers are unusable). */
  counts: { vertices: number; triangles: number };
}

/** raised by the generators and modifiers for invalid input or options. */
export class MeshGenError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "MeshGenError";
  }
}

// ---------------------------------------------------------------------------
// the deterministic noise floor — integer hash → value noise → fractal sum
// ---------------------------------------------------------------------------

/** deterministic 0..1 hash of one integer lattice cell and a seed. */
export function hashNoise2(ix: number, iy: number, seed: number): number {
  let h = Math.imul(ix | 0, 0x27d4eb2d) ^ Math.imul(iy | 0, 0x165667b1) ^ Math.imul(seed | 0, 0x9e3779b9);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** the quintic fade of one fractional coordinate (c2-continuous, perlin grade). */
function fade(fraction: number): number {
  return fraction * fraction * fraction * (fraction * (fraction * 6 - 15) + 10);
}

/** value noise over the lattice: bilinear blend of the four corner hashes. */
export function valueNoise2(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = fade(x - ix);
  const fy = fade(y - iy);
  const corner00 = hashNoise2(ix, iy, seed);
  const corner10 = hashNoise2(ix + 1, iy, seed);
  const corner01 = hashNoise2(ix, iy + 1, seed);
  const corner11 = hashNoise2(ix + 1, iy + 1, seed);
  const alongX0 = corner00 + (corner10 - corner00) * fx;
  const alongX1 = corner01 + (corner11 - corner01) * fx;
  return alongX0 + (alongX1 - alongX0) * fy;
}

/** the fractal options of the terrain height field. */
export interface FbmOptions {
  /** octave count of the fractal sum (default 4, clamped 1..8). */
  octaves?: number;
  /** the deterministic seed (default 0). */
  seed?: number;
  /** amplitude decay per octave (default 0.5, kept inside 0..1). */
  gain?: number;
  /** frequency doubling per octave (default 2, kept > 1). */
  lacunarity?: number;
}

/** fractal brownian motion of the value noise, normalized 0..1. */
export function fbmNoise2(x: number, y: number, options: FbmOptions = {}): number {
  const octaves = Math.min(8, Math.max(1, Math.round(options.octaves ?? 4)));
  const gain = Math.min(1, Math.max(0, options.gain ?? 0.5));
  const lacunarity = Math.max(1.000001, options.lacunarity ?? 2);
  const seed = options.seed ?? 0;
  let amplitude = 1;
  let frequency = 1;
  let total = 0;
  let norm = 0;
  for (let octave = 0; octave < octaves; octave += 1) {
    total += amplitude * valueNoise2(x * frequency + octave * 19.73, y * frequency - octave * 7.31, seed + octave);
    norm += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return norm > 0 ? total / norm : 0;
}

// ---------------------------------------------------------------------------
// shared mesh math — normal averaging and the structural audit
// ---------------------------------------------------------------------------

/**
 * Per-vertex normals as the normalized average of the unit normals of the
 * adjacent faces (the visualizenormals flavor re-derived for the procedural
 * buffer shape — that module owns the image-mesh flavor). Isolated vertices
 * fall back to [0, 0, 1].
 */
export function averageNormals(positions: Float32Array, indices: Uint32Array): Float32Array {
  const normals = new Float32Array(positions.length);
  for (let face = 0; face + 2 < indices.length; face += 3) {
    const a = indices[face] * 3;
    const b = indices[face + 1] * 3;
    const c = indices[face + 2] * 3;
    const ux = positions[b] - positions[a];
    const uy = positions[b + 1] - positions[a + 1];
    const uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a];
    const vy = positions[c + 1] - positions[a + 1];
    const vz = positions[c + 2] - positions[a + 2];
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const length = Math.hypot(nx, ny, nz);
    if (length < 1e-12) continue;
    for (const offset of [a, b, c]) {
      normals[offset] += nx / length;
      normals[offset + 1] += ny / length;
      normals[offset + 2] += nz / length;
    }
  }
  for (let offset = 0; offset < normals.length; offset += 3) {
    const length = Math.hypot(normals[offset], normals[offset + 1], normals[offset + 2]);
    if (length < 1e-12) {
      normals[offset] = 0;
      normals[offset + 1] = 0;
      normals[offset + 2] = 1;
    } else {
      normals[offset] /= length;
      normals[offset + 1] /= length;
      normals[offset + 2] /= length;
    }
  }
  return normals;
}

/** audits one buffer set: alignments, index bounds, unit normals, finiteness. */
export function validateMesh(mesh: GeneratedMesh): MeshValidation {
  const issues: { code: string; message: string }[] = [];
  const vertices = Math.floor(mesh.positions.length / 3);
  const triangles = Math.floor(mesh.indices.length / 3);
  if (mesh.positions.length === 0 || mesh.positions.length % 3 !== 0)
    issues.push({ code: "positions-shape", message: "positions must be a non-empty multiple of 3 floats" });
  if (mesh.indices.length % 3 !== 0)
    issues.push({ code: "indices-shape", message: "indices must be a multiple of 3" });
  if (mesh.normals.length !== mesh.positions.length)
    issues.push({ code: "normals-shape", message: "normals must parallel positions (3 floats per vertex)" });
  if (mesh.uvs.length !== (mesh.positions.length / 3) * 2)
    issues.push({ code: "uvs-shape", message: "uvs must carry 2 floats per vertex" });
  if (issues.length > 0) return { ok: false, issues, counts: { vertices, triangles } };
  for (let face = 0; face < mesh.indices.length; face += 1) {
    if (mesh.indices[face] >= vertices) {
      issues.push({ code: "index-out-of-bounds", message: `index ${mesh.indices[face]} at slot ${face} exceeds ${vertices - 1}` });
      break;
    }
  }
  let unitFailure = 0;
  let finiteFailure = false;
  for (let offset = 0; offset < mesh.positions.length; offset += 3) {
    if (!Number.isFinite(mesh.positions[offset]) || !Number.isFinite(mesh.normals[offset])) {
      finiteFailure = true;
      break;
    }
    const length = Math.hypot(mesh.normals[offset], mesh.normals[offset + 1], mesh.normals[offset + 2]);
    if (Math.abs(length - 1) > 1e-3) unitFailure += 1;
  }
  if (finiteFailure) issues.push({ code: "not-finite", message: "positions and normals must be finite everywhere" });
  if (unitFailure > 0)
    issues.push({ code: "normals-not-unit", message: `${unitFailure} vertex normals are not unit length` });
  for (let slot = 0; slot < mesh.uvs.length; slot += 1) {
    if (!Number.isFinite(mesh.uvs[slot])) {
      issues.push({ code: "uvs-not-finite", message: "uvs must be finite everywhere" });
      break;
    }
  }
  if (triangles === 0) issues.push({ code: "no-triangles", message: "the mesh carries no triangle" });
  return { ok: issues.length === 0, issues, counts: { vertices, triangles } };
}

// ---------------------------------------------------------------------------
// primitive: uv sphere
// ---------------------------------------------------------------------------

/** the uv sphere options; every field carries an engine default. */
export interface SphereOptions {
  /** radius in scene units (default 1, kept > 0). */
  radius?: number;
  /** latitude subdivisions — vertex rows minus one (default 16, kept >= 2). */
  rings?: number;
  /** longitude subdivisions — vertex columns minus one (default 24, kept >= 3). */
  segments?: number;
}

/**
 * The uv sphere: rings x segments quads wrapped over the latitude/longitude
 * grid, seam column duplicated so the uv wrap stays continuous, analytic
 * normals (the normalized position — exact for a sphere) and pole rows that
 * emit only their non-degenerate triangles. Vertex count (rings + 1) *
 * (segments + 1), triangle count 2 * segments * (rings - 1).
 */
export function generateSphere(options: SphereOptions = {}): GeneratedMesh {
  const radius = options.radius ?? 1;
  const rings = Math.max(2, Math.round(options.rings ?? 16));
  const segments = Math.max(3, Math.round(options.segments ?? 24));
  if (!(radius > 0)) throw new MeshGenError(`versawasegen: sphere radius must be > 0, got ${radius}`);
  const rows = rings + 1;
  const columns = segments + 1;
  const positions = new Float32Array(rows * columns * 3);
  const normals = new Float32Array(rows * columns * 3);
  const uvs = new Float32Array(rows * columns * 2);
  for (let row = 0; row < rows; row += 1) {
    const phi = (Math.PI * row) / rings;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    for (let column = 0; column < columns; column += 1) {
      const theta = (2 * Math.PI * column) / segments;
      const vertex = (row * columns + column) * 3;
      const x = sinPhi * Math.cos(theta);
      const y = cosPhi;
      const z = sinPhi * Math.sin(theta);
      positions[vertex] = x * radius;
      positions[vertex + 1] = y * radius;
      positions[vertex + 2] = z * radius;
      normals[vertex] = x;
      normals[vertex + 1] = y;
      normals[vertex + 2] = z;
      const uv = (row * columns + column) * 2;
      uvs[uv] = column / segments;
      uvs[uv + 1] = row / rings;
    }
  }
  const indices = new Uint32Array(segments * (rings - 1) * 2 * 3);
  let face = 0;
  for (let row = 0; row + 1 < rows; row += 1) {
    for (let column = 0; column < segments; column += 1) {
      const a = row * columns + column;
      const b = (row + 1) * columns + column;
      const c = (row + 1) * columns + column + 1;
      const d = a + 1;
      const topRow = row === 0;
      const bottomRow = row + 2 === rows;
      if (!bottomRow) {
        indices[face++] = a;
        indices[face++] = c;
        indices[face++] = b;
      }
      if (!topRow) {
        indices[face++] = a;
        indices[face++] = d;
        indices[face++] = c;
      }
    }
  }
  return {
    positions,
    normals,
    uvs,
    indices,
    counts: { vertices: positions.length / 3, triangles: indices.length / 3 },
  };
}

// ---------------------------------------------------------------------------
// primitive: torus
// ---------------------------------------------------------------------------

/** the torus options; every field carries an engine default. */
export interface TorusOptions {
  /** distance from the center to the tube centerline (default 1, kept > 0). */
  majorRadius?: number;
  /** tube thickness (default 0.35, kept > 0 and < majorRadius). */
  minorRadius?: number;
  /** subdivisions around the centerline (default 32, kept >= 3). */
  majorSegments?: number;
  /** subdivisions around the tube (default 16, kept >= 3). */
  minorSegments?: number;
}

/**
 * The torus: (majorSegments + 1) x (minorSegments + 1) grid wrapped around
 * the tube, seam rows and columns duplicated for the uv wrap, analytic
 * normals (the derivative-normalized surface normal — exact) and two
 * counter-clockwise triangles per quad. Vertex count (majorSegments + 1) *
 * (minorSegments + 1), triangle count 2 * majorSegments * minorSegments.
 */
export function generateTorus(options: TorusOptions = {}): GeneratedMesh {
  const majorRadius = options.majorRadius ?? 1;
  const minorRadius = options.minorRadius ?? 0.35;
  const majorSegments = Math.max(3, Math.round(options.majorSegments ?? 32));
  const minorSegments = Math.max(3, Math.round(options.minorSegments ?? 16));
  if (!(majorRadius > 0)) throw new MeshGenError(`versawasegen: torus majorRadius must be > 0, got ${majorRadius}`);
  if (!(minorRadius > 0) || minorRadius >= majorRadius)
    throw new MeshGenError(`versawasegen: torus minorRadius must be > 0 and < ${majorRadius}, got ${minorRadius}`);
  const rows = majorSegments + 1;
  const columns = minorSegments + 1;
  const positions = new Float32Array(rows * columns * 3);
  const normals = new Float32Array(rows * columns * 3);
  const uvs = new Float32Array(rows * columns * 2);
  for (let row = 0; row < rows; row += 1) {
    const u = (2 * Math.PI * row) / majorSegments;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);
    for (let column = 0; column < columns; column += 1) {
      const v = (2 * Math.PI * column) / minorSegments;
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);
      const vertex = (row * columns + column) * 3;
      positions[vertex] = (majorRadius + minorRadius * cosV) * cosU;
      positions[vertex + 1] = minorRadius * sinV;
      positions[vertex + 2] = (majorRadius + minorRadius * cosV) * sinU;
      normals[vertex] = cosV * cosU;
      normals[vertex + 1] = sinV;
      normals[vertex + 2] = cosV * sinU;
      const uv = (row * columns + column) * 2;
      uvs[uv] = row / majorSegments;
      uvs[uv + 1] = column / minorSegments;
    }
  }
  const indices = new Uint32Array(majorSegments * minorSegments * 6);
  let face = 0;
  for (let row = 0; row < majorSegments; row += 1) {
    for (let column = 0; column < minorSegments; column += 1) {
      const a = row * columns + column;
      const b = (row + 1) * columns + column;
      const c = (row + 1) * columns + column + 1;
      const d = a + 1;
      indices[face++] = a;
      indices[face++] = c;
      indices[face++] = b;
      indices[face++] = a;
      indices[face++] = d;
      indices[face++] = c;
    }
  }
  return {
    positions,
    normals,
    uvs,
    indices,
    counts: { vertices: positions.length / 3, triangles: indices.length / 3 },
  };
}

// ---------------------------------------------------------------------------
// primitive: noise terrain
// ---------------------------------------------------------------------------

/** the terrain options; every field carries an engine default. */
export interface TerrainOptions {
  /** world size along x (default 2, kept > 0). */
  sizeX?: number;
  /** world size along z (default 2, kept > 0). */
  sizeZ?: number;
  /** height amplitude — the field spans -amplitude..+amplitude (default 0.5, kept > 0). */
  amplitude?: number;
  /** base noise frequency before the fractal doubling (default 1.5, kept > 0). */
  frequency?: number;
  /** the fractal options of the height field (octaves, seed, gain, lacunarity). */
  fbm?: FbmOptions;
  /** grid columns minus one along x (default 48, kept >= 1). */
  segmentsX?: number;
  /** grid rows minus one along z (default 48, kept >= 1). */
  segmentsZ?: number;
}

/** the terrain height field: centered fractal noise, total over the whole plane. */
function terrainHeight(x: number, z: number, options: Required<Pick<TerrainOptions, "amplitude" | "frequency">> & { fbm: FbmOptions }): number {
  return (fbmNoise2(x * options.frequency, z * options.frequency, options.fbm) - 0.5) * 2 * options.amplitude;
}

/**
 * The noise terrain: (segmentsX + 1) x (segmentsZ + 1) heightfield grid over
 * the xz plane, heights from the centered fractal value noise (deterministic
 * over the seed), normals from the central differences of the height field
 * (exact for the sampled surface) and two counter-clockwise triangles per
 * cell facing +y.
 */
export function generateTerrain(options: TerrainOptions = {}): GeneratedMesh {
  const sizeX = options.sizeX ?? 2;
  const sizeZ = options.sizeZ ?? 2;
  const amplitude = options.amplitude ?? 0.5;
  const frequency = options.frequency ?? 1.5;
  const segmentsX = Math.max(1, Math.round(options.segmentsX ?? 48));
  const segmentsZ = Math.max(1, Math.round(options.segmentsZ ?? 48));
  if (!(sizeX > 0) || !(sizeZ > 0))
    throw new MeshGenError(`versawasegen: terrain size must be > 0, got ${sizeX}x${sizeZ}`);
  if (!(amplitude > 0)) throw new MeshGenError(`versawasegen: terrain amplitude must be > 0, got ${amplitude}`);
  if (!(frequency > 0)) throw new MeshGenError(`versawasegen: terrain frequency must be > 0, got ${frequency}`);
  const field = { amplitude, frequency, fbm: options.fbm ?? {} };
  const columns = segmentsX + 1;
  const rows = segmentsZ + 1;
  const positions = new Float32Array(columns * rows * 3);
  const normals = new Float32Array(columns * rows * 3);
  const uvs = new Float32Array(columns * rows * 2);
  const cellX = sizeX / segmentsX;
  const cellZ = sizeZ / segmentsZ;
  for (let row = 0; row < rows; row += 1) {
    const z = -sizeZ / 2 + row * cellZ;
    for (let column = 0; column < columns; column += 1) {
      const x = -sizeX / 2 + column * cellX;
      const vertex = (row * columns + column) * 3;
      positions[vertex] = x;
      positions[vertex + 1] = terrainHeight(x, z, field);
      positions[vertex + 2] = z;
      const dhdx = (terrainHeight(x + cellX, z, field) - terrainHeight(x - cellX, z, field)) / (2 * cellX);
      const dhdz = (terrainHeight(x, z + cellZ, field) - terrainHeight(x, z - cellZ, field)) / (2 * cellZ);
      const length = Math.hypot(dhdx, 1, dhdz);
      normals[vertex] = -dhdx / length;
      normals[vertex + 1] = 1 / length;
      normals[vertex + 2] = -dhdz / length;
      const uv = (row * columns + column) * 2;
      uvs[uv] = column / segmentsX;
      uvs[uv + 1] = row / segmentsZ;
    }
  }
  const indices = new Uint32Array(segmentsX * segmentsZ * 6);
  let face = 0;
  for (let row = 0; row < segmentsZ; row += 1) {
    for (let column = 0; column < segmentsX; column += 1) {
      const a = row * columns + column;
      const b = (row + 1) * columns + column;
      const c = (row + 1) * columns + column + 1;
      const d = a + 1;
      // b advances +z, d advances +x: (a,b,c) and (a,c,d) face +y
      indices[face++] = a;
      indices[face++] = b;
      indices[face++] = c;
      indices[face++] = a;
      indices[face++] = c;
      indices[face++] = d;
    }
  }
  return {
    positions,
    normals,
    uvs,
    indices,
    counts: { vertices: positions.length / 3, triangles: indices.length / 3 },
  };
}

// ---------------------------------------------------------------------------
// primitive: polygon extrusion
// ---------------------------------------------------------------------------

/** the extrusion options; every field carries an engine default. */
export interface ExtrusionOptions {
  /** extrusion start along +z (default 0). */
  zFrom?: number;
  /** extrusion end along +z (default 1, must be > zFrom). */
  zTo?: number;
}

/** signed area of the polygon (positive when the ring runs counter-clockwise). */
function signedArea(profile: readonly Vec2[]): number {
  let area = 0;
  for (let index = 0; index < profile.length; index += 1) {
    const current = profile[index];
    const next = profile[(index + 1) % profile.length];
    area += current.x * next.y - next.x * current.y;
  }
  return area / 2;
}

/** the z of the 2d cross product of vectors oa and ob. */
function cross2(o: Vec2, a: Vec2, b: Vec2): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/** whether one point sits inside (or on the border of) a triangle, epsilon-honest. */
function pointInTriangle(point: Vec2, a: Vec2, b: Vec2, c: Vec2): boolean {
  const d1 = cross2(a, b, point);
  const d2 = cross2(b, c, point);
  const d3 = cross2(c, a, point);
  const hasNegative = d1 < -1e-12 || d2 < -1e-12 || d3 < -1e-12;
  const hasPositive = d1 > 1e-12 || d2 > 1e-12 || d3 > 1e-12;
  return !(hasNegative && hasPositive);
}

/**
 * Ear-clipping triangulation of a counter-clockwise polygon: one ear (a
 * convex vertex whose triangle holds no other point) is clipped per step.
 * Answers the triangle list, or null when the ring is degenerate.
 */
function triangulatePolygon(profile: readonly Vec2[]): number[] | null {
  const count = profile.length;
  if (count < 3) return null;
  const ring = profile.map((_, index) => index);
  const triangles: number[] = [];
  let guard = 0;
  while (ring.length > 3 && guard++ < count * count) {
    let clipped = false;
    for (let at = 0; at < ring.length && !clipped; at += 1) {
      const previous = ring[(at + ring.length - 1) % ring.length];
      const current = ring[at];
      const next = ring[(at + 1) % ring.length];
      const a = profile[previous];
      const b = profile[current];
      const c = profile[next];
      const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      if (cross <= 1e-12) continue;
      let empty = true;
      for (const other of ring) {
        if (other === previous || other === current || other === next) continue;
        if (pointInTriangle(profile[other], a, b, c)) {
          empty = false;
          break;
        }
      }
      if (!empty) continue;
      triangles.push(previous, current, next);
      ring.splice(at, 1);
      clipped = true;
    }
    if (!clipped) return null;
  }
  if (ring.length === 3) triangles.push(ring[0], ring[1], ring[2]);
  return triangles.length === (count - 2) * 3 ? triangles : null;
}

/**
 * The extrusion: a planar profile swept along +z with side quads (smooth
 * normals around the profile), flat ear-clipped caps at both ends and uv
 * coordinates from the perimeter fraction (sides) and the profile bounds
 * (caps). The profile is normalized to counter-clockwise; cw input is
 * reversed, consecutive duplicates and degenerate rings are refused.
 */
export function generateExtrusion(profile: readonly Vec2[], options: ExtrusionOptions = {}): GeneratedMesh {
  const zFrom = options.zFrom ?? 0;
  const zTo = options.zTo ?? 1;
  if (profile.length < 3) throw new MeshGenError(`versawasegen: extrusion profile needs >= 3 points, got ${profile.length}`);
  if (!(zTo > zFrom)) throw new MeshGenError(`versawasegen: extrusion zTo must be > zFrom, got ${zFrom}..${zTo}`);
  for (const point of profile) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y))
      throw new MeshGenError("versawasegen: extrusion profile points must be finite");
  }
  for (let index = 0; index < profile.length; index += 1) {
    const current = profile[index];
    const next = profile[(index + 1) % profile.length];
    if (Math.abs(current.x - next.x) < 1e-12 && Math.abs(current.y - next.y) < 1e-12)
      throw new MeshGenError(`versawasegen: extrusion profile repeats point ${index}, degenerate edges are refused`);
  }
  const area = signedArea(profile);
  if (Math.abs(area) < 1e-12)
    throw new MeshGenError("versawasegen: extrusion profile has zero area (collinear ring)");
  const ring = area < 0 ? [...profile].reverse() : profile;
  const caps = triangulatePolygon(ring);
  if (!caps) throw new MeshGenError("versawasegen: extrusion profile could not be triangulated (self-intersecting ring?)");

  const count = ring.length;
  // layout: side vertices (count * 2 levels), then front cap (count), then back cap (count)
  const sideBase = 0;
  const frontBase = count * 2;
  const backBase = count * 3;
  const total = count * 4;
  const positions = new Float32Array(total * 3);
  const normals = new Float32Array(total * 3);
  const uvs = new Float32Array(total * 2);

  // perimeter fractions for the side u coordinate
  const fractions = new Float64Array(count + 1);
  for (let index = 0; index < count; index += 1) {
    const current = ring[index];
    const next = ring[(index + 1) % count];
    fractions[index + 1] = fractions[index] + Math.hypot(next.x - current.x, next.y - current.y);
  }
  const perimeter = fractions[count] || 1;

  // profile bounds for the cap uv coordinates
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const point of ring) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  // edge normals of the counter-clockwise ring (outward = right of travel)
  const edgeNormals: Vec2[] = [];
  for (let index = 0; index < count; index += 1) {
    const current = ring[index];
    const next = ring[(index + 1) % count];
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const length = Math.hypot(dx, dy) || 1;
    edgeNormals.push({ x: dy / length, y: -dx / length });
  }

  for (let index = 0; index < count; index += 1) {
    const point = ring[index];
    // side vertex, zFrom level then zTo level: normal = average of adjacent edge normals
    const previousNormal = edgeNormals[(index + count - 1) % count];
    const nextNormal = edgeNormals[index];
    let nx = previousNormal.x + nextNormal.x;
    let ny = previousNormal.y + nextNormal.y;
    const nLength = Math.hypot(nx, ny) || 1;
    nx /= nLength;
    ny /= nLength;
    for (const [slot, z] of [
      [sideBase + index, zFrom],
      [sideBase + count + index, zTo],
    ] as const) {
      const vertex = slot * 3;
      positions[vertex] = point.x;
      positions[vertex + 1] = point.y;
      positions[vertex + 2] = z;
      normals[vertex] = nx;
      normals[vertex + 1] = ny;
      normals[vertex + 2] = 0;
      const uv = slot * 2;
      uvs[uv] = fractions[index] / perimeter;
      uvs[uv + 1] = (z - zFrom) / (zTo - zFrom);
    }
    // caps: duplicated flat vertices, exact +/-z normals
    const frontVertex = (frontBase + index) * 3;
    positions[frontVertex] = point.x;
    positions[frontVertex + 1] = point.y;
    positions[frontVertex + 2] = zTo;
    normals[frontVertex] = 0;
    normals[frontVertex + 1] = 0;
    normals[frontVertex + 2] = 1;
    uvs[(frontBase + index) * 2] = (point.x - minX) / spanX;
    uvs[(frontBase + index) * 2 + 1] = (point.y - minY) / spanY;
    const backVertex = (backBase + index) * 3;
    positions[backVertex] = point.x;
    positions[backVertex + 1] = point.y;
    positions[backVertex + 2] = zFrom;
    normals[backVertex] = 0;
    normals[backVertex + 1] = 0;
    normals[backVertex + 2] = -1;
    uvs[(backBase + index) * 2] = (point.x - minX) / spanX;
    uvs[(backBase + index) * 2 + 1] = (point.y - minY) / spanY;
  }

  const indices: number[] = [];
  for (let index = 0; index < count; index += 1) {
    const next = (index + 1) % count;
    const v0 = sideBase + index;
    const v1 = sideBase + next;
    const v2 = sideBase + count + next;
    const v3 = sideBase + count + index;
    indices.push(v0, v1, v2, v0, v2, v3);
  }
  for (let at = 0; at + 2 < caps.length; at += 3) {
    indices.push(frontBase + caps[at], frontBase + caps[at + 1], frontBase + caps[at + 2]);
    indices.push(backBase + caps[at], backBase + caps[at + 2], backBase + caps[at + 1]);
  }
  const indexArray = new Uint32Array(indices);
  return {
    positions,
    normals,
    uvs,
    indices: indexArray,
    counts: { vertices: positions.length / 3, triangles: indexArray.length / 3 },
  };
}

// ---------------------------------------------------------------------------
// the modifier stack — twist, belly, subdivision
// ---------------------------------------------------------------------------

/** the y-range of a position buffer (degenerate meshes answer 0..0). */
function yRange(positions: Float32Array): [number, number] {
  let minY = 0;
  let maxY = 0;
  for (let offset = 1; offset < positions.length; offset += 3) {
    if (offset === 1 || positions[offset] < minY) minY = positions[offset];
    if (offset === 1 || positions[offset] > maxY) maxY = positions[offset];
  }
  return [minY, maxY];
}

/**
 * Twist: rotates every vertex around the y axis by radiansPerUnit * y — the
 * classic lathe twist of the modifier stack. Normals are recomputed from the
 * twisted faces (the twist shears the surface, so analytic rotation of the
 * old normals would be a lie).
 */
export function twistMesh(mesh: GeneratedMesh, radiansPerUnit: number): GeneratedMesh {
  if (!Number.isFinite(radiansPerUnit)) throw new MeshGenError("versawasegen: twist strength must be finite");
  const positions = new Float32Array(mesh.positions.length);
  for (let offset = 0; offset < mesh.positions.length; offset += 3) {
    const x = mesh.positions[offset];
    const y = mesh.positions[offset + 1];
    const z = mesh.positions[offset + 2];
    const angle = radiansPerUnit * y;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    positions[offset] = x * cos - z * sin;
    positions[offset + 1] = y;
    positions[offset + 2] = x * sin + z * cos;
  }
  return {
    positions,
    normals: averageNormals(positions, mesh.indices),
    uvs: new Float32Array(mesh.uvs),
    indices: new Uint32Array(mesh.indices),
    counts: { vertices: mesh.counts.vertices, triangles: mesh.counts.triangles },
  };
}

/**
 * Belly: bulges the mesh radially around the y axis — every vertex scales
 * its xz distance by 1 + amount * sin(pi * height fraction), so the profile
 * swells at mid-height and returns to exact size at both y extremes.
 * Normals are recomputed from the bulged faces.
 */
export function bellyMesh(mesh: GeneratedMesh, amount: number): GeneratedMesh {
  if (!Number.isFinite(amount) || amount <= -1)
    throw new MeshGenError(`versawasegen: belly amount must be finite and > -1, got ${amount}`);
  const [minY, maxY] = yRange(mesh.positions);
  const span = maxY - minY;
  const positions = new Float32Array(mesh.positions.length);
  for (let offset = 0; offset < mesh.positions.length; offset += 3) {
    const x = mesh.positions[offset];
    const y = mesh.positions[offset + 1];
    const z = mesh.positions[offset + 2];
    const heightFraction = span > 0 ? (y - minY) / span : 0;
    const scale = 1 + amount * Math.sin(Math.PI * heightFraction);
    positions[offset] = x * scale;
    positions[offset + 1] = y;
    positions[offset + 2] = z * scale;
  }
  return {
    positions,
    normals: averageNormals(positions, mesh.indices),
    uvs: new Float32Array(mesh.uvs),
    indices: new Uint32Array(mesh.indices),
    counts: { vertices: mesh.counts.vertices, triangles: mesh.counts.triangles },
  };
}

/** the honest cap of one subdivision answer (the guard refuses the explosion). */
const SUBDIVISION_TRIANGLE_CAP = 2_000_000;

/**
 * Midpoint subdivision: every triangle splits into four over its edge
 * midpoints (shared through an index-pair cache, so no cracks), midpoints
 * carry averaged uv coordinates and the whole normal set is recomputed from
 * the new faces. Levels ride 0..6 and the projected triangle count must stay
 * under the documented cap — a refusal, never a stall.
 */
export function subdivideMesh(mesh: GeneratedMesh, levels = 1): GeneratedMesh {
  if (!Number.isInteger(levels) || levels < 0 || levels > 6)
    throw new MeshGenError(`versawasegen: subdivision levels must be an integer 0..6, got ${levels}`);
  const projected = mesh.counts.triangles * Math.pow(4, levels);
  if (projected > SUBDIVISION_TRIANGLE_CAP)
    throw new MeshGenError(
      `versawasegen: subdivision would answer ${projected} triangles, over the ${SUBDIVISION_TRIANGLE_CAP} cap`,
    );
  let positions = new Float32Array(mesh.positions);
  let uvs = new Float32Array(mesh.uvs);
  let indices = new Uint32Array(mesh.indices);
  for (let level = 0; level < levels; level += 1) {
    const midpoints = new Map<string, number>();
    const nextPositions: number[] = [...positions];
    const nextUvs: number[] = [...uvs];
    const nextIndices: number[] = [];
    const midpointOf = (a: number, b: number): number => {
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      const cached = midpoints.get(key);
      if (cached !== undefined) return cached;
      const index = nextPositions.length / 3;
      for (let axis = 0; axis < 3; axis += 1)
        nextPositions.push((positions[a * 3 + axis] + positions[b * 3 + axis]) / 2);
      for (let axis = 0; axis < 2; axis += 1) nextUvs.push((uvs[a * 2 + axis] + uvs[b * 2 + axis]) / 2);
      midpoints.set(key, index);
      return index;
    };
    for (let face = 0; face + 2 < indices.length; face += 3) {
      const a = indices[face];
      const b = indices[face + 1];
      const c = indices[face + 2];
      const ab = midpointOf(a, b);
      const bc = midpointOf(b, c);
      const ca = midpointOf(c, a);
      nextIndices.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
    }
    positions = new Float32Array(nextPositions);
    uvs = new Float32Array(nextUvs);
    indices = new Uint32Array(nextIndices);
  }
  return {
    positions,
    normals: averageNormals(positions, indices),
    uvs,
    indices,
    counts: { vertices: positions.length / 3, triangles: indices.length / 3 },
  };
}


/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: versawaseshaders.ts — the GLSL material catalog and source validator. */
/* ════════════════════════════════════════════════════════════════════ */

/**
 * versawaseshaders — the GLSL material catalog and source validator of
 * the versawase engine. shadercomp.ts owns the compositor fragment effects
 * (film/optics vocabulary over a source texture); this module owns the 3d
 * material lane: the vertex stages that carry a GeneratedMesh to clip space
 * (mvp with normal matrix, flat mvp) and the fragment materials that shade
 * it (lambert, toon, matcap, uv/normal debug, depth ramp), every source a
 * real ES 3.00 program. The validator is the honest gate the family law
 * asks for: brace/paren/bracket balance, the #version-first rule, the
 * es 3.00 storage invariants (no gl_FragColor, no attribute/varying),
 * declared-uniform extraction, required-uniform checks and the
 * sampler-behind-texture() rule — all over comments-stripped source with
 * line numbers preserved, answering typed issues instead of throwing. The
 * catalog cross-checks itself (validateCatalogShaders) and the compositor
 * library (validateLibraryEffects folds every shadercomp effect program
 * through the same gate), so a broken body is refused before any manifest
 * row ships. Pure node-side TypeScript: the sha-256 stamps ride node:crypto
 * exactly like shadercomp, nothing here touches the GPU.
 */

/** one catalog stage: a real GLSL ES 3.00 source plus its declared uniforms. */
export interface ShaderStageEntry {
  id: string;
  stage: "vertex" | "fragment";
  label: string;
  /** the full GLSL source, `#version 300 es` first. */
  glsl: string;
  /** every uniform the source declares — the manifest contract. */
  uniforms: readonly string[];
}

/** one finding of the validator: what broke, and where. */
export interface ShaderIssue {
  /** stable machine code (unbalanced-braces, missing-uniform, ...). */
  code: string;
  /** 1-based line of the finding (0 when the source never reaches it). */
  line: number;
  message: string;
}

/** the typed answer of the validator — issues empty means ok. */
export interface ShaderValidation {
  ok: boolean;
  issues: readonly ShaderIssue[];
  /** the uniforms the source declares, in declaration order. */
  uniforms: readonly string[];
}

/** the validation options; every field carries a default. */
export interface ValidateShaderOptions {
  /** the stage the source claims to be (documented on the issue only). */
  stage?: "vertex" | "fragment";
  /** whether a `void main(` entry point is required (default true). */
  requiresMain?: boolean;
  /** uniforms the caller requires the source to declare. */
  requiredUniforms?: readonly string[];
}

/** strips line and block comments while preserving every line number. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (block) => "\n".repeat((block.match(/\n/g) ?? []).length))
    .replace(/\/\/[^\n]*/g, "");
}

/** 1-based line of a character index inside the source. */
function lineOf(source: string, index: number): number {
  let line = 1;
  for (let at = 0; at < index && at < source.length; at += 1) {
    if (source.charCodeAt(at) === 10) line += 1;
  }
  return line;
}

/** extracts the declared uniform names (declaration order, duplicates kept out). */
function declaredUniforms(stripped: string): string[] {
  const names: string[] = [];
  const pattern = /uniform\s+\w+\s+(\w+)\s*(?:\[[^\]]*\])?\s*;/g;
  for (const match of stripped.matchAll(pattern)) {
    if (!names.includes(match[1])) names.push(match[1]);
  }
  return names;
}

/**
 * Validates one GLSL source honestly: brace/paren/bracket balance with the
 * offending line, the #version-first-line rule, the es 3.00 invariants
 * (gl_FragColor and attribute/varying are refused), the main() entry point,
 * declared-uniform extraction, required-uniform presence and the rule that
 * texture() calls need a declared sampler. Comments are stripped first, so
 * commented-out damage never fools the gate and real line numbers survive.
 */
export function validateShaderSource(source: string, options: ValidateShaderOptions = {}): ShaderValidation {
  const issues: ShaderIssue[] = [];
  const requiresMain = options.requiresMain ?? true;
  if (typeof source !== "string" || source.trim().length === 0) {
    return { ok: false, issues: [{ code: "empty-source", line: 0, message: "the shader source is empty" }], uniforms: [] };
  }
  const stripped = stripComments(source);
  const uniforms = declaredUniforms(stripped);

  // bracket balance: every opener must close, and on its own nesting level
  const pairs: [string, string, string][] = [
    ["{", "}", "unbalanced-braces"],
    ["(", ")", "unbalanced-parens"],
    ["[", "]", "unbalanced-brackets"],
  ];
  for (const [open, close, code] of pairs) {
    const stack: number[] = [];
    let closedEarly = -1;
    for (let at = 0; at < stripped.length; at += 1) {
      const character = stripped[at];
      if (character === open) stack.push(at);
      else if (character === close) {
        const opened = stack.pop();
        if (opened === undefined) {
          closedEarly = at;
          break;
        }
      }
    }
    if (closedEarly >= 0)
      issues.push({ code, line: lineOf(stripped, closedEarly), message: `a "${close}" closes without its "${open}"` });
    else if (stack.length > 0)
      issues.push({ code, line: lineOf(stripped, stack[stack.length - 1]), message: `${stack.length} "${open}" never close` });
  }

  // the #version directive must lead the file when it appears at all
  const versionAt = stripped.search(/^\s*#\s*version\b/m);
  if (versionAt > 0)
    issues.push({ code: "version-not-first", line: lineOf(stripped, versionAt), message: "#version must be the first line of the source" });

  // es 3.00 storage invariants
  const fragColor = /\bgl_FragColor\b/.exec(stripped);
  if (fragColor)
    issues.push({ code: "es3-fragcolor", line: lineOf(stripped, fragColor.index), message: "gl_FragColor is es 1.00 storage — declare an out vec4 and write it" });
  const legacy = /\b(?:attribute|varying)\b/.exec(stripped);
  if (legacy)
    issues.push({
      code: "es3-legacy-storage",
      line: lineOf(stripped, legacy.index),
      message: `"${legacy[0]}" is es 1.00 storage — es 3.00 spells it in/out`,
    });

  // the entry point
  if (requiresMain && !/\bvoid\s+main\s*\(/.test(stripped))
    issues.push({ code: "missing-main", line: 0, message: "the source never declares `void main(`" });

  // required uniforms
  for (const required of options.requiredUniforms ?? []) {
    if (!uniforms.includes(required))
      issues.push({ code: "missing-uniform", line: 0, message: `the source never declares uniform "${required}"` });
  }

  // texture() needs a declared sampler
  if (/\btexture\s*\(/.test(stripped) && !/\buniform\s+sampler2D\s+\w+/.test(stripped))
    issues.push({ code: "texture-without-sampler", line: 0, message: "texture() is called but no sampler2D uniform is declared" });

  return { ok: issues.length === 0, issues, uniforms };
}

// ---------------------------------------------------------------------------
// the vertex stages
// ---------------------------------------------------------------------------

/** the mvp vertex stage with normals and uv (the material lane standard). */
const VERTEX_MVP_STANDARD =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "in vec3 aPosition;\n" +
  "in vec3 aNormal;\n" +
  "in vec2 aUv;\n" +
  "uniform mat4 uModel;\n" +
  "uniform mat4 uViewProjection;\n" +
  "uniform mat3 uNormalMatrix;\n" +
  "out vec3 vNormal;\n" +
  "out vec2 vUv;\n" +
  "void main() {\n" +
  "  vNormal = normalize(uNormalMatrix * aNormal);\n" +
  "  vUv = aUv;\n" +
  "  gl_Position = uViewProjection * uModel * vec4(aPosition, 1.0);\n" +
  "}\n";

/** the flat mvp vertex stage (positions only — the depth ramp rides it). */
const VERTEX_MVP_FLAT =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "in vec3 aPosition;\n" +
  "uniform mat4 uModel;\n" +
  "uniform mat4 uViewProjection;\n" +
  "void main() {\n" +
  "  gl_Position = uViewProjection * uModel * vec4(aPosition, 1.0);\n" +
  "}\n";

/** the vertex stages of the catalog. */
export const VERTEX_STAGES: readonly ShaderStageEntry[] = [
  {
    id: "mvp-standard",
    stage: "vertex",
    label: "mvp with normals and uv",
    glsl: VERTEX_MVP_STANDARD,
    uniforms: ["uModel", "uViewProjection", "uNormalMatrix"],
  },
  {
    id: "mvp-flat",
    stage: "vertex",
    label: "flat mvp (positions only)",
    glsl: VERTEX_MVP_FLAT,
    uniforms: ["uModel", "uViewProjection"],
  },
];

// ---------------------------------------------------------------------------
// the fragment materials
// ---------------------------------------------------------------------------

/** the lambert material: diffuse plus a documented ambient floor. */
const FRAGMENT_LAMBERT =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "uniform vec3 uLightDirection;\n" +
  "uniform vec3 uLightColor;\n" +
  "uniform vec3 uBaseColor;\n" +
  "in vec3 vNormal;\n" +
  "in vec2 vUv;\n" +
  "out vec4 outColor;\n" +
  "void main() {\n" +
  "  vec3 normal = normalize(vNormal);\n" +
  "  float diffuse = max(dot(normal, normalize(uLightDirection)), 0.0);\n" +
  "  vec3 lit = uBaseColor * uLightColor * (0.18 + 0.82 * diffuse);\n" +
  "  outColor = vec4(lit, 1.0);\n" +
  "}\n";

/** the toon material: the diffuse term quantized into bands. */
const FRAGMENT_TOON =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "uniform vec3 uLightDirection;\n" +
  "uniform vec3 uBaseColor;\n" +
  "uniform float uBands;\n" +
  "in vec3 vNormal;\n" +
  "in vec2 vUv;\n" +
  "out vec4 outColor;\n" +
  "void main() {\n" +
  "  vec3 normal = normalize(vNormal);\n" +
  "  float diffuse = max(dot(normal, normalize(uLightDirection)), 0.0);\n" +
  "  float bands = max(uBands, 1.0);\n" +
  "  float quantized = floor(diffuse * bands) / max(bands - 1.0, 1.0);\n" +
  "  outColor = vec4(uBaseColor * (0.35 + 0.65 * quantized), 1.0);\n" +
  "}\n";

/** the matcap material: the view-space normal mapped onto a sampler look. */
const FRAGMENT_MATCAP =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "uniform sampler2D uMatcap;\n" +
  "in vec3 vNormal;\n" +
  "in vec2 vUv;\n" +
  "out vec4 outColor;\n" +
  "void main() {\n" +
  "  vec3 normal = normalize(vNormal);\n" +
  "  vec2 cap = normal.xy * 0.5 + 0.5;\n" +
  "  outColor = vec4(texture(uMatcap, cap).rgb, 1.0);\n" +
  "}\n";

/** the uv debug material: paints the interpolated uv coordinates. */
const FRAGMENT_UV_DEBUG =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "in vec3 vNormal;\n" +
  "in vec2 vUv;\n" +
  "out vec4 outColor;\n" +
  "void main() {\n" +
  "  outColor = vec4(vUv, 0.0, 1.0);\n" +
  "}\n";

/** the normal debug material: normals mapped from -1..1 into 0..1 rgb. */
const FRAGMENT_NORMAL_DEBUG =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "in vec3 vNormal;\n" +
  "in vec2 vUv;\n" +
  "out vec4 outColor;\n" +
  "void main() {\n" +
  "  vec3 normal = normalize(vNormal) * 0.5 + 0.5;\n" +
  "  outColor = vec4(normal, 1.0);\n" +
  "}\n";

/** the depth ramp material: the window depth painted as a near-white ramp. */
const FRAGMENT_DEPTH_RAMP =
  "#version 300 es\n" +
  "precision highp float;\n" +
  "out vec4 outColor;\n" +
  "void main() {\n" +
  "  float depth = gl_FragCoord.z;\n" +
  "  outColor = vec4(vec3(1.0 - depth), 1.0);\n" +
  "}\n";

/** the fragment materials of the catalog, each with its vertex pairing. */
export const FRAGMENT_MATERIALS: readonly (ShaderStageEntry & { vertexStage: string })[] = [
  {
    id: "lambert",
    stage: "fragment",
    label: "lambert diffuse",
    glsl: FRAGMENT_LAMBERT,
    uniforms: ["uLightDirection", "uLightColor", "uBaseColor"],
    vertexStage: "mvp-standard",
  },
  {
    id: "toon",
    stage: "fragment",
    label: "banded toon",
    glsl: FRAGMENT_TOON,
    uniforms: ["uLightDirection", "uBaseColor", "uBands"],
    vertexStage: "mvp-standard",
  },
  {
    id: "matcap",
    stage: "fragment",
    label: "matcap look",
    glsl: FRAGMENT_MATCAP,
    uniforms: ["uMatcap"],
    vertexStage: "mvp-standard",
  },
  {
    id: "uvdebug",
    stage: "fragment",
    label: "uv debug",
    glsl: FRAGMENT_UV_DEBUG,
    uniforms: [],
    vertexStage: "mvp-standard",
  },
  {
    id: "normaldebug",
    stage: "fragment",
    label: "normal debug",
    glsl: FRAGMENT_NORMAL_DEBUG,
    uniforms: [],
    vertexStage: "mvp-standard",
  },
  {
    id: "depthramp",
    stage: "fragment",
    label: "depth ramp",
    glsl: FRAGMENT_DEPTH_RAMP,
    uniforms: [],
    vertexStage: "mvp-flat",
  },
];

/** one compiled material program: both stages, both hashes, the uniform manifest. */
export interface MaterialProgram {
  id: string;
  vertexStage: string;
  fragmentStage: string;
  vertexSource: string;
  fragmentSource: string;
  vertexSha256: string;
  fragmentSha256: string;
  /** every uniform both stages declare (vertex first, then fragment). */
  uniforms: readonly string[];
}

/** the material ids the catalog answers (the caller-facing surface). */
export function materialIds(): readonly string[] {
  return FRAGMENT_MATERIALS.map((material) => material.id);
}

/**
 * Compiles one catalog material into its program pair: the paired vertex
 * stage, the fragment source, the sha-256 of each (the PrecompiledShader
 * doctrine — a visitor machine never compiles a shader) and the uniform
 * manifest of both stages. Unknown ids answer null — no pretend program.
 */
export function compileMaterialProgram(id: string): MaterialProgram | null {
  const material = FRAGMENT_MATERIALS.find((entry) => entry.id === id);
  if (!material) return null;
  const vertex = VERTEX_STAGES.find((stage) => stage.id === material.vertexStage);
  if (!vertex) return null;
  return {
    id: material.id,
    vertexStage: vertex.id,
    fragmentStage: material.id,
    vertexSource: vertex.glsl,
    fragmentSource: material.glsl,
    vertexSha256: createHash("sha256").update(vertex.glsl, "utf8").digest("hex"),
    fragmentSha256: createHash("sha256").update(material.glsl, "utf8").digest("hex"),
    uniforms: [...vertex.uniforms, ...material.uniforms],
  };
}

/** validates every catalog stage against its own declared uniforms. */
export function validateCatalogShaders(): { id: string; validation: ShaderValidation }[] {
  const rows: { id: string; validation: ShaderValidation }[] = [];
  for (const stage of [...VERTEX_STAGES, ...FRAGMENT_MATERIALS]) {
    rows.push({
      id: stage.id,
      validation: validateShaderSource(stage.glsl, { stage: stage.stage, requiredUniforms: stage.uniforms }),
    });
  }
  return rows;
}

/**
 * Cross-checks the compositor library: every shadercomp effect compiled into
 * its full program (header + body + footer) and folded through the same
 * validator, with the pass uniforms required. A broken effect body surfaces
 * here before any manifest row ships.
 */
export function validateLibraryEffects(): { id: string; validation: ShaderValidation }[] {
  const rows: { id: string; validation: ShaderValidation }[] = [];
  for (const effect of SHADER_EFFECTS) {
    const compiled = compileEffectProgram(effect.id, 0);
    rows.push({
      id: effect.id,
      validation: compiled
        ? validateShaderSource(compiled.program, { stage: "fragment", requiredUniforms: ["uSource", "uResolution", "uTime", "uAmount"] })
        : {
            ok: false,
            issues: [{ code: "unknown-effect", line: 0, message: `effect "${effect.id}" did not compile` }],
            uniforms: [],
          },
    });
  }
  return rows;
}


/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: versawaserender.ts — the WebGL2 pass runtime. */
/* ════════════════════════════════════════════════════════════════════ */

/**
 * versawaserender — the WebGL2 runtime that actually executes the compiled
 * EffectPrograms of shadercomp.ts: one fullscreen-triangle draw per effect,
 * ping-pong framebuffers between passes, and a readPixels readback that
 * answers an ImageData-shaped buffer. Vanilla WebGL2 only — three never
 * rides the 2d compositor passes. Refusal is typed and honest: a canvas
 * without a webgl2 context never fakes a render, and damaged input answers
 * outcomes instead of throwing (the transcodeplan/shadercomp contract).
 * The pure pieces (triangle geometry, program cache, pass planning, row
 * flip) are node-testable; every GL call sits in one renderer class
 * behind them.
 */

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


/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: versawase3d.ts — the three.js viewport runtime. */
/* ════════════════════════════════════════════════════════════════════ */

/**
 * versawase3d — the 3d viewport runtime of the versawase engine: it takes
 * the mesh data the visualize pipeline already produces (vertices, indices,
 * vertex colors, normals) and mounts a real three.js scene — perspective
 * camera with a hand-rolled orbit (drag to rotate, wheel or pinch to zoom,
 * no external controls package), ambient plus directional light, a
 * vertex-colored standard material, and a rAF loop that stays still under
 * reduced motion. The mesh math is a pure conversion (image space is
 * mirrored into three's y-up space and the winding is reversed to keep the
 * front faces toward the camera), node-testable without any canvas; the
 * DOM side (listeners, observer, loop) lives in one viewport object that
 * disposes cleanly.
 */

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


/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: versawaseanimate.ts — the animation sampler. */
/* ════════════════════════════════════════════════════════════════════ */

/**
 * versawaseanimate — the animation sampler of the versawase engine: it turns
 * the declarative Scene3d contract (versawase.ts) into per-node transform
 * snapshots over time. Library-grade and pure: no consumer data, no DOM, no
 * GL — the pages, stealthhead and external packages bring their own scene
 * rows and ride the same sampler. Sampling composes on top of the engine
 * primitives (trackValueAt for one track, sceneDuration for the wrap span)
 * instead of duplicating their math.
 */

/** The sampled local state of one node at a point in time. */
export interface NodeSnapshot {
  id: string;
  position: Axis3;
  rotation: Axis3;
  scale: Axis3;
  opacity: number;
  /** morph weight (0..1) when a morph track targets the node */
  morph: number;
}

/** Named-axis vector for transform snapshots (mesh math rides visualizemesh's tuple Vec3). */
export interface Axis3 {
  x: number;
  y: number;
  z: number;
}

const ZERO: Axis3 = { x: 0, y: 0, z: 0 };
const ONE: Axis3 = { x: 1, y: 1, z: 1 };

/** Collects the animation tracks that target one node id. */
export function tracksByTarget(scene: Scene3d, nodeId: string): readonly AnimationTrack[] {
  return scene.tracks.filter((track) => track.target === nodeId);
}

/** Wraps seconds into the authored span when the scene loops, so long plays ride the same keys. */
export function wrapSeconds(seconds: number, span: number): number {
  if (span <= 0) return Math.max(0, seconds);
  if (seconds <= span) return Math.max(0, seconds);
  return seconds % span;
}

/** Samples every channel of one node's tracks into a local snapshot (defaults included). */
export function sampleNode(scene: Scene3d, node: SceneNode, seconds: number): NodeSnapshot {
  const snapshot: NodeSnapshot = {
    id: node.id,
    position: { ...ZERO },
    rotation: { ...ZERO },
    scale: { ...ONE },
    opacity: 1,
    morph: 0,
  };
  for (const track of tracksByTarget(scene, node.id)) {
    const value = trackValueAt(track, seconds);
    switch (track.channel) {
      case "position":
        snapshot.position = axisValue(snapshot.position, track, value);
        break;
      case "rotation":
        snapshot.rotation = axisValue(snapshot.rotation, track, value);
        break;
      case "scale":
        snapshot.scale = axisValue(snapshot.scale, track, value);
        break;
      case "opacity":
        snapshot.opacity = value;
        break;
      case "morph":
        snapshot.morph = value;
        break;
    }
  }
  return snapshot;
}

/** Samples the whole scene at one instant: every node id maps to its local snapshot. */
export function sampleSceneAt(scene: Scene3d, seconds: number): Map<string, NodeSnapshot> {
  const time = wrapSeconds(seconds, sceneDuration(scene));
  const snapshots = new Map<string, NodeSnapshot>();
  for (const node of scene.nodes) {
    snapshots.set(node.id, sampleNode(scene, node, time));
  }
  return snapshots;
}

/**
 * Accumulates the world transform of one node over its parent chain:
 * positions add, scales multiply, rotations add (euler degrees, local order).
 * Cycles in the parent graph are cut at the first revisit.
 */
export function worldTransform(
  scene: Scene3d,
  nodeId: string,
  seconds: number,
): { position: Axis3; rotation: Axis3; scale: Axis3 } {
  const time = wrapSeconds(seconds, sceneDuration(scene));
  const byId = new Map(scene.nodes.map((node) => [node.id, node]));
  const chain: SceneNode[] = [];
  const seen = new Set<string>();
  let cursor: SceneNode | undefined = byId.get(nodeId);
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    chain.unshift(cursor);
    cursor = cursor.parent ? byId.get(cursor.parent) : undefined;
  }
  const world = { position: { ...ZERO }, rotation: { ...ZERO }, scale: { ...ONE } };
  for (const node of chain) {
    const local = sampleNode(scene, node, time);
    world.position = addVec(world.position, local.position);
    world.rotation = addVec(world.rotation, local.rotation);
    world.scale = mulVec(world.scale, local.scale);
  }
  return world;
}

/** Folds one track value into one axis slot of a vector (x/y/z encoded in the track id suffix). */
function axisValue(base: Axis3, track: AnimationTrack, value: number): Axis3 {
  const axis = axisOf(track.id);
  return { ...base, [axis]: value } as Axis3;
}

/** Reads the axis a track drives from its id suffix (-x, -y, -z); unknown ids ride x. */
function axisOf(trackId: string): keyof Axis3 {
  const suffix = trackId.slice(-2).toLowerCase();
  if (suffix === "-y") return "y";
  if (suffix === "-z") return "z";
  return "x";
}

function addVec(a: Axis3, b: Axis3): Axis3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function mulVec(a: Axis3, b: Axis3): Axis3 {
  return { x: a.x * b.x, y: a.y * b.y, z: a.z * b.z };
}


/* ════════════════════════════════════════════════════════════════════ */
/* Section 6: versawaseslices.ts — the sliced-render planner. */
/* ════════════════════════════════════════════════════════════════════ */

/**
 * versawaseslices — the sliced-render planner of the versawase engine (the
 * F-CAD-027 doctrine: the render is cut into fixed seconds slices, the preview
 * rides the same slice grid as the final, and the assembly is deterministic).
 * Library-grade and pure: a caller brings the duration, the frame rate and the
 * slice length; the planner answers the frame-aligned slices with their tick
 * windows, the honest wall-clock estimate across parallel workers and the
 * weighted progress readout. Frame math composes on the timeticks primitives
 * (frameratefromf64, frameat, tickofframe) — never re-derived here.
 */

/** One render slice: a frame-aligned window of the timeline with its tick span. */
export interface RenderSlice {
  /** 0-based position in the assembly order */
  index: number;
  /** first frame of the slice (inclusive, timeline grid) */
  fromFrame: number;
  /** one past the last frame of the slice (exclusive) */
  toFrame: number;
  /** exact tick at fromFrame */
  fromTick: number;
  /** exact tick at toFrame */
  toTick: number;
  /** frame count the slice renders */
  frames: number;
}

/** Options of the slice planner; every field carries an engine default. */
export interface SlicePlanOptions {
  /** total media duration in seconds (> 0) */
  durationSeconds: number;
  /** frames per second: a FrameRate or a float (resolved through timeticks) */
  fps?: FrameRate | number;
  /** target slice length in seconds (default 10 — the F-CAD-027 doctrine) */
  sliceSeconds?: number;
  /** cap of slices before the planner widens them (default unlimited) */
  maxSlices?: number;
}

/** Plans the frame-aligned render slices of one timeline (empty for zero duration). */
export function planSlices(options: SlicePlanOptions): readonly RenderSlice[] {
  const { durationSeconds } = options;
  if (!(durationSeconds > 0)) return [];
  const rate = resolveRate(options.fps);
  const sliceSeconds = options.sliceSeconds !== undefined ? options.sliceSeconds : 10;
  if (!(sliceSeconds > 0)) return [];
  const totalFrames = Math.max(1, frameat(rate, ticksfromseconds(durationSeconds)));
  let sliceFrames = Math.max(1, Math.round(sliceSeconds * (rate.num / rate.den)));
  if (options.maxSlices !== undefined && options.maxSlices >= 1) {
    const widest = Math.ceil(totalFrames / options.maxSlices);
    if (widest > sliceFrames) sliceFrames = widest;
  }
  const slices: RenderSlice[] = [];
  for (let from = 0; from < totalFrames; from += sliceFrames) {
    const to = Math.min(from + sliceFrames, totalFrames);
    slices.push({
      index: slices.length,
      fromFrame: from,
      toFrame: to,
      fromTick: tickofframe(rate, from),
      toTick: tickofframe(rate, to),
      frames: to - from,
    });
  }
  return slices;
}

/** The slice that owns a timeline instant (preview seek rides the same grid as the final). */
export function sliceAt(slices: readonly RenderSlice[], seconds: number): RenderSlice | undefined {
  if (!(seconds >= 0) || slices.length === 0) return undefined;
  const rate = slicesRate(slices);
  const frame = frameat(rate, ticksfromseconds(seconds));
  const last = slices[slices.length - 1];
  if (frame >= last.toFrame) return undefined;
  for (const slice of slices) {
    if (frame >= slice.fromFrame && frame < slice.toFrame) return slice;
  }
  return undefined;
}

/** Aggregated render progress (0..1), weighted by frames — never by slice count. */
export function sliceProgress(slices: readonly RenderSlice[], completedIndexes: readonly number[]): number {
  if (slices.length === 0) return 0;
  const total = slices.reduce((sum, slice) => sum + slice.frames, 0);
  if (total === 0) return 0;
  const done = new Set(completedIndexes);
  const finished = slices.reduce((sum, slice) => (done.has(slice.index) ? sum + slice.frames : sum), 0);
  return finished / total;
}

/**
 * The honest wall-clock estimate across parallel workers: slices ride the
 * assembly order round-robin, every worker pays its own frames at
 * secondsPerFrame, and the render finishes when the slowest worker does.
 */
export function estimateWallClock(
  slices: readonly RenderSlice[],
  secondsPerFrame: number,
  workers: number,
): number {
  if (slices.length === 0 || !(secondsPerFrame >= 0)) return 0;
  const lanes = Math.max(1, Math.floor(workers));
  const loads = Array.from({ length: lanes }, () => 0);
  slices.forEach((slice, at) => {
    const lane = at % lanes;
    loads[lane] += slice.frames * secondsPerFrame;
  });
  return Math.max(...loads, 0);
}

/** Recovers the frame rate a plan was built against (from the first slice tick span). */
function slicesRate(slices: readonly RenderSlice[]): FrameRate {
  const first = slices[0];
  const span = first.frames > 0 ? first.toTick - first.fromTick : 0;
  const fps = span > 0 ? first.frames / (span / 254_016_000_000) : 24;
  return frameratefromf64(fps);
}

/** Resolves the caller fps into a FrameRate (number rides frameratefromf64). */
function resolveRate(fps?: FrameRate | number): FrameRate {
  if (typeof fps === "number") return frameratefromf64(fps);
  return fps ?? frameratefromf64(24);
}


/* ════════════════════════════════════════════════════════════════════ */
/* Section 7: versawasescheduler.ts — the render-job scheduler. */
/* ════════════════════════════════════════════════════════════════════ */

/**
 * versawasescheduler — the render-job scheduler of the versawase engine: it
 * turns the RenderJob contract (versawase.ts) into a deterministic multi-slot
 * plan and owns the pure status transitions of the queue. Library-grade: no
 * worker pool, no I/O, no clock — the pages, the gateway and stealthhead bring
 * their own executors and ride the same plan. Frame counts compose on the
 * engine primitive (renderJobFrames) instead of re-deriving them.
 */

/** One scheduled job: the slot it rides, the load it adds and its queue position. */
export interface ScheduleEntry {
  job: RenderJob;
  /** worker slot index (0-based) */
  slot: number;
  /** frame count the job produces (fps-normalized for 3d ranges) */
  frames: number;
  /** 1-based position inside its slot */
  order: number;
  /** load the slot already carried when the job was placed (abstract units) */
  startLoad: number;
}

/** Total load a slot carries after planning (frame units summed per slot). */
export function slotLoads(entries: readonly ScheduleEntry[], slots: number): number[] {
  const loads = Array.from({ length: Math.max(0, slots) }, () => 0);
  for (const entry of entries) {
    if (entry.slot >= 0 && entry.slot < loads.length) loads[entry.slot] += entry.frames;
  }
  return loads;
}

/**
 * Plans queued jobs onto slots deterministically: input order is preserved,
 * every job lands on the least-loaded slot (ties ride the lowest index) and
 * the frame count comes from renderJobFrames. Non-queued jobs are skipped —
 * the plan never re-runs work that already left the queue.
 */
export function planSchedule(jobs: readonly RenderJob[], fps: number, slots: number): ScheduleEntry[] {
  const safeSlots = Math.max(1, Math.floor(slots));
  const loads = Array.from({ length: safeSlots }, () => 0);
  const perSlot = Array.from({ length: safeSlots }, () => 0);
  const entries: ScheduleEntry[] = [];
  for (const job of jobs) {
    if (job.status !== "queued") continue;
    const frames = renderJobFrames(job, fps);
    let slot = 0;
    for (let at = 1; at < safeSlots; at += 1) {
      if (loads[at] < loads[slot]) slot = at;
    }
    perSlot[slot] += 1;
    entries.push({ job, slot, frames, order: perSlot[slot], startLoad: loads[slot] });
    loads[slot] += frames;
  }
  return entries;
}

/** Moves a queued job to rendering; answers null when the transition is illegal. */
export function startJob(job: RenderJob): RenderJob | null {
  return transition(job, "queued", "rendering");
}

/** Moves a rendering job to ready; answers null when the transition is illegal. */
export function completeJob(job: RenderJob): RenderJob | null {
  return transition(job, "rendering", "ready");
}

/** Moves a queued or rendering job to failed; answers null when the transition is illegal. */
export function failJob(job: RenderJob): RenderJob | null {
  if (job.status !== "queued" && job.status !== "rendering") return null;
  return { ...job, status: "failed", tone: "error" };
}

/** Counts the jobs per status in one pass (queue health readout). */
export function queueCensus(jobs: readonly RenderJob[]): Record<RenderJob["status"], number> {
  const census: Record<RenderJob["status"], number> = { queued: 0, rendering: 0, ready: 0, failed: 0 };
  for (const job of jobs) census[job.status] += 1;
  return census;
}

/** Shared guard of the pure status machine. */
function transition(job: RenderJob, from: RenderJob["status"], to: RenderJob["status"]): RenderJob | null {
  if (job.status !== from) return null;
  const next: RenderJob = { ...job, status: to };
  if (to === "ready") next.tone = "success";
  if (to === "rendering") next.tone = "info";
  return next;
}


/* ════════════════════════════════════════════════════════════════════ */
/* Section 8: versawasecomposition.ts — the composition document. */
/* ════════════════════════════════════════════════════════════════════ */

/**
 * versawasecomposition — the composition document of the cadria video
 * studio: the structured payload a timeline project serializes to and the
 * Saddle render lane consumes. Where timelineedit.ts owns the tick-space
 * edit algebra of one track, this module owns the whole-document shape —
 * tracks (video, audio, text), clips with media windows and playback rate,
 * the shadercomp effect stack per clip, the transition on the cut (the
 * gl-transitions name catalog) and the frame the whole thing renders at.
 * Every mutation answers the new document or a typed refusal — never a
 * throw, never a mutation — and the JSON lane is a real round trip:
 * serialize answers a deterministic byte-for-byte payload, parse answers
 * the same document back after validating every rule again (a document
 * that only the writer can read is not a format). The composition carries
 * its own Saddle plan: the same sliced-render planner the render lane
 * rides (versawaseslices) cuts the composition duration into frame-aligned
 * slices, so the heavy rasterization happens on the edge farm over the
 * standard transport — the visitor GPU is never touched by the render
 * lane, exactly the doctrine the engine records.
 */

/** the track kinds a composition carries. */
export type TrackKind = "video" | "audio" | "text";

/** one effect of a clip stack: a shadercomp library id plus its amount. */
export interface ClipEffect {
  /** the compositor effect id (validated against the shadercomp library). */
  effectId: ShaderEffectId;
  /** the effect amount inside the library's honest range. */
  amount: number;
  /** whether the effect is active in the stack (bypassed effects stay authored). */
  enabled: boolean;
}

/** the transition glued on a clip's leading cut. */
export interface ClipTransition {
  /** a gl-transitions catalog name (validated against GL_TRANSITIONS). */
  name: string;
  /** how long the transition overlaps, in seconds (inside the clip span). */
  durationSeconds: number;
}

/** one clip: a timeline span plus the media window it shows. */
export interface CompositionClip {
  id: string;
  /** the track this clip rides. */
  trackId: string;
  /** timeline start in seconds (>= 0). */
  startSeconds: number;
  /** timeline duration in seconds (> 0). */
  durationSeconds: number;
  /** media in-point in seconds (>= 0). */
  sourceIn: number;
  /** playback rate: media seconds per timeline second (> 0). */
  speed: number;
  /** the effect stack applied to this clip, in order. */
  effects: readonly ClipEffect[];
  /** the transition on the clip's leading cut, when one is authored. */
  transition?: ClipTransition;
}

/** one track of the composition. */
export interface CompositionTrack {
  id: string;
  kind: TrackKind;
  /** the clips of the track, in authored order. */
  clips: readonly CompositionClip[];
}

/** the whole composition document. */
export interface VideoComposition {
  id: string;
  name: string;
  /** the frame rate the composition renders at (> 0). */
  fps: number;
  /** raster width in pixels (positive, even per the transcode doctrine). */
  width: number;
  /** raster height in pixels (positive, even per the transcode doctrine). */
  height: number;
  tracks: readonly CompositionTrack[];
}

/** every way a composition request can honestly refuse (by return type). */
export type CompositionIssue =
  | "duplicate-track"
  | "unknown-track"
  | "duplicate-clip"
  | "overlap"
  | "bad-span"
  | "bad-speed"
  | "unknown-transition"
  | "bad-transition-span"
  | "unknown-effect"
  | "bad-amount"
  | "bad-format"
  | "bad-fps"
  | "bad-dimensions"
  | "bad-name"
  | "bad-id";

/** either the new document (or payload) or the reason nothing happened. */
export type CompositionOutcome<T> = { ok: true; value: T } | { ok: false; error: CompositionIssue };

/**
 * The canonical gl-transitions name set the engine recognizes on a cut —
 * the same public collection of webgl transitions (bounces, wipes, warps,
 * page curls) every player of the family names its cuts by. The catalog
 * ships names: each entry's sources and uniforms live in the upstream
 * collection, precompiled and served the shadercomp way.
 */
export const GL_TRANSITIONS: readonly string[] = [
  "Bounce",
  "BowTieHorizontal",
  "BowTieVertical",
  "ButterflyWaveScrawler",
  "CircleCrop",
  "ColourDistance",
  "CrazyParametricFun",
  "CrossZoom",
  "DirectionalSlide",
  "DoomScreenTransition",
  "Dreamy",
  "EdgeTransition",
  "FilmBurn",
  "GlitchDisplace",
  "Heart",
  "InvertedPageCurl",
  "LeftDrawer",
  "Mosaic",
  "PolkaDotsCurtain",
  "Radial",
  "RightDrawer",
  "Roll",
  "RotateScaleFade",
  "SimpleZoom",
  "StereoViewer",
  "Swap",
  "Swirl",
  "WaterDrop",
  "ZoomInCircles",
];

/** whether a transition name rides the gl-transitions catalog. */
export function isKnownTransition(name: string): boolean {
  return GL_TRANSITIONS.includes(name);
}

/** the effect library row of one id, when it exists. */
function effectRow(effectId: string) {
  return SHADER_EFFECTS.find((effect) => effect.id === effectId);
}

/** exclusive timeline end of a clip. */
export function clipEndSeconds(clip: CompositionClip): number {
  return clip.startSeconds + clip.durationSeconds;
}

/** the total duration of a composition — the furthest clip end over every track (0 when empty). */
export function compositionDurationSeconds(composition: VideoComposition): number {
  let duration = 0;
  for (const track of composition.tracks) {
    for (const clip of track.clips) {
      const end = clipEndSeconds(clip);
      if (end > duration) duration = end;
    }
  }
  return duration;
}

/** validates one clip against the library catalogs and the honest ranges. */
function clipIssue(clip: CompositionClip): CompositionIssue | null {
  if (typeof clip.id !== "string" || clip.id.length === 0) return "bad-id";
  if (typeof clip.trackId !== "string" || clip.trackId.length === 0) return "bad-id";
  if (!Number.isFinite(clip.startSeconds) || clip.startSeconds < 0 || !Number.isFinite(clip.durationSeconds) || clip.durationSeconds <= 0)
    return "bad-span";
  if (!Number.isFinite(clip.speed) || clip.speed <= 0) return "bad-speed";
  if (!Number.isFinite(clip.sourceIn) || clip.sourceIn < 0) return "bad-span";
  for (const effect of clip.effects ?? []) {
    const row = effectRow(effect.effectId);
    if (!row) return "unknown-effect";
    if (typeof effect.amount !== "number" || !Number.isFinite(effect.amount) || effect.amount < row.minAmount || effect.amount > row.maxAmount)
      return "bad-amount";
  }
  if (clip.transition !== undefined) {
    if (!isKnownTransition(clip.transition.name)) return "unknown-transition";
    if (
      !Number.isFinite(clip.transition.durationSeconds) ||
      clip.transition.durationSeconds <= 0 ||
      clip.transition.durationSeconds > clip.durationSeconds
    )
      return "bad-transition-span";
  }
  return null;
}

/** whether two half-open clip spans share any timeline instant. */
function spansOverlap(a: CompositionClip, b: CompositionClip): boolean {
  return a.startSeconds < clipEndSeconds(b) && b.startSeconds < clipEndSeconds(a);
}

/** validates the whole document shape (parse lane) — every rule, one pass. */
function documentIssue(document: VideoComposition): CompositionIssue | null {
  if (typeof document.id !== "string" || document.id.length === 0) return "bad-id";
  if (typeof document.name !== "string" || document.name.length === 0) return "bad-name";
  if (!Number.isFinite(document.fps) || document.fps <= 0) return "bad-fps";
  if (!Number.isInteger(document.width) || document.width <= 0 || document.width % 2 !== 0) return "bad-dimensions";
  if (!Number.isInteger(document.height) || document.height <= 0 || document.height % 2 !== 0) return "bad-dimensions";
  if (!Array.isArray(document.tracks)) return "bad-format";
  const trackIds = new Set<string>();
  const clipIds = new Set<string>();
  for (const track of document.tracks) {
    if (typeof track.id !== "string" || track.id.length === 0) return "bad-id";
    if (trackIds.has(track.id)) return "duplicate-track";
    trackIds.add(track.id);
    if (track.kind !== "video" && track.kind !== "audio" && track.kind !== "text") return "bad-format";
    if (!Array.isArray(track.clips)) return "bad-format";
    const placed: CompositionClip[] = [];
    for (const clip of track.clips) {
      const issue = clipIssue(clip);
      if (issue) return issue;
      if (clipIds.has(clip.id)) return "duplicate-clip";
      clipIds.add(clip.id);
      if (clip.trackId !== track.id) return "unknown-track";
      if (placed.some((other) => spansOverlap(other, clip))) return "overlap";
      placed.push(clip);
    }
  }
  return null;
}

/** adds one track to the composition (the id must be fresh). */
export function addTrack(composition: VideoComposition, track: CompositionTrack): CompositionOutcome<VideoComposition> {
  if (typeof track.id !== "string" || track.id.length === 0) return { ok: false, error: "bad-id" };
  if (track.kind !== "video" && track.kind !== "audio" && track.kind !== "text") return { ok: false, error: "bad-format" };
  if (composition.tracks.some((existing) => existing.id === track.id)) return { ok: false, error: "duplicate-track" };
  const clips: CompositionClip[] = [];
  const clipIds = new Set<string>();
  for (const clip of track.clips ?? []) {
    const issue = clipIssue(clip);
    if (issue) return { ok: false, error: issue };
    if (clip.trackId !== track.id) return { ok: false, error: "unknown-track" };
    if (clipIds.has(clip.id)) return { ok: false, error: "duplicate-clip" };
    if (clips.some((other) => spansOverlap(other, clip))) return { ok: false, error: "overlap" };
    clipIds.add(clip.id);
    clips.push(clip);
  }
  return { ok: true, value: { ...composition, tracks: [...composition.tracks, { ...track, clips }] } };
}

/** adds one clip to its track (the span must be free, the ids fresh, the catalogs satisfied). */
export function addClip(composition: VideoComposition, clip: CompositionClip): CompositionOutcome<VideoComposition> {
  const issue = clipIssue(clip);
  if (issue) return { ok: false, error: issue };
  const track = composition.tracks.find((existing) => existing.id === clip.trackId);
  if (!track) return { ok: false, error: "unknown-track" };
  const duplicate =
    clip.id.length === 0 ||
    composition.tracks.some((existing) => existing.clips.some((other) => other.id === clip.id));
  if (duplicate) return { ok: false, error: "duplicate-clip" };
  if (track.clips.some((other) => spansOverlap(other, clip))) return { ok: false, error: "overlap" };
  return {
    ok: true,
    value: {
      ...composition,
      tracks: composition.tracks.map((existing) =>
        existing.id === track.id ? { ...existing, clips: [...existing.clips, clip] } : existing,
      ),
    },
  };
}

/** serializes one clip to its plain json shape (fixed key order — the format IS the order). */
function clipToJson(clip: CompositionClip): Record<string, unknown> {
  const json: Record<string, unknown> = {
    id: clip.id,
    trackId: clip.trackId,
    startSeconds: clip.startSeconds,
    durationSeconds: clip.durationSeconds,
    sourceIn: clip.sourceIn,
    speed: clip.speed,
    effects: clip.effects.map((effect) => ({ effectId: effect.effectId, amount: effect.amount, enabled: effect.enabled })),
  };
  if (clip.transition !== undefined)
    json.transition = { name: clip.transition.name, durationSeconds: clip.transition.durationSeconds };
  return json;
}

/** the plain json shape of the whole document (deterministic — byte-stable for one document). */
export function compositionJson(composition: VideoComposition): Record<string, unknown> {
  return {
    id: composition.id,
    name: composition.name,
    fps: composition.fps,
    width: composition.width,
    height: composition.height,
    tracks: composition.tracks.map((track) => ({
      id: track.id,
      kind: track.kind,
      clips: track.clips.map(clipToJson),
    })),
  };
}

/** the serialized payload of a composition — the structured bytes the family transports. */
export function serializeComposition(composition: VideoComposition): string {
  return JSON.stringify(compositionJson(composition));
}

/** the sha-256 of the serialized payload — the identity the render lane dedupes by. */
export function compositionFingerprint(composition: VideoComposition): string {
  return createHash("sha256").update(serializeComposition(composition), "utf8").digest("hex");
}

/**
 * Parses a serialized payload back into a composition: json damage answers
 * bad-format, and every document rule is validated again on the way in —
 * a payload that skips the rules is refused no matter who wrote it.
 */
export function parseComposition(payload: string): CompositionOutcome<VideoComposition> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return { ok: false, error: "bad-format" };
  }
  if (typeof parsed !== "object" || parsed === null) return { ok: false, error: "bad-format" };
  const candidate = parsed as VideoComposition;
  const issue = documentIssue(candidate);
  if (issue) return { ok: false, error: issue };
  return { ok: true, value: candidate };
}

/**
 * The Saddle render plan of a composition: the sliced-render planner cuts
 * the composition duration into frame-aligned slices (the doctrine's ten
 * second grid by default), so the edge farm rasterizes in parallel over
 * the standard transport and the preview equals the final artifact — the
 * visitor GPU is never part of the render lane.
 */
export function compositionSlicePlan(composition: VideoComposition, sliceSeconds = 10): readonly RenderSlice[] {
  return planSlices({
    durationSeconds: compositionDurationSeconds(composition),
    fps: composition.fps,
    sliceSeconds,
  });
}
