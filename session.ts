/** DevThink session model: one stable identity contract for CLI, gateway, local database, and URL-addressable web state. */
import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ensurePaths, type DevThinkPaths } from "./config.ts";
import type { ChatMessage } from "./providers.ts";
import { createCompactId } from "./ids.ts";
import { mirrorSession, type StoredSession, type StoredWorkspace } from "./storage.ts";

export type SessionSection = "chat" | "inspector" | "settings" | "memory" | "providers" | "projects" | "routes" | "usage";
export type SessionTab = { id: string; sessionId: string; workspaceId: string; label: string; provider?: string; sectionId: SessionSection; createdAt: string; updatedAt: string };
export type SessionMessage = ChatMessage & { id: string; sessionId: string; workspaceId: string; tabId: string; sectionId: SessionSection; createdAt: string };
export type Workspace = { id: string; title: string; createdAt: string; updatedAt: string };

export type Session = {
  id: string;
  workspaceId: string;
  title: string;
  mode: string;
  model?: string;
  provider?: string;
  createdAt: string;
  updatedAt: string;
  activeTabId: string;
  tabs: SessionTab[];
  messages: SessionMessage[];
};

function sessionPath(paths: DevThinkPaths, id: string): string {
  return join(paths.sessions, `${id}.json`);
}

function safeTitle(messages: SessionMessage[]): string {
  const first = messages.find((message) => message.role === "user");
  return first?.content.slice(0, 80) || "Untitled session";
}

function workspacePath(paths: DevThinkPaths, id: string): string {
  return join(paths.workspaces, `${id}.json`);
}

function atomicWrite(path: string, value: unknown): void {
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(temporary, path);
}

function newWorkspace(id = createCompactId("w"), title = "Untitled workspace", now = new Date().toISOString()): Workspace {
  return { id, title, createdAt: now, updatedAt: now };
}

function newTab(sessionId: string, workspaceId: string, provider: string | undefined, label: string, sectionId: SessionSection, now: string, id = createCompactId("t")): SessionTab {
  return { id, sessionId, workspaceId, provider, label, sectionId, createdAt: now, updatedAt: now };
}

function normalizeSession(raw: Session): Session {
  const now = raw.updatedAt || new Date().toISOString();
  const workspaceId = raw.workspaceId || createCompactId("w");
  const tabs = raw.tabs?.length ? raw.tabs.map((tab) => ({ ...tab, sessionId: raw.id, workspaceId, sectionId: tab.sectionId || "chat" as SessionSection })) : [newTab(raw.id, workspaceId, raw.provider, raw.title || "Untitled session", "chat", now)];
  const activeTabId = tabs.some((tab) => tab.id === raw.activeTabId) ? raw.activeTabId : tabs[0].id;
  const messages = (raw.messages || []).map((message) => ({ ...message, id: message.id || createCompactId("m"), sessionId: raw.id, workspaceId, tabId: message.tabId || activeTabId, sectionId: message.sectionId || "chat" as SessionSection, createdAt: message.createdAt || now }));
  return { ...raw, workspaceId, activeTabId, tabs, messages };
}

function readSession(path: string): Session | undefined {
  try {
    if (!existsSync(path)) return undefined;
    return normalizeSession(JSON.parse(readFileSync(path, "utf8")) as Session);
  } catch {
    return undefined;
  }
}

function workspaceFor(session: Session): Workspace {
  const title = session.title === "Untitled session" ? "Untitled workspace" : session.title;
  return newWorkspace(session.workspaceId, title, session.createdAt);
}

function saveSession(paths: DevThinkPaths, session: Session): Session {
  ensurePaths(paths);
  const normalized = normalizeSession(session);
  const existing = loadWorkspace(paths, normalized.workspaceId);
  const workspace = { ...(existing || workspaceFor(normalized)), title: normalized.title === "Untitled session" ? existing?.title || "Untitled workspace" : normalized.title, updatedAt: normalized.updatedAt };
  atomicWrite(sessionPath(paths, normalized.id), normalized);
  atomicWrite(workspacePath(paths, workspace.id), workspace);
  mirrorSession(paths, workspace as StoredWorkspace, normalized as StoredSession);
  return normalized;
}

export function createWorkspace(paths: DevThinkPaths, title = "Untitled workspace", id = createCompactId("w")): Workspace {
  ensurePaths(paths);
  const workspace = newWorkspace(id, title);
  atomicWrite(workspacePath(paths, id), workspace);
  return workspace;
}

export function loadWorkspace(paths: DevThinkPaths, id: string): Workspace | undefined {
  try {
    if (!existsSync(workspacePath(paths, id))) return undefined;
    return JSON.parse(readFileSync(workspacePath(paths, id), "utf8")) as Workspace;
  } catch {
    return undefined;
  }
}

export function createSession(paths: DevThinkPaths, metadata: Pick<Session, "mode" | "model" | "provider"> & { workspaceId?: string; tabId?: string; sectionId?: SessionSection; title?: string }): Session {
  const now = new Date().toISOString();
  const id = createCompactId("s");
  const workspace = metadata.workspaceId ? loadWorkspace(paths, metadata.workspaceId) || createWorkspace(paths, "Untitled workspace", metadata.workspaceId) : createWorkspace(paths);
  const tab = newTab(id, workspace.id, metadata.provider, metadata.title || "Untitled session", metadata.sectionId || "chat", now, metadata.tabId);
  const session: Session = { id, workspaceId: workspace.id, title: metadata.title || "Untitled session", mode: metadata.mode, model: metadata.model, provider: metadata.provider, createdAt: now, updatedAt: now, activeTabId: tab.id, tabs: [tab], messages: [] };
  return saveSession(paths, session);
}

export function loadSession(paths: DevThinkPaths, id: string): Session | undefined {
  const session = readSession(sessionPath(paths, id));
  return session ? saveSession(paths, session) : undefined;
}

export function createTab(paths: DevThinkPaths, session: Session, input: { id?: string; label?: string; provider?: string; sectionId?: SessionSection }): Session {
  const now = new Date().toISOString();
  const tab = newTab(session.id, session.workspaceId, input.provider || session.provider, input.label || "New session", input.sectionId || "chat", now, input.id);
  return saveSession(paths, { ...session, activeTabId: tab.id, updatedAt: now, tabs: [...session.tabs, tab] });
}

export function updateTab(paths: DevThinkPaths, session: Session, tabId: string, input: Partial<Pick<SessionTab, "label" | "provider" | "sectionId">>): Session {
  const now = new Date().toISOString();
  const tabs = session.tabs.map((tab) => tab.id === tabId ? { ...tab, ...input, updatedAt: now } : tab);
  if (!tabs.some((tab) => tab.id === tabId)) throw new Error(`Tab not found: ${tabId}`);
  return saveSession(paths, { ...session, activeTabId: tabId, updatedAt: now, tabs });
}

export function appendMessage(paths: DevThinkPaths, session: Session, message: ChatMessage, context?: { tabId?: string; sectionId?: SessionSection; id?: string }): Session {
  const now = new Date().toISOString();
  const tabId = context?.tabId || session.activeTabId;
  if (!session.tabs.some((tab) => tab.id === tabId)) throw new Error(`Tab not found: ${tabId}`);
  const nextMessages = [...session.messages, { ...message, id: context?.id || createCompactId("m"), sessionId: session.id, workspaceId: session.workspaceId, tabId, sectionId: context?.sectionId || "chat", createdAt: now }];
  return saveSession(paths, { ...session, title: safeTitle(nextMessages), updatedAt: now, messages: nextMessages });
}

export function listSessions(paths: DevThinkPaths): Session[] {
  if (!existsSync(paths.sessions)) return [];
  return readdirSync(paths.sessions).filter((file) => file.endsWith(".json") && !file.endsWith(".memory.json")).map((file) => readSession(join(paths.sessions, file))).filter((session): session is Session => Boolean(session)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function renderSessionMarkdown(session: Session): string {
  const lines = [`# ${session.title}`, "", `- Workspace: ${session.workspaceId}`, `- Session: ${session.id}`, `- Active tab: ${session.activeTabId}`, `- Mode: ${session.mode}`, `- Provider: ${session.provider || "not configured"}`, `- Model: ${session.model || "not configured"}`, ""];
  for (const message of session.messages) lines.push(`## ${message.role}`, "", message.content, "");
  return `${lines.join("\n")}\n`;
}

export function exportSession(paths: DevThinkPaths, id: string, format: "json" | "markdown"): string {
  const session = loadSession(paths, id);
  if (!session) throw new Error(`Session not found: ${id}`);
  return format === "json" ? `${JSON.stringify(session, null, 2)}\n` : renderSessionMarkdown(session);
}
