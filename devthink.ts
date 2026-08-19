#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { clearAuthCredential, ensurePaths, getConfigValue, migrateLegacyCredentials, parseConfigValue, readAuth, readConfig, redactAuth, redactConfig, resolvePaths, saveConfig, setAuthCredential, setConfigValue, type DevThinkConfig } from "./config.ts";
import { createMemoryStore, memorySummary } from "./memory.ts";
import { listModes, modePrompt, resolveMode } from "./modes.ts";
import { listModels, listProviders, streamChat } from "./providers.ts";
import { appendMessage, createSession, exportSession, listSessions, loadSession, type Session } from "./session.ts";
import { createPairing, getIdentity, pairingStatus, revokeBrowserSessions } from "./identity.ts";
import type { ChatEvent } from "./stream.ts";
import { banner, box, colors, formatConfig, formatEvent, statusBar } from "./ui.ts";
import { startServer } from "./server.ts";
import { exportLocalSnapshot, remoteSyncStatus } from "./sync.ts";

export type ParsedArgs = { flags: Record<string, string | boolean>; positional: string[] };

function version(): string {
  const embedded = process.env.DEVTHINK_VERSION?.trim();
  if (embedded) return embedded;
  try {
    const file = new URL("./package.json", import.meta.url);
    return String((JSON.parse(readFileSync(file, "utf8")) as { version?: string }).version || "0.0.0");
  } catch {
    return "0.0.0";
  }
}

function parseArgs(args: string[]): ParsedArgs {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (!value.startsWith("-")) {
      positional.push(value);
      continue;
    }
    const key = value.replace(/^-+/, "");
    const next = args[index + 1];
    if (next && !next.startsWith("-")) {
      flags[key] = next;
      index += 1;
    } else flags[key] = true;
  }
  return { flags, positional };
}

function stringFlag(parsed: ParsedArgs, key: string): string | undefined {
  const value = parsed.flags[key];
  return typeof value === "string" ? value : undefined;
}

function boolFlag(parsed: ParsedArgs, key: string): boolean {
  return parsed.flags[key] === true;
}

function printHelp(): void {
  console.log([
    `${colors.cyan}${colors.bold}DevThink CLI${colors.reset} v${version()}`,
    "",
    "Usage: devthink <command> [options]",
    "",
    "Commands:",
    "  chat [message]             Stream a model response",
    "  providers                 List supported provider transports",
    "  models --provider <id>    List provider models",
    "  modes                     List the 20 operational modes",
    "  config [key] [value]      Read or write local configuration",
    "  auth login <provider>     Save a user-provided official credential",
    "  auth status               Show redacted configured credential sources",
    "  auth clear <provider>     Remove a stored provider credential",
    "  auth migrate              Move legacy config credentials into auth.json",
    "  identity                  Show local public user and device identifiers",
    "  pair create               Create a one-time code for the published web workbench",
    "  pair revoke               Revoke current paired browser sessions",
    "  sync status               Show local snapshot and remote adapter readiness",
    "  sync export               Print a credential-free local sync snapshot",
    "  gateway status            Show the embedded provider gateway state",
    "  sessions list             List saved sessions",
    "  sessions export <id>      Print a session as Markdown or JSON",
    "  serve [--port <n>]        Start the local loopback API",
    "  init                      Create local DevThink directories",
    "  interactive               Start the terminal chat loop",
    "",
    "Chat options:",
    "  --provider <id>           openai, zai, anthropic, google, openrouter, qwen, deepseek, groq, mistral, xai, ollama, mimo",
    "  --model <id>              Provider model identifier",
    "  --mode <id>               One of the 20 registered modes",
    "  --prompt <text>           Explicit prompt, useful in scripts",
    "  --format json             Emit one machine-readable result",
    "  --no-save                 Do not persist the session",
    "",
    "Credentials are read from ~/.config/devthink/auth.json or environment variables. Browser-cookie capture and anti-bot bypass are not supported.",
  ].join("\n"));
}

function loadRuntime(): { config: DevThinkConfig; paths: ReturnType<typeof resolvePaths>; memory: ReturnType<typeof createMemoryStore> } {
  const paths = ensurePaths(resolvePaths());
  const config = readConfig(paths);
  return { config, paths, memory: createMemoryStore(paths) };
}

function printEvents(events: ChatEvent[], json: boolean): void {
  if (json) {
    console.log(JSON.stringify(events));
    return;
  }
  for (const event of events) {
    const rendered = formatEvent(event);
    if (rendered) process.stdout.write(rendered);
  }
  process.stdout.write("\n");
}

async function runChat(prompt: string, parsed: ParsedArgs, runtime: ReturnType<typeof loadRuntime>, current?: Session): Promise<Session | undefined> {
  const provider = stringFlag(parsed, "provider") || runtime.config.activeProvider || runtime.config.provider;
  const model = stringFlag(parsed, "model") || runtime.config.activeModel || runtime.config.model;
  const mode = stringFlag(parsed, "mode") || "chat";
  if (!provider || !model) throw new Error("Set provider and model with --provider/--model or devthink config.");
  const modeDefinition = resolveMode(mode);
  const requestedSession = stringFlag(parsed, "session");
  const session = current || (requestedSession ? loadSession(runtime.paths, requestedSession) : undefined) || createSession(runtime.paths, { mode: modeDefinition.id, model, provider, workspaceId: stringFlag(parsed, "workspace"), tabId: stringFlag(parsed, "tab") });
  const storedMemory = runtime.memory.resolve({ text: prompt, sessionId: session.id });
  const system = [modePrompt(modeDefinition), storedMemory ? `Relevant local memory: ${storedMemory.content}` : memorySummary(runtime.memory)].filter(Boolean).join("\n\n");
  const userMessage = { role: "user" as const, content: prompt };
  const nextSession = appendMessage(runtime.paths, session, userMessage);
  const events: ChatEvent[] = [];
  let text = "";
  let reasoning = "";
  const json = stringFlag(parsed, "format") === "json";
  const stream = await streamChat({ provider, model, messages: [{ role: "system", content: system }, ...nextSession.messages.map(({ role, content }) => ({ role, content }))], temperature: runtime.config.temperature, maxTokens: runtime.config.maxTokens }, runtime.config, runtime.paths);
  for await (const event of stream) {
    events.push(event);
    if (event.type === "text") text += event.text;
    if (event.type === "reasoning") reasoning += event.text;
    if (!json) {
      const rendered = formatEvent(event);
      if (rendered) process.stdout.write(rendered);
    }
  }
  const withAssistant = appendMessage(runtime.paths, nextSession, { role: "assistant", content: text });
  runtime.memory.remember({ layer: "session", key: withAssistant.id, content: text.slice(0, 2000) });
  if (json) console.log(JSON.stringify({ workspaceId: withAssistant.workspaceId, sessionId: withAssistant.id, tabId: withAssistant.activeTabId, messageId: withAssistant.messages.at(-1)?.id, provider, model, mode: modeDefinition.id, text, reasoning }));
  else process.stdout.write("\n");
  return withAssistant;
}

async function handleConfig(parsed: ParsedArgs, runtime: ReturnType<typeof loadRuntime>): Promise<void> {
  const key = parsed.positional[1];
  const raw = parsed.positional[2];
  if (!key) return console.log(formatConfig(redactConfig(runtime.config)));
  if (raw === undefined) return console.log(`${key} = ${JSON.stringify(getConfigValue(runtime.config, key))}`);
  saveConfig(setConfigValue(runtime.config, key, parseConfigValue(raw)), runtime.paths);
  console.log(`${key} updated.`);
}

async function handleAuth(parsed: ParsedArgs, runtime: ReturnType<typeof loadRuntime>): Promise<void> {
  const action = parsed.positional[1] || "status";
  if (action === "status") return console.log(JSON.stringify({ config: redactConfig(runtime.config), auth: redactAuth(readAuth(runtime.paths)), authPath: runtime.paths.auth }, null, 2));
  if (action === "login") {
    const provider = parsed.positional[2];
    const token = stringFlag(parsed, "token") || stringFlag(parsed, "api-key");
    const kind = stringFlag(parsed, "kind") || "api-key";
    if (!provider || !token) throw new Error("Usage: devthink auth login <provider> --token <user-provided-credential> [--kind api-key|bearer|oauth]");
    if (!(["api-key", "bearer", "oauth"] as string[]).includes(kind)) throw new Error("--kind must be api-key, bearer or oauth.");
    const expiresAt = stringFlag(parsed, "expires-at");
    const refreshToken = stringFlag(parsed, "refresh-token");
    const resourceUrl = stringFlag(parsed, "resource-url");
    const credential = kind === "oauth" ? { kind: "oauth" as const, accessToken: token, ...(refreshToken ? { refreshToken } : {}), ...(expiresAt ? { expiresAt: Number(expiresAt) } : {}), ...(resourceUrl ? { resourceUrl } : {}) } : { kind: kind as "api-key" | "bearer", value: token };
    setAuthCredential(provider, credential, runtime.paths);
    saveConfig({ ...runtime.config, activeProvider: runtime.config.activeProvider || provider }, runtime.paths);
    return console.log(`${provider} credential saved to ${runtime.paths.auth}.`);
  }
  if (action === "clear") {
    const provider = parsed.positional[2];
    if (!provider) throw new Error("Usage: devthink auth clear <provider>");
    clearAuthCredential(provider, runtime.paths);
    const next = { ...runtime.config };
    const providers = { ...(next.providers || {}) };
    if (providers[provider]) {
      const { auth: _auth, apiKey: _apiKey, ...remaining } = providers[provider];
      providers[provider] = remaining;
    }
    next.providers = providers;
    delete (next as Record<string, unknown>)[`${provider}ApiKey`];
    saveConfig(next, runtime.paths);
    return console.log(`${provider} credential cleared from ${runtime.paths.auth}; legacy config fields were removed if present.`);
  }
  if (action === "migrate") {
    const result = migrateLegacyCredentials(runtime.config, runtime.paths);
    return console.log(result.migrated.length ? `Migrated ${result.migrated.join(", ")} to ${runtime.paths.auth}.` : "No legacy credentials needed migration.");
  }
  throw new Error("Supported auth actions: login, status, clear, migrate.");
}

function handleIdentity(runtime: ReturnType<typeof loadRuntime>): void {
  console.log(JSON.stringify({ identity: getIdentity(runtime.paths), pairing: pairingStatus(runtime.paths) }, null, 2));
}

function handlePairing(parsed: ParsedArgs, runtime: ReturnType<typeof loadRuntime>): void {
  const action = parsed.positional[1] || "create";
  if (action === "status") return handleIdentity(runtime);
  if (action === "revoke") return console.log(`Revoked ${revokeBrowserSessions(runtime.paths)} paired browser session(s).`);
  if (action !== "create") throw new Error("Supported pair actions: create, status, revoke.");
  const pairing = createPairing(runtime.paths);
  const pagesUrl = stringFlag(parsed, "web-url") || runtime.config.web?.pagesUrl;
  const gatewayUrl = stringFlag(parsed, "gateway") || runtime.config.web?.gatewayUrl;
  console.log(JSON.stringify({ userId: pairing.identity.userId, pairingId: pairing.pairingId, code: pairing.code, expiresAt: pairing.expiresAt, ...(pagesUrl ? { pagesUrl } : {}), ...(gatewayUrl ? { gatewayUrl } : {}), message: "Open the pages URL, set the local gateway URL, and enter this code. It can be consumed once within five minutes." }, null, 2));
}

function handleSync(parsed: ParsedArgs, runtime: ReturnType<typeof loadRuntime>): void {
  const action = parsed.positional[1] || "status";
  const snapshot = exportLocalSnapshot(runtime.paths);
  if (action === "export") return console.log(JSON.stringify(snapshot, null, 2));
  if (action === "status") return console.log(JSON.stringify({ userId: snapshot.userId, deviceId: snapshot.deviceId, workspaces: snapshot.workspaces.length, sessions: snapshot.sessions.length, remote: remoteSyncStatus(runtime.config) }, null, 2));
  throw new Error("Supported sync actions: status, export.");
}

function handleGateway(runtime: ReturnType<typeof loadRuntime>): void {
  const activeProvider = runtime.config.activeProvider || runtime.config.provider || "not configured";
  const endpoint = activeProvider === "not configured" ? undefined : runtime.config.providers?.[activeProvider]?.baseUrl || runtime.config.baseUrl;
  console.log(formatConfig({
    mode: runtime.config.gateway?.mode || "embedded",
    streaming: runtime.config.gateway?.stream ?? true,
    activeProvider,
    endpoint: endpoint || "provider default",
    webEnabled: runtime.config.web?.enabled ?? true,
    config: runtime.paths.config,
    auth: runtime.paths.auth,
  }));
}

async function handleSessions(parsed: ParsedArgs, runtime: ReturnType<typeof loadRuntime>): Promise<void> {
  const action = parsed.positional[1] || "list";
  if (action === "list") return console.log(listSessions(runtime.paths).map((session) => `${session.id}  ${session.title}`).join("\n") || "No sessions.");
  if (action === "export") {
    const id = parsed.positional[2];
    if (!id) throw new Error("Usage: devthink sessions export <id>");
    console.log(exportSession(runtime.paths, id, stringFlag(parsed, "format") === "json" ? "json" : "markdown"));
    return;
  }
  throw new Error("Supported session actions: list, export.");
}

async function interactive(runtime: ReturnType<typeof loadRuntime>): Promise<void> {
  const input = createInterface({ input: stdin, output: stdout, terminal: true });
  let session: Session | undefined;
  let mode = runtime.config.mode || "chat";
  console.log(banner(version()));
  console.log(box("status", statusBar(runtime.config.activeProvider || runtime.config.provider || "not configured", runtime.config.activeModel || runtime.config.model || "not configured", mode)));
  console.log("Type a message or /help. Use /exit to leave.");
  try {
    while (true) {
      const value = (await input.question("> ")).trim();
      if (!value) continue;
      if (value === "/exit" || value === "/quit") break;
      if (value === "/help") {
        console.log("/models  /modes  /new  /sessions  /mode <id>  /clear  /exit");
        continue;
      }
      if (value === "/clear") {
        console.clear();
        continue;
      }
      if (value === "/new") {
        session = undefined;
        console.log("New session ready.");
        continue;
      }
      if (value.startsWith("/mode ")) {
        mode = resolveMode(value.slice(6).trim()).id;
        console.log(`Mode: ${mode}`);
        continue;
      }
      if (value === "/modes") {
        console.log(listModes().map((item) => `${item.id}  ${item.purpose}`).join("\n"));
        continue;
      }
      if (value === "/sessions") {
        console.log(listSessions(runtime.paths).map((item) => `${item.id}  ${item.title}`).join("\n") || "No sessions.");
        continue;
      }
      if (value === "/models") {
        const provider = runtime.config.activeProvider || runtime.config.provider;
        if (!provider) console.log("Configure a provider first.");
        else console.log((await listModels(provider, runtime.config)).map((item) => item.id).join("\n"));
        continue;
      }
      session = await runChat(value, { flags: { mode }, positional: [] }, runtime, session);
    }
  } finally {
    input.close();
  }
}

export async function main(argv = process.argv.slice(2)): Promise<void> {
  const parsed = parseArgs(argv);
  const runtime = loadRuntime();
  const command = parsed.positional[0] || (process.stdin.isTTY ? "interactive" : "help");
  if (boolFlag(parsed, "help") || command === "help") return printHelp();
  if (boolFlag(parsed, "version") || command === "version") return console.log(version());
  if (command === "init") return console.log(`Initialized ${runtime.paths.home}\nConfig: ${runtime.paths.config}`);
  if (command === "providers") return console.log(listProviders().map((provider) => `${provider.id}  ${provider.protocol}  ${provider.env}`).join("\n"));
  if (command === "modes") return console.log(listModes().map((mode) => `${mode.id}  ${mode.purpose}`).join("\n"));
  if (command === "config") return handleConfig(parsed, runtime);
  if (command === "auth") return handleAuth(parsed, runtime);
  if (command === "identity") return handleIdentity(runtime);
  if (command === "pair") return handlePairing(parsed, runtime);
  if (command === "sync") return handleSync(parsed, runtime);
  if (command === "gateway") return handleGateway(runtime);
  if (command === "sessions") return handleSessions(parsed, runtime);
  if (command === "models") {
    const provider = stringFlag(parsed, "provider") || runtime.config.activeProvider || runtime.config.provider;
    if (!provider) throw new Error("Use --provider or configure provider.");
    return console.log((await listModels(provider, runtime.config, runtime.paths)).map((model) => `${model.id}  ${model.provider}`).join("\n"));
  }
  if (command === "serve") {
    const server = await startServer({ port: stringFlag(parsed, "port") ? Number(stringFlag(parsed, "port")) : undefined, config: runtime.config, paths: runtime.paths });
    console.log(`DevThink API listening at ${server.address}`);
    return;
  }
  if (command === "interactive") return interactive(runtime);
  if (command === "chat") {
    const prompt = stringFlag(parsed, "prompt") || parsed.positional.slice(1).join(" ");
    if (!prompt) throw new Error("Usage: devthink chat --prompt \"your message\"");
    return void (await runChat(prompt, parsed, runtime));
  }
  throw new Error(`Unknown command: ${command}`);
}

const directEntry = process.argv[1]?.endsWith("devthink.ts") || process.argv[1]?.endsWith("devthink");
const bunEntry = (import.meta as ImportMeta & { main?: boolean }).main === true;
if (directEntry || bunEntry) main().catch((error: unknown) => { console.error(`${colors.red}Error:${colors.reset} ${error instanceof Error ? error.message : "Command failed."}`); process.exitCode = 1; });
