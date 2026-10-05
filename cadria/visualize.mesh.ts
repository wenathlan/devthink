// # visualize.mesh — the pixels-to-mesh core of the visualize library: image data in,
// grid triangulation out. Pure TypeScript over typed arrays — zero canvas, zero DOM,
// zero external package: the same code runs in the browser (pixels decoded from a
// canvas by the caller) and in node (synthetic buffers in the tests).
//
// Pipeline: Rec. 709 luminance → optional separable gaussian blur → grid mesh with
// step decimation and a minimum-height triangle threshold. Coordinates stay in image
// space: x grows right, y grows down (pixel order), z is the extruded height.

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
    throw new VisualizeError(`visualize: RGBA buffer is ${data.length} bytes, expected ${width * height * 4} for ${width}x${height}`);
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
