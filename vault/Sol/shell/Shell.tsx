/**
 * Shell.tsx — the ONE chrome of the theme, the DevThink fusion standard
 * (devthink/Sol/shell/ShellChrome.tsx): a thin floating navbar pinned to
 * the top — dark graphite glass with dark hairlines, never a white border —
 * carrying the brand tile with the vault ice tint, the essential links and
 * the tray with the staging state and the local time. The chrome stays
 * neutral graphite in both themes; the ice light lives in the tile tint and
 * the content accents.
 */
import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";

/** the essential links of the navbar (the page tabs stay on the home surface) */
const NAV_LINKS = [
  { href: "#surface", label: "the safe" },
  { href: "https://github.com/wenathlan/devthink", label: "family" },
] as const;

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

/** the shared shell: the fusion navbar over the page surface */
export function Shell({ children }: { children: ReactNode }) {
  const clock = useTrayClock();
  return (
    <>
      <header className="dt-nav">
        <a href="/" className="dt-nav__brand">
          <span className="dt-tile" aria-hidden="true">
            <Lock size={13} strokeWidth={1.7} />
          </span>
          <strong>vault</strong>
        </a>
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
      {children}
    </>
  );
}

export default Shell;
