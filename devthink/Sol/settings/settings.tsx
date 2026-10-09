/**
 * settings page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file; no module outside the folder imports the folder members
 * directly (the home anchor consumes the pairing panel through this
 * surface). This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink C1 — settings is a varied-rhythm composition, not a
 * uniform card grid: the gateway card dominates its band, the flags / sync /
 * boundary cards ride shorter spans and the automation registry takes the
 * full measure. The solar light source and the atmosphere hooks ride the
 * shared control shell; cards keep the hairline chrome of the settings-grid
 * class, lowercase mono eyebrows and tabular numerals throughout. */
import { Database, Link2, MonitorCog, ShieldCheck, Unplug } from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { ControlShell, controlStripStyle } from "@/shell/ControlShell";
import {
  type BrowserStoreSummary,
  browserIdentity,
  browserStoreSummary,
  readBrowserPreferences,
  saveBrowserPreference,
} from "../../db";
import { gatewayJson, gatewayReady, gatewayUrl } from "../../gateway.js";
import { AutomationMcp } from "./automationmcp";
import { GatewayCard } from "./gatewaycard";

export * from "./automationmcp";
export * from "./gatewaycard";
export * from "./pairing";

type SettingsSnapshot = {
  identity: { userId: string; deviceId: string };
  pairing: { activeSessions: number };
  preferences: { theme: "dark" | "light"; railMode: "always" | "auto" | "off"; interfaceZoom: string };
  provider: { activeProvider?: string; activeModel?: string };
  database: { ownerUserId: string; local: boolean; persistence: string; workspaces: number; sessions: number };
};

/* the varied rhythm: explicit bands so no two adjacent cards share a span —
 * the dominant card grows 3:2 over its support, the wide registry takes the
 * full measure and the closing card stops at a 640px editorial offset. The
 * single-column override beats the class' uniform auto-fit track list. */
const rhythmStackStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: 12,
  fontVariantNumeric: "tabular-nums",
};
const bandStyle: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 12 };
const dominantStyle: CSSProperties = { flex: "3 1 400px", minWidth: 0, padding: 20, borderRadius: 8 };
const supportStyle: CSSProperties = { flex: "2 1 264px", minWidth: 0, borderRadius: 8 };
const offsetStyle: CSSProperties = { flex: "1 1 460px", minWidth: 0, maxWidth: 640, borderRadius: 8 };

const eyebrowStyle: CSSProperties = {
  color: "var(--dt-muted)",
  fontSize: 10,
  letterSpacing: ".08em",
  textTransform: "none",
};
const fieldLabelStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  color: "var(--dt-muted)",
  font: "500 10px var(--dt-mono)",
};
const fieldStyle: CSSProperties = {
  minHeight: 30,
  padding: "0 8px",
  color: "var(--dt-text)",
  background: "rgb(0 0 0 / 24%)",
  border: "1px solid var(--dt-edge)",
  borderRadius: 6,
  font: "400 11px var(--dt-mono)",
};

function flagsFields(
  preferences: SettingsSnapshot["preferences"],
  save: (key: keyof SettingsSnapshot["preferences"], value: string) => void,
) {
  return (
    <>
      <label style={fieldLabelStyle}>
        theme
        <select style={fieldStyle} value={preferences.theme} onChange={(event) => save("theme", event.target.value)}>
          <option value="dark">dark</option>
          <option value="light">light</option>
        </select>
      </label>
      <label style={fieldLabelStyle}>
        rail mode
        <select
          style={fieldStyle}
          value={preferences.railMode}
          onChange={(event) => save("railMode", event.target.value)}
        >
          <option value="always">always</option>
          <option value="auto">auto</option>
          <option value="off">off</option>
        </select>
      </label>
      <label style={fieldLabelStyle}>
        interface zoom
        <select
          style={fieldStyle}
          value={preferences.interfaceZoom}
          onChange={(event) => save("interfaceZoom", event.target.value)}
        >
          {["80", "90", "100", "110", "120", "130", "140", "150"].map((value) => (
            <option key={value} value={value}>
              {value}%
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

export default function Settings() {
  const [snapshot, setSnapshot] = useState<SettingsSnapshot>();
  const [local, setLocal] = useState<BrowserStoreSummary>();
  const [localIdentity, setLocalIdentity] = useState<{ userId: string; deviceId: string }>();
  const [localPreferences, setLocalPreferences] = useState<SettingsSnapshot["preferences"]>({
    theme: "dark",
    railMode: "auto",
    interfaceZoom: "100",
  });
  const [publicId, setPublicId] = useState("");
  const paired = gatewayReady();
  const baseUrl = useMemo(() => gatewayUrl(), []);

  function refresh() {
    void Promise.all([browserStoreSummary(paired), browserIdentity(), readBrowserPreferences()])
      .then(([summary, identity, preferences]) => {
        setLocal(summary);
        setLocalIdentity(identity);
        setLocalPreferences((current) => ({ ...current, ...preferences }));
      })
      .catch(() => undefined);
    if (!paired) return;
    void gatewayJson<SettingsSnapshot>("/settings")
      .then((next) => {
        setSnapshot(next);
        setPublicId(next.identity.userId);
      })
      .catch(() => setSnapshot(undefined));
  }

  useEffect(refresh, [paired]);

  async function saveIdentity() {
    const response = await gatewayJson<{ identity: SettingsSnapshot["identity"] }>("/identity", {
      method: "PUT",
      body: JSON.stringify({ userId: publicId }),
    });
    setSnapshot((current) =>
      current
        ? {
            ...current,
            identity: response.identity,
            database: { ...current.database, ownerUserId: response.identity.userId },
          }
        : current,
    );
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
    setSnapshot((current) =>
      current ? { ...current, preferences: { ...current.preferences, [key]: value } } : current,
    );
    refresh();
  }

  async function revoke() {
    await gatewayJson("/pairings/revoke", { method: "POST" });
    window.sessionStorage.removeItem("devthink.pair.token");
    window.sessionStorage.removeItem("devthink.pair.user");
    window.sessionStorage.removeItem("devthink.pair.expires");
    window.location.assign("./");
  }

  if (!paired)
    return (
      <ControlShell
        eyebrow="browser-local settings"
        title="This browser owns a local DevThink cache."
        summary="The browser keeps non-sensitive workspace records, tabs, messages and preferences in IndexedDB. Pairing is optional and gives the same person access to their CLI-owned local database."
      >
        <div className="settings-grid" style={rhythmStackStyle}>
          <div style={bandStyle}>
            <section style={dominantStyle}>
              <Database size={18} />
              <span style={eyebrowStyle}>browser-local database</span>
              <strong>{local?.database || "devthink.db"}</strong>
              <small>owner {localIdentity?.userId || "initializing"}</small>
              <small>device {localIdentity?.deviceId || "initializing"}</small>
              <small>
                {local?.workspaces || 0} workspaces · {local?.sessions || 0} sessions · {local?.messages || 0} messages
              </small>
            </section>
            <section style={supportStyle}>
              <MonitorCog size={18} />
              <span style={eyebrowStyle}>browser workbench flags</span>
              {flagsFields(localPreferences, (key, value) => {
                void savePreference(key, value);
              })}
            </section>
          </div>
          <div style={bandStyle}>
            <GatewayCard />
            <section style={supportStyle}>
              <Link2 size={18} />
              <span style={eyebrowStyle}>sync state</span>
              <strong>local-only</strong>
              <p>
                Pair with <code>devthink pair create</code> to use the existing CLI gateway. A cross-device remote
                adapter remains optional and is not configured in this browser.
              </p>
            </section>
          </div>
          <AutomationMcp />
          <section style={offsetStyle}>
            <ShieldCheck size={18} />
            <span style={eyebrowStyle}>credential boundary</span>
            <p>
              Provider credentials are not stored in this cache. Configure providers through the CLI, then pair this
              browser to use them.
            </p>
          </section>
        </div>
      </ControlShell>
    );

  return (
    <ControlShell
      eyebrow="shared settings"
      title="One person, two local stores."
      summary="These controls match `devthink config settings`, `devthink identity --id` and the Ink Settings view. The paired browser uses the CLI database while retaining a non-sensitive IndexedDB cache."
    >
      <div className="control-toolbar" style={controlStripStyle}>
        <span>{baseUrl || "paired local gateway"}</span>
        <button type="button" onClick={refresh}>
          <MonitorCog size={14} />
          refresh
        </button>
      </div>
      {snapshot ? (
        <div className="settings-grid" style={rhythmStackStyle}>
          <div style={bandStyle}>
            <section style={dominantStyle}>
              <ShieldCheck size={18} />
              <span style={eyebrowStyle}>public identity</span>
              <strong>{snapshot.identity.userId}</strong>
              <small>device {snapshot.identity.deviceId}</small>
              <label style={fieldLabelStyle}>
                public id
                <input
                  className="dtc-gw__input"
                  style={fieldStyle}
                  value={publicId}
                  onChange={(event) => setPublicId(event.target.value.toLowerCase())}
                  minLength={10}
                  maxLength={15}
                  pattern="[a-z][a-z0-9]{9,14}"
                  autoComplete="username"
                />
              </label>
              <button type="button" onClick={() => void saveIdentity()}>
                save public id
              </button>
            </section>
            <section style={supportStyle}>
              <MonitorCog size={18} />
              <span style={eyebrowStyle}>workbench flags</span>
              {flagsFields(snapshot.preferences, (key, value) => {
                void savePreference(key, value);
              })}
            </section>
          </div>
          <div style={bandStyle}>
            <GatewayCard />
            <section style={supportStyle}>
              <Database size={18} />
              <span style={eyebrowStyle}>sync state</span>
              <strong>paired-gateway</strong>
              <small>CLI: {snapshot.database.persistence}</small>
              <small>
                browser: {local?.database || "devthink.db"} · {local?.messages || 0} cached messages
              </small>
              <small>remote adapter: not configured</small>
              <small>
                provider {snapshot.provider.activeProvider || "not configured"} ·{" "}
                {snapshot.provider.activeModel || "model not configured"}
              </small>
            </section>
          </div>
          <AutomationMcp />
          <section style={offsetStyle}>
            <Unplug size={18} />
            <span style={eyebrowStyle}>temporary browser access</span>
            <p>
              Revoking removes paired browser sessions. CLI data, provider credentials and the local database stay on
              this device.
            </p>
            <button type="button" onClick={() => void revoke()}>
              <Unplug size={14} />
              revoke browser access
            </button>
          </section>
        </div>
      ) : (
        <div className="control-empty">
          <MonitorCog size={22} />
          <h2>Settings unavailable</h2>
          <p>The paired gateway did not return its local settings summary.</p>
        </div>
      )}
    </ControlShell>
  );
}
