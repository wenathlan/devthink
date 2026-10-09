// # masks — the selection masks of the cadria image/video studio, housed at
// the cadria root beside matiz. A mask is a plane of opacities (0–1 floats)
// or a boolean grid; components combine with the local-adjustment algebra of
// the reference raw editor: Add (max), Subtract (a · (1 − c)) and Intersect
// (a · c). On top of the combination sit the operations the studio needs:
// inversion, amount scaling, feathering (a deterministic separable box blur,
// repeated passes approximating the soft edge), thresholding in both
// directions, bounds, cropping and the two base shape generators (rectangle,
// ellipse) plus the linear gradient. The clean-room pattern is absorbed from
// lightcraft (storytold/lightcraft, crates/pipeline/masks.rs — a
// PROJETO-class clean-room of local adjustments), re-derived natively in pure
// TypeScript over flat typed arrays shaped like the matiz engine: no guided
// edge refine, no image-content awareness, no brush strokes, no GPU. Every
// function is pure, validates by return type (null on mismatch) and never
// mutates its input. Non-goals: no color adjustment application (matiz owns
// pixels), no vector paths, no magic-wand/wandselect, no storage. Exports:
// 18 functions, 4 types — the honest count for this theme.

/** a plane of opacities, 0 (outside) … 1 (fully selected), row-major. */
export type OpacityGrid = { width: number; height: number; data: Float32Array };

/** a hard-edged selection, 0 or 1 per cell, row-major. */
export type BooleanGrid = { width: number; height: number; data: Uint8Array };

/** the component algebra: Add takes the max, Subtract erases, Intersect multiplies. */
export type MaskOp = "add" | "subtract" | "intersect";

/** the inclusive cell rectangle where a mask is non-empty. */
export type MaskBounds = { minX: number; minY: number; maxX: number; maxY: number };

/** one layer of a mask stack: a plane plus the operation that folds it in. */
export type MaskLayer = { grid: OpacityGrid; op: MaskOp };

function clamp01(v: number): number {
  return Number.isFinite(v) ? (v < 0 ? 0 : v > 1 ? 1 : v) : 0;
}

function dims(a: { width: number; height: number }, b: { width: number; height: number }): boolean {
  return a.width === b.width && a.height === b.height && a.width > 0 && a.height > 0;
}

/** an empty (or filled) opacity plane. */
export function makeopacity(width: number, height: number, fill = 0): OpacityGrid {
  const w = Math.max(0, Math.trunc(width));
  const h = Math.max(0, Math.trunc(height));
  const data = new Float32Array(w * h).fill(clamp01(fill));
  return { width: w, height: h, data };
}

/** an empty (or filled) boolean grid. */
export function makeboolean(width: number, height: number, fill = 0): BooleanGrid {
  const w = Math.max(0, Math.trunc(width));
  const h = Math.max(0, Math.trunc(height));
  const data = new Uint8Array(w * h).fill(fill ? 1 : 0);
  return { width: w, height: h, data };
}

/** combines two planes; dimensions must match; answers a new plane. */
export function combinemasks(a: OpacityGrid, b: OpacityGrid, op: MaskOp): OpacityGrid | null {
  if (!dims(a, b)) return null;
  const out = new Float32Array(a.data.length);
  for (let i = 0; i < out.length; i += 1) {
    const av = clamp01(a.data[i]);
    const bv = clamp01(b.data[i]);
    out[i] = op === "add" ? Math.max(av, bv) : op === "subtract" ? av * (1 - bv) : av * bv;
  }
  return { width: a.width, height: a.height, data: out };
}

/** inverts a plane (1 − v). */
export function invertmask(grid: OpacityGrid): OpacityGrid {
  const out = new Float32Array(grid.data.length);
  for (let i = 0; i < out.length; i += 1) out[i] = 1 - clamp01(grid.data[i]);
  return { width: grid.width, height: grid.height, data: out };
}

/** scales a plane by the adjustment amount, clamped to 0–1. */
export function scalemask(grid: OpacityGrid, amount: number): OpacityGrid {
  const k = Number.isFinite(amount) ? amount : 1;
  const out = new Float32Array(grid.data.length);
  for (let i = 0; i < out.length; i += 1) out[i] = clamp01(clamp01(grid.data[i]) * k);
  return { width: grid.width, height: grid.height, data: out };
}

/** one separable box-blur pass with clamped edges (deterministic). */
function boxpass(data: Float32Array, w: number, h: number, r: number, vertical: boolean): Float32Array {
  const out = new Float32Array(data.length);
  const span = 2 * r + 1;
  const outer = vertical ? w : h;
  const inner = vertical ? h : w;
  for (let o = 0; o < outer; o += 1) {
    let sum = 0;
    for (let k = -r; k <= r; k += 1) {
      const at = Math.min(inner - 1, Math.max(0, k));
      sum += data[vertical ? at * w + o : o * w + at];
    }
    for (let i = 0; i < inner; i += 1) {
      out[vertical ? i * w + o : o * w + i] = sum / span;
      const addAt = Math.min(inner - 1, i + r + 1);
      const subAt = Math.max(0, i - r);
      sum += data[vertical ? addAt * w + o : o * w + addAt] - data[vertical ? subAt * w + o : o * w + subAt];
    }
  }
  return out;
}

/** feathers a plane: a radius-r box blur repeated `passes` times (radius 0 copies). */
export function feathermask(grid: OpacityGrid, radius: number, passes = 2): OpacityGrid {
  const r = Math.max(0, Math.floor(radius));
  const count = Math.max(1, Math.trunc(passes));
  let data: Float32Array = Float32Array.from(grid.data, clamp01);
  if (r > 0 && grid.width > 0 && grid.height > 0) {
    for (let p = 0; p < count; p += 1) {
      data = boxpass(data, grid.width, grid.height, r, false);
      data = boxpass(data, grid.width, grid.height, r, true);
    }
  }
  return { width: grid.width, height: grid.height, data };
}

/** hard threshold into a boolean grid (v ≥ t). */
export function thresholdmask(grid: OpacityGrid, t = 0.5): BooleanGrid {
  const data = new Uint8Array(grid.data.length);
  for (let i = 0; i < data.length; i += 1) data[i] = grid.data[i] >= t ? 1 : 0;
  return { width: grid.width, height: grid.height, data };
}

/** boolean grid → opacity plane (0/1). */
export function booleantoalpha(mask: BooleanGrid): OpacityGrid {
  const data = new Float32Array(mask.data.length);
  for (let i = 0; i < data.length; i += 1) data[i] = mask.data[i] ? 1 : 0;
  return { width: mask.width, height: mask.height, data };
}

/** opacity plane → boolean grid (v ≥ t). */
export function alphatoboolean(grid: OpacityGrid, t = 0.5): BooleanGrid {
  return thresholdmask(grid, t);
}

/** the inclusive bounds of cells above `t`, or null when nothing is selected. */
export function maskbounds(grid: OpacityGrid, t = 0): MaskBounds | null {
  let minX = -1;
  let minY = -1;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      if (grid.data[y * grid.width + x] > t) {
        if (minX < 0 || x < minX) minX = x;
        if (minY < 0) minY = y;
        if (x > maxX) maxX = x;
        maxY = y;
      }
    }
  }
  return minX < 0 ? null : { minX, minY, maxX, maxY };
}

/** crops a plane to bounds (clamped into the plane); a degenerate crop answers null. */
export function cropmask(grid: OpacityGrid, bounds: MaskBounds): OpacityGrid | null {
  const minX = Math.max(0, Math.trunc(bounds.minX));
  const minY = Math.max(0, Math.trunc(bounds.minY));
  const maxX = Math.min(grid.width - 1, Math.trunc(bounds.maxX));
  const maxY = Math.min(grid.height - 1, Math.trunc(bounds.maxY));
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  if (w <= 0 || h <= 0 || grid.width <= 0 || grid.height <= 0) return null;
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) out[y * w + x] = grid.data[(y + minY) * grid.width + (x + minX)];
  }
  return { width: w, height: h, data: out };
}

/** a filled rectangle (clamped into the plane), full opacity. */
export function rectmask(width: number, height: number, x: number, y: number, w: number, h: number): OpacityGrid {
  const grid = makeopacity(width, height, 0);
  const x0 = Math.max(0, Math.trunc(x));
  const y0 = Math.max(0, Math.trunc(y));
  const x1 = Math.min(grid.width, Math.trunc(x) + Math.max(0, Math.trunc(w)));
  const y1 = Math.min(grid.height, Math.trunc(y) + Math.max(0, Math.trunc(h)));
  for (let yy = y0; yy < y1; yy += 1) {
    for (let xx = x0; xx < x1; xx += 1) grid.data[yy * grid.width + xx] = 1;
  }
  return grid;
}

/** an ellipse centered at (cx, cy) with radii (rx, ry); inside is full opacity. */
export function ellipsemask(
  width: number,
  height: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): OpacityGrid {
  const grid = makeopacity(width, height, 0);
  if (!(rx > 0 && ry > 0)) return grid;
  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) grid.data[y * grid.width + x] = 1;
    }
  }
  return grid;
}

/** a linear ramp 0 → 1 toward the given side ("right" ramps left-edge 0 to right-edge 1). */
export function gradientmask(width: number, height: number, direction: "up" | "down" | "left" | "right"): OpacityGrid {
  const grid = makeopacity(width, height, 0);
  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      let v: number;
      if (direction === "right") v = grid.width <= 1 ? 1 : x / (grid.width - 1);
      else if (direction === "left") v = grid.width <= 1 ? 1 : (grid.width - 1 - x) / (grid.width - 1);
      else if (direction === "down") v = grid.height <= 1 ? 1 : y / (grid.height - 1);
      else v = grid.height <= 1 ? 1 : (grid.height - 1 - y) / (grid.height - 1);
      grid.data[y * grid.width + x] = clamp01(v);
    }
  }
  return grid;
}

/** one pass of a box rank filter (max dilates, min erodes), clamped edges, deterministic. */
function rankpass(
  data: Float32Array,
  w: number,
  h: number,
  r: number,
  vertical: boolean,
  rank: "max" | "min",
): Float32Array {
  const out = new Float32Array(data.length);
  const outer = vertical ? w : h;
  const inner = vertical ? h : w;
  for (let o = 0; o < outer; o += 1) {
    for (let i = 0; i < inner; i += 1) {
      let best = data[vertical ? i * w + o : o * w + i];
      for (let k = -r; k <= r; k += 1) {
        const at = Math.min(inner - 1, Math.max(0, i + k));
        const v = data[vertical ? at * w + o : o * w + at];
        best = rank === "max" ? Math.max(best, v) : Math.min(best, v);
      }
      out[vertical ? i * w + o : o * w + i] = best;
    }
  }
  return out;
}

function rankfilter(grid: OpacityGrid, radius: number, rank: "max" | "min"): OpacityGrid {
  const r = Math.max(0, Math.floor(radius));
  let data: Float32Array = Float32Array.from(grid.data, clamp01);
  if (r > 0 && grid.width > 0 && grid.height > 0) {
    data = rankpass(data, grid.width, grid.height, r, false, rank);
    data = rankpass(data, grid.width, grid.height, r, true, rank);
  }
  return { width: grid.width, height: grid.height, data };
}

/** grows (dilates) the selection by a radius-r box — closes pinholes before feathering. */
export function growmask(grid: OpacityGrid, radius: number): OpacityGrid {
  return rankfilter(grid, radius, "max");
}

/** shrinks (erodes) the selection by a radius-r box — eats halos after feathering. */
export function shrinkmask(grid: OpacityGrid, radius: number): OpacityGrid {
  return rankfilter(grid, radius, "min");
}

/** mean opacity of a plane (how much of the frame the mask owns). */
export function maskcoverage(grid: OpacityGrid): number {
  if (grid.data.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < grid.data.length; i += 1) sum += clamp01(grid.data[i]);
  return sum / grid.data.length;
}

/** folds a layer stack over a base (default empty); any dimension mismatch answers null. */
export function maskstack(layers: readonly MaskLayer[], base?: OpacityGrid): OpacityGrid | null {
  const first = layers[0];
  if (!first && !base) return null;
  const shape: { width: number; height: number; data?: Float32Array } = base ?? {
    width: first.grid.width,
    height: first.grid.height,
  };
  let acc: OpacityGrid = {
    width: shape.width,
    height: shape.height,
    data: Float32Array.from(shape.data ?? new Float32Array(shape.width * shape.height)),
  };
  for (const layer of layers) {
    const next = combinemasks(acc, layer.grid, layer.op);
    if (!next) return null;
    acc = next;
  }
  return acc;
}
