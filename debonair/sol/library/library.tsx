/**
 * library page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * library — the in-construction pass (the owner order of the waves, pinned):
 * the detailed engine wave builds the debonair later, with the time its
 * engines, protocols and processes deserve, so the shelf of the old face
 * (the take cards, the cover art wall, the reference rows) is retired and
 * the route answers the honest construction face under the library eyebrow,
 * inside the same app shell (the rail and the transport stay). The engine
 * logics the shelf rode (arrangement, catalog, dawview, playerbus, seed)
 * keep riding their own files untouched — only this page's face changed,
 * nothing was deleted.
 */

import { label } from "../../labels.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { Constructionface } from "../wingets";

/**
 * the library page: the in-construction face under the library eyebrow.
 *
 * @returns the app shell with the construction face.
 */
export default function Library() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.generate"), href: "/generate" },
    { label: label("nav.settings"), href: "/settings" },
  ];

  return (
    <Shell name="debonair" contained footerLinks={FOOTER_LINKS} domain="devthink.pro">
      <Constructionface eyebrow={label("library.eyebrow")} />
    </Shell>
  );
}
