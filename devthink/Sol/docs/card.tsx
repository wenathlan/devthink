/**
 * card.tsx — the content surfaces of the docs app: the hairline section
 * card (title, rows, 8px radius) and the copyable command block with its
 * 40px header. Loose components of the docs page.
 */
import { useState } from "react";

/** DocsCard — one content card: the title bar and the body stack. */
export function DocsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">{title}</h2>
      {children}
    </section>
  );
}

/** DocsCode — the command block: the mono lines with one copy action. */
export function DocsCode({ lines }: { lines: readonly string[] }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard
      .writeText(lines.join("\n"))
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
    window.setTimeout(() => setCopied(false), 2000);
  };
  return (
    <figure className="dtw-code">
      <figcaption className="dtw-codebar">
        <span>console</span>
        <button type="button" className="dtw-codecopy" onClick={copy} aria-label="Copy commands">
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre>
        <code>{lines.join("\n")}</code>
      </pre>
    </figure>
  );
}
