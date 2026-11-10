/**
 * player page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * player — the detailed engine wave (the owner order of the waves,
 * landed): the disc player rides the real engine lanes again — the
 * PlayerViewer composite winget (one mount: the stored frame viewer over
 * the gateway read and the demo compute, the offline wall) answers the
 * route with the construction face carried as its arming face. The
 * engine logics the player rode (gateway, image, video) never left their
 * own files. the anchor renders BARE: the one Shell chrome lives in
 * sol/Sol.tsx.
 */

import { label } from "../../labels.ts";
import { Constructionface, PlayerViewer } from "../../wingets";

/**
 * the player page: the real artwork viewer under the player eyebrow.
 *
 * @returns the viewer element with its arming face.
 */
export default function Player() {
  return <PlayerViewer face={<Constructionface eyebrow={label("player.eyebrow")} />} />;
}
