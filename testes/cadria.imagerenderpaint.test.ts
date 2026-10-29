// # imagerenderpaint.test — honest unit tests for the SVG serializer arm,
// runnable with vitest:
//   pnpm vitest run tests/imagerenderpaint.test.ts
// Every test watches the two invariants the module promises: the same frame
// always serializes to the same string byte for byte (no timestamps, no
// locale floats, no exponents) and damaged input never throws nor spells
// NaN — non-finite numbers answer "0.000" and damaged frames fall back to
// the defaults. The geometry checks pin the normalized→px scaling and the
// gradient endpoint math at 90 degrees, where the answer is exact by hand.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { DrawCommand, RenderFrame } from "../cadria/imagerender.ts";
import { renderSvg } from "../cadria/imagerenderpaint.ts";

/** one painted rect command with the given fields. */
function rect(fields: Partial<Extract<DrawCommand, { kind: "rect" }>>): DrawCommand {
  return { kind: "rect", x: 0.1, y: 0.2, w: 0.3, h: 0.4, fill: "#102030", opacity: 1, blur: 0, z: 1, ...fields };
}

describe("imagerenderpaint scaling", () => {
  it("scales normalized geometry by the frame size at fixed 3 decimals", () => {
    const svg = renderSvg({ width: 1080, height: 720, background: "#000000", commands: [rect({ x: 0.5, y: 0.25, w: 1, h: 0.5 })] });
    assert.ok(svg.includes('<rect x="540.000" y="180.000" width="1080.000" height="360.000" fill="#102030"/>'));
  });
  it("carries fill-opacity only below 1 and never emits an exponent", () => {
    const svg = renderSvg({ width: 100, height: 100, background: "#000000", commands: [rect({ opacity: 0.5 })] });
    assert.ok(svg.includes('fill-opacity="0.500"'));
    assert.ok(!svg.includes("e-"));
    assert.ok(!svg.toLowerCase().includes("nan"));
  });
});

describe("imagerenderpaint determinism", () => {
  it("serializes the same frame to the same string byte for byte", () => {
    const frame: RenderFrame = {
      width: 320,
      height: 200,
      background: "#0a0a0b",
      commands: [
        rect({}),
        { kind: "ellipse", cx: 0.5, cy: 0.5, rx: 0.2, ry: 0.1, fill: "#242424", opacity: 1, blur: 0, z: 2 },
        { kind: "grainfield", x: 0.9, y: 0.9, r: 1.5, fill: "#333333", opacity: 0.4, blur: 0, z: 3 },
      ],
    };
    assert.equal(renderSvg(frame), renderSvg(frame));
  });
});

describe("imagerenderpaint damage", () => {
  it("answers 0.000 for non-finite numbers and never spells NaN", () => {
    const svg = renderSvg({
      width: 100,
      height: 100,
      background: "#000000",
      commands: [rect({ x: Number.NaN, y: Number.POSITIVE_INFINITY, fill: "#102030" })],
    });
    assert.ok(svg.includes('x="0.000" y="0.000"'));
    assert.ok(!svg.toLowerCase().includes("nan"));
    assert.ok(!svg.includes("infinity"));
  });
  it("falls back to the 1080 square and an empty body on a damaged frame", () => {
    const svg = renderSvg({ width: Number.NaN, height: Number.NaN, background: "#000000", commands: [] });
    assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">'));
    assert.ok(svg.trimEnd().endsWith("</svg>"));
    assert.ok(svg.endsWith("\n"));
    assert.ok(!svg.includes("<defs>"));
  });
});

describe("imagerenderpaint washes and strokes", () => {
  it("spells the 90 degree wash endpoints exactly and registers the gradient def", () => {
    const svg = renderSvg({
      width: 200,
      height: 200,
      background: "#000000",
      commands: [
        {
          kind: "gradientwash",
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          angle: 90,
          from: "#111111",
          to: "#222222",
          opacity: 1,
          blur: 0,
          z: 0,
        },
      ],
    });
    assert.ok(svg.includes('x1="0.500" y1="0.000" x2="0.500" y2="1.000"'));
    assert.ok(svg.includes('<linearGradient id="wash-0"'));
    assert.ok(svg.includes('fill="url(#wash-0)"'));
  });
  it("closes paths, keeps strokepaths open and registers blur filters once", () => {
    const svg = renderSvg({
      width: 100,
      height: 100,
      background: "#000000",
      commands: [
        { kind: "path", points: [0, 0, 1, 0, 0.5, 1], fill: "#112233", opacity: 1, blur: 0, z: 1 },
        {
          kind: "strokepath",
          points: [0, 0.5, 1, 0.5],
          stroke: "#445566",
          strokeWidth: 2,
          opacity: 0.8,
          blur: 3,
          z: 2,
        },
      ],
    });
    assert.ok(svg.includes('d="M 0.000 0.000 L 100.000 0.000 L 50.000 100.000 Z"'));
    assert.ok(svg.includes('stroke-width="2.000" stroke-opacity="0.800"'));
    assert.ok(svg.includes('<filter id="blur-1"'));
    assert.ok(svg.includes('filter="url(#blur-1)"'));
  });
});
