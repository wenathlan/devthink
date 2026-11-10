/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * home — the detailed engine wave (the owner order of the waves, landed):
 * the landing strip rides the real engine lanes again — the HomeSurface
 * composite winget (one mount: the prompt-first hero with the engine
 * matrix chips, the recent shelf of the catalog seam, the genre card row
 * of the profile table, the entry keys to the studio and the bench)
 * answers the route behind the same entry gate, with the construction
 * face carried as its arming face (the first paint before the catalog
 * reads land). The first-run flow (intro, onboarding) rides exactly as it
 * was and the engine lanes the landing reads (arrangement, catalog,
 * genre, playerbus) keep riding their own files untouched — the anchor
 * renders BARE behind the gate: the one Shell chrome the surface owns
 * rides inside the winget.
 */

import { label } from "../../labels.ts";
import { Constructionface, EntryGate, HomeSurface } from "../../wingets";

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
