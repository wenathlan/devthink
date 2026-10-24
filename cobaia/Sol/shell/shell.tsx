/**
 * shell.tsx — the ONE chrome of the cobaia content site: the APPLICATION
 * WINDOW the family law gives every deploy unit. The window floats over the
 * mica canvas — the fluent frame (8px corners, the deep float shadow, the
 * open pop on the micro out curve), the title bar carrying the ONE logo slot
 * (the drawn mark, the name, the role) flush against the caption zone: the
 * three fluent 44px caption buttons with the wash hover, the wash-soft press
 * and the windows red close. The cobaia shell owns no window state handlers
 * yet, so the buttons render in the disabled honest fade — the owner wires
 * the minimize / maximize / close handlers later, never a fake action. The
 * inactive law is real today: a window the document is not focused on turns
 * grayscale(80%). Inside the frame the site keeps its own voice — the sticky
 * section bar (the acrylic nav pins over the drawn home mark), the page
 * surface and the worked footer carrying the family row: every deploy unit
 * of the family linked through familyurl(), because the family redirects
 * both ways. The bar rides the trylle canvas with the Windows hands: the
 * section links are the pins — the acrylic bar, the hover wash, the press
 * bounce (scale 0.7, 100ms), the dtPopIntro mount pop and the 3px ladder
 * indicator that grows under the active section; the focus underline and the
 * active pin answer the Windows accent — the identity amber lives only in
 * the brand mark. The active section link reads the location so the visitor
 * always knows where they stand. Styled entirely by Sol/sol.css (the 3b
 * window chrome block carries the frame, the caption grammar, the eight
 * resize-handle rules and the inactive law); the window resize sessions and
 * the title drag render with their handlers — never a fake cursor.
 */
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { familyurl } from "../../familyurl";
import { ROSTER } from "../widgets/apps.roster.ts";
import { BrandMark } from "../widgets/shell.brand.tsx";

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

/** the caption glyphs of the windows grammar, drawn inline — the app
 * carries no icon dependency and the chrome never grows one: the fluent
 * 10×10 marks at 1px strokes (subtract, maximize, dismiss). */
function CapGlyph({ kind }: { kind: "min" | "max" | "close" }) {
  if (kind === "min") {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
        <path d="M0 5h10" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  if (kind === "max") {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
        <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
      <path d="M0 0l10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** the shared chrome: the application window — the title bar (the ONE logo
 * slot and the caption zone), the site bar, the page surface and the footer
 * row inside the window body stage. */
export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  // the Windows inactive law: a window the document is not focused on turns
  // grayscale — the state rides the document focus alone (session scope)
  const [inactive, setInactive] = useState(false);
  useEffect(() => {
    const sync = (): void => setInactive(!document.hasFocus());
    sync();
    window.addEventListener("focus", sync);
    window.addEventListener("blur", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("blur", sync);
    };
  }, []);

  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);

  return (
    <div className="cb-winroot">
      {/* the skip link rides outside the window frame: the frame clips its
       * overflow, the skip answers the viewport like it always did */}
      <a className="cb-skip" href="#content">
        skip to content
      </a>
      <section className="cb-window" data-inactive={inactive ? "true" : undefined} aria-label="cobaia">
        {/* the title bar: the ONE logo slot and the caption zone — the fluent
         * red close flush at the right edge; the caption buttons render in
         * the disabled honest fade until the shell owns window state */}
        <header className="cb-titlebar">
          <a className="cb-wbrand" href="/" aria-label="cobaia — home">
            <BrandMark size={18} />
            <span className="cb-wname">cobaia</span>
            <span className="cb-wrole">the devthink family site</span>
          </a>
          <div className="cb-caption">
            <button type="button" className="cb-cap" disabled aria-label="Minimize cobaia">
              <CapGlyph kind="min" />
            </button>
            <button type="button" className="cb-cap" disabled aria-label="Maximize cobaia">
              <CapGlyph kind="max" />
            </button>
            <button type="button" className="cb-cap cb-cap--close" disabled aria-label="Close cobaia">
              <CapGlyph kind="close" />
            </button>
          </div>
        </header>

        {/* the window body stage: the site scrolls inside the frame, the
         * sticky bar answers the stage */}
        <div className="cb-winbody">
          <div className="cb-root">
            <header className="cb-top">
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
                    the front door of the devthink family: ten deployable applications built on one engine, shipped as
                    static sites, tracked nowhere. pricing, support, the app directory and the update blog live here.
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
        </div>
      </section>
    </div>
  );
}

export default Shell;
