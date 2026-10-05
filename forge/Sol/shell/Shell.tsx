/**
 * Shell.tsx — the ONE chrome of the theme, the DevThink reform standard
 * (devthink/Sol/shell/ShellChrome.tsx): the Windows 11 taskbar pinned to the
 * top edge — a 48px dark acrylic surface (rgb(32 32 32 / 75%) + saturate(3)
 * blur(20px)) over a dark bottom hairline, flat (no gradient, no pills, no
 * white borders) — carrying the drawn forge mark on the LEFT EDGE as the
 * floating panel trigger, the surfaces as icon-only 38px pins (no text
 * labels: the name surfaces in the hover tooltip, the ::after ladder marks
 * the active surface in the runner lime) and the tray with the staging state
 * and the local time. There is no labeled start button: the mark itself is
 * the start trigger and it opens the floating navigation panel with the
 * surfaces of the app. The chrome stays neutral graphite in both themes; the
 * runner lime lives in the mark and the content accents only.
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { GitFork, LayoutDashboard, PlayCircle } from "lucide-react";
import { BrandMark } from "./BrandMark";

/** one entry of the taskbar pins and the navigation panel: a surface of the
 * app with its tile glyph (the pin shows the icon only — the name rides the
 * tooltip). */
type StartApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof LayoutDashboard;
};

/** the surfaces the theme launches, one pin/tile each (the home surface
 * pinned first; the family repo is the git-fork glyph — lucide retired the
 * brand marks). */
const START_APPS: readonly StartApp[] = [
  { href: "/", label: "home", detail: "the staging surface of the runner", icon: LayoutDashboard },
  { href: "#surface", label: "runner floor", detail: "the three jobs of the application", icon: PlayCircle },
  { href: "https://github.com/wenathlan/devthink", label: "family", detail: "the DevThink OS tree on GitHub", icon: GitFork },
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

/** the shared shell: the taskbar chrome (acrylic bar, icon pins with
 * tooltips, floating navigation panel, tray) over the page surface */
export function Shell({ children }: { children: ReactNode }) {
  const clock = useTrayClock();
  const [menuOpen, setMenuOpen] = useState(false);
  // the location hash drives the pin ladder (the surface owns its hash,
  // home owns the bare path, external links are never active)
  const [hash, setHash] = useState(() => window.location.hash);

  // the hash moves on pin clicks and anchor jumps; keep the ladder in step
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  /** the active pin by href comparison. */
  const isActive = (href: string): boolean => {
    if (href.startsWith("http")) return false;
    return href === "/" ? hash === "" : hash === href;
  };

  /** launches one panel entry: closes the panel and follows the surface. */
  function openApp(href: string) {
    setMenuOpen(false);
    if (href.startsWith("#")) {
      // no explicit behavior: the stylesheet owns the scroll motion (and its
      // reduced-motion guard turns it off); the hash syncs so the taskbar
      // ladder follows the surface
      document.querySelector(href)?.scrollIntoView();
      window.history.replaceState(null, "", href);
      setHash(href);
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
          <BrandMark size={24} />
        </button>
        {/* the pinned surfaces: icons only — the name shows in the hover
            tooltip, the ::after ladder carries the active state */}
        <nav className="dt-nav__pins" aria-label="Pinned surfaces">
          {START_APPS.map((app) => {
            const Icon = app.icon;
            const external = app.href.startsWith("http");
            const activePin = isActive(app.href);
            return (
              <a
                key={app.href}
                href={app.href}
                className="dt-nav__app"
                aria-label={app.label}
                aria-current={activePin ? "page" : undefined}
                data-open={external ? undefined : "true"}
                data-active={activePin ? "true" : undefined}
              >
                <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                <span className="dt-nav__tip" aria-hidden="true">
                  {app.label}
                </span>
              </a>
            );
          })}
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
