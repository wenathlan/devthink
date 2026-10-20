// mock-sse-gateway.ts — a throwaway local SSE gateway for the wave-119
// browser verification (never committed): /v1/models answers a two-model
// catalog and /v1/chat/completions streams a slow reasoning+content answer
// so the Stop pill can interrupt a live round and the partial can commit.
const PORT = 3999;

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, accept, x-session-id, x-thinking-level, x-model",
};

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (req.method === "GET" && url.pathname === "/v1/models") {
      return Response.json(
        {
          object: "list",
          data: [
            { id: "devthink", object: "model", owned_by: "mock" },
            { id: "glm-5", object: "model", owned_by: "mock" },
          ],
        },
        { headers: CORS },
      );
    }
    if (req.method === "POST" && url.pathname === "/v1/chat/completions") {
      type Msg = { role?: string; content?: string };
      const parsed = (await req.json().catch(() => ({}))) as { messages?: Msg[] };
      const lastUser = [...(parsed.messages ?? [])].reverse().find((m) => m.role === "user");
      const echo = (lastUser?.content ?? "hello").slice(0, 60);
      const stream = new ReadableStream({
        async start(controller) {
          const enc = new TextEncoder();
          const send = (obj: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
          send({ choices: [{ delta: { reasoning_content: "Let me think about this carefully. " } }] });
          await Bun.sleep(400);
          send({ choices: [{ delta: { reasoning_content: "The visitor asked something specific. " } }] });
          await Bun.sleep(400);
          const mdDemo = echo.toLowerCase().includes("markdown demo");
      const words = mdDemo
        ? [
            "# The Block Grammar\n\n",
            "A paragraph before the list, with **bold**, *italic* and `inline code`.\n\n",
            "- the first rail\n",
            "- the second rail with **bold**\n",
            "  - a nested child\n",
            "  - another child\n",
            "- back to the root\n\n",
            "1. the ordered first\n",
            "2. the ordered second\n",
            "3. the ordered third\n\n",
            "> The quote block speaks with the softened voice.\n",
            "> It can carry a second line.\n\n",
            "## The Second Level\n\n",
            "A closing paragraph with a [markdown link](https://example.com/docs) and a bare https://example.com/autolink.\n\n",
            "---\n\n",
            "| Feature | Status | Rung |\n",
            "| --- | :---: | ---: |\n",
            "| stop | done | 119 |\n",
            "| action row | done | 120 |\n",
            "| markdown v2 | done | 122 |\n\n",
            "```ts\n",
            "// the highlighter demo\n",
            "const answer = 42;\n",
            "function greet(name: string) {\n",
            "  return 'hello ' + name; // classic\n",
            "}\n",
            "```\n\n",
            "After the rule.",
          ]
        : [
            "Here", "is", "the", "slow", "mock", "answer", `echoing "${echo}".`,
            "It", "streams", "word", "by", "word", "so", "the", "stop", "pill",
            "can", "interrupt", "mid-flight", "and", "the", "partial", "commits",
            "honestly", "with", "the", "stopped", "mark.", "More", "tokens",
            "keep", "landing", "after", "this", "point", "for", "a", "while.",
          ];
          for (const w of words) {
            send({ choices: [{ delta: { content: `${w} ` } }] });
            await Bun.sleep(220);
          }
          send({ choices: [{ delta: {}, finish_reason: "stop" }] });
          controller.enqueue(enc.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { ...CORS, "content-type": "text/event-stream", "cache-control": "no-cache" },
      });
    }
    return new Response("not found", { status: 404 });
  },
});
console.log(`mock sse gateway on :${PORT}`);
