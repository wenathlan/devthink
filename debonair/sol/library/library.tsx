/**
 * library page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * library — the detailed engine wave (the owner order of the waves, landed):
 * the shelf rides the real engine lanes again — the LibrarySurface
 * composite winget (one mount: the session takes of the take store, the
 * audio shelf of the reference records, the sample bank over the catalog
 * seam with its honest empty and offline states, the search field, the
 * open-in-studio and drop keys) answers the route inside the same app
 * shell, with the construction face carried as its arming face (the first
 * paint before the catalog read lands). The engine lanes the shelf rode
 * (arrangement, catalog, playerbus, take) keep riding their own files
 * untouched — only this page's mount changed, nothing was deleted.
 */

import { label } from "../../labels.ts";
import { Constructionface, LibrarySurface } from "../../wingets";
import { type NavLink, Shell } from "../shell/Shell.tsx";

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
    <Shell name="debonair" contained footerLinks={FOOTER_LINKS} domain="devthink.pro">
      <p className="eyebrow reveal">{label("library.eyebrow")}</p>
      <h1 className="reveal page-title">{label("library.title")}</h1>
      <p className="reveal lede" style={{ maxWidth: 640 }}>
        {label("library.lede")}
      </p>
      {/* the shelf mount rides the real engine; the construction face it
          wore answers the arming beat — the first paint before the sample
          bank read lands (never a fake row, never a dead shelf) */}
      <LibrarySurface face={<Constructionface eyebrow={label("library.eyebrow")} />} />
    </Shell>
  );
}
