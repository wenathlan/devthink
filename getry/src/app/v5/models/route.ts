/**
 * v5/models/route.ts — SINGLE SOURCE OF TRUTH for V5 (openrouter)
 *
 * Dynamic free-model discovery — NO hardcoded model names.
 * The catalog is fetched live from https://openrouter.ai/api/v1/models and
 * filtered by the universal free rule (free prefix, -free / :free / /free
 * suffix). Only the base URL, the derivation rules and the math live here.
 *
 * Owns the universal DevThink context-window formula (identical to v4):
 *   usable_input = min(pool context) - min(pool maxoutput) - floor(2% overhead)
 * The meta-model may only claim a context box every rotation member serves.
 *
 * Exports: devthinkid, openrouterbase, isfreemodelid, v5freemodel, v5catalog,
 *          getv5catalog, devthinkcontextwindow, contextbudget,
 *          v5derivedefaults, provider
 */

import { NextRequest } from "next/server"
// ─── self-contained route headers (inlined — no utilities module) ───
/** cors headers — open cors for all gateway routes */
const corsheaders: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "get,post,put,patch,delete,head,options,connect,trace,propfind,proppatch,mkcol,copy,move,lock,unlock,search,purge,link,unlink,report,checkout,checkin,version-control,label,merge,baseline-control,mkactivity,mkworkspace,update,subscribe,unsubscribe,notify,poll,bind,rebind,unbind,reindex",
  "access-control-allow-headers": "content-type,authorization,x-token,x-chat-id,x-user-id,x-session-id,x-request-id,x-thinking-level,x-model,x-tools,accept",
  "access-control-max-age": "86400",
  "access-control-allow-expose-headers": "x-request-id,x-session-id",
}

/** handlecors — handle options preflight returns response or null */
function handlecors(req: Request): Response | null {
  if (req.method.toUpperCase() === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsheaders })
  }
  return null
}

/** jsonheaders — headers for json response */
function jsonheaders(): Record<string, string> {
  return { ...corsheaders, "content-type": "application/json" }
}

/** safejsonparse — json parse that never throws */
function safejsonparse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 2147483647

// ─── provider ───────────────────────────────────────────────────────
export const provider = "openrouter" as const

// ─── devthink meta ──────────────────────────────────────────────────
export const devthinkid = "devthink"

// ─── base (the only fixed provider fact — never model names) ────────
export const openrouterbase = "https://openrouter.ai/api/v1"

// ─── discovery cache ─────────────────────────────────────────────────
const CATALOG_TTL_MS = 5 * 60_000 // 5 minutes
const DISCOVERY_TIMEOUT_MS = 15_000
const DEFAULT_CONTEXT = 131072
const DEFAULT_MAXOUTPUT = 16384

/** v5freemodel — a free-tagged openrouter model discovered upstream */
export interface v5freemodel {
  id: string
  context: number
  maxoutput: number
  modalities: string
  vision: boolean
  nvidiarouted: boolean
  free: true
}

/** v5catalog — discovered snapshot */
export interface v5catalog {
  models: v5freemodel[]
  fetchedat: number
  stale: boolean
}

let lastknown: v5catalog | null = null
let inflight: Promise<v5catalog> | null = null

// ─── universal free filter ───────────────────────────────────────────
/**
 * isfreemodelid — the universal free-tag rule (same as v4):
 * prefix "free" or suffix "-free" / ":free" / "/free".
 * OpenRouter publishes free routes with the ":free" suffix.
 */
export function isfreemodelid(id: string): boolean {
  const l = id.toLowerCase()
  return l.startsWith("free") || l.endsWith("-free") || l.endsWith(":free") || l.endsWith("/free")
}

/** normalize an openrouter /models entry into a v5freemodel */
function normalizeopenrouter(entry: Record<string, unknown>): v5freemodel | null {
  const id = typeof entry.id === "string" ? entry.id : ""
  if (!id || !isfreemodelid(id)) return null
  const arch = (entry.architecture ?? {}) as Record<string, unknown>
  const inputs = Array.isArray(arch.input_modalities) ? (arch.input_modalities as string[]) : ["text"]
  const top = (entry.top_provider ?? {}) as Record<string, unknown>
  return {
    id,
    context: typeof entry.context_length === "number" ? entry.context_length : (typeof top.context_length === "number" ? top.context_length : DEFAULT_CONTEXT),
    maxoutput: typeof top.max_completion_tokens === "number" ? top.max_completion_tokens : DEFAULT_MAXOUTPUT,
    modalities: inputs.join("+") || "text",
    vision: inputs.some((m) => m === "image"),
    nvidiarouted: id.toLowerCase().startsWith("nvidia"),
    free: true,
  }
}

/** fetch the openrouter /models list and normalize it (never throws) */
async function fetchopenrouterfree(): Promise<v5freemodel[]> {
  try {
    const ac = new AbortController()
    const to = setTimeout(() => ac.abort(), DISCOVERY_TIMEOUT_MS)
    const res = await fetch(`${openrouterbase}/models`, {
      headers: { accept: "application/json" },
      signal: ac.signal,
      cache: "no-store",
    })
    clearTimeout(to)
    if (!res.ok) return []
    const parsed = safejsonparse<{ data?: unknown[] }>(await res.text())
    const data = Array.isArray(parsed?.data) ? parsed!.data! : []
    const out: v5freemodel[] = []
    for (const e of data) {
      if (e && typeof e === "object") {
        const m = normalizeopenrouter(e as Record<string, unknown>)
        if (m) out.push(m)
      }
    }
    return out
  } catch {
    return []
  }
}

/**
 * getv5catalog — dynamic free-model discovery with a 5-minute TTL cache.
 * On upstream failure the last-known-good snapshot is served (stale=true);
 * the catalog is NEVER seeded from a hardcoded model list.
 */
export async function getv5catalog(): Promise<v5catalog> {
  if (lastknown && Date.now() - lastknown.fetchedat < CATALOG_TTL_MS) return lastknown
  if (inflight) return inflight
  inflight = (async () => {
    const models = await fetchopenrouterfree()
    const failed = models.length === 0 && (lastknown?.models.length ?? 0) > 0
    const cat: v5catalog = {
      models: models.length ? models : (failed ? lastknown!.models : models),
      fetchedat: Date.now(),
      stale: failed,
    }
    if (cat.models.length) lastknown = cat
    return cat
  })()
  const result = await inflight
  inflight = null
  return result
}

// warm the cache at module load so first requests are fast
void getv5catalog().catch(() => {})

// ─── universal devthink context-window math (v4 + v5) ───────────────
/**
 * devthinkcontextwindow — the universal context-box formula.
 *
 *   context        = min(pool.context)          — rotation bottleneck
 *   reservedoutput = min(pool.maxoutput)        — worst-case output reservation
 *   overhead       = floor(context * 2%)        — framing + system prompt reserve
 *   usableinput    = context - reservedoutput - overhead
 *
 * usableinput is the token budget the context unifier may spend on
 * message history before sending upstream / persisting to the DB.
 */
export interface contextbudget {
  context: number
  reservedoutput: number
  overhead: number
  usableinput: number
  formula: string
}

export function devthinkcontextwindow(pool: { context: number; maxoutput: number }[]): contextbudget {
  const context = pool.length ? Math.min(...pool.map((m) => m.context)) : DEFAULT_CONTEXT
  const reservedoutput = pool.length ? Math.min(...pool.map((m) => m.maxoutput)) : DEFAULT_MAXOUTPUT
  const overhead = Math.floor(context * 0.02)
  const usableinput = Math.max(0, context - reservedoutput - overhead)
  return {
    context,
    reservedoutput,
    overhead,
    usableinput,
    formula: "usable_input = min(pool.context) - min(pool.maxoutput) - floor(2% * min(pool.context))",
  }
}

// ─── derived defaults (capacity rules — never hardcoded names) ──────
/**
 * v5derivedefaults — primary = the largest-context discovered free model
 * (ties broken by discovery order), fallback = the next distinct model.
 */
export function v5derivedefaults(cat: v5catalog): { primary: string; fallback: string } {
  const sorted = [...cat.models].sort((a, b) => b.context - a.context)
  const primary = sorted[0]?.id ?? ""
  const fallback = sorted.find((m) => m.id !== primary)?.id ?? primary
  return { primary, fallback }
}

// ─── handler ─────────────────────────────────────────────────────────
async function handlemodels(req: NextRequest): Promise<Response> {
  const cors = handlecors(req)
  if (cors) return cors

  const cat = await getv5catalog()
  const budget = devthinkcontextwindow(cat.models)
  const defaults = v5derivedefaults(cat)
  const nvidiaroutedcount = cat.models.filter((m) => m.nvidiarouted).length

  const models = [
    {
      id: devthinkid,
      object: "model",
      created: 1700000000,
      owned_by: "devthink",
      free: true,
      meta: true,
      context: budget.context,
      maxoutput: budget.reservedoutput,
      usable_input: budget.usableinput,
      context_formula: budget.formula,
      rotation: "every 6 messages per session or on errors 404 429 500 502 503 529",
      rotationpool: cat.models.map((m) => m.id),
      rotationpoolsize: cat.models.length,
      providers: ["openrouter"],
      defaults: { primary: defaults.primary, fallback: defaults.fallback },
    },
    ...cat.models.map((m) => ({
      id: m.id,
      object: "model",
      created: 1700000000,
      owned_by: "openrouter",
      free: true,
      context: m.context,
      maxoutput: m.maxoutput,
      modalities: m.modalities,
      vision: m.vision,
      provider: "openrouter",
      base: openrouterbase,
      endpoint: "/chat/completions",
      nvidiarouted: m.nvidiarouted,
      piiwarn: m.nvidiarouted
        ? "nvidia routed logs prompts do not send pii or confidential data"
        : undefined,
    })),
  ]

  return Response.json(
    {
      object: "list",
      data: models,
      provider: provider,
      auth: "bearer key required free signup at https://openrouter.ai",
      authHeader: "authorization bearer <openrouter api key>",
      envVar: "OPENROUTER_API_KEY",
      extraHeaders: {
        "HTTP-Referer": "https://devthink.ai",
        "X-Title": "DevThink Gateway",
      },
      discovery: {
        mode: "dynamic",
        rule: "free prefix or -free / :free / /free suffix",
        fetchedat: new Date(cat.fetchedat).toISOString(),
        stale: cat.stale,
        ttlseconds: CATALOG_TTL_MS / 1000,
      },
      devthinkcontext: budget,
      totalfreemodels: cat.models.length,
      nvidiaroutedcount,
      nvidiaroutedwarning: `${nvidiaroutedcount} nvidia routed free models log prompts for nvidia product improvement — do not send pii confidential or sensitive data to these models`,
      defaults: { primary: defaults.primary, fallback: defaults.fallback },
      base: openrouterbase,
      endpoints: ["/v5/models", "/v5/chat/completions", "/v5/completions", "/v5/messages", "/v5/responses", "/v5/embeddings", "/v5/keys"],
    },
    { headers: jsonheaders() },
  )
}

export async function GET(req: NextRequest): Promise<Response> { return handlemodels(req) }
export async function POST(req: NextRequest): Promise<Response> { return handlemodels(req) }
export async function OPTIONS(req: NextRequest): Promise<Response> { return handlemodels(req) }
