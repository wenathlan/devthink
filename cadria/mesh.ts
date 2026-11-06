// # mesh — the mesh generator seat of the versawaze engine, housed at the
// cadria root beside versa.ts and shaders.ts. The engine doctrine keeps one
// owner per domain: versawase.ts (the versawasegen section) already owns the
// uv sphere, the torus, the noise terrain, the polygon extrusion and the
// modifier stack (twist, belly, subdivision) plus the deterministic noise
// floor — so this seat re-exports every one of those instead of duplicating
// a single line, and adds the geometry that was missing: the per-face box,
// the xz plane grid, the cylinder/cone family with analytic side normals and
// optional caps, the closed capsule over a lathe profile, the subdivided
// icosphere, the general parametric surface (any f(u, v) → xyz with
// finite-difference normals), the merge (one buffer set from many) and the
// matrix transform (versa.ts mat4 on the positions, the inverse-transpose
// normal matrix on the normals). Every builder answers the GeneratedMesh
// buffer set ({positions, normals, uvs, indices, counts}) — y-up,
// counter-clockwise seen from outside, radians/units documented per builder —
// and every builder composes on the honest audit (validateMesh). Pure
// TypeScript, zero DOM, zero GL: the same calls run in node, in the
// versawase3d viewport and inside a Saddle render lane (software geometry,
// never the visitor GPU). Errors throw the typed MeshGenError of the meshgen
// doctrine (re-exported). Exports: 7 new interfaces/options, 9 new builders
// and tools, 21 re-exports — the honest count for this theme.

import {
  type ExtrusionOptions,
  type FbmOptions,
  type GeneratedMesh,
  type MeshValidation,
  type SphereOptions,
  type TerrainOptions,
  type TorusOptions,
  type Vec2,
  MeshGenError,
  averageNormals,
  fbmNoise2,
  generateExtrusion,
  generateSphere,
  generateTerrain,
  generateTorus,
  hashNoise2,
  subdivideMesh,
  validateMesh,
  valueNoise2,
  bellyMesh,
  twistMesh,
} from "./versawase.ts";
import { type Mat4, type Vec3, mat3normalfrommat4, mat4transformpoint } from "./versa.ts";

// ---------------------------------------------------------------------------
// the versawasegen re-exports — one owner, many call sites, zero duplication
// ---------------------------------------------------------------------------

export {
  type ExtrusionOptions,
  type FbmOptions,
  type GeneratedMesh,
  type MeshValidation,
  type SphereOptions,
  type TerrainOptions,
  type TorusOptions,
  type Vec2,
  MeshGenError,
  averageNormals,
  bellyMesh,
  fbmNoise2,
  generateExtrusion,
  generateSphere,
  generateTerrain,
  generateTorus,
  hashNoise2,
  subdivideMesh,
  twistMesh,
  validateMesh,
  valueNoise2,
};

// ---------------------------------------------------------------------------
// shared builder plumbing
// ---------------------------------------------------------------------------

/** one buffer accumulator: builders push vertices/normals/uvs/indices and
 * freeze the answer into a GeneratedMesh. */
class MeshBuilder {
  private positions: number[] = [];
  private normals: number[] = [];
  private uvs: number[] = [];
  private indices: number[] = [];

  /** one vertex; answers its index. */
  vertex(position: Vec3, normal: Vec3, u: number, v: number): number {
    this.positions.push(position[0], position[1], position[2]);
    this.normals.push(normal[0], normal[1], normal[2]);
    this.uvs.push(u, v);
    return this.positions.length / 3 - 1;
  }

  /** one triangle by vertex indices. */
  triangle(a: number, b: number, c: number): void {
    this.indices.push(a, b, c);
  }

  /** one quad as two triangles (a, b, c) (a, c, d) — the winding the caller
   * chose, no silent flip. */
  quad(a: number, b: number, c: number, d: number): void {
    this.indices.push(a, b, c, a, c, d);
  }

  /** freezes the accumulated buffers into the GeneratedMesh answer. */
  build(): GeneratedMesh {
    const positions = new Float32Array(this.positions);
    const normals = new Float32Array(this.normals);
    const uvs = new Float32Array(this.uvs);
    const indices = new Uint32Array(this.indices);
    return {
      positions,
      normals,
      uvs,
      indices,
      counts: { vertices: positions.length / 3, triangles: indices.length / 3 },
    };
  }
}

/** guards one positive-integer option with its honest name. */
function positiveInt(value: number | undefined, fallback: number, name: string): number {
  const resolved = value ?? fallback;
  if (!Number.isInteger(resolved) || resolved < 1) throw new MeshGenError(`mesh: ${name} must be an integer >= 1, got ${String(value)}`);
  return resolved;
}

/** guards one positive-finite option with its honest name. */
function positiveNumber(value: number | undefined, fallback: number, name: string): number {
  const resolved = value ?? fallback;
  if (!Number.isFinite(resolved) || resolved <= 0) throw new MeshGenError(`mesh: ${name} must be a finite number > 0, got ${String(value)}`);
  return resolved;
}

/** guards one non-negative-finite option with its honest name. */
function nonNegativeNumber(value: number | undefined, fallback: number, name: string): number {
  const resolved = value ?? fallback;
  if (!Number.isFinite(resolved) || resolved < 0) throw new MeshGenError(`mesh: ${name} must be a finite number >= 0, got ${String(value)}`);
  return resolved;
}

// ---------------------------------------------------------------------------
// primitive: the box (per-face vertices, per-face normals)
// ---------------------------------------------------------------------------

/** the box options; every field carries an engine default. */
export interface BoxOptions {
  /** full width along x (default 1, kept > 0). */
  width?: number;
  /** full height along y (default 1, kept > 0). */
  height?: number;
  /** full depth along z (default 1, kept > 0). */
  depth?: number;
}

/**
 * The box: 24 vertices (4 per face — hard corners stay crisp because the
 * normals never average), 12 triangles, per-face unit normals and 0..1 uvs
 * per face. Counter-clockwise from outside, centered at the origin, y-up.
 */
export function generateBox(options: BoxOptions = {}): GeneratedMesh {
  const width = positiveNumber(options.width, 1, "width");
  const height = positiveNumber(options.height, 1, "height");
  const depth = positiveNumber(options.depth, 1, "depth");
  const hx = width / 2;
  const hy = height / 2;
  const hz = depth / 2;
  const builder = new MeshBuilder();
  // one row per face: the four corners counter-clockwise seen from outside.
  const faces: { corners: Vec3[]; normal: Vec3 }[] = [
    {
      corners: [
        [hx, -hy, hz],
        [hx, -hy, -hz],
        [hx, hy, -hz],
        [hx, hy, hz],
      ],
      normal: [1, 0, 0],
    },
    {
      corners: [
        [-hx, -hy, -hz],
        [-hx, -hy, hz],
        [-hx, hy, hz],
        [-hx, hy, -hz],
      ],
      normal: [-1, 0, 0],
    },
    {
      corners: [
        [-hx, hy, hz],
        [hx, hy, hz],
        [hx, hy, -hz],
        [-hx, hy, -hz],
      ],
      normal: [0, 1, 0],
    },
    {
      corners: [
        [-hx, -hy, -hz],
        [hx, -hy, -hz],
        [hx, -hy, hz],
        [-hx, -hy, hz],
      ],
      normal: [0, -1, 0],
    },
    {
      corners: [
        [-hx, -hy, hz],
        [hx, -hy, hz],
        [hx, hy, hz],
        [-hx, hy, hz],
      ],
      normal: [0, 0, 1],
    },
    {
      corners: [
        [hx, -hy, -hz],
        [-hx, -hy, -hz],
        [-hx, hy, -hz],
        [hx, hy, -hz],
      ],
      normal: [0, 0, -1],
    },
  ];
  const faceUvs: [number, number][] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  for (const face of faces) {
    const base = [
      builder.vertex(face.corners[0], face.normal, faceUvs[0][0], faceUvs[0][1]),
      builder.vertex(face.corners[1], face.normal, faceUvs[1][0], faceUvs[1][1]),
      builder.vertex(face.corners[2], face.normal, faceUvs[2][0], faceUvs[2][1]),
      builder.vertex(face.corners[3], face.normal, faceUvs[3][0], faceUvs[3][1]),
    ];
    builder.quad(base[0], base[1], base[2], base[3]);
  }
  return builder.build();
}

// ---------------------------------------------------------------------------
// primitive: the xz plane grid
// ---------------------------------------------------------------------------

/** the plane options; every field carries an engine default. */
export interface PlaneOptions {
  /** full extent along x (default 1, kept > 0). */
  width?: number;
  /** full extent along z (default 1, kept > 0). */
  depth?: number;
  /** x subdivisions — vertex columns minus one (default 1, kept >= 1). */
  segmentsX?: number;
  /** z subdivisions — vertex rows minus one (default 1, kept >= 1). */
  segmentsZ?: number;
}

/**
 * The plane grid on y = 0: (segmentsX + 1) x (segmentsZ + 1) vertices, 2 *
 * segmentsX * segmentsZ triangles, the +y unit normal everywhere, uvs over
 * the full 0..1 square. Centered at the origin, x growing with u, z with v.
 */
export function generatePlane(options: PlaneOptions = {}): GeneratedMesh {
  const width = positiveNumber(options.width, 1, "width");
  const depth = positiveNumber(options.depth, 1, "depth");
  const segmentsX = positiveInt(options.segmentsX, 1, "segmentsX");
  const segmentsZ = positiveInt(options.segmentsZ, 1, "segmentsZ");
  const builder = new MeshBuilder();
  const grid: number[][] = [];
  for (let row = 0; row <= segmentsZ; row += 1) {
    const v = segmentsZ > 0 ? row / segmentsZ : 0;
    const z = -depth / 2 + depth * v;
    grid[row] = [];
    for (let column = 0; column <= segmentsX; column += 1) {
      const u = segmentsX > 0 ? column / segmentsX : 0;
      const x = -width / 2 + width * u;
      grid[row][column] = builder.vertex([x, 0, z], [0, 1, 0], u, v);
    }
  }
  for (let row = 0; row < segmentsZ; row += 1) {
    for (let column = 0; column < segmentsX; column += 1) {
      const a = grid[row][column];
      const b = grid[row][column + 1];
      const c = grid[row + 1][column];
      const d = grid[row + 1][column + 1];
      builder.quad(a, b, d, c);
    }
  }
  return builder.build();
}

// ---------------------------------------------------------------------------
// primitive: the cylinder / cone family (analytic side normals, optional caps)
// ---------------------------------------------------------------------------

/** the cylinder options; every field carries an engine default. */
export interface CylinderOptions {
  /** the radius at the top ring (default 1; 0 collapses the ring into an
   * apex — that is the cone). */
  radiusTop?: number;
  /** the radius at the bottom ring (default 1; kept > 0 — the base). */
  radiusBottom?: number;
  /** full height along y (default 1, kept > 0). */
  height?: number;
  /** radial subdivisions (default 16, kept >= 3). */
  radialSegments?: number;
  /** height subdivisions — extra side rings (default 1, kept >= 1). */
  heightSegments?: number;
  /** whether the end caps ride along (default true). */
  caps?: boolean;
}

/**
 * The cylinder family: side quads between the bottom and top rings with
 * analytic side normals — n = normalize((r cosθ, −r′ r, r sinθ)) with r′ the
 * radius slope, exact for the cone tilt — plus optional triangle-fan caps
 * with their own ±y normals. radiusTop 0 emits one apex vertex instead of a
 * collapsed ring (no degenerate triangles), which is the honest cone. The
 * seam column is duplicated so the uv wrap stays continuous: vertex count
 * (heightSegments + 1) * (radialSegments + 1) + caps.
 */
export function generateCylinder(options: CylinderOptions = {}): GeneratedMesh {
  const radiusTop = nonNegativeNumber(options.radiusTop, 1, "radiusTop");
  const radiusBottom = positiveNumber(options.radiusBottom, 1, "radiusBottom");
  const height = positiveNumber(options.height, 1, "height");
  const radialSegments = Math.max(3, positiveInt(options.radialSegments, 16, "radialSegments"));
  const heightSegments = positiveInt(options.heightSegments, 1, "heightSegments");
  const caps = options.caps ?? true;
  if (radiusTop < 1e-9 && radiusBottom < 1e-9)
    throw new MeshGenError("mesh: a cylinder needs at least one positive ring radius");
  const apexTop = radiusTop < 1e-9;
  const builder = new MeshBuilder();
  const slope = (radiusTop - radiusBottom) / height;
  const ringAt = (radius: number, y: number, columns: number): number[] => {
    const ids: number[] = [];
    for (let column = 0; column <= columns; column += 1) {
      const theta = (2 * Math.PI * column) / columns;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      const position: Vec3 = [radius * cos, y, radius * sin];
      const normal: Vec3 = [cos, -slope, sin];
      const length = Math.hypot(normal[0], normal[1], normal[2]);
      const unit: Vec3 = [normal[0] / length, normal[1] / length, normal[2] / length];
      ids.push(builder.vertex(position, unit, column / columns, y / height + 0.5));
    }
    return ids;
  };
  const rows: number[][] = [];
  for (let ring = 0; ring <= heightSegments; ring += 1) {
    const t = heightSegments > 0 ? ring / heightSegments : 0;
    const y = -height / 2 + height * t;
    const radius = radiusBottom + (radiusTop - radiusBottom) * t;
    rows.push(apexTop && ring === heightSegments ? [apexVertex(builder, y, slope)] : ringAt(radius, y, radialSegments));
  }
  for (let ring = 0; ring < heightSegments; ring += 1) {
    const lower = rows[ring];
    const upper = rows[ring + 1];
    const lowerApex = lower.length === 1;
    const upperApex = upper.length === 1;
    if (lowerApex || upperApex) {
      // one ring is an apex: each column rides a single triangle. the apex
      // below the ring mirrors the apex above it, so the winding mirrors
      // with it — both stay counter-clockwise from outside.
      const apexRow = lowerApex ? lower : upper;
      const ringRow = lowerApex ? upper : lower;
      for (let column = 0; column < radialSegments; column += 1) {
        const a = ringRow[column];
        const b = ringRow[column + 1];
        if (lowerApex) builder.triangle(apexRow[0], a, b);
        else builder.triangle(a, apexRow[0], b);
      }
      continue;
    }
    for (let column = 0; column < radialSegments; column += 1) {
      const a = lower[column];
      const b = lower[column + 1];
      const c = upper[column];
      const d = upper[column + 1];
      builder.triangle(a, c, b);
      builder.triangle(b, c, d);
    }
  }
  if (caps && !apexTop) {
    const ring = rows[heightSegments];
    const center = builder.vertex([0, height / 2, 0], [0, 1, 0], 0.5, 0.5);
    for (let column = 0; column < radialSegments; column += 1)
      builder.triangle(center, ring[column + 1], ring[column]);
  }
  if (caps && radiusBottom >= 1e-9) {
    const ring = rows[0];
    const center = builder.vertex([0, -height / 2, 0], [0, -1, 0], 0.5, 0.5);
    for (let column = 0; column < radialSegments; column += 1)
      builder.triangle(center, ring[column], ring[column + 1]);
  }
  return builder.build();
}

/** the apex vertex of a collapsed ring: the position on the axis with the
 * axis side normal — the average of the ring normals, the honest single
 * answer for a collapsed seam. */
function apexVertex(builder: MeshBuilder, y: number, slope: number): number {
  const normal: Vec3 = [0, -slope, 0];
  const length = Math.hypot(normal[0], normal[1], normal[2]);
  const unit: Vec3 = length > 1e-12 ? [0, normal[1] / length, 0] : [0, 1, 0];
  return builder.vertex([0, y, 0], unit, 0.5, 1);
}

/** the cone options; every field carries an engine default. */
export interface ConeOptions {
  /** the base radius (default 1, kept > 0). */
  radius?: number;
  /** full height along y (default 1, kept > 0). */
  height?: number;
  /** radial subdivisions (default 16, kept >= 3). */
  radialSegments?: number;
  /** whether the base cap rides along (default true). */
  caps?: boolean;
}

/** The cone: the cylinder family with the top ring collapsed to the apex —
 * one apex vertex, side triangles only, the base cap optional. */
export function generateCone(options: ConeOptions = {}): GeneratedMesh {
  const radius = positiveNumber(options.radius, 1, "radius");
  const height = positiveNumber(options.height, 1, "height");
  const radialSegments = Math.max(3, positiveInt(options.radialSegments, 16, "radialSegments"));
  return generateCylinder({
    radiusTop: 0,
    radiusBottom: radius,
    height,
    radialSegments,
    heightSegments: 1,
    caps: options.caps ?? true,
  });
}

// ---------------------------------------------------------------------------
// primitive: the capsule (lathe profile: hemisphere + shaft + hemisphere)
// ---------------------------------------------------------------------------

/** the capsule options; every field carries an engine default. */
export interface CapsuleOptions {
  /** the radius of the caps and the shaft (default 0.5, kept > 0). */
  radius?: number;
  /** the length of the cylindrical shaft between the caps (default 1, kept
   * >= 0 — 0 is the cusp sphere pair). */
  length?: number;
  /** radial subdivisions around y (default 16, kept >= 3). */
  radialSegments?: number;
  /** latitude subdivisions per hemisphere (default 4, kept >= 1). */
  capSegments?: number;
}

/**
 * The closed capsule: a lathe of the silhouette (bottom hemisphere through
 * the shaft to the top hemisphere) revolved around y. Poles collapse into
 * single vertices, ring normals are analytic ((cosφ cosθ, sinφ, cosφ sinθ)
 * on the caps, (cosθ, 0, sinθ) on the shaft) and the v coordinate walks the
 * profile arc. No caps to stitch — the profile is already closed.
 */
export function generateCapsule(options: CapsuleOptions = {}): GeneratedMesh {
  const radius = positiveNumber(options.radius, 0.5, "radius");
  const length = nonNegativeNumber(options.length, 1, "length");
  const radialSegments = Math.max(3, positiveInt(options.radialSegments, 16, "radialSegments"));
  const capSegments = positiveInt(options.capSegments, 4, "capSegments");
  const half = length / 2;
  // the silhouette profile: (radius, y, normal φ) rows from bottom pole to top pole.
  const profile: { r: number; y: number; phi: number }[] = [];
  for (let step = 0; step <= capSegments; step += 1) {
    const phi = -Math.PI / 2 + (Math.PI / 2) * (step / capSegments);
    profile.push({ r: radius * Math.cos(phi), y: -half + radius * Math.sin(phi), phi });
  }
  for (let step = 0; step <= capSegments; step += 1) {
    const phi = (Math.PI / 2) * (step / capSegments);
    profile.push({ r: radius * Math.cos(phi), y: half + radius * Math.sin(phi), phi });
  }
  const builder = new MeshBuilder();
  const rows: number[][] = [];
  for (const point of profile) {
    const pole = point.r < 1e-9;
    const ring: number[] = [];
    if (pole) {
      const normal: Vec3 = [0, Math.sin(point.phi), 0];
      ring.push(builder.vertex([0, point.y, 0], normal, 0.5, 0));
      rows.push(ring);
      continue;
    }
    for (let column = 0; column <= radialSegments; column += 1) {
      const theta = (2 * Math.PI * column) / radialSegments;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      const cosPhi = Math.cos(point.phi);
      const position: Vec3 = [point.r * cos, point.y, point.r * sin];
      const normal: Vec3 = [cosPhi * cos, Math.sin(point.phi), cosPhi * sin];
      ring.push(builder.vertex(position, normal, column / radialSegments, 0));
    }
    rows.push(ring);
  }
  const vAt = (row: number): number => row / (rows.length - 1);
  for (let row = 0; row < rows.length - 1; row += 1) {
    const lower = rows[row];
    const upper = rows[row + 1];
    const lowerPole = lower.length === 1;
    const upperPole = upper.length === 1;
    if (lowerPole || upperPole) {
      // a pole row carries one vertex: each column rides a single triangle,
      // the winding mirrored between the bottom pole and the top pole so
      // both stay counter-clockwise from outside.
      const apexRow = lowerPole ? lower : upper;
      const ringRow = lowerPole ? upper : lower;
      for (let column = 0; column < radialSegments; column += 1) {
        const a = ringRow[column];
        const b = ringRow[column + 1];
        if (lowerPole) builder.triangle(apexRow[0], a, b);
        else builder.triangle(a, apexRow[0], b);
      }
      continue;
    }
    for (let column = 0; column < radialSegments; column += 1) {
      const a = lower[column];
      const b = lower[column + 1];
      const c = upper[column];
      const d = upper[column + 1];
      builder.triangle(a, c, b);
      builder.triangle(b, c, d);
    }
  }
  // the honest v of every vertex: the profile row walk, pole rows included.
  const answer = builder.build();
  for (let row = 0; row < rows.length; row += 1) {
    for (const vertexId of rows[row]) answer.uvs[vertexId * 2 + 1] = vAt(row);
  }
  return answer;
}

// ---------------------------------------------------------------------------
// primitive: the icosphere (subdivided icosahedron, welded midpoints)
// ---------------------------------------------------------------------------

/** the icosphere options; every field carries an engine default. */
export interface IcosphereOptions {
  /** radius in scene units (default 1, kept > 0). */
  radius?: number;
  /** subdivision level 0..4 (default 1: 42 vertices, 80 faces). */
  subdivisions?: number;
}

/**
 * The icosphere: the 12-vertex icosahedron subdivided with welded midpoints
 * (every midpoint shared by its two faces — the cache keys on the sorted
 * vertex pair), every vertex normalized onto the radius so the normals are
 * exact (the normalized position — a sphere property). Vertex count
 * 10 * 4^subdivisions + 2, face count 20 * 4^subdivisions. The uvs ride the
 * spherical mapping of the welded vertices (the seam is interpolated across
 * the wrap triangle — the honest price of the weld, documented here).
 */
export function generateIcosphere(options: IcosphereOptions = {}): GeneratedMesh {
  const radius = positiveNumber(options.radius, 1, "radius");
  const subdivisions = Math.min(4, Math.max(0, Math.round(options.subdivisions ?? 1)));
  const t = (1 + Math.sqrt(5)) / 2;
  const base: Vec3[] = [
    [-1, t, 0],
    [1, t, 0],
    [-1, -t, 0],
    [1, -t, 0],
    [0, -1, t],
    [0, 1, t],
    [0, -1, -t],
    [0, 1, -t],
    [t, 0, -1],
    [t, 0, 1],
    [-t, 0, -1],
    [-t, 0, 1],
  ];
  const positions: Vec3[] = base.map((point) => {
    const length = Math.hypot(point[0], point[1], point[2]);
    return [(radius * point[0]) / length, (radius * point[1]) / length, (radius * point[2]) / length] as Vec3;
  });
  let faces: [number, number, number][] = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ];
  const midpointCache = new Map<string, number>();
  const midpoint = (a: number, b: number): number => {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    const cached = midpointCache.get(key);
    if (cached !== undefined) return cached;
    const pa = positions[a];
    const pb = positions[b];
    const mid: Vec3 = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2, (pa[2] + pb[2]) / 2];
    const length = Math.hypot(mid[0], mid[1], mid[2]);
    const onSphere: Vec3 = [(radius * mid[0]) / length, (radius * mid[1]) / length, (radius * mid[2]) / length];
    positions.push(onSphere);
    const id = positions.length - 1;
    midpointCache.set(key, id);
    return id;
  };
  for (let level = 0; level < subdivisions; level += 1) {
    const next: [number, number, number][] = [];
    for (const [a, b, c] of faces) {
      const ab = midpoint(a, b);
      const bc = midpoint(b, c);
      const ca = midpoint(c, a);
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = next;
  }
  const builder = new MeshBuilder();
  const normals: Vec3[] = positions.map((point) => {
    const length = Math.hypot(point[0], point[1], point[2]);
    return [point[0] / length, point[1] / length, point[2] / length] as Vec3;
  });
  const vertexIds = positions.map((point, at) => {
    const u = Math.atan2(point[2], point[0]) / (2 * Math.PI) + 0.5;
    const v = Math.asin(Math.min(1, Math.max(-1, point[1] / radius))) / Math.PI + 0.5;
    return builder.vertex(point, normals[at], u, v);
  });
  for (const [a, b, c] of faces) builder.triangle(vertexIds[a], vertexIds[b], vertexIds[c]);
  return builder.build();
}

// ---------------------------------------------------------------------------
// the general parametric surface
// ---------------------------------------------------------------------------

/** one parametric surface map f(u, v) → xyz (the caller's mathematics). */
export type SurfaceMap = (u: number, v: number) => Vec3;

/** the parametric surface options; every field carries an engine default. */
export interface ParametricOptions {
  /** the u range (default [0, 1] — u1 must exceed u0). */
  uRange?: [number, number];
  /** the v range (default [0, 1] — v1 must exceed v0). */
  vRange?: [number, number];
  /** u subdivisions — vertex columns minus one (default 16, kept >= 1). */
  segmentsU?: number;
  /** v subdivisions — vertex rows minus one (default 16, kept >= 1). */
  segmentsV?: number;
  /** flip the normals and the winding (default false). */
  flip?: boolean;
}

/**
 * The general parametric surface: (segmentsU + 1) x (segmentsV + 1) samples
 * of the caller's f(u, v), normals from the central finite differences of
 * the map — n = normalize(∂u × ∂v) — with one-sided differences at the
 * borders, the face-averaged fallback (averageNormals, single-sourced from
 * versawasegen) when the map degenerates at a sample, and the uv grid the
 * parametrization itself names. Non-finite map answers throw MeshGenError —
 * the honest refusal, never a silent NaN.
 */
export function parametricsurface(map: SurfaceMap, options: ParametricOptions = {}): GeneratedMesh {
  if (typeof map !== "function") throw new MeshGenError("mesh: the parametric surface needs a map function");
  const [u0, u1] = options.uRange ?? [0, 1];
  const [v0, v1] = options.vRange ?? [0, 1];
  if (!(u1 > u0)) throw new MeshGenError(`mesh: the u range must grow, got [${u0}, ${u1}]`);
  if (!(v1 > v0)) throw new MeshGenError(`mesh: the v range must grow, got [${v0}, ${v1}]`);
  const segmentsU = positiveInt(options.segmentsU, 16, "segmentsU");
  const segmentsV = positiveInt(options.segmentsV, 16, "segmentsV");
  const flip = options.flip ?? false;
  const sample = (u: number, v: number): Vec3 => {
    const point = map(u, v);
    if (!Array.isArray(point) || point.length !== 3 || point.some((axis) => !Number.isFinite(axis)))
      throw new MeshGenError(`mesh: the map answered a non-finite point at (u=${u}, v=${v})`);
    return [point[0], point[1], point[2]];
  };
  const du = (u1 - u0) / segmentsU;
  const dv = (v1 - v0) / segmentsV;
  const positions: Vec3[] = [];
  const normals: Vec3[] = [];
  for (let row = 0; row <= segmentsV; row += 1) {
    const v = v0 + dv * row;
    for (let column = 0; column <= segmentsU; column += 1) {
      const u = u0 + du * column;
      positions.push(sample(u, v));
      // central differences, one-sided at the borders.
      const uMinus = u - du >= u0 ? u - du : u;
      const uPlus = u + du <= u1 ? u + du : u;
      const vMinus = v - dv >= v0 ? v - dv : v;
      const vPlus = v + dv <= v1 ? v + dv : v;
      const pu = sample(uPlus, v);
      const pm = sample(uMinus, v);
      const pv = sample(u, vPlus);
      const pw = sample(u, vMinus);
      const tangentU: Vec3 = [pu[0] - pm[0], pu[1] - pm[1], pu[2] - pm[2]];
      const tangentV: Vec3 = [pv[0] - pw[0], pv[1] - pw[1], pv[2] - pw[2]];
      let normal: Vec3 | null = crossUnit(tangentU, tangentV);
      if (!normal) normal = crossUnit(tangentV, tangentU);
      if (!normal) normal = [0, 0, 0]; // the averaged fallback fills it below
      normals.push(flip ? [-normal[0], -normal[1], -normal[2]] : normal);
    }
  }
  const builder = new MeshBuilder();
  const grid: number[][] = [];
  for (let row = 0; row <= segmentsV; row += 1) {
    grid[row] = [];
    for (let column = 0; column <= segmentsU; column += 1) {
      const at = row * (segmentsU + 1) + column;
      grid[row][column] = builder.vertex(positions[at], normals[at], column / segmentsU, row / segmentsV);
    }
  }
  for (let row = 0; row < segmentsV; row += 1) {
    for (let column = 0; column < segmentsU; column += 1) {
      const a = grid[row][column];
      const b = grid[row][column + 1];
      const c = grid[row + 1][column];
      const d = grid[row + 1][column + 1];
      if (flip) builder.quad(a, c, d, b);
      else builder.quad(a, b, d, c);
    }
  }
  const answer = builder.build();
  // the degenerate-sample fallback: face-averaged normals (single-sourced).
  let needsFallback = false;
  for (let at = 0; at < normals.length; at += 1) {
    if (normals[at][0] === 0 && normals[at][1] === 0 && normals[at][2] === 0) needsFallback = true;
  }
  if (needsFallback) {
    const averaged = averageNormals(answer.positions, answer.indices);
    for (let at = 0; at < normals.length; at += 1) {
      if (normals[at][0] === 0 && normals[at][1] === 0 && normals[at][2] === 0) {
        answer.normals[at * 3] = averaged[at * 3];
        answer.normals[at * 3 + 1] = averaged[at * 3 + 1];
        answer.normals[at * 3 + 2] = averaged[at * 3 + 2];
      }
    }
  }
  return answer;
}

/** the unit cross of two vectors, null when degenerate. */
function crossUnit(a: Vec3, b: Vec3): Vec3 | null {
  const cx = a[1] * b[2] - a[2] * b[1];
  const cy = a[2] * b[0] - a[0] * b[2];
  const cz = a[0] * b[1] - a[1] * b[0];
  const length = Math.hypot(cx, cy, cz);
  if (length < 1e-12) return null;
  return [cx / length, cy / length, cz / length];
}

// ---------------------------------------------------------------------------
// the mesh tools: merge, transform, bounds
// ---------------------------------------------------------------------------

/** merges many buffer sets into one (indices rebased by the vertex offset);
 * the uvs ride along untouched. An empty list refuses with MeshGenError. */
export function mergemeshes(meshes: readonly GeneratedMesh[]): GeneratedMesh {
  if (!Array.isArray(meshes) || meshes.length === 0) throw new MeshGenError("mesh: the merge needs at least one mesh");
  let vertexTotal = 0;
  let indexTotal = 0;
  for (const mesh of meshes) {
    vertexTotal += mesh.positions.length / 3;
    indexTotal += mesh.indices.length;
  }
  const positions = new Float32Array(vertexTotal * 3);
  const normals = new Float32Array(vertexTotal * 3);
  const uvs = new Float32Array(vertexTotal * 2);
  const indices = new Uint32Array(indexTotal);
  let vertexCursor = 0;
  let indexCursor = 0;
  for (const mesh of meshes) {
    positions.set(mesh.positions, vertexCursor * 3);
    normals.set(mesh.normals, vertexCursor * 3);
    uvs.set(mesh.uvs, vertexCursor * 2);
    for (let at = 0; at < mesh.indices.length; at += 1) indices[indexCursor + at] = mesh.indices[at] + vertexCursor;
    vertexCursor += mesh.positions.length / 3;
    indexCursor += mesh.indices.length;
  }
  return {
    positions,
    normals,
    uvs,
    indices,
    counts: { vertices: vertexTotal, triangles: indexTotal / 3 },
  };
}

/** transforms one mesh by a versa mat4: the positions ride the full
 * point transform (w-divide) and the normals ride the inverse-transpose
 * normal matrix, renormalized — the shader-law answer for non-uniform
 * scale. A singular transform refuses with MeshGenError. */
export function transformmesh(mesh: GeneratedMesh, matrix: Mat4): GeneratedMesh {
  const normalMatrix = mat3normalfrommat4(matrix);
  if (!normalMatrix) throw new MeshGenError("mesh: the transform is singular — no normal matrix exists");
  const positions = new Float32Array(mesh.positions.length);
  const normals = new Float32Array(mesh.normals.length);
  for (let vertex = 0; vertex < mesh.positions.length / 3; vertex += 1) {
    const at = vertex * 3;
    const point: Vec3 = [mesh.positions[at], mesh.positions[at + 1], mesh.positions[at + 2]];
    const moved = mat4transformpoint(matrix, point);
    if (!moved) throw new MeshGenError("mesh: a vertex projects onto the w = 0 plane of the transform");
    positions[at] = moved[0];
    positions[at + 1] = moved[1];
    positions[at + 2] = moved[2];
    const nx = mesh.normals[at];
    const ny = mesh.normals[at + 1];
    const nz = mesh.normals[at + 2];
    const tx = normalMatrix[0] * nx + normalMatrix[3] * ny + normalMatrix[6] * nz;
    const ty = normalMatrix[1] * nx + normalMatrix[4] * ny + normalMatrix[7] * nz;
    const tz = normalMatrix[2] * nx + normalMatrix[5] * ny + normalMatrix[8] * nz;
    const length = Math.hypot(tx, ty, tz);
    if (length < 1e-12) throw new MeshGenError("mesh: a normal collapsed under the transform");
    normals[at] = tx / length;
    normals[at + 1] = ty / length;
    normals[at + 2] = tz / length;
  }
  return {
    positions,
    normals,
    uvs: new Float32Array(mesh.uvs),
    indices: new Uint32Array(mesh.indices),
    counts: { ...mesh.counts },
  };
}

/** the axis-aligned bounds of one mesh: min/max xyz over the positions. */
export function meshbounds(mesh: GeneratedMesh): { min: Vec3; max: Vec3 } {
  const min: Vec3 = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  const max: Vec3 = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
  for (let at = 0; at < mesh.positions.length; at += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      const value = mesh.positions[at + axis];
      if (value < min[axis]) min[axis] = value;
      if (value > max[axis]) max[axis] = value;
    }
  }
  if (!Number.isFinite(min[0])) return { min: [0, 0, 0], max: [0, 0, 0] };
  return { min, max };
}
