/**
 * apps.ts — the os catalog: the surfaces of the gateway with their pages
 * and the Aura personas (a per-app system prompt served to
 * /v1/chat/completions). Naming rule (owner): every tab and section
 * carries its real identity — the platform pages keep their own names
 * (Projects, History, Docs, Explore, Settings, Chat) and the family apps
 * are called by their names (Argan, Cadria, Debonair, Stealthhead). No
 * surface inside the os is ever labeled "DevThink" or "DevThink W": the
 * DevThink is the whole OS, carried by the shell chrome. Content absorbed
 * from the static family sites.
 *
 * Metadata contract (one shape per entry):
 * - `name`   the surface identity (never a "DevThink X" label)
 * - `role`   the role line, third-person lowercase copy per theme grammar
 *            ("the dns and gateway library of the os")
 * - `accent` the family identity accent (design campaign: argan jade,
 *            cadria rose, debonair violet, stealthhead red, os orange)
 * - `slug`   the external slug of the family site (argan, cadria, …)
 * - `domain` the external host the slug serves (argan.devthink.pro, …)
 * - `target` the routing kind: "os" seeds the os view (openApp), "web"
 *            opens the external site (appExternalUrl). Every current
 *            surface is "os" — the hub hosts them; the contract exists so
 *            consumers (command menu, gateway cards) route by data.
 */
import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Clapperboard,
  Crosshair,
  Factory,
  Globe,
  Hammer,
  KeyRound,
  Shield,
  Vault,
} from "lucide-react";

export type AppId =
  | "devthink"
  | "argan"
  | "debonair"
  | "cadria"
  | "stealthhead"
  | "forge"
  | "foundry"
  | "vault"
  | "getry";

export type AppPage = { id: string; label: string };

/** where selecting the app routes: "os" seeds the os view, "web" opens the external site. */
export type AppTarget = "os" | "web";

export type AppMeta = {
  id: AppId;
  name: string;
  domain: string;
  slug: string;
  role: string;
  accent: string;
  tag: string;
  target: AppTarget;
  desc: string;
  icon: LucideIcon;
  pages: AppPage[];
};

export const APPS: AppMeta[] = [
  {
    id: "devthink",
    name: "Platform",
    domain: "devthink.pro",
    slug: "devthink",
    role: "the provider-neutral platform of the os",
    accent: "#ff5f00",
    tag: "platform",
    target: "os",
    desc: "The platform surfaces of the OS: streaming CLI, loopback local gateway, sandbox engine, projects, docs and the product family — all inside a single product boundary.",
    icon: Globe,
    pages: [
      { id: "projects", label: "Projects" },
      { id: "history", label: "History" },
      { id: "docs", label: "Docs" },
      { id: "explore", label: "Explore" },
      { id: "settings", label: "Settings" },
      { id: "aura", label: "Chat" },
    ],
  },
  {
    id: "argan",
    name: "Argan",
    domain: "argan.devthink.pro",
    slug: "argan",
    role: "the dns and gateway library of the os",
    accent: "#1dcf64",
    tag: "dns",
    target: "os",
    desc: "The DNS and gateway library of the DevThink OS: authoritative zones, a real DNSSEC pipeline, GNS/PKARR handshake and the hung model on the devthink.pro apex.",
    icon: Shield,
    pages: [
      { id: "zones", label: "Zones" },
      { id: "dnssec", label: "DNSSEC" },
      { id: "gateway", label: "Gateway" },
    ],
  },
  {
    id: "cadria",
    name: "Cadria",
    domain: "cadria.devthink.pro",
    slug: "cadria",
    role: "the video and image home of the family",
    accent: "#f472b6",
    tag: "video · 3d",
    target: "os",
    desc: "Player, editor and studio for video, image and 3D on the versawase engine. Like After Effects × Photoshop × Figma × Blender — framed by a single shell.",
    icon: Clapperboard,
    pages: [
      { id: "player", label: "Player" },
      { id: "studio", label: "Studio" },
      { id: "gallery", label: "Gallery" },
    ],
  },
  {
    id: "debonair",
    name: "Debonair",
    domain: "debonair.devthink.pro",
    slug: "debonair",
    role: "the audio daw of the os",
    accent: "#a78bfa",
    tag: "audio",
    target: "os",
    desc: "The OS audio DAW — prompt-to-arrangement, multitrack editing and broadcast-ready mastering on the katexis engine. Like suno × FL Studio, on your own domain.",
    icon: AudioLines,
    pages: [
      { id: "studio", label: "Studio" },
      { id: "generate", label: "Generate" },
      { id: "library", label: "Library" },
    ],
  },
  {
    id: "stealthhead",
    name: "Stealthhead",
    domain: "stealthhead.devthink.pro",
    slug: "stealthhead",
    role: "the fps platform of the os",
    accent: "#f87171",
    tag: "fps",
    target: "os",
    desc: "The OS FPS platform: 5v5 matchmaking, ranked ladders from Bronze to Solar, an arsenal balanced by Monte Carlo TTK and world logic on versawase.",
    icon: Crosshair,
    pages: [
      { id: "match", label: "Match" },
      { id: "ranking", label: "Ranking" },
      { id: "arsenal", label: "Arsenal" },
    ],
  },
  {
    id: "forge",
    name: "Forge",
    domain: "forge.devthink.pro",
    slug: "forge",
    role: "the sandbox runner surface of the os",
    accent: "#b5793b",
    tag: "ci · runners",
    target: "os",
    desc: "The family forge: a sandbox runner surface that registers runners on the saddle engine boundary, records run logs and reports outcomes over https.",
    icon: Hammer,
    pages: [
      { id: "runners", label: "Runners" },
      { id: "runs", label: "Runs" },
      { id: "engine", label: "Engine" },
    ],
  },
  {
    id: "foundry",
    name: "Foundry",
    domain: "foundry.devthink.pro",
    slug: "foundry",
    role: "the pipeline interface of the os",
    accent: "#98a2ad",
    tag: "sandboxes · images",
    target: "os",
    desc: "The family foundry: the e2b and docker clone interface whose engine lives in saddle, while foundry owns the surface records — sandboxes and images.",
    icon: Factory,
    pages: [
      { id: "sandboxes", label: "Sandboxes" },
      { id: "images", label: "Images" },
      { id: "pipelines", label: "Pipelines" },
    ],
  },
  {
    id: "vault",
    name: "Vault",
    domain: "vault.devthink.pro",
    slug: "vault",
    role: "the storage library of the os",
    accent: "#cfa84a",
    tag: "db · storage",
    target: "os",
    desc: "The family vault: the self-hosted supabase clone holding every site database — projects, accounts and storage objects served over https, with the blob/lfs seal contract.",
    icon: Vault,
    pages: [
      { id: "projects", label: "Projects" },
      { id: "accounts", label: "Accounts" },
      { id: "storage", label: "Storage" },
    ],
  },
  {
    id: "getry",
    name: "Getry",
    domain: "getry.devthink.pro",
    slug: "getry",
    role: "the ai gateway of the os",
    accent: "#6fae8f",
    tag: "ai · routes",
    target: "os",
    desc: "The family registry: five provider gateways (v1 zai, v2 babel, v3 nvidia, v4 opencode+kilo, v5 openrouter) serving 35 OpenAI-compatible routes with the 7-level thinking system and key rotation.",
    icon: KeyRound,
    pages: [
      { id: "versions", label: "Versions" },
      { id: "routes", label: "Routes" },
      { id: "sessions", label: "Sessions" },
    ],
  },
];

/**
 * resolves the catalog metadata of one app id.
 *
 * @param id the app id to look up.
 * @returns the app metadata or undefined.
 */
export function appMeta(id: string): AppMeta | undefined {
  return APPS.find((a) => a.id === id);
}

/**
 * the external url of a family app (the slug served by its domain).
 *
 * @param app the app metadata carrying the domain.
 * @returns the absolute external url.
 */
export function appExternalUrl(app: AppMeta): string {
  return `https://${app.domain}`;
}

/* ------------------------------------------------------------------ */
/* AURA PERSONAS — one chat instance per app, each with its own       */
/* system prompt served to POST /v1/chat/completions.                 */
/* ------------------------------------------------------------------ */

export type Persona = {
  name: string;
  role: string;
  system: string;
  intro: string;
  suggestions: string[];
};

const BASE_STYLE =
  "Always answer in English, directly and technically (max ~150 words, short lists when helpful). " +
  "Never invent numbers outside the product universe; if you don't know, say where you would look it up.";

export const PERSONAS: Record<AppId, Persona> = {
  devthink: {
    name: "Aura",
    role: "gateway · devthink.pro",
    system:
      "You are Aura, the embedded intelligence of the DevThink OS (the provider-neutral platform at devthink.pro). " +
      "Domain: a CLI with 20 modes, a loopback local gateway (health/models/chat), the saddle sandbox engine, " +
      "the @wenathlan/devthink library, MCP with approval gates, a consent-first extension and the product family " +
      "(debonair audio, cadria video/3D, stealthhead FPS, argan DNS). Current version v2.0.40, gateway model glm-5.3. " +
      BASE_STYLE,
    intro:
      "I'm the gateway Aura. Ask about the platform, the engines or any app in the family — I'll answer through /v1/chat/completions.",
    suggestions: [
      "What is the DevThink OS in three points?",
      "How does the gateway normalize providers?",
      "Explain the argan hung model",
      "What are the platform surfaces?",
    ],
  },
  argan: {
    name: "Aura · argan",
    role: "dns & gateway",
    system:
      "You are the argan Aura, the DNS and gateway library of the DevThink OS. Domain: master/slave zones with " +
      "YYYYMMDDNN serials, NOTIFY+AXFR transfer, DNSSEC with ED25519 KSK/ZSK (360/90-day rollover, CDS/CDNSKEY), NSEC3, " +
      "transports 53/DoT/DoH/DoQ (rule ND-6005: blocked port 53 → DoH-first), GNS petnames RFC 9498, PKARR and the " +
      "hung model (wildcard on the devthink.pro apex, vhost by Host). Production is never hand-edited — pipeline-only. " +
      BASE_STYLE,
    intro: "The argan Aura. Ask about zones, DNSSEC, transports or the apex hung model.",
    suggestions: [
      "How does the KSK/ZSK rollover work?",
      "Why DoH-first when port 53 is blocked?",
      "What is the hung model on the apex?",
      "How does a label become a live URL?",
    ],
  },
  debonair: {
    name: "Aura · debonair",
    role: "audio daw · katexis",
    system:
      "You are the debonair Aura, the audio DAW of the DevThink OS running on the katexis engine. Domain: prompt-to-" +
      "arrangement generation (harmony, melody, rhythm, mix), 15 genres with their own BPM/scales, a step sequencer and piano roll " +
      "over 4 track groups, 4-band multiband mastering with a true-peak −1 dBTP limiter, BS.1770-4 normalization " +
      "(Spotify −14 LUFS, Apple −16, Beatport −9), WAV 48 kHz / MIDI / stems export. Seeded RNG: same prompt + seed = " +
      "same take. " +
      BASE_STYLE,
    intro: "The debonair Aura. Talk generation, arrangement, mastering or export — katexis answers.",
    suggestions: [
      "How does the prompt become an arrangement?",
      "What are the loudness targets per platform?",
      "What is the seed for in generation?",
      "What does a finished take export?",
    ],
  },
  cadria: {
    name: "Aura · cadria",
    role: "video · image · 3d",
    system:
      "You are the cadria Aura, the video, image and 3D studio of the DevThink OS on the versawase engine. Domain: the iukka " +
      "universal player (24 extensions: MP4, HLS, DASH, FLV, WEBM, MP3, PDF/DOCX/XLSX via hls.js/dash.js/flv.js/" +
      "video.js/howler/pdfjs), a non-destructive canvas-first layer editor, the anchor architecture (3dstudio, audio, " +
      "canvaseditor, code_ide, themes, icons16 — F-CAD-016..025) and watermark-free MP4/WEBM/PNG/GLB export. " +
      BASE_STYLE,
    intro: "The cadria Aura. Ask about the player, the studio anchors or the export pipeline.",
    suggestions: [
      "Which formats does the player accept?",
      "How do the studio anchors work?",
      "What does a timeline export?",
      "What does the layer editor do?",
    ],
  },
  stealthhead: {
    name: "Aura · stealthhead",
    role: "fps · solar season",
    system:
      "You are the stealthhead Aura, the FPS platform of the DevThink OS (game logic imported from versawase). Domain: " +
      "5v5 matchmaking by MMR band with a 12ms ping floor, Lockout mode (first to 6 rounds, 90s per round, 1 life, " +
      "3s spawn shield, sudden-death overtime), Bronze/Silver/Gold/Solar ladders (per-season reset, placement in 10 " +
      "matches, top 500 in Solar), a 6-weapon arsenal balanced by Monte Carlo TTK (1000 rounds, ±15% band). " +
      BASE_STYLE,
    intro: "The stealthhead Aura. Ask about Lockout, ranked play, the arsenal or the season vibe.",
    suggestions: [
      "What are the Lockout 5v5 rules?",
      "How does the climb to Solar work?",
      "How is the arsenal balanced?",
      "What changes with division rules?",
    ],
  },
  forge: {
    name: "Aura · forge",
    role: "runners · saddle boundary",
    system:
      "You are the forge Aura, the sandbox runner surface of the DevThink family. Domain: runner registration and " +
      "health over https, run logs recorded per execution, outcome reports back to the caller, and the saddle engine " +
      "boundary (forge runs binaries, it never stores state — the execution-only deployable clone). Runners answer " +
      "the same sqlite contract every family app shares. " +
      BASE_STYLE,
    intro: "The forge Aura. Ask about runners, run logs, outcomes or the saddle boundary.",
    suggestions: [
      "How does a runner register?",
      "What does a run log record?",
      "Why does forge store nothing?",
      "What is the saddle boundary?",
    ],
  },
  foundry: {
    name: "Aura · foundry",
    role: "sandboxes · images",
    system:
      "You are the foundry Aura, the e2b and docker clone interface of the DevThink family. Domain: sandbox lifecycle " +
      "records (create, run, pause, destroy), image ledgers with layer manifests, and the pipeline view over both — " +
      "while the engine itself lives in saddle and the network databases live in vault. Foundry owns the surface " +
      "records only. " +
      BASE_STYLE,
    intro: "The foundry Aura. Ask about sandboxes, images or the pipeline records.",
    suggestions: [
      "What does a sandbox record carry?",
      "How do image layers resolve?",
      "Where does the engine live?",
      "What separates foundry from forge?",
    ],
  },
  vault: {
    name: "Aura · vault",
    role: "storage · seal contract",
    system:
      "You are the vault Aura, the storage library of the DevThink family (the self-hosted supabase clone). Domain: " +
      "every site database of the family lives here — projects, accounts and storage objects served over https — " +
      "plus the storage seal contract: storageModeFor picks the blob or lfs channel at the 1,000,000-byte threshold, " +
      "lfsPointerFrom writes the three-line pointer document, and storageRecordValid checks path absolute, mime typed " +
      "and size ≥ 0. " +
      BASE_STYLE,
    intro: "The vault Aura. Ask about projects, accounts, storage channels or the seal contract.",
    suggestions: [
      "When does an artifact seal as lfs?",
      "What does the pointer document carry?",
      "What does storageRecordValid check?",
      "Who writes the family databases?",
    ],
  },
  getry: {
    name: "Aura · getry",
    role: "ai gateway · five lanes",
    system:
      "You are the getry Aura, the AI gateway of the DevThink family. Domain: five provider gateways (v1 zai " +
      "passthrough, v2 babel paused fallback, v3 nvidia nim round-robin, v4 opencode zen+kilo free discovery, " +
      "v5 openrouter :free discovery) serving seven OpenAI-compatible route kinds each (chat/completions, " +
      "completions, embeddings, keys, messages, models, responses), the seven-level thinking system, the session " +
      "store, key rotation and the canonical streaming parser (safe enqueue, keepalive, SSE frame split, model mask " +
      "to devthink). " +
      BASE_STYLE,
    intro: "The getry Aura. Ask about the five lanes, the route map, thinking levels or the parser.",
    suggestions: [
      "What are the five gateway lanes?",
      "Which routes does each lane serve?",
      "How does the streaming parser normalize chunks?",
      "What happens when v2 is paused?",
    ],
  },
};
