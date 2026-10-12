/**
 * legalkit.tsx — the shared editorial legal document kit of the r2-c batch.
 * One definition, two documents: the terms and the policy page mounts render
 * this kit with their own catalog kind, so the grammar lives exactly once —
 * the ONE .pagehead hero (mono signal eyebrow, Bricolage display title, one
 * phrase), the sticky 220px mono lowercase TOC and the numbered sections
 * (hairline dividers, mono signal index, 20px display titles, 68ch prose).
 * The document rises once through the .enter kit, staggered after the hero;
 * the reduced-motion visitor gets the static spread. Visual only: the shell
 * chrome above and the institutional footer below stay with the page mounts.
 */
import type { CSSProperties } from "react";
import type { LegalSection } from "../../catalog";
import { pagecontainerStyle, pageheadStyle, stagedEntrance } from "../shell/InstitutionalChrome.tsx";
import { useReducedMotion } from "../shell/trayflyouts.tsx";

/* the entrance stagger of the document: the [style] custom prop of .enter */
const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

/* the hero grammar of the batch: mono signal eyebrow, Bricolage display
 * title, one phrase — the ONE pagehead of the campaign, scaled editorial */
const heroEyebrowStyle: CSSProperties = {
  margin: 0,
  color: "var(--dtv3-sig)",
  font: "600 10px var(--dt-mono)",
  letterSpacing: ".08em",
};
const heroTitleStyle: CSSProperties = {
  margin: 0,
  color: "var(--dt-text)",
  font: "700 clamp(34px, 5vw, 52px)/1.06 var(--font-display, var(--dt-sans))",
  letterSpacing: "-0.02em",
  textWrap: "balance",
};
const heroLedeStyle: CSSProperties = {
  margin: 0,
  maxWidth: "54ch",
  color: "var(--dt-muted)",
  font: "400 13px/1.7 var(--dt-sans)",
};

/** the numbered index of a section/toc entry (01, 02, …). */
const index2 = (index: number) => String(index + 1).padStart(2, "0");

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  lede: string;
  sections: LegalSection[];
};

/** The editorial legal spread: hero + sticky TOC + numbered sections. */
export function LegalDocument({ eyebrow, title, lede, sections }: LegalDocumentProps) {
  const reduced = useReducedMotion();
  return (
    <div className="page-container atmos grain halftone" style={pagecontainerStyle}>
      <header className="pagehead" style={{ ...pageheadStyle, padding: "48px 0 30px" }}>
        <p className="pagehead__eyebrow" style={{ ...heroEyebrowStyle, ...stagedEntrance(reduced, 0) }}>
          {eyebrow}
        </p>
        <h1 className="pagehead__title" style={{ ...heroTitleStyle, ...stagedEntrance(reduced, 60) }}>
          {title}
        </h1>
        <p className="pagehead__lede" style={{ ...heroLedeStyle, ...stagedEntrance(reduced, 120) }}>
          {lede}
        </p>
      </header>
      <div className="r2c-doc">
        <nav className="r2c-toc enter" style={stagger(3)} aria-label="Document contents">
          <span className="r2c-toc__cap">contents</span>
          {sections.map((section, index) => (
            <a key={section.id} className="r2c-toc__item" href={`#${section.id}`}>
              <span className="r2c-toc__num" aria-hidden="true">
                {index2(index)}
              </span>
              {section.title}
            </a>
          ))}
        </nav>
        <div className="r2c-doc__body">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="r2c-doc__section enter" style={stagger(4 + index)}>
              <span className="r2c-doc__index" aria-hidden="true">
                {index2(index)}
              </span>
              <h2 className="r2c-doc__title">{section.title}</h2>
              <div className="r2c-doc__prose">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
