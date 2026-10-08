// # matiz — the pixel engine of the cadria image studio, housed at the cadria
// root beside versawase. Pure TypeScript over the ImageData shape ({width,
// height, data: Uint8ClampedArray}): brightness, contrast and saturation
// adjustments, the grayscale and sepia tints, the 3x3 convolution, the box
// blur and the bilinear resize. Every stage answers a NEW buffer — the input
// is never mutated — and every stage validates honestly through MatizError.
// The engine never leaves cadria: the DevThink native image studio pulls it
// by the catalog row (engine "matiz", owner "cadria") over HTTPS and never
// bundles it, the same way the video studio rides versawase. In the browser
// a canvas ImageData rides in directly; in the tests the synthetic buffers
// ride in. Zero dependencies, no canvas, no worker.
export class MatizError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "MatizError";
  }
}

/** one raster image: the dimensions and the rgba byte buffer the canvas
 * calls ImageData. The length must answer for width × height × 4. */
export type MatizImage = { width: number; height: number; data: Uint8ClampedArray };

/** the three channel adjustments: brightness multiplies, contrast swings
 * around the 128 midpoint and saturation interpolates toward the luma. */
export type MatizAdjustments = { brightness?: number; contrast?: number; saturation?: number };

/** the color tints: grayscale rides the rec 709 luma, sepia the classic
 * warm matrix. "none" keeps the adjusted colors. */
export type MatizTint = "none" | "grayscale" | "sepia";

/** one 3x3 convolution kernel, row by row, the center at index 4. */
export type MatizKernel = [number, number, number, number, number, number, number, number, number];

/** the composed pipeline options: every stage is optional and the stages run
 * in the documented order — adjust, tint, convolve, blur, resize. */
export type MatizOptions = {
  adjustments?: MatizAdjustments;
  tint?: MatizTint;
  kernel?: MatizKernel;
  blurRadius?: number;
  resize?: { width: number; height: number };
};

/** the kernel presets: identity answers the input, sharpen recovers edges
 * and outline answers the inverse of the blur. */
export const matizkernels: Record<"identity" | "sharpen" | "outline", MatizKernel> = {
  identity: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
  outline: [0, 1, 0, 1, -4, 1, 0, 1, 0],
};

/** Validates one image honestly: finite positive dimensions and a buffer
 * that answers for width × height × 4 bytes. */
function guardimage(image: MatizImage): void {
  if (!Number.isInteger(image.width) || image.width <= 0) throw new MatizError(`matiz: width must be a positive integer, got ${image.width}`);
  if (!Number.isInteger(image.height) || image.height <= 0) throw new MatizError(`matiz: height must be a positive integer, got ${image.height}`);
  if (!(image.data instanceof Uint8ClampedArray)) throw new MatizError("matiz: data must be a Uint8ClampedArray");
  if (image.data.length !== image.width * image.height * 4)
    throw new MatizError(`matiz: data carries ${image.data.length} bytes but ${image.width}×${image.height} needs ${image.width * image.height * 4}`);
}

/** the rec 709 luma of one rgba pixel. */
function luma(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Builds a copy of the buffer so no stage ever mutates the input. */
function copybuffer(image: MatizImage): Uint8ClampedArray {
  return new Uint8ClampedArray(image.data);
}

/** Applies the three channel adjustments: brightness multiplies the value,
 * contrast swings it around the 128 midpoint and saturation interpolates it
 * toward the luma of the adjusted pixel. One (default 1) answers unchanged. */
export function adjustimage(image: MatizImage, adjustments: MatizAdjustments = {}): MatizImage {
  guardimage(image);
  const brightness = adjustments.brightness ?? 1;
  const contrast = adjustments.contrast ?? 1;
  const saturation = adjustments.saturation ?? 1;
  for (const amount of [brightness, contrast, saturation]) {
    if (!Number.isFinite(amount) || amount < 0) throw new MatizError(`matiz: adjustments must be finite numbers >= 0, got ${amount}`);
  }
  const data = copybuffer(image);
  for (let at = 0; at < data.length; at += 4) {
    let r = data[at] * brightness;
    let g = data[at + 1] * brightness;
    let b = data[at + 2] * brightness;
    r = (r - 128) * contrast + 128;
    g = (g - 128) * contrast + 128;
    b = (b - 128) * contrast + 128;
    const gray = luma(r, g, b);
    data[at] = gray + (r - gray) * saturation;
    data[at + 1] = gray + (g - gray) * saturation;
    data[at + 2] = gray + (b - gray) * saturation;
  }
  return { width: image.width, height: image.height, data };
}

/** Tints the image: grayscale answers the rec 709 luma on every channel and
 * sepia answers the classic warm matrix. The alpha rides untouched. */
export function tintimage(image: MatizImage, tint: MatizTint): MatizImage {
  guardimage(image);
  if (tint === "none") return { width: image.width, height: image.height, data: copybuffer(image) };
  if (tint !== "grayscale" && tint !== "sepia") throw new MatizError(`matiz: unknown tint "${tint}"`);
  const data = copybuffer(image);
  for (let at = 0; at < data.length; at += 4) {
    const r = data[at];
    const g = data[at + 1];
    const b = data[at + 2];
    if (tint === "grayscale") {
      const gray = luma(r, g, b);
      data[at] = gray;
      data[at + 1] = gray;
      data[at + 2] = gray;
    } else {
      data[at] = 0.393 * r + 0.769 * g + 0.189 * b;
      data[at + 1] = 0.349 * r + 0.686 * g + 0.168 * b;
      data[at + 2] = 0.272 * r + 0.534 * g + 0.131 * b;
    }
  }
  return { width: image.width, height: image.height, data };
}

/** Convolves the image with one 3x3 kernel: every channel samples the clamped
 * neighborhood (edges replicate), the kernel multiplies row by row and the
 * alpha rides untouched. The identity kernel answers the input colors. */
export function convolveimage(image: MatizImage, kernel: MatizKernel): MatizImage {
  guardimage(image);
  if (kernel.length !== 9 || kernel.some((weight) => !Number.isFinite(weight)))
    throw new MatizError("matiz: a kernel carries exactly nine finite weights");
  const { width, height } = image;
  const source = image.data;
  const data = new Uint8ClampedArray(source.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      data[at + 3] = source[at + 3];
      for (let channel = 0; channel < 3; channel += 1) {
        let sum = 0;
        for (let ky = 0; ky < 3; ky += 1) {
          const ny = Math.min(height - 1, Math.max(0, y + ky - 1));
          for (let kx = 0; kx < 3; kx += 1) {
            const nx = Math.min(width - 1, Math.max(0, x + kx - 1));
            sum += kernel[ky * 3 + kx] * source[(ny * width + nx) * 4 + channel];
          }
        }
        data[at + channel] = sum;
      }
    }
  }
  return { width, height, data };
}

/** Box-blurs the image with one separable horizontal pass and one vertical
 * pass over a (2·radius+1) window with clamped edges: the rgb channels ride
 * the box average and the alpha rides untouched. Radius 0 answers a copy. */
export function boxblurimage(image: MatizImage, radius: number): MatizImage {
  guardimage(image);
  if (!Number.isInteger(radius) || radius < 0) throw new MatizError(`matiz: blurRadius must be an integer >= 0, got ${radius}`);
  if (radius === 0) return { width: image.width, height: image.height, data: copybuffer(image) };
  const { width, height } = image;
  const span = radius * 2 + 1;
  const horizontal = new Uint8ClampedArray(image.data.length);
  const data = new Uint8ClampedArray(image.data.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      horizontal[at + 3] = image.data[at + 3];
      for (let channel = 0; channel < 3; channel += 1) {
        let sum = 0;
        for (let k = -radius; k <= radius; k += 1) {
          const nx = Math.min(width - 1, Math.max(0, x + k));
          sum += image.data[(y * width + nx) * 4 + channel];
        }
        horizontal[at + channel] = sum / span;
      }
    }
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      data[at + 3] = horizontal[at + 3];
      for (let channel = 0; channel < 3; channel += 1) {
        let sum = 0;
        for (let k = -radius; k <= radius; k += 1) {
          const ny = Math.min(height - 1, Math.max(0, y + k));
          sum += horizontal[(ny * width + x) * 4 + channel];
        }
        data[at + channel] = sum / span;
      }
    }
  }
  return { width, height, data };
}

/** Resizes the image with bilinear sampling over pixel centers: every dest
 * pixel maps back to the source, the four neighbors blend by weight and the
 * edges clamp, so nothing reads outside the buffer. */
export function resizeimage(image: MatizImage, target: { width: number; height: number }): MatizImage {
  guardimage(image);
  if (!Number.isInteger(target.width) || target.width <= 0) throw new MatizError(`matiz: resize width must be a positive integer, got ${target.width}`);
  if (!Number.isInteger(target.height) || target.height <= 0) throw new MatizError(`matiz: resize height must be a positive integer, got ${target.height}`);
  const { width: sw, height: sh } = image;
  const { width: dw, height: dh } = target;
  const data = new Uint8ClampedArray(dw * dh * 4);
  for (let y = 0; y < dh; y += 1) {
    const sy = ((y + 0.5) * sh) / dh - 0.5;
    const y0 = Math.floor(sy);
    const wy = sy - y0;
    const ya = Math.min(sh - 1, Math.max(0, y0));
    const yb = Math.min(sh - 1, Math.max(0, y0 + 1));
    for (let x = 0; x < dw; x += 1) {
      const sx = ((x + 0.5) * sw) / dw - 0.5;
      const x0 = Math.floor(sx);
      const wx = sx - x0;
      const xa = Math.min(sw - 1, Math.max(0, x0));
      const xb = Math.min(sw - 1, Math.max(0, x0 + 1));
      const at = (y * dw + x) * 4;
      for (let channel = 0; channel < 4; channel += 1) {
        const top = image.data[(ya * sw + xa) * 4 + channel] * (1 - wx) + image.data[(ya * sw + xb) * 4 + channel] * wx;
        const bottom = image.data[(yb * sw + xa) * 4 + channel] * (1 - wx) + image.data[(yb * sw + xb) * 4 + channel] * wx;
        data[at + channel] = top * (1 - wy) + bottom * wy;
      }
    }
  }
  return { width: dw, height: dh, data };
}

/** Runs the whole matiz pipeline in the documented order: the channel
 * adjustments first, the tint second, the 3x3 convolution third, the box
 * blur fourth and the bilinear resize last. With no options the pipeline
 * answers a copy. DevThink never calls this directly — the studio page
 * queues the work over the gateway and the cadria engine answers there. */
export function runmatiz(image: MatizImage, options: MatizOptions = {}): MatizImage {
  guardimage(image);
  let current: MatizImage = { width: image.width, height: image.height, data: copybuffer(image) };
  if (options.adjustments) current = adjustimage(current, options.adjustments);
  if (options.tint) current = tintimage(current, options.tint);
  if (options.kernel) current = convolveimage(current, options.kernel);
  if (options.blurRadius !== undefined) current = boxblurimage(current, options.blurRadius);
  if (options.resize) current = resizeimage(current, options.resize);
  return current;
}
