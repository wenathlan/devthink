/**
 * BrandMark.tsx — the drawn brand mark of the stealthhead theme, one
 * hand-drawn SVG icon in the house finishing (the
 * devthink/Sol/shell/app.icons.tsx standard): a gradient squircle face over
 * the coral story (#f4694f — the scope red of the FPS platform), a soft top
 * gloss, a mid layer of blurred story orbs over a pedestal band, two blurred
 * inner contours, a blurred contact ellipse at the base, a discrete film
 * grain, and the glyph itself — the match scope with its cardinal ticks —
 * in thick ivory strokes with a translucent filled backing and a blurred
 * drop shadow. On hover the sheen band sweeps once, the contact glow rises
 * and the face tilts gently in perspective. The SIGNATURE MOTION (wave C1,
 * NeoSkills bar) is the crosshair breathe: the cardinal reticle ticks
 * expand 1.5px and contract — one beat on entry and one on hover, never an
 * idle loop, plain transform keyframes driven by the self-owned
 * useTickBreathe hook (the entry flag clears itself, so un-hovering never
 * replays the beat). prefers-reduced-motion and coarse pointers switch the
 * breathe and the dramatic hover off.
 */
import { type CSSProperties, type ReactElement, useEffect, useState } from "react";

/** the warm ivory of the glyph stroke */
const IVORY = "#fbf5ea";

/** the story palette of the mark (the coral scope red of stealthhead) */
const STORY = "#f4694f";
const DEEP = "#a63322";
const SOFT = "#ffd3c4";

/** the asymmetric squircle of the mark face: tighter shoulders, heavier base */
const SQUIRCLE = "M22 0 L74 0 Q96 0 96 22 L96 66 Q96 96 66 96 L30 96 Q0 96 0 66 L0 22 Q0 0 22 0 Z";

/** the drawn glyph: the match scope ring and its cardinal ticks — the
 * ticks live in their own group so the crosshair-breathe motion moves them
 * alone (the ring and the dot hold still) */
const GLYPH: ReactElement = (
  <>
    <circle cx="48" cy="48" r="17.5" />
    <g className="shMarkTicks">
      <path d="M48 24.5 V31.5 M48 64.5 V71.5 M24.5 48 H31.5 M64.5 48 H71.5" />
    </g>
    <circle cx="48" cy="48" r="4.4" fill={IVORY} stroke="none" />
  </>
);

/** the animatable custom properties of the mark, mirrored in the stylesheet */
const HOUDINI_PROPS = [
  { name: "--sh-fan", syntax: "<number>", inherits: true, initialValue: "0" },
  { name: "--sh-glow", syntax: "<number>", inherits: false, initialValue: "0.34" },
] as const;

interface HoudiniProp {
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue: string;
}

/* ------------------------------ CSS (injected once) ------------------------ */
const MARK_CSS = `
@property --sh-fan { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --sh-glow { syntax: "<number>"; inherits: false; initial-value: 0.34; }
.shMark {
  --sh-fan: 0;
  --sh-glow: 0.34;
  position: relative; display: block; width: 100%; height: 100%;
  transform-style: preserve-3d; -webkit-transform-style: preserve-3d;
  isolation: isolate;
}
html.sh-mark-fx .shMark { transition: --sh-fan .55s cubic-bezier(.22,.9,.3,1.15), --sh-glow .6s ease; }
.shMark:hover { --sh-fan: 1; --sh-glow: .62; }
.shMarkGlow {
  position: absolute; left: 10%; right: 10%; bottom: -6%; height: 44%; z-index: 0;
  border-radius: 50%; pointer-events: none;
  background: radial-gradient(52% 60% at 50% 62%, var(--sh-mark-glow, ${STORY}73), transparent 76%);
  filter: blur(9px); -webkit-filter: blur(9px);
  opacity: var(--sh-glow);
  transition: opacity .55s cubic-bezier(.22,.9,.3,1.15);
  -webkit-transition: opacity .55s cubic-bezier(.22,.9,.3,1.15);
}
.shMark:hover .shMarkGlow { --sh-glow: .62; }
html.sh-mark-fx .shMark:not(:hover) .shMarkGlow {
  animation: shMarkGlowPulse 4.5s ease-in-out infinite;
  -webkit-animation: shMarkGlowPulse 4.5s ease-in-out infinite;
}
@keyframes shMarkGlowPulse { 0%, 100% { --sh-glow: .28; } 50% { --sh-glow: .46; } }
.shMarkSvg {
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
.shMark:hover .shMarkSvg {
  transform: perspective(340px) rotateX(4.5deg) rotateY(-5.5deg) scale(1.02);
  -webkit-transform: perspective(340px) rotateX(4.5deg) rotateY(-5.5deg) scale(1.02);
}
.shMarkGlyph {
  transform-box: view-box; -webkit-transform-box: view-box;
  will-change: transform;
}
html.sh-mark-fx .shMarkGlyph { transition: none; -webkit-transition: none; }
/* the signature motion: the crosshair breathe — the cardinal ticks expand
   1.5px (tips at r 31.5 ride the 1.048 scale) and contract, one beat on
   entry and one on hover, never an idle loop; transform only */
.shMarkTicks {
  transform-box: view-box; -webkit-transform-box: view-box;
  transform-origin: 48px 48px;
  will-change: transform;
}
.shMark[data-breathe="in"] .shMarkTicks {
  animation: shTickBreathe 1.5s cubic-bezier(.22,.9,.3,1) .5s 1 both;
  -webkit-animation: shTickBreathe 1.5s cubic-bezier(.22,.9,.3,1) .5s 1 both;
}
.shMark:hover .shMarkTicks {
  animation: shTickBreathe 1.15s cubic-bezier(.22,.9,.3,1) 1;
  -webkit-animation: shTickBreathe 1.15s cubic-bezier(.22,.9,.3,1) 1;
}
@keyframes shTickBreathe { 0%, 100% { transform: scale(1); } 45%, 55% { transform: scale(1.048); } }
.shMark:hover .shMarkGlyph {
  transform: translateY(calc(var(--sh-fan) * -2.2px)) scale(calc(1 + var(--sh-fan) * .035));
  -webkit-transform: translateY(calc(var(--sh-fan) * -2.2px)) scale(calc(1 + var(--sh-fan) * .035));
}
.shMarkSheen {
  transform-box: view-box; -webkit-transform-box: view-box;
  transform: translateX(-100px); -webkit-transform: translateX(-100px);
  opacity: 0; will-change: transform, opacity; pointer-events: none;
}
.shMark:hover .shMarkSheen {
  animation: shMarkSheenSweep .9s cubic-bezier(.3,.5,.25,1) forwards;
  -webkit-animation: shMarkSheenSweep .9s cubic-bezier(.3,.5,.25,1) forwards;
}
@keyframes shMarkSheenSweep {
  0% { opacity: 0; transform: translateX(-100px); }
  16% { opacity: .42; }
  60% { opacity: .3; }
  100% { opacity: 0; transform: translateX(118px); }
}
.shMarkMid { transform-box: view-box; -webkit-transform-box: view-box; }
html.sh-mark-fx .shMarkMid {
  animation: shMarkFloat 6s ease-in-out infinite;
  -webkit-animation: shMarkFloat 6s ease-in-out infinite;
}
@keyframes shMarkFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1.4px); } }
@media (hover: none), (pointer: coarse) {
  .shMark:hover .shMarkSvg { transform: none; -webkit-transform: none; }
  .shMark:hover .shMarkGlyph { transform: none; -webkit-transform: none; }
  .shMark:hover .shMarkTicks { animation: none; -webkit-animation: none; }
}
@media (prefers-reduced-motion: reduce) {
  .shMark, .shMarkSvg, .shMarkGlyph, .shMarkTicks, .shMarkSheen, .shMarkGlow, .shMarkMid {
    animation: none !important; -webkit-animation: none !important;
    transition: none !important; -webkit-transition: none !important;
  }
  .shMark:hover .shMarkSvg, .shMark:hover .shMarkGlyph { transform: none; -webkit-transform: none; }
}
`;

let markCssReady = false;

/** Injects the mark stylesheet exactly once per document. */
function ensureMarkCss(): void {
  if (markCssReady || typeof document === "undefined") return;
  markCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-sh-mark", "");
  tag.textContent = MARK_CSS;
  document.head.appendChild(tag);
}

let markMotionChecked = false;

/**
 * Registers the animatable custom properties and gates the custom-property
 * loops behind the sh-mark-fx class (browsers without the @property API
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
      document.documentElement.classList.add("sh-mark-fx");
    }
  }, []);
}

type BrandMarkProps = {
  /** rendered square size in px; omitted, the mark fills its box */
  size?: number;
};

/**
 * The entry beat of the signature motion: the reticle ticks breathe once
 * when the mark lands. The flag gates the one-shot keyframes through the
 * data-breathe hook attribute and clears itself after the beat, so the
 * motion stays hover/entry only — un-hovering never replays it.
 *
 * @returns true while the entry beat should play.
 */
function useTickBreathe(): boolean {
  const [entering, setEntering] = useState(true);
  useEffect(() => {
    if (!entering) return;
    const beat = window.setTimeout(() => setEntering(false), 2300);
    return () => window.clearTimeout(beat);
  }, [entering]);
  return entering;
}

/** The drawn brand mark of stealthhead. */
export function BrandMark({ size }: BrandMarkProps) {
  ensureMarkCss();
  useMarkMotion();
  const entering = useTickBreathe();
  const vars = {
    "--sh-mark-glow": `${STORY}73`,
  } as CSSProperties;
  if (size !== undefined) {
    vars.width = size;
    vars.height = size;
  }
  return (
    <span className="shMark" style={vars} data-breathe={entering ? "in" : undefined} aria-hidden="true">
      <span className="shMarkGlow" />
      <svg className="shMarkSvg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="shm-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={STORY} />
            <stop offset=".6" stopColor={STORY} />
            <stop offset="1" stopColor={DEEP} />
          </linearGradient>
          <linearGradient id="shm-gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".32" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="shm-orb" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor={SOFT} stopOpacity=".9" />
            <stop offset=".35" stopColor={SOFT} stopOpacity=".5" />
            <stop offset="1" stopColor={SOFT} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="shm-edge-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SOFT} stopOpacity="0" />
            <stop offset=".45" stopColor={SOFT} stopOpacity=".3" />
            <stop offset="1" stopColor={SOFT} stopOpacity=".7" />
          </linearGradient>
          <linearGradient id="shm-edge-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SOFT} stopOpacity="0" />
            <stop offset=".5" stopColor={SOFT} stopOpacity=".22" />
            <stop offset="1" stopColor={SOFT} stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="shm-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset=".45" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset=".55" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="shm-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="shm-wide" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="shm-lift" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={DEEP} floodOpacity=".38" />
          </filter>
          <filter id="shm-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
          <clipPath id="shm-clip">
            <path d={SQUIRCLE} />
          </clipPath>
        </defs>

        {/* the face: gradient squircle with a soft top gloss */}
        <path d={SQUIRCLE} fill="url(#shm-bg)" />
        <path d={SQUIRCLE} fill="url(#shm-gloss)" opacity=".5" />

        <g clipPath="url(#shm-clip)">
          {/* the mid layer: story orbs breathing over a pedestal band */}
          <g className="shMarkMid">
            <circle cx="48" cy="40" r="25" fill="url(#shm-orb)" filter="url(#shm-wide)" opacity=".85" />
            <rect x="-12" y="56" width="120" height="44" fill={SOFT} opacity=".3" filter="url(#shm-soft)" />
          </g>

          {/* two blurred inner contours of the squircle */}
          <path
            d={SQUIRCLE}
            fill="none"
            stroke="url(#shm-edge-d)"
            strokeWidth="6"
            filter="url(#shm-wide)"
            opacity=".55"
            transform="translate(1.4 1.9) scale(0.97)"
          />
          <path
            d={SQUIRCLE}
            fill="none"
            stroke="url(#shm-edge-l)"
            strokeWidth="2.5"
            filter="url(#shm-soft)"
            opacity=".5"
          />

          {/* the contact ellipse at the base */}
          <ellipse cx="48" cy="94" rx="30" ry="7" fill="url(#shm-orb)" filter="url(#shm-soft)" opacity=".55" />

          {/* the sheen band sweeping once on hover */}
          <g className="shMarkSheen">
            <rect x="-11" y="-24" width="26" height="144" fill="url(#shm-sheen)" transform="skewX(-16)" />
          </g>

          {/* the discrete film grain */}
          <path d={SQUIRCLE} fill="#ffffff" filter="url(#shm-grain)" opacity=".08" />
        </g>

        {/* the glyph: thick ivory strokes lifting toward the viewer */}
        <g filter="url(#shm-lift)">
          <g
            className="shMarkGlyph"
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
