/**
 * routes page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — route index makes shared IDs and gateway
 * operations observable without exposing internal credentials. C1 layout:
 * the route map is the dominant object — one ruled ledger, mutating methods
 * marked in the solar accent — and the support rail carries the health
 * beacon and the session note. */
import { CheckCircle2, CircleDashed, Network } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import { ControlShell, controlStripStyle } from "@/shell/ControlShell";
import { gatewayJson, gatewayReady } from "../../gateway.js";

const routes = [
  ["GET", "/health", "gateway availability"],
  ["GET", "/identity", "same local person and device"],
  ["PUT", "/identity", "set public local user ID"],
  ["GET", "/settings", "safe shared settings summary"],
  ["GET", "/providers", "provider registry"],
  ["GET", "/workspaces", "local project index"],
  ["GET", "/usage", "local record counts"],
  ["GET", "/preferences", "shared workbench preferences"],
  ["PATCH", "/preferences", "update shared workbench preferences"],
  ["POST", "/sessions", "new shared session"],
  ["POST", "/chat", "stream and persist chat"],
];

/* the two-zone rhythm: dominant route map + support rail */
const zoneStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 24,
  alignItems: "flex-start",
  fontVariantNumeric: "tabular-nums",
};
const mainStyle: CSSProperties = { flex: "3 1 520px", minWidth: 0 };
const railStyle: CSSProperties = {
  flex: "1 1 264px",
  minWidth: 0,
  maxWidth: 340,
  display: "grid",
  gap: 16,
  alignContent: "start",
};
const ledgerLabelStyle: CSSProperties = {
  margin: 0,
  padding: "0 2px 10px",
  color: "var(--dt-faint)",
  font: "600 10px var(--dt-mono)",
  letterSpacing: ".08em",
};
const ledgerStyle: CSSProperties = { borderTop: "1px solid var(--dt-edge)" };
const rowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "58px minmax(0, 1fr)",
  gap: "3px 14px",
  alignItems: "center",
  padding: "11px 2px",
  borderBottom: "1px solid var(--dt-edge)",
};
const methodBaseStyle: CSSProperties = {
  gridRow: "1",
  color: "var(--dt-faint)",
  font: "600 10px var(--dt-mono)",
  letterSpacing: ".08em",
};
const pathStyle: CSSProperties = {
  gridColumn: "2",
  gridRow: "1",
  font: "500 12px var(--dt-mono)",
  color: "var(--dt-text)",
  overflowWrap: "anywhere",
};
const describeStyle: CSSProperties = {
  gridColumn: "2",
  gridRow: "2",
  font: "400 11px/1.5 var(--dt-sans)",
  color: "var(--dt-muted)",
};
const statusCardStyle: CSSProperties = {
  justifyContent: "flex-start",
  background: "rgb(255 255 255 / 3%)",
  border: "1px solid var(--dt-edge)",
  borderRadius: 8,
  font: "500 11px var(--dt-mono)",
};
const railNoteStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  background: "transparent",
  border: 0,
  borderTop: "1px solid var(--dt-edge)",
  borderRadius: 0,
  padding: "12px 2px 0",
  color: "var(--dt-faint)",
  font: "400 11px/1.7 var(--dt-mono)",
};

export default function Routes() {
  const [healthy, setHealthy] = useState<boolean>();
  const paired = gatewayReady();
  useEffect(() => {
    if (!paired) return;
    void gatewayJson<{ status: string }>("/health")
      .then((result) => setHealthy(result.status === "ok"))
      .catch(() => setHealthy(false));
  }, [paired]);
  return (
    <ControlShell
      eyebrow="gateway route map"
      title="Routes share compact local IDs."
      summary="Workspace, session, tab and message IDs are created by the CLI and preserved in browser URLs."
    >
      <div className="control-toolbar" style={controlStripStyle}>
        <span>{paired ? "paired gateway" : "browser-local"}</span>
        <span>{routes.length} routes on the shared id grammar</span>
      </div>
      <div style={zoneStyle}>
        <div style={mainStyle}>
          <p style={ledgerLabelStyle}>route ledger</p>
          <div style={ledgerStyle}>
            {routes.map(([method, path, description]) => {
              const mutation = method !== "GET";
              return (
                <article key={path} style={rowStyle}>
                  <code style={{ ...methodBaseStyle, ...(mutation ? { color: "var(--sol-sun)" } : {}) }}>{method}</code>
                  <strong style={pathStyle}>{path}</strong>
                  <span style={describeStyle}>{description}</span>
                </article>
              );
            })}
          </div>
        </div>
        <aside style={railStyle} aria-label="Gateway health">
          <div
            className={`route-status route-status--${healthy ? "ready" : "idle"}`}
            style={{ ...statusCardStyle, ...(healthy ? { color: "var(--sol-sun)" } : {}) }}
          >
            {healthy ? <CheckCircle2 size={16} /> : <CircleDashed size={16} />}
            <span>{healthy ? "gateway reachable" : paired ? "gateway unavailable" : "pair cli to probe routes"}</span>
          </div>
          <div className="control-note" style={railNoteStyle}>
            <Network size={16} />
            <p style={{ margin: 0 }}>
              Browser calls use the temporary pairing session. Provider credentials and database administration are not
              part of these routes.
            </p>
          </div>
        </aside>
      </div>
    </ControlShell>
  );
}
