// # design.test — the design contract of the stealthhead surface, runnable
//   with the vitest runner:
//   npm test
// The file reads the shipped sources (stylesheet, entry face, brand mark,
// app identity, theme anchor, icons) and pins the family laws of the reform
// wave beside the under-construction law the owner ordered: no banned hue,
// no pill, no all-properties transition, no zero-scale entry, the trylle
// font stacks, the source-face entry, the reduced-motion stop, tabular
// numerals, the trylle-canvas/windows-hands foundation and the ONE
// COMPONENT SURFACE LAW (the whole app mounts the under-construction face —
// no routes, no shell chrome, no game pages — and the face owns the direct
// url full-bleed).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const CSS = read("../sol/sol.css");
const ENTRY = read("../index.html");
const APP = read("../App.tsx");
const SOL = read("../sol/Sol.tsx");
const MARK = read("../sol/wingets/ShellBrandmark.tsx");
const TOML = read("../devthink.toml");
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

  it("carries the white sun as the identity accent with the coral story in the mark (#f4694f) and the windows accent on focus", () => {
    expect(CSS).toMatch(/--color-signal: #ffffff/);
    expect(CSS).toMatch(/--sh-accent: var\(--color-signal\)/);
    expect(MARK).toMatch(/#f4694f/);
    // the windows hands: focus speaks the windows accent
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

  it("never enters an element from zero scale", () => {
    expect(/scale\(0\)/.test(CSS), "scale(0) entries are a rejection").toBe(false);
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
    expect(blocks.length >= 3, `expected the guard ladder on every layer, found ${blocks.length}`).toBe(true);
    const hardStopAt = CSS.lastIndexOf("@media (prefers-reduced-motion: reduce)");
    expect(CSS.slice(hardStopAt)).toMatch(/0\.01ms !important/);
    expect(CSS.slice(hardStopAt + 1)).not.toMatch(/@media/);
  });

  it("keeps tabular numerals on the platform numbers", () => {
    expect(CSS).toMatch(/font-variant-numeric:\s*tabular-nums/);
  });

  it("mounts the ONE under-construction component — no routes, no shell, no game pages", () => {
    // the root anchor imports only the theme anchor and mounts it inside the
    // error boundary; no router, no toaster, no routerbase door
    expect(APP).toMatch(/import Sol from "\.\/sol\/Sol"/);
    expect(APP).toMatch(/<Sol \/>/);
    expect(APP.includes("wouter"), "the app rides no router any more").toBe(false);
    expect(APP.includes("Toaster"), "the toast surface retired with the pages").toBe(false);
    expect(APP.includes("routerBase"), "the routerbase door retired with the routes").toBe(false);
    // the theme anchor mounts the face from the winget barrel — nothing else
    expect(SOL).toMatch(/import \{ Constructionface \} from "\.\/wingets"/);
    expect(SOL).toMatch(/<Constructionface \/>/);
    expect(SOL.includes("wouter"), "no route table rides the theme").toBe(false);
    expect(SOL.includes("Switch"), "no route switch rides the theme").toBe(false);
    expect(SOL.includes("Shell"), "no window chrome rides the theme").toBe(false);
    // the honest identity of the application: one page, the construction seat
    expect(TOML).toMatch(/pages = \["construction"\]/);
  });

  it("answers the direct url full-bleed — the face owns the whole viewport", () => {
    /* the family standalone law rides the face itself now: an app accessed
    by its own url is the one component full-bleed, one hundred percent —
    no shell wrapper, no window chrome, no stage column */
    expect(CSS).toMatch(/\.shconstr \{[^}]*min-height: 100vh/s);
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
