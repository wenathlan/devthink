/** Style: DevThink Terminal Atelier — the release rung ladder ported from the static site; the ladder renders from the DB layer. */
import { History as HistoryIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ControlShell } from "@/shell/ControlShell";
import { releaseLadder, type Rung } from "@/catalog";

export default function History() {
  const [rungs, setRungs] = useState<Rung[]>([]);

  useEffect(() => {
    void releaseLadder().then(setRungs);
  }, []);

  return (
    <ControlShell
      eyebrow="the rung ladder"
      title="History"
      summary="Release history of the DevThink platform: the rung ladder from 1.1.1 to 2.0.40."
    >
      <p style={{ margin: 0, maxWidth: 620, color: "#9c948b", lineHeight: 1.7 }}>
        Every release stamps the rung. The full 101-version chain of the extension family (1.1.1 → 2.0.2) and the
        platform ladder live in the repo <code>CHANGELOG.md</code>.
      </p>

      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>
          <HistoryIcon size={15} style={{ display: "inline", verticalAlign: "-2px", marginRight: 7 }} />
          milestones
        </h2>
        <div className="ladder">
          {rungs.map((rung) => (
            <article key={rung.version} className="ladder-run">
              <h2>
                {rung.version}
                {rung.latest ? <span className="control-badge" style={{ marginLeft: 8 }}>latest</span> : null}
              </h2>
              <time>{rung.stamp}</time>
              <p>{rung.note}</p>
            </article>
          ))}
        </div>
      </section>
    </ControlShell>
  );
}
