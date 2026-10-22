/**
 * settings page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page: it imports
 * the loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) and the window
 * registry (Sol/panel/workspace.tsx) consume this file. The home anchor
 * consumes the pairing panel through this surface.
 *
 * Settings — the settings app in the Windows 11 grammar: the section rail
 * beside the content deck, one section at a time, the paired browser
 * mirroring the cli settings and the browser-local records staying local.
 * The old editorial deck (the numbered indexes, the sticky caps) is retired
 * — this body rides the dtw kit.
 */
import {ArrowSyncRegular, LocalLanguageRegular, PlugDisconnectedRegular, SettingsRegular} from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { ShellChrome } from "@/componentes/shell/ShellChrome";
import { osAppLabels } from "../../catalog";
import {
  type BrowserStoreSummary,
  browserIdentity,
  browserStoreSummary,
  readBrowserPreferences,
  saveBrowserPreference } from "../../db";
import { gatewayJson, gatewayReady } from "../../gateway.js";
import { currentlang } from "../../translategtx.ts";
import { setlanguage } from "../../translatedom.ts";
import { AutomationMcp } from "../componentes/settings/automationmcp.tsx";
import { GatewayCard } from "../componentes/settings/gatewaycard.tsx";
import { HardDrives } from "../componentes/settings/harddrives.tsx";
import { LocalAccount } from "../componentes/settings/identity.tsx";

export * from "../componentes/settings/automationmcp.tsx";
export * from "../componentes/settings/gatewaycard.tsx";
export * from "../componentes/settings/identity.tsx";
export * from "../componentes/settings/pairing.tsx";

type SettingsSnapshot = {
  identity: { userId: string; deviceId: string };
  pairing: { activeSessions: number };
  preferences: { theme: "dark" | "light"; railMode: "always" | "auto" | "off"; interfaceZoom: string };
  provider: { activeProvider?: string; activeModel?: string };
  database: { ownerUserId: string; local: boolean; persistence: string; workspaces: number; sessions: number };
};

/** the window title answers the catalog label row (bare-id fallback). */
const SETTINGS_LABEL = osAppLabels().settings;

/** the GTX language ladder: the authored surface is english and every other
 * row rides the google gtx module (translategtx.ts) with the reveal effect —
 * the names stay native per the windows grammar, so the picker itself rides
 * the notranslate wall and never becomes its own translation subject. */
const LANGUAGES: readonly { code: string; native: string }[] = [
  { code: "en", native: "English (United States)" },
  { code: "pt", native: "Português (Brasil)" },
  { code: "es", native: "Español (España)" },
  { code: "fr", native: "Français (France)" },
  { code: "de", native: "Deutsch (Deutschland)" },
  { code: "it", native: "Italiano (Italia)" },
  { code: "ja", native: "日本語 (日本)" },
  { code: "ko", native: "한국어 (대한민국)" },
  { code: "zh-CN", native: "中文 (简体，中国)" },
  { code: "ru", native: "Русский (Россия)" },
  { code: "ar", native: "العربية" },
  { code: "hi", native: "हिन्दी (भारत)" },
];

/** one mono label/value line of the settings sections. */
function kv(key: string, value: string) {
  return (
    <div className="dtw-settings__kv" key={key}>
      <span className="dtw-settings__kvkey">{key}</span>
      <span className="dtw-settings__kvvalue">{value}</span>
    </div>
  );
}

/** the workbench flags the deck answers: the theme switch, the rail mode and
 * the interface zoom, saved through the same preference machine. */
function flagsFields(
  preferences: SettingsSnapshot["preferences"],
  save: (key: keyof SettingsSnapshot["preferences"], value: string) => void,
) {
  const dark = preferences.theme === "dark";
  return (
    <>
      <div className="dtw-settings__field">
        <span>Theme</span>
        <label className="dtw-settings__switchrow">
          <input
            type="checkbox"
            className="dtw-settings__switch"
            checked={dark}
            onChange={(event) => save("theme", event.target.checked ? "dark" : "light")}
            aria-label="dark theme"
          />
          <span className="dtw-settings__switchtrack" aria-hidden="true">
            <span className="dtw-settings__switchthumb" />
          </span>
          {dark ? "Dark" : "Light"}
        </label>
      </div>
      <label className="dtw-settings__field">
        <span>Rail mode</span>
        <select
          className="dtw-settings__select"
          value={preferences.railMode}
          onChange={(event) => save("railMode", event.target.value)}
        >
          <option value="always">Always</option>
          <option value="auto">Auto</option>
          <option value="off">Off</option>
        </select>
      </label>
      <label className="dtw-settings__field">
        <span>Interface zoom</span>
        <span className="dtw-settings__rangezone">
          <input
            type="range"
            className="dtw-settings__range"
            min={80}
            max={150}
            step={10}
            value={Number(preferences.interfaceZoom) || 100}
            onChange={(event) => save("interfaceZoom", event.target.value)}
            aria-label="interface zoom"
          />
          <output className="dtw-settings__rangevalue">{preferences.interfaceZoom}%</output>
        </span>
      </label>
    </>
  );
}

/** The settings app: the Windows body when embedded (the desktop window
 * hosts it without the shell), the full surface with the taskbar on the
 * route. */
export default function Settings({ embedded }: { embedded?: boolean }) {
  const [snapshot, setSnapshot] = useState<SettingsSnapshot>();
  const [local, setLocal] = useState<BrowserStoreSummary>();
  const [localIdentity, setLocalIdentity] = useState<{ userId: string; deviceId: string }>();
  const [localPreferences, setLocalPreferences] = useState<SettingsSnapshot["preferences"]>({
    theme: "dark",
    railMode: "auto",
    interfaceZoom: "100" });
  const [publicId, setPublicId] = useState("");
  const [section, setSection] = useState("database");
  /** the GTX picker state: the current language reads the module of the root
   * (never a duplicated source) and every switch rides setlanguage — the
   * module persists, rewalks the body and arms the observer itself. */
  const [lang, setLang] = useState(() => currentlang());
  const paired = gatewayReady();

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
      body: JSON.stringify({ userId: publicId }) });
    setSnapshot((current) =>
      current
        ? {
            ...current,
            identity: response.identity,
            database: { ...current.database, ownerUserId: response.identity.userId } }
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

  /** the section rail answers the mode: the paired browser mirrors the cli
   * identity, the browser-local deck keeps its own sections. */
  const sections: readonly { id: string; label: string }[] = paired
    ? [
        { id: "identity", label: "Identity" },
        { id: "workbench", label: "Workbench" },
        { id: "language", label: "Language" },
        { id: "gateway", label: "Gateway" },
        { id: "sync", label: "Sync" },
        { id: "automation", label: "Automation" },
        { id: "access", label: "Access" },
      ]
    : [
        { id: "database", label: "Database" },
        { id: "drives", label: "Drives" },
        { id: "account", label: "Local account" },
        { id: "workbench", label: "Workbench" },
        { id: "language", label: "Language" },
        { id: "gateway", label: "Gateway" },
        { id: "sync", label: "Sync" },
        { id: "automation", label: "Automation" },
        { id: "boundary", label: "Boundary" },
      ];
  const active = sections.some((item) => item.id === section) ? section : (sections[0]?.id ?? "database");

  return (
    <main className="dtw-app dtw-settings" style={embedded ? { height: "100%", overflow: "auto" } : undefined}>
      {!embedded && <ShellChrome />}
      <div className="dtw-pane">
        <nav className="dtw-nav" aria-label="Settings sections">
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              className="dtw-navrow"
              data-active={item.id === active ? "true" : undefined}
              onClick={() => setSection(item.id)}
              aria-current={item.id === active ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="dtw-content">
          <h1 className="dtw-title">{SETTINGS_LABEL?.name ?? "Settings"}</h1>

          {!paired && active === "database" ? (
            <section className="dtw-card">
              <h2 className="dtw-cardtitle">
                <SettingsRegular fontSize={15} aria-hidden="true" />
                Local database
              </h2>
              {kv("database", local?.database || "devthink.db")}
              {kv("owner", localIdentity?.userId || "initializing")}
              {kv("device", localIdentity?.deviceId || "initializing")}
              {kv(
                "records",
                `${local?.workspaces || 0} workspaces, ${local?.sessions || 0} sessions, ${local?.messages || 0} messages`,
              )}
            </section>
          ) : null}

          {!paired && active === "account" ? <LocalAccount /> : null}

          {!paired && active === "drives" ? <HardDrives /> : null}

          {active === "workbench" ? (
            <section className="dtw-card">
              <h2 className="dtw-cardtitle">
                <SettingsRegular fontSize={15} aria-hidden="true" />
                Workbench flags
              </h2>
              {flagsFields(paired && snapshot ? snapshot.preferences : localPreferences, (key, value) => {
                void savePreference(key, value);
              })}
            </section>
          ) : null}

          {active === "language" ? (
            <section className="dtw-card notranslate">
              <h2 className="dtw-cardtitle">
                <LocalLanguageRegular fontSize={15} aria-hidden="true" />
                Language
              </h2>
              <div className="dtw-settings__field">
                <span>Display language</span>
                <select
                  className="dtw-select"
                  value={lang}
                  onChange={(event) => {
                    const next = event.target.value;
                    setLang(next);
                    void setlanguage(next);
                  }}
                  aria-label="display language"
                >
                  {LANGUAGES.map((entry) => (
                    <option key={entry.code} value={entry.code}>
                      {entry.native}
                    </option>
                  ))}
                </select>
              </div>
              {kv("module", "google gtx — translategtx")}
              {kv("surface", "authored english, translated live")}
              <p className="dtw-copy">
                Every language but English rides the GTX module: the strings batch through the
                google translate endpoint, settle in the local cache and reveal with the scramble
                effect. The choice persists and the whole surface rewalks without a reload.
              </p>
            </section>
          ) : null}

          {active === "gateway" ? <GatewayCard /> : null}

          {active === "sync" && !paired ? (
            <section className="dtw-card">
              <h2 className="dtw-cardtitle">
                <ArrowSyncRegular fontSize={15} aria-hidden="true" />
                Sync state
              </h2>
              {kv("state", "local-only")}
              <p className="dtw-copy">
                Pair with <code>devthink pair create</code> to sync the cli gateway.
              </p>
            </section>
          ) : null}

          {active === "sync" && paired && snapshot ? (
            <section className="dtw-card">
              <h2 className="dtw-cardtitle">
                <ArrowSyncRegular fontSize={15} aria-hidden="true" />
                Sync state
              </h2>
              {kv("state", "paired-gateway")}
              {kv("cli", snapshot.database.persistence)}
              {kv("browser", `${local?.database || "devthink.db"} with ${local?.messages || 0} cached messages`)}
              {kv("remote adapter", "not configured")}
              {kv(
                "provider",
                `${snapshot.provider.activeProvider || "not configured"} with ${snapshot.provider.activeModel || "model not configured"}`,
              )}
            </section>
          ) : null}

          {active === "automation" ? <AutomationMcp /> : null}

          {paired && active === "identity" && snapshot ? (
            <section className="dtw-card">
              <h2 className="dtw-cardtitle">Public identity</h2>
              {kv("user id", snapshot.identity.userId)}
              {kv("device", snapshot.identity.deviceId)}
              <div className="dtw-settings__field">
                <span>Public id</span>
                <input
                  className="dtw-settings__input"
                  value={publicId}
                  onChange={(event) => setPublicId(event.target.value.toLowerCase())}
                  minLength={10}
                  maxLength={15}
                  pattern="[a-z][a-z0-9]{9,14}"
                  autoComplete="username"
                  aria-label="public id"
                />
              </div>
              <button type="button" className="dtw-btn dtw-btn--primary" onClick={() => void saveIdentity()}>
                Save public id
              </button>
            </section>
          ) : null}

          {paired && active === "identity" && !snapshot ? (
            <section className="dtw-card">
              <h2 className="dtw-cardtitle">Settings unavailable</h2>
              <p className="dtw-copy">The paired gateway did not return its local settings summary.</p>
              <button type="button" className="dtw-btn" onClick={refresh}>
                <ArrowSyncRegular fontSize={14} aria-hidden="true" />
                Refresh
              </button>
            </section>
          ) : null}

          {paired && active === "access" ? (
            <section className="dtw-card">
              <h2 className="dtw-cardtitle">
                <PlugDisconnectedRegular fontSize={15} aria-hidden="true" />
                Browser access
              </h2>
              <p className="dtw-copy">
                Revoking removes paired browser sessions. Cli data, provider credentials and the local database stay on
                this device.
              </p>
              <button type="button" className="dtw-btn dtw-btn--danger" onClick={() => void revoke()}>
                Revoke browser access
              </button>
            </section>
          ) : null}

          {!paired && active === "boundary" ? (
            <section className="dtw-card">
              <h2 className="dtw-cardtitle">
                <PlugDisconnectedRegular fontSize={15} aria-hidden="true" />
                Credential boundary
              </h2>
              <p className="dtw-copy">Provider credentials stay with the cli, never in this browser.</p>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
