/**
 * v2 embeddings route — babel town has no embeddings returns 501
 * endpoint post /v2/embeddings
 * babel town gateway exposes chat completions only no embeddings
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
import { babelbase, babelkeyurl, babelpaused } from "../models/route"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 2147483647

/** post — babel has no embeddings endpoint returns 501 */
export async function POST(req: NextRequest): Promise<Response> {
  const cors = handlecors(req)
  if (cors) return cors
  return Response.json(
    {
      error: "babel town gateway has no embeddings endpoint",
      object: "error",
      code: "embeddings_unavailable",
      status: 501,
    },
    { status: 501, headers: jsonheaders() },
  )
}

/** get — info endpoint returns empty model list */
export async function GET(req: NextRequest): Promise<Response> {
  const cors = handlecors(req)
  if (cors) return cors
  return Response.json(
    {
      object: "list",
      provider: "babel",
      base: babelbase,
      keyurl: babelkeyurl,
      paused: babelpaused,
      data: [],
      note: "babel town gateway exposes chat completions only no embeddings models",
    },
    { headers: jsonheaders() },
  )
}

/** default — handle all methods */
export async function OPTIONS(req: NextRequest): Promise<Response> {
  const m = req.method.toUpperCase()
  
  
  return POST(req)
}
