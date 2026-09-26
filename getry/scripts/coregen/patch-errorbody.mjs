// patch-errorbody.mjs — after the non-stream upstream parse, an ok status
// carrying an upstream error body (kilo wraps provider failures as 200 +
// {"error":...}) must surface as a proper 502 openai error, never a fake
// 200 success the client marks retryable=false. applies to all 8 non-stream
// paths that anchor on `const parsed = safejsonparse(masked)`.
import { readFileSync, writeFileSync } from "node:fs"

const anchor = "      const parsed = safejsonparse(masked)\n"
const patch = `      const parsed = safejsonparse(masked)
      // an ok status carrying an upstream error body (kilo wraps provider
      // failures as 200 + error payload) is still a failure — surface it as
      // a proper openai error, never a fake 200 success the client would
      // mark retryable false
      const errbody = parsed as Record<string, unknown> | null
      if (errbody && !Array.isArray(errbody.choices) && errbody.error) {
        const er = errbody.error as unknown
        const msg = typeof er === "string" ? er : safestringify(er).slice(0, 300)
        return Response.json(openaierror(\`upstream error: \${msg}\`, "upstream_error", "upstream_unavailable"), { status: 502, headers: corsheaders })
      }
`

for (const f of process.argv.slice(2)) {
  let content = readFileSync(f, "utf8")
  const count = content.split(anchor).length - 1
  if (count !== 1) {
    console.error("anchor count " + count + " in " + f + " — skipping")
    continue
  }
  content = content.replace(anchor, patch)
  writeFileSync(f, content)
  console.log("patched error-body guard -> " + f)
}
