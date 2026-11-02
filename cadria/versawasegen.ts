// # versawasegen — the procedural mesh generator of the versawase engine:
// pure TypeScript functions that build real geometry — uv sphere, torus,
// noise terrain and polygon extrusion — answering the {positions, normals,
// uvs, indices} buffer set every consumer of the family 3d lane speaks.
// The primitives carry the modifier stack the engine doctrine records
// (twist, belly, subdivision) as pure whole-mesh transforms, and every
// generator composes on one honest audit (validateMesh) instead of hoping
// the buffers are well formed. Zero dependencies, zero DOM, zero GL: the
// same calls run in node (the tests), in the browser viewport
// (versawase3d mounts the buffers) and inside a Saddle render lane
// (software rasterization never touches the visitor GPU). Coordinates are
// y-up to match the three.js space the 3d viewport mounts; winding is
// counter-clockwise seen from outside, so front faces point away from the
// solid. The noise floor is a deterministic integer-hash value noise with
// quintic fade and fractal octaves — the terrain height is real
// mathematics, never a canned table.

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
