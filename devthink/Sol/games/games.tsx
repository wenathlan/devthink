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
 * behavior, routes and exports untouched. */
import { Gamepad2, Play, ShieldCheck, TerminalSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AutomationNote } from "@/shell/automationnote";
import { ShellChrome } from "@/shell/ShellChrome";
import { type RunnerBinary, runnerBinaries } from "../../catalog";
import { queuebinarylaunch } from "../../runner";

/** the one panel padding of the support rail (p-4): the house 16px, over the shared note skin. */
const PANEL = { display: "grid", gap: 12, padding: 16 } as const;

/** The games slice of the C1-04 pass: the editorial list layout, the ladder
 * rail and the row states live with the page (the theme stylesheet owns the
 * shared skin classes). The atmosphere guard keeps the C1-01 layers off the
 * pointer path, and the asymmetric body collapses to one column when the
 * support rail would starve. */
const GAMES_CSS = `
.atmos::before, .atmos::after, .grain::before, .grain::after,
.halftone::before, .halftone::after { pointer-events: none; }
.control-page.atmos { position: relative; }
.pagehead.halftone { position: relative; }
.gm-body { display: grid; grid-template-columns: minmax(0, 1fr) 264px; gap: 20px; align-items: start; }
.gm-list { position: relative; padding: 18px 16px 10px; border: 1px solid var(--dt-edge); border-radius: 10px; background: rgb(25 28 35 / 72%); }
.gm-list__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 0 8px 12px; }
.gm-list__head h2 { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--dt-text); font: 600 15px var(--dt-sans); letter-spacing: -.01em; }
.gm-list__head h2 svg { color: var(--dt-blue); flex-shrink: 0; }
.gm-count { margin: 0; color: var(--dt-faint); font: 500 10px var(--dt-mono); letter-spacing: .08em; font-variant-numeric: tabular-nums; }
.gm-rows { position: relative; margin: 0; padding: 0; list-style: none; }
.gm-rows::before { content: ""; position: absolute; left: 17px; top: 16px; bottom: 16px; width: 1px; background: var(--dt-edge-strong); }
.gm-row { position: relative; display: grid; grid-template-columns: 19px minmax(0, 1fr); gap: 12px; padding: 12px 8px; border-top: 1px solid var(--dt-edge); border-radius: 6px; transition: background 160ms var(--dt-ease); animation: gmRise 240ms cubic-bezier(.22, 1, .36, 1) backwards; }
.gm-row:first-child { border-top: 0; }
.gm-row:hover { background: rgb(255 255 255 / 3%); }
.gm-dot { justify-self: center; align-self: start; width: 9px; height: 9px; margin-top: 6px; border-radius: 50%; background: var(--dt-base); border: 2px solid var(--dt-faint); }
.gm-dot[data-kind="game"] { border-color: var(--dt-orange); }
.gm-dot[data-kind="application"] { border-color: var(--dt-blue); }
.gm-row--lead .gm-dot { width: 11px; height: 11px; margin-top: 6px; }
.gm-row__top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.gm-row__top h3 { margin: 0; color: var(--dt-text); font: 600 14px/1.4 var(--dt-sans); letter-spacing: -.01em; }
.gm-row--lead .gm-row__top h3 { font-size: 18px; }
.gm-row__meta { margin: 3px 0 0; color: var(--dt-faint); font: 500 10px var(--dt-mono); letter-spacing: .08em; font-variant-numeric: tabular-nums; }
.gm-row__blurb { margin: 5px 0 0; color: var(--dt-muted); font: 400 12px/1.6 var(--dt-sans); }
.gm-row--lead .gm-row__blurb { font-size: 13px; }
.gm-side { display: grid; gap: 12px; align-content: start; }
@keyframes gmRise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 960px) { .gm-body { grid-template-columns: minmax(0, 1fr); } }
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
        <header className="pagehead halftone">
          <p className="pagehead__eyebrow">devthink · games</p>
          <h1 className="pagehead__title">Games</h1>
          <p className="pagehead__lede">
            The saddle runner executes the competitor executables by itself: games and applications boot inside the
            platform boundary and queue over the gateway.
          </p>
        </header>

        <div className="gm-body">
          <section className="gm-list grain" aria-labelledby="gm-binaries-title">
            <div className="gm-list__head">
              <h2 id="gm-binaries-title">
                <Gamepad2 size={15} aria-hidden="true" />
                runner binaries
              </h2>
              {binaries.length ? (
                <p className="gm-count">
                  {binaries.length} binaries · {games} games · {applications} applications
                </p>
              ) : null}
            </div>
            {binaries.length ? (
              <ol className="gm-rows">
                {binaries.map((binary, index) => (
                  <li
                    key={binary.id}
                    className={index === 0 ? "gm-row gm-row--lead" : "gm-row"}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <span className="gm-dot" data-kind={binary.kind} aria-hidden="true" />
                    <div className="gm-row__body">
                      <div className="gm-row__top">
                        <h3>{binary.title}</h3>
                        <button
                          type="button"
                          className="apps-action"
                          onClick={() => launch(binary)}
                          aria-label={`Launch ${binary.title}`}
                          title={`Launch ${binary.title} — queues the binary over the gateway`}
                        >
                          <Play size={11} aria-hidden="true" />
                          launch
                        </button>
                      </div>
                      <p className="gm-row__meta">
                        {binary.kind} · {binary.formats} · {binary.runner}
                      </p>
                      <p className="gm-row__blurb">{binary.blurb}</p>
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

          <aside className="gm-side">
            <section className="control-note" style={PANEL}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ShieldCheck size={15} style={{ color: "var(--dt-orange)", flexShrink: 0 }} aria-hidden="true" />
                <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>the runner boundary</h2>
              </div>
              <p style={{ margin: 0 }}>
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
