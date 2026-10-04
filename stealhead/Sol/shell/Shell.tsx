// the stealhead shell of the theme.
/**
 * Shell.tsx — the ONE chrome of the theme, shared by every page: a thin
 * floating navbar pinned to the top — neutral graphite glass with a dark
 * hairline, never a tinted or white border — carrying the Start button on
 * the left, the brand tile (the one identity-colored element of the
 * chrome), the essential links and the tray with the theme toggle and the
 * local time. The Start button opens the start menu: a floating panel with
 * the page grid and a search that filters it. The signal ember lives in
 * content accents and the brand tile only.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Boxes, Crosshair, LayoutGrid, Moon, Search, Sun, Swords, Trophy, X, Zap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { currentTheme, toggleTheme, type ThemeName } from "../../theme";

/** the navigation entries of the platform. */
const navlinks: { href: string; label: string }[] = [
  { href: "/", label: "home" },
  { href: "/match", label: "match" },
  { href: "/ranking", label: "ranking" },
  { href: "/weapons", label: "weapons" },
  { href: "/world", label: "world" },
];

/** one entry of the start menu: a page surface with its tile glyph. */
type StartApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof Crosshair;
};

/** the pages the start menu launches (the whole theme, one tile each). */
const START_APPS: readonly StartApp[] = [
  { href: "/", label: "home", detail: "the FPS platform of the family", icon: Crosshair },
  { href: "/match", label: "match", detail: "lobbies, rounds and live seats", icon: Swords },
  { href: "/ranking", label: "ranking", detail: "the competitive ladder of the season", icon: Trophy },
  { href: "/weapons", label: "weapons", detail: "armory grid with damage stats", icon: Zap },
  { href: "/world", label: "world", detail: "hash-verified GLB world assets", icon: Boxes },
];

/** filters the start menu tiles by label or detail. */
function searchStartApps(query: string): readonly StartApp[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return START_APPS;
  return START_APPS.filter(
    (app) => app.label.toLowerCase().includes(needle) || app.detail.toLowerCase().includes(needle),
  );
}

/** formats the local clock for the tray. */
function formatClock(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);
}

/** the tray clock, refreshed twice a minute. */
function useTrayClock(): string {
  const [clock, setClock] = useState(() => formatClock(new Date()));
  useEffect(() => {
    const tick = window.setInterval(() => setClock(formatClock(new Date())), 30_000);
    return () => window.clearInterval(tick);
  }, []);
  return clock;
}

/**
 * the theme toggle of the tray: flips the in-memory theme, stores nothing.
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>(currentTheme());
  return (
    <button
      type="button"
      className="dt-nav__theme"
      aria-label="toggle theme"
      onClick={() => setTheme(toggleTheme())}
    >
      {theme === "dark" ? <Sun size={12} aria-hidden="true" /> : <Moon size={12} aria-hidden="true" />}
      {theme}
    </button>
  );
}

/**
 * the application shell: the fusion chrome (navbar, start menu, tray)
 * around the routed page.
 *
 * @param children the routed page.
 * @returns the shell element.
 */
export function Shell({ children }: { children: ReactNode }) {
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

  const isactive = (href: string) => (href === "/" ? location === "/" : location.startsWith(href));
  const results = searchStartApps(query);

  /** launches one start menu entry: closes the menu and navigates. */
  function openApp(href: string) {
    setMenuOpen(false);
    setQuery("");
    navigate(href);
  }

  return (
    <div className="appframe">
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
        <Link href="/" className="dt-nav__brand" aria-label="stealhead home">
          <span className="dt-tile" style={{ "--app-tint": "var(--sol-primary)" } as CSSProperties} aria-hidden="true">
            <Crosshair size={13} strokeWidth={1.7} />
          </span>
          <strong>stealhead</strong>
        </Link>
        <nav className="dt-nav__links" aria-label="primary">
          {navlinks.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isactive(link.href) ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="dt-nav__tray">
          <ThemeToggle />
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
                placeholder="Search the pages"
                aria-label="Search the pages"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear the search">
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
            <p className="dt-start__label">{query ? "results" : "pages"}</p>
            <div className="dt-start__grid">
              {results.map((app, index) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.href}
                    type="button"
                    className="dt-start__app"
                    style={{ animationDelay: `${Math.min(index * 70, 350)}ms` } as CSSProperties}
                    onClick={() => openApp(app.href)}
                  >
                    <span
                      className="dt-tile"
                      style={{ "--app-tint": "var(--sol-primary)" } as CSSProperties}
                      aria-hidden="true"
                    >
                      <Icon size={20} strokeWidth={1.7} />
                    </span>
                    <strong>{app.label}</strong>
                    <small>{app.detail}</small>
                  </button>
                );
              })}
              {!results.length && <p className="dt-start__empty">No page matches “{query}”.</p>}
            </div>
            <footer className="dt-start__foot">
              <span>stealhead · one DB layer, zero client storage</span>
            </footer>
          </section>
        </>
      )}

      <main className="shell">{children}</main>
      <footer className="footer">
        <span>stealhead — the FPS game platform of the wenathlan family</span>
        <span className="spacer" />
        <span>
          imports versawase (cadria) and audio (debonair) via the published library; ships pre-compiled, the visitor
          machine compiles nothing
        </span>
      </footer>
    </div>
  );
}

export default Shell;
