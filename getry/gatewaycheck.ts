/**
 * gatewaycheck — consolidated gateway check lane of the getry family
 * @module gatewaycheck
 * @family wave/gatewaycheck
 * One keyed file per family: the former variant arms (gatewayprobe, gatewaysmoke)
 * retired into this seat with every behavior preserved under the same name.
 */

import { startgatewayfixtureserver } from "./test/gatewayserver.ts";
import type { baseurlconfig } from "./types.ts";

/**
 * the offline smoke seat of the 1.1.83 family: it starts the localhost fixture
 * server, loads the built gateway module and runs one full request cycle
 * against the recorded openaicompat fixture offline — no provider endpoint,
 * no key, no external network — so the container image proves the gateway
 * call path before it ships.
 */
export async function gatewaysmokeseat(): Promise<void> {
  const server = await startgatewayfixtureserver();
  try {
    /* the smoke loads the BUILT gateway module — build/llm.js is a container
     * build artifact a fresh checkout never carries, so the specifier rides a
     * variable (tsc never fails on the absent artifact while the runtime
     * keeps loading the built face) and the cast pins the module to the
     * source contract that sits beside it. */
    const builtpath = "./build/llm.js";
    const gateway = (await import(builtpath)) as typeof import("./llm.ts");
    const config: baseurlconfig = {
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
      transport: async (url: string, init: { method: string; headers: Record<string, string>; body?: string }) => {
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
      transport: async (url: string, init: { method: string; headers: Record<string, string>; body?: string }) => {
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
}

/**
 * the live probe seat: a manual chat round trip against a deployed DevThink
 * gateway (the ZAI sandbox deploy of the getry template). this seat is NOT
 * wired into the deterministic gates: it needs the live network and the
 * deployed host is a runtime setting, never a tracked constant of a gate.
 * it exercises the exact surface the Sol chat client consumes: GET
 * /v1/models (the picker) and POST /v1/chat/completions with the model
 * "devthink" (content + reasoning_content on the answer turn).
 */
export async function gatewayprobeseat(base: string): Promise<void> {
  /* GET /v1/models — the chat picker surface. */
  const models = await fetch(`${base}/v1/models`);
  if (!models.ok) {
    console.error(`models probe failed: ${models.status}`);
    process.exit(1);
  }
  const modellist = (await models.json()) as { data?: Array<{ id?: string }> };
  const ids = (modellist.data ?? []).map((m) => m.id);
  console.log(`models: ${ids.join(", ") || "(none)"}`);

  /* POST /v1/chat/completions — one round trip on the chat surface. */
  const chat = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: "devthink",
      messages: [{ role: "user", content: "Reply with exactly: gateway ok" }],
      max_tokens: 20,
    }),
  });
  if (!chat.ok) {
    console.error(`chat probe failed: ${chat.status}`);
    process.exit(1);
  }
  const answer = (await chat.json()) as {
    choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>;
    usage?: unknown;
  };
  const turn = answer.choices?.[0]?.message;
  console.log(`chat: ${JSON.stringify(turn?.content ?? "")}`);
  console.log(`reasoning present: ${Boolean(turn?.reasoning_content)}`);
  console.log(`usage: ${JSON.stringify(answer.usage ?? {})}`);

  if (turn?.content !== "gateway ok") {
    console.error("the gateway answered, but the round trip content drifted");
    process.exit(1);
  }
  console.log("gateway probe: ok");
}

/* the dispatched entry the two seats ride: an http(s) URL argument answers
 * the live probe seat (`node gatewaycheck.ts https://<deployed-gateway-host>`,
 * the documented probe call), every other call answers the offline smoke
 * seat (`node gatewaycheck.ts`, the container call). */
const firstarg = (process.argv[2] ?? "").replace(/\/+$/, "");

if (/^https?:\/\//.test(firstarg)) {
  await gatewayprobeseat(firstarg);
} else {
  await gatewaysmokeseat();
}
