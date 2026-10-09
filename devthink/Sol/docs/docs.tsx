/**
 * docs page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — documentation surface (campaign v3
 * r2-a) cut as an editorial document: ONE named light (the reading lamp over
 * the opening), mono folio rows as the section heads (index, display title,
 * page number at the right edge), quickstart as the dominant opening, the
 * product boundary prose beside the http server hairline rail, and the
 * module table as the closing band. The module table renders from the DB
 * layer. */
import { BookOpen, ShieldCheck, Server, TerminalSquare } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import { Link } from "wouter";
import { ShellChrome } from "@/shell/ShellChrome";
import { coreModuleTable, type CoreModule } from "../../catalog";

const endpoints = ["GET /health", "GET /models", "POST /chat"];

/* --------------------------------------------------------------------------
 * the docs page-app stylesheet — the r2-a editorial pass of this folder:
 * the folio section heads (mono index, display title, page number at the
 * right edge over one hairline), the 68ch prose measure, the 1.6fr/1fr
 * boundary split with the hairline server rail and the machined code/table
 * surfaces. Scoped to the classes only this page mounts; it lands once at
 * import time.
 * ------------------------------------------------------------------------ */
const DOCS_CSS = `
.halftone::after, .grain::before { pointer-events: none; }
.r2a-docs-light { background: radial-gradient(50% 46% at 12% 0%, color-mix(in srgb, var(--dtv3-signal) 12%, transparent) 0%, transparent 66%); }
.docs-section__head { display: flex; align-items: baseline; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--dtv3-hairline); }
.docs-section__index { color: var(--dtv3-ink-3); font: 500 11px var(--font-mono, var(--dt-mono)); letter-spacing: .08em; font-variant-numeric: tabular-nums; }
.docs-section__folio { margin-left: auto; color: var(--dtv3-ink-3); font: 400 9.5px var(--font-mono, var(--dt-mono)); letter-spacing: .08em; font-variant-numeric: tabular-nums; text-transform: lowercase; white-space: nowrap; }
.docs-section__head h2 { display: inline-flex; align-items: center; gap: 8px; margin: 0; color: var(--dtv3-ink-1); font: 600 17px/1.3 var(--font-display, var(--dt-sans)); letter-spacing: -.01em; }
.docs-section__head h2 svg { color: var(--dtv3-ink-3); }
.docs-split { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: clamp(28px, 4vw, 56px); align-items: start; }
.docs-split > * { min-width: 0; }
.docs-rail { display: grid; gap: 12px; align-content: start; padding-left: clamp(20px, 2.6vw, 32px); border-left: 1px solid var(--dtv3-hairline); }
.docs-section .control-code { border-radius: 10px; background: rgb(0 0 0 / 30%); border-color: var(--dtv3-hairline); box-shadow: inset 0 1px 0 rgb(255 255 255 / 4%); color: var(--dtv3-ink-2); font: 12.5px/1.75 var(--dt-mono); }
[data-theme="light"] .docs-section .control-code { background: rgb(23 25 31 / 4%); border-color: rgb(23 25 31 / 14%); box-shadow: none; }
.docs-section .control-code code { color: inherit; }
.docs-section .control-table th { color: var(--dtv3-ink-3); background: transparent; border-color: var(--dtv3-hairline); text-transform: lowercase; letter-spacing: .08em; }
.docs-section .control-table td { color: var(--dtv3-ink-2); border-color: var(--dtv3-hairline); font-variant-numeric: tabular-nums; }
.docs-section .control-table code { color: color-mix(in srgb, var(--dtv3-sig) 42%, var(--dtv3-ink-1)); }
.docs-section .control-badge { border-color: var(--dtv3-hairline); border-radius: 8px; color: var(--dtv3-ink-2); }
@media (max-width: 860px) {

  .docs-split { grid-template-columns: 1fr; }
  .docs-rail { padding-left: 0; padding-top: 16px; border-left: 0; border-top: 1px solid var(--dtv3-hairline); }
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

/** the entrance stagger of the page: one orchestrated rise through the
 * engine .enter kit, the delay reading the --i custom prop (70ms steps). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

/** the .pagehead contract floor: the mono eyebrow, the Bricolage display
 * line (2–4 words) and the one-phrase lede — inline so the page top stands
 * before the shared r2-a grammar lands on the classes */
const containerStyle = {
  width: "100%",
  maxWidth: 1180,
  marginInline: "auto",
  padding: "24px clamp(24px, 4vw, 32px) 96px",
  display: "grid",
  alignContent: "start",
  gap: 40,
} as const;
const pageheadStyle = { display: "grid", gap: 14, padding: "56px 0 0" } as const;
const titleStyle = { margin: 0, font: `700 clamp(34px, 4.6vw, 60px)/1.04 ${DISPLAY}`, letterSpacing: "-.03em" } as const;
const ledeStyle = { margin: 0, maxWidth: "52ch", color: "var(--dt-muted)", fontSize: 14, lineHeight: 1.75 } as const;
const actionsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  alignItems: "center",
  marginTop: 4,
} as const;
/** the editorial body: 14px/1.8 prose on the 68ch measure over mono data */
const sectionStyle = { display: "grid", gap: 14, minWidth: 0 } as const;
const proseStyle = { margin: 0, maxWidth: "68ch", fontSize: 14, lineHeight: 1.8, color: "var(--dt-muted)" } as const;
const railProseStyle = { margin: 0, maxWidth: "48ch", fontSize: 14, lineHeight: 1.8, color: "var(--dt-muted)" } as const;

export default function Docs() {
  const [modules, setModules] = useState<CoreModule[]>([]);

  useEffect(() => {
    void coreModuleTable().then(setModules);
  }, []);

  return (
    <main className="control-page">
      <ShellChrome />
      <div className="page-container grain shader-stage" style={containerStyle}>
        {/* the ONE named light of the page: the reading lamp over the opening */}
        <div className="shader-fallback r2a-docs-light breathe" aria-hidden="true" />
        <header className="pagehead enter" style={{ ...pageheadStyle, ...step(0) }}>
          <p className="pagehead__eyebrow r2a-eyebrow">devthink · docs</p>
          <h1 className="pagehead__title r2a-display" style={titleStyle}>
            the field manual
          </h1>
          <p className="pagehead__lede r2a-lede" style={ledeStyle}>
            Quickstart, the architecture modules, the provider contract and the security boundary of the devthink cli.
          </p>
          <div className="pagehead__actions" style={actionsStyle}>
            <Link href="/console" className="docs-action r2a-action">
              open the cli console
            </Link>
          </div>
        </header>

        <section className="docs-section enter" style={{ ...sectionStyle, ...step(1) }}>
          <header className="docs-section__head">
            <span className="docs-section__index">01</span>
            <h2>
              <BookOpen size={15} aria-hidden="true" />
              quickstart
            </h2>
            <span className="docs-section__folio">devthink · docs — 01 / 04</span>
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
          <section className="docs-section enter" style={{ ...sectionStyle, ...step(2) }}>
            <header className="docs-section__head">
              <span className="docs-section__index">02</span>
              <h2>
                <ShieldCheck size={15} aria-hidden="true" />
                product boundary
              </h2>
              <span className="docs-section__folio">devthink · docs — 02 / 04</span>
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

          <aside className="docs-rail enter" style={step(3)} aria-label="http server">
            <header className="docs-section__head">
              <span className="docs-section__index">03</span>
              <h2>
                <Server size={15} aria-hidden="true" />
                http server
              </h2>
              <span className="docs-section__folio">03 / 04</span>
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

        <section className="docs-section enter" style={{ ...sectionStyle, ...step(4) }}>
          <header className="docs-section__head">
            <span className="docs-section__index">04</span>
            <h2>core modules</h2>
            <span className="docs-section__folio">devthink · docs — 04 / 04</span>
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
