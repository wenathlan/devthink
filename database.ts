/**
 * database — prisma database client and persistence logic
 * one file one responsibility — only db logic lives here
 * uses prisma 7 with libsql adapter for serverless vercel netlify compat
 * local dev uses gateway own sqlite at prisma/devthink.db
 * production uses remote url from DATABASE_URL when it is libsql or http
 * the client is LAZY: @prisma/client loads on the first database touch,
 * never at import time (a fresh consumer can import the library and run
 * the cli init before the generated client exists)
 */

import { PrismaLibSql } from "@prisma/adapter-libsql";
import type { PrismaClient } from "@prisma/client";

const globalforprisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** resolve db url — the gateway's own variable always wins, the host's
 * DATABASE_URL only carries remote deployment urls
 *
 *   DEVTHINK_DATABASE_URL — the gateway's own override: any url flavor
 *     including file: (the documented local development flow)
 *   DATABASE_URL — the deployment convention (vercel netlify): remote
 *     libsql http https postgres urls pass through; a LOCAL file url from
 *     the host is the host's database, never the gateway's — the gateway
 *     keeps its own sqlite instead of adopting a foreign local file
 *   default — the local sqlite at prisma/devthink.db
 *
 * the old resolver dropped DEVTHINK_DATABASE_URL whenever it carried a
 * file: url (only remote prefixes passed through), so every documented
 * local override silently connected to the fallback path instead */
function resolvedburl(): { url: string; isremote: boolean } {
  const own = process.env.DEVTHINK_DATABASE_URL || "";
  const isremote = (u: string) =>
    u.startsWith("libsql:") || u.startsWith("http:") || u.startsWith("https:") || u.startsWith("postgres:");
  if (own) {
    return { url: own, isremote: isremote(own) };
  }
  const host = process.env.DATABASE_URL || "";
  if (isremote(host)) {
    return { url: host, isremote: true };
  }
  /** remote url for production vercel netlify — local file for dev */
  return { url: "file:./prisma/devthink.db", isremote: false };
}

/** ensuredb — resolves the prisma client lazily: @prisma/client loads
 * through a dynamic import on the FIRST database touch, never at module
 * import time. a fresh consumer (npx @wenathlan/devthink gateway init) can load and
 * run the whole library and cli before the generated client exists — the
 * eager singleton used to crash the import itself. */
async function ensuredb(): Promise<PrismaClient> {
  if (globalforprisma.prisma) return globalforprisma.prisma;
  const { url, isremote } = resolvedburl();
  /** PrismaLibSql takes config not a pre-created client */
  const config = isremote
    ? { url, ...(process.env.DATABASE_AUTH_TOKEN ? { authToken: process.env.DATABASE_AUTH_TOKEN } : {}) }
    : { url };
  const adapter = new PrismaLibSql(config);
  // cjs interop: a commonjs @prisma/client resolution exposes the class on
  // the default export (the module namespace may not carry the named
  // binding) — accept both spellings
  const mod = (await import("@prisma/client")) as {
    PrismaClient?: new (opts: { adapter: PrismaLibSql }) => PrismaClient;
    default?: { PrismaClient: new (opts: { adapter: PrismaLibSql }) => PrismaClient };
  };
  const prismaclient = mod.PrismaClient ?? mod.default?.PrismaClient;
  if (!prismaclient) {
    throw new Error("@prisma/client resolved without the PrismaClient class — run npx prisma generate");
  }
  const client = new prismaclient({ adapter });
  globalforprisma.prisma = client;
  return client;
}

/** makedbproxy — the lazy db surface: every property chain (model, client
 * method, $transaction) resolves through ensuredb before the call runs, so
 * importing this module never touches @prisma/client and the module graph
 * of the library stays prisma-free until persistence is actually used */
function makedbproxy(path: string[]): unknown {
  const call = async (...args: unknown[]) => {
    let cursor: unknown = await ensuredb();
    for (const segment of path) {
      cursor = (cursor as Record<string, unknown>)[segment];
    }
    return (cursor as (...callargs: unknown[]) => unknown)(...args);
  };
  return new Proxy(call, {
    get(_target, prop, receiver) {
      if (typeof prop === "symbol") return Reflect.get(_target, prop, receiver);
      if (prop === "then") return undefined;
      return makedbproxy([...path, String(prop)]);
    },
  });
}

/** db — the shared prisma client singleton, lazy (the proxy instantiates
 * the client — and loads @prisma/client — on the first database touch) */
export const db = makedbproxy([]) as PrismaClient;

/** savemsg — persist a chat message to the db never throws */
export async function savemsg(data: Record<string, unknown>): Promise<void> {
  try {
    await db.chatMessage.create({ data });
  } catch {
    // never throw on db errors
  }
}

/** getsession — retrieve or create a session by id */
export async function getsession(sessionid: string): Promise<{ sessionid: string; messagecount: number } | null> {
  try {
    const count = await db.chatMessage.count({ where: { sessionid } });
    return { sessionid, messagecount: count };
  } catch {
    return null;
  }
}

/** getmessagessince — get messages for a session for context management */
export async function getsessionmessages(sessionid: string, limit = 100): Promise<unknown[]> {
  try {
    const messages = await db.chatMessage.findMany({
      where: { sessionid, status: "completed" },
      orderBy: { createdat: "asc" },
      take: limit,
    });
    return messages;
  } catch {
    return [];
  }
}
