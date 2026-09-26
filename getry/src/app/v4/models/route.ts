/**
 * v4/models/route.ts — SINGLE SOURCE OF TRUTH for V4 (opencode zen + kilo)
 *
 * Dynamic free-model discovery — NO hardcoded model names.
 * The catalog is fetched live from the upstream provider /models endpoints
 * and filtered by the universal free rule (free prefix, -free / :free / /free
 * suffix, or the provider's own isFree flag). Only provider bases, defaults
 * derivation rules and the math live here.
 *
 * Also owns the universal DevThink context-window formula (v4 + v5):
 *   usable_input = min(pool context) - min(pool maxoutput) - floor(2% overhead)
 * The meta-model may only claim a context box that every rotation member
 * can actually serve — the sum-of-contexts claim was mathematically wrong.
 *
 * Exports: devthinkid, opencodezenbase, kilobase, isfreemodelid,
 *          v4freemodel, v4catalog, getv4catalog, devthinkcontextwindow,
 *          contextbudget, v4derivedefaults, provider
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
export const provider = "opencode-zen+kilo" as const

// ─── devthink meta ──────────────────────────────────────────────────
export const devthinkid = "devthink"

// ─── bases (the only fixed provider facts — never model names) ──────
export const opencodezenbase = "https://opencode.ai/zen/v1"
export const kilobase = "https://api.kilo.ai/api/gateway"

// ─── discovery cache ─────────────────────────────────────────────────
const CATALOG_TTL_MS = 5 * 60_000 // 5 minutes
const DISCOVERY_TIMEOUT_MS = 15_000

/** v4freemodel — a free-tagged model discovered upstream */
export interface v4freemodel {
  id: string
  provider: "opencode" | "kilo"
  context: number
  maxoutput: number
  modalities: string
  vision: boolean
  nvidiarouted: boolean
  free: true
}

/** v4catalog — discovered snapshot from both providers */
export interface v4catalog {
  opencode: v4freemodel[]
  kilo: v4freemodel[]
  fetchedat: number
  /** true when at least one upstream failed and stale data was served */
  stale: boolean
}

// last-known-good cache — survives upstream failures, never a hardcoded list
let lastknown: v4catalog | null = null
let inflight: Promise<v4catalog> | null = null

// ─── universal free filter ───────────────────────────────────────────
/**
 * isfreemodelid — the universal free-tag rule.
 * A model is free when its id carries the free tag:
 *   - prefix  "free"          (free/...)
 *   - suffix  "-free"         (opencode zen convention)
 *   - suffix  ":free"         (kilo / openrouter convention)
 *   - suffix  "/free"         (provider free routers, e.g. kilo-auto/free)
 * Providers that publish an explicit isFree flag (kilo) are additionally
 * trusted via that flag by the normalizer below.
 */
export function isfreemodelid(id: string): boolean {
  const l = id.toLowerCase()
  return l.startsWith("free") || l.endsWith("-free") || l.endsWith(":free") || l.endsWith("/free")
}

/** default context/maxoutput when the upstream list omits them */
const DEFAULT_CONTEXT = 131072
const DEFAULT_MAXOUTPUT = 16384

/** normalize an opencode zen /models entry into a v4freemodel */
function normalizeopencode(entry: Record<string, unknown>): v4freemodel | null {
  const id = typeof entry.id === "string" ? entry.id : ""
  if (!id || !isfreemodelid(id)) return null
  return {
    id,
    provider: "opencode",
    context: typeof entry.context === "number" ? entry.context : DEFAULT_CONTEXT,
    maxoutput: typeof entry.maxoutput === "number" ? entry.maxoutput : DEFAULT_MAXOUTPUT,
    modalities: "text",
    vision: false,
    nvidiarouted: id.toLowerCase().startsWith("nvidia"),
    free: true,
  }
}

/** normalize a kilo /models entry into a v4freemodel */
function normalizekilo(entry: Record<string, unknown>): v4freemodel | null {
  const id = typeof entry.id === "string" ? entry.id : ""
  if (!id) return null
  // universal tag rule OR the provider's own free flag
  const flaggedfree = entry.isFree === true
  if (!isfreemodelid(id) && !flaggedfree) return null
  const arch = (entry.architecture ?? {}) as Record<string, unknown>
  const inputs = Array.isArray(arch.input_modalities) ? (arch.input_modalities as string[]) : ["text"]
  const top = (entry.top_provider ?? {}) as Record<string, unknown>
  return {
    id,
    provider: "kilo",
    context: typeof entry.context_length === "number" ? entry.context_length : DEFAULT_CONTEXT,
    maxoutput: typeof top.max_completion_tokens === "number" ? top.max_completion_tokens : DEFAULT_MAXOUTPUT,
    modalities: inputs.join("+") || "text",
    vision: inputs.some((m) => m === "image"),
    nvidiarouted: id.toLowerCase().startsWith("nvidia"),
    free: true,
  }
}

/** fetch one upstream /models list and normalize it (never throws) */
async function fetchupstream(url: string, normalize: (e: Record<string, unknown>) => v4freemodel | null): Promise<v4freemodel[]> {
  try {
    const ac = new AbortController()
    const to = setTimeout(() => ac.abort(), DISCOVERY_TIMEOUT_MS)
    const res = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36" },
      signal: ac.signal,
      cache: "no-store",
    })
    clearTimeout(to)
    if (!res.ok) return []
    const parsed = safejsonparse<{ data?: unknown[] }>(await res.text())
    const data = Array.isArray(parsed?.data) ? parsed!.data! : []
    const out: v4freemodel[] = []
    for (const e of data) {
      if (e && typeof e === "object") {
        const m = normalize(e as Record<string, unknown>)
        if (m) out.push(m)
      }
    }
    return out
  } catch {
    return []
  }
}

/**
 * getv4catalog — dynamic free-model discovery with a 5-minute TTL cache.
 * On upstream failure the last-known-good snapshot is served (stale=true);
 * the catalog is NEVER seeded from a hardcoded model list.
 */
export async function getv4catalog(): Promise<v4catalog> {
  if (lastknown && Date.now() - lastknown.fetchedat < CATALOG_TTL_MS) return lastknown
  if (inflight) return inflight
  inflight = (async () => {
    const [oc, kl] = await Promise.all([
      fetchupstream(`${opencodezenbase}/models`, normalizeopencode),
      fetchupstream(`${kilobase}/models`, normalizekilo),
    ])
    const ocfailed = oc.length === 0 && (lastknown?.opencode.length ?? 0) > 0
    const klfailed = kl.length === 0 && (lastknown?.kilo.length ?? 0) > 0
    // keep stale data for a provider that failed this round
    const occat = oc.length ? oc : (ocfailed ? lastknown!.opencode : oc)
    const klcat = kl.length ? kl : (klfailed ? lastknown!.kilo : kl)
    const cat: v4catalog = {
      opencode: occat,
      kilo: klcat,
      fetchedat: Date.now(),
      stale: ocfailed || klfailed,
    }
    if (occat.length || klcat.length) lastknown = cat
    return cat
  })()
  const result = await inflight
  inflight = null
  return result
}

// warm the cache at module load so first requests are fast
void getv4catalog().catch(() => {})

// ─── universal devthink context-window math (v4 + v5) ───────────────
/**
 * devthinkcontextwindow — the universal context-box formula.
 *
 * The meta-model rotates over a pool of upstream models. Its honest
 * context window is bounded by the WEAKEST member, minus the output
 * reservation of the weakest member, minus a 2% framing/system reserve:
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

// ─── derived defaults (positional rules — never hardcoded names) ────
/**
 * v4derivedefaults — primary = first opencode chat model in discovered
 * order, fallback = first kilo model. Both are derived live from the
 * catalog; when a provider is empty the other side covers both roles.
 */
export function v4derivedefaults(cat: v4catalog): { primary: string; fallback: string; primaryprovider: "opencode" | "kilo"; fallbackprovider: "opencode" | "kilo" } {
  const oc = cat.opencode[0]?.id ?? ""
  const kl = cat.kilo[0]?.id ?? ""
  const primary = oc || kl
  const fallback = kl || oc
  return {
    primary,
    fallback,
    primaryprovider: oc ? "opencode" : "kilo",
    fallbackprovider: kl ? "kilo" : "opencode",
  }
}

// ─── handler ─────────────────────────────────────────────────────────
async function handlemodels(req: NextRequest): Promise<Response> {
  const cors = handlecors(req)
  if (cors) return cors

  const cat = await getv4catalog()
  const all = [...cat.opencode, ...cat.kilo]
  const budget = devthinkcontextwindow(all)
  const defaults = v4derivedefaults(cat)
  const nvidiaroutedcount = all.filter((m) => m.nvidiarouted).length

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
      rotationpool: all.map((m) => m.id),
      rotationpoolsize: all.length,
      providers: ["opencode-zen", "kilo"],
      defaults: { primary: defaults.primary, fallback: defaults.fallback },
    },
    ...all.map((m) => ({
      id: m.id,
      object: "model",
      created: 1700000000,
      owned_by: m.provider === "opencode" ? "opencode-zen" : "kilo",
      free: true,
      context: m.context,
      maxoutput: m.maxoutput,
      modalities: m.modalities,
      vision: m.vision,
      provider: m.provider,
      base: m.provider === "opencode" ? opencodezenbase : kilobase,
      endpoint: "/chat/completions",
      nvidiarouted: m.nvidiarouted,
      piiwarn: m.nvidiarouted ? "nvidia routed logs prompts do not send pii or confidential data" : undefined,
    })),
  ]

  return Response.json(
    {
      object: "list",
      data: models,
      provider: provider,
      auth: "anonymous free tier no api key",
      discovery: {
        mode: "dynamic",
        rule: "free prefix or -free / :free / /free suffix (kilo isFree flag honored)",
        fetchedat: new Date(cat.fetchedat).toISOString(),
        stale: cat.stale,
        ttlseconds: CATALOG_TTL_MS / 1000,
      },
      devthinkcontext: budget,
      totalfreemodels: all.length,
      opencodefreecount: cat.opencode.length,
      kilofreecount: cat.kilo.length,
      nvidiaroutedcount,
      nvidiaroutedwarning: `${nvidiaroutedcount} nvidia routed free models log prompts for nvidia product improvement — do not send pii confidential or sensitive data to these models`,
      defaults: { primary: defaults.primary, fallback: defaults.fallback },
      bases: { opencode: opencodezenbase, kilo: kilobase },
      endpoints: ["/v4/models", "/v4/chat/completions", "/v4/completions", "/v4/messages", "/v4/responses", "/v4/embeddings", "/v4/keys"],
    },
    { headers: jsonheaders() },
  )
}

export async function GET(req: NextRequest): Promise<Response> { return handlemodels(req) }
export async function POST(req: NextRequest): Promise<Response> { return handlemodels(req) }
export async function OPTIONS(req: NextRequest): Promise<Response> { return handlemodels(req) }
