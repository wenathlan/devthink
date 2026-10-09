/** Style: DevThink interface catalog — the read-only data layer of the pages.
 * The owner doctrine: the interface never hardcodes data in components and
 * never touches the visitor machine — no IndexedDB, no localForage, no
 * browser storage writes. The rows live in the site's own self-hosted
 * database (the virtual repo that mirrors the repository content per theme)
 * and reach the interface over HTTPS; the reviewed seeds below are the
 * offline answer of the static build until the database endpoint is paired. */
import {
  seedAboutBlocks,
  seedAppIconSets,
  seedAppIcons,
  seedCoreModules,
  seedFamilySites,
  seedMediaSlots,
  seedPlatformApps,
  seedPolicySections,
  seedPrinciples,
  seedRecipes,
  seedRungs,
  seedRunnerBinaries,
  seedStudioAssets,
  seedStudioTracks,
  seedTermsSections,
} from "./seedcatalog";

export type FamilySite = { host: string; name: string; blurb: string };
export type Recipe = { name: string; family: string; grade: "basic" | "medium" | "advanced"; duration: string };
export type Rung = { version: string; stamp: string; note: string; latest?: boolean };
export type CoreModule = { name: string; role: string };
export type NativeApp = { id: string; title: string; blurb: string; engine: string; owner: string; route: string };
export type RunnerBinary = {
  id: string;
  title: string;
  kind: "game" | "application";
  formats: string;
  runner: string;
  blurb: string;
};
export type StudioAsset = {
  id: string;
  title: string;
  studio: string;
  engine: string;
  /** the running time of a moving asset; a still carries no duration */
  duration?: string;
  /** the pixel size a still asset answers for */
  size?: string;
};
export type StudioTrack = { id: string; title: string; engine: string; minutes: string; blurb: string };
export type AboutBlock = { id: string; heading: string; body: string[] };
export type Principle = { id: string; name: string; detail: string };
export type MediaSlot = { id: string; label: string; ratio: string; caption: string };
export type LegalSection = { id: string; title: string; paragraphs: string[] };
export type AppIcon = {
  id: string;
  file: string;
  format: "svg" | "ico" | "png";
  sizes: string;
  purpose: string;
  origin: string;
};
export type AppIconSet = { app: string; story: string; depth: string; motion: string };

type CatalogKind =
  | "family.sites"
  | "family.recipes"
  | "release.ladder"
  | "platform.modules"
  | "platform.apps"
  | "platform.binaries"
  | "studio.assets"
  | "studio.tracks"
  | "institutional.about"
  | "institutional.principles"
  | "institutional.media"
  | "institutional.terms"
  | "institutional.policy"
  | "platform.icons"
  | "app.icons";

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

export function nativeApps(): Promise<NativeApp[]> {
  return catalogRows("platform.apps", seedPlatformApps);
}

export function runnerBinaries(): Promise<RunnerBinary[]> {
  return catalogRows("platform.binaries", seedRunnerBinaries);
}

export function studioAssets(): Promise<StudioAsset[]> {
  return catalogRows("studio.assets", seedStudioAssets);
}

export function studioTracks(): Promise<StudioTrack[]> {
  return catalogRows("studio.tracks", seedStudioTracks);
}

export function aboutBlocks(): Promise<AboutBlock[]> {
  return catalogRows("institutional.about", seedAboutBlocks);
}

export function principleTable(): Promise<Principle[]> {
  return catalogRows("institutional.principles", seedPrinciples);
}

export function mediaSlots(): Promise<MediaSlot[]> {
  return catalogRows("institutional.media", seedMediaSlots);
}

export function termsSections(): Promise<LegalSection[]> {
  return catalogRows("institutional.terms", seedTermsSections);
}

export function policySections(): Promise<LegalSection[]> {
  return catalogRows("institutional.policy", seedPolicySections);
}

/** The app icon surfaces: the only static binaries the doctrine allows, and
 * they mirror here so the catalog stays the single description of the brand. */
export function appIcons(): Promise<AppIcon[]> {
  return catalogRows("platform.icons", seedAppIcons);
}

/** The premium icon sets of the desktop apps: the story color, the depth
 * layers and the hover motion of every drawn icon, declared by the catalog
 * (the interface components visualize these rows, they never restate them). */
export function appIconSets(): Promise<AppIconSet[]> {
  return catalogRows("app.icons", seedAppIconSets);
}
