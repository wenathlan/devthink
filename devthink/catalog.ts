/** Style: DevThink interface catalog — the read-only data layer of the pages.
 * The owner doctrine: the interface never hardcodes data in components and
 * never touches the visitor machine — no IndexedDB, no localForage, no
 * browser storage writes. The rows live in the site's own self-hosted
 * database (the virtual repo that mirrors the repository content per theme)
 * and reach the interface over HTTPS; the reviewed seeds below are the
 * offline answer of the static build until the database endpoint is paired. */
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
export type LanguageRow = { code: string; native: string };
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

export type OsAppLabel = {
  id: string;
  /** display label under the icon */
  name: string;
  /** one-line description for the start menu */
  detail: string;
  /** shows in the Start menu pinned grid */
  pinned: boolean;
};

export type OsAppWindow = {
  app: string;
  /** spawn width of the window frame in px */
  width: number;
  /** spawn height of the window frame in px */
  height: number;
};

type CatalogKind =
  | "family.sites"
  | "family.recipes"
  | "release.ladder"
  | "platform.modules"
  | "platform.apps"
  | "platform.binaries"
  | "platform.languages"
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
    const base = (import.meta.env.VITE_CATALOG_URL as string | undefined)?.replace(/\/$/, "") ?? "";
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

/** the os app label table: the registry info by app id — synchronous on
 * purpose (the desktop grid and the start menu read it at mount; the
 * paired endpoint refresh lands with the database wave, the seeds are
 * the offline answer of the static build) */
export function osAppLabels(): Record<string, OsAppLabel> {
  const rows: Record<string, OsAppLabel> = {};
  for (const row of seedOsAppLabels) rows[row.id] = row;
  return rows;
}

/** the os app window table: the spawn geometry by app id — synchronous on
 * purpose (the window logic reads it at spawn; the paired endpoint refresh
 * lands with the database wave, the seeds are the offline answer of the
 * static build) */
export function osAppWindows(): Record<string, OsAppWindow> {
  const rows: Record<string, OsAppWindow> = {};
  for (const row of seedOsAppWindows) rows[row.app] = row;
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

/** the display language ladder of the settings card — the paired database
 * answers over the catalog seam, the reviewed seeds answer the static
 * build (2026: the language winget reads this accessor, it never restates
 * the rows). */
export function languageLadder(): Promise<LanguageRow[]> {
  return catalogRows("platform.languages", seedLanguages);
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

/* ===== block: seedcatalog ===== */
/** The reviewed seed rows of the interface catalog: the only place platform data is written before the DB serves it.
 * The native app, runner binary and studio rows below are the offline answer of the static build; the paired
 * database overrides them per kind once it answers over HTTPS. The catalog types are imported as types only,
 * so the module direction stays one way at runtime (catalog.ts imports these values, never the reverse). */

export const seedFamilySites: FamilySite[] = [
  {
    host: "https://argan.devthink.pro",
    name: "argan — dns tools",
    blurb: "Zones, records, DNSSEC, handshake and the shared toolkit every site rides.",
  },
  {
    host: "https://debonair.devthink.pro",
    name: "debonair — audio daw",
    blurb: "Generate, edit and master audio in the music studio. Isolated branding app of the OS.",
  },
  {
    host: "https://cadria.devthink.pro",
    name: "cadria — video & image studio",
    blurb: "Player for every format, editor and creative anchors of the video and image studio.",
  },
  {
    host: "https://stealthhead.devthink.pro",
    name: "stealthhead — fps platform",
    blurb: "Match, ranking, weapons and world logic — the game runs in the family 3D studio.",
  },
  {
    host: "https://forge.devthink.pro",
    name: "forge — sandbox cloud",
    blurb: "Sandbox fleets, work queues and live logs of the build floor.",
  },
  {
    host: "https://foundry.devthink.pro",
    name: "foundry — sandboxes & images",
    blurb: "Sandbox builds, image conversion and the packaged exports of the family.",
  },
  {
    host: "https://vault.devthink.pro",
    name: "vault — the storage reserve",
    blurb: "Objects, buckets and sealed reserves with the retention rules every app shares.",
  },
  {
    host: "https://getry.devthink.pro",
    name: "getry — ai teams",
    blurb: "Versions, thinking sessions and the model choices of the family.",
  },
];

/** the recipe gallery rides the paired database only — the demo example
 * rows the static build once carried were retired (the owner's db-truth
 * wave: frozen example literals never pretend to be runtime data). */
export const seedRecipes: Recipe[] = [];

export const seedRungs: Rung[] = [
  {
    version: "2.0.40",
    stamp: "the envelope family",
    note: "The envelope family stamps the rung together — workbench sessions, streaming and extension gates ship in one envelope.",
    latest: true,
  },
  {
    version: "2.0.39",
    stamp: "the container tests",
    note: "Container tests know the forge rides outside: sandbox tests validate against the embedded sandbox boundary.",
  },
  {
    version: "2.0.0",
    stamp: "the example gallery",
    note: "36 runnable recipes across five families inside the site surface, with difficulty grades and expected durations.",
  },
  {
    version: "1.1.82",
    stamp: "the site bridge",
    note: "Bridgemark badges: connected, paired and offline socket states with the engaged kill switch reading danger.",
  },
  {
    version: "1.1.78",
    stamp: "capture forensics",
    note: "Forensics marks color the diffs: regressions read red, warnings amber, clean diffs green.",
  },
  {
    version: "1.1.1",
    stamp: "the first stamp",
    note: "The extension family begins: consent-first agent bridge with three gates — session, plan and origin.",
  },
];

export const seedCoreModules: CoreModule[] = [
  { name: "devthink.ts", role: "CLI entrypoint, flags, commands, interactive loop" },
  { name: "config.ts", role: "platform paths, configuration, credential lookup, redaction" },
  { name: "providers.ts", role: "provider registry, model discovery, request routing" },
  { name: "session.ts", role: "sessions, messages, exports, local persistence" },
  { name: "memory.ts", role: "session, project and global memory layers" },
  { name: "modes.ts", role: "the 20 named operational modes and prompt metadata" },
  { name: "server.ts", role: "local loopback HTTP API" },
  { name: "mcp.ts", role: "model context protocol server surface" },
];

export const seedPlatformApps: NativeApp[] = [
  {
    id: "video",
    title: "Video",
    engine: "video studio",
    owner: "cadria",
    route: "/video",
    blurb: "The video studio, with every asset served from the same catalog.",
  },
  {
    id: "music",
    title: "Music",
    engine: "music studio",
    owner: "debonair",
    route: "/audio",
    blurb: "The music studio, with every track served from the same catalog.",
  },
  {
    id: "image",
    title: "Image",
    engine: "image studio",
    owner: "cadria",
    route: "/image",
    blurb: "The image studio, with every still served from the same catalog.",
  },
  {
    id: "games",
    title: "Games",
    engine: "sandbox cloud",
    owner: "saddle",
    route: "/games",
    blurb: "The games shelf — every game and app boots by itself.",
  },
];

/** the os app labels: the reviewed seed rows of the registry info (the
 * offline answer of the database; the paired endpoint serves the same
 * shape over HTTPS when it lands) */
export const seedOsAppLabels: OsAppLabel[] = [
  {
    id: "chat",
    name: "Chat",
    detail: "The assistant of the OS",
    pinned: true,
  },
  {
    id: "files",
    name: "My Files",
    detail: "The file explorer of the OS",
    pinned: true,
  },
  {
    id: "history",
    name: "History",
    detail: "Open local session tabs",
    pinned: true,
  },
  {
    id: "projects",
    name: "Projects",
    detail: "Local workspace records",
    pinned: true,
  },
  {
    id: "console",
    name: "Console",
    detail: "The canonical design of the CLI",
    pinned: true,
  },
  {
    id: "calculator",
    name: "Calculator",
    detail: "The native arithmetic app of the OS",
    pinned: true,
  },
  {
    id: "image",
    name: "Image",
    detail: "The native image studio of the OS",
    pinned: true,
  },
  {
    id: "video",
    name: "Video",
    detail: "The native video editor of the OS",
    pinned: true,
  },
  {
    id: "audio",
    name: "Audio",
    detail: "The native audio studio of the OS",
    pinned: true,
  },
  {
    id: "games",
    name: "Games",
    detail: "The native games shelf of the OS",
    pinned: true,
  },
  {
    id: "gateway",
    name: "Gateway",
    detail: "The embedded local gateway console",
    pinned: true,
  },
  {
    id: "providers",
    name: "Providers",
    detail: "Provider and model choices",
    pinned: false,
  },
  {
    id: "usage",
    name: "Usage",
    detail: "Compact local usage records",
    pinned: false,
  },
  {
    id: "docs",
    name: "Docs",
    detail: "The documentation library",
    pinned: true,
  },
  {
    id: "settings",
    name: "Settings",
    detail: "Pairing and local preferences",
    pinned: true,
  },
  {
    id: "argan",
    name: "Argan",
    detail: "DNS tools of the OS",
    pinned: true,
  },
  {
    id: "cadria",
    name: "Cadria",
    detail: "Video, image and 3D studio",
    pinned: true,
  },
  {
    id: "debonair",
    name: "Debonair",
    detail: "The OS audio DAW",
    pinned: true,
  },
  {
    id: "stealthhead",
    name: "Stealthhead",
    detail: "The OS FPS platform",
    pinned: true,
  },
  {
    id: "forge",
    name: "Forge",
    detail: "The sandbox cloud",
    pinned: true,
  },
  {
    id: "foundry",
    name: "Foundry",
    detail: "Run and keep",
    pinned: true,
  },
  {
    id: "vault",
    name: "Vault",
    detail: "The family vault — the storage reserve",
    pinned: true,
  },
  {
    id: "getry",
    name: "Getry",
    detail: "The family AI teams",
    pinned: true,
  },
  {
    id: "saddle",
    name: "Saddle",
    detail: "The instant sandbox cloud",
    pinned: true,
  },
  {
    id: "cobaia",
    name: "Cobaia",
    detail: "The family store and content site",
    pinned: true,
  },
];

/** the os app windows: the reviewed seed rows of the spawn geometry (the
 * offline answer of the database; the paired endpoint serves the same
 * shape over HTTPS when it lands). the family deploy units ride the
 * 1280x800 desktop band — the window-era law: the app inside the power
 * clip answers the SAME design the direct url answers, so the window
 * opens wide enough for the 961px+ breakpoints of the standalone tree
 * (the screen space may still clamp it at spawn time) */
export const seedOsAppWindows: OsAppWindow[] = [
  {
    app: "calculator",
    width: 520,
    height: 660,
  },
  {
    app: "chat",
    width: 1040,
    height: 720,
  },
  {
    app: "files",
    width: 1020,
    height: 680,
  },
  {
    app: "docs",
    width: 980,
    height: 680,
  },
  {
    app: "console",
    width: 980,
    height: 680,
  },
  {
    app: "settings",
    width: 960,
    height: 680,
  },
  {
    app: "video",
    width: 960,
    height: 680,
  },
  {
    app: "gateway",
    width: 980,
    height: 680,
  },
  {
    app: "saddle",
    width: 1280,
    height: 800,
  },
  {
    app: "argan",
    width: 1280,
    height: 800,
  },
  {
    app: "cadria",
    width: 1280,
    height: 800,
  },
  {
    app: "debonair",
    width: 1280,
    height: 800,
  },
  {
    app: "stealthhead",
    width: 1280,
    height: 800,
  },
  {
    app: "forge",
    width: 1280,
    height: 800,
  },
  {
    app: "foundry",
    width: 1280,
    height: 800,
  },
  {
    app: "vault",
    width: 1280,
    height: 800,
  },
  {
    app: "getry",
    width: 1280,
    height: 800,
  },
  {
    app: "cobaia",
    width: 1280,
    height: 800,
  },
];

/** the runner binaries ride the paired database only — the demo
 * competitor-app rows (the shooter, the 3d suite, the browser, the store)
 * the static build once carried were retired: a runner shelf that ships
 * nothing answers honestly empty, never with frozen demo entries. */
export const seedRunnerBinaries: RunnerBinary[] = [];

/** the studio assets ride the paired database only — the demo media
 * rows (the coastline cuts, the harbor reels, the dune stills) were
 * retired: the studios answer their real records or the honest empty
 * state, never frozen demo media. */
export const seedStudioAssets: StudioAsset[] = [];

/** the studio tracks ride the paired database only — the demo track
 * rows (glass river, low sun, paper moon) were retired with the rest of
 * the demo studio media. */
export const seedStudioTracks: StudioTrack[] = [];

/** the display language ladder of the settings card, native names per the
 * windows grammar — the reviewed seed rows the paired database serves over
 * the catalog seam; the language winget reads them through the accessor
 * and never restates them (2026: no fixed data in wingets). */
export const seedLanguages: LanguageRow[] = [
  { code: "en", native: "English (United States)" },
  { code: "pt", native: "Português (Brasil)" },
  { code: "es", native: "Español (España)" },
  { code: "fr", native: "Français (France)" },
  { code: "de", native: "Deutsch (Deutschland)" },
  { code: "it", native: "Italiano (Italia)" },
  { code: "ja", native: "日本語 (日本)" },
  { code: "ko", native: "한국어 (대한민국)" },
  { code: "zh-CN", native: "中文 (简体，中国)" },
  { code: "ru", native: "Русский (Россия)" },
  { code: "ar", native: "العربية" },
  { code: "hi", native: "हिन्दी (भारत)" },
];

export const seedAboutBlocks: AboutBlock[] = [
  {
    id: "about.identity",
    heading: "What DevThink is",
    body: [
      "DevThink is a self-hosted development platform that behaves like an operating system. A command line interface, a local service and a browser surface share one configuration, one catalog and one local store, so the same session, workspace and credential set serve every entry point.",
      "The platform is provider-neutral: model providers are registry entries the configuration names, never hard dependencies. Credentials stay in the local auth file of the operator machine and are read only to sign the requests the user starts.",
    ],
  },
  {
    id: "about.subapps",
    heading: "One system, many subapps",
    body: [
      "The browser surface mounts one subapp per area: console, gateway, providers, projects, routes, usage, apps, docs, explore, history and settings. Each subapp reads the same data layer; when the paired database is offline, reviewed seeds answer the static build so no page renders empty.",
      "The theme layer ships the surfaces beside the data layer. A page never hardcodes its content: structured rows live in the catalog and reach the interface the same way this page receives its text.",
    ],
  },
];

export const seedPrinciples: Principle[] = [
  {
    id: "principle.self-hosted",
    name: "Self-hosted",
    detail:
      "The platform runs on machines the operator controls. The service binds to the local machine, the database mirrors the repository content and no third party sits between the operator and the data.",
  },
  {
    id: "principle.provider-neutral",
    name: "Provider-neutral",
    detail:
      "Providers are registry entries, not dependencies. The app reads the configured catalog and every credential stays in the local auth file the user supplies explicitly.",
  },
  {
    id: "principle.local-first",
    name: "Local-first",
    detail:
      "Sessions, workspaces and memory persist on the local store first. The browser routes read the records the CLI writes and the interface never writes to the visitor device.",
  },
];

export const seedMediaSlots: MediaSlot[] = [
  {
    id: "media.platform.desktop",
    label: "platform desktop",
    ratio: "16 / 9",
    caption: "The shell desktop: mica windows, the dock and the omnibox under one amber light.",
  },
  {
    id: "media.family.sites",
    label: "family sites",
    ratio: "3 / 2",
    caption: "The family sites under one roof.",
  },
  {
    id: "media.studio.surface",
    label: "native studios",
    ratio: "16 / 9",
    caption: "The video and music studios side by side.",
  },
];

export const seedTermsSections: LegalSection[] = [
  {
    id: "terms.scope",
    title: "Scope of use",
    paragraphs: [
      "The platform serves the operator and the visitors the operator invites. Every surface of this site — the pages, the subapps and the service — is provided for development, documentation and studio work.",
      "Access to a surface does not transfer ownership of it. The operator keeps the right to change, restrict or close any surface at any time.",
    ],
  },
  {
    id: "terms.acceptable",
    title: "Acceptable use",
    paragraphs: [
      "Use the platform for work you are allowed to do. Automated traffic must identify itself and respect the rate limits the service enforces.",
      "Do not attempt to bypass authentication, extract credentials, overload the service or interfere with another visitor session.",
    ],
  },
  {
    id: "terms.credentials",
    title: "Credentials and accounts",
    paragraphs: [
      "Provider credentials are supplied by the user and stored locally in the auth file of the operator machine. The platform never asks a visitor for a provider key through these pages.",
      "Submitting a credential through any form on this site is a violation of these terms.",
    ],
  },
  {
    id: "terms.content",
    title: "Content and liability",
    paragraphs: [
      "Studio assets, sessions and documents on this site belong to their authors. The platform stores them as the operator configures it and makes no claim over them.",
      "The platform is provided as is, without warranty of availability, fitness for a particular purpose or freedom from interruption.",
    ],
  },
  {
    id: "terms.changes",
    title: "Changes to these terms",
    paragraphs: [
      "The operator may revise these terms as the platform evolves. A revision applies from the moment it is published on this page, and the version note in the footer identifies the build that served it.",
    ],
  },
];

export const seedPolicySections: LegalSection[] = [
  {
    id: "policy.collect",
    title: "What the platform collects",
    paragraphs: [
      "The interface keeps no analytics, no advertising identifiers and no tracking pixels. A visit to these pages writes nothing to the visitor device: no cookies, no IndexedDB, no local storage.",
      "The service records the technical logs the operator configures: request path, status and timestamp. The logs stay on the machine the operator controls.",
    ],
  },
  {
    id: "policy.local",
    title: "Local storage of work",
    paragraphs: [
      "Sessions, workspaces and memory records are stored in the local database of the operator machine. The browser routes read those records through the paired service and never mirror them to a remote service.",
      "Clearing a workspace in the interface removes its records from the local store the same way a CLI removal does.",
    ],
  },
  {
    id: "policy.providers",
    title: "Provider traffic",
    paragraphs: [
      "When a session calls a model provider, the request travels from the operator machine to the provider the configuration names. The platform sends the conversation content the session contains and nothing else.",
      "Credentials stay in the local auth file; the interface reads them to sign requests and never displays them on these pages.",
    ],
  },
  {
    id: "policy.rights",
    title: "Visitor rights",
    paragraphs: [
      "A visitor who wants a record removed contacts the operator of the site. The operator holds the local store, so removal is a local operation that does not depend on a third party.",
      "Questions about this policy reach the operator through the contact channel the site owner publishes.",
    ],
  },
];

/** The app icon rows: the only static binaries the owner doctrine allows.
 * The vector favicon traces the official brand mark (two paths, viewBox 800);
 * the raster ico and png sizes are rasterized from that exact geometry and
 * every file is declared here so the catalog stays the single description. */
export const seedAppIcons: AppIcon[] = [
  {
    id: "platform.icons.favicon.vector",
    file: "favicon.svg",
    format: "svg",
    sizes: "any",
    purpose: "any",
    origin: "the official two-path brand mark, viewBox 800",
  },
  {
    id: "platform.icons.favicon.raster",
    file: "favicon.ico",
    format: "ico",
    sizes: "16 32 48",
    purpose: "favicon",
    origin: "rasterized from favicon.svg",
  },
  {
    id: "platform.icons.install.192",
    file: "icon192.png",
    format: "png",
    sizes: "192x192",
    purpose: "any",
    origin: "rasterized from favicon.svg",
  },
  {
    id: "platform.icons.install.512",
    file: "icon512.png",
    format: "png",
    sizes: "512x512",
    purpose: "any",
    origin: "rasterized from favicon.svg",
  },
  {
    id: "platform.icons.workbench.tile",
    file: "icon.svg",
    format: "svg",
    sizes: "any",
    purpose: "any",
    origin: "the workbench tile mark of the desktop install, still referenced by the manifest",
  },
];

/** The premium icon set rows were retired with the old drawn icon system:
 * the depth and motion prose described the pre-fluent icon machinery (the
 * perspective tilts, the sheen bands, the film grain washes) that the
 * Windows 11 fluent icon redesign replaced with pure presentational
 * components, and the story tint the tile read falls back to the registry
 * tint when no row answers — the paired database serves fresh rows per
 * kind when it lands, the demo prose never pretends to be runtime data. */
export const seedAppIconSets: AppIconSet[] = [];
