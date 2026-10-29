// # design.test — the design contract of the vault surface, runnable with
// the house vitest suite:
//   bunx vitest run tests/design.test.ts
// The file reads the shipped sources (css, entry face, brand mark, app
// identity) and pins the family laws of the reform wave: no banned hue, no
// pill, no transition:all, the trylle type triad, the source-face entry,
// the gelo identity under the windows hands and the honest page set of the
// application identity.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const CSS = read("../Sol/sol.css");
const ENTRY = read("../index.html");
const MARK = read("../Sol/wingets/ShellBrandmark.tsx");
const SHELL = read("../Sol/shell/Shell.tsx");
const TOML = read("../devthink.toml");
const SOL = read("../Sol/Sol.tsx");

const BANNED = [/3b82f6/i, /2563eb/i, /f97316/i];

/** strips the windows pin keyframe — the one sanctioned scale(0) entrance —
 * so the floor law can be asserted on everything else (the block spans
 * lines, so the strip rides a line-aware lazy match). */
function cssWithoutPinIntro(source: string): string {
  return source.replace(/@keyframes dtPopIntro \{[\s\S]*?\n\}/g, "");
}

describe("design contract", () => {
  it("ships no banned hue in the stylesheet, the entry or the mark", () => {
    for (const source of [CSS, ENTRY, MARK]) {
      for (const banned of BANNED) {
        assert.ok(!banned.test(source), `banned hue ${banned} found`);
      }
    }
  });

  it("keeps the white sun signal and the windows accent in their lanes", () => {
    // the single-theme law answers the white sun on the @theme signal and
    // the gelo-de-cofre story survives in the drawn brand mark — the token,
    // the alias and both stay pinned
    assert.match(CSS, /--color-signal: #ffffff/, "the white sun token stands");
    assert.match(CSS, /--gelo-signal: var\(--color-signal\)/, "the gelo alias rides the signal");
    assert.match(CSS, /--sol-primary: var\(--color-signal\)/, "the primary rides the signal slot");
    assert.match(CSS, /--win-accent: var\(--color-win\)/, "the windows accent rides its own slot");
    assert.match(CSS, /--color-win: #4cc2ff/, "the windows accent governs focus and the bar cta");
    assert.match(CSS, /--color-win: #0067c0/, "the light theme follows the windows light law");
    assert.match(MARK, /#a3d7e6/, "the mark rides the gelo");
  });

  it("retires the gold lamplight and the green ghost from the identity", () => {
    assert.ok(!/3ecf8e/i.test(CSS + ENTRY), "the green ghost is gone");
    assert.ok(!/#eab308/i.test(CSS), "the gold lamplight left the stylesheet");
    assert.match(MARK, /#a3d7e6/, "the gelo story survives in the drawn mark");
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
    assert.ok(!/transition:\s*all/.test(CSS), "transition: all is a rejection");
  });

  it("never enters from scale(0) outside the windows pin law", () => {
    // the ONE sanctioned scale(0) entrance is the dtPopIntro pin bounce —
    // the windows recipe (0 → 1.125 → 0.725 → 1); everything else floors
    assert.ok(/@keyframes dtPopIntro/.test(CSS), "the windows pin entrance stands");
    assert.ok(!/scale\(0\)/.test(cssWithoutPinIntro(CSS)), "scale(0) outside dtPopIntro is a rejection");
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

  it("wears the windows hands on the rail (the pin entrance, the press law)", () => {
    assert.match(CSS, /dtPopIntro/, "the pin entrance keyframe stands");
    assert.match(CSS, /win-rail__link:active \{ transform: scale\(0\.7\); \}/, "the pin press law stands");
  });

  it("answers the direct url full-bleed — the window chrome lives only inside the os", () => {
    /* the family standalone law: an app accessed by its own url is the
    normal application, one hundred percent — the shell renders
    shell--standalone with no window chrome of its own (no title bar, no
    captions, no resize handles, no inactive law, no entry scale), while
    the framed contract keeps the bare stage for the os power clip */
    assert.match(SHELL, /shell--standalone/, "the standalone law must mount");
    assert.match(SHELL, /shell--embedded/, "the framed contract stands");
    assert.doesNotMatch(
      SHELL,
      /win-root|win-window|win-titlebar|win-control|win-rz|win-chip|setPointerCapture|RESIZE_EDGES|data-landing/,
      "the window chrome still rides the standalone shell",
    );
    assert.match(CSS, /\.shell--standalone \{[^}]*height: 100vh/, "the standalone block must fill the viewport");
  });

  it("declares the honest page set (home, objects, buckets, retention, notfound)", () => {
    assert.match(TOML, /pages = \["home", "objects", "buckets", "retention", "notfound"\]/);
    for (const route of ['"/objects"', '"/buckets"', '"/retention"', '"/404"']) {
      assert.ok(SOL.includes(`path=${route}`), `route ${route} must mount`);
    }
  });

  it("mounts the flow law (the entry gate on /, intro and onboarding in the chain)", () => {
    const GATE = read("../Sol/wingets/HomeEntrygate.tsx");
    const HOME = read("../Sol/home/home.tsx");
    const INTRO = read("../Sol/intro/intro.tsx");
    const ONBOARDING = read("../Sol/onboarding/onboarding.tsx");
    assert.match(GATE, /navigate\("\/intro"/, "an unseen intro navigates to the splash");
    assert.match(GATE, /navigate\("\/onboarding"/, "an unseen onboarding navigates to the walk");
    assert.match(HOME, /EntryGate/, "the home anchor consults the gate");
    assert.match(INTRO, /markOnboardingStage\("intro"\)/, "the intro marks introseen");
    assert.match(INTRO, /\/onboarding/, "the intro hands DIRECTLY to the walk");
    assert.match(ONBOARDING, /markOnboardingStage\("onboarding"\)/, "the onboarding marks onboardingseen");
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
    assert.match(STATE, /vault\.onboarding\.seen/, "the localStorage cache mirrors the db");
    assert.match(STATE, /\/api\/v1\/onboarding/, "the accessor rides the platform route");
  });

  it("keeps tabular numerals on the platform numbers", () => {
    assert.match(CSS, /font-variant-numeric:\s*tabular-nums/);
  });

  it("runs the family flow signature inside the mark strokes", () => {
    assert.match(MARK, /vtMarkFlow/, "the flow layer exists on the vault mark");
    assert.match(MARK, /vtm-flow/, "the flow gradient is declared");
    assert.match(MARK, /prefers-reduced-motion: reduce[\s\S]*\.vtMarkFlow \{ opacity: 0/, "the flow hard-stops on reduced motion");
  });

  it("links the family row from the one table (zero drift between rail and landing)", () => {
    assert.match(SHELL, /from "\.\.\/\.\.\/family\.ts"/, "the shell reads family.ts");
    const HOME = read("../Sol/home/home.tsx");
    assert.match(HOME, /familyrow/, "the landing footer reads the same table");
  });
});
