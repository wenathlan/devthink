// # blendmodes.test — the separable blend formulas of the compositing
// standard over the 0-1 and 0-255 domains, the non-separable luminance
// modes and the W3C alpha composite, runnable with the node built-in
// runner (no dependencies, no install):
//   node --test tests/blendmodes.test.ts
// Every test watches the two invariants the module promises: the channel
// formulas match the published equations exactly and clamped inputs
// never throw — damaged input answers the clamped or source value.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  alphacomposite,
  blendchannel,
  blendchannel01,
  blendpixel,
  blendrgb,
  blendrgb01,
  isseparable,
  lumaof,
} from "../blendmodes.ts";

describe("blendmodes", () => {
  it("answers the exact separable formulas in the 0-1 domain", () => {
    assert.equal(blendchannel01("multiply", 0.5, 0.5), 0.25);
    assert.ok(Math.abs(blendchannel01("screen", 0.5, 0.5) - 0.75) < 1e-12);
    assert.equal(blendchannel01("difference", 0.8, 0.3), 0.5);
    assert.ok(Math.abs(blendchannel01("exclusion", 0.5, 0.4) - 0.5) < 1e-12);
    assert.equal(blendchannel01("darken", 0.7, 0.2), 0.2);
    assert.equal(blendchannel01("lighten", 0.7, 0.2), 0.7);
    assert.equal(blendchannel01("normal", 0.3, 0.9), 0.9);
  });

  it("answers the dodge and burn edge cases of the published equations", () => {
    assert.equal(blendchannel01("colordodge", 0.5, 0.5), 1);
    assert.equal(blendchannel01("colordodge", 0, 0.5), 0);
    assert.equal(blendchannel01("colordodge", 0.25, 1), 1);
    assert.equal(blendchannel01("colorburn", 0.5, 0.5), 0);
    assert.equal(blendchannel01("colorburn", 1, 0.5), 1);
    assert.equal(blendchannel01("colorburn", 0.5, 0), 0);
  });

  it("clamps damaged inputs instead of throwing", () => {
    assert.equal(blendchannel01("multiply", 2, -1), 0);
    assert.equal(blendchannel01("multiply", 5, 5), 1);
    assert.ok(Number.isNaN(blendchannel01("multiply", Number.NaN, 0.5)));
    assert.equal(blendchannel("multiply", Number.NaN, 128), 0);
  });

  it("rounds the 0-255 channel form of the same formulas", () => {
    assert.equal(blendchannel("multiply", 255, 255), 255);
    assert.equal(blendchannel("multiply", 128, 0), 0);
    assert.equal(blendchannel("normal", 10, 200), 200);
    assert.equal(blendchannel("screen", 128, 128), 192);
    assert.equal(blendchannel("multiply", 128, 128), 64);
  });

  it("blends rgb triples per channel in both domains", () => {
    assert.deepEqual(blendrgb01("multiply", [0.2, 0.4, 0.6], [0.5, 0.5, 0.5]), [0.1, 0.2, 0.3]);
    assert.deepEqual(blendrgb("screen", [0, 0, 0], [255, 255, 255]), [255, 255, 255]);
    assert.deepEqual(blendrgb("multiply", [255, 128, 0], [255, 128, 0]), [255, 64, 0]);
  });

  it("separates the separable modes from the luminance modes", () => {
    assert.equal(isseparable("multiply"), true);
    assert.equal(isseparable("softlight"), true);
    assert.equal(isseparable("hue"), false);
    assert.equal(isseparable("luminosity"), false);
  });

  it("keeps the classic luma weights of the compositing standard", () => {
    assert.ok(Math.abs(lumaof([1, 0, 0]) - 0.3) < 1e-12);
    assert.ok(Math.abs(lumaof([0, 1, 0]) - 0.59) < 1e-12);
    assert.ok(Math.abs(lumaof([0, 0, 1]) - 0.11) < 1e-12);
    assert.ok(Math.abs(lumaof([1, 1, 1]) - 1) < 1e-12);
  });

  it("composites with the W3C alpha weighting", () => {
    const opaque = alphacomposite([1, 0, 0], [0, 1, 0], [0, 0, 1], 1, 1);
    assert.ok(Math.abs(opaque.alpha - 1) < 1e-12);
    assert.deepEqual(opaque.color, [1, 0, 0]);
    const transparent = alphacomposite([1, 0, 0], [0, 1, 0], [0, 0, 1], 0, 1);
    assert.ok(Math.abs(transparent.alpha - 1) < 1e-12);
    assert.deepEqual(transparent.color, [0, 0, 1]);
    const empty = alphacomposite([1, 0, 0], [0, 1, 0], [0, 0, 1], 0, 0);
    assert.equal(empty.alpha, 0);
    assert.deepEqual(empty.color, [0, 0, 0]);
  });

  it("blends one pixel under per-layer alpha", () => {
    assert.deepEqual(blendpixel("multiply", [200, 200, 200], [100, 100, 100]), [78, 78, 78]);
    assert.deepEqual(blendpixel("normal", [200, 200, 200], [10, 20, 30]), [10, 20, 30]);
  });
});
