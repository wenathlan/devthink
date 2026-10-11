/**
 * brand.tsx — the drawn brand mark of the cobaia theme, one hand-drawn SVG
 * icon in the house finishing: a gradient squircle face over the amber story
 * (#f59e0b — the family sun, the one accent of this site), a soft top gloss,
 * a discrete film grain and the glyph itself — a beaker, the mark of the
 * experiment the site runs — in thick ivory strokes with a translucent
 * backing. On hover the face tilts gently in perspective (plain CSS on
 * transform only, riding the house cubic-bezier; the stylesheet owns the
 * motion and the prefers-reduced-motion guard). No decorative dots and no
 * loops: the mark speaks for itself. The name "cobaia" is provisional — the
 * mark is deliberately abstract so it survives a rename.
 */
import type { CSSProperties } from "react";

/** the warm ivory of the glyph stroke */
const IVORY = "#fbf5ea";

/** the backing translucency of the outlined glyph shapes */
const BACKING = "rgba(255,255,255,.16)";

/** the amber story of the mark: the family sun and its deep rust floor */
const SUN = "#f59e0b";
const RUST = "#b45309";

/** the asymmetric squircle of the mark face: tighter shoulders, heavier base */
const SQUIRCLE = "M22 0 L74 0 Q96 0 96 22 L96 66 Q96 96 66 96 L30 96 Q0 96 0 66 L0 22 Q0 0 22 0 Z";

type BrandMarkProps = {
  /** rendered square size in px; omitted, the mark fills its box */
  size?: number;
};

/** The drawn brand mark of cobaia. */
export function BrandMark({ size }: BrandMarkProps) {
  const vars: CSSProperties = size !== undefined ? { width: size, height: size } : {};
  return (
    <span className="cbMark" style={vars} aria-hidden="true">
      <svg className="cbMarkSvg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="cbm-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SUN} />
            <stop offset=".62" stopColor={SUN} />
            <stop offset="1" stopColor={RUST} />
          </linearGradient>
          <linearGradient id="cbm-gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".3" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="cbm-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <filter id="cbm-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
          <clipPath id="cbm-clip">
            <path d={SQUIRCLE} />
          </clipPath>
        </defs>

        {/* the face: gradient squircle with a soft top gloss */}
        <path d={SQUIRCLE} fill="url(#cbm-bg)" />
        <path d={SQUIRCLE} fill="url(#cbm-gloss)" opacity=".55" />

        <g clipPath="url(#cbm-clip)">
          {/* the liquid line of the beaker, a quiet inner seam */}
          <ellipse cx="48" cy="94" rx="34" ry="9" fill={RUST} opacity=".45" filter="url(#cbm-soft)" />
          {/* the discrete film grain */}
          <path d={SQUIRCLE} fill="#ffffff" filter="url(#cbm-grain)" opacity=".08" />
        </g>

        {/* the glyph: the beaker, thick ivory strokes */}
        <g fill="none" stroke={IVORY} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M39 25 H57" />
          <path d="M43 25 V44 L31.5 64 A5 5 0 0 0 35.8 72 H60.2 A5 5 0 0 0 64.5 64 L53 44 V25" fill={BACKING} />
          <path d="M37 56 H59" />
        </g>
      </svg>
    </span>
  );
}

export default BrandMark;
