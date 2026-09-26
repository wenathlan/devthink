/**
 * v4/responses/route.ts
 *
 * v4 — openai responses api via opencode zen + kilo free gateways.
 * fully self-contained route: the whole gateway core is inlined below —
 * no shared utilities module.
 *
 * the robust gateway contract:
 *   1. streamproxy — keepalive from the first byte, client cancel aborts
 *      upstream, 30s connect timeout, kilo<->opencode fallback on retryable
 *      statuses (400 included), response.completed is the terminator (no
 *      raw chunk or [DONE] after it), responses-shaped error events
 *   2. responses api input converts to chat messages with the tool contract
 *      preserved — function_call items become assistant tool_calls,
 *      function_call_output items become tool role messages, image parts
 *      survive as image_url
 *   3. tools forward to the upstream (converted to openai function format)
 *   4. toolleakfilter scrubs residual text-form tool syntax and emits it as
 *      proper function_call items
 *   5. devthink meta rotation every 6 messages per session over
 *      chat-endpoint models only
 *   6. uploads — multipart form bodies keep files as multimodal parts
 */

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
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

// ─── self-contained gateway core ──────────────────────── (inline begin)

/** cors headers — open cors for all gateway routes */
const corsheaders: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "get,post,put,patch,delete,head,options,connect,trace,propfind,proppatch,mkcol,copy,move,lock,unlock,search,purge,link,unlink,report,checkout,checkin,version-control,label,merge,baseline-control,mkactivity,mkworkspace,update,subscribe,unsubscribe,notify,poll,bind,rebind,unbind,reindex",
  "access-control-allow-headers": "content-type,authorization,x-token,x-chat-id,x-user-id,x-session-id,x-request-id,x-thinking-level,x-model,x-tools,accept",
  "access-control-max-age": "86400",
  "access-control-expose-headers": "x-request-id,x-session-id",
}

/** content type constants */
const ctjson = "application/json"
const ctsse = "text/event-stream"
const ctndjson = "application/x-ndjson"
const ctoctet = "application/octet-stream"

/** handlecors — handle options preflight returns response or null */
function handlecors(req: Request): Response | null {
  if (req.method.toUpperCase() === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsheaders })
  }
  return null
}

/** sse headers — headers for sse streaming with x accel buffering no */
function sseheaders(): Record<string, string> {
  return {
    ...corsheaders,
    "content-type": ctsse,
    "cache-control": "no-cache, no-transform",
    "connection": "keep-alive",
    "x-accel-buffering": "no",
  }
}

/** json headers — headers for json response */
function jsonheaders(): Record<string, string> {
  return { ...corsheaders, "content-type": ctjson }
}

/** genid — generate a unique chatcmpl id */
function genid(prefix = "chatcmpl"): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

/** getip — extract client ip from request headers */
function getip(req: Request): string {
  const headers = req.headers
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    headers.get("x-client-ip") ||
    "unknown"
  )
}

/** safestringify — json stringify that never throws */
function safestringify(obj: unknown): string {
  try {
    return JSON.stringify(obj)
  } catch {
    return String(obj)
  }
}

/** safejsonparse — json parse that never throws returns null on failure */
function safejsonparse<T = unknown>(s: string): T | null {
  try {
    return JSON.parse(s) as T
  } catch {
    return null
  }
}

/** detectcontenttype — read accept header returns format */
function detectcontenttype(req: Request): "sse" | "ndjson" | "json" | "plain" | "octet" {
  const accept = (req.headers.get("accept") || "").toLowerCase()
  if (accept.includes(ctndjson) || accept.includes("application/x-ndjson")) return "ndjson"
  if (accept.includes("text/event-stream") || accept.includes(ctsse)) return "sse"
  if (accept.includes("text/plain")) return "plain"
  if (accept.includes(ctoctet) || accept.includes("application/octet-stream")) return "octet"
  return "json"
}

/** thinking budgets — 7 level thinking token budgets */
const thinkingbudgets: Record<string, number> = {
  none: 0,
  minimal: 1400,
  low: 5500,
  medium: 17000,
  high: 68000,
  xhigh: 68000,
  max: 68000,
}

/** default max tokens — conservative per request 32768 */
const defaultmaxtokens = 32768

/** clamp — bound a number between min and max */
function clamp(n: unknown, min: number, max: number, fallback = 0): number {
  const v = typeof n === "string" ? parseFloat(n) : typeof n === "number" ? n : fallback
  if (!Number.isFinite(v)) return fallback
  return Math.max(min, Math.min(max, v))
}

/** autotemp — clamp temperature 0 to 2 */
function autotemp(n: unknown, fallback = 0.7): number {
  return clamp(n, 0, 2, fallback)
}

/** autotopp — clamp top p 0 to 1 */
function autotopp(n: unknown, fallback = 0.9): number {
  return clamp(n, 0, 1, fallback)
}

/** automaxtokens — clamp max tokens 1 to 98304 with 0 mapping to default */
function automaxtokens(n: unknown, fallback = defaultmaxtokens): number {
  const v = typeof n === "string" ? parseInt(n, 10) : typeof n === "number" ? n : fallback
  if (!Number.isFinite(v) || v === 0) return fallback
  return clamp(v, 1, 98304, fallback)
}

/** auton — clamp n 1 to 10 */
function auton(n: unknown, fallback = 1): number {
  return clamp(n, 1, 10, fallback)
}

/** autofrequencypenalty — clamp frequency penalty minus 2 to 2 */
function autofrequencypenalty(n: unknown, fallback = 0): number {
  return clamp(n, -2, 2, fallback)
}

/** autopresencepenalty — clamp presence penalty minus 2 to 2 */
function autopresencepenalty(n: unknown, fallback = 0): number {
  return clamp(n, -2, 2, fallback)
}

/** autoseed — clamp seed to safe integer */
function autoseed(n: unknown, fallback = 0): number {
  const v = typeof n === "string" ? parseInt(n, 10) : typeof n === "number" ? n : fallback
  if (!Number.isFinite(v)) return fallback
  return clamp(Math.abs(Math.floor(v)), 0, 2147483647, fallback)
}

/** autothinking — normalize thinking level string to canonical 7 level */
function autothinking(level?: string): "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max" {
  if (!level) return "high"
  const l = String(level).toLowerCase().trim()
  if (l in thinkingbudgets) return l as "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max"
  if (l === "disabled" || l === "off" || l === "false") return "none"
  if (l === "minimum") return "minimal"
  if (l === "med" || l === "mid") return "medium"
  if (l === "extra" || l === "ultra") return "xhigh"
  if (l === "maximum" || l === "full" || l === "all") return "max"
  return "high"
}

/** openaierror — the openai shaped error body every sdk parses
 * a string error or a fake content chunk makes clients treat upstream
 * failures as completed turns (retryable false) and stop retrying */
function openaierror(
  message: string,
  type = "upstream_error",
  code = "upstream_error",
): Record<string, unknown> {
  return { error: { message, type, code }, object: "error" }
}

/** makechunk — build a minimal openai compatible chat completion chunk */
function makechunk(
  id: string,
  model: string,
  content: string,
  reasoningcontent?: string,
  finishreason?: string | null,
): Record<string, unknown> {
  const delta: Record<string, unknown> = {}
  if (content) delta.content = content
  if (reasoningcontent) delta.reasoning_content = reasoningcontent
  if (!finishreason) delta.role = "assistant"
  return {
    id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        delta,
        ...(finishreason ? { finish_reason: finishreason } : {}),
      },
    ],
  }
}

/** makefinalchunk — build the final chunk with usage */
function makefinalchunk(
  id: string,
  model: string,
  prompttokens: number,
  completiontokens: number,
  reasoningtokens = 0,
): Record<string, unknown> {
  return {
    id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
    usage: {
      prompt_tokens: prompttokens,
      completion_tokens: completiontokens,
      total_tokens: prompttokens + completiontokens,
      completion_tokens_details: { reasoning_tokens: reasoningtokens },
    },
  }
}

/** maketoolchunk — chat chunk carrying tool_calls deltas the form every
 * openai compatible client executes natively */
function maketoolchunk(
  id: string,
  model: string,
  toolcalls: leakedtoolcall[],
): Record<string, unknown> {
  return {
    id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        delta: {
          tool_calls: toolcalls.map((tc, i) => ({
            index: i,
            id: tc.id,
            type: "function",
            function: { name: tc.name, arguments: tc.arguments },
          })),
        },
      },
    ],
  }
}

/** maskmodel — pure byte regex mask model name to devthink
 * replaces "model":"anything" with "model":"devthink" without json parse */
function maskmodel(chunk: string): string {
  return chunk.replace(/"model"\s*:\s*"[^"]*"/g, '"model":"devthink"')
}

/** discardheartbeat — check if a line is an sse heartbeat comment */
function discardheartbeat(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.startsWith(":") || trimmed === "" || trimmed === "event: ping" || trimmed === "data: "
}

/** parse sse frames — split buffer on double newline returns complete frames plus residual
 * handles both n n and r n r n delimiters */
function parsesseframes(buffer: string): { frames: string[]; residual: string } {
  const normalized = buffer.replace(/\r\n/g, "\n")
  const frames: string[] = []
  let last = 0
  let idx: number
  while ((idx = normalized.indexOf("\n\n", last)) !== -1) {
    frames.push(normalized.slice(last, idx))
    last = idx + 2
  }
  const residual = normalized.slice(last)
  return { frames, residual }
}

/** isdone — check if a data string is the done marker (case insensitive:
 * upstreams send uppercase [done], the old lowercase-only check let the
 * upstream terminator through and then writedone emitted a second one) */
function isdone(data: string): boolean {
  const trimmed = data.trim()
  const lower = trimmed.toLowerCase()
  return lower === "[done]" || lower === "data: [done]" || lower === "done"
}

/** extractdata — extract data lines from an sse frame concatenating multi line data
 * the terminator is matched case insensitively upstream lowercase or uppercase */
function extractdata(frame: string): string | null {
  const lines = frame.split("\n")
  const dataLines: string[] = []
  for (const line of lines) {
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart())
    } else if (line.startsWith("event:")) {
      // event line skip for data extraction
    } else if (line.startsWith(":") || line === "") {
      // comment or empty skip
    }
  }
  if (dataLines.length === 0) return null
  const joined = dataLines.join("\n")
  return isdone(joined) ? null : joined
}

/** safeenqueue — enqueue to controller catching errors */
function safeenqueue(controller: ReadableStreamDefaultController, chunk: string): boolean {
  try {
    controller.enqueue(chunk)
    return true
  } catch {
    return false
  }
}

/** safeclose — close a controller catching errors */
function safeclose(controller: ReadableStreamDefaultController): void {
  try {
    controller.close()
  } catch {
    // already closed
  }
}

/** writedone — write the terminal done marker
 * sse terminator is the uppercase [done] frame per the openai sse contract —
 * a lowercase [done] is a plain data line every client tries to json parse
 * and fails on, which reads as a broken stream and triggers reconnect loops */
function writedone(
  controller: ReadableStreamDefaultController,
  format: "sse" | "ndjson" | "json" | "plain" | "octet" = "sse",
): void {
  if (format === "sse") {
    controller.enqueue("data: [DONE]\n\n")
  } else if (format === "ndjson") {
    controller.enqueue('{"done":true}\n')
  }
}

// ── tool call leak filter ─────────────────────────────

/** models without native tool-call support emit their internal templates
 * (function=agent parameter=k v or tool_call blocks) as plain text; the
 * filter holds back partial tags split across chunk boundaries strips
 * complete blocks from visible content and converts them to proper openai
 * tool_calls when the request carried tools (convert mode) */
const tooltagstems = [
  "<function", "</function", "<function_calls", "</function_calls",
  "<tool_call", "</tool_call", "<tool_calls", "</tool_calls",
  "<tool_use", "</tool_use", "<parameter", "</parameter",
]
const toolmaxstem = 17
const toolopenre = /<(?:function=|function_calls>|tool_call>|tool_calls>|tool_use>)/i
const toolclosere = /<\/(?:function|function_calls|tool_call|tool_calls|tool_use)>/i
const orphanclosere = /<\/(?:function|function_calls|tool_call|tool_calls|tool_use)>\s*/gi

interface leakedtoolcall {
  id: string
  name: string
  arguments: string
}
interface scrubresult {
  content: string
  toolcalls: leakedtoolcall[]
}

class toolleakfilter {
  private pending = ""
  private inleak = false
  private leakbuf = ""
  private callidx = 0

  constructor(private convert = true) {}

  /** push a content delta returns the clean text and any complete tool calls */
  push(text: string): scrubresult {
    let content = ""
    const toolcalls: leakedtoolcall[] = []
    if (this.inleak) {
      this.leakbuf += text
    } else {
      const buf = this.pending + text
      this.pending = ""
      const open = toolopenre.exec(buf)
      if (open && open.index !== undefined) {
        // text before the opener is complete emit it minus stray closers
        content += buf.slice(0, open.index).replace(orphanclosere, "")
        this.inleak = true
        this.leakbuf = buf.slice(open.index)
      } else {
        const { emit, hold } = this.holdpartial(buf)
        content += emit
        this.pending = hold
      }
    }
    // extract any complete leaked blocks and continue after each closer
    let guard = 0
    while (this.inleak && guard++ < 50) {
      const close = toolclosere.exec(this.leakbuf)
      if (!close || close.index === undefined) break
      const blockend = close.index + close[0].length
      const block = this.leakbuf.slice(0, blockend)
      let rest = this.leakbuf.slice(blockend)
      const parsed = this.parsetoolblock(block)
      if (parsed && this.convert) toolcalls.push(parsed)
      // strip orphan closers that belonged to the wrapper
      rest = rest.replace(orphanclosere, "")
      this.leakbuf = rest
      if (!toolopenre.exec(rest)) {
        this.inleak = false
        const clean = rest
        this.leakbuf = ""
        // remaining text after the block flows back through normal mode
        const { emit, hold } = this.holdpartial(clean)
        content += emit
        this.pending = hold
        break
      }
      // another opener follows immediately process it too
      const nextopen = toolopenre.exec(rest)
      if (nextopen && nextopen.index !== undefined) {
        content += rest.slice(0, nextopen.index).replace(orphanclosere, "")
        this.leakbuf = rest.slice(nextopen.index)
      }
    }
    return { content, toolcalls }
  }

  /** flush at stream end converts an unterminated leak block best effort */
  flush(): scrubresult {
    const toolcalls: leakedtoolcall[] = []
    let content = ""
    if (this.inleak) {
      const parsed = this.parsetoolblock(this.leakbuf)
      if (parsed && this.convert) toolcalls.push(parsed)
      this.inleak = false
      this.leakbuf = ""
    }
    // a trailing partial tag prefix that never resolved is literal text
    content = this.pending
    this.pending = ""
    return { content, toolcalls }
  }

  /** holdpartial — split text into emit-safe and a trailing partial tag stem
   * a chunk boundary can split a tag across deltas so any tail that could be
   * the start of a tag stem is held back until the next push resolves it */
  private holdpartial(text: string): { emit: string; hold: string } {
    if (!text) return { emit: "", hold: "" }
    const tail = text.slice(-toolmaxstem)
    for (let len = tail.length; len > 0; len--) {
      const cand = tail.slice(tail.length - len)
      if (tooltagstems.some((s) => s.startsWith(cand) && cand.length < s.length)) {
        return { emit: text.slice(0, text.length - len), hold: cand }
      }
    }
    return { emit: text, hold: "" }
  }

  /** parsetoolblock — extract name and parameters from a leaked block
   * handles the function=name parameter=k v form (the zcode opencode style
   * with unclosed parameters) and the json name arguments form (qwen
   * anthropic); returns null when the block carries no tool shape */
  private parsetoolblock(block: string): leakedtoolcall | null {
    let name = ""
    const args: Record<string, string> = {}
    const fn = block.match(/<function=([a-zA-Z0-9_.:-]+)\s*>/i) || block.match(/<function=([a-zA-Z0-9_.:-]+)/i)
    if (fn) name = fn[1]
    // zcode style parameters value runs until the next parameter or closer
    const pre = /<parameter=([a-zA-Z0-9_.:-]+)>/gi
    let m: RegExpExecArray | null
    const positions: Array<{ key: string; start: number; end: number }> = []
    while ((m = pre.exec(block)) !== null) {
      positions.push({ key: m[1], start: m.index + m[0].length, end: block.length })
      if (positions.length > 1) positions[positions.length - 2].end = m.index
    }
    for (const p of positions) {
      let val = block.slice(p.start, p.end)
      const close = val.match(/<\/(?:parameter|function|function_calls|tool_call|tool_use)>/i)
      if (close && close.index !== undefined) val = val.slice(0, close.index)
      args[p.key] = val.trim()
    }
    // qwen anthropic style json body
    let hadjson = false
    if (!name || positions.length === 0) {
      const jm = block.match(/\{[\s\S]*\}/)
      if (jm) {
        const parsed = safejsonparse<Record<string, unknown>>(jm[0])
        if (parsed && typeof parsed === "object") {
          hadjson = true
          if (typeof parsed.name === "string") name = name || parsed.name
          const argsrc = (parsed.arguments ?? parsed.parameters) as Record<string, unknown> | undefined
          if (argsrc && typeof argsrc === "object") {
            for (const [k, v] of Object.entries(argsrc)) args[k] = typeof v === "string" ? v : safestringify(v)
          } else {
            for (const [k, v] of Object.entries(parsed)) if (k !== "name") args[k] = typeof v === "string" ? v : safestringify(v)
          }
        }
      }
    }
    if (!name && positions.length === 0 && !hadjson) return null
    if (!name) name = "unknown_tool"
    return {
      id: `call-${Date.now().toString(36)}${(this.callidx++).toString(36)}`,
      name,
      arguments: Object.keys(args).length ? safestringify(args) : "{}",
    }
  }
}

// ── upstream body builders ─────────────────────────────

/** buildmessages — preserve the full openai message structure
 * role content string or array tool_calls tool_call_id and name all survive
 * (stringifying content arrays and dropping tool history is what made the
 * models hallucinate their tool syntax as visible text) */
function buildmessages(messages: unknown[]): unknown[] {
  const out: unknown[] = []
  for (const raw of messages) {
    if (!raw || typeof raw !== "object") continue
    const m = raw as Record<string, unknown>
    const msg: Record<string, unknown> = { role: m.role ?? "user" }
    if (m.content !== undefined) msg.content = m.content
    if (m.name !== undefined) msg.name = m.name
    if (m.tool_calls !== undefined) msg.tool_calls = m.tool_calls
    if (m.tool_call_id !== undefined) msg.tool_call_id = m.tool_call_id
    out.push(msg)
  }
  return out
}

/** buildupstreambody — the upstream request body with tools forwarded
 * tools tool_choice parallel_tool_calls and response_format pass through
 * so capable upstreams emit native tool_calls instead of text templates */
function buildupstreambody(
  body: Record<string, unknown>,
  modelid: string,
  wantstream: boolean,
): Record<string, unknown> {
  const out: Record<string, unknown> = {
    model: modelid,
    messages: buildmessages(Array.isArray(body.messages) ? body.messages : []),
    temperature: autotemp(body.temperature),
    top_p: autotopp(body.top_p ?? body.topP),
    max_tokens: automaxtokens(body.max_tokens ?? body.maxTokens, defaultmaxtokens),
    n: auton(body.n),
    frequency_penalty: autofrequencypenalty(body.frequency_penalty ?? body.frequencyPenalty),
    presence_penalty: autopresencepenalty(body.presence_penalty ?? body.presencePenalty),
    stream: wantstream,
  }
  const seed = body.seed !== undefined ? autoseed(body.seed) : 0
  if (seed) out.seed = seed
  if (Array.isArray(body.tools) && body.tools.length > 0) out.tools = body.tools
  if (body.tool_choice !== undefined) out.tool_choice = body.tool_choice
  if (body.parallel_tool_calls !== undefined) out.parallel_tool_calls = body.parallel_tool_calls
  if (body.response_format !== undefined) out.response_format = body.response_format
  if (wantstream && body.stream_options !== undefined) out.stream_options = body.stream_options
  if (typeof body.user === "string") out.user = body.user
  const lvl = autothinking((body.reasoning_level ?? body.thinking_level ?? body.level) as string | undefined)
  if (lvl !== "high" && (body.reasoning_level || body.thinking_level || body.level)) {
    out.reasoning = lvl
  }
  return out
}

// ── session rotation ───────────────────────────────────

/** sessionrotation — rotate the meta model every n requests per session
 * the per-second timestamp rotation churned models mid conversation and
 * landed on endpoint-mismatched models; this keeps one model per stretch of
 * n messages so tool context and style stay coherent */
class sessionrotation {
  private map = new Map<string, { idx: number; served: number }>()
  constructor(
    private pool: string[],
    private every = 6,
    private cap = 4096,
  ) {}
  next(sessionid: string): string {
    if (this.pool.length === 0) return ""
    let entry = this.map.get(sessionid)
    if (!entry) {
      if (this.map.size >= this.cap) {
        const first = this.map.keys().next().value
        if (first !== undefined) this.map.delete(first)
      }
      let h = 0
      for (let i = 0; i < sessionid.length; i++) h = (h * 31 + sessionid.charCodeAt(i)) | 0
      entry = { idx: Math.abs(h) % this.pool.length, served: 0 }
      this.map.set(sessionid, entry)
    }
    const modelid = this.pool[entry.idx % this.pool.length]
    entry.served++
    if (entry.served >= this.every) {
      entry.served = 0
      entry.idx = (entry.idx + 1) % this.pool.length
    }
    return modelid
  }
}

// ── upload mime registry ───────────────────────────────

/** mimemap — common web content types by extension (from the media-types
 * registry) used by the upload path so every file part answers with the
 * correct content-type instead of a generic octet-stream */
const mimemap: Record<string, string> = {
  "3g2": "video/3gpp2", "3gp": "video/3gpp", "7z": "application/x-7z-compressed", aac: "audio/aac", ai: "application/postscript", aif: "audio/x-aiff", aiff: "audio/x-aiff", apk: "application/vnd.android.package-archive", asf: "application/vnd.ms-asf", au: "audio/basic", avi: "video/x-msvideo", avif: "image/avif", bat: "application/x-msdos-program", bin: "application/octet-stream", bmp: "image/bmp", c: "text/x-c", cjs: "text/javascript", cpp: "text/x-c++", cs: "text/plain", css: "text/css", csv: "text/csv", deb: "application/vnd.debian.binary-package", dll: "application/x-msdos-program", dmg: "application/x-apple-diskimage", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", eot: "application/vnd.ms-fontobject", epub: "application/epub+zip", exe: "application/x-msdos-program", flac: "audio/flac", flv: "video/x-flv", gif: "image/gif", glb: "model/gltf-binary", gltf: "model/gltf+json", go: "text/x-go", gz: "application/gzip", h: "text/x-c", heic: "image/heic", heif: "image/heif", hpp: "text/x-c++", htm: "text/html", html: "text/html", ico: "image/vnd.microsoft.icon", ini: "text/plain", iso: "application/x-iso9660-image", java: "text/x-java", jpeg: "image/jpeg", jpg: "image/jpeg", js: "text/javascript", json: "application/json", jsonl: "application/jsonl", log: "text/plain", lua: "text/x-lua", m3u8: "application/vnd.apple.mpegurl", m4a: "audio/mp4", m4v: "video/mp4", md: "text/markdown", mid: "audio/sp-midi", midi: "audio/sp-midi", mjs: "text/javascript", mkv: "video/x-matroska", mov: "video/quicktime", mp3: "audio/mpeg", mp4: "video/mp4", mpd: "application/dash+xml", mpeg: "video/mpeg", mpg: "video/mpeg", obj: "model/obj", odp: "application/vnd.oasis.opendocument.presentation", ods: "application/vnd.oasis.opendocument.spreadsheet", odt: "application/vnd.oasis.opendocument.text", oga: "audio/ogg", ogg: "audio/ogg", opus: "audio/ogg", otf: "font/otf", pdf: "application/pdf", php: "application/x-httpd-php", pl: "text/plain", png: "image/png", ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation", ps: "application/postscript", ps1: "text/plain", psd: "image/vnd.adobe.photoshop", py: "text/x-python", rar: "application/vnd.rar", rb: "text/x-ruby", rtf: "application/rtf", rs: "text/x-rust", rpm: "application/x-redhat-package-manager", sc: "text/plain", sql: "application/sql", sqlite: "application/vnd.sqlite3", sqlite3: "application/vnd.sqlite3", stl: "model/stl", svg: "image/svg+xml", swift: "text/x-swift", tar: "application/x-tar", tiff: "image/tiff", toml: "text/plain", ts: "video/mp2t", tsv: "text/tab-separated-values", tsx: "text/plain", txt: "text/plain", usdz: "model/vnd.usdz+zip", vrml: "model/vrml", wasm: "application/wasm", wav: "audio/x-wav", webm: "video/webm", webp: "image/webp", wmv: "video/x-ms-wmv", woff: "font/woff", woff2: "font/woff2", x3d: "model/x3d+xml", xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xml: "application/xml", xz: "application/x-xz", yaml: "application/yaml", yml: "application/yaml", zip: "application/zip"
}

/** mimelookup — content-type for a file name from the registry with an
 * octet-stream fallback for unknown extensions */
function mimelookup(name: string): string {
  const ext = (name.split(".").pop() || "").toLowerCase()
  return mimemap[ext] || ctoctet
}

/** parsebody — unified request body parser with upload support
 * json and form and urlencoded and multipart all resolve to a body object;
 * multipart files survive as proper multimodal content parts with the
 * correct mime type from the registry (images become image_url data parts,
 * every other file becomes a named text attachment part) attached to the
 * last user message instead of being discarded */
async function parsebody(req: NextRequest): Promise<Record<string, unknown>> {
  const ct = (req.headers.get("content-type") || "").toLowerCase()
  try {
    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData()
      const obj: Record<string, unknown> = {}
      const imageparts: Array<Record<string, unknown>> = []
      const fileparts: Array<Record<string, unknown>> = []
      for (const [k, v] of fd.entries()) {
        if (typeof v === "string") {
          // structured fields carrying json still parse
          if (k === "model" || k === "messages" || k === "tools" || k === "input" || k === "tool_choice") {
            try { obj[k] = JSON.parse(v) } catch { obj[k] = v }
          } else {
            obj[k] = v
          }
          continue
        }
        const f = v as File
        const mime = f.type || mimelookup(f.name || "file")
        const b64 = Buffer.from(await f.arrayBuffer()).toString("base64")
        if (mime.startsWith("image/")) {
          imageparts.push({ type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } })
        } else {
          fileparts.push({ type: "text", text: `[attachment: ${f.name || "file"} (${mime}, ${f.size} bytes, base64 ${b64.slice(0, 64)}...)]` })
        }
      }
      // attach the multimodal parts to the last user message when present
      if ((imageparts.length > 0 || fileparts.length > 0) && Array.isArray(obj.messages)) {
        const msgs = obj.messages as Array<Record<string, unknown>>
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role === "user") {
            const existing = typeof msgs[i].content === "string"
              ? [{ type: "text", text: msgs[i].content as string }]
              : Array.isArray(msgs[i].content)
                ? msgs[i].content
                : [{ type: "text", text: "" }]
            msgs[i].content = [...(existing as Array<Record<string, unknown>>), ...imageparts, ...fileparts]
            break
          }
        }
      } else if ((imageparts.length > 0 || fileparts.length > 0) && typeof obj.prompt === "string") {
        obj.messages = [{ role: "user", content: [{ type: "text", text: obj.prompt as string }, ...imageparts, ...fileparts] }]
      }
      return obj
    }
    if (ct.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(await req.text())
      const obj: Record<string, unknown> = {}
      params.forEach((v, k) => {
        if (k === "model" || k === "messages" || k === "tools" || k === "input" || k === "tool_choice") {
          try { obj[k] = JSON.parse(v) } catch { obj[k] = v }
        } else {
          obj[k] = v
        }
      })
      return obj
    }
    const text = await req.text()
    try { return JSON.parse(text) as Record<string, unknown> } catch { return { prompt: text } }
  } catch {
    return {}
  }
}

// ── robust sse proxy ───────────────────────────────────

/** streamproxy — the robust sse proxy loop this route owns
 * holds the connection from the first byte (keepalive comments at 200ms
 * instead of after 1000ms of silence), aborts the upstream when the client
 * disconnects (no leaked upstream requests feeding reconnect storms),
 * applies a connect timeout with fallback attempts, dedupes the upstream
 * terminator so exactly one [done] ever reaches the client and reports
 * failures as proper openai error frames instead of fake content chunks */
interface upstreamattempt {
  endpoint: string
  headers: Record<string, string>
  body: string
  label: string
  nexton?: number[]
}
interface proxyerrorinfo {
  stage: "connect" | "stream"
  message: string
  status: number | null
  provider: string
}
interface streamproxyoptions {
  attempts: upstreamattempt[]
  format?: "sse" | "ndjson"
  connecttimeoutms?: number
  keepalivems?: number
  emitdone?: boolean
  initial?: (emit: (chunk: string) => void) => void
  onframe?: (emit: (chunk: string) => void, frame: string, provider: string) => void
  final?: (emit: (chunk: string) => void, ok: boolean) => void
  onerror?: (emit: (chunk: string) => void, err: proxyerrorinfo) => void
  onfinish?: (info: { provider: string; ok: boolean; status: number | null; errormessage?: string }) => Promise<void> | void
}

/** defaultnexton — fallback statuses (400 included: the responses endpoint
 * model mismatch answered 400 with no fallback and stranded rotated
 * requests; 401 403 cover upstream auth loss; 408 504 cover timeouts) */
const defaultnexton = [400, 401, 403, 404, 408, 429, 500, 502, 503, 504, 529]

function streamproxy(o: streamproxyoptions): ReadableStream {
  const format = o.format ?? "sse"
  const emitdone = o.emitdone ?? true
  const connecttimeout = o.connecttimeoutms ?? 30000
  const keepalive = o.keepalivems ?? 200
  let cancelled = false
  let lastwrite = Date.now()
  let doneseen = false
  let activeprovider = o.attempts[0]?.label ?? "upstream"
  const masterac = new AbortController()
  let readerref: ReadableStreamDefaultReader<Uint8Array> | null = null
  let cleanupfn: (() => void) | null = null
  let finished = false

  const emiterror = (emit: (chunk: string) => void, err: proxyerrorinfo): void => {
    if (o.onerror) o.onerror(emit, err)
    else defaultproxyerror(emit, format, err)
  }

  return new ReadableStream({
    async start(controller) {
      const emit = (chunk: string): void => {
        if (cancelled) return
        if (safeenqueue(controller, chunk)) lastwrite = Date.now()
      }

      // keepalive from the first byte — the comment is invisible to every
      // sse parser and holds the connection open while the upstream connects
      const kainterval = setInterval(() => {
        if (cancelled) return
        if (Date.now() - lastwrite >= keepalive) {
          if (safeenqueue(controller, ": ka\n\n")) lastwrite = Date.now()
        }
      }, keepalive)

      const cleanup = () => {
        clearInterval(kainterval)
        cleanupfn = null
      }
      cleanupfn = cleanup

      const finish = async (ok: boolean, status: number | null, errormessage?: string): Promise<void> => {
        if (finished) return
        finished = true
        try {
          if (!cancelled) {
            o.final?.(emit, ok)
            if (emitdone) writedone(controller, format)
          }
        } catch {
          // never fail on final emission
        } finally {
          cleanup()
          safeclose(controller)
          try {
            await o.onfinish?.({ provider: activeprovider, ok, status, errormessage })
          } catch {
            // never surface onfinish failures
          }
        }
      }

      try {
        // initial frames (role chunk / message_start) go out before any
        // upstream traffic so the client sees a live stream immediately
        o.initial?.(emit)

        let response: Response | null = null
        let laststatus: number | null = null
        let lasterr = ""

        for (const attempt of o.attempts) {
          if (cancelled) return
          activeprovider = attempt.label
          // each attempt gets its own abort controller chained to the
          // master so client cancel and connect timeout both cut it while
          // a successful response keeps the body stream abortable by cancel
          const attemptac = new AbortController()
          const oncancel = () => attemptac.abort()
          masterac.signal.addEventListener("abort", oncancel, { once: true })
          const timer = setTimeout(() => attemptac.abort(), connecttimeout)
          try {
            const r = await fetch(attempt.endpoint, {
              method: "POST",
              headers: attempt.headers,
              body: attempt.body,
              signal: attemptac.signal,
            })
            laststatus = r.status
            if (r.ok && r.body) {
              response = r
              break
            }
            lasterr = `${attempt.label} ${r.status}`
            const txt = await r.text().catch(() => "")
            if (txt) lasterr += ` ${txt.slice(0, 300)}`
            const nexton = attempt.nexton ?? defaultnexton
            if (!nexton.includes(r.status)) {
              emiterror(emit, { stage: "connect", message: lasterr, status: r.status, provider: attempt.label })
              await finish(false, r.status, lasterr)
              return
            }
          } catch (e) {
            if (cancelled) return
            laststatus = null
            lasterr = `${attempt.label} ${String(e)}`.slice(0, 400)
          } finally {
            clearTimeout(timer)
            masterac.signal.removeEventListener("abort", oncancel)
          }
        }

        if (cancelled) return
        if (!response || !response.body) {
          emiterror(emit, { stage: "connect", message: lasterr || "all upstreams failed", status: laststatus, provider: activeprovider })
          await finish(false, laststatus, lasterr)
          return
        }

        const reader = response.body.getReader()
        readerref = reader
        const decoder = new TextDecoder()
        let buf = ""
        while (true) {
          if (cancelled) break
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const { frames, residual } = parsesseframes(buf)
          buf = residual
          for (const frame of frames) {
            if (cancelled) break
            if (discardheartbeat(frame)) continue
            // dedupe the terminator: the proxy owns the single [done] frame
            const raw = frame.trim()
            const rawdata = raw.replace(/^data:\s*/i, "")
            if (isdone(rawdata)) {
              doneseen = true
              continue
            }
            o.onframe?.(emit, frame, activeprovider)
          }
        }
        // flush a residual trailing frame without the double newline
        if (buf && !cancelled && !discardheartbeat(buf)) {
          const raw = buf.trim()
          const rawdata = raw.replace(/^data:\s*/i, "")
          if (!isdone(rawdata)) o.onframe?.(emit, buf, activeprovider)
        }
        await finish(true, 200)
      } catch (e) {
        if (cancelled) return
        emiterror(emit, { stage: "stream", message: String(e), status: null, provider: activeprovider })
        await finish(false, null, String(e))
      } finally {
        cleanup()
      }
    },
    cancel() {
      cancelled = true
      masterac.abort()
      try {
        readerref?.cancel()
      } catch {
        // reader already released
      }
      cleanupfn?.()
    },
  })
}

/** defaultproxyerror — openai shaped error frame for sse and ndjson */
function defaultproxyerror(
  emit: (chunk: string) => void,
  format: "sse" | "ndjson",
  err: proxyerrorinfo,
): void {
  const payload = openaierror(
    err.message,
    err.stage === "connect" ? "upstream_error" : "stream_error",
    err.stage === "connect" ? "upstream_unavailable" : "stream_interrupted",
  )
  if (format === "sse") {
    emit(`event: error\ndata: ${safestringify(payload)}\n\n`)
  } else {
    emit(safestringify(payload) + "\n")
  }
}

// ─── self-contained gateway core ────────────────────────── (inline end)


/** user agent — anonymous browser like header for free gateways */
const ua = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36"

/** chat pool — dynamic free-model discovery snapshot. the array is mutated
 * in place (length = 0 + push) so the rotation instance, which holds the
 * reference, always sees the current discovered pool — never a hardcoded list */
const chatpool: string[] = []

/** rotation — one model per stretch of 6 messages per session */
const rotation = new sessionrotation(chatpool, 6)

/** catalog snapshot — merged discovered free models, the universal devthink
 * context budget and the derived defaults, refreshed per request */
let catsync: { id: string; provider: "opencode" | "kilo"; context: number; maxoutput: number }[] = []
let budgetsync = devthinkcontextwindow([])
let defaultssync = { primary: "", fallback: "", primaryprovider: "opencode" as "opencode" | "kilo", fallbackprovider: "kilo" as "opencode" | "kilo" }

/** refreshcatalog — pull the discovered free catalog (cached upstream, 5
 * minute ttl) and rebuild pool + budget + derived defaults. called at the
 * top of every request; cheap after the first fetch */
async function refreshcatalog(): Promise<void> {
  const cat = await getv4catalog()
  catsync = [...cat.opencode, ...cat.kilo]
  chatpool.length = 0
  chatpool.push(...catsync.map((m) => m.id))
  budgetsync = devthinkcontextwindow(catsync)
  defaultssync = v4derivedefaults(cat)
}

/** lookup — resolve any requested model id to its upstream endpoint */
function lookup(modelid: string): { id: string; provider: "opencode" | "kilo"; endpoint: string } | null {
  const m = catsync.find((x) => x.id === modelid)
  if (!m) return null
  const endpoint = m.provider === "opencode" ? `${opencodezenbase}/chat/completions` : `${kilobase}/chat/completions`
  return { id: m.id, provider: m.provider, endpoint }
}

/** resolve — explicit model lookup first, devthink meta rotation otherwise.
 * null only when discovery found no free models at all; callers answer 503 */
function resolve(modelid: string | undefined, sessionid: string): { id: string; provider: "opencode" | "kilo"; endpoint: string; rotated: boolean } | null {
  if (modelid && modelid !== devthinkid) {
    const found = lookup(modelid)
    if (found) return { id: found.id, provider: found.provider, endpoint: found.endpoint, rotated: false }
  }
  const rotatedid = rotation.next(sessionid)
  const found = lookup(rotatedid)
  if (found) return { id: found.id, provider: found.provider, endpoint: found.endpoint, rotated: true }
  const primary = lookup(defaultssync.primary)
  if (primary) return { id: primary.id, provider: primary.provider, endpoint: primary.endpoint, rotated: true }
  return null
}

/** fallback — the other provider's derived default when the primary strand fails */
function fallbackfor(primary: "opencode" | "kilo"): { id: string; provider: "opencode" | "kilo"; endpoint: string } {
  const pick = primary === "kilo" ? defaultssync.primary : defaultssync.fallback
  const found = lookup(pick)
  if (found) return { id: found.id, provider: found.provider, endpoint: found.endpoint }
  const mirror = lookup(primary === "kilo" ? defaultssync.fallback : defaultssync.primary)
  if (mirror) return { id: mirror.id, provider: mirror.provider, endpoint: mirror.endpoint }
  return { id: "", provider: primary, endpoint: primary === "opencode" ? `${opencodezenbase}/chat/completions` : `${kilobase}/chat/completions` }
}

/** convertinput — convert responses api input to chat messages
 * string input and text items flatten naturally; function_call items become
 * assistant tool_calls and function_call_output items become tool role
 * messages (the old flatten dropped the tool contract); image parts survive
 * as image_url multimodal parts */
function convertinput(input: unknown): unknown[] {
  if (typeof input === "string") return [{ role: "user", content: input }]
  if (!Array.isArray(input)) return [{ role: "user", content: safestringify(input) }]
  const out: unknown[] = []
  for (const raw of input) {
    const m = raw as Record<string, unknown>
    if (m.type === "function_call") {
      out.push({
        role: "assistant",
        content: null,
        tool_calls: [{
          id: typeof m.call_id === "string" ? m.call_id : `call_${Date.now().toString(36)}`,
          type: "function",
          function: { name: typeof m.name === "string" ? m.name : "unknown_tool", arguments: typeof m.arguments === "string" ? m.arguments : "{}" },
        }],
      })
      continue
    }
    if (m.type === "function_call_output") {
      out.push({ role: "tool", tool_call_id: typeof m.call_id === "string" ? m.call_id : "", content: typeof m.output === "string" ? m.output : safestringify(m.output ?? "") })
      continue
    }
    // message item with content blocks
    const role = m.role === "assistant" ? "assistant" : "user"
    if (typeof m.content === "string") {
      out.push({ role, content: m.content })
      continue
    }
    if (Array.isArray(m.content)) {
      const blocks = m.content as Array<Record<string, unknown>>
      const texts = blocks.map((b) => (typeof b.text === "string" ? b.text : "")).filter(Boolean)
      const images = blocks.filter((b) => b.type === "image_url" || b.type === "input_image" || (b.image_url && typeof b.image_url === "object"))
      if (images.length > 0) {
        const parts: Array<Record<string, unknown>> = []
        if (texts.length > 0) parts.push({ type: "text", text: texts.join("\n") })
        for (const im of images) {
          if (im.type === "image_url" && im.image_url) parts.push(im as Record<string, unknown>)
          else if (im.type === "input_image" && typeof im.image_url === "string") parts.push({ type: "image_url", image_url: { url: im.image_url } })
        }
        out.push({ role, content: parts })
        continue
      }
      out.push({ role, content: texts.join("\n") })
      continue
    }
    out.push({ role, content: safestringify(m.content) })
  }
  return out
}

/** savemsg — log to db never throws */
async function savemsg(data: Record<string, unknown>): Promise<void> {
  try {
    await db.chatMessage.create({ data: data as never })
  } catch {
    // never throw on db errors
  }
}

/** esttokens — cheap token estimate (~4 chars per token) over a message array */
function esttokens(messages: unknown[]): number {
  let chars = 0
  for (const m of messages) {
    if (m && typeof m === "object") {
      const c = (m as Record<string, unknown>).content
      if (typeof c === "string") chars += c.length
      else if (Array.isArray(c)) {
        for (const b of c) {
          if (typeof b === "string") chars += b.length
          else if (b && typeof b === "object") chars += String((b as Record<string, unknown>).text ?? "").length
        }
      }
      chars += String((m as Record<string, unknown>).role ?? "").length
    } else if (typeof m === "string") {
      chars += m.length
    }
  }
  return Math.ceil(chars / 4)
}

/** persistcontext — the devthink meta unifies the session context and sends
 * it to the db (SessionContext). never throws. */
async function persistcontext(sessionid: string, route: string, modelused: string, pool: unknown[]): Promise<void> {
  try {
    const summary = safestringify(pool).slice(0, 2000)
    await db.sessionContext.upsert({
      where: { sessionId_provider: { sessionId: sessionid, provider: "free" } },
      create: {
        sessionId: sessionid,
        provider: "free",
        route,
        model: devthinkid,
        modelVariant: modelused,
        inputSummary: summary,
        messageCount: Array.isArray(pool) ? pool.length : 0,
        lastMessageAt: new Date(),
        contextWindow: budgetsync.usableinput,
      },
      update: {
        route,
        modelVariant: modelused,
        inputSummary: summary,
        messageCount: Array.isArray(pool) ? pool.length : 0,
        lastMessageAt: new Date(),
        contextWindow: budgetsync.usableinput,
      },
    })
  } catch {
    // never throw on db errors
  }
}

/** unifycontext — clamp the request context into the universal devthink
 * budget (usableinput = min(context) - min(maxoutput) - 2% overhead),
 * trimming oldest non-system messages first, then persist the unified
 * snapshot to the db. operates on the body in place so the clamped
 * context is exactly what goes upstream. */
async function unifycontext(body: Record<string, unknown>, sessionid: string, route: string, modelused: string): Promise<void> {
  try {
    let arr: unknown[] | null = Array.isArray(body.messages) ? body.messages : null
    if (!arr && Array.isArray(body.input)) arr = body.input
    if (arr) {
      if (esttokens(arr) > budgetsync.usableinput) {
        const sys = arr.filter((m) => (m as Record<string, unknown>)?.role === "system")
        const rest = arr.filter((m) => (m as Record<string, unknown>)?.role !== "system")
        while (rest.length && esttokens([...sys, ...rest]) > budgetsync.usableinput) rest.shift()
        arr.length = 0
        arr.push(...sys, ...rest)
      }
      await persistcontext(sessionid, route, modelused, arr)
      return
    }
    const strfield = typeof body.input === "string" ? "input" : typeof body.prompt === "string" ? "prompt" : null
    if (strfield) {
      const maxchars = budgetsync.usableinput * 4
      if (String(body[strfield]).length > maxchars) {
        body[strfield] = String(body[strfield]).slice(String(body[strfield]).length - maxchars)
      }
      await persistcontext(sessionid, route, modelused, [{ role: "user", content: String(body[strfield]) }])
    }
  } catch {
    // never throw on context unification
  }
}

/** post — openai responses handler */
export async function POST(req: NextRequest): Promise<Response> {
  const cors = handlecors(req)
  if (cors) return cors
  const ip = getip(req)
  const requestid = genid("req")
  const sessionid = req.headers.get("x-session-id") || genid("sess")
  const chatid = (req.headers.get("x-chat-id") || genid("chat")) as string

  const body = await parsebody(req)

  const messages = convertinput(body.input)
  if (messages.length === 0) {
    return Response.json(openaierror("input required", "invalid_request_error", "input_required"), { status: 400, headers: corsheaders })
  }

  // dynamic free catalog — refreshed per request from the discovery cache;
  // zero hardcoded model names, the pool is whatever opencode zen and kilo
  // currently publish with the free tag (-free / :free / /free / free prefix)
  await refreshcatalog()
  if (catsync.length === 0) {
    return Response.json(
      openaierror("free model catalog unavailable - discovery failed, retry shortly", "upstream_error", "catalog_unavailable"),
      { status: 503, headers: corsheaders },
    )
  }
  const requestedid = (body.model as string) || devthinkid
  const isfree = requestedid === devthinkid || catsync.some((m) => m.id === requestedid)
  if (!isfree) {
    return Response.json(
      openaierror(`model ${requestedid} is not in the discovered free catalog`, "invalid_request_error", "model_not_free"),
      { status: 403, headers: corsheaders },
    )
  }

  const wantstream = body.stream === true || body.stream === "true"
  const format = detectcontenttype(req)
  const resolved = resolve(requestedid, sessionid)
  if (!resolved) {
    return Response.json(
      openaierror("free model catalog unavailable - discovery failed, retry shortly", "upstream_error", "catalog_unavailable"),
      { status: 503, headers: corsheaders },
    )
  }
  const maskedmodel = devthinkid
  const id = genid("resp")
  const fallback = fallbackfor(resolved.provider)

  // devthink meta — unify the context into the universal budget and persist to db
  await unifycontext(body, sessionid, "/v4/responses", resolved.id)

  const upbody: Record<string, unknown> = {
    model: resolved.id,
    messages,
    max_tokens: automaxtokens(body.max_tokens ?? body.maxTokens ?? body.max_output_tokens, defaultmaxtokens),
    temperature: autotemp(body.temperature),
    top_p: autotopp(body.top_p ?? body.topP),
    n: auton(body.n),
    frequency_penalty: autofrequencypenalty(body.frequency_penalty ?? body.frequencyPenalty),
    presence_penalty: autopresencepenalty(body.presence_penalty ?? body.presencePenalty),
    stream: wantstream,
  }
  const seed = body.seed !== undefined ? autoseed(body.seed) : 0
  if (seed) upbody.seed = seed
  const thinklevel = autothinking((body.reasoning_level ?? body.thinking_level ?? body.level) as string | undefined)
  if (thinklevel !== "high" && (body.reasoning_level || body.thinking_level || body.level)) {
    upbody.reasoning = thinklevel
  }
  // forward tools (responses api format to openai function format) so
  // capable upstreams emit native tool_calls instead of text templates
  const hastools = Array.isArray(body.tools) && (body.tools as unknown[]).length > 0
  if (hastools) {
    upbody.tools = (body.tools as Array<Record<string, unknown>>).map((t) => {
      const name = (t.name ?? (t.function as Record<string, unknown>)?.name ?? "unknown_tool") as string
      const desc = ((t.description ?? (t.function as Record<string, unknown>)?.description ?? "") as string)
      const params = (t.parameters ?? (t.function as Record<string, unknown>)?.parameters ?? { type: "object", properties: {} }) as Record<string, unknown>
      return { type: "function", function: { name, description: desc, parameters: params } }
    })
    if (body.tool_choice !== undefined) upbody.tool_choice = body.tool_choice
  }

  if (!wantstream) {
    const attempts = [
      { endpoint: resolved.endpoint, headers: { "content-type": "application/json", accept: "application/json", "user-agent": ua }, body: safestringify({ ...upbody, model: resolved.id, stream: false }), label: resolved.provider },
      { endpoint: fallback.endpoint, headers: { "content-type": "application/json", accept: "application/json", "user-agent": ua }, body: safestringify({ ...upbody, model: fallback.id, stream: false }), label: fallback.provider },
    ]
    const tryfetch = async (a: upstreamattempt): Promise<Response> => {
      const ac = new AbortController()
      const timer = setTimeout(() => ac.abort(), 60000)
      try {
        return await fetch(a.endpoint, { method: "POST", headers: a.headers, body: a.body, signal: ac.signal })
      } finally {
        clearTimeout(timer)
      }
    }
    try {
      let r = await tryfetch(attempts[0])
      const nexton = [400, 401, 403, 404, 408, 429, 500, 502, 503, 504, 529]
      if (!r.ok && nexton.includes(r.status)) {
        r = await tryfetch(attempts[1])
      }
      if (!r.ok) {
        const txt = await r.text().catch(() => "")
        return Response.json(
          openaierror(`upstream ${r.status} ${txt.slice(0, 300)}`, "upstream_error", "upstream_unavailable"),
          { status: 502, headers: corsheaders },
        )
      }
      const text = await r.text()
      const masked = text.replace(/"model"\s*:\s*"[^"]*"/g, `"model":"${maskedmodel}"`)
      const parsed = safejsonparse(masked)
      // an ok status carrying an upstream error body (kilo wraps provider
      // failures as 200 + error payload) is still a failure — surface it as
      // a proper openai error, never a fake 200 success the client would
      // mark retryable false
      const errbody = parsed as Record<string, unknown> | null
      if (errbody && !Array.isArray(errbody.choices) && errbody.error) {
        const er = errbody.error as unknown
        const msg = typeof er === "string" ? er : safestringify(er).slice(0, 300)
        return Response.json(openaierror(`upstream error: ${msg}`, "upstream_error", "upstream_unavailable"), { status: 502, headers: corsheaders })
      }
      if (!parsed) return new Response(masked, { status: 200, headers: corsheaders })
      const obj = parsed as Record<string, unknown>
      const choice = (obj.choices as Array<Record<string, unknown>>)?.[0]
      const message = choice?.message as Record<string, unknown> | undefined
      let contenttext = (typeof message?.content === "string" ? message.content : safestringify(message?.content ?? "")) as string
      const reasoning = (typeof message?.reasoning_content === "string" ? message.reasoning_content : "") as string
      // scrub leaked tool tags from the non stream content
      const leak = new toolleakfilter(hastools)
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
      // convert openai response to responses api format
      const resp = {
        id,
        object: "response",
        created_at: Math.floor(Date.now() / 1000),
        model: maskedmodel,
        output: [
          {
            type: "message",
            id: genid("msg"),
            role: "assistant",
            status: "completed",
            content: [
              ...(reasoning ? [{ type: "reasoning", summary: [{ type: "summary_text", text: reasoning }] }] : []),
              { type: "output_text", text: contenttext },
            ],
          },
          ...(Array.isArray(message?.tool_calls)
            ? (message.tool_calls as Array<Record<string, unknown>>).map((tc) => {
                const fn = tc.function as Record<string, unknown> | undefined
                return {
                  type: "function_call",
                  id: `fc_${typeof tc.id === "string" ? tc.id : Date.now().toString(36)}`,
                  call_id: typeof tc.id === "string" ? tc.id : `call_${Date.now().toString(36)}`,
                  name: typeof fn?.name === "string" ? fn.name : "unknown_tool",
                  arguments: typeof fn?.arguments === "string" ? fn.arguments : "{}",
                  status: "completed",
                }
              })
            : []),
        ],
        status: "completed",
        usage: {
          input_tokens: ((obj.usage as Record<string, number>)?.prompt_tokens) || 0,
          output_tokens: ((obj.usage as Record<string, number>)?.completion_tokens) || 0,
          total_tokens: ((obj.usage as Record<string, number>)?.total_tokens) || 0,
        },
      }
      await savemsg({
        chatId: chatid,
        chatSubId: requestid,
        provider: resolved.provider,
        route: "/v4/responses",
        model: maskedmodel,
        role: "assistant",
        content: contenttext,
        reasoningContent: reasoning || null,
        ip,
        finishReason: "stop",
        durationMs: 0,
        allParams: safestringify(body),
        allResponse: safestringify(resp),
      })
      return Response.json(resp, { headers: corsheaders })
    } catch (e) {
      return Response.json(
        openaierror(`upstream call failed: ${String(e)}`, "upstream_error", "fetch_failed"),
        { status: 502, headers: corsheaders },
      )
    }
  }

  // streaming — the robust proxy core converts upstream chunks to responses
  // api events (tool_calls become function_call items; the terminator is
  // response.completed — the old stream appended a lowercase [done] frame
  // and an untyped raw chunk after it)
  const totals = { content: "", reasoning: "" }
  const leak = new toolleakfilter(hastools)
  const toolitems: Array<{ call_id: string; name: string; arguments: string }> = []
  let calledtools = false

  const remit = (emit: (chunk: string) => void, event: string, payload: Record<string, unknown>): void => {
    const out = safestringify(payload)
    if (format === "ndjson") emit(out + "\n")
    else emit(`event: ${event}\ndata: ${out}\n\n`)
  }

  const emitfunctioncall = (emit: (chunk: string) => void, callid: string, name: string, args: string): void => {
    calledtools = true
    toolitems.push({ call_id: callid, name, arguments: args || "{}" })
    remit(emit, "response.output_item.added", {
      type: "response.output_item.added",
      output_index: toolitems.length - 1,
      item: { type: "function_call", id: `fc_${callid}`, call_id: callid, name, arguments: args || "{}", status: "in_progress" },
    })
    remit(emit, "response.function_call_arguments.delta", {
      type: "response.function_call_arguments.delta",
      item_id: `fc_${callid}`,
      output_index: toolitems.length - 1,
      delta: args || "{}",
    })
    remit(emit, "response.output_item.done", {
      type: "response.output_item.done",
      output_index: toolitems.length - 1,
      item: { type: "function_call", id: `fc_${callid}`, call_id: callid, name, arguments: args || "{}", status: "completed" },
    })
  }

  const stream = streamproxy({
    attempts: [
      { endpoint: resolved.endpoint, headers: { "content-type": "application/json", accept: "text/event-stream", "user-agent": ua }, body: safestringify({ ...upbody, model: resolved.id, stream: true }), label: resolved.provider },
      { endpoint: fallback.endpoint, headers: { "content-type": "application/json", accept: "text/event-stream", "user-agent": ua }, body: safestringify({ ...upbody, model: fallback.id, stream: true }), label: fallback.provider },
    ],
    format: format === "ndjson" ? "ndjson" : "sse",
    connecttimeoutms: 30000,
    keepalivems: 200,
    emitdone: false, // response.completed is the responses api terminator
    initial: (emit) => {
      remit(emit, "response.created", {
        type: "response.created",
        response: { id, object: "response", status: "in_progress", model: maskedmodel, output: [] },
      })
    },
    onframe: (emit, frame) => {
      const masked = frame.replace(/"model"\s*:\s*"[^"]*"/g, `"model":"${maskedmodel}"`)
      const data = extractdata(masked)
      if (!data) return
      const parsed = safejsonparse<Record<string, unknown>>(data)
      if (!parsed) return
      const choices = Array.isArray(parsed.choices) ? (parsed.choices as Array<Record<string, unknown>>) : []
      for (const choice of choices) {
        const delta = choice.delta as Record<string, unknown> | undefined
        if (!delta) continue
        if (typeof delta.content === "string" && delta.content) {
          const res = leak.push(delta.content)
          if (res.content) {
            totals.content += res.content
            remit(emit, "response.output_text.delta", { type: "response.output_text.delta", delta: res.content })
          }
          for (const tc of res.toolcalls) emitfunctioncall(emit, tc.id, tc.name, tc.arguments)
        }
        if (typeof delta.reasoning_content === "string" && delta.reasoning_content) {
          totals.reasoning += delta.reasoning_content
          remit(emit, "response.reasoning.delta", { type: "response.reasoning.delta", delta: delta.reasoning_content })
        }
        if (Array.isArray(delta.tool_calls)) {
          for (const raw of delta.tool_calls as Array<Record<string, unknown>>) {
            const fn = raw.function as Record<string, unknown> | undefined
            const tcid = typeof raw.id === "string" && raw.id ? raw.id : `call_${toolitems.length}`
            const name = typeof fn?.name === "string" && fn.name ? fn.name : "unknown_tool"
            const args = typeof fn?.arguments === "string" ? fn.arguments : "{}"
            emitfunctioncall(emit, tcid, name, args)
          }
        }
      }
    },
    final: (emit) => {
      const res = leak.flush()
      if (res.content) {
        totals.content += res.content
        remit(emit, "response.output_text.delta", { type: "response.output_text.delta", delta: res.content })
      }
      for (const tc of res.toolcalls) emitfunctioncall(emit, tc.id, tc.name, tc.arguments)
      remit(emit, "response.completed", {
        type: "response.completed",
        response: {
          id,
          object: "response",
          status: "completed",
          model: maskedmodel,
          output: [
            ...(totals.reasoning ? [{ type: "reasoning", summary: [] }] : []),
            { type: "message", role: "assistant", content: [{ type: "output_text", text: totals.content }] },
            ...toolitems.map((tc) => ({ type: "function_call", id: `fc_${tc.call_id}`, call_id: tc.call_id, name: tc.name, arguments: tc.arguments, status: "completed" })),
          ],
          usage: {
            input_tokens: 0,
            output_tokens: Math.ceil((totals.content.length + totals.reasoning.length) / 4),
            total_tokens: Math.ceil((totals.content.length + totals.reasoning.length) / 4),
          },
        },
      })
    },
    onerror: (emit, err) => {
      remit(emit, "error", { type: "error", error: { type: "upstream_error", message: err.message.slice(0, 500) } })
    },
    onfinish: async (info) => {
      await savemsg({
        chatId: chatid,
        chatSubId: requestid,
        provider: info.provider,
        route: "/v4/responses",
        model: maskedmodel,
        role: "assistant",
        content: totals.content,
        reasoningContent: totals.reasoning,
        ip,
        finishReason: "stop",
        durationMs: 0,
        allParams: safestringify(body),
        allResponse: safestringify({ ok: info.ok, status: info.status, toolcalls: toolitems.length }),
      })
    },
  })

  const headers = format === "ndjson" ? { ...corsheaders, "content-type": "application/x-ndjson" } : format === "sse" ? sseheaders() : jsonheaders()
  return new Response(stream, { headers })
}

/** get — info endpoint */
export async function GET(req: NextRequest): Promise<Response> {
  const cors = handlecors(req)
  if (cors) return cors
  return Response.json({
    object: "v4.responses",
    provider: "opencode-zen+kilo",
    auth: "anonymous free tier no api key",
    pattern: "openai responses api converted to chat completions for opencode or kilo upstream",
    bases: { opencode: opencodezenbase, kilo: kilobase },
    metamodel: devthinkid,
    rotation: { pool: chatpool.length, every: 6, unit: "messages per session" },
    fallback: { statuses: [400, 401, 403, 404, 408, 429, 500, 502, 503, 504, 529] },
    robustness: { keepalive: "200ms comments from first byte", connecttimeout: "30s per attempt", terminator: "response.completed with no stray data after it", clientcancel: "aborts upstream", errors: "responses error events" },
    endpoints: ["/v4/responses", "/v4/models", "/v4/chat/completions", "/v4/completions", "/v4/messages", "/v4/embeddings", "/v4/keys"],
  }, { headers: corsheaders })
}

/** options — preflight and info */
export async function OPTIONS(req: NextRequest): Promise<Response> {
  const cors = handlecors(req)
  if (cors) return cors
  return GET(req)
}
