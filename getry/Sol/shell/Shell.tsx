// the getry shell of the theme.
/**
 * Shell.tsx — the ONE chrome of the theme, the DevThink fusion standard
 * (devthink/Sol/shell/ShellChrome.tsx): a thin floating navbar pinned to
 * the top — dark graphite glass with dark hairlines, never a white border —
 * carrying the brand tile with the reasoning violet tint, the essential
 * links and the tray with the theme toggle. The chrome stays neutral
 * graphite in both themes; the violet lives in the tile tint and the
 * content accents. the footer wraps every page under the routed surface.
 */
import type { ReactNode } from "react";
import { DoorOpen, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { currentTheme, toggleTheme, type ThemeName } from "../../theme";

/** the navigation entries of the gateway. */
const navlinks: { href: string; label: string }[] = [
  { href: "/", label: "home" },
  { href: "/versions", label: "versions" },
  { href: "/thinking", label: "thinking" },
  { href: "/sessions", label: "sessions" },
];

/**
 * the theme toggle button: flips the in-memory theme, stores nothing.
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
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      <span>{theme}</span>
    </button>
  );
}

/**
 * the application shell.
 *
 * @param children the routed page.
 * @returns the shell element.
 */
export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isactive = (href: string) => (href === "/" ? location === "/" : location.startsWith(href));
  return (
    <div className="appframe">
      <header className="dt-nav">
        <Link href="/" className="dt-nav__brand">
          <span className="dt-tile" aria-hidden="true">
            <DoorOpen size={13} strokeWidth={1.7} />
          </span>
          <strong>getry</strong>
        </Link>
        <nav className="dt-nav__links" aria-label="Essential areas">
          {navlinks.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isactive(link.href) ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="dt-nav__tray">
          <ThemeToggle />
        </div>
      </header>
      <main className="shell">{children}</main>
      <footer className="footer">
        <span>getry — the AI gateway of the wenathlan family</span>
        <span className="spacer" />
        <span>
          five provider gateways, 35 OpenAI-compatible routes, the 7-level thinking system and the session store on one
          Sol surface
        </span>
      </footer>
    </div>
  );
}

export default Shell;
