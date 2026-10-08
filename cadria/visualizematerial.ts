// # visualizematerial — from pixels to mesh color: rgb vertex colors sampled from
// the source image at the same grid the triangulation uses, plus a small material
// summary (average color, luminance range). Pure TypeScript, node-testable.
import { luminance, VisualizeError, type ImageInput, type Vec3 } from "./visualizemesh.ts";
import { gridDimensions } from "./visualizemesh.ts";

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
