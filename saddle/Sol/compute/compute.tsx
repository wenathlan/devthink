/**
 * compute page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Signal & Ledger: the compute face — the engine presents itself honestly.
// The page mounts the two api surfaces (the boot ladder and the modality
// catalog) and carries no provider table of its own: every row the visitor
// reads is served by the saddle engine through the internal api — the
// fixed provider and state arrays died with the old page.
import { BoxRegular as Box } from "@fluentui/react-icons";
import { PageShell } from "../shell/Shell.tsx";
import { ComputeBootladder, ComputeModalitycatalog } from "../wingets";

export default function Compute() {
  return (
    <PageShell
      section="03 / 06"
      label="Compute"
      title="The engine states its plan."
      intro="The compute face presents the modality catalog the saddle engine serves: the plan counts and every record ride the internal api on mount — nothing ships fixed inside the interface."
    >
      <section className="content-section split-content">
        <div>
          <p className="eyebrow">THE COMPUTE FACE</p>
          <h2 className="section-title">Ninety modalities, one honest table.</h2>
        </div>
        <div className="prose-copy">
          <p>
            The engine keeps the catalog; the interface only reads it. The plan counts, the boot ceilings and every
            record arrive through the saddle api — when the engine sleeps, the page says so instead of painting rows it
            does not have.
          </p>
          <p>
            The interface never touches the visitor browser, gpu or cpu: the sandbox and the saddle modalities act for
            the system over the internet.
          </p>
        </div>
      </section>
      <ComputeBootladder />
      <ComputeModalitycatalog />
      <section className="content-section note-band">
        <Box fontSize={21} aria-hidden="true" />
        <div>
          <p className="eyebrow">SERVED / NEVER SHIPPED</p>
          <p>
            The catalog dies with the engine, not with the page: the wingets consume the db through the internal apis,
            so a row changes when the engine changes it — never when the bundle ships.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
