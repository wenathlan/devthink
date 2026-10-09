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
import { Link } from "wouter";
import { type NavLink, Shell } from "../shell/Shell";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Studio", href: "/studio" },
  { label: "Library", href: "/library" },
];

export default function NotFound() {
  return (
    <Shell name="debonair" contained footerLinks={FOOTER_LINKS} themeButton={false} domain="devthink.pro">
      <p className="eyebrow">debonair · 404</p>
      <h1 className="wordmark wordmark-xl">Dead air</h1>
      <p className="lede-tight">
        This page never made it to tape. The fader was up, the mic was hot — and the URL bar stayed clean, by the way.
      </p>
      <div className="btn-row-tight">
        <Link className="btn" href="/">
          Back home
        </Link>
        <Link className="btn secondary" href="/studio">
          Open the studio
        </Link>
      </div>
    </Shell>
  );
}
