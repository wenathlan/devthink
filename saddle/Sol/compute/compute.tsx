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
// fixed provider and state arrays died with the old page. Every word the
// page itself speaks rides the label store (labels.ts — the copy law).
import { BoxRegular as Box } from "@fluentui/react-icons";
import { PageShell } from "../shell/Shell.tsx";
import { label } from "../../labels.ts";
import { ComputeBootladder, ComputeModalitycatalog } from "../wingets";

export default function Compute() {
  return (
    <PageShell
      section={label("compute.shell.section")}
      label={label("compute.shell.label")}
      title={label("compute.shell.title")}
      intro={label("compute.shell.intro")}
    >
      <section className="content-section split-content">
        <div>
          <p className="eyebrow">{label("compute.split.eyebrow")}</p>
          <h2 className="section-title">{label("compute.split.title")}</h2>
        </div>
        <div className="prose-copy">
          <p>{label("compute.split.body1")}</p>
          <p>{label("compute.split.body2")}</p>
        </div>
      </section>
      <ComputeBootladder />
      <ComputeModalitycatalog />
      <section className="content-section note-band">
        <Box fontSize={21} aria-hidden="true" />
        <div>
          <p className="eyebrow">{label("compute.note.eyebrow")}</p>
          <p>{label("compute.note.body")}</p>
        </div>
      </section>
    </PageShell>
  );
}
