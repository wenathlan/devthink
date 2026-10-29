// # design.test — the design contract of the stealthhead surface, runnable
//   with the vitest runner:
//   npm test
// The file reads the shipped sources (stylesheet, entry face, brand mark,
// app identity, route anchor, icons) and pins the family laws of the reform
// wave: no banned hue, no pill, no all-properties transition, no zero-scale
// entry (the windows dtPopIntro bounce excepted), the trylle font stacks,
// the source-face entry, the reduced-motion stop, tabular numerals, the
// sticky-footer law, the honest page set of the application identity, the
// first-run flow contract (the entry gate, the shared onboarding state, the
// db mirror), the trylle-canvas/windows-hands foundation and the FAMILY
// STANDALONE LAW (the shell answers the direct url full-bleed, the window
// chrome lives only inside the os embed).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const CSS = read("../Sol/sol.css");
const ENTRY = read("../index.html");
const SHELL = read("../Sol/shell/Shell.tsx");
const MARK = read("../Sol/wingets/ShellBrandmark.tsx");
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

  it("carries the white sun as the identity accent with the coral story in the mark (#f4694f) and the windows accent on the chrome", () => {
    expect(CSS).toMatch(/--color-signal: #ffffff/);
    expect(CSS).toMatch(/--sh-accent: var\(--color-signal\)/);
    expect(MARK).toMatch(/#f4694f/);
    // the windows hands: focus and the chrome speak the windows accent
    expect(CSS).toMatch(/--win-accent: #4cc2ff/);
    expect(CSS).toMatch(/outline: 2px solid var\(--win-accent\)/);
  });

  it("keeps the pill out of the stylesheet (no 999px, no stadium radius)", () => {
    expect(CSS.includes("999px"), "the pill radius is retired").toBe(false);
    expect(CSS.includes("--r-pill"), "no pill token survives").toBe(false);
  });

  it("never ships an all-properties transition", () => {
    expect(/transition:\s*all/.test(CSS), "transition: all is a rejection").toBe(false);
  });

  it("never enters an element from zero scale (the windows dtPopIntro bounce excepted)", () => {
    const sansPopIntro = CSS.replace(/@keyframes dtPopIntro \{[\s\S]*?\n\}/g, "");
    expect(
      /scale\(0\)/.test(sansPopIntro),
      "scale(0) entries are a rejection (the dtPopIntro bounce of the windows recipe excepted)",
    ).toBe(false);
  });

  it("declares the trylle font stacks (Inter reading, Geist Mono detail) and the 13px body", () => {
    expect(CSS).toMatch(/--font-sans: "Inter Variable"/);
    expect(CSS).toMatch(/--font-mono: "Geist Mono Variable"/);
    expect(ENTRY).toMatch(/family=Inter/);
    expect(ENTRY).toMatch(/Geist\+Mono/);
    expect(CSS).toMatch(/font-size: 13px/);
    expect(CSS).toMatch(/font-weight: 450/);
  });

  it("keeps the entry on the source face (./App.tsx, canonical assets, no hashed ghosts)", () => {
    expect(ENTRY).toMatch(/script[^>]*\.\/App\.tsx/);
    expect(/-[0-9a-f]{8}\.(js|css)/.test(ENTRY), "no hashed bundle rides the entry").toBe(false);
    expect(ENTRY).toMatch(/href="\.\/favicon\.svg"/);
    expect(ENTRY).toMatch(/href="\.\/manifest\.webmanifest"/);
  });

  it("guards the reduced-motion stop on every layer (the hard stop last)", () => {
    const blocks = CSS.match(/@media \(prefers-reduced-motion: reduce\)/g) ?? [];
    expect(blocks.length >= 4, `expected the hard stop on every layer, found ${blocks.length}`).toBe(true);
    const hardStopAt = CSS.lastIndexOf("@media (prefers-reduced-motion: reduce)");
    expect(CSS.slice(hardStopAt)).toMatch(/0\.01ms !important/);
    expect(CSS.slice(hardStopAt + 1)).not.toMatch(/@media/);
  });

  it("keeps tabular numerals on the platform numbers", () => {
    expect(CSS).toMatch(/font-variant-numeric:\s*tabular-nums/);
  });

  it("answers the direct url full-bleed — the window chrome lives only inside the os", () => {
    /* the family standalone law: an app accessed by its own url is the
    normal application, one hundred percent — the shell renders
    shell--standalone with no window chrome of its own (no title bar, no
    captions, no resize handles, no inactive law, no entry scale), while
    the framed contract keeps the bare stage for the os power clip */
    expect(SHELL).toContain("shell--standalone");
    expect(SHELL).toContain("shell--embedded");
    expect(SHELL).not.toMatch(
      /className="appframe"|winapp__title|winapp__cap|winapp__rz|winchip|setPointerCapture|data-inactive/,
    );
    expect(CSS).toMatch(/\.shell--standalone \{[^}]*height: 100vh/);
  });

  it("pins the footer to the window floor (the sticky-footer law)", () => {
    expect(CSS).toMatch(/\.winapp__stage > main\.shell \{[^}]*flex-direction: column/);
    expect(CSS).toMatch(/\.shquad \{[^}]*margin-top: auto/s);
  });

  it("declares the honest page set (home, match, ranking, weapons, world, notfound)", () => {
    expect(TOML).toMatch(/pages = \["home", "match", "ranking", "weapons", "world", "notfound"\]/);
    for (const route of ['"/match"', '"/ranking"', '"/weapons"', '"/world"', '"/404"']) {
      expect(SOL.includes(`path=${route}`), `route ${route} must mount`).toBe(true);
    }
  });

  it("keeps the entry flow mounted (intro, onboarding) before the fundamentals", () => {
    expect(SOL).toMatch(/path="\/intro"/);
    expect(SOL).toMatch(/path="\/onboarding"/);
    expect(SOL.indexOf('"/intro"')).toBeLessThan(SOL.indexOf('"/"'));
  });

  it("carries the flow contract sources (the entry gate behind the home anchor, the shared state module)", () => {
    const GATE = read("../Sol/wingets/HomeEntrygate.tsx");
    const STATE = read("../onboardingstate.ts");
    const HOME = read("../Sol/home/home.tsx");
    const ONBOARDING = read("../Sol/onboarding/onboarding.tsx");
    expect(GATE).toMatch(/navigate\("\/intro"/);
    expect(GATE).toMatch(/navigate\("\/onboarding"/);
    expect(HOME).toMatch(/EntryGate/);
    expect(ONBOARDING).toMatch(/markOnboardingStage/);
    expect(STATE).toMatch(/stealthhead\.onboarding\.seen/);
    expect(STATE).toMatch(/\/api\/v1\/onboarding/);
  });

  it("catalogues the first-run state in the db layer (prisma model + sqlite mirror)", () => {
    const PRISMA = read("../schema.prisma");
    const DB = read("../db.ts");
    expect(PRISMA).toMatch(/model OnboardingState \{/);
    expect(PRISMA).toMatch(/introseen\s+Boolean\s+@default\(false\)/);
    expect(PRISMA).toMatch(/onboardingseen\s+Boolean\s+@default\(false\)/);
    expect(DB).toMatch(/create table if not exists onboardingstate/);
    expect(DB).toMatch(/getonboardingstate/);
    expect(DB).toMatch(/setonboardingstage/);
  });

  it("wears the windows hands on the rail (the pin bounce, the press law)", () => {
    expect(CSS).toMatch(/@keyframes dtPopIntro/);
    expect(CSS).toMatch(/\.winapp__raillink:active > svg \{[^}]*transform: scale\(0\.7\)/);
  });

  it("rides the trylle foundation (canvas, surfaces, hairlines, linear shadow ladder)", () => {
    expect(CSS).toMatch(/--sol-canvas: #0a0a0b/);
    expect(CSS).toMatch(/--sol-canvas-deep: #060607/);
    expect(CSS).toMatch(/--sol-ink: #fafafa/);
    expect(CSS).toMatch(/--sol-surface-8: #484848/);
    expect(CSS).toMatch(/color-mix\(in oklab, var\(--sol-ink\) 5%, transparent\)/);
    expect(CSS).toMatch(/0 96px 96px -48px/);
    expect(CSS).toMatch(/cubic-bezier\(0\.22, 1, 0\.36, 1\)/);
    expect(CSS).toMatch(/--sol-micro: 150ms/);
  });
});
