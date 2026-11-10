/**
 * ingest page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * ingest — the detailed engine wave remount (the owner's order the
 * construction pass pinned, answered): the decomposition bench returns,
 * mounted on the REAL engine seats through the composite IngestBench
 * winget — the dropzone posting the upload route with the owner stamp, the
 * phase meter reading the polled job row (the same six phases the worker
 * walks), the document cards carrying the engine's own numbers (rms, peak,
 * onsets, frames, the pcm hash), the stem audition soloing through the
 * shared bus, and the reference shelf merging the gateway rows with the
 * offline mirror. The anchor itself stays the thin face the construction
 * law pins: it owns no state and imports no engine module — the bench
 * winget owns the mount, and while the shelf arms (the first paint before
 * the ingest store lands its answer) the route answers the construction
 * face it wore. The engine logics the bench rode (blobstore, coverpalette,
 * gatewayapi, ingest, kathesis, playerbus, wavwriter) keep riding their
 * own files untouched.
 */

import { label } from "../../labels.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { IngestBench } from "../wingets/IngestBench.tsx";
import { Constructionface } from "../../wingets";

/**
 * the ingest page: the decomposition bench under the ingest eyebrow.
 *
 * @returns the app shell with the bench mount.
 */
export default function Ingest() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.generate"), href: "/generate" },
    { label: label("nav.settings"), href: "/settings" },
  ];

  return (
    <Shell name="debonair" contained footerLinks={FOOTER_LINKS} domain="devthink.pro">
      {/* the bench mount rides the real engines; the construction face it
          wore answers the arming beat — the first paint before the shelf
          lands its answer (never a fake meter, never a dead bench) */}
      <IngestBench face={<Constructionface eyebrow={label("ingest.eyebrow")} />} />
    </Shell>
  );
}
