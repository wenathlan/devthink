/**
 * steps.tsx — the loose step content of the onboarding tour (beside the
 * anchor, no subfolders). Each step is one frame of the window-grammar tour:
 * the art card, the heading and the two-line body. The copy is honest
 * lowercase fragments within the frame budget: what the OS is, the explore
 * floor, the panel/auth path and the MCP opt-in. The art rides the AppTile
 * registry (the same tiles the taskbar pins) so the tour shows the real
 * surface it names, seated on a trylle card — stepped surface, ring, Linear
 * shadow — that rises with the frame's beat stagger (the anchor owns the
 * motion; this file only marks the beat).
 */

import { SolLogoMark } from "../panel/logo.tsx";
import { DESKTOP_APPS, type DesktopApp } from "../../appregistry.ts";
import { AppTile } from "../shell/apptile.tsx";

/** One frame of the tour: art + heading + body. */
export type onboardingstep = {
  /** the lowercase mono caption above the heading */
  eyebrow: string;
  /** the sentence-case heading of the frame */
  title: string;
  /** the two-line body of the frame */
  body: string;
  /** the registry app id the art tile renders (null = the OS mark) */
  app: string | null;
};

/** The four frames of the tour, in walk order. */
export const ONBOARDING_STEPS: readonly onboardingstep[] = [
  {
    eyebrow: "the os",
    title: "One OS, many apps",
    body: "devthink is the family os — sibling apps open as windows inside it, pinned to the taskbar.",
    app: null,
  },
  {
    eyebrow: "explore",
    title: "Explore is the free floor",
    body: "the catalog at /explore — every family app answers without an account.",
    app: "explore",
  },
  {
    eyebrow: "auth, then panel",
    title: "Auth opens the panel",
    body: "one identity signs everything — /auth hands the session to /panel: chat, projects, studios.",
    app: "panel",
  },
  {
    eyebrow: "mcp",
    title: "MCP is opt-in",
    body: "register an mcp endpoint only when you want one — nothing connects without its probe.",
    app: "settings",
  },
] as const;

/** the Linear shadow with its ring, on the art card of every frame */
const ART_SHADOW = "0 0 0 1px rgb(0 0 0 / 24%), 0 1px 2px rgb(0 0 0 / 20%), 0 3px 12px rgb(0 0 0 / 9%)";

/**
 * Resolves the registry app one step names.
 *
 * @param app the registry id of the step (null = the OS mark).
 * @returns the desktop app entry, or null when the step carries the mark.
 */
export function stepapp(app: string | null): DesktopApp | null {
  if (!app) return null;
  return DESKTOP_APPS.find((entry) => entry.id === app) ?? null;
}

/**
 * StepArt — the art zone of one frame: the real tile of the named surface
 * (or the OS mark), seated on a trylle card. The card carries the
 * data-frame-beat mark the anchor's stagger reads; no motion lives here.
 *
 * @param props app the registry id, index the step index.
 * @returns the art card of the frame.
 */
export function StepArt(props: { app: string | null; index: number }): React.JSX.Element {
  const app = stepapp(props.app);
  return (
    <div data-frame-beat className="ob-artcard" style={{ boxShadow: ART_SHADOW }}>
      {app ? <AppTile app={app} size={72} label={app.name} /> : <SolLogoMark size={72} accent />}
    </div>
  );
}
