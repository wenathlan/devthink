/**
 * v2/models/route.ts — SINGLE SOURCE OF TRUTH for V2 (babel town)
 *
 * Inline model catalog + devthink meta + helpers. NO shared lib.
 * Other V2 routes import from "../models/route" (or "../../models/route" for nested).
 *
 * Exports: devthinkid, babelbase, babelkeyurl, babelmodels, babelpaused
 *
 * Babel is PAUSED (503) — gateway falls back to V1 zai.
 */

import { NextRequest } from "next/server"
// ─── self-contained route headers (inlined — no utilities module) ───
/** cors headers — open cors for all gateway routes */
const corsheaders: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "get,post,put,patch,delete,head,options,connect,trace,propfind,proppatch,mkcol,copy,move,lock,unlock,search,purge,link,unlink,report,checkout,checkin,version-control,label,merge,baseline-control,mkactivity,mkworkspace,update,subscribe,unsubscribe,notify,poll,bind,rebind,unbind,reindex",
  "access-control-allow-headers": "content-type,authorization,x-token,x-chat-id,x-user-id,x-session-id,x-request-id,x-thinking-level,x-model,x-tools,accept",
  "access-control-max-age": "86400",
  "access-control-expose-headers": "x-request-id,x-session-id",
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

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 2147483647

// ─── provider ───────────────────────────────────────────────────────
export const provider = "babel" as const

// ─── devthink meta ──────────────────────────────────────────────────
export const devthinkid = "devthink"

// ─── babel model interface ───────────────────────────────────────────
export interface babelmodel {
  id: string
  upstream: string
  context: number
  maxoutput: number
  free: true
}

// ─── babel model catalog ─────────────────────────────────────────────
// v2 exposes exactly one model: glm-5.2 (plus the devthink meta on top)
export const babelmodels: babelmodel[] = [
  { id: "babel-glm-5.2", upstream: "glm-5.2", context: 1048576, maxoutput: 131072, free: true },
]

// ─── babel config ────────────────────────────────────────────────────
export const babelbase = "https://api.babel.town/v1"
export const babelkeyurl = "https://glm.babel.town/api/get_api_key"
/** babel is paused aug 2026 — info only no completions, gateway falls back to v1 zai */
export const babelpaused = true

// ─── handler ─────────────────────────────────────────────────────────
function handlemodels(req: NextRequest): Response {
  const cors = handlecors(req)
  if (cors) return cors

  const models = [
    { id: devthinkid, object: "model" as const, created: 1700000000, owned_by: "devthink", free: true, paused: babelpaused },
    ...babelmodels.map((m) => ({
      id: m.id,
      object: "model" as const,
      created: 1700000000,
      owned_by: "babel",
      free: true,
      upstream: m.upstream,
      paused: babelpaused,
    })),
  ]

  return Response.json(
    {
      object: "list",
      data: models,
      provider: provider,
      base: babelbase,
      keyurl: babelkeyurl,
      paused: babelpaused,
      note: "babel town is paused aug 2026 — gateway falls back to v1 zai for completions",
    },
    { headers: jsonheaders() },
  )
}

export async function GET(req: NextRequest): Promise<Response> { return handlemodels(req) }
export async function POST(req: NextRequest): Promise<Response> { return handlemodels(req) }
export async function OPTIONS(req: NextRequest): Promise<Response> { return handlemodels(req) }
