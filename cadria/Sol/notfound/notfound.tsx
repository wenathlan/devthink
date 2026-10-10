/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # NotFound — the quiet 404 (design doctrine pass): one animated icon, one
// lowercase line, one honest sentence, one quiet action home. no stand-in
// frame, no second cta, no loud button — the page doesn't pretend the
// destination exists.
import { Link } from "wouter";
import { Shell } from "../shell/Shell.tsx";

export default function NotFound() {
  return (
    <Shell>
      <section aria-labelledby="nf-h" style={{ maxWidth: 560, paddingTop: 16 }}>
        <span className="icon-anim" aria-hidden="true" style={{ marginBottom: 20, cursor: "default" }}>
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          >
            <rect x="3.5" y="3.5" width="17" height="17" rx="3" strokeDasharray="3.4 2.6" />
            <path d="M9.5 14.5 L14.5 9.5" />
            <path d="M9.5 9.5 L14.5 14.5" opacity="0.45" />
          </svg>
        </span>
        <p className="mono-label reveal" style={{ margin: "0 0 12px" }}>
          404 · empty frame
        </p>
        <h1 id="nf-h" className="wordmark reveal" style={{ margin: "0 0 14px" }}>
          nothing lives here.
        </h1>
        <p className="lede-tight reveal" style={{ marginBottom: 0 }}>
          the url reached a frame the engine never rendered. the queue stays honest — this page carries no stand-in.
        </p>
        <div className="btn-row-tight reveal">
          <Link className="btn btn--quiet" href="/">
            back home
          </Link>
        </div>
      </section>
    </Shell>
  );
}
