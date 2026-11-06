/**
 * os — consolidated os logics of the devthink family
 * @module os
 * @family wave/logicfold3
 * One keyed file per family: the former variant arms (osevents, osgateway, oslabels, osreveal, ostypes)
 * retired into this seat with every export preserved under the same name.
 */

import { useEffect, useState } from "react";
import { parseRetryAfterMs, RetryableError, retryWithBackoff } from "./queue.ts";
import type { ThinkingLevelName } from "@wenathlan/getry/thinking";
import type { CalculatorKeyAction } from "./calculator.ts";
/* (the osreveal arm once carried this react import — the osevents block
 * above already binds useEffect and useState from the same module; the dedup
 * kept one react statement) */

/* ===== block: osapps ===== */
/**
 * osapps.ts — the os catalog: the surfaces of the gateway with their pages
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
 * - `accent` the family identity accent (design-spec section 12, single
 *            source mirrored in familyidentity.tsx: devthink Sol-amber,
 *            argan jade, cadria pink, debonair brass, stealthhead ember,
 *            forge ember-lime, foundry temper, vault ice, getry violet)
 * - `slug`   the external slug of the family site (argan, cadria, …)
 * - `domain` the external host the slug serves (argan.devthink.pro, …)
 * - `target` the routing kind: "os" seeds the os view (openApp), "web"
 *            opens the external site (appExternalUrl). Every current
 *            surface is "os" — the hub hosts them; the contract exists so
 *            consumers (command menu, gateway cards) route by data.
 */
import type { FluentIcon as LucideIcon } from "@fluentui/react-icons";
import { MusicNote2Regular as AudioLines, VideoClipRegular as Clapperboard, TargetRegular as Crosshair, BuildingFactoryRegular as Factory, GlobeRegular as Globe, ToolboxRegular as Hammer, KeyRegular as KeyRound, ShieldRegular as Shield, VaultRegular as Vault } from "@fluentui/react-icons";

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
    accent: "#F59E0B",
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
    accent: "#34d8a8",
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
    tag: "video, 3d",
    target: "os",
    desc: "Player, editor and studio for video, image and 3D in one window. Like After Effects × Photoshop × Figma × Blender — framed by a single shell.",
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
    accent: "#d9962e",
    tag: "audio",
    target: "os",
    desc: "The OS audio DAW — prompt-to-arrangement, multitrack editing and broadcast-ready mastering in the studio. Like suno × FL Studio, on your own domain.",
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
    accent: "#e8563f",
    tag: "fps",
    target: "os",
    desc: "The OS FPS platform: 5v5 matchmaking, ranked ladders from Bronze to Solar, an arsenal balanced by Monte Carlo TTK and world logic from the family 3D studio.",
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
    accent: "#a2cb3a",
    tag: "ci, runners",
    target: "os",
    desc: "The family forge: a sandbox runner surface that registers runners on the sandbox boundary, records run logs and reports outcomes.",
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
    accent: "#2fb8b5",
    tag: "sandboxes, images",
    target: "os",
    desc: "The family foundry: the e2b and docker clone interface whose engine lives in the family sandbox, while foundry owns the surface records — sandboxes and images.",
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
    accent: "#a3d7e6",
    tag: "db, storage",
    target: "os",
    desc: "The family vault: the self-hosted supabase clone holding every site database — projects, accounts and storage objects served securely, with the blob/lfs seal contract.",
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
    accent: "#8b5cf6",
    tag: "ai, routes",
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
    role: "gateway — devthink.pro",
    system:
      "You are Aura, the embedded intelligence of the DevThink OS (the provider-neutral platform at devthink.pro). " +
      "Domain: a CLI with 20 modes, a loopback local gateway (health/models/chat), the saddle sandbox engine, " +
      "the @wenathlan/devthink library, MCP with approval gates, a consent-first extension and the product family " +
      "(debonair audio, cadria video/3D, stealthhead FPS, argan DNS). Current version v2.0.40, gateway model glm-5.3. " +
      BASE_STYLE,
    intro:
      "I'm the Aura of the platform. Ask about the platform, the studios or any app in the family — I'll answer right here.",
    suggestions: [
      "What is the DevThink OS in three points?",
      "How does the gateway normalize providers?",
      "Explain the argan hung model",
      "What are the platform surfaces?",
    ],
  },
  argan: {
    name: "Aura — argan",
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
    name: "Aura — debonair",
    role: "audio daw — studio",
    system:
      "You are the debonair Aura, the audio DAW of the DevThink OS running on the katexis engine. Domain: prompt-to-" +
      "arrangement generation (harmony, melody, rhythm, mix), 15 genres with their own BPM/scales, a step sequencer and piano roll " +
      "over 4 track groups, 4-band multiband mastering with a true-peak −1 dBTP limiter, BS.1770-4 normalization " +
      "(Spotify −14 LUFS, Apple −16, Beatport −9), WAV 48 kHz / MIDI / stems export. Seeded RNG: same prompt + seed = " +
      "same take. " +
      BASE_STYLE,
    intro: "The debonair Aura. Talk generation, arrangement, mastering or export — the studio answers.",
    suggestions: [
      "How does the prompt become an arrangement?",
      "What are the loudness targets per platform?",
      "What is the seed for in generation?",
      "What does a finished take export?",
    ],
  },
  cadria: {
    name: "Aura — cadria",
    role: "video, image, 3d",
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
    name: "Aura — stealthhead",
    role: "fps, solar season",
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
    name: "Aura — forge",
    role: "runners, saddle boundary",
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
    name: "Aura — foundry",
    role: "sandboxes, images",
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
    name: "Aura — vault",
    role: "storage, seal contract",
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
    name: "Aura — getry",
    role: "ai gateway, five lanes",
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

/* ===== block: osevents ===== */
/**
 * osevents.ts — the event feed of the os (the History page of the
 * devthink view). Actions of the sub-views (queued render, created
 * project, chat) are pushed here via localStorage + CustomEvent; the
 * timeline listens and updates live.
 */


export type OSEvent = {
  id: string;
  title: string;
  note: string;
  kind: "release" | "action" | "chat";
  at: number;
};

const KEY = "dt-os-events-v1";
export const OS_EVENT_CHANGE = "dt-os-events-change";
const CAP = 30;

/**
 * checks that an unknown value is a well formed os event.
 *
 * @param v the value to check.
 * @returns true when the value is an OSEvent.
 */
export function isOSEvent(v: unknown): v is OSEvent {
  if (typeof v !== "object" || v === null) return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.title === "string" &&
    typeof e.note === "string" &&
    (e.kind === "release" || e.kind === "action" || e.kind === "chat") &&
    typeof e.at === "number"
  );
}

/**
 * reads the persisted event feed (empty outside the browser or when the
 * stored list is malformed).
 *
 * @returns the stored events, newest first.
 */
export function readOSEvents(): OSEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isOSEvent);
  } catch {
    return [];
  }
}

/**
 * pushes one event onto the feed (capped) and notifies the listeners.
 *
 * @param evt the event to push (timestamp defaults to now).
 */
export function pushOSEvent(evt: Pick<OSEvent, "title" | "note" | "kind"> & { at?: number }): void {
  if (typeof window === "undefined") return;
  const next: OSEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: evt.title,
    note: evt.note,
    kind: evt.kind,
    at: evt.at ?? Date.now(),
  };
  try {
    const list = [next, ...readOSEvents()].slice(0, CAP);
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage is optional */
  }
  window.dispatchEvent(new CustomEvent(OS_EVENT_CHANGE));
}

/** clears the persisted feed and notifies the listeners. */
export function clearOSEvents(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* storage is optional */
  }
  window.dispatchEvent(new CustomEvent(OS_EVENT_CHANGE));
}

/**
 * reactive reader hook of the feed (re-reads on OS_EVENT_CHANGE and on
 * cross-tab storage events).
 *
 * @returns the current events.
 */
export function useOSEvents(): OSEvent[] {
  const [events, setEvents] = useState<OSEvent[]>([]);
  useEffect(() => {
    setEvents(readOSEvents());
    const onChange = () => setEvents(readOSEvents());
    window.addEventListener(OS_EVENT_CHANGE, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(OS_EVENT_CHANGE, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return events;
}

/* ===== block: osgateway ===== */
/**
 * osgateway.ts — client of the working AI gateway: POST
 * /v1/chat/completions · body { model: "devthink", messages } · standard
 * OpenAI answer (choices[0].message.content + reasoning_content). Named
 * osgateway to avoid clashing with the Sol workbench gateway.ts. Zero
 * network outside this module — everything is client-first.
 *
 * Retry wiring: the fetch round runs through queue.ts (the queue family's
 * retry section) — failures
 * classified as transient (network, 408/425/429, 5xx) retry with exponential
 * backoff + jitter, and the server's Retry-After hint wins over the curve.
 * Default `retries` is 0, which preserves the historical one-shot contract;
 * opt in per call with `retries`.
 */


/**
 * ChatStoppedError — the honest stop marker of the chat contract: the
 * caller's own abort signal fired (the Stop pill), which is not a failure.
 * The chat body catches it to keep the partial answer on the floor; a
 * timeout keeps the plain timeout error below.
 */
export class ChatStoppedError extends Error {
  constructor() {
    super("generation stopped by the visitor");
    this.name = "ChatStoppedError";
  }
}

/** isChatStop — true when the error is the visitor's own stop. */
export function isChatStop(err: unknown): err is ChatStoppedError {
  return err instanceof ChatStoppedError;
}

export type GatewayRole = "system" | "user" | "assistant";
export type GatewayMessage = { role: GatewayRole; content: string };

export type GatewayReply = {
  content: string;
  reasoning?: string;
  model?: string;
};

type ApiResponse = {
  choices?: Array<{
    message?: { role?: string; content?: string | null; reasoning_content?: string | null };
  }>;
  error?: { message?: string };
};

/** one row of the gateway's model catalog (the context window when the
 * gateway declares it — the picker shows it honestly, never invented). */
export type GatewayModel = {
  id: string;
  context?: number | undefined;
};

/**
 * gatewayModels — the model catalog of a gateway: GET /v1/models, the ids
 * and the declared context windows. A gateway without the route, an outage
 * or a malformed body answers an empty list (never a throw) — the picker
 * falls back to the meta-model and nothing pretends otherwise.
 */
export async function gatewayModels(base: string, timeoutMs = 6000): Promise<GatewayModel[]> {
  let clean = base.trim();
  // js/polynomial-redos (code-scanning): the trailing-slash trim runs as a
  // linear loop — the anchored /\/+$/ replace can backtrack quadratically
  // over a long run of '/'.
  while (clean.endsWith("/")) clean = clean.slice(0, -1);
  if (!clean) return [];
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(`${clean}/v1/models`, { signal: ctrl.signal });
      if (!res.ok) return [];
      const json = (await res.json()) as {
        data?: Array<{ id?: unknown; context_length?: unknown }>;
      };
      const rows = Array.isArray(json.data) ? json.data : [];
      const models: GatewayModel[] = [];
      for (const row of rows) {
        if (typeof row?.id !== "string" || !row.id) continue;
        models.push({
          id: row.id,
          context: typeof row.context_length === "number" ? row.context_length : undefined,
        });
      }
      return models;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return [];
  }
}

/**
 * gatewayChat — one chat round on the local gateway. Default timeout of
 * 60s via AbortController; errors propagate to the chat (toast + retry)
 * — nothing fails silently.
 *
 * @param messages the conversation messages.
 * @param opts the optional gateway base, model, timeout and abort signal —
 *   an empty base talks to the same origin (the local gateway); a configured
 *   base points the client at a deployed gateway of the family. `retries`
 *   (default 0) adds queue retry rounds for transient failures, honoring
 *   Retry-After.
 * @returns the gateway reply.
 */
export async function gatewayChat(
  messages: GatewayMessage[],
  opts?: { base?: string; model?: string; timeoutMs?: number; signal?: AbortSignal; retries?: number },
): Promise<GatewayReply> {
  const timeoutMs = opts?.timeoutMs ?? 60_000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  // when the caller passed a signal, chain the external abort
  const onExternalAbort = () => ctrl.abort();
  opts?.signal?.addEventListener("abort", onExternalAbort);

  /* the endpoint rides the configured base when the caller set one (the
   * deployed gateway of the family) and stays same-origin otherwise. */
  let base = (opts?.base ?? "").trim();
  // js/polynomial-redos (code-scanning): trailing slashes leave through a
  // linear loop instead of the /\/+$/ replace that can backtrack
  // quadratically on a long run of '/'.
  while (base.endsWith("/")) base = base.slice(0, -1);
  const endpoint = `${base}/v1/chat/completions`;
  const body = JSON.stringify({ model: opts?.model ?? "devthink", messages });

  try {
    return await retryWithBackoff(
      async () => {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          signal: ctrl.signal,
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          throw new RetryableError(
            `gateway ${res.status}${detail ? ` — ${detail.slice(0, 140)}` : ""}`,
            res.status,
            parseRetryAfterMs(res.headers.get("retry-after")),
          );
        }

        const json = (await res.json()) as ApiResponse;
        if (json.error?.message) throw new Error(json.error.message);
        const msg = json.choices?.[0]?.message;
        const content = msg?.content ?? "";
        if (!content.trim()) throw new Error("the gateway answered with an empty body");
        return {
          content,
          reasoning: msg?.reasoning_content ?? undefined,
          model: typeof (json as { model?: string }).model === "string" ? (json as { model: string }).model : undefined,
        };
      },
      { config: { maxRetries: Math.max(0, opts?.retries ?? 0) }, signal: ctrl.signal },
    );
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      if (opts?.signal?.aborted) throw new ChatStoppedError();
      throw new Error("the gateway timed out before answering (60s)");
    }
    throw err instanceof Error ? err : new Error(String(err));
  } finally {
    clearTimeout(timer);
    opts?.signal?.removeEventListener("abort", onExternalAbort);
  }
}

/* ---------------------------------------------------------------------- */
/* streaming — the SSE reader of the gateway contract                      */
/* ---------------------------------------------------------------------- */

/**
 * The thinking level header of the gateway — the pill maps here, the budget
 * rides server-side. The union is consumed from the getry engine (pr16): the
 * 7-level reasoning ladder has one owner and this client speaks the owner's
 * ThinkingLevelName, never a second declaration of the rungs.
 */
export type ThinkingLevel = ThinkingLevelName;

/** Progressive deltas of a streaming round — reasoning arrives first. */
export type StreamHandlers = {
  onReasoning?: (delta: string) => void;
  onContent?: (delta: string) => void;
};

/**
 * gatewayChatStream — one chat round over the SSE contract. The gateway
 * re-emits reasoning deltas before content and closes with one [DONE]; this
 * reader parses frames on the double-newline boundary (never a partial
 * frame), discards heartbeat lines starting with `:`, and folds every delta
 * into the handlers as it lands. Falls back to the JSON round when the
 * response is not an event stream (the honest degradation: same contract,
 * one code path on the caller).
 *
 * @param messages the conversation messages.
 * @param opts base/model/timeout/abort plus sessionId (x-session-id header,
 *   the rotation context lives on it) and thinkingLevel (x-thinking-level).
 * @returns the final reply with the folded content and reasoning.
 */
export async function gatewayChatStream(
  messages: GatewayMessage[],
  opts?: {
    base?: string;
    model?: string;
    sessionId?: string;
    thinkingLevel?: ThinkingLevel;
    timeoutMs?: number;
    signal?: AbortSignal;
    handlers?: StreamHandlers;
  },
): Promise<GatewayReply> {
  const timeoutMs = opts?.timeoutMs ?? 120_000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const onExternalAbort = () => ctrl.abort();
  opts?.signal?.addEventListener("abort", onExternalAbort);

  let base = (opts?.base ?? "").trim();
  // js/polynomial-redos (code-scanning): trailing slashes leave through a
  // linear loop instead of the /\/+$/ replace that can backtrack
  // quadratically on a long run of '/'.
  while (base.endsWith("/")) base = base.slice(0, -1);
  const endpoint = `${base}/v1/chat/completions`;
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "text/event-stream" };
  if (opts?.sessionId) headers["x-session-id"] = opts.sessionId;
  if (opts?.thinkingLevel) headers["x-thinking-level"] = opts.thinkingLevel;
  const body = JSON.stringify({ model: opts?.model ?? "devthink", messages, stream: true });

  try {
    const res = await fetch(endpoint, { method: "POST", headers, body, signal: ctrl.signal });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`gateway ${res.status}${detail ? ` — ${detail.slice(0, 140)}` : ""}`);
    }
    const ctype = res.headers.get("content-type") ?? "";
    // not an event stream — degrade to the json contract
    if (!ctype.includes("text/event-stream") || !res.body) {
      const json = (await res.json()) as ApiResponse;
      const msg = json.choices?.[0]?.message;
      if (json.error?.message) throw new Error(json.error.message);
      return {
        content: msg?.content ?? "",
        reasoning: msg?.reasoning_content ?? undefined,
        model: typeof (json as { model?: string }).model === "string" ? (json as { model: string }).model : undefined,
      };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";
    let reasoning = "";
    let model: string | undefined;

    // one SSE frame at a time — the double-newline boundary, never partial
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf("\n\n");
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data:")) continue; // heartbeats and comments discarded
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const chunk = JSON.parse(payload) as {
              model?: string;
              choices?: Array<{ delta?: { content?: string | null; reasoning_content?: string | null } }>;
            };
            if (typeof chunk.model === "string") model = chunk.model;
            const delta = chunk.choices?.[0]?.delta;
            const r = delta?.reasoning_content;
            if (typeof r === "string" && r) {
              reasoning += r;
              opts?.handlers?.onReasoning?.(r);
            }
            const c = delta?.content;
            if (typeof c === "string" && c) {
              content += c;
              opts?.handlers?.onContent?.(c);
            }
          } catch {
            /* a malformed frame never breaks the round */
          }
        }
      }
    }
    if (!content.trim()) throw new Error("the gateway stream closed with an empty body");
    return { content, reasoning: reasoning || undefined, model };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      if (opts?.signal?.aborted) throw new ChatStoppedError();
      throw new Error("the gateway timed out before answering (120s)");
    }
    throw err instanceof Error ? err : new Error(String(err));
  } finally {
    clearTimeout(timer);
    opts?.signal?.removeEventListener("abort", onExternalAbort);
  }
}

/* ===== block: oslabels ===== */
/** Style: DevThink OS label table — the read-only data layer of the os
 * shell and the app surfaces (everything the chat label table and the copy
 * store do not already own: the chat rides chatlabels.ts, the settings and
 * auth surfaces ride copy.ts). The owner doctrine: the interface never
 * hardcodes information in components; every label, placeholder, aria word,
 * toast, empty-state line, tooltip and tuning row of the os surfaces lives
 * here as a typed seed row, the components read through the typed
 * accessors, and the same rows answer the paired database endpoint when it
 * comes online (the offline seeds are the static build's answer, the
 * chatlabels precedent). Nothing is written to the visitor device. */


/* -------------------------------- strings ------------------------------- */

/** one interface string row: the id is the dot address the components
 * quote, the text is the exact copy the surface renders ({token} slots are
 * filled by the caller with .replace, the chatlabels grammar). */
export type OsStringRow = { id: string; text: string };

const seedOsStrings: OsStringRow[] = [
  /* ------------------------------ shell chrome ---------------------------- */
  { id: "shell.start.aria", text: "DevThink start menu" },
  { id: "shell.pins.aria", text: "Pinned apps" },
  { id: "shell.tray.paired", text: "paired" },
  { id: "shell.tray.localOnly", text: "local only" },
  { id: "shell.tray.quick.aria", text: "Quick settings" },
  { id: "shell.tray.calendar.aria", text: "Calendar" },
  { id: "shell.start.close.aria", text: "Close the start menu" },
  { id: "shell.start.dialog.aria", text: "Start menu" },
  { id: "shell.start.search.placeholder", text: "Search apps" },
  { id: "shell.start.search.aria", text: "Search apps" },
  { id: "shell.start.clear.aria", text: "Clear the search" },
  { id: "shell.start.label.pinned", text: "pinned" },
  { id: "shell.start.label.results", text: "results" },
  { id: "shell.start.label.recommended", text: "recommended" },
  { id: "shell.start.empty", text: "No app matches “{query}”." },
  { id: "shell.start.wordmark", text: "devthink" },
  { id: "shell.start.footer", text: "local OS" },
  { id: "shell.control.footer", text: "" },

  /* -------------------------------- alt tab ------------------------------- */
  { id: "alttab.dialog.aria", text: "Task switcher" },
  { id: "alttab.list.aria", text: "Open windows" },
  { id: "alttab.state.minimized", text: "minimized" },
  { id: "alttab.state.open", text: "open" },

  /* ------------------------------- jump menu ------------------------------ */
  { id: "jump.open", text: "Open" },
  { id: "jump.openWindow", text: "Open window" },
  { id: "jump.openApp", text: "Open {app}" },
  { id: "jump.openAppSite", text: "Open {app} site" },
  { id: "jump.unpin", text: "Unpin from taskbar" },
  { id: "jump.pin", text: "Pin to taskbar" },
  { id: "jump.options.aria", text: "{app} options" },

  /* ------------------------------ tray flyouts ---------------------------- */
  { id: "tray.quick.heading", text: "quick settings" },
  { id: "tray.tile.wifi", text: "wifi" },
  { id: "tray.tile.bluetooth", text: "bluetooth" },
  { id: "tray.tile.data", text: "cellular data" },
  { id: "tray.tile.night", text: "night light" },
  { id: "tray.tile.theme", text: "theme" },
  { id: "tray.tile.docked", text: "docked bar" },
  { id: "tray.volume.aria", text: "Volume" },
  { id: "tray.brightness.aria", text: "Brightness" },
  { id: "tray.calendar.prev", text: "Previous month" },
  { id: "tray.calendar.next", text: "Next month" },

  /* ----------------------------- window chrome ---------------------------- */
  { id: "win.lockup", text: "DevThink" },
  { id: "win.caption.minimize", text: "Minimize" },
  { id: "win.caption.maximize", text: "Maximize" },
  { id: "win.caption.restore", text: "Restore" },
  { id: "win.caption.close", text: "Close window" },
  { id: "win.snap.left.aria", text: "Snap left" },
  { id: "win.snap.right.aria", text: "Snap right" },
  { id: "win.snap.layouts.aria", text: "Snap layouts" },
  { id: "win.zone.left", text: "snap left half" },
  { id: "win.zone.right", text: "snap right half" },
  { id: "win.zone.tl", text: "snap top left quarter" },
  { id: "win.zone.tr", text: "snap top right quarter" },
  { id: "win.zone.bl", text: "snap bottom left quarter" },
  { id: "win.zone.br", text: "snap bottom right quarter" },
  { id: "win.zone.free", text: "snap column zone" },
  { id: "win.layout.halves", text: "side by side" },
  { id: "win.layout.thirdsLeft", text: "three zones left, full right" },
  { id: "win.layout.thirdsRight", text: "full left, three zones right" },
  { id: "win.layout.quarters", text: "quarters" },
  { id: "win.layout.focusLeft", text: "two zones left, full right" },
  { id: "win.layout.focusRight", text: "full left, two zones right" },

  /* -------------------------------- desktop ------------------------------- */
  { id: "desktop.aria", text: "DevThink desktop" },
  { id: "desktop.logoTitle", text: "DevThink" },
  { id: "desktop.menu.label", text: "Desktop menu" },
  { id: "desktop.menu.view", text: "View" },
  { id: "desktop.menu.view.medium", text: "medium icons" },
  { id: "desktop.menu.view.large", text: "large icons" },
  { id: "desktop.menu.view.reset", text: "reset layout" },
  { id: "desktop.menu.sort", text: "Sort by" },
  { id: "desktop.menu.sort.name", text: "name" },
  { id: "desktop.menu.sort.kind", text: "kind" },
  { id: "desktop.menu.sort.original", text: "original spots" },
  { id: "desktop.menu.refresh", text: "Refresh" },
  { id: "desktop.menu.display", text: "Display settings" },
  { id: "desktop.menu.personalize", text: "Personalize" },
  { id: "desktop.menu.personalize.light", text: "light theme" },
  { id: "desktop.menu.personalize.dark", text: "dark theme" },
  { id: "desktop.menu.open", text: "Open" },
  { id: "desktop.menu.openWindow", text: "Open in new window" },
  { id: "desktop.lock.aria", text: "DevThink lock screen" },

  /* ---------------------------- command palette --------------------------- */
  { id: "palette.dialog.aria", text: "Command palette" },
  { id: "palette.search.placeholder", text: "Search DevThink commands" },
  { id: "palette.search.aria", text: "Search DevThink commands" },
  { id: "palette.close.aria", text: "Close the command palette" },
  { id: "palette.group", text: "workspace commands" },
  { id: "palette.empty", text: "no command matches that search" },

  /* ------------------------------- boot face ------------------------------ */
  { id: "boot.hello", text: "hello" },
  { id: "boot.hint", text: "Press any key" },
  { id: "boot.welcome", text: "Welcome" },
  { id: "boot.avatarFallback", text: "D" },
  { id: "boot.name.placeholder", text: "Display name" },
  { id: "boot.name.aria", text: "Display name" },
  { id: "boot.signin", text: "Sign in" },
  { id: "boot.localIdentity", text: "Local identity" },
  { id: "boot.aria", text: "DevThink is starting" },

  /* ---------------------------- workspace toasts --------------------------- */
  { id: "panel.toast.paired", text: "Local DevThink workspace paired." },
  {
    id: "panel.toast.pairingHint",
    text: "Open a CLI invitation link or use manual setup to provide the local connection details.",
  },
  {
    id: "panel.toast.pairingFailed",
    text: "The local pairing could not be completed. Confirm the CLI is running on your machine, the page is allowed, and the code has not expired.",
  },
  { id: "panel.toast.revoked", text: "Local browser pairing revoked." },
  { id: "panel.toast.pairFirstPrefs", text: "Pair the local CLI before saving shared workbench preferences." },
  { id: "panel.toast.prefRejected", text: "The local connection could not save that preference." },
  { id: "panel.toast.pairFirstId", text: "Pair the local CLI before changing the shared public ID." },
  { id: "panel.toast.publicIdUpdated", text: "Shared public ID updated in the local DevThink identity." },
  {
    id: "panel.toast.publicIdInvalid",
    text: "Use 10-15 lowercase letters or numbers, starting with a letter.",
  },
  {
    id: "panel.toast.routeOpened",
    text: "Local route opened. Add the CLI address to persist it through DevThink CLI.",
  },
  { id: "panel.toast.commandUnavailable", text: "Command is not available in this local workspace." },

  /* ----------------------------- file explorer ---------------------------- */
  { id: "explorer.tools.aria", text: "Explorer tools" },
  { id: "explorer.nav.back", text: "Back" },
  { id: "explorer.nav.forward", text: "Forward" },
  { id: "explorer.nav.up", text: "Up" },
  { id: "explorer.nav.refresh", text: "Refresh" },
  { id: "explorer.address.aria", text: "Address" },
  { id: "explorer.search.placeholder", text: "Search" },
  { id: "explorer.search.aria", text: "Search this folder" },
  { id: "explorer.commands.aria", text: "Explorer commands" },
  { id: "explorer.new", text: "New" },
  { id: "explorer.sort", text: "Sort" },
  { id: "explorer.sortBy", text: "Sort by {mode}" },
  { id: "explorer.view", text: "View" },
  { id: "explorer.viewAs", text: "View as {mode}" },
  { id: "explorer.disabled.clipboard", text: "The clipboard arrives with a future update" },
  { id: "explorer.disabled.share", text: "Sharing arrives with a future update" },
  { id: "explorer.disabled.recycle", text: "The recycle bin arrives with a future update" },
  { id: "explorer.disabled.more", text: "More arrives with a future update" },
  { id: "explorer.quickAccess", text: "Quick access" },
  { id: "explorer.thisPc", text: "This PC" },
  { id: "explorer.storagePlatforms", text: "Storage platforms" },
  { id: "explorer.platform.pair", text: "{name} — pair it in the settings drives panel" },
  { id: "explorer.folderView.aria", text: "Folder view" },
  { id: "explorer.foldersHeading", text: "Folders ({count})" },
  { id: "explorer.devicesHeading", text: "Devices and drives ({count})" },
  { id: "explorer.drive", text: "Drive" },
  { id: "explorer.localDisk", text: "Local disk" },
  { id: "explorer.localDiskMounted", text: "Local disk · mounted" },
  { id: "explorer.capacityAfterMount", text: "capacity answers after mount" },
  {
    id: "explorer.usage.aria",
    text: "Store usage — the one allocation every drive on this machine shares",
  },
  { id: "explorer.records.workspaces", text: "Workspaces" },
  { id: "explorer.records.workspaces.detail", text: "workspace records of this drive" },
  { id: "explorer.records.sessions", text: "Sessions" },
  { id: "explorer.records.sessions.detail", text: "session records of this drive" },
  { id: "explorer.records.messages", text: "Messages" },
  { id: "explorer.records.messages.detail", text: "message records of this drive" },
  { id: "explorer.records.preferences", text: "Preferences" },
  { id: "explorer.records.preferences.detail", text: "preference records of this drive" },
  { id: "explorer.records.mountHint", text: "mount the drive to read its records" },
  { id: "explorer.records.count", text: "{count} records" },
  { id: "explorer.items", text: "{count} items" },
  { id: "explorer.status.item", text: "item" },
  { id: "explorer.status.items", text: "items" },
  { id: "explorer.status.found", text: " found" },
  { id: "explorer.status.selected", text: " · 1 selected" },
  { id: "explorer.viewMode.aria", text: "View mode" },
  { id: "explorer.gridView.aria", text: "Grid view" },
  { id: "explorer.detailsView.aria", text: "Details view" },
  { id: "explorer.filtered", text: "· filtered" },
  /* the folder empty-state row (explorer.empty) moved to the ui store —
     the explorer rows of uistore.ts ride the db over /api/v1/ui/copy (the
     single-home law of the copy) */
  { id: "explorer.toast.mountFailed", text: "The drive could not be mounted." },
  { id: "explorer.toast.newDrive", text: "New drive mounted: {label}. It starts empty." },
  { id: "explorer.toast.newDriveFailed", text: "The new drive could not be created on this machine." },
  /* the capacity bar sources: the paired lane answers the real usage and
     the plan quota, the offline surface answers the browser estimate —
     every bar labels its own source honestly */
  { id: "explorer.storage.lane", text: "Cloud storage" },
  { id: "explorer.storage.lane.line", text: "{used} used of {quota} plan quota" },
  { id: "explorer.storage.lane.objects", text: "{count} objects on the plan" },
  {
    id: "explorer.storage.lane.aria",
    text: "Cloud storage — the usage the server reports against the plan quota",
  },
  { id: "explorer.storage.browser", text: "Browser storage" },
  { id: "explorer.storage.browser.line", text: "{line} — this device's honest estimate" },
  {
    id: "explorer.storage.browser.aria",
    text: "Browser storage — the space this browser sets aside for the app",
  },
  /* the plan folders lane: the folders this account creates on the
     infrastructure storage — every write rides the real storage lane and
     every state answers its own line (offline, refused, empty) */
  { id: "explorer.newFolder", text: "New folder" },
  { id: "explorer.planHeading", text: "Plan folders ({count})" },
  { id: "explorer.planHeadingPending", text: "Plan folders" },
  { id: "explorer.planFolder.detail", text: "folder kept on the plan" },
  { id: "explorer.planForm.aria", text: "New folder form" },
  { id: "explorer.planName", text: "Folder name" },
  { id: "explorer.planNameHint", text: "Letters, numbers and hyphens only" },
  { id: "explorer.planCreate", text: "Create folder" },
  { id: "explorer.planCreating", text: "Creating folder" },
  { id: "explorer.planCancel", text: "Cancel" },
  { id: "explorer.planOffline", text: "Cloud storage is offline" },
  /* the plan empty-state row (explorer.planEmpty) moved to the ui store
     together with explorer.empty (the single-home law of the copy) */
  { id: "explorer.planExists", text: "That folder name exists" },
  { id: "explorer.toast.folderCreated", text: "Folder created on the plan: {name}" },

  /* ------------------------------ gateway view ---------------------------- */
  { id: "gateway.eyebrow", text: "devthink gateway" },
  { id: "gateway.lede", text: "Every provider behind one local door" },
  { id: "gateway.footer", text: "Credentials stay with the CLI" },
  { id: "gateway.badge.paused", text: "paused" },
  { id: "gateway.badge.live", text: "live" },
  { id: "gateway.modelsLine", text: "{count} models · {meta} meta" },
  { id: "gateway.versionNotFound", text: "version not found" },
  {
    id: "gateway.versionNotFoundLede",
    text: "The requested version stays outside the shipped catalog; open the gateway overview for the configured versions.",
  },
  { id: "gateway.overview", text: "gateway overview" },
  { id: "gateway.modelsConfigured", text: "models {count} configured" },
  { id: "gateway.policyTitle", text: "policy auth, rotation and retry" },
  { id: "gateway.authLabel", text: "auth" },
  { id: "gateway.auth.required", text: " required" },
  { id: "gateway.auth.optional", text: " optional" },
  { id: "gateway.keyless", text: "keyless" },
  { id: "gateway.rotationLabel", text: "rotation" },
  { id: "gateway.fixed", text: "fixed" },
  { id: "gateway.rotationLine", text: "{models} models every {messages} message" },
  { id: "gateway.rotationLinePlural", text: "{models} models every {messages} messages" },
  { id: "gateway.defaultModel", text: "the default model answers every call" },
  { id: "gateway.retryLabel", text: "retry" },
  { id: "gateway.crossProvider", text: "cross-provider fallback" },
  { id: "gateway.maxRetries", text: "max {count}" },
  { id: "gateway.retryOn", text: "retry on {statuses}" },
  { id: "gateway.noStatusRetries", text: "no status retries" },
  { id: "gateway.metaLabel", text: "meta" },
  { id: "gateway.masked", text: "upstream models masked" },
  { id: "gateway.shown", text: "upstream models shown" },
  { id: "gateway.routesTitle", text: "routes 7 per version" },
  { id: "gateway.routePost", text: "post /api/{version}" },
  { id: "gateway.routeInfo", text: "get /api/{version}/{route} returns the version info descriptor." },
  { id: "gateway.versionMissing", text: "version {id} not found" },
  {
    id: "gateway.shippedCount",
    text: "The shipped catalog carries {count} versions; the requested id stays outside it.",
  },
  { id: "gateway.versionsTitle", text: "versions {count} configured" },
  { id: "gateway.thinkingTitle", text: "thinking levels the 2-calls pattern" },
  { id: "gateway.authTitle", text: "auth methods 12 supported" },
  { id: "gateway.usageTitle", text: "library usage" },
  { id: "gateway.structureTitle", text: "structure the library at root, the design in web" },
  {
    id: "gateway.explorerSummary",
    text: "the loaded definition — the compact summary of the shipped catalog",
  },
  { id: "gateway.openDetail", text: "open the {id} detail" },
  { id: "gateway.thinking.none", text: "no thinking" },
  { id: "gateway.thinking.minimal", text: "quick reasoning" },
  { id: "gateway.thinking.low", text: "light reasoning" },
  { id: "gateway.thinking.medium", text: "balanced" },
  { id: "gateway.thinking.high", text: "deep reasoning default" },
  { id: "gateway.thinking.xhigh", text: "extra deep" },
  { id: "gateway.thinking.max", text: "maximum" },

  /* -------------------------------- console ------------------------------- */
  { id: "console.nav.aria", text: "Console sections" },
  { id: "console.section.terminal", text: "Terminal" },
  { id: "console.section.boot", text: "Boot stages" },
  { id: "console.section.reference", text: "Command reference" },
  {
    id: "console.reference.lede",
    text: "Every command with its usage and flags. Enter runs one entry in the terminal.",
  },
  { id: "console.reference.flags", text: "Global flags" },
  { id: "console.reference.exits", text: "Exit codes" },
  /* the ink terminal workspace of the console page */
  { id: "console.terminal.empty.title", text: "Nothing is active yet." },
  { id: "console.terminal.empty.lede", text: "Describe the next feature, bug or piece of work below." },
  { id: "console.terminal.ask.all", text: "Ask DevThink about the work..." },
  { id: "console.terminal.ask.category", text: "Ask DevThink about {category}..." },
  { id: "console.terminal.return", text: "Type /view chat to return..." },
  { id: "console.terminal.help", text: "up/down destinations, left/right categories, /help commands, v{version}, esc exits" },
  { id: "console.status.paired", text: "Gateway paired" },
  { id: "console.status.static", text: "Static catalog" },
  { id: "console.keys", text: "tab completes, arrows browse, enter runs" },
  {
    id: "console.boot.copy",
    text: "Banner, config and the tools arm stage by stage, the surfaces arm together, and ready closes the walk.",
  },
  {
    id: "console.boot.graphLabel",
    text: "The boot stages of the terminal.",
  },
  { id: "terminal.title", text: "devthink terminal" },
  { id: "terminal.output.aria", text: "devthink console output" },
  {
    id: "terminal.input.aria",
    text: "terminal command input; arrow keys browse history, tab completes",
  },

  /* -------------------------------- history ------------------------------- */
  { id: "history.nav.aria", text: "History sections" },
  { id: "history.navrow", text: "Release ladder" },
  { id: "history.note.stamps", text: "Every release stamps a rung" },
  { id: "history.note.chain", text: "The full chain lives in the changelog" },
  { id: "history.ladder.title", text: "Release ladder" },
  { id: "history.ladder.milestones", text: "Milestones" },
  { id: "history.ladder.empty", text: "No rungs stamped yet" },
  { id: "history.ladder.loading", text: "Loading the ladder" },
  { id: "history.ladder.latest", text: "Latest" },
  { id: "history.facts.rungs", text: "Rungs stamped" },
  { id: "history.facts.chain", text: "Chain" },

  /* -------------------------------- projects ------------------------------ */
  { id: "projects.nav.aria", text: "Projects sections" },
  { id: "projects.navrow", text: "Workspaces" },
  {
    id: "projects.toast.unavailable",
    text: "Projects could not be read from the local CLI, showing browser-local workspaces",
  },
  { id: "projects.note.paired", text: "Paired with the CLI" },
  { id: "projects.note.local", text: "Browser-local store" },
  { id: "projects.note.ids", text: "Ids ride the cli and the browser urls" },
  { id: "projects.card.title", text: "Workspace ledger" },
  { id: "projects.refresh.aria", text: "Refresh workspaces" },
  { id: "projects.refresh", text: "Refresh" },
  { id: "projects.latest", text: "Latest" },
  { id: "projects.session", text: "with {count} session" },
  { id: "projects.empty", text: "No local project yet. Open a workspace from home or pair the cli." },
  { id: "projects.loading", text: "Loading the workspace ledger" },

  /* ------------------------------- providers ------------------------------ */
  { id: "providers.nav.aria", text: "Providers sections" },
  { id: "providers.navrow.index", text: "Providers" },
  { id: "providers.navrow.credentials", text: "Credentials" },
  { id: "providers.toast.loadFailed", text: "The paired CLI could not load providers." },
  { id: "providers.toast.activationRejected", text: "Provider activation was rejected by the local CLI." },
  { id: "providers.toast.enterCredential", text: "Enter a provider credential before saving it locally." },
  { id: "providers.toast.selected", text: "{id} is selected for this browser-local workspace." },
  { id: "providers.toast.activated", text: "{id} is now active in the local cli." },
  {
    id: "providers.confirm.store",
    text: "Store this {id} credential only in this browser? It will never be synced to the cli or a remote adapter.",
  },
  { id: "providers.toast.saved", text: "{id} credential saved only in this browser." },
  { id: "providers.toast.removed", text: "{id} browser-local credential removed." },
  { id: "providers.note.paired", text: "Paired with the CLI" },
  { id: "providers.note.local", text: "Browser-local selection" },
  { id: "providers.note.cliOnly", text: "Credentials remain cli-only" },
  { id: "providers.index.title", text: "Provider index" },
  { id: "providers.index.refresh.aria", text: "Refresh providers" },
  { id: "providers.index.refresh", text: "Refresh" },
  { id: "providers.row.configuredBy", text: ", configured by " },
  { id: "providers.row.active", text: "Active" },
  { id: "providers.row.use", text: "Use provider" },
  { id: "providers.row.activeAria", text: "{id} is the active provider" },
  { id: "providers.row.useAria", text: "Use {id} as the active provider" },
  { id: "providers.card.title", text: "Browser-local credential" },
  {
    id: "providers.card.copy",
    text: "This explicit opt-in stores a credential only in this browser. It is not displayed after saving, never goes to the cli, and is excluded from every sync.",
  },
  { id: "providers.card.provider", text: "Provider" },
  { id: "providers.card.credential", text: "Credential" },
  { id: "providers.card.placeholder", text: "paste only if this device is trusted" },
  { id: "providers.card.save", text: "Save to this browser" },
  { id: "providers.card.remove", text: "Remove local credential" },
  {
    id: "providers.card.flow",
    text: "For the recommended device flow, use devthink auth login <provider> --token <key>. A cli credential never enters this web page.",
  },
  { id: "providers.card.flow.pre", text: "For the recommended device flow, use " },
  { id: "providers.card.flow.code", text: "devthink auth login <provider> --token <key>" },
  { id: "providers.card.flow.post", text: ". A cli credential never enters this web page." },

  /* --------------------------------- usage -------------------------------- */
  { id: "usage.nav.aria", text: "Usage sections" },
  { id: "usage.navrow", text: "Ledger" },
  { id: "usage.toast.unavailable", text: "Usage unavailable from the paired CLI, showing browser counts" },
  { id: "usage.empty.title", text: "Ledger" },
  { id: "usage.empty.copy", text: "No usage yet. Open a workspace or pair the cli to fill the ledger." },
  { id: "usage.note.paired", text: "Paired with the CLI" },
  { id: "usage.note.local", text: "Browser cache" },
  { id: "usage.note.honest", text: "Durable counts, no billing claims" },
  { id: "usage.figlabel", text: "Messages on this device" },
  { id: "usage.measure.projects", text: "Projects" },
  { id: "usage.measure.sessions", text: "Sessions" },
  { id: "usage.measure.tabs", text: "Tabs" },

  /* ---------------------------------- docs -------------------------------- */
  { id: "docs.nav.aria", text: "Docs sections" },
  { id: "docs.section.quickstart", text: "Quickstart" },
  { id: "docs.section.boundary", text: "Boundary" },
  { id: "docs.section.http", text: "HTTP" },
  { id: "docs.section.modules", text: "Modules" },
  { id: "docs.quickstart.copy", text: "Install the CLI, init the workspace, open the help" },
  { id: "docs.quickstart.prefs", text: "Preferences ride " },
  { id: "docs.quickstart.credentials", text: ". Credentials ride " },
  { id: "docs.boundary.copy1", text: "Provider neutral CLI. Local sessions, streaming, plugins, local API." },
  { id: "docs.boundary.copy2", text: "User provided keys only. No cookie capture, no captcha bypass." },
  { id: "docs.http.copy", text: "The server answers only on this machine. The port is drawn when none is set." },
  { id: "docs.codebar", text: "console" },
  { id: "docs.copy.aria", text: "Copy commands" },
  { id: "docs.copy.copied", text: "Copied" },
  { id: "docs.copy.copy", text: "Copy" },
  { id: "docs.modules.empty", text: "The catalog has not answered yet" },

  /* -------------------------------- notfound ------------------------------ */
  { id: "notfound.aria", text: "Page not found" },
  { id: "notfound.eyebrow", text: "devthink · 404" },
  {
    id: "notfound.line",
    text: "this address leads nowhere — nothing was lost; the workbench is one step away.",
  },
  { id: "notfound.back.aria", text: "Back home" },
  { id: "notfound.back", text: "back home" },

  /* ------------------------------- calculator ----------------------------- */
  { id: "calc.nav.aria", text: "Calculator modes" },
  { id: "calc.mode.standard", text: "Standard" },
  { id: "calc.error", text: "The expression could not be evaluated" },
  { id: "calc.history.aria", text: "History" },
  { id: "calc.history.title", text: "History" },
  { id: "calc.history.empty", text: "Nothing yet" },
  { id: "calc.key.digit", text: "digit {key}" },
  { id: "calc.key.backspace", text: "backspace" },
  { id: "calc.key.memoryClear", text: "memory clear" },
  { id: "calc.key.memoryRecall", text: "memory recall" },
  { id: "calc.key.memoryAdd", text: "memory add" },
  { id: "calc.key.memorySubtract", text: "memory subtract" },
  { id: "calc.key.equals", text: "equals" },

  /* --------------------------------- games -------------------------------- */
  { id: "games.nav.aria", text: "Game filters" },
  { id: "games.filter.all", text: "All" },
  { id: "games.filter.game", text: "Games" },
  { id: "games.filter.application", text: "Applications" },
  { id: "games.list.title", text: "Games & apps" },
  { id: "games.list.empty", text: "Nothing in this filter" },
  { id: "games.list.loading", text: "Loading the catalog" },
  { id: "games.list.launch", text: "Launch" },
  { id: "games.list.launchAria", text: "Launch {title}" },
  { id: "games.boundary.title", text: "Instant play" },
  {
    id: "games.boundary.copy",
    text: "Play instantly in your browser. Nothing installs on this device.",
  },

  /* ------------------------------- the studios ---------------------------- */
  { id: "studios.loading", text: "Loading the catalog" },
  { id: "studios.engine", text: "Studio queue" },
  { id: "studios.enginePending", text: "The catalog has not answered yet" },
  { id: "image.nav.aria", text: "Image studio sections" },
  { id: "image.navrow", text: "Stills" },
  { id: "image.stills.title", text: "Stills" },
  { id: "image.stills.empty", text: "No stills in the catalog" },
  { id: "image.stills.render", text: "Render" },
  { id: "image.stills.renderAria", text: "Render {title}" },
  { id: "image.stills.unknownSize", text: "Unknown size" },
  { id: "image.stills.mp", text: "{value} mp" },
  { id: "image.queueNote", text: "render requested from the image studio for {title}" },
  { id: "image.engineTail", text: "Your image renders in the studio queue." },
  { id: "audio.nav.aria", text: "Audio sections" },
  { id: "audio.navrow", text: "Tracks" },
  { id: "audio.tracks.title", text: "Tracks" },
  { id: "audio.tracks.empty", text: "No tracks in the catalog" },
  { id: "audio.tracks.queue", text: "Queue" },
  { id: "audio.tracks.queueAria", text: "Queue {title}" },
  { id: "audio.tracks.minutes", text: "{value} min" },
  { id: "audio.queueNote", text: "render requested from the music studio for {title}" },
  { id: "audio.engineTail", text: "Your track renders in the studio queue." },
  { id: "video.nav.aria", text: "Video sections" },
  { id: "video.navrow", text: "Assets" },
  { id: "video.assets.title", text: "Assets" },
  { id: "video.assets.empty", text: "No assets in the catalog" },
  { id: "video.assets.render", text: "Render" },
  { id: "video.assets.renderAria", text: "Render {title}" },
  { id: "video.queueNote", text: "render requested from the video studio for {title}" },
  { id: "video.stage.aria", text: "Video stage" },
  { id: "video.stage.title", text: "Stage" },
  { id: "video.stage.empty", text: "Open a video file to play it on the studio stage" },
  { id: "video.stage.hint", text: "The file stays on this device: nothing uploads, nothing persists" },
  { id: "video.open", text: "Open" },
  { id: "video.openAria", text: "Open a local video file" },
  { id: "video.playAria", text: "Play" },
  { id: "video.pauseAria", text: "Pause" },
  { id: "video.muteAria", text: "Mute" },
  { id: "video.unmuteAria", text: "Unmute" },
  { id: "video.scrubAria", text: "Playback position" },
  { id: "video.fullscreenAria", text: "Full screen" },
  { id: "video.windowedAria", text: "Exit full screen" },
  { id: "video.engineTail", text: "Your video renders in the studio queue." },

  /* ---------------------------- construction face -------------------------- */
  { id: "construction.aria", text: "In construction notice" },
  { id: "construction.title", text: "In construction" },
  {
    id: "construction.subtitle",
    text: "This surface is being built with the family design system. Come back soon.",
  },
  { id: "construction.action", text: "Back to Explore" },

  /* ------------------------------- onboarding ----------------------------- */
  { id: "onboarding.aria", text: "devthink onboarding" },
  { id: "onboarding.brand", text: "devthink" },
  { id: "onboarding.caption", text: "onboarding" },
  { id: "onboarding.close.aria", text: "close onboarding" },
  { id: "onboarding.count", text: "step {index} of {total}" },
  { id: "onboarding.skip", text: "skip" },
  { id: "onboarding.back", text: "back" },
  { id: "onboarding.next", text: "next" },
  { id: "onboarding.enter", text: "enter devthink" },

  /* --------------------------------- explore ------------------------------ */
  { id: "explore.nav.constellation", text: "constellation" },
  { id: "explore.nav.family", text: "family" },
  { id: "explore.nav.sections", text: "sections" },
  { id: "explore.nav.modules", text: "modules" },
  { id: "explore.nav.builds", text: "builds" },
  { id: "explore.nav.aria", text: "Site navigation" },
  { id: "explore.eyebrow", text: "devthink · explore" },
  { id: "explore.enter", text: "enter devthink" },
  { id: "explore.hero.aria", text: "DevThink — the launcher of the os" },
  { id: "explore.hero.eyebrow", text: "devthink · explore — the launcher" },
  { id: "explore.hero.title", text: "every surface of the os, one command away" },
  {
    id: "explore.hero.sub",
    text: "the stage reads the whole catalog: type, filter, open. the native surfaces and the nine family apps share one field.",
  },
  { id: "explore.waves.sections", text: "02 · the sections" },
  { id: "explore.waves.sectionsMeta", text: "recent · pinned · all apps" },
  { id: "explore.waves.modules", text: "03 · the modules" },
  { id: "explore.waves.modulesMeta", text: "the core catalog" },
  { id: "explore.waves.builds", text: "04 · the builds" },
  { id: "explore.waves.buildsMeta", text: "chromium · firefox · vs code · safari" },
  { id: "explore.waves.defaultCaption", text: "the stage" },
  { id: "explore.modules.cap", text: "the catalog strip" },
  { id: "explore.modules.title", text: "what the platform does" },
  {
    id: "explore.modules.sub",
    text: "the modules of the core catalog — the same rows the panel serves after you enter.",
  },
  { id: "explore.modules.empty", text: "the catalog has not answered yet." },
  { id: "explore.sections.recent.cap", text: "section 01 · recent" },
  { id: "explore.sections.recent.title", text: "recent from the studios" },
  {
    id: "explore.sections.recent.sub",
    text: "the family's own made assets — video, image, 3d and music, straight from the catalog.",
  },
  { id: "explore.sections.recent.empty", text: "the studios have not answered yet." },
  { id: "explore.sections.pinned.cap", text: "section 02 · pinned" },
  { id: "explore.sections.pinned.title", text: "pinned of the os" },
  {
    id: "explore.sections.pinned.sub",
    text: "the surfaces the os itself keeps one click away — the same rows the taskbar pins.",
  },
  { id: "explore.sections.all.cap", text: "section 03 · all apps" },
  { id: "explore.sections.all.title", text: "every app, one field away" },
  {
    id: "explore.sections.all.sub",
    text: "the full catalog — native surfaces and family apps, in order.",
  },
  { id: "explore.studio.video", text: "video studio" },
  { id: "explore.studio.image", text: "image studio" },
  { id: "explore.studio.music", text: "music studio" },
  { id: "explore.studio.model3d", text: "3d studio" },
  { id: "explore.studio.track", text: "music studio" },
  { id: "explore.launch.placeholder", text: "type to open — every surface answers" },
  { id: "explore.launch.search.aria", text: "Search every app of the os" },
  { id: "explore.launch.answer", text: "{count} answer" },
  { id: "explore.launch.answers", text: "{count} answers" },
  { id: "explore.launch.open", text: "open" },
  { id: "explore.launch.filters.aria", text: "Quick filters of the launcher" },
  { id: "explore.launch.scope.all", text: "everything" },
  { id: "explore.launch.scope.native", text: "native" },
  { id: "explore.launch.scope.family", text: "family" },
  { id: "explore.launch.scope.pinned", text: "pinned" },
  { id: "explore.launch.tally", text: "{native} native · {family} family · none of it invented" },
  { id: "explore.launch.waves.caption", text: "01 · the constellation" },
  { id: "explore.launch.waves.meta", text: "{native} native · {family} family" },
  { id: "explore.launch.native.cap", text: "devthink · native" },
  { id: "explore.launch.native.title", text: "the os, its own surfaces" },
  { id: "explore.launch.native.meta", text: "the full rail" },
  { id: "explore.launch.native.metaPartial", text: "{count} of {total} answer" },
  { id: "explore.launch.native.empty", text: "no native surface answers “{query}”." },
  {
    id: "explore.launch.native.resting",
    text: "the native rail rests — the family owns the stage.",
  },
  { id: "explore.launch.family.cap", text: "the family · nine" },
  { id: "explore.launch.family.title", text: "one signal color each" },
  { id: "explore.launch.family.meta", text: "each tile opens its own site" },
  { id: "explore.launch.family.empty", text: "no family app answers “{query}”." },
  {
    id: "explore.launch.family.resting",
    text: "the family grid rests — the native rail owns the stage.",
  },
  { id: "explore.download.cap", text: "the distribution rail" },
  { id: "explore.download.title", text: "take devthink with you" },
  {
    id: "explore.download.sub",
    text: "the same code serves the site, the binary and the extension — every channel ships from the immutable v{version} tag.",
  },
  { id: "explore.download.browse", text: "browse every release" },
  {
    id: "explore.download.provenance",
    text: "— the provenance set (the sbom, the attestations and the artifact manifest) rides beside the artifacts of each tag.",
  },
  { id: "explore.download.chromium", text: "chromium · brave · edge" },
  {
    id: "explore.download.chromium.note",
    text: "the chromium build of the extension. unzip it, open chrome://extensions, turn developer mode on and load the folder unpacked.",
  },
  { id: "explore.download.firefox", text: "firefox" },
  {
    id: "explore.download.firefox.note",
    text: "the firefox build, ready for your signing path — while unsigned, load it temporarily from about:debugging.",
  },
  { id: "explore.download.vscode", text: "vs code" },
  {
    id: "explore.download.vscode.note",
    text: "the workbench vsix — install it from the release through extensions: install from vsix.",
  },
  { id: "explore.download.every", text: "every channel" },
  {
    id: "explore.download.every.note",
    text: "the immutable tag also carries the safari wrapper, the native host template, the source snapshot, the sbom and the attestations.",
  },
  { id: "explore.window.title", text: "explore — devthink" },
  { id: "explore.window.minimize", text: "Minimize the landing" },
  { id: "explore.window.restore", text: "Restore the landing" },
  { id: "explore.window.maximize", text: "Maximize the landing" },
  { id: "explore.window.close", text: "Close and return to the intro" },
  { id: "explore.footer.wordmark", text: "DevThink" },
  { id: "explore.footer.nav.aria", text: "Institutional" },
  { id: "explore.footer.about", text: "about" },
  { id: "explore.footer.terms", text: "terms" },
  { id: "explore.footer.policy", text: "privacy" },
  {
    id: "explore.footer.note",
    text: "exploration is free and reads the public catalog · the local identity of the os is yours: no remote authentication, no telemetry",
  },

  /* ---------------------------------- about ------------------------------- */
  { id: "about.family.kicker", text: "the family" },
  { id: "about.family.count", text: "{count} named sites" },
  { id: "about.family.heading", text: "The family" },
  {
    id: "about.family.intro",
    text: "One platform, several named sites. Each product lives on its own subdomain with its own interface, while the engines stay shared.",
  },
  { id: "about.family.cta", text: "open site" },
  { id: "about.timeline.kicker", text: "the release ladder" },
  { id: "about.timeline.heading", text: "How the platform moved" },
  {
    id: "about.timeline.intro",
    text: "The release ladder records the stamps of the platform; this page reads the same rows the history surface serves.",
  },
  { id: "about.timeline.stat", text: "release rungs" },
  { id: "about.timeline.latest", text: "latest" },

  /* -------------------------------- guard wall ------------------------------ */
  { id: "guard.wall.aria", text: "Developer tools notice" },
  { id: "guard.wall.title", text: "Developer tools are open" },
  {
    id: "guard.wall.body",
    text: "This workspace pauses its surface while developer tools inspect it. Close the tools and reload the page to continue where you left off.",
  },
  {
    id: "guard.wall.note",
    text: "Nothing was closed and nothing was erased — the session stays intact and a notice goes to the site.",
  },
];

export type OsStringId = (typeof seedOsStrings)[number]["id"];

/** osText — the typed string accessor: the dot id quotes the row, the seed
 * answers today and the paired database answers tomorrow. An unknown id
 * renders the empty string (never a crash on the interface). */
export function osText(id: OsStringId): string {
  const row = seedOsStrings.find((entry) => entry.id === id);
  return row ? row.text : "";
}

/* ----------------------------- command palette --------------------------- */

/** one command row of the palette: the id the action dispatches, the label,
 * the detail and the shortcut badge the row renders. */
export type OsPaletteCommand = { id: string; title: string; detail: string; key: string };

const seedOsPaletteCommands: OsPaletteCommand[] = [
  { id: "new", title: "new session", detail: "Create a clean provider-scoped session", key: "⌘ N" },
  { id: "console", title: "open console", detail: "The canonical design of the devthink cli", key: "⌘ C" },
  { id: "gateway", title: "open gateway", detail: "The embedded gateway console of the catalog", key: "⌘ G" },
  { id: "os", title: "open os", detail: "The local os shell of the family", key: "⌘ O" },
  { id: "docs", title: "open docs", detail: "The documentation library of the family", key: "⌘ D" },
  { id: "explore", title: "open explore", detail: "The exploration gallery of the family", key: "⌘ X" },
  { id: "providers", title: "open providers", detail: "Inspect local provider and model choices", key: "⌘ P" },
  { id: "projects", title: "open projects", detail: "Inspect local workspace records", key: "⌘ J" },
  { id: "usage", title: "open usage", detail: "Review compact local usage records", key: "⌘ U" },
  { id: "routes", title: "inspect routes", detail: "Show gateway and stream health", key: "⌘ I" },
  { id: "history", title: "open history", detail: "Review open local session tabs", key: "⌘ H" },
  { id: "settings", title: "open settings", detail: "Pair or revoke a local browser connection", key: "⌘ ," },
];

/** the command rows of the palette, catalog order. */
export function osPaletteCommands(): OsPaletteCommand[] {
  return seedOsPaletteCommands;
}

/* ------------------------------ tray calendar ---------------------------- */

/** the sunday-first weekday letters of the calendar flyout. */
export const seedOsCalendarWeekdays: string[] = ["S", "M", "T", "W", "T", "F", "S"];

/** the weekday letters in order. */
export function osCalendarWeekdays(): string[] {
  return seedOsCalendarWeekdays;
}

/* ------------------------------- calculator ------------------------------ */

/** the four memory kinds the strip answers with (the kind the winget hands
 * the calculator page, the same grammar the pure logic module documents). */
export type OsCalcMemoryKey = "mc" | "mr" | "m+" | "m-";

/** one memory strip key of the keypad: the glyph the button prints, the
 * memory kind the calculator logic applies and the aria name (the dot id
 * this table owns, resolved once here). */
export type OsCalcMemoryRow = { label: string; kind: OsCalcMemoryKey; aria: string };

const seedOsCalcMemoryKeys: OsCalcMemoryRow[] = [
  { label: "MC", kind: "mc", aria: osText("calc.key.memoryClear") },
  { label: "MR", kind: "mr", aria: osText("calc.key.memoryRecall") },
  { label: "M+", kind: "m+", aria: osText("calc.key.memoryAdd") },
  { label: "M−", kind: "m-", aria: osText("calc.key.memorySubtract") },
];

/** the memory strip rows of the keypad, strip order. */
export function osCalcMemoryKeys(): OsCalcMemoryRow[] {
  return seedOsCalcMemoryKeys;
}

/** one on-screen key of the keypad grid: the glyph the button prints, the
 * key action the pure logic module understands, the muted flag of the
 * modifier row, the equals flag of the answer key and the aria name when
 * the key owns one (the digit keys derive theirs from the {key} template,
 * the winget never restates it). */
export type OsCalcKey = {
  label: string;
  action: CalculatorKeyAction;
  muted?: boolean;
  equals?: boolean;
  aria?: string;
};

const seedOsCalcKeys: OsCalcKey[][] = [
  [
    { label: "C", action: { kind: "clear" }, muted: true },
    { label: "(", action: { kind: "lparen" }, muted: true },
    { label: ")", action: { kind: "rparen" }, muted: true },
    { label: "\u232b", action: { kind: "backspace" }, muted: true, aria: osText("calc.key.backspace") },
  ],
  [
    { label: "7", action: { kind: "digit", digit: "7" } },
    { label: "8", action: { kind: "digit", digit: "8" } },
    { label: "9", action: { kind: "digit", digit: "9" } },
    { label: "÷", action: { kind: "operator", value: "÷" } },
  ],
  [
    { label: "4", action: { kind: "digit", digit: "4" } },
    { label: "5", action: { kind: "digit", digit: "5" } },
    { label: "6", action: { kind: "digit", digit: "6" } },
    { label: "×", action: { kind: "operator", value: "×" } },
  ],
  [
    { label: "1", action: { kind: "digit", digit: "1" } },
    { label: "2", action: { kind: "digit", digit: "2" } },
    { label: "3", action: { kind: "digit", digit: "3" } },
    { label: "−", action: { kind: "operator", value: "−" } },
  ],
  [
    { label: "%", action: { kind: "percent" } },
    { label: "0", action: { kind: "digit", digit: "0" } },
    { label: ".", action: { kind: "decimal" } },
    { label: "+", action: { kind: "operator", value: "+" } },
  ],
  [{ label: "=", action: { kind: "equals" }, equals: true, aria: osText("calc.key.equals") }],
];

/** the on-screen key rows of the keypad, the four-column calculator order
 * with the answer key closing the grid alone. */
export function osCalcKeys(): OsCalcKey[][] {
  return seedOsCalcKeys;
}

/* ------------------------------- providers ------------------------------- */

/** one provider registry row the providers surface renders (the ids mirror
 * the local provider registry; the protocol and env words are interface
 * copy, so the rows live here). */
export type OsProviderRow = { id: string; protocol: string; env: string };

const seedOsProviders: OsProviderRow[] = [
  "openai",
  "zai",
  "anthropic",
  "google",
  "qwen",
  "openrouter",
  "deepseek",
  "groq",
  "mistral",
  "xai",
  "ollama",
  "mimo",
].map((id) => ({ id, protocol: "configured locally", env: "CLI" }));

/** the provider rows, registry order. */
export function osProviders(): OsProviderRow[] {
  return seedOsProviders;
}

/* ------------------------------- onboarding ------------------------------ */

/** one frame of the onboarding tour: the eyebrow, the heading, the body and
 * the registry app id the art tile renders (null = the OS mark). */
export type OsOnboardingStep = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  app: string | null;
};

const seedOsOnboardingSteps: OsOnboardingStep[] = [
  {
    id: "os",
    eyebrow: "the os",
    title: "One OS, many apps",
    body: "devthink is the family os — sibling apps open as windows inside it, pinned to the taskbar.",
    app: null,
  },
  {
    id: "explore",
    eyebrow: "explore",
    title: "Explore is the free floor",
    body: "the catalog at /explore — every family app answers without an account.",
    app: "explore",
  },
  {
    id: "auth",
    eyebrow: "auth, then panel",
    title: "Auth opens the panel",
    body: "one identity signs everything — /auth hands the session to /panel: chat, projects, studios.",
    app: "panel",
  },
  {
    id: "mcp",
    eyebrow: "mcp",
    title: "MCP is opt-in",
    body: "register an mcp server only when you want one — nothing connects on its own.",
    app: "settings",
  },
];

/** the onboarding tour frames, walk order. */
export function osOnboardingSteps(): OsOnboardingStep[] {
  return seedOsOnboardingSteps;
}

/* --------------------------------- gateway ------------------------------- */

/** the seven routes every gateway version generates (the engine contract —
 * one handler per route). */
export function osGatewayRoutes(): string[] {
  return ["chat/completions", "completions", "embeddings", "keys", "messages", "models", "responses"];
}

/** one auth method family of the gateway (the examples name the providers
 * the method covers). */
export type OsGatewayAuthMethod = { method: string; examples: string };

const seedOsGatewayAuthMethods: OsGatewayAuthMethod[] = [
  { method: "bearer", examples: "openai nvidia groq mistral deepseek kimi openrouter" },
  { method: "apikeyheader", examples: "anthropic x-api-key gemini x-goog-api-key azure api-key" },
  { method: "queryparam", examples: "legacy google key api_key params" },
  { method: "basic", examples: "generic rest base64 user pass" },
  { method: "oauth2clientcredentials", examples: "ibm watsonx azure entra auth0" },
  { method: "jwtsign", examples: "zhipu bigmodel hs256 keyid secret" },
  { method: "sigv4", examples: "aws bedrock aws4-hmac-sha256" },
  { method: "anonymous", examples: "opencode zen kilo ollama keyless" },
];

/** the auth method families of the gateway, catalog order. */
export function osGatewayAuthMethods(): OsGatewayAuthMethod[] {
  return seedOsGatewayAuthMethods;
}

/** the display copy of one thinking level of the gateway view (an unknown
 * level answers the empty string, the honest fallback of the ledger). */
export function osGatewayThinking(level: string): string {
  const row = seedOsStrings.find((entry) => entry.id === `gateway.thinking.${level}`);
  return row ? row.text : "";
}

/** the library usage block the gateway view renders beside the catalog. */
export const seedOsGatewayUsage = [
  "# scaffold a new gateway",
  "npx @wenathlan/devthink gateway init",
  "",
  "# add a version with any baseurl any models any auth",
  "npx @wenathlan/devthink gateway add v6",
  "",
  "# register keys for rotation",
  "npx @wenathlan/devthink gateway keys v6",
  "",
  "# start the server",
  "npx @wenathlan/devthink gateway serve --port 3001",
  "",
  "# or embed the library",
  'import { createversion, loadconfig } from "@wenathlan/devthink"',
  "const def = await loadconfig()",
  "const handlers = createversion(def.versions.v1)",
  "const response = await handlers.handlechatcompletions(request)",
].join("\n");

/** the library usage block of the gateway view. */
export function osGatewayUsageBlock(): string {
  return seedOsGatewayUsage;
}

/** the merged repository structure the gateway view documents. */
export const seedOsGatewayStructure = `devthink/
  gateway-index.ts          # the library barrel — the ./gateway-lib surface
  engine.ts                 # universal engine — routes, rotation, retry, fallback
  gateway-http.ts           # the http transport — hono server + sse pipeline
  gateway-cli.ts            # the scaffolding cli (init add keys serve export)
  gateway-configloader.ts   # config validation + the standard sol/config.* probe
  gateway-auth.ts           # the 12 auth methods + key resolution
  database.ts               # prisma + libsql client
  types.ts                  # the public types of every family (gateway section)
  gatewayviewconfig.ts      # the shipped v1–v5 definitions (data only)
  gatewayviewdefinition.ts  # the view-side structural contract
  sol/                      # the design room of the whole project
    App.tsx                 # the workbench entry — one router, one mount
    gatewayview/            # this console — the embedded gateway face
      gatewayview.tsx       # this page (self-contained, no main.tsx)
    schema.prisma           # the database schema
    prisma/                 # the local sqlite home — sol/prisma/devthink.db
    console/                # the cli design page
    capacitor.config.ts     # the android wrapper — same interface
    vercel.json netlify.toml # platform manifests — deploy from here
  prismaconfig.ts           # prisma 7 config (datasource url, client output)
  Dockerfile                # the one container file
  .github/workflows/        # ci release publish npm maven nuget ghcr security maintenance
  tests/                    # vitest tests flat *.test.ts
  package.json              # @wenathlan/devthink public`;

/** the repository structure block of the gateway view. */
export function osGatewayStructureBlock(): string {
  return seedOsGatewayStructure;
}

/* ---------------------------------- docs --------------------------------- */

/** the quickstart command lines of the docs card. */
export function osDocsQuickstartCommands(): string[] {
  return ["npm install --global @wenathlan/devthink", "devthink init", "devthink --help"];
}

/** the loopback endpoints the docs http card lists. */
export function osDocsEndpoints(): string[] {
  return ["GET /health", "GET /models", "POST /chat"];
}

/* --------------------------- the paired endpoint -------------------------- */

/** osStringRows — the paired answer of the paired database endpoint: the
 * endpoint of the server lane (GET /api/v1/oslabels) serves exactly these
 * rows, so the static build's seeds and the served catalog answer the same
 * truth from both ends (the pair the file header promises). */
export function osStringRows(): OsStringRow[] {
  return seedOsStrings.map((row) => ({ id: row.id, text: row.text }));
}

/* ===== block: osreveal ===== */
/**
 * osreveal.ts — reveal on scroll (port of the engine.js pass):
 * IntersectionObserver adds .in to the .reveal elements as they enter
 * the viewport (threshold 0.12). Reduced motion (os setting or system
 * preference) reveals everything immediately.
 */


function motionReduced(): boolean {
  if (typeof window === "undefined") return true;
  if (document.documentElement.dataset.motion === "reduced") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * observes every not-yet-revealed .reveal element in the document.
 *
 * @returns a cleanup fn that disconnects the observer.
 */
export function observeReveals(): () => void {
  if (typeof document === "undefined") return () => {};
  const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.in)"));
  if (els.length === 0) return () => {};

  if (motionReduced() || typeof IntersectionObserver === "undefined") {
    els.forEach((el) => {
      el.classList.add("in");
    });
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  els.forEach((el) => {
    io.observe(el);
  });
  return () => io.disconnect();
}

/**
 * hook: runs on every view/page change (the caller owns the deps).
 *
 * @param deps the change signals the caller passes in.
 */
export function useReveal(deps: unknown[]): void {
  // biome-ignore lint/correctness/useExhaustiveDependencies: the caller owns the dependency list — this hook intentionally forwards a dynamic deps array so every view/page change re-runs the reveal observer.
  useEffect(() => observeReveals(), deps);
}

/* ===== block: ostypes ===== */
/**
 * ostypes.ts — the global types of the os (view, settings, shared
 * handle) plus the type-guards that validate restored state.
 */


export type OSView = { app: AppId | "gateway"; page: string };

export type OSSettings = {
  theme: "dark" | "light";
  reduceMotion: boolean;
  showCognition: boolean;
  locale: "pt" | "en";
  profileName: string;
};

export const DEFAULT_SETTINGS: OSSettings = {
  theme: "dark",
  reduceMotion: false,
  showCognition: true,
  locale: "pt",
  profileName: "operador",
};

export type OSHandle = {
  view: OSView;
  navigate: (view: OSView) => void;
  openApp: (app: AppId, page?: string) => void;
  goGateway: () => void;
  settings: OSSettings;
  updateSettings: (patch: Partial<OSSettings>) => void;
  toggleTheme: () => void;
  openCmd: () => void;
};

/* ---------------- validators (type-guards) ---------------- */

/**
 * checks that an unknown value is a well formed os view.
 *
 * @param v the value to check.
 * @returns true when the value is an OSView.
 */
export function isOSView(v: unknown): v is OSView {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  /* the valid apps derive from the live catalog (osapps.ts) plus the gateway
   * view — a hardcoded list here is exactly how a family app stops restoring */
  const apps: string[] = [...APPS.map((a) => a.id), "gateway"];
  return typeof o.app === "string" && apps.includes(o.app) && typeof o.page === "string" && o.page.length > 0;
}

/**
 * checks that an unknown value is a well formed os settings object.
 *
 * @param v the value to check.
 * @returns true when the value is OSSettings.
 */
export function isOSSettings(v: unknown): v is OSSettings {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    (o.theme === "dark" || o.theme === "light") &&
    typeof o.reduceMotion === "boolean" &&
    typeof o.showCognition === "boolean" &&
    (o.locale === "pt" || o.locale === "en") &&
    typeof o.profileName === "string"
  );
}

