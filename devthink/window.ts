/**
 * window.ts — the pure window logic of the os (root layer): what a window
 * is, which apps open as windows and the spawn geometry each one boots at.
 * No react, no anchors, no component binding — the theme layer
 * (Sol/windowregistry.tsx) reads this catalog and binds the anchor
 * components; every surface (desktop, start rail, deep routes) asks this
 * module and every subapp inherits the window contract from one syntax.
 */

/** One windowed app of the catalog: the spawn geometry the frame opens at
 * and where the body comes from — an anchor of the theme (kind "anchor")
 * or a family application riding its repository subpath (kind "family"). */
export type WindowEntry = {
  kind: "anchor" | "family";
  /** the family deploy unit slug (kind "family" only) */
  slug?: string;
  spawn: { width: number; height: number };
};

/** the spawn geometry of every windowed app: the anchors of the os and the
 * family deploy units — one table, one syntax, no hardcoding at the call
 * sites */
export const WINDOW_CATALOG: Record<string, WindowEntry> = {
  calculator: { kind: "anchor", spawn: { width: 520, height: 660 } },
  docs: { kind: "anchor", spawn: { width: 980, height: 680 } },
  image: { kind: "anchor", spawn: { width: 900, height: 640 } },
  games: { kind: "anchor", spawn: { width: 900, height: 640 } },
  console: { kind: "anchor", spawn: { width: 980, height: 680 } },
  usage: { kind: "anchor", spawn: { width: 900, height: 640 } },
  settings: { kind: "anchor", spawn: { width: 960, height: 680 } },
  projects: { kind: "anchor", spawn: { width: 900, height: 640 } },
  audio: { kind: "anchor", spawn: { width: 900, height: 640 } },
  video: { kind: "anchor", spawn: { width: 960, height: 640 } },
};

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
    rows[slug] = { kind: "family", slug, spawn: { width: 980, height: 680 } };
  }
  return rows;
}

/** the full catalog: the anchors plus the family rows */
export function windowcatalog(): Record<string, WindowEntry> {
  return { ...WINDOW_CATALOG, ...familyentries() };
}

/** Reads one windowed app entry by id, or undefined when the app still
 * navigates as a full page. */
export function windowapp(id: string): WindowEntry | undefined {
  return windowcatalog()[id];
}
