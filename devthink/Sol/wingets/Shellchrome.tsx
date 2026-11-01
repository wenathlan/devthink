/**
 * ShellChrome.tsx — the ONE chrome of the Sol shell, shared by every page of
 * the theme (the desktop workspace and the control pages alike): the shell
 * bar of the two modes the owner ordered — FLOATING (the detached rounded
 * pad, the magnifying dock the GSAP gaussian bump rides) and DOCKED (the
 * bar pinned to one screen edge: the bottom taskbar or the 48px side rail)
 * over the .acrylic-bar surface (rgba(32,32,32,.75) + saturate(3) blur(20px)
 * + grain) and a dark top hairline. The mode rides the account store (the
 * system preference lane of storage.ts — never a browser localStorage key of
 * this build) and the drag gestures move it live: pulling the bar up floats
 * it, pulling it sideways docks it to that edge, and pulling a docked bar
 * off its wall (~1mm) floats it again with the rounded corners back
 * (desktopstate.ts owns the pure verdict). The official DevThink mark opens
 * the centered cluster and IS the
 * Start trigger (no labeled start button, no brand text); the pinned apps
 * follow as 38×38 r4 icon FACES inside 44px hit cells — the face is the
 * Windows button, the cell is the touch target (the ≥44px rule): hover wash
 * rgba(255,255,255,.1) in 200ms, press scale(.7) in 100ms, the 800ms popintro
 * spawn bounce, and NO visible names — the name surfaces in the .dt-nav__tip
 * acrylic tooltip above the icon (fade + slide 200ms, Windows peek
 * semantics). The open/active ladder rides the cell itself: an inline ::after
 * (3px, 0 closed) reads data-open="true" (6px neutral) and data-active="true"
 * (12px accent) off the cell — the component owns it because the stylesheet
 * moved every chrome paint into the components (task 3-a). Right-click opens
 * the jump list (Sol/shell/
 * jumpmenu.tsx); the pin order persists in localStorage "dt.taskbar.pins.v1".
 * Every pin carries data-dock-target, so a minimizing family window flies
 * into it (the WindowFrame measures the cell and the stylesheet plays the
 * 250ms Fluent window curve). The tray cluster opens QuickSettings and the
 * clock opens the Calendar (Sol/shell/trayflyouts.tsx — the .dt-flyout 360px
 * r8 panels entering on the 250ms cubic-bezier(.62,0,.32,1) tray curve); the
 * clock reads two 11px tabular-nums lines, and the calendar accompanies the
 * dock — while the pad floats the flyout rides the measured clock anchor.
 * Clicking the mark opens the Start
 * menu: a 640px centered acrylic panel rising from the bottom taskbar with
 * 8px corners carrying the search
 * box and the pinned grid of the desktop app catalog (Sol/shell/
 * appregistry.ts) — the entrance rises translateY(100px)→0 in 200ms on
 * cubic-bezier(.79,.14,.15,.86) and the exit is REAL: the mount state keeps
 * the open panel in the DOM through a 220ms timer before it unmounts. The
 * menu carries the win11 face in full: the Pinned bar with the All apps
 * chip, the 96×84 six-column tile grid, the Recommended rows (56px, icon +
 * name + the relative open time pulled from the recent-entries store —
 * never a fixed word), the All apps page sliding in on the 300ms
 * cubic-bezier(0,.58,.42,1) page curve with the alphabet jump rail, and the
 * 64px footer with the account profile (the display name of the account
 * store) and the power corner (lock, shut down, restart). The docked
 * bottom taskbar carries the widgets trigger at its left edge (the
 * doctrine maps the widgets board onto the explore surface) and the search
 * trigger beside the mark (it opens the menu and seats the caret in the
 * search box). Every
 * flyout — start, quick settings, calendar, jump list — shares ONE mount
 * state (at most one is in the DOM), closes on Escape and on any press
 * outside a flyout or trigger, and skips its transitions entirely under
 * `prefers-reduced-motion`. Keyboard focus answers the campaign rule: a 2px
 * accent underline (inset box-shadow), never a halo. The night light and
 * brightness controls of the tray drive two fixed, pointer-events-none,
 * removable screen overlays and their --tray-night / --tray-dim tokens —
 * session-only and reversible.
 */

import {
  ChevronLeftRegular as ChevronLeft,
  ChevronRightRegular as ChevronRight,
  LockClosedRegular as Lock,
  PowerRegular as Power,
  ArrowClockwiseRegular as Restart,
  SearchRegular as Search,
  Wifi1Regular as Wifi,
  DismissRegular as X,
} from "@fluentui/react-icons";
import { type CSSProperties, type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DESKTOP_APPS, type DesktopApp, PINNED_APPS, searchDesktopApps } from "../../appregistry.ts";
import {
  isNavbarEdge,
  isNavbarMode,
  loadNavbarEdge,
  loadNavbarMode,
  NAVBAR_EDGE_EVENT,
  NAVBAR_MODE_EVENT,
  type NavbarEdge,
  type NavbarMode,
  navbarDragVerdict,
  saveNavbarEdge,
  saveNavbarMode,
} from "../../desktopstate";
import { osText } from "../../oslabels.ts";
import { loadrecententries, pushrecentapp, type RecentEntry } from "../../recentapps.ts";
import { readBrowserPreferences } from "../../storage.ts";
import { uicopy, useUicopy } from "../../uistore.ts";
import { SolLogoMark } from "./PanelLogo.tsx";
import { AppTile } from "./ShellApptile.tsx";
import { useDockMagnification } from "./ShellDockmagnify.tsx";
import { JumpList, loadTaskbarPins, saveTaskbarPins } from "./ShellJumpmenu.tsx";
import {
  CalendarFlyout,
  DEFAULT_TRAY_SETTINGS,
  QuickSettings,
  type TraySettings,
  useReducedMotion,
} from "./ShellTrayflyouts.tsx";

/** the default apps pinned to the bottom bar: the essential surfaces as
 * icons only — every other app of the catalog lives in the Start menu grid
 * ("panel" is the creation panel, the OS desktop itself, at /panel; the
 * indirect apps — intro, auth, explore — are never pins) */
const TASKBAR_PIN_IDS = ["panel", "chat", "console", "gateway", "docs"];

/** the 27 buckets of the All apps page: the "#" slot for the non-letter
 * names, then A–Z — the win11React contApps ladder */
const ALPHA_SLOTS: readonly string[] = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

/** the stable keys of the pinned-grid padding faces (six is the most a
 * six-wide row ever needs) */
const BLANK_SLOTS: readonly string[] = ["blank-0", "blank-1", "blank-2", "blank-3", "blank-4", "blank-5"];

/** groups the catalog by the first letter of the display name (A–Z, the
 * non-letter names ride "#"): the All apps page renders one section per
 * bucket under its letter header */
const ALPHA_GROUPS: ReadonlyMap<string, DesktopApp[]> = (() => {
  const groups = new Map<string, DesktopApp[]>();
  for (const app of [...DESKTOP_APPS].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))) {
    const code = app.name.trim().toUpperCase().charCodeAt(0);
    const letter = code > 64 && code < 91 ? String.fromCharCode(code) : "#";
    const bucket = groups.get(letter);
    if (bucket) bucket.push(app);
    else groups.set(letter, [app]);
  }
  return groups;
})();

/** the widgets glyph: the three-pane board the widgets button rides (a
 * fluent-style inline path, fill currentColor — the system icon law) */
function WidgetsGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.75 3h6.5A1.75 1.75 0 0 1 12 4.75v14.5A1.75 1.75 0 0 1 10.25 21h-6.5A1.75 1.75 0 0 1 2 19.25V4.75A1.75 1.75 0 0 1 3.75 3Z" />
      <path d="M15.25 3h5A1.75 1.75 0 0 1 22 4.75v4.5A1.75 1.75 0 0 1 20.25 11h-5A1.75 1.75 0 0 1 14 9.25v-4.5A1.75 1.75 0 0 1 15.75 3Z" />
      <path d="M15.25 13h5A1.75 1.75 0 0 1 22 14.75v4.5A1.75 1.75 0 0 1 20.25 21h-5A1.75 1.75 0 0 1 14 19.25v-4.5A1.75 1.75 0 0 1 15.75 13Z" />
    </svg>
  );
}

/** the relative open time of one recommended row — the win11 ladder (under
 * ten minutes reads "just now", then minutes, then hours; past six hours
 * or before the timestamp lane the line hides) */
function recentagelabel(at: number): string {
  if (!at) return "";
  const minutes = Math.floor((Date.now() - at) / 60_000);
  if (minutes < 10) return uicopy("shell.start.recent.now");
  if (minutes < 60) return uicopy("shell.start.recent.minutes").replace("{n}", String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 6) return uicopy("shell.start.recent.hours").replace("{n}", String(hours));
  return "";
}

/** the 44px hit cell of one taskbar button: the cell is the touch target and
 * the ::after open/active ladder anchor (the component owns the ladder — the
 * 3px bar reads data-open/data-active off the cell, 6px open, 12px accent);
 * the 38×38 r4 Windows face rides inside as the visual button */
const BAR_CELL_CLASS =
  "group relative flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-xs border-0 bg-transparent p-0 focus-visible:outline-none after:absolute after:bottom-0 after:content-[''] after:block after:h-[3px] after:w-0 after:rounded-xs after:bg-[#858585] after:transition-[width,background-color] after:duration-200 data-[open=true]:after:w-1.5 data-[active=true]:after:w-3 data-[active=true]:after:bg-(--color-win)";

/** the 38×38 r4 Windows face: hover wash rgba(255,255,255,.1) dark /
 * rgba(255,255,255,.67) light (the --bg2 pair of the taskbar doctrine) in
 * 200ms, the popintro spawn bounce, press scale(.7) in 100ms and the 2px
 * accent focus underline (the campaign focus rule — an inset box-shadow,
 * never a halo); the app tile rides as the proven 26px r5 face fill (no
 * second shadow — the face owns the shadow grammar of the bar) */
const BAR_FACE_CLASS =
  "dt-nav__app-face grid h-[38px] w-[38px] place-items-center rounded-xs transition-[background-color,transform] duration-200 animate-popintro group-hcf:bg-white/10 light:group-hcf:bg-white/67 group-active:scale-[0.7] group-active:duration-100 group-focus-visible:shadow-[inset_0_-2px_0_var(--color-win)] [&_.dt-tile]:h-[26px] [&_.dt-tile]:w-[26px] [&_.dt-tile]:rounded-sm [&_.dt-tile]:shadow-none";

/** the app-name peek: acrylic above the cell, cleared of the bar (Windows
 * tooltip semantics, name only — the aria-label already carries the name);
 * the 1000ms hover delay is the Windows tooltip pause, the reveal itself is
 * the 200ms fade + slide (the delay rides only the hovered state, so the
 * leave hides instantly) */
const BAR_TIP_CLASS =
  "dt-nav__tip acrylic-tip pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-[1] -translate-x-1/2 translate-y-[4px] rounded-xs px-[9px] py-[5px] font-sans text-xs font-medium whitespace-nowrap text-[#fafafa] opacity-0 transition-[opacity,transform] duration-200 group-hcf:translate-y-0 group-hcf:opacity-100 group-hcf:delay-[1000ms] light:border-black/12 light:text-[#1a1a1a]";

/** the win11 start-menu section bar: the Pinned/Recommended header with its
 * chip button (the stAcbar grammar — 14px medium name, the 10px chip with
 * the 4px corners and the 1px-ish drop) */
const START_ACBAR_CLASS = "mx-8 flex flex-none items-center justify-between";
const START_GPNAME_CLASS = "m-0 text-sm font-medium text-ink";
const START_GPBTN_CLASS =
  "inline-flex cursor-pointer items-center gap-1 rounded-xs bg-white/10 px-2 py-0.5 text-[10px] font-medium text-ink-2 shadow-[1px_1px_2px_rgb(34_34_34/25%)] transition-colors duration-100 hover:bg-white/16 hover:text-ink light:bg-white/90 light:text-[#1a1a1a] light:shadow-[1px_1px_2px_rgb(34_34_34/15%)] light:hover:bg-white light:hover:text-[#1a1a1a]";
/** the shared hover/focus wash of the menu rows: 100ms ease-in-out, the
 * --bg2 pair of the doctrine (white/10 dark, white/90 light) */
const START_ROW_HOVER =
  "transition-colors duration-100 ease-in-out hover:bg-white/10 light:hover:bg-white/90 focus-visible:shadow-[inset_0_-2px_0_var(--color-win)] focus-visible:outline-none";
/** the 96×84 tile of the pinned grid and the results grid (the pnApp cell:
 * the 32px tile, the 12px name, the 4px corners) */
const START_TILE_CLASS = `dt-start__app flex h-[84px] cursor-pointer flex-col items-center justify-center rounded-xs border-0 bg-transparent pt-2 text-ink [&_.dt-tile]:h-8 [&_.dt-tile]:w-8 [&_.dt-tile]:rounded-sm [&_.dt-tile]:shadow-none ${START_ROW_HOVER}`;
/** the 56px recommended row (the rnApp cell: icon + name + time used) */
const START_RECENT_CLASS = `flex h-14 w-[calc(50%-10px)] cursor-pointer items-center rounded-xs border-0 bg-transparent p-0 text-left text-ink ${START_ROW_HOVER}`;
/** the 42px row of the All apps page (the allApp cell: 24px icon + 12px
 * name, the letter headers share the height) */
const START_ALLROW_CLASS = `flex h-[42px] w-full cursor-pointer items-center rounded-xs border-0 bg-transparent pl-3 text-left text-ink ${START_ROW_HOVER}`;

/** the one shell flyout surface: at most one of these is open (and mounted) */
type PanelState =
  | { kind: "start" }
  | { kind: "quick" }
  | { kind: "calendar" }
  | { kind: "jump"; app: DesktopApp; x: number; y: number };

type ShellChromeProps = {
  /** shows the gateway state pill in the tray (the desktop workspace passes it) */
  paired?: boolean;
  /** the paired public user id shown in the gateway pill */
  userId?: string;
  /** desktop override: the workspace opens windows and destinations in place */
  onOpenApp?: (app: DesktopApp) => void;
  /** the ids of the desktop windows that exist right now (open or minimized) —
   * a window-target pin rides this to show its open ladder on the bar */
  openApps?: string[];
};

/** formats the local machine clock for the tray: time over date, the two-line
 * Windows tray clock (tabular numerals) */
function formatClock(date: Date): { time: string; date: string } {
  return {
    time: new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
    date: new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date),
  };
}

/** the tray clock, refreshed twice a minute */
function useTrayClock(): { time: string; date: string } {
  const [clock, setClock] = useState(() => formatClock(new Date()));
  useEffect(() => {
    const tick = window.setInterval(() => setClock(formatClock(new Date())), 30_000);
    return () => window.clearInterval(tick);
  }, []);
  return clock;
}

/**
 * The start-mark draw (campaign v3 · R1-b): the DevThink mark draws itself
 * once when the shell mounts — the official paths measure themselves
 * (getTotalLength), render as a stroke-only outline via stroke-dasharray and
 * draw on through stroke-dashoffset, then the fill fades back in and the
 * stroke hands over — the mark ends exactly as it renders natively. Purely
 * presentational: no aria, no handlers, no layout; skipped entirely under
 * reduced motion and restored on unmount.
 */
function useStartMarkDraw(reduced: boolean): RefObject<HTMLButtonElement | null> {
  const ref = useRef<HTMLButtonElement | null>(null);
  useLayoutEffect(() => {
    const button = ref.current;
    if (!button || reduced) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const paths = Array.from(button.querySelectorAll<SVGPathElement>(".sol-logo__core, .sol-logo__frame"));
    if (paths.length === 0) return undefined;
    const lengths = paths.map((path) => {
      try {
        return path.getTotalLength();
      } catch {
        return 0;
      }
    });
    if (lengths.some((length) => !(length > 0))) return undefined;
    paths.forEach((path, index) => {
      path.style.setProperty("--mark-l", `${Math.ceil(lengths[index])}`);
    });
    button.setAttribute("data-mark-draw", "true");
    const play = window.requestAnimationFrame(() => {
      button.setAttribute("data-mark-play", "true");
    });
    const settle = window.setTimeout(() => {
      button.removeAttribute("data-mark-draw");
      button.removeAttribute("data-mark-play");
      for (const path of paths) path.style.removeProperty("--mark-l");
    }, 2400);
    return () => {
      window.cancelAnimationFrame(play);
      window.clearTimeout(settle);
      button.removeAttribute("data-mark-draw");
      button.removeAttribute("data-mark-play");
      for (const path of paths) path.style.removeProperty("--mark-l");
    };
  }, [reduced]);
  return ref;
}

export function ShellChrome({ paired, userId, onOpenApp, openApps = [] }: ShellChromeProps) {
  const [location, navigate] = useLocation();
  const reduced = useReducedMotion();
  // the store ride: the live ui rows land once per mount (the drag hint and
  // the other shell words answer the db when the platform answered)
  useUicopy();
  /** the flyout kept in the DOM (through its exit transition) */
  const [mountedPanel, setMountedPanel] = useState<PanelState | null>(null);
  /** the flyout currently visible (null while exiting) */
  const [openPanel, setOpenPanel] = useState<PanelState | null>(null);
  const [query, setQuery] = useState("");
  const [pins, setPins] = useState<string[]>(() => loadTaskbarPins(TASKBAR_PIN_IDS));
  /** the recently opened apps behind the Start menu recommended rail (the
   * entries carry the open epoch the timeUsed line formats) */
  const [recents, setRecents] = useState<RecentEntry[]>(() => loadrecententries());
  /** the All apps page of the start menu (the win11 showAll face) */
  const [showAll, setShowAll] = useState(false);
  /** the power corner flyout of the start menu footer */
  const [powerOpen, setPowerOpen] = useState(false);
  /** the display name of the account (the start menu profile cell) */
  const [userName, setUserName] = useState("");
  /** a search-trigger press waits for the menu mount, then seats the caret */
  const pendingSearch = useRef(false);
  const [tray, setTray] = useState<TraySettings>(DEFAULT_TRAY_SETTINGS);
  /** the navbar mode the account store persisted — floating (the detached
   * rounded pad, the magnifying dock) or docked (the bar pinned to one
   * screen edge); the store answers async after mount, the dt-navbar-mode
   * event re-faces the bar the moment a choice or a drag lands */
  const [navbarMode, setNavbarMode] = useState<NavbarMode>("floating");
  /** the screen edge the docked bar hugs (bottom, the full-width taskbar
   * edge, by default; left and right fold the 48px rail) */
  const [navbarEdge, setNavbarEdge] = useState<NavbarEdge>("bottom");
  const rail = navbarMode === "docked" && navbarEdge !== "bottom";
  const searchRef = useRef<HTMLInputElement | null>(null);
  /** the scrolling list of the All apps page (the alphabet jump rail target) */
  const allListRef = useRef<HTMLDivElement | null>(null);
  const exitTimer = useRef<number | null>(null);
  const mountedKindRef = useRef<PanelState["kind"] | null>(null);
  const startRef = useStartMarkDraw(reduced);
  const { time, date } = useTrayClock();
  /** the bar cluster: the magnification surface and the drag stage */
  const clusterRef = useRef<HTMLDivElement | null>(null);
  /** the clock trigger of the tray: the calendar anchor measures it at open */
  const clockRef = useRef<HTMLButtonElement | null>(null);
  /** the horizontal anchor (px) the calendar flyout rides when the pad is
   * floating — measured once at open (the calendar accompanies the dock) */
  const [calendarAnchorX, setCalendarAnchorX] = useState<number | null>(null);
  /** the drag of the bar between its two modes (in flight state) */
  const [barDragging, setBarDragging] = useState(false);
  const dragref = useRef<{ x: number; y: number; done: boolean } | null>(null);
  const swallowClick = useRef(false);

  // the account store answers after mount: the persisted mode and edge
  // land on the bar (the events cover the live choices meanwhile)
  useEffect(() => {
    let alive = true;
    void loadNavbarMode().then((mode) => {
      if (alive) setNavbarMode(mode);
    });
    void loadNavbarEdge().then((edge) => {
      if (alive) setNavbarEdge(edge);
    });
    return () => {
      alive = false;
    };
  }, []);

  // the dock magnification: the gaussian bump rides the floating pad only
  // (the docked bar keeps the flat windows grammar) and dies under reduced
  // motion — the hook owns the gsap tweens and their cleanup
  useDockMagnification({ surfaceRef: clusterRef, enabled: navbarMode === "floating" && !reduced });

  /** applies a drag or settings verdict: the state flips, the choice
   * persists on the account store and the events tell the settings card —
   * the side effects ride the changed values only (the updater stays pure) */
  const applyNavbar = useCallback(
    (next: { mode: NavbarMode; edge: NavbarEdge }) => {
      if (next.mode !== navbarMode) {
        setNavbarMode(next.mode);
        saveNavbarMode(next.mode);
        window.dispatchEvent(new CustomEvent<NavbarMode>(NAVBAR_MODE_EVENT, { detail: next.mode }));
      }
      if (next.edge !== navbarEdge) {
        setNavbarEdge(next.edge);
        saveNavbarEdge(next.edge);
        window.dispatchEvent(new CustomEvent<NavbarEdge>(NAVBAR_EDGE_EVENT, { detail: next.edge }));
      }
    },
    [navbarEdge, navbarMode],
  );

  /** the drag verdicts of the bar: pull up floats it, pull sideways docks
   * the edge, pull a docked bar off its wall (~1mm) floats it again — the
   * drag starts anywhere on the bar and only answers past the thresholds,
   * so the triggers keep their clicks */
  function onBarPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragref.current = { x: event.clientX, y: event.clientY, done: false };
    setBarDragging(true);
  }
  function onBarPointerMove(event: React.PointerEvent<HTMLElement>) {
    const drag = dragref.current;
    if (!drag || drag.done) return;
    const verdict = navbarDragVerdict({ mode: navbarMode, edge: navbarEdge }, event.clientX - drag.x, event.clientY - drag.y);
    if (!verdict) return;
    drag.done = true;
    swallowClick.current = true;
    applyNavbar(verdict);
  }
  function endBarDrag() {
    dragref.current = null;
    setBarDragging(false);
  }

  /** opens one flyout: mounts the panel first and the effect flips the
   * visible state on the next frame, so the enter transition plays; a reopen
   * during the exit shows the still-mounted panel right away; a different
   * kind replaces whatever is open — only one flyout lives at a time */
  function showPanel(next: PanelState) {
    if (exitTimer.current !== null) {
      window.clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
    if (mountedKindRef.current === next.kind) {
      // same surface (e.g. another pin's jump list): refresh the payload in
      // place — the mounted panel repositions without a remount
      setMountedPanel(next);
      setOpenPanel(next);
      return;
    }
    mountedKindRef.current = next.kind;
    if (reduced) {
      // no transition: mount already visible, unmount already instant
      setMountedPanel(next);
      setOpenPanel(next);
      return;
    }
    setMountedPanel(next);
  }

  /** closes the open flyout: the exit transition plays and the panel
   * unmounts once the 220ms Windows transition settles (instantly under
   * reduced motion) — the exit is real, never a conditional unmount */
  const closePanel = useCallback(() => {
    setOpenPanel(null);
    if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    if (reduced) {
      mountedKindRef.current = null;
      setMountedPanel(null);
      return;
    }
    exitTimer.current = window.setTimeout(() => {
      mountedKindRef.current = null;
      setMountedPanel(null);
    }, 220);
  }, [reduced]);

  /** trigger toggles: the open flyout closes (for a jump list that means the
   * same pin's list — another pin's right-click switches to its own),
   * anything else opens */
  function togglePanel(next: PanelState) {
    const same =
      openPanel?.kind === next.kind &&
      (next.kind !== "jump" || openPanel.kind !== "jump" || openPanel.app.id === next.app.id);
    if (same) closePanel();
    else showPanel(next);
  }

  // mounting flips the visible state one frame later (the enter transition)
  useEffect(() => {
    if (!mountedPanel) return undefined;
    const frame = window.requestAnimationFrame(() => setOpenPanel(mountedPanel));
    return () => window.cancelAnimationFrame(frame);
  }, [mountedPanel]);

  // Escape closes whatever flyout is open; a press outside every flyout and
  // trigger (anything not marked data-flyout-keep) closes all of them
  useEffect(() => {
    if (!openPanel) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    const onDown = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("[data-flyout-keep]")) return;
      closePanel();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [closePanel, openPanel]);

  // the exit timer never outlives the chrome
  useEffect(
    () => () => {
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    },
    [],
  );

  // the start search trigger seats the caret once the menu is mounted (the
  // rAF effect above flips the visible state first)
  useEffect(() => {
    if (!pendingSearch.current || openPanel?.kind !== "start") return;
    pendingSearch.current = false;
    setShowAll(false);
    searchRef.current?.focus();
  }, [openPanel]);

  // the account display name feeds the start menu profile cell (the same
  // preference lane the boot face saved — read-only here, never a literal)
  useEffect(() => {
    let alive = true;
    void readBrowserPreferences()
      .then((preferences) => {
        const saved = preferences.displayName?.trim();
        if (alive && saved) setUserName(saved);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // the power corner dies with the menu (a reopened menu opens closed)
  useEffect(() => {
    if (openPanel?.kind !== "start") setPowerOpen(false);
  }, [openPanel]);

  /** the search trigger of the taskbar: the open menu jumps to its search
   * box, a closed one mounts with the caret seated in it */
  function openStartSearch() {
    if (openPanel?.kind === "start") {
      setShowAll(false);
      searchRef.current?.focus();
      return;
    }
    pendingSearch.current = true;
    showPanel({ kind: "start" });
  }

  /** the alphabet jump of the All apps page: the letter button scrolls the
   * list to its section (the win11 STARTALPHA verdict) */
  function jumpToLetter(letter: string) {
    const list = allListRef.current;
    if (!list) return;
    const target = list.querySelector<HTMLElement>(`[data-alpha-letter="${letter === "#" ? "hash" : letter}"]`);
    if (target) list.scrollTop = target.offsetTop;
  }

  // the settings app re-faces the bar live through the navbar mode event
  // (the choice itself persists on the account store)
  useEffect(() => {
    const onNavbarMode = (event: Event) => {
      const detail = (event as CustomEvent<NavbarMode>).detail;
      if (isNavbarMode(detail)) setNavbarMode(detail);
    };
    window.addEventListener(NAVBAR_MODE_EVENT, onNavbarMode);
    return () => window.removeEventListener(NAVBAR_MODE_EVENT, onNavbarMode);
  }, []);

  // the settings app re-docks the bar live through the navbar edge event
  useEffect(() => {
    const onNavbarEdge = (event: Event) => {
      const detail = (event as CustomEvent<NavbarEdge>).detail;
      if (isNavbarEdge(detail)) setNavbarEdge(detail);
    };
    window.addEventListener(NAVBAR_EDGE_EVENT, onNavbarEdge);
    return () => window.removeEventListener(NAVBAR_EDGE_EVENT, onNavbarEdge);
  }, []);

  // the night light token lives on the document root while on, gone when off
  useEffect(() => {
    const root = document.documentElement;
    if (tray.night) root.style.setProperty("--tray-night", "1");
    else root.style.removeProperty("--tray-night");
  }, [tray.night]);

  // the brightness slider writes --tray-dim (0..1): the opacity of the black
  // overlay below (capped so the shell stays reachable)
  const dim = Math.min(0.85, (100 - tray.brightness) / 100);
  useEffect(() => {
    document.documentElement.style.setProperty("--tray-dim", dim.toFixed(2));
  }, [dim]);

  // the chrome never leaves the tray tokens behind (session-only, reversible)
  useEffect(
    () => () => {
      const root = document.documentElement;
      root.style.removeProperty("--tray-night");
      root.style.removeProperty("--tray-dim");
    },
    [],
  );

  const results = searchDesktopApps(query);

  /** the recommended rail: the recent entries mapped onto the catalog (the
   * open epoch rides along for the timeUsed line), only shown while the
   * search box is empty — never a fixed row */
  const recommended = query
    ? []
    : recents
        .map((entry) => {
          const app = DESKTOP_APPS.find((candidate) => candidate.id === entry.id);
          return app ? { app, at: entry.at } : null;
        })
        .filter((row): row is { app: DesktopApp; at: number } => row !== null)
        .slice(0, 6);

  /** the empty cells that pad the pinned grid to full six-wide rows (the
   * win11 pnEmpty faces) */
  const pinnedBlanks = (6 - (PINNED_APPS.length % 6)) % 6;

  /** the taskbar pins in the persisted order (unknown ids drop out) */
  const taskbarPins = pins
    .map((id) => DESKTOP_APPS.find((app) => app.id === id))
    .filter((app): app is DesktopApp => Boolean(app));

  const isActive = (href: string): boolean =>
    href === "/panel"
      ? location === "/panel" || location.startsWith("/w/")
      : location === href || location.startsWith(`${href}/`);

  /** launches one app from the Start menu, taskbar or jump list: the desktop
   * opens it in place, the family deploy units ride their own route (the os
   * opens their power clip window on arrival), every other page navigates to
   * the surface that owns it */
  function openApp(app: DesktopApp) {
    closePanel();
    setQuery("");
    // the open promotes the app to the head of the Start menu recommended
    // rail (both lanes: the id list and the timestamped entries)
    pushrecentapp(app.id);
    setRecents(loadrecententries());
    if (onOpenApp) {
      onOpenApp(app);
      return;
    }
    if (app.target.kind === "route") {
      navigate(app.target.href);
      return;
    }
    if (app.target.kind === "external") {
      navigate(`/${app.target.slug}`);
      return;
    }
    navigate("/panel");
  }

  /** pins or unpins one app on the taskbar; the order persists in
   * localStorage "dt.taskbar.pins.v1" (empty falls back to the defaults) */
  function togglePin(app: DesktopApp) {
    const next = pins.includes(app.id) ? pins.filter((id) => id !== app.id) : [...pins, app.id];
    setPins(next);
    saveTaskbarPins(next);
  }

  function patchTray(patch: Partial<TraySettings>) {
    setTray((prev) => ({ ...prev, ...patch }));
  }

  const jumpPanel = mountedPanel?.kind === "jump" ? mountedPanel : null;

  return (
    <>
      {/* the ONE chrome: the shell bar of the two modes — the floating pad
          (the detached rounded dock the magnification rides) and the docked
          bar pinned to the edge the account store keeps (the bottom taskbar
          or the 48px side rail); the bar is the drag stage of the smart
          gestures: pull it up and it floats, pull it sideways and it docks,
          pull a docked bar off its wall and it floats again */}
      <header
        className="dt-nav acrylic-bar fixed bottom-0 inset-x-0 z-50 flex h-12 min-w-0 items-center border-t border-black/55 px-2"
        data-navmode={navbarMode}
        data-navedge={navbarEdge}
        data-dragging={barDragging ? "true" : undefined}
        aria-description={uicopy("navbar.drag.hint")}
        onPointerDown={onBarPointerDown}
        onPointerMove={onBarPointerMove}
        onPointerUp={endBarDrag}
        onPointerCancel={endBarDrag}
        onPointerLeave={endBarDrag}
        onClickCapture={(event) => {
          // a drag that crossed a threshold swallows the click it ends on —
          // the mode switch is the gesture, the trigger never fires twice
          if (!swallowClick.current) return;
          swallowClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        {/* the widgets trigger: the win11 left edge of the center-aligned
            taskbar (the .widget cell at left 8px) — the docked bottom bar
            only (the floating pad and the 48px rail keep their fit), the
            doctrine maps the widgets board onto the explore surface */}
        {navbarMode === "docked" && navbarEdge === "bottom" && (
          <button
            type="button"
            className={`dt-nav__widget absolute top-1/2 left-2 z-[1] -translate-y-1/2 ${BAR_CELL_CLASS}`}
            aria-label={uicopy("shell.widgets.aria")}
            data-flyout-keep="true"
            onClick={() => navigate("/explore")}
          >
            <span className={`${BAR_FACE_CLASS} text-[#eef1f7] light:text-[#1a1a1a]`}>
              <WidgetsGlyph />
            </span>
          </button>
        )}
        {/* the centered taskbar cluster: the mark-trigger and the pinned apps
            ride one Windows-11 centered group (pure presentation wrapper) —
            the magnification surface of the floating pad */}
        <div
          ref={clusterRef}
          className="dt-nav__cluster absolute top-0 left-1/2 flex h-12 -translate-x-1/2 items-center max-[760px]:static max-[760px]:h-auto max-[760px]:translate-x-0"
          data-flyout-keep="true"
        >
          {/* the mark is the Start trigger: no labeled start button, no brand
              text — the same 44px cell + 38×38 r4 face grammar as the pins */}
          <button
            ref={startRef}
            type="button"
            className={`dt-nav__start ${BAR_CELL_CLASS}`}
            aria-label={osText("shell.start.aria")}
            aria-haspopup="dialog"
            aria-expanded={openPanel?.kind === "start"}
            aria-controls={mountedPanel?.kind === "start" ? "dt-start-menu" : undefined}
            data-flyout-keep="true"
            data-open={openPanel?.kind === "start" ? "true" : undefined}
            onClick={() => togglePanel({ kind: "start" })}
          >
            <span className={`${BAR_FACE_CLASS} text-[#eef1f7] light:text-[#1a1a1a]`}>
              <SolLogoMark size={20} />
            </span>
          </button>
          {/* the search trigger beside the mark (the win11 taskSearch cell):
              opens the menu and seats the caret in the search box */}
          <button
            type="button"
            className={BAR_CELL_CLASS}
            aria-label={uicopy("shell.search.aria")}
            aria-haspopup="dialog"
            aria-expanded={openPanel?.kind === "start"}
            data-flyout-keep="true"
            onClick={openStartSearch}
          >
            <span className={`${BAR_FACE_CLASS} text-[#eef1f7] light:text-[#1a1a1a]`}>
              <Search fontSize={20} aria-hidden="true" />
            </span>
          </button>
          {/* the pinned apps: icons only — the name shows in the hover tooltip,
              the inline ::after ladder reads data-open/data-active off the
              cell, right-click opens the jump list at the cursor,
              data-dock-target is the minimize flight target of the desktop
              windows */}
          <nav
            className="dt-nav__pins flex min-w-0 items-center"
            aria-label={osText("shell.pins.aria")}
            data-flyout-keep="true"
          >
            {taskbarPins.map((app) => {
              // route pins ride the location, window pins ride the live
              // desktop window state (openApps) — external pins never light
              const active = app.target.kind === "route" ? isActive(app.target.href) : false;
              const open = active || openApps.includes(app.id);
              return (
                <button
                  key={app.id}
                  type="button"
                  className={`dt-nav__app ${BAR_CELL_CLASS}`}
                  aria-label={app.name}
                  aria-haspopup="menu"
                  data-flyout-keep="true"
                  data-dock-target={app.id}
                  data-open={app.id === "panel" || open ? "true" : undefined}
                  data-active={active ? "true" : undefined}
                  onClick={() => openApp(app)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    togglePanel({
                      kind: "jump",
                      app,
                      x: event.clientX,
                      y: event.clientY,
                    });
                  }}
                >
                  <span className={BAR_FACE_CLASS}>
                    <AppTile app={app} size={16} />
                  </span>
                  <span className={BAR_TIP_CLASS} aria-hidden="true">
                    {app.name}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
        {/* the clean-url doctrine: the shell navigates by internal state, so
            the address read-out is always "/" (quiet mono, right zone) — the
            wide pill reads only on the floating bar, the rail keeps its 48px */}
        {rail ? null : (
          <div
            className="dt-nav__omnibox mr-2 ml-auto inline-flex h-[30px] w-[140px] flex-none items-center justify-center gap-[7px] self-center rounded-xs border border-white/7 bg-white/5 font-mono text-[10px] tracking-[.08em] text-ink-3 transition-colors duration-200 hover:bg-white/8 max-[1080px]:hidden"
            aria-hidden="true"
          >
            <Lock fontSize={11} />
            <span>/</span>
          </div>
        )}
        {/* the tray cluster: the gateway pill and the clock are the quick
            settings and calendar triggers (native buttons, so the a11y
            grammar is real); the clock reads in two 11px tabular-nums lines */}
        <div
          className="dt-nav__tray flex flex-none items-center font-sans text-[11px] text-ink-2 max-[1080px]:ml-auto"
          data-flyout-keep="true"
        >
          <button
            type="button"
            aria-label={osText("shell.tray.quick.aria")}
            aria-haspopup="dialog"
            aria-expanded={openPanel?.kind === "quick"}
            aria-controls={mountedPanel?.kind === "quick" ? "dt-quick-settings" : undefined}
            data-flyout-keep="true"
            className="flex h-11 cursor-pointer items-center rounded-xs border-0 bg-transparent p-0 font-[inherit] text-[inherit] transition-[box-shadow] duration-200 focus-visible:shadow-[inset_0_-2px_0_var(--color-win)] focus-visible:outline-none"
            onClick={() => togglePanel({ kind: "quick" })}
          >
            {paired !== undefined && (
              <span
                className={`inline-flex mx-0.5 h-11 items-center gap-1.5 rounded-xs px-2 text-[11px] lowercase transition-colors duration-200 hover:bg-white/6 light:hover:bg-black/6 ${
                  paired ? "text-[#f3f5fa] light:text-[#1a1a1a]" : "text-ink-3"
                }`}
                title={paired ? userId || osText("shell.tray.paired") : osText("shell.tray.localOnly")}
              >
                <Wifi fontSize={13} aria-hidden="true" />
                {/* the rail keeps the pill at its 48px width — the glyph alone,
                    the words ride the title peek; the narrow floating bar drops
                    the words too so the tray never pushes the pins off a
                    portrait phone */}
                {rail ? null : <span className="max-[560px]:hidden">{paired ? userId || "paired" : "local only"}</span>}
              </span>
            )}
          </button>
          <button
            ref={clockRef}
            type="button"
            className="dt-nav__clock mx-0.5 flex h-11 cursor-pointer flex-col items-center justify-center rounded-xs border-0 bg-transparent px-2 text-center text-[11px] leading-[1.35] font-[inherit] text-[inherit] tabular-nums transition-[box-shadow] duration-200 focus-visible:shadow-[inset_0_-2px_0_var(--color-win)] focus-visible:outline-none hover:bg-white/6 light:hover:bg-black/6"
            aria-label={osText("shell.tray.calendar.aria")}
            aria-haspopup="dialog"
            aria-expanded={openPanel?.kind === "calendar"}
            aria-controls={mountedPanel?.kind === "calendar" ? "dt-calendar" : undefined}
            data-flyout-keep="true"
            onClick={() => {
              // the calendar accompanies the dock: the pad's clock center is
              // measured at open, the flyout rides the measured anchor while
              // the bar floats (the docked edges keep their placement law)
              const clock = clockRef.current;
              if (clock) setCalendarAnchorX(clock.getBoundingClientRect().left + clock.getBoundingClientRect().width / 2);
              togglePanel({ kind: "calendar" });
            }}
          >
            <span>{time}</span>
            <span>{date}</span>
          </button>
        </div>
      </header>

      {mountedPanel?.kind === "start" && (
        <>
          <button
            type="button"
            className="dt-start__backdrop fixed inset-0 z-20 block w-full cursor-default appearance-none border-0 bg-transparent p-0 focus-visible:outline-none"
            aria-label={osText("shell.start.close.aria")}
            onClick={closePanel}
          />
          {/* the start menu: 640px centered acrylic panel, 8px corners — the
              200ms translateY(100px)→0 entrance on the Windows start curve
              (cubic-bezier(.79,.14,.15,.86)) and the same slide-cum-fade exit
              through data-hide (the mount state keeps it in the DOM). The
              face is the win11 menu in full: search well, the pinned page
              (header chip, 96×84 six-column grid, recommended rows), the All
              apps page sliding on the 300ms page curve, the 64px footer with
              the account profile and the power corner. */}
          <section
            className="dt-start acrylic-panel fixed bottom-[calc(var(--shell-bottom)+12px)] left-1/2 z-[60] -ml-[320px] flex h-[min(calc(100dvh-var(--shell-bottom)-24px),720px)] w-[640px] flex-col overflow-hidden overscroll-contain rounded-md text-ink transition-[transform,opacity] duration-200 ease-fluent max-[700px]:left-2 max-[700px]:ml-0 max-[700px]:w-[calc(100vw-16px)] data-[hide=true]:pointer-events-none data-[hide=true]:translate-y-[100px] data-[hide=true]:opacity-0 light:bg-[rgb(242_242_242_/_90%)]"
            id="dt-start-menu"
            role="dialog"
            aria-modal="true"
            aria-label={osText("shell.start.dialog.aria")}
            data-flyout-keep="true"
            data-hide={openPanel?.kind === "start" ? undefined : "true"}
          >
            {/* the search well: 40px, flat white 5%, hairline bottom, the
                2px accent underline on focus (the win11 input recipe) — the
                live filter of the app registry while the visitor types */}
            <div className="dt-start__search mx-8 mt-6 flex h-10 flex-none items-center gap-[9px] rounded-xs border border-white/6 border-b-(--color-hairline) bg-white/5 px-3 text-ink-2 transition-colors duration-200 focus-within:border-white/20 focus-within:shadow-[inset_0_-2px_0_var(--color-win)] light:border-black/12 light:bg-white/78 light:text-[#3c3c3c]">
              <Search fontSize={15} aria-hidden="true" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={osText("shell.start.search.placeholder")}
                aria-label={osText("shell.start.search.aria")}
                className="min-w-0 flex-1 rounded-xs border-0 bg-transparent text-xs font-normal text-ink outline-none placeholder:text-ink-3 focus-visible:outline-none light:text-[#1a1a1a]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={osText("shell.start.clear.aria")}
                  className="-mr-3 grid h-10 w-10 flex-none cursor-pointer place-items-center rounded-xs border-0 bg-transparent text-ink-2 transition-colors duration-200 hover:bg-white/10 hover:text-ink focus-visible:shadow-[inset_0_-2px_0_var(--color-win)] focus-visible:outline-none"
                >
                  <X fontSize={14} aria-hidden="true" />
                </button>
              )}
            </div>
            {/* the pages stage: the pinned home and the All apps page share
                the slot — the page slide is the win11 300ms
                cubic-bezier(0,.58,.42,1) curve, the distance the panel width
                token carries (--win-start-w) */}
            <div className="dt-start__pages relative min-h-0 flex-1">
              {query ? (
                <div className="absolute inset-0 overflow-y-auto overscroll-contain">
                  {/* the live results: the registry filter renders as the
                      same 96×84 six-column tile grid */}
                  <div className="dt-start__grid grid grid-cols-6 px-8 pt-4 pb-6">
                    {results.map((app, index) => (
                      <button
                        key={app.id}
                        type="button"
                        className={START_TILE_CLASS}
                        style={{ "--stagger-i": index } as CSSProperties}
                        title={app.detail}
                        onClick={() => openApp(app)}
                      >
                        <AppTile app={app} size={20} />
                        <strong className="mt-1.5 max-w-[88px] overflow-hidden font-sans text-xs font-normal text-ellipsis whitespace-nowrap">
                          {app.name}
                        </strong>
                      </button>
                    ))}
                    {!results.length && (
                      <p className="dt-start__empty col-span-6 m-0 px-8 pt-6 pb-8 text-center font-sans text-xs text-ink-3">
                        {osText("shell.start.empty").replace("{query}", query)}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* the home face: the Pinned bar with the All apps chip,
                      the six-column tile grid with its empty padding faces,
                      then the Recommended rows pulled from the recent
                      entries store */}
                  <div
                    className="dt-start__home absolute inset-0 overflow-y-auto overscroll-contain pb-2"
                    data-allapps={showAll ? "true" : "false"}
                  >
                    <div className={`${START_ACBAR_CLASS} mt-5`}>
                      <p className={START_GPNAME_CLASS}>{uicopy("shell.start.header.pinned")}</p>
                      <button type="button" className={START_GPBTN_CLASS} onClick={() => setShowAll(true)}>
                        <span>{uicopy("shell.start.header.allapps")}</span>
                        <ChevronRight fontSize={9} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="dt-start__grid grid grid-cols-6 px-8 pt-4 pb-5">
                      {PINNED_APPS.map((app, index) => (
                        <button
                          key={app.id}
                          type="button"
                          className={START_TILE_CLASS}
                          style={{ "--stagger-i": index } as CSSProperties}
                          title={app.detail}
                          onClick={() => openApp(app)}
                        >
                          <AppTile app={app} size={20} />
                          <strong className="mt-1.5 max-w-[88px] overflow-hidden font-sans text-xs font-normal text-ellipsis whitespace-nowrap">
                            {app.name}
                          </strong>
                        </button>
                      ))}
                      {BLANK_SLOTS.slice(0, pinnedBlanks).map((slot) => (
                        <span key={slot} aria-hidden="true" className="pointer-events-none h-[84px]" />
                      ))}
                    </div>
                    {recommended.length > 0 && (
                      <>
                        <div className={START_ACBAR_CLASS}>
                          <p className={START_GPNAME_CLASS}>{uicopy("shell.start.header.recommended")}</p>
                          <span className={`${START_GPBTN_CLASS} pointer-events-none`}>
                            <span>{uicopy("shell.start.more")}</span>
                            <ChevronRight fontSize={9} aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex flex-wrap justify-between px-5 pt-3 pb-6">
                          {recommended.map((row) => {
                            const age = recentagelabel(row.at);
                            return (
                              <button
                                key={row.app.id}
                                type="button"
                                className={START_RECENT_CLASS}
                                title={row.app.detail}
                                onClick={() => openApp(row.app)}
                              >
                                <span className="mx-3 flex-none [&_.dt-tile]:h-8 [&_.dt-tile]:w-8 [&_.dt-tile]:rounded-sm [&_.dt-tile]:shadow-none">
                                  <AppTile app={row.app} size={20} />
                                </span>
                                <span className="w-[100px] min-w-0">
                                  <span className="block truncate text-xs text-ink">{row.app.name}</span>
                                  {age && (
                                    <span className="block truncate text-[10px] font-medium text-ink-3">{age}</span>
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                  {/* the All apps page: slides in from the right edge on the
                      page curve — the alphabetical sections under their
                      letter headers, the jump rail on the right edge */}
                  <div
                    className="dt-start__allpage absolute flex flex-col overflow-hidden"
                    data-allapps={showAll ? "true" : "false"}
                  >
                    <div className={`${START_ACBAR_CLASS} mt-5 pr-16`}>
                      <p className={START_GPNAME_CLASS}>{uicopy("shell.start.header.allapps")}</p>
                      <button type="button" className={START_GPBTN_CLASS} onClick={() => setShowAll(false)}>
                        <ChevronLeft fontSize={9} aria-hidden="true" />
                        <span>{uicopy("shell.start.back")}</span>
                      </button>
                    </div>
                    <div ref={allListRef} className="relative mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
                      {[...ALPHA_GROUPS.entries()].map(([letter, apps]) => (
                        <div key={letter} data-alpha-letter={letter === "#" ? "hash" : letter}>
                          <div className="flex h-[42px] items-center pl-3">
                            <span className="w-[22px] text-center text-sm text-ink">{letter}</span>
                          </div>
                          {apps.map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              className={START_ALLROW_CLASS}
                              title={app.detail}
                              onClick={() => openApp(app)}
                            >
                              <span className="flex-none [&_.dt-tile]:h-6 [&_.dt-tile]:w-6 [&_.dt-tile]:rounded-sm [&_.dt-tile]:shadow-none">
                                <AppTile app={app} size={20} />
                              </span>
                              <span className="truncate pl-4 text-xs text-ink">{app.name}</span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                    <nav
                      aria-label={uicopy("shell.start.alpha.aria")}
                      className="absolute top-1/2 right-2 z-[1] -translate-y-1/2"
                    >
                      <div className="grid grid-cols-4 gap-x-1 gap-y-0.5">
                        {ALPHA_SLOTS.map((letter) => {
                          const present = ALPHA_GROUPS.has(letter);
                          return present ? (
                            <button
                              key={letter}
                              type="button"
                              className="grid h-5 w-6 cursor-pointer place-items-center rounded-xs border-0 bg-transparent text-[10px] text-ink transition-colors duration-100 hover:bg-white/10 light:hover:bg-white/90 focus-visible:outline-none"
                              onClick={() => jumpToLetter(letter)}
                            >
                              {letter}
                            </button>
                          ) : (
                            <span
                              key={letter}
                              aria-hidden="true"
                              className="grid h-5 w-6 place-items-center text-[10px] text-ink-3"
                            >
                              {letter}
                            </span>
                          );
                        })}
                      </div>
                    </nav>
                  </div>
                </>
              )}
            </div>
            {/* the menu footer: the win11 menuBar — 64px, the 1px #444/#aaa
                top border over the bg3 veil, the account profile at the left
                and the power corner (lock, shut down, restart) at the right */}
            <footer className="dt-start__foot mt-auto flex h-16 flex-none items-center justify-between border-t border-[#444444] bg-black/15 px-12 light:border-[#aaaaaa] light:bg-black/[0.033]">
              <button
                type="button"
                className={`flex cursor-pointer items-center gap-3 rounded-xs border-0 bg-transparent p-2 text-left font-[inherit] ${START_ROW_HOVER}`}
                onClick={() => {
                  const settings = DESKTOP_APPS.find((candidate) => candidate.id === "settings");
                  if (settings) openApp(settings);
                }}
              >
                <span
                  className="grid h-[26px] w-[26px] flex-none place-items-center rounded-full bg-(--color-win) text-[11px] font-semibold text-(--color-win-ink)"
                  aria-hidden="true"
                >
                  {(userName || uicopy("shell.start.user.fallback")).trim().charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[220px] truncate text-xs font-medium text-ink">
                  {userName || uicopy("shell.start.user.fallback")}
                </span>
              </button>
              <div className="relative flex h-10 w-10 flex-none items-center justify-center rounded-xs">
                {powerOpen && (
                  <div
                    role="menu"
                    aria-label={uicopy("shell.start.powermenu.aria")}
                    data-flyout-keep="true"
                    className="acrylic-menu absolute right-0 bottom-full z-[1] mb-2 flex min-w-[168px] flex-col rounded-xs p-1"
                  >
                    {(
                      [
                        { key: "shell.start.power.lock", glyph: Lock, run: () => { closePanel(); navigate("/auth"); } },
                        { key: "shell.start.power.shutdown", glyph: Power, run: () => { closePanel(); navigate("/"); } },
                        { key: "shell.start.power.restart", glyph: Restart, run: () => window.location.reload() },
                      ] as const
                    ).map((action) => (
                      <button
                        key={action.key}
                        type="button"
                        role="menuitem"
                        className={`flex cursor-pointer items-center gap-2 rounded-xs border-0 bg-transparent px-3 py-2 text-left text-xs font-normal text-ink ${START_ROW_HOVER}`}
                        onClick={action.run}
                      >
                        <action.glyph fontSize={16} aria-hidden="true" />
                        <span>{uicopy(action.key)}</span>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  aria-label={uicopy("shell.start.power.aria")}
                  aria-haspopup="menu"
                  aria-expanded={powerOpen}
                  className={`grid h-10 w-10 cursor-pointer place-items-center rounded-xs border-0 bg-transparent text-ink ${START_ROW_HOVER}`}
                  onClick={() => setPowerOpen((value) => !value)}
                >
                  <Power fontSize={18} aria-hidden="true" />
                </button>
              </div>
            </footer>
          </section>
        </>
      )}

      {mountedPanel?.kind === "quick" && (
        <QuickSettings open={openPanel?.kind === "quick"} reduced={reduced} settings={tray} onChange={patchTray} />
      )}

      {mountedPanel?.kind === "calendar" && (
        <CalendarFlyout
          open={openPanel?.kind === "calendar"}
          reduced={reduced}
          floating={navbarMode === "floating"}
          anchorX={calendarAnchorX}
        />
      )}

      {jumpPanel && (
        <JumpList
          app={jumpPanel.app}
          open={openPanel?.kind === "jump"}
          reduced={reduced}
          x={jumpPanel.x}
          y={jumpPanel.y}
          pinned={pins.includes(jumpPanel.app.id)}
          onOpen={() => openApp(jumpPanel.app)}
          onTogglePin={() => togglePin(jumpPanel.app)}
          onClose={closePanel}
        />
      )}

      {/* the tray screen treatments: fixed, pointer-events-none, removable —
          the night light amber wash and the brightness dim, session-only */}
      {tray.night && (
        <div
          className="tray-night-overlay"
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 55,
            background: "rgb(255 176 46 / 6%)",
            pointerEvents: "none",
          }}
        />
      )}
      {dim > 0 && (
        <div
          className="tray-dim-overlay"
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 55,
            background: "rgb(0 0 0)",
            opacity: dim,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
}
