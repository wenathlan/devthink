// the debonair shell of the theme.
/**
 * Shell.tsx — the ONE chrome of the theme, shared by every page: a thin
 * floating navbar pinned to the top — neutral graphite glass with a dark
 * hairline, never a tinted or white border — carrying the Start button on
 * the left, the brand tile (the one identity-colored element of the
 * chrome), the essential links, the call-to-action and the tray with the
 * app domain and the local time. The Start button opens the start menu: a
 * floating panel with the page grid and a search that filters it. The
 * signal brass lives in content accents and the brand tile only.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BookOpen, LayoutGrid, Music2, Search, Settings, SlidersHorizontal, Wand2, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toggleTheme } from "../../theme";

export type NavLink = { label: string; href: string };

/** primary navigation of the site (shell configuration, one entry per page) */
export const NAV: readonly NavLink[] = [
  { label: "Studio", href: "/studio" },
  { label: "Generate", href: "/generate" },
  { label: "Library", href: "/library" },
  { label: "Settings", href: "/settings" },
];

/** one entry of the start menu: a page surface with its tile glyph */
type StartApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof Music2;
};

/** the pages the start menu launches (the whole theme, one tile each) */
const START_APPS: readonly StartApp[] = [
  { href: "/", label: "Home", detail: "the audio DAW of the OS", icon: Music2 },
  { href: "/studio", label: "Studio", detail: "timeline, mixer and transport", icon: SlidersHorizontal },
  { href: "/generate", label: "Generate", detail: "text-to-music render queue", icon: Wand2 },
  { href: "/library", label: "Library", detail: "renders, genres and statuses", icon: BookOpen },
  { href: "/settings", label: "Settings", detail: "appearance and region", icon: Settings },
];

/** filters the start menu tiles by label or detail */
function searchStartApps(query: string): readonly StartApp[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return START_APPS;
  return START_APPS.filter(
    (app) => app.label.toLowerCase().includes(needle) || app.detail.toLowerCase().includes(needle),
  );
}

/** formats the local clock for the tray */
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

type ShellProps = {
  /** brand mark rendered inside the brand tile (the default is the wave glyph) */
  brand?: ReactNode;
  name: string;
  nav?: readonly NavLink[];
  cta?: NavLink;
  /** when true the main outlet carries the shell container width */
  contained?: boolean;
  footerLinks: readonly NavLink[];
  themeButton?: boolean;
  domain: string;
  children: ReactNode;
};

export function Shell({
  brand,
  name,
  nav = NAV,
  cta,
  contained = false,
  footerLinks,
  themeButton = true,
  domain,
  children,
}: ShellProps) {
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

  const active = (href: string): boolean =>
    location === href || (href !== "/" && location.startsWith(`${href}/`));
  const results = searchStartApps(query);
  const year = new Date().getFullYear();

  /** launches one start menu entry: closes the menu and navigates */
  function openApp(href: string) {
    setMenuOpen(false);
    setQuery("");
    navigate(href);
  }

  return (
    <div className="app-frame">
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
        <Link className="dt-nav__brand" href="/" aria-label={`${name} home`}>
          <span className="dt-tile" style={{ "--app-tint": "var(--sol-primary)" } as CSSProperties} aria-hidden="true">
            {brand ?? <Music2 size={13} strokeWidth={1.7} />}
          </span>
          <strong>{name}</strong>
        </Link>
        <nav className="dt-nav__links" aria-label="Primary">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
          {cta ? (
            <Link className="dt-nav__cta" href={cta.href} style={{ color: "var(--sol-primary-ink)" }}>
              {cta.label}
            </Link>
          ) : null}
        </nav>
        <div className="dt-nav__tray">
          <span>{domain}</span>
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
              <span>debonair · katexis engine</span>
            </footer>
          </section>
        </>
      )}

      <main className={contained ? "app-main shell" : "app-main"}>{children}</main>
      <footer className="footer">
        <span>
          ©{" "}
          <span data-year={year}>{year}</span> wenathlan · {domain}
        </span>
        <span className="spacer" />
        {footerLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        {themeButton ? (
          <button
            className="btn small secondary"
            type="button"
            aria-label="Toggle light theme"
            onClick={() => toggleTheme()}
          >
            Theme
          </button>
        ) : null}
      </footer>
    </div>
  );
}
