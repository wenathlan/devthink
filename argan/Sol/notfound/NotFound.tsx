// # NotFound — sub-anchor of the 404: RCODE 3, NXDOMAIN. The only 404 of the theme;
// there is no 404.html anywhere.
import { Link } from "wouter";
import { Shell, type NavLink } from "../shell/Shell";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Zones", href: "/zones" },
  { label: "DNSSEC", href: "/dnssec" },
  { label: "Gateway", href: "/gateway" },
];

export default function NotFound() {
  return (
    <Shell name="argan" contained footerLinks={FOOTER_LINKS} domain="argan.devthink.pro">
      <p className="eyebrow">RCODE 3 · NXDOMAIN</p>
      <h1 className="wordmark wordmark-xl">Name not found</h1>
      <p className="lede-tight">
        The name you asked for answered NXDOMAIN — it is not in any zone argan serves, and no wildcard caught it. Your URL bar stayed clean, by the way.
      </p>
      <div className="btn-row-tight">
        <Link className="btn" href="/">
          Back to the apex
        </Link>
        <Link className="btn secondary" href="/zones">
          Browse the zones
        </Link>
      </div>
    </Shell>
  );
}
