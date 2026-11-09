/** wavelaunch.ts — the resurrection lane of the wave campaign.
 *
 * the container resets of the sandbox sweep every ignored lane (the git
 * clean the machine-local files never survive: node_modules, the
 * mini-services home, the polar state), so the wave answer is this
 * committed launcher: `bun devthink/wavelaunch.ts` revives every lane in
 * the certified order — the polar auth seat first (the owner needs the
 * device code the moment a wave opens), the envelope dependencies second,
 * the node gateway third (the @hono/node-server adapter is native node —
 * the local bun below the family floor panics on napi), and the os face
 * vite last, with the devthink cwd the config law demands (a wrong cwd
 * serves without config and the preview root answers 404).
 *
 * idempotent: every lane only rises when its port is dead. plain esm
 * typescript, zero external dependencies, node:child_process detached
 * spawns the setsid law the sandbox carries. */

import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENVELOPE = path.join(ROOT, "devthink");

const log = (message: string): void => {
  console.log(`[wavelaunch ${new Date().toISOString().slice(11, 19)}] ${message}`);
};

const httpcode = async (url: string): Promise<number> => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return response.status;
  } catch {
    return 0;
  }
};

const detachedspawn = (command: string, args: string[], cwd: string, logfile: string): void => {
  const child = spawn(command, args, {
    cwd,
    detached: true,
    stdio: ["ignore", "ignore", "ignore"],
    env: process.env,
  });
  child.unref();
  void logfile;
};

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

async function main(): Promise<void> {
  /* lane one — the polar auth seat (the 3010 lane, the committed source) */
  if ((await httpcode("http://localhost:3010/")) === 0) {
    detachedspawn("bun", [path.join(ENVELOPE, "polarauth.ts")], ROOT, ".polar-auth.log");
    await sleep(4000);
    const state = await fetch("http://localhost:3010/", { signal: AbortSignal.timeout(3000) }).then((r) => r.text()).catch(() => "");
    log(`polar auth: ${state.slice(0, 140)}`);
  } else {
    log("polar auth: already live");
  }

  /* lane two — the envelope dependencies (devthink carries the vite and
   * tsx binaries the next lanes ride; getry carries the gateway graph) */
  for (const app of ["devthink", "getry"]) {
    const marker = path.join(ROOT, app, "node_modules", ".bin");
    if (!existsSync(marker)) {
      log(`installing ${app} dependencies (the reset swept node_modules)…`);
      const result = spawnSync("bun", ["install"], { cwd: path.join(ROOT, app), encoding: "utf8", timeout: 240000 });
      log(`${app}: ${result.status === 0 ? "installed" : `install exit ${result.status}`}`);
    }
  }

  /* lane three — the gateway (node/tsx on 3001: the hono node adapter is
   * native node, the local bun below the family floor panics on napi) */
  if ((await httpcode("http://localhost:3001/v1/models")) === 0) {
    detachedspawn(path.join(ENVELOPE, "node_modules", ".bin", "tsx"), ["server.ts", "serve"], ENVELOPE, ".gateway.log");
    await sleep(6000);
    log(`gateway: ${await httpcode("http://localhost:3001/v1/models")}`);
  } else {
    log("gateway: already live");
  }

  /* lane four — the os face (vite on 3000 with the devthink cwd: the
   * config law — a wrong cwd serves without config and the root 404s) */
  if ((await httpcode("http://localhost:3000/")) !== 200) {
    detachedspawn(path.join(ENVELOPE, "node_modules", ".bin", "vite"), ["--port", "3000", "--host", "0.0.0.0"], ENVELOPE, "dev.log");
    await sleep(9000);
  } else {
    log("os face: already live");
  }

  const os = await httpcode("http://localhost:3000/");
  const gateway = await httpcode("http://localhost:3001/v1/models");
  const auth = await fetch("http://localhost:3010/", { signal: AbortSignal.timeout(3000) }).then((r) => r.text()).catch(() => "{}");
  const code = /"user_code":"([^"]+)"/.exec(auth)?.[1] ?? "?";
  log(`final state: os=${os} gateway=${gateway} auth=${code}`);
}

await main();
