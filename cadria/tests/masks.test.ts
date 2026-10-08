// # masks.test — the mask plane algebra of the studio: the grid builders,
// the add, subtract and intersect combination, the inversion, threshold
// and boolean bridges, the bounds, the crop and the shape generators,
// runnable with the node built-in runner (no dependencies, no install):
//   node --test tests/masks.test.ts
// Every test watches the two invariants the module promises: the ops
// fold planes cell by cell with clamped values and mismatched or empty
// input answers null or the empty plane instead of throwing.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  alphatoboolean,
  booleantoalpha,
  combinemasks,
  cropmask,
  ellipsemask,
  invertmask,
  makeboolean,
  makeopacity,
  maskbounds,
  maskcoverage,
  maskstack,
  rectmask,
  thresholdmask,
} from "../masks.ts";

describe("masks", () => {
  it("builds opacity and boolean grids with clamped fills", () => {
    const plane = makeopacity(2, 3, 1);
    assert.equal(plane.width, 2);
    assert.equal(plane.height, 3);
    assert.equal(plane.data.length, 6);
    for (const value of plane.data) assert.equal(value, 1);
    const hot = makeopacity(2, 2, 5);
    for (const value of hot.data) assert.equal(value, 1);
    const bits = makeboolean(3, 2, 7);
    assert.equal(bits.data.length, 6);
    for (const value of bits.data) assert.equal(value, 1);
    const off = makeboolean(2, 2, 0);
    for (const value of off.data) assert.equal(value, 0);
  });

  it("combines planes with the add, subtract and intersect ops", () => {
    const left = makeopacity(2, 1, 0);
    left.data[0] = 1;
    const right = makeopacity(2, 1, 0);
    right.data[1] = 1;
    const added = combinemasks(left, right, "add") as NonNullable<ReturnType<typeof combinemasks>>;
    assert.equal(added.data[0], 1);
    assert.equal(added.data[1], 1);
    const full = makeopacity(2, 1, 1);
    const cut = makeopacity(2, 1, 0);
    cut.data[0] = 1;
    const subtracted = combinemasks(full, cut, "subtract") as NonNullable<ReturnType<typeof combinemasks>>;
    assert.equal(subtracted.data[0], 0);
    assert.equal(subtracted.data[1], 1);
    const half = makeopacity(2, 1, 0);
    half.data[0] = 0.5;
    const intersected = combinemasks(full, half, "intersect") as NonNullable<ReturnType<typeof combinemasks>>;
    assert.ok(Math.abs(intersected.data[0] - 0.5) < 1e-6);
    assert.equal(intersected.data[1], 0);
    assert.equal(combinemasks(makeopacity(2, 1), makeopacity(3, 1), "add"), null);
  });

  it("inverts a plane cell by cell", () => {
    const plane = makeopacity(2, 1, 0);
    plane.data[0] = 0.2;
    plane.data[1] = 0.8;
    const flipped = invertmask(plane);
    assert.ok(Math.abs(flipped.data[0] - 0.8) < 1e-6);
    assert.ok(Math.abs(flipped.data[1] - 0.2) < 1e-6);
  });

  it("crops to the bounds of the painted rectangle", () => {
    const rect = rectmask(4, 4, 1, 1, 2, 2);
    assert.equal(maskcoverage(rect), 4 / 16);
    const bounds = maskbounds(rect) as NonNullable<ReturnType<typeof maskbounds>>;
    assert.equal(bounds.minX, 1);
    assert.equal(bounds.minY, 1);
    assert.equal(bounds.maxX, 2);
    assert.equal(bounds.maxY, 2);
    const cropped = cropmask(rect, bounds) as NonNullable<ReturnType<typeof cropmask>>;
    assert.equal(cropped.width, 2);
    assert.equal(cropped.height, 2);
    for (const value of cropped.data) assert.equal(value, 1);
    assert.equal(maskbounds(makeopacity(2, 2, 0)), null);
    assert.equal(cropmask(rect, { minX: 3, minY: 3, maxX: 0, maxY: 0 }), null);
  });

  it("bridges the boolean and opacity domains through the threshold", () => {
    const plane = makeopacity(2, 1, 0);
    plane.data[0] = 0.9;
    plane.data[1] = 0.1;
    const bits = thresholdmask(plane);
    assert.equal(bits.data[0], 1);
    assert.equal(bits.data[1], 0);
    const back = booleantoalpha(bits);
    assert.equal(back.data[0], 1);
    assert.equal(back.data[1], 0);
    const again = alphatoboolean(back);
    assert.equal(again.data[0], 1);
    assert.equal(again.data[1], 0);
  });

  it("paints the rectangle and the ellipse shapes", () => {
    const rect = rectmask(3, 3, 0, 0, 3, 3);
    assert.equal(maskcoverage(rect), 1);
    const partial = rectmask(3, 3, 1, 1, 1, 1);
    assert.ok(Math.abs(maskcoverage(partial) - 1 / 9) < 1e-6);
    const clipped = rectmask(3, 3, 2, 2, 8, 8);
    assert.equal(maskcoverage(clipped), 1 / 9);
    const disc = ellipsemask(5, 5, 2, 2, 2, 2);
    assert.equal(disc.data[2 * 5 + 2], 1);
    assert.equal(disc.data[0], 0);
  });

  it("folds the layer stack over the base plane", () => {
    const base = makeopacity(2, 2, 0);
    const layer = rectmask(2, 2, 0, 0, 1, 1);
    const stacked = maskstack([{ grid: layer, op: "add" }], base) as NonNullable<ReturnType<typeof maskstack>>;
    assert.equal(stacked.data[0], 1);
    assert.equal(stacked.data[3], 0);
    const alone = maskstack([{ grid: layer, op: "add" }]) as NonNullable<ReturnType<typeof maskstack>>;
    assert.equal(alone.data[0], 1);
    assert.equal(maskstack([]), null);
  });
});
