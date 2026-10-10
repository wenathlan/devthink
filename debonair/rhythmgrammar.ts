// # rhythmgrammar — the drum-pattern grammar of the katexis engine (root
// layer): the sixteen-step grid, the eight documented genre families, swing
// offsets, seeded fills, accent curves and the half/double-time folding. A
// PatternGrid carries velocities only — timing lives in the beat grid
// (beatgrid.ts), so swing answers per-step offsets in step units and the
// synthesis wave turns both into hits. The family patterns are written as
// glyph strings ("-" rest, ":" ghost 0.35, "o" mid 0.6, "x" accent 0.85,
// "X" full 1) so every fixture is readable and deterministic by eye.
// Non-goals: no audio, no humanise noise (the synthesis wave owns it), no
// genre table (genrematrix reads this file). Pure and multi-mode.

/** The eight lanes of the grid. */
export type LaneName = "kick" | "snare" | "hat" | "openhat" | "clap" | "perc" | "ride" | "tom";

/** One sixteen-step bar of velocities per lane (0..1, 0 = silent). */
export interface PatternGrid {
  /** The step count, always 16. */
  steps: number;
  /** One velocity array of length 16 per lane. */
  lanes: Record<LaneName, number[]>;
}

/** A grid plus the per-step swing offsets the scheduler adds (in steps). */
export interface SwingGrid {
  /** The untouched grid (a clone). */
  grid: PatternGrid;
  /** The offset per step in step units (0 = straight). */
  offsets: number[];
}

/** The eight documented pattern families. */
export type FamilyName = "trap" | "drill" | "house" | "dnb" | "lofi" | "pop" | "techno" | "ambient";

export const LANES: readonly LaneName[] = ["kick", "snare", "hat", "openhat", "clap", "perc", "ride", "tom"];
export const FAMILY_NAMES: readonly FamilyName[] = ["trap", "drill", "house", "dnb", "lofi", "pop", "techno", "ambient"];
export const STEPS = 16;

/** The velocity glyph table. */
const VEL: Record<string, number> = { "-": 0, ":": 0.35, o: 0.6, x: 0.85, X: 1 };

/** Parses one glyph string into a velocity lane (throws on a malformed row). */
function lane(pattern: string): number[] {
  if (pattern.length !== STEPS) throw new Error(`lane must hold ${STEPS} glyphs`);
  return [...pattern].map((glyph) => {
    const velocity = VEL[glyph];
    if (velocity === undefined) throw new Error(`unknown velocity glyph: ${glyph}`);
    return velocity;
  });
}

/** Builds a grid from one glyph string per lane. */
export function gridFromSpec(spec: Record<LaneName, string>): PatternGrid {
  const lanes = {} as Record<LaneName, number[]>;
  for (const name of LANES) lanes[name] = lane(spec[name] ?? "----------------");
  return { steps: STEPS, lanes };
}

/** An all-silent grid. */
export function emptyGrid(): PatternGrid {
  return gridFromSpec({} as Record<LaneName, string>);
}

/** A deep clone (mutating a copy never touches the family tables). */
export function cloneGrid(grid: PatternGrid): PatternGrid {
  const lanes = {} as Record<LaneName, number[]>;
  for (const name of LANES) lanes[name] = [...grid.lanes[name]];
  return { steps: grid.steps, lanes };
}

/** The eight base families of the grammar (documented classic placements). */
export const FAMILIES: Record<FamilyName, PatternGrid> = {
  trap: gridFromSpec({
    // 808 hits on 1, the "and" of 2 and of 3; hats 8ths closing into a roll
    kick: "X-------x--X----", snare: "--------x-------", hat: "x-o-x-o-x-o-xoXX",
    openhat: "------------x---", clap: "--------x-------", perc: "----:-------:---",
    ride: "----------------", tom: "----------------",
  }),
  drill: gridFromSpec({
    // sliding 808, offset snare with a ghost, busier hats than trap
    kick: "X------x--X-----", snare: "--------x------:", hat: "x-o-x-oxx-o-x-o-",
    openhat: "----------------", clap: "--------x-------", perc: "--x-----:---x---",
    ride: "----------------", tom: "----------------",
  }),
  house: gridFromSpec({
    // four on the floor, clap on 2 and 4, open hats on the offbeat 8ths
    kick: "X---X---X---X---", snare: "----------------", hat: "--o---o---o---o-",
    openhat: "--x---x---x---x-", clap: "----x-------x---", perc: "-----:-----:----",
    ride: "----------------", tom: "----------------",
  }),
  dnb: gridFromSpec({
    // the classic two-step: kick 1 and the "and" of 3, snare 2 and 4
    kick: "X---------x-----", snare: "----x-------x---", hat: "x-o-x-o-x-o-x-o-",
    openhat: "------------x---", clap: "----------------", perc: "------:---------",
    ride: "----------------", tom: "----------------",
  }),
  lofi: gridFromSpec({
    // laid-back kick, swung 8th hats, soft open hat before the loop
    kick: "X-------x-x-----", snare: "----x-------x---", hat: "x-o-x-o-x-o-x-o-",
    openhat: "------------o---", clap: "----------------", perc: "------:-------:-",
    ride: "----------------", tom: "----------------",
  }),
  pop: gridFromSpec({
    // kick 1 and 3 with a pickup, clap owns the backbeat, straight 8th hats
    kick: "X-----x-X-------", snare: "----------------", hat: "x-o-x-o-x-o-x-o-",
    openhat: "------------x---", clap: "----x-------x---", perc: "----:-------:---",
    ride: "----------------", tom: "----------------",
  }),
  techno: gridFromSpec({
    // four on the floor, offbeat open hats, ghosted 16th hats throughout
    kick: "X---X---X---X---", snare: "----------------", hat: "::::::::::::::::",
    openhat: "--x---x---x---x-", clap: "----------------", perc: "----:-------:---",
    ride: "----------------", tom: "----------------",
  }),
  ambient: gridFromSpec({
    // no drums to speak of: a soft pulse, shimmering ride, sparse ghosts
    kick: "x---------------", snare: "----------------", hat: "----:-------:---",
    openhat: "----------------", clap: "----------------", perc: "--------:-------",
    ride: "x-------:-------", tom: "----------------",
  }),
};

/** The problems of a grid (wrong step count, lane lengths, velocity range). */
export function validateGrid(grid: PatternGrid): string[] {
  const problems: string[] = [];
  if (grid.steps !== STEPS) problems.push(`steps must be ${STEPS}`);
  for (const name of LANES) {
    const values = grid.lanes[name];
    if (values === undefined) {
      problems.push(`missing lane: ${name}`);
      continue;
    }
    if (values.length !== STEPS) problems.push(`lane ${name} must hold ${STEPS} steps`);
    values.forEach((v, step) => {
      if (!Number.isFinite(v) || v < 0 || v > 1) problems.push(`lane ${name} step ${step} out of range`);
    });
  }
  return problems;
}

/** The sum of a lane's velocities (0 for a silent lane). */
export function laneDensity(grid: PatternGrid, name: LaneName): number {
  return grid.lanes[name].reduce((a, b) => a + b, 0);
}

/**
 * The per-step swing offsets, in step units. The ratio is the swung midpoint
 * in [0.5, 0.75] (0.5 = straight, values outside clamp to straight);
 * division 2 swings the offbeat 8ths (steps 2, 6, 10, 14) by 4r - 2,
 * division 4 swings every odd 16th by 2r - 1.
 */
export function swingOffsets(ratio: number, division: 2 | 4 = 2): number[] {
  const offsets = new Array<number>(STEPS).fill(0);
  if (!(ratio >= 0.5 && ratio <= 0.75)) return offsets;
  for (let step = 0; step < STEPS; step++) {
    if (division === 2 && step % 4 === 2) offsets[step] = 4 * ratio - 2;
    if (division === 4 && step % 2 === 1) offsets[step] = 2 * ratio - 1;
  }
  return offsets;
}

/** Attaches swing offsets to a grid (the velocities are untouched). */
export function applySwing(grid: PatternGrid, ratio: number, division: 2 | 4 = 2): SwingGrid {
  return { grid: cloneGrid(grid), offsets: swingOffsets(ratio, division) };
}

/** The accent style per family: four-on-floor, backbeat or flat shimmer. */
const ACCENT_STYLE: Record<FamilyName, "floor" | "backbeat" | "flat"> = {
  trap: "backbeat", drill: "backbeat", dnb: "backbeat", lofi: "backbeat",
  pop: "backbeat", house: "floor", techno: "floor", ambient: "flat",
};

/** The per-step velocity multiplier curve of a family (downbeats lean in). */
export function accentMap(family: FamilyName): number[] {
  const style = ACCENT_STYLE[family];
  return Array.from({ length: STEPS }, (_, step) => {
    if (style === "flat") return step === 0 ? 1.05 : 1;
    if (step % 4 === 0) return style === "floor" ? 1.2 : step === 0 || step === 8 ? 1.2 : 1.1;
    if (step % 2 === 0) return 0.95;
    return 0.8;
  });
}

/** Multiplies a grid by a family's accent curve, clamped to [0, 1]. */
export function applyAccents(grid: PatternGrid, family: FamilyName): PatternGrid {
  const curve = accentMap(family);
  const out = cloneGrid(grid);
  for (const name of LANES)
    out.lanes[name] = out.lanes[name].map((v, step) => Math.min(1, Math.max(0, v * curve[step])));
  return out;
}

/**
 * Seeded fill pass: when the rng draws under `chance`, the last four steps
 * carry the documented snare->tom cascade (snare 0.85/0.6/0.85/1, tom 0.85/1
 * on the final two when the rng says so, hats halved); otherwise the grid
 * passes through untouched.
 */
export function maybeFill(grid: PatternGrid, rng: () => number, chance = 0.25): PatternGrid {
  const out = cloneGrid(grid);
  if (rng() >= chance) return out;
  const cascade = [0.85, 0.6, 0.85, 1];
  cascade.forEach((v, i) => {
    out.lanes.snare[STEPS - 4 + i] = Math.max(out.lanes.snare[STEPS - 4 + i], v);
    out.lanes.hat[STEPS - 4 + i] *= 0.5;
  });
  if (rng() < 0.5) {
    out.lanes.tom[STEPS - 2] = Math.max(out.lanes.tom[STEPS - 2], 0.85);
    out.lanes.tom[STEPS - 1] = Math.max(out.lanes.tom[STEPS - 1], 1);
  }
  return out;
}

/**
 * Half/double-time folding of a one-bar phrase. Double-time samples every
 * second step (the phrase loops twice per bar); half-time reads the phrase
 * at half resolution — source steps 0..7 land on the even steps, odd steps
 * stay silent and later steps drop (fold before fills, then let the
 * generator re-add one). Collisions merge by max velocity.
 */
export function foldPattern(grid: PatternGrid, factor: 0.5 | 2): PatternGrid {
  const out = emptyGrid();
  for (const name of LANES) {
    const source = grid.lanes[name];
    out.lanes[name] = Array.from({ length: STEPS }, (_, step) => {
      if (factor === 2) return source[(2 * step) % STEPS] ?? 0;
      return step % 2 === 0 ? source[step / 2] ?? 0 : 0;
    });
  }
  return out;
}
