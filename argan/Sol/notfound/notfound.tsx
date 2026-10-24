/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # NotFound — sub-anchor of the 404: RCODE 3, NXDOMAIN. The only 404 of the theme;
// there is no 404.html anywhere.
import { Link } from "wouter";
import { label } from "../../labels";
import { type NavLink, Shell } from "../shell/Shell";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: label("nav.zones"), href: "/zones" },
  { label: label("nav.dnssec"), href: "/dnssec" },
  { label: label("nav.gateway"), href: "/gateway" },
];

export default function NotFound() {
  return (
    <Shell name="argan" contained footerLinks={FOOTER_LINKS} domain="argan.devthink.pro">
      <p className="eyebrow">{label("notfound.eyebrow")}</p>
      <h1 className="wordmark wordmark-xl">{label("notfound.title")}</h1>
      <p className="lede-tight">{label("notfound.lede")}</p>
      <div className="btn-row-tight">
        <Link className="btn" href="/">
          {label("notfound.backApex")}
        </Link>
        <Link className="btn secondary" href="/zones">
          {label("notfound.browseZones")}
        </Link>
      </div>
    </Shell>
  );
}
