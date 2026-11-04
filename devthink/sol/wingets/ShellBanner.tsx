/**
 * banner.tsx — the alert banner of the family (the universal set): the
 * honest message strip that carries the tone of the verdict, the one line
 * of truth and the optional action. the tone paints the left edge, the
 * text rides the props, never a hardcoded string, and the banner answers
 * the empty state law: it teaches the next action instead of declaring
 * absence.
 */

import type { ReactNode } from "react";

export type BannerTone = "neutral" | "ok" | "warn" | "err" | "info";

export type BannerProps = {
  /** the tone of the verdict */
  tone?: BannerTone;
  /** the one line headline of the state */
  title: string;
  /** the honest sentence under the headline */
  line?: string;
  /** the real action the caller renders */
  action?: ReactNode;
  /** the accessible verdict role */
  role?: "status" | "alert";
};

/**
 * The alert banner.
 *
 * @param props the tone, the title, the line, the action and the role.
 * @returns the banner element.
 */
export function Banner({ tone = "neutral", title, line, action, role = "status" }: BannerProps) {
  return (
    <div className="banner" data-tone={tone} role={role}>
      <div style={{ minWidth: 0 }}>
        <p className="banner__title">{title}</p>
        {line ? <p className="banner__line">{line}</p> : null}
      </div>
      {action ? <div className="banner__action">{action}</div> : null}
    </div>
  );
}

export default Banner;
