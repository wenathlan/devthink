/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 *
 * home — the in-construction pass: the game is in development, so the
 * cinematic landing of the old face (the scope stage, the featured board,
 * the domain ledger, the meta-quad) is retired and the route answers the
 * honest construction face behind the same entry gate. The first-run flow
 * (intro, onboarding) and the shell rail stay exactly as they were — the
 * root match logic the landing read keeps riding its own files, only this
 * page's face changed.
 */

import { label } from "../../labels";
import { Constructionface, EntryGate } from "../wingets";

/**
 * the home anchor: the entry gate decides first (intro unseen hands to
 * /intro, onboarding unseen hands to /onboarding, null renders while the
 * state resolves) and the construction face mounts only behind a finished
 * flow.
 *
 * @returns the gated construction face element.
 */
export default function Home() {
  return (
    <EntryGate>
      <Constructionface eyebrow={label("home.eyebrow")} />
    </EntryGate>
  );
}
