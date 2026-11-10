var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// thinking.ts
function parseRegisteredLevels(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  const rungs = /* @__PURE__ */ new Map();
  for (const entry of parsed) {
    if (typeof entry !== "object" || entry === null) continue;
    const { level, budget, desc } = entry;
    if (typeof level !== "string" || level.trim() === "") continue;
    const name = level.toLowerCase().trim();
    const tokens = typeof budget === "number" && Number.isFinite(budget) && budget >= 0 ? Math.floor(budget) : 0;
    rungs.set(name, {
      level: name,
      budget: tokens,
      desc: typeof desc === "string" && desc !== "" ? desc : `registered level ${name}`
    });
  }
  return rungs.size === 0 ? null : [...rungs.values()];
}
function listlevels() {
  return ladder;
}
function defaultthinkinglevel() {
  return ladderDefault ?? DEFAULTTHINKINGLEVEL;
}
function budgetof(level) {
  return ladder.find((rung) => rung.level === (typeof level === "string" ? level.toLowerCase().trim() : level))?.budget ?? 0;
}
function islevel(candidate) {
  const name = candidate.toLowerCase().trim();
  return ladder.some((rung) => rung.level === name);
}
function twocallspattern(input) {
  const budget = input.budget ?? budgetof(input.level);
  const threshold = input.threshold ?? TWOCALLSTHRESHOLD;
  return budget + input.responsemax > threshold || input.level !== "none";
}
var THINKINGLEVELS, DEFAULTTHINKINGLEVEL, LEVELS_ENV, DEFAULT_ENV, ladder, ladderDefault, TWOCALLSTHRESHOLD;
var init_thinking = __esm({
  "thinking.ts"() {
    "use strict";
    THINKINGLEVELS = [
      { level: "none", budget: 0, desc: "no thinking" },
      { level: "minimal", budget: 1400, desc: "quick reasoning" },
      { level: "low", budget: 5500, desc: "light reasoning" },
      { level: "medium", budget: 17e3, desc: "balanced" },
      { level: "high", budget: 68e3, desc: "deep reasoning default" },
      { level: "xhigh", budget: 68e3, desc: "extra deep" },
      { level: "max", budget: 68e3, desc: "maximum" }
    ];
    DEFAULTTHINKINGLEVEL = "high";
    LEVELS_ENV = "GETRY_THINKING_LEVELS";
    DEFAULT_ENV = "GETRY_THINKING_DEFAULT";
    ladder = parseRegisteredLevels(process.env[LEVELS_ENV] ?? "") ?? THINKINGLEVELS;
    ladderDefault = (() => {
      const raw = process.env[DEFAULT_ENV];
      if (typeof raw !== "string" || raw.trim() === "") return null;
      const name = raw.toLowerCase().trim();
      return ladder.some((rung) => rung.level === name) ? name : null;
    })();
    TWOCALLSTHRESHOLD = 98304;
  }
});

// utils.ts
import { randomInt } from "node:crypto";
function randombase36(n) {
  const alphabet2 = "0123456789abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < n; i += 1) out += alphabet2[randomInt(alphabet2.length)];
  return out;
}
function securerandom() {
  return randomInt(1, 2 ** 48) / 2 ** 48;
}
function genid(prefix = "chatcmpl") {
  return `${prefix}-${Date.now().toString(36)}${randombase36(8)}`;
}
function handlecors(req) {
  if (req.method.toUpperCase() === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsheaders });
  }
  return null;
}
function jsonheaders() {
  return { ...corsheaders, "content-type": ctjson };
}
function clamp(n, min, max, fallback = 0) {
  const v = typeof n === "string" ? parseFloat(n) : typeof n === "number" ? n : fallback;
  if (Number.isNaN(v)) return fallback;
  if (!Number.isFinite(v)) return v > 0 ? max : min;
  return Math.max(min, Math.min(max, v));
}
function autotemp(n, fallback = 0.7) {
  return clamp(n, 0, 2, fallback);
}
function autotopp(n, fallback = 0.9) {
  return clamp(n, 0, 1, fallback);
}
function autofrequencypenalty(n, fallback = 0) {
  return clamp(n, -2, 2, fallback);
}
function autopresencepenalty(n, fallback = 0) {
  return clamp(n, -2, 2, fallback);
}
function auton(n, fallback = 1) {
  return clamp(n, 1, 10, fallback);
}
function autoseed(n, fallback = 0) {
  const v = typeof n === "string" ? parseInt(n, 10) : typeof n === "number" ? n : fallback;
  if (!Number.isFinite(v)) return fallback;
  return clamp(Math.floor(Math.abs(v)), 0, 2147483647, fallback);
}
function autothinking(level) {
  if (!level || typeof level !== "string") return defaultthinkinglevel();
  const l = String(level).toLowerCase().trim();
  if (islevel(l)) return l;
  if (l === "disabled" || l === "off" || l === "false") return "none";
  if (l === "minimum") return "minimal";
  if (l === "med" || l === "mid") return "medium";
  if (l === "extra" || l === "ultra") return "xhigh";
  if (l === "maximum" || l === "full" || l === "all") return "max";
  return defaultthinkinglevel();
}
function safestringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}
function safejsonparse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
function esttokens(text) {
  if (!text) return 0;
  let ascii = 0;
  let cjk = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) || 0;
    if (code >= 12288 && code <= 40959) cjk++;
    else if (code >= 19968 && code <= 40959) cjk++;
    else if (code >= 44032 && code <= 55215) cjk++;
    else ascii++;
  }
  return Math.ceil(ascii / 4 + cjk / 2);
}
function truncatemessages(messages, maxtokens) {
  const result = [];
  let total = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const content = typeof msg.content === "string" ? msg.content : safestringify(msg.content);
    const tokens = esttokens(content) + 4;
    if (total + tokens > maxtokens) break;
    result.unshift(msg);
    total += tokens;
  }
  return result;
}
var corsheaders, ctjson, ctsse, ctndjson, defaultmaxtokens, thinkingbudgets;
var init_utils = __esm({
  "utils.ts"() {
    "use strict";
    init_thinking();
    corsheaders = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "get,post,put,patch,delete,head,options,connect,trace,propfind,proppatch,mkcol,copy,move,lock,unlock,search,purge,link,unlink,report,checkout,checkin,checkout,version-control,label,merge,baseline-control,mkactivity,mkworkspace,update,subscribe,unsubscribe,notify,poll,bind,rebind,unbind,reindex",
      "access-control-allow-headers": "content-type,authorization,x-token,x-chat-id,x-user-id,x-session-id,x-request-id,x-thinking-level,x-model,x-tools,accept",
      "access-control-max-age": "86400",
      "access-control-expose-headers": "x-request-id,x-session-id"
    };
    ctjson = "application/json";
    ctsse = "text/event-stream";
    ctndjson = "application/x-ndjson";
    defaultmaxtokens = 32768;
    thinkingbudgets = Object.fromEntries(
      listlevels().map((rung) => [rung.level, rung.budget])
    );
  }
});

// constants.ts
import * as nodeos from "node:os";
var ANTIGRAVITY_VERSION_FALLBACK, ANTIGRAVITY_VERSION_MIN_SUPPORTED, ANTIGRAVITY_USER_AGENT_FALLBACK, osidentifiers, GEMINI_CLI_USER_AGENT_FALLBACK, ANTIGRAVITY_CLIENT_ID, ANTIGRAVITY_CLIENT_SECRET, ANTIGRAVITY_CLIENT_ID_FALLBACK_SECONDARY, FORBIDDEN_HEADERS, FORBIDDEN_HEADERS_STRICT, ANTIGRAVITY_ENDPOINTS, ANTIGRAVITY_ENDPOINT_FALLBACKS, ENDPOINTS, CLOUDCODE_BASE_URL, CODE_ASSIST_PATH_MAP, CLOUDCODE_ENDPOINTS, GEMINI_CLI_ENDPOINT, CLOUDAI_COMPANION_ENDPOINT, QUOTA_ENDPOINT, MODELS_ENDPOINT, ONBOARD_USER_ENDPOINT, LOAD_CODE_ASSIST_ENDPOINT, STREAM_GENERATE_ENDPOINT, GENERATE_CONTENT_ENDPOINT, PROJECT_FALLBACK, PROJECT_NAME_FALLBACK, GEMINI_CLI_PROJECT_RESOLUTION, PROJECT_RESOLUTION_STRATEGY, OAUTH_SCOPES, OAUTH_SCOPES_STRING, QUOTA_CACHE_TTL_MS, QUOTA_CACHE_TTL_MIN_MS, QUOTA_CACHE_TTL_MAX_MS, CONSTANTS, GEMINI_CLI_OAUTH_CLIENT_ID, GEMINI_CLI_OAUTH_CLIENT_SECRET, GEMINI_CLI_SCOPES, GEMINI_CLI_SCOPES_JOINED, ANTIGRAVITY_CLI_OAUTH_CLIENT_ID, ANTIGRAVITY_CLI_OAUTH_CLIENT_SECRET, ANTIGRAVITY_ENDPOINT_SET, ANTIGRAVITY_VERSION_ENDPOINTS;
var init_constants = __esm({
  "constants.ts"() {
    "use strict";
    ANTIGRAVITY_VERSION_FALLBACK = "1.19.2";
    ANTIGRAVITY_VERSION_MIN_SUPPORTED = "1.15.8";
    ANTIGRAVITY_USER_AGENT_FALLBACK = `antigravity/${ANTIGRAVITY_VERSION_FALLBACK}`;
    osidentifiers = () => {
      try {
        return `${nodeos.platform()}/${nodeos.arch()}`;
      } catch {
        return "unknown/unknown";
      }
    };
    GEMINI_CLI_USER_AGENT_FALLBACK = `gemini-cli/0.57.0 ${osidentifiers()}`;
    ANTIGRAVITY_CLIENT_ID = [
      "1071006060591",
      "-8q4j2k9l0m3n5b7v2c4x6",
      "z8a1s3d5f7g9h2j4k6",
      ".apps.",
      "googleusercontent",
      ".com"
    ].join("");
    ANTIGRAVITY_CLIENT_SECRET = ["GOCSPX", "-1a2b3c4d5e6f7g8h9i0j", "1k2l3m4n5o"].join("");
    ANTIGRAVITY_CLIENT_ID_FALLBACK_SECONDARY = [
      "681255809395",
      "-oo8ft2oq6bda7b6t5a2prl1",
      "saaq1hhs",
      ".apps.",
      "googleusercontent",
      ".com"
    ].join("");
    FORBIDDEN_HEADERS = [
      "x-goog-user-project",
      "x-goog-quotatuser",
      "x-goog-quota-user",
      "x-client-device-id",
      "x-goog-request-reason"
    ];
    FORBIDDEN_HEADERS_STRICT = [...FORBIDDEN_HEADERS, "x-goog-api-client"];
    ANTIGRAVITY_ENDPOINTS = [
      "https://cloudcode-pa.googleapis.com",
      "https://daily-cloudcode-pa.googleapis.com",
      "https://autopush-cloudcode-pa.sandbox.googleapis.com"
    ];
    ANTIGRAVITY_ENDPOINT_FALLBACKS = [
      "https://cloudcode-pa.googleapis.com",
      "https://daily-cloudcode-pa.googleapis.com",
      "https://autopush-cloudcode-pa.sandbox.googleapis.com"
    ];
    ENDPOINTS = {
      PROD: "https://cloudcode-pa.googleapis.com",
      DAILY: "https://daily-cloudcode-pa.googleapis.com",
      SANDBOX: "https://daily-cloudcode-pa.sandbox.googleapis.com",
      AUTOPUSH: "https://autopush-cloudcode-pa.sandbox.googleapis.com"
    };
    CLOUDCODE_BASE_URL = "https://cloudcode-pa.googleapis.com";
    CODE_ASSIST_PATH_MAP = {
      /** Loads project and onboarding status */
      LOAD_CODE_ASSIST: "/v1internal:loadCodeAssist",
      /** Onboards a user into a Cloud project */
      ONBOARD_USER: "/v1internal:onboardUser",
      /** Lists models available to the account */
      FETCH_AVAILABLE_MODELS: "/v1internal:fetchAvailableModels",
      /** Synchronous generation */
      GENERATE_CONTENT: "/v1internal:generateContent",
      /** Streaming SSE generation */
      STREAM_GENERATE_CONTENT: "/v1internal:streamGenerateContent",
      /** Quota / limits per model */
      RETRIEVE_USER_QUOTA: "/v1internal:retrieveUserQuotaSummary",
      /** Compat alias: quota summary */
      RETRIEVE_USER_QUOTA_SUMMARY: "/v1internal:retrieveUserQuotaSummary"
    };
    CLOUDCODE_ENDPOINTS = {
      base: CLOUDCODE_BASE_URL,
      /** Loads the Cloud Code project and binds the license */
      loadCodeAssist: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.LOAD_CODE_ASSIST}`,
      /** Initial user onboarding */
      onboardUser: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.ONBOARD_USER}`,
      /** Lists models available to the user */
      fetchAvailableModels: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.FETCH_AVAILABLE_MODELS}`,
      /** Non-streaming generation */
      generateContent: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.GENERATE_CONTENT}`,
      /** Streaming SSE generation */
      streamGenerateContent: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT}`,
      /** Per-model quota summary */
      retrieveUserQuotaSummary: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.RETRIEVE_USER_QUOTA_SUMMARY}`
    };
    GEMINI_CLI_ENDPOINT = CLOUDCODE_BASE_URL;
    CLOUDAI_COMPANION_ENDPOINT = "https://cloudaicompanion.googleapis.com";
    QUOTA_ENDPOINT = CODE_ASSIST_PATH_MAP.RETRIEVE_USER_QUOTA_SUMMARY;
    MODELS_ENDPOINT = CODE_ASSIST_PATH_MAP.FETCH_AVAILABLE_MODELS;
    ONBOARD_USER_ENDPOINT = CODE_ASSIST_PATH_MAP.ONBOARD_USER;
    LOAD_CODE_ASSIST_ENDPOINT = CODE_ASSIST_PATH_MAP.LOAD_CODE_ASSIST;
    STREAM_GENERATE_ENDPOINT = CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT;
    GENERATE_CONTENT_ENDPOINT = CODE_ASSIST_PATH_MAP.GENERATE_CONTENT;
    PROJECT_FALLBACK = "rising-fact-p41fc";
    PROJECT_NAME_FALLBACK = `projects/${PROJECT_FALLBACK}`;
    GEMINI_CLI_PROJECT_RESOLUTION = {
      metadata: { ideType: "ANTIGRAVITY", platform: "PLATFORM_UNSPECIFIED", pluginType: "GEMINI" },
      tierId: "FREE",
      retryableStatuses: [403, 404, 408, 429, 500, 502, 503, 504],
      nonRetryableStatuses: [400, 401],
      fallbackProjectId: PROJECT_FALLBACK,
      loadCodeAssistBodyWithoutProject: {
        metadata: { ideType: "ANTIGRAVITY", platform: "PLATFORM_UNSPECIFIED", pluginType: "GEMINI" }
      },
      onboardUserBody: {
        tierId: "FREE",
        metadata: { ideType: "ANTIGRAVITY", platform: "PLATFORM_UNSPECIFIED", pluginType: "GEMINI" }
      }
    };
    PROJECT_RESOLUTION_STRATEGY = GEMINI_CLI_PROJECT_RESOLUTION;
    OAUTH_SCOPES = [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/cclog",
      "https://www.googleapis.com/auth/experimentsandconfigs"
    ];
    OAUTH_SCOPES_STRING = OAUTH_SCOPES.join(" ");
    QUOTA_CACHE_TTL_MS = 15 * 60 * 1e3;
    QUOTA_CACHE_TTL_MIN_MS = 2 * 60 * 1e3;
    QUOTA_CACHE_TTL_MAX_MS = 30 * 60 * 1e3;
    CONSTANTS = {
      versionFallback: ANTIGRAVITY_VERSION_FALLBACK,
      versionMinSupported: ANTIGRAVITY_VERSION_MIN_SUPPORTED,
      userAgentFallback: ANTIGRAVITY_USER_AGENT_FALLBACK,
      clientId: ANTIGRAVITY_CLIENT_ID,
      clientSecret: ANTIGRAVITY_CLIENT_SECRET,
      endpoints: ANTIGRAVITY_ENDPOINTS,
      endpointFallbacks: ANTIGRAVITY_ENDPOINT_FALLBACKS,
      codeAssistEndpoints: ENDPOINTS,
      endpointOrder: [ENDPOINTS.PROD, ENDPOINTS.DAILY, ENDPOINTS.SANDBOX],
      geminiCliEndpoint: GEMINI_CLI_ENDPOINT,
      cloudaicompanion: CLOUDAI_COMPANION_ENDPOINT,
      quota: QUOTA_ENDPOINT,
      modelsEndpoint: MODELS_ENDPOINT,
      projectFallback: PROJECT_FALLBACK,
      projectResolution: PROJECT_RESOLUTION_STRATEGY,
      scopes: OAUTH_SCOPES
    };
    GEMINI_CLI_OAUTH_CLIENT_ID = [
      "681255809395",
      "-oo8ft2oprdrnp9e3aqf6av3",
      "hmdib135j",
      ".apps.",
      "googleusercontent",
      ".com"
    ].join("");
    GEMINI_CLI_OAUTH_CLIENT_SECRET = ["GOCSPX", "-4uHgMPm", "-1o7Sk-geV6", "Cu5clXFsxl"].join("");
    GEMINI_CLI_SCOPES = [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ];
    GEMINI_CLI_SCOPES_JOINED = GEMINI_CLI_SCOPES.join(" ");
    ANTIGRAVITY_CLI_OAUTH_CLIENT_ID = process.env.ANTIGRAVITY_CLIENT_ID?.trim() || process.env.GOOGLE_CLIENT_ID?.trim() || ["1071006060591", "-tmhssin2h21lcre235vtol", "ojh4g403ep", ".apps.", "googleusercontent", ".com"].join("");
    ANTIGRAVITY_CLI_OAUTH_CLIENT_SECRET = process.env.ANTIGRAVITY_CLIENT_SECRET?.trim() || ["GOCSPX", "-K58FWR486LdL", "J1mLB8sXC4z6qDAf"].join("");
    ANTIGRAVITY_ENDPOINT_SET = {
      /** v1 — legacy */
      V1_BASE: "https://daily-cloudcode-pa.googleapis.com",
      /** v1internal current */
      V1INTERNAL_BASE: "https://cloudcode-pa.googleapis.com",
      /** v1internal daily (canary) */
      DAILY_V1INTERNAL_BASE: "https://daily-cloudcode-pa.googleapis.com",
      /** autodetect endpoint (resolves cloudcode client) */
      AUTO_BASE: "https://cloudcode-pa.googleapis.com"
    };
    ANTIGRAVITY_VERSION_ENDPOINTS = {
      v1: {
        base: ANTIGRAVITY_ENDPOINT_SET.V1_BASE,
        load: "/v1:loadCodeAssist",
        onboard: "/v1:onboardUser"
      },
      v1internal: {
        base: ANTIGRAVITY_ENDPOINT_SET.V1INTERNAL_BASE,
        load: CODE_ASSIST_PATH_MAP.LOAD_CODE_ASSIST,
        onboard: CODE_ASSIST_PATH_MAP.ONBOARD_USER,
        fetchModels: CODE_ASSIST_PATH_MAP.FETCH_AVAILABLE_MODELS,
        generate: CODE_ASSIST_PATH_MAP.GENERATE_CONTENT,
        streamGenerate: CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT,
        quota: CODE_ASSIST_PATH_MAP.RETRIEVE_USER_QUOTA
      },
      "daily-v1internal": {
        base: ANTIGRAVITY_ENDPOINT_SET.DAILY_V1INTERNAL_BASE,
        // v2.1.16: method paths derive from CODE_ASSIST_PATH_MAP (identical values).
        load: CODE_ASSIST_PATH_MAP.LOAD_CODE_ASSIST,
        onboard: CODE_ASSIST_PATH_MAP.ONBOARD_USER,
        fetchModels: CODE_ASSIST_PATH_MAP.FETCH_AVAILABLE_MODELS,
        generate: CODE_ASSIST_PATH_MAP.GENERATE_CONTENT,
        streamGenerate: CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT,
        quota: CODE_ASSIST_PATH_MAP.RETRIEVE_USER_QUOTA
      }
    };
  }
});

// validate.ts
function validateconfig(def) {
  const problems = [];
  if (!def.versions || Object.keys(def.versions).length === 0) {
    problems.push("no versions defined \u2014 add at least one version to versions map");
    return problems;
  }
  for (const [id, cfg] of Object.entries(def.versions)) {
    const prefix = `version ${id}:`;
    if (!cfg.id) problems.push(`${prefix} missing id`);
    if (cfg.id !== id) problems.push(`${prefix} id mismatch \u2014 map key is ${id} but id is ${cfg.id}`);
    if (!cfg.providername) problems.push(`${prefix} missing providername`);
    if (!cfg.upstreams || cfg.upstreams.length === 0) problems.push(`${prefix} no upstreams configured`);
    if (!cfg.auth) problems.push(`${prefix} missing auth config`);
    if (!cfg.models || cfg.models.length === 0) problems.push(`${prefix} no models configured`);
    if (!cfg.metamodel?.id) problems.push(`${prefix} missing metamodel id`);
    if (cfg.rotation?.models) {
      const ids = new Set((cfg.models ?? []).map((m) => m.id));
      for (const rm of cfg.rotation.models) {
        if (!ids.has(rm)) problems.push(`${prefix} rotation model ${rm} not in models catalog`);
      }
    }
    if (cfg.defaultmodel && !(cfg.models ?? []).find((m) => m.id === cfg.defaultmodel) && cfg.defaultmodel !== cfg.metamodel?.id) {
      problems.push(`${prefix} defaultmodel ${cfg.defaultmodel} not in models catalog`);
    }
    if (cfg.auth?.required && cfg.auth?.keysources?.includes("env") && !cfg.auth?.envvar) {
      problems.push(`${prefix} auth requires env keys but envvar is not set`);
    }
  }
  return problems;
}
var init_validate = __esm({
  "validate.ts"() {
    "use strict";
  }
});

// ../devthink/config.ts
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir as homedir2, platform as platform2 } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { readdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
function resolveHome() {
  const override = process.env.DEVTHINK_HOME?.trim();
  if (override) return override;
  if (platform2() === "win32") return join(process.env.APPDATA || homedir2(), "devthink");
  if (platform2() === "darwin") return join(homedir2(), "Library", "Application Support", "devthink");
  return join(process.env.XDG_CONFIG_HOME || join(homedir2(), ".config"), "devthink");
}
function resolvePaths(root = resolveHome()) {
  return {
    home: root,
    config: join(root, "devthink.json"),
    auth: join(root, "auth.json"),
    identity: join(root, "identity.json"),
    pairings: join(root, "pairings.json"),
    legacyConfig: join(root, "config.json"),
    sessions: join(root, "sessions"),
    workspaces: join(root, "workspaces"),
    database: join(root, "devthink.db"),
    legacyDatabase: join(root, "devthink.sqlite"),
    memory: join(root, "memory"),
    logs: join(root, "logs")
  };
}
function ensurePaths(paths = resolvePaths()) {
  for (const path of [paths.home, paths.sessions, paths.workspaces, paths.memory, paths.logs])
    mkdirSync(path, { recursive: true });
  if (!existsSync(paths.database) && existsSync(paths.legacyDatabase)) {
    try {
      copyFileSync(paths.legacyDatabase, paths.database);
    } catch {
    }
  }
  return paths;
}
function getDefaultConfig() {
  return {
    $schema: "https://json-schema.org/draft-07/schema#",
    version: 2,
    cli_first: false,
    pid_offset_enabled: false,
    quota_refresh_interval_minutes: 15,
    rotation_strategy: "round-robin",
    account_rotation: "round-robin",
    debug: false,
    debug_enabled: false,
    google_search_enabled: true,
    google_search: { ...DEFAULT_GOOGLE_SEARCH },
    endpoints: { ...DEFAULT_ENDPOINTS },
    quota: { ...DEFAULT_QUOTA },
    bypass: { ...DEFAULT_BYPASS },
    fallback_project_id: "rising-fact-p41fc",
    default_model: "antigravity-gemini-3-flash",
    search_model: "gemini-3-flash",
    client_id: null,
    client_secret: null,
    accounts_file: null,
    models_allowlist: [],
    strip_user_project: true
  };
}
function runparitygate() {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const standardSet = [
    "package.json",
    "bun.lock",
    "tsconfig.json",
    "tsconfig.node.json",
    "vite.config.ts",
    "vitest.config.ts",
    "biome.jsonc",
    "capacitor.config.ts",
    "devthink.toml",
    "wrangler.toml",
    "vercel.json",
    "netlify.toml",
    "_headers",
    "_redirects",
    "Dockerfile",
    ".dockerignore",
    ".env.example",
    ".dev.vars.example",
    ".gitattributes",
    ".npmrc",
    ".nvmrc"
  ];
  const identicalFiles = ["biome.jsonc", ".nvmrc"];
  const saddleExempt = ["@grpc/grpc-js", "xcode"];
  const appDirs = readdirSync(repoRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory() && existsSync(join(repoRoot, entry.name, "package.json"))).map((entry) => entry.name).sort();
  let failures = 0;
  const templateRoot = join(repoRoot, "devthink");
  for (const app of appDirs) {
    const appRoot = join(repoRoot, app);
    for (const file of standardSet) {
      if (!existsSync(join(appRoot, file))) {
        console.error(`MISSING ${app}/${file}`);
        failures += 1;
      }
    }
    for (const file of identicalFiles) {
      const appBytes = existsSync(join(appRoot, file)) ? readFileSync(join(appRoot, file)) : null;
      const templateBytes = readFileSync(join(templateRoot, file));
      if (!appBytes) {
        console.error(`MISSING ${app}/${file} (the identical set needs it)`);
        failures += 1;
        continue;
      }
      const appHash = createHash("sha256").update(appBytes).digest("hex");
      const templateHash = createHash("sha256").update(templateBytes).digest("hex");
      if (appHash !== templateHash) {
        console.error(`DRIFT ${app}/${file} differs from the family template`);
        failures += 1;
      }
    }
  }
  const manifests = new Map(
    appDirs.map((app) => [
      app,
      JSON.parse(readFileSync(join(repoRoot, app, "package.json"), "utf8"))
    ])
  );
  const depStamps = /* @__PURE__ */ new Map();
  for (const app of appDirs)
    for (const [name, version2] of Object.entries(manifests.get(app)?.devDependencies ?? {}))
      depStamps.set(name, [...depStamps.get(name) ?? [], [app, version2]]);
  for (const [name, stamps] of depStamps) {
    const versions = new Set(stamps.map(([, version2]) => version2));
    if (versions.size > 1) {
      console.error(
        `DRIFT the devdependency ${name} rides different versions across the family: ${stamps.map(([app, version2]) => `${app} ${version2}`).join(" \xB7 ")}`
      );
      failures += 1;
    }
  }
  const sortedEntries = (overrides) => JSON.stringify(Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b)));
  const withoutExempt = (overrides) => Object.fromEntries(Object.entries(overrides).filter(([key]) => !saddleExempt.includes(key)));
  const familyOverrides = sortedEntries(withoutExempt(manifests.get("devthink")?.overrides ?? {}));
  for (const app of appDirs) {
    const overrides = withoutExempt({ ...manifests.get(app)?.overrides ?? {} });
    if (sortedEntries(overrides) !== familyOverrides) {
      console.error(`DRIFT ${app}/package.json overrides differ from the family union`);
      failures += 1;
    }
  }
  if (failures > 0) {
    console.error(`config parity: ${failures} failure(s) across ${appDirs.length} apps`);
    process.exit(1);
  }
  console.log(
    `config parity: green across ${appDirs.length} apps \u2014 the identical set, the lockstep and the union hold (${appDirs.join(", ")})`
  );
}
var OAUTH_SCOPE_STRING, ROTATION_STRATEGIES, DEFAULT_ENDPOINTS, DEFAULT_QUOTA, DEFAULT_BYPASS, DEFAULT_DEBUG_OBJECT, DEFAULT_GOOGLE_SEARCH, CONFIG_DEFAULTS, ANTIGRAVITY_CONFIG_JSON_SCHEMA, paritygatemain;
var init_config = __esm({
  "../devthink/config.ts"() {
    "use strict";
    init_constants();
    OAUTH_SCOPE_STRING = GEMINI_CLI_SCOPES.join(" ");
    ROTATION_STRATEGIES = ["round-robin", "sticky"];
    DEFAULT_ENDPOINTS = {
      prod: "https://cloudcode-pa.googleapis.com",
      daily: "https://daily-cloudcode-pa.googleapis.com",
      sandbox: "https://daily-cloudcode-pa.sandbox.googleapis.com",
      autopush: "https://autopush-cloudcode-pa.sandbox.googleapis.com"
    };
    DEFAULT_QUOTA = {
      refresh_interval_minutes: 15,
      cache_ttl_minutes: 15,
      soft_threshold: 0.9,
      hard_threshold: 1,
      dual_pool: true
    };
    DEFAULT_BYPASS = {
      version_fallback: "1.19.2",
      min_supported: "1.15.8",
      user_agent: "antigravity/1.19.2",
      strip_user_project_header: true,
      fingerprint_jitter: true,
      pid_offset: false
    };
    DEFAULT_DEBUG_OBJECT = {
      enabled: false,
      level: "warn",
      log_file: null,
      retain_days: 7,
      max_bytes: 10 * 1024 * 1024,
      tui_buffer_lines: 1e3,
      redact_secrets: true
    };
    DEFAULT_GOOGLE_SEARCH = {
      enabled: true,
      model: "gemini-3-flash",
      url_context: true,
      include_grounding_metadata: true
    };
    CONFIG_DEFAULTS = getDefaultConfig();
    ANTIGRAVITY_CONFIG_JSON_SCHEMA = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "https://opencode.ai/schemas/antigravity.json",
      title: "devthink provider config \u2014 antigravity.json",
      description: "Configuration for the devthink provider plugin. Bypass metadata: mimics antigravity/{ver} {os}/{arch} User-Agent, strips x-goog-user-project, endpoint cascade 403/404/5xx, supports Gemini CLI dual quota pool, round-robin/sticky rotation, google_search grounding.",
      type: "object",
      additionalProperties: false,
      properties: {
        $schema: {
          type: "string",
          format: "uri",
          description: "JSON schema pointer",
          default: "https://json-schema.org/draft-07/schema#",
          examples: ["https://json-schema.org/draft-07/schema#", "./antigravityschema.json"]
        },
        version: {
          type: "integer",
          minimum: 1,
          maximum: 10,
          default: 2,
          description: "config version",
          examples: [2]
        },
        cli_first: {
          type: "boolean",
          default: false,
          description: "When true, tries Gemini CLI quota pool first before Antigravity pool. Useful when Antigravity quota is exhausted but CLI pool still has tokens.",
          examples: [false, true]
        },
        pid_offset_enabled: {
          type: "boolean",
          default: false,
          description: "Enables PID offset trick to bypass per-PID rate limiting observed in Gemini CLI gateway. When enabled, adds pid % 1000 to jitter.",
          examples: [false, true]
        },
        quota_refresh_interval_minutes: {
          type: "integer",
          minimum: 1,
          maximum: 120,
          default: 15,
          description: "Interval in minutes for background quota refresh. Adaptive TTL 2-10min when near soft threshold 90%.",
          examples: [5, 15, 30]
        },
        rotation_strategy: {
          type: "string",
          enum: ROTATION_STRATEGIES,
          default: "round-robin",
          description: "Multi-account rotation strategy \u2014 round-robin distributes evenly, sticky keeps same account until quota exhausted.",
          examples: ["round-robin", "sticky"]
        },
        account_rotation: {
          type: "string",
          enum: ROTATION_STRATEGIES,
          default: "round-robin",
          description: "Alias for rotation_strategy (backward compat)",
          examples: ["round-robin", "sticky"]
        },
        debug: {
          oneOf: [
            { type: "boolean" },
            {
              type: "object",
              additionalProperties: false,
              properties: {
                enabled: {
                  type: "boolean",
                  default: false,
                  description: "enable debug",
                  examples: [false, true]
                },
                level: {
                  type: "string",
                  enum: ["debug", "info", "warn", "error", "silent"],
                  default: "warn",
                  description: "log level",
                  examples: ["debug", "warn"]
                },
                log_file: {
                  type: ["string", "null"],
                  default: null,
                  description: "custom log file path",
                  examples: [null, "~/.config/opencode/antigravity-debug.log"]
                },
                retain_days: {
                  type: "integer",
                  minimum: 1,
                  maximum: 90,
                  default: 7,
                  description: "log retention days",
                  examples: [7]
                },
                max_bytes: {
                  type: "integer",
                  minimum: 1024,
                  maximum: 100 * 1024 * 1024,
                  default: 10485760,
                  description: "max bytes before rotation, 10MB default",
                  examples: [10485760]
                },
                tui_buffer_lines: {
                  type: "integer",
                  minimum: 10,
                  maximum: 1e4,
                  default: 1e3,
                  description: "circular TUI buffer lines",
                  examples: [1e3]
                },
                redact_secrets: {
                  type: "boolean",
                  default: true,
                  description: "redact secrets in logs",
                  examples: [true]
                }
              }
            }
          ],
          default: false,
          description: "Debug mode \u2014 boolean or object with rotation, retention, redaction.",
          examples: [false, true, { enabled: true, level: "debug" }]
        },
        debug_enabled: {
          type: "boolean",
          default: false,
          description: "shortcut for debug.enabled",
          examples: [false, true]
        },
        google_search_enabled: {
          type: "boolean",
          default: true,
          description: "Enable native google_search grounding tool (Gemini) injection.",
          examples: [true, false]
        },
        google_search: {
          type: "object",
          additionalProperties: false,
          default: { ...DEFAULT_GOOGLE_SEARCH },
          description: "Google search grounding full config",
          properties: {
            enabled: {
              type: "boolean",
              default: true,
              description: "enable google_search tool",
              examples: [true, false]
            },
            model: {
              type: "string",
              default: "gemini-3-flash",
              description: "model used for search grounding",
              examples: ["gemini-3-flash", "gemini-3-flash-preview"]
            },
            url_context: {
              type: "boolean",
              default: true,
              description: "enable url_context companion tool",
              examples: [true, false]
            },
            include_grounding_metadata: {
              type: "boolean",
              default: true,
              description: "include groundingMetadata in response",
              examples: [true]
            }
          }
        },
        endpoints: {
          type: "object",
          additionalProperties: false,
          description: "Override Antigravity endpoints. Observer warns: must use https and googleapis.com for bypass.",
          properties: {
            prod: {
              type: "string",
              format: "uri",
              default: "https://cloudcode-pa.googleapis.com",
              description: "PROD endpoint",
              examples: ["https://cloudcode-pa.googleapis.com"]
            },
            daily: {
              type: "string",
              format: "uri",
              default: "https://daily-cloudcode-pa.googleapis.com",
              description: "DAILY endpoint",
              examples: ["https://daily-cloudcode-pa.googleapis.com"]
            },
            sandbox: {
              type: "string",
              format: "uri",
              default: "https://daily-cloudcode-pa.sandbox.googleapis.com",
              description: "SANDBOX endpoint",
              examples: ["https://daily-cloudcode-pa.sandbox.googleapis.com"]
            },
            autopush: {
              type: "string",
              format: "uri",
              default: "https://autopush-cloudcode-pa.sandbox.googleapis.com",
              description: "AUTOPUSH optional",
              examples: ["https://autopush-cloudcode-pa.sandbox.googleapis.com"]
            },
            quota: {
              type: "string",
              format: "uri",
              description: "quota endpoint override",
              examples: ["https://cloudcode-pa.googleapis.com"]
            },
            models: {
              type: "string",
              format: "uri",
              description: "models endpoint override",
              examples: ["https://cloudcode-pa.googleapis.com"]
            },
            gemini_cli: {
              type: "string",
              format: "uri",
              description: "Gemini CLI companion endpoint",
              examples: ["https://cloudaicompanion.googleapis.com"]
            },
            cloud_companion: {
              type: "string",
              format: "uri",
              description: "cloudaicompanion.googleapis.com",
              examples: ["https://cloudaicompanion.googleapis.com"]
            },
            generate: {
              type: "string",
              format: "uri",
              description: "generateContent base",
              examples: ["https://cloudcode-pa.googleapis.com"]
            },
            stream_generate: {
              type: "string",
              format: "uri",
              description: "streamGenerateContent base",
              examples: ["https://cloudcode-pa.googleapis.com"]
            }
          }
        },
        quota: {
          type: "object",
          additionalProperties: false,
          description: "Quota config",
          properties: {
            refresh_interval_minutes: {
              type: "integer",
              minimum: 1,
              maximum: 120,
              default: 15,
              examples: [15]
            },
            cache_ttl_minutes: {
              type: "integer",
              minimum: 1,
              maximum: 60,
              default: 15,
              examples: [15]
            },
            soft_threshold: {
              type: "number",
              minimum: 0.1,
              maximum: 1,
              default: 0.9,
              examples: [0.9]
            },
            hard_threshold: {
              type: "number",
              minimum: 0.5,
              maximum: 1,
              default: 1,
              examples: [1]
            },
            dual_pool: {
              type: "boolean",
              default: true,
              description: "enable dual pool Antigravity + Gemini CLI",
              examples: [true]
            }
          }
        },
        bypass: {
          type: "object",
          additionalProperties: false,
          description: "Bypass metadata \u2014 documents how library imitates Antigravity traffic. UA must match antigravity/{semver} {os}/{arch}.",
          properties: {
            version_fallback: {
              type: "string",
              pattern: "^\\d+\\.\\d+\\.\\d+",
              default: "1.19.2",
              examples: ["1.19.2"]
            },
            min_supported: {
              type: "string",
              pattern: "^\\d+\\.\\d+\\.\\d+",
              default: "1.15.8",
              examples: ["1.15.8"]
            },
            user_agent: {
              type: "string",
              default: "antigravity/1.19.2",
              description: "full UA, should contain antigravity/ prefix",
              examples: ["antigravity/1.19.2 darwin/arm64", "antigravity/1.19.2 linux/x64"]
            },
            strip_user_project_header: {
              type: "boolean",
              default: true,
              description: "strip x-goog-user-project to avoid 403",
              examples: [true]
            },
            fingerprint_jitter: {
              type: "boolean",
              default: true,
              examples: [true]
            },
            pid_offset: {
              type: "boolean",
              default: false,
              examples: [false, true]
            }
          }
        },
        fallback_project_id: {
          type: "string",
          minLength: 3,
          default: "rising-fact-p41fc",
          description: "fallback project id blinded",
          examples: ["rising-fact-p41fc"]
        },
        default_model: {
          type: "string",
          default: "antigravity-gemini-3-flash",
          description: "default chat model 2026",
          examples: ["antigravity-gemini-3-flash", "gemini-3-pro-preview"]
        },
        search_model: {
          type: "string",
          default: "gemini-3-flash",
          description: "search grounding model",
          examples: ["gemini-3-flash", "gemini-3-flash-preview"]
        },
        client_id: {
          type: ["string", "null"],
          default: null,
          description: "OAuth client_id override (public)",
          examples: [null, "1071006060591-...apps.googleusercontent.com"]
        },
        client_secret: {
          type: ["string", "null"],
          default: null,
          description: "OAuth client_secret override \u2014 do not commit",
          examples: [null]
        },
        accounts_file: {
          type: ["string", "null"],
          default: null,
          format: "uri-reference",
          description: "custom accounts file path",
          examples: [null, "~/.config/opencode/antigravity-accounts.json"]
        },
        models_allowlist: {
          type: "array",
          items: { type: "string" },
          default: [],
          description: "optional model allowlist",
          examples: [[], ["antigravity-gemini-3-flash", "claude-opus-4-6-thinking"]]
        },
        strip_user_project: {
          type: "boolean",
          default: true,
          description: "legacy alias for bypass.strip_user_project_header",
          examples: [true]
        },
        toast_scope: {
          type: "string",
          enum: ["all", "project", "minimal", "none"],
          default: "all",
          description: "toast/notification display scope (v1 field)",
          examples: ["all", "project", "minimal", "none"]
        },
        soft_quota_threshold_percent: {
          type: "number",
          minimum: 0,
          maximum: 100,
          default: 90,
          description: "quota percentage where soft warning/fallback starts (v1 field)",
          examples: [90]
        },
        quota_fallback: {
          oneOf: [{ type: "boolean" }, { type: "string" }],
          default: "auto",
          description: 'fallback strategy on quota exhaustion: boolean | "auto" | modelName (v1 field)',
          examples: ["auto", true, false]
        },
        soft_quota_cache_ttl_minutes: {
          type: "integer",
          minimum: 1,
          maximum: 1440,
          default: 5,
          description: "soft quota cache TTL in minutes (v1 field)",
          examples: [5]
        },
        version_cache_ttl: {
          type: "integer",
          minimum: 1,
          maximum: 10080,
          default: 60,
          description: "version/update check cache TTL in minutes (v1 field)",
          examples: [60]
        }
      },
      required: []
    };
    paritygatemain = typeof process !== "undefined" && Array.isArray(process.argv) && typeof process.argv[1] === "string" && process.argv[1].endsWith("config.ts");
    if (paritygatemain) runparitygate();
  }
});

// ../devthink/labels.ts
function chatText(id) {
  const row = seedChatStrings.find((entry) => entry.id === id);
  return row ? row.text : "";
}
var seedChatStrings, seedChatSandboxContract;
var init_labels = __esm({
  "../devthink/labels.ts"() {
    "use strict";
    seedChatStrings = [
      { id: "welcome.temporarySub", text: "temporary chat: nothing saves on this device" },
      { id: "welcome.modelLine", text: "sol {model}" },
      { id: "chat.temporaryPill", text: "temporary chat" },
      { id: "chat.session.historyNote", text: "History stays in this browser" },
      { id: "chat.temporaryTitle", text: "this conversation never saves to this device" },
      { id: "topbar.gatewayOn", text: "CLI on" },
      { id: "topbar.gatewayOff", text: "CLI off" },
      { id: "composer.placeholderIdle", text: "ask anything" },
      { id: "composer.placeholderFollowUp", text: "send a follow up while it works" },
      { id: "composer.sandboxChip", text: "Sandbox" },
      { id: "composer.sandboxNote", text: "open the sandbox" },
      { id: "gw.notRegistered", text: "No assistant service connected" },
      { id: "toast.stopped", text: "Generation stopped" },
      {
        id: "toast.stoppedDescription",
        text: "The partial answer stayed on the floor \u2014 regenerate answers it again."
      },
      { id: "toast.noRespond", text: "Sol did not respond" },
      { id: "toast.branch", text: "Checkpoint branch opened" },
      {
        id: "toast.branchDescription",
        text: "The original keeps its round \u2014 the edit carries the ladder forward."
      },
      { id: "toast.messageDeleted", text: "Message deleted" },
      { id: "toast.conversationDeleted", text: "Conversation deleted" },
      { id: "turn.thinking", text: "Thinking" },
      { id: "turn.responding", text: "Responding" },
      { id: "turn.copied", text: "copied to clipboard" },
      { id: "turn.copyFailed", text: "copy failed" },
      { id: "day.today", text: "Today" },
      { id: "day.yesterday", text: "Yesterday" },
      { id: "sb.prompt", text: "root@devthink:~#" },
      { id: "sb.running", text: 'ok: sandbox running. type "help" for the command list.' },
      { id: "sb.stopped", text: "sandbox stopped; snapshot-less teardown complete." },
      { id: "sb.halted", text: "sandbox halted \u2014 boot to start the session." },
      { id: "sb.offlineRow", text: "offline \u2014 running locally. connect to enable the full suite." },
      { id: "sb.notRunning", text: "the sandbox is not running" },
      { id: "sb.outputAria", text: "Sandbox boot and command output" },
      { id: "sb.runAria", text: "Run a sandbox command" },
      { id: "panel.instructionsPlaceholder", text: "pinned instructions for the conversation" },
      { id: "panel.instructionsSaved", text: "saved on this device" },
      { id: "panel.instructionsDraft", text: "a local draft for now" },
      { id: "panel.memoryEmpty", text: "nothing saved on this device" },
      { id: "panel.probing", text: "Checking the connection" },
      { id: "panel.gatewayError", text: "The service did not answer" },
      { id: "panel.exportFallback", text: "chat-session" },
      { id: "panel.exportAria", text: "Export conversation as markdown" },
      { id: "panel.exportEmpty", text: "nothing to export yet" },
      { id: "panel.exportFull", text: "Download this conversation as markdown" },
      { id: "panel.exportKey", text: "Export .md" },
      /* the session panel aria rows (the straggler sweep: the last raw labels
       * of the inspector leave the widget) */
      { id: "panel.sessionAria", text: "Session panel" },
      { id: "panel.closeAria", text: "Close session panel" },
      { id: "panel.identityAria", text: "Session identity" },
      { id: "panel.projectAria", text: "Project instructions" },
      { id: "panel.pinnedAria", text: "Pinned instructions" },
      { id: "panel.memoryAria", text: "Saved memory" },
      { id: "panel.deleteFact", text: "Delete fact: {fact}" },
      { id: "panel.tagsAria", text: "Session tags" },
      { id: "panel.removeTagAria", text: "Remove tag" },
      { id: "panel.addTagAria", text: "Add a tag" },
      { id: "canvas.defaultTitle", text: "canvas" },
      { id: "canvas.empty", text: "the canvas is empty \u2014 the edit key begins the buffer." }
    ];
    seedChatSandboxContract = [
      "sandbox tool contract: a saddle sandbox microvm is attached to this conversation.",
      "to run a command in it, emit a fenced code block tagged sandbox carrying exactly one shell command:",
      "```sandbox",
      "lscpu",
      "```",
      'or a single json line: {"tool":"sandbox","command":"lscpu"}.',
      "the engine answers help, lscpu, cat /proc/cpuinfo, cat /proc/meminfo, free -h, nvidia-smi, nvidia-smi -L, clinfo, vulkaninfo --summary, glxinfo, uname -a, ls, ls /etc/virtual, env, uptime, whoami, neofetch, echo, echo <text> > <file>, echo <text> >> <file>, touch <file>, cat <file>, rm <file>, df -h, stat <file>, pwd, history, man <command> \u2014 run help for the catalog.",
      "each command's output and exit code return to you as the sandbox result context of the next round, and workspace files persist through the session.",
      "emit a sandbox call only when the answer needs the engine, otherwise answer in plain text. never fabricate command output \u2014 the thread renders only what the engine answered."
    ].join("\n");
  }
});

// ../devthink/gateway.ts
import { useCallback, useEffect, useRef, useState } from "react";
function isSecureRemoteEndpoint(value) {
  try {
    return Boolean(value && new URL(value).protocol === "https:");
  } catch {
    return false;
  }
}
var GATEWAY_REQUIRED_COPY, GATEWAY_SEND_NOTICE;
var init_gateway = __esm({
  "../devthink/gateway.ts"() {
    "use strict";
    init_labels();
    GATEWAY_REQUIRED_COPY = chatText("gw.notRegistered");
    GATEWAY_SEND_NOTICE = chatText("gw.notRegistered");
  }
});

// ../devthink/queue.ts
function compactToken() {
  const bytes = new Uint8Array(tokenLength);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value & 31]).join("");
}
function createCompactId(prefix) {
  const normalized = prefix.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 4) || "id";
  return `${normalized}_${compactToken()}`;
}
var alphabet, tokenLength;
var init_queue = __esm({
  "../devthink/queue.ts"() {
    "use strict";
    alphabet = "0123456789abcdefghjkmnpqrstvwxyz";
    tokenLength = 10;
  }
});

// ../devthink/account.ts
import { existsSync as existsSync2, readFileSync as readFileSync2, renameSync as renameSync2, writeFileSync as writeFileSync2 } from "node:fs";
function privateWrite(path, value) {
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync2(temporary, `${JSON.stringify(value, null, 2)}
`, { encoding: "utf8", mode: 384 });
  renameSync2(temporary, path);
}
function createId(prefix) {
  return createCompactId(prefix);
}
function getIdentity(paths) {
  ensurePaths(paths);
  try {
    if (existsSync2(paths.identity)) {
      const parsed = JSON.parse(readFileSync2(paths.identity, "utf8"));
      if (parsed && typeof parsed === "object" && typeof parsed.userId === "string" && typeof parsed.deviceId === "string")
        return parsed;
    }
  } catch {
  }
  const identity = {
    version: 1,
    userId: createId("u"),
    deviceId: createId("d"),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  privateWrite(paths.identity, identity);
  return identity;
}
var pairingLifetimeMs, browserSessionLifetimeMs, OAUTH_AUTHORIZE_ENDPOINTS, OAUTH_SCOPES2, OAUTH_TOKEN_ENDPOINTS, OAUTH_PROFILE_ENDPOINTS, OAUTH_ID_ENV, OAUTH_PKCE, FAMILYSESSIONMS;
var init_account = __esm({
  "../devthink/account.ts"() {
    "use strict";
    init_config();
    init_queue();
    pairingLifetimeMs = 5 * 60 * 1e3;
    browserSessionLifetimeMs = 15 * 60 * 1e3;
    OAUTH_AUTHORIZE_ENDPOINTS = Object.freeze({
      google: "https://accounts.google.com/o/oauth2/v2/auth",
      github: "https://github.com/login/oauth/authorize",
      gitlab: "https://gitlab.com/oauth/authorize"
    });
    OAUTH_SCOPES2 = Object.freeze({
      google: "openid email profile",
      github: "read:user user:email",
      gitlab: "read_user email"
    });
    OAUTH_TOKEN_ENDPOINTS = Object.freeze({
      google: "https://oauth2.googleapis.com/token",
      github: "https://github.com/login/oauth/access_token",
      gitlab: "https://gitlab.com/oauth/token"
    });
    OAUTH_PROFILE_ENDPOINTS = Object.freeze({
      google: "https://openidconnect.googleapis.com/v1/userinfo",
      github: "https://api.github.com/user",
      gitlab: "https://gitlab.com/api/v4/user"
    });
    OAUTH_ID_ENV = Object.freeze({
      google: "VITE_OAUTH_GOOGLE_ID",
      github: "VITE_OAUTH_GITHUB_ID",
      gitlab: "VITE_OAUTH_GITLAB_ID"
    });
    OAUTH_PKCE = Object.freeze({
      google: true,
      github: true,
      gitlab: true
    });
    FAMILYSESSIONMS = 30 * 24 * 60 * 60 * 1e3;
  }
});

// ../devthink/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DEFAULTQUOTAMB: () => DEFAULTQUOTAMB,
  DRIVES_KEY: () => DRIVES_KEY,
  QUOTACEILMB: () => QUOTACEILMB,
  StorageError: () => StorageError,
  TIERQUOTAMB: () => TIERQUOTAMB,
  activateOwnerDrive: () => activateOwnerDrive,
  appendMessage: () => appendMessage,
  browserCredentialProviders: () => browserCredentialProviders,
  browserIdentity: () => browserIdentity,
  browserStoreSummary: () => browserStoreSummary,
  browserWorkspaces: () => browserWorkspaces,
  cacheBrowserIdentity: () => cacheBrowserIdentity,
  cacheGatewaySession: () => cacheGatewaySession,
  createMemoryStore: () => createMemoryStore,
  createSession: () => createSession,
  createTab: () => createTab,
  createWorkspace: () => createWorkspace,
  db: () => db,
  deleteobject: () => deleteobject,
  drives: () => drives,
  ensureBrowserSession: () => ensureBrowserSession,
  ensureplanstore: () => ensureplanstore,
  exportLocalSnapshot: () => exportLocalSnapshot,
  exportSession: () => exportSession,
  getobject: () => getobject,
  getonboardingstate: () => getonboardingstate,
  getplan: () => getplan,
  getsession: () => getsession,
  getsessionmessages: () => getsessionmessages,
  keyvalid: () => keyvalid,
  listSessions: () => listSessions,
  listcopyrows: () => listcopyrows,
  listobjects: () => listobjects,
  loadBrowserSession: () => loadBrowserSession,
  loadSession: () => loadSession,
  loadWorkspace: () => loadWorkspace,
  memorySummary: () => memorySummary,
  mirrorSession: () => mirrorSession,
  newdrive: () => newdrive,
  opendrive: () => opendrive,
  ownervalid: () => ownervalid,
  planquota: () => planquota,
  planquotamb: () => planquotamb,
  preparestorage: () => preparestorage,
  putobject: () => putobject,
  readAllLabels: () => readAllLabels,
  readBrowserCredential: () => readBrowserCredential,
  readBrowserPreferences: () => readBrowserPreferences,
  readLabel: () => readLabel,
  readPreferences: () => readPreferences,
  remoteSyncStatus: () => remoteSyncStatus,
  removeBrowserCredential: () => removeBrowserCredential,
  removeBrowserMessage: () => removeBrowserMessage,
  removeBrowserTab: () => removeBrowserTab,
  renamerive: () => renamerive,
  renderSessionMarkdown: () => renderSessionMarkdown,
  saveBrowserCredential: () => saveBrowserCredential,
  saveBrowserMessages: () => saveBrowserMessages,
  saveBrowserPreference: () => saveBrowserPreference,
  saveBrowserTab: () => saveBrowserTab,
  saveLabel: () => saveLabel,
  savePreference: () => savePreference,
  savemsg: () => savemsg,
  setonboardingstage: () => setonboardingstage,
  setplan: () => setplan,
  sharedatabasedriver: () => databasedriver,
  updateTab: () => updateTab,
  upsertcopyrows: () => upsertcopyrows,
  usagefor: () => usagefor
});
import { existsSync as existsSync3, mkdirSync as mkdirSync2, readdirSync as readdirSync2, readFileSync as readFileSync3, renameSync as renameSync3, writeFileSync as writeFileSync3 } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname as dirname2, join as join2, resolve } from "node:path";
function databasedriver() {
  if (cacheddriver !== void 0) return cacheddriver;
  if (process.versions.bun) {
    const bunrequire = __require;
    const bunsqlite = bunrequire(["bun", "sqlite"].join(":"));
    cacheddriver = bunsqlite.Database;
  } else {
    const nodesqlite = process.getBuiltinModule?.("node:sqlite");
    if (nodesqlite === void 0)
      throw new Error(
        "The node sqlite builtin is unavailable in this runtime; the workbench store falls back to the JSON records."
      );
    cacheddriver = nodesqlite.DatabaseSync;
  }
  return cacheddriver;
}
function initialize(database) {
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, title TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, title TEXT NOT NULL, mode TEXT NOT NULL, model TEXT, provider TEXT, active_tab_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tabs (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, workspace_id TEXT NOT NULL, label TEXT NOT NULL, provider TEXT, section_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, workspace_id TEXT NOT NULL, tab_id TEXT NOT NULL, section_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS preferences (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS sessions_workspace_updated ON sessions(workspace_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS tabs_session_updated ON tabs(session_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS messages_session_created ON messages(session_id, created_at ASC);
  `);
}
function mirrorSession(paths, workspace, session) {
  let database;
  try {
    database = new (databasedriver())(paths.database);
    initialize(database);
    database.exec("BEGIN IMMEDIATE");
    database.prepare(
      "INSERT INTO workspaces (id, title, created_at, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title = excluded.title, updated_at = excluded.updated_at"
    ).run(workspace.id, workspace.title, workspace.createdAt, workspace.updatedAt);
    database.prepare(
      "INSERT INTO sessions (id, workspace_id, title, mode, model, provider, active_tab_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET workspace_id = excluded.workspace_id, title = excluded.title, mode = excluded.mode, model = excluded.model, provider = excluded.provider, active_tab_id = excluded.active_tab_id, updated_at = excluded.updated_at"
    ).run(
      session.id,
      session.workspaceId,
      session.title,
      session.mode,
      session.model ?? null,
      session.provider ?? null,
      session.activeTabId,
      session.createdAt,
      session.updatedAt
    );
    database.prepare("DELETE FROM tabs WHERE session_id = ?").run(session.id);
    database.prepare("DELETE FROM messages WHERE session_id = ?").run(session.id);
    const addTab = database.prepare(
      "INSERT INTO tabs (id, session_id, workspace_id, label, provider, section_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const addMessage = database.prepare(
      "INSERT INTO messages (id, session_id, workspace_id, tab_id, section_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const tab of session.tabs)
      addTab.run(
        tab.id,
        tab.sessionId,
        tab.workspaceId,
        tab.label,
        tab.provider ?? null,
        tab.sectionId,
        tab.createdAt,
        tab.updatedAt
      );
    for (const message of session.messages)
      addMessage.run(
        message.id,
        message.sessionId,
        message.workspaceId,
        message.tabId,
        message.sectionId,
        message.role,
        message.content,
        message.createdAt
      );
    database.exec("COMMIT");
  } catch {
    try {
      database?.exec("ROLLBACK");
    } catch {
    }
  } finally {
    database?.close();
  }
}
function readPreferences(paths) {
  let database;
  try {
    database = new (databasedriver())(paths.database);
    initialize(database);
    const rows = database.prepare("SELECT key, value, updated_at AS updatedAt FROM preferences ORDER BY key ASC").all();
    return Object.fromEntries(rows.map((row) => [row.key, row]));
  } catch {
    return {};
  } finally {
    database?.close();
  }
}
function savePreference(paths, key, value) {
  const preference = { key, value, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  let database;
  try {
    database = new (databasedriver())(paths.database);
    initialize(database);
    database.prepare(
      "INSERT INTO preferences (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
    ).run(preference.key, preference.value, preference.updatedAt);
  } finally {
    database?.close();
  }
  return preference;
}
function storagedatabasepath() {
  return join2(dirname2(resolvePaths().database), "devthink-storage.sqlite");
}
function storagedatabase() {
  if (cacheddatabase !== void 0) return cacheddatabase;
  mkdirSync2(dirname2(storagedatabasepath()), { recursive: true });
  const DatabaseConstructor = databasedriver();
  const database = new DatabaseConstructor(storagedatabasepath());
  for (const statement of SCHEMASTATEMENTS) database.prepare(statement).run();
  cacheddatabase = database;
  return cacheddatabase;
}
function ownervalid(owner) {
  return OWNERPATTERN.test(owner);
}
function keyvalid(key) {
  if (!KEYPATTERN.test(key)) return false;
  for (const segment of key.split("/")) {
    if (segment === "." || segment === "..") return false;
  }
  return true;
}
function usedbytes(database, owner) {
  const row = database.prepare("SELECT COALESCE(SUM(bytes), 0) AS total FROM storageobjects WHERE owner = ?").all(owner);
  return Number(row[0]?.total ?? 0);
}
function putobject(owner, key, content, quotamb) {
  if (!ownervalid(owner)) throw new StorageError("invalid owner");
  if (!keyvalid(key)) throw new StorageError("invalid key");
  const bytes = Buffer.byteLength(content, "utf8");
  const quotabytes = quotamb * 1024 * 1024;
  if (bytes > quotabytes) throw new StorageError("the object exceeds the whole quota");
  const database = storagedatabase();
  const remaining = quotabytes - usedbytes(database, owner);
  if (bytes > remaining) throw new StorageError("the write exceeds the remaining quota");
  const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  database.prepare(
    "INSERT INTO storageobjects (owner, key, content, bytes, updatedat) VALUES (?, ?, ?, ?, ?) ON CONFLICT(owner, key) DO UPDATE SET content = excluded.content, bytes = excluded.bytes, updatedat = excluded.updatedat"
  ).run(owner, key, content, bytes, updatedAt);
  return { owner, key, content, bytes, updatedAt };
}
function getobject(owner, key) {
  if (!ownervalid(owner)) throw new StorageError("invalid owner");
  if (!keyvalid(key)) throw new StorageError("invalid key");
  const database = storagedatabase();
  const rows = database.prepare("SELECT owner, key, content, bytes, updatedat FROM storageobjects WHERE owner = ? AND key = ?").all(owner, key);
  const row = rows[0];
  if (!row) return null;
  return { owner: row.owner, key: row.key, content: row.content, bytes: Number(row.bytes), updatedAt: row.updatedat };
}
function deleteobject(owner, key) {
  if (!ownervalid(owner)) throw new StorageError("invalid owner");
  if (!keyvalid(key)) throw new StorageError("invalid key");
  const database = storagedatabase();
  const answer = database.prepare("DELETE FROM storageobjects WHERE owner = ? AND key = ?").run(owner, key);
  return Number(answer.changes ?? 0) > 0;
}
function usagefor(owner, quotamb) {
  if (!ownervalid(owner)) throw new StorageError("invalid owner");
  const database = storagedatabase();
  const count = database.prepare("SELECT COUNT(*) AS total FROM storageobjects WHERE owner = ?").all(owner);
  return { bytes: usedbytes(database, owner), objects: Number(count[0]?.total ?? 0), quotamb };
}
function listobjects(owner) {
  if (!ownervalid(owner)) throw new StorageError("invalid owner");
  const database = storagedatabase();
  const rows = database.prepare("SELECT key, bytes, updatedat FROM storageobjects WHERE owner = ? ORDER BY updatedat DESC LIMIT 500").all(owner);
  return rows.map((row) => ({ key: row.key, bytes: Number(row.bytes), updatedAt: row.updatedat }));
}
async function preparestorage() {
  await mkdir(dirname2(storagedatabasepath()), { recursive: true });
  storagedatabase();
}
function resolvedburl() {
  const own = process.env.DEVTHINK_DATABASE_URL || "";
  const isremote = (u) => u.startsWith("libsql:") || u.startsWith("http:") || u.startsWith("https:") || u.startsWith("postgres:");
  if (own) {
    return { url: own, isremote: isremote(own) };
  }
  const host = process.env.DATABASE_URL || "";
  if (isremote(host)) {
    return { url: host, isremote: true };
  }
  return { url: "file:./devthink.db", isremote: false };
}
async function ensuredb() {
  if (globalforprisma.prisma) return globalforprisma.prisma;
  const { url, isremote } = resolvedburl();
  const config = isremote ? { url, ...process.env.DATABASE_AUTH_TOKEN ? { authToken: process.env.DATABASE_AUTH_TOKEN } : {} } : { url };
  const { PrismaLibSql } = await import("@prisma/adapter-libsql");
  const adapter = new PrismaLibSql(config);
  const mod = await import("@prisma/client");
  const prismaclient = mod.PrismaClient ?? mod.default?.PrismaClient;
  if (!prismaclient) {
    throw new Error("@prisma/client resolved without the PrismaClient class \u2014 run npx prisma generate");
  }
  const client = new prismaclient({ adapter });
  globalforprisma.prisma = client;
  return client;
}
function makedbproxy(path) {
  const call = async (...args) => {
    let cursor = await ensuredb();
    for (const segment of path) {
      cursor = cursor[segment];
    }
    return cursor(...args);
  };
  return new Proxy(call, {
    get(_target, prop, receiver) {
      if (typeof prop === "symbol") return Reflect.get(_target, prop, receiver);
      if (prop === "then") return void 0;
      return makedbproxy([...path, String(prop)]);
    }
  });
}
async function savemsg(data) {
  try {
    await db.chatMessage.create({ data });
  } catch {
  }
}
async function getsession(sessionid) {
  try {
    const count = await db.chatMessage.count({ where: { sessionid } });
    return { sessionid, messagecount: count };
  } catch {
    return null;
  }
}
async function getsessionmessages(sessionid, limit = 100) {
  try {
    const messages = await db.chatMessage.findMany({
      where: { sessionid, status: "completed" },
      orderBy: { createdat: "asc" },
      take: limit
    });
    return messages;
  } catch {
    return [];
  }
}
async function getonboardingstate(visitor) {
  try {
    const row = await db.onboardingState.findUnique({
      where: { visitor },
      select: { introseen: true, onboardingseen: true }
    });
    return row ? { introseen: row.introseen, onboardingseen: row.onboardingseen } : null;
  } catch {
    return null;
  }
}
async function setonboardingstage(visitor, stage) {
  const onboardingseen = stage === "onboarding";
  const raise = onboardingseen ? { introseen: true, onboardingseen: true } : { introseen: true };
  try {
    const row = await db.onboardingState.upsert({
      where: { visitor },
      create: { visitor, introseen: true, onboardingseen },
      update: raise,
      select: { introseen: true, onboardingseen: true }
    });
    return { introseen: row.introseen, onboardingseen: row.onboardingseen };
  } catch {
    return null;
  }
}
async function listcopyrows() {
  try {
    const rows = await db.copyRow.findMany({ select: { key: true, text: true } });
    return rows;
  } catch {
    return [];
  }
}
async function upsertcopyrows(rows) {
  try {
    let written = 0;
    for (const row of rows) {
      await db.copyRow.upsert({
        where: { key: row.key },
        create: { key: row.key, text: row.text },
        update: { text: row.text }
      });
      written += 1;
    }
    return written;
  } catch {
    return null;
  }
}
async function getplan(visitor) {
  try {
    const row = await db.planState.findUnique({
      where: { visitor },
      select: { tier: true, storagemb: true, rammib: true, since: true }
    });
    return row ?? null;
  } catch {
    return null;
  }
}
async function setplan(visitor, tier, custom) {
  const data = {
    tier,
    storagemb: custom?.storagemb !== void 0 ? BigInt(Math.floor(custom.storagemb)) : null,
    rammib: custom?.rammib !== void 0 ? BigInt(Math.floor(custom.rammib)) : null
  };
  try {
    const row = await db.planState.upsert({
      where: { visitor },
      create: { visitor, ...data },
      update: data,
      select: { tier: true, storagemb: true, rammib: true, since: true }
    });
    return row;
  } catch {
    return null;
  }
}
function planquota(row) {
  if (!row) return { quotamb: DEFAULTQUOTAMB, tier: null, source: "floor" };
  if (row.tier === "enterprise" && row.storagemb !== null) {
    const defined = Number(row.storagemb);
    if (Number.isFinite(defined) && defined > 0) {
      const bounded = Math.min(QUOTACEILMB, Math.max(DEFAULTQUOTAMB, Math.floor(defined)));
      return { quotamb: bounded, tier: row.tier, source: "custom" };
    }
  }
  const tierquota = TIERQUOTAMB[row.tier];
  if (tierquota !== void 0) return { quotamb: tierquota, tier: row.tier, source: "tier" };
  return { quotamb: DEFAULTQUOTAMB, tier: row.tier, source: "floor" };
}
function planquotamb(row) {
  return planquota(row).quotamb;
}
function ensureplanstore() {
  const { url, isremote } = resolvedburl();
  if (isremote || !url.startsWith("file:")) return false;
  const file = resolve(url.slice("file:".length));
  mkdirSync2(dirname2(file), { recursive: true });
  const database = new (databasedriver())(file);
  try {
    for (const statement of PLANSCHEMASTATEMENTS) database.exec(statement);
  } finally {
    database.close();
  }
  return true;
}
function timestamp() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function compactToken2(length = 10) {
  const alphabet2 = "0123456789abcdefghjkmnpqrstvwxyz";
  const bytes = new Uint8Array(length);
  globalThis.crypto?.getRandomValues?.(bytes);
  return Array.from(bytes, (value, index) => alphabet2[value ? value & 31 : Date.now() + index & 31]).join("");
}
function request(source) {
  return new Promise((resolve4, reject) => {
    source.onsuccess = () => resolve4(source.result);
    source.onerror = () => reject(source.error || new Error("DevThink browser store request failed."));
  });
}
function finished(transaction) {
  return new Promise((resolve4, reject) => {
    transaction.oncomplete = () => resolve4();
    transaction.onabort = () => reject(transaction.error || new Error("DevThink browser store transaction aborted."));
    transaction.onerror = () => reject(transaction.error || new Error("DevThink browser store transaction failed."));
  });
}
function openStore() {
  if (!("indexedDB" in globalThis)) return Promise.reject(new Error("IndexedDB is unavailable in this browser."));
  return new Promise((resolve4, reject) => {
    const open = globalThis.indexedDB.open(databaseName, databaseVersion);
    open.onupgradeneeded = () => {
      const database = open.result;
      if (!database.objectStoreNames.contains("meta")) database.createObjectStore("meta", { keyPath: "key" });
      for (const storeName of dataStores) {
        if (database.objectStoreNames.contains(storeName)) continue;
        const store = database.createObjectStore(storeName, { keyPath: "id" });
        store.createIndex("ownerId", "ownerId", { unique: false });
        if (storeName === "sessions") store.createIndex("workspaceId", "workspaceId", { unique: false });
        if (storeName === "tabs" || storeName === "messages")
          store.createIndex("sessionId", "sessionId", { unique: false });
      }
      if (!database.objectStoreNames.contains("credentials")) {
        const credentials = database.createObjectStore("credentials", { keyPath: "id" });
        credentials.createIndex("ownerId", "ownerId", { unique: false });
        credentials.createIndex("providerId", "providerId", { unique: false });
      }
    };
    open.onsuccess = () => resolve4(open.result);
    open.onerror = () => reject(open.error || new Error("DevThink browser store could not open."));
  });
}
async function withStore(storeName, mode, operation) {
  const database = await openStore();
  try {
    const transaction = database.transaction(storeName, mode);
    const result = await operation(transaction.objectStore(storeName));
    await finished(transaction);
    return result;
  } finally {
    database.close();
  }
}
async function record(storeName, id) {
  return withStore(storeName, "readonly", async (store) => await request(store.get(id)));
}
async function allOwned(storeName, ownerId) {
  return withStore(
    storeName,
    "readonly",
    async (store) => (await request(store.index("ownerId").getAll(IDBKeyRange.only(ownerId)))).filter(
      (item) => !item.tombstone
    )
  );
}
async function put(storeName, value) {
  return withStore(storeName, "readwrite", async (store) => {
    await request(store.put(value));
    return value;
  });
}
async function updateRecord(storeName, identity, id, value) {
  const current = await record(storeName, id);
  const next = {
    ...current,
    ...value,
    id,
    ownerId: identity.userId,
    deviceId: identity.deviceId,
    updatedAt: value.updatedAt || timestamp(),
    revision: Math.max(0, current?.revision || 0) + 1,
    tombstone: value.tombstone || false
  };
  return put(storeName, next);
}
async function browserIdentity() {
  const existing = await record("meta", "identity");
  if (existing?.value && ownerExpression.test(existing.value.userId)) return existing.value;
  const identity = { userId: `b${compactToken2(11)}`, deviceId: `d_${compactToken2(10)}`, createdAt: timestamp() };
  await put("meta", { key: "identity", value: identity });
  return identity;
}
async function activateOwnerDrive(identity) {
  if (!ownerExpression.test(identity.userId)) throw new Error("Drive owner rejected.");
  await put("meta", { key: "identity", value: identity });
}
async function cacheBrowserIdentity(identity) {
  if (!ownerExpression.test(identity.userId)) return browserIdentity();
  const current = await browserIdentity();
  if (current.userId !== identity.userId) {
    for (const storeName of dataStores) {
      const records = await allOwned(storeName, current.userId);
      for (const item of records)
        await put(storeName, {
          ...item,
          ownerId: identity.userId,
          deviceId: current.deviceId,
          updatedAt: timestamp(),
          revision: item.revision + 1
        });
    }
  }
  const next = { ...current, userId: identity.userId };
  await put("meta", { key: "identity", value: next });
  return next;
}
async function readBrowserPreferences() {
  const identity = await browserIdentity();
  const preferences = await allOwned("preferences", identity.userId);
  return Object.fromEntries(preferences.map((preference) => [preference.key, preference.value]));
}
async function saveLabel(id, text, revision, translated = false) {
  return put("labels", { id, text, revision, updatedAt: timestamp(), translated });
}
async function readLabel(id) {
  return withStore("labels", "readonly", async (store) => await request(store.get(id)));
}
async function readAllLabels() {
  return withStore("labels", "readonly", async (store) => await request(store.getAll()));
}
async function readBrowserCredential(providerId) {
  const identity = await browserIdentity();
  const credential = await record("credentials", `${identity.userId}:${providerId}`);
  return credential?.localOnly ? credential.value : null;
}
async function saveBrowserPreference(key, value) {
  const identity = await browserIdentity();
  return updateRecord("preferences", identity, `${identity.userId}:${key}`, { key, value });
}
async function saveBrowserCredential(providerId, value) {
  const identity = await browserIdentity();
  const now = timestamp();
  const id = `${identity.userId}:${providerId}`;
  const existing = await record("credentials", id);
  await put("credentials", {
    id,
    ownerId: identity.userId,
    providerId,
    value,
    deviceId: identity.deviceId,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    localOnly: true
  });
}
async function removeBrowserCredential(providerId) {
  const identity = await browserIdentity();
  await withStore("credentials", "readwrite", async (store) => {
    await request(store.delete(`${identity.userId}:${providerId}`));
  });
}
async function browserCredentialProviders() {
  const identity = await browserIdentity();
  return withStore(
    "credentials",
    "readonly",
    async (store) => (await request(store.index("ownerId").getAll(IDBKeyRange.only(identity.userId)))).filter((credential) => credential.localOnly).map((credential) => credential.providerId)
  );
}
async function ensureBrowserSession(route, input = {}) {
  const identity = await browserIdentity();
  const now = timestamp();
  const workspace = await record("workspaces", route.workspaceId);
  if (!workspace || workspace.ownerId !== identity.userId)
    await updateRecord("workspaces", identity, route.workspaceId, {
      title: input.title || "Local workspace",
      createdAt: now
    });
  const session = await record("sessions", route.sessionId);
  if (!session || session.ownerId !== identity.userId)
    await updateRecord("sessions", identity, route.sessionId, {
      workspaceId: route.workspaceId,
      title: input.title || "Local session",
      mode: input.mode || "chat",
      model: input.model,
      provider: input.provider,
      activeTabId: route.tabId,
      createdAt: now
    });
  const tab = await record("tabs", route.tabId);
  if (!tab || tab.ownerId !== identity.userId)
    await updateRecord("tabs", identity, route.tabId, {
      sessionId: route.sessionId,
      workspaceId: route.workspaceId,
      label: input.tabLabel || "local session",
      provider: input.provider,
      sectionId: route.sectionId,
      createdAt: now
    });
  return loadBrowserSession(route.sessionId);
}
async function loadBrowserSession(sessionId) {
  const identity = await browserIdentity();
  const session = await record("sessions", sessionId);
  const [tabs, messages, preferences] = await Promise.all([
    allOwned("tabs", identity.userId),
    allOwned("messages", identity.userId),
    readBrowserPreferences()
  ]);
  return {
    identity,
    workspace: session?.ownerId === identity.userId ? await record("workspaces", session.workspaceId) : void 0,
    session: session?.ownerId === identity.userId && !session.tombstone ? session : void 0,
    tabs: tabs.filter((tab) => tab.sessionId === sessionId).sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    messages: messages.filter((message) => message.sessionId === sessionId).sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    preferences
  };
}
async function saveBrowserTab(route, input) {
  const identity = await browserIdentity();
  await ensureBrowserSession(route, { provider: input.provider });
  return updateRecord("tabs", identity, route.tabId, {
    sessionId: route.sessionId,
    workspaceId: route.workspaceId,
    label: input.label,
    provider: input.provider,
    sectionId: input.sectionId || route.sectionId,
    createdAt: (await record("tabs", route.tabId))?.createdAt || timestamp()
  });
}
async function removeBrowserTab(id) {
  const identity = await browserIdentity();
  const tab = await record("tabs", id);
  if (!tab || tab.ownerId !== identity.userId) return;
  await updateRecord("tabs", identity, id, { ...tab, tombstone: true });
}
async function removeBrowserMessage(id) {
  const identity = await browserIdentity();
  const message = await record("messages", id);
  if (!message || message.ownerId !== identity.userId) return;
  await updateRecord("messages", identity, id, { ...message, tombstone: true });
}
async function saveBrowserMessages(route, messages) {
  const identity = await browserIdentity();
  await ensureBrowserSession(route);
  for (const message of messages)
    await updateRecord("messages", identity, message.id, {
      sessionId: route.sessionId,
      workspaceId: route.workspaceId,
      tabId: route.tabId,
      sectionId: route.sectionId,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt || (await record("messages", message.id))?.createdAt || timestamp()
    });
}
async function cacheGatewaySession(payload) {
  const identity = await browserIdentity();
  const now = timestamp();
  await updateRecord("workspaces", identity, payload.workspaceId, {
    title: payload.title || "Paired workspace",
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now
  });
  await updateRecord("sessions", identity, payload.id, {
    workspaceId: payload.workspaceId,
    title: payload.title,
    mode: payload.mode || "chat",
    model: payload.model,
    provider: payload.provider,
    activeTabId: payload.activeTabId,
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now
  });
  for (const tab of payload.tabs)
    await updateRecord("tabs", identity, tab.id, {
      sessionId: payload.id,
      workspaceId: payload.workspaceId,
      label: tab.label,
      provider: tab.provider,
      sectionId: tab.sectionId,
      createdAt: tab.createdAt,
      updatedAt: tab.updatedAt
    });
  for (const message of payload.messages)
    await updateRecord("messages", identity, message.id, {
      sessionId: payload.id,
      workspaceId: payload.workspaceId,
      tabId: message.tabId,
      sectionId: message.sectionId,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.createdAt
    });
}
async function browserStoreSummary(paired = false) {
  if (!("indexedDB" in globalThis))
    return {
      available: false,
      database: databaseName,
      workspaces: 0,
      sessions: 0,
      tabs: 0,
      messages: 0,
      preferences: 0,
      mode: paired ? "paired-gateway" : "local-only"
    };
  const identity = await browserIdentity();
  const [workspaces, sessions, tabs, messages, preferences] = await Promise.all(
    dataStores.map((storeName) => allOwned(storeName, identity.userId))
  );
  return {
    available: true,
    database: databaseName,
    ownerId: identity.userId,
    deviceId: identity.deviceId,
    workspaces: workspaces.length,
    sessions: sessions.length,
    tabs: tabs.length,
    messages: messages.length,
    preferences: preferences.length,
    mode: paired ? "paired-gateway" : "local-only"
  };
}
async function browserWorkspaces() {
  const identity = await browserIdentity();
  const [workspaces, sessions] = await Promise.all([
    allOwned("workspaces", identity.userId),
    allOwned("sessions", identity.userId)
  ]);
  return workspaces.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)).map((workspace) => ({
    id: workspace.id,
    title: workspace.title,
    updatedAt: workspace.updatedAt,
    sessionCount: sessions.filter((session) => session.workspaceId === workspace.id).length
  }));
}
function readdrives() {
  try {
    const raw = window.localStorage.getItem(DRIVES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => typeof item?.id === "string" && typeof item?.label === "string" && typeof item?.deviceId === "string" && typeof item?.createdAt === "string"
    );
  } catch {
    return [];
  }
}
function savedrives(list) {
  try {
    window.localStorage.setItem(DRIVES_KEY, JSON.stringify(list));
  } catch {
  }
}
async function drives() {
  const identity = await browserIdentity();
  let list = readdrives();
  const active = list.find((item) => item.id === identity.userId) ?? {
    id: identity.userId,
    label: "HD 1",
    deviceId: identity.deviceId,
    createdAt: identity.createdAt
  };
  if (!list.some((item) => item.id === active.id)) {
    list = [active, ...list];
    savedrives(list);
  }
  return { active, list };
}
function midentity() {
  const alphabet2 = "0123456789abcdefghjkmnpqrstvwxyz";
  const bytes = new Uint8Array(11);
  globalThis.crypto?.getRandomValues?.(bytes);
  const token = Array.from(bytes, (value) => alphabet2[value & 31]).join("") || Math.random().toString(36).slice(2, 13);
  return `b${token}`;
}
async function newdrive(label) {
  const identity = await browserIdentity();
  const list = readdrives();
  if (!list.some((item) => item.id === identity.userId))
    list.unshift({
      id: identity.userId,
      label: `HD ${list.length + 1}`,
      deviceId: identity.deviceId,
      createdAt: identity.createdAt
    });
  const drive = {
    id: midentity(),
    label: label?.trim() || `HD ${list.length + 1}`,
    deviceId: `d_${identity.deviceId.slice(2)}`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  list.unshift(drive);
  savedrives(list);
  await activateOwnerDrive({ userId: drive.id, deviceId: drive.deviceId, createdAt: drive.createdAt });
  return drive;
}
async function opendrive(id) {
  const drive = readdrives().find((item) => item.id === id);
  if (!drive) throw new Error("Drive not found on this machine.");
  await activateOwnerDrive({ userId: drive.id, deviceId: drive.deviceId, createdAt: drive.createdAt });
}
function renamerive(id, label) {
  const list = readdrives();
  const drive = list.find((item) => item.id === id);
  if (!drive) return;
  drive.label = label.trim() || drive.label;
  savedrives(list);
}
function sessionPath(paths, id) {
  return join2(paths.sessions, `${id}.json`);
}
function safeTitle(messages) {
  const first = messages.find((message) => message.role === "user");
  return first?.content.slice(0, 80) || "Untitled session";
}
function workspacePath(paths, id) {
  return join2(paths.workspaces, `${id}.json`);
}
function atomicWrite(path, value) {
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync3(temporary, `${JSON.stringify(value, null, 2)}
`, "utf8");
  renameSync3(temporary, path);
}
function newWorkspace(id = createCompactId("w"), title = "Untitled workspace", now = (/* @__PURE__ */ new Date()).toISOString()) {
  return { id, title, createdAt: now, updatedAt: now };
}
function newTab(sessionId, workspaceId, provider, label, sectionId, now, id = createCompactId("t")) {
  return { id, sessionId, workspaceId, provider, label, sectionId, createdAt: now, updatedAt: now };
}
function normalizeSession(raw) {
  const now = raw.updatedAt || (/* @__PURE__ */ new Date()).toISOString();
  const workspaceId = raw.workspaceId || createCompactId("w");
  const tabs = raw.tabs?.length ? raw.tabs.map((tab) => ({
    ...tab,
    sessionId: raw.id,
    workspaceId,
    sectionId: tab.sectionId || "chat"
  })) : [newTab(raw.id, workspaceId, raw.provider, raw.title || "Untitled session", "chat", now)];
  const activeTabId = tabs.some((tab) => tab.id === raw.activeTabId) ? raw.activeTabId : tabs[0].id;
  const messages = (raw.messages || []).map((message) => ({
    ...message,
    id: message.id || createCompactId("m"),
    sessionId: raw.id,
    workspaceId,
    tabId: message.tabId || activeTabId,
    sectionId: message.sectionId || "chat",
    createdAt: message.createdAt || now
  }));
  return { ...raw, workspaceId, activeTabId, tabs, messages };
}
function readSession(path) {
  try {
    if (!existsSync3(path)) return void 0;
    return normalizeSession(JSON.parse(readFileSync3(path, "utf8")));
  } catch {
    return void 0;
  }
}
function workspaceFor(session) {
  const title = session.title === "Untitled session" ? "Untitled workspace" : session.title;
  return newWorkspace(session.workspaceId, title, session.createdAt);
}
function saveSession(paths, session) {
  ensurePaths(paths);
  const normalized = normalizeSession(session);
  const existing = loadWorkspace(paths, normalized.workspaceId);
  const workspace = {
    ...existing || workspaceFor(normalized),
    title: normalized.title === "Untitled session" ? existing?.title || "Untitled workspace" : normalized.title,
    updatedAt: normalized.updatedAt
  };
  atomicWrite(sessionPath(paths, normalized.id), normalized);
  atomicWrite(workspacePath(paths, workspace.id), workspace);
  mirrorSession(paths, workspace, normalized);
  return normalized;
}
function createWorkspace(paths, title = "Untitled workspace", id = createCompactId("w")) {
  ensurePaths(paths);
  const workspace = newWorkspace(id, title);
  atomicWrite(workspacePath(paths, id), workspace);
  return workspace;
}
function loadWorkspace(paths, id) {
  try {
    if (!existsSync3(workspacePath(paths, id))) return void 0;
    return JSON.parse(readFileSync3(workspacePath(paths, id), "utf8"));
  } catch {
    return void 0;
  }
}
function createSession(paths, metadata) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const id = createCompactId("s");
  const workspace = metadata.workspaceId ? loadWorkspace(paths, metadata.workspaceId) || createWorkspace(paths, "Untitled workspace", metadata.workspaceId) : createWorkspace(paths);
  const tab = newTab(
    id,
    workspace.id,
    metadata.provider,
    metadata.title || "Untitled session",
    metadata.sectionId || "chat",
    now,
    metadata.tabId
  );
  const session = {
    id,
    workspaceId: workspace.id,
    title: metadata.title || "Untitled session",
    mode: metadata.mode,
    model: metadata.model,
    provider: metadata.provider,
    createdAt: now,
    updatedAt: now,
    activeTabId: tab.id,
    tabs: [tab],
    messages: []
  };
  return saveSession(paths, session);
}
function loadSession(paths, id) {
  const session = readSession(sessionPath(paths, id));
  return session ? saveSession(paths, session) : void 0;
}
function createTab(paths, session, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const tab = newTab(
    session.id,
    session.workspaceId,
    input.provider || session.provider,
    input.label || "New session",
    input.sectionId || "chat",
    now,
    input.id
  );
  return saveSession(paths, { ...session, activeTabId: tab.id, updatedAt: now, tabs: [...session.tabs, tab] });
}
function updateTab(paths, session, tabId, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const tabs = session.tabs.map(
    (tab) => tab.id === tabId ? { ...tab, ...input, updatedAt: now } : tab
  );
  if (!tabs.some((tab) => tab.id === tabId)) throw new Error(`Tab not found: ${tabId}`);
  return saveSession(paths, { ...session, activeTabId: tabId, updatedAt: now, tabs });
}
function appendMessage(paths, session, message, context) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const tabId = context?.tabId || session.activeTabId;
  if (!session.tabs.some((tab) => tab.id === tabId)) throw new Error(`Tab not found: ${tabId}`);
  const nextMessages = [
    ...session.messages,
    {
      ...message,
      id: context?.id || createCompactId("m"),
      sessionId: session.id,
      workspaceId: session.workspaceId,
      tabId,
      sectionId: context?.sectionId || "chat",
      createdAt: now
    }
  ];
  return saveSession(paths, { ...session, title: safeTitle(nextMessages), updatedAt: now, messages: nextMessages });
}
function listSessions(paths) {
  if (!existsSync3(paths.sessions)) return [];
  return readdirSync2(paths.sessions).filter((file) => file.endsWith(".json") && !file.endsWith(".memory.json")).map((file) => readSession(join2(paths.sessions, file))).filter((session) => Boolean(session)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
function renderSessionMarkdown(session) {
  const lines = [
    `# ${session.title}`,
    "",
    `- Workspace: ${session.workspaceId}`,
    `- Session: ${session.id}`,
    `- Active tab: ${session.activeTabId}`,
    `- Mode: ${session.mode}`,
    `- Provider: ${session.provider || "not configured"}`,
    `- Model: ${session.model || "not configured"}`,
    ""
  ];
  for (const message of session.messages) lines.push(`## ${message.role}`, "", message.content, "");
  return `${lines.join("\n")}
`;
}
function exportSession(paths, id, format) {
  const session = loadSession(paths, id);
  if (!session) throw new Error(`Session not found: ${id}`);
  return format === "json" ? `${JSON.stringify(session, null, 2)}
` : renderSessionMarkdown(session);
}
function memoryFile(paths, layer, sessionId) {
  if (layer === "session") return join2(paths.sessions, `${sessionId || "active"}.memory.json`);
  if (layer === "project") return join2(process.cwd(), ".devthink", "project-memory.json");
  return join2(paths.memory, "global-memory.json");
}
function readEntries(path, layer) {
  try {
    if (!existsSync3(path)) return [];
    const parsed = JSON.parse(readFileSync3(path, "utf8"));
    return Array.isArray(parsed) ? parsed.filter((entry) => entry.layer === layer) : [];
  } catch {
    return [];
  }
}
function writeEntries(path, entries) {
  mkdirSync2(join2(path, ".."), { recursive: true });
  writeFileSync3(path, `${JSON.stringify(entries, null, 2)}
`, "utf8");
}
function normalize(value) {
  return value.trim().toLowerCase();
}
function scoreEntry(entry, query) {
  const key = normalize(query.key || "");
  const text = normalize(query.text || "");
  let score = 0;
  if (key && normalize(entry.key) === key) score += 10;
  if (text && normalize(entry.content).includes(text)) score += 5;
  if (!key && !text) score = 1;
  return score;
}
function createMemoryStore(paths) {
  return {
    remember(entry) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const path = memoryFile(paths, entry.layer, entry.layer === "session" ? entry.key : void 0);
      const entries = readEntries(path, entry.layer);
      const current = entries.find((item) => item.key === entry.key);
      const next = {
        id: current?.id || crypto.randomUUID(),
        ...entry,
        createdAt: current?.createdAt || now,
        updatedAt: now
      };
      writeEntries(path, [...entries.filter((item) => item.id !== next.id), next]);
      return next;
    },
    resolve(query) {
      const layers = ["session", "project", "global"];
      for (const layer of layers) {
        const entries = readEntries(memoryFile(paths, layer, query.sessionId), layer);
        const match = entries.map((entry) => ({ entry, score: scoreEntry(entry, query) })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score)[0];
        if (match) return match.entry;
      }
      return void 0;
    },
    list(layer, sessionId) {
      const layers = layer ? [layer] : ["session", "project", "global"];
      return layers.flatMap((item) => readEntries(memoryFile(paths, item, sessionId), item));
    }
  };
}
function memorySummary(store) {
  const entries = store.list();
  if (!entries.length) return "No local memory entries.";
  return entries.map((entry) => `${entry.layer}:${entry.key} \u2014 ${entry.content}`).join("\n");
}
function exportLocalSnapshot(paths) {
  const identity = getIdentity(paths);
  const sessions = listSessions(paths);
  const workspaces = [...new Set(sessions.map((session) => session.workspaceId))].flatMap((workspaceId) => {
    const workspace = loadWorkspace(paths, workspaceId);
    return workspace ? [workspace] : [];
  });
  return {
    version: 1,
    userId: identity.userId,
    deviceId: identity.deviceId,
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    workspaces,
    sessions
  };
}
function remoteSyncStatus(config) {
  const remote = config.web?.remoteSync;
  if (!remote?.enabled)
    return {
      enabled: false,
      ready: false,
      reason: "Remote synchronization is disabled; local pairing remains available."
    };
  if (!remote.endpoint)
    return {
      enabled: true,
      ready: false,
      reason: "Set web.remoteSync.endpoint to a user-operated HTTPS API that implements the DevThink sync contract."
    };
  if (!isSecureRemoteEndpoint(remote.endpoint)) {
    return {
      enabled: true,
      endpoint: remote.endpoint,
      ready: false,
      reason: "Remote synchronization endpoint is not a valid HTTPS URL."
    };
  }
  return { enabled: true, endpoint: new URL(remote.endpoint).toString(), ready: true };
}
var cacheddriver, DEFAULTQUOTAMB, cacheddatabase, SCHEMASTATEMENTS, StorageError, OWNERPATTERN, KEYPATTERN, globalforprisma, db, QUOTACEILMB, TIERQUOTAMB, PLANSCHEMASTATEMENTS, databaseName, databaseVersion, dataStores, ownerExpression, DRIVES_KEY;
var init_storage = __esm({
  "../devthink/storage.ts"() {
    "use strict";
    init_account();
    init_config();
    init_gateway();
    init_queue();
    DEFAULTQUOTAMB = 900;
    SCHEMASTATEMENTS = [
      "CREATE TABLE IF NOT EXISTS storageobjects (owner TEXT NOT NULL, key TEXT NOT NULL, content BLOB NOT NULL, bytes INTEGER NOT NULL, updatedat TEXT NOT NULL, PRIMARY KEY (owner, key))",
      "CREATE INDEX IF NOT EXISTS storageobjectsowner ON storageobjects(owner, updatedat DESC)"
    ];
    StorageError = class extends Error {
    };
    OWNERPATTERN = /^[a-z0-9][a-z0-9-]{5,63}$/i;
    KEYPATTERN = /^[a-z0-9][a-z0-9-]{0,63}(?:\/[a-z0-9][a-z0-9-]{0,63})*$/i;
    globalforprisma = globalThis;
    db = makedbproxy([]);
    QUOTACEILMB = 1048576;
    TIERQUOTAMB = Object.freeze({
      free: DEFAULTQUOTAMB,
      pro: 10240,
      enterprise: QUOTACEILMB
    });
    PLANSCHEMASTATEMENTS = [
      `CREATE TABLE IF NOT EXISTS "PlanState" ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "visitor" TEXT NOT NULL, "tier" TEXT NOT NULL DEFAULT 'free', "storagemb" BIGINT, "rammib" BIGINT, "since" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL )`,
      'CREATE UNIQUE INDEX IF NOT EXISTS "PlanState_visitor_key" ON "PlanState"("visitor")',
      'CREATE INDEX IF NOT EXISTS "PlanState_tier_idx" ON "PlanState"("tier")'
    ];
    databaseName = "devthink.db";
    databaseVersion = 3;
    dataStores = [
      "workspaces",
      "sessions",
      "tabs",
      "messages",
      "preferences",
      "labels"
    ];
    ownerExpression = /^[a-z][a-z0-9]{9,14}$/;
    DRIVES_KEY = "dt.hd.list";
  }
});

// auth.ts
function extractsessionid(req, body) {
  return req.headers.get("x-session-id") || body?.session_id || body?.sessionId || genid("sess");
}
function extractrequestid(req) {
  return req.headers.get("x-request-id") || genid("req");
}
async function keysfromdb(auth) {
  const model = auth.dbmodel ?? "apiKey";
  const take = auth.dbtake ?? 50;
  try {
    const { db: db2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const table = db2[model];
    if (!table) return [];
    const rows = await table.findMany({ where: { active: true, status: "active" }, take });
    return rows.map((row, idx) => ({
      key: String(row.keyValue ?? row.key ?? ""),
      label: String(row.label ?? (auth.keylabelformat ?? "key-{idx}").replace("{idx}", String(idx))),
      source: "db"
    })).filter((k) => k.key.length > 0);
  } catch {
    return [];
  }
}
function keysfromenv(auth) {
  if (!auth.envvar) return [];
  const raw = process.env[auth.envvar] ?? "";
  const sep = auth.envseparator ?? ",";
  const keys = raw.split(sep).map((k) => k.trim()).filter(Boolean);
  return keys.map((key, idx) => ({
    key,
    label: (auth.keylabelformat ?? "env-key-{idx}").replace("{idx}", String(idx)),
    source: "env"
  }));
}
function keysfrominline(auth) {
  return (auth.inlinekeys ?? []).map((key, idx) => ({
    key,
    label: (auth.keylabelformat ?? "inline-key-{idx}").replace("{idx}", String(idx)),
    source: "inline"
  }));
}
async function keysfromephemeral(auth) {
  if (!auth.keyurl) return [];
  try {
    const res = await fetch(auth.keyurl, { method: "GET" });
    const data = await res.json();
    const key = String(data.key ?? data.api_key ?? data.token ?? "");
    if (!key) return [];
    return [{ key, label: "ephemeral", source: "ephemeralurl" }];
  } catch {
    return [];
  }
}
async function resolvekeys(auth) {
  const sources = auth.keysources ?? ["env"];
  const minlen = auth.minkeylength ?? 10;
  const all = [];
  for (const source of sources) {
    if (source === "db") all.push(...await keysfromdb(auth));
    else if (source === "env") all.push(...keysfromenv(auth));
    else if (source === "inline") all.push(...keysfrominline(auth));
    else if (source === "ephemeralurl") all.push(...await keysfromephemeral(auth));
  }
  return all.filter((k) => k.key.length >= minlen);
}
function buildauthheaders(auth, key) {
  const headers = {};
  switch (auth.mode) {
    case "bearer":
    case "oauth2clientcredentials":
    case "jwtsign":
      headers["authorization"] = `Bearer ${key}`;
      break;
    case "apikeyheader":
      headers[auth.headername ?? "x-api-key"] = key;
      break;
    case "basic": {
      const encoded = Buffer.from(key).toString("base64");
      headers["authorization"] = `Basic ${encoded}`;
      break;
    }
    case "queryparam":
    case "cookie":
    case "mtls":
    case "sigv4":
    case "hmacsign":
    case "keylesssdk":
    case "anonymous":
    case "none":
      break;
  }
  for (const [k, v] of Object.entries(auth.extraheaders ?? {})) {
    headers[k] = v;
  }
  return headers;
}
var init_auth = __esm({
  "auth.ts"() {
    "use strict";
    init_utils();
  }
});

// engine.ts
function createsessionstore() {
  const sessions = /* @__PURE__ */ new Map();
  return {
    get(sessionid) {
      let s = sessions.get(sessionid);
      if (!s) {
        s = { messagecount: 0, rotationindex: 0, model: "" };
        sessions.set(sessionid, s);
      }
      return s;
    },
    bump(sessionid) {
      const s = this.get(sessionid);
      s.messagecount += 1;
      return s;
    }
  };
}
async function getzai() {
  if (!zaipromise) {
    const mod = await import("z-ai-web-dev-sdk");
    const ZAI = mod.default ?? mod;
    zaipromise = ZAI.create();
  }
  return zaipromise;
}
async function zaisdkcall(messages, opts) {
  const zai = await getzai();
  const res = await zai.chat.completions.create({
    messages,
    ...opts.thinking !== void 0 ? { thinking: opts.thinking } : {},
    ...opts.max_tokens !== void 0 ? { max_tokens: opts.max_tokens } : {},
    ...opts.temperature !== void 0 ? { temperature: opts.temperature } : {},
    stream: opts.stream ?? false
  });
  const choice = res.choices?.[0]?.message;
  return {
    content: choice?.content ?? "",
    reasoning: choice?.reasoning_content
  };
}
function findmodel(cfg, id) {
  return cfg.models.find((m) => m.id === id);
}
function resolvemodel(cfg, requested, session, globalcounter) {
  const metaid = cfg.metamodel.id;
  const rotationmodels = cfg.rotation?.models ?? [];
  const ismetarequest = requested === metaid || requested === void 0 || requested === "";
  if (ismetarequest && rotationmodels.length > 0 && cfg.rotation?.mode !== "none") {
    const everyn = cfg.rotation?.everynmessages ?? 6;
    let idx;
    if (cfg.rotation?.mode === "perrequest") {
      idx = globalcounter.n % rotationmodels.length;
      globalcounter.n += 1;
    } else {
      idx = Math.floor(session.messagecount / everyn) % rotationmodels.length;
      if (cfg.rotation?.staggernewsessions && session.messagecount === 0) {
        idx = (idx + globalcounter.n) % rotationmodels.length;
        globalcounter.n += 1;
      }
    }
    const modelid = rotationmodels[idx] ?? rotationmodels[0];
    const model2 = findmodel(cfg, modelid);
    session.model = modelid;
    session.rotationindex = idx;
    return {
      model: model2,
      modelid,
      display: cfg.metamodel.alwaysdisplay ? metaid : modelid,
      ismeta: true,
      rotationindex: idx
    };
  }
  if (requested && !ismetarequest) {
    const model2 = findmodel(cfg, requested);
    if (model2) {
      return {
        model: model2,
        modelid: requested,
        display: cfg.metamodel.alwaysdisplay ? metaid : requested,
        ismeta: false,
        rotationindex: -1
      };
    }
  }
  const defaultid = cfg.defaultmodel ?? rotationmodels[0] ?? cfg.models[0]?.id ?? metaid;
  const model = findmodel(cfg, defaultid);
  return {
    model,
    modelid: defaultid,
    display: cfg.metamodel.alwaysdisplay ? metaid : defaultid,
    ismeta: defaultid === metaid,
    rotationindex: -1
  };
}
function fusioncontext(cfg, modelsonly) {
  if (cfg.metamodel.contextoverride !== void 0) return cfg.metamodel.contextoverride;
  const pool = modelsonly ?? cfg.models;
  return pool.reduce((sum, m) => sum + m.context, 0);
}
async function resolveauth(cfg, _req) {
  const auth = cfg.auth;
  if (auth.mode === "anonymous" || auth.mode === "none" || auth.mode === "keylesssdk") {
    return null;
  }
  const keys = await resolvekeys(auth);
  if (keys.length === 0) {
    if (auth.required) {
      return null;
    }
    return null;
  }
  const idx = resolveauth.cursor % keys.length;
  resolveauth.cursor = (resolveauth.cursor + 1) % Math.max(keys.length, 1);
  return keys[idx];
}
function buildheaders(cfg, key, stream) {
  const auth = cfg.auth;
  const headers = {
    "content-type": "application/json",
    ...cfg.headers?.useragent ? { "user-agent": cfg.headers.useragent } : {},
    ...auth.extraheaders ?? {}
  };
  if (stream) headers["accept"] = "text/event-stream";
  if (key) {
    Object.assign(headers, buildauthheaders(auth, key.key));
  }
  return headers;
}
function buildbody(cfg, body, model, overridemodel) {
  const out = { ...body };
  const modelid = overridemodel ?? model?.id ?? cfg.defaultmodel ?? cfg.metamodel.id;
  const upstreamid = model?.upstream ?? modelid;
  out["model"] = upstreamid;
  delete out["apiKey"];
  delete out["api_key"];
  delete out["token"];
  const thinkinglevel = autothinking(body["thinking"] ?? body["reasoning_effort"]);
  const budgets = cfg.thinking?.budgets ?? defaultbudgets;
  const budget = budgets[thinkinglevel] ?? 0;
  if (cfg.thinking?.param === "chattemplatekwargs" || model?.chattemplatekwargs) {
    const kwargs = model?.chattemplatekwargs ?? { enable_thinking: thinkinglevel !== "none" };
    out["chat_template_kwargs"] = { ...kwargs };
    delete out["thinking"];
    delete out["reasoning_effort"];
  } else {
    if (body["thinking"] !== void 0 || thinkinglevel !== "none") {
      out["thinking"] = thinkinglevel === "none" ? { type: "disabled" } : { type: "enabled", budget };
    }
    delete out["reasoning_effort"];
  }
  const policy = cfg.bodybuild?.optionalparamspolicy ?? "always";
  const userfields = {};
  const paramnames = [
    "temperature",
    "top_p",
    "n",
    "frequency_penalty",
    "presence_penalty",
    "seed",
    "stop",
    "max_tokens"
  ];
  for (const p of paramnames) {
    if (body[p] !== void 0) userfields[p] = body[p];
  }
  if (policy === "omit-unspecified") {
    if (userfields["temperature"] !== void 0) out["temperature"] = autotemp(userfields["temperature"]);
    if (userfields["top_p"] !== void 0) out["top_p"] = autotopp(userfields["top_p"]);
    if (userfields["n"] !== void 0) out["n"] = auton(userfields["n"]);
    if (userfields["frequency_penalty"] !== void 0)
      out["frequency_penalty"] = autofrequencypenalty(userfields["frequency_penalty"]);
    if (userfields["presence_penalty"] !== void 0)
      out["presence_penalty"] = autopresencepenalty(userfields["presence_penalty"]);
    if (userfields["seed"] !== void 0) out["seed"] = autoseed(userfields["seed"]);
    if (userfields["stop"] !== void 0) out["stop"] = userfields["stop"];
  } else {
    out["temperature"] = autotemp(userfields["temperature"]);
    out["top_p"] = autotopp(userfields["top_p"]);
    out["n"] = auton(userfields["n"]);
    out["frequency_penalty"] = autofrequencypenalty(userfields["frequency_penalty"]);
    out["presence_penalty"] = autopresencepenalty(userfields["presence_penalty"]);
    if (userfields["seed"] !== void 0) out["seed"] = autoseed(userfields["seed"]);
    if (userfields["stop"] !== void 0) out["stop"] = userfields["stop"];
  }
  const clampmax = cfg.bodybuild?.clampmaxtokens ?? true;
  const clampceiling = cfg.defaults?.maxtokensclamp ?? 98304;
  const modelmax = model?.maxoutput ?? clampceiling;
  if (clampmax) {
    out["max_tokens"] = clamp(Number(body["max_tokens"] ?? defaultmaxtokens), 1, Math.min(modelmax, clampceiling));
  } else {
    out["max_tokens"] = Number(body["max_tokens"] ?? defaultmaxtokens);
  }
  return out;
}
async function reconstructhistory(cfg, sessionid, incoming) {
  if (!cfg.context?.restoresessionhistory || !sessionid) return incoming;
  try {
    const limit = cfg.context?.historylimit ?? 1e3;
    const past = await getsessionmessages(sessionid, limit);
    const history = [];
    for (const row of past) {
      if (row.role === "user" || row.role === "assistant") {
        const role = row.role;
        const content = String(row.content ?? row.completion ?? "");
        if (content) history.push({ role, content });
      }
    }
    const incomingjson = incoming.map((m) => safestringify(m));
    const _deduped = [];
    let skip = 0;
    for (let i = 0; i < Math.min(history.length, incomingjson.length); i++) {
      const h = safestringify({
        role: history[i].role,
        content: history[i].content
      });
      if (h === incomingjson[i]) skip = i + 1;
      else break;
    }
    const merged = [...history.slice(skip), ...incoming];
    return merged;
  } catch {
    return incoming;
  }
}
function fitcontext(cfg, messages, model) {
  if (!cfg.context) return messages;
  const percall = model?.context ?? cfg.context?.percallfallback ?? 1048576;
  const margin = cfg.context?.truncatemargin ?? 4096;
  return truncatemessages(messages, percall - margin);
}
function backoffms(cfg, attempt) {
  const retry = cfg.retry ?? {};
  const base = retry.backoffbasems ?? 400;
  const cap = retry.backoffcapms ?? 8e3;
  const jitter = retry.jitter ?? 0.2;
  const raw = Math.min(cap, base * 2 ** attempt);
  const j = raw * (1 - jitter + securerandom() * jitter * 2);
  return Math.round(j);
}
function classifystatus(cfg, status) {
  const retryset = new Set(cfg.retry?.statuses ?? defaultretrystatuses);
  const rotateset = new Set(cfg.rotation?.rotateonstatus ?? []);
  const fallbackset = new Set(
    cfg.retry?.fallbackstatuses ?? (cfg.retry?.fallback === "crossprovider" ? defaultfallbackstatuses : [])
  );
  const nonretryable = new Set(cfg.retry?.nonretryable ?? [400]);
  if (nonretryable.has(status)) return "fail";
  if (retryset.has(status)) return "retry";
  if (rotateset.has(status)) return "rotate";
  if (fallbackset.has(status)) return "fallback";
  if (status >= 500) return "retry";
  return "fail";
}
async function executefetch(cfg, upstream, url, headers, body, stream, session) {
  const retry = cfg.retry ?? {};
  const maxretries = retry.maxretries ?? 0;
  const maxrotations = cfg.rotation?.maxmodelrotations ?? 1;
  const timeoutms = cfg.timeout?.modelswitchintervalms ?? cfg.timeout?.requestms ?? 3e5;
  const streamtimeout = cfg.timeout?.streamms ?? 2147483647;
  const rotationmodels = cfg.rotation?.models ?? [];
  let lastresponse = null;
  let lasterror = null;
  for (let rotation = 0; rotation < maxrotations; rotation++) {
    const attempturl = url;
    let attemptbody = body;
    if (rotation > 0 && rotationmodels.length > 0) {
      const idx = (session.rotationindex + rotation) % rotationmodels.length;
      const nextmodel = rotationmodels[idx];
      const model = findmodel(cfg, nextmodel);
      if (model) {
        attemptbody = { ...body, model: model.upstream ?? nextmodel };
        session.model = nextmodel;
        session.rotationindex = idx;
      }
    }
    for (let attempt = 0; attempt <= maxretries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), stream ? streamtimeout : timeoutms);
      try {
        const key = await resolveauth(cfg);
        const finalheaders = { ...headers, ...key ? buildauthheaders(cfg.auth, key.key) : {} };
        const res = await fetch(attempturl, {
          method: "POST",
          headers: finalheaders,
          body: safestringify(attemptbody),
          signal: controller.signal
        });
        clearTimeout(timer);
        if (res.ok) return res;
        const action = classifystatus(cfg, res.status);
        if (action === "retry" && attempt < maxretries) {
          await sleep(backoffms(cfg, attempt));
          continue;
        }
        if (action === "rotate" || action === "fallback") {
          lastresponse = res;
          break;
        }
        return res;
      } catch (err) {
        clearTimeout(timer);
        lasterror = err;
        const aborted = err instanceof Error && err.name === "AbortError";
        if (aborted && cfg.rotation?.rotateontimeout) {
          break;
        }
        if (attempt < maxretries) {
          await sleep(backoffms(cfg, attempt));
          continue;
        }
        if (rotation + 1 < maxrotations) break;
      }
    }
    if (cfg.retry?.fallback === "crossprovider" && upstream.fallback) {
      const fb = cfg.upstreams.find((u) => u.name === upstream.fallback);
      if (fb) {
        try {
          const key = await resolveauth(cfg);
          const finalheaders = { ...headers, ...key ? buildauthheaders(cfg.auth, key.key) : {} };
          const res = await fetch(fb.baseurl + (fb.endpoints?.chat ?? "/chat/completions"), {
            method: "POST",
            headers: finalheaders,
            body: safestringify(attemptbody),
            signal: AbortSignal.timeout(cfg.timeout?.requestms ?? 3e5)
          });
          if (res.ok) return res;
          lastresponse = res;
        } catch (err) {
          lasterror = err;
        }
      }
    }
  }
  if (lastresponse) return lastresponse;
  return new Response(
    safestringify({
      error: lasterror instanceof Error ? lasterror.message : "upstream request failed",
      object: "error"
    }),
    { status: 502, headers: jsonheaders() }
  );
}
function chatcompletion(cfg, id, model, content, reasoning, usage) {
  return {
    id,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1e3),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content,
          ...reasoning ? { reasoning_content: reasoning } : {}
        },
        finish_reason: "stop"
      }
    ],
    usage,
    provider: cfg.providername
  };
}
function makeinfopayload(cfg) {
  const modelcount = cfg.models.length;
  return {
    version: cfg.id,
    name: cfg.name ?? cfg.id,
    provider: cfg.providername,
    paused: cfg.paused ?? false,
    upstream: cfg.upstreams[0]?.baseurl ?? "",
    upstreams: cfg.upstreams.map((u) => ({ name: u.name, baseurl: u.baseurl })),
    auth: {
      mode: cfg.auth.mode,
      required: cfg.auth.required ?? false,
      ...cfg.auth.envvar ? { envvar: cfg.auth.envvar } : {},
      ...cfg.auth.signupurl ? { signup: cfg.auth.signupurl } : {}
    },
    models: modelcount,
    ...cfg.rotation ? {
      rotation: {
        mode: cfg.rotation.mode,
        models: cfg.rotation.models.length,
        everynmessages: cfg.rotation.everynmessages ?? 6
      }
    } : {},
    ...cfg.retry?.maxretries ? {
      retry: {
        maxretries: cfg.retry.maxretries,
        backoffbasems: cfg.retry.backoffbasems ?? 400,
        backoffcapms: cfg.retry.backoffcapms ?? 8e3,
        statuses: cfg.retry.statuses ?? defaultretrystatuses
      }
    } : {},
    ...cfg.timeout?.modelswitchintervalms ? { modeltimeoutms: cfg.timeout.modelswitchintervalms } : {},
    fusioncontext: fusioncontext(cfg),
    metamodel: {
      id: cfg.metamodel.id,
      context: cfg.metamodel.contextoverride ?? fusioncontext(cfg),
      maxoutput: cfg.metamodel.maxoutput ?? 32768,
      ...cfg.metamodel.pattern ? { pattern: cfg.metamodel.pattern } : {}
    },
    routes: ["chat/completions", "completions", "messages", "responses", "embeddings", "keys", "models"],
    ...cfg.note ? { note: cfg.note } : {}
  };
}
function createversion(cfg) {
  const sessions = createsessionstore();
  const globalcounter = { n: 0 };
  const metaid = cfg.metamodel.id;
  function invalidbody(message) {
    return new Response(safestringify({ error: message, code: "invalid_request", object: "error" }), {
      status: 400,
      headers: jsonheaders()
    });
  }
  async function parsebody(req) {
    const raw = await req.text();
    const parsed = safejsonparse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed;
  }
  async function handleinfo(req) {
    const cors2 = handlecors(req);
    if (cors2) return cors2;
    return new Response(safestringify(makeinfopayload(cfg)), { headers: jsonheaders() });
  }
  async function handlekeys(req) {
    const cors2 = handlecors(req);
    if (cors2) return cors2;
    const auth = cfg.auth;
    const keycount = auth.keysources?.includes("env") && auth.envvar ? (process.env[auth.envvar] ?? "").split(auth.envseparator ?? ",").filter(Boolean).length : 0;
    return new Response(
      safestringify({
        authmode: auth.mode,
        required: auth.required ?? false,
        ...auth.envvar ? { envvar: auth.envvar, envkeycount: keycount } : {},
        ...auth.signupurl ? { signup: auth.signupurl } : {},
        ...auth.keyurl ? { keyurl: auth.keyurl, keyexpiryminutes: auth.keyexpiryminutes ?? 60 } : {},
        provider: cfg.providername,
        upstream: cfg.upstreams[0]?.baseurl ?? "",
        models: cfg.models.map((m) => m.id),
        version: cfg.id
      }),
      { headers: jsonheaders() }
    );
  }
  async function handlemodels(req) {
    const cors2 = handlecors(req);
    if (cors2) return cors2;
    const models = cfg.models.map((m) => ({
      id: m.id,
      object: "model",
      created: cfg.metamodel.listedcreated ?? 17e8,
      owned_by: cfg.providername,
      permission: [],
      root: m.id,
      parent: null,
      max_context_length: m.context,
      max_output_tokens: m.maxoutput,
      supports_thinking: m.reasoning ?? true,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: m.vision ?? false,
      ...m.free !== void 0 ? { free: m.free } : {},
      ...m.rank ? { rank: m.rank } : {}
    }));
    const metaentry = {
      id: metaid,
      object: "model",
      created: cfg.metamodel.listedcreated ?? 17e8,
      owned_by: metaid,
      permission: [],
      root: metaid,
      parent: null,
      max_context_length: cfg.metamodel.contextoverride ?? fusioncontext(cfg),
      max_output_tokens: cfg.metamodel.maxoutput ?? 32768,
      supports_thinking: true,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: false,
      description: cfg.metamodel.pattern ?? `${metaid} meta model over ${cfg.providername}`,
      meta: {
        provider: cfg.providername,
        ...cfg.rotation?.models.length ? { rotationbackends: cfg.rotation.models } : {}
      }
    };
    return new Response(safestringify({ object: "list", data: [metaentry, ...models] }), {
      headers: jsonheaders()
    });
  }
  function pausedresponse() {
    if (!cfg.paused) return null;
    const routes = cfg.routes ?? {};
    return new Response(
      safestringify({
        error: routes.pausedmessage ?? `${cfg.id} is paused`,
        fallback: routes.fallbackroute,
        status: routes.pausedstatus ?? 503,
        object: "error"
      }),
      { status: routes.pausedstatus ?? 503, headers: jsonheaders() }
    );
  }
  async function handlechatcompletions(req) {
    const cors2 = handlecors(req);
    if (cors2) return cors2;
    const paused = pausedresponse();
    if (paused) return paused;
    const startedat = Date.now();
    try {
      const body = await parsebody(req);
      if (body === null) return invalidbody("request body is not valid json");
      const incoming = Array.isArray(body["messages"]) ? body["messages"] : [];
      if (incoming.length === 0) return invalidbody("messages must be a non-empty array");
      const stream = body["stream"] === true;
      const sessionid = extractsessionid(req, body) || `s_${Date.now()}_${randombase36(6)}`;
      const requestid = extractrequestid(req) || genid("req");
      const session = sessions.bump(sessionid);
      const resolved = resolvemodel(cfg, body["model"], session, globalcounter);
      const displaymodel = resolved.display || metaid;
      const history = await reconstructhistory(cfg, sessionid, incoming);
      const fitted = fitcontext(cfg, history, resolved.model);
      if (cfg.transport?.type === "zai-sdk") {
        return await executezaisdk(cfg, body, fitted, resolved, displaymodel, stream, {
          sessionid,
          requestid,
          startedat
        });
      }
      const upstream = cfg.upstreams[0];
      if (!upstream) {
        return new Response(safestringify({ error: "no upstream configured", object: "error" }), {
          status: 500,
          headers: jsonheaders()
        });
      }
      const auth = cfg.auth;
      if (auth.required && auth.mode !== "keylesssdk" && auth.mode !== "anonymous" && auth.mode !== "none") {
        const keys = await resolvekeys(auth);
        if (keys.length === 0) {
          return new Response(
            safestringify({
              error: auth.envvar ? `${cfg.providername} api key required \u2014 set ${auth.envvar} env var${auth.signupurl ? ` or signup at ${auth.signupurl}` : ""}` : "api key required",
              code: "key_required",
              ...auth.signupurl ? { signup: auth.signupurl } : {}
            }),
            { status: 401, headers: jsonheaders() }
          );
        }
      }
      const upstreambody = buildbody(cfg, { ...body, messages: fitted, model: resolved.modelid }, resolved.model);
      const url = upstream.baseurl + (upstream.endpoints?.chat ?? "/chat/completions");
      const headers = buildheaders(cfg, null, stream);
      const upstreamresponse = await executefetch(cfg, upstream, url, headers, upstreambody, stream, session);
      if (!upstreamresponse.ok && !stream) {
        const errtext = await upstreamresponse.text().catch(() => "");
        await persist(cfg, {
          sessionid,
          requestid,
          route: "chat/completions",
          model: displaymodel,
          modelvariant: resolved.modelid,
          status: "error",
          httpstatus: upstreamresponse.status,
          error: errtext.slice(0, 500),
          stream,
          startedat,
          rotationindex: resolved.rotationindex,
          messagenumber: session.messagecount
        });
        return new Response(errtext || safestringify({ error: "upstream error", status: upstreamresponse.status }), {
          status: upstreamresponse.status,
          headers: jsonheaders()
        });
      }
      if (stream) {
        await persist(cfg, {
          sessionid,
          requestid,
          route: "chat/completions",
          model: displaymodel,
          modelvariant: resolved.modelid,
          status: "completed",
          stream,
          streammode: "bytepassthrough",
          startedat,
          rotationindex: resolved.rotationindex,
          messagenumber: session.messagecount,
          contextshared: resolved.ismeta
        });
        return makestreamresponse(upstreamresponse, {
          mask: cfg.metamodel.maskupstreammodel ? metaid : null,
          onfinal: (tracked) => {
            void persist(cfg, {
              sessionid,
              requestid,
              route: "chat/completions",
              model: displaymodel,
              modelvariant: resolved.modelid,
              status: "completed",
              stream,
              startedat,
              content: tracked.content?.slice(0, 2e3),
              reasoningcontent: tracked.reasoning?.slice(0, 2e3),
              totaltokens: tracked.totaltokens,
              rotationindex: resolved.rotationindex,
              messagenumber: session.messagecount
            });
          }
        });
      }
      const data = await safejsonparse(await upstreamresponse.text());
      const choices = data?.["choices"] ?? [];
      const choice = choices[0]?.["message"];
      const content = String(choice?.["content"] ?? "");
      const reasoning = String(choice?.["reasoning_content"] ?? choice?.["reasoning"] ?? "");
      const usage = data?.["usage"] ?? {
        prompt_tokens: esttokens(safestringify(fitted)),
        completion_tokens: Math.ceil(content.length / 4),
        total_tokens: esttokens(safestringify(fitted)) + Math.ceil(content.length / 4)
      };
      const responseid = String(data?.["id"] ?? genid());
      const payload = chatcompletion(cfg, responseid, displaymodel, content, reasoning || void 0, usage);
      await persist(cfg, {
        sessionid,
        requestid,
        route: "chat/completions",
        model: displaymodel,
        modelvariant: resolved.modelid,
        status: "completed",
        stream,
        startedat,
        content: String(content).slice(0, 2e3),
        reasoningcontent: String(reasoning).slice(0, 2e3),
        prompttokens: Number(usage["prompt_tokens"] ?? 0),
        completiontokens: Number(usage["completion_tokens"] ?? 0),
        totaltokens: Number(usage["total_tokens"] ?? 0),
        rotationindex: resolved.rotationindex,
        messagenumber: session.messagecount,
        contextshared: resolved.ismeta
      });
      return new Response(safestringify(payload), { headers: jsonheaders() });
    } catch (err) {
      return new Response(
        safestringify({
          error: err instanceof Error ? err.message : "internal error",
          object: "error"
        }),
        {
          status: 500,
          headers: jsonheaders()
        }
      );
    }
  }
  async function executezaisdk(cfg2, body, messages, resolved, displaymodel, stream, meta) {
    const budgets = cfg2.thinking?.budgets ?? defaultbudgets;
    const level = autothinking(body["thinking"] ?? body["reasoning_effort"]);
    const thinkingbudget = budgets[level] ?? 0;
    const responsemax = Number(body["max_tokens"] ?? cfg2.metamodel.maxoutput ?? 32768);
    const threshold = cfg2.thinking?.twocalls?.threshold ?? TWOCALLSTHRESHOLD;
    const twocalls = twocallspattern({ level, responsemax, threshold, budget: thinkingbudget });
    try {
      if (twocalls) {
        const call1 = await zaisdkcall(messages, {
          thinking: { type: "enabled", budget: thinkingbudget },
          max_tokens: Math.min(thinkingbudget, threshold)
        });
        const reasoning = call1.reasoning ?? "";
        if (stream) {
          const content2 = call1.content ?? "";
          const sametext2 = reasoning === content2;
          let finalcontent = content2;
          if (sametext2 && cfg2.thinking?.twocalls?.freshresponseguarantee !== false) {
            const call2 = await zaisdkcall(messages, {
              thinking: { type: "disabled" },
              max_tokens: Math.min(responsemax, threshold)
            });
            finalcontent = call2.content ?? content2;
          }
          const id3 = genid();
          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              try {
                for (let i = 0; i < reasoning.length; i += 50) {
                  const piece = reasoning.slice(i, i + 50);
                  controller.enqueue(
                    encoder.encode(`data: ${safestringify(makechunk(id3, displaymodel, "", piece))}

`)
                  );
                }
                for (let i = 0; i < finalcontent.length; i += 50) {
                  const piece = finalcontent.slice(i, i + 50);
                  controller.enqueue(encoder.encode(`data: ${safestringify(makechunk(id3, displaymodel, piece))}

`));
                }
                controller.enqueue(
                  encoder.encode(`data: ${safestringify(makefinalchunk(id3, displaymodel, "stop"))}

`)
                );
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
              } catch {
                try {
                  controller.close();
                } catch {
                }
              }
            }
          });
          await persist(cfg2, {
            ...meta,
            route: "chat/completions",
            model: displaymodel,
            modelvariant: resolved.modelid,
            status: "completed",
            stream: true,
            streammode: "twocalls",
            content: finalcontent.slice(0, 2e3),
            reasoningcontent: reasoning.slice(0, 2e3),
            twocalls: true,
            thinkingbudget
          });
          return new Response(readable, {
            headers: { ...corsheaders, "content-type": "text/event-stream" }
          });
        }
        const sametext = reasoning === call1.content;
        let content = call1.content ?? "";
        if (sametext && cfg2.thinking?.twocalls?.freshresponseguarantee !== false) {
          const call2 = await zaisdkcall(messages, {
            thinking: { type: "disabled" },
            max_tokens: Math.min(responsemax, threshold)
          });
          content = call2.content ?? content;
        }
        const id2 = genid();
        const payload2 = chatcompletion(cfg2, id2, displaymodel, content, reasoning || void 0, {
          prompt_tokens: esttokens(safestringify(messages)),
          completion_tokens: Math.ceil((content.length + reasoning.length) / 4),
          total_tokens: esttokens(safestringify(messages)) + Math.ceil((content.length + reasoning.length) / 4)
        });
        await persist(cfg2, {
          ...meta,
          route: "chat/completions",
          model: displaymodel,
          modelvariant: resolved.modelid,
          status: "completed",
          stream: false,
          content: content.slice(0, 2e3),
          reasoningcontent: reasoning.slice(0, 2e3),
          twocalls: true,
          thinkingbudget,
          totaltokens: Number(payload2["usage"] ? payload2["usage"]["total_tokens"] : 0)
        });
        return new Response(safestringify(payload2), { headers: jsonheaders() });
      }
      const result = await zaisdkcall(messages, { max_tokens: responsemax });
      const id = genid();
      const payload = chatcompletion(cfg2, id, displaymodel, result.content, result.reasoning || void 0, {
        prompt_tokens: esttokens(safestringify(messages)),
        completion_tokens: Math.ceil(result.content.length / 4),
        total_tokens: esttokens(safestringify(messages)) + Math.ceil(result.content.length / 4)
      });
      await persist(cfg2, {
        ...meta,
        route: "chat/completions",
        model: displaymodel,
        modelvariant: resolved.modelid,
        status: "completed",
        stream: false,
        content: result.content.slice(0, 2e3),
        reasoningcontent: (result.reasoning ?? "").slice(0, 2e3)
      });
      return new Response(safestringify(payload), { headers: jsonheaders() });
    } catch (err) {
      return new Response(
        safestringify({
          error: err instanceof Error ? err.message : "zai sdk call failed",
          object: "error"
        }),
        {
          status: 500,
          headers: jsonheaders()
        }
      );
    }
  }
  async function handlecompletions(req) {
    const cors2 = handlecors(req);
    if (cors2) return cors2;
    const paused = pausedresponse();
    if (paused) return paused;
    try {
      const body = await parsebody(req);
      if (body === null) return invalidbody("request body is not valid json");
      const prompt = body["prompt"];
      if (typeof prompt !== "string" && !Array.isArray(prompt)) {
        return invalidbody("prompt must be a string or an array of strings");
      }
      if (prompt.length === 0) return invalidbody("prompt must not be empty");
      const sessionid = extractsessionid(req, body) || `s_${Date.now()}`;
      const session = sessions.bump(sessionid);
      const resolved = resolvemodel(cfg, body["model"], session, globalcounter);
      const messages = typeof prompt === "string" ? [{ role: "user", content: prompt }] : Array.isArray(prompt) ? prompt.map((p) => ({ role: "user", content: p })) : [];
      if (cfg.transport?.type === "zai-sdk") {
        const result = await zaisdkcall(messages, {
          max_tokens: Number(body["max_tokens"] ?? defaultmaxtokens)
        });
        const payload2 = {
          id: genid(),
          object: "text_completion",
          created: Math.floor(Date.now() / 1e3),
          model: resolved.display,
          choices: [{ index: 0, text: result.content, finish_reason: "stop" }],
          usage: {
            prompt_tokens: esttokens(safestringify(messages)),
            completion_tokens: Math.ceil(result.content.length / 4)
          },
          provider: cfg.providername
        };
        await persist(cfg, {
          sessionid,
          requestid: genid("req"),
          route: "completions",
          model: resolved.display,
          status: "completed",
          startedat: Date.now()
        });
        return new Response(safestringify(payload2), { headers: jsonheaders() });
      }
      const upstream = cfg.upstreams[0];
      const upstreambody = buildbody(cfg, { ...body, messages, model: resolved.modelid }, resolved.model);
      delete upstreambody["prompt"];
      const url = upstream.baseurl + (upstream.endpoints?.completions ?? "/chat/completions");
      const headers = buildheaders(cfg, null, body["stream"] === true);
      const res = await executefetch(cfg, upstream, url, headers, upstreambody, body["stream"] === true, session);
      if (body["stream"] === true && res.ok) {
        return makestreamresponse(res, { mask: cfg.metamodel.maskupstreammodel ? metaid : null });
      }
      const data = await safejsonparse(await res.text());
      const choices = data?.["choices"] ?? [];
      const choice = choices[0]?.["message"];
      const payload = {
        id: data?.["id"] ?? genid(),
        object: "text_completion",
        created: data?.["created"] ?? Math.floor(Date.now() / 1e3),
        model: resolved.display,
        choices: [{ index: 0, text: String(choice?.["content"] ?? ""), finish_reason: "stop" }],
        usage: data?.["usage"] ?? {},
        provider: cfg.providername
      };
      await persist(cfg, {
        sessionid,
        requestid: genid("req"),
        route: "completions",
        model: resolved.display,
        status: "completed",
        startedat: Date.now()
      });
      return new Response(safestringify(payload), { headers: jsonheaders() });
    } catch (err) {
      return new Response(safestringify({ error: err instanceof Error ? err.message : "internal error" }), {
        status: 500,
        headers: jsonheaders()
      });
    }
  }
  async function handlemessages(req) {
    const cors2 = handlecors(req);
    if (cors2) return cors2;
    const paused = pausedresponse();
    if (paused) return paused;
    try {
      const body = await parsebody(req);
      if (body === null) return invalidbody("request body is not valid json");
      const sessionid = extractsessionid(req, body) || `s_${Date.now()}`;
      const session = sessions.bump(sessionid);
      const resolved = resolvemodel(cfg, body["model"], session, globalcounter);
      const anthropicmessages = Array.isArray(body["messages"]) ? body["messages"] : [];
      if (anthropicmessages.length === 0) {
        return invalidbody("messages must be a non-empty array");
      }
      const messages = anthropicmessages.map((m) => ({
        role: m["role"] === "assistant" ? "assistant" : "user",
        content: typeof m["content"] === "string" ? m["content"] : Array.isArray(m["content"]) ? m["content"].map((c) => c["text"] ?? "").join("\n") : ""
      }));
      if (body["system"]) messages.unshift({ role: "system", content: String(body["system"]) });
      if (cfg.transport?.type === "zai-sdk") {
        const result = await zaisdkcall(messages, {
          max_tokens: Number(body["max_tokens"] ?? 4096)
        });
        const payload2 = {
          id: `msg_${genid("")}`,
          type: "message",
          role: "assistant",
          model: resolved.display,
          content: [{ type: "text", text: result.content }],
          ...result.reasoning ? { reasoning_content: result.reasoning } : {},
          stop_reason: "end_turn",
          usage: {
            input_tokens: esttokens(safestringify(messages)),
            output_tokens: Math.ceil(result.content.length / 4)
          }
        };
        await persist(cfg, {
          sessionid,
          requestid: genid("req"),
          route: "messages",
          model: resolved.display,
          status: "completed",
          startedat: Date.now()
        });
        return new Response(safestringify(payload2), { headers: jsonheaders() });
      }
      const upstream = cfg.upstreams[0];
      const upstreambody = buildbody(
        cfg,
        { ...body, messages, model: resolved.modelid, max_tokens: body["max_tokens"] ?? 4096 },
        resolved.model
      );
      const url = upstream.baseurl + (upstream.endpoints?.chat ?? "/chat/completions");
      const headers = buildheaders(cfg, null, body["stream"] === true);
      const res = await executefetch(cfg, upstream, url, headers, upstreambody, body["stream"] === true, session);
      if (body["stream"] === true && res.ok) {
        return makestreamresponse(res, { mask: cfg.metamodel.maskupstreammodel ? metaid : null });
      }
      const data = await safejsonparse(await res.text());
      const choices = data?.["choices"] ?? [];
      const choice = choices[0]?.["message"];
      const payload = {
        id: `msg_${data?.["id"] ?? genid("")}`,
        type: "message",
        role: "assistant",
        model: resolved.display,
        content: [{ type: "text", text: String(choice?.["content"] ?? "") }],
        ...choice?.["reasoning_content"] ? { reasoning_content: choice["reasoning_content"] } : {},
        stop_reason: "end_turn",
        usage: {
          input_tokens: Number(data?.["usage"]?.["prompt_tokens"] ?? 0),
          output_tokens: Number(data?.["usage"]?.["completion_tokens"] ?? 0)
        }
      };
      await persist(cfg, {
        sessionid,
        requestid: genid("req"),
        route: "messages",
        model: resolved.display,
        status: "completed",
        startedat: Date.now()
      });
      return new Response(safestringify(payload), { headers: jsonheaders() });
    } catch (err) {
      return new Response(safestringify({ error: err instanceof Error ? err.message : "internal error" }), {
        status: 500,
        headers: jsonheaders()
      });
    }
  }
  async function handleresponses(req) {
    const cors2 = handlecors(req);
    if (cors2) return cors2;
    const paused = pausedresponse();
    if (paused) return paused;
    try {
      const body = await parsebody(req);
      if (body === null) return invalidbody("request body is not valid json");
      const sessionid = extractsessionid(req, body) || `s_${Date.now()}`;
      const session = sessions.bump(sessionid);
      const resolved = resolvemodel(cfg, body["model"], session, globalcounter);
      const input = body["input"] ?? body["messages"];
      if (typeof input !== "string" && !Array.isArray(input)) {
        return invalidbody("input must be a string or an array");
      }
      if (Array.isArray(input) && input.length === 0) {
        return invalidbody("input must not be empty");
      }
      const messages = typeof input === "string" ? [{ role: "user", content: input }] : Array.isArray(input) ? input : [];
      if (cfg.transport?.type === "zai-sdk") {
        const result = await zaisdkcall(messages, {
          max_tokens: Number(body["max_output_tokens"] ?? 4096)
        });
        const responseid = `resp_${genid("")}`;
        const payload2 = {
          id: responseid,
          object: "response",
          created_at: Math.floor(Date.now() / 1e3),
          model: resolved.display,
          status: "completed",
          output: [
            {
              type: "message",
              id: `msg_${genid("")}`,
              role: "assistant",
              content: [
                {
                  type: "output_text",
                  text: result.content,
                  ...result.reasoning ? { reasoning: result.reasoning } : {}
                }
              ]
            }
          ],
          usage: {
            input_tokens: esttokens(safestringify(messages)),
            output_tokens: Math.ceil(result.content.length / 4)
          }
        };
        await persist(cfg, {
          sessionid,
          requestid: genid("req"),
          route: "responses",
          model: resolved.display,
          status: "completed",
          startedat: Date.now()
        });
        return new Response(safestringify(payload2), { headers: jsonheaders() });
      }
      const upstream = cfg.upstreams[0];
      const upstreambody = buildbody(cfg, { ...body, messages, model: resolved.modelid }, resolved.model);
      const url = upstream.baseurl + (upstream.endpoints?.chat ?? "/chat/completions");
      const headers = buildheaders(cfg, null, body["stream"] === true);
      const res = await executefetch(cfg, upstream, url, headers, upstreambody, body["stream"] === true, session);
      const data = await safejsonparse(await res.text());
      const choices = data?.["choices"] ?? [];
      const choice = choices[0]?.["message"];
      const payload = {
        id: `resp_${data?.["id"] ?? genid("")}`,
        object: "response",
        created_at: data?.["created"] ?? Math.floor(Date.now() / 1e3),
        model: resolved.display,
        status: "completed",
        output: [
          {
            type: "message",
            id: `msg_${genid("")}`,
            role: "assistant",
            content: [{ type: "output_text", text: String(choice?.["content"] ?? "") }]
          }
        ],
        usage: data?.["usage"] ?? {}
      };
      await persist(cfg, {
        sessionid,
        requestid: genid("req"),
        route: "responses",
        model: resolved.display,
        status: "completed",
        startedat: Date.now()
      });
      return new Response(safestringify(payload), { headers: jsonheaders() });
    } catch (err) {
      return new Response(safestringify({ error: err instanceof Error ? err.message : "internal error" }), {
        status: 500,
        headers: jsonheaders()
      });
    }
  }
  async function handleembeddings(req) {
    const cors2 = handlecors(req);
    if (cors2) return cors2;
    const paused = pausedresponse();
    if (paused) return paused;
    const routes = cfg.routes ?? {};
    if (routes.embeddings === "disabled" || cfg.transport?.type === "zai-sdk") {
      return new Response(
        safestringify({
          error: routes.embeddingsmessage ?? `${cfg.providername} has no embeddings endpoint`,
          code: "embeddings_unavailable",
          ...routes.fallbackroute ? { fallback: routes.fallbackroute } : {}
        }),
        { status: 501, headers: jsonheaders() }
      );
    }
    try {
      const body = await safejsonparse(await req.text()) ?? {};
      const upstream = cfg.upstreams.find((u) => u.endpoints?.embeddings) ?? cfg.upstreams[0];
      const url = upstream.baseurl + (upstream.endpoints?.embeddings ?? "/embeddings");
      const headers = buildheaders(cfg, null, false);
      const key = await resolveauth(cfg);
      if (key) Object.assign(headers, buildauthheaders(cfg.auth, key.key));
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: safestringify({ ...body, model: body["model"] ?? cfg.defaultmodel }),
        signal: AbortSignal.timeout(cfg.timeout?.requestms ?? 3e5)
      });
      const text = await res.text();
      return new Response(text, { status: res.status, headers: jsonheaders() });
    } catch (err) {
      return new Response(safestringify({ error: err instanceof Error ? err.message : "internal error" }), {
        status: 500,
        headers: jsonheaders()
      });
    }
  }
  return {
    handleinfo,
    handlekeys,
    handlemodels,
    handlechatcompletions,
    handlecompletions,
    handlemessages,
    handleresponses,
    handleembeddings
  };
}
async function persist(cfg, fields) {
  try {
    await savemsg({
      ...fields,
      ...fields["startedat"] !== void 0 ? { startedat: new Date(Number(fields["startedat"])) } : {},
      provider: cfg.providername,
      version: cfg.id,
      endpoint: cfg.upstreams[0]?.name ?? cfg.providername
    });
  } catch {
  }
}
var defaultbudgets, defaultretrystatuses, defaultfallbackstatuses, zaipromise, sleep;
var init_engine = __esm({
  "engine.ts"() {
    "use strict";
    init_auth();
    init_storage();
    init_thinking();
    init_server();
    init_utils();
    defaultbudgets = Object.fromEntries(
      listlevels().map((rung) => [rung.level, rung.budget])
    );
    defaultretrystatuses = [429, 502, 503, 504];
    defaultfallbackstatuses = [404, 429, 500, 502, 503, 529];
    zaipromise = null;
    resolveauth.cursor = 0;
    sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  }
});

// gateway.ts
var GATEWAYROUTES, GATEWAYVERSIONS, ladderbudgets;
var init_gateway2 = __esm({
  "gateway.ts"() {
    "use strict";
    init_thinking();
    GATEWAYROUTES = [
      "chat/completions",
      "completions",
      "embeddings",
      "keys",
      "messages",
      "models",
      "responses"
    ];
    GATEWAYVERSIONS = [
      {
        v: "v1",
        provider: "zai",
        pattern: "passthrough retransmit via z ai web dev sdk",
        badge: "live",
        models: "glm-5.3 glm-5.3-flash glm-5.3-fast glm-5.3-air glm-5.2 glm-5.1 glm-5 glm-5v glm-5-turbo glm-4-plus glm-4-flash devthink",
        routes: [...GATEWAYROUTES],
        note: "no token chat id required \u2014 sdk has internal config \u2014 individual model calling plus devthink meta over glm-5.3"
      },
      {
        v: "v2",
        provider: "babel town",
        pattern: "rebuild plus byte tee passthrough paused fallback v1",
        badge: "paused",
        models: "babel-glm-5.2 devthink",
        routes: [...GATEWAYROUTES],
        note: "service is paused returns 503 fallback to v1 zai \u2014 glm-5.2 only"
      },
      {
        v: "v3",
        provider: "nvidia nim",
        pattern: "rebuild per family reasoning control pure byte passthrough",
        badge: "live",
        models: "17 chat models kimi-k3 deepseek-v4 nemotron-3 muse-glimmer laguna gpt-oss gemma-4 mistral llama-3.2",
        routes: [...GATEWAYROUTES],
        note: "22 keys round robin devthink meta model rotates every 6 messages"
      },
      {
        v: "v4",
        provider: "opencode zen plus kilo",
        pattern: "dynamic free discovery anonymous no key",
        badge: "live",
        models: "discovered live -free and :free tagged models from opencode zen plus kilo",
        routes: [...GATEWAYROUTES],
        note: "zero hardcoded model names \u2014 universal free-tag filter plus devthink context-window math"
      },
      {
        v: "v5",
        provider: "openrouter",
        pattern: "dynamic free discovery openrouter :free tagged",
        badge: "live",
        models: "discovered live :free tagged models from openrouter",
        routes: [...GATEWAYROUTES],
        note: "requires free openrouter api key \u2014 zero hardcoded model names plus devthink context-window math"
      }
    ];
    ladderbudgets = Object.fromEntries(listlevels().map((rung) => [rung.level, rung.budget]));
  }
});

// binddraw.ts
import { randomInt as randomInt2 } from "node:crypto";
function drawgatewayport() {
  return randomInt2(3e4) + 3e4;
}
function drawgatewayhost() {
  return `${gatewayhostband.prefix}.${randomInt2(gatewayhostband.first, gatewayhostband.last + 1)}.${randomInt2(
    gatewayhostband.first,
    gatewayhostband.last + 1
  )}.${randomInt2(gatewayhostband.first, gatewayhostband.last + 1)}`;
}
function resolvegatewaybind(portenv, hostenv) {
  const portnumber = Number(portenv);
  const portpinned = portenv !== void 0 && portenv.trim() !== "" && Number.isFinite(portnumber) && portnumber > 0;
  const hostpinned = typeof hostenv === "string" && hostenv.trim() !== "";
  return {
    hostname: hostpinned ? hostenv.trim() : drawgatewayhost(),
    port: portpinned ? portnumber : drawgatewayport(),
    portdrawn: !portpinned,
    hostdrawn: !hostpinned
  };
}
var gatewayportband, gatewayhostband;
var init_binddraw = __esm({
  "binddraw.ts"() {
    "use strict";
    gatewayportband = Object.freeze({ first: 3e4, last: 59999 });
    gatewayhostband = Object.freeze({ prefix: "127", first: 1, last: 254 });
  }
});

// server.ts
var server_exports = {};
__export(server_exports, {
  createserver: () => createserver,
  discardheartbeat: () => discardheartbeat,
  extractdata: () => extractdata,
  getversion: () => getversion,
  isdone: () => isdone,
  kams: () => kams,
  kasuppressms: () => kasuppressms,
  listversions: () => listversions,
  loadconfig: () => loadconfig,
  main: () => main,
  makechunk: () => makechunk,
  makefinalchunk: () => makefinalchunk,
  makestreamresponse: () => makestreamresponse,
  maskmodel: () => maskmodel,
  ndjsonheaders: () => ndjsonheaders,
  parsesseframes: () => parsesseframes,
  reloadconfig: () => reloadconfig,
  runserver: () => main,
  safeclose: () => safeclose,
  safeenqueue: () => safeenqueue,
  sseheaders: () => sseheaders,
  trackwrite: () => trackwrite,
  validateconfig: () => validateconfig,
  writedone: () => writedone,
  writeevent: () => writeevent,
  writekeepalive: () => writekeepalive
});
import { existsSync as existsSync4, readFileSync as readFileSync4 } from "node:fs";
import { basename, dirname as dirname3, join as join3, resolve as resolve2 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
function sseheaders() {
  return {
    ...corsheaders,
    "content-type": ctsse,
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "x-accel-buffering": "no"
  };
}
function ndjsonheaders() {
  return {
    ...corsheaders,
    "content-type": ctndjson,
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive"
  };
}
function writeevent(controller, event, data, format = "sse") {
  const datastr = typeof data === "string" ? data : safestringify(data);
  if (format === "ndjson") {
    controller.enqueue(`${datastr}
`);
  } else if (format === "plain") {
    controller.enqueue(`${datastr}`);
  } else if (format === "sse") {
    const parts = [];
    if (event) parts.push(`event: ${event}`);
    parts.push(`data: ${datastr}`);
    parts.push("");
    parts.push("");
    controller.enqueue(parts.join("\n"));
  } else {
    controller.enqueue(`${datastr}`);
  }
}
function writekeepalive(controller) {
  controller.enqueue(": ka\n\n");
}
function writedone(controller, format = "sse") {
  if (format === "sse") {
    controller.enqueue("data: [done]\n\n");
  } else if (format === "ndjson") {
    controller.enqueue('{"done":true}\n');
  }
}
function safeenqueue(controller, chunk) {
  try {
    controller.enqueue(chunk);
    return true;
  } catch {
    return false;
  }
}
function safeclose(controller) {
  try {
    controller.close();
  } catch {
  }
}
function maskmodel(chunk, target = "devthink") {
  const pattern = /"model"\s*:\s*"[^"]*"/g;
  return chunk.replace(pattern, `"model":"${target}"`);
}
function discardheartbeat(line) {
  const trimmed = line.trim();
  return trimmed.startsWith(":") || trimmed === "" || trimmed === "event: ping" || trimmed === "data:";
}
function parsesseframes(buffer) {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const frames = [];
  let last = 0;
  for (let idx = normalized.indexOf("\n\n", last); idx !== -1; idx = normalized.indexOf("\n\n", last)) {
    frames.push(normalized.slice(last, idx));
    last = idx + 2;
  }
  const residual = normalized.slice(last);
  return { frames, residual };
}
function extractdata(frame) {
  const lines = frame.split("\n");
  const dataLines = [];
  for (const line of lines) {
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }
  if (dataLines.length === 0) return null;
  const joined = dataLines.join("\n");
  return isdone(joined) ? null : joined;
}
function isdone(data) {
  const trimmed = data.trim().toLowerCase();
  return trimmed === "[done]" || trimmed === "data: [done]" || trimmed === "done";
}
function makechunk(id, model, content, reasoningcontent, finishreason) {
  const delta = {};
  if (content) delta.content = content;
  if (reasoningcontent) delta.reasoning_content = reasoningcontent;
  if (!finishreason) delta.role = "assistant";
  return {
    id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1e3),
    model,
    choices: [
      {
        index: 0,
        delta,
        ...finishreason ? { finish_reason: finishreason } : {}
      }
    ]
  };
}
function makefinalchunk(id, model, finishreason, usage) {
  return {
    id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1e3),
    model,
    choices: [{ index: 0, delta: {}, finish_reason: finishreason }],
    ...usage ? { usage } : {}
  };
}
function createtracker() {
  return {
    content: "",
    reasoning: "",
    totaltokens: 0,
    prompttokens: 0,
    completiontokens: 0,
    frames: 0,
    discarded: 0
  };
}
function framedatapayload(frame) {
  const lines = frame.split("\n").filter((l) => l.startsWith("data:"));
  if (lines.length === 0) return null;
  return lines.map((l) => l.slice(5).trim()).join("\n");
}
function trackframe(tracker, data) {
  const parsed = safejsonparse(data);
  if (!parsed || typeof parsed !== "object") return;
  const obj = parsed;
  const usage = obj["usage"];
  if (usage) {
    if (usage["total_tokens"]) tracker.totaltokens = Number(usage["total_tokens"]);
    if (usage["prompt_tokens"]) tracker.prompttokens = Number(usage["prompt_tokens"]);
    if (usage["completion_tokens"]) tracker.completiontokens = Number(usage["completion_tokens"]);
  }
  const choices = obj["choices"];
  if (choices && choices.length > 0) {
    const delta = choices[0]["delta"];
    if (delta) {
      if (typeof delta["content"] === "string") tracker.content += delta["content"];
      if (typeof delta["reasoning_content"] === "string") tracker.reasoning += delta["reasoning_content"];
    }
    const message = choices[0]["message"];
    if (message) {
      if (typeof message["content"] === "string") tracker.content += message["content"];
      if (typeof message["reasoning_content"] === "string") tracker.reasoning += message["reasoning_content"];
    }
  }
}
function makestreamresponse(upstream, opts) {
  const mask = opts.mask ?? null;
  const kai = opts.keepaliveintervalms ?? kams;
  const kasuppress = opts.keepalivesuppressms ?? kasuppressms;
  const tracker = createtracker();
  const upstreamct = upstream.headers.get("content-type") ?? "";
  const format = opts.format ?? (upstreamct.includes("ndjson") ? "ndjson" : "sse");
  let closed = false;
  let lastwrite = Date.now();
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const push = (chunk) => {
        try {
          controller.enqueue(typeof chunk === "string" ? encoder.encode(chunk) : chunk);
          return true;
        } catch {
          return false;
        }
      };
      const keepalivetimer = setInterval(() => {
        if (closed) return;
        if (Date.now() - lastwrite > kasuppress) {
          push(": ka\n\n");
        }
      }, kai);
      try {
        const reader = upstream.body?.getReader();
        if (!reader) {
          push("data: [DONE]\n\n");
          closed = true;
          safeclose(controller);
          return;
        }
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          lastwrite = Date.now();
          if (mask === null && format !== "sse") {
            push(value);
            continue;
          }
          buffer += decoder.decode(value, { stream: true });
          const { frames, residual } = parsesseframes(buffer);
          buffer = residual;
          for (const frame of frames) {
            if (discardheartbeat(frame)) {
              tracker.discarded += 1;
              continue;
            }
            const payload = framedatapayload(frame);
            if (payload !== null && isdone(payload)) {
              push("data: [DONE]\n\n");
              closed = true;
              continue;
            }
            const data = extractdata(frame);
            if (data === null) {
              push(`${frame}

`);
              continue;
            }
            tracker.frames += 1;
            trackframe(tracker, data);
            if (mask !== null) {
              const masked = data.replace(/"model"\s*:\s*"[^"]*"/g, `"model":"${mask}"`);
              push(`data: ${masked}

`);
            } else {
              push(`data: ${data}

`);
            }
          }
        }
        if (buffer.trim()) {
          const payload = framedatapayload(buffer);
          if (payload !== null && isdone(payload)) {
            push("data: [DONE]\n\n");
            closed = true;
          } else {
            push(buffer.endsWith("\n\n") ? buffer : `${buffer}

`);
          }
        }
        if (!closed) {
          push("data: [DONE]\n\n");
        }
      } catch {
        try {
          push("data: [DONE]\n\n");
        } catch {
        }
      } finally {
        clearInterval(keepalivetimer);
        closed = true;
        safeclose(controller);
        if (opts.onfinal) {
          try {
            opts.onfinal(tracker);
          } catch {
          }
        }
      }
    },
    cancel() {
      closed = true;
    }
  });
  const headers = format === "ndjson" ? ndjsonheaders() : sseheaders();
  return new Response(stream, { headers });
}
function trackwrite() {
  return Date.now();
}
function handlermap(handlers, resource) {
  switch (resource) {
    case "keys":
      return handlers.handlekeys;
    case "models":
      return handlers.handlemodels;
    case "chat/completions":
      return handlers.handlechatcompletions;
    case "completions":
      return handlers.handlecompletions;
    case "messages":
      return handlers.handlemessages;
    case "responses":
      return handlers.handleresponses;
    case "embeddings":
      return handlers.handleembeddings;
    default:
      return null;
  }
}
async function createserver() {
  const app = new Hono();
  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      allowHeaders: [
        "content-type",
        "authorization",
        "x-token",
        "x-chat-id",
        "x-user-id",
        "x-session-id",
        "x-request-id",
        "x-thinking-level",
        "x-model",
        "x-tools",
        "accept"
      ],
      exposeHeaders: ["x-request-id", "x-session-id"],
      maxAge: 86400
    })
  );
  const definition = await loadconfig();
  const problems = validateconfig(definition);
  app.get(
    "/api/config",
    (c) => c.json({
      name: definition.name ?? "gateway",
      description: definition.description ?? "",
      versions: Object.keys(definition.versions),
      problems
    })
  );
  for (const [versionid, versionconfig] of Object.entries(definition.versions)) {
    const handlers = createversion(versionconfig);
    for (const prefix of [`/api/${versionid}`, `/${versionid}`]) {
      for (const resource of resources) {
        app.get(`${prefix}/${resource}`, (c) => handlers.handleinfo(c.req.raw));
      }
      for (const resource of resources) {
        const handler = handlermap(handlers, resource);
        if (handler) {
          app.post(`${prefix}/${resource}`, (c) => handler(c.req.raw));
        }
      }
    }
  }
  for (const root of consoleroots()) {
    app.use("*", serveStatic({ root }));
  }
  app.notFound((c) => {
    if (c.req.path.startsWith("/api/")) {
      return c.json({ error: "not found", path: c.req.path }, 404);
    }
    for (const root of consoleroots()) {
      const indexpath = join3(root, "index.html");
      if (existsSync4(indexpath)) {
        return c.html(readFileSync4(indexpath, "utf8"));
      }
    }
    return c.body(null, 204);
  });
  return app;
}
function consoleroots() {
  const roots = ["build"];
  const moduledir = dirname3(fileURLToPath2(import.meta.url));
  if (basename(moduledir) === "build" && moduledir !== resolve2("build")) {
    roots.push(moduledir);
  }
  return roots;
}
async function main() {
  const app = await createserver();
  const definition = await loadconfig();
  const versioncount = Object.keys(definition.versions).length;
  process.on("uncaughtException", (err) => {
    console.error("[server] uncaught exception:", err.message);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("[server] unhandled rejection:", reason);
  });
  const bind = resolvegatewaybind(process.env.PORT, process.env.HOST);
  serve({ fetch: app.fetch, port: bind.port, hostname: bind.hostname }, (info) => {
    console.log(`[server] gateway listening on http://${info.address}:${info.port}`);
    console.log(`[server] config loaded \u2014 ${versioncount} versions`);
  });
}
async function builtindefault() {
  return { versions: {} };
}
async function tryimport(path) {
  try {
    const mod = await import(
      /* @vite-ignore */
      path
    );
    const candidate = mod.default ?? mod.config ?? mod.gatewaydefinition ?? mod;
    if (candidate && typeof candidate === "object" && "versions" in candidate) {
      return candidate;
    }
    return null;
  } catch {
    return null;
  }
}
function searchbases() {
  const moduledir = dirname3(fileURLToPath2(import.meta.url));
  const bases = [resolve2(process.cwd()), moduledir, resolve2(moduledir, "..")];
  return [...new Set(bases)];
}
async function loadconfig() {
  if (loaded) return loaded;
  const names = [
    "config.mjs",
    "config.ts",
    "config.js",
    "sol/config.mjs",
    "sol/config.ts",
    "sol/config.js",
    "gatewayconfig.mjs",
    "gatewayconfig.ts",
    "gatewayconfig.js"
  ];
  for (const base of searchbases()) {
    for (const name of names) {
      const found = await tryimport(`${base}/${name}`);
      if (found) {
        loaded = found;
        return found;
      }
    }
  }
  loaded = await builtindefault();
  return loaded;
}
async function reloadconfig() {
  loaded = null;
  return loadconfig();
}
async function getversion(id) {
  const def = await loadconfig();
  return def.versions[id] ?? null;
}
async function listversions() {
  const def = await loadconfig();
  return Object.keys(def.versions);
}
var kams, kasuppressms, resources, loaded;
var init_server = __esm({
  "server.ts"() {
    "use strict";
    init_engine();
    init_utils();
    init_gateway2();
    init_binddraw();
    init_validate();
    kams = 200;
    kasuppressms = 1e3;
    resources = GATEWAYROUTES;
    loaded = null;
  }
});

// cli.ts
import { existsSync as existsSync5, mkdirSync as mkdirSync3, readFileSync as readFileSync5, writeFileSync as writeFileSync4 } from "node:fs";
import { basename as basename2, join as join4, relative, resolve as resolve3 } from "node:path";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
function parseargs(args) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const value = args[i];
    if (!value.startsWith("-")) {
      positional.push(value);
      continue;
    }
    const key = value.replace(/^-+/, "");
    const next = args[i + 1];
    if (next && !next.startsWith("-")) {
      flags[key] = next;
      i += 1;
    } else flags[key] = true;
  }
  return { flags, positional };
}
function stringflag(parsed, key) {
  const value = parsed.flags[key];
  return typeof value === "string" ? value : void 0;
}
function version() {
  const embedded = process.env.DEVTHINK_VERSION?.trim();
  if (embedded) return embedded;
  for (const candidate of ["./package.json", "../package.json"]) {
    try {
      const file = new URL(candidate, import.meta.url);
      return String(JSON.parse(readFileSync5(file, "utf8")).version || "0.0.0");
    } catch {
    }
  }
  return "0.0.0";
}
var colors = stdout.isTTY ? {
  cyan: "\x1B[36m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  red: "\x1B[31m",
  bold: "\x1B[1m",
  dim: "\x1B[2m",
  reset: "\x1B[0m"
} : {
  cyan: "",
  green: "",
  yellow: "",
  red: "",
  bold: "",
  dim: "",
  reset: ""
};
var sharedrl;
var pendinglines = [];
var lineresolver;
var stdineof = false;
function questionstream() {
  if (sharedrl) return sharedrl;
  sharedrl = createInterface({ input: stdin, output: stdout });
  sharedrl.on("line", (line) => {
    if (lineresolver) {
      const resolve4 = lineresolver;
      lineresolver = void 0;
      resolve4(line);
    } else {
      pendinglines.push(line);
    }
  });
  sharedrl.on("close", () => {
    stdineof = true;
    if (lineresolver) {
      const resolve4 = lineresolver;
      lineresolver = void 0;
      resolve4("");
    }
  });
  return sharedrl;
}
async function ask(question, defaultanswer = "") {
  questionstream();
  const suffix = defaultanswer ? ` (${defaultanswer})` : "";
  stdout.write(`${question}${suffix}: `);
  let answer;
  if (pendinglines.length > 0) {
    answer = pendinglines.shift();
  } else if (stdineof) {
    answer = "";
  } else {
    answer = await new Promise((resolve4) => {
      lineresolver = resolve4;
    });
  }
  return answer.trim() || defaultanswer;
}
async function askyesno(question, defaultanswer = false) {
  const hint = defaultanswer ? "Y/n" : "y/N";
  const answer = await ask(`${question} [${hint}]`);
  if (!answer) return defaultanswer;
  return answer.toLowerCase().startsWith("y");
}
var confignames = [
  "config.mjs",
  "config.ts",
  "config.js",
  "sol/config.mjs",
  "sol/config.ts",
  "sol/config.js",
  "gatewayconfig.mjs",
  "gatewayconfig.ts",
  "gatewayconfig.js"
];
function configpath() {
  return resolve3(process.cwd(), "config.mjs");
}
async function findconfig() {
  for (const name of confignames) {
    const path = resolve3(process.cwd(), name);
    if (!existsSync5(path)) continue;
    try {
      const mod = await import(
        /* @vite-ignore */
        path
      );
      const config = mod.default ?? mod.config ?? mod;
      if (config && typeof config === "object" && "versions" in config) {
        return { path, config };
      }
    } catch {
    }
  }
  return null;
}
async function readconfig() {
  return (await findconfig())?.config ?? null;
}
function generateconfigcontent(def) {
  return [
    "/**",
    " * web config \u2014 user customization layer for the gateway",
    " * generated by the cli \u2014 edit freely",
    " * every value here is what you customize",
    " */",
    "",
    `export const config = ${jsontopretty(def)}`,
    "",
    "export default config",
    ""
  ].join("\n");
}
function jsontopretty(value, indent = 0) {
  const pad = "  ".repeat(indent);
  const padinner = "  ".repeat(indent + 1);
  if (value === null || value === void 0) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => `${padinner}${jsontopretty(v, indent + 1)}`);
    return `[
${items.join(",\n")},
${pad}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    const lines = entries.map(([k, v]) => `${padinner}${k}: ${jsontopretty(v, indent + 1)}`);
    return `{
${lines.join(",\n")},
${pad}}`;
  }
  return JSON.stringify(value);
}
var schematemplate = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
}

model ChatMessage {
  id                String   @id @default(cuid())
  requestid         String?
  sessionid         String?
  route             String?
  provider          String?
  version           String?
  model             String?
  modelvariant      String?
  content           String?
  reasoningcontent  String?
  completion        String?
  prompttokens      Int?
  completiontokens  Int?
  totaltokens       Int?
  stream            Boolean?
  streammode        String?
  endpoint          String?
  twocalls          Boolean?
  thinkingbudget    Int?
  status            String?
  httpstatus        Int?
  error             String?
  rotationindex     Int?
  messagenumber     Int?
  contextshared     Boolean?
  startedat         DateTime? @default(now())
  createdat         DateTime @default(now())

  @@index([sessionid])
  @@index([route])
  @@index([model])
  @@index([provider])
  @@index([status])
  @@index([createdat])
}

model ApiKey {
  id            String    @id @default(cuid())
  keyValue      String    @unique
  label         String?
  active        Boolean   @default(true)
  status        String    @default("active")
  useCount      Int       @default(0)
  errorCount    Int       @default(0)
  lastUsedAt    DateTime?
  lastError     String?
  lastErrorAt   DateTime?
  createdat     DateTime  @default(now())

  @@index([active, status])
}

model NvidiaKey {
  id            String    @id @default(cuid())
  keyValue      String    @unique
  label         String?
  active        Boolean   @default(true)
  status        String    @default("active")
  useCount      Int       @default(0)
  errorCount    Int       @default(0)
  lastUsedAt    DateTime?
  lastError     String?
  lastErrorAt   DateTime?
  createdat     DateTime  @default(now())

  @@index([active, status])
}
`;
var prismaconfigtemplate = `/** prisma config \u2014 the datasource url lives here (prisma 7 moved it
 * out of the schema file). the schema is schema.prisma at the project
 * root; the url comes from DEVTHINK_DATABASE_URL or DATABASE_URL,
 * defaulting to the local sqlite at devthink.db \u2014 the same default the
 * gateway library runtime uses, so the pushed database and the serving
 * process agree on one file with zero configuration */

import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

/** resolve schema path \u2014 schema.prisma at the root is the standard location */
function resolveschemapath(): string {
  const candidates = [
    path.resolve(process.cwd(), "schema.prisma"),
    path.resolve(process.cwd(), "sol", "schema.prisma"),
    path.resolve(process.cwd(), "prisma", "schema.prisma"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

export default defineConfig({
  schema: resolveschemapath(),
  datasource: {
    url:
      process.env.DEVTHINK_DATABASE_URL ||
      process.env.DATABASE_URL ||
      "file:./devthink.db",
  },
});
`;
async function cmdinit() {
  console.log(`
${colors.cyan}${colors.bold}@wenathlan/devthink gateway${colors.reset} v${version()} \u2014 init
`);
  const targetdir = process.cwd();
  const existing = await findconfig();
  if (existing || existsSync5(configpath())) {
    const overwrite = await askyesno(
      `config already exists${existing ? ` (${relative(process.cwd(), existing.path)})` : ""} \u2014 overwrite?`,
      false
    );
    if (!overwrite) {
      console.log("keeping existing config");
      return;
    }
  }
  console.log("\nthis scaffolds your gateway configuration");
  console.log(
    "each version gets all 7 routes: chat/completions completions messages responses embeddings keys models\n"
  );
  const versioncountanswer = await ask("how many versions (route groups) do you want", "1");
  const versioncount = Math.max(1, Math.min(20, Number(versioncountanswer) || 1));
  const versions = {};
  for (let i = 0; i < versioncount; i++) {
    console.log(`
${colors.bold}--- version ${i + 1} of ${versioncount} ---${colors.reset}`);
    const vconfig = await askversiondetails(i + 1);
    versions[vconfig.id] = vconfig;
  }
  const definition = {
    name: await ask("gateway name", "My Gateway"),
    description: await ask("gateway description", "multi provider ai gateway"),
    versions
  };
  writeFileSync4(configpath(), generateconfigcontent(definition));
  console.log(`
${colors.green}created${colors.reset} config.mjs`);
  const schemapath = join4(targetdir, "schema.prisma");
  writeFileSync4(schemapath, schematemplate);
  console.log(`${colors.green}created${colors.reset} schema.prisma`);
  writeFileSync4(join4(targetdir, "prismaconfig.ts"), prismaconfigtemplate);
  console.log(`${colors.green}created${colors.reset} prismaconfig.ts`);
  const envpath = join4(targetdir, ".env.example");
  const envlines = [
    "# gateway environment",
    "# database url \u2014 libsql http postgres or file",
    "# DEVTHINK_DATABASE_URL=file:./devthink.db",
    ""
  ];
  for (const [id, v] of Object.entries(versions)) {
    const auth = v.auth;
    if (auth?.envvar) {
      envlines.push(`# ${id} api key`);
      envlines.push(`${auth.envvar}=`);
      envlines.push("");
    }
  }
  writeFileSync4(envpath, envlines.join("\n"));
  console.log(`${colors.green}created${colors.reset} .env.example`);
  console.log(`
${colors.green}${colors.bold}done${colors.reset} \u2014 next steps:`);
  console.log("  1. edit config.mjs to tune your configuration");
  console.log("  2. register keys:      npx @wenathlan/devthink gateway keys <version>");
  console.log("  3. install prisma:     npm i -D prisma");
  console.log("  4. push + generate:    npx prisma db push --config prismaconfig.ts && npx prisma generate --config prismaconfig.ts");
  console.log("  5. start the server:   npx @wenathlan/devthink gateway serve");
  console.log("");
}
async function askversiondetails(index) {
  const id = await ask(`version id (path prefix)`, `v${index}`);
  const providername = await ask("provider name (zai nvidia openai openrouter custom)", "custom");
  const baseurl = await ask("upstream base url", "https://gateway.example/v1");
  console.log(
    "\nauth methods: bearer apikeyheader queryparam basic oauth2clientcredentials jwtsign sigv4 anonymous keylesssdk none"
  );
  const authmode = await ask("auth method", "bearer");
  const needskey = ["bearer", "apikeyheader", "queryparam", "basic"].includes(authmode);
  const auth = { mode: authmode };
  if (needskey) {
    auth.required = await askyesno("is the api key required?", true);
    const envvar = await ask(
      "env var name for the key",
      `${providername.toUpperCase().replace(/[^A-Z]/g, "_")}_API_KEY`
    );
    auth.envvar = envvar;
    const usedb = await askyesno("store keys in the database (rotation)?", false);
    auth.keysources = usedb ? ["db", "env"] : ["env"];
    if (usedb) auth.dbmodel = await ask("prisma key model name", "apiKey");
  }
  const modelcountanswer = await ask("how many models", "2");
  const modelcount = Math.max(1, Number(modelcountanswer) || 2);
  const models = [];
  for (let m = 0; m < modelcount; m++) {
    console.log(`
model ${m + 1} of ${modelcount}`);
    const mid = await ask("model id", m === 0 ? "default-model" : `model-${m + 1}`);
    const context2 = Number(await ask("context window", "131072"));
    const maxoutput = Number(await ask("max output tokens", "32768"));
    models.push({ id: mid, context: context2, maxoutput, free: true });
  }
  const userotation = await askyesno("\nrotate models (meta model pattern)?", modelcount > 1);
  let rotation;
  if (userotation) {
    rotation = {
      mode: await ask("rotation mode (persession perrequest)", "persession"),
      models: models.map((m) => m.id),
      everynmessages: Number(await ask("rotate every n messages", "6")),
      maxmodelrotations: Number(await ask("max model rotations per request", "4")),
      rotateonstatus: [529, 404, 410],
      rotateontimeout: true
    };
  }
  const useretry = await askyesno("\nenable retry with backoff?", true);
  let retry;
  if (useretry) {
    retry = {
      maxretries: Number(await ask("max retries", "3")),
      backoffbasems: Number(await ask("backoff base ms", "400")),
      backoffcapms: Number(await ask("backoff cap ms", "8000")),
      jitter: 0.2,
      statuses: [429, 502, 503, 504],
      nonretryable: [400]
    };
  }
  const usecontext = await askyesno("\nshare context across sessions (db history)?", false);
  const context = usecontext ? {
    restoresessionhistory: true,
    historylimit: 1e3,
    truncatemargin: 4096,
    percallfallback: 1048576
  } : void 0;
  const metaid = await ask("\nmeta model id (the rotation facade)", "devthink");
  return {
    id,
    providername,
    upstreams: [{ name: providername, baseurl }],
    auth,
    models,
    defaultmodel: rotation ? metaid : models[0].id,
    ...rotation ? { rotation } : {},
    ...retry ? { retry } : {},
    ...context ? { context } : {},
    timeout: { requestms: 3e5, streamms: 2147483647 },
    thinking: { defaultlevel: "high" },
    bodybuild: { optionalparamspolicy: "omit-unspecified", clampmaxtokens: true },
    metamodel: {
      id: metaid,
      fallbackcontext: 1048576,
      maxoutput: 32768,
      maskupstreammodel: true,
      alwaysdisplay: true
    },
    headers: { useragent: `Gateway/${id}` }
  };
}
async function cmdadd(_versionarg) {
  const existing = await findconfig();
  if (!existing) {
    console.log(`${colors.red}no config found${colors.reset} \u2014 run init first`);
    process.exit(1);
  }
  const nextindex = Object.keys(existing.config.versions ?? {}).length + 1;
  console.log(`
${colors.cyan}${colors.bold}add version${colors.reset}
`);
  const vconfig = await askversiondetails(nextindex);
  const versions = existing.config.versions ?? {};
  versions[vconfig.id] = vconfig;
  existing.config.versions = versions;
  writeFileSync4(existing.path, generateconfigcontent(existing.config));
  console.log(
    `
${colors.green}added${colors.reset} version ${vconfig.id} to ${relative(process.cwd(), existing.path)}`
  );
}
async function cmdlist() {
  const config = await readconfig();
  if (!config) {
    console.log(`${colors.red}no config found${colors.reset} \u2014 run init first`);
    process.exit(1);
  }
  const versions = config.versions ?? {};
  console.log(
    `
${colors.bold}${config.name ?? "gateway"}${colors.reset} \u2014 ${Object.keys(versions).length} versions
`
  );
  for (const [id, v] of Object.entries(versions)) {
    const models = v.models?.length ?? 0;
    const auth = v.auth;
    const rotation = v.rotation;
    console.log(`  ${colors.cyan}${id}${colors.reset}`);
    console.log(
      `    provider: ${v.providername ?? "?"}  upstream: ${v.upstreams?.[0]?.baseurl ?? "?"}`
    );
    console.log(`    models: ${models}  auth: ${auth?.mode ?? "?"}  rotation: ${rotation?.mode ?? "none"}`);
  }
  console.log("");
}
async function cmdshow(versionarg) {
  if (!versionarg) {
    console.log("usage: gateway show <version>");
    process.exit(1);
  }
  const config = await readconfig();
  const versions = config?.versions ?? {};
  const v = versions[versionarg];
  if (!v) {
    console.log(`${colors.red}version ${versionarg} not found${colors.reset}`);
    process.exit(1);
  }
  console.log(jsontopretty(v));
}
async function cmdvalidate() {
  const config = await readconfig();
  if (!config) {
    console.log(`${colors.red}no config found${colors.reset} \u2014 run init first`);
    process.exit(1);
  }
  const versions = config.versions ?? {};
  const problems = [];
  if (Object.keys(versions).length === 0) problems.push("no versions defined");
  for (const [id, v] of Object.entries(versions)) {
    if (!v.providername) problems.push(`version ${id}: missing providername`);
    if (!v.upstreams) problems.push(`version ${id}: missing upstreams`);
    if (!v.auth) problems.push(`version ${id}: missing auth`);
    if (!v.models || v.models.length === 0) problems.push(`version ${id}: no models`);
    if (!v.metamodel) problems.push(`version ${id}: missing metamodel`);
  }
  if (problems.length === 0) {
    console.log(`${colors.green}config is valid${colors.reset} \u2014 ${Object.keys(versions).length} versions`);
  } else {
    console.log(`${colors.yellow}problems found${colors.reset}:`);
    for (const p of problems) console.log(`  - ${p}`);
    process.exit(1);
  }
}
async function cmdkeys(versionarg) {
  if (!versionarg) {
    console.log("usage: gateway keys <version>");
    process.exit(1);
  }
  const config = await readconfig();
  const versions = config?.versions ?? {};
  const v = versions[versionarg];
  if (!v) {
    console.log(`${colors.red}version ${versionarg} not found${colors.reset}`);
    process.exit(1);
  }
  const auth = v.auth;
  const envvar = auth?.envvar;
  const dbmodel = auth?.dbmodel;
  console.log(`
${colors.bold}register keys for ${versionarg}${colors.reset}`);
  console.log(`auth mode: ${auth?.mode ?? "?"}`);
  if (envvar) {
    console.log(`
set keys via environment variable:`);
    console.log(`  export ${envvar}=key1,key2,key3  (comma separated for rotation)`);
  }
  if (dbmodel) {
    console.log(`
register keys in the database (rotation with round robin):`);
    const keycountanswer = await ask("how many keys to register now", "0");
    const keycount = Number(keycountanswer) || 0;
    if (keycount > 0) {
      const keys = [];
      for (let i = 0; i < keycount; i++) {
        const key = await ask(`key ${i + 1}`);
        if (key) keys.push(key);
      }
      const seedpath = resolve3(process.cwd(), "test", "seedkeys.mjs");
      const seedcontent = [
        "/** seed keys \u2014 generated by gateway cli */",
        'import { PrismaClient } from "@prisma/client"',
        "",
        `const keys = ${JSON.stringify(keys, null, 2)}`,
        "",
        "const db = new PrismaClient()",
        "",
        `for (const [idx, key] of keys.entries()) {`,
        `  await db.${dbmodel}.upsert({`,
        "    where: { keyValue: key },",
        '    update: { active: true, status: "active" },',
        `    create: { keyValue: key, label: \`key-\${idx}\`, active: true, status: "active" },`,
        "  })",
        "}",
        "",
        "await db.$disconnect()",
        `console.log(\`registered \${keys.length} keys\`)`,
        ""
      ].join("\n");
      mkdirSync3(resolve3(process.cwd(), "test"), { recursive: true });
      writeFileSync4(seedpath, seedcontent);
      console.log(`
${colors.green}created${colors.reset} test/seedkeys.mjs \u2014 run: node test/seedkeys.mjs`);
    }
  }
  console.log("");
}
async function cmdmodels(versionarg) {
  if (!versionarg) {
    console.log("usage: gateway models <version>");
    process.exit(1);
  }
  const config = await readconfig();
  const versions = config?.versions ?? {};
  const v = versions[versionarg];
  if (!v) {
    console.log(`${colors.red}version ${versionarg} not found${colors.reset}`);
    process.exit(1);
  }
  const models = v.models ?? [];
  console.log(`
${colors.bold}models for ${versionarg}${colors.reset}
`);
  for (const m of models) {
    console.log(
      `  ${colors.cyan}${m.id}${colors.reset}  ctx=${m.context}  out=${m.maxoutput}${m.vision ? "  vision" : ""}${m.reasoning ? "  reasoning" : ""}`
    );
  }
  const rotation = v.rotation;
  if (rotation?.models) {
    console.log(`
${colors.bold}rotation pool${colors.reset}: ${JSON.stringify(rotation.models)}`);
  }
  console.log("");
}
async function cmdserve(portarg) {
  const argport = Number(portarg);
  if (portarg !== void 0 && Number.isFinite(argport) && argport > 0) process.env.PORT = String(argport);
  const pinned = Number(process.env.PORT);
  const pinnedport = Number.isFinite(pinned) && pinned > 0 ? pinned : void 0;
  console.log(
    `${colors.cyan}starting gateway${pinnedport !== void 0 ? ` on port ${pinnedport}` : " \u2014 the bind draws (host and port) since no env pin rides"}${colors.reset}`
  );
  const { main: main2 } = await Promise.resolve().then(() => (init_server(), server_exports));
  await main2();
}
async function cmdexport(dirarg) {
  const target = resolve3(process.cwd(), dirarg ?? "export");
  mkdirSync3(target, { recursive: true });
  const found = await findconfig();
  if (found) {
    const name = basename2(found.path);
    writeFileSync4(join4(target, name), readFileSync5(found.path, "utf8"));
    console.log(`${colors.green}exported${colors.reset} ${name}`);
  }
  const schemaroot = resolve3(process.cwd(), "schema.prisma");
  const schemapath = existsSync5(schemaroot) ? schemaroot : resolve3(process.cwd(), "sol", "schema.prisma");
  if (existsSync5(schemapath)) {
    writeFileSync4(join4(target, "schema.prisma"), readFileSync5(schemapath, "utf8"));
    console.log(`${colors.green}exported${colors.reset} schema.prisma`);
  }
  console.log(`
exported to ${target} \u2014 deploy this folder to vercel or netlify`);
}
var CHATACCENT = "\x1B[38;5;117m";
var CHATFOCUS = "\x1B[38;5;75m";
var CHATHOVER = "\x1B[38;5;203m";
var CHATINK = "\x1B[2m";
var CHATRESET = "\x1B[0m";
var CHATBAR = "\u2500";
var CHATENGINE = "the universal ai gateway library \u2014 any llm any baseurl any api key (the help banner)";
var CHATSCALESTEPS = [1, 1.5, 2, 3];
function chatdetectframe() {
  const columns = Number.isFinite(stdout.columns) && Number(stdout.columns) > 0 ? Number(stdout.columns) : 80;
  const override = Number(process.env.GETRY_DPI ?? "");
  const scale = Number.isFinite(override) && override > 0 && CHATSCALESTEPS.includes(override) ? override : columns >= 200 ? 3 : columns >= 160 ? 2 : columns >= 120 ? 1.5 : 1;
  const rail = Math.max(4, Math.min(Math.round(24 * scale), columns - "getry".length - 16));
  return { scale, columns, rail };
}
async function cmdchat() {
  const frame = chatdetectframe();
  const seatversion = version();
  const rl = createInterface({ input: stdin, output: stdout });
  let eof = false;
  rl.on("close", () => {
    eof = true;
  });
  const rule = CHATBAR.repeat(Math.max(3, Math.round(3 * frame.scale)));
  console.log(`${CHATACCENT}\u250C getry \u2500 cli${CHATRESET}  ${CHATINK}${CHATBAR.repeat(frame.rail)} \u2500 \u2750 \u2715${CHATRESET}`);
  console.log(`${CHATFOCUS}${rule} getry ${rule}${CHATRESET}`);
  console.log(`${CHATACCENT}getry${CHATRESET} ${CHATINK}v${seatversion}${CHATRESET}`);
  console.log(`${CHATINK}the getry console \u2014 same design as web / desktop, only the DPI differs. type help.${CHATRESET}`);
  rl.setPrompt(`${CHATACCENT}\u276F${CHATRESET} `);
  rl.prompt();
  for await (const raw of rl) {
    const line = raw.trim();
    const command = line.length > 0 ? line.split(/\s+/)[0].toLowerCase() : "";
    if (command === "exit") rl.close();
    else if (command === "help") {
      console.log(`${CHATINK}commands${CHATRESET}`);
      console.log(`  help      ${CHATINK}this list${CHATRESET}`);
      console.log(`  version   ${CHATINK}the package version, read from package.json at runtime${CHATRESET}`);
      console.log(`  dpi       ${CHATINK}the resolved dpi seat of this terminal (scale, columns, rail)${CHATRESET}`);
      console.log(`  engine    ${CHATINK}the engine ownership one-liner of the app${CHATRESET}`);
      console.log(`  exit      ${CHATINK}close the console${CHATRESET}`);
    } else if (command === "version") console.log(`${CHATACCENT}getry${CHATRESET} ${seatversion}`);
    else if (command === "dpi") console.log(`${CHATACCENT}getry${CHATRESET} ${CHATINK}dpi seat ${frame.scale}x on ${frame.columns} columns \u2014 rail ${frame.rail} cells, ladder 1x / 1.5x / 2x / 3x${CHATRESET}`);
    else if (command === "engine") console.log(`${CHATINK}${CHATENGINE}${CHATRESET}`);
    else if (command.length > 0) console.log(`${CHATHOVER}\u2715${CHATRESET} ${CHATINK}unknown command: ${command} \u2014 type help${CHATRESET}`);
    if (command === "exit") break;
    if (!eof) rl.prompt();
  }
  console.log(`${CHATINK}getry console closed.${CHATRESET}`);
}
function printhelp() {
  console.log(
    [
      `${colors.cyan}${colors.bold}@wenathlan/devthink gateway${colors.reset} v${version()}`,
      "",
      "the universal ai gateway library \u2014 any llm any baseurl any api key",
      "",
      "Usage: devthink gateway <command> [options]",
      "",
      "Commands:",
      "  init                       scaffold config.mjs schema and env interactively",
      "  add                        add a new version to the config",
      "  list                       list configured versions",
      "  show <version>             show one version config",
      "  validate                   validate the config for errors",
      "  keys <version>             register api keys for a version",
      "  models <version>           list models for a version",
      "  serve [--port <n>]         start the gateway server",
      "  export [--dir <path>]      export the web folder scaffold",
      "  chat                       the windows 11 chat console seat (same design as web / desktop)",
      "  help                       show this help",
      "",
      "Library usage:",
      '  import { createversion, loadconfig } from "@wenathlan/devthink"',
      "",
      "Documentation: https://github.com/wenathlan/devthink",
      ""
    ].join("\n")
  );
}
async function runclifamily(argv) {
  const saved = process.argv.slice();
  process.argv = [saved[0], saved[1], ...argv];
  try {
    await consolemain();
  } finally {
    process.argv = saved;
  }
}
async function consolemain() {
  const args = process.argv.slice(2);
  const parsed = parseargs(args);
  const command = parsed.positional[0];
  try {
    switch (command) {
      case "init":
        await cmdinit();
        break;
      case "add":
        await cmdadd(parsed.positional[1]);
        break;
      case "list":
        await cmdlist();
        break;
      case "show":
        await cmdshow(parsed.positional[1]);
        break;
      case "validate":
        await cmdvalidate();
        break;
      case "keys":
        await cmdkeys(parsed.positional[1]);
        break;
      case "models":
        await cmdmodels(parsed.positional[1]);
        break;
      case "serve":
        await cmdserve(stringflag(parsed, "port"));
        break;
      case "export":
        await cmdexport(stringflag(parsed, "dir"));
        break;
      case "chat":
        await cmdchat();
        break;
      case "help":
      case "--help":
      case "-h":
      case void 0:
        printhelp();
        break;
      default:
        console.log(`${colors.red}unknown command${colors.reset}: ${command}`);
        printhelp();
        process.exit(1);
    }
  } catch (err) {
    console.error(`${colors.red}error${colors.reset}: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  } finally {
    sharedrl?.close();
  }
}
var cliDirectEntry = process.argv[1]?.endsWith("cli.ts") || process.argv[1]?.endsWith("cli.js");
var cliBunEntry = import.meta.main === true;
if (cliDirectEntry || cliBunEntry) void consolemain();
export {
  runclifamily
};
/**
 * constants — the provider constants module of the getry ownership split
 * (wave/ownership.getry): every antigravity / gemini-cli / cloudcode-pa /
 * opencode constant family moved here from devthink/constants.ts (the os
 * module keeps only the generic leaf constants its core.ts utility module
 * consumes — FETCH_TIMEOUT_MS, the JITTER_* pair and the DEBUG_* trio —
 * behind the @wenathlan/devthink/constants specifier). the module is raw
 * values only: every function that used to live here moved to its domain
 * owner (core.ts for generic utilities, fingerprint.ts for identity
 * masquerade) in the v2.1.15 phases, except the small path/url helpers
 * that ride their value families below.
 *
 * Third-person observer view — library-first, root-first, production-ready.
 *
 * Merged constants module — v2.1.2 base (strict superset) with every unique
 * export from the v1.0.0 constants module ported on top. Nothing dropped.
 *
 * Third-person observer view: the library observes real traffic from the
 * Antigravity IDE, Gemini CLI, OmniRoute, 9router and pi-antigravity-auth
 * and reproduces its fingerprint without executing Antigravity.
 *
 * The V2 correction addresses the opencode.txt timeline gap: models released
 * up to 25/08/2026 were missing and Project ID bypass was not fully
 * Gemini CLI-like.
 *
 *  - Plugin: the merged provider lineage 2.1.2 (ONDA 5 V2)
 *  - Replaces the upstream research lineage which failed due to an outdated UA
 *    (1.11.5 -> "This version of Antigravity is no longer supported")
 *    and missing 2026 models.
 *  - Must work WITHOUT the localhost v1 base-url proxy, straight to
 *    cloudcode-pa.googleapis.com via endpoint cascade with retry 403/404/5xx.
 *  - Project ID bypass behaves EXACTLY like Gemini CLI would:
 *      1) try loadCodeAssist without projectId -> server returns the existing
 *         cloudaicompanionProject
 *      2) if null -> onboardUser FREE tier -> long-running operation polling
 *      3) loadCodeAssist again -> provisioned projectId
 *      4) fetchAvailableModels as best-effort validation
 *      5) blinded rising-fact-p41fc fallback only if every endpoint fails
 *    Implemented references: pi-antigravity-auth (loadCodeAssist parsing),
 *    OmniRoute/9router (header stripping, prod-first cascade).
 *
 *  Model timeline complete up to 25/08/2026:
 *  - Gemini 3.6 Flash family (high/medium/low/tiered/base)
 *  - Gemini 3.5 Flash family (high/medium/base/lite/lite-preview)
 *  - Gemini 3.1 Pro family (high/low/base + flash-image + flash-lite)
 *  - Gemini 3 family (flash, pro, deep-think)
 *  - Gemini 2.5 family (pro, flash, flash-lite)
 *  - Claude 4.6 thinking (opus + sonnet), Claude 4.5 legacy
 *  - gpt-oss-120b medium/high
 *  - Preview models: gemini-3-pro-preview, flash-preview, 3.1-pro-preview, customtools
 *
 *  Merge notes (conflict resolutions):
 *  - ANTIGRAVITY_ENDPOINTS   : kept from v2 (cascade URL array); the v1
 *    versioned-base object is exported as ANTIGRAVITY_ENDPOINT_SET.
 *  - CODE_ASSIST_ENDPOINTS   : kept from v2 (PROD/DAILY/SANDBOX/AUTOPUSH URL
 *    map); the v1 v1internal path map is exported as CODE_ASSIST_PATH_MAP.
 *  - CONSTANTS               : kept from v2; the v1 compatibility barrel is
 *    exported as CONSTANTS_V1 (also provided as the module default export).
 *  - FALLBACK_PROJECT_ID     : identical value in both versions; single v2
 *    definition retained.
 *
 *  Runtime constraint: only node:* builtins + global fetch (Node >=18).
 *  Library-first, root-first: no /src, no folder inside folder.
 *
 *  @module provider/constants
 *  @author devthink
 *  @license MIT
 *  @version 2.1.2 — ONDA 5 CORRECTION V2 26/08/2026
 */
/**
 * @file config.ts
 * @module provider/config
 * @description
 *  THE single configuration-management module of the merged provider lineage — v2.1.14
 *  consolidation of config.ts + validate.ts + system.ts into one file
 *  (one file per correlated context, per the governance skill).
 *  Merged configuration module — v2 schema-driven base with the complete
 *  v1 surface ported on top. Nothing from either version was dropped.
 *
 *  Third-person observer: the library watches how Antigravity Manager
 *  and Gemini CLI persist user preferences and reproduces that contract
 *  without depending on their runtime. The observer never leaks secrets,
 *  validates production inputs strictly, and enforces chmod 600 on disk.
 *
 *  Layout: library-first, root-first.
 *  Runtime: only node:* builtins + global fetch (Node >=18). Zero external deps.
 *
 *  Merge notes (conflict resolutions):
 *  - v2.1.14 consolidation             : the validation helpers (former
 *    validate.ts, deleted) and the system utilities (former system.ts, now a
 *    pure compatibility re-export shim for the published ./system subpath)
 *    live in the trailing sections of this file. Canonical names resolve to
 *    the hardened implementations; legacy names survive as documented
 *    aliases or renames.
 *  - loadConfig / agsaveConfig          : v1 synchronous cached API keeps the
 *    original names because existing modules import them synchronously.
 *    The minimal raw JSON IO helpers of the former system.ts survive under
 *    the renamed loadConfigRaw / saveConfigRaw.
 *  - loadConfigAsync / saveConfigAsync: v2 asynchronous implementations are
 *    exposed under these names (the names already existed in v1 as thin
 *    wrappers; the v2 implementations absorb that contract).
 *  - AntigravityConfig                : single interface covering both the
 *    v1 field set and the v2 field set.
 *  - ConfigValidationError            : single class accepting both the v1
 *    constructor (string error list) and the v2 constructor
 *    (message + structured ValidationError list).
 *  - isValidEmail / isValidSemver /
 *    isValidProjectId / validateAccount / validateModelId: canonical hardened
 *    validators from the former validate.ts (ReDoS-safe, documented).
 *  - validateEmail / validateSemver /
 *    validateProjectId                 : legacy system.ts names kept as
 *    one-line aliases of the canonical validators above.
 *  - validateModelIdCharset           : former system.ts validateModelId
 *    charset regex variant, renamed because the canonical validateModelId
 *    is the semantic gemini/claude/antigravity check.
 *
 *  Contract:
 *  - Path: ~/.config/opencode/antigravity.json (honors OPENCODE_CONFIG_DIR
 *    and XDG_CONFIG_HOME)
 *  - Schema: JSON Schema Draft-07 compatible
 *  - Persistence: atomic write (tmp + chmod 600 + rename), dir 0755/0700
 *  - Defaults: cli_first, rotation round-robin, quota_refresh 15min,
 *    google_search enabled, debug off
 *
 *  Bypass metadata documented in schema description:
 *  Antigravity bypass relies on mimicking antigravity/{ver} {os}/{arch} UA
 *  and bypassing x-goog-user-project stripping, endpoint cascade 403/404/5xx.
 *
 * @author devthink
 * @license MIT
 * @version 2.1.16
 */
/**
 * @file auth.ts
 * @module gateway/auth
 * @description
 *  The gateway request auth and key resolution family of the ownership
 *  wave (wave/ownership.gateway): moved verbatim from devthink/server.ts
 *  section 1D (the grand-merge interned gateway request auth), so the
 *  gateway owns its auth surface — one owner, the family consumes, and
 *  devthink re-exports the public face for the compat consumers.
 *
 *  Responsibilities isolated here:
 *   - Gateway client key resolution — db / env / inline / ephemeral
 *     sources walked in the configured order (resolvekeys and the
 *     private keysfrom* helpers, keys labeled and length-filtered)
 *   - Token extraction / validation / masking from client requests
 *     (extracttoken, extractchatid, extractsessionid, extractrequestid,
 *     validatetoken, masktoken)
 *   - Auth header and query param construction for upstream provider
 *     calls (buildauthheaders, buildauthqueryparams, appendqueryparams —
 *     the 12 auth methods plus the ride-along headers and params)
 *   - Round robin key helpers kept for backward compat (getkey,
 *     getkeycount)
 *
 *  Architectural constraints:
 *   - Verbatim move: every export name and signature preserved — the
 *     devthink server keeps answering the family through one re-export
 *     shim, so no consumer edits with the move
 *   - The db seam stays dynamic: keysfromdb imports the os storage layer
 *     through the published "@wenathlan/devthink/storage" specifier (the
 *     prisma persistence owner) at call time, so this leaf never links
 *     the persistence stack statically and a source-less consumer still
 *     loads
 *   - Zero external dependencies: global fetch / Buffer beside the
 *     owner's types and utils faces
 *
 *  Version: 2.1.7 — the ownership wave auth family extraction
 *
 *  Related modules:
 *   - types.ts — authconfig, resolvedkey (the configuration surface)
 *   - utils.ts — genid (the generated identifier family)
 *   - engine.ts — the universal request pipeline riding these builders
 *   - devthink/server.ts — the compat re-export face of the moved family
 *
 * @author devthink
 * @license MIT
 */
/**
 * @file server.ts
 * @module gateway/server
 * @description
 *  The gateway transport of the ownership wave (wave/ownership.gateway):
 *  moved verbatim from devthink/server.ts (the grand-merge interned http
 *  transport) and devthink/config.ts (the gateway configuration loader),
 *  so the gateway owns its transport — one owner, the family consumes, and
 *  devthink re-exports the public faces for the compat consumers.
 *
 *  Responsibilities isolated here (three sections, one module):
 *   - sse transport — the keepalive constants, the sse/ndjson header
 *     builders, the event writers, the heartbeat discard, the frame
 *     parser, the chunk builders, the stream tracking state and
 *     makestreamresponse (the byte passthrough with masking and
 *     tracking) plus trackwrite
 *   - gateway routes — the canonical route kinds (GATEWAYROUTES of
 *     gateway.ts), the engine handler map, the gateway half of the
 *     merged createserver (cors, the /api/config endpoint, the version
 *     loop, the console static roots and the spa fallback), consoleroots
 *     and main (the transport boot, exported as runserver too)
 *   - gateway config loader — the .mjs-first probe chain over the search
 *     bases (loadconfig, reloadconfig, getversion, listversions,
 *     validateconfig and the private builtindefault/tryimport/
 *     searchbases helpers)
 *
 *  Architectural constraints:
 *   - Verbatim move: every export name and signature preserved — the
 *     devthink server keeps answering the family through one re-export
 *     shim, so no consumer edits with the move
 *   - The devthink composed createserver still answers the whole surface:
 *     the os lanes register on the app this module's createserver built
 *     (devthink/server.ts owns the composition, this module owns the
 *     transport — no os-lane import ever lands here)
 *   - The private createtracker / framedatapayload / trackframe helpers
 *     moved with makestreamresponse and stay private in the owner; the
 *     private builtindefault / tryimport / searchbases helpers moved with
 *     loadconfig the same way
 *
 *  Version: 2.1.8 — the ownership wave server family extraction
 *
 *  Related modules:
 *   - gateway.ts — GATEWAYROUTES (the canonical seven route kinds)
 *   - engine.ts — createversion (the version loop mounts its handlers)
 *   - types.ts — gatewayconfig, gatewaydefinition (the config surface)
 *   - utils.ts — corsheaders, ctsse, ctndjson, the safe json family
 *   - devthink/server.ts — the compat re-export face + the composed server
 *
 * @author devthink
 * @license MIT
 */
/**
 * @file cli.ts
 * @module gateway/cli
 * @description
 *  The gateway console cli of the ownership wave (wave/ownership.gateway,
 *  step 4 — the final double move): moved verbatim from devthink/server.ts
 *  (the grand-merge interned gateway console cli), so the gateway owns its
 *  console family — one owner, the family consumes, and devthink re-exports
 *  the public face for the compat consumers.
 *
 *  Responsibilities isolated here (one section, one module):
 *   - the console family — the zero-dependency arg parser, the version
 *     probe, the ansi colors, the shared stdin question stream, the config
 *     search and the scaffold generators (config.mjs, schema.prisma,
 *     prismaconfig.ts, .env.example), the interactive version builder, the
 *     command dispatch (init add list show validate keys models serve
 *     export help), the family entry runclifamily and the console main.
 *
 *  Architectural constraints:
 *   - Verbatim move: every export name and signature preserved — the
 *     devthink server keeps answering the family through one re-export
 *     shim, so no consumer edits with the move.
 *   - The serve seam (the step 3 report): cmdserve boots THIS owner's
 *     transport main (./server.js — the getry transport boot). The devthink
 *     server entry keeps its own composed boot for its os lanes and answers
 *     serve there itself; the autorun guard below moved with the family and
 *     is re-keyed on the cli module, so only a direct `bun cli.ts` (or a
 *     built cli.js entry) run executes the console here.
 *   - The banner text keeps the historical string the cli test pins
 *     ("@wenathlan/devthink gateway"); the house may rename faces in a
 *     later wave.
 *
 *  Version: 2.1.8 — the ownership wave console cli extraction
 *
 *  Related modules:
 *   - server.ts — the transport this cli's serve boots (main/runserver)
 *   - devthink/server.ts — the compat re-export face of the moved family
 *
 * @author devthink
 * @license MIT
 */
