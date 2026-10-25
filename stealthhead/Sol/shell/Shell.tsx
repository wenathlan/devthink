// the stealthhead shell of the theme.
/**
 * Shell.tsx — the ONE chrome of the theme, riding the APPLICATION grammar
 * over the trylle canvas: the routed pages render inside one Windows 11
 * application window — a title bar carrying the drawn stealthhead mark and
 * the app name (the drag handle, double-click toggles maximize), the Fluent
 * caption buttons at the right edge (minimize collapses the window into a
 * restore chip, maximize fills the backdrop, close relaunches the app at
 * /intro), the eight resize handles of the real window chrome (functional
 * pointer sessions, clamped to the viewport) and a left rail of page pins
 * with the Windows hands — the press rides scale(.7), the mount pops the
 * pins in, the state ladder marks hover/active. A window the document is
 * not focused on turns inactive — grayscale(80%), the Windows law. The
 * window opens with the 250ms Fluent scale .95→1 entry; there is no
 * taskbar, no start menu and no desktop navigation anymore. The rail foot
 * carries the FAMILY section (wave D1 polish): the sibling applications of
 * the wenathlan family as accent-dotted links built by the familyurl
 * helper — the family redirects both ways. The chrome is a copy-per-deploy
 * minimum: consolidation belongs to the future @wenathlan/* package.
 */

import {
  CopyRegular as Copy,
  TargetRegular as Crosshair,
  GlobeRegular as Globe,
  TableRegular as LayoutDashboard,
  SubtractRegular as Minus,
  WeatherMoonRegular as Moon,
  SquareRegular as Square,
  WeatherSunnyRegular as Sun,
  FlashRegular as Swords,
  TrophyRegular as Trophy,
  DismissRegular as X,
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
import { type LabelKey, labelfill, label } from "../../labels";
import { currentTheme, type ThemeName, toggleTheme } from "../../theme.ts";
import { BrandMark } from "../widgets/ShellBrandmark";

/** one entry of the window rail: a page surface of the app with its glyph.
 * the text rides the label accessor — the keys answer the store. */
export type StartApp = {
  href: string;
  labelKey: LabelKey;
  detailKey: LabelKey;
  icon: typeof LayoutDashboard;
};

/** the pages the application window hosts, one rail entry each in the
 * grammar order (home, match, weapons, world, ranking). exported for the
 * onboarding copy beside this folder. */
export const START_APPS: readonly StartApp[] = [
  { href: "/", labelKey: "shell.rail.home", detailKey: "shell.rail.homeDetail", icon: LayoutDashboard },
  { href: "/match", labelKey: "shell.rail.match", detailKey: "shell.rail.matchDetail", icon: Swords },
  { href: "/weapons", labelKey: "shell.rail.weapons", detailKey: "shell.rail.weaponsDetail", icon: Crosshair },
  { href: "/world", labelKey: "shell.rail.world", detailKey: "shell.rail.worldDetail", icon: Globe },
  { href: "/ranking", labelKey: "shell.rail.ranking", detailKey: "shell.rail.rankingDetail", icon: Trophy },
];

/** the hand-over route of the close caption: closing the window restarts the
 * application at the intro (the relaunch metaphor). Campaign v3 · r3-stealthhead
 * nav polish: the window carries data-landing on the home route so the
 * landing zone owns the mark (the title-bar mark rests there, CSS-enforced).
 * The family row itself rides the shared family.ts table (spec §12) — the
 * same row the vitest suite pins, so the rail foot can never drift. */
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

/**
 * the theme flip of the rail foot: flips the in-memory theme, stores nothing.
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>(currentTheme());
  return (
    <button type="button" className="winapp__theme" aria-label={label("shell.theme.aria")} onClick={() => setTheme(toggleTheme())}>
      {theme === "dark" ? <Sun fontSize={14} aria-hidden="true" /> : <Moon fontSize={14} aria-hidden="true" />}
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
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [inactive, setInactive] = useState(false);
  const trackRef = useRef<DragTrack | null>(null);
  const resizeRef = useRef<ResizeTrack | null>(null);
  const winRef = useRef<HTMLElement | null>(null);

  // the Windows inactive law: a window the document is not focused on turns
  // grayscale — the state rides the document focus alone (session scope)
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
    return {
      w: Math.min(maxW, Math.max(MIN_SIZE.w, Math.round(w))),
      h: Math.min(maxH, Math.max(MIN_SIZE.h, Math.round(h))),
    };
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
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
    };
  }

  /** rides the pointer while a resize session is armed. */
  function onResizePointerMove(event: ReactPointerEvent<HTMLSpanElement>) {
    const track = resizeRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    const dx = event.clientX - track.originX;
    const dy = event.clientY - track.originY;
    let w = track.baseW;
    let h = track.baseH;
    if (track.edge.includes("e")) w = track.baseW + dx;
    if (track.edge.includes("w")) w = track.baseW - dx;
    if (track.edge.includes("s")) h = track.baseH + dy;
    if (track.edge.includes("n")) h = track.baseH - dy;
    setSize(clampSize(w, h));
  }

  /** releases the resize session. */
  function onResizePointerUp(event: ReactPointerEvent<HTMLSpanElement>) {
    const track = resizeRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

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

  // the embedded pass renders before the chrome: one window, one frame
  if (framed) return <main className="shell shell--embedded">{children}</main>;

  return (
    <div className="appframe" data-maximized={maximized ? "true" : undefined}>
      <section
        ref={winRef}
        className="winapp"
        hidden={minimized}
        data-maximized={maximized ? "true" : undefined}
        data-sized={size && !maximized ? "true" : undefined}
        data-inactive={inactive ? "true" : undefined}
        data-landing={location === "/" ? "true" : undefined}
        aria-label={label("shell.window.aria")}
        style={
          {
            "--winapp-x": `${drag.x}px`,
            "--winapp-y": `${drag.y}px`,
            ...(size && !maximized ? { width: `${size.w}px`, height: `${size.h}px` } : {}),
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
            <BrandMark size={20} />
            <span className="winapp__name">{label("shell.name")}</span>
            <span className="winapp__role">{label("shell.role")}</span>
          </div>
          <div className="winapp__caption">
            <button type="button" className="winapp__cap" aria-label={label("shell.caption.minimize")} onClick={() => setMinimized(true)}>
              <Minus fontSize={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="winapp__cap"
              aria-label={maximized ? label("shell.caption.restore") : label("shell.caption.maximize")}
              onClick={toggleMaximize}
            >
              {maximized ? <Copy fontSize={12} aria-hidden="true" /> : <Square fontSize={11} aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="winapp__cap winapp__cap--close"
              aria-label={label("shell.caption.close")}
              onClick={() => navigate(RESTART_ROUTE)}
            >
              <X fontSize={14} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="winapp__body">
          <nav className="winapp__rail" aria-label={label("shell.rail.aria")}>
            <p className="winapp__railhead" aria-hidden="true">
              {label("shell.rail.head")}
            </p>
            {START_APPS.map((app) => {
              const Icon = app.icon;
              return (
                <Link
                  key={app.href}
                  href={app.href}
                  className="winapp__raillink"
                  data-tip={label(app.detailKey)}
                  aria-label={label(app.labelKey)}
                  aria-current={isActive(app.href) ? "page" : undefined}
                >
                  <Icon fontSize={16} strokeWidth={1.7} aria-hidden="true" />
                  <span className="winapp__raillabel">{label(app.labelKey)}</span>
                </Link>
              );
            })}
            <div className="winapp__railfoot">
              <p className="winapp__familyhead" aria-hidden="true">
                {label("shell.family.head")}
              </p>
              <div className="winapp__family">
                {familyrow().map((member) => (
                  <a
                    key={member.slug}
                    className="winapp__famlink"
                    href={familyurl(member.slug)}
                    target="_blank"
                    rel="noreferrer"
                    data-tip={labelfill("shell.family.tip", { slug: member.slug })}
                    aria-label={labelfill("shell.family.aria", { slug: member.slug })}
                    style={{ "--fam-dot": member.accent } as CSSProperties}
                  >
                    <span className="winapp__famdot" aria-hidden="true" />
                    <span className="winapp__famlabel">{member.slug}</span>
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
        <button
          type="button"
          className="winchip"
          aria-label={label("shell.chip.restoreAria")}
          onClick={() => setMinimized(false)}
        >
          <BrandMark size={16} />
          <span>{label("shell.chip.name")}</span>
        </button>
      )}
    </div>
  );
}

export default Shell;
