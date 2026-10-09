/**
 * image page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — the image studio page of the super
 * platform. It shares the grammar of the video and music studios: the matiz
 * engine banner is pulled from the catalog rows, the image assets render as
 * a table with a queue button per still, and the engine itself is never
 * bundled — it rides the catalog over https from the cadria app. */
import { Database, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AutomationNote } from "@/shell/automationnote";
import { ControlShell } from "@/shell/ControlShell";
import { type NativeApp, nativeApps, type StudioAsset, studioAssets } from "../../catalog";
import { queuestudiorender } from "../../runner";
import { ImageBanner } from "./imagebanner";

/** Queues one still and surfaces the answer with the sonner toast the
 * workbench already uses: the reason text is the honest answer of the queue
 * client, so the page keeps working when the gateway is absent. */
function queueRender(asset: StudioAsset) {
  void queuestudiorender(asset, `render requested from the image studio for ${asset.title}`).then((answer) => {
    if (answer.queued) toast.success(`${asset.title} ${answer.reason}`);
    else toast.error(answer.reason);
  });
}

export default function ImageStudio() {
  const [apps, setApps] = useState<NativeApp[]>([]);
  const [assets, setAssets] = useState<StudioAsset[]>([]);

  useEffect(() => {
    void nativeApps().then(setApps);
    void studioAssets().then((rows) => setAssets(rows.filter((asset) => asset.studio === "image")));
  }, []);

  const engine = apps.find((app) => app.engine === "matiz" && app.owner === "cadria");

  return (
    <ControlShell
      eyebrow="super platform · the image studio"
      title="Image"
      summary="The native image studio on the cadria matiz pixel engine: the stills come from the catalog and the renders queue over the gateway."
    >
      <ImageBanner app={engine} />

      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <Database size={15} style={{ color: "var(--dt-blue)" }} />
          <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>image assets</h2>
        </div>
        {assets.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="control-table">
              <thead>
                <tr>
                  <th>asset</th>
                  <th>engine</th>
                  <th>size</th>
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
                    <td>{asset.size ?? "—"}</td>
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
            The catalog has not answered any image assets yet, so the render queue stays closed and the table stays
            empty.
          </p>
        )}
      </section>

      <AutomationNote />
    </ControlShell>
  );
}
