/** DevThink local store: mirrors credential-free workbench records into a physical SQLite database. */
import type { DevThinkPaths } from "./config.ts";

type Statement = { run: (...values: unknown[]) => unknown };
type Database = { exec: (sql: string) => unknown; prepare: (sql: string) => Statement; close: () => void };
type DatabaseConstructor = new (path: string) => Database;

const sqliteModule = await import(process.versions.bun ? "bun:sqlite" : "node:sqlite");
const DatabaseDriver = (process.versions.bun ? sqliteModule.Database : sqliteModule.DatabaseSync) as unknown as DatabaseConstructor;

export type StoredWorkspace = { id: string; title: string; createdAt: string; updatedAt: string };
export type StoredTab = { id: string; sessionId: string; workspaceId: string; label: string; provider?: string; sectionId: string; createdAt: string; updatedAt: string };
export type StoredMessage = { id: string; sessionId: string; workspaceId: string; tabId: string; sectionId: string; role: string; content: string; createdAt: string };
export type StoredSession = { id: string; workspaceId: string; title: string; mode: string; model?: string; provider?: string; activeTabId: string; createdAt: string; updatedAt: string; tabs: StoredTab[]; messages: StoredMessage[] };

function initialize(database: Database): void {
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, title TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, title TEXT NOT NULL, mode TEXT NOT NULL, model TEXT, provider TEXT, active_tab_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tabs (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, workspace_id TEXT NOT NULL, label TEXT NOT NULL, provider TEXT, section_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, workspace_id TEXT NOT NULL, tab_id TEXT NOT NULL, section_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS sessions_workspace_updated ON sessions(workspace_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS tabs_session_updated ON tabs(session_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS messages_session_created ON messages(session_id, created_at ASC);
  `);
}

/** Executes a local SQLite transaction without allowing database failures to erase JSON-compatible records. */
export function mirrorSession(paths: DevThinkPaths, workspace: StoredWorkspace, session: StoredSession): void {
  let database: Database | undefined;
  try {
    database = new DatabaseDriver(paths.database);
    initialize(database);
    database.exec("BEGIN IMMEDIATE");
    database.prepare("INSERT INTO workspaces (id, title, created_at, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title = excluded.title, updated_at = excluded.updated_at").run(workspace.id, workspace.title, workspace.createdAt, workspace.updatedAt);
    database.prepare("INSERT INTO sessions (id, workspace_id, title, mode, model, provider, active_tab_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET workspace_id = excluded.workspace_id, title = excluded.title, mode = excluded.mode, model = excluded.model, provider = excluded.provider, active_tab_id = excluded.active_tab_id, updated_at = excluded.updated_at").run(session.id, session.workspaceId, session.title, session.mode, session.model ?? null, session.provider ?? null, session.activeTabId, session.createdAt, session.updatedAt);
    database.prepare("DELETE FROM tabs WHERE session_id = ?").run(session.id);
    database.prepare("DELETE FROM messages WHERE session_id = ?").run(session.id);
    const addTab = database.prepare("INSERT INTO tabs (id, session_id, workspace_id, label, provider, section_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const addMessage = database.prepare("INSERT INTO messages (id, session_id, workspace_id, tab_id, section_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    for (const tab of session.tabs) addTab.run(tab.id, tab.sessionId, tab.workspaceId, tab.label, tab.provider ?? null, tab.sectionId, tab.createdAt, tab.updatedAt);
    for (const message of session.messages) addMessage.run(message.id, message.sessionId, message.workspaceId, message.tabId, message.sectionId, message.role, message.content, message.createdAt);
    database.exec("COMMIT");
  } catch {
    try { database?.exec("ROLLBACK"); } catch { /* JSON compatibility record remains the authoritative fallback. */ }
  } finally {
    database?.close();
  }
}
