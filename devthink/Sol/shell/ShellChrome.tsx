/**
 * ShellChrome.tsx — the ONE chrome of the Sol shell, shared by every page of
 * the theme (the desktop workspace and the control pages alike): a 48px top
 * bar in the exact Windows 11 taskbar grammar over the .acrylic-bar surface
 * (rgba(32,32,32,.75) + saturate(3) blur(20px) + grain) and a dark bottom
 * hairline. The official DevThink mark opens the centered cluster and IS the
 * Start trigger (no labeled start button, no brand text); the pinned apps
 * follow as 38×38 r4 icon FACES inside 44px hit cells — the face is the
 * Windows button, the cell is the touch target (the ≥44px rule): hover wash
 * rgba(255,255,255,.1) in 200ms, press scale(.7) in 100ms, the 800ms popintro
 * spawn bounce, and NO visible names — the name surfaces in the .dt-nav__tip
 * acrylic tooltip under the icon (fade + slide 200ms, Windows peek
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
 * clock reads two 11px tabular-nums lines. Clicking the mark opens the Start
 * menu: a 640px centered acrylic panel with 8px corners carrying the search
 * box and the pinned grid of the desktop app catalog (Sol/shell/
 * appregistry.ts) — the entrance rises translateY(100px)→0 in 200ms on
 * cubic-bezier(.79,.14,.15,.86) and the exit is REAL: the mount state keeps
 * the open panel in the DOM through a 220ms timer before it unmounts. Every
 * flyout — start, quick settings, calendar, jump list — shares ONE mount
 * state (at most one is in the DOM), closes on Escape and on any press
 * outside a flyout or trigger, and skips its transitions entirely under
 * `prefers-reduced-motion`. Keyboard focus answers the campaign rule: a 2px
 * accent underline (inset box-shadow), never a halo. The night light and
 * brightness controls of the tray drive two fixed, pointer-events-none,
 * removable screen overlays and their --tray-night / --tray-dim tokens —
 * session-only and reversible.
 */

import { Lock, Search, Wifi, X } from "lucide-react";
import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { familyurl } from "../../deploybase.ts";
import { SolLogoMark } from "../panel/logo.tsx";
import { DESKTOP_APPS, type DesktopApp, searchDesktopApps, seedOsView } from "./appregistry.ts";
import { AppTile } from "./apptile.tsx";
import { JumpList, loadTaskbarPins, saveTaskbarPins } from "./jumpmenu.tsx";
import {
  CalendarFlyout,
  DEFAULT_TRAY_SETTINGS,
  QuickSettings,
  type TraySettings,
  useReducedMotion,
} from "./trayflyouts.tsx";

/** the default apps pinned to the top bar: the essential surfaces as icons
 * only — every other app of the catalog lives in the Start menu grid
 * ("panel" is the creation panel, the OS desktop itself, at /panel) */
const TASKBAR_PIN_IDS = ["panel", "chat", "console", "gateway", "docs", "explore"];

/** the 44px hit cell of one taskbar button: the cell is the touch target and
 * the ::after open/active ladder anchor (the component owns the ladder — the
 * 3px bar reads data-open/data-active off the cell, 6px open, 12px accent);
 * the 38×38 r4 Windows face rides inside as the visual button */
const BAR_CELL_CLASS =
  "group relative flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-xs border-0 bg-transparent p-0 focus-visible:outline-none after:absolute after:bottom-0 after:content-[''] after:block after:h-[3px] after:w-0 after:rounded-xs after:bg-[#858585] after:transition-[width,background-color] after:duration-200 data-[open=true]:after:w-1.5 data-[active=true]:after:w-3 data-[active=true]:after:bg-(--color-win)";

/** the 38×38 r4 Windows face: hover wash rgba(255,255,255,.1) in 200ms, the
 * popintro spawn bounce, press scale(.7) in 100ms and the 2px accent focus
 * underline (the campaign focus rule — an inset box-shadow, never a halo);
 * the app tile rides as the proven 26px r5 face fill (no second shadow — the
 * face owns the shadow grammar of the bar) */
const BAR_FACE_CLASS =
  "dt-nav__app-face grid h-[38px] w-[38px] place-items-center rounded-xs transition-[background-color,transform] duration-200 animate-popintro group-hcf:bg-white/10 light:group-hcf:bg-black/8 group-active:scale-[0.7] group-active:duration-100 group-focus-visible:shadow-[inset_0_-2px_0_var(--color-win)] [&_.dt-tile]:h-[26px] [&_.dt-tile]:w-[26px] [&_.dt-tile]:rounded-sm [&_.dt-tile]:shadow-none";

/** the app-name peek: acrylic under the cell, cleared of the bar (Windows
 * tooltip semantics, name only — the aria-label already carries the name) */
const BAR_TIP_CLASS =
  "dt-nav__tip acrylic-tip pointer-events-none absolute top-[calc(100%+6px)] left-1/2 z-[1] -translate-x-1/2 translate-y-[-4px] rounded-xs px-[9px] py-[5px] font-sans text-xs font-medium whitespace-nowrap text-[#fafafa] opacity-0 transition-[opacity,transform] duration-200 group-hcf:translate-y-0 group-hcf:opacity-100 light:border-black/12 light:text-[#1a1a1a]";

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
};

/** formats the local machine clock for the tray: time over date, the two-line
 * Windows tray clock (tabular numerals) */
function formatClock(date: Date): { time: string; date: string } {
  return {
    time: new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date),
    date: new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "2-digit", year: "numeric" }).format(date),
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

export function ShellChrome({ paired, userId, onOpenApp }: ShellChromeProps) {
  const [location, navigate] = useLocation();
  const reduced = useReducedMotion();
  /** the flyout kept in the DOM (through its exit transition) */
  const [mountedPanel, setMountedPanel] = useState<PanelState | null>(null);
  /** the flyout currently visible (null while exiting) */
  const [openPanel, setOpenPanel] = useState<PanelState | null>(null);
  const [query, setQuery] = useState("");
  const [pins, setPins] = useState<string[]>(() => loadTaskbarPins(TASKBAR_PIN_IDS));
  const [tray, setTray] = useState<TraySettings>(DEFAULT_TRAY_SETTINGS);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const exitTimer = useRef<number | null>(null);
  const mountedKindRef = useRef<PanelState["kind"] | null>(null);
  const startRef = useStartMarkDraw(reduced);
  const { time, date } = useTrayClock();

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

  // opening the Start menu focuses the search box
  useEffect(() => {
    if (openPanel?.kind === "start") searchRef.current?.focus();
  }, [openPanel]);

  // the exit timer never outlives the chrome
  useEffect(
    () => () => {
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    },
    [],
  );

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

  /** the taskbar pins in the persisted order (unknown ids drop out) */
  const taskbarPins = pins
    .map((id) => DESKTOP_APPS.find((app) => app.id === id))
    .filter((app): app is DesktopApp => Boolean(app));

  const isActive = (href: string): boolean =>
    href === "/panel"
      ? location === "/panel" || location.startsWith("/w/")
      : location === href || location.startsWith(`${href}/`);

  /** the taskbar route of one pin (every pin targets a route surface) */
  const pinHref = (app: DesktopApp): string =>
    app.target.kind === "route"
      ? app.target.href
      : app.target.kind === "external"
        ? familyurl(app.target.slug)
        : "/panel";

  /** launches one app from the Start menu, taskbar or jump list: the desktop
   * opens it in place, the family deploy units load in full, every other page
   * navigates to the surface that owns it */
  function openApp(app: DesktopApp) {
    closePanel();
    setQuery("");
    if (onOpenApp) {
      onOpenApp(app);
      return;
    }
    if (app.target.kind === "route") {
      navigate(app.target.href);
      return;
    }
    if (app.target.kind === "external") {
      window.location.assign(familyurl(app.target.slug));
      return;
    }
    if (app.target.kind === "os") {
      seedOsView(app.target.app);
      navigate("/os");
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
      {/* the ONE chrome: a 48px top taskbar — the authentic dark acrylic
          (.acrylic-bar: rgba(32,32,32,.75) + saturate(3) blur(20px) + grain,
          light theme rides the class) over a dark bottom hairline; the
          centered cluster, the omnibox and the tray split the row */}
      <header className="dt-nav acrylic-bar sticky top-0 z-50 flex h-12 min-w-0 items-center border-b border-black/55 px-2">
        {/* the centered taskbar cluster: the mark-trigger and the pinned apps
            ride one Windows-11 centered group (pure presentation wrapper) */}
        <div
          className="dt-nav__cluster absolute top-0 left-1/2 flex h-12 -translate-x-1/2 items-center max-[760px]:static max-[760px]:h-auto max-[760px]:translate-x-0"
          data-flyout-keep="true"
        >
          {/* the mark is the Start trigger: no labeled start button, no brand
              text — the same 44px cell + 38×38 r4 face grammar as the pins */}
          <button
            ref={startRef}
            type="button"
            className={`dt-nav__start ${BAR_CELL_CLASS}`}
            aria-label="DevThink start menu"
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
          {/* the pinned apps: icons only — the name shows in the hover tooltip,
              the inline ::after ladder reads data-open/data-active off the
              cell, right-click opens the jump list at the cursor,
              data-dock-target is the minimize flight target of the desktop
              windows */}
          <nav className="dt-nav__pins flex min-w-0 items-center" aria-label="Pinned apps" data-flyout-keep="true">
            {taskbarPins.map((app) => {
              const active = isActive(pinHref(app));
              return (
                <button
                  key={app.id}
                  type="button"
                  className={`dt-nav__app ${BAR_CELL_CLASS}`}
                  aria-label={app.name}
                  aria-haspopup="menu"
                  data-flyout-keep="true"
                  data-dock-target={app.id}
                  data-open={app.id === "panel" || active ? "true" : undefined}
                  data-active={active ? "true" : undefined}
                  onClick={() => openApp(app)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    togglePanel({ kind: "jump", app, x: event.clientX, y: event.clientY });
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
            the address read-out is always "/" (quiet mono, right zone) */}
        <div
          className="dt-nav__omnibox mr-2 ml-auto inline-flex h-[30px] w-[140px] flex-none items-center justify-center gap-[7px] self-center rounded-xs border border-white/7 bg-white/5 font-mono text-[10px] tracking-[.08em] text-ink-3 transition-colors duration-200 hover:bg-white/8 max-[1080px]:hidden"
          aria-hidden="true"
        >
          <Lock size={11} />
          <span>/</span>
        </div>
        {/* the tray cluster: the gateway pill and the clock are the quick
            settings and calendar triggers (native buttons, so the a11y
            grammar is real); the clock reads in two 11px tabular-nums lines */}
        <div
          className="dt-nav__tray flex flex-none items-center font-sans text-[11px] text-ink-2 max-[1080px]:ml-auto"
          data-flyout-keep="true"
        >
          <button
            type="button"
            aria-label="Quick settings"
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
              >
                <Wifi size={13} aria-hidden="true" />
                {paired ? userId || "paired" : "local only"}
              </span>
            )}
          </button>
          <button
            type="button"
            className="dt-nav__clock mx-0.5 flex h-11 cursor-pointer flex-col items-center justify-center rounded-xs border-0 bg-transparent px-2 text-center text-[11px] leading-[1.35] font-[inherit] text-[inherit] tabular-nums transition-[box-shadow] duration-200 focus-visible:shadow-[inset_0_-2px_0_var(--color-win)] focus-visible:outline-none hover:bg-white/6 light:hover:bg-black/6"
            aria-label="Calendar"
            aria-haspopup="dialog"
            aria-expanded={openPanel?.kind === "calendar"}
            aria-controls={mountedPanel?.kind === "calendar" ? "dt-calendar" : undefined}
            data-flyout-keep="true"
            onClick={() => togglePanel({ kind: "calendar" })}
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
            aria-label="Close the start menu"
            onClick={closePanel}
          />
          {/* the start menu: 640px centered acrylic panel, 8px corners — the
              200ms translateY(100px)→0 entrance on the Windows start curve
              (cubic-bezier(.79,.14,.15,.86)) and the same slide-cum-fade exit
              through data-hide (the mount state keeps it in the DOM) */}
          <section
            className="dt-start acrylic-panel fixed top-[calc(var(--shell-top)+12px)] left-1/2 z-[60] -ml-[320px] flex h-[min(calc(100dvh-var(--shell-top)-24px),720px)] w-[640px] flex-col overflow-y-auto overscroll-contain rounded-md text-ink transition-[transform,opacity] duration-200 ease-fluent max-[700px]:left-2 max-[700px]:ml-0 max-[700px]:w-[calc(100vw-16px)] data-[hide=true]:pointer-events-none data-[hide=true]:translate-y-[100px] data-[hide=true]:opacity-0 light:bg-[rgb(242_242_242_/_90%)]"
            id="dt-start-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Start menu"
            data-hide={openPanel?.kind === "start" ? undefined : "true"}
          >
            {/* the search well: flat white 5%, hairline bottom, the 2px
                accent underline on focus (the win11 input recipe) */}
            <div className="dt-start__search mx-8 mt-6 flex h-11 flex-none items-center gap-[9px] rounded-xs border border-white/6 border-b-(--color-hairline) bg-white/5 px-3 text-ink-2 transition-colors duration-200 focus-within:border-white/20 focus-within:shadow-[inset_0_-2px_0_var(--color-win)] light:border-black/12 light:bg-white/78 light:text-[#3c3c3c]">
              <Search size={15} aria-hidden="true" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the desktop apps"
                aria-label="Search the desktop apps"
                className="min-w-0 flex-1 rounded-xs border-0 bg-transparent text-xs font-normal text-ink outline-none placeholder:text-ink-3 focus-visible:outline-none light:text-[#1a1a1a]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear the search"
                  className="-mr-3 grid h-11 w-11 flex-none cursor-pointer place-items-center rounded-xs border-0 bg-transparent text-ink-2 transition-colors duration-200 hover:bg-white/10 hover:text-ink focus-visible:shadow-[inset_0_-2px_0_var(--color-win)] focus-visible:outline-none"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
            <p className="dt-start__label mx-8 mt-5 mb-2.5 text-sm font-medium text-ink">
              {query ? "results" : "pinned"}
            </p>
            {/* the pinned tiles: the exact win11 pnApp cell — 96×84px, 4px
                corners, the hover wash in 100ms ease-in-out, 12px label */}
            <div className="dt-start__grid grid grid-cols-[repeat(auto-fill,96px)] px-8 pb-6">
              {results.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  className="dt-start__app flex h-[84px] w-24 cursor-pointer flex-col items-center justify-center rounded-xs border-0 bg-transparent pt-2 text-ink transition-colors duration-100 ease-in-out hover:bg-white/10 focus-visible:shadow-[inset_0_-2px_0_var(--color-win)] focus-visible:outline-none light:hover:bg-black/8 [&_.dt-tile]:h-8 [&_.dt-tile]:w-8 [&_.dt-tile]:rounded-sm [&_.dt-tile]:shadow-none"
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
                <p className="dt-start__empty m-0 px-8 pb-8 pt-6 text-center font-sans text-xs text-ink-3">
                  No app matches “{query}”.
                </p>
              )}
            </div>
            {/* the menu footer: the win11 menuBar — 64px, hairline top, the
                mono wordmark instead of a second mark (logo discipline: the
                taskbar owns the mark) */}
            <footer className="dt-start__foot mt-auto flex h-16 flex-none items-center gap-[9px] border-t border-white/7 bg-black/15 px-12 text-[11px] font-medium text-ink-2 light:border-t-black/10 light:bg-black/3">
              <span
                className="dt-start__wordmark font-mono text-[10px] font-semibold tracking-[0.08em] text-ink"
                aria-hidden="true"
              >
                devthink
              </span>
              <span>· local OS</span>
            </footer>
          </section>
        </>
      )}

      {mountedPanel?.kind === "quick" && (
        <QuickSettings open={openPanel?.kind === "quick"} reduced={reduced} settings={tray} onChange={patchTray} />
      )}

      {mountedPanel?.kind === "calendar" && <CalendarFlyout open={openPanel?.kind === "calendar"} reduced={reduced} />}

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
          style={{ position: "fixed", inset: 0, zIndex: 55, background: "rgb(255 176 46 / 6%)", pointerEvents: "none" }}
        />
      )}
      {dim > 0 && (
        <div
          className="tray-dim-overlay"
          aria-hidden="true"
          style={{ position: "fixed", inset: 0, zIndex: 55, background: "#000", opacity: dim, pointerEvents: "none" }}
        />
      )}
    </>
  );
}
