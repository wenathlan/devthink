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
 * visitor machine. */
import { Gamepad2, Play, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AutomationNote } from "@/shell/automationnote";
import { ControlShell } from "@/shell/ControlShell";
import { type RunnerBinary, runnerBinaries } from "../../catalog";
import { queuebinarylaunch } from "../../runner";

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

  useEffect(() => {
    void runnerBinaries().then(setBinaries);
  }, []);

  return (
    <ControlShell
      eyebrow="super platform · the runner"
      title="Games"
      summary="The saddle runner executes the competitor executables by itself: games and applications boot inside the platform boundary and queue over the gateway."
    >
      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <ShieldCheck size={15} style={{ color: "var(--dt-orange)" }} />
          <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>the runner boundary</h2>
        </div>
        <p style={{ margin: 0 }}>
          DevThink executes the competitor executables by itself through the saddle runner, so a launch stays inside the
          platform boundary, answers with a queue receipt over the gateway, and never touches the visitor machine.
        </p>
      </section>

      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <Gamepad2 size={15} style={{ color: "var(--dt-blue)" }} />
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
                      <button type="button" className="apps-action" onClick={() => launch(binary)}>
                        <Play size={11} />
                        launch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ margin: 0 }}>
            The catalog has not answered any runner binaries yet, so the launch queue stays closed and the table stays
            empty.
          </p>
        )}
      </section>

      <AutomationNote />
    </ControlShell>
  );
}
