// # design.test — the design contract of the vault surface, runnable with
// the node built-in runner (no dependencies, no install):
//   node --test tests/design.test.ts
// The file reads the shipped sources (css, entry face, brand mark, app
// identity) and pins the family laws: no banned hue, no pill, no
// transition:all, the family font triad, the source-face entry, the gelo
// identity and the honest page set of the application identity.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const CSS = read("../Sol/sol.css");
const ENTRY = read("../index.html");
const MARK = read("../Sol/shell/BrandMark.tsx");
const SHELL = read("../Sol/shell/Shell.tsx");
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

  it("carries the vault accent #a3d7e6 as the one signal (chrome and mark agree)", () => {
    assert.match(CSS, /--sol-primary: #a3d7e6/);
    assert.match(CSS, /--win-accent: #a3d7e6/);
    assert.match(CSS, /--dt-accent: #a3d7e6/);
    assert.match(MARK, /#a3d7e6/);
  });

  it("retires the gold lamplight and the green ghost from the identity", () => {
    assert.ok(!/3ecf8e/i.test(CSS + ENTRY), "the green ghost is gone");
    const gold = CSS.lastIndexOf("#eab308");
    const ice = CSS.lastIndexOf("#a3d7e6");
    assert.ok(ice > gold, "the gelo retint must restate the identity after the gold era");
  });

  it("wears the gelo identity on the icons and the manifest", () => {
    const FAVICON = read("../favicon.svg");
    const ICON = read("../icon.svg");
    const MANIFEST = read("../manifest.webmanifest");
    assert.match(FAVICON, /#a3d7e6/, "the favicon rides the gelo");
    assert.match(ICON, /#5b93a6|#c9e9f2/, "the icon rides the gelo family");
    assert.match(MANIFEST, /"theme_color": "#a3d7e6"/, "the manifest theme color is the gelo");
    assert.match(MANIFEST, /"background_color": "#0a0d10"/, "the manifest background is the abyss base");
    assert.match(ENTRY, /theme-color" content="#0a0d10"/, "the entry theme color is the abyss base");
  });

  it("keeps the pill out of the stylesheet (no 999px, no stadium radius)", () => {
    assert.ok(!CSS.includes("999px"), "the pill radius is retired");
    assert.ok(!CSS.includes("--r-pill"), "no pill token survives");
  });

  it("never ships transition: all", () => {
    assert.ok(!/transition:\s*all/.test(CSS), "transition: all is a reprovação");
  });

  it("never enters from scale(0) (the family floors every pop)", () => {
    assert.ok(!/scale\(0\)/.test(CSS), "scale(0) is a reprovação — the floor is .965 or higher");
  });

  it("declares the family font triad (Bricolage display, Outfit reading, JetBrains Mono detail)", () => {
    assert.match(CSS, /"Bricolage Grotesque"/);
    assert.match(CSS, /"JetBrains Mono"/);
    assert.match(ENTRY, /Bricolage\+Grotesque/);
    assert.match(ENTRY, /Outfit/);
    assert.match(ENTRY, /JetBrains\+Mono/);
  });

  it("keeps the entry on the source face (./App.tsx, no hashed ghosts)", () => {
    assert.match(ENTRY, /script[^>]*\.\/App\.tsx/);
    assert.ok(!/-[0-9a-f]{8}\.(js|css)/.test(ENTRY), "no hashed bundle rides the entry");
    assert.match(ENTRY, /href="\.\/favicon\.svg"/);
  });

  it("guards the reduced-motion stop on every layer", () => {
    const blocks = CSS.match(/@media \(prefers-reduced-motion: reduce\)/g) ?? [];
    assert.ok(blocks.length >= 4, `expected the hard stop on every layer, found ${blocks.length}`);
  });

  it("declares the honest page set (home, objects, buckets, retention, notfound)", () => {
    assert.match(TOML, /pages = \["home", "objects", "buckets", "retention", "notfound"\]/);
    for (const route of ['"/objects"', '"/buckets"', '"/retention"', '"/404"']) {
      assert.ok(SOL.includes(`path=${route}`), `route ${route} must mount`);
    }
  });

  it("keeps tabular numerals on the platform numbers", () => {
    assert.match(CSS, /font-variant-numeric:\s*tabular-nums/);
  });

  it("rests the title-bar mark on the landing (logo discipline)", () => {
    assert.match(CSS, /data-landing/);
    assert.ok(SHELL.includes("data-landing"), "the shell carries the landing attribute");
  });

  it("runs the family flow signature inside the mark strokes", () => {
    assert.match(MARK, /vtMarkFlow/, "the flow layer exists on the vault mark");
    assert.match(MARK, /vtm-flow/, "the flow gradient is declared");
    assert.match(MARK, /prefers-reduced-motion: reduce[\s\S]*\.vtMarkFlow \{ opacity: 0/, "the flow hard-stops on reduced motion");
  });

  it("links the family row from the one table (zero drift between chrome and landing)", () => {
    assert.match(SHELL, /from "\.\.\/\.\.\/family"/, "the shell reads family.ts");
    const HOME = read("../Sol/home/home.tsx");
    assert.match(HOME, /familyrow/, "the landing footer reads the same table");
  });
});
