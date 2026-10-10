// # synthpalette.test — the palette layer's contract, runnable with the node
// built-in runner (no dependencies, no install):
//   node --test tests/synthpalette.test.ts
// Every test watches the three promises the module makes: the descriptor's
// dims drive the documented dials (tonic hue table, brightness lightness
// ladder, noisiness wash, energy accent choir), the ink/surface pair always
// clears wcag AA through the guard's rung ladder, and the same descriptor
// always answers the same palette bit-for-bit — damaged descriptors answer
// the neutral gray-green fallback rung, never NaN, never a throw.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AudioDescriptor } from "../audioattributes.ts";
import { DIM_ORDER } from "../audiofeatures.ts";
import {
  AA_MIN_CONTRAST,
  contrastRatio,
  FALLBACK_PALETTE,
  hueDistance,
  oklchToSrgbHex,
  type Palette,
  paletteVariants,
  relativeLuminance,
  srgbHexToOklch,
  synthPalette,
  TONIC_HUE_OFFSET,
  tonicHue,
  wrapHue,
} from "../synthpalette.ts";

// seeded LCG (the audio-test voice) — deterministic "random-ish" descriptors.
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// base descriptor: c major, mid bright, mid energy; overrides by dim index.
function descriptor(overrides: Record<number, number> = {}): AudioDescriptor {
  const vector = new Array<number>(32).fill(0);
  vector[6] = 0.5;
  vector[13] = 0.8;
  vector[18] = 0.5;
  vector[22] = 0.4;
  vector[29] = 0.4;
  for (const key of Object.keys(overrides)) vector[Number(key)] = overrides[Number(key)];
  return { version: 1, seed: "0".repeat(16), vector, scalar: {} };
}

const HEX_SHAPE = /^#[0-9a-f]{6}$/;
const allHexes = (p: Palette): string[] => [p.anchor, p.ink, p.surface, ...p.support, ...p.accents];

/** the readable hex: asserts the parse instead of asserting away the type —
 * a failing convert is a palette bug, never a silence. */
function oklchOf(hex: string) {
  const value = srgbHexToOklch(hex);
  assert.ok(value, `the palette shipped an unreadable hex: ${hex}`);
  return value;
}

describe("synthpalette", () => {
  it("maps the oklch poles and a mid gray to exact hexes", () => {
    assert.equal(oklchToSrgbHex(1, 0, 0), "#ffffff");
    assert.equal(oklchToSrgbHex(0, 0, 200), "#000000");
    assert.equal(oklchToSrgbHex(0.59987, 0, 90), "#808080");
    const gray = oklchOf("#808080");
    assert.ok(Math.abs(gray.l - 0.59987) < 0.001);
    assert.ok(gray.c < 0.001);
  });

  it("renders the canonical srgb red from its oklch coordinates", () => {
    assert.equal(oklchToSrgbHex(0.627955, 0.257683, 29.2338), "#ff0000");
    const red = oklchOf("#ff0000");
    assert.ok(Math.abs(red.l - 0.627955) < 0.001);
    assert.ok(Math.abs(red.c - 0.257683) < 0.001);
    assert.ok(Math.abs(red.h - 29.2339) < 0.01);
  });

  it("round trips palette-grade colors through both directions", () => {
    for (const [l, c, h] of [
      [0.6, 0.1, 200],
      [0.75, 0.08, 320],
      [0.55, 0.14, 140],
      [0.628, 0.2577, 29.23],
    ]) {
      const hex = oklchToSrgbHex(l, c, h);
      assert.match(hex, HEX_SHAPE);
      const back = oklchOf(hex);
      assert.ok(Math.abs(back.l - l) < 0.01, `l drift for ${hex}`);
      assert.ok(Math.abs(back.c - c) < 0.01, `c drift for ${hex}`);
      assert.ok(hueDistance(back.h, h) < 2, `hue drift for ${hex}`);
    }
    assert.equal(srgbHexToOklch("nope"), null);
  });

  it("wraps and distances hues safely", () => {
    assert.equal(wrapHue(370), 10);
    assert.equal(wrapHue(-10), 350);
    assert.equal(wrapHue(720), 0);
    assert.equal(wrapHue(Number.NaN), 0);
    assert.equal(wrapHue(Number.POSITIVE_INFINITY), 0);
    assert.equal(hueDistance(10, 350), 20);
    assert.equal(hueDistance(5, 5), 0);
    assert.equal(hueDistance(0, 180), 180);
  });

  it("keeps every pitch class on its own documented hue", () => {
    assert.equal(TONIC_HUE_OFFSET.length, 12);
    assert.equal(tonicHue(0), 6);
    const hues = Array.from({ length: 12 }, (_, t) => tonicHue(t));
    for (let a = 0; a < 12; a += 1) {
      for (let b = a + 1; b < 12; b += 1) {
        assert.ok(hueDistance(hues[a], hues[b]) >= 12, `tonic ${a} vs ${b} collide`);
      }
    }
  });

  it("maps tonic dim 12 onto separated anchor hues (c vs f#)", () => {
    const c = synthPalette(descriptor({ 12: 0 }));
    const fs = synthPalette(descriptor({ 12: 6 / 11 }));
    assert.equal(c.oklch.anchor.h, tonicHue(0));
    assert.equal(fs.oklch.anchor.h, tonicHue(6));
    assert.ok(hueDistance(c.oklch.anchor.h, fs.oklch.anchor.h) >= 20);
  });

  it("deepens the anchor for minor keys (mood shadow d31)", () => {
    const major = synthPalette(descriptor());
    const minor = synthPalette(descriptor({ 31: 0.72 }));
    assert.ok(minor.oklch.anchor.c < major.oklch.anchor.c - 0.02, "minor lowers chroma");
    assert.ok(minor.oklch.anchor.l < major.oklch.anchor.l - 0.02, "minor lowers lightness");
  });

  it("climbs the lightness ladder with the brightness dims (d6 + d18)", () => {
    const dark = synthPalette(descriptor({ 6: 0.1, 18: 0.1 }));
    const bright = synthPalette(descriptor({ 6: 0.9, 18: 0.9 }));
    assert.ok(bright.oklch.anchor.l > dark.oklch.anchor.l + 0.2, "anchor rung rises");
    const darkSurface = oklchOf(dark.surface).l;
    const brightSurface = oklchOf(bright.surface).l;
    assert.ok(brightSurface > darkSurface + 0.3, "surface rides to the poles");
  });

  it("washes the support field out with noisiness (d16)", () => {
    const clean = synthPalette(descriptor({ 16: 0 }));
    const noisy = synthPalette(descriptor({ 16: 1 }));
    const meanC = (p: Palette) =>
      p.support.reduce((sum, hex) => sum + (srgbHexToOklch(hex)?.c ?? 0), 0) / p.support.length;
    assert.ok(meanC(noisy) < meanC(clean) - 0.02, `support wash ${meanC(noisy)} vs ${meanC(clean)}`);
  });

  it("scales the accent choir with the energy gauges (d22 + d29)", () => {
    assert.equal(synthPalette(descriptor({ 22: 0, 29: 0 })).accents.length, 2);
    assert.equal(synthPalette(descriptor({ 22: 0.5, 29: 0.5 })).accents.length, 3);
    assert.equal(synthPalette(descriptor({ 22: 1, 29: 1 })).accents.length, 4);
    assert.equal(synthPalette(descriptor()).accents.length, 3);
  });

  it("saturates the accents with key strength (d13)", () => {
    const weak = synthPalette(descriptor({ 13: 0 }));
    const strong = synthPalette(descriptor({ 13: 1 }));
    const weakC = oklchOf(weak.accents[0]).c;
    const strongC = oklchOf(strong.accents[0]).c;
    assert.ok(strongC > weakC + 0.05, `accent chroma ${strongC} vs ${weakC}`);
  });

  it("guards AA ink over 20 deterministic descriptors", () => {
    const next = lcg(0x9e3779b9);
    for (let i = 0; i < 20; i += 1) {
      const key = next();
      const p = synthPalette(
        descriptor({
          6: next(),
          12: next(),
          13: key,
          16: next(),
          18: next(),
          22: next(),
          29: next(),
          31: key * next(),
        }),
      );
      assert.ok(contrastRatio(p.ink, p.surface) >= AA_MIN_CONTRAST, `case ${i}: ${p.ink} on ${p.surface}`);
      for (const hex of allHexes(p)) assert.match(hex, HEX_SHAPE);
      assert.equal(p.support.length, 2);
      assert.ok(p.accents.length >= 2 && p.accents.length <= 4);
      for (const t of [p.oklch.anchor, ...p.oklch.accents]) {
        assert.ok(Number.isFinite(t.l) && Number.isFinite(t.c) && Number.isFinite(t.h));
      }
    }
  });

  it("derives light/dark/duotone variants on the anchor hue", () => {
    const base = synthPalette(descriptor({ 12: 5 / 11, 13: 1, 22: 0.9, 29: 0.9 }));
    const variants = paletteVariants(base);
    assert.equal(variants.length, 3);
    for (const v of variants) {
      assert.ok(hueDistance(v.oklch.anchor.h, base.oklch.anchor.h) <= 2, "anchor hue preserved");
      assert.ok(contrastRatio(v.ink, v.surface) >= AA_MIN_CONTRAST, "variant AA");
    }
    assert.ok(oklchOf(variants[0].surface).l > 0.9, "light variant is a gallery wall");
    assert.ok(oklchOf(variants[1].surface).l < 0.3, "dark variant is a screening room");
    const complement = wrapHue(base.oklch.anchor.h + 180);
    assert.equal(variants[2].oklch.accents[0].h, complement, "duotone leads with the complement");
    assert.equal(paletteVariants(base, 1).length, 1);
    assert.equal(paletteVariants(base, 0).length, 0);
    assert.equal(paletteVariants(base, 99).length, 3);
    assert.equal(paletteVariants(base, Number.NaN).length, 3);
  });

  it("answers the gray-green fallback for damaged descriptors", () => {
    assert.deepEqual(synthPalette(descriptor({ 7: Number.NaN })), FALLBACK_PALETTE);
    assert.deepEqual(synthPalette({ version: 1, seed: "", vector: [0, 1, 2], scalar: {} }), FALLBACK_PALETTE);
    assert.deepEqual(synthPalette(null as unknown as AudioDescriptor), FALLBACK_PALETTE);
    for (const hex of allHexes(FALLBACK_PALETTE)) assert.match(hex, HEX_SHAPE);
    assert.ok(contrastRatio(FALLBACK_PALETTE.ink, FALLBACK_PALETTE.surface) >= AA_MIN_CONTRAST);
    const sage = FALLBACK_PALETTE.oklch.anchor;
    assert.ok(sage.c < 0.05 && hueDistance(sage.h, 145) < 2);
  });

  it("answers the same palette bit-for-bit (seed-blind, vector-only)", () => {
    const d = descriptor({ 12: 9 / 11, 13: 0.6, 31: 0.3, 6: 0.7, 18: 0.3, 22: 0.7, 29: 0.2, 16: 0.5 });
    const a = synthPalette(d);
    assert.deepEqual(synthPalette(d), a);
    assert.deepEqual(synthPalette({ ...d, seed: "ffffffffffffffff" }), a);
    assert.notDeepEqual(synthPalette(descriptor({ 12: 0 })), synthPalette(descriptor({ 12: 6 / 11 })));
  });

  it("clamps runaway oklch into legal hexes and keeps the luma math sane", () => {
    assert.match(oklchToSrgbHex(5, 9, -7000), HEX_SHAPE);
    assert.equal(oklchToSrgbHex(Number.NaN, Number.NaN, Number.NaN), "#000000");
    assert.ok(Math.abs(relativeLuminance("#ffffff") - 1) < 1e-9);
    assert.equal(relativeLuminance("#000000"), 0);
    assert.equal(relativeLuminance("nope"), 0);
    assert.ok(Math.abs(contrastRatio("#ffffff", "#000000") - 21) < 1e-9);
    assert.equal(contrastRatio("nope", "#000000"), 1);
  });

  it("reads the descriptor dims where DIM_ORDER says they live", () => {
    assert.equal(DIM_ORDER[6], "brightness");
    assert.equal(DIM_ORDER[12], "tonalCenter");
    assert.equal(DIM_ORDER[13], "keyStrength");
    assert.equal(DIM_ORDER[16], "noisiness");
    assert.equal(DIM_ORDER[18], "timbreBrightness");
    assert.equal(DIM_ORDER[22], "punch");
    assert.equal(DIM_ORDER[29], "energyDrive");
    assert.equal(DIM_ORDER[31], "moodShadow");
  });
});
