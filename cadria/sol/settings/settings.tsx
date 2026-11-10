/**
 * settings page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * settings — the detailed engine wave (the owner order of the waves,
 * landed): the platform preferences ride the real engine lanes again —
 * the SettingsSurface composite winget (one mount: the theme flip, the
 * gateway url field, the motion switch and the about ledger whose version
 * row reads the canonical version module the manifest carries — never a
 * hand-synced literal, the drift gate walks it) answers the route with
 * the construction face carried as its arming face. The logics the
 * preferences rode (theme, gateway client) never left their own files.
 * the anchor renders BARE: the one Shell chrome lives in sol/Sol.tsx.
 */

import { label } from "../../labels.ts";
import { Constructionface, SettingsSurface } from "../../wingets";

/**
 * the settings page: the real preferences surface under the settings
 * eyebrow.
 *
 * @returns the preferences element with its arming face.
 */
export default function Settings() {
  return <SettingsSurface face={<Constructionface eyebrow={label("settings.eyebrow")} />} />;
}
