/** Design: DevThink v1.1.16 — Settings is the single browser surface for local IndexedDB, paired CLI data and future optional sync adapters. */
import { Database, Link2, MonitorCog, ShieldCheck, Unplug } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ControlShell } from "@/control.shell";
import { browserIdentity, browserStoreSummary, readBrowserPreferences, saveBrowserPreference, type BrowserStoreSummary } from "@/db";
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
  const [local, setLocal] = useState<BrowserStoreSummary>();
  const [localIdentity, setLocalIdentity] = useState<{ userId: string; deviceId: string }>();
  const [localPreferences, setLocalPreferences] = useState<SettingsSnapshot["preferences"]>({ theme: "dark", railMode: "auto", interfaceZoom: "100" });
  const [publicId, setPublicId] = useState("");
  const paired = gatewayReady();
  const baseUrl = useMemo(() => gatewayUrl(), []);

  function refresh() {
    void Promise.all([browserStoreSummary(paired), browserIdentity(), readBrowserPreferences()]).then(([summary, identity, preferences]) => {
      setLocal(summary);
      setLocalIdentity(identity);
      setLocalPreferences((current) => ({ ...current, ...preferences }));
    }).catch(() => undefined);
    if (!paired) return;
    void gatewayJson<SettingsSnapshot>("/settings").then((next) => { setSnapshot(next); setPublicId(next.identity.userId); }).catch(() => setSnapshot(undefined));
  }

  useEffect(refresh, [paired]);

  async function saveIdentity() {
    const response = await gatewayJson<{ identity: SettingsSnapshot["identity"] }>("/identity", { method: "PUT", body: JSON.stringify({ userId: publicId }) });
    setSnapshot((current) => current ? { ...current, identity: response.identity, database: { ...current.database, ownerUserId: response.identity.userId } } : current);
  }

  async function savePreference(key: keyof SettingsSnapshot["preferences"], value: string) {
    if (!paired) {
      await saveBrowserPreference(key, value);
      setLocalPreferences((current) => ({ ...current, [key]: value }));
      refresh();
      return;
    }
    await gatewayJson("/preferences", { method: "PATCH", body: JSON.stringify({ key, value }) });
    await saveBrowserPreference(key, value);
    setSnapshot((current) => current ? { ...current, preferences: { ...current.preferences, [key]: value } } : current);
    refresh();
  }

  async function revoke() {
    await gatewayJson("/pairings/revoke", { method: "POST" });
    window.sessionStorage.removeItem("devthink.pair.token");
    window.sessionStorage.removeItem("devthink.pair.user");
    window.sessionStorage.removeItem("devthink.pair.expires");
    window.location.assign("./");
  }

  if (!paired) return <ControlShell eyebrow="browser-local settings" title="This browser owns a local DevThink cache." summary="The browser keeps non-sensitive workspace records, tabs, messages and preferences in IndexedDB. Pairing is optional and gives the same person access to their CLI-owned local database."><div className="settings-grid"><section><Database size={18} /><span>browser-local database</span><strong>{local?.database || "devthink.db"}</strong><small>owner {localIdentity?.userId || "initializing"}</small><small>device {localIdentity?.deviceId || "initializing"}</small><small>{local?.workspaces || 0} workspaces · {local?.sessions || 0} sessions · {local?.messages || 0} messages</small></section><section><MonitorCog size={18} /><span>browser workbench flags</span><label>theme<select value={localPreferences.theme} onChange={(event) => void savePreference("theme", event.target.value)}><option value="dark">dark</option><option value="light">light</option></select></label><label>rail mode<select value={localPreferences.railMode} onChange={(event) => void savePreference("railMode", event.target.value)}><option value="always">always</option><option value="auto">auto</option><option value="off">off</option></select></label><label>interface zoom<select value={localPreferences.interfaceZoom} onChange={(event) => void savePreference("interfaceZoom", event.target.value)}>{["80", "90", "100", "110", "120", "130", "140", "150"].map((value) => <option key={value} value={value}>{value}%</option>)}</select></label></section><section><Link2 size={18} /><span>sync state</span><strong>local-only</strong><p>Pair with <code>devthink pair create</code> to use the existing CLI gateway. A cross-device remote adapter remains optional and is not configured in this browser.</p></section><section><ShieldCheck size={18} /><span>credential boundary</span><p>Provider credentials are not stored in this cache. Configure providers through the CLI, then pair this browser to use them.</p></section></div></ControlShell>;

  return <ControlShell eyebrow="shared settings" title="One person, two local stores." summary="These controls match `devthink config settings`, `devthink identity --id` and the Ink Settings view. The paired browser uses the CLI database while retaining a non-sensitive IndexedDB cache."><div className="control-toolbar"><span>{baseUrl || "paired local gateway"}</span><button onClick={refresh}><MonitorCog size={14} />refresh</button></div>{snapshot ? <div className="settings-grid"><section><ShieldCheck size={18} /><span>public identity</span><strong>{snapshot.identity.userId}</strong><small>device {snapshot.identity.deviceId}</small><label>public id<input value={publicId} onChange={(event) => setPublicId(event.target.value.toLowerCase())} minLength={10} maxLength={15} pattern="[a-z][a-z0-9]{9,14}" autoComplete="username" /></label><button onClick={() => void saveIdentity()}>save public id</button></section><section><MonitorCog size={18} /><span>workbench flags</span><label>theme<select value={snapshot.preferences.theme} onChange={(event) => void savePreference("theme", event.target.value)}><option value="dark">dark</option><option value="light">light</option></select></label><label>rail mode<select value={snapshot.preferences.railMode} onChange={(event) => void savePreference("railMode", event.target.value)}><option value="always">always</option><option value="auto">auto</option><option value="off">off</option></select></label><label>interface zoom<select value={snapshot.preferences.interfaceZoom} onChange={(event) => void savePreference("interfaceZoom", event.target.value)}>{["80", "90", "100", "110", "120", "130", "140", "150"].map((value) => <option key={value} value={value}>{value}%</option>)}</select></label></section><section><Database size={18} /><span>sync state</span><strong>paired-gateway</strong><small>CLI: {snapshot.database.persistence}</small><small>browser: {local?.database || "devthink.db"} · {local?.messages || 0} cached messages</small><small>remote adapter: not configured</small><small>provider {snapshot.provider.activeProvider || "not configured"} · {snapshot.provider.activeModel || "model not configured"}</small></section><section><Unplug size={18} /><span>temporary browser access</span><p>Revoking removes paired browser sessions. CLI data, provider credentials and the local database stay on this device.</p><button onClick={() => void revoke()}><Unplug size={14} />revoke browser access</button></section></div> : <div className="control-empty"><MonitorCog size={22} /><h2>Settings unavailable</h2><p>The paired gateway did not return its local settings summary.</p></div>}</ControlShell>;
}
