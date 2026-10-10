// # synthcomposition.test — the composition grammar of the cadria image wave,
// runnable with the node built-in runner (no dependencies, no install):
//   node --test tests/synthcomposition.test.ts
// The tests watch the promises the module makes: the grid grammar tracks
// section density and repetition (dense → more columns, repetitive → a tight
// regular lattice), the role cast is exact (one hero, always the largest and
// heaviest; ≤ 8 cadre; edge blocks own the border), the contour anchors the
// hero vertically (rise high, fall low, arch centered, wave two peaks), the
// geometry is total (rects inside 0-1, no overlap beyond the gutter
// tolerance, weights summing to 1) and everything is deterministic — same
// descriptor, same blocks; different seed, different jitter.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AudioDescriptor } from "../audioattributes.ts";
import { DIM_ORDER, NARRATIVE_CONTOUR } from "../audiofeatures.ts";
import {
  GRID_MAX,
  GRID_MIN,
  HISTOGRAM_BINS,
  type Block,
  compositionBalance,
  compositionBlocks,
  compositionGrid,
  rhythmScatter,
} from "../synthcomposition.ts";

/** builds a descriptor from named dim overrides over a 0.5 mid field. */
function desc(over: Record<string, number> = {}, seed = "9a2f41c07b3d5e88"): AudioDescriptor {
  const vector = new Array<number>(32).fill(0.5);
  for (const [name, value] of Object.entries(over)) vector[DIM_ORDER.indexOf(name)] = value;
  return { version: 1, seed, vector, scalar: {} };
}

const CONTOUR = NARRATIVE_CONTOUR;
/** dense modern production: many sections, some repetition, a real peak. */
const dense = desc({ sectionDensity: 0.9, repetition: 0.2, peakMass: 0.8, narrativeContour: CONTOUR.arch });
/** sparse through-composed clip: few sections, little repetition. */
const sparse = desc({ sectionDensity: 0.05, repetition: 0.05, peakMass: 0.3 });
/** loop-pack tile: maximal repetition over dense sections. */
const repetitive = desc({ sectionDensity: 0.9, repetition: 1, peakMass: 0.5 });
/** every structure dim broken at once. */
const damaged = desc({ sectionDensity: NaN, repetition: NaN, peakMass: NaN, narrativeContour: NaN, onsetDensity: NaN, swing: NaN });

function heroOf(blocks: Block[]): Block {
  const heroes = blocks.filter((b) => b.role === "hero");
  assert.equal(heroes.length, 1);
  return heroes[0];
}

function area(b: Block): number {
  return b.rect.w * b.rect.h;
}

/** a block touches the canvas border when one of its edges sits on 0 or 1. */
function touchesBorder(b: Block): boolean {
  const r = b.rect;
  return r.x === 0 || r.y === 0 || Math.abs(r.x + r.w - 1) < 1e-9 || Math.abs(r.y + r.h - 1) < 1e-9;
}

describe("synthcomposition grid", () => {
  it("tracks section density into more columns, inside the documented 3-12 range", () => {
    const denseGrid = compositionGrid(dense);
    const sparseGrid = compositionGrid(sparse);
    assert.ok(denseGrid.columns > sparseGrid.columns);
    for (const grid of [denseGrid, sparseGrid]) {
      assert.ok(grid.columns >= GRID_MIN && grid.columns <= GRID_MAX);
      assert.ok(grid.rows >= GRID_MIN && grid.rows <= GRID_MAX);
    }
    assert.equal(compositionGrid(desc({ sectionDensity: 1 })).columns, GRID_MAX);
    assert.equal(compositionGrid(desc({ sectionDensity: 0 })).columns, GRID_MIN);
  });

  it("tiles repetitive audio as a tight regular lattice with uniform cells", () => {
    const tight = compositionGrid(repetitive);
    const loose = compositionGrid(sparse);
    assert.equal(tight.rows, tight.columns); // regular: square lattice
    assert.ok(tight.gutter <= 0.012);
    assert.ok(tight.margin < 0.03);
    assert.ok(loose.gutter > 0.03);
    const fields = compositionBlocks(repetitive).filter((b) => b.role === "field");
    assert.ok(fields.length > 0);
    for (const b of fields) {
      assert.equal(b.rect.w, fields[0].rect.w);
      assert.equal(b.rect.h, fields[0].rect.h);
    }
  });

  it("keeps the grammar total on damaged descriptors", () => {
    const grid = compositionGrid(damaged);
    assert.ok(Number.isInteger(grid.columns) && Number.isInteger(grid.rows));
    assert.ok(grid.columns >= GRID_MIN && grid.columns <= GRID_MAX);
    assert.ok(grid.rows >= GRID_MIN && grid.rows <= GRID_MAX);
    assert.ok(Number.isFinite(grid.gutter) && grid.gutter >= 0);
    assert.ok(Number.isFinite(grid.margin) && grid.margin >= 0);
  });
});

describe("synthcomposition blocks", () => {
  it("casts exactly one hero and it is the largest, heaviest block", () => {
    const blocks = compositionBlocks(dense);
    const hero = heroOf(blocks);
    for (const b of blocks) {
      if (b.role !== "hero") assert.ok(area(hero) > area(b));
    }
    const top = blocks.reduce((max, b) => Math.max(max, b.weight), 0);
    assert.equal(hero.weight, top);
  });

  it("rings the hero with at most 8 cadre and fills field and edge roles", () => {
    const blocks = compositionBlocks(dense);
    const cadres = blocks.filter((b) => b.role === "cadre");
    const edges = blocks.filter((b) => b.role === "edge");
    const fields = blocks.filter((b) => b.role === "field");
    assert.ok(cadres.length >= 1 && cadres.length <= 8);
    assert.equal(cadres.length, 8); // the dense hero always gets its full ring
    assert.ok(edges.length > 0 && fields.length > 0);
    for (const b of edges) assert.ok(touchesBorder(b));
    for (const b of fields) assert.ok(!touchesBorder(b));
  });

  it("places the hero high on a rise contour", () => {
    const rise = desc({ sectionDensity: 0.9, repetition: 0.2, peakMass: 0.8, narrativeContour: CONTOUR.rise });
    const hero = heroOf(compositionBlocks(rise));
    const centerY = hero.rect.y + hero.rect.h / 2;
    assert.ok(centerY < 0.45, `rise hero centerY ${centerY} should sit above 0.45`);
  });

  it("places the hero low on a fall contour", () => {
    const fall = desc({ sectionDensity: 0.9, repetition: 0.2, peakMass: 0.8, narrativeContour: CONTOUR.fall });
    const hero = heroOf(compositionBlocks(fall));
    const centerY = hero.rect.y + hero.rect.h / 2;
    assert.ok(centerY > 0.55, `fall hero centerY ${centerY} should sit below 0.55`);
  });

  it("centers the hero on an arch contour", () => {
    const hero = heroOf(compositionBlocks(dense));
    const centerY = hero.rect.y + hero.rect.h / 2;
    assert.ok(Math.abs(centerY - 0.5) <= 0.05, `arch hero centerY ${centerY} should sit near 0.5`);
  });

  it("splits a wave contour into two peaks", () => {
    const wave = desc({ sectionDensity: 0.9, repetition: 0.2, peakMass: 0.4, narrativeContour: CONTOUR.wave });
    const blocks = compositionBlocks(wave);
    const hero = heroOf(blocks);
    assert.ok(hero.rect.y + hero.rect.h / 2 < 0.5);
    const lowCadre = blocks.filter((b) => b.role === "cadre" && b.rect.y + b.rect.h / 2 > 0.55);
    assert.ok(lowCadre.length >= 1, "the mirrored second peak should ring low");
  });

  it("keeps every rect finite and inside the normalized canvas", () => {
    for (const d of [dense, sparse, repetitive, damaged]) {
      for (const b of compositionBlocks(d)) {
        for (const v of [b.rect.x, b.rect.y, b.rect.w, b.rect.h]) {
          assert.ok(Number.isFinite(v) && v >= 0 && v <= 1);
        }
      }
    }
  });

  it("never lets blocks overlap beyond the gutter tolerance", () => {
    const jittery = desc({ sectionDensity: 0.9, repetition: 0.2, peakMass: 0.8, narrativeContour: CONTOUR.arch, onsetDensity: 1, swing: 0 });
    const tol = compositionGrid(jittery).gutter + 1e-9;
    const scattered = rhythmScatter(jittery, compositionBlocks(jittery));
    for (let i = 0; i < scattered.length; i += 1) {
      for (let j = i + 1; j < scattered.length; j += 1) {
        const a = scattered[i].rect;
        const b = scattered[j].rect;
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        assert.ok(!(ox > tol && oy > tol), `blocks ${i} and ${j} overlap beyond the gutter`);
      }
    }
  });

  it("normalizes weights to sum 1, each inside (0, 1]", () => {
    for (const d of [dense, sparse, repetitive, damaged]) {
      const blocks = compositionBlocks(d);
      const sum = blocks.reduce((acc, b) => acc + b.weight, 0);
      assert.ok(Math.abs(sum - 1) < 1e-9);
      for (const b of blocks) assert.ok(b.weight > 0 && b.weight <= 1 + 1e-12);
    }
  });
});

describe("synthcomposition rhythm scatter", () => {
  it("answers identical blocks for identical descriptors and grids", () => {
    assert.deepEqual(compositionBlocks(dense), compositionBlocks(dense));
    assert.deepEqual(compositionBlocks(dense, compositionGrid(dense)), compositionBlocks(dense));
    const blocks = compositionBlocks(dense);
    assert.deepEqual(rhythmScatter(dense, blocks), rhythmScatter(dense, blocks));
  });

  it("jitters differently under different seeds, same roles and weights", () => {
    const a = desc({ sectionDensity: 0.9, repetition: 0.1, peakMass: 0.5, onsetDensity: 1 }, "1111111111111111");
    const b = desc({ sectionDensity: 0.9, repetition: 0.1, peakMass: 0.5, onsetDensity: 1 }, "2222222222222222");
    const blocks = compositionBlocks(a);
    const scatteredA = rhythmScatter(a, blocks);
    const scatteredB = rhythmScatter(b, blocks);
    assert.deepEqual(scatteredA.map((s) => [s.role, s.weight]), scatteredB.map((s) => [s.role, s.weight]));
    assert.ok(
      scatteredA.some((s, i) => s.rect.x !== scatteredB[i].rect.x || s.rect.y !== scatteredB[i].rect.y),
      "distinct seeds must move at least one block",
    );
  });

  it("leans the jitter late under swing", () => {
    const base = { sectionDensity: 0.9, repetition: 0.1, peakMass: 0.5, onsetDensity: 1 };
    const straight = rhythmScatter(desc(base, "feedfacefeedface"), compositionBlocks(desc(base)));
    const swung = rhythmScatter(desc({ ...base, swing: 1 }, "feedfacefeedface"), compositionBlocks(desc(base)));
    const meanX = (blocks: Block[]): number => blocks.reduce((acc, b) => acc + b.rect.x, 0) / blocks.length;
    assert.ok(meanX(swung) > meanX(straight), "swing should push the jitter field in +x");
  });
});

describe("synthcomposition balance", () => {
  it("audits a symmetric fixture near the canvas center with a full histogram", () => {
    const symmetric = desc({ sectionDensity: 0.5, repetition: 0.5, peakMass: 0.2, narrativeContour: CONTOUR.arch });
    const report = compositionBalance(compositionBlocks(symmetric));
    assert.ok(Math.abs(report.centerX - 0.5) <= 0.15, `centerX ${report.centerX}`);
    assert.ok(Math.abs(report.centerY - 0.5) <= 0.15, `centerY ${report.centerY}`);
    assert.equal(report.densityHistogram.length, HISTOGRAM_BINS);
    const histSum = report.densityHistogram.reduce((acc, v) => acc + v, 0);
    assert.ok(Math.abs(histSum - 1) < 1e-9);
    for (const v of report.densityHistogram) assert.ok(Number.isFinite(v) && v >= 0);
  });

  it("stays finite and neutral on damaged input", () => {
    const blocks = compositionBlocks(damaged);
    assert.equal(blocks.length, 9); // the quiet 3x3 fallback: one hero, a full ring, no fill
    for (const b of blocks) {
      for (const v of [b.rect.x, b.rect.y, b.rect.w, b.rect.h, b.weight]) assert.ok(Number.isFinite(v));
    }
    const report = compositionBalance(blocks);
    for (const v of [report.centerX, report.centerY, ...report.densityHistogram]) assert.ok(Number.isFinite(v));
    const scattered = rhythmScatter(damaged, blocks);
    for (const b of scattered) {
      for (const v of [b.rect.x, b.rect.y, b.rect.w, b.rect.h]) assert.ok(Number.isFinite(v) && v >= 0 && v <= 1);
    }
  });
});
