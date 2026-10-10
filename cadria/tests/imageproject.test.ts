// # imageproject.test — the PROJECT layer's contract, runnable with the node
// built-in runner (no dependencies, no install):
//   node --test tests/imageproject.test.ts
// The tests watch five promises: the seeded rng replays bit-for-bit and stays
// uniform, buildImageProject validates every field and derives the rest
// (audio stats, id slug, orientation), the bundle is deep-frozen while its
// inputs stay untouched, serialize→parse round trips exactly (and refuses
// other versions), and projectVariants keep the audio while rotating seed +
// anchor hue. Every damage path answers ProjectError with its taxonomy code.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AudioDescriptor } from "../audioattributes.ts";
import { compositionBlocks } from "../synthcomposition.ts";
import { synthMotion } from "../synthmotion.ts";
import { synthPalette } from "../synthpalette.ts";
import { synthTexture } from "../synthtexture.ts";
import type { ImageProject } from "../imageproject.ts";
import {
  ProjectError,
  VARIANT_HUE_STEP,
  buildImageProject,
  parseProject,
  projectVariants,
  rngFromSeed,
  rngInt,
  rngPick,
  serializeProject,
} from "../imageproject.ts";

const SEED = "9a7c1e2b44d0f836";

/** a contract-true fixture descriptor: 32 mid dims, a few peaks, real scalars. */
function descriptor(): AudioDescriptor {
  const vector = new Array<number>(32).fill(0.4);
  vector[9] = 0.6; vector[12] = 0.8; vector[22] = 0.7; vector[24] = 0.6; vector[26] = 1; vector[27] = 0.5; vector[29] = 0.55;
  return { version: 1, seed: SEED, vector, scalar: { bpm: 124, durationMs: 96000, tonic: 9, minor: 1 } };
}

/** a fully valid project assembled from the real wave-2 synth chain. */
function project(width = 1080, height = 1080, seed?: string): ImageProject {
  const d = descriptor();
  return buildImageProject({
    descriptor: d, seed, palette: synthPalette(d), blocks: compositionBlocks(d),
    texture: synthTexture(d), motion: synthMotion(d), width, height,
  });
}

/** the fixture's four wave-2 specs, ready to mix into damaged builds. */
function specs() {
  const d = descriptor();
  return { d, palette: synthPalette(d), blocks: compositionBlocks(d), texture: synthTexture(d), motion: synthMotion(d) };
}

/** runs fn, asserts a ProjectError comes back, answers its taxonomy code. */
function codeOf(run: () => unknown): string {
  try {
    run();
  } catch (error) {
    assert.ok(error instanceof ProjectError, "throws ProjectError");
    return error.code;
  }
  assert.fail("expected a throw");
}

describe("seeded rng", () => {
  it("same seed replays the identical 100-draw sequence; another seed differs", () => {
    const a = Array.from({ length: 100 }, () => rngFromSeed(SEED)());
    const b = Array.from({ length: 100 }, () => rngFromSeed(SEED)());
    assert.deepEqual(a, b);
    const other = Array.from({ length: 100 }, () => rngFromSeed("another-lane")());
    assert.notDeepEqual(a, other);
  });

  it("draws land in [0,1) with a sane mean over 1000 draws", () => {
    const rng = rngFromSeed("distribution-probe");
    const draws = Array.from({ length: 1000 }, () => rng());
    for (const v of draws) assert.ok(v >= 0 && v < 1, `draw ${v} in [0,1)`);
    const mean = draws.reduce((sum, v) => sum + v, 0) / draws.length;
    assert.ok(mean >= 0.4 && mean <= 0.6, `mean ${mean} in 0.4-0.6`);
  });

  it("rngInt is inclusive and deterministic; rngPick stays in the list; damage coded", () => {
    const rng = rngFromSeed("int-probe");
    const draws = Array.from({ length: 200 }, () => rngInt(rng, 2, 5));
    for (const v of draws) assert.ok(Number.isInteger(v) && v >= 2 && v <= 5, `int ${v} in [2,5]`);
    assert.ok(new Set(draws).size > 1, "both bounds reachable");
    assert.deepEqual(
      Array.from({ length: 8 }, () => rngInt(rngFromSeed("same-lane"), 0, 9)),
      Array.from({ length: 8 }, () => rngInt(rngFromSeed("same-lane"), 0, 9)),
    );
    for (let i = 0; i < 20; i += 1) assert.ok(["a", "b", "c"].includes(rngPick(rng, ["a", "b", "c"])));
    assert.equal(codeOf(() => rngPick(rng, [] as string[])), "project-shape");
    assert.equal(codeOf(() => rngInt(rng, 5, 2)), "project-range");
    assert.equal(codeOf(() => rngInt(rng, 1.5, 4)), "project-range");
  });
});

describe("buildImageProject", () => {
  it("validates and derives every field from the wave-2 chain", () => {
    const p = project();
    assert.equal(p.version, 1);
    assert.equal(p.seed, SEED); // seed defaults to descriptor.seed
    assert.equal(p.style, "atelier"); // style default
    assert.equal(p.id, `${SEED}-atelier`); // slug of seed + style
    assert.deepEqual(p.audio, { durationMs: 96000, bpm: 124, key: "am" });
    assert.deepEqual(p.canvas, { width: 1080, height: 1080, orientation: "square" });
    assert.equal(p.descriptor.seed, SEED);
    assert.equal(p.descriptor.vector.length, 32);
    assert.equal(Object.keys(p.texture).length, 10);
    assert.ok(p.blocks.length >= 1 && p.motion.keyframes.length >= 1);
    assert.equal(Number.isNaN(Date.parse(p.createdAt)), false); // ISO stamp present
  });

  it("orientation derives square / portrait / landscape from w×h", () => {
    assert.equal(project(1080, 1080).canvas.orientation, "square");
    assert.equal(project(1080, 1350).canvas.orientation, "portrait");
    assert.equal(project(1350, 1080).canvas.orientation, "landscape");
  });

  it("id slug is deterministic, slugified and seed-sensitive", () => {
    assert.equal(project(1080, 1080).id, project(1080, 1080).id);
    assert.notEqual(project(1080, 1080, "aa11bb22cc33").id, project(1080, 1080, "dd44ee55ff66").id);
    const d = descriptor();
    const styled = buildImageProject({
      descriptor: d, style: "Atelier V2!", palette: synthPalette(d), blocks: compositionBlocks(d),
      texture: synthTexture(d), motion: synthMotion(d),
    });
    assert.equal(styled.id, `${SEED}-atelier-v2`);
  });

  it("the bundle is deep-frozen at every level; caller inputs stay untouched", () => {
    const d = descriptor();
    const palette = synthPalette(d);
    const p = buildImageProject({
      descriptor: d, palette, blocks: compositionBlocks(d), texture: synthTexture(d), motion: synthMotion(d),
    });
    for (const frozen of [p, p.audio, p.descriptor, p.descriptor.vector, p.descriptor.scalar, p.palette,
      p.palette.support, p.palette.accents, p.palette.oklch.anchor, p.blocks, p.blocks[0].rect, p.texture,
      p.motion, p.motion.keyframes[0], p.canvas]) assert.ok(Object.isFrozen(frozen), "frozen");
    assert.equal(Object.isFrozen(d.vector), false); // the input replica is fresh
    assert.equal(Object.isFrozen(palette), false);
    assert.equal(d.vector[9], 0.6); // inputs unmutated
  });

  it("damaged input answers ProjectError code project-shape", () => {
    const { d, palette, blocks, texture, motion } = specs();
    const short = { version: 1, seed: "x", vector: new Array(31).fill(0.5), scalar: {} } as unknown as AudioDescriptor;
    assert.equal(codeOf(() => buildImageProject({ descriptor: short, palette, blocks, texture, motion })), "project-shape");
    assert.equal(codeOf(() => buildImageProject({ descriptor: d, palette, blocks: [], texture, motion })), "project-shape");
    assert.equal(codeOf(() => buildImageProject({ descriptor: d, palette: { ...palette, anchor: "red" }, blocks, texture, motion })), "project-shape");
    assert.equal(codeOf(() => buildImageProject({ descriptor: d, palette, blocks, texture, motion: { ...motion, easing: "elastic" } })), "project-shape");
    assert.equal(codeOf(() => buildImageProject({ descriptor: d, palette, blocks, texture: { ...texture, grainSize: "fat" }, motion })), "project-shape");
    assert.equal(codeOf(() => buildImageProject(null as never)), "project-shape");
  });

  it("non-finite / out-of-range numbers answer ProjectError code project-range", () => {
    const { d, palette, blocks, texture, motion } = specs();
    const nanPalette = { ...palette, oklch: { ...palette.oklch, anchor: { ...palette.oklch.anchor, l: NaN } } };
    assert.equal(codeOf(() => buildImageProject({ descriptor: d, palette: nanPalette, blocks, texture, motion })), "project-range");
    const nanVector = descriptor();
    nanVector.vector[3] = NaN;
    assert.equal(codeOf(() => buildImageProject({ descriptor: nanVector, palette, blocks, texture, motion })), "project-range");
    assert.equal(codeOf(() => buildImageProject({ descriptor: d, palette, blocks, texture: { ...texture, grainDensity: 4 }, motion })), "project-range");
    const fat = blocks.map((b, i) => (i === 0 ? { ...b, weight: 1.5 } : b));
    assert.equal(codeOf(() => buildImageProject({ descriptor: d, palette, blocks: fat, texture, motion })), "project-range");
    assert.equal(codeOf(() => buildImageProject({ descriptor: d, palette, blocks, texture, motion, width: 99999 })), "project-range");
    assert.equal(codeOf(() => buildImageProject({ descriptor: d, palette, blocks, texture, motion: { ...motion, parallaxDepth: 2 } })), "project-range");
  });

  it("an unreadable descriptor or bundle version answers project-version", () => {
    const { palette, blocks, texture, motion } = specs();
    const v2 = { ...descriptor(), version: 2 } as unknown as AudioDescriptor;
    assert.equal(codeOf(() => buildImageProject({ descriptor: v2, palette, blocks, texture, motion })), "project-version");
    const p = project();
    const bumped = JSON.stringify({ ...JSON.parse(serializeProject(p)), version: 2 });
    assert.equal(codeOf(() => parseProject(bumped)), "project-version");
  });
});

describe("serialize / parse", () => {
  it("serialize→parse round trips deep-equal, minus nothing", () => {
    const p = project(1080, 1350);
    assert.deepEqual(parseProject(serializeProject(p)), p);
  });

  it("the JSON round trip keeps everything frozen", () => {
    const parsed = parseProject(serializeProject(project()));
    for (const frozen of [parsed, parsed.audio, parsed.descriptor.vector, parsed.palette,
      parsed.blocks[0].rect, parsed.texture, parsed.motion, parsed.canvas]) assert.ok(Object.isFrozen(frozen), "frozen");
  });

  it("parse refuses future versions and damaged payloads with the right code", () => {
    const raw = JSON.parse(serializeProject(project()));
    assert.equal(codeOf(() => parseProject(JSON.stringify({ ...raw, version: 99 }))), "project-version");
    assert.equal(codeOf(() => parseProject(JSON.stringify({ ...raw, version: 1.5 }))), "project-version");
    assert.equal(codeOf(() => parseProject("{not json")), "project-shape");
    assert.equal(codeOf(() => parseProject("[1,2]")), "project-shape");
    assert.equal(codeOf(() => parseProject("")), "project-shape");
    delete raw.palette;
    assert.equal(codeOf(() => parseProject(JSON.stringify(raw))), "project-shape");
  });
});

describe("projectVariants", () => {
  it("count + distinct derived seeds + identical audio/blocks/texture stats", () => {
    const p = project();
    const variants = projectVariants(p, 3);
    assert.equal(variants.length, 3);
    assert.equal(new Set(variants.map((v) => v.seed)).size, 3);
    variants.forEach((v, i) => {
      assert.equal(v.seed, `${SEED}::variant${i}`);
      assert.deepEqual(v.audio, p.audio); // same audio stats
      assert.deepEqual(v.blocks, p.blocks);
      assert.deepEqual(v.texture, p.texture);
      assert.notEqual(v.id, p.id); // fresh slug
    });
    assert.equal(projectVariants(p, 0).length, 0);
    assert.equal(codeOf(() => projectVariants(p, -1)), "project-range");
    assert.equal(codeOf(() => projectVariants(p, 1.5)), "project-range");
  });

  it("the documented golden-angle rotation moves the anchor hue, accents untouched", () => {
    const p = project();
    const baseHue = p.palette.oklch.anchor.h;
    projectVariants(p, 2).forEach((v, i) => {
      const delta = (v.palette.oklch.anchor.h - baseHue + 360) % 360;
      assert.ok(Math.abs(delta - ((i + 1) * VARIANT_HUE_STEP) % 360) < 1e-6, `delta ${delta} = (i+1)·step`);
      assert.notEqual(v.palette.anchor, p.palette.anchor); // hex re-rendered
      assert.deepEqual(v.palette.oklch.accents, p.palette.oklch.accents); // accents untouched
    });
  });

  it("variants are frozen bundles that serialize too", () => {
    const v = projectVariants(project(), 1)[0];
    assert.ok(Object.isFrozen(v) && Object.isFrozen(v.palette));
    assert.deepEqual(parseProject(serializeProject(v)), v);
  });
});
