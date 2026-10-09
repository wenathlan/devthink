/**
 * projects page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — project view surfaces the local
 * workspace records shared by CLI and browser routes. C1 layout: the ledger
 * is the dominant object (one ruled index, a hairline per record — no card
 * rows) and the support rail carries the count figure, the refresh action
 * and the id provenance note. */
import { Layers3, RefreshCw } from "lucide-react";
import { type CSSProperties, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ControlShell, controlStripStyle } from "@/shell/ControlShell";
import { browserWorkspaces } from "../../db";
import { gatewayJson, gatewayReady } from "../../gateway.js";

type Workspace = { id: string; title: string; updatedAt: string; sessionCount: number };

/* the two-zone rhythm: dominant ledger + support rail, wrapping under each
 * other on narrow stages without a media query */
const zoneStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 24,
  alignItems: "flex-start",
  fontVariantNumeric: "tabular-nums",
};
const mainStyle: CSSProperties = { flex: "3 1 520px", minWidth: 0 };
const railStyle: CSSProperties = {
  flex: "1 1 264px",
  minWidth: 0,
  maxWidth: 340,
  display: "grid",
  gap: 16,
  alignContent: "start",
};
const ledgerLabelStyle: CSSProperties = {
  margin: 0,
  padding: "0 2px 10px",
  color: "var(--dt-faint)",
  font: "600 10px var(--dt-mono)",
  letterSpacing: ".08em",
};
const ledgerStyle: CSSProperties = { borderTop: "1px solid var(--dt-edge)" };
const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "13px 2px",
  borderBottom: "1px solid var(--dt-edge)",
};
const rowMainStyle: CSSProperties = { display: "grid", gap: 3, minWidth: 0 };
const rowTitleStyle: CSSProperties = { font: "600 13px var(--dt-sans)", color: "var(--dt-text)" };
const rowMetaStyle: CSSProperties = {
  font: "400 10px var(--dt-mono)",
  color: "var(--dt-faint)",
  overflowWrap: "anywhere",
};
const rowTimeStyle: CSSProperties = {
  flex: "0 1 auto",
  font: "400 10px var(--dt-mono)",
  color: "var(--dt-faint)",
  whiteSpace: "nowrap",
};
const railFigureStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  justifyItems: "start",
  borderTop: "1px solid var(--dt-edge)",
  padding: "14px 2px 0",
};
const railModeStyle: CSSProperties = {
  color: "var(--dt-muted)",
  font: "500 10px var(--dt-mono)",
  letterSpacing: ".08em",
};
const railValueStyle: CSSProperties = {
  font: "600 40px/1 var(--font-display, var(--dt-sans))",
  letterSpacing: "-0.02em",
  color: "var(--dt-text)",
};
const railUnitStyle: CSSProperties = { color: "var(--dt-faint)", font: "400 10px var(--dt-mono)" };
const railNoteStyle: CSSProperties = {
  margin: 0,
  borderTop: "1px solid var(--dt-edge)",
  padding: "12px 2px 0",
  color: "var(--dt-faint)",
  font: "400 11px/1.7 var(--dt-mono)",
};

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
  return (
    <ControlShell
      eyebrow="local workspace index"
      title="Projects stay attached to their local store."
      summary="Every listed project is a local workspace with the same compact ID used in browser routes and CLI sessions."
    >
      <div className="control-toolbar" style={controlStripStyle}>
        <span>{paired ? "paired gateway" : "browser-local store"}</span>
        <button type="button" onClick={() => void refresh()}>
          <RefreshCw size={14} />
          refresh
        </button>
      </div>
      {workspaces.length ? (
        <div style={zoneStyle}>
          <div style={mainStyle}>
            <p style={ledgerLabelStyle}>workspace ledger · {workspaces.length}</p>
            <div style={ledgerStyle}>
              {workspaces.map((workspace) => (
                <article key={workspace.id} style={rowStyle}>
                  <div style={rowMainStyle}>
                    <strong style={rowTitleStyle}>{workspace.title}</strong>
                    <span style={rowMetaStyle}>
                      <code>{workspace.id}</code> · {workspace.sessionCount} session
                      {workspace.sessionCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <time style={rowTimeStyle}>{new Date(workspace.updatedAt).toLocaleString()}</time>
                </article>
              ))}
            </div>
          </div>
          <aside style={railStyle} aria-label="Index state">
            <div style={railFigureStyle}>
              <span style={railModeStyle}>{paired ? "paired gateway" : "browser-local"}</span>
              <strong style={railValueStyle}>{workspaces.length}</strong>
              <span style={railUnitStyle}>local workspaces indexed</span>
            </div>
            <p style={railNoteStyle}>
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
