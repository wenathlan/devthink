// # synthtexture.test — the texture layer's contract, runnable with the node
// built-in runner (no dependencies, no install):
//   node --test tests/synthtexture.test.ts
// The tests watch four promises: the timbre → texture ramps are monotonic in
// their documented drivers (noise densifies, warmth softens and thickens,
// brightness sheens, contrast agitates, flatness stacks, flux jitters, zcr
// refines), every answer stays finite inside TEXTURE_RANGES with the
// grainOpacity coupling intact, damaged input falls back to the neutral
// canvas preset, and everything — synthesis, scatter fields, presets,
// blends — is deterministic bit-for-bit.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AudioDescriptor } from "../audioattributes.ts";
import { DIM_ORDER } from "../audiofeatures.ts";
import type { TexturePresetName, TextureSpec } from "../synthtexture.ts";
import {
  GRAIN_COUPLING,
  JITTER_FIELD_CAP,
  jitterField,
  sanitizeTexture,
  synthTexture,
  synthTextureFromPreset,
  TEXTURE_RANGES,
  textureDistance,
  texturePresets,
} from "../synthtexture.ts";

/** neutral base vector: mid-low everywhere so single-dim overrides read clean. */
const BASE = 0.3;

/** builds a descriptor by overriding contract positions (3, 4, 16-21). */
function descriptor(dims: Record<number, number>): AudioDescriptor {
  const vector = new Array<number>(32).fill(BASE);
  for (const [k, v] of Object.entries(dims)) vector[Number(k)] = v;
  return { version: 1, seed: "feedface00ffaa11", vector, scalar: {} };
}

const WHITE_NOISE = descriptor({ 3: 0.95, 4: 0.9, 16: 0.98, 17: 0.3, 18: 0.85, 20: 0.45, 21: 0.75 });
const PURE_TONE = descriptor({ 3: 0.03, 4: 0.05, 16: 0.02, 17: 0.5, 18: 0.3, 20: 0.04, 21: 0.25 });
const WARM_DARK = descriptor({ 17: 0.9, 18: 0.08 });
const BRIGHT = descriptor({ 18: 0.95 });
/** every consumed dim broken at once — the whole descriptor is distrusted. */
const DAMAGED = descriptor({ 3: NaN, 4: 0.5, 16: 0.5, 17: 0.5, 18: 0.5, 20: 0.5, 21: 0.5 });

/** every documented bound holds (range, whole layers, grain coupling). */
function assertInRanges(spec: TextureSpec, label: string): void {
  for (const key of Object.keys(TEXTURE_RANGES) as (keyof TextureSpec)[]) {
    const { min, max } = TEXTURE_RANGES[key];
    const v = spec[key];
    assert.ok(Number.isFinite(v), `${label}.${key} finite`);
    assert.ok(v >= min && v <= max, `${label}.${key} ${v} in [${min}, ${max}]`);
  }
  assert.ok(Number.isInteger(spec.glazeLayers), `${label}.glazeLayers whole`);
  assert.ok(spec.grainOpacity <= spec.grainDensity + GRAIN_COUPLING + 1e-9, `${label} grain coupling`);
}

describe("timbre → texture ramps", () => {
  it("noise walls speckle: noisiness densifies and coarsens the grain", () => {
    const noise = synthTexture(WHITE_NOISE);
    const pure = synthTexture(PURE_TONE);
    assert.ok(noise.grainDensity > 0.7, `density ${noise.grainDensity}`);
    assert.ok(noise.grainSize > 4, `size ${noise.grainSize}`);
    assert.ok(pure.grainDensity < 0.2, `density ${pure.grainDensity}`);
    assert.ok(pure.grainSize <= 1.5, `size ${pure.grainSize}`);
  });
  it("warm mixes paint soft: warmth lifts strokeSoftness", () => {
    const soft = synthTexture(WARM_DARK);
    assert.ok(soft.strokeSoftness > 0.7, `softness ${soft.strokeSoftness}`);
  });
  it("warm + dark goes soft with the sheen off", () => {
    const spec = synthTexture(WARM_DARK);
    assert.ok(spec.strokeSoftness > 0.7, `softness ${spec.strokeSoftness}`);
    assert.ok(spec.specular < 0.2, `specular ${spec.specular}`);
  });
  it("bright mixes sheen: specular high and glazeOpacity lifts", () => {
    const bright = synthTexture(BRIGHT);
    const dark = synthTexture(WARM_DARK);
    assert.ok(bright.specular > 0.8, `specular ${bright.specular}`);
    assert.ok(bright.glazeOpacity > dark.glazeOpacity, "glazeOpacity climbs with brightness");
  });
  it("contrast agitates: turbulence climbs with dynamics range", () => {
    const high = synthTexture(descriptor({ 21: 0.9 }));
    const low = synthTexture(descriptor({ 21: 0.1 }));
    assert.ok(high.turbulence > low.turbulence, `${high.turbulence} > ${low.turbulence}`);
  });
  it("flat spectra stack washes: flatness drives glazeLayers", () => {
    const flat = synthTexture(descriptor({ 3: 0.95 }));
    const tonal = synthTexture(descriptor({ 3: 0.03 }));
    assert.equal(flat.glazeLayers, 6);
    assert.equal(tonal.glazeLayers, 1);
  });
  it("spectral motion shakes the line: flux drives strokeJitter", () => {
    const busy = synthTexture(descriptor({ 4: 0.9 }));
    const still = synthTexture(descriptor({ 4: 0.05 }));
    assert.ok(busy.strokeJitter > still.strokeJitter, "jitter climbs with flux");
    assert.ok(synthTexture(WHITE_NOISE).strokeJitter > 0.7, "noise walls jitter hard");
  });
  it("high zero crossings refine the grain at fixed noisiness", () => {
    const hissy = synthTexture(descriptor({ 16: 0.8, 20: 0.45 }));
    const round = synthTexture(descriptor({ 16: 0.8, 20: 0.05 }));
    assert.ok(hissy.grainSize < round.grainSize, `${hissy.grainSize} < ${round.grainSize}`);
  });
  it("strokeWeight grows with warmth", () => {
    const light = synthTexture(descriptor({ 17: 0.2, 21: 0.3 }));
    const mid = synthTexture(descriptor({ 17: 0.5, 21: 0.3 }));
    const heavy = synthTexture(descriptor({ 17: 0.8, 21: 0.3 }));
    assert.ok(light.strokeWeight < mid.strokeWeight && mid.strokeWeight < heavy.strokeWeight);
  });
  it("grainOpacity never outruns grainDensity + 0.2 across a sweep", () => {
    const sweep = [
      WHITE_NOISE,
      PURE_TONE,
      WARM_DARK,
      BRIGHT,
      descriptor({ 16: 0.5, 17: 0.5, 18: 0.5, 21: 0.5, 3: 0.5, 4: 0.5, 20: 0.5 }),
      descriptor({ 16: 0.75, 20: 0.3 }),
      descriptor({ 21: 1, 17: 1 }),
      descriptor({}),
    ];
    for (const d of sweep) {
      const spec = synthTexture(d);
      assert.ok(spec.grainOpacity <= spec.grainDensity + GRAIN_COUPLING + 1e-9);
    }
  });
  it("every synthesized spec is finite and inside TEXTURE_RANGES", () => {
    assertInRanges(synthTexture(WHITE_NOISE), "white-noise");
    assertInRanges(synthTexture(PURE_TONE), "pure-tone");
    assertInRanges(synthTexture(WARM_DARK), "warm-dark");
    assertInRanges(synthTexture(BRIGHT), "bright");
    assertInRanges(synthTexture(descriptor({})), "neutral");
  });
});

describe("damaged input", () => {
  it("non-finite dims fall back to the neutral canvas preset", () => {
    const canvas = texturePresets().canvas.spec;
    assert.deepEqual(synthTexture(DAMAGED), canvas);
    assert.deepEqual(synthTexture(descriptor({ 16: Infinity })), canvas);
    assert.deepEqual(synthTexture(descriptor({ 21: -NaN })), canvas);
  });
  it("missing, short or non-object descriptors fall back to canvas", () => {
    const canvas = texturePresets().canvas.spec;
    assert.deepEqual(synthTexture(null as unknown as AudioDescriptor), canvas);
    assert.deepEqual(synthTexture(undefined as unknown as AudioDescriptor), canvas);
    assert.deepEqual(synthTexture({ version: 1, seed: "x", vector: [0, 0, 0], scalar: {} }), canvas);
  });
  it("sanitizeTexture repairs wild specs into the documented ranges", () => {
    const wild = {
      grainDensity: 0.5,
      grainSize: -2,
      grainOpacity: 0.9,
      strokeSoftness: NaN,
      strokeWeight: -10,
      strokeJitter: 3,
      glazeLayers: 0.4,
      glazeOpacity: 1.5,
      specular: Infinity,
      turbulence: -1,
    } as TextureSpec;
    const fixed = sanitizeTexture(wild);
    assertInRanges(fixed, "wild");
    assert.equal(fixed.grainOpacity, fixed.grainDensity + GRAIN_COUPLING); // coupling clamps it down
    assert.equal(fixed.grainSize, 1); // damaged → range floor
  });
});

describe("jitterField", () => {
  it("is deterministic for the same seed", () => {
    assert.deepEqual(jitterField("feedface00ffaa11", 64), jitterField("feedface00ffaa11", 64));
  });
  it("stays in [-1, 1] and swings both signs", () => {
    const field = jitterField("determinism", 256);
    assert.equal(field.length, 256);
    for (const v of field) assert.ok(v >= -1 && v <= 1, `value ${v}`);
    assert.ok(
      field.some((v) => v > 0.1),
      "has positives",
    );
    assert.ok(
      field.some((v) => v < -0.1),
      "has negatives",
    );
  });
  it("differs across seeds and prefixes across counts", () => {
    const a = jitterField("seed-a", 32);
    const b = jitterField("seed-b", 32);
    assert.notDeepEqual(a, b);
    assert.deepEqual(jitterField("seed-a", 128).slice(0, 32), a); // prefix property
  });
  it("guards the count: floors, rejects damage, caps runaway asks", () => {
    assert.equal(jitterField("x", NaN).length, 0);
    assert.equal(jitterField("x", -5).length, 0);
    assert.equal(jitterField("x", 4.9).length, 4);
    assert.equal(jitterField("x", JITTER_FIELD_CAP + 1000).length, JITTER_FIELD_CAP);
  });
});

describe("presets + blending", () => {
  it("ships the three named feels, all finite, in range and coupled", () => {
    const presets = texturePresets();
    assert.deepEqual(Object.keys(presets).sort(), ["canvas", "glass", "static"]);
    assertInRanges(presets.glass.spec, "glass");
    assertInRanges(presets.canvas.spec, "canvas");
    assertInRanges(presets.static.spec, "static");
  });
  it("frozen fields hold their ground under blending", () => {
    for (const preset of Object.values(texturePresets())) {
      const blended = synthTextureFromPreset(preset.name, WHITE_NOISE);
      for (const key of preset.frozen) {
        assert.equal(blended[key], preset.spec[key], `${preset.name}.${String(key)} frozen`);
      }
    }
  });
  it("preset blends stay inside every documented range", () => {
    for (const name of ["glass", "canvas", "static"] as const) {
      assertInRanges(synthTextureFromPreset(name, WHITE_NOISE), `${name} × noise`);
      assertInRanges(synthTextureFromPreset(name, PURE_TONE), `${name} × pure`);
      assertInRanges(synthTextureFromPreset(name, DAMAGED), `${name} × damaged`);
    }
  });
  it("pure tones sit closer to glass than to static", () => {
    const target = synthTexture(PURE_TONE);
    const glass = synthTextureFromPreset("glass", PURE_TONE);
    const statik = synthTextureFromPreset("static", PURE_TONE);
    assert.equal(textureDistance(target, target), 0);
    assert.ok(
      textureDistance(glass, target) < textureDistance(statik, target),
      `${textureDistance(glass, target)} < ${textureDistance(statik, target)}`,
    );
  });
  it("noise walls sit closer to static than to glass", () => {
    const target = synthTexture(WHITE_NOISE);
    const glass = synthTextureFromPreset("glass", WHITE_NOISE);
    const statik = synthTextureFromPreset("static", WHITE_NOISE);
    assert.ok(textureDistance(statik, target) < textureDistance(glass, target));
  });
  it("unknown preset names fall back to the canvas base", () => {
    const viaCanvas = synthTextureFromPreset("canvas", WARM_DARK);
    const viaGarbage = synthTextureFromPreset("velvet" as TexturePresetName, WARM_DARK);
    assert.deepEqual(viaGarbage, viaCanvas);
  });
  it("the whole pipeline is deterministic", () => {
    assert.deepEqual(synthTexture(WHITE_NOISE), synthTexture(WHITE_NOISE));
    assert.deepEqual(synthTextureFromPreset("glass", WARM_DARK), synthTextureFromPreset("glass", WARM_DARK));
    assert.deepEqual(sanitizeTexture(synthTexture(PURE_TONE)), synthTexture(PURE_TONE));
  });
  it("reads the contract dims by documented name", () => {
    assert.equal(DIM_ORDER.length, 32);
    assert.equal(DIM_ORDER[3], "flatness");
    assert.equal(DIM_ORDER[4], "flux");
    assert.equal(DIM_ORDER[16], "noisiness");
    assert.equal(DIM_ORDER[17], "warmth");
    assert.equal(DIM_ORDER[18], "timbreBrightness");
    assert.equal(DIM_ORDER[20], "zeroCrossings");
    assert.equal(DIM_ORDER[21], "contrast");
  });
});
