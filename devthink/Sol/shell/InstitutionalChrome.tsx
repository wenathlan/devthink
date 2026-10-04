// the institutional chrome of the public Sol surfaces: the ONE shell chrome
// of the theme (ShellChrome — the same navbar every other page mounts), the
// numbered legal document renderer and the common footer that the about,
// terms and policy pages share. No second topbar is mounted: the public
// pages carry the same chrome as the workbench; the three institutional
// links stay reachable in the common footer.
import { Link } from "wouter";
import { ShellChrome } from "./ShellChrome";
import { packageversion } from "../../version";

/** the institutional pages every public surface links to */
const pages = [
  { href: "/about", label: "about" },
  { href: "/terms", label: "terms" },
  { href: "/policy", label: "policy" },
] as const;

/** The institutional page frame chrome: the shell navbar plus nothing else —
 * the brand, the essential links, the omnibox, the tray and the Start menu
 * are the theme's single chrome; no second topbar rides above the page. */
export function InstitutionalChrome() {
  return <ShellChrome />;
}

/** the shape the legal renderer consumes; the catalog LegalSection rows fit it */
type LegalSectionView = { id: string; title: string; paragraphs: string[] };

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
