import { describe, expect, it } from "vitest";
import {
  alltools, applymock, applyratelimit, batchrisk, begincall, buildtoolcatalog, callretryhintof, checkidempotency, defaultidempotencywindowms, domainkinds, endcall, expireidempotency, maptoolerror, namespaceof, openapilayout, recordidempotency, resolvetool, runbatch, structurederrorof, toolname, toolsbynamespace, toolschemaof, toolcatalogversion, toolnamespaces, dryruntool,
} from "../tools.js";
import type { agentsession, agentplan, callratelimit, idempotencyrecord, toolmock, toolresult, toolschemaproperty, toolstep, clientrecord } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one tool result fixture. */
function result(text = "ok", iserror = false): toolresult {
  return { content: text, iserror };
}

/** Builds one client record fixture. */
function client(over: Partial<clientrecord> = {}): clientrecord {
  return { id: "c1", transport: "stdio", paired: true, connectedat: now, ...over };
}

describe("torture: tool catalog build, layout and resolution", () => {
  it("builds the catalog with the four namespaces and the catalog version stamped on every domain", () => {
    const catalog = buildtoolcatalog();
    expect(catalog.version).toBe(toolcatalogversion);
    expect(catalog.domains.map(domain => domain.namespace)).toEqual(toolnamespaces);
    expect(toolnamespaces).toEqual(["browser", "workflow", "memory", "system"]);
  });

  it("lists every tool flattened across the domains and groups by namespace", () => {
    const catalog = buildtoolcatalog();
    const flat = alltools(catalog);
    expect(flat.length).toBeGreaterThan(20);
    const grouped = toolsbynamespace(catalog);
    expect(grouped).toHaveLength(4);
    expect(grouped[0]?.namespace).toBe("browser");
    expect(grouped[0]?.tools.length).toBeGreaterThan(10);
  });

  it("resolves the tool by its namespaced name and refuses the bare colliding name", () => {
    const catalog = buildtoolcatalog();
    expect(resolvetool(catalog, "browser.click")?.name).toBe("browser.click");
    expect(resolvetool(catalog, "snapshot")?.name).toBe("browser.snapshot");
    expect(resolvetool(catalog, "nonexistent")).toBeUndefined();
    expect(resolvetool(catalog, "list")).toBeUndefined();
  });

  it("reads the namespace of one tool name and reports undefined on bare names", () => {
    expect(namespaceof("browser.click")).toBe("browser");
    expect(namespaceof("memory.list")).toBe("memory");
    expect(namespaceof("system.status")).toBe("system");
    expect(namespaceof("workflow.plan")).toBe("workflow");
    expect(namespaceof("barename")).toBeUndefined();
    expect(namespaceof("evil.tool")).toBeUndefined();
  });

  it("prefixes the tool base name with its namespace", () => {
    expect(toolname("browser", "click")).toBe("browser.click");
    expect(toolname("memory", "list")).toBe("memory.list");
  });

  it("reviews the action kinds of every namespace against the documented domain map", () => {
    expect(domainkinds.browser).toContain("click");
    expect(domainkinds.workflow).toContain("runworkflow");
    expect(domainkinds.memory).toContain("extractvars");
    expect(domainkinds.system).toContain("readmeta");
  });

  it("builds the json schema with the required list derived from the property map", () => {
    const properties: Record<string, toolschemaproperty> = {
      target: { type: "string", description: "selector", required: true },
      value: { type: "string", description: "value" },
      options: { type: "object", description: "opts", default: {} },
    };
    const schema = toolschemaof(properties);
    expect(schema.type).toBe("object");
    expect(schema.required).toEqual(["target"]);
    expect(schema.properties).toBe(properties);
  });

  it("renders the openapi style field layout with the required star and the default value", () => {
    const schema = toolschemaof({
      target: { type: "string", description: "selector", required: true },
      value: { type: "string", description: "value", default: "fallback" },
      options: { type: "object", description: "opts", default: {} },
    });
    const layout = openapilayout(schema);
    expect(layout).toContain("target:string*");
    expect(layout).toContain("value:string=fallback");
    expect(layout).toContain("options:object={}");
  });
});

describe("torture: tool call rate limit boundary and concurrency", () => {
  it("keeps the unbounded client unbounded and counts the calls of the limited client", () => {
    const unlimited = applyratelimit({ limits: [], clientid: "c1", now });
    expect(unlimited.allowed).toBe(true);
    expect(unlimited.used).toBe(0);
    const limited: callratelimit[] = [{ clientid: "c2", windowstartedat: now, windowms: 1000, used: 0, budget: 3 }];
    const first = applyratelimit({ limits: limited, clientid: "c2", now });
    expect(first.allowed).toBe(true);
    expect(first.used).toBe(1);
    const second = applyratelimit({ limits: first.limits, clientid: "c2", now: now + 1 });
    expect(second.used).toBe(2);
    expect(second.limits[0]?.used).toBe(2);
  });

  it("refuses the call that would exceed the budget and reports the retry after window", () => {
    const limits: callratelimit[] = [{ clientid: "c1", windowstartedat: now, windowms: 1000, used: 3, budget: 3 }];
    const refused = applyratelimit({ limits, clientid: "c1", now: now + 100 });
    expect(refused.allowed).toBe(false);
    expect(refused.budget).toBe(3);
    expect(refused.retryafter).toBe(900);
    expect(refused.used).toBe(3);
  });

  it("resets the counter when the window elapsed past the boundary and at the exact boundary", () => {
    const limits: callratelimit[] = [{ clientid: "c1", windowstartedat: now, windowms: 1000, used: 3, budget: 3 }];
    const atexact = applyratelimit({ limits, clientid: "c1", now: now + 1000 });
    expect(atexact.allowed).toBe(true);
    expect(atexact.used).toBe(1);
    expect(atexact.limits[0]?.windowstartedat).toBe(now + 1000);
  });

  it("ignores other clients and only counts the matching clientid", () => {
    const limits: callratelimit[] = [{ clientid: "c1", windowstartedat: now, windowms: 1000, used: 0, budget: 1 }];
    const other = applyratelimit({ limits, clientid: "c2", now });
    expect(other.allowed).toBe(true);
    expect(other.used).toBe(0);
    expect(other.limits).toBe(limits);
  });
});

describe("torture: tool structured errors and retry hint classification", () => {
  it("builds the structured error with the code, the message and the optional retry after", () => {
    const error = structurederrorof({ code: "rate_limited", message: "too many calls", retryhint: "wait", retryafter: 100 });
    expect(error).toMatchObject({ code: "rate_limited", message: "too many calls", retryhint: "wait", retryafter: 100 });
    const without = structurederrorof({ code: "internal", message: "boom", retryhint: "retry" });
    expect(without.retryafter).toBeUndefined();
  });

  it("classifies the retry hint by the keyword and falls back to none", () => {
    expect(callretryhintof({ code: "consent", message: "refused" })).toBe("none");
    expect(callretryhintof({ code: "rate", message: "busy window" })).toBe("wait");
    expect(callretryhintof({ code: "timeout", message: "timed out" })).toBe("retry");
    expect(callretryhintof({ code: "internal", message: "network error" })).toBe("retry");
    expect(callretryhintof({ message: "unknown failure" })).toBe("none");
    expect(callretryhintof({})).toBe("none");
  });

  it("maps the executor failure of the Error instance and the plain object shapes onto the structured error", () => {
    const fromerror = maptoolerror({ failure: new Error("crashed"), retryafter: 5 });
    expect(fromerror.code).toBe("internal");
    expect(fromerror.message).toBe("crashed");
    expect(fromerror.retryhint).toBe("retry");
    expect(fromerror.retryafter).toBe(5);
    const fromobject = maptoolerror({ failure: { code: "rate", message: "busy" } });
    expect(fromobject.code).toBe("rate");
    expect(fromobject.retryhint).toBe("wait");
    const frommissing = maptoolerror({ failure: { message: "no code" } });
    expect(frommissing.code).toBe("internal");
  });
});

describe("torture: tool idempotency replay window and boundaries", () => {
  it("replays the stored result of the same client inside the window and refuses outside it", () => {
    const records: idempotencyrecord[] = [{ key: "k1", clientid: "c1", tool: "browser.click", result: result("done"), createdat: now, expiresat: now + 1000 }];
    expect(checkidempotency({ records, key: "k1", clientid: "c1", now: now + 500 }).replay?.content).toBe("done");
    expect(checkidempotency({ records, key: "k1", clientid: "c1", now: now + 1000 }).reason).toMatch(/expired/i);
    expect(checkidempotency({ records, key: "k1", clientid: "c1", now: now + 1001 }).reason).toMatch(/expired/i);
  });

  it("refuses the foreign client and the unknown key honestly", () => {
    const records: idempotencyrecord[] = [{ key: "k1", clientid: "c1", tool: "browser.click", result: result("done"), createdat: now, expiresat: now + 1000 }];
    expect(checkidempotency({ records, key: "k1", clientid: "c2", now: now }).reason).toMatch(/another client/i);
    expect(checkidempotency({ records, key: "k2", clientid: "c1", now: now }).reason).toMatch(/no stored record/i);
  });

  it("records the idempotency record and overwrites the same key of the same client", () => {
    const base: idempotencyrecord[] = [];
    const first = recordidempotency({ records: base, key: "k1", clientid: "c1", tool: "browser.click", result: result("first"), now });
    expect(first).toHaveLength(1);
    const second = recordidempotency({ records: first, key: "k1", clientid: "c1", tool: "browser.click", result: result("second"), now: now + 1 });
    expect(second).toHaveLength(1);
    expect(second[0]?.result.content).toBe("second");
  });

  it("uses the default idempotency window when the user configured window is absent", () => {
    expect(defaultidempotencywindowms).toBe(300_000);
    const records = recordidempotency({ records: [], key: "k1", clientid: "c1", tool: "browser.click", result: result("done"), now });
    expect(records[0]?.expiresat).toBe(now + 300_000);
  });

  it("expires the records past their window and keeps the live ones", () => {
    const records: idempotencyrecord[] = [
      { key: "k1", clientid: "c1", tool: "browser.click", result: result("done"), createdat: now - 2000, expiresat: now - 1000 },
      { key: "k2", clientid: "c1", tool: "browser.click", result: result("live"), createdat: now - 100, expiresat: now + 1000 },
    ];
    const remaining = expireidempotency(records, now);
    expect(remaining.map(record => record.key)).toEqual(["k2"]);
    expect(expireidempotency(records, now + 2000)).toEqual([]);
  });
});

describe("torture: tool batch runtime, mocks and call contexts", () => {
  it("runs the ordered batch and stops on the first error when the flag requests it", async () => {
    const outcomes = await runbatch({
      calls: [{ id: "a", name: "browser.snapshot", params: {} }, { id: "b", name: "browser.click", params: {} }, { id: "c", name: "browser.snapshot", params: {} }],
      stoponerror: true,
      now,
      execute: async (call) => call.id === "b" ? { ok: false, error: structurederrorof({ code: "internal", message: "boom", retryhint: "none" }) } : { ok: true, result: result(`done ${call.id}`) },
    });
    expect(outcomes.outcomes.map(o => o.callid)).toEqual(["a", "b"]);
    expect(outcomes.stoppedat).toBe("b");
  });

  it("runs every call when stoponerror is false and reports every outcome", async () => {
    const outcomes = await runbatch({
      calls: [{ id: "a", name: "browser.snapshot", params: {} }, { id: "b", name: "browser.click", params: {} }],
      stoponerror: false,
      now,
      execute: async (call) => call.id === "b" ? { ok: false, error: structurederrorof({ code: "internal", message: "boom", retryhint: "none" }) } : { ok: true, result: result(`done ${call.id}`) },
    });
    expect(outcomes.outcomes.map(o => o.callid)).toEqual(["a", "b"]);
    expect(outcomes.outcomes[1]?.ok).toBe(false);
    expect(outcomes.stoppedat).toBeUndefined();
  });

  it("applies the mock of a test context and refuses the mock outside a test context", () => {
    const mocks: toolmock[] = [{ tool: "browser.snapshot", result: result("mocked"), testcontext: true, createdat: now }];
    expect(applymock({ mocks, tool: "browser.snapshot" }).result?.content).toBe("mocked");
    expect(applymock({ mocks, tool: "browser.click" }).result).toBeUndefined();
    const realmocks: toolmock[] = [{ tool: "browser.snapshot", result: result("mocked"), testcontext: false, createdat: now }];
    expect(applymock({ mocks: realmocks, tool: "browser.snapshot" }).reason).toMatch(/test context/i);
  });

  it("opens and closes the call context with the chunks counter and the partial result", () => {
    const opened = begincall({ clientid: "c1", tool: "browser.click", callid: "call1", idempotencykey: "k1", now });
    expect(opened.state).toBe("inflight");
    expect(opened.callid).toBe("call1");
    expect(opened.idempotencykey).toBe("k1");
    expect(opened.chunks).toBe(0);
    const closed = endcall({ contexts: [opened], callid: "call1", ok: true, now: now + 1 });
    expect(closed.context?.state).toBe("done");
    expect(closed.context?.endedat).toBe(now + 1);
    const failed = endcall({ contexts: [opened], callid: "call1", ok: false, errorcode: "boom", partial: result("partial"), now: now + 2 });
    expect(failed.context?.state).toBe("failed");
    expect(failed.context?.errorcode).toBe("boom");
    expect(failed.context?.partial?.content).toBe("partial");
  });

  it("refuses to close a context that never opened or already closed", () => {
    const opened = begincall({ clientid: "c1", tool: "browser.click", callid: "call1", now });
    const closed = endcall({ contexts: [opened], callid: "call1", ok: true, now: now + 1 });
    const second = endcall({ contexts: closed.contexts, callid: "call1", ok: true, now: now + 2 });
    expect(second.context?.state).toBe("done");
    expect(second.reason).toBeUndefined();
    expect(endcall({ contexts: closed.contexts, callid: "ghost", ok: true, now }).reason).toMatch(/never opened/i);
  });
});

describe("torture: tool dry run validation and consent gate", () => {
  it("validates the required arguments and reports the missing ones honestly", () => {
    const catalog = buildtoolcatalog();
    const tool = resolvetool(catalog, "browser.click")!;
    const findings = dryruntool({ tool, params: {}, client: client(), origin: "https://example.com", now });
    expect(findings.argsvalid).toBe(false);
    expect(findings.findings.some(f => /stepid/i.test(f))).toBe(true);
    expect(findings.executed).toBe(false);
    expect(findings.mutations).toEqual([]);
  });

  it("reports the type mismatch of the supplied arguments", () => {
    const catalog = buildtoolcatalog();
    const tool = resolvetool(catalog, "browser.click")!;
    const findings = dryruntool({ tool, params: { stepid: 123 }, client: client(), origin: "https://example.com", now });
    expect(findings.findings.some(f => /string/i.test(f))).toBe(true);
  });

  it("grades the batch by its most sensitive member", () => {
    expect(batchrisk([{ risk: "read" }, { risk: "read" }])).toBe("read");
    expect(batchrisk([{ risk: "read" }, { risk: "sensitive" }])).toBe("sensitive");
    expect(batchrisk([{ risk: "sensitive" }])).toBe("sensitive");
    expect(batchrisk([])).toBe("read");
  });

  it("reads the consent gate through the dryrun tool and refuses the unpaired client", () => {
    const catalog = buildtoolcatalog();
    const tool = resolvetool(catalog, "browser.click")!;
    const unpaired = dryruntool({ tool, params: { stepid: "s1" }, client: client({ paired: false }), origin: "https://example.com", now });
    expect(unpaired.consentok).toBe(false);
    expect(unpaired.findings.length).toBeGreaterThan(0);
  });
});

describe("torture: tool catalog invariants, consent metadata and naming", () => {
  it("stamps the catalog version on every tool of every domain", () => {
    const catalog = buildtoolcatalog();
    for (const tool of alltools(catalog)) {
      expect(tool.version).toBe(toolcatalogversion);
    }
    for (const domain of catalog.domains) {
      expect(domain.version).toBe(toolcatalogversion);
      expect(domain.namespace).toBe(domain.tools[0]?.name.split(".")[0]);
    }
  });

  it("ends every catalog description with the openapi style field layout", () => {
    const catalog = buildtoolcatalog();
    for (const tool of alltools(catalog)) {
      expect(tool.description).toMatch(/Fields: .*\.$/);
    }
  });

  it("keeps every read tool free of consent metadata and every gated tool behind the approval gate", () => {
    const catalog = buildtoolcatalog();
    for (const tool of alltools(catalog)) {
      if (tool.risk === "read") {
        expect(tool.consentmeta).toBeUndefined();
        expect(tool.inputschema.required).not.toContain("stepid");
      } else {
        expect(tool.consentmeta).toMatchObject({ approvalrequired: true, originscope: "session", riskclass: tool.risk });
        expect(tool.inputschema.required).toEqual(["stepid"]);
      }
    }
  });

  it("keeps every tool kind inside its declared namespace domain", () => {
    const catalog = buildtoolcatalog();
    for (const domain of catalog.domains) {
      for (const tool of domain.tools) {
        expect(domainkinds[domain.namespace]).toContain(tool.kind);
        expect(tool.name.startsWith(`${domain.namespace}.`)).toBe(true);
      }
    }
  });

  it("derives the required list from the property map in declaration order", () => {
    const schema = toolschemaof({
      optional: { type: "string", description: "d" },
      first: { type: "string", description: "d", required: true },
      second: { type: "number", description: "d", required: true },
    });
    expect(schema.required).toEqual(["first", "second"]);
    expect(toolschemaof({}).required).toEqual([]);
    expect(schema.type).toBe("object");
  });

  it("renders the openapi layout for numbers, booleans and empty defaults", () => {
    const layout = openapilayout(toolschemaof({
      count: { type: "number", description: "d", default: 5 },
      flag: { type: "boolean", description: "d" },
      none: { type: "object", description: "d" },
    }));
    expect(layout).toContain("count:number=5");
    expect(layout).toContain("flag:boolean");
    expect(layout).toContain("none:object");
    expect(layout.endsWith(".")).toBe(true);
    expect(openapilayout(toolschemaof({}))).toBe("Fields: .");
  });

  it("resolves the unique bare base names and refuses the shared ones", () => {
    const catalog = buildtoolcatalog();
    const names = alltools(catalog).map(tool => tool.name.split(".")[1] ?? "");
    const duplicates = new Set(names.filter((name, index) => names.indexOf(name) !== index));
    expect(duplicates.size).toBeGreaterThan(0);
    for (const name of names) {
      const resolved = resolvetool(catalog, name);
      if (duplicates.has(name)) expect(resolved).toBeUndefined();
      else expect(resolved?.name.split(".")[1]).toBe(name);
    }
  });

  it("reads the namespace of dotted, multi dotted and unicode names", () => {
    expect(namespaceof("browser.click")).toBe("browser");
    expect(namespaceof("memory.list.extra")).toBe("memory");
    expect(namespaceof("browser.\u00e9clat")).toBe("browser");
    expect(namespaceof("evil.click")).toBeUndefined();
    expect(namespaceof("browser")).toBe("browser");
    expect(namespaceof("")).toBeUndefined();
    expect(namespaceof(".click")).toBeUndefined();
  });

  it("prefixes any base name through the toolname helper without validation", () => {
    expect(toolname("system", "status")).toBe("system.status");
    expect(toolname("browser" as "browser", "\u00e9 #1")).toBe("browser.\u00e9 #1");
  });

  it("groups the tools by namespace with the domain versions carried", () => {
    const catalog = buildtoolcatalog();
    const grouped = toolsbynamespace(catalog);
    expect(grouped.map(group => group.namespace)).toEqual(toolnamespaces);
    for (const group of grouped) {
      expect(group.tools.length).toBe(catalog.domains.find(domain => domain.namespace === group.namespace)?.tools.length);
    }
  });
});

describe("torture: rate limit budgets, windows and retry hints", () => {
  it("keeps a limit without a budget unbounded however many calls land", () => {
    const limits: callratelimit[] = [{ clientid: "c1", windowstartedat: now, windowms: 1000, used: 1_000_000 }];
    const allowed = applyratelimit({ limits, clientid: "c1", now });
    expect(allowed.allowed).toBe(true);
    expect(allowed.used).toBe(1_000_001);
    expect(allowed.budget).toBeUndefined();
  });

  it("refuses immediately under a zero budget with the whole window to retry", () => {
    const limits: callratelimit[] = [{ clientid: "c1", windowstartedat: now, windowms: 1000, used: 0, budget: 0 }];
    const refused = applyratelimit({ limits, clientid: "c1", now: now + 100 });
    expect(refused.allowed).toBe(false);
    expect(refused.used).toBe(0);
    expect(refused.retryafter).toBe(900);
    const reset = applyratelimit({ limits, clientid: "c1", now: now + 1000 });
    expect(reset.allowed).toBe(false);
    expect(reset.retryafter).toBe(1000);
    expect(reset.limits[0]?.windowstartedat).toBe(now + 1000);
  });

  it("resets the exhausted window at the exact edge and waits one tick under it", () => {
    const limits: callratelimit[] = [{ clientid: "c1", windowstartedat: now, windowms: 1000, used: 3, budget: 3 }];
    const under = applyratelimit({ limits, clientid: "c1", now: now + 999 });
    expect(under.allowed).toBe(false);
    expect(under.retryafter).toBe(1);
    const edge = applyratelimit({ limits, clientid: "c1", now: now + 1000 });
    expect(edge.allowed).toBe(true);
    expect(edge.used).toBe(1);
    expect(edge.limits[0]?.windowstartedat).toBe(now + 1000);
  });

  it("keeps the window while the elapsed time stays under it and resets past it", () => {
    const limits: callratelimit[] = [{ clientid: "c1", windowstartedat: now, windowms: 1000, used: 1, budget: 5 }];
    const inside = applyratelimit({ limits, clientid: "c1", now: now + 999 });
    expect(inside.used).toBe(2);
    expect(inside.limits[0]?.windowstartedat).toBe(now);
    const outside = applyratelimit({ limits, clientid: "c1", now: now + 1001 });
    expect(outside.used).toBe(1);
    expect(outside.limits[0]?.windowstartedat).toBe(now + 1001);
  });

  it("counts the refusal against the limit list of the matching client only", () => {
    const limits: callratelimit[] = [
      { clientid: "c1", windowstartedat: now, windowms: 1000, used: 3, budget: 3 },
      { clientid: "c2", windowstartedat: now, windowms: 1000, used: 0, budget: 1 },
    ];
    const refused = applyratelimit({ limits, clientid: "c1", now });
    expect(refused.allowed).toBe(false);
    expect(refused.limits[1]?.used).toBe(0);
  });

  it("classifies the retry hint by keyword precedence", () => {
    expect(callretryhintof({ code: "consent", message: "rate limited window" })).toBe("none");
    expect(callretryhintof({ code: "refused grant", message: "timeout" })).toBe("none");
    expect(callretryhintof({ code: "unpaired", message: "queue busy" })).toBe("none");
    expect(callretryhintof({ code: "rate", message: "consent refused" })).toBe("none");
    expect(callretryhintof({ code: "queue", message: "window" })).toBe("wait");
    expect(callretryhintof({ code: "timeout", message: "rate" })).toBe("wait");
    expect(callretryhintof({ code: "network", message: "timed out" })).toBe("retry");
    expect(callretryhintof({ code: "internal", message: "boom" })).toBe("retry");
    expect(callretryhintof({ code: "network error", message: "" })).toBe("retry");
  });

  it("maps Error instances, coded objects and message only failures", () => {
    expect(maptoolerror({ failure: new Error("network boom") })).toMatchObject({ code: "internal", message: "network boom", retryhint: "retry" });
    expect(maptoolerror({ failure: { code: "rate", message: "busy window" }, retryafter: 7 })).toMatchObject({ code: "rate", retryhint: "wait", retryafter: 7 });
    expect(maptoolerror({ failure: { message: "no code" } })).toMatchObject({ code: "internal", retryhint: "retry" });
    expect(maptoolerror({ failure: { code: "consent", message: "denied" } }).retryafter).toBeUndefined();
  });

  it("builds the structured error with and without the retry after", () => {
    expect(structurederrorof({ code: "boom", message: "m", retryhint: "none" })).toEqual({ code: "boom", message: "m", retryhint: "none" });
    expect(structurederrorof({ code: "boom", message: "", retryhint: "wait", retryafter: 0 })).toEqual({ code: "boom", message: "", retryhint: "wait", retryafter: 0 });
  });
});

describe("torture: idempotency windows, records and expiry edges", () => {
  it("refuses the replay at the exact expiry tick and one past it", () => {
    const records: idempotencyrecord[] = [{ key: "k1", clientid: "c1", tool: "browser.click", result: result("done"), createdat: now, expiresat: now + 1000 }];
    expect(checkidempotency({ records, key: "k1", clientid: "c1", now: now + 999 }).replay?.content).toBe("done");
    expect(checkidempotency({ records, key: "k1", clientid: "c1", now: now + 1000 }).replay).toBeUndefined();
    expect(checkidempotency({ records, key: "k1", clientid: "c1", now: now + 1001 }).reason).toMatch(/expired past its window/i);
  });

  it("expires a zero window record immediately", () => {
    const records = recordidempotency({ records: [], key: "k1", clientid: "c1", tool: "browser.click", result: result("done"), now, window: 0 });
    expect(records[0]?.expiresat).toBe(now);
    expect(checkidempotency({ records, key: "k1", clientid: "c1", now }).replay).toBeUndefined();
    expect(checkidempotency({ records, key: "k1", clientid: "c1", now: now + 1 }).reason).toMatch(/expired/i);
  });

  it("keeps the records of two clients under the same key separate", () => {
    let records = recordidempotency({ records: [], key: "k1", clientid: "c1", tool: "browser.click", result: result("one"), now });
    records = recordidempotency({ records, key: "k1", clientid: "c2", tool: "browser.click", result: result("two"), now: now + 1 });
    expect(records).toHaveLength(2);
    expect(checkidempotency({ records, key: "k1", clientid: "c2", now }).replay?.content).toBe("two");
    expect(checkidempotency({ records, key: "k1", clientid: "c1", now }).replay?.content).toBe("one");
  });

  it("overwrites the same key of the same client and prepends the newest", () => {
    let records = recordidempotency({ records: [], key: "k1", clientid: "c1", tool: "browser.click", result: result("first"), now });
    records = recordidempotency({ records, key: "k2", clientid: "c1", tool: "browser.click", result: result("second"), now: now + 1 });
    records = recordidempotency({ records, key: "k1", clientid: "c1", tool: "browser.click", result: result("third"), now: now + 2 });
    expect(records.map(record => record.key)).toEqual(["k1", "k2"]);
    expect(records[0]?.result.content).toBe("third");
    expect(records[0]?.createdat).toBe(now + 2);
    expect(records[0]?.expiresat).toBe(now + 2 + defaultidempotencywindowms);
  });

  it("expires exactly the records whose window passed and keeps the boundary", () => {
    const records: idempotencyrecord[] = [
      { key: "k1", clientid: "c1", tool: "t", result: result("a"), createdat: now - 2000, expiresat: now },
      { key: "k2", clientid: "c1", tool: "t", result: result("b"), createdat: now - 100, expiresat: now + 1 },
    ];
    expect(expireidempotency(records, now).map(record => record.key)).toEqual(["k2"]);
    expect(expireidempotency(records, now + 1)).toEqual([]);
    expect(expireidempotency([], now)).toEqual([]);
  });
});

describe("torture: batch runtime, mocks and call context edges", () => {
  it("runs an empty batch to an empty outcome list", async () => {
    const outcomes = await runbatch({ calls: [], stoponerror: true, now, execute: async () => ({ ok: true, result: result("x") }) });
    expect(outcomes.outcomes).toEqual([]);
    expect(outcomes.stoppedat).toBeUndefined();
  });

  it("propagates the executor failure of the batch member", async () => {
    await expect(runbatch({ calls: [{ id: "a", name: "browser.click", params: {} }], stoponerror: false, now, execute: async () => { throw new Error("executor crashed"); } })).rejects.toThrow(/executor crashed/i);
  });

  it("stamps each outcome with its own sequential time", async () => {
    const outcomes = await runbatch({ calls: [
      { id: "a", name: "browser.snapshot", params: {} },
      { id: "b", name: "browser.snapshot", params: {} },
    ], stoponerror: false, now, execute: async () => ({ ok: true, result: result("done") }) });
    expect(outcomes.outcomes.map(outcome => outcome.at)).toEqual([now, now + 1]);
    expect(outcomes.outcomes.every(outcome => outcome.ok)).toBe(true);
  });

  it("answers no mock and no reason when the list stays empty", () => {
    expect(applymock({ mocks: [], tool: "browser.click" })).toEqual({});
  });

  it("drops the blank idempotency key and carries the dry run and batch markers", () => {
    const opened = begincall({ clientid: "c1", tool: "browser.click", callid: "call1", idempotencykey: "   ", dryrun: true, batchid: "b1", now });
    expect(opened.idempotencykey).toBeUndefined();
    expect(opened.dryrun).toBe(true);
    expect(opened.batchid).toBe("b1");
    expect(opened.chunks).toBe(0);
    expect(opened.state).toBe("inflight");
    const bare = begincall({ clientid: "c1", tool: "t", now });
    expect(bare.callid).not.toBe("");
    expect(bare.callid.length).toBeGreaterThan(10);
    expect(bare.dryrun).toBeUndefined();
  });

  it("closes the failed call with its error code and keeps the partial result", () => {
    const opened = begincall({ clientid: "c1", tool: "browser.click", callid: "call1", now });
    const failed = endcall({ contexts: [opened], callid: "call1", ok: false, errorcode: "consent", partial: result("half"), now: now + 1 });
    expect(failed.context).toMatchObject({ state: "failed", errorcode: "consent", endedat: now + 1 });
    expect(failed.context?.partial?.content).toBe("half");
    expect(failed.context?.chunks).toBe(0);
    expect(failed.reason).toBeUndefined();
  });

  it("answers the close of a cancelled context with the context and no reason", () => {
    const opened = begincall({ clientid: "c1", tool: "browser.click", callid: "call1", now });
    const cancelled = { ...opened, state: "cancelled" as const, endedat: now };
    const closed = endcall({ contexts: [cancelled], callid: "call1", ok: true, now: now + 1 });
    expect(closed.context).toEqual(cancelled);
    expect(closed.reason).toBeUndefined();
  });
});

describe("torture: tool dry runs behind the consent gates", () => {
  const session: agentsession = { id: "s1", tabid: 4, origin: "https://example.com", startedat: now - 1000, expiresat: now + 600_000, grants: ["https://example.com"] };
  const step: toolstep = { id: "s1", kind: "click", target: "#submit", summary: "Click the reviewed submit control.", risk: "sensitive" };
  const plan: agentplan = { id: "plan1", objective: "run the form", origin: "https://example.com", steps: [step], createdat: now - 2000, expiresat: now + 600_000, state: "approved" };

  it("passes the dry run of a gated tool behind the paired client, the live session and the approved step", () => {
    const catalog = buildtoolcatalog();
    const tool = resolvetool(catalog, "browser.click")!;
    const findings = dryruntool({ tool, params: { stepid: "s1" }, client: client(), session, plan, origin: "https://example.com", now });
    expect(findings.argsvalid).toBe(true);
    expect(findings.consentok).toBe(true);
    expect(findings.executed).toBe(false);
    expect(findings.mutations).toEqual([]);
    expect(findings.tool).toBe("browser.click");
  });

  it("refuses the dry run without a live session or without the approved plan", () => {
    const catalog = buildtoolcatalog();
    const tool = resolvetool(catalog, "browser.click")!;
    const nosession = dryruntool({ tool, params: { stepid: "s1" }, client: client(), plan, origin: "https://example.com", now });
    expect(nosession.consentok).toBe(false);
    expect(nosession.findings.some(f => /live browser session/i.test(f))).toBe(true);
    const unapproved = dryruntool({ tool, params: { stepid: "s1" }, client: client(), session, plan: { ...plan, state: "pending" as const }, origin: "https://example.com", now });
    expect(unapproved.consentok).toBe(false);
    expect(unapproved.findings.some(f => /approved plan review/i.test(f))).toBe(true);
  });

  it("refuses the dry run of a step kind the tool does not wrap and the ungranted origin", () => {
    const catalog = buildtoolcatalog();
    const tool = resolvetool(catalog, "browser.click")!;
    const mismatch = dryruntool({ tool, params: { stepid: "s1" }, client: client(), session, plan: { ...plan, steps: [{ ...step, kind: "type" }] }, origin: "https://example.com", now });
    expect(mismatch.consentok).toBe(false);
    expect(mismatch.findings.some(f => /does not match the browser.click tool/i.test(f))).toBe(true);
    const foreign = dryruntool({ tool, params: { stepid: "s1" }, client: client(), session, plan, origin: "https://denied.example", now });
    expect(foreign.consentok).toBe(false);
    expect(foreign.findings.some(f => /outside the session grants/i.test(f))).toBe(true);
  });

  it("reads the stepid from the explicit input before the params", () => {
    const catalog = buildtoolcatalog();
    const tool = resolvetool(catalog, "browser.click")!;
    const explicit = dryruntool({ tool, params: {}, client: client(), session, plan, origin: "https://example.com", stepid: "s1", now });
    expect(explicit.argsvalid).toBe(false);
    expect(explicit.consentok).toBe(true);
  });

  it("validates the array and null argument shapes against the schema types", () => {
    const catalog = buildtoolcatalog();
    const tool = resolvetool(catalog, "browser.readtext")!;
    const findings = dryruntool({ tool, params: { target: [] }, client: client(), session, plan, origin: "https://example.com", now });
    expect(findings.argsvalid).toBe(false);
    expect(findings.findings.some(f => /array value where the schema asks a string/i.test(f))).toBe(true);
    const nulls = dryruntool({ tool, params: { target: null }, client: client(), session, plan, origin: "https://example.com", now });
    expect(nulls.findings.some(f => /target .* stays empty/i.test(f))).toBe(true);
  });

  it("grades the batch risk of empty, mixed and sensitive members", () => {
    expect(batchrisk([])).toBe("read");
    expect(batchrisk([{ risk: "sensitive" }, { risk: "read" }, { risk: "read" }])).toBe("sensitive");
    expect(batchrisk([{ risk: "read" }, { risk: "read" }])).toBe("read");
  });
});
