// the debonair shell of the theme.
/**
 * Shell.tsx — the app surface of the debonair, answering the FAMILY
 * STANDALONE LAW: an app accessed by its own url (wenathlan.github.io/
 * devthink/debonair/) is the normal application, one hundred percent — it
 * renders FULL-BLEED, the routed stage owning the whole viewport with the
 * page rail as the app's own navigation (no window chrome of its own: no
 * title bar, no caption buttons, no resize handles, no inactive
 * grayscale, no entry scale). The WINDOW (the draggable frame with the
 * captions and the eight handles) exists ONLY when the app is embedded
 * inside the DevThink OS power clip — the framed contract below renders
 * the routed stage bare (shell--embedded) and the OS draws the window
 * around it. The rail keeps the Windows 11 hands on the pages themselves
 * (the 48px pin rail: the press at scale .7, the popintro entrance, the
 * ladder indicator, the acrylic tooltip, the family dots) and the shared
 * transport rides the floor as the one bottom bar of the app. The mark
 * stays the ONE premium drawn icon of the platform (the waveform dance);
 * the debonair brass stays the identity accent of the content.
 */

import {
  ArrowUploadRegular,
  HomeRegular,
  LibraryRegular,
  SettingsRegular,
  SparkleRegular,
  WandRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from "@fluentui/react-icons";
import { type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { familyrow } from "../../family.ts";
import { familyurl } from "../../familyurl.ts";
import { currentTheme, type Theme, toggleTheme } from "../../theme.ts";
import { Playerbar } from "../widgets";

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

/** the pages the application hosts, one rail entry each (the apex home
 * first). exported for the onboarding copy beside this folder. */
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

/* ------------------------------ the app surface ---------------------------- */

/** SSR-safe read of the session theme: the document may not exist while
 * rendering on the server, so the sol dark default answers for it. */
function sessionTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return currentTheme();
}

/**
 * the theme flip of the rail foot: flips the in-memory theme on <html>,
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

/** the app surface props: the routed page plus the legacy window-era props
 * the pages still pass — accepted for compilation, only themeButton is
 * consumed (the app grammar names itself). */
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
 * the app surface: the Windows pin rail and the routed stage beside it,
 * the shared transport at the floor — owning the whole viewport.
 *
 * @param children the routed page.
 * @returns the app surface element.
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

  const [location] = useLocation();

  // the active rail entry: the bare path owns home, every other page owns its route
  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);

  // the embedded pass renders before the stage: one window, one frame
  if (framed) return <main className="shell shell--embedded">{children}</main>;

  // the standalone pass: the direct url answers full-bleed — the window
  // chrome exists only inside the os power clip, so the app owns the whole
  // viewport; the page rail stays as the app's own navigation, the routed
  // stage fills the rest of the screen and the shared transport rides the
  // floor as the one bottom bar of the app
  return (
    <div className="shell shell--standalone">
      <div className="winapp__body">
        {/* the Windows pin rail — the mount pops the pins in (dtPopIntro,
            staggered), the ladder indicator marks hover and the active page,
            the acrylic tooltip names it and the rail foot carries the family
            row (one accent dot per sibling, resolved through the familyurl
            contract so every link survives any mount point) */}
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
            {themeButton ? <ThemeToggle /> : null}
          </fieldset>
        </nav>
        <div className="winapp__stage">
          <main className="shell">{children}</main>
        </div>
      </div>

      {/* the suno bar: the one bottom bar of the application — cover,
          title, the shared transport's lane and the play keys */}
      <Playerbar />
    </div>
  );
}

export default Shell;
