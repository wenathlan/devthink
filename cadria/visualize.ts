// # visualize — the image-to-3D library of the versawase engine, consolidated
// at the cadria root as ONE keyword file (the wave-4 root-logic consolidation
// law: one correlated domain per root file). The former satellite modules
// folded here verbatim, in pipeline order:
//   Section 1: visualizemesh.ts     — the pixels-to-mesh core (luminance, blur, grid).
//   Section 2: visualizematerial.ts — the rgb vertex colors and material summary.
//   Section 3: visualizenormals.ts  — the face/vertex normals and bounding-box math.
//   Section 4: visualizeexport.ts   — the OBJ and STL exporters.
//   Section 5: visualize.ts         — the facade over the whole pipeline.
// Every export of every source file is preserved here and the intra-domain
// imports dissolved into the single module scope. Pure TypeScript over typed
// arrays — zero canvas, zero DOM, zero external package: the same code runs
// in the browser (pixels decoded from a canvas by the caller) and in node
// (synthetic buffers in the tests). Coordinates stay in image space: x grows
// right, y grows down (pixel order), z is the extruded height.

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: visualizemesh.ts — the pixels-to-mesh core of the visualize library: image data in, */
/* grid triangulation out. */
/* ════════════════════════════════════════════════════════════════════ */

/** one rgb triple used across the visualize library. */
export type Vec3 = [number, number, number];

/** one image buffer the visualize pipeline accepts (the ImageData shape, DOM-free). */
export interface ImageInput {
  width: number;
  height: number;
  /** RGBA, one byte per channel, exactly `width * height * 4` long. */
  data: Uint8ClampedArray;
}

/** the grid mesh produced by the triangulation. */
export interface MeshGeometry {
  /** xyz per vertex, 3 floats each, image space: x right, y down, z = height * depth. */
  vertices: Float32Array;
  /** triangle indices, 3 per face, 2 faces per grid cell (holes allowed via minHeight). */
  indices: Uint32Array;
  /** source image width in pixels. */
  width: number;
  /** source image height in pixels. */
  height: number;
  /** the height scale applied to the normalized heightmap. */
  depth: number;
  /** sampled grid columns and rows after step decimation. */
  columns: number;
  rows: number;
}

/** grid mesh options shared by the core and the facade. */
export interface MeshOptions {
  /** height scale: z = normalized height * depth (default 32). */
  depth?: number;
  /** decimation stride in pixels: sample every `step` px (default 1). */
  step?: number;
  /** gaussian blur radius in pixels applied to the heightmap (default 0 = off). */
  blurRadius?: number;
  /** drop triangles whose tallest corner sits below this normalized height (default 0). */
  minHeight?: number;
}

/** error raised by the visualize pipeline for invalid input or options. */
export class VisualizeError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "VisualizeError";
  }
}

/** grid sampling geometry for a decimation step: columns/rows are always >= 1. */
export function gridDimensions(width: number, height: number, step: number): { columns: number; rows: number } {
  return {
    columns: Math.floor((width - 1) / step) + 1,
    rows: Math.floor((height - 1) / step) + 1,
  };
}

/**
 * Rec. 709 luminance of the image, normalized 0-1, one float per pixel.
 * Throws `VisualizeError` when the RGBA buffer does not match the dimensions.
 */
export function luminance(image: ImageInput): Float32Array {
  const { width, height, data } = image;
  if (width < 1 || height < 1 || !Number.isInteger(width) || !Number.isInteger(height)) {
    throw new VisualizeError(`visualize: image dimensions must be positive integers, got ${width}x${height}`);
  }
  if (data.length !== width * height * 4) {
    throw new VisualizeError(
      `visualize: RGBA buffer is ${data.length} bytes, expected ${width * height * 4} for ${width}x${height}`,
    );
  }
  const heights = new Float32Array(width * height);
  for (let pixel = 0; pixel < heights.length; pixel++) {
    const index = pixel * 4;
    heights[pixel] = (0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2]) / 255;
  }
  return heights;
}

/** normalized gaussian kernel of the given radius (sums to 1). */
function gaussianKernel(radius: number): Float32Array {
  const kernel = new Float32Array(radius * 2 + 1);
  const sigma = Math.max(radius / 2, 0.5);
  let sum = 0;
  for (let i = 0; i < kernel.length; i++) {
    const distance = i - radius;
    kernel[i] = Math.exp(-(distance * distance) / (2 * sigma * sigma));
    sum += kernel[i];
  }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;
  return kernel;
}

/** separable gaussian blur over the heightmap with edge clamping; radius < 1 is a no-op. */
export function blurHeights(heights: Float32Array, width: number, height: number, radius: number): Float32Array {
  if (radius < 1 || width < 2 || height < 2) return heights;
  const kernel = gaussianKernel(radius);
  const horizontal = new Float32Array(heights.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let accumulator = 0;
      for (let k = -radius; k <= radius; k++) {
        const sampleX = Math.min(width - 1, Math.max(0, x + k));
        accumulator += heights[y * width + sampleX] * kernel[k + radius];
      }
      horizontal[y * width + x] = accumulator;
    }
  }
  const output = new Float32Array(heights.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let accumulator = 0;
      for (let k = -radius; k <= radius; k++) {
        const sampleY = Math.min(height - 1, Math.max(0, y + k));
        accumulator += horizontal[sampleY * width + x] * kernel[k + radius];
      }
      output[y * width + x] = accumulator;
    }
  }
  return output;
}

/** luminance + optional blur: the heightmap the grid triangulation consumes. */
export function buildHeightmap(image: ImageInput, blurRadius = 0): Float32Array {
  try {
    return blurHeights(luminance(image), image.width, image.height, blurRadius);
  } catch (error) {
    if (error instanceof VisualizeError) throw error;
    throw new VisualizeError("visualize: heightmap build failed", { cause: error });
  }
}

/**
 * Grid triangulation of the heightmap: one vertex per sampled pixel (z = height *
 * depth), two counter-clockwise triangles per cell (normals face +z, out of the
 * image plane). `minHeight` drops triangles whose tallest corner is below the
 * normalized threshold, carving holes into flat background.
 */
export function triangulateGrid(heights: Float32Array, image: ImageInput, options: MeshOptions = {}): MeshGeometry {
  const depth = options.depth ?? 32;
  const step = options.step ?? 1;
  const minHeight = options.minHeight ?? 0;
  const { width, height } = image;
  const { columns, rows } = gridDimensions(width, height, step);

  const vertices = new Float32Array(columns * rows * 3);
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < columns; gx++) {
      const sample = heights[gy * step * width + gx * step];
      const offset = (gy * columns + gx) * 3;
      vertices[offset] = gx * step;
      vertices[offset + 1] = gy * step;
      vertices[offset + 2] = sample * depth;
    }
  }

  const indices = new Uint32Array((columns - 1) * (rows - 1) * 6);
  let face = 0;
  for (let gy = 0; gy < rows - 1; gy++) {
    for (let gx = 0; gx < columns - 1; gx++) {
      const v00 = gy * columns + gx;
      const v10 = v00 + 1;
      const v01 = v00 + columns;
      const v11 = v01 + 1;
      const h00 = heights[gy * step * width + gx * step];
      const h10 = heights[gy * step * width + (gx + 1) * step];
      const h01 = heights[(gy + 1) * step * width + gx * step];
      const h11 = heights[(gy + 1) * step * width + (gx + 1) * step];
      if (Math.max(h00, h10, h11) >= minHeight) {
        indices[face++] = v00;
        indices[face++] = v10;
        indices[face++] = v11;
      }
      if (Math.max(h00, h11, h01) >= minHeight) {
        indices[face++] = v00;
        indices[face++] = v11;
        indices[face++] = v01;
      }
    }
  }

  return { vertices, indices: indices.slice(0, face), width, height, depth, columns, rows };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: visualizematerial.ts — from pixels to mesh color: rgb vertex colors sampled from */
/* the source image at the same grid the triangulation uses. */
/* ════════════════════════════════════════════════════════════════════ */

/**
 * RGB vertex colors normalized 0-1, 3 floats per grid vertex, rows-major — the
 * exact vertex order of the mesh, so index `v` owns colors `3v..3v+2`. Samples the
 * original image (not the blurred heightmap) so colors stay faithful.
 */
export function vertexColors(image: ImageInput, columns: number, rows: number, step: number): Float32Array {
  const { width, height, data } = image;
  if (data.length !== width * height * 4) {
    throw new VisualizeError(`visualize: RGBA buffer is ${data.length} bytes, expected ${width * height * 4}`);
  }
  const colors = new Float32Array(columns * rows * 3);
  for (let gy = 0; gy < rows; gy++) {
    const py = Math.min(height - 1, gy * step);
    for (let gx = 0; gx < columns; gx++) {
      const px = Math.min(width - 1, gx * step);
      const pixel = (py * width + px) * 4;
      const offset = (gy * columns + gx) * 3;
      colors[offset] = data[pixel] / 255;
      colors[offset + 1] = data[pixel + 1] / 255;
      colors[offset + 2] = data[pixel + 2] / 255;
    }
  }
  return colors;
}

/** average color and luminance range of the whole image, all normalized 0-1. */
export interface MaterialSummary {
  /** average rgb of the image. */
  average: Vec3;
  /** darkest Rec. 709 luminance. */
  minLuminance: number;
  /** brightest Rec. 709 luminance. */
  maxLuminance: number;
}

/** material summary over every pixel: mean rgb plus min/max Rec. 709 luminance. */
export function materialSummary(image: ImageInput): MaterialSummary {
  const { width, height, data } = image;
  const pixels = width * height;
  let red = 0;
  let green = 0;
  let blue = 0;
  for (let pixel = 0; pixel < pixels; pixel++) {
    const index = pixel * 4;
    red += data[index];
    green += data[index + 1];
    blue += data[index + 2];
  }
  const heights = luminance(image);
  let minLuminance = Number.POSITIVE_INFINITY;
  let maxLuminance = Number.NEGATIVE_INFINITY;
  for (let pixel = 0; pixel < heights.length; pixel++) {
    if (heights[pixel] < minLuminance) minLuminance = heights[pixel];
    if (heights[pixel] > maxLuminance) maxLuminance = heights[pixel];
  }
  return {
    average: [red / pixels / 255, green / pixels / 255, blue / pixels / 255],
    minLuminance: pixels > 0 ? minLuminance : 0,
    maxLuminance: pixels > 0 ? maxLuminance : 0,
  };
}

/** resolves the color sampling grid for an image and step (mesh dimensions). */
export function colorGrid(image: ImageInput, step: number): { columns: number; rows: number } {
  return gridDimensions(image.width, image.height, step);
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: visualizenormals.ts — geometry math for the visualize library: face and vertex */
/* normals plus bounding-box helpers. */
/* ════════════════════════════════════════════════════════════════════ */

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

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: visualizeexport.ts — text and binary mesh exporters with zero dependencies: */
/* Wavefront OBJ and STL in ASCII and binary forms. */
/* ════════════════════════════════════════════════════════════════════ */

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
      lines.push(
        `      vertex ${decimal(vertices[offset])} ${decimal(vertices[offset + 1])} ${decimal(vertices[offset + 2])}`,
      );
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

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: visualize.ts — the facade of the image-to-3D library: `visualize(image, options)` */
/* runs the whole pipeline and hands back one result object. */
/* ════════════════════════════════════════════════════════════════════ */

/** the pipeline options: geometry shaping plus the colors/normals toggles. */
export interface VisualizeOptions {
  /** height scale: z = normalized height * depth (default 32). */
  depth?: number;
  /** decimation stride in pixels: sample every `step` px (default 1). */
  step?: number;
  /** heightmap blur radius in pixels (default 0 = off). */
  blurRadius?: number;
  /** drop triangles below this normalized height, carving holes (default 0). */
  minHeight?: number;
  /** sample rgb vertex colors from the source image (default true). */
  colors?: boolean;
  /** compute per-vertex normals (default true). */
  normals?: boolean;
}

/** aggregate numbers reported by `stats()`. */
export interface VisualizeStats {
  /** source image size in pixels. */
  width: number;
  height: number;
  /** the height scale used. */
  depth: number;
  /** decimation stride used. */
  step: number;
  /** sampled grid size. */
  columns: number;
  rows: number;
  /** mesh element counts. */
  vertices: number;
  triangles: number;
  /** whether vertex colors and normals were computed. */
  hasColors: boolean;
  hasNormals: boolean;
  /** material summary of the source image (when colors are on). */
  material: MaterialSummary | null;
}

/** the composed pipeline result: geometry plus lazy export hooks. */
export interface VisualizeResult {
  /** the triangulated grid mesh. */
  readonly mesh: MeshGeometry;
  /** rgb vertex colors 0-1, 3 per vertex (null when colors are off). */
  readonly colors: Float32Array | null;
  /** xyz unit normals, 3 per vertex (null when normals are off). */
  readonly normals: Float32Array | null;
  /** Wavefront OBJ text (colors and per-face normals included when available). */
  toObj(): string;
  /** STL ASCII text. */
  toStl(): string;
  /** STL binary bytes (80-byte header + 50 bytes per triangle). */
  toStlBinary(): Uint8Array;
  /** aggregate numbers of this run. */
  stats(): VisualizeStats;
}

/** resolves and validates the pipeline options against the house defaults. */
function resolveOptions(options: VisualizeOptions): Required<VisualizeOptions> {
  const depth = options.depth ?? 32;
  const step = options.step ?? 1;
  const blurRadius = options.blurRadius ?? 0;
  const minHeight = options.minHeight ?? 0;
  if (!Number.isFinite(depth) || depth < 0)
    throw new VisualizeError(`visualize: depth must be a number >= 0, got ${depth}`);
  if (!Number.isInteger(step) || step < 1)
    throw new VisualizeError(`visualize: step must be an integer >= 1, got ${step}`);
  if (!Number.isInteger(blurRadius) || blurRadius < 0)
    throw new VisualizeError(`visualize: blurRadius must be an integer >= 0, got ${blurRadius}`);
  if (!Number.isFinite(minHeight) || minHeight < 0 || minHeight > 1)
    throw new VisualizeError(`visualize: minHeight must be within [0, 1], got ${minHeight}`);
  return {
    depth,
    step,
    blurRadius,
    minHeight,
    colors: options.colors ?? true,
    normals: options.normals ?? true,
  };
}

/**
 * Turns image pixels into a 3D mesh: Rec. 709 luminance → optional gaussian blur →
 * decimated grid triangulation → optional vertex colors and normals. Throws
 * `VisualizeError` (with the original error as `cause`) for invalid input or when a
 * pipeline stage fails.
 */
export function visualize(image: ImageInput, options: VisualizeOptions = {}): VisualizeResult {
  const resolved = resolveOptions(options);
  try {
    const heights = buildHeightmap(image, resolved.blurRadius);
    const mesh = triangulateGrid(heights, image, resolved);
    const colors = resolved.colors ? vertexColors(image, mesh.columns, mesh.rows, resolved.step) : null;
    const normals = resolved.normals ? vertexNormals(mesh) : null;
    const material = colors ? materialSummary(image) : null;
    return {
      mesh,
      colors,
      normals,
      toObj() {
        return toObj(mesh, { colors: colors ?? undefined, normals: normals !== null });
      },
      toStl() {
        return toStlAscii(mesh);
      },
      toStlBinary() {
        return toStlBinary(mesh);
      },
      stats() {
        return {
          width: mesh.width,
          height: mesh.height,
          depth: mesh.depth,
          step: resolved.step,
          columns: mesh.columns,
          rows: mesh.rows,
          vertices: mesh.vertices.length / 3,
          triangles: mesh.indices.length / 3,
          hasColors: colors !== null,
          hasNormals: normals !== null,
          material,
        };
      },
    };
  } catch (error) {
    if (error instanceof VisualizeError) throw error;
    throw new VisualizeError("visualize: pipeline failed", { cause: error });
  }
}
