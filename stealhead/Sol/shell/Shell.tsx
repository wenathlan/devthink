// the stealhead shell of the theme.
/**
 * Shell.tsx — the shared shell of the Sol theme: the top navigation
 * (brand, links, theme toggle) and the footer wrap every page. the
 * active link is marked for the css sliding indicator via wouter's
 * useLocation.
 */
import type { ReactNode } from "react";
import { Crosshair, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { currentTheme, toggleTheme, type ThemeName } from "../theme";

/** the navigation entries of the platform. */
const navlinks: { href: string; label: string }[] = [
  { href: "/", label: "home" },
  { href: "/match", label: "match" },
  { href: "/ranking", label: "ranking" },
  { href: "/weapons", label: "weapons" },
  { href: "/world", label: "world" },
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
      className="btn secondary small theme-toggle"
      aria-label="toggle theme"
      onClick={() => setTheme(toggleTheme())}
    >
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      {theme}
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
      <header className="topnav">
        <Link href="/" className="brand" aria-label="stealhead home">
          <span className="brand-orb" aria-hidden="true">
            <Crosshair size={15} />
          </span>
          stealhead
        </Link>
        <nav aria-label="primary">
          {navlinks.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isactive(link.href) ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="cta">
          <ThemeToggle />
        </div>
      </header>
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
