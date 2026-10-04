/** Style: Saddle interface catalog — the read-only data layer of the pages.
 * The owner doctrine: the interface never hardcodes data in components and
 * never touches the visitor machine — no IndexedDB, no localForage, no
 * browser storage writes. The rows live in the site's own self-hosted
 * database (the virtual repo that mirrors the repository content per theme)
 * and reach the interface over HTTPS; the reviewed seeds below are the
 * offline answer of the static build until the database endpoint is paired.
 * Media is never a file in the repository: the pages prepare media areas and
 * the catalog answers their labels, ratios and captions. */
import { seedMediaSlots } from "./seed.catalog";

export type MediaSlot = { id: string; label: string; ratio: string; caption: string };

type CatalogKind = "saddle.media";

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

export function mediaSlots(): Promise<MediaSlot[]> {
  return catalogRows("saddle.media", seedMediaSlots);
}
