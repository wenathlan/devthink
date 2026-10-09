/**
 * about page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Sol institutional — the public about surface of the
 * platform OS, cut as an editorial spread instead of a stacked column: one
 * dominant narrative block beside a numbered rail, a varied media band, the
 * principles as a numbered manifesto (no card boxes), the family as a
 * specimen wall and the ladder split against a narrow head rail. The
 * narrative rows, the principle table and the prepared media areas render
 * from the DB layer with reviewed offline seeds, and the family and
 * timeline sections reuse the accessors the explore and history surfaces
 * already read. The folder stylesheet below is the page-app's own slice of
 * the wave-C1 atmosphere pass: it lands once at import time and never
 * touches the shared theme stylesheet. */

import { useEffect, useState } from "react";
import {
  type AboutBlock,
  aboutBlocks,
  type MediaSlot,
  mediaSlots,
  type Principle,
  principleTable,
} from "../../catalog";
import { InstitutionalChrome, InstitutionalFooter } from "../shell/InstitutionalChrome";
import { AboutFamily } from "./family";
import { AboutHero } from "./hero";
import { AboutTimeline } from "./timeline";

/* --------------------------------------------------------------------------
 * the about page-app stylesheet — the C1 atmosphere pass of this folder:
 * asymmetric splits, the specimen wall, the manifesto rows and the varied
 * media band. Scoped to the classes only this folder mounts; the film grain
 * and the halftone edge ride the shared .grain/.halftone classes the
 * atmosphere block of the wave lands on the theme.
 * ------------------------------------------------------------------------ */
const ABOUT_CSS = `
.inst-section h2 { font-family: var(--font-display, var(--dt-sans)); }
.halftone::after, .grain::before { pointer-events: none; }
.about-spread { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, .75fr); gap: 32px; align-items: start; }
.about-hero { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, .65fr); align-items: end; gap: 32px; }
.about-spread > * { min-width: 0; }
.about-block--dominant h2 { font-size: clamp(24px, 3vw, 32px); }
.about-block--dominant p { font-size: 13.5px; }
.about-block--rail { padding-left: 20px; border-left: 1px solid var(--dt-edge); }
.about-block__index { margin: 0; color: var(--dt-faint); font: 500 10px var(--font-mono, var(--dt-mono)); letter-spacing: .08em; }
.about-media-band { grid-template-columns: repeat(6, 1fr); }
.about-media-band > figure:first-child { grid-column: 1 / -1; }
.about-media-band > figure:nth-child(2), .about-media-band > figure:nth-child(3) { grid-column: span 3; }
.about-media-band > figure:nth-child(n+4) { grid-column: span 2; }
.about-manifesto { display: grid; margin-top: 6px; }
.about-manifesto__row { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.4fr); gap: 18px; padding: 18px 0; border-top: 1px solid var(--dt-edge); }
.about-manifesto__row:first-child { border-top-color: var(--dt-edge-strong); }
.about-manifesto__row strong { color: var(--dt-text); font: 600 15px/1.35 var(--font-display, var(--dt-sans)); letter-spacing: -.01em; }
.about-manifesto__row:first-child strong { font-size: 19px; }
.about-manifesto__row p { margin: 0; color: var(--dt-muted); font-size: 13px; line-height: 1.7; text-wrap: pretty; }
.about-manifesto__index { color: var(--dt-faint); font: 500 11px var(--font-mono, var(--dt-mono)); font-variant-numeric: tabular-nums; }
.family-wall { display: grid; grid-template-columns: repeat(12, 1fr); gap: 10px; margin-top: 14px; }
.family-wall__tile { position: relative; display: grid; align-content: start; gap: 7px; padding: 16px; background: rgb(25 28 35 / 72%); border: 1px solid var(--dt-edge); border-radius: 8px; color: inherit; text-decoration: none; transition: border-color 160ms var(--dt-ease), background 160ms var(--dt-ease), transform 160ms var(--dt-ease); }
.family-wall__tile:hover { border-color: var(--tile-accent, var(--dt-blue)); background: rgb(255 255 255 / 4%); transform: translateY(-2px); }
.family-wall__tile:active { transform: translateY(0) scale(.97); }
.family-wall__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--tile-accent, var(--dt-blue)); box-shadow: 0 0 0 3px color-mix(in oklab, var(--tile-accent, var(--dt-blue)) 20%, transparent); }
.family-wall__tile strong { color: var(--dt-text); font: 600 14px/1.35 var(--font-display, var(--dt-sans)); letter-spacing: -.01em; }
.family-wall__tile p { margin: 0; color: var(--dt-muted); font-size: 12.5px; line-height: 1.65; text-wrap: pretty; }
.family-wall__tile--dominant { grid-column: span 7; padding: 22px 20px; }
.family-wall__tile--dominant strong { font-size: 19px; }
.family-wall__tile--dominant p { max-width: 46ch; }
.family-wall__tile:nth-child(2) { grid-column: span 5; }
.family-wall__tile:nth-child(3) { grid-column: span 5; }
.family-wall__tile:nth-child(4) { grid-column: span 7; }
.family-wall__tile:nth-child(5) { grid-column: span 6; }
.family-wall__tile:nth-child(6) { grid-column: span 6; }
.family-wall__tile:nth-child(n+7) { grid-column: span 4; }
.about-ladder { display: grid; grid-template-columns: minmax(200px, .62fr) minmax(0, 1fr); gap: 28px; align-items: start; }
.about-ladder__head { display: grid; gap: 12px; align-content: start; }
.about-hero__action:hover { color: var(--dt-text); background: rgb(255 255 255 / 7%); border-color: var(--dt-edge-strong); }
.about-hero__action:active { transform: scale(.97); }
@media (max-width: 860px) {
  .about-hero, .about-spread, .about-ladder { grid-template-columns: 1fr; }
  .about-hero { gap: 20px; }
  .about-block--rail { padding-left: 0; border-left: 0; padding-top: 18px; border-top: 1px solid var(--dt-edge); }
  .about-manifesto__row { grid-template-columns: 1fr; gap: 8px; }
  .family-wall__tile, .family-wall__tile--dominant { grid-column: 1 / -1; }
  .about-media-band { grid-template-columns: 1fr; }
  .about-media-band > figure { grid-column: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .family-wall__tile, .about-hero__action { transition: none; }
}
`;

let aboutCssReady = false;

/** Injects the about stylesheet exactly once per document, at import time,
 * so the first paint of the page already stands on the finished grammar. */
function ensureAboutCss(): void {
  if (aboutCssReady || typeof document === "undefined") return;
  aboutCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-about-pass", "");
  tag.textContent = ABOUT_CSS;
  document.head.appendChild(tag);
}
ensureAboutCss();

/** the .page-container contract floor: max-width 1180px, the 24/32px padding
 * and the 32px section rhythm, inline so the column stands before the wave-2
 * stylesheet lands on the shared class */
const containerStyle = {
  width: "100%",
  maxWidth: 1180,
  marginInline: "auto",
  padding: "24px clamp(24px, 4vw, 32px) 48px",
  display: "grid",
  alignContent: "start",
  gap: 32,
} as const;

const bodyStyle = { margin: 0, maxWidth: "70ch", fontSize: 13, lineHeight: 1.7 } as const;
const blockTitleStyle = { margin: 0, letterSpacing: "-.02em" } as const;

export default function About() {
  const [blocks, setBlocks] = useState<AboutBlock[]>([]);
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [media, setMedia] = useState<MediaSlot[]>([]);

  useEffect(() => {
    void aboutBlocks().then(setBlocks);
    void principleTable().then(setPrinciples);
    void mediaSlots().then(setMedia);
  }, []);

  return (
    <main className="inst-page">
      <InstitutionalChrome />
      <div className="page-container grain" style={containerStyle}>
        <AboutHero />

        {blocks.length ? (
          <div className="about-spread">
            {blocks.map((block, index) =>
              index === 0 ? (
                <section key={block.id} className="inst-section about-block about-block--dominant">
                  <h2 style={blockTitleStyle}>{block.heading}</h2>
                  {block.body.map((paragraph) => (
                    <p key={paragraph} style={bodyStyle}>
                      {paragraph}
                    </p>
                  ))}
                </section>
              ) : (
                <section key={block.id} className="inst-section about-block about-block--rail">
                  <p className="about-block__index">{String(index + 1).padStart(2, "0")}</p>
                  <h2 style={blockTitleStyle}>{block.heading}</h2>
                  {block.body.map((paragraph) => (
                    <p key={paragraph} style={bodyStyle}>
                      {paragraph}
                    </p>
                  ))}
                </section>
              ),
            )}
          </div>
        ) : null}

        {media.length ? (
          <div className="inst-media-grid about-media-band">
            {media.map((slot) => (
              <figure key={slot.id} className="inst-media" style={{ aspectRatio: slot.ratio }} aria-label="media area">
                <figcaption>
                  <span className="inst-media__label">{slot.label}</span>
                  <span className="inst-media__caption">{slot.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}

        <section className="inst-section">
          <h2>Principles</h2>
          <p className="inst-section__intro">
            Three commitments the platform keeps on every surface, from the CLI flags to the browser routes.
          </p>
          <div className="about-manifesto">
            {principles.map((principle, index) => (
              <article key={principle.id} className="about-manifesto__row">
                <span className="about-manifesto__index">{String(index + 1).padStart(2, "0")}</span>
                <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
                  <strong>{principle.name}</strong>
                  <p>{principle.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <AboutFamily />
        <AboutTimeline />
      </div>
      <InstitutionalFooter />
    </main>
  );
}
