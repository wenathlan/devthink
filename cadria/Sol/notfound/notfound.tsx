/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # NotFound — sub-anchor of the 404: the empty render queue. The only 404 of the
// theme; there is no 404.html anywhere.
import { Link } from "wouter";
import { type NavLink, Shell } from "../shell/Shell.ts";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Player", href: "/player" },
  { label: "Studio", href: "/studio" },
  { label: "Gallery", href: "/gallery" },
  { label: "Settings", href: "/settings" },
];

export default function NotFound() {
  return (
    <Shell name="cadria" contained footerLinks={FOOTER_LINKS} themeButton={false} domain="cadria.devthink.pro">
      <p className="eyebrow">404 · render queue empty</p>
      <h1 className="wordmark wordmark-notfound">This frame never rendered.</h1>
      <p className="lede-tight">
        The timeline reached a frame that doesn't exist. The URL bar stayed clean, and the engine never dropped a real
        one — try the player or head home.
      </p>
      <div className="btn-row-tight">
        <Link className="btn" href="/">
          Back home
        </Link>
        <Link className="btn secondary" href="/player">
          Open the player
        </Link>
      </div>
      <div className="player-frame dim" role="img" aria-label="Empty player frame showing a zeroed timecode">
        <span className="pf-tc" style={{ fontSize: "1rem", color: "var(--sol-faint)" }}>
          NO SIGNAL · 00:00 / 00:00
        </span>
        <span className="pf-bar abs" aria-hidden="true" />
      </div>
    </Shell>
  );
}
