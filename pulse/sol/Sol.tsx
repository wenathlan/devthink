/**
 * Sol theme anchor — layer 2 of the anchor architecture.
 * The file carrying the theme folder's own name (sol/Sol.tsx, beside
 * sol/sol.css) is the path manager of the theme: app.tsx consumes only this
 * file and the theme stylesheet; no component of the theme is ever imported
 * outside this layer. The owner's law rides the theme (the stealthhead
 * precedent): the voice-first social studio is in construction — clean
 * everything, leave ONE component saying "studio in construction" — so the
 * theme mounts the under-construction face alone: the route table, the
 * application shell, the entry flow (intro, onboarding) and the studio page
 * anchors of the future pass (the channel boards, the swarm mission rail,
 * the cut studio) are not seated yet. The studio's logics stay unseeded at
 * the app root — the channel automation, the static mission distribution
 * without collision and the viralization engineering arrive with the day
 * the studio wakes up; the surface imports none of them and none exist to
 * import (the honest scaffold: zero invented automation logic).
 */
import { Constructionface } from "../widgets";

/** The one surface of the theme: the under-construction face, full-bleed on
 * every path — there is no route table, only the face. */
export default function Sol() {
  return <Constructionface />;
}
