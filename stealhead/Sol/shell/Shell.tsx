// the stealhead shell of the theme.
/**
 * Shell.tsx — the ONE chrome of the theme, the DevThink reform standard
 * (devthink/Sol/shell/ShellChrome.tsx): the Windows 11 taskbar pinned to the
 * top edge — a 48px dark acrylic surface (rgb(32 32 32 / 75%) + saturate(3)
 * blur(20px)) over a dark bottom hairline, flat (no gradient, no pills, no
 * white borders) — carrying the drawn stealhead mark on the LEFT EDGE as the
 * floating panel trigger, the pages as icon-only 38px pins (no text labels:
 * the name surfaces in the hover tooltip, the ::after ladder marks the
 * active page in the coral story) and the tray with the theme toggle and the
 * local time. There is no labeled start button: the mark itself is the start
 * trigger and it opens the floating navigation panel with the page grid and
 * a search that filters it. The chrome stays neutral graphite in both
 * themes; the coral story lives in the mark and the content accents only.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Crosshair, Globe, LayoutDashboard, Moon, Search, Sun, Swords, Trophy, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { currentTheme, toggleTheme, type ThemeName } from "../../theme";
import { BrandMark } from "./BrandMark";

/** one entry of the taskbar pins and the navigation panel: a page surface
 * with its tile glyph (the pin shows the icon only — the name rides the
 * tooltip). */
type StartApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof LayoutDashboard;
};

/** the pages the theme launches, one pin/tile each (the whole theme, the
 * apex home pinned first). */
const START_APPS: readonly StartApp[] = [
  { href: "/", label: "home", detail: "the FPS platform of the family", icon: LayoutDashboard },
  { href: "/match", label: "match", detail: "lobbies, rounds and live seats", icon: Swords },
  { href: "/ranking", label: "ranking", detail: "the competitive ladder of the season", icon: Trophy },
  { href: "/weapons", label: "weapons", detail: "armory grid with damage stats", icon: Crosshair },
  { href: "/world", label: "world", detail: "hash-verified GLB world assets", icon: Globe },
];

/** filters the navigation panel tiles by label or detail. */
function searchStartApps(query: string): readonly StartApp[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return START_APPS;
  return START_APPS.filter(
    (app) => app.label.toLowerCase().includes(needle) || app.detail.toLowerCase().includes(needle),
  );
}

/** the glyph of one pinned page (resolved from the page map). */
function pinIcon(href: string): typeof LayoutDashboard {
  return START_APPS.find((app) => app.href === href)?.icon ?? LayoutDashboard;
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
 * the application shell: the taskbar chrome (acrylic bar, icon pins with
 * tooltips, floating navigation panel, tray) around the routed page.
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

  // opening focuses the search; Escape always closes the panel
  useEffect(() => {
    if (!menuOpen) return;
    searchRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // the active pin: the bare path owns home, every other page owns its route
  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);
  const results = searchStartApps(query);

  /** launches one panel entry: closes the panel and navigates. */
  function openApp(href: string) {
    setMenuOpen(false);
    setQuery("");
    navigate(href);
  }

  return (
    <div className="appframe">
      <header className="dt-nav">
        {/* the mark is the start trigger: no labeled start button, no brand text */}
        <button
          type="button"
          className="dt-nav__start"
          aria-label="stealhead start menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? "dt-start-menu" : undefined}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <BrandMark size={24} />
        </button>
        {/* the pinned pages: icons only — the name shows in the hover tooltip,
            the ::after ladder carries the active state */}
        <nav className="dt-nav__pins" aria-label="Pinned pages">
          {START_APPS.map((app) => {
            const Icon = pinIcon(app.href);
            const activePin = isActive(app.href);
            return (
              <Link
                key={app.href}
                href={app.href}
                className="dt-nav__app"
                aria-label={app.label}
                aria-current={activePin ? "page" : undefined}
                data-open={activePin ? "true" : undefined}
                data-active={activePin ? "true" : undefined}
              >
                <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                <span className="dt-nav__tip" aria-hidden="true">
                  {app.label}
                </span>
              </Link>
            );
          })}
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
          <section className="dt-start" id="dt-start-menu" role="dialog" aria-modal="true" aria-label="Start menu">
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
                    title={app.detail}
                    style={{ animationDelay: `${Math.min(index * 70, 350)}ms` } as CSSProperties}
                    onClick={() => openApp(app.href)}
                  >
                    <span
                      className="dt-tile"
                      style={{ "--app-tint": "var(--sol-primary)" } as CSSProperties}
                      aria-hidden="true"
                    >
                      <Icon size={18} strokeWidth={1.7} />
                    </span>
                    <strong>{app.label}</strong>
                  </button>
                );
              })}
              {!results.length && <p className="dt-start__empty">No page matches “{query}”.</p>}
            </div>
            <footer className="dt-start__foot">
              <BrandMark size={13} />
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
