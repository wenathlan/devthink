/**
 * v5 keys route — openrouter bearer key info endpoint
 * endpoint get post /v5/keys
 * returns masked key info from env OPENROUTER_API_KEY
 * free signup at https://openrouter.ai gives a free key
 * key is never exposed in full only first 8 chars and last 4 chars
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
import {
  devthinkid,
  openrouterbase,
  getv5catalog,
  devthinkcontextwindow,
  v5derivedefaults,
} from "../models/route"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 2147483647

/** maskkey — show only first 8 and last 4 chars of key */
function maskkey(k: string): string {
  if (!k) return ""
  if (k.length <= 12) return `${k.slice(0, 2)}...${k.slice(-2)}`
  return `${k.slice(0, 8)}...${k.slice(-4)}`
}

/** get — return masked openrouter key info (dynamic catalog) */
export async function GET(req: NextRequest): Promise<Response> {
  const cors = handlecors(req)
  if (cors) return cors
  const key = process.env.OPENROUTER_API_KEY || ""
  const masked = maskkey(key)
  const cat = await getv5catalog()
  const budget = devthinkcontextwindow(cat.models)
  const defaults = v5derivedefaults(cat)
  return Response.json({
    object: "list",
    provider: "openrouter",
    auth: "bearer key required free signup at https://openrouter.ai",
    signup: "https://openrouter.ai",
    envVar: "OPENROUTER_API_KEY",
    key: {
      configured: !!key,
      masked: masked || "not set",
      prefix: key ? key.slice(0, 4) : null,
      length: key.length,
    },
    authHeader: "authorization: Bearer <openrouter api key>",
    extraHeaders: {
      "HTTP-Referer": "https://devthink.ai",
      "X-Title": "DevThink Gateway",
    },
    base: openrouterbase,
    freeModels: {
      openrouter: cat.models.map((m) => m.id),
      total: cat.models.length,
      discovery: "dynamic - fetched live from openrouter /models with the free-tag rule",
    },
    metamodel: devthinkid,
    devthinkcontext: budget,
    defaults: { primary: defaults.primary, fallback: defaults.fallback },
    note: "v5 is openrouter free gateway — set OPENROUTER_API_KEY env var to your free openrouter key signup at https://openrouter.ai is free and unlimited on the free tier per model rate limits apply per model",
    rateLimits: "openrouter free tier rate limits vary per model see openrouter.ai/models for per model rpm",
    endpoints: ["/v5/keys", "/v5/models", "/v5/chat/completions", "/v5/completions", "/v5/messages", "/v5/responses", "/v5/embeddings"],
  }, { headers: jsonheaders() })
}

/** post — alias to get for client compatibility */
export async function POST(req: NextRequest): Promise<Response> {
  return GET(req)
}

/** default — handle all methods */
export async function OPTIONS(req: NextRequest): Promise<Response> {
  const m = req.method.toUpperCase()
  
  
  
  return GET(req)
}
