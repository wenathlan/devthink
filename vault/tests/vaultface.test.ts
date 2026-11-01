/**
 * vaultface — the design contract of the wave 4b product face, runnable
 * with the house vitest suite. The file reads the shipped sources (the
 * home anchor, the face wingets, the stylesheet, the winget surface, the
 * http surface) and pins the face laws: the direct-value hero, the product
 * proof (plans table · object browser · database console), the store law
 * (every face key cited by a surface lives in the seed — zero dead keys,
 * zero literals), the motion laws (gsap and three lazy with cleanup and
 * the reduced-motion gate, the sonner toast cycle, the shimmer skeleton),
 * the token law of the new pass (no raw hue, no transition: all, no pill)
 * and the honest route lane.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LABEL_MANIFEST } from "../labels.ts";
import { uistoreseedrows } from "../uistore.ts";

const HOME = readFileSync(join(import.meta.dirname, "..", "Sol", "home", "home.tsx"), "utf8");
const SHELL = readFileSync(join(import.meta.dirname, "..", "Sol", "shell", "Shell.tsx"), "utf8");
const OBJECTS = readFileSync(join(import.meta.dirname, "..", "Sol", "objects", "objects.tsx"), "utf8");
const BUCKETS = readFileSync(join(import.meta.dirname, "..", "Sol", "buckets", "buckets.tsx"), "utf8");
const RETENTION = readFileSync(join(import.meta.dirname, "..", "Sol", "retention", "retention.tsx"), "utf8");
const INDEX = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "index.ts"), "utf8");
const PLANSTABLE = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "HomePlanstable.tsx"), "utf8");
const BROWSE = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "HomeObjectbrowse.tsx"), "utf8");
const CONSOLE = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "HomeDbconsole.tsx"), "utf8");
const TOASTER = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "HomeToaster.tsx"), "utf8");
const SKELETON = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "HomeSkeleton.tsx"), "utf8");
const HALO = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "HomeHalo.tsx"), "utf8");
const REVEAL = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "HomeReveal.tsx"), "utf8");
const API = readFileSync(join(import.meta.dirname, "..", "api.ts"), "utf8");
const CSS = readFileSync(join(import.meta.dirname, "..", "Sol", "sol.css"), "utf8");

/** the face pass of the stylesheet (the slice the wave appended — the
 * token pins read the exact declarations of the pass, not the foundation). */
function facepass(): string {
  const at = CSS.indexOf("wave 4b — vaultface pass");
  expect(at, "the vaultface pass lives in sol.css").toBeGreaterThan(-1);
  return CSS.slice(at);
}

/** every face key the touched surfaces cite (uicopy and uicopyfill). */
function citedkeys(source: string): string[] {
  const pattern = /uicopy(?:fill)?\(\s*"([^"]+)"/g;
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

describe("the face surfaces", () => {
  it("the home anchor mounts the whole product face", () => {
    expect(HOME).toContain("<Halo />");
    expect(HOME).toContain("<Planstable />");
    expect(HOME).toContain("<Objectbrowse />");
    expect(HOME).toContain("<Dbconsole />");
    expect(HOME).toContain("<Reveal>");
    expect(HOME).toContain('id="console"');
    expect(HOME).toContain("useUicopy()");
    expect(HOME).toContain("sealToast(");
  });

  it("the hero carries the direct value — one title, one description, no sub-paragraphs", () => {
    expect(HOME).toContain('uicopy("face.hero.title")');
    expect(HOME).toContain('uicopy("face.hero.lede")');
    const lede = uistoreseedrows()["face.hero.lede"] ?? "";
    expect(lede.split(/[.!?]\s/).length).toBeLessThanOrEqual(2);
  });

  it("the touched pages ride the store and answer the toast voice", () => {
    for (const page of [OBJECTS, BUCKETS, RETENTION, SHELL]) {
      expect(page).toContain("useUicopy()");
    }
    expect(OBJECTS).toContain('toast(\n        uicopy("face.toast.sealedTitle")');
    expect(BUCKETS).toContain('uicopy("face.toast.pickTitle")');
    expect(RETENTION).toContain('uicopy("face.toast.rollTitle")');
    expect(SHELL).toContain("<Toaster />");
  });

  it("the winget surface stays alphabetical and answers the face", () => {
    const names = [...INDEX.matchAll(/from "\.\/([A-Za-z]+)\.tsx"/g)].map((match) => match[1]);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
    for (const winget of [
      "HomeDbconsole",
      "HomeHalo",
      "HomeObjectbrowse",
      "HomePlanstable",
      "HomeReveal",
      "HomeSkeleton",
      "HomeToaster",
    ]) {
      expect(names).toContain(winget);
    }
  });
});

describe("the store law (no literal, no dead key)", () => {
  it("every face key a surface cites lives in the seed; every other key lives in the manifest", () => {
    const seed = uistoreseedrows();
    const surfaces = [HOME, PLANSTABLE, BROWSE, CONSOLE, TOASTER, SKELETON, OBJECTS, BUCKETS, RETENTION, SHELL];
    const citations = new Map<string, string>();
    for (const surface of surfaces) {
      for (const key of citedkeys(surface)) {
        if (!citations.has(key)) citations.set(key, surface === HOME ? "home.tsx" : "winget.tsx");
      }
    }
    expect(citations.size).toBeGreaterThan(30);
    for (const [key, home] of citations) {
      const housed = Object.hasOwn(seed, key) || Object.hasOwn(LABEL_MANIFEST, key);
      expect(housed, `the key ${key} cited by ${home} answers from one store`).toBe(true);
    }
  });

  it("the seed owns every face.* citation and the manifest keeps the legacy keys", () => {
    const seed = uistoreseedrows();
    for (const [key] of citationsOfFace()) {
      expect(Object.hasOwn(seed, key), `the face key ${key} lives in the seed`).toBe(true);
    }
  });

  it("the data rows stay data — the thresholds, digests and kinds never ride the copy", () => {
    const seed = uistoreseedrows();
    for (const value of Object.values(seed)) {
      expect(value, "the seed carries prose, never byte values").not.toMatch(/^\d+$/);
    }
    expect(CONSOLE).toContain('"1,000,000 b"');
  });

  function citationsOfFace(): [string, string][] {
    const found: [string, string][] = [];
    for (const surface of [HOME, PLANSTABLE, BROWSE, CONSOLE, TOASTER, SKELETON]) {
      for (const key of citedkeys(surface)) {
        if (key.startsWith("face.")) found.push([key, "surface"]);
      }
    }
    return found;
  }
});

describe("the motion laws (lazy engines, cleanup, the reduced-motion gate)", () => {
  it("the halo loads three through a dynamic import and disposes the rig", () => {
    expect(HALO).toContain('import("three")');
    expect(HALO).toContain('window.matchMedia("(prefers-reduced-motion: reduce)").matches');
    expect(HALO).toContain("disposable.dispose()");
    expect(HALO).toContain("renderer.dispose()");
    expect(HALO).toContain("domElement.remove()");
    expect(HALO).toContain("disconnect()");
    expect(HALO).toContain("setAnimationLoop(null)");
  });

  it("the reveal loads gsap and ScrollTrigger lazily and reverts the context", () => {
    expect(REVEAL).toContain('import("gsap")');
    expect(REVEAL).toContain('import("gsap/ScrollTrigger")');
    expect(REVEAL).toContain("registerPlugin(ScrollTrigger)");
    expect(REVEAL).toContain("context.revert()");
    expect(REVEAL).toContain("stagger");
    expect(REVEAL).toContain('window.matchMedia("(prefers-reduced-motion: reduce)").matches');
  });

  it("the halo reads the accent off the token, never a fixed hue", () => {
    expect(HALO).toContain("ACCENT_TOKEN");
    expect(HALO).toContain('"--color-win"');
    expect(HALO).toContain("getComputedStyle");
  });

  it("the toaster rides the sonner cycle — the ceiling, the clock, the swipe-out, the live region", () => {
    expect(TOASTER).toContain("TOAST_TTL");
    expect(TOASTER).toContain("TOAST_MAX");
    expect(TOASTER).toContain('data-leaving={item.leaving ? "true" : undefined}');
    expect(TOASTER).toContain('aria-live="polite"');
    expect(TOASTER).toContain('aria-label={uicopy("face.toast.dismiss")}');
  });

  it("the browse boots on the shimmer skeleton and answers the honest empty", () => {
    expect(BROWSE).toContain("<Skeleton rows={6} />");
    expect(BROWSE).toContain("aria-busy={booting");
    expect(BROWSE).toContain('uicopy("face.browse.empty")');
    expect(SKELETON).toContain('aria-label={uicopy("face.skeleton.aria")}');
  });
});

describe("the token law of the face pass", () => {
  it("ships no raw hue, no transition: all, no pill in the pass", () => {
    const pass = facepass();
    expect(pass).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(pass).not.toMatch(/transition:\s*all/);
    expect(pass).not.toContain("999px");
    expect(pass).not.toContain("scale(0)");
  });

  it("animates on the doctrine curves — the spring enter, the exit swipe, the shimmer loop", () => {
    const pass = facepass();
    expect(pass).toContain("@keyframes vcShimmer");
    expect(pass).toContain("@keyframes vcToastIn");
    expect(pass).toContain("@keyframes vcToastOut");
    expect(pass).toContain("var(--ease-spring)");
    expect(pass).toContain("var(--ease-exit)");
    expect(pass).toContain("var(--z-toast)");
    expect(pass).toContain("var(--floor-menu, 0.97)");
  });

  it("hard-stops the pass on reduced motion and reduced transparency", () => {
    const pass = facepass();
    expect(pass).toContain("@media (prefers-reduced-motion: reduce)");
    expect(pass).toContain("@media (prefers-reduced-transparency: reduce)");
    expect(pass).toContain('.vc-toast, .vc-toast[data-leaving="true"] { animation: none; }');
    expect(pass).toContain(".vc-skeleton__line::after { animation: none; display: none; }");
  });

  it("keeps the tabular numerals on the face numbers", () => {
    expect(facepass()).toContain("font-variant-numeric: tabular-nums");
  });
});

describe("the route lane of the face", () => {
  it("the http surface catalogs the copy lane beside the health probe", () => {
    expect(API).toContain('uicopy: "/api/v1/ui/copy"');
    expect(API).toContain("ensureuicopyingested()");
    expect(API).toContain('sendError(res, 404, "VAULT_COPY"');
  });

  it("the copy lane answers open (the interface text carries no secret)", () => {
    const openAt = API.indexOf('if (method === "GET" && pathname === routes.uicopy)');
    const gateAt = API.indexOf("const verdict = tokenVerdict(req)");
    expect(openAt).toBeGreaterThan(-1);
    expect(gateAt).toBeGreaterThan(openAt);
  });
});
