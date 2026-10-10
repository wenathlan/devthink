// # catalog — the typed accessor the Sol pages call: it serves the content tables of the
// site from the site's own self-hosted db. When VITE_CATALOG_URL points at the site api
// the rows arrive over HTTPS; otherwise the static build answers from the in-memory seed
// module. Nothing is written anywhere: the memo below is plain memory, the visitor
// machine only loads the interface.
import type {
  CreativeAnchor,
  FeatureCard,
  GalleryProject,
  OptionChoice,
  PlayerFormat,
  SignalBadge,
} from "./versawase.ts";
import {
  seedAnchors,
  seedAutoplayChoices,
  seedFilterChoices,
  seedHeroBadges,
  seedPlayerFormats,
  seedProjects,
  seedSeatCards,
} from "./seed.ts";

/** base url of the site catalog api (self-hosted db over HTTPS); empty answers from the seed */
const endpoint = (import.meta.env.VITE_CATALOG_URL as string | undefined)?.trim().replace(/\/$/, "") ?? "";

const memo = new Map<string, Promise<unknown>>();

async function fetchTable(name: string): Promise<unknown[]> {
  const response = await fetch(`${endpoint}/${name}`, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`catalog ${name} answered ${response.status}`);
  return (await response.json()) as unknown[];
}

/** Resolves one content table: the api over HTTPS when configured, the seed offline. */
function table<T>(name: string, seeds: readonly T[]): Promise<T[]> {
  let entry = memo.get(name);
  if (!entry) {
    entry = endpoint ? fetchTable(name) : Promise.resolve([...seeds]);
    memo.set(name, entry);
    entry.catch(() => memo.delete(name)); // a failed fetch retries on the next call
  }
  return entry as Promise<T[]>;
}

export function listPlayerFormats(): Promise<PlayerFormat[]> {
  return table("player-formats", seedPlayerFormats);
}

export function listAnchors(): Promise<CreativeAnchor[]> {
  return table("anchors", seedAnchors);
}

export function listProjects(): Promise<GalleryProject[]> {
  return table("projects", seedProjects);
}

export function listSeatCards(): Promise<FeatureCard[]> {
  return table("cards.home-seats", seedSeatCards);
}

export function listHeroBadges(): Promise<SignalBadge[]> {
  return table("badges.hero", seedHeroBadges);
}

/** Reads one group of the selects (parameterized by group). */
export function listOptionChoices(group: "gallery-filter" | "autoplay"): Promise<OptionChoice[]> {
  const seeds = group === "gallery-filter" ? seedFilterChoices : seedAutoplayChoices;
  return table(`choices.${group}`, seeds);
}
