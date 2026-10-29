/**
 * appregistry.ts — the shared desktop app catalog (root logic layer). One
 * source of truth consumed by the desktop icon grid (Sol/panel/desktop.tsx),
 * the Start menu (Sol/shell/ShellChrome.tsx), the launcher surfaces of
 * explore and onboarding and the tile kit: the native surfaces of the
 * platform plus the marketing family apps, each with its own identity color
 * carried by the icon tile (the chrome itself stays neutral graphite).
 * The labels (name, detail, pin) never live here: they ride the catalog
 * database (the seedcatalog rows, the offline answer of the static build)
 * and this registry binds them to the glyph, the tint and the open target —
 * structure and presentation only, info never.
 */
import type { FluentIcon as LucideIcon } from "@fluentui/react-icons";
import {
  MusicNote2Regular as AudioLines,
  ChartMultipleRegular as BarChart3,
  BookOpenRegular as BookOpen,
  BoxRegular as Box,
  CubeRegular as Boxes,
  CalculatorRegular as Calculator,
  VideoClipRegular as Clapperboard,
  ClockRegular as Clock,
  TargetRegular as Crosshair,
  BuildingFactoryRegular as Factory,
  FolderRegular as FolderKanban,
  FolderArrowUpRegular,
  ToolboxRegular as Hammer,
  ImageRegular as Image,
  PlugConnectedRegular as PlugZap,
  SettingsRegular as Settings2,
  ShieldRegular as Shield,
  WindowConsoleRegular as TerminalSquare,
  WindowAppsRegular as WindowApps,
  VaultRegular as Vault,
  FlowchartRegular as Waypoints,
} from "@fluentui/react-icons";
import { osAppLabels } from "./catalog.ts";

/** how a desktop app opens */
export type DesktopAppTarget =
  | { kind: "window"; id: "chat" | "history" }
  | { kind: "destination"; id: string }
  | { kind: "route"; href: string }
  | { kind: "external"; slug: string };

export type DesktopApp = {
  id: string;
  /** display label under the icon (bound from the catalog database) */
  name: string;
  /** one-line description for the start menu (bound from the catalog database) */
  detail: string;
  /** the identity color of the app (the premium icon asset carries the story) */
  tint: string;
  /** fluent glyph; null renders the official DevThink logo mark */
  icon: LucideIcon | null;
  /** the key of the premium animated icon asset in the platform.icons catalog */
  iconset?: string;
  /** shows in the Start menu pinned grid (bound from the catalog database) */
  pinned: boolean;
  target: DesktopAppTarget;
};

/** the binding of one registry row: the glyph, the tint and the open
 * target the app answers — every label comes from the catalog rows, never
 * here */
type AppBinding = {
  id: string;
  tint: string;
  icon: LucideIcon | null;
  iconset?: string;
  target: DesktopAppTarget;
};

/** the registry bindings: the platform surfaces first, then the marketing
 * family — the structure, the info rides the database */
const APP_BINDINGS: AppBinding[] = [
  {
    id: "chat",
    tint: "#d97757",
    icon: null,
    iconset: "chat",
    // the desktop app opens IN PLACE as a floating window (the Windows law:
    // the person enters through the apps of the desktop) — the fullscreen
    // /chat page stays a deep-link surface only
    target: { kind: "window", id: "chat" },
  },
  {
    id: "files",
    tint: "#a3d7e6",
    icon: FolderArrowUpRegular,
    iconset: "files",
    // My Files opens as a floating window of the desktop — the Windows
    // explorer law: the file manager is an app of the taskbar, never a
    // full-page surface
    target: { kind: "route", href: "/files" },
  },
  {
    id: "history",
    tint: "#a8926d",
    icon: Clock,
    iconset: "history",
    target: { kind: "destination", id: "history" },
  },
  {
    id: "projects",
    tint: "#2dd4bf",
    icon: FolderKanban,
    iconset: "projects",
    target: { kind: "destination", id: "projects" },
  },
  {
    id: "console",
    tint: "#4ade80",
    icon: TerminalSquare,
    iconset: "console",
    target: { kind: "route", href: "/console" },
  },
  {
    id: "calculator",
    tint: "#9aa7b4",
    icon: Calculator,
    iconset: "calculator",
    target: { kind: "route", href: "/calculator" },
  },
  {
    id: "image",
    tint: "#c084fc",
    icon: Image,
    iconset: "image",
    target: { kind: "route", href: "/image" },
  },
  {
    id: "video",
    tint: "#f472b6",
    icon: Clapperboard,
    iconset: "video",
    target: { kind: "route", href: "/video" },
  },
  {
    id: "audio",
    tint: "#d9962e",
    icon: AudioLines,
    iconset: "audio",
    target: { kind: "route", href: "/audio" },
  },
  {
    id: "games",
    tint: "#e8563f",
    icon: Crosshair,
    iconset: "games",
    target: { kind: "route", href: "/games" },
  },
  {
    id: "gateway",
    tint: "#b9963b",
    icon: Waypoints,
    iconset: "gateway",
    target: { kind: "route", href: "/gateway" },
  },
  {
    id: "providers",
    tint: "#a3e635",
    icon: PlugZap,
    iconset: "providers",
    target: { kind: "route", href: "/providers" },
  },
  {
    id: "usage",
    tint: "#8fb597",
    icon: BarChart3,
    iconset: "usage",
    target: { kind: "route", href: "/usage" },
  },
  {
    id: "docs",
    tint: "#cbd5e1",
    icon: BookOpen,
    iconset: "docs",
    target: { kind: "route", href: "/docs" },
  },
  {
    id: "settings",
    tint: "#94a3b8",
    icon: Settings2,
    iconset: "settings",
    target: { kind: "destination", id: "settings" },
  },
  {
    id: "argan",
    tint: "#00a86b",
    icon: Shield,
    iconset: "argan",
    target: { kind: "external", slug: "argan" },
  },
  {
    id: "cadria",
    tint: "#ec4899",
    icon: Clapperboard,
    iconset: "cadria",
    target: { kind: "external", slug: "cadria" },
  },
  {
    id: "debonair",
    tint: "#c9973f",
    icon: AudioLines,
    iconset: "debonair",
    target: { kind: "external", slug: "debonair" },
  },
  {
    id: "stealthhead",
    tint: "#f4694f",
    icon: Crosshair,
    iconset: "stealthhead",
    target: { kind: "external", slug: "stealthhead" },
  },
  {
    id: "forge",
    tint: "#b5793b",
    icon: Hammer,
    iconset: "forge",
    target: { kind: "external", slug: "forge" },
  },
  {
    id: "foundry",
    tint: "#98a2ad",
    icon: Factory,
    iconset: "foundry",
    target: { kind: "external", slug: "foundry" },
  },
  {
    id: "vault",
    tint: "#cfa84a",
    icon: Vault,
    iconset: "vault",
    target: { kind: "external", slug: "vault" },
  },
  {
    id: "getry",
    tint: "#8b5cf6",
    icon: Boxes,
    iconset: "getry",
    target: { kind: "external", slug: "getry" },
  },
  {
    id: "saddle",
    tint: "#e86f2d",
    icon: Box,
    iconset: "saddle",
    target: { kind: "external", slug: "saddle" },
  },
  {
    id: "cobaia",
    tint: "#4fb3c6",
    icon: WindowApps,
    iconset: "cobaia",
    // the family front door — the storefront of the catalog (pricing,
    // support, the app directory and the blog) — answers the same dual door
    // every family app answers: the typed url owns the fullscreen stage and
    // the double click owns the power clip window inside the os
    target: { kind: "external", slug: "cobaia" },
  },
];

/** The desktop apps: the bindings with the catalog labels merged — the
 * database rows own the name, the detail and the pin, the fallback keeps a
 * bare id honest when a row is missing. */
export const DESKTOP_APPS: DesktopApp[] = APP_BINDINGS.map((binding) => {
  const label = osAppLabels()[binding.id];
  return {
    id: binding.id,
    name: label?.name ?? binding.id,
    detail: label?.detail ?? "",
    tint: binding.tint,
    icon: binding.icon,
    ...(binding.iconset ? { iconset: binding.iconset } : {}),
    pinned: label?.pinned ?? false,
    target: binding.target,
  };
});

/** The apps pinned to the Start menu grid, in catalog order. */
export const PINNED_APPS: DesktopApp[] = DESKTOP_APPS.filter((app) => app.pinned);

/** The family identity set: every app of the DevThink family — each opens
 * as a window of the os riding its repository subpath inside (the power
 * clip), and the app id IS the deploy unit slug. The ten deploy units
 * answer the set: the nine product apps plus the cobaia storefront (the
 * family front door the pages site mounts beside the os). */
export const FAMILY_APP_IDS: ReadonlySet<string> = new Set([
  "argan",
  "cadria",
  "debonair",
  "forge",
  "foundry",
  "vault",
  "getry",
  "stealthhead",
  "saddle",
  "cobaia",
]);

/**
 * tells whether a desktop app belongs to the family identity grid.
 *
 * @param app the desktop app to classify.
 * @returns true when the app carries the family identity.
 */
export function isFamilyApp(app: DesktopApp): boolean {
  return FAMILY_APP_IDS.has(app.id);
}

/**
 * filters the catalog by a free-text query (name or detail).
 *
 * @param query the raw search text.
 * @returns the matching apps, or every app for an empty query.
 */
export function searchDesktopApps(query: string): DesktopApp[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return PINNED_APPS;
  return DESKTOP_APPS.filter(
    (app) => app.name.toLowerCase().includes(needle) || app.detail.toLowerCase().includes(needle),
  );
}
