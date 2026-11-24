/**
 * VuMeter.tsx — the vertical VU meter of the studio mixer (Sol layer): a
 * gradient column whose height reads the live analyser level (dBFS →
 * percent via dawview), with the peak tick on top. The height rides a CSS
 * custom property so the poll loop stays cheap; reduced motion keeps the
 * last honest reading without transition.
 */
import type { CSSProperties } from "react";
import { levelToPercent } from "../../dawview.ts";
import { labelfill } from "../../labels.ts";

type VuMeterProps = {
  /** The strip the meter belongs to (aria). */
  name: string;
  /** The live level in dBFS (−Infinity = silence). */
  level: number;
  /** Whether the transport is running (meters read live) — otherwise the resting value. */
  live?: boolean;
  /** The resting percent when the transport is stopped (0..100). */
  rest?: number;
};

/**
 * The VU column of one strip.
 *
 * @param props the strip name, the level and the resting percent.
 * @returns the meter element (the painted column plus the native reading).
 */
export function VuMeter({ name, level, live = false, rest = 0 }: VuMeterProps) {
  const percent = live ? levelToPercent(level) : rest;
  return (
    <>
      {/* the painted column: presentational only — the native <meter> below
          carries the live reading, so the visual never answers the a11y tree
          twice (the meter widget paints no children of its own, so the
          gradient rides this layer, the semantics ride the real element) */}
      <div className="vu" aria-hidden="true" data-idle={live ? undefined : "true"}>
        <i style={{ "--m": `${percent.toFixed(1)}%` } as CSSProperties} />
      </div>
      <meter
        className="sr-only"
        min={0}
        max={100}
        value={Math.round(percent)}
        aria-label={labelfill("studio.vu.aria", { name })}
      />
    </>
  );
}

export default VuMeter;
