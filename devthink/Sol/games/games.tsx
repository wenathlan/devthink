/**
 * games page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — the runner page of the super platform.
 * DevThink executes the competitor executables by itself through the saddle
 * runner: the binaries render from the catalog rows and every launch is queued
 * over the gateway, so nothing is installed on and nothing is read from the
 * visitor machine.
 *
 * C1-04 anti-vibe-code pass: the uniform runner table is gone. The view now
 * carries ONE dominant object — the runner binaries as an editorial list on a
 * ladder rail, the lead binary expanded over compact support rows, the kind
 * read as a ladder dot (game = solar orange, application = signal blue), and
 * the launch actions stay on the 28px .apps-action ladder with tooltips. The
 * runner-boundary note and the shared automation note are demoted to a narrow
 * support rail beside the list, so the body reads main column + margin column
 * instead of three equal stacked panels. The .pagehead hero keeps the contract
 * and carries the .halftone edge; the list carries the .grain film; the page
 * carries the one .atmos light source (C1-01 paints all three). Rows reveal in
 * one staggered entrance and hold still; the ladder keeps queuebinarylaunch
 * behavior, routes and exports untouched.
 *
 * R2-b stage energy: the hero becomes the ONE staged panel — the engine
 * .shader-stage with a single .shader-fallback ember bloom, the
 * .halftone-edge dissolve, the film grain and the r2-a display grammar
 * (mono eyebrow → Bricolage display line → one phrase → real-count meta),
 * entering once through the engine .enter kit. The rows are wide hairline
 * ledgers — monogram cover left (initials cut from the real title), body
 * center, stats right with the display-700 numerals — and the lead row is
 * the ONE raised featured tile, center-popped on the spring. The kind dot
 * reads game = signal / application = neutral (the one accent at the 90/10
 * split). 240ms rises at 60ms steps, reduced-motion guarded. */
import { Gamepad2, Play, ShieldCheck, TerminalSquare } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import { toast } from "sonner";
import { AutomationNote } from "@/shell/automationnote";
import { ShellChrome } from "@/shell/ShellChrome";
import { type RunnerBinary, runnerBinaries } from "../../catalog";
import { queuebinarylaunch } from "../../runner";

/** the entrance stagger of the page: one orchestrated rise through the
 * engine .enter kit, the delay reading the --i custom prop (70ms steps). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

/** monogram — the two leading initials of a real title, cut for the cover
 * tile glyph; decorative, aria-hidden at the call site. */
function monogram(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** The games slice of the R2-b pass: the staged hero, the hairline ledger,
 * the featured center-pop and the kind states live with the page (the theme
 * stylesheet keeps the shared skins). The atmosphere guard keeps the C1 and
 * engine layers off the pointer path, and the rail folds under the ledger
 * when it would starve. */
const GAMES_CSS = `
.atmos::before, .atmos::after, .grain::before, .grain::after,
.halftone::before, .halftone::after { pointer-events: none; }
.control-page.atmos { position: relative; }
.gm-body { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(240px, 1fr); gap: 32px; align-items: start; }
.gm-stage { display: grid; min-width: 0; }
.gm-ledgerhead { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 0 12px 12px; border-bottom: 1px solid var(--dt-edge-strong); }
.gm-ledgerhead h2 { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--dtv3-ink-1); font: 600 11px var(--dt-mono); letter-spacing: .08em; text-transform: lowercase; }
.gm-ledgerhead h2 svg { color: var(--dtv3-sig); flex-shrink: 0; }
.gm-count { margin: 0; color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .08em; font-variant-numeric: tabular-nums; }
.gm-rows { margin: 0; padding: 0; list-style: none; }
.gm-row { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; gap: 6px 16px; align-items: center; padding: 16px 12px; border-bottom: 1px solid var(--dtv3-hairline); transition: background 160ms var(--dtv3-ease); animation: gmRise 240ms var(--dtv3-ease) backwards; animation-delay: calc(var(--i, 0) * 60ms); }
.gm-row:hover { background: rgb(255 255 255 / 3%); }
.gm-row--featured { border-radius: var(--dtv3-r-2); background: rgb(255 255 255 / 3%); border-bottom-color: transparent; box-shadow: 0 18px 44px rgb(0 0 0 / 32%), inset 0 1px 0 rgb(255 255 255 / 6%); }
.gm-row--featured:hover { background: rgb(255 255 255 / 4%); }
.gm-cover { display: grid; place-items: center; width: 48px; height: 48px; border: 1px solid var(--dtv3-hairline); border-radius: 12px; background: radial-gradient(90% 90% at 28% 18%, rgb(255 255 255 / 8%), transparent 72%), rgb(255 255 255 / 3%); color: var(--dtv3-ink-2); font: 700 13px/1 var(--dt-sans); letter-spacing: .04em; }
.gm-row--featured .gm-cover { width: 56px; height: 56px; border-color: color-mix(in srgb, var(--dtv3-sig) 32%, transparent); color: var(--dtv3-sig); background: radial-gradient(90% 90% at 28% 18%, color-mix(in srgb, var(--dtv3-sig) 18%, transparent), transparent 74%), rgb(255 255 255 / 3%); }
.gm-row__body { display: grid; gap: 3px; min-width: 0; }
.gm-row__body h3 { margin: 0; color: var(--dtv3-ink-1); font: 600 15px/1.35 var(--dt-sans); letter-spacing: -.01em; }
.gm-row--featured .gm-row__body h3 { font-size: 18px; }
.gm-row__blurb { margin: 0; color: var(--dtv3-ink-2); font: 400 12px/1.65 var(--dt-sans); }
.gm-row__stats { display: grid; gap: 7px; justify-items: end; text-align: right; }
.gm-kind { display: inline-flex; align-items: center; gap: 6px; color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .08em; text-transform: lowercase; }
.gm-kind::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: var(--dtv3-ink-3); }
.gm-kind[data-kind="game"]::before { background: var(--dtv3-sig); }
.gm-stat { color: var(--dtv3-ink-1); font: 700 13px/1.2 var(--dt-sans); font-variant-numeric: tabular-nums; letter-spacing: -.01em; }
.gm-runner { color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .06em; }
.gm-rail { position: sticky; top: 88px; display: grid; gap: 16px; align-content: start; }
.gm-rail .control-note { display: grid; gap: 8px; padding: 16px; background: rgb(255 255 255 / 3%); border: 1px solid var(--dtv3-hairline); border-radius: var(--dtv3-r-2); color: var(--dtv3-ink-2); font: 400 12px/1.7 var(--dt-sans); }
.gm-rail .control-note h2 { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--dtv3-ink-1); font: 600 13px var(--dt-sans); letter-spacing: -.01em; }
.gm-rail .control-note h2 svg { color: var(--dtv3-sig); flex-shrink: 0; }
.gm-rail .control-note p { margin: 0; }
@keyframes gmRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes gmPop { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: none; } }
@media not (prefers-reduced-motion: reduce) {
  .gm-row--featured { animation: gmPop 560ms var(--dtv3-spring) backwards; animation-delay: calc(var(--i, 0) * 60ms); }
}
@media (max-width: 960px) { .gm-body { grid-template-columns: minmax(0, 1fr); } .gm-rail { position: static; } }
@media (prefers-reduced-motion: reduce) { .gm-row { animation: none; transition: none; } }
`;

let gamesCssReady = false;

/** Injects the games stylesheet exactly once per document. */
function ensureGamesCss(): void {
  if (gamesCssReady || typeof document === "undefined") return;
  gamesCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-games", "");
  tag.textContent = GAMES_CSS;
  document.head.appendChild(tag);
}

/** Queues one binary launch and surfaces the answer with the sonner toast the
 * workbench already uses: the reason text is the honest answer of the queue. */
function launch(binary: RunnerBinary) {
  void queuebinarylaunch(binary).then((answer) => {
    if (answer.queued) toast.success(`${binary.title} ${answer.reason}`);
    else toast.error(answer.reason);
  });
}

export default function Games() {
  ensureGamesCss();
  const [binaries, setBinaries] = useState<RunnerBinary[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void runnerBinaries().then((rows) => {
      setBinaries(rows);
      setLoaded(true);
    });
  }, []);

  const games = binaries.filter((binary) => binary.kind === "game").length;
  const applications = binaries.length - games;

  return (
    <main className="control-page atmos">
      <ShellChrome />
      <div className="page-container">
        <header className="pagehead r2b-head r2b-stage shader-stage halftone-edge enter" style={step(0)}>
          <div className="shader-fallback" aria-hidden="true" />
          <div className="grain-overlay" aria-hidden="true" />
          <p className="pagehead__eyebrow r2a-eyebrow">devthink · games</p>
          <h1 className="pagehead__title r2a-display">The runner stage</h1>
          <p className="pagehead__lede r2a-lede">
            Competitor executables boot inside the platform boundary — queued over the gateway, never installed.
          </p>
          {binaries.length ? (
            <p className="r2b-meta">
              {binaries.length} binaries · {games} games · {applications} applications
            </p>
          ) : null}
        </header>

        <div className="gm-body">
          <section className="gm-stage" aria-labelledby="gm-binaries-title">
            <div className="gm-ledgerhead">
              <h2 id="gm-binaries-title">
                <Gamepad2 size={15} aria-hidden="true" />
                runner binaries
              </h2>
              {binaries.length ? <p className="gm-count">answers from the catalog</p> : null}
            </div>
            {binaries.length ? (
              <ol className="gm-rows">
                {binaries.map((binary, index) => (
                  <li
                    key={binary.id}
                    className={index === 0 ? "gm-row gm-row--featured" : "gm-row"}
                    style={step(index)}
                  >
                    <span className="gm-cover" aria-hidden="true">
                      {monogram(binary.title)}
                    </span>
                    <div className="gm-row__body">
                      <h3>{binary.title}</h3>
                      <p className="gm-row__blurb">{binary.blurb}</p>
                    </div>
                    <div className="gm-row__stats">
                      <span className="gm-kind" data-kind={binary.kind}>
                        {binary.kind}
                      </span>
                      <span className="gm-stat">{binary.formats}</span>
                      <span className="gm-runner">{binary.runner}</span>
                      <button
                        type="button"
                        className="apps-action press"
                        onClick={() => launch(binary)}
                        aria-label={`Launch ${binary.title}`}
                        title={`Launch ${binary.title} — queues the binary over the gateway`}
                      >
                        <Play size={11} aria-hidden="true" />
                        launch
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="control-empty">
                <h2>{loaded ? "no runner binaries yet" : "loading the runner catalog…"}</h2>
                <p>
                  {loaded
                    ? "The catalog has not answered any runner binaries, so the launch queue stays closed and the table stays empty."
                    : "The catalog request is in flight — the binaries table mounts when it answers."}
                </p>
              </div>
            )}
          </section>

          <aside className="gm-rail">
            <section className="control-note">
              <h2>
                <ShieldCheck size={15} aria-hidden="true" />
                the runner boundary
              </h2>
              <p>
                DevThink executes the competitor executables by itself through the saddle runner, so a launch stays
                inside the platform boundary, answers with a queue receipt over the gateway, and never touches the
                visitor machine.
              </p>
            </section>
            <AutomationNote />
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
