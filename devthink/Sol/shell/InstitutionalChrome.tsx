// the institutional chrome of the public Sol surfaces: the slim topbar, the
// numbered legal document renderer and the common footer that the about, terms
// and policy pages share. The chrome is public-page material only — brand,
// page links and the version note from the canonical version module — and
// stays out of the workbench shells.
import { Link, useLocation } from "wouter";
import { packageversion } from "../../version";

/** the institutional pages every public surface links to */
const pages = [
  { href: "/about", label: "about" },
  { href: "/terms", label: "terms" },
  { href: "/policy", label: "policy" },
] as const;

/** the shape the legal renderer consumes; the catalog LegalSection rows fit it */
type LegalSectionView = { id: string; title: string; paragraphs: string[] };

/** The slim top bar of the public pages: brand at the left, the three
 * institutional links at the right and the amber "workspace" action that
 * returns to the operating surface. */
export function InstitutionalTopbar() {
  const [location] = useLocation();
  return (
    <header className="inst-topbar">
      <Link href="/" className="inst-topbar__brand">
        <span aria-hidden="true" className="inst-topbar__glyph">
          ✦
        </span>
        <strong>DEVTHINK</strong>
        <small>sol theme</small>
      </Link>
      <nav aria-label="Institutional pages">
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className={location === page.href ? "inst-topbar__link inst-topbar__link--active" : "inst-topbar__link"}
            aria-current={location === page.href ? "page" : undefined}
          >
            {page.label}
          </Link>
        ))}
      </nav>
      <Link href="/" className="inst-topbar__return">
        workspace
      </Link>
    </header>
  );
}

/** The legal document body: numbered sections (title + paragraphs) pulled
 * from one catalog kind per page. The numbering is presentation — the keys
 * stay on the section ids the database answers. */
export function InstitutionalLegal({ sections }: { sections: LegalSectionView[] }) {
  return (
    <div className="inst-legal">
      {sections.map((section, index) => (
        <section key={section.id} className="inst-legal__section">
          <h2>
            <span className="inst-legal__index">{String(index + 1).padStart(2, "0")}</span>
            {section.title}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
    </div>
  );
}

/** The common institutional footer: brand mark, the three page links and the
 * version note read from the canonical version module (synchronized from
 * package.json at the app root). */
export function InstitutionalFooter() {
  return (
    <footer className="inst-footer">
      <span className="inst-footer__brand">
        <span aria-hidden="true" className="inst-footer__glyph">
          ✦
        </span>
        <strong>DEVTHINK</strong>
      </span>
      <nav aria-label="Institutional pages">
        {pages.map((page) => (
          <Link key={page.href} href={page.href}>
            {page.label}
          </Link>
        ))}
      </nav>
      <span className="inst-footer__version">devthink {packageversion} — sol institutional surface</span>
    </footer>
  );
}
