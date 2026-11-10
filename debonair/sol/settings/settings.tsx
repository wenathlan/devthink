/**
 * settings page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * settings — the detailed engine wave remount (the owner's order the
 * construction pass pinned, answered): the preferences return, mounted on
 * the REAL preference seats through the composite SettingsPreferences
 * winget — the theme pair and the motion switch driving the engines the
 * stylesheet answers to (theme.ts, motionpref.ts), the clean-url card
 * running the live module pass, and the region select reading the catalog
 * seam's own locale rows. The anchor itself stays the thin face the
 * construction law pins: it owns no state and imports no engine module —
 * the preferences winget owns the mount, and while the seam arms (the
 * first paint before the locale choices land their answer) the route
 * answers the construction face it wore. The logics the preferences rode
 * (catalog, cleanurl, motionpref, theme) keep riding their own files
 * untouched.
 */

import { label } from "../../labels.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { SettingsPreferences } from "../wingets/SettingsPreferences.tsx";
import { Constructionface } from "../../wingets";

/**
 * the settings page: the preference cards under the settings eyebrow.
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
    <Shell name="debonair" contained footerLinks={FOOTER_LINKS} themeButton={false} domain="devthink.pro">
      <p className="eyebrow reveal">{label("settings.eyebrow")}</p>
      <h1 className="reveal page-title">{label("settings.title")}</h1>
      <p className="reveal lede" style={{ maxWidth: 600 }}>
        {label("settings.ledeLead")}
        <code>~/.config/debonair/</code>
        {label("settings.ledeTail")}
      </p>
      {/* the preferences mount rides the real engines; the construction
          face it wore answers the arming beat — the first paint before the
          seam lands its answer (never a fake select, never a dead card) */}
      <SettingsPreferences face={<Constructionface eyebrow={label("settings.eyebrow")} />} />
    </Shell>
  );
}
