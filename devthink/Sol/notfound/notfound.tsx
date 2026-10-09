/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Sol institutional — campaign v3 r2-c: the signature 404.
 * ONE light source (a single signal bloom high on the right — the stage
 * carries it alone), ONE accent (#ff5f00). The signature moment is the
 * giant ghost display numeral — Bricolage 800 at a 15% signal tint, cropped
 * by the stage's right edge, breathing on the r1-c loop — behind an
 * editorial copy column: the mono eyebrow, ONE mono line and ONE action
 * button (back home, the .press voice). The copy rises once, staggered;
 * everything holds still for the reduced-motion visitor. */
import { Home } from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "wouter";
import { pagecontainerStyle, stagedEntrance } from "../shell/InstitutionalChrome";
import { ShellChrome } from "../shell/ShellChrome";
import { useReducedMotion } from "../shell/trayflyouts";

/* the stage: the workbench canvas under the sticky shell navbar, lit by the
 * ONE signal source of the campaign (no second light, no cool wash); the
 * container owns the measure, so the stage carries no padding of its own */
const notfoundStageStyle: CSSProperties = {
  padding: 0,
  background: "radial-gradient(1200px 720px at 78% -14%, rgb(255 95 0 / 9%), transparent 62%), var(--sol-canvas)",
};

/* the head + line grammar of the batch: mono signal eyebrow, one mono line */
const ghostEyebrowStyle: CSSProperties = {
  margin: 0,
  color: "var(--dtv3-sig)",
  font: "600 10px var(--dt-mono)",
  letterSpacing: ".08em",
};

export default function NotFound() {
  const reduced = useReducedMotion();
  return (
    <>
      <ShellChrome />
      <main className="notfound-page atmos grain" style={notfoundStageStyle}>
        <div className="page-container" style={pagecontainerStyle}>
          <section className="r2c-404stage" aria-label="Page not found">
            <span className="r2c-ghost" aria-hidden="true">
              <span className="r2c-ghostnum breathe">404</span>
            </span>
            <div className="r2c-404copy">
              <p className="pagehead__eyebrow" style={{ ...ghostEyebrowStyle, ...stagedEntrance(reduced, 0) }}>
                devthink · 404
              </p>
              <p className="r2c-404line" style={stagedEntrance(reduced, 70)}>
                this address leads nowhere — nothing was lost; the workbench is one step away.
              </p>
              <Link
                href="/"
                className="r2c-btn r2c-btn--primary press"
                style={stagedEntrance(reduced, 140)}
                aria-label="Back home"
              >
                <Home size={14} aria-hidden="true" />
                back home
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
