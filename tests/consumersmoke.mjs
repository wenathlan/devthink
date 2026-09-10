#!/usr/bin/env node
/**
 * consumer smoke — the library exercised exactly like a first-time embedder
 * runs inside a fresh consumer directory that installed the packed tarball
 * (a plain `npm init -y` project — no type module, no tsx, no bundler):
 * the library imports prisma-free, the engine drives a mock upstream over
 * the wire, streaming bodies read as text, malformed bodies answer 400
 *
 * optional persistence block: set DEVTHINK_CONSUMER_DB=1 after provisioning
 * the prisma context the library documents (the web/schema.prisma and
 * prisma.config.ts of the repository beside the consumer, npm install
 * prisma, db push and generate) — the engine write path must land real
 * rows in the pushed database
 */

import http from "node:http";
import { createversion, loadconfig, validateconfig } from "@wenathlan/devthink/server";

const failures = [];
function check(name, ok, detail = "") {
  if (ok) console.log(`[consumer] ok — ${name}`);
  else {
    console.error(`[consumer] FAIL — ${name}${detail ? `: ${detail}` : ""}`);
    failures.push(name);
  }
}

// ---------------------------------------------------------------------------
// mock upstream on an ephemeral port
// ---------------------------------------------------------------------------
const upstream = http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    if (req.headers.accept?.includes("event-stream")) {
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.write(
        `data: ${JSON.stringify({
          id: "s",
          object: "chat.completion.chunk",
          model: "hidden/model",
          choices: [{ index: 0, delta: { content: "streamed " }, finish_reason: null }],
        })}\n\n`,
      );
      res.write(
        `data: ${JSON.stringify({
          id: "s",
          object: "chat.completion.chunk",
          model: "hidden/model",
          choices: [{ index: 0, delta: { content: "reply" }, finish_reason: null }],
        })}\n\n`,
      );
      res.end("data: [DONE]\n\n");
      return;
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        id: "up-1",
        object: "chat.completion",
        model: "hidden/model",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "mock reply from the wire" },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 4, completion_tokens: 6, total_tokens: 10 },
      }),
    );
  });
});
await new Promise((resolve) => upstream.listen(0, "127.0.0.1", () => resolve()));
const upstreamport = upstream.address().port;

// ---------------------------------------------------------------------------
// the consumer embedding — plain node, no tsx, no bundler, no generated prisma
// ---------------------------------------------------------------------------
try {
  const cfg = {
    id: "vt",
    name: "VT",
    providername: "mock",
    upstreams: [{ name: "mock", baseurl: `http://127.0.0.1:${upstreamport}` }],
    auth: { mode: "bearer", required: false },
    models: [
      { id: "m1", context: 8192, maxoutput: 1024 },
      { id: "m2", context: 4096, maxoutput: 512 },
    ],
    defaultmodel: "m1",
    metamodel: { id: "meta", maxoutput: 512, maskupstreammodel: true, alwaysdisplay: true },
  };
  const handlers = createversion(cfg);

  const info = await handlers.handleinfo(new Request("http://x/api/vt"));
  const infodata = await info.json();
  check("handleinfo answers the 7 routes", infodata.routes?.length === 7);

  const res = await handlers.handlechatcompletions(
    new Request("http://x/api/vt/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "m1", messages: [{ role: "user", content: "hi" }] }),
    }),
  );
  const data = await res.json();
  check("chat completion round trip", data.choices?.[0]?.message?.content === "mock reply from the wire");
  check("model masked to the meta id", data.model === "meta", `got ${data.model}`);

  const streamres = await handlers.handlechatcompletions(
    new Request("http://x/api/vt/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stream: true, messages: [{ role: "user", content: "hi" }] }),
    }),
  );
  const streamtext = await streamres.text();
  const donecount = (streamtext.match(/data: \[DONE\]/g) ?? []).length;
  check("streaming body reads as text (bytes not strings)", streamtext.includes("streamed ") && donecount >= 1);
  check("exactly one stream terminator", donecount === 1, `got ${donecount}`);
  check("stream masking", streamtext.includes('"model":"meta"') && !streamtext.includes("hidden/model"));

  const bad = await handlers.handlechatcompletions(
    new Request("http://x/api/vt/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not json {{{",
    }),
  );
  check("malformed bodies answer 400", bad.status === 400, `got ${bad.status}`);

  const empty = await handlers.handlechatcompletions(
    new Request("http://x/api/vt/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [] }),
    }),
  );
  check("empty messages answer 400", empty.status === 400, `got ${empty.status}`);

  const def = await loadconfig();
  check("loadconfig on a configless cwd", def && "versions" in def);
  check("validateconfig reports the empty definition", validateconfig({ versions: {} }).length === 1);
} catch (err) {
  check("library embedding threw no exception", false, err instanceof Error ? err.message : String(err));
}

upstream.close();

// ---------------------------------------------------------------------------
// optional persistence block — the engine write path must land real rows
// ---------------------------------------------------------------------------
if (process.env.DEVTHINK_CONSUMER_DB === "1") {
  try {
    const { savemsg, getsessionmessages } = await import("@wenathlan/devthink/server");
    await savemsg({
      sessionid: "smoke",
      route: "chat/completions",
      provider: "smoke",
      version: "vt",
      endpoint: "mock",
      model: "meta",
      status: "completed",
      stream: false,
      startedat: new Date(),
      content: "smoke row",
      prompttokens: 1,
      completiontokens: 1,
      totaltokens: 2,
    });
    const rows = await getsessionmessages("smoke");
    check("engine write path persists real rows", rows.length >= 1, `got ${rows.length}`);
  } catch (err) {
    check("persistence block threw", false, err instanceof Error ? err.message : String(err));
  }
}

if (failures.length > 0) {
  console.error(`[consumer] ${failures.length} failure(s)`);
  process.exit(1);
}
console.log("[consumer] all library smoke checks passed");
