// # fluenticons.test — the fluentface battery (the owner's first-paragraph
// laws, pinned): the design must ride FLUENT ICONS (the Microsoft system
// family the Win11 law pins — the lucide set the first landing cut wore is
// purged from the whole shell, every fluent glyph aliasing the seat it took
// so the jsx grammar never moves), the homepage font must answer the
// codified type voice — Inter + Geist, NOT Segoe (the --font-body /
// --font-display tokens the whole shell inherits; the Urbanist landing
// voice of the first cut is retired with its @font-face and its woff2), and
// the cut after debonair must stay aligned (the opaque symmetric sawtooth
// coordinates — every layer phased at 50% so the saw mirrors about the
// viewport center like the web example, the base that crops flush into the
// section below through the --ribbon-base variable, and the -mt-[1px] seam
// law every section-head cut shares). the zoomlock battery rides
// zoomlock.test; the restored face values ride entryface.test; this
// battery pins the three laws that face carries so a future pass can never
// quietly retire one.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const approot = join(import.meta.dirname, "..");
const solcss = readFileSync(join(approot, "sol", "sol.css"), "utf8");
const saas = readFileSync(join(approot, "sol", "wingets", "IntroSaas.tsx"), "utf8");
const sections = readFileSync(join(approot, "sol", "wingets", "IntroSaassections.tsx"), "utf8");
const rails = readFileSync(join(approot, "sol", "wingets", "IntroSaasrails.tsx"), "utf8");
const kit = readFileSync(join(approot, "sol", "wingets", "IntroSaaskit.tsx"), "utf8");
const pkg = readFileSync(join(approot, "package.json"), "utf8");

/** every tsx source under sol/ — the shell the icon law governs (the walk
 * skips nothing: any file that imports a glyph answers here) */
function walktsx(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walktsx(full));
    else if (name.endsWith(".tsx")) out.push(full);
  }
  return out;
}
const shellsources = walktsx(join(approot, "sol")).map((path) => readFileSync(path, "utf8"));

/** extracts one css rule body by its selector (reading past the landing
 * marker so the older blocks never shadow the definition) */
function landingrule(selector: string): string {
  const landingAt = solcss.indexOf("THE LANDING MATERIALS");
  expect(landingAt, "the landing materials block lives in sol.css").toBeGreaterThan(-1);
  const at = solcss.indexOf(selector, landingAt);
  expect(at, `the selector ${selector} lives in the landing block of sol.css`).toBeGreaterThan(-1);
  const open = solcss.indexOf("{", at);
  const close = solcss.indexOf("}", open);
  return solcss.slice(open + 1, close);
}

describe("the fluent icon law (the glyphs the Win11 design answers with)", () => {
  it("the shell imports the Fluent UI System Icons sheet — the seat the app already carries", () => {
    // the dependency the whole shell already rides (the same sheet
    // settings, chat, explore and the panel draw from)
    expect(pkg).toContain('"@fluentui/react-icons"');
    for (const page of [saas, sections, rails]) {
      expect(page, "the landing wingets import the fluent sheet").toContain('from "@fluentui/react-icons"');
    }
  });

  it("no lucide import ever answers the shell — the retired set stays purged", () => {
    for (const [index, source] of shellsources.entries()) {
      expect(source.match(/from ["']lucide-react["']/), `sol tsx source #${index} carries no lucide import`).toBeNull();
    }
  });

  it("the reference glyph meanings survive the swap — the fluent names alias the seats they took", () => {
    // the alias pattern keeps every jsx seat untouched: the fluent glyph
    // answers under the name the reference seat wore
    for (const alias of [
      "AlertRegular as Bell",
      "ArrowEnterRegular as LogIn",
      "SparkleRegular as Sparkles",
      "PeopleRegular as Users",
      "NavigationRegular as Compass",
      "MoviesAndTvRegular as Film",
    ]) {
      expect(saas, `the header/rail glyphs alias ${alias}`).toContain(alias);
    }
    for (const alias of [
      "PulseRegular as Activity",
      "MentionRegular as AtSign",
      "HeadphonesSoundWaveRegular as Waves",
      "PlayFilled as Play",
      "StarFilled as Star",
      "ShareRegular as Share2",
    ]) {
      expect(sections, `the section glyphs alias ${alias}`).toContain(alias);
    }
    for (const alias of [
      "HeartFilled",
      "HeartRegular as Heart",
      "ChatRegular as MessageSquare",
      "FullScreenMaximizeRegular as Maximize2",
    ]) {
      expect(rails, `the rail glyphs alias ${alias}`).toContain(alias);
    }
    // the heart keeps its two honest faces: the filled green like, the
    // quiet outline beside it
    expect(rails).toContain('<HeartFilled className="h-4 w-4 fill-[#1DB954] text-[#1DB954]"');
    expect(rails).toContain('<Heart className="h-4 w-4 text-slate-500"');
  });

  it("the fluent glyphs carry no stroke-width crutch — the lucide prop died with the set", () => {
    for (const page of [saas, sections, rails]) {
      expect(page.match(/strokeWidth=\{/)).toBeNull();
    }
  });
});

describe("the modern font law (the codified Inter + Geist voice the homepage speaks with)", () => {
  it("the display and body tokens ride the Inter + Geist stack with the system ladder behind", () => {
    const themeblock = solcss.slice(solcss.indexOf("@theme {"), solcss.indexOf("--color-canvas"));
    expect(themeblock).toContain("--font-display:");
    expect(themeblock).toContain("--font-body:");
    // the codified voice names both faces, Inter leading (the self-hosted
    // variable face always answers), Geist riding behind it
    for (const token of ["--font-display", "--font-body"]) {
      const stack = themeblock.slice(themeblock.indexOf(token));
      expect(stack.indexOf('"Inter Variable"')).toBeGreaterThan(-1);
      expect(stack.indexOf('"Geist"')).toBeGreaterThan(stack.indexOf('"Inter Variable"'));
      expect(stack.indexOf("system-ui")).toBeGreaterThan(stack.indexOf('"Geist"'));
    }
    // the whole shell inherits the body token — font-sans is the token alias
    expect(themeblock).toContain("--font-sans: var(--font-body);");
  });

  it("the NOT Segoe law holds — no Segoe seat ever leads the codified voice", () => {
    const themeblock = solcss.slice(solcss.indexOf("@theme {"), solcss.indexOf("--color-canvas"));
    expect(themeblock).not.toContain("Segoe");
    // the landing root and tiers ride the tokens — never a private stack
    expect(landingrule(".saas-root")).toContain("font-family: var(--font-body);");
    expect(landingrule(".font-thin-tier")).toContain("font-family: var(--font-body);");
    expect(landingrule(".font-medium-tier")).toContain("font-family: var(--font-body);");
    expect(landingrule(".font-bold-tier")).toContain("font-family: var(--font-display);");
  });

  it("the retired Urbanist seat stays gone — no @font-face serves it and no woff2 ships it", () => {
    expect(solcss).not.toContain('font-family: "Urbanist";');
    for (const page of [saas, sections, rails]) {
      expect(page).not.toContain('"Urbanist"');
    }
    // the fonts folder ships the codified pair only: the Inter Variable
    // face and the Geist Mono Variable detail
    const shipped = readdirSync(join(approot, "sol", "fonts"));
    expect(shipped).toContain("inter-latin-wght-normal.woff2");
    expect(shipped).toContain("geist-mono-latin-wght-normal.woff2");
    expect(shipped).not.toContain("urbanist-latin-wght-normal.woff2");
  });
});

describe("the debonair cut law (the aligned crop after the sonic deck)", () => {
  it("the sawtooth coordinates are pinned — one consistent 30px tooth per opaque wash", () => {
    const ribbon = landingrule(".ribbon-sawtooth-divider");
    // the four washes: the exact opaque pixels the old alpha washes
    // composited over the cream base, frozen solid
    expect(ribbon).toContain("linear-gradient(135deg, #22293a 25%, transparent 25%)");
    expect(ribbon).toContain("linear-gradient(225deg, #898af1 25%, transparent 25%)");
    expect(ribbon).toContain("linear-gradient(45deg, #a2dcf4 25%, transparent 25%)");
    expect(ribbon).toContain("linear-gradient(315deg, #d47649 25%, var(--ribbon-base) 25%)");
    expect(ribbon).toContain("background-size: 30px 30px;");
    expect(ribbon).toContain("height: 30px;");
  });

  it("the saw mirrors symmetrically about the viewport center — the 50% phase on every layer", () => {
    const ribbon = landingrule(".ribbon-sawtooth-divider");
    expect(ribbon).toContain("background-position:\n    50% 0,\n    50% 0,\n    50% 0,\n    50% 0;");
    expect(ribbon.match(/background-position:[^;]*;/)?.[0]?.split("50% 0").length).toBe(5);
  });

  it("the cut is opaque — the transparency effect stays only on the native studio banner", () => {
    const ribbon = landingrule(".ribbon-sawtooth-divider");
    expect(ribbon).not.toContain("rgba(");
    expect(ribbon).not.toContain("backdrop-filter");
    // the one sanctioned transparency of the landing: the frosted wash of
    // the workspace fan deck (the native studio banner), nowhere else
    expect(sections).toContain("urbanist-frosted-blur");
    expect(saas.match(/urbanist-frosted-blur/g)).toBeNull();
    expect(rails.match(/urbanist-frosted-blur/g)).toBeNull();
  });

  it("the base crops flush into the section below — the footer cut answers the footer surface", () => {
    expect(landingrule(".ribbon-sawtooth-divider")).toContain("--ribbon-base: #f9f6f0;");
    expect(landingrule(".ribbon-sawtooth-into-footer")).toContain("--ribbon-base: #f2f5fc;");
    expect(rails).toContain('className="ribbon-sawtooth-divider ribbon-sawtooth-into-footer"');
    expect(rails).toContain("bg-[#F2F5FC]");
    // the studio-flow instance keeps the cream of its own bed
    expect(sections).toContain('className="w-full bg-[#F9F6F0] px-6 py-14');
    expect(sections).toContain('className="ribbon-sawtooth-divider"');
  });

  it("the whitewash center fades symmetrically — the same inset on both ends at every tier", () => {
    const wash = landingrule(".ribbon-whitewash-center");
    expect(wash).toContain(
      "linear-gradient(to right, transparent 0, #000 28px, #000 calc(100% - 28px), transparent 100%)",
    );
    const wide = solcss.slice(solcss.indexOf("@media (min-width: 640px)"));
    expect(wide).toContain(
      "linear-gradient(to right, transparent 0, #000 42px, #000 calc(100% - 42px), transparent 100%)",
    );
  });

  it("every section-head cut closes its seam — the -mt-[1px] overlap law the debonair and advisor rows answer", () => {
    // the cut sequence around debonair: the explorer cream cutting into
    // the sonic deck, the deck dark cutting into the advisor — both now
    // overlap their bar by the same pixel the workspace cut does
    expect(rails.match(/-mt-\[1px\] flex w-full justify-center/g)?.length).toBe(2);
    expect(sections).toContain('"-mt-[1px] flex w-full justify-center"');
    expect(rails).toContain('<div className="h-2 w-full bg-[#FAF6F0]" aria-hidden="true" />');
    expect(rails).toContain('<div className="h-2 w-full bg-[#0A0B0E]" aria-hidden="true" />');
  });

  it("the cut family carries its true clip-path — the scooped polygon the section cuts compose with", () => {
    expect(kit).toContain("clipPath");
    expect(kit).toContain("buildscoopedclip");
    expect(sections).toContain("<ScoopedCard");
  });
});
