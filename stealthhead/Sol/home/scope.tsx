/**
 * scope.tsx — the hero object of the stealthhead landing (campaign v3 ·
 * r3-stealthhead): ONE drawn scope reticle, the machined crosshair of the
 * platform. A pure SVG drawing (no raster, no randomness): the outer rim,
 * the signal arc that plays the rim light, the inner ring, the cardinal
 * ticks, the minor diagonal ticks, the hairline dashed cross and the center
 * dot. The idle motion is the SWEEP — the whole reticle rocks ±2° over 5s
 * (transform only, the campaign ease, guarded by the stylesheet for
 * prefers-reduced-motion). Mark discipline: the reticle is the ONE mark of
 * the landing zone — the title-bar mark rests while it owns the stage
 * (data-landing, see Shell.tsx and the r3-stealthhead section of sol.css).
 */

/** the drawn scope reticle of the landing stage. */
export function Scope() {
  return (
    <span className="shs-root" aria-hidden="true">
      <svg className="shs-svg" viewBox="0 0 200 200" focusable="false" role="presentation">
        <title>scope reticle</title>
        {/* the rim: the outer ring and the signal arc that carries the light */}
        <circle className="shs-ring" cx="100" cy="100" r="86" />
        <path className="shs-arc" d="M 100 6 A 94 94 0 0 1 194 100" />
        {/* the inner ring + the center well */}
        <circle className="shs-ring shs-ring--inner" cx="100" cy="100" r="62" />
        <circle className="shs-ring shs-ring--well" cx="100" cy="100" r="11" />
        {/* the hairline dashed cross */}
        <line className="shs-cross" x1="100" y1="10" x2="100" y2="190" />
        <line className="shs-cross" x1="10" y1="100" x2="190" y2="100" />
        {/* the cardinal ticks */}
        <g>
          <line className="shs-tick" x1="100" y1="16" x2="100" y2="34" />
          <line className="shs-tick" x1="100" y1="166" x2="100" y2="184" />
          <line className="shs-tick" x1="16" y1="100" x2="34" y2="100" />
          <line className="shs-tick" x1="166" y1="100" x2="184" y2="100" />
        </g>
        {/* the minor diagonal ticks */}
        <g>
          <line className="shs-tick shs-tick--minor" x1="100" y1="16" x2="100" y2="28" transform="rotate(45 100 100)" />
          <line
            className="shs-tick shs-tick--minor"
            x1="100"
            y1="16"
            x2="100"
            y2="28"
            transform="rotate(135 100 100)"
          />
          <line
            className="shs-tick shs-tick--minor"
            x1="100"
            y1="16"
            x2="100"
            y2="28"
            transform="rotate(225 100 100)"
          />
          <line
            className="shs-tick shs-tick--minor"
            x1="100"
            y1="16"
            x2="100"
            y2="28"
            transform="rotate(315 100 100)"
          />
        </g>
        {/* the center dot */}
        <circle className="shs-dot" cx="100" cy="100" r="3" />
      </svg>
    </span>
  );
}

export default Scope;
