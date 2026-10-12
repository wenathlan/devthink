/**
 * routes page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — campaign v3 r2-c: the operational
 * ledger. The route map is the dominant object of a 1.6fr/1fr editorial
 * split: one ruled ledger (a hairline per route, no card boxes), the HTTP
 * method as a mono kbd chip (mutating methods picked out in the one signal
 * color), the path in mono 600 and the description as the row's meta line.
 * The /health route leads as the ONE raised featured row and carries the
 * live pulse dot of the real gateway probe; the support rail keeps the
 * health beacon and the pairing note. One accent (#ff5f00), one light, the
 * one orchestrated shell entrance. */
import { Network } from "lucide-react";
import { useEffect, useState } from "react";
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
      <div className="r2c-split">
        <div className="r2c-main">
          <p className="r2c-colhead">route ledger</p>
          <div className="r2c-ledger">
            {routes.map(([method, path, description]) => {
              const mutation = method !== "GET";
              const beacon = path === "/health";
              return (
                <article key={path} className={`r2c-row${beacon ? " is-featured" : ""}`}>
                  <kbd className="r2c-kbd r2c-chipmethod" data-mut={mutation ? "true" : "false"}>
                    {method}
                  </kbd>
                  <div className="r2c-row__main">
                    <strong className="r2c-row__name r2c-row__name--mono">{path}</strong>
                    <span className="r2c-row__meta">{description}</span>
                  </div>
                  {beacon ? (
                    <span className="r2c-state">
                      <span
                        className={`r2c-dot${healthy ? " live-dot" : ""}`}
                        data-on={healthy ? "true" : "false"}
                        aria-hidden="true"
                      />
                      {healthy === undefined ? "probing" : healthy ? "reachable" : paired ? "unreachable" : "unpaired"}
                    </span>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
        <aside className="r2c-rail" aria-label="Gateway health">
          <div className="r2c-railfig">
            <span className="r2c-figlabel">gateway health</span>
            <span className="r2c-state">
              <span
                className={`r2c-dot${healthy ? " live-dot" : ""}`}
                data-on={healthy ? "true" : "false"}
                aria-hidden="true"
              />
              {healthy ? "gateway reachable" : paired ? "gateway unavailable" : "pair cli to probe routes"}
            </span>
          </div>
          <div className="r2c-note r2c-note--icon">
            <Network size={16} aria-hidden="true" />
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
