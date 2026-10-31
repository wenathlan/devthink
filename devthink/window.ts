/**
 * window.ts — the pure window logic of the os (root layer): what a window
 * is, which apps open as windows and the spawn geometry each opens at. No
 * react, no anchors, no components — the component binding rides the
 * workspace (Sol/panel/workspace.tsx, the only consumer) and the labels and
 * the spawn geometry ride the catalog db (osAppLabels()/osAppWindows() from
 * catalog.ts, the reviewed seeds serving offline). This syntax serves any
 * app, any subapp, any deploy unit without a code change.
 */
import { osAppWindows } from "./catalog.ts";

/** One windowed app of the catalog: where the body comes from — an anchor
 * of the theme (kind "anchor") or a family application riding its
 * repository subpath (kind "family"). No presentation values here. */
export type WindowEntry = {
  kind: "anchor" | "family";
  /** the family deploy unit slug (kind "family" only) */
  slug?: string;
};

/** the windowed anchors of the os (structure, not info) */
export const WINDOW_ANCHORS: readonly string[] = [
  "chat",
  "files",
  "calculator",
  "docs",
  "image",
  "games",
  "console",
  "usage",
  "settings",
  "projects",
  "audio",
  "video",
  "providers",
  "gateway",
];

/** the family applications: the deploy units of the one family, each riding
 * its own repository subpath inside the window (the power clip) */
export const FAMILY_SLUGS: readonly string[] = [
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

/** builds the family rows of the catalog (pure, exported for the theme
 * binding and the unit tests) */
export function familyentries(): Record<string, WindowEntry> {
  const rows: Record<string, WindowEntry> = {};
  for (const slug of FAMILY_SLUGS) {
    rows[slug] = { kind: "family", slug };
  }
  return rows;
}

/** the full catalog: the anchors plus the family rows */
export function windowcatalog(): Record<string, WindowEntry> {
  const rows: Record<string, WindowEntry> = {};
  for (const id of WINDOW_ANCHORS) {
    rows[id] = { kind: "anchor" };
  }
  return { ...rows, ...familyentries() };
}

/** the spawn geometry of the window frames — the values the catalog
 * database now serves (the seedOsAppWindows rows, the offline answer of the
 * static build; the paired endpoint serves the same shape over HTTPS); the
 * root logic reads them because a spawn is window structure, never
 * presentation */
export type WindowSpawn = { width: number; height: number };

/** the spawn every windowed app answers when the catalog carries no row
 * for it (the default frame of the os) — the 1280x800 desktop band so
 * the family windows open wide enough for the 961px+ breakpoints their
 * standalone design answers at the direct url (the window-era law: the
 * same design inside the window, only the screen space may clamp it) */
const DEFAULT_SPAWN: WindowSpawn = { width: 1280, height: 800 };

/** the spawn of one windowed app: the geometry row the catalog serves when
 * one answers, the default otherwise */
export function windowspawn(id: string): WindowSpawn {
  const row = osAppWindows()[id];
  return row === undefined ? DEFAULT_SPAWN : { width: row.width, height: row.height };
}

/** Reads one windowed app entry by id, or undefined when the app still
 * navigates as a full page. */
export function windowapp(id: string): WindowEntry | undefined {
  return windowcatalog()[id];
}

/* ============================================================================
 * @section spawnfit — the opening verdict against the screen
 * ========================================================================== */

/** the viewport the os measures when a window opens (innerWidth x
 * innerHeight of the browser — the caller divides by the interface zoom
 * first when one paints the panel root: the verdict answers css pixels
 * and a zoomed root renders each one wider) */
export type SpawnViewport = { width: number; height: number };

/** the opening verdict of one windowed app: the floating bounds clamped
 * to the desktop band, or the full snap when the design band the app
 * answers cannot fit the screen. the window-era law: one design, the
 * space clamps — a family app opened below its 1280x800 band answers the
 * narrow-tree design inside the window while the direct url answers the
 * wide one (the cut-window bug of PR12), so when the screen cannot carry
 * the band the window opens already maximized and the app answers the
 * viewport the direct url answers. the anchors stay floating: their
 * bodies carry the embedded contract and clamp honestly. */
export type SpawnFit = {
  /** true when the window opens already maximized (snap full) */
  maximized: boolean;
  /** the floating bounds the snapshot keeps for the restore */
  width: number;
  height: number;
  /** the desktop band the verdict measured (css px) — the caller places
   * the cascade against the same band, never re-derives it */
  desktopWidth: number;
  desktopHeight: number;
};

/** the bottom taskbar band of the desktop — the --shell-bottom measure
 * the .shell-desktop height derives from */
export const DESKTOP_TASKBAR = 48;
/** the top offset the spawn cascade starts at */
export const SPAWN_TOP_OFFSET = 26;
/** the gutter a floating spawn keeps from the desktop edges (8px a side) */
const SPAWN_GUTTER = 16;
/** the breathing the band fit asks under the spawn */
const SPAWN_BREATH = 6;
/** the portrait floor — a floating window never opens under the frame
 * minimum the resize handles enforce */
const SPAWN_FLOOR_WIDTH = 320;
const SPAWN_FLOOR_HEIGHT = 300;

/** the opening verdict of one windowed app against the screen: the
 * floating bounds clamped to the desktop band (the width by the gutter,
 * the height by the cascade offset), and the maximized verdict for the
 * family rows whose band does not fit — the width plus the gutter and
 * the height plus the offset and the breathing (the 1280x800 band asks
 * 1296x~880 of the viewport), the same .shell-desktop band the os paints
 * (the viewport width over the viewport height minus the taskbar). */
export function spawnfit(id: string, viewport: SpawnViewport): SpawnFit {
  const spawn = windowspawn(id);
  const desktopWidth = Math.max(0, viewport.width);
  const desktopHeight = Math.max(0, viewport.height - DESKTOP_TASKBAR);
  const bandFits =
    desktopWidth >= spawn.width + SPAWN_GUTTER && desktopHeight >= spawn.height + SPAWN_TOP_OFFSET + SPAWN_BREATH;
  return {
    maximized: windowapp(id)?.kind === "family" && !bandFits,
    width: Math.min(spawn.width, Math.max(SPAWN_FLOOR_WIDTH, desktopWidth - SPAWN_GUTTER)),
    height: Math.max(SPAWN_FLOOR_HEIGHT, Math.min(spawn.height, desktopHeight - SPAWN_TOP_OFFSET)),
    desktopWidth,
    desktopHeight,
  };
}
