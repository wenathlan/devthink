/**
 * server e2e — the full http stack over the wire
 * spawns the real gateway server as a child process with a temp config
 * directory, runs a real mock upstream, and exercises every route shape
 * over actual http: config info keys models chat completions streaming
 * cors preflight 404 handling and the unknown path fallback
 */

import { type ChildProcess, spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// mock upstream — records requests and replies with scripted bodies
// ---------------------------------------------------------------------------

let upstreamport = 0;
const upstreamhits: string[] = [];

const upstream = http.createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on("data", (c: Buffer) => chunks.push(c));
  req.on("end", () => {
    upstreamhits.push(`${req.method} ${req.url}`);
    if (req.url?.endsWith("/chat/completions")) {
      if (req.headers.accept?.includes("event-stream")) {
        res.writeHead(200, { "content-type": "text/event-stream" });
        res.write(
          `data: ${JSON.stringify({
            id: "e2e-1",
            object: "chat.completion.chunk",
            model: "wire-model",
            choices: [{ index: 0, delta: { content: "wire " }, finish_reason: null }],
          })}\n\n`,
        );
        res.write(
          `data: ${JSON.stringify({
            id: "e2e-1",
            object: "chat.completion.chunk",
            model: "wire-model",
            choices: [{ index: 0, delta: { content: "stream" }, finish_reason: null }],
          })}\n\n`,
        );
        res.end("data: [DONE]\n\n");
        return;
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          id: "e2e-1",
          object: "chat.completion",
          model: "wire-model",
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: "wire reply" },
              finish_reason: "stop",
            },
          ],
          usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
        }),
      );
      return;
    }
    if (req.url?.endsWith("/embeddings")) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end('{"data":[{"embedding":[1,2,3]}]}');
      return;
    }
    res.writeHead(404, { "content-type": "application/json" });
    res.end('{"error":"upstream 404"}');
  });
});

// ---------------------------------------------------------------------------
// gateway child server — tsx server.ts serve with a temp config dir
// ---------------------------------------------------------------------------

const serverport = 22000 + Math.floor(Math.random() * 8000);
let gateway: ChildProcess | null = null;
let configdir = "";

const tsxbin = join(import.meta.dirname, "..", "..", "node_modules", ".bin", "tsx");
const httpts = join(import.meta.dirname, "..", "..", "server.ts");

async function waitforready(): Promise<void> {
  const deadline = Date.now() + 30000;
  for (;;) {
    try {
      const res = await fetch(`http://127.0.0.1:${serverport}/api/config`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    if (Date.now() > deadline) throw new Error("gateway server did not become ready");
    await new Promise((r) => setTimeout(r, 200));
  }
}

beforeAll(async () => {
  await new Promise<void>((resolve) => upstream.listen(0, "127.0.0.1", () => resolve()));
  upstreamport = (upstream.address() as AddressInfo).port;

  configdir = mkdtempSync(join(tmpdir(), "gateway-e2e-"));
  writeFileSync(
    join(configdir, "gateway.config.ts"),
    `export const config = {
  name: "e2e gateway",
  description: "spawned server test",
  versions: {
    vt: {
      id: "vt",
      name: "VT",
      providername: "wiremock",
      upstreams: [
        {
          name: "wiremock",
          baseurl: "http://127.0.0.1:${upstreamport}",
          endpoints: { embeddings: "/embeddings" },
        },
      ],
      auth: { mode: "bearer", required: false },
      models: [
        { id: "m1", context: 8192, maxoutput: 1024 },
        { id: "m2", context: 4096, maxoutput: 512 },
      ],
      defaultmodel: "m1",
      rotation: { mode: "persession", models: ["m1", "m2"], everynmessages: 6 },
      metamodel: { id: "meta", maxoutput: 512, maskupstreammodel: true, alwaysdisplay: true },
    },
  },
}
export default config
`,
  );

  // detached: true puts the child in its own process group — tsx execs into
  // a nested node process, so killing only the tsx pid left the real server
  // orphaned on the port (the next run silently talked to the stale orphan)
  gateway = spawn(tsxbin, [httpts, "serve"], {
    cwd: configdir,
    env: {
      ...process.env,
      PORT: String(serverport),
      DEVTHINK_DATABASE_URL: `file:${join(configdir, "test.db")}`,
    },
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  await waitforready();
}, 40000);

afterAll(async () => {
  if (gateway?.pid) {
    try {
      process.kill(-gateway.pid, "SIGKILL"); // the whole process group
    } catch {
      /* already gone */
    }
  }
  if (configdir) rmSync(configdir, { recursive: true, force: true });
  await new Promise<void>((resolve) => upstream.close(() => resolve()));
});

// ---------------------------------------------------------------------------
// routes over the wire
// ---------------------------------------------------------------------------

describe("gateway server over real http", () => {
  it("serves the config descriptor", async () => {
    const res = await fetch(`http://127.0.0.1:${serverport}/api/config`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data["name"]).toBe("e2e gateway");
    expect(data["versions"]).toEqual(["vt"]);
    expect(data["problems"]).toEqual([]);
  });

  it("serves the version info on the get route", async () => {
    const res = await fetch(`http://127.0.0.1:${serverport}/api/vt/models`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data["version"]).toBe("vt");
    expect(data["provider"]).toBe("wiremock");
    expect(data["routes"]).toHaveLength(7);
  });

  it("serves the keys payload on the action route", async () => {
    const res = await fetch(`http://127.0.0.1:${serverport}/api/vt/keys`, { method: "POST" });
    const data = await res.json();
    expect(data["authmode"]).toBe("bearer");
    expect(data["models"]).toEqual(["m1", "m2"]);
  });

  it("post models returns the catalog with the meta first", async () => {
    const res = await fetch(`http://127.0.0.1:${serverport}/api/vt/models`, { method: "POST" });
    const data = await res.json();
    const ids = (data["data"] as Array<{ id: string }>).map((m) => m.id);
    expect(ids).toEqual(["meta", "m1", "m2"]);
  });

  it("chat completions round trip through the wire", async () => {
    const res = await fetch(`http://127.0.0.1:${serverport}/api/vt/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "m1", messages: [{ role: "user", content: "hello" }] }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data["object"]).toBe("chat.completion");
    expect(data["model"]).toBe("meta");
    expect(data["choices"][0]["message"]["content"]).toBe("wire reply");
    expect(data["usage"]["total_tokens"]).toBe(5);
    expect(upstreamhits.at(-1)).toBe("POST /chat/completions");
  });

  it("streaming chat completions deliver masked sse frames", async () => {
    const res = await fetch(`http://127.0.0.1:${serverport}/api/vt/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        stream: true,
        messages: [{ role: "user", content: "stream me" }],
      }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/event-stream");
    const text = await res.text();
    expect(text).toContain("wire ");
    expect(text).toContain("stream");
    expect(text).toContain('"model":"meta"');
    expect(text).not.toContain("wire-model");
    expect(text).toContain("data: [DONE]");
    // exactly one terminator — the double-done bug shipped for eleven
    // releases because every assertion used toContain
    expect((text.match(/data: \[DONE\]/g) ?? []).length).toBe(1);
  });

  it("cors preflight answers 204 with open cors headers", async () => {
    const res = await fetch(`http://127.0.0.1:${serverport}/api/vt/chat/completions`, {
      method: "OPTIONS",
      headers: {
        origin: "https://console.example",
        "access-control-request-method": "POST",
        "access-control-request-headers": "content-type,x-token",
      },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).not.toBeNull();
  });

  it("embeddings proxy through to the upstream endpoint", async () => {
    const res = await fetch(`http://127.0.0.1:${serverport}/api/vt/embeddings`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: "embed" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data["data"][0]["embedding"]).toEqual([1, 2, 3]);
    expect(upstreamhits.at(-1)).toBe("POST /embeddings");
  });

  it("unknown api paths answer 404 json", async () => {
    const res = await fetch(`http://127.0.0.1:${serverport}/api/nope`);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data["error"]).toBe("not found");
    expect(data["path"]).toBe("/api/nope");
  });

  it("unknown non api paths answer 204 without a console", async () => {
    const res = await fetch(`http://127.0.0.1:${serverport}/spa/route`);
    expect(res.status).toBe(204);
  });

  it("the messages route converts anthropic over the wire", async () => {
    const res = await fetch(`http://127.0.0.1:${serverport}/api/vt/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        system: "wire",
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 32,
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data["type"]).toBe("message");
    expect(data["content"][0]["text"]).toBe("wire reply");
    expect(data["stop_reason"]).toBe("end_turn");
  });

  it("the responses route speaks the responses format", async () => {
    const res = await fetch(`http://127.0.0.1:${serverport}/api/vt/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: "hi" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data["object"]).toBe("response");
    expect(data["output"][0]["content"][0]["text"]).toBe("wire reply");
  });

  it("the completions route converts prompts", async () => {
    const res = await fetch(`http://127.0.0.1:${serverport}/api/vt/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt: "once" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data["object"]).toBe("text_completion");
    expect(data["choices"][0]["text"]).toBe("wire reply");
  });

  it("malformed json bodies answer 400 over the wire", async () => {
    const res = await fetch(`http://127.0.0.1:${serverport}/api/vt/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not json {{{",
    });
    expect(res.status).toBe(400);
  });

  it("handles many parallel requests without dropping any", async () => {
    const results = await Promise.all(
      Array.from({ length: 30 }, (_, i) =>
        fetch(`http://127.0.0.1:${serverport}/api/vt/chat/completions`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: [{ role: "user", content: `p${i}` }] }),
        }).then(async (r) => {
          const data = await r.json();
          return data["choices"]?.[0]?.["message"]?.["content"] ?? "";
        }),
      ),
    );
    expect(results.every((c) => c === "wire reply")).toBe(true);
  });
});
