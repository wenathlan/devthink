/**
 * Shell.tsx — the ONE chrome of the theme, rebuilt on the PLATFORM grammar
 * (cadria is a SaaS application, not an OS window): a 44px titlebar carrying
 * the ONE brand slot (BrandMark — the monochrome lockup, never repeated), the
 * current page title as a mono-label, a quiet back-to-intro affordance and
 * the session theme flip; below it a 48px fixed icon rail (home, studio,
 * gallery, player, settings — the active page marked by the rose rail bar)
 * and the routed stage. No window controls, no drag, no family tiles: the
 * intro footer owns the family row now. The chrome styles ride the sol.css
 * primitives (.titlebar .railnav .icon-anim .appframe); the only css the
 * shell owns is the glue block below (skip link, stage gutter, the page
 * transition — 250ms window ease, fade + 4px rise). Session scope only: the
 * theme flip writes a data-theme attribute on <html> and nothing else — zero
 * storage, zero persistence.
 *
 * Compat: the window-era props (name, nav, cta, contained, footerLinks,
 * themeButton, domain) stay accepted so the page anchors keep compiling; the
 * frame names itself and only themeButton is consumed.
 */

import { ArrowLeft, Image, LayoutDashboard, Moon, PlayCircle, Settings2, Sun, Wand2 } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { currentTheme, type Theme, toggleTheme } from "../../theme.ts";
import BrandMark from "./BrandMark.tsx";

export { CadriaMark } from "./CadriaMark.tsx";

/** one entry of the shell navigation (the legacy page prop shape, kept for
 * the anchors that type against the shell beside this folder) */
export type NavLink = { label: string; href: string };

/** one entry of the icon rail: a page surface of the app with its glyph. */
export type StartApp = {
  href: string;
  label: string;
  detail: string;
  icon?: typeof LayoutDashboard;
};

/** the pages the platform hosts, one rail entry each (the apex home first).
 * exported for the onboarding copy beside this folder. */
export const START_APPS: readonly StartApp[] = [
  { href: "/", label: "home", detail: "the video and image home of the family", icon: LayoutDashboard },
  { href: "/player", label: "player", detail: "the 24-format universal player", icon: PlayCircle },
  { href: "/studio", label: "studio", detail: "the creative workspace over the versawase engine", icon: Wand2 },
  { href: "/gallery", label: "gallery", detail: "renders by discipline, video and image", icon: Image },
  { href: "/settings", label: "settings", detail: "appearance and player defaults", icon: Settings2 },
];

/** the titlebar page titles, route → mono-label (the rail labels plus the
 * two framed pages that stay off the rail). */
const ROUTE_TITLES: Readonly<Record<string, string>> = {
  "/": "home",
  "/studio": "studio",
  "/gallery": "gallery",
  "/player": "player",
  "/settings": "settings",
  "/onboarding": "first run",
  "/404": "not found",
};

/** the titlebar title for a location: the rail page, the framed extras, or
 * the not-found label for everything else. */
function routeTitle(location: string): string {
  if (ROUTE_TITLES[location]) return ROUTE_TITLES[location];
  const base = `/${location.split("/")[1] ?? ""}`;
  return ROUTE_TITLES[base] ?? "not found";
}

/** SSR-safe read of the session theme: the document may not exist while
 * rendering on the server, so the sol dark default answers for it. */
function sessionTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return currentTheme();
}

/**
 * the theme flip of the titlebar: flips the in-memory theme on <html>,
 * stores nothing (session scope, per the family storage law).
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(sessionTheme);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="icon-anim"
      title={`${next} theme`}
      aria-label={`switch to the ${next} theme`}
      onClick={() => setTheme(toggleTheme())}
    >
      {theme === "dark" ? (
        <Sun size={16} strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Moon size={16} strokeWidth={1.5} aria-hidden="true" />
      )}
    </button>
  );
}

/** the glue css of the chrome: the skip link, the stage gutter and the page
 * transition (fade + 4px rise on the window ease; the reduced-motion guard
 * of sol.css covers it). everything else rides the sol.css primitives. */
const SHELL_CSS = `
.sol-skip { position: fixed; top: -56px; left: 12px; z-index: var(--z-toast); padding: 10px 14px; border: 1px solid var(--line-strong); border-radius: var(--radius-md); background: var(--surface-1); color: var(--ink); font-size: 13px; font-weight: 600; transition: top var(--dur-1) var(--ease-out); }
.sol-skip:focus-visible { top: 12px; }
.sol-stage { scrollbar-gutter: stable; }
.sol-page { animation: solPageIn var(--dur-2) var(--ease-window) backwards; outline: none; }
@keyframes solPageIn { from { opacity: 0; transform: translateY(4px); } }
`;

/** the shell props: the routed page plus the legacy window-era props the
 * page anchors still pass — accepted for compilation, only themeButton is
 * consumed (the frame grammar names itself). */
type ShellProps = {
  children: ReactNode;
  name?: string;
  nav?: readonly NavLink[];
  cta?: NavLink;
  contained?: boolean;
  footerLinks?: readonly NavLink[];
  themeButton?: boolean;
  domain?: string;
};

/**
 * the platform chrome: titlebar (the ONE brand slot, the page title, back to
 * intro, the theme flip), the 48px icon rail and the routed stage.
 *
 * @param children the routed page.
 * @returns the frame element.
 */
export function Shell({ children, themeButton = true }: ShellProps) {
  const [location] = useLocation();
  const stageRef = useRef<HTMLDivElement | null>(null);

  // every navigation lands at the top of the stage (the scroll lives on the
  // stage column, so the rail and the titlebar never move)
  // biome-ignore lint/correctness/useExhaustiveDependencies: the location change is the reset trigger
  useEffect(() => {
    stageRef.current?.scrollTo({ top: 0 });
  }, [location]);

  // the bare path (no search) drives the title and the active rail entry:
  // the bare path owns home, every other page owns its route
  const path = location.split("?")[0] ?? "/";
  const isActive = (href: string): boolean =>
    href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);

  return (
    <div className="appframe" style={{ padding: 0 }}>
      <style>{SHELL_CSS}</style>
      <a className="sol-skip" href="#sol-main">
        skip to content
      </a>

      {/* the titlebar: ONE brand slot, the page title, the quiet exits */}
      <header className="titlebar">
        <BrandMark size={18} />
        <span aria-hidden="true" style={{ color: "var(--ink-3)", flex: "none" }}>
          ·
        </span>
        <span className="titlebar__role mono-label">{routeTitle(location)}</span>
        <span className="titlebar__spacer" />
        <Link href="/intro" className="icon-anim" title="back to intro" aria-label="back to intro">
          <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
        </Link>
        {themeButton ? <ThemeToggle /> : null}
      </header>

      {/* the body: the fixed icon rail beside the routed stage */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <nav className="railnav" aria-label="primary" style={{ borderRight: "1px solid var(--line)" }}>
          {START_APPS.map((app) => {
            const Icon = app.icon ?? LayoutDashboard;
            return (
              <Link
                key={app.href}
                href={app.href}
                className="railnav__item"
                title={app.detail}
                aria-label={app.label}
                aria-current={isActive(app.href) ? "page" : undefined}
              >
                <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            );
          })}
        </nav>
        <div
          ref={stageRef}
          className="sol-stage"
          style={{ flex: 1, minWidth: 0, overflowY: "auto", background: "var(--bg)" }}
        >
          <main id="sol-main" key={location} tabIndex={-1} className="sol-page">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Shell;
