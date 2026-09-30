// # catalog — the typed accessor the Sol pages call: it serves the content tables of the
// site from the site's own self-hosted db. When VITE_CATALOG_URL points at the site api
// the rows arrive over HTTPS; otherwise the static build answers from the in-memory seed
// module. Nothing is written anywhere: the memo below is plain memory, the visitor
// machine only loads the interface.
import type {
  ConfigBlock,
  DnsTransport,
  FeatureCard,
  OptionChoice,
  PublicationStep,
  RecordSetRow,
  RolloverStep,
  SignalBadge,
  ZoneSnapshot,
} from "./argan";
import {
  seedConfigBlocks,
  seedDnssecAlgorithms,
  seedDnssecKeyCards,
  seedDohFirstCards,
  seedHeroBadges,
  seedLibraryCards,
  seedLocaleChoices,
  seedPublicationSteps,
  seedRecordSets,
  seedResolverChoices,
  seedRolloverSteps,
  seedTransports,
  seedZones,
} from "./seed";

/** base url of the site catalog api (self-hosted db over HTTPS); empty answers from the seed */
const endpoint = (import.meta.env.VITE_CATALOG_URL as string | undefined)?.trim().replace(/\/$/, "") ?? "";

const memo = new Map<string, Promise<unknown>>();

async function fetchTable<T>(name: string): Promise<T[]> {
  const response = await fetch(`${endpoint}/${name}`, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`catalog ${name} answered ${response.status}`);
  return (await response.json()) as T[];
}

/** Resolves one content table: the api over HTTPS when configured, the seed offline. */
function table<T>(name: string, seeds: readonly T[]): Promise<T[]> {
  let entry = memo.get(name);
  if (!entry) {
    entry = endpoint ? fetchTable<T>(name) : Promise.resolve([...seeds]);
    memo.set(name, entry);
    entry.catch(() => memo.delete(name)); // a failed fetch retries on the next call
  }
  return entry as Promise<T[]>;
}

export function listZones(): Promise<ZoneSnapshot[]> {
  return table("zones", seedZones);
}

export function listApexRecordSets(): Promise<RecordSetRow[]> {
  return table("record-sets", seedRecordSets);
}

export function listPublicationSteps(): Promise<PublicationStep[]> {
  return table("publication-steps", seedPublicationSteps);
}

export function listLibraryCards(): Promise<FeatureCard[]> {
  return table("cards.home-library", seedLibraryCards);
}

export function listDnssecKeyCards(): Promise<FeatureCard[]> {
  return table("cards.dnssec-keys", seedDnssecKeyCards);
}

export function listDohFirstCards(): Promise<FeatureCard[]> {
  return table("cards.doh-first", seedDohFirstCards);
}

export function listHeroBadges(): Promise<SignalBadge[]> {
  return table("badges.hero", seedHeroBadges);
}

export function listDnssecAlgorithms(): Promise<SignalBadge[]> {
  return table("badges.dnssec-alg", seedDnssecAlgorithms);
}

export function listTransports(): Promise<DnsTransport[]> {
  return table("transports", seedTransports);
}

export function listConfigBlocks(): Promise<ConfigBlock[]> {
  return table("config-blocks", seedConfigBlocks);
}

export function listRolloverSteps(): Promise<RolloverStep[]> {
  return table("rollover-steps", seedRolloverSteps);
}

/** Reads one group of the settings selects (parameterized by group). */
export function listOptionChoices(group: "resolver" | "locale"): Promise<OptionChoice[]> {
  const seeds = group === "resolver" ? seedResolverChoices : seedLocaleChoices;
  return table(`choices.${group}`, seeds);
}
