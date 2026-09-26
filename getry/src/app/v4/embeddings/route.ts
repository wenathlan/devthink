/**
 * v4 embeddings route — opencode zen plus kilo have no embeddings
 * endpoint post /v4/embeddings
 * returns 501 unsupported free gateways do not host embedding models
 * get lists empty data set with provider info
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
import { kilobase, opencodezenbase } from "../models/route"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 2147483647

/** post — embeddings unsupported returns 501 */
export async function POST(req: NextRequest): Promise<Response> {
  const cors = handlecors(req)
  if (cors) return cors
  return Response.json(
    {
      error: "embeddings not supported on v4 free gateways",
      detail: "opencode zen and kilo do not host embedding models use v3 nvidia embeddings instead",
      object: "error",
      code: "embeddings_unavailable",
      fallback: "/v3/embeddings",
      providers: ["opencode-zen", "kilo"],
      bases: { opencode: opencodezenbase, kilo: kilobase },
    },
    { status: 501, headers: jsonheaders() },
  )
}

/** get — info endpoint lists empty embedding model set */
export async function GET(req: NextRequest): Promise<Response> {
  const cors = handlecors(req)
  if (cors) return cors
  return Response.json(
    {
      object: "list",
      data: [],
      provider: "opencode-zen+kilo",
      auth: "anonymous free tier no api key",
      note: "free gateways do not host embedding models — use v3 nvidia embeddings at /v3/embeddings",
      bases: { opencode: opencodezenbase, kilo: kilobase },
      endpoints: ["/v4/embeddings", "/v4/models", "/v4/chat/completions", "/v4/completions", "/v4/messages", "/v4/responses", "/v4/keys"],
    },
    { headers: jsonheaders() },
  )
}

/** default — handle all methods */
export async function OPTIONS(req: NextRequest): Promise<Response> {
  const m = req.method.toUpperCase()
  
  
  
  return GET(req)
}
