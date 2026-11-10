/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * home — the detailed engine wave (the owner order of the waves, landed):
 * the greeting home rides the real gateway strip again — the HomeSurface
 * composite winget (one mount: the hour greeting, the generation entry,
 * the recent-generations strip of listGatewayProjects, the quick links)
 * answers the route behind the same entry gate, with the construction
 * face carried as its arming face (the first paint before the gateway
 * read lands). The first-run flow (intro with its real demo chain,
 * onboarding) rides exactly as it was and the gateway seam the strip read
 * keeps riding its own file untouched. the anchor renders BARE: the one
 * Shell chrome lives in sol/Sol.tsx.
 */

import { label } from "../../labels.ts";
import { Constructionface, HomeEntrygate as EntryGate, HomeSurface } from "../../wingets";

/**
 * the home anchor: the entry gate decides first (intro unseen hands to
 * /intro, onboarding unseen hands to /onboarding, null renders while the
 * state resolves) and the real surface mounts only behind a finished
 * flow.
 *
 * @returns the gated home surface element.
 */
export default function Home() {
  return (
    <EntryGate>
      <HomeSurface face={<Constructionface eyebrow={label("home.eyebrow")} />} />
    </EntryGate>
  );
}
