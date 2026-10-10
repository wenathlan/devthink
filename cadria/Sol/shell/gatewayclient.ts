/**
 * gatewayclient.ts — the ONE gateway client of the theme (session scope),
 * shared by the studio, the gallery, the player and the settings page.
 * every request rides an AbortController timeout (800 ms default) and fails
 * into GatewayClientError — status 0 marks offline/abort, else the http
 * answer. the base url lives in module memory only: reload resets it, nothing
 * persists, the interface never writes to the visitor machine.
 */

/** one row of GET /api/projects (the gateway's generation metadata). */
export type GatewayProject = {
  id: string;
  seed: string;
  style: string;
  bpm: number;
  keyTonic: number;
  keyMode: string;
  key: string;
  durationMs: number;
  createdAt: string;
};

/** the client error: status 0 = unreachable/aborted, else the http status. */
export class GatewayClientError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "GatewayClientError";
  }
}

const DEFAULT_URL = "http://localhost:8787",
  DEFAULT_TIMEOUT_MS = 800;
let base = DEFAULT_URL;

/** the session gateway base url (no persistence — reload resets it). */
export function gatewayUrl(): string {
  return base;
}

/** sets the session base url (trimmed, trailing slashes stripped); empty resets the default. */
export function setGatewayUrl(url: string): string {
  const next = url.trim().replace(/\/+$/, "");
  base = next.length > 0 ? next : DEFAULT_URL;
  return base;
}

/** one timed fetch against the session base — the single AbortController seam. */
async function timedFetch(path: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${base}${path}`, { ...init, signal: controller.signal });
  } catch {
    throw new GatewayClientError(0, `gateway unreachable at ${base}${path}`);
  } finally {
    window.clearTimeout(timer);
  }
}

/** one gateway request: honest errors, typed json out. */
export async function gatewayRequest<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const response = await timedFetch(
    path,
    { ...init, headers: { accept: "application/json", ...init.headers } },
    timeoutMs,
  );
  if (!response.ok) throw new GatewayClientError(response.status, `gateway answered ${response.status} for ${path}`);
  return (await response.json()) as T;
}

/** health: true only when /api/health answers { ok: true } inside the window. */
export async function gatewayHealth(timeoutMs = DEFAULT_TIMEOUT_MS): Promise<boolean> {
  try {
    return (await gatewayRequest<{ ok: boolean }>("/api/health", {}, timeoutMs)).ok === true;
  } catch {
    return false;
  }
}

/** the generations: GET /api/projects?limit= (the gateway clamps 1-200). */
export async function listGatewayProjects(
  limit = 8,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<readonly GatewayProject[]> {
  const answer = await gatewayRequest<{ projects: GatewayProject[] }>(
    `/api/projects?limit=${Math.max(1, Math.floor(limit))}`,
    {},
    timeoutMs,
  );
  return Array.isArray(answer.projects) ? answer.projects : [];
}

/** the stored project's rendered frame: GET /api/render/:id as svg text. */
export async function fetchGatewayRender(id: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string> {
  const response = await timedFetch(
    `/api/render/${encodeURIComponent(id)}`,
    { headers: { accept: "image/svg+xml" } },
    timeoutMs,
  );
  if (!response.ok)
    throw new GatewayClientError(response.status, `gateway answered ${response.status} for render ${id}`);
  return response.text();
}

/** deletes one generation: DELETE /api/projects/:id — resolves or throws the honest error. */
export async function deleteGatewayProject(id: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<void> {
  await gatewayRequest(`/api/projects/${encodeURIComponent(id)}`, { method: "DELETE" }, timeoutMs);
}
