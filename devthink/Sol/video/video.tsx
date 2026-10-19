/**
 * video page anchor — layer 3 of the anchor architecture. The file carrying
 * the folder's own name is the path manager of the page: it imports the
 * loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) and the window
 * registry (Sol/panel/workspace.tsx) consume this file.
 *
 * Video — the video studio in the Windows 11 grammar: a nav pane beside the
 * content deck, the assets as hairline rows and the render queue over the
 * gateway to the versawase engine. The engine itself is never bundled: it
 * rides the catalog over https from the cadria app. This body rides the dtw
 * kit in the trident fusion.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShellChrome } from "@/shell/ShellChrome";
import { type NativeApp, nativeApps, type StudioAsset, studioAssets } from "../../catalog";
import { queuestudiorender } from "../../runner";
import { VideoAssets } from "./videoassets.tsx";
import { VideoEngine } from "./videoengine.tsx";

/** Queues one render and surfaces the answer with the sonner toast the
 * workbench already uses: the reason text is the honest answer of the queue
 * client. */
function queueRender(asset: StudioAsset) {
  void queuestudiorender(asset, `render requested from the video studio for ${asset.title}`).then((answer) => {
    if (answer.queued) toast.success(`${asset.title} ${answer.reason}`);
    else toast.error(answer.reason);
  });
}

/** The video app: the Windows body when embedded (the desktop window hosts
 * it without the shell), the full surface with the taskbar on the route. */
export default function Video({ embedded }: { embedded?: boolean }) {
  const [apps, setApps] = useState<NativeApp[]>([]);
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void nativeApps().then(setApps);
    void studioAssets().then((rows) => {
      setAssets(rows.filter((asset) => asset.studio === "video"));
      setLoaded(true);
    });
  }, []);

  const engine = apps.find((app) => app.engine === "versawase" && app.owner === "cadria");

  return (
    <main className="dtw-app dtw-video" style={embedded ? { height: "100%", overflow: "auto" } : undefined}>
      {!embedded && <ShellChrome />}
      <div className="dtw-pane">
        <nav className="dtw-nav" aria-label="Video sections">
          <span className="dtw-navrow" data-active="true">
            Assets
          </span>
        </nav>
        <div className="dtw-content">
          <h1 className="dtw-title">Video</h1>
          <VideoEngine app={engine} />
          <VideoAssets rows={assets} loaded={loaded} onRender={queueRender} />
        </div>
      </div>
    </main>
  );
}
