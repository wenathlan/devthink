/**
 * studio page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * studio — the detailed engine wave (the owner order of the waves,
 * landed): the generation panes ride the real engine seats again — the
 * StudioBench composite winget (one mount: the source rail over the dual
 * decode path, the generation through the style-biased project chain, the
 * stage art breathing the descriptor's beat grid, the export row and the
 * visualize panel of the versawase engine) answers the route with the
 * construction face carried as its arming face, and the PipelineBench of
 * the transcode walk rides below it (the 24-stage pipeline over the
 * gateway's node lane — its own honest reading/offline states). The
 * engine logics the panes rode (gateway, image, introfixtures, synth)
 * never left their own files. the anchor renders BARE: the one Shell
 * chrome lives in sol/Sol.tsx.
 */

import { label } from "../../labels.ts";
import { Constructionface, PipelineBench, StudioBench } from "../../wingets";

/**
 * the studio page: the real generation bench and the transcode pipeline
 * under the studio eyebrow.
 *
 * @returns the bench element with its arming face, the pipeline below.
 */
export default function Studio() {
  return (
    <>
      <StudioBench face={<Constructionface eyebrow={label("studio.eyebrow")} />} />
      <PipelineBench />
    </>
  );
}
