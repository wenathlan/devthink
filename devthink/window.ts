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
 * for it (the default frame of the os) */
const DEFAULT_SPAWN: WindowSpawn = { width: 900, height: 640 };

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
