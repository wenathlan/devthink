// patch-nonstream-tools.mjs — the non-stream leak scrub should convert
// text-form tool calls to proper message.tool_calls (convert mode) instead
// of just stripping them, and flush the filter's trailing holdback buffer.
import { readFileSync, writeFileSync } from "node:fs"

const oldblock = `      const leak = new toolleakfilter(false)
      const scrubbed = leak.push(contenttext)
      if (message && typeof message.content === "string") {
        message.content = scrubbed.content
        contenttext = scrubbed.content
      }
`

const newblocktool = `      const leak = new toolleakfilter(hastools)
      const scrubbed = leak.push(contenttext)
      const flushed = leak.flush()
      const allcalls = scrubbed.toolcalls.concat(flushed.toolcalls)
      if (flushed.content) scrubbed.content += flushed.content
      if (message && typeof message.content === "string") {
        message.content = scrubbed.content
        contenttext = scrubbed.content
      }
      // converted text-form tool calls attach to the message so every
      // openai compatible client executes them natively (never visible text)
      if (message && allcalls.length > 0) {
        message.tool_calls = allcalls.map((tc) => ({ id: tc.id, type: "function", function: { name: tc.name, arguments: tc.arguments } }))
      }
`

const newblockplain = `      const leak = new toolleakfilter(hastools)
      const scrubbed = leak.push(textcontent)
      const flushed = leak.flush()
      if (flushed.content) scrubbed.content += flushed.content
      if (message && typeof message.content === "string") {
        message.content = scrubbed.content
        textcontent = scrubbed.content
      }
`

for (const f of process.argv.slice(2)) {
  let content = readFileSync(f, "utf8")
  if (content.includes(oldblock)) {
    content = content.replace(oldblock, newblocktool)
    writeFileSync(f, content)
    console.log("patched nonstream tool conversion -> " + f)
    continue
  }
  // legacy completions variant uses textcontent
  const oldplain = `      const leak = new toolleakfilter(false)
      const scrubbed = leak.push(textcontent)
      if (message && typeof message.content === "string") {
        message.content = scrubbed.content
        textcontent = scrubbed.content
      }
`
  if (content.includes(oldplain)) {
    content = content.replace(oldplain, newblockplain)
    writeFileSync(f, content)
    console.log("patched nonstream flush (legacy) -> " + f)
    continue
  }
  console.error("no anchor in " + f)
}
