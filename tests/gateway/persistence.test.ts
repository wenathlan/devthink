/**
 * persistence — real writes and reads against a pushed sqlite database
 * the engine's persist() used to pass startedat as epoch millis into a
 * DateTime column — validation failed inside the silent catch so every
 * engine write no-oped (zero rows for every request; caught by the real
 * consumer run). this suite pushes a fresh database and proves the full
 * engine write path plus the session-history read path the rotation and
 * context features depend on
 */

import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const exec = promisify(execFile);

const persistdir = mkdtempSync(join(tmpdir(), "gateway-persist-"));
process.env.GATEWAY_DATABASE_URL = `file:${join(persistdir, "test.db")}`;

beforeAll(async () => {
  // the prisma client the lazy database proxy resolves: the generated engine
  // rides the repository devdependency tree, so the suite generates it the
  // same command the repo scripts and the consumer init flow run (idempotent
  // when the client is already present) — a fresh checkout or ci lane that
  // skipped db:generate still lands the client before the first write
  await exec("bunx", ["prisma", "generate"], {
    cwd: join(import.meta.dirname, "..", ".."),
    timeout: 120000,
  });
  // push the repo schema into the isolated database (the same command the
  // consumer runs after init — verifies the schema loads under prisma 7)
  await exec("bunx", ["prisma", "db", "push"], {
    cwd: join(import.meta.dirname, "..", ".."),
    env: { ...process.env, GATEWAY_DATABASE_URL: process.env.GATEWAY_DATABASE_URL },
    timeout: 120000,
  });
  if (!existsSync(join(persistdir, "test.db"))) throw new Error("db push produced no database");
}, 150000);

afterAll(() => {
  rmSync(persistdir, { recursive: true, force: true });
});

// imported after the env is pinned — the lazy client reads the url on the
// first database touch, so every call below resolves the pushed database
const { getsession, getsessionmessages, savemsg } = await import("../../database.js");
const { createversion } = await import("../../engine.js");

/** the persisted shape after the engine's persist() coercion — startedat
 * is a Date (the schema column), everything else lowercase per the schema */
function persistedrow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    sessionid: "sess-persist",
    requestid: "req-persist",
    route: "chat/completions",
    provider: "mock",
    version: "vt",
    endpoint: "mock",
    model: "meta",
    modelvariant: "m1",
    status: "completed",
    stream: false,
    startedat: new Date(),
    rotationindex: -1,
    messagenumber: 1,
    contextshared: false,
    content: "persisted reply",
    reasoningcontent: "persisted reasoning",
    prompttokens: 4,
    completiontokens: 6,
    totaltokens: 10,
    ...overrides,
  };
}

describe("savemsg — the write path", () => {
  it("the full engine field shape persists for real", async () => {
    await savemsg(persistedrow());
    const rows = await getsessionmessages("sess-persist");
    expect(rows.length).toBeGreaterThanOrEqual(1);
    const row = rows[0] as Record<string, unknown>;
    expect(row["content"]).toBe("persisted reply");
    expect(row["reasoningcontent"]).toBe("persisted reasoning");
    expect(row["model"]).toBe("meta");
    expect(row["provider"]).toBe("mock");
    expect(row["rotationindex"]).toBe(-1);
    expect(row["startedat"]).toBeInstanceOf(Date);
  });

  it("writes never throw on unknown extra fields", async () => {
    await savemsg(persistedrow({ content: "second row", twocalls: true, thinkingbudget: 68000 }));
    const rows = await getsessionmessages("sess-persist");
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// the engine end to end — the exact regression: handlechatcompletions must
// persist through persist()'s startedat coercion, not silently no-op
// ---------------------------------------------------------------------------

describe("engine persistence — handlechatcompletions writes real rows", () => {
  let mockport = 0;
  let hits = 0;

  beforeAll(async () => {
    const server = http.createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on("data", (c: Buffer) => chunks.push(c));
      req.on("end", () => {
        hits += 1;
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            id: "up-1",
            object: "chat.completion",
            model: "upstream",
            choices: [
              {
                index: 0,
                message: { role: "assistant", content: "engine reply" },
                finish_reason: "stop",
              },
            ],
            usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
          }),
        );
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    mockport = (server.address() as AddressInfo).port;
    afterAll(() => server.close());
  });

  it("a completed request lands in the database with every field", async () => {
    const handlers = createversion({
      id: "vt",
      providername: "mock",
      upstreams: [{ name: "mock", baseurl: `http://127.0.0.1:${mockport}` }],
      auth: { mode: "bearer", required: false },
      models: [{ id: "m1", context: 8192, maxoutput: 1024 }],
      defaultmodel: "m1",
      metamodel: { id: "meta", maxoutput: 512, maskupstreammodel: true, alwaysdisplay: true },
    });
    const res = await handlers.handlechatcompletions(
      new Request("http://x/api/vt/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", "x-session-id": "sess-engine" },
        body: JSON.stringify({ model: "m1", messages: [{ role: "user", content: "persist me" }] }),
      }),
    );
    expect(res.status).toBe(200);
    expect(hits).toBe(1);

    const rows = (await getsessionmessages("sess-engine")) as Array<Record<string, unknown>>;
    expect(rows.length).toBe(1);
    const row = rows[0];
    expect(row["content"]).toBe("engine reply");
    expect(row["model"]).toBe("meta");
    expect(row["provider"]).toBe("mock");
    expect(row["version"]).toBe("vt");
    expect(row["sessionid"]).toBe("sess-engine");
    expect(row["startedat"]).toBeInstanceOf(Date);
    expect(Number(row["totaltokens"])).toBe(5);
  });
});

describe("getsession — session counting", () => {
  it("counts the messages of a session", async () => {
    const session = await getsession("sess-persist");
    expect(session).not.toBeNull();
    expect((session as { messagecount: number }).messagecount).toBeGreaterThanOrEqual(2);
  });

  it("unknown sessions report zero", async () => {
    const session = await getsession("never-written");
    expect((session as { messagecount: number }).messagecount).toBe(0);
  });
});

describe("getsessionmessages — the history restore path", () => {
  it("filters by status completed", async () => {
    await savemsg(persistedrow({ sessionid: "sess-status", status: "error", content: "err" }));
    await savemsg(persistedrow({ sessionid: "sess-status", content: "ok" }));
    const rows = (await getsessionmessages("sess-status")) as Array<Record<string, unknown>>;
    expect(rows.length).toBe(1);
    expect(rows[0]["content"]).toBe("ok");
  });

  it("returns ordered oldest first", async () => {
    await savemsg(persistedrow({ sessionid: "sess-order", content: "first" }));
    await new Promise((r) => setTimeout(r, 20));
    await savemsg(persistedrow({ sessionid: "sess-order", content: "second" }));
    const rows = (await getsessionmessages("sess-order")) as Array<Record<string, unknown>>;
    expect(rows.map((r) => r["content"])).toEqual(["first", "second"]);
  });

  it("honors the limit", async () => {
    for (let i = 0; i < 8; i += 1) {
      await savemsg(persistedrow({ sessionid: "sess-limit", content: `m${i}` }));
    }
    const rows = await getsessionmessages("sess-limit", 3);
    expect(rows.length).toBe(3);
  });
});
