/**
 * EmptyState.tsx — the empty state of the argan window (the family recipe:
 * the glyph rests in an accent wash, one line of truth says what is absent
 * and why, one real action hands the operator the way out). Never a dry
 * "nothing here": every state names the cause and carries the escape hatch.
 * The glyph rides the same fluent set the rail uses, the wash mixes the
 * jade of the theme, and the action is a plain anchor or button the caller
 * composes — the component owns only the frame.
 */
import type { GlobeRegular } from "@fluentui/react-icons";
import type { ReactNode } from "react";
import { label } from "../../labels";

type EmptyStateProps = {
  /** the fluent glyph component that speaks for the empty surface */
  icon: typeof GlobeRegular;
  /** the one line of truth: what is absent and why (no marketing) */
  note: string;
  /** the one real action (an anchor or a button) */
  action?: ReactNode;
  /** the data is still on its way: the shimmer face rides instead of the
   * verdict (the micro-windows pass — a skeleton, never dots) */
  pending?: boolean;
};

/**
 * The empty state frame of the argan pages.
 *
 * @param props the glyph, the honest line, the optional action and the
 * optional pending flag (the shimmer face while the catalog answers).
 * @returns the empty state element.
 */
export function EmptyState({ icon: Icon, note, action, pending }: EmptyStateProps) {
  // the loading face: three ruled shimmer bars, the verdict waits for the rows
  if (pending) {
    return (
      <div className="emptystate emptystate--pending" role="status" aria-busy="true">
        <span className="skeleton" style={{ width: "44%" }} aria-hidden="true" />
        <span className="skeleton" style={{ width: "68%" }} aria-hidden="true" />
        <span className="skeleton" style={{ width: "30%" }} aria-hidden="true" />
        <span className="r3a-sr">{label("widget.emptystate.loading")}</span>
      </div>
    );
  }
  return (
    <div className="emptystate">
      <span className="emptystate__glyph" aria-hidden="true">
        <Icon fontSize={22} />
      </span>
      <p className="emptystate__note">{note}</p>
      {action ? <div className="emptystate__action">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
