/**
 * windowregistry.tsx — the window catalog of the desktop (theme-anchor
 * layer). The panel layer never imports the page anchors directly (the
 * anchor law: only Sol.tsx consumes them), so this sibling of Sol.tsx is
 * the ONE lawful bridge: it maps every app that opens as a floating window
 * to its anchor component and its spawn geometry. The deep routes of
 * Sol.tsx stay untouched — a window app still answers its own route as a
 * full page (deep links, the taskbar fallback), while the desktop opens it
 * in place with the embedded contract (no taskbar, no hero inside the
 * frame).
 */
import type { ComponentType } from "react";
import Audio from "./audio/audio.tsx";
import Calculator from "./calculator/calculator.tsx";
import Console from "./console/console.tsx";
import Docs from "./docs/docs.tsx";
import Games from "./games/games.tsx";
import Image from "./image/image.tsx";
import Projects from "./projects/projects.tsx";
import Routes from "./routes/routes.tsx";
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

/** The windowed apps of the desktop. The chat window stays bespoke inside
 * the workspace (its session body is the chat subapp); this registry grows
 * as each subapp inherits the window contract. */
export const WINDOW_APPS: Record<string, WindowApp> = {
  calculator: { component: Calculator, spawn: { width: 520, height: 660 } },
  docs: { component: Docs, spawn: { width: 980, height: 680 } },
  image: { component: Image, spawn: { width: 900, height: 640 } },
  games: { component: Games, spawn: { width: 900, height: 640 } },
  console: { component: Console, spawn: { width: 980, height: 680 } },
  usage: { component: Usage, spawn: { width: 900, height: 640 } },
  settings: { component: Settings, spawn: { width: 960, height: 680 } },
  projects: { component: Projects, spawn: { width: 900, height: 640 } },
  routes: { component: Routes, spawn: { width: 860, height: 640 } },
  audio: { component: Audio, spawn: { width: 900, height: 640 } },
  video: { component: Video, spawn: { width: 960, height: 640 } },
};

/** Reads one windowed app by id, or undefined when the app still navigates. */
export function windowApp(id: string): WindowApp | undefined {
  return WINDOW_APPS[id];
}

/** the family applications: the deploy units of the one family, each riding
 * its own repository subpath inside the window (the power clip). The ids
 * match the appregistry rows, so the desktop, the start rail and the deep
 * routes open them like every other window app. */
const FAMILY_SLUGS: readonly string[] = [
  "saddle",
  "argan",
  "cadria",
  "debonair",
  "stealthhead",
  "forge",
  "foundry",
  "vault",
  "getry",
  "cobaia",
];
for (const slug of FAMILY_SLUGS) {
  WINDOW_APPS[slug] = {
    component: () => <FamilyFrame slug={slug} title={slug} />,
    spawn: { width: 980, height: 680 },
  };
}
