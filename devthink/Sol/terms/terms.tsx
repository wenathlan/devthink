/**
 * terms page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Sol institutional — the public terms of use surface. The
 * numbered sections render from the institutional.terms catalog kind with the
 * reviewed offline seeds; the shell chrome and the footer come from the
 * shared institutional chrome. */
import { useEffect, useState } from "react";
import { termsSections, type LegalSection } from "../../catalog";
import { InstitutionalChrome, InstitutionalFooter, InstitutionalLegal } from "../shell/InstitutionalChrome";

export default function Terms() {
  const [sections, setSections] = useState<LegalSection[]>([]);

  useEffect(() => {
    void termsSections().then(setSections);
  }, []);

  return (
    <main className="inst-page">
      <InstitutionalChrome />
      <header className="inst-hero">
        <p className="inst-hero__eyebrow">terms of use</p>
        <h1>Terms of use.</h1>
        <p className="inst-hero__lead">
          The rules that govern the use of this site: what the platform serves, what visitors may do with it and how
          the operator handles change. The numbered sections below are part of the site contract.
        </p>
      </header>
      <InstitutionalLegal sections={sections} />
      <InstitutionalFooter />
    </main>
  );
}
