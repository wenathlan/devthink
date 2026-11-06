/**
 * generate page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * generate — the in-construction pass (the owner order of the waves, pinned):
 * the detailed engine wave builds the debonair later, with the time its
 * engines, protocols and processes deserve, so the composer loop of the old
 * face (the prompt bench, the take queue, the lyric desk) is retired and the
 * route answers the honest construction face under the generate eyebrow,
 * inside the same app shell (the rail and the transport stay). The engine
 * logics the loop rode (arrangement, composer, genrematrix, playerbus, seed)
 * keep riding their own files untouched — only this page's face changed,
 * nothing was deleted.
 */

import { label } from "../../labels.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { Constructionface } from "../wingets";

/**
 * the generate page: the in-construction face under the generate eyebrow.
 *
 * @returns the app shell with the construction face.
 */
export default function Generate() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.library"), href: "/library" },
    { label: label("nav.settings"), href: "/settings" },
  ];

  return (
    <Shell name="debonair" contained footerLinks={FOOTER_LINKS} domain="devthink.pro">
      <Constructionface eyebrow={label("generate.eyebrow")} />
    </Shell>
  );
}
