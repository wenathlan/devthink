/**
 * projects page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — campaign v3 r2-c: the operational
 * ledger. ONE light (the shared .atmos signal veil), ONE accent (#ff5f00 at
 * the 90/10 discipline). The ledger is the dominant object of a 1.6fr/1fr
 * editorial split: ruled rows (one hairline per record — no card boxes),
 * Bricolage 600 names, mono meta with the compact id as a kbd chip, and the
 * most recently updated workspace leading as the ONE raised featured row
 * with the live pulse dot. Rows hover on a 10% signal tint; the support rail
 * carries the count figure and the id provenance note. The entrance is the
 * one orchestrated shell stagger (hero → body), never per-block fades. */
import { Layers3, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ControlShell, controlStripStyle } from "@/shell/ControlShell";
import { browserWorkspaces } from "../../db";
import { gatewayJson, gatewayReady } from "../../gateway.js";

type Workspace = { id: string; title: string; updatedAt: string; sessionCount: number };

export default function Projects() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const paired = gatewayReady();
  const refresh = useCallback(async () => {
    if (!paired) return setWorkspaces(await browserWorkspaces());
    try {
      setWorkspaces((await gatewayJson<{ workspaces: Workspace[] }>("/workspaces")).workspaces);
    } catch {
      setWorkspaces(await browserWorkspaces());
      toast("Projects could not be read from the local gateway; browser-local workspaces are shown.");
    }
  }, [paired]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  /* the featured row is the most recently updated record — emphasis by
   * position and fact, not by decoration */
  const ordered = [...workspaces].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  return (
    <ControlShell
      eyebrow="local workspace index"
      title="Projects stay attached to their local store."
      summary="Every listed project is a local workspace with the same compact ID used in browser routes and CLI sessions."
    >
      <div className="control-toolbar" style={controlStripStyle}>
        <span>{paired ? "paired gateway" : "browser-local store"}</span>
        <button type="button" className="r2c-btn press" onClick={() => void refresh()}>
          <RefreshCw size={14} />
          refresh
        </button>
      </div>
      {workspaces.length ? (
        <div className="r2c-split">
          <div className="r2c-main">
            <p className="r2c-colhead">workspace ledger · {workspaces.length}</p>
            <div className="r2c-ledger">
              {ordered.map((workspace, index) => (
                <article key={workspace.id} className={`r2c-row${index === 0 ? " is-featured" : ""}`}>
                  <div className="r2c-row__main">
                    <strong className="r2c-row__name">{workspace.title}</strong>
                    <span className="r2c-row__meta">
                      <kbd className="r2c-kbd">{workspace.id}</kbd> · {workspace.sessionCount} session
                      {workspace.sessionCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <time className="r2c-row__time">{new Date(workspace.updatedAt).toLocaleString()}</time>
                  {index === 0 ? (
                    <span className="r2c-state">
                      <span className="r2c-dot live-dot" aria-hidden="true" />
                      latest
                    </span>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
          <aside className="r2c-railfig" aria-label="Index state">
            <span className="r2c-figlabel">{paired ? "paired gateway" : "browser-local"}</span>
            <strong className="r2c-figure">{workspaces.length}</strong>
            <span className="r2c-figunit">local workspaces indexed</span>
            <p className="r2c-note">
              ids are created by the cli and preserved in browser urls; the browser keeps its own non-sensitive cache in
              indexeddb.
            </p>
          </aside>
        </div>
      ) : (
        <div className="control-empty">
          <Layers3 size={22} />
          <h2>No local project yet</h2>
          <p>
            Open a workspace from Home to create a browser-local project, or pair the CLI to read its local projects.
          </p>
        </div>
      )}
    </ControlShell>
  );
}
