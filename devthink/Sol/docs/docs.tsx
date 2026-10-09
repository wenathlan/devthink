/**
 * docs page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — documentation surface ported from the
 * static site, cut as an editorial document instead of four identical
 * boxes: numbered section heads over hairlines, quickstart as the dominant
 * opening, the product boundary prose beside the http server rail, and the
 * module table as the closing full-width band. The module table renders
 * from the DB layer. */
import { BookOpen, ShieldCheck, Server, TerminalSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ShellChrome } from "@/shell/ShellChrome";
import { coreModuleTable, type CoreModule } from "../../catalog";

const endpoints = ["GET /health", "GET /models", "POST /chat"];

/* --------------------------------------------------------------------------
 * the docs page-app stylesheet — the C1 polish pass of this folder: the
 * numbered editorial heads, the boundary/server split and the frame polish
 * (8px radii on the code instrument, lowercase table heads, tabular data).
 * Scoped to the classes only this page mounts; it lands once at import
 * time.
 * ------------------------------------------------------------------------ */
const DOCS_CSS = `
.halftone::after, .grain::before { pointer-events: none; }
.docs-section__head { display: flex; align-items: baseline; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--dt-edge); }
.docs-section__index { color: var(--dt-faint); font: 500 11px var(--font-mono, var(--dt-mono)); font-variant-numeric: tabular-nums; }
.docs-section__head h2 { display: inline-flex; align-items: center; gap: 8px; margin: 0; color: var(--dt-text); font: 600 16px/1.3 var(--font-display, var(--dt-sans)); letter-spacing: -.01em; }
.docs-split { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 28px; align-items: start; }
.docs-split > * { min-width: 0; }
.docs-rail { display: grid; gap: 12px; align-content: start; padding-left: 22px; border-left: 1px solid var(--dt-edge); }
.docs-section .control-code { border-radius: 8px; }
.docs-section .control-table th { text-transform: lowercase; letter-spacing: .08em; }
.docs-section .control-table td { font-variant-numeric: tabular-nums; }
.docs-section .control-badge { border-radius: 6px; }
.docs-action:hover { color: var(--dt-text); background: rgb(255 255 255 / 7%); border-color: var(--dt-edge-strong); }
.docs-action:active { transform: scale(.97); }
@media (max-width: 860px) {

  .docs-split { grid-template-columns: 1fr; }
  .docs-rail { padding-left: 0; padding-top: 16px; border-left: 0; border-top: 1px solid var(--dt-edge); }
}
@media (prefers-reduced-motion: reduce) {
  .docs-action { transition: none; }
}
`;

let docsCssReady = false;

/** Injects the docs stylesheet exactly once per document, at import time. */
function ensureDocsCss(): void {
  if (docsCssReady || typeof document === "undefined") return;
  docsCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-docs-pass", "");
  tag.textContent = DOCS_CSS;
  document.head.appendChild(tag);
}
ensureDocsCss();

const DISPLAY = "var(--font-display, var(--dt-sans))";
const MONO = "var(--font-mono, var(--dt-mono))";

/** the .pagehead contract floor: the 10px mono tracked eyebrow, the 30px
 * display line and the 13px muted one-sentence lede — inline so the page top
 * stands before the wave-2 stylesheet lands on the shared classes */
const containerStyle = {
  width: "100%",
  maxWidth: 1180,
  marginInline: "auto",
  padding: "24px clamp(24px, 4vw, 32px) 40px",
  display: "grid",
  alignContent: "start",
  gap: 32,
} as const;
const pageheadStyle = { display: "grid", gap: 12, padding: "32px 0 0" } as const;
const eyebrowStyle = { margin: 0, color: "var(--dt-faint)", font: `500 10px ${MONO}`, letterSpacing: ".08em" } as const;
const titleStyle = { margin: 0, font: `700 30px/1.15 ${DISPLAY}`, letterSpacing: "-.02em" } as const;
const ledeStyle = { margin: 0, maxWidth: 640, color: "var(--dt-muted)", fontSize: 13, lineHeight: 1.7 } as const;
const actionsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  alignItems: "center",
  justifyContent: "flex-end",
  marginTop: 4,
} as const;
const actionLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  minHeight: 34,
  padding: "0 14px",
  color: "var(--dt-blue)",
  background: "rgb(255 255 255 / 4%)",
  border: "1px solid var(--dt-edge)",
  borderRadius: 8,
  font: `500 10px ${MONO}`,
  letterSpacing: ".08em",
  textDecoration: "none",
  cursor: "pointer",
  transition: "color 160ms var(--dt-ease), background 160ms var(--dt-ease), border-color 160ms var(--dt-ease)",
} as const;
/** the editorial body: 13px/1.7 prose over the mono table data */
const sectionStyle = { display: "grid", gap: 14, minWidth: 0 } as const;
const proseStyle = { margin: 0, maxWidth: "62ch", fontSize: 13, lineHeight: 1.7, color: "var(--dt-muted)" } as const;
const railProseStyle = { margin: 0, fontSize: 13, lineHeight: 1.7, color: "var(--dt-muted)" } as const;

export default function Docs() {
  const [modules, setModules] = useState<CoreModule[]>([]);

  useEffect(() => {
    void coreModuleTable().then(setModules);
  }, []);

  return (
    <main className="control-page">
      <ShellChrome />
      <div className="page-container grain" style={containerStyle}>
        <header className="pagehead" style={pageheadStyle}>
          <p className="pagehead__eyebrow" style={eyebrowStyle}>
            devthink · docs
          </p>
          <h1 className="pagehead__title" style={titleStyle}>
            Docs
          </h1>
          <p className="pagehead__lede" style={ledeStyle}>
            Quickstart, architecture modules, provider contract and the security boundary of the devthink CLI.
          </p>
          <div className="pagehead__actions" style={actionsStyle}>
            <Link href="/console" className="docs-action" style={actionLinkStyle}>
              open the cli console
            </Link>
          </div>
        </header>

        <section className="docs-section halftone" style={sectionStyle}>
          <header className="docs-section__head">
            <span className="docs-section__index">01</span>
            <h2>
              <BookOpen size={15} aria-hidden="true" />
              quickstart
            </h2>
          </header>
          <p style={proseStyle}>Install the CLI globally, initialize the workspace and open the help.</p>
          <pre className="control-code">
            <code>{"npm install --global @wenathlan/devthink\ndevthink init\ndevthink --help"}</code>
          </pre>
          <p style={proseStyle}>
            The CLI keeps non-secret preferences in <code>devthink.json</code> and user-provided official credentials in
            a separate <code>auth.json</code> file.
          </p>
        </section>

        <div className="docs-split">
          <section className="docs-section" style={sectionStyle}>
            <header className="docs-section__head">
              <span className="docs-section__index">02</span>
              <h2>
                <ShieldCheck size={15} aria-hidden="true" />
                product boundary
              </h2>
            </header>
            <p style={proseStyle}>
              DevThink is a provider-neutral development CLI with a polished terminal interface, explicit
              configuration, local session and memory persistence, streaming responses, a small plugin contract and a
              loopback HTTP API.
            </p>
            <p style={proseStyle}>
              <strong style={{ color: "var(--dt-text)" }}>Security boundary:</strong> official provider APIs and
              credentials supplied explicitly by the user. No browser cookie capture, no CAPTCHA bypass, no
              undocumented endpoints.
            </p>
          </section>

          <aside className="docs-rail" aria-label="http server">
            <header className="docs-section__head">
              <span className="docs-section__index">03</span>
              <h2>
                <Server size={15} aria-hidden="true" />
                http server
              </h2>
            </header>
            <p style={railProseStyle}>
              The server binds to <code>127.0.0.1</code>; with no port provided a cryptographically random candidate is
              selected and retried when occupied.
            </p>
            <div className="control-badges">
              {endpoints.map((endpoint) => (
                <span key={endpoint} className="control-badge">
                  {endpoint}
                </span>
              ))}
            </div>
          </aside>
        </div>

        <section className="docs-section" style={sectionStyle}>
          <header className="docs-section__head">
            <span className="docs-section__index">04</span>
            <h2>core modules</h2>
          </header>
          <div style={{ overflowX: "auto" }}>
            <table className="control-table">
              <thead>
                <tr>
                  <th>module</th>
                  <th>responsibility</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => (
                  <tr key={module.name}>
                    <td>
                      <code>{module.name}</code>
                    </td>
                    <td>{module.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer className="control-page__footer">
        <TerminalSquare size={14} aria-hidden="true" />
        provider credentials stay in <code>~/.config/devthink/auth.json</code>
      </footer>
    </main>
  );
}
