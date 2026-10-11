// # design.test — the design contract of the stealthhead surface, runnable
// with the vitest runner:
//   npm test
// The file reads the shipped sources (stylesheet, entry face, brand mark,
// app identity, route anchor, icons) and pins the family laws: no banned
// hue, no pill, no all-properties transition, no zero-scale entry, the
// family font triad, the source-face entry, the reduced-motion stop,
// tabular numerals, the sticky-footer law and the honest page set of the
// application identity.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const CSS = read("../Sol/sol.css");
const ENTRY = read("../index.html");
const SHELL = read("../Sol/shell/Shell.tsx");
const MARK = read("../Sol/shell/BrandMark.tsx");
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

  it("carries the stealthhead ember #e8563f as the one signal (mark story #f4694f)", () => {
    expect(CSS).toMatch(/--sol-primary: #e8563f/);
    expect(CSS).toMatch(/--sh-accent: #e8563f/);
    expect(MARK).toMatch(/#f4694f/);
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
    expect(SHELL).toMatch(/data-landing/);
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
});
