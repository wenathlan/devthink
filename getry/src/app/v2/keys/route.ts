/**
 * v2 keys route — babel town key info endpoint
 * endpoint get post /v2/keys
 * babel town mints ip bound ephemeral api keys 60 min expiry via
 * https glm babel town api get_api_key using browser spoofed headers
 * when paused no new keys are minted
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
import { babelbase, babelkeyurl, babelmodels, babelpaused } from "../models/route"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 2147483647

/** get — return babel key info */
export async function GET(req: NextRequest): Promise<Response> {
  const cors = handlecors(req)
  if (cors) return cors
  return Response.json({
    object: "list",
    provider: "babel",
    base: babelbase,
    keyurl: babelkeyurl,
    paused: babelpaused,
    authtype: "ip bound ephemeral api key",
    keyexpiry: "60 minutes",
    keyrotation: "auto — gateway mints new key per request via browser spoofed headers",
    keys: babelpaused ? [] : [{ id: "babel-ephemeral", source: babelkeyurl, expirymin: 60, ipbound: true }],
    models: babelmodels.map((m) => m.id),
    note: babelpaused
      ? "babel town is paused — no new keys minted use v1 zai instead"
      : "v2 babel mints ip bound 60 min ephemeral keys via glm babel town get_api_key",
    fallback: "/v1/keys",
  }, { headers: jsonheaders() })
}

/** post — alias to get for compatibility */
export async function POST(req: NextRequest): Promise<Response> {
  return GET(req)
}

/** default — handle all methods */
export async function OPTIONS(req: NextRequest): Promise<Response> {
  const m = req.method.toUpperCase()
  
  
  return GET(req)
}
