/**
 * VuMeter.tsx — the vertical VU meter of the studio mixer (Sol layer): a
 * gradient column whose height reads the live analyser level (dBFS →
 * percent via dawview), with the peak tick on top. The height rides a CSS
 * custom property so the poll loop stays cheap; reduced motion keeps the
 * last honest reading without transition.
 */
import type { CSSProperties } from "react";
import { levelToPercent } from "../../../dawview.ts";

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
 * @returns the meter element.
 */
export function VuMeter({ name, level, live = false, rest = 0 }: VuMeterProps) {
  const percent = live ? levelToPercent(level) : rest;
  return (
    <div
      className="vu"
      role="meter"
      aria-label={`${name} level`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
    >
      <i style={{ "--m": `${percent.toFixed(1)}%` } as CSSProperties} />
    </div>
  );
}

export default VuMeter;
