/**
 * world page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * world — the in-construction pass: the game is in development, so the map
 * plate field of the old face (the seamed GLB catalog, the hash-verified
 * zone meta) is retired and the route answers the honest construction face
 * under the world eyebrow. The root world logic the plates read keeps riding
 * its own files untouched — only this page's face changed.
 */

import { label } from "../../labels";
import { Constructionface } from "../widgets";

/**
 * the world page: the in-construction face under the world eyebrow.
 *
 * @returns the construction face element.
 */
export default function World() {
  return <Constructionface eyebrow={label("world.eyebrow")} />;
}
