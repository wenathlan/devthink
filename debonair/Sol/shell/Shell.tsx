// the debonair shell of the theme.
/**
 * Shell.tsx — the ONE chrome of the theme, converted from the OS grammar to
 * the APPLICATION grammar: the routed pages render inside one Windows 11
 * application window floating over the trylle canvas — a title bar carrying
 * the drawn debonair mark and the app name (the drag handle, double-click
 * toggles maximize), the Fluent caption buttons at the right edge (minimize
 * collapses the window into a restore chip, maximize fills the backdrop,
 * close relaunches the app at /intro), the eight resize handles of the real
 * window chrome and the inactive law (an unfocused window turns
 * grayscale). The pages switch through the 48px Windows pin rail: 38×38 r4
 * pins riding the pin law — the hover wash, the press at scale .7, the
 * dtPopIntro entrance and the ladder indicator — with the acrylic tooltip
 * naming the page; the rail foot carries the family dots. The window rides
 * the trylle foundation with the Windows hands (the trylle surfaces and
 * hairlines, the Fluent window shadow, the 250ms scale .95→1 entry at the
 * window curve; the debonair brass stays the identity accent of the mark
 * and the content). Campaign v3 mark discipline: the title-bar mark is the
 * ONE mark of the platform pages — it rests on the landing (data-landing),
 * where the hero lockup owns it. The chrome is a copy-per-deploy minimum:
 * consolidation belongs to the future @wenathlan/* package.
 */

import {
  ArrowUploadRegular,
  CopyRegular,
  DismissRegular,
  HomeRegular,
  LibraryRegular,
  MaximizeRegular,
  SettingsRegular,
  SparkleRegular,
  SubtractRegular,
  WandRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from "@fluentui/react-icons";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "wouter";
import { familyrow } from "../../family.ts";
import { familyurl } from "../../familyurl.ts";
import { currentTheme, type Theme, toggleTheme } from "../../theme.ts";
import { Playerbar } from "../widgets/shell.playerbar.tsx";

/** one entry of the shell navigation (the legacy page prop shape, kept for
 * the anchors that type against the shell beside this folder) */
export type NavLink = { label: string; href: string };

/** one entry of the window rail: a page surface of the app with its glyph. */
export type StartApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof HomeRegular;
};

/** the pages the application window hosts, one rail entry each (the apex
 * home first). exported for the onboarding copy beside this folder. */
export const START_APPS: readonly StartApp[] = [
  { href: "/", label: "home", detail: "the audio home of the family", icon: HomeRegular },
  { href: "/generate", label: "generate", detail: "the text-to-music composer", icon: SparkleRegular },
  { href: "/ingest", label: "ingest", detail: "the decomposition bench of real tracks", icon: ArrowUploadRegular },
  { href: "/library", label: "library", detail: "the session takes and samples", icon: LibraryRegular },
  { href: "/studio", label: "studio", detail: "the timeline, rack, mixer and transport", icon: WandRegular },
  { href: "/settings", label: "settings", detail: "appearance and region", icon: SettingsRegular },
];

// the family row the rail foot draws: the family table (family.ts) holds the
// one spec §12 accent each sibling carries, so the row can never drift from
// the landing footer or the contract tests.

/** the hand-over route of the close caption: closing the window restarts the
 * application at the intro (the relaunch metaphor — the intro itself
 * consults the seen flags, so a finished visitor lands home). */
const RESTART_ROUTE = "/intro";

/** the eight resize edges of the window chrome (the Windows handles). */
const RESIZE_EDGES = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;

/** the edge set as a type. */
type ResizeEdge = (typeof RESIZE_EDGES)[number];

/** the smallest window the resize allows (px). */
const MIN_SIZE = { w: 640, h: 440 } as const;

/** one pointer session over a resize handle: the edge, where the press
 * started and the window size it carried when it did. */
type ResizeTrack = {
  pointerId: number;
  edge: ResizeEdge;
  originX: number;
  originY: number;
  baseW: number;
  baseH: number;
};

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
  return (
    <button type="button" className="icon-anim" aria-label="toggle theme" onClick={() => setTheme(toggleTheme())}>
      {theme === "dark" ? (
        <WeatherSunnyRegular fontSize={16} aria-hidden="true" />
      ) : (
        <WeatherMoonRegular fontSize={16} aria-hidden="true" />
      )}
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
 * the application window: title bar (brand, drag, theme, caption buttons),
 * the Windows pin rail and the routed stage, floating over the trylle
 * canvas.
 *
 * @param children the routed page.
 * @returns the window element.
 */
export function Shell({ children, themeButton = true }: ShellProps) {
  // the embedded contract: inside the os power clip the app rides the host
  // window chrome — the routed stage renders bare, full-bleed in the frame
  const framed = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  const [location, navigate] = useLocation();
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [inactive, setInactive] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const trackRef = useRef<DragTrack | null>(null);
  const resizeRef = useRef<ResizeTrack | null>(null);
  const winRef = useRef<HTMLElement | null>(null);

  // the Windows inactive law: the window the document lost turns grayscale
  useEffect(() => {
    const sync = (): void => setInactive(!document.hasFocus());
    sync();
    window.addEventListener("focus", sync);
    window.addEventListener("blur", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("blur", sync);
    };
  }, []);

  /** clamps a resize candidate to the viewport and the minimum window size. */
  function clampSize(w: number, h: number): { w: number; h: number } {
    const maxW = Math.max(MIN_SIZE.w, window.innerWidth - 24);
    const maxH = Math.max(MIN_SIZE.h, window.innerHeight - 24);
    return { w: Math.min(maxW, Math.max(MIN_SIZE.w, w)), h: Math.min(maxH, Math.max(MIN_SIZE.h, h)) };
  }

  /** maximizes over the backdrop or restores the windowed frame (the drag
   * offset resets, the resized frame gives way). */
  function toggleMaximize() {
    setDrag({ x: 0, y: 0 });
    setSize(null);
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

  /** arms a resize session from one of the eight handles. */
  function onResizePointerDown(edge: ResizeEdge) {
    return (event: ReactPointerEvent<HTMLSpanElement>) => {
      if (maximized) return;
      const rect = winRef.current?.getBoundingClientRect();
      if (!rect) return;
      resizeRef.current = {
        pointerId: event.pointerId,
        edge,
        originX: event.clientX,
        originY: event.clientY,
        baseW: rect.width,
        baseH: rect.height,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    };
  }

  /** rides the pointer while a resize session is armed (the window owns the
   * size — the drag offset resets so the bar stays reachable). */
  function onResizePointerMove(event: ReactPointerEvent<HTMLSpanElement>) {
    const track = resizeRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    const dx = event.clientX - track.originX;
    const dy = event.clientY - track.originY;
    const east = track.edge.includes("e");
    const west = track.edge.includes("w");
    const south = track.edge.includes("s");
    const north = track.edge.includes("n");
    const width = east ? track.baseW + dx : west ? track.baseW - dx : track.baseW;
    const height = south ? track.baseH + dy : north ? track.baseH - dy : track.baseH;
    setSize(clampSize(width, height));
    if (west || north) setDrag({ x: 0, y: 0 });
  }

  /** releases the resize session. */
  function onResizePointerUp(event: ReactPointerEvent<HTMLSpanElement>) {
    const track = resizeRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  // the active rail entry: the bare path owns home, every other page owns its route
  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);

  // the embedded pass renders before the chrome: one window, one frame
  if (framed) return <main className="shell shell--embedded">{children}</main>;

  return (
    <div className="appframe" data-maximized={maximized ? "true" : undefined}>
      <section
        ref={winRef}
        className="winapp"
        data-landing={location === "/" ? "true" : undefined}
        hidden={minimized}
        data-maximized={maximized ? "true" : undefined}
        data-sized={size && !maximized ? "true" : undefined}
        data-inactive={inactive ? "true" : undefined}
        aria-label="debonair"
        style={
          {
            "--winapp-x": `${drag.x}px`,
            "--winapp-y": `${drag.y}px`,
            ...(size && !maximized ? { width: size.w, height: size.h } : {}),
          } as CSSProperties
        }
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
            {themeButton ? <ThemeToggle /> : null}
            <button type="button" className="winapp__cap" aria-label="Minimize" onClick={() => setMinimized(true)}>
              <SubtractRegular fontSize={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="winapp__cap"
              aria-label={maximized ? "Restore" : "Maximize"}
              onClick={toggleMaximize}
            >
              {maximized ? (
                <CopyRegular fontSize={12} aria-hidden="true" />
              ) : (
                <MaximizeRegular fontSize={11} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className="winapp__cap winapp__cap--close"
              aria-label="Close"
              onClick={() => navigate(RESTART_ROUTE)}
            >
              <DismissRegular fontSize={14} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* the body: the Windows pin rail beside the routed stage — the mount
            pops the pins in (dtPopIntro, staggered), the ladder indicator
            marks hover and the active page, the acrylic tooltip names it and
            the rail foot carries the family row (one accent dot per sibling,
            resolved through the familyurl contract so every link survives
            any mount point) */}
        <div className="winapp__body">
          <nav className="railnav railnav--enter" aria-label="primary">
            {START_APPS.map((app) => {
              const Icon = app.icon;
              return (
                <Link
                  key={app.href}
                  href={app.href}
                  className="railnav__item"
                  data-tip={app.label}
                  aria-label={app.label}
                  aria-current={isActive(app.href) ? "page" : undefined}
                >
                  <Icon fontSize={20} aria-hidden="true" />
                </Link>
              );
            })}
            <fieldset className="railnav__foot" aria-label="the wenathlan family">
              {familyrow().map((member) => (
                <a
                  key={member.slug}
                  className="railnav__fam"
                  href={familyurl(member.slug)}
                  target="_blank"
                  rel="noreferrer"
                  title={`${member.slug} — a family surface`}
                >
                  <span aria-hidden="true" className="railnav__famdot" style={{ background: member.accent }} />
                  <span className="sr-only">{`open ${member.slug} in its own tab`}</span>
                </a>
              ))}
            </fieldset>
          </nav>
          <div className="winapp__stage">
            <main className="shell">{children}</main>
          </div>
        </div>

        {/* the suno bar: the one bottom chrome of the application window —
            cover, title, the shared transport's lane and the play keys */}
        <Playerbar />

        {/* the eight resize handles of the window chrome (n/s/e/w + the corners) */}
        {RESIZE_EDGES.map((edge) => (
          <span
            key={edge}
            data-edge={edge}
            className="winapp__rz"
            aria-hidden="true"
            onPointerDown={onResizePointerDown(edge)}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onPointerCancel={onResizePointerUp}
          />
        ))}
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
