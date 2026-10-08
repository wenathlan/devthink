// # visualize — the facade of the image-to-3D library: `visualize(image, options)`
// runs the whole pipeline (heightmap → grid mesh → vertex colors → normals) and
// hands back one result object with exporters and stats. Pure TypeScript, multi-mode:
// the same call works in the browser (ImageData-like pixels from a canvas) and in
// node (synthetic buffers in the tests). The mesh is the responsibility of
// visualizemesh, the colors of visualizematerial, the math of visualizenormals
// and the file formats of visualizeexport.
import {
  buildHeightmap,
  triangulateGrid,
  VisualizeError,
  type ImageInput,
  type MeshGeometry,
  type Vec3,
} from "./visualizemesh.ts";
import { vertexNormals } from "./visualizenormals.ts";
import { materialSummary, vertexColors, type MaterialSummary } from "./visualizematerial.ts";
import { toObj, toStlAscii, toStlBinary } from "./visualizeexport.ts";

export { VisualizeError };
export type { ImageInput, MeshGeometry, MaterialSummary, Vec3 };

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
  if (!Number.isFinite(depth) || depth < 0) throw new VisualizeError(`visualize: depth must be a number >= 0, got ${depth}`);
  if (!Number.isInteger(step) || step < 1) throw new VisualizeError(`visualize: step must be an integer >= 1, got ${step}`);
  if (!Number.isInteger(blurRadius) || blurRadius < 0) throw new VisualizeError(`visualize: blurRadius must be an integer >= 0, got ${blurRadius}`);
  if (!Number.isFinite(minHeight) || minHeight < 0 || minHeight > 1) throw new VisualizeError(`visualize: minHeight must be within [0, 1], got ${minHeight}`);
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
