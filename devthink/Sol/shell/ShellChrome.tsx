/**
 * ShellChrome.tsx — the ONE chrome of the Sol shell, shared by every page of
 * the theme (the desktop workspace and the control pages alike): a 48px top
 * bar in the exact Windows 11 taskbar grammar — an authentic dark acrylic
 * surface (rgba(32,32,32,.75) + saturate(3) blur(20px)) over a dark bottom
 * hairline. The official DevThink mark sits on the left edge and IS the Start
 * trigger (no labeled start button, no brand text); the pinned apps follow as
 * 38×38 rounded-square ICONS with NO text labels — the name surfaces in the
 * hover tooltip below the icon (Windows peek semantics), the ::after ladder
 * marks open (6px #858585) and active (12px solar accent) states, entries pop
 * in with the Windows popintro bounce, hover lights the icon background
 * (.2s ease) and press compresses to scale(.7) (100ms ease-in-out). Clicking
 * the mark opens the Start menu: a 640px centered acrylic panel with 8px
 * corners that enters/exits on the Windows cubic-bezier(.79,.14,.15,.86)
 * slide-and-fade (a mount state keeps it in the DOM through the exit
 * transition), carrying the search box and the pinned apps grid of the
 * desktop app catalog (Sol/shell/appregistry.ts).
 */

import { Lock, Search, Wifi, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { familyurl } from "../../deploybase.ts";
import { SolLogoMark } from "../panel/logo";
import { DESKTOP_APPS, type DesktopApp, searchDesktopApps, seedOsView } from "./appregistry";
import { AppTile } from "./apptile";

/** the apps pinned to the top bar: the essential surfaces as icons only —
 * every other app of the catalog lives in the Start menu grid ("panel" is
 * the creation panel, the OS desktop itself, at /panel) */
const TASKBAR_PIN_IDS = ["panel", "chat", "console", "gateway", "docs", "explore"];

const TASKBAR_PINS: DesktopApp[] = TASKBAR_PIN_IDS.map((id) => DESKTOP_APPS.find((app) => app.id === id)).filter(
  (app): app is DesktopApp => Boolean(app),
);

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

export function ShellChrome({ paired, userId, onOpenApp }: ShellChromeProps) {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const exitTimer = useRef<number | null>(null);
  const menuMountedRef = useRef(false);
  const { time, date } = useTrayClock();

  /** opens the Start menu: mounts the panel first and the effect flips the
   * visible state on the next frame, so the enter transition plays; a reopen
   * during the exit shows the still-mounted panel right away */
  function openMenu() {
    if (exitTimer.current !== null) {
      window.clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
    if (menuMountedRef.current) {
      setMenuOpen(true);
      return;
    }
    menuMountedRef.current = true;
    setMenuMounted(true);
  }

  /** closes the Start menu: the slide-and-fade exit plays and the panel
   * unmounts once the 200ms Windows transition settles */
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    exitTimer.current = window.setTimeout(() => {
      menuMountedRef.current = false;
      setMenuMounted(false);
    }, 220);
  }, []);

  // mounting flips the visible state one frame later (the enter transition)
  useEffect(() => {
    if (!menuMounted) return undefined;
    const frame = window.requestAnimationFrame(() => setMenuOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [menuMounted]);

  // opening focuses the search; Escape always closes the menu
  useEffect(() => {
    if (!menuOpen) return undefined;
    searchRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu, menuOpen]);

  // the exit timer never outlives the chrome
  useEffect(
    () => () => {
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    },
    [],
  );

  const results = searchDesktopApps(query);

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

  /** launches one app from the Start menu or the taskbar: the desktop opens
   * it in place, the family deploy units load in full, every other page
   * navigates to the surface that owns it */
  function openApp(app: DesktopApp) {
    closeMenu();
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

  return (
    <>
      <header className="dt-nav">
        {/* the mark is the Start trigger: no labeled start button, no brand text */}
        <button
          type="button"
          className="dt-nav__start"
          aria-label="DevThink start menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls={menuMounted ? "dt-start-menu" : undefined}
          onClick={menuOpen ? closeMenu : openMenu}
        >
          <SolLogoMark size={20} />
        </button>
        {/* the pinned apps: icons only — the name shows in the hover tooltip,
            the ::after ladder carries the open/active state */}
        <nav className="dt-nav__pins" aria-label="Pinned apps">
          {TASKBAR_PINS.map((app) => {
            const active = isActive(pinHref(app));
            return (
              <button
                key={app.id}
                type="button"
                className="dt-nav__app"
                aria-label={app.name}
                data-open={app.id === "panel" || active ? "true" : undefined}
                data-active={active ? "true" : undefined}
                onClick={() => openApp(app)}
              >
                <AppTile app={app} size={16} />
                <span className="dt-nav__tip" aria-hidden="true">
                  {app.name}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="dt-nav__omnibox" aria-hidden="true">
          <Lock size={11} />
          {/* clean-url doctrine: the shell navigates by internal state, so the bar is always "/" */}
          <span>/</span>
        </div>
        <div className="dt-nav__tray">
          {paired !== undefined && (
            <span className={paired ? "is-on" : ""}>
              <Wifi size={13} aria-hidden="true" />
              {paired ? userId || "paired" : "local only"}
            </span>
          )}
          <time className="dt-nav__clock">
            <span>{time}</span>
            <span>{date}</span>
          </time>
        </div>
      </header>

      {menuMounted && (
        <>
          <button type="button" className="dt-start__backdrop" aria-label="Close the start menu" onClick={closeMenu} />
          <section
            className="dt-start"
            id="dt-start-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Start menu"
            data-hide={menuOpen ? undefined : "true"}
          >
            <div className="dt-start__search">
              <Search size={15} aria-hidden="true" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the desktop apps"
                aria-label="Search the desktop apps"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear the search">
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
            <p className="dt-start__label">{query ? "results" : "pinned"}</p>
            <div className="dt-start__grid">
              {results.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  className="dt-start__app"
                  title={app.detail}
                  onClick={() => openApp(app)}
                >
                  <AppTile app={app} size={20} />
                  <strong>{app.name}</strong>
                </button>
              ))}
              {!results.length && <p className="dt-start__empty">No app matches “{query}”.</p>}
            </div>
            <footer className="dt-start__foot">
              <SolLogoMark size={14} />
              <span>DevThink · local OS</span>
            </footer>
          </section>
        </>
      )}
    </>
  );
}
