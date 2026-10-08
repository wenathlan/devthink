/**
 * streamfallback.test.ts — honest unit tests for the stream fallback,
 * runnable with the node built-in runner (no install, no dependencies):
 *   node --test tests/streamfallback.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ApiKeyRow } from "../db.ts";
import {
  applyerrortokey,
  classifystatus,
  errorfromresponse,
  FALLBACKDEFAULTS,
  orderchain,
  runwithfallback,
  StreamError,
  verdictfor,
  type FallbackRoute,
} from "../streamfallback.ts";

/** the two-route chain the tests walk. */
const CHAIN: FallbackRoute[] = [
  { id: "primary", priority: 0, enabled: true },
  { id: "backup", priority: 1, enabled: true },
];

/** builds a key row for the applyerrortokey cases. */
function keyrow(overrides: Partial<ApiKeyRow> = {}): ApiKeyRow {
  return {
    id: "key-01",
    provider: "nvidia",
    key: "nvapi-sample-masked-0001",
    label: "nim rotation 01",
    active: true,
    status: "active",
    useCount: 10,
    rotationCount: 2,
    errorCount: 0,
    rateLimitHit: false,
    createdAt: "2026-09-12T10:00:00.000Z",
    expiresAt: null,
    ...overrides,
  };
}

describe("streamfallback error catalog", () => {
  it("classifies every status the house answers for", () => {
    assert.equal(classifystatus(0), "transport");
    assert.equal(classifystatus(401), "unauthorized");
    assert.equal(classifystatus(403), "forbidden");
    assert.equal(classifystatus(404), "notfound");
    assert.equal(classifystatus(408), "timeout");
    assert.equal(classifystatus(410), "gone");
    assert.equal(classifystatus(422), "unprocessable");
    assert.equal(classifystatus(429), "ratelimited");
    assert.equal(classifystatus(529), "overloaded");
    assert.equal(classifystatus(500), "server");
    assert.equal(classifystatus(503), "server");
    assert.equal(classifystatus(418), "unknown");
  });

  it("maps retry for transient, fallback for dead-model and abort for unknown", () => {
    for (const code of ["transport", "timeout", "server"] as const) assert.equal(verdictfor(code), "retry");
    for (const code of ["unauthorized", "forbidden", "notfound", "gone", "unprocessable", "ratelimited", "overloaded"] as const) {
      assert.equal(verdictfor(code), "fallback", `expected fallback for ${code}`);
    }
    assert.equal(verdictfor("unknown"), "abort");
  });

  it("orders the chain by priority over enabled routes only", () => {
    const chain = orderchain([
      { id: "third", priority: 2, enabled: true },
      { id: "disabled", priority: 0, enabled: false },
      { id: "first", priority: 0, enabled: true },
    ]);
    assert.deepEqual(chain.map((route) => route.id), ["first", "third"]);
  });
});

describe("streamfallback runner", () => {
  it("answers the first healthy route untouched", async () => {
    const order: string[] = [];
    const value = await runwithfallback(CHAIN, async (route) => {
      order.push(route.id);
      return `ok:${route.id}`;
    });
    assert.equal(value, "ok:primary");
    assert.deepEqual(order, ["primary"]);
  });

  it("falls back on the catalog codes and records the trail", async () => {
    for (const status of [401, 403, 404, 410, 422, 429, 529]) {
      const trail: string[] = [];
      const value = await runwithfallback(
        CHAIN,
        async (route) => {
          trail.push(route.id);
          if (route.id === "primary") throw errorfromresponse(new Response(null, { status, headers: { "retry-after": "0" } }));
          return `ok:${route.id}`;
        },
        { initialDelayMs: 1 },
      );
      assert.equal(value, `ok:backup`, `status ${status} must fall back`);
      assert.deepEqual(trail, ["primary", "backup"], `status ${status} must walk primary then backup`);
    }
  });

  it("retries the same route first on timeout and transport failures", async () => {
    let tries = 0;
    const steps: string[] = [];
    const value = await runwithfallback(
      CHAIN,
      async (route) => {
        steps.push(`${route.id}#${++tries}`);
        if (tries === 1) throw new StreamError("upstream timeout", 408, "timeout");
        return `ok:${route.id}`;
      },
      { initialDelayMs: 1 },
    );
    assert.equal(value, "ok:primary");
    assert.deepEqual(steps, ["primary#1", "primary#2"]);
  });

  it("moves on when the retry budget of a route runs out", async () => {
    let primaryTries = 0;
    const value = await runwithfallback(
      CHAIN,
      async (route) => {
        if (route.id === "primary") {
          primaryTries += 1;
          throw new StreamError("upstream timeout", 408, "timeout");
        }
        return "ok:backup";
      },
      { initialDelayMs: 1, maxDelayMs: 2 },
    );
    assert.equal(value, "ok:backup");
    assert.equal(primaryTries, FALLBACKDEFAULTS.retriesPerRoute + 1);
  });

  it("honors the Retry-After hint over the computed backoff", async () => {
    let waited = -1;
    await runwithfallback(
      CHAIN,
      async (route) => {
        if (route.id === "primary") throw new StreamError("upstream timeout", 408, "timeout", 0);
        return "ok";
      },
      { initialDelayMs: 50, onstep: (step) => (waited = Math.max(waited, step.delayMs)) },
    );
    assert.equal(waited, 0, "the hint (0ms) must win over the computed 50ms backoff");
  });

  it("aborts the chain on unknown failures and throws with the trail", async () => {
    const value = runwithfallback(CHAIN, async () => {
      throw new Error("bug in the parser");
    });
    await assert.rejects(value, (error: unknown) => {
      assert.ok(error instanceof StreamError);
      assert.equal((error as StreamError).code, "unknown");
      return true;
    });
  });

  it("throws a StreamFallbackError with the full trail when every route dies", async () => {
    const value = runwithfallback(
      CHAIN,
      async () => {
        throw errorfromresponse(new Response(null, { status: 529 }));
      },
      { initialDelayMs: 1, retriesPerRoute: 0 },
    );
    await assert.rejects(value, (error: unknown) => {
      assert.ok(error instanceof StreamError);
      const fallback = error as StreamError;
      assert.equal(fallback.code, "overloaded");
      assert.ok("trail" in fallback);
      assert.deepEqual((fallback as { trail: { routeId: string }[] }).trail.map((step) => step.routeId), ["primary", "backup"]);
      return true;
    });
  });
});

describe("streamfallback key wire", () => {
  it("lands failures on the key counters without mutating the input", () => {
    const row = keyrow();
    const after429 = applyerrortokey(row, 429);
    assert.equal(after429.errorCount, 1);
    assert.equal(after429.rateLimitHit, true);
    const after500 = applyerrortokey(row, 500);
    assert.equal(after500.errorCount, 1);
    assert.equal(after500.rateLimitHit, false);
    assert.equal(row.errorCount, 0, "the input row must stay untouched");
    const chain = applyerrortokey(after429, 500);
    assert.equal(chain.errorCount, 2);
    assert.equal(chain.rateLimitHit, true, "a prior 429 flag survives other failures");
  });
});
