// # rhythmgrammar.test — honest unit tests for the drum-pattern grammar
// (velocity glyphs, the eight family tables, swing offsets, seeded fills,
// accent curves and the half/double-time folding), runnable with the
// vitest runner:
//   pnpm test
// The only randomness is the engine's own mulberry32 driven by fixed seeds;
// every glyph string is a constant fixture readable by eye.
import { describe, expect, it } from "vitest";
import {
  FAMILY_NAMES,
  FAMILIES,
  LANES,
  STEPS,
  type LaneName,
  accentMap,
  applyAccents,
  applySwing,
  cloneGrid,
  emptyGrid,
  foldPattern,
  gridFromSpec,
  laneDensity,
  maybeFill,
  swingOffsets,
  validateGrid,
} from "../rhythmgrammar.ts";
import { hashSeed, mulberry32 } from "../harmonyengine.ts";

/** A spec where every lane not listed stays silent (the documented default). */
const spec = (overrides: Partial<Record<LaneName, string>>): Record<LaneName, string> =>
  overrides as Record<LaneName, string>;

/** Sixteen zeroes, the shape of a silent lane. */
const ZEROS = new Array<number>(STEPS).fill(0);

describe("grid constants and parsing", () => {
  it("documents eight lanes, eight families and sixteen steps", () => {
    expect(LANES).toEqual(["kick", "snare", "hat", "openhat", "clap", "perc", "ride", "tom"]);
    expect(new Set(LANES).size).toBe(8);
    expect(FAMILY_NAMES).toEqual(["trap", "drill", "house", "dnb", "lofi", "pop", "techno", "ambient"]);
    expect(new Set(FAMILY_NAMES).size).toBe(8);
    expect(STEPS).toBe(16);
  });

  it("parses the documented velocity glyphs", () => {
    const grid = gridFromSpec(spec({ kick: "Xx:o------------" }));
    expect(grid.steps).toBe(STEPS);
    expect(grid.lanes.kick).toEqual([1, 0.85, 0.35, 0.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it("defaults missing lanes to a silent sixteen-step row", () => {
    const grid = gridFromSpec(spec({ hat: "x---------------" }));
    expect(grid.lanes.hat[0]).toBe(0.85);
    for (const name of LANES) {
      if (name === "hat") continue;
      expect(grid.lanes[name], `lane ${name} defaults silent`).toEqual(ZEROS);
    }
    const empty = emptyGrid();
    expect(empty.steps).toBe(STEPS);
    for (const name of LANES) expect(empty.lanes[name]).toEqual(ZEROS);
    expect(validateGrid(empty)).toEqual([]);
  });

  it("refuses malformed rows outright", () => {
    expect(() => gridFromSpec(spec({ kick: "X--------------" }))).toThrow(/lane must hold 16 glyphs/);
    expect(() => gridFromSpec(spec({ kick: "Xq--------------" }))).toThrow(/unknown velocity glyph: q/);
  });
});

describe("family tables", () => {
  it("yields a valid eight-lane grid for every family", () => {
    for (const family of FAMILY_NAMES) {
      const grid = FAMILIES[family];
      expect(grid.steps).toBe(STEPS);
      for (const name of LANES) {
        expect(grid.lanes[name].length, `${family}/${name} spans the bar`).toBe(STEPS);
        for (const v of grid.lanes[name])
          expect(Number.isFinite(v) && v >= 0 && v <= 1, `${family}/${name} velocity ${v}`).toBe(true);
      }
      expect(validateGrid(grid), `${family} validates clean`).toEqual([]);
      expect(laneDensity(grid, "kick") > 0, `${family} kicks`).toBe(true);
    }
  });

  it("drives house and techno four on the floor", () => {
    for (const family of ["house", "techno"] as const)
      expect(FAMILIES[family].lanes.kick).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]);
    expect(laneDensity(FAMILIES.house, "kick")).toBe(4);
    expect(laneDensity(emptyGrid(), "tom")).toBe(0);
  });

  it("clones deeply so mutations never reach the tables", () => {
    const copy = cloneGrid(FAMILIES.trap);
    expect(copy).toEqual(FAMILIES.trap);
    expect(copy.lanes.kick).not.toBe(FAMILIES.trap.lanes.kick);
    copy.lanes.snare[8] = 0.5;
    expect(FAMILIES.trap.lanes.snare[8]).toBe(0.85);
  });
});

describe("swing", () => {
  it("stays straight at 0.5 and clamps outside the band", () => {
    expect(swingOffsets(0.5)).toEqual(ZEROS);
    expect(swingOffsets(0.4)).toEqual(ZEROS);
    expect(swingOffsets(0.8)).toEqual(ZEROS);
    expect(swingOffsets(Number.NaN)).toEqual(ZEROS);
    expect(swingOffsets(0.625).every(Number.isFinite)).toBe(true);
  });

  it("shifts the offbeat 8ths by 4r - 2 on division 2", () => {
    expect(swingOffsets(0.625, 2)).toEqual([0, 0, 0.5, 0, 0, 0, 0.5, 0, 0, 0, 0.5, 0, 0, 0, 0.5, 0]);
    expect(swingOffsets(0.75, 2)[2]).toBe(1);
  });

  it("shifts every odd 16th by 2r - 1 on division 4", () => {
    const offsets = swingOffsets(0.625, 4);
    expect(offsets.filter((_, step) => step % 2 === 1)).toEqual(new Array(8).fill(0.25));
    expect(offsets.filter((_, step) => step % 2 === 0)).toEqual(new Array(8).fill(0));
  });

  it("attaches the offsets without touching the velocities", () => {
    const swung = applySwing(FAMILIES.house, 0.58, 2);
    expect(swung.grid).toEqual(FAMILIES.house);
    expect(swung.grid).not.toBe(FAMILIES.house);
    expect(swung.offsets).toEqual(swingOffsets(0.58, 2));
  });
});

describe("accents", () => {
  it("peaks every accent map on the downbeats", () => {
    for (const family of FAMILY_NAMES) {
      const curve = accentMap(family);
      expect(curve.length).toBe(STEPS);
      expect(curve[0], `${family} peaks on the one`).toBe(Math.max(...curve));
      expect(curve.every(Number.isFinite), `${family} curve stays finite`).toBe(true);
    }
  });

  it("writes the documented per-style curves", () => {
    expect(accentMap("house")).toEqual([1.2, 0.8, 0.95, 0.8, 1.2, 0.8, 0.95, 0.8, 1.2, 0.8, 0.95, 0.8, 1.2, 0.8, 0.95, 0.8]);
    expect(accentMap("trap")).toEqual([1.2, 0.8, 0.95, 0.8, 1.1, 0.8, 0.95, 0.8, 1.2, 0.8, 0.95, 0.8, 1.1, 0.8, 0.95, 0.8]);
    expect(accentMap("ambient")).toEqual([1.05, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  });

  it("multiplies the grid by the curve and clamps to the unit band", () => {
    const accented = applyAccents(FAMILIES.house, "house");
    expect(accented.lanes.kick, "1.2 clamps back to 1").toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]);
    expect(accented.lanes.hat[2]).toBeCloseTo(0.57, 12);
    expect(accented.lanes.snare).toEqual(ZEROS);
  });
});

describe("seeded fills", () => {
  const filled = (seed: string) => maybeFill(FAMILIES.trap, mulberry32(hashSeed(seed)));

  it("passes the grid through untouched when the rng draws over the chance", () => {
    const untouched = filled("alpha"); // first draw 0.500 >= 0.25
    expect(untouched).toEqual(FAMILIES.trap);
    expect(untouched.lanes.snare).toEqual(FAMILIES.trap.lanes.snare);
    expect(untouched.lanes.hat).toEqual(FAMILIES.trap.lanes.hat);
  });

  it("replays the same fill for the same seed", () => {
    expect(filled("c")).toEqual(filled("c"));
    expect(filled("l")).toEqual(filled("l"));
  });

  it("cascades the snare over the last four steps and halves the hats", () => {
    const grid = filled("l"); // second draw 0.910 -> no tom tail
    expect(grid.lanes.snare.slice(12)).toEqual([0.85, 0.6, 0.85, 1]);
    expect(grid.lanes.hat.slice(12)).toEqual([0.425, 0.3, 0.5, 0.5]);
    expect(grid.lanes.tom.slice(14)).toEqual([0, 0]);
  });

  it("lands different fills for different seeds", () => {
    const withTom = filled("c"); // second draw 0.372 -> tom tail fires
    const withoutTom = filled("l");
    expect(withTom.lanes.tom.slice(14)).toEqual([0.85, 1]);
    expect(withTom).not.toEqual(withoutTom);
    expect(filled("c")).not.toEqual(filled("alpha"));
  });
});

describe("half/double-time folding", () => {
  const marker = gridFromSpec(spec({ kick: "X-------x-------", hat: "XxXxXxXxXxXxXxXx" }));

  it("folds half-time inside one bar: even steps carry the phrase, odd steps and the back half drop", () => {
    const folded = foldPattern(marker, 0.5);
    expect(folded.steps).toBe(STEPS);
    for (const name of LANES)
      for (let step = 1; step < STEPS; step += 2) expect(folded.lanes[name][step]).toBe(0);
    expect(folded.lanes.kick).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(folded.lanes.kick.includes(0.85)).toBe(false);
    expect(folded.lanes.hat).toEqual([1, 0, 0.85, 0, 1, 0, 0.85, 0, 1, 0, 0.85, 0, 1, 0, 0.85, 0]);
  });

  it("loops the phrase twice per bar in double time", () => {
    const folded = foldPattern(marker, 2);
    expect(folded.lanes.kick).toEqual([1, 0, 0, 0, 0.85, 0, 0, 0, 1, 0, 0, 0, 0.85, 0, 0, 0]);
    expect(folded.lanes.hat).toEqual(new Array(STEPS).fill(1));
  });
});
