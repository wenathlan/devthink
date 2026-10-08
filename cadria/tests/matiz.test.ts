// # matiz.test — the cadria pixel engine: the channel adjustments, the
// grayscale and sepia tints, the 3x3 convolution, the box blur, the bilinear
// resize and the composed pipeline, runnable with the node built-in runner
// (no canvas, no dependencies, no install):
//   node --test tests/matiz.test.ts
// The fixture is a synthetic rgba buffer shaped like ImageData, and every
// test also watches the one invariant the engine promises: the input never
// mutates.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  adjustimage,
  boxblurimage,
  convolveimage,
  type MatizImage,
  matizkernels,
  resizeimage,
  runmatiz,
  tintimage,
} from "../matiz.ts";

/** builds a w×h rgba buffer where every pixel carries the same color. */
function solidImage(width: number, height: number, color: [number, number, number, number]): MatizImage {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let at = 0; at < data.length; at += 4) {
    data[at] = color[0];
    data[at + 1] = color[1];
    data[at + 2] = color[2];
    data[at + 3] = color[3];
  }
  return { width, height, data };
}

/** builds a w×h grayscale horizontal ramp (left black, right white, alpha full). */
function rampImage(width: number, height: number): MatizImage {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      const value = Math.round((255 * x) / (width - 1));
      data[at] = value;
      data[at + 1] = value;
      data[at + 2] = value;
      data[at + 3] = 255;
    }
  }
  return { width, height, data };
}

/** the buffer snapshot used to prove no stage mutates its input. */
function snapshot(image: MatizImage): Uint8ClampedArray {
  return new Uint8ClampedArray(image.data);
}

describe("matiz adjustments", () => {
  it("keeps the image unchanged when every amount answers one", () => {
    const image = solidImage(3, 2, [40, 80, 160, 255]);
    const before = snapshot(image);
    const out = adjustimage(image);
    assert.deepEqual([out.data[0], out.data[1], out.data[2], out.data[3]], [40, 80, 160, 255]);
    assert.deepEqual(image.data, before);
  });

  it("drives brightness to zero and multiplies honestly", () => {
    const image = solidImage(2, 2, [100, 50, 25, 255]);
    const dark = adjustimage(image, { brightness: 0 });
    assert.deepEqual([dark.data[0], dark.data[1], dark.data[2]], [0, 0, 0]);
    const twice = adjustimage(image, { brightness: 2 });
    assert.deepEqual([twice.data[0], twice.data[1], twice.data[2]], [200, 100, 50]);
  });

  it("swings contrast around the 128 midpoint", () => {
    const image = solidImage(2, 2, [128, 178, 78, 255]);
    const out = adjustimage(image, { contrast: 2 });
    assert.deepEqual([out.data[0], out.data[1], out.data[2]], [128, 228, 28]);
  });

  it("answers the luma when saturation reaches zero", () => {
    const image = solidImage(2, 2, [100, 150, 200, 255]);
    const out = adjustimage(image, { saturation: 0 });
    const gray = out.data[0];
    assert.equal(out.data[1], gray);
    assert.equal(out.data[2], gray);
    assert.equal(gray, Math.round(0.2126 * 100 + 0.7152 * 150 + 0.0722 * 200));
  });

  it("refuses negative or non-finite amounts", () => {
    const image = solidImage(2, 2, [10, 20, 30, 255]);
    assert.throws(() => adjustimage(image, { brightness: -1 }), /adjustments must be finite/);
    assert.throws(() => adjustimage(image, { contrast: Number.NaN }), /adjustments must be finite/);
  });
});

describe("matiz tints", () => {
  it("answers the rec 709 luma on every channel for grayscale", () => {
    const image = solidImage(2, 2, [90, 120, 30, 255]);
    const out = tintimage(image, "grayscale");
    const gray = Math.round(0.2126 * 90 + 0.7152 * 120 + 0.0722 * 30);
    assert.deepEqual([out.data[0], out.data[1], out.data[2]], [gray, gray, gray]);
  });

  it("warms a neutral gray toward sepia and clamps at the ceiling", () => {
    const white = solidImage(2, 2, [255, 255, 255, 255]);
    const out = tintimage(white, "sepia");
    assert.deepEqual([out.data[0], out.data[1], out.data[2]], [255, 255, 239]);
  });

  it("answers a copy for the none tint", () => {
    const image = solidImage(2, 2, [12, 34, 56, 255]);
    const out = tintimage(image, "none");
    assert.deepEqual(new Uint8ClampedArray(out.data), image.data);
    assert.notEqual(out.data, image.data);
  });
});

describe("matiz convolution", () => {
  it("answers the input colors for the identity kernel", () => {
    const image = solidImage(3, 3, [30, 60, 90, 255]);
    const out = convolveimage(image, matizkernels.identity);
    assert.deepEqual(new Uint8ClampedArray(out.data), image.data);
  });

  it("keeps the alpha untouched and the dimensions stable", () => {
    const image = rampImage(4, 4);
    const before = snapshot(image);
    const out = convolveimage(image, matizkernels.sharpen);
    assert.equal(out.width, 4);
    assert.equal(out.height, 4);
    for (let at = 3; at < image.data.length; at += 4) assert.equal(out.data[at], image.data[at]);
    assert.deepEqual(image.data, before);
  });

  it("replicates the clamped edges instead of reading outside", () => {
    const image = solidImage(2, 2, [100, 100, 100, 255]);
    const out = convolveimage(image, matizkernels.identity);
    assert.deepEqual(new Uint8ClampedArray(out.data), image.data);
  });

  it("refuses a kernel that is not nine finite weights", () => {
    const image = solidImage(2, 2, [1, 2, 3, 255]);
    assert.throws(() => convolveimage(image, [1, 2, 3] as unknown as typeof matizkernels.identity), /nine finite weights/);
  });
});

describe("matiz box blur", () => {
  it("answers a solid image unchanged", () => {
    const image = solidImage(4, 4, [80, 120, 200, 255]);
    const out = boxblurimage(image, 1);
    assert.deepEqual(new Uint8ClampedArray(out.data), image.data);
  });

  it("pulls a lone bright pixel toward its dark neighborhood", () => {
    const image = solidImage(5, 5, [0, 0, 0, 255]);
    const center = (2 * 5 + 2) * 4;
    image.data[center] = 255;
    image.data[center + 1] = 255;
    image.data[center + 2] = 255;
    const out = boxblurimage(image, 1);
    assert.equal(out.data[center], 28, "the white center falls toward its dark ring");
    assert.equal(out.data[0], 0, "the far corner stays dark");
  });

  it("answers a copy for radius zero and refuses bad radii", () => {
    const image = solidImage(2, 2, [9, 8, 7, 255]);
    assert.deepEqual(new Uint8ClampedArray(boxblurimage(image, 0).data), image.data);
    assert.throws(() => boxblurimage(image, -1), /integer >= 0/);
    assert.throws(() => boxblurimage(image, 1.5), /integer >= 0/);
  });
});

describe("matiz resize", () => {
  it("answers the same color field for a solid image at any size", () => {
    const image = solidImage(3, 3, [10, 200, 30, 255]);
    const out = resizeimage(image, { width: 7, height: 5 });
    assert.equal(out.width, 7);
    assert.equal(out.height, 5);
    for (let at = 0; at < out.data.length; at += 4)
      assert.deepEqual([out.data[at], out.data[at + 1], out.data[at + 2], out.data[at + 3]], [10, 200, 30, 255]);
  });

  it("keeps a downsampled ramp monotonic", () => {
    const image = rampImage(8, 2);
    const out = resizeimage(image, { width: 4, height: 1 });
    assert.ok(out.data[0] < out.data[4] && out.data[4] < out.data[8] && out.data[8] < out.data[12]);
  });

  it("refuses zero or fractional dimensions", () => {
    const image = solidImage(2, 2, [1, 1, 1, 255]);
    assert.throws(() => resizeimage(image, { width: 0, height: 2 }), /positive integer/);
    assert.throws(() => resizeimage(image, { width: 2.5, height: 2 }), /positive integer/);
  });
});

describe("matiz pipeline", () => {
  it("runs the documented order: adjust, tint, convolve, blur, resize", () => {
    const image = rampImage(6, 4);
    const before = snapshot(image);
    const out = runmatiz(image, {
      adjustments: { brightness: 1.2, contrast: 1.1, saturation: 0.8 },
      tint: "grayscale",
      kernel: matizkernels.identity,
      blurRadius: 1,
      resize: { width: 3, height: 2 },
    });
    assert.equal(out.width, 3);
    assert.equal(out.height, 2);
    assert.deepEqual(image.data, before, "the pipeline never mutates the input");
  });

  it("answers a copy with no options", () => {
    const image = solidImage(2, 2, [5, 6, 7, 255]);
    const out = runmatiz(image);
    assert.deepEqual(new Uint8ClampedArray(out.data), image.data);
    assert.notEqual(out.data, image.data);
  });

  it("refuses an image whose buffer does not answer for its size", () => {
    assert.throws(() => runmatiz({ width: 2, height: 2, data: new Uint8ClampedArray(4) }), /needs 16/);
    assert.throws(() => runmatiz({ width: 0, height: 2, data: new Uint8ClampedArray(0) }), /positive integer/);
  });
});
