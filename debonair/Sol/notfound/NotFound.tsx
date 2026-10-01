// # NotFound — sub-anchor of the 404: dead air. The only 404 of the theme; there is
// no 404.html anywhere.
import { Link } from "wouter";
import { Shell, type NavLink } from "../shell/Shell";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Studio", href: "/studio" },
  { label: "Library", href: "/library" },
];

export default function NotFound() {
  return (
    <Shell name="debonair" contained footerLinks={FOOTER_LINKS} themeButton={false} domain="devthink.pro">
      <p className="eyebrow">404 · no signal</p>
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
