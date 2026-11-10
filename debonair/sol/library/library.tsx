/**
 * library page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * library — the detailed engine wave remount (the owner's order the
 * construction pass pinned, answered): the shelf returns, mounted on the
 * REAL engine seats through the composite LibraryShelf winget — the take
 * cards reading the session take store (the engine's own numbers: genre,
 * bpm, key, duration, seed, the deterministic cover plates and sparkbars),
 * the audio shelf (the ingested references beside the rendered takes)
 * pressing the same shared playerbus the shell bar serves, and the site's
 * sample rows riding the catalog seam. The anchor itself stays the thin
 * face the construction law pins: it owns no state and imports no engine
 * module — the shelf winget owns the mount, and while the shelf arms (the
 * first paint before the session store and the seam land their answer) the
 * route answers the construction face it wore. The engine logics the shelf
 * rode (arrangement, catalog, dawview, playerbus, take) keep riding their
 * own files untouched.
 */

import { label } from "../../labels.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { LibraryShelf } from "../wingets/LibraryShelf.tsx";
import { Constructionface } from "../../wingets";

/**
 * the library page: the real shelf under the library eyebrow.
 *
 * @returns the app shell with the shelf mount.
 */
export default function Library() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.generate"), href: "/generate" },
    { label: label("nav.settings"), href: "/settings" },
  ];

  return (
    <Shell name="debonair" contained cta={{ label: label("library.cta"), href: "/generate" }} footerLinks={FOOTER_LINKS} domain="devthink.pro">
      <p className="eyebrow reveal">{label("library.eyebrow")}</p>
      <h1 className="reveal page-title">{label("library.title")}</h1>
      <p className="reveal lede" style={{ maxWidth: 640 }}>
        {label("library.lede")}
      </p>
      {/* the shelf mount rides the real engine; the construction face it
          wore answers the arming beat — the first paint before the shelf
          lands its answer (never a fake list, never a dead shelf) */}
      <LibraryShelf face={<Constructionface eyebrow={label("library.eyebrow")} />} />
    </Shell>
  );
}
