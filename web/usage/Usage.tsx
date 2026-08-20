/** Style: DevThink Terminal Atelier — local usage page reports only durable counts from the paired CLI, never provider billing claims. */
import { Activity, BarChart3, Database, MessageSquare, PanelsTopLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ControlShell } from "@/control.shell";
import { browserStoreSummary } from "@/db";
import { gatewayJson, gatewayReady } from "@/gateway";

type Usage = { workspaces: number; sessions: number; tabs: number; messages: number; providers: number; paired: boolean };

export default function Usage() {
  const [usage, setUsage] = useState<Usage>();
  const paired = gatewayReady();
  useEffect(() => {
    const localUsage = () => browserStoreSummary(paired).then((summary) => setUsage({ workspaces: summary.workspaces, sessions: summary.sessions, tabs: summary.tabs, messages: summary.messages, providers: 0, paired }));
    if (!paired) { void localUsage(); return; }
    void gatewayJson<Usage>("/usage").then(setUsage).catch(() => { void localUsage(); toast("Usage is unavailable from the local gateway; browser-local counts are shown."); });
  }, [paired]);
  const metrics = usage ? [{ label: "projects", value: usage.workspaces, icon: Database }, { label: "sessions", value: usage.sessions, icon: PanelsTopLeft }, { label: "tabs", value: usage.tabs, icon: Activity }, { label: "messages", value: usage.messages, icon: MessageSquare }] : [];
  return <ControlShell eyebrow="local activity ledger" title="Usage that remains on this device." summary="These are counts from the paired CLI when available, otherwise from this browser's IndexedDB cache. Provider billing and API keys are not read by this page.">{metrics.length ? <div className="usage-grid">{metrics.map(({ label, value, icon: Icon }) => <article key={label}><Icon size={18} /><span>{label}</span><strong>{value}</strong></article>)}</div> : <div className="control-empty"><BarChart3 size={22} /><h2>Preparing local usage</h2><p>Open a browser-local workspace or pair the CLI to populate the non-sensitive activity ledger.</p></div>}</ControlShell>;
}
