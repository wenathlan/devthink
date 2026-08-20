import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { DevThinkPaths } from "./config.ts";

export type MemoryLayer = "session" | "project" | "global";

export type MemoryEntry = {
  id: string;
  layer: MemoryLayer;
  key: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type MemoryQuery = {
  key?: string;
  text?: string;
  sessionId?: string;
};

function memoryFile(paths: DevThinkPaths, layer: MemoryLayer, sessionId?: string): string {
  if (layer === "session") return join(paths.sessions, `${sessionId || "active"}.memory.json`);
  if (layer === "project") return join(process.cwd(), ".devthink", "project-memory.json");
  return join(paths.memory, "global-memory.json");
}

function readEntries(path: string, layer: MemoryLayer): MemoryEntry[] {
  try {
    if (!existsSync(path)) return [];
    const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
    return Array.isArray(parsed) ? (parsed as MemoryEntry[]).filter((entry) => entry.layer === layer) : [];
  } catch {
    return [];
  }
}

function writeEntries(path: string, entries: MemoryEntry[]): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function scoreEntry(entry: MemoryEntry, query: MemoryQuery): number {
  const key = normalize(query.key || "");
  const text = normalize(query.text || "");
  let score = 0;
  if (key && normalize(entry.key) === key) score += 10;
  if (text && normalize(entry.content).includes(text)) score += 5;
  if (!key && !text) score = 1;
  return score;
}

export function createMemoryStore(paths: DevThinkPaths) {
  return {
    remember(entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">): MemoryEntry {
      const now = new Date().toISOString();
      const path = memoryFile(paths, entry.layer, entry.layer === "session" ? entry.key : undefined);
      const entries = readEntries(path, entry.layer);
      const current = entries.find((item) => item.key === entry.key);
      const next: MemoryEntry = {
        id: current?.id || crypto.randomUUID(),
        ...entry,
        createdAt: current?.createdAt || now,
        updatedAt: now,
      };
      writeEntries(path, [...entries.filter((item) => item.id !== next.id), next]);
      return next;
    },
    resolve(query: MemoryQuery): MemoryEntry | undefined {
      const layers: MemoryLayer[] = ["session", "project", "global"];
      for (const layer of layers) {
        const entries = readEntries(memoryFile(paths, layer, query.sessionId), layer);
        const match = entries.map((entry) => ({ entry, score: scoreEntry(entry, query) })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score)[0];
        if (match) return match.entry;
      }
      return undefined;
    },
    list(layer?: MemoryLayer, sessionId?: string): MemoryEntry[] {
      const layers: MemoryLayer[] = layer ? [layer] : ["session", "project", "global"];
      return layers.flatMap((item) => readEntries(memoryFile(paths, item, sessionId), item));
    },
  };
}

export type MemoryStore = ReturnType<typeof createMemoryStore>;

export function memorySummary(store: MemoryStore): string {
  const entries = store.list();
  if (!entries.length) return "No local memory entries.";
  return entries.map((entry) => `${entry.layer}:${entry.key} — ${entry.content}`).join("\n");
}
