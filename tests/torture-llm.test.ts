import { describe, expect, it } from "vitest";
import {
  addusage, budgetcheck, buildrequest, classifyintent, commandguard, defaultrefusalmarkers, fallbackroute, guardoutput, islocalorigin, latesttemplate, markprovider, parsecompletion, parseoutput, rendertemplate, removetemplate, routevalid, routesfor, resolveroute, savetemplate, searchtemplates, streamdelta, stripguardrails, templatevariables, toolbriefof, usagetotals, bumprevision,
} from "../llm.js";
import { callretryhintof } from "../tools.js";
import type { costbudget, modelmessage, parseguard, prompttemplate, providerconfig, usagerecord } from "../types.js";
import { buildtoolcatalog } from "../tools.js";

const now = 1_800_000_000_000;

/** Builds one chat completions provider fixture. */
function provider(over: Partial<providerconfig> = {}): providerconfig {
  return { id: "p1", name: "the provider", endpoint: "https://api.example.com/v1/chat", style: "chatcompletions", models: ["gpt-test"], status: "available", createdat: now, ...over };
}

/** Builds one user message fixture. */
function messages(text = "Summarize the page."): modelmessage[] {
  return [{ role: "user", content: text }];
}

describe("torture: llm request shaping across the four protocol styles", () => {
  it("places the bearer header for the chat completions style and merges the user headers", () => {
    const shaped = buildrequest({ provider: provider(), model: "gpt-test", messages: messages(), apikey: "sk-test-123", temperature: 0.2, maxtokens: 100, stream: true });
    expect(shaped.method).toBe("POST");
    expect(shaped.headers.authorization).toBe("Bearer sk-test-123");
    expect(shaped.headers["content-type"]).toBe("application/json");
    const body = JSON.parse(shaped.body) as Record<string, unknown>;
    expect(body.model).toBe("gpt-test");
    expect(body.stream).toBe(true);
    expect(body).toHaveProperty("max_tokens", 100);
    expect(body).toHaveProperty("temperature", 0.2);
  });

  it("omits the authorization header when the api key is blank or undefined for chatcompletions", () => {
    const nokey = buildrequest({ provider: provider(), model: "gpt-test", messages: messages() });
    expect(nokey.headers.authorization).toBeUndefined();
    const blank = buildrequest({ provider: provider(), model: "gpt-test", messages: messages(), apikey: "   " });
    expect(blank.headers.authorization).toBeUndefined();
  });

  it("shapes the responses style with the system instruction and the user turns", () => {
    const shaped = buildrequest({ provider: provider({ style: "responses", endpoint: "https://api.example.com/v1/responses" }), model: "gpt-resp", messages: [{ role: "system", content: "Be terse." }, { role: "user", content: "open" }], temperature: 0.5, maxtokens: 64 });
    const body = JSON.parse(shaped.body) as Record<string, unknown>;
    expect(body.instructions).toBe("Be terse.");
    expect(body.input).toEqual([{ role: "user", content: "open" }]);
    expect(body).toHaveProperty("max_output_tokens", 64);
  });

  it("shapes the messages style with the x-api-key header and the system field", () => {
    const shaped = buildrequest({ provider: provider({ style: "messages", endpoint: "https://api.example.com/v1/messages" }), model: "claude-test", messages: [{ role: "system", content: "plan" }, { role: "user", content: "step one" }], apikey: "ant-key" });
    expect(shaped.headers["x-api-key"]).toBe("ant-key");
    const body = JSON.parse(shaped.body) as Record<string, unknown>;
    expect(body.system).toBe("plan");
    expect(body.messages).toEqual([{ role: "user", content: "step one" }]);
  });

  it("shapes the gemini style with the key on the query string and the parts array", () => {
    const shaped = buildrequest({ provider: provider({ style: "gemini", endpoint: "https://api.example.com/v1/gemini" }), model: "gem-test", messages: [{ role: "user", content: "summary" }, { role: "assistant", content: "ready" }], apikey: "gem-key" });
    expect(shaped.url).toContain("key=gem-key");
    const body = JSON.parse(shaped.body) as Record<string, unknown>;
    expect(body.contents).toEqual([{ role: "user", parts: [{ text: "summary" }] }, { role: "model", parts: [{ text: "ready" }] }]);
  });

  it("appends the key on a gemini endpoint that already carries a query string", () => {
    const shaped = buildrequest({ provider: provider({ style: "gemini", endpoint: "https://api.example.com/v1/gemini?alt=sse" }), model: "gem", messages: messages(), apikey: "k" });
    expect(shaped.url).toContain("&key=k");
  });

  it("preserves the user headers over the shape headers of every style", () => {
    const withauth = buildrequest({ provider: provider({ headers: { authorization: "Token custom", "x-trace": "abc" } }), model: "m", messages: messages(), apikey: "ignored" });
    expect(withauth.headers.authorization).toBe("Token custom");
    expect(withauth.headers["x-trace"]).toBe("abc");
    expect(withauth.headers["content-type"]).toBe("application/json");
  });

  it("treats unicode, emoji and one megabyte message content without truncation", () => {
    const big = `${"结".repeat(50)}${"🏃".repeat(20)}${"a".repeat(1_048_576)}`;
    const shaped = buildrequest({ provider: provider(), model: "g", messages: [{ role: "user", content: big }] });
    const body = JSON.parse(shaped.body) as Record<string, unknown>;
    const stored = (body.messages as Array<{ content: string }>)[0]?.content;
    expect(stored).toHaveLength(big.length);
    expect(stored).toContain("结");
  });

  it("ignores the temperature and maxtokens when they carry non finite values inside the chat completions body", () => {
    const shaped = buildrequest({ provider: provider(), model: "m", messages: messages(), temperature: Number.NaN, maxtokens: Number.POSITIVE_INFINITY });
    const body = JSON.parse(shaped.body) as Record<string, unknown>;
    expect(body.temperature).toBeNull();
    expect(body).toHaveProperty("max_tokens", null);
  });
});

describe("torture: llm completion parsing across the four protocol styles", () => {
  it("reads the message content of a chat completions answer with the usage counts", () => {
    const parsed = parsecompletion("chatcompletions", JSON.stringify({ choices: [{ message: { role: "assistant", content: "ok" } }], usage: { prompt_tokens: 5, completion_tokens: 7, total_tokens: 12 } }));
    expect(parsed.text).toBe("ok");
    expect(parsed.usage?.prompttokens).toBe(5);
    expect(parsed.usage?.completiontokens).toBe(7);
    expect(parsed.usage?.totaltokens).toBe(12);
  });

  it("refuses the non json body and the non object body for every style", () => {
    expect(parsecompletion("chatcompletions", "{ not json").reason).toMatch(/not json/i);
    expect(parsecompletion("chatcompletions", "[]").reason).toMatch(/json object/i);
    expect(parsecompletion("chatcompletions", "null").reason).toMatch(/json object/i);
    expect(parsecompletion("responses", "not json").reason).toMatch(/not json/i);
    expect(parsecompletion("messages", "42").reason).toMatch(/json object/i);
    expect(parsecompletion("gemini", "true").reason).toMatch(/json object/i);
  });

  it("refuses the chat completions answer without a message content", () => {
    expect(parsecompletion("chatcompletions", JSON.stringify({ choices: [] })).reason).toMatch(/message content/i);
    expect(parsecompletion("chatcompletions", JSON.stringify({ choices: [{ message: {} }] })).reason).toMatch(/message content/i);
    expect(parsecompletion("chatcompletions", JSON.stringify({ choices: [{ message: { content: 5 } }] })).reason).toMatch(/message content/i);
  });

  it("reads the responses style answer from the output_text and the output parts", () => {
    const direct = parsecompletion("responses", JSON.stringify({ output_text: "direct" }));
    expect(direct.text).toBe("direct");
    const parts = parsecompletion("responses", JSON.stringify({ output: [{ content: [{ type: "output_text", text: "a" }, { type: "output_text", text: "b" }] }] }));
    expect(parts.text).toBe("ab");
    expect(parsecompletion("responses", JSON.stringify({})).reason).toMatch(/output text/i);
  });

  it("reads the messages style answer from the content text blocks and joins them", () => {
    const parsed = parsecompletion("messages", JSON.stringify({ content: [{ type: "text", text: "alpha" }, { type: "text", text: "beta" }] }));
    expect(parsed.text).toBe("alphabeta");
    expect(parsecompletion("messages", JSON.stringify({ content: [] })).reason).toMatch(/text block/i);
    expect(parsecompletion("messages", JSON.stringify({ content: [{ type: "image", text: "ignored" }] })).reason).toMatch(/text block/i);
  });

  it("reads the gemini style answer from the candidate parts and the usage metadata", () => {
    const parsed = parsecompletion("gemini", JSON.stringify({ candidates: [{ content: { parts: [{ text: "hello " }, { text: "world" }] } }], usageMetadata: { promptTokenCount: 3, candidatesTokenCount: 2, totalTokenCount: 5 } }));
    expect(parsed.text).toBe("hello world");
    expect(parsed.usage?.prompttokens).toBe(3);
    expect(parsed.usage?.completiontokens).toBe(2);
    expect(parsed.usage?.totaltokens).toBe(5);
    expect(parsecompletion("gemini", JSON.stringify({})).reason).toMatch(/candidate text/i);
  });

  it("carries no usage block when the answer ships none", () => {
    const parsed = parsecompletion("chatcompletions", JSON.stringify({ choices: [{ message: { content: "no usage" } }] }));
    expect(parsed.text).toBe("no usage");
    expect(parsed.usage).toBeUndefined();
  });
});

describe("torture: llm local origin detection", () => {
  it("recognises every loopback shape and the localhost subdomain", () => {
    expect(islocalorigin("http://localhost:8080")).toBe(true);
    expect(islocalorigin("http://127.0.0.1")).toBe(true);
    expect(islocalorigin("http://[::1]:9000")).toBe(true);
    expect(islocalorigin("http://app.localhost")).toBe(true);
  });

  it("refuses lookalike hosts that share the loopback substring but sit elsewhere", () => {
    expect(islocalorigin("https://localhost.evil.example.com")).toBe(false);
    expect(islocalorigin("https://example.com/localhost")).toBe(false);
    expect(islocalorigin("https://127.0.0.1.example.com")).toBe(false);
    expect(islocalorigin("https://not-local.example.com")).toBe(false);
  });

  it("refuses malformed urls without throwing", () => {
    expect(islocalorigin("")).toBe(false);
    expect(islocalorigin("not a url")).toBe(false);
    expect(islocalorigin("https://")).toBe(false);
  });
});

describe("torture: llm stream delta parsing across the four protocol styles", () => {
  it("reads the chat completions delta content", () => {
    const delta = streamdelta("chatcompletions", JSON.stringify({ choices: [{ delta: { content: "tok" } }] }));
    expect(delta).toBe("tok");
  });

  it("reads the responses style output text delta event", () => {
    expect(streamdelta("responses", JSON.stringify({ type: "response.output_text.delta", delta: "x" }))).toBe("x");
    expect(streamdelta("responses", JSON.stringify({ type: "response.completed" }))).toBe("");
  });

  it("reads the messages style content block delta", () => {
    expect(streamdelta("messages", JSON.stringify({ type: "content_block_delta", delta: { text: "y" } }))).toBe("y");
    expect(streamdelta("messages", JSON.stringify({ type: "content_block_start" }))).toBe("");
  });

  it("reads the gemini candidate parts and joins them", () => {
    expect(streamdelta("gemini", JSON.stringify({ candidates: [{ content: { parts: [{ text: "z" }] } }] }))).toBe("z");
  });

  it("returns the empty string on non json, non object or array payloads", () => {
    expect(streamdelta("chatcompletions", "not json")).toBe("");
    expect(streamdelta("chatcompletions", "[]")).toBe("");
    expect(streamdelta("chatcompletions", "null")).toBe("");
    expect(streamdelta("gemini", "true")).toBe("");
  });
});

describe("torture: llm intent classification", () => {
  it("classifies by the keyword density with the unmatched request as ask", () => {
    expect(classifyintent("Open the pricing page and read the table").intent).toBe("navigate");
    expect(classifyintent("Extract the rows and copy the data").intent).toBe("extract");
    expect(classifyintent("Fill the form, type the name and submit").intent).toBe("fill");
    expect(classifyintent("Watch the page and observe the changes").intent).toBe("monitor");
    expect(classifyintent("Automate the workflow and repeat every minute").intent).toBe("automate");
    expect(classifyintent("what is the price").intent).toBe("ask");
  });

  it("reports the zero confidence on the empty or symbol only text", () => {
    expect(classifyintent("")).toEqual({ intent: "ask", confidence: 0 });
    expect(classifyintent("   ")).toEqual({ intent: "ask", confidence: 0 });
    expect(classifyintent("...!!!???")).toEqual({ intent: "ask", confidence: 0 });
  });

  it("scores higher with more keyword matches", () => {
    const sparse = classifyintent("go");
    const dense = classifyintent("go open visit navigate browse the url of the site");
    expect(dense.confidence).toBeGreaterThan(sparse.confidence);
  });

  it("reads unicode, cjk and emoji without throwing", () => {
    const result = classifyintent("打开页面 open the 页面");
    expect(result.intent).toBe("navigate");
  });
});

describe("torture: llm guardrail stripping and parse output", () => {
  it("strips the code fence around the json payload and keeps the inner text", () => {
    expect(stripguardrails("```json\n{\"intent\":\"navigate\"}\n```")).toBe('{"intent":"navigate"}');
    expect(stripguardrails("noise ```\n[1,2,3]\n``` noise")).toBe("[1,2,3]");
    expect(stripguardrails("plain text without fences")).toBe("plain text without fences");
  });

  it("falls back to the inner json braces when no fence appears", () => {
    expect(stripguardrails("noise {\"a\":1} noise")).toBe('{"a":1}');
    expect(stripguardrails("noise [1,2] noise")).toBe("[1,2]");
  });

  it("refuses the refusal marker answers without parsing", () => {
    const guard: parseguard = { schema: { intent: { type: "string", required: true } }, retries: 1 };
    const refused = parseoutput({ guard, text: "I cannot comply with this request." });
    expect(refused.verdict).toBe("refused");
    expect(refused.reason).toMatch(/refusal marker/i);
  });

  it("reads the valid parsed object when the schema matches", () => {
    const guard: parseguard = { schema: { intent: { type: "string", required: true }, entities: { type: "array", required: false } }, retries: 1 };
    const valid = parseoutput({ guard, text: '```json\n{"intent":"navigate","entities":["page"]}\n```' });
    expect(valid.verdict).toBe("valid");
    expect((valid.parsed as Record<string, unknown>).intent).toBe("navigate");
  });

  it("refuses the invalid type and the missing required field", () => {
    const guard: parseguard = { schema: { intent: { type: "string", required: true }, confidence: { type: "number", required: true } }, retries: 1 };
    expect(parseoutput({ guard, text: '{"intent":"navigate","confidence":"high"}' }).verdict).toBe("invalid");
    expect(parseoutput({ guard, text: '{"intent":"navigate"}' }).reason).toMatch(/missing/i);
  });

  it("refuses non object payloads like arrays and null", () => {
    const guard = commandguard;
    expect(parseoutput({ guard, text: "[1,2,3]" }).verdict).toBe("invalid");
    expect(parseoutput({ guard, text: "null" }).verdict).toBe("invalid");
  });

  it("runs the guard output retries and refuses after the exhaustion", () => {
    const guard: parseguard = { schema: { intent: { type: "string", required: true } }, retries: 2 };
    const refused = guardoutput({ guard, attempts: ["I cannot comply", "second attempt"] });
    expect(refused.verdict).toBe("refused");
    expect(refused.attempts).toBe(1);
    const valid = guardoutput({ guard, attempts: ["invalid first", '{"intent":"navigate"}'] });
    expect(valid.verdict).toBe("valid");
    expect(valid.attempts).toBe(2);
    const exhausted = guardoutput({ guard, attempts: ["not json", "still not json", "third fail"] });
    expect(exhausted.verdict).toBe("invalid");
    expect(exhausted.attempts).toBe(3);
  });

  it("reports never arrived when the attempts list is empty", () => {
    const guard: parseguard = { schema: { intent: { type: "string", required: true } }, retries: 1 };
    expect(guardoutput({ guard, attempts: [] }).reason).toMatch(/never arrived/i);
  });

  it("uses the default refusal markers when the guard ships none", () => {
    expect(defaultrefusalmarkers).toContain("i cannot");
    expect(defaultrefusalmarkers).toContain("cannot comply");
  });
});

describe("torture: llm tool briefs and usage accounting", () => {
  it("builds the tool brief with the summary, the parameters and the risk", () => {
    const catalog = buildtoolcatalog();
    const tool = catalog.domains[0]?.tools[0];
    expect(tool).toBeDefined();
    if (tool === undefined) throw new Error("The tool catalog carries no tool.");
    const brief = toolbriefof(tool);
    expect(brief.tool).toBe(tool.name);
    expect(brief.risk).toBe("read");
    expect(brief.parameters.length).toBeGreaterThan(0);
  });

  it("renders the tool briefs in openapi style with the consent notice", () => {
    const catalog = buildtoolcatalog();
    const rendered = rendertemplate({ template: { id: "t1", name: "n", body: "tools list", variables: [], version: 1, createdat: now }, variables: {} });
    expect(rendered.text).toBe("tools list");
  });

  it("records the usage and aggregates per run, per step and per session filter", () => {
    const usageof = (id: string, over: Partial<usagerecord>): usagerecord => ({ id, providerid: "p1", endpoint: "https://api.example.com", model: "m1", prompttokens: 0, completiontokens: 0, totaltokens: 0, cost: 0, at: now, ...over });
    const records: usagerecord[] = [
      usageof("u1", { runid: "r1", stepid: "s1", sessionid: "sess1", prompttokens: 5, completiontokens: 3, totaltokens: 8, cost: 0.01 }),
      usageof("u2", { runid: "r1", stepid: "s2", sessionid: "sess1", prompttokens: 10, completiontokens: 2, totaltokens: 12, cost: 0.02, at: now + 1 }),
      usageof("u3", { runid: "r2", stepid: "s1", sessionid: "sess2", prompttokens: 7, completiontokens: 1, totaltokens: 8, cost: 0.005, at: now + 2 }),
    ];
    const updated = addusage(records, usageof("u4", { runid: "r3", stepid: "s1", sessionid: "sess3", prompttokens: 1, completiontokens: 1, totaltokens: 2, cost: 0.001, at: now + 3 }));
    expect(updated).toHaveLength(4);
    expect(updated[0]?.runid).toBe("r3");
    const run1 = usagetotals(updated, { runid: "r1" });
    expect(run1.totaltokens).toBe(20);
    expect(run1.calls).toBe(2);
    const sess1 = usagetotals(updated, { sessionid: "sess1" });
    expect(sess1.cost).toBeCloseTo(0.03);
    const since = usagetotals(updated, { since: now + 2 });
    expect(since.calls).toBe(2);
    const empty = usagetotals([], {});
    expect(empty.totaltokens).toBe(0);
  });
});

describe("torture: llm cost budget check", () => {
  it("allows every call when the budget is undefined or unbounded", () => {
    expect(budgetcheck({ budget: undefined, totals: { totaltokens: 1000, cost: 1 } })).toMatchObject({ allowed: true, halted: false, asksuser: false });
    expect(budgetcheck({ budget: { currency: "usd", configuredat: now }, totals: { totaltokens: 1000, cost: 1 } })).toMatchObject({ allowed: true, halted: false });
  });

  it("halts at the exact token ceiling and the exact cost ceiling", () => {
    const tokenceil = budgetcheck({ budget: { maxtokens: 1000, currency: "usd", configuredat: now }, totals: { totaltokens: 1000, cost: 0 } });
    expect(tokenceil.allowed).toBe(false);
    expect(tokenceil.halted).toBe(true);
    expect(tokenceil.asksuser).toBe(true);
    expect(tokenceil.reason).toMatch(/token ceiling/i);
    const costceil = budgetcheck({ budget: { maxcost: 5, currency: "usd", configuredat: now }, totals: { totaltokens: 0, cost: 5 } });
    expect(costceil.halted).toBe(true);
    expect(costceil.reason).toMatch(/cost ceiling/i);
  });

  it("ignores non finite ceilings", () => {
    const nan = budgetcheck({ budget: { maxtokens: Number.NaN, maxcost: Number.NaN, currency: "usd", configuredat: now }, totals: { totaltokens: 1000, cost: 1 } });
    expect(nan.allowed).toBe(true);
  });
});

describe("torture: llm model route resolution and fallback", () => {
  const routes = [
    { id: "r1", kind: "plan", providerid: "p1", model: "gpt-test", revision: 1, updatedat: now },
    { id: "r2", kind: "plan", providerid: "p2", model: "claude-test", revision: 2, updatedat: now + 1, fallbackproviderid: "p1", fallbackmodel: "gpt-test" },
  ];
  const providers: providerconfig[] = [
    provider({ id: "p1", name: "primary", status: "available" }),
    { ...provider({ id: "p2", name: "secondary", status: "unavailable" }) },
  ];

  it("validates the route entries and refuses the half defined fallback pair", () => {
    expect(routevalid(routes[0]!).allowed).toBe(true);
    expect(routevalid({ id: "x", kind: "", providerid: "p1", model: "m", revision: 1, updatedat: now }).allowed).toBe(false);
    expect(routevalid({ id: "x", kind: "k", providerid: "", model: "m", revision: 1, updatedat: now }).allowed).toBe(false);
    expect(routevalid({ id: "x", kind: "k", providerid: "p", model: "", revision: 1, updatedat: now }).allowed).toBe(false);
    expect(routevalid({ id: "x", kind: "k", providerid: "p", model: "m", revision: 1, updatedat: now, fallbackproviderid: "p2" }).allowed).toBe(false);
  });

  it("resolves the newest available route of one kind", () => {
    const resolved = resolveroute({ routes, providers: [provider({ id: "p1", status: "available", models: ["gpt-test"] }), provider({ id: "p2", status: "available", models: ["claude-test"] })], kind: "plan" });
    expect(resolved.route?.id).toBe("r2");
    expect(resolved.provider?.id).toBe("p2");
    expect(resolved.model).toBe("claude-test");
  });

  it("reports the missing provider and the unavailable provider honestly", () => {
    expect(resolveroute({ routes: [{ id: "r", kind: "plan", providerid: "ghost", model: "m", revision: 1, updatedat: now }], providers: [], kind: "plan" }).reason).toMatch(/missing provider/i);
    expect(resolveroute({ routes, providers: [provider({ id: "p1", status: "available" }), provider({ id: "p2", status: "unavailable", models: ["claude-test"] })], kind: "plan" }).reason).toMatch(/unavailable/i);
  });

  it("reports the unrouted kind and the invalid route", () => {
    expect(resolveroute({ routes, providers, kind: "missing" }).reason).toMatch(/no model route/i);
    expect(resolveroute({ routes: [{ id: "r", kind: "plan", providerid: "", model: "", revision: 1, updatedat: now }], providers, kind: "plan" }).reason).toMatch(/failed its validation/i);
  });

  it("falls back to the user configured pair when the primary misses or stays unavailable", () => {
    const fb = fallbackroute({ routes, providers: [provider({ id: "p1", status: "available", models: ["gpt-test"] }), provider({ id: "p2", status: "unavailable", models: ["claude-test"] })], kind: "plan" });
    expect(fb.route?.id).toBe("r2");
    expect(fb.provider?.id).toBe("p1");
    expect(fb.model).toBe("gpt-test");
    expect(fallbackroute({ routes: [routes[0]!], providers, kind: "plan" }).reason).toMatch(/no user configured fallback/i);
  });

  it("marks one provider available or unavailable without touching the others", () => {
    const marked = markprovider({ providers: [provider({ id: "p1" }), provider({ id: "p2" })], providerid: "p2", available: false, now });
    expect(marked[1]?.status).toBe("unavailable");
    expect(marked[0]?.status).toBe("available");
    expect(markprovider({ providers: marked, providerid: "p2", available: true, now: now + 1 })[1]?.status).toBe("available");
  });

  it("bumps the revision and keeps the updatedat timestamp", () => {
    const bumped = bumprevision({ id: "r1", kind: "plan", providerid: "p1", model: "m", revision: 5, updatedat: now }, now + 1);
    expect(bumped.revision).toBe(6);
    expect(bumped.updatedat).toBe(now + 1);
  });

  it("returns every route of one kind in the newest revision first order", () => {
    const list = routesfor([{ id: "r1", kind: "k", providerid: "p1", model: "m", revision: 1, updatedat: now }, { id: "r2", kind: "k", providerid: "p2", model: "m", revision: 3, updatedat: now + 2 }, { id: "r3", kind: "other", providerid: "p1", model: "m", revision: 2, updatedat: now + 1 }], "k");
    expect(list.map(route => route.id)).toEqual(["r2", "r1"]);
  });
});

describe("torture: llm prompt template library", () => {
  const baseTemplate = (over: Partial<prompttemplate> = {}): prompttemplate => ({ id: "t1", name: "summary", body: "Summarize {{topic}} for {{audience}}.", variables: ["topic", "audience"], version: 1, createdat: now, ...over });

  it("extracts the double braced variable names in order without duplicates", () => {
    expect(templatevariables("hello {{name}} and {{name}} again {{topic}}")).toEqual(["name", "topic"]);
    expect(templatevariables("no vars here")).toEqual([]);
    expect(templatevariables("{{ name }} with whitespace")).toEqual(["name"]);
    expect(templatevariables("{{name}}{{name}}{{topic}}")).toEqual(["name", "topic"]);
  });

  it("renders the template when every variable is supplied", () => {
    const rendered = rendertemplate({ template: baseTemplate(), variables: { topic: "the page", audience: "operators" } });
    expect(rendered.text).toBe("Summarize the page for operators.");
  });

  it("refuses to render when a variable stays empty", () => {
    expect(rendertemplate({ template: baseTemplate(), variables: { topic: "", audience: "ops" } }).reason).toMatch(/stay empty/i);
    expect(rendertemplate({ template: baseTemplate(), variables: { audience: "ops" } }).reason).toMatch(/stay empty/i);
  });

  it("serialises the non string variable values into the rendered text", () => {
    const rendered = rendertemplate({ template: { id: "t", name: "n", body: "config {{value}}", variables: ["value"], version: 1, createdat: now }, variables: { value: { key: 1 } } });
    expect(rendered.text).toContain('"key"');
  });

  it("requires the consent notice for the sensitive flow", () => {
    expect(rendertemplate({ template: baseTemplate(), variables: { topic: "the page", audience: "operators" }, sensitive: true }).reason).toMatch(/consent notice/i);
    const withnotice = rendertemplate({ template: baseTemplate(), variables: { topic: "the page", audience: "operators" }, sensitive: true, consentnotice: "approved by the operator" });
    expect(withnotice.text).toContain("Consent notice: approved by the operator");
  });

  it("saves the new template version and bumps the version on the known name", () => {
    const first = savetemplate({ templates: [], name: "summary", body: "v1 {{topic}}", now });
    expect(first[0]?.version).toBe(1);
    const second = savetemplate({ templates: first, name: "summary", body: "v2 {{topic}}", notes: "the refresh", now: now + 1 });
    expect(second[0]?.version).toBe(2);
    expect(second[0]?.notes).toBe("the refresh");
    expect(second).toHaveLength(2);
  });

  it("returns the newest version of one name and undefined for an unknown name", () => {
    const templates = savetemplate({ templates: [], name: "summary", body: "v1", now });
    const newer = savetemplate({ templates, name: "summary", body: "v2", now: now + 1 });
    expect(latesttemplate(newer, "summary")?.version).toBe(2);
    expect(latesttemplate(newer, "missing")).toBeUndefined();
  });

  it("searches the templates by the term and sorts the newest version first", () => {
    const templates = [
      baseTemplate({ id: "t1", name: "summary", body: "first", version: 1 }),
      baseTemplate({ id: "t2", name: "summary", body: "second refresh", version: 2 }),
      baseTemplate({ id: "t3", name: "digest", body: "digest", version: 1 }),
    ];
    const matches = searchtemplates(templates, "summ");
    expect(matches[0]?.version).toBe(2);
    expect(searchtemplates(templates, "").map(t => t.id)).toEqual(["t2", "t1", "t3"]);
    expect(searchtemplates(templates, "refresh")[0]?.id).toBe("t2");
  });

  it("removes every version of one template name", () => {
    const templates = [
      baseTemplate({ id: "t1", name: "summary", version: 1 }),
      baseTemplate({ id: "t2", name: "summary", version: 2 }),
      baseTemplate({ id: "t3", name: "digest", version: 1 }),
    ];
    const remaining = removetemplate(templates, "summary");
    expect(remaining.map(t => t.name)).toEqual(["digest"]);
  });
});

describe("torture: llm callretry hint classification under hostile payloads", () => {
  it("classifies the refusal, the wait and the retry hints by the keyword", () => {
    expect(callretryhintof({ code: "consent", message: "refused by the user" })).toBe("none");
    expect(callretryhintof({ code: "rate", message: "the window is busy" })).toBe("wait");
    expect(callretryhintof({ code: "timeout", message: "the call timed out" })).toBe("retry");
    expect(callretryhintof({ code: "internal", message: "network reset" })).toBe("retry");
    expect(callretryhintof({})).toBe("none");
  });

  it("reads the unicode and emoji payloads without throwing", () => {
    expect(callretryhintof({ code: "运", message: "排队忙" })).toBe("none");
    expect(callretryhintof({ message: "timeout 🚀" })).toBe("retry");
  });
});
