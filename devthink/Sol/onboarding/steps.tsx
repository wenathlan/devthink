/**
 * steps.tsx — the loose step content of the onboarding tour (beside the
 * anchor, no subfolders). Each step is one frame of the window-grammar tour:
 * the art card, the heading and the two-sentence body. The copy is honest
 * and direct: what the OS is, the explore floor, the panel/auth path and the
 * MCP opt-in. The art rides the AppTile registry (the same tiles the taskbar
 * pins) so the tour shows the real surface it names, seated on a trylle card
 * — stepped surface, ring, Linear shadow — that rises with the frame's beat
 * stagger (the anchor owns the motion; this file only marks the beat).
 */
import { DESKTOP_APPS, type DesktopApp } from "../shell/appregistry.ts";
import { AppTile } from "../shell/apptile.tsx";
import { SolLogoMark } from "../panel/logo.tsx";

/** One frame of the tour: art + heading + body. */
export type onboardingstep = {
  /** the lowercase mono caption above the heading */
  eyebrow: string;
  /** the sentence-case heading of the frame */
  title: string;
  /** the two-sentence body of the frame */
  body: string;
  /** the registry app id the art tile renders (null = the OS mark) */
  app: string | null;
};

/** The four frames of the tour, in walk order. */
export const ONBOARDING_STEPS: readonly onboardingstep[] = [
  {
    eyebrow: "the os",
    title: "One OS, many apps",
    body: "DevThink is the only OS of the family. Argan, forge, vault and the siblings open as windows inside it — pinned to the taskbar, never installed beside it.",
    app: null,
  },
  {
    eyebrow: "explore",
    title: "Explore is the free floor",
    body: "The catalog lives at /explore: the public surface where every app of the family answers without an account. The enter devthink CTA opens the rest.",
    app: "explore",
  },
  {
    eyebrow: "auth → panel",
    title: "Auth opens the panel",
    body: "One identity signs the workbench. /auth hands your session to the desktop at /panel: chat, projects, routes and the studios in one windowed OS.",
    app: "panel",
  },
  {
    eyebrow: "mcp",
    title: "MCP is opt-in",
    body: "The gateway never pre-fills. Register an MCP endpoint only when you want one: the state stays disconnected until you register, and a real reachability probe runs before anything connects.",
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
    <div
      data-frame-beat
      className="grid h-40 w-40 place-items-center rounded-2xl bg-s2 ring-1 ring-hairline"
      style={{ boxShadow: ART_SHADOW }}
    >
      {app ? <AppTile app={app} size={72} label={app.name} /> : <SolLogoMark size={72} accent />}
    </div>
  );
}
