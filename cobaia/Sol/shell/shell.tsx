/**
 * shell.tsx — the ONE chrome of the cobaia content site: the APPLICATION
 * WINDOW the family law gives every deploy unit. The window floats over the
 * mica canvas — the fluent frame (8px corners, the deep float shadow, the
 * open pop on the micro out curve), the title bar carrying the ONE logo slot
 * (the drawn mark, the name, the role) flush against the caption zone: the
 * three fluent 44px caption buttons with the wash hover, the wash-soft press
 * and the windows red close. The close caption carries the intro door where
 * the siblings carry theirs (the relaunch metaphor): closing the window
 * walks the site to /intro, the bare presentation page. Minimize and
 * maximize own no window state yet, so they render in the disabled honest
 * fade — the owner wires those handlers later, never a fake action. The
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
import { type LabelKey, label } from "../../labels";
import { ROSTER } from "../widgets";
import { BrandMark } from "../widgets";

/** the hand-over route of the close caption: closing the window relaunches
 * the site at the intro (the relaunch metaphor — the family grammar's door
 * back to the bare presentation page, where the siblings carry theirs). */
const RESTART_ROUTE = "/intro";

/** the section links of the top bar, in reading order (home is the mark).
 * the href rides the route table, the text rides the label accessor. */
const NAVLINKS: readonly { href: string; key: LabelKey }[] = [
  { href: "/apps", key: "shell.nav.apps" },
  { href: "/pricing", key: "shell.nav.pricing" },
  { href: "/blog", key: "shell.nav.blog" },
  { href: "/support", key: "shell.nav.support" },
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
  const [location, navigate] = useLocation();

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
        {label("shell.skip")}
      </a>
      <section
        className="cb-window"
        data-inactive={inactive ? "true" : undefined}
        aria-label={label("shell.window.aria")}
      >
        {/* the title bar: the ONE logo slot and the caption zone — the fluent
         * red close flush at the right edge; the close caption carries the
         * family relaunch door (→ /intro), minimize and maximize render in
         * the disabled honest fade until the shell owns window state */}
        <header className="cb-titlebar">
          <a className="cb-wbrand" href="/" aria-label={label("shell.brand.aria")}>
            <BrandMark size={18} />
            <span className="cb-wname">{label("shell.name")}</span>
            <span className="cb-wrole">{label("shell.role")}</span>
          </a>
          <div className="cb-caption">
            <button type="button" className="cb-cap" disabled aria-label={label("shell.caption.minimize")}>
              <CapGlyph kind="min" />
            </button>
            <button type="button" className="cb-cap" disabled aria-label={label("shell.caption.maximize")}>
              <CapGlyph kind="max" />
            </button>
            {/* close = relaunch: the flow restarts at the intro on purpose
             * (the family law the siblings carry — a real hand-over, never
             * a fake window action) */}
            <button
              type="button"
              className="cb-cap cb-cap--close"
              aria-label={label("shell.caption.close")}
              onClick={() => navigate(RESTART_ROUTE)}
            >
              <CapGlyph kind="close" />
            </button>
          </div>
        </header>

        {/* the window body stage: the site scrolls inside the frame, the
         * sticky bar answers the stage */}
        <div className="cb-winbody">
          <div className="cb-root">
            <header className="cb-top">
              <nav className="cb-nav" aria-label={label("shell.nav.aria")}>
                {NAVLINKS.map((link) => (
                  <a
                    key={link.href}
                    className="cb-navlink"
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                  >
                    {label(link.key)}
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
                  <p className="cb-foothead">{label("shell.foot.aboutHead")}</p>
                  <p className="cb-foottext">{label("shell.foot.aboutText")}</p>
                </div>
                <div className="cb-footcol">
                  <p className="cb-foothead">{label("shell.foot.siteHead")}</p>
                  <a className="cb-footlink" href="/apps">
                    {label("shell.foot.apps")}
                  </a>
                  <a className="cb-footlink" href="/pricing">
                    {label("shell.foot.pricing")}
                  </a>
                  <a className="cb-footlink" href="/blog">
                    {label("shell.foot.blog")}
                  </a>
                  <a className="cb-footlink" href="/support">
                    {label("shell.foot.support")}
                  </a>
                  <a className="cb-footlink" href="/legal">
                    {label("shell.foot.legal")}
                  </a>
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
      </section>
    </div>
  );
}

export default Shell;
