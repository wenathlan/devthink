/**
 * desktopcompose.test.ts — the desktop composition contract (campaign
 * wave 8). The charged defect this battery pins closed: "the apps were
 * supposed to be scattered on the screen, the logo in the middle, not
 * this grid" — the hand-tuned DESKTOP_SPOTS constellation (arcs around
 * the centered hero, anchors above, clusters below) stays the default
 * layout of the icon field and the ordered column flow answers ONLY the
 * explicit "sort by" arrange action, never a fresh boot. The battery
 * walks the four layers of the row: the composition law (the table
 * parsed verbatim from the desktop source, the geometry invariants — the
 * hero zone stays clear, the tiles never collide, both sides of the mark
 * carry the constellation, the raw spots live inside the reference
 * bounds, and the defaults never equal the uniform lattice), the drag
 * contract with selection and double click (pointer capture, the snap
 * lattice, the honest persistence under the doctrine key, the marquee
 * and the keyboard), the hero lockup at the middle of the surface (the
 * two-path mark, the wordmark and the tagline riding the os label table,
 * the radial light bed, the recede under open windows), and the chat bar
 * out of the panel (the panel anchor carries no conversation surface —
 * the chat body binds as a window app and the deep link hands its
 * session to the chat window).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { DESKTOP_APPS } from "../appregistry.ts";
import {
  boundsForArea,
  CELL_MEDIUM,
  clearIconSpots,
  defaultSpots,
  fitSpot,
  flowLayoutSpots,
  flowSpots,
  ICONS_STORAGE_KEY,
  type IconSpotMap,
  loadIconSpots,
  mergedSpots,
  normalizeSpotMap,
  SNAP_STEP_X,
  SNAP_STEP_Y,
  saveIconSpots,
  snapSpot,
  sortAppsByKind,
} from "../desktopstate.ts";
import { osText } from "../oslabels.ts";
import { uistoreseedrows } from "../uistore.ts";

const desktop = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelDesktop.tsx"), "utf8");
const workspace = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelWorkspace.tsx"), "utf8");
const windowframe = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelWindowframe.tsx"), "utf8");
const panel = readFileSync(join(import.meta.dirname, "..", "Sol", "panel", "panel.tsx"), "utf8");
const solcss = readFileSync(join(import.meta.dirname, "..", "Sol", "sol.css"), "utf8");

/** parses the DESKTOP_SPOTS table out of the desktop source — the
 * constellation is component-owned data, so the battery reads it the way
 * the tree carries it: verbatim, every pair, in catalog order */
function parseSpots(source: string): Array<{ x: number; y: number }> {
  const block = source.match(/const DESKTOP_SPOTS: ReadonlyArray<\{ x: number; y: number \}> = \[([\s\S]*?)\];/);
  expect(block, "the DESKTOP_SPOTS table lives in the desktop source").toBeTruthy();
  const body = block ? block[1] : "";
  const pairs = [...body.matchAll(/\{ x: ([\d.]+), y: ([\d.]+) \}/g)].map((match) => ({
    x: Number(match[1]),
    y: Number(match[2]),
  }));
  expect(pairs.length, "the table carries real spots").toBeGreaterThan(0);
  return pairs;
}

const SPOTS = parseSpots(desktop);

/** the reference viewport of the geometry laws (the live audit viewport):
 * the desktop area of a 1280×720 screen */
const REF = { width: 1280, height: 720 };
const REF_BOUNDS = boundsForArea(REF.width, REF.height, CELL_MEDIUM.width, CELL_MEDIUM.height);

/** the visual face of one icon cell — the 46px squircle tile inside the
 * 74×84 win11 cell (the plate the appicons battery pins) */
const TILE_PX = 46;

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

describe("the scattered composition (the owner's law — never the uniform grid)", () => {
  it("the table covers the whole catalog — every app a hand-tuned spot, no lap drift", () => {
    expect(SPOTS.length).toBeGreaterThanOrEqual(DESKTOP_APPS.length);
    const laid = defaultSpots(DESKTOP_APPS.length, SPOTS);
    expect(laid).toHaveLength(DESKTOP_APPS.length);
    // the table is the render: every spot sits inside the lap window, so the
    // current catalog lands verbatim (what the hand tuned is what paints)
    expect(laid).toEqual(SPOTS.slice(0, DESKTOP_APPS.length));
    for (const spot of SPOTS) {
      expect(spot.x).toBeGreaterThanOrEqual(8);
      expect(spot.x).toBeLessThanOrEqual(92);
      expect(spot.y).toBeGreaterThanOrEqual(16);
      expect(spot.y).toBeLessThanOrEqual(74);
    }
  });

  it("every spot is a finite percentage inside the field", () => {
    for (const spot of SPOTS) {
      expect(Number.isFinite(spot.x)).toBe(true);
      expect(Number.isFinite(spot.y)).toBe(true);
      expect(spot.x).toBeGreaterThanOrEqual(0);
      expect(spot.x).toBeLessThanOrEqual(100);
      expect(spot.y).toBeGreaterThanOrEqual(0);
      expect(spot.y).toBeLessThanOrEqual(100);
    }
  });

  it("the raw spots live inside the reference bounds — the hand tuning needs no clamp", () => {
    for (const spot of SPOTS) {
      expect(spot.x).toBeGreaterThanOrEqual(REF_BOUNDS.minX);
      expect(spot.x).toBeLessThanOrEqual(REF_BOUNDS.maxX);
      expect(spot.y).toBeGreaterThanOrEqual(REF_BOUNDS.minY);
      expect(spot.y).toBeLessThanOrEqual(REF_BOUNDS.maxY);
    }
  });

  it("the hero zone stays clear — no icon lands on the centered mark", () => {
    // the lockup box around the hero center (50, 45): the mark, the
    // wordmark and the tagline own the middle band
    for (const spot of SPOTS) {
      const insideHeroZone = spot.x > 40 && spot.x < 60 && spot.y > 28 && spot.y < 62;
      expect(insideHeroZone, `spot ${JSON.stringify(spot)} lands on the hero zone`).toBe(false);
    }
  });

  it("the constellation spans both sides of the mark — the balance law", () => {
    const right = SPOTS.filter((spot) => spot.x >= 63);
    const left = SPOTS.filter((spot) => spot.x <= 36);
    const top = SPOTS.filter((spot) => spot.y <= 22);
    const bottom = SPOTS.filter((spot) => spot.y >= 66);
    expect(right.length).toBeGreaterThanOrEqual(10);
    expect(left.length).toBeGreaterThanOrEqual(9);
    expect(top.length).toBeGreaterThanOrEqual(4);
    expect(bottom.length).toBeGreaterThanOrEqual(6);
  });

  it("the tiles never collide — every pair keeps the 46px faces apart on the reference viewport", () => {
    for (let i = 0; i < SPOTS.length; i += 1) {
      for (let j = i + 1; j < SPOTS.length; j += 1) {
        const a = SPOTS[i];
        const b = SPOTS[j];
        if (!a || !b) throw new Error("the parse guarantees every pair");
        const dx = Math.abs(a.x - b.x) * (REF.width / 100);
        const dy = Math.abs(a.y - b.y) * (REF.height / 100);
        const collides = dx < TILE_PX && dy < TILE_PX;
        expect(collides, `spots ${JSON.stringify(a)} and ${JSON.stringify(b)} collide`).toBe(false);
      }
    }
  });

  it("the first catalog app lands the eye-level right arc (chat opens the composition)", () => {
    expect(DESKTOP_APPS[0]?.id).toBe("chat");
    expect(SPOTS[0]).toEqual({ x: 72, y: 42 });
  });

  it("the defaults come from the table — the source pins the wiring", () => {
    expect(desktop).toContain("const DESKTOP_SPOTS: ReadonlyArray<{ x: number; y: number }> = [");
    expect(desktop).toContain("const laid = defaultSpots(apps.length, DESKTOP_SPOTS);");
    expect(desktop).toContain("NEVER a uniform grid");
  });

  it("the ordered flow answers ONLY the sort action — the defaults never build a grid", () => {
    // exactly one flowLayoutSpots call in the source: the applySort commit
    const flowCalls = desktop.match(/flowLayoutSpots\(/g) ?? [];
    expect(flowCalls).toHaveLength(1);
    expect(desktop).toContain("commitOverrides(flowLayoutSpots(sorted, currentBounds()));");
    // the sorters feed that one call only
    const kindCalls = desktop.match(/sortAppsByKind\(/g) ?? [];
    const nameCalls = desktop.match(/sortAppsByName\(/g) ?? [];
    expect(kindCalls).toHaveLength(1);
    expect(nameCalls).toHaveLength(1);
  });

  it("the default layout never equals the uniform lattice for the real catalog", () => {
    const defaults: IconSpotMap = {};
    DESKTOP_APPS.forEach((app, index) => {
      const spot = SPOTS[index];
      if (spot) defaults[app.id] = spot;
    });
    const sortable = DESKTOP_APPS.map((app) => ({ id: app.id, name: app.name, kind: app.target.kind }));
    const flow = flowLayoutSpots(sortAppsByKind(sortable), REF_BOUNDS);
    let differing = 0;
    for (const [id, spot] of Object.entries(defaults)) {
      const gridSpot = flow[id];
      if (!gridSpot || Math.abs(gridSpot.x - spot.x) > 1 || Math.abs(gridSpot.y - spot.y) > 1) differing += 1;
    }
    // the grid lives in the left band; the constellation covers the field
    expect(differing).toBeGreaterThanOrEqual(20);
  });

  it("the ordered lattice is the arrange math only: 6 rows, the column step, the row step", () => {
    const slots = flowSpots(24);
    expect(slots).toHaveLength(24);
    expect(slots[0]).toEqual({ x: 6, y: 18 });
    expect((slots[1]?.y ?? 0) - (slots[0]?.y ?? 0)).toBeCloseTo(11, 5);
    expect((slots[6]?.x ?? 0) - (slots[0]?.x ?? 0)).toBeCloseTo(8, 5);
  });

  it("the storage rides the v3 doctrine key — the scatter era, every visitor starts from the constellation", () => {
    expect(ICONS_STORAGE_KEY).toBe("dt.desktop.icons.v3");
  });

  it("a catalog longer than the table wraps in laps with the diagonal offset — nothing stacks", () => {
    const table = [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
    ];
    const laid = defaultSpots(3, table);
    expect(laid).toEqual([
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 14, y: 16 }, // the lap drift clamps inside the window
    ]);
  });
});

describe("the hero lockup (the logo sits at the middle of the composition)", () => {
  it("the hero is the centered, pointer-transparent lockup — mark, wordmark, tagline", () => {
    expect(desktop).toContain('"dt-desktop__hero absolute top-[45%] left-1/2 grid');
    expect(desktop).toContain("-translate-x-1/2 -translate-y-1/2 animate-hero pointer-events-none");
    expect(desktop).toContain('<SolLogoMark size={150} title={osText("desktop.logoTitle")} accent />');
    expect(desktop).toContain('className="dt-desktop__wordmark');
    expect(desktop).toContain('{osText("desktop.wordmark")}');
    expect(desktop).toContain('className="dt-desktop__tagline');
    expect(desktop).toContain('{osText("desktop.tagline")}');
  });

  it("one big radial light behind the hero — the depth-by-light law, the reduced-transparency guard", () => {
    expect(desktop).toContain('<div className="dt-desktop__light" aria-hidden="true" />');
    expect(solcss).toContain(".dt-desktop__light {");
    expect(solcss).toContain("radial-gradient(54% 46% at 50% 44%, rgb(231 233 238 / 17%) 0%, transparent 64%)");
    expect(solcss).toContain("@media (prefers-reduced-transparency: reduce)");
  });

  it("the hero recedes while any window is open — one brand voice per zone", () => {
    expect(solcss).toContain('.shell-desktop:has(.shell-window:not([data-min="true"])) .dt-desktop__hero {');
    expect(solcss).toContain("opacity: 0.16;");
  });

  it("the field staggers in at 70ms steps and the guard skips it under reduced motion", () => {
    expect(desktop).toContain("Math.min(index * 70, 630)");
    expect(desktop).toContain("animationDelay: reduced ? undefined :");
    expect(desktop).toContain("(prefers-reduced-motion: reduce)");
    expect(solcss).toContain("--animate-hero: heroIn 0.9s var(--ease-micro) backwards;");
    expect(solcss).toContain("--animate-appicon-in: appiconIn 0.5s var(--ease-micro) backwards;");
  });
});

describe("the drag contract (pointer capture, the snap lattice, honest persistence)", () => {
  it("the thresholds and the capture — the source pins", () => {
    expect(desktop).toContain("const DRAG_THRESHOLD = 4;");
    expect(desktop).toContain("const MARQUEE_THRESHOLD = 4;");
    expect(desktop).toContain("event.currentTarget.setPointerCapture(event.pointerId);");
    expect(desktop).toContain('event.currentTarget.dataset.dragging = "true";');
    expect(desktop).toContain(
      "data-[dragging=true]:z-10 data-[dragging=true]:scale-[1.04] data-[dragging=true]:opacity-75",
    );
  });

  it("the icon follows the pointer live and the release commits the fitted spot", () => {
    expect(desktop).toContain(`event.currentTarget.style.left = \`\${spot.x}%\`;`);
    expect(desktop).toContain(`event.currentTarget.style.top = \`\${spot.y}%\`;`);
    expect(desktop).toContain("commitOverrides({ ...overrides, [drag.appId]: spot });");
    // the cancel is honest: the drag dies, nothing commits
    expect(desktop).toContain("const onCellPointerCancel = (event: ReactPointerEvent<HTMLButtonElement>) => {");
  });

  it("the snap lattice: multiples of 2% x and 3.33% y", () => {
    expect(SNAP_STEP_X).toBe(2);
    expect(SNAP_STEP_Y).toBeCloseTo(10 / 3, 10);
    expect(snapSpot({ x: 5.1, y: 5.2 })).toEqual({ x: 6, y: 6.67 });
    expect(snapSpot({ x: 50, y: 45 })).toEqual({ x: 50, y: 46.67 });
  });

  it("the bounds math of the reference viewport (the bands stay clear)", () => {
    expect(REF_BOUNDS).toEqual({ minX: 3.52, maxX: 96.48, minY: 13.61, maxY: 81.39 });
    // fit = clamp then snap: the stray spot lands on the lattice inside the bounds
    expect(fitSpot({ x: 2, y: 2 }, REF_BOUNDS)).toEqual({ x: 4, y: 13.33 });
  });

  it("mergedSpots: defaults clamp (never snap — the organic composition), overrides fit, stale ids drop", () => {
    const bounds = { minX: 5, maxX: 95, minY: 15, maxY: 81 };
    const defaults: IconSpotMap = { a: { x: 50.5, y: 45.5 }, b: { x: 99, y: 99 } };
    const overrides: IconSpotMap = { a: { x: 5.1, y: 5.2 }, ghost: { x: 1, y: 1 } };
    const merged = mergedSpots(defaults, overrides, bounds);
    // the override wins and lands on the lattice inside the bounds
    expect(merged.a).toEqual({ x: 6, y: 16.67 });
    // the default outside the bounds clamps inside, never snapped
    expect(merged.b).toEqual({ x: 95, y: 81 });
    // an override for an app outside the defaults never leaks
    expect(merged.ghost).toBeUndefined();
  });

  it("normalizeSpotMap refuses junk — only finite pairs survive", () => {
    expect(normalizeSpotMap(null)).toEqual({});
    expect(normalizeSpotMap([1, 2])).toEqual({});
    expect(
      normalizeSpotMap({
        a: { x: 1, y: 2 },
        b: { x: "3", y: 4 },
        c: { x: Number.NaN, y: 1 },
        d: "junk",
        e: { x: 1 },
      }),
    ).toEqual({ a: { x: 1, y: 2 } });
  });

  it("the persistence roundtrip under the doctrine key (and the corrupt storage answer)", () => {
    installStorage();
    saveIconSpots({ chat: { x: 72, y: 42 } });
    expect(loadIconSpots()).toEqual({ chat: { x: 72, y: 42 } });
    clearIconSpots();
    expect(loadIconSpots()).toEqual({});
    installStorage({ [ICONS_STORAGE_KEY]: "{not json" });
    expect(loadIconSpots()).toEqual({});
    // storage unavailable: the defaults carry the layout
    expect(loadIconSpots()).toEqual({});
  });

  it("reset returns the constellation — the original spots action clears the storage", () => {
    expect(desktop).toContain("const resetLayout = () => {");
    expect(desktop).toContain("clearIconSpots();");
    expect(desktop).toContain("setOverrides({});");
  });
});

describe("the selection contract (click, ctrl, marquee, keyboard)", () => {
  it("single click selects, ctrl+click toggles, the empty desktop clears", () => {
    expect(desktop).toContain("const selectOnly = (appId: string) => setSelection(new Set([appId]));");
    expect(desktop).toContain("if (event.ctrlKey || event.metaKey) toggleSelect(app.id);");
    expect(desktop).toContain("else if (!selection.has(app.id)) selectOnly(app.id);");
    expect(desktop).toContain("if (selection.size) clearSelection();");
  });

  it("the marquee: the rubber band selects from the empty desktop", () => {
    expect(desktop).toContain("if (state.moved && state.hits.size) setSelection(new Set(state.hits));");
    expect(desktop).toContain('data-marquee={marquee?.hits.has(app.id) ? "true" : undefined}');
    expect(desktop).toContain("border border-dotted border-[rgb(231_233_238/80%)]");
  });

  it("the win11 cell canon: 74×84, the dotted selection grammar, the wash values", () => {
    expect(desktop).toContain("w-[74px] min-h-[84px]");
    expect(desktop).toContain("touch-none select-none");
    expect(desktop).toContain("border-dotted border-transparent");
    expect(desktop).toContain("hover:bg-white/12 focus:bg-white/24 focus:border-white/85");
    expect(desktop).toContain(
      "data-[selected=true]:bg-white/14 data-[selected=true]:border-white/55 data-[selected=true]:shadow-none",
    );
    expect(desktop).toContain('data-selected={selected ? "true" : undefined}');
    expect(desktop).toContain("aria-pressed={selected}");
  });

  it("the keyboard: nudge on the lattice, open, clear, the cell menu", () => {
    expect(desktop).toContain('if (event.key === "Enter" || event.key === " ") {');
    expect(desktop).toContain('if (event.key === "Escape") {');
    expect(desktop).toContain("? { x: -SNAP_STEP_X, y: 0 }");
    expect(desktop).toContain("const targets = selection.has(app.id) ? [...selection] : [app.id];");
    expect(desktop).toContain('if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {');
  });

  it("the label rides the legibility token of the ladder (the wave 5 law stays)", () => {
    expect(desktop).toContain("[text-shadow:var(--shadow-label)]");
  });

  it("the portrait fallback flows the cells — no absolute scatter on the phone", () => {
    expect(desktop).toContain("max-[760px]:static");
  });
});

describe("the open contract (double click on the desktop, single tap on mobile)", () => {
  it("the double click opens the app on the desktop surface", () => {
    expect(desktop).toContain("onDoubleClick={() => {");
    expect(desktop).toContain("if (!mobile) onOpen(app);");
  });

  it("the mobile layout keeps the single tap (static cells, no hover)", () => {
    expect(desktop).toContain("if (mobile && drag.openable && event.button === 0) {");
  });

  it("the workspace wires the surface to the catalog and the open action", () => {
    expect(workspace).toContain("<DesktopSurface apps={DESKTOP_APPS} onOpen={openApp} />");
    expect(workspace).toContain("pushrecentapp(app.id);");
  });
});

describe("the family window law (the double click never leaves the os)", () => {
  it("the external app opens as the power clip window — the panel never navigates away", () => {
    // the charged defect: the double click on a family icon navigated to the
    // fullscreen stage (the typed-url surface), leaving the desktop behind;
    // the owner's law answers the opposite split — the double click inside
    // the panel opens the window (the power clip) exactly like every native
    // app of the catalog, while the address bar keeps owning the fullscreen
    expect(workspace).toContain('if (app.target.kind === "external") {');
    expect(workspace).toContain("toggleWindow(app.target.slug, app.name);");
    expect(workspace).not.toContain("onNavigate(`/${app.target.slug}`)");
  });

  it("the desktop opens feed the shell: the live window ids light the taskbar ladder and the opens promote the recommended entries", () => {
    // the workspace hands the live window state to the chrome (the open
    // ladder reads data-open off the pin cells) and every open lands in the
    // recent-entries store the start menu recommended rail renders
    expect(workspace).toContain("openApps={windows.map((win) => win.id)}");
    expect(workspace).toContain("pushrecentapp(app.id);");
    const chrome = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "Shellchrome.tsx"), "utf8");
    expect(chrome).toContain("openApps = []");
    expect(chrome).toContain("const open = active || openApps.includes(app.id);");
    expect(chrome).toContain("pushrecentapp(app.id);");
    expect(chrome).toContain("setRecents(loadrecententries());");
  });
});

describe("the chat bar out of the panel (the conversation lives in the window)", () => {
  it("the panel anchor carries no conversation surface — the source refuses the chat bar", () => {
    expect(panel).not.toContain("sendMessage");
    expect(panel).not.toContain("ChatComposer");
    expect(panel).not.toContain("<textarea");
    expect(panel).not.toContain("composer");
  });

  it("the panel mounts the desktop composition and only the shell surfaces", () => {
    expect(panel).toContain("<ShellWorkspace");
    expect(panel).toContain("<CommandPalette");
    expect(panel).toContain("<PairingPanel");
  });

  it("the chat body binds as a window app — the conversation opens in a window", () => {
    expect(workspace).toContain("chat: ChatBody,");
    expect(workspace).toContain("<WindowFrame");
    expect(workspace).toContain("<Body embedded />");
  });

  it("the deep chat link hands its session to the chat window", () => {
    expect(panel).toContain('if (route.sectionId === "chat") writeChatHandoff(route.sessionId);');
    expect(panel).toContain('chatHandoff={deep && route.sectionId === "chat" ? route.sessionId : undefined}');
    expect(workspace).toContain('else if (chatHandoff) toggleWindow("chat", appById("chat").name);');
  });
});

describe("the labels law (every desktop string rides the os label table)", () => {
  it("every osText id the desktop quotes answers a seeded row", () => {
    const ids = [...desktop.matchAll(/osText\("([^"]+)"\)/g)].map((match) => match[1]);
    expect(ids.length).toBeGreaterThanOrEqual(12);
    for (const id of ids) {
      const text = osText(id as Parameters<typeof osText>[0]);
      expect(text, `the seed must answer ${id}`).not.toBe(id);
      expect(text.length).toBeGreaterThan(0);
    }
  });

  it("the composition rows are pinned — the aria, the lockup, the menu grammar", () => {
    expect(osText("desktop.aria")).toBe("DevThink desktop");
    expect(osText("desktop.logoTitle")).toBe("DevThink");
    expect(osText("desktop.wordmark")).toBe("DevThink");
    expect(osText("desktop.tagline")).toBe("local OS — chat first");
    expect(osText("desktop.menu.view")).toBe("View");
    expect(osText("desktop.menu.view.reset")).toBe("reset layout");
    expect(osText("desktop.menu.sort.original")).toBe("original spots");
    expect(osText("desktop.menu.refresh")).toBe("Refresh");
    expect(osText("desktop.menu.display")).toBe("Display settings");
    expect(osText("desktop.menu.open")).toBe("Open");
    expect(osText("desktop.menu.openWindow")).toBe("Open in new window");
  });
});

describe("the window manager doctrine (wave 3 — hz counter, drag band, labels)", () => {
  it("the z order rides the focus counter — the win11React hz pattern", () => {
    expect(workspace).toContain("hzRef.current += 1");
    expect(workspace).toContain("WINDOW_MIN_Z = -1");
    // the mutation mapper never renumbers — the mutations own the stamps
    const apply = workspace.match(/const applyWindows = [\s\S]*?\}, \[\]\);/);
    expect(apply, "the applyWindows mapper lives").toBeTruthy();
    expect(apply?.[0]).not.toContain("z:");
  });

  it("a minimized window drops under the field and a restore takes the next stamp", () => {
    expect(workspace).toContain('state: "minimized", restoredState: target.state, z: WINDOW_MIN_Z');
    expect(workspace).toContain("restoredState: undefined, z: nextz()");
  });

  it("the drag raises the window onto the doctrine band with the notrans class", () => {
    expect(windowframe).toContain("WINDOW_DRAG_Z = 9900");
    expect(windowframe).toContain("dragging ? WINDOW_DRAG_Z : win.z");
    expect(windowframe).toContain('dragging ? "notrans" : ""');
  });

  it("the aero ghost paints above the drag band — the preview never hides under its own window", () => {
    expect(windowframe).toContain('zIndex: "calc(var(--win-drag-z) + 1)"');
  });

  it("no string is hardcoded — the workspace history line rides the ui store", () => {
    expect(workspace).toContain("useUicopy();");
    expect(workspace).toContain('uicopy("workspace.history.localTabs")');
    expect(workspace).not.toContain("Open session tabs remain local to this workspace.");
    expect(uistoreseedrows()["workspace.history.localTabs"]).toBe("Open session tabs remain local to this workspace.");
  });
});
