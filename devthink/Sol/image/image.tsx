/**
 * image page anchor — layer 3 of the anchor architecture. The file carrying
 * the folder's own name is the path manager of the page: it imports the
 * loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) and the window
 * registry (Sol/panel/workspace.tsx) consume this file.
 *
 * Image — the image studio in the Windows 11 grammar: a nav pane beside the
 * content deck, the stills as hairline rows and the render queue over the
 * gateway. The engine itself is never bundled: it rides the catalog over
 * https from the cadria app. The old editorial pass (the shader stage, the
 * film grain, the atmosphere light) is retired — this body rides the dtw
 * kit with the engine as one quiet card.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShellChrome } from "@/widgets/shell.shellchrome";
import { type NativeApp, nativeApps, osAppLabels, type StudioAsset, studioAssets } from "../../catalog";
import { osText } from "../../oslabels.ts";
import { queuestudiorender } from "../../runner";
import { ImageEngine } from "../widgets/image.imageengine.tsx";
import { ImageStills } from "../widgets/image.imagestills.tsx";

/** the window title rides the catalog label row, never a hardcoded literal
 * (the bare id keeps the heading honest if the row is missing). */
const IMAGE_LABEL = osAppLabels().image;

/** Queues one still and surfaces the answer with the sonner toast the
 * workbench already uses: the reason text is the honest answer of the queue
 * client, so the page keeps working when the gateway is absent. */
function queueRender(asset: StudioAsset) {
  void queuestudiorender(asset, osText("image.queueNote").replace("{title}", asset.title)).then((answer) => {
    if (answer.queued) toast.success(`${asset.title} ${answer.reason}`);
    else toast.error(answer.reason);
  });
}

/** The image studio: the Windows body when embedded (the desktop window
 * hosts it without the shell), the full surface with the taskbar on the
 * route. */
export default function ImageStudio({ embedded }: { embedded?: boolean }) {
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
    <main className="dtw-app dtw-image" style={embedded ? { height: "100%", overflow: "auto" } : undefined}>
      {!embedded && <ShellChrome />}
      <div className="dtw-pane">
        <nav className="dtw-nav" aria-label={osText("image.nav.aria")}>
          <span className="dtw-navrow" data-active="true">
            {osText("image.navrow")}
          </span>
        </nav>
        <div className="dtw-content">
          <h1 className="dtw-title">{IMAGE_LABEL?.name ?? "Image"}</h1>
          <ImageEngine app={engine} />
          <ImageStills rows={assets} loaded={loaded} onRender={queueRender} />
        </div>
      </div>
    </main>
  );
}
