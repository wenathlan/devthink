/**
 * appregistry.ts — the shared desktop app catalog (root logic layer). One
 * source of truth consumed by the desktop icon grid (Sol/panel/desktop.tsx),
 * the Start menu (Sol/shell/ShellChrome.tsx), the launcher surfaces of
 * explore and onboarding and the tile kit: the native surfaces of the
 * platform plus the marketing family apps, each with its own identity color
 * carried by the icon tile (the chrome itself stays neutral graphite).
 */
import type { FluentIcon as LucideIcon } from "@fluentui/react-icons";
import { MusicNote2Regular as AudioLines, ChartMultipleRegular as BarChart3, BookOpenRegular as BookOpen, BoxRegular as Box, CubeRegular as Boxes, CalculatorRegular as Calculator, VideoClipRegular as Clapperboard, ClockRegular as Clock, TargetRegular as Crosshair, BuildingFactoryRegular as Factory, FolderRegular as FolderKanban, ToolboxRegular as Hammer, ImageRegular as Image, PlugConnectedRegular as PlugZap, SettingsRegular as Settings2, ShieldRegular as Shield, WindowConsoleRegular as TerminalSquare, VaultRegular as Vault, FlowchartRegular as Waypoints } from "@fluentui/react-icons";

/** how a desktop app opens */
export type DesktopAppTarget =
  | { kind: "window"; id: "chat" | "history" }
  | { kind: "destination"; id: string }
  | { kind: "route"; href: string }
  | { kind: "external"; slug: string };

export type DesktopApp = {
  id: string;
  /** display label under the icon */
  name: string;
  /** one-line description for the start menu */
  detail: string;
  /** the identity color of the app (the premium icon asset carries the story) */
  tint: string;
  /** lucide glyph; null renders the official DevThink logo mark */
  icon: LucideIcon | null;
  /** the key of the premium animated icon asset in the platform.icons catalog */
  iconset?: string;
  /** shows in the Start menu pinned grid */
  pinned: boolean;
  target: DesktopAppTarget;
};

/** The desktop apps: the platform surfaces first, then the marketing family. */
export const DESKTOP_APPS: DesktopApp[] = [
  {
    id: "chat",
    name: "Chat",
    detail: "The assistant of the OS",
    tint: "#d97757",
    icon: null,
    iconset: "chat",
    pinned: true,
    // the desktop app opens IN PLACE as a floating window (the Windows law:
    // the person enters through the apps of the desktop) — the fullscreen
    // /chat page stays a deep-link surface only
    target: { kind: "window", id: "chat" },
  },
  {
    id: "history",
    name: "History",
    detail: "Open local session tabs",
    tint: "#a8926d",
    icon: Clock,
    iconset: "history",
    pinned: true,
    target: { kind: "destination", id: "history" },
  },
  {
    id: "projects",
    name: "Projects",
    detail: "Local workspace records",
    tint: "#2dd4bf",
    icon: FolderKanban,
    iconset: "projects",
    pinned: true,
    target: { kind: "destination", id: "projects" },
  },
  {
    id: "console",
    name: "Console",
    detail: "The canonical design of the CLI",
    tint: "#4ade80",
    icon: TerminalSquare,
    iconset: "console",
    pinned: true,
    target: { kind: "route", href: "/console" },
  },
  {
    id: "calculator",
    name: "Calculator",
    detail: "The native arithmetic app of the OS",
    tint: "#9aa7b4",
    icon: Calculator,
    pinned: true,
    target: { kind: "route", href: "/calculator" },
  },
  {
    id: "image",
    name: "Image",
    detail: "The native image studio on the cadria engine",
    tint: "#c084fc",
    icon: Image,
    pinned: true,
    target: { kind: "route", href: "/image" },
  },
  {
    id: "video",
    name: "Video",
    detail: "The native video editor on the versawase engine",
    tint: "#f472b6",
    icon: Clapperboard,
    pinned: true,
    target: { kind: "route", href: "/video" },
  },
  {
    id: "audio",
    name: "Audio",
    detail: "The native audio studio on the debonair engine",
    tint: "#d9962e",
    icon: AudioLines,
    pinned: true,
    target: { kind: "route", href: "/audio" },
  },
  {
    id: "games",
    name: "Games",
    detail: "The native games shelf of the OS",
    tint: "#e8563f",
    icon: Crosshair,
    pinned: true,
    target: { kind: "route", href: "/games" },
  },
  {
    id: "gateway",
    name: "Gateway",
    detail: "The embedded local gateway console",
    tint: "#b9963b",
    icon: Waypoints,
    iconset: "gateway",
    pinned: true,
    target: { kind: "route", href: "/gateway" },
  },
  {
    id: "providers",
    name: "Providers",
    detail: "Provider and model choices",
    tint: "#a3e635",
    icon: PlugZap,
    iconset: "providers",
    pinned: false,
    target: { kind: "route", href: "/providers" },
  },
  {
    id: "usage",
    name: "Usage",
    detail: "Compact local usage records",
    tint: "#8fb597",
    icon: BarChart3,
    iconset: "usage",
    pinned: false,
    target: { kind: "route", href: "/usage" },
  },
  {
    id: "docs",
    name: "Docs",
    detail: "The documentation library",
    tint: "#cbd5e1",
    icon: BookOpen,
    iconset: "docs",
    pinned: true,
    target: { kind: "route", href: "/docs" },
  },
  {
    id: "settings",
    name: "Settings",
    detail: "Pairing and local preferences",
    tint: "#94a3b8",
    icon: Settings2,
    iconset: "settings",
    pinned: true,
    target: { kind: "destination", id: "settings" },
  },
  {
    id: "argan",
    name: "Argan",
    detail: "DNS and gateway library of the OS",
    tint: "#00a86b",
    icon: Shield,
    iconset: "argan",
    pinned: true,
    target: { kind: "external", slug: "argan" },
  },
  {
    id: "cadria",
    name: "Cadria",
    detail: "Video, image and 3D studio",
    tint: "#ec4899",
    icon: Clapperboard,
    iconset: "cadria",
    pinned: true,
    target: { kind: "external", slug: "cadria" },
  },
  {
    id: "debonair",
    name: "Debonair",
    detail: "The OS audio DAW",
    tint: "#c9973f",
    icon: AudioLines,
    iconset: "debonair",
    pinned: true,
    target: { kind: "external", slug: "debonair" },
  },
  {
    id: "stealthhead",
    name: "Stealthhead",
    detail: "The OS FPS platform",
    tint: "#f4694f",
    icon: Crosshair,
    iconset: "stealthhead",
    pinned: true,
    target: { kind: "external", slug: "stealthhead" },
  },
  {
    id: "forge",
    name: "Forge",
    detail: "The sandbox runners",
    tint: "#b5793b",
    icon: Hammer,
    iconset: "forge",
    pinned: true,
    target: { kind: "external", slug: "forge" },
  },
  {
    id: "foundry",
    name: "Foundry",
    detail: "Run and keep",
    tint: "#98a2ad",
    icon: Factory,
    iconset: "foundry",
    pinned: true,
    target: { kind: "external", slug: "foundry" },
  },
  {
    id: "vault",
    name: "Vault",
    detail: "The family vault — the storage reserve",
    tint: "#cfa84a",
    icon: Vault,
    iconset: "vault",
    pinned: true,
    target: { kind: "external", slug: "vault" },
  },
  {
    id: "getry",
    name: "Getry",
    detail: "The family AI gateway",
    tint: "#6fae8f",
    icon: Boxes,
    iconset: "getry",
    pinned: true,
    target: { kind: "external", slug: "getry" },
  },
  {
    id: "saddle",
    name: "Saddle",
    detail: "The sandbox engine",
    tint: "#d6b483",
    icon: Box,
    iconset: "saddle",
    pinned: true,
    target: { kind: "external", slug: "saddle" },
  },
];

/** The apps pinned to the Start menu grid, in catalog order. */
export const PINNED_APPS: DesktopApp[] = DESKTOP_APPS.filter((app) => app.pinned);

/** The family identity set: every app of the DevThink family — each opens
 * as a window of the os riding its repository subpath inside (the power
 * clip), and the app id IS the deploy unit slug. */
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
