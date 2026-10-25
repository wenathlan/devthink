/**
 * projects page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page: it imports
 * the loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) and the window
 * registry (Sol/panel/workspace.tsx) consume this file.
 *
 * Projects — the workspace index in the Windows 11 grammar: a nav pane
 * beside the content deck, the workspaces as hairline rows with the most
 * recently updated record leading. Every listed project is a local
 * workspace with the same compact id used in browser routes and cli
 * sessions. The old editorial split is retired — this body rides the dtw
 * kit.
 */
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ShellChrome } from "@/widgets/ShellShellchrome";
import { osAppLabels } from "../../catalog";
import { browserWorkspaces } from "../../db";
import { gatewayJson, gatewayReady } from "../../gatewayfamily.js";
import { osText } from "../../oslabels.ts";
import { ProjectRows } from "../widgets";

type Workspace = { id: string; title: string; updatedAt: string; sessionCount: number };

/** the window title answers the catalog label row (bare-id fallback). */
const PROJECTS_LABEL = osAppLabels().projects;

/** The projects app: the Windows body when embedded (the desktop window
 * hosts it without the shell), the full surface with the taskbar on the
 * route. */
export default function Projects({ embedded }: { embedded?: boolean }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loaded, setLoaded] = useState(false);
  const paired = gatewayReady();

  const refresh = useCallback(async () => {
    if (!paired) return setWorkspaces(await browserWorkspaces());
    try {
      setWorkspaces((await gatewayJson<{ workspaces: Workspace[] }>("/workspaces")).workspaces);
    } catch {
      setWorkspaces(await browserWorkspaces());
      toast(osText("projects.toast.unavailable"));
    } finally {
      setLoaded(true);
    }
  }, [paired]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /* the leading row is the most recently updated record — emphasis by
   * position and fact, not by decoration */
  const ordered = [...workspaces].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  return (
    <main className="dtw-app dtw-projects" style={embedded ? { height: "100%", overflow: "auto" } : undefined}>
      {!embedded && <ShellChrome />}
      <div className="dtw-pane">
        <nav className="dtw-nav" aria-label={osText("projects.nav.aria")}>
          <span className="dtw-navrow" data-active="true">
            {osText("projects.navrow")}
            <span className="dtw-navrow__count">{workspaces.length}</span>
          </span>
        </nav>
        <div className="dtw-content">
          <h1 className="dtw-title">{PROJECTS_LABEL?.name ?? "Projects"}</h1>
          <ProjectRows rows={ordered} loaded={loaded} paired={paired} onRefresh={refresh} />
        </div>
      </div>
    </main>
  );
}
