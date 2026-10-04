/**
 * Shell.tsx — the ONE chrome of the theme, the DevThink reform standard
 * (devthink/Sol/shell/ShellChrome.tsx): a thin SOLID graphite bar pinned to
 * the top — deep Windows-10 graphite with one top window light and a dark
 * hairline, never glass, never a pill, never a white border — carrying the
 * drawn forge mark on the left edge, the essential links and the tray with
 * the staging state and the local time. There is no labeled start button:
 * the mark itself is the start trigger and it opens the floating navigation
 * panel with the surfaces of the app. The chrome stays neutral graphite in
 * both themes; the runner lime lives in the mark and the content accents
 * only.
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { ExternalLink, House, Wrench } from "lucide-react";
import { BrandMark } from "./BrandMark";

/** the essential links of the navbar (the page tabs stay on the home surface) */
const NAV_LINKS = [
  { href: "#surface", label: "runner floor" },
  { href: "https://github.com/wenathlan/devthink", label: "family" },
] as const;

/** one entry of the navigation panel: a surface of the app with its tile. */
type StartApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof House;
};

/** the surfaces the navigation panel launches (the whole theme, one tile each). */
const START_APPS: readonly StartApp[] = [
  { href: "/", label: "home", detail: "the staging surface of the runner", icon: House },
  { href: "#surface", label: "runner floor", detail: "the three jobs of the application", icon: Wrench },
  { href: "https://github.com/wenathlan/devthink", label: "family", detail: "the DevThink OS tree on GitHub", icon: ExternalLink },
];

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

/** the shared shell: the solid navbar and the floating navigation panel over the page surface */
export function Shell({ children }: { children: ReactNode }) {
  const clock = useTrayClock();
  const [menuOpen, setMenuOpen] = useState(false);

  /** launches one panel entry: closes the panel and follows the surface. */
  function openApp(href: string) {
    setMenuOpen(false);
    if (href.startsWith("#")) {
      // no explicit behavior: the stylesheet owns the scroll motion (and its
      // reduced-motion guard turns it off)
      document.querySelector(href)?.scrollIntoView();
      return;
    }
    window.location.href = href;
  }

  return (
    <>
      <header className="dt-nav">
        {/* the mark is the start trigger: no labeled start button, no brand text */}
        <button
          type="button"
          className="dt-nav__start"
          aria-label="forge start menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? "dt-start-menu" : undefined}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <BrandMark size={22} />
        </button>
        <span className="dt-nav__sep" aria-hidden="true" />
        <nav className="dt-nav__links" aria-label="Essential areas">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="dt-nav__tray">
          <span className="is-on">staging</span>
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
            <p className="dt-start__label">surfaces</p>
            <div className="dt-start__grid">
              {START_APPS.map((app, index) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.href}
                    type="button"
                    className="dt-start__app"
                    style={{ animationDelay: `${Math.min(index * 70, 350)}ms` } as CSSProperties}
                    onClick={() => openApp(app.href)}
                  >
                    <span className="dt-tile" aria-hidden="true">
                      <Icon size={20} strokeWidth={1.7} />
                    </span>
                    <strong>{app.label}</strong>
                    <small>{app.detail}</small>
                  </button>
                );
              })}
            </div>
            <footer className="dt-start__foot">
              <BrandMark size={13} />
              <span>forge · builds that run themselves</span>
            </footer>
          </section>
        </>
      )}

      {children}
    </>
  );
}

export default Shell;
