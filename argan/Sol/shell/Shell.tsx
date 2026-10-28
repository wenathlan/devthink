// the argan shell of the theme.
/**
 * Shell.tsx — the app surface of the argan, answering the FAMILY
 * STANDALONE LAW: an app accessed by its own url (wenathlan.github.io/
 * devthink/argan/) is the normal application, one hundred percent — it
 * renders FULL-BLEED, the routed stage owning the whole viewport with the
 * page rail as the app's own navigation (no window chrome of its own: no
 * title bar, no caption buttons, no resize handles, no inactive
 * grayscale, no entry scale). The WINDOW (the draggable frame with the
 * captions and the eight handles) exists ONLY when the app is embedded
 * inside the DevThink OS power clip — the framed contract below renders
 * the routed stage bare (shell--embedded) and the OS draws the window
 * around it. The rail keeps the Windows 11 hands on the pages themselves
 * (the pins with the press ladder and the popintro bounce, the accent
 * ladder on the active entry, the family foot with one spec §12 accent
 * dot per sibling resolved by familyurl, the theme flip) and the stage
 * scrolls itself under the rail. The mark stays the ONE premium drawn
 * icon of the app (the hero lockup owns it on the landing).
 */

import {
  GlobeRegular,
  HomeRegular,
  PlugConnectedRegular,
  SettingsRegular,
  ShieldRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from "@fluentui/react-icons";
import { type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { familyrow } from "../../family";
import { familyurl } from "../../familyurl";
import { label, labelfill } from "../../labels";
import { currentTheme, type Theme, toggleTheme } from "../../theme";

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
 * home first). exported for the onboarding copy beside this folder. the
 * labels ride the copy law (labels.ts). */
export const START_APPS: readonly StartApp[] = [
  { href: "/", label: label("shell.rail.home"), detail: label("shell.rail.homeDetail"), icon: HomeRegular },
  { href: "/zones", label: label("shell.rail.zones"), detail: label("shell.rail.zonesDetail"), icon: GlobeRegular },
  { href: "/dnssec", label: label("shell.rail.dnssec"), detail: label("shell.rail.dnssecDetail"), icon: ShieldRegular },
  {
    href: "/gateway",
    label: label("shell.rail.gateway"),
    detail: label("shell.rail.gatewayDetail"),
    icon: PlugConnectedRegular,
  },
  {
    href: "/settings",
    label: label("shell.rail.settings"),
    detail: label("shell.rail.settingsDetail"),
    icon: SettingsRegular,
  },
];

/* ------------------------------ the drawn mark ---------------------------- */

/**
 * ArganMark — the premium drawn icon of the chrome, rebuilt in the house
 * icon spirit (Sol/shell/app.icons.tsx): a gradient squircle face over the
 * argan jade story, a soft top gloss, a mid layer of story orbs over a
 * pedestal band, two blurred inner contours, a contact ellipse, a discrete
 * film grain and the glyph in thick ivory strokes over a translucent
 * backing. The finishing (glow breathing, perspective tilt, glyph lift, one
 * sheen sweep on hover) is animated by Sol/sol.css — plain
 * transform/opacity/filter transitions, guarded for reduced motion. The ONE
 * signature motion of wave C1 rides the [data-motion="leaf-sway"] hook: the
 * mark sways on its stem (transform-origin at the base, 8deg ceiling,
 * 1.2s ease) on brand hover and on the intro entry only — the leaf-sway
 * keyframes live in the NEOSKILLS PASS block of Sol/sol.css. The `flow`
 * variant adds the hero signature of the spec §9: a light band travelling
 * INSIDE the glyph strokes (a gradient-stroked overlay copy with a
 * dash-offset loop — the gradient moves through the stroke, never behind
 * it). The hero zones set flow; the chrome sizes stay still.
 */

/** the jade story of argan: face gradient top, glow and orb */
const MARK_STORY = "#14b98c";
/** the deep shade the face gradient settles into */
const MARK_DEEP = "#0b7d5e";
/** the warm subtone of the mid layer, contours and contact ellipse */
const MARK_SOFT = "#bcefdc";
/** the warm ivory of the glyph strokes */
const MARK_IVORY = "#fbf5ea";
/** the translucent backing of the outlined glyph shapes */
const MARK_BACKING = "rgba(255,255,255,.14)";
/** the asymmetric squircle of the face: tighter shoulders, heavier base */
const MARK_SQUIRCLE = "M22 0 L74 0 Q96 0 96 22 L96 66 Q96 96 66 96 L30 96 Q0 96 0 66 L0 22 Q0 0 22 0 Z";

type MarkProps = {
  /** rendered square size in px; omitted, the mark fills its sized box */
  size?: number;
  /** hides the mark from the accessibility tree (decorative placements) */
  hidden?: boolean;
  /** the hero flow: the light band riding INSIDE the glyph strokes (spec §9) */
  flow?: boolean;
};

/** The DNS and gateway glyph: the double-contour shield over the jade face. */
function MarkGlyph() {
  return (
    <>
      <path d="M48 27.5 L66 34 V49 C66 59.8 58.7 66.2 48 70.2 C37.3 66.2 30 59.8 30 49 V34 Z" fill={MARK_BACKING} />
      <path
        d="M48 35 L59.5 39.2 V48.6 C59.5 55.8 54.6 60.4 48 63.4 C41.4 60.4 36.5 55.8 36.5 48.6 V39.2 Z"
        strokeWidth={3.8}
        opacity=".85"
      />
    </>
  );
}

export function ArganMark({ size, hidden, flow }: MarkProps) {
  const vars = size ? { width: size, height: size } : undefined;
  return (
    <span
      className={`sol-mark${flow ? " sol-mark--flow" : ""}`}
      data-motion="leaf-sway"
      style={vars}
      aria-hidden={hidden || undefined}
    >
      <span className="sol-mark__glow" />
      <svg className="sol-mark__svg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="argm-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MARK_STORY} />
            <stop offset=".6" stopColor={MARK_STORY} />
            <stop offset="1" stopColor={MARK_DEEP} />
          </linearGradient>
          <linearGradient id="argm-gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".32" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="argm-orb" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor={MARK_SOFT} stopOpacity=".9" />
            <stop offset=".35" stopColor={MARK_SOFT} stopOpacity=".5" />
            <stop offset="1" stopColor={MARK_SOFT} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="argm-edge-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MARK_SOFT} stopOpacity="0" />
            <stop offset=".45" stopColor={MARK_SOFT} stopOpacity=".3" />
            <stop offset="1" stopColor={MARK_SOFT} stopOpacity=".7" />
          </linearGradient>
          <linearGradient id="argm-edge-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MARK_SOFT} stopOpacity="0" />
            <stop offset=".5" stopColor={MARK_SOFT} stopOpacity=".22" />
            <stop offset="1" stopColor={MARK_SOFT} stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="argm-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset=".45" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset=".55" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="argm-flow-band" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={MARK_SOFT} stopOpacity="0" />
            <stop offset=".5" stopColor={MARK_SOFT} stopOpacity=".95" />
            <stop offset="1" stopColor={MARK_SOFT} stopOpacity="0" />
          </linearGradient>
          <filter id="argm-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="argm-wide" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="argm-lift" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={MARK_DEEP} floodOpacity=".38" />
          </filter>
          <filter id="argm-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
          <clipPath id="argm-clip">
            <path d={MARK_SQUIRCLE} />
          </clipPath>
        </defs>

        {/* the face: gradient squircle with a soft top gloss */}
        <path d={MARK_SQUIRCLE} fill="url(#argm-bg)" />
        <path d={MARK_SQUIRCLE} fill="url(#argm-gloss)" opacity=".5" />

        <g clipPath="url(#argm-clip)">
          {/* the mid layer: story orbs breathing over a pedestal band */}
          <g className="sol-mark__mid">
            <circle cx="48" cy="40" r="25" fill="url(#argm-orb)" filter="url(#argm-wide)" opacity=".85" />
            <rect x="-12" y="56" width="120" height="44" fill={MARK_SOFT} opacity=".3" filter="url(#argm-soft)" />
          </g>

          {/* two blurred inner contours of the squircle */}
          <path
            d={MARK_SQUIRCLE}
            fill="none"
            stroke="url(#argm-edge-d)"
            strokeWidth="6"
            filter="url(#argm-wide)"
            opacity=".55"
            transform="translate(1.4 1.9) scale(0.97)"
          />
          <path
            d={MARK_SQUIRCLE}
            fill="none"
            stroke="url(#argm-edge-l)"
            strokeWidth="2.5"
            filter="url(#argm-soft)"
            opacity=".5"
          />

          {/* the contact ellipse at the base */}
          <ellipse cx="48" cy="94" rx="30" ry="7" fill="url(#argm-orb)" filter="url(#argm-soft)" opacity=".55" />

          {/* the sheen band sweeping once on hover */}
          <g className="sol-mark__sheen">
            <rect x="-11" y="-24" width="26" height="144" fill="url(#argm-sheen)" transform="skewX(-16)" />
          </g>

          {/* the discrete film grain */}
          <path d={MARK_SQUIRCLE} fill="#ffffff" filter="url(#argm-grain)" opacity=".08" />
        </g>

        {/* the glyph: thick ivory strokes lifting toward the viewer */}
        <g filter="url(#argm-lift)">
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

        {/* the hero flow: the light band riding INSIDE the strokes (spec §9) */}
        {flow ? (
          <g
            className="sol-mark__flow"
            stroke="url(#argm-flow-band)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <MarkGlyph />
          </g>
        ) : null}
      </svg>
    </span>
  );
}

/* ------------------------------ the app surface ---------------------------- */

/**
 * the family row of the rail foot: the eight sibling deploy units of the
 * family, each one dot painted with its own spec §12 accent (the shared
 * family.ts table — the same row the landing footer renders) and linked
 * through the familyurl contract (relative, mount-proof, one level up).
 *
 * @returns the family row element.
 */
function FamilyRow() {
  return (
    <nav className="winapp__family" aria-label={label("shell.family.aria")}>
      {familyrow().map((member) => (
        <a
          key={member.slug}
          className="winapp__familylink"
          href={familyurl(member.slug)}
          target="_blank"
          rel="noreferrer"
          data-tip={labelfill("shell.family.tip", { slug: member.slug })}
          aria-label={member.slug}
        >
          <span
            className="winapp__familydot"
            aria-hidden="true"
            style={{ backgroundColor: member.accent, color: member.dotInk }}
          />
          <span className="winapp__familyname">{member.slug}</span>
        </a>
      ))}
    </nav>
  );
}

/**
 * the theme flip of the rail foot: flips the in-memory theme, stores nothing.
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme());
  return (
    <button type="button" className="winapp__theme" aria-label={label("shell.theme.aria")} onClick={() => setTheme(toggleTheme())}>
      {theme === "dark" ? (
        <WeatherSunnyRegular fontSize={14} aria-hidden="true" />
      ) : (
        <WeatherMoonRegular fontSize={14} aria-hidden="true" />
      )}
      {theme}
    </button>
  );
}

/** the window props: the routed page plus the legacy page props the anchors
 * still pass (name, domain, cta, footer links, container width) — the app
 * grammar names itself, so only the theme toggle switch is consumed. */
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
 * the app surface: the page rail with the family foot and the routed stage
 * beside it, owning the whole viewport.
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
  // viewport; the page rail stays as the app's own navigation and the
  // routed stage fills the rest of the screen
  return (
    <div className="shell shell--standalone">
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
                data-tip={app.detail}
                aria-label={app.label}
                aria-current={isActive(app.href) ? "page" : undefined}
              >
                <Icon fontSize={16} aria-hidden="true" />
                <span className="winapp__raillabel">{app.label}</span>
              </Link>
            );
          })}
          {themeButton ? (
            <div className="winapp__railfoot">
              <p className="winapp__familyhead" aria-hidden="true">
                {label("shell.family.head")}
              </p>
              <FamilyRow />
              <ThemeToggle />
            </div>
          ) : null}
        </nav>
        <div className="winapp__stage">
          <main className="shell">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default Shell;
