/**
 * windowregistry.tsx — the component binding of the window logic (the
 * theme-anchor layer). The pure catalog lives at the root (window.ts): what
 * a window is, which apps open as windows and the spawn geometry. This
 * sibling of Sol.tsx binds the catalog rows to their anchor components —
 * the only react-aware edge — and answers the same windowapp() lookup the
 * workspace consumes. The deep routes of Sol.tsx stay untouched: a window
 * app still answers its own route as a full page (deep links, the taskbar
 * fallback), while the desktop opens it in place with the embedded contract
 * (no taskbar, no hero inside the frame).
 */
import type { ComponentType } from "react";
import { type WindowEntry, windowcatalog } from "../window.ts";
import Audio from "./audio/audio.tsx";
import Calculator from "./calculator/calculator.tsx";
import Console from "./console/console.tsx";
import Docs from "./docs/docs.tsx";
import Games from "./games/games.tsx";
import Image from "./image/image.tsx";
import Projects from "./projects/projects.tsx";
import Settings from "./settings/settings.tsx";
import { FamilyFrame } from "./shell/familyframe.tsx";
import Usage from "./usage/usage.tsx";
import Video from "./video/video.tsx";

/** One windowed app: the anchor component with the embedded contract and
 * the spawn geometry the frame opens at. */
export type WindowApp = {
  component: ComponentType<{ embedded?: boolean }>;
  spawn: { width: number; height: number };
};

/** the anchor components of the catalog, by app id */
const ANCHORS: Record<string, ComponentType<{ embedded?: boolean }>> = {
  calculator: Calculator,
  docs: Docs,
  image: Image,
  games: Games,
  console: Console,
  usage: Usage,
  settings: Settings,
  projects: Projects,
  audio: Audio,
  video: Video,
};

/** binds one catalog row to its component: the anchors bind by id, the
 * family rows bind to the power clip frame of their subpath */
function bindentry(id: string, entry: WindowEntry): WindowApp {
  if (entry.kind === "family") {
    const slug = entry.slug ?? id;
    return { component: () => <FamilyFrame slug={slug} title={slug} />, spawn: entry.spawn };
  }
  const anchor = ANCHORS[id];
  if (!anchor) {
    return { component: () => null, spawn: entry.spawn };
  }
  return { component: anchor, spawn: entry.spawn };
}

/** The windowed apps of the desktop: the pure root catalog with the
 * components bound. The chat window stays bespoke inside the workspace (its
 * session body is the chat subapp). */
export const WINDOW_APPS: Record<string, WindowApp> = Object.fromEntries(
  Object.entries(windowcatalog()).map(([id, entry]) => [id, bindentry(id, entry)]),
);

/** Reads one windowed app by id, or undefined when the app still navigates. */
export function windowApp(id: string): WindowApp | undefined {
  return WINDOW_APPS[id];
}
