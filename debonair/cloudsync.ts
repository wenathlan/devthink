// # cloudsync — the gateway persistence seam of the katexis engine (root
// layer): the desk's takes live in the session shelf (takestore), and this
// engine is the honest door to the gateway's sqlite through /api/projects.
// The seam is total: fetch and storage ride injected dependencies (the
// browser hands window.fetch and sessionStorageOrMemory; the tests hand
// doubles), every call answers a typed result, the timeout is the
// onboardingstate law (2.5 s — a slow gateway must never hang a page), and
// the fallback is always the local shelf — no silent data loss, ever.
// NON-GOALS: no accounts, no auth, no sync conflicts (the take id is the
// deterministic fnv-1a of seed+prompt — a re-save upserts, that is the whole
// reconciliation law), no binary audio (the cloud carries PLANS, the bounce
// is the desk's job).
// Pure and multi-mode — browser, node and the tests alike.

import type { TakePlan } from "./arranger.ts";

/** The typed cloud failure the surfaces render honestly. */
export class CloudSyncError extends Error {
  /** The machine-readable failure code. */
  readonly code: "offline" | "timeout" | "bad-payload" | "bad-response" | "refused";
  /** The http status the gateway answered (when it answered). */
  readonly status: number | null;
  constructor(
    code: "offline" | "timeout" | "bad-payload" | "bad-response" | "refused",
    message: string,
    status: number | null = null,
  ) {
    super(message);
    this.name = "CloudSyncError";
    this.code = code;
    this.status = status;
  }
}

/** The timeout law: a slow gateway never hangs a page (onboardingstate's own). */
export const CLOUDSYNC_TIMEOUT_MS = 2500;

/** The gateway endpoint the engine rides (relative — the same origin serves). */
export const CLOUDSYNC_ENDPOINT = "/api/projects";

/** One cloud-saved take as the gateway stores and answers it. */
export interface CloudTake {
  /** The deterministic take id (fnv-1a of seed+prompt — the upsert key). */
  id: string;
  /** The prompt the take answers to. */
  prompt: string;
  /** The seed the take rode. */
  seed: string;
  /** The genre label the plan resolved. */
  genre: string;
  /** The take tempo. */
  bpm: number;
  /** The take duration, whole seconds. */
  seconds: number;
  /** The plan JSON verbatim (the bounce rebuilds from it). */
  payload: string;
  /** The iso instant of the last save. */
  createdAt: string;
}

/** The typed result every cloud call answers (the DSP error law). */
export type CloudResult<T> = { ok: true; data: T } | { ok: false; error: CloudSyncError };

/** The seams one call rides (the tests inject doubles; the browser omits). */
export interface CloudDeps {
  /** The fetch implementation (defaults to globalThis.fetch). */
  fetchImpl?: typeof fetch;
  /** The clock in ms (the tests ride it; defaults to Date.now). */
  now?: () => number;
}

/**
 * The gateway fetch: relative endpoint, JSON in and out, the timeout law,
 * and every failure translated into the typed error the surfaces render.
 *
 * @param path the endpoint path (the engine's constant + the action).
 * @param init the request init (method, body).
 * @param deps the injected seams.
 * @returns the parsed json or the typed error.
 */
async function gatewayJson<T>(path: string, init: RequestInit, deps: CloudDeps = {}): Promise<CloudResult<T>> {
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function")
    return { ok: false, error: new CloudSyncError("offline", "no fetch on this host") };
  const startedAt = deps.now?.() ?? Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLOUDSYNC_TIMEOUT_MS);
  try {
    const response = await fetchImpl(path, { ...init, signal: controller.signal });
    const latency = (deps.now?.() ?? Date.now()) - startedAt;
    if (!response.ok) {
      const line = await response.text().catch(() => "");
      return {
        ok: false,
        error: new CloudSyncError("refused", line || `gateway answered ${response.status}`, response.status),
      };
    }
    const data = (await response.json()) as T;
    void latency;
    return { ok: true, data };
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    return {
      ok: false,
      error: aborted
        ? new CloudSyncError("timeout", `the gateway kept silent past ${CLOUDSYNC_TIMEOUT_MS} ms`)
        : new CloudSyncError("offline", error instanceof Error ? error.message : "the gateway is unreachable"),
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Validates the plan before any save leaves the host (the schema guard: a
 * refused plan never becomes a payload).
 *
 * @param plan the plan the desk wants to push.
 * @returns the problems found (an empty list is a sound payload).
 */
export function validateCloudPayload(plan: TakePlan): string[] {
  const problems: string[] = [];
  if (!plan || typeof plan.id !== "string" || plan.id.length === 0) problems.push("the plan carries no id");
  if (typeof plan.prompt !== "string" || plan.prompt.length === 0) problems.push("the plan carries no prompt");
  if (typeof plan.seed !== "string" || plan.seed.length === 0) problems.push("the plan carries no seed");
  if (!(Number.isFinite(plan.bpm) && plan.bpm > 0)) problems.push("the plan carries no tempo");
  if (!(Number.isFinite(plan.durationSeconds) && plan.durationSeconds > 0))
    problems.push("the plan carries no duration");
  if (!Array.isArray(plan.strips) || plan.strips.length === 0) problems.push("the plan carries no strips");
  if (!Array.isArray(plan.clips) || plan.clips.length === 0) problems.push("the plan carries no clips");
  return problems;
}

/** The wire shape the save posts (the gateway upserts on the id). */
export interface CloudSaveInput {
  id: string;
  prompt: string;
  seed: string;
  genre: string;
  bpm: number;
  seconds: number;
  payload: string;
}

/**
 * Saves (upserts) one take to the gateway.
 *
 * @param plan the plan to push (validated first — a refused plan never travels).
 * @param deps the injected seams.
 * @returns the saved row or the typed error.
 */
export async function saveCloudTake(plan: TakePlan, deps: CloudDeps = {}): Promise<CloudResult<CloudTake>> {
  const problems = validateCloudPayload(plan);
  if (problems.length > 0) return { ok: false, error: new CloudSyncError("bad-payload", problems.join("; ")) };
  const body: CloudSaveInput = {
    id: plan.id,
    prompt: plan.prompt,
    seed: plan.seed,
    genre: plan.genreLabel,
    bpm: Math.round(plan.bpm),
    seconds: Math.round(plan.durationSeconds),
    payload: JSON.stringify(plan),
  };
  return gatewayJson<CloudTake>(
    CLOUDSYNC_ENDPOINT,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) },
    deps,
  );
}

/**
 * Lists the cloud-saved takes (newest first — the gateway's own order).
 *
 * @param deps the injected seams.
 * @returns the rows or the typed error.
 */
export async function listCloudTakes(deps: CloudDeps = {}): Promise<CloudResult<readonly CloudTake[]>> {
  return gatewayJson<readonly CloudTake[]>(CLOUDSYNC_ENDPOINT, { method: "GET" }, deps);
}

/**
 * Removes one cloud take.
 *
 * @param id the take id.
 * @param deps the injected seams.
 * @returns the gateway's ack or the typed error.
 */
export async function removeCloudTake(id: string, deps: CloudDeps = {}): Promise<CloudResult<{ removed: number }>> {
  return gatewayJson<{ removed: number }>(
    `${CLOUDSYNC_ENDPOINT}?id=${encodeURIComponent(id)}`,
    { method: "DELETE" },
    deps,
  );
}

/**
 * Probes the gateway for the settings surface: a cheap GET with the timeout
 * law, answering reachability and the latency the visit rode.
 *
 * @param deps the injected seams.
 * @returns the latency in ms or the typed error.
 */
export async function probeGateway(deps: CloudDeps = {}): Promise<CloudResult<number>> {
  const startedAt = deps.now?.() ?? Date.now();
  const probe = await listCloudTakes(deps);
  if (probe.ok) return { ok: true, data: (deps.now?.() ?? Date.now()) - startedAt };
  return probe;
}
