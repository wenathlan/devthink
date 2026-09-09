import { describe, expect, it } from "vitest";
import {
  applymock,
  applyratelimit,
  begincall,
  batchrisk,
  checkidempotency,
  dryruntool,
  endcall,
  expireidempotency,
  maptoolerror,
  recordidempotency,
  callretryhintof,
  runbatch,
  structurederrorof,
} from "../tools.js";
import { buildtoolcatalog } from "../tools.js";
import type { batchmember, callratelimit, clientrecord, idempotencyrecord, toolmock } from "../types.js";

const now = 1_800_000_000_000;
const catalog = buildtoolcatalog();
const pairedclient: clientrecord = { id: "client1", transport: "stdio", paired: true, connectedat: now - 1000 };
const session = {
  id: "sess",
  tabid: 7,
  origin: "https://example.com",
  startedat: now - 5000,
  expiresat: now + 600_000,
  grants: ["https://example.com"],
};
const plan = {
  id: "plan1",
  objective: "Run the reviewed tool calls",
  origin: "https://example.com",
  steps: [
    {
      id: "s1",
      kind: "click" as const,
      target: "#go",
      summary: "Click the reviewed button",
      risk: "sensitive" as const,
    },
  ],
  createdat: now - 4000,
  expiresat: now + 600_000,
  state: "approved" as const,
};

/** Builds one per client rate limit record. */
function limit(over: Partial<callratelimit> = {}): callratelimit {
  return { clientid: "client1", windowms: 60_000, budget: 2, windowstartedat: now, used: 0, ...over };
}

describe("toolcalls rate limits", () => {
  it("counts calls per client per window and answers excess with the retry after", () => {
    const first = applyratelimit({ limits: [limit()], clientid: "client1", now });
    expect(first.allowed).toBe(true);
    expect(first.used).toBe(1);
    const second = applyratelimit({ limits: first.limits, clientid: "client1", now: now + 1000 });
    expect(second.allowed).toBe(true);
    expect(second.used).toBe(2);
    const excess = applyratelimit({ limits: second.limits, clientid: "client1", now: now + 2000 });
    expect(excess.allowed).toBe(false);
    expect(excess.budget).toBe(2);
    expect(excess.retryafter).toBe(58_000);
    expect(excess.used).toBe(2);
    const reset = applyratelimit({ limits: second.limits, clientid: "client1", now: now + 61_000 });
    expect(reset.allowed).toBe(true);
    expect(reset.used).toBe(1);
  });

  it("keeps absent limits and budgets unbounded with no silent default", () => {
    expect(applyratelimit({ limits: [], clientid: "client1", now }).allowed).toBe(true);
    const unbounded = applyratelimit({
      limits: [{ clientid: "client1", windowms: 60_000, windowstartedat: now, used: 5 }],
      clientid: "client1",
      now,
    });
    expect(unbounded.allowed).toBe(true);
    expect(unbounded.budget).toBeUndefined();
    const other = applyratelimit({
      limits: [limit({ clientid: "client2", budget: 1, used: 1 })],
      clientid: "client1",
      now,
    });
    expect(other.allowed).toBe(true);
  });
});

describe("toolcalls structured errors and retry hints", () => {
  it("classifies retryable timeouts, busy windows and consent refusals", () => {
    expect(callretryhintof({ code: "internal", message: "The page executor timed out." })).toBe("retry");
    expect(callretryhintof({ message: "network went away" })).toBe("retry");
    expect(callretryhintof({ message: "The session queue is busy." })).toBe("wait");
    expect(callretryhintof({ code: "ratelimited", message: "The budget is spent." })).toBe("wait");
    expect(callretryhintof({ code: "consentrefused", message: "The consent gates refused." })).toBe("none");
    expect(callretryhintof({ message: "The client is unpaired." })).toBe("none");
    expect(callretryhintof({ message: "The origin stays outside the grants." })).toBe("none");
  });

  it("maps executor failures onto structured errors with their retry hints", () => {
    const timeout = maptoolerror({ failure: { code: "internal", message: "The page executor timed out." } });
    expect(timeout).toMatchObject({ code: "internal", retryhint: "retry" });
    const consent = maptoolerror({
      failure: { code: "consentrefused", message: "The consent gates refused the tool call." },
    });
    expect(consent.retryhint).toBe("none");
    const error = maptoolerror({ failure: new Error("The bridge is busy.") });
    expect(error.code).toBe("internal");
    expect(error.retryhint).toBe("wait");
    expect(
      structurederrorof({ code: "ratelimited", message: "The budget is spent.", retryhint: "wait", retryafter: 4000 })
        .retryafter,
    ).toBe(4000);
  });
});

describe("toolcalls idempotency", () => {
  it("replays the stored result for a repeated key of the same client", () => {
    const records = recordidempotency({
      records: [],
      key: "key-1",
      clientid: "client1",
      tool: "browser.readtext",
      result: { content: "the stored answer", iserror: false },
      now,
      window: 60_000,
    });
    const replay = checkidempotency({ records, key: "key-1", clientid: "client1", now: now + 1000 });
    expect(replay.replay?.content).toBe("the stored answer");
    expect(replay.record?.createdat).toBe(now);
    expect(checkidempotency({ records, key: "key-2", clientid: "client1", now }).reason).toMatch(
      /names no stored record/i,
    );
    expect(checkidempotency({ records, key: "key-1", clientid: "client2", now: now + 1000 }).reason).toMatch(
      /another client/i,
    );
  });

  it("expires the records past their window so the keys never replay", () => {
    const records = recordidempotency({
      records: [],
      key: "key-1",
      clientid: "client1",
      tool: "browser.readtext",
      result: { content: "stored", iserror: false },
      now,
      window: 5000,
    });
    expect(checkidempotency({ records, key: "key-1", clientid: "client1", now: now + 4999 }).replay).toBeDefined();
    expect(checkidempotency({ records, key: "key-1", clientid: "client1", now: now + 5000 }).reason).toMatch(
      /expired/i,
    );
    const live: idempotencyrecord = {
      key: "key-2",
      clientid: "client1",
      tool: "memory.list",
      result: { content: "stored", iserror: false },
      createdat: now,
      expiresat: now + 10_000,
    };
    expect(expireidempotency([records[0] as idempotencyrecord, live], now + 6000)).toEqual([live]);
    const overwritten = recordidempotency({
      records,
      key: "key-1",
      clientid: "client1",
      tool: "browser.readtext",
      result: { content: "new answer", iserror: false },
      now: now + 1000,
      window: 5000,
    });
    expect(overwritten).toHaveLength(1);
    expect(overwritten[0]?.result.content).toBe("new answer");
  });
});

describe("toolcalls batch execution", () => {
  /** Builds one ordered batch member. */
  function member(id: string, name: string, over: Record<string, unknown> = {}): batchmember {
    return { id, name, params: { ...over } };
  }

  it("runs the ordered members and stops on the first error when the flag requests it", async () => {
    const calls = [
      member("m1", "browser.readtext", { target: "#title" }),
      member("m2", "browser.readtext", { target: "#body" }),
      member("m3", "memory.list"),
    ];
    const order: string[] = [];
    const outcome = await runbatch({
      calls,
      stoponerror: true,
      now,
      execute: async (call) => {
        order.push(call.id);
        return call.id === "m2"
          ? {
              ok: false,
              error: structurederrorof({
                code: "internal",
                message: "The page executor timed out.",
                retryhint: "retry",
              }),
            }
          : { ok: true, result: { content: `ran ${call.name}`, iserror: false } };
      },
    });
    expect(order).toEqual(["m1", "m2"]);
    expect(outcome.stoppedat).toBe("m2");
    expect(outcome.outcomes).toHaveLength(2);
    expect(outcome.outcomes[1]?.error?.retryhint).toBe("retry");
    const keepgoing = await runbatch({
      calls,
      stoponerror: false,
      now,
      execute: async (call) =>
        call.id === "m2" ? { ok: false } : { ok: true, result: { content: `ran ${call.name}`, iserror: false } },
    });
    expect(keepgoing.stoppedat).toBeUndefined();
    expect(keepgoing.outcomes).toHaveLength(3);
  });

  it("grades the batch by its most sensitive member", () => {
    expect(batchrisk([{ risk: "read" }, { risk: "read" }])).toBe("read");
    expect(batchrisk([{ risk: "read" }, { risk: "sensitive" }])).toBe("sensitive");
    expect(batchrisk([])).toBe("read");
  });
});

describe("toolcalls dry runs and mocks", () => {
  it("evaluates arguments and consent without side effects", () => {
    const tool = catalog.domains
      .flatMap((domain) => domain.tools)
      .find((candidate) => candidate.name === "browser.click");
    expect(tool).toBeDefined();
    const dry = dryruntool({
      tool: tool as never,
      params: { stepid: "s1" },
      client: pairedclient,
      session,
      plan,
      origin: session.origin,
      now,
    });
    expect(dry.argsvalid).toBe(true);
    expect(dry.consentok).toBe(true);
    expect(dry.executed).toBe(false);
    expect(dry.mutations).toEqual([]);
    const refused = dryruntool({
      tool: tool as never,
      params: {},
      client: { ...pairedclient, paired: false },
      session,
      plan,
      origin: session.origin,
      now,
    });
    expect(refused.consentok).toBe(false);
    expect(refused.argsvalid).toBe(false);
    expect(refused.findings.join(" ")).toMatch(/required argument stepid/i);
    const read = catalog.domains
      .flatMap((domain) => domain.tools)
      .find((candidate) => candidate.name === "browser.readtext");
    const wrongtype = dryruntool({
      tool: read as never,
      params: { target: 42 },
      client: pairedclient,
      session,
      plan,
      origin: session.origin,
      now,
    });
    expect(wrongtype.findings.join(" ")).toMatch(/carries a number value where the schema asks a string/i);
    expect(wrongtype.argsvalid).toBe(false);
  });

  it("answers with canned results in test contexts and never outside them", () => {
    const mock: toolmock = {
      tool: "browser.readtext",
      result: { content: "the canned read", iserror: false },
      testcontext: true,
      createdat: now,
    };
    const answered = applymock({ mocks: [mock], tool: "browser.readtext" });
    expect(answered.result?.content).toBe("the canned read");
    expect(applymock({ mocks: [], tool: "browser.readtext" }).result).toBeUndefined();
    const real: toolmock = {
      tool: "browser.click",
      result: { content: "canned click", iserror: false },
      testcontext: false,
      createdat: now,
    };
    expect(applymock({ mocks: [real], tool: "browser.click" }).reason).toMatch(/outside a test context/i);
  });
});

describe("toolcalls call contexts", () => {
  it("isolates concurrent client state and closes with the outcome", () => {
    const one = begincall({ clientid: "client1", tool: "browser.readtext", idempotencykey: "key-1", now });
    const two = begincall({ clientid: "client2", tool: "memory.list", now: now + 1 });
    const three = begincall({
      clientid: "client1",
      tool: "browser.click",
      dryrun: true,
      batchid: "batch1",
      now: now + 2,
    });
    expect(one.clientid).not.toBe(two.clientid);
    expect(one.callid).not.toBe(two.callid);
    expect(one.chunks).toBe(0);
    expect(one.idempotencykey).toBe("key-1");
    expect(three.dryrun).toBe(true);
    expect(three.batchid).toBe("batch1");
    expect(
      begincall({ clientid: "client1", tool: "browser.readtext", idempotencykey: "  ", now }).idempotencykey,
    ).toBeUndefined();
    const closed = endcall({ contexts: [one, two], callid: one.callid, ok: true, now: now + 50 });
    expect(closed.context?.state).toBe("done");
    expect(closed.context?.endedat).toBe(now + 50);
    const failed = endcall({
      contexts: closed.contexts,
      callid: two.callid,
      ok: false,
      errorcode: "internal",
      partial: { content: "partial", iserror: false },
      now: now + 60,
    });
    expect(failed.context?.state).toBe("failed");
    expect(failed.context?.errorcode).toBe("internal");
    expect(failed.context?.partial?.content).toBe("partial");
    expect(endcall({ contexts: closed.contexts, callid: "missing", ok: false, now }).reason).toMatch(/never opened/i);
    expect(endcall({ contexts: closed.contexts, callid: one.callid, ok: true, now: now + 70 }).context?.state).toBe(
      "done",
    );
  });
});
