/**
 * zindex.test.ts — the layer discipline guard of the sol css.
 * the ladder of the family is the contract: every stacking context rides a
 * named band variable, the local stacking of a component stays inside the
 * small local range, and the ten bands of the family are declared in the
 * immutable block. a raw band scale value outside the ladder fails the
 * pipeline, so the layering drift dies at the test gate.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const css = readFileSync(join(import.meta.dirname, "..", "Sol", "sol.css"), "utf8");

const bands = [
  "--z-atmosphere",
  "--z-content",
  "--z-float",
  "--z-bar",
  "--z-menu",
  "--z-overlay",
  "--z-dock",
  "--z-modal",
  "--z-toast",
  "--z-tooltip",
];

describe("zindex layer discipline", () => {
  it("declares the ten bands of the family in the root block", () => {
    for (const band of bands) assert.ok(css.includes(band), `the band ${band} is missing from the root block`);
  });

  it("carries no raw band scale z index outside the ladder", () => {
    const raw = [...css.matchAll(/z-index:\s*([^;]+);/g)]
      .map((match) => match[1].trim())
      .filter((value) => !value.startsWith("var(--z-"))
      .filter((value) => !value.startsWith("calc(var(--z-"));
    // the local stacking range of a component: the small values a parent
    // isolates. any band scale value (10, 20, 30, 40, 50, 90, 100, 200…)
    // must ride the ladder instead.
    const leaks = raw.filter((value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) && Math.abs(parsed) > 5;
    });
    assert.deepEqual(leaks, [], `raw band scale values escaped the ladder: ${leaks.join(", ")}`);
  });

  it("declares the shell geometry variables of the family", () => {
    for (const geo of ["--shell-sidebar", "--shell-topbar", "--shell-gutter", "--shell-handle"])
      assert.ok(css.includes(geo), `the geometry variable ${geo} is missing`);
  });

  it("carries the silk curve of the family", () => {
    assert.ok(css.includes("--ease-silk"), "the silk curve token is missing");
  });
});
