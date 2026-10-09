/**
 * appregistry.ts — the shared desktop app catalog of the Sol shell. One
 * source of truth consumed by the desktop icon grid (Sol/panel/desktop.tsx)
 * and the Start menu (Sol/shell/ShellChrome.tsx): the native surfaces of the
 * platform plus the marketing family apps, each with its own identity color
 * carried by the icon tile (the chrome itself stays neutral graphite).
 */
import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  BarChart3,
  BookOpen,
  Box,
  Boxes,
  Calculator,
  Clapperboard,
  Clock,
  Compass,
  Crosshair,
  Factory,
  FolderKanban,
  Hammer,
  Image,
  LogIn,
  Monitor,
  Network,
  PlugZap,
  Settings2,
  Shield,
  TerminalSquare,
  Vault,
  Waypoints,
} from "lucide-react";

/** how a desktop app opens */
export type DesktopAppTarget =
  | { kind: "window"; id: "chat" | "history" }
  | { kind: "destination"; id: string }
  | { kind: "route"; href: string }
  | { kind: "os"; app?: string }
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

/** The localStorage key of the os view (Sol/os/usestoredstate contract). */
const OS_VIEW_KEY = "dt-os-view-v1";

/**
 * seeds the stored os view so /os opens straight on the family app.
 *
 * @param app the os app id (Argan, Cadria, Debonair, StealHead).
 */
export function seedOsView(app?: string): void {
  if (!app) return;
  try {
    window.localStorage.setItem(OS_VIEW_KEY, JSON.stringify({ app, page: "home" }));
  } catch {
    /* storage unavailable: /os opens on its last view */
  }
}

/** The desktop apps: the platform surfaces first, then the marketing family. */
export const DESKTOP_APPS: DesktopApp[] = [
  {
    id: "chat",
    name: "Chat",
    detail: "The assistant of the OS",
    tint: "#ff8c42",
    icon: null,
    iconset: "chat",
    pinned: true,
    target: { kind: "route", href: "/chat" },
  },
  {
    id: "history",
    name: "History",
    detail: "Open local session tabs",
    tint: "#7dd3fc",
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
    tint: "#4cc2ff",
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
    id: "gateway",
    name: "Gateway",
    detail: "The embedded local gateway console",
    tint: "#fbbf24",
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
    tint: "#38bdf8",
    icon: BarChart3,
    iconset: "usage",
    pinned: false,
    target: { kind: "route", href: "/usage" },
  },
  {
    id: "routes",
    name: "Routes",
    detail: "Gateway and stream health",
    tint: "#22d3ee",
    icon: Network,
    iconset: "routes",
    pinned: false,
    target: { kind: "route", href: "/routes" },
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
    id: "explore",
    name: "Explore",
    detail: "The exploration gallery",
    tint: "#fb7185",
    icon: Compass,
    iconset: "explore",
    pinned: true,
    target: { kind: "route", href: "/explore" },
  },
  {
    id: "os",
    name: "OS",
    detail: "The family operating surface",
    tint: "#a8b3c4",
    icon: Boxes,
    iconset: "os",
    pinned: true,
    target: { kind: "route", href: "/os" },
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
    id: "panel",
    name: "Panel",
    detail: "The creation panel — the OS desktop",
    tint: "#dfe5ee",
    icon: Monitor,
    pinned: true,
    target: { kind: "route", href: "/panel" },
  },
  {
    id: "auth",
    name: "Enter",
    detail: "The authentication gate of the OS",
    tint: "#4cc2ff",
    icon: LogIn,
    pinned: false,
    target: { kind: "route", href: "/auth" },
  },
  {
    id: "argan",
    name: "Argan",
    detail: "DNS and gateway library of the OS",
    tint: "#10b981",
    icon: Shield,
    iconset: "argan",
    pinned: true,
    target: { kind: "external", slug: "argan" },
  },
  {
    id: "cadria",
    name: "Cadria",
    detail: "Video, image and 3D studio",
    tint: "#f472b6",
    icon: Clapperboard,
    iconset: "cadria",
    pinned: true,
    target: { kind: "external", slug: "cadria" },
  },
  {
    id: "debonair",
    name: "Debonair",
    detail: "The OS audio DAW",
    tint: "#a78bfa",
    icon: AudioLines,
    iconset: "debonair",
    pinned: true,
    target: { kind: "external", slug: "debonair" },
  },
  {
    id: "stealthhead",
    name: "StealHead",
    detail: "The OS FPS platform",
    tint: "#f87171",
    icon: Crosshair,
    iconset: "stealthhead",
    pinned: true,
    target: { kind: "external", slug: "stealhead" },
  },
  {
    id: "forge",
    name: "Forge",
    detail: "The family forge",
    tint: "#fb923c",
    icon: Hammer,
    iconset: "forge",
    pinned: false,
    target: { kind: "external", slug: "forge" },
  },
  {
    id: "foundry",
    name: "Foundry",
    detail: "The family foundry",
    tint: "#d97706",
    icon: Factory,
    iconset: "foundry",
    pinned: false,
    target: { kind: "external", slug: "foundry" },
  },
  {
    id: "vault",
    name: "Vault",
    detail: "The family vault",
    tint: "#eab308",
    icon: Vault,
    iconset: "vault",
    pinned: false,
    target: { kind: "external", slug: "vault" },
  },
  {
    id: "getry",
    name: "Getry",
    detail: "The family registry",
    tint: "#60a5fa",
    icon: Boxes,
    iconset: "getry",
    pinned: false,
    target: { kind: "external", slug: "getry" },
  },
  {
    id: "saddle",
    name: "Saddle",
    detail: "The sandbox engine",
    tint: "#d6b483",
    icon: Box,
    iconset: "saddle",
    pinned: false,
    target: { kind: "external", slug: "saddle" },
  },
];

/** The apps pinned to the Start menu grid, in catalog order. */
export const PINNED_APPS: DesktopApp[] = DESKTOP_APPS.filter((app) => app.pinned);

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
