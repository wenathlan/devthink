/** Style: DevThink Terminal Atelier — local usage page reports only durable counts from the paired CLI, never provider billing claims. */
import { Activity, BarChart3, Database, MessageSquare, PanelsTopLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ControlShell } from "@/app/control.shell";
import { gatewayJson, gatewayReady } from "@/gateway";

type Usage = { workspaces: number; sessions: number; tabs: number; messages: number; providers: number; paired: boolean };

export default function Usage() {
  const [usage, setUsage] = useState<Usage>();
  const paired = gatewayReady();
  useEffect(() => { if (!paired) return; void gatewayJson<Usage>("/usage").then(setUsage).catch(() => toast("Usage is unavailable while the local gateway is offline.")); }, [paired]);
  const metrics = usage ? [{ label: "projects", value: usage.workspaces, icon: Database }, { label: "sessions", value: usage.sessions, icon: PanelsTopLeft }, { label: "tabs", value: usage.tabs, icon: Activity }, { label: "messages", value: usage.messages, icon: MessageSquare }] : [];
  return <ControlShell eyebrow="local activity ledger" title="Usage that remains on this device." summary="These are local record counts from the paired CLI. Provider billing and API keys are not read by this page.">{metrics.length ? <div className="usage-grid">{metrics.map(({ label, value, icon: Icon }) => <article key={label}><Icon size={18} /><span>{label}</span><strong>{value}</strong></article>)}</div> : <div className="control-empty"><BarChart3 size={22} /><h2>Pair the local CLI to read usage</h2><p>The workbench will show workspace, session, tab and message counts after a one-time local pairing.</p></div>}</ControlShell>;
}
