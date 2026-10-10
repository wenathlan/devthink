/**
 * EmptyState.tsx — the shared elegant empty state of the platform (the spec
 * §8.5 rule: the app glyph on a rose wash, ONE line of truth, ONE real
 * action — never a dry "nothing here", never a fake frame). The shell owns
 * it so every page answers absence the same way; the icon is the caller's
 * lucide glyph at 20px, the action a real Link or button element.
 */

import type { ComponentType, ReactNode } from "react";

export type EmptyStateProps = {
  /** the lucide glyph of the absence (20px, rose, on the wash chip) */
  icon: ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: true }>;
  /** the one-line truth of what is (not) here */
  title: string;
  /** the honest sentence — what the state is, what a real next step is */
  line: string;
  /** the real action (a Link or button the caller renders) */
  action?: ReactNode;
};

/**
 * The shared empty state.
 *
 * @param props the icon, the title, the line, the optional action.
 * @returns the empty state element.
 */
export function EmptyState({ icon: Icon, title, line, action }: EmptyStateProps) {
  return (
    <div className="empty reveal" role="status">
      <span aria-hidden="true" className="empty__icon">
        <Icon size={20} strokeWidth={1.7} aria-hidden={true} />
      </span>
      <p className="empty__title">{title}</p>
      <p className="empty__line">{line}</p>
      {action ? (
        <div className="btn-row-tight" style={{ marginTop: 6, justifyContent: "center" }}>
          {action}
        </div>
      ) : null}
    </div>
  );
}

export default EmptyState;
