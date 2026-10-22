/**
 * settingstypes.ts — the shared contracts of the settings surface: the
 * shape the paired gateway answers /settings with, plus the category ids
 * the Windows 11 navigation rail routes by. Pure types + tiny guards, no
 * react, so the anchor and every category component import the one truth.
 */

/** the /settings snapshot of a paired gateway (the anchor's contract). */
export type SettingsSnapshot = {
  identity: { userId: string; deviceId: string };
  pairing: { activeSessions: number };
  preferences: { theme: "dark" | "light"; railMode: "always" | "auto" | "off"; interfaceZoom: string };
  provider: { activeProvider?: string; activeModel?: string };
  database: {
    ownerUserId: string;
    local: boolean;
    persistence: string;
    workspaces: number;
    sessions: number };
};

/** the workbench preference keys the preference machine persists (the same
 * keys the browser store and the paired gateway PATCH ride). */
export type PreferenceKey = keyof SettingsSnapshot["preferences"];

/** the settings categories of the Windows 11 rail — one content pane at a
 * time, routed by internal state. */
export type SettingsCategoryId =
  | "personalization"
  | "accounts"
  | "gateway"
  | "drives"
  | "automation"
  | "about";
