import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";

export type DevThinkConfig = {
  activeProvider?: string;
  activeModel?: string;
  provider?: string;
  model?: string;
  mode?: string;
  baseUrl?: string;
  apiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
  zaiApiKey?: string;
  temperature?: number;
  maxTokens?: number;
  projectMemory?: boolean;
  externalMemory?: boolean;
  fallbackProviders?: string[];
  providers?: Record<string, {
    baseUrl?: string;
    apiKey?: string;
    model?: string;
    transport?: "official" | "openai-compatible" | "local-gateway";
    auth?: { kind: "api-key" | "bearer" | "oauth"; value?: string; expiresAt?: number };
  }>;
  gateway?: { mode?: "embedded"; stream?: boolean; host?: string };
  web?: { enabled?: boolean; pagesUrl?: string; gatewayUrl?: string; allowedOrigins?: string[]; remoteSync?: { enabled?: boolean; endpoint?: string } };
};

export type AuthKind = "api-key" | "bearer" | "oauth";
export type AuthCredential = { kind: AuthKind; value?: string; accessToken?: string; refreshToken?: string; expiresAt?: number; resourceUrl?: string; updatedAt: string };
export type DevThinkAuth = { version: 1; providers: Record<string, AuthCredential> };

export type DevThinkPaths = {
  home: string;
  config: string;
  auth: string;
  identity: string;
  pairings: string;
  legacyConfig: string;
  sessions: string;
  workspaces: string;
  database: string;
  legacyDatabase: string;
  memory: string;
  logs: string;
};

function resolveHome(): string {
  const override = process.env.DEVTHINK_HOME?.trim();
  if (override) return override;
  if (platform() === "win32") return join(process.env.APPDATA || homedir(), "devthink");
  if (platform() === "darwin") return join(homedir(), "Library", "Application Support", "devthink");
  return join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "devthink");
}

export function resolvePaths(root = resolveHome()): DevThinkPaths {
  return { home: root, config: join(root, "devthink.json"), auth: join(root, "auth.json"), identity: join(root, "identity.json"), pairings: join(root, "pairings.json"), legacyConfig: join(root, "config.json"), sessions: join(root, "sessions"), workspaces: join(root, "workspaces"), database: join(root, "devthink.db"), legacyDatabase: join(root, "devthink.sqlite"), memory: join(root, "memory"), logs: join(root, "logs") };
}

export function ensurePaths(paths = resolvePaths()): DevThinkPaths {
  for (const path of [paths.home, paths.sessions, paths.workspaces, paths.memory, paths.logs]) mkdirSync(path, { recursive: true });
  if (!existsSync(paths.database) && existsSync(paths.legacyDatabase)) {
    try { copyFileSync(paths.legacyDatabase, paths.database); } catch { /* The JSON session records remain the safe compatibility fallback. */ }
  }
  return paths;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function writeJson(path: string, value: unknown, mode?: number): void {
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, mode ? { encoding: "utf8", mode } : "utf8");
  renameSync(temporary, path);
}

export function readConfig(paths = resolvePaths()): DevThinkConfig {
  try {
    const candidate = existsSync(paths.config) ? paths.config : paths.legacyConfig;
    if (!existsSync(candidate)) return {};
    const parsed: unknown = JSON.parse(readFileSync(candidate, "utf8"));
    if (!isRecord(parsed)) return {};
    const config = parsed as DevThinkConfig;
    return { ...config, activeProvider: config.activeProvider || config.provider, activeModel: config.activeModel || config.model };
  } catch {
    return {};
  }
}

export function saveConfig(config: DevThinkConfig, paths = resolvePaths()): void {
  ensurePaths(paths);
  writeJson(paths.config, { ...config, activeProvider: config.activeProvider || config.provider, activeModel: config.activeModel || config.model, gateway: { mode: "embedded" as const, stream: true, ...config.gateway } });
}

const forbiddenAuthFields = new Set(["cookie", "cookies", "fingerprint", "useragent", "sessiontoken", "captcha", "browserprofile"]);

function validCredential(value: unknown): AuthCredential | undefined {
  if (!isRecord(value) || Object.keys(value).some((key) => forbiddenAuthFields.has(key.toLowerCase()))) return undefined;
  const kind = String(value.kind) as AuthKind;
  if (!["api-key", "bearer", "oauth"].includes(kind)) return undefined;
  const token = typeof value.value === "string" ? value.value : undefined;
  const accessToken = typeof value.accessToken === "string" ? value.accessToken : undefined;
  const refreshToken = typeof value.refreshToken === "string" ? value.refreshToken : undefined;
  if ((kind === "oauth" && !accessToken) || (kind !== "oauth" && !token)) return undefined;
  return { kind, ...(token ? { value: token } : {}), ...(accessToken ? { accessToken } : {}), ...(refreshToken ? { refreshToken } : {}), ...(typeof value.expiresAt === "number" ? { expiresAt: value.expiresAt } : {}), ...(typeof value.resourceUrl === "string" ? { resourceUrl: value.resourceUrl } : {}), updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString() };
}

export function readAuth(paths = resolvePaths()): DevThinkAuth {
  try {
    if (!existsSync(paths.auth)) return { version: 1, providers: {} };
    const parsed: unknown = JSON.parse(readFileSync(paths.auth, "utf8"));
    if (!isRecord(parsed) || !isRecord(parsed.providers)) return { version: 1, providers: {} };
    const providers: Record<string, AuthCredential> = {};
    for (const [provider, raw] of Object.entries(parsed.providers)) {
      const credential = validCredential(raw);
      if (credential) providers[provider.toLowerCase()] = credential;
    }
    return { version: 1, providers };
  } catch {
    return { version: 1, providers: {} };
  }
}

export function saveAuth(auth: DevThinkAuth, paths = resolvePaths()): void {
  ensurePaths(paths);
  const providers: Record<string, AuthCredential> = {};
  for (const [provider, raw] of Object.entries(auth.providers)) {
    const credential = validCredential(raw);
    if (credential) providers[provider.toLowerCase()] = credential;
  }
  writeJson(paths.auth, { version: 1, providers }, 0o600);
}

export function setAuthCredential(provider: string, credential: Omit<AuthCredential, "updatedAt">, paths = resolvePaths()): DevThinkAuth {
  const next = { ...credential, updatedAt: new Date().toISOString() };
  if (!validCredential(next)) throw new Error("Credential must use an official api-key, bearer, or OAuth shape without browser-session fields.");
  const current = readAuth(paths);
  const auth = { version: 1 as const, providers: { ...current.providers, [provider.toLowerCase()]: next } };
  saveAuth(auth, paths);
  return auth;
}

export function clearAuthCredential(provider: string, paths = resolvePaths()): DevThinkAuth {
  const current = readAuth(paths);
  const providers = { ...current.providers };
  delete providers[provider.toLowerCase()];
  const auth = { version: 1 as const, providers };
  saveAuth(auth, paths);
  return auth;
}

export function migrateLegacyCredentials(config: DevThinkConfig, paths = resolvePaths()): { config: DevThinkConfig; migrated: string[] } {
  const current = readAuth(paths);
  const providers = { ...current.providers };
  const nextConfig: DevThinkConfig = { ...config, providers: { ...config.providers } };
  const migrated: string[] = [];
  for (const [provider, settings] of Object.entries(config.providers || {})) {
    const legacy = settings.auth?.value || settings.apiKey;
    if (!legacy || providers[provider]) continue;
    const kind = settings.auth?.kind || "api-key";
    providers[provider] = kind === "oauth" ? { kind, accessToken: legacy, expiresAt: settings.auth?.expiresAt, updatedAt: new Date().toISOString() } : { kind, value: legacy, expiresAt: settings.auth?.expiresAt, updatedAt: new Date().toISOString() };
    const { auth: _auth, apiKey: _apiKey, ...rest } = settings;
    nextConfig.providers![provider] = rest;
    migrated.push(provider);
  }
  for (const [provider, property] of Object.entries({ openai: "apiKey", anthropic: "anthropicApiKey", google: "googleApiKey", zai: "zaiApiKey" })) {
    const value = nextConfig[property as keyof DevThinkConfig];
    if (typeof value === "string" && value && !providers[provider]) {
      providers[provider] = { kind: "api-key", value, updatedAt: new Date().toISOString() };
      delete (nextConfig as Record<string, unknown>)[property];
      migrated.push(provider);
    }
  }
  saveAuth({ version: 1, providers }, paths);
  saveConfig(nextConfig, paths);
  return { config: nextConfig, migrated };
}

export function getConfigValue(config: DevThinkConfig, key: string): unknown {
  return (config as Record<string, unknown>)[key];
}

export function setConfigValue(config: DevThinkConfig, key: string, value: unknown): DevThinkConfig {
  return { ...config, [key]: value };
}

export function resolveCredential(provider: string, config: DevThinkConfig, paths = resolvePaths()): string | undefined {
  const auth = readAuth(paths).providers[provider.toLowerCase()];
  if (auth) {
    if (auth.kind === "oauth" && auth.expiresAt && auth.expiresAt <= Date.now()) throw new Error(`Official OAuth credential for ${provider} has expired. Reauthenticate with the provider-owned flow.`);
    return auth.kind === "oauth" ? auth.accessToken : auth.value;
  }
  const envNames: Record<string, string[]> = { openai: ["OPENAI_API_KEY"], anthropic: ["ANTHROPIC_API_KEY"], google: ["GOOGLE_API_KEY", "GEMINI_API_KEY"], zai: ["ZAI_API_KEY"], qwen: ["QWEN_API_KEY"], openrouter: ["OPENROUTER_API_KEY"], deepseek: ["DEEPSEEK_API_KEY"], groq: ["GROQ_API_KEY"], mistral: ["MISTRAL_API_KEY"], xai: ["XAI_API_KEY"], ollama: ["OLLAMA_API_KEY"], mimo: ["MIMO_API_KEY"] };
  for (const name of envNames[provider.toLowerCase()] || []) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  const property = `${provider}ApiKey` as keyof DevThinkConfig;
  const nested = config.providers?.[provider];
  const legacy = config[property];
  const legacyValue = typeof legacy === "string" ? legacy : undefined;
  return nested?.auth?.value || nested?.apiKey || legacyValue || (provider === (config.activeProvider || config.provider) ? config.apiKey : undefined) || process.env.DEVTHINK_API_KEY?.trim();
}

export function redactValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  if (value.length < 8) return "[redacted]";
  return `${value.slice(0, 3)}...${value.slice(-3)}`;
}

export function redactAuth(auth: DevThinkAuth): Record<string, unknown> {
  return { version: auth.version, providers: Object.fromEntries(Object.entries(auth.providers).map(([provider, credential]) => [provider, { kind: credential.kind, ...(credential.value ? { value: redactValue(credential.value) } : {}), ...(credential.accessToken ? { accessToken: redactValue(credential.accessToken) } : {}), ...(credential.refreshToken ? { refreshToken: redactValue(credential.refreshToken) } : {}), ...(credential.expiresAt ? { expiresAt: credential.expiresAt } : {}), ...(credential.resourceUrl ? { resourceUrl: credential.resourceUrl } : {}), updatedAt: credential.updatedAt }])) };
}

export function redactConfig(config: DevThinkConfig): Record<string, unknown> {
  const sensitive = new Set(["apiKey", "anthropicApiKey", "googleApiKey", "zaiApiKey"]);
  return Object.fromEntries(Object.entries(config).map(([key, value]) => {
    if (key === "providers" && value && typeof value === "object") {
      const providers = Object.fromEntries(Object.entries(value as Record<string, Record<string, unknown>>).map(([id, settings]) => [id, Object.fromEntries(Object.entries(settings).map(([setting, item]) => {
        if (setting === "apiKey") return [setting, redactValue(item)];
        if (setting === "auth" && item && typeof item === "object") {
          const auth = item as Record<string, unknown>;
          return [setting, { ...auth, value: redactValue(auth.value) }];
        }
        return [setting, item];
      }))]));
      return [key, providers];
    }
    return [key, sensitive.has(key) || key.toLowerCase().endsWith("apikey") ? redactValue(value) : value];
  }));
}

export function parseConfigValue(raw: string): unknown {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+$/.test(raw)) return Number.parseInt(raw, 10);
  if (/^-?\d+\.\d+$/.test(raw)) return Number.parseFloat(raw);
  if (raw.startsWith("[") || raw.startsWith("{")) {
    try { return JSON.parse(raw); } catch { return raw; }
  }
  return raw;
}
