/**
 * shell.tsx — the ONE chrome of the cobaia content site under the family
 * fullscreen law: the direct url owns the whole viewport (no floating
 * window, no title bar, no captions — the window chrome exists only inside
 * the DevThink OS power clip, and the OS draws that window itself), so the
 * site renders full-bleed with its own voice — the sticky section bar (the
 * acrylic nav pins over the drawn home mark), the page surface and the
 * worked footer carrying the family row: every deploy unit of the family
 * linked through familyurl(), because the family redirects both ways. The
 * bar rides the trylle canvas with the Windows hands: the section links
 * are the pins — the acrylic bar, the hover wash, the press bounce (scale
 * 0.7, 100ms), the dtPopIntro mount pop and the 3px ladder indicator that
 * grows under the active section; the focus underline and the active pin
 * answer the Windows accent — the identity amber lives only in the brand
 * mark. The active section link reads the location so the visitor always
 * knows where they stand. Inside the OS power clip the embedded contract
 * renders the routed page bare (shell--embedded) — the host window owns
 * the chrome there. Styled entirely by Sol/sol.css (the fullscreen law
 * block carries the two contracts).
 */
import type { CSSProperties, ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { familyurl } from "../../familyurl";
import { type LabelKey, label } from "../../labels";
import { ROSTER } from "../wingets";
import { BrandMark } from "../wingets";

/** the section links of the top bar, in reading order (home is the mark).
 * the href rides the route table, the text rides the label accessor. */
const NAVLINKS: readonly { href: string; key: LabelKey }[] = [
  { href: "/apps", key: "shell.nav.apps" },
  { href: "/pricing", key: "shell.nav.pricing" },
  { href: "/blog", key: "shell.nav.blog" },
  { href: "/support", key: "shell.nav.support" },
];

/** the shared chrome: the full-bleed site surface — the sticky section bar
 * (with the ONE logo slot as the home mark), the page surface and the
 * footer row; the embedded pass renders the routed page bare inside the os
 * power clip. */
export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  // the embedded contract of the family fullscreen law: inside the os
  // power clip the app rides the host window chrome — the routed page
  // renders bare, full-bleed in the frame, no window of its own
  const framed = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);

  // the embedded pass renders before the surface: one window, one frame
  if (framed) return <main className="shell shell--embedded">{children}</main>;

  // the standalone pass: the direct url answers full-bleed — the window
  // chrome exists only inside the os power clip, so the site owns the whole
  // viewport; the sticky section bar stays as the site's own navigation,
  // the page surface fills the middle and the worked footer closes it
  return (
    <div className="shell shell--standalone">
      {/* the skip link answers the viewport: the surface owns the whole
       * document, the skip jumps straight to the content anchor */}
      <a className="cb-skip" href="#content">
        {label("shell.skip")}
      </a>
      <div className="cb-root">
        <header className="cb-top">
          <nav className="cb-nav" aria-label={label("shell.nav.aria")}>
            <Link
              className="cb-brand"
              href="/"
              aria-label={label("shell.brand.aria")}
              aria-current={isActive("/") ? "page" : undefined}
            >
              <BrandMark size={18} />
              <strong>{label("shell.name")}</strong>
              <span className="cb-brandtag">{label("shell.role")}</span>
            </Link>
            {NAVLINKS.map((link) => (
              <Link
                key={link.href}
                className="cb-navlink"
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {label(link.key)}
              </Link>
            ))}
          </nav>
        </header>

        <main id="content" className="cb-main">
          {children}
        </main>

        <footer className="cb-foot">
          <div className="cb-footgrid">
            <div className="cb-footcol cb-footabout">
              <p className="cb-foothead">{label("shell.foot.aboutHead")}</p>
              <p className="cb-foottext">{label("shell.foot.aboutText")}</p>
            </div>
            <div className="cb-footcol">
              <p className="cb-foothead">{label("shell.foot.siteHead")}</p>
              <Link className="cb-footlink" href="/apps">
                {label("shell.foot.apps")}
              </Link>
              <Link className="cb-footlink" href="/pricing">
                {label("shell.foot.pricing")}
              </Link>
              <Link className="cb-footlink" href="/blog">
                {label("shell.foot.blog")}
              </Link>
              <Link className="cb-footlink" href="/support">
                {label("shell.foot.support")}
              </Link>
              <Link className="cb-footlink" href="/legal">
                {label("shell.foot.legal")}
              </Link>
            </div>
            <div className="cb-footcol cb-footfamily">
              <p className="cb-foothead">{label("shell.foot.familyHead")}</p>
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
          <p className="cb-colophon">{label("shell.colophon")}</p>
        </footer>
      </div>
    </div>
  );
}

export default Shell;
