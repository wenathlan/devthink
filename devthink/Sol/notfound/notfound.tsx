/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Sol institutional — the professional 404. It rides the ONE
 * shell chrome (ShellChrome, the same navbar every page mounts) and the
 * .pagehead hero contract of the campaign: the mono "devthink · 404" eyebrow,
 * one title, one lede and two right-aligned actions (back home, explore).
 * The stage carries the named solar light source and the atmosphere hooks;
 * the Modulify-style halftone dot dissolve sits behind the hero object,
 * masked into the top right edge, and the hero rises once, staggered, then
 * holds still (guarded by the reduced-motion preference). */
import { Compass, Home } from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "wouter";
import {
  pagecontainerStyle,
  pageheadActionsStyle,
  pageheadEyebrowStyle,
  pageheadLedeStyle,
  pageheadStyle,
  pageheadTitleStyle,
  pagestageStyle,
  stagedEntrance,
} from "../shell/InstitutionalChrome";
import { ShellChrome } from "../shell/ShellChrome";
import { useReducedMotion } from "../shell/trayflyouts";

const actionStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  minHeight: 32,
  padding: "0 12px",
  color: "var(--dt-text)",
  background: "rgb(255 255 255 / 6%)",
  border: "1px solid var(--dt-edge-strong)",
  borderRadius: 8,
  font: "500 10px var(--dt-mono)",
  letterSpacing: ".08em",
  textTransform: "uppercase",
  textDecoration: "none",
  transition: "background 140ms var(--dt-ease), border-color 140ms var(--dt-ease)",
};

const primaryActionStyle: CSSProperties = { ...actionStyle, background: "rgb(255 255 255 / 12%)" };

/* the 404 stage: the workbench canvas under the sticky shell navbar, lit by
 * the one solar source of the campaign */
const notfoundStageStyle: CSSProperties = {
  ...pagestageStyle,
  placeItems: "start center",
  minHeight: "calc(100dvh - var(--shell-top))",
  padding: 0,
};

/* the halftone edge motif behind the hero object: the campaign dot dissolve,
 * masked into the top right corner so it never touches the copy */
const halftoneEdgeStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  backgroundImage: "radial-gradient(rgb(245 158 11 / 15%) 1px, transparent 1.4px)",
  backgroundSize: "11px 11px",
  maskImage: "radial-gradient(560px 380px at 100% 0%, #000 0%, transparent 72%)",
  WebkitMaskImage: "radial-gradient(560px 380px at 100% 0%, #000 0%, transparent 72%)",
};

/* the hero stack sits above the motif (positioned later in paint order) */
const heroObjectStyle: CSSProperties = {
  position: "relative",
  zIndex: 1,
  width: "100%",
  display: "grid",
  justifyItems: "start",
  rowGap: 12,
};

export default function NotFound() {
  const reduced = useReducedMotion();
  return (
    <>
      <ShellChrome />
      <main className="notfound-page atmos grain" style={notfoundStageStyle}>
        <div className="page-container" style={pagecontainerStyle}>
          <section className="pagehead" style={{ ...pageheadStyle, position: "relative" }} aria-label="Page not found">
            <div aria-hidden="true" style={halftoneEdgeStyle} />
            <div style={heroObjectStyle}>
              <p className="pagehead__eyebrow" style={{ ...pageheadEyebrowStyle, ...stagedEntrance(reduced, 0) }}>
                devthink · 404
              </p>
              <h1 className="pagehead__title" style={{ ...pageheadTitleStyle, ...stagedEntrance(reduced, 70) }}>
                This address leads nowhere.
              </h1>
              <p className="pagehead__lede" style={{ ...pageheadLedeStyle, ...stagedEntrance(reduced, 140) }}>
                The page was moved, retired, or never existed. Nothing was lost — the workbench and the exploration
                landing are one step away.
              </p>
              <div className="pagehead__actions" style={{ ...pageheadActionsStyle, ...stagedEntrance(reduced, 210) }}>
                <Link href="/" style={primaryActionStyle} aria-label="Back home">
                  <Home size={13} aria-hidden="true" />
                  back home
                </Link>
                <Link href="/explore" style={actionStyle}>
                  <Compass size={13} aria-hidden="true" />
                  explore
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
