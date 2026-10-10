// # imagerender.test — the render layer of the cadria image wave, runnable with
// the node built-in runner (no dependencies, no install):
//   node --test tests/imagerender.test.ts
// The tests watch the promises the module makes: the same project compiles to
// bit-identical commands, svg and signature; geometry stays normalized 0-1 and
// every color is well-formed hex; the z bands are monotonic (background first,
// specular last); the 4096-command budget truncates grain first and keeps the
// specular; the svg is well-formed (regex tag balance, no NaN/Infinity/exponent
// tokens); the signature is stable across runs but moves when commands change;
// perturbations are pure (pulse scales the hero by pulseScale at strength 1 and
// is the identity at 0, wipe shifts exactly the documented middle-third band);
// an empty cast renders background-only; grain count tracks grainDensity.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Block } from "../synthcomposition.ts";
import type { Palette } from "../synthpalette.ts";
import {
  COMMAND_BUDGET,
  RENDER_DEFAULT_SIZE,
  WIPE_BAND,
  WIPE_SHIFT,
  Z_SPECULAR,
  type DrawCommand,
  renderCommands,
  renderKeyframePerturbation,
  renderThumbnailSignature,
} from "../imagerender.ts";
import { renderSvg } from "../imagerenderpaint.ts";

/** a layout block shorthand. */
function block(x: number, y: number, w: number, h: number, role: Block["role"], weight = 0.1): Block {
  return { rect: { x, y, w, h }, weight, role };
}

const PALETTE: Palette = {
  anchor: "#c2643f",
  support: ["#8fa38a", "#5d6e63"],
  ink: "#131a16",
  surface: "#f2ede4",
  accents: ["#3f7fc2", "#c23f7f", "#7fc23f"],
  oklch: {
    anchor: { l: 0.6, c: 0.12, h: 40 },
    accents: [{ l: 0.55, c: 0.12, h: 250 }, { l: 0.55, c: 0.12, h: 340 }, { l: 0.6, c: 0.12, h: 110 }],
  },
};
/** cadre1 sits above the wipe band, cadre2 inside it; edge/field sit outside. */
const BLOCKS: Block[] = [
  block(0.3, 0.35, 0.4, 0.3, "hero", 0.4),
  block(0.1, 0.15, 0.15, 0.15, "cadre"),
  block(0.7, 0.4, 0.15, 0.15, "cadre"),
  block(0.1, 0.7, 0.15, 0.2, "field", 0.05),
  block(0, 0, 1, 0.1, "edge", 0.05),
];
const TEXTURE = { grainDensity: 0.4, grainSize: 2, grainOpacity: 0.3, strokeSoftness: 0.5, strokeWeight: 6, strokeJitter: 0.4, glazeLayers: 3, glazeOpacity: 0.4, specular: 0.5, turbulence: 0.4 };
const PROJECT = { seed: "b7render", palette: PALETTE, blocks: BLOCKS, texture: TEXTURE };

/** horizontal x anchor of one command's geometry (wipe displacement probe). */
function xOf(c: DrawCommand): number {
  if (c.kind === "ellipse") return c.cx;
  if (c.kind === "path" || c.kind === "strokepath") return c.points[0];
  return c.x;
}
/** vertical center of one command's geometry (wipe band membership). */
function cyOf(c: DrawCommand): number {
  if (c.kind === "rect" || c.kind === "gradientwash") return c.y + c.h / 2;
  if (c.kind === "ellipse") return c.cy;
  if (c.kind === "path" || c.kind === "strokepath") return c.points.reduce((s, _, i) => (i % 2 === 1 ? s + c.points[i] : s), 0) / (c.points.length / 2);
  return c.y;
}
type Wash = Extract<DrawCommand, { kind: "gradientwash" }>;
type Ellipse = Extract<DrawCommand, { kind: "ellipse" }>;
const washOf = (list: readonly DrawCommand[]): Wash => list.find((c): c is Wash => c.kind === "gradientwash") as Wash;
const ellipseOf = (list: readonly DrawCommand[]): Ellipse => list.find((c): c is Ellipse => c.kind === "ellipse") as Ellipse;

describe("renderCommands determinism and geometry", () => {
  it("same project → identical commands, svg and signature", () => {
    const a = renderCommands(PROJECT);
    const b = renderCommands(PROJECT);
    assert.deepEqual(a, b);
    assert.equal(renderSvg(a), renderSvg(b));
    assert.equal(renderThumbnailSignature(a.commands), renderThumbnailSignature(b.commands));
  });

  it("geometry stays inside [0,1] for every command", () => {
    const { commands } = renderCommands(PROJECT);
    for (const c of commands) {
      if (c.kind === "rect" || c.kind === "gradientwash") {
        assert.ok(c.x >= 0 && c.y >= 0 && c.x + c.w <= 1 + 1e-9 && c.y + c.h <= 1 + 1e-9, c.kind);
      } else if (c.kind === "ellipse") {
        assert.ok(c.cx - c.rx >= -1e-9 && c.cx + c.rx <= 1 + 1e-9 && c.cy - c.ry >= -1e-9 && c.cy + c.ry <= 1 + 1e-9, "ellipse");
      } else if (c.kind === "grainfield") {
        assert.ok(c.x >= 0 && c.x < 1 && c.y >= 0 && c.y < 1, "grain");
      } else {
        for (const v of c.points) assert.ok(v >= 0 && v <= 1 + 1e-9, c.kind);
      }
    }
  });

  it("every color field is a well-formed #rrggbb hex", () => {
    const { commands } = renderCommands(PROJECT);
    const hex = /^#[0-9a-f]{6}$/;
    for (const c of commands) {
      const colors = c.kind === "gradientwash" ? [c.from, c.to] : c.kind === "strokepath" ? [c.stroke] : [c.fill];
      for (const value of colors) assert.ok(hex.test(value), `${c.kind}: ${value}`);
    }
  });

  it("empty blocks render background-only", () => {
    const frame = renderCommands({ seed: "solo", palette: PALETTE, texture: TEXTURE });
    assert.equal(frame.commands.length, 1);
    assert.equal(frame.commands[0].kind, "rect");
    assert.equal(frame.commands[0].z, 0);
    assert.equal(frame.background, PALETTE.surface);
    assert.equal((frame.commands[0] as Extract<DrawCommand, { kind: "rect" }>).fill, PALETTE.surface);
    assert.match(renderSvg(frame), new RegExp(`width="${RENDER_DEFAULT_SIZE}" height="${RENDER_DEFAULT_SIZE}"`));
  });

  it("all six command kinds appear; glaze opacity follows the layer stack", () => {
    const { commands } = renderCommands(PROJECT);
    for (const kind of ["rect", "ellipse", "gradientwash", "path", "strokepath", "grainfield"]) {
      assert.ok(commands.some((c) => c.kind === kind), kind);
    }
    const glaze = 1 - Math.pow(1 - 0.4, 3);
    const field = commands.find((c) => c.kind === "rect" && c.role === "field") as Extract<DrawCommand, { kind: "rect" }>;
    const edge = commands.find((c) => c.kind === "rect" && c.role === "edge") as Extract<DrawCommand, { kind: "rect" }>;
    assert.equal(field.opacity, glaze);
    assert.equal(edge.opacity, 0.4);
  });

  it("damaged input is total: defaults hold and nothing is NaN", () => {
    const frame = renderCommands({
      canvas: { width: NaN, height: Infinity },
      texture: { grainDensity: NaN, glazeLayers: 99, strokeWeight: -4 },
      blocks: [{ rect: { x: NaN, y: 0.2, w: -1, h: 0.5 }, weight: 0.5, role: "cadre" }],
    });
    assert.equal(frame.width, RENDER_DEFAULT_SIZE);
    assert.equal(frame.height, RENDER_DEFAULT_SIZE);
    assert.match(frame.background, /^#[0-9a-f]{6}$/);
    assert.ok(frame.commands.length > 1);
    for (const c of frame.commands) {
      assert.ok(Number.isFinite(c.z) && Number.isFinite(c.opacity) && Number.isFinite(c.blur), c.kind);
      if (c.kind === "grainfield") assert.ok(Number.isFinite(c.x) && Number.isFinite(c.y) && Number.isFinite(c.r));
    }
  });

  it("command count tracks grainDensity monotonically (two fixtures)", () => {
    const sparse = renderCommands({ ...PROJECT, texture: { ...TEXTURE, grainDensity: 0.1 } });
    const rich = renderCommands({ ...PROJECT, texture: { ...TEXTURE, grainDensity: 0.9 } });
    const sparseGrains = sparse.commands.filter((c) => c.kind === "grainfield").length;
    const richGrains = rich.commands.filter((c) => c.kind === "grainfield").length;
    assert.ok(richGrains > sparseGrains);
    const base = (RENDER_DEFAULT_SIZE * RENDER_DEFAULT_SIZE) / 1600;
    assert.equal(sparseGrains, Math.ceil(0.1 * base));
    assert.equal(richGrains, Math.ceil(0.9 * base));
  });
});

describe("budget and paint order", () => {
  it("dense canvas truncates to exactly the 4096 budget, specular kept last", () => {
    const dense = renderCommands({ ...PROJECT, canvas: { width: 8192, height: 8192 }, texture: { ...TEXTURE, grainDensity: 1 } });
    assert.equal(dense.commands.length, COMMAND_BUDGET);
    assert.equal(dense.commands[dense.commands.length - 1].kind, "path");
    assert.equal(dense.commands[dense.commands.length - 1].z, Z_SPECULAR);
    assert.ok(dense.commands.some((c) => c.kind === "grainfield"));
  });

  it("z-order monotonic: background first, specular last", () => {
    const { commands } = renderCommands(PROJECT);
    for (let i = 1; i < commands.length; i += 1) assert.ok(commands[i - 1].z <= commands[i].z, `z at ${i}`);
    assert.equal(commands[0].z, 0);
    assert.equal(commands[0].kind, "rect");
    assert.equal(commands[commands.length - 1].kind, "path");
    assert.equal(commands[commands.length - 1].z, Z_SPECULAR);
  });
});

describe("renderSvg serialization", () => {
  it("svg is well-formed: one root, balanced tags, unique ids", () => {
    const svg = renderSvg(renderCommands(PROJECT));
    assert.equal(svg.match(/<svg[ >]/g)?.length, 1);
    const ids = [...svg.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    const stack: string[] = [];
    for (const m of svg.matchAll(/<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|[^>"'])*)>/g)) {
      const closing = m[1] === "/";
      const self = /\/\s*$/.test(m[3]);
      if (closing) assert.equal(stack.pop(), m[2]);
      else if (!self) stack.push(m[2]);
    }
    assert.deepEqual(stack, []);
  });

  it("svg carries no NaN, Infinity or exponent tokens", () => {
    const svg = renderSvg(renderCommands(PROJECT));
    assert.doesNotMatch(svg, /NaN|Infinity|[eE][+-][0-9]/);
    assert.match(svg, /fill="#f2ede4"/);
    assert.match(svg, /url\(#wash-\d+\)/);
  });
});

describe("thumbnail signature", () => {
  it("signature is stable across runs and moves when commands change", () => {
    const { commands } = renderCommands(PROJECT);
    assert.equal(renderThumbnailSignature(commands), renderThumbnailSignature(renderCommands(PROJECT).commands));
    assert.notEqual(renderThumbnailSignature(commands), renderThumbnailSignature(commands.slice(0, -1)));
    const moved = renderKeyframePerturbation(commands, { kind: "shift", strength: 0.5, targets: [], tMs: 0 });
    assert.notEqual(renderThumbnailSignature(commands), renderThumbnailSignature(moved));
  });
});

describe("perturbation hooks", () => {
  it("pulse at strength 1 scales hero geometry by pulseScale (±0.01)", () => {
    const { commands } = renderCommands(PROJECT);
    const out = renderKeyframePerturbation(commands, { kind: "pulse", strength: 1, targets: [], tMs: 0 }, 1.08);
    const washA = washOf(commands);
    const washB = washOf(out);
    const ellipseA = ellipseOf(commands);
    const ellipseB = ellipseOf(out);
    assert.ok(Math.abs(washB.w / washA.w - 1.08) <= 0.01);
    assert.ok(Math.abs(washB.h / washA.h - 1.08) <= 0.01);
    assert.ok(Math.abs(ellipseB.rx / ellipseA.rx - 1.08) <= 0.01);
    assert.ok(Math.abs(ellipseB.ry / ellipseA.ry - 1.08) <= 0.01);
    const nonHero = out.filter((c) => c.role !== "hero");
    const nonHeroBefore = commands.filter((c) => c.role !== "hero");
    assert.deepEqual(nonHero, nonHeroBefore);
  });

  it("pulse at strength 0 is the identity and never mutates the input", () => {
    const { commands } = renderCommands(PROJECT);
    const snapshot = structuredClone(commands);
    const out = renderKeyframePerturbation(commands, { kind: "pulse", strength: 0, targets: [], tMs: 0 }, 1.08);
    assert.deepEqual(out, commands);
    assert.deepEqual(commands, snapshot);
  });

  it("wipe shifts exactly the documented middle-third band", () => {
    const { commands } = renderCommands(PROJECT);
    const out = renderKeyframePerturbation(commands, { kind: "wipe", strength: 1, targets: [], tMs: 0 });
    let sawInBand = false;
    for (let i = 0; i < commands.length; i += 1) {
      const a = commands[i];
      const inBand = a.z > 0 && a.kind !== "grainfield" && cyOf(a) >= WIPE_BAND.top && cyOf(a) <= WIPE_BAND.bottom;
      const dx = xOf(out[i]) - xOf(a);
      if (inBand) {
        sawInBand = true;
        assert.ok(Math.abs(dx - WIPE_SHIFT) < 1e-9, `${a.kind} dx=${dx}`);
      } else {
        assert.equal(dx, 0, `${a.kind} dy-shift`);
      }
    }
    assert.ok(sawInBand);
  });

  it("reveal scales non-background opacity by strength; background holds", () => {
    const { commands } = renderCommands(PROJECT);
    const out = renderKeyframePerturbation(commands, { kind: "reveal", strength: 0.5, targets: [], tMs: 0 });
    assert.equal(out[0].opacity, 1);
    assert.equal(out[1].opacity, commands[1].opacity * 0.5);
    assert.equal(out.length, commands.length);
  });
});
