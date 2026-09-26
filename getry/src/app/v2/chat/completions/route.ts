/**
 * v2 chat completions route — babel town gateway
 * endpoint post /v2/chat/completions
 * pattern babel passthrough via https api babel town v1 chat completions
 * babel is paused aug 2026 — returns 503 with fallback hint to v1 zai
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
import { babelbase, babelkeyurl, babelmodels, babelpaused } from "../../models/route"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 2147483647

/** post — main chat completions handler
 * babel is paused returns 503 with fallback hint to v1 zai */
export async function POST(req: NextRequest): Promise<Response> {
  const cors = handlecors(req)
  if (cors) return cors

  if (babelpaused) {
    return Response.json({
      error: "babel town is paused — use v1 zai instead",
      fallback: "/v1/chat/completions",
      status: 503,
    }, { status: 503, headers: jsonheaders() })
  }

  // babel not paused — would forward to https api babel town v1 chat completions
  // currently unreachable since babelpaused is true
  return Response.json({
    error: "babel town gateway not yet enabled",
    fallback: "/v1/chat/completions",
    status: 503,
  }, { status: 503, headers: jsonheaders() })
}

/** get — info endpoint */
export async function GET(req: NextRequest): Promise<Response> {
  const cors = handlecors(req)
  if (cors) return cors
  return Response.json({
    object: "v2.chat.completions",
    provider: "babel",
    base: babelbase,
    keyurl: babelkeyurl,
    pattern: "babel town passthrough — currently paused falls back to v1 zai",
    paused: babelpaused,
    models: babelmodels.map((m) => m.id),
    endpoints: ["/v2/chat/completions", "/v2/models", "/v2/completions", "/v2/messages", "/v2/responses", "/v2/embeddings", "/v2/keys"],
    fallback: "/v1/chat/completions",
  }, { headers: jsonheaders() })
}

/** default — handle all methods */
export async function OPTIONS(req: NextRequest): Promise<Response> {
  const m = req.method.toUpperCase()
  
  
  
  return GET(req)
}
