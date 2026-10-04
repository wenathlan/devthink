/**
 * BrandMark.tsx — the drawn brand mark of the foundry theme, one hand-drawn
 * SVG icon in the house finishing (the devthink/Sol/shell/app.icons.tsx
 * standard): a gradient squircle face over the blue story (#4d8edd — the
 * pipeline blue of the container floor), a soft top gloss, a mid layer of
 * blurred story orbs over a pedestal band, two blurred inner contours, a
 * blurred contact ellipse at the base, a discrete film grain, and the glyph
 * itself — the sawtooth plant with its stack — in thick ivory strokes with
 * a translucent filled backing and a blurred drop shadow. On hover the
 * sheen band sweeps once, the contact glow rises and the face tilts gently
 * in perspective — plain CSS transitions/animations on
 * transform/opacity/filter, the @property registered custom properties
 * easing at the house cubic-bezier and -webkit- prefixes on every
 * 3D/filter path. No decorative dots and no microcopy: the icon speaks for
 * itself. prefers-reduced-motion and coarse pointers switch the loop and
 * the dramatic hover off.
 */
import { useEffect, type CSSProperties, type ReactElement } from "react";

/** the warm ivory of the glyph stroke */
const IVORY = "#fbf5ea";

/** the backing translucency of outlined glyph shapes */
const BACKING = "rgba(255,255,255,.14)";

/** the story palette of the mark (the pipeline blue of foundry) */
const STORY = "#4d8edd";
const DEEP = "#2a5c9c";
const SOFT = "#c6def7";

/** the asymmetric squircle of the mark face: tighter shoulders, heavier base */
const SQUIRCLE = "M22 0 L74 0 Q96 0 96 22 L96 66 Q96 96 66 96 L30 96 Q0 96 0 66 L0 22 Q0 0 22 0 Z";

/** the drawn glyph: the sawtooth plant with its stack */
const GLYPH: ReactElement = (
  <>
    <path d="M28.5 66 V45 L39.5 53 V45 L50.5 53 V41 H56.5 V32 H63 V66 Z" fill={BACKING} />
    <rect x="33.5" y="56.5" width="6.5" height="7.5" rx="1.8" fill={IVORY} stroke="none" opacity=".85" />
    <rect x="44" y="56.5" width="6.5" height="7.5" rx="1.8" fill={IVORY} stroke="none" opacity=".85" />
  </>
);

/** the animatable custom properties of the mark, mirrored in the stylesheet */
const HOUDINI_PROPS = [
  { name: "--fd-fan", syntax: "<number>", inherits: true, initialValue: "0" },
  { name: "--fd-glow", syntax: "<number>", inherits: false, initialValue: "0.34" },
] as const;

interface HoudiniProp {
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue: string;
}

/* ------------------------------ CSS (injected once) ------------------------ */
const MARK_CSS = `
@property --fd-fan { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --fd-glow { syntax: "<number>"; inherits: false; initial-value: 0.34; }
.fdMark {
  --fd-fan: 0;
  --fd-glow: 0.34;
  position: relative; display: block; width: 100%; height: 100%;
  transform-style: preserve-3d; -webkit-transform-style: preserve-3d;
  isolation: isolate;
}
html.fd-mark-fx .fdMark { transition: --fd-fan .55s cubic-bezier(.22,.9,.3,1.15), --fd-glow .6s ease; }
.fdMark:hover { --fd-fan: 1; --fd-glow: .62; }
.fdMarkGlow {
  position: absolute; left: 10%; right: 10%; bottom: -6%; height: 44%; z-index: 0;
  border-radius: 50%; pointer-events: none;
  background: radial-gradient(52% 60% at 50% 62%, var(--fd-mark-glow, ${STORY}73), transparent 76%);
  filter: blur(9px); -webkit-filter: blur(9px);
  opacity: var(--fd-glow);
  transition: opacity .55s cubic-bezier(.22,.9,.3,1.15);
  -webkit-transition: opacity .55s cubic-bezier(.22,.9,.3,1.15);
}
.fdMark:hover .fdMarkGlow { --fd-glow: .62; }
html.fd-mark-fx .fdMark:not(:hover) .fdMarkGlow {
  animation: fdMarkGlowPulse 4.5s ease-in-out infinite;
  -webkit-animation: fdMarkGlowPulse 4.5s ease-in-out infinite;
}
@keyframes fdMarkGlowPulse { 0%, 100% { --fd-glow: .28; } 50% { --fd-glow: .46; } }
.fdMarkSvg {
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
.fdMark:hover .fdMarkSvg {
  transform: perspective(340px) rotateX(4.5deg) rotateY(-5.5deg) scale(1.02);
  -webkit-transform: perspective(340px) rotateX(4.5deg) rotateY(-5.5deg) scale(1.02);
}
.fdMarkGlyph {
  transform-box: view-box; -webkit-transform-box: view-box;
  will-change: transform;
}
html.fd-mark-fx .fdMarkGlyph { transition: none; -webkit-transition: none; }
.fdMark:hover .fdMarkGlyph {
  transform: translateY(calc(var(--fd-fan) * -2.2px)) scale(calc(1 + var(--fd-fan) * .035));
  -webkit-transform: translateY(calc(var(--fd-fan) * -2.2px)) scale(calc(1 + var(--fd-fan) * .035));
}
.fdMarkSheen {
  transform-box: view-box; -webkit-transform-box: view-box;
  transform: translateX(-100px); -webkit-transform: translateX(-100px);
  opacity: 0; will-change: transform, opacity; pointer-events: none;
}
.fdMark:hover .fdMarkSheen {
  animation: fdMarkSheenSweep .9s cubic-bezier(.3,.5,.25,1) forwards;
  -webkit-animation: fdMarkSheenSweep .9s cubic-bezier(.3,.5,.25,1) forwards;
}
@keyframes fdMarkSheenSweep {
  0% { opacity: 0; transform: translateX(-100px); }
  16% { opacity: .42; }
  60% { opacity: .3; }
  100% { opacity: 0; transform: translateX(118px); }
}
.fdMarkMid { transform-box: view-box; -webkit-transform-box: view-box; }
html.fd-mark-fx .fdMarkMid {
  animation: fdMarkFloat 6s ease-in-out infinite;
  -webkit-animation: fdMarkFloat 6s ease-in-out infinite;
}
@keyframes fdMarkFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1.4px); } }
@media (hover: none), (pointer: coarse) {
  .fdMark:hover .fdMarkSvg { transform: none; -webkit-transform: none; }
  .fdMark:hover .fdMarkGlyph { transform: none; -webkit-transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .fdMark, .fdMarkSvg, .fdMarkGlyph, .fdMarkSheen, .fdMarkGlow, .fdMarkMid {
    animation: none !important; -webkit-animation: none !important;
    transition: none !important; -webkit-transition: none !important;
  }
  .fdMark:hover .fdMarkSvg, .fdMark:hover .fdMarkGlyph { transform: none; -webkit-transform: none; }
}
`;

let markCssReady = false;

/** Injects the mark stylesheet exactly once per document. */
function ensureMarkCss(): void {
  if (markCssReady || typeof document === "undefined") return;
  markCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-fd-mark", "");
  tag.textContent = MARK_CSS;
  document.head.appendChild(tag);
}

let markMotionChecked = false;

/**
 * Registers the animatable custom properties and gates the custom-property
 * loops behind the fd-mark-fx class (browsers without the @property API
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
      document.documentElement.classList.add("fd-mark-fx");
    }
  }, []);
}

type BrandMarkProps = {
  /** rendered square size in px; omitted, the mark fills its box */
  size?: number;
};

/** The drawn brand mark of foundry. */
export function BrandMark({ size }: BrandMarkProps) {
  ensureMarkCss();
  useMarkMotion();
  const vars = {
    "--fd-mark-glow": `${STORY}73`,
  } as CSSProperties;
  if (size !== undefined) {
    vars.width = size;
    vars.height = size;
  }
  return (
    <span className="fdMark" style={vars} aria-hidden="true">
      <span className="fdMarkGlow" />
      <svg className="fdMarkSvg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="fdm-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={STORY} />
            <stop offset=".6" stopColor={STORY} />
            <stop offset="1" stopColor={DEEP} />
          </linearGradient>
          <linearGradient id="fdm-gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".32" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="fdm-orb" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor={SOFT} stopOpacity=".9" />
            <stop offset=".35" stopColor={SOFT} stopOpacity=".5" />
            <stop offset="1" stopColor={SOFT} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fdm-edge-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SOFT} stopOpacity="0" />
            <stop offset=".45" stopColor={SOFT} stopOpacity=".3" />
            <stop offset="1" stopColor={SOFT} stopOpacity=".7" />
          </linearGradient>
          <linearGradient id="fdm-edge-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SOFT} stopOpacity="0" />
            <stop offset=".5" stopColor={SOFT} stopOpacity=".22" />
            <stop offset="1" stopColor={SOFT} stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="fdm-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset=".45" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset=".55" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="fdm-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="fdm-wide" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="fdm-lift" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={DEEP} floodOpacity=".38" />
          </filter>
          <filter id="fdm-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
          <clipPath id="fdm-clip">
            <path d={SQUIRCLE} />
          </clipPath>
        </defs>

        {/* the face: gradient squircle with a soft top gloss */}
        <path d={SQUIRCLE} fill="url(#fdm-bg)" />
        <path d={SQUIRCLE} fill="url(#fdm-gloss)" opacity=".5" />

        <g clipPath="url(#fdm-clip)">
          {/* the mid layer: story orbs breathing over a pedestal band */}
          <g className="fdMarkMid">
            <circle cx="48" cy="40" r="25" fill="url(#fdm-orb)" filter="url(#fdm-wide)" opacity=".85" />
            <rect x="-12" y="56" width="120" height="44" fill={SOFT} opacity=".3" filter="url(#fdm-soft)" />
          </g>

          {/* two blurred inner contours of the squircle */}
          <path
            d={SQUIRCLE}
            fill="none"
            stroke="url(#fdm-edge-d)"
            strokeWidth="6"
            filter="url(#fdm-wide)"
            opacity=".55"
            transform="translate(1.4 1.9) scale(0.97)"
          />
          <path d={SQUIRCLE} fill="none" stroke="url(#fdm-edge-l)" strokeWidth="2.5" filter="url(#fdm-soft)" opacity=".5" />

          {/* the contact ellipse at the base */}
          <ellipse cx="48" cy="94" rx="30" ry="7" fill="url(#fdm-orb)" filter="url(#fdm-soft)" opacity=".55" />

          {/* the sheen band sweeping once on hover */}
          <g className="fdMarkSheen">
            <rect x="-11" y="-24" width="26" height="144" fill="url(#fdm-sheen)" transform="skewX(-16)" />
          </g>

          {/* the discrete film grain */}
          <path d={SQUIRCLE} fill="#ffffff" filter="url(#fdm-grain)" opacity=".08" />
        </g>

        {/* the glyph: thick ivory strokes lifting toward the viewer */}
        <g filter="url(#fdm-lift)">
          <g className="fdMarkGlyph" fill="none" stroke={IVORY} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            {GLYPH}
          </g>
        </g>
      </svg>
    </span>
  );
}

export default BrandMark;
