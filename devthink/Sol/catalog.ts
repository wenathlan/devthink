/** Style: DevThink interface catalog — the read-only data layer of the pages.
 * The owner doctrine: the interface never hardcodes data in components and
 * never touches the visitor machine — no IndexedDB, no localForage, no
 * browser storage writes. The rows live in the site's own self-hosted
 * database (the virtual repo that mirrors the repository content per theme)
 * and reach the interface over HTTPS; the reviewed seeds below are the
 * offline answer of the static build until the database endpoint is paired. */
import {
  seedCoreModules,
  seedFamilySites,
  seedRecipes,
  seedRungs,
} from "./seed.catalog";

export type FamilySite = { host: string; name: string; blurb: string };
export type Recipe = { name: string; family: string; grade: "basic" | "medium" | "advanced"; duration: string };
export type Rung = { version: string; stamp: string; note: string; latest?: boolean };
export type CoreModule = { name: string; role: string };

type CatalogKind = "family.sites" | "family.recipes" | "release.ladder" | "platform.modules";

const cache = new Map<CatalogKind, unknown[]>();

/** Reads one catalog kind: the paired database answers first over HTTPS
 * (same origin gateway path), the reviewed seeds answer offline. Nothing is
 * written to the visitor device. */
async function catalogRows<T>(kind: CatalogKind, seeds: T[]): Promise<T[]> {
  const cached = cache.get(kind);
  if (cached) return cached as T[];
  let rows: T[] = seeds;
  try {
    const base = (import.meta.env?.VITE_CATALOG_URL as string | undefined)?.replace(/\/$/, "") ?? "";
    if (base) {
      const answer = await fetch(`${base}/catalog/${kind}`, { headers: { accept: "application/json" } });
      if (answer.ok) {
        const payload = (await answer.json()) as { rows?: T[] };
        if (Array.isArray(payload.rows) && payload.rows.length) rows = payload.rows;
      }
    }
  } catch {
    /* the database endpoint is optional; the seeds answer the static build */
  }
  cache.set(kind, rows);
  return rows;
}

export function familySites(): Promise<FamilySite[]> {
  return catalogRows("family.sites", seedFamilySites);
}

export function recipeGallery(): Promise<Recipe[]> {
  return catalogRows("family.recipes", seedRecipes);
}

export function releaseLadder(): Promise<Rung[]> {
  return catalogRows("release.ladder", seedRungs);
}

export function coreModuleTable(): Promise<CoreModule[]> {
  return catalogRows("platform.modules", seedCoreModules);
}
