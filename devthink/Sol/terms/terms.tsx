/**
 * terms page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Sol institutional — the public terms of use surface. The
 * hero rides the ONE .pagehead grammar of the campaign (solar mono eyebrow,
 * display-face title, one lede, closing hairline) and the numbered sections
 * render from the institutional.terms catalog kind as an editorial document:
 * a generous left index column, 20px display titles, 13px/1.7 body, no box
 * walls. The atmosphere hooks (atmos / grain / halftone) ride the container
 * until the wave stylesheet lands; the shell chrome and footer come from the
 * shared institutional chrome. */
import { useEffect, useState } from "react";
import { type LegalSection, termsSections } from "../../catalog";
import {
  InstitutionalChrome,
  InstitutionalFooter,
  InstitutionalLegal,
  pagecontainerStyle,
  pageheadEyebrowStyle,
  pageheadLedeStyle,
  pageheadStyle,
  pageheadTitleStyle,
  stagedEntrance,
} from "../shell/InstitutionalChrome";
import { useReducedMotion } from "../shell/trayflyouts";

export default function Terms() {
  const [sections, setSections] = useState<LegalSection[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    void termsSections().then(setSections);
  }, []);

  return (
    <main className="inst-page">
      <InstitutionalChrome />
      <div className="page-container atmos grain halftone" style={pagecontainerStyle}>
        <header className="pagehead" style={pageheadStyle}>
          <p className="pagehead__eyebrow" style={{ ...pageheadEyebrowStyle, ...stagedEntrance(reduced, 0) }}>
            terms of use
          </p>
          <h1 className="pagehead__title" style={{ ...pageheadTitleStyle, ...stagedEntrance(reduced, 60) }}>
            Terms of use.
          </h1>
          <p className="pagehead__lede" style={{ ...pageheadLedeStyle, ...stagedEntrance(reduced, 120) }}>
            The rules that govern the use of this site: what the platform serves, what visitors may do with it and how
            the operator handles change. The numbered sections below are part of the site contract.
          </p>
        </header>
        <InstitutionalLegal sections={sections} />
      </div>
      <InstitutionalFooter />
    </main>
  );
}
