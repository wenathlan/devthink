/**
 * labels.ts — every interface string lives in the label store, the wingets
 * and page anchors read through this typed accessor, and a hardcoded string
 * inside a widget is a defect. the manifest below is the english source of
 * truth extracted from the real strings of the Sol wingets and the
 * under-construction face; the seed ingests it into the labels store (the
 * site db through db.ts on the server, the browser rows cache in the
 * visitor machine) and the seed never overwrites a translated row.
 *
 * the browser never imports db.ts (better-sqlite3 cannot ride the static
 * bundle): the type comes across erased, the browser seed mirrors the rows
 * into the local rows cache of the visitor machine.
 *
 * the design is frozen: the manifest carries the verbatim strings the
 * wingets rendered before the copy wave — the exact same text renders,
 * only its source becomes the accessor. the game seats of the old pass
 * (the lobby rows, the seat handles, the weapon kinds, the world asset
 * paths, the route hrefs) retired with the pages: the game is in
 * construction, the surface is the one under-construction component, and
 * the store speaks only the construction voice.
 */

import { createLabelStore } from "@wenathlan/vault/labelstore";

/** the label revision of the manifest: bump on every copy wave so the seed
 * refreshes the store rows of the changed strings. */
export const LABELREVISION = 4;

/** the english manifest: the page.widget.key path answers the surface text.
 * every entry is the verbatim string the wingets and page anchors rendered
 * before the copy wave — zero invented copy. */
export const LABELMANIFEST = {
  // the app boundary (App.tsx, the boot anchor)
  "app.boundary.body": "stealthhead could not render this frame.",
  "app.boundary.reload": "reload the interface",
  // the under-construction face (the one component of the surface)
  "construction.aria": "stealthhead is in construction",
  "construction.title": "stealthhead",
  "construction.status": "in construction",
  "construction.subtitle": "The FPS platform is in construction.",
  // the drawn scope reticle (the hologram behind the face panel — the svg
  // title rides the store)
  "home.scope.title": "scope reticle",
} as const;

export type LabelKey = keyof typeof LABELMANIFEST & string;

/** the store mechanism rides the vault factory (the storage law of the
 * family: the vault owns the store, the app owns the manifest — the
 * mechanism is imported, never duplicated). the cache key keeps the browser mirror the wingets already read. */
const store = createLabelStore({
  manifest: LABELMANIFEST,
  revision: LABELREVISION,
  cacheKey: "stealthhead.labels.rows",
});

/** the typed accessor of the copy: the only door a widget or page anchor uses. */
export function label(key: LabelKey): string {
  return store.label(key);
}

/** the placeholder door: fills the {token} slots of one format key with the
 * runtime values (the store keeps the sentence, the widget passes the data). */
export function labelfill(key: LabelKey, values: Record<string, string>): string {
  return store.labelfill(key, values);
}

/** the seed ingests the manifest into the labels store, idempotent, and the
 * translated rows stay protected from the overwrite. in the browser the rows
 * ride the local cache of the site db; on the server db.ts seeds the same
 * manifest into the labels table through seedLabelRows. */
export function seedlabels(): Promise<{ seeded: number; protected: number }> {
  return store.seedLabels();
}
