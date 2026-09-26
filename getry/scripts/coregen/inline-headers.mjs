// inline-headers.mjs — replace the @/lib/utils import in the small routes
// with the inlined cors/header helpers so nothing imports the utilities
// module. run: bun scripts/coregen/inline-headers.mjs <files...>
import { readFileSync, writeFileSync } from "node:fs"

const block = `// ─── self-contained route headers (inlined — no utilities module) ───
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
`

const patterns = [
  /^import \{ corsheaders, handlecors, jsonheaders \} from "@\/lib\/utils"\r?\n/m,
  /^import \{ handlecors, jsonheaders \} from "@\/lib\/utils"\r?\n/m,
  /^import \{ handlecors, jsonheaders \} from "@\/lib\/utils"$/m,
]

for (const f of process.argv.slice(2)) {
  let content = readFileSync(f, "utf8")
  let replaced = false
  for (const p of patterns) {
    if (p.test(content)) {
      content = content.replace(p, block)
      replaced = true
      break
    }
  }
  if (!replaced) {
    console.error("no utils import matched in " + f)
    continue
  }
  writeFileSync(f, content)
  console.log("inlined headers -> " + f)
}
