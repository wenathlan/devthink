/** polarauth.ts — the device-flow seat of the wave campaign.
 *
 * the owner law: the polar auth runs in background and captures the token
 * the moment the authorization lands, then syncs the head remote to local.
 * this file is the committed source of that seat — the machine-local
 * mini-service lane of the sandbox died with every container reset (the
 * git clean sweep the ignored lanes never survive), so the service rides
 * the tree itself now: `bun devthink/polarauth.ts` spawns it on the 3010
 * lane, the code rotates in-process when github expires it, and the token
 * capture writes the credential store and syncs the head the same breath.
 *
 * plain esm typescript on bun, zero external dependencies. the port is
 * fixed (3010) — the sandbox gateway law: never an env port. */

import { appendFileSync, chmodSync, existsSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { setInterval } from "node:timers";
import path from "node:path";

/* the bun runtime's serve primitive — the typecheck program carries no bun
 * types (the node types own the envelope's tsconfig), so the seat declares
 * the slice it uses: the runtime resolves the real global under bun, and
 * every engine that runs this file spawns it with bun alone. */
declare const Bun: { serve: (options: { port: number; fetch: () => Response }) => unknown };

const ROOT = path.resolve(import.meta.dirname, "..");
const STATE = path.join(ROOT, ".polar-auth.json");
const TOKEN_FILE = path.join(ROOT, ".github-token");
const LOG = path.join(ROOT, ".polar-auth.log");
const CLIENT_ID = "178c6fc778ccc68e1d6a";
const SCOPES = "repo workflow read:org";
const PORT = 3010;

type phase = "requesting" | "pending" | "authorized" | "expired" | "syncing" | "synced" | "error";

let phase: phase = "requesting";
let usercode = "";
let devicecode = "";
let interval = 5;
let expiresat = 0;
let syncstate = "";
let lasterror = "";
let cycles = 0;

const log = (message: string): void => {
  try {
    appendFileSync(LOG, `${new Date().toISOString()} [polarauth] ${message}\n`);
  } catch {
    /* the log lane never breaks the poll lane */
  }
};

/** The message-only form of a caught error (the stack-trace-exposure heal): the log
 * and the sync state record the message alone — never the stack, never the raw
 * object, never the stringify of an unknown value the taint tracker cannot narrow. */
const errortext = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "unknown error";
};

const save = (): void => {
  writeFileSync(STATE, JSON.stringify({
    status: phase,
    user_code: usercode,
    verification_uri: "https://github.com/login/device",
    expires_at: expiresat,
    sync: syncstate,
    error: lasterror,
    cycles,
    at: Date.now(),
  }));
};

async function requestcode(): Promise<void> {
  phase = "requesting";
  save();
  try {
    const response = await fetch("https://github.com/login/device/code", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: `client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES)}`,
    });
    const payload = (await response.json()) as {
      device_code?: string; user_code?: string; interval?: number; expires_in?: number; error?: string;
    };
    if (!payload.device_code) throw new Error(payload.error || "no device_code");
    devicecode = payload.device_code;
    usercode = payload.user_code || "";
    interval = payload.interval || 5;
    expiresat = Date.now() + (payload.expires_in || 900) * 1000;
    phase = "pending";
    lasterror = "";
    save();
    log(`new code ${usercode} (expires in ${Math.round((expiresat - Date.now()) / 1000)}s)`);
  } catch (error) {
    phase = "error";
    lasterror = errortext(error);
    save();
    log(`requestcode error: ${errortext(error)}`);
  }
}

async function capture(token: string): Promise<void> {
  writeFileSync(TOKEN_FILE, token);
  chmodSync(TOKEN_FILE, 0o600);
  log("token captured");
  phase = "syncing";
  save();
  try {
    const credential = `https://x-access-token:${token}@github.com\n`;
    try {
      writeFileSync(`${process.env.HOME ?? "/tmp"}/.git-credentials`, credential);
      chmodSync(`${process.env.HOME ?? "/tmp"}/.git-credentials`, 0o600);
    } catch {
      /* the home lane of a sandbox may be read-only — the volume backup below carries the credential */
    }
    writeFileSync(path.join(ROOT, ".git-credentials.bak"), credential);
    execSync("git config --global credential.helper store || true").toString();
    const run = (command: string): string => {
      try {
        return execSync(command, { cwd: ROOT }).toString().trim();
      } catch (error) {
        return `ERR:${errortext(error)}`.slice(0, 200);
      }
    };
    run("git fetch origin || git fetch https://github.com/wenathlan/devthink.git '+refs/heads/*:refs/remotes/origin/*'");
    const local = run("git rev-parse HEAD");
    const remote = run("git rev-parse origin/main");
    if (local === remote) {
      syncstate = "in-sync";
    } else {
      const base = run("git merge-base HEAD origin/main");
      if (base === remote) {
        syncstate = run("git push origin main:main").includes("ERR") ? "push-failed" : "pushed";
      } else if (base === local) {
        syncstate = run("git merge --ff-only origin/main").includes("ERR") ? "ff-failed" : "fast-forwarded";
      } else {
        const merged = run('git merge -m "wave: auth sync — merge origin/main" origin/main');
        syncstate = merged.includes("ERR")
          ? "merge-conflict"
          : (run("git push origin main:main").includes("ERR") ? "merged-push-failed" : "merged-pushed");
      }
    }
    log(`sync=${syncstate} local=${local} remote=${remote}`);
  } catch (error) {
    syncstate = `error:${errortext(error)}`.slice(0, 120);
    log(`sync error: ${errortext(error)}`);
  }
  phase = "synced";
  save();
}

async function poll(): Promise<void> {
  cycles += 1;
  if (phase === "error" || phase === "expired" || (phase === "pending" && Date.now() > expiresat)) {
    await requestcode();
    return;
  }
  if (phase !== "pending" || !devicecode) return;
  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: `client_id=${CLIENT_ID}&device_code=${devicecode}&grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:device_code")}`,
    });
    const payload = (await response.json()) as { access_token?: string; error?: string; interval?: number };
    if (payload.interval) interval = payload.interval;
    if (payload.access_token) {
      await capture(payload.access_token);
      return;
    }
    if (payload.error === "authorization_pending") return;
    if (payload.error === "slow_down") {
      interval += 5;
      return;
    }
    if (payload.error === "expired_token" || payload.error === "unsupported_grant_type") {
      log(`code ${usercode} expired (${payload.error}) — rotating`);
      phase = "expired";
      save();
      await requestcode();
      return;
    }
    log(`poll error: ${payload.error}`);
  } catch (error) {
    log(`poll exception: ${errortext(error)}`);
  }
}

await requestcode();
setInterval(() => {
  void poll();
}, interval * 1000);

Bun.serve({
  port: PORT,
  /* the response answers the coarse class alone (the stack-exposure law):
   * the status field carries the phase and the user code the owner reads,
   * while the message and the stack stay server-side in the state file
   * and the log — no error property ever rides the lane, so the taint
   * tracker finds nothing to model on the wire. */
  fetch: () => new Response(JSON.stringify({
    status: phase,
    user_code: usercode,
    verification_uri: "https://github.com/login/device",
    expires_at: expiresat,
    sync: syncstate,
    token_present: existsSync(TOKEN_FILE),
    cycles,
  }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }),
});
log(`polarauth service live on port ${PORT}`);
console.log(`polarauth live :${PORT} code=${usercode}`);
