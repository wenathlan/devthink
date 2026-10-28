/**
 * games page anchor — layer 3 of the anchor architecture. The file carrying
 * the folder's own name is the path manager of the page: it imports the
 * loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) and the window
 * registry (Sol/widgets/PanelWorkspace.tsx) consume this file.
 *
 * Games — the runner app in the Windows 11 grammar: a nav pane beside the
 * content deck, the runner binaries as hairline rows and the launch queue
 * over the gateway. The old editorial pass (the shader stage, the film
 * grain, the atmosphere light) is retired — this body rides the dtw kit
 * with the runner boundary as one quiet card.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShellChrome } from "@/widgets/Shellchrome";
import { osAppLabels, type RunnerBinary, runnerBinaries } from "../../catalog";
import { osText } from "../../oslabels.ts";
import { queuebinarylaunch } from "../../runner";
import { GamesList } from "../widgets";
import { type GamesFilter, GamesNav } from "../widgets";

/** the window title rides the catalog label row, never a hardcoded literal
 * (the bare id keeps the heading honest if the row is missing). */
const GAMES_LABEL = osAppLabels().games;

/** The games app: the Windows body when embedded (the desktop window hosts
 * it without the shell), the full surface with the taskbar on the route. */
export default function Games({ embedded }: { embedded?: boolean }) {
  const [binaries, setBinaries] = useState<RunnerBinary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<GamesFilter>("all");

  useEffect(() => {
    void runnerBinaries().then((rows) => {
      setBinaries(rows);
      setLoaded(true);
    });
  }, []);

  const games = binaries.filter((binary) => binary.kind === "game").length;
  const applications = binaries.length - games;
  const rows = binaries.filter((binary) => filter === "all" || binary.kind === filter);

  const launch = (binary: RunnerBinary) => {
    void queuebinarylaunch(binary).then((answer) => {
      if (answer.queued) toast.success(`${binary.title} ${answer.reason}`);
      else toast.error(answer.reason);
    });
  };

  return (
    <main className="dtw-app dtw-games" style={embedded ? { height: "100%", overflow: "auto" } : undefined}>
      {!embedded && <ShellChrome />}
      <div className="dtw-pane">
        <GamesNav
          all={binaries.length}
          games={games}
          applications={applications}
          active={filter}
          onSelect={setFilter}
        />
        <div className="dtw-content">
          <h1 className="dtw-title">{GAMES_LABEL?.name ?? "Games"}</h1>
          <GamesList rows={rows} loaded={loaded} onLaunch={launch} />
          <section className="dtw-card">
            <h2 className="dtw-cardtitle">{osText("games.boundary.title")}</h2>
            <p className="dtw-copy">{osText("games.boundary.copy")}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
