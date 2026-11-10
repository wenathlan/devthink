/**
 * generate page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * generate — the detailed engine wave (the owner order of the waves,
 * landed): the composer loop rides the real engine lanes again — the
 * GenerateSurface composite winget (one mount: the prompt bench with the
 * engine matrix chips, the fold over the ingest references, the render
 * walk over the gateway lane, the session shelf and the explain card)
 * answers the route inside the same app shell, with the construction face
 * carried as its arming face (the first paint before the references read
 * lands). The engine lanes the loop rode (arrangement, generateclient,
 * genre, ingest, playerbus, take) keep riding their own files untouched —
 * only this page's mount changed, nothing was deleted.
 */

import { label } from "../../labels.ts";
import { Constructionface, GenerateSurface } from "../../wingets";
import { type NavLink, Shell } from "../shell/Shell.tsx";

/**
 * the generate page: the real composer loop under the generate eyebrow.
 *
 * @returns the app shell with the composer mount.
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
    <Shell name="debonair" contained footerLinks={FOOTER_LINKS} domain="devthink.pro">
      <p className="eyebrow reveal">{label("generate.eyebrow")}</p>
      <h1 className="reveal page-title">{label("generate.title")}</h1>
      <p className="reveal lede" style={{ maxWidth: 640 }}>
        {label("generate.ledeLead")}
        <code>studio</code>
        {label("generate.ledeTail")}
      </p>
      {/* the composer mount rides the real engine; the construction face it
          wore answers the arming beat — the first paint before the
          references read lands (never a fake corpus, never a dead bench) */}
      <GenerateSurface face={<Constructionface eyebrow={label("generate.eyebrow")} />} />
    </Shell>
  );
}
