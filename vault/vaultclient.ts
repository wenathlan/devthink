// # vaultclient — the engine door of the vault face: the one client the
// wingets ride to talk the vault's own /api/v1 surface. Until this module
// the product face lived entirely on the rehearsal shelf (the deterministic
// seed rows the offline build answers) — the engine (the http api over the
// sealed ledger) ran real but nothing in the face ever called it. The
// client owns the wire: every route the api serves (the health probe, the
// usage census, the object deposit and list, the verified read and the
// soft delete, the quota verdicts and the orphan sweep), each answer a
// typed branch — never a throw, never a silent fallback to invented
// numbers. The honest rehearsal law rides the lane door: when the engine
// is away (no configured origin, the host refusing the house https law,
// the fetch seam absent, the timeout past) the call answers the away lane
// and the winget keeps rendering the declared rehearsal — the swap is
// loud, the seed never pretends to be live.
//
// The wire law mirrors the family precedent the audio app's blob lane
// carries (the typed error translation, the token headers, the abort
// window, the https discipline) so the two clients answer the same
// contract the registry embedder sees.
//
// @section 1  origin — the configured engine origin under the https law
// @section 2  client — the typed calls of the /api/v1 surface

import { useEffect, useState } from "react";
import { hostallowed } from "./onboardingstate.ts";

/* ------------------------------------------------------------------ */
/* @section 1 — origin: the engine origin under the https law          */
/* ------------------------------------------------------------------ */

/** the token header the api's token gate reads first. */
const TOKEN_HEADER = "x-vault-token";
/** the abort window every lane call rides (ms — the uistore loader's own
 * discipline, one budget for the whole face). */
const LANE_TIMEOUT_MS = 4000;

/** reads the configured engine origin: VITE_VAULT_URL answers the deployed
 * api (the https public-host discipline the platform lanes ride). */
function readEnvOrigin(): string {
  const env = (import.meta as ImportMeta & { env?: { VITE_VAULT_URL?: string } }).env;
  return (typeof env?.VITE_VAULT_URL === "string" ? env.VITE_VAULT_URL : "").trim().replace(/\/+$/, "");
}

const ORIGIN = readEnvOrigin();

/** reads the operator token the storage truth demands (the gate accepts
 * the bearer or the token header; the browser lane rides the header). */
function readEnvToken(): string {
  const env = (import.meta as ImportMeta & { env?: { VITE_VAULT_TOKEN?: string } }).env;
  return typeof env?.VITE_VAULT_TOKEN === "string" ? env.VITE_VAULT_TOKEN.trim() : "";
}

const TOKEN = readEnvToken();

/**
 * The configured engine origin under the house https law: the trimmed
 * VITE_VAULT_URL when the host passes the public-https discipline, the
 * empty string otherwise (the away lane).
 *
 * @returns the engine base url, or "" when none answers.
 */
export function vaultorigin(): string {
  return ORIGIN !== "" && hostallowed(ORIGIN) ? ORIGIN : "";
}

/**
 * Whether the engine token rides the lane (the storage truth demands it —
 * the console renders the gate state the health probe answers).
 *
 * @returns true when the operator pinned the token.
 */
export function vaulttokenconfigured(): boolean {
  return TOKEN.length > 0;
}

/** reads the project the operator pinned (the console lane queries the
 * usage of this project — the empty string answers the away lane). */
function readEnvProject(): string {
  const env = (import.meta as ImportMeta & { env?: { VITE_VAULT_PROJECT?: string } }).env;
  return typeof env?.VITE_VAULT_PROJECT === "string" ? env.VITE_VAULT_PROJECT.trim() : "";
}

const PROJECT = readEnvProject();

/**
 * The configured project the console lane queries: the trimmed
 * VITE_VAULT_PROJECT when the engine origin answers, the empty string
 * otherwise (the away lane — the console keeps the rehearsal).
 *
 * @returns the project id, or "" when none answers.
 */
export function vaultproject(): string {
  return ORIGIN !== "" && PROJECT !== "" ? PROJECT : "";
}

/* ------------------------------------------------------------------ */
/* @section 2 — client: the typed calls of the /api/v1 surface         */
/* ------------------------------------------------------------------ */

/** the health answer the probe serves (the open lane — no token). */
export interface HealthAnswer {
  ok: true;
  service: string;
  driver: string;
  authRequired: boolean;
  authConfigured: boolean;
}

/** the usage census the console renders (the project usage beside the
 * engine census — every number the real ledger answered). */
export interface UsageAnswer {
  ok: true;
  project: string;
  bytes: bigint;
  objects: number;
  chunks: number;
  chunkBytes: bigint;
  liveObjects: number;
  liveBytes: bigint;
}

/** one object row the list lane answers. */
export interface ObjectRow {
  id: string;
  projectId: string;
  path: string;
  mime: string;
  size: bigint;
  digest: string;
  channel: string;
  createdAt: string;
}

/** the quota verdict the plans lane reads (the usage, the user-defined
 * limit and the verdict state the engine answered). */
export interface QuotaAnswer {
  ok: true;
  project: string;
  usage: bigint;
  objects: number;
  limitBytes: bigint | null;
  state: string;
  remaining: bigint | null;
  updatedAt: string;
}

/** the sweep report the retention lane reads. */
export interface SweepAnswer {
  ok: true;
  chunks: number;
  bytes: bigint;
  tombstones: number;
}

/** the typed refusal every lane answers on a non-2xx wire. */
export interface LaneRefusal {
  ok: false;
  code: string;
  message: string;
  status: number | null;
}

/** the away lane: the engine is not configured or not reachable — the
 * winget keeps the declared rehearsal answering (never invented numbers). */
export interface LaneAway {
  ok: false;
  code: "VAULT_AWAY";
  message: string;
  status: null;
}

/** the fetch seam the client rides (injectable for the battery). */
export type FetchSeam = typeof globalThis.fetch;

/** the client options the battery injects (the origin override the
 * battery rides beside the seam, the window and the token). */
export interface VaultClientOptions {
  origin?: string;
  fetchImpl?: FetchSeam;
  timeoutMs?: number;
  token?: string;
}

/** parses the standardized error body the api refuses with. */
async function refusalBody(response: Response): Promise<{ code: string; message: string }> {
  try {
    const parsed: unknown = await response.json();
    if (typeof parsed === "object" && parsed !== null) {
      const error = (parsed as Record<string, unknown>).error;
      if (typeof error === "object" && error !== null) {
        const record = error as Record<string, unknown>;
        return {
          code: typeof record.code === "string" ? record.code : "VAULT_FAULT",
          message: typeof record.message === "string" ? record.message : "the vault refused the call",
        };
      }
    }
  } catch {
    /* a body that fails the parse keeps the status lane */
  }
  return { code: "VAULT_FAULT", message: `the vault answered ${response.status}` };
}

/** the away lane constructor (the one honest shape every unreachable
 * engine answers). */
function away(message: string): LaneAway {
  return { ok: false, code: "VAULT_AWAY", message, status: null };
}

/**
 * vaultclient — the engine door: the typed calls of the vault's own api
 * surface, one instance per face (the origin and the token resolve once
 * at module load; the battery injects its own seams).
 *
 * @param options the fetch seam, the abort window and the token the
 * battery injects (the module defaults answer otherwise).
 * @returns the client whose methods each answer a typed branch.
 */
export function vaultclient(options: VaultClientOptions = {}): {
  health(): Promise<HealthAnswer | LaneRefusal | LaneAway>;
  usage(project: string): Promise<UsageAnswer | LaneRefusal | LaneAway>;
  listObjects(project: string): Promise<{ ok: true; rows: ObjectRow[] } | LaneRefusal | LaneAway>;
  getQuota(project: string): Promise<QuotaAnswer | LaneRefusal | LaneAway>;
  setQuota(
    project: string,
    limitBytes: bigint | null,
  ): Promise<{ ok: true; project: string; limitBytes: bigint | null; updatedAt: string } | LaneRefusal | LaneAway>;
  sweep(): Promise<SweepAnswer | LaneRefusal | LaneAway>;
} {
  const origin = (options.origin ?? vaultorigin()).trim().replace(/\/+$/, "");
  const fetchImpl = options.fetchImpl ?? (typeof fetch === "function" ? globalThis.fetch : undefined);
  const token = options.token ?? TOKEN;
  const timeoutMs = options.timeoutMs ?? LANE_TIMEOUT_MS;

  /** One lane call: the https law, the abort window, the typed translation. */
  async function call(
    method: string,
    path: string,
    init: { headers?: Record<string, string>; body?: Uint8Array<ArrayBuffer> } = {},
  ): Promise<{ ok: true; response: Response } | LaneRefusal | LaneAway> {
    if (origin === "" || !hostallowed(origin)) {
      return away("the vault engine origin is not configured under the house https law");
    }
    if (typeof fetchImpl !== "function") {
      return away("no fetch seam on this host");
    }
    const headers: Record<string, string> = { ...init.headers };
    if (token.length > 0) headers[TOKEN_HEADER] = token;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(`${origin}${path}`, {
        method,
        headers,
        body: init.body,
        signal: controller.signal,
      });
      return { ok: true, response };
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === "AbortError";
      return {
        ok: false,
        code: aborted ? "VAULT_TIMEOUT" : "VAULT_AWAY",
        message: aborted
          ? `the vault kept silent past ${timeoutMs} ms`
          : `the vault is unreachable: ${error instanceof Error ? error.message : "the lane refused"}`,
        status: null,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  /** The typed refusal of a non-2xx answer (the standardized vault shape). */
  async function refused(response: Response): Promise<LaneRefusal> {
    const body = await refusalBody(response);
    return { ok: false, code: body.code, message: body.message, status: response.status };
  }

  return {
    async health() {
      const answer = await call("GET", "/api/health");
      if (!answer.ok) return answer;
      const { response } = answer;
      if (!response.ok) return refused(response);
      try {
        const parsed: unknown = await response.json();
        if (typeof parsed === "object" && parsed !== null) {
          const row = parsed as Record<string, unknown>;
          const auth = (typeof row.auth === "object" && row.auth !== null ? row.auth : {}) as Record<string, unknown>;
          return {
            ok: true,
            service: typeof row.service === "string" ? row.service : "",
            driver:
              typeof (row.storage as Record<string, unknown> | undefined)?.driver === "string"
                ? (row.storage as Record<string, string>).driver
                : "",
            authRequired: auth.required === true,
            authConfigured: auth.configured === true,
          };
        }
      } catch {
        /* the parse fall lands in the refusal lane */
      }
      return refused(response);
    },

    async usage(project) {
      const answer = await call("GET", `/api/v1/storage/usage?project=${encodeURIComponent(project)}`);
      if (!answer.ok) return answer;
      const { response } = answer;
      if (!response.ok) return refused(response);
      try {
        const parsed: unknown = await response.json();
        if (typeof parsed === "object" && parsed !== null) {
          const row = parsed as Record<string, unknown>;
          const bytes = typeof row.bytes === "string" ? BigInt(row.bytes) : null;
          const chunkBytes = typeof row.chunkBytes === "string" ? BigInt(row.chunkBytes) : null;
          const liveBytes = typeof row.liveBytes === "string" ? BigInt(row.liveBytes) : null;
          if (bytes !== null && chunkBytes !== null && liveBytes !== null) {
            return {
              ok: true,
              project: typeof row.project === "string" ? row.project : project,
              bytes,
              objects: typeof row.objects === "number" ? row.objects : 0,
              chunks: typeof row.chunks === "number" ? row.chunks : 0,
              chunkBytes,
              liveObjects: typeof row.liveObjects === "number" ? row.liveObjects : 0,
              liveBytes,
            };
          }
        }
      } catch {
        /* the parse fall lands in the refusal lane */
      }
      return refused(response);
    },

    async listObjects(project) {
      const answer = await call("GET", `/api/v1/storage/objects?project=${encodeURIComponent(project)}`);
      if (!answer.ok) return answer;
      const { response } = answer;
      if (!response.ok) return refused(response);
      try {
        const parsed: unknown = await response.json();
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          Array.isArray((parsed as Record<string, unknown>).objects)
        ) {
          const rows: ObjectRow[] = [];
          for (const standing of (parsed as Record<string, unknown>).objects as unknown[]) {
            if (typeof standing !== "object" || standing === null) continue;
            const row = standing as Record<string, unknown>;
            if (typeof row.id !== "string" || typeof row.size !== "string") continue;
            rows.push({
              id: row.id,
              projectId: typeof row.projectId === "string" ? row.projectId : "",
              path: typeof row.path === "string" ? row.path : "",
              mime: typeof row.mime === "string" ? row.mime : "",
              size: BigInt(row.size),
              digest: typeof row.digest === "string" ? row.digest : "",
              channel: typeof row.channel === "string" ? row.channel : "blob",
              createdAt: typeof row.createdAt === "string" ? row.createdAt : "",
            });
          }
          return { ok: true, rows };
        }
      } catch {
        /* the parse fall lands in the refusal lane */
      }
      return refused(response);
    },

    async getQuota(project) {
      const answer = await call("GET", `/api/v1/storage/quota?project=${encodeURIComponent(project)}`);
      if (!answer.ok) return answer;
      const { response } = answer;
      if (!response.ok) return refused(response);
      try {
        const parsed: unknown = await response.json();
        if (typeof parsed === "object" && parsed !== null) {
          const row = parsed as Record<string, unknown>;
          const usage = typeof row.usage === "string" ? BigInt(row.usage) : null;
          const limit = typeof row.limit === "string" ? BigInt(row.limit) : null;
          const remaining = typeof row.remaining === "string" ? BigInt(row.remaining) : null;
          if (usage !== null) {
            return {
              ok: true,
              project: typeof row.project === "string" ? row.project : project,
              usage,
              objects: typeof row.objects === "number" ? row.objects : 0,
              limitBytes: limit,
              state: typeof row.state === "string" ? row.state : "",
              remaining,
              updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : "",
            };
          }
        }
      } catch {
        /* the parse fall lands in the refusal lane */
      }
      return refused(response);
    },

    async setQuota(project, limitBytes) {
      const body = JSON.stringify({ limitBytes: limitBytes === null ? null : limitBytes.toString() });
      const answer = await call("POST", `/api/v1/storage/quota?project=${encodeURIComponent(project)}`, {
        headers: { "content-type": "application/json" },
        body: new TextEncoder().encode(body) as Uint8Array<ArrayBuffer>,
      });
      if (!answer.ok) return answer;
      const { response } = answer;
      if (!response.ok) return refused(response);
      try {
        const parsed: unknown = await response.json();
        if (typeof parsed === "object" && parsed !== null) {
          const row = parsed as Record<string, unknown>;
          const limit = typeof row.limit === "string" ? BigInt(row.limit) : null;
          return {
            ok: true,
            project: typeof row.project === "string" ? row.project : project,
            limitBytes: limit,
            updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : "",
          };
        }
      } catch {
        /* the parse fall lands in the refusal lane */
      }
      return refused(response);
    },

    async sweep() {
      const answer = await call("POST", "/api/v1/storage/sweep");
      if (!answer.ok) return answer;
      const { response } = answer;
      if (!response.ok) return refused(response);
      try {
        const parsed: unknown = await response.json();
        if (typeof parsed === "object" && parsed !== null) {
          const row = parsed as Record<string, unknown>;
          const bytes = typeof row.bytes === "string" ? BigInt(row.bytes) : null;
          if (bytes !== null) {
            return {
              ok: true,
              chunks: typeof row.chunks === "number" ? row.chunks : 0,
              bytes,
              tombstones: typeof row.tombstones === "number" ? row.tombstones : 0,
            };
          }
        }
      } catch {
        /* the parse fall lands in the refusal lane */
      }
      return refused(response);
    },
  };
}

/**
 * useVaultUsage — the mount hook of the console lane: it loads the usage
 * census of the pinned project once per mount when the engine lane
 * answers, and answers the lane state so the winget renders the live
 * numbers beside the declared rehearsal (the away lane keeps the seed —
 * never a blank, never an invented figure).
 *
 * @returns the live usage when the lane answered (null otherwise) and the
 * lane key the render declares.
 */
export function useVaultUsage(): { live: UsageAnswer | null; lane: "live" | "away" } {
  const [state, setState] = useState<{ live: UsageAnswer | null; lane: "live" | "away" }>({
    live: null,
    lane: "away",
  });
  useEffect(() => {
    let alive = true;
    const project = vaultproject();
    if (project === "") return;
    const client = vaultclient();
    void client.usage(project).then((answer) => {
      if (!alive) return;
      if (answer.ok) setState({ live: answer, lane: "live" });
    });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
