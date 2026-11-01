/**
 * entryface.test.ts — the entry face of the original reference law (the
 * restored original): the inline hero switch rides inside the headline
 * again, the corner dock answers its three keys, the saddle cloud tile
 * returns under the rail stops, the sign-in card keeps its contained
 * shadows, and the intro → explore → auth chain walks unchanged. The
 * segmented-control drift (the made-for row, the ever hairline, the
 * one-key dock, the missing saddle tile, the leaking login shadows) died
 * by the owner order — this battery pins the restored face.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { saaschrome, saasfooter, saasrailstops } from "../saascontent.ts";
import { uistoreseedrows } from "../uistore.ts";

const sections = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "IntroSaassections.tsx"), "utf8");
const saas = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "IntroSaas.tsx"), "utf8");
const rails = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "IntroSaasrails.tsx"), "utf8");
const intro = readFileSync(join(import.meta.dirname, "..", "Sol", "intro", "intro.tsx"), "utf8");
const explore = readFileSync(join(import.meta.dirname, "..", "Sol", "explore", "explore.tsx"), "utf8");
const auth = readFileSync(join(import.meta.dirname, "..", "Sol", "auth", "auth.tsx"), "utf8");
const routes = readFileSync(join(import.meta.dirname, "..", "Sol", "Sol.tsx"), "utf8");
const solcss = readFileSync(join(import.meta.dirname, "..", "Sol", "sol.css"), "utf8");
const saascontent = readFileSync(join(import.meta.dirname, "..", "saascontent.ts"), "utf8");

/** extracts one css rule body by its selector (the ladder pins read the
 * exact declarations, not the comments around them) */
function rule(selector: string): string {
  const at = solcss.indexOf(selector);
  expect(at, `the selector ${selector} lives in sol.css`).toBeGreaterThan(-1);
  const open = solcss.indexOf("{", at);
  const close = solcss.indexOf("}", open);
  return solcss.slice(open + 1, close);
}

describe("the inline hero switch (the original headline law)", () => {
  it("the h1 carries the mode switch inside the headline — the original grammar returns", () => {
    const open = sections.indexOf("<h1");
    const close = sections.indexOf("</h1>", open);
    expect(open).toBeGreaterThan(-1);
    const headline = sections.slice(open, close);
    expect(headline).toContain("hero-inline-switch");
    expect(headline).toContain("hero-switch-thumb");
    expect(headline).toContain('aria-label={saashero.modetoggle}');
    expect(headline).toContain("{mode.word}");
  });

  it("the verified reading stays — an OS built for every AI and your agents (the ui store rows)", () => {
    const seed = uistoreseedrows();
    expect(seed["intro.hero.leada"]).toBe("An OS");
    expect(seed["intro.hero.leadb"]).toBe("built for");
    expect(seed["intro.hero.leadc"]).toBe("every AI");
    expect(seed["intro.hero.mode.agents"]).toBe("and your agents");
    expect(seed["intro.hero.mode.studios"]).toBe("and your studios");
    expect(seed["intro.hero.modetoggle"]).toBe("Toggle OS Mode");
  });

  it("the drift vocabulary died — the segmented control never answers the face", () => {
    for (const page of [sections, saas, saascontent]) {
      expect(page).not.toContain("saas-hero-mode");
      expect(page).not.toContain("modelabel");
      expect(page).not.toContain("Made for");
      expect(page).not.toContain("saas-hero-ever");
      expect(page).not.toContain("saas-hero-rule");
    }
  });

  it("the primary CTA rides the tactile key — no blue button, no blue glow on the statement", () => {
    expect(sections).toContain('className="btn-tactile-3d flex items-center gap-2.5 rounded-full');
    const seed = uistoreseedrows();
    expect(seed["intro.hero.keyprimary"]).toBe("Get Started");
    expect(seed["intro.hero.keysecondary"]).toBe("Why DevThink?");
    expect(saas).toContain(".btn-tactile-3d");
  });
});

describe("the chrome keys (the original header, dock and rail)", () => {
  it("the header answers the alerts and sign-in keys again", () => {
    expect(saaschrome.alerts).toBe("Alerts");
    expect(saaschrome.signin).toBe("Sign In");
    expect(saas).toContain("aria-label={saaschrome.alerts}");
    expect(saas).toContain("aria-label={saaschrome.signin}");
  });

  it("the corner dock carries the three keys — star, explorer and top", () => {
    expect(saaschrome.dockstar).toBe("Save to Favorites");
    expect(saaschrome.dockexplore).toBe("Explorer");
    expect(saaschrome.docktop).toBe("Top");
    expect(saas).toContain("aria-label={saaschrome.dockstar}");
    expect(saas).toContain("aria-label={saaschrome.dockexplore}");
    expect(saas).toContain("aria-label={saaschrome.docktop}");
  });

  it("the left rail carries the saddle cloud tile under the six stops", () => {
    expect(saaschrome.railcloud).toBe("Saddle Cloud");
    expect(saas).toContain("aria-label={saaschrome.railcloud}");
    expect(saasrailstops).toHaveLength(6);
    expect(saasrailstops.map((row) => row.id)).toEqual([
      "hero-os",
      "creators-doo",
      "workspace-subapps",
      "spatial-bento",
      "sonic-deck",
      "advisor-dark",
    ]);
  });
});

describe("the login face (the contained shadow law)", () => {
  it("the sign-in card keeps the hairline outline, the mica blur and the house token elevation", () => {
    const card = rule(".dtw-login__card");
    expect(card).toContain("border: 1px solid color-mix(in oklab, var(--color-veil) 16%, transparent)");
    expect(card).toContain("-webkit-backdrop-filter: blur(30px) saturate(1.35)");
    expect(card).toContain("backdrop-filter: blur(30px) saturate(1.35)");
    // the drop rides the house token (--win-shad-window) — the hand-built
    // drop that could leak past the face retired with the token law
    expect(card).toContain("var(--win-shad-window)");
    expect(card).not.toContain("0 12px 32px");
    expect(card).not.toContain("0 32px 80px");
  });

  it("the auth face mounts the split card over the lock sequence (the source wiring)", () => {
    expect(auth).toContain("className={`dtw-login");
    expect(auth).toContain("<LockFace onUnlock={unlock} />");
    expect(auth).toContain("<SignInForm");
  });
});

describe("the good era curves (the saddle grammar of the landing)", () => {
  it("the three bridges live on the face — the header tab bridge, the vertical rail bridge, the up bridge", () => {
    expect(saas).toContain('SaddleTabBridge fillColor="#FFFFFF"');
    expect(saas).toContain("VerticalSaddleBridge");
    expect(sections).toContain("SaddleTabBridgeUp");
    expect(sections).toContain("ScoopedCard");
  });

  it("the palco keeps the era radius over the pale canvas", () => {
    expect(saas).toContain("rounded-[30px]");
    expect(saas).toContain("sm:rounded-[34px]");
  });
});

describe("the intro to explore to auth chain", () => {
  it("the intro hands the web targets to the login face, the owned ones straight to the desktop", () => {
    expect(intro).toContain('return target === "desktop" || target === "installer" ? "/panel" : "/auth";');
    expect(saas).toContain('navigate("/auth");');
  });

  it("the corner dock explorer key walks the chain to the free exploration face", () => {
    expect(saas).toContain('navigate("/explore");');
    expect(saas).toContain("aria-label={saaschrome.dockexplore}");
  });

  it("the footer Platform column carries the Explorer row on the route", () => {
    const platform = saasfooter.columns.find((column) => column.title === "Platform");
    expect(platform).toBeDefined();
    const explorer = platform?.links.find((link) => link.label === "Explorer");
    expect(explorer?.route).toBe("/explore");
  });

  it("the explore face answers the chain both ways — the enter key opens the login face, the close returns to the intro", () => {
    expect(explore).toContain('navigate("/auth");');
    expect(explore).toContain('if (!peekonboardingstate().onboardingseen) navigate("/");');
  });

  it("the auth face continues to the panel — the last page of the chain", () => {
    expect(auth).toContain("navigate(afterAuthTarget(window.location.search));");
  });

  it("the route tree carries the explore face", () => {
    expect(routes).toContain('<Route path="/explore" component={ExploreAnchor} />');
  });

  it("the dock keys speak through the landing data layer (no hardcoded labels)", () => {
    const dock = saas.slice(saas.indexOf("the corner dock"), saas.indexOf("</div>", saas.indexOf("dockexplore")));
    expect(dock).toContain("aria-label={saaschrome.dockexplore}");
    expect(dock).not.toMatch(/aria-label="(Save|Explorer|Top)"/);
  });
});
