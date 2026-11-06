/**
 * gateway — consolidated gateway logics of the getry family
 * @module gateway
 * @family wave/logicfold3
 * One keyed file per family: the former variant arms (gatewayconfig, gatewayviewconfig)
 * retired into this seat with every export preserved under the same name.
 */

import type { gatewaydefinition, modeldef, thinkinglevel } from "./types.ts";
import { listlevels, providerchain, type thinkingproviderrow } from "@wenathlan/getry/thinking";

/**
 * gateway.ts — the gateway versions domain of getry (root layer).
 *
 * the five provider gateways the app serves (v1 through v5), the seven
 * OpenAI-compatible route kinds each one answers, and the canonical
 * parser pattern the streaming routes follow. the rows below are the
 * in-memory catalog of the route map: the self-hosted gateway answers
 * the real traffic over HTTPS, the static build falls back to this
 * catalog without ever touching the visitor machine.
 */

/** the seven OpenAI-compatible route kinds every gateway version carries. */
export const GATEWAYROUTES = [
  "chat/completions",
  "completions",
  "embeddings",
  "keys",
  "messages",
  "models",
  "responses",
] as const;

/** one route kind of the gateway surface. */
export type GatewayRoute = (typeof GATEWAYROUTES)[number];

/** the lifecycle badge a gateway version carries. */
export type GatewayBadge = "live" | "paused";

/** one provider gateway of the family (v1 through v5). */
export type GatewayVersion = {
  v: string;
  provider: string;
  pattern: string;
  badge: GatewayBadge;
  models: string;
  routes: GatewayRoute[];
  note: string;
};

/** the in-memory catalog the DB layer persists on first run. */
export const GATEWAYVERSIONS: GatewayVersion[] = [
  {
    v: "v1",
    provider: "zai",
    pattern: "passthrough retransmit via z ai web dev sdk",
    badge: "live",
    models:
      "glm-5.3 glm-5.3-flash glm-5.3-fast glm-5.3-air glm-5.2 glm-5.1 glm-5 glm-5v glm-5-turbo glm-4-plus glm-4-flash devthink",
    routes: [...GATEWAYROUTES],
    note: "no token chat id required — sdk has internal config — individual model calling plus devthink meta over glm-5.3",
  },
  {
    v: "v2",
    provider: "babel town",
    pattern: "rebuild plus byte tee passthrough paused fallback v1",
    badge: "paused",
    models: "babel-glm-5.2 devthink",
    routes: [...GATEWAYROUTES],
    note: "service is paused returns 503 fallback to v1 zai — glm-5.2 only",
  },
  {
    v: "v3",
    provider: "nvidia nim",
    pattern: "rebuild per family reasoning control pure byte passthrough",
    badge: "live",
    models: "17 chat models kimi-k3 deepseek-v4 nemotron-3 muse-glimmer laguna gpt-oss gemma-4 mistral llama-3.2",
    routes: [...GATEWAYROUTES],
    note: "22 keys round robin devthink meta model rotates every 6 messages",
  },
  {
    v: "v4",
    provider: "opencode zen plus kilo",
    pattern: "dynamic free discovery anonymous no key",
    badge: "live",
    models: "discovered live -free and :free tagged models from opencode zen plus kilo",
    routes: [...GATEWAYROUTES],
    note: "zero hardcoded model names — universal free-tag filter plus devthink context-window math",
  },
  {
    v: "v5",
    provider: "openrouter",
    pattern: "dynamic free discovery openrouter :free tagged",
    badge: "live",
    models: "discovered live :free tagged models from openrouter",
    routes: [...GATEWAYROUTES],
    note: "requires free openrouter api key — zero hardcoded model names plus devthink context-window math",
  },
];

/** the canonical parser pattern of the streaming routes, in order. */
export const PARSERSTEPS: string[] = [
  "readablestream with safeenqueue safeclose plus closed flag",
  "setinterval keepalive 200ms only when silent greater than 1 second",
  "upstream call fetch with abortsignal timeout 2147483647 for stream",
  "parse sse parsesseframes split on double newline never partial frame",
  "discard heartbeat lines starting with colon or event ping",
  "mask model name to devthink via regex no json parse",
  "re-emit normalized chunks delta reasoning content before content",
  "finally emit finish reason stop plus single done plus savemsg",
];

/**
 * lists the gateway versions in serve order (v1 first).
 *
 * @returns the version rows.
 */
export function listversions(): GatewayVersion[] {
  return GATEWAYVERSIONS;
}

/**
 * finds one gateway version by its version tag.
 *
 * @param v the version tag (v1 through v5).
 * @returns the version row or null.
 */
export function findversion(v: string): GatewayVersion | null {
  return GATEWAYVERSIONS.find((version) => version.v === v) ?? null;
}

/**
 * counts the routes the whole gateway serves (versions times route kinds).
 *
 * @returns the total route count.
 */
export function totalroutes(): number {
  return GATEWAYVERSIONS.reduce((sum, version) => sum + version.routes.length, 0);
}

/**
 * lists the versions that answer live traffic right now.
 *
 * @returns the live version rows.
 */
export function liveversions(): GatewayVersion[] {
  return GATEWAYVERSIONS.filter((version) => version.badge === "live");
}

/**
 * builds the cross-provider thinking chain for one level over the catalog
 * this module owns: every gateway version's provider row (the
 * GATEWAYVERSIONS lifecycle badges) wired with the model rows of the
 * matching gatewayViewConfig version, routed through the thinking seat's
 * providerchain — the tier routing (the level selects the model tier), the
 * budget fit and the live-first order all answer from the seat (the one
 * owner of the routing math), the rows from this catalog (the one owner of
 * the data). the family consumers (devthink and siblings) call this
 * through the @wenathlan/getry/gatewayconfig face and never rebuild the
 * chain themselves.
 *
 * @law the level routes the chain — the data rides the catalog rows, the
 *      math rides the thinking seat, nothing duplicates
 * @param level the thinking level to route.
 * @returns the ordered provider/model candidates (live providers first,
 *          tier-exact models first within each provider).
 */
export function thinkingchain(level: thinkinglevel): { provider: string; model: modeldef }[] {
  const catalog: thinkingproviderrow[] = GATEWAYVERSIONS.map((version) => ({
    provider: version.provider,
    badge: version.badge,
    models: gatewayViewConfig.versions[version.v]?.models ?? [],
  }));
  return providerchain(catalog, level).map((candidate) => ({
    provider: candidate.provider,
    model: candidate.model as modeldef,
  }));
}

/* ===== block: gatewayconfig ===== */
/**
 * gatewayconfig.ts — the gateway definition of the devthink app (root layer).
 *
 * The embedded gateway serves the OpenAI-compatible contract the chat speaks:
 * `/v1/chat/completions` + `/v1/models` (and the legacy `/api/v1/*` prefix the
 * server always carried). The v1 row rides the z.ai SDK transport — keyless,
 * the SDK authenticates itself — exactly the family doctrine: the chat talks to
 * the gateway, the gateway talks to the model, and no side-service ever ships.
 */


export const gatewayConfig: gatewaydefinition = {
  name: "devthink gateway",
  description: "the embedded gateway of the devthink app — v1 zai sdk keyless",
  versions: {
    v1: {
      id: "v1",
      name: "zai sdk",
      providername: "zai",
      note: "passthrough retransmit via z ai web dev sdk — no token chat id required",
      transport: { type: "zai-sdk" },
      upstreams: [],
      auth: { mode: "keylesssdk" },
      defaultmodel: "devthink",
      models: [
        { id: "devthink", context: 200000, maxoutput: 32768, reasoning: true },
        { id: "glm-5.3", context: 200000, maxoutput: 32768, reasoning: true, family: "glm" },
        { id: "glm-5.3-flash", context: 128000, maxoutput: 16384, reasoning: true, family: "glm", free: true },
        { id: "glm-5.3-fast", context: 128000, maxoutput: 16384, reasoning: true, family: "glm" },
        { id: "glm-5.3-air", context: 128000, maxoutput: 16384, reasoning: true, family: "glm", free: true },
        { id: "glm-5.2", context: 200000, maxoutput: 32768, reasoning: true, family: "glm" },
        { id: "glm-5.1", context: 128000, maxoutput: 32768, reasoning: true, family: "glm" },
        { id: "glm-5", context: 128000, maxoutput: 32768, reasoning: true, family: "glm" },
        { id: "glm-5v", context: 128000, maxoutput: 16384, reasoning: false, vision: true, family: "glm" },
        { id: "glm-5-turbo", context: 128000, maxoutput: 16384, reasoning: false, family: "glm", free: true },
        { id: "glm-4-plus", context: 128000, maxoutput: 16384, reasoning: false, family: "glm" },
        { id: "glm-4-flash", context: 128000, maxoutput: 8192, reasoning: false, family: "glm", free: true },
      ],
      defaults: {
        primary: "devthink",
        maxtokens: 8192,
        temperature: [0, 2, 0.7],
      },
      thinking: {
        defaultlevel: "high",
        param: "thinking",
        twocalls: { threshold: 98304, freshresponseguarantee: true },
      },
      metamodel: {
        id: "devthink",
        contextoverride: 200000,
        maxoutput: 32768,
        maskupstreammodel: true,
        alwaysdisplay: true,
        listedcreated: 1700000000,
        pattern: "fusion meta model over the zai sdk transport",
      },
      context: {
        restoresessionhistory: false,
        truncate: true,
        historylimit: 40,
        truncatemargin: 4096,
      },
    },
  },
};

/* (the gatewayconfig arm once answered a dual default export beside this
 * named seat — the logicfold3 fold converted it to the named export alone,
 * the default retired with the variant file.) */

/* ===== block: gatewayviewconfig ===== */
/**
 * gatewayviewconfig — the user customization layer of the embedded gateway
 * one file one responsibility — only version definitions live here
 * this is the hardcoded v1 v5 configuration the gateway ships with
 *
 * the catalog lives at the repository root beside the engine modules it
 * configures (the family law: page folders carry only the page anchor and
 * the visual components beside it — engine config is root module matter)
 *
 * the library engine at root is universal and dry — it reads a config file
 * every value here is what the user customizes:
 *   baseurls — which upstream apis to call
 *   models — which models to expose
 *   auth — how keys are resolved per method
 *   rotation — model rotation strategies
 *   retry — backoff and status handling
 *   context — session history and truncation
 *   thinking — two-calls pattern and budgets
 *
 * create as many versions as you want — v1 through v9 and beyond
 * each version gets all 7 routes generated automatically:
 *   chat/completions completions messages responses embeddings keys models
 *
 * the engine config loader (gateway-configloader.ts) probes the standard
 * sol/config.mjs|ts|js locations of the working directory for the definition
 * a deployment loads; this catalog is the shipped example the gateway
 * console page renders — copy it to the location your serve reads, or
 * use the cli to scaffold a fresh config (gateway init) and edit the values
 */

/* the gatewaydefinition family moved to the gateway types with the
 * wave/ownership.getry split: the catalog imports the kind from the engine
 * owner (types.ts of this app root) — the os gateway lane keeps its own
 * web-check projection and never leaks into the engine import graph. */


/** the live thinking budgets consumed from the getry engine (pr16): the
 * ladder is owned by getry and every budget map of this catalog derives
 * from the owner's registered rungs — never a second literal copy, never a
 * fixed 7. */
const ladderbudgets = Object.fromEntries(listlevels().map((rung) => [rung.level, rung.budget])) as Record<
  thinkinglevel,
  number
>;

export const gatewayViewConfig: gatewaydefinition = {
  name: "DevThink Gateway",
  description: "multi provider ai gateway v1 v5 with thinking rotation retry and fusion context",

  versions: {
    // -----------------------------------------------------------------------
    // v1 — zai sdk keyless transport with 2-calls thinking pattern
    // -----------------------------------------------------------------------
    v1: {
      id: "v1",
      name: "V1 ZAI",
      providername: "zai",
      note: "v1 replica retains token plus chat id functionality calls internal api z ai directly",
      transport: {
        type: "zai-sdk",
      },
      upstreams: [{ name: "zai", baseurl: "https://internal-api.z.ai/v1" }],
      auth: {
        mode: "keylesssdk",
        required: false,
      },
      models: [
        {
          id: "glm-5.3",
          context: 1048576,
          maxoutput: 131072,
          vision: false,
          reasoning: true,
          free: false,
          rank: { score: 56, tier: 1 },
        },
        {
          id: "glm-5.3-flash",
          context: 1048576,
          maxoutput: 131072,
          vision: true,
          reasoning: true,
          free: false,
          rank: { score: 55, tier: 1 },
        },
        {
          id: "glm-5.2",
          context: 1048576,
          maxoutput: 131072,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 53, tier: 1 },
        },
        {
          id: "glm-5.1",
          context: 131072,
          maxoutput: 16384,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 40, tier: 2 },
        },
        {
          id: "glm-5v",
          context: 131072,
          maxoutput: 16384,
          vision: true,
          reasoning: true,
          free: true,
          rank: { score: 38, tier: 2 },
        },
        {
          id: "glm-4-plus",
          context: 131072,
          maxoutput: 4096,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 25, tier: 3 },
        },
        {
          id: "glm-4-flash",
          context: 131072,
          maxoutput: 4096,
          vision: false,
          reasoning: false,
          free: true,
          rank: { score: 15, tier: 4 },
        },
      ],
      defaultmodel: "glm-5.3",
      metamodel: {
        id: "devthink",
        contextoverride: 2300000,
        fallbackcontext: 1048576,
        maxoutput: 98304,
        maskupstreammodel: false,
        alwaysdisplay: false,
        pattern: "2-calls thinking over glm-5.2 backend",
      },
      thinking: {
        defaultlevel: "high",
        budgets: ladderbudgets,
        twocalls: {
          threshold: 98304,
          freshresponseguarantee: true,
        },
        param: "thinking",
      },
      bodybuild: {
        optionalparamspolicy: "always",
        clampmaxtokens: true,
      },
      routes: {
        embeddings: "disabled",
        embeddingsmessage: "zai has no embeddings endpoint",
      },
      headers: {
        useragent: "DevThink-Gateway/1.0",
      },
    },

    // -----------------------------------------------------------------------
    // v2 — babel town paused with fallback to v1
    // -----------------------------------------------------------------------
    v2: {
      id: "v2",
      name: "V2 Babel",
      providername: "babel",
      note: "service is paused returns 503 fallback to v1 zai",
      paused: true,
      upstreams: [{ name: "babel", baseurl: "https://api.babel.town/v1" }],
      auth: {
        mode: "apikeyheader",
        headername: "x-token",
        keysources: ["ephemeralurl"],
        keyurl: "https://glm.babel.town/api/get_api_key",
        keyexpiryminutes: 60,
        ipbound: true,
        required: false,
      },
      models: [
        {
          id: "babel-glm-5.3",
          upstream: "glm-5.3",
          context: 1048576,
          maxoutput: 131072,
          free: true,
        },
        {
          id: "babel-glm-5.3-flash",
          upstream: "glm-5.3-flash",
          context: 1048576,
          maxoutput: 131072,
          free: true,
        },
        {
          id: "babel-glm-5.2",
          upstream: "glm-5.2",
          context: 1048576,
          maxoutput: 131072,
          free: true,
        },
        {
          id: "babel-devthink",
          upstream: "devthink",
          context: 1048576,
          maxoutput: 131072,
          free: true,
        },
      ],
      defaultmodel: "babel-glm-5.3",
      metamodel: {
        id: "babel-devthink",
        fallbackcontext: 1048576,
        maxoutput: 131072,
        maskupstreammodel: false,
        alwaysdisplay: false,
      },
      routes: {
        embeddings: "disabled",
        embeddingsmessage: "babel has no embeddings endpoint",
        pausedstatus: 503,
        pausedmessage: "babel town is paused — use v1 zai instead",
        fallbackroute: "/v1/chat/completions",
      },
    },

    // -----------------------------------------------------------------------
    // v3 — nvidia nim with 4-backend rotation db keys retry backoff
    // -----------------------------------------------------------------------
    v3: {
      id: "v3",
      name: "V3 NVIDIA",
      providername: "nvidia",
      note: "nvidia keys round robin devthink meta model rotates",
      upstreams: [{ name: "nvidia", baseurl: "https://integrate.api.nvidia.com/v1" }],
      auth: {
        mode: "bearer",
        keysources: ["db", "env"],
        dbmodel: "nvidiaKey",
        dbtake: 50,
        envvar: "NVIDIA_API_KEY",
        envseparator: ",",
        keyrotation: "roundrobin",
        keylabelformat: "nvapi-key-{idx}",
        required: true,
        minkeylength: 10,
      },
      models: [
        // rotation backends — the devthink meta rotates across these 4
        {
          id: "moonshotai/kimi-k3",
          context: 262144,
          maxoutput: 68000,
          vision: true,
          reasoning: true,
          free: true,
          rank: { score: 60, tier: 1 },
          family: "kimi",
          chattemplatekwargs: { enable_thinking: true },
        },
        {
          id: "deepseek-ai/deepseek-v4-pro-0813",
          context: 1000000,
          maxoutput: 68000,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 55, tier: 1 },
          family: "deepseek",
          chattemplatekwargs: { enable_thinking: true },
        },
        {
          id: "meta/muse-glimmer-30b",
          context: 262144,
          maxoutput: 68000,
          vision: true,
          reasoning: true,
          free: true,
          rank: { score: 50, tier: 1 },
          family: "muse",
          chattemplatekwargs: { enable_thinking: true },
        },
        {
          id: "poolside/laguna-xs-2.1",
          context: 262144,
          maxoutput: 68000,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 0, tier: 4 },
          family: "laguna",
          chattemplatekwargs: { enable_thinking: true },
        },
        // individual catalog
        {
          id: "deepseek-ai/deepseek-v4-flash-0731",
          context: 1000000,
          maxoutput: 68000,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 52, tier: 1 },
          family: "deepseek",
          chattemplatekwargs: { enable_thinking: true },
        },
        {
          id: "nvidia/nemotron-3-ultra-550b-a55b",
          context: 1000000,
          maxoutput: 68000,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 38, tier: 2 },
          family: "nemotron",
          chattemplatekwargs: { enable_thinking: true },
        },
        {
          id: "nvidia/nemotron-3.5-lightning-30b-a3b",
          context: 262144,
          maxoutput: 68000,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 24, tier: 2 },
          family: "nemotron",
          chattemplatekwargs: { enable_thinking: true },
        },
        {
          id: "google/gemma-4-31b-it",
          context: 262144,
          maxoutput: 68000,
          vision: true,
          reasoning: true,
          free: true,
          rank: { score: 30, tier: 2 },
          family: "gemma",
          chattemplatekwargs: { enable_thinking: true },
        },
        {
          id: "nvidia/nemotron-3-super-120b-a12b",
          context: 1000000,
          maxoutput: 68000,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 26, tier: 2 },
          family: "nemotron",
          chattemplatekwargs: { enable_thinking: true },
        },
        {
          id: "openai/gpt-oss-120b",
          context: 131072,
          maxoutput: 68000,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 24, tier: 2 },
          family: "gptoss",
          chattemplatekwargs: { enable_thinking: true },
        },
        {
          id: "nvidia/nemotron-3-nano-30b-a3b",
          context: 1000000,
          maxoutput: 68000,
          vision: false,
          reasoning: true,
          free: true,
          family: "nemotron",
          chattemplatekwargs: { enable_thinking: true },
        },
        {
          id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
          context: 262144,
          maxoutput: 68000,
          vision: true,
          reasoning: true,
          free: true,
          family: "nemotron",
          chattemplatekwargs: { enable_thinking: true },
        },
        {
          id: "openai/gpt-oss-20b",
          context: 131072,
          maxoutput: 68000,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 15, tier: 3 },
          family: "gptoss",
          chattemplatekwargs: { enable_thinking: true },
        },
        {
          id: "mistralai/mistral-nemotron",
          context: 262144,
          maxoutput: 68000,
          vision: false,
          reasoning: true,
          free: true,
          family: "mistral",
          chattemplatekwargs: { enable_thinking: true },
        },
        {
          id: "meta/llama-3.2-90b-vision-instruct",
          context: 131072,
          maxoutput: 68000,
          vision: true,
          reasoning: false,
          free: true,
          family: "llama",
          chattemplatekwargs: {},
        },
        {
          id: "meta/llama-3.2-11b-vision-instruct",
          context: 131072,
          maxoutput: 68000,
          vision: true,
          reasoning: false,
          free: true,
          family: "llama",
          chattemplatekwargs: {},
        },
      ],
      defaultmodel: "devthink",
      rotation: {
        mode: "persession",
        models: [
          "moonshotai/kimi-k3",
          "deepseek-ai/deepseek-v4-pro-0813",
          "meta/muse-glimmer-30b",
          "poolside/laguna-xs-2.1",
        ],
        everynmessages: 6,
        maxmodelrotations: 4,
        rotateonstatus: [529, 404, 410],
        rotateontimeout: true,
        staggernewsessions: false,
        sessionstore: "memory",
      },
      retry: {
        maxretries: 3,
        backoffbasems: 400,
        backoffcapms: 8000,
        jitter: 0.2,
        statuses: [429, 502, 503, 504],
        nonretryable: [400],
        fallback: "none",
      },
      timeout: {
        modelswitchintervalms: 60000,
        requestms: 300000,
        streamms: 2147483647,
      },
      context: {
        restoresessionhistory: true,
        historylimit: 1000,
        truncatemargin: 4096,
        percallfallback: 1048576,
        markshared: true,
      },
      thinking: {
        defaultlevel: "high",
        param: "chattemplatekwargs",
      },
      bodybuild: {
        optionalparamspolicy: "omit-unspecified",
        clampmaxtokens: true,
        maxtokenscap: 68000,
      },
      metamodel: {
        id: "devthink",
        fallbackcontext: 1048576,
        maxoutput: 272000,
        maskupstreammodel: true,
        alwaysdisplay: false,
        pattern: "rotation over 4 nvidia reasoning models 2-calls pattern",
      },
      routes: {
        embeddings: "disabled",
        embeddingsmessage: "nvidia has no embeddings endpoint on this gateway",
      },
      headers: {
        useragent: "DevThink-Gateway/3.0",
      },
    },

    // -----------------------------------------------------------------------
    // v4 — opencode zen plus kilo anonymous free models cross-provider fallback
    // -----------------------------------------------------------------------
    v4: {
      id: "v4",
      name: "V4 OpenCode Kilo",
      providername: "opencode",
      note: "anonymous free tier no api key required model masking to devthink",
      upstreams: [
        { name: "opencode", baseurl: "https://opencode.ai/zen/v1", fallback: "kilo" },
        { name: "kilo", baseurl: "https://api.kilo.ai/api/gateway", fallback: "opencode" },
      ],
      auth: {
        mode: "anonymous",
        required: false,
      },
      models: [
        // opencode zen free models
        {
          id: "muse-spark-1.2-contributor-free",
          context: 131072,
          maxoutput: 16384,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 57, tier: 1 },
          endpoint: "responses",
        },
        {
          id: "deepseek-v4-flash-free",
          context: 1048576,
          maxoutput: 16384,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 52, tier: 1 },
        },
        {
          id: "mimo-v2.5-free",
          context: 1048576,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 43, tier: 1 },
        },
        {
          id: "nemotron-3-ultra-free",
          context: 1048576,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 38, tier: 2 },
          nvidiarouted: true,
        },
        {
          id: "ling-3.0-flash-fin-free",
          context: 262144,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 38, tier: 2 },
        },
        {
          id: "nemotron-3.5-lightning-free",
          context: 1048576,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 24, tier: 2 },
          nvidiarouted: true,
        },
        {
          id: "laguna-s-2.1-free",
          context: 262144,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 0, tier: 4 },
        },
        // kilo free models
        {
          id: "thinkingmachines/inkling:free",
          context: 1048576,
          maxoutput: 262144,
          vision: true,
          reasoning: true,
          free: true,
        },
        {
          id: "tencent/hy3:free",
          context: 262144,
          maxoutput: 128000,
          vision: false,
          reasoning: true,
          free: true,
        },
        {
          id: "thinkingmachines/inkling-small:free",
          context: 1048576,
          maxoutput: 262144,
          vision: true,
          reasoning: true,
          free: true,
        },
        {
          id: "inclusionai/ling-3.0-flash-fin:free",
          context: 262144,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
        },
        {
          id: "nvidia/nemotron-3-ultra-550b-a55b:free",
          context: 1048576,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
          nvidiarouted: true,
        },
        {
          id: "minimax/minimax-m3:free",
          context: 1048576,
          maxoutput: 16384,
          vision: true,
          reasoning: true,
          free: true,
        },
        {
          id: "stepfun/step-3.7-flash:free",
          context: 262144,
          maxoutput: 262144,
          vision: true,
          reasoning: true,
          free: true,
        },
        {
          id: "nvidia/nemotron-3.5-lightning:free",
          context: 1048576,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
          nvidiarouted: true,
        },
        {
          id: "nvidia/nemotron-3-super-120b-a12b:free",
          context: 1048576,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
          nvidiarouted: true,
        },
        {
          id: "cohere/north-mini-code:free",
          context: 256000,
          maxoutput: 64000,
          vision: false,
          reasoning: true,
          free: true,
        },
        {
          id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
          context: 256000,
          maxoutput: 65536,
          vision: true,
          reasoning: true,
          free: true,
          nvidiarouted: true,
        },
        {
          id: "liquid/lfm-2.5-2.6b:free",
          context: 65536,
          maxoutput: 8192,
          vision: false,
          reasoning: true,
          free: true,
        },
        {
          id: "minimax/minimax-m2.7:free",
          context: 196608,
          maxoutput: 196608,
          vision: false,
          reasoning: true,
          free: true,
        },
        {
          id: "dots-studio/dots-3-note-preview:free",
          context: 512000,
          maxoutput: 460800,
          vision: true,
          reasoning: true,
          free: true,
        },
        {
          id: "poolside/laguna-s-2.1:free",
          context: 262144,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
        },
        {
          id: "poolside/laguna-xs-2.1:free",
          context: 262144,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
        },
        {
          id: "nvidia/nemotron-3.5-content-safety:free",
          context: 128000,
          maxoutput: 8192,
          vision: true,
          reasoning: false,
          free: true,
          nvidiarouted: true,
        },
      ],
      defaultmodel: "devthink",
      rotation: {
        mode: "persession",
        models: [
          "muse-spark-1.2-contributor-free",
          "deepseek-v4-flash-free",
          "mimo-v2.5-free",
          "nemotron-3-ultra-free",
          "ling-3.0-flash-fin-free",
          "nemotron-3.5-lightning-free",
          "laguna-s-2.1-free",
          "thinkingmachines/inkling:free",
          "tencent/hy3:free",
          "thinkingmachines/inkling-small:free",
          "inclusionai/ling-3.0-flash-fin:free",
          "nvidia/nemotron-3-ultra-550b-a55b:free",
          "minimax/minimax-m3:free",
          "stepfun/step-3.7-flash:free",
          "nvidia/nemotron-3.5-lightning:free",
          "nvidia/nemotron-3-super-120b-a12b:free",
          "cohere/north-mini-code:free",
          "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
          "liquid/lfm-2.5-2.6b:free",
          "minimax/minimax-m2.7:free",
          "dots-studio/dots-3-note-preview:free",
          "poolside/laguna-s-2.1:free",
          "poolside/laguna-xs-2.1:free",
          "nvidia/nemotron-3.5-content-safety:free",
        ],
        everynmessages: 6,
        maxmodelrotations: 1,
        rotateonstatus: [],
        rotateontimeout: false,
        staggernewsessions: true,
        sessionstore: "memory",
      },
      retry: {
        maxretries: 0,
        backoffbasems: 0,
        statuses: [],
        nonretryable: [400],
        fallbackstatuses: [404, 429, 500, 502, 503, 529],
        fallback: "crossprovider",
      },
      timeout: {
        requestms: 300000,
        streamms: 2147483647,
      },
      context: {
        restoresessionhistory: true,
        historylimit: 1000,
        truncatemargin: 4096,
        percallfallback: 1048576,
        markshared: true,
      },
      thinking: {
        defaultlevel: "high",
        param: "chattemplatekwargs",
      },
      bodybuild: {
        optionalparamspolicy: "omit-unspecified",
        clampmaxtokens: false,
      },
      metamodel: {
        id: "devthink",
        fallbackcontext: 1048576,
        maxoutput: 32768,
        maskupstreammodel: true,
        alwaysdisplay: true,
        pattern: "24 free models across opencode zen and kilo with cross provider fallback",
      },
      routes: {
        embeddings: "disabled",
        embeddingsmessage: "v4 free gateways have no embeddings endpoint",
      },
      headers: {
        useragent: "DevThink-Gateway/4.0",
      },
    },

    // -----------------------------------------------------------------------
    // v5 — openrouter free models single env key per-request rotation
    // -----------------------------------------------------------------------
    v5: {
      id: "v5",
      name: "V5 OpenRouter",
      providername: "openrouter",
      note: "openrouter free tier 19 models per-request round-robin",
      upstreams: [{ name: "openrouter", baseurl: "https://openrouter.ai/api/v1" }],
      auth: {
        mode: "bearer",
        keysources: ["env"],
        envvar: "OPENROUTER_API_KEY",
        keyrotation: "single",
        required: true,
        minkeylength: 10,
        signupurl: "https://openrouter.ai",
        extraheaders: {
          "http-referer": "https://devthink.ai",
          "x-title": "DevThink Gateway",
        },
      },
      models: [
        {
          id: "z-ai/glm-5.2:free",
          context: 1048576,
          maxoutput: 131072,
          vision: false,
          reasoning: true,
          free: true,
          rank: { score: 53, tier: 1 },
          exclusive: true,
        },
        {
          id: "minimax/minimax-m3:free",
          context: 1048576,
          maxoutput: 16384,
          vision: true,
          reasoning: true,
          free: true,
          rank: { score: 45, tier: 1 },
        },
        {
          id: "thinkingmachines/inkling:free",
          context: 1048576,
          maxoutput: 262144,
          vision: true,
          reasoning: true,
          free: true,
        },
        {
          id: "tencent/hy3:free",
          context: 262144,
          maxoutput: 128000,
          vision: false,
          reasoning: true,
          free: true,
        },
        {
          id: "thinkingmachines/inkling-small:free",
          context: 1048576,
          maxoutput: 262144,
          vision: true,
          reasoning: true,
          free: true,
        },
        {
          id: "inclusionai/ling-3.0-flash-fin:free",
          context: 262144,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
        },
        {
          id: "nvidia/nemotron-3-ultra-550b-a55b:free",
          context: 1048576,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
          nvidiarouted: true,
        },
        {
          id: "stepfun/step-3.7-flash:free",
          context: 262144,
          maxoutput: 262144,
          vision: true,
          reasoning: true,
          free: true,
        },
        {
          id: "google/gemma-4-31b-it:free",
          context: 262144,
          maxoutput: 32768,
          vision: true,
          reasoning: true,
          free: true,
          exclusive: true,
        },
        {
          id: "google/gemma-4-26b-a4b-it:free",
          context: 262144,
          maxoutput: 32768,
          vision: true,
          reasoning: true,
          free: true,
          exclusive: true,
        },
        {
          id: "nvidia/nemotron-3-super-120b-a12b:free",
          context: 1048576,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
          nvidiarouted: true,
        },
        {
          id: "nvidia/nemotron-3.5-lightning:free",
          context: 1048576,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
          nvidiarouted: true,
        },
        {
          id: "cohere/north-mini-code:free",
          context: 256000,
          maxoutput: 64000,
          vision: false,
          reasoning: true,
          free: true,
        },
        {
          id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
          context: 256000,
          maxoutput: 65536,
          vision: true,
          reasoning: true,
          free: true,
          nvidiarouted: true,
        },
        {
          id: "liquid/lfm-2.5-2.6b:free",
          context: 65536,
          maxoutput: 8192,
          vision: false,
          reasoning: true,
          free: true,
        },
        {
          id: "minimax/minimax-m2.7:free",
          context: 196608,
          maxoutput: 196608,
          vision: false,
          reasoning: true,
          free: true,
        },
        {
          id: "dots-studio/dots-3-note-preview:free",
          context: 512000,
          maxoutput: 460800,
          vision: true,
          reasoning: true,
          free: true,
        },
        {
          id: "poolside/laguna-s-2.1:free",
          context: 262144,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
        },
        {
          id: "poolside/laguna-xs-2.1:free",
          context: 262144,
          maxoutput: 32768,
          vision: false,
          reasoning: true,
          free: true,
        },
      ],
      defaultmodel: "devthink",
      rotation: {
        mode: "perrequest",
        models: [
          "z-ai/glm-5.2:free",
          "minimax/minimax-m3:free",
          "thinkingmachines/inkling:free",
          "tencent/hy3:free",
          "thinkingmachines/inkling-small:free",
          "inclusionai/ling-3.0-flash-fin:free",
          "nvidia/nemotron-3-ultra-550b-a55b:free",
          "stepfun/step-3.7-flash:free",
          "google/gemma-4-31b-it:free",
          "google/gemma-4-26b-a4b-it:free",
          "nvidia/nemotron-3-super-120b-a12b:free",
          "nvidia/nemotron-3.5-lightning:free",
          "cohere/north-mini-code:free",
          "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
          "liquid/lfm-2.5-2.6b:free",
          "minimax/minimax-m2.7:free",
          "dots-studio/dots-3-note-preview:free",
          "poolside/laguna-s-2.1:free",
          "poolside/laguna-xs-2.1:free",
        ],
        everynmessages: 1,
        maxmodelrotations: 1,
        staggernewsessions: true,
        sessionstore: "memory",
      },
      retry: {
        maxretries: 0,
        statuses: [],
        nonretryable: [400],
        fallback: "none",
      },
      timeout: {
        requestms: 300000,
        streamms: 2147483647,
      },
      context: {
        restoresessionhistory: false,
        truncate: false,
      },
      thinking: {
        defaultlevel: "high",
        param: "chattemplatekwargs",
      },
      bodybuild: {
        optionalparamspolicy: "omit-unspecified",
        clampmaxtokens: false,
      },
      metamodel: {
        id: "devthink",
        fallbackcontext: 1048576,
        maxoutput: 32768,
        maskupstreammodel: true,
        alwaysdisplay: true,
        pattern: "19 openrouter free models per-request round-robin",
      },
      routes: {
        embeddings: "disabled",
        embeddingsmessage: "openrouter has no embeddings endpoint on this gateway",
      },
      headers: {
        useragent: "DevThink-Gateway/5.0",
      },
    },
  },
};

/* (the gatewayviewconfig arm answered the same dual default export shape —
 * the logicfold3 fold converted it to the named gatewayViewConfig seat
 * above, the default retired with the variant file.) */

