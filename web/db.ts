/** DevThink v1.1.16: browser-local, non-secret workbench records. IndexedDB is an offline cache, never a credential vault or remote database. */

export type BrowserIdentity = { userId: string; deviceId: string; createdAt: string };
export type BrowserRoute = { workspaceId: string; sessionId: string; tabId: string; sectionId: string };

type LocalRecord = { id: string; ownerId: string; updatedAt: string; deviceId: string; revision: number; tombstone: boolean };
export type BrowserWorkspace = LocalRecord & { title: string; createdAt: string };
export type BrowserSession = LocalRecord & { workspaceId: string; title: string; mode: string; model?: string; provider?: string; activeTabId: string; createdAt: string };
export type BrowserTab = LocalRecord & { sessionId: string; workspaceId: string; label: string; provider?: string; sectionId: string; createdAt: string };
export type BrowserMessage = LocalRecord & { sessionId: string; workspaceId: string; tabId: string; sectionId: string; role: "user" | "assistant" | "system"; content: string; createdAt: string };
export type BrowserPreference = LocalRecord & { key: string; value: string };
export type BrowserCredential = { id: string; ownerId: string; providerId: string; value: string; deviceId: string; createdAt: string; updatedAt: string; localOnly: true };
export type BrowserSessionSnapshot = { identity: BrowserIdentity; workspace?: BrowserWorkspace; session?: BrowserSession; tabs: BrowserTab[]; messages: BrowserMessage[]; preferences: Record<string, string> };
export type BrowserStoreSummary = { available: boolean; database: string; ownerId?: string; deviceId?: string; workspaces: number; sessions: number; tabs: number; messages: number; preferences: number; mode: "local-only" | "paired-gateway" | "remote-adapter" };

type StoreName = "meta" | "workspaces" | "sessions" | "tabs" | "messages" | "preferences" | "credentials";
type MetaEntry = { key: string; value: BrowserIdentity };

const databaseName = "devthink.db";
const databaseVersion = 2;
const dataStores: Array<Exclude<StoreName, "meta">> = ["workspaces", "sessions", "tabs", "messages", "preferences"];
const ownerExpression = /^[a-z][a-z0-9]{9,14}$/;

function timestamp(): string { return new Date().toISOString(); }

function compactToken(length = 10): string {
  const alphabet = "0123456789abcdefghjkmnpqrstvwxyz";
  const bytes = new Uint8Array(length);
  globalThis.crypto?.getRandomValues?.(bytes);
  return Array.from(bytes, (value, index) => alphabet[value ? value & 31 : (Date.now() + index) & 31]).join("");
}

function request<T>(source: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    source.onsuccess = () => resolve(source.result);
    source.onerror = () => reject(source.error || new Error("DevThink browser store request failed."));
  });
}

function finished(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error("DevThink browser store transaction aborted."));
    transaction.onerror = () => reject(transaction.error || new Error("DevThink browser store transaction failed."));
  });
}

function openStore(): Promise<IDBDatabase> {
  if (!("indexedDB" in globalThis)) return Promise.reject(new Error("IndexedDB is unavailable in this browser."));
  return new Promise((resolve, reject) => {
    const open = globalThis.indexedDB.open(databaseName, databaseVersion);
    open.onupgradeneeded = () => {
      const database = open.result;
      if (!database.objectStoreNames.contains("meta")) database.createObjectStore("meta", { keyPath: "key" });
      for (const storeName of dataStores) {
        if (database.objectStoreNames.contains(storeName)) continue;
        const store = database.createObjectStore(storeName, { keyPath: "id" });
        store.createIndex("ownerId", "ownerId", { unique: false });
        if (storeName === "sessions") store.createIndex("workspaceId", "workspaceId", { unique: false });
        if (storeName === "tabs" || storeName === "messages") store.createIndex("sessionId", "sessionId", { unique: false });
      }
      if (!database.objectStoreNames.contains("credentials")) {
        const credentials = database.createObjectStore("credentials", { keyPath: "id" });
        credentials.createIndex("ownerId", "ownerId", { unique: false });
        credentials.createIndex("providerId", "providerId", { unique: false });
      }
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error || new Error("DevThink browser store could not open."));
  });
}

async function withStore<T>(storeName: StoreName, mode: IDBTransactionMode, operation: (store: IDBObjectStore) => Promise<T>): Promise<T> {
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

async function record<T>(storeName: StoreName, id: string): Promise<T | undefined> {
  return withStore(storeName, "readonly", async (store) => (await request(store.get(id)) as T | undefined));
}

async function allOwned<T extends LocalRecord>(storeName: Exclude<StoreName, "meta">, ownerId: string): Promise<T[]> {
  return withStore(storeName, "readonly", async (store) => ((await request(store.index("ownerId").getAll(IDBKeyRange.only(ownerId))) as T[]).filter((item) => !item.tombstone)));
}

async function put<T>(storeName: StoreName, value: T): Promise<T> {
  return withStore(storeName, "readwrite", async (store) => { await request(store.put(value)); return value; });
}

async function updateRecord<T extends LocalRecord>(storeName: Exclude<StoreName, "meta">, identity: BrowserIdentity, id: string, value: Omit<T, keyof LocalRecord> & Partial<Pick<T, "updatedAt" | "tombstone">>): Promise<T> {
  const current = await record<T>(storeName, id);
  const next = {
    ...current,
    ...value,
    id,
    ownerId: identity.userId,
    deviceId: identity.deviceId,
    updatedAt: value.updatedAt || timestamp(),
    revision: Math.max(0, current?.revision || 0) + 1,
    tombstone: value.tombstone || false,
  } as T;
  return put(storeName, next);
}

/** Creates one browser-local identity only when a paired CLI identity is not available. */
export async function browserIdentity(): Promise<BrowserIdentity> {
  const existing = await record<MetaEntry>("meta", "identity");
  if (existing?.value && ownerExpression.test(existing.value.userId)) return existing.value;
  const identity = { userId: `b${compactToken(11)}`, deviceId: `d_${compactToken(10)}`, createdAt: timestamp() };
  await put("meta", { key: "identity", value: identity } satisfies MetaEntry);
  return identity;
}

/** Caches the public identity supplied by a paired local gateway without importing any authentication material. */
export async function cacheBrowserIdentity(identity: BrowserIdentity): Promise<BrowserIdentity> {
  if (!ownerExpression.test(identity.userId)) return browserIdentity();
  const current = await browserIdentity();
  if (current.userId !== identity.userId) {
    for (const storeName of dataStores) {
      const records = await allOwned<LocalRecord>(storeName, current.userId);
      for (const item of records) await put(storeName, { ...item, ownerId: identity.userId, deviceId: current.deviceId, updatedAt: timestamp(), revision: item.revision + 1 });
    }
  }
  const next = { ...current, userId: identity.userId };
  await put("meta", { key: "identity", value: next } satisfies MetaEntry);
  return next;
}

export async function readBrowserPreferences(): Promise<Record<string, string>> {
  const identity = await browserIdentity();
  const preferences = await allOwned<BrowserPreference>("preferences", identity.userId);
  return Object.fromEntries(preferences.map((preference) => [preference.key, preference.value]));
}

/** Persists a non-secret interface preference or provider selection locally in this browser. */
export async function saveBrowserPreference(key: string, value: string): Promise<BrowserPreference> {
  const identity = await browserIdentity();
  return updateRecord<BrowserPreference>("preferences", identity, `${identity.userId}:${key}`, { key, value });
}

/** Stores a provider credential only after an explicit browser-local consent action. It is never included in summaries, gateway payloads or remote sync records. */
export async function saveBrowserCredential(providerId: string, value: string): Promise<void> {
  const identity = await browserIdentity();
  const now = timestamp();
  const id = `${identity.userId}:${providerId}`;
  const existing = await record<BrowserCredential>("credentials", id);
  await put("credentials", { id, ownerId: identity.userId, providerId, value, deviceId: identity.deviceId, createdAt: existing?.createdAt || now, updatedAt: now, localOnly: true } satisfies BrowserCredential);
}

export async function removeBrowserCredential(providerId: string): Promise<void> {
  const identity = await browserIdentity();
  await withStore("credentials", "readwrite", async (store) => { await request(store.delete(`${identity.userId}:${providerId}`)); });
}

export async function browserCredentialProviders(): Promise<string[]> {
  const identity = await browserIdentity();
  return withStore("credentials", "readonly", async (store) => ((await request(store.index("ownerId").getAll(IDBKeyRange.only(identity.userId)))) as BrowserCredential[]).filter((credential) => credential.localOnly).map((credential) => credential.providerId));
}

/** Ensures a URL-addressable workspace, session and tab exist in browser-local storage. */
export async function ensureBrowserSession(route: BrowserRoute, input: { provider?: string; model?: string; title?: string; mode?: string; tabLabel?: string } = {}): Promise<BrowserSessionSnapshot> {
  const identity = await browserIdentity();
  const now = timestamp();
  const workspace = await record<BrowserWorkspace>("workspaces", route.workspaceId);
  if (!workspace || workspace.ownerId !== identity.userId) await updateRecord<BrowserWorkspace>("workspaces", identity, route.workspaceId, { title: input.title || "Local workspace", createdAt: now });
  const session = await record<BrowserSession>("sessions", route.sessionId);
  if (!session || session.ownerId !== identity.userId) await updateRecord<BrowserSession>("sessions", identity, route.sessionId, { workspaceId: route.workspaceId, title: input.title || "Local session", mode: input.mode || "chat", model: input.model, provider: input.provider, activeTabId: route.tabId, createdAt: now });
  const tab = await record<BrowserTab>("tabs", route.tabId);
  if (!tab || tab.ownerId !== identity.userId) await updateRecord<BrowserTab>("tabs", identity, route.tabId, { sessionId: route.sessionId, workspaceId: route.workspaceId, label: input.tabLabel || "local session", provider: input.provider, sectionId: route.sectionId, createdAt: now });
  return loadBrowserSession(route.sessionId);
}

export async function loadBrowserSession(sessionId: string): Promise<BrowserSessionSnapshot> {
  const identity = await browserIdentity();
  const session = await record<BrowserSession>("sessions", sessionId);
  const [tabs, messages, preferences] = await Promise.all([allOwned<BrowserTab>("tabs", identity.userId), allOwned<BrowserMessage>("messages", identity.userId), readBrowserPreferences()]);
  return {
    identity,
    workspace: session?.ownerId === identity.userId ? await record<BrowserWorkspace>("workspaces", session.workspaceId) : undefined,
    session: session?.ownerId === identity.userId && !session.tombstone ? session : undefined,
    tabs: tabs.filter((tab) => tab.sessionId === sessionId).sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    messages: messages.filter((message) => message.sessionId === sessionId).sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    preferences,
  };
}

export async function saveBrowserTab(route: BrowserRoute, input: { label: string; provider?: string; sectionId?: string }): Promise<BrowserTab> {
  const identity = await browserIdentity();
  await ensureBrowserSession(route, { provider: input.provider });
  return updateRecord<BrowserTab>("tabs", identity, route.tabId, { sessionId: route.sessionId, workspaceId: route.workspaceId, label: input.label, provider: input.provider, sectionId: input.sectionId || route.sectionId, createdAt: (await record<BrowserTab>("tabs", route.tabId))?.createdAt || timestamp() });
}

export async function removeBrowserTab(id: string): Promise<void> {
  const identity = await browserIdentity();
  const tab = await record<BrowserTab>("tabs", id);
  if (!tab || tab.ownerId !== identity.userId) return;
  await updateRecord<BrowserTab>("tabs", identity, id, { ...tab, tombstone: true });
}

export async function removeBrowserMessage(id: string): Promise<void> {
  const identity = await browserIdentity();
  const message = await record<BrowserMessage>("messages", id);
  if (!message || message.ownerId !== identity.userId) return;
  await updateRecord<BrowserMessage>("messages", identity, id, { ...message, tombstone: true });
}

export async function saveBrowserMessages(route: BrowserRoute, messages: Array<Pick<BrowserMessage, "id" | "role" | "content"> & Partial<Pick<BrowserMessage, "createdAt">>>): Promise<void> {
  const identity = await browserIdentity();
  await ensureBrowserSession(route);
  for (const message of messages) await updateRecord<BrowserMessage>("messages", identity, message.id, { sessionId: route.sessionId, workspaceId: route.workspaceId, tabId: route.tabId, sectionId: route.sectionId, role: message.role, content: message.content, createdAt: message.createdAt || (await record<BrowserMessage>("messages", message.id))?.createdAt || timestamp() });
}

/** Mirrors a safe gateway payload in the browser cache so it remains usable if the local gateway is later unavailable. */
export async function cacheGatewaySession(payload: { id: string; workspaceId: string; title: string; mode?: string; model?: string; provider?: string; activeTabId: string; createdAt?: string; updatedAt?: string; tabs: Array<{ id: string; workspaceId: string; sessionId: string; label: string; provider?: string; sectionId: string; createdAt: string; updatedAt: string }>; messages: Array<{ id: string; workspaceId: string; sessionId: string; tabId: string; sectionId: string; role: "user" | "assistant" | "system"; content: string; createdAt: string }> }): Promise<void> {
  const identity = await browserIdentity();
  const now = timestamp();
  await updateRecord<BrowserWorkspace>("workspaces", identity, payload.workspaceId, { title: payload.title || "Paired workspace", createdAt: payload.createdAt || now, updatedAt: payload.updatedAt || now });
  await updateRecord<BrowserSession>("sessions", identity, payload.id, { workspaceId: payload.workspaceId, title: payload.title, mode: payload.mode || "chat", model: payload.model, provider: payload.provider, activeTabId: payload.activeTabId, createdAt: payload.createdAt || now, updatedAt: payload.updatedAt || now });
  for (const tab of payload.tabs) await updateRecord<BrowserTab>("tabs", identity, tab.id, { sessionId: payload.id, workspaceId: payload.workspaceId, label: tab.label, provider: tab.provider, sectionId: tab.sectionId, createdAt: tab.createdAt, updatedAt: tab.updatedAt });
  for (const message of payload.messages) await updateRecord<BrowserMessage>("messages", identity, message.id, { sessionId: payload.id, workspaceId: payload.workspaceId, tabId: message.tabId, sectionId: message.sectionId, role: message.role, content: message.content, createdAt: message.createdAt, updatedAt: message.createdAt });
}

export async function browserStoreSummary(paired = false): Promise<BrowserStoreSummary> {
  if (!("indexedDB" in globalThis)) return { available: false, database: databaseName, workspaces: 0, sessions: 0, tabs: 0, messages: 0, preferences: 0, mode: paired ? "paired-gateway" : "local-only" };
  const identity = await browserIdentity();
  const [workspaces, sessions, tabs, messages, preferences] = await Promise.all(dataStores.map((storeName) => allOwned<LocalRecord>(storeName, identity.userId)));
  return { available: true, database: databaseName, ownerId: identity.userId, deviceId: identity.deviceId, workspaces: workspaces.length, sessions: sessions.length, tabs: tabs.length, messages: messages.length, preferences: preferences.length, mode: paired ? "paired-gateway" : "local-only" };
}

export async function browserWorkspaces(): Promise<Array<{ id: string; title: string; updatedAt: string; sessionCount: number }>> {
  const identity = await browserIdentity();
  const [workspaces, sessions] = await Promise.all([allOwned<BrowserWorkspace>("workspaces", identity.userId), allOwned<BrowserSession>("sessions", identity.userId)]);
  return workspaces.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)).map((workspace) => ({ id: workspace.id, title: workspace.title, updatedAt: workspace.updatedAt, sessionCount: sessions.filter((session) => session.workspaceId === workspace.id).length }));
}
