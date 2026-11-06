/**
 * settings page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * settings — the in-construction pass (the owner order of the waves, pinned):
 * the detailed engine wave builds the cadria later, with the time its
 * engines, protocols and processes deserve, so the preferences of the old
 * face (the theme flip, the gateway url field, the motion switch) are
 * retired and the route answers the honest construction face under the
 * settings eyebrow — with the one about row that stays honest metadata:
 * the version line reading the canonical version module the manifest
 * carries (never a hand-synced literal — the drift gate walks it). The
 * logics the preferences rode (theme, gateway client) keep riding their
 * own files untouched — only this page's face changed, nothing was
 * deleted. the anchor renders BARE: the one Shell chrome lives in
 * sol/Sol.tsx.
 */

import { label } from "../../labels.ts";
import { packageversion } from "../../version.ts";
import { Constructionface } from "../wingets";

/**
 * the settings page: the in-construction face under the settings eyebrow,
 * the honest version row beneath it.
 *
 * @returns the construction face element with the version row.
 */
export default function Settings() {
  return (
    <>
      <Constructionface eyebrow={label("settings.eyebrow")} />
      <p className="mono-label" style={{ margin: "14px 0 0" }}>
        {label("settings.about.version")}: {packageversion}
      </p>
    </>
  );
}
