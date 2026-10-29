/**
 * ranking page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * ranking — the in-construction pass: the game is in development, so the
 * ladder ledger of the old face (the podium, the season scoreboard, the
 * season rail) is retired and the route answers the honest construction
 * face under the ranking eyebrow. The root ranking logic the ledger read
 * keeps riding its own files untouched — only this page's face changed.
 */

import { label } from "../../labels";
import { Constructionface } from "../widgets";

/**
 * the ranking page: the in-construction face under the ranking eyebrow.
 *
 * @returns the construction face element.
 */
export default function Ranking() {
  return <Constructionface eyebrow={label("ranking.eyebrow")} />;
}
