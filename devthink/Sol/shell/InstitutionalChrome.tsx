// the institutional chrome of the public Sol surfaces: the ONE shell chrome
// of the theme (ShellChrome — the same navbar every other page mounts), the
// shared .pagehead hero contract of the design campaign, the numbered legal
// document renderer and the common footer that the terms and policy pages
// share. No second topbar is mounted: the public pages carry the same chrome
// as the workbench; the three institutional links stay reachable in the
// common footer.
import type { CSSProperties } from "react";
import { Link } from "wouter";
import { packageversion } from "../../version";
import { ShellChrome } from "./ShellChrome";

/* --------------------------------------------------------------------------
 * The .pagehead contract (design campaign wave D1 — the ONE page hero
 * grammar): eyebrow 10px mono uppercase tracked muted; title 30px sans
 * -0.02em; lede 13px muted; actions right-aligned; container max-width
 * 1180px with 24/32px padding. The persistent rules land with the wave-2
 * stylesheet; these inline pins hold the exact contract values on every
 * surface that mounts a hero today, so the grammar never renders raw.
 * ------------------------------------------------------------------------ */
export const pagecontainerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1180,
  margin: "0 auto",
  padding: "24px 32px",
};

export const pageheadStyle: CSSProperties = {
  display: "grid",
  justifyItems: "start",
  rowGap: 12,
  padding: "36px 0 26px",
};

export const pageheadEyebrowStyle: CSSProperties = {
  margin: 0,
  color: "var(--dt-muted)",
  font: "600 10px var(--dt-mono)",
  letterSpacing: ".18em",
  textTransform: "uppercase",
};

export const pageheadTitleStyle: CSSProperties = {
  margin: 0,
  color: "var(--dt-text)",
  font: "700 30px/1.15 var(--dt-sans)",
  letterSpacing: "-0.02em",
};

export const pageheadLedeStyle: CSSProperties = {
  margin: 0,
  maxWidth: 640,
  color: "var(--dt-muted)",
  font: "400 13px/1.7 var(--dt-sans)",
};

export const pageheadActionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  justifySelf: "end",
};

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

/* the legal body rhythm of the campaign: 32px section steps, 20px section
 * titles, 13px/1.7 body — pinned inline until the wave-2 stylesheet lands */
const legalBodyStyle: CSSProperties = { rowGap: 32 };
const legalTitleStyle: CSSProperties = { fontSize: 20, lineHeight: 1.25 };
const legalParagraphStyle: CSSProperties = { fontSize: 13, lineHeight: 1.7 };

/** The legal document body: numbered sections (title + paragraphs) pulled
 * from one catalog kind per page. The numbering is presentation — the keys
 * stay on the section ids the database answers. */
export function InstitutionalLegal({ sections }: { sections: LegalSectionView[] }) {
  return (
    <div className="inst-legal" style={legalBodyStyle}>
      {sections.map((section, index) => (
        <section key={section.id} className="inst-legal__section">
          <h2 style={legalTitleStyle}>
            <span className="inst-legal__index">{String(index + 1).padStart(2, "0")}</span>
            {section.title}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} style={legalParagraphStyle}>
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}

/* the institutional footer: a hairline top edge and a mono version note */
const footerEdgeStyle: CSSProperties = { borderTop: "1px solid var(--dt-edge)" };
const footerVersionStyle: CSSProperties = {
  color: "var(--dt-faint)",
  font: "500 10px var(--dt-mono)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
};

/** The common institutional footer: brand mark, the three page links and the
 * version note read from the canonical version module (synchronized from
 * package.json at the app root). */
export function InstitutionalFooter() {
  return (
    <footer className="inst-footer" style={footerEdgeStyle}>
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
      <span className="inst-footer__version" style={footerVersionStyle}>
        devthink {packageversion} — sol institutional surface
      </span>
    </footer>
  );
}
