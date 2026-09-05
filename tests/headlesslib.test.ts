import { describe, expect, it } from "vitest";
import { closeheadlesssession, headlessauditread, headlessgatewait, headlessmemory, headlessplan, headlesspolicyvalidate, headlessrun, headlesssessionview, headlesssubscribe, headlesstelemetryposture, openheadlesssession, remoteattachframes } from "../headless.js";
import { appendlogentry, openrunlog, sealrunlog } from "../security.js";
import { protocolversion } from "../types.js";
import type { flowrungate, planfile } from "../types.js";

const now = 1_800_000_000_000;

function plan(): planfile {
  return { version: protocolversion, goal: "digest the changelog", origin: "https://example.org", steps: [{ id: "observe", kind: "observe", label: "Observe the page" }] };
}

const gate: flowrungate = { id: "gate:type", kind: "type", origin: "https://example.org", reason: "The step is sensitive and waits at its consent gate." };

describe("headless sessions", () => {
  it("opens one session on an HTTPS origin with telemetry off by default", () => {
    const session = openheadlesssession({ origin: "https://example.org", now });
    expect(session.state).toBe("active");
    expect(session.telemetry).toBe(false);
    expect(session.gatesresolved).toBe(0);
    expect(() => openheadlesssession({ origin: "http://example.org", now })).toThrow(/HTTPS/);
    expect(() => openheadlesssession({ origin: "", now })).toThrow(/HTTPS/);
    const closed = closeheadlesssession(session);
    expect(closed.state).toBe("closed");
    expect(headlesssessionview(closed).gatesresolved).toBe(0);
  });

  it("routes every gate wait to the consent provider callback the host implements", async () => {
    const session = openheadlesssession({ origin: "https://example.org", now });
    const approved = await headlessgatewait({ session, gate, provider: { resolvegate: async () => "approve" } });
    expect(approved.resolution).toBe("approve");
    expect(approved.session.gatesresolved).toBe(1);
    expect(approved.session.id).toBe(session.id);
    const refused = await headlessgatewait({ session: approved.session, gate, provider: { resolvegate: async () => "refuse" } });
    expect(refused.resolution).toBe("refuse");
    expect(refused.session.gatesresolved).toBe(1);
    await expect(headlessgatewait({ session: closeheadlesssession(session), gate, provider: { resolvegate: async () => "approve" } })).rejects.toThrow(/closed/);
  });

  it("refuses every unresolved gate under denydefault with no provider attached", async () => {
    const session = openheadlesssession({ origin: "https://example.org", now });
    const denied = await headlessgatewait({ session, gate });
    expect(denied.resolution).toBe("refuse");
    expect(denied.reason).toMatch(/denydefault/);
    expect(denied.session.gatesresolved).toBe(0);
  });

  it("attaches remote sessions through the same json rpc protocol the extension speaks", () => {
    const session = openheadlesssession({ origin: "https://example.org", now });
    const frames = remoteattachframes({ id: 1, session, runtime: "node" });
    expect(frames.initialize).toMatchObject({ jsonrpc: "2.0", id: 1, method: "initialize" });
    expect(frames.initialize.params).toMatchObject({ protocolversion, runtime: "node", origin: "https://example.org" });
    expect(frames.ready).toMatchObject({ jsonrpc: "2.0", id: 1 });
    expect((frames.ready.result as { attached: boolean }).attached).toBe(true);
  });

  it("exposes the policy engine for external validation with no browser attached", () => {
    expect(headlesspolicyvalidate({ id: "s1", kind: "observe", summary: "observe", risk: "read" }, "https://example.org").allowed).toBe(true);
    const verdict = headlesspolicyvalidate({ id: "s1", kind: "explode" as never, summary: "explode", risk: "read" }, "https://example.org");
    expect(verdict.allowed).toBe(false);
  });

  it("exposes the audit reader with chain verification", async () => {
    let log = openrunlog({ runid: "run:1", sessionid: "headless", now });
    log = await appendlogentry({ log, kind: "step", summary: "The step ran.", origin: "https://example.org", stepid: "observe", at: now });
    const sealed = await sealrunlog(log, now + 10);
    const read = await headlessauditread(sealed.log);
    expect(read.ok).toBe(true);
    expect(read.entries).toHaveLength(1);
    expect(read.entries[0]?.kind).toBe("step");
  });

  it("exposes the memory entry point over the same profile store format", async () => {
    const store: Map<string, unknown> = new Map();
    const memory = headlessmemory({ async get<T>(key: string) { return store.get(key) as T | undefined; }, async set<T>(key: string, value: T) { store.set(key, value); } });
    expect(await memory.getconfig()).toBeUndefined();
    await memory.setconfig({ provider: "local" } as never);
    expect(await memory.getconfig()).toMatchObject({ provider: "local" });
  });

  it("exposes the plan, run and session entry points to hosts", () => {
    const planned = headlessplan(plan(), ["https://example.org"]);
    expect(planned.version).toBe(protocolversion);
    expect(planned.workflow.origins).toEqual(["https://example.org"]);
    expect(planned.workflow.steps[0]).toMatchObject({ id: "observe", kind: "observe" });
    expect(() => headlessplan(plan(), ["https://elsewhere.org"])).toThrow(/outside the grants/);
    const provider = { resolvegate: async () => "approve" as const };
    const run = headlessrun({ request: { planpath: "plan.json", options: { format: "human", outputdir: "out", grantspath: "grants.json", interactive: false, dryrun: true } }, file: plan(), provider });
    expect(run.provider).toBe(provider);
    expect(run.request.planpath).toBe("plan.json");
    const view = headlesssessionview(openheadlesssession({ origin: "https://example.org", now }));
    expect(view).toMatchObject({ origin: "https://example.org", state: "active", telemetry: false });
  });

  it("exposes typed run subscriptions that keep their own event list", () => {
    const seen: string[] = [];
    const subscription = headlesssubscribe(event => seen.push(event.summary));
    subscription.emit({ kind: "step", stepid: "observe", summary: "The step ran.", at: now });
    subscription.emit({ kind: "gate", stepid: "type", summary: "The gate waits.", at: now + 1 });
    expect(seen).toEqual(["The step ran.", "The gate waits."]);
    expect(subscription.events()).toHaveLength(2);
    expect(subscription.events()[0]?.kind).toBe("step");
  });

  it("keeps the telemetry posture off unless the host opts in", () => {
    expect(headlesstelemetryposture(false).telemetry).toBe(false);
    expect(headlesstelemetryposture(false).reason).toMatch(/nothing by default/);
    expect(headlesstelemetryposture(true).telemetry).toBe(true);
    expect(headlesstelemetryposture(true).reason).toMatch(/host opt in/);
  });
});
