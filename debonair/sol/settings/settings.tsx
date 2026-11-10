/**
 * settings page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * settings — the detailed engine wave (the owner order of the waves,
 * landed): the preferences ride the real engine lanes again — the
 * SettingsSurface composite winget (one mount: the theme pair, the motion
 * switch, the clean-url demo, the region select over the catalog seam and
 * the about ledger whose version row reads the canonical version module
 * the release sync stamps — never a hand-synced literal) answers the
 * route inside the same app shell, with the construction face carried as
 * its arming face (the first paint before the session state lands). The
 * engine lanes the preferences rode (theme, motionpref, cleanurl, catalog,
 * version) keep riding their own files untouched — only this page's mount
 * changed, nothing was deleted.
 */

import { label } from "../../labels.ts";
import { Constructionface, SettingsSurface } from "../../wingets";
import { type NavLink, Shell } from "../shell/Shell.tsx";

/**
 * the settings page: the real preferences surface under the settings
 * eyebrow.
 *
 * @returns the app shell with the preferences mount.
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
      <p className="eyebrow reveal">{label("settings.eyebrow")}</p>
      <h1 className="reveal page-title">{label("settings.title")}</h1>
      <p className="reveal lede" style={{ maxWidth: 600 }}>
        {label("settings.ledeLead")}
        <code>~/.config/debonair/</code>
        {label("settings.ledeTail")}
      </p>
      {/* the preferences mount rides the real engine; the construction face
          it wore answers the arming beat — the first paint before the
          session state lands (never a column answering state it never read) */}
      <SettingsSurface face={<Constructionface eyebrow={label("settings.eyebrow")} />} />
    </Shell>
  );
}
