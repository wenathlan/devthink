/**
 * Sol theme anchor — layer 2 of the anchor architecture.
 * The file carrying the theme folder's own name (sol/Sol.tsx, beside
 * sol/sol.css) is the path manager of the theme: App.tsx consumes only this
 * file and the theme stylesheet; no component of the theme is ever imported
 * outside this layer. The owner's law rides the theme (PR19): the FPS game
 * is in construction — clean everything, leave ONE component saying "game
 * in construction" — so the theme mounts the under-construction face alone:
 * the route table, the application shell, the entry flow (intro,
 * onboarding) and the game page anchors of the old pass are retired. The
 * engine logics of the platform stay preserved in the theme topic folders
 * (hud, match, netcode, physics, ranking, spawner, weapons, world) — the
 * surface imports none of them; the folders keep the logics real for the
 * day the game wakes up.
 */
import { Constructionface } from "./wingets";

/** The one surface of the theme: the under-construction face, full-bleed on
 * every path — there is no route table any more, only the face. */
export default function Sol() {
  return <Constructionface />;
}
