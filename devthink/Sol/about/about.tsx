/**
 * about page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Sol institutional — the public about surface of the
 * platform OS (campaign v3 · r2-a), cut as an editorial spread: ONE named
 * light (the morning window the hero stages) and the signal accent at the
 * 90/10 split. One dominant narrative block beside a numbered hairline rail,
 * a varied media band, the principles as a numbered manifesto (hairline
 * rows, no card boxes), the family as a specimen wall of identity-lit tiles
 * (no box walls — the color-mix light carries each site's accent) and the
 * ladder split against a narrow head rail with the rung count as a display
 * stat. The narrative rows, the principle table and the prepared media
 * areas render from the DB layer with reviewed offline seeds, and the
 * family and timeline sections reuse the accessors the explore and history
 * surfaces already read. The folder stylesheet below is the page-app's own
 * slice of the wave: it lands once at import time and never touches the
 * shared theme stylesheet. */

import { type CSSProperties, useEffect, useState } from "react";
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
 * the about page-app stylesheet — the r2-a editorial pass of this folder:
 * the asymmetric spread (1.6fr/1fr) and hero, the hairline manifesto rows,
 * the media band without the box walls and the family wall rebuilt as
 * identity-lit tiles (the color-mix light behind, no borders). Scoped to
 * the classes only this folder mounts; the film grain and the halftone edge
 * ride the engine utilities the hero stages.
 * ------------------------------------------------------------------------ */
const ABOUT_CSS = `
.inst-section h2 { font-family: var(--font-display, var(--dt-sans)); color: var(--dtv3-ink-1); }
.halftone::after, .grain::before { pointer-events: none; }
.r2a-about-light { background: radial-gradient(52% 48% at 84% 0%, color-mix(in srgb, var(--dtv3-signal) 13%, transparent) 0%, transparent 66%); }
.about-hero { position: relative; display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); align-items: end; gap: clamp(28px, 4vw, 64px); }
.about-spread { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: clamp(28px, 4vw, 64px); align-items: start; }
.about-spread > * { min-width: 0; }
.about-block--dominant h2 { font-size: clamp(26px, 3.4vw, 40px); letter-spacing: -.025em; }
.about-block--dominant p { font-size: 14.5px; }
.about-block--rail { padding-left: clamp(20px, 2.6vw, 32px); border-left: 1px solid var(--dtv3-hairline); }
.about-block__index { margin: 0 0 2px; color: var(--dtv3-ink-3); font: 500 10px var(--font-mono, var(--dt-mono)); letter-spacing: .08em; font-variant-numeric: tabular-nums; }
.about-media-band { grid-template-columns: repeat(6, 1fr); }
.inst-media { background: transparent; border: 1px solid var(--dtv3-hairline); border-radius: 14px; box-shadow: none; }
.inst-media::before { background-image: linear-gradient(rgb(255 255 255 / 2%) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 2%) 1px, transparent 1px); }
[data-theme="light"] .inst-media::before { background-image: linear-gradient(rgb(23 25 31 / 3%) 1px, transparent 1px), linear-gradient(90deg, rgb(23 25 31 / 3%) 1px, transparent 1px); }
.inst-media__label { color: var(--dtv3-sig); }
.about-manifesto { display: grid; margin-top: 6px; }
.about-manifesto__row { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.4fr); gap: 18px; padding: 18px 0; border-top: 1px solid var(--dtv3-hairline); }
.about-manifesto__row strong { color: var(--dtv3-ink-1); font: 600 15px/1.35 var(--font-display, var(--dt-sans)); letter-spacing: -.01em; }
.about-manifesto__row:first-child strong { font-size: 19px; }
.about-manifesto__row p { margin: 0; color: var(--dtv3-ink-2); font-size: 13px; line-height: 1.7; text-wrap: pretty; }
.about-manifesto__index { color: var(--dtv3-ink-3); font: 500 11px var(--font-mono, var(--dt-mono)); font-variant-numeric: tabular-nums; }
.family-wall { display: grid; grid-template-columns: repeat(12, 1fr); gap: 8px; margin-top: 14px; }
.family-wall__tile { position: relative; display: grid; align-content: start; gap: 7px; padding: 16px; background: transparent; border: 0; border-radius: 12px; color: inherit; text-decoration: none; transition: transform 240ms var(--dtv3-ease), background 160ms var(--dtv3-ease); }
.family-wall__tile::before { content: ""; position: absolute; inset: -4px -2px; z-index: -1; border-radius: 14px; background: radial-gradient(120% 92% at 50% 12%, color-mix(in srgb, var(--tile-accent, var(--dtv3-sig)) 18%, transparent), transparent 72%); opacity: .55; transition: opacity 240ms var(--dtv3-ease); pointer-events: none; }
.family-wall__tile:hover { background: rgb(255 255 255 / 3%); transform: translateY(-3px); }
.family-wall__tile:hover::before { opacity: 1; }
.family-wall__tile:active { transform: translateY(0) scale(.97); }
.family-wall__tile:focus-visible { outline: 2px solid color-mix(in srgb, var(--dtv3-sig) 45%, transparent); outline-offset: 2px; }
[data-theme="light"] .family-wall__tile:hover { background: rgb(23 25 31 / 3%); }
.family-wall__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--tile-accent, var(--dtv3-sig)); box-shadow: 0 0 0 3px color-mix(in oklab, var(--tile-accent, var(--dtv3-sig)) 20%, transparent); }
.family-wall__tile strong { color: var(--dtv3-ink-1); font: 600 14px/1.35 var(--font-display, var(--dt-sans)); letter-spacing: -.01em; }
.family-wall__tile p { margin: 0; color: var(--dtv3-ink-2); font-size: 12.5px; line-height: 1.65; text-wrap: pretty; }
.family-wall__tile--dominant { grid-column: span 7; padding: 22px 20px; }
.family-wall__tile--dominant strong { font-size: 19px; }
.family-wall__tile--dominant p { max-width: 46ch; }
.family-wall__tile:nth-child(2) { grid-column: span 5; }
.family-wall__tile:nth-child(3) { grid-column: span 5; }
.family-wall__tile:nth-child(4) { grid-column: span 7; }
.family-wall__tile:nth-child(5) { grid-column: span 6; }
.family-wall__tile:nth-child(6) { grid-column: span 6; }
.family-wall__tile:nth-child(n+7) { grid-column: span 4; }
.about-ladder { display: grid; grid-template-columns: minmax(220px, .62fr) minmax(0, 1fr); gap: clamp(28px, 4vw, 56px); align-items: start; }
.about-ladder__head { display: grid; gap: 14px; align-content: start; }
.inst-timeline { max-width: 680px; margin: 8px 0 0; }
.inst-timeline li { border-left: 2px solid var(--dtv3-hairline); }
.inst-timeline li::before { background: var(--dt-base); border-color: var(--dtv3-sig); }
.inst-timeline__version { color: var(--dtv3-sig); }
.inst-timeline__latest { color: var(--dtv3-sig); background: color-mix(in srgb, var(--dtv3-sig) 14%, transparent); border-radius: 999px; }
.inst-timeline strong { color: var(--dtv3-ink-1); }
[data-theme="light"] .inst-timeline li::before { background: var(--sol-canvas, #fff); }
@media (max-width: 860px) {
  .about-hero, .about-spread, .about-ladder { grid-template-columns: 1fr; }
  .about-hero { gap: 20px; }
  .about-block--rail { padding-left: 0; border-left: 0; padding-top: 18px; border-top: 1px solid var(--dtv3-hairline); }
  .about-manifesto__row { grid-template-columns: 1fr; gap: 8px; }
  .family-wall__tile, .family-wall__tile--dominant { grid-column: 1 / -1; }
  .about-media-band { grid-template-columns: 1fr; }
  .about-media-band > figure { grid-column: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .family-wall__tile { transition: none; }
}
[data-motion="reduced"] .family-wall__tile { transition: none; }
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
 * and the generous 40px section rhythm, inline so the column stands before
 * the wave-2 stylesheet lands on the shared class */
const containerStyle = {
  width: "100%",
  maxWidth: 1180,
  marginInline: "auto",
  padding: "24px clamp(24px, 4vw, 32px) 96px",
  display: "grid",
  alignContent: "start",
  gap: 40,
} as const;

const bodyStyle = { margin: 0, maxWidth: "68ch", fontSize: 14, lineHeight: 1.8 } as const;
const blockTitleStyle = { margin: 0, letterSpacing: "-.02em" } as const;

/** the entrance stagger of the page: one orchestrated rise through the
 * engine .enter kit, the delay reading the --i custom prop (70ms steps). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

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
                <section
                  key={block.id}
                  className="inst-section about-block about-block--dominant enter"
                  style={step(1)}
                >
                  <h2 style={blockTitleStyle}>{block.heading}</h2>
                  {block.body.map((paragraph) => (
                    <p key={paragraph} style={bodyStyle}>
                      {paragraph}
                    </p>
                  ))}
                </section>
              ) : (
                <section
                  key={block.id}
                  className="inst-section about-block about-block--rail enter"
                  style={step(index + 1)}
                >
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
          <div className="inst-media-grid about-media-band enter" style={step(2)}>
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

        <section className="inst-section enter" style={step(3)}>
          <p className="r2a-kicker">
            the manifesto
            <b>{`${principles.length} commitments`}</b>
          </p>
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
