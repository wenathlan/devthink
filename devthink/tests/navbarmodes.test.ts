/**
 * navbarmodes.test.ts — the navbar contract of the two modes the owner
 * ordered: the shell bar answers FLOATING (the detached rounded pad, the
 * magnifying dock) and DOCKED (the bar pinned to one screen edge — the
 * bottom taskbar or the 48px side rail), named in plain english, never
 * citing a competitor. The four layers of the law:
 *
 * - the pure state layer of desktopstate.ts: the account-store keys, the
 *   honest defaults, the stale-value refusal, the persistence roundtrip
 *   over the system store (the account-scoped browser preference lane of
 *   storage.ts — never a browser localStorage key of this build) and the
 *   drag verdict — pull up floats, pull sideways docks the edge, pull a
 *   docked bar off its wall (~1mm) floats it again;
 * - the magnification law of dockmagnify.ts beside the GSAP wiring of
 *   ShellDockmagnify.tsx: the gaussian falloff, one quickTo per face, the
 *   elastic.out return, the bottom transform origin and the total cleanup —
 *   never armed under reduced motion;
 * - the shell chrome wiring (the source pins: the bar carries both mode
 *   attributes, the drag handlers and the swallowed click, the calendar
 *   accompanies the floating dock, the settings card rides the ui store) —
 *   the chrome only exists in the browser mount;
 * - the css ladder of sol.css (the floating pad with the rounded corners,
 *   the docked rails with the side indicator ladder and the body
 *   reservation, the gsap handover, the reduced-motion guard) beside the
 *   login shadow law (the --win-shad-* tokens, clipped by the login face).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { copy } from "../copy.ts";
import {
  isNavbarEdge,
  isNavbarMode,
  loadNavbarEdge,
  loadNavbarMode,
  NAVBAR_DOCK_PULL_PX,
  NAVBAR_EDGE_EVENT,
  NAVBAR_EDGE_PREF,
  NAVBAR_FLOAT_LIFT_PX,
  NAVBAR_MODE_EVENT,
  NAVBAR_MODE_PREF,
  NAVBAR_RELEASE_PX,
  navbarDragVerdict,
  saveNavbarEdge,
  saveNavbarMode,
} from "../desktopstate.ts";
import { DOCK_MAGNIFY_MAX, DOCK_MAGNIFY_SPREAD, magnifyscale } from "../dockmagnify.ts";
import { copyseed } from "../copy.ts";
import { uicopy } from "../uistore.ts";

/** the in-memory account store the mocked preference lane answers (the
 * system store of storage.ts — the browser IndexedDB lane the os HD runs) */
const preferencerows = vi.hoisted(() => new Map<string, string>());

vi.mock("../storage.ts", () => ({
  readBrowserPreferences: async () => Object.fromEntries(preferencerows),
  saveBrowserPreference: async (key: string, value: string) => {
    preferencerows.set(key, value);
    return { key, value };
  },
}));

const chrome = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "Shellchrome.tsx"), "utf8");
const dockmagnifyhook = readFileSync(
  join(import.meta.dirname, "..", "Sol", "wingets", "ShellDockmagnify.tsx"),
  "utf8",
);
const trayflyouts = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "ShellTrayflyouts.tsx"), "utf8");
const navbarcard = readFileSync(
  join(import.meta.dirname, "..", "Sol", "wingets", "SettingsNavbarposition.tsx"),
  "utf8",
);
const personalization = readFileSync(
  join(import.meta.dirname, "..", "Sol", "wingets", "SettingsPersonalization.tsx"),
  "utf8",
);
const workspace = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelWorkspace.tsx"), "utf8");
const solcss = readFileSync(join(import.meta.dirname, "..", "Sol", "sol.css"), "utf8");

beforeEach(() => {
  preferencerows.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the navbar state layer (the two modes of desktopstate)", () => {
  it("keeps the mode and the edge under the account-store keys with the house event names", () => {
    expect(NAVBAR_MODE_PREF).toBe("navbarMode");
    expect(NAVBAR_EDGE_PREF).toBe("navbarEdge");
    expect(NAVBAR_MODE_EVENT).toBe("dt-navbar-mode");
    expect(NAVBAR_EDGE_EVENT).toBe("dt-navbar-edge");
  });

  it("answers the honest defaults when the account store is away (floating, bottom edge)", async () => {
    await expect(loadNavbarMode()).resolves.toBe("floating");
    await expect(loadNavbarEdge()).resolves.toBe("bottom");
  });

  it("refuses stale values — an unknown mode or edge falls back to the default", async () => {
    preferencerows.set(NAVBAR_MODE_PREF, "diagonal");
    preferencerows.set(NAVBAR_EDGE_PREF, "ceiling");
    await expect(loadNavbarMode()).resolves.toBe("floating");
    await expect(loadNavbarEdge()).resolves.toBe("bottom");
  });

  it("validates the untrusted store answers with the type guards", () => {
    expect(isNavbarMode("docked")).toBe(true);
    expect(isNavbarMode("windows")).toBe(false);
    expect(isNavbarMode("apple")).toBe(false);
    expect(isNavbarEdge("left")).toBe(true);
    expect(isNavbarEdge("bottom")).toBe(true);
    expect(isNavbarEdge("floating")).toBe(false);
  });

  it("persists and restores every mode and every edge on the system store (the roundtrip)", async () => {
    for (const mode of ["floating", "docked"] as const) {
      preferencerows.clear();
      saveNavbarMode(mode);
      await vi.waitFor(() => expect(preferencerows.get(NAVBAR_MODE_PREF)).toBe(mode));
      await expect(loadNavbarMode()).resolves.toBe(mode);
    }
    for (const edge of ["bottom", "left", "right"] as const) {
      preferencerows.clear();
      saveNavbarEdge(edge);
      await vi.waitFor(() => expect(preferencerows.get(NAVBAR_EDGE_PREF)).toBe(edge));
      await expect(loadNavbarEdge()).resolves.toBe(edge);
    }
  });
});

describe("the drag verdict (the three laws of the bar)", () => {
  it("pulling the bottom-docked bar up floats it", () => {
    expect(navbarDragVerdict({ mode: "docked", edge: "bottom" }, 0, -NAVBAR_FLOAT_LIFT_PX)).toEqual({
      mode: "floating",
      edge: "bottom",
    });
    expect(navbarDragVerdict({ mode: "docked", edge: "bottom" }, 0, -1)).toBeNull();
  });

  it("pulling the bar sideways docks it to that edge", () => {
    expect(navbarDragVerdict({ mode: "docked", edge: "bottom" }, -NAVBAR_DOCK_PULL_PX, 0)).toEqual({
      mode: "docked",
      edge: "left",
    });
    expect(navbarDragVerdict({ mode: "docked", edge: "bottom" }, NAVBAR_DOCK_PULL_PX, 0)).toEqual({
      mode: "docked",
      edge: "right",
    });
    expect(navbarDragVerdict({ mode: "floating", edge: "bottom" }, -NAVBAR_DOCK_PULL_PX, 0)).toEqual({
      mode: "docked",
      edge: "left",
    });
  });

  it("pulling a docked bar off its wall — about a millimeter — floats it again", () => {
    expect(NAVBAR_RELEASE_PX).toBeLessThanOrEqual(8);
    expect(navbarDragVerdict({ mode: "docked", edge: "left" }, NAVBAR_RELEASE_PX, 0)).toEqual({
      mode: "floating",
      edge: "bottom",
    });
    expect(navbarDragVerdict({ mode: "docked", edge: "right" }, -NAVBAR_RELEASE_PX, 0)).toEqual({
      mode: "floating",
      edge: "bottom",
    });
    expect(navbarDragVerdict({ mode: "docked", edge: "left" }, 1, 0)).toBeNull();
  });

  it("pushing the floating pad back down re-docks it on the bottom edge", () => {
    expect(navbarDragVerdict({ mode: "floating", edge: "bottom" }, 0, NAVBAR_DOCK_PULL_PX)).toEqual({
      mode: "docked",
      edge: "bottom",
    });
  });

  it("the diagonal drag never lands on the wrong wall (the sideways pull must outrun the vertical)", () => {
    // the up pull answers first from the bottom edge — sideways travel
    // beside it never lands on a wall instead
    expect(navbarDragVerdict({ mode: "docked", edge: "bottom" }, -NAVBAR_DOCK_PULL_PX, -NAVBAR_FLOAT_LIFT_PX)).toEqual({
      mode: "floating",
      edge: "bottom",
    });
    // the sideways dock answers only when it outruns the vertical travel —
    // a stronger vertical rides the up law, never the wrong wall
    expect(navbarDragVerdict({ mode: "docked", edge: "bottom" }, -NAVBAR_DOCK_PULL_PX, -20)).toEqual({
      mode: "docked",
      edge: "left",
    });
    expect(navbarDragVerdict({ mode: "docked", edge: "bottom" }, -NAVBAR_DOCK_PULL_PX, -60)).toEqual({
      mode: "floating",
      edge: "bottom",
    });
    expect(navbarDragVerdict({ mode: "floating", edge: "bottom" }, NAVBAR_DOCK_PULL_PX - 1, NAVBAR_DOCK_PULL_PX - 1)).toBeNull();
  });

  it("an undecided gesture answers null — the triggers keep their clicks", () => {
    expect(navbarDragVerdict({ mode: "docked", edge: "bottom" }, 3, -2)).toBeNull();
    expect(navbarDragVerdict({ mode: "floating", edge: "bottom" }, 0, 0)).toBeNull();
  });
});

describe("the magnification law (the gaussian falloff of the floating pad)", () => {
  it("the pointer icon rides the peak, the tail answers exactly one", () => {
    expect(magnifyscale(0)).toBeCloseTo(1 + DOCK_MAGNIFY_MAX, 12);
    expect(magnifyscale(DOCK_MAGNIFY_SPREAD * 6)).toBeCloseTo(1, 7);
  });

  it("the falloff is gaussian: half spread loses the factor the curve orders", () => {
    const atSpread = magnifyscale(DOCK_MAGNIFY_SPREAD);
    expect(atSpread).toBeGreaterThan(1 + DOCK_MAGNIFY_MAX / 2);
    expect(atSpread).toBeLessThan(1 + DOCK_MAGNIFY_MAX);
    expect(magnifyscale(10)).toBeGreaterThan(magnifyscale(40));
    expect(magnifyscale(-25)).toBe(magnifyscale(25));
  });

  it("the constants stay honest: a visible third at the peak, one wave of spread", () => {
    expect(DOCK_MAGNIFY_MAX).toBeGreaterThan(0.2);
    expect(DOCK_MAGNIFY_MAX).toBeLessThan(0.5);
    expect(DOCK_MAGNIFY_SPREAD).toBeGreaterThan(60);
    expect(DOCK_MAGNIFY_SPREAD).toBeLessThan(140);
  });

  it("the hook wires quickTo per face, the elastic return, the bottom origin and the total cleanup", () => {
    // the gsap drive: one quickTo setter per face answers the move, no
    // tween is ever created per frame
    expect(dockmagnifyhook).toContain('import { gsap } from "gsap"');
    expect(dockmagnifyhook).toContain("gsap.quickTo(face, \"scale\"");
    // the leave springs the whole field back on the elastic curve
    expect(dockmagnifyhook).toContain('const RETURN_EASE = "elastic.out(1, 0.45)"');
    expect(dockmagnifyhook).toContain("gsap.to(faces, { scale: 1, duration: RETURN_SECONDS, ease: RETURN_EASE, overwrite: \"auto\" })");
    // the faces grow from their bottom edge — the magnifying dock reads up
    expect(dockmagnifyhook).toContain('gsap.set(faces, { transformOrigin: "50% 100%" })');
    // the cleanup is total: listeners die, tweens die, inline transforms die
    expect(dockmagnifyhook).toContain("gsap.killTweensOf(faces)");
    expect(dockmagnifyhook).toContain('gsap.set(faces, { clearProps: "scale,transformOrigin" })');
    expect(dockmagnifyhook).toContain("surface.removeEventListener(\"pointermove\", onMove)");
    expect(dockmagnifyhook).toContain("surface.removeEventListener(\"pointerleave\", onLeave)");
    // the math rides the shared module (never a private copy of the curve)
    expect(dockmagnifyhook).toContain("magnifyscale(event.clientX - face.x, DOCK_MAGNIFY_MAX, DOCK_MAGNIFY_SPREAD)");
  });

  it("the chrome arms the magnification on the floating pad only and refuses reduced motion", () => {
    expect(chrome).toContain("useDockMagnification({ surfaceRef: clusterRef, enabled: navbarMode === \"floating\" && !reduced })");
    expect(chrome).toContain('import { useDockMagnification } from "./ShellDockmagnify.tsx"');
  });
});

describe("the shell chrome wears the two modes and drags between them (the source pins)", () => {
  it("carries the mode and the edge on the one bar", () => {
    expect(chrome).toContain("data-navmode={navbarMode}");
    expect(chrome).toContain("data-navedge={navbarEdge}");
  });

  it("loads the mode and the edge from the account store after mount (never a browser localStorage key)", () => {
    expect(chrome).toContain("void loadNavbarMode().then((mode) => {");
    expect(chrome).toContain("void loadNavbarEdge().then((edge) => {");
    expect(chrome).not.toContain("loadNavbarPosition");
    expect(chrome).not.toContain("loadNavbarStyle");
    expect(chrome).not.toContain("dt.navbar.pos.v1");
    expect(chrome).not.toContain("dt.navbar.style.v1");
  });

  it("listens for both personalization events so a choice or a drag lands live", () => {
    expect(chrome).toContain("window.addEventListener(NAVBAR_MODE_EVENT, onNavbarMode);");
    expect(chrome).toContain("window.addEventListener(NAVBAR_EDGE_EVENT, onNavbarEdge);");
  });

  it("the bar is the drag stage: the handlers ride the header, the verdict fires once, the click of a drag dies", () => {
    expect(chrome).toContain("onPointerDown={onBarPointerDown}");
    expect(chrome).toContain("onPointerMove={onBarPointerMove}");
    expect(chrome).toContain("onPointerUp={endBarDrag}");
    expect(chrome).toContain("navbarDragVerdict({ mode: navbarMode, edge: navbarEdge }, event.clientX - drag.x, event.clientY - drag.y)");
    expect(chrome).toContain("swallowClick.current = true;");
    expect(chrome).toContain("onClickCapture={(event) => {");
    expect(chrome).toContain("data-dragging={barDragging ? \"true\" : undefined}");
  });

  it("answers the windows taskbar canon on the docked bar: the 48px acrylic bar, the 38×38 pins, the tooltip pause, the press, the indicator", () => {
    // the 48px bar over the authentic acrylic surface (.acrylic-bar carries
    // rgb(32 32 32 / 75%) + saturate(3) blur(20px) — pinned in the css ladder)
    expect(chrome).toContain("dt-nav acrylic-bar fixed bottom-0 inset-x-0 z-50 flex h-12");
    // the 44px hit cell with the 3px ::after indicator ladder
    expect(chrome).toContain("after:h-[3px]");
    expect(chrome).toContain("data-[open=true]:after:w-1.5");
    expect(chrome).toContain("data-[active=true]:after:w-3");
    // the 38×38 r4 face inside the cell
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

  it("the shell strings ride the ui store (no literal lives in the chrome)", () => {
    expect(chrome).toContain('import { uicopy, useUicopy } from "../../uistore.ts"');
    expect(chrome).toContain("useUicopy();");
    expect(chrome).toContain('aria-description={uicopy("navbar.drag.hint")}');
  });
});

describe("the calendar accompanies the floating dock (the anchor law)", () => {
  it("the chrome measures the dock clock at open and hands the anchor to the flyout", () => {
    expect(chrome).toContain("ref={clockRef}");
    expect(chrome).toContain("setCalendarAnchorX(clock.getBoundingClientRect().left + clock.getBoundingClientRect().width / 2)");
    expect(chrome).toContain("floating={navbarMode === \"floating\"}");
    expect(chrome).toContain("anchorX={calendarAnchorX}");
  });

  it("the flyout rides the measured anchor while floating and keeps the corner law docked", () => {
    expect(trayflyouts).toContain("floating?: boolean;");
    expect(trayflyouts).toContain("anchorX?: number | null;");
    expect(trayflyouts).toContain("data-floating={rides !== null ? \"true\" : undefined}");
    // the clamp keeps the 360px box inside the viewport gutters
    expect(trayflyouts).toContain("const CALENDAR_GUTTER = 12 + 180;");
    expect(trayflyouts).toContain('right: "auto", left: `${Math.round(rides)}px`, transform: "translateX(-50%)"');
  });
});

describe("the settings card (the mode and the edge controls)", () => {
  it("offers the two modes and the three edges as segmented radios", () => {
    expect(navbarcard).toContain('const MODES: readonly NavbarMode[] = ["floating", "docked"];');
    expect(navbarcard).toContain('const EDGES: readonly NavbarEdge[] = ["bottom", "left", "right"];');
    expect(navbarcard).toContain('role="radiogroup"');
    expect(navbarcard).toContain('role="radio"');
  });

  it("persists on the system store and dispatches the events the chrome listens for", () => {
    expect(navbarcard).toContain("saveNavbarMode(next);");
    expect(navbarcard).toContain("new CustomEvent<NavbarMode>(NAVBAR_MODE_EVENT, { detail: next })");
    expect(navbarcard).toContain("saveNavbarEdge(next);");
    expect(navbarcard).toContain("new CustomEvent<NavbarEdge>(NAVBAR_EDGE_EVENT, { detail: next })");
    expect(navbarcard).not.toContain("window.localStorage");
  });

  it("locks the edge control while the bar floats — the disabled grammar with the hint naming the law", () => {
    expect(navbarcard).toContain("disabled={locked}");
    expect(navbarcard).toContain('aria-disabled={locked ? "true" : undefined}');
    expect(navbarcard).toContain('uicopy("navbar.edge.locked")');
    expect(navbarcard).toContain("window.addEventListener(NAVBAR_MODE_EVENT, onNavbarMode);");
  });

  it("the personalization page mounts both controls in the navbar card", () => {
    expect(personalization).toContain('import { NavbarEdgeControl, NavbarModeControl } from "./SettingsNavbarposition";');
    expect(personalization).toContain("<NavbarModeControl />");
    expect(personalization).toContain("<NavbarEdgeControl />");
    expect(personalization).toContain('uicopy("navbar.mode.aria")');
  });
});

describe("the labels catalog carries the navbar grammar (no hardcoded strings, no competitor names)", () => {
  it("answers every mode and edge label through the ui store", () => {
    expect(uicopy("navbar.mode.aria")).toBe("Navbar mode");
    expect(uicopy("navbar.mode.floating")).toBe("Floating");
    expect(uicopy("navbar.mode.docked")).toBe("Docked");
    expect(uicopy("navbar.edge.aria")).toBe("Dock edge");
    expect(uicopy("navbar.edge.bottom")).toBe("Bottom edge");
    expect(uicopy("navbar.edge.left")).toBe("Left edge");
    expect(uicopy("navbar.edge.right")).toBe("Right edge");
    expect(uicopy("navbar.mode.desc").length).toBeGreaterThan(0);
  });

  it("carries the drag hint and the lock hint (the laws named beside the surfaces)", () => {
    for (const key of ["navbar.drag.hint", "navbar.edge.locked"]) {
      const hint = uicopy(key);
      expect(hint.length).toBeGreaterThan(0);
      expect(hint).not.toBe(key);
    }
  });

  it("the competitor names died everywhere — the modes are floating and docked, in plain english", () => {
    const seeds = JSON.stringify(copyseed());
    expect(seeds).not.toContain("Windows taskbar");
    expect(seeds).not.toContain("Apple dock");
    expect(seeds).not.toContain("settings.navbar.windows");
    expect(seeds).not.toContain("settings.navbar.apple");
    expect(chrome).not.toContain('data-navstyle');
    expect(solcss).not.toContain("data-navstyle");
    expect(solcss).not.toContain("data-navbar=");
    expect(solcss).not.toContain('data-navbar="');
  });

  it("the history window body rides the ui store too (no literal in the workspace)", () => {
    expect(workspace).toContain('uicopy("workspace.history.localTabs")');
    expect(workspace).not.toContain(">Open session tabs remain local to this workspace.<");
    expect(uicopy("workspace.history.localTabs")).toBe("Open session tabs remain local to this workspace.");
  });

  it("the copy store keeps answering the settings rows the other cards ride", () => {
    expect(copy("settings.personal.background")).toBe("Background");
    expect(copy("settings.personal.components")).toBe("Component options");
  });
});

describe("the css ladder of the two modes (the sol.css pins)", () => {
  it("the docked bar canon: the 48px acrylic bar with the -webkit- prefix law", () => {
    expect(solcss).toContain(".acrylic-bar {");
    expect(solcss).toContain("background-color: rgb(32 32 32 / 75%);");
    expect(solcss).toContain("-webkit-backdrop-filter: saturate(3) blur(20px);");
    expect(solcss).toContain("backdrop-filter: saturate(3) blur(20px);");
    // the start menu panel answers the same law (rgba(36,36,36,.8) + blur)
    expect(solcss).toContain(".acrylic-panel {");
    expect(solcss).toContain("background-color: rgb(36 36 36 / 80%);");
  });

  it("the docked rail: the 48px vertical dock with the side indicator ladder and the body reservation", () => {
    expect(solcss).toContain('.dt-nav[data-navmode="docked"][data-navedge="left"],');
    expect(solcss).toContain('.dt-nav[data-navmode="docked"][data-navedge="right"] {');
    expect(solcss).toContain("width: 48px;");
    // the open/active ladder turns to the screen-edge side (3px wide, 6/12px tall)
    expect(solcss).toContain(
      '.dt-nav[data-navmode="docked"][data-navedge="left"] .dt-nav__app[data-open="true"]::after,',
    );
    expect(solcss).toContain("width: 3px;");
    // the document flow insets from the docked edge and the bottom band retires
    expect(solcss).toContain('body:has(.dt-nav[data-navmode="docked"][data-navedge="left"]),');
    expect(solcss).toContain("padding-left: 48px;");
  });

  it("the floating pad: the centered rounded dock on the token ladder with the gsap handover", () => {
    expect(solcss).toContain('.dt-nav[data-navmode="floating"] {');
    expect(solcss).toContain("left: 50%;");
    expect(solcss).toContain("translate: -50% 0;");
    expect(solcss).toContain("height: 56px;");
    // the rounded corners are the face of the floating law
    expect(solcss).toContain("border-radius: var(--radius-2xl);");
    expect(solcss).toContain("color-mix(in oklab, var(--color-veil) 14%, transparent)");
    // the magnification handover: gsap owns the transform, the css retires
    expect(solcss).toContain(".dt-nav[data-navmode=\"floating\"] .dt-nav__app-face {");
    expect(solcss).toContain("transform-origin: 50% 100%;");
    expect(solcss).toContain("transition-property: background-color;");
    // the omnibox retires on the pad face
    expect(solcss).toContain('.dt-nav[data-navmode="floating"] .dt-nav__omnibox {');
  });

  it("the drag stage answers the grabbed cursor and the selection kill", () => {
    expect(solcss).toContain('.dt-nav[data-dragging="true"] {');
    expect(solcss).toContain("cursor: grabbing;");
    expect(solcss).toContain("user-select: none;");
    expect(solcss).toContain("touch-action: none;");
  });

  it("the magnification flattens under reduced motion (the motion law)", () => {
    const guard = solcss.indexOf('@media (prefers-reduced-motion: reduce) {\n  .dt-nav[data-navmode="floating"]');
    expect(guard).toBeGreaterThan(-1);
    expect(solcss.slice(guard, guard + 300)).toContain("transform: none;");
  });

  it("the settings disabled grammar: the locked segments dim, refuse the pointer and keep the quiet hint", () => {
    expect(solcss).toContain(".dtw-settings__segment:disabled,");
    expect(solcss).toContain('.dtw-settings__segment[aria-disabled="true"] {');
    expect(solcss).toContain("cursor: not-allowed;");
    expect(solcss).toContain(".dtw-settings__hint {");
    expect(solcss).toContain("color: var(--dtv3-ink-3);");
  });
});

describe("the login shadow law (the --win-shad-* tokens, clipped by the login face)", () => {
  it("the sign-in card rides the house window shadow token — no hand-built drop leaks", () => {
    const card = solcss.indexOf(".dtw-login__card {");
    expect(card).toBeGreaterThan(-1);
    const cardblock = solcss.slice(card, card + 2400);
    expect(cardblock).toContain("box-shadow:");
    expect(cardblock).toContain("var(--win-shad-window)");
    expect(cardblock).not.toContain("0 16px 40px -18px");
  });

  it("the power flyout rides the house flyout shadow token", () => {
    const menu = solcss.indexOf(".dtw-login__powermenu {");
    expect(menu).toBeGreaterThan(-1);
    expect(solcss.slice(menu, menu + 900)).toContain("box-shadow: var(--win-shad-flyout);");
  });

  it("the login face clips every layer — the stage and the card can never paint beyond it", () => {
    const face = solcss.indexOf(".dtw-login {");
    expect(face).toBeGreaterThan(-1);
    expect(solcss.slice(face, face + 400)).toContain("overflow: hidden;");
    // the tokens the shadows ride exist on the root ladder
    expect(solcss).toContain("--win-shad-window: var(--shadow-window);");
    expect(solcss).toContain("--win-shad-flyout: var(--shadow-flyout);");
  });
});
