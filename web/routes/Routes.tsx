/** Style: DevThink Terminal Atelier — route index makes shared IDs and gateway operations observable without exposing internal credentials. */
import { CheckCircle2, CircleDashed, Network } from "lucide-react";
import { useEffect, useState } from "react";
import { ControlShell } from "@/app/control.shell";
import { gatewayJson, gatewayReady } from "@/gateway";

const routes = [
  ["GET", "/health", "gateway availability"], ["GET", "/providers", "provider registry"], ["GET", "/workspaces", "local project index"], ["GET", "/usage", "local record counts"], ["POST", "/sessions", "new shared session"], ["POST", "/chat", "stream and persist chat"],
];

export default function Routes() {
  const [healthy, setHealthy] = useState<boolean>();
  const paired = gatewayReady();
  useEffect(() => { if (!paired) return; void gatewayJson<{ status: string }>("/health").then((result) => setHealthy(result.status === "ok")).catch(() => setHealthy(false)); }, [paired]);
  return <ControlShell eyebrow="gateway route map" title="Routes share compact local IDs." summary="Workspace, session, tab and message IDs are created by the CLI and preserved in browser URLs."><div className={`route-status route-status--${healthy ? "ready" : "idle"}`}>{healthy ? <CheckCircle2 size={17} /> : <CircleDashed size={17} />}<span>{healthy ? "gateway reachable" : paired ? "gateway unavailable" : "pair CLI to probe routes"}</span></div><div className="route-list">{routes.map(([method, path, description]) => <article key={path}><code>{method}</code><strong>{path}</strong><span>{description}</span></article>)}</div><div className="control-note"><Network size={16} /><p>Browser calls use the temporary pairing session. Provider credentials and database administration are not part of these routes.</p></div></ControlShell>;
}
