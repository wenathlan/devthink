/**
 * automationnote.tsx — the one shared automation footnote of the native
 * pages: the calculator, the image studio, the video studio, the music
 * studio and the runner page all render this single loose component, so the
 * opt-in notice stays one line in one place instead of five copies.
 *
 * Style: DevThink Terminal Atelier — one honest line under the native
 * surfaces, aligned to the theme grammar: a 10px mono eyebrow over a 13px
 * body, the settings opt-in as the note's single interactive affordance
 * (hover color rise, the 2px var(--sol-focus) focus-visible ring at a 3px
 * offset, no motion under prefers-reduced-motion). The styles ride with the
 * component — the wave-2 stylesheet owns the shared classes, this block only
 * fixes what this footnote's grammar needs, on data attributes.
 */
import { PlugZap } from "lucide-react";
import { Link } from "wouter";

/** the note's slice of the theme grammar: eyebrow, body, link affordance */
const NOTE_CSS = `
.automation-note [data-note-text] { display: grid; gap: 2px; min-width: 0; }
.automation-note [data-note-eyebrow] { color: var(--dt-faint); font: 500 10px var(--dt-mono); letter-spacing: .12em; }
.automation-note [data-note-body] { color: var(--dt-muted); font: 400 13px/1.5 var(--dt-sans); }
.automation-note [data-note-link] { color: var(--sol-focus); border-radius: 2px; outline-offset: 3px; text-decoration: none; transition: color 140ms var(--dt-ease); }
.automation-note [data-note-link]:hover { color: var(--dt-text); }
.automation-note [data-note-link]:focus-visible { outline: 2px solid var(--sol-focus); }
@media (prefers-reduced-motion: reduce) {
  .automation-note [data-note-link] { transition: none; }
}
`;

let noteCssReady = false;

/** Injects the note stylesheet exactly once per document. */
function ensureNoteCss(): void {
  if (noteCssReady || typeof document === "undefined") return;
  noteCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-note", "");
  tag.textContent = NOTE_CSS;
  document.head.appendChild(tag);
}

export function AutomationNote() {
  ensureNoteCss();
  return (
    <p className="control-note automation-note">
      <PlugZap size={15} aria-hidden="true" style={{ color: "var(--dt-orange)", flexShrink: 0 }} />
      <span data-note-text="">
        <span data-note-eyebrow="">automation &amp; mcp ready</span>
        <span data-note-body="">
          opt in from{" "}
          <Link href="/settings" data-note-link="">
            settings
          </Link>{" "}
          — off by default, requests go only to non-local http/https hosts
        </span>
      </span>
    </p>
  );
}
