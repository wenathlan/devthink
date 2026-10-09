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
 * D-07 navbar/hero standard: the page mounts the ONE ShellChrome navbar
 * directly and opens with the .pagehead hero contract inside .page-container.
 * The rung ladder keeps tabular numerals on every version and stamp, the
 * loading/empty ladder states use the shared .control-empty card (no emoji),
 * and the hardcoded intro color gives way to the theme token. No route, data
 * or export changes. */
import { History as HistoryIcon, TerminalSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { ShellChrome } from "@/shell/ShellChrome";
import { type Rung, releaseLadder } from "../../catalog";

/** the one panel padding of the page (p-4): the house 16px, over the shared note skin. */
const PANEL = { display: "grid", gap: 12, padding: 16 } as const;

/** tabular numerals for every numeric readout of the page. */
const TABULAR = { fontVariantNumeric: "tabular-nums" } as const;

export default function History() {
  const [rungs, setRungs] = useState<Rung[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void releaseLadder().then((rows) => {
      setRungs(rows);
      setLoaded(true);
    });
  }, []);

  return (
    <main className="control-page">
      <ShellChrome />
      <div className="page-container">
        <header className="pagehead">
          <p className="pagehead__eyebrow">devthink · history</p>
          <h1 className="pagehead__title">History</h1>
          <p className="pagehead__lede">
            Release history of the DevThink platform: the rung ladder from 1.1.1 to 2.0.40.
          </p>
        </header>

        <p style={{ margin: 0, maxWidth: 620, color: "var(--dt-muted)", lineHeight: 1.7 }}>
          Every release stamps the rung. The full 101-version chain of the extension family (1.1.1 → 2.0.2) and the
          platform ladder live in the repo <code>CHANGELOG.md</code>.
        </p>

        <section className="control-note" style={PANEL}>
          <h2
            style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: "var(--dt-text)" }}
          >
            <HistoryIcon size={15} aria-hidden="true" style={{ color: "var(--dt-blue)", flexShrink: 0 }} />
            milestones
          </h2>
          {rungs.length ? (
            <div className="ladder">
              {rungs.map((rung) => (
                <article key={rung.version} className="ladder-run">
                  <h2>
                    <span style={TABULAR}>{rung.version}</span>
                    {rung.latest ? (
                      <span className="control-badge" style={{ marginLeft: 8 }}>
                        latest
                      </span>
                    ) : null}
                  </h2>
                  <time style={TABULAR}>{rung.stamp}</time>
                  <p>{rung.note}</p>
                </article>
              ))}
            </div>
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

        <footer className="control-page__footer">
          <TerminalSquare size={14} aria-hidden="true" />
          provider credentials stay in <code>~/.config/devthink/auth.json</code>
        </footer>
      </div>
    </main>
  );
}
