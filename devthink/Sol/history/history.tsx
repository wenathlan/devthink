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
 * export changes.
 *
 * R2-b data ledger: the body flips to the asymmetric 1.6fr/1fr read — the
 * rung ladder dominant on the left, the margin rail sticky on the right —
 * and the hero joins the staged editorial grammar (engine .shader-stage +
 * one .shader-fallback bloom + .halftone-edge + grain, mono eyebrow →
 * Bricolage display line → one phrase, one .enter entrance). Rows are
 * hairline ledgers with the signal 10% hover tint, the version numerals
 * ride mono 700 tabular and the stamps read mono lowercase. The rail gains
 * the real facts (rungs stamped / latest / the chain ends) and the chain
 * sparkline: one tick per rung along a mono axis, the latest tick signal.
 * 240ms rises at 60ms steps, reduced-motion guarded. No route, data or
 * export changes. */
import { History as HistoryIcon, TerminalSquare } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import { ShellChrome } from "@/shell/ShellChrome";
import { type Rung, releaseLadder } from "../../catalog";

/** the entrance stagger of the page: one orchestrated rise through the
 * engine .enter kit, the delay reading the --i custom prop (70ms steps). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

/** The history slice of the R2-b pass: the asymmetric ledger, the row
 * washes, the rail facts and the chain axis live with the page (the theme
 * stylesheet keeps the shared skins). The atmosphere guard keeps the C1 and
 * engine layers off the pointer path; the rail folds under the ladder on
 * narrow viewports. */
const HISTORY_CSS = `
.atmos::before, .atmos::after, .grain::before, .grain::after,
.halftone::before, .halftone::after { pointer-events: none; }
.control-page.atmos { position: relative; }
.hs-body { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(240px, 1fr); gap: 34px; align-items: start; }
.hs-ladder { display: grid; min-width: 0; }
.hs-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 0 12px 12px 2px; border-bottom: 1px solid var(--dt-edge-strong); }
.hs-head h2 { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--dtv3-ink-1); font: 600 11px var(--dt-mono); letter-spacing: .08em; text-transform: lowercase; }
.hs-head h2 svg { color: var(--dtv3-sig); flex-shrink: 0; }
.hs-count { margin: 0; color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .08em; font-variant-numeric: tabular-nums; }
.hs-rungs { display: grid; margin: 0; padding: 0; list-style: none; }
.hs-run { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 14px; align-items: baseline; padding: 14px 12px 14px 2px; border-bottom: 1px solid var(--dtv3-hairline); border-radius: 10px; transition: background 160ms var(--dtv3-ease); animation: hsRise 240ms var(--dtv3-ease) backwards; animation-delay: calc(var(--i, 0) * 60ms); }
.hs-run:hover { background: color-mix(in srgb, var(--dtv3-sig) 10%, transparent); }
.hs-run h3 { display: flex; align-items: center; gap: 10px; margin: 0; color: var(--dtv3-ink-1); font: 700 14px var(--dt-mono); font-variant-numeric: tabular-nums; }
.hs-badge { padding: 2px 9px; color: var(--dtv3-sig); background: color-mix(in srgb, var(--dtv3-sig) 10%, transparent); border: 1px solid color-mix(in srgb, var(--dtv3-sig) 30%, transparent); border-radius: 999px; font: 600 9px var(--dt-mono); letter-spacing: .08em; text-transform: lowercase; }
.hs-stamp { justify-self: end; color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .08em; text-transform: lowercase; }
.hs-run > p { grid-column: 1 / -1; margin: 0; color: var(--dtv3-ink-2); font: 400 12px/1.7 var(--dt-sans); }
.hs-rail { position: sticky; top: 88px; display: grid; gap: 18px; align-content: start; min-width: 0; }
.hs-intro { margin: 0; color: var(--dtv3-ink-2); font: 400 12px/1.8 var(--dt-sans); }
.hs-facts { display: grid; margin: 0; }
.hs-fact { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 10px 2px; border-bottom: 1px solid var(--dtv3-hairline); }
.hs-fact dt { margin: 0; color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .08em; text-transform: lowercase; }
.hs-fact dd { margin: 0; color: var(--dtv3-ink-1); font: 700 13px var(--dt-mono); font-variant-numeric: tabular-nums; }
.hs-axis { position: relative; display: block; height: 16px; margin-top: 2px; background: repeating-linear-gradient(90deg, var(--dtv3-hairline) 0 1px, transparent 1px 10px); background-position: 0 100%; background-repeat: repeat-x; background-size: auto 5px; }
.hs-axis i { position: absolute; top: 50%; width: 7px; height: 7px; border-radius: 50%; background: var(--dtv3-ink-3); transform: translate(-50%, -50%); }
.hs-axis i[data-latest="true"] { background: var(--dtv3-sig); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dtv3-sig) 18%, transparent); }
@keyframes hsRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@media (max-width: 880px) { .hs-body { grid-template-columns: minmax(0, 1fr); } .hs-rail { position: static; } }
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

  /** the real chain facts: the catalog answers the ladder newest-first, so
   * the latest rung is the first and the chain opens at the last one. */
  const latest = rungs.find((rung) => rung.latest)?.version ?? rungs[0]?.version ?? "—";
  const oldest = rungs.length ? rungs[rungs.length - 1].version : "—";
  /** the chain sparkline: one tick per rung along the mono axis, oldest
   * left, latest right; positions are the rung order, never invented data. */
  const tickLeft = (index: number): string => `${((rungs.length - 1 - index + 1) / (rungs.length + 1)) * 100}%`;

  return (
    <main className="control-page atmos">
      <ShellChrome />
      <div className="page-container">
        <header className="pagehead r2b-head shader-stage halftone-edge enter" style={step(0)}>
          <div className="shader-fallback" aria-hidden="true" />
          <div className="grain-overlay" aria-hidden="true" />
          <p className="pagehead__eyebrow r2a-eyebrow">devthink · history</p>
          <h1 className="pagehead__title r2a-display">The release ladder</h1>
          <p className="pagehead__lede r2a-lede">Every release stamps a rung.</p>
          {rungs.length ? (
            <p className="r2b-meta">
              {rungs.length} rungs · latest {latest}
            </p>
          ) : null}
        </header>

        <div className="hs-body">
          <section className="hs-ladder" aria-labelledby="hs-milestones">
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
                    style={step(index)}
                  >
                    <h3>
                      {rung.version}
                      {rung.latest ? <span className="hs-badge">latest</span> : null}
                    </h3>
                    <time className="hs-stamp">{rung.stamp}</time>
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

          <aside className="hs-rail">
            <p className="hs-intro">
              Every release stamps the rung. The full 101-version chain of the extension family (1.1.1 → 2.0.2) and the
              platform ladder live in the repo <code>CHANGELOG.md</code>.
            </p>
            {rungs.length ? (
              <>
                <dl className="hs-facts">
                  <div className="hs-fact">
                    <dt>rungs stamped</dt>
                    <dd>{rungs.length}</dd>
                  </div>
                  <div className="hs-fact">
                    <dt>latest</dt>
                    <dd>{latest}</dd>
                  </div>
                  <div className="hs-fact">
                    <dt>chain</dt>
                    <dd>
                      {oldest} → {latest}
                    </dd>
                  </div>
                </dl>
                <span className="hs-axis" aria-hidden="true">
                  {rungs.map((rung, index) => (
                    <i
                      key={rung.version}
                      data-latest={rung.latest ? "true" : undefined}
                      style={{ left: tickLeft(index) }}
                    />
                  ))}
                </span>
              </>
            ) : null}
          </aside>
        </div>

        <footer className="control-page__footer">
          <TerminalSquare size={14} aria-hidden="true" />
          provider credentials stay in <code>~/.config/devthink/auth.json</code>
        </footer>
      </div>
    </main>
  );
}
