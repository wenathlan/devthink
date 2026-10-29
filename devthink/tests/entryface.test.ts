/**
 * entryface.test.ts — the entry face finish of the campaign ledger row
 * nine: the good era curves and gradient with the current ruler, the
 * segmented agents/studios control, the mica sign-in ring and the intro →
 * explore → auth chain.
 *
 * this file pins the four layers of that law: the hero mode grammar of the
 * landing (the segmented control carries the agents and studios modes under
 * the statement — a switch never rides inside the headline again, the mode
 * words wear the ever gradient sweep, the gradient hairline rides under
 * the statement, and the verified reading "an os built for every ai and
 * your agents" stays the first paint), the css ladder of the good era
 * gradient (the §AB rules of sol.css ride the ever token family with zero
 * raw colors, the 44px touch floor, the focus ring, the press and the
 * reduced-transparency law), the mica sign-in ring of the auth face (the
 * hairline outline, the night bed, the fluent blur and the solid fallback),
 * and the entry chain wiring (the intro hands the web targets to the login
 * face while the explorer key of the corner dock and the footer row walk
 * the chain through the free exploration face, whose enter key opens the
 * login face and whose close returns to the intro). source pins ride the
 * same reading discipline the panelgate, appicons and navbarmodes
 * batteries carry: the faces only exist in the browser mount.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { saaschrome, saasfooter, saashero, saasrailstops } from "../saascontent.ts";

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

/** extracts the LAST rule body of a selector — the cascade winner when a
 * retune lands after an earlier pass (the §AB ever retune of the hero
 * shader answers over the earlier sweep of the same name) */
function lastrule(selector: string): string {
  const at = solcss.lastIndexOf(selector);
  expect(at, `the selector ${selector} lives in sol.css`).toBeGreaterThan(-1);
  const open = solcss.indexOf("{", at);
  const close = solcss.indexOf("}", open);
  return solcss.slice(open + 1, close);
}

/** extracts the reduced-transparency media block that carries a selector
 * (the file holds one law block per material family) */
function reducedtransparency(selector: string): string {
  let at = -1;
  for (;;) {
    at = solcss.indexOf("@media (prefers-reduced-transparency: reduce)", at + 1);
    expect(at, "the transparency law blocks exist").toBeGreaterThan(-1);
    const block = solcss.slice(at, at + 900);
    if (block.includes(selector)) return block;
  }
}

describe("the segmented agents studios control (the hero mode grammar)", () => {
  it("offers exactly the two modes with the segment labels and the statement words", () => {
    expect(saashero.modes).toHaveLength(2);
    expect(saashero.modes.map((row) => row.id)).toEqual(["agents", "studios"]);
    expect(saashero.modes.map((row) => row.label)).toEqual(["Agents", "Studios"]);
    expect(saashero.modes.map((row) => row.word)).toEqual(["and your agents", "and your studios"]);
  });

  it("keeps the verified reading — the first paint statement is an OS built for every AI and your agents", () => {
    expect(saashero.leada).toBe("An OS");
    expect(saashero.leadb).toBe("built for");
    expect(saashero.leadc).toBe("every AI");
    expect(saashero.modes[0].word).toBe("and your agents");
  });

  it("carries the group label of the control (the made for row)", () => {
    expect(saashero.modelabel).toBe("Made for");
  });

  it("renders the segmented control under the statement — the radiogroup with the radios, aria-checked and the data-attr state", () => {
    expect(sections).toContain('role="radiogroup" aria-label={saashero.modelabel}');
    expect(sections).toContain("role=");
    expect(sections).toContain("aria-checked={mode.id === row.id}");
    expect(sections).toContain('data-active={mode.id === row.id ? "true" : "false"}');
    expect(sections).toContain("onClick={() => setModeid(row.id)}");
    expect(sections).toContain('className="saas-hero-mode__seg"');
    expect(sections).toContain('className="saas-hero-mode__label"');
  });

  it("defaults to the agents mode and answers the fallback row honestly", () => {
    expect(sections).toContain('useState("agents")');
    expect(sections).toContain("saashero.modes.find((row) => row.id === modeid) ?? saashero.modes[0]");
  });

  it("a switch never rides inside the headline again — the h1 carries no button", () => {
    const open = sections.indexOf("<h1");
    const close = sections.indexOf("</h1>", open);
    expect(open).toBeGreaterThan(-1);
    const headline = sections.slice(open, close);
    expect(headline).not.toContain("<button");
    expect(headline).not.toContain("hero-inline-switch");
  });

  it("the mode words wear the ever gradient sweep inside the statement", () => {
    expect(sections).toContain('<span className="saas-hero-ever">{mode.word}</span>');
  });

  it("the gradient hairline rides under the statement", () => {
    expect(sections).toContain('<span className="saas-hero-rule mt-7" aria-hidden="true" />');
  });

  it("the dead switch vocabulary left the tree (the cascade law)", () => {
    for (const page of [sections, saas, rails, saascontent, solcss]) {
      expect(page).not.toContain("hero-inline-switch");
      expect(page).not.toContain("hero-switch-thumb");
      expect(page).not.toContain("togglelabel");
      expect(page).not.toContain("modeagents");
      expect(page).not.toContain("modestudios");
    }
  });
});

describe("the good era gradient with the current ruler (the css ladder)", () => {
  it("the ever sweep rides the token family with the clip fallback for the clip-less engines", () => {
    const sweep = rule(".saas-root .saas-hero-ever");
    expect(sweep).toContain("var(--color-ever-deep)");
    expect(sweep).toContain("var(--color-ever) 46%");
    expect(sweep).toContain("color-mix(in oklab, var(--color-ever) 45%, var(--color-ink))");
    expect(sweep).toContain("-webkit-background-clip: text");
    expect(sweep).toContain("-webkit-text-fill-color: transparent");
    expect(sweep).not.toMatch(/#[0-9a-f]{3,8}/i);
    expect(solcss).toContain("@supports not ((-webkit-background-clip: text) or (background-clip: text))");
  });

  it("the gradient hairline: the ever sweep with the single windows counterweight, fading to nothing at both ends", () => {
    const hairline = rule(".saas-root .saas-hero-rule");
    expect(hairline).toContain("width: min(440px, 70vw)");
    expect(hairline).toContain("color-mix(in oklab, var(--color-ever) 70%, transparent) 26%");
    expect(hairline).toContain("color-mix(in oklab, var(--color-ever-deep) 60%, transparent) 50%");
    expect(hairline).toContain("color-mix(in oklab, var(--color-win) 38%, transparent) 74%");
    expect(hairline).toContain("transparent 100%");
    expect(hairline).not.toMatch(/#[0-9a-f]{3,8}/i);
  });

  it("the hero shader field is the ever retune — the rose family carries the light with the blue counterweight (the cascade winner)", () => {
    const shader = lastrule(".saas-root .hero-gaussian-shader {");
    expect(shader).toContain("color-mix(in oklab, var(--color-win) 42%, transparent)");
    expect(shader).toContain("color-mix(in oklab, var(--color-ever) 34%, transparent)");
    expect(shader).toContain("color-mix(in oklab, var(--color-ever) 44%, transparent)");
    expect(shader).toContain("color-mix(in oklab, var(--color-ever-deep) 32%, transparent)");
    expect(shader).not.toMatch(/#[0-9a-f]{3,8}/i);
  });

  it("the segment grammar: the 44px touch floor, the acrylic track, the ever wash on the active segment", () => {
    const seg = rule(".saas-root .saas-hero-mode__seg");
    expect(seg).toContain("min-height: 44px");
    expect(seg).not.toMatch(/#[0-9a-f]{3,8}/i);
    const track = rule(".saas-root .saas-hero-mode__track");
    expect(track).toContain("-webkit-backdrop-filter: saturate(1.4) blur(14px)");
    expect(track).toContain("backdrop-filter: saturate(1.4) blur(14px)");
    const active = rule('.saas-root .saas-hero-mode__seg[data-active="true"]');
    expect(active).toContain("var(--color-ever)");
    expect(active).toContain("var(--color-ever-deep)");
    expect(active).toContain("var(--color-ever-ink)");
  });

  it("the segments answer the interaction law: the press, the focus ring, the micro timings", () => {
    const press = rule(".saas-root .saas-hero-mode__seg:active");
    expect(press).toContain("transform: scale(0.97)");
    const focus = rule(".saas-root .saas-hero-mode__seg:focus-visible");
    expect(focus).toContain("outline: 2px solid var(--color-focus)");
    const seg = rule(".saas-root .saas-hero-mode__seg");
    expect(seg).toContain("150ms var(--ease-micro)");
    expect(seg).toContain("transform 100ms var(--ease-micro)");
    expect(seg).not.toContain("transition: all");
  });

  it("the transparency law: the acrylic beds answer the solid state under reduced transparency", () => {
    const block = reducedtransparency(".saas-root .saas-hero-mode__track");
    expect(block).toContain(".saas-root .saas-hero-mode__track");
    expect(block).toContain("backdrop-filter: none");
    expect(block).toContain("background-image: none");
  });

  it("the mask ink resolves — the shadow ladder never composes off an unset token (a declaration that references an unset ink dies whole at computed-value time)", () => {
    const theme = solcss.slice(0, solcss.indexOf("}", solcss.indexOf("@theme")) + 1);
    expect(theme).toContain("--color-mask-ink: #000;");
    const uses = solcss.match(/var\(--color-mask-ink\)/g) ?? [];
    expect(uses.length).toBeGreaterThan(0);
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
    expect(saas).toContain("background: #DCE2EE");
    expect(saas).toContain("bg-[#F2F5FC]");
  });
});

describe("the mica sign-in ring (the auth face)", () => {
  it("the sign-in card is the mica ring — the hairline outline, the night bed, the fluent blur", () => {
    const card = rule(".dtw-login__card");
    expect(card).toContain("border: 1px solid color-mix(in oklab, var(--color-veil) 16%, transparent)");
    expect(card).toContain("border-radius: var(--radius-2xl)");
    expect(card).toContain("color-mix(in oklab, var(--color-night) 52%, transparent)");
    expect(card).toContain("-webkit-backdrop-filter: blur(30px) saturate(1.35)");
    expect(card).toContain("backdrop-filter: blur(30px) saturate(1.35)");
  });

  it("the card floats as layered material — the light-catching top inset and the three-step elevation", () => {
    const card = rule(".dtw-login__card");
    expect(card).toContain("inset 0 1px 0 color-mix(in oklab, var(--color-veil) 24%, transparent)");
    expect(card).toContain("0 1px 2px color-mix(in oklab, var(--color-mask-ink) 32%, transparent)");
    expect(card).toContain("0 12px 32px color-mix(in oklab, var(--color-mask-ink) 34%, transparent)");
    expect(card).toContain("0 32px 80px color-mix(in oklab, var(--color-mask-ink) 40%, transparent)");
  });

  it("the mica yields to the solid night under reduced transparency", () => {
    const block = reducedtransparency(".dtw-login__card");
    expect(block).toContain("color-mix(in oklab, var(--color-night) 92%, transparent)");
    expect(block).toContain("-webkit-backdrop-filter: none");
  });

  it("the visual panel wears the ever gradient bed (the good era identity on the auth face)", () => {
    const visual = rule(".dtw-login__visual");
    expect(visual).toContain("var(--color-ever) 40%");
    expect(visual).toContain("var(--color-ever-deep) 34%");
    expect(visual).not.toMatch(/#[0-9a-f]{3,8}/i);
  });

  it("the auth face mounts the split card over the lock sequence (the source wiring)", () => {
    expect(auth).toContain("className={`dtw-login");
    expect(auth).toContain('" dtw-login--signin"');
    expect(auth).toContain("<LockFace onUnlock={unlock} />");
    expect(auth).toContain("<SignInForm");
  });
});

describe("the intro to explore to auth chain", () => {
  it("the intro hands the web targets to the login face, the owned ones straight to the desktop", () => {
    expect(intro).toContain('return target === "desktop" || target === "installer" ? "/panel" : "/auth";');
    expect(saas).toContain('navigate("/auth");');
  });

  it("the corner dock explorer key walks the chain to the free exploration face", () => {
    expect(saas).toContain('navigate("/explore");');
    expect(saas).toContain("onClick={explore}");
    expect(saas).toContain("aria-label={saaschrome.dockexplore}");
  });

  it("the footer Platform column carries the Explorer row on the route", () => {
    const platform = saasfooter.columns.find((column) => column.title === "Platform");
    expect(platform).toBeDefined();
    const explorer = platform?.links.find((link) => link.label === "Explorer");
    expect(explorer?.route).toBe("/explore");
    expect(rails).toContain("if (link.route)");
    expect(rails).toContain("onClick={onexplore}");
    expect(saas).toContain(
      "<SaasFooter onenter={enter} onexplore={explore} scrollto={scrollto} showtoast={showtoast} />",
    );
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
    expect(saaschrome.dockexplore).toBe("Explorer");
    const dock = saas.slice(saas.indexOf("the corner dock"), saas.indexOf("</div>", saas.indexOf("dockexplore")));
    expect(dock).toContain("aria-label={saaschrome.dockexplore}");
    expect(dock).not.toMatch(/aria-label="(Save|Explorer|Top)"/);
  });

  it("the pruned dock carries only the explorer key — the save and top keys left the data layer", () => {
    expect(Object.keys(saaschrome)).toEqual(["title", "launch", "dockexplore"]);
    expect(saascontent).not.toContain("docksave");
    expect(saascontent).not.toContain("docktop");
  });

  it("the left rail carries exactly the six stops — the saddle tile under them is gone", () => {
    expect(saasrailstops).toHaveLength(6);
    expect(saasrailstops.map((row) => row.id)).toEqual([
      "hero-os",
      "creators-doo",
      "workspace-subapps",
      "spatial-bento",
      "sonic-deck",
      "advisor-dark",
    ]);
    const rail = saas.slice(saas.indexOf("the left rail"), saas.indexOf("</aside>"));
    expect(rail).toContain("saasrailstops.map");
    // only the mapped stop buttons ride the rail — an extra tile under the
    // stops would add a second button template to the slice
    expect(rail.match(/<button/g)?.length ?? 0).toBe(1);
  });
});
