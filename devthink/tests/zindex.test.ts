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
import { describe, expect, it } from "vitest";

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
    for (const band of bands) expect(css).toContain(band);
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
    expect(leaks).toEqual([]);
  });

  it("declares the shell geometry variables of the family", () => {
    for (const geo of ["--shell-sidebar", "--shell-topbar", "--shell-gutter", "--shell-handle"])
      expect(css).toContain(geo);
  });

  it("carries the silk curve of the family", () => {
    expect(css).toContain("--ease-silk");
  });
});

describe("the window manager doctrine bands (wave 3)", () => {
  it("declares the drag raise of the doctrine layer — the win11React 9900 band", () => {
    expect(css).toContain("--win-drag-z: 9900;");
  });

  it("the live gestures stand the motion down — the moving band paints on the compositor", () => {
    const moving = css.match(/\[data-moving="true"\] \{[^}]*\}/);
    expect(moving, "the moving band rule lives").toBeTruthy();
    expect(moving?.[0]).toContain("will-change: transform");
    expect(moving?.[0]).toContain("transition: none");
  });

  it("the doctrine notrans class exists for the drag band", () => {
    expect(css).toContain(".shell-window.notrans {");
  });

  it("the surfaces never carry a transition all — every rule names its properties", () => {
    // the doctrine ban: comments first out, then every transition value
    // must speak named properties, never the all keyword
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
    const rules = [...stripped.matchAll(/transition:[^;]+;/g)].map((match) => match[0]);
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) expect(rule, `${rule} must name its properties`).not.toMatch(/(^|[\s:,])all([\s,;]|$)/);
  });
});
