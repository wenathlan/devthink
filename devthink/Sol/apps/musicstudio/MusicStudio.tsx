/** Style: DevThink Terminal Atelier — the music studio page of the super platform.
 * It shares the grammar of the video studio: the katexis engine banner is pulled
 * from the catalog rows, the studio tracks render as a table with a queue button
 * per track, and the engine rides the catalog over https instead of being bundled. */
import { Database, Music2, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { nativeApps, studioTracks, type NativeApp, type StudioTrack } from "../../../catalog";
import { ControlShell } from "@/shell/ControlShell";
import { queuestudiorender } from "../runner";

/** The engine banner of the katexis row: the same shape as the video studio, so
 * both studio pages read as one surface with a different engine behind them. */
function EngineBanner({ app }: { app: NativeApp | undefined }) {
  if (!app)
    return (
      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>the katexis engine</h2>
        <p style={{ margin: 0 }}>
          The catalog has not answered the katexis engine row yet, so the banner stays empty until the database pairs.
        </p>
      </section>
    );
  return (
    <section className="control-note" style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <Music2 size={15} style={{ color: "var(--dt-orange)" }} />
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

  useEffect(() => {
    void nativeApps().then(setApps);
    void studioTracks().then(setTracks);
  }, []);

  const engine = apps.find((app) => app.engine === "katexis" && app.owner === "debonair");

  return (
    <ControlShell
      eyebrow="super platform · the music studio"
      title="Music"
      summary="The native music studio on the debonair katexis engine: the tracks come from the catalog and the renders queue over the gateway."
    >
      <EngineBanner app={engine} />

      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <Database size={15} style={{ color: "var(--dt-blue)" }} />
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
                    <td>{track.minutes}</td>
                    <td>{track.blurb}</td>
                    <td>
                      <button type="button" className="apps-action" onClick={() => queueTrack(track)}>
                        <Play size={11} />
                        queue
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ margin: 0 }}>
            The catalog has not answered any studio tracks yet, so the queue stays closed and the table stays empty.
          </p>
        )}
      </section>
    </ControlShell>
  );
}
