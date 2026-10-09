// the debonair shell of the theme.
/**
 * Shell.tsx — the ONE chrome of the theme, converted from the OS grammar to
 * the APPLICATION grammar: the routed pages render inside one Windows 11
 * application window floating over the Mica backdrop — a title bar carrying
 * the drawn debonair mark and the app name (the drag handle, double-click
 * toggles maximize), the Fluent caption buttons at the right edge (minimize
 * collapses the window into a restore chip, maximize fills the backdrop,
 * close relaunches the app at /intro) and a left rail that switches the
 * pages as the window content. The window rides the WINDOWS IDENTITY PASS
 * tokens (--win-mica, --win-shadow-window, --win-accent — the debonair
 * brass) and opens with the 250ms scale .95→1 entry; there is no taskbar,
 * no start menu and no desktop navigation anymore. Campaign v3 mark
 * discipline: the title-bar mark is the ONE mark of the platform pages — it
 * rests on the landing (data-landing), where the hero lockup owns it. The
 * chrome is a copy-per-deploy minimum: consolidation belongs to the future
 * @wenathlan/* package.
 */

import { Copy, LayoutDashboard, Library, Minus, Moon, Settings2, Sparkles, Square, Sun, Wand2, X } from "lucide-react";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "wouter";
import { currentTheme, type Theme, toggleTheme } from "../../theme";

/** one entry of the shell navigation (the legacy page prop shape, kept for
 * the anchors that type against the shell beside this folder) */
export type NavLink = { label: string; href: string };

/** one entry of the window rail: a page surface of the app with its glyph. */
export type StartApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof LayoutDashboard;
};

/** the pages the application window hosts, one rail entry each (the apex
 * home first). exported for the onboarding copy beside this folder. */
export const START_APPS: readonly StartApp[] = [
  { href: "/", label: "home", detail: "the audio home of the family", icon: LayoutDashboard },
  { href: "/generate", label: "generate", detail: "the text-to-music render queue", icon: Sparkles },
  { href: "/library", label: "library", detail: "renders, genres and statuses", icon: Library },
  { href: "/studio", label: "studio", detail: "the timeline, mixer and transport", icon: Wand2 },
  { href: "/settings", label: "settings", detail: "appearance and region", icon: Settings2 },
];

/** the hand-over route of the close caption: closing the window restarts the
 * application at the intro (the relaunch metaphor). */
const RESTART_ROUTE = "/intro";

/* ------------------------------ the drawn mark ---------------------------- */

/**
 * DebonairMark — the premium drawn icon of the chrome, rebuilt in the house
 * icon spirit (Sol/shell/app.icons.tsx): a gradient squircle face over the
 * debonair amber story, a soft top gloss, a mid layer of story orbs over a
 * pedestal band, two blurred inner contours, a contact ellipse, a discrete
 * film grain and the glyph in thick ivory strokes over a translucent
 * backing. The finishing (glow breathing, perspective tilt, glyph lift, one
 * sheen sweep on hover) is animated by Sol/sol.css — plain
 * transform/opacity/filter transitions, guarded for reduced motion. The ONE
 * signature motion of the mark is the WAVEFORM DANCE: the three middle bars
 * (the .sol-mark__bar hooks) scale in sequence on entry and on hover — never
 * on an idle loop, and reduced motion keeps the bars at rest.
 */

/** the amber story of debonair: face gradient top, glow and orb */
const MARK_STORY = "#bd7a1a";
/** the deep shade the face gradient settles into */
const MARK_DEEP = "#7c4c0a";
/** the warm subtone of the mid layer, contours and contact ellipse */
const MARK_SOFT = "#f2ddab";
/** the warm ivory of the glyph strokes */
const MARK_IVORY = "#fbf5ea";
/** the asymmetric squircle of the face: tighter shoulders, heavier base */
const MARK_SQUIRCLE = "M22 0 L74 0 Q96 0 96 22 L96 66 Q96 96 66 96 L30 96 Q0 96 0 66 L0 22 Q0 0 22 0 Z";

type MarkProps = {
  /** rendered square size in px; omitted, the mark fills its sized box */
  size?: number;
  /** hides the mark from the accessibility tree (decorative placements) */
  hidden?: boolean;
};

/** The audio DAW glyph: a five-band equalizer in full swing. The middle three
 * bars carry the sol-mark__bar hook — the waveform dance of the NEOSKILLS
 * pass plays on them (Sol/sol.css); the outer bars stay at rest. */
function MarkGlyph() {
  return (
    <>
      <rect x="27.2" y="39" width="5.6" height="18" rx="2.8" fill={MARK_IVORY} stroke="none" opacity=".78" />
      <rect
        className="sol-mark__bar"
        x="36.2"
        y="34"
        width="5.6"
        height="28"
        rx="2.8"
        fill={MARK_IVORY}
        stroke="none"
        opacity=".88"
      />
      <rect
        className="sol-mark__bar"
        x="45.2"
        y="28"
        width="5.6"
        height="40"
        rx="2.8"
        fill={MARK_IVORY}
        stroke="none"
      />
      <rect
        className="sol-mark__bar"
        x="54.2"
        y="34"
        width="5.6"
        height="28"
        rx="2.8"
        fill={MARK_IVORY}
        stroke="none"
        opacity=".88"
      />
      <rect x="63.2" y="39" width="5.6" height="18" rx="2.8" fill={MARK_IVORY} stroke="none" opacity=".78" />
    </>
  );
}

export function DebonairMark({ size, hidden }: MarkProps) {
  const vars = size ? { width: size, height: size } : undefined;
  return (
    <span className="sol-mark" style={vars} aria-hidden={hidden || undefined}>
      <span className="sol-mark__glow" />
      <svg className="sol-mark__svg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="dbnm-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MARK_STORY} />
            <stop offset=".6" stopColor={MARK_STORY} />
            <stop offset="1" stopColor={MARK_DEEP} />
          </linearGradient>
          <linearGradient id="dbnm-gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".32" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="dbnm-orb" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor={MARK_SOFT} stopOpacity=".9" />
            <stop offset=".35" stopColor={MARK_SOFT} stopOpacity=".5" />
            <stop offset="1" stopColor={MARK_SOFT} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="dbnm-edge-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MARK_SOFT} stopOpacity="0" />
            <stop offset=".45" stopColor={MARK_SOFT} stopOpacity=".3" />
            <stop offset="1" stopColor={MARK_SOFT} stopOpacity=".7" />
          </linearGradient>
          <linearGradient id="dbnm-edge-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MARK_SOFT} stopOpacity="0" />
            <stop offset=".5" stopColor={MARK_SOFT} stopOpacity=".22" />
            <stop offset="1" stopColor={MARK_SOFT} stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="dbnm-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset=".45" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset=".55" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="dbnm-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="dbnm-wide" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="dbnm-lift" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={MARK_DEEP} floodOpacity=".38" />
          </filter>
          <filter id="dbnm-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
          <clipPath id="dbnm-clip">
            <path d={MARK_SQUIRCLE} />
          </clipPath>
        </defs>

        {/* the face: gradient squircle with a soft top gloss */}
        <path d={MARK_SQUIRCLE} fill="url(#dbnm-bg)" />
        <path d={MARK_SQUIRCLE} fill="url(#dbnm-gloss)" opacity=".5" />

        <g clipPath="url(#dbnm-clip)">
          {/* the mid layer: story orbs breathing over a pedestal band */}
          <g className="sol-mark__mid">
            <circle cx="48" cy="40" r="25" fill="url(#dbnm-orb)" filter="url(#dbnm-wide)" opacity=".85" />
            <rect x="-12" y="56" width="120" height="44" fill={MARK_SOFT} opacity=".3" filter="url(#dbnm-soft)" />
          </g>

          {/* two blurred inner contours of the squircle */}
          <path
            d={MARK_SQUIRCLE}
            fill="none"
            stroke="url(#dbnm-edge-d)"
            strokeWidth="6"
            filter="url(#dbnm-wide)"
            opacity=".55"
            transform="translate(1.4 1.9) scale(0.97)"
          />
          <path
            d={MARK_SQUIRCLE}
            fill="none"
            stroke="url(#dbnm-edge-l)"
            strokeWidth="2.5"
            filter="url(#dbnm-soft)"
            opacity=".5"
          />

          {/* the contact ellipse at the base */}
          <ellipse cx="48" cy="94" rx="30" ry="7" fill="url(#dbnm-orb)" filter="url(#dbnm-soft)" opacity=".55" />

          {/* the sheen band sweeping once on hover */}
          <g className="sol-mark__sheen">
            <rect x="-11" y="-24" width="26" height="144" fill="url(#dbnm-sheen)" transform="skewX(-16)" />
          </g>

          {/* the discrete film grain */}
          <path d={MARK_SQUIRCLE} fill="#ffffff" filter="url(#dbnm-grain)" opacity=".08" />
        </g>

        {/* the glyph: thick ivory strokes lifting toward the viewer */}
        <g filter="url(#dbnm-lift)">
          <g
            className="sol-mark__glyph"
            fill="none"
            stroke={MARK_IVORY}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <MarkGlyph />
          </g>
        </g>
      </svg>
    </span>
  );
}

/* ------------------------------ the window -------------------------------- */

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
  const [theme, setTheme] = useState<Theme>(currentTheme());
  return (
    <button type="button" className="winapp__theme" aria-label="toggle theme" onClick={() => setTheme(toggleTheme())}>
      {theme === "dark" ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
      {theme}
    </button>
  );
}

/** the window props: the routed page plus the legacy page props the pages
 * still pass (name, domain, cta, footer links, container width, brand) — the
 * window grammar names itself, so only the theme toggle switch is consumed. */
type ShellProps = {
  children: ReactNode;
  name?: string;
  nav?: readonly NavLink[];
  cta?: NavLink;
  contained?: boolean;
  footerLinks?: readonly NavLink[];
  themeButton?: boolean;
  domain?: string;
  brand?: ReactNode;
};

/**
 * the application window: title bar (brand, drag, caption buttons), page
 * rail and the routed stage, floating over the Mica backdrop.
 *
 * @param children the routed page.
 * @returns the window element.
 */
export function Shell({ children, themeButton = true }: ShellProps) {
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
        data-landing={location === "/" ? "true" : undefined}
        hidden={minimized}
        data-maximized={maximized ? "true" : undefined}
        aria-label="debonair"
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
            <DebonairMark size={20} hidden />
            <span className="winapp__name">debonair</span>
            <span className="winapp__role">the audio home of the family</span>
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
            {themeButton ? (
              <div className="winapp__railfoot">
                <ThemeToggle />
              </div>
            ) : null}
          </nav>
          <div className="winapp__stage">
            <main className="shell">{children}</main>
          </div>
        </div>
      </section>

      {minimized && (
        <button type="button" className="winchip" aria-label="Restore debonair" onClick={() => setMinimized(false)}>
          <DebonairMark size={16} hidden />
          <span>debonair</span>
        </button>
      )}
    </div>
  );
}

export default Shell;
