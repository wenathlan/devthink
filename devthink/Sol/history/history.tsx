/**
 * history page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page: it imports
 * the loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) and the window
 * registry (Sol/panel/workspace.tsx) consume this file.
 *
 * History — the release ladder in the Windows 11 grammar: a nav pane beside
 * the content deck, the rungs as hairline rows with the latest badge and
 * the real chain facts beside them. Every release stamps a rung; the
 * ladder renders from the catalog. The old editorial pass (the shader
 * stage, the film grain, the sparkline axis) is retired — this body rides
 * the dtw kit.
 */
import { useEffect, useState } from "react";
import { ShellChrome } from "@/widgets/shell.shellchrome";
import { osAppLabels, type Rung, releaseLadder } from "../../catalog";
import { osText } from "../../oslabels.ts";
import { HistoryLadder } from "../widgets";

/** the window title answers the catalog label row (bare-id fallback). */
const HISTORY_LABEL = osAppLabels().history;

/** The history app: the Windows body when embedded (the desktop window
 * hosts it without the shell), the full surface with the taskbar on the
 * route. */
export default function History({ embedded }: { embedded?: boolean }) {
  const [rungs, setRungs] = useState<Rung[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void releaseLadder().then((rows) => {
      setRungs(rows);
      setLoaded(true);
    });
  }, []);

  /** the real chain facts: the catalog answers the ladder newest-first, so
   * the latest rung is the first and the chain opens at the last one. */
  const latest = rungs.find((rung) => rung.latest)?.version ?? rungs[0]?.version ?? "";
  const oldest = rungs.length ? (rungs[rungs.length - 1]?.version ?? "") : "";

  return (
    <main className="dtw-app dtw-history" style={embedded ? { height: "100%", overflow: "auto" } : undefined}>
      {!embedded && <ShellChrome />}
      <div className="dtw-pane">
        <nav className="dtw-nav" aria-label={osText("history.nav.aria")}>
          <span className="dtw-navrow" data-active="true">
            {osText("history.navrow")}
            <span className="dtw-navrow__count">{rungs.length}</span>
          </span>
        </nav>
        <div className="dtw-content">
          <h1 className="dtw-title">{HISTORY_LABEL?.name ?? "History"}</h1>
          <p className="dtw-note">
            <span>{osText("history.note.stamps")}</span>
            <span>{osText("history.note.chain")}</span>
          </p>
          <HistoryLadder rows={rungs} loaded={loaded} latest={latest} oldest={oldest} />
        </div>
      </div>
    </main>
  );
}
