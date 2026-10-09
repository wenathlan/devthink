/**
 * BrandMark.tsx — the drawn brand mark of the forge theme, one hand-drawn
 * SVG icon in the house finishing (the devthink/Sol/shell/app.icons.tsx
 * standard): a gradient squircle face over the orange story (#fb923c —
 * the family forge), a soft top gloss, a mid layer of blurred
 * story orbs over a pedestal band, two blurred inner contours, a blurred
 * contact ellipse at the base, a discrete film grain, and the glyph itself
 * — the mallet head over its handle — in thick ivory strokes with a
 * translucent filled backing and a blurred drop shadow. On hover the sheen
 * band sweeps once, the contact glow rises and the face tilts gently in
 * perspective — plain CSS transitions/animations on
 * transform/opacity/filter, the @property registered custom properties
 * easing at the house cubic-bezier and -webkit- prefixes on every
 * 3D/filter path. No decorative dots and no microcopy: the icon speaks for
 * itself. prefers-reduced-motion and coarse pointers switch the loop and
 * the dramatic hover off.
 */
import { type CSSProperties, type ReactElement, useEffect } from "react";

/** the warm ivory of the glyph stroke */
const IVORY = "#fbf5ea";

/** the backing translucency of outlined glyph shapes */
const BACKING = "rgba(255,255,255,.14)";

/** the story palette of the mark (the family forge orange) */
const STORY = "#fb923c";
const DEEP = "#7c2d12";
const SOFT = "#fed7aa";

/** the asymmetric squircle of the mark face: tighter shoulders, heavier base */
const SQUIRCLE = "M22 0 L74 0 Q96 0 96 22 L96 66 Q96 96 66 96 L30 96 Q0 96 0 66 L0 22 Q0 0 22 0 Z";

/** the drawn glyph: the mallet head over its handle */
const GLYPH: ReactElement = (
  <>
    <g transform="rotate(-24 50 37)">
      <rect x="35" y="29.5" width="30" height="15" rx="5.5" fill={BACKING} />
    </g>
    <path d="M53 44 L43.5 64" strokeWidth={5.5} />
  </>
);

/** the animatable custom properties of the mark, mirrored in the stylesheet */
const HOUDINI_PROPS = [
  { name: "--fg-fan", syntax: "<number>", inherits: true, initialValue: "0" },
  { name: "--fg-glow", syntax: "<number>", inherits: false, initialValue: "0.34" },
] as const;

interface HoudiniProp {
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue: string;
}

/* ------------------------------ CSS (injected once) ------------------------ */
const MARK_CSS = `
@property --fg-fan { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --fg-glow { syntax: "<number>"; inherits: false; initial-value: 0.34; }
.fgMark {
  --fg-fan: 0;
  --fg-glow: 0.34;
  position: relative; display: block; width: 100%; height: 100%;
  transform-style: preserve-3d; -webkit-transform-style: preserve-3d;
  isolation: isolate;
}
html.fg-mark-fx .fgMark { transition: --fg-fan .55s cubic-bezier(.22,.9,.3,1.15), --fg-glow .6s ease; }
.fgMark:hover { --fg-fan: 1; --fg-glow: .62; }
.fgMarkGlow {
  position: absolute; left: 10%; right: 10%; bottom: -6%; height: 44%; z-index: 0;
  border-radius: 50%; pointer-events: none;
  background: radial-gradient(52% 60% at 50% 62%, var(--fg-mark-glow, ${STORY}73), transparent 76%);
  filter: blur(9px); -webkit-filter: blur(9px);
  opacity: var(--fg-glow);
  transition: opacity .55s cubic-bezier(.22,.9,.3,1.15);
  -webkit-transition: opacity .55s cubic-bezier(.22,.9,.3,1.15);
}
.fgMark:hover .fgMarkGlow { --fg-glow: .62; }
html.fg-mark-fx .fgMark:not(:hover) .fgMarkGlow {
  animation: fgMarkGlowPulse 4.5s ease-in-out infinite;
  -webkit-animation: fgMarkGlowPulse 4.5s ease-in-out infinite;
}
@keyframes fgMarkGlowPulse { 0%, 100% { --fg-glow: .28; } 50% { --fg-glow: .46; } }
.fgMarkSvg {
  position: relative; z-index: 1; display: block; width: 100%; height: 100%;
  overflow: visible; shape-rendering: geometricPrecision;
  transform-style: preserve-3d; -webkit-transform-style: preserve-3d;
  transform: perspective(340px) rotateX(0deg) rotateY(0deg);
  -webkit-transform: perspective(340px) rotateX(0deg) rotateY(0deg);
  will-change: transform;
  filter: drop-shadow(0 4px 7px ${DEEP}42) drop-shadow(0 1.5px 3px ${DEEP}24);
  -webkit-filter: drop-shadow(0 4px 7px ${DEEP}42) drop-shadow(0 1.5px 3px ${DEEP}24);
  transition: transform .55s cubic-bezier(.22,.9,.3,1.15);
  -webkit-transition: -webkit-transform .55s cubic-bezier(.22,.9,.3,1.15), transform .55s cubic-bezier(.22,.9,.3,1.15);
}
.fgMark:hover .fgMarkSvg {
  transform: perspective(340px) rotateX(4.5deg) rotateY(-5.5deg) scale(1.02);
  -webkit-transform: perspective(340px) rotateX(4.5deg) rotateY(-5.5deg) scale(1.02);
}
.fgMarkGlyph {
  transform-box: view-box; -webkit-transform-box: view-box;
  will-change: transform;
}
html.fg-mark-fx .fgMarkGlyph { transition: none; -webkit-transition: none; }
.fgMark:hover .fgMarkGlyph {
  transform: translateY(calc(var(--fg-fan) * -2.2px)) scale(calc(1 + var(--fg-fan) * .035));
  -webkit-transform: translateY(calc(var(--fg-fan) * -2.2px)) scale(calc(1 + var(--fg-fan) * .035));
}
.fgMarkSheen {
  transform-box: view-box; -webkit-transform-box: view-box;
  transform: translateX(-100px); -webkit-transform: translateX(-100px);
  opacity: 0; will-change: transform, opacity; pointer-events: none;
}
.fgMark:hover .fgMarkSheen {
  animation: fgMarkSheenSweep .9s cubic-bezier(.3,.5,.25,1) forwards;
  -webkit-animation: fgMarkSheenSweep .9s cubic-bezier(.3,.5,.25,1) forwards;
}
@keyframes fgMarkSheenSweep {
  0% { opacity: 0; transform: translateX(-100px); }
  16% { opacity: .42; }
  60% { opacity: .3; }
  100% { opacity: 0; transform: translateX(118px); }
}
.fgMarkMid { transform-box: view-box; -webkit-transform-box: view-box; }
html.fg-mark-fx .fgMarkMid {
  animation: fgMarkFloat 6s ease-in-out infinite;
  -webkit-animation: fgMarkFloat 6s ease-in-out infinite;
}
@keyframes fgMarkFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1.4px); } }
@media (hover: none), (pointer: coarse) {
  .fgMark:hover .fgMarkSvg { transform: none; -webkit-transform: none; }
  .fgMark:hover .fgMarkGlyph { transform: none; -webkit-transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .fgMark, .fgMarkSvg, .fgMarkGlyph, .fgMarkSheen, .fgMarkGlow, .fgMarkMid {
    animation: none !important; -webkit-animation: none !important;
    transition: none !important; -webkit-transition: none !important;
  }
  .fgMark:hover .fgMarkSvg, .fgMark:hover .fgMarkGlyph { transform: none; -webkit-transform: none; }
}
`;

let markCssReady = false;

/** Injects the mark stylesheet exactly once per document. */
function ensureMarkCss(): void {
  if (markCssReady || typeof document === "undefined") return;
  markCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-fg-mark", "");
  tag.textContent = MARK_CSS;
  document.head.appendChild(tag);
}

let markMotionChecked = false;

/**
 * Registers the animatable custom properties and gates the custom-property
 * loops behind the fg-mark-fx class (browsers without the @property API
 * never run them, so nothing flips discretely).
 */
function useMarkMotion(): void {
  useEffect(() => {
    if (markMotionChecked) return;
    markMotionChecked = true;
    const css = typeof CSS === "undefined" ? null : (CSS as unknown as { registerProperty?: (p: HoudiniProp) => void });
    if (css && typeof css.registerProperty === "function") {
      for (const prop of HOUDINI_PROPS) {
        try {
          css.registerProperty(prop);
        } catch {
          /* already registered by the stylesheet */
        }
      }
      document.documentElement.classList.add("fg-mark-fx");
    }
  }, []);
}

type BrandMarkProps = {
  /** rendered square size in px; omitted, the mark fills its box */
  size?: number;
};

/** The drawn brand mark of forge. */
export function BrandMark({ size }: BrandMarkProps) {
  ensureMarkCss();
  useMarkMotion();
  const vars = {
    "--fg-mark-glow": `${STORY}73`,
  } as CSSProperties;
  if (size !== undefined) {
    vars.width = size;
    vars.height = size;
  }
  return (
    <span className="fgMark" style={vars} aria-hidden="true">
      <span className="fgMarkGlow" />
      <svg className="fgMarkSvg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="fgm-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={STORY} />
            <stop offset=".6" stopColor={STORY} />
            <stop offset="1" stopColor={DEEP} />
          </linearGradient>
          <linearGradient id="fgm-gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".32" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="fgm-orb" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor={SOFT} stopOpacity=".9" />
            <stop offset=".35" stopColor={SOFT} stopOpacity=".5" />
            <stop offset="1" stopColor={SOFT} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fgm-edge-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SOFT} stopOpacity="0" />
            <stop offset=".45" stopColor={SOFT} stopOpacity=".3" />
            <stop offset="1" stopColor={SOFT} stopOpacity=".7" />
          </linearGradient>
          <linearGradient id="fgm-edge-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SOFT} stopOpacity="0" />
            <stop offset=".5" stopColor={SOFT} stopOpacity=".22" />
            <stop offset="1" stopColor={SOFT} stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="fgm-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset=".45" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset=".55" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="fgm-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="fgm-wide" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="fgm-lift" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={DEEP} floodOpacity=".38" />
          </filter>
          <filter id="fgm-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
          <clipPath id="fgm-clip">
            <path d={SQUIRCLE} />
          </clipPath>
        </defs>

        {/* the face: gradient squircle with a soft top gloss */}
        <path d={SQUIRCLE} fill="url(#fgm-bg)" />
        <path d={SQUIRCLE} fill="url(#fgm-gloss)" opacity=".5" />

        <g clipPath="url(#fgm-clip)">
          {/* the mid layer: story orbs breathing over a pedestal band */}
          <g className="fgMarkMid">
            <circle cx="48" cy="40" r="25" fill="url(#fgm-orb)" filter="url(#fgm-wide)" opacity=".85" />
            <rect x="-12" y="56" width="120" height="44" fill={SOFT} opacity=".3" filter="url(#fgm-soft)" />
          </g>

          {/* two blurred inner contours of the squircle */}
          <path
            d={SQUIRCLE}
            fill="none"
            stroke="url(#fgm-edge-d)"
            strokeWidth="6"
            filter="url(#fgm-wide)"
            opacity=".55"
            transform="translate(1.4 1.9) scale(0.97)"
          />
          <path
            d={SQUIRCLE}
            fill="none"
            stroke="url(#fgm-edge-l)"
            strokeWidth="2.5"
            filter="url(#fgm-soft)"
            opacity=".5"
          />

          {/* the contact ellipse at the base */}
          <ellipse cx="48" cy="94" rx="30" ry="7" fill="url(#fgm-orb)" filter="url(#fgm-soft)" opacity=".55" />

          {/* the sheen band sweeping once on hover */}
          <g className="fgMarkSheen">
            <rect x="-11" y="-24" width="26" height="144" fill="url(#fgm-sheen)" transform="skewX(-16)" />
          </g>

          {/* the discrete film grain */}
          <path d={SQUIRCLE} fill="#ffffff" filter="url(#fgm-grain)" opacity=".08" />
        </g>

        {/* the glyph: thick ivory strokes lifting toward the viewer */}
        <g filter="url(#fgm-lift)">
          <g
            className="fgMarkGlyph"
            fill="none"
            stroke={IVORY}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {GLYPH}
          </g>
        </g>
      </svg>
    </span>
  );
}

export default BrandMark;
