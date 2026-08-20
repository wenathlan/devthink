/** Style: DevThink Terminal Atelier — project view surfaces the local workspace records shared by CLI and browser routes. */
import { FolderPlus, Layers3, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ControlShell } from "@/app/control.shell";
import { gatewayJson, gatewayReady } from "@/gateway";

type Workspace = { id: string; title: string; updatedAt: string; sessionCount: number };

export default function Projects() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const paired = gatewayReady();
  const refresh = async () => { if (!paired) return; try { setWorkspaces((await gatewayJson<{ workspaces: Workspace[] }>("/workspaces")).workspaces); } catch { toast("Projects could not be read from the local gateway."); } };
  useEffect(() => { void refresh(); }, []);
  return <ControlShell eyebrow="local workspace index" title="Projects stay attached to the CLI." summary="Every listed project is a local workspace with the same compact ID used in browser routes and CLI sessions."><div className="control-toolbar"><span>{paired ? `${workspaces.length} local projects` : "pair CLI to read saved projects"}</span><button onClick={() => void refresh()} disabled={!paired}><RefreshCw size={14} />refresh</button></div>{workspaces.length ? <div className="project-list">{workspaces.map((workspace) => <article key={workspace.id}><FolderPlus size={18} /><div><strong>{workspace.title}</strong><span><code>{workspace.id}</code> · {workspace.sessionCount} session{workspace.sessionCount === 1 ? "" : "s"}</span></div><time>{new Date(workspace.updatedAt).toLocaleString()}</time></article>)}</div> : <div className="control-empty"><Layers3 size={22} /><h2>{paired ? "No saved project yet" : "Local gateway not paired"}</h2><p>{paired ? "Create a chat session in the workspace to create the first project record." : "Open a CLI invitation link to show the projects saved on this device."}</p></div>}</ControlShell>;
}
