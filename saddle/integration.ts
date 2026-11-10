/**
 * integration.ts — replaceable forge, application, MCP and transport adapters.
 *
 * This file is the v2.0.0 grand-merge consolidation of the former nested
 * folders of the repository (adapters) into the single
 * root-level domain file of the saddle family standard: one optimized
 * TypeScript file per correlated domain, ordinal sections, JSDoc on every
 * block, intra-domain imports dissolved, cross-domain imports rewritten to
 * ./<domain>.js. Every capability of every source file is preserved here;
 * the pure re-export barrels (none in this domain) folded their surface into this file directly.
 */
/** the house error carrier: every typed error of the engine folds carries the
 * plain Error surface beside the structured fields the callers read (the
 * code, the retryable flag, the details, the status code, the recovery hint
 * and the severity the responses and audits answer). */
type carriererror = Error & { code?: string; retryable?: boolean; details?: unknown; statuscode?: number; recovery?: string; severity?: string; name?: string; message?: string };


import { jsondecode, jsonencode } from "./communication.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: adapters/transport.ts — transport centralizes timeout retry and jitter without choosing a host or vendor. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * transport centralizes timeout retry and jitter without choosing a host or vendor.
 */
/** the request lane every transport answers: one callable that takes a url and an init bag and resolves a web response. */
type requestlane = (url: unknown, init?: Record<string, unknown>) => Promise<Response>;

export function transport(options: Record<string, unknown> = {}): { request: requestlane } {
  const fetcher = (options.fetcher ?? fetch) as (url: unknown, init?: Record<string, unknown>) => Promise<Response>;
  const attempts = Number(options.attempts ?? 3);
  const timeout = Number(options.timeout ?? 30000);
  const retrycodes = new Set((options.retrycodes ?? [408, 409, 429, 500, 502, 503, 504]) as number[]);
  async function request(url: unknown, init: Record<string, unknown> = {}) {
    let last;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetcher(url, { ...init, signal: init.signal ?? controller.signal });
        if (response.ok || !retrycodes.has(response.status) || attempt === attempts - 1) return response;
        last = new Error(`request failed with ${response.status}`);
      } catch (rawerror) {
    const error = rawerror as carriererror;
        last = error;
        if (attempt === attempts - 1) throw error;
      } finally { clearTimeout(timer); }
      await delay(backoff(options, attempt));
    }
    throw last ?? new Error("request failed");
  }
  return { request };
}

function backoff(options: Record<string, unknown>, attempt: number): number { const base = Number(options.backoff ?? 250); const jitter = Number(options.jitter ?? 0); return base * 2 ** attempt + Math.floor(Math.random() * jitter); }
function delay(milliseconds: number) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: adapters/socket.ts — socket adapter keeps realtime optional and accepts a caller supplied websocket constructor. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * socket adapter keeps realtime optional and accepts a caller supplied websocket constructor.
 */
export function socketadapter(options: Record<string, unknown> = {}): Record<string, unknown> {
  const websocket = (options.websocket ?? globalThis.WebSocket) as new (url: unknown, protocols?: unknown) => { send: (value: unknown) => void; close: (code?: unknown, reason?: unknown) => void };
  if (!websocket) throw new Error("websocket implementation is required");
  return {
    connect(url: unknown, protocols: unknown) {
      if (!url) throw new TypeError("socket url is required");
      const socket = new websocket(url, protocols);
      return { socket, send(value: unknown) { socket.send(typeof value === "string" ? value : JSON.stringify(value)); }, close(code: unknown, reason: unknown) { socket.close(code, reason); } };
    }
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: adapters/github.ts — github adapter uses caller supplied credentials and base url configuration. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * github adapter uses caller supplied credentials and base url configuration.
 */

export function githubadapter(options: Record<string, unknown> = {}): Record<string, unknown> {
  if (!options.baseurl || typeof options.token !== "function") throw new TypeError("github adapter requires baseurl and token function");
  const tokenfn = options.token as () => unknown;
  const client = transport({ fetcher: options.fetcher, attempts: options.attempts, timeout: options.timeout });
  async function call(path: unknown, init: Record<string, unknown> = {}) {
    const token = await tokenfn();
    const headers = { accept: "application/vnd.github+json", authorization: `Bearer ${token}`, "x-github-api-version": options.apiversion ?? "2022-11-28", ...(init.headers ?? {}) };
    return client.request(new URL(String(path), String(options.baseurl)), { ...init, headers });
  }
  return {
    async health() { const response = await call("/rate_limit"); return { ok: response.ok, status: response.status }; },
    async dispatch(owner: unknown, repository: unknown, workflow: unknown, input: Record<string, unknown> = {}) { const response = await call(`/repos/${owner}/${repository}/actions/workflows/${workflow}/dispatches`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ref: input.ref ?? "main", inputs: input.inputs ?? {} }) }); return { accepted: response.status === 204, status: response.status }; },
    async run(owner: unknown, repository: unknown, runid: unknown) { const response = await call(`/repos/${owner}/${repository}/actions/runs/${runid}`); return response.json(); }
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: adapters/gitlab.ts — gitlab adapter keeps project addressing and token ownership outside the package. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * gitlab adapter keeps project addressing and token ownership outside the package.
 */

export function gitlabadapter(options: Record<string, unknown> = {}): Record<string, unknown> {
  const project = encodeURIComponent(String(options.project ?? ""));
  const base = forgeadapter({ ...options, kind: "gitlab" }) as { dispatch: (spec: Record<string, unknown>) => Promise<Record<string, unknown>> };
  return { ...base, async dispatch(spec: Record<string, unknown>) { return base.dispatch({ ...spec, path: spec.path ?? `/api/v4/projects/${project}/pipeline` }); } };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: adapters/forge.ts — forge adapter defines the common dispatch and artifact surface for compatible forges. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * forge adapter defines the common dispatch and artifact surface for compatible forges.
 */

export function forgeadapter(options: Record<string, unknown> = {}): Record<string, unknown> {
  if (!options.baseurl || typeof options.token !== "function") throw new TypeError("forge adapter requires baseurl and token function");
  const tokenfn = options.token as () => unknown;
  const client = transport({ fetcher: options.fetcher, attempts: options.attempts, timeout: options.timeout });
  async function call(path: unknown, init: Record<string, unknown> = {}) { const token = await tokenfn(); return client.request(new URL(String(path), String(options.baseurl)), { ...init, headers: { authorization: `Bearer ${token}`, accept: "application/json", ...(init.headers ?? {}) } }); }
  return {
    kind: options.kind ?? "forge",
    async health(path: string = "/") { const response = await call(path); return { ok: response.ok, status: response.status }; },
    async dispatch(spec: Record<string, unknown>) { if (!spec?.path || !spec.ref) throw new TypeError("forge dispatch requires path and ref"); const response = await call(spec.path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ref: spec.ref, inputs: spec.inputs ?? {} }) }); return { accepted: response.ok, status: response.status, body: response.json ? await response.json() : undefined }; },
    async upload(spec: Record<string, unknown>) { if (!spec?.path || !spec.data) throw new TypeError("forge upload requires path and data"); const response = await call(spec.path, { method: "PUT", headers: { "content-type": spec.contenttype ?? "application/octet-stream" }, body: spec.data }); return { accepted: response.ok, status: response.status }; }
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 6: adapters/forgejo.ts — forgejo and gitea can reuse the open forge contract with a caller supplied base url. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * forgejo and gitea can reuse the open forge contract with a caller supplied base url.
 */

export function forgejoadapter(options: Record<string, unknown> = {}): Record<string, unknown> { return forgeadapter({ ...options, kind: "forgejo" }); }
export function giteaadapter(options: Record<string, unknown> = {}): Record<string, unknown> { return forgeadapter({ ...options, kind: "gitea" }); }
export function codebergadapter(options: Record<string, unknown> = {}): Record<string, unknown> { return forgeadapter({ ...options, kind: "codeberg" }); }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 7: adapters/huggingface.ts — hugging face storage remains an explicit adapter with caller supplied repository path. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * hugging face storage remains an explicit adapter with caller supplied repository path.
 */

export function huggingfaceadapter(options: Record<string, unknown> = {}): Record<string, unknown> { return forgeadapter({ ...options, kind: "huggingface" }); }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 8: adapters/apps.ts — app registry keeps installation, scope and revocation state outside platform credentials. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * app registry keeps installation, scope and revocation state outside platform credentials.
 */

export const appstatuses = Object.freeze(["installed", "suspended", "revoked"]);

/** the installation record the app registry keeps: identity, status, scopes and the timestamps of one caller-owned app. */
type apprecord = { id: string; name: string; status: string; scopes: string[]; installedat: number; updatedat: number; metadata: Record<string, unknown> };

/** Creates a caller-owned app installation registry with explicit scopes. */
export function appregistry(options: Record<string, unknown> = {}): Record<string, unknown> {
  const apps = options.apps as unknown[] | null | undefined;
  const values = new Map<unknown, apprecord>(apps ? apps.map((app): [unknown, apprecord] => [(app as Record<string, unknown>).id, normalize(app as Record<string, unknown>)]) : []);
  function install(input: Record<string, unknown> = {}): Record<string, unknown> { if (!input.id || !input.name) throw new TypeError("app installation requires id and name"); const app = normalize({ ...input, status: "installed", installedat: input.installedat ?? Date.now() }); values.set(app.id, app); return { ...app, scopes: [...app.scopes] }; }
  function suspend(id: unknown) { return transition(id, "suspended"); }
  function revoke(id: unknown) { return transition(id, "revoked"); }
  function restore(id: unknown) { return transition(id, "installed"); }
  function authorize(id: unknown, required: string[] = []) { const app = requireapp(id); if (app.status !== "installed") return { allowed: false, reason: `app-${app.status}` }; const missing = required.filter((scope) => !app.scopes.includes(scope)); return { allowed: missing.length === 0, missing, appid: app.id }; }
  function get(id: unknown) { const app = values.get(String(id)); return app ? { ...app, scopes: [...app.scopes] } : null; }
  function list(): Array<Record<string, unknown>> { return [...values.values()].map((app) => ({ ...app, scopes: [...app.scopes] })); }
  return { install, suspend, revoke, restore, authorize, get, list };
  function requireapp(id: unknown) { const app = values.get(String(id)); if (!app) throw new Error(`app not found: ${id}`); return app; }
  function transition(id: unknown, status: string) { const app = requireapp(id); if (!appstatuses.includes(status)) throw new TypeError(`unsupported app status: ${status}`); app.status = status; app.updatedat = Date.now(); return get(id); }
}

function normalize(input: Record<string, unknown>): apprecord { return { id: String(input.id), name: String(input.name), status: String(input.status ?? "installed"), scopes: [...new Set(((input.scopes ?? []) as unknown[]).map(String))], installedat: Number(input.installedat ?? Date.now()), updatedat: Number(input.updatedat ?? Date.now()), metadata: { ...((input.metadata ?? {}) as Record<string, unknown>) } }; }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 9: adapters/mcptransport.ts — mcp transport keeps JSON RPC framing separate from the tool server. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * mcp transport keeps JSON RPC framing separate from the tool server.
 */

/** Creates JSONL and HTTP handlers for the transport agnostic MCP server. */
export function mcptransport(server: unknown) {
  const source = server as { handle?: unknown } | null | undefined;
  if (typeof source?.handle !== "function") throw new TypeError("mcp transport requires server");
  const handle = source?.handle as (...args: unknown[]) => unknown;
  return {
    async handleline(line: unknown) { const request = jsondecode(line); return jsonencode(await handle(request)); },
    async *stream(lines: AsyncIterable<unknown> | Iterable<unknown>) { for await (const line of lines) if (String(line).trim()) yield await this.handleline(line); },
    async handlehttp(request: { text: () => Promise<string> }) { const body = await request.text(); const response = await handle(jsondecode(body)); return new Response(jsonencode(response), { status: 200, headers: { "content-type": "application/json" } }); }
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 10: adapters/mcpserver.ts — mcp server implements a small JSON RPC tool surface and remains transport agnostic. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * mcp server implements a small JSON RPC tool surface and remains transport agnostic.
 */

export function mcpserver(options: Record<string, unknown> = {}): Record<string, unknown> {
  const tools: Record<string, unknown> = {
    serialize: async (input: Record<string, unknown>) => jsonencode(input.value),
    ...(options.browser ? browsertools(options.browser) : {}),
    ...(options.tools ?? {})
  };
  function listtools(): Array<Record<string, unknown>> { return Object.keys(tools).map((name) => ({ name, description: `saddle ${name} tool` })); }
  return {
    listtools,
    async handle(request: { method?: unknown; id?: unknown; params?: { name?: unknown; arguments?: Record<string, unknown> } | null }) {
      if (request.method === "tools/list") return { jsonrpc: "2.0", id: request.id, result: { tools: listtools() } };
      if (request.method === "tools/call") { const handler = tools[String(request.params?.name ?? "")] as ((input: Record<string, unknown>) => unknown) | undefined; if (!handler) return { jsonrpc: "2.0", id: request.id, error: { code: -32601, message: "tool not found" } }; try { return { jsonrpc: "2.0", id: request.id, result: { content: [{ type: "text", text: JSON.stringify(await handler(request.params?.arguments ?? {})) }] } }; } catch (rawerror) {
    const error = rawerror as carriererror; return { jsonrpc: "2.0", id: request.id, error: { code: -32000, message: error.message } }; } }
      return { jsonrpc: "2.0", id: request.id, error: { code: -32601, message: "method not found" } };
    }
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 11: adapters/mcpbrowser.ts — browser MCP tools expose snapshots and actions only through an injected browser adapter. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * browser MCP tools expose snapshots and actions only through an injected browser adapter.
 */

/** Creates optional browser tools for an MCP server without selecting Playwright or another vendor. */
export function browsertools(browser: unknown) {
  const source = browser as { snapshot?: unknown; action?: unknown } | null | undefined;
  if (typeof source?.snapshot !== "function" || typeof source?.action !== "function") throw new TypeError("browser MCP tools require snapshot and action");
  const snapshot = source?.snapshot as (input: Record<string, unknown>) => unknown;
  const action = source?.action as (input: Record<string, unknown>) => unknown;
  return {
    browser_snapshot: async (input: Record<string, unknown> = {}) => snapshot(input),
    browser_action: async (input: Record<string, unknown> = {}) => action(input)
  };
}
