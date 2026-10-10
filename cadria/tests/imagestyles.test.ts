// # imagestyles.test — the style layer of the cadria image wave, runnable
// with the node built-in runner (no dependencies, no install):
//   node --test tests/imagestyles.test.ts
// The tests watch the promises the module makes: exactly 15 styles (5 calm,
// 5 kinetic, 5 dark) with unique lowercase names and no repeated endings,
// every bias finite inside its documented range, lookup by (normalized)
// name throwing style-unknown on misses, deterministic descriptor matching
// with the documented weighted score, stable + distinct fingerprints, and
// applyStyleBias clamping every output into its documented range even
// under stress input.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AudioDescriptor } from "../audioattributes.ts";
import { DIM_ORDER } from "../audiofeatures.ts";
import { GRAIN_COUPLING, TEXTURE_RANGES, type TextureSpec } from "../synthtexture.ts";
import {
  STYLE_MATCH_WEIGHTS,
  STYLE_RANGES,
  TEXTURE_DELTA_CAP,
  type StyleBase,
  type StyleError,
  type StyleSpec,
  applyStyleBias,
  imageStyles,
  styleByName,
  styleFingerprint,
  styleForDescriptor,
} from "../imagestyles.ts";

/** builds a descriptor from named dim overrides over a 0.5 mid field. */
function desc(over: Record<string, number> = {}, seed = "1b6e5a9c3d7f2480"): AudioDescriptor {
  const vector = new Array<number>(32).fill(0.5);
  for (const [name, value] of Object.entries(over)) vector[DIM_ORDER.indexOf(name)] = value;
  return { version: 1, seed, vector, scalar: {} };
}

/** longest common suffix length of two words — the "no repeated endings" gauge. */
function commonSuffix(a: string, b: string): number {
  let count = 0;
  while (count < a.length && count < b.length && a[a.length - 1 - count] === b[b.length - 1 - count]) count++;
  return count;
}

/** deterministic LCG for descriptor sweeps. */
function lcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

/** floating-tolerant equality for clamped arithmetic. */
function near(x: number, y: number, eps = 1e-9): void {
  assert.ok(Math.abs(x - y) < eps, `expected ${x} ≈ ${y}`);
}

describe("imagestyles table", () => {
  it("holds exactly 15 styles — 5 calm, 5 kinetic, 5 dark by first tag — with non-empty tags", () => {
    const styles = imageStyles();
    assert.equal(styles.length, 15);
    for (const family of ["calm", "kinetic", "dark"]) {
      assert.equal(styles.filter((style) => style.tags[0] === family).length, 5, family);
    }
    for (const style of styles) {
      assert.ok(style.tags.length > 0 && style.tags.every((tag) => typeof tag === "string" && tag.length > 0));
      assert.ok(typeof style.mood === "string" && style.mood.length > 8);
    }
  });

  it("names are unique lowercase words with no repeated endings", () => {
    const names = imageStyles().map((style) => style.name);
    assert.equal(new Set(names).size, 15);
    for (const name of names) assert.match(name, /^[a-z]{5,12}$/);
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        assert.ok(commonSuffix(names[i], names[j]) <= 3, `${names[i]} vs ${names[j]} share an ending`);
      }
    }
  });

  it("every bias is finite and inside its documented range; match weights sum to 1", () => {
    near(STYLE_MATCH_WEIGHTS.grain + STYLE_MATCH_WEIGHTS.motion + STYLE_MATCH_WEIGHTS.light + STYLE_MATCH_WEIGHTS.shadow, 1);
    for (const style of imageStyles()) {
      const { paletteBias: palette, compositionBias: comp, motionBias: motion } = style;
      for (const value of [palette.chroma, palette.lightness, palette.warmth]) {
        assert.ok(Number.isFinite(value) && value >= STYLE_RANGES.palette[0] && value <= STYLE_RANGES.palette[1]);
      }
      assert.ok(Number.isFinite(comp.density) && comp.density >= STYLE_RANGES.density[0] && comp.density <= STYLE_RANGES.density[1]);
      assert.ok(Number.isFinite(comp.heroScale) && comp.heroScale >= STYLE_RANGES.heroScale[0] && comp.heroScale <= STYLE_RANGES.heroScale[1]);
      assert.ok(Number.isFinite(motion.tempo) && motion.tempo >= 0 && motion.tempo <= 1);
      assert.ok(Number.isFinite(motion.driftScale) && motion.driftScale >= 0 && motion.driftScale <= 1);
      assert.ok(["mirror", "rotational", "asymmetric"].includes(comp.symmetry));
      for (const [field, delta] of Object.entries(style.textureBias)) {
        const key = field as keyof TextureSpec;
        assert.ok(Math.abs(delta as number) <= TEXTURE_DELTA_CAP[key] + 1e-9, `${style.name}.${field} over delta cap`);
      }
    }
  });

  it("bias fingerprints are distinct across the whole table", () => {
    const seen = new Set<string>();
    for (const style of imageStyles()) {
      const key = JSON.stringify([style.paletteBias, style.compositionBias, style.textureBias, style.motionBias]);
      assert.ok(!seen.has(key), `${style.name} duplicates another style's bias fingerprint`);
      seen.add(key);
    }
    assert.equal(seen.size, 15);
  });

  it("deterministic and fresh: two calls deep-equal, caller mutation is contained", () => {
    const first = imageStyles();
    const second = imageStyles();
    assert.deepEqual(first, second);
    first[0].tags.push("mutated");
    first[0].paletteBias.chroma = 9;
    assert.deepEqual(imageStyles(), second);
  });
});

describe("imagestyles lookup", () => {
  it("styleByName hits case-insensitively and returns table-equal data", () => {
    const hit = styleByName("  Opaline ");
    assert.equal(hit.name, "opaline");
    assert.deepEqual(hit, imageStyles().find((style) => style.name === "opaline"));
    assert.deepEqual(styleByName("TARNGLASS"), imageStyles()[13]);
  });

  it("unknown names throw StyleError with code style-unknown", () => {
    for (const bad of ["nope", "", "   ", "opal", "nocturne", "granfield"]) {
      assert.throws(() => styleByName(bad), (error: unknown) => error instanceof Error && (error as StyleError).code === "style-unknown" && /style-unknown/.test(error.message), `expected throw for ${JSON.stringify(bad)}`);
    }
  });
});

describe("imagestyles matching", () => {
  it("styleForDescriptor is deterministic — same descriptor, same style, deep-equal", () => {
    const probe = desc({ noisiness: 0.6, tempo: 0.7, energyDrive: 0.75, moodShadow: 0.4 });
    assert.equal(styleForDescriptor(probe).name, styleForDescriptor(probe).name);
    assert.deepEqual(styleForDescriptor(probe), styleForDescriptor(probe));
    assert.deepEqual(styleForDescriptor(probe), styleForDescriptor(desc({ noisiness: 0.6, tempo: 0.7, energyDrive: 0.75, moodShadow: 0.4 }, "other-seed")));
  });

  it("a noise-wall descriptor lands on a high-grain style (grain density delta > 0)", () => {
    const wall = desc({ noisiness: 0.95, flatness: 0.9, zeroCrossings: 0.8 });
    const style = styleForDescriptor(wall);
    assert.ok((style.textureBias.grainDensity ?? 0) > 0, `${style.name} should carry a positive grain delta`);
  });

  it("a dark descriptor (high moodShadow, low brightness) lands on a dark style", () => {
    const dark = desc({ moodShadow: 0.95, brightness: 0.1, timbreBrightness: 0.1, tempo: 0.4, energyDrive: 0.4, noisiness: 0.4 });
    assert.equal(styleForDescriptor(dark).tags[0], "dark");
  });

  it("a calm descriptor (low tempo, low energy) lands on a calm style", () => {
    const calm = desc({ tempo: 0.05, energyDrive: 0.05, noisiness: 0.3, brightness: 0.55, timbreBrightness: 0.55, moodShadow: 0.2 });
    assert.equal(styleForDescriptor(calm).tags[0], "calm");
  });

  it("a kinetic descriptor (high tempo, high energy) lands on a kinetic style", () => {
    const kinetic = desc({ tempo: 0.9, energyDrive: 0.9, noisiness: 0.6 });
    assert.equal(styleForDescriptor(kinetic).tags[0], "kinetic");
  });

  it("total over 40 LCG descriptors — always answers a table style", () => {
    const rand = lcg(0x9e3779b9);
    const names = new Set(imageStyles().map((style) => style.name));
    for (let i = 0; i < 40; i++) {
      const vector = Array.from({ length: 32 }, () => rand());
      const style = styleForDescriptor({ version: 1, seed: `sweep-${i}`, vector, scalar: {} });
      assert.ok(names.has(style.name), `${style.name} is not a table style`);
    }
  });

  it("damaged descriptors coerce to the neutral mid and still answer deterministically", () => {
    const broken: AudioDescriptor = { version: 1, seed: "bad", vector: new Array<number>(32).fill(Number.NaN), scalar: {} };
    const short: AudioDescriptor = { version: 1, seed: "short", vector: [0.1, 0.2], scalar: {} };
    assert.deepEqual(styleForDescriptor(broken), styleForDescriptor(short));
    assert.deepEqual(styleForDescriptor(broken), styleForDescriptor(desc()));
    assert.ok(new Set(imageStyles().map((style) => style.name)).has(styleForDescriptor(broken).name));
  });
});

describe("imagestyles fingerprint", () => {
  it("stable across calls and copies, 8 lowercase hex digits", () => {
    const fromTable = imageStyles().find((style) => style.name === "nocturn") as StyleSpec;
    const print = styleFingerprint(fromTable);
    assert.match(print, /^[0-9a-f]{8}$/);
    assert.equal(print, styleFingerprint(styleByName("nocturn")));
    assert.equal(print, styleFingerprint(imageStyles()[10]));
  });

  it("all 15 fingerprints are distinct", () => {
    const prints = new Set(imageStyles().map(styleFingerprint));
    assert.equal(prints.size, 15);
  });

  it("damaged styles still yield a deterministic fingerprint", () => {
    const broken = { name: "x", mood: "y" } as unknown as StyleSpec;
    assert.match(styleFingerprint(broken), /^[0-9a-f]{8}$/);
    assert.equal(styleFingerprint(broken), styleFingerprint({ ...broken }));
  });
});

describe("applyStyleBias", () => {
  it("applies opaline's palette, density, hero pull and motion multipliers", () => {
    const out = applyStyleBias(
      { chroma: 0.5, lightness: 0.5, warmth: 0.5, density: 0.5, heroScale: 0.5, strength: 1, drift: 1 },
      styleByName("opaline"),
    );
    assert.equal(out.chroma, 0); // 0.5 − 0.55 clamps at 0
    assert.equal(out.lightness, 1); // 0.5 + 0.55 clamps at 1
    near(out.warmth, 0.3);
    near(out.density, 0.7);
    near(out.heroScale, 0.44); // 0.5 + (0.38 − 0.5) · HERO_PULL
    assert.equal(out.strength, 0.15); // 1 × tempo
    assert.equal(out.drift, 0.2); // 1 × driftScale
  });

  it("pulls stressed heroScale bases back inside the 0.3-0.7 band", () => {
    for (const base of [-5, 0, 0.9, 5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const out = applyStyleBias({ heroScale: base }, styleByName("percussa"));
      assert.ok(out.heroScale >= STYLE_RANGES.heroScale[0] - 1e-9 && out.heroScale <= STYLE_RANGES.heroScale[1] + 1e-9, `base ${base} → ${out.heroScale}`);
    }
  });

  it("texture deltas land inside TEXTURE_RANGES with whole glaze layers", () => {
    const plated = applyStyleBias({ texture: { strokeWeight: 8, glazeLayers: 3 } }, styleByName("percussa"));
    near(plated.texture.strokeWeight, 16);
    assert.equal(plated.texture.glazeLayers, 3); // no delta → clamped base stays whole
    const night = applyStyleBias({ texture: { grainDensity: 0.1, glazeLayers: 3.4 } }, styleByName("nocturn"));
    assert.equal(night.texture.grainDensity, 0); // 0.1 − 0.15 clamps at 0
    assert.equal(night.texture.glazeLayers, 5); // 3.4 + 2 → 5.4 → round 5
  });

  it("stress inputs never escape: every output finite, in range, coupling kept, layers whole", () => {
    const stress: StyleBase = {
      chroma: Number.NaN, lightness: Number.POSITIVE_INFINITY, warmth: Number.NEGATIVE_INFINITY,
      density: Number.NaN, heroScale: 1e9,
      texture: {
        grainDensity: Number.NaN, grainSize: -1e9, grainOpacity: Number.POSITIVE_INFINITY, strokeSoftness: Number.NaN,
        strokeWeight: -1e9, strokeJitter: Number.POSITIVE_INFINITY, glazeLayers: Number.NaN, glazeOpacity: -1e9,
        specular: Number.POSITIVE_INFINITY, turbulence: Number.NaN,
      },
      strength: Number.NaN, drift: Number.POSITIVE_INFINITY,
    };
    for (const style of imageStyles()) {
      const out = applyStyleBias(stress, style);
      for (const value of [out.chroma, out.lightness, out.warmth, out.density, out.heroScale, out.strength, out.drift]) {
        assert.ok(Number.isFinite(value), `${style.name} leaked a non-finite scalar`);
      }
      assert.ok(out.chroma >= 0 && out.chroma <= 1 && out.lightness >= 0 && out.lightness <= 1);
      assert.ok(out.warmth >= 0 && out.warmth <= 1 && out.density >= 0 && out.density <= 1);
      assert.ok(out.strength >= 0 && out.strength <= 1 && out.drift >= 0 && out.drift <= 1);
      for (const field of Object.keys(TEXTURE_RANGES) as (keyof TextureSpec)[]) {
        const value = out.texture[field];
        const range = TEXTURE_RANGES[field];
        assert.ok(Number.isFinite(value) && value >= range.min - 1e-9 && value <= range.max + 1e-9, `${style.name}.${field} = ${value}`);
      }
      assert.ok(out.texture.grainOpacity <= out.texture.grainDensity + GRAIN_COUPLING + 1e-9, `${style.name} broke the grain coupling`);
      assert.ok(Number.isInteger(out.texture.glazeLayers));
    }
  });

  it("missing base fields take neutral defaults and the fold is deterministic", () => {
    const style = styleByName("tarnglass");
    const first = applyStyleBias({}, style);
    const second = applyStyleBias({}, style);
    assert.deepEqual(first, second);
    near(first.chroma, 0.15); // 0.5 − 0.35
    assert.equal(first.strength, 0.4); // neutral 1 × tempo
    assert.equal(first.drift, 0.5); // neutral 1 × driftScale
    assert.equal(first.texture.grainDensity, 0.2); // 0.5 − 0.3
    assert.ok(first.texture.grainOpacity <= first.texture.grainDensity + GRAIN_COUPLING + 1e-9);
  });
});
