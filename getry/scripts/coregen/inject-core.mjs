// inject-core.mjs — copy the self-contained gateway core (between the inline
// markers of the canonical v4/chat route) into every route shell carrying
// the /*__CORE__*/ placeholder. each route file ends up fully standalone.
import { readFileSync, writeFileSync } from "node:fs"

const canonical = "/home/z/my-project/src/app/v4/chat/completions/route.ts"
const src = readFileSync(canonical, "utf8")
const bi = src.indexOf("(inline begin)")
const ei = src.indexOf("(inline end)")
if (bi === -1 || ei === -1) {
  console.error("markers not found in canonical file")
  process.exit(1)
}
const bline = src.lastIndexOf("\n", bi) + 1
const eline = src.indexOf("\n", ei) + 1
const coreblock = src.slice(bline, eline)

for (const f of process.argv.slice(2)) {
  let content = readFileSync(f, "utf8")
  if (!content.includes("/*__CORE__*/")) {
    console.error("no placeholder in " + f)
    continue
  }
  content = content.replace("/*__CORE__*/", coreblock)
  writeFileSync(f, content)
  console.log("injected core -> " + f + " (" + content.split("\n").length + " lines)")
}
