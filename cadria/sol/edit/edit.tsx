/**
 * edit page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * edit — the detailed engine wave (the owner order of the waves, landed):
 * the DAW-grade timeline rides the real edit algebra again — the
 * EditTimeline composite winget (one mount: the ruler scrub, the slate
 * bin, the split, lift, extract, trim and slide algebra of the timeline
 * engine) answers the route with the construction face carried as its
 * arming face (the first paint before the engine seats land). The engine
 * logics the editor rode (timeline, timeticks, video) never left their
 * own files. the anchor renders BARE: the one Shell chrome lives in
 * sol/Sol.tsx.
 */

import { label } from "../../labels.ts";
import { Constructionface, EditTimeline } from "../../wingets";

/**
 * the edit page: the real timeline under the edit eyebrow.
 *
 * @returns the timeline element with its arming face.
 */
export default function Edit() {
  return <EditTimeline face={<Constructionface eyebrow={label("edit.eyebrow")} />} />;
}
