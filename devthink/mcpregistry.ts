/** Style: DevThink MCP registry — the opt-in automation address book of the
 * native apps. The registry stores the MCP endpoints a connected LLM may
 * reach and the custom providers (any API, any LLM) the operator registers,
 * through a storage adapter the caller injects: the Sol settings page wires
 * the browser localStorage, the tests wire memory, and the registry itself
 * stays pure TypeScript with zero dependencies.
 *
 * The hardcoded defaults, documented once here: the registry boots EMPTY —
 * no endpoint, no provider — and every row starts `enabled: false`. Nothing
 * dials out until the operator adds an address and turns its opt-in toggle
 * on by hand. There is no third state.
 *
 * The URL boundary is the one rule the runner queue client already applies
 * (hostIsAllowed): only public http/https addresses are stored — localhost,
 * loopback literals and private or reserved ranges are refused before a row
 * ever reaches storage, so a connected LLM can never point the apps at the
 * visitor machine. The registry stores the NAME of a provider credential
 * (keyref), never the secret itself. */
import { hostIsAllowed } from "./runner.ts";

/** One MCP endpoint an opted-in LLM client may drive. */
export type McpEndpoint = { id: string; label: string; url: string; enabled: boolean };

/** One custom provider row: any API or LLM the operator registers. The keyref
 * names the credential in the local auth store — the secret never rides here. */
export type CustomProvider = { id: string; label: string; baseUrl: string; keyref: string; enabled: boolean };

/** The whole registry state the storage adapter carries. */
export type McpRegistryState = { endpoints: McpEndpoint[]; providers: CustomProvider[] };

/** The storage seam: the app injects localStorage, the tests inject memory. */
export interface McpStorageAdapter {
  read(): McpRegistryState | undefined;
  write(state: McpRegistryState): void;
}

/** The memory adapter: one closure over a plain object, the test default. */
export function memorystorage(): McpStorageAdapter {
  const state: { value?: McpRegistryState } = {};
  return {
    read() {
      return state.value;
    },
    write(next: McpRegistryState) {
      state.value = next;
    },
  };
}

/** The browser adapter: one localStorage key holding the registry state. The
 * storage may be unavailable (the doctrine keeps every read guarded) — the
 * adapter answers undefined and drops writes instead of throwing. */
export function localstorageadapter(key: string): McpStorageAdapter {
  return {
    read(): McpRegistryState | undefined {
      try {
        const raw = globalThis.localStorage?.getItem(key);
        if (!raw) return undefined;
        const parsed = JSON.parse(raw) as McpRegistryState;
        if (!Array.isArray(parsed.endpoints) || !Array.isArray(parsed.providers)) return undefined;
        return parsed;
      } catch {
        return undefined;
      }
    },
    write(state: McpRegistryState) {
      try {
        globalThis.localStorage?.setItem(key, JSON.stringify(state));
      } catch {
        /* the storage is unavailable: the registry stays session-only */
      }
    },
  };
}

/** Decides whether a candidate url may be stored: only http and https, and
 * only hosts the shared queue boundary lets through — never localhost, a
 * loopback literal or a private or reserved range. */
export function safeurl(candidate: string): boolean {
  const trimmed = candidate.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    return hostIsAllowed(parsed.hostname);
  } catch {
    return false;
  }
}

/** The plain answer every mutation returns: the reason is the honest sentence
 * the settings card surfaces when a row is refused. */
export type McpAnswer<Row> = { ok: boolean; reason?: string; row?: Row };

export type McpEndpointInput = { label: string; url: string };
export type McpProviderInput = { label: string; baseUrl: string; keyref: string };

export type McpRegistry = {
  listendpoints(): McpEndpoint[];
  addendpoint(input: McpEndpointInput): McpAnswer<McpEndpoint>;
  updateendpoint(id: string, patch: Partial<Omit<McpEndpoint, "id">>): McpAnswer<McpEndpoint>;
  removeendpoint(id: string): McpAnswer<McpEndpoint>;
  listproviders(): CustomProvider[];
  addprovider(input: McpProviderInput): McpAnswer<CustomProvider>;
  updateprovider(id: string, patch: Partial<Omit<CustomProvider, "id">>): McpAnswer<CustomProvider>;
  removeprovider(id: string): McpAnswer<CustomProvider>;
};

let mcpserial = 0;

/** Builds one registry over the injected storage. The state boots from the
 * hardcoded defaults (empty, everything off) until the adapter answers with
 * a stored state, and every mutation writes the new state straight through. */
export function createmcpregistry(storage: McpStorageAdapter): McpRegistry {
  function state(): McpRegistryState {
    const stored = storage.read();
    if (stored) return stored;
    return { endpoints: [], providers: [] };
  }
  function persist(next: McpRegistryState) {
    storage.write(next);
  }
  function nextid(prefix: string): string {
    mcpserial += 1;
    return `${prefix}.${Date.now().toString(36)}.${mcpserial.toString(36)}`;
  }
  return {
    listendpoints(): McpEndpoint[] {
      return state().endpoints.map((row) => ({ ...row }));
    },
    addendpoint({ label, url }: McpEndpointInput): McpAnswer<McpEndpoint> {
      const name = label.trim();
      if (!name) return { ok: false, reason: "An endpoint needs a label before it can be stored." };
      if (!safeurl(url)) return { ok: false, reason: "Only public http/https urls are accepted — localhost and private ranges stay closed." };
      const row: McpEndpoint = { id: nextid("mcp.endpoint"), label: name, url: url.trim(), enabled: false };
      const next = state();
      next.endpoints.push(row);
      persist(next);
      return { ok: true, row: { ...row } };
    },
    updateendpoint(id: string, patch: Partial<Omit<McpEndpoint, "id">>): McpAnswer<McpEndpoint> {
      if (patch.url !== undefined && !safeurl(patch.url))
        return { ok: false, reason: "Only public http/https urls are accepted — localhost and private ranges stay closed." };
      const next = state();
      const row = next.endpoints.find((candidate) => candidate.id === id);
      if (!row) return { ok: false, reason: "No endpoint carries that id." };
      if (patch.label !== undefined) {
        const name = patch.label.trim();
        if (!name) return { ok: false, reason: "An endpoint needs a label before it can be stored." };
        row.label = name;
      }
      if (patch.url !== undefined) row.url = patch.url.trim();
      if (patch.enabled !== undefined) row.enabled = patch.enabled;
      persist(next);
      return { ok: true, row: { ...row } };
    },
    removeendpoint(id: string): McpAnswer<McpEndpoint> {
      const next = state();
      const row = next.endpoints.find((candidate) => candidate.id === id);
      if (!row) return { ok: false, reason: "No endpoint carries that id." };
      next.endpoints = next.endpoints.filter((candidate) => candidate.id !== id);
      persist(next);
      return { ok: true, row: { ...row } };
    },
    listproviders(): CustomProvider[] {
      return state().providers.map((row) => ({ ...row }));
    },
    addprovider({ label, baseUrl, keyref }: McpProviderInput): McpAnswer<CustomProvider> {
      const name = label.trim();
      const reference = keyref.trim();
      if (!name) return { ok: false, reason: "A provider needs a label before it can be stored." };
      if (!reference) return { ok: false, reason: "A provider needs the name of its credential — the secret itself never rides here." };
      if (!safeurl(baseUrl))
        return { ok: false, reason: "Only public http/https urls are accepted — localhost and private ranges stay closed." };
      const row: CustomProvider = {
        id: nextid("mcp.provider"),
        label: name,
        baseUrl: baseUrl.trim(),
        keyref: reference,
        enabled: false,
      };
      const next = state();
      next.providers.push(row);
      persist(next);
      return { ok: true, row: { ...row } };
    },
    updateprovider(id: string, patch: Partial<Omit<CustomProvider, "id">>): McpAnswer<CustomProvider> {
      if (patch.baseUrl !== undefined && !safeurl(patch.baseUrl))
        return { ok: false, reason: "Only public http/https urls are accepted — localhost and private ranges stay closed." };
      const next = state();
      const row = next.providers.find((candidate) => candidate.id === id);
      if (!row) return { ok: false, reason: "No provider carries that id." };
      if (patch.label !== undefined) {
        const name = patch.label.trim();
        if (!name) return { ok: false, reason: "A provider needs a label before it can be stored." };
        row.label = name;
      }
      if (patch.keyref !== undefined) {
        const reference = patch.keyref.trim();
        if (!reference) return { ok: false, reason: "A provider needs the name of its credential — the secret itself never rides here." };
        row.keyref = reference;
      }
      if (patch.baseUrl !== undefined) row.baseUrl = patch.baseUrl.trim();
      if (patch.enabled !== undefined) row.enabled = patch.enabled;
      persist(next);
      return { ok: true, row: { ...row } };
    },
    removeprovider(id: string): McpAnswer<CustomProvider> {
      const next = state();
      const row = next.providers.find((candidate) => candidate.id === id);
      if (!row) return { ok: false, reason: "No provider carries that id." };
      next.providers = next.providers.filter((candidate) => candidate.id !== id);
      persist(next);
      return { ok: true, row: { ...row } };
    },
  };
}
