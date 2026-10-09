/**
 * BrandMark.tsx — the drawn brand mark of the vault theme, one hand-drawn
 * SVG icon in the house finishing (the devthink/Sol/shell/app.icons.tsx
 * standard): a gradient squircle face over the ice story (#a3d7e6 — the
 * ice light of the safe), a soft top gloss, a mid layer of blurred story
 * orbs over a pedestal band, two blurred inner contours, a blurred contact
 * ellipse at the base, a discrete film grain, and the glyph itself — the
 * three-spoke vault door inside its rings — in thick ivory strokes with a
 * blurred drop shadow. The ONE signature motion is the VAULT DIAL: shortly
 * after entry the dial wheel turns 30deg and locks with a soft click-glint
 * (a light arc flashing once outside the ring); on hover it answers with
 * the same glint and the wheel follows. On hover the sheen band also sweeps
 * once, the contact glow rises and the face tilts gently in perspective —
 * plain CSS transitions/animations on transform/opacity/filter, the
 * @property registered custom properties easing at the house cubic-bezier
 * and -webkit- prefixes on every 3D/filter path. No infinite loops and no
 * microcopy: the icon speaks for itself and then holds still.
 * prefers-reduced-motion and coarse pointers keep the dial and the
 * dramatic hover off.
 */
import { type CSSProperties, type ReactElement, useEffect, useState } from "react";

/** the warm ivory of the glyph stroke */
const IVORY = "#fbf5ea";

/** the story palette of the mark (the ice light of vault) */
const STORY = "#a3d7e6";
const DEEP = "#5b93a6";
const SOFT = "#e0f3f9";

/** the asymmetric squircle of the mark face: tighter shoulders, heavier base */
const SQUIRCLE = "M22 0 L74 0 Q96 0 96 22 L96 66 Q96 96 66 96 L30 96 Q0 96 0 66 L0 22 Q0 0 22 0 Z";

/** the drawn glyph: the three-spoke vault dial inside its rings — the dial
 * wheel (ring, spokes, notch) is the signature-motion group and turns one
 * notch on entry; the glint arc flashes once outside the ring */
const GLYPH: ReactElement = (
  <>
    <circle cx="48" cy="48" r="11" strokeWidth={4.2} />
    <g className="vtMarkDial">
      <circle cx="48" cy="48" r="20" strokeWidth={5.5} />
      <path d="M48 48 V37 M48 48 L57.5 53.5 M48 48 L38.5 53.5" strokeWidth={4.2} />
      <circle cx="48" cy="28" r="2.4" fill={IVORY} stroke="none" />
    </g>
    <path
      className="vtDialGlint"
      d="M45.8 22.6 A25.5 25.5 0 0 1 62.6 27.1"
      fill="none"
      stroke={IVORY}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  </>
);

/** the animatable custom properties of the mark, mirrored in the stylesheet */
const HOUDINI_PROPS = [
  { name: "--vt-fan", syntax: "<number>", inherits: true, initialValue: "0" },
  { name: "--vt-glow", syntax: "<number>", inherits: false, initialValue: "0.34" },
] as const;

interface HoudiniProp {
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue: string;
}

/* ------------------------------ CSS (injected once) ------------------------ */
const MARK_CSS = `
@property --vt-fan { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --vt-glow { syntax: "<number>"; inherits: false; initial-value: 0.34; }
.vtMark {
  --vt-fan: 0;
  --vt-glow: 0.34;
  position: relative; display: block; width: 100%; height: 100%;
  transform-style: preserve-3d; -webkit-transform-style: preserve-3d;
  isolation: isolate;
}
html.vt-mark-fx .vtMark { transition: --vt-fan .55s cubic-bezier(.22,.9,.3,1.15), --vt-glow .6s ease; }
.vtMark:hover { --vt-fan: 1; --vt-glow: .62; }
.vtMarkGlow {
  position: absolute; left: 10%; right: 10%; bottom: -6%; height: 44%; z-index: 0;
  border-radius: 50%; pointer-events: none;
  background: radial-gradient(52% 60% at 50% 62%, var(--vt-mark-glow, ${STORY}73), transparent 76%);
  filter: blur(9px); -webkit-filter: blur(9px);
  opacity: var(--vt-glow);
  transition: opacity .55s cubic-bezier(.22,.9,.3,1.15);
  -webkit-transition: opacity .55s cubic-bezier(.22,.9,.3,1.15);
}
.vtMark:hover .vtMarkGlow { --vt-glow: .62; }
/* the vault dial — the ONE signature motion: the wheel turns 30deg with a
   soft click-glint, on entry and on hover only, then holds still */
.vtMarkDial {
  transform-box: view-box; -webkit-transform-box: view-box;
  transform-origin: 48px 48px;
}
html.vt-mark-fx .vtMarkDial {
  transition: transform .5s cubic-bezier(.22,.9,.3,1.15);
  -webkit-transition: transform .5s cubic-bezier(.22,.9,.3,1.15);
}
.vtMark:hover .vtMarkDial, .vtMark-enter .vtMarkDial {
  transform: rotate(30deg); -webkit-transform: rotate(30deg);
}
.vtDialGlint { opacity: 0; pointer-events: none; }
.vtMark:hover .vtDialGlint, .vtMark-enter .vtDialGlint {
  animation: vtDialGlint .6s ease .14s 1 both;
  -webkit-animation: vtDialGlint .6s ease .14s 1 both;
}
@keyframes vtDialGlint { 0% { opacity: 0; } 30% { opacity: .9; } 100% { opacity: 0; } }
.vtMarkSvg {
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
.vtMark:hover .vtMarkSvg {
  transform: perspective(340px) rotateX(4.5deg) rotateY(-5.5deg) scale(1.02);
  -webkit-transform: perspective(340px) rotateX(4.5deg) rotateY(-5.5deg) scale(1.02);
}
.vtMarkGlyph {
  transform-box: view-box; -webkit-transform-box: view-box;
  will-change: transform;
}
html.vt-mark-fx .vtMarkGlyph { transition: none; -webkit-transition: none; }
.vtMark:hover .vtMarkGlyph {
  transform: translateY(calc(var(--vt-fan) * -2.2px)) scale(calc(1 + var(--vt-fan) * .035));
  -webkit-transform: translateY(calc(var(--vt-fan) * -2.2px)) scale(calc(1 + var(--vt-fan) * .035));
}
.vtMarkSheen {
  transform-box: view-box; -webkit-transform-box: view-box;
  transform: translateX(-100px); -webkit-transform: translateX(-100px);
  opacity: 0; will-change: transform, opacity; pointer-events: none;
}
.vtMark:hover .vtMarkSheen {
  animation: vtMarkSheenSweep .9s cubic-bezier(.3,.5,.25,1) forwards;
  -webkit-animation: vtMarkSheenSweep .9s cubic-bezier(.3,.5,.25,1) forwards;
}
@keyframes vtMarkSheenSweep {
  0% { opacity: 0; transform: translateX(-100px); }
  16% { opacity: .42; }
  60% { opacity: .3; }
  100% { opacity: 0; transform: translateX(118px); }
}
.vtMarkMid { transform-box: view-box; -webkit-transform-box: view-box; }
@media (hover: none), (pointer: coarse) {
  .vtMark:hover .vtMarkSvg { transform: none; -webkit-transform: none; }
  .vtMark:hover .vtMarkGlyph { transform: none; -webkit-transform: none; }
  .vtMark:hover .vtMarkDial { transform: none; -webkit-transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .vtMark, .vtMarkSvg, .vtMarkGlyph, .vtMarkSheen, .vtMarkGlow, .vtMarkMid, .vtMarkDial, .vtDialGlint {
    animation: none !important; -webkit-animation: none !important;
    transition: none !important; -webkit-transition: none !important;
  }
  .vtMark:hover .vtMarkSvg, .vtMark:hover .vtMarkGlyph { transform: none; -webkit-transform: none; }
  .vtMark:hover .vtMarkDial, .vtMark-enter .vtMarkDial { transform: none; -webkit-transform: none; }
  .vtDialGlint { opacity: 0 !important; }
}
`;

let markCssReady = false;

/** Injects the mark stylesheet exactly once per document. */
function ensureMarkCss(): void {
  if (markCssReady || typeof document === "undefined") return;
  markCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-vt-mark", "");
  tag.textContent = MARK_CSS;
  document.head.appendChild(tag);
}

let markMotionChecked = false;

/**
 * Registers the animatable custom properties and gates the custom-property
 * loops behind the vt-mark-fx class (browsers without the @property API
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
      document.documentElement.classList.add("vt-mark-fx");
    }
  }, []);
}

type BrandMarkProps = {
  /** rendered square size in px; omitted, the mark fills its box */
  size?: number;
};

/** The drawn brand mark of vault. */
export function BrandMark({ size }: BrandMarkProps) {
  ensureMarkCss();
  useMarkMotion();
  // the signature motion: the vault dial locks one notch shortly after the
  // mark enters (the click-glint plays with it) — reduced motion never arms it
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => setEntered(true), 80);
    return () => window.clearTimeout(id);
  }, []);
  const vars = {
    "--vt-mark-glow": `${STORY}73`,
  } as CSSProperties;
  if (size !== undefined) {
    vars.width = size;
    vars.height = size;
  }
  return (
    <span className={entered ? "vtMark vtMark-enter" : "vtMark"} style={vars} aria-hidden="true">
      <span className="vtMarkGlow" />
      <svg className="vtMarkSvg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="vtm-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={STORY} />
            <stop offset=".6" stopColor={STORY} />
            <stop offset="1" stopColor={DEEP} />
          </linearGradient>
          <linearGradient id="vtm-gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".32" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="vtm-orb" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor={SOFT} stopOpacity=".9" />
            <stop offset=".35" stopColor={SOFT} stopOpacity=".5" />
            <stop offset="1" stopColor={SOFT} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="vtm-edge-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SOFT} stopOpacity="0" />
            <stop offset=".45" stopColor={SOFT} stopOpacity=".3" />
            <stop offset="1" stopColor={SOFT} stopOpacity=".7" />
          </linearGradient>
          <linearGradient id="vtm-edge-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SOFT} stopOpacity="0" />
            <stop offset=".5" stopColor={SOFT} stopOpacity=".22" />
            <stop offset="1" stopColor={SOFT} stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="vtm-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset=".45" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset=".55" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="vtm-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="vtm-wide" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="vtm-lift" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={DEEP} floodOpacity=".38" />
          </filter>
          <filter id="vtm-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
          <clipPath id="vtm-clip">
            <path d={SQUIRCLE} />
          </clipPath>
        </defs>

        {/* the face: gradient squircle with a soft top gloss */}
        <path d={SQUIRCLE} fill="url(#vtm-bg)" />
        <path d={SQUIRCLE} fill="url(#vtm-gloss)" opacity=".5" />

        <g clipPath="url(#vtm-clip)">
          {/* the mid layer: story orbs breathing over a pedestal band */}
          <g className="vtMarkMid">
            <circle cx="48" cy="40" r="25" fill="url(#vtm-orb)" filter="url(#vtm-wide)" opacity=".85" />
            <rect x="-12" y="56" width="120" height="44" fill={SOFT} opacity=".3" filter="url(#vtm-soft)" />
          </g>

          {/* two blurred inner contours of the squircle */}
          <path
            d={SQUIRCLE}
            fill="none"
            stroke="url(#vtm-edge-d)"
            strokeWidth="6"
            filter="url(#vtm-wide)"
            opacity=".55"
            transform="translate(1.4 1.9) scale(0.97)"
          />
          <path
            d={SQUIRCLE}
            fill="none"
            stroke="url(#vtm-edge-l)"
            strokeWidth="2.5"
            filter="url(#vtm-soft)"
            opacity=".5"
          />

          {/* the contact ellipse at the base */}
          <ellipse cx="48" cy="94" rx="30" ry="7" fill="url(#vtm-orb)" filter="url(#vtm-soft)" opacity=".55" />

          {/* the sheen band sweeping once on hover */}
          <g className="vtMarkSheen">
            <rect x="-11" y="-24" width="26" height="144" fill="url(#vtm-sheen)" transform="skewX(-16)" />
          </g>

          {/* the discrete film grain */}
          <path d={SQUIRCLE} fill="#ffffff" filter="url(#vtm-grain)" opacity=".08" />
        </g>

        {/* the glyph: thick ivory strokes lifting toward the viewer */}
        <g filter="url(#vtm-lift)">
          <g
            className="vtMarkGlyph"
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
