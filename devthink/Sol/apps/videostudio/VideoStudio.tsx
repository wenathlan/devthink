/** Style: DevThink Terminal Atelier — the video studio page of the super platform.
 * The versawase engine banner is pulled from the catalog rows, the studio assets
 * render as table rows with a render button, and every render request queues over
 * the gateway. The engine itself is never bundled: it rides the catalog over https. */
import { Clapperboard, Database, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { nativeApps, studioAssets, type NativeApp, type StudioAsset } from "@/catalog";
import { ControlShell } from "@/shell/ControlShell";
import { queuestudiorender } from "../runner";

/** The engine banner: the catalog row of the owning app becomes one raised note
 * with the engine, the owner and the honest line about where the engine lives. */
function EngineBanner({ app }: { app: NativeApp | undefined }) {
  if (!app)
    return (
      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>the versawase engine</h2>
        <p style={{ margin: 0 }}>
          The catalog has not answered the versawase engine row yet, so the banner stays empty until the database
          pairs.
        </p>
      </section>
    );
  return (
    <section className="control-note" style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <Clapperboard size={15} style={{ color: "var(--dt-orange)" }} />
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

/** Queues one render and surfaces the answer with the sonner toast the workbench
 * already uses: the reason text is the honest answer of the queue client. */
function queueRender(asset: StudioAsset) {
  void queuestudiorender(asset, `render requested from the video studio for ${asset.title}`).then((answer) => {
    if (answer.queued) toast.success(`${asset.title} ${answer.reason}`);
    else toast.error(answer.reason);
  });
}

export default function VideoStudio() {
  const [apps, setApps] = useState<NativeApp[]>([]);
  const [assets, setAssets] = useState<StudioAsset[]>([]);

  useEffect(() => {
    void nativeApps().then(setApps);
    void studioAssets().then((rows) => setAssets(rows.filter((asset) => asset.studio === "video")));
  }, []);

  const engine = apps.find((app) => app.engine === "versawase" && app.owner === "cadria");

  return (
    <ControlShell
      eyebrow="super platform · the video studio"
      title="Video"
      summary="The native video editor on the cadria versawase engine: the assets come from the catalog and the renders queue over the gateway."
    >
      <EngineBanner app={engine} />

      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <Database size={15} style={{ color: "var(--dt-blue)" }} />
          <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>studio assets</h2>
        </div>
        {assets.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="control-table">
              <thead>
                <tr>
                  <th>asset</th>
                  <th>engine</th>
                  <th>duration</th>
                  <th>render</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.title}</td>
                    <td>
                      <code>{asset.engine}</code>
                    </td>
                    <td>{asset.duration}</td>
                    <td>
                      <button type="button" className="apps-action" onClick={() => queueRender(asset)}>
                        <Play size={11} />
                        render
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ margin: 0 }}>
            The catalog has not answered any video assets yet, so the render queue stays closed and the table stays
            empty.
          </p>
        )}
      </section>
    </ControlShell>
  );
}
