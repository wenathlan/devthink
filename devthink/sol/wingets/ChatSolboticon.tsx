/**
 * solboticon.tsx — the solbot mark: the chat identity glyph drawn once and
 * mounted everywhere the assistant answers (the rail brand today, the turn
 * avatars and the window chrome the later waves wire). One glyph, three
 * layers stacked with the internal z-order of the icon law, painted bottom
 * first: the amber core at the bottom — the only color voice, carrying the
 * internal radial gradient, a wash from the sol token fading to transparent
 * inside the disc, never a new color behind the glyph — then the rim below
 * the glyph, and the corona rays on top, both in currentColor. The motion
 * states ride the data-state attribute the callers set (idle, thinking,
 * streaming, speaking, halted): the stylesheet keys the stories off it,
 * transform and opacity only, every story inert under
 * prefers-reduced-motion, and the mark never carries a badge, a dot or a
 * count.
 */
import { useId } from "react";

/** the motion states of the mark — the orchestrator keys them from the
 *  session phase: idle static, thinking the rotating corona, streaming the
 *  breathing core, speaking the pulsing rays, halted the dimmed core */
export type SolBotState = "idle" | "thinking" | "streaming" | "speaking" | "halted";

type SolBotIconProps = {
  /** glyph size in px (the mark is square) */
  size?: number;
  /** extra classes the caller composes onto the dtc-solbot root */
  className?: string;
  /** the motion state, idle by default — callers that pass only size and
   *  className keep the static mark exactly as before */
  state?: SolBotState;
  /** promotes the decorative glyph to a named image (standalone use) */
  label?: string;
};

/** SolBotIcon — the Sol assistant mark (strokes = currentColor, core = the
 *  amber wash, motion keyed by data-state). */
export function SolBotIcon({ size = 24, className, state = "idle", label }: SolBotIconProps) {
  /* one gradient per instance: the id stays unique so many marks on one
     page never cross their url(#…) references */
  const coreId = `dtc-solbot-core-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const rootClass = className === undefined ? "dtc-solbot" : `dtc-solbot ${className}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={rootClass}
      data-state={state}
      aria-hidden={label === undefined ? true : undefined}
      role={label === undefined ? undefined : "img"}
      aria-label={label}
      focusable="false"
    >
      <defs>
        {/* the internal radial gradient: the sol token washing from the hot
            center to transparent at the rim edge — the wash lives inside the
            disc only (the chat skin owns the --dtc-sol token; the neutral
            primary keeps the fallback honest) */}
        <radialGradient id={coreId} gradientUnits="userSpaceOnUse" cx="12" cy="12" r="5.55">
          <stop offset="0" style={{ stopColor: "var(--dtc-sol, var(--sol-primary))" }} />
          <stop offset="0.55" stopOpacity="0.85" style={{ stopColor: "var(--dtc-sol, var(--sol-primary))" }} />
          <stop offset="1" stopOpacity="0" style={{ stopColor: "var(--dtc-sol, var(--sol-primary))" }} />
        </radialGradient>
      </defs>
      {/* outer background, bottom: the amber core disc carrying the internal
          gradient wash — the only color voice of the mark */}
      <circle className="dtc-solbot__core" cx="12" cy="12" r="5.55" fill={`url(#${coreId})`} />
      {/* ring, below the glyph: the disc rim in the caller's ink */}
      <circle className="dtc-solbot__rim" cx="12" cy="12" r="6.4" stroke="currentColor" strokeWidth="1.7" />
      {/* glyph, top: the corona rays, eight strokes hand-set on the 45° grid */}
      <path
        className="dtc-solbot__rays"
        d="M21 12h2M18.36 18.36l1.42 1.42M12 21v2M5.64 18.36l-1.42 1.42M3 12H1M5.64 5.64L4.22 4.22M12 3V1M18.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
