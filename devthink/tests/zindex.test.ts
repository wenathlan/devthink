/**
 * zindex.test.ts — the layer discipline guard of the sol css.
 * the ladder of the family is the contract: every stacking context rides a
 * named band variable, the local stacking of a component stays inside the
 * small local range, and the ten bands of the family are declared in the
 * immutable block. a raw band scale value outside the ladder fails the
 * pipeline, so the layering drift dies at the test gate.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "bun:test";

const css = readFileSync(join(import.meta.dir, "..", "Sol", "sol.css"), "utf8");

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
    for (const band of bands) {
      expect(css).toContain(band);
    }
  });

  it("carries no raw band scale z index outside the ladder", () => {
    const raw = [...css.matchAll(/z-index:\s*([^;]+);/g)]
      .map((m) => m[1].trim())
      .filter((v) => !v.startsWith("var(--z-"))
      .filter((v) => !v.startsWith("calc(var(--z-"));
    // the local stacking range of a component: the small values a parent
    // isolates. any band scale value (10, 20, 30, 40, 50, 90, 100, 200…)
    // must ride the ladder instead.
    const leaks = raw.filter((v) => {
      const n = Number.parseInt(v, 10);
      return Number.isFinite(n) && Math.abs(n) > 5;
    });
    expect(leaks).toEqual([]);
  });

  it("declares the shell geometry variables of the family", () => {
    for (const geo of ["--shell-sidebar", "--shell-topbar", "--shell-gutter", "--shell-handle"]) {
      expect(css).toContain(geo);
    }
  });

  it("carries the silk curve of the family", () => {
    expect(css).toContain("--ease-silk");
  });
});
