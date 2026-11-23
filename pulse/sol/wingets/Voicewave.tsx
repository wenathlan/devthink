/**
 * voicewave.tsx — the drawn voice waveform of the studio: ONE machined
 * signal band, the speaking identity of the voice-first social studio. A
 * pure SVG drawing (no raster, no randomness): a row of rounded bars laid
 * on a symmetric envelope — the shape a spoken phrase traces on a meter —
 * riding hairline guides above and below. The idle motion is the BREATHE:
 * the bars scale on their own centers in a slow stagger (transform only,
 * the campaign ease, guarded by the stylesheet for
 * prefers-reduced-motion). Born the hologram of the Constructionface — the
 * same drawing the future channel surfaces will seat beside the studio
 * chrome hangs behind the panel at construction opacity (see the puconstr
 * section of sol.css), so the studio answers with its own voice even while
 * it is being built.
 */

import { label } from "../../labels";

/** the bar heights of the spoken phrase (viewbox units, symmetric envelope
 * — the meter trace of one utterance; pure data, no randomness). */
const BARS = [
  10, 16, 22, 30, 40, 52, 44, 58, 70, 62, 78, 66, 82, 66, 78, 62, 70, 58, 44, 52, 40, 30, 22, 16,
] as const;

/** the midline of the viewbox the bars stand on (y 60 of the 0 0 320 120 box). */
const MIDLINE = 60;

/** the drawn voice waveform of the studio. the drawing carries no text of
 * its own: the svg title rides the label accessor. */
export function Voicewave() {
  return (
    <span className="puv-root" aria-hidden="true">
      <svg className="puv-svg" viewBox="0 0 320 120" focusable="false" role="presentation">
        <title>{label("voicewave.title")}</title>
        {/* the hairline guides the utterance rides between */}
        <line className="puv-guide" x1="0" y1={MIDLINE - 52} x2="320" y2={MIDLINE - 52} />
        <line className="puv-guide" x1="0" y1={MIDLINE + 52} x2="320" y2={MIDLINE + 52} />
        {/* the utterance: one rounded bar per sample of the envelope */}
        {BARS.map((height, index) => {
          const x = 4 + index * 13.2;
          return <rect className="puv-bar" key={index} x={x} y={MIDLINE - height / 2} width="8" height={height} rx="4" />;
        })}
      </svg>
    </span>
  );
}

export default Voicewave;
