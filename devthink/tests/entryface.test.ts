/**
 * entryface.test.ts — the entry face of the redesign order (the ever rose
 * landing): the inline hero switch rides inside the headline on the ever
 * gradient, the six rail stops are the only keys of the landing body (the
 * saddle cloud tile, the corner dock, the follow rows and the decorative
 * toasts died), the mock decks are gone (no film rail, no track rail, no
 * reels, no demo chat, no invented social proof) and the real studios of
 * the monorepo answer in minimal sections over the ui store rows. The
 * intro → explore → auth chain walks unchanged. This battery pins the
 * redesigned face.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { saaschrome, saasfooter, saasrailstops, saasstudiofamily } from "../saascontent.ts";
import { uistoreseedrows } from "../uistore.ts";

const sections = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "IntroSaassections.tsx"), "utf8");
const shaderhero = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "IntroShaderhero.tsx"), "utf8");
const barrel = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "index.ts"), "utf8");
const saas = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "IntroSaas.tsx"), "utf8");
const rails = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "IntroSaasrails.tsx"), "utf8");
const kit = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "IntroSaaskit.tsx"), "utf8");
const intro = readFileSync(join(import.meta.dirname, "..", "Sol", "intro", "intro.tsx"), "utf8");
const explore = readFileSync(join(import.meta.dirname, "..", "Sol", "explore", "explore.tsx"), "utf8");
const auth = readFileSync(join(import.meta.dirname, "..", "Sol", "auth", "auth.tsx"), "utf8");
const routes = readFileSync(join(import.meta.dirname, "..", "Sol", "Sol.tsx"), "utf8");
const solcss = readFileSync(join(import.meta.dirname, "..", "Sol", "sol.css"), "utf8");
const saascontent = readFileSync(join(import.meta.dirname, "..", "saascontent.ts"), "utf8");
const indexhtml = readFileSync(join(import.meta.dirname, "..", "index.html"), "utf8");

/** extracts one css rule body by its selector (the ladder pins read the
 * exact declarations, not the comments around them) */
function rule(selector: string): string {
  const at = solcss.indexOf(selector);
  expect(at, `the selector ${selector} lives in sol.css`).toBeGreaterThan(-1);
  const open = solcss.indexOf("{", at);
  const close = solcss.indexOf("}", open);
  return solcss.slice(open + 1, close);
}

/** extracts one rule body out of the injected saas sheet (the materials
 * live in the saas.tsx constant, not in sol.css) */
function saasrule(selector: string): string {
  const at = saas.indexOf(selector);
  expect(at, `the selector ${selector} lives in the saas sheet`).toBeGreaterThan(-1);
  const open = saas.indexOf("{", at);
  const close = saas.indexOf("}", open);
  return saas.slice(open + 1, close);
}

describe("the inline hero switch (the ever headline law)", () => {
  it("the h1 carries the mode switch inside the headline — the original grammar returns", () => {
    const open = sections.indexOf("<h1");
    const close = sections.indexOf("</h1>", open);
    expect(open).toBeGreaterThan(-1);
    const headline = sections.slice(open, close);
    expect(headline).toContain("hero-inline-switch");
    expect(headline).toContain("hero-switch-thumb");
    expect(headline).toContain("aria-label={saashero.modetoggle}");
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

  it("the switch track rides the ever gradient — the multicolor drift died", () => {
    const track = saasrule(".hero-inline-switch");
    expect(track).toContain("var(--color-ever");
    expect(track).toContain("var(--color-ever-deep");
    for (const hex of ["#60A5FA", "#A855F7", "#EC4899", "#F97316"]) {
      expect(saas).not.toContain(hex);
    }
  });

  it("the primary CTA rides the tactile key — the one launch key of the body", () => {
    expect(sections).toContain("btn-tactile-3d");
    const seed = uistoreseedrows();
    expect(seed["intro.hero.keyprimary"]).toBe("Get Started");
    expect(seed["intro.hero.keysecondary"]).toBe("Why DevThink?");
    expect(saas).toContain(".btn-tactile-3d");
  });

  it("the hero carries exactly two keys — the switch of the headline and the launch key", () => {
    expect([...sections.matchAll(/<button/g)]).toHaveLength(2);
  });
});

describe("the chrome keys (the six key law)", () => {
  it("the header answers the sign-in and launch keys — the alerts pill died with the toasts", () => {
    expect(saaschrome.signin).toBe("Sign In");
    expect(saaschrome.launch).toBe("Launch");
    expect(saas).toContain("aria-label={saaschrome.signin}");
    expect(saas).toContain("aria-label={saaschrome.launch}");
    expect(saas).not.toContain("saaschrome.alerts");
  });

  it("the six stops are the only keys of the landing body — no dock, no cloud tile, no toast channel", () => {
    expect(saasrailstops).toHaveLength(6);
    expect(saasrailstops.map((row) => row.id)).toEqual([
      "hero-os",
      "workspace-subapps",
      "creators-doo",
      "spatial-bento",
      "sonic-deck",
      "advisor-dark",
    ]);
    for (const dead of ["railcloud", "dockstar", "dockexplore", "docktop", "showtoast", "notificationssynced"]) {
      expect(saas).not.toContain(dead);
    }
    // the spotlights carry no keys of their own — the rail walks the landing
    const spotlight = rails.slice(rails.indexOf("SaasStudioSpotlight"), rails.indexOf("SaasFooter"));
    expect(spotlight).not.toContain("<button");
  });

  it("the rail active pill rides the ever family — the indigo pill died", () => {
    expect(saas).toContain("from-ever to-ever-deep");
    expect(saas).not.toContain("from-indigo-600");
  });
});

describe("the mock decks died (the real studios law)", () => {
  it("the invented catalogs, the licensed tracks and the social proof never answer the face", () => {
    for (const page of [sections, saas, rails, saascontent]) {
      expect(page).not.toContain("99% Match");
      expect(page).not.toContain("images.unsplash.com");
      expect(page).not.toContain("100,000");
      expect(page).not.toContain("Daft Punk");
      expect(page).not.toContain("Arctic Monkeys");
      expect(page).not.toContain("Sade");
    }
  });

  it("the deck exports died with the decks — the data layer carries structure only", () => {
    for (const dead of [
      "saasfilms",
      "saasreels",
      "saastracks",
      "saascreators",
      "saastoasts",
      "saascadria",
      "saasdebonair",
      "saasdoo",
      "saasexplorer",
      "saasflow",
      "saasstudiosintro",
      "saasherodata",
    ]) {
      expect(saascontent).not.toContain(dead);
    }
  });

  it("the real studios answer over the ui store rows — one name and one line each", () => {
    expect(saasstudiofamily).toEqual(["cadria", "debonair", "getry", "saddle", "vault", "doo"]);
    const seed = uistoreseedrows();
    for (const studio of saasstudiofamily) {
      expect(seed[`intro.studios.${studio}.name`], `the studio ${studio} has a name row`).toBeTruthy();
      expect(seed[`intro.studios.${studio}.copy`], `the studio ${studio} has a copy row`).toBeTruthy();
    }
    expect(seed["intro.os.bridge"]).toBe("Native Studios");
    expect(seed["intro.os.titlea"]).toBe("Six real studios,");
    expect(seed["intro.os.titleb"]).toBe("one OS");
    expect(seed["intro.os.copy"]).toBeTruthy();
    expect(seed["intro.studios.bridge"]).toBe("Native Studio");
  });

  it("the sections present the studios with fluent glyphs — no stock imagery, no card decks", () => {
    expect(sections).toContain("CubeRegular");
    expect(sections).toContain("MusicNote2Regular");
    expect(sections).toContain("BotRegular");
    expect(sections).toContain("PeopleTeamRegular");
    expect(sections).toContain("CloudRegular");
    expect(sections).toContain("CloudArchiveRegular");
    expect(sections).not.toContain("<img");
    expect(rails).not.toContain("<img");
  });
});

describe("the ever law (no blue glows)", () => {
  it("the tactile hovers ride the neutral ink ladder — the indigo and sky glows died", () => {
    for (const blue of ["rgba(79,70,229", "rgba(56,189,248", "rgba(99,102,241", "#4F46E5", "#6366F1", "#38BDF8"]) {
      expect(saas).not.toContain(blue);
    }
    expect(saas).not.toContain("indigo-tactile-surface");
    expect(saas).not.toContain("text-indigo-600");
    expect(saas).not.toContain("text-sky-400");
    expect(saas).not.toContain("text-sky-600");
  });

  it("the gradient word and the selection ride the ever family", () => {
    const gradient = saasrule(".text-gradient-brand");
    expect(gradient).toContain("var(--color-ever");
    const selection = saasrule(".saas-root ::selection");
    expect(selection).toContain("var(--color-ever-deep");
  });

  it("the focus ring answers the neutral ink — never the accent, never blue", () => {
    const focus = saasrule(".saas-root button:focus-visible");
    expect(focus).toContain("rgba(15,23,42,0.55)");
  });
});

describe("the typography law", () => {
  it("the face rides the Inter Variable voice — the Urbanist override died everywhere", () => {
    expect(saas).toContain("font-family: var(--font-display");
    for (const page of [saas, sections, rails, kit, indexhtml]) {
      expect(page).not.toContain("Urbanist");
    }
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
  it("the bridges live on the face — the header tab bridge, the vertical rail bridge, the section bridges", () => {
    expect(saas).toContain('SaddleTabBridge fillColor="#FFFFFF"');
    expect(saas).toContain("VerticalSaddleBridge");
    expect(sections).toContain("SaddleTabBridge");
    expect(rails).toContain("SaddleTabBridge");
    expect(kit).toContain("SaddleTabBridge");
    expect(kit).toContain("VerticalSaddleBridge");
    expect(kit).toContain("Studiomark");
  });

  it("the retired kit shapes died with the decks — no scooped cards, no up bridge", () => {
    expect(kit).not.toContain("ScoopedCard");
    expect(kit).not.toContain("SaddleTabBridgeUp");
    expect(kit).not.toContain("buildscoopedclip");
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

  it("the footer Explorer row walks the chain to the free exploration face", () => {
    expect(saas).toContain('navigate("/explore");');
    const platform = saasfooter.columns.find((column) => column.title === "Platform");
    expect(platform).toBeDefined();
    const explorer = platform?.links.find((link) => link.label === "Explorer");
    expect(explorer?.route).toBe("/explore");
  });

  it("the footer drops the destination-less column — every row answers a real target", () => {
    expect(saasfooter.columns.map((column) => column.title)).toEqual(["Platform", "Studios", "AI"]);
    for (const column of saasfooter.columns) {
      for (const link of column.links) {
        expect(Boolean(link.target) || Boolean(link.route), `the row ${link.label} answers a target`).toBe(true);
      }
    }
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

  it("the header keys speak through the landing data layer (no hardcoded labels)", () => {
    expect(saas).toContain("aria-label={saaschrome.signin}");
    expect(saas).toContain("aria-label={saaschrome.launch}");
    expect(saas).not.toMatch(/aria-label="(Sign In|Launch)"/);
  });

  it("the taskbar widgets trigger walks the same chain — the os dock hands the explore face", () => {
    const chrome = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "Shellchrome.tsx"), "utf8");
    expect(chrome).toContain('onClick={() => navigate("/explore")}');
    expect(chrome).toContain('aria-label={uicopy("shell.widgets.aria")}');
    // the route the trigger lands on is the explore face of this chain
    expect(routes).toContain('<Route path="/explore" component={ExploreAnchor} />');
  });
});

describe("the living shader hero (the lazy WebGL face of the intro)", () => {
  it("the winget exists on the barrel and rides the section — the hero composes it before the gaussian", () => {
    expect(barrel).toContain('export * from "./IntroShaderhero.tsx";');
    expect(sections).toContain("<Shaderhero />");
    const heroOpen = sections.indexOf("<Shaderhero />");
    const gaussian = sections.indexOf("hero-gaussian-shader", heroOpen);
    expect(gaussian).toBeGreaterThan(heroOpen);
  });

  it("three.js rides the lazy lane — no static three import ever lands on the landing bundle", () => {
    expect(shaderhero).toContain('import("three")');
    expect(shaderhero).not.toMatch(/from "three"/);
    expect(shaderhero).not.toMatch(/require\("three"\)/);
  });

  it("the field never arms under reduced motion (the motion law on the shader too)", () => {
    expect(shaderhero).toContain("(prefers-reduced-motion: reduce)");
  });

  it("the field rides the ever walk — the indigo body died with the order", () => {
    expect(shaderhero).not.toContain("0.388, 0.400, 0.945");
    expect(shaderhero).not.toContain("0.220, 0.741, 0.973");
    expect(shaderhero).toContain("0.941, 0.314, 0.620");
    expect(shaderhero).toContain("0.788, 0.169, 0.525");
  });

  it("the cleanup is total — the scene resources die with the component", () => {
    expect(shaderhero).toContain("geometry.dispose()");
    expect(shaderhero).toContain("material.dispose()");
    expect(shaderhero).toContain("renderer.dispose()");
    expect(shaderhero).toContain("window.cancelAnimationFrame(frame)");
    expect(shaderhero).toContain('document.addEventListener("visibilitychange", onHidden)');
    expect(shaderhero).toContain('document.removeEventListener("visibilitychange", onHidden)');
    expect(shaderhero).toContain("observer.disconnect()");
    expect(shaderhero).toContain("canvas.remove()");
  });

  it("the field stays presentational — pointer transparent, aria hidden, no copy inside the canvas winget", () => {
    expect(shaderhero).toContain("pointer-events-none");
    expect(shaderhero).toContain('aria-hidden="true"');
    expect(shaderhero).not.toMatch(/\buicopy\(/);
    expect(shaderhero).not.toMatch(/\bcopy\(/);
  });
});
