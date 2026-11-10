/**
 * gallery page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * gallery — the detailed engine wave (the owner order of the waves,
 * landed): the render wall rides the real gateway lane again — the
 * GalleryWall composite winget (one mount: the style chips from the
 * imagestyles table, the generations of listGatewayProjects, the
 * per-item renderSvg thumbnails and the honest deletes) answers the route
 * with the construction face carried as its arming face. The engine
 * logics the wall rode (gateway, image) never left their own files. the
 * anchor renders BARE: the one Shell chrome lives in sol/Sol.tsx.
 */

import { label } from "../../labels.ts";
import { Constructionface, GalleryWall } from "../../wingets";

/**
 * the gallery page: the real render wall under the gallery eyebrow.
 *
 * @returns the wall element with its arming face.
 */
export default function Gallery() {
  return <GalleryWall face={<Constructionface eyebrow={label("gallery.eyebrow")} />} />;
}
