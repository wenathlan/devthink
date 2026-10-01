/** The reviewed seed rows of the interface catalog: the only place platform data is written before the DB serves it.
 * The native app, runner binary and studio rows below are the offline answer of the static build; the paired
 * database overrides them per kind once it answers over HTTPS. The catalog types are imported as types only,
 * so the module direction stays one way at runtime (catalog.ts imports these values, never the reverse). */
import type { CoreModule, FamilySite, NativeApp, Recipe, Rung, RunnerBinary, StudioAsset, StudioTrack } from "./catalog";

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
