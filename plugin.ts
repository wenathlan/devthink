import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export type PluginContext = {
  cwd: string;
  log: (message: string) => void;
};

export type PluginDefinition = {
  name: string;
  version?: string;
  hooks?: Record<string, (payload: unknown, context: PluginContext) => unknown | Promise<unknown>>;
};

export type PluginManifest = {
  name: string;
  entry: string;
  enabled?: boolean;
};

function pluginRoot(): string {
  return join(process.env.DEVTHINK_HOME || join(process.cwd(), ".devthink"), "plugins");
}

function readManifest(path: string): PluginManifest | undefined {
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as PluginManifest;
    if (!parsed.name || !parsed.entry) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

async function importPlugin(manifestPath: string, manifest: PluginManifest): Promise<PluginDefinition> {
  const entry = resolve(join(manifestPath, "..", manifest.entry));
  const loaded = (await import(pathToFileURL(entry).href)) as { default?: PluginDefinition } & PluginDefinition;
  return loaded.default || loaded;
}

export function listPluginManifests(root = pluginRoot()): PluginManifest[] {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => readManifest(join(root, item.name, "devthink.plugin.json"))).filter((item): item is PluginManifest => Boolean(item));
}

export async function loadPlugins(root = pluginRoot()): Promise<PluginDefinition[]> {
  const manifests = listPluginManifests(root).filter((manifest) => manifest.enabled !== false);
  const plugins: PluginDefinition[] = [];
  for (const manifest of manifests) {
    const path = join(root, manifest.name, "devthink.plugin.json");
    try {
      plugins.push(await importPlugin(path, manifest));
    } catch {
      // A broken optional plugin does not prevent the core CLI from starting.
    }
  }
  return plugins;
}

export async function runHook(plugins: PluginDefinition[], hook: string, payload: unknown, context: PluginContext): Promise<unknown[]> {
  const results: unknown[] = [];
  for (const plugin of plugins) {
    const handler = plugin.hooks?.[hook];
    if (handler) results.push(await handler(payload, context));
  }
  return results;
}
