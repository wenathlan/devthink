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
 * bundled — it rides the catalog over https from the cadria app.
 *
 * D-07 navbar/hero standard: the page mounts the ONE ShellChrome navbar
 * directly and opens with the .pagehead hero contract (the "devthink ·
 * image" eyebrow) inside .page-container. The stills table keeps the
 * .apps-action render controls (28px, 160ms hover, scale(.97) press) with
 * tooltips and aria-labels, the panels share one 16px padding, and the
 * loading/empty states use the shared .control-empty card. The engine
 * behavior — the catalog fetch and the gateway queue — is untouched. */
import { Database, Play, TerminalSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AutomationNote } from "@/shell/automationnote";
import { ShellChrome } from "@/shell/ShellChrome";
import { type NativeApp, nativeApps, type StudioAsset, studioAssets } from "../../catalog";
import { queuestudiorender } from "../../runner";
import { ImageBanner } from "./imagebanner";

/** the one panel padding of the page (p-4): the house 16px, over the shared note skin. */
const PANEL = { display: "grid", gap: 12, padding: 16 } as const;

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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void nativeApps().then(setApps);
    void studioAssets().then((rows) => {
      setAssets(rows.filter((asset) => asset.studio === "image"));
      setLoaded(true);
    });
  }, []);

  const engine = apps.find((app) => app.engine === "matiz" && app.owner === "cadria");

  return (
    <main className="control-page">
      <ShellChrome />
      <div className="page-container">
        <header className="pagehead">
          <p className="pagehead__eyebrow">devthink · image</p>
          <h1 className="pagehead__title">Image</h1>
          <p className="pagehead__lede">
            The native image studio on the cadria matiz pixel engine: the stills come from the catalog and the renders
            queue over the gateway.
          </p>
        </header>

        <ImageBanner app={engine} />

        <section className="control-note" style={PANEL}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Database size={15} style={{ color: "var(--dt-blue)", flexShrink: 0 }} aria-hidden="true" />
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
                      <td style={{ fontVariantNumeric: "tabular-nums" }}>{asset.size ?? "—"}</td>
                      <td>
                        <button
                          type="button"
                          className="apps-action"
                          onClick={() => queueRender(asset)}
                          aria-label={`Render ${asset.title}`}
                          title={`Render ${asset.title} — queues the still over the gateway`}
                        >
                          <Play size={11} aria-hidden="true" />
                          render
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="control-empty">
              <h2>{loaded ? "no image assets yet" : "loading the image assets…"}</h2>
              <p>
                {loaded
                  ? "The catalog has not answered any image assets, so the render queue stays closed and the table stays empty."
                  : "The catalog request is in flight — the assets table mounts when it answers."}
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
