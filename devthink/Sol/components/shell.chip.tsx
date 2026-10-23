/**
 * chip.tsx — the inline chip of the family (the universal set): the pill
 * that rides inside the text flow, carries the tone of its verdict and the
 * optional remove action. the text rides the children, never a hardcoded
 * string, and the chip scales with the context font size.
 */

import type { ReactNode } from "react";

export type ChipTone = "neutral" | "ok" | "warn" | "err" | "info";

export type ChipProps = {
  /** the tone of the verdict */
  tone?: ChipTone;
  /** the remove verdict when the chip is dismissible */
  onRemove?: () => void;
  /** the accessible verdict of the remove action */
  removeTitle?: string;
  /** the chip content */
  children: ReactNode;
};

/**
 * The inline chip.
 *
 * @param props the tone, the remove, the remove title and the children.
 * @returns the chip element.
 */
export function Chip({ tone = "neutral", onRemove, removeTitle, children }: ChipProps) {
  return (
    <span className="uichip" data-tone={tone}>
      {children}
      {onRemove ? (
        <button type="button" className="uichip__x" onClick={onRemove} title={removeTitle} aria-label={removeTitle}>
          ×
        </button>
      ) : null}
    </span>
  );
}

export default Chip;
