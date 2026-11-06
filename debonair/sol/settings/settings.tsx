/**
 * settings page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * settings — the in-construction pass (the owner order of the waves, pinned):
 * the detailed engine wave builds the debonair later, with the time its
 * engines, protocols and processes deserve, so the preferences of the old
 * face (the theme pair, the motion switch, the url doctor, the region card)
 * is retired and the route answers the honest construction face under the
 * settings eyebrow, inside the same app shell (the rail and the transport
 * stay). The logics the preferences rode (theme, motionpref) keep riding
 * their own files untouched — only this page's face changed, nothing was
 * deleted.
 */

import { label } from "../../labels.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { Constructionface } from "../wingets";

/**
 * the settings page: the in-construction face under the settings eyebrow.
 *
 * @returns the app shell with the construction face.
 */
export default function Settings() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.library"), href: "/library" },
    { label: label("nav.generate"), href: "/generate" },
  ];

  return (
    <Shell name="debonair" contained footerLinks={FOOTER_LINKS} domain="devthink.pro">
      <Constructionface eyebrow={label("settings.eyebrow")} />
    </Shell>
  );
}
