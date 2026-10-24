/**
 * shell.tsx — the ONE chrome of the cobaia content site: a flat, sticky top
 * bar (the drawn cobaia mark, the wordmark, the four section links) and a
 * worked footer carrying the family row — every deploy unit of the family
 * linked through familyurl(), because the family redirects both ways. The
 * bar rides the trylle canvas with the Windows hands: the section links are
 * the pins — the acrylic bar, the hover wash, the press bounce
 * (scale 0.7, 100ms), the dtPopIntro mount pop and the 3px ladder indicator
 * that grows under the active section; the focus underline and the active
 * pin answer the Windows accent — the identity amber lives only in the
 * brand mark. The chrome is solid canvas with one hairline (no glass panels on a content
 * site beyond the bar itself — the cobaia is a page, not an app). The
 * active section link reads the location so the visitor always knows where
 * they stand. Styled entirely by Sol/sol.css; a copy-per-deploy of the
 * family shell pattern reduced to content-site duties.
 */
import type { CSSProperties, ReactNode } from "react";
import { useLocation } from "wouter";
import { familyurl } from "../../familyurl";
import { ROSTER } from "../components/apps.roster.ts";
import { BrandMark } from "../components/shell.brand.tsx";

/** the section links of the top bar, in reading order (home is the mark). */
const NAVLINKS: readonly { href: string; label: string }[] = [
  { href: "/apps", label: "apps" },
  { href: "/pricing", label: "pricing" },
  { href: "/blog", label: "blog" },
  { href: "/support", label: "support" },
];

/** the family row of the footer: every deploy unit beside the cobaia, read
 * from the one roster table (the spec §12 accents) so the footer can never
 * drift from the /apps directory. */

/** the shared chrome: the top bar, the page surface and the footer row. */
export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);

  return (
    <div className="cb-root">
      <a className="cb-skip" href="#content">
        skip to content
      </a>
      <header className="cb-top">
        <a className="cb-brand" href="/" aria-label="cobaia — home">
          <BrandMark size={22} />
          <strong>cobaia</strong>
          <span className="cb-brandtag">the devthink family site</span>
        </a>
        <nav className="cb-nav" aria-label="site sections">
          {NAVLINKS.map((link) => (
            <a
              key={link.href}
              className="cb-navlink"
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <main id="content" className="cb-main">
        {children}
      </main>

      <footer className="cb-foot">
        <div className="cb-footgrid">
          <div className="cb-footcol cb-footabout">
            <p className="cb-foothead">cobaia</p>
            <p className="cb-foottext">
              the front door of the devthink family: ten deployable applications built on one engine, shipped as static
              sites, tracked nowhere. pricing, support, the app directory and the update blog live here.
            </p>
          </div>
          <div className="cb-footcol">
            <p className="cb-foothead">site</p>
            <a className="cb-footlink" href="/apps">
              apps
            </a>
            <a className="cb-footlink" href="/pricing">
              pricing
            </a>
            <a className="cb-footlink" href="/blog">
              blog
            </a>
            <a className="cb-footlink" href="/support">
              support
            </a>
            <a className="cb-footlink" href="/legal">
              legal
            </a>
          </div>
          <div className="cb-footcol cb-footfamily">
            <p className="cb-foothead">the family</p>
            <div className="cb-famgrid">
              {ROSTER.map((member) => (
                <a
                  key={member.slug}
                  className="cb-famlink"
                  href={familyurl(member.slug)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ "--cb-dot": member.accent } as CSSProperties}
                >
                  <span className="cb-famdot" aria-hidden="true" />
                  {member.slug}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="cb-colophon">
          cobaia — a provisional name. part of the devthink family · ten honest tools, one engine.
        </p>
      </footer>
    </div>
  );
}

export default Shell;
