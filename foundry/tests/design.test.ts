// # design.test — the design contract of the foundry surface, runnable with
// the node built-in runner (no dependencies, no install):
//   node --test tests/design.test.ts
// The file reads the shipped sources (css, entry face, brand mark, app
// identity) and pins the family laws of the reform wave: no banned hue, no
// pill, no transition:all, the trylle type triad, the source-face entry,
// the azul identity under the windows hands and the honest page set of the
// application identity.
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

/** strips the windows pin keyframe — the one sanctioned scale(0) entrance —
 * so the floor law can be asserted on everything else. */
function cssWithoutPinIntro(source: string): string {
  return source.replace(/@keyframes dtPopIntro \{[\s\S]*?\n\}/, "");
}

describe("design contract", () => {
  it("ships no banned hue in the stylesheet, the entry or the mark", () => {
    for (const source of [CSS, ENTRY, MARK]) {
      for (const banned of BANNED) {
        assert.ok(!banned.test(source), `banned hue ${banned} found`);
      }
    }
  });

  it("keeps the azul identity and the windows accent in their lanes", () => {
    assert.match(CSS, /--sol-primary: #4d8edd/, "the azul identity token stands");
    assert.match(CSS, /--win-accent: #4cc2ff/, "the windows accent governs focus and the bar cta");
    assert.match(CSS, /--win-accent: #0067c0/, "the light theme follows the windows light law");
    assert.match(MARK, /#2fb8b5/, "the drawn mark keeps its têmpera story");
  });

  it("retires the abandoned pipeline blue and the molten amber identities", () => {
    assert.ok(!/1e6ff2/i.test(CSS + ENTRY), "the pipeline blue is gone");
    assert.ok(!/d97706|b45309|f59e0b/i.test(CSS + ENTRY), "the molten amber is gone");
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
    assert.match(ENTRY, /theme-color" content="#0a0a0b"/, "the entry theme color is the trylle canvas");
  });

  it("keeps the pill out of the stylesheet (no 999px, no stadium radius)", () => {
    assert.ok(!CSS.includes("999px"), "the pill radius is retired");
    assert.ok(!CSS.includes("--r-pill"), "no pill token survives");
  });

  it("never ships transition: all", () => {
    assert.ok(!/transition:\s*all/.test(CSS), "transition: all is a reprovação");
  });

  it("never enters from scale(0) outside the windows pin law", () => {
    // the ONE sanctioned scale(0) entrance is the dtPopIntro pin bounce —
    // the windows recipe (0 → 1.125 → 0.725 → 1); everything else floors
    assert.ok(/@keyframes dtPopIntro/.test(CSS), "the windows pin entrance stands");
    assert.ok(!/scale\(0\)/.test(cssWithoutPinIntro(CSS)), "scale(0) outside dtPopIntro is a reprovação");
  });

  it("declares the trylle type triad (Inter Variable surfaces, Geist Mono numbers)", () => {
    assert.match(CSS, /"Inter Variable"/);
    assert.match(CSS, /"Geist Mono Variable"/);
    assert.match(ENTRY, /family=Inter/);
    assert.match(ENTRY, /Geist\+Mono/);
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

  it("wears the windows hands on the shell (press law, pin entrance, resize, inactive)", () => {
    assert.match(CSS, /dtPopIntro/, "the pin entrance keyframe stands");
    assert.match(SHELL, /RESIZE_EDGES/, "the eight resize handles mount");
    assert.match(CSS, /win-rz\[data-edge="se"\]/, "the resize handles ride the frame edges");
    assert.match(CSS, /grayscale\(80%\)/, "the inactive window law stands");
    assert.match(CSS, /rgb\(232 17 35\)/, "the close caption wears the windows red");
  });

  it("declares the honest page set (home, sandboxes, images, artifacts, notfound)", () => {
    assert.match(TOML, /pages = \["home", "sandboxes", "images", "artifacts", "notfound"\]/);
    for (const route of ['"/sandboxes"', '"/images"', '"/artifacts"', '"/404"']) {
      assert.ok(SOL.includes(`path=${route}`), `route ${route} must mount`);
    }
  });

  it("mounts the flow law (intro and onboarding open the route table)", () => {
    assert.match(SOL, /path="\/intro"/);
    assert.match(SOL, /path="\/onboarding"/);
    assert.ok(SOL.indexOf('"/intro"') < SOL.indexOf('"/"'), "the entry flow opens the route table");
  });

  it("carries the flow contract sources (the entry gate behind the home anchor)", () => {
    const GATE = read("../Sol/home/entrygate.tsx");
    const HOME = read("../Sol/home/home.tsx");
    const INTRO = read("../Sol/intro/intro.tsx");
    const ONBOARDING = read("../Sol/onboarding/onboarding.tsx");
    assert.match(GATE, /navigate\("\/intro"/, "an unseen intro navigates to the splash");
    assert.match(GATE, /navigate\("\/onboarding"/, "an unseen onboarding navigates to the walk");
    assert.match(HOME, /EntryGate/, "the home anchor consults the gate");
    assert.match(INTRO, /markIntroSeen/, "the intro marks introseen");
    assert.match(INTRO, /\/onboarding/, "the intro hands DIRECTLY to the walk");
    assert.match(ONBOARDING, /markOnboardingSeen/, "the onboarding marks onboardingseen");
  });

  it("catalogues the seen state on the database, not just the browser", () => {
    const PRISMA = read("../schema.prisma");
    const DB = read("../db.ts");
    const STATE = read("../onboardingstate.ts");
    assert.match(PRISMA, /model OnboardingState \{/, "the prisma model stands");
    assert.match(PRISMA, /introseen\s+Boolean/);
    assert.match(PRISMA, /onboardingseen\s+Boolean/);
    assert.match(DB, /onboarding_states/, "the sqlite mirror exists");
    assert.match(DB, /getOnboardingState/, "the reader accessor exists");
    assert.match(DB, /setOnboardingStage/, "the writer accessor exists");
    assert.doesNotMatch(DB, /["']\s*\+\s*(visitor|stage)\b/, "no concatenated sql rides the accessors");
    assert.match(STATE, /foundry\.onboarding\.seen/, "the localStorage cache mirrors the db");
    assert.match(STATE, /\/api\/v1\/onboarding/, "the accessor rides the platform route");
  });

  it("keeps tabular numerals on the platform numbers", () => {
    assert.match(CSS, /font-variant-numeric:\s*tabular-nums/);
  });

  it("rests the title-bar mark on the landing (logo discipline)", () => {
    assert.match(CSS, /data-landing/);
    assert.ok(SHELL.includes("data-landing"), "the shell carries the landing attribute");
  });

  it("runs the family flow signature inside the mark strokes", () => {
    assert.match(MARK, /fdMarkFlow/, "the flow layer exists on the foundry mark");
    assert.match(MARK, /fdm-flow/, "the flow gradient is declared");
    assert.match(
      MARK,
      /prefers-reduced-motion: reduce[\s\S]*\.fdMarkFlow \{ opacity: 0/,
      "the flow hard-stops on reduced motion",
    );
  });

  it("links the family row from the one table (zero drift between chrome and landing)", () => {
    assert.match(SHELL, /from "\.\.\/\.\.\/family"/, "the shell reads family.ts");
    const HOME = read("../Sol/home/home.tsx");
    assert.match(HOME, /familyrow/, "the landing footer reads the same table");
  });
});
