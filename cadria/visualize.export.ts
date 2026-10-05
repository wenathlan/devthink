// # visualize.export — text and binary mesh exporters with zero dependencies:
// Wavefront OBJ (optional per-face normals, optional `v x y z r g b` vertex colors)
// and STL in ASCII and binary forms. Every function takes the plain geometry, so
// all three are fully testable in node without a canvas.
import type { MeshGeometry } from "./visualize.mesh.ts";
import { faceNormal, type Vec3 } from "./visualize.normals.ts";

/** OBJ export options. */
export interface ObjOptions {
  /** vertex colors normalized 0-1, 3 floats per vertex — emitted as `v x y z r g b` (optional). */
  colors?: Float32Array;
  /** emit one `vn` per face and wire `f v//vn` references (default false). */
  normals?: boolean;
}

/** fixed-decimal text for one coordinate (4 places, trailing zeros trimmed). */
function decimal(value: number): string {
  return String(Number(value.toFixed(4)));
}

/**
 * Wavefront OBJ text. The first line is always a `v ` vertex (no leading comment),
 * faces come after the vertices as `f a b c` (or `f a//n b//n c//n` with per-face
 * normals, `v x y z r g b` when colors are supplied). Degenerate faces are skipped.
 */
export function toObj(geometry: MeshGeometry, options: ObjOptions = {}): string {
  const { vertices, indices } = geometry;
  const lines: string[] = [];
  const colored = options.colors !== undefined;
  for (let vertex = 0; vertex < vertices.length / 3; vertex++) {
    const offset = vertex * 3;
    let line = `v ${decimal(vertices[offset])} ${decimal(vertices[offset + 1])} ${decimal(vertices[offset + 2])}`;
    if (colored && options.colors) {
      line += ` ${decimal(options.colors[offset])} ${decimal(options.colors[offset + 1])} ${decimal(options.colors[offset + 2])}`;
    }
    lines.push(line);
  }
  if (options.normals) {
    for (let face = 0; face < indices.length; face += 3) {
      const normal = faceNormal(vertices, indices[face], indices[face + 1], indices[face + 2]);
      const [nx, ny, nz]: Vec3 = normal ?? [0, 0, 0];
      lines.push(`vn ${decimal(nx)} ${decimal(ny)} ${decimal(nz)}`);
    }
  }
  let faceIndex = 0;
  for (let face = 0; face < indices.length; face += 3) {
    const a = indices[face] + 1;
    const b = indices[face + 1] + 1;
    const c = indices[face + 2] + 1;
    if (options.normals) {
      faceIndex++;
      lines.push(`f ${a}//${faceIndex} ${b}//${faceIndex} ${c}//${faceIndex}`);
    } else {
      lines.push(`f ${a} ${b} ${c}`);
    }
  }
  return lines.join("\n");
}

/** STL facet normal (zero vector for degenerate faces). */
function facetNormal(vertices: Float32Array, indices: Uint32Array, face: number): Vec3 {
  return faceNormal(vertices, indices[face], indices[face + 1], indices[face + 2]) ?? [0, 0, 0];
}

/** STL ASCII: one `facet normal` block per triangle, wrapped in a `solid`. */
export function toStlAscii(geometry: MeshGeometry): string {
  const { vertices, indices } = geometry;
  const lines: string[] = ["solid cadria-visualize"];
  for (let face = 0; face < indices.length; face += 3) {
    const [nx, ny, nz] = facetNormal(vertices, indices, face);
    lines.push(`  facet normal ${decimal(nx)} ${decimal(ny)} ${decimal(nz)}`);
    lines.push("    outer loop");
    for (let corner = 0; corner < 3; corner++) {
      const offset = indices[face + corner] * 3;
      lines.push(`      vertex ${decimal(vertices[offset])} ${decimal(vertices[offset + 1])} ${decimal(vertices[offset + 2])}`);
    }
    lines.push("    endloop");
    lines.push("  endfacet");
  }
  lines.push("endsolid cadria-visualize");
  return lines.join("\n");
}

/**
 * STL binary (little-endian): 80-byte header, uint32 triangle count, then 50 bytes
 * per triangle (facet normal + 3 vertices as float32 + uint16 attribute byte count).
 * Degenerate faces carry a zero normal so the count always matches the geometry.
 */
export function toStlBinary(geometry: MeshGeometry): Uint8Array {
  const { vertices, indices } = geometry;
  const faces = indices.length / 3;
  const buffer = new ArrayBuffer(84 + faces * 50);
  const view = new DataView(buffer);
  const header = "cadria visualize binary stl";
  for (let i = 0; i < Math.min(header.length, 80); i++) view.setUint8(i, header.charCodeAt(i));
  view.setUint32(80, faces, true);
  let offset = 84;
  for (let face = 0; face < indices.length; face += 3) {
    const [nx, ny, nz] = facetNormal(vertices, indices, face);
    view.setFloat32(offset, nx, true);
    view.setFloat32(offset + 4, ny, true);
    view.setFloat32(offset + 8, nz, true);
    offset += 12;
    for (let corner = 0; corner < 3; corner++) {
      const vertex = indices[face + corner] * 3;
      view.setFloat32(offset, vertices[vertex], true);
      view.setFloat32(offset + 4, vertices[vertex + 1], true);
      view.setFloat32(offset + 8, vertices[vertex + 2], true);
      offset += 12;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
  }
  return new Uint8Array(buffer);
}
