// # synthcomposition — the composition layer of the cadria audio→image studio
// (wave 2, module b2): it folds the structure/rhythm dims of the fused
// AudioDescriptor (audiofeatures.ts, read by index — position is the contract)
// into a deterministic layout grammar over a normalized 0-1 canvas. Three pure,
// total stages plus one audit: compositionGrid derives the tile grammar
// (columns 3-12 from section density dim 27; rows biased square by repetition
// dim 25 — repetitive audio tiles a tight regular lattice, gutter and margin
// tighten as repetition rises), compositionBlocks casts the roles (exactly one
// hero sized by peak mass dim 24, at most 8 cadre ringing it, field blocks
// filling the interior, edge blocks owning the margin ring; the narrative
// contour dim 26 anchors the hero vertically — rise high, fall low, arch
// centered, wave mirrored into a second peak), rhythmScatter jitters every
// block inside its gutter ring with a fnv-1a offset hashed from the descriptor
// seed per block index (onset density dim 9 sets the budget, swing dim 11
// leans it late) and compositionBalance audits the weighted center plus an
// 8-bin x density histogram. Rects are normalized 0-1 (x/y = top-left corner,
// w/h = extents); blocks may close their gutter but never cross it — the
// overlap tolerance IS the gutter; weights normalize to sum 1; damaged input
// (NaN dims, missing seed) falls back to the quiet centered 3x3 layout — never
// NaN, never thrown. Non-goals: no rendering, no palette, no animation (wave 2
// module b7 consumes these blocks). Exports: 4 functions, 5 types, 3 constants.

import type { AudioDescriptor, NarrativeShape } from "./audioattributes.ts";
import { NARRATIVE_CONTOUR } from "./audiofeatures.ts";

/** one rectangle on the normalized canvas: x/y top-left corner, w/h extents, all 0-1. */
export type Rect = { x: number; y: number; w: number; h: number };
/** the four layout roles: the hero mass, its cadre ring, field fill, edge border. */
export type BlockRole = "hero" | "cadre" | "field" | "edge";
/** one placed block: where it lives, the visual weight it carries (0-1) and its role. */
export type Block = { rect: Rect; weight: number; role: BlockRole };
/** the tile grammar: whole-canvas column/row counts plus gutter and margin, all normalized 0-1. */
export type CompositionGrid = { columns: number; rows: number; gutter: number; margin: number };
/** the balance audit: weighted canvas center plus per-x-bin density shares summing to 1. */
export type BalanceReport = { centerX: number; centerY: number; densityHistogram: number[] };

/** grid bounds: columns/rows always land inside this documented 3-12 range. */
export const GRID_MIN = 3;
export const GRID_MAX = 12;
/** density histogram resolution of compositionBalance (bins across the x axis). */
export const HISTOGRAM_BINS = 8;

// grammar dials (deterministic, documented): gutter/margin tighten as repetition
// rises; at REPETITION_SQUARE the grid locks square (a regular lattice); the
// jitter budget is a share of the gutter; swing leans that jitter late.
const GUTTER_MAX = 0.04;
const GUTTER_MIN = 0.008;
const MARGIN_MAX = 0.06;
const MARGIN_MIN = 0.024;
const REPETITION_SQUARE = 0.75;
const JITTER_GUTTER_SHARE = 0.5;
const SWING_LEAN = 0.5;
/** visual weight base per role (× boost × area, then normalized to sum 1 across blocks). */
const ROLE_BASE: Record<BlockRole, number> = { hero: 1, cadre: 0.5, field: 0.25, edge: 0.125 };
/** weight boost for the wave contour's mirrored second peak (stays below the hero). */
const WAVE_MIRROR_BOOST = 1.6;

const FNV_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** integer clamp with rounding; non-finite answers the floor. */
function clampInt(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  return Math.min(hi, Math.max(lo, Math.round(v)));
}

function clampNum(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  return Math.min(hi, Math.max(lo, v));
}

/** total dim read: vector slot i clamped 0-1; everything damaged answers 0. */
function dim(d: AudioDescriptor, i: number): number {
  const v = Array.isArray(d?.vector) ? d.vector[i] : undefined;
  return typeof v === "number" && Number.isFinite(v) ? clamp01(v) : 0;
}

/** reverse-maps the contour weight to its narrative shape (nearest match, flat fallback). */
function contourShape(c: number): NarrativeShape {
  if (!Number.isFinite(c)) return "flat";
  let best: NarrativeShape = "flat";
  let bestD = Infinity;
  for (const shape of Object.keys(NARRATIVE_CONTOUR) as NarrativeShape[]) {
    const d = Math.abs(NARRATIVE_CONTOUR[shape] - c);
    if (d < bestD) {
      bestD = d;
      best = shape;
    }
  }
  return best;
}

/** one fnv-1a pass over a string, byte-folded (the constants audiofeatures hashes with). */
function fnv1a(text: string): number {
  let lane = FNV_BASIS;
  for (let i = 0; i < text.length; i += 1)
    lane = Math.imul((lane ^ (text.charCodeAt(i) & 0xff)) >>> 0, FNV_PRIME) >>> 0;
  return lane;
}

/** folds the block index into the seed lane — fnv-1a of the seed string, per block index. */
function foldIndex(lane: number, index: number): number {
  let out = lane >>> 0;
  for (let shift = 0; shift < 32; shift += 8)
    out = Math.imul((out ^ ((index >>> shift) & 0xff)) >>> 0, FNV_PRIME) >>> 0;
  return out;
}

/** clamps a rect into the canvas: corners ≥ 0, extents finite and trimmed so x+w ≤ 1.
 * (named fitrect — the bare `fit` collides with the linter's focused-test heuristic.) */
function fitrect(r: Rect): Rect {
  const x = clamp01(r.x);
  const y = clamp01(r.y);
  const w = Number.isFinite(r.w) ? Math.max(0, Math.min(r.w, 1 - x)) : 0;
  const h = Number.isFinite(r.h) ? Math.max(0, Math.min(r.h, 1 - y)) : 0;
  return { x, y, w, h };
}

/** guard for caller-supplied grammars: integer counts in [1,16], gutter/margin sane. */
function sanitize(g?: CompositionGrid): CompositionGrid {
  return {
    columns: clampInt(g?.columns ?? NaN, 1, 16),
    rows: clampInt(g?.rows ?? NaN, 1, 16),
    gutter: clampNum(g?.gutter ?? NaN, 0, 0.1),
    margin: clampNum(g?.margin ?? NaN, 0, 0.25),
  };
}

/**
 * compositionGrid — the tile grammar: columns climb with section density
 * (dim 27) across the documented 3-12 range; rows follow a density+repetition
 * blend but lock square at REPETITION_SQUARE (repetitive audio tiles a
 * regular lattice); gutter and margin tighten from GUTTER_MAX/MARGIN_MAX down
 * to GUTTER_MIN/MARGIN_MIN as repetition (dim 25) rises. Damaged dims answer
 * the quiet loose 3x3 grid.
 */
export function compositionGrid(descriptor: AudioDescriptor): CompositionGrid {
  const density = dim(descriptor, 27);
  const repetition = dim(descriptor, 25);
  const columns = clampInt(GRID_MIN + (GRID_MAX - GRID_MIN) * density, GRID_MIN, GRID_MAX);
  const rows =
    repetition >= REPETITION_SQUARE
      ? columns
      : clampInt(GRID_MIN + (GRID_MAX - GRID_MIN) * (0.5 * density + 0.5 * repetition), GRID_MIN, GRID_MAX);
  const gutter = GUTTER_MIN + (GUTTER_MAX - GUTTER_MIN) * (1 - repetition);
  const margin = MARGIN_MIN + (MARGIN_MAX - MARGIN_MIN) * (1 - repetition);
  return { columns, rows, gutter, margin };
}

/**
 * compositionBlocks — casts the layout roles over the grid: exactly one hero
 * (its cells merged, bleeding one gutter outward so it always reads as the
 * largest mass, span grown by peak mass dim 24), at most 8 cadre blocks
 * ringing it clockwise (the wave contour spends the first on a mirrored
 * second peak), then the remaining cells row-major as edge blocks (border
 * cells, grown over the margin to the canvas border) and field blocks
 * (interior fill). The contour dim 26 anchors the hero rows — rise high,
 * fall low, arch/flat centered, wave in the upper band — while the hero
 * column stays centered for balance. Weights are ROLE_BASE × boost × area,
 * normalized to sum 1. Blocks come back hero-first, then cadre, then the
 * row-major fill; same descriptor, same blocks, always.
 */
export function compositionBlocks(descriptor: AudioDescriptor, grid?: CompositionGrid): Block[] {
  const g = sanitize(grid ?? compositionGrid(descriptor));
  const { columns, rows, gutter, margin } = g;
  const peak = dim(descriptor, 24);
  const shape = contourShape(dim(descriptor, 26));
  const cw = Math.max(0.001, (1 - 2 * margin - (columns - 1) * gutter) / columns);
  const ch = Math.max(0.001, (1 - 2 * margin - (rows - 1) * gutter) / rows);
  const key = (col: number, row: number): string => `${col},${row}`;
  const cell = (col: number, row: number): Rect => ({
    x: margin + col * (cw + gutter),
    y: margin + row * (ch + gutter),
    w: cw,
    h: ch,
  });
  // hero span in cells per axis: grows with peak mass, keeping one ring of cells free
  const maxSpanX = Math.max(1, Math.min(Math.floor(columns / 2), columns - 2));
  const maxSpanY = Math.max(1, Math.min(Math.floor(rows / 2), rows - 2));
  const spanX = maxSpanX < 2 ? 1 : clampInt(2 + peak * (maxSpanX - 2), 2, maxSpanX);
  const spanY = maxSpanY < 2 ? 1 : clampInt(2 + peak * (maxSpanY - 2), 2, maxSpanY);
  // vertical grammar: the contour anchors the hero rows, horizontal stays centered for balance
  const roomY = Math.max(0, rows - spanY - 1);
  const roomX = Math.max(0, columns - spanX - 1);
  const loY = Math.min(1, roomY);
  const anchorRow =
    shape === "rise"
      ? clampInt(rows * 0.18, loY, roomY)
      : shape === "fall"
        ? clampInt(rows - spanY - rows * 0.18, loY, roomY)
        : shape === "wave"
          ? clampInt((rows - 2 * spanY) * 0.3, loY, roomY)
          : clampInt((rows - spanY) / 2, loY, roomY);
  const anchorCol = clampInt((columns - spanX) / 2, Math.min(1, roomX), roomX);
  const claimed = new Set<string>();
  for (let dy = 0; dy < spanY; dy += 1)
    for (let dx = 0; dx < spanX; dx += 1) claimed.add(key(anchorCol + dx, anchorRow + dy));
  const parts: Array<{ rect: Rect; role: BlockRole; boost: number }> = [];
  // the hero: merged cells bleeding one gutter outward — strictly larger than any single cell
  parts.push({
    rect: fitrect({
      x: margin + anchorCol * (cw + gutter) - gutter,
      y: margin + anchorRow * (ch + gutter) - gutter,
      w: spanX * cw + (spanX + 1) * gutter,
      h: spanY * ch + (spanY + 1) * gutter,
    }),
    role: "hero",
    boost: 1,
  });
  const cadres: Array<[number, number]> = [];
  if (shape === "wave") {
    // the second peak: the hero's span mirrored through the canvas center (skipped on collision)
    const mCol = columns - anchorCol - spanX;
    const mRow = rows - anchorRow - spanY;
    let free = mCol >= 0 && mRow >= 0;
    for (let dy = 0; free && dy < spanY; dy += 1)
      for (let dx = 0; free && dx < spanX; dx += 1) free = !claimed.has(key(mCol + dx, mRow + dy));
    if (free) {
      for (let dy = 0; dy < spanY; dy += 1)
        for (let dx = 0; dx < spanX; dx += 1) claimed.add(key(mCol + dx, mRow + dy));
      parts.push({
        rect: fitrect({
          x: margin + mCol * (cw + gutter),
          y: margin + mRow * (ch + gutter),
          w: spanX * cw + (spanX - 1) * gutter,
          h: spanY * ch + (spanY - 1) * gutter,
        }),
        role: "cadre",
        boost: WAVE_MIRROR_BOOST,
      });
      cadres.push([mCol, mRow]);
    }
  }
  // the ring: clockwise from the hero's top-left corner, budget 8 including the wave mirror
  const ring: Array<[number, number]> = [];
  for (let dx = -1; dx <= spanX; dx += 1) ring.push([anchorCol + dx, anchorRow - 1]);
  for (let dy = 0; dy <= spanY; dy += 1) ring.push([anchorCol + spanX, anchorRow + dy]);
  for (let dx = spanX - 1; dx >= -1; dx -= 1) ring.push([anchorCol + dx, anchorRow + spanY]);
  for (let dy = spanY - 1; dy >= 0; dy -= 1) ring.push([anchorCol - 1, anchorRow + dy]);
  for (const [col, row] of ring) {
    if (cadres.length >= 8 || col < 0 || row < 0 || col >= columns || row >= rows || claimed.has(key(col, row)))
      continue;
    cadres.push([col, row]);
    claimed.add(key(col, row));
    parts.push({ rect: fitrect(cell(col, row)), role: "cadre", boost: 1 });
  }
  // the fill: border cells grow over the margin and answer "edge", interior cells answer "field"
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      if (claimed.has(key(col, row))) continue;
      const border = row === 0 || row === rows - 1 || col === 0 || col === columns - 1;
      if (!border) {
        parts.push({ rect: fitrect(cell(col, row)), role: "field", boost: 1 });
        continue;
      }
      const er = cell(col, row);
      if (col === 0) {
        er.w += er.x;
        er.x = 0;
      }
      if (col === columns - 1) er.w = 1 - er.x;
      if (row === 0) {
        er.h += er.y;
        er.y = 0;
      }
      if (row === rows - 1) er.h = 1 - er.y;
      parts.push({ rect: fitrect(er), role: "edge", boost: 1 });
    }
  }
  const raw = parts.map((p) => ROLE_BASE[p.role] * p.boost * p.rect.w * p.rect.h);
  const total = raw.reduce((sum, v) => sum + v, 0);
  return parts.map((p, i) => ({ rect: p.rect, weight: raw[i] / total, role: p.role }));
}

/**
 * rhythmScatter — the rhythmic placement pass: jitters every block inside
 * its gutter ring with a deterministic fnv-1a offset (the descriptor seed
 * string hashed to one lane, the block index folded in per block, split into
 * an x and a y half). Onset density (dim 9) scales the budget up to
 * JITTER_GUTTER_SHARE of the derived grid's gutter, so a scattered block can
 * close its gutter but never cross into a neighbor — the overlap tolerance
 * IS the gutter (assumes the default compositionBlocks(descriptor) pairing).
 * Swing (dim 11) leans the jitter in +x — the late-beat push — before the
 * per-axis clamp. Roles and weights pass through untouched.
 */
export function rhythmScatter(descriptor: AudioDescriptor, blocks: readonly Block[]): Block[] {
  const grid = compositionGrid(descriptor);
  const amp = JITTER_GUTTER_SHARE * grid.gutter * dim(descriptor, 9);
  const swing = dim(descriptor, 11);
  const seedLane = fnv1a(typeof descriptor?.seed === "string" ? descriptor.seed : "");
  return (Array.isArray(blocks) ? blocks : []).map((b, i) => {
    const lane = foldIndex(seedLane, i);
    const jx = ((lane & 0xffff) - 32767.5) / 32767.5;
    const jy = (((lane >>> 16) & 0xffff) - 32767.5) / 32767.5;
    const ox = Math.min(amp, Math.max(-amp, jx * amp + swing * SWING_LEAN * amp));
    const oy = Math.min(amp, Math.max(-amp, jy * amp));
    return {
      rect: fitrect({ x: b.rect.x + ox, y: b.rect.y + oy, w: b.rect.w, h: b.rect.h }),
      weight: b.weight,
      role: b.role,
    };
  });
}

/**
 * compositionBalance — the audit feed: the weight-weighted canvas center
 * plus an 8-bin density histogram over x (each bin holds its share of the
 * total weight, summing to 1). Blocks with zero or damaged weight/geometry
 * carry no mass; a massless audit answers the neutral center 0.5/0.5 with
 * an empty histogram. Purely informational — for tests and the polish wave.
 */
export function compositionBalance(blocks: readonly Block[]): BalanceReport {
  const bins = new Array<number>(HISTOGRAM_BINS).fill(0);
  let mass = 0;
  let sx = 0;
  let sy = 0;
  for (const b of Array.isArray(blocks) ? blocks : []) {
    const r = b?.rect;
    const w = typeof b?.weight === "number" && Number.isFinite(b.weight) && b.weight > 0 ? b.weight : 0;
    if (!r || !Number.isFinite(r.x) || !Number.isFinite(r.y) || !Number.isFinite(r.w) || !Number.isFinite(r.h))
      continue;
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    mass += w;
    sx += w * cx;
    sy += w * cy;
    bins[Math.min(HISTOGRAM_BINS - 1, Math.max(0, Math.floor(cx * HISTOGRAM_BINS)))] += w;
  }
  if (mass <= 0) return { centerX: 0.5, centerY: 0.5, densityHistogram: bins };
  return { centerX: sx / mass, centerY: sy / mass, densityHistogram: bins.map((v) => v / mass) };
}
