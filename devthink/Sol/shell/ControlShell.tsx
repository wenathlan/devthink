// the devthink control shell of the workbench.
/** Style: DevThink Shell OS — focused management pages sharing the ONE
 * chrome of the theme (Sol/shell/ShellChrome.tsx: the floating top navbar
 * with the Start menu) above the .pagehead hero and the .page-container
 * body of the campaign contract. The hero renders the contract classes
 * (pagehead__eyebrow / __title / __lede / __actions) over a hairline rule —
 * no second topbar and no hand-rolled hero markup. The props API stays
 * eyebrow / title / summary / children (plus an optional actions row) so
 * every consuming page keeps compiling untouched. The stage mounts the one
 * solar light source and the C1 atmosphere hooks (atmos / grain / halftone);
 * the body rises once, staggered behind the hero, then holds still. */

import { TerminalSquare } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  pagecontainerStyle,
  pageheadActionsStyle,
  pageheadEyebrowStyle,
  pageheadLedeStyle,
  pageheadStyle,
  pageheadTitleStyle,
  pagestageStyle,
  stagedEntrance,
} from "./InstitutionalChrome.tsx";
import { ShellChrome } from "./ShellChrome.tsx";
import { useReducedMotion } from "./trayflyouts.tsx";

type ControlShellProps = {
  eyebrow: string;
  title: string;
  summary: string;
  /** optional right-aligned action row inside the pagehead */
  actions?: ReactNode;
  children: ReactNode;
};

/* the body rhythm of the management pages: one grid under the hero rule;
 * tabular numerals inherit into every ledger the pages render — painted as
 * Tailwind composition on the tokens (task 3-a) */
const controlBodyClass = "grid min-h-[45dvh] content-start gap-[18px] pt-[26px] pb-14 tabular-nums";

/** the flattened status strip the management pages share: a bottom hairline,
 * not another card box. Pages import it instead of hand-rolling chrome. */
export const controlStripStyle: CSSProperties = {
  background: "transparent",
  border: 0,
  borderBottom: "1px solid var(--dt-edge)",
  borderRadius: 0,
  padding: "0 0 12px",
};

export function ControlShell({ eyebrow, title, summary, actions, children }: ControlShellProps) {
  const reduced = useReducedMotion();
  return (
    <main className="control-page atmos grain halftone" style={pagestageStyle}>
      <ShellChrome />
      <div className="page-container" style={pagecontainerStyle}>
        <header className="pagehead" style={pageheadStyle}>
          <p className="pagehead__eyebrow" style={{ ...pageheadEyebrowStyle, ...stagedEntrance(reduced, 0) }}>
            {eyebrow}
          </p>
          <h1 className="pagehead__title" style={{ ...pageheadTitleStyle, ...stagedEntrance(reduced, 60) }}>
            {title}
          </h1>
          <p className="pagehead__lede" style={{ ...pageheadLedeStyle, ...stagedEntrance(reduced, 120) }}>
            {summary}
          </p>
          {actions ? (
            <div className="pagehead__actions" style={{ ...pageheadActionsStyle, ...stagedEntrance(reduced, 180) }}>
              {actions}
            </div>
          ) : null}
        </header>
        <section className={controlBodyClass} style={stagedEntrance(reduced, 220)}>
          {children}
        </section>
      </div>
      <footer className="control-page__footer">
        <TerminalSquare size={14} strokeWidth={1.5} />
        provider credentials stay in <code>~/.config/devthink/auth.json</code>
      </footer>
    </main>
  );
}
