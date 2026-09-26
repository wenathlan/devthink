/** The containerfile gateway smoke of the 1.1.83 family: it starts the localhost fixture server, loads the built gateway module and runs one full request cycle against the recorded openaicompat fixture offline — no provider endpoint, no key, no external network — so the container image proves the gateway call path before it ships. */
import { startgatewayfixtureserver } from "./gatewayserver.mjs";

const server = await startgatewayfixtureserver();
try {
  const gateway = await import("../dist/llm.js");
  const config = {
    providerid: "smoke",
    kind: "openaicompat",
    baseurl: `http://127.0.0.1:${server.port}/openaicompat`,
    enabled: true,
    consented: true,
    consentedat: Date.now(),
    updatedat: Date.now(),
  };
  const outcome = await gateway.gatewaycall({
    config,
    model: "fixture-model-a",
    messages: [{ role: "user", content: "draft one step" }],
    requestid: "smoke-1",
    transport: async (url, init) => {
      const response = await fetch(url, { method: init.method, headers: init.headers, body: init.body });
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
      };
    },
  });
  if (!outcome.text.includes("goal")) throw new Error("The gateway smoke answer carries no goal field.");
  if (outcome.usage?.totaltokens !== 55) throw new Error("The gateway smoke usage did not parse.");
  const streamed = await gateway.gatewaystream({
    config: { ...config, providerid: "smoke-stream" },
    model: "fixture-model-a",
    messages: [{ role: "user", content: "stream" }],
    transport: async (url, init) => {
      const response = await fetch(url, { method: init.method, headers: init.headers, body: init.body });
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
      };
    },
  });
  if (streamed.tokens.length !== 3)
    throw new Error("The gateway smoke stream did not carry the three recorded deltas.");
  console.log(
    JSON.stringify({
      valid: true,
      requestid: outcome.requestid,
      tokens: streamed.tokens.length,
      usage: outcome.usage.totaltokens,
    }),
  );
} finally {
  await server.close();
}
