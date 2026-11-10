/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * home — the detailed engine wave remount (the owner's order the
 * construction pass pinned, answered): the prompt-first landing returns,
 * mounted on the REAL engine seats through the composite HomeLanding
 * winget — the hero chips riding the genre matrix, the song grid reading
 * the catalog seam (the vitrine rows beside the sample rows, every play
 * key pressing the shared playerbus), the genre vitrine, the flow steps
 * and the engine ledger over the MASTERING spec, the family meta-quad. The
 * anchor itself stays the thin face the construction law pins: it owns no
 * state and imports no engine module — the landing winget owns the mount,
 * and while the catalog seam arms (the first paint before the shelf lands
 * its answer) the route answers the construction face it wore. The
 * first-run flow (intro, onboarding) rides exactly as it was and the root
 * engine logics (arrangement, catalog, dawview, family, genre, katexis,
 * playerbus) keep riding their own files untouched.
 */

import { label } from "../../labels.ts";
import { Constructionface, EntryGate } from "../../wingets";
import { HomeLanding } from "../wingets/HomeLanding.tsx";
import { type NavLink, Shell } from "../shell/Shell.tsx";

/**
 * the home anchor: the entry gate decides first (intro unseen hands to
 * /intro, onboarding unseen hands to /onboarding, null renders while the
 * state resolves) and the landing mounts only behind a finished flow.
 *
 * @returns the gated landing element.
 */
export default function Home() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.generate"), href: "/generate" },
    { label: label("nav.library"), href: "/library" },
    { label: label("nav.settings"), href: "/settings" },
  ];

  return (
    <EntryGate>
      <Shell name="debonair" contained={false} cta={{ label: label("home.cta"), href: "/studio" }} footerLinks={FOOTER_LINKS} domain="devthink.pro">
        {/* the landing mount rides the real engines; the construction face
            it wore answers the arming beat — the first paint before the
            catalog seam lands its answer (never a fake grid, never a dead hero) */}
        <HomeLanding face={<Constructionface eyebrow={label("home.eyebrow")} />} />
      </Shell>
    </EntryGate>
  );
}
