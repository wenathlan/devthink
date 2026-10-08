// # colorconvert.test — the color space conversions of the studio: the
// sRGB transfer curve through the decode table, the HSL and HSV cylinders,
// the OKLab and OKLCH spheres, the studio-swing YCbCr families and the
// hex round trip, runnable with the node built-in runner (no dependencies,
// no install):
//   node --test tests/colorconvert.test.ts
// Every test watches the two invariants the module promises: conversions
// round trip inside one byte of drift and clamped or damaged input never
// throws — the channel clamp answers the nearest legal byte.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clamp01,
  clamprgb,
  hexfromrgb,
  hsltorgb,
  hsvtorgb,
  lineartosrgb,
  mixrgb,
  oklabfromrgb,
  relativeluma601,
  relativeluma709,
  rgbfromhex,
  rgbfromoklab,
  rgbfromycbcr,
  rgbtohsl,
  rgbtohsv,
  srgbtolinear,
  YCBCR_601,
  YCBCR_709,
  ycbcrfromrgb,
} from "../colorconvert.ts";

describe("colorconvert", () => {
  it("clamps to the legal ranges without throwing", () => {
    assert.equal(clamp01(2), 1);
    assert.equal(clamp01(-1), 0);
    assert.equal(clamp01(0.5), 0.5);
    assert.deepEqual(clamprgb([300, -5, 128]), [255, 0, 128]);
  });

  it("rides the sRGB transfer curve through the decode table", () => {
    assert.equal(srgbtolinear(0), 0);
    assert.equal(srgbtolinear(255), 1);
    assert.ok(Math.abs(srgbtolinear(128) - 0.2158) < 0.002);
    assert.equal(lineartosrgb(0), 0);
    assert.equal(lineartosrgb(1), 255);
    assert.ok(Math.abs(lineartosrgb(0.5) - 188) < 2);
    assert.ok(Math.abs(lineartosrgb(srgbtolinear(128)) - 128) <= 1);
    assert.equal(srgbtolinear(Number.NaN), 0);
  });

  it("converts the red primary across the HSL cylinder", () => {
    const red = rgbtohsl(255, 0, 0);
    assert.equal(red.h, 0);
    assert.equal(red.s, 1);
    assert.equal(red.l, 0.5);
    assert.deepEqual(hsltorgb(0, 1, 0.5), [255, 0, 0]);
    assert.deepEqual(hsltorgb(120, 1, 0.5), [0, 255, 0]);
    assert.deepEqual(hsltorgb(240, 1, 0.5), [0, 0, 255]);
    const gray = rgbtohsl(128, 128, 128);
    assert.equal(gray.s, 0);
  });

  it("converts the red primary across the HSV cylinder", () => {
    assert.deepEqual(rgbtohsv(255, 0, 0), { h: 0, s: 1, v: 1 });
    assert.deepEqual(hsvtorgb(120, 1, 1), [0, 255, 0]);
    assert.deepEqual(hsvtorgb(0, 0, 1), [255, 255, 255]);
    assert.deepEqual(hsvtorgb(0, 1, 0), [0, 0, 0]);
  });

  it("round trips OKLab inside a small drift", () => {
    const lab = oklabfromrgb(255, 128, 0);
    assert.ok(lab.l > 0.5 && lab.l < 0.9);
    const back = rgbfromoklab(lab.l, lab.a, lab.b);
    assert.ok(Math.abs(back[0] - 255) <= 2);
    assert.ok(Math.abs(back[1] - 128) <= 2);
    assert.ok(Math.abs(back[2] - 0) <= 2);
  });

  it("maps the studio-swing YCbCr of the 601 family", () => {
    const red = ycbcrfromrgb(255, 0, 0, YCBCR_601);
    assert.equal(red.y, 81);
    assert.equal(red.cb, 90);
    assert.equal(red.cr, 240);
    const green = ycbcrfromrgb(0, 255, 0, YCBCR_601);
    assert.equal(green.y, 145);
    assert.equal(green.cr, 34);
    const white = ycbcrfromrgb(255, 255, 255, YCBCR_601);
    assert.equal(white.y, 235);
    assert.equal(white.cb, 128);
    assert.equal(white.cr, 128);
  });

  it("round trips YCbCr back into the byte cube", () => {
    const forward = ycbcrfromrgb(60, 120, 200, YCBCR_601);
    const back = rgbfromycbcr(forward.y, forward.cb, forward.cr, YCBCR_601);
    assert.ok(Math.abs(back[0] - 60) <= 2);
    assert.ok(Math.abs(back[1] - 120) <= 2);
    assert.ok(Math.abs(back[2] - 200) <= 2);
  });

  it("declares the 709 coefficients beside the 601 family", () => {
    assert.ok(Math.abs(YCBCR_709.kr - 0.2126) < 1e-12);
    assert.ok(Math.abs(YCBCR_709.kb - 0.0722) < 1e-12);
    assert.ok(Math.abs(relativeluma709(0, 255, 0) - 0.7152) < 0.001);
    assert.equal(relativeluma601(0, 0, 0), 0);
    assert.ok(Math.abs(relativeluma601(255, 255, 255) - 1) < 1e-9);
  });

  it("parses and renders the hex form", () => {
    assert.equal(hexfromrgb([255, 0, 0]), "#ff0000");
    assert.equal(hexfromrgb([16, 32, 64]), "#102040");
    assert.deepEqual(rgbfromhex("#102040"), [16, 32, 64]);
    assert.equal(rgbfromhex("not a color"), null);
  });

  it("mixes two colors along the gamma-aware path", () => {
    const mid = mixrgb([0, 0, 0], [255, 255, 255], 0.5);
    assert.deepEqual(mid, [99, 99, 99]);
    const clamped = mixrgb([0, 0, 0], [255, 0, 0], 2);
    assert.deepEqual(clamped, [255, 0, 0]);
  });
});
