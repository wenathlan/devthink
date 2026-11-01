/**
 * settings page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page: it
 * imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) and
 * the window registry (Sol/wingets/PanelWorkspace.tsx) consume this file. The
 * home anchor consumes the pairing panel through this surface.
 *
 * Settings — the Windows 11 Settings app: the left navigation rail (the
 * account card pinned at its top, the search field, the rounded entry
 * list with the fluent glyphs) and the right content pane showing ONE
 * category at a time — Personalization, Accounts, Gateway & Pairing,
 * Drives, Automation & MCP, About — routed by internal state. The anchor
 * owns only the data machine (the gateway snapshot, the browser-local
 * identity and preference stores, the save / revoke actions) and the
 * category routing; every card lives in Sol/wingets. The
 * personalization pass paints its stored choices onto the document root
 * once at module load, so the wallpaper, the theme ladder, the accent and
 * the behavior flags hold before the lock screen or the desktop mount.
 */
import { useEffect, useState } from "react";
import { ShellChrome } from "@/wingets/Shellchrome";
import {
  type AccountSessionState,
  accountbearer,
  accountsessionstate,
  clearaccountsession,
  restoreonce,
  revokeaccountsessionbearer,
} from "../../account.ts";
import { copy } from "../../copy";
import { gatewayJson, gatewayReady } from "../../gateway.js";
import {
  type BrowserStoreSummary,
  browserIdentity,
  browserStoreSummary,
  readBrowserPreferences,
  saveBrowserPreference,
} from "../../storage.ts";
import type { PreferenceKey, SettingsCategoryId, SettingsSnapshot } from "../wingets";
import {
  AboutSettings,
  AccountsCategory,
  AutomationMcp,
  GatewayPairing,
  HardDrives,
  initPersonalization,
  loadThemeMirror,
  Personalization,
  SettingsNav,
  syncThemeFromPreference,
} from "../wingets";

export * from "../wingets";

/** paints the stored personalization choices before any route mounts (the
 * same law the display preference rides at the settings card). */
initPersonalization();

/** The settings app: the Windows body when embedded (the desktop window
 * hosts it without the shell), the full surface with the taskbar on the
 * route. */
export default function Settings({ embedded }: { embedded?: boolean }) {
  const [snapshot, setSnapshot] = useState<SettingsSnapshot>();
  const [local, setLocal] = useState<BrowserStoreSummary>();
  const [accountSession, setAccountSession] = useState<AccountSessionState>();
  const [localIdentity, setLocalIdentity] = useState<{ userId: string; deviceId: string }>();
  const [localPreferences, setLocalPreferences] = useState<SettingsSnapshot["preferences"]>(() => ({
    // the theme mirror answers before the async store does (the preference
    // machine heals it on its first read)
    theme: loadThemeMirror() ?? "dark",
    railMode: "auto",
    interfaceZoom: "100",
  }));
  const [publicId, setPublicId] = useState("");
  const [category, setCategory] = useState<SettingsCategoryId>("personalization");
  const paired = gatewayReady();

  function refresh() {
    void Promise.all([browserStoreSummary(paired), browserIdentity(), readBrowserPreferences()])
      .then(([summary, identity, preferences]) => {
        setLocal(summary);
        setLocalIdentity(identity);
        setLocalPreferences((current) => ({ ...current, ...preferences }));
        // the db row is the truth of the ladder — the mirror follows it
        syncThemeFromPreference(preferences.theme);
      })
      .catch(() => undefined);
    if (!paired) return;
    void gatewayJson<SettingsSnapshot>("/settings")
      .then((next) => {
        setSnapshot(next);
        setPublicId(next.identity.userId);
      })
      .catch(() => setSnapshot(undefined));
    // the family session: the real account lane state of this browser —
    // the card answers when the lane answered, nothing pretends otherwise.
    // the persistent restore runs first: a live family cookie answers a
    // rotated session and parks the fresh cache copy before the read
    void restoreonce()
      .then(() => {
        if (!accountbearer()) {
          setAccountSession(undefined);
          return undefined;
        }
        return accountsessionstate();
      })
      .then((state) => setAccountSession(state ?? undefined))
      .catch(() => setAccountSession(undefined));
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

  async function savePreference(key: PreferenceKey, value: string) {
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

  /** the family sign out: revoke the account session at the lane and drop
   * the parked family session of this browser */
  async function revokeAccount() {
    await revokeaccountsessionbearer();
    clearaccountsession();
    setAccountSession(undefined);
  }

  /** the preference rows the pages answer: the paired deck mirrors the cli
   * gateway, the browser-local deck keeps its own rows. */
  const preferences = paired && snapshot ? snapshot.preferences : localPreferences;
  const accountId = paired ? snapshot?.identity.userId : localIdentity?.userId;

  return (
    <main
      className="dtw-app dtw-settings"
      data-theme={preferences.theme}
      style={embedded ? { height: "100%", overflow: "auto" } : undefined}
    >
      {!embedded && <ShellChrome />}
      <div className="dtw-pane">
        <SettingsNav active={category} onSelect={setCategory} paired={paired} accountId={accountId} />
        <div className="dtw-content" data-category={category}>
          {/* the title remounts with its key so every turn of the rail
              answers with the rise entrance of the content wave */}
          <h1 className="dtw-title" key={category}>
            {copy(`settings.nav.${category}`)}
          </h1>

          {category === "personalization" ? (
            <Personalization preferences={preferences} save={(key, value) => void savePreference(key, value)} />
          ) : null}

          {category === "accounts" ? (
            <AccountsCategory
              paired={paired}
              snapshot={snapshot}
              publicId={publicId}
              onPublicIdChange={setPublicId}
              onSaveIdentity={() => void saveIdentity()}
              onRevoke={() => void revoke()}
              account={accountSession}
              onRevokeAccount={() => void revokeAccount()}
            />
          ) : null}

          {category === "gateway" ? <GatewayPairing paired={paired} snapshot={snapshot} local={local} /> : null}

          {category === "drives" ? <HardDrives /> : null}

          {category === "automation" ? <AutomationMcp /> : null}

          {category === "about" ? (
            <AboutSettings paired={paired} snapshot={snapshot} local={local} localIdentity={localIdentity} />
          ) : null}
        </div>
      </div>
    </main>
  );
}
