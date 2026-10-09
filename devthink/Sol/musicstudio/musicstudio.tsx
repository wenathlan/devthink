/**
 * musicstudio page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — the music studio page of the super platform.
 * It shares the grammar of the video studio: the katexis engine banner is pulled
 * from the catalog rows, the studio tracks render as a table with a queue button
 * per track, and the engine rides the catalog over https instead of being bundled.
 *
 * D-07 navbar/hero standard: the page mounts the ONE ShellChrome navbar directly
 * and opens with the .pagehead hero contract inside .page-container. The track
 * table keeps the .apps-action queue controls (28px, 160ms hover, scale(.97)
 * press) with tooltips and aria-labels, the panels share one 16px padding, and
 * the loading/empty states use the shared .control-empty card. The engine
 * behavior — the catalog fetch and the gateway queue — is untouched. */
import { Database, Music2, Play, TerminalSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AutomationNote } from "@/shell/automationnote";
import { ShellChrome } from "@/shell/ShellChrome";
import { type NativeApp, nativeApps, type StudioTrack, studioTracks } from "../../catalog";
import { queuestudiorender } from "../../runner";

/** the one panel padding of the page (p-4): the house 16px, over the shared note skin. */
const PANEL = { display: "grid", gap: 12, padding: 16 } as const;

/** tabular numerals for the minute readouts of the track table. */
const TABULAR = { fontVariantNumeric: "tabular-nums" } as const;

/** The engine banner of the katexis row: the same shape as the video studio, so
 * both studio pages read as one surface with a different engine behind them. */
function EngineBanner({ app }: { app: NativeApp | undefined }) {
  if (!app)
    return (
      <section className="control-note" style={PANEL}>
        <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>the katexis engine</h2>
        <p style={{ margin: 0 }}>
          The catalog has not answered the katexis engine row yet, so the banner stays empty until the database pairs.
        </p>
      </section>
    );
  return (
    <section className="control-note" style={PANEL}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Music2 size={15} style={{ color: "var(--dt-orange)", flexShrink: 0 }} aria-hidden="true" />
        <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>the {app.engine} engine</h2>
        <span className="control-badge">{app.owner}</span>
      </div>
      <p style={{ margin: 0 }}>{app.blurb}</p>
      <p style={{ margin: 0, color: "var(--dt-muted)" }}>
        The {app.engine} engine rides the catalog over https, so this page never bundles the engine itself.
      </p>
    </section>
  );
}

/** Queues one track render and surfaces the answer with the sonner toast. The
 * queue client speaks in studio assets, so the track is carried as the music
 * asset it is: same id, same title, same engine, and the minutes as duration. */
function queueTrack(track: StudioTrack) {
  const asset = { id: track.id, title: track.title, studio: "music", engine: track.engine, duration: track.minutes };
  void queuestudiorender(asset, `render requested from the music studio for ${track.title}`).then((answer) => {
    if (answer.queued) toast.success(`${track.title} ${answer.reason}`);
    else toast.error(answer.reason);
  });
}

export default function MusicStudio() {
  const [apps, setApps] = useState<NativeApp[]>([]);
  const [tracks, setTracks] = useState<StudioTrack[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void nativeApps().then(setApps);
    void studioTracks().then((rows) => {
      setTracks(rows);
      setLoaded(true);
    });
  }, []);

  const engine = apps.find((app) => app.engine === "katexis" && app.owner === "debonair");

  return (
    <main className="control-page">
      <ShellChrome />
      <div className="page-container">
        <header className="pagehead">
          <p className="pagehead__eyebrow">devthink · music</p>
          <h1 className="pagehead__title">Music</h1>
          <p className="pagehead__lede">
            The native music studio on the debonair katexis engine: the tracks come from the catalog and the renders
            queue over the gateway.
          </p>
        </header>

        <EngineBanner app={engine} />

        <section className="control-note" style={PANEL}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Database size={15} style={{ color: "var(--dt-blue)", flexShrink: 0 }} aria-hidden="true" />
            <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>studio tracks</h2>
          </div>
          {tracks.length ? (
            <div style={{ overflowX: "auto" }}>
              <table className="control-table">
                <thead>
                  <tr>
                    <th>track</th>
                    <th>engine</th>
                    <th>minutes</th>
                    <th>blurb</th>
                    <th>queue</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map((track) => (
                    <tr key={track.id}>
                      <td>{track.title}</td>
                      <td>
                        <code>{track.engine}</code>
                      </td>
                      <td style={TABULAR}>{track.minutes}</td>
                      <td>{track.blurb}</td>
                      <td>
                        <button
                          type="button"
                          className="apps-action"
                          onClick={() => queueTrack(track)}
                          aria-label={`Queue ${track.title}`}
                          title={`Queue ${track.title} — queues the render over the gateway`}
                        >
                          <Play size={11} aria-hidden="true" />
                          queue
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="control-empty">
              <h2>{loaded ? "no studio tracks yet" : "loading the studio tracks…"}</h2>
              <p>
                {loaded
                  ? "The catalog has not answered any studio tracks, so the queue stays closed and the table stays empty."
                  : "The catalog request is in flight — the tracks table mounts when it answers."}
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
