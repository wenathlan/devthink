/**
 * ShellChrome.tsx — the ONE chrome of the Sol shell, shared by every page
 * of the theme (the desktop workspace and the control pages alike): a thin
 * floating navbar pinned to the top — dark glass with a subtle dark
 * hairline, never a white border — carrying the Start button on the left,
 * the DevThink brand, the essential links, the clean omnibox (always "/")
 * and the tray with the gateway state and the local time. The Start button
 * opens the Start menu: a floating panel with the pinned apps grid and a
 * search that filters the desktop app catalog (Sol/shell/app.registry.ts).
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { LayoutGrid, Lock, Search, Wifi, X } from "lucide-react";
import { useLocation } from "wouter";
import { searchDesktopApps, seedOsView, type DesktopApp } from "./app.registry";
import { AppTile } from "./app.tile";
import { SolLogoMark } from "../home/logo";

/** the essential links of the navbar (everything else lives in the Start menu):
 * the desktop is the home surface and the chat is its own application page */
const NAV_LINKS = [
  { href: "/", label: "desktop" },
  { href: "/chat", label: "chat" },
  { href: "/console", label: "console" },
  { href: "/gateway", label: "gateway" },
  { href: "/docs", label: "docs" },
  { href: "/explore", label: "explore" },
];

type ShellChromeProps = {
  /** shows the gateway state pill in the tray (the desktop workspace passes it) */
  paired?: boolean;
  /** the paired public user id shown in the gateway pill */
  userId?: string;
  /** desktop override: the workspace opens windows and destinations in place */
  onOpenApp?: (app: DesktopApp) => void;
};

/** formats the local machine clock for the tray */
function formatClock(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);
}

/** the tray clock, refreshed twice a minute */
function useTrayClock(): string {
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
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const clock = useTrayClock();

  // opening focuses the search; Escape always closes the menu
  useEffect(() => {
    if (!menuOpen) return;
    searchRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const results = searchDesktopApps(query);

  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" || location.startsWith("/w/") : location === href || location.startsWith(`${href}/`);

  /** launches one app from the Start menu: the desktop opens it in place,
   * every other page navigates to the surface that owns it */
  function openApp(app: DesktopApp) {
    setMenuOpen(false);
    setQuery("");
    if (onOpenApp) {
      onOpenApp(app);
      return;
    }
    if (app.target.kind === "route") {
      navigate(app.target.href);
      return;
    }
    if (app.target.kind === "os") {
      seedOsView(app.target.app);
      navigate("/os");
      return;
    }
    navigate("/");
  }

  return (
    <>
      <header className="dt-nav">
        <button
          type="button"
          className="dt-nav__start"
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <LayoutGrid size={14} aria-hidden="true" />
          <span>start</span>
        </button>
        <span className="dt-nav__sep" aria-hidden="true" />
        <a
          href="/"
          className="dt-nav__brand"
          onClick={(event) => {
            event.preventDefault();
            navigate("/");
          }}
        >
          <SolLogoMark size={16} />
          <strong>DEVTHINK</strong>
        </a>
        <nav className="dt-nav__links" aria-label="Essential areas">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                navigate(link.href);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="dt-nav__omnibox" aria-hidden="true">
          <Lock size={11} />
          {/* clean-url doctrine: the shell navigates by internal state, so the bar is always "/" */}
          <span>/</span>
        </div>
        <div className="dt-nav__tray">
          {paired !== undefined && (
            <span className={paired ? "is-on" : ""}>
              <Wifi size={12} aria-hidden="true" />
              {paired ? userId || "paired" : "local only"}
            </span>
          )}
          <time>{clock}</time>
        </div>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            className="dt-start__backdrop"
            aria-label="Close the start menu"
            onClick={() => setMenuOpen(false)}
          />
          <section className="dt-start" role="dialog" aria-modal="true" aria-label="Start menu">
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
              {results.map((app, index) => (
                <button
                  key={app.id}
                  type="button"
                  className="dt-start__app"
                  style={{ animationDelay: `${Math.min(index * 70, 350)}ms` } as CSSProperties}
                  onClick={() => openApp(app)}
                >
                  <AppTile app={app} size={22} />
                  <strong>{app.name}</strong>
                  <small>{app.detail}</small>
                </button>
              ))}
              {!results.length && <p className="dt-start__empty">No app matches “{query}”.</p>}
            </div>
            <footer className="dt-start__foot">
              <SolLogoMark size={13} />
              <span>DevThink · local OS</span>
            </footer>
          </section>
        </>
      )}
    </>
  );
}
