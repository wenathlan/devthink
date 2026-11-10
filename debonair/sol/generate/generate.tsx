/**
 * generate page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * generate — the detailed engine wave remount (the owner's order the
 * construction pass pinned, answered): the composer loop returns, mounted
 * on the REAL engine seats through the composite GenerateBench winget —
 * the prompt bench scoring the genre matrix chips, the compose walk
 * folding the session references into the miner's profile (the composer
 * answering the seeded plan with the salt law and the opt-in voice), the
 * render lane polling the gateway walk (queued → rendering → done, the
 * wav landing in the blob store, the take playing through the shared bus)
 * and the session shelf handing takes to the studio. The anchor itself
 * stays the thin face the construction law pins: it owns no state and
 * imports no engine module — the bench winget owns the mount, and while
 * the session shelf arms (the first paint before the take store lands its
 * answer) the route answers the construction face it wore. The engine
 * logics the loop rode (arrangement, audio, generateclient, genre, ingest,
 * pattern, playerbus, renderengine, take) keep riding their own files
 * untouched.
 */

import { label } from "../../labels.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { GenerateBench } from "../wingets/GenerateBench.tsx";
import { Constructionface } from "../../wingets";

/**
 * the generate page: the composer loop under the generate eyebrow.
 *
 * @returns the app shell with the bench mount.
 */
export default function Generate() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.library"), href: "/library" },
    { label: label("nav.settings"), href: "/settings" },
  ];

  return (
    <Shell name="debonair" contained cta={{ label: label("generate.cta"), href: "/studio" }} footerLinks={FOOTER_LINKS} domain="devthink.pro">
      <p className="eyebrow reveal">{label("generate.eyebrow")}</p>
      <h1 className="reveal page-title">{label("generate.title")}</h1>
      <p className="reveal lede" style={{ maxWidth: 640 }}>
        {label("generate.ledeLead")}
        <code>studio</code>
        {label("generate.ledeTail")}
      </p>
      {/* the bench mount rides the real engines; the construction face it
          wore answers the arming beat — the first paint before the session
          shelf lands its answer (never a fake lane, never a dead bench) */}
      <GenerateBench face={<Constructionface eyebrow={label("generate.eyebrow")} />} />
    </Shell>
  );
}
