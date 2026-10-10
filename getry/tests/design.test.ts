// # design.test — the design contract of the getry surface, runnable with the
// vitest runner:
//   pnpm test
// The file reads the shipped sources (stylesheet, entry face, brand mark,
// app identity, route anchor) and pins the family laws: no banned hue, no
// pill, no all-properties transition, no zero-scale entry, the family font
// triad, the source-face entry, the reduced-motion stop, tabular numerals,
// the sticky-footer law, the family row on the landing footer and the honest
// page set of the application identity.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const CSS = read("../Sol/sol.css");
const ENTRY = read("../index.html");
const MARK = read("../Sol/shell/BrandMark.tsx");
const TOML = read("../devthink.toml");
const SOL = read("../Sol/Sol.tsx");
const HOME = read("../Sol/home/home.tsx");
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

  it("carries the reasoning violet #8b5cf6 as the one signal (no residual sky)", () => {
    expect(CSS).toMatch(/--sol-primary: #8b5cf6/);
    expect(CSS).toMatch(/--gr-violet: #8b5cf6/);
    expect(MARK).toMatch(/#8b5cf6/);
    expect(CSS.includes("#60a5fa"), "the residual sky retired").toBe(false);
  });

  it("keeps the pill out of the stylesheet (no 999px, no stadium radius)", () => {
    expect(CSS.includes("999px"), "the pill radius is retired").toBe(false);
    expect(CSS.includes("--r-pill"), "no pill token survives").toBe(false);
  });

  it("never ships an all-properties transition", () => {
    expect(/transition:\s*all/.test(CSS), "transition: all is a reprovação").toBe(false);
  });

  it("never enters an element from zero scale", () => {
    expect(/scale\(0\)/.test(CSS), "scale(0) entries are a reprovação").toBe(false);
  });

  it("declares the family font triad (Bricolage display, Outfit reading, JetBrains Mono detail)", () => {
    expect(CSS).toMatch(/--font-display: "Bricolage Grotesque"/);
    expect(CSS).toMatch(/--font-ui: "Outfit"/);
    expect(CSS).toMatch(/--font-mono: "JetBrains Mono"/);
    expect(ENTRY).toMatch(/Bricolage\+Grotesque/);
    expect(ENTRY).toMatch(/Outfit/);
    expect(ENTRY).toMatch(/JetBrains\+Mono/);
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
  });

  it("pins the footer to the window floor (the sticky-footer law)", () => {
    expect(CSS).toMatch(/\.winapp__stage > main\.shell \{[^}]*flex-direction: column/);
    expect(CSS).toMatch(/\.r3-quad \{[^}]*margin: auto/);
  });

  it("renders the family row on the landing footer through the familyurl contract", () => {
    expect(HOME).toMatch(/familyrow\(\)/);
    expect(HOME).toMatch(/familyurl\(member\.slug\)/);
  });

  it("declares the honest page set (home, versions, thinking, sessions, notfound)", () => {
    expect(TOML).toMatch(/pages = \["home", "versions", "thinking", "sessions", "notfound"\]/);
    for (const route of ['"/versions"', '"/thinking"', '"/sessions"', '"/404"']) {
      expect(SOL.includes(`path=${route}`), `route ${route} must mount`).toBe(true);
    }
  });
});
