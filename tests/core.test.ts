import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createMemoryStore } from "../memory.ts";
import { migrateLegacyCredentials, readAuth, readConfig, redactAuth, redactConfig, resolveCredential, resolvePaths, saveConfig, setAuthCredential, type DevThinkConfig } from "../config.ts";
import { listModes } from "../modes.ts";
import { parseEventStream, type ChatEvent } from "../stream.ts";
import { startServer, type ServerHandle } from "../server.ts";
import { appendMessage, createSession, createTab, loadWorkspace } from "../session.ts";
import { createPairing, createPairingLink, getIdentity, setIdentityUserId } from "../identity.ts";
import { isCompactId } from "../ids.ts";
import { isAllowedOrigin, isSecureRemoteEndpoint, normalizeBasePath, redactProviderError, retryDelay } from "../compatibility.ts";

const temporary: string[] = [];
const servers: ServerHandle[] = [];

afterEach(async () => {
  for (const server of servers.splice(0)) await server.stop();
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

function streamResponse(payload: string): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(payload));
      controller.close();
    },
  });
  return new Response(body, { headers: { "content-type": "text/event-stream" } });
}

async function eventsFrom(response: Response, provider: string): Promise<ChatEvent[]> {
  const events: ChatEvent[] = [];
  for await (const event of parseEventStream(response, { provider, model: "test-model" })) events.push(event);
  return events;
}

describe("stream normalization", () => {
  it("normalizes OpenAI-shaped text deltas", async () => {
    const events = await eventsFrom(streamResponse("data: {\"choices\":[{\"delta\":{\"content\":\"hello\"}}]}\n\ndata: [DONE]\n\n"), "openai");
    assert.equal(events.some((event) => event.type === "text" && event.text === "hello"), true);
  });

  it("normalizes Anthropic named events", async () => {
    const events = await eventsFrom(streamResponse("event: content_block_delta\ndata: {\"type\":\"content_block_delta\",\"delta\":{\"type\":\"text_delta\",\"text\":\"hello\"}}\n\nevent: message_stop\ndata: {\"type\":\"message_stop\"}\n\n"), "anthropic");
    assert.equal(events.some((event) => event.type === "text" && event.text === "hello"), true);
    assert.equal(events.some((event) => event.type === "finish"), true);
  });

  it("normalizes Gemini candidates", async () => {
    const events = await eventsFrom(streamResponse("data: {\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"hello\"}]}}]}\n\n"), "google");
    assert.equal(events.some((event) => event.type === "text" && event.text === "hello"), true);
  });
});

describe("local memory", () => {
  it("resolves session before project and global memory", () => {
    const root = mkdtempSync(join(tmpdir(), "devthink-test-"));
    temporary.push(root);
    const paths = resolvePaths(root);
    const store = createMemoryStore(paths);
    store.remember({ layer: "global", key: "topic", content: "global" });
    store.remember({ layer: "project", key: "topic", content: "project" });
    store.remember({ layer: "session", key: "session-1", content: "session topic" });
    assert.equal(store.resolve({ text: "topic", sessionId: "session-1" })?.content, "session topic");
  });
});

describe("configuration and modes", () => {
  it("redacts configured credentials", () => {
    const config: DevThinkConfig = { provider: "openai", apiKey: "secret-value" };
    assert.equal(String(redactConfig(config).apiKey).includes("secret-value"), false);
  });

  it("registers all 20 modes", () => {
    assert.equal(listModes().length, 20);
  });

  it("redacts nested provider secrets", () => {
    const config: DevThinkConfig = { providers: { zai: { apiKey: "nested-secret-value", auth: { kind: "bearer", value: "nested-token-value" } } } };
    const redacted = JSON.stringify(redactConfig(config));
    assert.equal(redacted.includes("nested-secret-value"), false);
    assert.equal(redacted.includes("nested-token-value"), false);
  });

  it("stores explicit official credentials in auth.json and resolves them before legacy config", () => {
    const root = mkdtempSync(join(tmpdir(), "devthink-auth-"));
    temporary.push(root);
    const paths = resolvePaths(root);
    setAuthCredential("zai", { kind: "api-key", value: "official-user-key" }, paths);
    assert.equal(paths.auth.endsWith("auth.json"), true);
    assert.equal(existsSync(paths.auth), true);
    assert.equal(resolveCredential("zai", { providers: { zai: { apiKey: "legacy-key" } } }, paths), "official-user-key");
    assert.equal(JSON.stringify(redactAuth(readAuth(paths))).includes("official-user-key"), false);
  });

  it("rejects browser-session fields in auth.json and migrates legacy credential values explicitly", () => {
    const root = mkdtempSync(join(tmpdir(), "devthink-auth-migrate-"));
    temporary.push(root);
    const paths = resolvePaths(root);
    writeFileSync(paths.auth, JSON.stringify({ version: 1, providers: { zai: { kind: "bearer", value: "unsafe", cookies: ["browser-session"] } } }));
    assert.deepEqual(readAuth(paths).providers, {});
    const legacy: DevThinkConfig = { providers: { zai: { apiKey: "legacy-zai-key" } } };
    const result = migrateLegacyCredentials(legacy, paths);
    assert.deepEqual(result.migrated, ["zai"]);
    assert.equal(readAuth(paths).providers.zai?.value, "legacy-zai-key");
    assert.equal(readConfig(paths).providers?.zai?.apiKey, undefined);
  });
});

describe("converted TypeScript compatibility", () => {
  it("bounds retries and redacts bearer text before output", () => {
    assert.equal(retryDelay(0), 250);
    assert.equal(retryDelay(20), 4_000);
    assert.equal(redactProviderError("upstream Bearer private-token-value failed").includes("private-token-value"), false);
  });

  it("requires an explicit origin and a secure remote endpoint", () => {
    assert.equal(isAllowedOrigin("https://pages.example", ["https://pages.example"]), true);
    assert.equal(isAllowedOrigin("https://other.example", ["https://pages.example"]), false);
    assert.equal(isSecureRemoteEndpoint("https://sync.example/api"), true);
    assert.equal(isSecureRemoteEndpoint("http://sync.example/api"), false);
  });

  it("normalizes repository-scoped Pages base paths", () => {
    assert.equal(normalizeBasePath(undefined, "Devthink"), "/Devthink/");
    assert.equal(normalizeBasePath("Devthink", "ignored"), "/Devthink/");
  });
});

describe("embedded gateway configuration", () => {
  it("uses devthink.json and atomically preserves nested provider data", () => {
    const root = mkdtempSync(join(tmpdir(), "devthink-config-"));
    temporary.push(root);
    const paths = resolvePaths(root);
    const config: DevThinkConfig = {
      activeProvider: "zai",
      activeModel: "glm-5",
      providers: { zai: { baseUrl: "https://gateway.example/v1", auth: { kind: "api-key", value: "secret" } } },
    };
    saveConfig(config, paths);
    assert.equal(paths.config.endsWith("devthink.json"), true);
    assert.equal(existsSync(paths.config), true);
    assert.equal(readConfig(paths).providers?.zai?.baseUrl, "https://gateway.example/v1");
  });
});

describe("shared local identity", () => {
  it("persists one workspace, session, tab and message contract into JSON and SQLite", () => {
    const root = mkdtempSync(join(tmpdir(), "devthink-identity-"));
    temporary.push(root);
    const paths = resolvePaths(root);
    const session = createSession(paths, { mode: "chat", provider: "zai", model: "glm-5" });
    const withTab = createTab(paths, session, { label: "route review", sectionId: "inspector" });
    const persisted = appendMessage(paths, withTab, { role: "user", content: "Preserve this ID." }, { tabId: withTab.activeTabId, sectionId: "inspector" });
    assert.equal(isCompactId(persisted.workspaceId), true);
    assert.equal(isCompactId(persisted.id), true);
    assert.equal(isCompactId(persisted.activeTabId), true);
    assert.equal(isCompactId(persisted.messages[0].id), true);
    assert.equal(persisted.tabs.some((tab) => tab.id === persisted.activeTabId), true);
    assert.equal(persisted.messages[0].sessionId, persisted.id);
    assert.equal(persisted.messages[0].workspaceId, persisted.workspaceId);
    assert.equal(persisted.messages[0].tabId, persisted.activeTabId);
    assert.equal(loadWorkspace(paths, persisted.workspaceId)?.id, persisted.workspaceId);
    assert.equal(existsSync(paths.database), true);
  });

  it("creates one stable public identity with a temporary pairing code", () => {
    const root = mkdtempSync(join(tmpdir(), "devthink-pairing-"));
    temporary.push(root);
    const paths = resolvePaths(root);
    const identity = getIdentity(paths);
    const pairing = createPairing(paths);
    assert.equal(pairing.identity.userId, identity.userId);
    assert.equal(isCompactId(identity.userId), true);
    assert.equal(isCompactId(identity.deviceId), true);
    assert.equal(isCompactId(pairing.pairingId), true);
    assert.equal(pairing.code.length, 8);
    assert.equal(existsSync(paths.identity), true);
    assert.equal(existsSync(paths.pairings), true);
  });

  it("keeps a user-selected public ID across CLI identity and pairing records", () => {
    const root = mkdtempSync(join(tmpdir(), "devthink-public-id-"));
    temporary.push(root);
    const paths = resolvePaths(root);
    const updated = setIdentityUserId(paths, "devthinkuser13");
    const pairing = createPairing(paths);
    assert.equal(updated.userId, "devthinkuser13");
    assert.equal(getIdentity(paths).userId, "devthinkuser13");
    assert.equal(pairing.identity.userId, "devthinkuser13");
    assert.throws(() => setIdentityUserId(paths, "short"));
  });

  it("builds a temporary invitation link without provider credentials", () => {
    const link = createPairingLink("https://wenathlan.github.io/devthink/", "http://127.0.0.1:42042", "pair_example", "ABCDEFGH");
    assert.equal(link?.includes("pair=pair_example"), true);
    assert.equal(link?.includes("code=ABCDEFGH"), true);
    assert.equal(link?.includes("gateway=http%3A%2F%2F127.0.0.1%3A42042"), true);
    assert.equal(link?.includes("token="), false);
    assert.equal(createPairingLink("not-a-url", "http://127.0.0.1:42042", "pair", "ABCDEFGH"), undefined);
  });
});

describe("local server", () => {
  it("serves health on loopback", async () => {
    const server = await startServer({ config: {} });
    servers.push(server);
    const response = await fetch(`${server.address}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok", service: "devthink" });
    assert.equal(server.address.startsWith("http://127.0.0.1:"), true);
  });

  it("uses identical IDs through the workspace, session and tab gateway routes", async () => {
    const root = mkdtempSync(join(tmpdir(), "devthink-gateway-"));
    temporary.push(root);
    const paths = resolvePaths(root);
    const server = await startServer({ config: {}, paths });
    servers.push(server);
    const created = await fetch(`${server.address}/sessions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: "chat", provider: "mimo", model: "mimo-v2.5-pro", sectionId: "chat" }) });
    assert.equal(created.status, 201);
    const session = await created.json() as { id: string; workspaceId: string; activeTabId: string };
    const read = await fetch(`${server.address}/sessions/${session.id}`);
    assert.equal(read.status, 200);
    const tabResponse = await fetch(`${server.address}/sessions/${session.id}/tabs`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ label: "inspector route", sectionId: "inspector" }) });
    assert.equal(tabResponse.status, 201);
    const updated = await tabResponse.json() as { workspaceId: string; activeTabId: string; tabs: Array<{ id: string; sectionId: string }> };
    assert.equal(updated.workspaceId, session.workspaceId);
    assert.equal(updated.tabs.some((tab) => tab.id === updated.activeTabId && tab.sectionId === "inspector"), true);
    const workspace = await fetch(`${server.address}/workspaces/${session.workspaceId}`);
    assert.equal(workspace.status, 200);
  });

  it("lists local projects and usage while allowing a paired browser to set the active provider", async () => {
    const root = mkdtempSync(join(tmpdir(), "devthink-dashboard-"));
    temporary.push(root);
    const paths = resolvePaths(root);
    const origin = "https://pages.example";
    const server = await startServer({ config: { web: { allowedOrigins: [origin] } }, paths });
    servers.push(server);
    const pairing = createPairing(paths);
    const paired = await fetch(`${server.address}/pairings/consume`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ pairingId: pairing.pairingId, code: pairing.code }) });
    const { token } = await paired.json() as { token: string };
    const headers = { origin, authorization: `Bearer ${token}`, "content-type": "application/json" };
    const created = await fetch(`${server.address}/sessions`, { method: "POST", headers, body: JSON.stringify({ mode: "chat", provider: "zai", model: "glm-5" }) });
    assert.equal(created.status, 201);
    const projects = await fetch(`${server.address}/workspaces`, { headers });
    assert.equal((await projects.json() as { workspaces: unknown[] }).workspaces.length, 1);
    const usage = await fetch(`${server.address}/usage`, { headers });
    assert.equal((await usage.json() as { sessions: number }).sessions, 1);
    const settings = await fetch(`${server.address}/settings`, { headers });
    assert.equal(settings.status, 200);
    assert.equal((await settings.json() as { database: { local: boolean; ownerUserId: string } }).database.local, true);
    const provider = await fetch(`${server.address}/providers/active`, { method: "PATCH", headers, body: JSON.stringify({ provider: "zai", model: "glm-5" }) });
    assert.equal(provider.status, 200);
  });

  it("consumes a web pairing once and revokes browser access", async () => {
    const root = mkdtempSync(join(tmpdir(), "devthink-web-pairing-"));
    temporary.push(root);
    const paths = resolvePaths(root);
    const origin = "https://pages.example";
    const server = await startServer({ config: { web: { allowedOrigins: [origin] } }, paths });
    servers.push(server);
    const pairing = createPairing(paths);
    const consumed = await fetch(`${server.address}/pairings/consume`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ pairingId: pairing.pairingId, code: pairing.code }) });
    assert.equal(consumed.status, 201);
    const credential = await consumed.json() as { token: string; userId: string };
    const identity = await fetch(`${server.address}/identity`, { headers: { origin, authorization: `Bearer ${credential.token}` } });
    assert.equal(identity.status, 200);
    assert.equal((await identity.json() as { identity: { userId: string } }).identity.userId, credential.userId);
    const selectedIdentity = await fetch(`${server.address}/identity`, { method: "PUT", headers: { origin, authorization: `Bearer ${credential.token}`, "content-type": "application/json" }, body: JSON.stringify({ userId: "devthinkuser13" }) });
    assert.equal(selectedIdentity.status, 200);
    assert.equal((await selectedIdentity.json() as { identity: { userId: string } }).identity.userId, "devthinkuser13");
    const created = await fetch(`${server.address}/sessions`, { method: "POST", headers: { origin, authorization: `Bearer ${credential.token}`, "content-type": "application/json" }, body: JSON.stringify({ mode: "chat", provider: "zai", model: "glm-5" }) });
    assert.equal(created.status, 201);
    const expiredPair = createPairing(paths, -1);
    const expiredCode = await fetch(`${server.address}/pairings/consume`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ pairingId: expiredPair.pairingId, code: expiredPair.code }) });
    assert.equal(expiredCode.status, 401);
    const replay = await fetch(`${server.address}/pairings/consume`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ pairingId: pairing.pairingId, code: pairing.code }) });
    assert.equal(replay.status, 401);
    const revoke = await fetch(`${server.address}/pairings/revoke`, { method: "POST", headers: { origin, authorization: `Bearer ${credential.token}` } });
    assert.equal(revoke.status, 200);
    const expired = await fetch(`${server.address}/identity`, { headers: { origin, authorization: `Bearer ${credential.token}` } });
    assert.equal(expired.status, 401);
  });
});
