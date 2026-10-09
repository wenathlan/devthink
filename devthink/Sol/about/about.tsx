/**
 * about page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Sol institutional — the public about surface of the
 * platform OS. One warm-dark frame with a single amber light; the narrative
 * blocks, the principle table and the prepared media areas render from the
 * DB layer with reviewed offline seeds, and the family and timeline sections
 * reuse the accessors the explore and history surfaces already read. */
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
      <div className="page-container" style={containerStyle}>
        <AboutHero />
        {blocks.map((block) => (
          <section key={block.id} className="inst-section">
            <h2>{block.heading}</h2>
            {block.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        <div className="inst-media-grid">
          {media.map((slot) => (
            <figure key={slot.id} className="inst-media" style={{ aspectRatio: slot.ratio }} aria-label="media area">
              <figcaption>
                <span className="inst-media__label">{slot.label}</span>
                <span className="inst-media__caption">{slot.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <section className="inst-section">
          <h2>Principles</h2>
          <p className="inst-section__intro">
            Three commitments the platform keeps on every surface, from the CLI flags to the browser routes.
          </p>
          <div className="inst-principles">
            {principles.map((principle) => (
              <article key={principle.id} className="inst-principle">
                <strong>{principle.name}</strong>
                <p>{principle.detail}</p>
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
