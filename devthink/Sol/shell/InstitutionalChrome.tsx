// the institutional chrome of the public Sol surfaces: the ONE shell chrome
// of the theme (ShellChrome — the same navbar every other page mounts), the
// shared .pagehead hero contract of the design campaign, the editorial legal
// document renderer and the common footer that the terms and policy pages
// share. No second topbar is mounted: the public pages carry the same chrome
// as the workbench; the three institutional links stay reachable in the
// common footer.
import type { CSSProperties } from "react";
import { Link } from "wouter";
import { packageversion } from "../../version";
import { ShellChrome } from "./ShellChrome.tsx";

/* --------------------------------------------------------------------------
 * The .pagehead contract (design campaign C1 — the ONE page hero grammar):
 * the eyebrow is a lowercase mono micro-label (no all-caps wide tracking),
 * the title rides the display face of the wave (--font-display, with the
 * theme sans as the pre-type-pass fallback), the lede is a 13px/1.7 measure
 * and the hero closes on a hairline rule instead of a boxed band. The exact
 * contract values stay pinned inline so the grammar never renders raw on any
 * surface that mounts a hero today.
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
  borderBottom: "1px solid var(--dt-edge)",
};

export const pageheadEyebrowStyle: CSSProperties = {
  margin: 0,
  color: "var(--sol-sun)",
  font: "600 10px var(--dt-mono)",
  letterSpacing: ".08em",
};

export const pageheadTitleStyle: CSSProperties = {
  margin: 0,
  color: "var(--dt-text)",
  font: "700 30px/1.15 var(--font-display, var(--dt-sans))",
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

/** the one orchestrated entrance per view: a single staggered rise (hero →
 * body) that ends in stillness — never per-block scroll fades. Consumers
 * pass their useReducedMotion result; the reduced preference receives no
 * motion at all. */
export function stagedEntrance(reduced: boolean, delay: number): CSSProperties | undefined {
  if (reduced) return undefined;
  return { animation: "riseIn .55s var(--dt-ease) backwards", animationDelay: `${delay}ms` };
}

/** the named light source of the sol stage: the solar accent enters high on
 * the right, a faint cool wash anchors the low left — never a naked flat
 * canvas. --sol-canvas stays the base so the theme tokens keep owning it. */
export const pagestageStyle: CSSProperties = {
  background:
    "radial-gradient(1200px 700px at 76% -12%, rgb(245 158 11 / 8%), transparent 62%), radial-gradient(900px 620px at 6% 108%, rgb(138 180 248 / 5%), transparent 58%), var(--sol-canvas)",
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

/* the editorial legal body: no box walls — one hairline rule per section, the
 * section index in a generous left column, 20px display-face titles and a
 * 13px/1.7 measure. The staggered rise of the sections stays class-driven
 * (inst-legal__section) so the stylesheet's reduced-motion guard applies. */
const legalBodyStyle: CSSProperties = {
  rowGap: 0,
  width: "min(880px, calc(100% - 48px))",
};

const legalSectionStyle: CSSProperties = {
  borderTop: "1px solid var(--dt-edge)",
  padding: "26px 0 8px",
  display: "grid",
  gridTemplateColumns: "minmax(56px, 88px) minmax(0, 1fr)",
  columnGap: 24,
  rowGap: 12,
};

const legalIndexStyle: CSSProperties = {
  gridRow: "1 / span 2",
  alignSelf: "start",
  paddingTop: 7,
  color: "var(--sol-sun)",
  font: "600 11px var(--dt-mono)",
  letterSpacing: ".08em",
  fontVariantNumeric: "tabular-nums",
};

const legalTitleStyle: CSSProperties = {
  margin: 0,
  gridColumn: 2,
  color: "var(--dt-text)",
  font: "700 20px/1.25 var(--font-display, var(--dt-sans))",
  letterSpacing: "-0.01em",
};

const legalParagraphStyle: CSSProperties = {
  margin: 0,
  color: "var(--dt-muted)",
  font: "400 13px/1.7 var(--dt-sans)",
};

/** The legal document body: numbered sections (title + paragraphs) pulled
 * from one catalog kind per page. The numbering is presentation — the keys
 * stay on the section ids the database answers. */
export function InstitutionalLegal({ sections }: { sections: LegalSectionView[] }) {
  return (
    <div className="inst-legal" style={legalBodyStyle}>
      {sections.map((section, index) => (
        <section key={section.id} className="inst-legal__section" style={legalSectionStyle}>
          <span className="inst-legal__index" style={legalIndexStyle}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <h2 style={legalTitleStyle}>{section.title}</h2>
          <div style={{ display: "grid", gap: 12, gridColumn: 2 }}>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} style={legalParagraphStyle}>
                {paragraph}
              </p>
            ))}
          </div>
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
  letterSpacing: ".08em",
};

/** The common institutional footer: the brand word, the three page links and
 * the version note read from the canonical version module (synchronized from
 * package.json at the app root). One mark per zone — the navbar above owns
 * the mark, so the footer stays type-only. */
export function InstitutionalFooter() {
  return (
    <footer className="inst-footer" style={footerEdgeStyle}>
      <span className="inst-footer__brand">
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
