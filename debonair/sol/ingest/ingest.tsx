/**
 * ingest page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * ingest — the detailed engine wave (the owner order of the waves, landed):
 * the decomposition bench rides the real engine lanes again — the
 * IngestSurface composite winget (one mount: the dropzone, the phase meter
 * of the engine's own walk, the document summary the engine answers, the
 * store key over the gateway/mirror lanes and the shelf of the ingest
 * records) answers the route inside the same app shell, with the
 * construction face carried as its arming face (the first paint before
 * the shelf read lands). The engine lanes the bench rode (ingest,
 * kathesis, playerbus, wavwriter) keep riding their own files untouched —
 * only this page's mount changed, nothing was deleted.
 */

import { label } from "../../labels.ts";
import { Constructionface, IngestSurface } from "../../wingets";
import { type NavLink, Shell } from "../shell/Shell.tsx";

/**
 * the ingest page: the real decomposition bench under the ingest eyebrow.
 *
 * @returns the app shell with the bench mount.
 */
export default function Ingest() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.generate"), href: "/generate" },
    { label: label("nav.settings"), href: "/settings" },
  ];

  return (
    <Shell name="debonair" contained footerLinks={FOOTER_LINKS} domain="devthink.pro">
      {/* the bench mount rides the real engine; the construction face it
          wore answers the arming beat — the first paint before the shelf
          read lands (never a fake document, never a dead bench) */}
      <IngestSurface face={<Constructionface eyebrow={label("ingest.eyebrow")} />} />
    </Shell>
  );
}
