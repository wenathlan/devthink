/**
 * v4 keys route — opencode zen plus kilo anonymous free tier key info
 * endpoint get post /v4/keys
 * returns empty keys list no api key required for anonymous free tier
 * both gateways allow anonymous ip bounded access for free tagged models
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
  kilobase,
  opencodezenbase,
  getv4catalog,
  devthinkcontextwindow,
  v4derivedefaults,
} from "../models/route"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 2147483647

/** get — return empty key info anonymous free tier (dynamic catalog) */
export async function GET(req: NextRequest): Promise<Response> {
  const cors = handlecors(req)
  if (cors) return cors
  const cat = await getv4catalog()
  const budget = devthinkcontextwindow([...cat.opencode, ...cat.kilo])
  const defaults = v4derivedefaults(cat)
  return Response.json({
    object: "list",
    data: [],
    provider: "opencode-zen+kilo",
    auth: "anonymous free tier no api key required",
    bases: { opencode: opencodezenbase, kilo: kilobase },
    ratelimits: {
      opencode: "anonymous ip bounded no documented rate per ip",
      kilo: "200 requests per hour per ip anonymous",
    },
    freeModels: {
      opencode: cat.opencode.map((m) => m.id),
      kilo: cat.kilo.map((m) => m.id),
      total: cat.opencode.length + cat.kilo.length,
      discovery: "dynamic - fetched live from provider /models with the free-tag rule",
    },
    metamodel: devthinkid,
    devthinkcontext: budget,
    defaults: { primary: defaults.primary, fallback: defaults.fallback },
    note: "v4 is anonymous free tier — no api key required for any model send requests directly to /v4/chat/completions with model id from /v4/models",
    endpoints: ["/v4/keys", "/v4/models", "/v4/chat/completions", "/v4/completions", "/v4/messages", "/v4/responses", "/v4/embeddings"],
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
