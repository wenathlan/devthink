/**
 * gallery page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * gallery — the in-construction pass (the owner order of the waves, pinned):
 * the detailed engine wave builds the cadria later, with the time its
 * engines, protocols and processes deserve, so the render wall of the old
 * face (the style chips, the generations the gateway answered) is retired
 * and the route answers the honest construction face under the gallery
 * eyebrow. The engine logics the wall rode (gateway, image) keep riding
 * their own files untouched — only this page's face changed, nothing was
 * deleted. the anchor renders BARE: the one Shell chrome lives in
 * sol/Sol.tsx.
 */

import { label } from "../../labels.ts";
import { Constructionface } from "../../wingets";

/**
 * the gallery page: the in-construction face under the gallery eyebrow.
 *
 * @returns the construction face element.
 */
export default function Gallery() {
  return <Constructionface eyebrow={label("gallery.eyebrow")} />;
}
