/**
 * history page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — the release rung ladder ported from the
 * static site; the ladder renders from the DB layer.
 *
 * C1-04 anti-vibe-code pass: the ladder becomes specimen-grade — the intro
 * paragraph is promoted to a sticky margin column (a real density shift
 * against the dominant ladder), every rung is a hairline-ruled row with a
 * quiet hover wash, versions and stamps ride tabular numerals, and the one
 * accent per state lands on the latest rung (solar orange dot + badge; every
 * other rung stays neutral). The .pagehead hero keeps the contract and
 * carries the .halftone edge, the ladder carries the .grain film, the page
 * carries the one .atmos light source (C1-01 paints all three). The rows
 * reveal in one staggered entrance and hold still; the loading/empty ladder
 * states keep the shared .control-empty card (no emoji). No route, data or
 * export changes. */
import { History as HistoryIcon, TerminalSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { ShellChrome } from "@/shell/ShellChrome";
import { type Rung, releaseLadder } from "../../catalog";

/** tabular numerals for every numeric readout of the page. */
const TABULAR = { fontVariantNumeric: "tabular-nums" } as const;

/** The history slice of the C1-04 pass: the specimen ladder layout, the row
 * washes and the latest accent live with the page (the theme stylesheet owns
 * the shared skin classes). The atmosphere guard keeps the C1-01 layers off
 * the pointer path; the margin column folds under the ladder on narrow
 * viewports. */
const HISTORY_CSS = `
.atmos::before, .atmos::after, .grain::before, .grain::after,
.halftone::before, .halftone::after { pointer-events: none; }
.control-page.atmos { position: relative; }
.pagehead.halftone { position: relative; }
.hs-body { display: grid; grid-template-columns: 264px minmax(0, 1fr); gap: 24px; align-items: start; }
.hs-margin { position: sticky; top: 24px; }
.hs-intro { margin: 0; color: var(--dt-muted); font: 400 12px/1.8 var(--dt-sans); }
.hs-intro code { color: var(--dt-blue); }
.hs-ladder { position: relative; padding: 18px 16px 6px; border: 1px solid var(--dt-edge); border-radius: 10px; background: rgb(25 28 35 / 72%); }
.hs-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 0 8px 12px; }
.hs-head h2 { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--dt-text); font: 600 15px var(--dt-sans); letter-spacing: -.01em; }
.hs-head h2 svg { color: var(--dt-blue); flex-shrink: 0; }
.hs-count { margin: 0; color: var(--dt-faint); font: 500 10px var(--dt-mono); letter-spacing: .08em; font-variant-numeric: tabular-nums; }
.hs-rungs { margin: 0; padding: 0; list-style: none; }
.hs-run { display: grid; grid-template-columns: 18px minmax(0, 1fr) auto; gap: 2px 12px; padding: 13px 8px; border-top: 1px solid var(--dt-edge); border-radius: 6px; transition: background 160ms var(--dt-ease); animation: hsRise 240ms cubic-bezier(.22, 1, .36, 1) backwards; }
.hs-run:first-child { border-top: 0; }
.hs-run:hover { background: rgb(255 255 255 / 3%); }
.hs-dot { grid-row: 1 / 3; justify-self: center; align-self: start; width: 9px; height: 9px; margin-top: 5px; border-radius: 50%; background: var(--dt-base); border: 2px solid var(--dt-faint); }
.hs-run--latest .hs-dot { border-color: var(--dt-orange); }
.hs-run h3 { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--dt-text); font: 600 14px var(--dt-mono); }
.hs-badge { padding: 2px 8px; color: var(--dt-orange); background: rgb(255 95 0 / 8%); border: 1px solid rgb(255 95 0 / 24%); border-radius: 4px; font: 600 9px var(--dt-mono); letter-spacing: .08em; text-transform: uppercase; }
.hs-stamp { align-self: center; color: var(--dt-faint); font: 500 10px var(--dt-mono); letter-spacing: .08em; }
.hs-run > p { grid-column: 2 / -1; margin: 0; color: var(--dt-muted); font: 400 12px/1.7 var(--dt-sans); }
@keyframes hsRise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 880px) { .hs-body { grid-template-columns: minmax(0, 1fr); } .hs-margin { position: static; } }
@media (prefers-reduced-motion: reduce) { .hs-run { animation: none; transition: none; } }
`;

let historyCssReady = false;

/** Injects the history stylesheet exactly once per document. */
function ensureHistoryCss(): void {
  if (historyCssReady || typeof document === "undefined") return;
  historyCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-history", "");
  tag.textContent = HISTORY_CSS;
  document.head.appendChild(tag);
}

export default function History() {
  ensureHistoryCss();
  const [rungs, setRungs] = useState<Rung[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void releaseLadder().then((rows) => {
      setRungs(rows);
      setLoaded(true);
    });
  }, []);

  return (
    <main className="control-page atmos">
      <ShellChrome />
      <div className="page-container">
        <header className="pagehead halftone">
          <p className="pagehead__eyebrow">devthink · history</p>
          <h1 className="pagehead__title">History</h1>
          <p className="pagehead__lede">
            Release history of the DevThink platform: the rung ladder from 1.1.1 to 2.0.40.
          </p>
        </header>

        <div className="hs-body">
          <aside className="hs-margin">
            <p className="hs-intro">
              Every release stamps the rung. The full 101-version chain of the extension family (1.1.1 → 2.0.2) and the
              platform ladder live in the repo <code>CHANGELOG.md</code>.
            </p>
          </aside>

          <section className="hs-ladder grain" aria-labelledby="hs-milestones">
            <div className="hs-head">
              <h2 id="hs-milestones">
                <HistoryIcon size={15} aria-hidden="true" />
                milestones
              </h2>
              {rungs.length ? <p className="hs-count">{rungs.length} rungs stamped</p> : null}
            </div>
            {rungs.length ? (
              <ol className="hs-rungs">
                {rungs.map((rung, index) => (
                  <li
                    key={rung.version}
                    className={rung.latest ? "hs-run hs-run--latest" : "hs-run"}
                    style={{ animationDelay: `${index * 36}ms` }}
                  >
                    <span className="hs-dot" aria-hidden="true" />
                    <h3>
                      <span style={TABULAR}>{rung.version}</span>
                      {rung.latest ? <span className="hs-badge">latest</span> : null}
                    </h3>
                    <time className="hs-stamp" style={TABULAR}>
                      {rung.stamp}
                    </time>
                    <p>{rung.note}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="control-empty">
                <h2>{loaded ? "no rungs stamped yet" : "loading the rung ladder…"}</h2>
                <p>
                  {loaded
                    ? "The ladder table has not answered any rungs, so the milestones column stays empty."
                    : "The ladder request is in flight — the milestones mount when it answers."}
                </p>
              </div>
            )}
          </section>
        </div>

        <footer className="control-page__footer">
          <TerminalSquare size={14} aria-hidden="true" />
          provider credentials stay in <code>~/.config/devthink/auth.json</code>
        </footer>
      </div>
    </main>
  );
}
