/**
 * dot.tsx — the status dot of the family (the universal set): the small
 * round state signal that carries the tone of the verdict and the optional
 * pulse or ping loop. the pulse and the ping ride the duty cycled stepped
 * keyframes of the family motion law, and the reduced motion preference
 * zeroes them.
 */

export type DotTone = "neutral" | "ok" | "warn" | "err" | "info";

export type DotProps = {
  /** the tone of the state */
  tone?: DotTone;
  /** the breathing loop for the working states */
  pulse?: boolean;
  /** the expanding ring loop for the connecting states */
  ping?: boolean;
  /** the accessible verdict of the state */
  title?: string;
};

/**
 * The status dot.
 *
 * @param props the tone, the pulse, the ping and the title.
 * @returns the dot element.
 */
export function Dot({ tone = "neutral", pulse = false, ping = false, title }: DotProps) {
  return (
    <span
      className="dot"
      data-tone={tone}
      data-pulse={pulse ? "true" : undefined}
      data-ping={ping ? "true" : undefined}
      title={title}
      role="status"
    />
  );
}

export default Dot;
