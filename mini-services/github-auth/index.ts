/**
 * github-auth — the DevThink GitHub Device Flow service (RFC 8628).
 *
 * The server-side port of the shell family (authentication.sh, poll-auth.sh,
 * pullouts.sh, auth-watchdog.sh): the device_code never leaves this process,
 * the poller runs here on the documented interval, slow_down raises it by
 * five, an expired code renews itself without asking again, and a stored
 * token answers AUTHORIZED on every entry so the user is never
 * re-questioned after authorizing once.
 *
 * Storage: bun:sqlite at ./data/auth.db (the service's own DB — token,
 * sessions and status; nothing lives in components).
 */

import { Database } from "bun:sqlite";

const PORT = 3030;
const CLIENT_ID = "178c6fc778ccc68e1d6a";
const SCOPE = "repo read:org";
const CODE_ENDPOINT = "https://github.com/login/device/code";
const TOKEN_ENDPOINT = "https://github.com/login/oauth/access_token";
const USER_ENDPOINT = "https://api.github.com/user";

type SessionRow = {
  sid: string;
  device_code: string;
  user_code: string;
  verification_uri: string;
  interval: number;
  expires_at: number;
  status: string; // pending | authorized | failed
  reason: string | null;
  created_at: number;
};

type TokenRow = {
  id: number;
  token: string;
  login: string;
  name: string | null;
  avatar_url: string | null;
  created_at: number;
};

const db = new Database("data/auth.db", { create: true });
db.exec("PRAGMA journal_mode = WAL;");
db.exec(`
CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  device_code TEXT NOT NULL,
  user_code TEXT NOT NULL,
  verification_uri TEXT NOT NULL,
  interval INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  status TEXT NOT NULL,
  reason TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS token (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  token TEXT NOT NULL,
  login TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at INTEGER NOT NULL
);
`);

const sessions = db.query<SessionRow, string>("SELECT * FROM sessions WHERE sid = ?");
const sessionUpdate = db.query(
  "UPDATE sessions SET status = ?, reason = ?, interval = ?, user_code = ?, device_code = ?, verification_uri = ?, expires_at = ? WHERE sid = ?",
);
const sessionInsert = db.query(
  "INSERT OR REPLACE INTO sessions (sid, device_code, user_code, verification_uri, interval, expires_at, status, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
);
const sessionDelete = db.query("DELETE FROM sessions WHERE sid = ?");
const tokenGet = db.query<TokenRow, []>("SELECT * FROM token WHERE id = 1");
const tokenSet = db.query(
  "INSERT OR REPLACE INTO token (id, token, login, name, avatar_url, created_at) VALUES (1, ?, ?, ?, ?, ?)",
);
const tokenDelete = db.query("DELETE FROM token WHERE id = 1");

/** The live poller handles: one per pending session. */
const pollers = new Map<string, ReturnType<typeof setInterval>>();

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "cache-control": "no-store",
    },
  });

const publicUser = (row: TokenRow) => ({
  login: row.login,
  name: row.name,
  avatarUrl: row.avatar_url,
});

/** One poll round against the token endpoint; mirrors the shell contract. */
async function pollOnce(row: SessionRow): Promise<SessionRow> {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    device_code: row.device_code,
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
  });
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
      "user-agent": "devthink-auth",
    },
    body,
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, string>;

  if (payload.access_token) {
    // Validate exactly like the shell family: /user with the token answers 200.
    const check = await fetch(USER_ENDPOINT, {
      headers: { authorization: `token ${payload.access_token}`, "user-agent": "devthink-auth" },
    });
    if (check.status === 200) {
      const user = (await check.json().catch(() => ({}))) as Record<string, string>;
      tokenSet.run(
        payload.access_token,
        user.login ?? "devthink",
        user.name ?? null,
        user.avatar_url ?? null,
        Date.now(),
      );
      sessionUpdate.run("authorized", null, row.interval, row.user_code, row.device_code, row.verification_uri, row.expires_at, row.sid);
      stopPoller(row.sid);
      return { ...row, status: "authorized", reason: null };
    }
    sessionUpdate.run("failed", "validation", row.interval, row.user_code, row.device_code, row.verification_uri, row.expires_at, row.sid);
    stopPoller(row.sid);
    return { ...row, status: "failed", reason: "validation" };
  }

  if (payload.error === "authorization_pending") return row;

  if (payload.error === "slow_down") {
    const next = row.interval + 5;
    sessionUpdate.run(row.status, row.reason, next, row.user_code, row.device_code, row.verification_uri, row.expires_at, row.sid);
    restartPoller({ ...row, interval: next });
    return { ...row, interval: next };
  }

  if (payload.error === "expired_token") {
    // The renewal rule: a fresh code is issued without asking the user again.
    return await renewSession(row);
  }

  if (payload.error === "access_denied") {
    sessionUpdate.run("failed", "denied", row.interval, row.user_code, row.device_code, row.verification_uri, row.expires_at, row.sid);
    stopPoller(row.sid);
    return { ...row, status: "failed", reason: "denied" };
  }

  return row;
}

/** Auto renewal — the expiring user_code is replaced in place, same sid. */
async function renewSession(row: SessionRow): Promise<SessionRow> {
  const fresh = await requestDeviceCode();
  if (!fresh) {
    sessionUpdate.run("failed", "network", row.interval, row.user_code, row.device_code, row.verification_uri, row.expires_at, row.sid);
    stopPoller(row.sid);
    return { ...row, status: "failed", reason: "network" };
  }
  sessionInsert.run(
    row.sid, fresh.device_code, fresh.user_code, fresh.verification_uri,
    fresh.interval, Date.now() + fresh.expires_in * 1000, "pending", null, row.created_at,
  );
  const next = sessions.get(row.sid)!;
  restartPoller(next);
  return next;
}

/** Backoff for the flaky network cuts the shell family guarded against. */
async function pollWithBackoff(row: SessionRow): Promise<SessionRow> {
  let delay = 1000;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await pollOnce(row);
    } catch {
      await Bun.sleep(delay);
      delay *= 2;
    }
  }
  return row;
}

function stopPoller(sid: string) {
  const timer = pollers.get(sid);
  if (timer) clearInterval(timer);
  pollers.delete(sid);
}

function restartPoller(row: SessionRow) {
  stopPoller(row.sid);
  pollers.set(
    row.sid,
    setInterval(() => {
      const current = sessions.get(row.sid);
      if (!current) return stopPoller(row.sid);
      if (current.status !== "pending") return stopPoller(row.sid);
      if (Date.now() >= current.expires_at) {
        void renewSession(current);
        return;
      }
      void pollWithBackoff(current).then((next) => {
        if (next.status === "authorized") broadcast(next);
      });
    }, row.interval * 1000),
  );
}

/** Fires a renewal so an external status reader sees the new code quickly. */
function broadcast(row: SessionRow) {
  console.log(`[auth] ${row.sid} → ${row.status}`);
}

async function requestDeviceCode(): Promise<{
  device_code: string;
  user_code: string;
  verification_uri: string;
  interval: number;
  expires_in: number;
} | null> {
  try {
    const response = await fetch(CODE_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accept: "application/json",
        "user-agent": "devthink-auth",
      },
      body: new URLSearchParams({ client_id: CLIENT_ID, scope: SCOPE }),
    });
    const payload = (await response.json()) as {
      device_code: string;
      user_code: string;
      verification_uri: string;
      interval: number;
      expires_in: number;
    };
    if (!payload.device_code || !payload.user_code) return null;
    return {
      device_code: payload.device_code,
      user_code: payload.user_code,
      verification_uri: payload.verification_uri || "https://github.com/login/device",
      interval: payload.interval || 5,
      expires_in: payload.expires_in || 900,
    };
  } catch {
    return null;
  }
}

const cors = (): Response =>
  new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });

Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);
    const route = `${request.method} ${url.pathname}`;

    if (request.method === "OPTIONS") return cors();

    // The guard: a stored, still-living token answers AUTHORIZED at once —
    // the user is never asked to authorize twice.
    const stored = tokenGet.get();
    if (stored && route !== "POST /api/auth/logout") {
      const alive = await fetch(USER_ENDPOINT, {
        headers: { authorization: `token ${stored.token}`, "user-agent": "devthink-auth" },
      }).then((r) => r.status === 200).catch(() => false);
      if (alive) {
        if (route === "POST /api/auth/device" || route === "GET /api/auth/status") {
          return json({ status: "AUTHORIZED", user: publicUser(stored) });
        }
      } else {
        tokenDelete.run();
      }
    }

    if (route === "POST /api/auth/device") {
      const fresh = await requestDeviceCode();
      if (!fresh) return json({ status: "FAILED", reason: "network" }, 502);
      const sid = crypto.randomUUID();
      sessionInsert.run(
        sid, fresh.device_code, fresh.user_code, fresh.verification_uri,
        fresh.interval, Date.now() + fresh.expires_in * 1000, "pending", null, Date.now(),
      );
      const row = sessions.get(sid)!;
      restartPoller(row);
      return json({
        status: "PENDING",
        sid,
        userCode: row.user_code,
        verificationUri: row.verification_uri,
        expiresIn: Math.floor((row.expires_at - Date.now()) / 1000),
        interval: row.interval,
      });
    }

    if (route === "GET /api/auth/status") {
      const sid = url.searchParams.get("sid") ?? "";
      const row = sessions.get(sid);
      if (!row) return json({ status: "FAILED", reason: "unknown-session" }, 404);
      const remaining = Math.max(0, Math.floor((row.expires_at - Date.now()) / 1000));
      if (row.status === "authorized") {
        const token = tokenGet.get();
        return json({
          status: "AUTHORIZED",
          user: token ? publicUser(token) : null,
          userCode: row.user_code,
          expiresInSeconds: remaining,
        });
      }
      if (row.status === "failed") {
        return json({ status: "FAILED", reason: row.reason ?? "unknown", userCode: row.user_code });
      }
      // A pending poll round right now keeps the state honest.
      const next = await pollWithBackoff(row);
      return json({
        status: next.status === "authorized" ? "AUTHORIZED" : next.status === "failed" ? "FAILED" : "PENDING",
        reason: next.reason ?? null,
        userCode: next.user_code,
        verificationUri: next.verification_uri,
        expiresInSeconds: Math.max(0, Math.floor((next.expires_at - Date.now()) / 1000)),
      });
    }

    if (route === "GET /api/auth/user") {
      const token = tokenGet.get();
      if (!token) return json({ status: "SIGNED_OUT" }, 401);
      return json({ status: "AUTHORIZED", user: publicUser(token) });
    }

    if (route === "POST /api/auth/logout") {
      for (const sid of [...pollers.keys()]) stopPoller(sid);
      db.exec("DELETE FROM sessions;");
      tokenDelete.run();
      return json({ status: "SIGNED_OUT" });
    }

    // The private clone bridge: reads a private repo tree with the token.
    if (route === "GET /api/repos") {
      const token = tokenGet.get();
      if (!token) return json({ status: "SIGNED_OUT" }, 401);
      const page = url.searchParams.get("page") ?? "1";
      const list = await fetch(
        `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`,
        { headers: { authorization: `token ${token.token}`, "user-agent": "devthink-auth" } },
      ).then((r) => r.json()).catch(() => []);
      return json({ status: "AUTHORIZED", repos: list });
    }

    return json({ error: "not-found", route }, 404);
  },
});

console.log(`[github-auth] listening on :${PORT} — device flow ready (client ${CLIENT_ID})`);
