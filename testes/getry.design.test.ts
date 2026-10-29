// # design.test — the design contract of the getry surface (the reform wave),
// runnable with the vitest runner:
//   pnpm test
// The file reads the shipped sources (stylesheet, entry face, brand mark,
// theme anchor, page anchors, prisma schema, db layer) and pins the reform:
// the devthink foundation (mica #202020 over the 8-step ladder #242424→
// #494949, Inter Variable + Geist Mono, the 13px/450 body, the trylle shadow
// ladder), the windows hands (press .7 pins, dtPopIntro, the win11
// scrollbar), the two-accent contract (the getry violet identity beside the
// windows accent), the FAMILY STANDALONE LAW (the shell answers the direct
// url full-bleed, the window chrome lives only inside the os embed), the
// entry-flow law (intro → onboarding → the platform over the catalogued seen
// state) and the banned list (no pill, no all-properties transition, no
// scale(0) outside the pin law, no banned hue, no build ghost). The sources
// are read as text — no browser, no DOM.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const CSS = read("../getry/Sol/sol.css");
const ENTRY = read("../getry/index.html");
const MARK = read("../getry/Sol/widgets/ShellBrandmark.tsx");
const SHELL = read("../getry/Sol/shell/Shell.tsx");
const SOL = read("../getry/Sol/Sol.tsx");
const HOME = read("../getry/Sol/home/home.tsx");
const GATE = read("../getry/Sol/widgets/HomeEntrygate.tsx");
const INTRO = read("../getry/Sol/intro/intro.tsx");
const ONBOARDING = read("../getry/Sol/onboarding/onboarding.tsx");
const STATE = read("../getry/onboardingstate.ts");
const DB = read("../getry/db.ts");
const SCHEMA = read("../getry/schema.prisma");
const TOML = read("../getry/devthink.toml");
const FAVICON = read("../getry/favicon.svg");
const ICON = read("../getry/icon.svg");
const MANIFEST = read("../getry/manifest.webmanifest");

const BANNED = [/3b82f6/i, /2563eb/i, /f97316/i];

/** Strips comments so the guards read rules, not the doctrine prose. */
function rules(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** The stylesheet with the windows pin law lifted out (the one lawful scale(0)). */
function withoutPinLaw(source: string): string {
  return rules(source).replace(/@keyframes dtPopIntro \{(?:[^{}]|\{[^}]*\})*\}/g, "");
}

describe("design contract — the devthink foundation", () => {
  it("keeps the mica canvas and the surface ladder", () => {
    expect(CSS).toContain("--sol-canvas: var(--color-canvas)");
    expect(CSS).toContain("--color-canvas: #202020");
    expect(CSS).toContain("--sol-canvas-deep: var(--color-deep)");
    expect(CSS).toContain("--surface-1: var(--color-s0)");
    expect(CSS).toContain("--color-s0: #242424");
    expect(CSS).toContain("--surface-8: var(--color-s7)");
    expect(CSS).toContain("--color-s7: #494949");
    expect(CSS).toContain("--mica: #202020 radial-gradient(#1a1f35 25%, #202020 100%) no-repeat fixed");
  });

  it("keeps the trylle type stacks (Inter Variable · Geist Mono) and the 13px/450 body", () => {
    expect(CSS).toContain('"Inter Variable"');
    expect(CSS).toContain('"Geist Mono Variable"');
    expect(rules(CSS)).toContain("font-size: 13px");
    expect(rules(CSS)).toContain("font-weight: 450");
    expect(CSS).toContain("--sol-track-display: -0.02em");
    expect(CSS).toContain("--sol-track-label: 0.14em");
    expect(ENTRY).toMatch(/family=Inter/);
    expect(ENTRY).toMatch(/Geist\+Mono/);
  });

  it("keeps the devthink shadow ladder and the fluent window float", () => {
    expect(CSS).toContain("0 96px 96px -48px");
    expect(CSS).toContain("--shadow-window: 0 32px 64px rgb(0 0 0 / 24%), 0 0 8px rgb(0 0 0 / 20%)");
    expect(CSS).toContain("--ease-window: cubic-bezier(0.85, 0.14, 0.14, 0.85)");
    // the sol aliases ride the underlying motion tokens — both stay pinned
    expect(CSS).toContain("--sol-micro: var(--dur-1)");
    expect(CSS).toContain("--dur-1: 150ms");
    expect(CSS).toContain("--sol-ease-out: var(--ease-micro)");
    expect(CSS).toContain("--ease-micro: cubic-bezier(0.22, 1, 0.36, 1)");
  });

  it("keeps the trylle button tone stack (the real site recipe)", () => {
    expect(CSS).toContain("inset 0 1.2px 0 0 rgb(255 255 255 / 45%)");
    expect(CSS).toContain("inset 0 8px 14px -6px rgb(255 255 255 / 22%)");
  });

  it("keeps the two-accent contract (the getry violet identity beside the windows accent)", () => {
    expect(CSS).toContain("--violet-500: #8b5cf6");
    expect(CSS).toContain("--accent: var(--violet-500)");
    expect(CSS).toContain("--win-accent: var(--color-win)");
    expect(CSS).toContain("--color-win: #4cc2ff");
    expect(CSS).toContain("--focus: var(--color-win)");
    expect(MARK).toContain("#8b5cf6");
  });

  it("ships no banned hue in the stylesheet, the entry, the mark or the icons", () => {
    for (const source of [CSS, ENTRY, MARK, FAVICON, ICON, MANIFEST]) {
      for (const banned of BANNED) {
        expect(banned.test(source), `banned hue ${banned} found`).toBe(false);
      }
    }
    expect(CSS.includes("#60a5fa"), "the residual sky retired").toBe(false);
  });
});

describe("design contract — the windows hands", () => {
  it("pops the pins with the windows bounce (the one lawful scale(0))", () => {
    const pin = rules(CSS).match(/@keyframes dtPopIntro \{(?:[^{}]|\{[^}]*\})*\}/);
    expect(pin, "the dtPopIntro keyframe is missing").not.toBeNull();
    expect(pin?.[0]).toContain("scale(1.125)");
    expect(pin?.[0]).toContain("scale(0.725)");
    expect(/scale\(0\)/.test(withoutPinLaw(CSS)), "a scale(0) entry rides outside dtPopIntro").toBe(false);
  });

  it("presses the pins and the icon buttons at scale .7 on 100ms", () => {
    expect(rules(CSS)).toContain(".railnav__item:active { transform: scale(0.7); }");
    expect(rules(CSS)).toContain(".winapp__theme:active { transform: scale(0.7); }");
    expect(CSS).toContain("--dur-press: 100ms");
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
      /className="appframe"|winapp__title|winapp__cap|winapp__rz|winchip|setPointerCapture|data-inactive|RESIZE_EDGES/,
    );
    expect(CSS).toMatch(/\.shell--standalone \{[^}]*height: 100vh/);
  });

  it("rides the win11 scrollbar beside the standalone stage", () => {
    expect(CSS).toContain("*:hover::-webkit-scrollbar-thumb");
  });

  it("pins the footer to the window floor (the sticky-footer law)", () => {
    expect(CSS).toMatch(/\.winapp__stage > main\.shell \{[^}]*flex-direction: column/);
    expect(CSS).toMatch(/\.r3-quad \{[^}]*margin: auto/);
  });

  it("keeps tabular numerals on the platform numbers", () => {
    expect(CSS).toContain("font-variant-numeric: tabular-nums");
  });
});

describe("design contract — the banned list", () => {
  it("keeps the pill out of the stylesheet (no 999px, no stadium radius)", () => {
    expect(CSS.includes("999px"), "the pill radius is retired").toBe(false);
  });

  it("never ships an all-properties transition", () => {
    expect(/transition:\s*all/.test(rules(CSS)), "transition: all is a reprovação").toBe(false);
  });
});

describe("design contract — the guards", () => {
  it("carries the reduced-motion hard stop as the last word", () => {
    const blocks = CSS.match(/@media \(prefers-reduced-motion: reduce\)/g) ?? [];
    expect(blocks.length >= 1, "the universal hard stop is missing").toBe(true);
    expect(CSS).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s*\*,\s*\*::before,\s*\*::after \{[^}]*animation-duration: 0\.01ms !important/,
    );
    const lastBlock = CSS.lastIndexOf("@media");
    const hardStop = CSS.lastIndexOf("@media (prefers-reduced-motion: reduce)");
    expect(lastBlock, "a media block rides after the reduced-motion stop").toBe(hardStop);
  });

  it("mirrors the media kills into the in-session data-motion switch", () => {
    expect(CSS.includes('[data-motion="reduced"]'), "the settings switch has no stylesheet guards").toBe(true);
    expect(CSS).toMatch(
      /\[data-motion="reduced"\] \*,\s*\[data-motion="reduced"\] \*::before,\s*\[data-motion="reduced"\] \*::after \{[^}]*animation-duration: 0\.01ms !important/,
    );
  });

  it("carries the reduced-transparency floors", () => {
    const floors = CSS.match(/@media \(prefers-reduced-transparency: reduce\)/g) ?? [];
    expect(floors.length >= 1, "the transparency floors are missing").toBe(true);
    expect(CSS).toContain("backdrop-filter: none");
  });
});

describe("flow contract — intro → onboarding → the platform", () => {
  it("mounts every route of the application (entry flow before the fundamentals)", () => {
    expect(TOML).toMatch(/pages = \["home", "versions", "thinking", "sessions", "notfound"\]/);
    for (const route of ['"/intro"', '"/onboarding"', '"/versions"', '"/thinking"', '"/sessions"', '"/404"']) {
      expect(SOL.includes(`path=${route}`), `route ${route} must mount`).toBe(true);
    }
  });

  it("gates the home anchor on the seen state before anything shows", () => {
    /* the widget surface law: the dotted widget name is written exactly
    once (inside Sol/widgets/index.ts) and the page answers the surface
    import with its canonical alias — never the dotted path again */
    expect(HOME).toMatch(/import \{ HomeEntrygate as EntryGate \} from "\.\.\/widgets"/);
    expect(GATE).toContain('navigate("/intro", { replace: true })');
    expect(GATE).toContain('navigate("/onboarding", { replace: true })');
    expect(GATE).toContain("flowthrough");
  });

  it("hands the intro directly to the onboarding and marks it seen", () => {
    expect(INTRO).toMatch(/from "\.\.\/\.\.\/onboardingstate\.ts"/);
    expect(INTRO).toContain("markIntroSeen()");
    expect(INTRO).toContain('"/onboarding"');
    expect(INTRO).not.toContain("sessionStorage");
  });

  it("marks the onboarding seen on finish and skip alike", () => {
    expect(ONBOARDING).toContain("markOnboardingSeen()");
    expect(ONBOARDING).toContain('className="winonboard__skip"');
    expect(ONBOARDING).toContain('navigate("/")');
  });

  it("consults the platform database over https with the host law", () => {
    expect(STATE).toContain("VITE_ONBOARDING_URL");
    expect(STATE).toContain("hostallowed");
    expect(STATE).toContain("getry.onboarding.seen");
    expect(STATE).toContain("mergeStage");
  });
});

describe("db contract — the seen state catalogued", () => {
  it("declares the OnboardingState kind on the prisma schema", () => {
    expect(SCHEMA).toMatch(/model OnboardingState \{/);
    expect(SCHEMA).toMatch(/visitor\s+String\s+@unique/);
    expect(SCHEMA).toMatch(/introseen\s+Boolean\s+@default\(false\)/);
    expect(SCHEMA).toMatch(/onboardingseen\s+Boolean\s+@default\(false\)/);
  });

  it("mirrors the kind on the sqlite layer with prepared statements only", () => {
    expect(DB).toContain("CREATE TABLE IF NOT EXISTS onboarding_states");
    expect(DB).toContain("export async function getonboardingstate");
    expect(DB).toContain("export async function setonboardingstage");
    expect(DB).toContain("ON CONFLICT(visitor) DO UPDATE SET");
    expect(DB).toContain("DATABASE_URL");
    // never concatenated SQL: the upsert binds every value
    expect(DB).not.toMatch(/VALUES \(\$\{/);
  });

  it("keeps the session seeds and the https accessors of the static build", () => {
    expect(DB).toContain("export async function listkeys");
    expect(DB).toContain("export async function listmessages");
    expect(DB).toContain("KEYSEED");
  });
});

describe("entry contract — the source face", () => {
  it("keeps the entry on the source face (./App.tsx, canonical assets, no hashed ghosts)", () => {
    expect(ENTRY).toMatch(/script[^>]*\.\/App\.tsx/);
    expect(/-[0-9a-f]{8}\.(js|css)/.test(ENTRY), "no hashed bundle rides the entry").toBe(false);
    expect(ENTRY).toMatch(/href="\.\/favicon\.svg"/);
    expect(ENTRY).toMatch(/href="\.\/manifest\.webmanifest"/);
  });

  it("renders the family row on the landing footer through the familyurl contract", () => {
    expect(HOME).toMatch(/familyrow\(\)/);
    expect(HOME).toMatch(/familyurl\(member\.slug\)/);
  });
});
