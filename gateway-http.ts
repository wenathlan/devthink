/**
 * http — universal http transport for the gateway library
 * one file one responsibility — only the http transport lives here
 * 0 to 100 correlated logics grouped in this one file — the http
 * server and the http stream are the same transport context so they
 * are embedded together (per the one-variation-per-context rule)
 *
 * two halves one file:
 *   http stream — sse and ndjson utilities
 *     makestreamresponse wraps any upstream response into a gateway response with:
 *       byte passthrough — raw bytes forwarded unchanged when no masking
 *       sse frame parsing — parsesseframes splits on double newline
 *       heartbeat discard — upstream keepalive comments dropped
 *       model masking — regex replaces model ids with the meta id
 *       keepalive injection — downstream ka comments every 200ms
 *       tracking — collects content reasoning usage for persistence
 *
 *     works for any upstream — nvidia opencode kilo openrouter or custom
 *
 *   http server — universal hono node server
 *     reads the user config from web/config.ts (or gateway.config.ts)
 *     creates one engine per configured version
 *     registers all 7 routes per version — v1 through v9 and beyond
 *
 *     route mapping per version n:
 *       get  /api/vN/{keys,models,chat/completions,completions,messages,responses,embeddings} -> handleinfo
 *       post /api/vN/keys -> handlekeys
 *       post /api/vN/models -> handlemodels
 *       post /api/vN/chat/completions -> handlechatcompletions
 *       post /api/vN/completions -> handlecompletions
 *       post /api/vN/messages -> handlemessages
 *       post /api/vN/responses -> handleresponses
 *       post /api/vN/embeddings -> handleembeddings
 *       options /api/x -> 204 no content with cors headers
 *
 *     serves the static web ui from dist/ after vite build
 *     runs standalone on any node host — vercel netlify render fly — no platform functions
 */

import { corsheaders, ctndjson, ctsse, safejsonparse, safestringify } from "./utils";

/** ka ms — keepalive interval milliseconds 200ms */
export const kams = 200;

/** ka suppress ms — suppress keepalive when data written recently */
export const kasuppressms = 1000;

/** sse headers — headers for sse streaming with x accel buffering no */
export function sseheaders(): Record<string, string> {
  return {
    ...corsheaders,
    "content-type": ctsse,
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "x-accel-buffering": "no",
  };
}

/** ndjson headers */
export function ndjsonheaders(): Record<string, string> {
  return {
    ...corsheaders,
    "content-type": ctndjson,
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
  };
}

/** writeevent — write a single sse event to a controller */
export function writeevent(
  controller: ReadableStreamDefaultController,
  event: string | null,
  data: unknown,
  format: "sse" | "ndjson" | "json" | "plain" | "octet" = "sse",
): void {
  const datastr = typeof data === "string" ? data : safestringify(data);
  if (format === "ndjson") {
    controller.enqueue(`${datastr}\n`);
  } else if (format === "plain") {
    controller.enqueue(`${datastr}`);
  } else if (format === "sse") {
    const parts: string[] = [];
    if (event) parts.push(`event: ${event}`);
    parts.push(`data: ${datastr}`);
    parts.push("");
    parts.push("");
    controller.enqueue(parts.join("\n"));
  } else {
    controller.enqueue(`${datastr}`);
  }
}

/** writekeepalive — write a keepalive comment invisible to sse and ndjson parsers */
export function writekeepalive(controller: ReadableStreamDefaultController): void {
  controller.enqueue(": ka\n\n");
}

/** writedone — write the terminal done marker */
export function writedone(
  controller: ReadableStreamDefaultController,
  format: "sse" | "ndjson" | "json" | "plain" | "octet" = "sse",
): void {
  if (format === "sse") {
    controller.enqueue("data: [done]\n\n");
  } else if (format === "ndjson") {
    controller.enqueue('{"done":true}\n');
  }
}

/** safeenqueue — enqueue to controller catching errors */
export function safeenqueue(controller: ReadableStreamDefaultController, chunk: string): boolean {
  try {
    controller.enqueue(chunk);
    return true;
  } catch {
    return false;
  }
}

/** safeclose — close a controller catching errors */
export function safeclose(controller: ReadableStreamDefaultController): void {
  try {
    controller.close();
  } catch {
    // already closed
  }
}

/** maskmodel — pure byte regex mask model name to the target id */
export function maskmodel(chunk: string, target = "devthink"): string {
  const pattern = /"model"\s*:\s*"[^"]*"/g;
  return chunk.replace(pattern, `"model":"${target}"`);
}

/** discardheartbeat — check if a line is an sse heartbeat comment
 * the empty-data comparison runs on the trimmed line: "data: " and
 * "data:" both trim to "data:" so the untrimmed spelling never matched */
export function discardheartbeat(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith(":") || trimmed === "" || trimmed === "event: ping" || trimmed === "data:"
  );
}

/** parsesseframes — split buffer on double newline returns complete frames plus residual */
export function parsesseframes(buffer: string): { frames: string[]; residual: string } {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const frames: string[] = [];
  let last = 0;
  for (
    let idx = normalized.indexOf("\n\n", last);
    idx !== -1;
    idx = normalized.indexOf("\n\n", last)
  ) {
    frames.push(normalized.slice(last, idx));
    last = idx + 2;
  }
  const residual = normalized.slice(last);
  return { frames, residual };
}

/** extractdata — extract data lines from an sse frame */
export function extractdata(frame: string): string | null {
  const lines = frame.split("\n");
  const dataLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }
  if (dataLines.length === 0) return null;
  const joined = dataLines.join("\n");
  // the done marker is case-insensitive: upstreams emit both [DONE]
  // (openai) and [done] (misc gateways)
  return isdone(joined) ? null : joined;
}

/** isdone — check if a data string is the done marker
 * case-insensitive: openai emits [DONE] others emit [done] */
export function isdone(data: string): boolean {
  const trimmed = data.trim().toLowerCase();
  return trimmed === "[done]" || trimmed === "data: [done]" || trimmed === "done";
}

/** makechunk — build a minimal openai compatible chat completion chunk */
export function makechunk(
  id: string,
  model: string,
  content: string,
  reasoningcontent?: string,
  finishreason?: string | null,
): Record<string, unknown> {
  const delta: Record<string, unknown> = {};
  if (content) delta.content = content;
  if (reasoningcontent) delta.reasoning_content = reasoningcontent;
  if (!finishreason) delta.role = "assistant";
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
  };
}

/** makefinalchunk — build the final chunk with finish reason and optional usage */
export function makefinalchunk(
  id: string,
  model: string,
  finishreason: string,
  usage?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, delta: {}, finish_reason: finishreason }],
    ...(usage ? { usage } : {}),
  };
}

// ---------------------------------------------------------------------------
// stream tracking — collects content reasoning usage while forwarding
// ---------------------------------------------------------------------------

/** tracked stream data — collected during passthrough for persistence */
export interface trackedstream {
  content: string;
  reasoning: string;
  totaltokens: number;
  prompttokens: number;
  completiontokens: number;
  frames: number;
  discarded: number;
}

/** createtracker — new empty tracking state */
function createtracker(): trackedstream {
  return {
    content: "",
    reasoning: "",
    totaltokens: 0,
    prompttokens: 0,
    completiontokens: 0,
    frames: 0,
    discarded: 0,
  };
}

/** framedatapayload — the joined data payload of a frame WITHOUT the done
 * nulling (extractdata maps the done marker to null by contract — the
 * stream loop needs the raw payload to recognize the marker and set its
 * terminated flag before that nulling hides it) */
function framedatapayload(frame: string): string | null {
  const lines = frame.split("\n").filter((l) => l.startsWith("data:"));
  if (lines.length === 0) return null;
  return lines.map((l) => l.slice(5).trim()).join("\n");
}

/** trackframe — parse a data frame and accumulate tracked fields */
function trackframe(tracker: trackedstream, data: string): void {
  const parsed = safejsonparse(data);
  if (!parsed || typeof parsed !== "object") return;
  const obj = parsed as Record<string, unknown>;
  // usage
  const usage = obj["usage"] as Record<string, unknown> | undefined;
  if (usage) {
    if (usage["total_tokens"]) tracker.totaltokens = Number(usage["total_tokens"]);
    if (usage["prompt_tokens"]) tracker.prompttokens = Number(usage["prompt_tokens"]);
    if (usage["completion_tokens"]) tracker.completiontokens = Number(usage["completion_tokens"]);
  }
  // choices deltas
  const choices = obj["choices"] as Array<Record<string, unknown>> | undefined;
  if (choices && choices.length > 0) {
    const delta = choices[0]["delta"] as Record<string, unknown> | undefined;
    if (delta) {
      if (typeof delta["content"] === "string") tracker.content += delta["content"];
      if (typeof delta["reasoning_content"] === "string")
        tracker.reasoning += delta["reasoning_content"];
    }
    const message = choices[0]["message"] as Record<string, unknown> | undefined;
    if (message) {
      if (typeof message["content"] === "string") tracker.content += message["content"];
      if (typeof message["reasoning_content"] === "string")
        tracker.reasoning += message["reasoning_content"];
    }
  }
}

// ---------------------------------------------------------------------------
// makestreamresponse — wrap an upstream response into a gateway stream
// ---------------------------------------------------------------------------

/** options for makestreamresponse */
export interface streamoptions {
  /** mask upstream model ids to this id — null disables masking */
  mask?: string | null;
  /** content type override — defaults from upstream response */
  format?: "sse" | "ndjson" | "json" | "plain" | "octet";
  /** keepalive interval ms — default 200 */
  keepaliveintervalms?: number;
  /** suppress keepalive when written within this ms — default 1000 */
  keepalivesuppressms?: number;
  /** callback with tracked data when the stream finishes */
  onfinal?: (tracked: trackedstream) => void;
}

/** makestreamresponse — wrap an upstream fetch response into a gateway streaming response
 * byte passthrough with sse parsing heartbeat discard masking and tracking */
export function makestreamresponse(upstream: Response, opts: streamoptions): Response {
  const mask = opts.mask ?? null;
  const kai = opts.keepaliveintervalms ?? kams;
  const kasuppress = opts.keepalivesuppressms ?? kasuppressms;
  const tracker = createtracker();
  const upstreamct = upstream.headers.get("content-type") ?? "";
  const format = opts.format ?? (upstreamct.includes("ndjson") ? "ndjson" : "sse");

  let closed = false;
  let lastwrite = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      // every chunk leaves as bytes: a response body is a byte stream —
      // string chunks throw "received non-uint8array chunk" the moment a
      // consumer reads the body (res.text() res.json()) even though node
      // http write happens to tolerate strings — encode uniformly
      const encoder = new TextEncoder();
      const push = (chunk: string | Uint8Array): boolean => {
        try {
          controller.enqueue(typeof chunk === "string" ? encoder.encode(chunk) : chunk);
          return true;
        } catch {
          return false;
        }
      };

      const keepalivetimer = setInterval(() => {
        if (closed) return;
        if (Date.now() - lastwrite > kasuppress) {
          push(": ka\n\n");
        }
      }, kai);

      try {
        const reader = upstream.body?.getReader();
        if (!reader) {
          // a bodyless upstream (new Response(null)) still terminates the
          // downstream stream properly — the early return used to close
          // without the done marker and without the sse terminator
          push("data: [DONE]\n\n");
          closed = true;
          safeclose(controller);
          return;
        }
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          lastwrite = Date.now();

          if (mask === null && format !== "sse") {
            // pure byte passthrough — raw bytes forwarded unchanged: no
            // decode encode round trip (multibyte sequences split across
            // chunks stay intact)
            push(value);
            continue;
          }

          // sse mode — parse frames discard heartbeats mask model ids track content
          buffer += decoder.decode(value, { stream: true });
          const { frames, residual } = parsesseframes(buffer);
          buffer = residual;
          for (const frame of frames) {
            if (discardheartbeat(frame)) {
              tracker.discarded += 1;
              continue;
            }
            // the done marker nulls inside extractdata — recognize it from
            // the raw payload first so the terminated flag actually sets
            // (the marker used to fall into the no-data branch, closed never
            // flipped and the loop appended a second done at the end)
            const payload = framedatapayload(frame);
            if (payload !== null && isdone(payload)) {
              push("data: [DONE]\n\n");
              closed = true;
              continue;
            }
            const data = extractdata(frame);
            if (data === null) {
              // frame with no data lines — forward raw
              push(`${frame}\n\n`);
              continue;
            }
            // track content for persistence
            tracker.frames += 1;
            trackframe(tracker, data);
            // mask and forward
            if (mask !== null) {
              const masked = data.replace(/"model"\s*:\s*"[^"]*"/g, `"model":"${mask}"`);
              push(`data: ${masked}\n\n`);
            } else {
              push(`data: ${data}\n\n`);
            }
          }
        }
        // flush residual — through the same done recognition so an
        // unterminated trailing marker terminates instead of duplicating
        if (buffer.trim()) {
          const payload = framedatapayload(buffer);
          if (payload !== null && isdone(payload)) {
            push("data: [DONE]\n\n");
            closed = true;
          } else {
            push(buffer.endsWith("\n\n") ? buffer : `${buffer}\n\n`);
          }
        }
        // ensure done marker present
        if (!closed) {
          push("data: [DONE]\n\n");
        }
      } catch {
        // upstream failed mid-stream — emit done and close
        try {
          push("data: [DONE]\n\n");
        } catch {
          /* closed */
        }
      } finally {
        clearInterval(keepalivetimer);
        closed = true;
        safeclose(controller);
        if (opts.onfinal) {
          try {
            opts.onfinal(tracker);
          } catch {
            /* callback error */
          }
        }
      }
    },
    cancel() {
      closed = true;
    },
  });

  const headers = format === "ndjson" ? ndjsonheaders() : sseheaders();
  return new Response(stream, { headers });
}

/** trackwrite — update last write timestamp for keepalive suppression */
export function trackwrite(): number {
  return Date.now();
}

// ---------------------------------------------------------------------------
// http server — hono bootstrap registers routes per version
// ---------------------------------------------------------------------------

import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { loadconfig, validateconfig } from "./gateway-configloader.js";
import { createversion } from "./engine";

/** route resources per version — the canonical 7 */
const resources = [
  "keys",
  "models",
  "chat/completions",
  "completions",
  "messages",
  "responses",
  "embeddings",
] as const;

/** map resource name to its engine handler */
function handlermap(
  handlers: ReturnType<typeof createversion>,
  resource: string,
): ((req: Request) => Promise<Response>) | null {
  switch (resource) {
    case "keys":
      return handlers.handlekeys;
    case "models":
      return handlers.handlemodels;
    case "chat/completions":
      return handlers.handlechatcompletions;
    case "completions":
      return handlers.handlecompletions;
    case "messages":
      return handlers.handlemessages;
    case "responses":
      return handlers.handleresponses;
    case "embeddings":
      return handlers.handleembeddings;
    default:
      return null;
  }
}

/** createserver — build the hono app from the loaded config */
async function createserver(): Promise<Hono> {
  const app = new Hono();

  // open cors — all methods all origins
  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      allowHeaders: [
        "content-type",
        "authorization",
        "x-token",
        "x-chat-id",
        "x-user-id",
        "x-session-id",
        "x-request-id",
        "x-thinking-level",
        "x-model",
        "x-tools",
        "accept",
      ],
      exposeHeaders: ["x-request-id", "x-session-id"],
      maxAge: 86400,
    }),
  );

  // load the user config — web/config.ts or gateway.config.ts
  const definition = await loadconfig();
  const problems = validateconfig(definition);

  // config endpoint — reports the loaded definition shape
  app.get("/api/config", (c) =>
    c.json({
      name: definition.name ?? "gateway",
      description: definition.description ?? "",
      versions: Object.keys(definition.versions),
      problems,
    }),
  );

  // register routes for every configured version
  for (const [versionid, versionconfig] of Object.entries(definition.versions)) {
    const handlers = createversion(versionconfig);
    const prefix = `/api/${versionid}`;

    // info routes — get returns the version descriptor
    for (const resource of resources) {
      app.get(`${prefix}/${resource}`, (c) => handlers.handleinfo(c.req.raw));
    }

    // action routes — post dispatches to the resource handler
    for (const resource of resources) {
      const handler = handlermap(handlers, resource);
      if (handler) {
        app.post(`${prefix}/${resource}`, (c) => handler(c.req.raw));
      }
    }
  }

  // static web ui: the host build (cwd/dist — a host application or repo dev
  // with its own vite build) wins, then the console that ships inside the
  // package (the bundled http transport lives in the package dist, so a
  // consumer running `npx @wenathlan/gateway serve` with no local build
  // still gets the web console out of the box)
  for (const root of consoleroots()) {
    app.use("*", serveStatic({ root }));
  }

  // api 404 fallback
  app.notFound((c) => {
    if (c.req.path.startsWith("/api/")) {
      return c.json({ error: "not found", path: c.req.path }, 404);
    }
    // spa fallback: index.html from the first console root that has it
    for (const root of consoleroots()) {
      const indexpath = join(root, "index.html");
      if (existsSync(indexpath)) {
        return c.html(readFileSync(indexpath, "utf8"));
      }
    }
    return c.body(null, 204);
  });

  return app;
}

/** consoleroots — the static roots in priority order: the local dist (the
 * host build — cwd relative), then the package's own dist when the http
 * transport itself runs from inside it (the bundled dist/http.js sits next
 * to the console the package ships; repo-dev runs http.ts from the root, so
 * the module dir only joins the list when it IS a dist directory) */
function consoleroots(): string[] {
  const roots: string[] = ["dist"];
  const moduledir = dirname(fileURLToPath(import.meta.url));
  if (basename(moduledir) === "dist" && moduledir !== resolve("dist")) {
    roots.push(moduledir);
  }
  return roots;
}

/** main — bootstrap the server on the configured port
 * host and port honor env — never hardcoded per open infrastructure rules */
async function main(): Promise<void> {
  const app = await createserver();
  const definition = await loadconfig();
  const versioncount = Object.keys(definition.versions).length;

  // global error guards — never crash the process
  process.on("uncaughtException", (err) => {
    console.error("[server] uncaught exception:", err.message);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("[server] unhandled rejection:", reason);
  });

  const port = Number(process.env.PORT) || 3001;
  const hostname = process.env.HOST || "0.0.0.0";
  serve({ fetch: app.fetch, port, hostname }, (info) => {
    console.log(`[server] gateway listening on http://${info.address}:${info.port}`);
    console.log(`[server] config loaded — ${versioncount} versions`);
  });
}

// run main when executed directly — not when imported as a library
const ismain =
  process.argv[1] &&
  (process.argv[1].endsWith("http.ts") ||
    process.argv[1].endsWith("http.js") ||
    process.argv[1].endsWith("dist/http.js"));
if (ismain) {
  void main();
}

/** export for library usage — users may embed the server */
export { createserver, main, main as runserver };
