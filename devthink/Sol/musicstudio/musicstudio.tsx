/**
 * musicstudio page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page: it imports
 * the loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) and the window
 * registry (Sol/windowregistry.tsx) consume this file.
 *
 * Music — the music studio in the Windows 11 grammar: a nav pane beside the
 * content deck, the tracks as hairline rows and the render queue over the
 * gateway to the katexis engine. The engine itself is never bundled: it
 * rides the catalog over https from the debonair app. The old editorial
 * pass (the shader stage, the film grain, the eq pulse) is retired — this
 * body rides the dtw kit.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShellChrome } from "@/shell/ShellChrome";
import { type NativeApp, nativeApps, type StudioTrack, studioTracks } from "../../catalog";
import { queuestudiorender } from "../../runner";
import { MusicEngine } from "./musicengine.tsx";
import { MusicTracks } from "./musictracks.tsx";
import "./musicstudio.css";

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

/** The music studio: the Windows body when embedded (the desktop window
 * hosts it without the shell), the full surface with the taskbar on the
 * route. */
export default function MusicStudio({ embedded }: { embedded?: boolean }) {
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
    <main className="dtw-app dtw-music" style={embedded ? { height: "100%", overflow: "auto" } : undefined}>
      {!embedded && <ShellChrome />}
      <div className="dtw-pane">
        <nav className="dtw-nav" aria-label="Music studio sections">
          <span className="dtw-navrow" data-active="true">
            Tracks
          </span>
        </nav>
        <div className="dtw-content">
          <h1 className="dtw-title">Music</h1>
          <MusicEngine app={engine} />
          <MusicTracks rows={tracks} loaded={loaded} onQueue={queueTrack} />
        </div>
      </div>
    </main>
  );
}
