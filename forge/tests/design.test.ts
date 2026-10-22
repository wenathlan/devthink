// # design.test — the design contract of the forge surface, runnable with
// the node built-in runner (no dependencies, no install):
//   node --test tests/design.test.ts
// The file reads the shipped sources (css, entry face, brand mark, app
// identity, route anchor, flow sources) and pins the family laws of the
// reform wave: the trylle foundation (canvas, surfaces, Inter + Geist Mono),
// the windows hands (accent, close red, no pill, no all-properties
// transition, no zero-scale entry outside the dtPopIntro bounce), the
// source-face entry, the reduced-motion stop, tabular numerals, the honest
// page set and the first-run flow contract (the entry gate, the shared
// onboarding state, the db mirror).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const CSS = read("../Sol/sol.css");
const ENTRY = read("../index.html");
const MARK = read("../Sol/componentes/shell/BrandMark.tsx");
const TOML = read("../devthink.toml");
const SOL = read("../Sol/Sol.tsx");
const GATE = read("../Sol/componentes/home/entrygate.tsx");
const STATE = read("../onboardingstate.ts");
const ONBOARDING = read("../Sol/onboarding/onboarding.tsx");
const INTRO = read("../Sol/intro/intro.tsx");
const SHELL = read("../Sol/shell/Shell.tsx");
const PRISMA = read("../schema.prisma");
const DB = read("../db.ts");

const BANNED = [/3b82f6/i, /2563eb/i, /f97316/i, /f59e0b/i];

describe("design contract", () => {
  it("ships no banned hue in the stylesheet, the entry or the mark", () => {
    for (const source of [CSS, ENTRY, MARK]) {
      for (const banned of BANNED) {
        assert.ok(!banned.test(source), `banned hue ${banned} found`);
      }
    }
  });

  it("builds on the trylle foundation (canvas, deep floor, ink)", () => {
    assert.match(CSS, /--sol-canvas: #0a0a0b/);
    assert.match(CSS, /--sol-canvas-deep: #060607/);
    assert.match(CSS, /--sol-ink: #fafafa/);
    assert.match(CSS, /--sol-surface-1: #171717/);
    assert.match(CSS, /--sol-surface-8: #484848/);
  });

  it("carries the forge lime #a2cb3a as the one identity signal (brand, CTAs, active ladder)", () => {
    assert.match(CSS, /--fg-lime: #a2cb3a/);
    assert.match(CSS, /--sol-primary: #a2cb3a/);
    assert.match(MARK, /#a2cb3a/);
  });

  it("rides the windows accent #4cc2ff for focus (the win10 #0067c0 in the light face)", () => {
    assert.match(CSS, /--win-accent: #4cc2ff/);
    assert.match(CSS, /--win-accent: #0067c0/);
    assert.match(CSS, /--sol-focus: var\(--win-accent\)/);
    const dark = CSS.indexOf("--win-accent: #4cc2ff");
    const light = CSS.indexOf("--win-accent: #0067c0");
    assert.ok(light > dark, "the light accent must be restated after the dark one");
  });

  it("keeps the pill out of the stylesheet (no 999px, no stadium radius)", () => {
    assert.ok(!CSS.includes("999px"), "the pill radius is retired");
    assert.ok(!CSS.includes("--r-pill"), "no pill token survives");
  });

  it("never ships transition: all", () => {
    assert.ok(!/transition:\s*all/.test(CSS), "transition: all is a reprovação");
  });

  it("never enters an element from zero scale (the windows dtPopIntro bounce excepted)", () => {
    const sansPopIntro = CSS.replace(/@keyframes dtPopIntro \{[\s\S]*?\n\}/g, "");
    assert.ok(
      !/scale\(0\)/.test(sansPopIntro),
      "scale(0) entries are a reprovação (the dtPopIntro bounce of the windows recipe excepted)",
    );
  });

  it("declares the trylle font stacks (Inter reading, Geist Mono detail)", () => {
    assert.match(CSS, /--font-sans: "Inter Variable"/);
    assert.match(CSS, /--font-mono: "Geist Mono Variable"/);
    assert.match(ENTRY, /family=Inter/);
    assert.match(ENTRY, /Geist\+Mono/);
  });

  it("keeps the entry on the source face (./App.tsx, canonical assets, no hashed ghosts)", () => {
    assert.match(ENTRY, /script[^>]*\.\/App\.tsx/);
    assert.ok(!/-[0-9a-f]{8}\.(js|css)/.test(ENTRY), "no hashed bundle rides the entry");
    assert.match(ENTRY, /href="\.\/favicon\.svg"/);
  });

  it("guards the reduced-motion stop on every layer, the hard stop last", () => {
    const blocks = CSS.match(/@media \(prefers-reduced-motion: reduce\)/g) ?? [];
    assert.ok(blocks.length >= 4, `expected the hard stop on every layer, found ${blocks.length}`);
    const hardStop = CSS.indexOf("animation-duration: 0.01ms !important");
    assert.ok(hardStop > 0, "the .01ms hard stop must exist");
    assert.ok(/@media \(prefers-reduced-motion: reduce\)[\s\S]*$/.test(CSS), "the guards close the file");
    const lastGuard = CSS.lastIndexOf("@media (prefers-reduced-motion: reduce)");
    assert.ok(CSS.indexOf("animation-duration: 0.01ms", lastGuard) > lastGuard, "the hard stop is the last word");
  });

  it("floors the acrylics on reduced transparency (the window values)", () => {
    assert.match(CSS, /@media \(prefers-reduced-transparency: reduce\)/);
    assert.match(CSS, /background-color: #202020/);
    assert.match(CSS, /background-color: #2b2b2b/);
    assert.match(CSS, /background-color: #2c2c2c/);
  });

  it("keeps tabular numerals on the platform numbers", () => {
    assert.match(CSS, /font-variant-numeric:\s*tabular-nums/);
  });

  it("rests the title-bar mark on the landing (logo discipline)", () => {
    assert.match(CSS, /data-landing/);
  });

  it("wears the windows hands (press scale .7, dtPopIntro, the state ladder, the red close)", () => {
    assert.match(CSS, /@keyframes dtPopIntro/);
    assert.match(CSS, /transform: scale\(0\.7\)/);
    assert.match(CSS, /--win-close: rgb\(232, 17, 35\)/);
    assert.match(CSS, /--win-close-hot: rgb\(139, 10, 20\)/);
    assert.match(CSS, /grayscale\(80%\)/);
  });

  it("declares the honest page set (home, runs, queue, logs, notfound)", () => {
    assert.match(TOML, /pages = \["home", "runs", "queue", "logs", "notfound"\]/);
    for (const route of ['"/runs"', '"/queue"', '"/logs"', '"/404"']) {
      assert.ok(SOL.includes(`path=${route}`), `route ${route} must mount`);
    }
  });

  it("keeps the entry flow mounted (intro, onboarding) before the gated fundamentals", () => {
    assert.match(SOL, /path="\/intro"/);
    assert.match(SOL, /path="\/onboarding"/);
    assert.ok(SOL.indexOf('"/intro"') < SOL.indexOf('"/"'), "the intro route precedes the home route");
    assert.match(SOL, /EntryGate/);
  });

  it("carries the flow contract sources (the gate beside the home anchor, the shared state module)", () => {
    assert.match(GATE, /navigate\("\/intro", \{ replace: true \}\)/);
    assert.match(GATE, /navigate\("\/onboarding", \{ replace: true \}\)/);
    assert.match(GATE, /loadOnboardingState/);
    assert.match(STATE, /forge\.onboarding\.seen/);
    assert.match(STATE, /\/api\/v1\/onboarding/);
    assert.match(STATE, /VITE_ONBOARDING_URL/);
    assert.match(INTRO, /markIntroSeen/);
    assert.match(ONBOARDING, /markOnboardingSeen/);
    assert.ok(!INTRO.includes("sessionStorage"), "the sessionStorage-only flag is retired");
  });

  it("hands the intro directly to the onboarding (the auto-advance)", () => {
    assert.match(INTRO, /navigate\("\/onboarding"\)/);
  });

  it("marks the onboarding stage on finish and skip alike", () => {
    const finishes = ONBOARDING.match(/markOnboardingSeen/g) ?? [];
    assert.ok(finishes.length >= 2, "finish and skip both write the stage");
    assert.match(ONBOARDING, /navigate\("\/"\)/);
  });

  it("catalogues the first-run state in the db layer (prisma model + sqlite mirror)", () => {
    assert.match(PRISMA, /model OnboardingState \{/);
    assert.match(PRISMA, /introseen\s+Boolean\s+@default\(false\)/);
    assert.match(PRISMA, /onboardingseen\s+Boolean\s+@default\(false\)/);
    assert.match(DB, /CREATE TABLE IF NOT EXISTS onboarding_state/);
    assert.match(DB, /getonboardingstate/);
    assert.match(DB, /setonboardingstage/);
    assert.match(DB, /MAX\(introseen, excluded\.introseen\)/, "the upsert is seen-wins");
  });

  it("reforms the navigation to the 48px pin rail with the windows hands", () => {
    assert.match(CSS, /--win-rail-w: 48px/);
    assert.match(SHELL, /data-tip=\{app\.label\}/);
    assert.match(SHELL, /data-dir="se"/, "the eight resize handles ride the frame");
    assert.match(SHELL, /setPointerCapture/);
  });
});
