// the devthink control shell of the workbench.
/** Style: DevThink Shell OS — focused management pages sharing the ONE
 * chrome of the theme (Sol/shell/ShellChrome.tsx: the floating top navbar
 * with the Start menu) above the page hero and body. */
import { TerminalSquare } from "lucide-react";
import { ShellChrome } from "./ShellChrome";

type ControlShellProps = { eyebrow: string; title: string; summary: string; children: React.ReactNode };

export function ControlShell({ eyebrow, title, summary, children }: ControlShellProps) {
  return (
    <main className="control-page">
      <ShellChrome />
      <section className="control-page__hero">
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{summary}</span>
      </section>
      <section className="control-page__body">{children}</section>
      <footer className="control-page__footer">
        <TerminalSquare size={14} />
        provider credentials stay in <code>~/.config/devthink/auth.json</code>
      </footer>
    </main>
  );
}
