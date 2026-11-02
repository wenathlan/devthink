/**
 * entryface.test.ts — the entry face of the restored reference landing
 * (PR8 P1): the nine narrative sections answer in the reference order —
 * hero-os, creators-doo, workspace-subapps, the sawtooth ribbon with
 * studio-flow, spatial-bento, explorer-wall, sonic-deck, advisor-dark and
 * the editorial footer — with the exact campaign tokens (the Urbanist
 * three-tier voice, the four-stop engine switch, the gaussian field of
 * five radiais, the tactile keys, the obsidian fan deck, the stroked rank
 * numerals and the sawtooth ribbon). The owner laws stay pinned: no
 * saddle cloud key on the rail, no solid blue key in the hero, no stock
 * imagery anywhere (every deck art is a css treatment), and the one
 * sanctioned indigo glow is the reference hover of the tactile keys. The
 * intro → explore → auth chain walks unchanged. This battery pins the
 * restored face.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  saaschrome,
  saascreators,
  saasdebonairrail,
  saasfandeck,
  saasfooter,
  saasheadertabs,
  saasrailstops,
  saasreels,
  saascadriarail,
} from "../saascontent.ts";
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

/** the marker of the restored landing block — every landing rule is read
 * past it so the reduced-motion guards of the older blocks (which name the
 * same classes) never shadow the definition */
const landingAt = solcss.indexOf("THE LANDING MATERIALS");
expect(landingAt, "the landing materials block lives in sol.css").toBeGreaterThan(-1);

/** extracts one css rule body by its selector (the ladder pins read the
 * exact declarations, not the comments around them) */
function rule(selector: string): string {
  const at = solcss.indexOf(selector);
  expect(at, `the selector ${selector} lives in sol.css`).toBeGreaterThan(-1);
  const open = solcss.indexOf("{", at);
  const close = solcss.indexOf("}", open);
  return solcss.slice(open + 1, close);
}

/** extracts one landing rule body by its selector, scoped past the
 * materials marker */
function landingrule(selector: string): string {
  const at = solcss.indexOf(selector, landingAt);
  expect(at, `the landing selector ${selector} lives in the landing block of sol.css`).toBeGreaterThan(-1);
  const open = solcss.indexOf("{", at);
  const close = solcss.indexOf("}", open);
  return solcss.slice(open + 1, close);
}

/** asserts one section id renders inside its winget source */
function rides(source: string, id: string, winget: string) {
  expect(source, `the section ${id} rides ${winget}`).toContain(`id="${id}"`);
}

describe("the nine restored sections (the reference order)", () => {
  it("the page composes the nine sections in the exact reference order", () => {
    const order = [
      "SaasHero",
      "SaasCreators",
      "SaasWorkspace",
      "SaasStudioFlow",
      "SaasCadria",
      "SaasExplorer",
      "SaasDebonair",
      "SaasAdvisor",
      "SaasFooter",
    ];
    let at = -1;
    for (const section of order) {
      const next = saas.indexOf(`<${section}`, at + 1);
      expect(next, `the ${section} composition follows the reference order`).toBeGreaterThan(at);
      at = next;
    }
  });

  it("every section id lives in its winget", () => {
    rides(sections, "hero-os", "saassections");
    rides(sections, "creators-doo", "saassections");
    rides(sections, "workspace-subapps", "saassections");
    rides(sections, "studio-flow", "saassections");
    rides(rails, "spatial-bento", "saasrails");
    rides(rails, "explorer-wall", "saasrails");
    rides(rails, "sonic-deck", "saasrails");
    rides(rails, "advisor-dark", "saasrails");
    rides(rails, "editorial-bio", "saasrails");
  });

  it("the header chrome carries the white h-1.5 bar, the logo and the launch keys", () => {
    expect(saas).toContain("h-1.5 w-full bg-white");
    expect(saas).toContain('SaddleTabBridge fillColor="#FFFFFF"');
    expect(saas).toContain("VerticalSaddleBridge");
    expect(saas).toContain("SolLogoMark");
    expect(saas).toContain("SolWordmark");
  });
});

describe("the chrome keys (the reference grammar)", () => {
  it("the header answers the alerts, sign-in and launch keys through the landing data layer", () => {
    expect(saaschrome.alerts).toBe("Alerts");
    expect(saaschrome.signin).toBe("Sign In");
    expect(saaschrome.launch).toBe("Launch");
    expect(saas).toContain("aria-label={saaschrome.alerts}");
    expect(saas).toContain("aria-label={saaschrome.signin}");
    expect(saas).toContain("aria-label={saaschrome.launch}");
    expect(saas).not.toMatch(/aria-label="(Alerts|Sign In|Launch)"/);
  });

  it("the five header tabs carry the reference labels and order", () => {
    expect(saasheadertabs.map((tab) => tab.label)).toEqual(["OS", "Explorer", "Creators", "Cadria", "Debonair"]);
    expect(saasheadertabs.map((tab) => tab.id)).toEqual([
      "hero-os",
      "workspace-subapps",
      "creators-doo",
      "spatial-bento",
      "sonic-deck",
    ]);
  });

  it("the six rail stops carry the reference labels and order — no saddle cloud key ever answers the rail", () => {
    expect(saasrailstops).toHaveLength(6);
    expect(saasrailstops.map((row) => row.id)).toEqual([
      "hero-os",
      "creators-doo",
      "workspace-subapps",
      "spatial-bento",
      "sonic-deck",
      "advisor-dark",
    ]);
    expect(saasrailstops.map((row) => row.label)).toEqual([
      "DevThink OS",
      "Doo & Creators",
      "Explorer",
      "Cadria",
      "Debonair",
      "Doo Chat",
    ]);
    for (const dead of ["Saddle Cloud", "railcloud", "saddlecloud"]) {
      expect(saas).not.toContain(dead);
    }
  });

  it("the rail active pill rides the reference indigo-to-sky gradient", () => {
    expect(saas).toContain("from-indigo-600 to-sky-500");
  });

  it("the quick dock and the toast channel are restored", () => {
    expect(saas).toContain("Saved to Favorites");
    expect(saas).toContain("Notifications synced");
    expect(saas).toContain("rounded-2xl");
    expect(saas).toContain("2200");
    expect(saas).toMatch(/fixed bottom-8 left-1\/2/);
  });
});

describe("the hero (the reference statement)", () => {
  it("the h1 carries the mode switch inside the headline on the four-stop drift", () => {
    const open = sections.indexOf("<h1");
    const close = sections.indexOf("</h1>", open);
    expect(open).toBeGreaterThan(-1);
    const headline = sections.slice(open, close);
    expect(headline).toContain("hero-inline-switch");
    expect(headline).toContain("hero-switch-thumb");
    expect(headline).toContain("aria-label={hero.modetoggle}");
    expect(headline).toContain("text-slate-400");
    expect(sections).toContain("text-orange-500");
  });

  it("the verified reading stays — an OS built for every AI and your agents (the ui store rows)", () => {
    const seed = uistoreseedrows();
    expect(seed["intro.hero.leada"]).toBe("An OS");
    expect(seed["intro.hero.leadb"]).toBe("built for");
    expect(seed["intro.hero.leadc"]).toBe("every AI");
    expect(seed["intro.hero.mode.agents"]).toBe("and your agents");
    expect(seed["intro.hero.mode.studios"]).toBe("and your studios");
    expect(seed["intro.hero.modetoggle"]).toBe("Toggle OS Mode");
    expect(seed["intro.hero.subtitle"]).toBe("Create stream and run any studio or AI team in one unified OS");
    expect(seed["intro.hero.keyprimary"]).toBe("Get Started");
    expect(seed["intro.hero.keysecondary"]).toBe("Why DevThink?");
  });

  it("the switch track rides the four reference stops — the multicolor drift is back", () => {
    const track = landingrule(".hero-inline-switch");
    for (const hex of ["#60a5fa", "#a855f7", "#ec4899", "#f97316"]) {
      expect(track, `the switch carries the reference stop ${hex}`).toContain(hex);
    }
  });

  it("the gaussian field rides the five reference radiais with the blur and the pulse", () => {
    const field = landingrule(".hero-gaussian-shader");
    for (const hex of [
      "rgba(56, 189, 248, 0.82)",
      "rgba(99, 102, 241, 0.78)",
      "rgba(168, 85, 247, 0.78)",
      "rgba(236, 72, 153, 0.78)",
      "rgba(251, 146, 60, 0.82)",
    ]) {
      expect(field, `the field carries the reference radial ${hex}`).toContain(hex);
    }
    expect(field).toContain("blur(56px)");
    expect(field).toContain("saturate(165%)");
    expect(field).toContain("shaderPulse 9s ease-in-out infinite");
  });

  it("the hero keys ride the tactile dark key and the surface card — never a solid blue key", () => {
    expect(sections).toContain('className="btn-tactile-3d flex items-center gap-2.5 rounded-full px-10 py-4');
    expect(sections).toContain("surface-card flex items-center gap-2.5 rounded-full px-7 py-4");
    expect(sections).not.toContain("bg-blue-600");
    expect(sections).not.toContain("bg-sky-500");
  });

  it("the three scooped proof cards float over the field", () => {
    // three hero floats + the swing card template of the creators deck
    const cards = sections.match(/<ScoopedCard/g) ?? [];
    expect(cards).toHaveLength(4);
    expect(sections).toContain("animate-float-card");
    expect(sections).toContain("animate-float-card-delayed");
    expect(sections).toContain("indigo-tactile-surface");
    expect(saascontent, "the neural core copy rides the data layer").toContain("Neural Shader Core");
  });
});

describe("the voice (the Urbanist law of the reference)", () => {
  it("the three tiers ride Urbanist with the exact reference tracking", () => {
    const thin = landingrule(".font-thin-tier");
    const medium = landingrule(".font-medium-tier");
    const bold = landingrule(".font-bold-tier");
    expect(thin).toContain("font-weight: 400");
    expect(thin).toContain("letter-spacing: -0.005em");
    expect(medium).toContain("font-weight: 600");
    expect(medium).toContain("letter-spacing: -0.018em");
    expect(bold).toContain("font-weight: 800");
    expect(bold).toContain("letter-spacing: -0.035em");
    for (const tier of [thin, medium, bold]) {
      expect(tier).toContain('"Urbanist"');
      expect(tier).toContain('"Inter Variable"');
    }
  });

  it("the face injects the Urbanist stylesheet and falls back to the house voice", () => {
    expect(saas).toContain("fonts.googleapis.com/css2?family=Urbanist:wght@400;600;800");
    const root = landingrule(".saas-root");
    expect(root).toContain('"Urbanist"');
    expect(root).toContain("letter-spacing: -0.015em");
  });
});

describe("the decks (the reference catalogs)", () => {
  it("the fan deck carries the five apps in the reference order", () => {
    expect(saasfandeck.map((app) => app.id)).toEqual(["getry", "debonair", "cadria", "saddle", "vault"]);
    expect(saasfandeck.map((app) => app.rating)).toEqual(["4,9", "4,8", "4,9", "4,9", "4,7"]);
  });

  it("the cadria rail carries the eight ranked rows and the debonair rail the six tracks", () => {
    expect(saascadriarail).toHaveLength(8);
    expect(saascadriarail.map((item) => item.rank)).toEqual(["01", "02", "03", "04", "05", "06", "07", "08"]);
    expect(saascadriarail.map((item) => item.match)).toEqual([
      "99% Match",
      "98% Match",
      "96% Match",
      "95% Match",
      "94% Match",
      "93% Match",
      "92% Match",
      "91% Match",
    ]);
    expect(saasdebonairrail).toHaveLength(6);
    expect(saasdebonairrail.map((track) => track.index)).toEqual([0, 1, 2, 3, null, null]);
  });

  it("the explorer wall carries the seven reels and the creators deck the two profiles", () => {
    expect(saasreels).toHaveLength(7);
    expect(saasreels.map((reel) => reel.tag)).toEqual([
      "3D Mesh",
      "AI Stem",
      "4K Film",
      "Cloud Game",
      "Shader",
      "24 Bit",
      "60 FPS",
    ]);
    expect(saascreators.map((profile) => profile.key)).toEqual(["alan", "nato"]);
    expect(saascreators.map((profile) => profile.ring)).toEqual([false, true]);
  });

  it("the owner image ban holds — no stock photography, no img tag, every deck art is a css treatment", () => {
    for (const page of [sections, saas, rails, kit, saascontent]) {
      expect(page).not.toContain("images.unsplash.com");
      expect(page).not.toContain("<img");
    }
    // the deck wings and the data layer never open a remote url — the one
    // remote face of the landing is the Urbanist stylesheet the chrome
    // injects (the reference @import, never an image); the svg paint
    // servers of the studio marks (url(#tile)) stay local ids
    for (const page of [sections, rails, saascontent]) {
      expect(page).not.toContain("https://");
    }
    for (const item of saascadriarail) {
      expect(item.art, `the ${item.title} art is a gradient treatment`).toContain("gradient");
    }
  });

  it("the deck wings wear the reference treatments", () => {
    for (const token of ["obsidian-grid-bg", "urbanist-frosted-blur", "fan-clay", "fan-swap", "fan-sheen"]) {
      expect(sections, `the workspace deck wears ${token}`).toContain(token);
    }
    // the swing idles ride the data layer — the winget renders the row
    // classes the catalog carries
    expect(sections).toContain("className={card.swing}");
    for (const swing of ["swing-card-1", "swing-card-2", "swing-card-3"]) {
      expect(saascontent, `the creators catalog carries ${swing}`).toContain(swing);
    }
    expect(sections).toContain("conic-rainbow-ring");
    expect(sections).toContain("text-gradient-brand");
    for (const token of ["netflix-rank-num", "mask-fade-x", "rail-scroll"]) {
      expect(rails, `the cadria deck wears ${token}`).toContain(token);
    }
    expect(rails).toContain("spin-badge-slow");
    expect(rails).toContain("ribbon-sawtooth-divider");
    expect(sections).toContain("ribbon-sawtooth-divider");
    expect(rails).toContain("fill-[#1DB954]");
  });

  it("the fan geometry is the reference fan — rotate 5.5 a step, sink 18 a step, the center scaled 1.08", () => {
    expect(sections).toContain("offset * 5.5");
    expect(sections).toContain("Math.abs(offset) * 18");
    expect(sections).toContain("? 1.08 :");
    expect(sections).toContain("4500");
    expect(sections).toContain('SaddleTabBridgeUp fillColor="#F9F6F0"');
  });
});

describe("the surfaces (the era kit restored)", () => {
  it("the kit carries the scooped card, the clip builder and the up bridge", () => {
    expect(kit).toContain("ScoopedCard");
    expect(kit).toContain("buildscoopedclip");
    expect(kit).toContain("SaddleTabBridgeUp");
    expect(kit).toContain("Studiomark");
    expect(kit).toContain("VerticalSaddleBridge");
    expect(kit).toContain("ResizeObserver");
  });

  it("the tactile keys ride the reference recipe — the dark gradient with the inset rims", () => {
    const key = landingrule(".btn-tactile-3d");
    expect(key).toContain("linear-gradient(180deg, #243047 0%, #090d16 100%)");
    expect(key).toContain("inset 0 1.5px 2px rgba(255, 255, 255, 0.42)");
    expect(key).toContain("inset 0 -3px 6px rgba(0, 0, 0, 0.65)");
  });

  it("the one sanctioned glow is the reference indigo hover of the tactile keys", () => {
    const hover = landingrule(".btn-tactile-3d:hover");
    expect(hover).toContain("rgba(79, 70, 229, 0.45)");
    const frame = landingrule(".icon-frame-3d:hover");
    expect(frame).toContain("rgba(79, 70, 229, 0.18)");
    const active = landingrule(".icon-frame-3d-active");
    expect(active).toContain("rgba(79, 70, 229, 0.24)");
  });

  it("the era surfaces ride the reference values", () => {
    expect(landingrule(".surface-card")).toContain("0 16px 36px -14px rgba(15, 23, 42, 0.1)");
    expect(landingrule(".stat-tile")).toContain("#f4f6fb");
    expect(landingrule(".indigo-tactile-surface")).toContain(
      "linear-gradient(145deg, #4f46e5 0%, #3730a3 58%, #312e81 100%)",
    );
    expect(landingrule(".obsidian-grid-bg")).toContain("background-size: 60px 60px");
    expect(landingrule(".netflix-rank-num")).toContain("-webkit-text-stroke: 2px rgba(255, 255, 255, 0.35)");
    expect(landingrule(".text-gradient-brand")).toContain("#6366f1");
    expect(landingrule(".text-gradient-brand")).toContain("#38bdf8");
  });

  it("the palco keeps the era radius over the pale canvas", () => {
    expect(saas).toContain("rounded-[30px]");
    expect(saas).toContain("sm:rounded-[34px]");
    expect(saas).toContain("bg-[#DCE2EE]");
    expect(saas).toContain("bg-[#F2F5FC]");
  });

  it("the sawtooth ribbon rides the four reference washes", () => {
    const ribbon = landingrule(".ribbon-sawtooth-divider");
    for (const wash of [
      "rgba(15, 23, 42, 0.92)",
      "rgba(99, 102, 241, 0.75)",
      "rgba(56, 189, 248, 0.45)",
      "rgba(200, 75, 17, 0.75)",
    ]) {
      expect(ribbon, `the ribbon carries the wash ${wash}`).toContain(wash);
    }
    expect(ribbon).toContain("background-size: 30px 30px");
  });

  it("the swing and float idles ride the reference timings", () => {
    expect(landingrule(".swing-card-1")).toContain("cardSwingLeft 5s ease-in-out infinite");
    expect(landingrule(".swing-card-2")).toContain("cardSwingCenter 5.6s ease-in-out infinite");
    expect(landingrule(".swing-card-3")).toContain("cardSwingRight 5.2s ease-in-out infinite");
    expect(landingrule(".animate-float-card")).toContain("subtleFloat 6s ease-in-out infinite");
    expect(landingrule(".animate-float-card-delayed")).toContain("subtleFloat 6.6s ease-in-out 1.2s infinite");
    expect(landingrule(".spin-badge-slow")).toContain("spinBadgeSlow 18s linear infinite");
    expect(landingrule(".fan-swap")).toContain("fanSwap 0.42s cubic-bezier(0.16, 1, 0.3, 1)");
  });
});

describe("the motion guards of the restored face", () => {
  it("the idles and the shader die under reduced motion and park under the pause hook", () => {
    const guard = solcss.indexOf("@media (prefers-reduced-motion: reduce)", landingAt);
    expect(guard).toBeGreaterThan(-1);
    const block = solcss.slice(guard, solcss.indexOf("}", solcss.indexOf(".saas-root .fan-swap", guard)));
    for (const idle of ["hero-gaussian-shader", "spin-badge-slow", "swing-card-1", "animate-float-card", "fan-swap"]) {
      expect(block, `the guard parks ${idle}`).toContain(idle);
    }
    expect(solcss).toContain("[data-anim-paused] .saas-root .hero-gaussian-shader");
  });
});

describe("the login face (the contained shadow law)", () => {
  it("the sign-in card keeps the hairline outline, the mica blur and the contained drop", () => {
    const card = rule(".dtw-login__card");
    expect(card).toContain("border: 1px solid color-mix(in oklab, var(--color-veil) 16%, transparent)");
    expect(card).toContain("-webkit-backdrop-filter: blur(30px) saturate(1.35)");
    expect(card).toContain("backdrop-filter: blur(30px) saturate(1.35)");
    // the drop stays the contained two-step of the mica card — the wide
    // freehand drops of the first cut never return
    expect(card).toContain("0 16px 40px rgb(0 0 0 / 22%)");
    expect(card).not.toContain("0 12px 32px");
    expect(card).not.toContain("0 32px 80px");
  });

  it("the auth face mounts the split card over the lock sequence (the source wiring)", () => {
    expect(auth).toContain("className={`dtw-login");
    expect(auth).toContain("<LockFace onUnlock={unlock} />");
    expect(auth).toContain("<SignInForm");
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

  it("the footer carries the four reference columns — the Company rows stay the plain spans", () => {
    expect(saasfooter.columns.map((column) => column.title)).toEqual(["Platform", "Studios", "AI", "Company"]);
    const company = saasfooter.columns.find((column) => column.title === "Company");
    for (const link of company?.links ?? []) {
      expect(link.target, `the ${link.label} row stays the plain span`).toBeUndefined();
      expect(link.route, `the ${link.label} row stays the plain span`).toBeUndefined();
    }
    expect(rails).toContain('<span key={link.label} className="block">');
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

  it("the taskbar widgets trigger walks the same chain — the os dock hands the explore face", () => {
    const chrome = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "Shellchrome.tsx"), "utf8");
    expect(chrome).toContain('onClick={() => navigate("/explore")}');
    expect(chrome).toContain('aria-label={uicopy("shell.widgets.aria")}');
    // the route the trigger lands on is the explore face of this chain
    expect(routes).toContain('<Route path="/explore" component={ExploreAnchor} />');
  });
});

describe("the living shader hero (the dormant WebGL winget of the face)", () => {
  it("the winget stays on the barrel, dormant — the CSS gaussian of the reference owns the hero", () => {
    expect(barrel).toContain('export * from "./IntroShaderhero.tsx";');
    expect(sections).toContain("hero-gaussian-shader");
    expect(sections).not.toContain("<Shaderhero />");
  });

  it("three.js rides the lazy lane — no static three import ever lands on the landing bundle", () => {
    expect(shaderhero).toContain('import("three")');
    expect(shaderhero).not.toMatch(/from "three"/);
    expect(shaderhero).not.toMatch(/require\("three"\)/);
  });

  it("the field never arms under reduced motion (the motion law on the shader too)", () => {
    expect(shaderhero).toContain("(prefers-reduced-motion: reduce)");
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
