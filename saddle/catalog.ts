/** Style: Saddle interface catalog — the read-only data layer of the pages.
 * The owner doctrine: the interface never hardcodes data in components and
 * never touches the visitor machine — no IndexedDB, no localForage, no
 * browser storage writes. The rows live in the site's own self-hosted
 * database (the virtual repo that mirrors the repository content per theme)
 * and reach the interface over HTTPS; the reviewed seeds below are the
 * offline answer of the static build until the database endpoint is paired.
 * Media is never a file in the repository: the pages prepare media areas and
 * the catalog answers their labels, ratios and captions. */
import { seedAgentSessions, seedMediaSlots } from "./seedcatalog";

export type MediaSlot = { id: string; label: string; ratio: string; caption: string };

/** one captured event of an agent browser session (docs/logs contract). */
export type AgentSessionEvent = {
  /** the relative time of the event in milliseconds */
  t: number;
  /** the event kind: move, click, type or scroll */
  type: string;
  /** the css px coordinates of a move or click */
  x?: number;
  y?: number;
  /** the scroll delta of a scroll event */
  dy?: number;
  /** the pressed key of a type event */
  key?: string;
};

/** one agent browser session row: the session identity, its events and the
 * captcha verdict of the run. */
export type AgentSession = {
  /** the log format version */
  version: number;
  /** the session identity: id, browser and seed */
  session: { id: string; browser: string; seed: string };
  /** the captured events in relative-time order */
  events: AgentSessionEvent[];
  /** the captcha verdict of the run */
  captcha: { kind: string; passed: boolean };
};

type CatalogKind = "saddle.media" | "saddle.sessions";

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

/** the agent browser sessions the pages render: the documented example log
 * offline, the paired database rows over HTTPS once the endpoint answers. */
export function agentsessions(): Promise<AgentSession[]> {
  return catalogRows("saddle.sessions", seedAgentSessions);
}
