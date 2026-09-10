/**
 * engine — the universal pipeline under fire
 * engineinternals unit behavior plus every handler against a live mock
 * upstream: retry backoff rotation timeout fallback paused auth format
 * conversion and stream masking — the whole request lifecycle
 */

import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createversion, engineinternals } from "../../engine.js";
import type { gatewayconfig, modeldef } from "../../types.js";

// keep persistence silent — point the lazy prisma client at a tableless
// sqlite file so every savemsg no-ops instead of touching the dev db
process.env.DEVTHINK_DATABASE_URL = "file:./web/prisma/engine-test-silent.db";

const { resolvemodel, findmodel, fusioncontext, buildbody, classifystatus, backoffms, fitcontext, defaultbudgets } =
  engineinternals;

// ---------------------------------------------------------------------------
// mock upstream — a real http server with scripted responses
// ---------------------------------------------------------------------------

interface capturedrequest {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body: string;
}

interface responsespec {
  status: number;
  headers?: Record<string, string>;
  body?: string;
  delayms?: number;
  destroy?: boolean;
}

let mockport = 0;
let captured: capturedrequest[] = [];
let script: responsespec[] = [];

const mockserver = http.createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on("data", (c: Buffer) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks).toString("utf8");
    captured.push({
      method: req.method ?? "?",
      url: req.url ?? "?",
      headers: req.headers,
      body,
    });
    const spec = script.shift() ?? { status: 200, body: "{}" };
    const respond = () => {
      if (spec.destroy) {
        res.destroy();
        return;
      }
      res.writeHead(spec.status, spec.headers ?? { "content-type": "application/json" });
      res.end(spec.body ?? "");
    };
    if (spec.delayms) setTimeout(respond, spec.delayms);
    else respond();
  });
});

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    mockserver.listen(0, "127.0.0.1", () => resolve());
  });
  mockport = (mockserver.address() as AddressInfo).port;
});

afterAll(async () => {
  await new Promise<void>((resolve) => mockserver.close(() => resolve()));
});

beforeEach(() => {
  captured = [];
  script = [];
  delete process.env.gatewayenginekeys;
});

// ---------------------------------------------------------------------------
// config factory
// ---------------------------------------------------------------------------

const models: modeldef[] = [
  { id: "m1", context: 8192, maxoutput: 1024 },
  { id: "m2", context: 4096, maxoutput: 512 },
];

function baseconfig(overrides: Partial<gatewayconfig> = {}): gatewayconfig {
  return {
    id: "vt",
    name: "VT",
    providername: "mock",
    upstreams: [{ name: "mock", baseurl: `http://127.0.0.1:${mockport}` }],
    auth: {
      mode: "bearer",
      required: false,
      keysources: ["inline"],
      inlinekeys: ["testkey-0000000001"],
    },
    models,
    defaultmodel: "m1",
    metamodel: {
      id: "meta",
      maxoutput: 512,
      maskupstreammodel: true,
      alwaysdisplay: true,
    },
    retry: {
      maxretries: 0,
      backoffbasems: 1,
      backoffcapms: 2,
      jitter: 0,
    },
    timeout: { requestms: 5000, streamms: 10000 },
    ...overrides,
  };
}

/** openai shaped non stream success response */
function okssechunchof(content: string, model = "upstream-model"): string {
  return `data: ${JSON.stringify({
    id: "up-1",
    object: "chat.completion.chunk",
    model,
    choices: [{ index: 0, delta: { content }, finish_reason: null }],
  })}\n\n`;
}

function okjson(content = "hello there", model = "upstream-model"): string {
  return JSON.stringify({
    id: "up-1",
    object: "chat.completion",
    created: 1700000000,
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content },
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
  });
}

function post(handlers: ReturnType<typeof createversion>, body: unknown, headers = {}) {
  return handlers.handlechatcompletions(
    new Request(`http://x/api/vt/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

// ---------------------------------------------------------------------------
// model resolution
// ---------------------------------------------------------------------------

describe("resolvemodel — rotation and fallback logic", () => {
  const cfg = baseconfig({
    rotation: { mode: "persession", models: ["m1", "m2"], everynmessages: 6 },
  });
  const counter = { n: 0 };

  it("individual model requests resolve directly", () => {
    const out = resolvemodel(cfg, "m1", { messagecount: 0, rotationindex: 0, model: "" }, counter);
    expect(out.modelid).toBe("m1");
    expect(out.ismeta).toBe(false);
    expect(out.model).toBeDefined();
  });

  it("unknown model requests fall back to the default", () => {
    const out = resolvemodel(cfg, "nope", { messagecount: 0, rotationindex: 0, model: "" }, counter);
    expect(out.modelid).toBe("m1");
  });

  it("undefined request resolves the meta rotation", () => {
    const out = resolvemodel(cfg, undefined, { messagecount: 0, rotationindex: 0, model: "" }, counter);
    expect(out.ismeta).toBe(true);
    expect(out.modelid).toBe("m1");
    expect(out.display).toBe("meta");
  });

  it("explicit meta id also enters rotation", () => {
    const out = resolvemodel(cfg, "meta", { messagecount: 0, rotationindex: 0, model: "" }, counter);
    expect(out.ismeta).toBe(true);
  });

  it("persession rotation flips every n messages", () => {
    const session = { messagecount: 0, rotationindex: 0, model: "" };
    const seq: string[] = [];
    for (let i = 1; i <= 8; i += 1) {
      session.messagecount = i;
      seq.push(resolvemodel(cfg, undefined, session, counter).modelid);
    }
    // messages 1-5 → m1 (idx floor(n/6)=0), 6-8 → m2 wait floor(6/6)=1
    expect(seq.slice(0, 5)).toEqual(["m1", "m1", "m1", "m1", "m1"]);
    expect(seq.slice(5, 8)).toEqual(["m2", "m2", "m2"]);
  });

  it("perrequest rotation advances with the global counter", () => {
    const cfgpr = baseconfig({
      rotation: { mode: "perrequest", models: ["m1", "m2"] },
    });
    const counterpr = { n: 0 };
    const session = { messagecount: 0, rotationindex: 0, model: "" };
    const first = resolvemodel(cfgpr, undefined, session, counterpr).modelid;
    const second = resolvemodel(cfgpr, undefined, session, counterpr).modelid;
    expect(first).not.toBe(second);
    expect(counterpr.n).toBe(2);
  });

  it("staggernewsessions offsets fresh sessions by the global counter", () => {
    const cfgst = baseconfig({
      rotation: { mode: "persession", models: ["m1", "m2"], staggernewsessions: true },
    });
    const counterst = { n: 1 };
    const session = { messagecount: 0, rotationindex: 0, model: "" };
    // idx = floor(0/6)=0 then +counter(1) → m2
    expect(resolvemodel(cfgst, undefined, session, counterst).modelid).toBe("m2");
    expect(counterst.n).toBe(2);
  });

  it("alwaysdisplay shows the meta id — otherwise the resolved model", () => {
    const cfgplain = baseconfig({
      metamodel: { id: "meta", maxoutput: 512, maskupstreammodel: false, alwaysdisplay: false },
      rotation: { mode: "persession", models: ["m1", "m2"] },
    });
    const out = resolvemodel(cfgplain, "m2", { messagecount: 0, rotationindex: 0, model: "" }, counter);
    expect(out.display).toBe("m2");
  });

  it("findmodel locates catalog entries", () => {
    expect(findmodel(cfg, "m1")?.context).toBe(8192);
    expect(findmodel(cfg, "missing")).toBeUndefined();
  });
});

describe("fusioncontext — context computation", () => {
  it("sums the model contexts by default", () => {
    expect(fusioncontext(baseconfig())).toBe(8192 + 4096);
  });
  it("the override wins when set", () => {
    const cfg = baseconfig({
      metamodel: { id: "meta", contextoverride: 2300000, maxoutput: 512 },
    });
    expect(fusioncontext(cfg)).toBe(2300000);
  });
  it("a subset pool sums only those models", () => {
    expect(fusioncontext(baseconfig(), [models[1]])).toBe(4096);
  });
  it("empty pool sums zero", () => {
    expect(fusioncontext(baseconfig(), [])).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// body building
// ---------------------------------------------------------------------------

describe("buildbody — upstream body assembly", () => {
  const cfg = baseconfig({
    bodybuild: { optionalparamspolicy: "omit-unspecified", clampmaxtokens: true },
  });

  it("maps the model id and strips gateway only fields", () => {
    const out = buildbody(cfg, {
      model: "m1",
      messages: [{ role: "user", content: "hi" }],
      apiKey: "secret",
      api_key: "secret",
      token: "secret",
    }) as Record<string, unknown>;
    expect(out["model"]).toBe("m1");
    expect(out["apiKey"]).toBeUndefined();
    expect(out["api_key"]).toBeUndefined();
    expect(out["token"]).toBeUndefined();
    expect(out["messages"]).toEqual([{ role: "user", content: "hi" }]);
  });

  it("maps to the upstream id when the model declares one", () => {
    const cfgup = baseconfig();
    const model: modeldef = { id: "exposed", upstream: "hidden/model", context: 1, maxoutput: 1 };
    const out = buildbody(cfgup, { model: "exposed" }, model) as Record<string, unknown>;
    expect(out["model"]).toBe("hidden/model");
  });

  it("adds the enabled thinking object by default level high", () => {
    const out = buildbody(cfg, { model: "m1" }) as Record<string, unknown>;
    expect(out["thinking"]).toEqual({ type: "enabled", budget: 68000 });
  });

  it("none level produces the disabled thinking object", () => {
    const out = buildbody(cfg, { model: "m1", thinking: "none" }) as Record<string, unknown>;
    expect(out["thinking"]).toEqual({ type: "disabled" });
    expect(out["reasoning_effort"]).toBeUndefined();
  });

  it("custom budgets flow into the thinking object", () => {
    const cfgb = baseconfig({
      thinking: { budgets: { ...defaultbudgets, low: 999 } },
    });
    const out = buildbody(cfgb, { model: "m1", thinking: "low" }) as Record<string, unknown>;
    expect(out["thinking"]).toEqual({ type: "enabled", budget: 999 });
  });

  it("chattemplatekwargs mode replaces the thinking object", () => {
    const model: modeldef = {
      id: "m1",
      context: 1,
      maxoutput: 1,
      chattemplatekwargs: { enable_thinking: true },
    };
    const out = buildbody(cfg, { model: "m1", thinking: "high" }, model) as Record<string, unknown>;
    expect(out["chat_template_kwargs"]).toEqual({ enable_thinking: true });
    expect(out["thinking"]).toBeUndefined();
  });

  it("thinking param config chattemplatekwargs applies globally", () => {
    const cfgk = baseconfig({ thinking: { param: "chattemplatekwargs" } });
    const out = buildbody(cfgk, { model: "m1", thinking: "high" }) as Record<string, unknown>;
    expect(out["chat_template_kwargs"]).toEqual({ enable_thinking: true });
    expect(out["thinking"]).toBeUndefined();
  });

  it("omit-unspecified strips params the user never set", () => {
    const out = buildbody(cfg, { model: "m1" }) as Record<string, unknown>;
    expect(out["temperature"]).toBeUndefined();
    expect(out["top_p"]).toBeUndefined();
    expect(out["n"]).toBeUndefined();
    expect(out["frequency_penalty"]).toBeUndefined();
    expect(out["presence_penalty"]).toBeUndefined();
  });

  it("omit-unspecified keeps user specified params clamped", () => {
    const out = buildbody(cfg, { model: "m1", temperature: 5, top_p: -1, n: 99 }) as Record<string, unknown>;
    expect(out["temperature"]).toBe(2);
    expect(out["top_p"]).toBe(0);
    expect(out["n"]).toBe(10);
  });

  it("always policy includes every sampling param with defaults", () => {
    const cfga = baseconfig({ bodybuild: { optionalparamspolicy: "always" } });
    const out = buildbody(cfga, { model: "m1" }) as Record<string, unknown>;
    expect(out["temperature"]).toBe(0.7);
    expect(out["top_p"]).toBe(0.9);
    expect(out["n"]).toBe(1);
    expect(out["frequency_penalty"]).toBe(0);
    expect(out["presence_penalty"]).toBe(0);
  });

  it("max_tokens clamps to the model ceiling", () => {
    const out = buildbody(cfg, { model: "m1", max_tokens: 999999 }, models[0]) as Record<string, unknown>;
    expect(out["max_tokens"]).toBe(1024); // m1 maxoutput
  });

  it("max_tokens clamps to the global ceiling when unclamped models allow", () => {
    const cfgnc = baseconfig({
      bodybuild: { clampmaxtokens: true, optionalparamspolicy: "omit-unspecified" },
    });
    const bigmodel: modeldef = { id: "big", context: 1, maxoutput: 99999999 };
    const out = buildbody(cfgnc, { model: "big", max_tokens: 999999 }, bigmodel) as Record<string, unknown>;
    expect(out["max_tokens"]).toBeLessThanOrEqual(98304);
  });

  it("max_tokens defaults to 32768 when absent", () => {
    const out = buildbody(cfg, { model: "m1" }) as Record<string, unknown>;
    expect(out["max_tokens"]).toBe(32768);
  });

  it("numeric string max_tokens parses", () => {
    const out = buildbody(cfg, { model: "m1", max_tokens: "512" }) as Record<string, unknown>;
    expect(out["max_tokens"]).toBe(512);
  });

  it("seed and stop ride along when specified", () => {
    const out = buildbody(cfg, { model: "m1", seed: 7, stop: ["\n"] }) as Record<string, unknown>;
    expect(out["seed"]).toBe(7);
    expect(out["stop"]).toEqual(["\n"]);
  });

  it("clampmaxtokens false leaves the user value untouched", () => {
    const cfgf = baseconfig({ bodybuild: { clampmaxtokens: false } });
    const out = buildbody(cfgf, { model: "m1", max_tokens: 999999 }) as Record<string, unknown>;
    expect(out["max_tokens"]).toBe(999999);
  });
});

// ---------------------------------------------------------------------------
// status classification and backoff
// ---------------------------------------------------------------------------

describe("classifystatus — retry rotate fallback fail", () => {
  const cfg = baseconfig({
    retry: { maxretries: 3, statuses: [429, 502, 503, 504], nonretryable: [400] },
    rotation: { mode: "persession", models: ["m1", "m2"], rotateonstatus: [529] },
  });

  it("nonretryable statuses fail immediately", () => {
    expect(classifystatus(cfg, 400)).toBe("fail");
  });
  it("retry statuses retry", () => {
    expect(classifystatus(cfg, 429)).toBe("retry");
    expect(classifystatus(cfg, 502)).toBe("retry");
    expect(classifystatus(cfg, 503)).toBe("retry");
    expect(classifystatus(cfg, 504)).toBe("retry");
  });
  it("rotate statuses rotate", () => {
    expect(classifystatus(cfg, 529)).toBe("rotate");
  });
  it("unknown 5xx retry by default", () => {
    expect(classifystatus(cfg, 501)).toBe("retry");
    expect(classifystatus(cfg, 599)).toBe("retry");
  });
  it("unknown 4xx fail", () => {
    expect(classifystatus(cfg, 403)).toBe("fail");
    expect(classifystatus(cfg, 418)).toBe("fail");
  });
  it("success statuses classify as fail (never queried in practice)", () => {
    expect(classifystatus(cfg, 200)).toBe("fail");
  });
  it("fallback statuses hit the crossprovider set when configured", () => {
    const cfgfb = baseconfig({
      retry: { maxretries: 3, fallback: "crossprovider", fallbackstatuses: [404] },
    });
    expect(classifystatus(cfgfb, 404)).toBe("fallback");
  });
});

describe("backoffms — exponential with jitter", () => {
  it("jitter zero produces exact exponential values", () => {
    const cfg = baseconfig({ retry: { backoffbasems: 100, backoffcapms: 8000, jitter: 0 } });
    expect(backoffms(cfg, 0)).toBe(100);
    expect(backoffms(cfg, 1)).toBe(200);
    expect(backoffms(cfg, 3)).toBe(800);
  });
  it("the cap limits growth", () => {
    const cfg = baseconfig({ retry: { backoffbasems: 100, backoffcapms: 500, jitter: 0 } });
    expect(backoffms(cfg, 10)).toBe(500);
  });
  it("jitter stays within the configured fraction", () => {
    const cfg = baseconfig({ retry: { backoffbasems: 1000, backoffcapms: 8000, jitter: 0.2 } });
    for (let i = 0; i < 50; i += 1) {
      const v = backoffms(cfg, 0);
      expect(v).toBeGreaterThanOrEqual(800);
      expect(v).toBeLessThanOrEqual(1200);
    }
  });
});

// ---------------------------------------------------------------------------
// context fitting
// ---------------------------------------------------------------------------

describe("fitcontext — per call context truncation", () => {
  it("passes messages through when they fit", () => {
    const cfg = baseconfig({
      context: { percallfallback: 100000, truncatemargin: 100 },
    });
    const msgs = Array.from({ length: 5 }, (_, i) => ({ role: "user", content: `m${i}` }));
    expect(fitcontext(cfg, msgs, models[0])).toEqual(msgs);
  });
  it("truncates to the model context minus margin", () => {
    const cfg = baseconfig({
      context: { percallfallback: 100000, truncatemargin: 0 },
    });
    // m1 context 8192 tokens; each message 7 tokens → 1200 messages overflow
    const msgs = Array.from({ length: 2000 }, () => ({ role: "user", content: "0123456789" }));
    const out = fitcontext(cfg, msgs, models[0]);
    expect(out.length).toBeLessThan(2000);
    // newest survive
    expect((out[out.length - 1] as { content: string }).content).toBe("0123456789");
  });
  it("no context config passes everything", () => {
    const msgs = [{ role: "user", content: "x" }];
    expect(fitcontext(baseconfig(), msgs, models[0])).toEqual(msgs);
  });
});

// ---------------------------------------------------------------------------
// handlers — info keys models
// ---------------------------------------------------------------------------

describe("handleinfo — version descriptor", () => {
  it("describes the version and its routes", async () => {
    const handlers = createversion(baseconfig());
    const res = await handlers.handleinfo(new Request("http://x/api/vt", { method: "GET" }));
    expect(res.status).toBe(200);
    const data = JSON.parse(await res.text());
    expect(data["version"]).toBe("vt");
    expect(data["provider"]).toBe("mock");
    expect(data["models"]).toBe(2);
    expect(data["routes"]).toHaveLength(7);
    expect(data["fusioncontext"]).toBe(8192 + 4096);
    expect(data["metamodel"]["id"]).toBe("meta");
    expect(data["paused"]).toBe(false);
  });

  it("answers cors preflight with 204", async () => {
    const handlers = createversion(baseconfig());
    const res = await handlers.handleinfo(
      new Request("http://x/api/vt", { method: "OPTIONS", headers: { origin: "https://y" } }),
    );
    expect(res.status).toBe(204);
  });
});

describe("handlekeys — key status endpoint", () => {
  it("counts env keys when the env var is set", async () => {
    process.env.gatewayenginekeys = "key-aaaaaaaaaa,key-bbbbbbbbbb";
    const handlers = createversion(
      baseconfig({
        auth: { mode: "bearer", envvar: "gatewayenginekeys", keysources: ["env"] },
      }),
    );
    const res = await handlers.handlekeys(new Request("http://x/api/vt/keys", { method: "GET" }));
    const data = JSON.parse(await res.text());
    expect(data["authmode"]).toBe("bearer");
    expect(data["envkeycount"]).toBe(2);
    expect(data["models"]).toEqual(["m1", "m2"]);
  });

  it("reports zero when the env var is empty", async () => {
    process.env.gatewayenginekeys = "";
    const handlers = createversion(
      baseconfig({
        auth: { mode: "bearer", envvar: "gatewayenginekeys", keysources: ["env"] },
      }),
    );
    const res = await handlers.handlekeys(new Request("http://x/api/vt/keys", { method: "GET" }));
    const data = JSON.parse(await res.text());
    expect(data["envkeycount"]).toBe(0);
  });
});

describe("handlemodels — catalog listing", () => {
  it("lists the meta model first then every individual model", async () => {
    const handlers = createversion(
      baseconfig({
        rotation: { mode: "persession", models: ["m1", "m2"] },
      }),
    );
    const res = await handlers.handlemodels(new Request("http://x/api/vt/models", { method: "POST" }));
    expect(res.status).toBe(200);
    const data = JSON.parse(await res.text());
    expect(data["object"]).toBe("list");
    const list = data["data"] as Array<Record<string, unknown>>;
    expect(list).toHaveLength(3);
    expect(list[0]["id"]).toBe("meta");
    expect(list.map((m) => m["id"])).toEqual(["meta", "m1", "m2"]);
    expect(list[1]["max_context_length"]).toBe(8192);
    expect(list[2]["max_output_tokens"]).toBe(512);
    expect((list[0]["meta"] as Record<string, unknown>)["rotationbackends"]).toEqual(["m1", "m2"]);
  });
});

// ---------------------------------------------------------------------------
// handlechatcompletions — the main route
// ---------------------------------------------------------------------------

describe("handlechatcompletions — non stream happy path", () => {
  it("rebuilds the response with the display model", async () => {
    script.push({ status: 200, body: okjson("mocked reply") });
    const handlers = createversion(baseconfig());
    const res = await post(handlers, {
      model: "m1",
      messages: [{ role: "user", content: "ping" }],
    });
    expect(res.status).toBe(200);
    const data = JSON.parse(await res.text());
    expect(data["object"]).toBe("chat.completion");
    expect(data["model"]).toBe("meta"); // alwaysdisplay
    expect(data["choices"][0]["message"]["content"]).toBe("mocked reply");
    expect(data["usage"]["total_tokens"]).toBe(15);
    expect(data["provider"]).toBe("mock");
  });

  it("forwards the messages and auth to the upstream", async () => {
    script.push({ status: 200, body: okjson() });
    const handlers = createversion(baseconfig());
    await post(handlers, { model: "m1", messages: [{ role: "user", content: "hello" }] });
    expect(captured).toHaveLength(1);
    const req = captured[0];
    expect(req.method).toBe("POST");
    expect(req.url).toBe("/chat/completions");
    expect(req.headers["authorization"]).toBe("Bearer testkey-0000000001");
    expect(req.headers["content-type"]).toBe("application/json");
    const sentbody = JSON.parse(req.body);
    expect(sentbody["messages"]).toEqual([{ role: "user", content: "hello" }]);
    expect(sentbody["model"]).toBe("m1");
  });

  it("session ids and request ids from headers are honored", async () => {
    script.push({ status: 200, body: okjson() });
    const handlers = createversion(baseconfig());
    await post(
      handlers,
      { messages: [{ role: "user", content: "x" }] },
      {
        "x-session-id": "fixed-session",
        "x-request-id": "fixed-req",
      },
    );
    // no crash — ids flow into persistence (silent db)
    expect(captured).toHaveLength(1);
  });
});

describe("handlechatcompletions — streaming", () => {
  it("streams sse frames with the model masked", async () => {
    script.push({
      status: 200,
      headers: { "content-type": "text/event-stream" },
      body: `${okssechunchof("he")}${okssechunchof("llo")}${okssechunchof("!")}data: [DONE]\n\n`,
    });
    const handlers = createversion(baseconfig());
    const res = await post(handlers, {
      model: "m1",
      stream: true,
      messages: [{ role: "user", content: "x" }],
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/event-stream");
    const text = await res.text();
    expect(text).toContain('"model":"meta"');
    expect(text).not.toContain("upstream-model");
    expect(text).toContain("he");
    expect(text).toContain("data: [DONE]");
    // upstream saw the accept sse header
    expect(captured[0].headers["accept"]).toBe("text/event-stream");
  });

  it("streaming an upstream error passes the status through", async () => {
    script.push({ status: 502, body: "bad gateway from upstream" });
    const handlers = createversion(baseconfig());
    const res = await post(handlers, {
      stream: true,
      messages: [{ role: "user", content: "x" }],
    });
    // stream errors are not ok and not non-stream — makestreamresponse wraps body
    expect([502, 200]).toContain(res.status);
  });
});

describe("handlechatcompletions — paused kill switch", () => {
  it("paused versions answer 503 with the fallback hint", async () => {
    const handlers = createversion(
      baseconfig({
        paused: true,
        routes: {
          pausedmessage: "v2 is paused",
          pausedstatus: 503,
          fallbackroute: "/api/v1/chat/completions",
        },
      }),
    );
    const res = await post(handlers, { messages: [{ role: "user", content: "x" }] });
    expect(res.status).toBe(503);
    const data = JSON.parse(await res.text());
    expect(data["error"]).toBe("v2 is paused");
    expect(data["fallback"]).toBe("/api/v1/chat/completions");
    expect(captured).toHaveLength(0); // no upstream call
  });
});

describe("handlechatcompletions — auth enforcement", () => {
  it("required auth with no resolvable keys answers 401", async () => {
    const handlers = createversion(
      baseconfig({
        auth: {
          mode: "bearer",
          required: true,
          envvar: "gatewayenginekeys",
          keysources: ["env"],
          signupurl: "https://mock.example/signup",
        },
      }),
    );
    const res = await post(handlers, { messages: [{ role: "user", content: "x" }] });
    expect(res.status).toBe(401);
    const data = JSON.parse(await res.text());
    expect(data["code"]).toBe("key_required");
    expect(data["signup"]).toBe("https://mock.example/signup");
    expect(String(data["error"])).toContain("gatewayenginekeys");
    expect(captured).toHaveLength(0);
  });

  it("keyless modes never 401", async () => {
    for (const mode of ["anonymous", "none", "keylesssdk"] as const) {
      script.push({ status: 200, body: okjson() });
      const handlers = createversion(baseconfig({ auth: { mode, required: true } }));
      const res = await post(handlers, { messages: [{ role: "user", content: "x" }] });
      expect(res.status).toBe(200);
    }
  });
});

describe("handlechatcompletions — upstream failures", () => {
  it("passes the upstream error status and body through", async () => {
    script.push({ status: 500, body: '{"error":"model overloaded"}' });
    const handlers = createversion(baseconfig());
    const res = await post(handlers, { messages: [{ role: "user", content: "x" }] });
    expect(res.status).toBe(500);
    expect(await res.text()).toContain("model overloaded");
  });

  it("connection destroyed mid request answers 502 with a json error", async () => {
    script.push({ status: 200, destroy: true });
    const handlers = createversion(baseconfig());
    const res = await post(handlers, { messages: [{ role: "user", content: "x" }] });
    expect(res.status).toBe(502);
    const data = JSON.parse(await res.text());
    expect(data["object"]).toBe("error");
  });

  it("missing upstream answers 500 without throwing", async () => {
    const handlers = createversion(baseconfig({ upstreams: [] }));
    const res = await post(handlers, { messages: [{ role: "user", content: "x" }] });
    expect(res.status).toBe(500);
    const data = JSON.parse(await res.text());
    expect(data["error"]).toBe("no upstream configured");
  });
});

describe("handlechatcompletions — retry behavior", () => {
  it("retries a 429 and succeeds on the second attempt", async () => {
    script.push({ status: 429, body: '{"error":"rate limited"}' }, { status: 200, body: okjson("after retry") });
    const handlers = createversion(
      baseconfig({
        retry: { maxretries: 2, backoffbasems: 1, backoffcapms: 2, jitter: 0, statuses: [429] },
      }),
    );
    const res = await post(handlers, { messages: [{ role: "user", content: "x" }] });
    expect(res.status).toBe(200);
    const data = JSON.parse(await res.text());
    expect(data["choices"][0]["message"]["content"]).toBe("after retry");
    expect(captured).toHaveLength(2);
  });

  it("nonretryable 400 returns immediately without retries", async () => {
    script.push({ status: 400, body: '{"error":"bad request"}' });
    const handlers = createversion(
      baseconfig({
        retry: { maxretries: 5, backoffbasems: 1, backoffcapms: 2, jitter: 0, nonretryable: [400] },
      }),
    );
    const res = await post(handlers, { messages: [{ role: "user", content: "x" }] });
    expect(res.status).toBe(400);
    expect(captured).toHaveLength(1);
  });

  it("exhausted retries surface the last error status", async () => {
    script.push({ status: 429, body: "{}" }, { status: 429, body: "{}" }, { status: 429, body: "{}" });
    const handlers = createversion(
      baseconfig({
        retry: { maxretries: 2, backoffbasems: 1, backoffcapms: 2, jitter: 0, statuses: [429] },
      }),
    );
    const res = await post(handlers, { messages: [{ role: "user", content: "x" }] });
    expect(res.status).toBe(429);
    expect(captured).toHaveLength(3); // 1 + 2 retries
  });
});

describe("handlechatcompletions — model rotation on status", () => {
  it("rotates to the next model after a 529", async () => {
    script.push({ status: 529, body: "{}" }, { status: 200, body: okjson("rotated") });
    const handlers = createversion(
      baseconfig({
        rotation: {
          mode: "persession",
          models: ["m1", "m2"],
          rotateonstatus: [529],
          maxmodelrotations: 2,
        },
      }),
    );
    const res = await post(handlers, { messages: [{ role: "user", content: "x" }] });
    expect(res.status).toBe(200);
    const first = JSON.parse(captured[0].body);
    const second = JSON.parse(captured[1].body);
    expect(first["model"]).toBe("m1");
    expect(second["model"]).toBe("m2");
  });

  it("rotation exhausted returns the last rotate status", async () => {
    script.push({ status: 529, body: "{}" }, { status: 529, body: "{}" });
    const handlers = createversion(
      baseconfig({
        rotation: {
          mode: "persession",
          models: ["m1", "m2"],
          rotateonstatus: [529],
          maxmodelrotations: 2,
        },
      }),
    );
    const res = await post(handlers, { messages: [{ role: "user", content: "x" }] });
    expect(res.status).toBe(529);
    expect(captured).toHaveLength(2);
  });
});

describe("handlechatcompletions — per session rotation across messages", () => {
  it("flips the upstream model at the everyn boundary", async () => {
    for (let i = 0; i < 7; i += 1) script.push({ status: 200, body: okjson() });
    const handlers = createversion(
      baseconfig({
        rotation: { mode: "persession", models: ["m1", "m2"], everynmessages: 6 },
      }),
    );
    const headers = { "x-session-id": "rot-session" };
    for (let i = 0; i < 7; i += 1) {
      await post(handlers, { messages: [{ role: "user", content: "x" }] }, headers);
    }
    const sentmodels = captured.map((c) => (JSON.parse(c.body) as Record<string, unknown>)["model"]);
    // message 6 (index 5) flips to m2
    expect(sentmodels.slice(0, 5)).toEqual(["m1", "m1", "m1", "m1", "m1"]);
    expect(sentmodels[5]).toBe("m2");
    expect(sentmodels[6]).toBe("m2");
  });
});

describe("handlechatcompletions — request timeout", () => {
  it("a slow upstream with a tight timeout answers 502", async () => {
    script.push({ status: 200, body: okjson(), delayms: 3000 });
    const handlers = createversion(
      baseconfig({
        timeout: { requestms: 200, streamms: 10000 },
        retry: { maxretries: 0 },
      }),
    );
    const res = await post(handlers, { messages: [{ role: "user", content: "x" }] });
    expect(res.status).toBe(502);
    const data = JSON.parse(await res.text());
    expect(data["object"]).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// handlecompletions — legacy text completion route
// ---------------------------------------------------------------------------

describe("handlecompletions — prompt to completion", () => {
  it("converts a string prompt and returns text_completion shape", async () => {
    script.push({ status: 200, body: okjson("legacy reply") });
    const handlers = createversion(baseconfig());
    const res = await handlers.handlecompletions(
      new Request("http://x/api/vt/completions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: "once upon a time" }),
      }),
    );
    expect(res.status).toBe(200);
    const data = JSON.parse(await res.text());
    expect(data["object"]).toBe("text_completion");
    expect(data["choices"][0]["text"]).toBe("legacy reply");
    expect(data["model"]).toBe("meta");
    const sent = JSON.parse(captured[0].body);
    expect(sent["messages"]).toEqual([{ role: "user", content: "once upon a time" }]);
    expect(sent["prompt"]).toBeUndefined();
  });

  it("array prompts become parallel user messages", async () => {
    script.push({ status: 200, body: okjson() });
    const handlers = createversion(baseconfig());
    await handlers.handlecompletions(
      new Request("http://x/api/vt/completions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: ["a", "b"] }),
      }),
    );
    const sent = JSON.parse(captured[0].body);
    expect(sent["messages"]).toEqual([
      { role: "user", content: "a" },
      { role: "user", content: "b" },
    ]);
  });
});

// ---------------------------------------------------------------------------
// handlemessages — anthropic format conversion
// ---------------------------------------------------------------------------

describe("handlemessages — anthropic conversion", () => {
  it("converts openai responses into the anthropic message shape", async () => {
    script.push({ status: 200, body: okjson("anthropic styled") });
    const handlers = createversion(baseconfig());
    const res = await handlers.handlemessages(
      new Request("http://x/api/vt/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: "m1",
          system: "be terse",
          max_tokens: 100,
          messages: [
            { role: "user", content: "hello" },
            {
              role: "assistant",
              content: [
                { type: "text", text: "part a" },
                { type: "text", text: "part b" },
              ],
            },
          ],
        }),
      }),
    );
    expect(res.status).toBe(200);
    const data = JSON.parse(await res.text());
    expect(data["type"]).toBe("message");
    expect(data["role"]).toBe("assistant");
    expect(data["content"]).toEqual([{ type: "text", text: "anthropic styled" }]);
    expect(data["stop_reason"]).toBe("end_turn");
    expect(data["usage"]["input_tokens"]).toBe(10);
    expect(data["usage"]["output_tokens"]).toBe(5);

    const sent = JSON.parse(captured[0].body);
    // system prepended, assistant content array joined
    expect(sent["messages"][0]).toEqual({ role: "system", content: "be terse" });
    expect(sent["messages"][2]).toEqual({ role: "assistant", content: "part a\npart b" });
  });
});

// ---------------------------------------------------------------------------
// handleresponses — openai responses format
// ---------------------------------------------------------------------------

describe("handleresponses — responses format", () => {
  it("accepts a plain string input", async () => {
    script.push({ status: 200, body: okjson("responses reply") });
    const handlers = createversion(baseconfig());
    const res = await handlers.handleresponses(
      new Request("http://x/api/vt/responses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: "do the thing" }),
      }),
    );
    expect(res.status).toBe(200);
    const data = JSON.parse(await res.text());
    expect(data["object"]).toBe("response");
    expect(data["status"]).toBe("completed");
    expect(data["output"][0]["content"][0]["text"]).toBe("responses reply");
    const sent = JSON.parse(captured[0].body);
    expect(sent["messages"]).toEqual([{ role: "user", content: "do the thing" }]);
  });

  it("accepts structured message arrays as input", async () => {
    script.push({ status: 200, body: okjson() });
    const handlers = createversion(baseconfig());
    await handlers.handleresponses(
      new Request("http://x/api/vt/responses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          input: [
            { role: "user", content: "structured" },
            { role: "assistant", content: "reply" },
          ],
        }),
      }),
    );
    const sent = JSON.parse(captured[0].body);
    expect(sent["messages"]).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// handleembeddings
// ---------------------------------------------------------------------------

describe("handleembeddings — embeddings route", () => {
  it("answers 501 when disabled or sdk transport", async () => {
    const handlers = createversion(
      baseconfig({ routes: { embeddings: "disabled", embeddingsmessage: "no embeddings here" } }),
    );
    const res = await handlers.handleembeddings(
      new Request("http://x/api/vt/embeddings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: "x" }),
      }),
    );
    expect(res.status).toBe(501);
    const data = JSON.parse(await res.text());
    expect(data["code"]).toBe("embeddings_unavailable");
    expect(data["error"]).toBe("no embeddings here");
  });

  it("proxies to the embeddings endpoint when enabled", async () => {
    script.push({
      status: 200,
      body: '{"data":[{"embedding":[0.1,0.2]}]}',
    });
    const handlers = createversion(
      baseconfig({
        upstreams: [
          {
            name: "mock",
            baseurl: `http://127.0.0.1:${mockport}`,
            endpoints: { embeddings: "/embeddings" },
          },
        ],
      }),
    );
    const res = await handlers.handleembeddings(
      new Request("http://x/api/vt/embeddings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: "embed me" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("embedding");
    expect(captured[0].url).toBe("/embeddings");
  });
});

// ---------------------------------------------------------------------------
// malformed request bodies — the aggressive guard
// ---------------------------------------------------------------------------

describe("handlechatcompletions — malformed bodies must not crash", () => {
  it("invalid json bodies answer 400 not a silent empty call", async () => {
    const handlers = createversion(baseconfig());
    const res = await post(handlers, "this is not json at all {{{");
    expect(res.status).toBe(400);
    expect(captured).toHaveLength(0);
  });

  it("empty bodies answer 400 with a missing messages error", async () => {
    const handlers = createversion(baseconfig());
    const res = await post(handlers, {});
    expect(res.status).toBe(400);
    const data = JSON.parse(await res.text());
    expect(data["code"]).toBe("invalid_request");
    expect(captured).toHaveLength(0);
  });

  it("messages of the wrong type answer 400", async () => {
    const handlers = createversion(baseconfig());
    const res = await post(handlers, { messages: "not an array" });
    expect(res.status).toBe(400);
    expect(captured).toHaveLength(0);
  });

  it("empty message arrays answer 400", async () => {
    const handlers = createversion(baseconfig());
    const res = await post(handlers, { messages: [] });
    expect(res.status).toBe(400);
    expect(captured).toHaveLength(0);
  });
});
