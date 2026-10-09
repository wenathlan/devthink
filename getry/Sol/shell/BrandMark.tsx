/**
 * BrandMark.tsx — the drawn brand mark of the getry theme, one hand-drawn
 * SVG icon in the house finishing (the devthink/Sol/shell/app.icons.tsx
 * standard): a gradient squircle face over the sky story (#60a5fa — the
 * family sky of the gateway, the ONE identity accent of the app), a soft
 * top gloss, a mid layer of blurred story orbs over a pedestal band, two
 * blurred inner contours, a blurred contact ellipse at the base, a
 * discrete film grain, and the glyph itself — the cataloged stack of
 * plates — in thick ivory strokes with a translucent filled backing and a
 * blurred drop shadow. ONE signature motion, the BOX SLIDE: on entry and
 * on hover the stacked plates shift one step with a settle bounce (the
 * spring curve overshoots, the plates stagger bottom-first into the
 * stack), transform/opacity only, hover/entry only — no ambient loop,
 * then stillness. The hover keeps the materiality feedback: the sheen
 * band sweeps once, the contact glow rises and the face tilts gently in
 * perspective. prefers-reduced-motion and coarse pointers switch the
 * slide and the dramatic hover off.
 */
import { type CSSProperties, type ReactElement, useEffect } from "react";

/** the warm ivory of the glyph stroke */
const IVORY = "#fbf5ea";

/** the backing translucency of outlined glyph shapes */
const BACKING = "rgba(255,255,255,.14)";

/** the story palette of the mark (the family sky of getry) */
const STORY = "#60a5fa";
const DEEP = "#2563eb";
const SOFT = "#bfdbfe";

/** the asymmetric squircle of the mark face: tighter shoulders, heavier base */
const SQUIRCLE = "M22 0 L74 0 Q96 0 96 22 L96 66 Q96 96 66 96 L30 96 Q0 96 0 66 L0 22 Q0 0 22 0 Z";

/** the drawn glyph: the cataloged stack of plates */
const GLYPH: ReactElement = (
  <>
    <path d="M48 28.5 L63.5 37.5 L48 46.5 L32.5 37.5 Z" fill={BACKING} />
    <path d="M32.5 46.5 L48 55.5 L63.5 46.5" />
    <path d="M32.5 55 L48 64 L63.5 55" />
  </>
);

/** the animatable custom properties of the mark, mirrored in the stylesheet */
const HOUDINI_PROPS = [{ name: "--gr-glow", syntax: "<number>", inherits: false, initialValue: "0.34" }] as const;

interface HoudiniProp {
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue: string;
}

/* ------------------------------ CSS (injected once) ------------------------ */
const MARK_CSS = `
@property --gr-glow { syntax: "<number>"; inherits: false; initial-value: 0.34; }
.grMark {
  --gr-glow: 0.34;
  position: relative; display: block; width: 100%; height: 100%;
  transform-style: preserve-3d; -webkit-transform-style: preserve-3d;
  isolation: isolate;
}
html.gr-mark-fx .grMark { transition: --gr-glow .6s ease; }
.grMark:hover { --gr-glow: .62; }
.grMarkGlow {
  position: absolute; left: 10%; right: 10%; bottom: -6%; height: 44%; z-index: 0;
  border-radius: 50%; pointer-events: none;
  background: radial-gradient(52% 60% at 50% 62%, var(--gr-mark-glow, ${STORY}73), transparent 76%);
  filter: blur(9px); -webkit-filter: blur(9px);
  opacity: var(--gr-glow);
  transition: opacity .55s cubic-bezier(.22,.9,.3,1.15);
  -webkit-transition: opacity .55s cubic-bezier(.22,.9,.3,1.15);
}
.grMark:hover .grMarkGlow { --gr-glow: .62; }
.grMarkSvg {
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
.grMark:hover .grMarkSvg {
  transform: perspective(340px) rotateX(4.5deg) rotateY(-5.5deg) scale(1.02);
  -webkit-transform: perspective(340px) rotateX(4.5deg) rotateY(-5.5deg) scale(1.02);
}
.grMarkGlyph {
  transform-box: view-box; -webkit-transform-box: view-box;
}
/* the ONE signature motion — the box slide: on entry the plates set into
   the stack bottom-first, one step below the rest, and the settle bounce
   overshoots on the spring curve; on hover the whole stack shifts one
   step and settles the same way. Hover/entry only: no ambient loop. */
.grMarkGlyph path {
  transform-box: view-box; -webkit-transform-box: view-box;
  transform: translate(0, 0); -webkit-transform: translate(0, 0);
  will-change: transform;
  transition: transform .55s cubic-bezier(.22, 1.2, .36, 1);
  -webkit-transition: -webkit-transform .55s cubic-bezier(.22, 1.2, .36, 1), transform .55s cubic-bezier(.22, 1.2, .36, 1);
}
html.gr-mark-fx .grMarkGlyph path {
  animation: grBoxSet .62s cubic-bezier(.22, 1.2, .36, 1) backwards;
  -webkit-animation: grBoxSet .62s cubic-bezier(.22, 1.2, .36, 1) backwards;
}
html.gr-mark-fx .grMarkGlyph path:nth-child(3) { animation-delay: 0ms; -webkit-animation-delay: 0ms; }
html.gr-mark-fx .grMarkGlyph path:nth-child(2) { animation-delay: 75ms; -webkit-animation-delay: 75ms; }
html.gr-mark-fx .grMarkGlyph path:nth-child(1) { animation-delay: 150ms; -webkit-animation-delay: 150ms; }
@keyframes grBoxSet {
  from { opacity: 0; transform: translate(1.4px, 3.2px); }
  to { opacity: 1; transform: translate(0, 0); }
}
.grMark:hover .grMarkGlyph path {
  transform: translate(1.3px, -2.8px);
  -webkit-transform: translate(1.3px, -2.8px);
}
.grMark:hover .grMarkGlyph path:nth-child(2) { transition-delay: 45ms; -webkit-transition-delay: 45ms; }
.grMark:hover .grMarkGlyph path:nth-child(3) { transition-delay: 90ms; -webkit-transition-delay: 90ms; }
.grMarkMid { transform-box: view-box; -webkit-transform-box: view-box; }
.grMarkSheen {
  transform-box: view-box; -webkit-transform-box: view-box;
  transform: translateX(-100px); -webkit-transform: translateX(-100px);
  opacity: 0; will-change: transform, opacity; pointer-events: none;
}
.grMark:hover .grMarkSheen {
  animation: grMarkSheenSweep .9s cubic-bezier(.3,.5,.25,1) forwards;
  -webkit-animation: grMarkSheenSweep .9s cubic-bezier(.3,.5,.25,1) forwards;
}
@keyframes grMarkSheenSweep {
  0% { opacity: 0; transform: translateX(-100px); }
  16% { opacity: .42; }
  60% { opacity: .3; }
  100% { opacity: 0; transform: translateX(118px); }
}
@media (hover: none), (pointer: coarse) {
  .grMark:hover .grMarkSvg { transform: none; -webkit-transform: none; }
  .grMark:hover .grMarkGlyph path { transform: none; -webkit-transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .grMark, .grMarkSvg, .grMarkGlyph, .grMarkGlyph path, .grMarkSheen, .grMarkGlow, .grMarkMid {
    animation: none !important; -webkit-animation: none !important;
    transition: none !important; -webkit-transition: none !important;
  }
  .grMark:hover .grMarkSvg, .grMark:hover .grMarkGlyph path { transform: none; -webkit-transform: none; }
}
`;

let markCssReady = false;

/** Injects the mark stylesheet exactly once per document. */
function ensureMarkCss(): void {
  if (markCssReady || typeof document === "undefined") return;
  markCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-gr-mark", "");
  tag.textContent = MARK_CSS;
  document.head.appendChild(tag);
}

let markMotionChecked = false;

/**
 * Registers the animatable custom properties and gates the custom-property
 * loops behind the gr-mark-fx class (browsers without the @property API
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
      document.documentElement.classList.add("gr-mark-fx");
    }
  }, []);
}

type BrandMarkProps = {
  /** rendered square size in px; omitted, the mark fills its box */
  size?: number;
};

/** The drawn brand mark of getry. */
export function BrandMark({ size }: BrandMarkProps) {
  ensureMarkCss();
  useMarkMotion();
  const vars = {
    "--gr-mark-glow": `${STORY}59`,
  } as CSSProperties;
  if (size !== undefined) {
    vars.width = size;
    vars.height = size;
  }
  return (
    <span className="grMark" style={vars} aria-hidden="true">
      <span className="grMarkGlow" />
      <svg className="grMarkSvg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="grm-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={STORY} />
            <stop offset=".6" stopColor={STORY} />
            <stop offset="1" stopColor={DEEP} />
          </linearGradient>
          <linearGradient id="grm-gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".32" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="grm-orb" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor={SOFT} stopOpacity=".9" />
            <stop offset=".35" stopColor={SOFT} stopOpacity=".5" />
            <stop offset="1" stopColor={SOFT} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="grm-edge-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SOFT} stopOpacity="0" />
            <stop offset=".45" stopColor={SOFT} stopOpacity=".3" />
            <stop offset="1" stopColor={SOFT} stopOpacity=".7" />
          </linearGradient>
          <linearGradient id="grm-edge-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SOFT} stopOpacity="0" />
            <stop offset=".5" stopColor={SOFT} stopOpacity=".22" />
            <stop offset="1" stopColor={SOFT} stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="grm-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset=".45" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset=".55" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="grm-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="grm-wide" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="grm-lift" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={DEEP} floodOpacity=".38" />
          </filter>
          <filter id="grm-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
          <clipPath id="grm-clip">
            <path d={SQUIRCLE} />
          </clipPath>
        </defs>

        {/* the face: gradient squircle with a soft top gloss */}
        <path d={SQUIRCLE} fill="url(#grm-bg)" />
        <path d={SQUIRCLE} fill="url(#grm-gloss)" opacity=".5" />

        <g clipPath="url(#grm-clip)">
          {/* the mid layer: story orbs breathing over a pedestal band */}
          <g className="grMarkMid">
            <circle cx="48" cy="40" r="25" fill="url(#grm-orb)" filter="url(#grm-wide)" opacity=".85" />
            <rect x="-12" y="56" width="120" height="44" fill={SOFT} opacity=".3" filter="url(#grm-soft)" />
          </g>

          {/* two blurred inner contours of the squircle */}
          <path
            d={SQUIRCLE}
            fill="none"
            stroke="url(#grm-edge-d)"
            strokeWidth="6"
            filter="url(#grm-wide)"
            opacity=".55"
            transform="translate(1.4 1.9) scale(0.97)"
          />
          <path
            d={SQUIRCLE}
            fill="none"
            stroke="url(#grm-edge-l)"
            strokeWidth="2.5"
            filter="url(#grm-soft)"
            opacity=".5"
          />

          {/* the contact ellipse at the base */}
          <ellipse cx="48" cy="94" rx="30" ry="7" fill="url(#grm-orb)" filter="url(#grm-soft)" opacity=".55" />

          {/* the sheen band sweeping once on hover */}
          <g className="grMarkSheen">
            <rect x="-11" y="-24" width="26" height="144" fill="url(#grm-sheen)" transform="skewX(-16)" />
          </g>

          {/* the discrete film grain */}
          <path d={SQUIRCLE} fill="#ffffff" filter="url(#grm-grain)" opacity=".08" />
        </g>

        {/* the glyph: thick ivory strokes lifting toward the viewer */}
        <g filter="url(#grm-lift)">
          <g
            className="grMarkGlyph"
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
