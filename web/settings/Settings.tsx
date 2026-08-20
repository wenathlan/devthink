/** Design: DevThink v1.1.15 — Settings is the browser surface for the same local identity and preference commands offered by CLI and Ink. */
import { Database, Link2, MonitorCog, ShieldCheck, Unplug } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ControlShell } from "@/control.shell";
import { gatewayJson, gatewayReady, gatewayUrl } from "@/gateway";

type SettingsSnapshot = {
  identity: { userId: string; deviceId: string };
  pairing: { activeSessions: number };
  preferences: { theme: "dark" | "light"; railMode: "always" | "auto" | "off"; interfaceZoom: string };
  provider: { activeProvider?: string; activeModel?: string };
  database: { ownerUserId: string; local: boolean; persistence: string; workspaces: number; sessions: number };
};

export default function Settings() {
  const [snapshot, setSnapshot] = useState<SettingsSnapshot>();
  const [publicId, setPublicId] = useState("");
  const paired = gatewayReady();
  const baseUrl = useMemo(() => gatewayUrl(), []);

  function refresh() {
    if (!paired) return;
    void gatewayJson<SettingsSnapshot>("/settings").then((next) => { setSnapshot(next); setPublicId(next.identity.userId); }).catch(() => setSnapshot(undefined));
  }

  useEffect(refresh, [paired]);

  async function saveIdentity() {
    const response = await gatewayJson<{ identity: SettingsSnapshot["identity"] }>("/identity", { method: "PUT", body: JSON.stringify({ userId: publicId }) });
    setSnapshot((current) => current ? { ...current, identity: response.identity, database: { ...current.database, ownerUserId: response.identity.userId } } : current);
  }

  async function savePreference(key: keyof SettingsSnapshot["preferences"], value: string) {
    await gatewayJson("/preferences", { method: "PATCH", body: JSON.stringify({ key, value }) });
    setSnapshot((current) => current ? { ...current, preferences: { ...current.preferences, [key]: value } } : current);
  }

  async function revoke() {
    await gatewayJson("/pairings/revoke", { method: "POST" });
    window.sessionStorage.removeItem("devthink.pair.token");
    window.sessionStorage.removeItem("devthink.pair.user");
    window.sessionStorage.removeItem("devthink.pair.expires");
    window.location.assign("./");
  }

  if (!paired) return <ControlShell eyebrow="shared settings" title="Pair the local CLI to open Settings." summary="Settings belongs to the same local person as the CLI. Create a short-lived invitation with the command below; credentials and database files remain on this computer."><div className="control-empty"><Link2 size={22} /><h2>Local gateway not paired</h2><p><code>devthink pair create</code></p><small>Then open the generated link or return to Home and use manual pairing. The browser never receives provider credentials or a database password.</small></div></ControlShell>;

  return <ControlShell eyebrow="shared settings" title="One person, one local DevThink database." summary="These controls match `devthink config settings`, `devthink identity --id` and the Ink Settings view. The paired browser is a temporary client of the same CLI-owned database."><div className="control-toolbar"><span>{baseUrl || "paired local gateway"}</span><button onClick={refresh}><MonitorCog size={14} />refresh</button></div>{snapshot ? <div className="settings-grid"><section><ShieldCheck size={18} /><span>public identity</span><strong>{snapshot.identity.userId}</strong><small>device {snapshot.identity.deviceId}</small><label>public id<input value={publicId} onChange={(event) => setPublicId(event.target.value.toLowerCase())} minLength={10} maxLength={15} pattern="[a-z][a-z0-9]{9,14}" autoComplete="username" /></label><button onClick={() => void saveIdentity()}>save public id</button></section><section><MonitorCog size={18} /><span>workbench flags</span><label>theme<select value={snapshot.preferences.theme} onChange={(event) => void savePreference("theme", event.target.value)}><option value="dark">dark</option><option value="light">light</option></select></label><label>rail mode<select value={snapshot.preferences.railMode} onChange={(event) => void savePreference("railMode", event.target.value)}><option value="always">always</option><option value="auto">auto</option><option value="off">off</option></select></label><label>interface zoom<select value={snapshot.preferences.interfaceZoom} onChange={(event) => void savePreference("interfaceZoom", event.target.value)}>{["80", "90", "100", "110", "120", "130", "140", "150"].map((value) => <option key={value} value={value}>{value}%</option>)}</select></label></section><section><Database size={18} /><span>local data ownership</span><strong>{snapshot.database.persistence}</strong><small>owner {snapshot.database.ownerUserId}</small><small>{snapshot.database.workspaces} workspaces · {snapshot.database.sessions} sessions · {snapshot.pairing.activeSessions} browser sessions</small><small>provider {snapshot.provider.activeProvider || "not configured"} · {snapshot.provider.activeModel || "model not configured"}</small></section><section><Unplug size={18} /><span>temporary browser access</span><p>Revoking removes paired browser sessions. CLI data, provider credentials and the local database stay on this device.</p><button onClick={() => void revoke()}><Unplug size={14} />revoke browser access</button></section></div> : <div className="control-empty"><MonitorCog size={22} /><h2>Settings unavailable</h2><p>The paired gateway did not return its local settings summary.</p></div>}</ControlShell>;
}
