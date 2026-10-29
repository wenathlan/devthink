// # shadercomp test — determinism of compiled programs, the typed-outcome
// contract for damaged input, sha-256 integrity against the versawase
// PrecompiledShader manifest, and the monotone ramps of the dissolve planner.
// Every suite is pure: no GPU, no DOM, no timers.

import { describe, expect, it } from "vitest";
import {
  compileEffectProgram,
  dissolvePlan,
  libraryManifestComplete,
  SHADER_EFFECTS,
  shaderIdsKnown,
  shaderManifest,
} from "../shadercomp.ts";
import { shaderManifestComplete } from "../versawase.ts";

describe("shadercomp library", () => {
  it("ships every effect with a real film-technique vocabulary and honest ranges", () => {
    expect(SHADER_EFFECTS.length).toBe(12);
    for (const effect of SHADER_EFFECTS) {
      expect(effect.label.length).toBeGreaterThan(0);
      expect(effect.minAmount).toBeLessThanOrEqual(effect.defaultAmount);
      expect(effect.defaultAmount).toBeLessThanOrEqual(effect.maxAmount);
      expect(effect.glsl).toContain("vec4 effect(");
      expect(effect.glsl).toContain("}");
    }
  });

  it("compiles a program that is a complete, stable fragment source", () => {
    const compiled = compileEffectProgram("halation", 0.4);
    expect(compiled).not.toBeNull();
    if (!compiled) return;
    expect(compiled.program.startsWith("#version 300 es")).toBe(true);
    expect(compiled.program).toContain("uniform sampler2D uSource;");
    expect(compiled.program).toContain("void main()");
    expect(compiled.sha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it("answers the same sha-256 for the same id regardless of amount", () => {
    const small = compileEffectProgram("grainfilm", 0.1);
    const big = compileEffectProgram("grainfilm", 0.9);
    expect(small?.sha256).toBe(big?.sha256);
  });

  it("clamps amounts into the effect range instead of leaking NaN", () => {
    const low = compileEffectProgram("vignette", -5);
    const high = compileEffectProgram("vignette", 99);
    expect(low?.amount).toBe(0);
    expect(high?.amount).toBe(1);
    const broken = compileEffectProgram("vignette", Number.NaN);
    expect(broken?.amount).toBe(compileEffectProgram("vignette", 0.45)?.amount);
  });

  it("returns null for unknown ids — no throw on damaged input", () => {
    expect(compileEffectProgram("does-not-exist", 0.5)).toBeNull();
    expect(shaderIdsKnown(["halation", "vignette"])).toBe(true);
    expect(shaderIdsKnown(["halation", "ghost"])).toBe(false);
  });

  it("builds a PrecompiledShader manifest versawase.ts accepts as complete", () => {
    const manifest = shaderManifest();
    expect(manifest.length).toBe(12);
    expect(shaderManifestComplete(manifest)).toBe(true);
    expect(libraryManifestComplete()).toBe(true);
    for (const row of manifest) {
      expect(row.stage).toBe("fragment");
      expect(row.artifact.startsWith("inline://shadercomp/")).toBe(true);
    }
  });

  it("skips unknown ids inside a manifest request instead of failing the batch", () => {
    const manifest = shaderManifest(["halation", "ghost", "vignette"]);
    expect(manifest.length).toBe(2);
    expect(manifest.map((row) => row.id)).toEqual(["halation-fragment", "vignette-fragment"]);
  });
});

describe("shadercomp dissolve planner", () => {
  it("crossfades a lap dissolve with layers always summing to one", () => {
    const outcome = dissolvePlan("lap-dissolve", 2, 9);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.plan.steps.length).toBe(9);
    for (const step of outcome.plan.steps) {
      expect(step.baseOpacity + step.overlayOpacity).toBeCloseTo(1, 5);
    }
    expect(outcome.plan.steps[0].baseOpacity).toBe(1);
    expect(outcome.plan.steps[8].overlayOpacity).toBe(1);
  });

  it("keeps a straight cut binary — no half-opaque frames", () => {
    const outcome = dissolvePlan("straight-cut", 1, 5);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    for (const step of outcome.plan.steps) {
      for (const opacity of [step.baseOpacity, step.overlayOpacity]) {
        expect(opacity === 0 || opacity === 1).toBe(true);
      }
    }
  });

  it("dips a fade-through-black to black at the midpoint", () => {
    const outcome = dissolvePlan("fade-through-black", 4, 21);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const mid = outcome.plan.steps[10];
    expect(mid.baseOpacity).toBeLessThanOrEqual(0.2);
    expect(mid.overlayOpacity).toBeLessThanOrEqual(0.2);
    expect(outcome.plan.steps[0].baseOpacity).toBe(1);
    expect(outcome.plan.steps[20].overlayOpacity).toBe(1);
  });

  it("answers typed errors for unknown technique, bad duration and bad steps", () => {
    expect(dissolvePlan("cube-spin", 2, 9)).toEqual({ ok: false, error: "dissolve-unknown-technique" });
    expect(dissolvePlan("lap-dissolve", 0, 9)).toEqual({ ok: false, error: "dissolve-bad-duration" });
    expect(dissolvePlan("lap-dissolve", Number.NaN, 9)).toEqual({ ok: false, error: "dissolve-bad-duration" });
    expect(dissolvePlan("lap-dissolve", 2, 1)).toEqual({ ok: false, error: "dissolve-bad-steps" });
    expect(dissolvePlan("lap-dissolve", 2, 2.5)).toEqual({ ok: false, error: "dissolve-bad-steps" });
  });
});
