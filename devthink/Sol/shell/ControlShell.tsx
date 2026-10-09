// the devthink control shell of the workbench.
/** Style: DevThink Shell OS — focused management pages sharing the ONE
 * chrome of the theme (Sol/shell/ShellChrome.tsx: the floating top navbar
 * with the Start menu) above the .pagehead hero and the .page-container
 * body of the campaign contract. The hero renders the contract classes
 * (pagehead__eyebrow / __title / __lede / __actions) — no second topbar and
 * no hand-rolled hero markup. The props API stays eyebrow / title / summary
 * / children (plus an optional actions row) so every consuming page keeps
 * compiling untouched. */

import { TerminalSquare } from "lucide-react";
import type { ReactNode } from "react";
import {
  pagecontainerStyle,
  pageheadActionsStyle,
  pageheadEyebrowStyle,
  pageheadLedeStyle,
  pageheadStyle,
  pageheadTitleStyle,
} from "./InstitutionalChrome";
import { ShellChrome } from "./ShellChrome";

type ControlShellProps = {
  eyebrow: string;
  title: string;
  summary: string;
  /** optional right-aligned action row inside the pagehead */
  actions?: ReactNode;
  children: ReactNode;
};

/* the body rhythm of the management pages: one grid under the pagehead */
const controlBodyStyle = {
  display: "grid",
  alignContent: "start",
  gap: 18,
  minHeight: "45dvh",
  padding: "26px 0 56px",
};

export function ControlShell({ eyebrow, title, summary, actions, children }: ControlShellProps) {
  return (
    <main className="control-page">
      <ShellChrome />
      <div className="page-container" style={pagecontainerStyle}>
        <header className="pagehead" style={pageheadStyle}>
          <p className="pagehead__eyebrow" style={pageheadEyebrowStyle}>
            {eyebrow}
          </p>
          <h1 className="pagehead__title" style={pageheadTitleStyle}>
            {title}
          </h1>
          <p className="pagehead__lede" style={pageheadLedeStyle}>
            {summary}
          </p>
          {actions ? (
            <div className="pagehead__actions" style={pageheadActionsStyle}>
              {actions}
            </div>
          ) : null}
        </header>
        <section style={controlBodyStyle}>{children}</section>
      </div>
      <footer className="control-page__footer">
        <TerminalSquare size={14} />
        provider credentials stay in <code>~/.config/devthink/auth.json</code>
      </footer>
    </main>
  );
}
