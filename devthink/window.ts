/**
 * window.ts — the pure window logic of the os (root layer): what a window
 * is, which apps open as windows and the spawn geometry each opens at. No
 * react, no anchors, no components — the component binding rides the
 * workspace (Sol/panel/workspace.tsx, the only consumer) and the labels
 * ride the catalog db. The spawns are window logic, so they live here with
 * the catalog: this syntax serves any app, any subapp, any deploy unit
 * without a code change.
 */

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

/** the spawn geometry of the window frames — the same values the database
 * serves once the label table lands; the root logic owns them because a
 * spawn is window structure, never presentation */
export type WindowSpawn = { width: number; height: number };

const DEFAULT_SPAWN: WindowSpawn = { width: 900, height: 640 };
const SPAWN_OVERRIDES: Record<string, WindowSpawn> = {
  calculator: { width: 520, height: 660 },
  chat: { width: 1040, height: 720 },
  docs: { width: 980, height: 680 },
  console: { width: 980, height: 680 },
  settings: { width: 960, height: 680 },
  video: { width: 960, height: 680 },
};

/** the spawn of one windowed app: the declared override when one answers,
 * the default otherwise */
export function windowspawn(id: string): WindowSpawn {
  return SPAWN_OVERRIDES[id] ?? DEFAULT_SPAWN;
}

/** Reads one windowed app entry by id, or undefined when the app still
 * navigates as a full page. */
export function windowapp(id: string): WindowEntry | undefined {
  return windowcatalog()[id];
}
