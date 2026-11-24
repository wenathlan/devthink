/**
 * labels.ts — every interface string lives in the label store, the widgets
 * and page anchors read through this typed accessor, and a hardcoded string
 * inside a widget is a defect. the manifest below is the english source of
 * truth for the honest under-construction face of pulse — the twelfth
 * module of the wenathlan family, the open voice-first social studio that
 * will own the 24/7 social automation and channel management lane (X,
 * Instagram through the official Graph API, Facebook, YouTube) for humans
 * and agent swarms on the family VMs; the seed ingests it into the labels
 * store (the site db through db.ts on the server, the browser rows cache
 * in the visitor machine) and the seed never overwrites a translated row.
 *
 * the browser never imports db.ts (better-sqlite3 cannot ride the static
 * bundle): the type comes across erased, the browser seed mirrors the rows
 * into the local rows cache of the visitor machine.
 *
 * the design is frozen by the owner's construction law: the studio is in
 * construction, the surface is the one under-construction component, and
 * the store speaks only the construction voice — no channel names, no
 * automation promises, no growth metrics, zero invented copy beyond the
 * one honest line the face renders.
 */

import { createLabelStore } from "@wenathlan/vault/labelstore";

/** the label revision of the manifest: bump on every copy wave so the seed
 * refreshes the store rows of the changed strings. */
export const LABELREVISION = 1;

/** the english manifest: the page.widget.key path answers the surface text.
 * every entry is the verbatim string the widgets of the honest face render
 * — zero invented copy. */
export const LABELMANIFEST = {
  // the app boundary (app.tsx, the boot anchor)
  "app.boundary.body": "pulse could not render this frame.",
  "app.boundary.reload": "reload the interface",
  // the studio identity row (the name the drawn mark speaks to screen
  // readers — the glyph itself is aria-hidden)
  "pulse.name": "pulse",
  // the under-construction face (the one component of the surface)
  "pulse.construction.aria": "pulse is in construction",
  "pulse.construction.title": "pulse",
  "pulse.construction.status": "in construction",
  "pulse.construction.note": "The voice-first social studio is in construction.",
  // the drawn voice waveform (the hologram behind the face panel — the svg
  // title rides the store)
  "voicewave.title": "voice waveform",
} as const;

export type LabelKey = keyof typeof LABELMANIFEST & string;

/** the store mechanism rides the vault factory (the storage law of the
 * family: the vault owns the store, the app owns the manifest — the
 * mechanism is imported, never duplicated). the cache key keeps the browser mirror the widgets already read. */
const store = createLabelStore({
  manifest: LABELMANIFEST,
  revision: LABELREVISION,
  cacheKey: "pulse.labels.rows",
});

/** the typed accessor of the copy: the only door a widget or page anchor uses. */
export function label(key: LabelKey): string {
  return store.label(key);
}

/** the copy door of the studio seat: the plain alias the pulse mission
 * validates the store through (the same mechanism, the same manifest — a
 * second door onto the one accessor, never a second store). */
export function copy(key: LabelKey): string {
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
