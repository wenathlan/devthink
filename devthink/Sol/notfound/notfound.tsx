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
 * The actions are wouter links dressed as the win11 neutral button — mono
 * micro-label, 8px corners, hairline edge, wash fill; the persistent hover
 * refinement lands with the wave-2 stylesheet. */
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
} from "../shell/InstitutionalChrome";
import { ShellChrome } from "../shell/ShellChrome";

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

/* the 404 stage: the workbench canvas under the sticky shell navbar */
const notfoundStageStyle: CSSProperties = {
  placeItems: "start center",
  minHeight: "calc(100dvh - var(--shell-top))",
  padding: 0,
};

export default function NotFound() {
  return (
    <>
      <ShellChrome />
      <main className="notfound-page" style={notfoundStageStyle}>
        <div className="page-container" style={pagecontainerStyle}>
          <section className="pagehead" style={pageheadStyle} aria-label="Page not found">
            <p className="pagehead__eyebrow" style={pageheadEyebrowStyle}>
              devthink · 404
            </p>
            <h1 className="pagehead__title" style={pageheadTitleStyle}>
              This address leads nowhere.
            </h1>
            <p className="pagehead__lede" style={pageheadLedeStyle}>
              The page was moved, retired, or never existed. Nothing was lost — the workbench and the exploration
              landing are one step away.
            </p>
            <div className="pagehead__actions" style={pageheadActionsStyle}>
              <Link href="/" style={primaryActionStyle} aria-label="Back home">
                <Home size={13} aria-hidden="true" />
                back home
              </Link>
              <Link href="/explore" style={actionStyle}>
                <Compass size={13} aria-hidden="true" />
                explore
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
