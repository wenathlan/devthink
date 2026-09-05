/**
 * configloader — loads the gateway definition from the user customization layer
 * one file one responsibility — only config loading lives here
 *
 * the library is universal and dry — all logic lives at root
 * the user customization lives in web/config.ts — the hardcoded v1 v5
 * definitions that ship as the default example
 *
 * resolution order:
 *   1 gateway.config.ts in cwd — user placed config at project root
 *   2 web/config.ts — the standard location per architecture skill
 *   3 builtin default — the shipped v1 v5 example configs
 *
 * the cli scaffolds a fresh web/config.ts for new users
 * users may create as many versions as they want — v1 through v9 and beyond
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { gatewayconfig, gatewaydefinition } from "./types";

/** loaded definition cache */
let loaded: gatewaydefinition | null = null;

/** builtin default — empty definition when no user config exists
 * the library is dry — user customization lives in web/config.ts
 * the cli scaffolds a fresh web/config.ts for new users */
async function builtindefault(): Promise<gatewaydefinition> {
  return { versions: {} };
}

/** try import from a path — returns null when not found */
async function tryimport(path: string): Promise<gatewaydefinition | null> {
  try {
    const mod = await import(/* @vite-ignore */ path);
    const candidate = mod.default ?? mod.config ?? mod.gatewaydefinition ?? mod;
    if (candidate && typeof candidate === "object" && "versions" in candidate) {
      return candidate as gatewaydefinition;
    }
    return null;
  } catch {
    return null;
  }
}

/** config search bases — cwd, module dir (source root) and module parent (dist)
 * relative dynamic imports resolve against the importing module url not
 * the process cwd, so the built dist/configloader.js must also probe the
 * parent directory where web/config.ts lives in a packaged install */
function searchbases(): string[] {
  const moduledir = dirname(fileURLToPath(import.meta.url));
  const bases = [resolve(process.cwd()), moduledir, resolve(moduledir, "..")];
  return [...new Set(bases)];
}

/** loadconfig — resolve the gateway definition from the standard locations
 * caches the result for the process lifetime — call reloadconfig to refresh */
export async function loadconfig(): Promise<gatewaydefinition> {
  if (loaded) return loaded;
  // .mjs variants come first in each pair: the extension carries the module
  // type (immune to the nearest package.json type field), so a config
  // scaffolded by the cli loads under plain node in every consumer project
  const names = [
    "web/config.mjs",
    "web/config.ts",
    "web/config.js",
    "gateway.config.mjs",
    "gateway.config.ts",
    "gateway.config.js",
  ];
  for (const base of searchbases()) {
    for (const name of names) {
      const found = await tryimport(`${base}/${name}`);
      if (found) {
        loaded = found;
        return found;
      }
    }
  }
  // builtin fallback
  loaded = await builtindefault();
  return loaded;
}

/** reloadconfig — clear the cache and reload from disk */
export async function reloadconfig(): Promise<gatewaydefinition> {
  loaded = null;
  return loadconfig();
}

/** getversion — get one version config by id */
export async function getversion(id: string): Promise<gatewayconfig | null> {
  const def = await loadconfig();
  return def.versions[id] ?? null;
}

/** listversions — get all version ids */
export async function listversions(): Promise<string[]> {
  const def = await loadconfig();
  return Object.keys(def.versions);
}

/** validateconfig — check a gateway definition for common errors
 * returns a list of human readable problems — empty when valid */
export function validateconfig(def: gatewaydefinition): string[] {
  const problems: string[] = [];
  if (!def.versions || Object.keys(def.versions).length === 0) {
    problems.push("no versions defined — add at least one version to versions map");
    return problems;
  }
  for (const [id, cfg] of Object.entries(def.versions)) {
    const prefix = `version ${id}:`;
    if (!cfg.id) problems.push(`${prefix} missing id`);
    if (cfg.id !== id)
      problems.push(`${prefix} id mismatch — map key is ${id} but id is ${cfg.id}`);
    if (!cfg.providername) problems.push(`${prefix} missing providername`);
    if (!cfg.upstreams || cfg.upstreams.length === 0)
      problems.push(`${prefix} no upstreams configured`);
    if (!cfg.auth) problems.push(`${prefix} missing auth config`);
    if (!cfg.models || cfg.models.length === 0) problems.push(`${prefix} no models configured`);
    if (!cfg.metamodel?.id) problems.push(`${prefix} missing metamodel id`);
    // rotation models must exist in the catalog — the catalog may itself be
    // missing (already reported above) so the lookup guards against it
    if (cfg.rotation?.models) {
      const ids = new Set((cfg.models ?? []).map((m) => m.id));
      for (const rm of cfg.rotation.models) {
        if (!ids.has(rm)) problems.push(`${prefix} rotation model ${rm} not in models catalog`);
      }
    }
    // defaultmodel must exist
    if (
      cfg.defaultmodel &&
      !(cfg.models ?? []).find((m) => m.id === cfg.defaultmodel) &&
      cfg.defaultmodel !== cfg.metamodel?.id
    ) {
      problems.push(`${prefix} defaultmodel ${cfg.defaultmodel} not in models catalog`);
    }
    // auth env var must be set when required from env — a version with a
    // missing auth block already carries its problem above; the dereference
    // below used to crash the whole validation with a type error instead of
    // reporting the remaining problems
    if (cfg.auth?.required && cfg.auth?.keysources?.includes("env") && !cfg.auth?.envvar) {
      problems.push(`${prefix} auth requires env keys but envvar is not set`);
    }
  }
  return problems;
}
