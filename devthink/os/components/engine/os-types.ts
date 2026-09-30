/* ==========================================================================
   os-types.ts — tipos globais do OS (view, settings, handle compartilhado)
   ========================================================================== */

import type { AppId } from "./apps";

export type OSView = { app: AppId | "gateway"; page: string };

export type OSSettings = {
  theme: "dark" | "light";
  reduceMotion: boolean;
  showCognition: boolean;
  locale: "pt" | "en";
  profileName: string;
};

export const DEFAULT_SETTINGS: OSSettings = {
  theme: "dark",
  reduceMotion: false,
  showCognition: true,
  locale: "pt",
  profileName: "operador",
};

export type OSHandle = {
  view: OSView;
  navigate: (view: OSView) => void;
  openApp: (app: AppId, page?: string) => void;
  goGateway: () => void;
  settings: OSSettings;
  updateSettings: (patch: Partial<OSSettings>) => void;
  toggleTheme: () => void;
  openCmd: () => void;
};

/* ---------------- validadores (type-guards, padrão onda8c) ---------------- */

export function isOSView(v: unknown): v is OSView {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  const apps: string[] = ["devthink", "argan", "debonair", "cadria", "stealthhead", "gateway"];
  return typeof o.app === "string" && apps.includes(o.app) && typeof o.page === "string" && o.page.length > 0;
}

export function isOSSettings(v: unknown): v is OSSettings {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    (o.theme === "dark" || o.theme === "light") &&
    typeof o.reduceMotion === "boolean" &&
    typeof o.showCognition === "boolean" &&
    (o.locale === "pt" || o.locale === "en") &&
    typeof o.profileName === "string"
  );
}
