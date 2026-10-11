// # design.test — the design contract of the foundry surface, runnable with
// the node built-in runner (no dependencies, no install):
//   node --test tests/design.test.ts
// The file reads the shipped sources (css, entry face, brand mark, app
// identity) and pins the family laws: no banned hue, no pill, no
// transition:all, the family font triad, the source-face entry and the
// honest page set of the application identity.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const CSS = read("../Sol/sol.css");
const ENTRY = read("../index.html");
const MARK = read("../Sol/shell/BrandMark.tsx");
const TOML = read("../devthink.toml");
const SOL = read("../Sol/Sol.tsx");

const BANNED = [/3b82f6/i, /2563eb/i, /f97316/i];

describe("design contract", () => {
  it("ships no banned hue in the stylesheet, the entry or the mark", () => {
    for (const source of [CSS, ENTRY, MARK]) {
      for (const banned of BANNED) {
        assert.ok(!banned.test(source), `banned hue ${banned} found`);
      }
    }
  });

  it("carries the foundry accent #2fb8b5 as the one signal", () => {
    assert.match(CSS, /--sol-primary: #2fb8b5/);
    assert.match(MARK, /#2fb8b5/);
  });

  it("retires the abandoned blue and amber identities", () => {
    assert.ok(!/1e6ff2|4d8edd/.test(CSS), "the pipeline blue is gone");
    assert.ok(!/d97706|b45309|f59e0b/.test(CSS), "the molten amber is gone");
  });

  it("wears the têmpera identity on the icons and the manifest", () => {
    const FAVICON = read("../favicon.svg");
    const ICON = read("../icon.svg");
    const MANIFEST = read("../manifest.webmanifest");
    for (const [name, source] of [
      ["favicon.svg", FAVICON],
      ["icon.svg", ICON],
    ] as const) {
      assert.ok(!/1e6ff2|1447a8/.test(source), `${name} still rides the pipeline blue`);
    }
    assert.match(ICON, /#2fb8b5|#4fd6d2|#1f7d7b/, "the icon rides the têmpera family");
    assert.match(FAVICON, /#2fb8b5/, "the favicon rides the têmpera family");
    assert.match(MANIFEST, /"theme_color": "#2fb8b5"/, "the manifest theme color is the têmpera");
    assert.match(MANIFEST, /"background_color": "#0a1210"/, "the manifest background is the fornalha base");
    assert.match(ENTRY, /theme-color" content="#0a1210"/, "the entry theme color is the fornalha base");
  });

  it("keeps the pill out of the stylesheet (no 999px, no stadium radius)", () => {
    assert.ok(!CSS.includes("999px"), "the pill radius is retired");
    assert.ok(!CSS.includes("--r-pill"), "no pill token survives");
  });

  it("never ships transition: all", () => {
    assert.ok(!/transition:\s*all/.test(CSS), "transition: all is a reprovação");
  });

  it("declares the family font triad (Bricolage display, Outfit reading, JetBrains Mono detail)", () => {
    assert.match(CSS, /--font-display: "Bricolage Grotesque"/);
    assert.match(CSS, /--sol-mono: var\(--font-mono\)/);
    assert.match(CSS, /"Outfit"/);
    assert.match(ENTRY, /Bricolage\+Grotesque/);
    assert.match(ENTRY, /Outfit/);
    assert.match(ENTRY, /JetBrains\+Mono/);
  });

  it("keeps the entry on the source face (./App.tsx, no hashed ghosts)", () => {
    assert.match(ENTRY, /script[^>]*\.\/App\.tsx/);
    assert.ok(!/-[0-9a-f]{8}\.(js|css)/.test(ENTRY), "no hashed bundle rides the entry");
    assert.match(ENTRY, /href="\.\/favicon\.svg"/);
  });

  it("guards the reduced-motion stop on the platform layers", () => {
    const blocks = CSS.match(/@media \(prefers-reduced-motion: reduce\)/g) ?? [];
    assert.ok(blocks.length >= 4, `expected the hard stop on every layer, found ${blocks.length}`);
  });

  it("declares the honest page set (home, sandboxes, images, artifacts, notfound)", () => {
    assert.match(TOML, /pages = \["home", "sandboxes", "images", "artifacts", "notfound"\]/);
    for (const route of ['"/sandboxes"', '"/images"', '"/artifacts"', '"/404"']) {
      assert.ok(SOL.includes(`path=${route}`), `route ${route} must mount`);
    }
  });

  it("keeps tabular numerals on the platform numbers", () => {
    assert.match(CSS, /font-variant-numeric:\s*tabular-nums/);
  });

  it("rests the title-bar mark on the landing (logo discipline)", () => {
    assert.match(CSS, /data-landing/);
  });
});
