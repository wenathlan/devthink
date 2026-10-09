// the stealhead shell of the theme.
/**
 * Shell.tsx — the ONE chrome of the theme, converted from the OS grammar to
 * the APPLICATION grammar (FAM-APPS-B): the routed pages render inside one
 * Windows 11 application window floating over the Mica backdrop — a title
 * bar carrying the drawn stealhead mark and the app name (the drag handle,
 * double-click toggles maximize), the Fluent caption buttons at the right
 * edge (minimize collapses the window into a restore chip, maximize fills
 * the backdrop, close relaunches the app at /intro) and a left rail that
 * switches the pages as the window content. The window rides the WINDOWS
 * IDENTITY PASS tokens (--win-mica, --win-shadow-window, --win-accent) and
 * opens with the 250ms scale .95→1 entry; there is no taskbar, no start
 * menu and no desktop navigation anymore. The rail foot carries the FAMILY
 * section (wave D1 polish): the sibling applications of the wenathlan family
 * as accent-dotted links built by the familyurl helper — the family
 * redirects both ways. The chrome is a copy-per-deploy minimum:
 * consolidation belongs to the future @wenathlan/* package.
 */

import { Copy, Crosshair, Globe, LayoutDashboard, Minus, Moon, Square, Sun, Swords, Trophy, X } from "lucide-react";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "wouter";
import { familyurl } from "../../familyurl";
import { currentTheme, type ThemeName, toggleTheme } from "../../theme";
import { BrandMark } from "./BrandMark";

/** one entry of the window rail: a page surface of the app with its glyph. */
export type StartApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof LayoutDashboard;
};

/** the pages the application window hosts, one rail entry each in the
 * grammar order (home, match, weapons, world, ranking). exported for the
 * onboarding copy beside this folder. */
export const START_APPS: readonly StartApp[] = [
  { href: "/", label: "home", detail: "the FPS platform of the family", icon: LayoutDashboard },
  { href: "/match", label: "match", detail: "lobbies, rounds and live seats", icon: Swords },
  { href: "/weapons", label: "weapons", detail: "armory grid with damage stats", icon: Crosshair },
  { href: "/world", label: "world", detail: "hash-verified GLB world assets", icon: Globe },
  { href: "/ranking", label: "ranking", detail: "the competitive ladder of the season", icon: Trophy },
];

/** one entry of the rail-foot family section: a sibling application with
 * its identity accent (the family accents of the campaign). */
export type FamilyApp = {
  slug: string;
  name: string;
  accent: string;
};

/** the family the rail foot links: the DevThink OS and every sibling
 * application, in the campaign order. exported for the family tests. */
export const FAMILY_APPS: readonly FamilyApp[] = [
  { slug: "devthink", name: "devthink", accent: "#ff5f00" },
  { slug: "cadria", name: "cadria", accent: "#f472b6" },
  { slug: "debonair", name: "debonair", accent: "#a78bfa" },
  { slug: "argan", name: "argan", accent: "#1dcf64" },
  { slug: "saddle", name: "saddle", accent: "#d6b483" },
  { slug: "forge", name: "forge", accent: "#fb923c" },
  { slug: "foundry", name: "foundry", accent: "#d97706" },
  { slug: "vault", name: "vault", accent: "#eab308" },
  { slug: "getry", name: "getry", accent: "#60a5fa" },
];

/** the hand-over route of the close caption: closing the window restarts the
 * application at the intro (the relaunch metaphor). */
const RESTART_ROUTE = "/intro";

/** one pointer session over the title bar: where the press started and the
 * offset the window carried when it did. */
type DragTrack = {
  pointerId: number;
  originX: number;
  originY: number;
  baseX: number;
  baseY: number;
};

/** keeps the dragged title bar reachable: the offset never slides the bar
 * fully off screen, so the window can always be grabbed back. */
function clampDrag(x: number, y: number): { x: number; y: number } {
  const spanX = Math.max(window.innerWidth / 2 - 80, 0);
  const spanY = Math.max(window.innerHeight / 2 - 60, 0);
  return { x: Math.min(spanX, Math.max(-spanX, x)), y: Math.min(spanY, Math.max(-spanY, y)) };
}

/**
 * the theme flip of the rail foot: flips the in-memory theme, stores nothing.
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>(currentTheme());
  return (
    <button type="button" className="winapp__theme" aria-label="toggle theme" onClick={() => setTheme(toggleTheme())}>
      {theme === "dark" ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
      {theme}
    </button>
  );
}

/**
 * the application window: title bar (brand, drag, caption buttons), page
 * rail and the routed stage, floating over the Mica backdrop.
 *
 * @param children the routed page.
 * @returns the window element.
 */
export function Shell({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const trackRef = useRef<DragTrack | null>(null);

  /** maximizes over the backdrop or restores the windowed frame (the drag offset resets). */
  function toggleMaximize() {
    setDrag({ x: 0, y: 0 });
    setMaximized((value) => !value);
  }

  /** arms a drag when the pointer presses the empty bar (never the caption buttons). */
  function onTitlePointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (maximized) return;
    if ((event.target as HTMLElement).closest("button, a, input")) return;
    trackRef.current = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      baseX: drag.x,
      baseY: drag.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  /** rides the pointer while a drag session is armed. */
  function onTitlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const track = trackRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    setDrag(clampDrag(track.baseX + event.clientX - track.originX, track.baseY + event.clientY - track.originY));
  }

  /** releases the drag session. */
  function onTitlePointerUp(event: ReactPointerEvent<HTMLElement>) {
    const track = trackRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    trackRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  /** the Windows affordance: a double click on the empty bar toggles maximize. */
  function onTitleDoubleClick(event: ReactMouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button, a, input")) return;
    toggleMaximize();
  }

  // the active rail entry: the bare path owns home, every other page owns its route
  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);

  return (
    <div className="appframe" data-maximized={maximized ? "true" : undefined}>
      <section
        className="winapp"
        hidden={minimized}
        data-maximized={maximized ? "true" : undefined}
        aria-label="stealhead"
        style={{ "--winapp-x": `${drag.x}px`, "--winapp-y": `${drag.y}px` } as CSSProperties}
      >
        {/* biome-ignore lint/a11y/noStaticElementInteractions: the title bar is the drag surface; the window controls inside it are real buttons */}
        <header
          className="winapp__title"
          data-dragging={trackRef.current ? "true" : undefined}
          onPointerDown={onTitlePointerDown}
          onPointerMove={onTitlePointerMove}
          onPointerUp={onTitlePointerUp}
          onPointerCancel={onTitlePointerUp}
          onDoubleClick={onTitleDoubleClick}
        >
          <div className="winapp__brand">
            <BrandMark size={20} />
            <span className="winapp__name">stealhead</span>
            <span className="winapp__role">the FPS game platform of the wenathlan family</span>
          </div>
          <div className="winapp__caption">
            <button type="button" className="winapp__cap" aria-label="Minimize" onClick={() => setMinimized(true)}>
              <Minus size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="winapp__cap"
              aria-label={maximized ? "Restore" : "Maximize"}
              onClick={toggleMaximize}
            >
              {maximized ? <Copy size={12} aria-hidden="true" /> : <Square size={11} aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="winapp__cap winapp__cap--close"
              aria-label="Close"
              onClick={() => navigate(RESTART_ROUTE)}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="winapp__body">
          <nav className="winapp__rail" aria-label="Pages">
            <p className="winapp__railhead" aria-hidden="true">
              pages
            </p>
            {START_APPS.map((app) => {
              const Icon = app.icon;
              return (
                <Link
                  key={app.href}
                  href={app.href}
                  className="winapp__raillink"
                  title={app.detail}
                  aria-label={app.label}
                  aria-current={isActive(app.href) ? "page" : undefined}
                >
                  <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                  <span className="winapp__raillabel">{app.label}</span>
                </Link>
              );
            })}
            <div className="winapp__railfoot">
              <p className="winapp__familyhead" aria-hidden="true">
                family
              </p>
              <div className="winapp__family">
                {FAMILY_APPS.map((app) => (
                  <a
                    key={app.slug}
                    className="winapp__famlink"
                    href={familyurl(app.slug)}
                    target="_blank"
                    rel="noreferrer"
                    title={`${app.name} — opens in a new tab`}
                    aria-label={`open ${app.name} in a new tab`}
                    style={{ "--fam-dot": app.accent } as CSSProperties}
                  >
                    <span className="winapp__famdot" aria-hidden="true" />
                    <span className="winapp__famlabel">{app.name}</span>
                  </a>
                ))}
              </div>
              <ThemeToggle />
            </div>
          </nav>
          <div className="winapp__stage">
            <main className="shell">{children}</main>
          </div>
        </div>
      </section>

      {minimized && (
        <button type="button" className="winchip" aria-label="Restore stealhead" onClick={() => setMinimized(false)}>
          <BrandMark size={16} />
          <span>stealhead</span>
        </button>
      )}
    </div>
  );
}

export default Shell;
