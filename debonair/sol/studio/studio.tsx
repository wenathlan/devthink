/**
 * studio page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * studio — the detailed engine wave remount (the owner's order): the DAW
 * console returns, mounted on the REAL engine seats through the composite
 * StudioConsole winget — the stage stepper, the arrangement timeline, the
 * piano roll, the channel rack, the mixer strips and the master scope, all
 * fed by the take the playerbus shelf carries (the demo take of the seed)
 * and driven by the real TakeEngine transport. The anchor itself stays the
 * thin face the construction law pins: it owns no state and imports no
 * engine module — the console winget owns the mount, and while the bus arms
 * (the first paint before the shelf lands its snapshot) the route answers
 * the construction face it wore. The engine logics (arrangement, audio,
 * dawview, mixergraph, pianoroll, playerbus, timelinemodel) keep riding
 * their own files untouched — this page only mounts and wires them.
 */

import { label } from "../../labels.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { StudioConsole } from "../wingets/StudioConsole.tsx";
import { Constructionface } from "../../wingets";

/**
 * the studio page: the remounted DAW console under the studio eyebrow.
 *
 * @returns the app shell with the console mount.
 */
export default function Studio() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.generate"), href: "/generate" },
    { label: label("nav.library"), href: "/library" },
    { label: label("nav.settings"), href: "/settings" },
  ];

  return (
    <Shell name="debonair" contained footerLinks={FOOTER_LINKS} domain="devthink.pro">
      <p className="eyebrow reveal">{label("studio.eyebrow")}</p>
      <h1 className="reveal page-title">{label("studio.title")}</h1>
      <p className="reveal lede" style={{ maxWidth: 640 }}>
        {label("studio.ledeLead")}
        <code>studio</code>
        {label("studio.ledeTail")}
      </p>
      {/* the console mount rides the real engine; the construction face it
          wore answers the arming beat — the first paint before the bus lands
          the shelf snapshot (never a fake console, never a dead desk) */}
      <StudioConsole face={<Constructionface eyebrow={label("studio.eyebrow")} />} />
    </Shell>
  );
}
