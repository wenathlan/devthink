/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * home — the in-construction pass (the owner order of the waves, pinned):
 * the detailed engine wave builds the cadria later, with the time its
 * engines, protocols and processes deserve, so the greeting home of the old
 * face (the hour greeting, the generation entry, the recent strip the
 * gateway answered, the quick links) is retired and the route answers the
 * honest construction face behind the same entry gate. The first-run flow
 * (intro with its real demo chain, onboarding) rides exactly as it was and
 * the gateway seam the strip read keeps riding its own file untouched —
 * only this page's face changed, nothing was deleted. the anchor renders
 * BARE: the one Shell chrome lives in sol/Sol.tsx.
 */

import { label } from "../../labels.ts";
import { Constructionface, HomeEntrygate as EntryGate } from "../../wingets";

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
