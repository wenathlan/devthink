/**
 * policy page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Sol institutional — campaign v3 r2-c: the editorial
 * legal document (shared grammar with the terms page, defined once in
 * ../terms/legalkit). ONE light (the .atmos signal veil — the cool
 * inst-page wash is switched off), ONE accent (#ff5f00 at the 90/10
 * discipline): a sticky 220px mono lowercase TOC beside the numbered
 * sections — hairline dividers, mono signal index, 20px display titles,
 * 68ch prose. No box walls, no card spam; the document rises once,
 * staggered after the hero. */
import { useEffect, useState } from "react";
import { type LegalSection, policySections } from "../../catalog";
import { InstitutionalChrome, InstitutionalFooter } from "../shell/InstitutionalChrome.tsx";
import { LegalDocument } from "../terms/legalkit.tsx";

export default function Policy() {
  const [sections, setSections] = useState<LegalSection[]>([]);

  useEffect(() => {
    void policySections().then(setSections);
  }, []);

  return (
    <main className="inst-page r2c-inst">
      <InstitutionalChrome />
      <LegalDocument
        eyebrow="privacy policy"
        title="Privacy policy."
        lede="What this site stores, and where the records live."
        sections={sections}
      />
      <InstitutionalFooter />
    </main>
  );
}
