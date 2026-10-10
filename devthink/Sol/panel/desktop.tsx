/**
 * desktop.tsx — the desktop surface of the Sol shell: a premium dark
 * wallpaper with one large radial light behind the hero and the app icons
 * spread around it like a real desktop. The official two-path DevThink mark
 * sits at the middle of the screen as the hero of the composition (never
 * draggable, pointer-transparent like the wallpaper) and the shared catalog
 * (Sol/shell/appregistry.ts) lives around it as true Windows desktop icons:
 * every cell drags with pointer capture (positions persist in
 * localStorage "dt.desktop.icons.v1" as percentages of the desktop area,
 * clamped inside the taskbar/dock bands and snapped to the fine 2% × 3.33%
 * lattice — Sol/panel/desktopstate.ts), a single click selects, ctrl+click
 * toggles, a rubber-band marquee selects from the empty desktop, the right
 * button opens the Win11 context menus (Sol/panel/desktopmenu.tsx) and the
 * keyboard nudges, opens and clears. The deterministic DESKTOP_SPOTS stay
 * the default layout; "reset layout" / "original spots" clears the storage,
 * "sort by name/kind" recomputes an ordered column-flow layout and
 * "refresh" re-clamps the field and replays the stagger. The field staggers
 * in at 70ms steps (skipped under prefers-reduced-motion) and sits under
 * the floating windows.
 */

import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "wouter";
import { familyurl } from "../../deploybase.ts";
import { type DesktopApp, seedOsView } from "../shell/appregistry.ts";
import { AppTile } from "../shell/apptile.tsx";
import { DesktopMenu, type MenuEntry } from "./desktopmenu.tsx";
import {
  BAND_BOTTOM_PX,
  BAND_TOP_PX,
  boundsForArea,
  cellSize,
  clampNumber,
  clampSpot,
  clearIconSpots,
  defaultSpots,
  fitSpot,
  flowLayoutSpots,
  type IconBounds,
  type IconSize,
  type IconSpotMap,
  loadIconSpots,
  mergedSpots,
  SNAP_STEP_X,
  SNAP_STEP_Y,
  saveIconSpots,
  sortAppsByKind,
  sortAppsByName,
} from "./desktopstate.ts";
import { SolLogoMark } from "./logo.tsx";

/**
 * The spread composition: one hand-tuned spot per slot, laid out as arcs
 * around the hero — the right arc opens at eye level (the first app of the
 * catalog, Chat, lands there), a looser left arc mirrors it, a pair of
 * anchors sits above the mark and loose clusters fill the lower corners.
 * All spots are percentages of the desktop area, clear of the navbar band,
 * the hero zone and the dock strip. Pure data — the same apps always land
 * on the same spots, on every machine, on every load.
 */
const DESKTOP_SPOTS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 72, y: 42 }, // right arc, eye level — the first catalog app
  { x: 86, y: 30 },
  { x: 78, y: 58 },
  { x: 91, y: 46 },
  { x: 67, y: 22 },
  { x: 64, y: 32 },
  { x: 85, y: 66 },
  { x: 63, y: 66 },
  { x: 92, y: 60 },
  { x: 28, y: 40 }, // left arc, mirroring the right one
  { x: 14, y: 30 },
  { x: 22, y: 58 },
  { x: 9, y: 48 },
  { x: 33, y: 22 },
  { x: 36, y: 32 },
  { x: 17, y: 70 },
  { x: 6, y: 22 },
  { x: 46, y: 14 }, // anchors above the hero
  { x: 57, y: 16 },
  { x: 50, y: 74 }, // the lower clusters
  { x: 37, y: 66 },
];

/** the pointer travel (px) that turns a press into a drag */
const DRAG_THRESHOLD = 4;
/** the pointer travel (px) before a rubber band counts as a marquee */
const MARQUEE_THRESHOLD = 4;

/** true when the OS-level reduced-motion preference is on (motion opt-out) */
function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** the reduced-motion preference as live state (matchMedia change events) */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    try {
      return prefersReducedMotion();
    } catch {
      return false;
    }
  });
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** the context menu the desktop currently shows, in viewport coordinates */
type MenuState = { kind: "desktop"; x: number; y: number } | { kind: "cell"; appId: string; x: number; y: number };

/** the live rubber band, in viewport coordinates, with the cells it covers */
type MarqueeState = { x0: number; y0: number; x1: number; y1: number; hits: ReadonlySet<string> };

/** one icon drag in flight (the pointer capture lives on the cell) */
type DragState = {
  appId: string;
  pointerId: number;
  startX: number;
  startY: number;
  grabX: number;
  grabY: number;
  moved: boolean;
  /** a plain press (no modifier) opens the app on release — Windows parity */
  openable: boolean;
  desktopRect: DOMRect | null;
};

/** one rubber band in flight (the pointer capture lives on the desktop) */
type MarqueeDragState = {
  pointerId: number;
  x0: number;
  y0: number;
  moved: boolean;
  desktopRect: DOMRect | null;
  hits: Set<string>;
};

type DesktopSurfaceProps = {
  apps: DesktopApp[];
  /** opens one app (double-click on its cell; Enter on the keyboard) */
  onOpen: (app: DesktopApp) => void;
  /** optional internal navigation (the menu "Display settings" entry);
   * when omitted the entry navigates the /settings route directly */
  onNavigate?: (href: string) => void;
};

/**
 * The desktop composition: the radial light, the hero mark at the middle
 * and the app icons spread around it — draggable, selectable, sortable.
 */
export function DesktopSurface({ apps, onOpen, onNavigate }: DesktopSurfaceProps) {
  const desktopRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const marqueeDragRef = useRef<MarqueeDragState | null>(null);
  const [, navigate] = useLocation();
  const reduced = useReducedMotion();

  /** the stored user positions (moved icons), loaded once from localStorage */
  const [overrides, setOverrides] = useState<IconSpotMap>(() => loadIconSpots());
  /** the selected app ids (single click, ctrl+click, marquee commit) */
  const [selection, setSelection] = useState<ReadonlySet<string>>(() => new Set<string>());
  /** the icon scale of the field — the "View ▸" menu of the desktop menu */
  const [iconSize, setIconSize] = useState<IconSize>("medium");
  /** the open context menu, if any */
  const [menu, setMenu] = useState<MenuState | null>(null);
  /** the live rubber band, if any */
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  /** the measured pixel size of the desktop area (resize-aware) */
  const [measured, setMeasured] = useState<{ width: number; height: number } | null>(null);
  /** bumped by "Refresh" to remount the field and replay the stagger intro */
  const [refreshNonce, setRefreshNonce] = useState(0);

  /** re-measures the desktop area when the window changes shape */
  useLayoutEffect(() => {
    const element = desktopRef.current;
    if (!element) return undefined;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      setMeasured((current) =>
        current && current.width === rect.width && current.height === rect.height
          ? current
          : { width: rect.width, height: rect.height },
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /** the percentage bounds of the desktop for the current icon size */
  const bounds = useMemo<IconBounds>(() => {
    const cell = cellSize(iconSize);
    const fallbackHeight = Math.max(window.innerHeight - BAND_TOP_PX - BAND_BOTTOM_PX, 240);
    return boundsForArea(
      measured?.width ?? window.innerWidth,
      measured?.height ?? fallbackHeight,
      cell.width,
      cell.height,
      BAND_TOP_PX,
      BAND_BOTTOM_PX,
    );
  }, [iconSize, measured]);

  /**
   * The bounds measured live (event handlers read the desktop box at the
   * moment of the gesture, not at the last render).
   */
  const currentBounds = (): IconBounds => {
    const rect = desktopRef.current?.getBoundingClientRect();
    if (!rect) return bounds;
    const cell = cellSize(iconSize);
    return boundsForArea(rect.width, rect.height, cell.width, cell.height, BAND_TOP_PX, BAND_BOTTOM_PX);
  };

  /** the deterministic default layout of the catalog (never persisted):
   * every app takes its tuned DESKTOP_SPOTS spot via the state module */
  const defaults = useMemo<IconSpotMap>(() => {
    const laid = defaultSpots(apps.length, DESKTOP_SPOTS);
    const spots: IconSpotMap = {};
    apps.forEach((app, index) => {
      const spot = laid[index];
      if (spot) spots[app.id] = spot;
    });
    return spots;
  }, [apps]);

  /** the resolved layout: defaults with the stored overrides on top */
  const spots = useMemo(() => mergedSpots(defaults, overrides, bounds), [bounds, defaults, overrides]);

  /** persists the overrides and mirrors them into the state */
  const commitOverrides = (next: IconSpotMap) => {
    setOverrides(next);
    saveIconSpots(next);
  };

  const selectOnly = (appId: string) => setSelection(new Set([appId]));
  const toggleSelect = (appId: string) =>
    setSelection((current) => {
      const next = new Set(current);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  const clearSelection = () => setSelection(new Set<string>());

  /* ---- the movable icons: pointer drag with capture ---- */

  const onCellPointerDown = (app: DesktopApp, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    if (event.ctrlKey || event.metaKey) toggleSelect(app.id);
    else if (!selection.has(app.id)) selectOnly(app.id);
    const cellRect = event.currentTarget.getBoundingClientRect();
    dragRef.current = {
      appId: app.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      grabX: event.clientX - (cellRect.left + cellRect.width / 2),
      grabY: event.clientY - (cellRect.top + cellRect.height / 2),
      moved: false,
      openable: !event.ctrlKey && !event.metaKey && !event.shiftKey,
      desktopRect: desktopRef.current?.getBoundingClientRect() ?? null,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onCellPointerMove = (app: DesktopApp, event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || drag.appId !== app.id) return;
    if (!drag.moved) {
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < DRAG_THRESHOLD) return;
      drag.moved = true;
      event.currentTarget.dataset.dragging = "true";
    }
    const rect = drag.desktopRect;
    if (!rect) return;
    // the icon follows the pointer live (clamped); the release snaps it
    const centerLeft = event.clientX - drag.grabX - rect.left;
    const centerTop = event.clientY - drag.grabY - rect.top;
    const spot = clampSpot({ x: (centerLeft / rect.width) * 100, y: (centerTop / rect.height) * 100 }, currentBounds());
    event.currentTarget.style.left = `${spot.x}%`;
    event.currentTarget.style.top = `${spot.y}%`;
  };

  const onCellPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.removeAttribute("data-dragging");
    if (!drag.moved) {
      // the single plain click opens the app (the drag threshold already
      // separates a tap from a move; modifiers keep their select-only role)
      if (drag.openable && event.button === 0) {
        const app = apps.find((candidate) => candidate.id === drag.appId);
        if (app) onOpen(app);
      }
      return;
    }
    const rect = drag.desktopRect;
    if (!rect) return;
    const cellRect = event.currentTarget.getBoundingClientRect();
    const spot = fitSpot(
      {
        x: ((cellRect.left + cellRect.width / 2 - rect.left) / rect.width) * 100,
        y: ((cellRect.top + cellRect.height / 2 - rect.top) / rect.height) * 100,
      },
      currentBounds(),
    );
    event.currentTarget.style.left = `${spot.x}%`;
    event.currentTarget.style.top = `${spot.y}%`;
    commitOverrides({ ...overrides, [drag.appId]: spot });
  };

  const onCellPointerCancel = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.removeAttribute("data-dragging");
  };

  /* ---- the keyboard: nudge, open, clear ---- */

  const onCellKeyDown = (app: DesktopApp, event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(app);
      return;
    }
    if (event.key === "Escape") {
      clearSelection();
      return;
    }
    // Shift+F10 / the menu key open the cell menu at the cell (keyboard parity)
    if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      if (!selection.has(app.id)) selectOnly(app.id);
      setMenu({ kind: "cell", appId: app.id, x: rect.left + rect.width / 2, y: rect.bottom });
      return;
    }
    const delta =
      event.key === "ArrowLeft"
        ? { x: -SNAP_STEP_X, y: 0 }
        : event.key === "ArrowRight"
          ? { x: SNAP_STEP_X, y: 0 }
          : event.key === "ArrowUp"
            ? { x: 0, y: -SNAP_STEP_Y }
            : event.key === "ArrowDown"
              ? { x: 0, y: SNAP_STEP_Y }
              : null;
    if (!delta) return;
    event.preventDefault();
    // the focused cell leads; the whole selection moves with it
    const targets = selection.has(app.id) ? [...selection] : [app.id];
    if (!selection.has(app.id)) selectOnly(app.id);
    const bounds = currentBounds();
    const next: IconSpotMap = { ...overrides };
    for (const id of targets) {
      const base = spots[id] ?? { x: 50, y: 50 };
      next[id] = fitSpot({ x: base.x + delta.x, y: base.y + delta.y }, bounds);
    }
    commitOverrides(next);
  };

  /* ---- the empty desktop: marquee selection ---- */

  const onDesktopPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const target = event.target as Element;
    // cells handle their own press; the menus own their pointer entirely
    if (target.closest(".dsk-cell") || target.closest(".dsk-menu")) return;
    if (menu) setMenu(null);
    if (selection.size) clearSelection();
    marqueeDragRef.current = {
      pointerId: event.pointerId,
      x0: event.clientX,
      y0: event.clientY,
      moved: false,
      desktopRect: desktopRef.current?.getBoundingClientRect() ?? null,
      hits: new Set<string>(),
    };
    setMarquee({ x0: event.clientX, y0: event.clientY, x1: event.clientX, y1: event.clientY, hits: new Set() });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onDesktopPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const state = marqueeDragRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    if (!state.moved) {
      if (Math.hypot(event.clientX - state.x0, event.clientY - state.y0) < MARQUEE_THRESHOLD) return;
      state.moved = true;
    }
    const rect = state.desktopRect;
    if (!rect) return;
    const band = {
      left: Math.min(state.x0, event.clientX),
      top: Math.min(state.y0, event.clientY),
      right: Math.max(state.x0, event.clientX),
      bottom: Math.max(state.y0, event.clientY),
    };
    const hits = new Set<string>();
    desktopRef.current?.querySelectorAll<HTMLElement>(".dsk-cell[data-app-id]").forEach((cell) => {
      const id = cell.dataset.appId;
      if (!id) return;
      const cellRect = cell.getBoundingClientRect();
      const intersects =
        cellRect.left < band.right &&
        cellRect.right > band.left &&
        cellRect.top < band.bottom &&
        cellRect.bottom > band.top;
      if (intersects) hits.add(id);
    });
    state.hits = hits;
    setMarquee({ x0: state.x0, y0: state.y0, x1: event.clientX, y1: event.clientY, hits });
  };

  const onDesktopPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const state = marqueeDragRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    marqueeDragRef.current = null;
    if (state.moved && state.hits.size) setSelection(new Set(state.hits));
    setMarquee(null);
  };

  const onDesktopPointerCancel = () => {
    marqueeDragRef.current = null;
    setMarquee(null);
  };

  /* ---- the context menus ---- */

  const onDesktopContextMenu = (event: ReactMouseEvent<HTMLElement>) => {
    const target = event.target as Element;
    // a right-press inside an open menu never re-opens or replaces it
    if (target.closest(".dsk-menu")) return;
    event.preventDefault();
    const cell = target.closest<HTMLElement>(".dsk-cell[data-app-id]");
    const appId = cell?.dataset.appId;
    if (appId) {
      if (!selection.has(appId)) selectOnly(appId);
      setMenu({ kind: "cell", appId, x: event.clientX, y: event.clientY });
      return;
    }
    setMenu({ kind: "desktop", x: event.clientX, y: event.clientY });
  };

  /** "Open in new window" — only the targets that answer a browser window */
  const supportsNewWindow = (app: DesktopApp): boolean =>
    app.target.kind === "route" || app.target.kind === "external" || app.target.kind === "os";

  const openInNewWindow = (app: DesktopApp) => {
    if (app.target.kind === "route") window.open(app.target.href, "_blank", "noopener,noreferrer");
    if (app.target.kind === "external") window.open(familyurl(app.target.slug), "_blank", "noopener,noreferrer");
    /* an internal clone still carries its family site: the app id IS the slug */
    if (app.target.kind === "os" && app.target.app)
      window.open(familyurl(app.target.app), "_blank", "noopener,noreferrer");
  };

  /** "Open in OS": seeds the /os view with the app and navigates there */
  const openInOs = (app: DesktopApp) => {
    if (app.target.kind !== "os") return;
    seedOsView(app.target.app);
    if (onNavigate) {
      onNavigate("/os");
      return;
    }
    navigate("/os");
  };

  /** clears the storage and returns every icon to its original spot */
  const resetLayout = () => {
    clearIconSpots();
    setOverrides({});
  };

  /** recomputes an ordered column-flow layout over the sorted catalog */
  const applySort = (order: "name" | "kind" | "original") => {
    if (order === "original") {
      resetLayout();
      return;
    }
    const sortable = apps.map((app) => ({ id: app.id, name: app.name, kind: app.target.kind }));
    const sorted = order === "name" ? sortAppsByName(sortable) : sortAppsByKind(sortable);
    commitOverrides(flowLayoutSpots(sorted, currentBounds()));
  };

  /** refresh: every stored spot re-clamps into the current desktop bounds
   * and the stagger intro replays (skipped under reduced motion) */
  const refreshLayout = () => {
    const bounds = currentBounds();
    const next: IconSpotMap = {};
    for (const [id, spot] of Object.entries(overrides)) next[id] = fitSpot(spot, bounds);
    commitOverrides(next);
    if (!reduced) setRefreshNonce((nonce) => nonce + 1);
  };

  const openDisplaySettings = () => {
    if (onNavigate) {
      onNavigate("/settings");
      return;
    }
    navigate("/settings");
  };

  const desktopMenuEntries = (): MenuEntry[] => [
    {
      kind: "submenu",
      id: "view",
      label: "View",
      items: [
        {
          kind: "item",
          id: "view-medium",
          label: "medium icons",
          shortcut: iconSize === "medium" ? "●" : undefined,
          onSelect: () => setIconSize("medium"),
        },
        {
          kind: "item",
          id: "view-large",
          label: "large icons",
          shortcut: iconSize === "large" ? "●" : undefined,
          onSelect: () => setIconSize("large"),
        },
        { kind: "sep", id: "view-sep" },
        { kind: "item", id: "view-reset", label: "reset layout", onSelect: resetLayout },
      ],
    },
    {
      kind: "submenu",
      id: "sort",
      label: "Sort by",
      items: [
        { kind: "item", id: "sort-name", label: "name", onSelect: () => applySort("name") },
        { kind: "item", id: "sort-kind", label: "kind", onSelect: () => applySort("kind") },
        { kind: "item", id: "sort-original", label: "original spots", onSelect: () => applySort("original") },
      ],
    },
    { kind: "sep", id: "desktop-sep" },
    { kind: "item", id: "refresh", label: "Refresh", onSelect: refreshLayout },
    { kind: "item", id: "display-settings", label: "Display settings", onSelect: openDisplaySettings },
  ];

  const cellMenuEntries = (app: DesktopApp): MenuEntry[] => {
    const entries: MenuEntry[] = [{ kind: "item", id: "open", label: "Open", onSelect: () => onOpen(app) }];
    if (app.target.kind === "os") {
      entries.push({ kind: "item", id: "open-os", label: "Open in OS", onSelect: () => openInOs(app) });
    }
    if (supportsNewWindow(app)) {
      entries.push({
        kind: "item",
        id: "open-window",
        label: "Open in new window",
        onSelect: () => openInNewWindow(app),
      });
    }
    entries.push({ kind: "sep", id: "cell-sep" });
    entries.push({ kind: "label", id: "props-name", label: app.name });
    entries.push({ kind: "item", id: "props-detail", label: app.detail, disabled: true });
    return entries;
  };

  /** the open menu target: the app of a cell menu, if it still resolves */
  const menuApp = menu?.kind === "cell" ? (apps.find((candidate) => candidate.id === menu.appId) ?? null) : null;

  /* ---- the render ---- */

  /** the rubber band geometry, in desktop coordinates, clamped to the area */
  const marqueeGeometry = (() => {
    if (!marquee) return null;
    const rect = marqueeDragRef.current?.desktopRect;
    if (!rect || !marqueeDragRef.current?.moved) return null;
    const left = clampNumber(Math.min(marquee.x0, marquee.x1) - rect.left, 0, rect.width);
    const top = clampNumber(Math.min(marquee.y0, marquee.y1) - rect.top, 0, rect.height);
    const right = clampNumber(Math.max(marquee.x0, marquee.x1) - rect.left, 0, rect.width);
    const bottom = clampNumber(Math.max(marquee.y0, marquee.y1) - rect.top, 0, rect.height);
    return { left, top, width: right - left, height: bottom - top };
  })();

  return (
    <section
      ref={desktopRef}
      className="dt-desktop absolute inset-0 overflow-hidden"
      aria-label="DevThink desktop"
      onPointerDown={onDesktopPointerDown}
      onPointerMove={onDesktopPointerMove}
      onPointerUp={onDesktopPointerUp}
      onPointerCancel={onDesktopPointerCancel}
      onContextMenu={onDesktopContextMenu}
    >
      {/* the atmosphere bed: the radial light recipe stays the stylesheet's
          (the C1/C2 grain + halftone textures read this hook) */}
      <div className="dt-desktop__light" aria-hidden="true" />
      {/* the one mark of the desktop zone: the hero lockup (mark + wordmark + tagline) is the single sanctioned brand expression */}
      <div className="dt-desktop__hero absolute top-[45%] left-1/2 grid -translate-x-1/2 -translate-y-1/2 animate-hero pointer-events-none justify-items-center gap-2.5 text-[#eef1f7] transition-[opacity] duration-[480ms] ease-window light:text-[#1a1a1a] max-[760px]:top-[34%]">
        {/* the one amber focus of the desktop zone: the Sol signal lives in
            the mark's star core (the active pin bar carries the other) */}
        <span className="block [&_svg]:block [&_svg]:h-auto [&_svg]:w-[clamp(116px,17vmin,158px)] max-[760px]:[&_svg]:w-[104px] [&_svg]:[filter:drop-shadow(0_18px_48px_rgb(0_0_0/55%))_drop-shadow(0_0_44px_rgb(231_233_238/16%))] light:[&_svg]:[filter:none]">
          <SolLogoMark size={150} title="DevThink" accent />
        </span>
        <strong className="dt-desktop__wordmark mt-1.5 font-display text-[clamp(22px,2.8vw,30px)] leading-none font-bold tracking-[-0.02em] lowercase text-[#f3f5fa] [text-shadow:0_2px_18px_rgb(0_0_0/55%)] light:text-[#1a1a1a] light:[text-shadow:none]">
          DevThink
        </strong>
        <span className="dt-desktop__tagline font-mono text-[10px] font-medium tracking-[.08em] indent-[.08em] lowercase text-[rgb(235_240_248/58%)] light:text-[rgb(0_0_0/60%)]">
          local OS · chat first
        </span>
      </div>
      <div
        key={refreshNonce}
        className="dt-desktop__field absolute inset-0 max-[760px]:inset-auto max-[760px]:right-[10px] max-[760px]:bottom-[96px] max-[760px]:left-[10px] max-[760px]:flex max-[760px]:flex-wrap max-[760px]:content-end max-[760px]:justify-center max-[760px]:gap-x-1.5"
        data-icons={iconSize}
      >
        {apps.map((app, index) => {
          const spot = spots[app.id] ?? defaults[app.id];
          if (!spot) return null;
          const selected = selection.has(app.id);
          return (
            <button
              key={app.id}
              type="button"
              className="dt-appicon absolute grid -translate-x-1/2 -translate-y-1/2 animate-appicon-in justify-items-center content-center gap-1.5 w-[74px] min-h-[84px] px-1 pt-2 pb-2.5 rounded-xs border border-dotted border-transparent bg-transparent text-inherit transition-[background-color,border-color] duration-200 ease-in-out hover:bg-white/12 focus:bg-white/24 focus:border-white/85 focus:outline-none focus-visible:outline-none active:[&_.dt-tile]:scale-70 active:[&_.dt-tile]:duration-100 hover:[&_.dt-tile]:shadow-[inset_0_1px_0_rgb(255_255_255/15%),inset_0_-1px_0_rgb(0_0_0/24%),0_2px_4px_rgb(0_0_0/32%),0_14px_28px_-8px_rgb(0_0_0/46%),0_6px_18px_-4px_color-mix(in_srgb,var(--app-tint,#dfe5ee)_34%,transparent)] focus:[&_.dt-tile]:shadow-[inset_0_1px_0_rgb(255_255_255/15%),inset_0_-1px_0_rgb(0_0_0/24%),0_2px_4px_rgb(0_0_0/32%),0_14px_28px_-8px_rgb(0_0_0/46%),0_6px_18px_-4px_color-mix(in_srgb,var(--app-tint,#dfe5ee)_34%,transparent)] [&_.dt-tile]:h-[46px] [&_.dt-tile]:w-[46px] data-[selected=true]:bg-white/14 data-[selected=true]:border-white/55 data-[selected=true]:shadow-none data-[marquee=true]:bg-white/12 data-[marquee=true]:shadow-none data-[dragging=true]:z-10 data-[dragging=true]:scale-[1.04] data-[dragging=true]:opacity-75 data-[dragging=true]:transition-[background-color,border-color] light:hover:bg-black/8 light:focus:bg-black/10 light:focus:border-black/60 light:data-[selected=true]:bg-black/8 light:data-[selected=true]:border-black/55 max-[760px]:static max-[760px]:w-auto max-[760px]:min-h-0 max-[760px]:animate-none"
              data-app-id={app.id}
              data-selected={selected ? "true" : undefined}
              data-marquee={marquee?.hits.has(app.id) ? "true" : undefined}
              aria-pressed={selected}
              tabIndex={0}
              style={
                {
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  animationDelay: reduced ? undefined : `${Math.min(index * 70, 630)}ms`,
                } as CSSProperties
              }
              onPointerDown={(event) => onCellPointerDown(app, event)}
              onPointerMove={(event) => onCellPointerMove(app, event)}
              onPointerUp={onCellPointerUp}
              onPointerCancel={onCellPointerCancel}
              onKeyDown={(event) => onCellKeyDown(app, event)}
            >
              <AppTile app={app} size={26} />
              <span className="dt-appicon__label line-clamp-2 max-w-full text-center font-sans text-xs leading-[1.3] font-semibold tracking-[.01em] text-[#fafafa] [text-shadow:0_0_3px_rgb(0_0_0/51%),0_0_3px_rgb(0_0_0/51%),0_0_4px_rgb(0_0_0/60%)] light:text-[#1a1a1a] light:[text-shadow:0_0_3px_rgb(255_255_255/70%),0_0_4px_rgb(255_255_255/80%)]">
                {app.name}
              </span>
            </button>
          );
        })}
      </div>
      {marqueeGeometry && (
        <div
          className="pointer-events-none absolute border border-dotted border-[rgb(231_233_238/80%)] bg-[rgb(231_233_238/12%)]"
          aria-hidden="true"
          style={{
            left: `${marqueeGeometry.left}px`,
            top: `${marqueeGeometry.top}px`,
            width: `${marqueeGeometry.width}px`,
            height: `${marqueeGeometry.height}px`,
          }}
        />
      )}
      {menu && menu.kind === "desktop" && (
        <DesktopMenu
          key={`dsk-menu-desktop-${menu.x}-${menu.y}`}
          x={menu.x}
          y={menu.y}
          entries={desktopMenuEntries()}
          onClose={() => setMenu(null)}
        />
      )}
      {menu && menu.kind === "cell" && menuApp && (
        <DesktopMenu
          key={`dsk-menu-cell-${menuApp.id}-${menu.x}-${menu.y}`}
          x={menu.x}
          y={menu.y}
          entries={cellMenuEntries(menuApp)}
          onClose={() => setMenu(null)}
        />
      )}
    </section>
  );
}
