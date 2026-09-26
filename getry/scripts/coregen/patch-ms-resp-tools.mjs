// patch-ms-resp-tools.mjs — messages/responses non-stream paths: flush the
// leak filter and attach converted text-form tool calls to the upstream
// message so the anthropic/responses converters emit proper tool_use /
// function_call items instead of dropping them.
import { readFileSync, writeFileSync } from "node:fs"

const oldm = `      const leak = new toolleakfilter(hastools)
      const scrubbed = leak.push(content)
      content = scrubbed.content
`
const newm = `      const leak = new toolleakfilter(hastools)
      const scrubbed = leak.push(content)
      const flushed = leak.flush()
      const allcalls = scrubbed.toolcalls.concat(flushed.toolcalls)
      if (flushed.content) scrubbed.content += flushed.content
      content = scrubbed.content
      // converted text-form tool calls attach to the message so the
      // converter below emits proper tool_use blocks (never visible text)
      if (message && allcalls.length > 0) {
        const native = Array.isArray(message.tool_calls) ? (message.tool_calls as Array<Record<string, unknown>>) : []
        message.tool_calls = native.concat(allcalls.map((tc) => ({ id: tc.id, type: "function", function: { name: tc.name, arguments: tc.arguments } })))
      }
`

const oldr = `      const leak = new toolleakfilter(hastools)
      const scrubbed = leak.push(contenttext)
      contenttext = scrubbed.content
`
const newr = `      const leak = new toolleakfilter(hastools)
      const scrubbed = leak.push(contenttext)
      const flushed = leak.flush()
      const allcalls = scrubbed.toolcalls.concat(flushed.toolcalls)
      if (flushed.content) scrubbed.content += flushed.content
      contenttext = scrubbed.content
      // converted text-form tool calls attach to the message so the
      // converter below emits proper function_call items
      if (message && allcalls.length > 0) {
        const native = Array.isArray(message.tool_calls) ? (message.tool_calls as Array<Record<string, unknown>>) : []
        message.tool_calls = native.concat(allcalls.map((tc) => ({ id: tc.id, type: "function", function: { name: tc.name, arguments: tc.arguments } })))
      }
`

for (const f of process.argv.slice(2)) {
  let content = readFileSync(f, "utf8")
  if (content.includes(oldm)) {
    content = content.replace(oldm, newm)
    writeFileSync(f, content)
    console.log("patched messages nonstream tools -> " + f)
  } else if (content.includes(oldr)) {
    content = content.replace(oldr, newr)
    writeFileSync(f, content)
    console.log("patched responses nonstream tools -> " + f)
  } else {
    console.error("no anchor in " + f)
  }
}
