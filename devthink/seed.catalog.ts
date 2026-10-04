/** The reviewed seed rows of the interface catalog: the only place platform data is written before the DB serves it.
 * The native app, runner binary and studio rows below are the offline answer of the static build; the paired
 * database overrides them per kind once it answers over HTTPS. The catalog types are imported as types only,
 * so the module direction stays one way at runtime (catalog.ts imports these values, never the reverse). */
import type {
  AboutBlock,
  AppIcon,
  CoreModule,
  FamilySite,
  LegalSection,
  MediaSlot,
  NativeApp,
  Principle,
  Recipe,
  Rung,
  RunnerBinary,
  StudioAsset,
  StudioTrack,
} from "./catalog";

export const seedFamilySites: FamilySite[] = [
  {
    host: "https://argan.devthink.pro",
    name: "argan — dns & gateway",
    blurb: "Zones, records, DNSSEC, handshake and the unified database every site shares.",
  },
  {
    host: "https://debonair.devthink.pro",
    name: "debonair — audio daw",
    blurb: "Generate, edit and master audio with the katexis engine. Isolated branding app of the OS.",
  },
  {
    host: "https://cadria.devthink.pro",
    name: "cadria — video & image studio",
    blurb: "Player for every format, editor and creative anchors on the versawase engine.",
  },
  {
    host: "https://stealthhead.devthink.pro",
    name: "stealthhead — fps platform",
    blurb: "Match, ranking, weapons and world logic. The engine rides from versawase.",
  },
];

export const seedRecipes: Recipe[] = [
  { name: "Streaming chat with plan proposal", family: "CLI", grade: "basic", duration: "5 min" },
  { name: "Pairing the workbench to the gateway", family: "Workbench", grade: "basic", duration: "3 min" },
  { name: "Consent-first capture with forensics", family: "Extension", grade: "medium", duration: "12 min" },
  { name: "MCP tool catalog with approval gates", family: "MCP", grade: "medium", duration: "10 min" },
  { name: "Multi-agent fleet with run state", family: "Swarm", grade: "advanced", duration: "20 min" },
];

export const seedRungs: Rung[] = [
  {
    version: "2.0.40",
    stamp: "the envelope family",
    note: "The envelope family stamps the rung together — workbench sessions, gateway streaming and extension gates ship in one envelope.",
    latest: true,
  },
  {
    version: "2.0.39",
    stamp: "the container tests",
    note: "Container tests know the forge rides outside: sandbox runners validate against the embedded saddle engine boundary.",
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
    engine: "versawase",
    owner: "cadria",
    route: "/apps/video",
    blurb: "The native video editor pulling the cadria versawase engine through the catalog.",
  },
  {
    id: "music",
    title: "Music",
    engine: "katexis",
    owner: "debonair",
    route: "/apps/music",
    blurb: "The native music studio riding the debonair katexis engine, with every track served from the same catalog.",
  },
  {
    id: "games",
    title: "Games",
    engine: "saddle runner",
    owner: "saddle",
    route: "/apps/games",
    blurb: "The native runner that boots the competitor executables by itself through the saddle engine boundary.",
  },
];

export const seedRunnerBinaries: RunnerBinary[] = [
  {
    id: "call-of-duty",
    title: "Call of Duty",
    kind: "game",
    formats: "exe",
    runner: "saddle virtualization",
    blurb: "The competitor shooter boots inside the saddle virtualization layer without leaving the platform.",
  },
  {
    id: "blender",
    title: "Blender",
    kind: "application",
    formats: "exe",
    runner: "saddle virtualization",
    blurb: "The 3D suite runs beside the native studios and shares the same render queue surface.",
  },
  {
    id: "brave",
    title: "Brave",
    kind: "application",
    formats: "exe",
    runner: "saddle browser surface",
    blurb: "The competitor browser opens through the saddle browser surface instead of a second install.",
  },
  {
    id: "steam",
    title: "Steam",
    kind: "application",
    formats: "exe/apk",
    runner: "saddle virtualization",
    blurb: "The store and its library mount through the runner in both the desktop and the android packaging.",
  },
];

export const seedStudioAssets: StudioAsset[] = [
  { id: "asset.coastline.cut", title: "Coastline Cut", studio: "video", engine: "versawase", duration: "4:12" },
  { id: "asset.harbor.reel", title: "Harbor Reel", studio: "video", engine: "versawase", duration: "2:38" },
  { id: "asset.night.loop", title: "Night Loop", studio: "music", engine: "katexis", duration: "6:04" },
  { id: "asset.amber.take", title: "Amber Take", studio: "music", engine: "katexis", duration: "3:47" },
];

export const seedStudioTracks: StudioTrack[] = [
  {
    id: "track.glass.river",
    title: "Glass River",
    engine: "katexis",
    minutes: "4",
    blurb: "A slow synth bed generated on the katexis engine and mastered in the debonair daw.",
  },
  {
    id: "track.low.sun",
    title: "Low Sun",
    engine: "katexis",
    minutes: "7",
    blurb: "An evening loop the katexis engine renders end to end without a third party plugin.",
  },
  {
    id: "track.paper.moon",
    title: "Paper Moon",
    engine: "katexis",
    minutes: "5",
    blurb: "A percussion sketch kept in the catalog so every studio page renders the same take.",
  },
];

export const seedAboutBlocks: AboutBlock[] = [
  {
    id: "about.identity",
    heading: "What DevThink is",
    body: [
      "DevThink is a self-hosted development platform that behaves like an operating system. A command line interface, a local gateway and a browser surface share one configuration, one catalog and one local store, so the same session, workspace and credential set serve every entry point.",
      "The platform is provider-neutral: model providers are registry entries the configuration names, never hard dependencies. Credentials stay in the local auth file of the operator machine and are read only to sign the requests the user starts.",
    ],
  },
  {
    id: "about.subapps",
    heading: "One system, many subapps",
    body: [
      "The browser surface mounts one subapp per area: console, gateway, providers, projects, routes, usage, apps, docs, explore, history and settings. Each subapp reads the same data layer over HTTPS; when the paired database is offline, reviewed seeds answer the static build so no page renders empty.",
      "The theme layer ships the surfaces beside the data layer. A page never hardcodes its content: structured rows live in the catalog and reach the interface the same way this page receives its text.",
    ],
  },
];

export const seedPrinciples: Principle[] = [
  {
    id: "principle.self-hosted",
    name: "Self-hosted",
    detail:
      "The platform runs on machines the operator controls. The gateway binds to the loopback, the database mirrors the repository content and no third party sits between the operator and the data.",
  },
  {
    id: "principle.provider-neutral",
    name: "Provider-neutral",
    detail:
      "Providers are registry entries, not dependencies. The request router reads the configured catalog and every credential stays in the local auth file the user supplies explicitly.",
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
    caption: "The family subdomains sharing the engines behind one gateway.",
  },
  {
    id: "media.studio.surface",
    label: "native studios",
    ratio: "16 / 9",
    caption: "The video and music studios riding the shared engine layer.",
  },
];

export const seedTermsSections: LegalSection[] = [
  {
    id: "terms.scope",
    title: "Scope of use",
    paragraphs: [
      "The platform serves the operator and the visitors the operator invites. Every surface of this site — the pages, the subapps and the gateway — is provided for development, documentation and studio work.",
      "Access to a surface does not transfer ownership of it. The operator keeps the right to change, restrict or close any surface at any time.",
    ],
  },
  {
    id: "terms.acceptable",
    title: "Acceptable use",
    paragraphs: [
      "Use the platform for work you are allowed to do. Automated traffic must identify itself and respect the rate limits the gateway enforces.",
      "Do not attempt to bypass authentication, extract credentials, overload the gateway or interfere with another visitor session.",
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
      "The gateway records the technical logs the operator configures: request path, status and timestamp. The logs stay on the machine the operator controls.",
    ],
  },
  {
    id: "policy.local",
    title: "Local storage of work",
    paragraphs: [
      "Sessions, workspaces and memory records are stored in the local database of the operator machine. The browser routes read those records through the paired gateway and never mirror them to a remote service.",
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
    file: "icon-192.png",
    format: "png",
    sizes: "192x192",
    purpose: "any",
    origin: "rasterized from favicon.svg",
  },
  {
    id: "platform.icons.install.512",
    file: "icon-512.png",
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
