/** auto-clone: the detached watcher that waits for the stored device-flow
 * token and then clones the private iakadion/allan repository straight at
 * the workspace root (full history, blobs local for analysis). The token
 * never touches the logs and is stripped from the git remote afterwards. */

import { appendFileSync } from "node:fs";
import { Database } from "bun:sqlite";

const DB = "/home/z/my-project/mini-services/github-auth/data/auth.db";
const LOG = "/home/z/my-project/temp/auto-clone.log";
const DEST = "/home/z/my-project/allan";
const INSTALL_DONE = "/home/z/my-project/temp/install.done";

function log(line: string) {
  const t = new Date().toISOString();
  try {
    appendFileSync(LOG, `${t} ${line}\n`);
  } catch {}
  console.log(`[auto-clone] ${line}`);
}

function freeMB(): number {
  try {
    const out = Bun.spawnSync(["df", "--output=avail", "-B", "1048576", "/home/z/my-project"]).stdout.toString();
    return parseInt(out.split("\n")[1]?.trim() ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

async function exists(p: string): Promise<boolean> {
  try {
    return await Bun.file(p).exists();
  } catch {
    return false;
  }
}

log("watcher up — waiting for install.done + token (poll 10s, max 50min)");

const db = new Database(DB, { readonly: true });
let installSeen = false;

for (let i = 0; i < 300; i++) {
  await Bun.sleep(10_000);

  if (!installSeen) {
    if (await exists(INSTALL_DONE)) {
      installSeen = true;
      log("devthink install finished — space gate open");
    } else {
      continue;
    }
  }

  let row: { token: string; login: string } | null = null;
  try {
    row = db.query("SELECT token, login FROM token WHERE id = 1").get() as { token: string; login: string } | null;
  } catch {
    continue;
  }
  if (!row?.token) continue;

  log(`token detected for ${row.login} — checking disk and cloning iakadion/allan (full history)`);

  if (await exists(`${DEST}/.git/config`)) {
    log("allan already cloned — nothing to do");
    process.exit(0);
  }

  let avail = freeMB();
  if (avail < 7300) {
    Bun.spawnSync(["rm", "-rf", "/home/z/.bun/install/cache"]);
    log(`low disk (${avail}MB) — freed the bun install cache`);
    avail = freeMB();
    if (avail < 6900) {
      log(`still low on disk (${avail}MB) — aborting clone for manual review`);
      process.exit(1);
    }
  }

  const url = `https://x-access-token:${row.token}@github.com/iakadion/allan.git`;
  const proc = Bun.spawn(["git", "clone", "--progress", url, DEST], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stderr = await new Response(proc.stderr).text();
  const code = await proc.exited;

  if (code === 0) {
    await Bun.spawn(["git", "-C", DEST, "remote", "set-url", "origin", "https://github.com/iakadion/allan.git"]).exited;
    const size = Bun.spawnSync(["du", "-sh", DEST]).stdout.toString().trim();
    const free = freeMB();
    log(`clone OK — ${size} — token stripped — ${free}MB still free`);
    process.exit(0);
  }

  log(`clone FAILED (exit ${code}): ${stderr.slice(-600)}`);
  process.exit(1);
}

log("timeout — no token within 50 minutes");
