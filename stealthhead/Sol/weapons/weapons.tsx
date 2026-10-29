/**
 * weapons page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * weapons — the in-construction pass: the game is in development, so the
 * armory ledger of the old face (the specimen rows, the stat meters, the
 * featured top-damage tile) is retired and the route answers the honest
 * construction face under the weapons eyebrow. The root armory logic the
 * ledger read keeps riding its own files untouched — only this page's face
 * changed.
 */

import { label } from "../../labels";
import { Constructionface } from "../widgets";

/**
 * the weapons page: the in-construction face under the weapons eyebrow.
 *
 * @returns the construction face element.
 */
export default function Weapons() {
  return <Constructionface eyebrow={label("weapons.eyebrow")} />;
}
