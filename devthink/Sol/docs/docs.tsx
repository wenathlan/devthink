/**
 * docs page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — documentation surface ported from the static site; the module table renders from the DB layer. */
import { BookOpen, ShieldCheck, Server, TerminalSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ShellChrome } from "@/shell/ShellChrome";
import { coreModuleTable, type CoreModule } from "../../catalog";

const endpoints = ["GET /health", "GET /models", "POST /chat"];

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
const eyebrowStyle = {
  margin: 0,
  color: "var(--dt-muted)",
  font: "500 10px var(--dt-mono)",
  letterSpacing: ".22em",
  textTransform: "uppercase",
} as const;
const titleStyle = { margin: 0, fontSize: 30, lineHeight: 1.15, letterSpacing: "-.02em" } as const;
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
  font: "500 10px var(--dt-mono)",
  letterSpacing: ".08em",
  textDecoration: "none",
  cursor: "pointer",
  transition: "color 160ms var(--dt-ease), background 160ms var(--dt-ease), border-color 160ms var(--dt-ease)",
} as const;

export default function Docs() {
  const [modules, setModules] = useState<CoreModule[]>([]);

  useEffect(() => {
    void coreModuleTable().then(setModules);
  }, []);

  return (
    <main className="control-page">
      <ShellChrome />
      <div className="page-container" style={containerStyle}>
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
            <Link href="/console" style={actionLinkStyle}>
              open the cli console
            </Link>
          </div>
        </header>

        <section className="control-note" style={{ display: "grid", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>
            <BookOpen size={15} style={{ display: "inline", verticalAlign: "-2px", marginRight: 7 }} />
            quickstart
          </h2>
          <p style={{ margin: 0 }}>Install the CLI globally, initialize the workspace and open the help.</p>
          <pre className="control-code">
            <code>{"npm install --global @wenathlan/devthink\ndevthink init\ndevthink --help"}</code>
          </pre>
          <p style={{ margin: 0 }}>
            The CLI keeps non-secret preferences in <code>devthink.json</code> and user-provided official credentials in
            a separate <code>auth.json</code> file.
          </p>
        </section>

        <section className="control-note" style={{ display: "grid", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>
            <ShieldCheck size={15} style={{ display: "inline", verticalAlign: "-2px", marginRight: 7 }} />
            product boundary
          </h2>
          <p style={{ margin: 0 }}>
            DevThink is a provider-neutral development CLI with a polished terminal interface, explicit configuration,
            local session and memory persistence, streaming responses, a small plugin contract and a loopback HTTP API.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: "var(--dt-text)" }}>Security boundary:</strong> official provider APIs and
            credentials supplied explicitly by the user. No browser cookie capture, no CAPTCHA bypass, no undocumented
            endpoints.
          </p>
        </section>

        <section className="control-note" style={{ display: "grid", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>core modules</h2>
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

        <section className="control-note" style={{ display: "grid", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>
            <Server size={15} style={{ display: "inline", verticalAlign: "-2px", marginRight: 7 }} />
            http server
          </h2>
          <p style={{ margin: 0 }}>
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
        </section>
      </div>

      <footer className="control-page__footer">
        <TerminalSquare size={14} aria-hidden="true" />
        provider credentials stay in <code>~/.config/devthink/auth.json</code>
      </footer>
    </main>
  );
}
