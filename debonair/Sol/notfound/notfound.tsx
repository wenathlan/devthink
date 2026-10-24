/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # NotFound — sub-anchor of the 404: dead air. The only 404 of the theme; there is
// no 404.html anywhere.
import { label } from "../../labels.ts";
import { Link } from "wouter";
import { type NavLink, Shell } from "../shell/Shell.tsx";

export default function NotFound() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.library"), href: "/library" },
  ];

  return (
    <Shell name="debonair" contained footerLinks={FOOTER_LINKS} themeButton={false} domain="devthink.pro">
      <p className="eyebrow">{label("notfound.eyebrow")}</p>
      <h1 className="wordmark wordmark-xl">{label("notfound.title")}</h1>
      <p className="lede-tight">{label("notfound.lede")}</p>
      <div className="btn-row-tight">
        <Link className="btn" href="/">
          {label("notfound.backHome")}
        </Link>
        <Link className="btn secondary" href="/studio">
          {label("notfound.openStudio")}
        </Link>
      </div>
    </Shell>
  );
}
