import { describe, expect, it } from "vitest";
import {
  addusage,
  budgetcheck,
  buildrequest,
  calllocal,
  callmodel,
  classifyintent,
  draftplan,
  guardoutput,
  islocalorigin,
  parsecommand,
  parsecompletion,
  parseoutput,
  parsestream,
  reflectionsummary,
  reflectstep,
  replannonfail,
  streammodel,
  stripguardrails,
  toolbriefof,
  rendertoolbriefs,
  usagetotals,
} from "../llm.js";
import { buildtoolcatalog } from "../tools.js";
import type { modelmessage, parseguard, plandraft, providerconfig, usagerecord } from "../types.js";
import type { fetchtransport, transportresponse } from "../http.js";

const now = 1_800_000_000_000;
const instant = (): Promise<void> => Promise.resolve();

/** Builds one provider config fixture with every value user configured. */
function provider(over: Partial<providerconfig> = {}): providerconfig {
  return {
    id: "prov1",
    name: "The gateway",
    endpoint: "https://gateway.example/v1",
    style: "chatcompletions",
    models: ["model-a", "model-b"],
    status: "available",
    createdat: now,
    ...over,
  };
}

/** Builds one stub transport that answers every request with the canned body. */
function stub(body: string, status = 200, seen: string[] = []): fetchtransport {
  return async (url, init): Promise<transportresponse> => {
    seen.push(`${init.method} ${url} ${init.body ?? ""}`);
    return { status, headers: { "content-type": "application/json" }, body };
  };
}

/** Wraps one model answer payload in the chat completions envelope the style parse expects. */
function answer(payload: string): string {
  return JSON.stringify({ choices: [{ message: { role: "assistant", content: payload } }] });
}

/** The chat completions answer body fixture. */
const chatbody = JSON.stringify({
  choices: [{ message: { role: "assistant", content: "the answer" } }],
  usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
});

describe("llm request shaping", () => {
  it("shapes the chat completions request with the bearer header and the message envelope", () => {
    const shaped = buildrequest({
      provider: provider(),
      model: "model-a",
      messages: [
        { role: "system", content: "be brief" },
        { role: "user", content: "hello" },
      ],
      apikey: "secret",
      temperature: 0.2,
      maxtokens: 128,
    });
    expect(shaped.url).toBe("https://gateway.example/v1");
    expect(shaped.method).toBe("POST");
    expect(shaped.headers.authorization).toBe("Bearer secret");
    const body = JSON.parse(shaped.body) as Record<string, unknown>;
    expect(body.model).toBe("model-a");
    expect(body.temperature).toBe(0.2);
    expect(body.max_tokens).toBe(128);
    expect(body.messages).toEqual([
      { role: "system", content: "be brief" },
      { role: "user", content: "hello" },
    ]);
  });

  it("shapes the responses request with the instructions block and the turns", () => {
    const shaped = buildrequest({
      provider: provider({ style: "responses" }),
      model: "model-a",
      messages: [
        { role: "system", content: "be brief" },
        { role: "user", content: "hello" },
        { role: "assistant", content: "hi" },
      ],
      apikey: "secret",
      maxtokens: 64,
    });
    const body = JSON.parse(shaped.body) as Record<string, unknown>;
    expect(body.instructions).toBe("be brief");
    expect(body.max_output_tokens).toBe(64);
    expect(body.input).toEqual([
      { role: "user", content: "hello" },
      { role: "assistant", content: "hi" },
    ]);
    expect(shaped.headers.authorization).toBe("Bearer secret");
  });

  it("shapes the messages request with the api key header and the system block", () => {
    const shaped = buildrequest({
      provider: provider({ style: "messages" }),
      model: "model-a",
      messages: [
        { role: "system", content: "be brief" },
        { role: "user", content: "hello" },
      ],
      apikey: "secret",
      temperature: 1,
    });
    expect(shaped.headers["x-api-key"]).toBe("secret");
    const body = JSON.parse(shaped.body) as Record<string, unknown>;
    expect(body.system).toBe("be brief");
    expect(body.messages).toEqual([{ role: "user", content: "hello" }]);
    expect(body.temperature).toBe(1);
  });

  it("shapes the gemini request with the key in the url and the contents envelope", () => {
    const shaped = buildrequest({
      provider: provider({ endpoint: "https://gateway.example/v1/models/x:generateContent", style: "gemini" }),
      model: "model-a",
      messages: [
        { role: "system", content: "be brief" },
        { role: "user", content: "hello" },
      ],
      apikey: "secret",
      maxtokens: 32,
    });
    expect(shaped.url).toBe("https://gateway.example/v1/models/x:generateContent?key=secret");
    const body = JSON.parse(shaped.body) as Record<string, unknown>;
    expect(body.systemInstruction).toEqual({ parts: [{ text: "be brief" }] });
    expect(body.contents).toEqual([{ role: "user", parts: [{ text: "hello" }] }]);
    expect((body.generationConfig as Record<string, unknown>).maxOutputTokens).toBe(32);
  });

  it("merges the user configured headers over the protocol shape headers", () => {
    const shaped = buildrequest({
      provider: provider({ headers: { "x-gateway": "one", authorization: "Bearer user" } }),
      model: "model-a",
      messages: [{ role: "user", content: "hi" }],
      apikey: "secret",
    });
    expect(shaped.headers["x-gateway"]).toBe("one");
    expect(shaped.headers.authorization).toBe("Bearer user");
  });
});

describe("llm response parsing", () => {
  it("parses the chat completions answer with its usage", () => {
    const parsed = parsecompletion("chatcompletions", chatbody);
    expect(parsed.text).toBe("the answer");
    expect(parsed.usage).toEqual({ prompttokens: 10, completiontokens: 5, totaltokens: 15 });
  });

  it("parses the responses answer text and usage", () => {
    const body = JSON.stringify({
      output: [
        {
          content: [
            { type: "output_text", text: "part one " },
            { type: "output_text", text: "part two" },
          ],
        },
      ],
      usage: { input_tokens: 7, output_tokens: 3, total_tokens: 10 },
    });
    const parsed = parsecompletion("responses", body);
    expect(parsed.text).toBe("part one part two");
    expect(parsed.usage?.totaltokens).toBe(10);
  });

  it("parses the messages answer text blocks with the token counts", () => {
    const body = JSON.stringify({
      content: [
        { type: "text", text: "hello " },
        { type: "text", text: "there" },
      ],
      usage: { input_tokens: 4, output_tokens: 2 },
    });
    const parsed = parsecompletion("messages", body);
    expect(parsed.text).toBe("hello there");
    expect(parsed.usage).toEqual({ prompttokens: 4, completiontokens: 2, totaltokens: 6 });
  });

  it("parses the gemini answer candidate with its usage metadata", () => {
    const body = JSON.stringify({
      candidates: [{ content: { parts: [{ text: "gem answer" }] } }],
      usageMetadata: { promptTokenCount: 9, candidatesTokenCount: 2, totalTokenCount: 11 },
    });
    const parsed = parsecompletion("gemini", body);
    expect(parsed.text).toBe("gem answer");
    expect(parsed.usage?.totaltokens).toBe(11);
  });

  it("refuses malformed answers with the reason in plain language", () => {
    expect(parsecompletion("chatcompletions", "not json").reason).toMatch(/not json/i);
    expect(parsecompletion("chatcompletions", JSON.stringify({ choices: [] })).reason).toMatch(/no message content/i);
    expect(parsecompletion("responses", JSON.stringify({ output: [] })).reason).toMatch(/no output text/i);
    expect(parsecompletion("messages", JSON.stringify({ content: [] })).reason).toMatch(/no text block/i);
    expect(parsecompletion("gemini", JSON.stringify({ candidates: [] })).reason).toMatch(/no candidate text/i);
  });
});

describe("llm provider calls", () => {
  it("posts one completion through the fetch machinery and returns the parsed text and usage", async () => {
    const seen: string[] = [];
    const outcome = await callmodel({
      provider: provider(),
      model: "model-a",
      messages: [{ role: "user", content: "hello" }],
      apikey: "secret",
      transport: stub(chatbody, 200, seen),
      sleep: instant,
      now: () => now,
    });
    expect(outcome.text).toBe("the answer");
    expect(outcome.usage?.totaltokens).toBe(15);
    expect(seen[0]).toContain("POST https://gateway.example/v1");
    expect(JSON.parse((seen[0] ?? "").split(" ").slice(2).join(" ") || "{}")).toMatchObject({ model: "model-a" });
  });

  it("refuses the call when the configured auth reference has no resolved key", async () => {
    const authref = {
      name: "gateway key",
      origins: ["https://gateway.example"],
      header: "authorization",
      storageid: "key-store-1",
      configuredat: now,
    };
    await expect(
      callmodel({
        provider: provider({ authref }),
        model: "model-a",
        messages: [{ role: "user", content: "hi" }],
        transport: stub(chatbody),
        sleep: instant,
        now: () => now,
      }),
    ).rejects.toThrow(/resolved key/i);
  });

  it("refuses the call when page content the user has not granted would leave", async () => {
    await expect(
      callmodel({
        provider: provider(),
        model: "model-a",
        messages: [{ role: "user", content: "summarize" }],
        pagecontent: "the page text",
        pagegrant: false,
        transport: stub(chatbody),
        sleep: instant,
        now: () => now,
      }),
    ).rejects.toThrow(/has not granted/i);
    const granted = await callmodel({
      provider: provider(),
      model: "model-a",
      messages: [{ role: "user", content: "summarize" }],
      pagecontent: "the page text",
      pagegrant: true,
      transport: stub(chatbody),
      sleep: instant,
      now: () => now,
    });
    expect(granted.text).toBe("the answer");
  });

  it("refuses the call when the provider carries no user configured endpoint", async () => {
    await expect(
      callmodel({
        provider: provider({ endpoint: " " }),
        model: "model-a",
        messages: [{ role: "user", content: "hi" }],
        transport: stub(chatbody),
        sleep: instant,
        now: () => now,
      }),
    ).rejects.toThrow(/endpoint/i);
  });

  it("refuses the call when the answer stays malformed after the retries", async () => {
    await expect(
      callmodel({
        provider: provider(),
        model: "model-a",
        messages: [{ role: "user", content: "hi" }],
        apikey: "k",
        transport: stub("<html>bad gateway</html>"),
        sleep: instant,
        options: { retries: 1, backoff: 0 },
        now: () => now,
      }),
    ).rejects.toThrow(/not json/i);
  });
});

describe("llm local model calls", () => {
  it("posts to the local model endpoint with no external network", async () => {
    const seen: string[] = [];
    const outcome = await calllocal({
      local: { endpoint: "http://127.0.0.1:8080/v1", model: "local-model", style: "chatcompletions" },
      messages: [{ role: "user", content: "hi" }],
      transport: stub(chatbody, 200, seen),
      sleep: instant,
      now: () => now,
    });
    expect(outcome.text).toBe("the answer");
    expect(seen[0]).toContain("http://127.0.0.1:8080/v1");
  });

  it("refuses a local model endpoint outside the machine", async () => {
    await expect(
      calllocal({
        local: { endpoint: "https://remote.example/v1", model: "m", style: "chatcompletions" },
        messages: [{ role: "user", content: "hi" }],
        transport: stub(chatbody),
        sleep: instant,
        now: () => now,
      }),
    ).rejects.toThrow(/never leaves the machine/i);
    expect(islocalorigin("http://localhost:1234/x")).toBe(true);
    expect(islocalorigin("https://gateway.example/v1")).toBe(false);
  });
});

describe("llm streaming", () => {
  it("parses the ordered token stream of every protocol style", () => {
    const chat = parsestream(
      "chatcompletions",
      'data: {"choices":[{"delta":{"content":"he"}}]}\n\ndata: {"choices":[{"delta":{"content":"llo"}}]}\n\ndata: [DONE]',
    );
    expect(chat.map((token) => token.text).join("")).toBe("hello");
    expect(chat[1]?.done).toBe(true);
    const messages = parsestream(
      "messages",
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"a"}}\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"b"}}',
    );
    expect(messages.map((token) => token.text).join("")).toBe("ab");
    const responses = parsestream(
      "responses",
      'data: {"type":"response.output_text.delta","delta":"x"}\ndata: {"type":"response.completed"}',
    );
    expect(responses.map((token) => token.text).join("")).toBe("x");
    const gemini = parsestream("gemini", 'data: {"candidates":[{"content":{"parts":[{"text":"g"}]}}]}');
    expect(gemini.map((token) => token.text).join("")).toBe("g");
  });

  it("streams one completion when the provider supports it and assembles the answer", async () => {
    const body =
      'data: {"choices":[{"delta":{"content":"to"}}]}\ndata: {"choices":[{"delta":{"content":"ken"}}]}\ndata: [DONE]';
    const outcome = await streammodel({
      provider: provider(),
      model: "model-a",
      messages: [{ role: "user", content: "hi" }],
      apikey: "k",
      transport: stub(body),
      sleep: instant,
      now: () => now,
    });
    expect(outcome.text).toBe("token");
    expect(outcome.tokens).toBe(2);
  });
});

describe("llm command parsing and intents", () => {
  const parsebody = JSON.stringify({
    intent: "navigate",
    entities: [{ name: "url", value: "https://example.com" }],
    confidence: 0.9,
  });

  it("parses a natural language command across the intent kinds", async () => {
    for (const intent of ["navigate", "extract", "fill", "monitor", "automate", "ask"] as const) {
      const body = answer(JSON.stringify({ intent, entities: [], confidence: 0.8 }));
      const outcome = await parsecommand({
        provider: provider(),
        model: "model-a",
        text: "do the thing",
        transport: stub(body),
        sleep: instant,
        now: () => now,
      });
      expect(outcome.parse?.intent).toBe(intent);
      expect(outcome.parse?.confidence).toBe(0.8);
      expect(outcome.parse?.model).toBe("model-a");
    }
  });

  it("carries the extracted entities of the parsed command", async () => {
    const outcome = await parsecommand({
      provider: provider(),
      model: "model-a",
      text: "open the url",
      transport: stub(answer(parsebody)),
      sleep: instant,
      now: () => now,
    });
    expect(outcome.parse?.entities).toEqual([{ name: "url", value: "https://example.com" }]);
    expect(outcome.parse?.providerid).toBe("prov1");
  });

  it("refuses a model answer whose intent stays outside the intent kinds", async () => {
    const outcome = await parsecommand({
      provider: provider(),
      model: "model-a",
      text: "do the thing",
      transport: stub(answer(JSON.stringify({ intent: "vibes", entities: [], confidence: 1 }))),
      sleep: instant,
      now: () => now,
    });
    expect(outcome.parse).toBeUndefined();
    expect(outcome.reason).toMatch(/intent kinds/i);
  });

  it("classifies the intent deterministically with confidence thresholds and no provider", () => {
    const navigate = classifyintent("go to the site and open the page");
    expect(navigate.intent).toBe("navigate");
    expect(navigate.confidence).toBeGreaterThan(0.3);
    const extract = classifyintent("extract the table data and read the text");
    expect(extract.intent).toBe("extract");
    const ask = classifyintent("what is this page about");
    expect(ask.intent).toBe("ask");
    const unknown = classifyintent("zzz qqq vvv");
    expect(unknown.intent).toBe("ask");
    expect(unknown.confidence).toBeLessThanOrEqual(0.2);
  });
});

describe("llm plan drafting and replanning", () => {
  const draftbody = JSON.stringify({
    goal: "Read the docs page",
    steps: [
      { kind: "navigate", value: "https://docs.example", summary: "Open the docs page." },
      { kind: "readtext", target: "main", summary: "Read the main text." },
    ],
    openquestions: ["which section first?"],
  });

  it("drafts a plan from a goal and lints it against the action grammar", async () => {
    const outcome = await draftplan({
      provider: provider(),
      model: "model-a",
      goal: "Read the docs page",
      origin: "https://docs.example",
      transport: stub(answer(draftbody)),
      sleep: instant,
      now: () => now,
    });
    expect(outcome.draft?.steps).toHaveLength(2);
    expect(outcome.draft?.openquestions).toEqual(["which section first?"]);
    expect(outcome.draft?.lintfindings).toEqual([]);
    expect(outcome.draft?.state).toBe("draft");
  });

  it("records the grammar violations of a model draft before review", async () => {
    const body = JSON.stringify({
      goal: "Do things",
      steps: [
        { kind: "teleport", summary: "Teleport." },
        { kind: "click", summary: "Click nothing." },
      ],
      openquestions: [],
    });
    const outcome = await draftplan({
      provider: provider(),
      model: "model-a",
      goal: "Do things",
      transport: stub(answer(body)),
      sleep: instant,
      now: () => now,
    });
    expect(outcome.draft?.lintfindings.length).toBeGreaterThan(0);
    expect(outcome.draft?.lintfindings.join(" ")).toMatch(/grammar/);
  });

  it("replans the failed tail while the completed steps stay and the revised steps need fresh review", async () => {
    const draft = outcomeof(draftbody);
    const tailbody = JSON.stringify({ steps: [{ kind: "reload", summary: "Reload and retry." }] });
    const outcome = await replannonfail({
      provider: provider(),
      model: "model-a",
      draft,
      completedstepids: ["step1"],
      failedstepids: ["step2"],
      reason: "The text read timed out.",
      transport: stub(answer(tailbody)),
      sleep: instant,
      now: () => now,
    });
    expect(outcome.replan?.completedstepids).toEqual(["step1"]);
    expect(outcome.replan?.failedstepids).toEqual(["step2"]);
    expect(outcome.replan?.tail).toHaveLength(1);
    expect(outcome.replan?.tail[0]?.freshreview).toBe(true);
    expect(outcome.replan?.state).toBe("pending");
    expect(outcome.replan?.reason).toMatch(/timed out/i);
  });

  it("reflects one executed step with the running lessons feeding the next prompt", async () => {
    const body = JSON.stringify({
      outcome: "The click landed.",
      lesson: "The button needs a settle window.",
      advice: "Wait one second before the next click.",
    });
    const outcome = await reflectstep({
      provider: provider(),
      model: "model-a",
      runid: "run1",
      stepid: "step2",
      outcome: "The click landed.",
      lessons: ["The page loads slowly."],
      transport: stub(answer(body)),
      sleep: instant,
      now: () => now,
    });
    expect(outcome.note?.lesson).toBe("The button needs a settle window.");
    expect(outcome.note?.advice).toMatch(/one second/);
    const summary = reflectionsummary([outcome.note!]);
    expect(summary).toContain("settle window");
  });
});

describe("llm guardrails", () => {
  const guard: parseguard = {
    schema: { intent: { type: "string", required: true }, confidence: { type: "number" } },
    retries: 2,
  };

  it("strips code fences and chatter before parsing", () => {
    expect(stripguardrails('Sure! Here you go:\n```json\n{"intent":"navigate"}\n```\nHope that helps.')).toBe(
      '{"intent":"navigate"}',
    );
    expect(stripguardrails('pre chatter {"a":1} post chatter')).toBe('{"a":1}');
  });

  it("validates model text against the expected schema", () => {
    const valid = parseoutput({ guard, text: '{"intent":"navigate","confidence":0.9}' });
    expect(valid.verdict).toBe("valid");
    expect(valid.parsed?.intent).toBe("navigate");
    const wrongtype = parseoutput({ guard, text: '{"intent":5}' });
    expect(wrongtype.verdict).toBe("invalid");
    expect(wrongtype.reason).toMatch(/asks a string/i);
  });

  it("retries malformed output up to the configured attempts", () => {
    const outcome = guardoutput({
      guard,
      attempts: ["nope", '{"intent":"fill"}', '{"intent":"fill","confidence":0.5}'],
    });
    expect(outcome.verdict).toBe("valid");
    expect(outcome.attempts).toBe(2);
  });

  it("refuses the output after the retry exhaustion so nothing executes", () => {
    const outcome = guardoutput({ guard, attempts: ["nope", "still nope", '{"intent":9}'] });
    expect(outcome.verdict).toBe("invalid");
    expect(outcome.attempts).toBe(3);
    expect(outcome.reason).toMatch(/refuses the output/i);
  });

  it("refuses on the refusal markers without burning retries", () => {
    const outcome = guardoutput({ guard, attempts: ["I cannot comply with that request.", '{"intent":"fill"}'] });
    expect(outcome.verdict).toBe("refused");
    expect(outcome.attempts).toBe(1);
    expect(outcome.reason).toMatch(/refusal marker/i);
  });

  it("honors the user configured refusal markers over the defaults", () => {
    const outcome = parseoutput({
      guard: { ...guard, refusalmarkers: ["nope-city"] },
      text: '{"intent":"navigate","confidence":0.9}',
    });
    expect(outcome.verdict).toBe("valid");
    const custom = parseoutput({
      guard: { ...guard, refusalmarkers: ["nope-city"] },
      text: "nope-city, the model stays out",
    });
    expect(custom.verdict).toBe("refused");
    expect(custom.reason).toMatch(/nope-city/i);
  });
});

describe("llm tool briefs", () => {
  it("renders one tool brief in openapi style with typed parameters", () => {
    const tool = buildtoolcatalog()
      .domains.flatMap((domain) => domain.tools)
      .find((candidate) => candidate.name === "browser.readtext");
    expect(tool).toBeDefined();
    const brief = toolbriefof(tool!);
    expect(brief.tool).toBe("browser.readtext");
    expect(brief.parameters.some((parameter) => parameter.name === "target" && parameter.required)).toBe(true);
  });

  it("renders the tool briefs with the consent notice for model consumption", () => {
    const tools = buildtoolcatalog()
      .domains.flatMap((domain) => domain.tools)
      .slice(0, 3);
    const rendered = rendertoolbriefs(tools);
    expect(rendered).toContain("tools:");
    expect(rendered).toContain("- tool: ");
    expect(rendered).toContain("consent: every tool with side effects executes only the approved plan step it names");
  });
});

describe("llm usage and budgets", () => {
  /** Builds one usage record fixture. */
  function usage(over: Partial<usagerecord> = {}): usagerecord {
    return {
      id: "u1",
      runid: "run1",
      providerid: "prov1",
      endpoint: "https://gateway.example/v1",
      model: "model-a",
      prompttokens: 10,
      completiontokens: 5,
      totaltokens: 15,
      cost: 0.01,
      at: now,
      ...over,
    };
  }

  it("accumulates the usage per run and per step", () => {
    const records = addusage(
      addusage(addusage([], usage()), usage({ id: "u2", stepid: "s1", totaltokens: 20, cost: 0.02 })),
      usage({ id: "u3", runid: "run2", totaltokens: 100, cost: 0.5 }),
    );
    expect(records[0]?.id).toBe("u3");
    expect(usagetotals(records)).toEqual({
      prompttokens: 30,
      completiontokens: 15,
      totaltokens: 135,
      cost: 0.53,
      calls: 3,
    });
    expect(usagetotals(records, { runid: "run1" }).calls).toBe(2);
    expect(usagetotals(records, { runid: "run1", stepid: "s1" }).totaltokens).toBe(20);
    expect(usagetotals(records, { since: now + 1 }).calls).toBe(0);
  });

  it("halts the run and asks the user when a ceiling is reached", () => {
    const budget = { maxtokens: 100, maxcost: 1, currency: "usd", configuredat: now };
    expect(budgetcheck({ budget, totals: { totaltokens: 99, cost: 0.2 } }).allowed).toBe(true);
    const halted = budgetcheck({ budget, totals: { totaltokens: 100, cost: 0.2 } });
    expect(halted.halted).toBe(true);
    expect(halted.asksuser).toBe(true);
    expect(halted.reason).toMatch(/token ceiling/i);
    const costly = budgetcheck({ budget, totals: { totaltokens: 50, cost: 1 } });
    expect(costly.halted).toBe(true);
    expect(costly.reason).toMatch(/cost ceiling/i);
  });

  it("keeps an absent budget unbounded with no silent default", () => {
    const outcome = budgetcheck({ budget: undefined, totals: { totaltokens: 1_000_000, cost: 10_000 } });
    expect(outcome.allowed).toBe(true);
    expect(outcome.halted).toBe(false);
  });
});

/** Builds one plandraft fixture from a draft answer body. */
function outcomeof(body: string): plandraft {
  const parsed = JSON.parse(body) as {
    goal: string;
    steps: Array<{ kind: string; target?: string; value?: string; summary: string }>;
    openquestions: string[];
  };
  return {
    id: "draft1",
    goal: parsed.goal,
    steps: parsed.steps.map((step, index) => ({
      id: `step${index + 1}`,
      kind: step.kind,
      ...(step.target !== undefined ? { target: step.target } : {}),
      ...(step.value !== undefined ? { value: step.value } : {}),
      summary: step.summary,
    })),
    openquestions: parsed.openquestions,
    providerid: "prov1",
    model: "model-a",
    state: "approved",
    lintfindings: [],
    createdat: now,
  };
}
