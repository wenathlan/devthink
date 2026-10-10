/**
 * CadriaMark.tsx — the premium drawn mark of the theme (the rose squircle
 * over the cadria rose story), extracted verbatim from the old window chrome
 * so the page hero zones keep their lockup. This is NOT the chrome logo: the
 * shell never renders it — the titlebar slot carries BrandMark only. The
 * ONE signature motion (the rose spin: a slow 12deg swing with one sheen
 * sweep, hover/entry only) rides the self-owned `data-motion="rose-spin"`
 * hook and the `.sol-mark__swing` wrapper — plain transform/opacity/filter,
 * guarded for reduced motion by Sol/sol.css. After the entry swing the mark
 * holds still.
 */

/** the rose story of cadria: face gradient top, glow and orb */
const MARK_STORY = "#f472b6";
/** the deep shade the face gradient settles into */
const MARK_DEEP = "#9d174d";
/** the warm subtone of the mid layer, contours and contact ellipse */
const MARK_SOFT = "#f7c4e2";
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
};

/** The studio glyph: a clapperboard caught mid-slate over the rose face. */
function MarkGlyph() {
  return (
    <>
      <rect x="28" y="46" width="40" height="21" rx="5" fill={MARK_BACKING} />
      <path d="M30.5 46 L33.8 31.5 L67.5 37.5 L65 46 Z" fill={MARK_BACKING} />
      <path d="M41.5 33.2 L44.5 45.3 M53 35.3 L55.5 45.5" strokeWidth={4.2} />
    </>
  );
}

export function CadriaMark({ size, hidden }: MarkProps) {
  const vars = size ? { width: size, height: size } : undefined;
  return (
    <span className="sol-mark" data-motion="rose-spin" style={vars} aria-hidden={hidden || undefined}>
      <span className="sol-mark__glow" />
      <span className="sol-mark__swing">
        <svg className="sol-mark__svg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="cdrm-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={MARK_STORY} />
              <stop offset=".6" stopColor={MARK_STORY} />
              <stop offset="1" stopColor={MARK_DEEP} />
            </linearGradient>
            <linearGradient id="cdrm-gloss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".32" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="cdrm-orb" cx=".5" cy=".5" r=".5">
              <stop offset="0" stopColor={MARK_SOFT} stopOpacity=".9" />
              <stop offset=".35" stopColor={MARK_SOFT} stopOpacity=".5" />
              <stop offset="1" stopColor={MARK_SOFT} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="cdrm-edge-l" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={MARK_SOFT} stopOpacity="0" />
              <stop offset=".45" stopColor={MARK_SOFT} stopOpacity=".3" />
              <stop offset="1" stopColor={MARK_SOFT} stopOpacity=".7" />
            </linearGradient>
            <linearGradient id="cdrm-edge-d" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={MARK_SOFT} stopOpacity="0" />
              <stop offset=".5" stopColor={MARK_SOFT} stopOpacity=".22" />
              <stop offset="1" stopColor={MARK_SOFT} stopOpacity=".55" />
            </linearGradient>
            <linearGradient id="cdrm-sheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
              <stop offset=".45" stopColor="#ffffff" stopOpacity=".5" />
              <stop offset=".55" stopColor="#ffffff" stopOpacity=".5" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <filter id="cdrm-soft" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <filter id="cdrm-wide" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id="cdrm-lift" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={MARK_DEEP} floodOpacity=".38" />
            </filter>
            <filter id="cdrm-grain" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
              <feColorMatrix in="n" type="saturate" values="0" />
              <feComposite operator="in" in2="SourceGraphic" />
            </filter>
            <clipPath id="cdrm-clip">
              <path d={MARK_SQUIRCLE} />
            </clipPath>
          </defs>

          {/* the face: gradient squircle with a soft top gloss */}
          <path d={MARK_SQUIRCLE} fill="url(#cdrm-bg)" />
          <path d={MARK_SQUIRCLE} fill="url(#cdrm-gloss)" opacity=".5" />

          <g clipPath="url(#cdrm-clip)">
            {/* the mid layer: story orbs breathing over a pedestal band */}
            <g className="sol-mark__mid">
              <circle cx="48" cy="40" r="25" fill="url(#cdrm-orb)" filter="url(#cdrm-wide)" opacity=".85" />
              <rect x="-12" y="56" width="120" height="44" fill={MARK_SOFT} opacity=".3" filter="url(#cdrm-soft)" />
            </g>

            {/* two blurred inner contours of the squircle */}
            <path
              d={MARK_SQUIRCLE}
              fill="none"
              stroke="url(#cdrm-edge-d)"
              strokeWidth="6"
              filter="url(#cdrm-wide)"
              opacity=".55"
              transform="translate(1.4 1.9) scale(0.97)"
            />
            <path
              d={MARK_SQUIRCLE}
              fill="none"
              stroke="url(#cdrm-edge-l)"
              strokeWidth="2.5"
              filter="url(#cdrm-soft)"
              opacity=".5"
            />

            {/* the contact ellipse at the base */}
            <ellipse cx="48" cy="94" rx="30" ry="7" fill="url(#cdrm-orb)" filter="url(#cdrm-soft)" opacity=".55" />

            {/* the sheen band sweeping once on hover */}
            <g className="sol-mark__sheen">
              <rect x="-11" y="-24" width="26" height="144" fill="url(#cdrm-sheen)" transform="skewX(-16)" />
            </g>

            {/* the discrete film grain */}
            <path d={MARK_SQUIRCLE} fill="#ffffff" filter="url(#cdrm-grain)" opacity=".08" />
          </g>

          {/* the glyph: thick ivory strokes lifting toward the viewer */}
          <g filter="url(#cdrm-lift)">
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
    </span>
  );
}

export default CadriaMark;
