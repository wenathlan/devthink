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

import { appendFileSync, chmodSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
 * lane records the message alone — never the stack, never the raw object, never the
 * stringify of an unknown value the taint tracker cannot narrow — while the response
 * surface carries fixed error codes only, nothing derived from the caught value. */
const errortext = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "unknown error";
};

const save = (): void => {
  writeFileSync(
    STATE,
    JSON.stringify({
      status: phase,
      user_code: usercode,
      device_code: devicecode,
      interval,
      verification_uri: "https://github.com/login/device",
      expires_at: expiresat,
      sync: syncstate,
      error: lasterror,
      cycles,
      at: Date.now(),
    }),
  );
};

/* the sandbox reaper: every background lane of this machine dies between
 * tool calls (the container resets sweep the whole user process tree), so a
 * relaunched seat must ADOPT the still-fresh pending code the previous
 * instance saved instead of churning a new one the owner never sees in
 * time. a fresh request only rides when no adoptable code remains. */
const adopt = (): boolean => {
  try {
    const saved = JSON.parse(readFileSync(STATE, "utf8")) as {
      status?: string;
      user_code?: string;
      device_code?: string;
      interval?: number;
      expires_at?: number;
    };
    if (
      saved.status === "pending" &&
      saved.user_code &&
      saved.device_code &&
      (saved.expires_at ?? 0) > Date.now() + 30_000
    ) {
      usercode = saved.user_code;
      devicecode = saved.device_code;
      interval = saved.interval ?? 5;
      expiresat = saved.expires_at ?? 0;
      phase = "pending";
      save();
      log(`adopted pending code ${usercode} (expires in ${Math.round((expiresat - Date.now()) / 1000)}s)`);
      return true;
    }
  } catch {
    /* no state or unreadable state — the fresh request below answers */
  }
  return false;
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
      device_code?: string;
      user_code?: string;
      interval?: number;
      expires_in?: number;
      error?: string;
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
    lasterror = "requestcode-failed";
    save();
    log(`requestcode error: ${errortext(error)}`);
  }
}

/** The head-sync walk the capture doctrine charges (the credential store
 * seats the token across the git surfaces, then the local head and the
 * remote head answer one another — fast-forward, push or merge, never
 * forced). shared by the fresh capture and the rule-45 arrival: an already
 * authorized seat syncs the head the same breath it adopts the synced phase. */
const synchead = (token: string): void => {
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
        log(`run error: ${errortext(error)}`);
        return "ERR:git-command-failed";
      }
    };
    run(
      "git fetch origin || git fetch https://github.com/wenathlan/devthink.git '+refs/heads/*:refs/remotes/origin/*'",
    );
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
          : run("git push origin main:main").includes("ERR")
            ? "merged-push-failed"
            : "merged-pushed";
      }
    }
    log(`sync=${syncstate} local=${local} remote=${remote}`);
  } catch (error) {
    syncstate = "error:sync-failed";
    log(`sync error: ${errortext(error)}`);
  }
};

/** Rule 45 — once the authorization answers, the lane never polls again: a
 * live token on arrival adopts the synced phase directly (the head sync
 * walks in place of the poll), and only a dead credential clears the store
 * and mints a fresh code the owner can authorize in real time. returns the
 * live token or null; never throws (the network lane never breaks the seat). */
const tokenlive = async (): Promise<string | null> => {
  try {
    const token = readFileSync(TOKEN_FILE, "utf8").trim();
    if (!token) return null;
    const response = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${token}`, "User-Agent": "polarauth" },
    });
    return response.ok ? token : null;
  } catch {
    return null;
  }
};

/** The synced-phase walk both arrival paths share: the seat answers synced
 * with the head sync seated whole, never minting a code the owner already
 * answered (the seven-times-ordered law: real-time capture, never re-poll). */
const arrivesynced = async (token: string, why: string): Promise<void> => {
  phase = "syncing";
  save();
  synchead(token);
  phase = "synced";
  save();
  log(why);
};

async function capture(token: string): Promise<void> {
  writeFileSync(TOKEN_FILE, token);
  chmodSync(TOKEN_FILE, 0o600);
  log("token captured");
  await arrivesynced(token, "capture seated — token stored and head synced");
}

async function poll(): Promise<void> {
  cycles += 1;
  if (phase === "pending" && existsSync(TOKEN_FILE)) {
    /* rule 45: the token landed from outside this poll (the polar.sh seat,
     * the owner's own sync, a sibling lane's capture) — the poll stops and
     * the head sync walks instead; a dead file clears the store the same
     * law the door applies, so the guard never re-validates a corpse */
    const landed = await tokenlive();
    if (landed) {
      await arrivesynced(landed, "token landed outside the poll — synced, never re-polled (rule 45)");
      return;
    }
    rmSync(TOKEN_FILE);
    log("dead token cleared mid-poll — the fresh code keeps the capture lane open");
  }
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

/* rule 45 at the door: a live token on arrival answers synced whole (the
 * head sync walks in place of any poll — the owner already authorized, the
 * seat never mints a code again); a dead credential clears the store and
 * the real-time capture lane opens for the owner's fresh authorization. */
const opentoken = await tokenlive();
if (opentoken) {
  await arrivesynced(opentoken, "token present and live on arrival — the lane answers synced (rule 45)");
} else {
  if (existsSync(TOKEN_FILE)) {
    rmSync(TOKEN_FILE);
    log("dead token cleared — minting a fresh code for the real-time capture");
  }
  if (!adopt()) await requestcode();
}
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
  fetch: () =>
    new Response(
      JSON.stringify({
        status: phase,
        user_code: usercode,
        verification_uri: "https://github.com/login/device",
        expires_at: expiresat,
        sync: syncstate,
        token_present: existsSync(TOKEN_FILE),
        cycles,
      }),
      { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
    ),
});
log(`polarauth service live on port ${PORT}`);
console.log(`polarauth live :${PORT} code=${usercode}`);
