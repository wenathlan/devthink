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
    models: "glm-5.3 glm-5.3-flash glm-5.3-fast glm-5.3-air glm-5.2 glm-5.1 glm-5 glm-5v glm-5-turbo glm-4-plus glm-4-flash devthink",
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
