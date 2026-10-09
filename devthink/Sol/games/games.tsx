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
 * D-07 navbar/hero standard: the page mounts the ONE ShellChrome navbar
 * directly (no wrapper, no second header) and opens with the .pagehead
 * hero contract — .pagehead__eyebrow / __title / __lede — inside the
 * .page-container body. The runner table keeps the .apps-action controls
 * (28px min-height, 160ms hover, scale(.97) press) with tooltips and
 * aria-labels, the panels share one 16px padding, and the loading/empty
 * catalog states use the shared .control-empty card. No route, data or
 * export changes. */
import { Gamepad2, Play, ShieldCheck, TerminalSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AutomationNote } from "@/shell/automationnote";
import { ShellChrome } from "@/shell/ShellChrome";
import { type RunnerBinary, runnerBinaries } from "../../catalog";

/** the one panel padding of the page (p-4): the house 16px, over the shared note skin. */
const PANEL = { display: "grid", gap: 12, padding: 16 } as const;

/** Queues one binary launch and surfaces the answer with the sonner toast the
 * workbench already uses: the reason text is the honest answer of the queue. */
function launch(binary: RunnerBinary) {
  void queuebinarylaunch(binary).then((answer) => {
    if (answer.queued) toast.success(`${binary.title} ${answer.reason}`);
    else toast.error(answer.reason);
  });
}

export default function Games() {
  const [binaries, setBinaries] = useState<RunnerBinary[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void runnerBinaries().then((rows) => {
      setBinaries(rows);
      setLoaded(true);
    });
  }, []);

  return (
    <main className="control-page">
      <ShellChrome />
      <div className="page-container">
        <header className="pagehead">
          <p className="pagehead__eyebrow">devthink · games</p>
          <h1 className="pagehead__title">Games</h1>
          <p className="pagehead__lede">
            The saddle runner executes the competitor executables by itself: games and applications boot inside the
            platform boundary and queue over the gateway.
          </p>
        </header>

        <section className="control-note" style={PANEL}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={15} style={{ color: "var(--dt-orange)", flexShrink: 0 }} aria-hidden="true" />
            <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>the runner boundary</h2>
          </div>
          <p style={{ margin: 0 }}>
            DevThink executes the competitor executables by itself through the saddle runner, so a launch stays inside
            the platform boundary, answers with a queue receipt over the gateway, and never touches the visitor machine.
          </p>
        </section>

        <section className="control-note" style={PANEL}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Gamepad2 size={15} style={{ color: "var(--dt-blue)", flexShrink: 0 }} aria-hidden="true" />
            <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>runner binaries</h2>
          </div>
          {binaries.length ? (
            <div style={{ overflowX: "auto" }}>
              <table className="control-table">
                <thead>
                  <tr>
                    <th>title</th>
                    <th>kind</th>
                    <th>formats</th>
                    <th>runner</th>
                    <th>blurb</th>
                    <th>launch</th>
                  </tr>
                </thead>
                <tbody>
                  {binaries.map((binary) => (
                    <tr key={binary.id}>
                      <td>{binary.title}</td>
                      <td>
                        <span className="control-badge">{binary.kind}</span>
                      </td>
                      <td>
                        <code>{binary.formats}</code>
                      </td>
                      <td>{binary.runner}</td>
                      <td>{binary.blurb}</td>
                      <td>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

        <AutomationNote />

        <footer className="control-page__footer">
          <TerminalSquare size={14} aria-hidden="true" />
          provider credentials stay in <code>~/.config/devthink/auth.json</code>
        </footer>
      </div>
    </main>
  );
}
