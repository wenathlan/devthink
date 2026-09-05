/** A localhost fixture server of the 1.1.83 gateway family: it serves the recorded provider response shapes of the tests fixture set over plain http on a random free port so the adapter suite and the container smoke run the full request cycle offline — no external network, no provider endpoint, no key. */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const fixturesdir = join(process.cwd(), "tests");

/** Reads one recorded fixture body. */
async function fixture(name) {
  return readFile(join(fixturesdir, name), "utf8");
}

/** Reads the request body of one incoming request. */
function readbody(request) {
  return new Promise(resolve => {
    let body = "";
    request.on("data", chunk => { body += chunk; });
    request.on("end", () => resolve(body));
  });
}

/** Starts the gateway fixture server on localhost with a random free port; the caller closes it through the returned handle. */
export async function startgatewayfixtureserver() {
  let ratelimitedseen = false;
  let flakyseen = false;
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    const body = await readbody(request);
    let streamed = false;
    try { streamed = JSON.parse(body).stream === true; } catch { /* the model list and key free requests carry no body */ }
    const send = (status, content, type, headers = {}) => {
      response.writeHead(status, { "content-type": type, ...headers });
      response.end(content);
    };
    if (url.pathname === "/openaicompat/chat/completions") return send(200, await fixture(streamed ? "openaicompat-stream.txt" : "openaicompat-completion.json"), streamed ? "text/event-stream" : "application/json");
    if (url.pathname === "/openaicompat/models") return send(200, await fixture("openaicompat-models.json"), "application/json");
    if (url.pathname === "/anthropic/v1/messages") return send(200, await fixture(streamed ? "anthropic-stream.txt" : "anthropic-completion.json"), streamed ? "text/event-stream" : "application/json");
    if (url.pathname === "/anthropic/v1/models") return send(200, await fixture("anthropic-models.json"), "application/json");
    if (url.pathname.startsWith("/gemini/v1beta/models/") && url.pathname.endsWith(":generateContent")) return send(200, await fixture(streamed ? "gemini-stream.txt" : "gemini-completion.json"), streamed ? "text/event-stream" : "application/json");
    if (url.pathname === "/gemini/v1beta/models") return send(200, await fixture("gemini-models.json"), "application/json");
    if (url.pathname === "/ollama/api/chat") return send(200, await fixture(streamed ? "ollama-stream.txt" : "ollama-completion.json"), streamed ? "application/x-ndjson" : "application/json");
    if (url.pathname === "/ollama/api/tags") return send(200, await fixture("ollama-tags.json"), "application/json");
    if (url.pathname === "/ratelimited/chat/completions") {
      if (!ratelimitedseen) { ratelimitedseen = true; return send(429, "{\"error\":\"rate limited\"}", "application/json", { "retry-after": "1" }); }
      return send(200, await fixture("openaicompat-completion.json"), "application/json");
    }
    if (url.pathname === "/flaky/chat/completions") {
      if (!flakyseen) { flakyseen = true; return send(503, "{\"error\":\"transient\"}", "application/json"); }
      return send(200, await fixture("openaicompat-completion.json"), "application/json");
    }
    if (url.pathname === "/unauthorized/chat/completions") return send(401, "{\"error\":\"bad key\"}", "application/json");
    if (url.pathname === "/slow/chat/completions") {
      setTimeout(() => send(200, "{\"choices\":[{\"message\":{\"role\":\"assistant\",\"content\":\"late\"}}]}", "application/json"), 500);
      return;
    }
    return send(404, "{\"error\":\"no fixture\"}", "application/json");
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port = typeof address === "object" && address !== null ? address.port : 0;
  return { port, close: () => new Promise(resolve => server.close(resolve)) };
}
