import { getIdentity } from "./identity.ts";
import { listSessions, loadWorkspace, type Session, type Workspace } from "./session.ts";
import { isSecureRemoteEndpoint } from "./compatibility.ts";
import type { DevThinkConfig, DevThinkPaths } from "./config.ts";

export type SyncSnapshot = { version: 1; userId: string; deviceId: string; exportedAt: string; workspaces: Workspace[]; sessions: Session[] };
export type RemoteSyncStatus = { enabled: boolean; endpoint?: string; ready: boolean; reason?: string };

export function exportLocalSnapshot(paths: DevThinkPaths): SyncSnapshot {
  const identity = getIdentity(paths);
  const sessions = listSessions(paths);
  const workspaces = [...new Set(sessions.map((session) => session.workspaceId))].flatMap((workspaceId) => {
    const workspace = loadWorkspace(paths, workspaceId);
    return workspace ? [workspace] : [];
  });
  return { version: 1, userId: identity.userId, deviceId: identity.deviceId, exportedAt: new Date().toISOString(), workspaces, sessions };
}

export function remoteSyncStatus(config: DevThinkConfig): RemoteSyncStatus {
  const remote = config.web?.remoteSync;
  if (!remote?.enabled) return { enabled: false, ready: false, reason: "Remote synchronization is disabled; local pairing remains available." };
  if (!remote.endpoint) return { enabled: true, ready: false, reason: "Set web.remoteSync.endpoint to a user-operated HTTPS API that implements the DevThink sync contract." };
  if (!isSecureRemoteEndpoint(remote.endpoint)) {
    return { enabled: true, endpoint: remote.endpoint, ready: false, reason: "Remote synchronization endpoint is not a valid HTTPS URL." };
  }
  return { enabled: true, endpoint: new URL(remote.endpoint).toString(), ready: true };
}
