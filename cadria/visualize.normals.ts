// # visualize.normals — geometry math for the visualize library: face and vertex
// normals plus bounding-box helpers. Pure TypeScript over typed arrays, shared by
// the exporters and the facade; no canvas, no DOM, no dependencies.
import type { MeshGeometry, Vec3 } from "./visualize.mesh.ts";

/**
 * Unit normal of one counter-clockwise triangle, read from the interleaved vertex
 * buffer. Returns null for degenerate (zero-area) faces so callers can skip them.
 */
export function faceNormal(vertices: Float32Array, a: number, b: number, c: number): Vec3 | null {
  const ax = vertices[a * 3];
  const ay = vertices[a * 3 + 1];
  const az = vertices[a * 3 + 2];
  const bx = vertices[b * 3] - ax;
  const by = vertices[b * 3 + 1] - ay;
  const bz = vertices[b * 3 + 2] - az;
  const cx = vertices[c * 3] - ax;
  const cy = vertices[c * 3 + 1] - ay;
  const cz = vertices[c * 3 + 2] - az;
  const nx = by * cz - bz * cy;
  const ny = bz * cx - bx * cz;
  const nz = bx * cy - by * cx;
  const length = Math.hypot(nx, ny, nz);
  if (length < 1e-12) return null;
  return [nx / length, ny / length, nz / length];
}

/**
 * Per-vertex normals: the normalized average of the unit normals of the faces
 * adjacent to each vertex. Isolated vertices (every surrounding triangle carved
 * away by minHeight) fall back to the heightmap plane normal [0, 0, 1].
 * Returns 3 floats per vertex, same order as the vertex buffer.
 */
export function vertexNormals(geometry: MeshGeometry): Float32Array {
  const { vertices, indices } = geometry;
  const normals = new Float32Array(vertices.length);
  for (let face = 0; face < indices.length; face += 3) {
    const normal = faceNormal(vertices, indices[face], indices[face + 1], indices[face + 2]);
    if (!normal) continue;
    for (let corner = 0; corner < 3; corner++) {
      const offset = indices[face + corner] * 3;
      normals[offset] += normal[0];
      normals[offset + 1] += normal[1];
      normals[offset + 2] += normal[2];
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

/** axis-aligned bounding box of a vertex cloud (zero box for empty input). */
export function boundingBox(vertices: Float32Array): { min: Vec3; max: Vec3; size: Vec3 } {
  const min: Vec3 = [0, 0, 0];
  const max: Vec3 = [0, 0, 0];
  for (let offset = 0; offset < vertices.length; offset += 3) {
    for (let axis = 0; axis < 3; axis++) {
      const value = vertices[offset + axis];
      if (offset === 0 || value < min[axis]) min[axis] = value;
      if (offset === 0 || value > max[axis]) max[axis] = value;
    }
  }
  return { min, max, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] };
}

/**
 * Uniform scale factor that fits the mesh's longest bounding-box side to `target`
 * (default 1); returns 1 for degenerate or empty meshes.
 */
export function normalizedScale(vertices: Float32Array, target = 1): number {
  const { size } = boundingBox(vertices);
  const longest = Math.max(size[0], size[1], size[2]);
  return longest > 1e-12 ? target / longest : 1;
}
