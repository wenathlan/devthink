/**
 * appicons.tsx — the premium drawn icon set of the Sol shell. One hand-drawn
 * SVG component per desktop app (Sol/shell/appregistry.ts), exported through
 * the APP_ICONS map the app tile reads by the registry `iconset` key.
 *
 * Every icon is built in depth layers over its own guide color (the "story"):
 * a gradient squircle with a soft top gloss, a mid layer of blurred story
 * orbs over a pedestal band, and the glyph itself in thick ivory strokes with
 * a translucent filled backing and a blurred drop shadow. The finishing
 * follows the house reference (the 3D stage icon): two blurred inner
 * contours, a blurred contact ellipse at the base, a discrete film grain, a
 * two-layer drop shadow in the story color, a sheen band that sweeps once on
 * hover, a contact glow that rises and breathes, and a gentle perspective
 * tilt — all plain CSS transitions/animations on transform/opacity/filter,
 * with @property registered custom properties (--dt-fan/--dt-glow) easing at
 * the house cubic-bezier and -webkit- prefixes on every 3D/filter path.
 * No decorative dots and no microcopy: the interaction exists, the icon
 * speaks for itself. prefers-reduced-motion and coarse pointers switch the
 * loop and the dramatic hover off.
 *
 * The optical scale every glyph answers to (the audit ladder): one stroke
 * hierarchy — STROKE_BRIGHT 5.5 for the primary outline, STROKE 5 for the
 * base, STROKE_SOFT 4.5 for secondary details, STROKE_HAIR 4 for fine inner
 * contours; tiny windows at radius 2, panes and crate at 2.5, one bar radius
 * (3), container radii 5–6.5 and the board at 8; and one inner-padding band,
 * glyphs living within ~26–70 of the 96-unit face. The identity of every
 * glyph stays untouched; only outliers are normalized onto the ladder.
 */
import { type ComponentType, type CSSProperties, type ReactElement, useEffect } from "react";

/** the warm ivory of every glyph stroke */
const IVORY = "#fbf5ea";

/** the backing translucency of outlined glyph shapes */
const BACKING = "rgba(255,255,255,.14)";

/** the stroke ladder: bright primary outlines */
const STROKE_BRIGHT = 5.5;

/** the stroke ladder: the base weight of the glyph group */
const STROKE = 5;

/** the stroke ladder: soft secondary details */
const STROKE_SOFT = 4.5;

/** the stroke ladder: hair-weight inner contours */
const STROKE_HAIR = 4;

export type AppIconProps = {
  /** rendered square size in px; omitted, the icon fills its tile box */
  size?: number;
};

interface HoudiniProp {
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue: string;
}

/** the animatable custom properties of the set, mirrored in the stylesheet */
const HOUDINI_PROPS: readonly HoudiniProp[] = [
  { name: "--dt-fan", syntax: "<number>", inherits: true, initialValue: "0" },
  { name: "--dt-glow", syntax: "<number>", inherits: false, initialValue: "0.34" },
];

/* ---------------------------- CSS (injected once) -------------------------- */
const ICON_CSS = `
@property --dt-fan { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --dt-glow { syntax: "<number>"; inherits: false; initial-value: 0.34; }
.dtIcon {
  --dt-fan: 0;
  --dt-glow: 0.34;
  position: relative; display: block; width: 100%; height: 100%;
  transform-style: preserve-3d; -webkit-transform-style: preserve-3d;
  isolation: isolate;
}
html.dt-icon-fx .dtIcon { transition: --dt-fan .55s cubic-bezier(.22,.9,.3,1.15), --dt-glow .6s ease; }
.dtIcon:hover { --dt-fan: 1; --dt-glow: .62; }
.dtIconGlow {
  position: absolute; left: 10%; right: 10%; bottom: -6%; height: 44%; z-index: 0;
  border-radius: 50%; pointer-events: none;
  background: radial-gradient(52% 60% at 50% 62%, var(--story-glow, rgba(255,140,66,.45)), transparent 76%);
  filter: blur(9px); -webkit-filter: blur(9px);
  opacity: var(--dt-glow);
  transition: opacity .55s cubic-bezier(.22,.9,.3,1.15);
  -webkit-transition: opacity .55s cubic-bezier(.22,.9,.3,1.15);
}
.dtIcon:hover .dtIconGlow { --dt-glow: .62; }
html.dt-icon-fx .dtIcon:not(:hover) .dtIconGlow {
  animation: dtIconGlowPulse 4.5s ease-in-out infinite;
  -webkit-animation: dtIconGlowPulse 4.5s ease-in-out infinite;
}
@keyframes dtIconGlowPulse { 0%, 100% { --dt-glow: .28; } 50% { --dt-glow: .46; } }
.dtIconSvg {
  position: relative; z-index: 1; display: block; width: 100%; height: 100%;
  overflow: visible; shape-rendering: geometricPrecision;
  transform-style: preserve-3d; -webkit-transform-style: preserve-3d;
  transform: perspective(340px) rotateX(0deg) rotateY(0deg);
  -webkit-transform: perspective(340px) rotateX(0deg) rotateY(0deg);
  will-change: transform;
  filter: drop-shadow(0 4px 7px var(--story-shadow, rgba(0,0,0,.26))) drop-shadow(0 1.5px 3px var(--story-shadow-soft, rgba(0,0,0,.14)));
  -webkit-filter: drop-shadow(0 4px 7px var(--story-shadow, rgba(0,0,0,.26))) drop-shadow(0 1.5px 3px var(--story-shadow-soft, rgba(0,0,0,.14)));
  transition: transform .55s cubic-bezier(.22,.9,.3,1.15);
  -webkit-transition: -webkit-transform .55s cubic-bezier(.22,.9,.3,1.15), transform .55s cubic-bezier(.22,.9,.3,1.15);
}
.dtIcon:hover .dtIconSvg {
  transform: perspective(340px) rotateX(4.5deg) rotateY(-5.5deg) scale(1.02);
  -webkit-transform: perspective(340px) rotateX(4.5deg) rotateY(-5.5deg) scale(1.02);
}
.dtIconGlyph {
  transform-box: view-box; -webkit-transform-box: view-box;
  will-change: transform;
  transition: transform .55s cubic-bezier(.22,.9,.3,1.15);
  -webkit-transition: -webkit-transform .55s cubic-bezier(.22,.9,.3,1.15), transform .55s cubic-bezier(.22,.9,.3,1.15);
}
.dtIcon:hover .dtIconGlyph {
  transform: translateY(calc(var(--dt-fan) * -2.2px)) scale(calc(1 + var(--dt-fan) * .035));
  -webkit-transform: translateY(calc(var(--dt-fan) * -2.2px)) scale(calc(1 + var(--dt-fan) * .035));
}
html.dt-icon-fx .dtIconGlyph { transition: none; -webkit-transition: none; }
.dtIconSheenBand {
  transform-box: view-box; -webkit-transform-box: view-box;
  transform: translateX(-100px); -webkit-transform: translateX(-100px);
  opacity: 0; will-change: transform, opacity; pointer-events: none;
}
.dtIcon:hover .dtIconSheenBand {
  animation: dtIconSheen .9s cubic-bezier(.3,.5,.25,1) forwards;
  -webkit-animation: dtIconSheen .9s cubic-bezier(.3,.5,.25,1) forwards;
}
@keyframes dtIconSheen {
  0% { opacity: 0; transform: translateX(-100px); }
  16% { opacity: .42; }
  60% { opacity: .3; }
  100% { opacity: 0; transform: translateX(118px); }
}
.dtIconMid { transform-box: view-box; -webkit-transform-box: view-box; }
html.dt-icon-fx .dtIconMid {
  animation: dtIconFloat 6s ease-in-out infinite;
  -webkit-animation: dtIconFloat 6s ease-in-out infinite;
}
@keyframes dtIconFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1.4px); } }
@media (hover: none), (pointer: coarse) {
  .dtIcon:hover .dtIconSvg { transform: none; -webkit-transform: none; }
  .dtIcon:hover .dtIconGlyph { transform: none; -webkit-transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .dtIcon, .dtIconSvg, .dtIconGlyph, .dtIconSheenBand, .dtIconGlow, .dtIconMid {
    animation: none !important; -webkit-animation: none !important;
    transition: none !important; -webkit-transition: none !important;
  }
  .dtIcon:hover .dtIconSvg, .dtIcon:hover .dtIconGlyph { transform: none; -webkit-transform: none; }
}
`;

let iconCssReady = false;

/** Injects the shared stylesheet of the set exactly once per document. */
function ensureIconCss(): void {
  if (iconCssReady || typeof document === "undefined") return;
  iconCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-icons", "");
  tag.textContent = ICON_CSS;
  document.head.appendChild(tag);
}

let iconMotionChecked = false;

/**
 * Registers the animatable custom properties and gates the custom-property
 * loops behind the dt-icon-fx class (browsers without the @property API
 * never run them, so nothing flips discretely).
 */
function useIconMotion(): void {
  useEffect(() => {
    if (iconMotionChecked) return;
    iconMotionChecked = true;
    const css = typeof CSS === "undefined" ? null : (CSS as unknown as { registerProperty?: (p: HoudiniProp) => void });
    if (css && typeof css.registerProperty === "function") {
      for (const prop of HOUDINI_PROPS) {
        try {
          css.registerProperty(prop);
        } catch {
          /* already registered by the stylesheet */
        }
      }
      document.documentElement.classList.add("dt-icon-fx");
    }
  }, []);
}

/* ------------------------------- the factory ------------------------------- */
type AppIconSpec = {
  /** the guide color of the app (the story the icon catalog row declares) */
  story: string;
  /** the deep shade the gradient settles into */
  deep: string;
  /** the warm subtone of the mid layer, contours and contact ellipse */
  soft: string;
  /** the drawn glyph: thick ivory strokes with a translucent filled backing */
  glyph: ReactElement;
};

/** The asymmetric squircle of the tile face: tighter shoulders, heavier base. */
const SQUIRCLE = "M22 0 L74 0 Q96 0 96 22 L96 66 Q96 96 66 96 L30 96 Q0 96 0 66 L0 22 Q0 0 22 0 Z";

/**
 * Builds one premium icon component over a story palette and glyph.
 *
 * @param key the registry id the iconset field points at (namespaces every id)
 * @param spec the story colors and the drawn glyph of the app
 */
function defineAppIcon(key: string, spec: AppIconSpec): ComponentType<AppIconProps> {
  const uid = `dti-${key}`;
  function AppIcon({ size }: AppIconProps) {
    ensureIconCss();
    useIconMotion();
    const vars = {
      "--story-glow": `${spec.story}73`,
      "--story-shadow": `${spec.deep}42`,
      "--story-shadow-soft": `${spec.deep}24`,
    } as CSSProperties;
    if (size !== undefined) {
      vars.width = size;
      vars.height = size;
    }
    return (
      <span className="dtIcon" style={vars} aria-hidden="true">
        <span className="dtIconGlow" />
        <svg className="dtIconSvg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={spec.story} />
              <stop offset=".6" stopColor={spec.story} />
              <stop offset="1" stopColor={spec.deep} />
            </linearGradient>
            <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".32" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`${uid}-orb`} cx=".5" cy=".5" r=".5">
              <stop offset="0" stopColor={spec.soft} stopOpacity=".9" />
              <stop offset=".35" stopColor={spec.soft} stopOpacity=".5" />
              <stop offset="1" stopColor={spec.soft} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${uid}-edge-l`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={spec.soft} stopOpacity="0" />
              <stop offset=".45" stopColor={spec.soft} stopOpacity=".3" />
              <stop offset="1" stopColor={spec.soft} stopOpacity=".7" />
            </linearGradient>
            <linearGradient id={`${uid}-edge-d`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={spec.soft} stopOpacity="0" />
              <stop offset=".5" stopColor={spec.soft} stopOpacity=".22" />
              <stop offset="1" stopColor={spec.soft} stopOpacity=".55" />
            </linearGradient>
            <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
              <stop offset=".45" stopColor="#ffffff" stopOpacity=".5" />
              <stop offset=".55" stopColor="#ffffff" stopOpacity=".5" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <filter id={`${uid}-soft`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <filter id={`${uid}-wide`} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id={`${uid}-lift`} x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={spec.deep} floodOpacity=".38" />
            </filter>
            <filter id={`${uid}-grain`} x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
              <feColorMatrix in="n" type="saturate" values="0" />
              <feComposite operator="in" in2="SourceGraphic" />
            </filter>
            <clipPath id={`${uid}-clip`}>
              <path d={SQUIRCLE} />
            </clipPath>
          </defs>

          {/* the face: gradient squircle with a soft top gloss */}
          <path d={SQUIRCLE} fill={`url(#${uid}-bg)`} />
          <path d={SQUIRCLE} fill={`url(#${uid}-gloss)`} opacity=".5" />

          <g clipPath={`url(#${uid}-clip)`}>
            {/* the mid layer: story orbs breathing over a pedestal band */}
            <g className="dtIconMid">
              <circle cx="48" cy="40" r="25" fill={`url(#${uid}-orb)`} filter={`url(#${uid}-wide)`} opacity=".85" />
              <rect x="-12" y="56" width="120" height="44" fill={spec.soft} opacity=".3" filter={`url(#${uid}-soft)`} />
            </g>

            {/* two blurred inner contours of the squircle */}
            <path
              d={SQUIRCLE}
              fill="none"
              stroke={`url(#${uid}-edge-d)`}
              strokeWidth="6"
              filter={`url(#${uid}-wide)`}
              opacity=".55"
              transform="translate(1.4 1.9) scale(0.97)"
            />
            <path
              d={SQUIRCLE}
              fill="none"
              stroke={`url(#${uid}-edge-l)`}
              strokeWidth="2.5"
              filter={`url(#${uid}-soft)`}
              opacity=".5"
            />

            {/* the contact ellipse at the base */}
            <ellipse
              cx="48"
              cy="94"
              rx="30"
              ry="7"
              fill={`url(#${uid}-orb)`}
              filter={`url(#${uid}-soft)`}
              opacity=".55"
            />

            {/* the sheen band sweeping once on hover */}
            <g className="dtIconSheenBand">
              <rect x="-11" y="-24" width="26" height="144" fill={`url(#${uid}-sheen)`} transform="skewX(-16)" />
            </g>

            {/* the discrete film grain */}
            <path d={SQUIRCLE} fill="#ffffff" filter={`url(#${uid}-grain)`} opacity=".08" />
          </g>

          {/* the glyph: thick ivory strokes lifting toward the viewer */}
          <g filter={`url(#${uid}-lift)`}>
            <g
              className="dtIconGlyph"
              fill="none"
              stroke={IVORY}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {spec.glyph}
            </g>
          </g>
        </svg>
      </span>
    );
  }
  AppIcon.displayName = `${key}AppIcon`;
  return AppIcon;
}

/* ------------------------------- the icons --------------------------------- */

/** Chat — the assistant of the OS: a speech bubble carrying the brand star. */
export const ChatIcon = defineAppIcon("chat", {
  story: "#ff8c42",
  deep: "#b6520e",
  soft: "#ffdcbd",
  glyph: (
    <>
      <path
        d="M31 29 H65 Q70 29 70 34 V55 Q70 60 65 60 H46.5 L37 68.5 Q33.5 71.2 33.5 66.6 V60 H31 Q26 60 26 55 V34 Q26 29 31 29 Z"
        fill={BACKING}
      />
      <path
        d="M48 35.5 L51.2 43.3 L59 46.5 L51.2 49.7 L48 57.5 L44.8 49.7 L37 46.5 L44.8 43.3 Z"
        fill={IVORY}
        stroke="none"
      />
    </>
  ),
});

/** History — the session archive: a clock with a curved rewind arrow. */
export const HistoryIcon = defineAppIcon("history", {
  story: "#d9b98c",
  deep: "#9a7444",
  soft: "#f4e6cb",
  glyph: (
    <>
      <circle cx="49" cy="51" r="16.5" />
      <path d="M49 42.5 V51 L56 55" />
      <path d="M28.5 35 Q28.5 24.5 39 24.5" strokeWidth={STROKE_SOFT} />
      <path d="M39 24.5 L33.6 21.2 M39 24.5 L34 28.2" strokeWidth={STROKE_SOFT} />
    </>
  ),
});

/** Projects — the workspace records: a board with two uneven columns. */
export const ProjectsIcon = defineAppIcon("projects", {
  story: "#cd8a5e",
  deep: "#925a34",
  soft: "#f2ddc6",
  glyph: (
    <>
      <rect x="27" y="29" width="42" height="40" rx="8" fill={BACKING} />
      <rect x="34" y="37" width="9.5" height="24" rx="3" fill={IVORY} stroke="none" />
      <rect x="52.5" y="37" width="9.5" height="13" rx="3" />
      <path d="M52.5 56 H62" strokeWidth={STROKE_SOFT} />
    </>
  ),
});

/** Console — the canonical CLI design: a prompt chevron and its cursor. */
export const ConsoleIcon = defineAppIcon("console", {
  story: "#8d8479",
  deep: "#57514a",
  soft: "#ded5c8",
  glyph: (
    <>
      <path d="M31 35 L43.5 47.5 L31 60" strokeWidth={STROKE_BRIGHT} />
      <path d="M50 36.5 H63" />
      <rect x="49" y="53.5" width="15.5" height="9.5" rx="3" fill={IVORY} stroke="none" />
    </>
  ),
});

/** Gateway — the local gateway console: routes meeting at a waypoint. */
export const GatewayIcon = defineAppIcon("gateway", {
  story: "#c9974f",
  deep: "#8a682c",
  soft: "#f0dcae",
  glyph: (
    <>
      <path d="M48 39.5 L56.5 48 L48 56.5 L39.5 48 Z" fill={BACKING} strokeWidth={STROKE_SOFT} />
      <circle cx="29.5" cy="32.5" r="5" strokeWidth={STROKE_SOFT} />
      <circle cx="66.5" cy="63.5" r="5" strokeWidth={STROKE_SOFT} />
      <path d="M33.5 36 Q41.5 42.5 42.5 44.8" strokeWidth={STROKE_SOFT} />
      <path d="M53.5 51.2 Q58.5 55 60.6 57.6" strokeWidth={STROKE_SOFT} />
    </>
  ),
});

/** Providers — the provider and model choices: a plug with its cord. */
export const ProvidersIcon = defineAppIcon("providers", {
  story: "#bd7d55",
  deep: "#7f5133",
  soft: "#f0d3ba",
  glyph: (
    <>
      <path d="M43.5 30.5 V38.5 M52.5 30.5 V38.5" />
      <rect x="39" y="38.5" width="18" height="19" rx="6.5" fill={BACKING} />
      <path d="M48 57.5 C48 66.5 55 66 60.5 66 H66.5" strokeWidth={STROKE_SOFT} />
    </>
  ),
});

/** Usage — the local usage records: ascending bars over a baseline. */
export const UsageIcon = defineAppIcon("usage", {
  story: "#b39a78",
  deep: "#75603f",
  soft: "#ecdcbe",
  glyph: (
    <>
      <path d="M29.5 65 H66.5" strokeWidth={STROKE_SOFT} />
      <rect x="33" y="47" width="8" height="13" rx="3" fill={IVORY} stroke="none" opacity=".78" />
      <rect x="44" y="39" width="8" height="21" rx="3" fill={IVORY} stroke="none" opacity=".89" />
      <rect x="55" y="30" width="8" height="30" rx="3" fill={IVORY} stroke="none" />
    </>
  ),
});

/** Routes — the stream health: two feeds merging into one stream. */
export const RoutesIcon = defineAppIcon("routes", {
  story: "#b39a87",
  deep: "#775f4e",
  soft: "#eeddd0",
  glyph: (
    <>
      <path d="M28.5 34.5 C40 34.5 39 48 48.5 48" />
      <path d="M28.5 61.5 C40 61.5 39 48 48.5 48" />
      <path d="M48.5 48 H67" />
      <circle cx="48.5" cy="48" r="4.2" fill={IVORY} stroke="none" />
    </>
  ),
});

/** Docs — the documentation library: an open book with a raised spine. */
export const DocsIcon = defineAppIcon("docs", {
  story: "#d8cbb2",
  deep: "#93856a",
  soft: "#f6efe0",
  glyph: (
    <>
      <path d="M48 35.5 C43 30.8 35 29.8 28.5 31.8 L28.5 59 C35 57 43 58 48 62.5 Z" fill={BACKING} />
      <path d="M48 35.5 C53 30.8 61 29.8 67.5 31.8 L67.5 59 C61 57 53 58 48 62.5 Z" fill={BACKING} />
      <path d="M48 35.5 V62.5" strokeWidth={STROKE_SOFT} />
    </>
  ),
});

/** Explore — the exploration gallery: the wind rose inside its ring. */
export const ExploreIcon = defineAppIcon("explore", {
  story: "#c98d80",
  deep: "#8a5449",
  soft: "#f4d8cf",
  glyph: (
    <>
      <circle cx="48" cy="48" r="19" strokeWidth={STROKE_SOFT} />
      <path d="M33 48 L48 44.2 L63 48 L48 51.8 Z" fill={IVORY} stroke="none" opacity=".55" />
      <path d="M48 31.5 L51.8 48 L48 64.5 L44.2 48 Z" fill={IVORY} stroke="none" />
      <circle cx="48" cy="48" r="2.6" fill="#8a5449" stroke="none" />
    </>
  ),
});

/** OS — the family operating surface: the hex frame over a four-pane grid. */
export const OsIcon = defineAppIcon("os", {
  story: "#aab4c2",
  deep: "#647082",
  soft: "#e2e8f0",
  glyph: (
    <>
      <path d="M48 27 L66.5 37.5 V58.5 L48 69 L29.5 58.5 V37.5 Z" fill={BACKING} />
      <rect x="37.5" y="37" width="9" height="9" rx="2.5" fill={IVORY} stroke="none" opacity=".92" />
      <rect x="49.5" y="37" width="9" height="9" rx="2.5" fill={IVORY} stroke="none" opacity=".92" />
      <rect x="37.5" y="49" width="9" height="9" rx="2.5" fill={IVORY} stroke="none" opacity=".92" />
      <rect x="49.5" y="49" width="9" height="9" rx="2.5" fill={IVORY} stroke="none" opacity=".92" />
    </>
  ),
});

/** Settings — the local preferences: a gear with eight rounded teeth. */
export const SettingsIcon = defineAppIcon("settings", {
  story: "#b6ada1",
  deep: "#6f6759",
  soft: "#ece5da",
  glyph: (
    <>
      <circle cx="48" cy="48" r="13.5" strokeWidth={STROKE_BRIGHT} />
      <path d="M64.5 48 H69.5 M59.7 59.7 L63.2 63.2 M48 64.5 V69.5 M36.3 59.7 L32.8 63.2 M31.5 48 H26.5 M36.3 36.3 L32.8 32.8 M48 31.5 V26.5 M59.7 36.3 L63.2 32.8" />
      <circle cx="48" cy="48" r="4.6" strokeWidth={STROKE_HAIR} />
    </>
  ),
});

/** Argan — the DNS and gateway library: the double-contour shield. */
export const ArganIcon = defineAppIcon("argan", {
  story: "#14b98c",
  deep: "#0b7d5e",
  soft: "#bcefdc",
  glyph: (
    <>
      <path d="M48 27.5 L66 34 V49 C66 59.8 58.7 66.2 48 70.2 C37.3 66.2 30 59.8 30 49 V34 Z" fill={BACKING} />
      <path
        d="M48 35 L59.5 39.2 V48.6 C59.5 55.8 54.6 60.4 48 63.4 C41.4 60.4 36.5 55.8 36.5 48.6 V39.2 Z"
        strokeWidth={STROKE_HAIR}
        opacity=".85"
      />
    </>
  ),
});

/** Cadria — the video, image and 3D studio: a clapperboard mid-slate. */
export const CadriaIcon = defineAppIcon("cadria", {
  story: "#e04f9f",
  deep: "#972a66",
  soft: "#f7c4e2",
  glyph: (
    <>
      <rect x="28" y="46" width="40" height="21" rx="5" fill={BACKING} />
      <path d="M30.5 46 L33.8 31.5 L67.5 37.5 L65 46 Z" fill={BACKING} />
      <path d="M41.5 33.2 L44.5 45.3 M53 35.3 L55.5 45.5" strokeWidth={STROKE_SOFT} />
    </>
  ),
});

/** Debonair — the OS audio DAW: a five-band equalizer in full swing. */
export const DebonairIcon = defineAppIcon("debonair", {
  story: "#bd7a1a",
  deep: "#7c4c0a",
  soft: "#f2ddab",
  glyph: (
    <>
      <rect x="27.2" y="39" width="5.6" height="18" rx="3" fill={IVORY} stroke="none" opacity=".78" />
      <rect x="36.2" y="34" width="5.6" height="28" rx="3" fill={IVORY} stroke="none" opacity=".88" />
      <rect x="45.2" y="28" width="5.6" height="40" rx="3" fill={IVORY} stroke="none" />
      <rect x="54.2" y="34" width="5.6" height="28" rx="3" fill={IVORY} stroke="none" opacity=".88" />
      <rect x="63.2" y="39" width="5.6" height="18" rx="3" fill={IVORY} stroke="none" opacity=".78" />
    </>
  ),
});

/** StealHead — the OS FPS platform: a scope with cardinal ticks. */
export const StealthheadIcon = defineAppIcon("stealthhead", {
  story: "#f4694f",
  deep: "#a63322",
  soft: "#ffd3c4",
  glyph: (
    <>
      <circle cx="48" cy="48" r="17.5" />
      <path d="M48 26 V31.5 M48 64.5 V70 M26 48 H31.5 M64.5 48 H70" />
      <circle cx="48" cy="48" r="4.4" fill={IVORY} stroke="none" />
    </>
  ),
});

/** Forge — the family forge: a mallet head over its handle. */
export const ForgeIcon = defineAppIcon("forge", {
  story: "#a2cb3a",
  deep: "#647e1d",
  soft: "#e0f2b6",
  glyph: (
    <>
      <g transform="rotate(-24 50 37)">
        <rect x="35" y="29.5" width="30" height="15" rx="5.5" fill={BACKING} />
      </g>
      <path d="M53 44 L43.5 64" strokeWidth={STROKE_BRIGHT} />
    </>
  ),
});

/** Foundry — the family foundry: the sawtooth plant with its stack. */
export const FoundryIcon = defineAppIcon("foundry", {
  story: "#4d8edd",
  deep: "#2a5c9c",
  soft: "#c6def7",
  glyph: (
    <>
      <path d="M28.5 66 V45 L39.5 53 V45 L50.5 53 V41 H56.5 V32 H63 V66 Z" fill={BACKING} />
      <rect x="33.5" y="56.5" width="6.5" height="7.5" rx="2" fill={IVORY} stroke="none" opacity=".85" />
      <rect x="44" y="56.5" width="6.5" height="7.5" rx="2" fill={IVORY} stroke="none" opacity=".85" />
    </>
  ),
});

/** Vault — the family vault: the three-spoke door inside its rings. */
export const VaultIcon = defineAppIcon("vault", {
  story: "#a3d7e6",
  deep: "#5b93a6",
  soft: "#e0f3f9",
  glyph: (
    <>
      <circle cx="48" cy="48" r="20" strokeWidth={STROKE_BRIGHT} />
      <circle cx="48" cy="48" r="11" strokeWidth={STROKE_SOFT} />
      <path d="M48 48 V37 M48 48 L57.5 53.5 M48 48 L38.5 53.5" strokeWidth={STROKE_SOFT} />
    </>
  ),
});

/** Getry — the family registry: the cataloged stack of plates. */
export const GetryIcon = defineAppIcon("getry", {
  story: "#9a7ce0",
  deep: "#6146ab",
  soft: "#ded1f8",
  glyph: (
    <>
      <path d="M48 28.5 L63.5 37.5 L48 46.5 L32.5 37.5 Z" fill={BACKING} />
      <path d="M32.5 46.5 L48 55.5 L63.5 46.5" />
      <path d="M32.5 55 L48 64 L63.5 55" />
    </>
  ),
});

/** Saddle — the sandbox engine: the crate drawn in light isometric. */
export const SaddleIcon = defineAppIcon("saddle", {
  story: "#d6b483",
  deep: "#8f6b3c",
  soft: "#f2e3c8",
  glyph: (
    <>
      <path d="M31 42.5 L40 33 H65 L56 42.5 Z" fill={BACKING} />
      <path d="M56 42.5 L65 33 V56 L56 65.5 Z" fill="rgba(255,255,255,.09)" />
      <rect x="31" y="42.5" width="25" height="23" rx="2.5" fill={BACKING} />
    </>
  ),
});

/**
 * The premium icon set of the shell, keyed by the registry `iconset` field:
 * the desktop grid, the dock and the Start menu all reach their icons here.
 */
export const APP_ICONS: Record<string, ComponentType<AppIconProps>> = {
  chat: ChatIcon,
  history: HistoryIcon,
  projects: ProjectsIcon,
  console: ConsoleIcon,
  gateway: GatewayIcon,
  providers: ProvidersIcon,
  usage: UsageIcon,
  routes: RoutesIcon,
  docs: DocsIcon,
  explore: ExploreIcon,
  os: OsIcon,
  settings: SettingsIcon,
  argan: ArganIcon,
  cadria: CadriaIcon,
  debonair: DebonairIcon,
  stealthhead: StealthheadIcon,
  forge: ForgeIcon,
  foundry: FoundryIcon,
  vault: VaultIcon,
  getry: GetryIcon,
  saddle: SaddleIcon,
};
