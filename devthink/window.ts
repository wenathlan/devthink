/**
 * window.ts — the pure window logic of the os (root layer): what a window
 * is and which apps open as windows. No react, no anchors, no presentation
 * info — the spawns, the labels and every per-app value live in the theme
 * layer and the database, never here: this syntax serves any app, any
 * subapp, any deploy unit without a code change. The theme layer
 * (Sol/windowregistry.tsx) binds the components and the presentation; the
 * labels ride the catalog db.
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

/** Reads one windowed app entry by id, or undefined when the app still
 * navigates as a full page. */
export function windowapp(id: string): WindowEntry | undefined {
  return windowcatalog()[id];
}
