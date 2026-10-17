/**
 * routes page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page: it imports
 * the loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) and the window
 * registry (Sol/windowregistry.tsx) consume this file.
 *
 * Routes — the gateway route map in the Windows 11 grammar: a nav pane
 * beside the content deck, the routes as hairline rows with the method
 * chip, the mono path and the real health probe on the beacon row.
 * Workspace, session, tab and message ids are created by the cli and
 * preserved in browser urls. The old editorial split is retired — this body
 * rides the dtw kit.
 */
import { useEffect, useState } from "react";
import { ShellChrome } from "@/shell/ShellChrome";
import { gatewayJson, gatewayReady } from "../../gateway.js";
import { RouteRows } from "./routerows.tsx";

const routes = [
  ["GET", "/health", "gateway availability"],
  ["GET", "/identity", "same local person and device"],
  ["PUT", "/identity", "set public local user id"],
  ["GET", "/settings", "safe shared settings summary"],
  ["GET", "/providers", "provider registry"],
  ["GET", "/workspaces", "local project index"],
  ["GET", "/usage", "local record counts"],
  ["GET", "/preferences", "shared workbench preferences"],
  ["PATCH", "/preferences", "update shared workbench preferences"],
  ["POST", "/sessions", "new shared session"],
  ["POST", "/chat", "stream and persist chat"],
] as const;

/** The routes app: the Windows body when embedded (the desktop window hosts
 * it without the shell), the full surface with the taskbar on the route. */
export default function Routes({ embedded }: { embedded?: boolean }) {
  const [healthy, setHealthy] = useState<boolean>();
  const paired = gatewayReady();

  useEffect(() => {
    if (!paired) return;
    void gatewayJson<{ status: string }>("/health")
      .then((result) => setHealthy(result.status === "ok"))
      .catch(() => setHealthy(false));
  }, [paired]);

  return (
    <main className="dtw-app dtw-routes" style={embedded ? { height: "100%", overflow: "auto" } : undefined}>
      {!embedded && <ShellChrome />}
      <div className="dtw-pane">
        <nav className="dtw-nav" aria-label="Routes sections">
          <span className="dtw-navrow" data-active="true">
            Route map
            <span className="dtw-navrow__count">{routes.length}</span>
          </span>
        </nav>
        <div className="dtw-content">
          <h1 className="dtw-title">Routes</h1>
          <p className="dtw-note">
            <span aria-live="polite">
              <i className="dtw-routes__dot" data-on={healthy ? "true" : "false"} aria-hidden="true" />
              {healthy === undefined
                ? paired
                  ? "Probing gateway"
                  : "Pair the cli to probe"
                : healthy
                  ? "Gateway reachable"
                  : paired
                    ? "Gateway unavailable"
                    : "Pair the cli to probe"}
            </span>
            <span>Browser calls ride the pairing session</span>
          </p>
          <RouteRows rows={routes} healthy={healthy} paired={paired} />
        </div>
      </div>
    </main>
  );
}
