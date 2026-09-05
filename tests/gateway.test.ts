import { describe, expect, it } from "vitest";
import { access, readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { anthropicgatewayadapter, capabilityadvertisement, composegatewayprompt, costestimates, defaultbaseurl, fetchmodellist, gatewayadapters, gatewaybudgetcheck, gatewaybudgetwarning, gatewaycall, gatewaycancel, gatewaychatstateof, gatewayerrorfrom, gatewayerrorof, gatewayguard, gatewayislocal, gatewayplanguard, gatewaystream, gatewaytemplates, gatewayurl, gatewayusagerecord, geminigatewayadapter, maskkey, maskrequest, ollamalocaladapter, openaicompatadapter, adapterof, resolvegatewayroute, revokeproviderkey, storeproviderkey, streamrender, validategatewayconfig, keyexportcheck } from "../gateway.js";
import { gatewaybaseurlgate, gatewayconsentgate, gatewaykeyconsentgate, gatewayretrycapvalid } from "../policy.js";
import { usagetotals } from "../llm.js";
import { buildtoolcatalog } from "../tools.js";
import { inmemoryvault } from "../security.js";
import { gatewaycallreport } from "../protocol.js";
import type { baseurlconfig, gatewaychattoken, localmodelconfig, modelroute, providerconfig, tooldef } from "../types.js";
import type { fetchtransport, transportresponse } from "../http.js";
import { startgatewayfixtureserver } from "./gatewayserver.mjs";

const now = 1_800_000_000_000;
const instant = (): Promise<void> => Promise.resolve();

/** Builds one enabled and consented gateway config with every value user configured. */
function config(over: Partial<baseurlconfig> = {}): baseurlconfig {
  return { providerid: "prov1", kind: "openaicompat", baseurl: "https://gateway.example/v1", enabled: true, consented: true, consentedat: now, updatedat: now, ...over };
}

/** Builds one stub transport that answers every request with the canned body and records what it saw. */
function stub(body: string, status = 200, seen: string[] = [], headers: Record<string, string> = {}): fetchtransport {
  return async (url, init): Promise<transportresponse> => {
    seen.push(`${init.method} ${url} ${init.headers.authorization ?? init.headers["x-api-key"] ?? ""} ${init.body ?? ""}`);
    return { status, headers: { "content-type": "application/json", ...headers }, body };
  };
}

/** Reads one recorded fixture body of the gateway family. */
async function fixture(name: string): Promise<string> {
  return readFile(join(process.cwd(), "tests", name), "utf8");
}

/** The first tools of the real catalog for the capabilityad and request composition cases. */
function catalogtools(): tooldef[] {
  return (buildtoolcatalog().domains[0]?.tools ?? []).slice(0, 2);
}

describe("gateway adapter request composition against the recorded fixtures", () => {
  it("shapes every adapter request with its wire path, key placement and message envelope and parses its recorded answer", async () => {
    const messages = [{ role: "system" as const, content: "be brief" }, { role: "user" as const, content: "draft one step" }];
    const openai = openaicompatadapter.build({ config: config(), model: "fixture-model-a", messages, apikey: "secret", maxtokens: 64 });
    expect(openai.url).toBe("https://gateway.example/v1/chat/completions");
    expect(openai.headers.authorization).toBe("Bearer secret");
    const openaibody = JSON.parse(openai.body) as Record<string, unknown>;
    expect(openaibody.model).toBe("fixture-model-a");
    expect(openaibody["max_tokens"]).toBe(64);
    expect(openaibody.messages).toEqual(messages);
    const openaianswer = openaicompatadapter.parseanswer(await fixture("openaicompat-completion.json"));
    expect(openaianswer.text).toContain("open the docs page");
    expect(openaianswer.usage).toEqual({ prompttokens: 34, completiontokens: 21, totaltokens: 55 });

    const anthropic = anthropicgatewayadapter.build({ config: config({ kind: "anthropicgateway", baseurl: "https://gateway.example" }), model: "fixture-claude-shape", messages, apikey: "secret" });
    expect(anthropic.url).toBe("https://gateway.example/v1/messages");
    expect(anthropic.headers["x-api-key"]).toBe("secret");
    const anthropicbody = JSON.parse(anthropic.body) as Record<string, unknown>;
    expect(anthropicbody.system).toBe("be brief");
    expect(anthropicbody.messages).toEqual([{ role: "user", content: "draft one step" }]);
    const anthropicanswer = anthropicgatewayadapter.parseanswer(await fixture("anthropic-completion.json"));
    expect(anthropicanswer.text).toContain("summarize the page");
    expect(anthropicanswer.usage).toEqual({ prompttokens: 47, completiontokens: 18, totaltokens: 65 });

    const gemini = geminigatewayadapter.build({ config: config({ kind: "geminigateway", baseurl: "https://gateway.example" }), model: "fixture-gemini-shape", messages, apikey: "secret" });
    expect(gemini.url).toBe("https://gateway.example/v1beta/models/fixture-gemini-shape:generateContent?key=secret");
    const geminibody = JSON.parse(gemini.body) as Record<string, unknown>;
    expect(geminibody.systemInstruction).toEqual({ parts: [{ text: "be brief" }] });
    expect(geminibody.contents).toEqual([{ role: "user", parts: [{ text: "draft one step" }] }]);
    const geminianswer = geminigatewayadapter.parseanswer(await fixture("gemini-completion.json"));
    expect(geminianswer.text).toContain("answer the question");
    expect(geminianswer.usage?.totaltokens).toBe(40);

    const ollama = ollamalocaladapter.build({ config: config({ kind: "ollamalocal", baseurl: "http://localhost:11434" }), model: "fixture-local:7b", messages: [{ role: "user", content: "run locally" }] });
    expect(ollama.url).toBe("http://localhost:11434/api/chat");
    expect(ollama.headers.authorization).toBeUndefined();
    const ollamabody = JSON.parse(ollama.body) as Record<string, unknown>;
    expect(ollamabody.model).toBe("fixture-local:7b");
    expect(ollamabody.messages).toEqual([{ role: "user", content: "run locally" }]);
    const ollamaanswer = ollamalocaladapter.parseanswer(await fixture("ollama-completion.json"));
    expect(ollamaanswer.text).toContain("run locally");
    expect(ollamaanswer.usage).toEqual({ prompttokens: 40, completiontokens: 17, totaltokens: 57 });
    expect(adapterof("openaicompat").kind).toBe("openaicompat");
    expect(Object.keys(gatewayadapters)).toEqual(["openaicompat", "anthropicgateway", "geminigateway", "ollamalocal"]);
  });

  it("joins the base url, the per provider path prefix and the wire path of every adapter", () => {
    expect(gatewayurl({ baseurl: "https://gateway.example/v1/", pathprefix: "team" }, "/chat/completions")).toBe("https://gateway.example/v1/team/chat/completions");
    expect(gatewayurl({ baseurl: "https://gateway.example" }, "/v1/messages")).toBe("https://gateway.example/v1/messages");
    expect(gatewayurl({ baseurl: "http://localhost:11434/", pathprefix: "/ns/" }, "/api/chat")).toBe("http://localhost:11434/ns/api/chat");
  });
});

describe("gateway streaming deltas, cancel contract and sidepanel rendering", () => {
  it("parses the recorded stream bodies of every adapter into ordered tokens with the done marker", async () => {
    const openai = openaicompatadapter.parsestream(await fixture("openaicompat-stream.txt"));
    expect(openai.map(token => token.text).join("")).toBe("{\"goal\":\"streamed answer\",\"steps\":[]}");
    expect(openai[openai.length - 1]?.done).toBe(true);
    const anthropic = anthropicgatewayadapter.parsestream(await fixture("anthropic-stream.txt"));
    expect(anthropic.map(token => token.text).join("")).toBe("the messages content blocks stream");
    const gemini = geminigatewayadapter.parsestream(await fixture("gemini-stream.txt"));
    expect(gemini.map(token => token.text).join("")).toBe("gemini candidate parts stream");
    const ollama = ollamalocaladapter.parsestream(await fixture("ollama-stream.txt"));
    expect(ollama.map(token => token.text).join("")).toBe("the local runtime streams line by line");
    expect(ollama[ollama.length - 1]?.done).toBe(true);
  });

  it("streams through the shared contract, fires the onevent seam per token and stops at the cancelled position", async () => {
    const events: string[] = [];
    const cancel = gatewaycancel();
    const streambody = await fixture("openaicompat-stream.txt");
    const transport = stub(streambody);
    const streamed = await gatewaystream({ config: config(), model: "fixture-model-a", messages: [{ role: "user", content: "stream" }], cancel, transport, sleep: instant, onevent: token => { events.push(token.text); if (events.length === 2) cancel.cancel("The test cancelled mid stream."); } });
    expect(events.length).toBe(2);
    expect(streamed.tokens.length).toBe(2);
    expect(streamed.text).toBe("{\"goal\":\"streamed answer\",");
    const cancelled = gatewaycancel();
    cancelled.cancel();
    await expect(gatewaycall({ config: config(), model: "m", messages: [], cancel: cancelled, transport, sleep: instant })).rejects.toMatchObject({ code: "cancelled" });
  });

  it("renders the streamed tokens incrementally through the cursor batches of the sidepanel chat", () => {
    const tokens: gatewaychattoken[] = [{ seq: 1, text: "hello ", at: now }, { seq: 2, text: "streamed ", at: now }];
    const first = streamrender(tokens, 0, false);
    expect(first.text).toBe("hello streamed ");
    expect(first.nextcursor).toBe(2);
    expect(first.done).toBe(false);
    const grown: gatewaychattoken[] = [...tokens, { seq: 3, text: "world", at: now }];
    const second = streamrender(grown, first.nextcursor, true);
    expect(second.text).toBe("world");
    expect(second.done).toBe(true);
    const empty = streamrender(grown, 3, true);
    expect(empty.text).toBe("");
    expect(empty.done).toBe(true);
    expect(streamrender([], 0, false).done).toBe(false);
    const state = gatewaychatstateof({ requestid: "req1", config: config(), model: "m", prompt: "p", tokens, done: true, now });
    expect(state.done).toBe(true);
    expect(state.kind).toBe("openaicompat");
  });
});

describe("gateway capabilityad advertisement and tool schema mapping", () => {
  it("serializes the tool catalog into the provider specific schema of every adapter with the consent metadata and the plan review gate", () => {
    const tools = catalogtools();
    for (const kind of ["openaicompat", "anthropicgateway", "geminigateway", "ollamalocal"] as const) {
      const ad = capabilityadvertisement({ kind, tools });
      expect(ad.kind).toBe(kind);
      if (kind === "geminigateway") {
        expect(ad.tools).toHaveLength(1);
        expect((ad.tools[0] as { functionDeclarations: unknown[] }).functionDeclarations).toHaveLength(tools.length);
      } else {
        expect(ad.tools).toHaveLength(tools.length);
      }
      expect(ad.consent).toHaveLength(tools.length);
      expect(ad.consent[0]?.tool).toBe(tools[0]?.name);
      expect(ad.requiredcapabilities).toContain("planreview");
    }
    const openai = capabilityadvertisement({ kind: "openaicompat", tools }).tools[0] as Record<string, unknown>;
    expect(openai.type).toBe("function");
    expect((openai.function as Record<string, unknown>).name).toBe(tools[0]?.name);
    const anthropic = capabilityadvertisement({ kind: "anthropicgateway", tools }).tools[0] as Record<string, unknown>;
    expect(anthropic["input_schema"]).toBeDefined();
    const gemini = capabilityadvertisement({ kind: "geminigateway", tools }).tools[0] as Record<string, unknown>;
    const declarations = gemini.functionDeclarations as Array<Record<string, unknown>>;
    expect(declarations[0]?.name).toBe(tools[0]?.name);
    const ollama = capabilityadvertisement({ kind: "ollamalocal", tools }).tools[0] as Record<string, unknown>;
    expect(ollama.type).toBe("function");
    const consenttool = tools.find(tool => tool.consentmeta !== undefined);
    if (consenttool !== undefined) {
      const declared = capabilityadvertisement({ kind: "openaicompat", tools }).consent.find(entry => entry.tool === consenttool.name);
      expect(declared?.review).toBe(consenttool.consentmeta?.review);
    }
    const withtools = openaicompatadapter.build({ config: config(), model: "m", messages: [{ role: "user", content: "go" }], tools });
    const body = JSON.parse(withtools.body) as Record<string, unknown>;
    expect(Array.isArray(body.tools)).toBe(true);
  });
});

describe("gateway baseurlconfig validation and the empty default posture", () => {
  it("validates the scheme, host and path shape before saving and keeps every remote default empty", () => {
    expect(defaultbaseurl("openaicompat")).toBe("");
    expect(defaultbaseurl("anthropicgateway")).toBe("");
    expect(defaultbaseurl("geminigateway")).toBe("");
    expect(defaultbaseurl("ollamalocal")).toBe("http://localhost:11434");
    expect(gatewayislocal({ baseurl: defaultbaseurl("ollamalocal") })).toBe(true);
    expect(gatewaybaseurlgate({ kind: "openaicompat", baseurl: "" }).allowed).toBe(false);
    expect(gatewaybaseurlgate({ kind: "openaicompat", baseurl: "https://gateway.example/v1" }).allowed).toBe(true);
    expect(gatewaybaseurlgate({ kind: "openaicompat", baseurl: "ftp://gateway.example" }).allowed).toBe(false);
    expect(gatewaybaseurlgate({ kind: "openaicompat", baseurl: "https://gateway.example/v1?x=1" }).allowed).toBe(false);
    expect(gatewaybaseurlgate({ kind: "openaicompat", baseurl: "https://gateway.example/v1#frag" }).allowed).toBe(false);
    expect(gatewaybaseurlgate({ kind: "openaicompat", baseurl: "https://gateway.example/../etc" }).allowed).toBe(false);
    expect(gatewaybaseurlgate({ kind: "openaicompat", baseurl: "http://gateway.example/v1" }).allowed).toBe(false);
    expect(gatewaybaseurlgate({ kind: "openaicompat", baseurl: "http://localhost:8080/v1" }).allowed).toBe(true);
    expect(gatewaybaseurlgate({ kind: "ollamalocal", baseurl: "https://gateway.example" }).allowed).toBe(false);
    expect(gatewaybaseurlgate({ kind: "ollamalocal", baseurl: "http://localhost:11434" }).allowed).toBe(true);
    expect(gatewaybaseurlgate({ kind: "ollamalocal", baseurl: "http://127.0.0.1:11434" }).allowed).toBe(true);
    const filled = validategatewayconfig({ providerid: "local1", kind: "ollamalocal", baseurl: "", enabled: false, updatedat: now });
    expect(filled.ok).toBe(true);
    expect(filled.config.baseurl).toBe("http://localhost:11434");
    const refused = validategatewayconfig({ providerid: "r1", kind: "openaicompat", baseurl: "", enabled: false, updatedat: now });
    expect(refused.ok).toBe(false);
  });
});

describe("gateway key vault behind the seam", () => {
  it("stores under the explicit consent, masks every log surface, revokes with one click and refuses the export leak", async () => {
    const vault = inmemoryvault();
    const provider = config({ kind: "anthropicgateway", baseurl: "https://gateway.example" });
    await expect(storeproviderkey({ seam: vault, config: provider, profileid: "p", value: "secret-key-material", consent: false, now })).rejects.toThrow(/explicit consent/i);
    expect(gatewaykeyconsentgate({ consent: false, providerid: "prov1" }).allowed).toBe(false);
    const entry = await storeproviderkey({ seam: vault, config: provider, profileid: "p", value: "secret-key-material", consent: true, now });
    expect(entry.scope).toBe("https://gateway.example");
    expect(JSON.stringify(entry).includes("secret-key-material")).toBe(false);
    const resolved = await vault.fetch(entry.vaultid);
    expect(resolved).toBe("secret-key-material");
    const mask = maskkey("secret-key-material");
    expect(mask.includes("secret-key-material")).toBe(false);
    expect(mask).toContain("19 chars");
    const masked = maskrequest({ url: "https://gateway.example/v1/models?key=secret-key-material", method: "POST", headers: { authorization: "Bearer secret-key-material", "x-api-key": "secret-key-material", "content-type": "application/json" }, body: "{}" });
    expect(JSON.stringify(masked).includes("secret-key-material")).toBe(false);
    expect(masked.headers.authorization).toContain("vault-key");
    expect(masked.url).toContain("key=masked");
    const revoked = await revokeproviderkey({ seam: vault, entry });
    expect(revoked.dropped).toBe(true);
    expect(await vault.fetch(entry.vaultid)).toBeUndefined();
    const second = await storeproviderkey({ seam: vault, config: provider, profileid: "p", value: "another-key-material", consent: true, now });
    const leak = await keyexportcheck({ candidates: ["another-key-material", "plain text"], entries: [second] });
    expect(leak.leaks).toEqual(["another-key-material"]);
  });
});

describe("gateway modellist discovery, cache window and annotations", () => {
  it("fetches through the adapter, annotates the context and modality hints and serves the cache inside the window", async () => {
    const seen: string[] = [];
    const transport = stub(await fixture("openaicompat-models.json"), 200, seen);
    const fresh = await fetchmodellist({ config: config(), transport, now: () => now });
    expect(fresh.cached).toBe(false);
    expect(fresh.models[0]).toMatchObject({ id: "fixture-model-a", contextwindow: 8192, modalities: ["text"] });
    expect(fresh.models[1]?.id).toBe("fixture-model-b");
    expect(fresh.models[1]?.contextwindow).toBeUndefined();
    const cached = await fetchmodellist({ config: config(), transport, cachewindow: 60_000, cache: { providerid: "prov1", models: fresh.models, fetchedat: now }, now: () => now + 1000 });
    expect(cached.cached).toBe(true);
    expect(cached.models).toHaveLength(2);
    const stale = await fetchmodellist({ config: config(), transport, cachewindow: 60_000, cache: { providerid: "prov1", models: [], fetchedat: now }, now: () => now + 61_000 });
    expect(stale.cached).toBe(false);
    expect(stale.models).toHaveLength(2);
    const failed = await fetchmodellist({ config: config(), transport: stub("nope", 500), now: () => now });
    expect(failed.models).toEqual([]);
    expect(failed.reason).toContain("500");
    const gemini = await fetchmodellist({ config: config({ kind: "geminigateway", baseurl: "https://gateway.example" }), transport: stub(await fixture("gemini-models.json")), now: () => now });
    expect(gemini.models[0]).toMatchObject({ id: "fixture-gemini-shape", label: "Fixture Gemini Shape", contextwindow: 32768 });
    const anthropic = await fetchmodellist({ config: config({ kind: "anthropicgateway", baseurl: "https://gateway.example" }), transport: stub(await fixture("anthropic-models.json")), now: () => now });
    expect(anthropic.models[1]).toMatchObject({ id: "fixture-claude-wide", contextwindow: 200000 });
    const ollama = await fetchmodellist({ config: config({ kind: "ollamalocal", baseurl: "http://localhost:11434" }), transport: stub(await fixture("ollama-tags.json")), now: () => now });
    expect(ollama.models[0]).toMatchObject({ id: "fixture-local:7b" });
    expect(ollama.models[0]?.modalities).toEqual(["llama"]);
    void seen;
  });
});

describe("gateway guardrails over the parsed answers", () => {
  it("accepts the valid plan answer, retries the malformed one with the structured prompt and refuses after the capped attempts", () => {
    const valid = gatewayguard({ attempts: ["{\"goal\":\"g\",\"steps\":[],\"openquestions\":[]}\""] });
    expect(valid.output.verdict).toBe("valid");
    expect(valid.retryprompt).toBeUndefined();
    expect(valid.cappedat).toBe(2);
    const malformed = gatewayguard({ attempts: ["the model answered prose"] });
    expect(malformed.output.verdict).toBe("invalid");
    expect(malformed.retryprompt).toContain("failed its guard");
    const exhausted = gatewayguard({ attempts: ["one", "two", "three"] });
    expect(exhausted.output.verdict).toBe("invalid");
    expect(exhausted.output.attempts).toBe(2);
    expect(exhausted.retryprompt).toBeUndefined();
    const refused = gatewayguard({ attempts: ["I cannot comply with that request"] });
    expect(refused.output.verdict).toBe("refused");
    expect(gatewayplanguard.schema.steps?.type).toBe("array");
    expect(gatewayretrycapvalid(-1).allowed).toBe(false);
    expect(gatewayretrycapvalid(3).allowed).toBe(true);
  });
});

describe("gateway routing with the local fallback", () => {
  it("maps the task kind through the user rules and falls back to the local provider when the remote gates refuse", () => {
    const providers: providerconfig[] = [{ id: "prov1", name: "The remote gateway", endpoint: "https://gateway.example/v1", style: "chatcompletions", models: ["model-a"], status: "available", createdat: now }];
    const routes: modelroute[] = [{ id: "r1", kind: "chat", providerid: "prov1", model: "model-a", revision: 1, updatedat: now }];
    const local: localmodelconfig = { endpoint: "http://localhost:11434", model: "fixture-local:7b", style: "chatcompletions" };
    const routed = resolvegatewayroute({ kind: "chat", routes, providers, configs: [], local });
    expect(routed.source).toBe("route");
    expect(routed.provider?.id).toBe("prov1");
    expect(routed.model).toBe("model-a");
    const gated = resolvegatewayroute({ kind: "chat", routes, providers, configs: [config({ providerid: "prov1", enabled: false, consented: false })], local });
    expect(gated.source).toBe("local");
    expect(gated.local?.model).toBe("fixture-local:7b");
    const notallowed = resolvegatewayroute({ kind: "chat", routes, providers, configs: [config()], local, remoteallowed: false });
    expect(notallowed.source).toBe("local");
    const nolocal = resolvegatewayroute({ kind: "chat", routes, providers, configs: [config({ providerid: "prov1", enabled: false, consented: false })] });
    expect(nolocal.reason).toBeDefined();
    const fallbackpair: modelroute[] = [{ id: "r2", kind: "chat", providerid: "prov1", model: "model-a", fallbackproviderid: "prov2", fallbackmodel: "model-b", revision: 1, updatedat: now }];
    const providers2: providerconfig[] = [...providers, { id: "prov2", name: "The fallback gateway", endpoint: "https://fallback.example/v1", style: "chatcompletions" as const, models: ["model-b"], status: "available", createdat: now }];
    const fell = resolvegatewayroute({ kind: "chat", routes: fallbackpair, providers: providers2, configs: [config({ providerid: "prov1", enabled: false, consented: false })] });
    expect(fell.source).toBe("fallback");
    expect(fell.provider?.id).toBe("prov2");
  });
});

describe("gateway token budget accounting and threshold warnings", () => {
  it("records the usage with the request id and session, reports the per session and per run totals and warns at the configured ratio", () => {
    const record = gatewayusagerecord({ providerid: "prov1", endpoint: "https://gateway.example/v1/chat/completions", model: "model-a", usage: { prompttokens: 600, completiontokens: 400, totaltokens: 1000 }, costpermilliontokens: 3, sessionid: "sess1", runid: "run1", requestid: "req1", now });
    expect(record.cost).toBeCloseTo(0.003, 6);
    expect(record.requestid).toBe("req1");
    expect(record.sessionid).toBe("sess1");
    expect(record.local).toBeUndefined();
    const localrecord = gatewayusagerecord({ providerid: "local", endpoint: "http://localhost:11434/api/chat", model: "fixture-local:7b", usage: { prompttokens: 10, completiontokens: 5, totaltokens: 15 }, requestid: "req2", local: true, now });
    expect(localrecord.local).toBe(true);
    expect(localrecord.cost).toBe(0);
    const totals = usagetotals([record, localrecord], { sessionid: "sess1" });
    expect(totals.totaltokens).toBe(1000);
    expect(usagetotals([record, localrecord], { runid: "run1" }).totaltokens).toBe(1000);
    expect(usagetotals([record, localrecord]).totaltokens).toBe(1015);
    const budget = { maxtokens: 2000, warnratio: 0.4, configuredat: now };
    const quiet = gatewaybudgetwarning({ budget, totals: { totaltokens: 100, cost: 0 } });
    expect(quiet.warned).toBe(false);
    const warned = gatewaybudgetwarning({ budget, totals: { totaltokens: 900, cost: 0 } });
    expect(warned.warned).toBe(true);
    expect(warned.tokenratio).toBeCloseTo(0.45, 6);
    const costwarned = gatewaybudgetwarning({ budget: { maxcost: 2, warnratio: 0.5, configuredat: now }, totals: { totaltokens: 0, cost: 1.2 } });
    expect(costwarned.warned).toBe(true);
    const halted = gatewaybudgetcheck({ budget: { maxtokens: 100, configuredat: now }, totals: { totaltokens: 200, cost: 0 } });
    expect(halted.allowed).toBe(false);
    expect(halted.asksuser).toBe(true);
    const estimates = costestimates({ configs: [config({ costpermilliontokens: 2, currency: "usd" })], providers, records: [record] });
    expect(estimates[0]).toMatchObject({ providerid: "prov1", model: "model-a", permillion: 2, currency: "usd", recordedtokens: 1000 });
  });
  const providers: providerconfig[] = [];
});

describe("gateway consent gate blocks the provider calls before approval", () => {
  it("refuses the disabled, unconsented and unconfigured providers while the local runtime needs no remote consent", async () => {
    const body = await fixture("openaicompat-completion.json");
    await expect(gatewaycall({ config: config({ enabled: false }), model: "m", messages: [], transport: stub(body), sleep: instant })).rejects.toMatchObject({ code: "noconsent" });
    await expect(gatewaycall({ config: config({ consented: false }), model: "m", messages: [], transport: stub(body), sleep: instant })).rejects.toMatchObject({ code: "noconsent" });
    await expect(gatewaycall({ config: config({ baseurl: "" }), model: "m", messages: [], transport: stub(body), sleep: instant })).rejects.toMatchObject({ code: "notconfigured" });
    const localanswer = await gatewaycall({ config: config({ kind: "ollamalocal", baseurl: "http://localhost:11434" }), model: "fixture-local:7b", messages: [{ role: "user", content: "hi" }], transport: stub(await fixture("ollama-completion.json")), sleep: instant });
    expect(localanswer.text).toContain("run locally");
    expect(gatewayconsentgate({ config: { kind: "ollamalocal", baseurl: "http://localhost:11434", enabled: true } }).allowed).toBe(true);
    expect(gatewayconsentgate({ config: { kind: "openaicompat", baseurl: "https://gateway.example", enabled: true, consented: true } }).allowed).toBe(true);
  });
});

describe("gateway provenance, structured errors and audit reports", () => {
  it("correlates every call through its request id and reports the provenance envelope", () => {
    const report = gatewaycallreport({ requestid: "req1", providerid: "prov1", kind: "openaicompat", model: "model-a", tokens: { prompttokens: 10, completiontokens: 5, totaltokens: 15 }, cost: 0.001, at: now });
    expect(report.version).toBeDefined();
    expect(report.requestid).toBe("req1");
    expect(() => gatewaycallreport({ requestid: "", providerid: "p", kind: "openaicompat", model: "m", tokens: { prompttokens: 0, completiontokens: 0, totaltokens: 0 }, cost: 0, at: now })).toThrow(/request id/i);
    const error = gatewayerrorof("ratelimited", "limited", "req2", "wait the window", 1500);
    expect(error.retryafter).toBe(1500);
    const normalized = gatewayerrorfrom(new Error("The request timed out after 10 milliseconds."), "req3");
    expect(normalized.code).toBe("timeout");
    expect(gatewayerrorfrom(error, "req4")).toBe(error);
  });
});

describe("gateway timeout, transient retries and rate limit honoring", () => {
  it("races the timeout, retries the transient failures with the jittered backoff and honors the retry-after header of the 429 answer", async () => {
    const body = await fixture("openaicompat-completion.json");
    const waits: number[] = [];
    const sleep = async (milliseconds: number): Promise<void> => { waits.push(milliseconds); };
    await expect(gatewaycall({ config: config(), model: "m", messages: [], options: { timeout: 50 }, transport: async () => { await new Promise(resolve => setTimeout(resolve, 120)); return { status: 200, headers: {}, body }; }, sleep, now: () => now })).rejects.toMatchObject({ code: "timeout" });
    let calls = 0;
    const flaky = async (): Promise<transportresponse> => { calls += 1; if (calls === 1) return { status: 503, headers: {}, body: "{\"error\":\"transient\"}" }; return { status: 200, headers: {}, body }; };
    const retried = await gatewaycall({ config: config(), model: "m", messages: [], options: { retries: 2, backoff: 10, jitter: 5 }, transport: flaky, sleep, jitter: () => 1, now: () => now });
    expect(retried.text).toContain("open the docs page");
    expect(retried.retries).toBe(1);
    expect(waits.some(wait => wait >= 10)).toBe(true);
    let limited = 0;
    const ratelimited = async (): Promise<transportresponse> => { limited += 1; if (limited === 1) return { status: 429, headers: { "retry-after": "1" }, body: "{\"error\":\"rate limited\"}" }; return { status: 200, headers: {}, body }; };
    const honored = await gatewaycall({ config: config(), model: "m", messages: [], options: { retries: 1 }, transport: ratelimited, sleep, now: () => now });
    expect(honored.retries).toBe(1);
    expect(waits).toContain(1000);
    let exhausted = 0;
    const alwaysexhausted = async (): Promise<transportresponse> => { exhausted += 1; return { status: 429, headers: { "retry-after": "1" }, body: "{\"error\":\"rate limited\"}" }; };
    await expect(gatewaycall({ config: config(), model: "m", messages: [], transport: alwaysexhausted, sleep, now: () => now })).rejects.toMatchObject({ code: "ratelimited", retryafter: 1000 });
    await expect(gatewaycall({ config: config(), model: "m", messages: [], transport: stub("no", 401), sleep, now: () => now })).rejects.toMatchObject({ code: "unauthorized" });
    await expect(gatewaycall({ config: config(), model: "m", messages: [], transport: stub("<html>broken</html>"), sleep, now: () => now })).rejects.toMatchObject({ code: "parse" });
  });
});

describe("gateway fixture server runs the full request cycle offline", () => {
  it("serves the recorded shapes over localhost http for the call, the stream and the model list", async () => {
    const server = await startgatewayfixtureserver();
    try {
      const transport: fetchtransport = async (url, init) => {
        const response = await fetch(url, { method: init.method, headers: init.headers, ...(init.body !== undefined ? { body: init.body } : {}) });
        return { status: response.status, headers: Object.fromEntries(response.headers.entries()), body: await response.text() };
      };
      const outcome = await gatewaycall({ config: config({ baseurl: `http://127.0.0.1:${server.port}/openaicompat` }), model: "fixture-model-a", messages: [{ role: "user", content: "draft" }], requestid: "cycle-1", transport, sleep: instant });
      expect(outcome.text).toContain("open the docs page");
      expect(outcome.status).toBe(200);
      const streamed = await gatewaystream({ config: config({ kind: "ollamalocal", baseurl: `http://127.0.0.1:${server.port}/ollama` }), model: "fixture-local:7b", messages: [{ role: "user", content: "stream" }], transport, sleep: instant });
      expect(streamed.text).toBe("the local runtime streams line by line");
      const models = await fetchmodellist({ config: config({ kind: "geminigateway", baseurl: `http://127.0.0.1:${server.port}/gemini` }), transport, now: () => now });
      expect(models.models.map(model => model.id)).toContain("fixture-gemini-shape");
    } finally {
      await server.close();
    }
  });
});

describe("gateway prompt template library of the per task templates", () => {
  it("ships the per task templates with their variable slots and composes through the shared prompt library", () => {
    const templates = gatewaytemplates(now);
    const names = templates.map(template => template.name);
    expect(names).toEqual(["gateway.parsecommand", "gateway.draftplan", "gateway.replan", "gateway.reflect", "gateway.chat"]);
    for (const template of templates) {
      expect(template.version).toBe(1);
      expect(template.variables.length).toBeGreaterThan(0);
      for (const variable of template.variables) expect(template.body.includes(`{{${variable}}}`)).toBe(true);
    }
    const composed = composegatewayprompt({ templates, name: "gateway.draftplan", variables: { goal: "check the docs", tools: "none" } });
    expect(composed.text).toContain("check the docs");
    expect(composed.text?.includes("{{goal}}")).toBe(false);
    expect(composegatewayprompt({ templates, name: "missing", variables: {} }).reason).toBeDefined();
  });
});

describe("hardcoded provider url scan of the source tree", () => {
  it("asserts no provider endpoint literal and no default cloud url in the shipped sources", async () => {
    const root = process.cwd();
    const files: string[] = [];
    for (const entry of await readdir(root)) if (entry.endsWith(".ts") && (await stat(join(root, entry))).isFile()) files.push(join(root, entry));

    for (const entry of await readdir(join(root, "tests"))) if (entry.endsWith(".mjs")) files.push(join(root, "tests", entry));
    expect(files.length).toBeGreaterThan(50);
    const providerhosts = [/api\.openai\.com/, /api\.anthropic\.com/, /generativelanguage\.googleapis\.com/, /openrouter\.ai/, /api\.groq\.com/, /api\.mistral\.ai/, /api\.cohere\.com/, /api\.together\.xyz/, /api\.deepseek\.com/, /api\.x\.ai/, /cloud\.ollama\.com/];
    for (const path of files) {
      const content = await readFile(path, "utf8");
      for (const host of providerhosts) expect(host.test(content), `${path} carries the provider endpoint literal ${String(host)}`).toBe(false);
    }
    const shipped: string[] = [];
    for (const entry of await readdir(root)) if (entry.endsWith(".ts") && (await stat(join(root, entry))).isFile()) shipped.push(join(root, entry));

    const deeplinkapps = ["https://github.com", "https://www.youtube.com", "https://www.google.com", "https://en.wikipedia.org", "https://www.amazon.com", "https://x.com"];
    for (const path of shipped) {
      const content = await readFile(path, "utf8");
      const urls = content.match(/https?:\/\/[^\s"'`)<]+/g) ?? [];
      for (const url of urls) expect(url.includes("${") || url.startsWith("http://localhost") || url.startsWith("https://localhost") || url.startsWith("http://127.0.0.1") || url.startsWith("https://127.0.0.1") || url.includes(".example") || /^https:\/\/(example\.(org|com|net|invalid|test))\b/.test(url) || /^https:\/\/(\*\.)?origin\b/.test(url) || deeplinkapps.some(app => url.startsWith(app)), `${path} carries the non example url literal ${url}`).toBe(true);
    }
    const gateway = await readFile(join(root, "gateway.ts"), "utf8");
    expect(gateway.includes("http://localhost:11434")).toBe(true);
  });
});

describe("api key literal scan of the built bundles", () => {
  it("asserts no api key literal shape in any built dist bundle", async () => {
    const root = process.cwd();
    let distexists = true;
    try { await access(join(root, "dist")); } catch { distexists = false; }
    if (!distexists) return; /* the validate chain runs the tests before the build; the build gate scans every bundle itself and the next pass asserts the fresh dist */
    const keyshapes = [/sk-[A-Za-z0-9]{20,}/, /Bearer\s+[A-Za-z0-9]{20,}/, /x-api-key[":\s]+[A-Za-z0-9-]{20,}/];
    for (const entry of await readdir(join(root, "dist"))) {
      if (!entry.endsWith(".js") && !entry.endsWith(".cjs")) continue;
      const content = await readFile(join(root, "dist", entry), "utf8");
      for (const shape of keyshapes) expect(shape.test(content), `dist/${entry} carries an api key literal shape`).toBe(false);
    }
  });
});
