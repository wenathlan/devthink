/**
 * navbarmodes.test.ts — the navbar modes contract of the personalization
 * pass: the bar answers the two faces the owner ordered (the windows
 * taskbar and the apple dock) switchable from the settings app, the three
 * dock positions (floating, left edge, right edge), and the start menu
 * opens from the logo mark — no labeled start button, no brand text.
 *
 * this file pins the four layers of that law: the pure state layer of
 * desktopstate.ts (the doctrine keys, the honest defaults, the stale-value
 * refusal, the persistence roundtrip and the resolveNavbarDock verdict —
 * the apple dock is the floating pad by law, so the style wins the edge
 * fight and a stored edge choice never pairs the rail grammar with the
 * dock face), the shell chrome wiring (the source pins: the bar carries
 * both axes, re-docks and re-faces live on the two events, and the mark is
 * the start trigger), the settings card (the segmented controls dispatch
 * the events, the position control locks under the apple face with the
 * hint naming the law), and the css ladder of sol.css (the windows taskbar
 * canon — the 48px acrylic bar, the 38×38 pins, the 3px indicator ladder —
 * beside the apple dock face and its reduced-motion guard). source pins
 * ride the same reading discipline the panelgate and appicons batteries
 * carry: the chrome only exists in the browser mount.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { copy } from "../devthink/copy.ts";
import {
  loadNavbarPosition,
  loadNavbarStyle,
  NAVBAR_POS_EVENT,
  NAVBAR_POS_KEY,
  NAVBAR_STYLE_EVENT,
  NAVBAR_STYLE_KEY,
  resolveNavbarDock,
  saveNavbarPosition,
  saveNavbarStyle,
} from "../devthink/desktopstate.ts";

const chrome = readFileSync(join(import.meta.dirname, "..", "devthink", "Sol", "wingets", "Shellchrome.tsx"), "utf8");
const navbarcard = readFileSync(
  join(import.meta.dirname, "..", "devthink", "Sol", "wingets", "SettingsNavbarposition.tsx"),
  "utf8",
);
const personalization = readFileSync(
  join(import.meta.dirname, "..", "devthink", "Sol", "wingets", "SettingsPersonalization.tsx"),
  "utf8",
);
const solcss = readFileSync(join(import.meta.dirname, "..", "devthink", "Sol", "sol.css"), "utf8");

/** installs a minimal window.localStorage stub (the node battery has no
 * browser): the map-backed accessors the desktopstate helpers read */
function installStorage(initial: Record<string, string> = {}): void {
  const store = new Map(Object.entries(initial));
  (globalThis as Record<string, unknown>).window = {
    localStorage: {
      getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    },
  };
}

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window;
});

describe("the navbar state layer (the personalization pass of desktopstate)", () => {
  it("keeps the two axes under the doctrine keys with the house event names", () => {
    expect(NAVBAR_POS_KEY).toBe("dt.navbar.pos.v1");
    expect(NAVBAR_STYLE_KEY).toBe("dt.navbar.style.v1");
    expect(NAVBAR_POS_EVENT).toBe("dt-navbar-pos");
    expect(NAVBAR_STYLE_EVENT).toBe("dt-navbar-style");
  });

  it("answers the honest defaults when storage is unavailable (the windows taskbar, floating)", () => {
    expect(loadNavbarPosition()).toBe("floating");
    expect(loadNavbarStyle()).toBe("windows");
  });

  it("refuses stale values — an unknown position or face falls back to the default", () => {
    installStorage({ [NAVBAR_POS_KEY]: "diagonal", [NAVBAR_STYLE_KEY]: "mac" });
    expect(loadNavbarPosition()).toBe("floating");
    expect(loadNavbarStyle()).toBe("windows");
  });

  it("persists and restores every position and every face (the roundtrip)", () => {
    for (const position of ["floating", "left", "right"] as const) {
      installStorage();
      saveNavbarPosition(position);
      expect(loadNavbarPosition()).toBe(position);
    }
    for (const style of ["windows", "apple"] as const) {
      installStorage();
      saveNavbarStyle(style);
      expect(loadNavbarStyle()).toBe(style);
    }
  });
});

describe("the dock verdict (the apple face is the floating pad by law)", () => {
  it("the full choice matrix: the style wins the edge fight, the windows face answers the stored edge", () => {
    expect(resolveNavbarDock("apple", "floating")).toBe("floating");
    expect(resolveNavbarDock("apple", "left")).toBe("floating");
    expect(resolveNavbarDock("apple", "right")).toBe("floating");
    expect(resolveNavbarDock("windows", "floating")).toBe("floating");
    expect(resolveNavbarDock("windows", "left")).toBe("left");
    expect(resolveNavbarDock("windows", "right")).toBe("right");
  });
});

describe("the shell chrome wears both axes and re-faces live (the source pins)", () => {
  it("carries the resolved dock and the face on the one bar", () => {
    expect(chrome).toContain("data-navbar={dockedPos}");
    expect(chrome).toContain("data-navstyle={navbarStyle}");
  });

  it("derives the dock from the resolveNavbarDock verdict (never the raw stored edge)", () => {
    expect(chrome).toContain("resolveNavbarDock,");
    expect(chrome).toContain("const dockedPos = resolveNavbarDock(navbarStyle, navbarPos);");
    expect(chrome).toContain('const rail = dockedPos !== "floating";');
  });

  it("listens for both personalization events so the settings choice lands live", () => {
    expect(chrome).toContain("window.addEventListener(NAVBAR_POS_EVENT, onNavbarPos);");
    expect(chrome).toContain("window.addEventListener(NAVBAR_STYLE_EVENT, onNavbarStyle);");
  });

  it("answers the windows taskbar canon: the 48px acrylic bar, the 38×38 pins, the tooltip pause, the press, the indicator", () => {
    // the 48px bar over the authentic acrylic surface (.acrylic-bar carries
    // rgb(32 32 32 / 75%) + saturate(3) blur(20px) — pinned in the css ladder)
    expect(chrome).toContain("dt-nav acrylic-bar fixed bottom-0 inset-x-0 z-50 flex h-12");
    // the 44px hit cell with the 3px ::after indicator ladder
    expect(chrome).toContain("after:h-[3px]");
    expect(chrome).toContain("data-[open=true]:after:w-1.5");
    expect(chrome).toContain("data-[active=true]:after:w-3");
    // the 38×38 r4 windows face inside the cell
    expect(chrome).toContain("h-[38px] w-[38px]");
    // the app name surfaces on hover with the 1000ms windows tooltip pause
    expect(chrome).toContain("group-hcf:delay-[1000ms]");
    // the press answers scale(.7) in 100ms
    expect(chrome).toContain("group-active:scale-[0.7]");
    expect(chrome).toContain("group-active:duration-100");
    // the touch target law: the cell is the 44px target
    expect(chrome).toContain("h-11 w-11");
  });

  it("the start menu opens from the logo — the mark is the trigger, no labeled start button", () => {
    expect(chrome).toContain("dt-nav__start");
    expect(chrome).toContain('aria-label={osText("shell.start.aria")}');
    expect(chrome).toContain('aria-haspopup="dialog"');
    expect(chrome).toContain('onClick={() => togglePanel({ kind: "start" })}');
    // the official mark rides the trigger (the logo law — no wordmark, no text)
    expect(chrome).toContain("<SolLogoMark size={20} />");
  });

  it("the start menu answers the canon: the 640px centered acrylic panel", () => {
    expect(chrome).toContain('id="dt-start-menu"');
    expect(chrome).toContain("w-[640px]");
    expect(chrome).toContain("acrylic-panel");
  });
});

describe("the settings card (the personalization controls)", () => {
  it("offers the three dock positions and the two faces as segmented radios", () => {
    expect(navbarcard).toContain('const POSITIONS: readonly NavbarPosition[] = ["floating", "left", "right"];');
    expect(navbarcard).toContain('const STYLES: readonly NavbarStyle[] = ["windows", "apple"];');
    expect(navbarcard).toContain('role="radiogroup"');
    expect(navbarcard).toContain('role="radio"');
  });

  it("persists the choices and dispatches the events the chrome listens for", () => {
    expect(navbarcard).toContain("saveNavbarPosition(next);");
    expect(navbarcard).toContain("new CustomEvent<NavbarPosition>(NAVBAR_POS_EVENT, { detail: next })");
    expect(navbarcard).toContain("saveNavbarStyle(next);");
    expect(navbarcard).toContain("new CustomEvent<NavbarStyle>(NAVBAR_STYLE_EVENT, { detail: next })");
  });

  it("locks the position control under the apple face — the disabled grammar with the hint naming the law", () => {
    expect(navbarcard).toContain('useState<boolean>(() => loadNavbarStyle() === "apple")');
    expect(navbarcard).toContain("window.addEventListener(NAVBAR_STYLE_EVENT, onNavbarStyle);");
    expect(navbarcard).toContain("disabled={locked}");
    expect(navbarcard).toContain('aria-disabled={locked ? "true" : undefined}');
    expect(navbarcard).toContain('copy("settings.navbar.docklocked")');
  });

  it("the personalization page mounts both controls in the navbar card", () => {
    /* the wingets village owns the navbar controls under the family folder —
     * the personalization card imports the sibling by its flat name since
     * the english-law fold retired the devthink/tests home. */
    expect(personalization).toContain(
      'import { NavbarPositionControl, NavbarStyleControl } from "./SettingsNavbarposition";',
    );
    expect(personalization).toContain("<NavbarPositionControl />");
    expect(personalization).toContain("<NavbarStyleControl />");
    expect(personalization).toContain('copy("settings.personal.navbarstyle")');
  });
});

describe("the labels catalog carries the navbar grammar (no hardcoded strings)", () => {
  it("answers every position and face label through the copy store", () => {
    expect(copy("settings.navbar.floating")).toBe("Floating");
    expect(copy("settings.navbar.left")).toBe("Left edge");
    expect(copy("settings.navbar.right")).toBe("Right edge");
    expect(copy("settings.navbar.windows")).toBe("Windows taskbar");
    expect(copy("settings.navbar.apple")).toBe("Apple dock");
    expect(copy("settings.personal.navbar")).toBe("Navbar position");
    expect(copy("settings.personal.navbarstyle")).toBe("Navbar style");
  });

  it("carries the dock lock hint (the apple law named beside the control)", () => {
    const hint = copy("settings.navbar.docklocked");
    expect(hint.length).toBeGreaterThan(0);
    expect(hint).not.toBe("settings.navbar.docklocked");
  });
});

describe("the css ladder of the two faces (the sol.css pins)", () => {
  it("the windows taskbar canon: the 48px acrylic bar with the -webkit- prefix law", () => {
    expect(solcss).toContain(".acrylic-bar {");
    expect(solcss).toContain("background-color: rgb(32 32 32 / 75%);");
    expect(solcss).toContain("-webkit-backdrop-filter: saturate(3) blur(20px);");
    expect(solcss).toContain("backdrop-filter: saturate(3) blur(20px);");
    // the start menu panel answers the same law (rgba(36,36,36,.8) + blur)
    expect(solcss).toContain(".acrylic-panel {");
    expect(solcss).toContain("background-color: rgb(36 36 36 / 80%);");
  });

  it("the rail: the 48px vertical dock with the side indicator ladder and the body reservation", () => {
    expect(solcss).toContain('.dt-nav[data-navbar="left"],');
    expect(solcss).toContain('.dt-nav[data-navbar="right"] {');
    expect(solcss).toContain("width: 48px;");
    // the open/active ladder turns to the screen-edge side (3px wide, 6/12px tall)
    expect(solcss).toContain('.dt-nav[data-navbar="left"] .dt-nav__app[data-open="true"]::after,');
    expect(solcss).toContain("width: 3px;");
    // the document flow insets from the docked edge and the bottom band retires
    expect(solcss).toContain('body:has(.dt-nav[data-navbar="left"]),');
    expect(solcss).toContain("padding-left: 48px;");
  });

  it("the apple dock: the centered floating mica pad on the token ladder with the magnifying pins", () => {
    expect(solcss).toContain('.dt-nav[data-navstyle="apple"] {');
    expect(solcss).toContain("left: 50%;");
    expect(solcss).toContain("translate: -50% 0;");
    expect(solcss).toContain("height: 56px;");
    // the token ladder: the radius, the ring and the hairline ride the house tokens
    expect(solcss).toContain("border-radius: var(--radius-2xl);");
    expect(solcss).toContain("color-mix(in oklab, var(--color-veil) 14%, transparent)");
    // the dock magnification on the micro curve of the house (≤200ms, transform only)
    expect(solcss).toContain('.dt-nav[data-navstyle="apple"] .dt-nav__app:hover,');
    expect(solcss).toContain("transform: translateY(-3px) scale(1.12);");
    expect(solcss).toContain("transition: transform 150ms var(--ease-micro, cubic-bezier(0.22, 1, 0.36, 1));");
    // the omnibox retires on the dock face
    expect(solcss).toContain('.dt-nav[data-navstyle="apple"] .dt-nav__omnibox {');
  });

  it("the dock magnification flattens under reduced motion (the motion law)", () => {
    const guard = solcss.indexOf('@media (prefers-reduced-motion: reduce) {\n  .dt-nav[data-navstyle="apple"]');
    expect(guard).toBeGreaterThan(-1);
    expect(solcss.slice(guard, guard + 400)).toContain("transform: none;");
  });

  it("the settings disabled grammar: the locked segments dim, refuse the pointer and keep the quiet hint", () => {
    expect(solcss).toContain(".dtw-settings__segment:disabled,");
    expect(solcss).toContain('.dtw-settings__segment[aria-disabled="true"] {');
    expect(solcss).toContain("cursor: not-allowed;");
    expect(solcss).toContain(".dtw-settings__hint {");
    expect(solcss).toContain("color: var(--dtv3-ink-3);");
  });
});
