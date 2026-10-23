// # design.test — the design contract of the argan surface, runnable with the
// vitest runner:
//   pnpm test
// The file reads the shipped sources (stylesheet, entry face, brand mark,
// app identity, route anchor) and pins the family laws: no banned hue, no
// pill, no all-properties transition, no zero-scale entry (the windows
// dtPopIntro bounce excepted), the trylle font stacks, the source-face entry,
// the reduced-motion stop, tabular numerals, the sticky-footer law, the honest
// page set of the application identity and the first-run flow contract (the
// entry gate, the shared onboarding state, the db mirror).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const CSS = read("../Sol/sol.css");
const ENTRY = read("../index.html");
const MARK = read("../Sol/shell/shell.tsx");
const TOML = read("../devthink.toml");
const SOL = read("../Sol/Sol.tsx");
const FAVICON = read("../favicon.svg");
const ICON = read("../icon.svg");
const MANIFEST = read("../manifest.webmanifest");

const BANNED = [/3b82f6/i, /2563eb/i, /f97316/i];

describe("design contract", () => {
  it("ships no banned hue in the stylesheet, the entry, the mark or the icons", () => {
    for (const source of [CSS, ENTRY, MARK, FAVICON, ICON, MANIFEST]) {
      for (const banned of BANNED) {
        expect(banned.test(source), `banned hue ${banned} found`).toBe(false);
      }
    }
  });

  it("carries the argan jade #34d8a8 as the one signal (mark story #14b98c)", () => {
    expect(CSS).toMatch(/--sol-primary: #34d8a8/);
    expect(CSS).toMatch(/--arg-jade: #34d8a8/);
    expect(MARK).toMatch(/#14b98c/);
  });

  it("keeps the pill out of the stylesheet (no 999px, no stadium radius)", () => {
    expect(CSS.includes("999px"), "the pill radius is retired").toBe(false);
    expect(CSS.includes("--r-pill"), "no pill token survives").toBe(false);
  });

  it("never ships an all-properties transition", () => {
    expect(/transition:\s*all/.test(CSS), "transition: all is a reprovação").toBe(false);
  });

  it("never enters an element from zero scale (the windows dtPopIntro bounce excepted)", () => {
    const sansPopIntro = CSS.replace(/@keyframes dtPopIntro \{[\s\S]*?\n\}/g, "");
    expect(
      /scale\(0\)/.test(sansPopIntro),
      "scale(0) entries are a reprovação (the dtPopIntro bounce of the windows recipe excepted)",
    ).toBe(false);
  });

  it("declares the trylle font stacks (Inter reading, Geist Mono detail)", () => {
    expect(CSS).toMatch(/--font-sans: "Inter Variable"/);
    expect(CSS).toMatch(/--font-mono: "Geist Mono Variable"/);
    expect(ENTRY).toMatch(/family=Inter/);
    expect(ENTRY).toMatch(/Geist\+Mono/);
  });

  it("keeps the entry on the source face (./App.tsx, canonical assets, no hashed ghosts)", () => {
    expect(ENTRY).toMatch(/script[^>]*\.\/App\.tsx/);
    expect(/-[0-9a-f]{8}\.(js|css)/.test(ENTRY), "no hashed bundle rides the entry").toBe(false);
    expect(ENTRY).toMatch(/href="\.\/favicon\.svg"/);
    expect(ENTRY).toMatch(/href="\.\/manifest\.webmanifest"/);
  });

  it("guards the reduced-motion stop on every layer", () => {
    const blocks = CSS.match(/@media \(prefers-reduced-motion: reduce\)/g) ?? [];
    expect(blocks.length >= 4, `expected the hard stop on every layer, found ${blocks.length}`).toBe(true);
  });

  it("keeps tabular numerals on the platform numbers", () => {
    expect(CSS).toMatch(/font-variant-numeric:\s*tabular-nums/);
  });

  it("rests the title-bar mark on the landing (logo discipline)", () => {
    expect(CSS).toMatch(/data-landing/);
    expect(MARK).toMatch(/data-landing/);
  });

  it("pins the footer to the window floor (the sticky-footer law)", () => {
    expect(CSS).toMatch(/\.winapp__stage > main\.shell \{[^}]*flex-direction: column/);
    expect(CSS).toMatch(/\.r3a-foot \{[^}]*margin-top: auto/);
  });

  it("declares the honest page set (home, zones, dnssec, gateway, settings, notfound)", () => {
    expect(TOML).toMatch(/pages = \["home", "zones", "dnssec", "gateway", "settings", "notfound"\]/);
    for (const route of ['"/zones"', '"/dnssec"', '"/gateway"', '"/settings"', '"/404"']) {
      expect(SOL.includes(`path=${route}`), `route ${route} must mount`).toBe(true);
    }
  });

  it("keeps the entry flow mounted (intro, onboarding) before the fundamentals", () => {
    expect(SOL).toMatch(/path="\/intro"/);
    expect(SOL).toMatch(/path="\/onboarding"/);
    expect(SOL.indexOf('"/intro"')).toBeLessThan(SOL.indexOf('"/"'));
  });

  it("carries the flow contract sources (the entry gate behind the home anchor, the shared state module)", () => {
    const GATE = read("../Sol/components/home.entrygate.tsx");
    const STATE = read("../onboardingstate.ts");
    const HOME = read("../Sol/home/home.tsx");
    const ONBOARDING = read("../Sol/onboarding/onboarding.tsx");
    expect(GATE).toMatch(/navigate\("\/intro"/);
    expect(GATE).toMatch(/navigate\("\/onboarding"/);
    expect(HOME).toMatch(/EntryGate/);
    expect(ONBOARDING).toMatch(/markOnboardingSeen/);
    expect(STATE).toMatch(/argan\.onboarding\.seen/);
    expect(STATE).toMatch(/\/api\/v1\/onboarding/);
  });

  it("catalogues the first-run state in the db layer (prisma model + sqlite mirror)", () => {
    const PRISMA = read("../schema.prisma");
    const DB = read("../db.ts");
    expect(PRISMA).toMatch(/model OnboardingState \{/);
    expect(PRISMA).toMatch(/introseen\s+Boolean\s+@default\(false\)/);
    expect(PRISMA).toMatch(/onboardingseen\s+Boolean\s+@default\(false\)/);
    expect(DB).toMatch(/CREATE TABLE IF NOT EXISTS onboarding_state/);
    expect(DB).toMatch(/getonboardingstate/);
    expect(DB).toMatch(/setonboardingstage/);
  });
});
