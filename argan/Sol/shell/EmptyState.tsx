/**
 * EmptyState.tsx — the empty state of the argan window (the family recipe:
 * the glyph rests in an accent wash, one line of truth says what is absent
 * and why, one real action hands the operator the way out). Never a dry
 * "nothing here": every state names the cause and carries the escape hatch.
 * The glyph rides the same lucide set the rail uses, the wash mixes the
 * jade of the theme, and the action is a plain anchor or button the caller
 * composes — the component owns only the frame.
 */
import type { ReactNode } from "react";

type EmptyStateProps = {
  /** the lucide glyph component that speaks for the empty surface */
  icon: typeof import("lucide-react").Network;
  /** the one line of truth: what is absent and why (no marketing) */
  note: string;
  /** the one real action (an anchor or a button) */
  action?: ReactNode;
};

/**
 * The empty state frame of the argan pages.
 *
 * @param props the glyph, the honest line and the optional action.
 * @returns the empty state element.
 */
export function EmptyState({ icon: Icon, note, action }: EmptyStateProps) {
  return (
    <div className="emptystate">
      <span className="emptystate__glyph" aria-hidden="true">
        <Icon size={22} strokeWidth={1.7} />
      </span>
      <p className="emptystate__note">{note}</p>
      {action ? <div className="emptystate__action">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
