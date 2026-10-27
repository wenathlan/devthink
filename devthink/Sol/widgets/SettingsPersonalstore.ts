/**
 * personalstore.ts — the personalization channel of the settings app: the
 * device-local choices that repaint the os itself (wallpaper, theme, accent
 * color, navbar position, the component behavior flags). Persistence rides
 * the house localStorage pattern (one key per concern, validated loads,
 * storage optional); application rides the same css channels the shell
 * already reads — the --wall-fallback recipe for the desktop, the lock
 * screen and the boot face, the data-theme attribute for the light ladder,
 * the --personal-accent token for the windows accent variables and the
 * data-wall / data-alttab-motion / data-taskbar-tips flags for the
 * stylesheet passes. The theme keeps the browser preference machine as its
 * source of truth (the panel and the paired gateway read it); the
 * localStorage mirror only lets the boot paint the ladder before the async
 * identity store answers. The devtools wall flag rides the same channel:
 * the choice persists here, the suspension seam lives in devtoolsguard.ts
 * (the single wall module the akash study lands).
 */

import { suspenddevtoolsguard } from "../../devtoolsguard.ts";

/** one wallpaper of the picker: an id plus the layered css recipe the
 * --wall-fallback variable serves. */
export type WallpaperId = "trident" | "bloom" | "meadow" | "tide" | "dusk" | "sand";

/** the wallpapers the desktop, the lock screen and the boot face paint —
 * the clear trident recipe of the theme plus five calm siblings in the same
 * layered grammar (one dominant light, two tint radials, the base veil). */
export const WALLPAPERS: readonly { id: WallpaperId; layers: string }[] = [
  {
    id: "trident",
    layers: [
      "radial-gradient(54% 46% at 50% 36%, rgb(255 255 255 / 58%) 0%, transparent 64%)",
      "radial-gradient(70% 52% at 16% 6%, rgb(199 210 254 / 42%) 0%, transparent 60%)",
      "radial-gradient(64% 48% at 86% 10%, rgb(186 230 253 / 40%) 0%, transparent 58%)",
      "linear-gradient(180deg, #e9edf7 0%, #dce2ee 58%, #d2daeb 100%)",
    ].join(", "),
  },
  {
    id: "bloom",
    layers: [
      "radial-gradient(54% 46% at 50% 36%, rgb(255 255 255 / 55%) 0%, transparent 64%)",
      "radial-gradient(70% 52% at 18% 8%, rgb(252 205 215 / 45%) 0%, transparent 60%)",
      "radial-gradient(64% 48% at 84% 12%, rgb(250 214 190 / 40%) 0%, transparent 58%)",
      "linear-gradient(180deg, #f7ecef 0%, #f0dfe3 58%, #e6cfd6 100%)",
    ].join(", "),
  },
  {
    id: "meadow",
    layers: [
      "radial-gradient(54% 46% at 50% 36%, rgb(255 255 255 / 52%) 0%, transparent 64%)",
      "radial-gradient(70% 52% at 16% 8%, rgb(187 227 205 / 45%) 0%, transparent 60%)",
      "radial-gradient(64% 48% at 86% 10%, rgb(205 236 222 / 40%) 0%, transparent 58%)",
      "linear-gradient(180deg, #e9f3ec 0%, #dcebe2 58%, #cfe3d6 100%)",
    ].join(", "),
  },
  {
    id: "tide",
    layers: [
      "radial-gradient(54% 46% at 50% 34%, rgb(255 255 255 / 40%) 0%, transparent 62%)",
      "radial-gradient(70% 52% at 20% 6%, rgb(174 214 240 / 48%) 0%, transparent 60%)",
      "radial-gradient(64% 48% at 84% 12%, rgb(140 190 228 / 45%) 0%, transparent 58%)",
      "linear-gradient(180deg, #dbe8f4 0%, #c4d8ec 58%, #aac8e2 100%)",
    ].join(", "),
  },
  {
    id: "dusk",
    layers: [
      "radial-gradient(54% 46% at 50% 36%, rgb(148 163 196 / 22%) 0%, transparent 64%)",
      "radial-gradient(70% 52% at 16% 6%, rgb(96 116 160 / 30%) 0%, transparent 60%)",
      "radial-gradient(64% 48% at 86% 10%, rgb(76 96 138 / 28%) 0%, transparent 58%)",
      "linear-gradient(180deg, #1c2233 0%, #171d2c 58%, #121827 100%)",
    ].join(", "),
  },
  {
    id: "sand",
    layers: [
      "radial-gradient(54% 46% at 50% 36%, rgb(255 255 255 / 55%) 0%, transparent 64%)",
      "radial-gradient(70% 52% at 16% 8%, rgb(235 224 205 / 45%) 0%, transparent 60%)",
      "radial-gradient(64% 48% at 86% 10%, rgb(242 233 218 / 40%) 0%, transparent 58%)",
      "linear-gradient(180deg, #f4f0e8 0%, #ece6da 58%, #e2dacb 100%)",
    ].join(", "),
  },
];

/** the localStorage key of the wallpaper choice. */
export const WALLPAPER_KEY = "dt.wallpaper.v1";

/** the wallpaper the storage answers (the trident when absent or stale). */
export function loadWallpaper(): WallpaperId {
  try {
    const raw = window.localStorage.getItem(WALLPAPER_KEY);
    if (raw === "trident" || raw === "bloom" || raw === "meadow" || raw === "tide" || raw === "dusk" || raw === "sand")
      return raw;
  } catch {
    /* storage unavailable: the stylesheet default carries the wall */
  }
  return "trident";
}

/** paints the wallpaper onto the document root: the layered recipe rides
 * the --wall-fallback channel every surface already reads and the id rides
 * data-wall for the passes keyed on the choice (the lock screen drops its
 * painted landscape for every wall but the trident). */
export function applyWallpaper(id: WallpaperId): void {
  if (typeof document === "undefined") return;
  const option = WALLPAPERS.find((wall) => wall.id === id) ?? WALLPAPERS[0];
  document.documentElement.style.setProperty("--wall-fallback", option.layers);
  document.documentElement.dataset.wall = option.id;
}

/** persists the wallpaper choice and paints it. */
export function saveWallpaper(id: WallpaperId): void {
  try {
    window.localStorage.setItem(WALLPAPER_KEY, id);
  } catch {
    /* private browsing: the choice lives for the session */
  }
  applyWallpaper(id);
}

/** one accent tone of the picker row (the windows calm set). */
export type AccentId = "blue" | "cyan" | "teal" | "fern" | "moss" | "amber" | "rose" | "slate";

/** the eight calm accent tones: deep enough for the white ink the windows
 * controls wear, quiet enough for the graphite shell. */
export const ACCENTS: readonly { id: AccentId; hex: string }[] = [
  { id: "blue", hex: "#0067c0" },
  { id: "cyan", hex: "#0e7490" },
  { id: "teal", hex: "#0f766e" },
  { id: "fern", hex: "#166534" },
  { id: "moss", hex: "#4d7c0f" },
  { id: "amber", hex: "#9a6b00" },
  { id: "rose", hex: "#9f4c5c" },
  { id: "slate", hex: "#475569" },
];

/** the localStorage key of the accent choice. */
export const ACCENT_KEY = "dt.accent.v1";

/** the accent the storage answers (null = the theme default #0067c0). */
export function loadAccent(): AccentId | null {
  try {
    const raw = window.localStorage.getItem(ACCENT_KEY);
    const found = ACCENTS.find((accent) => accent.id === raw);
    return found ? found.id : null;
  } catch {
    return null;
  }
}

/** mixes one hex channel toward white by the given amount (0..1) — the
 * bright variant the dark chrome serves so a deep accent stays readable on
 * the graphite surfaces. */
function lighten(hex: string, amount: number): string {
  const value = hex.replace("#", "");
  const mixed = [0, 2, 4].map((offset) => {
    const channel = Number.parseInt(value.slice(offset, offset + 2), 16);
    const lifted = Math.round(channel + (255 - channel) * amount);
    return lifted.toString(16).padStart(2, "0");
  });
  return `#${mixed.join("")}`;
}

/** sets the accent onto the document root: --personal-accent feeds the
 * windows accent variables of the light surfaces and the dtw kit,
 * --personal-accent-bright feeds the dark root ladder. A null id clears
 * both, so the stylesheet defaults answer untouched. */
export function applyAccent(id: AccentId | null): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const hex = id ? (ACCENTS.find((accent) => accent.id === id)?.hex ?? null) : null;
  if (!hex) {
    root.style.removeProperty("--personal-accent");
    root.style.removeProperty("--personal-accent-bright");
    return;
  }
  root.style.setProperty("--personal-accent", hex);
  root.style.setProperty("--personal-accent-bright", lighten(hex, 0.38));
}

/** persists the accent choice and applies it. */
export function saveAccent(id: AccentId): void {
  try {
    window.localStorage.setItem(ACCENT_KEY, id);
  } catch {
    /* private browsing: the choice lives for the session */
  }
  applyAccent(id);
}

/** the theme ladder choice (the browser preference machine owns the truth,
 * this mirror only paints the ladder before it answers). */
export type ThemeChoice = "dark" | "light";

/** the localStorage mirror of the theme preference. */
export const THEME_MIRROR_KEY = "dt.theme.v1";

/** the mirrored theme (null when no mirror was ever written). */
export function loadThemeMirror(): ThemeChoice | null {
  try {
    const raw = window.localStorage.getItem(THEME_MIRROR_KEY);
    if (raw === "dark" || raw === "light") return raw;
  } catch {
    return null;
  }
  return null;
}

/** flips the theme ladder: the data-theme attribute lands on the document
 * root (the shell chrome and the light: variants answer it) and, best
 * effort, on the panel root that carries its own copy of the attribute —
 * the preference machine heals both on its next read. */
export function applyTheme(theme: ThemeChoice): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.querySelector(".devthink-app")?.setAttribute("data-theme", theme);
}

/** mirrors the theme choice beside the preference machine and paints it. */
export function saveThemeMirror(theme: ThemeChoice): void {
  try {
    window.localStorage.setItem(THEME_MIRROR_KEY, theme);
  } catch {
    /* private browsing: the choice lives for the session */
  }
  applyTheme(theme);
}

/** heals the mirror after the preference machine answered (the db row is
 * the source of truth — the legacy workbench row and the gateway PATCH
 * both write it without touching the mirror). */
export function syncThemeFromPreference(value: string | undefined): void {
  if (value !== "dark" && value !== "light") return;
  saveThemeMirror(value);
}

/** the on/off flags of the component behaviors. */
export type FlagChoice = "on" | "off";

/** the localStorage key of the alt-tab entrance flag. */
export const ALTTAB_MOTION_KEY = "dt.alttab.motion.v1";

/** the localStorage key of the taskbar tooltip flag. */
export const TASKBAR_TIPS_KEY = "dt.taskbar.tips.v1";

/** the stored flag (the fallback answers when storage stays quiet). */
function loadFlag(key: string, fallback: boolean): boolean {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === "on") return true;
    if (raw === "off") return false;
  } catch {
    /* storage unavailable: the fallback behavior stands */
  }
  return fallback;
}

/** arms the alt-tab entrance flag the stylesheet respects: data-alttab-
 * motion="off" stops the switcher entrance curves (the reduced-motion hard
 * stop keeps outranking everything). */
export function applyAltTabMotion(on: boolean): void {
  if (typeof document === "undefined") return;
  if (on) delete document.documentElement.dataset.alttabMotion;
  else document.documentElement.dataset.alttabMotion = "off";
}

/** arms the taskbar tooltip flag: data-taskbar-tips="off" hides the app
 * name peek above the taskbar icons. */
export function applyTaskbarTips(on: boolean): void {
  if (typeof document === "undefined") return;
  if (on) delete document.documentElement.dataset.taskbarTips;
  else document.documentElement.dataset.taskbarTips = "off";
}

/** persists one behavior flag and arms it. */
function saveFlag(key: string, on: boolean, apply: (value: boolean) => void): void {
  try {
    window.localStorage.setItem(key, on ? "on" : "off");
  } catch {
    /* private browsing: the choice lives for the session */
  }
  apply(on);
}

/** the stored alt-tab entrance flag (on by default). */
export function loadAltTabMotion(): boolean {
  return loadFlag(ALTTAB_MOTION_KEY, true);
}

/** persists and arms the alt-tab entrance flag. */
export function saveAltTabMotion(on: boolean): void {
  saveFlag(ALTTAB_MOTION_KEY, on, applyAltTabMotion);
}

/** the stored taskbar tooltip flag (on by default). */
export function loadTaskbarTips(): boolean {
  return loadFlag(TASKBAR_TIPS_KEY, true);
}

/** persists and arms the taskbar tooltip flag. */
export function saveTaskbarTips(on: boolean): void {
  saveFlag(TASKBAR_TIPS_KEY, on, applyTaskbarTips);
}

/** the localStorage key of the devtools wall flag (the owner switch of
 * the guard — off by default: the wall is opt-in, the false positive era
 * the owner charged dies with the default). */
export const DEVTOOLS_WALL_KEY = "dt.devtools.wall.v1";

/** arms or suspends the devtools wall: off parks every prong of the wall
 * (devtoolsguard.ts owns the machinery — suspended, it never loops); on
 * lets the duty cycle run again. The seam answers on every build so the
 * toggle behaves the same in dev. */
export function applyDevtoolsWall(on: boolean): void {
  suspenddevtoolsguard(!on);
}

/** the stored devtools wall flag (off by default — the wall is opt-in:
 * the owner arms it through the settings row, every visitor else never
 * meets the interstitial). */
export function loadDevtoolsWall(): boolean {
  return loadFlag(DEVTOOLS_WALL_KEY, false);
}

/** persists the devtools wall flag and arms it. */
export function saveDevtoolsWall(on: boolean): void {
  saveFlag(DEVTOOLS_WALL_KEY, on, applyDevtoolsWall);
}

/**
 * paints every stored personalization choice onto the document root — the
 * settings anchor calls this once at module load, so the wallpaper, the
 * theme ladder, the accent and the behavior flags hold before the lock
 * screen or the desktop ever mount (the same law initautotranslate rides).
 */
export function initPersonalization(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  try {
    applyWallpaper(loadWallpaper());
    const accent = loadAccent();
    if (accent) applyAccent(accent);
    const mirror = loadThemeMirror();
    if (mirror) applyTheme(mirror);
    applyAltTabMotion(loadAltTabMotion());
    applyTaskbarTips(loadTaskbarTips());
    // the devtools wall flag lands before App arms the wall (the settings
    // anchor module loads inside the App import graph), so a stored off
    // suspends the prongs from the first tick
    applyDevtoolsWall(loadDevtoolsWall());
  } catch {
    /* the stylesheet defaults carry the whole surface */
  }
}
