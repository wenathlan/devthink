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

/** Style: DevThink Terminal Atelier — campaign v3 r2-c: the settings craft
 * deck. A sectioned rail (the categories, 240px mono lowercase, sticky)
 * leads into a 1fr body of numbered sections separated by air + hairlines —
 * no nested boxes anywhere. The theme rides a real spring switch
 * (cubic-bezier(.2,1.2,.4,1) 300ms), the interface zoom a ring-glow range,
 * the automation toggles the same switch grammar, and every save affordance
 * carries the .press voice. One accent (#ff5f00 at the 90/10 discipline),
 * one light, the one orchestrated shell entrance. */
import { MonitorCog, Unplug } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ControlShell, controlStripStyle } from "@/shell/ControlShell";
import {
  type BrowserStoreSummary,
  browserIdentity,
  browserStoreSummary,
  readBrowserPreferences,
  saveBrowserPreference,
} from "../../db";
import { gatewayJson, gatewayReady, gatewayUrl } from "../../gateway.js";
import { AutomationMcp } from "./automationmcp.tsx";
import { GatewayCard } from "./gatewaycard.tsx";

export * from "./automationmcp.tsx";
export * from "./gatewaycard.tsx";
export * from "./pairing.tsx";

type SettingsSnapshot = {
  identity: { userId: string; deviceId: string };
  pairing: { activeSessions: number };
  preferences: { theme: "dark" | "light"; railMode: "always" | "auto" | "off"; interfaceZoom: string };
  provider: { activeProvider?: string; activeModel?: string };
  database: { ownerUserId: string; local: boolean; persistence: string; workspaces: number; sessions: number };
};

/** the numbered head of a deck section: mono index + lowercase eyebrow +
 * one display title — the section grammar of the whole batch. */
function sectionHead(index: string, eyebrow: string, title: string) {
  return (
    <header className="r2c-sec__head">
      <span className="r2c-sec__index" aria-hidden="true">
        {index}
      </span>
      <div style={{ minWidth: 0 }}>
        <p className="r2c-sec__eyebrow">{eyebrow}</p>
        <h2 className="r2c-sec__title">{title}</h2>
      </div>
    </header>
  );
}

/** one mono label/value line of the sync + identity sections. */
function kv(key: string, value: string) {
  return (
    <div className="r2c-kv" key={key}>
      <span className="r2c-kv__k">{key}</span>
      <span className="r2c-kv__v">{value}</span>
    </div>
  );
}

/** the sectioned rail: the categories of the deck (mono lowercase, sticky). */
function deckRail(categories: ReadonlyArray<readonly [string, string]>) {
  return (
    <nav className="r2c-deck__rail" aria-label="Settings sections">
      <span className="r2c-deck__cap">settings</span>
      {categories.map(([href, label]) => (
        <a key={href} className="r2c-deck__cat" href={href}>
          <span className="r2c-toc__num" aria-hidden="true">
            ·
          </span>
          {label}
        </a>
      ))}
    </nav>
  );
}

function flagsFields(
  preferences: SettingsSnapshot["preferences"],
  save: (key: keyof SettingsSnapshot["preferences"], value: string) => void,
) {
  const dark = preferences.theme === "dark";
  return (
    <>
      <div className="r2c-fieldlabel">
        theme
        <label className="r2c-switchrow">
          <input
            type="checkbox"
            className="r2c-switch"
            checked={dark}
            onChange={(event) => save("theme", event.target.checked ? "dark" : "light")}
            aria-label="dark theme"
          />
          <span className="r2c-switch__track" aria-hidden="true">
            <span className="r2c-switch__thumb" />
          </span>
          {dark ? "dark" : "light"}
        </label>
      </div>
      <label className="r2c-fieldlabel">
        rail mode
        <select
          className="r2c-select"
          value={preferences.railMode}
          onChange={(event) => save("railMode", event.target.value)}
        >
          <option value="always">always</option>
          <option value="auto">auto</option>
          <option value="off">off</option>
        </select>
      </label>
      <label className="r2c-fieldlabel">
        interface zoom
        <span className="r2c-rangezone">
          <input
            type="range"
            className="r2c-range"
            min={80}
            max={150}
            step={10}
            value={Number(preferences.interfaceZoom) || 100}
            onChange={(event) => save("interfaceZoom", event.target.value)}
            aria-label="interface zoom"
          />
          <output className="r2c-range__value">{preferences.interfaceZoom}%</output>
        </span>
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
        <div className="r2c-deck">
          {deckRail([
            ["#database", "database"],
            ["#workbench", "workbench"],
            ["#gateway", "gateway"],
            ["#sync", "sync"],
            ["#automation", "automation"],
            ["#boundary", "boundary"],
          ])}
          <div className="r2c-deck__body">
            <section id="database" className="r2c-sec">
              {sectionHead("01", "browser-local database", "Local database.")}
              {kv("database", local?.database || "devthink.db")}
              {kv("owner", localIdentity?.userId || "initializing")}
              {kv("device", localIdentity?.deviceId || "initializing")}
              {kv(
                "records",
                `${local?.workspaces || 0} workspaces · ${local?.sessions || 0} sessions · ${local?.messages || 0} messages`,
              )}
            </section>
            <section id="workbench" className="r2c-sec">
              {sectionHead("02", "browser workbench flags", "Workbench flags.")}
              <div className="r2c-sec__grid">
                {flagsFields(localPreferences, (key, value) => {
                  void savePreference(key, value);
                })}
              </div>
            </section>
            <GatewayCard />
            <section id="sync" className="r2c-sec">
              {sectionHead("04", "sync state", "Sync state.")}
              {kv("state", "local-only")}
              <p className="r2c-sec__copy">
                Pair with <code>devthink pair create</code> to use the existing CLI gateway. A cross-device remote
                adapter remains optional and is not configured in this browser.
              </p>
            </section>
            <AutomationMcp />
            <section id="boundary" className="r2c-sec">
              {sectionHead("06", "credential boundary", "Credential boundary.")}
              <p className="r2c-sec__copy">
                Provider credentials are not stored in this cache. Configure providers through the CLI, then pair this
                browser to use them.
              </p>
            </section>
          </div>
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
        <button type="button" className="r2c-btn press" onClick={refresh}>
          <MonitorCog size={14} />
          refresh
        </button>
      </div>
      {snapshot ? (
        <div className="r2c-deck">
          {deckRail([
            ["#identity", "identity"],
            ["#workbench", "workbench"],
            ["#gateway", "gateway"],
            ["#sync", "sync"],
            ["#automation", "automation"],
            ["#access", "browser access"],
          ])}
          <div className="r2c-deck__body">
            <section id="identity" className="r2c-sec">
              {sectionHead("01", "public identity", "Public identity.")}
              {kv("user id", snapshot.identity.userId)}
              {kv("device", snapshot.identity.deviceId)}
              <div className="r2c-sec__grid">
                <label className="r2c-fieldlabel">
                  public id
                  <input
                    className="r2c-input"
                    style={{ width: "min(320px, 100%)" }}
                    value={publicId}
                    onChange={(event) => setPublicId(event.target.value.toLowerCase())}
                    minLength={10}
                    maxLength={15}
                    pattern="[a-z][a-z0-9]{9,14}"
                    autoComplete="username"
                  />
                </label>
                <button type="button" className="r2c-btn r2c-btn--primary press" onClick={() => void saveIdentity()}>
                  save public id
                </button>
              </div>
            </section>
            <section id="workbench" className="r2c-sec">
              {sectionHead("02", "workbench flags", "Workbench flags.")}
              <div className="r2c-sec__grid">
                {flagsFields(snapshot.preferences, (key, value) => {
                  void savePreference(key, value);
                })}
              </div>
            </section>
            <GatewayCard />
            <section id="sync" className="r2c-sec">
              {sectionHead("04", "sync state", "Sync state.")}
              {kv("state", "paired-gateway")}
              {kv("cli", snapshot.database.persistence)}
              {kv("browser", `${local?.database || "devthink.db"} · ${local?.messages || 0} cached messages`)}
              {kv("remote adapter", "not configured")}
              {kv(
                "provider",
                `${snapshot.provider.activeProvider || "not configured"} · ${snapshot.provider.activeModel || "model not configured"}`,
              )}
            </section>
            <AutomationMcp />
            <section id="access" className="r2c-sec">
              {sectionHead("06", "temporary browser access", "Browser access.")}
              <p className="r2c-sec__copy">
                Revoking removes paired browser sessions. CLI data, provider credentials and the local database stay on
                this device.
              </p>
              <button type="button" className="r2c-btn r2c-btn--danger press" onClick={() => void revoke()}>
                <Unplug size={14} />
                revoke browser access
              </button>
            </section>
          </div>
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
