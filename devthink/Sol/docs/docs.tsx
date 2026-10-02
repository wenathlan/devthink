/**
 * docs page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — documentation surface ported from the static site; the module table renders from the DB layer. */
import { BookOpen, ShieldCheck, Server } from "lucide-react";
import { useEffect, useState } from "react";
import { ControlShell } from "@/shell/ControlShell";
import { coreModuleTable, type CoreModule } from "../../catalog";

const endpoints = ["GET /health", "GET /models", "POST /chat"];

export default function Docs() {
  const [modules, setModules] = useState<CoreModule[]>([]);

  useEffect(() => {
    void coreModuleTable().then(setModules);
  }, []);

  return (
    <ControlShell
      eyebrow="documentation"
      title="Docs"
      summary="DevThink documentation: quickstart, architecture modules, provider contract and the security boundary."
    >
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
          <strong style={{ color: "var(--dt-text)" }}>Security boundary:</strong> official provider APIs and credentials
          supplied explicitly by the user. No browser cookie capture, no CAPTCHA bypass, no undocumented endpoints.
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
    </ControlShell>
  );
}
